/* =====================================================================
   js/forgeArtefactsI.js — Les artefacts d'EDHREC : le combat

   Lot F108 :
   - Coveted Jewel : `AttackerUnblockedOnce`, une fois par défenseur dont une
     créature n'est pas bloquée ;
   - Misleading Signpost, Midnight Crusader Shuttle : `ChangeCombatants`, ce
     qu'une créature attaque, changé en cours de déclaration ; et
     `VillainousChoice` (le défenseur choisit ce qui le blessera le moins) ;
     `GainControl | Choices` (une créature au choix parmi celles du joueur) ;
   - Gustha's Scepter : `ChangesController` (js/forgeArtefactsG.js).
   ===================================================================== */

/* —— Plusieurs attaquants que personne ne bloque ————————————————————————— */

declareBloqueurs = (g => function* (P) {
  yield* g(P);
  const cb = P.combat;
  if (!cb) return;
  const defenseurs = new Set();
  for (const [a, def] of cb.attaquants) if (obj(P, a) && !cb.bloque.has(a)) { const d = defenseurDe(P, def); if (d != null) defenseurs.add(d); }
  defenseurs.forEach(d => emet(P, {t: 'nonBloqueUnique', joueur: P.actif, defenseur: d}));
})(declareBloqueurs);
forgeMode('AttackerUnblockedOnce', ['ValidAttackingPlayer', 'ValidDefenders'], (P, t, e, s, env) => e.t === 'nonBloqueUnique' &&
  joueurOuRien(P, e.joueur, t.ValidAttackingPlayer, s, env) && joueurOuRien(P, e.defenseur, t.ValidDefenders, s, env));
/* « That player draws three cards and gains control of ~ » : le joueur qui attaque. */
definisEtendus = (g => function (P, v, env) {
  if (v === 'TriggeredAttackingPlayer') { const e = env.ctx && env.ctx.evt; return e && e.joueur != null ? [{j: e.joueur}] : []; }
  return g(P, v, env);
})(definisEtendus);
forgeSait('defini', 'TriggeredAttackingPlayer');

/* —— Changer ce qu'une créature attaque ———————————————————————————————— */

forgeSait('param', 'ChangeCombatants.Attacking', 'ChangeCombatants.Defined');
forgeEffet('ChangeCombatants', ['Attacking', 'Defined'], function* (P, t, env) {
  const cb = P.combat;
  if (!cb) return;
  /* Une créature volée qui attaque le joueur retenu : elle entre au combat, attaquante (Midnight Crusader Shuttle). */
  if (t.Attacking === 'RememberedPlayer') {
    const d = env.ctx.memoJ[0];
    for (const a of (t.Defined ? forgeDefinis(P, t.Defined, env) : []).filter(x => x && x.j == null && x.zone === 'champ' && x.ctrl === env.ctrl && !cb.attaquants.has(x.id))) {
      if (d != null) { cb.attaquants.set(a.id, {j: d}); jn(P, `${a.def.nom} attaque ${P.joueurs[d].nom}`); }
    }
    return;
  }
  for (const a of (t.Defined ? forgeDefinis(P, t.Defined, env) : objetsForge(P, t, env, 'Targeted')).filter(x => x && x.j == null && cb.attaquants.has(x.id))) {
    const proprio = a.ctrl, autres = vivants(P).map(J => J.i).filter(i => i !== proprio);
    if (!autres.length) continue;
    let d;
    if (t.Attacking === 'RememberedPlayer') d = env.ctx.memoJ[0];
    else d = autres[yield* choisitUn(P, env.ctrl, autres.map(i => P.joueurs[i].nom), `Que ${a.def.nom} attaque-t-elle ?`, 0, env.ctx.source)];
    if (d == null || d === proprio) continue;
    cb.attaquants.set(a.id, {j: d});
    jn(P, `${a.def.nom} attaque désormais ${P.joueurs[d].nom}`);
  }
}, (t, op) => { op.op = 'forge'; op.hostile = op.slot != null; });

/* —— Une mauvaise alternative, au choix du défenseur ——————————————————————— */

forgeSait('param', 'VillainousChoice.Choices', 'VillainousChoice.Defined');
forgeEffet('VillainousChoice', ['Choices', 'Defined'], function* (P, t, env) {
  const noms = String(t.Choices).split(',').map(s => s.trim()), avant = env.ctx.memoJ;
  try {
    for (const j of joueursForge(P, t, env)) {
      const i = yield* choisitUn(P, j, noms.map(n => (env.op.sousTextes || {})[n] || n), `${P.joueurs[j].nom} est face à un choix cruel`, 0, env.ctx.source);
      env.ctx.memoJ = [j];
      yield* joueSous(P, env, noms[i]);
    }
  } finally { env.ctx.memoJ = avant; }
}, (t, op) => { op.op = 'forge'; op.hostile = true; }, {prepare: (t, op) => {
  const noms = String(t.Choices || '').split(',').map(s => s.trim()).filter(Boolean);
  op.sousTextes = Object.fromEntries(noms.map(n => { const s = forgeSousCapacite(op.face, n); return [n, s && s.SpellDescription || n]; }));
  return noms.length > 0 && sousEffets(op, noms);
}});
/* « You gain control of a creature of your choice that player controls » : parmi celles du joueur en mémoire. */
forgeSait('param', 'GainControl.ChoiceTitle', 'GainControl.RememberControlled');
forgeValeurs('GainControl.Choices', ['Card.targetedBy', 'Creature.RememberedPlayerCtrl']);
FORGE_API.GainControl.prepare = (p => function (t, op) { return /RememberedPlayerCtrl/.test(t.Choices || '') || !p || p.call(this, t, op); })(FORGE_API.GainControl.prepare);
FORGE_API.GainControl.gen = (g => function* (P, t, env) {
  if (!/RememberedPlayerCtrl/.test(t.Choices || '')) return yield* g(P, t, env);
  const ids = objetsZone(P, 'champ').filter(o => env.ctx.memoJ.includes(o.ctrl) && forgeValideObjet(P, o, t.Choices.replace(/\.?RememberedPlayerCtrl/, '') || 'Card', env.src, env.ctrl, env)).map(o => o.id);
  if (!ids.length) return;
  const [id] = yield* choisitCartes(P, env.ctrl, ids, 1, t.ChoiceTitle || 'Choisir', 'cartes', 1);
  if (id == null) return;
  yield* g(P, {...t, Choices: undefined, _ids: [id]}, env);
  if (t.RememberControlled === 'True') retiensForge(env.ctx, id);
})(FORGE_API.GainControl.gen);

/* Sans cible ni désignation, `GainControl | NewController` prend la source elle-même (Coveted Jewel). */
FORGE_API.GainControl.gen = (g => function* (P, t, env) {
  if (t.NewController && !t.Defined && !t._ids && !t.Choices && env.op.slot == null && env.src && !env.src.lki && env.src.zone === 'champ')
    return yield* g(P, {...t, _ids: [env.src.id]}, env);
  return yield* g(P, t, env);
})(FORGE_API.GainControl.gen);
