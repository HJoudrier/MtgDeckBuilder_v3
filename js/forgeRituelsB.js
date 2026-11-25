/* =====================================================================
   js/forgeRituelsB.js — Les rituels d'EDHREC : boucles, votes, saisons

   Lot F105, suite de js/forgeRituels.js :
   - des marqueurs posés au choix du joueur (Promise of Loyalty), des cartes
     de la main remises (Dance of the Manse, From the Catacombs : l'animation
     donnée aux cartes revenues, l'exil si elles quittent) ;
   - les saisons : des modes à « pattes », cinq au total (Season of Gathering,
     Season of the Burrow) ;
   - ce qui a quitté le champ ce tour (Tale of Momo) ;
   - un éclair qui borne X (Silver Scrutiny) ;
   - des quantités lues sur les joueurs ou sur le coût payé (Devouring Greed,
     Tales of the Ancestors, Approach of the Second Sun…).
   ===================================================================== */

/* —— Un compte de marqueurs posés à son gré, des cartes de la main remises —————————————————— */

/* Promise of Loyalty : chaque joueur de la boucle choisit une de ses créatures (`Chooser$`), qui reçoit le marqueur ; le choix se retient. */
FORGE_API.PutCounter.gen = (g => function* (P, t, env) {
  if (!t.Chooser || !t.Choices) return yield* g(P, t, env);
  const qui = forgeDefinis(P, t.Chooser, env).map(x => joueurDe(x)).filter(j => j != null);
  for (const j of qui) {
    const ids = objetsZone(P, 'champ').filter(o => forgeValideObjet(P, o, t.Choices, env.src, env.ctrl, env)).map(o => o.id);
    if (!ids.length) continue;
    const [id] = yield* choisitCartes(P, j, ids, 1, 'Choisir une créature', 'cartes', 1);
    const o = obj(P, id != null ? id : ids[0]);
    poseMarqueurs(P, o, genreMarqueur(t.CounterType), forgeNombre(P, t.CounterNum || 1, env), env.src);
    if (t.RememberCards === 'True') retiensForge(env.ctx, o.id);
  }
})(FORGE_API.PutCounter.gen);
forgeSait('param', 'PutCounter.Chooser', 'PutCounter.Placer', 'PutCounter.RememberCards');

/* « Each player shuffles their hand into their library » : `ChangeZoneAll | Defined$ Player.IsRemembered` ne prend que les cartes du joueur de la boucle. */
FORGE_API.ChangeZoneAll.gen = (g => function* (P, t, env) {
  const base = t.ChangeType || 'Card', filtre = base + (base.includes('.') ? '+' : '.') + 'RememberedPlayerOwn';
  /* `DefinedPlayer$ TriggeredPlayer` (Teferi's Puzzle Box) : les cartes de ce joueur seulement, le temps du déplacement. */
  if (t.DefinedPlayer) {
    const avant = env.ctx.memoJ;
    env.ctx.memoJ = forgeDefinis(P, t.DefinedPlayer, env).map(x => joueurDe(x)).filter(j => j != null);
    try { return yield* g(P, {...t, DefinedPlayer: undefined, ChangeType: filtre}, env); } finally { env.ctx.memoJ = avant; }
  }
  if (t.Defined !== 'Player.IsRemembered') return yield* g(P, t, env);
  return yield* g(P, {...t, ChangeType: filtre}, env);
})(FORGE_API.ChangeZoneAll.gen);
forgeSait('param', 'ChangeZoneAll.Defined', 'ChangeZoneAll.DefinedPlayer');
definisEtendus = (g => function (P, v, env) {
  /* « Its controller draws a card » : le contrôleur de la cible de l'effet d'avant (Season of the Burrow). */
  if (v === 'ParentTargetedController') return uniquesJ(ciblesForge(P, env, true).map(x => joueurDe(x)));
  /* `Player.Opponent+IsRemembered` : les joueurs de la boucle qui sont adversaires. */
  if (/^Player\.[\w+!]+$/.test(v) && /\+IsRemembered/.test(v)) return vivants(P).filter(J => forgeValideJoueur(P, J.i, v, env.ctrl, env)).map(J => ({j: J.i}));
  return g(P, v, env);
})(definisEtendus);
forgeSait('defini', 'Player.Opponent+IsRemembered');
exprEtendue = (g => function (P, tete, q, env) {
  if (tete === 'PlayerCountRemembered' && q === 'CardsDrawn') return ((env.ctx && env.ctx.memoJ) || []).reduce((s, j) => s + (P.joueurs[j].piochesTour || 0), 0);
  return g(P, tete, q, env);
})(exprEtendue);
forgeSait('expr', 'PlayerCountRemembered$CardsDrawn');

/* —— Une animation donnée aux cartes revenues, un exil au lieu de quitter ————————————————— */

