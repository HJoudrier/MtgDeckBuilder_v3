/* =====================================================================
   js/etat.js — État global de l'application & utilitaires
   ===================================================================== */

const FORMATS = {
  edh:      {label:'Commander (EDH)', size:100, commander:true,  maxCopies:1,  lands:36},
  standard: {label:'Standard',        size:60,  commander:false, maxCopies:4,  lands:24},
  limite:   {label:'Limité',          size:40,  commander:false, maxCopies:99, lands:17},
  perso:    {label:'Personnalisé',    size:100, commander:false, maxCopies:1,  lands:36}
};

const RETOURNEES = new Set();
let apercuEl = null;
let apercuCardName = null;

const S = {
  collection: new Map(),
  deck: new Map(),
  commander: null,
  colors: new Set(['W','U','B','R','G','C']),
  colorMode: 'identity',
  format: 'edh',
  custom: {deckSize:100, commander:true, maxCopies:1, colorLimits:{}},
  filtres: {nom:'', type:'', texte:'', artiste:'', archetypes:'', roles:'', forceMin:'', forceMax:'', enduranceMin:'', enduranceMax:'', cmcMin:'', cmcMax:'', prixMin:'', prixMax:''},
  sort: 'cmc',
  view: 'grid',
  graphSource: 'collection',
  showImplicit: true,
  focusNodes: new Set(),
  budget: {total:30, perCard:12, condition:'GD', lang:'any', sellerType:'any', country:'any'},
  selected: null,
  selectedCtx: 'collection',
  limitB: 200,
  limiteType: {},
  exploreEtat: '',
  exploreSig: null,
  exploreMax: 6000,
  exploreTotal: 0,
  exploreCharge: 0,
  exploreReste: false,
  catalogueActif: true,
  prixMaj: null,
  majIgnoree: null,
  enriching: false,
  images: true,
  imagesFailed: false,
  scryHS: false,
  edhrec: {slug:null, status:'idle', data:null, error:null, secondaires:[], secStatus:'idle', cmdSignature:null},
  csb: {sig:null, status:'idle', data:null, error:null},
  csbRelay: '',
  headerCompact: (typeof localStorage !== 'undefined' && localStorage.getItem('mtg_compact_header') === '1') || (typeof window !== 'undefined' && window.innerWidth <= 640)
};

'WUBRG'.split('').forEach(c => S.custom.colorLimits[c] = {min:0, max:99});

/* ---------------------------------------------------------------------
   Filtres de la fenêtre « Filtres » (en-tête), dans l'ordre où ils y
   apparaissent : couleur, nom, type, texte de règles, archétype, rôle,
   force, endurance, coût de mana, prix, illustrateur. Chaque champ vide est neutre. Les
   couleurs vivent dans `S.colors` et `S.colorMode` ; tous les autres
   critères dans `S.filtres`.
   --------------------------------------------------------------------- */

