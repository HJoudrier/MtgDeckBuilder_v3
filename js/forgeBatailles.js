/* =====================================================================
   js/forgeBatailles.js — Les batailles (Siege) : points de défense,
   protecteur, vaincre, lancer la face arrière

   Une bataille entre avec autant de marqueurs défense que son script en
   donne (`Defense:N`). Son contrôleur l'attaque ; l'adversaire qu'elle
   protège la défend, bloque pour elle. Vaincue — plus de défense —, elle
   part en exil et son contrôleur lance sa face arrière sans payer.
   Simplifications : le protecteur est l'adversaire qui suit le
   contrôleur dans l'ordre du tour, sans choix ; la bataille passe
   directement en exil, sans détour par le cimetière.
   ===================================================================== */

/* L'adversaire qui protège la bataille : le premier vivant après son contrôleur. */
function protecteurDeBataille(P, o) {
  const n = P.joueurs.length;
  for (let k = 1; k < n; k++) {
    const J = P.joueurs[(o.ctrl + k) % n];
    if (!J.elimine) return J.i;
  }
  return null;
}

/* À l'entrée : les marqueurs défense, et celui qui protège. */
function poseDefense(P, o) {
  o.marq.defense = o.def.defense;
  o.protecteur = protecteurDeBataille(P, o);
}

/* Qui bloque pour le défenseur d'une attaque : le protecteur quand c'est
   une bataille, le contrôleur quand c'est un planeswalker. */
defenseurDe = (g => function (P, def) {
  const o = def.j == null ? obj(P, def.pw) : null;
  if (o && o.protecteur != null && estType(o, 'battle')) return o.protecteur;
  return g(P, def);
})(defenseurDe);

/* Les batailles que `j` peut attaquer : celles qu'il contrôle. */
const bataillesAttaquables = (P, j) => P.champ.filter(id => { const o = obj(P, id); return o.ctrl === j && estType(o, 'battle') && o.protecteur != null; });

/* Vaincue : exil, puis la face arrière se lance gratuitement. Rend vrai
   si une bataille l'a été (js/jeuEtatsDeJeu.js). */
const CAP_DEFAITE = {genre: 'declenchee', texte: 'Bataille vaincue',
  effet: {ops: [{op: 'defaite'}], cibles: [], modes: null}};

function vaincBataille(P, id) {
  const o = obj(P, id);
  if (!o || o.zone !== 'champ') return false;
  const ctrl = o.ctrl, dos = !!P.cartes[o.cid] && !!P.cartes[o.cid].def.dos;
  jn(P, `${o.def.nom} est vaincue`);
  const n = deplace(P, id, 'exil');
  if (dos && n != null && obj(P, n)) P.enAttente.push({src: n, ctrl, cap: CAP_DEFAITE, evt: {t: 'defaite', id: n}});
  return true;
}

OPS.defaite = function* (P, op, ctx) {
  const o = obj(P, ctx.source);
  if (!o || o.zone !== 'exil') return;
  o.lanceEffet = {gratuit: true, dos: true};
  yield* lanceSort(P, ctx.ctrl, {k: 'lancer', id: o.id, depuis: 'exil', variante: 'gratuit'});
  if (obj(P, o.id)) delete obj(P, o.id).lanceEffet;
};
