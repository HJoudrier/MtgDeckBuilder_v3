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
const ONGLETS = {
  collection: {label:'Collection', sections:['secC','secB']},
  deck:       {label:'Deck',       sections:['secE']},
  graphe:     {label:'Graphe',     sections:['secD','secG']},
  edhrec:     {label:'EDHREC',     sections:['secH']},
  catalogue:  {label:'Catalogue',  sections:['secF']}
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
   fenêtre « Affichage » (`js/fenAffichage.js`) s'ouvre au-dessus de chacune
   et n'y propose que ce qu'elle offre : la collection et le deck se lisent en
   liste ou en grille, les trois listes de propositions n'ont que leurs
   vignettes. Le reste — colonnes, groupement, tri — vaut partout, et c'est
   cette table que « Appliquer partout » parcourt.

   `titre` nomme sa fenêtre, `libelle` la liste dans une phrase ; le catalogue
   garde la clé `suggestions`, comme partout où son rangement est en jeu. Les
   listes annexes du deck — la réserve, l'étude — suivent le deck, dont elles
   partagent le réglage. */
const LISTES_AFFICHAGE = {
  collection:  {titre:'Affichage de la collection', libelle:'la collection', vue:true},
  deck:        {titre:'Affichage du deck',          libelle:'le deck',       vue:true},
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
  deck: new Map(),
  sideboard: new Map(),      // la réserve, hors de la liste principale
  considering: new Map(),    // les cartes à l'étude, hors de la liste principale
  deckPlie: new Set(),       // les parties repliées de la section Deck : 'liste', 'sideboard', 'considering'
  /* Les catégories repliées des cinq listes, par clé « section|mode|groupe »
     (js/groupes.js) : le pli d'un groupement ne vaut que pour lui. */
  groupesPlies: new Set(),
  commander: null,
  /* Les créatures légendaires du deck qu'on ne veut pas voir traitées comme
     commandants par EDHREC : la liste se coche et se décoche dans l'onglet
     EDHREC. Ce sont les écartées qu'on retient, non les retenues — le deck
     change, et une carte qu'on n'a jamais décochée doit compter dès qu'elle
     arrive. */
  secondairesOff: new Set(),
  colors: new Set(['W','U','B','R','G','C']),
  colorMode: 'identity',
  format: 'edh',
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
     propositions n'y figurent pas : leurs vignettes n'ont pas de forme en
     ligne, et `LISTES_AFFICHAGE` le dit. */
  vues: {collection:'grid', deck:'grid'},
  /* Le nombre de colonnes de chaque grille, chacune gardant le sien comme elle
     garde son groupement et son tri. Zéro laisse le navigateur en poser autant
     que la largeur en permet, ce qu'il a toujours fait ; une valeur choisie
     s'impose à toutes les largeurs, et c'est ainsi qu'on lit une carte par
     ligne sur un téléphone. Le catalogue est nommé « suggestions », comme
     partout où son rangement est en jeu. */
  colonnes: {collection:0, deck:0, graphe:0, edhrec:0, suggestions:0},
  onglet: 'collection',      // l'onglet ouvert : une préférence d'affichage, conservée
  graphSource: 'collection',
  showImplicit: true,
  focusNodes: new Set(),
  /* Budget nul au démarrage : l'atelier ne propose alors que les cartes de la
     collection, et n'engage aucun achat tant qu'un budget n'a pas été fixé
     dans la fenêtre « Achats sur Cardmarket ». Le prix maximum par carte, lui,
     est déjà posé : il n'attend que le budget pour valoir. */
  budget: {total:0, perCard:5, condition:'GD', lang:'any', sellerType:'any', country:'any'},
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
