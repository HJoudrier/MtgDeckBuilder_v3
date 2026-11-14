/* =====================================================================
   js/jeuPile.js — La priorité, la pile, la résolution

   Le cœur du moteur (règles 117, 405, 603.3, 608). À chaque passage de
   priorité : les actions d'état jusqu'à ce qu'il n'y en ait plus, puis les
   déclencheurs en attente posés sur la pile dans l'ordre APNAP, puis le
   joueur qui a la priorité agit ou passe. Quand tous passent de suite, le
   sommet de la pile se résout et la priorité revient au joueur actif ; une
   pile vide termine l'étape.
   ===================================================================== */

/* Le plafond d'actions par tour : une boucle que l'IA ne saurait pas
   arrêter fait finir la partie, nulle, plutôt que figer la page. */
const PLAFOND_ACTIONS = 400;

function retireDeLaPile(P, id) {
  const i = P.pile.findIndex(it => it.id === id);
  if (i >= 0) P.pile.splice(i, 1);
}

/* Une capacité déclenchée en attente devient un élément de pile : ses
   modes, ses cibles. `null` si elle n'a pas de cible légale. */
function* prepareDeclencheur(P, t) {
  const src = obj(P, t.src) || t.lki || null;
  const effets = yield* prepareEffets(P, t.ctrl, src, t.cap.effet, src ? src.def.couleurs : [], {declencheur: true});
  if (!effets) return null;
  return {id: P.prochainId++, capacite: true, source: t.src, lki: t.lki, ctrl: t.ctrl, effets, x: 0, evt: t.evt,
    nom: src ? src.def.nom : '?', memo: t.memo, memoJ: t.memoJ};
}

/* Stabiliser avant une priorité (règle 117.5). */
function* stabilise(P) {
  for (let garde = 0; garde < 60; garde++) {
    collecteDeclencheurs(P);
    /* Des actions d'état qui ne se stabilisent pas (deux statiques qui se
       défont l'une l'autre) font une partie nulle, pas un onglet figé. */
    let passes = 0;
    while (!P.fin && appliqueSBA(P)) {
      collecteDeclencheurs(P);
      if (++passes > 200) P.fin = {nulle: true, raison: 'boucle', tour: P.tour};
    }
    if (P.fin || !P.enAttente.length) return;
    const attente = P.enAttente;
    P.enAttente = [];
    for (const j of ordreApnap(P)) {
      for (const t of attente) {
        if (t.ctrl !== j) continue;
        const item = yield* prepareDeclencheur(P, t);
        if (item) P.pile.push(item);
      }
    }
  }
}

/* Résoudre un élément de pile (règle 608). Les cibles sont revérifiées ; un
   sort dont toutes les cibles sont devenues illégales est contrecarré par
   la règle. */
function* resoudre(P, item) {
  P.suivi = new Map();
  P.lkis = new Map();
  const src = item.sort ? obj(P, item.id) : (obj(P, item.source) || item.lki);
  const couleurs = src ? (src.lki ? src.couleurs : src.def.couleurs) : [];
  let avait = false, reste = false;
  for (const ef of item.effets) {
    ef.cibles = ef.cibles.map((cs, si) => {
      if (cs.length) avait = true;
      const ok = cs.filter(c => cibleEncoreLegale(P, c, ef.slots[si], src, item.ctrl, couleurs));
      if (ok.length) reste = true;
      return ok;
    });
  }
  if (avait && !reste) {
    jn(P, `${item.sort ? item.def.nom : item.nom} n'a plus de cible`);
    if (item.sort && obj(P, item.id)) deplace(P, item.id, 'cimetiere');
    return;
  }
  if (item.sort && item.def.types.some(t => TYPES_PERMANENTS.includes(t))) {
    const aura = item.effets[0] && item.effets[0].aura ? item.effets[0].cibles[0][0] : null;
    jn(P, `${item.def.nom} arrive`);
    const k = obj(P, item.id) && P.cartes[obj(P, item.id).cid];
    yield* metEnJeu(P, item.id, item.ctrl, {attache: aura, kicked: item.kicked, evoque: item.evoque, suspendu: item.suspendu,
      face: k && item.def !== k.def ? item.def : null, faceCachee: item.variante === 'morph'});
    return;
  }
  const ctx = {source: item.sort ? item.id : item.source, lki: item.lki, ctrl: item.ctrl, x: item.x,
    evt: item.evt, cibles: [], trouves: [], fait: undefined, kicked: !!item.kicked, memo: item.memo, memoJ: item.memoJ};
  for (const ef of item.effets) {
    ctx.cibles = ef.cibles;
    yield* executeOps(P, ef.ops, ctx);
    if (P.fin) return;
  }
  if (item.sort && obj(P, item.id)) {
    /* Une aventure part en exil, d'où la créature se lancera. */
    const flashback = item.depuis === 'cimetiere' && item.variante !== 'permis';
    const n = deplace(P, item.id, flashback || item.variante === 'aventure' ? 'exil' : item.rachat ? 'main' : 'cimetiere');
    if (item.variante === 'aventure' && obj(P, n)) obj(P, n).aventure = true;
  }
}

/* Un tour de priorité, jusqu'à ce que tous passent sur une pile vide. */
function* priorite(P) {
  let j = P.actif, passes = 0;
  /* Une action qui a échoué — un sort revenu en main faute de cible au
     dernier moment — n'est plus proposée de ce passage : sans quoi le même
     joueur la choisirait en boucle. */
  const echecs = new Set();
  const cle = a => a.k + a.id + '|' + (a.i == null ? '' : a.i) + '|' + (a.variante || '') + (a.depuis || '');
  for (;;) {
    yield* stabilise(P);
    if (P.fin || P.finTour) return;
    if (P.joueurs[j].elimine) j = suivantVivant(P, j);
    let actions = actionsPossibles(P, j);
    if (echecs.size) actions = actions.filter(a => a.k === 'passer' || !echecs.has(cle(a)));
    let a = PASSE;
    if (actions.length > 1) a = actions[yield question(P, j, 'priorite', actions, {defaut: actions.length - 1})] || PASSE;
    if (a.k !== 'passer') {
      if (++P.actionsTour > PLAFOND_ACTIONS) { P.fin = {nulle: true, raison: 'plafond'}; return; }
      if (yield* executeAction(P, j, a)) { passes = 0; echecs.clear(); } else echecs.add(cle(a));
      continue;
    }
    if (++passes < vivants(P).length) { j = suivantVivant(P, j); continue; }
    if (!P.pile.length) return;
    yield* resoudre(P, P.pile.pop());
    if (++P.actionsTour > PLAFOND_ACTIONS) { P.fin = {nulle: true, raison: 'plafond'}; return; }
    j = P.actif; passes = 0;
  }
}
