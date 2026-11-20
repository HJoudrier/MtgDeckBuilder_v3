/* =====================================================================
   js/tableLever.js — Lever une carte, puis la jouer

   Un premier toucher lève la carte, et le bouton de tour dit ce qu'il en
   fera — « Lancer », « Jouer », « Activer » — ; un second toucher, ou le
   bouton, la joue. On ne lance plus rien par mégarde en parcourant sa
   main du doigt. Pousser une carte de la main vers le haut la joue d'un
   seul geste. Engager un terrain pour son mana reste immédiat : on en
   engage souvent plusieurs d'affilée — une Selvala ou un Signet de même.

   Le glisser s'écoute sur le document, à côté de l'appui long
   (js/app.js) : la carte qu'on pousse n'est pas un élément qu'on peut
   munir d'un `data-act`.
   ===================================================================== */

/* La distance, vers le haut, au-delà de laquelle une carte poussée est
   jouée. */
const SEUIL_GLISSE = 70;
const GLISSE = {el: null};

/* Les façons de jouer une carte, hors le réglage du paiement. */
function actionsDeCarte(q, id) {
  return q.options.map((a, i) => [a, i]).filter(([a]) => a.id === id && a.k !== 'passer' && a.k !== 'reglage');
}

/* La carte levée, si elle vaut encore pour la question affichée. */
function leveValide(q) {
  const l = TABLE.leve;
  return l && q && q.q === 'priorite' && l.n === q.n ? l : null;
}

/* Un toucher sur une carte quand on a la priorité. Rend vrai s'il a servi ;
   faux s'il n'y a rien, ou plusieurs choses, à en faire : la loupe les
   montre alors. */
function toucheCarteJouable(q, id) {
  const acts = actionsDeCarte(q, id);
  if (acts.length !== 1) return false;
  const [a, i] = acts[0], l = leveValide(q);
  if (a.k === 'mana' || a.k === 'manaFiltre' || (l && l.id === id)) {
    TABLE.leve = null;
    sonTable('tic');
    repondsTable(i);
    return true;
  }
  TABLE.leve = {id, i, n: q.n};
  sonTable('carte');
  vibreTable('tic');
  renduTable();
  return true;
}

function reposeCarte() {
  TABLE.leve = null;
  renduTable();
}

/* ---------- Pousser une carte de la main vers le haut ---------- */

function glisseDebut(ev) {
  GLISSE.el = null;
  if (!TABLE.ouverte || (ev.pointerType === 'mouse' && ev.button !== 0)) return;
  const el = ev.target.closest && ev.target.closest('#table .mn [data-loupe]');
  const q = TABLE.question;
  if (!el || !q || q.q !== 'priorite') return;
  const acts = actionsDeCarte(q, +el.dataset.loupe);
  if (acts.length !== 1 || acts[0][0].k === 'mana') return;
  Object.assign(GLISSE, {el, i: acts[0][1], n: q.n, x: ev.clientX, y: ev.clientY, pid: ev.pointerId, actif: false, seuil: false});
}

/* Le doigt monte : la carte le suit. Il glisse de côté : c'est la main qu'on
   fait défiler, la carte reste. */
function glisseBouge(ev) {
  const g = GLISSE;
  if (!g.el || ev.pointerId !== g.pid) return;
  const dx = ev.clientX - g.x, dy = ev.clientY - g.y;
  if (!g.actif) {
    if (Math.abs(dx) > 14 && Math.abs(dx) > Math.abs(dy)) { g.el = null; return; }
    if (dy > -14) return;
    g.actif = true;
    appuiAnnule();
    g.el.classList.add('glisse');
  }
  g.el.style.transform = `translate(${dx}px, ${Math.min(0, dy)}px)`;
  const passe = dy < -SEUIL_GLISSE;
  if (passe === g.seuil) return;
  g.seuil = passe;
  const moi = document.querySelector('#table [data-region="moi"]');
  if (moi) moi.classList.toggle('depot', passe);
  if (passe) { sonTable('cran'); vibreTable('cran'); }
}

/* Le doigt se lève : au-delà du seuil, la carte est jouée et part de là où
   on l'a lâchée ; en deçà, elle revient. Le clic qui suit est avalé. */
function glisseFin(ev) {
  const g = GLISSE, el = g.el;
  if (!el || ev.pointerId !== g.pid) return;
  GLISSE.el = null;
  if (!g.actif) return;
  APPUI.ouvert = Date.now();
  const moi = document.querySelector('#table [data-region="moi"]');
  if (moi) moi.classList.remove('depot');
  const q = TABLE.question;
  if (g.seuil && ev.type !== 'pointercancel' && q && q.n === g.n) {
    TABLE.leve = null;
    vibreTable('valide');
    return repondsTable(g.i);
  }
  const t = el.style.transform;
  el.classList.remove('glisse');
  el.style.transform = '';
  if (t && el.animate) el.animate([{transform: t}, {transform: 'none'}], {duration: 220, easing: 'cubic-bezier(.3,1.3,.5,1)'});
}
