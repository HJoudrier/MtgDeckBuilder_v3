/* =====================================================================
   js/forgeMarqueursC.js — Marqueurs et dés : des paramètres de plus

   Lot F77 :
   - `Amass | RememberAmass$` (Foray of Orcs, Grishnákh, Widespread Brutality) :
     l'armée qui a reçu les marqueurs se retient, pour « when you do, deal damage
     equal to the amassed Army's power » ;
   - `Connive | ConniveNum$`, `Explore | Num$` : N fois ;
   - `PutCounter | CounterNumPerDefined$` (Canopy Gargantuan) : autant de
     marqueurs sur chaque objet désigné ; `UpTo$` (Terra, Magical Adept) : au
     plus N, au choix ;
   - `RollDice | EvenOddResults$` (Clown Car) : chaque dé se lit à part, et les
     SVars `EvenResults` et `OddResults` donnent combien sont pairs et impairs.
   ===================================================================== */

FORGE_API.Amass.gen = (g => function* (P, t, env) {
  yield* g(P, t, env);
  if (t.RememberAmass === 'True') {
    const a = champDe(P, env.ctrl).find(o => car(P, o).sousTypes.includes('army'));
    if (a) retiensForge(env.ctx, a.id);
  }
})(FORGE_API.Amass.gen);
forgeSait('param', 'Amass.RememberAmass');

FORGE_API.Connive.gen = (g => function* (P, t, env) { yield* g(P, t.ConniveNum ? {...t, Num: t.ConniveNum} : t, env); })(FORGE_API.Connive.gen);
FORGE_API.Explore.gen = (g => function* (P, t, env) {
  for (let k = t.Num ? Math.min(forgeNombre(P, t.Num, env), 10) : 1; k > 0; k--) yield* g(P, t, env);
})(FORGE_API.Explore.gen);
forgeSait('param', 'Connive.ConniveNum', 'Explore.Num');

FORGE_API.PutCounter.gen = (g => function* (P, t, env) {
  let u = t;
  if (t.CounterNumPerDefined) u = {...u, CounterNum: t.CounterNumPerDefined};
  /* « Up to three lore counters » : on choisit de zéro à N. */
  if (t.UpTo === 'True') {
    const max = forgeNombre(P, u.CounterNum || 1, env), opts = Array.from({length: max + 1}, (_, i) => String(i));
    const i = yield* choisitUn(P, env.ctrl, opts, 'Combien de marqueurs ?', max, env.ctx.source);
    if (!i) return;
    u = {...u, CounterNum: String(i)};
  }
  yield* g(P, u, env);
})(FORGE_API.PutCounter.gen);
forgeSait('param', 'PutCounter.CounterNumPerDefined', 'PutCounter.UpTo');

FORGE_API.RollDice.gen = (g => function* (P, t, env) {
  if (t.EvenOddResults !== 'True') return yield* g(P, t, env);
  const faces = forgeNombre(P, t.Sides || 20, env), n = forgeNombre(P, t.Amount || 1, env);
  let pairs = 0, impairs = 0, total = forgeNombre(P, t.Modifier || 0, env);
  for (let k = 0; k < n; k++) { const r = 1 + entierHasard(P.rng, faces); total += r; if (r % 2) impairs++; else pairs++; }
  jn(P, `${P.joueurs[env.ctrl].nom} lance ${n} dé(s) : ${pairs} pair(s), ${impairs} impair(s)`);
  Object.assign(varsDe(env.ctx), {EvenResults: pairs, OddResults: impairs});
  if (t.ResultSVar) varsDe(env.ctx)[t.ResultSVar] = total;
  emet(P, {t: 'de', joueur: env.ctrl, n: total});
})(FORGE_API.RollDice.gen);
forgeSait('param', 'RollDice.EvenOddResults', 'RolledDie.ResolvedLimit');
