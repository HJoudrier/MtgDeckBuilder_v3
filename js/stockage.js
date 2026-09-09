/* =====================================================================
   js/stockage.js — Persistance locale (localStorage) & gestion des sauvegardes
   ===================================================================== */

const STORE_KEY = 'mtg-atelier-v1';
const STORE_OFF = 'mtg-atelier-sans-sauvegarde';

const storageOK = (() => {
  try {
    localStorage.setItem('__mtg_test', '1');
    localStorage.removeItem('__mtg_test');
    return true;
  } catch(e) {
    return false;
  }
})();

let saveTimer = null;
let saveState = storageOK ? 'ok' : 'off';
let saveError = '';
let dernierEtatSignale = 'ok';

/* Éditions relevées à l'import : le code d'édition et le numéro de
   collection de l'impression possédée, et la liste de celles qui ont été
   vues. Sans eux, un rechargement rendrait à la carte un visuel et un prix
   d'une autre impression. */
function impressionSnap(c) {
  if (!c.set && !(c.impressions && c.impressions.length)) return {};
  return {
    se: c.set || '', nu: c.num || '', sn: c.setName || '',
    si: c.setImporte ? 1 : 0, ii: c.imgImpression || '', ch: c.impressionChoisie || '',
    im: (c.impressions || []).map(i => [i.set, i.num, i.qty])
  };
}

function impressionRestore(card, o) {
  if (o.se) card.set = o.se;
  if (o.nu) card.num = o.nu;
  if (o.sn) card.setName = o.sn;
  if (o.si) card.setImporte = true;
  if (o.ii) card.imgImpression = o.ii;
  if (o.ch) card.impressionChoisie = o.ch;
  if (Array.isArray(o.im) && o.im.length)
    card.impressions = o.im.map(([set, num, qty]) => ({set, num, qty}));
}

function snapshot() {
  const cartes = [], enrich = [];
  DB.forEach(c => {
    const base = BUILTIN.has(norm(c.name));
    if (base) {
      if (c.img || c.cmUrl || c.artist || c.textFull || c.set) enrich.push({n:c.name, p:c.price, g:c.img||'', G:c.imgN||'', L:c.imgL||'', u:c.cmUrl||'', a:c.artist||'', x:c.textFull ? c.text : '', ...impressionSnap(c)});
    } else if (c.externe && !(S.collection.get(c.name) > 0) && !S.deck.has(c.name) && !annexeDe(c.name)) {
      // vivier d'exploration : non conservé
    } else {
      cartes.push({
        n:c.name, c:c.cost||'—', t:c.type, p:c.price, x:c.text,
        i:(c.identity||[]).join(''), m:c.cmc, f:c.force, e:c.endurance, a:c.artist||'',
        g:c.img||'', G:c.imgN||'', L:c.imgL||'', B:c.imgB||'', BL:c.imgBL||'',
        u:c.cmUrl||'', k:c.unknown?1:0, X:c.textFull?1:0,
        ...(typeof c.legal === 'string' ? {lg:c.legal} : {}), ...impressionSnap(c)
      });
    }
  });

  return {
    v: 1,
    date: Date.now(),
    collection: [...S.collection],
    deck: [...S.deck],
    sideboard: [...S.sideboard],
    considering: [...S.considering],
    deckPlie: [...S.deckPlie],
    groupesPlies: [...S.groupesPlies],
    commander: S.commander,
    colors: [...S.colors],
    colorMode: S.colorMode,
    format: S.format,
    custom: S.custom,
    groupes: S.groupes,
    tris: S.tris,
    filtres: S.filtres,
    view: S.view,
    onglet: S.onglet,
    graphSource: S.graphSource,
    showImplicit: S.showImplicit,
    budget: S.budget,
    candidatsMax: S.candidatsMax,
    catalogueNumeriques: S.catalogueNumeriques,
    filtreLegal: S.filtreLegal,
    csbRelay: S.csbRelay,
    catalogueActif: S.catalogueActif,
    prixMaj: S.prixMaj,
    majIgnoree: S.majIgnoree,
    headerCompact: S.headerCompact,
    cartes,
    enrich
  };
}

