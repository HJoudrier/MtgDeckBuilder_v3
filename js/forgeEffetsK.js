/* =====================================================================
   js/forgeEffetsK.js — Des effets de plus (lot F80)

   - `ProtectionAll | Gains$ TargetedCardColor` (Éowyn, Fearless Knight) :
     la protection porte les couleurs de la carte visée plus haut dans la
     chaîne — celle que l'effet vient d'exiler, lue par son instantané.
   ===================================================================== */

/* Les couleurs de la première carte visée de la chaîne, vivante ou son instantané. */
function couleursDeLaCible(P, env) {
  const id = ((env.ctx.cibles || [])[0] || [])[0];
  const o = typeof id === 'number' ? obj(P, id) || P.lkis.get(id) : null;
  return o ? (o.lki ? o.couleurs : car(P, o).couleurs) : [];
}

gainsProtection = (g => function (t) { return t.Gains === 'TargetedCardColor' || g(t); })(gainsProtection);
couleursProtection = (g => function* (P, t, env) {
  if (t.Gains === 'TargetedCardColor') return couleursDeLaCible(P, env);
  return yield* g(P, t, env);
})(couleursProtection);
