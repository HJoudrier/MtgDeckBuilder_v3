/* =====================================================================
   js/oracleEffetsA.js — Les motifs d'effet : dégâts, vie, cartes, retraits

   Chaque motif est ancré sur une proposition **entière** et rend une
   opération, ou `null` si une sous-lecture échoue : une proposition est
   comprise ou déclarée incomprise, jamais à moitié en silence. Chaque motif
   porte un exemple, qui sert de test et de liste des formules admises dans
   la fenêtre des comportements (js/fenComportement.js).

   La suite des motifs est dans js/oracleEffetsB.js ; tous poussent dans
   `EFFETS_ORACLE`, que `compileProposition()` parcourt dans l'ordre.
   ===================================================================== */

const EFFETS_ORACLE = [];

/* Une quantité : un nombre, X, « that much », « the number of … »,
   « its power ». */
function lisQuantite(txt, c) {
  const t = String(txt || '').trim();
  const n = nombreOracle(t);
  if (n != null) return n;
  if (t === 'that much') return {evt: 'n'};
  let m;
  if ((m = /^(?:equal to )?(its|~'s|that creature's|the sacrificed creature's) power$/.exec(t)))
    return {forceDe: m[1] === "~'s" ? {soi: 1} : c.pronom()};
  if ((m = /^(?:equal to )?(its|that card's|that creature's) mana value$/.exec(t))) return {mvDe: c.pronom()};
  if ((m = /^(?:equal to )?the number of (.+)$/.exec(t))) {
    const desc = lisDescripteur(m[1].replace(/ in your hand$/, ' card in your hand'), {objets: true});
    return desc ? {compte: desc} : null;
  }
  return null;
}

/* La source qui inflige des dégâts : la carte, ce qu'elle désigne, ou la
   créature qu'elle équipe. */
function lisSource(txt, c) {
  if (txt === '~') return {soi: 1};
  if (txt === 'it' || txt === 'that creature') return c.pronom();
  if (/^(?:enchanted|equipped) creature$/.test(txt)) return {attache: 1};
  return null;
}

function motif(id, famille, re, fait, ex) { EFFETS_ORACLE.push({id, famille, re, fait, ex}); }

/* ---------- Dégâts ---------- */
motif('degats', 'Dégâts', /^(~|it|that creature|enchanted creature|equipped creature) deals? (\w+) damage to (.+)$/,
  (m, c) => {
    const source = lisSource(m[1], c), n = lisQuantite(m[2], c);
    if (!source || n == null) return null;
    const cibles = m[3].split(/ and (?=each |target |you$)/);
    const refs = cibles.map(x => lisReference(x, c, {groupe: true}));
    if (refs.some(r => !r)) return null;
    return refs.length === 1 ? {op: 'degats', n, a: refs[0], source}
      : {op: 'suite', ops: refs.map(a => ({op: 'degats', n, a, source}))};
  }, '~ deals 3 damage to any target.');
motif('degatsEgal', 'Dégâts', /^(~|it|that creature) deals damage equal to (.+?) to (.+)$/,
  (m, c) => {
    const source = lisSource(m[1], c), n = lisQuantite(m[2], c), a = lisReference(m[3], c, {groupe: true});
    return source && n != null && a ? {op: 'degats', n, a, source} : null;
  }, '~ deals damage equal to its power to target creature.');
motif('combat', 'Dégâts', /^(.+?) fights? (.+)$/,
  (m, c) => {
    const a = lisReference(m[1], c), b = lisReference(m[2], c);
    return a && b ? {op: 'combat', a, b} : null;
  }, 'target creature you control fights target creature you don\'t control.');

/* ---------- Vie ---------- */
motif('gagneVie', 'Vie', /^(?:(.+?) )?gains? (\w+) life$/,
  (m, c) => {
    const qui = m[1] ? lisReference(m[1], c) : {vous: 1}, n = lisQuantite(m[2], c);
    return qui && n != null ? {op: 'gagneVie', n, qui} : null;
  }, 'you gain 3 life.');
motif('gagneVieEgal', 'Vie', /^(?:(.+?) )?gains? life equal to (.+)$/,
  (m, c) => {
    const qui = m[1] ? lisReference(m[1], c) : {vous: 1}, n = lisQuantite(m[2], c);
    return qui && n != null ? {op: 'gagneVie', n, qui} : null;
  }, 'its controller gains life equal to its power.');
motif('perdVie', 'Vie', /^(?:(.+?) )?loses? (\w+) life$/,
  (m, c) => {
    const qui = m[1] ? lisReference(m[1], c) : {vous: 1}, n = lisQuantite(m[2], c);
    return qui && n != null ? {op: 'perdVie', n, qui} : null;
  }, 'each opponent loses 1 life.');
motif('perdVieEgal', 'Vie', /^(?:(.+?) )?loses? life equal to (.+)$/,
  (m, c) => {
    const qui = m[1] ? lisReference(m[1], c) : {vous: 1}, n = lisQuantite(m[2], c);
    return qui && n != null ? {op: 'perdVie', n, qui} : null;
  }, 'you lose life equal to its mana value.');

/* ---------- Cartes ---------- */
motif('pioche', 'Cartes', /^(?:(.+?) )?draws? (\w+) cards?$/,
  (m, c) => {
    const qui = m[1] ? lisReference(m[1], c) : {vous: 1}, n = lisQuantite(m[2], c);
    return qui && n != null ? {op: 'pioche', n, qui} : null;
  }, 'draw two cards.');
motif('defausse', 'Cartes', /^(?:(.+?) )?discards? (\w+) cards?$/,
  (m, c) => {
    const qui = m[1] ? lisReference(m[1], c) : {vous: 1}, n = lisQuantite(m[2], c);
    return qui && n != null ? {op: 'defausse', n, qui} : null;
  }, 'each opponent discards a card.');
motif('meule', 'Cartes', /^(?:(.+?) )?mills? (\w+) cards?$/,
  (m, c) => {
    const qui = m[1] ? lisReference(m[1], c) : {vous: 1}, n = lisQuantite(m[2], c);
    return qui && n != null ? {op: 'meule', n, qui} : null;
  }, 'target player mills three cards.');
motif('scrute', 'Cartes', /^(scry|surveil) (\w+)$/,
  (m, c) => { const n = lisQuantite(m[2], c); return n != null ? {op: 'scrute', n, cimetiere: m[1] === 'surveil'} : null; },
  'scry 2.');
motif('rien', 'Cartes', /^(?:then )?shuffle(?: your library)?$|^reveal (?:it|that card|them|those cards)$|^(?:it|they) can't be regenerated$/,
  () => ({op: 'rien'}), 'shuffle.');

/* ---------- Retraits ---------- */
motif('detruit', 'Retraits', /^destroy (.+)$/,
  (m, c) => { const a = lisReference(m[1], c, {groupe: true}); return a ? {op: 'detruit', a} : null; },
  'destroy target creature an opponent controls.');
motif('exile', 'Retraits', /^exile (.+)$/,
  (m, c) => { const a = lisReference(m[1], c, {groupe: true}); return a ? {op: 'exile', a} : null; },
  'exile target nonland permanent.');
motif('versMain', 'Retraits', /^return (.+?) to (?:its owner's|their owners'|your|their) hands?$/,
  (m, c) => { const a = lisReference(m[1], c, {groupe: true}); return a ? {op: 'place', a, vers: 'main'} : null; },
  'return target creature to its owner\'s hand.');
motif('versChamp', 'Retraits', /^return (.+?) to the battlefield( tapped)?(?: under (?:its owner's|your|their owners'|their owner's) control)?$/,
  (m, c) => { const a = lisReference(m[1], c); return a ? {op: 'place', a, vers: 'champ', engage: !!m[2]} : null; },
  'return target creature card from your graveyard to the battlefield.');
motif('contre', 'Retraits', /^counter (.+)$/,
  (m, c) => {
    const a = lisReference(m[1], c);
    if (!a || a.cible == null || c.cibles[a.cible].desc.genre !== 'sort') return null;
    return {op: 'contre', a};
  }, 'counter target noncreature spell.');
motif('sacrifie', 'Retraits', /^(?:(.+?) )?sacrifices? (a|an|one|two|three|another) (.+)$/,
  (m, c) => {
    const qui = m[1] ? lisReference(m[1], c) : {vous: 1};
    const desc = lisDescripteur(m[3], {objets: true});
    if (!qui || !desc) return null;
    if (m[2] === 'another') desc.autre = true;
    return {op: 'sacrifie', qui, n: nombreOracle(m[2] === 'another' ? 'a' : m[2]), desc};
  }, 'each opponent sacrifices a creature.');
motif('sacrifieSoi', 'Retraits', /^sacrifice (~|it)$/,
  (m, c) => ({op: 'sacrifieObjet', a: m[1] === '~' ? {soi: 1} : c.pronom()}), 'sacrifice ~.');
