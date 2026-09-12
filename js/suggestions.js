/* =====================================================================
   js/suggestions.js — Les trois sections des propositions

   Leurs lignes d'état — où en est le catalogue, où en est le budget —, leur
   enveloppe, et le repeint qui ne réécrit que leurs listes. `renderSuggestions()`
   est le seul point d'entrée des autres modules : une donnée qui arrive, d'EDHREC
   ou du catalogue, met les trois pages à jour d'un coup.
   ===================================================================== */

function ligneCatalogue() {
  if (CAT.etat === 'chargement')
    return `<div class="small muted" style="margin-top:4px">Catalogue complet en cours de chargement (${esc(CAT.source||'')})… le classement fonctionne déjà avec vos cartes.</div>`;
  if (CAT.etat === 'ok') {
    const st = statsCandidats() || {};
    const maj = CAT.maj ? new Date(CAT.maj).toLocaleDateString('fr-FR') : '';
    const noeuds = noeudsActifs();
    const n = x => (x || 0).toLocaleString('fr-FR');

    /* Chaque cause d'écart est nommée avec son nombre : c'est la seule façon
       de comprendre pourquoi le catalogue se réduit à ce qu'on propose. */
    const causes = [];
    if (st.legalite) causes.push(`${n(st.legalite)} hors ${esc(fmt().label)}`);
    if (st.identite) causes.push(`${n(st.identite)} hors identité du commandant`);
    if (st.couleurs) causes.push(`${n(st.couleurs)} par vos couleurs`);
    if (st.possedees) causes.push(`${n(st.possedees)} déjà dans votre collection`);
    if (st.prix) causes.push(`${n(st.prix)} au-dessus de ${eur(S.budget.perCard)}`);
    if (st.numeriques) causes.push(`${n(st.numeriques)} numériques`);
    if (st.filtres) causes.push(`${n(st.filtres)} par vos filtres`);
    if (st.noeuds) causes.push(`${n(st.noeuds)} par les effets sélectionnés (${noeuds.map(x =>
      (typeof NODE !== 'undefined' && NODE[x] && NODE[x].label) || x).join(' + ')})`);

    return `<div class="small muted" style="margin-top:4px">
      Catalogue complet : ${n(CAT.cartes.length)} cartes en cache${maj ? ` (Scryfall, ${maj})` : ''}.
      <b>${n(st.retenus)}</b> candidate(s)${causes.length ? ` — écartées : ${causes.join(', ')}` : ' : rien n\'est écarté'}.
      ${st.coupes ? `Les ${n(st.coupes)} moins bien classées par EDHREC ne sont pas examinées,
        le maximum étant fixé à ${n(S.candidatsMax)} (réglable dans les paramètres,
        section « Catalogue des cartes » — l'engrenage de l'entête).` : ''}
      ${st.sansPrix ? `${n(st.sansPrix)} candidate(s) restent sans prix connu : elles comptent ici,
        mais ne peuvent pas être proposées à l'achat.` : ''}
      Les visuels se chargent ensuite, par score décroissant.
      ${catalogueObsolete() ? `<br><b>Une version plus récente du ${esc(new Date(CAT.majDispo).toLocaleDateString('fr-FR'))} est disponible.</b>
        ${CAT.uri ? `<a class="btn sm" href="${esc(CAT.uri)}" download target="_blank" rel="noopener">La télécharger</a>` : ''}
        <button class="btn sm" data-act="saveDialog">La charger</button>` : ''}
    </div>`;
  }
  if (!CAT.etat && typeof indexedDB !== 'undefined' && typeof fetch === 'function')
    return `<div class="small muted" style="margin-top:4px">
      Les suggestions se limitent à votre collection et aux cartes déjà connues.
      ${CAT.uri ? `<a class="btn sm" href="${esc(CAT.uri)}" download target="_blank" rel="noopener">Télécharger le fichier des cartes${CAT.taille?` — ${(CAT.taille/1048576).toFixed(0)} Mo`:''}</a>` : ''}
      <button class="btn sm" data-act="saveDialog" style="margin-left:6px">Le charger dans l'atelier</button>
    </div>`;

  const dispo = S.exploreTotal ? ` sur ${S.exploreTotal.toLocaleString('fr-FR')} légales dans vos couleurs` : '';
  if (S.exploreEtat === 'chargement')
    return `<div class="small muted" style="margin-top:4px">Chargement du catalogue Scryfall : ${S.exploreCharge.toLocaleString('fr-FR')} carte(s)${dispo}…</div>`;

  const msg = {
    'hors-ligne': 'Scryfall injoignable : seules vos cartes sont proposées.',
    erreur: 'Scryfall a répondu par une erreur ; seules vos cartes sont proposées.',
    aucune: 'Aucune carte ne correspond à ce format et à cette identité couleur.'
  }[S.exploreEtat];
  if (msg) return `<div class="small muted" style="margin-top:4px">${esc(msg)}</div>`;

  const hors = DB.filter(c => c.externe && !(S.collection.get(c.name) > 0)).length;
  if (!hors) return '';

  const reste = S.budget.total - spent();
  let ecartees = 0;
  DB.forEach(c => {
    if (!c.externe || (S.collection.get(c.name) || 0) > 0 || c.isToken || !colorOK(c)) return;
    const o = bestOffer(c);
    if (!o || o.price > reste) ecartees++;
  });

  return `<div class="small muted" style="margin-top:4px">
    Catalogue : ${S.exploreCharge.toLocaleString('fr-FR')} carte(s) chargées${dispo}.
    ${ecartees ? `${ecartees.toLocaleString('fr-FR')} écartée(s) par le prix maximum (${eur(S.budget.perCard)}) ou le budget restant (${eur(Math.max(0,reste))}).` : ''}
    Les visuels se chargent ensuite, par score décroissant.
    ${S.exploreReste ? `<button class="btn sm" data-act="catalogueSuite" style="margin-left:6px">Charger la suite</button>` : ''}
  </div>`;
}

/* Le budget et les préférences d'achat se règlent désormais dans la fenêtre
   « Achats sur Cardmarket », ouverte par la pastille « Budget » de l'en-tête
   (js/fenBudget.js). Ces deux lignes en peignent le résumé, et la fenêtre les lit
   sous son brouillon : elles annoncent donc ce que « Appliquer » donnerait. */
function ligneBudget() {
  const left = S.budget.total - spent();
  return S.budget.total > 0 && S.budget.perCard > 0
    ? `Dépensé ${eur(spent())} · reste ${eur(Math.max(0, left))}`
    : 'Budget à zéro : seules les cartes de votre collection sont proposées.';
}

function ligneAchats() {
  const buys = aAcheter();
  if (!buys.length) return '';
  return `<div class="small" style="margin-top:6px">À acheter : ${buys.map(l => `<a href="${esc(cmLink(l.card))}" target="_blank" rel="noopener" style="color:var(--brass)">${esc(l.card.name)}</a> ×${l.qty} (${eur(l.total)})`).join(' · ')}</div>
     <div class="row" style="margin-top:6px"><button class="btn" data-act="wants">Exporter la liste de wants Cardmarket</button></div>`;
}

let visuelsEnCours = false;
const VISUELS_CHARGES = new Set();

/* Les visuels partent par paquets de six, pour ne pas ouvrir cent requêtes
   d'un coup. Le paquet suivant est relu dans le document à chaque tour,
   jamais figé au départ : un nouveau rendu remplace les vignettes en place,
   et une liste figée finirait de remplir des images détachées du document
   pendant que celles réellement affichées resteraient vides — c'est ce qui
   arrivait à l'import du catalogue, qui rend à nouveau tous les 25 000
   enregistrements. Le garde-fou évite qu'un paquet dont les évènements ne
   reviennent pas (image retirée en vol) n'arrête la file pour de bon. */
function chargeVisuelsClasses() {
  if (visuelsEnCours || typeof document.querySelectorAll !== 'function') return;
  visuelsEnCours = true;
  const suivant = () => {
    const lot = [...document.querySelectorAll('img.cimg[data-src]')].slice(0, 6);
    if (!lot.length) { visuelsEnCours = false; return; }
    let restants = lot.length, clos = false;
    const passer = () => { if (clos) return; clos = true; clearTimeout(garde); setTimeout(suivant, 60); };
    const fini = () => { if (--restants <= 0) passer(); };
    const garde = setTimeout(passer, 8000);
    lot.forEach(img => {
      const src = img.getAttribute('data-src'), nom = img.getAttribute('data-nom');
      img.removeAttribute('data-src');
      img.addEventListener('load', () => {
        img.classList.remove('attente');
        if (nom) VISUELS_CHARGES.add(nom);
        fini();
      }, {once:true});
      img.addEventListener('error', fini, {once:true});
      img.src = src;
    });
  };
  suivant();
}

/* Le décompte d'une section, dans son en-tête : « 104 pistes ». Il dit ce que
   la page montre, non ce que la notation a trouvé — chaque section a le sien
   depuis qu'elles sont trois. */
function majHint(idSection, texte) {
  const el = document.getElementById('hint' + idSection.slice(3));
  if (el) el.textContent = texte;
}

/* Poser le contenu d'une section sans en refaire l'enveloppe : les
   conteneurs nommés survivent d'un rendu à l'autre, et seuls leurs contenus
   sont réécrits. C'est ce qui garde sa place au lecteur qui parcourait le
   milieu d'une liste de trois cents vignettes : réécrire le corps entier le
   ramènerait au début. L'enveloppe n'est bâtie qu'au premier rendu, ou si un
   conteneur manque. */
function poseCorps(idCorps, morceaux) {
  if (morceaux.every(([id]) => document.getElementById(id))) {
    morceaux.forEach(([id, html]) => { document.getElementById(id).innerHTML = html; });
    return;
  }
  const corps = document.getElementById(idCorps);
  if (corps) corps.innerHTML = morceaux.map(([id, html]) => `<div id="${id}">${html}</div>`).join('');
}

/* Le filet : un changement a rendu la sélection caduque sans passer par un
   geste identifié — une archive qui finit de charger, une réponse de
   Scryfall, un réglage venu d'ailleurs. Plutôt que de figer la fenêtre le
   temps de noter des dizaines de milliers de cartes, les sections gardent ce
   qu'elles affichent et le recalcul repart par tranches, annoncé comme les
   autres : leurs scores datent d'un instant, et c'est le liseré des en-têtes
   qui le dit. Vider les listes ferait fondre les sections de quelques
   milliers de pixels à une ligne, et le navigateur ramènerait le défilement
   au début. */
function filetSuggestions() {
  if (suggestionsAJour() || recalculEnCours
      || typeof recalculLong !== 'function' || !recalculLong()) return false;
  setTimeout(() => recalculerAvecProgression(
    'Les suggestions se recalculent après un changement de l\'atelier.', {fond:true}), 0);
  return true;
}

/* Les trois sections des propositions, peintes ensemble : la sélection n'est
   partitionnée qu'une fois, et une donnée qui arrive — d'EDHREC, du
   catalogue, de Scryfall — les met toutes les trois à jour. C'est le point
   d'entrée des autres modules. */
function renderSuggestions() {
  if (filetSuggestions()) return;
  const sel = selectionSuggestions();
  renderG(sel);
  renderH(sel);
  renderF(sel);
  lanceEdhrecSiBesoin();
}

/* La section du graphe (onglet Graphe) : les pistes branchées sur les nœuds
   isolés. Le graphe lui-même — `renderD()`, js/graphe.js — la précède sur la
   page et ne dépend pas de la notation. */
function renderG(sel) {
  if (filetSuggestions()) return;
  const s = sel || selectionSuggestions();
  poseCorps('bodyG', [['grapheList', blocGraphe(s)]]);
  const actifs = noeudsActifs();
  majHint('secG', actifs.length
    ? `${s.graphPicks.length} piste(s) · ${actifs.length} nœud(s) isolé(s)`
    : 'aucun nœud isolé');
}

/* La section EDHREC (onglet EDHREC) : le panneau du commandant, puis les
   cartes que les decks recensés recommandent. */
function renderH(sel) {
  if (filetSuggestions()) return;
  const s = sel || selectionSuggestions();
  poseCorps('bodyH', [['edhrecPanneau', panneauEdhrec()], ['edhrecList', blocEdhrec(s)]]);
  const e = S.edhrec || {};
  majHint('secH', !fmt().commander ? 'hors Commander'
    : e.status === 'loading' ? 'chargement…'
    : `${s.edhrecPicks.length} recommandation(s)${e.data ? ` · ${e.data.total.toLocaleString('fr-FR')} decks recensés` : ''}`);
  lanceEdhrecSiBesoin();
}

/* La section du catalogue (onglet Catalogue) : l'état du catalogue, puis tout
   le classement. */
function renderF(sel) {
  if (filetSuggestions()) return;
  const s = sel || selectionSuggestions();
  poseCorps('bodyF', [['catLine', ligneCatalogue()], ['sugList', listeSuggestions(s)]]);
  majHint('secF', `${s.sug.length} pistes`);
}

/* Rafraîchir sans rien recalculer : la pagination d'une liste, un
   groupement, un tri. L'en-tête suit, ses pastilles comptant les mêmes
   pistes. */
function refreshSuggestions() {
  renderSuggestions();
  renderTop();
}

/* Les statistiques du commandant sont demandées dès que celui-ci change —
   d'où que vienne le rendu, complet ou en place. */
function lanceEdhrecSiBesoin() {
  const secCmds = commandantsSecondaires();
  const cmdSig = signatureCommandants();
  if (fmt().commander && (S.commander || secCmds.length) && typeof fetch === 'function'
     && S.edhrec.cmdSignature !== cmdSig && S.edhrec.status !== 'loading') {
    setTimeout(() => loadEdhrec(), 0);
  }
}
