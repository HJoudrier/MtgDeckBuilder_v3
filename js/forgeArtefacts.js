/* =====================================================================
   js/forgeArtefacts.js — Les artefacts d'EDHREC

   Lot F106. Ce que les artefacts qui n'étaient pas jouables entièrement
   demandaient, un mécanisme chacun :
   - Whip of Erebos : la créature revenue s'exile si elle quitte le champ
     (`Animate | LeaveBattlefield`) ; Vorpal Sword : `sVars` n'est qu'un
     indice pour l'IA ;
   - Teferi's Puzzle Box : `ChangeZoneAll | DefinedPlayer` (js/forgeRituelsB.js) ;
   - The Skullspore Nexus : la force totale du lot de créatures mortes ;
   - Aligned Hedron Network : un exil de toutes les créatures « jusqu'à ce que
     la source parte » (`ChangeZoneAll | Duration`) ;
   - Sarevok's Tome : `Count$Initiative.2.1` ;
   - Hope of Ghirapur : le joueur blessé en combat par cette source ;
   - Iron Mastiff : les joueurs attaqués ; Tangle Wire : `Tap | Tapper` ;
   - Darksteel Angel : `CantPutCounter`.
   ===================================================================== */

/* —— Une créature revenue que l'exil remplace ———————————————————————————— */

forgeSait('param', 'Animate.LeaveBattlefield', 'Animate.sVars', 'Tap.Tapper');
FORGE_API.Animate.gen = (g => function* (P, t, env) {
  yield* g(P, t, env);
  if (t.LeaveBattlefield === 'Exile') objetsForge(P, t, env).filter(o => o && o.j == null && o.zone === 'champ').forEach(o => { o.exilSiQuitte = true; });
})(FORGE_API.Animate.gen);

/* —— Ce que le lot d'un déclencheur pèse ————————————————————————————————— */

exprEtendue = (g => function (P, tete, q, env) {
  /* « Create a token with power equal to the total power of those creatures » : la force qu'elles avaient en mourant. */
  if (tete === 'TriggerObjectsCards' && q === 'CardPower') {
    const l = lotDe(env);
    return l ? objetsDeIds(P, l.ids).reduce((s, o) => s + caracForge(P, o, 'CardPower'), 0) : 0;
  }
  /* `Count$Initiative.2.1` : deux si l'on a l'initiative, un sinon. */
  if (tete === 'Count' && /^Initiative\./.test(q)) return siSinon(P, q, P.initiative === env.ctrl, env);
  return g(P, tete, q, env);
})(exprEtendue);
forgeSait('expr', 'TriggerObjectsCards$CardPower', 'Count$Initiative');

/* —— Exiler jusqu'à ce que la source parte ——————————————————————————————— */

FORGE_API.ChangeZoneAll.gen = (g => function* (P, t, env) {
  if (t.Duration !== 'UntilHostLeavesPlay' || t.Destination !== 'Exile') return yield* g(P, t, env);
  /* Si la source est déjà partie, rien n'est exilé (règle 610.3c). */
  if (!env.src || env.src.lki || env.src.zone !== 'champ') return;
  const avant = new Set([].concat(...P.joueurs.map(J => J.exil)));
  yield* g(P, t, env);
  const exiles = [].concat(...P.joueurs.map(J => J.exil)).filter(id => !avant.has(id));
  if (exiles.length) durees(P).retours.push({hote: env.src.id, ids: exiles});
})(FORGE_API.ChangeZoneAll.gen);
FORGE_API.ChangeZoneAll.prepare = (p => function (t, op) { return !p || p.call(this, t.Duration === 'UntilHostLeavesPlay' ? {...t, Duration: undefined} : t, op); })(FORGE_API.ChangeZoneAll.prepare);
forgeSait('param', 'ChangeZoneAll.Duration');

/* —— Des joueurs, par ce qui leur est arrivé —————————————————————————— */

/* Hope of Ghirapur : le joueur que cette source a blessé en combat, ce tour. */
proprieteJoueurEtendue = (g => function (P, j, p, ctrl, env) {
  if (p === 'wasDealtCombatDamageThisTurnBySource') return !!env && !!env.src && ((histoire(P).degatsCombatPar || {})[j] || []).includes(env.src.id);
  return g(P, j, p, ctrl, env);
})(proprieteJoueurEtendue);
forgeSait('filtre', 'wasDealtCombatDamageThisTurnBySource');

/* Iron Mastiff : combien d'adversaires sont attaqués — ceux qui font face à un attaquant. */
aProprieteJoueur = (g => function (P, j, prop, env) {
  if (prop === 'Defending') return !!P.combat && [...P.combat.attaquants.values()].some(d => d && d.j === j);
  return g(P, j, prop, env);
})(aProprieteJoueur);
forgeSait('expr', 'PlayerCountOpponents$HasPropertyDefending');

/* —— Aucun marqueur de ce genre ———————————————————————————————————— */

/* Darksteel Angel : « creatures you control can't have -1/-1 counters put on them ». */
forgeStatique('CantPutCounter', ['ValidCard', 'CounterType'], () => {});
poseMarqueurs = (g => function (P, o, genre, n, src) {
  if (o && n > 0 && statiqueQui(P, 'CantPutCounter', (t, s, env) => objetOuRien(P, o, t.ValidCard, s, env) && (!t.CounterType || genreMarqueur(t.CounterType) === genre))) return 0;
  return g(P, o, genre, n, src);
})(poseMarqueurs);
