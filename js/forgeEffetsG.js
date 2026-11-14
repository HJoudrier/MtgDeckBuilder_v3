/* =====================================================================
   js/forgeEffetsG.js — Les mécaniques de partie de Forge

   Les boucles des scripts (`RepeatEach`, `Repeat`, `Branch`, `StoreSVar`),
   les dés et les pièces, le monarque, les tours supplémentaires, le
   phasing, l'incitation (goad), la protection gagnée, l'armée (amass),
   l'incubateur, la manifestation, l'Anneau, et un donjon simplifié.

   Une boucle exécute une sous-capacité nommée : elle est compilée à la
   construction (`sousEffets()`, sans cible — une cible se choisit au
   lancement, pas à chaque tour de boucle), et jouée à la résolution
   (`joueSous()`).
   ===================================================================== */

let PROFONDEUR_SOUS = 0;

/* Compiler les sous-capacités qu'une table nomme ; refuser s'il en est une
   qu'on ne sait pas jouer, ou qui cible. */
function sousEffets(op, noms) {
  if (PROFONDEUR_SOUS > 3) return false;
  PROFONDEUR_SOUS++;
  try {
    op.sous = op.sous || {};
    for (const n of noms.filter(Boolean)) {
      const t = forgeSousCapacite(op.face, n), e = t && effetForge(op.face, t, op.jetons);
      if (!e || e.modes || e.cibles.length) return false;
      op.sous[n] = e.ops;
    }
    return true;
  } finally { PROFONDEUR_SOUS--; }
}

function* joueSous(P, env, nom) { const ops = env.op.sous && env.op.sous[nom]; if (ops) yield* executeOps(P, ops, env.ctx); }

function varsDe(ctx) { return ctx.vars || (ctx.vars = {}); }

/* —— Les boucles des scripts —————————————————————————————————————— */

/* Pour chaque joueur, ou chaque carte : la sous-capacité, avec ce joueur
   ou cette carte pour mémoire (`Remembered`). */
forgeEffet('RepeatEach', ['RepeatSubAbility', 'RepeatPlayers', 'RepeatCards', 'Zone', 'UseImprinted', 'ChangeZoneTable', 'DamageMap', 'ClearRemembered'],
  function* (P, t, env) {
    const ctx = env.ctx, memo = ctx.memo, memoJ = ctx.memoJ;
    const items = t.RepeatPlayers ? forgeDefinis(P, t.RepeatPlayers, env).map(x => ({j: joueurDe(x)})).filter(x => x.j != null)
      : objetsZone(P, ZONES_FORGE[t.Zone || 'Battlefield'] || 'champ').filter(o => forgeValideObjet(P, o, t.RepeatCards, env.src, env.ctrl, env)).map(o => ({id: o.id}));
    try {
      for (const x of items) {
        ctx.memo = x.id != null ? [x.id] : []; ctx.memoJ = x.j != null ? [x.j] : [];
        yield* joueSous(P, env, t.RepeatSubAbility);
        if (P.fin) return;
      }
    } finally { ctx.memo = memo; ctx.memoJ = memoJ; }
  }, (t, op) => { op.op = 'forge'; op.hostile = false; },
  {prepare: (t, op) => (!!t.RepeatPlayers || !!t.RepeatCards) && sousEffets(op, [t.RepeatSubAbility])});

/* Recommencer tant que la condition tient (vingt fois au plus). */
forgeEffet('Repeat', ['RepeatSubAbility', 'RepeatCheckSVar', 'RepeatSVarCompare', 'MaxRepeat', 'RepeatPresent', 'RepeatCompare', 'RepeatOptional'],
  function* (P, t, env) {
    const max = t.MaxRepeat ? forgeNombre(P, t.MaxRepeat, env) : 20;
    for (let k = 0; k < Math.min(max, 20) && !P.fin; k++) {
      if (t.RepeatOptional === 'True' && k > 0 && (yield* choisitUn(P, env.ctrl, ['Arrêter', 'Recommencer'], 'Recommencer ?', 1, env.ctx.source)) !== 1) return;
      yield* joueSous(P, env, t.RepeatSubAbility);
      const cond = {CheckSVar: t.RepeatCheckSVar, SVarCompare: t.RepeatSVarCompare, IsPresent: t.RepeatPresent, PresentCompare: t.RepeatCompare};
      if ((t.RepeatCheckSVar || t.RepeatPresent) && !conditionForge(P, cond, env)) return;
    }
  }, (t, op) => { op.op = 'forge'; op.hostile = false; }, {prepare: (t, op) => sousEffets(op, [t.RepeatSubAbility])});

