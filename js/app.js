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
    if (S.colors.has(c)) S.colors.delete(c); else S.colors.add(c);
    invaliderCandidats();
    renderAll();
    majFenetreFiltres();
    return;
  }

  if (b.dataset.cmode) {
    S.colorMode = b.dataset.cmode;
    invaliderCandidats();
    renderAll();
    majFenetreFiltres();
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
    renderF();
    renderTop();
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
    basculerArchetype(b.dataset.arch);
    // les cartes du thème coché sont cherchées à la demande
    archetypesAChargerEdhrec().forEach(slug => chargerThemeEdhrec(slug));
    majFenetreFiltres();
    majResumeFiltres();
    S.limitB = PAGE;
    renderAll();
    return;
  }

  if (act === 'dropFiltre') {
    effacerFiltre((b.dataset.cles || '').split(',').filter(Boolean));
    majFenetreFiltres();
    S.limitB = PAGE;
    renderAll();
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

  if (act === 'resetFiltres') {
    reinitFiltres();
    majFenetreFiltres();
    S.limitB = PAGE;
    renderAll();
    toast('Filtres réinitialisés.');
    return;
  }

  if (act === 'formatDialog') {
    openFormatModal();
    return;
  }

  if (act === 'toggleRole') {
    basculerRole(b.dataset.role || '');
    majFenetreFiltres();
    S.limitB = PAGE;
    renderAll();
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
    S.colors = new Set(['W','U','B','R','G','C']);
    invaliderCandidats();
    renderAll();
    majFenetreFiltres();
    return;
  }

  if (act === 'clearColors' || act === 'noColors') {
    S.colors = new Set();
    invaliderCandidats();
    renderAll();
    majFenetreFiltres();
    return;
  }

  if (act === 'inc') {
    const n = b.dataset.name;
    S.collection.set(n, (S.collection.get(n) || 0) + 1);
    renderAll();
    return;
  }

  if (act === 'dec') {
    const n = b.dataset.name;
    const c = S.collection.get(n) || 0;
    if (c <= 1) S.collection.delete(n); else S.collection.set(n, c - 1);
    renderAll();
    return;
  }

  if (act === 'toDeck') {
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

  if (act === 'deckDrop') {
    S.deck.delete(b.dataset.name);
    if (S.commander === b.dataset.name) S.commander = null;
    renderAll();
    return;
  }

  if (act === 'buy') {
    buyCard(b.dataset.name);
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
    renderAll();
    return;
  }

  if (act === 'setCmd') {
    S.commander = b.dataset.name;
    renderAll();
    return;
  }

  if (act === 'unsetCmd') {
    S.commander = null;
    renderAll();
    return;
  }

  if (act === 'cmdColors') {
    const cmd = S.commander ? find(S.commander) : null;
    if (cmd) {
      S.colors = new Set(cmd.identity.length ? cmd.identity : ['C']);
      S.colorMode = 'identity';
      invaliderCandidats();
      renderAll();
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
    toast("Mise à jour reportée : elle reste accessible depuis la pastille de sauvegarde.");
    return;
  }

  if (act === 'catalogueEffacer') {
    idbVider().then(() => {
      CAT.etat = '';
      CAT.cartes = [];
      CAT.octets = 0;
      CAT.date = null;
      invaliderCandidats();
      renderAll();
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
      '<p class="small">Cette action retire toutes les cartes du deck. La collection est conservée.</p>',
      '<button class="btn" value="cancel" onclick="closeDialog()">Annuler</button><button class="btn danger" id="okClear" value="ok">Vider</button>');
    const okClear = document.getElementById('okClear');
    if (okClear) okClear.onclick = () => {
      S.deck.clear();
      S.commander = null;
      closeDialog();
      renderAll();
      toast('Deck vidé.');
    };
    return;
  }

  if (act === 'exportDeck') {
    exportDeckModal();
    return;
  }

  if (act === 'toggleImages') {
    S.images = !S.images;
    // Nouvelle tentative d'accès à Scryfall : l'échec précédent portait
    // peut-être sur l'autre mode d'affichage.
    S.scryHS = false;
    S.imagesFailed = false;
    b.setAttribute('aria-pressed', String(S.images));
    renderAll();
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
  if (t.dataset.filtre) {
    majFiltre(t.dataset.filtre, t.value);
    majResumeFiltres();
    planifierRenduFiltres();
    return;
  }
  if (t.dataset.recherche) {
    majResultats(t.dataset.recherche);
    return;
  }
  if (t.dataset.cst || t.dataset.cust) {
    const k = t.dataset.cst || t.dataset.cust;
    S.custom[k] = t.type === 'checkbox' ? t.checked : (t.type === 'number' ? (parseInt(t.value, 10) || 0) : t.value);
    renderAll();
    majResumeFormat();
    return;
  }
  if (t.dataset.clim || t.dataset.lim) {
    const c = t.dataset.clim || t.dataset.lim;
    const s = t.dataset.k || t.dataset.side;
    S.custom.colorLimits[c][s] = parseInt(t.value, 10) || 0;
    renderE();
    return;
  }
  if (t.dataset.bud) {
    const k = t.dataset.bud;
    S.budget[k] = t.type === 'number' ? (parseFloat(t.value) || 0) : t.value;
    if (k === 'perCard' || k === 'total') invaliderCandidats();
    refreshSuggestions();
    return;
  }
});

document.addEventListener('change', ev => {
  const t = ev.target;
  if (t.dataset.act === 'sort') {
    S.sort = t.value;
    renderB();
    return;
  }
  if (t.dataset.act === 'format') {
    S.format = t.value;
    if (S.format === 'perso') S.custom.commander = fmt().commander;
    invaliderCandidats();
    renderAll();
    majFenetreFormat();
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
  dlgEl.addEventListener('close', () => fermetureFiltres());
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
  demarrerCatalogue();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', demarrer);
} else {
  demarrer();
}
