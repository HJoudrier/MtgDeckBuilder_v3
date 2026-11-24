/* =====================================================================
   js/forgePlaneswalkersB.js — Des planeswalkers, un à un (suite)

   Lot F100. Des quantités, des paramètres et des évènements que
   js/forgePlaneswalkers.js n'a pas rangés :
   - `CounterRemovedOnce` (Chandra, Fire Artisan ; B.O.B.) et les marqueurs de
     loyauté que le coût d'une capacité pose ou retire (js/jeuActions.js) ;
   - `SetLoyalty$` d'une copie (Jace, Mirror Mage) ;
   - « if it would leave the battlefield, exile it instead » (Personal Decoy) ;
   - les attaquants d'un déclenchement (`TriggerObjectsAttackers$Valid`, Basri
     Ket), les créatures d'un joueur visé (`TargetedPlayer$CreaturesInPlay`,
     Gideon), les autres joueurs (`PlayerCountOther$Amount`, Kaya), un crime
     commis ce tour (`Count$CommittedCrimeThisTurn`, Oko, the Ringleader) ;
   - une durée à la place de la fin du tour pour `Debuff` (Mu Yanling), et « prevent
     all damage that would be dealt to ~ » (Oko, the Trickster).
   ===================================================================== */

/* —— Les marqueurs de loyauté, vus des déclencheurs ———————————————————— */

forgeMode('CounterRemovedOnce', ['ValidCard', 'CounterType', 'Static'], FORGE_MODES.CounterRemoved);
forgeSait('param', 'CounterAddedOnce.Static', 'CounterRemovedOnce.Static');
/* « The number of loyalty counters on ~ is equal to the number of Beebles you control » : la capacité s'écrit en deux déclencheurs, qui le tiennent. */
forgeSait('kw', 'The number of loyalty counters on CARDNAME is equal to the number of Beebles you control.');

/* —— Copier avec une autre loyauté ————————————————————————————————— */

etendEffet('CopyPermanent', ['SetLoyalty'], null, function* (P, t, env, touches, nouveaux) {
  if (t.SetLoyalty != null) nouveaux.forEach(o => { o.marq.loyaute = forgeNombre(P, t.SetLoyalty, env); P.ver++; });
});

/* —— Quitter le champ, c'est être exilé ————————————————————————————— */

/* « If ~ would leave the battlefield, exile it instead of putting it anywhere else » (Personal Decoy). Le cimetière passe par js/forgeRemplacements.js ; les autres zones, ici. */
formeRemplacement = (g => function (face, r) {
  const b = g(face, r);
  if (b || r.Event !== 'Moved' || r.Origin !== 'Battlefield' || r.ExcludeDestination !== 'Exile' || r.ValidCard !== 'Card.Self' || !r.ReplaceWith) return b;
  const w = forgeSousCapacite(face, r.ReplaceWith);
  return w && forgeApi(w) === 'ChangeZone' && w.Defined === 'ReplacedCard' && zoneForge(w.Destination) === 'exil' && !w.SubAbility ? 'exil' : b;
})(formeRemplacement);
forgeSait('param', 'Moved.ExcludeDestination', 'Moved.EffectZone');

deplace = (g => function (P, id, vers, opts) {
  const o = obj(P, id);
  if (o && o.zone === 'champ' && vers !== 'exil' && vers !== 'cimetiere' && vers !== 'champ' && (o.def.remplacements || []).some(r => r.forme === 'exil' && r.t.ExcludeDestination === 'Exile')) vers = 'exil';
  return g(P, id, vers, opts);
})(deplace);

/* —— Des quantités ———————————————————————————————————————————————— */

/* Les évènements de crime, retenus pour le tour (`Count$CommittedCrimeThisTurn.1.2`). */
noteHistorique = (g => function (P, e) {
  g(P, e);
  if (e && e.t === 'crime') (P.crimeTour = P.crimeTour || {})[e.joueur] = P.tour;
})(noteHistorique);