forgeEffet('Branch', ['BranchConditionSVar', 'BranchConditionSVarCompare', 'TrueSubAbility', 'FalseSubAbility'], function* (P, t, env) {
  const vrai = conditionForge(P, {CheckSVar: t.BranchConditionSVar, SVarCompare: t.BranchConditionSVarCompare || 'GE1'}, env);
  yield* joueSous(P, env, vrai ? t.TrueSubAbility : t.FalseSubAbility);
}, (t, op) => { op.op = 'forge'; op.hostile = false; }, {prepare: (t, op) => !!t.BranchConditionSVar && sousEffets(op, [t.TrueSubAbility, t.FalseSubAbility])});

forgeEffet('StoreSVar', ['SVar', 'Type', 'Expression'], function* (P, t, env) {
  const e = String(t.Expression || '0');
  varsDe(env.ctx)[t.SVar] = t.Type === 'Number' ? +e || 0 : t.Type === 'Count' ? forgeNombre(P, 'Count$' + e, env)
    : forgeNombre(P, e.replace(/^\$/, ''), env);
}, (t, op) => { op.op = 'rien'; op.hostile = false; }, {prepare: t => /^(Number|Count|CountSVar|Calculate)$/.test(t.Type || '')});

/* —— Les dés et les pièces ——————————————————————————————————————— */

/* `1-9:DBA,10-19:DBB,20:DBC` : la sous-capacité de la tranche tirée. */
function tranchesDe(v) {
  return String(v || '').split(',').map(x => /^\s*(\d+)(?:-(\d+))?:(\w+)\s*$/.exec(x)).filter(Boolean).map(m => ({a: +m[1], b: +(m[2] || m[1]), nom: m[3]}));
}
forgeEffet('RollDice', ['Sides', 'Amount', 'Modifier', 'ResultSVar', 'ResultSubAbilities'], function* (P, t, env) {
  const faces = forgeNombre(P, t.Sides || 20, env), n = forgeNombre(P, t.Amount || 1, env);
  let total = forgeNombre(P, t.Modifier || 0, env);
  for (let k = 0; k < n; k++) total += 1 + entierHasard(P.rng, faces);
  jn(P, `${P.joueurs[env.ctrl].nom} lance un dé : ${total}`);
  if (t.ResultSVar) varsDe(env.ctx)[t.ResultSVar] = total;
  const tr = tranchesDe(t.ResultSubAbilities).find(x => total >= x.a && total <= x.b);
  if (tr) yield* joueSous(P, env, tr.nom);
}, (t, op) => { op.op = 'forge'; op.hostile = false; }, {prepare: (t, op) => sousEffets(op, tranchesDe(t.ResultSubAbilities).map(x => x.nom))});

forgeEffet('FlipCoin', ['WinSubAbility', 'LoseSubAbility', 'HeadsSubAbility', 'TailsSubAbility', 'NoCall'], function* (P, t, env) {
  const gagne = entierHasard(P.rng, 2) === 0;
  jn(P, `Pile ou face : ${gagne ? 'gagné' : 'perdu'}`);
  yield* joueSous(P, env, gagne ? t.WinSubAbility || t.HeadsSubAbility : t.LoseSubAbility || t.TailsSubAbility);
}, (t, op) => { op.op = 'forge'; op.hostile = false; },
{prepare: (t, op) => !t.Amount && !t.FlipUntilYouLose && sousEffets(op, [t.WinSubAbility, t.LoseSubAbility, t.HeadsSubAbility, t.TailsSubAbility])});

/* —— Le monarque, les tours, la fin de partie —————————————————————— */

forgeEffet('BecomeMonarch', [], function* (P, t, env) {
  const j = joueursForge(P, t, env)[0];
  if (j != null) { P.monarque = j; jn(P, `${P.joueurs[j].nom} devient le monarque`); }
}, (t, op) => { op.op = 'pioche'; op.n = 1; op.qui = {vous: 1}; op.hostile = false; });

/* Le monarque pioche à son étape de fin (js/jeuTour.js). */
function monarqueFin(P) { if (P.monarque === P.actif && !P.joueurs[P.actif].elimine) piocheN(P, P.actif, 1); }

forgeEffet('AddTurn', ['NumTurns'], function* (P, t, env) {
  const n = forgeNombre(P, t.NumTurns || 1, env);
  for (const j of joueursForge(P, t, env)) for (let k = 0; k < n; k++) (P.toursEnPlus = P.toursEnPlus || []).push(j);
}, (t, op) => { op.op = 'forge'; op.hostile = false; }, {prepare: t => !t.ExtraTurnDelayedTrigger && !t.SkipUntap});

