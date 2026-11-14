/* =====================================================================
   js/forgeEffetsF.js — Les paramètres de plus des effets courants

   « Sacrifice it at the beginning of the next end step », « creates a
   token that's tapped and attacking », « choose flying or lifelink »,
   « bolster 2 », « adapt 3 »… Ces paramètres s'ajoutent à des effets déjà
   écrits ailleurs : plutôt que de réécrire chaque effet, `etendEffet()`
   l'enveloppe d'un avant et d'un après, et inscrit ce qu'il sait lire.
   ===================================================================== */

/* Envelopper un effet : `avant(P, t, env)` peut rendre une table changée,
   `apres(P, t, env, touches, nouveaux)` reçoit les objets visés avant
   l'effet et les objets entrés pendant. */
function etendEffet(api, params, avant, apres) {
  const e = FORGE_API[api];
  if (!e) return;
  const g = e.gen;
  e.gen = function* (P, t, env) {
    const t2 = (avant && avant(P, t, env)) || t;
    const touches = apres ? cibleOuDefinis(P, t2, env) : null, n0 = P.champ.length, champ0 = new Set(P.champ);
    yield* g(P, t2, env);
    if (apres) yield* apres(P, t2, env, touches, n0 < P.champ.length || P.champ.some(id => !champ0.has(id)) ? P.champ.filter(id => !champ0.has(id)).map(id => obj(P, id)) : []);
  };
  forgeSait('param', ...params.map(p => api + '.' + p));
}

/* « At the beginning of the next end step, sacrifice / exile it » : le
   départ que js/forgeCopies.js `copiesFin()` joue à l'étape de fin. */
function finEtapeForge(objets, v) {
  objets.filter(o => o && o.zone === 'champ' && !o.lki).forEach(o => { o.finEtape = v === 'Exile' ? 'exil' : 'sacrifice'; });
}

/* Entrer « tapped and attacking » : dans le combat en cours, contre le
   défenseur de la source si elle attaque, sinon le premier adversaire. */
function entreAttaquant(P, o, env) {
  if (!P.combat || !o || o.zone !== 'champ' || P.actif !== o.ctrl) return;
  const def = (env.src && P.combat.attaquants.get(env.src.id)) || {j: adversaires(P, o.ctrl)[0]};
  if (def.j == null && def.pw == null) return;
  o.engage = true;
  P.combat.attaquants.set(o.id, def);
  P.ver++;
}

etendEffet('Pump', ['AtEOT', 'KWChoice'], (P, t) => t, function* (P, t, env, touches) { if (t.AtEOT) finEtapeForge(touches, t.AtEOT); });
FORGE_API.Pump.gen = (g => function* (P, t, env) {
  if (!t.KWChoice) return yield* g(P, t, env);
  const mots = t.KWChoice.split(',').map(x => x.trim());
  const i = yield* choisitUn(P, env.ctrl, mots, 'Choisir un mot-clé', 0, env.ctx.source);
  yield* g(P, {...t, KW: [t.KW, mots[i] || mots[0]].filter(Boolean).join(' & ')}, env);
})(FORGE_API.Pump.gen);
FORGE_API.PumpAll.prepare = t => !t.PumpZone || t.PumpZone === 'Battlefield';
forgeSait('param', 'PumpAll.PumpZone');

etendEffet('Token', ['TokenAttacking', 'AtEOT'], null, function* (P, t, env, touches, nouveaux) {
  if (t.TokenAttacking === 'True') nouveaux.forEach(o => entreAttaquant(P, o, env));
  if (t.AtEOT) finEtapeForge(nouveaux, t.AtEOT);
});

etendEffet('ChangeZone', ['Attacking', 'AtRandom', 'AttachedTo', 'AtEOT'], null, function* (P, t, env, touches, nouveaux) {
  if (t.Attacking === 'True') nouveaux.forEach(o => entreAttaquant(P, o, env));
  if (t.AtEOT) finEtapeForge(nouveaux, t.AtEOT);
  if (t.AttachedTo) {
    const h = forgeDefinis(P, t.AttachedTo, env).find(x => x && x.j == null && x.zone === 'champ');
    if (h) nouveaux.filter(o => o.def.aura || o.def.equipe).forEach(o => { o.att = h.id; P.ver++; });
  }
});
etendEffet('ChangeZoneAll', ['RandomOrder', 'Tapped', 'GainControl'], null, function* (P, t, env, touches, nouveaux) {
  nouveaux.forEach(o => {
    if (t.Tapped === 'True') o.engage = true;
    if (t.GainControl === 'True' && o.ctrl !== env.ctrl) { o.ctrl = env.ctrl; o.pret = false; P.ver++; }
  });
});
etendEffet('Dig', ['Tapped'], null, function* (P, t, env, touches, nouveaux) { if (t.Tapped === 'True') nouveaux.forEach(o => { o.engage = true; P.ver++; }); });
etendEffet('Mana', ['PersistentMana'], null, null);
etendEffet('Sacrifice', ['SacMessage'], null, null);
etendEffet('CopyPermanent', ['NonLegendary'], null, function* (P, t, env, touches, nouveaux) {
  if (t.NonLegendary === 'True') nouveaux.forEach(o => { o.def = {...o.def, supers: o.def.supers.filter(s => s !== 'legendary')}; P.ver++; });
});
etendEffet('Charm', ['CanRepeatModes'], null, null);

