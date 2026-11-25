/* =====================================================================
   js/forgeFiltresE.js — Des filtres et des désignations qui n'étaient lus de personne

   Lot F103. Un filtre ou une désignation que le moteur ne connaît pas ne
   laisse rien passer : la carte qui s'en sert paraît jouée, et ne fait rien
   (comme les Umbra, corrigées au lot précédent). La couverture ne regardait
   pas toutes les clés où ils se glissent (`AffectedDefined$`, `Choices$`,
   `ConditionDefined$`, `Valid$`…) ; elle le fait maintenant, et ce fichier
   donne leur sens à ceux qui manquaient :
   - ce qui s'est passé ce tour : `DrawnThisTurn` (Sylvan Library),
     `blockedThisTurn`, `SaddledThisTurn`, `sneaked`, `spectacle`,
     `firstTurnControlled` ;
   - les extrêmes : `leastPower`, `leastToughness`, `…ControlledByOpponent`,
     `greatestCMC_…ControlledByRemembered`, `greatestRememberedCMC`,
     `yardGreatestPower` ; les joueurs `withMostLife`, `withLowestLife`,
     `lifeEQX`, `OpponentOf Remembered` ;
   - la parenté : `sharesControllerWith`, `sharesCardTypeWith`,
     `SharesCMCWith`, `CanBeEnchantedBy`, `CanBeSacrificedBy`, `targetedBy` ;
   - le lot d'un déclencheur « one or more » : `TriggeredCards`,
     `TriggeredSources` (Colossal Grave-Reaver, Zurgo and Ojutai) ;
   - ce que le coût a payé : `Collected` (les cartes exilées pour collecter
     des indices), `Discarded`, `Returned`, `Tapped`.
   ===================================================================== */

/* —— Le lot d'un déclencheur « one or more » ——————————————————————————— */

/* Tous les évènements du lot qui répondent au déclencheur : ce que `TriggeredCards` désigne ensuite. */
function noteLotDeclencheur(P, t, e, s, env, juge) {
  const ids = [], sources = [];
  for (const x of P._evtsLot || [e]) {
    let ok = false;
    try { ok = juge(P, t, x, s, {...env, ctx: {...env.ctx, evt: x}}); } catch (err) { ok = false; }
    if (!ok) continue;
    if (x.id != null) ids.push(x.id);
    if (x.source != null) sources.push(x.source);
  }
  (e.lotIds = e.lotIds || {})[s.id] = {ids, sources};
}
const lotDe = env => { const e = env.ctx && env.ctx.evt, s = env.src; return (e && e.lotIds && s && e.lotIds[s.id]) || null; };
const objetsDeIds = (P, ids) => ids.map(id => passeOuPresent(P, id)).filter(o => o && o.j == null);

definisEtendus = (g => function (P, v, env) {
  const ctx = env.ctx || {}, cp = ctx.coutPaye || {};
  switch (v) {
    case 'TriggeredCards': { const l = lotDe(env); return l ? objetsDeIds(P, l.ids) : []; }
    case 'TriggeredSources': { const l = lotDe(env); return l ? objetsDeIds(P, l.sources) : []; }
    case 'Collected': case 'CastSA>Collected': { const s = env.src; return objetsDeIds(P, ((s && s.lance && s.lance.collectees) || (s && s.collectees) || [])); }
    case 'Discarded': return objetsDeIds(P, cp.defausses || []);
    case 'Returned': return objetsDeIds(P, cp.renvoyes || []);
    case 'Tapped': return objetsDeIds(P, ctx.engages || []);
    /* « Search the top third of your library, rounded up ». */
    case 'TopThirdOfLibrary': { const B = P.joueurs[env.ctrl].bibliotheque; return B.slice(-Math.ceil(B.length / 3)).reverse().map(id => obj(P, id)); }
  }
  return g(P, v, env);
})(definisEtendus);
forgeSait('defini', 'TriggeredCards', 'TriggeredSources', 'Collected', 'CastSA>Collected', 'Discarded', 'Returned', 'Tapped', 'TopThirdOfLibrary', 'AttachedTo');

