/* =====================================================================
   js/tableLiaison.js — Les invités de l'hôte

   Chaque siège d'invité a sa connexion, son jeton et son QR : l'hôte le
   montre, l'invité le lit, montre sa réponse, et la caméra de l'hôte la lit
   — ou l'hôte tape le code. Relié, l'invité envoie son nom, son deck (les
   fiches de son atelier) et ses arrêts. Pendant la partie, l'hôte lui envoie
   sa vue, ses questions, le journal ; un invité perdu peut être repris par un
   nouveau QR (même jeton, même siège) ou confié à un joueur automatique.

   La caméra de l'hôte est ouverte **avant** de créer les offres : tant
   qu'elle tourne, le navigateur dévoile les vraies adresses locales.
   ===================================================================== */

TABLE.distants = {};

/* L'adresse où les téléphones trouvent l'atelier : celle qu'on a réglée, ou
   celle de cette page si elle est servie en http(s). */
function adressePublique() {
  const a = String(S.table.adresse || '').trim();
  if (a) return a.replace(/#.*$/, '');
  return /^https?:$/.test(location.protocol) ? location.origin + location.pathname.replace(/index\.html$/, '') : '';
}

function texteOffre(s) { return (adressePublique() || 'atelier-mtg:') + '#rejoindre=' + base64url(s.paquet); }

/* La vidéo de la caméra : un seul élément, posé une fois hors de la table,
   pour que les repeints de la table ne coupent pas son flux. */
function videoTable() {
  let v = document.getElementById('tableVideo');
  if (!v) { v = document.createElement('video'); v.id = 'tableVideo'; v.className = 'tb-video'; document.body.appendChild(v); }
  return v;
}

function montreVideo(oui) { videoTable().classList.toggle('visible', !!oui); }

/* Ajouter un siège d'invité : la caméra, puis l'offre et son QR. */
async function ajouteInvite() {
  if (S.table.sieges.length >= 5) return;
  const cle = 'i-' + Math.random().toString(36).slice(2, 8);
  S.table.sieges.push({mode: 'distant', cle});
  const s = {mode: 'distant', cle, nom: 'Invité', jeton: jetonNeuf(), etat: 'preparation', arrets: arretsParDefaut()};
  TABLE.distants[cle] = s;
  renduTable();
  const cam = await ouvreCamera(videoTable());
  montreVideo(cam);
  await prepareOffre(s);
  if (cam) scanneReponses();
}

async function prepareOffre(s) {
  if (s.k) s.k.ferme();
  const o = await creeOffre(s.jeton);
  s.conn = o; s.paquet = o.paquet; s.etat = 'attente';
  s.k = canal(o, m => recoitDistant(s, m), e => etatDistant(s, e));
  renduTable();
}

/* Lire à la caméra les réponses des invités qui en attendent une. */
async function scanneReponses() {
  if (CAMERA.actif) return;
  while (Object.values(TABLE.distants).some(s => s.etat === 'attente')) {
    const t = await scanne(videoTable(), t => !!sautReponse(t));
    if (t == null) break;
    await relie(sautReponse(t));
  }
  CAMERA.actif = false;
}

/* Une réponse lue (base45) ou tapée (base32), si elle va avec un siège qui
   l'attend. */
function sautReponse(t, tape) {
  try {
    const d = depaquette(tape ? deCodeATaper(t) : deBase45(t));
    const s = Object.values(TABLE.distants).find(x => x.etat === 'attente' && x.jeton.join() === d.jeton.join());
    return s ? {s, d} : null;
  } catch (e) { return null; }
}

async function relie(r) {
  if (!r) return;
  r.s.etat = 'connexion';
  renduTable();
  try { await appliqueReponse(r.s.conn.pc, r.d); } catch (e) { r.s.etat = 'attente'; toast('Réponse refusée : ' + e.message); renduTable(); }
}

/* « Relier » avec le code tapé. */
function relieCode(cle) {
  const champ = document.querySelector(`[data-tsalon="code"][data-cle="${cle}"]`);
  const r = champ && sautReponse(champ.value, true);
  if (!r) { toast('Code illisible ou d\'un autre siège : vérifiez chaque groupe.'); return; }
  relie(r);
}

function etatDistant(s, e) {
  if (e === 'ouvert') {
    s.etat = s.fiches ? 'pret' : 'relie';
    if (TABLE.h) renvoieTout(s);
  } else s.etat = e;
  if (!Object.values(TABLE.distants).some(x => x.etat === 'attente')) { fermeCamera(); montreVideo(false); }
  renduTable();
}

function recoitDistant(s, m) {
  const i = TABLE.sieges.indexOf(s);
  if (m.t === 'bonjour') {
    if (!m.deck || !Array.isArray(m.deck.cartes) || !Array.isArray(m.deck.commandants)) return;
    s.nom = String(m.nom || 'Invité').slice(0, 40); s.fiches = m.deck;
    s.arrets = {...arretsParDefaut(), ...(m.arrets || {})};
    s.etat = 'pret';
    return renduTable();
  }
  if (i < 0) return;
  if (m.t === 'reponse') recoitReponse(i, m.n, m.r);
  else if (m.t === 'arrets') s.arrets = {...s.arrets, ...(m.a || {})};
  else if (m.t === 'passeTour') passeJusquaMonTour(i);
}

/* Ce que l'hôte envoie à un invité pendant la partie. */
function envoieDebut() {
  TABLE.sieges.forEach((s, i) => { if (s.mode === 'distant' && s.k) { s.journalVu = 0; s.k.envoie({t: 'debut', siege: i}); envoieVue(s, i); } });
  gardeEveil();
}

function nouvellesLignes(s) {
  const j = journalTable(), r = j.slice(s.journalVu || 0);
  s.journalVu = j.length;
  return r;
}

function envoieVue(s, i) {
  if (s.k) s.k.envoie({t: 'vue', v: vue(TABLE.h.P, i), journal: nouvellesLignes(s), attente: TABLE.attenteNom});
}

function envoieQuestion(s, q) {
  if (s.k) s.k.envoie({t: 'question', q: questionPourUI(TABLE.h.P, q), v: vue(TABLE.h.P, q.joueur), journal: nouvellesLignes(s)});
}

function envoieErreur(s, n, err) { if (s.k) s.k.envoie({t: 'erreur', n, err}); }

/* Un invité revenu : sa place, sa vue, et la question qui l'attendait. */
function renvoieTout(s) {
  const i = TABLE.sieges.indexOf(s);
  if (i < 0 || !s.k) return;
  s.journalVu = 0;
  s.k.envoie({t: 'debut', siege: i});
  const q = TABLE.h.attente;
  if (q && q.joueur === i) envoieQuestion(s, q); else envoieVue(s, i);
}

/* Un nouveau QR pour un invité perdu : même jeton, même siège. */
async function repriseInvite(cle) {
  const s = TABLE.distants[cle];
  if (!s) return;
  s.confie = false;
  const cam = await ouvreCamera(videoTable());
  montreVideo(cam);
  await prepareOffre(s);
  if (cam) scanneReponses();
}

function confieInvite(cle) {
  const s = TABLE.distants[cle];
  if (!s) return;
  s.confie = true;
  renduTable();
  boucleTable();
}

function oublieDistant(cle) {
  const s = TABLE.distants[cle];
  if (s && s.k) s.k.ferme();
  delete TABLE.distants[cle];
}

function fermeLiaisons() {
  Object.keys(TABLE.distants).forEach(oublieDistant);
  if (TABLE.k) { TABLE.k.ferme(); TABLE.k = null; }
  fermeCamera(); montreVideo(false);
  S.table.sieges = S.table.sieges.filter(s => s.mode !== 'distant');
}

/* Garder l'écran allumé pendant la partie : un téléphone en veille perd la
   liaison au bout d'une trentaine de secondes. */
function gardeEveil() {
  if (navigator.wakeLock && !TABLE.eveil) navigator.wakeLock.request('screen').then(w => { TABLE.eveil = w; }).catch(() => {});
}
