/* =====================================================================
   js/forgeInstantsF.js — Les instants : la pile, la réserve, les dés

   Lot F101 :
   - Dromoka's Command : les dégâts d'un sort visé sur la pile sont
     empêchés, ce tour (`TargetedSource`) ;
   - Storyweave : les prochains permanents « enchantement créature » qui
     entrent ce tour portent deux marqueurs de plus — une seule fois ;
   - Power Sink : `TapAll | Defined$` (les terrains du joueur visé),
     `DrainMana` (sa réserve se vide) ;
   - Batwing Brume : `ConditionManaSpent$ W` (la couleur dépensée pour
     lancer le sort) et `PlayerCountRemembered$Valid` (compter pour chaque
     joueur retenu, de son côté) ;
   - Critical Hit : `RolledDie | Natural$` ;
   - Endless Detour : `AlternativeDecider$ TargetedOwner` — le propriétaire de
     la cible choisit le dessus ou le dessous de sa bibliothèque ;
   - les paramètres qui ne se lisent qu'en ces endroits.
   ===================================================================== */

/* —— Les dégâts d'un sort visé ————————————————————————————————————— */

definisEtendus = (g => function (P, v, env) {
  if (v === 'TargetedSource') return forgeDefinis(P, 'Targeted', env);
  return g(P, v, env);
})(definisEtendus);
forgeSait('defini', 'TargetedSource');
const PREVENT_PAR = /AddKeyword\$ *Prevent all damage that would be dealt by CARDNAME/;
const motifStoryweave = (t, face) => {
  const r = t.ReplacementEffects && face.svars[String(t.ReplacementEffects).trim()];
  if (!r || !/Event\$ *Moved/.test(r) || !/Destination\$ *Battlefield/.test(r)) return null;
  const tab = forgeTable(r), w = tab.ReplaceWith && forgeSousCapacite(face, tab.ReplaceWith);
  const suite = w && w.SubAbility && forgeSousCapacite(face, w.SubAbility);
  return w && forgeApi(w) === 'PutCounter' && w.Defined === 'ReplacedCard' && w.ETB === 'True' && suite && suite.DB === 'Bookkeeping' && genreMarqueur(w.CounterType) ? {tab, w} : null;
};
FORGE_API.Effect.prepare = (p => function (t, op) {
  const face = op.face, st = String(t.StaticAbilities || '').split(',').map(n => face && face.svars[n.trim()]).filter(Boolean).join(' ');
  if (PREVENT_PAR.test(st) && /Card\.IsRemembered/.test(st) && t.ValidTgts) { op.prevPar = true; return true; }
  const m = face && motifStoryweave(t, face);
  if (m && /ChangesZoneAll/.test(String(face.svars[String(t.Triggers || '').trim()] || ''))) { op.storyweave = {n: forgeNombre(null, m.w.CounterNum || 1, {ctx: {}}), genre: genreMarqueur(m.w.CounterType), valid: m.tab.ValidCard}; return true; }
  return p.call(this, t, op);
})(FORGE_API.Effect.prepare);
FORGE_API.Effect.gen = (g => function* (P, t, env) {
  const op = env.op;
  if (op.prevPar) {
    for (const o of objetsForge(P, t, env, 'Targeted').filter(x => x && x.j == null && x.zone === 'pile')) { o.mods.push({f: 0, e: 0, mots: 0, prevPar: true, fin: 'tour'}); P.ver++; }
    return;
  }
  if (op.storyweave) { (P.entreesPlus = P.entreesPlus || []).push({...op.storyweave, ctrl: env.ctrl, tour: P.tour}); return; }
  return yield* g(P, t, env);
})(FORGE_API.Effect.gen);
forgeSait('param', 'Effect.ExileOnMoved', 'Effect.ActivationFirstCombat', 'Effect.ReplacementEffects', 'Effect.Triggers');

/* « The next time one or more enchantment creatures you control enter this turn » : à l'entrée, une seule fois. */
entreAvecPrevu = (g => function (P, id) {
  const l = g(P, id), o = obj(P, id);
  if (!o || !P.entreesPlus || !P.entreesPlus.length) return l;
  P.entreesPlus = P.entreesPlus.filter(e => e.tour === P.tour);
  const e = P.entreesPlus.find(x => forgeValideObjet(P, o, x.valid, null, x.ctrl, {ctx: {cibles: [], memo: [], memoJ: []}, op: {}}, true));
  if (!e) return l;
  P.entreesPlus = P.entreesPlus.filter(x => x !== e);
  l.push({genre: e.genre, n: e.n});
  return l;
})(entreAvecPrevu);