exprDesignations = (g => function (P, tete, q, env) {
  const ctx = env.ctx || {}, evt = ctx.evt || {};
  if (tete === 'PlayerCountOther' && q === 'Amount') return vivants(P).length - 1;
  if (tete === 'TargetedPlayer' && q === 'CreaturesInPlay') {
    const j = ciblesForge(P, env, false).filter(x => x && x.j != null).map(x => x.j)[0];
    return j == null ? 0 : champDe(P, j).filter(estCreature).length;
  }
  let m;
  if (tete === 'TriggerObjectsAttackers' && (m = /^Valid (.+)$/.exec(q))) {
    return (evt.ids || []).map(id => obj(P, id)).filter(o => o && forgeValideObjet(P, o, m[1], env.src, env.ctrl, env)).length;
  }
  if (tete === 'Count' && /^CommittedCrimeThisTurn\./.test(q)) return siAlors(P, q, (P.crimeTour || {})[env.ctrl] === P.tour, env);
  return g(P, tete, q, env);
})(exprDesignations);
forgeSait('expr', 'PlayerCountOther$Amount', 'TargetedPlayer$CreaturesInPlay', 'TriggerObjectsAttackers$Valid', 'Count$CommittedCrimeThisTurn');

/* —— Une capacité qui retire un mot-clé, un temps ——————————————————————— */

/* « Until your next turn, up to one target creature … loses flying » (Mu Yanling, Sky Dancer). */
FORGE_API.Debuff.gen = (g => function* (P, t, env) {
  if (!t.Duration) return yield* g(P, t, env);
  const fd = finForge(t, env) || {fin: 'tour'}, m = motsForge(t.Keywords);
  objetsForge(P, t, env, 'Targeted').filter(o => o.zone === 'champ' && !o.lki).forEach(o => { o.mods.push({f: 0, e: 0, mots: 0, retire: m, ...fd}); P.ver++; });
})(FORGE_API.Debuff.gen);
FORGE_API.Debuff.prepare = (p => (t, op) => t.Duration === 'UntilYourNextTurn' && !t.AllSuffixKeywords ? true : p(t, op))(FORGE_API.Debuff.prepare);
forgeSait('param', 'Debuff.Duration');

/* « Prevent all damage that would be dealt to ~ » (Oko, the Trickster) : l'avantage d'une capacité de pompe, le temps du tour. */
CACHES_DU_TOUR['prevent all damage that would be dealt to cardname.'] = {prevVers: true};
forgeSait('kwval', 'prevent all damage that would be dealt to cardname.');

/* —— Retenir ce qu'on a détruit —————————————————————————————————————— */

/* `DestroyAll | RememberAllObjects$ True` (Angrath, Minotaur Pirate) : ce qui a péri est retenu, par son instantané, pour la suite — « damage equal to their total power ». */
FORGE_API.DestroyAll.gen = (g => function* (P, t, env) {
  if (t.RememberAllObjects !== 'True') return yield* g(P, t, env);
  const avant = objetsZone(P, 'champ').filter(o => forgeValideObjet(P, o, t.ValidCards || 'Permanent', env.src, env.ctrl, env)).map(o => o.id);
  yield* g(P, t, env);
  avant.filter(id => !obj(P, id)).forEach(id => retiensForge(env.ctx, id));
})(FORGE_API.DestroyAll.gen);
forgeSait('param', 'DestroyAll.RememberAllObjects');

/* —— B.O.B. ——————————————————————————————————————————————————— */

motCleLancementB = (g => function (def, face, jetons, tete, reste) {
  if (tete === 'The number of loyalty counters on CARDNAME is equal to the number of Beebles you control.' && !reste.length) return true;
  return g(def, face, jetons, tete, reste);
})(motCleLancementB);

/* —— Entrer avec un marqueur de plus, pour tous les autres —————————————————— */

/* « Each creature you control enters with an additional +1/+1 counter » porté par un effet (Arlinn, the Pack's Hope) : un remplacement `Moved` qui vise les créatures
   qui entrent, non une carte retenue. */
