/* =====================================================================
   js/forgeZonesC.js — Chercher, creuser, déplacer : des paramètres de plus

   Lot F69, ce que demandaient cinquante et une cartes :
   - `DigUntil | Tapped$` (The Ring Goes South, Clifftop Lookout) : la carte
     trouvée arrive engagée ; `Dig | Attacking$` (Owlbear Cub, Winota) :
     elle arrive attaquante ; `SkipReorder$` n'y change rien (le moteur ne
     demande jamais l'ordre du reste) ;
   - `ChangeZone | WithTotalCMC$` (Protean Hulk, Lively Dirge) : autant de
     cartes qu'on veut, de valeur de mana totale bornée ;
     `RememberSearcher$` (Tempt with Discovery) retient celui qui a cherché ;
   - `ChangeZoneAll | AtEOT$ Sacrifice|Exile` : ce qui revient part à l'étape de
     fin ; `ExileFaceDown$` ;
   - `Manifest | DefinedPlayer$` (Reality Shift) : c'est ce joueur qui
     manifeste, de sa bibliothèque ;
   - `ConditionNotPresent$` pour tout effet : la condition contraire de
     `ConditionPresent$` (js/forgeChoixC.js la juge).
   ===================================================================== */

/* —— Creuser ————————————————————————————————————————————————————————— */

etendEffet('Dig', ['Attacking', 'SkipReorder'], null, function* (P, t, env, touches, nouveaux) {
  if (t.Attacking === 'True') nouveaux.forEach(o => entreAttaquant(P, o, env));
});

/* —— Chercher, avec une valeur de mana totale ———————————————————————— */

FORGE_API.ChangeZone.gen = (g => function* (P, t, env) {
  if (t.RememberSearcher !== 'True' && !t.WithTotalCMC) return yield* g(P, t, env);
  const j = t.DefinedPlayer ? forgeDefinis(P, t.DefinedPlayer, env).map(x => joueurDe(x))[0] : env.ctrl;
  if (j == null) return;
  if (!t.WithTotalCMC) { yield* g(P, t, env); retiensForge(env.ctx, {j}); return; }
  const dest = zoneForge(t.Destination);
  if (!dest) return;
  const zones = String(t.Origin || 'Library').split(',').map(z => ZONES_FORGE[z.trim()]).filter(Boolean);
  const ids = [].concat(...zones.map(z => P.joueurs[j][z].slice())).filter(id => !t.ChangeType || forgeValideObjet(P, obj(P, id), t.ChangeType, env.src, env.ctrl, env));
  const limite = forgeNombre(P, t.WithTotalCMC, env);
  /* La réponse par défaut : les plus chères qui tiennent. */
  const tri = ids.slice().sort((a, b) => mvDe(obj(P, b)) - mvDe(obj(P, a)));
  let somme = 0; const gloutons = [];
  tri.forEach(id => { if (somme + mvDe(obj(P, id)) <= limite) { somme += mvDe(obj(P, id)); gloutons.push(id); } });
  const r = ids.length ? yield question(P, j, 'cartes', ids, {min: 0, max: ids.length, multi: true, texte: `Choisir des cartes, de valeur de mana totale ${limite} au plus`,
    defaut: gloutons.map(id => ids.indexOf(id)), source: env.ctx.source}) : [];
  let total = 0;
  const pris = (Array.isArray(r) ? r : [r]).map(i => ids[i]).filter(x => x != null).filter(id => (total += mvDe(obj(P, id))) <= limite);
  const opts = {engage: t.Tapped === 'True', ctrl: t.GainControl === 'True' ? env.ctrl : null};
  for (const id of pris) {
    const n = yield* deplaceForge(P, obj(P, id), dest, env, opts);
    if (n != null && t.RememberChanged === 'True') retiensForge(env.ctx, n);
  }
  if (zones.includes('bibliotheque') && t.Shuffle !== 'False' && t.NoShuffle !== 'True') melangeHasard(P.rng, P.joueurs[j].bibliotheque);
  if (t.RememberSearcher === 'True') retiensForge(env.ctx, {j});
})(FORGE_API.ChangeZone.gen);
forgeSait('param', 'ChangeZone.WithTotalCMC', 'ChangeZone.RememberSearcher');

/* —— Tout déplacer, et le reprendre à l'étape de fin —————————————————— */

etendEffet('ChangeZoneAll', ['AtEOT', 'ExileFaceDown'], null, function* (P, t, env, touches, nouveaux) {
  if (t.AtEOT) finEtapeForge(nouveaux, t.AtEOT);
});
/* Seuls « sacrifice » et « exile » à l'étape de fin se jouent ; « exile at your next upkeep » (Rally the Ancestors) non. */
FORGE_API.ChangeZoneAll.prepare = (p => (t, op) => (!t.AtEOT || /^(Sacrifice|Exile)$/.test(t.AtEOT)) && (!p || p(t, op)))(FORGE_API.ChangeZoneAll.prepare);

/* —— Manifester la bibliothèque de qui l'on dit ————————————————————— */

FORGE_API.Manifest.gen = (g => function* (P, t, env) {
  if (!t.DefinedPlayer) return yield* g(P, t, env);
  for (const j of forgeDefinis(P, t.DefinedPlayer, env).map(x => joueurDe(x)).filter(x => x != null)) {
    const B = P.joueurs[j].bibliotheque;
    for (let k = forgeNombre(P, t.Amount || 1, env); k > 0 && B.length; k--) {
      const n = yield* manifeste(P, j, B[B.length - 1]);
      if (n != null && t.RememberManifested === 'True') retiensForge(env.ctx, n);
    }
  }
})(FORGE_API.Manifest.gen);
FORGE_API.Manifest.prepare = (p => (t, op) => t.DefinedPlayer ? true : (!p || p(t, op)))(FORGE_API.Manifest.prepare);
forgeSait('param', 'Manifest.DefinedPlayer', 'Play.ShowCards');

/* La condition contraire s'écrit pour tout effet : conditionForge() la juge. */
FORGE_COMMUNS.add('ConditionNotPresent');
forgeSait('param', 'ConditionNotPresent');
