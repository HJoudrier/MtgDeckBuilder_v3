/* =====================================================================
   js/forgeArtefactsD.js — Les artefacts d'EDHREC : l'équipage

   Lot F108. Un véhicule qui s'équipe (crew) :
   - Interface Ace et Hotshot Mechanic : `TapPowerValue`, la valeur d'une
     créature qui équipe — sa solidité, ou deux de plus ;
   - Mighty Servant of Leuk-o, Mindlink Mech : `BecomesCrewed`, avec la
     première fois du tour (`FirstTimeCrewed`), le nombre exact d'équipiers
     (`ValidCrewAmount`) et les créatures qui l'ont équipé (`TriggeredCrew`) ;
   - Luxurious Locomotive : `Count$CrewSize`, et `Crew:1:ActivationLimit$ 1`,
     une fois par tour.
   ===================================================================== */

/* —— Ce que vaut une créature qui équipe ————————————————————————————— */

forgeStatique('TapPowerValue', ['ValidSA', 'ValidCard', 'Value'], () => {});
function valeurEquipage(P, x) {
  let v = Math.max(0, car(P, x).force);
  for (const {src, s} of statiquesMode(P, 'TapPowerValue')) {
    const t = s.t, env = envStatique(src, s);
    if (!/Crew/.test(t.ValidSA || '') || !objetOuRien(P, x, t.ValidCard, src, env)) continue;
    if (t.Value === 'Toughness') v = Math.max(0, car(P, x).endurance);
    else if (/^\d+$/.test(t.Value)) v += +t.Value;
  }
  return v;
}
equipagePossible = function (P, j, o, n) { return equipiers(P, j, o).reduce((s, x) => s + valeurEquipage(P, x), 0) >= n; };
paieEquipage = function* (P, j, o, n) {
  const cands = equipiers(P, j, o);
  const ids = yield* choisitCartes(P, j, cands.map(x => x.id), cands.length, 'Équipage', 'cartes', 1);
  const pris = ids.map(id => obj(P, id));
  let total = pris.reduce((s, x) => s + valeurEquipage(P, x), 0);
  /* Trop peu choisi : on complète par les plus faibles. */
  cands.filter(x => !pris.includes(x)).sort((a, b) => valeurEquipage(P, a) - valeurEquipage(P, b)).forEach(x => {
    if (total < n) { pris.push(x); total += valeurEquipage(P, x); }
  });
  pris.forEach(x => engageObjet(P, x));
  /* Ceux qui ont payé l'équipage ou l'enfourchement (`SaddledThisTurn`, js/forgeFiltresE.js). */
  P.engagesCout = pris.map(x => x.id);
  /* Ce tour-ci : combien de fois, et par qui (les triggers `BecomesCrewed`, `Count$CrewSize`). */
  const dejaCe = o.equipeTour && o.equipeTour.tour === P.tour ? o.equipeTour : {tour: P.tour, n: 0, ids: []};
  dejaCe.n++; dejaCe.ids = [...dejaCe.ids, ...pris.map(x => x.id)]; o.equipeTour = dejaCe;
  P.ver++;
  emet(P, {t: 'equipe', id: o.id, joueur: j, ids: pris.map(x => x.id), rang: dejaCe.n});
};

/* —— Devenir équipé ———————————————————————————————————————————————— */

forgeMode('BecomesCrewed', ['ValidCard', 'FirstTimeCrewed', 'ValidCrewAmount'], (P, t, e, s, env) => e.t === 'equipe' && valideOuRien(P, obj(P, e.id), t.ValidCard, s, env) &&
  (t.FirstTimeCrewed !== 'True' || e.rang === 1) && (!t.ValidCrewAmount || (e.ids || []).length === +t.ValidCrewAmount));
/* « Target creature that crewed it this turn » : les équipiers de l'évènement qui déclenche. */
proprieteDesignee = (g => function (P, o, p, c, src, ctrl, env) {
  if (p === 'TriggeredCrew') { const e = (env && env.ctx && env.ctx.evt) || P.evtCible; return !!e && (e.ids || []).includes(o.id); }
  return g(P, o, p, c, src, ctrl, env);
})(proprieteDesignee);
forgeSait('filtre', 'TriggeredCrew');
/* L'évènement qui a déclenché la capacité, lisible quand on choisit ses cibles et quand on les juge encore légales à la résolution. */
prepareEffets = (g => function* (P, j, src, effet, couleurs, extra) {
  const avant = P.evtCible; P.evtCible = (extra && extra.evt) || null;
  try { return yield* g(P, j, src, effet, couleurs, extra); } finally { P.evtCible = avant; }
})(prepareEffets);
resoudre = (g => function* (P, item) {
  const avant = P.evtCible; P.evtCible = item.evt || null;
  try { return yield* g(P, item); } finally { P.evtCible = avant; }
})(resoudre);
exprEtendue = (g => function (P, tete, q, env) {
  if (tete === 'Count' && q === 'CrewSize') { const o = env.src; return o && o.equipeTour && o.equipeTour.tour === P.tour ? o.equipeTour.ids.length : 0; }
  return g(P, tete, q, env);
})(exprEtendue);
forgeSait('expr', 'Count$CrewSize');

/* « Crew 1, activate only once each turn » : `K:Crew:1:ActivationLimit$ 1`. */
motCleForge = (g => function (def, k, face, jetons) {
  const m = /^Crew:(\d+):ActivationLimit\$ ?1$/.exec(k);
  if (!m) return g(def, k, face, jetons);
  if (!g(def, 'Crew:' + m[1], face, jetons)) return false;
  def.capacites[def.capacites.length - 1].unefois = true;
  return true;
})(motCleForge);
