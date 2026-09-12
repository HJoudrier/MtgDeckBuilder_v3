/* =====================================================================
   js/app.js — L'aiguillage et le démarrage

   Un seul écouteur par geste, posé ici et nulle part ailleurs : le clic passe
   par les cinq maillons `gestes*`, dans l'ordre, jusqu'à ce que l'un dise
   l'avoir traité. Le reste — la frappe, les sélecteurs, le clavier, la
   fermeture d'une fenêtre — tient dans les écouteurs qui suivent.
   ===================================================================== */

document.addEventListener('click', ev => {
  const b = ev.target.closest('button, [data-act], [data-node], [data-node2], [data-card], [data-onglet], [data-view], [data-gsrc], [data-cmode], [data-color], [data-col]');
  if (!b) return;

  const act = b.dataset.act;

  if (gestesVue(act, b)) return;
  if (gestesReglages(act, b)) return;
  if (gestesDeck(act, b)) return;
  if (gestesDonnees(act, b)) return;
  gestesGraphe(act, b);
});

/* Aperçu flottant : suit la souris sur les noms de cartes. */
document.addEventListener('mouseover', ev => {
  const ref = ev.target.closest('[data-card-name], .cardref, [data-name]');
  const nom = ref && (ref.dataset.cardName || (ref.classList.contains('cardref') && ref.textContent) || (ref.dataset.act === 'fiche' && ref.dataset.name));
  if (nom) montrerApercu(nom, ev.clientX, ev.clientY);
});

document.addEventListener('mousemove', ev => {
  if (apercuEl && apercuEl.style.display === 'block') placerApercu(ev.clientX, ev.clientY);
});

document.addEventListener('mouseout', ev => {
  const ref = ev.target.closest('[data-card-name], .cardref, [data-name]');
  if (ref) cacherApercu();
});

/* Saisie dans les champs de recherche et de filtres. */
document.addEventListener('input', ev => {
  const t = ev.target;
  if (t.dataset.archq !== undefined) {
    archRecherche = t.value;
    majListeArchetypes();
    return;
  }
  if (t.dataset.setq !== undefined) {
    setRecherche = t.value;
    majListeSets();
    return;
  }
  if (t.dataset.filtre) {
    /* La frappe va au brouillon : rien n'est appliqué avant « Appliquer ».
       Seul le décompte de la fenêtre suit, il ne coûte que la collection. */
    modifieBrouillon(() => majFiltre(t.dataset.filtre, t.value));
    majResumeFiltres();
    return;
  }
  if (t.dataset.recherche) {
    majResultats(t.dataset.recherche);
    return;
  }
  if (t.dataset.cst || t.dataset.cust) {
    const k = t.dataset.cst || t.dataset.cust;
    modifieBrouillon(() => {
      S.custom[k] = t.type === 'checkbox' ? t.checked : (t.type === 'number' ? (parseInt(t.value, 10) || 0) : t.value);
    });
    /* Seul le résumé bouge : réécrire la fenêtre volerait le curseur du
       champ qu'on est en train de régler. */
    if (brouillon) { majResumeFormat(); return; }
    renderAll();
    majResumeFormat();
    return;
  }
  if (t.dataset.clim || t.dataset.lim) {
    const c = t.dataset.clim || t.dataset.lim;
    const s = t.dataset.k || t.dataset.side;
    modifieBrouillon(() => { S.custom.colorLimits[c][s] = parseInt(t.value, 10) || 0; });
    if (brouillon) return;
    renderE();
    return;
  }
  if (t.dataset.cand !== undefined) {
    /* Le plafond des candidats : il ne borne que le catalogue local, jamais
       le chargement paginé par l'API (`S.exploreMax`). */
    modifieBrouillon(() => { S.candidatsMax = Math.max(100, parseInt(t.value, 10) || 0); });
    /* Réécrire la fenêtre volerait le curseur du champ qu'on règle. */
    if (brouillon) return;
    invaliderCandidats();
    refreshSuggestions();
    return;
  }
  if (t.dataset.bud) {
    const k = t.dataset.bud;
    modifieBrouillon(() => {
      S.budget[k] = t.type === 'number' ? (parseFloat(t.value) || 0) : t.value;
    });
    /* Dans la fenêtre « Budget », rien n'est appliqué avant le bouton :
       seul le résumé suit, réécrire le corps volerait le curseur du champ
       qu'on est en train de régler. */
    if (brouillon) { majResumeBudget(); return; }
    if (k === 'perCard' || k === 'total') invaliderCandidats();
    refreshSuggestions();
    return;
  }
});

