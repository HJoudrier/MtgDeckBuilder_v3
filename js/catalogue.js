/* =====================================================================
   js/catalogue.js — Tenir le catalogue à jour

   Au lancement, on regarde d'abord ce que l'appareil garde — archive
   IndexedDB, puis fichier posé à côté de la page. Sans rien, l'archive
   Scryfall est téléchargée aussitôt. Avec une archive plus vieille que celle
   que Scryfall publie, une fenêtre le signale et propose la mise à jour ;
   « Plus tard » retient la version refusée dans `S.majIgnoree`.
   ===================================================================== */

async function chargerCatalogueLocal() {
  if (typeof fetch !== 'function') return false;
  for (const nom of FICHIERS_LOCAUX) {
    try {
      const r = await fetch(nom);
      if (!r.ok) continue;
      await lireCatalogueFichier(r, nom);
      return true;
    } catch(err) {}
  }
  return false;
}

async function verifierMajCatalogue() {
  if (typeof fetch !== 'function') return null;
  try {
    const r = await fetch('https://api.scryfall.com/bulk-data/oracle-cards');
    if (!r.ok) throw new Error('HTTP ' + r.status);
    const j = await r.json();
    CAT.majDispo = j.updated_at || null;
    CAT.uri = j.jsonl_download_uri || j.download_uri || '';
    CAT.taille = j.compressed_size || 0;
    CAT.tailleBrute = j.size || 0;
    renderSuggestions();
    return j;
  } catch(err) { return null; }
}

function catalogueObsolete() {
  if (!CAT.majDispo) return false;
  if (!CAT.maj) return CAT.etat === 'ok';
  return new Date(CAT.majDispo) > new Date(CAT.maj);
}

async function majPrix(force) {
  if (typeof fetch !== 'function') return;
  if (!force && S.prixMaj && Date.now() - S.prixMaj < 20 * 3600e3) return;
  const noms = [...new Set([...S.collection.keys(), ...S.deck.keys(),
    ...CLES_ANNEXES.flatMap(cle => [...annexeListe(cle).keys()])])].filter(n => find(n));
  if (!noms.length) return;
  let maj = 0;
  for (let i = 0; i < noms.length; i += 75) {
    const lot = noms.slice(i, i + 75);
    try {
      const r = await fetch('https://api.scryfall.com/cards/collection', {
        method: 'POST',
        headers: {'Content-Type':'application/json'},
        body: JSON.stringify({identifiers: lot.map(n => ({name:n}))})
      });
      if (!r.ok) throw new Error('HTTP ' + r.status);
      const j = await r.json();
      (j.data || []).forEach(sc => {
        const c = scryTarget(sc, null);
        if (!c) return;
        const eurVal = parseFloat((sc.prices && (sc.prices.eur || sc.prices.eur_foil)) || 0) || 0;
        if (eurVal && c.price !== eurVal) { c.price = eurVal; maj++; }
        if (sc.purchase_uris && sc.purchase_uris.cardmarket) c.cmUrl = sc.purchase_uris.cardmarket;
      });
    } catch(err) { return; }
    await new Promise(r2 => setTimeout(r2, 110));
  }
  S.prixMaj = Date.now();
  renderAll();
  if (maj) toast(`${maj} prix mis à jour depuis Cardmarket.`);
}

