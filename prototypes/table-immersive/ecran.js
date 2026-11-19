/* =====================================================================
   ecran.js — L'écran du téléphone, commun aux cinq maquettes

   Il tient la maquette choisie, la repeint à chaque pas de la scène, fait
   voyager les cartes (mouvements.js), trace les flèches de la pile, et
   passe les événements de la scène à effets.js.

   Comme l'atelier, un seul aiguillage : un écouteur `click` délégué qui
   lit `data-act`, et un jeu d'écouteurs de pointeur pour l'appui long et
   le glisser.
   ===================================================================== */

const VARIANTES = {};
const ECRAN = {el: null, scene: null, sur: null, calque: null, svg: null, V: null, avale: 0, appui: null, glisse: null};

function monteEcran(el) {
  ECRAN.el = el;
  el.innerHTML = `<div class="ec-scene"></div><svg class="ec-fleches" aria-hidden="true"></svg>
    <div class="ec-sur"></div><div class="ec-calque" aria-hidden="true"></div><div class="ec-voile" aria-hidden="true"></div>`;
  ECRAN.scene = el.querySelector('.ec-scene');
  ECRAN.sur = el.querySelector('.ec-sur');
  ECRAN.calque = el.querySelector('.ec-calque');
  ECRAN.svg = el.querySelector('.ec-fleches');
  el.addEventListener('click', surClic);
  el.addEventListener('pointerdown', surAppui);
  window.addEventListener('pointermove', surBouge, {passive: false});
  window.addEventListener('pointerup', surLache);
  window.addEventListener('pointercancel', surLache);
  el.addEventListener('contextmenu', ev => ev.preventDefault());
  el.addEventListener('keydown', ev => {
    if ((ev.key === 'Enter' || ev.key === ' ') && ev.target.matches('[role="button"], [role="slider"]')) { ev.preventDefault(); ev.target.click(); }
  });
  Scene.ecoute(evts => { assainit(); repeins(evts); });
}

function choisisVariante(id) {
  const V = VARIANTES[id];
  if (!V) return;
  ECRAN.V = V;
  Object.assign(UI, {sel: null, vise: null, menu: null, loupe: null, repondre: false, apercu: null});
  ECRAN.el.className = 'ecran ' + V.classe;
  MVT.duree = V.niveau >= 3 ? 560 : V.niveau <= 1 ? 320 : 420;
  MVT.ease = V.niveau >= 3 ? 'cubic-bezier(.2,1.15,.35,1)' : 'cubic-bezier(.2,.8,.2,1)';
  ECRAN.calque.innerHTML = '';
  repeins([], true);
}

/* Repeindre l'écran : mesurer, peindre, rejouer les trajets, tracer,
   puis seulement les effets — à des places déjà connues. */
function repeins(evts = [], sansMouvement = false) {
  const V = ECRAN.V;
  if (!V || !Scene.E) return;
  const avant = sansMouvement ? new Map() : capture(ECRAN.scene);
  const K = contexte();
  ECRAN.scene.innerHTML = V.peins(K);
  ECRAN.sur.innerHTML = (V.sur ? V.sur(K) : '') + loupeHTML(K);
  const apres = capture(ECRAN.scene);
  traceFleches(K, apres);
  if (!sansMouvement) flip(avant, apres);
  effets(evts, avant, apres);
  if (V.apres) V.apres(K, evts);
}

/* ---------- Les flèches ---------- */

function rectCible(t, apres) {
  if (t === 'moi' || t === 'adv') {
    const el = ECRAN.scene.querySelector(`[data-joueur="${t}"] .jr-vie`);
    return el ? rel(el.getBoundingClientRect()) : null;
  }
  const n = apres && apres.get(t);
  if (n) return rel(n.r);
  const el = ECRAN.scene.querySelector(`[data-id="${t}"]`);
  return el ? rel(el.getBoundingClientRect()) : null;
}

function traceFleches(K, apres) {
  const b = ECRAN.el.getBoundingClientRect();
  ECRAN.svg.setAttribute('viewBox', `0 0 ${b.width} ${b.height}`);
  const traits = [];
  K.E.pile.forEach(id => {
    const o = Scene.obj(id);
    if (!o.cible) return;
    const a = rectCible(id, apres), c = rectCible(o.cible, apres);
    if (a && c) traits.push(cheminFleche(a, c, o.ctrl));
  });
  if (ECRAN.V.fleches) ECRAN.V.fleches(K, apres).forEach(([a, c, cls]) => { if (a && c) traits.push(cheminFleche(a, c, cls)); });
  ECRAN.svg.innerHTML = DEFS_FLECHES + `<g class="fl-groupe">${traits.join('')}</g><g class="fl-libre"></g>`;
}

/* Une flèche qui suit le doigt, pendant qu'on vise en glissant. */
function flecheLibre(depuis, x, y) {
  const g = ECRAN.svg.querySelector('.fl-libre');
  if (!g) return;
  if (!depuis) { g.innerHTML = ''; return; }
  const b = ECRAN.el.getBoundingClientRect();
  g.innerHTML = cheminFleche(depuis, {cx: x - b.left, cy: y - b.top, h: 0}, 'libre');
}

/* ---------- La loupe ---------- */

function ouvreLoupe(id) {
  const o = Scene.obj(id);
  if (!o || (o.ctrl === 'adv' && o.zone === 'main')) return;
  UI.loupe = id;
  UI.menu = null;
  son('carte');
  repeins();
}

