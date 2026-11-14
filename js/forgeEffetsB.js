/* =====================================================================
   js/forgeEffetsB.js — Les effets de Forge : regarder la bibliothèque,
   dégâts et vie, retraits, jetons et marqueurs

   Suite de js/forgeEffetsA.js. Chaque effet lit ses paramètres dans la
   table, ses objets par `objetsForge()` (ce qu'il cible, sinon ce que
   `Defined$` désigne) et ses quantités par `forgeNombre()`, au moment de
   la résolution.
   ===================================================================== */

forgeEffet('Dig', ['DigNum', 'ChangeNum', 'ChangeValid', 'DestinationZone', 'DestinationZone2', 'LibraryPosition',
  'LibraryPosition2', 'DefinedPlayer', 'AnyNumber', 'Optional', 'RememberChanged'], function* (P, t, env) {
  const j = t.DefinedPlayer ? forgeDefinis(P, t.DefinedPlayer, env).map(x => joueurDe(x))[0] : env.ctrl;
  if (j == null) return;
  const B = P.joueurs[j].bibliotheque, n = forgeNombre(P, t.DigNum || 1, env);
  const dessus = B.slice(-n).reverse();
  if (!dessus.length) return;
  const ok = dessus.filter(id => !t.ChangeValid || forgeValideObjet(P, obj(P, id), t.ChangeValid, env.src, env.ctrl, env));
  const k = t.ChangeNum === 'All' ? ok.length : forgeNombre(P, t.ChangeNum || 1, env);
  const libre = t.AnyNumber === 'True' || t.Optional === 'True';
  const pris = yield* choisitCartes(P, env.ctrl, ok, k, 'Prendre', 'cartes', libre ? 0 : k);
  const d1 = zoneForge(t.DestinationZone) || 'main', d2 = zoneForge(t.DestinationZone2) || 'bibliotheque';
  for (const id of pris) {
    const nid = yield* deplaceForge(P, obj(P, id), d1, env, {dessous: t.LibraryPosition === '-1'});
    if (nid != null && t.RememberChanged === 'True') retiensForge(env.ctx, nid);
  }
  for (const id of dessus.filter(x => !pris.includes(x))) {
    if (d2 === 'bibliotheque') { if (t.LibraryPosition2 !== '0') { retireDe(B, id); B.unshift(id); } }
    else yield* deplaceForge(P, obj(P, id), d2, env, {});
  }
}, (t, op) => { op.op = 'cherche'; op.n = 1; op.hostile = false; op.desc = {types: /Land/.test(t.ChangeValid || '') ? ['land'] : []}; },
{optionnel: true});

/* Regarder le dessus et en envoyer une part dessous (regard) ou au
   cimetière (surveillance). */
function* regardeForge(P, j, n, cimetiere) {
  const B = P.joueurs[j].bibliotheque, dessus = B.slice(-n).reverse();
  if (!dessus.length) return;
  const partent = yield* choisitCartes(P, j, dessus, dessus.length, cimetiere ? 'Surveiller' : 'Regard', 'scrute', 0);
  partent.forEach(id => { if (cimetiere) deplace(P, id, 'cimetiere'); else { retireDe(B, id); B.unshift(id); } });
}

forgeEffet('Scry', ['ScryNum'], function* (P, t, env) {
  for (const j of joueursForge(P, t, env)) yield* regardeForge(P, j, forgeNombre(P, t.ScryNum || 1, env), false);
}, (t, op) => { op.op = 'scrute'; op.n = nombreIA(t.ScryNum || 1); op.hostile = false; });

forgeEffet('Surveil', ['Amount'], function* (P, t, env) {
  for (const j of joueursForge(P, t, env)) yield* regardeForge(P, j, forgeNombre(P, t.Amount || 1, env), true);
}, (t, op) => { op.op = 'scrute'; op.cimetiere = true; op.n = nombreIA(t.Amount || 1); op.hostile = false; });

/* La source des dégâts : `DamageSource$`, sinon la source de la capacité. */
function sourceDegats(P, t, env) {
  return (t.DamageSource ? forgeDefinis(P, t.DamageSource, env).find(x => x.j == null) : null) || env.src;
}

