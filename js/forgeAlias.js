/* =====================================================================
   js/forgeAlias.js — Ce que Forge a tiré de « Pump »

   Le 15 novembre 2026 (commit 50b6a8f), Forge a renommé les « Pump » qui
   n'étaient pas des pompes, en quatre effets :
   - `TargetOnly` : choisir des cibles que la suite lit (Stump Stomp :
     « target creature you control deals damage… ») ;
   - `Bookkeeping` : retenir, oublier, imprimer, sans toucher au jeu ;
   - `EndOfTurn` : « at the beginning of the next end step, sacrifice it » ;
   - `Nothing` : un nom de mode, un `UnlessCost$`, une condition, l'effet
     vrai étant dans la suite.
   Ces scripts se jouaient hier sous le nom de Pump : on les rejoue par le
   même chemin, enveloppes comprises (la tenue de compte, js/forgeEmpreinte.js ;
   `AtEOT$`, js/forgeEffetsF.js). Ce fichier se charge après tous les autres
   `forge*.js`, pour que Pump soit complet quand on le recopie.

   Rien de ce qui pompe n'est gardé : Forge n'en lit rien dans ces effets.
   Les paramètres de tenue de compte que Pump ne lisait pas (`RememberAll$`,
   `NoteCards$`…) restent inconnus, et la carte qui en dépend partielle.
   ===================================================================== */

const API_TIREES_DE_PUMP = ['TargetOnly', 'Bookkeeping', 'EndOfTurn', 'Nothing'];

/* La pompe de Pump ne fait rien pour ces effets : sans quoi chaque cible
   porterait un bonus vide jusqu'à la fin du tour. */
pompeForge = (g => function (P, objets, t, env) { if (!t.sansPompe) g(P, objets, t, env); })(pompeForge);

API_TIREES_DE_PUMP.forEach(nom => {
  const pump = FORGE_API.Pump;
  FORGE_API[nom] = {...pump,
    gen: function* (P, t, env) { yield* FORGE_API.Pump.gen(P, {...t, NumAtt: undefined, NumDef: undefined, KW: undefined, KWChoice: undefined, sansPompe: true}, env); },
    /* Un `IsCurse$` dit à l'IA que la cible est un adversaire. */
    ia: (t, op) => { pump.ia({...t, NumAtt: undefined, NumDef: undefined, KW: undefined}, op); if (t.IsCurse === 'True') op.hostile = true; }};
  forgeSait('api', nom);
  forgeSait('param', ...[...FORGE_SAIT.param].filter(p => p.startsWith('Pump.')).map(p => nom + p.slice(4)));
});
API_TIREES_DE_PUMP.filter(n => n !== 'EndOfTurn').forEach(n => API_ENTREE.add(n));

/* « Return all creature cards of the chosen type » (Patriarch's Bidding) :
   retenir chaque carte de la zone, le champ par défaut, qui répond au
   filtre. Forge l'écrivait `PumpAll | RememberPumped$` (js/forgeMemoire.js). */
FORGE_API.Bookkeeping.gen = (g => function* (P, t, env) {
  if (t.RememberAll) {
    String(t.RememberZone || 'Battlefield').split(',').map(z => ZONES_FORGE[z.trim()]).filter(Boolean).forEach(zone =>
      objetsZone(P, zone).filter(o => forgeValideObjet(P, o, t.RememberAll, env.src, env.ctrl, env)).forEach(o => retiensForge(env.ctx, o.id)));
  }
  yield* g(P, t, env);
})(FORGE_API.Bookkeeping.gen);
FORGE_API.Bookkeeping.prepare = (p => function (t, op) {
  return (!t.RememberZone || String(t.RememberZone).split(',').every(z => ZONES_FORGE[z.trim()])) && (!p || p.call(this, t, op));
})(FORGE_API.Bookkeeping.prepare);
forgeSait('param', 'Bookkeeping.RememberAll', 'Bookkeeping.RememberZone');
