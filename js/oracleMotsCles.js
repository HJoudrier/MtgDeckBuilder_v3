/* =====================================================================
   js/oracleMotsCles.js — Les mots-clés que le moteur sait jouer

   Un mot-clé est un bit : le moteur en combine des dizaines de milliers par
   partie (bonus d'ensemble, effets jusqu'à la fin du tour), et un masque se
   calcule plus vite qu'un ensemble. Ceux qui portent un paramètre — garde,
   protection, équipement, kicker, flashback, cycle — le rangent à côté.
   ===================================================================== */

const MOT = {
  VOL: 1, PORTEE: 2, PIETINEMENT: 4, INITIATIVE: 8, DOUBLE: 16, CONTACT: 32, LIEN: 64,
  VIGILANCE: 128, CELERITE: 256, MENACE: 512, DEFENSEUR: 1024, LINCEUL: 2048,
  INDESTRUCTIBLE: 4096, FLASH: 8192, IMBLOCABLE: 16384, INFECTION: 32768, PROUESSE: 65536,
  INTOUCHABLE: 131072, GARDE: 262144, PROTECTION: 524288
};

/* Le nom anglais de chaque mot-clé simple, tel que l'oracle et Scryfall
   l'écrivent. */
const MOTS_ANGLAIS = {
  'flying': MOT.VOL, 'reach': MOT.PORTEE, 'trample': MOT.PIETINEMENT, 'first strike': MOT.INITIATIVE,
  'double strike': MOT.DOUBLE, 'deathtouch': MOT.CONTACT, 'lifelink': MOT.LIEN,
  'vigilance': MOT.VIGILANCE, 'haste': MOT.CELERITE, 'menace': MOT.MENACE,
  'defender': MOT.DEFENSEUR, 'hexproof': MOT.LINCEUL, 'indestructible': MOT.INDESTRUCTIBLE,
  'flash': MOT.FLASH, 'infect': MOT.INFECTION, 'prowess': MOT.PROUESSE, 'shroud': MOT.INTOUCHABLE,
  "can't be blocked": MOT.IMBLOCABLE
};

/* Leur nom français, pour le journal et la fenêtre des comportements. */
const MOTS_FRANCAIS = {
  VOL: 'vol', PORTEE: 'portée', PIETINEMENT: 'piétinement', INITIATIVE: 'initiative',
  DOUBLE: 'double initiative', CONTACT: 'contact mortel', LIEN: 'lien de vie', VIGILANCE: 'vigilance',
  CELERITE: 'célérité', MENACE: 'menace', DEFENSEUR: 'défenseur', LINCEUL: 'linceul',
  INDESTRUCTIBLE: 'indestructible', FLASH: 'flash', IMBLOCABLE: 'imblocable', INFECTION: 'infection',
  PROUESSE: 'prouesse', INTOUCHABLE: 'défense talismanique', GARDE: 'garde', PROTECTION: 'protection'
};

/* Les mots-clés qui n'ont de sens que sur la pile ou au lancement, et que
   le compilateur range comme capacités plutôt que comme bits. */
const MOTS_A_COUT = ['equip', 'kicker', 'flashback', 'cycling', 'ward'];

const COULEURS_ANGLAIS = {white: 'W', blue: 'U', black: 'B', red: 'R', green: 'G'};

/* Lire une liste de mots-clés simples (« flying and trample », « flying,
   vigilance »). `null` si un seul morceau n'en est pas un. */
function masqueMots(txt) {
  let m = 0;
  for (const p of String(txt).split(/,\s*(?:and\s+)?|\s+and\s+/).map(s => s.trim()).filter(Boolean)) {
    if (MOTS_ANGLAIS[p] == null) return null;
    m |= MOTS_ANGLAIS[p];
  }
  return m;
}

/* Un morceau de ligne de mots-clés, avec son paramètre éventuel. Rend
   `{mot}` pour un bit, `{param:{…}}` pour la garde et la protection,
   `{cap:{…}}` pour ce qui se paie, `null` sinon. */
function motCleSeul(p) {
  if (MOTS_ANGLAIS[p] != null) return {mot: MOTS_ANGLAIS[p]};
  let m;
  if ((m = /^ward (\{[^ ]+\})$/.exec(p))) return {mot: MOT.GARDE, param: {garde: coutMana(m[1]).total}};
  if ((m = /^ward[—-] ?pay (\d+) life$/.exec(p))) return {mot: MOT.GARDE, param: {garde: +m[1]}};
  if ((m = /^protection from (white|blue|black|red|green)(?: and from (white|blue|black|red|green))?$/.exec(p)))
    return {mot: MOT.PROTECTION, param: {protection: [m[1], m[2]].filter(Boolean).map(c => COULEURS_ANGLAIS[c])}};
  if ((m = /^(equip|kicker|flashback|cycling) (\{[^ ]+)$/.exec(p))) {
    const cout = coutMana(m[2]);
    return cout ? {cap: {genre: m[1], cout}} : null;
  }
  if ((m = /^equip (\d+)$/.exec(p))) return {cap: {genre: 'equip', cout: coutMana('{' + m[1] + '}')}};
  return null;
}

/* Une ligne n'est une ligne de mots-clés que si **tous** ses morceaux en
   sont : « Flying, haste » oui, « Flying, then draw a card » non. */
function ligneMotsCles(ligne) {
  const morceaux = ligne.replace(/\.$/, '').split(/[,;]\s*/).map(s => s.trim()).filter(Boolean);
  if (!morceaux.length) return null;
  const r = {mots: 0, params: {}, caps: []};
  for (const p of morceaux) {
    const k = motCleSeul(p);
    if (!k) return null;
    if (k.mot) r.mots |= k.mot;
    if (k.param) Object.assign(r.params, k.param);
    if (k.cap) r.caps.push(k.cap);
  }
  return r;
}

/* Les mots-clés que Scryfall a relevés (`card.motsCles`, « Flying|Ward »),
   traduits en bits. Ils confirment la lecture du texte, et la remplacent
   quand une archive d'hier n'a pas la colonne. */
function masqueScryfall(liste) {
  let m = 0;
  String(liste || '').split('|').forEach(k => {
    const b = MOTS_ANGLAIS[k.trim().toLowerCase()];
    if (b) m |= b;
  });
  return m;
}

/* Les noms français d'un masque, pour qu'un humain le lise. */
function nomsMots(m) {
  return Object.keys(MOT).filter(k => m & MOT[k]).map(k => MOTS_FRANCAIS[k]);
}
