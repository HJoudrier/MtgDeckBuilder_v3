/* =====================================================================
   js/tableCoups.js — Les coups qui portent

   Quand les blessures de combat tombent, chaque attaquant prend son élan
   et frappe ce qu'il attaque ou ce qui le bloque, et le bloqueur riposte.
   Quand un sort se résout sur sa cible, une lueur part de la pile et la
   rejoint. La cible s'éclaire, tremble, prend une entaille ; un joueur
   touché voit son cartouche trembler, et si c'est soi, toute la table
   tremble et ses bords rougissent.

   Rien de cela ne vient du moteur : comme les sons (js/tableRessenti.js),
   tout se lit dans la différence entre la vue peinte et la nouvelle — qui
   attaquait qui, qui bloquait qui, qui a pris des blessures, qui a quitté
   le champ, qui a perdu des points de vie. L'invité voit donc les mêmes
   coups que l'hôte. La nouvelle vue est déjà peinte quand les coups
   partent : les points de vie qui baissent gardent leur valeur d'avant
   jusqu'au choc, et une créature qui meurt reste à sa place, sur le
   calque, jusqu'à ce que le coup l'achève (js/tableMouvements.js la
   retient au lieu de l'envoyer au cimetière).
   ===================================================================== */

const estCombattant = o => o.types && (o.types.includes('creature') || o.types.includes('planeswalker'));

/* La façon de frapper d'une créature : en vol, elle plonge ; avec
   l'initiative, elle frappe d'estoc ; de force 5 ou plus, elle charge ;
   sinon elle taille. */
function styleCoup(o) {
  const m = o.mots || 0;
  if (m & MOT.VOL) return 'plongeon';
  if (m & (MOT.INITIATIVE | MOT.DOUBLE)) return 'estoc';
  return o.f >= 5 ? 'charge' : 'taille';
}

/* Ce que chaque créature ou planeswalker a pris d'une vue à l'autre : des
   blessures, de la loyauté, ou le champ quitté. */
function prisEntre(av, ap) {
  const apres = new Map(ap.champ.map(o => [o.id, o])), pris = new Map();
  av.champ.filter(estCombattant).forEach(o => {
    const n = apres.get(o.id);
    if (!n) { pris.set(o.id, {n: 0, mort: true}); return; }
    const bless = (n.bless || 0) - (o.bless || 0), loy = ((o.marq || {}).loyaute || 0) - ((n.marq || {}).loyaute || 0);
    if (bless > 0 || loy > 0) pris.set(o.id, {n: Math.max(bless, loy), mort: false});
  });
  return pris;
}

/* Les coups à jouer entre deux vues, ou rien. Un échange : un attaquant
   qui frappe un joueur, un planeswalker ou un bloqueur — qui riposte s'il
   a blessé l'attaquant. Un sort : un objet qui a quitté la pile, vers une
   cible qui a pris quelque chose. Les ids des créatures qui meurent sous
   un coup sont `retenus`, ceux qui survivent blessés `touches`. */