/* Ce que « Collect evidence » a exilé : l'objet se rappelle son coût. */
/* —— Les filtres ———————————————————————————————————————————————————— */

const BASIQUES_F = ['plains', 'island', 'swamp', 'mountain', 'forest'];
const memoObjets = (P, env) => ((env && env.ctx && env.ctx.memo) || []).map(id => passeOuPresent(P, id)).filter(Boolean);
const creaturesDe = (P, pred) => P.champ.map(id => obj(P, id)).filter(x => estCreature(x) && pred(x));

proprieteDesignee = (g => function (P, o, p, c, src, ctrl, env) {
  const joueur = ctrl != null ? ctrl : o.ctrl;
  let m;
  switch (p) {
    /* « The card that triggered it » : Valakut compte les autres Montagnes (`!TriggeredCard`). */
    case 'TriggeredCard': { const e = env && env.ctx && env.ctx.evt, id = e && (e.id != null ? e.id : e.ancien); return id != null && (id === o.id || (!!P && suit(P, id) === o.id)); }
    case 'DrawnThisTurn': return !!P && o.piocheTour === P.tour;
    case 'leastPower': return !!P && estCreature(o) && !creaturesDe(P, x => car(P, x).force < c.force).length;
    case 'leastToughness': return !!P && estCreature(o) && !creaturesDe(P, x => car(P, x).endurance < c.endurance).length;
    case 'leastToughnessControlledByOpponent':
      return !!P && estCreature(o) && o.ctrl !== joueur && !creaturesDe(P, x => x.ctrl !== joueur && car(P, x).endurance < c.endurance).length;
    case 'yardGreatestPower': return !!P && o.zone === 'cimetiere' && !P.joueurs[o.prop].cimetiere.some(id => { const x = obj(P, id); return x && x.def.types.includes('creature') && (x.def.force || 0) > (o.def.force || 0); });
    case 'greatestRememberedCMC': { const l = memoObjets(P, env); return l.some(x => x.id === o.id || suit(P, x.id) === o.id) && !l.some(x => mvDe(x) > mvDe(o)); }
    case 'targetedBy': return !!env && ciblesObjets(P, env).some(id => id === o.id || suit(P, id) === o.id);
    case 'AllColors': return (c.couleurs || []).length === 5;
    case 'colorless': return !(c.couleurs || []).length;
    case 'firstTurnControlled': return !!P && o.entreTour === P.tour;
    case 'withSuspend': return !!o.def.suspension;
    case 'sneaked': return !!(o.lance && o.lance.sneaked);
    case 'spectacle': return o.varianteLance === 'spectacle';
    case 'DoubleFaced': return !!o.def.dos || o.def.modeFaces === 'Transform';
    case 'hasANonBasicLandType': return (c.sousTypes || []).some(t => !BASIQUES_F.includes(t) && SOUSTYPES_TERRAIN_F.has(t));
    case 'SaddledThisTurn': return !!P && !!src && !!src.enfourchePar && src.enfourchePar.tour === P.tour && src.enfourchePar.ids.includes(o.id);
    case 'blockedThisTurn': case 'blockedOrBeenBlockedSinceYourLastUpkeep':
      return !!P && (histoire(P).blocs || []).some(b => b.blq === o.id || (p !== 'blockedThisTurn' && b.att === o.id));
    case 'CanBeSacrificedBy': return !!P && !sacrificeInterdit(P, o, true);
    case 'CanBeEnchantedBy': return !!src && !!src.def && !!src.def.aura && forgeValideObjet(P, o, src.def.aura.forge || 'Card', src, src.ctrl, env, true);
    case 'TriggeredCards': { const l = env && lotDe(env); return !!l && l.ids.some(id => id === o.id || suit(P, id) === o.id); }
  }
  /* Les extrêmes, par type et par contrôleur : `greatestCMC_Creature…`, `…NonLandPermanent…ControlledByRemembered`. */
  if ((m = /^greatestCMC_(Creature|NonLandPermanent)ControlledByRemembered$/.exec(p))) {
    const qui = (env && env.ctx && env.ctx.memoJ) || [];
    const du = x => x.ctrl === o.ctrl && (m[1] === 'Creature' ? estCreature(x) : !estType(x, 'land'));
    return !!P && qui.includes(o.ctrl) && du(o) && !P.champ.map(id => obj(P, id)).some(x => du(x) && mvDe(x) > mvDe(o));
  }
  /* Les liens entre deux objets : « shares a controller with the targeted permanent », « shares a card type with… ». */
  if ((m = /^sharesControllerWith (AttachedBy )?Targeted$/.exec(p))) {
    const cible = env && cibleForge(P, env, false);
    const x = cible && (m[1] ? obj(P, cible.att) : cible);
    return !!x && x.ctrl === o.ctrl;
  }
  if ((m = /^sharesCardTypeWith (.+)$/.exec(p))) {
    const x = refObjetFiltre(P, m[1], env);
    return !!x && !!c.types && TYPES_PARTAGES.some(t => c.types.includes(t) && (x.types || (x.def && x.def.types) || []).includes(t));
  }
  if (p === 'SharesCMCWith Imprinted') { const l = empreinteDe(P, env.ctx, src).map(id => passeOuPresent(P, id)).filter(Boolean); return l.some(x => mvDe(x) === mvDe(o)); }
  return g(P, o, p, c, src, ctrl, env);
})(proprieteDesignee);

