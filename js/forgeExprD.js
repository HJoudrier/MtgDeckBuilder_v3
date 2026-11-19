/* =====================================================================
   js/forgeExprD.js — Des quantités sur les joueurs

   Lot F72. « The greatest life lost by a player this turn », « the number of
   opponents who drew two or more cards », « the dungeons you've completed » :
   `PlayerCount<qui>$<quoi>` compte ou somme une propriété sur un groupe de
   joueurs, et `TargetedController$…`, `TriggeredDefendingPlayer$…`,
   `TriggeredTarget$…` la lisent chez un joueur désigné.

   Le groupe (`<qui>`) : tous (`Players`), les adversaires (`Opponents`,
   `RegisteredOpponents`), les joueurs retenus (`Remembered`), leurs
   propriétaires (`RememberedOwner`), ceux que désigne `Defined<…>` (`Registered` :
   tous), ou le contrôleur seul (`PropertyYou`).
   La quantité (`<quoi>`) : `LifeLostThisTurn`, `HighestLifeLostThisTurn`,
   `LifeTotal`, `CardsIn…`, `CardsDrawn`, `Counters.Poison`, `Amount`,
   `HasProperty<propriété> [GE1]` (combien de joueurs l'ont), `ConditionGE2 <quoi>`
   (combien ont au moins deux).
   ===================================================================== */

/* —— Ce qu'on lit chez un joueur ———————————————————————————————————— */

quantiteJoueur = (g => function (P, j, q) {
  if (j == null) return 0;
  const J = P.joueurs[j];
  switch (q) {
    case 'LifeLostThisTurn': return histoire(P).perdu[j] || 0;
    case 'CardsDrawn': return J.piochesTour || 0;
    case 'RingTemptedYou': return J.anneau || 0;
    case 'LandsPlayed': return J.terrainsJoues || 0;
    case 'SacrificedThisTurn': return histoire(P).sacrifies[j] || 0;
  }
  return g(P, j, q);
})(quantiteJoueur);

/* Un joueur a-t-il cette propriété ? (`HasProperty<propriété>`) */
function aProprieteJoueur(P, j, prop, env) {
  const J = P.joueurs[j], ctrl = env.ctrl, h = histoire(P);
  let m;
  if (prop === 'LostLifeThisTurn') return (h.perdu[j] || 0) > 0;
  if (prop === 'isMonarch') return P.monarque === j;
  if (prop === 'Active') return P.actif === j;
  if (prop === 'controlsCreature') return champDe(P, j).some(estCreature);
  if (prop === 'withMoreCreaturesThanYou') return champDe(P, j).filter(estCreature).length > champDe(P, ctrl).filter(estCreature).length;
  if (prop === 'hasFewerCreaturesInPlayThanYou') return champDe(P, j).filter(estCreature).length < champDe(P, ctrl).filter(estCreature).length;
  if (prop === 'wasDealtCombatDamageThisTurn') return ((h.degatsCombatPar || {})[j] || []).length > 0;
  if (prop === 'IsRememberedOrController') return ((env.ctx || {}).memoJ || []).includes(j) || j === ctrl;
  /* `wasDealtCombatDamageThisTurnBy Zombie GE1` : par combien de sources de ce genre. */
  if ((m = /^wasDealtCombatDamageThisTurnBy (\S+) (GE|LE|GT|LT|EQ|NE)(\d+)$/.exec(prop))) {
    const n = ((h.degatsCombatPar || {})[j] || []).filter(id => { const o = obj(P, id) || P.lkis.get(id); return o && forgeValideObjet(P, o, m[1], env.src, ctrl, env, true); }).length;
    return compareForge(n, m[2], +m[3]);
  }
  return null;
}

/* —— Un groupe de joueurs —————————————————————————————————————————— */

