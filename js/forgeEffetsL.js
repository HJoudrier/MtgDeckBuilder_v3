/* =====================================================================
   js/forgeEffetsL.js — Des effets et des conditions de plus (lot F82)

   - `ActivationGameTypes$ Commander,Brawl,…` (War Room) : la capacité ne
     s'active que dans une partie à commandants — un joueur qui en a ;
   - `ConditionOpponentTurn$ True` (Fevered Visions) : le tour en cours
     est celui d'un adversaire ;
   - `Token | TokenBlocking$ TriggeredAttacker` (Brimaz) : le jeton entre
     en bloquant l'attaquant ;
   - `R:Event$ GainLife | Prevent$ True` (Sulfuric Vortex) : plus
     personne ne gagne de vie ;
   - `Unattach` (Akiri) : l'Équipement se détache ;
   - `EndTurn` (Sundial of the Infinite, Day's Undoing) : la pile s'exile,
     les étapes qui restent sont sautées et le nettoyage a lieu ;
   - `ProtectionAll | ValidPlayers$ You | Gains$ ChosenColor` (Seht's Tiger) :
     le joueur est à l'abri de la couleur — comme un linceul contre les
     cibles (`hexTemp`), et ses dégâts sont prévenus (`protTemp`) ;
   - `Goad | RememberGoaded$ True` (Havoc Eater) ;
   - `AddTurn | SkipUntap$ True` (Savor the Moment) : le tour en plus
     commence sans dégagement ;
   - les restrictions de lancement d'un sort ou d'activation d'une capacité
     que Forge écrit en paramètres : `OpponentTurn$ True` (Delirium),
     `ActivationFirstCombat$ True` (Berserk), `ActivationPhases$` — un sort
     qui les portait sans qu'on les tienne se lançait en tout temps.
   ===================================================================== */

FORGE_COMMUNS.add('ActivationGameTypes');
FORGE_COMMUNS.add('ConditionOpponentTurn');
forgeSait('param', 'ActivationGameTypes', 'ConditionOpponentTurn');

activationInterdite = (g => function (P, j, o, k) {
  if (k.jeux && !P.joueurs[j].commandants.length) return true;
  return g(P, j, o, k);
})(activationInterdite);

conditionForge = (g => function (P, t, env) {
  if (t.ConditionOpponentTurn && (P.actif !== env.ctrl) !== (t.ConditionOpponentTurn === 'True')) return false;
  return g(P, t, env);
})(conditionForge);

/* Le jeton qui entre bloquant : il rejoint les bloqueurs de l'attaquant. */
etendEffet('Token', ['TokenBlocking'], null, function* (P, t, env, touches, nouveaux) {
  const cb = P.combat, a = t.TokenBlocking && forgeDefinis(P, t.TokenBlocking, env).find(x => x && x.j == null && !x.lki);
  if (!cb || !a || !cb.attaquants.has(a.id)) return;
  nouveaux.forEach(o => {
    cb.bloqueurs.set(o.id, a.id);
    if (!cb.bloquesPar.has(a.id)) cb.bloquesPar.set(a.id, []);
    cb.bloquesPar.get(a.id).push(o.id);
    cb.bloque.add(a.id); P.ver++;
  });
});

formeRemplacement = (g => function (face, r) {
  const b = g(face, r);
  return b || (r.Event === 'GainLife' && r.Prevent === 'True' && !r.ReplaceWith ? 'pasDeVie' : b);
})(formeRemplacement);
forgeSait('param', 'GainLife.Prevent');

quantiteRemplacee = (g => function (P, evenement, n, quoi) {
  if (evenement === 'GainLife' && n > 0 && remplacementsEnJeu(P).some(({src, r}) => r.forme === 'pasDeVie' &&
    (!r.t.ValidPlayer || forgeValideJoueur(P, quoi.j, r.t.ValidPlayer, src.ctrl, envRemplacement(src, r))))) return 0;
  return g(P, evenement, n, quoi);
})(quantiteRemplacee);

/* Détacher : l'Équipement (ou l'Aura) cesse d'être attaché. */
forgeEffet('Unattach', ['Defined', 'Object'], function* (P, t, env) {
  forgeDefinis(P, t.Defined || 'Self', env).filter(o => o && o.j == null && !o.lki && o.zone === 'champ' && o.att != null)
    .forEach(o => { o.att = null; P.ver++; jn(P, `${o.def.nom} est détaché`); });
}, (t, op) => { op.op = 'forge'; op.hostile = false; });

