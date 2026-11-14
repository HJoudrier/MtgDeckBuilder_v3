/* =====================================================================
   js/forgeEffetsC.js — Les effets de Forge : pompes, engagements, mana,
   combats, attaches, contrôle, mémoire, déclencheurs réflexes

   Suite de js/forgeEffetsB.js. Les modes (`Charm`) ne s'exécutent pas
   ici : ils se choisissent au lancement, comme ceux du compilateur
   d'oracle (js/forgeDefinition.js).
   ===================================================================== */

/* Les mots-clés d'un `KW$ Flying & Trample`, en bits. Un mot-clé que le
   moteur ne connaît pas est laissé de côté. */
function motsForge(kw) {
  return String(kw || '').split('&').reduce((m, k) => m | (MOTS_ANGLAIS[k.trim().toLowerCase()] || 0), 0);
}

/* Un `+3` ou un `-X` de Forge, pour l'IA. */
function bonusIA(v) { const s = String(v == null ? '0' : v); return /^[+-]?\d+$/.test(s) ? +s : /^-/.test(s) ? -2 : 2; }

/* Poser un bonus sur des objets du champ. */
function pompeForge(P, objets, t, env) {
  const f = forgeNombre(P, t.NumAtt || 0, env), e = forgeNombre(P, t.NumDef || 0, env), mots = motsForge(t.KW);
  const fin = t.Duration === 'Permanent' ? 'jamais' : 'tour';
  objets.filter(o => o.zone === 'champ' && !o.lki).forEach(o => { o.mods.push({f, e, mots, fin}); P.ver++; });
}

forgeEffet('Pump', ['NumAtt', 'NumDef', 'KW', 'Duration'], function* (P, t, env) { pompeForge(P, objetsForge(P, t, env), t, env); },
  (t, op) => {
    op.op = 'pompe'; op.f = bonusIA(t.NumAtt); op.e = bonusIA(t.NumDef); op.mots = motsForge(t.KW);
    op.a = op.slot != null ? {cible: op.slot} : {soi: 1}; op.hostile = op.f < 0 || op.e < 0;
  });

forgeEffet('PumpAll', ['ValidCards', 'NumAtt', 'NumDef', 'KW', 'Duration'], function* (P, t, env) {
  pompeForge(P, objetsZone(P, 'champ').filter(o => forgeValideObjet(P, o, t.ValidCards || 'Creature', env.src, env.ctrl, env)), t, env);
}, (t, op) => { op.op = 'pompe'; op.f = bonusIA(t.NumAtt); op.e = bonusIA(t.NumDef); op.hostile = false; });

forgeEffet('Tap', [], function* (P, t, env) { objetsForge(P, t, env).filter(o => o.zone === 'champ' && !o.lki).forEach(o => { o.engage = true; P.ver++; }); },
  (t, op) => { op.op = 'engage'; op.a = op.slot != null ? {cible: op.slot} : {soi: 1}; op.hostile = op.slot != null; });
forgeEffet('Untap', [], function* (P, t, env) { objetsForge(P, t, env).filter(o => o.zone === 'champ' && !o.lki).forEach(o => { o.engage = false; P.ver++; }); },
  (t, op) => { op.op = 'degage'; op.a = op.slot != null ? {cible: op.slot} : {soi: 1}; op.hostile = false; });
forgeEffet('TapAll', ['ValidCards'], function* (P, t, env) {
  objetsZone(P, 'champ').filter(o => forgeValideObjet(P, o, t.ValidCards || 'Creature', env.src, env.ctrl, env)).forEach(o => { o.engage = true; P.ver++; });
}, (t, op) => { op.op = 'forge'; op.hostile = false; });
forgeEffet('UntapAll', ['ValidCards'], function* (P, t, env) {
  objetsZone(P, 'champ').filter(o => forgeValideObjet(P, o, t.ValidCards || 'Permanent.YouCtrl', env.src, env.ctrl, env)).forEach(o => { o.engage = false; P.ver++; });
}, (t, op) => { op.op = 'forge'; op.hostile = false; });

/* Les options d'un `Produced$` : `G`, `C`, `Combo W U`, `Any`, `W W`. */
function optionsMana(produit, montant) {
  const p = String(produit || '').trim(), n = Math.max(1, montant || 1);
  if (p === 'Any' || p === 'Combo Any') return ['W', 'U', 'B', 'R', 'G'].map(k => k.repeat(n));
  const m = /^Combo (.+)$/.exec(p);
  if (m) return m[1].split(/\s+/).filter(k => /^[WUBRGC]$/.test(k)).map(k => k.repeat(n));
  const lettres = p.split(/\s+/).filter(k => /^[WUBRGC]$/.test(k));
  return lettres.length ? [lettres.join('').repeat(n)] : [];
}

