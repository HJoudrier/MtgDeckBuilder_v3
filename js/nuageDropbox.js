/* =====================================================================
   js/nuageDropbox.js — L'adaptateur Dropbox

   Trois raisons l'ont fait préférer aux autres nuages, toutes tenant à ce
   qu'un atelier sans serveur peut faire :

   — **PKCE sans secret.** Le flux à code de preuve n'exige aucun secret
     d'application : une page statique peut s'authentifier honnêtement, ce
     qu'un flux classique lui interdit. Le `client_id` est public par
     construction, il peut donc vivre dans le dépôt.
   — **Un jeton qui dure.** `token_access_type=offline` rend un jeton de
     rafraîchissement sans échéance : on se connecte une fois par appareil, et
     plus jamais. Google Drive n'accorde qu'une heure, et redemande un clic.
   — **Un vrai verrou.** `files/upload` en mode `update` exige le `rev` du
     fichier qu'on croit remplacer, et refuse en 409 si un autre appareil a
     écrit entre-temps. C'est un compare-and-swap : sans lui, de deux PC qui
     poussent en même temps, l'un est perdu silencieusement. L'API de Google
     Drive n'a pas d'équivalent depuis qu'elle a retiré les `ETag`.

   L'application est de type « App folder » : l'atelier ne voit que son propre
   dossier, et rien du reste du Dropbox.
   ===================================================================== */

/* La clé de l'application Dropbox. Publique par nature dans un flux PKCE —
   elle paraît dans chaque adresse de redirection —, elle peut donc être
   inscrite ici une fois pour toutes : les deux appareils marchent alors sans
   rien saisir. Laissée vide, la fenêtre des paramètres la demande. */
const NUAGE_DBX_CLE = '';

const DBX_AUTORISE = 'https://www.dropbox.com/oauth2/authorize';
const DBX_JETON = 'https://api.dropboxapi.com/oauth2/token';
const DBX_API = 'https://api.dropboxapi.com/2';
const DBX_CONTENU = 'https://content.dropboxapi.com/2';

/* Ce que Dropbox doit retrouver à l'identique dans sa liste d'adresses
   autorisées. `index.html` est retiré : on ouvre l'atelier tantôt par le
   dossier, tantôt par le fichier, et Dropbox exige une correspondance
   exacte. */
function dbxRetour() {
  return location.origin + location.pathname.replace(/index\.html$/, '');
}

function dbxBase64Url(octets) {
  let s = '';
  octets.forEach(o => { s += String.fromCharCode(o); });
  return btoa(s).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

/* Le code de preuve : un secret tiré au hasard qu'on garde, et son empreinte
   qu'on annonce. Dropbox ne rend le jeton qu'à qui sait le premier — d'où
   l'inutilité d'un secret d'application. */
async function dbxDefi() {
  const verifieur = dbxBase64Url(crypto.getRandomValues(new Uint8Array(64)));
  const somme = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(verifieur));
  return {verifieur, defi: dbxBase64Url(new Uint8Array(somme))};
}

/* Un échec de `fetch` sans réponse est presque toujours la barrière CORS ou
   l'absence de réseau, jamais un refus de Dropbox : le dire ainsi épargne une
   heure de recherche du côté du jeton. */
function dbxErreurReseau(err) {
  const e = new Error("aucune réponse de Dropbox — réseau coupé, ou l'atelier est "
    + (location.protocol === 'file:'
      ? "ouvert en fichier local (file://) : la connexion demande une adresse http"
      : "servi depuis une origine que Dropbox refuse"));
  e.reseau = true;
  e.cause = err;
  return e;
}

async function dbxJson(reponse) {
  const txt = await reponse.text();
  try { return txt ? JSON.parse(txt) : {}; } catch(e) { return {brut: txt}; }
}