forgeEffet('WinsGame', [], function* (P, t, env) {
  const j = joueursForge(P, t, env)[0];
  if (j != null) P.joueurs.forEach(J => { if (J.i !== j && !J.elimine) elimine(P, J.i, 'effet'); });
}, (t, op) => { op.op = 'forge'; op.hostile = false; });
forgeEffet('LosesGame', [], function* (P, t, env) { joueursForge(P, t, env).forEach(j => elimine(P, j, 'effet')); },
  (t, op) => { op.op = 'forge'; op.hostile = true; });
forgeEffet('Poison', ['Num'], function* (P, t, env) {
  const n = forgeNombre(P, t.Num || 1, env);
  joueursForge(P, t, env).forEach(j => { P.joueurs[j].poison += n; });
}, (t, op) => { op.op = 'forge'; op.hostile = true; });
forgeEffet('SetLife', ['LifeAmount'], function* (P, t, env) {
  const n = forgeNombre(P, t.LifeAmount || 0, env);
  joueursForge(P, t, env).forEach(j => { P.joueurs[j].vie = n; });
}, (t, op) => { op.op = 'forge'; op.hostile = false; }, {prepare: t => !t.Redistribute});

/* —— Les permanents —————————————————————————————————————————————— */

/* Goad : jusqu'au prochain tour de qui l'a incitée, la créature attaque à
   chaque combat, et un autre joueur que lui si elle le peut. */
forgeEffet('Goad', ['Duration'], function* (P, t, env) {
  objetsForge(P, t, env, 'Targeted').filter(o => o.zone === 'champ' && !o.lki).forEach(o => { o.goad = {par: env.ctrl, tour: P.tour}; P.ver++; });
}, (t, op) => { op.op = 'forge'; op.hostile = true; }, {prepare: t => !t.Duration || t.Duration === 'UntilYourNextTurn'});
function goadActif(P, o) { return !!o.goad && !(P.actif === o.goad.par && P.tour > o.goad.tour); }

/* La protection gagnée jusqu'à la fin du tour, d'une couleur au choix ou
   de couleurs nommées. */
forgeEffet('Protection', ['Gains', 'Choices'], function* (P, t, env) {
  const objets = objetsForge(P, t, env).filter(o => o.zone === 'champ' && !o.lki);
  let couleurs = String(t.Gains || '').split(',').map(c => FORGE_COULEURS[c.trim()]).filter(Boolean);
  if (/Choice/.test(t.Gains || '')) {
    let opts = String(t.Choices || '').split(',').map(c => c.trim()).filter(c => FORGE_COULEURS[c]);
    if (!opts.length) opts = ['White', 'Blue', 'Black', 'Red', 'Green'];
    const compte = c => P.champ.filter(id => obj(P, id).ctrl !== env.ctrl && car(P, obj(P, id)).couleurs.includes(FORGE_COULEURS[c])).length;
    const pref = opts.indexOf(opts.slice().sort((a, b) => compte(b) - compte(a))[0]);
    couleurs = [FORGE_COULEURS[opts[yield* choisitUn(P, env.ctrl, opts, 'Protection contre…', pref, env.ctx.source)] || opts[0]]];
  }
  objets.forEach(o => { o.protTemp = [...(o.protTemp || []), ...couleurs]; P.ver++; });
}, (t, op) => { op.op = 'pompe'; op.f = 0; op.e = 0; op.a = op.slot != null ? {cible: op.slot} : {soi: 1}; op.hostile = false; },
{prepare: t => !t.Duration && !t.Radiance});

forgeEffet('Debuff', ['Keywords'], function* (P, t, env) {
  const m = motsForge(t.Keywords);
  objetsForge(P, t, env, 'Targeted').filter(o => o.zone === 'champ' && !o.lki).forEach(o => { o.mods.push({f: 0, e: 0, mots: 0, retire: m, fin: 'tour'}); P.ver++; });
}, (t, op) => { op.op = 'forge'; op.hostile = true; }, {prepare: t => !t.Duration});

/* Le phasing : hors du champ sans le quitter — ni départ ni entrée — et
   de retour au prochain dégagement de son contrôleur. */