/* `StaticEffect$ Animate` (Dance of the Manse : des créatures 4/4 si X vaut 6 ou plus ; Ghouls' Night Out : des Zombies noirs). */
etendEffet('ChangeZone', ['StaticEffect', 'StaticEffectCheckSVar', 'StaticEffectSVarCompare', 'LeaveBattlefield'], null, function* (P, t, env, touches, nouveaux) {
  if (t.LeaveBattlefield === 'Exile') nouveaux.forEach(o => { o.exilSiQuitte = true; });
  if (!t.StaticEffect || !env.face.svars[t.StaticEffect]) return;
  if (t.StaticEffectCheckSVar && !conditionForge(P, {CheckSVar: t.StaticEffectCheckSVar, SVarCompare: t.StaticEffectSVarCompare}, env)) return;
  const st = forgeTable(env.face.svars[t.StaticEffect]), ty = typesForge(st.AddType || '');
  nouveaux.forEach(o => {
    (o.anime = o.anime || []).push({types: ty.types, sousTypes: ty.sousTypes, mots: 0, fin: 'jamais', par: env.ctrl, hote: null, force: st.SetPower != null ? +st.SetPower : null,
      endurance: st.SetToughness != null ? +st.SetToughness : null, couleurs: st.AddColor ? couleursMots(st.AddColor) : null, ecrase: false, retireSousTypes: false});
    P.ver++;
  });
});
/* « If it would leave the battlefield, exile it instead » (From the Catacombs). */
destinationRemplacee = (g => function (P, o, depuis, vers) {
  if (depuis === 'champ' && o.exilSiQuitte && vers !== 'exil' && vers !== 'champ') return 'exil';
  return g(P, o, depuis, vers);
})(destinationRemplacee);

/* —— Retourner au cimetière « au début de votre prochaine étape de fin » ———————————————— */

FORGE_API.CopyPermanent.prepare = (p => function (t, op) { return p.call(this, t.AtEOT === 'YourSacrifice' ? {...t, AtEOT: 'Sacrifice'} : t, op); })(FORGE_API.CopyPermanent.prepare);
FORGE_API.CopyPermanent.gen = (g => function* (P, t, env) { return yield* g(P, t.AtEOT === 'YourSacrifice' ? {...t, AtEOT: 'Sacrifice'} : t, env); })(FORGE_API.CopyPermanent.gen);
forgeSait('param', 'CopyPermanent.AtEOT');

/* —— Des paramètres d'ordre —————————————————————————————————————————— */

forgeSait('param', 'DigUntil.XMax', 'DamageAll.XMax', 'DamageAll.Announce', 'Token.ConditionPresent2', 'ChangeZone.NonBasicSpell', 'Discover.RememberDiscovered');
FORGE_COMMUNS.add('ConditionPresent2');
conditionForge = (g => function (P, t, env) {
  if (t.ConditionPresent2 && !g(P, {...t, ConditionDefined: undefined, ConditionPresent: t.ConditionPresent2, ConditionCompare: t.ConditionCompare2, ConditionZone: t.ConditionZone2}, env)) return false;
  return g(P, t, env);
})(conditionForge);
forgeSait('filtre', 'SharesColorWith Valid Creature.Legendary');

FORGE_API.RemoveCounter.prepare = (p => function (t, op) {
  if (t.Choices === 'Permanent' && t.CounterType === 'Any' && t.CounterNum === 'Any') return true;
  return p.call(this, t, op);
})(FORGE_API.RemoveCounter.prepare);
forgeSait('param', 'ConditionPresent2', 'ConditionCompare2', 'ConditionZone2');

/* —— Les saisons : des modes à « pattes », cinq au total ————————————————————— */

/* `Pawprint$ N` d'un mode : combien de pattes il coûte ; `Pawprint$ 5` du sort : le total qu'on se donne. On choisit un mode à la fois, un même mode autant de fois qu'on veut. */
FORGE_COMMUNS.add('Pawprint');
forgeSait('param', 'Pawprint');
effetForge = (g => function (face, t0, jetons, racine) {
  const e = g(face, t0, jetons, racine);
  if (e && e.modes && t0 && t0.Pawprint) {
    const noms = String(t0.Choices || '').split(',').map(n => n.trim()).filter(Boolean);
    e.modes.pattes = +t0.Pawprint;
    e.modes.options.forEach((o, i) => { const sub = forgeSousCapacite(face, noms[i]); o.pp = +((sub && sub.Pawprint) || 1); });
  }
  return e;
})(effetForge);
prepareEffets = (g => function* (P, j, src, effet, couleurs, extra) {
  if (!effet || !effet.modes || !effet.modes.pattes) return yield* g(P, j, src, effet, couleurs, extra);
  const m = effet.modes, options = [];
  let reste = m.pattes;
  for (let k = 0; k < 20 && reste > 0; k++) {
    const ok = m.options.filter(o => o.pp <= reste && o.cibles.every(sl => ciblesLegales(P, sl, src, j, couleurs).length >= sl.min));
    if (!ok.length) break;
    const texte = ok.map(o => `${o.texte} (${o.pp} patte${o.pp > 1 ? 's' : ''})`).concat([options.length ? 'Terminer' : 'Ne rien choisir']);
    const r = yield question(P, j, 'modes', texte, {min: 1, max: 1, multi: true, source: src && src.id, texte: `Il reste ${reste} patte${reste > 1 ? 's' : ''}`, defaut: [options.length ? ok.length : 0], extra: {options: ok}});
    const i = (Array.isArray(r) ? r : [r])[0];
    if (i == null || i >= ok.length) break;
    options.push(ok[i]); reste -= ok[i].pp;
  }
  const effets = [];
  for (const op of options) {
    const cibles = yield* choisitCibles(P, j, src, op.cibles, couleurs, {...extra, ops: op.ops});
    if (!cibles) return null;
    effets.push({ops: op.ops, slots: op.cibles, cibles});
  }
  return effets;
})(prepareEffets);

