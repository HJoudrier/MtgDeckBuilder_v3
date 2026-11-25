/* =====================================================================
   js/forgeArtefactsB.js — Les artefacts d'EDHREC : coûts, joueurs, mots-clés

   Lot F106, suite de js/forgeArtefacts.js :
   - Norn's Annex : « unless their controller pays {W/P} for each of those
     creatures » — une taxe d'attaque en mana blanc ou en deux points de vie ;
   - Trinisphere : un sort coûte au moins trois mana (`SetCost | RaiseTo`) ;
   - Wedding Ring (`controlsArtifact.namedWedding Ring`), Blitzball Stadium
     (les sortes de marqueurs), Bounty Board, Zenith Chronicler, Unidentified
     Hovership : des joueurs désignés par rapport à une carte du déclencheur ;
   - Rammas Echor : l'exaltation accordée pour le tour ;
   - Darksteel Monolith : le coût de {0} d'un sort incolore, une fois par tour.
   ===================================================================== */

/* —— Attaquer en payant {W/P} —————————————————————————————————————————— */

function taxePhyrexienneAttaque(P, o, def) {
  let n = 0;
  for (const x of statiquesMode(P, 'CantAttackUnless')) {
    const t = x.s.t, env = envStatique(x.src, x.s);
    if (t.Cost !== 'WP' || !objetOuRien(P, o, t.ValidCard, x.src, env) || !defenseurVise(P, def, t.Target, x.src, env) || !conditionForge(P, t, env)) continue;
    n++;
  }
  return n;
}

/* Pour chaque attaquant taxé : du mana blanc si l'on en a, sinon deux points de vie ; qui ne paie pas n'attaque pas. */
paieTaxesAttaque = (g => function* (P, j, choisis) {
  yield* g(P, j, choisis);
  for (const [id, def] of [...choisis]) {
    const n = taxePhyrexienneAttaque(P, obj(P, id), def);
    for (let k = 0; k < n && choisis.has(id); k++) {
      const vide = coutManaVide(), blanc = {...vide, couleurs: {...vide.couleurs, W: 1}, total: 1};
      const peutMana = !!planPaiement(P, j, blanc, 0), peutVie = P.joueurs[j].vie > 2 && !payerVieInterdit(P, j);
      if (!peutMana && !peutVie) { choisis.delete(id); break; }
      const r = yield question(P, j, 'oui', ['non', 'oui'], {texte: `Payer {W/P} pour attaquer avec ${nomObj(P, id)} ?`, extra: {taxeAttaque: 1}});
      if (r !== 1) { choisis.delete(id); break; }
      if (peutMana && paieMana(P, j, blanc, 0)) continue;
      if (peutVie) payeVie(P, j, 2, false); else { choisis.delete(id); break; }
    }
  }
})(paieTaxesAttaque);

/* —— Un sort coûte au moins trois mana ———————————————————————————————— */

forgeStatique('SetCost', ['ValidCard', 'Type', 'Amount', 'RaiseTo'], () => {});
/* Trinisphere : le générique complète ce que le coût n'atteint pas ; le coût d'un sort à X compte X pour zéro. */
coutSort = (g => function (P, j, o, depuis, imprime) {
  const c = g(P, j, o, depuis, imprime);
  let plancher = 0;
  for (const x of statiquesMode(P, 'SetCost')) {
    const t = x.s.t, env = envStatique(x.src, x.s);
    if (t.RaiseTo !== 'True' || !/^\d+$/.test(t.Amount || '') || (t.Type && t.Type !== 'Spell') || !objetOuRien(P, o, t.ValidCard, x.src, env) || !conditionForge(P, t, env)) continue;
    plancher = Math.max(plancher, +t.Amount);
  }
  return c.total < plancher ? {...c, generique: c.generique + plancher - c.total, total: plancher} : c;
})(coutSort);

/* —— Des joueurs, des marqueurs ————————————————————————————————————— */

proprieteJoueurEtendue = (g => function (P, j, p, ctrl, env) {
  let m;
  /* `controlsArtifact.namedWedding Ring` : le joueur qui contrôle un artefact de ce nom. */
  if ((m = /^controls(\w+)\.named(.+)$/.exec(p))) return champDe(P, j).some(o => estType(o, m[1].toLowerCase()) && o.def.nom === m[2]);
  return g(P, j, p, ctrl, env);
})(proprieteJoueurEtendue);
forgeSait('filtre', 'controlsArtifact.namedWedding Ring');

exprEtendue = (g => function (P, tete, q, env) {
  /* Blitzball Stadium : « a card for each kind of counter on it ». */
  if (tete === 'Count' && q === 'DifferentCounterKinds_Card.Self') return env.src ? Object.values(env.src.marq || {}).filter(n => n > 0).length : 0;
  return g(P, tete, q, env);
})(exprEtendue);
forgeSait('expr', 'Count$DifferentCounterKinds');

