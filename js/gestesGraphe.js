/* =====================================================================
   js/gestesGraphe.js — Les gestes du graphe et des listes

   Isoler un nœud ou le relâcher, montrer les liens implicites, aller à une
   section, ajouter une carte proposée, allonger une liste — et, faute de
   mieux, le clic sur une vignette, qui ouvre sa fiche.
   ===================================================================== */

function gestesGraphe(act, b) {
  if (act === 'toggleImplicit') {
    S.showImplicit = !S.showImplicit;
    b.setAttribute('aria-pressed', String(S.showImplicit));
    renderD();
    return true;
  }

  if (act === 'clearFocus') {
    S.focusNodes.clear();
    invaliderCandidats();
    renderD();
    renderSuggestions();
    renderTop();
    return true;
  }

  if (act === 'unfocusNode') {
    S.focusNodes.delete(b.dataset.node2);
    invaliderCandidats();
    renderD();
    renderSuggestions();
    renderTop();
    return true;
  }

  if (act === 'focusNodeFrom') {
    const n = b.dataset.node2;
    if (n) {
      S.focusNodes.clear();
      S.focusNodes.add(n);
      closeDialog();
      invaliderCandidats();
      renderD();
      renderSuggestions();
      renderTop();
      /* La fiche a pu être ouverte depuis n'importe quel onglet : celui du
         graphe s'ouvre d'abord, et le défilement ne part qu'une fois la
         section redessinée, à sa hauteur définitive. */
      allerVersSection('secD');
    }
    return true;
  }

  /* Un renvoi d'une section à une autre : le bouton nomme la section, et
     l'onglet qui la porte s'ouvre au passage (`allerVersSection`, js/entete.js).
     Le graphe s'en sert pour mener aux pistes qu'il branche, sur sa propre
     page, ou au classement complet dans l'onglet Catalogue. */
  if (act === 'allerSection') {
    allerVersSection(b.dataset.sec || 'secF');
    return true;
  }

  if (act === 'addPick') {
    const q = parseInt(document.getElementById('addQ').value, 10) || 1;
    const c = find(b.dataset.name);
    const comp = document.getElementById('addStock') && document.getElementById('addStock').checked;
    if (c) ajouterCarte(c, q, b.dataset.cible, comp);
    majResultats(b.dataset.cible, true);
    return true;
  }

  if (act === 'addScry') {
    const n = b.dataset.name, q = parseInt(document.getElementById('addQ').value, 10) || 1;
    const info = scryRes.get(norm(n)) || scryRes.get(n);
    const comp = document.getElementById('addStock') && document.getElementById('addStock').checked;
    let c = find(n);
    if (!c) {
      c = registerCard(info ? carteDepuisScryfall(info) : buildCard(n, '—', 'Inconnu', 0, ''));
      if (!info) c.unknown = true;
    }
    ajouterCarte(c, q, b.dataset.cible, comp);
    majResultats(b.dataset.cible, true);
    return true;
  }

  if (act === 'moreB') {
    S.limitB += PAGE;
    renderB();
    return true;
  }

  // clic sur une carte (grille ou liste) : ouverture de la fiche
  const tile = b.closest('[data-card]');
  if (tile) {
    const nom = tile.dataset.card;
    if (nom) { poseParcoursFiche(tile, nom); openCardModal(nom); }
    return true;
  }
  return false;
}