document.addEventListener('change', ev => {
  const t = ev.target;
  if (t.dataset.act === 'catNumeriques') {
    modifieBrouillon(() => { S.catalogueNumeriques = !!t.checked; });
    apresReglage('Réglage des cartes numériques modifié : les candidates sont rebâties.');
    return;
  }
  if (t.dataset.act === 'filtreLegal') {
    modifieBrouillon(() => { S.filtreLegal = !!t.checked; });
    apresReglage('Filtre de légalité modifié : les cartes retenues et les suggestions sont recalculées.');
    return;
  }
  /* Le rangement d'une section : chacune garde le sien, et seule celle qu'on
     règle est redessinée. Le tri par score de la collection peut demander une
     notation : `renderB` s'en charge par `filtered()`, et la mémorise. */
  /* Le nombre de colonnes d'une grille : rien n'est recalculé, la liste est
     simplement redessinée — c'est une mise en page, non une sélection. */
  if (t.dataset.colonnes) {
    const liste = t.dataset.colonnes, n = parseInt(t.value, 10);
    S.colonnes[liste] = COLONNES.indexOf(n) >= 0 ? n : 0;
    if (liste === 'collection') renderB(); else refreshSuggestions();
    scheduleSave();
    return;
  }
  if (t.dataset.groupe || t.dataset.tri) {
    const section = t.dataset.groupe || t.dataset.tri;
    (t.dataset.groupe ? S.groupes : S.tris)[section] = t.value;
    if (section === 'collection') { S.limitB = PAGE; renderB(); }
    else if (section === 'deck') renderE();
    else refreshSuggestions();
    scheduleSave();
    return;
  }
  if (t.dataset.act === 'format') {
    modifieBrouillon(() => {
      S.format = t.value;
      if (S.format === 'perso') S.custom.commander = fmt().commander;
    });
    apresReglage('Format changé : légalité, taille et suggestions sont repris.');
    return;
  }
  if (t.dataset.act === 'chooseCmd') {
    if (t.value) {
      S.commander = t.value;
      renderAll();
      toast(`Commandant désigné : ${t.value}.`);
    }
    return;
  }
});

// Fermeture au clic sur l'arrière-plan (backdrop)
const dlgEl = document.getElementById('dlg');
if (dlgEl) {
  /* Une fenêtre de filtres fermée autrement que par « Appliquer » revient
     à l'état d'avant son ouverture, quel qu'ait été le geste. */
  dlgEl.addEventListener('close', () => {
    fermetureBrouillon();
    /* Le toast a pu être glissé dans la fenêtre pour passer au-dessus
       d'elle : refermée, elle l'emporterait hors de vue. */
    const t = document.getElementById('toast');
    if (t && t.parentElement === dlgEl) document.body.appendChild(t);
  });
  dlgEl.addEventListener('click', ev => {
    if (ev.target === dlgEl) {
      const rect = dlgEl.getBoundingClientRect();
      const clickInside = (
        rect.top <= ev.clientY && ev.clientY <= rect.top + rect.height &&
        rect.left <= ev.clientX && ev.clientX <= rect.left + rect.width
      );
      if (!clickInside) {
        closeDialog();
      }
    }
  });
}

