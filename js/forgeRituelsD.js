/* =====================================================================
   js/forgeRituelsD.js — Les rituels d'EDHREC : votes, groupes, choix secrets

   Lot F107. Les rituels où chaque joueur répond à son tour — la réponse de
   chacun ne dépend jamais de celle des autres, le secret n'est qu'un affichage :
   - `Vote | EachVote` (Expropriate : chaque voix joue son choix, pour le
     votant) et `Vote | VotePlayer` (Mob Verdict : on vote pour un autre joueur,
     `RepeatEach | AmountFromVotes` joue ensuite le nombre de voix reçues) ;
   - `ChooseNumber | Secretly | Highest | NotLowest` (Wheel of Misfortune) ;
   - `AssignGroup` : le lanceur dit, pour chaque joueur, ami ou ennemi
     (Khorvath's Fury, Pir's Whim) ; `RepeatEach | ClearRememberedBeforeLoop` ;
   - `GenericChoice | Secretly` et les joueurs « notés » (`Bookkeeping |
     NoteCardsFor`, Prisoner's Dilemma) ;
   - `UnlessCost$ LifeTotalHalfUp` : la moitié de sa vie, arrondie au-dessus,
     que n'importe quel joueur peut payer pour faire contrecarrer
     (Temporal Extortion — l'IA, qui répond par défaut « non », ne paie jamais).
   ===================================================================== */

/* —— Voter ———————————————————————————————————————————————————————— */

forgeSait('param', 'Vote.EachVote', 'Vote.VotePlayer', 'RepeatEach.AmountFromVotes', 'RepeatEach.ClearRememberedBeforeLoop');
FORGE_API.Vote.prepare = (p => function (t, op) { return !!t.VotePlayer || !p || p.call(this, t, op); })(FORGE_API.Vote.prepare);
FORGE_API.Vote.gen = (g => function* (P, t, env) {
  if (!t.VotePlayer && t.EachVote !== 'True') return yield* g(P, t, env);
  const src = env.src && env.src.id, votants = forgeDefinis(P, t.Defined || 'Player', env).map(x => joueurDe(x)).filter(j => j != null && !P.joueurs[j].elimine);
  /* Voter pour un joueur (autre que soi) : on garde combien de voix chacun a reçues. */
  if (t.VotePlayer) {
    const voix = {};
    for (const j of votants) {
      const autres = vivants(P).map(J => J.i).filter(i => i !== j);
      if (!autres.length) continue;
      const pref = autres.findIndex(i => j === env.ctrl ? i !== env.ctrl : i !== env.ctrl);
      const i = autres[yield* choisitUn(P, j, autres.map(a => P.joueurs[a].nom), 'Voter pour un joueur', Math.max(0, pref), src)];
      voix[i] = (voix[i] || 0) + 1;
    }
    env.ctx.votesJ = voix;
    jn(P, 'Vote : ' + Object.entries(voix).map(([j, n]) => `${P.joueurs[j].nom} ${n}`).join(', '));
    return;
  }
  /* Chaque voix joue le choix pour lequel elle a été donnée, avec le votant en mémoire. */
  const ch = env.op.votes.choix, voteurs = [];
  for (const j of votants) {
    const notes = ch.map(c => (j === env.ctrl ? 1 : -1) * scoreEffet(P, env.ctrl, c.effet, env.src));
    voteurs.push({j, i: yield* choisitUn(P, j, ch.map(c => c.texte), 'Voter', notes.indexOf(Math.max(...notes)), src)});
  }
  jn(P, 'Vote : ' + ch.map((c, i) => `${c.texte} ${voteurs.filter(v => v.i === i).length}`).join(', '));
  const avant = env.ctx.memoJ;
  try { for (const v of voteurs) { env.ctx.memoJ = [v.j]; yield* executeOps(P, ch[v.i].effet.ops, env.ctx); } } finally { env.ctx.memoJ = avant; }
})(FORGE_API.Vote.gen);

/* Pour chaque joueur qui a reçu des voix, avec leur nombre dans la SVar `Votes` ; ou, sans rien retenir d'avant, pour chacun un tour de boucle à part. */
FORGE_API.RepeatEach.gen = (g => function* (P, t, env) {
  const ctx = env.ctx;
  if (t.AmountFromVotes !== 'True' && !(t.ClearRememberedBeforeLoop === 'True' && t.RepeatPlayers)) return yield* g(P, t, env);
  const items = forgeDefinis(P, t.RepeatPlayers, env).map(x => joueurDe(x)).filter(j => j != null);
  const memo = ctx.memo, memoJ = ctx.memoJ, anc = env.face.svars.Votes, votes = ctx.votesJ || {};
  try {
    for (const j of items) {
      if (t.AmountFromVotes === 'True' && !(votes[j] > 0)) continue;
      ctx.memoJ = [j];
      if (t.ClearRememberedBeforeLoop === 'True') ctx.memo = [];
      if (t.AmountFromVotes === 'True') env.face.svars.Votes = String(votes[j]);
      yield* joueSous(P, env, t.RepeatSubAbility);
      if (P.fin) return;
    }
  } finally {
    ctx.memo = memo; ctx.memoJ = memoJ;
    if (anc === undefined) delete env.face.svars.Votes; else env.face.svars.Votes = anc;
  }
})(FORGE_API.RepeatEach.gen);

