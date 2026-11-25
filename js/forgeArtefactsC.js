/* =====================================================================
   js/forgeArtefactsC.js — Les artefacts d'EDHREC : de petites pièces

   Lot F108. Un mécanisme chacun, les plus simples d'abord :
   - Crystalline Giant : un marqueur d'un genre tiré au hasard, parmi ceux
     que la créature n'a pas (`PutCounter | RandomType | UniqueType`) ;
   - Draco : « sacrifice unless you pay {10} » réduit de {2} par type de
     terrain de base — le coût de `UnlessCost` est le nom d'une SVar, que
     `coutUnless()` lit pour tout nom (js/jeuCoutsX.js) ;
   - Altar of the Pantheon : `Mode$ Devotion`, un point de dévotion de plus
     à chaque couleur ;
   - The Millennium Calendar : `UntapAll`, combien de permanents se sont
     dégagés à l'étape de dégagement ;
   - The Golden Throne : `GameLoss | ReplaceWith` — au lieu de perdre, la
     source est exilée et la vie passe à 1 ;
   - Market Gnome : `Exiled | WhileKeyword$ Ability.Craft`, sans objet tant
     que le moteur ne tient pas le « craft » (aucune carte jouable ne le
     lance) ;
   - The Irencrag : `Animate | Name | OptionQuestion`.
   ===================================================================== */

/* —— Un marqueur au hasard ————————————————————————————————————————— */

forgeSait('param', 'PutCounter.RandomType', 'PutCounter.UniqueType');
FORGE_API.PutCounter.gen = (g => function* (P, t, env) {
  if (t.RandomType !== 'True') return yield* g(P, t, env);
  const genres = String(t.CounterType).split(',').map(x => genreMarqueur(x.trim()));
  for (const o of objetsForge(P, t, env).filter(x => x && x.j == null && x.zone === 'champ' && !x.lki)) {
    const libres = genres.filter(k => t.UniqueType !== 'True' || !(o.marq[k] > 0));
    if (!libres.length) continue;
    poseMarqueurs(P, o, libres[entierHasard(P.rng, libres.length)], forgeNombre(P, t.CounterNum || 1, env), env.src);
  }
})(FORGE_API.PutCounter.gen);
FORGE_API.PutCounter.prepare = (p => function (t, op) { return t.RandomType === 'True' || !p || p.call(this, t, op); })(FORGE_API.PutCounter.prepare);

/* —— Payer ce qu'une SVar calcule ————————————————————————————————— */

forgeSait('cout', 'UpkeepX');

/* —— La dévotion, augmentée ——————————————————————————————————————— */

forgeStatique('Devotion', ['ValidPlayer'], () => {});
devotion = (g => function (P, j, lettres) {
  const plus = statiquesMode(P, 'Devotion').filter(x => joueurStatique(P, j, x.s.t.ValidPlayer, x.src, envStatique(x.src, x.s))).length;
  return g(P, j, lettres) + plus;
})(devotion);

/* —— Les permanents qui se dégagent ———————————————————————————————— */

degagement = (g => function (P) {
  const avant = P.champ.filter(id => obj(P, id).ctrl === P.actif && obj(P, id).engage);
  g(P);
  const ids = avant.filter(id => obj(P, id) && !obj(P, id).engage);
  if (ids.length) emet(P, {t: 'degageTout', joueur: P.actif, ids, n: ids.length});
})(degagement);
forgeMode('UntapAll', ['ValidCards', 'ValidPlayer', 'Phase', 'PlayerTurn'], (P, t, e, s, env) => e.t === 'degageTout' && joueurOuRien(P, e.joueur, t.ValidPlayer, s, env) &&
  (t.PlayerTurn !== 'True' || e.joueur === s.ctrl));

/* —— Au lieu de perdre la partie ——————————————————————————————————— */

forgeSait('param', 'GameLoss.ReplaceWith');
formeRemplacementB = (g => function (r) {
  if (r.Event === 'GameLoss' && r.ReplaceWith && !r.Layer) return 'perdSubstitue';
  return g(r);
})(formeRemplacementB);
/* Le remplacement joue sa suite (exiler la source, vie à 1) et la perte n'a pas lieu. */
nePeutPerdre = (g => function (P, j, raison) {
  if (g(P, j, raison)) return true;
  const x = remplacementsEnJeu(P).find(({src, r}) => r.forme === 'perdSubstitue' && (!r.t.ValidPlayer || forgeValideJoueur(P, j, r.t.ValidPlayer, src.ctrl, envRemplacement(src, r))));
  if (!x) return false;
  const sous = forgeSousCapacite(x.r.face, x.r.t.ReplaceWith), e = sous && effetForge(x.r.face, sous, [], false);
  if (!e) return false;
  /* Les actions d'état reviennent tant que la suite n'a pas joué : une seule fois. */
  if ((P.suitesRemp || []).some(s => s.ctx.perdSubst === j)) return true;
  jn(P, `${P.joueurs[j].nom} aurait perdu : ${x.src.def.nom} s'y substitue`);
  suiteRemplacement(P, e.ops, {ctrl: x.src.ctrl, source: x.src.id, cibles: [], trouves: [], memo: [], memoJ: [], x: 0, perdSubst: j});
  return true;
})(nePeutPerdre);

/* —— Exilé pendant un « craft » ———————————————————————————————————— */

forgeMode('Exiled', ['Origin', 'WhileKeyword', 'ValidCard'], () => false);

/* —— Devenir un autre artefact —————————————————————————————————————— */

forgeSait('param', 'Animate.Name', 'Animate.OptionQuestion');
/* « Becomes a legendary Equipment artifact named … with equip {3}, loses all other abilities » : la définition recopiée, avec son nom, ses types, son équipement et sa statique. */
FORGE_API.Animate.gen = (g => function* (P, t, env) {
  if (!t.Name || t.RemoveAllAbilities !== 'True') return yield* g(P, t, env);
  const tmp = {capacites: [], statiques: [], params: {}, mots: 0}, face = env.face, jetons = (env.op && env.op.jetons) || [];
  String(t.Keywords || '').split('&').map(k => k.trim()).filter(Boolean).forEach(k => motCleForge(tmp, k, face, jetons));
  String(t.staticAbilities || '').split('&').map(n => n.trim()).filter(n => face.svars[n]).forEach(n => { const s = statiqueForge(face, forgeTable(face.svars[n]), jetons); if (s) tmp.statiques.push(s); });
  const ty = typesForge(t.Types);
  for (const o of objetsForge(P, t, env).filter(x => x && x.j == null && x.zone === 'champ' && !x.lki)) {
    o.def = {...o.def, nom: t.Name, types: ty.types, sousTypes: ty.sousTypes.filter(x => x !== 'legendary'), supers: ty.sousTypes.includes('legendary') ? ['legendary'] : [], capacites: tmp.capacites, statiques: tmp.statiques,
      equipe: tmp.equipe || null, equipeAutre: tmp.equipeAutre || null, mots: 0, params: {}, force: null, endurance: null, couleurs: []};
    P.ver++;
    jn(P, `${t.Name} : ${o.def.nom} a changé de nom`);
  }
})(FORGE_API.Animate.gen);
FORGE_API.Animate.prepare = (p => function (t, op) { return (!!t.Name && t.RemoveAllAbilities === 'True') || !p || p.call(this, t, op); })(FORGE_API.Animate.prepare);
