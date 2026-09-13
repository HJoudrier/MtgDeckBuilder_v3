/* =====================================================================
   js/wishlistSection.js — La section « Liste d'achats »

   Ce qu'il reste à acheter pour l'ensemble des decks, une ligne par carte.
   Chaque ligne dit quels decks la réclament : c'est ce qui rend la règle de
   comptage lisible sans avoir à l'expliquer — on voit que trois decks veulent
   la même carte, et pourquoi il en faut trois exemplaires.

   Le calcul vit dans `js/achats.js` et se mémorise : seule cette section le
   demande, si bien que l'en-tête ne paie rien de plus qu'avant.
   ===================================================================== */

/* Les decks qui réclament une carte, du plus gourmand au moins. Le deck
   ouvert est mis en avant : c'est celui qu'on a sous les yeux. */
function decksDemandeurs(l) {
  return l.decks.map(x => `<button type="button" class="pill${x.cle === S.deckActif ? ' actif' : ''}"
    data-act="activerDeck" data-deck="${esc(x.cle)}"
    title="Travailler sur « ${esc(x.nom)} », qui en demande ${x.qty}">${esc(x.nom)} ×${x.qty}</button>`).join('');
}

function ligneWishlist(l) {
  return `<div class="lrow">
    <span class="dot" style="background:${stripeColor(l.card)}"></span>
    <button type="button" class="cname cref" data-act="fiche" data-name="${esc(l.card.name)}">${esc(l.card.name)}</button>
    <span class="mono small" title="${l.besoin} demandé(s), ${l.possede} possédé(s)">×${l.manque}</span>
    <span class="mono small buy">${l.inconnu ? 'prix inconnu' : `≈ ${eur(l.total)}`}</span>
    <span class="wl-decks">${decksDemandeurs(l)}</span>
    <a class="btn sm" href="${esc(cmLink(l.card))}" target="_blank" rel="noopener">Cardmarket ↗</a>
    <button type="button" class="btn sm" data-act="ownIt" data-name="${esc(l.card.name)}"
      title="Je l'ai achetée : l'ajouter à la collection, ce qui la retire d'ici">Acquise ✓</button>
  </div>`;
}

function renderJ() {
  const corps = document.getElementById('bodyJ');
  const indice = document.getElementById('hintJ');
  if (!corps) return;
  const lignes = wishlist();
  const b = bilanWishlist();
  if (indice) indice.textContent = lignes.length
    ? `${b.exemplaires} exemplaire(s) · ${eur(b.total)}`
    : 'rien à acheter';

  if (!lignes.length) {
    corps.innerHTML = `<div class="small muted">Aucune carte à acheter : tout ce que vos decks demandent, vous le possédez déjà.</div>`;
    return;
  }

  const partages = clesDecks().filter(c => S.decks[c].exemplairesPropres === false);
  corps.innerHTML = `
    <div class="row" style="margin-bottom:8px">
      <span class="pill">${b.lignes} carte(s) différente(s)</span>
      <span class="pill">${b.exemplaires} exemplaire(s)</span>
      <span class="pill">${eur(b.total)} estimés</span>
      ${b.inconnus ? `<span class="pill" title="Scryfall ne publie pas de prix pour ces cartes.">${b.inconnus} sans prix</span>` : ''}
      ${b.plafonds ? `<span class="pill" title="La somme des budgets que vos decks se sont fixés. Rien ne la contraint : c'est un repère.">plafonds cumulés ${eur(b.plafonds)}</span>` : ''}
      <button type="button" class="btn sm" data-act="wantsTout" style="margin-left:auto">Exporter la liste de wants Cardmarket</button>
    </div>
    <div class="small muted" style="margin-bottom:8px">
      Un deck qui veut ses propres exemplaires ajoute sa demande ; ceux qui se partagent la collection
      ${partages.length
        ? `— ${partages.map(c => esc(S.decks[c].nom)).join(', ')} — se contentent du plus gourmand d'entre eux.`
        : '— aucun pour l\'instant — se contenteraient du plus gourmand d\'entre eux.'}
      Ce que vous possédez se retranche du total. Le réglage est dans la configuration de chaque deck.
    </div>
    <div class="list">${lignes.map(ligneWishlist).join('')}</div>`;
}
