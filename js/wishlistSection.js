/* =====================================================================
   js/wishlistSection.js — La section « Liste d'achats »

   Ce qu'il reste à acheter pour l'ensemble des decks, une ligne par carte.
   Chaque ligne dit quels decks la réclament : c'est ce qui rend la règle de
   comptage lisible sans avoir à l'expliquer — on voit que trois decks veulent
   la même carte, et pourquoi il en faut trois exemplaires.

   Elle se lit en lignes ou en vignettes, groupée et triée comme le règle la
   fenêtre « Affichage » de l'entête, au même titre que les autres listes.

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
    <button type="button" class="btn sm" data-act="commander" data-name="${esc(l.card.name)}"
      title="Je l'ai commandée, sans l'avoir reçue : elle passe en acquisition en cours">Commandée</button>
    <button type="button" class="btn sm" data-act="ownIt" data-name="${esc(l.card.name)}"
      title="Je l'ai achetée : l'ajouter à la collection, ce qui la retire d'ici">Acquise ✓</button>
  </div>`;
}

/* La vignette d'une ligne, pour la grille : la carte en image, ses decks
   demandeurs, ce qu'il en manque et ce que cela coûte. Le pied d'une vignette
   ne tient que quelques boutons — « Acquise » et Cardmarket y deviennent des
   pictogrammes, leur titre dit le reste.

   Le lien Cardmarket porte un `data-act` qui arrête le clic (js/gestesDeck.js) : sans lui,
   le clic remonterait jusqu'à la vignette et ouvrirait la fiche en plus de la
   page du marchand. */
function tuileWishlist(e) {
  const l = e.ligne, c = l.card;
  const img = c.imgN || c.img;
  return `<div class="cardT card ${img ? 'withimg' : ''} achat" data-card="${esc(c.name)}" data-ctx="achats">
    ${img ? `<div class="imgwrap">
      <img class="cimg" src="${esc(faceVisible(c))}" alt="${esc(c.name)}" loading="lazy" decoding="async">
    </div>` : `<div class="cname">${esc(c.name)}</div>`}
    <div class="tags wl-decks">${decksDemandeurs(l)}</div>
    <div class="foot bot">
      <span title="${l.besoin} demandé(s), ${l.possede} possédé(s)">×${l.manque}</span>
      <span class="mono">${l.inconnu ? 'prix ?' : `≈ ${eur(l.total)}`}</span>
      <div class="qty acts" style="margin-left:auto">
        <a class="btn sm" data-act="lienExterne" href="${esc(cmLink(c))}" target="_blank" rel="noopener" title="Voir sur Cardmarket">↗</a>
        <button type="button" class="btn sm" data-act="commander" data-name="${esc(c.name)}"
          title="Je l'ai commandée, sans l'avoir reçue : elle passe en acquisition en cours">📦</button>
        <button type="button" class="btn sm" data-act="ownIt" data-name="${esc(c.name)}"
          title="Je l'ai achetée : l'ajouter à la collection, ce qui la retire d'ici">✓</button>
      </div>
    </div>
  </div>`;
}

/* Les lignes, rangées comme la fenêtre « Affichage » le demande : en lignes
   ou en vignettes, par groupes ou à plat, dans l'ordre choisi. Une ligne
   d'achat devient l'entrée que `groupeCartes()` sait ranger — la carte et sa
   quantité à acheter —, et garde la ligne complète sous `ligne`. */
function listeWishlist(lignes) {
  const entrees = lignes.map(l => ({card: l.card, qty: l.manque, ligne: l}));
  const mode = S.groupes.achats;
  const grille = vueDe('achats') === 'grid';
  return rendGroupes('achats', groupeCartes(entrees, mode, S.tris.achats), mode,
    ents => grille
      ? `${ouvreGrille('achats', 'grid')}${ents.map(tuileWishlist).join('')}</div>`
      : `<div class="list">${ents.map(e => ligneWishlist(e.ligne)).join('')}</div>`,
    g => g.entrees.reduce((x, e) => x + e.qty, 0));
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

  const partages = clesDecks().filter(c => !S.decks[c].externe && S.decks[c].exemplairesPropres === false);
  corps.innerHTML = `
    <div class="row" style="margin-bottom:8px">
      <span class="pill">${b.lignes} carte(s) différente(s)</span>
      <span class="pill">${b.exemplaires} exemplaire(s)</span>
      <span class="pill">${eur(b.total)} estimés</span>
      ${b.inconnus ? `<span class="pill" title="Scryfall ne publie pas de prix pour ces cartes.">${b.inconnus} sans prix</span>` : ''}
      ${b.plafonds ? `<span class="pill" title="La somme des budgets que vos decks se sont fixés. Rien ne la contraint : c'est un repère.">plafonds cumulés ${eur(b.plafonds)}</span>` : ''}
      <button type="button" class="btn sm" data-act="toutCommander" style="margin-left:auto"
        title="Tout ce qui figure dans la liste passe en acquisition en cours">Tout est commandé</button>
      <button type="button" class="btn sm" data-act="wantsTout">Exporter la liste de wants Cardmarket</button>
    </div>
    <div class="small muted" style="margin-bottom:8px">
      Un deck qui veut ses propres exemplaires ajoute sa demande ; ceux qui se partagent la collection
      ${partages.length
        ? `— ${partages.map(c => esc(S.decks[c].nom)).join(', ')} — se contentent du plus gourmand d'entre eux.`
        : '— aucun pour l\'instant — se contenteraient du plus gourmand d\'entre eux.'}
      Ce que vous possédez se retranche du total. Le réglage est dans la configuration de chaque deck.
    </div>
    ${listeWishlist(lignes)}`;
  /* Les vignettes n'ont leur visuel qu'une fois Scryfall interrogé. */
  if (vueDe('achats') === 'grid') setTimeout(() => queueScryfall(lignes.map(l => l.card)), 0);
}
