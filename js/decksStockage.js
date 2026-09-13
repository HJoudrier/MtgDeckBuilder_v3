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
    cle, nom:d.nom, format:d.format, statut:d.statut,
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
