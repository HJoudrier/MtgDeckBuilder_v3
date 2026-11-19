/* =====================================================================
   js/forgeEffetsJ.js — Des effets durables : un nombre retenu

   Lot F78. `Effect | SetChosenNumber$ X` (Communal Brewing, Mutated Cultist,
   Torgal, Nahiri's Lithoforming) : l'effet que la carte pose retient un
   nombre, que `Count$ChosenNumber` lit plus tard — « enters with X additional
   counters », « the next spell costs {1} less for each ». Le nombre se range
   avec le choix de la carte hôte (`choixDe()`), comme celui de ChooseNumber.
   ===================================================================== */

FORGE_API.Effect.gen = (g => function* (P, t, env) {
  if (t.SetChosenNumber != null && env.src) choixDe(P, env.src).nombre = forgeNombre(P, t.SetChosenNumber, env);
  yield* g(P, t, env);
})(FORGE_API.Effect.gen);
forgeSait('param', 'Effect.SetChosenNumber');
