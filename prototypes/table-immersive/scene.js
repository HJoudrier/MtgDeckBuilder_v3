/* =====================================================================
   scene.js — Une petite partie pour de faux

   Ni le moteur de l'atelier ni ses règles complètes : une scène écrite à
   la main, assez fidèle pour que chaque maquette montre les moments qui
   comptent — poser un terrain, lancer un sort qui passe par la pile,
   cibler, attaquer, subir une réponse et y répondre, perdre des points de
   vie, regarder l'adversaire jouer son tour. Les cinq maquettes regardent
   la même scène : changer de maquette ne la remet pas à zéro, on compare
   le même instant.

   La scène parle par événements : les maquettes en tirent leurs
   mouvements, leurs sons et leurs vibrations, comme l'atelier les
   tirerait de la différence entre deux vues.

   Ce fichier tient l'état, la priorité et la pile ; regles.js le mana et
   ce qui se joue ; tour.js les étapes, le combat et Mirela.
   ===================================================================== */

const DELAIS = {pense: 950, geste: 650, etape: 420, vue: 1700};
const ORDRE_PHASES = ['entretien', 'pioche', 'principale1', 'attaquants', 'bloqueurs', 'degats', 'principale2', 'fin'];
const PHASES = {
  entretien: {court: 'Entretien', long: 'Entretien'},
  pioche: {court: 'Pioche', long: 'Pioche'},
  principale1: {court: 'Principale', long: 'Phase principale'},
  attaquants: {court: 'Attaquants', long: 'Déclaration des attaquants'},
  bloqueurs: {court: 'Bloqueurs', long: 'Déclaration des bloqueurs'},
  degats: {court: 'Blessures', long: 'Blessures de combat'},
  principale2: {court: 'Principale 2', long: 'Seconde phase principale'},
  fin: {court: 'Fin', long: 'Étape de fin'}
};

let E = null, GEN = 0, FILE = [], ECOUTEUR = () => {}, NUM = 0;

const autre = j => j === 'moi' ? 'adv' : 'moi';
const def = o => CARTES[o.k];
const estPrincipale = ph => ph === 'principale1' || ph === 'principale2';
const estJoueur = x => x === 'moi' || x === 'adv';
const obj = id => E.obj.find(o => o.id === id);
const dans = (j, z) => E.obj.filter(o => o.ctrl === j && o.zone === z);
const nomJ = j => E.joueurs[j].nom;
const signe = n => (n > 0 ? '+' : n < 0 ? '−' : '') + Math.abs(n);
const force = o => (def(o).f || 0) + o.bonus[0];
const endurance = o => (def(o).e || 0) + o.bonus[1];
const reste = o => endurance(o) - o.bless;
const liste = os => os.map(o => def(o).nom).join(', ');

function ev(e) { FILE.push(e); }
function journal(t) { E.journal.push(t); if (E.journal.length > 40) E.journal.shift(); }
function notifie() { const l = FILE; FILE = []; ECOUTEUR(l); }

/* Un pas différé de la scène. Une scène recommencée entre-temps l'annule :
   le pas d'une partie abandonnée ne doit rien toucher dans la nouvelle. */
function plus(ms, fn) {
  const g = GEN;
  return setTimeout(() => { if (g !== GEN || !E || E.fin) return; fn(); notifie(); }, ms);
}

function cree(k, ctrl, zone) {
  const o = {id: (ctrl === 'moi' ? 'm' : 'a') + (++NUM), k, ctrl, zone, prec: null, engage: false, malade: false,
    bless: 0, bonus: [0, 0], attaque: false, bloque: null, estBloque: false, cible: null};
  E.obj.push(o);
  return o;
}

/* Changer de zone. L'objet passe en fin de liste : un terrain posé se
   range au bout de sa rangée, comme sur une vraie table. */
function deplace(o, zone) {
  if (o.zone === 'champ') Object.assign(o, {engage: false, malade: false, bless: 0, bonus: [0, 0], attaque: false, bloque: null, estBloque: false});
  o.prec = o.zone;
  o.zone = zone;
  E.obj.splice(E.obj.indexOf(o), 1);
  E.obj.push(o);
}

