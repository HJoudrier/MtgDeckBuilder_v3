/* =====================================================================
   js/gestesReglages.js — Les fenêtres de réglage et leurs boutons

   « Appliquer » et « Réinitialiser » des fenêtres de réglage — filtres,
   affichage, format, paramètres, budget —, les jauges de rôle et la
   pagination par type.
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

  /* Les réglages de mise en page d'une liste, réunis en fenêtre : ils
     n'agissent qu'à « Appliquer », comme les filtres. Le bouton porte la liste
     qu'il règle — les cinq ont la leur. */
  if (act === 'affichage') {
    openAffichageModal(b.dataset.liste);
    return true;
  }

  if (act === 'appliquerAffichage' || act === 'appliquerAffichagePartout') {
    appliquerAffichage(act === 'appliquerAffichagePartout');
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
    /* La clé dit tout : « graphe », « edhrec » ou « suggestions » pour une
       liste sans groupe, et « section:catégorie » pour une catégorie de l'une
       d'elles (`cleLimiteSug`, js/sugListes.js). La section donne la liste où compter,
       le groupement en cours la catégorie où s'arrêter. */
    const i = t.indexOf(':');
    const section = i > 0 ? t.slice(0, i) : t;
    const plat = i < 0;
    const liste = listeSug(section, selectionSuggestions());
    const defaut = defautSug(section, plat);
    let total = liste.length;
    if (!plat) {
      const g = groupeCartes(liste, S.groupes[section], null).find(x => cleLimiteSug(section, x.id) === t);
      total = g ? g.total : 0;
    }
    if (pas === 'tout') S.limiteType[t] = total;
    else if (pas === 'reduire') S.limiteType[t] = defaut;
    else S.limiteType[t] = Math.min(total, (S.limiteType[t] || defaut) + parseInt(pas, 10));
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
