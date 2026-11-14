/* =====================================================================
   js/jeuPioche.js — La pioche remplacée, Dredge, Miracle

   `piocheN()` (js/jeuEtat.js) pioche sans rien demander : la main de
   départ, un coût qui fait piocher. `pioche()` est la pioche d'une partie
   en cours, carte par carte, avec ce qui peut la changer :
   - « if you would draw a card, … instead » porté par un permanent ou un
     effet (`R:Event$ Draw`), joué à la place ;
   - Dredge N : meuler N et reprendre la carte du cimetière au lieu de
     piocher ;
   - Miracle : la première carte piochée du tour se lance pour son coût de
     miracle. Forge en fait un déclencheur, révélé puis lancé à sa
     résolution ; ici elle se lance aussitôt — simplification annoncée, la
     même tant que personne ne répond au déclencheur.
   ===================================================================== */

const CHAINES_PIOCHE = new WeakMap();

/* La chaîne qui remplace une pioche, compilée une fois. Elle ne cible pas :
   rien ne la lance. */
function chainePioche(face, nom) {
  const m = CHAINES_PIOCHE.get(face) || new Map();
  CHAINES_PIOCHE.set(face, m);
  if (!m.has(nom)) {
    const w = forgeSousCapacite(face, nom), e = w && effetForge(face, w, {});
    m.set(nom, e && !e.cibles.length && !e.modes ? e : null);
  }
  return m.get(nom);
}

/* La forme d'un remplacement de pioche, lue par js/forgeRemplacements.js
   `formeRemplacement()`. La cause d'une pioche (`ValidCause`) n'est pas
   suivie : refusée. */
function formePioche(face, r) {
  if (r.Event !== 'Draw' || r.ValidCause || (r.ActivePhases && r.ActivePhases !== 'Draw') || r.FirstExtraCardDrawnThisTurn) return null;
  if (r.Prevent === 'True' && !r.ReplaceWith) return 'pioche';
  return r.ReplaceWith && chainePioche(face, r.ReplaceWith) ? 'pioche' : null;
}

/* Piocher N cartes, une à une, sous les remplacements. */
function* pioche(P, j, n) {
  const J = P.joueurs[j];
  for (let k = 0; k < n && !P.fin && !J.elimine; k++) {
    if (yield* piocheRemplacee(P, j)) continue;
    if (yield* dragage(P, j)) continue;
    const premiere = !J.piochesTour, haut = J.bibliotheque[J.bibliotheque.length - 1];
    piocheN(P, j, 1);
    if (premiere && haut != null && J.main.includes(haut)) yield* miracle(P, j, haut);
  }
}

/* Un remplacement de pioche qui vaut : joué à la place, et rend vrai. Un
   remplacement ne s'applique pas aux pioches qu'il fait lui-même (règle
   614.5) : deux Thought Reflection font piocher quatre, pas sans fin. */
function* piocheRemplacee(P, j) {
  const J = P.joueurs[j], enCours = P.piocheEnCours = P.piocheEnCours || [];
  for (const x of remplacementsEnJeu(P)) {
    if (x.r.forme !== 'pioche') continue;
    const {src: h, r} = x, t = r.t, env = envRemplacement(h, r), cle = h.id + '|' + (t.ReplaceWith || '');
    if (enCours.includes(cle) || (h.zone === 'effet' && !P.effets.includes(h))) continue;
    if (t.ValidPlayer && !forgeValideJoueur(P, j, t.ValidPlayer, h.ctrl, env)) continue;
    /* « Each draw after the first in your draw step » (Notion Thief). */
    if (t.NotFirstCardInDrawStep === 'True' && P.etape === 'pioche' && P.actif === j && !J.piochesTour) continue;
    if (t.ActivePhases === 'Draw' && P.etape !== 'pioche') continue;
    if (t.Hellbent === 'True' && P.joueurs[h.ctrl].main.length) continue;
    if (!conditionForge(P, t, env)) continue;
    if (t.Optional === 'True') {
      const qui = t.OptionalDecider === 'You' ? h.ctrl : j;
      if ((yield question(P, qui, 'oui', ['non', 'oui'], {texte: `${h.def.nom} : à la place de piocher ?`, source: h.id})) !== 1) continue;
    }
    jn(P, `${h.def.nom} remplace la pioche de ${J.nom}`);
    if (t.Prevent === 'True' && !t.ReplaceWith) return true;
    const ef = h.zone === 'effet', ctx = {source: ef ? h.srcId : h.id, lki: ef ? h : null, effet: ef ? h : null, ctrl: h.ctrl, cibles: [], trouves: [], x: 0,
      memo: (h.memo || []).slice(), memoJ: (h.memoJ || []).slice(), evt: {t: 'remplace', remJoueur: j}};
    enCours.push(cle);
    yield* executeOps(P, chainePioche(r.face, t.ReplaceWith).ops, ctx);
    enCours.splice(enCours.indexOf(cle), 1);
    return true;
  }
  return false;
}

