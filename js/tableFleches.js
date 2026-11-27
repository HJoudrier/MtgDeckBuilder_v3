/* =====================================================================
   js/tableFleches.js — Ce qui vise quoi : des liens d'or, des flèches

   Un lien d'or part de chaque objet de la pile, rejoint ce qu'il vise et
   s'enroule autour : le trait arrive, puis fait le tour de la carte ou du
   cartouche, et une lueur y circule. Un autre relie la carte qui s'active
   à la capacité qu'elle a mise sur la pile, et s'enroule autour de la
   carte. Seuls brillent les liens de l'objet qu'on regarde dans le tunnel
   (js/tablePile.js) : les autres pâlissent, et l'écran d'un téléphone ne
   devient pas un écheveau. Au combat restent des flèches : de l'attaquant
   au joueur qu'il attaque, du bloqueur à l'attaquant.

   Les traits se gardent d'un tracé à l'autre, rangés par ce qu'ils relient :
   le calque est retracé à chaque repeint, à chaque défilement et pendant
   que les cartes du tunnel glissent, mais un lien ne se dessine qu'une fois,
   à sa naissance. Une carte hors de vue — sur une autre page de l'Arène, au
   bout d'une rangée — est remplacée par le cartouche de son joueur. Les
   couleurs passent par des classes : un attribut SVG ne lit pas les
   variables du thème.
   ===================================================================== */

/* Les liens à tracer, d'après la vue seule, et le tunnel pour savoir lequel
   on regarde. */
function liensTable(v) {
  const l = [], champ = new Set(v.champ.map(o => o.id)), devant = rangPile();
  elementsPile(v).forEach((e, k) => {
    const it = e.it, faible = k !== devant;
    if (it.source != null && champ.has(it.source)) l.push({de: {id: it.id}, a: {id: it.source}, genre: 'active', faible});
    (it.refs || []).forEach(c => l.push({de: {id: it.id}, a: c, genre: 'cible', faible}));
  });
  v.champ.forEach(o => {
    if (o.attaque) l.push({de: {id: o.id}, a: o.attaque.j != null ? {j: o.attaque.j} : {id: o.attaque.pw}, genre: 'attaque'});
    if (o.bloque != null) l.push({de: {id: o.id}, a: {id: o.bloque}, genre: 'bloque'});
  });
  return l;
}

/* Les ids que la pile désigne, pour allumer les cartes : celles qui
   s'activent, celles qui sont visées — l'objet qu'on résout compris. */
function marquesPile(v) {
  if (v._marques) return v._marques;
  const sources = new Set(), visees = new Set();
  elementsPile(v).forEach(({it}) => {
    if (it.source != null) sources.add(it.source);
    (it.refs || []).forEach(c => { if (c.id != null) visees.add(c.id); });
  });
  Object.defineProperty(v, '_marques', {value: {sources, visees}, enumerable: false});
  return v._marques;
}

/* Le rectangle d'un élément, s'il se voit : ni hors de l'écran, ni caché
   par le bord d'une rangée qui défile. */
function rectVisible(el) {
  let r = el.getBoundingClientRect();
  if (!r.width || !r.height) return null;
  let box = {l: r.left, t: r.top, r: r.right, b: r.bottom};
  for (let p = el.parentElement; p && p.id !== 'table'; p = p.parentElement) {
    if (!p.hasAttribute('data-defile')) continue;
    const q = p.getBoundingClientRect();
    box = {l: Math.max(box.l, q.left), t: Math.max(box.t, q.top), r: Math.min(box.r, q.right), b: Math.min(box.b, q.bottom)};
  }
  if (box.r - box.l < 8 || box.b - box.t < 8) return null;
  return box;
}

/* L'élément visible qui représente une référence : la carte, sinon le
   cartouche ou l'onglet de son joueur. La main et les choix de la
   question ne comptent pas : on vise ce qui est sur la table. */
