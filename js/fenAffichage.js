/* =====================================================================
   js/fenAffichage.js — Fenêtre « Affichage » d'une liste de cartes

   Vue, nombre de colonnes, groupement et tri : les réglages de mise en page
   tenaient dans la barre de chaque section, en quatre ou cinq contrôles posés
   entre les boutons d'action. Les barres débordaient, et chaque geste
   repeignait aussitôt des centaines de vignettes. Une même fenêtre les
   rassemble désormais, en colonne, pour les cinq listes de l'atelier
   (`LISTES_AFFICHAGE`, js/etat.js) : le bouton « Affichage » de la barre l'ouvre sur
   la liste qui le porte, et rien n'agit avant « Appliquer ».

   « Appliquer partout » verse le même réglage dans les cinq listes — on range
   tout l'atelier de la même façon d'un seul geste, au lieu d'ouvrir cinq fois
   la même fenêtre.
   ===================================================================== */

/* La liste que la fenêtre ouverte règle. Il n'y en a qu'une à la fois, la
   fenêtre étant modale — comme le brouillon qu'elle tient. */
let sectionAffichage = 'collection';

/* Les nombres de colonnes qu'on impose, « auto » mis à part : c'est la case
   à cocher qui porte ce choix-là, et le curseur ne parcourt que les autres. */
const COLONNES_IMPOSEES = COLONNES.filter(n => n > 0);

/* La position du curseur quand « Auto » est cochée : l'état ne retient alors
   aucun nombre, et le curseur doit tout de même se poser quelque part —
   là où on l'avait laissé, sans quoi décocher « Auto » ramènerait toujours au
   même nombre. */
let positionColonnes = 4;

function indexColonnes(n) {
  const i = COLONNES_IMPOSEES.indexOf(n);
  return i >= 0 ? i + 1 : positionColonnes;
}

/* La phrase qui dit, dans l'infobulle du bouton comme dans la fenêtre, ce qui
   est en vigueur pour une liste : le réglage n'est plus visible dans la
   barre, il doit se lire quelque part. */
function resumeAffichage(section) {
  const n = colonnesDe(section);
  const g = GROUPES[S.groupes[section]] || GROUPES.aucun;
  const t = TRIS[S.tris[section]] || TRIS.cmc;
  const cols = n ? `${n} colonne${n > 1 ? 's' : ''}` : 'colonnes auto';
  const vue = !LISTES_AFFICHAGE[section].vue ? cols
    : vueDe(section) === 'grid' ? `grille, ${cols}` : 'liste';
  return `${vue} · ${g.plat ? 'sans groupe' : `groupé par ${g.label.toLowerCase()}`} · trié par ${t.label.toLowerCase()}`;
}

function corpsAffichage() {
  const section = sectionAffichage;
  const liste = LISTES_AFFICHAGE[section];
  return avecBrouillon(() => {
    const n = colonnesDe(section);
    const auto = n === 0;
    const pos = indexColonnes(n);
    const grille = !liste.vue || vueDe(section) === 'grid';
    const tris = TRIS_SECTION[section] || Object.keys(TRIS);
    return `${liste.vue ? `<div class="field">
      <label class="lab">Disposition</label>
      <label class="choix"><input type="radio" name="affVue" value="list" data-aff="vue" ${vueDe(section) === 'list' ? 'checked' : ''}> Liste</label>
      <label class="choix"><input type="radio" name="affVue" value="grid" data-aff="vue" ${vueDe(section) === 'grid' ? 'checked' : ''}> Grille</label>
      <div class="small muted">La liste donne une ligne par carte, la grille des vignettes.</div>
    </div>` : ''}
    <div class="field">
      <label class="lab">Nombre de colonnes</label>
      <label class="choix"><input type="checkbox" id="affAuto" data-aff="auto" ${auto ? 'checked' : ''}> Auto</label>
      <input type="range" id="affColonnes" data-affglisse min="1" max="${COLONNES_IMPOSEES.length}" step="1"
        value="${pos}" aria-label="Nombre de cartes par ligne" aria-describedby="affColonnesVal">
      <div class="small muted" id="affColonnesVal">${auto
        ? 'Autant de vignettes par ligne que la largeur en permet.'
        : `${COLONNES_IMPOSEES[pos - 1]} vignette(s) par ligne, quelle que soit la largeur.`}</div>
      ${grille ? '' : '<div class="small muted">Le mode Liste n\'a qu\'une carte par ligne : ce réglage ne vaut que pour la grille.</div>'}
    </div>
    <div class="field">
      <label class="lab" for="affGroupe">Grouper par</label>
      <select id="affGroupe" data-aff="groupe">
        ${Object.keys(GROUPES).map(k =>
          `<option value="${k}" ${S.groupes[section] === k ? 'selected' : ''}>${esc(GROUPES[k].label)}</option>`).join('')}
      </select>
    </div>
    <div class="field">
      <label class="lab" for="affTri">Trier par</label>
      <select id="affTri" data-aff="tri">
        ${tris.map(k =>
          `<option value="${k}" ${S.tris[section] === k ? 'selected' : ''}>${esc(TRIS[k].label)}</option>`).join('')}
      </select>
      <div class="small muted">L'ordre vaut à l'intérieur de chaque groupe.</div>
    </div>
    <div class="small muted">En vigueur pour ${esc(liste.libelle)} : ${esc(resumeAffichage(section))}</div>
    <div class="small muted">« Appliquer partout » pose ce réglage sur les cinq listes de l'atelier —
      ${esc(CLES_AFFICHAGE.map(c => LISTES_AFFICHAGE[c].libelle).join(', '))} — chacune ne retenant
      que ce qu'elle sait montrer.</div>`;
  });
}

