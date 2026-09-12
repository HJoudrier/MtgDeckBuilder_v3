/* =====================================================================
   js/fenSauvegarde.js — Les sections « Sauvegarde » et « Catalogue » des paramètres

   Ce que l'appareil garde, ce qu'il a coûté d'octets, et les gestes qui
   agissent au clic : enregistrer, exporter, restaurer un fichier, télécharger
   ou effacer l'archive. Rien ici n'attend « Appliquer » — différer « effacer
   l'archive » derrière un bouton de validation serait déroutant.
   ===================================================================== */

function corpsSauvegarde() {
  const etat = {
    ok: 'Vos données sont enregistrées dans ce navigateur, à chaque modification.',
    partiel: `Enregistrement allégé : ${esc(saveError||'espace limité')}.`,
    plein: `Enregistrement impossible : ${esc(saveError||'espace saturé')}.`,
    off: "Ce navigateur refuse le stockage local ici. Téléchargez le fichier et ouvrez-le depuis votre disque.",
    desactive: "La sauvegarde est désactivée : rien n'est écrit sur cet appareil, et tout sera perdu au rechargement.",
    corrompu: 'La sauvegarde existante est illisible et a été ignorée.'
  }[saveState] || '';

  const taille = (() => {
    try {
      const v = localStorage.getItem(STORE_KEY);
      return v ? Math.round(v.length/1024) + ' Ko' : 'aucune donnée';
    } catch(e) { return '—'; }
  })();

  return `<div id="blocSauvegarde"></div>
    <div class="small">${etat}</div>
    <div class="small muted">Les données ne quittent jamais cet appareil : ni serveur, ni compte. Un autre navigateur ne les verra pas — utilisez l'export pour les transporter.
      ${saveState==='desactive'?'':`<br>Espace occupé : ${taille}.`}</div>
    <label class="row small" style="gap:8px;margin-top:4px">
      <input type="checkbox" id="saveSwitch" ${saveState==='desactive'?'':'checked'} ${storageOK?'':'disabled'}>
      Enregistrer mes données sur cet appareil
    </label>
    <div class="small muted">Décochez sur un ordinateur qui n'est pas le vôtre : les données déjà enregistrées sont effacées immédiatement, et plus rien n'est écrit ensuite.</div>
    <div class="row" style="gap:6px;margin-top:6px">
      <button type="button" class="btn sm" data-act="saveNow">Enregistrer maintenant</button>
      <button type="button" class="btn sm" data-act="saveExport">Exporter un fichier</button>
      <label class="btn sm" for="saveFile" style="margin:0;cursor:pointer">Restaurer un fichier</label>
      <input id="saveFile" type="file" accept="application/json,.json" style="position:absolute;width:1px;height:1px;opacity:0;pointer-events:none">
      <button type="button" class="btn sm danger" data-act="saveWipe">Effacer les données locales</button>
    </div>`;
}

