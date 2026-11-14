/* =====================================================================
   js/forgeExprB.js — Les expressions de Forge, suite : la mémoire, les
   cibles, l'évènement déclencheur

   `Remembered$Valid Creature`, `Targeted$Valid Card.Black`,
   `TriggeredCard$CardCounters.P1P1`, `TriggeredPlayer$CardsInHand`… La
   porte (js/forgeExpr.js `forgeExpression()`) les demande ici avant de
   rendre zéro : une tête et une question inconnues valent `undefined`.
   ===================================================================== */

/* Une caractéristique de plus que `caracForge()` : les marqueurs, et
   « répond-il au filtre » (1 ou 0). */
function caracEtendue(P, o, q, env) {
  let k;
  if (!o) return 0;
  if ((k = /^CardCounters\.(\w+)$/.exec(q))) return o.j != null ? 0 : (o.marq || {})[genreMarqueur(k[1])] || 0;
  if ((k = /^Valid (.+)$/.exec(q))) return o.j == null && forgeValideObjet(P, o, k[1], env.src, env.ctrl, env) ? 1 : 0;
  if (q === 'CardManaCostLKI') return mvDe(o);
  return caracForge(P, o, q);
}

/* La taille de main ou de cimetière, la vie d'un joueur désigné. */
function quantiteJoueur(P, j, q) {
  if (j == null) return 0;
  const J = P.joueurs[j];
  return q === 'CardsInHand' ? J.main.length : q === 'CardsInGraveyard' ? J.cimetiere.length : q === 'LifeTotal' ? J.vie : 0;
}

function exprEtendue(P, tete, q, env) {
  const ctx = env.ctx || {}, evt = ctx.evt || {};
  let k;
  if (tete === 'Remembered' || tete === 'RememberedLKI') {
    const l = (ctx.memo || []).map(id => passeOuPresent(P, id)).filter(Boolean);
    if ((k = /^Valid ([^$]+)(?:\$(\w+))?$/.exec(q))) return agregeForge(P, l.filter(o => forgeValideObjet(P, o, k[1], env.src, env.ctrl, env)), k[2]);
    if (tete === 'RememberedLKI') return caracForge(P, l[0], q);
    return undefined;
  }
  if (tete === 'Targeted' && (k = /^Valid ([^$]+)$/.exec(q))) {
    const l = [].concat(...(ctx.cibles || [])).map(c => typeof c === 'object' ? c : passeOuPresent(P, c)).filter(o => o && o.j == null);
    return l.filter(o => forgeValideObjet(P, o, k[1], env.src, env.ctrl, env)).length;
  }
  /* Les marqueurs d'une carte qui quitte le champ se lisent sur son
     instantané : arrivée ailleurs, elle n'en a plus. */
  if (tete === 'TriggeredCard' && (/^CardCounters\./.test(q) || /^Valid /.test(q))) {
    const o = (evt.de === 'champ' || evt.t === 'meurt') && evt.lki ? evt.lki : objetEvt(P, ctx);
    return caracEtendue(P, o, q, env);
  }
  if (tete === 'TriggerCount' && (q === 'LifeAmount' || q === 'CounterAmount')) return evt.n || 0;
  if (tete === 'TriggeredPlayer' || tete === 'TargetedPlayer') {
    const j = tete === 'TriggeredPlayer' ? evt.joueur : (forgeDefinis(P, 'TargetedPlayer', env)[0] || {}).j;
    return quantiteJoueur(P, j, q);
  }
  if (tete === 'TriggeredSpellAbility') { const d = evt.def; return d && /^CardManaCost/.test(q) ? d.mv || 0 : 0; }
  if (tete === 'Count' && q === 'RememberedSize') return (ctx.memo || []).length + (ctx.memoJ || []).length;
  return undefined;
}

forgeSait('expr', 'Remembered$Valid', 'RememberedLKI$Valid', 'RememberedLKI$CardPower', 'RememberedLKI$CardToughness', 'RememberedLKI$CardManaCost',
  'Targeted$Valid', 'TriggeredCard$CardCounters', 'TriggeredCard$Valid', 'TriggerCount$LifeAmount', 'TriggerCount$CounterAmount',
  'TriggeredPlayer$CardsInHand', 'TargetedPlayer$CardsInHand', 'TriggeredPlayer$LifeTotal', 'TargetedPlayer$LifeTotal',
  'TriggeredPlayer$CardsInGraveyard', 'TargetedPlayer$CardsInGraveyard', 'TriggeredSpellAbility$CardManaCostLKI',
  'TriggeredSpellAbility$CardManaCost', 'Count$RememberedSize', 'SVar$Y', 'SVar$Z', 'SVar$A', 'SVar$B');
