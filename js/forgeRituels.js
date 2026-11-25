/* =====================================================================
   js/forgeRituels.js — Les rituels d'EDHREC

   Lot F105. Ce que les rituels qui n'étaient pas jouables entièrement
   demandaient :
   - des cibles dont le nombre ou les valeurs dépendent de X (Agadeem's
     Awakening : « mana value X or less », toutes de valeurs différentes ;
     Reunion of the House : une force totale ; Behold the Sinister Six : des
     noms différents) — X est annoncé avant les cibles (js/forgeInstantsG.js) ;
   - ce que le coût a défaussé (`Discarded$Valid`, Grab the Prize) ;
   - un sort lancé depuis l'exil (`Count$Foretold`, Haunting Voyage,
     Starnheim Unleashed) ;
   - des joueurs désignés par ce qu'ils contrôlent (Fade from History) ;
   - retirer des marqueurs à son gré (Eventide's Shadow) ;
   - des sorts qu'on peut lancer comme avec la célérité pour un coût de plus
     (`MayFlashCost`, Tegwyll's Scouring, Saproling Symbiosis, Asinine
     Antics) ;
   - un coût de rappel (flashback) qui s'engage ou qui montre (Battle
     Screech, Kindle the Inner Flame) ;
   - « les terrains ne se dégagent pas » (Bontu's Last Reckoning), la moitié
     de tout (Pox Plague), ce qui s'est passé le tour d'avant (Command the
     Stage), les joueurs sous la moitié de leur vie (Game Over).
   ===================================================================== */

/* —— Les restrictions des cibles ———————————————————————————————————— */

['TargetsWithDifferentCMC', 'TargetsWithDifferentNames', 'MaxTotalTargetPower'].forEach(k => FORGE_COMMUNS.add(k));
forgeSait('param', 'TargetsWithDifferentCMC', 'TargetsWithDifferentNames', 'MaxTotalTargetPower');
emplacementForge = (g => function (t, face) {
  const r = g(t, face);
  if (t.TargetsWithDifferentCMC === 'True') r.restr = {...(r.restr || {}), cmcDiff: true};
  if (t.TargetsWithDifferentNames === 'True') r.restr = {...(r.restr || {}), noms: true};
  if (/^\d+$/.test(t.MaxTotalTargetPower || '')) r.puissanceMax = +t.MaxTotalTargetPower;
  /* « Mana value X or less » : X s'annonce avant les cibles (js/forgeInstantsG.js). */
  if (/cmc(LE|GE|EQ|LT|GT)X\b/.test(t.ValidTgts || '')) {
    r.xCibles = true;
    const expr = t.TargetMax != null && !/^\d+$/.test(t.TargetMax) ? String(face.svars[t.TargetMax] || t.TargetMax) : null;
    if (expr && /xPaid|^X$/.test(expr)) { r.maxExpr = 'X'; r.maxFace = face; }
  }
  return r;
})(emplacementForge);
restreintCibles = (g => function (P, sl, l) {
  let r = g(P, sl, l);
  const o = c => (typeof c === 'number' ? obj(P, c) : null);
  if (sl.restr && sl.restr.cmcDiff) { const vus = new Set(); r = r.filter(c => { const x = o(c), v = x ? mvDe(x) : -1; if (vus.has(v)) return false; vus.add(v); return true; }); }
  if (sl.puissanceMax != null) { let s = 0; r = r.filter(c => { const x = o(c), v = x ? Math.max(0, x.def.force || 0) : 0; if (s + v > sl.puissanceMax) return false; s += v; return true; }); }
  return r;
})(restreintCibles);

/* —— Ce que le coût a défaussé, ce qu'on a présagé —————————————————————— */

exprEtendue = (g => function (P, tete, q, env) {
  let k;
  const src = env.src, cp = (env.ctx && env.ctx.coutPaye) || (src && src.lance && src.lance.coutPaye) || {};
  /* `Discarded$Valid Card.nonLand` : combien des cartes défaussées au coût répondent au filtre. */
  if (tete === 'Discarded' && (k = /^Valid (.+)$/.exec(q)))
    return (cp.defausses || []).map(id => passeOuPresent(P, id)).filter(x => x && forgeValideObjet(P, x, k[1], src, env.ctrl, env, true)).length;
  /* `Count$Foretold.1.0` : lancé depuis l'exil, à son coût de présage. */
  if (tete === 'Count' && /^Foretold\./.test(q)) return siSinon(P, q, !!src && !!src.lance && src.lance.depuis === 'exil' && !!(src.def && src.def.presage), env);
  /* `PlayerCountPlayers$ConditionLEY LifeTotal` (Game Over) : des joueurs à la moitié de leur vie de départ ou moins. */
  if (/^PlayerCount(Players)?$/.test(tete) && q === 'ConditionLEY LifeTotal') return vivants(P).filter(J => J.vie <= Math.floor((J.vieDepart || 20) / 2)).length;
  /* Pox Plague : les valeurs du joueur de la boucle. */
  if (tete === 'PlayerCountRemembered' && /^(LifeTotal|CardsInHand)$/.test(q)) return ((env.ctx && env.ctx.memoJ) || []).reduce((s, j) => s + (q === 'LifeTotal' ? P.joueurs[j].vie : P.joueurs[j].main.length), 0);
  return g(P, tete, q, env);
})(exprEtendue);
forgeSait('expr', 'Discarded$Valid', 'Count$Foretold', 'PlayerCountPlayers$ConditionLEY', 'PlayerCountRemembered$LifeTotal', 'PlayerCountRemembered$CardsInHand');

