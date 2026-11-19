/* =====================================================================
   js/jeuManaManuel.js — Engager son mana soi-même, et choisir sa couleur

   Le solveur de js/jeuMana.js paie à la place du joueur : il engage les
   terrains qu'il juge les moins précieux, sans demander. Un joueur qui veut
   garder un terrain dégagé pour plus tard, ou régler lui-même ce qu'il
   dépense, passe au **paiement manuel** (`J.manuel`) :

   - le solveur ne puise plus que dans la **réserve** — `planPaiement()` ne lui
     laisse aucune source — ; un sort ne se propose donc que lorsque le mana
     engagé le paie ;
   - chaque source devient une action de priorité (`{k: 'mana', id, option}`),
     une par couleur qu'elle sait produire : on engage, la réserve se remplit,
     puis on lance. Une capacité de mana n'utilise pas la pile : le joueur
     garde la priorité après l'avoir jouée ;
   - une action `{k: 'reglage'}` bascule d'un mode à l'autre. C'est une réponse
     comme une autre, rangée avec les autres : la partie reste rejouable à
     l'identique, ce qu'un réglage fait hors du moteur ne permettrait pas.

   Le choix de la couleur vaut aussi pour les effets qui ajoutent du mana
   (« Add {R} or {G} ») : `choisitManaOption()` le demande au joueur, là où
   le moteur prenait la première option.
   ===================================================================== */

/* Ce joueur paie-t-il son mana à la main ? */
function paiementManuel(P, j) { return !!(P.joueurs[j] && P.joueurs[j].manuel); }

/* Les actions de mana d'un joueur au paiement manuel : chaque source, pour
   chacune de ses options. Une source qui produit plusieurs couleurs d'un
   coup (« WG ») n'a qu'une option. */
function actionsManuelles(P, j) {
  const J = P.joueurs[j], r = [];
  if (J.manuel) sourcesMana(P, j).forEach(s => [...new Set(s.options)].forEach(option => r.push({k: 'mana', id: s.id, option, ...(s.sac ? {sac: true} : {})})));
  /* Le réglage reste proposé aux sièges humains, quel que soit le mode. */
  if (J.reglable) r.push({k: 'reglage', manuel: !J.manuel});
  return r;
}

/* Engager une source pour la couleur choisie : son mana va dans la réserve.
   Rend faux si la source n'est plus utilisable — la réponse arrive d'un
   humain, et l'état a pu changer. */
function activeManaManuel(P, j, a) {
  if (!paiementManuel(P, j)) return false;
  const s = sourcesMana(P, j).find(x => x.id === a.id);
  if (!s || !s.options.includes(a.option)) return false;
  activeSource(P, j, s, a.option, null);
  return true;
}

/* Basculer entre le paiement automatique et le paiement manuel. */
function basculeReglage(P, j, a) {
  const J = P.joueurs[j];
  if (!J.reglable) return false;
  J.manuel = !!a.manuel;
  jn(P, `${J.nom} paie son mana ${J.manuel ? 'à la main' : 'automatiquement'}`);
  P.ver++;
  return true;
}

const NOMS_COULEURS_MANA = {W: 'blanc', U: 'bleu', B: 'noir', R: 'rouge', G: 'vert', C: 'incolore'};

/* Une option de mana, en mots : « rouge », « rouge ×2 », « blanc + bleu ». */
function libelleManaOption(option) {
  const n = {};
  String(option).split('').forEach(l => { n[l] = (n[l] || 0) + 1; });
  return Object.keys(n).map(l => (NOMS_COULEURS_MANA[l] || l) + (n[l] > 1 ? ' ×' + n[l] : '')).join(' + ');
}

/* Choisir ce que produit un effet de mana. `prefere` : l'indice que prend
   un joueur automatique, qui ne se pose pas la question. Rend l'option. */
function* choisitManaOption(P, j, options, source, prefere) {
  const uniques = [...new Set(options)];
  if (uniques.length <= 1) return uniques[0];
  const p = Math.max(0, uniques.indexOf(options[prefere || 0]));
  const i = yield* choisitUn(P, j, uniques.map(o => 'Mana ' + libelleManaOption(o)), 'Quel mana ajouter ?', p, source);
  return uniques[i];
}