formeRemplacement = (g => function (face, r) {
  const b = g(face, r);
  if (b || r.Event !== 'Moved' || r.Destination !== 'Battlefield' || !r.ValidCard || r.ValidCard === 'Card.IsRemembered' || /Self/.test(r.ValidCard) || r.Origin || !r.ReplaceWith) return b;
  const w = forgeSousCapacite(face, r.ReplaceWith);
  return w && forgeApi(w) === 'PutCounter' && w.Defined === 'ReplacedCard' && w.ETB === 'True' && !w.SubAbility && genreMarqueur(w.CounterType) && /^\d+$/.test(w.CounterNum || '1') ? 'entreAvecGen' : b;
})(formeRemplacement);
entreAvecPrevu = (g => function (P, id) {
  const l = g(P, id), o = obj(P, id);
  if (!o) return l;
  for (const {src, r} of remplacementsEnJeu(P)) {
    if (r.forme !== 'entreAvecGen' || !forgeValideObjet(P, o, r.t.ValidCard, src, src.ctrl, envRemplacement(src, r), true)) continue;
    const w = forgeSousCapacite(r.face, r.t.ReplaceWith);
    l.push({genre: genreMarqueur(w.CounterType), n: +(w.CounterNum || 1)});
  }
  return l;
})(entreAvecPrevu);

/* —— Copier une carte et la lancer ——————————————————————————————————— */

/* « Copy it three times. You may cast the copies without paying their mana costs » (Chandra, Pyromaster) : des copies de la carte choisie, lancées gratuitement. Une copie
   est une carte qui n'existe que le temps de sa vie sur la pile. */
FORGE_API.Play.gen = (g => function* (P, t, env) {
  if (t.CopyCard !== 'True' || !t.Defined) return yield* g(P, t, env);
  const j = env.ctrl, n = forgeNombre(P, t.Amount || 1, env);
  for (const modele of forgeDefinis(P, t.Defined, env).filter(x => x && x.j == null && x.def)) {
    for (let k = 0; k < n; k++) {
      if (t.Optional === 'True' && (yield question(P, j, 'oui', ['non', 'oui'], {texte: `Lancer une copie de ${modele.def.nom} sans payer ?`, source: env.ctx.source})) !== 1) continue;
      const c = conjure(P, j, modele.def);
      c.jeton = true; P.cartes[c.cid].jeton = true; P.cartes[c.cid].copieSort = true;
      const ok = yield* lanceDepuisEffet(P, j, c, true);
      if (!ok && obj(P, c.id) && obj(P, c.id).zone === 'main') deplace(P, c.id, 'exil');
    }
  }
})(FORGE_API.Play.gen);
FORGE_API.Play.prepare = (p => (t, op) => t.CopyCard === 'True' && !!t.Defined && !t.Valid ? true : p(t, op))(FORGE_API.Play.prepare);
forgeSait('param', 'Play.AllowRepeats', 'Play.CopyCard', 'Play.Defined');

/* —— Les donjons finis ———————————————————————————————————————————— */

/* `DungeonsCompleted$DifferentCardNames` : le moteur ne joue qu'un donjon, d'un seul nom. */
exprDesignations = (g => function (P, tete, q, env) {
  if (tete === 'DungeonsCompleted' && q === 'DifferentCardNames') return Math.min(1, P.joueurs[env.ctrl].donjonsFinis || 0);
  return g(P, tete, q, env);
})(exprDesignations);
forgeSait('expr', 'DungeonsCompleted$DifferentCardNames');

/* —— Choisir parmi des cartes désignées ———————————————————————————— */

/* « Choose a token » parmi ce qu'on a retenu (`DefinedCards$ Remembered`, Nahiri, Heir of the Ancients). */
FORGE_API.ChooseCard.gen = (g => function* (P, t, env) {
  if (!t.DefinedCards) return yield* g(P, t, env);
  const j = joueursForge(P, t, env)[0];
  if (j == null) return;
  const ids = forgeDefinis(P, t.DefinedCards, env).filter(x => x && x.j == null).map(x => x.id);
  const pris = ids.length ? yield* choisitCartes(P, j, ids, 1, 'Choisir', 'cartes', t.Mandatory === 'True' ? 1 : 0) : [];
  choixDe(P, env.src).cartes = pris;
  if (t.RememberChosen === 'True') pris.forEach(id => retiensForge(env.ctx, id));
})(FORGE_API.ChooseCard.gen);
forgeSait('param', 'ChooseCard.DefinedCards');

/* —— La première phase de combat ———————————————————————————————————— */

/* `FirstCombat$ True` d'un déclencheur de phase (Zariel, Archduke of Avernus : « at the end of the first combat phase on your turn »). */
FORGE_MODES.Phase = (juge => function (P, t, e, s, env) { return juge(P, t, e, s, env) && (t.FirstCombat !== 'True' || (P.combatsTour || 0) <= 1); })(FORGE_MODES.Phase);
forgeSait('param', 'Phase.FirstCombat');

