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

/* Evolve : la créature qui entre est plus forte ou plus robuste, un marqueur +1/+1 — et la source « évolue »
   (`Evolved`, js/forgeDeclencheursF.js). */
forgeEffet('EvolveCounter', [], function* (P, t, env) {
  const s = env.src;
  if (!s || s.zone !== 'champ' || forgeNombre(P, 'Count$EvolveTest', env) < 1) return;
  poseMarqueurs(P, s, '+1/+1', 1, s);
  emet(P, {t: 'evolue', id: s.id});
}, (t, op) => { op.op = 'forge'; op.hostile = false; });

/* « Dig » sans regarder les cartes : rien à décider pour le joueur, le moteur ne les lui montre jamais. */
forgeSait('param', 'Dig.NoLooking');
