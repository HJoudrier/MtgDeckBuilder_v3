/* =====================================================================
   js/oracleEffetsB.js — Les motifs d'effet : jetons, marqueurs, pompes,
   mana, recherches, et la lecture d'une proposition

   Suite de js/oracleEffetsA.js. En fin de fichier, `compileProposition()`
   et `compileEffet()` : les deux portes par lesquelles le reste du
   compilateur lit un effet.
   ===================================================================== */

/* Les jetons nommés, décrits dans le vocabulaire même du compilateur : ils
   se compilent comme n'importe quelle carte (js/definitions.js). */
const JETONS_NOMMES = {
  treasure: {nom: 'Treasure', type: 'Token Artifact — Treasure', texte: '{T}, Sacrifice ~: Add one mana of any color.'},
  food: {nom: 'Food', type: 'Token Artifact — Food', texte: '{2}, {T}, Sacrifice ~: You gain 3 life.'},
  clue: {nom: 'Clue', type: 'Token Artifact — Clue', texte: '{2}, Sacrifice ~: Draw a card.'}
};

/* Un nombre signé d'une pompe : « +2 », « -1 », « +x ». */
function lisSigne(s, c) {
  const m = /^([+-])(\w+)$/.exec(s);
  if (!m) return null;
  const n = lisQuantite(m[2], c);
  if (n == null) return null;
  if (typeof n === 'number') return m[1] === '-' ? -n : n;
  return m[1] === '-' ? {neg: n} : n;
}

/* ---------- Jetons ---------- */
motif('jetonsCreature', 'Jetons', /^(?:(.+?) )?creates? (\w+) (\d+|x)\/(\d+|x) ([a-z ]+?) ((?:legendary )?(?:artifact )?(?:enchantment )?creature) tokens?(?: with ([a-z ,]+))?( that are tapped and attacking| tapped)?$/,
  (m, c) => {
    const qui = m[1] ? lisReference(m[1], c) : {vous: 1}, n = lisQuantite(m[2], c);
    if (!qui || n == null || m[3] === 'x' || m[4] === 'x') return null;
    const mots = m[5].split(' ').filter(w => w !== 'and');
    const couleurs = mots.filter(w => COULEURS_ANGLAIS[w]).map(w => COULEURS_ANGLAIS[w]);
    const sous = mots.filter(w => !COULEURS_ANGLAIS[w] && w !== 'colorless');
    const kw = m[7] ? masqueMots(m[7]) : 0;
    if (kw == null) return null;
    const nom = sous.map(w => w[0].toUpperCase() + w.slice(1)).join(' ') || 'Jeton';
    const type = 'Token ' + m[6].replace(/\b\w/g, x => x.toUpperCase()) + ' — ' + nom;
    return {op: 'jetons', n, qui, engage: !!m[8], attaque: /attacking/.test(m[8] || ''),
      jeton: {nom, type, texte: m[7] ? m[7].replace(/ and /g, ', ') : '', force: +m[3], endurance: +m[4], couleurs}};
  }, 'create two 2/2 black zombie creature tokens.');
motif('jetonsDeux', 'Jetons', /^create (.+? tokens?(?: with [a-z ,]+?)?) and ((?:a|an|one|two|three) .+? tokens?(?: with [a-z ,]+)?)$/,
  (m, c) => {
    const a = compileProposition('create ' + m[1], c), b = compileProposition('create ' + m[2], c);
    return a && b ? {op: 'suite', ops: [a, b]} : null;
  }, 'create a 3/3 colorless wurm artifact creature token with deathtouch and a 3/3 colorless wurm artifact creature token with lifelink.');
motif('jetonsNommes', 'Jetons', /^(?:(.+?) )?creates? (\w+) (treasure|food|clue) tokens?$/,
  (m, c) => {
    const qui = m[1] ? lisReference(m[1], c) : {vous: 1}, n = lisQuantite(m[2], c);
    return qui && n != null ? {op: 'jetons', n, qui, jeton: JETONS_NOMMES[m[3]]} : null;
  }, 'create a treasure token.');

/* ---------- Marqueurs ---------- */
motif('marqueurs', 'Marqueurs', /^put (\w+) ([+-]1\/[+-]1) counters? on (.+)$/,
  (m, c) => {
    const n = lisQuantite(m[1], c), a = lisReference(m[3], c, {groupe: true});
    return n != null && a ? {op: 'marqueurs', n, genre: m[2], a} : null;
  }, 'put a +1/+1 counter on each creature you control.');
