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
