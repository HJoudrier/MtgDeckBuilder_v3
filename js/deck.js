/* =====================================================================
   js/deck.js — Ce qu'il y a dans le deck, et les gestes qui l'y mettent

   `S.deck` associe un nom à un nombre d'exemplaires ; tout ce qui raisonne par
   carte passe par `deckEntries()`, car deux clés peuvent viser la même carte —
   un import l'a nommée autrement, et `find()` la rattrape. Monter une carte
   qu'on ne possède pas l'inscrit aux achats plutôt que de la refuser.
   ===================================================================== */

function deckEntries() {
  const out = [];
  S.deck.forEach((q, n) => {
    const c = find(n);
    if (c && q > 0) out.push({card:c, qty:q});
  });
  return out.sort((a, b) => TYPE_ORDER.indexOf(mainType(a.card)) - TYPE_ORDER.indexOf(mainType(b.card)) || a.card.cmc - b.card.cmc || a.card.name.localeCompare(b.card.name));
}

/* L'empreinte du deck, dont l'empreinte des suggestions se sert pour savoir si
   la notation vaut encore. */
function deckSignature() {
  return deckEntries().map(e => e.card.name + '×' + e.qty).sort().join('|') + '||' + (S.commander || '');
}

/* Les cartes du deck, une fois chacune. Deux clés de `S.deck` peuvent viser la
   même carte — un import l'a nommée autrement et `find()` la rattrape, avant
   que `mergeInto()` ne fusionne les deux entrées. Tout ce qui raisonne par
   carte, et non par exemplaire, passe par ici : sans quoi la même carte se
   compte deux fois, dans la courbe comme dans les branchements. */
function cartesDuDeck() {
  return [...new Map(deckEntries().map(e => [e.card.name, e.card])).values()];
}

function deckSize() {
  let n = 0;
  S.deck.forEach(q => n += q);
  return n;
}

function availableFor(card) {
  return (S.collection.get(card.name) || 0) - (S.deck.get(card.name) || 0);
}

function addToDeck(name) {
  const c = find(name); if (!c) return;
  const f = fmt();
  /* La carte attendait dans une liste annexe : elle passe dans le deck avec
     ses exemplaires, plutôt que d'y être ajoutée une seconde fois. */
  const annexe = annexeDe(name);
  if (annexe) {
    const n = deplacerCarte(name, 'deck');
    if (!n) return;
    if (f.commander && !S.commander && c.isLegendaryCreature) S.commander = name;
    recalculerAvecProgression(`${name} ajoutée au deck : les suggestions sont renotées d'après le deck qui vient de changer.`);
    toast(`${name} ×${n} quitte ${ANNEXES[annexe].article} pour le deck.`);
    return;
  }
  const cur = S.deck.get(name) || 0;
  if (!/^Basic Land/i.test(c.type) && cur >= f.maxCopies) { toast(`${name} : limite de ${f.maxCopies} copie(s) atteinte.`); return; }
  const aPayer = availableFor(c) <= 0;
  S.deck.set(name, cur + 1);
  if (aPayer) {
    const prix = cmEstimate(c);
    toast(`${name} n'est pas dans votre collection : ajoutée au deck et comptée à l'achat${prix?` (≈ ${eur(prix)})`:''}.`);
  }
  if (f.commander && !S.commander && c.isLegendaryCreature) S.commander = name;
  recalculerAvecProgression(`${name} ajoutée au deck : les suggestions sont renotées d'après le deck qui vient de changer.`);
}

function deckAdd(card, qty, opts) {
  opts = opts || {};
  const f = fmt();
  /* Le deck l'emporte sur les listes annexes : une carte qui y entre quitte
     la réserve ou l'étude, les trois listes s'excluant. */
  const annexe = annexeDe(card.name);
  if (annexe) annexeListe(annexe).delete(card.name);
  let n = 0, achetees = 0;
  for (let i = 0; i < qty; i++) {
    const cur = S.deck.get(card.name) || 0;
    if (!opts.force && !/^Basic Land/i.test(card.type) && cur >= f.maxCopies) break;
    if (availableFor(card) <= 0) {
      if (opts.completer) S.collection.set(card.name, (S.collection.get(card.name) || 0) + 1);
      else achetees++;
    }
    S.deck.set(card.name, cur + 1);
    n++;
  }
  deckAdd.dernierAchat = achetees;
  return n;
}

function removeFromDeck(name) {
  const cur = S.deck.get(name) || 0;
  if (cur <= 1) {
    S.deck.delete(name);
    if (S.commander === name) S.commander = null;
  } else S.deck.set(name, cur - 1);
  recalculerAvecProgression(`${name} retirée du deck : les suggestions sont renotées d'après le deck qui vient de changer.`);
}

function buyCard(name) {
  if (S.budget.total <= 0 || S.budget.perCard <= 0) {
    toast('Budget à zéro : aucun achat possible. Augmentez le budget dans la fenêtre « Achats sur Cardmarket », par la pastille « Budget » de l\'en-tête.');
    return;
  }
  const c = find(name);
  const o = bestOffer(c);
  if (!o) { toast("Aucune offre ne passe vos filtres d'état, de langue ou de prix maximum."); return; }
  if (spent() + o.price > S.budget.total) { toast('Budget dépassé. Augmentez-le, ou retirez une carte à acheter du deck.'); return; }
  deckAdd(c, 1, {force:true});
  recalculerAvecProgression(`${name} ajoutée au deck : les suggestions sont renotées d'après le deck qui vient de changer.`);
  toast(`${name} ajoutée au deck, comptée à l'achat : ${eur(o.price)} estimés (${o.condition} ou mieux, ${o.lang}).`);
}
