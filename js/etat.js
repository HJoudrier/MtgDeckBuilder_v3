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
  custom: {size:100, commander:true, maxCopies:1, colorLimits:{}},
  search: '',
  typeFilter: '',
  filtres: {nom:'', forceMin:'', forceMax:'', enduranceMin:'', enduranceMax:'', cmcMin:'', cmcMax:'', prixMin:'', prixMax:''},
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
  filtreRole: null,
  exploreEtat: '',
  exploreSig: null,
  exploreMax: 6000,
  exploreTotal: 0,
  exploreCharge: 0,
  exploreReste: false,
  catalogueActif: true,
  prixMaj: null,
  enriching: false,
  images: true,
  imagesFailed: false,
  edhrec: {slug:null, status:'idle', data:null, error:null, secondaires:[], secStatus:'idle', cmdSignature:null},
  csb: {sig:null, status:'idle', data:null, error:null},
  csbRelay: '',
  headerCompact: (typeof localStorage !== 'undefined' && localStorage.getItem('mtg_compact_header') === '1') || (typeof window !== 'undefined' && window.innerWidth <= 640)
};

'WUBRG'.split('').forEach(c => S.custom.colorLimits[c] = {min:0, max:99});

/* ---------------------------------------------------------------------
   Filtres de la fenêtre « Filtres » (en-tête) : recherche libre, type de
   carte, nom, force, endurance, coût de mana et prix. Chaque champ vide
   est neutre. La recherche et le type vivent dans `S.search` et
   `S.typeFilter` ; les autres critères dans `S.filtres`.
   --------------------------------------------------------------------- */

const FILTRES_VIDE = {
  nom:'', forceMin:'', forceMax:'', enduranceMin:'', enduranceMax:'',
  cmcMin:'', cmcMax:'', prixMin:'', prixMax:''
};

/* Bornes numériques : [clé min, clé max, champ de la carte, libellé]. */
const FILTRES_BORNES = [
  ['forceMin', 'forceMax', 'force', 'Force'],
  ['enduranceMin', 'enduranceMax', 'endurance', 'Endurance'],
  ['cmcMin', 'cmcMax', 'cmc', 'Coût de mana'],
  ['prixMin', 'prixMax', 'price', 'Prix']
];

function nombreFiltre(v) {
  if (v === '' || v === null || v === undefined) return null;
  const n = parseFloat(String(v).replace(',', '.'));
  return isNaN(n) ? null : n;
}

function reinitFiltres() {
  S.filtres = {...FILTRES_VIDE};
  S.search = '';
  S.typeFilter = '';
}

/* Écrit un champ de la fenêtre dans l'état, quelle que soit sa maison. */
function majFiltre(cle, valeur) {
  if (cle === 'search') S.search = valeur;
  else if (cle === 'typeFilter') S.typeFilter = valeur;
  else if (cle in FILTRES_VIDE) S.filtres[cle] = valeur;
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
  const recherche = String(S.search || '').trim();
  if (recherche) actifs.push({cles:['search'], texte:`Recherche « ${recherche} »`});
  if (S.typeFilter) actifs.push({cles:['typeFilter'], texte:`Type : ${S.typeFilter}`});
  const nom = String(f.nom || '').trim();
  if (nom) actifs.push({cles:['nom'], texte:`Nom « ${nom} »`});
  FILTRES_BORNES.forEach(([kMin, kMax, champ, label]) => {
    const min = nombreFiltre(f[kMin]), max = nombreFiltre(f[kMax]);
    if (min === null && max === null) return;
    const unite = champ === 'price' ? ' €' : '';
    const texte = (min !== null && max !== null) ? `${label} ${min}${unite} → ${max}${unite}`
      : (min !== null ? `${label} ≥ ${min}${unite}` : `${label} ≤ ${max}${unite}`);
    actifs.push({cles:[kMin, kMax], texte});
  });
  return actifs;
}

/* Libellés seuls, pour les infobulles et les phrases de résumé. */
function texteFiltresActifs(sep) {
  return filtresActifs().map(a => a.texte).join(sep || ' · ');
}

/* Applique les filtres avancés à une carte. Une carte dont la valeur est
   inconnue (créature non renseignée, prix absent) est écartée dès qu'une
   borne est posée sur ce critère. */
function filtreOK(card) {
  if (!card) return false;
  const f = S.filtres || FILTRES_VIDE;
  const nom = String(f.nom || '').trim();
  if (nom && !norm(card.name).includes(norm(nom))) return false;
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

function seedCollection() {
  DB.forEach(c => {
    let q = c.price > 20 ? 1 : (c.price > 6 ? 2 : 3);
    if (/^basic land/i.test(c.type)) q = 12;
    S.collection.set(c.name, q);
  });
}

function fmt() {
  const f = FORMATS[S.format];
  return S.format === 'perso'
    ? {label:'Personnalisé', size:S.custom.size, commander:S.custom.commander, maxCopies:S.custom.maxCopies, lands:Math.round(S.custom.size*0.36)}
    : f;
}

function eur(n) {
  return (Math.round(n*100)/100).toLocaleString('fr-FR', {minimumFractionDigits:2, maximumFractionDigits:2}) + ' €';
}

function esc(s) {
  return String(s).replace(/[&<>"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
}

const CH = {NOM:0, COUT:1, TYPE:2, TEXTE:3, CMC:4, ID_COUL:5, FORCE:6, PRIX:7, ID:8, RANG:9, LEGAL:10, IMG:11, VERSO:12, ENDURANCE:13};

const CAT = {
  etat:'', cartes:[], maj:null, source:'', octets:0, date:null, detail:'', partiel:false,
  majDispo:null, uri:'', taille:0, impressions:0
};

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
  rec._card = card;
  return card;
}

function recToucheNoeuds(rec, noeuds) {
  if (!noeuds || !noeuds.length) return true;
  const card = getCardOrAnalyzedRec(rec);
  return carteTouche(card, noeuds);
}

function withFocus(fn) {
  const active = document.activeElement;
  const selStart = (active && typeof active.selectionStart === 'number') ? active.selectionStart : null;
  const selEnd = (active && typeof active.selectionEnd === 'number') ? active.selectionEnd : null;
  const id = active && active.id;
  fn();
  if (id) {
    const el = document.getElementById(id);
    if (el) {
      el.focus();
      if (selStart !== null && selEnd !== null) {
        try { el.setSelectionRange(selStart, selEnd); } catch(e) {}
      }
    }
  }
}
