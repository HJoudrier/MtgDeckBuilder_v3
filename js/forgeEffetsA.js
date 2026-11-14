/* =====================================================================
   js/forgeEffetsA.js — Exécuter une capacité de Forge : le registre, la
   porte, et les effets de zones et de cartes

   Une capacité de Forge entre dans le moteur comme une opération `forge`
   par table de sa chaîne (js/forgeDefinition.js) : le lancement, les
   cibles, la pile, l'IA la traitent comme les autres. `executeForge()` en
   est la porte : conditions, « you may », « unless … pays », objets
   retenus, puis l'effet du registre `FORGE_API`.

   Chaque effet s'inscrit avec les paramètres qu'il lit vraiment : une
   table qui en porte un autre n'est pas jouée (js/forgeCouverture.js).
   Les objets retenus (`Remembered`) appartiennent à la carte, comme dans
   Forge : « exile target creature » puis, plus tard, « return the exiled
   card » parlent de la même liste.
   ===================================================================== */

const FORGE_API = {};

/* Inscrire un effet : son générateur, les paramètres qu'il comprend, et
   ce que l'IA doit en penser (`ia(t, op)` pose `op.op`, `op.hostile`…). */
/* Les paramètres communs (js/forgeCouverture.js), que la porte
   ci-dessous et la construction (js/forgeDefinition.js) lisent tous. */
forgeSait('param', ...FORGE_COMMUNS);

function forgeEffet(api, params, gen, ia, opts = {}) {
  FORGE_API[api] = {gen, ia, ...opts};
  forgeSait('api', api);
  forgeSait('param', ...params.map(p => api + '.' + p));
}

/* Un seuil de Forge : `GE1`, `EQ0`, `LTX`. */
function seuilForge(P, v, cmp, env) {
  const m = /^(GE|LE|GT|LT|EQ|NE)(.+)$/.exec(String(cmp || 'GE1'));
  return m ? compareForge(v, m[1], forgeNombre(P, m[2], env)) : false;
}

const FORGE_CONDITIONS = {
  Threshold: (P, env) => P.joueurs[env.ctrl].cimetiere.length >= 7,
  Hellbent: (P, env) => !P.joueurs[env.ctrl].main.length,
  Metalcraft: (P, env) => champDe(P, env.ctrl).filter(o => estType(o, 'artifact')).length >= 3,
  PlayerTurn: (P, env) => P.actif === env.ctrl,
  NotPlayerTurn: (P, env) => P.actif !== env.ctrl,
  Delirium: (P, env) => new Set([].concat(...P.joueurs[env.ctrl].cimetiere.map(id => obj(P, id).def.types))).size >= 4,
  Kicked: (P, env) => !!(env.ctx.kicked || (env.src && env.src.kicked))
};

/* Les conditions d'une table : `Condition*`, `CheckSVar`, `IsPresent`,
   `PlayerTurn`. Une condition inconnue est fausse. */
function conditionForge(P, t, env) {
  if (t.Condition && !(FORGE_CONDITIONS[t.Condition] && FORGE_CONDITIONS[t.Condition](P, env))) return false;
  if (t.ConditionPlayerTurn && (P.actif === env.ctrl) !== (t.ConditionPlayerTurn === 'True')) return false;
  if (t.PlayerTurn === 'True' && P.actif !== env.ctrl) return false;
  if (t.ConditionCheckSVar && !seuilForge(P, forgeNombre(P, t.ConditionCheckSVar, env), t.ConditionSVarCompare, env)) return false;
  if (t.CheckSVar && !seuilForge(P, forgeNombre(P, t.CheckSVar, env), t.SVarCompare, env)) return false;
  if (t.ConditionDefined || t.ConditionPresent) {
    const zone = ZONES_FORGE[t.ConditionZone] || 'champ';
    const base = t.ConditionDefined ? forgeDefinis(P, t.ConditionDefined, env).filter(x => x.j == null) : objetsZone(P, zone);
    const n = t.ConditionPresent ? base.filter(o => forgeValideObjet(P, o, t.ConditionPresent, env.src, env.ctrl, env)).length : base.length;
    if (!seuilForge(P, n, t.ConditionCompare, env)) return false;
  }
  if (t.IsPresent) {
    const zone = ZONES_FORGE[t.PresentZone] || 'champ';
    const n = objetsZone(P, zone).filter(o => forgeValideObjet(P, o, t.IsPresent, env.src, env.ctrl, env)).length;
    if (!seuilForge(P, n, t.PresentCompare, env)) return false;
  }
  return true;
}

