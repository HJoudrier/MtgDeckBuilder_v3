/* =====================================================================
   js/stockage.js — La sauvegarde locale

   Tout tient dans `localStorage`, sauf l'archive du catalogue qui dort dans
   IndexedDB. `snapshot()` dit ce qui est conservé, `restore()` le relit — et
   sait relire une sauvegarde d'hier, qui ne porte pas les champs d'aujourd'hui.
   L'écriture est différée de 700 ms : un geste en chasse un autre, et l'on
   n'écrit qu'une fois.
   ===================================================================== */

const STORE_KEY = 'mtg-atelier-v1';
const STORE_OFF = 'mtg-atelier-sans-sauvegarde';

const storageOK = (() => {
  try {
    localStorage.setItem('__mtg_test', '1');
    localStorage.removeItem('__mtg_test');
    return true;
  } catch(e) {
    return false;
  }
})();

let saveTimer = null;
let saveState = storageOK ? 'ok' : 'off';
let saveError = '';
let dernierEtatSignale = 'ok';

/* Éditions relevées à l'import : le code d'édition et le numéro de
   collection de l'impression possédée, et la liste de celles qui ont été
   vues. Sans eux, un rechargement rendrait à la carte un visuel et un prix
   d'une autre impression. */
function impressionSnap(c) {
  if (!c.set && !(c.impressions && c.impressions.length)) return {};
  return {
    se: c.set || '', nu: c.num || '', sn: c.setName || '',
    si: c.setImporte ? 1 : 0, ii: c.imgImpression || '', ch: c.impressionChoisie || '',
    im: (c.impressions || []).map(i => [i.set, i.num, i.qty])
  };
}

function impressionRestore(card, o) {
  if (o.se) card.set = o.se;
  if (o.nu) card.num = o.nu;
  if (o.sn) card.setName = o.sn;
  if (o.si) card.setImporte = true;
  if (o.ii) card.imgImpression = o.ii;
  if (o.ch) card.impressionChoisie = o.ch;
  if (Array.isArray(o.im) && o.im.length)
    card.impressions = o.im.map(([set, num, qty]) => ({set, num, qty}));
}

function snapshot() {
  const cartes = [], enrich = [];
  DB.forEach(c => {
    const base = BUILTIN.has(norm(c.name));
    if (base) {
      if (c.img || c.cmUrl || c.artist || c.textFull || c.set || c.manaProduit) enrich.push({n:c.name, p:c.price, g:c.img||'', G:c.imgN||'', L:c.imgL||'', u:c.cmUrl||'', a:c.artist||'', x:c.textFull ? c.text : '', ...(c.manaProduit ? {mp:c.manaProduit} : {}), ...impressionSnap(c)});
    } else if (c.externe && !(S.collection.get(c.name) > 0) && !carteDansUnDeck(c.name)) {
      // vivier d'exploration : non conservé
    } else {
      cartes.push({
        n:c.name, c:c.cost||'—', t:c.type, p:c.price, x:c.text,
        i:(c.identity||[]).join(''), m:c.cmc, f:c.force, e:c.endurance, a:c.artist||'',
        g:c.img||'', G:c.imgN||'', L:c.imgL||'', B:c.imgB||'', BL:c.imgBL||'',
        u:c.cmUrl||'', k:c.unknown?1:0, X:c.textFull?1:0,
        ...(c.manaProduit ? {mp:c.manaProduit} : {}),
        ...(typeof c.legal === 'string' ? {lg:c.legal} : {}), ...impressionSnap(c)
      });
    }
  });

  return {
    v: 1,
    date: Date.now(),
    collection: [...S.collection],
    decks: clesDecks().map(deckSnap),
    deckActif: S.deckActif,
    achats: S.achats,
    /* Le temps d'une version, le deck ouvert est aussi recopié sous les
       anciennes clés. Le marqueur `v` reste à 1 — le passer à 2 ferait qu'un
       atelier resté sur le code d'hier rejetterait la sauvegarde, puis
       l'écraserait par un état vide à la première sauvegarde différée ; ces
       quelques centaines d'octets lui rendent son deck au lieu d'une page
       vide. Rien ici ne les relit : `restore()` part de `decks`. */
    deck: [...S.deck],
    sideboard: [...S.sideboard],
    considering: [...S.considering],
    commander: S.commander,
    format: S.format,
    budget: {...S.budget, ...S.achats},
    ciblesRoles: S.ciblesRoles,
    secondairesOff: [...S.secondairesOff],
    deckPlie: [...S.deckPlie],
    groupesPlies: [...S.groupesPlies],
    colors: [...S.colors],
    colorMode: S.colorMode,
    custom: S.custom,
    colonnes: {...S.colonnes},
    groupes: S.groupes,
    tris: S.tris,
    filtres: S.filtres,
    vues: {...S.vues},
    sombre: S.sombre,
    onglet: S.onglet,
    graphSource: S.graphSource,
    showImplicit: S.showImplicit,
    candidatsMax: S.candidatsMax,
    catalogueNumeriques: S.catalogueNumeriques,
    filtreLegal: S.filtreLegal,
    catalogueActif: S.catalogueActif,
    prixMaj: S.prixMaj,
    majIgnoree: S.majIgnoree,
    cartes,
    enrich
  };
}

