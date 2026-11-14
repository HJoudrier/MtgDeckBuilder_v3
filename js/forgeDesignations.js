/* =====================================================================
   js/forgeDesignations.js — Ce que Forge désigne encore : des joueurs
   retenus, le dessus de la bibliothèque, l'objet imprimé ; des comptes
   (le monarque, le premier joueur, les marqueurs d'un joueur) ; des
   propriétés (monstrueux, incité, ombre)

   La suite de js/forgeDefini.js et js/forgeExprB.js : chacun la consulte
   en dernier, quand il ne connaît pas ce qu'on lui demande.
   ===================================================================== */

/* Les désignations de plus. Rend `[]` si la valeur est inconnue. */
function definisEtendus(P, v, env) {
  const ctx = env.ctx || {}, evt = ctx.evt || {}, ctrl = env.ctrl;
  switch (v) {
    /* L'objet qu'un remplacement d'entrée touche (js/forgeEntrees.js). */
    case 'ReplacedCard': { const o = objetEvt(P, ctx); return o ? [o] : []; }
    case 'Player.IsRemembered': return (ctx.memoJ || []).filter(j => P.joueurs[j] && !P.joueurs[j].elimine).map(j => ({j}));
    /* La carte du dessus de sa bibliothèque. */
    case 'TopOfLibrary': { const B = P.joueurs[ctrl].bibliotheque; return B.length ? [obj(P, B[B.length - 1])] : []; }
    /* Imprint range ce qu'il exile avec la mémoire de la carte
       (js/forgeEffetsA.js `retiensForge()`). */
    case 'Imprinted': return forgeDefinis(P, 'Remembered', env).filter(x => x.j == null);
    /* La source d'un effet : la carte qui l'a créé, que l'effet porte
       comme sa source. */
    case 'EffectSource': return forgeDefinis(P, 'Self', env);
    case 'TriggeredAttackingPlayer': {
      const o = evt.t === 'attaque' && evt.id != null ? obj(P, evt.id) : null;
      return o ? [{j: o.ctrl}] : evt.joueur != null ? [{j: evt.joueur}] : [];
    }
  }
  return [];
}

forgeSait('defini', 'Player.IsRemembered', 'TopOfLibrary', 'Imprinted', 'EffectSource', 'TriggeredAttackingPlayer');

/* Les marqueurs d'un joueur autres que l'énergie et le poison :
   expérience, rad, ticket… (js/forgeEffetsB.js, `PutCounter`). */
function marqueursJoueur(J, g) { return g === 'energy' ? J.energie || 0 : g === 'poison' ? J.poison : (J.marqueurs || {})[g] || 0; }

/* Les comptes de plus, après ceux de js/forgeExprB.js. */
function exprDesignations(P, tete, q, env) {
  const j = env.ctrl, src = env.src, evt = (env.ctx || {}).evt || {};
  let k;
  if (tete === 'Count') {
    if ((k = /^Monarch\./.exec(q))) return siAlors(P, q, P.monarque === j, env);
    if ((k = /^StartingPlayer\./.exec(q))) return siAlors(P, q, P.premier === j, env);
    if ((k = /^wasCastFromGraveyard\./.exec(q))) return siAlors(P, q, !!(src && src.lance && src.lance.depuis === 'cimetiere'), env);
    if ((k = /^YourCounters(\w+)$/.exec(q))) return marqueursJoueur(P.joueurs[j], k[1].toLowerCase());
    /* « If you revealed a Dragon card or controlled a Dragon as you cast
       this spell » : le coût facultatif payé, ou un Dragon en jeu — jugé à
       la résolution, simplification annoncée. */
    if ((k = /^Presence_(\w+)\./.exec(q))) {
      const st = k[1].toLowerCase();
      return siAlors(P, q.replace(/^Presence_\w+/, 'x'), !!((env.ctx || {}).optionnel || (src && src.optionnel)) ||
        champDe(P, j).some(o => car(P, o).sousTypes.includes(st) || !!car(P, o).changelin), env);
    }
    /* Les sorts de commandant lancés depuis la zone de commandement : la
       taxe en compte un par lancer. */
    if (q === 'TotalCommanderCastFromCommandZone') return Object.values(P.joueurs[j].taxe || {}).reduce((s, n) => s + n, 0);
  }
  if (tete === 'PlayerCountPropertyYou') {
    const def = d => d && (d.j != null ? d.j : d.pw != null && obj(P, d.pw) ? obj(P, d.pw).ctrl : null);
    if (q === 'HasPropertyBeenAttackedThisCombat') return P.combat && [...P.combat.attaquants.values()].some(d => def(d) === j) ? 1 : 0;
    if (q === 'OpponentsAttackedThisTurn') return new Set(((histoire(P).attaques || {})[j] || [])).size;
  }
  if (tete === 'TriggeredTarget' && q === 'LifeTotal') return evt.joueur != null ? P.joueurs[evt.joueur].vie : 0;
  /* Les marqueurs que le coût a retirés (js/jeuActions.js `activeCapacite()`). */
  if (tete === 'SVar' && q === 'CostCountersRemoved') return (env.ctx || {}).retires || 0;
  return undefined;
}

forgeSait('expr', 'SVar$CostCountersRemoved', 'Count$Presence', 'Count$Blessing', 'Count$Monarch', 'Count$StartingPlayer', 'Count$wasCastFromGraveyard', 'Count$YourCountersExperience',
  'Count$YourCountersEnergy', 'Count$YourCountersRad', 'Count$YourCountersTicket', 'Count$TotalCommanderCastFromCommandZone',
  'PlayerCountPropertyYou$HasPropertyBeenAttackedThisCombat', 'PlayerCountPropertyYou$OpponentsAttackedThisTurn',
  'TriggeredTarget$LifeTotal', 'TargetedPlayer$CardsInLibrary', 'TriggeredPlayer$CardsInLibrary');

/* Les propriétés de plus des filtres (js/forgeValide.js). */
function proprieteDesignee(P, o, p) {
  switch (p) {
    case 'IsMonstrous': return !!o.monstrueux;
    case 'IsGoaded': return !!P && typeof goadActif === 'function' && goadActif(P, o);
    case 'withShadow': return !!(o.def.params && o.def.params.ombre);
    case 'withoutShadow': return !(o.def.params && o.def.params.ombre);
  }
  return undefined;
}

forgeSait('filtre', 'IsMonstrous', 'IsGoaded', 'withShadow', 'withoutShadow');
