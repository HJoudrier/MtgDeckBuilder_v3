/* =====================================================================
   js/tableMouvements.js — Les cartes voyagent

   La table se repeint par régions (js/tableRendu.js). On mesure chaque
   carte avant le repeint, on la remesure après, et on la fait partir de
   son ancienne place : une carte glisse de la main à la pile, de la pile
   au champ, d'une rangée à l'autre, sans qu'aucune région n'écrive
   d'animation. Une carte (`.tc`) ne porte donc jamais de `transform` en
   propre : l'éventail et l'engagement tournent son corps.

   Le moteur donne un identifiant neuf à chaque changement de zone : la
   carte qui quitte la main et celle qui arrive sur la pile n'ont pas le
   même. On les apparie par leur nom, dans un même repeint — deux
   « Forest » qui partent et deux qui arrivent s'apparient dans l'ordre. Ce
   qui arrive sans prédécesseur (la main d'un adversaire est cachée) part
   du cartouche de son joueur ; ce qui s'en va rejoint le cimetière ou
   l'exil où la vue le retrouve, ou s'efface sur place.
   ===================================================================== */

const MOUV = {duree: 380, ease: 'cubic-bezier(.2,.8,.2,1)'};

function mouvementsActifs() {
  return S.table.mouvements !== false && !(window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches);
}

/* Les cartes de la partie, hors des fenêtres et du bandeau qui en montrent
   des copies (loupe, zone dépliée, choix d'une question). */
function tuilesTable(el) {
  return [...el.querySelectorAll('[data-region="adv"] .tc[data-id], [data-region="front"] .tc[data-id], [data-region="moi"] .tc[data-id], [data-region="main"] .tc[data-id]')];
}

function mesureTuile(t) {
  const corps = t.querySelector('.tc-corps');
  return {el: t, r: t.getBoundingClientRect(), nom: t.getAttribute('aria-label'), ctrl: t.dataset.ctrl, eng: t.classList.contains('engage'),
    ct: corps ? getComputedStyle(corps).transform : 'none', w: getComputedStyle(t).getPropertyValue('--w')};
}

function releveTuiles(el) {
  const m = new Map();
  if (!mouvementsActifs() || !el.classList.contains('en-partie')) return m;
  tuilesTable(el).forEach(t => { const x = mesureTuile(t); if (x.r.width) m.set(t.dataset.id, x); });
  return m;
}

/* Rejouer le chemin de chaque carte. `prec` et `v` sont la vue d'avant et
   celle d'après : elles disent où est allée une carte qui a quitté la table.
   Une créature qu'un coup va achever (`coups.retenus`, js/tableCoups.js)
   reste à sa place sur le calque : le coup la tranchera. */
function rejoueTrajets(el, avant, prec, v, coups) {
  if (!avant.size || !mouvementsActifs()) return;
  const apres = new Map();
  tuilesTable(el).forEach(t => { const x = mesureTuile(t); if (x.r.width) apres.set(t.dataset.id, x); });
  const partis = [...avant].filter(([id]) => !apres.has(id)).map(([, a]) => a);
  for (const [id, n] of apres) {
    let a = avant.get(id);
    /* Une carte du tunnel qui était déjà là glisse d'elle-même (js/tablePile.js). */
    if (a && n.el.closest('.tpi')) continue;
    if (!a) {
      a = partis.find(p => !p.pris && p.nom === n.nom);
      if (a) a.pris = true;
    }
    if (a) vole(n, a);
    else arrive(n, el);
  }
  partis.filter(p => !p.pris).forEach(p => {
    const id = p.el.dataset.id;
    if (coups && coups.retenus.has(id)) { const g = poseAuCalque(p, el); if (g) coups.noeuds.set(id, {el: g, p, table: el, prec, v}); }
    else sEnVa(p, el, prec, v);
  });
}

/* D'une place à l'autre. Une carte qui s'engage ou se dégage tourne en
   même temps qu'elle glisse. */
