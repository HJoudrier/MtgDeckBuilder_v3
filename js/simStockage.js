/* =====================================================================
   js/simStockage.js — Les résultats des lots, gardés et comparés

   Un lot laisse un résumé — ses agrégats, sa configuration, ses
   signatures — et la liste de ses parties en quelques nombres, de quoi en
   rejouer une. Ni les journaux ni les compteurs bruts : une partie se
   revoit en la rejouant depuis sa graine. Le tout vit dans IndexedDB, que
   `idbVider()` épargne : décocher l'archivage du catalogue ne doit pas
   effacer des heures de simulation.
   ===================================================================== */

const IDB_SIM_RESULTATS = 'sim-resultats';
const LOTS_GARDES = 40;
const SIM_RES = {charge: false, lots: [], vu: null};

async function chargeResultats() {
  if (SIM_RES.charge) return;
  SIM_RES.charge = true;
  try {
    const d = await idbLire(IDB_SIM_RESULTATS);
    if (d && Array.isArray(d.lots)) SIM_RES.lots = d.lots;
  } catch (e) { /* IndexedDB absent : les résultats ne vivront que le temps de la séance. */ }
}

function rangeResultats() {
  return idbEcrire(IDB_SIM_RESULTATS, {v: 1, lots: SIM_RES.lots}).catch(() => {});
}

function ajouteLot(lot) {
  SIM_RES.lots.unshift(lot);
  SIM_RES.lots = SIM_RES.lots.slice(0, LOTS_GARDES);
  SIM_RES.vu = lot.id;
  rangeResultats();
}

function supprimeLot(id) {
  SIM_RES.lots = SIM_RES.lots.filter(l => l.id !== id);
  if (SIM_RES.vu === id) SIM_RES.vu = null;
  rangeResultats();
}

function lotParId(id) { return SIM_RES.lots.find(l => l.id === id) || null; }

/* Un lot est périmé quand le deck, un adversaire, un comportement manuel ou
   le moteur ont changé depuis : ses chiffres restent lisibles, mais ses
   parties ne se rejouent plus à l'identique. */
function lotPerime(lot) {
  if (lot.moteur !== MOTEUR_V) return 'moteur';
  if (!S.decks[lot.deck] || signatureDeck(lot.deck) !== lot.sigDeck) return 'deck';
  if (lot.adversaires.some((k, i) => !S.adversaires[k] || signatureAdversaire(S.adversaires[k]) !== lot.sigAdv[i])) return 'adversaire';
  if (lot.sigComp !== signatureComportements()) return 'comportements';
  return '';
}

/* La table d'un lot, sans le deck testé : deux lots sur la même table se
   comparent. */
function cleTable(lot) { return lot.nbJoueurs + ':' + lot.adversaires.slice().sort().join(','); }

/* Le classement des decks sur une table : le dernier lot de chaque deck,
   du plus fort au plus faible. */
function classement(table) {
  const vus = new Map();
  SIM_RES.lots.filter(l => cleTable(l) === table).forEach(l => { if (!vus.has(l.deck)) vus.set(l.deck, l); });
  return [...vus.values()].sort((a, b) => b.resume.indice - a.resume.indice);
}
