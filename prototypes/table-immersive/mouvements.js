/* =====================================================================
   mouvements.js — Les cartes qui voyagent, et les effets posés par-dessus

   Le principe est celui du « FLIP » : on mesure chaque carte avant le
   repeint, on repeint, on la mesure après, et on la fait partir de son
   ancienne place. La table se repeint en entier à chaque geste, comme
   celle de l'atelier repeint ses régions : il suffit donc que chaque
   carte porte un identifiant (`data-id`) pour qu'elle glisse de la main
   à la pile, de la pile au champ, du champ au cimetière — sans qu'aucun
   écran n'ait à écrire une seule animation.

   Une carte ne porte jamais de `transform` en propre (l'éventail et
   l'engagement tournent son corps, pas elle) : c'est ce qui rend la
   mesure exacte et l'animation juste.
   ===================================================================== */

const MVT = {duree: 420, ease: 'cubic-bezier(.2,.8,.2,1)'};

/* Une mesure rapportée à l'écran de la maquette. */
function rel(r) {
  const b = ECRAN.el.getBoundingClientRect();
  return {x: r.left - b.left, y: r.top - b.top, w: r.width, h: r.height, cx: r.left - b.left + r.width / 2, cy: r.top - b.top + r.height / 2};
}

function capture(racine) {
  const m = new Map();
  racine.querySelectorAll('[data-id]').forEach(el => {
    const corps = el.querySelector('.k-corps');
    m.set(el.dataset.id, {el, r: el.getBoundingClientRect(), eng: el.classList.contains('engage'),
      w: getComputedStyle(el).getPropertyValue('--w'), ct: corps ? getComputedStyle(corps).transform : 'none'});
  });
  return m;
}

/* Rejouer le chemin de chaque carte, de sa place d'avant à sa place
   d'après. Une carte qui arrive de nulle part part de l'ancre de sa zone
   d'origine (la bibliothèque, la main de Mirela) ; une carte qui s'en va
   rejoint celle de sa zone d'arrivée. */
function flip(avant, apres) {
  if (REGLAGES.reduit) return;
  const d = MVT.duree;
  for (const [id, n] of apres) {
    const a = avant.get(id), el = n.el;
    if (a) {
      const memeAspect = a.eng === n.eng;
      const dx = memeAspect ? a.r.left - n.r.left : (a.r.left + a.r.width / 2) - (n.r.left + n.r.width / 2);
      const dy = memeAspect ? a.r.top - n.r.top : (a.r.top + a.r.height / 2) - (n.r.top + n.r.height / 2);
      const s = memeAspect ? a.r.width / n.r.width : 1;
      if (Math.abs(dx) > .5 || Math.abs(dy) > .5 || Math.abs(s - 1) > .01)
        el.animate([{transform: `translate(${dx}px,${dy}px) scale(${s})`}, {transform: 'none'}], {duration: d, easing: MVT.ease});
      if (!memeAspect) {
        const corps = el.querySelector('.k-corps');
        if (corps) corps.animate([{transform: a.ct}, {transform: n.ct}], {duration: d * .8, easing: MVT.ease});
      }
      continue;
    }
    const o = Scene.obj(id), ancre = o && o.prec && ECRAN.el.querySelector(`[data-ancre="${o.prec}-${o.ctrl}"]`);
    if (ancre) {
      const r = ancre.getBoundingClientRect();
      const dx = (r.left + r.width / 2) - (n.r.left + n.r.width / 2), dy = (r.top + r.height / 2) - (n.r.top + n.r.height / 2);
      el.animate([{transform: `translate(${dx}px,${dy}px) scale(.3)`, opacity: .3}, {transform: 'none', opacity: 1}], {duration: d * 1.2, easing: MVT.ease});
    } else el.animate([{opacity: 0, transform: 'scale(.85)'}, {opacity: 1, transform: 'none'}], {duration: d * .7, easing: MVT.ease});
  }
  for (const [id, a] of avant) if (!apres.has(id)) part(id, a);
}

/* Une carte qui quitte la table : son ancien nœud, posé sur le calque, va
   se fondre dans l'ancre de sa nouvelle zone. */
