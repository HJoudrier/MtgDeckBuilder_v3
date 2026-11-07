/* =====================================================================
   js/iaValeur.js — Ce que vaut une carte, un permanent, un adversaire

   Le joueur automatique ne cherche pas dans l'arbre des coups : il compare
   des valeurs. Celles-ci sont grossières et le disent — une créature vaut
   sa force et son endurance, plus ce que ses mots-clés lui donnent, plus un
   peu pour chacune de ses capacités — mais elles sont les mêmes partout :
   attaquer, bloquer, cibler, lancer, défausser lisent ces nombres-là.
   ===================================================================== */

const PRIME_MOTS = [[MOT.VOL, 1.5], [MOT.CONTACT, 1.2], [MOT.LIEN, 1], [MOT.INITIATIVE, 1], [MOT.DOUBLE, 2],
  [MOT.PIETINEMENT, 0.5], [MOT.VIGILANCE, 0.4], [MOT.MENACE, 0.6], [MOT.LINCEUL, 1], [MOT.INDESTRUCTIBLE, 2.5],
  [MOT.IMBLOCABLE, 1.5], [MOT.INFECTION, 1], [MOT.CELERITE, 0.3]];

function primeMots(m) { return PRIME_MOTS.reduce((s, [b, v]) => s + ((m & b) ? v : 0), 0); }

/* La valeur d'une définition, hors de toute partie. */
function valeurDef(d) {
  if (d._val !== undefined) return d._val;
  let v = 0;
  if (d.types.includes('creature')) v = (d.force || 0) * 1.4 + (d.endurance || 0) * 0.8 + primeMots(d.mots);
  else if (d.types.includes('planeswalker')) v = 4 + (d.loyaute || 0);
  else if (d.types.includes('land')) v = 1;
  else v = Math.max(1, d.mv * 0.8);
  v += d.capacites.filter(k => k.genre !== 'mana').length * 0.8 + d.statiques.length * 1.2;
  if (d.capacites.some(k => k.genre === 'mana') && !d.types.includes('land')) v += 1.5;
  if (d.couverture && d.couverture.etat === 'injouable') v = 0;
  d._val = v;
  return v;
}

/* La valeur d'un permanent tel qu'il est : marqueurs, bonus et blessures
   compris. */
function valeurObjet(P, o) {
  if (!o || o.j != null) return 0;
  if (o.zone !== 'champ' || !estCreature(o)) return valeurDef(o.def) + (o.marq.loyaute || 0);
  const c = car(P, o);
  return c.force * 1.4 + Math.max(0, c.endurance - o.bless) * 0.8 + primeMots(c.mots) +
    o.def.capacites.filter(k => k.genre !== 'mana').length * 0.8 + o.def.statiques.length * 1.2;
}

/* La force de frappe qu'un joueur a sur le champ. */
function forceDeFrappe(P, j) {
  return champDe(P, j).filter(estCreature).reduce((s, o) => s + Math.max(0, car(P, o).force), 0);
}

/* La menace qu'un adversaire fait peser : son plateau, sa main, et à quel
   point il est près de gagner. Le joueur automatique vise d'abord le plus
   menaçant, ou celui qu'il peut achever. */
function menace(P, j) {
  const J = P.joueurs[j];
  return champDe(P, j).reduce((s, o) => s + valeurObjet(P, o), 0) + J.main.length * 0.7;
}

/* Un objet est-il à moi, du point de vue d'un joueur ? */
function estAMoi(P, c, j) {
  if (c && typeof c === 'object' && c.j != null) return c.j === j;
  const o = typeof c === 'number' ? obj(P, c) : c;
  return !!o && (o.zone === 'champ' || o.zone === 'pile' ? o.ctrl === j : o.prop === j);
}

/* Les opérations qui nuisent à ce qu'elles visent. */
const OPS_HOSTILES = new Set(['degats', 'detruit', 'exile', 'contre', 'engage', 'perdVie', 'defausse', 'meule', 'sacrifie']);

/* Une opération nuit-elle à ce qu'elle désigne ? */
function opHostile(op) {
  if (OPS_HOSTILES.has(op.op)) return true;
  if (op.op === 'place') return op.vers === 'main' || op.vers === 'dessus' || op.vers === 'dessous';
  if (op.op === 'marqueurs') return op.genre === '-1/-1';
  if (op.op === 'pompe') return typeof op.f === 'number' && (op.f < 0 || op.e < 0);
  return false;
}

/* Les opérations d'une liste qui portent sur l'emplacement de cible `i`. */
function opsSurCible(ops, i) {
  const r = [];
  const vise = ref => ref && (ref.cible === i || (ref.controleurDe && ref.controleurDe.cible === i));
  (ops || []).forEach(op => {
    if (op.ops) r.push(...opsSurCible(op.ops, i));
    if (vise(op.a) || vise(op.qui) || vise(op.b)) r.push(op);
  });
  return r;
}
