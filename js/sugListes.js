/* =====================================================================
   js/sugListes.js — Les trois lectures d'une même sélection
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

/* La pagination d'une liste qui n'est pas un groupe du catalogue : celle du
   graphe et celle d'EDHREC, chacune sur sa page, avec son compte par défaut.
   `js/app.js` y lit ce que « Afficher de plus » doit faire. */
const LISTES_SUG = {graphe:{defaut:8}, edhrec:{defaut:8}};

/* Les boutons de pagination d'une liste hors catalogue, ou rien si tout
   tient. Le compte par défaut est passé : une liste courte en montre huit,
   une catégorie d'EDHREC six, comme les catégories du catalogue. */
function paginationListe(cle, total, max, defaut) {
  const reste = total - max;
  if (total <= defaut) return '';
  return `<div class="row" style="justify-content:center;gap:6px;margin-top:8px">
    ${reste > 0 ? `<button class="btn sm" data-act="pageType" data-type="${esc(cle)}" data-pas="30">Afficher ${Math.min(30, reste)} de plus</button>` : ''}
    ${reste > 30 ? `<button class="btn sm" data-act="pageType" data-type="${esc(cle)}" data-pas="tout">Tout afficher (${total})</button>` : ''}
    ${max > defaut ? `<button class="btn sm" data-act="pageType" data-type="${esc(cle)}" data-pas="reduire">Réduire</button>` : ''}
  </div>`;
}

/* Le renvoi au catalogue : les deux listes courtes ne montrent qu'un extrait
   du classement, et le dire évite de les croire exhaustives. */
function renvoiCatalogue(quoi) {
  return `<div class="small muted" style="margin-top:8px">${quoi} Le classement complet, groupé et paginé, est dans
    <button type="button" class="btn sm" data-onglet="catalogue">l'onglet Catalogue</button>.</div>`;
}

/* La section du graphe : ce qui se branche sur les nœuds qu'on y a isolés.
   Elle suit le graphe sur la même page — on clique un effet, on voit aussitôt
   de quoi l'alimenter. */
function blocGraphe(sel) {
  const actifs = noeudsActifs();
  if (!actifs.length)
    return `<div class="empty">Aucun nœud isolé. Cliquez un nœud du graphe, ci-dessus : les cartes qui s'y branchent
      seront proposées ici, à part du reste du classement.</div>`;

  const noms = actifs.map(n => esc(NODE[n].label)).join(' + ');
  const picks = sel.graphPicks;
  if (!picks.length)
    return `<div class="empty">Rien à proposer autour de ${noms} : élargissez les couleurs, le budget ou les filtres,
      ou relâchez un nœud dans le graphe.</div>`;

  const total = picks.length, max = Math.min(S.limiteType['graphe'] || LISTES_SUG.graphe.defaut, total);
  visuelsSuggestions(picks.slice(0, max));

  return `<div class="group" style="border-color:var(--brass-d)">
    <h4>Autour de ${noms}
      <span class="small muted">${max} sur ${total} piste(s)</span></h4>
    <div class="sugrid">${picks.slice(0, max).map(s => sugRow(s)).join('')}</div>
    ${paginationListe('graphe', total, max, LISTES_SUG.graphe.defaut)}
  </div>
  ${renvoiCatalogue('Ces pistes touchent tous les nœuds isolés ; le score, lui, est celui de la notation commune.')}`;
}

/* La clé de pagination d'une catégorie d'EDHREC. Elle est préfixée : sans
   cela, « Créature » y partagerait son compte avec la « Créature » du
   catalogue, et déplier l'une déplierait l'autre. */
function cleLimiteEdhrec(idGroupe) {
  return 'edhrec:' + idGroupe;
}

/* Le compte affiché d'une catégorie d'EDHREC, et sa pagination : sans groupe,
   c'est la liste entière sous la clé « edhrec » ; groupée, chaque catégorie a
   la sienne. */
function corpsEdhrec(g, plat) {
  const cle = plat ? 'edhrec' : cleLimiteEdhrec(g.id);
  const defaut = plat ? LISTES_SUG.edhrec.defaut : 6;
  const max = Math.min(S.limiteType[cle] || defaut, g.total);
  return {max, html: `<div class="sugrid">${g.entrees.slice(0, max).map(s => sugRow(s)).join('')}</div>
    ${paginationListe(cle, g.total, max, defaut)}`};
}

