/* =====================================================================
   js/forgeDephasage.js — Le phasing : hors du champ sans le quitter

   Un permanent déphasé ne quitte pas le champ (ni départ ni entrée) ; il
   attend dans `P.horsPhase`. js/forgeEnchantementsG.js y ajoute les
   entrées qui restent dehors ou dépendent d'un hôte.
   ===================================================================== */

/* Le phasing : hors du champ sans le quitter — ni départ ni entrée — et
   de retour au prochain dégagement de son contrôleur. */
forgeEffet('Phases', ['AllValid'], function* (P, t, env) {
  const l = t.AllValid ? objetsZone(P, 'champ').filter(o => forgeValideObjet(P, o, t.AllValid, env.src, env.ctrl, env)) : objetsForge(P, t, env, 'Targeted');
  for (const o of l.filter(x => x.zone === 'champ' && !x.lki)) {
    const avec = [o, ...P.champ.map(id => obj(P, id)).filter(a => a.att === o.id)];
    avec.forEach(a => {
      retireDe(P.champ, a.id);
      P.horsPhase = P.horsPhase || [];
      if (!P.horsPhase.some(x => x.id === a.id)) P.horsPhase.push({id: a.id, ctrl: a.ctrl});
    });
    P.ver++;
  }
}, (t, op) => { op.op = 'exile'; op.a = op.slot != null ? {cible: op.slot} : {soi: 1}; op.hostile = op.slot != null; }, {prepare: t => !t.PhaseInOrOut && !t.WontPhaseInNormal});
function phasesEntrent(P) {
  if (!P.horsPhase || !P.horsPhase.length) return;
  /* Un permanent revient une fois, et seulement s'il n'est pas déjà là. */
  P.horsPhase.filter(x => x.ctrl === P.actif).forEach(x => { if (obj(P, x.id) && !P.champ.includes(x.id)) P.champ.push(x.id); });
  P.horsPhase = P.horsPhase.filter(x => x.ctrl !== P.actif);
  P.ver++;
}