function majFenetreAffichage() {
  const dlg = document.getElementById('dlg');
  if (!dlg || !dlg.open) return;
  const corps = document.getElementById('dlgBody');
  if (!corps || !corps.querySelector('[data-aff]')) return;
  const y = corps.scrollTop;
  corps.innerHTML = corpsAffichage();
  corps.scrollTop = y;
}

/* Les quatre réglages de la fenêtre, au brouillon : rien ne bouge dans la
   liste avant « Appliquer ». */
function reglageAffichage(quoi, el) {
  const section = sectionAffichage;
  modifieBrouillon(() => {
    if (quoi === 'vue') S.vues[section] = el.value;
    else if (quoi === 'auto') S.colonnes[section] = el.checked ? 0 : COLONNES_IMPOSEES[positionColonnes - 1];
    else if (quoi === 'groupe') S.groupes[section] = el.value;
    else if (quoi === 'tri') S.tris[section] = el.value;
  });
  majFenetreAffichage();
}

/* Le curseur des colonnes décoche « Auto » du seul fait qu'on s'en serve :
   imposer un nombre, c'est cesser de s'en remettre à la largeur. La fenêtre
   n'est pas réécrite pendant le glissement — elle emporterait le curseur
   qu'on tient —, seules la case et la phrase sous elle suivent. */
function glisseColonnes(el) {
  positionColonnes = Math.min(COLONNES_IMPOSEES.length, Math.max(1, parseInt(el.value, 10) || 1));
  const n = COLONNES_IMPOSEES[positionColonnes - 1];
  modifieBrouillon(() => { S.colonnes[sectionAffichage] = n; });
  const auto = document.getElementById('affAuto');
  if (auto) auto.checked = false;
  const dit = document.getElementById('affColonnesVal');
  if (dit) dit.textContent = `${n} vignette(s) par ligne, quelle que soit la largeur.`;
}

/* Le réglage choisi, recopié dans les cinq listes : la vue là où elle existe,
   le tri là où la liste l'offre — le taux d'inclusion d'EDHREC n'a pas de
   sens pour la collection, la quantité n'en a pas pour une proposition, et
   `TRIS_SECTION` (js/groupes.js) le dit déjà. Une liste qui n'offre pas ce tri garde
   le sien plutôt qu'un ordre qu'elle ne saurait pas nommer. */
function verseAffichagePartout(conf) {
  CLES_AFFICHAGE.forEach(sec => {
    if (LISTES_AFFICHAGE[sec].vue && conf.vue) S.vues[sec] = conf.vue;
    S.colonnes[sec] = conf.colonnes;
    S.groupes[sec] = conf.groupe;
    if ((TRIS_SECTION[sec] || Object.keys(TRIS)).indexOf(conf.tri) >= 0) S.tris[sec] = conf.tri;
  });
}

/* « Appliquer » verse le réglage d'un coup. Le groupement et le tri changent
   l'ordre des cartes : la pagination de la collection repart de sa première
   page, sinon la fin d'une liste rangée autrement ne voudrait plus rien dire.
   « Appliquer partout » le pose sur les cinq listes, et repeint tout. */
function appliquerAffichage(partout) {
  const section = sectionAffichage;
  const avant = `${S.groupes.collection}|${S.tris.collection}`;
  if (partout) {
    const conf = avecBrouillon(() => ({
      vue: LISTES_AFFICHAGE[section].vue ? vueDe(section) : null,
      colonnes: colonnesDe(section), groupe: S.groupes[section], tri: S.tris[section]
    }));
    modifieBrouillon(() => verseAffichagePartout(conf));
  }
  verseBrouillon();
  if (`${S.groupes.collection}|${S.tris.collection}` !== avant) S.limitB = PAGE;
  closeDialog();
  if (partout) { renderAll(); return; }
  /* Une seule liste a changé : seule sa section est repeinte. Les trois listes
     de propositions partagent leur rendu — une même sélection notée les
     alimente —, et le deck rend ses listes annexes avec lui. */
  if (section === 'collection') renderB();
  else if (section === 'deck') renderE();
  else refreshSuggestions();
  scheduleSave();
}

function openAffichageModal(section) {
  sectionAffichage = LISTES_AFFICHAGE[section] ? section : 'collection';
  positionColonnes = indexColonnes(colonnesDe(sectionAffichage));
  openDialog(LISTES_AFFICHAGE[sectionAffichage].titre, corpsAffichage(),
    `<button type="button" class="btn foot-g" data-act="appliquerAffichagePartout">Appliquer partout</button>
     <button type="button" class="btn" data-act="closeDialog">Annuler</button>
     <button type="button" class="btn pri" data-act="appliquerAffichage">Appliquer</button>`);
  /* Après `openDialog`, qui remet le brouillon à zéro. */
  ouvreBrouillon(['vues', 'colonnes', 'groupes', 'tris'], majFenetreAffichage);
}
