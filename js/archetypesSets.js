/* =====================================================================
   js/archetypesSets.js — Deux vocabulaires venus du dehors

   Les archétypes sont les thèmes d'EDHREC, les sets ceux que Scryfall publie.
   Ni l'un ni l'autre n'est écrit ici : les listes se chargent, se gardent dans
   IndexedDB et restent vides tant qu'on ne les a pas demandées. Ce fichier
   porte les deux tables, ce qui les lit, et les filtres qui s'en servent —
   avec les champs vides des filtres, dont ils font partie.
   ===================================================================== */

/* ---------------------------------------------------------------------
   Filtres de la fenêtre « Filtres » (en-tête), dans l'ordre où ils y
   apparaissent : couleur, nom, type, set, texte de règles, archétype,
   rôle, force, endurance, coût de mana, prix, illustrateur. Chaque champ
   vide est neutre. Les couleurs vivent dans `S.colors` et `S.colorMode` ;
   tous les autres critères dans `S.filtres`.
   --------------------------------------------------------------------- */

const FILTRES_VIDE = {
  nom:'', type:'', sets:'', texte:'', artiste:'', archetypes:'', roles:'', forceMin:'', forceMax:'', enduranceMin:'', enduranceMax:'',
  cmcMin:'', cmcMax:'', prixMin:'', prixMax:''
};

/* Bornes numériques : [clé min, clé max, champ de la carte, libellé]. */
const FILTRES_BORNES = [
  ['forceMin', 'forceMax', 'force', 'Force'],
  ['enduranceMin', 'enduranceMax', 'endurance', 'Endurance'],
  ['cmcMin', 'cmcMax', 'cmc', 'Coût de mana'],
  ['prixMin', 'prixMax', 'price', 'Prix']
];

/* ---------------------------------------------------------------------
   Archétypes établis par une base extérieure (thèmes EDHREC). L'index
   est rempli par `chargerArchetypesEdhrec()` dans js/externes.js et
   conservé dans IndexedDB ; il reste vide tant qu'il n'a pas été chargé.
   --------------------------------------------------------------------- */

const ARCH_BASE = {
  etat:'idle',        // idle | chargement | ok | erreur
  maj:null, erreur:'', forme:null, essais:[],
  liste:[],           // thèmes publiés par EDHREC : {slug, label, n}
  themes:{},          // thèmes dont la liste de cartes est chargée : slug -> {n}
  index:new Map(),    // nom normalisé -> Set(slug)
  enCours:new Set()   // thèmes en cours de chargement
};

/* ---------------------------------------------------------------------
   Sets, sur le même principe que les archétypes : la liste vient de
   Scryfall et les cartes d'un set ne sont cherchées qu'au moment où on le
   coche. Le tout est conservé dans IndexedDB par js/externes.js et reste
   vide tant qu'il n'a pas été chargé.
   --------------------------------------------------------------------- */

const SETS_BASE = {
  etat:'idle',        // idle | chargement | ok | erreur
  maj:null, erreur:'',
  liste:[],           // sets publiés par Scryfall : {code, nom, sortie, type, n}
  charges:{},         // sets dont la liste de cartes est chargée : code -> {n}
  numeriques:false,   // réglage sous lequel la liste a été bâtie
  index:new Map(),    // nom normalisé -> Set(code)
  enCours:new Set()   // sets en cours de chargement
};

/* Libellé d'un thème : le nôtre s'il en existe un, sinon celui d'EDHREC. */
function libelleArchetype(slug) {
  if (ARCH_LABELS[slug]) return ARCH_LABELS[slug];
  const t = (ARCH_BASE.liste || []).find(x => x.slug === slug);
  return (t && t.label) || slug;
}

/* Court résumé du fonctionnement d'un archétype. Chaque thème en a un,
   sans exception : le nôtre pour les thèmes courants, sinon celui
   qu'EDHREC publie, sinon une phrase formée sur son nom. */