/* Les visuels des recommandations affichées, catégorie par catégorie : une
   catégorie repliée ne montre rien, et ne demande donc rien. */
function visuelsEdhrec(groupes, mode) {
  const plat = GROUPES[mode].plat, vus = [];
  groupes.forEach(g => {
    if (!plat && groupePlie('edhrec', mode, g.id)) return;
    vus.push(...g.entrees.slice(0, corpsEdhrec(g, plat).max));
  });
  visuelsSuggestions(vus);
}

/* La section EDHREC : le panneau du commandant est rendu à part (il ne dépend
   pas de la sélection), et voici les cartes que les decks recensés
   recommandent parmi celles qu'on pourrait ajouter.

   Elle se range comme les autres — sa propre barre, son propre groupement,
   son propre tri, gardés sous la clé `edhrec` — et offre en plus les deux
   tris qui n'ont de sens qu'ici : le taux d'inclusion et la synergie, tels
   qu'EDHREC les publie. */
function blocEdhrec(sel) {
  const f = fmt();
  if (!f.commander)
    return `<div class="empty">Ce format n'a pas de commandant : EDHREC ne recense que les decks Commander.
      Les suggestions de l'atelier restent dans <button type="button" class="btn sm" data-onglet="catalogue">l'onglet Catalogue</button>.</div>`;

  const edhrecPicks = sel.edhrecPicks;
  if (!edhrecPicks.length) {
    if (S.edhrec && S.edhrec.status === 'ok' && (S.commander || commandantsSecondaires().length))
      return `<div class="empty">Aucune carte recommandée par EDHREC ne correspond à votre budget actuel
        (${S.budget.total > 0 ? `${eur(S.budget.perCard)} max / carte` : 'collection uniquement'}) ou à vos filtres.</div>`;
    return '';
  }

  const total = edhrecPicks.length;
  const cmdNom = (S.edhrec && S.edhrec.data && S.edhrec.data.commandant) || S.commander || '';
  const secList = (S.edhrec.secondaires || []).map(s => s.commandant);
  const budInfo = S.budget.total > 0 ? `budget max ${eur(S.budget.perCard)} / carte` : 'collection uniquement';

  const titreEDH = cmdNom
    ? `Recommandées pour ${esc(cmdNom)}${secList.length ? ` & ${secList.length} cmd 2nd` : ''}`
    : `Recommandées par les commandants secondaires (${secList.map(esc).join(', ')})`;

  /* Comme au catalogue, le tri « score » ne retrie rien : la liste arrive
     dans l'ordre des scores, ou dans l'ordre gelé qu'un ajout a retenu. Tout
     autre tri — les deux taux d'EDHREC d'abord — est un ordre demandé, qui
     passe donc avant le gel. */
  const mode = S.groupes.edhrec;
  const tri = S.tris.edhrec === 'score' ? null : S.tris.edhrec;
  const groupes = groupeCartes(edhrecPicks, mode, tri);
  const plat = GROUPES[mode].plat;
  visuelsEdhrec(groupes, mode);

  const listes = plat
    ? (() => {
        const g = groupes[0], {max, html} = corpsEdhrec(g, true);
        return `<div class="group" style="border-color:#2f6b68">
          <h4>${titreEDH} <span class="small muted">${max} sur ${g.total}</span></h4>
          ${html}</div>`;
      })()
    : groupes.map(g => {
        const {max, html} = corpsEdhrec(g, false);
        return enveloppeGroupe('edhrec', mode, g, g.libelle, `${max} sur ${g.total}`, html);
      }).join('');

  return `<div class="row" style="margin-bottom:10px">
      ${barreGroupeTri('edhrec')}
      <span class="small muted">${total} recommandation(s)${noteMultiple(mode)} · ${budInfo}</span>
    </div>
    ${plat ? '' : `<div class="small muted" style="margin-bottom:8px">${titreEDH}</div>`}
    ${listes}
    ${renvoiCatalogue('Ces cartes portent l\'étiquette <b>edhrec</b> partout où elles paraissent.')}`;
}