function planCoups(av, ap) {
  if (!av || !ap || av === ap || av.moi !== ap.moi || av.joueurs.length !== ap.joueurs.length || !mouvementsActifs()) return null;
  const pris = prisEntre(av, ap), vies = ap.joueurs.map((J, i) => av.joueurs[i].vie - J.vie);
  const c = {echanges: [], sorts: [], joueurs: new Set(), retenus: new Set(), touches: new Set(), vies: av.joueurs.map(J => J.vie), noeuds: new Map(), badges: new Map()};
  const subit = id => { const p = pris.get(id); if (p) c[p.mort ? 'retenus' : 'touches'].add(String(id)); return p; };
  if (blessuresTombees(av, ap)) {
    /* Qui attaque qui, qui bloque qui : la vue d'avant le dit, et celle
       d'après pour les survivants, si la déclaration n'a pas été peinte. */
    const ensuite = new Map(ap.champ.map(o => [o.id, o])), de = (o, k) => o[k] != null ? o[k] : (ensuite.get(o.id) || {})[k];
    const reste = vies.slice(), dernier = {};
    av.champ.filter(o => de(o, 'attaque')).map(o => ({...o, attaque: de(o, 'attaque')})).forEach(a => {
      const bloqueurs = av.champ.filter(b => de(b, 'bloque') === a.id);
      bloqueurs.forEach((b, k) => {
        const pb = subit(b.id), pa = k ? null : subit(a.id);
        if (pb || pa) c.echanges.push({a: a.id, b: b.id, style: styleCoup(a), frappe: !!pb, riposte: !!pa, nB: pb ? pb.n : 0, nA: pa ? pa.n : 0, mortB: !!(pb && pb.mort), mortA: !!(pa && pa.mort)});
      });
      if (bloqueurs.length) return;
      const j = a.attaque.j;
      if (j != null && reste[j] > 0 && a.f > 0) {
        const e = {a: a.id, j, style: styleCoup(a), frappe: true, nJ: Math.min(a.f, reste[j])};
        reste[j] -= e.nJ;
        c.echanges.push(e); c.joueurs.add(j); dernier[j] = e;
      } else if (a.attaque.pw != null) {
        const p = subit(a.attaque.pw);
        if (p) c.echanges.push({a: a.id, b: a.attaque.pw, style: styleCoup(a), frappe: true, nB: p.n, mortB: p.mort});
      }
    });
    Object.keys(dernier).forEach(j => { dernier[j].nJ += Math.max(0, reste[j]); });
  }
  const restent = new Set(elementsPile(ap).map(e => e.it.id));
  elementsPile(av).map(e => e.it).filter(it => !restent.has(it.id)).forEach(it => (it.refs || []).forEach(r => {
    if (r.j != null) {
      if (vies[r.j] > 0 && !c.joueurs.has(r.j)) { c.sorts.push({de: it.id, j: r.j, n: vies[r.j]}); c.joueurs.add(r.j); }
    } else if (!c.retenus.has(String(r.id)) && !c.touches.has(String(r.id))) {
      const p = subit(r.id);
      if (p) c.sorts.push({de: it.id, id: r.id, n: p.n, mort: p.mort});
    }
  }));
  return c.echanges.length || c.sorts.length ? c : null;
}

/* La carte d'un permanent sur la table, ou celle qu'on retient sur le calque. */
function carteCoup(id, c) {
  if (c.noeuds.has(String(id))) return c.noeuds.get(String(id)).el;
  const el = document.querySelector(`#table :is([data-region="adv"],[data-region="moi"]) .tc[data-id="${id}"]`);
  return el && rectVisible(el) ? el : null;
}

function ancreJoueurCoup(j) {
  return [...document.querySelectorAll(`#table [data-ancre-j="${j}"]`)].find(el => !el.closest('[data-region="question"],[data-region="couche"]') && rectVisible(el)) || null;
}

/* Jusqu'au choc, la vie d'un joueur touché et la force d'une créature
   blessée gardent leur valeur d'avant. */
function figeAvantCoups(c, avant) {
  c.joueurs.forEach(j => document.querySelectorAll(`#table [data-ancre-j="${j}"] .tj-vie`).forEach(x => { x.textContent = c.vies[j]; }));
  c.touches.forEach(id => {
    const ancien = avant.get(id), b = document.querySelector(`#table .tc[data-id="${id}"] .tc-pt`), vieux = ancien && ancien.el.querySelector('.tc-pt');
    if (!b || !vieux) return;
    c.badges.set(id, b.cloneNode(true));
    b.replaceWith(vieux.cloneNode(true));
  });
}

function degeleVie(j) {
  const v = TABLE.vue;
  if (v && v.joueurs[j]) document.querySelectorAll(`#table [data-ancre-j="${j}"] .tj-vie`).forEach(x => { x.textContent = v.joueurs[j].vie; });
}

function degeleBadge(id, c) {
  const neuf = c.badges.get(String(id)), b = document.querySelector(`#table .tc[data-id="${id}"] .tc-pt`);
  if (neuf && b) b.replaceWith(neuf);
  c.badges.delete(String(id));
}

/* Le choc : sur une carte, l'éclair, le tremblement, l'entaille, les
   étincelles, le nombre ; sur un joueur, son cartouche qui tremble et ses
   points de vie qui jaillissent — et toute la table si c'est soi. */