forgeEffet('DealDamage', ['NumDmg', 'DamageSource', 'DividedAsYouChoose'], function* (P, t, env) {
  const n = forgeNombre(P, t.NumDmg || 0, env), src = sourceDegats(P, t, env);
  const cibles = env.op.slot != null ? ciblesForge(P, env, false) : forgeDefinis(P, t.Defined || 'Targeted', env);
  if (t.DividedAsYouChoose && cibles.length > 1) {
    /* Réparti : de quoi tuer chaque créature dans l'ordre des cibles, le
       reste à la dernière. Simplification annoncée : on ne demande pas. */
    /* Au moins 1 à chaque cible (règle 601.2d), puis ce qu'il faut pour
       tuer chaque créature dans l'ordre, le reste à la dernière. */
    let reste = forgeNombre(P, t.DividedAsYouChoose, env) - cibles.length;
    const parts = cibles.map(() => 1);
    cibles.forEach((c, i) => {
      if (i === cibles.length - 1 || reste <= 0 || c.j != null || c.zone !== 'champ') return;
      const plus = Math.min(reste, Math.max(0, car(P, c).endurance - c.bless - 1));
      parts[i] += plus; reste -= plus;
    });
    if (reste > 0) parts[parts.length - 1] += reste;
    cibles.forEach((c, i) => infligeDegats(P, src, c, parts[i], false));
    return;
  }
  for (const c of cibles) infligeDegats(P, src, c, n, false);
}, (t, op) => { op.op = 'degats'; op.n = nombreIA(t.NumDmg || 0); op.a = op.slot != null ? {cible: op.slot} : null; op.hostile = op.slot != null || /Opponent/.test(t.Defined || ''); });

forgeEffet('DamageAll', ['NumDmg', 'ValidCards', 'ValidPlayers', 'DamageSource'], function* (P, t, env) {
  const n = forgeNombre(P, t.NumDmg || 0, env), src = sourceDegats(P, t, env);
  const objets = t.ValidCards ? objetsZone(P, 'champ').filter(o => forgeValideObjet(P, o, t.ValidCards, env.src, env.ctrl, env)) : [];
  const joueurs = t.ValidPlayers ? vivants(P).filter(J => forgeValideJoueur(P, J.i, t.ValidPlayers, env.ctrl, env)).map(J => ({j: J.i})) : [];
  for (const c of [...objets, ...joueurs]) infligeDegats(P, src, c, n, false);
}, (t, op) => { op.op = 'degats'; op.n = nombreIA(t.NumDmg || 0); op.a = t.ValidCards ? {chaque: descForge(t.ValidCards)} : null; op.hostile = false; });

forgeEffet('GainLife', ['LifeAmount'], function* (P, t, env) {
  const n = forgeNombre(P, t.LifeAmount || 0, env);
  joueursForge(P, t, env).forEach(j => gagneVie(P, j, n));
}, (t, op) => { op.op = 'gagneVie'; op.n = nombreIA(t.LifeAmount || 0); op.qui = quiIA(t, op); op.hostile = false; });

forgeEffet('LoseLife', ['LifeAmount'], function* (P, t, env) {
  const n = forgeNombre(P, t.LifeAmount || 0, env);
  joueursForge(P, t, env).forEach(j => { if (n > 0) { P.joueurs[j].vie -= n; emet(P, {t: 'perteVie', joueur: j, n}); } });
}, (t, op) => { op.op = 'perdVie'; op.n = nombreIA(t.LifeAmount || 0); op.qui = quiIA(t, op); op.hostile = !(op.qui && op.qui.vous); });

/* Détruire : l'indestructible reste. */
function detruitForge(P, objets, sansRegeneration) {
  const ok = objets.filter(o => o.zone === 'champ' && !o.lki && !aMot(P, o, MOT.INDESTRUCTIBLE));
  if (ok.length) jn(P, `Détruit : ${ok.map(o => o.def.nom).join(', ')}`);
  ok.forEach(o => detruitObjet(P, o, sansRegeneration));
}

