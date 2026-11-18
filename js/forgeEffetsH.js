/* =====================================================================
   js/forgeEffetsH.js — Les marqueurs qu'on double ou déplace, le nom
   qu'on désigne, la détention, les blocages imposés, les dégâts de chacun

   Des effets que Forge écrit chacun sous son nom et que les lots
   précédents ne savaient pas jouer : doubler ou déplacer des marqueurs,
   en retirer partout, nommer une carte (Pithing Needle, Cabal Therapy),
   détenir, protéger tout un camp, imposer un blocage, faire infliger à
   chaque créature d'un groupe des dégâts égaux à sa force, endurer,
   apprendre, détourner un sort, et ajouter une phase au tour.
   ===================================================================== */

/* Les objets du champ qu'un effet touche, sans les joueurs. */
function surChampForge(P, l) { return l.filter(x => x && x.j == null && x.zone === 'champ' && !x.lki); }

/* —— Les marqueurs ——————————————————————————————————————————————— */

/* « Double the number of +1/+1 counters » : on en pose autant qu'il y en a
   (fois le multiplicateur moins un), ce qui passe par les remplacements. */
forgeEffet('MultiplyCounter', ['CounterType', 'Multiplier'], function* (P, t, env) {
  const m = t.Multiplier ? forgeNombre(P, t.Multiplier, env) : 2;
  const l = env.op.slot != null ? ciblesForge(P, env, false) : forgeDefinis(P, t.Defined || 'Self', env);
  for (const x of l) {
    if (x && x.j != null) {
      const J = P.joueurs[x.j], g = genreMarqueur(t.CounterType);
      if (g === 'poison') J.poison += J.poison * (m - 1);
      else if (g === 'energy') J.energie = (J.energie || 0) * m;
      continue;
    }
    if (!x || x.zone !== 'champ' || x.lki) continue;
    const genres = t.CounterType ? [genreMarqueur(t.CounterType)] : Object.keys(x.marq).filter(g => x.marq[g] > 0);
    genres.forEach(g => poseMarqueurs(P, x, g, (x.marq[g] || 0) * (m - 1), env.src));
  }
}, (t, op) => { op.op = 'forge'; op.hostile = false; });

/* Les genres de marqueurs qu'un effet déplace ou retire : un genre nommé,
   tous (`All`), ou un au choix (`Any`) — l'IA prend le plus nombreux. */
function* genresMarqueurs(P, o, type, j, src) {
  const l = Object.keys(o.marq).filter(g => o.marq[g] > 0);
  if (type === 'All') return l;
  if (type !== 'Any' && type) return [genreMarqueur(type)];
  if (!l.length) return [];
  const pref = l.indexOf(l.slice().sort((a, b) => o.marq[b] - o.marq[a])[0]);
  return [l[yield* choisitUn(P, j, l, 'Quel marqueur ?', pref, src)]];
}

/* Déplacer des marqueurs : d'une source (`Source$`, une au choix parmi
   `ValidSource$`, la cible quand `Defined$` nomme la destination, sinon la
   première de deux cibles) vers la destination. « Any number » : tous —
   simplification annoncée, l'IA ne déplace que vers ce qui lui sert. */
forgeEffet('MoveCounter', ['Source', 'ValidSource', 'CounterType', 'CounterNum'], function* (P, t, env) {
  const cibles = env.op.slot != null ? ciblesForge(P, env, false).filter(x => x && x.j == null) : [];
  let src = null, dest = [];
  if (t.Source) { src = forgeDefinis(P, t.Source, env)[0]; dest = cibles.length ? cibles : forgeDefinis(P, t.Defined || 'Self', env); }
  else if (t.ValidSource) {
    dest = cibles.length ? cibles : forgeDefinis(P, t.Defined || 'Self', env);
    const cands = objetsZone(P, 'champ').filter(o => !dest.includes(o) && Object.values(o.marq).some(n => n > 0) &&
      forgeValideObjet(P, o, t.ValidSource, env.src, env.ctrl, env)).map(o => o.id);
    const ch = yield* choisitCartes(P, env.ctrl, cands, 1, 'Déplacer les marqueurs de…', 'cartes');
    src = obj(P, ch[0]);
  } else if (t.Defined) { src = cibles[0]; dest = forgeDefinis(P, t.Defined, env); }
  else { src = cibles[0]; dest = cibles.slice(1); }
  if (!src || src.j != null || src.zone !== 'champ' || src.lki) return;
  for (const d of surChampForge(P, dest).filter(d => d !== src)) {
    for (const g of yield* genresMarqueurs(P, src, t.CounterType, env.ctrl, env.ctx.source)) {
      const dispo = src.marq[g] || 0;
      const n = /^(All|Any)$/.test(t.CounterNum || '') ? dispo : Math.min(dispo, forgeNombre(P, t.CounterNum || 1, env));
      if (n <= 0) continue;
      src.marq[g] = dispo - n; P.ver++;
      poseMarqueurs(P, d, g, n, env.src);
    }
  }
}, (t, op) => { op.op = 'forge'; op.hostile = false; });