/* Dredge N : au lieu de piocher, meuler N et reprendre la carte. Il faut N
   cartes dans la bibliothèque. L'IA drague tant que sa bibliothèque reste
   épaisse. */
function* dragage(P, j) {
  const J = P.joueurs[j];
  const ids = J.cimetiere.filter(id => { const d = obj(P, id).def.params.dragage; return d && J.bibliotheque.length >= d; });
  if (!ids.length) return false;
  const opts = ['Piocher', ...ids.map(id => `Draguer ${obj(P, id).def.nom} (meuler ${obj(P, id).def.params.dragage})`)];
  const i = yield* choisitUn(P, j, opts, 'Draguer au lieu de piocher ?', J.bibliotheque.length >= 15 ? 1 : 0, null);
  if (!i) return false;
  const o = obj(P, ids[i - 1]), n = o.def.params.dragage;
  for (let k = 0; k < n && J.bibliotheque.length; k++) deplace(P, J.bibliotheque[J.bibliotheque.length - 1], 'cimetiere');
  deplace(P, o.id, 'main');
  jn(P, `${J.nom} drague ${o.def.nom}`);
  return true;
}

/* Miracle : la carte se lance pour son coût de miracle, par la voie des
   lancements depuis un effet (`o.lanceEffet`, js/jeuVariantes.js). */
function* miracle(P, j, id) {
  const o = obj(P, id);
  if (!o || !o.def.miracle || o.zone !== 'main') return;
  o.lanceEffet = {gratuit: false, mana: o.def.miracle};
  if (variantesSort(P, j, o, 'main').length &&
    (yield* choisitUn(P, j, [`Lancer ${o.def.nom} pour son miracle`, 'La garder en main'], 'Miracle', 0, o.id)) === 0) {
    jn(P, `${P.joueurs[j].nom} révèle ${o.def.nom} : miracle`);
    yield* lanceSort(P, j, {k: 'lancer', id: o.id, depuis: 'main', variante: 'permis'});
  }
  if (obj(P, id)) delete obj(P, id).lanceEffet;
}

/* Les mots-clés de la pioche, lus par js/forgeMotsCles.js `motCleForge()`.
   Rend `null` si ce n'en est pas un. */
function motClePioche(def, tete, reste) {
  if (tete === 'Dredge') { if (reste.length !== 1 || !/^\d+$/.test(reste[0])) return false; def.params.dragage = +reste[0]; return true; }
  if (tete === 'Miracle') { const c = reste.length === 1 ? manaSeul(reste[0]) : null; if (!c) return false; def.miracle = coutComplet(c).mana; return true; }
  return null;
}

forgeSait('kw', 'Dredge', 'Miracle');
forgeSait('repl', 'Draw');
forgeSait('param', 'Draw.ValidPlayer', 'Draw.ReplaceWith', 'Draw.ActiveZones', 'Draw.NotFirstCardInDrawStep', 'Draw.Optional', 'Draw.OptionalDecider',
  'Draw.Prevent', 'Draw.Hellbent', 'Draw.ActivePhases', 'Draw.Description');
