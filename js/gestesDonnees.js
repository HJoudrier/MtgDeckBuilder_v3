/* =====================================================================
   js/gestesDonnees.js — Les gestes qui touchent aux données

   La sauvegarde locale, l'archive du catalogue, EDHREC, l'import et la
   complétion de la collection : tout ce qui écrit sur l'appareil ou va
   chercher dehors.
   ===================================================================== */

function gestesDonnees(act, b) {
  if (act === 'saveNow') {
    save();
    toast(saveState === 'ok' ? 'Données enregistrées dans ce navigateur.' : (saveError || 'Enregistré.'));
    return true;
  }

  if (act === 'saveExport') {
    const txt = JSON.stringify(snapshot(), null, 2);
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([txt], {type:'application/json'}));
    a.download = 'atelier-mtg-' + new Date().toISOString().slice(0, 10) + '.json';
    a.click();
    return true;
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
    return true;
  }

  if (act === 'catalogueTelecharger') {
    telechargerCatalogue();
    return true;
  }

  /* Bouton unique de la fenêtre de sauvegarde : il teste la version publiée
     et ne retélécharge l'archive que si elle manque ou si elle a vieilli. */
  if (act === 'catalogueMaj') {
    majCatalogue();
    return true;
  }

  /* Fenêtre proposée au démarrage quand les données ont pu changer. */
  if (act === 'majMaintenant') {
    closeDialog();
    telechargerCatalogue();
    return true;
  }

  if (act === 'majPlusTard') {
    S.majIgnoree = CAT.majDispo;
    scheduleSave();
    closeDialog();
    toast("Mise à jour reportée : elle reste accessible dans les paramètres (l'engrenage de l'entête).");
    return true;
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
    return true;
  }

  if (act === 'edhrec') {
    loadEdhrec(b.dataset.force === '1');
    return true;
  }

  if (act === 'catalogueSuite') {
    chargerCatalogue();
    return true;
  }

  if (act === 'addCard') {
    openAdd(b.dataset.cible || 'collection');
    return true;
  }

  if (act === 'import') {
    openImport(b.dataset.cible || 'collection');
    return true;
  }

  if (act === 'enrich') {
    enrichAllUnknown();
    return true;
  }

  if (act === 'wipe') {
    openWipeModal();
    return true;
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
    return true;
  }

  if (act === 'exportDeck') {
    exportDeckModal();
    return true;
  }
  return false;
}
