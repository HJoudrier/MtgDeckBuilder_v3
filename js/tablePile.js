/* =====================================================================
   js/tablePile.js — La pile en profondeur

   La pile se lisait en tuiles alignées, de la taille d'un ongle, et son
   texte dans un bloc à part qui mangeait le quart de l'écran. Elle se
   montre maintenant en tunnel, au centre de la ligne de front : l'objet de
   devant en grand, ceux du dessous qui reculent et montent derrière lui,
   leur nom dépassant. On glisse la pile vers le bas pour amener devant ce
   qui est dessous ; à côté, le texte de l'objet qu'on regarde. Seuls ses
   liens brillent (js/tableFleches.js).

   Le tunnel est un nœud qui survit aux repeints. La région du front se
   réécrit dès qu'un libellé change, mais ses cartes doivent glisser d'un
   cran à l'autre — une transition ne joue que sur un élément qui demeure —
   et un doigt posé dessus ne doit pas perdre son geste. Le front ne porte
   qu'une place vide (`.tpi-place`) ; `posePile()` y remet le tunnel après
   chaque peinture, et les trajets de js/tableMouvements.js laissent ses
   cartes à leurs propres transitions.
   ===================================================================== */

/* L'état du tunnel, propre à cet appareil et oublié en quittant la table :
   le nœud, l'objet regardé (`focus`, fractionnaire pendant un glissé), le
   premier objet de la dernière peinture et le geste en cours. */
function tunnelPile() {
  return TABLE.tunnel || (TABLE.tunnel = {el: null, focus: 0, tete: null, els: [], cartes: new Map(), glisse: null});
}

/* Ce que la pile montre, de devant au fond : l'objet qu'on résout — il
   n'est plus sur la pile, mais c'est de lui que parlent les questions —,
   puis la pile du sommet au fond. Pendant la pause qui précède une
   résolution, le sommet est déjà « en cours ». */
function elementsPile(v) {
  const l = v.pile.slice().reverse().map(it => ({it, enCours: false}));
  if (v.resout && l.length) l[0].enCours = true;
  if (v.resolvant) l.unshift({it: v.resolvant, enCours: true});
  return l;
}

/* L'objet qu'on regarde, en cran entier. */
function rangPile() {
  const T = TABLE.tunnel;
  if (!T || !T.els.length) return 0;
  return Math.round(Math.max(0, Math.min(T.els.length - 1, T.focus)));
}

/* La place d'un objet à `d` crans de celui qu'on regarde : derrière, il
   recule et monte ; devant — on l'a fait défiler —, il descend vers soi et
   s'efface. L'objet qu'on résout s'avance. `voile` assombrit ce qui est loin.
   Les cartes montent d'un quart de leur largeur `w` par cran : repliées
   (js/tableFront.js), elles ne débordent pas sur le bandeau des questions. */
function placeTunnel(d, enCours, w) {
  if (enCours && Math.abs(d) < .5) return {t: 'translate3d(-50%,-4px,34px)', o: 1, voile: 0};
  if (d >= 0) return {t: `translate3d(-50%,${(-d * w * .26).toFixed(1)}px,${(-d * 60).toFixed(1)}px)`, o: d > 3.5 ? 0 : Math.max(0, 1 - d * .2), voile: Math.min(.6, d * .18)};
  return {t: `translate3d(-50%,${(-d * w * .5).toFixed(1)}px,${(-d * 100).toFixed(1)}px)`, o: Math.max(0, 1 + d * 1.5), voile: 0};
}

function placeCartesPile(seules) {
  const T = TABLE.tunnel;
  if (!T || !T.el) return;
  const carte = T.el.querySelector('.tpi-c .tc'), largeur = (carte && carte.offsetWidth) || 80;
  T.els.forEach((e, k) => {
    const w = T.cartes.get(String(e.it.id));
    if (!w || (seules && !seules.has(w))) return;
    const d = k - T.focus, p = placeTunnel(d, e.enCours, largeur);
    w.style.transform = p.t;
    w.style.opacity = p.o.toFixed(2);
    w.style.zIndex = String(100 - Math.round(d * 10));
    w.style.pointerEvents = p.o < .3 ? 'none' : '';
    w.style.setProperty('--voile', p.voile.toFixed(2));
    w.classList.toggle('devant', Math.abs(d) < .5);
  });
}