function ecrire(payload) {
  localStorage.setItem(STORE_KEY, JSON.stringify(payload));
}

function save() {
  if (!storageOK || saveState === 'desactive') return;
  const snap = snapshot();
  try {
    ecrire(snap);
    saveState = 'ok';
    saveError = '';
  } catch(err) {
    try {
      const leger = {...snap, enrich:[], cartes:snap.cartes.map(c => ({...c, x:'', X:0, g:'', G:'', L:''}))};
      ecrire(leger);
      saveState = 'partiel';
      saveError = 'visuels et textes importés non conservés (espace insuffisant)';
    } catch(err2) {
      saveState = 'plein';
      saveError = err2.message || 'espace de stockage saturé';
    }
  }
  if (saveState !== 'ok' && saveState !== dernierEtatSignale) {
    dernierEtatSignale = saveState;
    toast(saveState === 'partiel'
      ? "Espace de stockage limité : les visuels et les textes des cartes importées ne sont pas conservés, les quantités et le deck le restent."
      : "Sauvegarde impossible : le stockage du navigateur est saturé. Exportez un fichier depuis la fenêtre de sauvegarde pour ne rien perdre.");
  }
  if (saveState === 'ok') dernierEtatSignale = 'ok';
}

function scheduleSave() {
  if (!storageOK || saveState === 'desactive') return;
  clearTimeout(saveTimer);
  saveTimer = setTimeout(save, 700);
}

function restore(d) {
  if (!d || d.v !== 1) return false;
  (d.cartes || []).forEach(o => {
    let card = find(o.n);
    if (!card) card = registerCard(buildCard(o.n, o.c || '—', o.t || 'Inconnu', o.p || 0, o.x || ''));
    if (o.i) card.identity = o.i.split('');
    if (typeof o.m === 'number') card.cmc = o.m;
    if (typeof o.f === 'number' && card.force !== o.f) { card.force = o.f; reanalyser(card); }
    if (typeof o.e === 'number') card.endurance = o.e;
    if (o.a) card.artist = o.a;
    if (o.g) card.img = o.g;
    if (o.G) card.imgN = o.G;
    if (o.L) card.imgL = o.L;
    if (o.u) card.cmUrl = o.u;
    if (o.B) card.imgB = o.B;
    if (o.BL) card.imgBL = o.BL;
    card.unknown = !!o.k;
    if (typeof o.lg === 'string') card.legal = o.lg;
    if (o.X && o.x) card.textFull = true;
    if (card.img) card.imgTried = true;
    impressionRestore(card, o);
  });

  (d.enrich || []).forEach(o => {
    const card = find(o.n);
    if (!card) return;
    if (o.x) majTexteOracle(card, o.x);
    if (o.p) card.price = o.p;
    if (o.a) card.artist = o.a;
    if (o.g) card.img = o.g;
    if (o.G) card.imgN = o.G;
    if (o.L) card.imgL = o.L;
    if (o.u) card.cmUrl = o.u;
    if (card.img) card.imgTried = true;
    impressionRestore(card, o);
  });

  S.collection = new Map((d.collection || []).filter(([n]) => find(n)));
  S.deck = new Map((d.deck || []).filter(([n]) => find(n)));
  /* Les listes annexes suivent le deck, et la même règle : un nom que la base
     ne connaît plus ne revient pas. Une sauvegarde antérieure n'en a pas, et
     les listes restent vides. */
  CLES_ANNEXES.forEach(cle => {
    S[cle] = new Map((d[cle] || []).filter(([n]) => find(n) && !S.deck.has(n)));
  });
  S.commander = d.commander && find(d.commander) ? d.commander : null;
  if (d.colors && d.colors.length !== undefined) S.colors = new Set(d.colors);
  ['colorMode','format','view','graphSource'].forEach(k => { if (d[k]) S[k] = d[k]; });
  /* Le rangement de chaque section, une clé inconnue écartée : une sauvegarde
     d'une version ultérieure ne doit pas laisser la section sans tri. Les
     sauvegardes antérieures ne portent qu'un tri de collection, `sort`, dont
     les valeurs sont justement les clés de `TRIS` : il devient celui-là. */
  ['groupes','tris'].forEach(k => {
    const src = d[k];
    if (!src || typeof src !== 'object') return;
    const table = k === 'groupes' ? GROUPES : TRIS;
    Object.keys(S[k]).forEach(sec => { if (table[src[sec]]) S[k][sec] = src[sec]; });
  });
  if (!d.tris && TRIS[d.sort]) S.tris.collection = d.sort;
  if (typeof d.showImplicit === 'boolean') S.showImplicit = d.showImplicit;
  if (d.custom) S.custom = {...S.custom, ...d.custom, colorLimits:{...S.custom.colorLimits, ...(d.custom.colorLimits||{})}};
  if (d.filtres) S.filtres = {...FILTRES_VIDE, ...d.filtres};
  if (d.budget) S.budget = {...S.budget, ...d.budget};
  if (typeof d.candidatsMax === 'number' && d.candidatsMax > 0) S.candidatsMax = d.candidatsMax;
  if (typeof d.filtreLegal === 'boolean') S.filtreLegal = d.filtreLegal;
  if (typeof d.catalogueNumeriques === 'boolean') S.catalogueNumeriques = d.catalogueNumeriques;
  if (typeof d.csbRelay === 'string') S.csbRelay = d.csbRelay;
  if (typeof d.catalogueActif === 'boolean') S.catalogueActif = d.catalogueActif;
  if (typeof d.prixMaj === 'number') S.prixMaj = d.prixMaj;
  if (typeof d.majIgnoree === 'string') S.majIgnoree = d.majIgnoree;
  if (typeof d.headerCompact === 'boolean') S.headerCompact = d.headerCompact;
  /* L'onglet ouvert revient comme l'entête compact : on retrouve l'atelier là
     où on l'avait laissé. Une clé inconnue — une sauvegarde d'une autre
     version — est écartée, sans quoi plus aucune page ne paraîtrait. */
  if (ONGLETS[d.onglet]) S.onglet = d.onglet;
  /* Les parties repliées de la section Deck, comme l'en-tête compact : une
     préférence d'affichage, qu'on retrouve d'une séance à l'autre. */
  if (Array.isArray(d.deckPlie)) S.deckPlie = new Set(d.deckPlie);
  if (Array.isArray(d.groupesPlies)) S.groupesPlies = new Set(d.groupesPlies);
  return true;
}

