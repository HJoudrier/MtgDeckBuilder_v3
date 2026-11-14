/* =====================================================================
   js/forgeEffetsI.js — Les effets nouveaux, II

   Deux piles (Fact or Fiction), le clash, le vote, sauter une étape,
   l'initiative, earthbend et airbend, un sort de permanent à coût
   additionnel (`PermanentCreature`). Et des paramètres de plus : un sort
   qui vise ce qui cible une créature, un choix au hasard, lancer la copie
   d'une carte, chaque marqueur d'une source, défausser autant qu'on veut,
   les capacités Exhaust qui ne s'activent qu'une fois.
   ===================================================================== */

/* « As an additional cost to cast this spell, tap two untapped
   artifacts… » : la capacité de lancement d'un permanent, lue par
   js/forgeDefinition.js `capaciteForge()` ; elle ne porte que ce qu'on
   paie en plus. Une aura (`Attach`) y passe aussi. */
function sortPermanentForge(def, t, c) {
  if (forgeApi(t) === 'Attach') { if (!t.ValidTgts) return false; def.aura = descForge(t.ValidTgts); return true; }
  if (Object.keys(c.cout).some(k => k !== 'mana')) def.coutSup = fusionAutres(def.coutSup, autresCout(c.cout)) || def.coutSup;
  return true;
}

/* —— Deux piles ——————————————————————————————————————————————————— */

/* Un joueur sépare des cartes en deux piles, un autre en choisit une ; la
   chaîne de chaque pile se joue avec elle pour mémoire (`Remembered`). La
   face cachée d'une carte (`FaceDown$`) n'est pas jouée. */
forgeEffet('TwoPiles', ['Defined', 'DefinedCards', 'Separator', 'Chooser', 'ChosenPile', 'UnchosenPile', 'Zone', 'ValidCards', 'DefinedPiles',
  'RememberChosen', 'FaceDown', 'KeepRemembered'], function* (P, t, env) {
  const joueur = v => forgeDefinis(P, v, env).map(x => joueurDe(x)).find(j => j != null);
  const qui = joueur(t.Chooser || t.Defined || 'You');
  if (qui == null) return;
  let piles;
  if (t.DefinedPiles) piles = t.DefinedPiles.split(',').map(v => forgeDefinis(P, v.trim(), env).filter(x => x && x.j == null).map(o => o.id));
  else {
    const sep = joueur(t.Separator || 'You');
    const cartes = (t.DefinedCards ? forgeDefinis(P, t.DefinedCards, env).filter(x => x && x.j == null)
      : objetsZone(P, ZONES_FORGE[t.Zone] || 'champ').filter(o => forgeValideObjet(P, o, t.ValidCards || 'Card', env.src, env.ctrl, env))).map(o => o.id);
    if (sep == null || !cartes.length) return;
    const r = yield question(P, sep, 'cartes', cartes, {min: 0, max: cartes.length, multi: true, texte: 'Séparer en deux piles', source: env.src && env.src.id});
    const un = (Array.isArray(r) ? r : [r]).map(i => cartes[i]).filter(x => x != null);
    piles = [un, cartes.filter(id => !un.includes(id))];
  }
  const noms = l => l.map(id => obj(P, id) ? obj(P, id).def.nom : '?').join(', ') || 'vide';
  const v = l => l.reduce((s, id) => s + (obj(P, id) ? valeurDef(obj(P, id).def) : 0), 0);
  const i = yield* choisitUn(P, qui, piles.map((l, k) => `Pile ${k + 1} : ${noms(l)}`), 'Choisir une pile', v(piles[0]) >= v(piles[1]) ? 0 : 1, env.src && env.src.id);
  const pris = piles[i] || [], laisses = piles[1 - i] || [];
  jn(P, `${P.joueurs[qui].nom} choisit : ${noms(pris)}`);
  if (t.RememberChosen === 'True') pris.forEach(id => retiensForge(env.ctx, id));
  const sous = env.op.sous || {};
  if (t.ChosenPile) yield* executeOps(P, sous[t.ChosenPile], {...env.ctx, memo: pris.slice()});
  if (t.UnchosenPile) yield* executeOps(P, sous[t.UnchosenPile], {...env.ctx, memo: laisses.slice()});
}, (t, op) => { op.op = 'forge'; op.hostile = false; }, {
  prepare(t, op) {
    if (t.LeftRightPile || (!t.DefinedCards && !t.ValidCards && !t.DefinedPiles)) return false;
    return sousEffets(op, [t.ChosenPile, t.UnchosenPile]);
  }
});