const TYPES_PARTAGES = ['artifact', 'creature', 'enchantment', 'land', 'planeswalker', 'battle', 'instant', 'sorcery', 'kindred'];
/* Les sous-types de terrain (hors basiques) : Desert, Gate, Locus, Urza's… sans les confondre avec ceux d'une créature. */
const SOUSTYPES_TERRAIN_F = new Set(['desert', 'gate', 'lair', 'locus', 'mine', 'power-plant', 'tower', 'cave', 'sphere', 'town', 'forest', 'plains', 'island', 'swamp', 'mountain']);

/* L'objet que désigne la fin d'un `sharesCardTypeWith X` : `Exiled`, `TriggeredCardLKICopy`, `AttachedBy Targeted.Creature`. */
function refObjetFiltre(P, ref, env) {
  const ctx = env.ctx || {};
  if (ref === 'TriggeredCardLKICopy') { const e = ctx.evt || {}; return passeOuPresent(P, e.id != null ? e.id : e.ancien); }
  if (ref === 'Exiled') return objetsDeIds(P, ctx.memo || [])[0] || null;
  const m = /^AttachedBy Targeted\.(\w+)$/.exec(ref);
  if (m) { const cible = cibleForge(P, env, false); return cible && cible.att != null ? obj(P, cible.att) : null; }
  return null;
}

/* Les joueurs : le plus de vie, le moins, une vie égale à X, un adversaire d'un joueur retenu. */
proprieteJoueurEtendue = (g => function (P, j, p, ctrl, env) {
  const vies = vivants(P).map(J => J.vie);
  if (p === 'withMostLife') return P.joueurs[j].vie >= Math.max(...vies);
  if (p === 'withLowestLife') return P.joueurs[j].vie <= Math.min(...vies);
  if (p === 'lifeEQX') return P.joueurs[j].vie === forgeNombre(P, 'X', env);
  if (p === 'OpponentOf Remembered') return ((env && env.ctx && env.ctx.memoJ) || []).some(x => x !== j);
  return g(P, j, p, ctrl, env);
})(proprieteJoueurEtendue);

/* Les créatures qui ont enfourché ce tour : la capacité d'enfourchement retient ce qu'elle a engagé. */
OPS.enfourche = (g => function* (P, op, ctx) {
  const s = sourceCtx(P, ctx);
  if (s && !s.lki && s.zone === 'champ') s.enfourchePar = {tour: P.tour, ids: (ctx.engages || []).slice()};
  yield* g(P, op, ctx);
})(OPS.enfourche);

