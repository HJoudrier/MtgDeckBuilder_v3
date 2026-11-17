/* =====================================================================
   js/gestesVue.js — Les gestes qui règlent la vue

   Fermer une fenêtre, cocher une couleur, changer d'onglet, ouvrir la fenêtre
   des filtres, cocher un archétype ou un set, feuilleter les éditions d'une
   carte. Un maillon de l'aiguillage de `js/app.js` : il rend `true` s'il a
   traité le geste, `false` pour laisser passer au suivant.
   ===================================================================== */

function gestesVue(act, b) {
  if (act === 'closeDialog' || b.classList.contains('dlg-close') || b.getAttribute('value') === 'cancel' || (b.closest('#dlg') && (b.getAttribute('value') === 'ok' || b.textContent.trim() === 'Fermer' || b.textContent.trim() === 'Annuler') && !act && !b.id)) {
    closeDialog();
    return true;
  }
  if (b.dataset.color || b.dataset.col) {
    const c = b.dataset.color || b.dataset.col;
    modifieBrouillon(() => { if (S.colors.has(c)) S.colors.delete(c); else S.colors.add(c); });
    apresReglage(`Couleur ${c} ${S.colors.has(c) ? 'ajoutée aux' : 'retirée des'} filtres : la collection affichée et les suggestions sont recalculées.`);
    return true;
  }

  if (b.dataset.cmode) {
    modifieBrouillon(() => { S.colorMode = b.dataset.cmode; });
    apresReglage('Mode de couleur changé : la collection affichée et les suggestions sont recalculées.');
    return true;
  }

  if (b.dataset.gsrc) {
    S.graphSource = b.dataset.gsrc;
    renderD();
    return true;
  }

  /* Le nœud cliqué à même le graphe : une bascule, rien de plus. Les boutons
     qui nomment leur geste — « retirer », « isoler dans le graphe » — passent
     outre et gagnent leur propre branche, plus bas : sans cette réserve, la
     bascule les happait tous, et « isoler » se contentait d'ajouter le nœud
     sans fermer la fiche ni mener au graphe. */
  if (!act && (b.dataset.node || b.dataset.node2)) {
    const id = b.dataset.node || b.dataset.node2;
    if (S.focusNodes.has(id)) S.focusNodes.delete(id);
    else S.focusNodes.add(id);
    invaliderCandidats();
    renderD();
    recalculerAvecProgression(`Effet ${(typeof NODE !== 'undefined' && NODE[id] && NODE[id].label) || id} ${S.focusNodes.has(id) ? 'isolé' : 'relâché'} : les candidates sont rebâties et notées.`);
    return true;
  }

  /* Les onglets : rien n'est recalculé, les sections étant toujours rendues.
     La page voulue paraît, et c'est tout. */
  if (b.dataset.onglet) {
    activerOnglet(b.dataset.onglet);
    return true;
  }

  if (act === 'filtres') {
    openFiltresModal();
    return true;
  }

  if (act === 'archMenu') {
    archOuvert = !archOuvert;
    majFenetreFiltres();
    return true;
  }

  if (act === 'toggleArch') {
    modifieBrouillon(() => basculerArchetype(b.dataset.arch));
    /* Les cartes du thème coché sont cherchées à la demande, sur ce qui est
       coché dans la fenêtre : sans cela le décompte annoncerait zéro. */
    avecBrouillon(() => archetypesAChargerEdhrec()).forEach(slug => chargerThemeEdhrec(slug));
    apresReglage('Filtre par archétype modifié : les cartes retenues et les suggestions sont recalculées.');
    return true;
  }

  if (act === 'setMenu') {
    setOuvert = !setOuvert;
    majFenetreFiltres();
    return true;
  }

  if (act === 'toggleSet') {
    modifieBrouillon(() => basculerSet(b.dataset.set));
    // les cartes du set coché sont cherchées à la demande, comme les thèmes
    avecBrouillon(() => setsACharger()).forEach(code => chargerSetScryfall(code));
    apresReglage('Filtre par set modifié : les cartes retenues et les suggestions sont recalculées.');
    return true;
  }

  if (act === 'dropFiltre') {
    modifieBrouillon(() => effacerFiltre((b.dataset.cles || '').split(',').filter(Boolean)));
    apresReglage('Filtre retiré : les cartes qu\'il écartait reviennent, et les suggestions sont recalculées.');
    return true;
  }

  if (act === 'versionPrec' || act === 'versionSuiv') {
    faireDefilerVersion(b.dataset.name, act === 'versionSuiv' ? 1 : -1);
    return true;
  }

  if (act === 'versionsPossedees' || act === 'versionsToutes') {
    basculerSourceVersions(b.dataset.name, act === 'versionsToutes' ? 'toutes' : 'possedees');
    return true;
  }

  if (act === 'choisirVersion') {
    choisirVersion(b.dataset.name, b.dataset.cle);
    return true;
  }
  return false;
}