/* —— Des joueurs désignés par ce qu'ils contrôlent ———————————————————— */

definisEtendus = (g => function (P, v, env) {
  let m;
  /* `Player.controlsEnchantment,controlsArtifact` : ceux qui contrôlent l'un ou l'autre. */
  if ((m = /^Player\.(controls\w+(?:,controls\w+)*)$/.exec(v)))
    return vivants(P).filter(J => m[1].split(',').some(c => champDe(P, J.i).some(o => estType(o, c.slice(8).toLowerCase())))).map(J => ({j: J.i}));
  return g(P, v, env);
})(definisEtendus);
forgeSait('defini', 'Player.controlsEnchantment,controlsArtifact');

/* —— Retirer des marqueurs à son gré —————————————————————————————————— */

FORGE_API.RemoveCounter.gen = (g => function* (P, t, env) {
  if (t.CounterNum !== 'Any' || t.Choices !== 'Permanent') return yield* g(P, t, env);
  const unites = [];
  P.champ.map(id => obj(P, id)).forEach(o => Object.entries(o.marq || {}).forEach(([genre, n]) => { for (let k = 0; k < n; k++) unites.push({o, genre}); }));
  if (!unites.length) return;
  const pris = yield* choisitCartes(P, env.ctrl, unites.map((u, i) => i), unites.length, 'Marqueurs à retirer', 'cartes', 0);
  pris.forEach(i => { const u = unites[i]; u.o.marq[u.genre]--; emet(P, {t: 'marqueurRetire', id: u.o.id, genre: u.genre, n: 1}); });
  P.ver++;
  if (t.RememberAmount === 'True') env.ctx.nombre = pris.length;
})(FORGE_API.RemoveCounter.gen);
forgeSait('param', 'RemoveCounter.Choices', 'RemoveCounter.ChoiceOptional', 'RemoveCounter.RememberAmount');

/* —— Les sorts qu'on peut lancer à l'éclair en payant davantage ———————————————— */

/* `K:MayFlashCost:2` / `:tapXType<3/Creature.withFlying/…>` : « you may cast this spell as though it had flash if you pay… ». */
estEphemere = (g => function (def) { return !!def.mayFlashCost || g(def); })(estEphemere);
variantesSort = (g => function (P, j, o, depuis) {
  const r = g(P, j, o, depuis), d = o.def;
  if (!d.mayFlashCost || depuis !== 'main') return r;
  /* À la vitesse d'un rituel, le sort se lance comme d'ordinaire ; à celle d'un éphémère, il n'a que la variante qui coûte plus. */
  if (enPhasePrincipale(P, j)) return r;
  const base = coutSort(P, j, o, depuis), c = d.mayFlashCost;
  const mana = c.mana && c.mana.total ? sommeMana(base, c.mana) : base, autre = autresCout(c);
  return payableAvec(P, j, o, mana, 0) && (!Object.keys(autre).length || coutAutrePossible(P, j, o, autre)) ? [{variante: 'flashcost', mana, autre: Object.keys(autre).length ? autre : d.coutSup || null, def: null}] : [];
})(variantesSort);

/* —— Les terrains qui ne se dégagent pas ———————————————————————————————— */

/* Bontu's Last Reckoning : « lands you control don't untap during your next untap step ». */
FORGE_API.Effect.prepare = (p => function (t, op) {
  const r = t.ReplacementEffects && op.face && op.face.svars[String(t.ReplacementEffects).trim()];
  if (r && /Event\$ *Untap/.test(r) && /ValidCard\$ *Land\.YouCtrl/.test(r)) { op.terrainsSansDegager = true; return true; }
  return p.call(this, t, op);
})(FORGE_API.Effect.prepare);
FORGE_API.Effect.gen = (g => function* (P, t, env) {
  if (!env.op.terrainsSansDegager) return yield* g(P, t, env);
  P.joueurs[env.ctrl].terrainsGeles = P.joueurs[env.ctrl].tours + 1;
})(FORGE_API.Effect.gen);
degagementEmpeche = (g => function (P, o) {
  return (estType(o, 'land') && P.joueurs[o.ctrl].terrainsGeles === P.joueurs[o.ctrl].tours) || g(P, o);
})(degagementEmpeche);

/* —— Ce qui s'est passé le tour d'avant ———————————————————————————————— */

