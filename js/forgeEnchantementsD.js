/* =====================================================================
   js/forgeEnchantementsD.js — Les enchantements d'EDHREC : des filtres, des déclencheurs

   Lot F109 :
   - Descendants' Path : un type de créature en commun avec une créature qu'on
     contrôle (`sharesCreatureTypeWith Valid …`), et `Play | ForgetRemembered` ;
   - Echoing Assault, Roar of Resistance : l'attaque vue du défenseur ;
   - Karmic Justice : `Destroyed`, le déclencheur de ce qui détruit ;
   - Loot Dispute : `DungeonCompleted` ;
   - Vesuvan Duplimancy : un sort qui ne vise qu'une cible ;
   - Ugin's Mastery : `SetState | Choices` ; Battle for Bretagard : des
     copies de jetons de noms différents ;
   - Ashes of the Abhorrent : plus de capacités activées depuis un cimetière ;
   - Witness Protection, Honest Work : `SetName`, un nom qui ne change que
     l'affichage — le jeu ne lit jamais le nom d'une créature enchantée.
   ===================================================================== */

/* —— Un type en commun avec une de nos créatures ——————————————————————— */

forgeSait('filtre', 'sharesCreatureTypeWith Valid Creature.YouCtrl', 'attacking TriggeredAttackedTarget', 'attacking Valid Planeswalker.OppCtrl');
proprieteDesignee = (g => function (P, o, p, c, src, ctrl, env) {
  let m;
  if ((m = /^sharesCreatureTypeWith Valid (.+)$/.exec(p)))
    return !!P && P.champ.some(id => { const x = obj(P, id); return x.id !== o.id && forgeValideObjet(P, x, m[1], src, ctrl, env) && PARTAGES.CreatureType(P, {...c, nom: o.def.nom}, x); });
  /* Attaquer le même joueur que celui dont l'attaque vient de se déclarer. */
  if (p === 'attacking TriggeredAttackedTarget') {
    const d = P && P.combat && P.combat.attaquants.get(o.id), e = env && env.ctx && env.ctx.evt, vu = e && e.defs && e.defs[0];
    return !!d && !!vu && (vu.j != null ? d.j === vu.j : d.pw === vu.pw);
  }
  /* Attaquer un planeswalker d'un adversaire. */
  if ((m = /^attacking Valid (.+)$/.exec(p))) {
    const d = P && P.combat && P.combat.attaquants.get(o.id), pw = d && d.pw != null ? obj(P, d.pw) : null;
    return !!pw && forgeValideObjet(P, pw, m[1], src, ctrl, env);
  }
  return g(P, o, p, c, src, ctrl, env);
})(proprieteDesignee);

/* « Look at the top card; you may cast it… » : ce qu'on a lancé n'est plus retenu — le reste file au fond. */
forgeSait('param', 'Play.ForgetRemembered', 'Play.ConditionPresent');
FORGE_API.Play.gen = (g => function* (P, t, env) {
  const avant = t.ForgetRemembered === 'True' ? (env.ctx.memo || []).slice() : [];
  yield* g(P, t, env);
  if (t.ForgetRemembered !== 'True') return;
  env.ctx.memo = env.ctx.memo.filter(id => !avant.includes(id) || (obj(P, id) && obj(P, id).zone === 'bibliotheque'));
})(FORGE_API.Play.gen);

/* —— Détruire : qui, et quoi ————————————————————————————————————— */

forgeMode('Destroyed', ['ValidCauser', 'ValidCard', 'ValidSource'], (P, t, e, s, env) => e.t === 'detruitParEffet' && valideOuRien(P, obj(P, e.id) || e.lki, t.ValidCard, s, env) &&
  joueurOuRien(P, e.causeur, t.ValidCauser, s, env));