function ecrire(payload) {
  localStorage.setItem(STORE_KEY, JSON.stringify(payload));
}

function save() {
  if (!storageOK || saveState === 'desactive') return;
  const snap = snapshot();
  try {
    ecrire(snap);
    saveState = 'ok';
    saveError = '';
  } catch(err) {
    try {
      const leger = {...snap, enrich:[], cartes:snap.cartes.map(c => ({...c, x:'', X:0, g:'', G:'', L:''}))};
      ecrire(leger);
      saveState = 'partiel';
      saveError = 'visuels et textes importés non conservés (espace insuffisant)';
    } catch(err2) {
      saveState = 'plein';
      saveError = err2.message || 'espace de stockage saturé';
    }
  }
  if (saveState !== 'ok' && saveState !== dernierEtatSignale) {
    dernierEtatSignale = saveState;
    toast(saveState === 'partiel'
      ? "Espace de stockage limité : les visuels et les textes des cartes importées ne sont pas conservés, les quantités et le deck le restent."
      : "Sauvegarde impossible : le stockage du navigateur est saturé. Exportez un fichier depuis la fenêtre de sauvegarde pour ne rien perdre.");
  }
  if (saveState === 'ok') dernierEtatSignale = 'ok';
  /* Les données ont changé et sont écrites : s'il y a un appareil jumeau, il y
     a lieu de l'en avertir. La poussée est étranglée et différée
     (`js/nuage.js`) — `save()` se déclenche à chaque geste. */
  if (typeof nuagePousseeDifferee === 'function') nuagePousseeDifferee();
}

function scheduleSave() {
  if (!storageOK || saveState === 'desactive') return;
  clearTimeout(saveTimer);
  saveTimer = setTimeout(save, 700);
}

