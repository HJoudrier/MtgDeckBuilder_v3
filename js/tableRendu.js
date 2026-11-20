/* =====================================================================
   js/tableRendu.js — La table, peinte depuis une vue

   La même peinture sert l'hôte et l'invité : elle ne lit qu'une vue
   (js/jeuVue.js) et une question, jamais l'état de la partie. De haut en
   bas : l'étape, les adversaires (disposés selon js/tableDispositions.js),
   la ligne de front — la pile et le bouton de tour (js/tableFront.js) —,
   son propre champ, sa main, et les questions qui ne tiennent pas dans un
   bouton. Pensé d'abord pour un téléphone tenu en portrait.

   Exception assumée à « `renderAll()` est l'unique porte du repeint » : la
   table se repeint à chaque message de la partie, des dizaines de fois par
   minute. Elle ne réécrit donc que les régions qui ont changé : un bouton
   qu'on touche pendant qu'un adversaire joue n'est pas remplacé sous le
   doigt — le clic se perdrait —, et une rangée qu'on a fait défiler garde
   sa place.
   ===================================================================== */

/* Ce qui a été peint : la charpente, et le HTML de chaque région. */
const REPEINT = {charpente: '', html: {}};

/* La charpente de la partie : des régions vides, et les boutons qui ne
   changent jamais. */
function charpentePartie() {
  return `<div class="tr-haut"><div class="tr" data-region="etape"></div>
      <button type="button" class="tr-btn" data-act="tJournal">Journal</button>
      <button type="button" class="tr-btn" data-act="tMenu" aria-label="Menu de la table">☰</button></div>
    <div class="tr" data-region="fil"></div>
    <div class="tr" data-region="alertes"></div>
    <div class="tr-plateau" data-defile="plateau"><div class="tr" data-region="adv"></div></div>
    <div class="tr" data-region="front"></div>
    <div class="tr" data-region="moi"></div>
    <div class="tr" data-region="main"></div>
    <div class="tr" data-region="question"></div>
    <div class="tr" data-region="fin"></div>
    <svg class="tf" aria-hidden="true"></svg>
    <div class="tmv" aria-hidden="true"></div>
    <div class="tr" data-region="couche"></div>`;
}

/* La position de chaque rangée qui défile, avant un repeint. */
function releveDefile(el) {
  const m = new Map();
  el.querySelectorAll('[data-defile]').forEach(x => m.set(x.dataset.defile, [x.scrollLeft, x.scrollTop]));
  return m;
}

function restaureDefile(el, m) {
  el.querySelectorAll('[data-defile]').forEach(x => {
    const p = m.get(x.dataset.defile);
    if (p) { x.scrollLeft = p[0]; x.scrollTop = p[1]; }
  });
}

/* Peindre les régions qui ont changé, et elles seules. */
function peinsRegions(el, regions, charpente) {
  const neuve = REPEINT.charpente !== charpente;
  if (neuve) {
    el.innerHTML = charpente;
    REPEINT.charpente = charpente;
    REPEINT.html = {};
  }
  for (const [k, h] of Object.entries(regions)) {
    if (REPEINT.html[k] === h) continue;
    const z = el.querySelector(`[data-region="${k}"]`);
    if (!z) continue;
    const defile = releveDefile(z);
    z.innerHTML = h;
    z.hidden = !h;
    restaureDefile(z, defile);
    REPEINT.html[k] = h;
  }
  return neuve;
}

/* Les dernières lignes du journal, qui disent ce que les autres ont fait. */
function journalTableLignes() { return TABLE.role === 'hote' ? journalTable() : (TABLE.journal || []); }

function filHTML() {
  const l = journalTableLignes().filter(x => !/^— Tour/.test(x.txt)).slice(-1)[0];
  return l ? `<button type="button" class="tr-fil" data-act="tJournal">${esc(l.txt)}</button>` : '';
}

