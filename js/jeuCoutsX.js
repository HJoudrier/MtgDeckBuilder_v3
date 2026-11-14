/* =====================================================================
   js/jeuCoutsX.js — Les coûts dont la quantité est X, et ceux qui
   touchent la carte elle-même

   « Remove X +1/+1 counters », « pay X life », « sacrifice X Spirits » :
   le coût lu par js/forgeCout.js garde `'X'` à la place du nombre (ou
   `'All'` : « remove all counters »). Avant de juger ou de payer, on le
   résout (`coutResolu()`) : X est celui du sort, ou celui qu'on choisit en
   activant, jamais plus que ce qu'on peut payer (`maxXAutre()`).

   Et les morceaux de plus : renvoyer la carte en main, poser un marqueur
   sur elle, exiler un permanent qu'on contrôle, remettre une carte de sa
   main sur sa bibliothèque ; la garde qu'on paie autrement qu'en mana
   (« Ward—Discard a card »).
   ===================================================================== */

/* Les champs d'un coût qui peuvent valoir X : direct, ou `.n`. */
const CHAMPS_X = [['vie'], ['energie'], ['pioche'], ['fletrit'], ['indices'], ['meule'], ['exileDessus'], ['retire', 'n'], ['sac', 'n'],
  ['defausse', 'n'], ['exileCimetiere', 'n'], ['engageAutres', 'n'], ['retireAny', 'n'], ['exileTousCim', 'n'], ['renvoie', 'n']];

const valeurX = (c, a, b) => (b ? c[a] && c[a][b] : c[a]);

/* Le coût porte-t-il une quantité à résoudre (X, ou « tous ») ? */
function aCoutX(c) { return !!c && CHAMPS_X.some(([a, b]) => valeurX(c, a, b) === 'X' || valeurX(c, a, b) === 'All'); }

/* Le coût, X remplacé par `x`, « tous » par ce que porte la carte. */
function coutResolu(c, x, o) {
  if (!aCoutX(c)) return c;
  const r = {...c};
  for (const [a, b] of CHAMPS_X) {
    const v = valeurX(r, a, b);
    if (v !== 'X' && v !== 'All') continue;
    const n = v === 'X' ? x : (o && o.marq && r[a].genre ? o.marq[r[a].genre] || 0 : 0);
    if (b) r[a] = {...r[a], [b]: n}; else r[a] = n;
  }
  return r;
}

/* Le plus grand X qu'on peut payer de ce coût non-mana ; payer sa vie
   s'arrête avant de la perdre. */
function maxXAutre(P, j, o, c) {
  let x = 0;
  while (x < 30 && coutAutrePossible(P, j, o, coutResolu(c, x + 1, o))) x++;
  if (c.vie === 'X') x = Math.min(x, P.joueurs[j].vie - 1);
  return Math.max(0, x);
}

/* Choisir X pour une capacité ou un sort dont le coût non-mana en porte
   un ; l'IA prend le plus grand, sauf pour sa vie, qu'elle ménage. */
function* choisitXAutre(P, j, o, c, max, source) {
  const opts = Array.from({length: max + 1}, (_, i) => i);
  const defaut = c.vie === 'X' ? Math.floor(max / 2) : max;
  return opts[(yield question(P, j, 'x', opts, {defaut, source}))] || 0;
}

/* —— Les morceaux de plus ——————————————————————————————————————————— */

CHAMPS_COUTS_B.push('renvoieSoi', 'ajoute', 'exileChamp', 'mainVersBib');

function coutAutrePossibleX(P, j, o, c) {
  const J = P.joueurs[j];
  if (c.renvoieSoi && o.zone !== 'champ') return false;
  if (c.ajoute && o.zone !== 'champ') return false;
  if (c.exileChamp && champDe(P, j).filter(x => correspond(P, x, c.exileChamp.desc, o, j)).length < c.exileChamp.n) return false;
  if (c.mainVersBib && J.main.filter(id => id !== o.id && correspond(P, obj(P, id), c.mainVersBib.desc, o, j)).length < c.mainVersBib.n) return false;
  return true;
}