function blocCatalogue() {
  const dispo = (typeof indexedDB !== 'undefined');
  const taille = CAT.octets ? `${(CAT.octets/1048576).toFixed(1)} Mo` : '—';
  const maj = CAT.maj ? new Date(CAT.maj).toLocaleDateString('fr-FR') : 'inconnue';
  const vue = CAT.date ? new Date(CAT.date).toLocaleDateString('fr-FR') : '—';
  const etat = {
    '': 'jamais chargé',
    chargement: `chargement en cours (${CAT.source||''})`,
    ok: `${CAT.cartes.length.toLocaleString('fr-FR')} cartes archivées${CAT.partiel?' (archive partielle : les plus jouées)':''}`,
    'hors-ligne': 'aucune réponse du réseau',
    erreur: 'échec du dernier chargement'
  }[CAT.etat] || CAT.etat;

  return `<div class="bloc" id="blocCatalogue" style="border-top:1px solid var(--line);padding-top:9px;margin-top:4px">
    <h4 style="margin:0 0 6px;font-family:var(--display);font-size:14px">Gestion de l'archive</h4>
    <div class="small">${dispo
      ? `Archivé dans IndexedDB, séparément de vos données de collection — le quota de localStorage, 5 Mo, ne suffirait pas.`
      : `IndexedDB indisponible dans ce navigateur : le catalogue ne peut pas être archivé.`}</div>
    <div class="scroll" style="margin-top:6px"><table class="tbl">
      <tbody>
        <tr><td>État</td><td>${esc(etat)}</td></tr>
        ${CAT.detail ? `<tr><td>Détail</td><td>${esc(CAT.detail)}</td></tr>` : ''}
        <tr><td>Source</td><td>${esc({cache:'cache local', réseau:'fichier groupé Scryfall', recherche:'API de recherche Scryfall'}[CAT.source] || '—')}</td></tr>
        <tr><td>Taille de l'archive</td><td>${taille}${CAT.impressions && CAT.impressions > CAT.cartes.length
          ? ` <span class="muted">(${CAT.impressions.toLocaleString('fr-FR')} impressions réduites à une entrée par carte)</span>` : ''}</td></tr>
        <tr><td>Données Scryfall du</td><td>${esc(maj)}</td></tr>
        <tr><td>Version disponible</td><td>${CAT.majDispo
          ? esc(new Date(CAT.majDispo).toLocaleDateString('fr-FR')) + (catalogueObsolete() ? ' — <b>plus récente</b>' : ' — à jour')
          : 'non vérifiée'}</td></tr>
        <tr><td>Dernier chargement</td><td>${esc(vue)}</td></tr>
        <tr><td>Prix rafraîchis le</td><td>${S.prixMaj ? esc(new Date(S.prixMaj).toLocaleDateString('fr-FR')) : 'jamais'}</td></tr>
      </tbody></table></div>
    <label class="row small" style="gap:8px;margin-top:6px">
      <input type="checkbox" id="catSwitch" ${S.catalogueActif?'checked':''} ${dispo?'':'disabled'}>
      Archiver toutes les cartes existantes sur cet appareil
    </label>
    <div class="small muted">${CAT.taille ? `Environ ${(CAT.taille/1048576).toFixed(0)} Mo téléchargés` : 'Un téléchargement'} une seule fois, puis quelques mégaoctets conservés. Sans archive, les suggestions se limitent à votre collection et à une recherche en ligne réduite.</div>
    <div class="small muted" style="margin-top:6px"><b>Mettre à jour</b> compare l'archive de cet appareil à celle que publie Scryfall : elle n'est retéléchargée et réextraite que si elle manque ou si elle a vieilli, sinon seuls les prix sont rafraîchis. <b>Télécharger et extraire</b> force ce téléchargement, sans fichier intermédiaire. Si Scryfall refuse la requête directe, passez par le lien de téléchargement puis par le chargement de l'archive obtenue.</div>
    <div class="row" style="gap:6px;margin-top:6px">
      <label class="btn sm" for="catFile" style="margin:0;cursor:pointer">Charger une archive téléchargée</label>
      <input id="catFile" type="file" accept=".gz,.json,.jsonl,application/json,application/gzip"
             style="position:absolute;width:1px;height:1px;opacity:0;pointer-events:none">
      <button type="button" class="btn sm" data-act="catalogueTelecharger" ${dispo&&S.catalogueActif?'':'disabled'}>Télécharger et extraire</button>
      <button type="button" class="btn sm pri" data-act="catalogueMaj">Mettre à jour</button>
      <button type="button" class="btn sm danger" data-act="catalogueEffacer" ${dispo?'':'disabled'}>Effacer l'archive</button>
    </div>
    ${(!CAT.etat || catalogueObsolete()) ? `<div class="warnbox" style="margin:8px 0">
      ${CAT.etat ? `Votre archive date du ${esc(maj)} ; Scryfall publie une version du ${esc(CAT.majDispo ? new Date(CAT.majDispo).toLocaleDateString('fr-FR') : '')}.`
                : 'Aucune archive : les suggestions se limitent à votre collection.'}
      ${CAT.uri ? `<div class="row" style="gap:6px;margin-top:6px">
        <a class="btn sm pri" href="${esc(CAT.uri)}" download target="_blank" rel="noopener">Télécharger oracle-cards${CAT.taille ? ` — ${(CAT.taille/1048576).toFixed(0)} Mo` : ''}</a>
        <span class="small muted">archive compressée${CAT.tailleBrute ? `, ${(CAT.tailleBrute/1048576).toFixed(0)} Mo une fois décompressée` : ''} — chargez-la telle quelle ci-dessous</span></div>`
        : `<div class="small muted" style="margin-top:4px">Adresse de téléchargement non vérifiée pour l'instant.</div>`}
    </div>` : ''}
    <div class="small muted" style="margin-top:4px">L'archive <i>oracle-cards</i> de Scryfall, au format JSONL compressé, est lue telle quelle, sans décompression préalable ni requête réseau. Posé à côté de cette page sous l'un des noms ${esc(FICHIERS_LOCAUX.slice(0,4).join(', '))}, il est même détecté tout seul — à condition d'ouvrir la page par un serveur local, car un navigateur interdit à une page <i>file://</i> de lire ses fichiers voisins.</div>
  </div>`;
}