/* Le menu de la table : la disposition, les arrêts, quitter. */
function menuHTML() {
  if (!TABLE.menu) return '';
  const d = dispositionTable();
  if (TABLE.menu === 'quitter') return `<div class="tl-voile" data-act="tFermeMenu"></div>
    <div class="tm" role="dialog"><b>Quitter la partie ?</b>
      <div class="small muted">${TABLE.role === 'hote' ? 'Elle ne pourra pas être reprise.' : 'L\'hôte pourra confier votre siège à l\'automate.'}</div>
      <div class="row"><button type="button" class="btn" data-act="tFermeMenu">Continuer</button>
        <button type="button" class="btn pri" data-act="tQuitter">Quitter</button></div></div>`;
  return `<div class="tl-voile" data-act="tFermeMenu"></div>
    <div class="tm" role="dialog"><div class="row"><b>Disposition</b>
      <button type="button" class="btn sm" data-act="tFermeMenu" style="margin-left:auto">✕</button></div>
      ${Object.entries(DISPOSITIONS).map(([k, x]) => `<button type="button" class="tm-disp" data-act="tDisposition" data-d="${k}" aria-pressed="${k === d}">
        <b>${esc(x.nom)}</b><span class="small muted">${esc(x.desc)}</span></button>`).join('')}
      <div class="row"><b>Vitesse des adversaires</b></div>
      <div class="row tm-vitesse">${Object.entries(VITESSES).map(([k, x]) => `<button type="button" class="btn sm" data-act="tVitesse" data-d="${k}"
        aria-pressed="${k === (VITESSES[S.table.vitesse] ? S.table.vitesse : 'normale')}">${esc(x.nom)}</button>`).join('')}</div>
      <div class="row"><b>Paiement du mana</b></div>
      <div class="row tm-vitesse">${[[false, 'Automatique'], [true, 'À la main']].map(([k, nom]) => `<button type="button" class="btn sm" data-act="tMana" data-d="${k ? 1 : 0}"
        aria-pressed="${k === manuelMoi()}">${nom}</button>`).join('')}</div>
      <div class="small muted">À la main : on engage ses terrains soi-même, puis on lance ; le solveur ne paie plus.</div>
      <div class="row"><b>Effets</b></div>
      <div class="row tm-vitesse">${EFFETS_TABLE.map(([k, nom]) => `<button type="button" class="btn sm" data-act="tEffet" data-d="${k}"
        aria-pressed="${!!S.table[k]}">${nom}</button>`).join('')}</div>
      <div class="row"><button type="button" class="btn" data-act="tArrets">Arrêts</button>
        <button type="button" class="btn" data-act="tPasserTour">Passer jusqu'à mon tour</button>
        <button type="button" class="btn" data-act="tQuitterDemande">Quitter la table</button></div></div>`;
}

function finHTML(v) {
  if (!v || !v.fin) return '';
  const f = v.fin;
  const txt = f.nulle ? `Partie nulle (${f.raison})` : f.gagnant === v.moi ? 'Vous avez gagné !' : `${v.joueurs[f.gagnant].nom} gagne.`;
  return `<div class="tb-fin"><b>${esc(txt)}</b> <button type="button" class="btn sm" data-act="tJournal">Journal</button>
    <button type="button" class="btn sm pri" data-act="tQuitter">Quitter la table</button></div>`;
}

function regionsPartie(v) {
  const question = questionHTML(TABLE.question, v);
  return {etape: etapeHTML(v), fil: filHTML(),
    alertes: (typeof alertesInvitesHTML === 'function' ? alertesInvitesHTML() : '') + (TABLE.liaisonPerdue ? perteHoteHTML() : ''),
    adv: adversairesTableHTML(v), front: frontHTML(v), moi: moiHTML(v), main: mainHTML(v),
    question: question ? `<div class="tq a-vous">${question}</div>` : '',
    fin: finHTML(v), couche: loupeHTML(v) || zoneHTML(v) || menuHTML()};
}

/* Peindre la table, si elle est ouverte. */
function renduTable() {
  const el = document.getElementById('table');
  if (!el) return;
  el.hidden = !TABLE.ouverte;
  document.body.classList.toggle('table-ouverte', TABLE.ouverte);
  const pleine = html => { el.className = 'table'; el.innerHTML = html; REPEINT.charpente = ''; TABLE.vuePeinte = null; };
  if (!TABLE.ouverte) return pleine('');
  if (TABLE.phase === 'salon') return pleine(salonHTML());
  if (TABLE.phase === 'rejoindre' && typeof rejoindreHTML === 'function') return pleine(rejoindreHTML());
  const v = TABLE.vue;
  if (!v) return pleine('<div class="tb-attente">Préparation de la partie…</div>');
  el.className = 'table en-partie disp-' + dispositionTable() + (v.joueurs.length > 2 ? ' multi' : '');
  suisActif(v);
  /* Les cartes sont mesurées avant le repeint, pour voyager après ; les
     flèches se tracent avant le départ, aux places d'arrivée. */
  const avant = releveTuiles(el), prec = TABLE.vuePeinte;
  const neuve = peinsRegions(el, regionsPartie(v), charpentePartie());
  appliquePage();
  traceFleches();
  if (!neuve) rejoueTrajets(el, avant, prec, v);
  ressens(prec, v);
  TABLE.vuePeinte = v;
}