function vole(n, a) {
  const meme = a.eng === n.eng;
  const dx = meme ? a.r.left - n.r.left : (a.r.left + a.r.width / 2) - (n.r.left + n.r.width / 2);
  const dy = meme ? a.r.top - n.r.top : (a.r.top + a.r.height / 2) - (n.r.top + n.r.height / 2);
  const s = meme ? a.r.width / n.r.width : 1;
  if (Math.abs(dx) > .5 || Math.abs(dy) > .5 || Math.abs(s - 1) > .01)
    n.el.animate([{transform: `translate(${dx}px,${dy}px) scale(${s})`, transformOrigin: '0 0'}, {transform: 'none', transformOrigin: '0 0'}],
      {duration: MOUV.duree, easing: MOUV.ease});
  const corps = !meme && n.el.querySelector('.tc-corps');
  if (corps) corps.animate([{transform: a.ct}, {transform: n.ct}], {duration: MOUV.duree * .8, easing: MOUV.ease});
}

/* Une carte venue de nulle part : du cartouche de son joueur, s'il est
   visible ; sinon elle se pose sur place. */
function arrive(n, el) {
  const ancre = n.ctrl != null && [...el.querySelectorAll(`[data-ancre-j="${n.ctrl}"]`)].find(x => x.getBoundingClientRect().width);
  if (ancre) {
    const r = ancre.getBoundingClientRect();
    const dx = (r.left + r.width / 2) - (n.r.left + n.r.width / 2), dy = (r.top + r.height / 2) - (n.r.top + n.r.height / 2);
    n.el.animate([{transform: `translate(${dx}px,${dy}px) scale(.3)`, opacity: .3}, {transform: 'none', opacity: 1}],
      {duration: MOUV.duree * 1.2, easing: MOUV.ease});
  } else n.el.animate([{opacity: 0, transform: 'scale(.85)'}, {opacity: 1, transform: 'none'}], {duration: MOUV.duree * .7, easing: MOUV.ease});
}

/* Le joueur dont le cimetière (ou l'exil) a gagné une carte de ce nom. */
function zoneArrivee(nom, prec, v) {
  if (!prec || !v || prec.joueurs.length !== v.joueurs.length) return null;
  const compte = (l, n) => l.filter(c => c.nom === n).length;
  for (const z of ['cim', 'exil'])
    for (const J of v.joueurs) if (compte(J[z], nom) > compte(prec.joueurs[J.i][z], nom)) return {j: J.i, z};
  return null;
}

/* Une carte qui quitte la table : son ancien nœud, posé sur le calque,
   rejoint le compteur de sa zone d'arrivée, ou s'efface. */
function sEnVa(p, el, prec, v) {
  const g = poseAuCalque(p, el);
  if (g) rejointZone(g, p, el, prec, v);
}

/* L'ancien nœud d'une carte, posé sur le calque à sa dernière place. */
function poseAuCalque(p, el) {
  const calque = el.querySelector('.tmv');
  if (!calque) return null;
  const g = p.el;
  g.removeAttribute('data-id');
  g.classList.remove('leve', 'glisse', 'en-coup');
  Object.assign(g.style, {position: 'fixed', left: p.r.left + 'px', top: p.r.top + 'px', margin: '0', transform: '', visibility: ''});
  if (p.w) g.style.setProperty('--w', p.w);
  calque.appendChild(g);
  return g;
}

/* Le nœud posé sur le calque rejoint le compteur de sa zone, ou s'efface. */
function rejointZone(g, p, el, prec, v) {
  const dest = zoneArrivee(p.nom, prec, v);
  const cible = dest && [...el.querySelectorAll(`[data-act="tZone"][data-j="${dest.j}"][data-z="${dest.z}"]`)].find(x => x.getBoundingClientRect().width);
  let kf = [{opacity: 1}, {opacity: 0, transform: 'scale(.85)'}];
  if (cible) {
    const r = cible.getBoundingClientRect();
    kf = [{transform: 'none', opacity: 1}, {transform: `translate(${r.left + r.width / 2 - p.r.left - p.r.width / 2}px,${r.top + r.height / 2 - p.r.top - p.r.height / 2}px) scale(.25)`, opacity: .2}];
  }
  g.animate(kf, {duration: MOUV.duree * 1.3, easing: MOUV.ease}).onfinish = () => g.remove();
}
