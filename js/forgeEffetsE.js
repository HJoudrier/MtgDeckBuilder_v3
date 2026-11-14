/* =====================================================================
   js/forgeEffetsE.js — Les effets de Forge : la bibliothèque et ce qu'on
   révèle, et lancer une carte depuis un effet

   Mélanger, révéler sa main ou des cartes, regarder le dessus de sa
   bibliothèque, révéler jusqu'à trouver (« reveal cards until you reveal
   a creature card »), découvrir, et « you may cast it without paying its
   mana cost » (`Play`). Révéler ne change rien au jeu du moteur : ce qui
   compte est ce que la carte retient (`RememberRevealed$`), que la suite
   de la capacité lit.
   ===================================================================== */

forgeEffet('Shuffle', [], function* (P, t, env) {
  joueursForge(P, t, env).forEach(j => melangeHasard(P.rng, P.joueurs[j].bibliotheque));
}, (t, op) => { op.op = 'forge'; op.hostile = false; });

forgeEffet('RevealHand', ['Look', 'RememberRevealed', 'RememberRevealedPlayer'], function* (P, t, env) {
  for (const j of joueursForge(P, t, env)) {
    if (t.RememberRevealed === 'True') P.joueurs[j].main.forEach(id => retiensForge(env.ctx, id));
    if (t.RememberRevealedPlayer === 'True') retiensForge(env.ctx, {j});
    jn(P, `${P.joueurs[j].nom} révèle sa main`);
  }
}, (t, op) => { op.op = 'forge'; op.hostile = false; });

/* Révéler des cartes de sa main : celles qu'on choisit parmi `RevealValid`,
   ou toutes (`RevealAllValid`), ou au hasard. */
forgeEffet('Reveal', ['RevealValid', 'RevealAllValid', 'RevealDefined', 'Random', 'AnyNumber', 'NumCards', 'RememberRevealed'], function* (P, t, env) {
  for (const j of joueursForge(P, t, env)) {
    let ids;
    if (t.RevealDefined) ids = forgeDefinis(P, t.RevealDefined, env).filter(o => o && o.j == null).map(o => o.id);
    else {
      const ok = P.joueurs[j].main.filter(id => !(t.RevealValid || t.RevealAllValid) || forgeValideObjet(P, obj(P, id), t.RevealValid || t.RevealAllValid, env.src, env.ctrl, env));
      const n = t.RevealAllValid ? ok.length : t.AnyNumber === 'True' ? ok.length : forgeNombre(P, t.NumCards || 1, env);
      ids = t.RevealAllValid ? ok : t.Random === 'True' ? melangeHasard(P.rng, ok.slice()).slice(0, n)
        : yield* choisitCartes(P, j, ok, Math.min(n, ok.length), 'Révéler', 'cartes', t.AnyNumber === 'True' ? 0 : Math.min(n, ok.length));
    }
    if (t.RememberRevealed === 'True') ids.forEach(id => retiensForge(env.ctx, id));
  }
}, (t, op) => { op.op = 'forge'; op.hostile = false; });

/* Regarder le dessus de sa bibliothèque, et en révéler ce qui répond. */
forgeEffet('PeekAndReveal', ['PeekAmount', 'RevealValid', 'RevealOptional', 'RememberRevealed', 'RememberPeeked', 'NoPeek', 'NoReveal'], function* (P, t, env) {
  for (const j of joueursForge(P, t, env)) {
    const B = P.joueurs[j].bibliotheque, dessus = B.slice(-forgeNombre(P, t.PeekAmount || 1, env));
    if (t.RememberPeeked === 'True') dessus.forEach(id => retiensForge(env.ctx, id));
    const vus = dessus.filter(id => !t.RevealValid || forgeValideObjet(P, obj(P, id), t.RevealValid, env.src, env.ctrl, env));
    if (t.RememberRevealed === 'True' && t.NoReveal !== 'True') vus.forEach(id => retiensForge(env.ctx, id));
  }
}, (t, op) => { op.op = 'forge'; op.hostile = false; });

/* Révéler jusqu'à trouver : les trouvées vont où `FoundDestination$` le
   dit, les autres où `RevealedDestination$` le dit. */
forgeEffet('DigUntil', ['Valid', 'Amount', 'FoundDestination', 'RevealedDestination', 'RevealedLibraryPosition', 'FoundLibraryPosition',
  'RememberFound', 'RememberRevealed', 'Shuffle', 'RevealRandomOrder'], function* (P, t, env) {
  for (const j of joueursForge(P, t, env)) {
    const B = P.joueurs[j].bibliotheque, voulu = forgeNombre(P, t.Amount || 1, env), trouves = [], reveles = [];
    while (B.length && trouves.length < voulu) {
      const id = B[B.length - 1], o = obj(P, id);
      retireDe(B, id);
      (forgeValideObjet(P, o, t.Valid || 'Card', env.src, env.ctrl, env) ? trouves : reveles).push(id);
    }
    /* Remises au dessus le temps de les déplacer : `deplaceForge()` part de
       la bibliothèque comme d'une autre zone. */
    [...reveles, ...trouves].forEach(id => B.push(id));
    const fd = zoneForge(t.FoundDestination) || 'main', rd = zoneForge(t.RevealedDestination) || 'cimetiere';
    for (const id of trouves) {
      const n = fd === 'bibliotheque' ? id : yield* deplaceForge(P, obj(P, id), fd, env, {});
      if (n != null && t.RememberFound === 'True') retiensForge(env.ctx, n);
    }
    for (const id of reveles) {
      if (rd === 'bibliotheque') { retireDe(B, id); if (t.RevealedLibraryPosition === '-1') B.unshift(id); else B.push(id); }
      else yield* deplaceForge(P, obj(P, id), rd, env, {});
      if (t.RememberRevealed === 'True') retiensForge(env.ctx, id);
    }
    if (t.Shuffle === 'True') melangeHasard(P.rng, B);
  }
}, (t, op) => { op.op = 'cherche'; op.n = 1; op.hostile = false; op.desc = {types: []}; });