/* Ce que Dropbox renvoie prend deux formes, et la seconde est la plus utile :
   un JSON dont `error_summary` est un chemin d'erreur — « path/conflict/file/… » —,
   ou, sur une requête malformée, un texte brut qui nomme précisément ce qui
   cloche (« HTTP header "Dropbox-API-Arg" : … »). Ce texte était jeté ; il est
   désormais gardé et montré, de même que l'appel d'où vient le refus. Un
   résumé tronqué en « other/… » ne se diagnostique pas, et faire essayer des
   correctifs au hasard coûte plus cher que de rapporter la phrase entière. */
function dbxErreur(reponse, corps, ou) {
  const resume = (corps && (corps.error_summary || corps.error_description)) || '';
  const brut = (corps && corps.brut ? String(corps.brut) : '').trim();
  const dit = resume || brut.slice(0, 400);
  const e = new Error(`Dropbox a refusé ${ou ? `(${ou}) ` : ''}— ${reponse.status}${dit ? ' : ' + dit : ''}`);
  e.statut = reponse.status;
  e.resume = resume;
  e.brut = brut;
  e.ou = ou || '';
  e.detail = [`appel : ${ou || '?'}`, `statut : ${reponse.status}`,
    resume ? `résumé : ${resume}` : '', brut ? `réponse : ${brut.slice(0, 800)}` : '']
    .filter(Boolean).join('\n');
  e.conflit = /conflict/.test(resume);
  e.absent = /not_found/.test(resume);
  e.jetonMort = reponse.status === 401 || /invalid_access_token|expired_access_token/.test(resume);
  return e;
}

/* ---------- la connexion ---------- */

/* Premier temps : on part chez Dropbox. Le vérifieur et l'état attendent dans
   la clé de configuration — la page va être quittée puis rechargée, rien ne
   survit en mémoire. */
async function dbxConnexion(cle) {
  const {verifieur, defi} = await dbxDefi();
  const etat = dbxBase64Url(crypto.getRandomValues(new Uint8Array(16)));
  NUAGE.appKey = cle;
  NUAGE.verifieur = verifieur;
  NUAGE.etatOauth = etat;
  nuageEcrire();
  const q = new URLSearchParams({
    client_id: cle,
    response_type: 'code',
    code_challenge: defi,
    code_challenge_method: 'S256',
    token_access_type: 'offline',
    redirect_uri: dbxRetour(),
    state: etat
  });
  location.href = `${DBX_AUTORISE}?${q}`;
}

/* Second temps, au rechargement : l'adresse porte le code. On l'échange contre
   les deux jetons, puis on nettoie l'adresse — un code traînerait sinon dans
   l'historique et dans le titre de l'onglet. */
async function dbxRetourConnexion() {
  const q = new URLSearchParams(location.search);
  const code = q.get('code'), etat = q.get('state'), refus = q.get('error');
  if (!code && !refus) return null;
  history.replaceState(null, '', dbxRetour());
  if (refus) throw new Error(`connexion refusée (${refus})`);
  if (!NUAGE.etatOauth || etat !== NUAGE.etatOauth)
    throw new Error("retour de connexion inattendu : l'état ne correspond pas");
  const verifieur = NUAGE.verifieur;
  NUAGE.verifieur = ''; NUAGE.etatOauth = '';
  return dbxEchange(code, verifieur);
}

async function dbxPoste(url, corps) {
  let r;
  try {
    r = await fetch(url, {
      method: 'POST',
      headers: {'Content-Type': 'application/x-www-form-urlencoded'},
      body: new URLSearchParams(corps)
    });
  } catch(err) { throw dbxErreurReseau(err); }
  const j = await dbxJson(r);
  if (!r.ok) throw dbxErreur(r, j, 'jeton');
  return j;
}

async function dbxEchange(code, verifieur) {
  const j = await dbxPoste(DBX_JETON, {
    code, grant_type: 'authorization_code', client_id: NUAGE.appKey,
    code_verifier: verifieur, redirect_uri: dbxRetour()
  });
  dbxNoteJeton(j);
  return j;
}

function dbxNoteJeton(j) {
  if (j.access_token) NUAGE.jeton = j.access_token;
  if (j.refresh_token) NUAGE.rafraichir = j.refresh_token;
  NUAGE.expire = Date.now() + ((j.expires_in || 14400) * 1000);
  nuageEcrire();
}

