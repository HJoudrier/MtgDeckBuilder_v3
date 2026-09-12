/* =====================================================================
   js/sugListes.js — Le fond commun des trois listes de propositions

   La partition de la sélection notée, puis ce que les trois sections partagent
   pour la montrer : la clé de pagination d'une catégorie, le corps d'un
   groupe, ses boutons « Afficher de plus », et les visuels qu'il faut
   demander. Chaque section a son fichier — `sugGraphe.js`, `sugEdhrec.js`,
   `sugCatalogue.js` — et n'y garde que ce qui lui appartient : son titre, ses
   phrases vides, sa teinte.
   ===================================================================== */

/* ---------------------------------------------------------------------
   Trois lectures d'une même sélection.

   La notation ne connaît qu'une liste : toutes les cartes qu'on pourrait
   ajouter, classées par score. Trois onglets la lisent différemment — le
   graphe ne retient que ce qui se branche sur les nœuds isolés, EDHREC que ce
   que les decks recensés recommandent, le catalogue montre tout, groupé et
   paginé. Les trois vivaient hier sous le même onglet, l'un derrière l'autre :
   il fallait dérouler des centaines de vignettes pour revenir au graphe, et
   les recommandations d'EDHREC se perdaient au milieu.

   La partition est faite une fois — `selectionSuggestions()` — et les trois
   sections s'y servent. `renderSuggestions()` est le seul point d'entrée des
   autres modules : une donnée qui arrive, d'EDHREC ou du catalogue, touche les
   trois pages à la fois.
   --------------------------------------------------------------------- */

function selectionSuggestions() {
  const sug = suggestionsAffichees();
  return {
    sug,
    /* Sans nœud isolé, le graphe ne distingue rien : la liste serait celle du
       catalogue, et n'aurait pas sa place sur cette page. */
    graphPicks: S.focusNodes.size ? sug.filter(s => s.graph && s.graph.includes('noeud')) : [],
    edhrecPicks: sug.filter(s => s.edhrec)
  };
}

/* La liste d'une section, dans la sélection partitionnée : c'est la même
   table que lisent la pagination et les rendus. */
function listeSug(section, sel) {
  return section === 'graphe' ? sel.graphPicks : section === 'edhrec' ? sel.edhrecPicks : sel.sug;
}

/* Le nombre de vignettes qu'une liste montre d'abord. Les deux listes courtes
   en montrent huit, le catalogue six ; groupée, chaque catégorie en montre six
   quelle que soit la section — elles sont alors nombreuses, et une page qui
   s'ouvre sur trois cents vignettes ne se lit pas. */
const DEFAUT_SUG = {graphe:8, edhrec:8, suggestions:6};

function defautSug(section, plat) {
  return plat ? (DEFAUT_SUG[section] || 6) : 6;
}

/* La clé de pagination d'une catégorie. Elle porte sa section : sans cela,
   « Créature » partagerait son compte entre le graphe, EDHREC et le
   catalogue, et déplier l'une déplierait les autres. Sans groupement, la
   liste entière tient sous le nom de la section. */
function cleLimiteSug(section, idGroupe) {
  return idGroupe === null ? section : `${section}:${idGroupe}`;
}

function maxSug(section, g, plat, defaut) {
  return Math.min(S.limiteType[cleLimiteSug(section, plat ? null : g.id)] || defaut, g.total);
}

/* Les boutons de pagination d'une liste, ou rien si tout tient. */
function paginationListe(cle, total, max, defaut) {
  const reste = total - max;
  if (total <= defaut) return '';
  return `<div class="row" style="justify-content:center;gap:6px;margin-top:8px">
    ${reste > 0 ? `<button class="btn sm" data-act="pageType" data-type="${esc(cle)}" data-pas="30">Afficher ${Math.min(30, reste)} de plus</button>` : ''}
    ${reste > 30 ? `<button class="btn sm" data-act="pageType" data-type="${esc(cle)}" data-pas="tout">Tout afficher (${total})</button>` : ''}
    ${max > defaut ? `<button class="btn sm" data-act="pageType" data-type="${esc(cle)}" data-pas="reduire">Réduire</button>` : ''}
  </div>`;
}

/* Le corps d'un groupe : ses vignettes dans la grille de la section — dont le
   nombre de colonnes est réglable comme celui des autres — et sa pagination.
   Le tout entre dans le pli : une catégorie repliée cache aussi ses boutons. */
function corpsSug(section, g, plat, defaut) {
  const max = maxSug(section, g, plat, defaut);
  const cle = cleLimiteSug(section, plat ? null : g.id);
  return {max, html: `${ouvreGrille(section, 'sugrid')}${g.entrees.slice(0, max).map(s => sugRow(s)).join('')}</div>
    ${paginationListe(cle, g.total, max, defaut)}`};
}

/* Les listes d'une section : sans groupement, un seul bloc titré ; groupée,
   une enveloppe repliable par catégorie. `titre` est déjà échappé — les
   sections y glissent le nom d'un commandant ou d'un nœud. */
function listesSug(section, groupes, mode, titre, couleur) {
  const plat = GROUPES[mode].plat;
  const defaut = defautSug(section, plat);
  if (plat) {
    const g = groupes[0];
    if (!g) return '';
    const {max, html} = corpsSug(section, g, true, defaut);
    return `<div class="group"${couleur ? ` style="border-color:${couleur}"` : ''}>
      <h4>${titre} <span class="small muted">${max} sur ${g.total}</span></h4>
      ${html}</div>`;
  }
  return groupes.map(g => {
    const {max, html} = corpsSug(section, g, false, defaut);
    return enveloppeGroupe(section, mode, g, g.libelle, `${max} sur ${g.total}`, html);
  }).join('');
}

/* Le renvoi au catalogue : les deux listes courtes ne montrent qu'un extrait
   du classement, et le dire évite de les croire exhaustives. */
function renvoiCatalogue(quoi) {
  return `<div class="small muted" style="margin-top:8px">${quoi} Le classement complet, groupé et paginé, est dans
    <button type="button" class="btn sm" data-onglet="catalogue">l'onglet Catalogue</button>.</div>`;
}

/* Les visuels des vignettes qu'une section affiche. Chacune demande les
   siennes : Scryfall n'est sollicité qu'une fois par carte — `queueScryfall`
   écarte celles déjà demandées —, et une page qu'on ne regarde pas ne charge
   donc rien de plus que ce qu'elle montre. */
function visuelsSuggestions(vus) {
  if (!vus || !vus.length) return;
  setTimeout(() => queueScryfall(vus.map(x => x.card)), 0);
  setTimeout(chargeVisuelsClasses, 0);
}

/* Ceux d'une section groupe par groupe : une catégorie repliée ne montre
   rien, et demander les visuels de vignettes que personne ne voit serait
   autant de requêtes pour rien. */
function visuelsGroupes(section, groupes, mode) {
  const plat = GROUPES[mode].plat, defaut = defautSug(section, plat), vus = [];
  groupes.forEach(g => {
    if (!plat && groupePlie(section, mode, g.id)) return;
    vus.push(...g.entrees.slice(0, maxSug(section, g, plat, defaut)));
  });
  visuelsSuggestions(vus);
}
