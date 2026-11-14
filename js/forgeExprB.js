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
  if (tete === 'TriggeredCard' && q === 'CastTotalManaSpent') { const m = manaDepenseDe(objetEvt(P, ctx)) || {}; return Object.values(m).reduce((a, n) => a + n, 0); }
  if (tete === 'TriggeredSpellAbility') { const d = evt.def; return d && /^CardManaCost/.test(q) ? d.mv || 0 : 0; }
  if (tete === 'Count' && q === 'RememberedSize') return (ctx.memo || []).length + (ctx.memoJ || []).length;
  if (tete === 'Count') return compteDuTour(P, q, env);
  if (tete === 'PlayerCountOpponents' || tete === 'PlayerCountPlayers') return compteJoueurs(P, tete, q, env);
  if (tete === 'PlayerCountPropertyYou') { const h = histoire(P); return q === 'SacrificedThisTurn' ? h.sacrifies[env.ctrl] || 0 : q === 'CardsDiscardedThisTurn' ? h.defausses[env.ctrl] || 0 : undefined; }
  return undefined;
}

const COULEURS_FORGE_LETTRE = {White: 'W', Blue: 'U', Black: 'B', Red: 'R', Green: 'G'};

/* La dévotion : les symboles de ces couleurs dans les coûts des
   permanents qu'on contrôle, hybrides compris. */
function devotion(P, j, lettres) {
  return champDe(P, j).reduce((s, o) => {
    const c = o.def.cout || {};
    const purs = lettres.reduce((n, k) => n + ((c.couleurs || {})[k] || 0), 0);
    const hyb = (c.hybrides || []).filter(h => lettres.some(k => String(h).includes(k))).length;
    return s + purs + hyb;
  }, 0);
}

/* « a.b » : `a` si la condition tient, `b` sinon. */
function siAlors(P, q, vrai, env) { const [, a, b] = q.split('.'); return forgeNombre(P, vrai ? a : b, env); }

function compteDuTour(P, q, env) {
  const j = env.ctrl, J = P.joueurs[j], h = histoire(P), src = env.src;
  let k;
  if ((k = /^(Devotion|DevotionDual)\.(.+)$/.exec(q))) return devotion(P, j, k[2].split('.').map(c => COULEURS_FORGE_LETTRE[c]).filter(Boolean));
  if (q === 'Party') return ['cleric', 'rogue', 'warrior', 'wizard'].filter(t => champDe(P, j).some(o => estCreature(o) && (car(P, o).sousTypes.includes(t) || car(P, o).changelin))).length;
  if (q === 'Converge' || q === 'CastTotalManaSpent') {
    const m = manaDepenseDe(src) || {};
    return q === 'Converge' ? ['W', 'U', 'B', 'R', 'G'].filter(c => m[c] > 0).length : Object.values(m).reduce((s, n) => s + n, 0);
  }
  if ((k = /^Adamant_\d+\.(\w+)\.(.+)$/.exec(q))) { const m = manaDepenseDe(src) || {}; return siAlors(P, 'x.' + k[2], (m[COULEURS_FORGE_LETTRE[k[1]]] || 0) >= 3, env); }
  if (q === 'YouDrewThisTurn') return J.piochesTour || 0;
  if (q === 'LifeOppsLostThisTurn') return adversaires(P, j).reduce((s, i) => s + (h.perdu[i] || 0), 0);
  if (q === 'ResolvedThisTurn') return h.resolus[src ? src.id : -1] || 0;
  if (q === 'CountersAddedThisTurn') return h.marqueurs;
  if ((k = /^Delirium\.(.+)$/.exec(q))) return siAlors(P, q, new Set([].concat(...J.cimetiere.map(id => obj(P, id).def.types))).size >= 4, env);
  if ((k = /^Threshold\.(.+)$/.exec(q))) return siAlors(P, q, J.cimetiere.length >= 7, env);
  if ((k = /^Void\.(.+)$/.exec(q))) return siAlors(P, q, h.vide, env);
  if ((k = /^LeftGraveyardThisTurn (.+)$/.exec(q))) return h.quitteCimetiere.filter(o => o && forgeValideObjet(P, o, k[1], src, j, env, true)).length;
  if ((k = /^ValidBattlefield (.+)$/.exec(q))) return objetsZone(P, 'champ').filter(o => forgeValideObjet(P, o, k[1], src, j, env)).length;
  if ((k = /^MostProminentCreatureType (.+)$/.exec(q))) {
    const n = new Map();
    objetsZone(P, 'champ').filter(o => forgeValideObjet(P, o, k[1], src, j, env)).forEach(o => car(P, o).sousTypes.forEach(t => n.set(t, (n.get(t) || 0) + 1)));
    return Math.max(0, ...n.values());
  }
  return undefined;
}