motif('prolifere', 'Marqueurs', /^proliferate$/, () => ({op: 'prolifere'}), 'proliferate.');

/* ---------- Pompes et mots-clés jusqu'à la fin du tour ---------- */
motif('pompe', 'Pompes', /^(.+?) gets? ([+-]\w+)\/([+-]\w+)(?: and gains? ([a-z ,]+?))? until end of turn$/,
  (m, c) => {
    const a = lisReference(m[1], c, {groupe: true}), f = lisSigne(m[2], c), e = lisSigne(m[3], c);
    const mots = m[4] ? masqueMots(m[4]) : 0;
    return a && f != null && e != null && mots != null ? {op: 'pompe', a, f, e, mots} : null;
  }, 'target creature gets +3/+3 until end of turn.');
motif('donneMots', 'Pompes', /^(.+?) gains? ([a-z ,]+?)(?: and gets? ([+-]\w+)\/([+-]\w+))? until end of turn$/,
  (m, c) => {
    const a = lisReference(m[1], c, {groupe: true}), mots = masqueMots(m[2]);
    const f = m[3] ? lisSigne(m[3], c) : 0, e = m[4] ? lisSigne(m[4], c) : 0;
    return a && mots && f != null && e != null ? {op: 'pompe', a, f, e, mots} : null;
  }, 'creatures you control gain trample until end of turn.');

/* ---------- Mana ---------- */
motif('mana', 'Mana', /^add ((?:\{[wubrgc]\})+)$/,
  m => ({op: 'mana', options: [m[1].replace(/[{}]/g, '').toUpperCase()]}), 'add {g}.');
motif('manaChoix', 'Mana', /^add (\{[wubrgc]\}(?:,? (?:or )?\{[wubrgc]\})+)$/,
  m => ({op: 'mana', options: m[1].match(/\{([wubrgc])\}/g).map(x => x[1].toUpperCase())}), 'add {r} or {g}.');
