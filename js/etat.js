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

/* Les cinq onglets de l'atelier, dans l'ordre où ils paraissent sous
   l'entête. Chacun nomme les sections qu'il porte : c'est la seule table qui
   les répartisse, et tout le reste — la barre, le passage d'un onglet à
   l'autre, le signal d'un travail de fond — s'y réfère.

   Les propositions occupaient un seul onglet, où trois lectures d'une même
   notation se suivaient sans se distinguer : ce qui se branche sur les nœuds
   isolés du graphe, ce que les decks recensés par EDHREC recommandent, et le
   reste du catalogue. Chacune a désormais sa page — on lit le graphe sans
   dérouler trois mille vignettes, et l'on revient aux recommandations
   d'EDHREC sans les chercher. */
/* `liste` : la liste de cartes que l'onglet montre, celle que règle le bouton
   « Affichage » de l'entête (`LISTES_AFFICHAGE` plus bas). Le catalogue garde
   la clé `suggestions`, comme partout où son rangement est en jeu.

   L'onglet « Decks » n'en montre aucune — des vignettes de deck et un tableau
   d'achats ne se règlent ni en colonnes ni en groupes —, d'où son `liste`
   nul : le bouton « Affichage » s'efface alors. Il vient en tête parce qu'il
   répond à la première des questions : sur quel deck travaille-t-on. */
const ONGLETS = {
  decks:      {label:'Decks',      sections:['secI','secJ'], liste:null},
  collection: {label:'Collection', sections:['secC','secB'], liste:'collection'},
  deck:       {label:'Deck',       sections:['secE'],        liste:'deck'},
  graphe:     {label:'Graphe',     sections:['secD','secG'], liste:'graphe'},
  edhrec:     {label:'EDHREC',     sections:['secH'],        liste:'edhrec'},
  catalogue:  {label:'Catalogue',  sections:['secF'],        liste:'suggestions'}
};
const CLES_ONGLETS = Object.keys(ONGLETS);

/* L'onglet unique d'hier, tel qu'une sauvegarde le nomme encore : elle
   rouvrait sinon la collection, et l'on perdait la page qu'on regardait en
   quittant l'atelier. */
const ONGLETS_ANCIENS = {suggestions: 'graphe'};

/* Les trois sections que la notation alimente, dans l'ordre des onglets. Un
   recalcul les concerne toutes les trois à la fois : elles partagent la même
   sélection notée, et c'est cette table que le liseré de progression et le
   rendu des propositions parcourent. */
const SECTIONS_SUGGESTIONS = ['secG', 'secH', 'secF'];

/* L'onglet qui porte une section, pour les gestes qui traversent l'atelier —
   la fiche d'une carte qui renvoie au graphe, par exemple. */
function ongletDeSection(id) {
  return CLES_ONGLETS.find(cle => ONGLETS[cle].sections.includes(id)) || CLES_ONGLETS[0];
}

/* Les nombres de colonnes offerts par les grilles, zéro valant « autant que la
   largeur en permet ». Au-delà de huit, les cartes d'une grille tiendraient
   sur une vignette de timbre. */
const COLONNES = [0, 1, 2, 3, 4, 5, 6, 8];

/* Les cinq listes de cartes de l'atelier, et ce que chacune sait montrer. La
   fenêtre « Affichage » (`js/fenAffichage.js`) s'ouvre sur celle de l'onglet
   ouvert — `ONGLETS` ci-dessus dit laquelle —,
   et les quatre réglages — vue, colonnes, groupement, tri — valent pour les
   cinq. C'est cette table que « Appliquer partout » parcourt.

   `titre` nomme sa fenêtre, `libelle` la liste dans une phrase ; le catalogue
   garde la clé `suggestions`, comme partout où son rangement est en jeu. Les
   listes annexes du deck — la réserve, l'étude — suivent le deck, dont elles
   partagent le réglage. */
const LISTES_AFFICHAGE = {
  collection:  {titre:'Affichage de la collection', libelle:'la collection'},
  deck:        {titre:'Affichage du deck',          libelle:'le deck'},
  graphe:      {titre:'Affichage des pistes du graphe', libelle:'les pistes du graphe'},
  edhrec:      {titre:'Affichage des recommandations d\'EDHREC', libelle:'les recommandations d\'EDHREC'},
  suggestions: {titre:'Affichage du catalogue',     libelle:'le catalogue'}
};
const CLES_AFFICHAGE = Object.keys(LISTES_AFFICHAGE);

