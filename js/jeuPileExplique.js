/* =====================================================================
   js/jeuPileExplique.js — Dire ce qui est sur la pile, et ce qui se résout

   Un joueur qui a la priorité, ou à qui l'on pose une question en pleine
   résolution, doit savoir de quoi il s'agit : quel sort, quelle capacité, de
   qui, avec quelles cibles, et ce qu'elle fait. `descriptionPile()` donne
   cette description d'un élément de pile — c'est ce que la vue du joueur
   (js/jeuVue.js) emporte, et ce que la table lit pour l'expliquer.

   L'élément qu'on résout n'est plus sur la pile : `resoudre()` le retire avant
   de le dérouler. On le garde donc dans `RESOLVANTS` le temps de sa
   résolution, pour que la question qu'il pose — « le faire ? », choisir une
   cible, payer — puisse dire à quoi elle se rapporte.
   ===================================================================== */

const GENRES_PILE = {sort: 'Sort', declenchee: 'Capacité déclenchée', activee: 'Capacité activée', copie: 'Copie de sort'};

/* Un texte de carte lisible d'une ligne : les retours à la ligne se lisent « // » dans les définitions. */
function texteCourt(t, max = 420) {
  const s = String(t || '').replace(/\s*\/\/\s*/g, ' · ').replace(/\s+/g, ' ').trim();
  return s.length > max ? s.slice(0, max - 1) + '…' : s;
}

/* Un élément de pile tel qu'on le décrit à un humain. */
function descriptionPile(P, it) {
  const sort = !!it.sort, genre = it.copie ? 'copie' : sort ? 'sort' : it.declencheur ? 'declenchee' : 'activee';
  const cs = [].concat(...(it.effets || []).map(ef => [].concat(...ef.cibles)));
  const texte = sort ? it.def.texteOracle : it.declencheur ? it.declencheur.texte : it.texte;
  const src = it.source != null ? obj(P, it.source) : null;
  return {id: it.id, nom: sort ? it.def.nom : it.nom, ctrl: it.ctrl, sort, genre, genreLibelle: GENRES_PILE[genre],
    texte: texteCourt(texte), permanent: sort && it.def.types.some(t => TYPES_PERMANENTS.includes(t)),
    kicked: !!it.kicked, x: it.x > 0 ? it.x : 0,
    cibles: cs.map(c => libelleRef(P, c)), refs: cs.map(c => refPublique(P, c)).filter(Boolean),
    source: sort ? null : (refPublique(P, it.source) || {}).id, declenche: !!it.declencheur,
    depuis: src && src.zone !== 'champ' ? src.zone : null};
}

/* Le temps d'une résolution, l'élément est noté ici : les questions s'y rapportent. Hors de
   `P`, pour que la copie d'une partie — l'IA qui essaie un coup — n'emporte pas un élément
   qui n'a rien à lui dire. */
const RESOLVANTS = new WeakMap();
const resolvantDe = P => RESOLVANTS.get(P) || null;

resoudre = (g => function* (P, item) {
  RESOLVANTS.set(P, item);
  try { return yield* g(P, item); } finally { RESOLVANTS.delete(P); }
})(resoudre);

/* Ce qu'on fait avant que ce soit sur la pile : lancer un sort (modes, cibles, X, coûts à choisir),
   activer une capacité, mettre un déclencheur en pile (ses cibles). Rien n'est encore sur la pile,
   mais la question qui se pose — « quelle cible ? », « quoi défausser ? » — doit pouvoir dire pour
   quelle carte. Noté ici, comme `RESOLVANTS`, et rendu à l'état d'avant à la sortie : un sort lancé
   en réponse n'efface pas celui qu'on lançait. */
const AGISSANTS = new WeakMap();
const agissantDe = P => AGISSANTS.get(P) || null;

function enAgissant(g, decrit) {
  return function* (P, ...args) {
    const avant = AGISSANTS.get(P);
    let d = null;
    try { d = decrit(P, ...args); } catch (e) { d = null; }
    if (d) AGISSANTS.set(P, d);
    try { return yield* g(P, ...args); } finally { if (avant) AGISSANTS.set(P, avant); else AGISSANTS.delete(P); }
  };
}

const decritObjet = (o, j, genre, texte) => o && {nom: o.def.nom, genreLibelle: GENRES_PILE[genre], texte: texteCourt(texte), ctrl: j, def: o.def};
lanceSort = enAgissant(lanceSort, (P, j, a) => { const o = obj(P, a.id); return decritObjet(o, j, 'sort', o && o.def.texteOracle); });
activeCapacite = enAgissant(activeCapacite, (P, j, a) => { const o = obj(P, a.id); return decritObjet(o, j, 'activee', o && (capacitesDe(P, o)[a.i] || {}).texte); });
equipe = enAgissant(equipe, (P, j, a) => decritObjet(obj(P, a.id), j, 'activee', 'Équiper : attache cet équipement à la créature visée.'));
prepareDeclencheur = enAgissant(prepareDeclencheur, (P, t) => decritObjet(obj(P, t.src) || t.lki, t.ctrl, 'declenchee', t.cap.texte));

/* À quoi se rapporte une question de choix : la carte et ce qu'elle fait. Le sort ou la capacité
   qu'on résout, qu'on lance ou qu'on active ; à défaut, la carte que la question nomme. Rien pour
   celles qui se règlent sur la table même — priorité, combat, mulligan. */
function contexteQuestion(P, q) {
  if (/^(priorite|mulligan|attaquants|bloqueurs|voir)$/.test(q.q)) return null;
  const r = resolvantDe(P);
  let c = null, def = null;
  if (r) {
    const d = descriptionPile(P, r), src = r.sort ? r : (obj(P, r.source) || r.lki);
    def = r.sort ? r.def : src && src.def;
    c = {nom: d.nom, genreLibelle: d.genreLibelle, texte: d.texte, ctrl: d.ctrl, resout: true};
  } else if (agissantDe(P)) {
    const a = agissantDe(P);
    def = a.def;
    c = {nom: a.nom, genreLibelle: a.genreLibelle, texte: a.texte, ctrl: a.ctrl};
  } else if (q.source && obj(P, q.source)) {
    const o = obj(P, q.source);
    def = o.def;
    c = {nom: o.def.nom, genreLibelle: 'Carte', texte: texteCourt(o.def.texteOracle), ctrl: o.ctrl};
  }
  return c && def ? {...c, fiche: ficheVue(def)} : null;
}

