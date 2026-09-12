/* =====================================================================
   js/ficheParcours.js — Ouvrir une fiche, et feuilleter la liste d'où elle vient
   ===================================================================== */

/* ---------------------------------------------------------------------
   Le fil de lecture d'une fiche.

   Une fiche s'ouvre presque toujours depuis une liste : la collection, le
   deck, les propositions d'un onglet. Les deux boutons de son entête suivent
   cette liste — la carte précédente, la suivante —, et l'ordre qu'ils suivent
   est celui qu'on a sous les yeux : le parcours est relevé sur le document
   lui-même au moment du geste, non reconstruit depuis l'état. Filtres,
   groupement, tri, pagination et catégories repliées y sont déjà.

   Les noms sont retenus, non les éléments : un rendu peut survenir entre deux
   fiches — ajouter la carte au deck en rouvre une —, et des éléments retenus
   ne seraient plus dans le document. Un même nom paraissant dans deux
   catégories — les groupements par sous-type ou par rôle rangent une carte à
   plusieurs endroits — n'est retenu qu'une fois.
   --------------------------------------------------------------------- */

let PARCOURS_FICHE = {noms: [], i: -1};

function poseParcoursFiche(el, nom) {
  const zone = el && el.closest ? el.closest('section.sec') : null;
  const noms = [];
  if (zone) zone.querySelectorAll('[data-card]').forEach(x => {
    const n = x.getAttribute('data-card');
    if (n && noms.indexOf(n) < 0) noms.push(n);
  });
  const i = noms.indexOf(nom);
  /* Une carte seule n'est pas un parcours : les deux boutons resteront
     inertes plutôt que de tourner en rond sur elle-même. */
  PARCOURS_FICHE = (i >= 0 && noms.length > 1) ? {noms, i} : {noms: [], i: -1};
}

/* Passer à la voisine. Les extrémités ne bouclent pas : la première carte n'a
   pas de précédente, et son bouton est désactivé — mieux vaut le voir que
   d'atterrir à la fin de la liste sans l'avoir voulu. */
function ficheVoisine(pas) {
  const {noms, i} = PARCOURS_FICHE;
  const j = i + pas;
  if (!noms.length || j < 0 || j >= noms.length) return;
  PARCOURS_FICHE = {noms, i: j};
  openCardModal(noms[j]);
  /* L'entête vient d'être réécrit sous le doigt : le bouton qu'on venait de
     presser n'existe plus, et le focus serait retombé sur la fenêtre — la
     touche Entrée n'aurait plus rien sous elle. Il retrouve donc le bouton de
     même sens, ou son voisin si celui-là est devenu inerte au bout de la
     liste. */
  const meme = document.querySelector(`#dlgTitle .dlg-nav[data-pas="${pas}"]`);
  const cible = (meme && !meme.disabled) ? meme : document.querySelector(`#dlgTitle .dlg-nav[data-pas="${-pas}"]`);
  if (cible && typeof cible.focus === 'function') cible.focus();
}

/* L'entête de la fiche : le nom au centre, une flèche de chaque côté. Celle de
   droite a pris la place de la croix ; la fenêtre se ferme toujours par Échap,
   par l'arrière-plan, ou par le bouton « Fermer » de son pied. */
function enteteFiche(nom) {
  const {noms, i} = PARCOURS_FICHE;
  const voisin = pas => (i >= 0 && i + pas >= 0 && i + pas < noms.length) ? noms[i + pas] : '';
  const bouton = (pas, glyphe, sens, touche) => {
    const v = voisin(pas);
    return `<button type="button" class="btn sm dlg-nav" data-act="ficheNav" data-pas="${pas}"
      ${v ? '' : 'disabled'} aria-label="Carte ${sens}"
      title="${v ? `Carte ${sens} (${touche}) : ${esc(v)}` : `Aucune carte ${sens} dans la liste parcourue`}">${glyphe}</button>`;
  };
  return `<div class="dlg-h-nav">
    ${bouton(-1, '‹', 'précédente', '←')}
    <h3 class="dlg-titre">${esc(nom)}${noms.length ? `<span class="small muted"> · ${i + 1} / ${noms.length}</span>` : ''}</h3>
    ${bouton(1, '›', 'suivante', '→')}
  </div>`;
}

function openCardModal(name) {
  const card = find(name); if (!card) return;
  const rouvre = ok => { if (ok && document.getElementById('dlg') && document.getElementById('dlg').open) openCardModal(name); };
  chercheVerso(card).then(rouvre);
  chercheTexte(card).then(rouvre);
  chercheImpressions(card).then(rouvre);
  cacherApercu();
  const dispo = availableFor(card), offre = dispo > 0 ? null : bestOffer(card);
  /* Une carte garée dans une liste annexe remonte au deck telle quelle : elle
     y est déjà, il n'y a rien à acheter pour l'y mettre. */
  const annexe = annexeDe(card.name);
  const actions = [
    annexe
      ? `<button type="button" class="btn pri" data-act="toDeck" data-name="${esc(card.name)}">Remonter dans le deck</button>`
      : dispo > 0
      ? `<button type="button" class="btn pri" data-act="toDeck" data-name="${esc(card.name)}">Ajouter au deck</button>`
      : (offre ? `<button type="button" class="btn pri" data-act="buy" data-name="${esc(card.name)}">Acheter + ajouter</button>` : ''),
    (S.deck.get(card.name) || 0) ? `<button type="button" class="btn" data-act="fromDeck" data-name="${esc(card.name)}">Retirer du deck</button>` : '',
    /* Les deux listes annexes : y poser la carte, ou l'en retirer. */
    ...CLES_ANNEXES.map(cle => annexeDe(card.name) === cle
      ? `<button type="button" class="btn" data-act="dropAnnexe" data-liste="${cle}" data-name="${esc(card.name)}">${esc(ANNEXES[cle].retirer)}</button>`
      : `<button type="button" class="btn" data-act="toAnnexe" data-liste="${cle}" data-name="${esc(card.name)}" title="${esc(ANNEXES[cle].aide)}">${esc(ANNEXES[cle].poser)}</button>`),
    `<a class="btn" href="${esc(cmLink(card))}" target="_blank" rel="noopener">Cardmarket ↗</a>`,
    `<button type="button" class="btn" data-act="closeDialog">Fermer</button>`
  ].filter(Boolean).join('');
  /* Le fil de lecture suit la carte affichée : une fiche rouverte sur place —
     après un ajout au deck, une face retournée, une réponse de Scryfall —
     garde son rang, et une fiche ouverte hors de la liste parcourue le rompt
     plutôt que de laisser deux flèches mener ailleurs. */
  const rang = PARCOURS_FICHE.noms.indexOf(card.name);
  if (rang >= 0) PARCOURS_FICHE.i = rang;
  else if (PARCOURS_FICHE.noms.length) PARCOURS_FICHE = {noms: [], i: -1};

  openDialog(card.name, ficheHTML(card), actions, true, enteteFiche(card.name));
}