/* —— Un nombre en secret —————————————————————————————————————————— */

forgeSait('param', 'ChooseNumber.Secretly', 'ChooseNumber.Highest', 'ChooseNumber.NotLowest');
FORGE_API.ChooseNumber.prepare = (p => function (t, op) {
  return t.Secretly === 'True' && t.Highest ? sousEffets(op, [t.Highest, t.NotLowest]) : !p || p.call(this, t, op);
})(FORGE_API.ChooseNumber.prepare);
/* Le plus haut subit « Highest », ceux qui n'ont pas choisi le plus bas, « NotLowest » ; chacun en `Remembered`. */
FORGE_API.ChooseNumber.gen = (g => function* (P, t, env) {
  if (t.Secretly !== 'True' || !t.Highest) return yield* g(P, t, env);
  const joueurs = joueursForge(P, t, env), nombres = {}, options = Array.from({length: 21}, (_, k) => String(k));
  for (const j of joueurs) nombres[j] = yield* choisitUn(P, j, options, 'Choisir un nombre, en secret', P.joueurs[j].main.length >= 4 && P.joueurs[j].vie > 4 ? 1 : 0, env.ctx.source);
  jn(P, 'Nombres : ' + joueurs.map(j => `${P.joueurs[j].nom} ${nombres[j]}`).join(', '));
  const valeurs = joueurs.map(j => nombres[j]), haut = Math.max(...valeurs), bas = Math.min(...valeurs), avant = env.ctx.memoJ;
  try {
    env.ctx.memoJ = joueurs.filter(j => nombres[j] === haut); choixDe(P, env.src).nombre = haut;
    yield* joueSous(P, env, t.Highest);
    env.ctx.memoJ = joueurs.filter(j => nombres[j] !== bas);
    if (t.NotLowest) yield* joueSous(P, env, t.NotLowest);
  } finally { env.ctx.memoJ = avant; }
})(FORGE_API.ChooseNumber.gen);

/* —— Ami ou ennemi ———————————————————————————————————————————————— */

/* Le lanceur répond pour chacun ; le premier choix de `Choices` est celui des amis, le second des ennemis, joués avec les joueurs du groupe en mémoire. */
forgeEffet('AssignGroup', ['Defined', 'Choices'], function* (P, t, env) {
  const joueurs = joueursForge(P, t, env), noms = String(t.Choices).split(',').map(s => s.trim()), groupes = noms.map(() => []);
  for (const j of joueurs) {
    const i = yield* choisitUn(P, env.ctrl, ['Ami', 'Ennemi'].slice(0, noms.length), `${P.joueurs[j].nom} : ami ou ennemi ?`, Math.min(j === env.ctrl ? 0 : 1, noms.length - 1), env.ctx.source);
    groupes[i].push(j);
  }
  jn(P, noms.map((n, i) => `${i ? 'Ennemis' : 'Amis'} : ${groupes[i].map(j => P.joueurs[j].nom).join(', ') || 'personne'}`).join(' — '));
  const avant = env.ctx.memoJ;
  try { for (let i = 0; i < noms.length; i++) if (groupes[i].length) { env.ctx.memoJ = groupes[i].slice(); yield* joueSous(P, env, noms[i]); } } finally { env.ctx.memoJ = avant; }
}, (t, op) => { op.op = 'forge'; op.hostile = true; }, {prepare: (t, op) => !!t.Choices && sousEffets(op, String(t.Choices).split(',').map(s => s.trim()))});

/* « Each friend searches their library… » : un par un, chacun cherche pour lui. */
FORGE_API.ChangeZone.gen = (g => function* (P, t, env) {
  if (t.DefinedPlayer !== 'Remembered' || env.ctx.memoJ.length < 2) return yield* g(P, t, env);
  const tous = env.ctx.memoJ.slice(), avant = env.ctx.memoJ;
  try { for (const j of tous) { env.ctx.memoJ = [j]; yield* g(P, t, env); } } finally { env.ctx.memoJ = avant; }
})(FORGE_API.ChangeZone.gen);

/* —— Se taire ou dénoncer —————————————————————————————————————————— */

