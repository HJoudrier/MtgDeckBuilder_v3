/* =====================================================================
   js/forgeRadiation.js — Les marqueurs de radiation

   « Radiation » (règle 727) : au début de sa phase principale d'avant le
   combat, un joueur qui a des marqueurs de radiation met autant de cartes
   de sa bibliothèque au cimetière ; pour chaque carte qui n'est pas un
   terrain, il perd 1 vie et retire un marqueur. L'effet `Radiation` en
   donne ; les marqueurs vivent avec les autres marqueurs de joueur
   (`J.marqueurs.rad`, que lit `Count$YourCountersRad`).
   ===================================================================== */

forgeEffet('Radiation', ['Num'], function* (P, t, env) {
  const n = forgeNombre(P, t.Num || 1, env);
  if (n <= 0) return;
  for (const j of joueursForge(P, t, env)) {
    const J = P.joueurs[j];
    (J.marqueurs = J.marqueurs || {}).rad = (J.marqueurs.rad || 0) + n;
    P.ver++;
  }
}, (t, op) => { op.op = 'forge'; op.hostile = !/^(You|Self)$/.test(t.Defined || '') && !!t.ValidTgts; });

/* Le début de la phase principale du joueur actif : la radiation, puis le reste. */
paradigmesDebutPrincipale = (g => function* (P) {
  const j = P.actif, J = P.joueurs[j], n = (J.marqueurs || {}).rad || 0;
  if (n > 0 && !J.elimine) {
    let non = 0;
    for (let k = 0; k < n && J.bibliotheque.length; k++) {
      const id = J.bibliotheque[J.bibliotheque.length - 1], o = obj(P, id);
      if (!estType(o, 'land')) non++;
      deplace(P, id, 'cimetiere', {meule: true});
    }
    if (non > 0) {
      const k = vieReduite(P, j, non, false);
      if (k > 0) { J.vie -= k; emet(P, {t: 'perteVie', joueur: j, n: k}); }
      J.marqueurs.rad = Math.max(0, n - non);
    }
    jn(P, `${J.nom} subit la radiation : ${non} carte(s) sans être un terrain`);
    P.ver++;
  }
  yield* g(P);
})(paradigmesDebutPrincipale);

forgeSait('param', 'Radiation.Num');
