/* =====================================================================
   js/forgeDefini.js — Ce que `Defined$` désigne

   Une capacité de Forge qui ne cible pas dit sur quoi elle porte par
   `Defined$` (et ses voisins `DefinedPlayer$`, `DefinedCards$`) : `Self`,
   `You`, `Targeted`, `TargetedController`, `Remembered`, `TriggeredCard`,
   `Enchanted`, `Player.Opponent`… Ce fichier le résout, à la résolution,
   en objets et en joueurs (`{j}`), comme `resous()` le fait pour les
   références du compilateur d'oracle.
   ===================================================================== */

const FORGE_DEFINIS = ['Self', 'You', 'Targeted', 'TargetedPlayer', 'TargetedController', 'TargetedOwner',
  'ParentTarget', 'Remembered', 'RememberedController', 'RememberedOwner', 'TriggeredCard', 'TriggeredCardLKICopy',
  'TriggeredNewCardLKICopy', 'TriggeredCardController', 'TriggeredCardOwner', 'TriggeredPlayer', 'TriggeredTarget',
  'TriggeredAttacker', 'TriggeredDefendingPlayer', 'TriggeredSource', 'TriggeredSourceController', 'Enchanted',
  'Equipped', 'EnchantedController', 'EquippedController', 'Player', 'Opponent', 'Player.Opponent', 'Player.Other',
  'ActivePlayer', 'Valid', 'ValidGraveyard', 'ValidHand', 'TriggeredActivator', 'OppNonTargeted', 'ExiledWith',
  'DelayTriggerRemembered', 'DelayTriggerRememberedLKI', 'TriggeredAttackerLKICopy', 'TriggeredBlocker',
  /* L'objet qu'un remplacement détourne : lu par js/forgeRemplacements.js. */
  'ReplacedCard', 'TriggeredTargetLKICopy', 'ChosenCard', 'ChosenPlayer'];

/* Les cibles prises par l'emplacement de la capacité en cours, ou de celle
   qu'elle suit. */
function ciblesForge(P, env, parent) {
  const op = env.op || {};
  const i = parent ? op.slotParent : op.slot != null ? op.slot : op.slotParent;
  if (i == null) return [];
  return (env.ctx.cibles[i] || []).map(c => typeof c === 'object' ? c : obj(P, suit(P, c)) || P.lkis.get(c)).filter(Boolean);
}

/* Le contrôleur d'un objet, ou le joueur lui-même. */
function joueurDe(x, proprio) { return x.j != null ? x.j : proprio ? x.prop : x.ctrl; }

function uniquesJ(liste) {
  const vus = new Set();
  return liste.filter(j => j != null && !vus.has(j) && vus.add(j)).map(j => ({j}));
}

