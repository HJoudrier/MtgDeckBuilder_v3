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

const CH = {NOM:0, COUT:1, TYPE:2, TEXTE:3, CMC:4, ID_COUL:5, FORCE:6, PRIX:7, ID:8, RANG:9, LEGAL:10, IMG:11, VERSO:12};

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
