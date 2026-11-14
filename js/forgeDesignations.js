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
    /* L'évènement qu'un remplacement de dégâts ou de pioche a changé
       (js/forgeRemplacementsC.js, js/jeuPioche.js). */
    case 'ReplacedTarget': { const c = evt.remCible; return !c ? [] : c.j != null ? [{j: c.j}] : [obj(P, c.id) || c]; }
    case 'ReplacedSource': { const s = evt.remSource; return s ? [obj(P, s.id) || s] : []; }
    case 'ReplacedSourceController': { const s = evt.remSource; return s ? [{j: (obj(P, s.id) || s).ctrl}] : []; }
    case 'EnchantedPlayer': return env.src && env.src.attJoueur != null ? [{j: env.src.attJoueur}] : [];
    case 'Promised': return ctx.promis != null ? [{j: ctx.promis}] : [];
    case 'ReplacedPlayer': return evt.remJoueur != null ? [{j: evt.remJoueur}] : [];
    case 'ChosenCardController': return cartesChoisies(P, env).map(id => obj(P, id)).filter(Boolean).map(o => ({j: o.ctrl}));
    /* Le joueur ciblé, ou le contrôleur du planeswalker ciblé (Bonfire of the Damned). */
    case 'TargetedOrController': return forgeDefinis(P, 'Targeted', env).map(x => x.j != null ? x : {j: x.ctrl});
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

forgeSait('defini', 'Player.IsRemembered', 'TopOfLibrary', 'Imprinted', 'EffectSource', 'TriggeredAttackingPlayer', 'ChosenCardController', 'TargetedOrController');

/* Les cartes choisies : celles qu'un effet a gardées en naissant
   (js/forgeRemplacementsC.js), sinon celles de la source. */
function cartesChoisies(P, env) {
  const ef = env.ctx && env.ctx.effet;
  return (ef && ef.choisies) || (env.src && env.src.choisies) || choixDe(P, env.src).cartes || [];
}

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
    if (q === 'YourSpeed') return P.joueurs[j].vitesse || 0;
    if ((k = /^Bargained\./.exec(q))) return siAlors(P, q, (env.ctx || {}).variante === 'bargain' || !!(src && (src.marchande || src.varianteLance === 'bargain')), env);
    if ((k = /^PromisedGift\./.exec(q))) return siAlors(P, q, (env.ctx || {}).promis != null || !!(src && src.cadeauPromis), env);
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
  /* Le niveau d'une classe, gardé par js/forgePaliers.js. */
  if (p.startsWith('ClassLevelGE')) return (o.niveau || 1) >= +p.slice(12);
  /* Le cadeau promis, le marchandage (js/forgeMotsClesE.js). */
  if (p === 'PromisedGift') return !!o.cadeauPromis;
  if (p === 'Bargain') return !!o.marchande || o.varianteLance === 'bargain';
  switch (p) {
    case 'IsMonstrous': return !!o.monstrueux;
    case 'IsGoaded': return !!P && typeof goadActif === 'function' && goadActif(P, o);
    case 'withShadow': return !!(o.def.params && o.def.params.ombre);
    case 'withoutShadow': return !(o.def.params && o.def.params.ombre);
  }
  return undefined;
}

forgeSait('filtre', 'IsMonstrous', 'IsGoaded', 'withShadow', 'withoutShadow');
