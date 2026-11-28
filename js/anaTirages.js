/* =====================================================================
   js/anaTirages.js — Ce que le hasard réserve au deck : mains, pioches, mana

   Deux outils, et la question décide lequel. La loi hypergéométrique répond
   exactement à « combien de terrains dans sept cartes » : une seule sorte de
   carte, un seul tirage. Le reste — avoir ses deux couleurs au bon tour, le
   tour où l'on dispose de quatre mana — croise trop de conditions pour une
   formule : on le joue, quelques milliers de fois. Le mélange est tiré d'une
   graine, l'empreinte du deck, si bien que deux rendus du même deck donnent les
   mêmes chiffres : un pourcentage ne tremble pas d'un geste à l'autre.

   Le commandant n'est pas dans la bibliothèque — il attend dans la zone de
   commandement — et ne se pioche donc pas. En Commander chacun pioche dès son
   premier tour (la partie est à plusieurs) ; ailleurs on suppose qu'on joue en
   premier, sans pioche au premier tour, le cas le plus dur.
   ===================================================================== */

const ANA_PARTIES = 3000;   // assez pour le pour cent près, assez peu pour rester sous 50 ms
const ANA_TOURS = 10;

/* Les factorielles en logarithme : C(99, 7) déborde déjà la précision d'un
   entier, son logarithme jamais. */
const LN_FACT = [0];
function lnFact(n) {
  for (let i = LN_FACT.length; i <= n; i++) LN_FACT[i] = LN_FACT[i - 1] + Math.log(i);
  return LN_FACT[n];
}

function lnComb(n, k) {
  if (k < 0 || k > n) return -Infinity;
  return lnFact(n) - lnFact(k) - lnFact(n - k);
}

/* La probabilité de tirer exactement k cartes d'une sorte qui en compte K,
   en n cartes prises dans N. */
function hyperP(N, K, n, k) {
  if (k < 0 || k > K || k > n || n - k > N - K) return 0;
  return Math.exp(lnComb(K, k) + lnComb(N - K, n - k) - lnComb(N, n));
}

function hyperAuMoins(N, K, n, k) {
  let p = 0;
  for (let i = Math.max(0, k); i <= Math.min(K, n); i++) p += hyperP(N, K, n, i);
  return Math.min(1, p);
}

/* La pioche du premier tour est sautée hors du Commander : on joue alors en
   premier, ce qui rend chaque chiffre un peu plus sévère. */
function piocheSautee() {
  return !fmt().commander;
}

function cartesVuesAuTour(t) {
  return 7 + t - (piocheSautee() ? 1 : 0);
}

/* La bibliothèque telle qu'on la mélange : une entrée par exemplaire, le
   commandant mis à part. */
function bibliothequeAnalyse() {
  const cmd = S.commander ? find(S.commander) : null;
  const cartes = [];
  let cmdRetire = false;
  deckEntries().forEach(e => {
    let q = e.qty;
    if (cmd && !cmdRetire && e.card.name === cmd.name) { q--; cmdRetire = true; }
    for (let i = 0; i < q; i++) cartes.push(e.card);
  });
  return {cartes, commandant: cmdRetire ? cmd : null};
}

/* Les symboles pleins d'une couleur : un hybride se paie d'une autre façon et
   un symbole phyrexian de points de vie, ni l'un ni l'autre n'oblige à avoir
   la couleur. C'est la mesure qui décide si un sort reste en main. */
function pipsPleins(card) {
  const o = {};
  (card && card.symbols || []).forEach(s => {
    const c = String(s).slice(1, -1).toUpperCase();
    if (c.length === 1 && 'WUBRG'.includes(c)) o[c] = (o[c] || 0) + 1;
  });
  return o;
}

/* Une graine tirée d'un texte, puis le générateur mulberry32 : court, rapide,
   et assez uniforme pour mélanger un deck. */
function graineDe(texte) {
  let h = 2166136261;
  for (let i = 0; i < texte.length; i++) { h ^= texte.charCodeAt(i); h = Math.imul(h, 16777619); }
  return h >>> 0;
}