/* Résoudre une valeur de `Defined$`. Plusieurs se joignent par ` & `. */
function forgeDefinis(P, val, env) {
  const v = String(val || '').trim();
  if (!v) return [];
  if (v.includes(' & ')) return [].concat(...v.split(' & ').map(x => forgeDefinis(P, x, env)));
  const ctx = env.ctx, ctrl = env.ctrl, src = env.src;
  const evt = ctx.evt || {};
  let m;
  if ((m = /^Valid(Graveyard|Hand|Exile)? (.+)$/.exec(v))) {
    const zone = {Graveyard: 'cimetiere', Hand: 'main', Exile: 'exil'}[m[1]] || 'champ';
    return objetsZone(P, zone).filter(o => forgeValideObjet(P, o, m[2], src, ctrl, env));
  }
  switch (v) {
    case 'Self': { const o = src && !src.lki ? obj(P, suit(P, src.id)) : src; return o ? [o] : []; }
    case 'You': return [{j: ctrl}];
    case 'Targeted': return ciblesForge(P, env, false);
    case 'ParentTarget': return ciblesForge(P, env, true);
    case 'TargetedPlayer': return ciblesForge(P, env, false).filter(x => x.j != null);
    case 'TargetedController': return uniquesJ(ciblesForge(P, env, false).map(x => joueurDe(x)));
    case 'TargetedOwner': return uniquesJ(ciblesForge(P, env, false).map(x => joueurDe(x, true)));
    /* Ce qu'un déclencheur retardé a retenu en naissant : sa mémoire est
       celle du contexte (js/jeuDurees.js). */
    case 'DelayTriggerRemembered': case 'DelayTriggerRememberedLKI':
    case 'Remembered': return [...(ctx.memo || []).map(id => obj(P, suit(P, id)) || P.lkis.get(id)).filter(Boolean),
      ...(ctx.memoJ || []).map(j => ({j}))];
    case 'RememberedController': return uniquesJ((ctx.memo || []).map(id => passeOuPresent(P, id)).filter(Boolean).map(o => o.ctrl));
    case 'RememberedOwner': return uniquesJ((ctx.memo || []).map(id => passeOuPresent(P, id)).filter(Boolean).map(o => o.prop));
    case 'TriggeredCard': case 'TriggeredCardLKICopy': case 'TriggeredNewCardLKICopy': case 'TriggeredAttacker':
    case 'TriggeredAttackerLKICopy': case 'TriggeredBlocker':
    case 'TriggeredSource': {
      const o = v === 'TriggeredSource' ? (evt.source != null ? obj(P, suit(P, evt.source)) : null) : objetEvt(P, ctx);
      return o ? [o] : [];
    }
    case 'TriggeredCardController': case 'TriggeredSourceController': {
      const o = v === 'TriggeredSourceController' ? (evt.source != null ? passeOuPresent(P, evt.source) : null) : objetEvt(P, ctx);
      return o ? [{j: o.ctrl}] : evt.ctrl != null ? [{j: evt.ctrl}] : [];
    }
    case 'TriggeredCardOwner': { const o = objetEvt(P, ctx); return o ? [{j: o.prop}] : []; }
    case 'TriggeredPlayer': case 'TriggeredTarget': case 'TriggeredActivator': case 'TriggeredTargetLKICopy': return evt.joueur != null ? [{j: evt.joueur}] : [];
    case 'TriggeredDefendingPlayer': return evt.defenseur != null ? [{j: evt.defenseur}] : [];
    case 'Enchanted': case 'Equipped': { const a = src && src.att != null ? obj(P, src.att) : null; return a ? [a] : []; }
    case 'EnchantedController': case 'EquippedController': { const a = src && src.att != null ? obj(P, src.att) : null; return a ? [{j: a.ctrl}] : []; }
    case 'Player': return vivants(P).map(J => ({j: J.i}));
    case 'Opponent': case 'Player.Opponent': case 'Player.Other': return adversaires(P, ctrl).map(j => ({j}));
    case 'OppNonTargeted': { const t = ciblesForge(P, env, false).map(x => joueurDe(x)); return adversaires(P, ctrl).filter(j => !t.includes(j)).map(j => ({j})); }
    case 'ActivePlayer': return [{j: P.actif}];
    case 'ChosenCard': return (choixDe(P, src).cartes || []).map(id => obj(P, id)).filter(Boolean);
    case 'ChosenPlayer': { const j = choixDe(P, src).joueur; return j != null ? [{j}] : []; }
    case 'ExiledWith': {
      const k = src && P.cartes[src.cid];
      return ((k && k.exilees) || []).map(id => obj(P, id)).filter(o => o && o.zone === 'exil');
    }
  }
  return [];
}

/* Les joueurs d'une capacité : ceux qu'elle cible, sinon ceux que
   `Defined$` nomme, sinon son contrôleur. */
function joueursForge(P, t, env, cle = 'Defined') {
  let l;
  if (env.op && env.op.slot != null) l = ciblesForge(P, env, false);
  else if (t[cle]) l = forgeDefinis(P, t[cle], env);
  else return [env.ctrl];
  return [...new Set(l.map(x => joueurDe(x)))].filter(j => j != null && P.joueurs[j] && !P.joueurs[j].elimine);
}

/* Les objets d'une capacité : ceux qu'elle cible, sinon ceux que
   `Defined$` nomme, sinon sa source. */
function objetsForge(P, t, env, defaut = 'Self') {
  let l;
  if (env.op && env.op.slot != null) l = ciblesForge(P, env, false);
  else l = forgeDefinis(P, t.Defined || defaut, env);
  return l.filter(x => x && x.j == null);
}

forgeSait('defini', ...FORGE_DEFINIS);
