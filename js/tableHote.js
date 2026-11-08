/* =====================================================================
   js/tableHote.js — La partie que ce navigateur héberge

   Pour le pilote, **tous** les sièges sont humains : `avance()` s'arrête à
   chaque question, et c'est ici qu'on l'aiguille — un siège automatique
   répond sur-le-champ, une priorité qu'aucun arrêt n'appelle est passée,
   le reste va à l'interface du siège, sur cet appareil ou sur celui d'un
   invité (js/tableLiaison.js). Une seule boucle décide donc de tout, et
   rythme le jeu : sans une courte pause après chaque geste visible d'un
   joueur automatique, la partie se jouerait sous les yeux sans qu'on la
   voie.

   Le moteur est séquentiel : une seule question est en attente à la fois,
   et une réponse n'est reçue que du siège interrogé, avec le même numéro.
   ===================================================================== */

const TABLE = {ouverte: false, phase: '', role: '', h: null, sieges: [], agents: [], moi: 0, boucle: false,
  vue: null, question: null, erreur: '', sel: null, attenteNom: '', detail: null, journalVu: 0, minuterie: null,
  /* La pause après un geste visible d'un joueur automatique, en ms. */
  pauseIA: 450};

function attendre(ms) { return new Promise(ok => setTimeout(ok, ms)); }

/* Ce qu'un humain verrait changer : la pile, le champ, les points de vie. */
function signePublic(P) {
  return P.ver + '|' + P.pile.length + '|' + P.etape + '|' + P.joueurs.map(J => J.vie + ',' + J.main.length).join(';');
}

/* Le siège moteur d'une source choisie au salon : un deck de l'atelier, un
   adversaire de la bibliothèque, ou les fiches reçues d'un invité. */
function siegeDeSource(s) {
  if (s.fiches) return siegeDepuisFiches(s.nom, s.fiches.format, s.fiches.cartes, s.fiches.commandants, s.fiches.comportements);
  const [genre, cle] = String(s.deck || '').split(':');
  const siege = genre === 'a' ? siegeAdversaire(cle) : siegeDeck(cle);
  if (siege) siege.nom = s.nom || siege.nom;
  return siege;
}

/* Commencer la partie que le salon décrit. Les cartes que personne ne
   connaît encore sont demandées à Scryfall avant. */
async function commenceTable() {
  const sources = TABLE.sieges;
  await chargeSimCartes();
  const manquent = sources.filter(s => !s.fiches).map(siegeDeSource).filter(Boolean).flatMap(x => x.manquantes);
  if (manquent.length) { toast(`${manquent.length} carte(s) demandée(s) à Scryfall…`); await chercheFichesScryfall([...new Set(manquent)]); }
  const sieges = sources.map(siegeDeSource);
  if (sieges.some(x => !x || !x.cartes.length)) { toast('Un siège n\'a pas de deck jouable.'); return; }
  const graine = (Date.now() ^ (Math.random() * 4294967296)) >>> 0;
  TABLE.h = creePartie({graine, premier: graine % sieges.length, plafondTours: 60, journal: true, consigne: true,
    sieges: sieges.map((x, i) => ({...x, nom: sources[i].nom}))});
  TABLE.agents = sieges.map(() => ({humain: true}));
  sources.forEach((s, i) => {
    s.ia = agentIA(graine, i);
    if (s.mode === 'moi') { s.arrets = {...arretsParDefaut(), ...S.arrets}; TABLE.moi = i; }
    else if (!s.arrets) s.arrets = arretsParDefaut();
  });
  Object.assign(TABLE, {phase: 'partie', role: 'hote', question: null, erreur: '', sel: null, journalVu: 0});
  if (typeof envoieDebut === 'function') envoieDebut();
  boucleTable();
}

/* La boucle d'aiguillage. Elle s'arrête quand un humain doit répondre, et
   reprend à sa réponse (`recoitReponse()`). */