forgeEffet('RemoveCounterAll', ['ValidCards', 'CounterType', 'AllCounters', 'CounterNum', 'AllCounterTypes', 'ValidZone'], function* (P, t, env) {
  for (const o of objetsZone(P, 'champ').filter(o => forgeValideObjet(P, o, t.ValidCards || 'Permanent', env.src, env.ctrl, env))) {
    const genres = t.AllCounterTypes === 'True' ? Object.keys(o.marq) : [genreMarqueur(t.CounterType)];
    genres.forEach(g => {
      const n = t.AllCounters === 'True' || t.AllCounterTypes === 'True' ? (o.marq[g] || 0) : forgeNombre(P, t.CounterNum || 1, env);
      if (n > 0 && o.marq[g]) { o.marq[g] = Math.max(0, o.marq[g] - n); P.ver++; }
    });
  }
}, (t, op) => { op.op = 'forge'; op.hostile = false; }, {prepare: t => !t.ValidZone || t.ValidZone === 'Battlefield'});

/* Des marqueurs qui gênent celui qui les porte : on les retire chez soi,
   on les ajoute chez l'adversaire. */
const MARQUEURS_GENANTS = new Set(['-1/-1', 'time', 'doom', 'age', 'ice', 'stun', 'depletion', 'fade']);

/* « Put a counter on it or remove one from it » : au choix de qui résout. */
forgeEffet('AddOrRemoveCounter', ['CounterType', 'CounterNum'], function* (P, t, env) {
  const g = genreMarqueur(t.CounterType), n = forgeNombre(P, t.CounterNum || 1, env);
  for (const o of surChampForge(P, env.op.slot != null ? ciblesForge(P, env, false) : forgeDefinis(P, t.Defined || 'Self', env))) {
    const aMoi = o.ctrl === env.ctrl, genant = MARQUEURS_GENANTS.has(g);
    const pref = (o.marq[g] || 0) > 0 && aMoi === genant ? 1 : 0;
    const i = (o.marq[g] || 0) > 0 ? yield* choisitUn(P, env.ctrl, ['Ajouter', 'Retirer'], `Marqueurs ${g} sur ${o.def.nom}`, pref, env.ctx.source) : 0;
    if (i === 0) poseMarqueurs(P, o, g, n, env.src);
    else { o.marq[g] = Math.max(0, o.marq[g] - n); P.ver++; }
  }
}, (t, op) => { op.op = 'forge'; op.hostile = false; }, {prepare: t => !!t.CounterType});

/* —— Nommer une carte ——————————————————————————————————————————— */

/* Les noms qu'on peut désigner : ceux des cartes de la partie qui
   répondent au filtre — le moteur ne connaît pas d'autres cartes. L'IA
   nomme ce que l'adversaire possède le plus. */
function nomsDesignables(P, j, valid) {
  const n = new Map();
  P.cartes.forEach(k => {
    if (k.jeton || (valid && !forgeValideDef(k.def, valid, j, k.prop))) return;
    n.set(k.nom, (n.get(k.nom) || 0) + (k.prop !== j ? 10 : 1));
  });
  return [...n.entries()].sort((a, b) => b[1] - a[1]).map(x => x[0]).slice(0, 60);
}

forgeEffet('NameCard', ['ValidCards', 'ValidDescription', 'AtRandom'], function* (P, t, env) {
  const j = joueursForge(P, t, env)[0];
  if (j == null) return;
  const noms = nomsDesignables(P, j, t.ValidCards);
  if (!noms.length) return;
  const i = t.AtRandom === 'True' ? Math.floor(P.rng() * noms.length) : yield* choisitUn(P, j, noms, 'Nommer une carte', 0, env.ctx.source);
  choixDe(P, env.src).nom = noms[i];
  jn(P, `${P.joueurs[j].nom} nomme ${noms[i]}`);
}, (t, op) => { op.op = 'forge'; op.hostile = false; }, {prepare: t => !t.Defined || /^(You|Player\.\w+|Targeted|TargetedPlayer)$/.test(t.Defined)});