function choc(cible, ref, n, style, axe, c) {
  const vu = visibleCoup(cible), r = vu.getBoundingClientRect(), lourd = style === 'charge';
  const pt = {x: r.left + r.width / 2 - axe.ux * Math.min(r.width, r.height) * .3, y: r.top + r.height / 2 - axe.uy * Math.min(r.width, r.height) * .3};
  const theta = style === 'taille' ? -.55 * axe.s : Math.atan2(axe.uy, axe.ux);
  eclaire(vu);
  secoue(ref.j != null ? vu : vu.querySelector('.tc-corps'), lourd ? 10 : 6, lourd ? 480 : 340);
  if (style === 'taille') entaille(r, theta);
  else if (style !== 'sort' && !lourd) entaille({left: pt.x - 14, top: pt.y - 14, width: 28, height: 28}, Math.atan2(axe.uy, axe.ux));
  if (lourd || style === 'sort') onde(r, lourd);
  etincelles(pt, lourd ? 16 : 10, Math.atan2(-axe.uy, -axe.ux));
  if (lourd) { sonTable('lourd'); vibreTable('charge'); ebranle(true); }
  else if (style === 'sort') { sonTable('impact', .5 + n / 4); vibreTable('estoc'); }
  else { sonTable('tranche', Math.min(1.3, .6 + n / 5)); sonTable('impact', .5 + n / 4); vibreTable(style === 'taille' ? 'taille' : 'estoc'); }
  if (ref.j != null) {
    degeleVie(ref.j);
    jaillitVie(ref.j, -n);
    if (ref.j === TABLE.vue.moi) { if (!lourd) ebranle(n >= 3); sonTable('blesse'); vibreTable('blesse'); }
  } else {
    degeleBadge(ref.id, c);
    if (n) nombreCoup(r, n);
  }
  return theta;
}

/* Une créature que le coup achève, puis rendue à son cimetière. */
function acheve(id, style, theta, c) {
  const x = c.noeuds.get(String(id));
  if (!x) return;
  c.noeuds.delete(String(id));
  if (style === 'sort') return rejointZone(x.el, x.p, x.table, x.prec, x.v);
  (style === 'charge' ? ecrase : tranche)(x.el, theta);
}

/* Un échange : l'attaquant frappe, le bloqueur riposte un instant après,
   et les morts ne tombent qu'une fois les deux coups portés — les
   blessures de combat sont simultanées. */
async function joueEchange(e, c) {
  const att = carteCoup(e.a, c), cible = e.j != null ? ancreJoueurCoup(e.j) : carteCoup(e.b, c);
  const ref = e.j != null ? {j: e.j} : {id: e.b};
  let thetaB = -.5, thetaA = -.5;
  if (!att || !cible) {
    if (cible && e.frappe) thetaB = choc(cible, ref, e.j != null ? e.nJ : e.nB, e.style, {ux: 0, uy: 1, s: 1}, c);
    if (e.j != null && !cible) degeleVie(e.j);
  } else {
    const coups = [];
    if (e.frappe) coups.push(elan(att, cible, e.style, axe => { thetaB = choc(cible, ref, e.j != null ? e.nJ : e.nB, e.style, axe, c); }));
    if (e.riposte) {
      const S = STYLES_COUPS[e.style];
      coups.push(attendre(e.frappe ? S.duree * S.contact + 140 : 0).then(() => {
        const b = carteCoup(e.b, c), a = carteCoup(e.a, c);
        return b && a && elan(b, a, 'estoc', axe => { thetaA = choc(a, {id: e.a}, e.nA, 'estoc', axe, c); }, .55);
      }));
    }
    await Promise.all(coups);
  }
  if (e.mortB) acheve(e.b, e.style, thetaB, c);
  if (e.mortA) acheve(e.a, 'estoc', thetaA, c);
}

/* Un sort : une lueur de la couleur de la carte part de sa place dans le
   tunnel et suit la courbe de son lien jusqu'à la cible. */
