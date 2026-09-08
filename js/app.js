/* =====================================================================
   js/app.js — Point d'entrée : gestionnaires d'évènements, initialisation et démarrage
   Atelier MTG — voir README.md pour l'architecture.
   ===================================================================== */

document.addEventListener('click', ev => {
  const head = ev.target.closest('.sec-head');
  if (head) {
    const sec = head.closest('section.sec');
    if (sec) {
      sec.classList.toggle('open');
      head.setAttribute('aria-expanded', String(sec.classList.contains('open')));
      return;
    }
  }

  const b = ev.target.closest('button, [data-act], [data-node], [data-node2], [data-card], [data-view], [data-gsrc], [data-cmode], [data-color], [data-col]');
  if (!b) return;

  const act = b.dataset.act;

  // Fermeture explicite des fenêtres modales
  if (act === 'closeDialog' || b.classList.contains('dlg-close') || b.getAttribute('value') === 'cancel' || (b.closest('#dlg') && (b.getAttribute('value') === 'ok' || b.textContent.trim() === 'Fermer' || b.textContent.trim() === 'Annuler') && !act && !b.id)) {
    closeDialog();
    return;
  }
  if (b.dataset.color || b.dataset.col) {
    const c = b.dataset.color || b.dataset.col;
    modifieBrouillon(() => { if (S.colors.has(c)) S.colors.delete(c); else S.colors.add(c); });
    apresReglage(`Couleur ${c} ${S.colors.has(c) ? 'ajoutée aux' : 'retirée des'} filtres : la collection affichée et les suggestions sont recalculées.`);
    return;
  }

  if (b.dataset.cmode) {
    modifieBrouillon(() => { S.colorMode = b.dataset.cmode; });
    apresReglage('Mode de couleur changé : la collection affichée et les suggestions sont recalculées.');
    return;
  }

  if (b.dataset.gsrc) {
    S.graphSource = b.dataset.gsrc;
    renderD();
    return;
  }

  if (b.dataset.view) {
    S.view = b.dataset.view;
    renderB();
    renderE();
    return;
  }

  if (b.dataset.node || b.dataset.node2) {
    const id = b.dataset.node || b.dataset.node2;
    if (S.focusNodes.has(id)) S.focusNodes.delete(id);
    else S.focusNodes.add(id);
    invaliderCandidats();
    renderD();
    recalculerAvecProgression(`Effet ${(typeof NODE !== 'undefined' && NODE[id] && NODE[id].label) || id} ${S.focusNodes.has(id) ? 'isolé' : 'relâché'} : les candidates sont rebâties et notées.`);
    return;
  }

  if (act === 'toggleHeader') {
    S.headerCompact = !S.headerCompact;
    try {
      localStorage.setItem('mtg_compact_header', S.headerCompact ? '1' : '0');
    } catch(e) {}
    renderTop();
    return;
  }

  if (act === 'filtres') {
    openFiltresModal();
    return;
  }

  if (act === 'archMenu') {
    archOuvert = !archOuvert;
    majFenetreFiltres();
    return;
  }

  if (act === 'toggleArch') {
    modifieBrouillon(() => basculerArchetype(b.dataset.arch));
    /* Les cartes du thème coché sont cherchées à la demande, sur ce qui est
       coché dans la fenêtre : sans cela le décompte annoncerait zéro. */
    avecBrouillon(() => archetypesAChargerEdhrec()).forEach(slug => chargerThemeEdhrec(slug));
    apresReglage('Filtre par archétype modifié : les cartes retenues et les suggestions sont recalculées.');
    return;
  }

  if (act === 'setMenu') {
    setOuvert = !setOuvert;
    majFenetreFiltres();
    return;
  }

  if (act === 'toggleSet') {
    modifieBrouillon(() => basculerSet(b.dataset.set));
    // les cartes du set coché sont cherchées à la demande, comme les thèmes
    avecBrouillon(() => setsACharger()).forEach(code => chargerSetScryfall(code));
    apresReglage('Filtre par set modifié : les cartes retenues et les suggestions sont recalculées.');
    return;
  }

  if (act === 'dropFiltre') {
    modifieBrouillon(() => effacerFiltre((b.dataset.cles || '').split(',').filter(Boolean)));
    apresReglage('Filtre retiré : les cartes qu\'il écartait reviennent, et les suggestions sont recalculées.');
    return;
  }

  if (act === 'versionPrec' || act === 'versionSuiv') {
    faireDefilerVersion(b.dataset.name, act === 'versionSuiv' ? 1 : -1);
    return;
  }

  if (act === 'versionsPossedees' || act === 'versionsToutes') {
    basculerSourceVersions(b.dataset.name, act === 'versionsToutes' ? 'toutes' : 'possedees');
    return;
  }

  if (act === 'choisirVersion') {
    choisirVersion(b.dataset.name, b.dataset.cle);
    return;
  }

  if (act === 'appliquerFiltres') {
    appliquerFiltres();
    return;
  }

  if (act === 'interrompreCatalogue') {
    interrompreCatalogue();
    return;
  }

  if (act === 'appliquerFormat') {
    appliquerFormat();
    return;
  }

  if (act === 'catalogueDialog') {
    openCatalogueModal();
    return;
  }

  if (act === 'appliquerCatalogue') {
    appliquerCatalogue();
    return;
  }

  if (act === 'budgetDialog') {
    openBudgetModal();
    return;
  }

  if (act === 'appliquerBudget') {
    appliquerBudget();
    return;
  }

  if (act === 'resetFiltres') {
    /* « Réinitialiser » dans la fenêtre vide le brouillon ; « Tout effacer »
       dans l'en-tête vide l'état, et s'applique aussitôt. */
    modifieBrouillon(() => reinitFiltres());
    apresReglage('Filtres réinitialisés : tout l\'atelier est repris sans eux.');
    toast('Filtres réinitialisés.');
    return;
  }

  if (act === 'formatDialog') {
    openFormatModal();
    return;
  }

  if (act === 'toggleRole') {
    /* Les mêmes rôles se cochent depuis les jauges de la section Deck :
       hors de la fenêtre, `modifieFiltres` agit sur l'état lui-même. */
    modifieBrouillon(() => basculerRole(b.dataset.role || ''));
    apresReglage('Filtre par rôle modifié : les cartes retenues et les suggestions sont recalculées.');
    return;
  }

  if (act === 'pageType') {
    const t = b.dataset.type, pas = b.dataset.pas;
    const all = currentSuggestions();
    const total = (t === 'edhrec')
      ? all.filter(s => s.edhrec).length
      : all.filter(s => mainType(s.card) === t).length;
    const defaultLim = (t === 'edhrec') ? 8 : 6;
    if (pas === 'tout') S.limiteType[t] = total;
    else if (pas === 'reduire') S.limiteType[t] = defaultLim;
    else S.limiteType[t] = Math.min(total, (S.limiteType[t] || defaultLim) + parseInt(pas, 10));
    refreshSuggestions();
    return;
  }

  if (act === 'allColors') {
    modifieBrouillon(() => { S.colors = new Set(['W','U','B','R','G','C']); });
    apresReglage('Toutes les couleurs retenues : la collection affichée et les suggestions sont recalculées.');
    return;
  }

  if (act === 'clearColors' || act === 'noColors') {
    modifieBrouillon(() => { S.colors = new Set(); });
    apresReglage('Plus aucune couleur retenue : la collection affichée et les suggestions sont recalculées.');
    return;
  }

  if (act === 'inc') {
    const n = b.dataset.name;
    S.collection.set(n, (S.collection.get(n) || 0) + 1);
    recalculerAvecProgression(`${n} : un exemplaire de plus en collection, les suggestions en tiennent compte.`);
    return;
  }

  if (act === 'dec') {
    const n = b.dataset.name;
    const c = S.collection.get(n) || 0;
    if (c <= 1) S.collection.delete(n); else S.collection.set(n, c - 1);
    recalculerAvecProgression(`${n} : un exemplaire de moins en collection, les suggestions en tiennent compte.`);
    return;
  }

  if (act === 'toDeck') {
    /* Depuis une vignette de suggestion : l'ordre affiché est gelé et la
       section rafraîchie en place, pour ne pas renvoyer au début celui qui
       en parcourait le milieu. */
    if (b.closest('.sugT')) geleSuggestions();
    addToDeck(b.dataset.name);
    if (document.getElementById('dlg') && document.getElementById('dlg').open) {
      openCardModal(b.dataset.name);
    }
    return;
  }

  if (act === 'fromDeck') {
    removeFromDeck(b.dataset.name);
    if (document.getElementById('dlg') && document.getElementById('dlg').open) {
      openCardModal(b.dataset.name);
    }
    return;
  }

  if (act === 'plierPartie') {
    /* Comme l'en-tête d'une section : la classe bascule sur place. Repasser
       par `renderE()` renoterait toutes les cartes du deck pour un pli. */
    const cle = b.dataset.partie;
    const bloc = document.getElementById('partie-' + cle);
    if (!bloc) return;
    const ouverte = bloc.classList.toggle('ouverte');
    b.setAttribute('aria-expanded', String(ouverte));
    b.setAttribute('title', ouverte ? 'Replier cette partie' : 'Déplier cette partie');
    if (ouverte) S.deckPlie.delete(cle); else S.deckPlie.add(cle);
    scheduleSave();
    return;
  }

  if (act === 'toAnnexe') {
    versAnnexe(b.dataset.name, b.dataset.liste);
    if (document.getElementById('dlg') && document.getElementById('dlg').open) {
      openCardModal(b.dataset.name);
    }
    return;
  }

  if (act === 'dropAnnexe') {
    retirerAnnexe(b.dataset.name, b.dataset.liste);
    if (document.getElementById('dlg') && document.getElementById('dlg').open) {
      openCardModal(b.dataset.name);
    }
    return;
  }

  if (act === 'clearAnnexe') {
    const cle = b.dataset.liste, a = ANNEXES[cle];
    openDialog(`Vider ${a.article}`,
      `<p class="small">Cette action retire les ${annexeSize(cle)} carte(s) de ${esc(a.article)}. Le deck et la collection sont conservés.</p>`,
      '<button class="btn" value="cancel" onclick="closeDialog()">Annuler</button><button class="btn danger" id="okClearAnnexe" value="ok">Vider</button>');
    const ok = document.getElementById('okClearAnnexe');
    if (ok) ok.onclick = () => { closeDialog(); viderAnnexe(cle); };
    return;
  }

  if (act === 'deckDrop') {
    S.deck.delete(b.dataset.name);
    if (S.commander === b.dataset.name) S.commander = null;
    recalculerAvecProgression(`${b.dataset.name} retirée du deck : les suggestions sont renotées.`);
    return;
  }

  if (act === 'buy') {
    if (b.closest('.sugT')) geleSuggestions();
    buyCard(b.dataset.name);
    return;
  }

  if (act === 'reclasser') {
    /* Les scores sont déjà à jour : seul l'ordre affiché change, et le rendu
       est immédiat. Le défilement n'est pas rattrapé — c'est un nouveau
       classement qui a été demandé. */
    degeleSuggestions();
    renderF();
    return;
  }

  if (act === 'wants') {
    openWantsModal();
    return;
  }

  if (act === 'ownIt') {
    const n = b.dataset.name;
    S.collection.set(n, (S.collection.get(n) || 0) + 1);
    toast(`${n} : 1 exemplaire ajouté à la collection.`);
    recalculerAvecProgression(`${n} : un exemplaire de plus en collection, les suggestions en tiennent compte.`);
    return;
  }

  if (act === 'setCmd') {
    S.commander = b.dataset.name;
    recalculerAvecProgression(`${b.dataset.name} désignée commandant : tout le classement des suggestions en dépend.`);
    return;
  }

  if (act === 'unsetCmd') {
    S.commander = null;
    recalculerAvecProgression('Commandant retiré : le classement des suggestions est repris sans lui.');
    return;
  }

  if (act === 'cmdColors') {
    const cmd = S.commander ? find(S.commander) : null;
    if (cmd) {
      S.colors = new Set(cmd.identity.length ? cmd.identity : ['C']);
      S.colorMode = 'identity';
      invaliderCandidats();
      recalculerAvecProgression(`Filtres alignés sur l'identité de ${cmd.name} : les candidates sont rebâties.`);
      toast(`Filtres alignés sur l'identité de ${cmd.name} : ${[...S.colors].join('')||'C'}.`);
    }
    return;
  }

  if (act === 'fiche') {
    openCardModal(b.dataset.name);
    return;
  }

  if (act === 'flip') {
    const n = b.dataset.name;
    if (RETOURNEES.has(n)) RETOURNEES.delete(n); else RETOURNEES.add(n);
    if (document.getElementById('dlg') && document.getElementById('dlg').open) openCardModal(n);
    majApercu();
    return;
  }

  if (act === 'saveDialog') {
    openSaveDialog();
    return;
  }

  if (act === 'saveNow') {
    save();
    toast(saveState === 'ok' ? 'Données enregistrées dans ce navigateur.' : (saveError || 'Enregistré.'));
    return;
  }

  if (act === 'saveExport') {
    const txt = JSON.stringify(snapshot(), null, 2);
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([txt], {type:'application/json'}));
    a.download = 'atelier-mtg-' + new Date().toISOString().slice(0, 10) + '.json';
    a.click();
    return;
  }

  if (act === 'saveWipe') {
    openDialog('Effacer les données locales',
      `<p class="small">Cette action supprime la collection, le deck et les préférences enregistrés dans ce navigateur. Elle est irréversible, sauf si vous avez exporté un fichier.</p>`,
      '<button class="btn" value="cancel" onclick="closeDialog()">Annuler</button><button class="btn danger" id="okWipeLocal" value="ok">Effacer définitivement</button>');
    const okWipeLocal = document.getElementById('okWipeLocal');
    if (okWipeLocal) okWipeLocal.onclick = () => {
      try { localStorage.removeItem(STORE_KEY); } catch(e) {}
      idbVider();
      S.collection.clear();
      S.deck.clear();
      CLES_ANNEXES.forEach(cle => annexeListe(cle).clear());
      S.commander = null;
      saveState = storageOK ? 'ok' : 'off';
      saveError = '';
      closeDialog();
      renderAll();
      toast('Données locales effacées.');
    };
    return;
  }

  if (act === 'catalogueTelecharger') {
    telechargerCatalogue();
    return;
  }

  /* Bouton unique de la fenêtre de sauvegarde : il teste la version publiée
     et ne retélécharge l'archive que si elle manque ou si elle a vieilli. */
  if (act === 'catalogueMaj') {
    majCatalogue();
    return;
  }

  /* Fenêtre proposée au démarrage quand les données ont pu changer. */
  if (act === 'majMaintenant') {
    closeDialog();
    telechargerCatalogue();
    return;
  }

  if (act === 'majPlusTard') {
    S.majIgnoree = CAT.majDispo;
    scheduleSave();
    closeDialog();
    toast("Mise à jour reportée : elle reste accessible depuis la pastille « Catalogue » de l'en-tête.");
    return;
  }

  if (act === 'catalogueEffacer') {
    idbVider().then(() => {
      CAT.etat = '';
      CAT.cartes = [];
      CAT.octets = 0;
      CAT.date = null;
      invaliderCandidats();
      recalculerAvecProgression('Archive effacée : les suggestions se limitent de nouveau à votre collection.');
      rafraichirFenetreSauvegarde();
      toast("Archive du catalogue effacée.");
    });
    return;
  }

  if (act === 'edhrec') {
    loadEdhrec(b.dataset.force === '1');
    return;
  }

  if (act === 'combos') {
    const rel = document.getElementById('csbRelay');
    if (rel) S.csbRelay = rel.value.trim();
    loadCombos(true);
    return;
  }

  if (act === 'catalogueSuite') {
    chargerCatalogue();
    return;
  }

  if (act === 'addCard') {
    openAdd(b.dataset.cible || 'collection');
    return;
  }

  if (act === 'import') {
    openImport(b.dataset.cible || 'collection');
    return;
  }

  if (act === 'enrich') {
    enrichAllUnknown();
    return;
  }

  if (act === 'wipe') {
    openWipeModal();
    return;
  }

  if (act === 'clearDeck') {
    openDialog('Vider le deck',
      '<p class="small">Cette action retire toutes les cartes de la liste principale. La collection, la réserve et les cartes à l\'étude sont conservées — chaque liste annexe a son propre bouton « Vider ».</p>',
      '<button class="btn" value="cancel" onclick="closeDialog()">Annuler</button><button class="btn danger" id="okClear" value="ok">Vider</button>');
    const okClear = document.getElementById('okClear');
    if (okClear) okClear.onclick = () => {
      S.deck.clear();
      S.commander = null;
      closeDialog();
      recalculerAvecProgression('Liste principale vidée : les suggestions repartent d\'un deck vide.');
      toast('Deck vidé.');
    };
    return;
  }

  if (act === 'exportDeck') {
    exportDeckModal();
    return;
  }

  if (act === 'toggleImplicit') {
    S.showImplicit = !S.showImplicit;
    b.setAttribute('aria-pressed', String(S.showImplicit));
    renderD();
    return;
  }

  if (act === 'clearFocus') {
    S.focusNodes.clear();
    invaliderCandidats();
    renderD();
    renderF();
    renderTop();
    return;
  }

  if (act === 'unfocusNode') {
    S.focusNodes.delete(b.dataset.node2);
    invaliderCandidats();
    renderD();
    renderF();
    renderTop();
    return;
  }

  if (act === 'focusNodeFrom') {
    const n = b.dataset.node2;
    if (n) {
      S.focusNodes.clear();
      S.focusNodes.add(n);
      closeDialog();
      document.getElementById('secD').scrollIntoView({behavior:'smooth'});
      invaliderCandidats();
      renderD();
      renderF();
      renderTop();
    }
    return;
  }

  if (act === 'graphToF') {
    const secF = document.getElementById('secF');
    if (secF) secF.scrollIntoView({behavior:'smooth'});
    return;
  }

  if (act === 'addPick') {
    const q = parseInt(document.getElementById('addQ').value, 10) || 1;
    const c = find(b.dataset.name);
    const comp = document.getElementById('addStock') && document.getElementById('addStock').checked;
    if (c) ajouterCarte(c, q, b.dataset.cible, comp);
    majResultats(b.dataset.cible, true);
    return;
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
    return;
  }

  if (act === 'moreB') {
    S.limitB += PAGE;
    renderB();
    return;
  }

  // clic sur une carte (grille ou liste) : ouverture de la fiche
  const tile = b.closest('[data-card]');
  if (tile) {
    const nom = tile.dataset.card;
    if (nom) openCardModal(nom);
    return;
  }
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
  if (t.dataset.act === 'sort') {
    S.sort = t.value;
    renderB();
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
