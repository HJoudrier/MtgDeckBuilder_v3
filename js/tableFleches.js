/* =====================================================================
   js/tableFleches.js — Ce qui vise quoi, en flèches

   Une flèche de chaque sort ou capacité de la pile vers ses cibles ; une
   autre, en pointillé, de la carte qui s'active vers la capacité qu'elle
   a mise sur la pile ; au combat, de chaque attaquant vers le joueur qu'il
   attaque, et de chaque bloqueur vers l'attaquant qu'il bloque.

   Les flèches se tracent dans un calque SVG posé sur toute la table, après
   chaque repeint et à chaque défilement, d'après la place réelle des
   cartes. Une carte hors de vue — sur une autre page de l'Arène, au bout
   d'une rangée — est remplacée par le cartouche de son joueur. Les
   couleurs passent par des classes : un attribut SVG ne lit pas les
   variables du thème.
   ===================================================================== */

/* Les liens à tracer, d'après la vue seule. */
function liensTable(v) {
  const l = [], champ = new Set(v.champ.map(o => o.id));
  v.pile.forEach(it => {
    if (it.source != null && champ.has(it.source)) l.push({de: {id: it.source}, a: {id: it.id}, genre: 'active'});
    (it.refs || []).forEach(c => l.push({de: {id: it.id}, a: c, genre: 'cible'}));
  });
  v.champ.forEach(o => {
    if (o.attaque) l.push({de: {id: o.id}, a: o.attaque.j != null ? {j: o.attaque.j} : {id: o.attaque.pw}, genre: 'attaque'});
    if (o.bloque != null) l.push({de: {id: o.id}, a: {id: o.bloque}, genre: 'bloque'});
  });
  return l;
}

/* Les ids que la pile désigne, pour allumer les cartes : celles qui
   s'activent, celles qui sont visées. */
function marquesPile(v) {
  if (v._marques) return v._marques;
  const sources = new Set(), visees = new Set();
  v.pile.forEach(it => { if (it.source != null) sources.add(it.source); (it.refs || []).forEach(c => { if (c.id != null) visees.add(c.id); }); });
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
  const o = v.champ.find(x => x.id === ref.id) || v.pile.find(x => x.id === ref.id);
  return o ? essaie(`[data-ancre-j="${o.ctrl}"]`) : null;
}

/* Une flèche courbe d'un centre à l'autre, arrêtée au bord de la cible. */
function cheminFleche(a, b) {
  const x1 = (a.l + a.r) / 2, y1 = (a.t + a.b) / 2, x2 = (b.l + b.r) / 2, y2 = (b.t + b.b) / 2;
  const dx = x2 - x1, dy = y2 - y1, d = Math.hypot(dx, dy);
  if (d < 12) return null;
  const rayon = Math.min((b.r - b.l), (b.b - b.t)) / 2 * 0.6;
  const fx = x2 - dx / d * rayon, fy = y2 - dy / d * rayon;
  const cx = (x1 + fx) / 2 - dy * 0.18, cy = (y1 + fy) / 2 + dx * 0.18;
  return `M${x1.toFixed(1)} ${y1.toFixed(1)} Q${cx.toFixed(1)} ${cy.toFixed(1)} ${fx.toFixed(1)} ${fy.toFixed(1)}`;
}

const MARQUES_FLECHES = ['cible', 'active', 'attaque', 'bloque'].map(g =>
  `<marker id="tf-${g}" class="${g}" viewBox="0 0 10 10" refX="7" refY="5" markerWidth="4.5" markerHeight="4.5" orient="auto-start-reverse"><path d="M0 0L10 5L0 10z"/></marker>`).join('');

function traceFleches() {
  const svg = document.querySelector('#table .tf');
  const v = TABLE.vue;
  if (!svg || !v) return;
  const traits = liensTable(v).map(l => {
    const a = ancreDe(l.de, v), b = ancreDe(l.a, v);
    const d = a && b && cheminFleche(a, b);
    return d ? `<path class="tf-fond" d="${d}"/><path class="${l.genre}" d="${d}" marker-end="url(#tf-${l.genre})"/>` +
      `<circle class="${l.genre}" cx="${((a.l + a.r) / 2).toFixed(1)}" cy="${((a.t + a.b) / 2).toFixed(1)}" r="3.5"/>` : '';
  }).join('');
  svg.innerHTML = `<defs>${MARQUES_FLECHES}</defs>${traits}`;
}

/* Un défilement ou un changement de taille : un seul tracé par image. */
let flechesPrevues = false;
function planifieFleches() {
  if (flechesPrevues || !TABLE.ouverte) return;
  flechesPrevues = true;
  requestAnimationFrame(() => { flechesPrevues = false; traceFleches(); });
}