forgeSait('filtre', 'DrawnThisTurn', 'leastPower', 'leastToughness', 'leastToughnessControlledByOpponent', 'yardGreatestPower', 'greatestRememberedCMC', 'targetedBy', 'AllColors',
  'colorless', 'firstTurnControlled', 'withSuspend', 'sneaked', 'spectacle', 'DoubleFaced', 'hasANonBasicLandType', 'SaddledThisTurn', 'blockedThisTurn',
  'blockedOrBeenBlockedSinceYourLastUpkeep', 'CanBeSacrificedBy', 'CanBeEnchantedBy', 'TriggeredCards', 'greatestCMC_CreatureControlledByRemembered',
  'greatestCMC_NonLandPermanentControlledByRemembered', 'sharesControllerWith Targeted', 'sharesControllerWith AttachedBy Targeted', 'sharesCardTypeWith Exiled',
  'sharesCardTypeWith TriggeredCardLKICopy', 'sharesCardTypeWith AttachedBy Targeted.Creature', 'sharesCardTypeWith AttachedBy Targeted.Land', 'SharesCMCWith Imprinted',
  'withMostLife', 'withLowestLife', 'lifeEQX', 'OpponentOf Remembered');

/* —— Une protection au choix : une couleur, l'incolore, un type de carte ——————————————————————— */

/* Giver of Runes : « protection from colorless or from the color of your choice » ; Pippin : « from the card type of your
   choice ». `Choices$ AnyColor,colorless` / `CardType`. Une couleur se garde comme avant (`protTemp`), l'incolore et un type
   se gardent comme un filtre sur la source (`protFiltresTemp`). */
const TYPES_AU_CHOIX = ['Artifact', 'Battle', 'Creature', 'Enchantment', 'Instant', 'Land', 'Planeswalker', 'Sorcery'];
const NOMS_TYPES_FR = {Artifact: 'artefact', Battle: 'bataille', Creature: 'créature', Enchantment: 'enchantement', Instant: 'éphémère', Land: 'terrain', Planeswalker: 'planeswalker', Sorcery: 'rituel'};
FORGE_API.Protection.gen = (g => function* (P, t, env) {
  const ch = String(t.Choices || '');
  if (!/CardType|colorless/.test(ch) || !/Choice/.test(t.Gains || '')) return yield* g(P, t, env);
  const options = [];
  for (const part of ch.split(',').map(x => x.trim())) {
    if (part === 'AnyColor') ['White', 'Blue', 'Black', 'Red', 'Green'].forEach(c => options.push({texte: c, couleur: FORGE_COULEURS[c]}));
    else if (FORGE_COULEURS[part]) options.push({texte: part, couleur: FORGE_COULEURS[part]});
    else if (part === 'colorless') options.push({texte: 'Incolore', filtre: 'Card.colorless'});
    else if (part === 'CardType') TYPES_AU_CHOIX.forEach(c => options.push({texte: 'Type : ' + (NOMS_TYPES_FR[c] || c), filtre: c}));
  }
  if (!options.length) return;
  const i = yield* choisitUn(P, env.ctrl, options.map(o => o.texte), 'Protection contre…', 0, env.ctx.source), x = options[i] || options[0];
  objetsForge(P, t, env).filter(o => o.zone === 'champ' && !o.lki).forEach(o => {
    if (x.couleur) o.protTemp = [...(o.protTemp || []), x.couleur]; else o.protFiltresTemp = [...(o.protFiltresTemp || []), x.filtre];
    P.ver++;
  });
})(FORGE_API.Protection.gen);
forgeSait('filtre', 'CardType', 'AnyColor');

/* —— Des filtres de sorts et de noms ————————————————————————————————— */

