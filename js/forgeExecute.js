/* =====================================================================
   js/forgeExecute.js — La porte des effets de Forge : `executeForge()`

   Une table de Forge, résolue : les conditions, le coût payé en route, le
   « may », le « unless pays » et la suite qu'il conditionne, la mémoire de la
   carte source (`Remembered`), puis l'effet lui-même. Séparée de
   js/forgeEffetsA.js, qui porte le registre des effets et les zones.
   ===================================================================== */

/* « Unless … pays » : rend vrai si le payeur a payé. Le mana, la vie, un
   sacrifice, une défausse se proposent ; s'engager ou se sacrifier soi-même,
   non. */
function* paieUnlessForge(P, t, env) {
  const payeurs = forgeDefinis(P, t.UnlessPayer || (env.op.slot != null ? 'TargetedController' : 'You'), env).map(x => joueurDe(x));
  const c = coutUnless(P, t.UnlessCost, env);
  if (!c || c.cout.engage || c.cout.sacSoi || c.cout.defausseSoi || c.cout.exileSoi || c.cout.renvoieSoi) return false;
  const autre = autresCout(c.cout), porteur = env.src && !env.src.lki ? env.src : {id: -1, zone: '', marq: {}};
  for (const j of payeurs) {
    if (j == null || P.joueurs[j].elimine) continue;
    if (c.cout.vie && P.joueurs[j].vie <= c.cout.vie) continue;
    if (autre && !coutAutrePossible(P, j, porteur, autre)) continue;
    if (!planPaiement(P, j, c.cout.mana, 0)) continue;
    const r = yield question(P, j, 'oui', ['non', 'oui'], {texte: `Payer ${t.UnlessCost} ?`, source: env.ctx.source,
      extra: {saufForge: {contre: t.UnlessSwitched !== 'True'}}});
    if (r === 1 && paieMana(P, j, c.cout.mana, 0)) { if (autre) yield* paieAutre(P, j, porteur, autre); return true; }
  }
  return false;
}

/* La mémoire de la carte source : les objets et les joueurs retenus. */
function memoireForge(P, ctx, src) {
  if (ctx.memo) return;
  const k = src && P.cartes[src.cid];
  ctx.memo = k ? (k.memo || (k.memo = [])) : [];
  ctx.memoJ = k ? (k.memoJ || (k.memoJ = [])) : [];
}

function retiensForge(ctx, x) {
  if (x == null) return;
  if (typeof x === 'object' && x.j != null) { if (!ctx.memoJ.includes(x.j)) ctx.memoJ.push(x.j); }
  else { const id = typeof x === 'object' ? x.id : x; if (!ctx.memo.includes(id)) ctx.memo.push(id); }
}

