/* =====================================================================
   js/sugGraphe.js — La section du graphe : ce qui se branche sur les nœuds

   Elle suit le graphe sur la même page — on clique un effet, on voit aussitôt
   de quoi l'alimenter. Elle se range comme les autres listes : sa barre, son
   bouton « Affichage », son groupement et son tri, gardés sous la clé
   `graphe`. Elle n'en avait aucun et montrait l'ordre de la notation seul :
   trente pistes autour de deux nœuds se lisent mieux rangées par type ou par
   coût, comme partout ailleurs.
   ===================================================================== */

function blocGraphe(sel) {
  const actifs = noeudsActifs();
  if (!actifs.length)
    return `<div class="empty">Aucun nœud isolé. Cliquez un nœud du graphe, ci-dessus : les cartes qui s'y branchent
      seront proposées ici, à part du reste du classement.</div>`;

  const noms = actifs.map(n => esc(NODE[n].label)).join(' + ');
  const picks = sel.graphPicks;
  if (!picks.length)
    return `<div class="empty">Rien à proposer autour de ${noms} : élargissez les couleurs, le budget ou les filtres,
      ou relâchez un nœud dans le graphe.</div>`;

  /* Comme au catalogue, le tri « score » ne retrie rien : la liste arrive dans
     l'ordre des scores, ou dans l'ordre gelé qu'un ajout a retenu. Tout autre
     tri est un ordre demandé, qui passe donc avant le gel. */
  const mode = S.groupes.graphe;
  const tri = S.tris.graphe === 'score' ? null : S.tris.graphe;
  const groupes = groupeCartes(picks, mode, tri);
  const plat = GROUPES[mode].plat;
  visuelsGroupes('graphe', groupes, mode);
  const titre = `Autour de ${noms}`;

  return `<div class="row" style="margin-bottom:10px">
      ${boutonAffichage('graphe')}
      <span class="small muted">${picks.length} piste(s) · ${actifs.length} nœud(s) isolé(s)${noteMultiple(mode)}</span>
    </div>
    ${plat ? '' : `<div class="small muted" style="margin-bottom:8px">${titre}</div>`}
    ${listesSug('graphe', groupes, mode, titre, 'var(--brass-d)')}
    ${renvoiCatalogue('Ces pistes touchent tous les nœuds isolés ; le score, lui, est celui de la notation commune.')}`;
}