/* Le plus grand (ou le plus petit) d'un compte, joueur par joueur :
   « the greatest number of lands an opponent controls ». */
function compteJoueurs(P, tete, q, env) {
  const qui = tete === 'PlayerCountOpponents' ? adversaires(P, env.ctrl) : vivants(P).map(J => J.i);
  let k;
  if (q === 'Amount') return qui.length;
  const max = f => Math.max(0, ...qui.map(f)), min = f => Math.min(...qui.map(f));
  if ((k = /^HighestValid(Graveyard)? (.+)$/.exec(q))) {
    return max(i => objetsZone(P, k[1] ? 'cimetiere' : 'champ').filter(o => forgeValideObjet(P, o, k[2], env.src, i, env)).length);
  }
  if ((k = /^HighestCounters\.(\w+)$/.exec(q))) return max(i => k[1] === 'Poison' ? P.joueurs[i].poison : 0);
  if (q === 'HighestCardsInGraveyard') return max(i => P.joueurs[i].cimetiere.length);
  if (q === 'HighestLifeTotal') return max(i => P.joueurs[i].vie);
  if (q === 'LowestLifeTotal') return min(i => P.joueurs[i].vie);
  if (q === 'HighestCardsInHand') return max(i => P.joueurs[i].main.length);
  return undefined;
}

forgeSait('expr', 'Count$Devotion', 'Count$DevotionDual', 'Count$Party', 'Count$Converge', 'Count$CastTotalManaSpent', 'Count$Adamant',
  'Count$YouDrewThisTurn', 'Count$LifeOppsLostThisTurn', 'Count$ResolvedThisTurn', 'Count$CountersAddedThisTurn', 'Count$Delirium',
  'Count$Threshold', 'Count$Void', 'Count$LeftGraveyardThisTurn', 'Count$ValidBattlefield', 'Count$MostProminentCreatureType',
  'PlayerCountOpponents$HighestValid', 'PlayerCountOpponents$HighestValidGraveyard', 'PlayerCountOpponents$HighestCounters',
  'PlayerCountOpponents$HighestCardsInGraveyard', 'PlayerCountPlayers$Amount', 'PlayerCountPlayers$LowestLifeTotal',
  'PlayerCountPlayers$HighestLifeTotal', 'PlayerCountOpponents$HighestLifeTotal', 'PlayerCountOpponents$HighestCardsInHand',
  'PlayerCountPropertyYou$SacrificedThisTurn', 'PlayerCountPropertyYou$CardsDiscardedThisTurn', 'TriggeredCard$CastTotalManaSpent',
  '$GreatestCardPower', '$GreatestCardToughness', '$GreatestCardManaCost', '$DifferentCardPower', '$DifferentCardToughness',
  '$DifferentCardManaCost', '$DifferentCardNames', '$Colors');

forgeSait('expr', 'Remembered$Valid', 'RememberedLKI$Valid', 'RememberedLKI$CardPower', 'RememberedLKI$CardToughness', 'RememberedLKI$CardManaCost',
  'Targeted$Valid', 'TriggeredCard$CardCounters', 'TriggeredCard$Valid', 'TriggerCount$LifeAmount', 'TriggerCount$CounterAmount',
  'TriggeredPlayer$CardsInHand', 'TargetedPlayer$CardsInHand', 'TriggeredPlayer$LifeTotal', 'TargetedPlayer$LifeTotal',
  'TriggeredPlayer$CardsInGraveyard', 'TargetedPlayer$CardsInGraveyard', 'TriggeredSpellAbility$CardManaCostLKI',
  'TriggeredSpellAbility$CardManaCost', 'Count$RememberedSize', 'SVar$Y', 'SVar$Z', 'SVar$A', 'SVar$B');