forgeEffet('Phases', ['AllValid'], function* (P, t, env) {
  const l = t.AllValid ? objetsZone(P, 'champ').filter(o => forgeValideObjet(P, o, t.AllValid, env.src, env.ctrl, env)) : objetsForge(P, t, env, 'Targeted');
  for (const o of l.filter(x => x.zone === 'champ' && !x.lki)) {
    const avec = [o, ...P.champ.map(id => obj(P, id)).filter(a => a.att === o.id)];
    avec.forEach(a => { retireDe(P.champ, a.id); (P.horsPhase = P.horsPhase || []).push({id: a.id, ctrl: a.ctrl}); });
    P.ver++;
  }
}, (t, op) => { op.op = 'exile'; op.a = op.slot != null ? {cible: op.slot} : {soi: 1}; op.hostile = op.slot != null; }, {prepare: t => !t.PhaseInOrOut && !t.WontPhaseInNormal});
function phasesEntrent(P) {
  if (!P.horsPhase || !P.horsPhase.length) return;
  P.horsPhase.filter(x => x.ctrl === P.actif).forEach(x => { if (obj(P, x.id)) P.champ.push(x.id); });
  P.horsPhase = P.horsPhase.filter(x => x.ctrl !== P.actif);
  P.ver++;
}

/* L'armée : des marqueurs sur l'armée qu'on contrôle, ou une armée 0/0
   créée pour les recevoir. */
forgeEffet('Amass', ['Type', 'Num'], function* (P, t, env) {
  const n = forgeNombre(P, t.Num || 1, env), j = env.ctrl;
  let a = champDe(P, j).find(o => car(P, o).sousTypes.includes('army'));
  if (!a) {
    const type = String(t.Type || 'Zombies').replace(/s$/, '').toLowerCase();
    const def = {nom: 'Army', cout: coutManaVide(), mv: 0, types: ['creature'], sousTypes: [type, 'army'], supers: [], couleurs: ['B'], force: 0, endurance: 0,
      mots: 0, params: {}, sort: null, capacites: [], statiques: [], jeton: true, typeLigne: 'Token Creature — ' + type + ' Army', couverture: {etat: 'complete'}};
    a = creeObjet(P, nouvelleCarte(P, def, j, false, true), j, 'champ');
    P.champ.push(a.id); P.ver++;
    emet(P, {t: 'entre', id: a.id, ctrl: j, jeton: true});
  }
  poseMarqueurs(P, a, '+1/+1', n, env.src);
}, (t, op) => { op.op = 'jetons'; op.n = 1; op.hostile = false; op._def = {types: ['creature'], force: 1, endurance: 1, mots: 0, capacites: [], statiques: [], mv: 1}; });

/* Incuber N : un jeton Incubateur avec N marqueurs +1/+1 ; pour {2}, il
   devient une créature-artefact Phyrexian 0/0. */
OPS.incube = function* (P, op, ctx) {
  const o = sourceCtx(P, ctx);
  if (!o || o.lki || o.zone !== 'champ') return;
  (o.anime = o.anime || []).push({types: ['creature'], sousTypes: ['phyrexian'], force: 0, endurance: 0});
  P.ver++;
};
forgeEffet('Incubate', ['Amount', 'Times'], function* (P, t, env) {
  const fois = forgeNombre(P, t.Times || 1, env), n = forgeNombre(P, t.Amount || 1, env);
  for (let k = 0; k < fois; k++) {
    const def = {nom: 'Incubator', cout: coutManaVide(), mv: 0, types: ['artifact'], sousTypes: ['incubator'], supers: [], couleurs: [], force: null,
      endurance: null, mots: 0, params: {}, sort: null, statiques: [], jeton: true, typeLigne: 'Token Artifact — Incubator', couverture: {etat: 'complete'},
      capacites: [{genre: 'activee', cout: {mana: coutMana('{2}')}, texte: 'Transform — {2}', effet: {ops: [{op: 'incube', hostile: false}], cibles: [], modes: null}}]};
    const o = creeObjet(P, nouvelleCarte(P, def, env.ctrl, false, true), env.ctrl, 'champ');
    P.champ.push(o.id); P.ver++;
    emet(P, {t: 'entre', id: o.id, ctrl: env.ctrl, jeton: true});
    poseMarqueurs(P, o, '+1/+1', n, env.src);
  }
}, (t, op) => { op.op = 'jetons'; op.n = 1; op.hostile = false; op._def = {types: ['artifact'], mots: 0, capacites: [], statiques: [], mv: 0}; });