/* —— Ce qui a quitté le champ ce tour ———————————————————————————————— */

/* `Count$LeftBattlefieldThisTurn Creature.YouCtrl` (Tale of Momo) : les permanents qui ont quitté le champ ce tour, par leur instantané. */
noteHistorique = (g => function (P, e) {
  g(P, e);
  if (e.t === 'zone' && e.de === 'champ' && e.lki) (histoire(P).partisChamp = histoire(P).partisChamp || []).push(e.lki);
})(noteHistorique);
exprEtendue = (g => function (P, tete, q, env) {
  let k;
  if (tete === 'Count' && (k = /^LeftBattlefieldThisTurn (.+)$/.exec(q)))
    return (histoire(P).partisChamp || []).filter(l => forgeValideObjet(P, l, k[1], env.src, env.ctrl, env, true)).length;
  return g(P, tete, q, env);
})(exprEtendue);
forgeSait('expr', 'Count$LeftBattlefieldThisTurn');
forgeSait('defini', 'ParentTargetedController');

/* —— Un éclair qui borne X ———————————————————————————————————————————— */

/* Silver Scrutiny : « as though it had flash if X is 3 or less » — hors de la vitesse d'un rituel, X ne passe pas le plafond. */
function plafondXEclair(P, j, d) {
  if (enPhasePrincipale(P, j) || estEphemere(d)) return Infinity;
  const m = (d.statiques || []).map(s => s.s === 'forge' && s.t && s.t.Mode === 'CastWithFlash' && /^Spell\.XCostLE(\d+)$/.exec(s.t.ValidSA || '')).find(Boolean);
  return m ? +m[1] : Infinity;
}

/* —— Des quantités lues sur les joueurs ou sur le coût payé ———————————————————— */

exprEtendue = (g => function (P, tete, q, env) {
  let k;
  const src = env.src, cp = (env.ctx && env.ctx.coutPaye) || (src && src.lance && src.lance.coutPaye) || P.coutPaye || {};
  /* Tales of the Ancestors, Scholarship Sponsor : la plus grande valeur parmi les joueurs. */
  if (/^PlayerCount(Players)?$/.test(tete) && q === 'HighestCardsInHand') return Math.max(0, ...vivants(P).map(J => J.main.length));
  if (/^PlayerCount(Players)?$/.test(tete) && (k = /^HighestValid (.+)$/.exec(q)))
    return Math.max(0, ...vivants(P).map(J => objetsZone(P, 'champ').filter(o => forgeValideObjet(P, o, k[1], src, J.i, env)).length));
  /* Faerie Slumber Party : combien de joueurs, parmi les contrôleurs des cartes retenues, sont des adversaires. */
  if (tete === 'PlayerCountRememberedController' && q === 'HasPropertyOpponent')
    return new Set(((env.ctx && env.ctx.memo) || []).map(id => passeOuPresent(P, id)).filter(Boolean).map(o => o.ctrl).filter(j => j != null && j !== env.ctrl)).size;
  /* Devouring Greed : ce qui a été sacrifié au coût. */
  if (tete === 'Sacrificed' && q === 'Amount') return (cp.sacrifies || []).length;
  /* Commander's Insight : combien de fois le joueur visé a lancé ses commandants depuis la zone de commandement. */
  if (tete === 'TargetedPlayer' && q === 'TotalCommanderCastFromCommandZone') {
    const c = cibleForge(P, env, false), J = c && c.j != null ? P.joueurs[c.j] : null;
    return J ? Object.values(J.taxe || {}).reduce((s, n) => s + n, 0) : 0;
  }
  /* Approach of the Second Sun : un effet est créé à chaque lancement ; le compte se lit sur les lancements du même nom. */
  if (tete === 'Count' && q === 'ValidCommand Effect.YouCtrl+namedApproachingSuns')
    return ((P.joueurs[env.ctrl].lancesNom || {})['Approach of the Second Sun']) || 0;
  return g(P, tete, q, env);
})(exprEtendue);
forgeSait('expr', 'PlayerCountPlayers$HighestCardsInHand', 'PlayerCountPlayers$HighestValid', 'PlayerCountRememberedController$HasPropertyOpponent', 'Sacrificed$Amount',
  'TargetedPlayer$TotalCommanderCastFromCommandZone', 'Count$ValidCommand');