function* paieAutreX(P, j, o, c) {
  const J = P.joueurs[j];
  if (c.ajoute) poseMarqueurs(P, o, c.ajoute.genre, c.ajoute.n, o);
  if (c.exileChamp) {
    const ids = champDe(P, j).filter(x => correspond(P, x, c.exileChamp.desc, o, j)).map(x => x.id);
    (yield* choisitCartes(P, j, ids, c.exileChamp.n, 'Exiler', 'sacrifice')).forEach(id => deplace(P, id, 'exil'));
  }
  if (c.mainVersBib) {
    const ids = J.main.filter(id => id !== o.id && correspond(P, obj(P, id), c.mainVersBib.desc, o, j));
    (yield* choisitCartes(P, j, ids, c.mainVersBib.n, 'Mettre dessus', 'defausse')).forEach(id => deplace(P, id, 'dessus'));
  }
}

/* —— La garde payée autrement ——————————————————————————————————————— */

/* La part non-mana de la garde des permanents adverses ciblés
   (« Ward—Discard a card », « Ward—Pay 3 life »), réunie, ou `null`. Comme
   la garde en mana (js/jeuLancer.js `coutDeGarde()`), elle s'ajoute au
   coût du sort — simplification annoncée. */
function gardeAutre(P, j, effets) {
  let r = null;
  effets.forEach(ef => ef.cibles.forEach(cs => cs.forEach(c => {
    const o = typeof c === 'number' ? obj(P, c) : null;
    const g = o && o.zone === 'champ' && o.ctrl !== j && (car(P, o).mots & MOT.GARDE) && o.def.params.gardeAutre;
    if (!g) return;
    r = r ? {...r, vie: (r.vie || 0) + (g.vie || 0), ...(g.defausse ? {defausse: {n: ((r.defausse || {}).n || 0) + g.defausse.n}} : {}),
      ...(g.sac ? {sac: g.sac} : {})} : {...g};
  })));
  return r;
}

/* —— Les coûts qu'un effet demande ———————————————————————————————— */

/* Le coût d'un « unless … pays » : `Y` (une SVar), `X` (la SVar, sinon
   le X du sort) valent un mana générique calculé ; X dans un morceau
   (« pay X life ») se résout de même. */
function coutUnless(P, v, env) {
  const s = String(v || '').trim();
  if (/^[A-Z]$/.test(s) && (s === 'X' || (env.face && env.face.svars[s] != null))) {
    const n = Math.max(0, forgeNombre(P, s, env));
    return {cout: {mana: {...coutManaVide(), sym: n ? ['{' + n + '}'] : [], generique: n, total: n}}};
  }
  const c = coutForge(s);
  return c && aCoutX(c.cout) ? {...c, cout: coutResolu(c.cout, forgeNombre(P, 'X', env), env.src)} : c;
}

/* L'entretien cumulatif payé en vie ou en sacrifices, autant de fois
   qu'il y a de marqueurs d'âge (js/jeuVariantes.js `OPS.cumul`). */
function* cumulAutre(P, ctx, s) {
  const a = s.def.cumulAutre, k = s.marq.age;
  const c = {...(a.vie ? {vie: a.vie * k} : {}), ...(a.sac ? {sac: {...a.sac, n: a.sac.n * k}} : {})};
  if (coutAutrePossible(P, ctx.ctrl, s, c) && !(c.vie && P.joueurs[ctx.ctrl].vie <= c.vie)) {
    const r = yield question(P, ctx.ctrl, 'oui', ['non', 'oui'], {texte: `Payer l'entretien de ${s.def.nom} (${k}) ?`, source: s.id,
      extra: {saufForge: {contre: false}}});
    if (r === 1) { yield* paieAutre(P, ctx.ctrl, s, c); return; }
  }
  sacrifie(P, s.id);
}