/* Oublier ce qu'on a désigné : le nom, le joueur, la carte, le type, la
   couleur (`Clear…$ True`). */
etendEffet('Cleanup', ['ClearNamedCard', 'ClearChosenPlayer'], null, function* (P, t, env) {
  const c = choixDe(P, env.src);
  if (t.ClearNamedCard === 'True') delete c.nom;
  if (t.ClearChosenPlayer === 'True') delete c.joueur;
  if (t.ClearChosenCard === 'True') delete c.cartes;
  if (t.ClearChosenType === 'True') delete c.type;
  if (t.ClearChosenColor === 'True') delete c.couleur;
});

/* —— Détenir, protéger, imposer un blocage —————————————————————— */

/* Détenu : jusqu'au prochain tour de qui l'a détenu, il n'attaque ni ne
   bloque, et ses capacités activées ne s'activent pas (règle 701.35). */
forgeEffet('Detain', [], function* (P, t, env) {
  objetsForge(P, t, env, 'Targeted').filter(o => o.zone === 'champ' && !o.lki).forEach(o => { o.detenu = {par: env.ctrl, tour: P.tour}; P.ver++; });
}, (t, op) => { op.op = 'forge'; op.hostile = true; });
function detenu(P, o) { return !!o.detenu && !(P.actif === o.detenu.par && P.tour > o.detenu.tour); }

forgeEffet('ProtectionAll', ['Gains', 'ValidCards', 'Choices'], function* (P, t, env) {
  const couleurs = yield* couleursProtection(P, t, env);
  objetsZone(P, 'champ').filter(o => forgeValideObjet(P, o, t.ValidCards || 'Creature.YouCtrl', env.src, env.ctrl, env))
    .forEach(o => { o.protTemp = [...(o.protTemp || []), ...couleurs]; P.ver++; });
}, (t, op) => { op.op = 'forge'; op.hostile = false; }, {prepare: t => !t.ValidPlayers && gainsProtection(t)});

/* « Target creature blocks CARDNAME this turn if able » : l'attaquant
   imposé est la source, ou ce que `DefinedAttacker$` désigne. */
forgeEffet('MustBlock', ['DefinedAttacker', 'Duration', 'BlockAllDefined'], function* (P, t, env) {
  const a = t.DefinedAttacker ? forgeDefinis(P, t.DefinedAttacker, env).find(x => x && x.j == null) : env.src;
  objetsForge(P, t, env, 'Targeted').filter(o => o.zone === 'champ' && !o.lki)
    .forEach(o => { o.bloqueForce = {tour: P.tour, attaquant: a && !a.lki ? a.id : null}; });
}, (t, op) => { op.op = 'forge'; op.hostile = true; }, {prepare: t => !t.Duration || /^(UntilEndOfCombat|UntilEndOfTurn)$/.test(t.Duration)});

/* L'attaquant qu'une créature doit bloquer si elle le peut : celui qu'un
   effet lui a imposé, sinon — « blocks each combat if able » — le premier
   qu'elle peut bloquer. `undefined` si rien ne l'oblige. */
function attaquantImpose(P, b, atts) {
  const f = b.bloqueForce && b.bloqueForce.tour === P.tour ? b.bloqueForce : null;
  if (f && f.attaquant != null) return atts.includes(f.attaquant) && peutBloquer(P, b, obj(P, f.attaquant)) ? f.attaquant : undefined;
  if (!f && !doitBloquer(P, b)) return undefined;
  return atts.find(a => peutBloquer(P, b, obj(P, a)));
}

/* —— Les dégâts de chacun ——————————————————————————————————————— */

/* « Each creature you control deals damage equal to its power to target
   creature » : la quantité se lit pour chaque source (`Count$CardPower`
   est la force de celle qui inflige). */