function part(id, a) {
  const o = Scene.obj(id), p = rel(a.r), cl = a.el;
  cl.removeAttribute('data-id');
  cl.classList.add('fx-part');
  Object.assign(cl.style, {position: 'absolute', left: p.x + 'px', top: p.y + 'px', margin: '0', pointerEvents: 'none'});
  if (a.w) cl.style.setProperty('--w', a.w);
  ECRAN.calque.appendChild(cl);
  const ancre = o && ECRAN.el.querySelector(`[data-ancre="${o.zone}-${o.ctrl}"]`);
  let kf;
  if (ancre) {
    const r = rel(ancre.getBoundingClientRect());
    kf = [{transform: 'none', opacity: 1}, {transform: `translate(${r.cx - p.cx}px,${r.cy - p.cy}px) scale(.3)`, opacity: .15}];
  } else kf = [{opacity: 1}, {opacity: 0, transform: 'scale(.9)'}];
  cl.animate(kf, {duration: MVT.duree * 1.15, easing: MVT.ease}).onfinish = () => cl.remove();
}

function plusTard(fn, ms) { setTimeout(() => { if (ECRAN.el) fn(); }, REGLAGES.reduit ? 0 : ms); }

function element(cls, html) {
  const d = document.createElement('div');
  d.className = cls;
  if (html != null) d.innerHTML = html;
  ECRAN.calque.appendChild(d);
  return d;
}

/* Un nombre qui jaillit d'une carte ou d'un joueur : −3, +3/+3. */
function flotte(p, texte, cls = '') {
  const d = element('fx-nombre ' + cls);
  d.textContent = texte;
  Object.assign(d.style, {left: p.cx + 'px', top: p.cy + 'px'});
  const kf = REGLAGES.reduit
    ? [{opacity: 1, transform: 'translate(-50%,-50%)'}, {opacity: 0, transform: 'translate(-50%,-50%)'}]
    : [{transform: 'translate(-50%,-50%) scale(.5)', opacity: 0}, {transform: 'translate(-50%,-85%) scale(1.2)', opacity: 1, offset: .22},
      {transform: 'translate(-50%,-170%) scale(1)', opacity: 0}];
  d.animate(kf, {duration: 1150, easing: 'ease-out'}).onfinish = () => d.remove();
}

/* Des éclats qui partent du centre d'une carte : une créature qui se
   brise, un sort qui se résout. */
function eclats(p, teinte = 'brass', n = 12, force = 1) {
  if (REGLAGES.reduit) return;
  for (let i = 0; i < n; i++) {
    const d = element('fx-eclat t-' + teinte), a = Math.random() * Math.PI * 2, r = (30 + Math.random() * 50) * force;
    const s = 3 + Math.random() * 5;
    Object.assign(d.style, {left: p.cx + 'px', top: p.cy + 'px', width: s + 'px', height: s + 'px'});
    d.animate([{transform: 'translate(-50%,-50%)', opacity: 1},
      {transform: `translate(calc(-50% + ${Math.cos(a) * r}px), calc(-50% + ${Math.sin(a) * r + 20}px)) rotate(${Math.random() * 360}deg)`, opacity: 0}],
    {duration: 600 + Math.random() * 400, easing: 'cubic-bezier(.1,.7,.3,1)'}).onfinish = () => d.remove();
  }
}

/* Une onde au sol : la carte s'est posée. */
function onde(p, cls = '') {
  if (REGLAGES.reduit) return;
  const d = element('fx-onde ' + cls);
  const t = Math.max(p.w, p.h) * 1.1;
  Object.assign(d.style, {left: p.cx + 'px', top: p.cy + 'px', width: t + 'px', height: t + 'px'});
  d.animate([{transform: 'translate(-50%,-50%) scale(.6)', opacity: .9}, {transform: 'translate(-50%,-50%) scale(1.6)', opacity: 0}],
    {duration: 650, easing: 'ease-out'}).onfinish = () => d.remove();
}

function secoue(el, amp = 4) {
  if (REGLAGES.reduit || !el) return;
  const k = [0, 1, -1, .6, -.6, .3, 0].map((f, i) => ({transform: `translate(${f * amp}px, ${(i % 2 ? -1 : 1) * f * amp * .4}px)`}));
  el.animate(k, {duration: 320, easing: 'linear'});
}