forgeEffet('Mana', ['Produced', 'Amount', 'RestrictValid'], function* (P, t, env) {
  const opts = optionsMana(t.Produced, forgeNombre(P, t.Amount || 1, env));
  if (!opts.length) return;
  /* Une couleur au choix : celle que la main réclame le plus. */
  const J = P.joueurs[env.ctrl], voulu = k => J.main.reduce((s, id) => s + ((obj(P, id).def.cout.couleurs || {})[k[0]] || 0), 0);
  ajouteMana(P, env.ctrl, opts.slice().sort((a, b) => voulu(b) - voulu(a))[0]);
}, (t, op) => { op.op = 'mana'; op.options = optionsMana(t.Produced, 1); op.hostile = false; });

forgeEffet('Fight', [], function* (P, t, env) {
  const miens = t.Defined ? forgeDefinis(P, t.Defined, env) : [];
  const leurs = env.op.slot != null ? ciblesForge(P, env, false) : [];
  const tous = [...miens, ...leurs].filter(o => o && o.j == null && !o.lki && o.zone === 'champ' && estCreature(o));
  if (tous.length < 2 || tous[0].id === tous[1].id) return;
  const [a, b] = tous;
  infligeDegats(P, a, b, car(P, a).force, false);
  infligeDegats(P, b, a, car(P, b).force, false);
}, (t, op) => { op.op = 'degats'; op.n = 2; op.a = op.slot != null ? {cible: op.slot} : null; op.hostile = op.slot != null; });

forgeEffet('Attach', [], function* (P, t, env) {
  const s = forgeDefinis(P, t.Defined || 'Self', env)[0], h = ciblesForge(P, env, false)[0];
  if (!s || s.lki || s.zone !== 'champ' || !h || h.j != null || h.zone !== 'champ') return;
  s.att = h.id;
  P.ver++;
}, (t, op) => { op.op = 'forge'; op.hostile = false; });

forgeEffet('GainControl', ['NewController'], function* (P, t, env) {
  const j = t.NewController ? forgeDefinis(P, t.NewController, env).map(x => joueurDe(x))[0] : env.ctrl;
  if (j == null) return;
  objetsForge(P, t, env, 'Targeted').filter(o => o.zone === 'champ' && !o.lki).forEach(o => { o.ctrl = j; o.pret = false; P.ver++; });
}, (t, op) => { op.op = 'exile'; op.a = op.slot != null ? {cible: op.slot} : null; op.hostile = op.slot != null; });

forgeEffet('Cleanup', ['ClearRemembered', 'ClearImprinted', 'ClearChosenCard', 'ClearChosenType', 'ClearChosenColor',
  'ForgetDefined', 'ClearTriggered'], function* (P, t, env) {
  if (t.ClearRemembered === 'True') { env.ctx.memo.length = 0; env.ctx.memoJ.length = 0; }
  if (t.ForgetDefined) forgeDefinis(P, t.ForgetDefined, env).forEach(x => {
    const i = env.ctx.memo.indexOf(x.id);
    if (i >= 0) env.ctx.memo.splice(i, 1);
  });
}, (t, op) => { op.op = 'rien'; op.hostile = false; });

forgeEffet('Investigate', ['Num'], function* (P, t, env) {
  const def = (env.op.jetons || {}).c_a_clue_draw;
  if (def) yield* creeJetonsForge(P, [def], forgeNombre(P, t.Num || 1, env), [env.ctrl], false, env, false);
}, (t, op) => { op.op = 'jetons'; op.n = 1; op.hostile = false; op._def = (op.jetons || {}).c_a_clue_draw || {types: ['artifact'], mots: 0, capacites: [], statiques: [], mv: 0}; });

/* Un déclencheur réflexe (« when you do, … ») : il va en attente, et
   monte sur la pile au prochain passage de priorité. */
forgeEffet('ImmediateTrigger', ['Execute', 'RememberObjects'], function* (P, t, env) {
  const effet = effetForge(env.op.face, forgeSousCapacite(env.op.face, t.Execute), env.op.jetons);
  if (!effet) return;
  const s = env.src;
  P.enAttente.push({src: s ? s.id : null, lki: s && s.lki ? s : null, ctrl: env.ctrl,
    cap: {genre: 'declenchee', effet, texte: t.SpellDescription || t.TriggerDescription || ''}, evt: env.ctx.evt});
}, (t, op) => { op.op = 'forge'; op.hostile = false; });

/* Les modes : choisis au lancement (js/forgeDefinition.js), jamais
   exécutés comme un effet. */
forgeEffet('Charm', ['Choices', 'CharmNum', 'MinCharmNum'], function* () {}, (t, op) => { op.op = 'rien'; op.hostile = false; });
