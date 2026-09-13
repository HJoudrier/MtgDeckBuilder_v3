/* =====================================================================
   js/fenBudget.js — Fenêtre « Budget »

   Ouverte depuis la pastille de l'en-tête : le budget total, le prix maximum
   par carte et les préférences qui font l'estimation — état, langue, type de
   vendeur, pays. C'était le panneau « Achats sur Cardmarket » de l'ancienne
   section Suggestions.

   Comme les fenêtres Filtres et Format, ses réglages attendent « Appliquer » :
   un budget se cherche par tâtonnements, et chaque chiffre essayé relancerait
   sinon la notation des candidates. Le résumé et la liste des achats se
   peignent, eux, sous le brouillon : ils annoncent ce que « Appliquer »
   donnerait.
   ===================================================================== */

function champBudget(id, label, cle, liste) {
  return `<div class="field"><label class="lab" for="${id}">${esc(label)}</label>
      <select id="${id}" data-bud="${cle}">${liste.map(([k, l]) =>
        `<option value="${k}" ${S.budget[cle] === k ? 'selected' : ''}>${esc(l)}</option>`).join('')}</select></div>`;
}

function corpsBudget() {
  return avecBrouillon(() => {
    /* Le rappel des achats n'existe que si le deck réclame des cartes :
       sans lui, la mise en garde n'a rien à annoncer. */
    const achats = ligneAchats();
    return `<div class="field">
      <div class="row">
        <div class="field"><label class="lab" for="bT">Budget total (€)</label>
          <input id="bT" type="number" min="0" step="1" value="${S.budget.total}" data-bud="total" style="width:96px"></div>
        <div class="field"><label class="lab" for="bP">Prix max / carte (€)</label>
          <input id="bP" type="number" min="0" step="1" value="${S.budget.perCard}" data-bud="perCard" style="width:96px"></div>
        ${champBudget('bQ', 'État minimum', 'condition', CONDITIONS.map(([k, l]) => [k, `${k} — ${l}`]))}
        ${champBudget('bL', 'Langue', 'lang', CM_LANGS)}
        ${champBudget('bS', 'Type de vendeur', 'sellerType', SELLER_TYPES)}
        ${champBudget('bC', 'Pays du vendeur', 'country', CM_COUNTRIES)}
      </div>
      <div class="small muted" style="margin-top:6px" id="budLine">${ligneBudget()}</div>
      <div class="small muted" style="margin-top:4px">Prix de référence : tendance Cardmarket, relayée par Scryfall et rafraîchie avec les visuels. L'état, la langue et le type de vendeur ajustent une <b>estimation</b> : les offres réelles se consultent sur la fiche <a class="small" style="color:var(--brass)" href="https://www.cardmarket.com/fr/Magic" target="_blank" rel="noopener">cardmarket.com ↗</a>, via le lien de chaque carte.</div>
      <div class="warnbox">Ces réglages attendent « Appliquer » : le budget ne borne les suggestions qu'une fois validé.${achats
        ? ' Le rappel des achats montre déjà ce que cela donnerait ; l\'export de la wants list, lui, agit aussitôt et quitte cette fenêtre sans rien appliquer.'
        : ''}</div>
      <div id="budBuys">${achats}</div>
      <div class="small muted" style="margin-top:6px">Pas de connexion à votre compte : Cardmarket n'ouvre plus son API aux nouvelles applications et interdit le partage d'identifiants, et une page web ne peut pas signer les requêtes OAuth sans exposer le secret. L'atelier s'appuie donc sur les prix Cardmarket publiés par Scryfall, et vous renvoie vers la fiche du site pour l'achat.</div>
    </div>`;
  });
}

/* Un chiffre saisi ne réécrit pas la fenêtre — le curseur y serait perdu :
   seuls le budget restant et la liste des achats suivent, sous le brouillon. */
function majResumeBudget() {
  const bl = document.getElementById('budLine');
  const bb = document.getElementById('budBuys');
  if (!bl && !bb) return;
  avecBrouillon(() => {
    if (bl) bl.innerHTML = ligneBudget();
    if (bb) bb.innerHTML = ligneAchats();
  });
}

/* « Appliquer » verse le brouillon puis recalcule : le prix maximum par
   carte entre dans la signature des candidates, tout est à reprendre. */
async function appliquerBudget() {
  verseBrouillon();
  await filtrerAvecProgression();
  closeDialog();
}

function openBudgetModal() {
  openDialog('Achats sur Cardmarket', corpsBudget(),
    `<button type="button" class="btn" data-act="closeDialog">Annuler</button>
     <button type="button" class="btn pri" data-act="appliquerBudget">Appliquer</button>
     ${zoneProgression()}`);
  /* Après `openDialog`, qui remet le brouillon à zéro. */
  ouvreBrouillon(['budget'], majResumeBudget);
}

