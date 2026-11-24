/* =====================================================================
   js/forgeEffetsN.js — Des paramètres d'effets de plus

   Lot F84 :
   - `PutCounterAll | ValidCards2$ / CounterType2$ / CounterNum2$` (Ajani
     Steadfast, Brokers Ascendancy, Filigree Vector) : une seconde paire,
     « a +1/+1 counter on each creature you control and a loyalty counter on
     each other planeswalker » ;
   - `ChangeZone | DestinationAlternative$` (Dina's Guidance, Emeria Shepherd) :
     « into your hand or graveyard », « onto the battlefield instead if it's
     a Plains ». Le joueur choisit la destination avant la recherche ;
     `DestAltSVar$` dit si l'autre destination est offerte. Un automate garde
     la première, qui est la plus prudente.
   ===================================================================== */

FORGE_API.PutCounterAll.gen = (g => function* (P, t, env) {
  yield* g(P, t, env);
  if (t.ValidCards2 || t.CounterType2) yield* g(P, {...t, ValidCards: t.ValidCards2, CounterType: t.CounterType2 || t.CounterType, CounterNum: t.CounterNum2 || t.CounterNum}, env);
})(FORGE_API.PutCounterAll.gen);
forgeSait('param', 'PutCounterAll.ValidCards2', 'PutCounterAll.CounterType2', 'PutCounterAll.CounterNum2');

FORGE_API.ChangeZone.gen = (g => function* (P, t, env) {
  if (t.DestinationAlternative && (!t.DestAltSVar || forgeNombre(P, t.DestAltSVar, env) > 0)) {
    const noms = {Hand: 'la main', Graveyard: 'le cimetière', Battlefield: 'le champ de bataille', Exile: 'l\'exil', Library: 'la bibliothèque'};
    const r = yield question(P, env.ctrl, 'oui', ['non', 'oui'], {texte: `Plutôt ${noms[t.DestinationAlternative] || t.DestinationAlternative} que ${noms[t.Destination] || t.Destination} ?`, source: env.ctx.source});
    if (r === 1) return yield* g(P, {...t, Destination: t.DestinationAlternative, DestinationAlternative: undefined}, env);
  }
  return yield* g(P, t, env);
})(FORGE_API.ChangeZone.gen);
forgeSait('param', 'ChangeZone.DestinationAlternative', 'ChangeZone.DestAltSVar');
