/* =====================================================================
   js/tableEclats.js — Ce que l'œil voit d'un coup

   Une carte qui prend son élan et frappe, une entaille, des étincelles, un
   nombre en étoile, une cible qui tremble, la table entière qui tremble et
   ses bords qui rougissent, une carte tranchée en deux ou écrasée. Rien ici
   ne sait rien de la partie : js/tableCoups.js décide qui frappe qui, ceci
   le montre.

   Tout se pose dans le calque des mouvements (`.tmv`), en coordonnées
   d'écran, et ne bouge que par `transform` et `opacity`, qu'un téléphone
   compose sans repeindre. Une carte qui frappe y part en doublure : sa
   rangée défile, et la rognerait.
   ===================================================================== */

const calqueCoups = () => document.querySelector('#table .tmv');
const centre = r => ({x: r.left + r.width / 2, y: r.top + r.height / 2});

/* Quatre façons de frapper. `elan` et `contact` disent où tombent, dans la
   durée, la fin de l'élan et le choc ; chaque image clé reçoit l'axe du
   coup (ux, uy), la course (tx, ty) et le côté (s). */
const STYLES_COUPS = {
  taille: {duree: 700, elan: .3, contact: .5, traine: true, kf: (ux, uy, tx, ty, s) => [
    {transform: 'none', easing: 'cubic-bezier(.2,.7,.3,1)'},
    {transform: `translate(${-ux * 12}px,${-uy * 12}px) rotate(${-15 * s}deg) scale(1.07)`, offset: .3, easing: 'cubic-bezier(.8,0,1,.45)'},
    {transform: `translate(${tx}px,${ty}px) rotate(${20 * s}deg) scale(1.12)`, offset: .5, easing: 'cubic-bezier(.2,.6,.4,1)'},
    {transform: `translate(${tx * .86}px,${ty * .86}px) rotate(${9 * s}deg) scale(1.06)`, offset: .62, easing: 'cubic-bezier(.45,0,.2,1)'},
    {transform: 'none'}]},
  estoc: {duree: 560, elan: .34, contact: .47, traine: true, kf: (ux, uy, tx, ty) => [
    {transform: 'none', easing: 'cubic-bezier(.2,.7,.3,1)'},
    {transform: `translate(${-ux * 22}px,${-uy * 22}px) scale(.94)`, offset: .34, easing: 'cubic-bezier(.9,0,1,.5)'},
    {transform: `translate(${tx}px,${ty}px) scale(1.1)`, offset: .47, easing: 'ease-out'},
    {transform: `translate(${tx * .92}px,${ty * .92}px) scale(1.05)`, offset: .58, easing: 'cubic-bezier(.45,0,.2,1)'},
    {transform: 'none'}]},
  charge: {duree: 1000, elan: .44, contact: .6, traine: false, kf: (ux, uy, tx, ty, s) => [
    {transform: 'none', easing: 'cubic-bezier(.3,.6,.3,1)'},
    {transform: `translate(${-ux * 10}px,${-uy * 10 - 18}px) rotate(${-6 * s}deg) scale(1.26)`, offset: .44, easing: 'cubic-bezier(.85,0,1,.6)'},
    {transform: `translate(${tx}px,${ty}px) rotate(${4 * s}deg) scale(1)`, offset: .6, easing: 'ease-out'},
    {transform: `translate(${tx * .94}px,${ty * .94}px) rotate(${2 * s}deg) scale(1.02)`, offset: .72, easing: 'cubic-bezier(.45,0,.2,1)'},
    {transform: 'none'}]},
  plongeon: {duree: 840, elan: .4, contact: .56, traine: true, kf: (ux, uy, tx, ty, s) => [
    {transform: 'none', easing: 'cubic-bezier(.2,.7,.3,1)'},
    {transform: `translate(${-ux * 30 + s * 10}px,${-uy * 30}px) rotate(${10 * s}deg) scale(1.28)`, offset: .4, easing: 'cubic-bezier(.85,0,1,.5)'},
    {transform: `translate(${tx}px,${ty}px) rotate(${-8 * s}deg) scale(1.06)`, offset: .56, easing: 'ease-out'},
    {transform: `translate(${tx * .9}px,${ty * .9}px) rotate(${-4 * s}deg) scale(1.03)`, offset: .66, easing: 'cubic-bezier(.45,0,.2,1)'},
    {transform: 'none'}]}
};
/* La traînée : deux silhouettes floues qui ne se voient que pendant la frappe. */
const OPACITES_TRAINEE = [0, 0, .9, .3, 0];