/* —— Des cartes face cachée, de la force qu'on dit ———————————————————————— */

/* « Put any number of cards from your hand onto the battlefield face down. They're 5/5 artifact creatures » (Tezzeret, Cruel Machinist). */
let FACE_CACHEE_FORCEE = null;
defFaceCachee = (g => function (d) {
  const r = g(d);
  if (!FACE_CACHEE_FORCEE) return r;
  const f = FACE_CACHEE_FORCEE;
  return {...r, force: f.force, endurance: f.endurance, types: f.types};
})(defFaceCachee);
FORGE_API.ChangeZone.gen = (g => function* (P, t, env) {
  if (t.FaceDownPower == null) return yield* g(P, t, env);
  const ty = typesForge(String(t.FaceDownSetType || '').replace(/&/g, ','));
  FACE_CACHEE_FORCEE = {force: +t.FaceDownPower, endurance: +t.FaceDownToughness, types: ty.types.length ? ty.types : ['creature']};
  try { yield* g(P, t, env); } finally { FACE_CACHEE_FORCEE = null; }
})(FORGE_API.ChangeZone.gen);
forgeSait('param', 'ChangeZone.FaceDownPower', 'ChangeZone.FaceDownToughness', 'ChangeZone.FaceDownSetType');

/* —— Un de chaque sorte parmi le dessus ————————————————————————————— */

/* `DigMultiple | ChangeValid$ Creature,Land` (Kiora, Master of the Depths) : parmi le dessus de la bibliothèque, au plus une carte de chaque sorte rejoint la main — une
   créature, un terrain — et le reste va à `DestinationZone2$`. */
forgeEffet('DigMultiple', ['DigNum', 'Reveal', 'ChangeValid', 'DestinationZone', 'DestinationZone2', 'Optional'], function* (P, t, env) {
  const j = env.ctrl, B = P.joueurs[j].bibliotheque, dessus = B.slice(-forgeNombre(P, t.DigNum || 1, env)).reverse();
  if (!dessus.length) return;
  const prises = [];
  for (const v of String(t.ChangeValid || 'Card').split(',')) {
    const l = dessus.filter(id => !prises.includes(id) && forgeValideObjet(P, obj(P, id), v.trim(), env.src, env.ctrl, env));
    if (l.length) prises.push(...yield* choisitCartes(P, j, l, 1, 'Prendre', 'cartes', t.Optional === 'True' ? 0 : 1));
  }
  const d1 = zoneForge(t.DestinationZone) || 'main', d2 = zoneForge(t.DestinationZone2) || 'bibliotheque';
  for (const id of prises) yield* deplaceForge(P, obj(P, id), d1, env, {});
  for (const id of dessus.filter(x => !prises.includes(x))) { if (d2 === 'bibliotheque') { retireDe(B, id); B.unshift(id); } else yield* deplaceForge(P, obj(P, id), d2, env, {}); }
}, (t, op) => { op.op = 'cherche'; op.n = 1; op.hostile = false; op.desc = {types: []}; });

/* —— Au hasard parmi ce qu'on peut choisir ———————————————————————————— */

/* `ChooseCard | AtRandom$ True` (Freyalise : un elfe au hasard dans sa main). */
FORGE_API.ChooseCard.gen = (g => function* (P, t, env) {
  if (t.AtRandom !== 'True') return yield* g(P, t, env);
  const j = joueursForge(P, t, env)[0];
  if (j == null) return;
  const zone = ZONES_FORGE[t.ChoiceZone] || 'champ';
  const ids = objetsZone(P, zone).filter(o => forgeValideObjet(P, o, t.Choices || 'Card', env.src, env.ctrl, env)).map(o => o.id);
  const pris = ids.length ? [ids[entierHasard(P.rng, ids.length)]] : [];
  choixDe(P, env.src).cartes = pris;
  if (t.RememberChosen === 'True') pris.forEach(id => retiensForge(env.ctx, id));
})(FORGE_API.ChooseCard.gen);
forgeSait('param', 'ChooseCard.AtRandom');

/* —— « Perpetually » ——————————————————————————————————————————————— */