function creeTunnel() {
  const el = document.createElement('div');
  el.className = 'tpi';
  el.innerHTML = '<div class="tpi-crans"></div><div class="tpi-scene"></div><div class="tpi-desc" aria-live="polite"></div>';
  return el;
}

/* Remettre le tunnel à sa place après une peinture, et l'accorder à la vue :
   une carte par objet, gardée d'une vue à l'autre par son identifiant. Une
   carte neuve naît à sa place ; les autres y glissent. Un nœud qu'on vient
   de réinsérer n'a plus de style calculé : on le relit avant de bouger
   quoi que ce soit, sans quoi rien ne transiterait. */
function posePile(v) {
  const T = tunnelPile(), t = document.getElementById('table'), place = t && t.querySelector('.tpi-place');
  if (!place || !v) {
    if (T.el) T.el.remove();
    T.els = []; T.tete = null;
    if (t) marqueResolution(t, null);
    return;
  }
  if (!T.el) T.el = creeTunnel();
  const revient = T.el.parentNode !== place;
  if (revient) place.appendChild(T.el);
  const els = elementsPile(v), scene = T.el.querySelector('.tpi-scene');
  const tete = els.length ? els[0].it.id : null;
  if (tete !== T.tete) { T.tete = tete; T.focus = 0; }
  T.els = els;
  T.focus = Math.max(0, Math.min(els.length - 1, T.focus));
  const vus = new Set(), neuves = new Set();
  els.forEach((e, k) => {
    const id = String(e.it.id);
    vus.add(id);
    let w = T.cartes.get(id);
    if (!w) { w = document.createElement('div'); w.className = 'tpi-c'; T.cartes.set(id, w); neuves.add(w); }
    if (w.parentNode !== scene) scene.appendChild(w);
    const html = tuile(e.it, v, {act: 'tPileCarte', i: k});
    if (w.dataset.html !== html) { w.innerHTML = html; w.dataset.html = html; }
    w.classList.toggle('en-cours', e.enCours);
  });
  for (const [id, w] of T.cartes) if (!vus.has(id)) { w.remove(); T.cartes.delete(id); }
  placeCartesPile(neuves);
  if (revient) void T.el.offsetWidth;
  placeCartesPile();
  majDescPile(v);
  marqueResolution(t, els[0] && els[0].enCours ? els[0].it : null);
  suisFleches(520);
}

/* Les crans à gauche, le texte à droite : ce que fait l'objet regardé, et
   quand il se résoudra. */
function majDescPile(v) {
  const T = TABLE.tunnel;
  if (!T || !T.el || !v) return;
  const n = T.els.length, k = rangPile(), e = T.els[k];
  const crans = n > 1 ? T.els.map((x, i) => `<button type="button" class="tpi-cran${i === k ? ' vu' : ''}" data-act="tPileCran" data-i="${i}"
    aria-label="${esc(x.it.nom)}, ${i + 1}e à se résoudre"></button>`).join('') : '';
  const zc = T.el.querySelector('.tpi-crans'), zd = T.el.querySelector('.tpi-desc'), html = e ? descPileHTML(v, e, k, n) : '';
  if (zc.dataset.html !== crans) { zc.innerHTML = crans; zc.dataset.html = crans; }
  if (zd.dataset.html !== html) { zd.innerHTML = html; zd.dataset.html = html; }
}

