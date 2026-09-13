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

/* Ce que les préférences d'achat font au prix de tendance. Sorti de
   `cmEstimate()` pour que le pré-filtre du catalogue puisse s'en servir : il
   compare des prix bruts, là où `bestOffer()` compare des prix ajustés, et
   les deux étages écartaient des cartes à deux seuils différents — une carte
   à 5,00 € passait le premier avec un plafond à 5 €, pour être rejetée par le
   second dès que l'état recherché la portait à 6,75 €. */
function multiplicateurAchat() {
  return (COND_MULT[S.achats.condition] || 1) * (LANG_MULT[S.achats.lang] || 1)
       * (SELLER_MULT[S.achats.sellerType] || 1) * (S.achats.country === 'any' ? 1 : 1.02);
}

/* Le prix de tendance au-delà duquel l'estimation dépasserait le plafond
   par carte du deck ouvert. */
function prixBrutMax() {
  return (S.budget.perCard || 0) / (multiplicateurAchat() || 1);
}

function cmEstimate(card) {
  const base = card.price || 0;
  if (base <= 0) return null;
  return Math.max(0.02, Math.round(base * multiplicateurAchat() * 100) / 100);
}

function bestOffer(card) {
  const price = cmEstimate(card);
  if (price === null || price > S.budget.perCard) return null;
  const langLabel = (CM_LANGS.find(l => l[0] === S.achats.lang) || ['','Indifférente'])[1];
  const typeLabel = (SELLER_TYPES.find(t => t[0] === S.achats.sellerType) || ['','Indifférent'])[1];
  return {
    price,
    condition: S.achats.condition,
    lang: langLabel,
    seller: typeLabel,
    country: (CM_COUNTRIES.find(c => c[0] === S.achats.country) || ['','Indifférent'])[1],
    estimate: true
  };
}