noteHistorique = (g => function (P, e) {
  g(P, e);
  if (e.t === 'degatsJoueur' && !e.combat) { const h = histoire(P); plusUn(h.recuHorsCombat = h.recuHorsCombat || {}, e.joueur, e.n || 0); }
})(noteHistorique);
proprieteJoueurEtendue = (g => function (P, j, p, ctrl, env) {
  if (p === 'wasDealtNonCombatDamageLastTurn') return !!P.histPrec && ((P.histPrec.recuHorsCombat || {})[j] || 0) > 0;
  return g(P, j, p, ctrl, env);
})(proprieteJoueurEtendue);
forgeSait('expr', 'PlayerCountOpponents$HasPropertywasDealtNonCombatDamageLastTurn');

/* —— Des filtres de plus ———————————————————————————————————————————— */

proprieteDesignee = (g => function (P, o, p, c, src, ctrl, env) {
  /* `Creature.!sharesCreatureTypeWith Convoked` (Everything Comes to Dust) : un type partagé avec une créature qui a convoqué. */
  if (p === 'sharesCreatureTypeWith Convoked') {
    const convoque = ((src && src.convoquees) || []).map(id => obj(P, id)).filter(Boolean);
    return convoque.some(x => PARTAGES.CreatureType(P, c, x));
  }
  return g(P, o, p, c, src, ctrl, env);
})(proprieteDesignee);
forgeSait('filtre', 'sharesCreatureTypeWith Convoked', 'SharesColorWith Valid Creature.Legendary+YouCtrl');

/* —— Des boucles, des votes, un échange de vie ————————————————————————— */

/* « Any number of target opponents each… » : on boucle sur les joueurs visés (Will of the Abzan). */
FORGE_API.RepeatEach.gen = (g => function* (P, t, env) { return yield* g(P, t.RepeatTargeted ? {...t, RepeatPlayers: 'TargetedPlayer'} : t, env); })(FORGE_API.RepeatEach.gen);
FORGE_API.RepeatEach.prepare = (p => function (t, op) { return p.call(this, t.RepeatTargeted ? {...t, RepeatPlayers: 'TargetedPlayer'} : t, op); })(FORGE_API.RepeatEach.prepare);
forgeSait('param', 'RepeatEach.RepeatTargeted');

/* Le vote pour une carte (Council's Judgment) : chacun vote, à partir de celui qui lance ; les cartes qui ont le plus de voix, ou à égalité, passent à la suite. */
FORGE_API.Vote.gen = (g => function* (P, t, env) {
  if (!t.VoteCard) return yield* g(P, t, env);
  const candidats = objetsZone(P, 'champ').filter(o => forgeValideObjet(P, o, t.VoteCard, env.src, env.ctrl, env)).map(o => o.id);
  if (!candidats.length) return;
  const votants = forgeDefinis(P, t.Defined || 'Player', env).map(x => joueurDe(x)).filter(j => j != null && !P.joueurs[j].elimine);
  votants.sort((a, b) => ((a - env.ctrl + P.nb) % P.nb) - ((b - env.ctrl + P.nb) % P.nb));
  const voix = new Map(candidats.map(id => [id, 0]));
  for (const j of votants) {
    const [id] = yield* choisitCartes(P, j, candidats, 1, 'Voter pour un permanent', 'cartes', 1);
    if (id != null) voix.set(id, voix.get(id) + 1);
  }
  const max = Math.max(...voix.values());
  jn(P, 'Vote : ' + [...voix].filter(([, n]) => n).map(([id, n]) => `${nomObj(P, id)} ${n}`).join(', '));
  env.ctx.memo.length = 0;
  [...voix].filter(([, n]) => n === max && n > 0).forEach(([id]) => retiensForge(env.ctx, id));
  yield* joueSous(P, env, t.VoteSubAbility);
})(FORGE_API.Vote.gen);
FORGE_API.Vote.prepare = (p => function (t, op) {
  if (!t.VoteCard) return p.call(this, t, op);
  return !!t.VoteSubAbility && sousEffets(op, [t.VoteSubAbility]);
})(FORGE_API.Vote.prepare);
forgeSait('param', 'Vote.VoteCard', 'Vote.VoteSubAbility');

/* Deux joueurs échangent leur vie ; la différence se garde (Profane Transfusion). */
forgeEffet('ExchangeLife', ['RememberDifference'], function* (P, t, env) {
  const [a, b] = ciblesForge(P, env, false).filter(x => x && x.j != null).map(x => x.j);
  if (a == null || b == null || a === b) return;
  const va = P.joueurs[a].vie, vb = P.joueurs[b].vie;
  P.joueurs[a].vie = vb; P.joueurs[b].vie = va; P.ver++;
  if (t.RememberDifference === 'True') env.ctx.nombre = va - vb;
  jn(P, `${P.joueurs[a].nom} et ${P.joueurs[b].nom} échangent leur vie`);
}, (t, op) => { op.op = 'forge'; op.hostile = true; });
