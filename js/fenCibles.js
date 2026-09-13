/* =====================================================================
   js/fenCibles.js — Fenêtre « Objectifs par rôle »

   Ouverte par le pinceau du titre « Équilibre des rôles » (section Deck). Le
   format propose des repères — trente-six terrains pour cent cartes, dix de
   ramp —, tirés de l'usage et non d'une règle : cette fenêtre les règle. Un
   champ par rôle, le décompte du deck en regard, et rien n'agit avant
   « Appliquer » : les cibles pèsent dans la notation des suggestions, et
   renoter à chaque frappe coûterait une seconde pour un chiffre qu'on n'a pas
   fini de taper.

   Les champs vivaient dans les jauges elles-mêmes, le temps d'un mode. Mais
   une jauge est un filtre : lui faire porter tantôt un bouton, tantôt un
   champ, c'était un geste pour deux intentions.
   ===================================================================== */

/* Une ligne : le rôle, ce que le deck en porte, ce que le format propose, et
   le champ. La valeur par défaut est dite plutôt que devinée — c'est ce que
   « Réinitialiser » rendra. */
function ligneCible(role, val, tgt, defaut) {
  const regle = tgt !== defaut;
  const id = `cible-${esc(role)}`;
  return `<div class="cible-l">
    <div class="cible-nom">
      <label for="${id}">${esc(CATLABEL[role] || role)}${regle
        ? ' <span class="cible-marque" title="Objectif réglé à la main">•</span>' : ''}</label>
      <div class="small muted">${val} dans le deck · ${defaut} proposé${defaut > 1 ? 's' : ''} par ${esc(fmt().label)}</div>
    </div>
    <input type="number" id="${id}" class="cible-champ" data-role-cible="${esc(role)}"
      min="0" max="${fmt().size}" step="1" value="${tgt}" aria-label="Objectif : ${esc(CATLABEL[role] || role)}">
  </div>`;
}

function corpsCibles() {
  /* Sous le brouillon : les champs montrent ce qu'on est en train de régler,
     non ce qui est en vigueur. */
  return avecBrouillon(() => {
    const base = ciblesParDefaut(), tgt = targets(), cnt = deckCounts();
    const n = Object.keys(ciblesReglees()).length;
    return `<div class="cibles-grille">
        ${Object.keys(base).map(r => ligneCible(r, cnt[r] || 0, tgt[r], base[r])).join('')}
      </div>
      <div class="small muted">Ces objectifs ne sont pas une règle : ils disent ce que le deck vise, et l'atelier
        s'en sert deux fois — les jauges les montrent, et la notation en tire ce qui manque au deck pour
        classer les suggestions. Ils appartiennent au format en cours (${esc(fmt().label)}) : un autre format
        garde les siens.</div>
      <div class="small muted">${n ? `${n} objectif(s) réglé(s) à la main.` : 'Aucun objectif réglé : tous suivent le format.'}
        « Réinitialiser » les rend tous à ce que le format propose.</div>`;
  });
}

/* Réécrite après « Réinitialiser » : les champs reprennent les valeurs du
   format. Pendant la frappe, rien n'est réécrit — la fenêtre emporterait le
   champ qu'on est en train de remplir. */
function majFenetreCibles() {
  const dlg = document.getElementById('dlg');
  if (!dlg || !dlg.open) return;
  const corps = document.getElementById('dlgBody');
  if (!corps || !corps.querySelector('[data-role-cible]')) return;
  const y = corps.scrollTop;
  corps.innerHTML = corpsCibles();
  corps.scrollTop = y;
}

/* « Appliquer » verse le brouillon, puis renote : les suggestions pèsent ce
   qui manque au deck, et ce qui manque vient de changer. */
async function appliquerCibles() {
  verseBrouillon();
  await filtrerAvecProgression();
  closeDialog();
}

function openCiblesModal() {
  openDialog('Objectifs par rôle', corpsCibles(),
    `<button type="button" class="btn foot-g" data-act="reinitCibles">Réinitialiser</button>
     <button type="button" class="btn" data-act="closeDialog">Annuler</button>
     <button type="button" class="btn pri" data-act="appliquerCibles">Appliquer</button>
     ${zoneProgression()}`);
  /* Après `openDialog`, qui remet le brouillon à zéro. */
  ouvreBrouillon(['ciblesRoles'], majFenetreCibles);
}
