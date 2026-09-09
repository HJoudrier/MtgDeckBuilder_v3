/* =====================================================================
   js/etat.js — État global de l'application & utilitaires
   ===================================================================== */

/* `legal` : la lettre que `codeLegalite()` emploie pour ce format, et le nom
   que Scryfall lui donne dans ses recherches. Limité et Personnalisé
   n'imposent aucune légalité — leur `legal` est vide. */
const FORMATS = {
  edh:      {label:'Commander (EDH)', size:100, commander:true,  maxCopies:1,  lands:36, legal:'c', scry:'commander'},
  standard: {label:'Standard',        size:60,  commander:false, maxCopies:4,  lands:24, legal:'s', scry:'standard'},
  limite:   {label:'Limité',          size:40,  commander:false, maxCopies:99, lands:17, legal:'',  scry:''},
  perso:    {label:'Personnalisé',    size:100, commander:false, maxCopies:1,  lands:36, legal:'',  scry:''}
};

/* Les deux listes annexes de la section Deck : la réserve — le sideboard —
   et les cartes à l'étude — le considering des sites de decks. Elles tiennent
   les cartes qu'on garde à côté sans les jouer, et le deck, la réserve et
   l'étude s'excluent : une carte vit dans l'une des trois, jamais dans deux à
   la fois, si bien que l'y poser l'en retire ailleurs. Rien de ce qu'elles
   portent ne compte dans la taille du deck, sa légalité, sa courbe, ses rôles
   ni ses achats : ce sont des listes d'attente, pas le deck. */
const ANNEXES = {
  sideboard: {
    titre: 'Réserve', anglais: 'sideboard', article: 'la réserve',
    poser: 'Mettre en réserve', retirer: 'Retirer de la réserve',
    aide: "Les cartes tenues prêtes à côté du deck, comme la réserve d'un tournoi.",
    vide: "La réserve est vide : les cartes envoyées ici quittent la liste principale sans quitter le deck des yeux."
  },
  considering: {
    titre: "À l'étude", anglais: 'considering', article: "l'étude",
    poser: "Mettre à l'étude", retirer: "Retirer de l'étude",
    aide: "Les cartes qu'on hésite à jouer : elles attendent ici sans peser sur le deck.",
    vide: "Aucune carte à l'étude : posez-y les pistes que vous n'avez pas encore tranchées."
  }
};
const CLES_ANNEXES = Object.keys(ANNEXES);

/* Les trois onglets de l'atelier, dans l'ordre où ils paraissent sous
   l'entête. Chacun nomme les sections qu'il porte : c'est la seule table qui
   les répartisse, et tout le reste — la barre, le passage d'un onglet à
   l'autre, le signal d'un travail de fond — s'y réfère. */
const ONGLETS = {
  collection:  {label:'Collection',  sections:['secC','secB']},
  deck:        {label:'Deck',        sections:['secE']},
  suggestions: {label:'Suggestions', sections:['secD','secF']}
};
const CLES_ONGLETS = Object.keys(ONGLETS);

/* L'onglet qui porte une section, pour les gestes qui traversent l'atelier —
   la fiche d'une carte qui renvoie au graphe, par exemple. */
function ongletDeSection(id) {
  return CLES_ONGLETS.find(cle => ONGLETS[cle].sections.includes(id)) || CLES_ONGLETS[0];
}

const RETOURNEES = new Set();
let apercuEl = null;
let apercuCardName = null;