/* L'entête s'enroule autrement selon la largeur : sa hauteur est relevée à
   nouveau, sans rien redessiner, pour que les sections gardent la bonne marge
   de défilement. */
window.addEventListener('resize', majHauteurEntete);

// Clavier : Échap ferme la modale et l'aperçu
document.addEventListener('keydown', ev => {
  if (ev.key === 'Escape') {
    cacherApercu();
    closeDialog();
  }
  /* Entrée dans un champ de filtre vaut « Appliquer » : la saisie ne
     s'appliquant plus d'elle-même, il faut un geste au clavier. */
  if (ev.key === 'Enter' && ev.target && ev.target.dataset && ev.target.dataset.filtre) {
    ev.preventDefault();
    appliquerFiltres();
  }
  /* Et de même dans la fenêtre « Budget », dont les deux champs chiffrés
     attendent aussi « Appliquer ». */
  if (ev.key === 'Enter' && ev.target && ev.target.dataset && ev.target.dataset.bud) {
    ev.preventDefault();
    appliquerBudget();
  }
  /* Les flèches, une fiche ouverte : la carte précédente, la suivante — les
     mêmes que les deux boutons de son entête. Un champ de saisie garde ses
     flèches, et la barre d'onglets les siennes : la fiche est modale, elle
     n'a pas le focus en même temps qu'eux. */
  const dlgFiche = document.getElementById('dlg');
  if (dlgFiche && dlgFiche.open && dlgFiche.querySelector('.fiche[data-fiche]')
      && (ev.key === 'ArrowLeft' || ev.key === 'ArrowRight')
      && !(ev.target && ev.target.closest && ev.target.closest('input, textarea, select'))) {
    ev.preventDefault();
    ficheVoisine(ev.key === 'ArrowLeft' ? -1 : 1);
    return;
  }

  /* La barre d'onglets au clavier, selon le motif « tablist » : les flèches
     parcourent les onglets, Origine et Fin vont aux extrémités, et la page
     suit le focus. La tabulation, elle, n'entre qu'une fois dans la barre. */
  const ongletFocus = ev.target && ev.target.closest && ev.target.closest('#onglets [data-onglet]');
  if (ongletFocus && ['ArrowLeft','ArrowRight','Home','End'].includes(ev.key)) {
    ev.preventDefault();
    const boutons = [...document.querySelectorAll('#onglets [data-onglet]')];
    const i = boutons.indexOf(ongletFocus);
    const j = ev.key === 'Home' ? 0
      : ev.key === 'End' ? boutons.length - 1
      : (i + (ev.key === 'ArrowRight' ? 1 : -1) + boutons.length) % boutons.length;
    activerOnglet(boutons[j].dataset.onglet);
    boutons[j].focus();
  }
});

/* =====================================================================
   DÉMARRAGE DE L'APPLICATION
   ===================================================================== */
function demarrer() {
  initBuiltin();
  if (!storageOK) saveState = 'off';
  else if (localStorage.getItem(STORE_OFF) === '1') saveState = 'desactive';
  else {
    const s = chargerSauvegarde();
    if (s) restore(s);
  }
  renderAll();
  loadSymbology();
  reprendreArchetypesEdhrec().then(trouve => {
    if (trouve) renderAll();
    if (archetypesARevoir()) chargerArchetypesEdhrec();
  });
  /* Les sets déjà connus reviennent du cache : un set coché avant le
     rechargement filtre de nouveau sans attendre Scryfall. */
  reprendreSets().then(trouve => { if (trouve) renderAll(); });
  /* Les Game Changers du Commander : la liste revient du cache, et n'est
     redemandée à Scryfall qu'une fois la semaine passée. */
  reprendreGameChangers().then(trouve => {
    if (trouve) renderAll();
    if (gameChangersARevoir()) chargerGameChangers();
  });
  demarrerCatalogue();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', demarrer);
} else {
  demarrer();
}
