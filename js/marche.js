/* =====================================================================
   js/marche.js — Marché Cardmarket, estimations & panier d'achat
   ===================================================================== */

const CONDITIONS = [
  ['MT','Mint'], ['NM','Near Mint'], ['EX','Excellent'], ['GD','Good'],
  ['LP','Light Played'], ['PL','Played'], ['PO','Poor']
];
const COND_MULT = {MT:1.35, NM:1.15, EX:1.00, GD:0.88, LP:0.78, PL:0.68, PO:0.50};

const CM_LANGS = [
  ['any','Indifférente'], ['FR','Français'], ['EN','Anglais'], ['DE','Allemand'],
  ['ES','Espagnol'], ['IT','Italien'], ['JP','Japonais']
];
const LANG_MULT = {any:1, FR:1.06, EN:1.00, DE:0.98, ES:0.95, IT:0.95, JP:1.12};

const SELLER_TYPES = [
  ['any','Indifférent'], ['private','Particulier'], ['commercial','Professionnel'], ['powerseller','Powerseller']
];
const SELLER_MULT = {any:1, private:0.97, commercial:1.05, powerseller:1.03};

const CM_COUNTRIES = [
  ['any','Indifférent'], ['FR','France'], ['BE','Belgique'], ['DE','Allemagne'],
  ['ES','Espagne'], ['IT','Italie'], ['NL','Pays-Bas']
];

function cmLink(card) {
  return card.cmUrl || 'https://www.cardmarket.com/fr/Magic/Products/Search?searchString=' + encodeURIComponent(card.name);
}

function cmEstimate(card) {
  const base = card.price || 0;
  if (base <= 0) return null;
  const m = (COND_MULT[S.budget.condition] || 1) * (LANG_MULT[S.budget.lang] || 1)
          * (SELLER_MULT[S.budget.sellerType] || 1) * (S.budget.country === 'any' ? 1 : 1.02);
  return Math.max(0.02, Math.round(base * m * 100) / 100);
}

function bestOffer(card) {
  const price = cmEstimate(card);
  if (price === null || price > S.budget.perCard) return null;
  const langLabel = (CM_LANGS.find(l => l[0] === S.budget.lang) || ['','Indifférente'])[1];
  const typeLabel = (SELLER_TYPES.find(t => t[0] === S.budget.sellerType) || ['','Indifférent'])[1];
  return {
    price,
    condition: S.budget.condition,
    lang: langLabel,
    seller: typeLabel,
    country: (CM_COUNTRIES.find(c => c[0] === S.budget.country) || ['','Indifférent'])[1],
    estimate: true
  };
}

function spent() {
  return aAcheter().reduce((t, l) => t + l.total, 0);
}

function aAcheter() {
  const out = [];
  deckEntries().forEach(e => {
    const manque = e.qty - (S.collection.get(e.card.name) || 0);
    if (manque > 0) {
      const prix = cmEstimate(e.card);
      out.push({card:e.card, qty:manque, prix:prix||0, total:(prix||0)*manque, inconnu:prix===null});
    }
  });
  return out.sort((a, b) => b.total - a.total);
}