function resumeArchetype(slug) {
  // le nôtre d'abord : il est en français, comme le reste de la liste
  if (ARCH_RESUMES[slug]) return ARCH_RESUMES[slug];
  const charge = ARCH_BASE.themes[slug];
  if (charge && charge.desc) return charge.desc;
  const t = (ARCH_BASE.liste || []).find(x => x.slug === slug);
  if (t && t.desc) return t.desc;

  const nom = libelleArchetype(slug);
  const famille = nom.replace(/\s*(tribal|typal|deck[s]?)\s*/ig, '').trim();
  if (/tribal|typal/i.test(nom) || /-(tribal|typal)$/i.test(slug))
    return `Decks bâtis autour des créatures ${famille} et de ce qui les renforce.`;
  return `Les cartes les plus jouées dans les decks ${famille || nom}.`;
}

/* Les archétypes proposés : ceux qu'EDHREC publie. */
function archetypesDisponibles() {
  return (ARCH_BASE.liste || []).map(t => ({
    slug:t.slug, label:libelleArchetype(t.slug), n:t.n || 0, aide:resumeArchetype(t.slug)
  }));
}

/* Archétypes d'une carte, d'après les thèmes EDHREC chargés. */
function archetypesCarte(card) {
  if (!card || !ARCH_BASE.index.size) return [];
  const avant = typeof frontFace === 'function' ? frontFace(card.name) : card.name;
  const s = ARCH_BASE.index.get(norm(card.name)) || ARCH_BASE.index.get(norm(avant));
  return s ? [...s] : [];
}

/* Un thème coché dont les cartes ne sont pas encore chargées. */
function archetypesAChargerEdhrec() {
  return archetypesFiltre().filter(slug => !ARCH_BASE.themes[slug] && !ARCH_BASE.enCours.has(slug));
}

/* Archétypes cochés, conservés sous forme de liste séparée par des virgules. */
function archetypesFiltre() {
  return String((S.filtres && S.filtres.archetypes) || '').split(',').filter(Boolean);
}

function basculerArchetype(id) {
  const sel = new Set(archetypesFiltre());
  if (sel.has(id)) sel.delete(id); else sel.add(id);
  S.filtres.archetypes = [...sel].join(',');
}

/* Sets cochés, conservés comme les archétypes : une liste de codes séparés
   par des virgules. */
function setsFiltre() {
  return String((S.filtres && S.filtres.sets) || '').split(',').filter(Boolean);
}

function basculerSet(code) {
  if (!code) { S.filtres.sets = ''; return; }
  const sel = new Set(setsFiltre());
  const c = String(code).toUpperCase();
  if (sel.has(c)) sel.delete(c); else sel.add(c);
  S.filtres.sets = [...sel].join(',');
}

/* Nom du set, s'il figure dans la liste Scryfall ; sinon son code. */
function libelleSet(code) {
  const t = (SETS_BASE.liste || []).find(x => x.code === code);
  return (t && t.nom) || code;
}

/* Un set coché dont les cartes ne sont pas encore chargées. */
function setsACharger() {
  return setsFiltre().filter(c => !SETS_BASE.charges[c] && !SETS_BASE.enCours.has(c));
}

/* Sets d'une carte. Scryfall fait autorité pour les sets déjà chargés, mais
   on y joint ce que l'appareil sait déjà : le set relevé dans l'archive, les
   éditions possédées et celles que la fiche a rapportées. Un set coché répond
   ainsi tout de suite sur une liste importée avec ses codes, sans attendre le
   réseau. */
function setsCarte(card) {
  if (!card) return [];
  const out = new Set();
  if (SETS_BASE.index.size) {
    const avant = typeof frontFace === 'function' ? frontFace(card.name) : card.name;
    const s = SETS_BASE.index.get(norm(card.name)) || SETS_BASE.index.get(norm(avant));
    if (s) s.forEach(c => out.add(c));
  }
  (card.setsArchive || []).forEach(c => c && out.add(c));
  if (card.set) out.add(String(card.set).toUpperCase());
  (card.impressions || []).forEach(i => i.set && out.add(String(i.set).toUpperCase()));
  (card.editions || []).forEach(e => e.set && out.add(String(e.set).toUpperCase()));
  return [...out];
}
