/* =====================================================================
   js/acquisitionSection.js — La section « Acquisition en cours »

   Les cartes commandées et pas encore reçues. Elles ne sont plus dans la
   liste d'achats — on les a achetées — mais pas non plus dans la collection
   — on ne les tient pas : un entre-deux, qui retombe d'un côté ou de l'autre.
   « Reçue » les verse à la collection ; « Annuler » les rend à la liste
   d'achats.

   Tant qu'elles sont en route, elles ne pèsent plus sur le budget : les
   paniers des decks (`js/achats.js`) les comptent comme couvertes.
   ===================================================================== */

function ligneAcquisition(l) {
  return `<div class="lrow">
    <span class="dot" style="background:${stripeColor(l.card)}"></span>
    <button type="button" class="cname cref" data-act="fiche" data-name="${esc(l.card.name)}">${esc(l.card.name)}</button>
    <span class="mono small">×${l.qty}</span>
    <span class="mono small">${l.inconnu ? 'prix inconnu' : `≈ ${eur(l.total)}`}</span>
    <button type="button" class="btn sm" data-act="recue" data-name="${esc(l.card.name)}"
      title="Le colis est arrivé : verser ${l.qty} exemplaire(s) à la collection">Reçue ✓</button>
    <button type="button" class="btn sm" data-act="annulerCommande" data-name="${esc(l.card.name)}"
      title="La commande n'a pas eu lieu : la carte retourne dans la liste d'achats">Annuler</button>
  </div>`;
}

function renderL() {
  const corps = document.getElementById('bodyL');
  const indice = document.getElementById('hintL');
  if (!corps) return;
  const lignes = acquisitionsEnCours();
  const exemplaires = lignes.reduce((n, l) => n + l.qty, 0);
  const total = lignes.reduce((t, l) => t + l.total, 0);
  if (indice) indice.textContent = lignes.length
    ? `${exemplaires} exemplaire(s) · ${eur(total)}`
    : 'aucune commande en route';

  if (!lignes.length) {
    corps.innerHTML = `<div class="small muted">Aucune commande en route. « Commandée », sur une ligne de la liste d'achats, l'amène ici le temps que le colis arrive.</div>`;
    return;
  }
  corps.innerHTML = `
    <div class="small muted" style="margin-bottom:8px">
      Commandées, pas encore reçues : hors de la collection, hors de la liste d'achats, et elles ne pèsent plus sur le budget des decks.
    </div>
    <div class="list">${lignes.map(ligneAcquisition).join('')}</div>`;
}