async function joueSort(s, c, avant) {
  const de = avant.get(String(s.de)), cible = s.j != null ? ancreJoueurCoup(s.j) : carteCoup(s.id, c);
  if (!cible) { if (s.j != null) degeleVie(s.j); return; }
  if (de) {
    const coul = `var(--${(de.el.dataset.teinte || 'C').replace('terre', 'C').replace('or', 'brass')})`;
    sonTable('zap');
    await lueur(de.r, cible.getBoundingClientRect(), coul);
  }
  const theta = choc(cible, s.j != null ? {j: s.j} : {id: s.id}, s.n, 'sort', {ux: 0, uy: -1, s: 1}, c);
  if (s.mort) setTimeout(() => acheve(s.id, 'sort', theta, c), 160);
}

/* La lueur d'un sort : trois boules, la première vive, le long d'une courbe. */
function lueur(a, b, coul) {
  return new Promise(fin => {
    const ca = centre(a), cb = centre(b), calque = calqueCoups(), k = .18;
    const cx = (ca.x + cb.x) / 2 - (cb.y - ca.y) * k, cy = (ca.y + cb.y) / 2 + (cb.x - ca.x) * k;
    const pts = Array.from({length: 17}, (_, i) => { const t = i / 16, u = 1 - t; return [u * u * ca.x + 2 * u * t * cx + t * t * cb.x, u * u * ca.y + 2 * u * t * cy + t * t * cb.y, .6 + .6 * t]; });
    [0, 1, 2].forEach(i => {
      const o = document.createElement('i'), tl = 18 * (1 - i * .25);
      o.className = 'tmv-lueur';
      Object.assign(o.style, {width: tl + 'px', height: tl + 'px', opacity: 1 - i * .3});
      o.style.setProperty('--c', coul);
      calque.appendChild(o);
      o.animate(pts.map(([x, y, sc]) => ({transform: `translate(${x - tl / 2}px,${y - tl / 2}px) scale(${sc})`})),
        {duration: 420, delay: i * 28, easing: 'cubic-bezier(.5,0,.9,.6)'}).onfinish = () => { o.remove(); if (!i) fin(); };
    });
  });
}

/* Jouer les coups d'une nouvelle vue, juste après sa peinture. Les
   échanges partent à un quart de seconde d'écart, pour qu'on les suive.
   Ce qu'un coup n'a pas pu atteindre — une carte sur une autre page de
   l'Arène — est rendu à la fin : la vie, la force, le cimetière. */
function joueCoups(c, avant) {
  if (!c) return;
  figeAvantCoups(c, avant);
  const coups = c.echanges.map((e, i) => attendre(i * 260).then(() => joueEchange(e, c)))
    .concat(c.sorts.map((s, i) => attendre(i * 140).then(() => joueSort(s, c, avant))));
  Promise.all(coups).catch(() => {}).finally(() => attendre(400).then(() => {
    c.joueurs.forEach(degeleVie);
    [...c.badges.keys()].forEach(id => degeleBadge(id, c));
    [...c.noeuds.keys()].forEach(id => acheve(id, 'sort', 0, c));
  }));
}

/* Après un repeint en plein coup : l'original d'une carte qui frappe reste caché. */
function recacheCoups(el) {
  EN_VOL.forEach((d, id) => el.querySelectorAll(`[data-region] .tc[data-id="${id}"]`).forEach(x => x.classList.add('en-coup')));
}

/* Le temps que l'hôte laisse aux coups de `n` attaquants avant d'avancer
   (js/tableHote.js) : les blessures de combat ne doivent pas être
   repeintes en plein élan. */
const pauseCoups = n => n ? 900 + 260 * Math.min(n, 6) : 0;

/* Les blessures de combat sont-elles tombées entre ces deux vues ? Oui
   après la vue qui les montrait à venir (`combatVu`, la question « voir »
   du combat), ou quand on passe d'une étape d'avant les blessures à une
   étape d'après — une partie rangée sans cette question. */
const ETAPES_AVANT_BLESSURES = ['debutCombat', 'attaquants', 'bloqueurs'];
function blessuresTombees(av, ap) {
  if (av.combatVu) return !ap.combatVu || ap.etape !== av.etape;
  return ETAPES_AVANT_BLESSURES.includes(av.etape) && ap.etape !== av.etape && !ETAPES_AVANT_BLESSURES.includes(ap.etape);
}
