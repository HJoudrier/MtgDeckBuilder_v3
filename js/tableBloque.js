/* =====================================================================
   js/tableBloque.js — Bloquer en glissant une créature sur son attaquant

   À la déclaration des bloqueurs, on prend une de ses créatures et on la
   dépose sur la carte de l'attaquant qu'elle bloque. Le geste passe par les
   évènements de pointeur — souris et doigt de la même façon —, écoutés dans
   js/app.js à côté de ceux de js/tableLever.js, qui pousse une carte de la
   main : celui-ci ne démarre que sur une créature du champ, pendant la
   question des bloqueurs.

   Pendant le glissé, la table n'est pas repeinte : une carte retirée du DOM
   sous un doigt qui la tient perdrait ses évènements. Seules des classes
   changent — les attaquants que la créature peut bloquer s'allument, celui
   sous le pointeur s'intensifie — et une copie de la carte suit le pointeur.
   Le clic qui termine un glissé est avalé : on ne voulait pas ouvrir la loupe.
   ===================================================================== */

const BLOQUE = {id: null, bi: -1, el: null, x: 0, y: 0, pid: null, actif: false, fantome: null, fin: 0};
const BLOQUE_SEUIL = 8;

/* Un doigt ou un bouton se pose sur l'une de ses créatures qui peut bloquer. */
function bloqueDebut(ev) {
  bloqueNettoie();
  const q = TABLE.ouverte && TABLE.question;
  if (!q || q.q !== 'bloqueurs' || (ev.pointerType === 'mouse' && ev.button !== 0)) return;
  const el = ev.target.closest && ev.target.closest('#table .tc[data-id]');
  const bi = el ? q.options.findIndex(o => o.id === +el.dataset.id) : -1;
  if (bi < 0) return;
  Object.assign(BLOQUE, {id: +el.dataset.id, bi, el, x: ev.clientX, y: ev.clientY, pid: ev.pointerId});
}

/* La carte qui suit le pointeur : la copie de celle qu'on tient. */
function bloqueFantome(el) {
  const corps = el.querySelector('.tc-corps');
  const f = el.cloneNode(true);
  ['data-act', 'data-id', 'data-loupe', 'data-i'].forEach(a => f.removeAttribute(a));
  f.classList.remove('choix', 'choisi', 'engage');
  f.classList.add('tc-fantome');
  const w = (corps ? corps.offsetWidth : 58) + 'px';
  f.style.setProperty('--tw', w);
  f.style.setProperty('--tvw', w);
  document.body.appendChild(f);
  return f;
}

/* Le glissé commence vraiment : les attaquants que cette créature peut
   bloquer s'allument. */
function bloqueCommence(q) {
  appuiAnnule();
  BLOQUE.actif = true;
  BLOQUE.fantome = bloqueFantome(BLOQUE.el);
  BLOQUE.el.classList.add('bloc-tenu');
  document.body.classList.add('en-blocage');
  q.options[BLOQUE.bi].legaux.forEach(ai => {
    const t = document.querySelector(`#table .tc[data-id="${q.attaquants[ai].id}"]`);
    if (t) t.classList.add('bloc-cible');
  });
}

/* Le pointeur bouge : la copie le suit, la cible sous lui s'intensifie. */
function bloqueBouge(ev) {
  if (BLOQUE.id == null || ev.pointerId !== BLOQUE.pid) return;
  const q = TABLE.question;
  if (!q || q.q !== 'bloqueurs') return bloqueNettoie();
  if (!BLOQUE.actif) {
    if (Math.hypot(ev.clientX - BLOQUE.x, ev.clientY - BLOQUE.y) < BLOQUE_SEUIL) return;
    bloqueCommence(q);
  }
  BLOQUE.fantome.style.left = ev.clientX + 'px';
  BLOQUE.fantome.style.top = ev.clientY + 'px';
  const cible = bloqueCibleSous(ev);
  document.querySelectorAll('#table .tc.bloc-survol').forEach(t => { if (t !== cible) t.classList.remove('bloc-survol'); });
  if (cible) cible.classList.add('bloc-survol');
}

/* L'attaquant que cette créature peut bloquer, sous le pointeur, ou rien. */
function bloqueCibleSous(ev) {
  const e = document.elementFromPoint(ev.clientX, ev.clientY);
  return e && e.closest ? e.closest('#table .tc.bloc-cible') : null;
}

/* Le pointeur se lève : déposé sur un attaquant, c'est un blocage ; ailleurs,
   le blocage ne se fait pas — et l'on dit pourquoi si la cible existait mais
   ne pouvait pas être bloquée. */
function bloqueFin(ev) {
  if (BLOQUE.id == null || ev.pointerId !== BLOQUE.pid) return;
  const q = TABLE.question, etait = BLOQUE.actif, bi = BLOQUE.bi;
  let attaquant = -1, refus = '';
  if (etait && ev.type !== 'pointercancel' && q && q.q === 'bloqueurs') {
    const cible = bloqueCibleSous(ev);
    if (cible) attaquant = q.attaquants.findIndex(a => a.id === +cible.dataset.id);
    else {
      const e = document.elementFromPoint(ev.clientX, ev.clientY);
      const t = e && e.closest ? e.closest('#table .tc[data-id]') : null;
      const ai = t ? q.attaquants.findIndex(a => a.id === +t.dataset.id) : -1;
      if (ai >= 0) refus = `${q.options[bi].label} ne peut pas bloquer ${q.attaquants[ai].label}.`;
    }
  }
  bloqueNettoie();
  if (!etait) return;
  BLOQUE.fin = Date.now();
  if (attaquant >= 0) posePaire(q, bi, attaquant);
  else if (refus) { TABLE.erreur = refus; renduTable(); }
}

function bloqueNettoie() {
  if (BLOQUE.fantome) BLOQUE.fantome.remove();
  if (BLOQUE.el) BLOQUE.el.classList.remove('bloc-tenu');
  document.querySelectorAll('#table .tc.bloc-cible, #table .tc.bloc-survol').forEach(t => t.classList.remove('bloc-cible', 'bloc-survol'));
  document.body.classList.remove('en-blocage');
  Object.assign(BLOQUE, {id: null, bi: -1, el: null, pid: null, actif: false, fantome: null});
}

/* Le clic qui suit un glissé est avalé. */
function bloqueAvale() {
  const avale = BLOQUE.fin && Date.now() - BLOQUE.fin < 200;
  BLOQUE.fin = 0;
  return !!avale;
}

/* Un blocage posé : cette créature bloque cet attaquant, et plus rien d'autre. */
function posePaire(q, bi, ai) {
  if (!q.options[bi].legaux.includes(ai)) return;
  selDe(q).paires.set(bi, ai);
  TABLE.erreur = '';
  TABLE.loupe = null;
  renduTable();
}