function nouvelle() {
  GEN++;
  FILE = [];
  NUM = 0;
  E = {tour: 3, actif: 'moi', phase: 'principale1', prio: null, question: null, pile: [], obj: [], journal: [],
    joueurs: {moi: {nom: DONNE.moi.nom, vie: DONNE.moi.vie}, adv: {nom: DONNE.adv.nom, vie: DONNE.adv.vie}},
    bib: {moi: [...DONNE.moi.bib], adv: [...DONNE.adv.bib]},
    terrainJoue: {moi: false, adv: false}, arrets: new Set(), jusqua: null, auto: null, minuteur: null, fin: null, morsureTour: false};
  for (const j of ['moi', 'adv']) {
    DONNE[j].champ.forEach(k => cree(k, j, 'champ'));
    DONNE[j].main.forEach(k => cree(k, j, 'main'));
  }
  journal('— Tour 3 : le vôtre');
  journal('Vous piochez Croissance sauvage.');
  demande({q: 'priorite'});
  FILE = [];
}

/* ---------- La priorité ---------- */

/* Donner la main au joueur — sauf s'il a demandé de passer jusqu'à une
   étape plus loin : on passe pour lui, et l'on s'arrête dès que la pile
   se remplit, parce qu'alors quelque chose a changé. */
function demande(q) {
  E.auto = null;
  if (E.jusqua && E.actif === 'moi' && !E.pile.length) {
    if (ORDRE_PHASES.indexOf(E.phase) < ORDRE_PHASES.indexOf(E.jusqua)) {
      E.prio = null;
      E.question = null;
      return plus(DELAIS.etape * .7, () => q.q === 'attaquants' ? attaqueInterne([]) : passeInterne());
    }
    E.jusqua = null;
  }
  E.prio = 'moi';
  E.question = q;
  ev({t: 'prio', q: q.q, pile: E.pile.length});
}

function passe() {
  if (!E || E.prio !== 'moi' || !E.question) return;
  if (E.question.q === 'attaquants') return attaque([]);
  passeInterne();
  notifie();
}

function passeInterne() {
  E.question = null;
  E.prio = null;
  if (E.pile.length) { journal('Vous laissez résoudre.'); return plus(DELAIS.etape, resousSommet); }
  const combat = E.phase === 'attaquants' || E.phase === 'bloqueurs';
  plus(combat ? DELAIS.pense : DELAIS.etape, () => { if (!iaRepond()) suite(); });
}

function passeJusqua(ph) {
  if (!E || E.prio !== 'moi' || !E.question || E.actif !== 'moi' || E.pile.length) return passe();
  E.jusqua = ph;
  journal(`Vous passez jusqu'à : ${PHASES[ph].long.toLowerCase()}.`);
  if (E.question.q === 'attaquants') return attaque([]);
  passeInterne();
  notifie();
}

/* La pile n'est pas vide : qui la regarde ? Un sort à soi laisse la main
   à Mirela. Un sort d'elle : la main revient au joueur s'il a de quoi
   répondre ; sinon la priorité passe d'elle-même, après le temps de lire
   — et ce temps se voit, et se retient (`retiens`). */
function fenetrePile() {
  const haut = obj(E.pile[E.pile.length - 1]);
  if (haut.ctrl === 'moi') {
    E.prio = 'adv';
    E.question = null;
    return plus(DELAIS.pense, () => { if (!iaRepond()) resousSommet(); });
  }
  if (aDesReponses()) return demande({q: 'priorite'});
  E.prio = null;
  E.question = null;
  E.auto = {debut: Date.now(), duree: DELAIS.vue};
  ev({t: 'auto'});
  E.minuteur = plus(DELAIS.vue, () => { E.auto = null; journal('Passage automatique : rien à jouer.'); resousSommet(); });
}

function retiens() {
  if (!E || !E.auto) return;
  clearTimeout(E.minuteur);
  journal('Vous gardez la main.');
  demande({q: 'priorite'});
  notifie();
}

/* La fin d'une étape où personne n'a rien à faire, sauf un arrêt posé
   pour le tour de Mirela. */
function fenetre() {
  if (E.actif === 'adv' && E.arrets.has(E.phase) && aDesReponses()) {
    journal(`Arrêt : ${PHASES[E.phase].long.toLowerCase()} de Mirela.`);
    return demande({q: 'priorite'});
  }
  plus(DELAIS.etape, suite);
}

function suite() {
  const i = ORDRE_PHASES.indexOf(E.phase);
  if (i === ORDRE_PHASES.length - 1) return tourSuivant();
  entre(ORDRE_PHASES[i + 1]);
}

/* ---------- Jouer ---------- */

const nomCible = t => estJoueur(t) ? (t === 'moi' ? 'vous' : nomJ(t)) : def(obj(t)).nom;