/* « Unless … pays » : rend vrai si le payeur a payé. Seuls le mana et la
   vie se proposent. */
function* paieUnlessForge(P, t, env) {
  const payeurs = forgeDefinis(P, t.UnlessPayer || (env.op.slot != null ? 'TargetedController' : 'You'), env).map(x => joueurDe(x));
  const c = coutForge(t.UnlessCost);
  if (!c || c.cout.engage || c.cout.sac || c.cout.defausse || c.cout.sacSoi) return false;
  for (const j of payeurs) {
    if (j == null || P.joueurs[j].elimine) continue;
    if (c.cout.vie && P.joueurs[j].vie <= c.cout.vie) continue;
    if (!planPaiement(P, j, c.cout.mana, 0)) continue;
    const r = yield question(P, j, 'oui', ['non', 'oui'], {texte: `Payer ${t.UnlessCost} ?`, source: env.ctx.source,
      extra: {saufForge: {contre: t.UnlessSwitched !== 'True'}}});
    if (r === 1 && paieMana(P, j, c.cout.mana, 0)) { if (c.cout.vie) P.joueurs[j].vie -= c.cout.vie; return true; }
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
  if (!api || !conditionForge(P, t, env)) return;
  if ((t.Optional === 'True' || t.OptionalDecider) && !api.optionnel) {
    /* Celui qui décide est nommé, jamais déduit des cibles. */
    const j = t.OptionalDecider ? forgeDefinis(P, t.OptionalDecider, env).map(x => joueurDe(x)).find(x => x != null) : ctx.ctrl;
    if (j == null) return;
    const r = yield question(P, j, 'oui', ['non', 'oui'], {texte: op.texte || 'Le faire ?', source: ctx.source, extra: {ops: [op]}});
    if (r !== 1) return;
  }
  if (t.UnlessCost) {
    const paye = yield* paieUnlessForge(P, t, env);
    if (paye === (t.UnlessSwitched !== 'True')) return;
  }
  if (t.RememberObjects) forgeDefinis(P, t.RememberObjects, env).forEach(x => retiensForge(ctx, x));
  if (t.RememberTargets) ciblesForge(P, env, false).forEach(x => retiensForge(ctx, x));
  yield* api.gen(P, t, env);
}

OPS.forge = executeForge;

/* Une zone de destination de Forge, dans le vocabulaire du moteur. */
function zoneForge(z) {
  const r = ZONES_FORGE[String(z || '').split(',')[0].trim()] || null;
  /* Ni la pile ni la zone de commandement : on n'y met rien qu'en lançant
     un sort ou en jouant un commandant. */
  return r === 'pile' || r === 'commandement' ? null : r;
}

/* Déplacer un objet où Forge le dit. Rend le nouvel identifiant. */
function* deplaceForge(P, o, dest, env, opts = {}) {
  if (!o || o.lki || o.j != null) return null;
  if (o.zone === 'pile') retireDeLaPile(P, o.id);
  if (dest === 'champ') {
    if (!o.def.types.some(x => TYPES_PERMANENTS.includes(x))) return null;
    const ctrl = opts.ctrl != null ? opts.ctrl : o.prop;
    return yield* metEnJeu(P, o.id, ctrl, {engage: !!opts.engage});
  }
  if (dest === 'bibliotheque') return deplace(P, o.id, opts.dessous ? 'dessous' : 'dessus');
  return deplace(P, o.id, dest);
}

/* Les objets d'une zone d'origine (`Battlefield,Graveyard`, `Any`). */
function dansOrigine(o, origine) {
  if (!origine || origine === 'Any') return true;
  return origine.split(',').some(z => ZONES_FORGE[z.trim()] === o.zone);
}

forgeEffet('ChangeZone', ['Origin', 'Destination', 'ChangeType', 'ChangeNum', 'Shuffle', 'Tapped', 'LibraryPosition',
  'GainControl', 'RememberChanged', 'DefinedPlayer', 'Chooser', 'ShuffleNonMandatory', 'NoLooking', 'Reorder', 'Duration'], function* (P, t, env) {
  const dest = zoneForge(t.Destination), ctx = env.ctx;
  if (!dest) return;
  /* « Exile … until ~ leaves the battlefield » : si l'hôte est déjà parti,
     rien n'est exilé (règle 610.3c). */
  const jusqua = t.Duration === 'UntilHostLeavesPlay';
  if (jusqua && (!env.src || env.src.lki || env.src.zone !== 'champ')) return;
  const opts = {engage: t.Tapped === 'True', ctrl: t.GainControl === 'True' ? env.ctrl : null, dessous: t.LibraryPosition === '-1'};
  const cache = /Library|Hand/.test(t.Origin || '') && env.op.slot == null && !t.Defined;
  let objets;
  if (cache || (t.ChangeType && env.op.slot == null && !t.Defined)) {
    const j = t.DefinedPlayer ? forgeDefinis(P, t.DefinedPlayer, env).map(x => joueurDe(x))[0] : env.ctrl;
    if (j == null) return;
    const zones = String(t.Origin || 'Library').split(',').map(z => ZONES_FORGE[z.trim()]).filter(Boolean);
    const ids = [].concat(...zones.map(z => z === 'champ' ? P.champ.filter(id => obj(P, id).ctrl === j) : P.joueurs[j][z].slice()))
      .filter(id => !t.ChangeType || forgeValideObjet(P, obj(P, id), t.ChangeType, env.src, env.ctrl, env));
    const n = t.ChangeNum === 'All' ? ids.length : forgeNombre(P, t.ChangeNum || 1, env);
    const pris = yield* choisitCartes(P, t.Chooser ? env.ctrl : j, ids, n, 'Chercher', 'cartes', t.Mandatory === 'True' ? n : 0);
    objets = pris.map(id => obj(P, id));
    if (zones.includes('bibliotheque') && t.Shuffle !== 'False') ctx._melange = j;
  } else objets = objetsForge(P, t, env).filter(o => dansOrigine(o, t.Origin));
  for (const o of objets) {
    const n = yield* deplaceForge(P, o, dest, env, opts);
    if (n != null && t.RememberChanged === 'True') retiensForge(ctx, n);
    if (n != null && dest === 'exil' && env.src && P.cartes[env.src.cid]) (P.cartes[env.src.cid].exilees = P.cartes[env.src.cid].exilees || []).push(n);
    if (n != null && jusqua && dest === 'exil') durees(P).retours.push({hote: env.src.id, ids: [n]});
  }
  if (ctx._melange != null) { melangeHasard(P.rng, P.joueurs[ctx._melange].bibliotheque); ctx._melange = null; }
}, (t, op) => {
  const o = String(t.Origin || ''), d = t.Destination;
  if (/Library|Hand/.test(o) && op.slot == null && !t.Defined) {
    op.op = 'cherche'; op.hostile = false; op.n = 1; op.desc = {types: /Land/.test(t.ChangeType || '') ? ['land'] : []};
  } else if (/Battlefield/.test(o) || (!o && op.slot != null)) {
    op.op = d === 'Exile' ? 'exile' : d === 'Graveyard' ? 'detruit' : 'place';
    op.vers = d === 'Hand' ? 'main' : d === 'Library' ? 'dessus' : null;
    op.a = op.slot != null ? {cible: op.slot} : {soi: 1};
    op.hostile = d !== 'Battlefield';
  } else { op.op = 'place'; op.vers = d === 'Battlefield' ? 'champ' : 'main'; op.hostile = false; }
}, {optionnel: false, prepare: t => !t.Duration || t.Duration === 'UntilHostLeavesPlay'});

forgeEffet('ChangeZoneAll', ['Origin', 'Destination', 'ChangeType', 'Shuffle', 'LibraryPosition', 'RememberChanged'], function* (P, t, env) {
  const dest = zoneForge(t.Destination);
  if (!dest) return;
  const zones = String(t.Origin || 'Battlefield').split(',').map(z => ZONES_FORGE[z.trim()]).filter(Boolean);
  const objets = [].concat(...zones.map(z => objetsZone(P, z))).filter(o => forgeValideObjet(P, o, t.ChangeType || 'Card', env.src, env.ctrl, env));
  for (const o of objets) {
    const n = yield* deplaceForge(P, o, dest, env, {dessous: t.LibraryPosition === '-1'});
    if (n != null && t.RememberChanged === 'True') retiensForge(env.ctx, n);
  }
  if (dest === 'bibliotheque' && t.Shuffle === 'True') P.joueurs.forEach(J => melangeHasard(P.rng, J.bibliotheque));
}, (t, op) => { op.op = /Battlefield/.test(t.Origin || 'Battlefield') ? 'exile' : 'forge'; op.a = {chaque: descForge(t.ChangeType || 'Card')}; op.hostile = false; });

forgeEffet('Draw', ['NumCards', 'RememberDrawn'], function* (P, t, env) {
  const n = forgeNombre(P, t.NumCards || 1, env);
  for (const j of joueursForge(P, t, env)) {
    const avant = P.joueurs[j].main.slice();
    piocheN(P, j, n);
    if (t.RememberDrawn === 'True') P.joueurs[j].main.filter(id => !avant.includes(id)).forEach(id => retiensForge(env.ctx, id));
  }
}, (t, op) => { op.op = 'pioche'; op.n = nombreIA(t.NumCards || 1); op.qui = quiIA(t, op); op.hostile = false; });

forgeEffet('Discard', ['NumCards', 'Mode', 'DiscardValid', 'RememberDiscarded'], function* (P, t, env) {
  const n = forgeNombre(P, t.NumCards || 1, env);
  for (const j of joueursForge(P, t, env)) {
    const main = P.joueurs[j].main.filter(id => !t.DiscardValid || forgeValideObjet(P, obj(P, id), t.DiscardValid, env.src, env.ctrl, env));
    let ids;
    if (t.Mode === 'Hand') ids = main;
    else if (t.Mode === 'Random') ids = melangeHasard(P.rng, main.slice()).slice(0, n);
    else if (t.Mode === 'RevealYouChoose') ids = yield* choisitCartes(P, env.ctrl, main, n, 'Faire défausser', 'defausse');
    else if (!t.Mode || t.Mode === 'TgtChoose') ids = yield* choisitCartes(P, j, main, n, 'Défausser', 'defausse');
    else return;
    ids.forEach(id => { const nid = defausseCarte(P, id, j); if (t.RememberDiscarded === 'True') retiensForge(env.ctx, nid); });
  }
}, (t, op) => { op.op = 'defausse'; op.n = nombreIA(t.NumCards || 1); op.qui = quiIA(t, op); op.hostile = !(op.qui && op.qui.vous); });

forgeEffet('Mill', ['NumCards', 'Destination', 'RememberMilled'], function* (P, t, env) {
  const n = forgeNombre(P, t.NumCards || 1, env), dest = zoneForge(t.Destination) || 'cimetiere';
  for (const j of joueursForge(P, t, env)) {
    const B = P.joueurs[j].bibliotheque;
    for (let k = 0; k < n && B.length; k++) { const nid = deplace(P, B[B.length - 1], dest); if (t.RememberMilled === 'True') retiensForge(env.ctx, nid); }
  }
}, (t, op) => { op.op = 'meule'; op.n = nombreIA(t.NumCards || 1); op.qui = quiIA(t, op); op.hostile = !(op.qui && op.qui.vous); });

/* Le nombre qu'une table annonce, pour l'IA : un entier, ou X. */
function nombreIA(v) { return /^\d+$/.test(String(v)) ? +v : 'X'; }

/* À qui une table profite ou nuit, pour l'IA. */
function quiIA(t, op) {
  if (op.slot != null) return {cible: op.slot};
  if (!t.Defined || t.Defined === 'You') return {vous: 1};
  if (/Opponent|Player\.Other/.test(t.Defined)) return {chaque: {genre: 'joueur', joueur: 'adv'}};
  return {chaque: {genre: 'joueur'}};
}
