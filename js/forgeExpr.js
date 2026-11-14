/* =====================================================================
   js/forgeExpr.js — Les quantités de Forge

   Une quantité de Forge est un nombre (`NumDmg$ 3`), ou le nom d'une SVar
   qui la calcule : `SVar:X:Count$Valid Creature.YouCtrl`, `Count$xPaid`,
   `TriggerCount$DamageAmount`, `Targeted$CardPower`… suivie, parfois,
   d'une opération (`/Twice`, `/Plus.1`, `/HalfDown`). On ne la calcule qu'à
   la résolution, contre l'état du moment, comme le reste du moteur.

   `env` porte ce que la résolution sait : la face du script (ses SVars),
   le contexte (`ctx` : cibles, X payé, évènement déclencheur, objets
   retenus), la source et son contrôleur.
   ===================================================================== */

/* Une quantité : un entier, `X`, ou une SVar. */
function forgeNombre(P, v, env) {
  let s = String(v == null ? '' : v).trim();
  if (!s) return 0;
  if (/^[+-]?\d+$/.test(s)) return +s;
  let signe = 1;
  if (s[0] === '-' || s[0] === '+') { if (s[0] === '-') signe = -1; s = s.slice(1); }
  const sv = env && env.face ? env.face.svars[s] : null;
  if (sv != null) return signe * forgeExpression(P, sv, env, 0);
  if (s === 'X') return signe * ((env && env.ctx && env.ctx.x) || 0);
  return signe * forgeExpression(P, s, env, 0);
}

const FORGE_MATHS = /\/(Plus|Minus|Times|Twice|HalfUp|HalfDown|Negative|LimitMax|LimitMin|Double)(?:\.(\d+))?$/;

/* Appliquer l'opération qui suit une expression. */
function mathForge(n, op, k) {
  switch (op) {
    case 'Plus': return n + k; case 'Minus': return n - k; case 'Times': return n * k;
    case 'Twice': case 'Double': return n * 2; case 'HalfUp': return Math.ceil(n / 2); case 'HalfDown': return Math.floor(n / 2);
    case 'Negative': return -n; case 'LimitMax': return Math.min(n, k); case 'LimitMin': return Math.max(n, k);
  }
  return n;
}

/* Les objets d'une zone, chez tous les joueurs. */
function objetsZone(P, zone) {
  if (zone === 'champ') return P.champ.map(id => obj(P, id)).filter(Boolean);
  if (zone === 'pile') return P.pile.filter(it => it.sort).map(it => obj(P, it.id)).filter(Boolean);
  const r = [];
  P.joueurs.forEach(J => (J[zone] || []).forEach(id => { const o = obj(P, id); if (o) r.push(o); }));
  return r;
}

/* Une caractéristique d'un objet, telle que Forge la nomme. */
function caracForge(P, o, quoi) {
  if (!o || o.j != null) return 0;
  const c = o.lki ? o : o.zone === 'champ' ? car(P, o) : o.def;
  if (quoi === 'CardPower') return c.force || 0;
  if (quoi === 'CardToughness') return c.endurance || 0;
  if (quoi === 'CardManaCost') return mvDe(o);
  return 0;
}

/* Le premier objet ciblé par la capacité en cours, ou par celle qu'elle
   suit. */
function cibleForge(P, env, parent) {
  const op = env.op || {};
  const i = parent ? op.slotParent : op.slot != null ? op.slot : op.slotParent;
  const c = i != null ? (env.ctx.cibles[i] || [])[0] : null;
  if (c == null) return null;
  return typeof c === 'object' ? c : passeOuPresent(P, c);
}

/* L'objet de l'évènement déclencheur. */
function objetEvt(P, ctx) {
  const e = ctx.evt || {};
  const id = e.id != null ? e.id : e.ancien;
  return (id != null ? obj(P, suit(P, id)) : null) || e.lki || null;
}

/* Le total d'une liste d'objets : leur nombre, ou la somme d'une
   caractéristique (`$CardPower`), ou le nombre de types de carte qu'ils
   réunissent (`$CardTypes`, Tarmogoyf). */
function agregeForge(P, l, agg) {
  if (!agg) return l.length;
  if (agg === 'CardTypes') return new Set([].concat(...l.map(o => o.def.types))).size;
  if (agg === 'CardPower' || agg === 'CardToughness' || agg === 'CardManaCost') return l.reduce((s, o) => s + caracForge(P, o, agg), 0);
  return 0;
}