function groupeJoueurs(P, qui, env) {
  const ctrl = env.ctrl, ctx = env.ctx || {};
  if (qui === 'Players' || qui === '') return vivants(P).map(J => J.i);
  if (qui === 'Opponents' || qui === 'RegisteredOpponents') return adversaires(P, ctrl);
  if (qui === 'PropertyYou') return [ctrl];
  if (qui === 'Remembered') return [...(ctx.memoJ || [])];
  if (qui === 'RememberedOwner') return [...new Set((ctx.memo || []).map(id => passeOuPresent(P, id)).filter(Boolean).map(o => o.prop))];
  if (/^Defined/.test(qui)) {
    const d = qui.slice(7);
    if (d === 'Registered') return vivants(P).map(J => J.i);
    return forgeDefinis(P, d.replace(/^Triggered/, 'Triggered'), env).map(x => joueurDe(x)).filter(x => x != null);
  }
  return null;
}

/* La quantité d'un groupe : `undefined` si l'on ne la sait pas lire. */
function quantiteGroupe(P, qui, q, env) {
  const J = groupeJoueurs(P, qui, env);
  if (J == null) return undefined;
  let m;
  const max = f => Math.max(0, ...J.map(f)), min = f => Math.min(...J.map(f));
  if (q === 'Amount') return J.length;
  if (q === 'HighestLifeLostThisTurn') return max(j => quantiteJoueur(P, j, 'LifeLostThisTurn'));
  if (q === 'LowestLifeTotal') return J.length ? min(j => P.joueurs[j].vie) : 0;
  if (/^(LifeLostThisTurn|LifeTotal|CardsInHand|CardsInLibrary|CardsInGraveyard|CardsDrawn|RingTemptedYou|LandsPlayed|SacrificedThisTurn)$/.test(q)) return J.reduce((s, j) => s + quantiteJoueur(P, j, q), 0);
  if ((m = /^Counters\.(\w+)$/.exec(q))) return J.reduce((s, j) => s + quantiteJoueur(P, j, q), 0);
  if (q === 'OpponentsAttackedThisCombat') return new Set(J.flatMap(j => ((histoire(P).attaques || {})[j] || []))).size;
  if (q === 'NonCombatDamageDealtThisTurn') return J.reduce((s, j) => s + ((histoire(P).degatsHorsCombat || {})[j] || 0), 0);
  /* `HasPropertyLostLifeThisTurn`, `HasPropertywasDealtCombatDamageThisTurnBy Zombie GE1` : combien de joueurs. */
  if ((m = /^HasProperty(.+)$/.exec(q)) && !/^HasCardsIn/.test(m[1])) {
    let r = true;
    const n = J.filter(j => { const v = aProprieteJoueur(P, j, m[1], env); if (v === null) r = false; return v; }).length;
    return r ? n : undefined;
  }
  /* `ConditionGE2 CardsDrawn` : combien de joueurs ont au moins deux cartes piochées. */
  if ((m = /^Condition(GE|LE|GT|LT|EQ|NE)(\d+) (.+)$/.exec(q))) {
    const ok = J.filter(j => compareForge(quantiteJoueur(P, j, m[3]), m[1], +m[2])).length;
    return ok;
  }
  return undefined;
}

/* —— Le branchement ——————————————————————————————————————————————— */