/* Les cartes qui frappent en ce moment, par identifiant : leur doublure.
   L'original reste caché dessous, même si la table se repeint entre-temps. */
const EN_VOL = new Map();

/* Ce qu'on voit d'une carte en ce moment : sa doublure, si elle frappe. */
const visibleCoup = el => (el && el.dataset.id && EN_VOL.get(el.dataset.id)) || el;

/* Une carte posée sur le calque, à la place exacte de `el`. */
function doublure(el) {
  const r = el.getBoundingClientRect(), d = el.cloneNode(true);
  ['data-id', 'data-loupe', 'data-act'].forEach(a => d.removeAttribute(a));
  d.classList.remove('en-coup', 'choix', 'choisi', 'leve', 'implique');
  d.classList.add('doublure');
  Object.assign(d.style, {left: r.left + 'px', top: r.top + 'px', margin: '0', visibility: ''});
  d.style.setProperty('--w', getComputedStyle(el).getPropertyValue('--w'));
  calqueCoups().appendChild(d);
  return d;
}

/* `el` frappe `cible` : élan, coup, retour. `auContact(axe)` tombe au
   choc ; la promesse se tient au retour. `portee` raccourcit la course
   d'une riposte. `el` déjà posé sur le calque (une créature morte qu'on
   retient) frappe lui-même ; sinon une doublure frappe à sa place. */
function elan(el, cible, style, auContact, portee = 1) {
  return new Promise(fin => {
    const S = STYLES_COUPS[style] || STYLES_COUPS.taille, calque = calqueCoups();
    const a = el.getBoundingClientRect(), b = cible.getBoundingClientRect(), ca = centre(a), cb = centre(b);
    const dx = cb.x - ca.x, dy = cb.y - ca.y, L = Math.hypot(dx, dy) || 1, ux = dx / L, uy = dy / L;
    const bord = Math.min(ux ? Math.abs(b.width / 2 / ux) : Infinity, uy ? Math.abs(b.height / 2 / uy) : Infinity);
    const course = Math.max(0, (L - bord - a.height * .3) * portee), s = Math.sign(dx) || 1, axe = {ux, uy, s};
    if (!calque || !mouvementsActifs()) { auContact(axe); fin(); return; }
    const pose = el.parentNode === calque, acteur = pose ? el : doublure(el), id = !pose && el.dataset.id;
    if (id) { el.classList.add('en-coup'); EN_VOL.set(id, acteur); }
    acteur.classList.add('en-vol');
    const kf = S.kf(ux, uy, ux * course, uy * course, s);
    if (S.traine) [1, 2].forEach(i => {
      const g = doublure(acteur);
      g.classList.add('trainee');
      g.animate(kf.map((k, j) => ({...k, opacity: OPACITES_TRAINEE[j] * (i === 1 ? .45 : .22)})), {duration: S.duree, delay: i * 26}).onfinish = () => g.remove();
    });
    setTimeout(() => sonTable('fendre', style === 'charge' ? 1.3 : 1), S.duree * S.elan);
    setTimeout(() => auContact(axe), S.duree * S.contact);
    acteur.animate(kf, {duration: S.duree}).onfinish = () => {
      acteur.classList.remove('en-vol');
      if (!pose) acteur.remove();
      if (id) { EN_VOL.delete(id); document.querySelectorAll(`#table .tc.en-coup[data-id="${id}"]`).forEach(x => x.classList.remove('en-coup')); }
      fin();
    };
  });
}