const RETOURNEES = new Set();
let apercuEl = null;
let apercuCardName = null;

const S = {
  collection: new Map(),
  /* Les decks, par clé, et celui sur lequel on travaille. Les trois listes
     d'un deck, son commandant, son format, son budget, ses restrictions et
     ses objectifs vivent dans son dossier ; `js/decks.js` pose sur `S` les
     propriétés d'accès — `S.deck`, `S.commander`, `S.format`, `S.budget` —
     qui les y lisent et les y écrivent, si bien que le reste de l'atelier
     n'a pas à savoir qu'il y en a plusieurs. */
  decks: {},
  deckActif: '',
  deckPlie: new Set(),       // les parties repliées de la section Deck : 'liste', 'sideboard', 'considering'
  /* Les catégories repliées des cinq listes, par clé « section|mode|groupe »
     (js/groupes.js) : le pli d'un groupement ne vaut que pour lui. */
  groupesPlies: new Set(),
  colors: new Set(['W','U','B','R','G','C']),
  colorMode: 'identity',
  custom: {deckSize:100, commander:true, maxCopies:1, colorLimits:{}},
  filtres: {nom:'', type:'', sets:'', texte:'', artiste:'', archetypes:'', roles:'', forceMin:'', forceMax:'', enduranceMin:'', enduranceMax:'', cmcMin:'', cmcMax:'', prixMin:'', prixMax:''},
  /* Le rangement des cinq listes qui montrent des cartes : chacune garde
     son groupe et son tri. Les valeurs de départ reproduisent ce que les
     sections faisaient avant tout réglage — la collection triée par coût sans
     groupe, le deck et le catalogue groupés par type. Les recommandations
     d'EDHREC arrivent sans groupe et par taux d'inclusion décroissant :
     c'est l'ordre dans lequel le site lui-même les présente. */
  groupes: {collection:'aucun', deck:'type', suggestions:'type', edhrec:'aucun', graphe:'aucun'},
  tris: {collection:'cmc', deck:'type', suggestions:'score', edhrec:'inclusion', graphe:'score'},
  /* Liste ou grille, par liste et non plus pour tout l'atelier : un seul
     champ obligeait la collection et le deck à la même vue, alors qu'on lit
     volontiers l'une en vignettes et l'autre en lignes. Les trois listes de
     propositions l'ont aussi : parcourir un classement de trois cents cartes
     en lignes tient dix fois plus de monde à l'écran que leurs vignettes. */
  vues: {collection:'grid', deck:'grid', graphe:'grid', edhrec:'grid', suggestions:'grid'},
  /* Le nombre de colonnes de chaque grille, chacune gardant le sien comme elle
     garde son groupement et son tri. Zéro laisse le navigateur en poser autant
     que la largeur en permet, ce qu'il a toujours fait ; une valeur choisie
     s'impose à toutes les largeurs, et c'est ainsi qu'on lit une carte par
     ligne sur un téléphone. Le catalogue est nommé « suggestions », comme
     partout où son rangement est en jeu. */
  colonnes: {collection:0, deck:0, graphe:0, edhrec:0, suggestions:0},
  /* Le thème sombre — le dessin d'origine de l'atelier — ou le papier clair.
     `null` tant que rien n'a été choisi : le démarrage suit alors la
     préférence du système (`js/theme.js`). */
  sombre: null,
  onglet: 'collection',      // l'onglet ouvert : une préférence d'affichage, conservée
  graphSource: 'collection',
  showImplicit: true,
  focusNodes: new Set(),
  /* Les préférences d'achat sur Cardmarket : elles disent comment on achète,
     non ce qu'on achète, et valent donc pour tous les decks à la fois. Le
     plafond et le prix maximum par carte, eux, sont une intention propre au
     deck et vivent dans son dossier (`S.budget`, par `js/decks.js`). */
  achats: {condition:'GD', lang:'any', sellerType:'any', country:'any'},
  limitB: 200,
  limiteType: {},
  exploreEtat: '',
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
  scryHS: false,
  edhrec: {slug:null, status:'idle', data:null, error:null, secondaires:[], secStatus:'idle', cmdSignature:null}
};

'WUBRG'.split('').forEach(c => S.custom.colorLimits[c] = {min:0, max:99});
