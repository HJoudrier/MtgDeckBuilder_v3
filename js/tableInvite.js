/* =====================================================================
   js/tableInvite.js — Rejoindre la table d'un autre

   On arrive par l'adresse que l'appareil photo a ouverte (`#rejoindre=…`),
   ou par le bouton « Rejoindre une table », qui lit le QR de l'hôte avec la
   caméra de cet appareil — le chemin à prendre quand l'atelier de l'hôte et
   le sien ne sont pas à la même adresse, puisque chacun garde ses decks là
   où il les a rangés. On choisit son nom et un deck de **son** atelier, puis
   on présente à l'hôte le QR de sa réponse. Relié, on envoie ses fiches, et
   la table se peint avec ce que l'hôte envoie.
   ===================================================================== */

/* L'offre d'un hôte, lue dans une adresse ou un texte de QR. */
function lisOffreTexte(t) {
  const m = /#rejoindre=([A-Za-z0-9_-]+)/.exec(String(t || ''));
  if (!m) return null;
  try { return depaquette(deBase64url(m[1])); } catch (e) { return null; }
}

/* Au démarrage : l'adresse porte-t-elle une offre ? On l'efface aussitôt,
   pour qu'un rechargement ne rejoigne pas une seconde fois. */
function rejoindreDepuisAdresse() {
  const o = lisOffreTexte(location.hash);
  if (!o) return false;
  history.replaceState(null, '', location.pathname + location.search);
  ouvreRejoindre(o);
  return true;
}

function ouvreRejoindre(offre) {
  const reprise = offre && localStorage.getItem('mtg-table-jeton') === offre.jeton.join(',') && TABLE.deckEnvoi;
  Object.assign(TABLE, {ouverte: true, phase: 'rejoindre', role: 'invite', offre, liaisonPerdue: false,
    etapeInvite: offre ? (reprise ? 'reponse' : 'deck') : 'scanner'});
  renduTable();
  if (!offre) scanneOffre();
  else if (reprise) pret();
}

async function scanneOffre() {
  const cam = await ouvreCamera(videoTable());
  montreVideo(cam);
  renduTable();
  if (!cam) return;
  const t = await scanne(videoTable(), t => !!lisOffreTexte(t));
  fermeCamera(); montreVideo(false);
  if (t) ouvreRejoindre(lisOffreTexte(t));
}

/* Le lien de l'hôte, collé à la main. */
function lienOffreColle() {
  const c = document.querySelector('[data-tsalon="lienOffre"]');
  const o = c && lisOffreTexte(c.value);
  if (!o) { toast('Ce lien ne contient pas d\'invitation.'); return; }
  fermeCamera(); montreVideo(false);
  ouvreRejoindre(o);
}

function reglageInvite(c, t) {
  if (c === 'inviteNom') { S.table.nom = t.value.trim(); scheduleSave(); return true; }
  if (c === 'inviteDeck') { S.table.deck = t.value; scheduleSave(); return true; }
  return c === 'lienOffre';
}

/* « Prêt » : les fiches du deck choisi, la réponse et son QR. */
async function pret() {
  const cle = S.decks[S.table.deck] ? S.table.deck : S.deckActif;
  TABLE.etapeInvite = 'reponse'; TABLE.reponse = null;
  renduTable();
  await chargeSimCartes();
  let deck = fichesDeDeck(cle);
  if (deck.manquantes.length) { await chercheFichesScryfall(deck.manquantes); deck = fichesDeDeck(cle); }
  TABLE.deckEnvoi = deck;
  if (TABLE.k) TABLE.k.ferme();
  const r = await repondOffre(TABLE.offre);
  TABLE.k = canal(r, recoitHote, etatHote);
  TABLE.reponse = r.paquet;
  localStorage.setItem('mtg-table-jeton', TABLE.offre.jeton.join(','));
  gardeEveil();
  renduTable();
}

function etatHote(e) {
  if (e === 'ouvert') {
    TABLE.liaisonPerdue = false;
    TABLE.k.envoie({t: 'bonjour', nom: S.table.nom || 'Invité', deck: TABLE.deckEnvoi, arrets: S.arrets});
    if (TABLE.phase === 'rejoindre') TABLE.etapeInvite = 'attente';
  } else if (e === 'perdu' || e === 'absent') TABLE.liaisonPerdue = e;
  renduTable();
}