/* Trembler, de moins en moins, le temps `dur`. */
function secoue(el, amp, dur) {
  if (!el || !mouvementsActifs()) return;
  const kf = [];
  for (let i = 0; i < 10; i++) {
    const a = amp * Math.pow(1 - i / 10, 2), h = () => ((Math.random() * 2 - 1) * a).toFixed(1);
    kf.push({transform: `translate(${h()}px,${h()}px) rotate(${(h() * .25).toFixed(2)}deg)`});
  }
  kf.push({transform: 'none'});
  el.animate(kf, {duration: dur, easing: 'linear', composite: 'add'});
}

/* Un éclair blanc sur ce qui est touché. */
function eclaire(el) {
  const c = el.querySelector('.tc-corps') || el;
  c.animate([{filter: 'brightness(2.4) saturate(.3)'}, {filter: 'none'}], {duration: 300, easing: 'ease-out'});
}

/* Les traits des entailles, dans un SVG du calque. */
function traitsCoups() {
  const c = calqueCoups();
  let s = c.querySelector('svg.tmv-traits');
  if (!s) { c.insertAdjacentHTML('afterbegin', '<svg class="tmv-traits" aria-hidden="true"></svg>'); s = c.querySelector('svg.tmv-traits'); }
  return s;
}

/* Une entaille à travers `r`, d'angle `theta` : un trait clair dans un
   halo, tracé d'un coup puis effacé. */
function entaille(r, theta) {
  const {x, y} = centre(r), L = Math.hypot(r.width, r.height) * 1.15, c = Math.cos(theta), s = Math.sin(theta);
  const d = `M${f1(x - c * L / 2)} ${f1(y - s * L / 2)}Q${f1(x - s * L * .1)} ${f1(y + c * L * .1)} ${f1(x + c * L / 2)} ${f1(y + s * L / 2)}`;
  const svg = traitsCoups();
  ['tmv-halo', 'tmv-coeur'].forEach(cls => {
    const p = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    p.setAttribute('d', d); p.setAttribute('class', cls); p.setAttribute('pathLength', '1');
    svg.appendChild(p);
    p.animate([{strokeDashoffset: 1, opacity: 1}, {strokeDashoffset: 0, opacity: 1, offset: .22}, {strokeDashoffset: 0, opacity: 0}],
      {duration: 440, easing: 'ease-out'}).onfinish = () => p.remove();
  });
}

/* Des étincelles projetées autour de l'angle `a`. */
function etincelles(pt, n, a) {
  const calque = calqueCoups();
  for (let i = 0; i < n; i++) {
    const e = document.createElement('i'), b = a + (Math.random() * 2 - 1) * 1.4, dist = 18 + Math.random() * 30;
    e.className = 'tmv-eclat';
    calque.appendChild(e);
    e.animate([{transform: `translate(${pt.x}px,${pt.y}px) rotate(${b}rad) scaleX(1)`, opacity: 1},
      {transform: `translate(${pt.x + Math.cos(b) * dist}px,${pt.y + Math.sin(b) * dist}px) rotate(${b}rad) scaleX(.2)`, opacity: 0}],
      {duration: 280 + Math.random() * 160, easing: 'cubic-bezier(.1,.7,.3,1)'}).onfinish = () => e.remove();
  }
}

/* Une onde de choc, plus large sous une charge. */
function onde(r, grand) {
  const o = document.createElement('i'), w = r.width * (grand ? 1.8 : 1.2), h = w * .7, {x, y} = centre(r);
  o.className = 'tmv-onde' + (grand ? ' grande' : '');
  Object.assign(o.style, {width: w + 'px', height: h + 'px', left: (x - w / 2) + 'px', top: (y - h / 2) + 'px'});
  calqueCoups().appendChild(o);
  o.animate([{transform: 'scale(.25)', opacity: .95}, {transform: `scale(${grand ? 2.1 : 1.6})`, opacity: 0}],
    {duration: grand ? 560 : 420, easing: 'cubic-bezier(.1,.7,.3,1)'}).onfinish = () => o.remove();
}