proprieteDesignee = (g => function (P, o, p, c, src, ctrl, env) {
  const joueur = ctrl != null ? ctrl : o.ctrl;
  let m;
  /* « Counter target spell if no mana was spent to cast it » (Nix) : le mana dépensé, sur le sort. */
  if ((m = /^ManaSpent (EQ|GE|LE|GT|LT|NE)(\d+)$/.exec(p))) return !!o.lance && compareForge(Object.values(manaDepenseDe(o) || {}).reduce((a, b) => a + b, 0), m[1], +m[2]);
  /* Comment le sort a été lancé, et par qui. */
  if ((m = /^CastSa Spell\.(\w+)$/.exec(p)) && !/^(MayPlaySource|ManaFromTreasure)$/.test(m[1])) {
    if (m[1] === 'OppCtrl') return !!o.lance && o.lance.par !== joueur;
    if (m[1] === 'Warp') return o.varianteLance === 'warp';
    if (m[1] === 'Mayhem') return o.varianteLance === 'mayhem';
  }
  if (p === 'inRealZone Graveyard') return o.zone === 'cimetiere';
  if (p === 'sharesNameWith Battlefield') return !!P && P.champ.some(id => id !== o.id && obj(P, id).def.nom === o.def.nom);
  if (p === 'sharesNameWith ThisTurnCast') return !!P && P.joueurs.some(J => (J.sortsTour || []).some(d => d.nom === o.def.nom));
  if (p === 'doesNotShareNameWith Remembered') return !memoObjets(P, env).some(x => x.def.nom === o.def.nom);
  if (p === 'sharesCreatureTypeWith TriggeredCardLKICopy') { const x = refObjetFiltre(P, 'TriggeredCardLKICopy', env); return !!x && PARTAGES.CreatureType(P, c, x); }
  /* Partager une couleur avec une carte choisie, empreinte, ou avec une de nos créatures. */
  if ((m = /^SharesColorWith (ChosenCard|Imprinted|Valid .+)$/.exec(p))) {
    const mes = c.couleurs || [];
    const partage = x => !!x && (car(P, x).couleurs || x.def.couleurs || []).some(k => mes.includes(k));
    if (m[1] === 'ChosenCard') return partage(obj(P, ((choixDe(P, src).cartes) || [])[0]));
    if (m[1] === 'Imprinted') return empreinteDe(P, env.ctx, src).some(id => partage(passeOuPresent(P, id)));
    return P.champ.some(id => { const x = obj(P, id); return forgeValideObjet(P, x, m[1].slice(6), src, joueur, env) && partage(x); });
  }
  /* Un sort qui vise : « Spell.IsTargeting Remembered », « …IsTargeting Valid Permanent.YouCtrl~Other ». */
  if ((m = /^IsTargeting (Remembered|Valid .+)$/.exec(p))) {
    const cibles = ciblesDuSort(P, o.id);
    if (m[1] === 'Remembered') { const l = memoObjets(P, env); return cibles.some(x => l.some(y => y.id === x.id)); }
    return cibles.some(x => x.j == null && forgeValideObjet(P, x, m[1].slice(6).replace(/~/g, '+'), src, joueur, env));
  }
  return g(P, o, p, c, src, ctrl, env);
})(proprieteDesignee);

forgeSait('filtre', 'ManaSpent EQ0', 'CastSa Spell.OppCtrl', 'CastSa Spell.Warp', 'CastSa Spell.Mayhem', 'inRealZone Graveyard', 'sharesNameWith Battlefield', 'sharesNameWith ThisTurnCast',
  'doesNotShareNameWith Remembered', 'sharesCreatureTypeWith TriggeredCardLKICopy', 'SharesColorWith ChosenCard', 'SharesColorWith Imprinted', 'SharesColorWith Valid Creature.YouCtrl',
  'IsTargeting Remembered', 'IsTargeting Valid Permanent.YouCtrl~Other',
  /* Lus ailleurs, dans les statiques de mana et de remplacement (js/forgeManaD.js, js/forgeTerrains.js, js/forgeEntreesC.js). */
  'Imprinted', 'ValidGraveyard Card.YouOwn', 'ValidGraveyard Creature.Legendary', 'ExiledWith', 'ThisTargetedPlayer', 'TriggeredCard',
  /* La restriction `Moved.ValidCause` ne passe que ses valeurs connues (js/forgeEntreesC.js) ; `!ManaAbility` : js/forgeStatiquesD.js. */
  'LandAbility', 'ManaAbility');
forgeSait('defini', 'Remembered.White', 'Remembered.Blue', 'Remembered.Black', 'Remembered.Red', 'Remembered.Green');