/* Finir le tour : la pile s'exile, et le tour saute à son nettoyage (`suiteDuTour()`). */
forgeEffet('EndTurn', [], function* (P) {
  P.pile.forEach(it => { if (it.sort && obj(P, it.id)) deplace(P, it.id, 'exil'); });
  P.pile.length = 0;
  P.finTour = true; P.finTourEffet = true; P.ver++;
  jn(P, 'Le tour se termine');
}, (t, op) => { op.op = 'forge'; op.hostile = false; });

suiteDuTour = (g => function* (P) {
  yield* g(P);
  if (!P.finTourEffet || P.fin) return;
  P.finTourEffet = false; P.finTour = false; P.combat = null; P.etape = 'nettoyage';
  yield* etape(P, 'nettoyage');
  videReserves(P);
})(suiteDuTour);

/* Le tour en plus sans dégagement : les permanents n'en restent pas moins « prêts ». */
etendEffet('AddTurn', ['SkipUntap'], null, function* (P, t) { if (t.SkipUntap === 'True') P.sansDegagement = P.tour + 1; });
FORGE_API.AddTurn.prepare = t => !t.ExtraTurnDelayedTrigger;
degagement = (g => function (P) {
  if (P.sansDegagement !== P.tour) return g(P);
  P.champ.forEach(id => { const o = obj(P, id); if (o.ctrl === P.actif) o.pret = true; });
})(degagement);

/* Les restrictions de moment d'une capacité ou d'un sort, ou `null`. */
function restrictionSort(t) {
  const r = {};
  if (t.ActivationPhases) r.phases = t.ActivationPhases;
  /* « Activate only if it's not your turn » s'écrit aussi `Activator$ You.!Active` (Ghost Town) ; « only during your turn », `PlayerTurn$ True`. */
  if (t.OpponentTurn === 'True' || t.Activator === 'You.!Active') r.adverse = true;
  if (t.PlayerTurn === 'True') r.mien = true;
  if (t.ActivationFirstCombat === 'True') r.premierCombat = true;
  return Object.keys(r).length ? r : null;
}
function restrictionTenue(P, j, r) {
  return (!r.phases || dansPhases(P, r.phases)) && (!r.adverse || P.actif !== j) && (!r.mien || P.actif === j) && (!r.premierCombat || (P.combatsTour || 0) <= 1);
}
/* Inscrites par effet : un déclencheur qui porte `OpponentTurn$` doit la lire lui-même (SpellCast le fait). */
forgeSait('param', 'Tap.OpponentTurn', 'Pump.ActivationFirstCombat', 'ChangeZone.Activator');
forgeValeurs('ChangeZone.Activator', ['You.!Active']);

activationInterdite = (g => function (P, j, o, k) {
  if (k.restr && !restrictionTenue(P, j, k.restr)) return true;
  return g(P, j, o, k);
})(activationInterdite);
sortInterdit = (g => function (P, j, o, depuis, d) {
  if (d && d.restrictionsSort && !restrictionTenue(P, j, d.restrictionsSort)) return true;
  return g(P, j, o, depuis, d);
})(sortInterdit);

/* La protection d'un joueur : plus ciblable par la couleur, ni blessé par elle, jusqu'à la fin du tour. */
forgeSait('param', 'ProtectionAll.ValidPlayers');
FORGE_API.ProtectionAll.prepare = t => (!t.ValidPlayers || /^(You|Player\.You)$/.test(t.ValidPlayers)) && gainsProtection(t);
FORGE_API.ProtectionAll.gen = (g => function* (P, t, env) {
  if (!t.ValidPlayers) return yield* g(P, t, env);
  const couleurs = yield* couleursProtection(P, t, env), J = P.joueurs[env.ctrl];
  J.hexTemp = [...(J.hexTemp || []), ...couleurs];
  J.protTemp = [...(J.protTemp || []), ...couleurs];
  P.ver++;
})(FORGE_API.ProtectionAll.gen);

degatsApresPrevention = (g => function (P, src, cible, n, combat) {
  const J = cible && cible.j != null ? P.joueurs[cible.j] : null;
  if (J && J.protTemp && J.protTemp.length && src && (src.lki ? src.couleurs : src.def.couleurs).some(c => J.protTemp.includes(c))) return 0;
  return g(P, src, cible, n, combat);
})(degatsApresPrevention);

etendEffet('Goad', ['RememberGoaded'], null, function* (P, t, env, touches) {
  if (t.RememberGoaded === 'True') (touches || []).filter(o => o && o.j == null).forEach(o => retiensForge(env.ctx, o.id));
});