forgeEffet('Destroy', ['NoRegen'], function* (P, t, env) { detruitForge(P, objetsForge(P, t, env, 'Targeted'), t.NoRegen === 'True'); },
  (t, op) => { op.op = 'detruit'; op.a = op.slot != null ? {cible: op.slot} : {soi: 1}; op.hostile = op.slot != null; });

forgeEffet('DestroyAll', ['ValidCards', 'NoRegen'], function* (P, t, env) {
  detruitForge(P, objetsZone(P, 'champ').filter(o => forgeValideObjet(P, o, t.ValidCards || 'Permanent', env.src, env.ctrl, env)), t.NoRegen === 'True');
}, (t, op) => { op.op = 'detruit'; op.a = {chaque: descForge(t.ValidCards || 'Permanent')}; op.hostile = false; });

forgeEffet('Sacrifice', ['SacValid', 'Amount', 'RememberSacrificed'], function* (P, t, env) {
  const v = t.SacValid || 'Self';
  if (/^(Self|CARDNAME|Card\.Self)$/.test(v)) {
    const o = forgeDefinis(P, 'Self', env)[0];
    if (o && !o.lki && o.zone === 'champ' && o.ctrl === env.ctrl) { const lki = instantane(P, o); sacrifie(P, o.id); env.ctx.sacrifies = [lki]; }
    return;
  }
  const n = forgeNombre(P, t.Amount || 1, env);
  for (const j of joueursForge(P, t, env)) {
    const ids = champDe(P, j).filter(o => forgeValideObjet(P, o, v, env.src, env.ctrl, env)).map(o => o.id);
    const choix = yield* choisitCartes(P, j, ids, n, 'Sacrifier', 'sacrifice');
    choix.forEach(id => {
      const lki = instantane(P, obj(P, id));
      sacrifie(P, id);
      (env.ctx.sacrifies = env.ctx.sacrifies || []).push(lki);
      if (t.RememberSacrificed === 'True') retiensForge(env.ctx, lki.id);
    });
  }
}, (t, op) => { op.op = 'sacrifie'; op.n = nombreIA(t.Amount || 1); op.qui = quiIA(t, op); op.hostile = !(op.qui && op.qui.vous); });

forgeEffet('SacrificeAll', ['ValidCards'], function* (P, t, env) {
  objetsZone(P, 'champ').filter(o => forgeValideObjet(P, o, t.ValidCards || 'Permanent', env.src, env.ctrl, env)).forEach(o => sacrifie(P, o.id));
}, (t, op) => { op.op = 'detruit'; op.a = {chaque: descForge(t.ValidCards || 'Permanent')}; op.hostile = false; });

forgeEffet('Counter', ['Destination'], function* (P, t, env) {
  const dest = zoneForge(t.Destination) || 'cimetiere';
  for (const o of objetsForge(P, t, env, 'Targeted').filter(o => o.zone === 'pile' && !incontrecarrable(P, o))) {
    retireDeLaPile(P, o.id);
    deplace(P, o.id, dest === 'bibliotheque' ? 'dessus' : dest);
    jn(P, `${o.def.nom} est contrecarré`);
  }
}, (t, op) => { op.op = 'contre'; op.a = op.slot != null ? {cible: op.slot} : null; op.hostile = true; });

/* Créer des jetons, d'après leurs scripts (`TokenScript$ b_2_2_zombie`). */
function* creeJetonsForge(P, defs, n, qui, engage, env, retenir) {
  for (const j of qui) for (const def of defs) for (let k = 0; k < n; k++) {
    if (P.champ.length >= PLAFOND_CHAMP) { P.fin = P.fin || {nulle: true, raison: 'plafond'}; return; }
    const o = creeObjet(P, nouvelleCarte(P, def, j, false, true), j, 'champ');
    o.engage = !!engage;
    if (def.loyaute != null) o.marq.loyaute = def.loyaute;
    P.champ.push(o.id);
    P.ver++;
    emet(P, {t: 'entre', id: o.id, ctrl: j, jeton: true});
    noteEntree(P, null, 'champ', o);
    if (retenir) retiensForge(env.ctx, o.id);
  }
  if (defs.length && n) jn(P, `${n * qui.length} jeton(s) ${defs.map(d => d.nom).join(', ')}`);
}