const S = {
  collection: new Map(),
  deck: new Map(),
  sideboard: new Map(),      // la réserve, hors de la liste principale
  considering: new Map(),    // les cartes à l'étude, hors de la liste principale
  deckPlie: new Set(),       // les parties repliées de la section Deck : 'liste', 'sideboard', 'considering'
  /* Les catégories repliées des trois sections, par clé « section|mode|groupe »
     (js/groupes.js) : le pli d'un groupement ne vaut que pour lui. */
  groupesPlies: new Set(),
  commander: null,
  colors: new Set(['W','U','B','R','G','C']),
  colorMode: 'identity',
  format: 'edh',
  custom: {deckSize:100, commander:true, maxCopies:1, colorLimits:{}},
  filtres: {nom:'', type:'', sets:'', texte:'', artiste:'', archetypes:'', roles:'', forceMin:'', forceMax:'', enduranceMin:'', enduranceMax:'', cmcMin:'', cmcMax:'', prixMin:'', prixMax:''},
  /* Le rangement des trois sections qui montrent des cartes : chacune garde
     son groupe et son tri. Les valeurs de départ reproduisent ce que les
     sections faisaient avant tout réglage — la collection triée par coût sans
     groupe, le deck et les suggestions groupés par type. */
  groupes: {collection:'aucun', deck:'type', suggestions:'type'},
  tris: {collection:'cmc', deck:'type', suggestions:'score'},
  view: 'grid',
  onglet: 'collection',      // l'onglet ouvert : une préférence d'affichage, conservée
  graphSource: 'collection',
  showImplicit: true,
  focusNodes: new Set(),
  /* Budget nul au démarrage : l'atelier ne propose alors que les cartes de la
     collection, et n'engage aucun achat tant qu'un budget n'a pas été fixé
     dans la fenêtre « Achats sur Cardmarket ». Le prix maximum par carte, lui,
     est déjà posé : il n'attend que le budget pour valoir. */
  budget: {total:0, perCard:5, condition:'GD', lang:'any', sellerType:'any', country:'any'},
  selected: null,
  selectedCtx: 'collection',
  limitB: 200,
  limiteType: {},
  exploreEtat: '',
  exploreSig: null,
  exploreMax: 6000,        // plafond du chargement paginé par l'API Scryfall
  candidatsMax: 20000,     // plafond des candidats tirés du catalogue local
  catalogueNumeriques: false,  // cartes d'Alchemy, d'Arena, de MTGO : écartées par défaut
  exploreTotal: 0,
  exploreCharge: 0,
  exploreReste: false,
  catalogueActif: true,
  filtreLegal: true,
  prixMaj: null,
  majIgnoree: null,
  enriching: false,
  // Les visuels Scryfall sont toujours actifs : plus aucun réglage ne les coupe.
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
  const sets = setsFiltre();
  if (sets.length) actifs.push({cles:['sets'],
    texte:`Set${sets.length > 1 ? 's' : ''} : ${sets.map(libelleSet).join(', ')}`});
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

/* Une valeur peut être donnée telle quelle ou par une fonction, pour que
   les critères coûteux — sets, archétypes, type développé — ne soient
   calculés que si le filtre correspondant est posé. */
function valeurFiltre(x, vide) {
  return (typeof x === 'function' ? x() : x) || vide;
}

/* Le noyau des critères de la fenêtre, sur des valeurs plutôt que sur une
   carte : la collection y arrive par `filtreOK(card)`, le catalogue par
   `filtreOKRec(rec)`, sans que les comparaisons soient écrites deux fois.
   Une valeur inconnue (créature non renseignée, prix absent) écarte la
   carte dès qu'une borne est posée sur ce critère. */
/* Chaque mot de la saisie doit se retrouver dans la valeur, dans n'importe
   quel ordre. Cherchés d'un seul bloc, « Legendary creature » écartait
   « Legendary Enchantment Creature — God », « Legendary Artifact Creature »
   et « Legendary Snow Creature » : le mot intercalé rompait la chaîne, et
   l'on perdait sans le savoir une partie de ses créatures légendaires. */
function motsFiltre(valeur, saisie, cle) {
  const mots = String(saisie).trim().split(/\s+/).map(m => cle(m)).filter(Boolean);
  if (!mots.length) return true;
  const v = cle(valeur);
  return mots.every(m => v.includes(m));
}

function filtresValeursOK(v) {
  const f = S.filtres || FILTRES_VIDE;
  const nom = String(f.nom || '').trim();
  if (nom && !motsFiltre(valeurFiltre(v.name, ''), nom, norm)) return false;
  const type = String(f.type || '').trim();
  if (type && !motsFiltre(valeurFiltre(v.type, ''), type, loose)) return false;
  const sets = setsFiltre();
  if (sets.length) {
    const ceux = valeurFiltre(v.sets, []);
    if (!sets.some(c => ceux.includes(c))) return false;
  }
  const texte = String(f.texte || '').trim();
  if (texte && !motsFiltre(valeurFiltre(v.text, ''), texte, norm)) return false;
  const artiste = String(f.artiste || '').trim();
  if (artiste && !motsFiltre(valeurFiltre(v.artist, ''), artiste, loose)) return false;
  const arch = archetypesFiltre();
  if (arch.length) {
    const ceux = valeurFiltre(v.archetypes, []);
    if (!arch.some(id => ceux.includes(id))) return false;
  }
  for (const [kMin, kMax, champ] of FILTRES_BORNES) {
    const min = nombreFiltre(f[kMin]), max = nombreFiltre(f[kMax]);
    if (min === null && max === null) continue;
    const val = v[champ];
    if (typeof val !== 'number' || isNaN(val)) return false;
    if (min !== null && val < min) return false;
    if (max !== null && val > max) return false;
  }
  return true;
}

/* ---------------------------------------------------------------------
   Les « Game Changers » : la liste que Wizards publie pour les paliers du
   format Commander — une quarantaine de cartes dont la présence hausse le
   palier d'un deck. C'est une liste fermée, révisée de temps à autre par
   l'éditeur : plutôt que de la recopier ici, où elle vieillirait en silence,
   on la demande à Scryfall (`is:gamechanger`) et on la garde en cache, comme
   la liste des sets. Tant qu'elle n'est pas chargée, aucune carte n'est
   annoncée comme telle — l'ignorance se dit, elle ne s'invente pas.
   --------------------------------------------------------------------- */

const GC_BASE = {
  etat:'idle',        // idle | chargement | ok | erreur
  maj:null, erreur:'',
  noms:new Set()      // noms normalisés, face avant comprise
};

function gameChangersConnus() {
  return GC_BASE.noms.size > 0;
}

/* Vrai, faux, ou `null` quand la liste n'est pas là : une carte qu'on ne sait
   pas juger n'est pas déclarée ordinaire pour autant. */
function estGameChanger(card) {
  if (!card || !gameChangersConnus()) return null;
  return GC_BASE.noms.has(norm(card.name)) || GC_BASE.noms.has(norm(frontFace(card.name)));
}

/* Légalité d'une carte dans le format en cours. Trois réponses, pas deux :
   `true`, `false`, ou `null` quand nous l'ignorons — carte que ni l'archive ni
   Scryfall n'ont renseignée. Une carte qu'on ne sait pas juger n'est ni
   masquée ni accusée. Limité et Personnalisé n'imposent rien : tout y passe. */
function carteLegale(card) {
  const cle = fmt().legal;
  if (!cle) return true;
  if (!card || typeof card.legal !== 'string') return null;
  return card.legal.includes(cle);
}

/* Le filtre de légalité, tel que la case de la fenêtre Format le règle. */
function legaliteOK(card) {
  return !S.filtreLegal || carteLegale(card) !== false;
}

/* Ce que la collection et les suggestions retiennent : les critères de la
   fenêtre, plus la légalité. Le deck, lui, s'en tient à `carteFiltree()` —
   une carte déjà posée doit rester visible pour pouvoir être retirée, et
   `legality()` la signale. */
function carteRetenue(card) {
  return carteFiltree(card) && legaliteOK(card);
}

/* Applique les filtres avancés à une carte. */
function filtreOK(card) {
  if (!card) return false;
  return filtresValeursOK({
    name: card.name,
    type: () => card.type + ' ' + mainType(card),
    text: card.text || '',
    artist: card.artist || '',
    sets: () => setsCarte(card),
    archetypes: () => archetypesCarte(card),
    force: card.force, endurance: card.endurance, cmc: card.cmc, price: card.price
  });
}

/* Sets d'un enregistrement du catalogue : ceux que porte l'archive, réunis
   à ce que Scryfall a rapporté pour les sets déjà chargés. */
function setsRec(rec) {
  const out = new Set(String(rec[CH.SET] || '').split(',').filter(Boolean));
  if (SETS_BASE.index.size) {
    const nom = rec[CH.NOM];
    const avant = typeof frontFace === 'function' ? frontFace(nom) : nom;
    const s = SETS_BASE.index.get(norm(nom)) || SETS_BASE.index.get(norm(avant));
    if (s) s.forEach(c => out.add(c));
  }
  return [...out];
}

/* Les mêmes critères, lus sur un enregistrement du catalogue : c'est ce qui
   permet de filtrer les dizaines de milliers de cartes de l'archive sans en
   construire autant d'objets. Les rôles, eux, réclament l'analyse du texte :
   ils restent appliqués en aval, sur les seules cartes retenues. */
function filtreOKRec(rec) {
  if (!rec) return false;
  const nom = rec[CH.NOM];
  return filtresValeursOK({
    name: nom,
    type: () => (rec[CH.TYPE] || '') + ' ' + mainType({type: rec[CH.TYPE] || '', isToken: false}),
    text: rec[CH.TEXTE] || '',
    artist: rec[CH.ARTISTE] || '',
    sets: () => setsRec(rec),
    archetypes: () => {
      if (!ARCH_BASE.index.size) return [];
      const avant = typeof frontFace === 'function' ? frontFace(nom) : nom;
      const a = ARCH_BASE.index.get(norm(nom)) || ARCH_BASE.index.get(norm(avant));
      return a ? [...a] : [];
    },
    force: rec[CH.FORCE], endurance: rec[CH.ENDURANCE],
    cmc: rec[CH.CMC], price: rec[CH.PRIX]
  });
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

const CH = {NOM:0, COUT:1, TYPE:2, TEXTE:3, CMC:4, ID_COUL:5, FORCE:6, PRIX:7, ID:8, RANG:9, LEGAL:10, IMG:11, VERSO:12, ENDURANCE:13, ARTISTE:14, SET:15, NUMERIQUE:16};

const CAT = {
  etat:'', cartes:[], maj:null, source:'', octets:0, date:null, detail:'', partiel:false,
  majDispo:null, uri:'', taille:0, tailleBrute:0, impressions:0, suivi:null, ctrl:null
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