async function telechargerCatalogue() {
  if (typeof fetch !== 'function') { toast('Téléchargement impossible dans ce contexte.'); return false; }
  /* Un chargement est déjà en cours : on montre sa boîte plutôt que d'en
     lancer un second, qui se disputerait `CAT.cartes` avec le premier. */
  if (CAT.suivi) {
    if (typeof ouvrirBoiteCatalogue === 'function') ouvrirBoiteCatalogue();
    return false;
  }
  CAT.etat = 'chargement'; CAT.source = 'réseau'; CAT.detail = ''; renderSuggestions();
  try {
    const info = await verifierMajCatalogue();
    const adresse = (info && (info.jsonl_download_uri || info.download_uri)) || CAT.uri;
    if (!adresse) throw new Error("adresse de téléchargement inconnue");
    CAT.ctrl = (typeof AbortController === 'function') ? new AbortController() : null;
    const suivi = nouveauSuivi('réseau', CAT.taille, CAT.tailleBrute);
    CAT.suivi = suivi;
    if (typeof ouvrirBoiteCatalogue === 'function') ouvrirBoiteCatalogue();
    const rep = await fetch(adresse, CAT.ctrl ? {signal:CAT.ctrl.signal} : undefined);
    if (!rep.ok) throw new Error('HTTP ' + rep.status);
    /* Scryfall annonce la taille compressée, mais l'en-tête de la réponse
       fait foi quand elle est là. */
    const annonce = parseInt(rep.headers.get('content-length') || '0', 10);
    if (annonce > 0) suivi.totalRecu = annonce;
    CAT.maj = (info && info.updated_at) || null;
    await lireCatalogueFichier(rep, adresse, suivi);
    S.majIgnoree = null;
    if (typeof fermerBoiteCatalogue === 'function') fermerBoiteCatalogue();
    rafraichirFenetreSauvegarde();
    return true;
  } catch(err) {
    /* Une interruption voulue n'est pas une panne : l'archive déjà en place
       n'a pas été touchée, `CAT.cartes` n'étant remplacé qu'en fin de lecture. */
    if (err.abandon || err.name === 'AbortError' || (CAT.suivi && CAT.suivi.abandon)) {
      CAT.etat = CAT.cartes.length ? 'ok' : '';
      CAT.detail = '';
      if (typeof fermerBoiteCatalogue === 'function') fermerBoiteCatalogue();
      renderSuggestions();
      rafraichirFenetreSauvegarde();
      toast('Chargement de l\'archive interrompu.');
      return false;
    }
    if (typeof fermerBoiteCatalogue === 'function') fermerBoiteCatalogue();
    const bloque = (err instanceof TypeError) || /Failed to fetch|NetworkError|Load failed/i.test(err.message || '');
    CAT.etat = bloque ? 'hors-ligne' : 'erreur';
    CAT.detail = bloque
      ? `le serveur de fichiers de Scryfall (data.scryfall.io) refuse la requête depuis une page tierce. Utilisez le bouton de téléchargement, puis chargez l'archive obtenue — sans la décompresser.`
      : `échec du téléchargement : ${err.message||'erreur inconnue'}`;
    renderSuggestions();
    rafraichirFenetreSauvegarde();
    toast(bloque ? "Téléchargement direct refusé par Scryfall : passez par le lien puis le chargement de fichier."
                 : `Échec : ${err.message||'erreur inconnue'}.`);
    return false;
  } finally {
    CAT.ctrl = null;
  }
}

/* Interrompt le chargement en cours : le drapeau arrête la boucle de lecture,
   l'`AbortController` coupe le téléchargement lui-même. */
function interrompreCatalogue() {
  if (CAT.suivi) CAT.suivi.abandon = true;
  if (CAT.ctrl) { try { CAT.ctrl.abort(); } catch(e) {} }
}

async function chargerCatalogueComplet(force) {
  if (CAT.etat === 'chargement' || typeof fetch !== 'function') return;
  CAT.etat = 'chargement'; CAT.source = 'cache'; renderSuggestions();
  try {
    if (!force) {
      const memo = await idbLire('cartes').catch(() => null);
      if (memo && memo.v >= 1 && memo.v <= 4 && Array.isArray(memo.cartes) && memo.cartes.length && Array.isArray(memo.cartes[0])) {
        CAT.cartes = memo.cartes;
        CAT.maj = memo.maj;
        CAT.etat = 'ok';
        CAT.source = 'cache';
        CAT.octets = memo.octets || tailleEstimee(CAT.cartes);
        CAT.date = memo.date || null;
        CAT.partiel = !!memo.partiel;
        CAT.impressions = memo.impressions || 0;
        appliqueCatalogueAuxCartes();
        if (memo.v < 2) CAT.detail = 'archive d\'une version antérieure : rechargez le fichier Scryfall pour obtenir les visuels des cartes.';
        else if (memo.v < 3) CAT.detail = 'archive d\'une version antérieure : rechargez le fichier Scryfall pour filtrer par set sans réseau.';
        else if (memo.v < 4) CAT.detail = 'archive d\'une version antérieure : rechargez le fichier Scryfall pour distinguer les cartes numériques.';
        invaliderCandidats();
        recalculerAvecProgression(`L'archive Scryfall a été relue depuis ce navigateur (${CAT.cartes.length.toLocaleString('fr-FR')} cartes) : les candidates sont bâties, puis notées.`);
        return;
      }
    }
    CAT.etat = ''; renderSuggestions();
    if (!force && await chargerCatalogueLocal()) return;
  } catch(err) {
    CAT.etat = (err instanceof TypeError) ? 'hors-ligne' : 'erreur';
    renderSuggestions();
    return;
  }
  /* Rien sur cet appareil : l'archive est téléchargée et extraite sans
     fichier intermédiaire, comme le fait le bouton « Mettre à jour ». */
  await telechargerCatalogue();
}

