/* =====================================================================
   js/nuage.js — La synchronisation : sa configuration, et son calendrier

   Un tour de synchronisation se fait toujours dans le même ordre — **tirer,
   fusionner, verser, pousser** — et jamais autrement : pousser d'abord
   écraserait ce qu'on n'a pas encore lu.

   La configuration — jetons, chemin, `rev`, nom de l'appareil — vit dans une
   **clé à elle**, `mtg-atelier-nuage`, et non dans `snapshot()`. C'est une
   exception assumée à la règle du README, et elle est nécessaire : versée dans
   l'instantané, elle voyagerait jusqu'à l'autre PC et y écraserait son jeton
   et son `rev` par les nôtres — les deux appareils se battraient alors pour le
   même verrou. Le thème a la même exception, pour une autre raison.

   La base de fusion dort dans IndexedDB : le fond seul, une trentaine
   d'octets par carte, là où `localStorage` est déjà au bord de son quota.
   ===================================================================== */

const NUAGE_CLE = 'mtg-atelier-nuage';
/* Une poussée au plus toutes les quinze secondes : `scheduleSave()` se
   déclenche à chaque geste, et l'on ne va pas chez Dropbox à chaque carte
   ajoutée. */
const NUAGE_ETRANGLE = 15000;
/* Au retour sur l'onglet, on ne retire que si le dernier accord a plus d'une
   minute : revenir d'un autre onglet trois fois de suite ne vaut pas trois
   allers-retours. */
const NUAGE_FRAICHEUR = 60000;

const NUAGE = {
  /* — ce qui est conservé — */
  service: 'dropbox',
  appKey: '',
  jeton: '', rafraichir: '', expire: 0,
  chemin: '/atelier.json.gz',
  rev: '',
  appareil: '',
  compte: '',
  auto: true,
  dernier: 0,
  dernierPar: '',
  /* Le temps d'un aller-retour PKCE seulement : la page est quittée entre les
     deux, rien ne survit en mémoire. */
  verifieur: '', etatOauth: '',

  /* — ce qui ne l'est pas — */
  etat: 'repos',
  msg: '',
  /* La réponse entière de Dropbox quand il refuse : le résumé seul — parfois
     « other/… » — ne se diagnostique pas. */
  detail: '',
  conflits: [],
  octets: 0,
  enCours: false
};

const NUAGE_DURABLE = ['service', 'appKey', 'jeton', 'rafraichir', 'expire', 'chemin',
  'rev', 'appareil', 'compte', 'auto', 'dernier', 'dernierPar', 'verifieur', 'etatOauth'];

function nuageLire() {
  try {
    const brut = localStorage.getItem(NUAGE_CLE);
    if (!brut) return;
    const o = JSON.parse(brut);
    NUAGE_DURABLE.forEach(k => { if (o[k] !== undefined) NUAGE[k] = o[k]; });
  } catch(e) {}
}

function nuageEcrire() {
  try {
    const o = {};
    NUAGE_DURABLE.forEach(k => { o[k] = NUAGE[k]; });
    localStorage.setItem(NUAGE_CLE, JSON.stringify(o));
  } catch(e) {}
}

function nuageConnecte() {
  return !!(NUAGE.jeton || NUAGE.rafraichir);
}

/* Un nom d'appareil qu'on puisse reconnaître dans un message de conflit, sans
   rien demander à l'ouverture. Il se change dans la fenêtre. */
function nuageNomParDefaut() {
  const ua = navigator.userAgent || '';
  const quoi = /Android/.test(ua) ? 'Android'
    : /iPhone|iPad/.test(ua) ? 'iPhone'
    : /Macintosh/.test(ua) ? 'Mac'
    : /Windows/.test(ua) ? 'PC Windows'
    : /Linux/.test(ua) ? 'PC Linux' : 'Appareil';
  return quoi;
}

/* La base : le fond du dernier accord. Une lecture qui échoue rend `null`, et
   la fusion retombe d'elle-même sur deux côtés — dégradée, mais jamais
   bloquée. */