forgeEffet('EachDamage', ['NumDmg', 'DefinedDamagers', 'ValidCards', 'EachToItself'], function* (P, t, env) {
  const sources = t.DefinedDamagers ? forgeDefinis(P, t.DefinedDamagers, env)
    : t.ValidCards ? objetsZone(P, 'champ').filter(o => forgeValideObjet(P, o, t.ValidCards, env.src, env.ctrl, env)) : [env.src];
  const cibles = t.EachToItself === 'True' ? null : env.op.slot != null ? ciblesForge(P, env, false) : forgeDefinis(P, t.Defined || 'Targeted', env);
  for (const s of sources.filter(x => x && x.j == null)) {
    const n = forgeNombre(P, t.NumDmg || 0, {...env, src: s});
    for (const c of cibles || [s]) if (c && (c.j != null || (c.zone === 'champ' && !c.lki))) infligeDegats(P, s, c, n, false);
  }
}, (t, op) => { op.op = 'degats'; op.n = nombreIA(t.NumDmg || 0); op.a = op.slot != null ? {cible: op.slot} : null; op.hostile = op.slot != null; });

/* —— Endurer, apprendre ———————————————————————————————————————— */

/* Un jeton créature simple, fait par le moteur plutôt que lu d'un script. */
function defJetonCreature(nom, sousType, f, e, couleurs) {
  return {nom, cout: coutManaVide(), mv: 0, types: ['creature'], sousTypes: [sousType], supers: [], couleurs, force: f, endurance: e,
    mots: 0, params: {}, sort: null, capacites: [], statiques: [], jeton: true, typeLigne: 'Token Creature — ' + nom, couverture: {etat: 'complete'}};
}

/* Endurer N : N marqueurs +1/+1 sur le permanent, ou un Esprit blanc N/N
   s'il n'est plus là — ou si son contrôleur le préfère. */
forgeEffet('Endure', ['Num'], function* (P, t, env) {
  const n = forgeNombre(P, t.Num || 1, env);
  if (n <= 0) return;
  const o = forgeDefinis(P, t.Defined || 'Self', env).find(x => x && x.j == null && x.zone === 'champ' && !x.lki);
  const i = o ? yield* choisitUn(P, env.ctrl, [`${n} marqueur(s) +1/+1`, `Un Esprit ${n}/${n}`], 'Endurer', 0, env.ctx.source) : 1;
  if (i === 0) poseMarqueurs(P, o, '+1/+1', n, env.src);
  else yield* creeJetonsForge(P, [defJetonCreature('Spirit', 'spirit', n, n, ['W'])], 1, [env.ctrl], false, env, false);
}, (t, op) => { op.op = 'forge'; op.hostile = false; });

/* Apprendre : la réserve de leçons hors de la partie n'existe pas ici,
   reste « défausser une carte pour en piocher une » — simplification
   annoncée. L'IA le fait pour se défaire d'un terrain de trop. */
forgeEffet('Learn', [], function* (P, t, env) {
  const j = env.ctrl, J = P.joueurs[j];
  if (!J.main.length) return;
  const terrains = champDe(P, j).filter(o => estType(o, 'land')).length;
  const pref = terrains >= 5 && J.main.some(id => estType(obj(P, id), 'land')) ? 0 : 1;
  if ((yield* choisitUn(P, j, ['Défausser une carte, puis piocher', 'Ne rien faire'], 'Apprendre', pref, env.ctx.source)) !== 0) return;
  const ch = yield* choisitCartes(P, j, J.main.slice(), 1, 'Défausser', 'defausse');
  if (!ch.length) return;
  defausseCarte(P, ch[0], j);
  yield* pioche(P, j, 1);
}, (t, op) => { op.op = 'forge'; op.hostile = false; });

/* —— Détourner un sort ——————————————————————————————————————————— */

const memeCible = (a, b) => (a && typeof a === 'object' ? 'j' + a.j : a) === (b && typeof b === 'object' ? 'j' + b.j : b);

/* « Change the target of target spell with a single target » : chaque
   emplacement à une cible en reçoit une autre, légale pour le lanceur du
   sort. `DefinedMagnet$` impose la nouvelle (Spellskite) ; sinon qui
   résout choisit — l'IA, comme si elle lançait le sort. */