definisEtendus = (g => function (P, v, env) {
  let m;
  /* Bounty Board : les adversaires du contrôleur de la créature qui meurt. */
  if ((m = /^Player\.OpponentOf (\w+)$/.exec(v))) {
    const base = forgeDefinis(P, m[1], env).map(x => joueurDe(x)).filter(j => j != null);
    return vivants(P).filter(J => base.length && !base.includes(J.i)).map(J => ({j: J.i}));
  }
  /* Zenith Chronicler : chacun des autres joueurs que celui dont la carte a déclenché. */
  if (v === 'NonTriggeredCardController') {
    const base = forgeDefinis(P, 'TriggeredCardController', env).map(x => joueurDe(x));
    return vivants(P).filter(J => !base.includes(J.i)).map(J => ({j: J.i}));
  }
  /* Unidentified Hovership : le joueur dont une carte est exilée par cette source. */
  if ((m = /^Player\.HasCardsInExile_(.+)_GE1$/.exec(v)))
    return vivants(P).filter(J => J.exil.some(id => forgeValideObjet(P, obj(P, id), m[1], env.src, env.ctrl, env))).map(J => ({j: J.i}));
  return g(P, v, env);
})(definisEtendus);
forgeSait('defini', 'Player.OpponentOf', 'NonTriggeredCardController', 'Player.HasCardsInExile_Card.ExiledWithSource_GE1');

/* —— L'exaltation, accordée pour le tour ———————————————————————————————— */

/* Rammas Echor : « creatures you control with defender gain exalted until end of turn » — le déclencheur de l'exaltation, compilé une fois. */
FORGE_API.PumpAll.gen = (g => function* (P, t, env) {
  const kw = String(t.KW || '').trim();
  if (kw !== 'Exalted') return yield* g(P, t, env);
  const tmp = {capacites: [], statiques: [], params: {}, mots: 0};
  if (!motCleTraine(tmp, 'Exalted', {...(env.face || {}), svars: {...((env.face || {}).svars || {})}}, [], 'Exalted', [])) return;
  const fd = finForge(t, env) || {fin: 'tour'};
  objetsZone(P, 'champ').filter(o => forgeValideObjet(P, o, t.ValidCards || 'Creature', env.src, env.ctrl, env))
    .forEach(o => { (o.anime = o.anime || []).push({fin: fd.fin, capacites: tmp.capacites}); P.ver++; });
})(FORGE_API.PumpAll.gen);
FORGE_API.PumpAll.prepare = (p => function (t, op) { return String(t.KW || '').trim() === 'Exalted' || !p || p.call(this, t, op); })(FORGE_API.PumpAll.prepare);
forgeSait('kwval', 'exalted');

/* —— Le coût de {0} d'un sort incolore ———————————————————————————————— */

/* Darksteel Monolith : `MayPlayAltManaCost$ 0` joue déjà ; seule la précision sur les zones est à lire. */
forgeSait('param', 'Continuous.MayPlayDontGrantZonePermissions');

/* —— Attaquer ceux qui nous ont attaqués ————————————————————————————— */

/* Weathered Sentinels : un défenseur peut attaquer les joueurs qui nous ont attaqués à leur dernier tour. On relève, pour chaque joueur, qui il a attaqué à son tour et à celui d'avant. */
noteHistorique = (g => function (P, e) {
  g(P, e);
  if (e.t !== 'attaquants') return;
  const J = P.joueurs[e.joueur];
  if (!J.atq || J.atq.tour !== P.tour) { J.atqPrec = J.atq || null; J.atq = {tour: P.tour, defs: []}; }
  (e.defs || []).forEach(d => { const j = defenseurDe(P, d); if (j != null && !J.atq.defs.includes(j)) J.atq.defs.push(j); });
})(noteHistorique);
proprieteJoueurEtendue = (g => function (P, j, p, ctrl, env) {
  if (p === 'attackedYouTheirLastTurn') { const J = P.joueurs[j], l = J.atq && J.atq.tour === P.tour ? J.atqPrec : J.atq; return !!l && l.defs.includes(ctrl); }
  return g(P, j, p, ctrl, env);
})(proprieteJoueurEtendue);
/* Un défenseur n'attaque que le joueur que la statique nomme ; sans `ValidAttacked`, tous. */
attaquePermise = (g => function (P, o, def) {
  if (!g(P, o, def) || !(car(P, o).mots & MOT.DEFENSEUR)) return g(P, o, def);
  const d = defenseurDe(P, def);
  return !!statiqueQui(P, 'CanAttackDefender', (t, src, env) => objetOuRien(P, o, t.ValidCard, src, env) &&
    (!t.ValidAttacked || (d != null && forgeValideJoueur(P, d, t.ValidAttacked, src.ctrl, env))));
})(attaquePermise);
forgeSait('param', 'CanAttackDefender.ValidAttacked');
forgeSait('filtre', 'attackedYouTheirLastTurn');
