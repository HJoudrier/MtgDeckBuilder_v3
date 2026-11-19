/* =====================================================================
   js/simSources.js — Ce qui peut s'asseoir à un siège de la simulation

   Un siège se remplit d'un deck de l'atelier, le sien comme un deck externe,
   sans distinction (js/decks.js). Une source est la clé d'un deck, écrite
   `d:<clé>`. La clé nue, ou `a:<clé>`, se lit encore : l'ancienne
   bibliothèque d'adversaires est devenue des decks externes sous les mêmes
   clés (`migreAdversaires()`, js/decksStockage.js), et les lots d'hier qui
   les nommaient retrouvent leurs sièges.
   ===================================================================== */

const cleDeSource = k => String(k || '').replace(/^[da]:/, '');

function sourceExiste(k) { return !!S.decks[cleDeSource(k)]; }

function nomDeSiege(k) { return (S.decks[cleDeSource(k)] || {}).nom; }

/* L'empreinte d'un deck de l'atelier, ouvert ou non : un résultat calculé
   contre une liste qui a changé depuis est périmé. `deckSignature()` ne
   regarde que le deck ouvert. */
function signatureDeck(cle) {
  const d = S.decks[cle];
  if (!d) return '';
  return empreinte(d.format + '|' + (d.commander || '') + '|' + [...d.deck].map(([n, q]) => q + n).sort().join(','));
}

function signatureSource(k) { return signatureDeck(cleDeSource(k)); }

function siegeSource(k) { return siegeDeck(cleDeSource(k)); }

/* Les noms de cartes d'une source, commandant compris. */
function nomsDeSource(k) {
  const d = S.decks[cleDeSource(k)];
  return d ? [...d.deck.keys(), d.commander].filter(Boolean) : [];
}

/* Un deck vide ne se joue pas. */
function sourceVide(k) {
  const d = S.decks[cleDeSource(k)];
  return !d || !d.deck.size;
}

/* Les choix d'un siège : tous les decks de l'atelier. */
function optionsSiege() {
  return [['', '— choisir —'],
    ...clesDecks().map(k => ['d:' + k, S.decks[k].nom + (S.decks[k].externe ? ' (deck externe)' : ' (mon deck)')])];
}