definisEtendus = (g => function (P, v, env) {
  if (v === 'TriggeredCauser') { const e = env.ctx && env.ctx.evt; return e && e.causeur != null ? [{j: e.causeur}] : []; }
  return g(P, v, env);
})(definisEtendus);
forgeSait('defini', 'TriggeredCauser', 'Player.NotedForDiscard');
forgeSait('param', 'Destroy.TargetsWithDefinedController');
/* Ce qu'un sort ou une capacité détruit : l'évènement porte celui qui contrôle la source. */
for (const nom of ['Destroy', 'DestroyAll']) {
  FORGE_API[nom].gen = (g => function* (P, t, env) {
    const cibles = nom === 'Destroy' ? objetsForge(P, t, env, 'Targeted') : objetsZone(P, 'champ').filter(o => forgeValideObjet(P, o, t.ValidCards || 'Permanent', env.src, env.ctrl, env));
    const vus = cibles.filter(o => o && o.zone === 'champ' && !o.lki).map(o => [o.id, instantane(P, o)]);
    yield* g(P, t, env);
    for (const [id, lki] of vus) { const o = obj(P, id); if (!o || o.zone !== 'champ') emet(P, {t: 'detruitParEffet', id, lki, causeur: env.ctrl, source: env.src && env.src.id}); }
  })(FORGE_API[nom].gen);
}

/* —— Un donjon terminé ————————————————————————————————————————— */

forgeMode('DungeonCompleted', ['ValidPlayer'], (P, t, e, s, env) => e.t === 'donjonFini' && joueurOuRien(P, e.joueur, t.ValidPlayer, s, env));
FORGE_API.Venture.gen = (g => function* (P, t, env) {
  const avant = P.joueurs[env.ctrl].donjonsFinis || 0;
  yield* g(P, t, env);
  if ((P.joueurs[env.ctrl].donjonsFinis || 0) > avant) emet(P, {t: 'donjonFini', joueur: env.ctrl});
})(FORGE_API.Venture.gen);

/* —— Un sort qui ne vise qu'une cible, copiée sans être légendaire ——————————————— */

forgeSait('param', 'SpellCast.IsSingleTarget');
FORGE_MODES.SpellCast = (j => function (P, t, e, s, env) {
  if (t.IsSingleTarget === 'True') {
    const cibles = ciblesDuSort(P, e.id), uniques = [...new Set(cibles.map(c => c.id != null ? c.id : 'j' + c.j))];
    if (uniques.length !== 1) return false;
  }
  return j(P, t, e, s, env);
})(FORGE_MODES.SpellCast);

/* —— Retourner une créature face cachée ——————————————————————————— */

forgeSait('param', 'SetState.Choices', 'SetState.ChoiceTitle');
FORGE_API.SetState.gen = (g => function* (P, t, env) {
  if (!t.Choices) return yield* g(P, t, env);
  const ids = objetsZone(P, 'champ').filter(o => o.faceCachee && forgeValideObjet(P, o, t.Choices, env.src, env.ctrl, env)).map(o => o.id);
  if (!ids.length) return;
  const [id] = yield* choisitCartes(P, env.ctrl, ids, 1, t.ChoiceTitle || 'Retourner face visible', 'cartes', 0);
  if (id != null && obj(P, id)) retourneFace(P, obj(P, id));
})(FORGE_API.SetState.gen);

/* —— Des copies de jetons de noms différents ————————————————————————— */

forgeSait('param', 'CopyPermanent.WithDifferentNames');
FORGE_API.CopyPermanent.gen = (g => function* (P, t, env) {
  if (t.WithDifferentNames !== 'True' || !t.Choices) return yield* g(P, t, env);
  const choisis = [], noms = new Set();
  for (;;) {
    const ids = objetsZone(P, 'champ').filter(o => !choisis.includes(o.id) && !noms.has(o.def.nom) && t.Choices.split(',').some(f => forgeValideObjet(P, o, f, env.src, env.ctrl, env))).map(o => o.id);
    if (!ids.length) break;
    const [id] = yield* choisitCartes(P, env.ctrl, ids, 1, 'Copier ce jeton (ou aucun)', 'cartes', 0);
    if (id == null) break;
    choisis.push(id); noms.add(obj(P, id).def.nom);
  }
  if (!choisis.length) return;
  yield* g(P, {...t, Choices: undefined, WithDifferentNames: undefined, Defined: 'Remembered'}, {...env, ctx: {...env.ctx, memo: choisis}});
})(FORGE_API.CopyPermanent.gen);

/* —— Plus de capacités depuis un cimetière ——————————————————————————— */

horsChampTenable = (g => function (t) { return (t.Mode === 'CantBeActivated' && t.AffectedZone === 'Graveyard' && t.ValidCard === 'Card') || g(t); })(horsChampTenable);

/* —— Un nom qui ne change que l'affichage ———————————————————————————— */

forgeSait('param', 'Continuous.SetName');