/* La section du catalogue : tout le classement, groupé et paginé selon la
   barre de la section. Les deux listes courtes des autres onglets en sont des
   extraits — rien n'est retiré d'ici. */
function listeSuggestions(sel) {
  const sug = sel.sug;
  /* Le rangement de la section. Le tri par score ne retrie rien : la liste
     arrive déjà dans l'ordre des scores, ou dans l'ordre gelé que le geste
     précédent a retenu — la retrier ferait sauter les vignettes que ce gel
     tient justement en place. Tout autre tri est un ordre demandé, qui passe
     donc avant le gel. */
  const mode = S.groupes.suggestions;
  const tri = S.tris.suggestions === 'score' ? null : S.tris.suggestions;
  const groupes = groupeCartes(sug, mode, tri);
  visuelsCatalogue(groupes);

  return `
    <div class="row" style="margin-bottom:10px">
      ${barreGroupeTri('suggestions')}
      ${menuColonnes('suggestions')}
      <span class="small muted">${sug.length} piste(s)${noteMultiple(mode)}</span>
    </div>
    ${bandeauReclassement()}
    ${sug.length ? groupes.map(g => {
      const total = g.total, max = Math.min(S.limiteType[g.id] || 6, total), reste = total - max;
      const titre = GROUPES[mode].plat ? 'Toutes les pistes' : g.libelle;
      /* Le corps entier — les vignettes et la pagination de la catégorie —
         entre dans le pli : repliée, elle cache aussi ses boutons. */
      const corps = `${ouvreGrille('suggestions', 'sugrid')}${g.entrees.slice(0,max).map(s=>sugRow(s)).join('')}</div>
        ${total > 6 ? `<div class="row" style="justify-content:center;gap:6px;margin-top:8px">
          ${reste > 0 ? `<button class="btn sm" data-act="pageType" data-type="${esc(g.id)}" data-pas="30">Afficher ${Math.min(30,reste)} de plus</button>` : ''}
          ${reste > 30 ? `<button class="btn sm" data-act="pageType" data-type="${esc(g.id)}" data-pas="tout">Tout afficher (${total})</button>` : ''}
          ${max > 6 ? `<button class="btn sm" data-act="pageType" data-type="${esc(g.id)}" data-pas="reduire">Réduire</button>` : ''}
        </div>` : ''}`;
      /* Sans groupement, il n'y a pas de catégorie à replier : le bloc reste
         celui d'avant, avec son seul titre. */
      return GROUPES[mode].plat
        ? `<div class="group"><h4>${esc(titre)} <span class="small muted">${max} sur ${total}</span></h4>${corps}</div>`
        : enveloppeGroupe('suggestions', mode, g, titre, `${max} sur ${total}`, corps);
    }).join('')
      : '<div class="empty">Aucune suggestion. Ajoutez des cartes à la collection, élargissez les couleurs ou augmentez le budget.</div>'}
    <div class="small muted">Le score combine les branchements avec le deck (un effet produit ici déclenche une capacité là-bas), les rôles manquants, la courbe de mana et la densité de capacités. Les cartes hors collection sont pénalisées et limitées par le budget.
      <br>Les pistes tirées des nœuds isolés du graphe sont réunies dans <button type="button" class="btn sm" data-onglet="graphe">l'onglet Graphe</button>,
      celles que recommandent les decks recensés dans <button type="button" class="btn sm" data-onglet="edhrec">l'onglet EDHREC</button> : toutes figurent aussi ici.
      <br>Le budget, le prix maximum par carte et les préférences d'achat (état, langue, vendeur, pays) se règlent
      dans la fenêtre « Achats sur Cardmarket », qu'ouvre la pastille « Budget » de l'en-tête, et n'y prennent
      effet qu'au bouton « Appliquer ».</div>`;
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

/* Celles du catalogue, groupe par groupe : une catégorie repliée ne montre
   rien, et demander les visuels de vignettes que personne ne voit serait
   autant de requêtes pour rien. */
function visuelsCatalogue(groupes) {
  const vus = [];
  const mode = S.groupes.suggestions;
  groupes.forEach(g => {
    if (groupePlie('suggestions', mode, g.id)) return;
    vus.push(...g.entrees.slice(0, Math.min(S.limiteType[g.id] || 6, g.total)));
  });
  visuelsSuggestions(vus);
}