const FILTRES_VIDE = {
  nom:'', type:'', texte:'', artiste:'', archetypes:'', roles:'', forceMin:'', forceMax:'', enduranceMin:'', enduranceMax:'',
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

/* Rôles cochés dans la section Deck, conservés comme les archétypes. */
function rolesFiltre() {
  return String((S.filtres && S.filtres.roles) || '').split(',').filter(Boolean);
}

function basculerRole(role) {
  if (!role) { S.filtres.roles = ''; return; }
  const sel = new Set(rolesFiltre());
  if (sel.has(role)) sel.delete(role); else sel.add(role);
  S.filtres.roles = [...sel].join(',');
}

/* Une carte tient au moins un des rôles cochés. */
function roleOK(card) {
  const roles = rolesFiltre();
  if (!roles.length) return true;
  return !!card && !!card.cats && roles.some(r => card.cats.has(r));
}

function nombreFiltre(v) {
  if (v === '' || v === null || v === undefined) return null;
  const n = parseFloat(String(v).replace(',', '.'));
  return isNaN(n) ? null : n;
}

function reinitFiltres() {
  S.filtres = {...FILTRES_VIDE};
}

/* Écrit un champ de la fenêtre dans l'état. */
function majFiltre(cle, valeur) {
  if (cle in FILTRES_VIDE) S.filtres[cle] = valeur;
}

/* Efface un filtre depuis sa puce dans l'en-tête. */
function effacerFiltre(cles) {
  (cles || []).forEach(k => majFiltre(k, ''));
}

/* Filtres en vigueur : un libellé et les clés à effacer pour chacun.
   Sert au décompte, aux puces de l'en-tête et aux infobulles. */
function filtresActifs() {
  const f = S.filtres || FILTRES_VIDE;
  const actifs = [];
  const nom = String(f.nom || '').trim();
  if (nom) actifs.push({cles:['nom'], texte:`Nom « ${nom} »`});
  const type = String(f.type || '').trim();
  if (type) actifs.push({cles:['type'], texte:`Type « ${type} »`});
  const texte = String(f.texte || '').trim();
  if (texte) actifs.push({cles:['texte'], texte:`Texte « ${texte} »`});
  const arch = archetypesFiltre();
  if (arch.length) actifs.push({cles:['archetypes'],
    texte:`Archétype${arch.length > 1 ? 's' : ''} : ${arch.map(libelleArchetype).join(', ')}`});
  const roles = rolesFiltre();
  if (roles.length) actifs.push({cles:['roles'],
    texte:`Rôle${roles.length > 1 ? 's' : ''} : ${roles.map(r => CATLABEL[r] || r).join(', ')}`});
  FILTRES_BORNES.forEach(([kMin, kMax, champ, label]) => {
    const min = nombreFiltre(f[kMin]), max = nombreFiltre(f[kMax]);
    if (min === null && max === null) return;
    const unite = champ === 'price' ? ' €' : '';
    const texte = (min !== null && max !== null) ? `${label} ${min}${unite} → ${max}${unite}`
      : (min !== null ? `${label} ≥ ${min}${unite}` : `${label} ≤ ${max}${unite}`);
    actifs.push({cles:[kMin, kMax], texte});
  });
  const artiste = String(f.artiste || '').trim();
  if (artiste) actifs.push({cles:['artiste'], texte:`Illustrateur « ${artiste} »`});
  return actifs;
}

/* Libellés seuls, pour les infobulles et les phrases de résumé. */
function texteFiltresActifs(sep) {
  return filtresActifs().map(a => a.texte).join(sep || ' · ');
}

/* Prédicat unique de l'atelier : couleurs, rôles et critères de la
   fenêtre. Il vaut pour la collection, le deck, la courbe de mana et
   les suggestions, afin qu'un filtre posé une fois vaille partout. */
function carteFiltree(card) {
  return !!card && colorOK(card) && roleOK(card) && filtreOK(card);
}

/* Applique les filtres avancés à une carte. Une carte dont la valeur est
   inconnue (créature non renseignée, prix absent) est écartée dès qu'une
   borne est posée sur ce critère. */
function filtreOK(card) {
  if (!card) return false;
  const f = S.filtres || FILTRES_VIDE;
  const nom = String(f.nom || '').trim();
  if (nom && !norm(card.name).includes(norm(nom))) return false;
  const type = String(f.type || '').trim();
  if (type && !loose(card.type + ' ' + mainType(card)).includes(loose(type))) return false;
  const texte = String(f.texte || '').trim();
  if (texte && !norm(card.text || '').includes(norm(texte))) return false;
  const artiste = String(f.artiste || '').trim();
  if (artiste && !loose(card.artist || '').includes(loose(artiste))) return false;
  const arch = archetypesFiltre();
  if (arch.length) {
    const ceux = archetypesCarte(card);
    if (!arch.some(id => ceux.includes(id))) return false;
  }
  for (const [kMin, kMax, champ] of FILTRES_BORNES) {
    const min = nombreFiltre(f[kMin]), max = nombreFiltre(f[kMax]);
    if (min === null && max === null) continue;
    const val = card[champ];
    if (typeof val !== 'number' || isNaN(val)) return false;
    if (min !== null && val < min) return false;
    if (max !== null && val > max) return false;
  }
  return true;
}

function fmt() {
  const f = FORMATS[S.format];
  return S.format === 'perso'
    ? {label:'Personnalisé', size:S.custom.deckSize, commander:S.custom.commander, maxCopies:S.custom.maxCopies, lands:Math.round(S.custom.deckSize*0.36)}
    : f;
}

function eur(n) {
  return (Math.round(n*100)/100).toLocaleString('fr-FR', {minimumFractionDigits:2, maximumFractionDigits:2}) + ' €';
}

function esc(s) {
  return String(s).replace(/[&<>"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
}

const CH = {NOM:0, COUT:1, TYPE:2, TEXTE:3, CMC:4, ID_COUL:5, FORCE:6, PRIX:7, ID:8, RANG:9, LEGAL:10, IMG:11, VERSO:12, ENDURANCE:13, ARTISTE:14};

const CAT = {
  etat:'', cartes:[], maj:null, source:'', octets:0, date:null, detail:'', partiel:false,
  majDispo:null, uri:'', taille:0, impressions:0
};

/* Vrai tant que cet appareil n'a pas les cartes existantes : archive jamais
   chargée, ou chargée mais vide. C'est ce que le démarrage teste en premier. */
function catalogueAbsent() {
  return CAT.etat !== 'ok' || !CAT.cartes.length;
}

function noeudsActifs() {
  return [...S.focusNodes];
}

function carteTouche(c, noeuds) {
  if (!noeuds || !noeuds.length) return true;
  if (!c || !c.an) return false;
  return noeuds.every(n => {
    if (c.an.edges && c.an.edges.some(e => e.from === n || e.to === n)) return true;
    if (c.an.triggers && c.an.triggers.some(t => t.c === n)) return true;
    if (c.an.produces && c.an.produces.some(p => p.c === n)) return true;
    if (c.an.abilities && c.an.abilities.some(a => (a.from && a.from.includes(n)) || (a.to && a.to.includes(n)))) return true;
    return false;
  });
}

function getCardOrAnalyzedRec(rec) {
  if (rec._card) return rec._card;
  const nom = rec[CH.NOM];
  let c = typeof find === 'function' ? find(nom) : null;
  if (c && c.an) {
    rec._card = c;
    return c;
  }
  const card = buildCard(nom, rec[CH.COUT] || '—', rec[CH.TYPE], rec[CH.PRIX], rec[CH.TEXTE]);
  if (rec[CH.ID_COUL] !== undefined) card.identity = rec[CH.ID_COUL] ? String(rec[CH.ID_COUL]).split('') : [];
  card.cmc = rec[CH.CMC];
  if (rec[CH.FORCE] != null) card.force = rec[CH.FORCE];
  if (rec[CH.ENDURANCE] != null) card.endurance = rec[CH.ENDURANCE];
  if (rec[CH.ARTISTE]) card.artist = rec[CH.ARTISTE];
  rec._card = card;
  return card;
}

function recToucheNoeuds(rec, noeuds) {
  if (!noeuds || !noeuds.length) return true;
  const card = getCardOrAnalyzedRec(rec);
  return carteTouche(card, noeuds);
}