/* La fenêtre des paramètres reste ouverte pendant qu'une archive se charge :
   son contenu est réécrit sur place quand l'état du catalogue a bougé. Le
   repère est un marqueur explicite — le bloc du catalogue, qui n'existe que
   là. */
function rafraichirFenetreSauvegarde() {
  if (typeof majFenetreParametres === 'function') majFenetreParametres();
}

/* L'interrupteur de la sauvegarde, dans la section « Sauvegarde locale » de
   la fenêtre des paramètres : cocher réactive et réécrit tout, décocher
   efface sur-le-champ ce que cet appareil gardait. La section est ensuite
   réécrite pour dire le nouvel état. */
function brancherSauvegarde() {
  const sw = document.getElementById('saveSwitch');
  if (!sw) return;
  sw.addEventListener('change', ev => {
    if (ev.target.checked) {
      try { localStorage.removeItem(STORE_OFF); } catch(e) {}
      saveState = 'ok';
      save();
      toast('Sauvegarde réactivée : vos données sont enregistrées sur cet appareil.');
    } else {
      try { localStorage.removeItem(STORE_KEY); localStorage.setItem(STORE_OFF, '1'); } catch(e) {}
      idbVider();
      saveState = 'desactive';
      dernierEtatSignale = 'desactive';
      toast("Sauvegarde désactivée et données effacées de cet appareil.");
    }
    renderTop();
    if (typeof majFenetreParametres === 'function') majFenetreParametres();
  });
}

function brancherCatalogue() {
  const cf = document.getElementById('catFile');
  if (cf) cf.addEventListener('change', async ev => {
    const f = ev.target.files && ev.target.files[0];
    if (!f) return;
    try {
      /* Un fichier posé à la main se lit aussi longuement qu'une archive
         téléchargée : la même boîte en rend compte. Sa taille décompressée
         reste inconnue, la seconde barre affichera donc un compte seul. */
      const suivi = nouveauSuivi('fichier', f.size || 0, 0);
      CAT.suivi = suivi;
      ouvrirBoiteCatalogue();
      await lireCatalogueFichier(f, f.name, suivi);
      fermerBoiteCatalogue();
      rafraichirFenetreSauvegarde();
    } catch(err) {
      fermerBoiteCatalogue();
      if (err.abandon) { toast('Lecture de l\'archive interrompue.'); return; }
      CAT.etat = 'erreur';
      CAT.detail = `lecture du fichier impossible : ${err.message || 'format inattendu'}`;
      renderSuggestions();
      toast(`Fichier illisible : ${err.message || 'format inattendu'}.`);
    }
  });

  const cs = document.getElementById('catSwitch');
  if (!cs) return;
  cs.addEventListener('change', ev => {
    S.catalogueActif = ev.target.checked;
    scheduleSave();
    if (S.catalogueActif) {
      toast('Archivage activé : le catalogue se charge en tâche de fond.');
      chargerCatalogueComplet();
    } else {
      toast("Archivage désactivé, archive effacée.");
      idbVider().then(() => {
        CAT.etat = '';
        CAT.cartes = [];
        CAT.octets = 0;
        CAT.date = null;
        invaliderCandidats();
        renderAll();
      });
    }
    rafraichirFenetreSauvegarde();
  });
}

function brancherRestauration() {
  const sf = document.getElementById('saveFile');
  if (!sf) return;
  sf.addEventListener('change', async ev => {
    const f = ev.target.files && ev.target.files[0];
    if (!f) return;
    try {
      const d = JSON.parse(await f.text());
      if (!restore(d)) throw new Error('format non reconnu');
      renderAll();
      save();
      toast(`Sauvegarde restaurée : ${collectionCards().reduce((n,e)=>n+e.qty,0)} exemplaires, deck de ${deckSize()} cartes.`);
    } catch(err) {
      toast(`Fichier illisible : ${err.message || 'format invalide'}.`);
    }
  });
}