/* Le jeton d'accès vit quatre heures ; celui de rafraîchissement ne meurt
   pas. On renouvelle une minute avant l'échéance plutôt qu'après l'échec :
   une poussée qui se casse à mi-chemin coûte un aller-retour de plus. */
async function dbxJetonValide() {
  if (!NUAGE.rafraichir && !NUAGE.jeton) throw new Error('non connecté à Dropbox');
  if (NUAGE.jeton && Date.now() < NUAGE.expire - 60000) return NUAGE.jeton;
  if (!NUAGE.rafraichir) throw new Error('jeton expiré et aucun rafraîchissement disponible');
  dbxNoteJeton(await dbxPoste(DBX_JETON, {
    grant_type: 'refresh_token', refresh_token: NUAGE.rafraichir, client_id: NUAGE.appKey
  }));
  return NUAGE.jeton;
}

/* ---------- le fichier ---------- */

/* L'en-tête `Dropbox-API-Arg` ne passe qu'en ASCII : tout ce qui dépasse s'y
   écrit en échappement JSON. */
function dbxArg(o) {
  return JSON.stringify(o).replace(/[\u007f-\uffff]/g,
    c => '\\u' + c.charCodeAt(0).toString(16).padStart(4, '0'));
}

async function dbxAppel(url, entetes, corps) {
  const jeton = await dbxJetonValide();
  let r;
  try {
    r = await fetch(url, {method: 'POST', headers: {Authorization: `Bearer ${jeton}`, ...entetes}, body: corps});
  } catch(err) { throw dbxErreurReseau(err); }
  return r;
}

/* Lire le paquet. Un fichier absent n'est pas une erreur : c'est le premier
   accord, et l'on part alors de ce que cet appareil connaît. */
async function dbxLire(chemin) {
  const r = await dbxAppel(`${DBX_CONTENU}/files/download`, {'Dropbox-API-Arg': dbxArg({path: chemin})});
  if (!r.ok) {
    const e = dbxErreur(r, await dbxJson(r), 'lecture du fichier');
    if (e.absent) return null;
    throw e;
  }
  let meta = {};
  try { meta = JSON.parse(r.headers.get('dropbox-api-result') || '{}'); } catch(err) {}
  const octets = new Uint8Array(await r.arrayBuffer());
  return {paquet: await nuageDeballe(octets), rev: meta.rev || '', octets: octets.length};
}

/* Écrire le paquet. Un `rev` vide veut dire « ce fichier n'existait pas » et
   l'écriture est alors un ajout qui refuse d'écraser ; sinon c'est une mise à
   jour conditionnée au `rev` lu, que Dropbox rejette si un autre appareil a
   écrit depuis. Dans les deux cas, jamais de renommage automatique : un
   « atelier (1).json.gz » serait une perte déguisée en succès. */
async function dbxEcrire(chemin, octets, rev) {
  const mode = rev ? {'.tag': 'update', update: rev} : 'add';
  const r = await dbxAppel(`${DBX_CONTENU}/files/upload`,
    {'Dropbox-API-Arg': dbxArg({path: chemin, mode, autorename: false, mute: true}),
     'Content-Type': 'application/octet-stream'}, octets);
  const j = await dbxJson(r);
  if (!r.ok) throw dbxErreur(r, j, rev ? 'écriture (mise à jour)' : 'écriture (création)');
  return {rev: j.rev || '', octets: octets.length};
}

/* De quoi nommer le compte connecté dans la fenêtre : on ne synchronise pas à
   l'aveugle vers un compte dont on n'est pas sûr. */
async function dbxCompte() {
  const r = await dbxAppel(`${DBX_API}/users/get_current_account`, {'Content-Type': 'application/json'}, 'null');
  const j = await dbxJson(r);
  if (!r.ok) throw dbxErreur(r, j, 'compte');
  return (j.name && j.name.display_name) || j.email || '';
}
