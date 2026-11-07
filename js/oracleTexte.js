/* =====================================================================
   js/oracleTexte.js — Préparer le texte oracle pour le compilateur

   Le compilateur d'oracle ne lit pas le texte tel qu'il s'imprime : il lit
   une forme réduite, où la carte se nomme `~`, où le texte de rappel a
   disparu, où les tournures qui disent la même chose s'écrivent pareil. Tout
   ce qui suit compare des propositions entières à des motifs ancrés ; plus
   la forme est régulière, moins il faut de motifs.

   Ce fichier et tous les `oracle*.js` sont **purs** : ni DOM, ni `DB`. Ils se
   chargent tels quels dans Node pour les tests.
   ===================================================================== */

const NOMBRES_MOTS = {a:1, an:1, one:1, two:2, three:3, four:4, five:5, six:6, seven:7,
  eight:8, nine:9, ten:10, eleven:11, twelve:12, twenty:20, another:1};

/* Un nombre écrit en chiffres ou en toutes lettres ; « x » reste la variable
   du coût. `null` pour ce qui n'est pas un nombre — le motif qui l'a demandé
   échoue alors, au lieu de lire zéro. */
function nombreOracle(s) {
  if (s == null) return null;
  s = String(s).trim();
  if (/^\d+$/.test(s)) return +s;
  if (s === 'x') return 'X';
  return NOMBRES_MOTS[s] != null ? NOMBRES_MOTS[s] : null;
}

/* Les tournures qui désignent la carte elle-même, réduites à `~`. L'ordre
   compte : « this creature » doit passer avant qu'un motif ne lise
   « creature » seul. */
const SOI_ORACLE = /\bthis (?:creature|artifact|enchantment|land|permanent|spell|card|planeswalker|equipment|aura|vehicle|token)\b/g;

function echappeRegex(s) { return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); }

/* Réduire le texte d'une face : minuscules, nom → `~`, rappel retiré,
   tirets et apostrophes unifiés, « enters the battlefield » ramené à
   « enters » (la formulation de 2024). Rend la liste des lignes. */
function normaliseOracle(texte, nom) {
  let t = String(texte || '').toLowerCase()
    .replace(/[‘’`]/g, "'").replace(/[−–]/g, '-').replace(/—/g, '—');
  const noms = new Set();
  const n = String(nom || '').toLowerCase().replace(/[‘’]/g, "'").trim();
  if (n) {
    noms.add(n);
    /* Le nom court d'une légende — « Purphoros » pour « Purphoros, God of
       the Forge » — ne vaut que s'il fait plus d'un mot de trois lettres. */
    const court = n.split(',')[0].trim();
    if (court !== n && court.length > 3) noms.add(court);
  }
  [...noms].sort((a, b) => b.length - a.length).forEach(x => {
    t = t.replace(new RegExp('(^|[^a-z])' + echappeRegex(x) + '(?![a-z])', 'g'), '$1~');
  });
  t = t.replace(SOI_ORACLE, '~')
    .replace(/\s*\([^)]*\)/g, '')
    .replace(/\benters the battlefield\b/g, 'enters')
    .replace(/\bonto the battlefield\b/g, 'onto the battlefield')
    .replace(/\b(\d+) or more\b/g, '$1 or greater')
    .replace(/[ \t]+/g, ' ');
  return t.split(/\s*\/\/\s*/).map(l => l.trim()).filter(Boolean);
}

/* Couper une ligne en phrases. Un point dans des guillemets — une capacité
   accordée — ne coupe pas. */
function phrasesOracle(ligne) {
  const out = [];
  let cur = '', guill = false;
  for (let i = 0; i < ligne.length; i++) {
    const ch = ligne[i];
    if (ch === '"') guill = !guill;
    if (ch === '.' && !guill && (i === ligne.length - 1 || ligne[i + 1] === ' ')) {
      if (cur.trim()) out.push(cur.trim());
      cur = '';
      continue;
    }
    cur += ch;
  }
  if (cur.trim()) out.push(cur.trim());
  return out;
}

/* Les verbes qui ouvrent une nouvelle proposition après « , and » ou
   « and » : sans eux, « destroy target creature and its controller gains 2
   life » serait un seul bloc, et « create a 1/1 and a 2/2 » deux. */
const VERBES_ORACLE = '(?:draw|draws|gain|gains|lose|loses|create|creates|put|puts|return|exile|destroy|' +
  'untap|tap|add|scry|surveil|mill|discard|discards|sacrifice|sacrifices|search|shuffle|you|each|target|' +
  'it|~|that|counter|deal|deals|get|gets)';
const COUPE_ORACLE = new RegExp(',? then |, and (?=' + VERBES_ORACLE + '\\b)| and (?=(?:you|each opponent|' +
  'its controller|that player|target player) (?:gain|gains|lose|loses|draw|draws|create|creates)\\b)' +
  '| and (?=(?:put|reveal|shuffle|draw|create|scry|surveil|exile|destroy|return|you may)\\b)|, (?=(?:put|reveal) (?:it|one|that card|them|those cards)\\b)', 'g');

/* Couper une phrase en propositions qu'un seul motif peut lire. */
function propositionsOracle(phrase) {
  return phrase.split(COUPE_ORACLE).map(p => p.trim().replace(/^then /, '')).filter(Boolean);
}

/* La face que le moteur joue. Une carte à faces porte ses faces à part
   (js/champsJeu.js) ; seule la première se joue au lot 1, le dos est
   rapporté. Sans faces connues, le texte joint par ` // ` est ambigu : on
   n'en garde que la part de la première face si le nom en annonce deux. */
function faceJouee(fiche) {
  if (Array.isArray(fiche.faces) && fiche.faces.length > 1) {
    const [nom, cout, type, texte, f, e, l] = fiche.faces[0];
    return {nom, cout, type, texte, force: f, endurance: e, loyaute: l, dos: fiche.faces.slice(1)};
  }
  return {nom: fiche.nom, cout: fiche.cout, type: fiche.type, texte: fiche.texte,
    force: fiche.force, endurance: fiche.endurance, loyaute: fiche.loyaute, dos: null};
}

/* La ligne de type, lue une fois : types, sous-types, supertypes. */
function lisTypeLigne(type) {
  const t = String(type || '').split(' // ')[0].toLowerCase().replace(/—/g, '—');
  const [avant, apres] = t.split('—');
  const mots = (avant || '').trim().split(/\s+/).filter(Boolean);
  const SUPERS = ['legendary', 'basic', 'snow', 'world'];
  const TYPES = ['creature', 'artifact', 'enchantment', 'land', 'planeswalker', 'instant', 'sorcery', 'battle', 'kindred', 'tribal'];
  return {
    supers: mots.filter(m => SUPERS.includes(m)),
    types: mots.filter(m => TYPES.includes(m)).map(m => m === 'tribal' ? 'kindred' : m),
    sousTypes: (apres || '').trim().split(/\s+/).filter(Boolean)
  };
}