forgeEffet('ChangeTargets', ['Optional', 'DefinedMagnet', 'ChangeSingleTarget'], function* (P, t, env) {
  const sorts = (env.op.slot != null ? ciblesForge(P, env, false) : forgeDefinis(P, t.Defined || 'Targeted', env)).filter(o => o && o.j == null && o.zone === 'pile');
  const aimant = t.DefinedMagnet ? forgeDefinis(P, t.DefinedMagnet, env)[0] : null;
  for (const s of sorts) {
    const item = P.pile.find(it => it.sort && it.id === s.id), so = item && obj(P, item.id);
    if (!item || !so) continue;
    for (const ef of item.effets) for (let si = 0; si < (ef.slots || []).length; si++) {
      const avant = ef.cibles[si] || [];
      if (avant.length !== 1) continue;
      const cands = ciblesLegales(P, ef.slots[si], so, item.ctrl, so.def.couleurs).filter(c => !memeCible(c, avant[0]));
      if (!cands.length) continue;
      let k = -1;
      if (aimant) k = cands.findIndex(c => memeCible(c, aimant.j != null ? {j: aimant.j} : aimant.id));
      else {
        const r = yield question(P, env.ctrl, 'cibles', cands, {min: t.Optional === 'True' ? 0 : 1, max: 1, multi: true,
          source: env.src && env.src.id, extra: {slot: ef.slots[si], indice: si, ops: ef.ops}});
        k = Array.isArray(r) ? (r.length ? r[0] : -1) : r;
      }
      if (k == null || k < 0 || cands[k] == null) continue;
      ef.cibles[si] = [cands[k]];
      jn(P, `${so.def.nom} change de cible`);
    }
  }
}, (t, op) => { op.op = 'forge'; op.hostile = true; });

/* —— Une phase de plus ——————————————————————————————————————————— */

const ETAPES_COMBAT = ['debutCombat', 'attaquants', 'bloqueurs', 'initiative', 'degats', 'finCombat'];
const PHASES_FORGE = {Combat: ETAPES_COMBAT, Beginning: ['degagement', 'entretien', 'pioche'], Upkeep: ['entretien'],
  End: ['fin', 'nettoyage'], Main1: ['principale1'], Main2: ['principale2']};
const ETAPES_FORGE = {Main1: 'principale1', Main2: 'principale2', BeginCombat: 'debutCombat', EndCombat: 'finCombat', End: 'fin', Upkeep: 'entretien'};
const FINS_DE_PHASE = new Set(['pioche', 'principale1', 'finCombat', 'principale2', 'nettoyage']);

/* « After this main phase, there is an additional combat phase followed by
   an additional main phase » : les étapes s'insèrent dans la file du tour
   (js/jeuTour.js `tour()`), après la phase en cours, ou après celle que
   nomme `AfterPhase$`. Une étape d'entretien de plus suit l'étape en cours. */
function ajoutePhase(P, t, n) {
  const file = P.fileEtapes, ajout = PHASES_FORGE[t.ExtraPhase];
  if (!file || !ajout) return;
  if (t.ConditionPhases && !String(t.ConditionPhases).split(',').some(p => ETAPES_FORGE[p.trim()] === P.etape)) return;
  if (t.ConditionFirstCombat === 'True' && (P.combatsTour || 0) > 1) return;
  let i = P.iEtape;
  const apres = t.AfterPhase ? file.indexOf(ETAPES_FORGE[t.AfterPhase], P.iEtape) : -1;
  if (apres >= 0) i = apres;
  else if (t.ExtraPhase !== 'Upkeep') while (i + 1 < file.length && !FINS_DE_PHASE.has(file[i])) i++;
  for (let k = 0; k < Math.min(n, 5); k++) file.splice(i + 1, 0, ...ajout, ...(t.FollowedBy ? PHASES_FORGE[t.FollowedBy] || [] : []));
  jn(P, `Une phase de plus : ${t.ExtraPhase}`);
}

/* La même phase de plus, lue dans l'oracle (« After this combat phase, there
   is an additional combat phase »). */
OPS.phaseSupp = function* (P, op) { ajoutePhase(P, op.t, 1); };

forgeEffet('AddPhase', ['ExtraPhase', 'AfterPhase', 'FollowedBy', 'ConditionPhases', 'NumPhases', 'ConditionFirstCombat'], function* (P, t, env) {
  ajoutePhase(P, t, forgeNombre(P, t.NumPhases || 1, env));
}, (t, op) => { op.op = 'forge'; op.hostile = false; }, {prepare: t => !!PHASES_FORGE[t.ExtraPhase] && (!t.FollowedBy || !!PHASES_FORGE[t.FollowedBy])});
