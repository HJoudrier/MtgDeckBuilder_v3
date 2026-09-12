/* =====================================================================
   js/gestesReglages.js — Les fenêtres de réglage et leurs boutons

   « Appliquer » et « Réinitialiser » des quatre fenêtres — filtres, format,
   paramètres, budget —, les jauges de rôle et la pagination par type.
   ===================================================================== */

function gestesReglages(act, b) {
  if (act === 'appliquerFiltres') {
    appliquerFiltres();
    return true;
  }

  if (act === 'interrompreCatalogue') {
    interrompreCatalogue();
    return true;
  }

  if (act === 'appliquerFormat') {
    appliquerFormat();
    return true;
  }

  /* L'engrenage de l'entête, et le bouton « La charger » du catalogue : tout
     mène à la même fenêtre, où ces réglages vivent désormais ensemble. */
  if (act === 'parametres' || act === 'saveDialog') {
    openParametresModal();
    return true;
  }

  if (act === 'appliquerParametres') {
    appliquerParametres();
    return true;
  }

  if (act === 'budgetDialog') {
    openBudgetModal();
    return true;
  }

  if (act === 'appliquerBudget') {
    appliquerBudget();
    return true;
  }

  if (act === 'resetFiltres') {
    /* « Réinitialiser » dans la fenêtre vide le brouillon ; « Tout effacer »
       dans l'en-tête vide l'état, et s'applique aussitôt. */
    modifieBrouillon(() => reinitFiltres());
    apresReglage('Filtres réinitialisés : tout l\'atelier est repris sans eux.');
    toast('Filtres réinitialisés.');
    return true;
  }

  if (act === 'formatDialog') {
    openFormatModal();
    return true;
  }

  if (act === 'toggleRole') {
    /* Les mêmes rôles se cochent depuis les jauges de la section Deck :
       hors de la fenêtre, `modifieFiltres` agit sur l'état lui-même. */
    modifieBrouillon(() => basculerRole(b.dataset.role || ''));
    apresReglage('Filtre par rôle modifié : les cartes retenues et les suggestions sont recalculées.');
    return true;
  }

  if (act === 'pageType') {
    const t = b.dataset.type, pas = b.dataset.pas;
    const all = currentSuggestions();
    /* Trois familles de listes paginées, chacune sachant dire son total et son
       compte par défaut :
       — les deux listes courtes du graphe et d'EDHREC sans groupe
         (`LISTES_SUG`, js/sugListes.js) ;
       — les catégories d'EDHREC quand cet onglet est groupé, sous des clés
         préfixées « edhrec: » pour ne pas partager leur compte avec celles du
         catalogue ;
       — les catégories du catalogue, où le groupe est celui du rangement en
         cours, non plus le seul type principal. */
    let total = 0, defaultLim = 6;
    if (LISTES_SUG[t]) {
      const sel = selectionSuggestions();
      total = t === 'graphe' ? sel.graphPicks.length : sel.edhrecPicks.length;
      defaultLim = LISTES_SUG[t].defaut;
    } else if (t.indexOf('edhrec:') === 0) {
      const g = groupeCartes(selectionSuggestions().edhrecPicks, S.groupes.edhrec, null)
        .find(x => cleLimiteEdhrec(x.id) === t);
      total = g ? g.total : 0;
    } else {
      const g = groupeCartes(all, S.groupes.suggestions, null).find(x => x.id === t);
      total = g ? g.total : 0;
    }
    if (pas === 'tout') S.limiteType[t] = total;
    else if (pas === 'reduire') S.limiteType[t] = defaultLim;
    else S.limiteType[t] = Math.min(total, (S.limiteType[t] || defaultLim) + parseInt(pas, 10));
    refreshSuggestions();
    return true;
  }

  if (act === 'allColors') {
    modifieBrouillon(() => { S.colors = new Set(['W','U','B','R','G','C']); });
    apresReglage('Toutes les couleurs retenues : la collection affichée et les suggestions sont recalculées.');
    return true;
  }

  if (act === 'clearColors') {
    modifieBrouillon(() => { S.colors = new Set(); });
    apresReglage('Plus aucune couleur retenue : la collection affichée et les suggestions sont recalculées.');
    return true;
  }
  return false;
}