/* —— Le clash ——————————————————————————————————————————————————————— */

/* Chacun révèle le dessus de sa bibliothèque ; on gagne si sa carte a la
   plus grande valeur de mana. Chacun peut ensuite la mettre dessous. */
forgeEffet('Clash', ['WinSubAbility', 'OtherwiseSubAbility', 'RememberClasher'], function* (P, t, env) {
  const j = env.ctrl, opp = adversaires(P, j);
  if (!opp.length) return;
  const o = opp.length > 1 ? opp[yield* choisitUn(P, j, opp.map(k => P.joueurs[k].nom), 'Clash avec', 0, env.src && env.src.id)] : opp[0];
  const haut = k => { const B = P.joueurs[k].bibliotheque; return B.length ? obj(P, B[B.length - 1]) : null; };
  const a = haut(j), b = haut(o), gagne = !!a && (!b || mvDe(a) > mvDe(b));
  jn(P, `Clash : ${a ? a.def.nom : 'rien'} contre ${b ? b.def.nom : 'rien'} — ${gagne ? 'gagné' : 'perdu'}`);
  if (t.RememberClasher === 'True') retiensForge(env.ctx, {j: o});
  for (const [k, c] of [[j, a], [o, b]]) {
    if (!c) continue;
    const L = champDe(P, k).filter(x => estType(x, 'land')).length, dessous = estType(c, 'land') ? L >= 6 : mvDe(c) > L + 2;
    if ((yield* choisitUn(P, k, ['Laisser dessus', 'Mettre dessous'], 'Clash : ' + c.def.nom, dessous ? 1 : 0, c.id)) === 1) {
      const B = P.joueurs[k].bibliotheque; retireDe(B, c.id); B.unshift(c.id);
    }
  }
  emet(P, {t: 'clash', joueur: j, gagne});
  const n = gagne ? t.WinSubAbility : t.OtherwiseSubAbility;
  if (n) yield* executeOps(P, env.op.sous[n], env.ctx);
}, (t, op) => { op.op = 'forge'; op.hostile = false; }, {
  prepare: (t, op) => sousEffets(op, [t.WinSubAbility, t.OtherwiseSubAbility])
});
forgeMode('Clashed', ['ValidPlayer', 'Won'], (P, t, e, s, env) => e.t === 'clash' && joueurOuRien(P, e.joueur, t.ValidPlayer, s, env) &&
  (!t.Won || (t.Won === 'True') === e.gagne));

/* —— Le vote ———————————————————————————————————————————————————————— */

/* Chaque joueur vote pour un choix ; le plus voté se joue. À égalité, le
   choix d'égalité s'il y en a un, sinon chacun des ex æquo. Council's
   dilemma (`StoreVoteNum`) : chaque choix se joue, avec son nombre de voix
   (`VoteNum`). L'IA vote pour ce qui lui rapporte. */
forgeEffet('Vote', ['Defined', 'Choices', 'VoteTiedAbility', 'StoreVoteNum', 'Secretly', 'VoteMessage'], function* (P, t, env) {
  const ch = env.op.votes;
  const votants = forgeDefinis(P, t.Defined || 'Player', env).map(x => joueurDe(x)).filter(j => j != null && !P.joueurs[j].elimine);
  const voix = ch.choix.map(() => 0);
  for (const j of votants) {
    const notes = ch.choix.map(c => (j === env.ctrl ? 1 : -1) * scoreEffet(P, env.ctrl, c.effet, env.src));
    voix[yield* choisitUn(P, j, ch.choix.map(c => c.texte), 'Voter', notes.indexOf(Math.max(...notes)), env.src && env.src.id)]++;
  }
  jn(P, 'Vote : ' + ch.choix.map((c, i) => `${c.texte} ${voix[i]}`).join(', '));
  if (t.StoreVoteNum === 'True') {
    for (let i = 0; i < ch.choix.length; i++) if (voix[i]) yield* executeOps(P, ch.choix[i].effet.ops, {...env.ctx, vars: {...(env.ctx.vars || {}), VoteNum: voix[i]}});
    return;
  }
  const max = Math.max(...voix), tete = ch.choix.filter((c, i) => voix[i] === max);
  if (tete.length > 1 && t.VoteTiedAbility) return yield* executeOps(P, env.op.sous[t.VoteTiedAbility], env.ctx);
  for (const c of tete) yield* executeOps(P, c.effet.ops, env.ctx);
}, (t, op) => { op.op = 'forge'; op.hostile = false; }, {
  prepare(t, op) {
    if (!t.Choices) return false;
    const choix = [];
    for (const nom of t.Choices.split(',').map(x => x.trim())) {
      const sub = forgeSousCapacite(op.face, nom), e = sub && effetForge(op.face, sub, op.jetons);
      if (!e || e.cibles.length || e.modes) return false;
      choix.push({texte: sub.SpellDescription || nom, effet: e});
    }
    op.votes = {choix};
    return sousEffets(op, [t.VoteTiedAbility]);
  }
});