async function boucleTable() {
  if (TABLE.boucle) return;
  TABLE.boucle = true;
  try {
    while (TABLE.h && !TABLE.h.fini) {
      const q = TABLE.h.attente;
      if (!q) { avance(TABLE.h, TABLE.agents, Infinity, null); continue; }
      const s = TABLE.sieges[q.joueur];
      let r;
      if (s.mode === 'ia' || s.confie) r = valideReponse(q, s.ia.repond(TABLE.h.P, q));
      else if (q.q === 'priorite' && !doitDemander(TABLE.h.P, q.joueur, q, s.arrets)) r = q.options.length - 1;
      else { poseQuestion(q); return; }
      const avant = signePublic(TABLE.h.P);
      repondre(TABLE.h, TABLE.agents, r, Infinity, null);
      if (signePublic(TABLE.h.P) !== avant) {
        diffuseVues();
        const passe = q.q === 'priorite' && r === q.options.length - 1;
        await (s.mode !== 'moi' && !passe ? attendre(TABLE.pauseIA) : rendMain());
      }
    }
    if (TABLE.h && TABLE.h.fini) { TABLE.question = null; diffuseVues(true); }
  } finally { TABLE.boucle = false; }
}

/* Porter une question à son siège : l'interface de cet appareil, ou
   l'appareil de l'invité. */
function poseQuestion(q) {
  const s = TABLE.sieges[q.joueur], P = TABLE.h.P;
  TABLE.attenteNom = s.nom;
  if (s.mode === 'moi') {
    TABLE.question = questionPourUI(P, q);
    TABLE.vue = vue(P, TABLE.moi);
    TABLE.sel = null; TABLE.erreur = '';
    renduTable();
  } else {
    if (typeof envoieQuestion === 'function') envoieQuestion(s, q);
    diffuseVues();
  }
}

/* Une réponse arrive, de cet appareil ou d'un invité. On la juge avant de la
   donner au moteur : un humain qui s'est trompé est réinterrogé. */
function recoitReponse(j, n, r) {
  const q = TABLE.h && TABLE.h.attente;
  if (!q || q.n !== n || q.joueur !== j) return;
  const err = reponseRecevable(q, r);
  const s = TABLE.sieges[j];
  if (err) {
    if (s.mode === 'moi') { TABLE.erreur = err; renduTable(); } else if (typeof envoieErreur === 'function') envoieErreur(s, n, err);
    return;
  }
  if (s.mode === 'moi') { TABLE.question = null; TABLE.erreur = ''; }
  repondre(TABLE.h, TABLE.agents, r, Infinity, null);
  diffuseVues();
  boucleTable();
}

/* Repeindre la table de cet appareil et envoyer leur vue aux invités, au
   plus une fois tous les cent millisecondes. */
function diffuseVues(tout) {
  if (TABLE.minuterie && !tout) return;
  const go = () => {
    TABLE.minuterie = null;
    if (!TABLE.h) return;
    const P = TABLE.h.P;
    TABLE.vue = vue(P, TABLE.moi);
    if (!TABLE.h.attente || TABLE.h.attente.joueur !== TABLE.moi) TABLE.question = null;
    renduTable();
    TABLE.sieges.forEach((s, i) => { if (s.mode === 'distant' && typeof envoieVue === 'function') envoieVue(s, i); });
  };
  if (tout) { clearTimeout(TABLE.minuterie); go(); } else TABLE.minuterie = setTimeout(go, 100);
}

/* Le journal de la partie hébergée, ligne par ligne. */
function journalTable() { return TABLE.h && TABLE.h.P.journal ? TABLE.h.P.journal : []; }

/* Les arrêts du siège local ont changé : la partie en cours les suit. */
function majArretsTable() {
  const s = TABLE.sieges[TABLE.moi];
  if (TABLE.role === 'hote' && s) s.arrets = {...s.arrets, ...S.arrets};
}

/* « Passer jusqu'à mon tour » : retenu sur le siège, il tombe au début de
   son prochain tour. */
function passeJusquaMonTour(j) {
  const s = TABLE.sieges[j];
  if (!s || !TABLE.h) return;
  s.arrets.passeJusqua = TABLE.h.P.tour;
  const q = TABLE.h.attente;
  if (q && q.joueur === j && q.q === 'priorite') recoitReponse(j, q.n, q.options.length - 1);
}

function quitteTable() {
  if (typeof fermeLiaisons === 'function') fermeLiaisons();
  Object.assign(TABLE, {ouverte: false, phase: '', h: null, question: null, vue: null, role: ''});
  renduTable();
}