function chargerSauvegarde() {
  if (!storageOK) return null;
  try {
    const raw = localStorage.getItem(STORE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch(err) {
    saveState = 'corrompu';
    saveError = err.message || '';
    return null;
  }
}

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
    <div class="small muted" style="margin-top:6px">Le catalogue des cartes existantes, lui, a sa propre fenêtre : la pastille « Catalogue » de l'en-tête.</div>
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

/* La fenêtre de sauvegarde reste ouverte pendant qu'une archive se charge :
   son contenu est réécrit sur place quand l'état du catalogue a bougé. */
/* Rafraîchit celle des deux fenêtres qui est ouverte. Le repère est un
   marqueur explicite : la phrase qui servait autrefois d'indice a déménagé
   avec le bloc du catalogue. */
function rafraichirFenetreSauvegarde() {
  const corps = document.getElementById('dlgBody');
  if (!corps) return;
  if (document.getElementById('blocCatalogue')) {
    const y = corps.scrollTop;
    corps.innerHTML = corpsCatalogue();
    corps.scrollTop = y;
    brancherCatalogue();
    return;
  }
  if (!document.getElementById('blocSauvegarde')) return;
  corps.innerHTML = corpsSauvegarde();
  brancherRestauration();
}

function openSaveDialog() {
  openDialog('Sauvegarde locale', corpsSauvegarde(), '<button class="btn" value="ok">Fermer</button>');
  const sw = document.getElementById('saveSwitch');
  if (sw) sw.addEventListener('change', ev => {
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
    document.getElementById('dlgBody').innerHTML = corpsSauvegarde();
    brancherRestauration();
  });
  brancherRestauration();
  brancherCatalogue();
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
      renderF();
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
