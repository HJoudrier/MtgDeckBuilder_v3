/* =====================================================================
   js/fenParametres.js — Fenêtre « Paramètres »

   Ouverte par l'engrenage de l'en-tête. Trois réglages généraux vivaient dans
   deux fenêtres ouvertes par des étiquettes qu'on ne devinait pas cliquables :
   la sauvegarde locale, la collection et le catalogue sont désormais trois
   sections d'une seule fenêtre.

   Elle mêle deux natures, et le dit : les réglages du catalogue attendent
   « Appliquer » — filtrer coûte près d'une seconde sur un grand catalogue —,
   tandis que les actions — enregistrer, exporter, mettre à jour, effacer —
   agissent au clic. Différer « effacer l'archive » derrière un bouton de
   validation serait déroutant.
   ===================================================================== */

/* Une section de la fenêtre : un titre, une phrase qui dit ce qu'elle règle,
   et son contenu. */
function sectionParametres(titre, chapeau, corps) {
  return `<div class="param-sec">
    <h4>${esc(titre)}</h4>
    ${chapeau ? `<div class="small muted param-chapeau">${chapeau}</div>` : ''}
    ${corps}
  </div>`;
}

/* Ce que la collection pèse sur cet appareil, et les deux gestes qui la
   remplissent ou la vident d'un coup. Le détail — ajouter, compléter,
   grouper — reste dans la section Collection, où l'on a les cartes sous les
   yeux ; ici, on ne fait qu'entrer et sortir. */
function corpsCollectionParam() {
  const cartes = collectionCards();
  const distinctes = cartes.length;
  const exemplaires = cartes.reduce((n, e) => n + e.qty, 0);
  const valeur = cartes.reduce((t, e) => t + (e.card.price || 0) * e.qty, 0);
  const inconnues = cartes.filter(e => e.card.unknown).length;
  return `<div class="scroll"><table class="tbl"><tbody>
      <tr><td>Cartes différentes</td><td>${distinctes.toLocaleString('fr-FR')}</td></tr>
      <tr><td>Exemplaires</td><td>${exemplaires.toLocaleString('fr-FR')}</td></tr>
      <tr><td>Valeur estimée</td><td>${eur(valeur)}</td></tr>
      ${inconnues ? `<tr><td>Cartes incomplètes</td><td>${inconnues.toLocaleString('fr-FR')} — sans coût ni texte tant que Scryfall ne les a pas complétées</td></tr>` : ''}
    </tbody></table></div>
    <div class="row" style="gap:6px;margin-top:6px">
      <button type="button" class="btn sm" data-act="import">Importer une liste MTGO</button>
      ${inconnues ? `<button type="button" class="btn sm" data-act="enrich">Compléter ${inconnues} carte${inconnues > 1 ? 's' : ''}</button>` : ''}
      <button type="button" class="btn sm danger" data-act="wipe">Vider la collection</button>
    </div>`;
}

function corpsCatalogue() {
  return avecBrouillon(() => `<div class="field">
      <label class="lab" for="catMax">Cartes examinées au maximum</label>
      <input id="catMax" type="number" min="100" step="1000" value="${S.candidatsMax}" data-cand style="width:120px">
      <div class="small muted">Nombre de cartes du catalogue que les suggestions examinent au plus, une fois vos
        filtres appliqués — les mieux classées par EDHREC passent en premier. Plus haut, la recherche est plus
        large et le recalcul plus long.</div>
    </div>
    <div class="field">
      <label style="display:flex;align-items:center;gap:8px;font-size:13.5px;color:var(--txt);cursor:pointer">
        <input type="checkbox" data-act="catNumeriques" ${S.catalogueNumeriques ? 'checked' : ''} style="width:auto;margin:0">
        Autoriser les cartes numériques
      </label>
      <div class="small muted">Les cartes qui n'existent que sur Arena ou MTGO — Alchemy, rééquilibrages —
        et qu'on ne peut pas posséder sur papier. Cochée, elles entrent dans les suggestions, les éditions
        numériques apparaissent dans le filtre par set, et la fiche d'une carte en montre les visuels.</div>
    </div>
    <div class="warnbox">Ces deux réglages attendent « Appliquer ». Tout le reste de cette fenêtre agit immédiatement.</div>
    ${blocCatalogue()}`);
}

/* Le corps entier, les trois sections à la suite. La sauvegarde vient en
   tête : c'est d'elle que dépend tout ce qui suit. */
function corpsParametres() {
  return `<div class="params">
    ${sectionParametres('Sauvegarde locale',
      "Où vivent vos données, et comment les emporter d'un appareil à l'autre.",
      corpsSauvegarde())}
    ${sectionParametres('Collection',
      'Ce que votre collection pèse sur cet appareil, et de quoi la remplir ou la vider.',
      corpsCollectionParam())}
    ${sectionParametres('Catalogue des cartes',
      "L'archive de toutes les cartes existantes, et ce que les suggestions y puisent.",
      corpsCatalogue())}
  </div>`;
}

/* La fenêtre reste ouverte pendant qu'une archive se charge ou qu'un réglage
   change : son corps est réécrit sur place, le défilement gardé, et les
   champs de fichier rebranchés — l'ancien HTML emportait leurs écouteurs. */
function majFenetreParametres() {
  const dlg = document.getElementById('dlg');
  if (!dlg || !dlg.open) return;
  const corps = document.getElementById('dlgBody');
  if (!corps || !document.getElementById('blocCatalogue')) return;
  const y = corps.scrollTop;
  corps.innerHTML = corpsParametres();
  corps.scrollTop = y;
  brancherParametres();
}

function brancherParametres() {
  if (typeof brancherSauvegarde === 'function') brancherSauvegarde();
  if (typeof brancherRestauration === 'function') brancherRestauration();
  if (typeof brancherCatalogue === 'function') brancherCatalogue();
}

async function appliquerParametres() {
  verseBrouillon();
  await filtrerAvecProgression();
  closeDialog();
}

function openParametresModal() {
  openDialog('Paramètres', corpsParametres(),
    `<button type="button" class="btn" data-act="closeDialog">Fermer</button>
     <button type="button" class="btn pri" data-act="appliquerParametres">Appliquer</button>
     ${zoneProgression()}`, true);
  ouvreBrouillon(['candidatsMax', 'catalogueNumeriques'], majFenetreParametres);
  brancherParametres();
}

/* « Appliquer » verse le brouillon puis recalcule, comme pour les filtres :
   changer de format reprend l'atelier tout autant qu'un critère. */
async function appliquerFormat() {
  verseBrouillon();
  await filtrerAvecProgression();
  closeDialog();
}

