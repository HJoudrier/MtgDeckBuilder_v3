/* =====================================================================
   js/simulation.js — Un lot de parties, par tranches

   Le lot se joue dans la page — un Worker ne se lance pas depuis
   `file://` —, par tranches de vingt-cinq millisecondes : le pilote rend la
   main au milieu d'une partie quand son budget est épuisé
   (`avance()`, js/jeuPilote.js), et la page se repeint entre deux. La main
   est rendue par un `MessageChannel` et non par `setTimeout` : un onglet en
   arrière-plan ralentit les minuteries enchaînées à une par seconde, pas
   les messages.

   Les places tournent d'une partie à l'autre, si bien que chaque deck
   commence autant de fois ; la graine de la partie g ne dépend que de la
   graine du lot et de g, si bien que deux decks testés sur la même table
   affrontent les mêmes mélanges — des comparaisons appariées.
   ===================================================================== */

const MOTEUR_V = 'm1-c' + COMPILO_V;
const SIM = {etat: '', fait: 0, total: 0, arret: false, debut: 0, message: ''};

function rendMain() {
  return new Promise(ok => { const c = new MessageChannel(); c.port1.onmessage = () => ok(); c.port2.postMessage(0); });
}

/* La configuration du lot, bornée et complétée. */
function configSimulation() {
  const c = S.simulation;
  const deck = S.decks[c.deck] ? c.deck : S.deckActif;
  const nb = Math.max(2, Math.min(6, +c.nbJoueurs || 2));
  const sieges = Array.from({length: nb - 1}, (_, i) => S.adversaires[c.sieges[i]] ? c.sieges[i] : '');
  return {deck, nbJoueurs: nb, sieges, parties: Math.max(1, Math.min(2000, +c.parties || 100)),
    graine: (+c.graine || 1) >>> 0, plafond: Math.max(5, Math.min(60, +c.plafond || 25))};
}

/* Ce qui empêche de lancer, en une phrase, ou rien. */
function obstacleSimulation(cfg) {
  if (!S.decks[cfg.deck] || !S.decks[cfg.deck].deck.size) return 'Le deck testé est vide.';
  if (cfg.sieges.some(k => !k)) return 'Choisissez un adversaire pour chaque siège.';
  return '';
}

/* La table d'une partie : le deck assis à chaque siège. */
function placesPartie(N, g) {
  const rot = g % N;
  return Array.from({length: N}, (_, k) => (k + rot) % N);
}

function graineDePartie(graine, g) { return brasse(graine, g + 1); }

function majProgressionSim() {
  const b = document.getElementById('simBarre'), t = document.getElementById('simTexte');
  const pct = SIM.total ? Math.round(SIM.fait / SIM.total * 100) : 0;
  if (b) b.style.width = pct + '%';
  if (t) t.textContent = SIM.etat === 'prepare' ? SIM.message
    : `${SIM.fait} / ${SIM.total} parties (${pct} %) — ${Math.round((Date.now() - SIM.debut) / 1000)} s`;
}

/* Lancer un lot. Une erreur de préparation ne doit pas laisser la section
   figée sur « préparation » : elle est dite, et la table rendue. */
async function lanceSimulation() {
  if (SIM.etat === 'encours' || SIM.etat === 'prepare') return;
  try { await joueLot(); } catch (e) {
    SIM.etat = 'erreur';
    signalerTravail('secK', false);
    toast('La simulation a échoué : ' + (e && e.message ? e.message : e));
    renderK();
  }
}

async function joueLot() {
  const cfg = configSimulation();
  const obstacle = obstacleSimulation(cfg);
  if (obstacle) { toast(obstacle); return; }
  Object.assign(SIM, {etat: 'prepare', fait: 0, total: 0, arret: false, debut: Date.now(), message: 'Préparation des decks…'});
  renderK();
  await chargeSimCartes();
  const manquants = nomsManquants(cfg);
  if (manquants.length) {
    SIM.message = `${manquants.length} carte(s) demandée(s) à Scryfall…`;
    majProgressionSim();
    await chercheFichesScryfall(manquants);
  }
  const sieges = [siegeDeck(cfg.deck), ...cfg.sieges.map(siegeAdversaire)];
  const N = sieges.length, total = Math.ceil(cfg.parties / N) * N;
  Object.assign(SIM, {etat: 'encours', total, debut: Date.now()});
  renderK();
  signalerTravail('secK', true, 'Simulation en cours');
  const recs = [], horloge = () => performance.now();
  let g = 0, h = null, agents = null, places = null;
  while (g < total && !SIM.arret) {
    if (!h) {
      places = placesPartie(N, g);
      const graine = graineDePartie(cfg.graine, g);
      h = creePartie({graine, premier: 0, plafondTours: cfg.plafond, sieges: places.map(t => sieges[t])});
      agents = places.map((_, k) => agentIA(graine, k));
    }
    const r = avance(h, agents, 25, horloge);
    if (r === 'finie' || r === 'erreur') {
      recs.push(mesuresPartie(h.P, places, g));
      h = null; g++; SIM.fait = g;
      majProgressionSim();
    }
    await rendMain();
  }
  terminerLot(cfg, sieges, recs);
}

/* Ranger le lot qui vient de finir, ou d'être arrêté. */
function terminerLot(cfg, sieges, recs) {
  signalerTravail('secK', false);
  const arrete = SIM.arret;
  SIM.etat = arrete ? 'arrete' : 'fini';
  if (recs.length) {
    const terrains = sieges[0].cartes.filter(c => c.def.types.includes('land')).map(c => c.def.nom);
    const lot = {id: 'l-' + Date.now().toString(36), date: Date.now(), moteur: MOTEUR_V,
      deck: cfg.deck, deckNom: S.decks[cfg.deck].nom, sigDeck: signatureDeck(cfg.deck),
      adversaires: cfg.sieges.slice(), advNoms: cfg.sieges.map(k => S.adversaires[k].nom),
      sigAdv: cfg.sieges.map(k => signatureAdversaire(S.adversaires[k])), sigComp: signatureComportements(),
      nbJoueurs: sieges.length, graine: cfg.graine, plafond: cfg.plafond, arrete,
      couvertures: sieges.map(s => ({taux: s.couverture.taux, injouable: s.couverture.injouable, manquantes: s.manquantes.length})),
      fiabilite: fiabilite(sieges.map(s => s.couverture)),
      resume: agrege(recs, sieges.length, terrains),
      parties: recs.map(r => [r.g, r.pos, r.res, r.gagnant, r.rondes])};
    ajouteLot(lot);
    toast(`${recs.length} parties jouées : ${Math.round(lot.resume.taux * 100)} % de victoires.`);
  }
  renderK();
}

function arreteSimulation() { if (SIM.etat === 'encours') SIM.arret = true; }

/* Rejouer une partie d'un lot, journal ouvert. `null` si le lot est
   périmé : la même graine ne rejouerait plus la même partie. */
function rejouePartie(lot, k) {
  if (lotPerime(lot)) return null;
  const [g] = lot.parties[k];
  const sieges = [siegeDeck(lot.deck), ...lot.adversaires.map(siegeAdversaire)];
  const N = sieges.length, places = placesPartie(N, g), graine = graineDePartie(lot.graine, g);
  const P = joueJusquauBout({graine, premier: 0, plafondTours: lot.plafond, journal: true,
    sieges: places.map(t => sieges[t])}, places.map((_, s) => agentIA(graine, s)));
  return {P, places, noms: sieges.map(s => s.nom)};
}
