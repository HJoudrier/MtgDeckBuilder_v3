/* =====================================================================
   js/tableReprise.js — Reprendre une partie après un rechargement

   La partie hébergée ne tient que dans la mémoire de la page : un
   rechargement, un onglet fermé par mégarde, et elle est perdue. Or le
   moteur est déterministe — même graine, mêmes fiches, mêmes réponses :
   même partie. On range donc ces trois choses dans IndexedDB à chaque
   réponse, et l'on rejoue la partie jusqu'au coup en attente. Les invités,
   eux, doivent relire un QR de reprise : leur liaison est morte avec la
   page.
   ===================================================================== */

const IDB_TABLE = 'table-partie';
let SAUVE_TABLE = null;
let TABLE_SAUVEE = null;

/* Ranger la partie, au plus une fois par seconde. */
function sauveTable() {
  if (TABLE.role !== 'hote' || !TABLE.h || !TABLE.config) return;
  clearTimeout(SAUVE_TABLE);
  SAUVE_TABLE = setTimeout(() => {
    if (!TABLE.h || TABLE.h.fini) return;
    idbEcrire(IDB_TABLE, {v: 1, date: Date.now(), ...TABLE.config, moi: TABLE.moi, reponses: TABLE.h.P.reponses,
      sieges: TABLE.sieges.map(s => ({mode: s.mode, nom: s.nom, fiches: s.fiches, arrets: s.arrets, jeton: s.jeton, cle: s.cle, confie: !!s.confie}))})
      .catch(() => {});
  }, 1000);
}

function oublieTableSauvee() {
  clearTimeout(SAUVE_TABLE);
  TABLE_SAUVEE = null;
  idbOublier(IDB_TABLE).catch(() => {});
}

/* Y a-t-il une partie interrompue ? Lu une fois au démarrage, pour que la
   section Simulation propose de la reprendre. */
async function chercheTableSauvee() {
  try { TABLE_SAUVEE = await idbLire(IDB_TABLE); } catch (e) { TABLE_SAUVEE = null; }
  if (TABLE_SAUVEE && typeof renderK === 'function') renderK();
}

/* Rejouer la partie rangée jusqu'au coup en attente, puis rendre la main. */
function reprendTable() {
  const d = TABLE_SAUVEE;
  if (!d) return;
  TABLE.distants = {};
  TABLE.sieges = d.sieges.map((s, i) => {
    const x = {...s, ia: agentIA(d.graine, i)};
    if (s.mode === 'distant') { x.etat = 'perdu'; TABLE.distants[s.cle] = x; }
    return x;
  });
  const sieges = TABLE.sieges.map(s => ({...siegeDepuisFiches(s.nom, s.fiches.format, s.fiches.cartes, s.fiches.commandants, s.fiches.comportements), nom: s.nom}));
  TABLE.config = {graine: d.graine, premier: d.premier};
  TABLE.h = creePartie({graine: d.graine, premier: d.premier, plafondTours: 60, journal: true, consigne: true, sieges});
  TABLE.agents = sieges.map(() => ({humain: true}));
  avance(TABLE.h, TABLE.agents, Infinity, null);
  for (const r of d.reponses) {
    if (TABLE.h.fini || !TABLE.h.attente) break;
    repondre(TABLE.h, TABLE.agents, r, Infinity, null);
  }
  Object.assign(TABLE, {ouverte: true, phase: 'partie', role: 'hote', moi: d.moi, question: null, erreur: '', sel: null});
  TABLE_SAUVEE = null;
  diffuseVues(true);
  boucleTable();
}