function restore(d) {
  if (!d || d.v !== 1) return false;
  (d.cartes || []).forEach(o => {
    let card = find(o.n);
    if (!card) card = registerCard(buildCard(o.n, o.c || '—', o.t || 'Inconnu', o.p || 0, o.x || ''));
    if (o.i) card.identity = o.i.split('');
    if (typeof o.m === 'number') card.cmc = o.m;
    if (typeof o.f === 'number' && card.force !== o.f) { card.force = o.f; reanalyser(card); }
    if (typeof o.e === 'number') card.endurance = o.e;
    if (o.a) card.artist = o.a;
    if (o.g) card.img = o.g;
    if (o.G) card.imgN = o.G;
    if (o.L) card.imgL = o.L;
    if (o.u) card.cmUrl = o.u;
    if (o.B) card.imgB = o.B;
    if (o.BL) card.imgBL = o.BL;
    card.unknown = !!o.k;
    if (typeof o.lg === 'string') card.legal = o.lg;
    /* Le mana produit, tel que Scryfall l'a dit une fois. Facultatif : une
       sauvegarde qui ne le porte pas laisse la carte lire son texte. */
    if (typeof o.mp === 'string' && o.mp) card.manaProduit = o.mp;
    if (o.X && o.x) card.textFull = true;
    if (card.img) card.imgTried = true;
    impressionRestore(card, o);
  });

  (d.enrich || []).forEach(o => {
    const card = find(o.n);
    if (!card) return;
    if (o.x) majTexteOracle(card, o.x);
    if (o.p) card.price = o.p;
    if (o.a) card.artist = o.a;
    if (o.g) card.img = o.g;
    if (o.G) card.imgN = o.G;
    if (o.L) card.imgL = o.L;
    if (o.u) card.cmUrl = o.u;
    if (typeof o.mp === 'string' && o.mp) card.manaProduit = o.mp;
    if (card.img) card.imgTried = true;
    impressionRestore(card, o);
  });

  S.collection = new Map((d.collection || []).filter(([n]) => find(n)));
  /* Les dossiers avant tout le reste : `S.deck`, `S.commander`, `S.format` et
     `S.budget` sont des vues sur le deck ouvert, et une écriture faite avant
     qu'il y en ait un irait dans un dossier créé pour rien. */
  restaureDecks(d);
  if (d.colors && d.colors.length !== undefined) S.colors = new Set(d.colors);
  ['colorMode','graphSource'].forEach(k => { if (d[k]) S[k] = d[k]; });
  if (d.achats) S.achats = {...S.achats, ...d.achats};
  /* La vue de chaque liste. Une sauvegarde d'hier n'en porte qu'une, `view`,
     et elle ne valait que pour la collection et le deck : les trois listes de
     propositions n'avaient pas le choix, et gardent donc leurs vignettes. */
  if (d.vues && typeof d.vues === 'object')
    Object.keys(S.vues).forEach(sec => { if (d.vues[sec]) S.vues[sec] = d.vues[sec]; });
  else if (d.view)
    ['collection', 'deck'].forEach(sec => { S.vues[sec] = d.view; });
  /* Le nombre de colonnes de chaque grille. Les premières sauvegardes n'en
     portaient qu'un, celui de la collection, en nombre nu : il devient le
     sien. Une valeur qui n'est plus offerte — une sauvegarde d'une autre
     version — laisse la grille automatique plutôt qu'une mise en page que le
     menu ne saurait plus nommer. */
  if (typeof d.colonnes === 'number') {
    if (COLONNES.indexOf(d.colonnes) >= 0) S.colonnes.collection = d.colonnes;
  } else if (d.colonnes && typeof d.colonnes === 'object') {
    Object.keys(S.colonnes).forEach(liste => {
      if (COLONNES.indexOf(d.colonnes[liste]) >= 0) S.colonnes[liste] = d.colonnes[liste];
    });
  }
  /* Le rangement de chaque section, une clé inconnue écartée : une sauvegarde
     d'une version ultérieure ne doit pas laisser la section sans tri. Les
     sauvegardes antérieures ne portent qu'un tri de collection, `sort`, dont
     les valeurs sont justement les clés de `TRIS` : il devient celui-là. */
  ['groupes','tris'].forEach(k => {
    const src = d[k];
    if (!src || typeof src !== 'object') return;
    const table = k === 'groupes' ? GROUPES : TRIS;
    Object.keys(S[k]).forEach(sec => { if (table[src[sec]]) S[k][sec] = src[sec]; });
  });
  if (!d.tris && TRIS[d.sort]) S.tris.collection = d.sort;
  /* Le thème. Une sauvegarde d'hier ne le porte pas : `null` laisse le
     démarrage suivre la clé du thème, puis la préférence du système. */
  if (typeof d.sombre === 'boolean') S.sombre = d.sombre;
  if (typeof d.showImplicit === 'boolean') S.showImplicit = d.showImplicit;
  if (d.custom) S.custom = {...S.custom, ...d.custom, colorLimits:{...S.custom.colorLimits, ...(d.custom.colorLimits||{})}};
  if (d.filtres) S.filtres = {...FILTRES_VIDE, ...d.filtres};
  if (typeof d.candidatsMax === 'number' && d.candidatsMax > 0) S.candidatsMax = d.candidatsMax;
  if (typeof d.filtreLegal === 'boolean') S.filtreLegal = d.filtreLegal;
  if (typeof d.catalogueNumeriques === 'boolean') S.catalogueNumeriques = d.catalogueNumeriques;
  if (typeof d.catalogueActif === 'boolean') S.catalogueActif = d.catalogueActif;
  if (typeof d.prixMaj === 'number') S.prixMaj = d.prixMaj;
  if (typeof d.majIgnoree === 'string') S.majIgnoree = d.majIgnoree;
  /* L'onglet ouvert se retient : on retrouve l'atelier là où on l'avait
     laissé. Un nom qu'un onglet d'hier portait est traduit
     (`ONGLETS_ANCIENS`) ; une clé inconnue est écartée, sans quoi plus aucune
     page ne paraîtrait. */
  if (ONGLETS[d.onglet]) S.onglet = d.onglet;
  else if (ONGLETS_ANCIENS[d.onglet]) S.onglet = ONGLETS_ANCIENS[d.onglet];
  /* Les parties repliées de la section Deck : une préférence d'affichage, qu'on
     retrouve d'une séance à l'autre, comme l'onglet ouvert. */
  if (Array.isArray(d.deckPlie)) S.deckPlie = new Set(d.deckPlie);
  if (Array.isArray(d.groupesPlies)) S.groupesPlies = new Set(d.groupesPlies);
  return true;
}

function chargerSauvegarde() {
  if (!storageOK) return null;
  try {
    const raw = localStorage.getItem(STORE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch(err) {
    saveState = 'corrompu';
    saveError = err.message || '';
    return null;
  }
}