function effetTexte(o) {
  const c = def(o);
  if (c.degats) return `${c.degats} blessures à ${nomCible(o.cible)}`;
  if (c.bonus) return `${nomCible(o.cible)} ${signe(c.bonus[0])}/${signe(c.bonus[1])}`;
  return 'arrive sur le champ de bataille';
}

function joue(id, cible) {
  const o = obj(id);
  if (!o || !jouables().includes(id)) { ev({t: 'refus', id, raison: pourquoiPas(id)}); return notifie(); }
  const c = def(o);
  if (c.cible && !cibles(id).includes(cible)) { ev({t: 'refus', id, raison: 'Choisissez une cible qui brille.'}); return notifie(); }
  E.question = null;
  E.prio = null;
  E.jusqua = null;
  if (c.terrain) {
    deplace(o, 'champ');
    E.terrainJoue.moi = true;
    journal(`Vous posez ${c.nom}.`);
    ev({t: 'pose', j: 'moi', id});
    demande({q: 'priorite'});
    return notifie();
  }
  lance(o, 'moi', cible || null);
  journal(`Vous lancez ${c.nom}${cible ? ' sur ' + nomCible(cible) : ''}.`);
  fenetrePile();
  notifie();
}

function lance(o, j, cible) {
  paie(j, def(o).cout, o.id);
  deplace(o, 'pile');
  o.cible = cible;
  E.pile.push(o.id);
  ev({t: 'lance', j, id: o.id, cible});
}

function resousSommet() {
  const id = E.pile.pop(), o = obj(id), c = def(o);
  E.prio = null;
  E.question = null;
  E.auto = null;
  if (!c.instant) {
    deplace(o, 'champ');
    o.malade = !c.celerite;
    journal(`${c.nom} arrive sur le champ de bataille.`);
    ev({t: 'resout', id, j: o.ctrl, permanent: true});
  } else {
    const t = o.cible, vise = t && !estJoueur(t) ? obj(t) : null;
    if (!estJoueur(t) && !(vise && vise.zone === 'champ')) {
      journal(`${c.nom} n'a plus de cible : il ne fait rien.`);
      ev({t: 'sansCible', id});
    } else {
      if (c.degats) inflige(t, c.degats, o);
      if (c.bonus) {
        vise.bonus = [vise.bonus[0] + c.bonus[0], vise.bonus[1] + c.bonus[1]];
        journal(`${def(vise).nom} : ${signe(c.bonus[0])}/${signe(c.bonus[1])} jusqu'à la fin du tour.`);
        ev({t: 'bonus', id: vise.id, f: c.bonus[0], e: c.bonus[1]});
      }
      ev({t: 'resout', id, j: o.ctrl});
    }
    deplace(o, 'cim');
  }
  etatsDeJeu();
  apresResolution();
}

function apresResolution() {
  if (verifieFin()) return;
  if (E.pile.length) return fenetrePile();
  if (estPrincipale(E.phase)) return E.actif === 'moi' ? demande({q: 'priorite'}) : plus(DELAIS.pense, iaPrincipale);
  plus(DELAIS.etape, suite);
}

function inflige(t, n, src) {
  if (estJoueur(t)) {
    E.joueurs[t].vie -= n;
    journal(`${src ? def(src).nom : 'Le combat'} inflige ${n} blessures à ${nomCible(t)}.`);
    ev({t: 'degats', cible: t, n});
    ev({t: 'vie', j: t, delta: -n});
    return;
  }
  const v = obj(t);
  if (!v || v.zone !== 'champ') return;
  v.bless += n;
  ev({t: 'degats', cible: t, n});
}

function etatsDeJeu() {
  E.obj.filter(o => o.zone === 'champ' && !def(o).terrain && reste(o) <= 0).forEach(o => {
    journal(`${def(o).nom} meurt.`);
    deplace(o, 'cim');
    ev({t: 'meurt', id: o.id, j: o.ctrl});
  });
}

function verifieFin() {
  const morts = ['moi', 'adv'].filter(j => E.joueurs[j].vie <= 0);
  if (!morts.length) return false;
  const g = morts.length === 2 ? null : autre(morts[0]);
  E.fin = {gagnant: g};
  E.question = null;
  E.prio = null;
  E.auto = null;
  journal(g === 'moi' ? 'Vous gagnez la partie.' : g ? 'Mirela gagne la partie.' : 'Partie nulle.');
  ev({t: 'fin', gagnant: g});
  return true;
}