/* `Duration$ Perpetual` (Alchemy) : un bonus de force et d'endurance qui reste à la carte, de zone en zone — gardé sur la carte du jeu, non sur l'objet. */
FORGE_API.Pump.gen = (g => function* (P, t, env) {
  if (t.Duration !== 'Perpetual') return yield* g(P, t, env);
  const f = forgeNombre(P, t.NumAtt || 0, env), e = forgeNombre(P, t.NumDef || 0, env);
  const zones = String(t.PumpZone || 'Battlefield').split(',').map(z => ZONES_FORGE[z.trim()]).filter(Boolean);
  objetsForge(P, t, env, 'Targeted').filter(o => o && o.j == null && !o.lki && zones.includes(o.zone)).forEach(o => {
    const k = P.cartes[o.cid]; k.perpetuel = {f: ((k.perpetuel || {}).f || 0) + f, e: ((k.perpetuel || {}).e || 0) + e}; o.perpetuel = k.perpetuel; P.ver++;
  });
})(FORGE_API.Pump.gen);
FORGE_API.Pump.prepare = (p => (t, op) => t.Duration === 'Perpetual' && !t.KW && /^[+-]?\d+$/.test(t.NumAtt || '0') && /^[+-]?\d+$/.test(t.NumDef || '0') ? true : p(t, op))(FORGE_API.Pump.prepare);
forgeSait('param', 'Pump.PumpZone');

/* L'objet naît avec ce que sa carte a gagné, et `animation()` le lit. */
creeObjet = (g => function (P, cid, prop, zone, ctrl) {
  const o = g(P, cid, prop, zone, ctrl), k = P.cartes[cid];
  if (k && k.perpetuel) o.perpetuel = k.perpetuel;
  return o;
})(creeObjet);
animation = (g => function (o) {
  const r = g(o);
  return o.perpetuel && o.def && o.def.force != null ? {...r, force: r.force + o.perpetuel.f, endurance: r.endurance + o.perpetuel.e} : r;
})(animation);

/* —— Un déclencheur retardé au tour d'un joueur ————————————————————————— */

/* « During target opponent's next turn, creatures that player controls attack ~ if able » (Gideon Jura) : le déclencheur retardé ne part qu'au tour du joueur désigné
   (`DelayedTriggerDefinedPlayer$ Targeted`). L'obligation d'attaquer ne nomme pas Gideon : les créatures attaquent, sans être forcées sur lui — moins qu'imprimé. */
FORGE_API.DelayedTrigger.gen = (g => function* (P, t, env) {
  const n = (durees(P).retardes || []).length;
  yield* g(P, t, env);
  if (!t.DelayedTriggerDefinedPlayer) return;
  const j = forgeDefinis(P, t.DelayedTriggerDefinedPlayer, env).map(x => joueurDe(x)).find(x => x != null), l = durees(P).retardes;
  if (j != null && l.length > n) l[l.length - 1].joueurCible = j;
})(FORGE_API.DelayedTrigger.gen);
forgeSait('param', 'DelayedTrigger.DelayedTriggerDefinedPlayer');

/* « Upkeep-> » : à partir de l'entretien — le premier moment du tour, qui suffit à un déclencheur retardé (Gideon Jura). */
FORGE_PHASES['Upkeep->'] = 'entretien';

/* —— Attacher à l'adversaire de son choix ———————————————————————————— */

/* « For each Aura attached to you, attach it to an opponent of your choice » (The Unluckiest Planeswalker) : `Attach | PlayerChoices$ Opponent`. */
FORGE_API.Attach.gen = (g => function* (P, t, env) {
  if (!t.PlayerChoices) return yield* g(P, t, env);
  const cands = forgeDefinis(P, t.PlayerChoices, env).filter(x => x && x.j != null).map(x => x.j);
  if (!cands.length) return;
  for (const o of forgeDefinis(P, t.Object || 'Self', env).filter(x => x && x.j == null && !x.lki && x.zone === 'champ')) {
    const j = cands[yield* choisitUn(P, env.ctrl, cands.map(i => P.joueurs[i].nom), 'Attacher à quel adversaire ?', 0, env.ctx.source)];
    o.att = null; o.attJoueur = j; P.ver++;
  }
})(FORGE_API.Attach.gen);
forgeSait('param', 'Attach.PlayerChoices');
