/* =====================================================================
   js/forgeDefiniC.js — Ce que `Defined$` désigne encore

   Lot F73 :
   - le défenseur d'une attaque qui doit être un adversaire
     (`TriggeredDefender.Opponent`, `TriggeredAttackedTarget` : Hellrider,
     Myr Battlesphere, Raid Bombardment) ;
   - ce qu'on vient de sacrifier (`Sacrificed`, `SacrificedCards`) ;
   - `Spawner>TriggeredTarget` : le déclencheur réflexe (« when you do… ») voit
     ce que son parent voyait, d'où ce préfixe qui n'en change pas le sens
     (Dokuchi Silencer, Biting-Palm Ninja) ;
   - des joueurs choisis par propriétés : `Player.EnchantedBy` (Fraying Sanity),
     `Opponent.IsCorrupted` (trois marqueurs de poison ou plus), `Player.lifeEQ13`,
     `Player.controlsCreature.powerGE4_GE1` ;
   - `ValidLibrary`, `ValidStack`, `ExiledWithSource`, `NextPlayerToYourRight`.
   ===================================================================== */

definisEtendus = (g => function (P, v, env) {
  const ctx = env.ctx || {}, evt = ctx.evt || {}, ctrl = env.ctrl;
  let m;
  if (/^Spawner>/.test(v)) return forgeDefinis(P, v.slice(8), env);
  switch (v) {
    case 'TriggeredDefender.Opponent': return forgeDefinis(P, 'TriggeredDefender', env).filter(x => x.j != null && x.j !== ctrl);
    case 'TriggeredAttackedTarget': return forgeDefinis(P, 'TriggeredDefender', env);
    case 'Sacrificed': case 'SacrificedCards': return (ctx.sacrifies || []).filter(Boolean);
    case 'ExiledWithSource': return ((env.src && P.cartes[env.src.cid] || {}).exilees || []).map(id => obj(P, id)).filter(o => o && o.zone === 'exil');
    case 'NextPlayerToYourRight': {
      const tous = vivants(P).map(J => J.i), i = tous.indexOf(ctrl);
      return tous.length > 1 && i >= 0 ? [{j: tous[(i - 1 + tous.length) % tous.length]}] : [];
    }
    case 'Self.YouOwn': { const o = env.src && !env.src.lki ? obj(P, suit(P, env.src.id)) : env.src; return o && o.prop === ctrl ? [o] : []; }
    case 'TargetedCard': return ciblesForge(P, env, false).filter(x => x.j == null);
  }
  if ((m = /^Valid(Library|Stack) (.+)$/.exec(v))) {
    const l = m[1] === 'Library' ? objetsZone(P, 'bibliotheque') : P.pile.map(it => obj(P, it.id)).filter(Boolean);
    return l.filter(o => forgeValideObjet(P, o, m[2], env.src, ctrl, env));
  }
  /* Un filtre de joueur : `Player.EnchantedBy`, `Opponent.IsCorrupted`, `Player.Opponent+IsCorrupted`. */
  if (/^(Player|Opponent)\./.test(v) && !/ /.test(v)) return vivants(P).filter(J => forgeValideJoueur(P, J.i, v, ctrl, env)).map(J => ({j: J.i}));
  /* Un filtre d'objet écrit seul : `Creature.YouCtrl`, `Creature`. */
  if (/^(Creature|Permanent|Land|Artifact|Enchantment|Planeswalker)(\..+)?$/.test(v)) return objetsZone(P, 'champ').filter(o => forgeValideObjet(P, o, v, env.src, ctrl, env));
  return g(P, v, env);
})(definisEtendus);

/* Les propriétés d'un joueur de plus (js/forgeValide.js `forgeValideJoueur()`). */
proprieteJoueurEtendue = (g => function (P, j, p, ctrl, env) {
  let m;
  if (p === 'EnchantedBy') return !!env && !!env.src && env.src.attJoueur === j;
  if (p === 'IsCorrupted') return (P.joueurs[j].poison || 0) >= 3;
  if ((m = /^life(GE|LE|GT|LT|EQ|NE)(\d+)$/.exec(p))) return compareForge(P.joueurs[j].vie, m[1], +m[2]);
  /* `controlsCreature.attacking`, `controlsCreature.powerGE4_GE1` (au moins un). */
  if ((m = /^controls(Creature|Artifact|Enchantment|Land|Planeswalker)(?:\.(\w+?))?(?:_(GE|LE|GT|LT|EQ|NE)(\d+))?$/.exec(p))) {
    const n = champDe(P, j).filter(o => estType(o, m[1].toLowerCase()) && (!m[2] || forgeValideObjet(P, o, 'Card.' + m[2], null, ctrl, env, true))).length;
    return compareForge(n, m[3] || 'GE', m[4] != null ? +m[4] : 1);
  }
  return g(P, j, p, ctrl, env);
})(proprieteJoueurEtendue);

forgeSait('defini', 'TriggeredDefender.Opponent', 'TriggeredAttackedTarget', 'Sacrificed', 'SacrificedCards', 'Spawner>TriggeredTarget', 'ExiledWithSource',
  'NextPlayerToYourRight', 'Self.YouOwn', 'TargetedCard', 'ValidExile', 'ValidLibrary', 'ValidStack', 'Player.EnchantedBy', 'Opponent.IsCorrupted',
  'Player.Opponent+IsCorrupted', 'Player.lifeEQ13', 'Player.controlsCreature.powerGE4_GE1', 'Player.Opponent+controlsCreature.attacking', 'Creature', 'Creature.YouCtrl');
forgeSait('filtre', 'EnchantedBy', 'IsCorrupted', 'lifeXX', 'controlsCreature.attacking');