/* —— Sauter une étape ————————————————————————————————————————————— */

const ETAPES_SAUTEES = {Untap: 'degagement', Upkeep: 'entretien', Draw: 'pioche', BeginCombat: 'combat', Combat: 'combat'};
const ETAPES_DU_COMBAT = ['debutCombat', 'attaquants', 'bloqueurs', 'initiative', 'degats', 'finCombat'];

/* « Skip your next untap step », « skip your next combat phase » : retenu
   pour le joueur, levé à la première étape qu'il saute. */
forgeEffet('SkipPhase', ['Step', 'Phase'], function* (P, t, env) {
  const e = ETAPES_SAUTEES[t.Step || t.Phase];
  for (const j of joueursForge(P, t, env)) (P.sauts = P.sauts || []).push({j, e});
}, (t, op) => { op.op = 'forge'; op.hostile = op.slot != null; }, {prepare: t => !!ETAPES_SAUTEES[t.Step || t.Phase] && !t.Duration && !t.Start});
etapeSautee = (g => function (P, e) {
  if (P.combatSaute === P.tour && ETAPES_DU_COMBAT.includes(e)) return true;
  const k = (P.sauts || []).findIndex(s => s.j === P.actif && (s.e === e || (s.e === 'combat' && e === 'debutCombat')));
  if (k >= 0) {
    const s = P.sauts.splice(k, 1)[0];
    if (s.e === 'combat') P.combatSaute = P.tour;
    jn(P, `${P.joueurs[P.actif].nom} saute ${e === 'debutCombat' ? 'le combat' : 'l’étape'}`);
    return true;
  }
  return g(P, e);
})(etapeSautee);

/* —— L'initiative ——————————————————————————————————————————————————— */

/* Prendre l'initiative, c'est s'aventurer dans l'Undercity — le donjon
   simplifié de `Venture` (js/forgeEffetsG.js). On s'y aventure encore à
   son entretien, et qui blesse au combat le joueur qui l'a la lui prend. */
function* prendInitiative(P, j, env) {
  P.initiative = j;
  jn(P, `${P.joueurs[j].nom} prend l'initiative`);
  yield* FORGE_API.Venture.gen(P, {}, {...env, ctrl: j});
}
forgeEffet('TakeInitiative', [], function* (P, t, env) { yield* prendInitiative(P, env.ctrl, env); }, (t, op) => { op.op = 'forge'; op.hostile = false; });
OPS.initiative = function* (P, op, ctx) {
  yield* prendInitiative(P, ctx.ctrl, {ctrl: ctx.ctrl, src: null, ctx, op: {}});
};
rebondsEntretien = (g => function* (P) {
  yield* g(P);
  if (P.initiative === P.actif && !P.joueurs[P.actif].elimine) yield* FORGE_API.Venture.gen(P, {}, {ctrl: P.actif, src: null, ctx: {cibles: [], memo: [], memoJ: []}, op: {}});
})(rebondsEntretien);
/* Les blessures de combat au joueur qui a l'initiative (js/jeuHistorique.js). */
function initiativeVolee(P, e) {
  const s = obj(P, e.source) || P.lkis.get(e.source);
  if (!s || s.ctrl == null || s.ctrl === e.joueur) return;
  P.initiative = s.ctrl;
  suiteRemplacement(P, [{op: 'initiative'}], {ctrl: s.ctrl, source: null, cibles: [], trouves: [], memo: [], memoJ: [], x: 0});
}

/* —— Earthbend, airbend ————————————————————————————————————————————— */