/* Les blessures prises par une carte, dans une étoile qui éclate et s'élève. */
function nombreCoup(r, n) {
  const e = document.createElement('span');
  e.className = 'tmv-coup';
  e.textContent = '−' + n;
  calqueCoups().appendChild(e);
  const x = r.left + r.width / 2 - 23, y = r.top + Math.min(r.height * .25, 20) - 23;
  e.animate([{transform: `translate(${x}px,${y}px) scale(.2) rotate(-20deg)`, opacity: 0},
    {transform: `translate(${x}px,${y}px) scale(1.3) rotate(6deg)`, opacity: 1, offset: .16},
    {transform: `translate(${x}px,${y}px) scale(1)`, opacity: 1, offset: .3},
    {transform: `translate(${x}px,${y - 28}px) scale(.9)`, opacity: 0}], {duration: 1150, easing: 'ease-out'}).onfinish = () => e.remove();
}

/* Soi touché : toute la table tremble, et ses bords rougissent. */
function ebranle(fort) {
  secoue(document.getElementById('table'), fort ? 11 : 7, fort ? 480 : 360);
  const c = calqueCoups();
  if (!c || !mouvementsActifs()) return;
  const v = document.createElement('i');
  v.className = 'tmv-rougeur';
  c.appendChild(v);
  v.animate([{opacity: 0}, {opacity: fort ? .95 : .55, offset: .15}, {opacity: 0}], {duration: fort ? 700 : 450, easing: 'ease-out'}).onfinish = () => v.remove();
}

/* Une créature achevée d'un coup de lame : sa carte se fend en deux le long
   de l'entaille, d'angle `theta`, et les deux moitiés s'écartent, tournent
   et tombent. `el` est déjà sur le calque (js/tableMouvements.js l'y a
   retenue) ; un angle trop raide se coupe à quarante degrés, pour que la
   fente traverse la carte d'un bord à l'autre. */
function tranche(el, theta) {
  const r = el.getBoundingClientRect(), t = Math.max(-.85, Math.min(.85, Math.tan(theta)));
  const yg = 50 - t * (r.width / 2) / r.height * 100, yd = 50 + t * (r.width / 2) / r.height * 100;
  const moitie = clip => {
    const m = el.cloneNode(true);
    m.classList.add('moitie');
    Object.assign(m.style, {left: r.left + 'px', top: r.top + 'px', clipPath: clip});
    calqueCoups().appendChild(m);
    return m;
  };
  const haut = moitie(`polygon(0 0,100% 0,100% ${yd}%,0 ${yg}%)`), bas = moitie(`polygon(0 ${yg}%,100% ${yd}%,100% 100%,0 100%)`);
  el.remove();
  const a = Math.atan(t), nx = -Math.sin(a), ny = Math.cos(a), duree = {duration: 950, easing: 'cubic-bezier(.4,0,.8,.6)', fill: 'forwards'};
  haut.animate([{transform: 'none'}, {transform: `translate(${-nx * 6 - 4}px,${-ny * 6}px) rotate(-4deg)`, offset: .2},
    {transform: `translate(${-nx * 10 - 26}px,${-ny * 4 + 50}px) rotate(-24deg)`, opacity: 0}], duree).onfinish = () => haut.remove();
  bas.animate([{transform: 'none'}, {transform: `translate(${nx * 6 + 4}px,${ny * 6}px) rotate(4deg)`, offset: .2},
    {transform: `translate(${nx * 10 + 24}px,${ny * 6 + 66}px) rotate(20deg)`, opacity: 0}], duree).onfinish = () => bas.remove();
  sonTable('brise');
  vibreTable('mort');
}

/* Une créature achevée sous une charge : sa carte s'aplatit et disparaît. */
function ecrase(el) {
  el.style.transformOrigin = '50% 100%';
  el.animate([{transform: 'none'}, {transform: 'scale(1.25,.14)', opacity: .9, offset: .35}, {transform: 'scale(1.35,.04)', opacity: 0}],
    {duration: 560, easing: 'cubic-bezier(.3,0,.6,1)', fill: 'forwards'}).onfinish = () => el.remove();
  sonTable('ecrase');
  vibreTable('mort');
}
