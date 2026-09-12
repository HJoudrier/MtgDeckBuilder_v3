/* =====================================================================
   js/fenAffichage.js — Fenêtre « Affichage » de la collection

   Les quatre réglages de mise en page de la collection — liste ou grille,
   nombre de colonnes, groupement, tri — tenaient dans la barre de la section,
   en quatre contrôles posés entre les boutons d'action : la ligne débordait,
   et chaque geste repeignait aussitôt huit cents vignettes. Ils vivent
   désormais ensemble, en colonne, dans une fenêtre qui n'agit qu'à
   « Appliquer » : on choisit les quatre d'un coup, et la collection n'est
   redessinée qu'une fois.
   ===================================================================== */

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

/* La phrase qui dit, sous le bouton comme dans la fenêtre, ce qui est en
   vigueur : le réglage n'est plus visible dans la barre, il doit se lire
   quelque part. */
function resumeAffichage() {
  const n = colonnesDe('collection');
  const g = GROUPES[S.groupes.collection] || GROUPES.aucun;
  const t = TRIS[S.tris.collection] || TRIS.cmc;
  const vue = S.view === 'grid' ? `grille, ${n ? `${n} colonne${n > 1 ? 's' : ''}` : 'colonnes auto'}` : 'liste';
  return `${vue} · ${g.plat ? 'sans groupe' : `groupé par ${g.label.toLowerCase()}`} · trié par ${t.label.toLowerCase()}`;
}

function corpsAffichage() {
  return avecBrouillon(() => {
    const n = colonnesDe('collection');
    const auto = n === 0;
    const pos = indexColonnes(n);
    const tris = TRIS_SECTION.collection || Object.keys(TRIS);
    return `<div class="field">
      <label class="lab">Disposition</label>
      <label class="choix"><input type="radio" name="affVue" value="list" data-aff="vue" ${S.view === 'list' ? 'checked' : ''}> Liste</label>
      <label class="choix"><input type="radio" name="affVue" value="grid" data-aff="vue" ${S.view === 'grid' ? 'checked' : ''}> Grille</label>
      <div class="small muted">La liste donne une ligne par carte, la grille des vignettes.</div>
    </div>
    <div class="field">
      <label class="lab">Nombre de colonnes</label>
      <label class="choix"><input type="checkbox" id="affAuto" data-aff="auto" ${auto ? 'checked' : ''}> Auto</label>
      <input type="range" id="affColonnes" data-affglisse min="1" max="${COLONNES_IMPOSEES.length}" step="1"
        value="${pos}" aria-label="Nombre de cartes par ligne"
        aria-describedby="affColonnesVal">
      <div class="small muted" id="affColonnesVal">${auto
        ? 'Autant de vignettes par ligne que la largeur en permet.'
        : `${COLONNES_IMPOSEES[pos - 1]} vignette(s) par ligne, quelle que soit la largeur.`}</div>
      ${S.view === 'grid' ? '' : '<div class="small muted">Le mode Liste n\'a qu\'une carte par ligne : ce réglage ne vaut que pour la grille.</div>'}
    </div>
    <div class="field">
      <label class="lab" for="affGroupe">Grouper par</label>
      <select id="affGroupe" data-aff="groupe">
        ${Object.keys(GROUPES).map(k =>
          `<option value="${k}" ${S.groupes.collection === k ? 'selected' : ''}>${esc(GROUPES[k].label)}</option>`).join('')}
      </select>
    </div>
    <div class="field">
      <label class="lab" for="affTri">Trier par</label>
      <select id="affTri" data-aff="tri">
        ${tris.map(k =>
          `<option value="${k}" ${S.tris.collection === k ? 'selected' : ''}>${esc(TRIS[k].label)}</option>`).join('')}
      </select>
      <div class="small muted">L'ordre vaut à l'intérieur de chaque groupe.</div>
    </div>
    <div class="small muted">En vigueur : ${esc(resumeAffichage())}</div>`;
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
   collection avant « Appliquer ». */
function reglageAffichage(quoi, el) {
  modifieBrouillon(() => {
    if (quoi === 'vue') S.view = el.value;
    else if (quoi === 'auto') S.colonnes.collection = el.checked ? 0 : COLONNES_IMPOSEES[positionColonnes - 1];
    else if (quoi === 'groupe') S.groupes.collection = el.value;
    else if (quoi === 'tri') S.tris.collection = el.value;
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
  modifieBrouillon(() => { S.colonnes.collection = n; });
  const auto = document.getElementById('affAuto');
  if (auto) auto.checked = false;
  const dit = document.getElementById('affColonnesVal');
  if (dit) dit.textContent = `${n} vignette(s) par ligne, quelle que soit la largeur.`;
}

/* « Appliquer » verse les quatre réglages d'un coup. Le groupement et le tri
   changent l'ordre des cartes : la pagination repart de sa première page,
   sinon la fin d'une liste rangée autrement ne voudrait plus rien dire. La
   vue liste ou grille est commune au deck, qui est donc repeint aussi. */
function appliquerAffichage() {
  const avant = `${S.groupes.collection}|${S.tris.collection}`;
  verseBrouillon();
  if (`${S.groupes.collection}|${S.tris.collection}` !== avant) S.limitB = PAGE;
  renderB();
  renderE();
  scheduleSave();
  closeDialog();
}

function openAffichageModal() {
  positionColonnes = indexColonnes(colonnesDe('collection'));
  openDialog('Affichage de la collection', corpsAffichage(),
    `<button type="button" class="btn" data-act="closeDialog">Annuler</button>
     <button type="button" class="btn pri" data-act="appliquerAffichage">Appliquer</button>`);
  /* Après `openDialog`, qui remet le brouillon à zéro. */
  ouvreBrouillon(['view', 'colonnes', 'groupes', 'tris'], majFenetreAffichage);
}