function nuageBaseLire() {
  return idbLire(IDB_NUAGE_BASE).then(v => v || null).catch(() => null);
}

function nuageBaseEcrire(fond) {
  return idbEcrire(IDB_NUAGE_BASE, fond).catch(() => false);
}

/* ---------- le tour ---------- */

/* Tirer, fusionner, verser, pousser. Un conflit de `rev` — l'autre appareil a
   écrit pendant notre aller-retour — se rejoue une fois : on relit, on
   refusionne sur le nouveau distant, on repousse. Deux échecs de suite sont
   signalés plutôt que rejoués indéfiniment. */
async function nuageTour(rejoue) {
  const distant = await dbxLire(NUAGE.chemin);
  const local = nuagePaquet(NUAGE.appareil);

  /* Rien là-bas : premier dépôt. On pose ce que cet appareil connaît, et
     `rev` vide fait refuser l'écriture si un fichier est apparu entre-temps. */
  if (!distant) {
    const octets = await nuageEmballe(local);
    const ecrit = await dbxEcrire(NUAGE.chemin, octets, '');
    NUAGE.rev = ecrit.rev;
    NUAGE.octets = ecrit.octets;
    NUAGE.dernier = Date.now();
    NUAGE.dernierPar = NUAGE.appareil;
    NUAGE.conflits = [];
    nuageEcrire();
    await nuageBaseEcrire(local.fond);
    return {resume: `Premier dépôt : ${nuagePoids(ecrit.octets)} envoyés.`, verse: false};
  }

  const base = await nuageBaseLire();
  const f = fusionnePaquets(base, local, distant.paquet);

  /* Verser d'abord, pousser ensuite : si la poussée échoue, l'appareil garde
     au moins ce que l'autre avait à lui apprendre. */
  let verse = false;
  if (f.changeIci) {
    const ancre = releveAncre();
    nuageVerse(f.paquet);
    save();
    renderAll();
    restaureAncre(ancre);
    verse = true;
  }

  let envoye = 0;
  if (f.changeLaBas) {
    const octets = await nuageEmballe(f.paquet);
    try {
      const ecrit = await dbxEcrire(NUAGE.chemin, octets, distant.rev);
      NUAGE.rev = ecrit.rev;
      envoye = ecrit.octets;
    } catch(err) {
      if (err.conflit && !rejoue) return nuageTour(true);
      throw err;
    }
  } else {
    NUAGE.rev = distant.rev;
  }

  NUAGE.octets = envoye || distant.octets;
  NUAGE.dernier = Date.now();
  NUAGE.dernierPar = distant.paquet.par || '';
  NUAGE.conflits = f.conflits;
  nuageEcrire();
  /* La base est le fond **tel qu'il a atterri**, relevé après le versement :
     `restore()` écarte un nom que la base de cartes ne connaît pas, et une
     base qui prétendrait le contenir ferait passer cet écart pour une
     suppression au tour suivant. */
  await nuageBaseEcrire(nuagePaquet(NUAGE.appareil).fond);

  const dits = [];
  if (f.venu) dits.push(`${f.venu} carte${f.venu > 1 ? 's' : ''} reçue${f.venu > 1 ? 's' : ''}`);
  if (f.donne) dits.push(`${f.donne} envoyée${f.donne > 1 ? 's' : ''}`);
  if (f.conflits.length) dits.push(`${f.conflits.length} réglage${f.conflits.length > 1 ? 's' : ''} en conflit`);
  return {resume: dits.length ? dits.join(', ') + '.' : 'Déjà à jour.', verse};
}

function nuagePoids(o) {
  return o > 1048576 ? (o / 1048576).toFixed(1) + ' Mo' : Math.round(o / 1024) + ' Ko';
}

/* Le tour, habillé : un seul à la fois, l'état rendu à la fenêtre si elle est
   ouverte, et un mot au lecteur quand c'est lui qui a demandé. */