function hasardGraine(graine) {
  let a = graine >>> 0;
  return () => {
    a = (a + 0x6D2B79F5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function melanger(liste, hasard) {
  for (let i = liste.length - 1; i > 0; i--) {
    const j = Math.floor(hasard() * (i + 1));
    const x = liste[i]; liste[i] = liste[j]; liste[j] = x;
  }
  return liste;
}

/* Ce qu'un accélérateur ajoute aux tours suivants, une fois lancé. Un rituel
   ne dure qu'un tour et n'accélère pas la mise en place : il ne compte pas.
   Un sort qui va chercher des terrains en pose un, ou deux s'il le dit ; une
   permanente ajoute ce que sa clause « add » énumère, un mana par défaut. */
function apportRampe(card) {
  if (!card || card.isLand || !card.cats || !card.cats.has('ramp')) return 0;
  const tx = String(card.text || '').toLowerCase();
  if (/instant|sorcery/i.test(card.type)) {
    if (!/search your library for[^.]*lands?\b/.test(tx)) return 0;
    return /two basic land cards?[^.]*onto the battlefield/.test(tx) ? 2 : 1;
  }
  const clause = tx.match(/\badd ((?:\{[^}]+\})+)/);
  return clause ? Math.min(3, (clause[1].match(/\{/g) || []).length) : 1;
}

/* Le profil de mise en place, joué ANA_PARTIES fois sans adversaire : chaque
   tour on pioche, on pose un terrain si la main en a, puis on lance les
   accélérateurs que le mana du tour paie, du moins cher au plus cher. Tout ce
   qu'ils produisent arrive au tour suivant — une simplification qui rend la
   mesure un peu prudente pour un Sol Ring, juste pour un elfe.

   On relève en même temps, tour par tour, ce que les cartes vues apportent en
   terrains et en sources de chaque couleur : c'est de quoi juger, pour chaque
   carte, si elle se lance au tour que dit son coût. Un accélérateur ne compte
   comme source que s'il coûte deux ou moins : plus cher, il arrive trop tard
   pour payer ce qu'on voulait lancer à côté. */
function simuleMiseEnPlace(lib, cmd, cartesJugees) {
  const N = lib.length;
  const res = {parties:0, mana:new Array(ANA_TOURS + 1).fill(0), atteint4:0, atteint6:0,
    tour4:0, tour6:0, premier4:new Array(ANA_TOURS + 1).fill(0), premier6:new Array(ANA_TOURS + 1).fill(0), rate:new Array(ANA_TOURS + 1).fill(0), cmdATemps:0, aTemps:new Map()};
  if (N < 8) return res;
  const hasard = hasardGraine(graineDe(deckSignature() + '|' + S.format));
  const saute = piocheSautee();
  const sources = lib.map(c => manaProduitDe(c).replace('C', ''));
  const rampe = lib.map(apportRampe);
  const jugees = cartesJugees.map(c => ({c, pips:pipsPleins(c), t:Math.max(1, c.cmc), ok:0}));
  const ordre = lib.map((_, i) => i);

  for (let g = 0; g < ANA_PARTIES; g++) {
    melanger(ordre, hasard);
    const main = ordre.slice(0, 7);
    let tire = 7, terrains = 0, rampeEnJeu = 0, aVenir = 0, vu4 = 0, vu6 = 0;
    /* Les cartes vues jusqu'à chaque tour, réduites à leurs sources. */
    const vusCouleurs = [], dispoTour = [];
    const nC = {W:0, U:0, B:0, R:0, G:0};
    const compte = i => {
      const c = lib[i];
      if (sources[i] && (c.isLand || c.cmc <= 2)) for (const x of sources[i]) if (x in nC) nC[x]++;
    };
    main.forEach(compte);
    for (let t = 1; t <= ANA_TOURS; t++) {
      if ((t > 1 || !saute) && tire < N) { main.push(ordre[tire]); compte(ordre[tire]); tire++; }
      vusCouleurs[t] = {...nC};
      const iT = main.findIndex(i => lib[i].isLand);
      if (iT >= 0) { main.splice(iT, 1); terrains++; }
      if (terrains < t) res.rate[t]++;
      rampeEnJeu += aVenir; aVenir = 0;
      const dispo = terrains + rampeEnJeu;
      dispoTour[t] = dispo;
      res.mana[t] += dispo;
      if (!vu4 && dispo >= 4) { vu4 = t; res.atteint4++; res.tour4 += t; res.premier4[t]++; }
      if (!vu6 && dispo >= 6) { vu6 = t; res.atteint6++; res.tour6 += t; res.premier6[t]++; }
      if (cmd && t === Math.max(1, cmd.cmc) && dispo >= cmd.cmc) res.cmdATemps++;
      let reste = dispo;
      main.map(i => i).filter(i => rampe[i] > 0).sort((a, b) => lib[a].cmc - lib[b].cmc).forEach(i => {
        if (lib[i].cmc > reste) return;
        reste -= lib[i].cmc;
        aVenir += rampe[i];
        main.splice(main.indexOf(i), 1);
      });
    }
    /* Une carte se lance à temps si, au tour de son coût, la partie dispose
       d'assez de mana pour la payer — terrains posés et accélérateurs lancés —
       et qu'on a vu assez de sources de chacune de ses couleurs. */
    jugees.forEach(j => {
      const t = Math.min(ANA_TOURS, j.t);
      if (dispoTour[t] < j.c.cmc) return;
      for (const c in j.pips) if (vusCouleurs[t][c] < j.pips[c]) return;
      j.ok++;
    });
    res.parties++;
  }
  jugees.forEach(j => res.aTemps.set(j.c.name, j.ok / res.parties));
  return res;
}

/* La simulation ne se refait que si le deck a changé : un filtre, un pli, un
   changement d'onglet repeignent l'analyse sans rien rejouer. */
let ANA_CACHE_SIM = {cle:'', res:null};

function miseEnPlaceDuDeck(lib, cmd) {
  const cle = deckSignature() + '|' + S.format;
  if (ANA_CACHE_SIM.cle === cle && ANA_CACHE_SIM.res) return ANA_CACHE_SIM.res;
  const jugees = [...new Map(lib.filter(c => !c.isLand).map(c => [c.name, c])).values()];
  if (cmd) jugees.push(cmd);
  const res = simuleMiseEnPlace(lib, cmd, jugees);
  ANA_CACHE_SIM = {cle, res};
  return res;
}

/* Le nombre de sources qu'il faudrait pour lancer à temps, neuf fois sur dix,
   la carte la plus exigeante d'une couleur — la méthode que Frank Karsten a
   popularisée, recalculée pour ce deck. Comme lui, on juge la couleur sachant
   qu'on a posé ses terrains : une main sans terrain est un problème de nombre
   de terrains, non de couleurs, et le compter ici réclamerait des sources
   qu'aucun deck ne peut loger. Les sources sont prises parmi les terrains ;
   trois paquets — terrains de la couleur, autres terrains, sorts — et la loi
   hypergéométrique à deux variables. `null` : aucun nombre ne suffit. */
function sourcesRecommandees(N, L, pips, tour) {
  const n = Math.min(N, cartesVuesAuTour(tour));
  const besoin = Math.min(tour, n);
  const lnTot = lnComb(N, n);
  for (let K = pips; K <= L; K++) {
    let assez = 0, poses = 0;
    for (let c = 0; c <= Math.min(K, n); c++) {
      for (let o = 0; o <= Math.min(L - K, n - c); o++) {
        if (c + o < besoin) continue;
        const p = Math.exp(lnComb(K, c) + lnComb(L - K, o) + lnComb(N - L, n - c - o) - lnTot);
        poses += p;
        if (c >= pips) assez += p;
      }
    }
    if (poses > 0 && assez / poses >= 0.9) return K;
  }
  return null;
}

/* La part des parties qui ont atteint un seuil au plus tard au tour dit. */
function partAtteinteAuTour(premiers, tour, parties) {
  if (!parties) return 0;
  let n = 0;
  for (let t = 1; t <= Math.min(tour, premiers.length - 1); t++) n += premiers[t];
  return n / parties;
}
