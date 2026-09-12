/* =====================================================================
   js/gestesDeck.js — Les gestes du deck, de ses annexes et de la fiche

   Monter et démonter une carte, la garer en réserve ou à l'étude, l'acheter,
   désigner un commandant, replier une partie, ouvrir une fiche et la
   feuilleter.
   ===================================================================== */

function gestesDeck(act, b) {
  if (act === 'toDeck') {
    /* Depuis une vignette de suggestion : l'ordre affiché est gelé et la
       section rafraîchie en place, pour ne pas renvoyer au début celui qui
       en parcourait le milieu. */
    if (b.closest('.sugT')) geleSuggestions();
    addToDeck(b.dataset.name);
    if (document.getElementById('dlg') && document.getElementById('dlg').open) {
      openCardModal(b.dataset.name);
    }
    return true;
  }

  if (act === 'fromDeck') {
    removeFromDeck(b.dataset.name);
    if (document.getElementById('dlg') && document.getElementById('dlg').open) {
      openCardModal(b.dataset.name);
    }
    return true;
  }

  if (act === 'plierPartie') {
    /* Comme l'en-tête d'une section : la classe bascule sur place. Repasser
       par `renderE()` renoterait toutes les cartes du deck pour un pli. */
    const cle = b.dataset.partie;
    const bloc = document.getElementById('partie-' + cle);
    if (!bloc) return true;
    const ouverte = bloc.classList.toggle('ouverte');
    b.setAttribute('aria-expanded', String(ouverte));
    b.setAttribute('title', ouverte ? 'Replier cette partie' : 'Déplier cette partie');
    if (ouverte) S.deckPlie.delete(cle); else S.deckPlie.add(cle);
    scheduleSave();
    return true;
  }

  /* Le pli d'une catégorie. Il suit celui des parties du deck, à une nuance
     près : dans la collection, une catégorie repliée ne consomme aucune place
     dans la page, si bien que le pli change ce qui s'affiche et que la section
     se redessine. Ailleurs il n'est qu'affichage, et la classe bascule sur
     place — repasser par `renderE()` renoterait tout le deck pour un pli, et
     réécrire `#sugList` ferait perdre sa place au lecteur. */
  if (act === 'plierGroupe') {
    const cle = b.dataset.cle;
    if (S.groupesPlies.has(cle)) S.groupesPlies.delete(cle); else S.groupesPlies.add(cle);
    scheduleSave();
    if (b.dataset.section === 'collection') { renderB(); return true; }
    const bloc = b.closest('.partie');
    if (!bloc) return true;
    const ouverte = bloc.classList.toggle('ouverte');
    b.setAttribute('aria-expanded', String(ouverte));
    b.setAttribute('title', ouverte ? 'Replier cette catégorie' : 'Déplier cette catégorie');
    return true;
  }

  if (act === 'toAnnexe') {
    versAnnexe(b.dataset.name, b.dataset.liste);
    if (document.getElementById('dlg') && document.getElementById('dlg').open) {
      openCardModal(b.dataset.name);
    }
    return true;
  }

  if (act === 'dropAnnexe') {
    retirerAnnexe(b.dataset.name, b.dataset.liste);
    if (document.getElementById('dlg') && document.getElementById('dlg').open) {
      openCardModal(b.dataset.name);
    }
    return true;
  }

  if (act === 'clearAnnexe') {
    const cle = b.dataset.liste, a = ANNEXES[cle];
    openDialog(`Vider ${a.article}`,
      `<p class="small">Cette action retire les ${annexeSize(cle)} carte(s) de ${esc(a.article)}. Le deck et la collection sont conservés.</p>`,
      '<button class="btn" value="cancel" onclick="closeDialog()">Annuler</button><button class="btn danger" id="okClearAnnexe" value="ok">Vider</button>');
    const ok = document.getElementById('okClearAnnexe');
    if (ok) ok.onclick = () => { closeDialog(); viderAnnexe(cle); };
    return true;
  }

  if (act === 'deckDrop') {
    S.deck.delete(b.dataset.name);
    if (S.commander === b.dataset.name) S.commander = null;
    recalculerAvecProgression(`${b.dataset.name} retirée du deck : les suggestions sont renotées.`);
    return true;
  }

  if (act === 'buy') {
    if (b.closest('.sugT')) geleSuggestions();
    buyCard(b.dataset.name);
    return true;
  }

  /* Cocher ou décocher un commandant secondaire, dans l'onglet EDHREC. Les
     statistiques déjà chargées d'un commandant qu'on écarte quittent l'état
     sur-le-champ : les laisser peser jusqu'au prochain aller-retour ferait
     mentir la case. Celles d'un commandant qu'on rétablit manquent, et
     l'empreinte remise à zéro les fait redemander au rendu qui suit. */
  if (act === 'cmdSecondaire') {
    const nom = b.dataset.name;
    if (!nom) return true;
    const ecarte = !S.secondairesOff.has(nom);
    if (ecarte) S.secondairesOff.add(nom); else S.secondairesOff.delete(nom);
    S.edhrec.secondaires = (S.edhrec.secondaires || []).filter(x => !S.secondairesOff.has(x.commandant));
    /* Écarter ne demande rien : les statistiques des autres restent en place,
       et l'empreinte est remise au niveau de la nouvelle liste. Rétablir, au
       contraire, laisse l'empreinte périmée — le rendu qui suit redemande la
       page manquante, servie par le cache si elle a déjà été lue. */
    S.edhrec.cmdSignature = ecarte ? signatureCommandants() : null;
    scheduleSave();
    apresReglage(`${nom} ${ecarte ? "n'est plus traitée comme commandant" : 'est traitée comme commandant'} : les statistiques EDHREC et les suggestions sont reprises.`);
    return true;
  }

  if (act === 'reclasser') {
    /* Les scores sont déjà à jour : seul l'ordre affiché change, et le rendu
       est immédiat. Le défilement n'est pas rattrapé — c'est un nouveau
       classement qui a été demandé. */
    degeleSuggestions();
    renderSuggestions();
    return true;
  }

  if (act === 'wants') {
    openWantsModal();
    return true;
  }

  if (act === 'ownIt') {
    const n = b.dataset.name;
    S.collection.set(n, (S.collection.get(n) || 0) + 1);
    toast(`${n} : 1 exemplaire ajouté à la collection.`);
    recalculerAvecProgression(`${n} : un exemplaire de plus en collection, les suggestions en tiennent compte.`);
    return true;
  }

  if (act === 'setCmd') {
    S.commander = b.dataset.name;
    recalculerAvecProgression(`${b.dataset.name} désignée commandant : tout le classement des suggestions en dépend.`);
    return true;
  }

  if (act === 'unsetCmd') {
    S.commander = null;
    recalculerAvecProgression('Commandant retiré : le classement des suggestions est repris sans lui.');
    return true;
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
    return true;
  }

  if (act === 'fiche') {
    /* Le fil de lecture part de l'endroit d'où l'on ouvre la fiche : la
       section qui porte le bouton, dans l'ordre où elle affiche ses cartes. */
    poseParcoursFiche(b, b.dataset.name);
    openCardModal(b.dataset.name);
    return true;
  }

  /* Les deux boutons de l'entête d'une fiche : la carte précédente, la
     suivante, dans la liste qu'on parcourait. */
  if (act === 'ficheNav') {
    ficheVoisine(parseInt(b.dataset.pas, 10) || 0);
    return true;
  }

  if (act === 'flip') {
    const n = b.dataset.name;
    if (RETOURNEES.has(n)) RETOURNEES.delete(n); else RETOURNEES.add(n);
    if (document.getElementById('dlg') && document.getElementById('dlg').open) openCardModal(n);
    majApercu();
    return true;
  }
  return false;
}
