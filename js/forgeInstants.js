/* =====================================================================
   js/forgeInstants.js — Les instants : conditions, cibles, quantités

   Lot F101. Les petites pièces que réclament les instants d'EDHREC :
   - `ConditionPhases$ Main1,Main2` : une sous-capacité qui n'agit que dans
     certaines phases (« Addendum » d'Unbreakable Formation) ;
   - `TargetsWithControllerProperty$ cmcLECardsInGraveyard` : la valeur de
     mana de la cible ne dépasse pas le cimetière de son contrôleur (Drown
     in the Loch) ;
   - `Count$ValidStack` : les sorts sur la pile (Mindbreak Trap) ;
   - `PlayerCountOpponents$HighestCardsDrawn` : la plus longue pioche d'un
     adversaire (Even the Score) ;
   - `Count$LastStateBattlefieldWithFallback` : la plus grande force parmi
     les créatures qu'on avait *au moment de lancer* le sort (Lifestream's
     Blessing) — on la relève au lancement, parce qu'une réponse peut ôter
     la créature avant la résolution ;
   - `Count$SearchedLibrary` : les recherches de bibliothèque du tour
     (Archive Trap) ;
   - `SpellTargeted$CardManaCostLKI` : la valeur de mana du sort visé,
     lue sur son instantané une fois contrecarré (Reject Imperfection).
   ===================================================================== */

/* —— Les phases d'une sous-capacité ———————————————————————————————— */

FORGE_COMMUNS.add('ConditionPhases');
forgeSait('param', 'ConditionPhases');
conditionForge = (g => function (P, t, env) {
  if (t.ConditionPhases && !String(t.ConditionPhases).split(',').some(p => ETAPES_FORGE[p.trim()] === P.etape)) return false;
  return g(P, t, env);
})(conditionForge);

/* —— Une cible dont la valeur de mana tient dans le cimetière de son contrôleur ——— */

FORGE_COMMUNS.add('TargetsWithControllerProperty');
forgeSait('param', 'TargetsWithControllerProperty');
emplacementForge = (g => function (t, face) {
  const r = g(t, face);
  if (t.TargetsWithControllerProperty === 'cmcLECardsInGraveyard') r.cmcDansCimetiere = true;
  return r;
})(emplacementForge);
/* Un sort ou une créature : le cimetière qu'on compte est celui de son contrôleur (de son propriétaire hors du champ). */
ciblesLegales = (g => function (P, slot, src, ctrl, couleurs) {
  const l = g(P, slot, src, ctrl, couleurs);
  if (!slot.cmcDansCimetiere) return l;
  return l.filter(c => {
    const o = typeof c === 'number' ? obj(P, c) : null;
    return o && mvDe(o) <= P.joueurs[o.zone === 'champ' || o.zone === 'pile' ? o.ctrl : o.prop].cimetiere.length;
  });
})(ciblesLegales);

/* —— Les quantités —————————————————————————————————————————————————— */

/* Ce que le lanceur avait en jeu à l'instant où il lance le sort : les forces de ses créatures. */
function forcesAuLancement(P, j) {
  return champDe(P, j).filter(estCreature).map(o => car(P, o).force);
}

function recherchesAdversaires(P, j) {
  const h = histoire(P);
  return adversaires(P, j).reduce((s, i) => s + ((h.fouilles || {})[i] || 0), 0);
}
noteHistorique = (g => function (P, e) {
  g(P, e);
  if (e.t === 'cherche') { const h = histoire(P); h.fouilles = h.fouilles || {}; plusUn(h.fouilles, e.joueur); }
})(noteHistorique);

exprEtendue = (g => function (P, tete, q, env) {
  const src = env.src, ctx = env.ctx || {};
  let k;
  if (tete === 'Count') {
    /* `ValidStack Card` : les sorts (et capacités) sur la pile qui répondent au filtre. */
    if ((k = /^ValidStack (.+)$/.exec(q)))
      return P.pile.map(it => obj(P, it.id)).filter(o => o && o.zone === 'pile' && forgeValideObjet(P, o, k[1], src, env.ctrl, env)).length;
    if ((k = /^LastStateBattlefieldWithFallback (.+)\$GreatestCardPower$/.exec(q))) {
      const f = src && src.lanceeEn && src.lanceeEn.forces;
      return f ? Math.max(0, ...f) : Math.max(0, ...objetsZone(P, 'champ').filter(o => forgeValideObjet(P, o, k[1], src, env.ctrl, env)).map(o => car(P, o).force));
    }
    if (q === 'SearchedLibrary.Opponent') return recherchesAdversaires(P, env.ctrl);
  }
  if (tete === 'SpellTargeted' && q === 'CardManaCostLKI') {
    const c = cibleForge(P, env, false), lki = c && P.lkis.get(c.id);
    return c ? mvDe(lki || c) : 0;
  }
  return g(P, tete, q, env);
})(exprEtendue);
forgeSait('expr', 'Count$ValidStack', 'Count$LastStateBattlefieldWithFallback', 'Count$SearchedLibrary', 'SpellTargeted$CardManaCostLKI');

/* « The highest number of cards an opponent drew this turn » : le groupe est celui du `PlayerCount`. */
quantiteGroupe = (g => function (P, qui, q, env) {
  if (q !== 'HighestCardsDrawn') return g(P, qui, q, env);
  const J = groupeJoueurs(P, qui, env);
  return J == null ? undefined : Math.max(0, ...J.map(j => P.joueurs[j].piochesTour || 0));
})(quantiteGroupe);
forgeSait('expr', ...['Players', 'Opponents', 'RegisteredOpponents', ''].map(w => 'PlayerCount' + w + '$HighestCardsDrawn'));