/* Une expression de SVar. */
function forgeExpression(P, expr, env, prof) {
  let s = String(expr).trim();
  const m = FORGE_MATHS.exec(s);
  if (m) return mathForge(forgeExpression(P, s.slice(0, m.index), env, prof), m[1], m[2] ? +m[2] : 0);
  if (/^[+-]?\d+$/.test(s)) return +s;
  const i = s.indexOf('$');
  if (i < 0) return prof < 4 && env.face && env.face.svars[s] != null ? forgeExpression(P, env.face.svars[s], env, prof + 1) : 0;
  const tete = s.slice(0, i), q = s.slice(i + 1);
  const ctx = env.ctx || {}, src = env.src, ctrl = env.ctrl;
  if (tete === 'Number') return +q || 0;
  if (tete === 'SVar') return prof < 4 ? forgeExpression(P, env.face.svars[q] || '0', env, prof + 1) : 0;
  if (tete === 'TriggerCount') return q === 'DamageAmount' || q === 'Amount' ? (ctx.evt && ctx.evt.n) || 0 : 0;
  if (tete === 'TriggeredCard') return caracForge(P, objetEvt(P, ctx), q);
  if (tete === 'Targeted' || tete === 'ParentTargeted') return caracForge(P, cibleForge(P, env, tete === 'ParentTargeted'), q);
  if (tete === 'Remembered') return q === 'Amount' ? (ctx.memo || []).length : caracForge(P, passeOuPresent(P, (ctx.memo || [])[0]), q);
  if (tete === 'Sacrificed') return caracForge(P, (ctx.sacrifies || [])[0], q);
  if (tete === 'PlayerCountOpponents') return adversaires(P, ctrl).length;
  if (tete !== 'Count') return 0;
  let k;
  if (q === 'xPaid') return ctx.x || 0;
  if ((k = /^Valid(Graveyard|Hand|Exile|Library)? ([^$]+)(?:\$(\w+))?$/.exec(q))) {
    const zone = {Graveyard: 'cimetiere', Hand: 'main', Exile: 'exil', Library: 'bibliotheque'}[k[1]] || 'champ';
    const l = objetsZone(P, zone).filter(o => forgeValideObjet(P, o, k[2], src, ctrl, env));
    return agregeForge(P, l, k[3]);
  }
  if ((k = /^CardCounters\.(\w+)$/.exec(q))) return src && !src.j ? (src.marq || {})[genreMarqueur(k[1])] || 0 : 0;
  if (q === 'CardPower' || q === 'CardToughness' || q === 'CardManaCost') return caracForge(P, src, q);
  if (q === 'YourLifeTotal') return P.joueurs[ctrl].vie;
  if (q === 'YourCountersEnergy') return P.joueurs[ctrl].energie || 0;
  if (q === 'CardsInYourHand' || q === 'InYourHand') return P.joueurs[ctrl].main.length;
  if (q === 'InYourGraveyard') return P.joueurs[ctrl].cimetiere.length;
  return 0;
}

forgeSait('expr', 'Count$xPaid', 'Count$Valid', 'Count$ValidGraveyard', 'Count$ValidHand', 'Count$ValidExile',
  'Count$ValidLibrary', 'Count$CardCounters', 'Count$CardPower', 'Count$CardToughness', 'Count$CardManaCost',
  'Count$YourLifeTotal', 'Count$CardsInYourHand', 'Count$InYourHand', 'Count$InYourGraveyard', 'TriggerCount$DamageAmount',
  'TriggerCount$Amount', 'TriggeredCard$CardPower', 'TriggeredCard$CardToughness', 'TriggeredCard$CardManaCost',
  'Targeted$CardPower', 'Targeted$CardToughness', 'Targeted$CardManaCost', 'ParentTargeted$CardPower',
  'ParentTargeted$CardToughness', 'ParentTargeted$CardManaCost', 'Remembered$Amount', 'Remembered$CardPower',
  'Remembered$CardManaCost', 'Remembered$CardToughness', 'Sacrificed$CardPower', 'Sacrificed$CardToughness',
  'Sacrificed$CardManaCost', 'PlayerCountOpponents$Amount', 'SVar$X', 'Count$YourCountersEnergy', '$CardTypes', '$CardPower', '$CardToughness', '$CardManaCost');