function descPileHTML(v, e, k, n) {
  const it = e.it, qui = it.ctrl === v.moi ? 'à vous' : esc(v.joueurs[it.ctrl].nom);
  const quand = e.enCours ? 'Se résout maintenant' : k === 0 ? 'Sommet : se résout si tout le monde passe'
    : k === 1 && v.resolvant ? 'Ensuite' : `${k + 1}e à se résoudre`;
  const geste = k > 0 ? '<button type="button" class="tpi-geste" data-act="tPileSommet">↑ Revenir devant</button>'
    : n > 1 ? '<span class="tpi-geste">Glissez la pile vers le bas : dessous</span>' : '';
  return `<div class="tpi-quand"><span>${quand}</span>${n > 1 ? `<span class="tpi-rang">${k + 1}/${n}</span>` : ''}</div>
    <div class="tpi-nom">${esc(it.nom)}</div>
    <div class="tpi-meta"><span class="pill">${esc(it.genreLibelle)}</span> ${qui}${it.kicked ? ' · kicker' : ''}${it.x ? ' · X = ' + it.x : ''}</div>
    ${it.texte ? `<div class="tpi-texte">${esc(it.texte)}</div>` : ''}
    ${it.permanent ? '<div class="tpi-note">Entre sur le champ de bataille en se résolvant.</div>' : ''}
    ${it.cibles && it.cibles.length ? `<div class="tpi-cible">→ ${esc(it.cibles.join(', '))}</div>` : ''}${geste}`;
}

/* Pendant une résolution, la table s'assombrit, sauf ce que l'objet touche :
   lui-même, sa source, ses cibles. */
function marqueResolution(t, it) {
  t.classList.toggle('en-resolution', !!it);
  t.querySelectorAll('.implique').forEach(x => x.classList.remove('implique'));
  if (!it) return;
  const ids = new Set([it.id, it.source, ...(it.refs || []).map(r => r.id)].filter(x => x != null).map(String));
  t.querySelectorAll('[data-loupe]').forEach(x => { if (ids.has(x.dataset.loupe)) x.classList.add('implique'); });
  (it.refs || []).filter(r => r.j != null).forEach(r => t.querySelectorAll(`[data-ancre-j="${r.j}"]`).forEach(x => x.classList.add('implique')));
}

/* L'objet regardé a changé : les cartes glissent, le texte suit, les liens aussi. */
function regardePile(k) {
  const T = TABLE.tunnel;
  if (!T || !T.els.length) return;
  const avant = rangPile();
  T.focus = Math.max(0, Math.min(T.els.length - 1, k));
  if (rangPile() !== avant) { sonTable('cran'); vibreTable('cran'); }
  placeCartesPile();
  majDescPile(TABLE.vue);
  suisFleches(520);
}

/* Une carte du tunnel touchée : celle de derrière vient devant ; celle de
   devant se touche comme toute carte de la table — la choisir pour cible,
   ou l'ouvrir en grand. */
function touchePile(k, id) {
  if (k !== rangPile()) return regardePile(k);
  clicCarte(id);
}

/* ---------- Glisser la pile ---------- */

function pileDebut(ev) {
  const T = TABLE.tunnel;
  if (!TABLE.ouverte || !T || T.els.length < 2 || (ev.pointerType === 'mouse' && ev.button !== 0)) return;
  if (!(ev.target.closest && ev.target.closest('#table .tpi-scene'))) return;
  T.glisse = {y: ev.clientY, f: T.focus, pid: ev.pointerId, actif: false, cran: rangPile()};
}

/* Le doigt descend : ce qui était derrière s'avance, d'un cran tous les
   quarante-six pixels, et la carte suit le doigt entre deux crans. */
function pileBouge(ev) {
  const T = TABLE.tunnel, g = T && T.glisse;
  if (!g || ev.pointerId !== g.pid) return;
  const dy = ev.clientY - g.y;
  if (!g.actif) {
    if (Math.abs(dy) < 8) return;
    g.actif = true;
    appuiAnnule();
    T.el.classList.add('glisse');
  }
  T.focus = Math.max(-.4, Math.min(T.els.length - .6, g.f + dy / 46));
  placeCartesPile();
  const k = rangPile();
  if (k !== g.cran) { g.cran = k; sonTable('cran'); vibreTable('cran'); majDescPile(TABLE.vue); }
  planifieFleches();
}

/* Le doigt se lève : la pile se cale sur le cran le plus proche, et le clic
   qui suit est avalé. */
function pileFin(ev) {
  const T = TABLE.tunnel, g = T && T.glisse;
  if (!g || ev.pointerId !== g.pid) return;
  T.glisse = null;
  if (!g.actif) return;
  APPUI.ouvert = Date.now();
  T.el.classList.remove('glisse');
  regardePile(Math.round(T.focus));
}
