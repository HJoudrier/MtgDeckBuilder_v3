/* =====================================================================
   js/forgeInstantsG.js — Les instants : un nombre de cibles annoncé

   Lot F101. Certains sorts annoncent X avant de choisir leurs cibles, parce
   que X dit combien en choisir :
   - Waterbender's Restoration : « waterbend {X} … exile X target creatures
     you control » — exactement X cibles ;
   - March of Swirling Mist : « up to X target creatures phase out », et en
     coût facultatif d'exiler des cartes bleues de sa main, deux mana de moins
     chacune.
   Le moteur choisit X après les cibles ; ici, pour ces sorts, X est choisi
   avant (`s.xAnnonce`, lu par `choisitCibles()`, js/jeuLancer.js). Seuls les
   sorts qui portent `Announce$` sont concernés : les capacités gardent leur
   ordre.
   ===================================================================== */

forgeSait('param', 'ChangeZone.Announce', 'Phases.Announce', 'Phases.AnnounceTitle');

emplacementForge = (g => function (t, face) {
  const r = g(t, face);
  if (t.Announce == null || t.TargetMax == null || /^\d+$/.test(t.TargetMax)) return r;
  const expr = String(face.svars[t.TargetMax] || t.TargetMax);
  if (!/xPaid|^X$/.test(expr)) return r;
  return {...r, xCibles: true, maxExpr: 'X', maxFace: face, ...(t.TargetMin === t.TargetMax ? {minX: true} : {})};
})(emplacementForge);

/* Un sort dont un emplacement de cible se compte en X ? */
function sortXCibles(effet) {
  const l = effet.modes ? [].concat(...effet.modes.options.map(o => o.cibles)) : effet.cibles || [];
  return l.some(sl => sl.xCibles);
}

/* Choisir X avant les cibles : au plus ce que le mana permet, et ce que les cibles légales offrent. */
function* choisitXAvant(P, j, s, d, cout0, nid) {
  const l = d.sort.modes ? [].concat(...d.sort.modes.options.map(o => o.cibles)) : d.sort.cibles;
  const offertes = Math.max(0, ...l.filter(sl => sl.xCibles).map(sl => ciblesLegales(P, sl, s, j, d.couleurs).length));
  const max = maxX(P, j, cout0), opts = Array.from({length: max + 1}, (_, i) => i);
  if (max === 0) return 0;
  const r = yield question(P, j, 'x', opts, {defaut: Math.min(max, offertes), source: nid});
  return opts[r] || 0;
}

/* —— Exiler des cartes bleues pour payer moins ————————————————————————— */

/* « As an additional cost, you may exile any number of blue cards from your hand » : le nombre, `Y`, n'est pas écrit ; la
   statique est acceptée, et chaque nombre possible devient une façon de lancer le sort. */
function exileFacultatif(t) { return t.Mode === 'RaiseCost' && t.ValidCard === 'Card.Self' && /^ExileFromHand<Y\/([^/>]+)\/[^>]*>$/.test(t.Cost || ''); }
hausseDeCout = (g => function (def) {
  const gardees = def.statiques;
  def.statiques = gardees.filter(s => !(s.s === 'forge' && exileFacultatif(s.t)));
  try { g(def); } finally { def.statiques = gardees; }
  const s = gardees.find(x => x.s === 'forge' && exileFacultatif(x.t));
  if (s) def.exileFacultatif = /^ExileFromHand<Y\/([^/>]+)\/[^>]*>$/.exec(s.t.Cost)[1];
})(hausseDeCout);
forgeSait('param', 'ReduceCost.Secondary', 'RaiseCost.Cost');

variantesEtendues = (g => function (P, j, o, depuis, essaie) {
  g(P, j, o, depuis, essaie);
  const f = o.def.exileFacultatif;
  if (!f || depuis !== 'main') return;
  const bleues = P.joueurs[j].main.filter(id => id !== o.id && forgeValideObjet(P, obj(P, id), f, o, j, {ctx: {cibles: [], memo: [], memoJ: []}, op: {}}, true)).length;
  for (let n = 1; n <= bleues; n++) {
    const c = coutForge(`ExileFromHand<${n}/${f}/blue cards>`);
    if (c) essaie('exile' + n, moinsMana(coutSort(P, j, o, depuis), {generique: 2 * n, couleurs: {}}), autresCout(c.cout));
  }
})(variantesEtendues);