/* Enchaînement du démarrage : on regarde d'abord ce que cet appareil garde
   déjà des cartes existantes, puis ce que Scryfall publie.
     — rien d'archivé          → téléchargement immédiat, sans rien demander ;
     — archive datée           → fenêtre modale qui propose la mise à jour.
   « Plus tard » retient la version refusée pour ne pas reposer la question
   avant que Scryfall n'en publie une autre. */
async function demarrerCatalogue() {
  if (!autoCatalogue()) { verifierMajCatalogue(); return; }
  await chargerCatalogueComplet();
  await verifierMajCatalogue();
  if (catalogueAbsent()) return;
  /* Ne pas proposer par-dessus un chargement en cours : la fenêtre prendrait
     la place de la boîte de progression. */
  if (CAT.suivi) return;
  if (catalogueObsolete() && S.majIgnoree !== CAT.majDispo) proposerMajCatalogue();
}

/* Fenêtre signalant que les données des cartes ont pu changer. */
function proposerMajCatalogue() {
  const publiee = CAT.majDispo ? new Date(CAT.majDispo).toLocaleDateString('fr-FR') : '';
  const locale = CAT.maj ? new Date(CAT.maj).toLocaleDateString('fr-FR') : '';
  const poids = CAT.taille ? ` (${(CAT.taille/1048576).toFixed(0)} Mo)` : '';
  openDialog('Cartes existantes : une version plus récente',
    `<p class="small">${locale
        ? `Les données de cartes archivées sur cet appareil datent du ${esc(locale)}, et Scryfall en publie du ${esc(publiee)}.`
        : `Scryfall publie des données de cartes du ${esc(publiee)} ; celles de cet appareil ne portent pas de date.`}
       Des cartes ont pu paraître, changer de texte ou de prix depuis.</p>
     <p class="small muted">La mise à jour retélécharge l'archive${poids} et n'en garde que les données utiles, sans fichier intermédiaire. Votre collection, votre deck et vos réglages ne sont pas touchés.</p>`,
    `<button type="button" class="btn" data-act="majPlusTard">Plus tard</button>
     <button type="button" class="btn pri" data-act="majMaintenant">Mettre à jour</button>`);
}

/* Bouton « Mettre à jour » de la fenêtre de sauvegarde, et de la fenêtre
   ci-dessus : on teste la version publiée, et l'archive n'est retéléchargée
   que si elle manque ou si elle a vieilli. Les prix suivent dans la foulée. */
async function majCatalogue() {
  if (typeof fetch !== 'function') { toast('Mise à jour impossible dans ce contexte.'); return; }
  if (CAT.etat === 'chargement') { toast('Un chargement du catalogue est déjà en cours.'); return; }
  toast('Vérification des données publiées par Scryfall…');
  const info = await verifierMajCatalogue();
  if (!info && catalogueAbsent()) {
    toast("Scryfall n'a pas répondu : mise à jour impossible pour l'instant.");
    rafraichirFenetreSauvegarde();
    return;
  }
  if (catalogueAbsent() || catalogueObsolete()) {
    await telechargerCatalogue();
    return;
  }
  S.majIgnoree = null;
  toast('Données de cartes déjà à jour ; rafraîchissement des prix…');
  await majPrix(true);
  renderAll();
  rafraichirFenetreSauvegarde();
}
