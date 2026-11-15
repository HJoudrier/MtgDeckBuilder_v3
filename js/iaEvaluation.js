/* =====================================================================
   js/iaEvaluation.js — Ce que vaut une position

   Une seule note pour tout ce que le joueur automatique compare : le
   combat calculé (js/iaCombatCalcul.js) et les coups essayés sur une copie
   de la partie (js/iaRecherche.js) jugent l'état atteint avec elle. Elle
   pèse la vie (plus lourde près de zéro), le poison et les blessures de
   commandant, les cartes en main, le plateau, le mana, et l'horloge : en
   combien de tours on tue, en combien on meurt.

   Les poids sont rangés à part (`POIDS_EVAL`) : le banc de force les règle
   en opposant deux versions de l'IA, puis on les fige ici.
   ===================================================================== */

const POIDS_EVAL = {vie: 1, vieHaute: 0.3, danger: 1.5, poison: 2.5, cmd: 0.5, main: 2, plateau: 1.2, terrain: 1.5,
  terrainHaut: 0.3, horloge: 1.2, mort: 1000};

/* Ce que pèse la situation d'un joueur, prise seule. */
function noteJoueur(P, i) {
  const J = P.joueurs[i], W = POIDS_EVAL;
  if (J.elimine) return -W.mort;
  const v = J.vie;
  let s = Math.min(v, 20) * W.vie + Math.max(0, v - 20) * W.vieHaute - Math.max(0, 6 - v) * W.danger;
  s -= (J.poison || 0) * W.poison;
  s -= Math.max(0, ...Object.values(J.degatsCmd || {})) * W.cmd;
  s += Math.min(J.main.length, 7) * W.main;
  let terrains = 0;
  for (const o of champDe(P, i)) {
    if (estType(o, 'land')) { terrains++; continue; }
    s += valeurObjet(P, o) * W.plateau;
  }
  return s + Math.min(terrains, 6) * W.terrain + Math.max(0, terrains - 6) * W.terrainHaut;
}

/* En combien de tours la force de frappe de `a` vient à bout de `b`
   (au plus dix : au-delà, l'horloge ne dit plus rien). */
function toursPourTuer(P, a, b) {
  const f = forceDeFrappe(P, a), vie = P.joueurs[b].vie;
  return f <= 0 ? 10 : Math.min(10, Math.ceil(Math.max(1, vie) / f));
}

/* La note d'une position, du point de vue du joueur j : sa situation,
   moins celle de ses adversaires (le plus menaçant compte pour moitié,
   les autres en moyenne pour l'autre moitié), plus l'horloge. Une partie
   gagnée ou perdue écrase tout le reste. */
function evalue(P, j) {
  const W = POIDS_EVAL;
  if (P.fin && !P.fin.nulle) return P.fin.gagnant === j ? W.mort : -W.mort;
  if (P.joueurs[j].elimine) return -W.mort;
  const adv = adversaires(P, j);
  if (!adv.length) return W.mort;
  const notes = adv.map(k => noteJoueur(P, k));
  const pire = Math.max(...notes), moyenne = notes.reduce((a, b) => a + b, 0) / notes.length;
  const tuer = Math.min(...adv.map(k => toursPourTuer(P, j, k)));
  const mourir = Math.min(...adv.map(k => toursPourTuer(P, k, j)));
  return noteJoueur(P, j) - (pire + moyenne) / 2 + (mourir - tuer) * W.horloge;
}