function ancreDe(ref, v) {
  const t = document.getElementById('table');
  const essaie = sel => { for (const el of t.querySelectorAll(sel)) { if (el.closest('[data-region="question"], [data-region="main"], [data-region="couche"]')) continue; const r = rectVisible(el); if (r) return r; } return null; };
  if (ref.j != null) return essaie(`[data-ancre-j="${ref.j}"]`);
  const r = essaie(`[data-loupe="${ref.id}"]`);
  if (r) return r;
  const o = v.champ.find(x => x.id === ref.id) || elementsPile(v).map(e => e.it).find(x => x.id === ref.id);
  return o ? essaie(`[data-ancre-j="${o.ctrl}"]`) : null;
}

const f1 = x => x.toFixed(1);

/* Une flèche courbe d'un centre à l'autre, arrêtée au bord de la cible. */
function cheminFleche(a, b) {
  const x1 = (a.l + a.r) / 2, y1 = (a.t + a.b) / 2, x2 = (b.l + b.r) / 2, y2 = (b.t + b.b) / 2;
  const dx = x2 - x1, dy = y2 - y1, d = Math.hypot(dx, dy);
  if (d < 12) return null;
  const rayon = Math.min((b.r - b.l), (b.b - b.t)) / 2 * 0.6;
  const fx = x2 - dx / d * rayon, fy = y2 - dy / d * rayon;
  const cx = (x1 + fx) / 2 - dy * 0.18, cy = (y1 + fy) / 2 + dx * 0.18;
  return `M${f1(x1)} ${f1(y1)} Q${f1(cx)} ${f1(cy)} ${f1(fx)} ${f1(fy)}`;
}

/* Le tour d'un rectangle arrondi, dans le sens des aiguilles, en partant
   du point de son bord où le lien arrive et en y revenant. */
function tourDe(E, rr, px, py) {
  const {l, t, r, b} = E;
  const ecarts = [Math.abs(py - t), Math.abs(px - r), Math.abs(py - b), Math.abs(px - l)];
  const e = ecarts.indexOf(Math.min(...ecarts));
  const cx = Math.max(l + rr, Math.min(r - rr, px)), cy = Math.max(t + rr, Math.min(b - rr, py));
  const p0 = [[cx, t], [r, cy], [cx, b], [l, cy]][e];
  const fins = [[r - rr, t], [r, b - rr], [l + rr, b], [l, t + rr]], arcs = [[r, t + rr], [r - rr, b], [l, b - rr], [l + rr, t]];
  let d = '';
  for (let i = 0; i < 4; i++) {
    const k = (e + i) % 4;
    d += `L${f1(fins[k][0])} ${f1(fins[k][1])}A${f1(rr)} ${f1(rr)} 0 0 1 ${f1(arcs[k][0])} ${f1(arcs[k][1])}`;
  }
  return {p0, d: d + `L${f1(p0[0])} ${f1(p0[1])}`};
}

/* Un lien d'or : de l'objet de la pile `a` jusqu'au bord de `b`, élargi de
   `marge` — un deuxième lien vers la même carte l'entoure d'un peu plus
   loin —, puis le tour de `b`. Un joueur s'entoure en pilule. */
function cheminLien(a, b, marge, rang, pilule) {
  const E = {l: b.l - marge, t: b.t - marge, r: b.r + marge, b: b.b + marge};
  const rr = pilule ? (E.b - E.t) / 2 : Math.min(9, (E.r - E.l) / 2, (E.b - E.t) / 2);
  const x1 = (a.l + a.r) / 2, y1 = (a.t + a.b) / 2, x2 = (E.l + E.r) / 2, y2 = (E.t + E.b) / 2;
  const dx = x2 - x1, dy = y2 - y1, d = Math.hypot(dx, dy);
  if (d < 12) return null;
  const ux = dx / d, uy = dy / d, bord = (w, h) => Math.min(ux ? Math.abs(w / 2 / ux) : Infinity, uy ? Math.abs(h / 2 / uy) : Infinity);
  const ta = bord(a.r - a.l, a.b - a.t), tb = bord(E.r - E.l, E.b - E.t);
  const sx = x1 + ux * ta, sy = y1 + uy * ta;
  const tour = tourDe(E, rr, x2 - ux * tb, y2 - uy * tb), [ex, ey] = tour.p0;
  const k = (rang % 2 ? -1 : 1) * (.14 + .06 * Math.floor(rang / 2));
  const cx = (sx + ex) / 2 - (ey - sy) * k, cy = (sy + ey) / 2 + (ex - sx) * k;
  return `M${f1(sx)} ${f1(sy)}Q${f1(cx)} ${f1(cy)} ${f1(ex)} ${f1(ey)}` + tour.d;
}

