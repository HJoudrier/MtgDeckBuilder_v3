/* =====================================================================
   js/simSources.js — Ce qui peut s'asseoir à un siège de la simulation

   Un siège adverse se remplit d'un deck de l'atelier — le sien comme un deck
   externe, sans distinction — ou d'un adversaire de la bibliothèque. Une
   source est une clé : `d:<clé du deck>` pour un deck, `<clé>` ou
   `a:<clé>` pour un adversaire (les lots d'hier gardaient la clé nue, et
   la lisent encore). Le deck testé, lui, reste un deck.
   ===================================================================== */

const estSourceDeck = k => /^d:/.test(k || '');
const cleDeSource = k => String(k || '').replace(/^[da]:/, '');

function sourceExiste(k) {
  return estSourceDeck(k) ? !!S.decks[cleDeSource(k)] : !!S.adversaires[cleDeSource(k)];
}

function nomDeSiege(k) {
  return estSourceDeck(k) ? (S.decks[cleDeSource(k)] || {}).nom : (S.adversaires[cleDeSource(k)] || {}).nom;
}

/* Ce qu'est devenue la liste : la signature change dès qu'une carte, le
   commandant ou le format changent. */
function signatureSource(k) {
  if (estSourceDeck(k)) return signatureDeck(cleDeSource(k));
  const a = S.adversaires[cleDeSource(k)];
  return a ? signatureAdversaire(a) : '';
}

function siegeSource(k) {
  return estSourceDeck(k) ? siegeDeck(cleDeSource(k)) : siegeAdversaire(cleDeSource(k));
}

/* Les noms de cartes d'une source, commandant compris. */
function nomsDeSource(k) {
  if (estSourceDeck(k)) { const d = S.decks[cleDeSource(k)]; return d ? [...d.deck.keys(), d.commander].filter(Boolean) : []; }
  const a = S.adversaires[cleDeSource(k)];
  return a ? [...a.liste.map(([n]) => n), ...a.commandants] : [];
}

/* Une source vide ne se joue pas. */
function sourceVide(k) {
  if (estSourceDeck(k)) { const d = S.decks[cleDeSource(k)]; return !d || !d.deck.size; }
  const a = S.adversaires[cleDeSource(k)];
  return !a || !nbCartesAdversaire(a);
}

/* Les choix d'un siège : les decks de l'atelier d'abord, externes compris, puis la bibliothèque. */
function optionsSiege() {
  return [['', '— choisir —'],
    ...clesDecks().map(k => ['d:' + k, S.decks[k].nom + (S.decks[k].externe ? ' (deck externe)' : ' (mon deck)')]),
    ...Object.keys(S.adversaires).map(k => [k, S.adversaires[k].nom + ' (adversaire)'])];
}
