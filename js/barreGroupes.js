/* =====================================================================
   js/barreGroupes.js — L'enveloppe d'un groupe, et les trois menus

   Le pli d'une catégorie, son en-tête et son badge, puis les menus identiques
   dans les trois sections : grouper, trier, et le nombre de cartes par ligne.
   Chacun porte sa section en attribut — c'est elle qui dit quel réglage
   change, chacune gardant le sien.
   ===================================================================== */

/* ---------------------------------------------------------------------
   Le pli d'une catégorie. La clé réunit la section, le mode de groupement et
   l'identifiant du groupe : replier « Créature » dans le deck ne replie pas
   la « Créature » de la collection, et changer de groupement laisse les plis
   de l'autre mode en place — y revenir les retrouve. Une catégorie jamais
   repliée n'est pas dans l'ensemble : une catégorie nouvelle s'ouvre.
   --------------------------------------------------------------------- */
function clePli(section, modeId, id) {
  return `${section}|${modeId}|${id}`;
}

function groupePlie(section, modeId, id) {
  return S.groupesPlies.has(clePli(section, modeId, id));
}

/* L'identifiant que le bouton commande, tiré d'un compteur de rendu : un
   libellé de sous-type ou d'édition n'a pas à être un identifiant HTML. */
let COMPTEUR_GROUPE = 0;

/* Une catégorie, repliable, sur le patron des parties de la section Deck
   (`partieDeck`, js/deckSection.js) : mêmes classes, même chevron, même geste. Le
   corps est rendu par la section, qui seule sait ce qu'elle y met. */
function enveloppeGroupe(section, modeId, g, titre, badge, corps) {
  const cle = clePli(section, modeId, g.id);
  const ouverte = !S.groupesPlies.has(cle);
  const idDom = `grp-${section}-${++COMPTEUR_GROUPE}`;
  return `<div class="group partie ${ouverte ? 'ouverte' : ''}">
    <button type="button" class="partie-tete" data-act="plierGroupe"
        data-section="${section}" data-cle="${esc(cle)}"
        aria-expanded="${ouverte}" aria-controls="${idDom}"
        title="${ouverte ? 'Replier cette catégorie' : 'Déplier cette catégorie'}">
      <span class="chev-partie" aria-hidden="true">›</span>
      <h4>${esc(titre)}</h4>
      <span class="small muted">${badge}</span>
    </button>
    <div class="partie-corps" id="${idDom}">${corps}</div>
  </div>`;
}

/* ---------------------------------------------------------------------
   Le rendu commun : un titre par groupe, le contenu rendu par la section
   elle-même — la collection et le deck posent des tuiles ou des lignes, les
   suggestions leurs vignettes. Sans groupe, il n'y a pas de titre du tout :
   la liste est rendue telle quelle, et rien ne se replie.
   --------------------------------------------------------------------- */
function rendGroupes(section, groupes, modeId, rendEntrees, compte) {
  if ((GROUPES[modeId] || GROUPES.aucun).plat)
    return rendEntrees(groupes.length ? groupes[0].entrees : []);
  return groupes.map(g => {
    const n = g.entrees.length;
    /* Une catégorie que la section n'a pas rendue — repliée, la collection ne
       lui donne aucune place dans sa page — annonce son total entier plutôt
       qu'un « 0 sur 59 » qui la dirait vide. */
    const badge = compte ? compte(g)
      : (!n && g.total ? `${g.total}` : n < g.total ? `${n} sur ${g.total}` : `${n}`);
    return enveloppeGroupe(section, modeId, g, g.libelle, badge, rendEntrees(g.entrees, g));
  }).join('');
}

/* Un regroupement où une carte compte plusieurs fois le dit, sans quoi la
   somme des en-têtes contredirait le total affiché juste au-dessus. */
function noteMultiple(modeId) {
  const mode = GROUPES[modeId];
  if (!mode || !mode.multiple) return '';
  return modeId === 'sousType'
    ? ' · une carte figure dans chacun de ses sous-types, la somme des groupes dépasse donc le total'
    : ' · une carte figure dans chacun de ses rôles, la somme des groupes dépasse donc le total';
}

/* ---------------------------------------------------------------------
   Le nombre de cartes par ligne.

   Les grilles posaient autant de colonnes que la largeur en permettait,
   chacune d'une largeur minimale : sur un téléphone, cela fait deux ou trois
   vignettes par ligne, où l'on ne lit plus rien. Le menu laisse imposer un
   nombre — une seule carte par ligne pour la lire vraiment, deux ou trois
   pour comparer, davantage pour embrasser la liste d'un coup d'œil.

   « Auto » est le choix de départ : c'est le comportement d'avant, et rien ne
   change pour qui n'y touche pas. Comme le groupement et le tri, le réglage
   appartient à la liste qui le porte — la collection et le catalogue ont
   chacun le sien — et se conserve d'une séance à l'autre.
   --------------------------------------------------------------------- */
function colonnesDe(section) {
  const n = (S.colonnes && S.colonnes[section]) | 0;
  return COLONNES.indexOf(n) >= 0 ? n : 0;
}

function menuColonnes(section) {
  const n = colonnesDe(section);
  return `<select data-colonnes="${section}" aria-label="Nombre de cartes par ligne"
      title="Nombre de cartes par ligne, quelle que soit la largeur de l'écran">
    ${COLONNES.map(v =>
      `<option value="${v}" ${n === v ? 'selected' : ''}>Colonnes : ${v === 0 ? 'auto' : v}</option>`).join('')}
  </select>`;
}

/* L'ouverture d'une grille : la classe et la variable qui portent le choix,
   ou la grille d'avant si l'on s'en remet à la largeur. `base` est la classe
   de la grille — `grid` pour les tuiles de la collection, `sugrid` pour les
   vignettes du catalogue. */
function ouvreGrille(section, base) {
  const n = colonnesDe(section);
  return n > 0 ? `<div class="${base} cols" style="--cols:${n}">` : `<div class="${base}">`;
}

function barreGroupeTri(section) {
  const g = (S.groupes && S.groupes[section]) || 'aucun';
  const t = (S.tris && S.tris[section]) || 'alpha';
  const tris = TRIS_SECTION[section] || Object.keys(TRIS);
  return `<select data-groupe="${section}" title="Ranger les cartes par catégorie">
      ${Object.keys(GROUPES).map(k =>
        `<option value="${k}" ${g === k ? 'selected' : ''}>Grouper : ${GROUPES[k].label}</option>`).join('')}
    </select>
    <select data-tri="${section}" title="Ordonner les cartes à l'intérieur de chaque groupe">
      ${tris.map(k =>
        `<option value="${k}" ${t === k ? 'selected' : ''}>Trier : ${TRIS[k].label}</option>`).join('')}
    </select>`;
}