const MARQUES_FLECHES = ['attaque', 'bloque'].map(g =>
  `<marker id="tf-${g}" class="${g}" viewBox="0 0 10 10" refX="7" refY="5" markerWidth="4.5" markerHeight="4.5" orient="auto-start-reverse"><path d="M0 0L10 5L0 10z"/></marker>`).join('');

/* Les traits tracés, par ce qu'ils relient : ils survivent aux repeints. */
const TRAITS = new Map();
const cleRefTrait = r => r.j != null ? 'j' + r.j : String(r.id);

function creeTrait(svg, genre) {
  const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
  const dore = genre === 'cible' || genre === 'active';
  g.setAttribute('class', `${dore ? 'tf-lien' : 'fl'} ${genre}${mouvementsActifs() ? ' neuf' : ''}`);
  g.innerHTML = dore ? '<path class="lien-fond" pathLength="1"/><path class="lien-trait" pathLength="1"/><path class="lien-flux"/>'
    : `<path class="tf-fond"/><path class="${genre}" marker-end="url(#tf-${genre})"/><circle class="${genre}" r="3.5"/>`;
  svg.appendChild(g);
  return {g, dore, chemins: [...g.querySelectorAll('path')], pied: g.querySelector('circle')};
}

function traceFleches() {
  const svg = document.querySelector('#table .tf');
  const v = TABLE.vue;
  if (!svg || !v) return;
  if (!svg.querySelector('defs')) { svg.innerHTML = `<defs>${MARQUES_FLECHES}</defs>`; TRAITS.clear(); }
  const vus = new Set(), autour = new Map();
  liensTable(v).forEach(l => {
    const a = ancreDe(l.de, v), b = ancreDe(l.a, v);
    if (!a || !b) return;
    const dore = l.genre === 'cible' || l.genre === 'active', cleB = cleRefTrait(l.a), n = autour.get(cleB) || 0;
    const d = dore ? cheminLien(a, b, 4 + n * 4, n, l.a.j != null) : cheminFleche(a, b);
    if (!d) return;
    if (dore) autour.set(cleB, n + 1);
    const cle = `${l.genre}:${cleRefTrait(l.de)}>${cleB}`;
    vus.add(cle);
    let t = TRAITS.get(cle);
    if (!t || !t.g.isConnected) { t = creeTrait(svg, l.genre); TRAITS.set(cle, t); }
    t.chemins.forEach(p => p.setAttribute('d', d));
    if (t.pied) { t.pied.setAttribute('cx', f1((a.l + a.r) / 2)); t.pied.setAttribute('cy', f1((a.t + a.b) / 2)); }
    t.g.classList.toggle('faible', !!l.faible);
  });
  for (const [cle, t] of TRAITS) if (!vus.has(cle)) { t.g.remove(); TRAITS.delete(cle); }
}

/* Un défilement ou un changement de taille : un seul tracé par image. */
let flechesPrevues = false;
function planifieFleches() {
  if (flechesPrevues || !TABLE.ouverte) return;
  flechesPrevues = true;
  requestAnimationFrame(() => { flechesPrevues = false; traceFleches(); });
}

/* Pendant qu'une carte glisse — le tunnel qui change de cran, une carte
   qui voyage —, les liens la suivent image par image. */
let flechesJusqua = 0;
function suisFleches(ms) {
  const fin = performance.now() + ms, enCours = flechesJusqua > performance.now();
  flechesJusqua = Math.max(flechesJusqua, fin);
  if (enCours) return;
  const pas = () => {
    if (!TABLE.ouverte) return;
    traceFleches();
    if (performance.now() < flechesJusqua) requestAnimationFrame(pas);
  };
  requestAnimationFrame(pas);
}
