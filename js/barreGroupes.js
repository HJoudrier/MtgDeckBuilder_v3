/* =====================================================================
   js/barreGroupes.js — L'enveloppe d'un groupe, et le bouton « Affichage »

   Le pli d'une catégorie, son en-tête et son badge, puis ce que toute liste de
   cartes pose dans sa barre : le bouton qui ouvre sa fenêtre d'affichage, la
   vue qu'elle suit et l'ouverture de sa grille. Chacun porte sa liste en
   attribut — c'est elle qui dit quel réglage change, chacune gardant le sien.
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
   vignettes par ligne, où l'on ne lit plus rien. Le curseur de la fenêtre
   d'affichage laisse imposer un nombre — une seule carte par ligne pour la
   lire vraiment, deux ou trois pour comparer, davantage pour embrasser la
   liste d'un coup d'œil.

   « Auto » est le choix de départ : c'est le comportement d'avant, et rien ne
   change pour qui n'y touche pas. Comme le groupement et le tri, le réglage
   appartient à la liste qui le porte — les cinq ont chacune le sien — et se
   conserve d'une séance à l'autre.
   --------------------------------------------------------------------- */
function colonnesDe(section) {
  const n = (S.colonnes && S.colonnes[section]) | 0;
  return COLONNES.indexOf(n) >= 0 ? n : 0;
}

/* L'ouverture d'une grille : la classe et la variable qui portent le choix,
   ou la grille d'avant si l'on s'en remet à la largeur. `base` est la classe
   de la grille — `grid` pour les tuiles de la collection et du deck, `sugrid`
   pour les vignettes des trois listes de propositions. */
function ouvreGrille(section, base) {
  const n = colonnesDe(section);
  return n > 0 ? `<div class="${base} cols" style="--cols:${n}">` : `<div class="${base}">`;
}

/* La vue d'une liste : ses vignettes en grille, ou une ligne par carte. Les
   trois listes de propositions n'en ont pas — leurs vignettes n'ont pas de
   forme en ligne —, et la grille est la réponse par défaut. */
function vueDe(section) {
  return (S.vues && S.vues[section]) === 'list' ? 'list' : 'grid';
}

/* Le bouton que toute liste de cartes pose dans sa barre : il ouvre sa
   fenêtre d'affichage, et son infobulle dit le réglage en vigueur — celui-ci
   n'étant plus visible dans la barre. Cinq contrôles y tenaient autrefois
   par liste ; la barre du deck en portait six avec ses bascules. */
function boutonAffichage(section) {
  return `<button class="btn" data-act="affichage" data-liste="${section}"
    title="Régler l'affichage : ${esc(resumeAffichage(section))}">Affichage</button>`;
}