/* La porte : une table de Forge, résolue. */
function* executeForge(P, op, ctx) {
  const src = sourceCtx(P, ctx);
  memoireForge(P, ctx, src);
  const env = {face: op.face, ctx, src, ctrl: ctx.ctrl, op};
  const t = op.t, api = FORGE_API[op.api];
  if (ctx.coupe === op.chaine) return;
  if (!api || !conditionForge(P, t, env)) return;
  /* Un coût à la résolution : refusé ou impayable, la capacité s'arrête
     là, sous-capacités comprises. */
  if (op.coutInterne) {
    const c = coutUnless(P, op.coutInterne, env), autre = autresCout(c.cout), porteur = src && !src.lki ? src : {id: -1, zone: '', marq: {}};
    /* « You may pay {X}{R} » : X se choisit au moment de payer, et nourrit
       `Count$xPaid` pour le reste de la chaîne. Le coût se juge d'abord avec
       X à zéro, le plus petit qu'on puisse payer. */
    const brut = coutForge(op.coutInterne), payeX = !!brut && !!brut.cout.mana && brut.cout.mana.x > 0 && /Count\$xPaid/.test((op.face.svars.X || ''));
    const decl = c.cout.exileDeclencheur ? objetEvt(P, ctx) : null;
    const ok = planPaiement(P, ctx.ctrl, c.cout.mana, 0) && (!autre || coutAutrePossible(P, ctx.ctrl, porteur, autre)) &&
      (!c.cout.exileDeclencheur || (!!decl && decl.zone === 'cimetiere'));
    /* `Mandatory` : le coût se paie sans qu'on le demande, s'il le peut. */
    const r = !ok ? 0 : /\bMandatory\b/.test(op.coutInterne) ? 1
      : yield question(P, ctx.ctrl, 'oui', ['non', 'oui'], {texte: `Payer ${op.coutInterne} ?`, source: ctx.source, extra: {ops: [op]}});
    if (r === 1 && payeX) {
      const max = maxX(P, ctx.ctrl, brut.cout.mana), opts = Array.from({length: max + 1}, (_, i) => i);
      ctx.x = opts[(yield question(P, ctx.ctrl, 'x', opts, {defaut: max, source: ctx.source}))] || 0;
    }
    /* Le X du mana se paie par `paieMana()` lui-même : le coût garde son X. */
    if (r !== 1 || !paieMana(P, ctx.ctrl, c.cout.mana, payeX ? ctx.x : 0)) { ctx.coupe = op.chaine; return; }
    P.coutPaye = null;
    if (autre) yield* paieAutre(P, ctx.ctrl, porteur, autre);
    /* Ce que le coût interne a sacrifié ou défaussé se lit ensuite (`Sacrificed`, `Discarded`). */
    if (P.coutPaye && P.coutPaye.sacrifies) ctx.sacrifies = [...(ctx.sacrifies || []), ...P.coutPaye.sacrifies];
    if (P.coutPaye) ctx.coutPaye = {...(ctx.coutPaye || {}), ...P.coutPaye};
    P.coutPaye = null;
    if (decl) deplace(P, decl.id, 'exil');
  }
  /* Le joueur choisi décide lui-même, par sa propre question (js/forgeChoisisseur.js). */
  if ((t.Optional === 'True' || t.OptionalDecider) && !api.optionnel && t.Chooser !== 'ChosenPlayer') {
    /* Celui qui décide est nommé, jamais déduit des cibles. */
    const j = t.OptionalDecider ? forgeDefinis(P, t.OptionalDecider, env).map(x => joueurDe(x)).find(x => x != null) : ctx.ctrl;
    if (j == null) return;
    /* Ce qu'on a révélé juste avant (Etali : les cartes exilées) se montre avec la question (js/jeuRevelations.js). */
    const rev = revelationPour(P, null);
    const r = yield question(P, j, 'oui', ['non', 'oui'], {texte: op.texte || 'Le faire ?', source: ctx.source, extra: {ops: [op], ...(rev ? {revelees: rev} : {})}});
    if (r !== 1) return;
  }
  if (t.UnlessCost) {
    const paye = yield* paieUnlessForge(P, t, env);
    /* « If they do, you create a Lander » : la suite ne se joue que si le coût
       a été payé (`WhenPaid`), ou que s'il ne l'a pas été (`WhenNotPaid`). */
    if ((t.UnlessResolveSubs === 'WhenPaid' && !paye) || (t.UnlessResolveSubs === 'WhenNotPaid' && paye)) ctx.coupe = op.chaine;
    if (paye === (t.UnlessSwitched !== 'True')) return;
  }
  /* Oublier avant de retenir : « forget all other remembered ». */
  /* Un effet de masse qui filtre sur la mémoire (`Card.IsRemembered`) l'oublie lui-même, une fois ses objets trouvés (js/forgeInstantsE.js). */
  if ((t.ForgetOtherRemembered === 'True' || t.ForgetOtherTargets === 'True') && !(api.oubliApres && /IsRemembered/.test(t.ChangeType || ''))) { ctx.memo.length = 0; ctx.memoJ.length = 0; }
  if (t.RememberObjects) forgeDefinis(P, t.RememberObjects, env).forEach(x => retiensForge(ctx, x));
  if (t.RememberTargets) ciblesForge(P, env, false).forEach(x => retiensForge(ctx, x));
  /* « Remember the destroyed / the damaged / the countered » : ce qui a
     quitté sa place, ou ce que l'effet a touché, se retient après coup. */
  const retenir = RETENIR_APRES.find(k => t[k] === 'True');
  const avant = retenir ? cibleOuDefinis(P, t, env) : null;
  yield* api.gen(P, t, env);
  if (retenir) avant.filter(x => x.j != null || retenir === 'RememberDamaged' || retenir === 'RememberControlled' || !obj(P, x.id) || obj(P, x.id).zone !== x.zone)
    .forEach(x => retiensForge(ctx, x));
}

OPS.forge = executeForge;

/* Les paramètres qui retiennent ce que l'effet a fait, jugés après lui. */
const RETENIR_APRES = ['RememberDestroyed', 'RememberCountered', 'RememberDamaged', 'RememberControlled'];
forgeSait('param', ...['Destroy', 'DestroyAll'].map(a => a + '.RememberDestroyed'), 'Counter.RememberCountered', 'DealDamage.RememberDamaged',
  'GainControl.RememberControlled', ...['ChangeZone', 'ChangeZoneAll', 'Destroy', 'Pump', 'PutCounter', 'Sacrifice', 'Effect', 'DealDamage', 'Draw']
  .flatMap(a => [a + '.ForgetOtherRemembered', a + '.ForgetOtherTargets']), 'ChangeZone.RememberLKI', 'ChangeZone.ForgetChanged',
  'Effect.ForgetOnCast', 'Effect.ForgetCounter', 'CopyPermanent.RememberTokens');

/* Les objets qu'un effet touche : ses cibles, ou ce que `Defined$` désigne,
   ou — pour un effet de masse — ce qui répond à `ValidCards$`. */
function cibleOuDefinis(P, t, env) {
  if (env.op.slot != null) return avecDefinisEnPlus(P, t, env, ciblesForge(P, env, false).slice());
  if (t.ValidCards) return objetsZone(P, 'champ').filter(o => forgeValideObjet(P, o, t.ValidCards, env.src, env.ctrl, env));
  return forgeDefinis(P, t.Defined || 'Self', env).slice();
}
