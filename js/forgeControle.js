/* =====================================================================
   js/forgeControle.js — Diriger le tour d'un autre joueur

   Lot F100. « You control target player during that player's next turn »
   (Sorin Markov, Mindslaver, Emrakul, the Promised End). Pendant ce tour,
   chaque question posée au joueur visé est posée à celui qui le dirige :
   `question()` y met son nom, et tout le reste suit — les agents, l'écran,
   le journal. La partie ne retient que ce qu'il faut : qui dirige qui, et
   quand (`P.controles`).

   Simplifications : les questions viennent avec les options du joueur
   dirigé, et un automate qui dirige les juge avec ses propres yeux, pas
   ceux de sa victime ; la vue de la main du joueur dirigé n'est pas ouverte
   à celui qui le dirige.
   ===================================================================== */

forgeEffet('ControlPlayer', [], function* (P, t, env) {
  for (const j of joueursForge(P, t, env)) {
    if (j === env.ctrl) continue;
    (P.controles = P.controles || []).push({cible: j, par: env.ctrl, depuis: P.tour, vu: false});
    jn(P, `${P.joueurs[env.ctrl].nom} dirigera le prochain tour de ${P.joueurs[j].nom}`);
  }
}, (t, op) => { op.op = 'forge'; op.hostile = true; }, {prepare: t => !t.Controller && !t.Combat && !t.Condition});

/* Qui dirige ce joueur en ce moment ? Le contrôle commence au tour suivant du joueur visé, et finit avec lui. */
function directeurDe(P, j) {
  if (!P.controles || !P.controles.length) return null;
  P.controles = P.controles.filter(c => !(c.vu && P.actif !== c.cible) && !P.joueurs[c.par].elimine);
  const c = P.controles.find(x => x.cible === j && P.actif === j && P.tour > x.depuis);
  if (c) c.vu = true;
  return c ? c.par : null;
}

question = (g => function (P, j, q, options, x) {
  const r = g(P, j, q, options, x), d = directeurDe(P, j);
  if (d != null && d !== j) { r.joueur = d; r.dirigeDe = j; }
  return r;
})(question);