/* —— La réserve de mana et les terrains d'un joueur ———————————————————— */

FORGE_API.TapAll.gen = (g => function* (P, t, env) {
  if (!t.Defined) return yield* g(P, t, env);
  const qui = joueursForge(P, t, env);
  objetsZone(P, 'champ').filter(o => qui.includes(o.ctrl) && forgeValideObjet(P, o, t.ValidCards || 'Permanent', env.src, env.ctrl, env)).forEach(o => engageObjet(P, o));
})(FORGE_API.TapAll.gen);
forgeSait('param', 'TapAll.Defined', 'TapAll.TapperController');

forgeEffet('DrainMana', [], function* (P, t, env) {
  joueursForge(P, t, env).forEach(j => { const J = P.joueurs[j]; LETTRES_MANA.forEach(k => { J.pool[k] = 0; }); J.poolR = []; P.ver++; });
}, (t, op) => { op.op = 'forge'; op.hostile = true; });

/* —— La couleur dépensée pour lancer le sort —————————————————————————— */

FORGE_COMMUNS.add('ConditionManaSpent');
forgeSait('param', 'ConditionManaSpent');
conditionForge = (g => function (P, t, env) {
  if (t.ConditionManaSpent) {
    const s = env.src, d = (s && (s.manaSort || (s.lance && s.lance.mana))) || {};
    if (!String(t.ConditionManaSpent).split(/[\s,]+/).filter(Boolean).every(k => (d[k] || 0) > 0)) return false;
  }
  return g(P, t, env);
})(conditionForge);

/* « Each player loses 1 life for each attacking creature they control » : on compte pour chaque joueur retenu, de son côté. */
exprEtendue = (g => function (P, tete, q, env) {
  let k;
  if (tete === 'PlayerCountRemembered' && (k = /^Valid(Graveyard|Hand|Exile|Library)? (.+)$/.exec(q))) {
    const zone = {Graveyard: 'cimetiere', Hand: 'main', Exile: 'exil', Library: 'bibliotheque'}[k[1]] || 'champ';
    return ((env.ctx && env.ctx.memoJ) || []).reduce((s, j) => s + objetsZone(P, zone).filter(o => forgeValideObjet(P, o, k[2], env.src, j, env)).length, 0);
  }
  return g(P, tete, q, env);
})(exprEtendue);
forgeSait('expr', 'PlayerCountRemembered$Valid');

/* —— Un vingt naturel ——————————————————————————————————————————————— */

/* Le moteur ne modifie aucun jet : tout résultat est naturel. */
forgeSait('param', 'RolledDie.Natural');

/* —— Le dessus ou le dessous, au choix du propriétaire ———————————————————— */

FORGE_API.ChangeZone.gen = (g => function* (P, t, env) {
  if (t.AlternativeDecider !== 'TargetedOwner') return yield* g(P, t, env);
  const cible = objetsForge(P, t, env, 'Targeted')[0], j = cible ? (cible.zone === 'champ' || cible.zone === 'pile' ? cible.prop : cible.prop) : env.ctrl;
  const r = yield question(P, j == null ? env.ctrl : j, 'oui', ['non', 'oui'], {texte: 'Mettre la carte sous la bibliothèque plutôt que dessus ?', source: env.ctx.source});
  return yield* g(P, {...t, DestinationAlternative: undefined, AlternativeDecider: undefined, LibraryPosition: r === 1 ? t.LibraryPositionAlternative : t.LibraryPosition}, env);
})(FORGE_API.ChangeZone.gen);
forgeSait('param', 'ChangeZone.AlternativeDecider', 'ChangeZone.LibraryPositionAlternative');

/* —— Une conversion de mana qui n'agit que sur une carte exilée ————————————— */

horsChampTenable = (g => function (t) { return (t.Mode === 'ManaConvert' && t.AffectedZone === 'Exile') || g(t); })(horsChampTenable);
alternativeLisible = (g => function (t) { return g(t.Announce === 'X' ? {...t, Announce: undefined} : t); })(alternativeLisible);

/* Delay : une carte sans suspension qui reçoit la suspension (`Card.withoutSuspend`). */
proprieteDesignee = (g => function (P, o, p, c, src, ctrl, env) {
  if (p === 'withoutSuspend') return !o.def.suspension && !o.suspendu;
  return g(P, o, p, c, src, ctrl, env);
})(proprieteDesignee);
forgeSait('filtre', 'withoutSuspend');
