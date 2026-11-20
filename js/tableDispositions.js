/* =====================================================================
   js/tableDispositions.js — Trois façons de disposer la table

   Un téléphone n'a pas la place de montrer cinq champs de bataille. Trois
   réponses, au choix du joueur (menu de la table, `S.table.disposition`) :

   — Arène : un adversaire à la fois, en grand, cartes entières sur deux
     rangées ; on passe de l'un à l'autre d'un glissé, ou d'un toucher sur
     les onglets qui résument tous les adversaires.
   — Couloirs : tout le monde à la fois, un couloir par joueur, en vignettes
     (illustration et nom) ; chaque couloir défile seul.
   — Tour de table : les adversaires en cartouches — vie, main, menaces —,
     dépliés d'un toucher ; son propre champ en grand.

   Sur un grand écran, les adversaires de l'Arène se tiennent côte à côte.
   ===================================================================== */

const DISPOSITIONS = {
  arene: {nom: 'Arène', desc: 'Un adversaire à la fois, en grand, cartes entières. Glissez, ou touchez un onglet, pour passer à un autre.'},
  couloirs: {nom: 'Couloirs', desc: 'Tous les joueurs à la fois, un couloir chacun, illustrations et noms. Chaque couloir défile seul.'},
  tour: {nom: 'Tour de table', desc: 'Les adversaires en cartouches : vie, main, menaces. Touchez-en un pour déplier son champ.'}
};

function dispositionTable() { return DISPOSITIONS[S.table.disposition] ? S.table.disposition : 'arene'; }

/* Les adversaires, dans l'ordre où ils jouent après soi. */
function adversairesDe(v) {
  const a = [];
  for (let k = 1; k < v.joueurs.length; k++) a.push(v.joueurs[(v.moi + k) % v.joueurs.length]);
  return a;
}

/* Le champ d'un joueur sur deux rangées de cartes entières. */
function champDeuxRangs(J, v, cle) {
  const c = rangsDe(J, v);
  const devant = c.cmd.map(x => tuile(x, v)).join('') + suiteTuiles(c.front, v);
  const derriere = suiteTuiles(c.autres, v) + suiteTuiles(c.terrains, v);
  return rangee(cle + '-av', devant, 'avant') + rangee(cle + '-ar', derriere, 'arriere');
}

/* Un couloir : le cartouche, puis une seule rangée de vignettes — créatures,
   autres permanents, terrains. */
function couloir(J, v) {
  const c = rangsDe(J, v), o = {mode: 'vignette'}, sep = '<i class="co-sep"></i>';
  const corps = c.cmd.map(x => tuile(x, v, o)).join('') + suiteTuiles(c.front, v, o) +
    (c.autres.length ? sep + suiteTuiles(c.autres, v, o) : '') + (c.terrains.length ? sep + suiteTuiles(c.terrains, v, o) : '');
  return `<section class="co-couloir${v.actif === J.i ? ' actif' : ''}">${cartouche(J, v)}${rangee('co' + J.i, corps)}</section>`;
}

function areneAdversaires(v) {
  const adv = adversairesDe(v);
  const page = Math.min(TABLE.page || 0, adv.length - 1);
  const onglets = adv.length > 1 ? `<div class="ar-onglets">${adv.map((J, k) => {
    const e = etatJoueur(J.i);
    return `<button type="button" class="ar-onglet${k === page ? ' vu' : ''}${v.actif === J.i ? ' actif' : ''}${v.prio === J.i ? ' prio' : ''}${J.elimine ? ' elimine' : ''}${e ? ' ' + e : ''}"
      data-act="tPage" data-i="${k}" data-ancre-j="${J.i}"><span class="tj-vie">${J.vie}</span><span class="ar-nom">${esc(J.nom)}</span>
      <span class="tj-c"><i class="tj-dos"></i>${J.main}</span></button>`;
  }).join('')}</div>` : '';
  return onglets + `<div class="ar-pages" data-defile="ar-pages">${adv.map(J =>
    `<section class="ar-page">${cartouche(J, v)}${champDeuxRangs(J, v, 'ar' + J.i)}</section>`).join('')}</div>`;
}

/* Un adversaire replié : ses menaces en miniatures, et ce qu'une question
   désigne chez lui ; le reste en nombres. */
function cartoucheTour(J, v) {
  const c = rangsDe(J, v);
  if (TABLE.deplie === J.i) return `<section class="tt-joueur ouvert">${cartouche(J, v)}
    <button type="button" class="btn sm tt-plier" data-act="tDeplie" data-j="${J.i}">Replier ▴</button>${champDeuxRangs(J, v, 'tt' + J.i)}</section>`;
  const designes = [...c.autres, ...c.terrains].filter(o => etatChoix(o.id));
  const menaces = suiteTuiles([...c.front, ...designes], v, {mode: 'vignette', classe: 'mini'});
  const eng = c.terrains.filter(o => o.engage).length;
  return `<section class="tt-joueur${v.actif === J.i ? ' actif' : ''}">${cartouche(J, v)}
    <div class="tt-menaces">${c.cmd.map(x => tuile(x, v, {mode: 'vignette', classe: 'mini'})).join('')}${menaces || '<span class="small muted">aucune créature</span>'}</div>
    <button type="button" class="tt-resume" data-act="tDeplie" data-j="${J.i}">${c.terrains.length} terrain${c.terrains.length > 1 ? 's' : ''}${
      eng ? ` dont ${eng} engagé${eng > 1 ? 's' : ''}` : ''}${c.autres.length ? ` · ${c.autres.length} autre${c.autres.length > 1 ? 's' : ''}` : ''} <b>▾</b></button></section>`;
}