forgeEffet('Token', ['TokenScript', 'TokenAmount', 'TokenOwner', 'TokenTapped', 'RememberTokens', 'AttachedTo'], function* (P, t, env) {
  const defs = String(t.TokenScript || '').split(',').map(s => (env.op.jetons || {})[s.trim()]).filter(Boolean);
  const qui = t.TokenOwner ? forgeDefinis(P, t.TokenOwner, env).map(x => joueurDe(x)).filter(j => j != null && !P.joueurs[j].elimine) : [env.ctrl];
  const avant = P.champ.length;
  yield* creeJetonsForge(P, defs, forgeNombre(P, t.TokenAmount || 1, env), qui, t.TokenTapped === 'True', env, t.RememberTokens === 'True');
  /* Un jeton qui naît attaché (un équipement, une aura) à ce qu'on désigne. */
  const hote = t.AttachedTo ? forgeDefinis(P, t.AttachedTo, env).find(x => x && x.j == null && x.zone === 'champ') : null;
  if (hote) P.champ.slice(avant).forEach(id => { obj(P, id).att = hote.id; P.ver++; });
}, (t, op) => {
  op.op = 'jetons'; op.n = nombreIA(t.TokenAmount || 1); op.hostile = false;
  op._def = Object.values(op.jetons || {})[0] || {types: ['creature'], force: 1, endurance: 1, mots: 0, capacites: [], statiques: [], mv: 0};
});

/* Des marqueurs sur des permanents, ou — énergie, poison — sur des joueurs. */
forgeEffet('PutCounter', ['CounterType', 'CounterNum', 'ETB'], function* (P, t, env) {
  const g = genreMarqueur(t.CounterType), n = forgeNombre(P, t.CounterNum || 1, env);
  const l = env.op.slot != null ? ciblesForge(P, env, false) : forgeDefinis(P, t.Defined || 'Self', env);
  l.forEach(x => {
    if (x.j != null) { const J = P.joueurs[x.j]; if (g === 'energy') J.energie = (J.energie || 0) + n; else if (g === 'poison') J.poison += n; return; }
    if (x.zone === 'champ' && !x.lki) { x.marq[g] = (x.marq[g] || 0) + n; P.ver++; }
  });
}, (t, op) => { op.op = 'marqueurs'; op.genre = genreMarqueur(t.CounterType); op.n = nombreIA(t.CounterNum || 1); op.a = op.slot != null ? {cible: op.slot} : {soi: 1}; op.hostile = op.genre === '-1/-1'; });

forgeEffet('PutCounterAll', ['CounterType', 'CounterNum', 'ValidCards'], function* (P, t, env) {
  const g = genreMarqueur(t.CounterType), n = forgeNombre(P, t.CounterNum || 1, env);
  objetsZone(P, 'champ').filter(o => forgeValideObjet(P, o, t.ValidCards || 'Permanent', env.src, env.ctrl, env)).forEach(o => { o.marq[g] = (o.marq[g] || 0) + n; P.ver++; });
}, (t, op) => { op.op = 'marqueurs'; op.genre = genreMarqueur(t.CounterType); op.n = nombreIA(t.CounterNum || 1); op.hostile = false; });

forgeEffet('RemoveCounter', ['CounterType', 'CounterNum'], function* (P, t, env) {
  const g = genreMarqueur(t.CounterType);
  objetsForge(P, t, env).filter(o => o.zone === 'champ' && !o.lki).forEach(o => {
    const n = t.CounterNum === 'All' ? (o.marq[g] || 0) : forgeNombre(P, t.CounterNum || 1, env);
    o.marq[g] = Math.max(0, (o.marq[g] || 0) - n); P.ver++;
  });
}, (t, op) => { op.op = 'forge'; op.hostile = op.slot != null; });

forgeEffet('Proliferate', [], function* (P, t, env) { yield* OPS.prolifere(P, {}, env.ctx); },
  (t, op) => { op.op = 'prolifere'; op.hostile = false; });