/* « If that creature would die this turn, exile it instead » : la marque
   que js/forgeRemplacements.js `destinationRemplacee()` lit. */
etendEffet('DealDamage', ['ReplaceDyingDefined'], null, function* (P, t, env) {
  if (!t.ReplaceDyingDefined) return;
  forgeDefinis(P, t.ReplaceDyingDefined, env).filter(o => o && o.j == null && o.zone === 'champ').forEach(o => { o.exilSiMeurt = P.tour; });
});

/* Prendre le contrôle de tout ce qui répond (`AllValid$`). */
etendEffet('GainControl', ['AllValid'], (P, t, env) => {
  if (!t.AllValid) return t;
  const ids = objetsZone(P, 'champ').filter(o => forgeValideObjet(P, o, t.AllValid, env.src, env.ctrl, env)).map(o => o.id);
  return {...t, Defined: undefined, _ids: ids};
}, null);

/* Les marqueurs : répartis (`DividedAsYouChoose`), sur la créature la
   plus faible (Bolster), seulement s'il n'en a pas (Adapt), sur un choix
   parmi `Choices`. */
FORGE_API.PutCounter.gen = (g => function* (P, t, env) {
  const g2 = genreMarqueur(t.CounterType || 'P1P1'), n = () => forgeNombre(P, t.CounterNum || (/^\d+$/.test(t.Bolster || t.Adapt || '') ? t.Bolster || t.Adapt : 1), env);
  if (t.Bolster) {
    const l = champDe(P, env.ctrl).filter(estCreature);
    if (!l.length) return;
    const min = Math.min(...l.map(o => car(P, o).endurance));
    const pris = yield* choisitCartes(P, env.ctrl, l.filter(o => car(P, o).endurance === min).map(o => o.id), 1, 'Renforcer', 'cartes', 1);
    pris.forEach(id => poseMarqueurs(P, obj(P, id), g2, n(), env.src));
    return;
  }
  if (t.Adapt) {
    const o = forgeDefinis(P, t.Defined || 'Self', env)[0];
    if (o && o.zone === 'champ' && !(o.marq['+1/+1'] > 0)) poseMarqueurs(P, o, g2, n(), env.src);
    return;
  }
  if (t.Choices) {
    const ids = objetsZone(P, 'champ').filter(o => forgeValideObjet(P, o, t.Choices, env.src, env.ctrl, env)).map(o => o.id);
    const pris = yield* choisitCartes(P, env.ctrl, ids, 1, 'Marqueurs', 'cartes', ids.length ? 1 : 0);
    pris.forEach(id => poseMarqueurs(P, obj(P, id), g2, n(), env.src));
    return;
  }
  if (t.DividedAsYouChoose && env.op.slot != null) {
    const l = ciblesForge(P, env, false).filter(o => o.j == null && o.zone === 'champ');
    let reste = forgeNombre(P, t.DividedAsYouChoose, env);
    l.forEach((o, i) => { const k = i === l.length - 1 ? reste : Math.min(1, reste); poseMarqueurs(P, o, g2, k, env.src); reste -= k; });
    return;
  }
  yield* g(P, t, env);
})(FORGE_API.PutCounter.gen);
forgeSait('param', 'PutCounter.Bolster', 'PutCounter.Adapt', 'PutCounter.Choices', 'PutCounter.DividedAsYouChoose', 'PutCounter.Support');

/* Retirer du combat ; échanger le contrôle de deux permanents. */
forgeEffet('RemoveFromCombat', [], function* (P, t, env) {
  if (!P.combat) return;
  objetsForge(P, t, env).forEach(o => {
    P.combat.attaquants.delete(o.id);
    const a = P.combat.bloqueurs.get(o.id);
    P.combat.bloqueurs.delete(o.id);
    if (a != null) P.combat.bloquesPar.set(a, (P.combat.bloquesPar.get(a) || []).filter(b => b !== o.id));
    P.ver++;
  });
}, (t, op) => { op.op = 'forge'; op.hostile = false; });
forgeEffet('ExchangeControl', ['Defined'], function* (P, t, env) {
  const l = [...ciblesForge(P, env, false), ...(t.Defined ? forgeDefinis(P, t.Defined, env) : [])].filter(o => o && o.j == null && o.zone === 'champ' && !o.lki);
  if (l.length !== 2 || l[0].ctrl === l[1].ctrl) return;
  const [a, b] = l, c = a.ctrl;
  a.ctrl = b.ctrl; b.ctrl = c; a.pret = false; b.pret = false; P.ver++;
}, (t, op) => { op.op = 'forge'; op.hostile = true; });
