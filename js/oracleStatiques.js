/* =====================================================================
   js/oracleStatiques.js — Lire une capacité statique, et la façon d'entrer

   Une statique agit tant que sa carte est sur le champ, sans pile ni
   déclencheur : un bonus d'ensemble, ce qu'une aura ou un équipement donne,
   une interdiction, une taxe ou une réduction de coût. Le moteur les relit
   toutes à chaque calcul de caractéristiques (js/jeuCaracteristiques.js).

   La façon d'entrer — engagé, avec des marqueurs, engagé sauf si — est un
   remplacement, que le moteur applique au moment où le permanent arrive.
   ===================================================================== */

const STATIQUES_ORACLE = [];

function statique(re, fait, ex) { STATIQUES_ORACLE.push({re, fait, ex}); }

/* « +1/+1 » en deux nombres. */
function bonusPT(f, e) {
  const a = /^([+-])(\d+)$/.exec(f), b = /^([+-])(\d+)$/.exec(e);
  if (!a || !b) return null;
  return [(a[1] === '-' ? -1 : 1) * +a[2], (b[1] === '-' ? -1 : 1) * +b[2]];
}

statique(/^(other )?(.+?) you control get ([+-]\d+)\/([+-]\d+)(?: and have ([a-z ,]+))?$/,
  m => {
    const desc = lisDescripteur(m[2] + ' you control', {objets: true}), pt = bonusPT(m[3], m[4]);
    const mots = m[5] ? masqueMots(m[5]) : 0;
    if (!desc || !pt || mots == null) return null;
    if (m[1]) desc.autre = true;
    return {s: 'bonus', sujet: desc, f: pt[0], e: pt[1], mots};
  }, 'Other elf creatures you control get +1/+1.');
statique(/^(other )?(.+?) you control have ([a-z ,]+)$/,
  m => {
    const desc = lisDescripteur(m[2] + ' you control', {objets: true}), mots = masqueMots(m[3]);
    if (!desc || !mots) return null;
    if (m[1]) desc.autre = true;
    return {s: 'bonus', sujet: desc, f: 0, e: 0, mots};
  }, 'Creatures you control have haste.');
statique(/^(enchanted|equipped) creature gets ([+-]\d+)\/([+-]\d+)(?: and has ([a-z ,]+))?$/,
  m => {
    const pt = bonusPT(m[2], m[3]), mots = m[4] ? masqueMots(m[4]) : 0;
    return pt && mots != null ? {s: 'bonus', sujet: 'attache', f: pt[0], e: pt[1], mots} : null;
  }, 'Equipped creature gets +2/+0.');
statique(/^(enchanted|equipped) creature has ([a-z ,]+)$/,
  m => { const mots = masqueMots(m[2]); return mots ? {s: 'bonus', sujet: 'attache', f: 0, e: 0, mots} : null; },
  'Enchanted creature has flying.');
statique(/^(~|enchanted creature|equipped creature) can't (attack or block|block|attack)$/,
  m => ({s: 'interdit', sujet: m[1] === '~' ? 'soi' : 'attache', attaque: /attack/.test(m[2]), blocage: /block/.test(m[2])}),
  'Enchanted creature can\'t attack or block.');
statique(/^~ can't be blocked$/, () => ({s: 'bonus', sujet: 'soi', f: 0, e: 0, mots: MOT.IMBLOCABLE}), '~ can\'t be blocked.');
statique(/^(.+?) spells you cast cost \{(\d+)\} less to cast$/,
  m => { const desc = m[1] === 'spells' ? null : lisDescripteur(m[1] + ' spell'); return (desc || m[1] === 'spells') ? {s: 'reduction', desc, n: +m[2]} : null; },
  'Creature spells you cast cost {1} less to cast.');
statique(/^(.+?) spells cost \{(\d+)\} more to cast$/,
  m => { const desc = lisDescripteur(m[1] + ' spell'); return desc ? {s: 'taxe', desc, n: +m[2]} : null; },
  'Noncreature spells cost {1} more to cast.');

/* Lire une statique. */
function lisStatique(txt) {
  for (const s of STATIQUES_ORACLE) {
    const m = s.re.exec(txt);
    if (!m) continue;
    const r = s.fait(m);
    if (r) return r;
  }
  return null;
}

/* La façon d'entrer d'un permanent, ou `null` si la ligne n'en parle pas.
   La ligne des « shocklands » tient en deux phrases : on la lit entière. */
function lisEntree(ligne) {
  const t = ligne.replace(/\.$/, '');
  let m;
  if (/^~ enters tapped$/.test(t)) return {engagee: true};
  if ((m = /^~ enters with (\w+) ([+-]1\/[+-]1|loyalty) counters? on it$/.exec(t)))
    return {marqueurs: nombreOracle(m[1]), genre: m[2]};
  if ((m = /^~ enters tapped unless you control (?:a|an) (.+?)(?: or (?:a|an) (.+?))?$/.exec(t))) {
    const descs = [m[1], m[2]].filter(Boolean).map(x => lisDescripteur(x + ' you control', {objets: true}));
    return descs.every(Boolean) ? {engagee: true, sauf: descs} : null;
  }
  if ((m = /^as ~ enters, you may pay (\d+) life\. if you don't, it enters tapped$/.exec(t)))
    return {engagee: true, payeVie: +m[1]};
  return null;
}