function loupeHTML(K) {
  const o = UI.loupe && Scene.obj(UI.loupe);
  if (!o) return '';
  const c = Scene.def(o), raison = o.zone === 'main' && o.ctrl === 'moi' && !K.jou.has(o.id) ? Scene.pourquoiPas(o.id) : '';
  return `<div class="loupe-fond" data-act="fermeLoupe"></div><div class="loupe" role="dialog" aria-label="${esc(c.nom)}">
    ${carteHTML(o, {jou: new Set(), cib: new Set(), elig: new Set(), att: new Set()}, {sansId: true, act: 'fermeLoupe', classe: 'k-loupe'})}
    <div class="loupe-txt"><b>${esc(c.nom)}</b> ${c.cout ? `<span class="loupe-cout">${pips(c.cout)}</span>` : ''}
      <div class="loupe-type">${esc(c.type)}${c.f != null ? ` · ${Scene.force(o)}/${Scene.reste(o)}` : ''}</div>
      ${c.texte ? `<p>${esc(c.texte)}</p>` : ''}${c.saveur ? `<p class="loupe-saveur">${esc(c.saveur)}</p>` : ''}
      ${raison ? `<p class="loupe-raison">${esc(raison)}</p>` : ''}</div>
    <button type="button" class="btn-loupe" data-act="fermeLoupe">Fermer</button></div>`;
}

/* ---------- L'aiguillage ---------- */

const COMMUNS = {
  fermeLoupe: () => { UI.loupe = null; repeins(); },
  principal: () => faitPrincipale(),
  rejouer: () => FAIT.rejouer(),
  retiens: () => Scene.retiens(),
  annuleVise: () => FAIT.annuleVise(),
  tous: () => toutesAtt(),
  aucun: () => aucuneAtt()
};

function surClic(ev) {
  if (Date.now() - ECRAN.avale < 250) { ev.preventDefault(); return; }
  const el = ev.target.closest('[data-act]');
  if (!el || !ECRAN.el.contains(el)) return;
  const act = el.dataset.act, V = ECRAN.V;
  const h = (V.clic && V.clic[act]) || COMMUNS[act];
  if (!h) return;
  if (el.tagName === 'BUTTON') son('tic');
  h(el, ev);
}

/* L'appui long ouvre la carte en grand ; le glisser est confié à la
   maquette, qui dit ce qu'elle en fait. */
function surAppui(ev) {
  if (ev.button > 0) return;
  const k = ev.target.closest('[data-id]');
  const appui = {x: ev.clientX, y: ev.clientY, id: k && k.dataset.id, bouge: false};
  if (appui.id && Scene.obj(appui.id)) appui.t = setTimeout(() => {
    if (ECRAN.appui !== appui || appui.bouge) return;
    ECRAN.avale = Date.now() + 600;
    if (ECRAN.glisse && ECRAN.V.glisse && ECRAN.V.glisse.annule) ECRAN.V.glisse.annule(ECRAN.glisse);
    ECRAN.glisse = null;
    vibre('tic');
    ouvreLoupe(appui.id);
  }, 480);
  ECRAN.appui = appui;
  const g = ev.target.closest('[data-glisse]');
  if (!g || !ECRAN.V.glisse) return;
  const st = {el: g, type: g.dataset.glisse, id: g.dataset.id, x0: ev.clientX, y0: ev.clientY, x: ev.clientX, y: ev.clientY,
    dx: 0, dy: 0, bouge: false, pid: ev.pointerId};
  if (ECRAN.V.glisse.debut(st, ev) !== false) ECRAN.glisse = st;
}

function surBouge(ev) {
  const a = ECRAN.appui;
  if (a && Math.hypot(ev.clientX - a.x, ev.clientY - a.y) > 9) { a.bouge = true; clearTimeout(a.t); }
  const st = ECRAN.glisse;
  if (!st || ev.pointerId !== st.pid) return;
  st.x = ev.clientX;
  st.y = ev.clientY;
  st.dx = st.x - st.x0;
  st.dy = st.y - st.y0;
  if (!st.bouge && Math.hypot(st.dx, st.dy) > 9) st.bouge = true;
  if (st.bouge) { ev.preventDefault(); ECRAN.V.glisse.bouge(st, ev); }
}

function surLache(ev) {
  if (ECRAN.appui) clearTimeout(ECRAN.appui.t);
  ECRAN.appui = null;
  const st = ECRAN.glisse;
  if (!st || ev.pointerId !== st.pid) return;
  ECRAN.glisse = null;
  const G = ECRAN.V.glisse;
  /* Un simple toucher n'est pas un glisser : le clic qui suit fera son
     office, et l'écran ne doit pas être repeint sous lui. */
  if (!st.bouge) { if (G.tape) G.tape(st); return; }
  ECRAN.avale = Date.now();
  if (ev.type === 'pointercancel') { if (G.annule) G.annule(st); return repeins(); }
  G.lache(st, ev);
}

/* Ce qui est sous le doigt, la carte qu'on glisse mise à part. */
function sousLeDoigt(x, y) {
  const el = document.elementFromPoint(x, y);
  return el && ECRAN.el.contains(el) ? el : null;
}

function cibleSous(el) {
  if (!el) return null;
  const k = el.closest('[data-id]');
  if (k) return k.dataset.id;
  const j = el.closest('[data-joueur]');
  return j ? j.dataset.joueur : null;
}