/* Earthbend N : un terrain qu'on contrôle devient une créature 0/0 avec
   la célérité, et reçoit N marqueurs +1/+1 ; mort ou exilé, il revient
   engagé. Forge le fait cibler ; il est choisi ici à la résolution. */
const CAP_TERRE = {genre: 'declenchee', ecoutes: [{evt: 'quitte'}], texte: 'Earthbend : revient engagé', effet: {ops: [{op: 'terreRevient', hostile: false}], cibles: [], modes: null}};
forgeEffet('Earthbend', ['Num'], function* (P, t, env) {
  const n = forgeNombre(P, t.Num || 1, env), terres = champDe(P, env.ctrl).filter(o => estType(o, 'land'));
  const [id] = yield* choisitCartes(P, env.ctrl, terres.map(o => o.id), 1, 'Earthbend', 'cartes', 1);
  const o = id != null && obj(P, id);
  if (!o) return;
  (o.anime = o.anime || []).push({types: ['creature'], sousTypes: [], mots: MOT.CELERITE, fin: 'jamais', force: 0, endurance: 0, couleurs: null,
    ecrase: false, retireSousTypes: false, retireTypes: false, retireTerrains: false, perdTout: false, retireMots: 0, capacites: [CAP_TERRE], statiques: null});
  P.ver++;
  poseMarqueurs(P, o, '+1/+1', n, env.src);
}, (t, op) => { op.op = 'marqueurs'; op.genre = '+1/+1'; op.n = nombreIA(t.Num || 1); op.hostile = false; });
OPS.terreRevient = function* (P, op, ctx) {
  const e = ctx.evt || {}, id = e.t === 'zone' && e.id != null ? e.id : suit(P, ctx.source), o = obj(P, id);
  if (o && (o.zone === 'cimetiere' || o.zone === 'exil')) yield* metEnJeu(P, id, o.prop, {engage: true});
};

/* Airbend : exiler ; tant qu'elle est exilée, son propriétaire peut la
   lancer pour {2}. */
forgeEffet('Airbend', [], function* (P, t, env) {
  for (const o of objetsForge(P, t, env, 'Targeted').filter(x => x.zone === 'champ' && !x.lki)) {
    const n = deplace(P, o.id, 'exil');
    if (n != null && obj(P, n)) obj(P, n).airbend = true;
  }
}, (t, op) => { op.op = 'exile'; op.a = op.slot != null ? {cible: op.slot} : {soi: 1}; op.hostile = true; });
variantesExilLancement = (g => function (P, j, o, essaie) {
  if (o.airbend && o.prop === j) { essaie('airbend', coutSort(P, j, o, 'exil', MANA_DEUX), o.def.coutSup || null); return true; }
  return g(P, j, o, essaie);
})(variantesExilLancement);
exilLancable = (g => function (P, o, rituel) { return (!!o.airbend && (rituel || estEphemere(o.def))) || g(P, o, rituel); })(exilLancable);

/* —— Les paramètres de plus ————————————————————————————————————————— */

/* « Counter target spell that targets a creature » : seuls les sorts dont
   une cible convient (`TargetValidTargeting`, js/forgeDescripteurs.js). */
candidatsDuControleur = (g => function (P, sl, cands, src, j, extra, choix) {
  const l = g(P, sl, cands, src, j, extra, choix);
  if (!sl.visant) return l;
  const env = {ctx: {cibles: [], memo: [], memoJ: []}, src, ctrl: j, op: {}};
  return l.filter(c => typeof c === 'number' && ciblesDuSort(P, c).some(x => x.j != null ? forgeValideJoueur(P, x.j, sl.visant, j, env) : forgeValideObjet(P, x, sl.visant, src, j, env)));
})(candidatsDuControleur);

/* Choisir au hasard (`AtRandom$`). */
FORGE_API.ChooseCard.gen = (g => function* (P, t, env) {
  if (t.AtRandom !== 'True') return yield* g(P, t, env);
  const zone = ZONES_FORGE[t.ChoiceZone] || 'champ';
  const ids = objetsZone(P, zone).filter(o => forgeValideObjet(P, o, t.Choices || 'Card', env.src, env.ctrl, env)).map(o => o.id);
  melangeHasard(P.rng, ids);
  const pris = ids.slice(0, forgeNombre(P, t.Amount || 1, env));
  choixDe(P, env.src).cartes = pris;
  if (t.RememberChosen === 'True') pris.forEach(id => retiensForge(env.ctx, id));
})(FORGE_API.ChooseCard.gen);

