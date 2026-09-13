/* =====================================================================
   js/fenBudget.js — Fenêtre « Budget »

   Ouverte depuis la pastille de l'en-tête. Elle règle deux choses de nature
   différente, et le dit : le **budget du deck ouvert** — son plafond, son prix
   maximum par carte —, qui est une intention propre à ce deck-là ; et les
   **préférences d'achat** — état, langue, type de vendeur, pays —, qui disent
   comment on achète et valent pour tous les decks. Les premières vivent dans
   le dossier du deck, les secondes dans `S.achats`. C'était le panneau
   « Achats sur Cardmarket » de l'ancienne section Suggestions.

   Comme les fenêtres Filtres et Format, ses réglages attendent « Appliquer » :
   un budget se cherche par tâtonnements, et chaque chiffre essayé relancerait
   sinon la notation des candidates. Le résumé et la liste des achats se
   peignent, eux, sous le brouillon : ils annoncent ce que « Appliquer »
   donnerait.
   ===================================================================== */

function champBudget(id, label, cle, liste) {
  return `<div class="field"><label class="lab" for="${id}">${esc(label)}</label>
      <select id="${id}" data-bud="${cle}">${liste.map(([k, l]) =>
        `<option value="${k}" ${S.achats[cle] === k ? 'selected' : ''}>${esc(l)}</option>`).join('')}</select></div>`;
}

function corpsBudget() {
  return avecBrouillon(() => {
    /* Le rappel des achats n'existe que si le deck réclame des cartes :
       sans lui, la mise en garde n'a rien à annoncer. */
    const achats = ligneAchats();
    return `<div class="field">
      <h4>Le budget de « ${esc(deckCourant().nom)} »</h4>
      <div class="row">
        <div class="field"><label class="lab" for="bT">Plafond (€)</label>
          <input id="bT" type="number" min="0" step="1" value="${S.budget.total}" data-bud="total" style="width:96px"></div>
        <div class="field"><label class="lab" for="bP">Prix max / carte (€)</label>
          <input id="bP" type="number" min="0" step="1" value="${S.budget.perCard}" data-bud="perCard" style="width:96px"></div>
      </div>
      <div class="small muted">Chaque deck a le sien, et se règle aussi depuis sa configuration, page « Decks ». La liste d'achats de tous les decks, elle, ne connaît aucun plafond : elle dit ce qu'il faut acheter, pas ce qu'on s'autorise.</div>
      <h4 style="margin-top:12px">Vos préférences d'achat</h4>
      <div class="row">
        ${champBudget('bQ', 'État minimum', 'condition', CONDITIONS.map(([k, l]) => [k, `${k} — ${l}`]))}
        ${champBudget('bL', 'Langue', 'lang', CM_LANGS)}
        ${champBudget('bS', 'Type de vendeur', 'sellerType', SELLER_TYPES)}
        ${champBudget('bC', 'Pays du vendeur', 'country', CM_COUNTRIES)}
      </div>
      <div class="small muted">Celles-ci valent pour tous vos decks : elles disent comment vous achetez, non ce que vous achetez.</div>
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

/* La saisie de la fenêtre. Le plafond et le prix maximum par carte
   appartiennent au deck ouvert ; l'état, la langue, le vendeur et le pays
   disent comment on achète et valent pour tous les decks. Une même fenêtre
   règle les deux, d'où cet aiguillage. */
function saisieBudget(t) {
  if (!t.dataset.bud) return false;
  const k = t.dataset.bud;
  modifieBrouillon(() => {
    const cible = (k === 'total' || k === 'perCard') ? S.budget : S.achats;
    cible[k] = t.type === 'number' ? (parseFloat(t.value) || 0) : t.value;
  });
  /* Rien n'est appliqué avant le bouton : seul le résumé suit, réécrire le
     corps volerait le curseur du champ qu'on est en train de régler. */
  if (brouillon) { majResumeBudget(); return true; }
  invaliderCandidats();
  invaliderAchats();
  refreshSuggestions();
  return true;
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
  ouvreBrouillon(['budget', 'achats'], majResumeBudget);
}