exprEtendue = (g => function (P, tete, q, env) {
  const ctx = env.ctx || {}, evt = ctx.evt || {};
  let m;
  if ((m = /^PlayerCount(Players|Opponents|RegisteredOpponents|Remembered|RememberedOwner|PropertyYou|Defined\w+)?$/.exec(tete))) {
    const r = quantiteGroupe(P, m[1] || '', q, env);
    if (r !== undefined) return r;
  }
  if (tete === 'DungeonsCompleted' && q === 'Amount') return P.joueurs[env.ctrl].donjonsFinis || 0;
  /* Un joueur désigné : le contrôleur de la cible, le défenseur, la cible du déclencheur. */
  const joueurDesigne = {
    TargetedController: () => { const o = cibleForge(P, env, false); return o && o.j == null ? o.ctrl : o && o.j != null ? o.j : null; },
    TriggeredDefendingPlayer: () => { const d = evt.defenseur; return d && (d.j != null ? d.j : obj(P, d.pw) ? obj(P, d.pw).ctrl : null); },
    TriggeredTarget: () => evt.joueur
  }[tete];
  if (joueurDesigne) {
    const j = joueurDesigne();
    if (/^(LifeLostThisTurn|CardsDrawn|CardsInHand|CardsInLibrary|CardsInGraveyard|LifeTotal)$/.test(q) || /^Counters\.\w+$/.test(q)) return j == null ? 0 : quantiteJoueur(P, j, q);
  }
  /* « Target player draws X cards, where X is the number of creatures you control » : les filtres sont ceux de qui juge. */
  if ((tete === 'TargetedPlayer' || tete === 'TargetedController' || tete === 'TriggeredPlayer') && /^Valid(Graveyard|Hand|Exile|Library)? /.test(q)) return forgeExpression(P, 'Count$' + q, env, 1);
  if (tete === 'Count') {
    if (q === 'LifeYouLostThisTurn') return histoire(P).perdu[env.ctrl] || 0;
    if (q === 'MaxOppDamageThisTurn') return Math.max(0, ...adversaires(P, env.ctrl).map(i => (histoire(P).degatsRecus || {})[i] || 0));
    if (q === 'NonCombatDamageThisTurn') return (histoire(P).degatsHorsCombat || {})[env.ctrl] || 0;
    if (q === 'YourStartingLife') return P.joueurs[env.ctrl].vieDepart || 20;
  }
  return g(P, tete, q, env);
})(exprEtendue);

forgeSait('expr', 'DungeonsCompleted$Amount', 'TargetedController$Counters', 'TargetedController$CardsInHand', 'TriggeredDefendingPlayer$CardsInHand',
  'TriggeredDefendingPlayer$CardsInLibrary', 'TriggeredTarget$Counters', 'TriggeredTarget$CardsInHand', 'TriggeredTarget$LifeLostThisTurn',
  'TargetedPlayer$LifeLostThisTurn', 'TargetedPlayer$CardsDrawn', 'TargetedPlayer$Valid', 'TargetedPlayer$ValidGraveyard',
  'Count$LifeYouLostThisTurn', 'Count$MaxOppDamageThisTurn', 'Count$NonCombatDamageThisTurn', 'Count$YourStartingLife',
  ...['Players', 'Opponents', 'RegisteredOpponents', 'Remembered', 'RememberedOwner', 'PropertyYou', 'DefinedRegistered', 'DefinedTriggeredPlayer',
    'DefinedTriggeredAttackedTarget', 'DefinedTriggeredSourceController', 'DefinedTriggeredSourceController', ''].flatMap(w =>
    ['HighestLifeLostThisTurn', 'LifeLostThisTurn', 'LifeTotal', 'LowestLifeTotal', 'CardsInLibrary', 'CardsDrawn', 'Amount', 'RingTemptedYou', 'LandsPlayed',
      'SacrificedThisTurn', 'OpponentsAttackedThisCombat', 'NonCombatDamageDealtThisTurn'].map(q => 'PlayerCount' + w + '$' + q)),
  ...['Players', 'Opponents', 'RegisteredOpponents', 'DefinedRegistered', 'DefinedTriggeredPlayer', 'PropertyYou', ''].flatMap(w => ['HasPropertyLostLifeThisTurn', 'HasPropertyisMonarch',
    'HasPropertyActive', 'HasPropertycontrolsCreature', 'HasPropertywithMoreCreaturesThanYou', 'HasPropertyhasFewerCreaturesInPlayThanYou', 'HasPropertywasDealtCombatDamageThisTurn',
    'HasPropertyIsRememberedOrController', 'HasPropertywasDealtCombatDamageThisTurnBy', 'ConditionGE2', 'ConditionGE', 'ConditionLE'].map(q => 'PlayerCount' + w + '$' + q)));
