/* =====================================================================
   js/iaEvaluation.js — Ce que vaut une position

   Une seule note pour tout ce que le joueur automatique compare : le
   combat calculé (js/iaCombatCalcul.js) et les coups essayés sur une copie
   de la partie (js/iaRecherche.js) jugent l'état atteint avec elle. Elle
   pèse la vie (plus lourde près de zéro), le poison et les blessures de
   commandant, les cartes en main, le plateau, le mana, et l'horloge : en
   combien de tours on tue, en combien on meurt.

   Une issue imaginée — des créatures mortes, des vies changées — se note
   sans toucher à la partie : on passe un écart (`d`) à `evalue()`. Ce qui
   ne dépend que du plateau est calculé une fois par version de l'état
   (`P.ver`), parce que le combat calculé note des milliers d'issues.

   Les poids sont rangés à part (`POIDS_EVAL`) : le banc de force les règle
   en opposant deux versions de l'IA, puis on les fige ici.
   ===================================================================== */

const POIDS_EVAL = {vie: 1, vieHaute: 0.3, danger: 1.5, poison: 2.5, cmd: 0.5, main: 2, plateau: 1.2, terrain: 1.5,
  terrainHaut: 0.3, horloge: 1.2, mort: 1000};

/* Le plateau de chaque joueur, une fois par version de l'état : la valeur
   et la force de chaque créature, la somme des valeurs, les terrains. */
const BASES_EVAL = new WeakMap();
function baseEval(P) {
  const b0 = BASES_EVAL.get(P);
  if (b0 && b0.ver === P.ver) return b0;
  const b = {ver: P.ver, valeur: new Map(), force: new Map(), plateau: [], forces: [], terrains: []};
  P.joueurs.forEach(J => {
    let plateau = 0, forces = 0, terrains = 0;
    for (const o of champDe(P, J.i)) {
      if (estType(o, 'land')) { terrains++; continue; }
      const v = valeurObjet(P, o), f = estCreature(o) ? Math.max(0, car(P, o).force) : 0;
      b.valeur.set(o.id, v); b.force.set(o.id, f);
      plateau += v; forces += f;
    }
    b.plateau[J.i] = plateau; b.forces[J.i] = forces; b.terrains[J.i] = terrains;
  });
  BASES_EVAL.set(P, b);
  return b;
}

/* Ce que pèse un total de vie. */
function noteVie(v) {
  const W = POIDS_EVAL;
  return Math.min(v, 20) * W.vie + Math.max(0, v - 20) * W.vieHaute - Math.max(0, 6 - v) * W.danger;
}

/* La vie, le poison et ce qui reste du plateau d'un joueur, l'écart `d`
   appliqué : `d.vie[i]`, `d.poison[i]` (en plus), `d.morts` (des ids). */
function etatApres(P, b, i, d) {
  const J = P.joueurs[i];
  let plateau = b.plateau[i], forces = b.forces[i];
  if (d && d.morts) d.morts.forEach(id => { const o = obj(P, id); if (o && o.ctrl === i && b.valeur.has(id)) { plateau -= b.valeur.get(id); forces -= b.force.get(id); } });
  const vie = d && d.vie && d.vie[i] != null ? d.vie[i] : J.vie;
  const poison = (J.poison || 0) + (d && d.poison && d.poison[i] || 0);
  return {vie, poison, plateau, forces, mort: J.elimine || vie <= 0 || poison >= 10};
}

/* Ce que pèse la situation d'un joueur, prise seule. */
function noteJoueur(P, i, d) {
  const J = P.joueurs[i], W = POIDS_EVAL, b = baseEval(P), e = etatApres(P, b, i, d);
  if (e.mort) return -W.mort;
  const t = b.terrains[i];
  return noteVie(e.vie) - e.poison * W.poison - Math.max(0, ...Object.values(J.degatsCmd || {})) * W.cmd +
    Math.min(J.main.length, 7) * W.main + e.plateau * W.plateau + Math.min(t, 6) * W.terrain + Math.max(0, t - 6) * W.terrainHaut;
}

/* En combien de tours une force de frappe vient à bout d'une vie (au plus
   dix : au-delà, l'horloge ne dit plus rien). */
function toursPourTuer(force, vie) { return force <= 0 ? 10 : Math.min(10, Math.ceil(Math.max(1, vie) / force)); }

/* La note d'une position, du point de vue du joueur j : sa situation,
   moins celle de ses adversaires (le plus menaçant compte pour moitié,
   les autres en moyenne pour l'autre moitié), plus l'horloge. Une partie
   gagnée ou perdue écrase tout le reste. `d` : un écart imaginé (voir
   `etatApres()`), ou rien pour la position telle qu'elle est. */
function evalue(P, j, d) {
  const W = POIDS_EVAL;
  if (P.fin && !P.fin.nulle) return P.fin.gagnant === j ? W.mort : -W.mort;
  const b = baseEval(P), moi = etatApres(P, b, j, d);
  if (moi.mort) return -W.mort;
  const adv = adversaires(P, j).map(k => [k, etatApres(P, b, k, d)]).filter(([, e]) => !e.mort);
  if (!adv.length) return W.mort;
  const notes = adv.map(([k]) => noteJoueur(P, k, d));
  const pire = Math.max(...notes), moyenne = notes.reduce((a, x) => a + x, 0) / notes.length;
  const tuer = Math.min(...adv.map(([, e]) => toursPourTuer(moi.forces, e.vie)));
  const mourir = Math.min(...adv.map(([, e]) => toursPourTuer(e.forces, moi.vie)));
  return noteJoueur(P, j, d) - (pire + moyenne) / 2 + (mourir - tuer) * W.horloge;
}
