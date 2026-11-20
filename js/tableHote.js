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
  vue: null, question: null, erreur: '', sel: null, attenteNom: '', journalVu: 0, minuterie: null,
  /* L'affichage : la carte en grand, la zone dépliée, le menu, la page de
     l'Arène, l'adversaire déplié du Tour de table. */
  loupe: null, zone: null, menu: null, page: 0, deplie: null, suivi: '',
  /* Le rythme, en ms à la vitesse normale : la pause après un geste visible
     d'un joueur automatique, et celle d'un changement d'étape. */
  pauseIA: 1300, pauseEtape: 350, pauseResolution: 1100, suite: null,
  /* La pause d'une résolution en cours (son début, sa durée), que l'anneau
     du bouton de tour montre ; la carte levée, prête à jouer ; la dernière
     vue peinte, dont la suivante se compare pour les sons et les mouvements. */
  pause: null, leve: null, vuePeinte: null};

/* Les vitesses de la table, réglées au menu (`S.table.vitesse`). */
const VITESSES = {lente: {nom: 'Lente', k: 1.8}, normale: {nom: 'Normale', k: 1}, rapide: {nom: 'Rapide', k: 0.35}};

/* Combien attendre après une réponse, pour qu'un humain suive : longtemps
   après le geste d'un automate (un sort lancé, une attaque), un peu à chaque
   étape montrée dans la barre des phases, rien après une priorité passée. */
function pauseApres(q, r, s, etapeChangee) {
  const k = (VITESSES[S.table.vitesse] || VITESSES.normale).k;
  const rien = (q.q === 'priorite' && r === q.options.length - 1) || (Array.isArray(r) && !r.length);
  if (s.mode !== 'moi' && !rien) return k * TABLE.pauseIA * (q.q === 'attaquants' || q.q === 'bloqueurs' ? 1.3 : 1);
  return etapeChangee && PHASE_DE[TABLE.h.P.etape] ? k * TABLE.pauseEtape : 0;
}

/* Un objet va se résoudre : on le montre, avec ses flèches, le temps qu'on
   le lise — plus longtemps celui d'un adversaire que le sien. */
async function montrePile(q) {
  const k = (VITESSES[S.table.vitesse] || VITESSES.normale).k, P = TABLE.h.P;
  const sommet = P.pile.length ? descriptionPile(P, P.pile[P.pile.length - 1]) : null;
  /* Le temps de lire : une pause de base, et de quoi parcourir le texte de ce qui se résout. */
  const lecture = sommet ? Math.min(2200, sommet.texte.length * 9) : 0;
  const ms = k * ((q.joueur === TABLE.moi ? TABLE.pauseResolution : TABLE.pauseIA) + lecture);
  /* La pause et son « Continuer » existent avant qu'on peigne : le bouton de
     tour montre son anneau dès la première image. */
  TABLE.pause = {debut: Date.now(), duree: ms};
  const fin = attendreOuSuite(ms);
  diffuseVues(true);
  await fin;
  TABLE.pause = null;
  if (TABLE.h && TABLE.h.attente === q) repondre(TABLE.h, TABLE.agents, 0, Infinity, null);
}

/* Attendre, sauf si le joueur dit « Continuer » (`tSuite`). */
function attendreOuSuite(ms) {
  return new Promise(ok => {
    const fin = () => { clearTimeout(t); TABLE.suite = null; ok(); };
    const t = setTimeout(fin, ms);
    TABLE.suite = fin;
  });
}

/* La vue d'un joueur, et qui la partie attend : celui qui a la priorité. */
function vueTable(j) {
  const q = TABLE.h.attente;
  return {...vue(TABLE.h.P, j), prio: q && q.q === 'priorite' ? q.joueur : null, attend: q && q.q !== 'voir' ? q.joueur : null,
    resout: !!(q && q.q === 'voir')};
}

function attendre(ms) { return new Promise(ok => setTimeout(ok, ms)); }

/* Ce qu'un humain verrait changer : la pile, le champ, les points de vie. */
function signePublic(P) {
  return P.ver + '|' + P.pile.length + '|' + P.etape + '|' + P.joueurs.map(J => J.vie + ',' + J.main.length).join(';');
}

