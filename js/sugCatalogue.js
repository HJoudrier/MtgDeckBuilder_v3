/* =====================================================================
   js/sugCatalogue.js — La section du catalogue : tout le classement

   Tout ce que la notation a retenu, groupé et paginé selon sa fenêtre
   d'affichage. Les deux listes courtes des autres onglets en sont des
   extraits — rien n'est retiré d'ici.
   ===================================================================== */

function listeSuggestions(sel) {
  const sug = sel.sug;
  /* Le tri par score ne retrie rien : la liste arrive déjà dans l'ordre des
     scores, ou dans l'ordre gelé que le geste précédent a retenu — la retrier
     ferait sauter les vignettes que ce gel tient justement en place. Tout
     autre tri est un ordre demandé, qui passe donc avant le gel. */
  const mode = S.groupes.suggestions;
  const tri = S.tris.suggestions === 'score' ? null : S.tris.suggestions;
  const groupes = groupeCartes(sug, mode, tri);
  visuelsGroupes('suggestions', groupes, mode);

  return `
    <div class="row" style="margin-bottom:10px">
      ${boutonAffichage('suggestions')}
      <span class="small muted">${sug.length} piste(s)${noteMultiple(mode)}</span>
    </div>
    ${bandeauReclassement()}
    ${sug.length ? listesSug('suggestions', groupes, mode, 'Toutes les pistes')
      : '<div class="empty">Aucune suggestion. Ajoutez des cartes à la collection, élargissez les couleurs ou augmentez le budget.</div>'}
    <div class="small muted">Le score combine les branchements avec le deck (un effet produit ici déclenche une capacité là-bas), les rôles manquants, la courbe de mana et la densité de capacités. Les cartes hors collection sont pénalisées et limitées par le budget.
      <br>Les pistes tirées des nœuds isolés du graphe sont réunies dans <button type="button" class="btn sm" data-onglet="graphe">l'onglet Graphe</button>,
      celles que recommandent les decks recensés dans <button type="button" class="btn sm" data-onglet="edhrec">l'onglet EDHREC</button> : toutes figurent aussi ici.
      <br>Le budget, le prix maximum par carte et les préférences d'achat (état, langue, vendeur, pays) se règlent
      dans la fenêtre « Achats sur Cardmarket », qu'ouvre la pastille « Budget » de l'en-tête, et n'y prennent
      effet qu'au bouton « Appliquer ».</div>`;
}