motif('manaQuelconque', 'Mana', /^add (\w+) mana of any (?:one )?color(?: in your commander's color identity)?$/,
  (m, c) => {
    const n = nombreOracle(m[1]);
    return typeof n === 'number' ? {op: 'mana', options: 'WUBRG'.split('').map(x => x.repeat(n))} : null;
  }, 'add one mana of any color.');
motif('manaCombinaison', 'Mana', /^add (\w+) mana in any combination of colors$/,
  m => { const n = nombreOracle(m[1]); return typeof n === 'number' ? {op: 'mana', options: 'WUBRG'.split('').map(x => x.repeat(n))} : null; },
  'add two mana in any combination of colors.');

/* ---------- Recherches et déplacements de cartes ---------- */
motif('cherche', 'Recherches', /^(?:(.+?) )?search(?:es)? (?:your|their) library for (?:up to (\w+) |(a|an|one|two|three) )(.+)$/,
  (m, c) => {
    const qui = m[1] ? lisReference(m[1], c) : {vous: 1};
    const n = nombreOracle(m[2] || m[3]), desc = lisDescripteur(m[4], {cartes: true});
    if (!qui || !desc || typeof n !== 'number' || desc.genre !== 'carte') return null;
    c.note({trouve: 1});
    return {op: 'cherche', n, desc, auPlus: !!m[2], qui};
  }, 'search your library for a basic land card.');
motif('placeTrouve', 'Recherches', /^put (it|that card|them|those cards|one|the other) (into your hand|onto the battlefield(?: tapped)?(?: under your control)?|into your graveyard|on top of your library|on the bottom of your library(?: in any order)?)$/,
  (m, c) => {
    const vers = /hand/.test(m[2]) ? 'main' : /battlefield/.test(m[2]) ? 'champ' : /graveyard/.test(m[2]) ? 'cimetiere' : /top/.test(m[2]) ? 'dessus' : 'dessous';
    const a = /^(one|the other)$/.test(m[1]) ? {trouve: m[1] === 'one' ? 'un' : 'autre'} : c.pronom();
    return {op: 'place', a, vers, engage: /tapped/.test(m[2])};
  }, 'put it onto the battlefield tapped.');
motif('placeUnAutre', 'Recherches', /^put one onto the battlefield tapped and the other into your hand$/,
  () => ({op: 'suite', ops: [{op: 'place', a: {trouve: 'un'}, vers: 'champ', engage: true},
    {op: 'place', a: {trouve: 'autre'}, vers: 'main'}]}), 'put one onto the battlefield tapped and the other into your hand.');
motif('placeDepuisMain', 'Recherches', /^put (a|an) (.+? card) from your hand onto the battlefield( tapped)?$/,
  (m) => {
    const desc = lisDescripteur(m[2], {cartes: true});
    if (!desc) return null;
    desc.zone = 'main'; desc.proprio = 'vous';
    return {op: 'place', a: {choix: desc, n: 1}, vers: 'champ', engage: !!m[3]};
  }, 'put a land card from your hand onto the battlefield.');

/* ---------- Engager, dégager ---------- */
motif('degageN', 'Engagement', /^untap up to (\w+) (lands?|creatures?|permanents?)$/,
  m => {
    const n = nombreOracle(m[1]), desc = lisDescripteur(m[2] + ' you control', {objets: true});
    return typeof n === 'number' && desc ? {op: 'degage', a: {choix: desc, n, engages: true}} : null;
  }, 'untap up to five lands.');
motif('engage', 'Engagement', /^(tap|untap) (.+)$/,
  (m, c) => { const a = lisReference(m[2], c, {groupe: true}); return a ? {op: m[1] === 'tap' ? 'engage' : 'degage', a} : null; },
  'tap target creature an opponent controls.');

/* Lire une proposition : « you may », « if you do », « for each » s'ôtent
   d'abord, puis chaque motif est essayé dans l'ordre. Un motif qui échoue
   rend au contexte les cibles qu'il y avait inscrites. */
function compileProposition(txt, c) {
  const t = String(txt).trim().replace(/\.$/, '');
  let m;
  if ((m = /^you may (.+)$/.exec(t))) {
    const op = compileProposition(m[1], c);
    return op ? {op: 'peut', ops: [op]} : null;
  }
  if ((m = /^(its controller|that player|target player|each opponent|each player) may (.+)$/.exec(t))) {
    const nb = c.cibles.length;
    const qui = lisReference(m[1], c);
    c.cibles.length = nb;
    const op = qui && compileProposition(m[1] + ' ' + m[2], c);
    return op ? {op: 'peut', qui, ops: [op]} : null;
  }
  if ((m = /^(.+) unless (that player|its controller|they|he or she) pays? (\{[^ ]+)$/.exec(t))) {
    const op = compileProposition(m[1], c), cout = coutMana(m[3]);
    const qui = m[2] === 'that player' && c.joueurEvt ? {evt: 'joueur'} : {controleurDe: c.pronom()};
    if (op && cout) { op.sauf = {qui, cout}; return op; }
    return null;
  }
  if ((m = /^if you do, (.+)$/.exec(t))) {
    const r = compileEffet(m[1], c);
    return r.ops.length && !r.rates.length ? {op: 'siFait', ops: r.ops} : null;
  }
  if ((m = /^(.+) for each (.+)$/.exec(t))) {
    const desc = lisDescripteur(m[2], {objets: true});
    const op = desc && compileProposition(m[1], c);
    if (op) { op.parChaque = desc; return op; }
  }
  for (const p of EFFETS_ORACLE) {
    const mm = p.re.exec(t);
    if (!mm) continue;
    const nb = c.cibles.length, dernier = c.dernier;
    const op = p.fait(mm, c);
    if (op) return op;
    c.cibles.length = nb; c.dernier = dernier;
  }
  return null;
}

/* Remplacer le X d'une capacité par ce que « where X is … » en dit. */
function remplaceX(ops, x) {
  const fixe = v => v === 'X' ? x : v;
  ops.forEach(op => {
    ['n', 'f', 'e'].forEach(k => { if (op[k] !== undefined) op[k] = fixe(op[k]); });
    if (op.ops) remplaceX(op.ops, x);
  });
}

/* Lire un effet entier : ses phrases, puis leurs propositions. Rend les
   opérations comprises et les propositions laissées de côté. */
function compileEffet(texte, c) {
  const ops = [], rates = [];
  for (const ph of phrasesOracle(texte)) {
    let p = ph, m, x = null;
    if ((m = /^(.+), where x is (.+)$/.exec(p))) {
      x = lisQuantite(m[2], c);
      if (x == null) { rates.push(ph); continue; }
      p = m[1];
    }
    const avant = ops.length;
    for (const pr of propositionsOracle(p)) {
      const op = compileProposition(pr, c);
      if (op) ops.push(op); else rates.push(pr);
    }
    if (x != null) remplaceX(ops.slice(avant), x);
  }
  return {ops, rates};
}