/* Lancer une copie de la carte (`CopyCard$`) : un jeton-sort, comme les
   copies de js/jeuPrepare.js, gratuit si l'effet le dit. */
FORGE_API.Play.prepare = (p => (t, op) => t.CopyCard === 'True' ? !t.PlayCost && !t.ReplaceGraveyard : p(t, op))(FORGE_API.Play.prepare);
FORGE_API.Play.gen = (g => function* (P, t, env) {
  if (t.CopyCard !== 'True') return yield* g(P, t, env);
  const j = t.Controller ? forgeDefinis(P, t.Controller, env).map(x => joueurDe(x))[0] : env.ctrl;
  if (j == null) return;
  for (const o of (t.Valid ? [] : objetsForge(P, t, env, 'Targeted')).filter(x => x && x.j == null && !estType(x, 'land'))) {
    if (t.Optional === 'True' && (yield question(P, j, 'oui', ['non', 'oui'], {texte: `Lancer une copie de ${o.def.nom} ?`, source: o.id})) !== 1) continue;
    const cid = nouvelleCarte(P, P.cartes[o.cid].def, j, false, true);
    P.cartes[cid].copieSort = true;
    const c = creeObjet(P, cid, j, 'main');
    P.joueurs[j].main.push(c.id);
    if (!(yield* lanceDepuisEffet(P, j, c, t.WithoutManaCost === 'True'))) { retireDe(P.joueurs[j].main, c.id); P.objets.delete(c.id); }
  }
})(FORGE_API.Play.gen);

/* « Put each kind of counter from it on target creature » (`EachFromSource$`). */
FORGE_API.PutCounter.gen = (g => function* (P, t, env) {
  if (t.CounterType !== 'EachFromSource') return yield* g(P, t, env);
  const s = forgeDefinis(P, t.EachFromSource || 'Self', env).find(x => x && x.j == null);
  if (!s) return;
  const l = env.op.slot != null ? ciblesForge(P, env, false) : forgeDefinis(P, t.Defined || 'Self', env);
  for (const o of l.filter(x => x && x.j == null && x.zone === 'champ' && !x.lki))
    for (const [genre, n] of Object.entries(s.marq || {})) if (n > 0) poseMarqueurs(P, o, genre, t.CounterNum ? forgeNombre(P, t.CounterNum, env) : n, env.src);
})(FORGE_API.PutCounter.gen);

/* Défausser autant de cartes qu'on veut (`AnyNumber$`). */
FORGE_API.Discard.gen = (g => function* (P, t, env) {
  if (t.AnyNumber !== 'True') return yield* g(P, t, env);
  for (const j of joueursForge(P, t, env)) {
    const ids = P.joueurs[j].main.filter(id => !t.DiscardValid || forgeValideObjet(P, obj(P, id), t.DiscardValid, env.src, env.ctrl, env));
    for (const id of yield* choisitCartes(P, j, ids, ids.length, 'Défausser', 'defausse', 0)) {
      const n = defausseCarte(P, id, j);
      if (n != null && t.RememberDiscarded === 'True') retiensForge(env.ctx, n);
    }
  }
})(FORGE_API.Discard.gen);

/* Exhaust : une capacité qu'un objet n'active qu'une fois. */
const epuisable = k => !!(k.effet && k.effet.ops[0] && k.effet.ops[0].t && k.effet.ops[0].t.Exhaust === 'True');
activationInterdite = (g => function (P, j, o, k) { return (epuisable(k) && (o.epuises || []).includes(k)) || g(P, j, o, k); })(activationInterdite);
activeCapacite = (g => function* (P, j, a) {
  const o = obj(P, a.id), k = o && o.zone === 'champ' ? capacitesDe(P, o)[a.i] : null;
  const r = yield* g(P, j, a);
  if (r && k && epuisable(k)) (o.epuises = o.epuises || []).push(k);
  return r;
})(activeCapacite);

FORGE_COMMUNS.add('Exhaust');
forgeSait('param', 'Exhaust');
forgeSait('api', 'PermanentCreature', 'PermanentNoncreature');
forgeSait('param', 'ChooseCard.AtRandom', 'Play.CopyCard', 'PutCounter.EachFromSource', 'Discard.AnyNumber', 'ChooseNumber.ListTitle',
  'Counter.TargetValidTargeting', 'SacrificeAll.Controller');
forgeSait('expr', 'SVar$VoteNum');