/* Manifester : le dessus de la bibliothèque, face cachée, en 2/2. */
function* manifeste(P, j, id) { return yield* metEnJeu(P, id, j, {faceCachee: true}); }
forgeEffet('Manifest', ['Amount', 'RememberManifested'], function* (P, t, env) {
  const B = P.joueurs[env.ctrl].bibliotheque;
  for (let k = forgeNombre(P, t.Amount || 1, env); k > 0 && B.length; k--) {
    const n = yield* manifeste(P, env.ctrl, B[B.length - 1]);
    if (n != null && t.RememberManifested === 'True') retiensForge(env.ctx, n);
  }
}, (t, op) => { op.op = 'jetons'; op.n = 1; op.hostile = false; op._def = {types: ['creature'], force: 2, endurance: 2, mots: 0, capacites: [], statiques: [], mv: 0}; },
{prepare: t => !t.Choices && !t.Defined});
forgeEffet('ManifestDread', ['RememberManifested'], function* (P, t, env) {
  const B = P.joueurs[env.ctrl].bibliotheque, deux = B.slice(-2).reverse();
  if (!deux.length) return;
  const pris = yield* choisitCartes(P, env.ctrl, deux, 1, 'Manifester', 'cartes', 1);
  const n = yield* manifeste(P, env.ctrl, pris[0] != null ? pris[0] : deux[0]);
  deux.filter(id => id !== pris[0] && obj(P, id) && obj(P, id).zone === 'bibliotheque').forEach(id => deplace(P, id, 'cimetiere'));
  if (n != null && t.RememberManifested === 'True') retiensForge(env.ctx, n);
}, (t, op) => { op.op = 'jetons'; op.n = 1; op.hostile = false; op._def = {types: ['creature'], force: 2, endurance: 2, mots: 0, capacites: [], statiques: [], mv: 0}; });

/* L'Anneau vous tente : un porteur, et le niveau de la tentation. Au
   premier niveau, le porteur est légendaire et ne peut être bloqué par une
   créature de plus grande force (js/jeuCombat.js). Les niveaux suivants ne
   sont pas joués : simplification annoncée. */
forgeEffet('RingTemptsYou', [], function* (P, t, env) {
  const J = P.joueurs[env.ctrl];
  J.anneau = Math.min(4, (J.anneau || 0) + 1);
  const l = champDe(P, env.ctrl).filter(estCreature);
  champDe(P, env.ctrl).forEach(o => { o.porteAnneau = false; });
  if (!l.length) return;
  const pref = l.map(o => o.id).sort((a, b) => car(P, obj(P, b)).force - car(P, obj(P, a)).force)[0];
  const pris = yield* choisitCartes(P, env.ctrl, l.map(o => o.id), 1, 'Porteur de l’Anneau', 'cartes', 1);
  obj(P, pris[0] != null ? pris[0] : pref).porteAnneau = true;
  P.ver++;
}, (t, op) => { op.op = 'forge'; op.hostile = false; });

/* Un donjon simplifié : quatre salles — regard (scry 1), saignée (chaque
   adversaire perd 1, vous gagnez 1), renfort (+1/+1 sur une créature),
   trésor (piocher) — puis le donjon est fini. Simplification annoncée :
   les donjons imprimés ont leurs propres salles. */
forgeEffet('Venture', [], function* (P, t, env) {
  const J = P.joueurs[env.ctrl];
  J.donjon = (J.donjon || 0) + 1;
  if (J.donjon === 1) yield* FORGE_API.Scry.gen(P, {ScryNum: '1'}, env);
  else if (J.donjon === 2) { adversaires(P, env.ctrl).forEach(i => { P.joueurs[i].vie -= 1; emet(P, {t: 'perteVie', joueur: i, n: 1}); }); gagneVie(P, env.ctrl, 1); }
  else if (J.donjon === 3) { const c = champDe(P, env.ctrl).filter(estCreature).sort((a, b) => car(P, b).force - car(P, a).force)[0]; if (c) poseMarqueurs(P, c, '+1/+1', 1, env.src); }
  else { piocheN(P, env.ctrl, 1); J.donjon = 0; J.donjonsFinis = (J.donjonsFinis || 0) + 1; }
}, (t, op) => { op.op = 'pioche'; op.n = 1; op.qui = {vous: 1}; op.hostile = false; });

/* Suspect : la menace, et ne peut bloquer (js/jeuCaracteristiques.js). */
forgeEffet('AlterAttribute', ['Attributes', 'Activate'], function* (P, t, env) {
  const oui = t.Activate !== 'False';
  objetsForge(P, t, env).filter(o => o.zone === 'champ' && !o.lki).forEach(o => { o.suspect = oui; P.ver++; });
}, (t, op) => { op.op = 'forge'; op.hostile = false; }, {prepare: t => t.Attributes === 'Suspected'});