forgeSait('param', 'GenericChoice.Secretly', 'Bookkeeping.NoteCards', 'Bookkeeping.NoteCardsFor', 'Bookkeeping.ClearNotedCardsFor');
/* Chaque joueur désigné choisit pour lui, le choix s'exécute avec lui en mémoire (`TempRemember$ Chooser`). */
FORGE_API.GenericChoice.gen = (g => function* (P, t, env) {
  if (t.Secretly !== 'True' && !(t.TempRemember === 'Chooser' && /^Player/.test(t.Defined || ''))) return yield* g(P, t, env);
  const modes = env.op.modes, avant = env.ctx.memoJ;
  try {
    for (const j of joueursForge(P, t, env)) {
      const i = yield* choisitUn(P, j, modes.map(m => m.texte), 'Choisir, en secret', 0, env.ctx.source);
      env.ctx.memoJ = [j];
      yield* executeOps(P, modes[i].effet.ops, env.ctx);
    }
  } finally { env.ctx.memoJ = avant; }
})(FORGE_API.GenericChoice.gen);
/* Retenir, pour un joueur, qu'il a été « noté » pour un mot ; l'oublier ensuite. */
FORGE_API.Bookkeeping.gen = (g => function* (P, t, env) {
  if (t.NoteCardsFor) {
    for (const j of forgeDefinis(P, t.Defined || 'You', env).map(x => joueurDe(x)).filter(j => j != null)) (P.joueurs[j].notes = P.joueurs[j].notes || {})[t.NoteCardsFor] = true;
    return;
  }
  if (t.ClearNotedCardsFor) { P.joueurs.forEach(J => { if (J.notes) String(t.ClearNotedCardsFor).split(',').forEach(n => { delete J.notes[n.trim()]; }); }); return; }
  return yield* g(P, t, env);
})(FORGE_API.Bookkeeping.gen);
aProprieteJoueur = (g => function (P, j, prop, env) {
  const m = /^NotedFor(\w+)$/.exec(prop);
  return m ? !!(P.joueurs[j].notes || {})[m[1]] : g(P, j, prop, env);
})(aProprieteJoueur);
proprieteJoueurEtendue = (g => function (P, j, p, ctrl, env) {
  const m = /^NotedFor(\w+)$/.exec(p);
  return m ? !!(P.joueurs[j].notes || {})[m[1]] : g(P, j, p, ctrl, env);
})(proprieteJoueurEtendue);
forgeSait('filtre', 'NotedForSilence', 'NotedForSnitch');
forgeSait('expr', 'PlayerCountOpponents$HasPropertyNotedForSilence', 'PlayerCountOpponents$HasPropertyNotedForSnitch', 'EQPlayerCountOpponents$Amount');

/* —— Payer la moitié de sa vie ———————————————————————————————————————— */

forgeSait('cout', 'LifeTotalHalfUp');
paieUnlessForge = (g => function* (P, t, env) {
  if (t.UnlessCost !== 'LifeTotalHalfUp') return yield* g(P, t, env);
  for (const j of forgeDefinis(P, t.UnlessPayer || 'You', env).map(x => joueurDe(x))) {
    if (j == null || P.joueurs[j].elimine || payerVieInterdit(P, j)) continue;
    const n = Math.ceil(P.joueurs[j].vie / 2);
    if (n <= 0) continue;
    const r = yield question(P, j, 'oui', ['non', 'oui'], {texte: `Payer ${n} PV (la moitié de votre vie) ?`, source: env.ctx.source, extra: {saufForge: {contre: false}}});
    if (r === 1) { payeVie(P, j, n, false); jn(P, `${P.joueurs[j].nom} paie ${n} PV`); return true; }
  }
  return false;
})(paieUnlessForge);

definisEtendus = (g => function (P, v, env) {
  const m = /^(Opponent|Player)\.NotedFor(\w+)$/.exec(v);
  if (m) return vivants(P).filter(J => (m[1] === 'Player' || J.i !== env.ctrl) && (J.notes || {})[m[2]]).map(J => ({j: J.i}));
  return g(P, v, env);
})(definisEtendus);
forgeSait('defini', 'Opponent.NotedForSilence');

/* Mob Verdict : `ValidPlayers$ Remembered`, le joueur de la boucle, en plus des créatures qu'il contrôle. */
FORGE_API.DamageAll.gen = (g => function* (P, t, env) {
  if (t.ValidPlayers !== 'Remembered') return yield* g(P, t, env);
  yield* g(P, {...t, ValidPlayers: undefined}, env);
  const n = forgeNombre(P, t.NumDmg || 0, env), src = sourceDegats(P, t, env);
  for (const j of env.ctx.memoJ.slice()) infligeDegats(P, src, {j}, n, false);
})(FORGE_API.DamageAll.gen);