/* Le siège moteur d'une source choisie au salon : un deck de l'atelier, ou les fiches reçues d'un invité. */
function siegeDeSource(s) {
  if (s.fiches) return siegeDepuisFiches(s.nom, s.fiches.format, s.fiches.cartes, s.fiches.commandants, s.fiches.comportements);
  const siege = siegeDeck(cleDeSource(s.deck));
  if (siege) siege.nom = s.nom || siege.nom;
  return siege;
}

/* Le paiement du mana d'un siège au départ : les sièges humains peuvent en changer en cours
   de partie ; le mien commence selon le réglage du menu, un invité à l'automatique. Un
   siège automatique paie toujours seul. */
function reglageMana(mode) {
  return mode === 'ia' ? {} : {reglable: true, manuel: mode === 'moi' && !!S.table.paiementManuel};
}

/* Commencer la partie que le salon décrit. Les cartes que personne ne
   connaît encore sont demandées à Scryfall avant. */
async function commenceTable() {
  const sources = TABLE.sieges;
  await chargeSimCartes();
  const manquent = sources.filter(s => !s.fiches).map(siegeDeSource).filter(Boolean).flatMap(x => x.manquantes);
  if (manquent.length) { toast(`${manquent.length} carte(s) demandée(s) à Scryfall…`); await chercheFichesScryfall([...new Set(manquent)]); }
  sources.forEach(s => { s.fiches = fichesDeSource(s); });
  const sieges = sources.map(siegeDeSource);
  if (sieges.some(x => !x || !x.cartes.length)) { toast('Un siège n\'a pas de deck jouable.'); return; }
  const graine = (Date.now() ^ (Math.random() * 4294967296)) >>> 0;
  /* Le paiement du mana de chaque siège, rangé avec la partie : la reprise le rejoue à l'identique. */
  const mana = sources.map(s => reglageMana(s.mode));
  TABLE.config = {graine, premier: graine % sieges.length, montre: true, mana};
  TABLE.h = creePartie({graine, premier: graine % sieges.length, plafondTours: 60, journal: true, consigne: true, montre: true,
    sieges: sieges.map((x, i) => ({...x, nom: sources[i].nom, ...mana[i]}))});
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

/* La réponse d'un automate. Un siège confié à l'automate qui payait son mana à la main
   revient d'abord au paiement automatique, par la réponse que le moteur offre pour cela :
   l'automate n'engage aucune source, il ne lancerait plus rien. */
function reponseAutomate(P, q, s) {
  if (q.q === 'priorite' && P.joueurs[q.joueur].manuel) {
    const i = q.options.findIndex(a => a.k === 'reglage');
    if (i >= 0) return i;
  }
  return s.ia.repond(P, q);
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
      if (q.q === 'voir') { await montrePile(q); continue; }
      let r;
      if (s.mode === 'ia' || s.confie) r = valideReponse(q, reponseAutomate(TABLE.h.P, q, s));
      else if (q.q === 'priorite' && !doitDemander(TABLE.h.P, q.joueur, q, s.arrets)) r = q.options.length - 1;
      else { poseQuestion(q); return; }
      const avant = signePublic(TABLE.h.P), etape = TABLE.h.P.etape;
      repondre(TABLE.h, TABLE.agents, r, Infinity, null);
      if (signePublic(TABLE.h.P) !== avant) {
        diffuseVues();
        const ms = pauseApres(q, r, s, TABLE.h.P.etape !== etape);
        await (ms ? attendre(ms) : rendMain());
      }
    }
    if (TABLE.h && TABLE.h.fini) { TABLE.question = null; diffuseVues(true); oublieTableSauvee(); }
  } finally { TABLE.boucle = false; if (TABLE.h && !TABLE.h.fini) sauveTable(); }
}

/* Porter une question à son siège : l'interface de cet appareil, ou
   l'appareil de l'invité. */
function poseQuestion(q) {
  const s = TABLE.sieges[q.joueur], P = TABLE.h.P;
  TABLE.attenteNom = s.nom;
  if (s.mode === 'moi') {
    TABLE.question = questionPourUI(P, q);
    TABLE.vue = vueTable(TABLE.moi);
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
    TABLE.vue = vueTable(TABLE.moi);
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
  if (TABLE.role === 'hote' && TABLE.h) oublieTableSauvee();
  if (typeof fermeLiaisons === 'function') fermeLiaisons();
  Object.assign(TABLE, {ouverte: false, phase: '', h: null, question: null, vue: null, role: '',
    loupe: null, zone: null, menu: null, page: 0, deplie: null, suivi: '', pause: null, leve: null, vuePeinte: null});
  renduTable();
}
