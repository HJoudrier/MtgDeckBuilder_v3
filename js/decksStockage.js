/* =====================================================================
   js/decksStockage.js — Les dossiers de deck, rangés et relus

   La forme sous laquelle un deck se sauvegarde, et la sauvegarde d'hier qui
   n'en connaissait qu'un. Séparé de `js/stockage.js`, qui porte déjà la
   sauvegarde locale, ses replis de quota et la restauration de la base de
   cartes : y verser les decks l'aurait poussé au-delà de ce qu'on lit d'une
   traite.
   ===================================================================== */

/* Un dossier de deck tel qu'il se range : les Map en paires, les Set en
   tableaux, comme le reste de la sauvegarde. */
function deckSnap(cle) {
  const d = S.decks[cle];
  return {
    cle, nom:d.nom, format:d.format, statut:d.statut, externe:d.externe === true,
    deck:[...d.deck], sideboard:[...d.sideboard], considering:[...d.considering],
    commander:d.commander, secondairesOff:[...d.secondairesOff],
    budget:{...d.budget}, exemplairesPropres:d.exemplairesPropres,
    restrictions:{...d.restrictions}, ciblesRoles:d.ciblesRoles,
    cree:d.cree, maj:d.maj
  };
}

/* Les objectifs par rôle, format par format : une valeur qui n'est pas un
   nombre positif est écartée, et le rôle reprend la cible que le format lui
   donne. */
function ciblesPropres(src) {
  const out = {};
  if (!src || typeof src !== 'object') return out;
  Object.keys(src).forEach(f => {
    const parFormat = src[f];
    if (!parFormat || typeof parFormat !== 'object') return;
    const propre = {};
    Object.keys(parFormat).forEach(r => {
      const v = Math.round(Number(parFormat[r]));
      if (Number.isFinite(v) && v >= 0) propre[r] = v;
    });
    if (Object.keys(propre).length) out[f] = propre;
  });
  return out;
}

/* Les decks, et la sauvegarde d'hier qui n'en connaissait qu'un.

   La reconnaissance se fait à l'absence de `d.decks` — et non à un numéro de
   version, que `restore()` refuserait —, comme pour `d.view`, `d.colonnes` et
   `d.sort` avant elle. Un atelier d'hier avait un deck : il devient « Mon
   deck », avec ses cartes, son commandant, son format, son budget et ses
   objectifs. */
function restaureDecks(d) {
  const dossiers = Array.isArray(d.decks) ? d.decks : null;
  S.decks = {};
  if (dossiers && dossiers.length) {
    dossiers.forEach(o => {
      if (!o || typeof o !== 'object') return;
      const cle = typeof o.cle === 'string' && o.cle ? o.cle : cleDeckNeuve();
      S.decks[cle] = deckNeuf(o.nom, {...o, ciblesRoles: ciblesPropres(o.ciblesRoles)});
      S.decks[cle].cree = typeof o.cree === 'number' ? o.cree : Date.now();
    });
  }
  if (!Object.keys(S.decks).length) {
    const cle = cleDeckNeuve();
    /* Le budget d'hier portait le plafond et les préférences d'achat mêlés :
       le premier descend dans le deck, les secondes restent globales. */
    const b = d.budget || {};
    S.decks[cle] = deckNeuf('Mon deck', {
      format: d.format, deck: d.deck, sideboard: d.sideboard, considering: d.considering,
      commander: d.commander, secondairesOff: d.secondairesOff,
      budget: {total: b.total, perCard: b.perCard},
      ciblesRoles: ciblesPropres(d.ciblesRoles)
    });
    ['condition','lang','sellerType','country'].forEach(k => { if (b[k]) S.achats[k] = b[k]; });
  }
  /* Le deck ouvert, s'il est nommé et connu. Un paquet venu du nuage n'en
     porte pas — c'est de la vue, elle ne voyage pas — : on garde alors celui
     qu'on regardait, pour ne pas être renvoyé ailleurs par une
     synchronisation de fond. */
  S.deckActif = S.decks[d.deckActif] ? d.deckActif
              : (S.decks[S.deckActif] ? S.deckActif : clesDecks()[0]);
  /* Un nom que la base ne connaît plus ne revient pas, et le deck l'emporte
     sur ses annexes : une carte ne vit jamais dans deux des trois listes. */
  Object.values(S.decks).forEach(deck => {
    deck.deck = new Map([...deck.deck].filter(([n]) => find(n)));
    CLES_ANNEXES.forEach(cle => {
      deck[cle] = new Map([...deck[cle]].filter(([n]) => find(n) && !deck.deck.has(n)));
    });
    if (!deck.commander || !find(deck.commander)) deck.commander = null;
  });
}

/* La bibliothèque d'adversaires d'hier : chaque adversaire devient un deck externe, sous la même clé — les
   sièges et les lots qui la nommaient la retrouvent. Un adversaire dont le nom est déjà celui d'un deck
   n'est pas recréé : le deck existant prend sa place aux sièges. Les cartes que l'atelier ne connaît pas
   entrent comme à l'import, « inconnues », à compléter. Le lien Moxfield ou Archidekt n'est pas repris :
   la relecture automatique a disparu avec la bibliothèque. Rend le nombre de decks créés. */
function migreAdversaires(brut) {
  if (!brut || typeof brut !== 'object') return 0;
  const parNom = new Map(Object.keys(S.decks).map(k => [S.decks[k].nom.trim().toLowerCase(), k]));
  const renvoi = {};
  let crees = 0;
  Object.keys(brut).forEach(cle => {
    const a = brut[cle];
    if (!a || typeof a !== 'object' || !Array.isArray(a.liste)) return;
    const nom = String(a.nom || 'Adversaire').trim();
    const existant = parNom.get(nom.toLowerCase());
    if (existant) { renvoi[cle] = existant; return; }
    const carte = n => (find(n) || (() => { const c = registerCard(buildCard(n, '—', 'Inconnu', 0, '')); c.unknown = true; return c; })()).name;
    const cmds = (Array.isArray(a.commandants) ? a.commandants : []).map(carte);
    const deck = new Map();
    [...a.liste.map(([n, q]) => [carte(n), q]), ...cmds.map(n => [n, 1])].forEach(([n, q]) => deck.set(n, (deck.get(n) || 0) + (q > 0 ? q : 1)));
    S.decks[cle] = deckNeuf(nom, {format: a.format, deck: [...deck], commander: cmds[0] || null, externe: true, statut: 'archive'});
    S.decks[cle].cree = typeof a.cree === 'number' ? a.cree : Date.now();
    parNom.set(nom.toLowerCase(), cle);
    renvoi[cle] = cle;
    crees++;
  });
  /* Les sièges qui nommaient un adversaire nomment maintenant le deck. */
  const siege = k => { const c = String(k || '').replace(/^a:/, ''); return renvoi[c] ? 'd:' + renvoi[c] : k; };
  if (Array.isArray(S.simulation.sieges)) S.simulation.sieges = S.simulation.sieges.map(siege);
  if (S.table && Array.isArray(S.table.sieges)) S.table.sieges.forEach(s => { if (/^a:/.test(s.deck || '')) s.deck = siege(s.deck); });
  if (/^a:/.test(S.table.deck || '')) S.table.deck = siege(S.table.deck);
  return crees;
}