/* Un voile sur tout l'écran : l'éclair rouge d'une blessure, le flash d'un choc. */
function voile(cls) {
  const v = ECRAN.el.querySelector('.ec-voile');
  if (!v || REGLAGES.reduit) return;
  v.className = 'ec-voile';
  void v.offsetWidth;
  v.className = 'ec-voile ' + cls;
}

/* Une bannière qui traverse l'écran : « Tour de Mirela ». */
function banniere(texte, sous = '', grande = false) {
  const d = element('fx-banniere' + (grande ? ' grande' : ''), `<b>${esc(texte)}</b>${sous ? `<span>${esc(sous)}</span>` : ''}`);
  const kf = REGLAGES.reduit ? [{opacity: 0}, {opacity: 1, offset: .2}, {opacity: 1, offset: .8}, {opacity: 0}]
    : [{transform: 'translate(-50%,-50%) translateX(60%)', opacity: 0}, {transform: 'translate(-50%,-50%)', opacity: 1, offset: .2},
      {transform: 'translate(-50%,-50%)', opacity: 1, offset: .75}, {transform: 'translate(-50%,-50%) translateX(-60%)', opacity: 0}];
  d.animate(kf, {duration: grande ? 1700 : 1300, easing: 'cubic-bezier(.3,.7,.3,1)'}).onfinish = () => d.remove();
}

/* Un dos de carte qui vole d'une ancre à l'autre : Mirela pioche, et l'on
   voit sa main grossir sans voir la carte. */
function volDos(de, vers) {
  if (REGLAGES.reduit) return;
  const a = ECRAN.el.querySelector(`[data-ancre="${de}"]`), b = ECRAN.el.querySelector(`[data-ancre="${vers}"]`);
  if (!a || !b) return;
  const p = rel(a.getBoundingClientRect()), q = rel(b.getBoundingClientRect());
  const d = element('fx-dos');
  Object.assign(d.style, {left: p.cx + 'px', top: p.cy + 'px'});
  d.animate([{transform: 'translate(-50%,-50%) rotate(-10deg)'}, {transform: `translate(calc(-50% + ${q.cx - p.cx}px), calc(-50% + ${q.cy - p.cy}px)) rotate(8deg)`}],
    {duration: 520, easing: MVT.ease}).onfinish = () => d.remove();
}

/* Une ligne de texte brève au-dessus de la main : un refus expliqué. */
function dit(texte) {
  if (!texte) return;
  ECRAN.calque.querySelectorAll('.fx-dit').forEach(x => x.remove());
  const d = element('fx-dit');
  d.textContent = texte;
  d.animate([{opacity: 0, transform: 'translate(-50%, 6px)'}, {opacity: 1, transform: 'translate(-50%, 0)', offset: .1},
    {opacity: 1, transform: 'translate(-50%, 0)', offset: .85}, {opacity: 0, transform: 'translate(-50%, 0)'}], {duration: 2400}).onfinish = () => d.remove();
}

/* Une flèche courbe d'un point à un autre, avec sa pointe. */
function cheminFleche(a, b, cls) {
  const mx = (a.cx + b.cx) / 2, my = (a.cy + b.cy) / 2, dx = b.cx - a.cx, dy = b.cy - a.cy;
  const l = Math.hypot(dx, dy) || 1, k = Math.min(60, l * .25);
  const cx = mx - dy / l * k, cy = my + dx / l * k;
  const fin = {x: b.cx - dx / l * Math.min(18, b.h * .3), y: b.cy - dy / l * Math.min(18, b.h * .3)};
  const d = `M${a.cx.toFixed(1)},${a.cy.toFixed(1)} Q${cx.toFixed(1)},${cy.toFixed(1)} ${fin.x.toFixed(1)},${fin.y.toFixed(1)}`;
  return `<path class="fl-fond" d="${d}"/><path class="fl ${cls}" d="${d}" marker-end="url(#pointe-${cls})"/>`;
}

const DEFS_FLECHES = `<defs>${['moi', 'adv', 'combat', 'libre'].map(c =>
  `<marker id="pointe-${c}" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse">
    <path class="pointe ${c}" d="M0,0 L10,5 L0,10 z"/></marker>`).join('')}</defs>`;