/* La région des adversaires, selon la disposition. */
function adversairesTableHTML(v) {
  const d = dispositionTable();
  if (d === 'couloirs') return adversairesDe(v).map(J => couloir(J, v)).join('');
  if (d === 'tour') return `<div class="tt-grille">${adversairesDe(v).map(J => cartoucheTour(J, v)).join('')}</div>`;
  return areneAdversaires(v);
}

/* Son propre champ. */
function moiHTML(v) {
  const J = v.joueurs[v.moi];
  if (dispositionTable() === 'couloirs') return couloir(J, v);
  return `<section class="ar-moi">${cartouche(J, v, 'moi')}${champDeuxRangs(J, v, 'moi')}</section>`;
}

/* Ce qu'est chaque élément de la pile, en toutes lettres : ce qu'on résout en ce moment, puis ce qui
   attend, du sommet — le premier à se résoudre — au fond. Les tuiles disent qui ; ceci dit quoi. */
function pileExpliqueHTML(v) {
  const qui = it => it.ctrl === v.moi ? 'à vous' : esc(v.joueurs[it.ctrl].nom);
  const ligne = (it, etiquette, classe) => `<div class="tp-item ${classe || ''}">
    <div class="tp-tete">${etiquette ? `<span class="tp-etiq">${esc(etiquette)}</span> ` : ''}<b>${esc(it.nom)}</b>
      <span class="pill">${esc(it.genreLibelle)}</span> <span class="muted small">${qui(it)}${it.kicked ? ' · kicker' : ''}${it.x ? ' · X = ' + it.x : ''}</span></div>
    ${it.texte ? `<div class="small tp-texte">${esc(it.texte)}</div>` : ''}
    ${it.permanent ? '<div class="small muted">Se résout en entrant sur le champ de bataille.</div>' : ''}
    ${it.cibles.length ? `<div class="small">Cible${it.cibles.length > 1 ? 's' : ''} : <b>${esc(it.cibles.join(', '))}</b></div>` : ''}</div>`;
  const pile = v.pile.slice().reverse();
  const sommet = v.resout ? 'Se résout maintenant' : v.resolvant ? 'Ensuite' : 'Sommet : se résout si tout le monde passe';
  return `<div class="tp-expl" aria-live="polite">
    ${v.resolvant ? `<div class="tp-bloc"><div class="tp-sous">En cours de résolution</div>${ligne(v.resolvant, '', 'courant')}</div>` : ''}
    ${pile.length ? `<div class="tp-bloc"><div class="tp-sous">Sur la pile${pile.length > 1 ? ' — du sommet au fond' : ''}</div>${pile.map((it, i) =>
      ligne(it, i === 0 ? sommet : 'En dessous', i === 0 && v.resout ? 'courant' : '')).join('')}</div>` : ''}
  </div>`;
}

/* La main, en éventail : chaque carte tourne de quelques degrés autour du
   centre — son corps tourne, pas elle, pour que sa mesure reste juste
   quand elle voyage (js/tableMouvements.js). */
function mainHTML(v) {
  const n = v.main.length, pas = Math.min(4, 22 / Math.max(n, 1));
  return `<div class="mn${n > 5 ? ' serre' : ''}"><span class="tp-titre">Main ${n}</span>${rangee('main',
    v.main.map((c, i) => { const r = i - (n - 1) / 2;
      return tuile(c, v, {style: `--rot:${(r * pas).toFixed(1)}deg;--lev:${(r * r * pas * .35).toFixed(1)}px`}); }).join('') ||
    '<span class="small muted">Main vide</span>')}</div>`;
}

/* Un onglet de l'Arène touché : la page de cet adversaire. */
function montrePage(k) {
  TABLE.page = k;
  const el = document.querySelector('#table [data-defile="ar-pages"]');
  if (el) el.scrollTo({left: k * el.clientWidth, behavior: 'smooth'});
  marqueOnglet(k);
}

function marqueOnglet(k) {
  document.querySelectorAll('#table .ar-onglet').forEach((b, i) => b.classList.toggle('vu', i === k));
}

/* L'Arène suit le joueur actif : à chaque tour d'un adversaire, sa page.
   Celle qu'on a choisie soi-même tient jusqu'au tour suivant. */
function suisActif(v) {
  const cle = v.tour + ':' + v.actif;
  if (TABLE.suivi === cle) return;
  TABLE.suivi = cle;
  const k = adversairesDe(v).findIndex(J => J.i === v.actif);
  if (k >= 0 && k !== TABLE.page) { TABLE.page = k; TABLE.allerPage = true; }
}

/* Une page à montrer : celle du joueur actif, ou celle qu'on regardait
   quand les pages viennent d'être recréées (retour d'une autre disposition). */
function appliquePage() {
  const el = document.querySelector('#table [data-defile="ar-pages"]');
  const neuve = el && el.scrollLeft === 0 && TABLE.page > 0;
  if (!TABLE.allerPage && !neuve) return;
  TABLE.allerPage = false;
  if (el) el.scrollLeft = TABLE.page * el.clientWidth;
}

/* Un défilement dans la table. Celui des pages de l'Arène tient l'onglet
   à jour sans repeindre. */
function defileTable(ev) {
  const el = ev.target;
  if (TABLE.ouverte) planifieFleches();
  if (!TABLE.ouverte || !el || !el.dataset || el.dataset.defile !== 'ar-pages' || !el.clientWidth) return;
  const k = Math.round(el.scrollLeft / el.clientWidth);
  if (k !== TABLE.page) { TABLE.page = k; marqueOnglet(k); }
}
