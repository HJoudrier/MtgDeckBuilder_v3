/* =====================================================================
   js/forgeClones.js — Un clone qui garde les marqueurs de son modèle

   Lot F102. Dominion Saboteur : « you may have this creature enter as a
   copy of any artifact or creature on the battlefield, except it isn't
   legendary. If you do, it enters with additional counters on it equal to
   the same number and kinds of counters the copied permanent has on it. »
   - `Clone | RememberCloneOrigin` retient le permanent copié ;
   - `PutCounter | CounterType$ EachFromSource | EachFromSource$ Remembered`
     pose sur la cible un marqueur de chaque sorte, autant que la source en a.
   ===================================================================== */

/* Le modèle choisi, gardé pour la suite de l'effet. */
aCopier = (g => function* (P, t, env) {
  const r = yield* g(P, t, env);
  env.ctx.cloneOrigine = r && r[0] ? r[0].id : null;
  return r;
})(aCopier);
FORGE_API.Clone.gen = (g => function* (P, t, env) {
  env.ctx.cloneOrigine = null;
  yield* g(P, t, env);
  if (t.RememberCloneOrigin === 'True' && env.ctx.cloneOrigine != null) retiensForge(env.ctx, env.ctx.cloneOrigine);
})(FORGE_API.Clone.gen);
forgeSait('param', 'Clone.RememberCloneOrigin', 'PutCounter.EachFromSource');

FORGE_API.PutCounter.gen = (g => function* (P, t, env) {
  if (t.CounterType !== 'EachFromSource') return yield* g(P, t, env);
  const sources = forgeDefinis(P, t.EachFromSource || 'Remembered', env).filter(x => x && x.j == null);
  const cibles = env.op.slot != null ? ciblesForge(P, env, false) : forgeDefinis(P, t.Defined || 'Self', env);
  for (const c of cibles.filter(x => x && x.j == null && !x.lki && x.zone === 'champ')) {
    for (const s of sources) for (const [genre, n] of Object.entries(s.marq || {})) if (n > 0 && s.id !== c.id) poseMarqueurs(P, c, genre, n, env.src);
  }
})(FORGE_API.PutCounter.gen);
