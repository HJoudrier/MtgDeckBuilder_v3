/* =====================================================================
   js/sugEdhrec.js — La section EDHREC : ce que les decks recensés recommandent

   Le panneau du commandant est rendu à part (il ne dépend pas de la
   sélection) ; voici les cartes que les decks recensés recommandent parmi
   celles qu'on pourrait ajouter. Elle se range comme les autres — sa barre,
   son bouton « Affichage », son groupement et son tri sous la clé `edhrec` —
   et offre en plus les deux tris qui n'ont de sens qu'ici : le taux
   d'inclusion et la synergie, tels qu'EDHREC les publie.
   ===================================================================== */

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
  visuelsGroupes('edhrec', groupes, mode);

  return `<div class="row" style="margin-bottom:10px">
      ${boutonAffichage('edhrec')}
      <span class="small muted">${total} recommandation(s)${noteMultiple(mode)} · ${budInfo}</span>
    </div>
    ${plat ? '' : `<div class="small muted" style="margin-bottom:8px">${titreEDH}</div>`}
    ${listesSug('edhrec', groupes, mode, titreEDH, '#2f6b68')}
    ${renvoiCatalogue('Ces cartes portent l\'étiquette <b>edhrec</b> partout où elles paraissent.')}`;
}
