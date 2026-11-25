/* =====================================================================
   js/forgeArtefactsH.js — Les artefacts d'EDHREC : dés, jetons, début de tour

   Lot F108 :
   - Celebr-8000 : `RollDice | SubsForEach | NoteDoubles` — deux dés, chaque
     résultat joue sa capacité, et un double donne le double initiative ;
   - Cryptic Gateway : `sharesCreatureTypeWithAll Tapped`, un type commun avec
     chaque créature engagée pour payer ;
   - Planetarium of Wan Shi Tong : `TurnBegin`, le début du tour (rien n'est
     retenu d'un tour à l'autre) ;
   - Brudiclad, Telchor Engineer : `Clone | CloneTarget | ChoiceOptional |
     ExcludeChosen` — chaque autre jeton copie celui qu'on a choisi ;
   - Cosima, The Omenkeel : `PutCounter | RememberAmount`,
     `Continuous | Duration`.
   ===================================================================== */

/* —— Des dés qui jouent chacun leur résultat ———————————————————————— */

forgeSait('param', 'RollDice.SubsForEach', 'RollDice.NoteDoubles');
FORGE_API.RollDice.gen = (g => function* (P, t, env) {
  if (t.SubsForEach !== 'True') return yield* g(P, t, env);
  const faces = forgeNombre(P, t.Sides || 6, env), n = forgeNombre(P, t.Amount || 1, env), r = [];
  for (let k = 0; k < n; k++) r.push(1 + entierHasard(P.rng, faces));
  jn(P, `${P.joueurs[env.ctrl].nom} lance ${n} dés : ${r.join(', ')}`);
  varsDe(env.ctx).Doubles = n > 1 && r.every(x => x === r[0]) ? 1 : 0;
  for (const v of r) {
    emet(P, {t: 'de', joueur: env.ctrl, n: v});
    const tr = tranchesDe(t.ResultSubAbilities).find(x => v >= x.a && v <= x.b);
    if (tr) yield* joueSous(P, env, tr.nom);
  }
})(FORGE_API.RollDice.gen);

/* —— Un type de créature en commun avec chacune ———————————————————————— */

proprieteDesignee = (g => function (P, o, p, c, src, ctrl, env) {
  if (p === 'sharesCreatureTypeWithAll Tapped') {
    const ids = (env && env.ctx && (env.ctx.engages || (env.ctx.evt && env.ctx.evt.engages))) || [];
    if (!ids.length) return false;
    const mine = (c.sousTypes || []).map(x => String(x).toLowerCase());
    return ids.every(id => { const x = passeOuPresent(P, id); return !!x && ((x.def.params && x.def.params.changelin) || c.changelin || (x.sousTypes || x.def.sousTypes || []).some(s => mine.includes(String(s).toLowerCase()))); });
  }
  return g(P, o, p, c, src, ctrl, env);
})(proprieteDesignee);
forgeSait('filtre', 'sharesCreatureTypeWithAll Tapped');

/* —— Le début du tour ——————————————————————————————————————————— */

debutDuTour = (g => function (P) { g(P); emet(P, {t: 'debutTour', joueur: P.actif}); })(debutDuTour);
forgeMode('TurnBegin', ['ValidPlayer'], (P, t, e, s, env) => e.t === 'debutTour' && joueurOuRien(P, e.joueur, t.ValidPlayer, s, env));

/* —— Tous les jetons deviennent une copie de celui-ci ————————————————————— */

forgeSait('param', 'Clone.ChoiceOptional', 'Clone.ExcludeChosen', 'Clone.CloneTarget', 'Clone.ChoiceTitle');
FORGE_API.Clone.gen = (g => function* (P, t, env) {
  if (!t.CloneTarget) return yield* g(P, t, env);
  const cands = objetsZone(P, 'champ').filter(o => forgeValideObjet(P, o, t.Choices || 'Card', env.src, env.ctrl, env)).map(o => o.id);
  if (!cands.length) return;
  const [id] = yield* choisitCartes(P, env.ctrl, cands, 1, t.ChoiceTitle || 'Choisir', 'cartes', t.ChoiceOptional === 'True' ? 0 : 1);
  const m = id != null ? obj(P, id) : null;
  if (!m) return;
  const cibles = objetsZone(P, 'champ').filter(o => forgeValideObjet(P, o, String(t.CloneTarget).replace(/^Valid /, ''), env.src, env.ctrl, env) && (t.ExcludeChosen !== 'True' || o.id !== m.id));
  for (const o of cibles) { o.def = defCopie(m.def, t, null); o.copie = true; }
  P.ver++;
  jn(P, `${cibles.length} jeton(s) deviennent des copies de ${m.def.nom}`);
})(FORGE_API.Clone.gen);

/* —— Cosima ———————————————————————————————————————————————— */

forgeSait('param', 'PutCounter.RememberAmount', 'Continuous.Duration');
FORGE_API.PutCounter.gen = (g => function* (P, t, env) {
  /* Un marqueur sur la carte elle-même, quand elle est exilée (Cosima : « voyage counter »). */
  if (env.src && env.src.zone === 'exil' && !env.src.lki && (!t.Defined || t.Defined === 'Self') && env.op.slot == null && t.CounterType) {
    const n = poseMarqueurs(P, env.src, genreMarqueur(t.CounterType), forgeNombre(P, t.CounterNum || 1, env), env.src);
    if (t.RememberAmount === 'True') env.ctx.nombre = n;
    return;
  }
  const avant = t.RememberAmount === 'True' ? (obj(P, env.src && env.src.id) && (obj(P, env.src.id).marq[genreMarqueur(t.CounterType)] || 0)) : 0;
  yield* g(P, t, env);
  if (t.RememberAmount === 'True' && env.src && obj(P, env.src.id)) env.ctx.nombre = (obj(P, env.src.id).marq[genreMarqueur(t.CounterType)] || 0) - avant;
})(FORGE_API.PutCounter.gen);

/* « It gains "Whenever a land you control enters, if ~ is exiled, …" » : un déclencheur donné à une carte qui vient d'être exilée (Cosima). */
FORGE_API.Animate.gen = (g => function* (P, t, env) {
  if (t.Triggers && env.op.accorde && env.op.accorde.capacites.length)
    for (const o of objetsForge(P, t, env).filter(x => x && x.j == null && x.zone === 'exil')) { (o.animeExil = o.animeExil || []).push({capacites: env.op.accorde.capacites}); P.ver++; }
  return yield* g(P, t, env);
})(FORGE_API.Animate.gen);
capacitesDe = (g => function (P, o) {
  const r = g(P, o);
  return o && o.zone === 'exil' && o.animeExil ? r.concat(...o.animeExil.map(a => a.capacites)) : r;
})(capacitesDe);
sourcesHorsChamp = (g => function (P) {
  const r = g(P);
  for (const J of P.joueurs) for (const id of J.exil) { const o = obj(P, id); if (o && o.animeExil && !r.includes(o)) r.push(o); }
  return r;
})(sourcesHorsChamp);