function recoitHote(m) {
  if (m.t === 'debut') { TABLE.phase = 'partie'; TABLE.moi = m.siege; TABLE.journal = []; }
  else if (m.t === 'vue' || m.t === 'question') {
    TABLE.vue = m.v;
    if (m.journal) TABLE.journal = (TABLE.journal || []).concat(m.journal).slice(-400);
    if (m.t === 'question') { TABLE.question = m.q; TABLE.sel = null; TABLE.erreur = ''; TABLE.attenteNom = ''; }
    else TABLE.attenteNom = m.attente || '';
  } else if (m.t === 'erreur') TABLE.erreur = m.err;
  renduTable();
}

function envoieReponse(n, r) { if (TABLE.k) TABLE.k.envoie({t: 'reponse', n, r}); }
function envoieArrets() { if (TABLE.k) TABLE.k.envoie({t: 'arrets', a: S.arrets}); }
function envoiePasseTour() { if (TABLE.k) TABLE.k.envoie({t: 'passeTour'}); }

/* Chez l'invité, la liaison perdue : il faut le QR de reprise de l'hôte. */
function perteHoteHTML() {
  return `<div class="tb-alerte small"><b>${TABLE.liaisonPerdue === 'absent' ? 'L\'hôte ne répond plus' : 'Liaison perdue'}</b> —
    demandez à l'hôte un « QR de reprise », puis lisez-le.
    <button type="button" class="btn sm" data-act="tRejoindre">Lire le QR de reprise</button></div>`;
}

function rejoindreHTML() {
  const e = TABLE.etapeInvite, tete = `<div class="row"><h2 style="margin:0">Rejoindre une table</h2>
    <button type="button" class="btn sm" data-act="tQuitter" style="margin-left:auto">Fermer</button></div>`;
  if (e === 'scanner') return `<div class="tb-salon">${tete}<div class="sim-bloc">
    <div class="small">Visez le QR affiché par l'hôte. ${CAMERA.erreur ? `<b>${esc(CAMERA.erreur)}</b> — collez plutôt le lien :` : 'Ou collez le lien :'}</div>
    <input type="url" data-tsalon="lienOffre" class="tb-code" placeholder="https://…#rejoindre=…">
    <button type="button" class="btn sm" data-act="tLienOffre">Rejoindre</button></div></div>`;
  if (e === 'deck') {
    const decks = clesDecks().map(k => [k, S.decks[k].nom + ' · ' + ((FORMATS[S.decks[k].format] || {}).label || '')]);
    return `<div class="tb-salon">${tete}<div class="sim-bloc">
      <label class="sim-champ">Votre nom <input type="text" data-tsalon="inviteNom" value="${esc(S.table.nom || '')}" placeholder="Votre prénom"></label>
      <label class="sim-champ">Votre deck <select data-tsalon="inviteDeck">${optionsHTML(decks, S.decks[S.table.deck] ? S.table.deck : S.deckActif)}</select></label>
      <div class="row"><button type="button" class="btn pri" data-act="tPret">Prêt</button>
        <span class="small muted">Votre deck part chez l'hôte, cartes comprises : il n'a pas besoin de les connaître.</span></div></div></div>`;
  }
  if (e === 'reponse') return `<div class="tb-salon">${tete}<div class="sim-bloc tb-qr-grand">
    ${TABLE.reponse ? `${qrSVG(qrEcrit(base45(TABLE.reponse)), 'QR à présenter à l\'hôte')}
      <div class="small"><b>Présentez cet écran à la caméra de l'hôte.</b> Sans caméra, il tape ce code :</div>
      <div class="mono tb-code-long">${esc(codeATaper(TABLE.reponse))}</div>` : '<div class="small muted">Préparation de la réponse…</div>'}
    </div></div>`;
  return `<div class="tb-salon">${tete}<div class="sim-bloc">Relié à l'hôte : la partie commence dès que toute la table est prête.</div></div>`;
}