async function nuageSynchro(manuel) {
  if (NUAGE.enCours || !nuageConnecte()) return;
  NUAGE.enCours = true;
  NUAGE.etat = 'marche';
  NUAGE.msg = 'Synchronisation…';
  majFenetreParametres();
  try {
    const r = await nuageTour(false);
    NUAGE.etat = 'ok';
    NUAGE.msg = r.resume;
    NUAGE.detail = '';
    if (manuel) toast(r.resume);
    else if (r.verse) toast('Synchronisation : ' + r.resume);
  } catch(err) {
    NUAGE.etat = 'erreur';
    NUAGE.msg = err.message || 'échec de la synchronisation';
    NUAGE.detail = err.detail || (err.reseau ? 'aucune réponse : barrière CORS ou réseau' : '');
    /* Un jeton mort n'est pas une panne : c'est une connexion à refaire, et il
       vaut mieux le dire que réessayer toutes les quinze secondes. */
    if (err.jetonMort) {
      NUAGE.jeton = ''; NUAGE.rafraichir = '';
      nuageEcrire();
      NUAGE.msg = 'Dropbox a révoqué l\'accès : reconnectez cet appareil.';
    }
    if (manuel || err.reseau) toast('Synchronisation impossible : ' + NUAGE.msg);
  } finally {
    NUAGE.enCours = false;
    majFenetreParametres();
  }
}

/* La poussée qui suit un geste. Étranglée, et toujours différée : on ne part
   pas chez Dropbox au milieu d'un ajout de carte. */
let nuageMinuteur = null;
let nuageDerniereAuto = 0;

function nuagePousseeDifferee() {
  if (!NUAGE.auto || !nuageConnecte()) return;
  /* Un tour en cours écrit lui-même par `save()` : s'en servir pour
     programmer le tour suivant ferait un aller-retour à vide après chaque
     synchronisation. */
  if (NUAGE.enCours) return;
  clearTimeout(nuageMinuteur);
  const reste = NUAGE_ETRANGLE - (Date.now() - nuageDerniereAuto);
  nuageMinuteur = setTimeout(() => {
    nuageDerniereAuto = Date.now();
    nuageSynchro(false);
  }, Math.max(reste, 2000));
}

/* ---------- le démarrage ---------- */

async function nuageDemarrer() {
  nuageLire();
  if (!NUAGE.appKey && NUAGE_DBX_CLE) NUAGE.appKey = NUAGE_DBX_CLE;
  if (!NUAGE.appareil) { NUAGE.appareil = nuageNomParDefaut(); nuageEcrire(); }

  /* Le retour de Dropbox arrive dans l'adresse de la page : il se traite avant
     tout le reste, et avant d'avoir rien tiré. */
  try {
    const retour = await dbxRetourConnexion();
    if (retour) {
      NUAGE.compte = await dbxCompte().catch(() => '');
      nuageEcrire();
      toast(NUAGE.compte ? `Dropbox connecté : ${NUAGE.compte}.` : 'Dropbox connecté.');
    }
  } catch(err) {
    NUAGE.etat = 'erreur';
    NUAGE.msg = err.message || 'échec de la connexion';
    toast('Connexion Dropbox : ' + NUAGE.msg);
  }

  if (nuageConnecte() && NUAGE.auto) nuageSynchro(false);

  /* Revenir sur l'onglet est le moment où l'autre appareil a le plus de
     chances d'avoir écrit. */
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState !== 'visible') return;
    if (!NUAGE.auto || !nuageConnecte()) return;
    if (Date.now() - NUAGE.dernier < NUAGE_FRAICHEUR) return;
    nuageSynchro(false);
  });
}

function nuageDeconnecte() {
  NUAGE.jeton = ''; NUAGE.rafraichir = ''; NUAGE.expire = 0;
  NUAGE.rev = ''; NUAGE.compte = ''; NUAGE.dernier = 0; NUAGE.dernierPar = '';
  NUAGE.etat = 'repos'; NUAGE.msg = ''; NUAGE.conflits = [];
  nuageEcrire();
  /* La base de fusion s'en va avec : la garder ferait croire, à la prochaine
     connexion, à un accord qui n'a pas eu lieu. */
  idbOublier(IDB_NUAGE_BASE);
}