/* Remettre le dessus dans l'ordre qu'on veut : l'ordre présent en est un. */
forgeEffet('RearrangeTopOfLibrary', ['NumCards', 'MayShuffle'], function* () {}, (t, op) => { op.op = 'forge'; op.hostile = false; });

/* Lancer une carte depuis un effet (cascade, « cast it without paying
   its mana cost »), ou jouer un terrain si l'on a encore droit à un
   terrain ce tour. Le sort passe par `lanceSort()`, avec une variante
   que porte la carte le temps du lancement (`o.lanceEffet`). */
function* lanceDepuisEffet(P, j, o, gratuit) {
  if (!o || o.zone === 'champ' || o.zone === 'pile') return false;
  if (estType(o, 'land')) {
    if (P.joueurs[j].terrainsJoues >= terrainsParTour(P, j)) return false;
    return yield* joueTerrain(P, j, {id: o.id, depuis: o.zone});
  }
  o.lanceEffet = {gratuit};
  const ok = yield* lanceSort(P, j, {k: 'lancer', id: o.id, depuis: o.zone, variante: gratuit ? 'gratuit' : 'permis'});
  if (obj(P, o.id)) delete obj(P, o.id).lanceEffet;
  return ok;
}

forgeEffet('Play', ['Valid', 'ValidZone', 'ValidSA', 'Amount', 'Controller', 'WithoutManaCost', 'ForgetPlayed', 'RememberPlayed'], function* (P, t, env) {
  const j = t.Controller ? forgeDefinis(P, t.Controller, env).map(x => joueurDe(x))[0] : env.ctrl;
  if (j == null) return;
  let l = t.Valid ? [].concat(...String(t.ValidZone || 'Hand').split(',').map(z => objetsZone(P, ZONES_FORGE[z.trim()] || 'main')))
    .filter(o => forgeValideObjet(P, o, t.Valid, env.src, env.ctrl, env)) : objetsForge(P, t, env, 'Targeted');
  if (t.ValidSA && /^Spell\./.test(t.ValidSA)) l = l.filter(o => forgeValideDef(o.def, 'Card.' + t.ValidSA.slice(6), env.ctrl, j, o.id));
  const n = t.Amount === 'All' ? l.length : forgeNombre(P, t.Amount || 1, env);
  const ids = l.length > n ? yield* choisitCartes(P, j, l.map(o => o.id), n, 'Jouer', 'cartes', 0) : l.map(o => o.id);
  for (const id of ids) {
    const ok = yield* lanceDepuisEffet(P, j, obj(P, id), t.WithoutManaCost === 'True');
    if (ok && t.RememberPlayed === 'True') retiensForge(env.ctx, id);
  }
}, (t, op) => { op.op = 'forge'; op.hostile = false; }, {prepare: t => !t.CopyCard && !t.ReplaceGraveyard});

/* Découvrir N : exiler du dessus jusqu'à une carte non-terrain de valeur
   de mana N ou moins, la lancer gratuitement ou la prendre en main ; le
   reste dessous, au hasard. */
forgeEffet('Discover', ['Num'], function* (P, t, env) {
  const j = env.ctrl, B = P.joueurs[j].bibliotheque, n = forgeNombre(P, t.Num || 0, env), exiles = [];
  let trouvee = null;
  while (B.length && !trouvee) {
    const id = B[B.length - 1], o = obj(P, id);
    const e = deplace(P, id, 'exil');
    if (!estType(o, 'land') && mvDe(o) <= n) trouvee = e; else exiles.push(e);
  }
  if (trouvee != null) {
    const r = yield* choisitUn(P, j, ['Le lancer', 'En main'], `Découvrir : ${obj(P, trouvee).def.nom}`, 0, env.ctx.source);
    if (r !== 0 || !(yield* lanceDepuisEffet(P, j, obj(P, trouvee), true))) { if (obj(P, trouvee) && obj(P, trouvee).zone === 'exil') deplace(P, trouvee, 'main'); }
  }
  melangeHasard(P.rng, exiles).forEach(id => { if (obj(P, id) && obj(P, id).zone === 'exil') deplace(P, id, 'dessous'); });
}, (t, op) => { op.op = 'forge'; op.hostile = false; });
