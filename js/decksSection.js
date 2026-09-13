/* =====================================================================
   js/decksSection.js — La section « Mes decks »

   Une vignette par deck : ce qu'il pèse, ce qu'il possède, ce qu'il reste à
   acheter, son budget et ses restrictions. On y choisit celui sur lequel on
   travaille, on en crée, on en duplique, on en supprime.

   Les chiffres sont lus sur chaque dossier (`bilanDeck()`, js/decks.js) et non
   sur `S` : la page montre huit decks sans avoir à basculer sur chacun, ce
   qu'un recalcul complet suivrait à chaque ligne.
   ===================================================================== */

/* Ce que coûte encore un deck, sans passer par `aAcheter()` : on ne veut pas
   d'une estimation d'offre par carte manquante pour chacun des huit decks à
   chaque rendu de la page. Le prix de tendance ajusté suffit à en donner
   l'ordre de grandeur, et la liste d'achats donne le compte exact. */
function coutDeck(cle) {
  const d = S.decks[cle];
  let total = 0, inconnues = 0;
  d.deck.forEach((q, nom) => {
    const c = find(nom); if (!c) return;
    const manque = Math.max(0, q - quantiteCollection(nom));
    if (!manque) return;
    if (c.price > 0) total += Math.round(c.price * multiplicateurAchat() * 100) / 100 * manque;
    else inconnues += manque;
  });
  return {total, inconnues};
}

function puceStatut(d) {
  const st = DECK_STATUTS[d.statut] || DECK_STATUTS.construction;
  return `<span class="pill statut-${esc(d.statut)}" title="${esc(st.aide)}">${esc(st.label)}</span>`;
}

function vignetteDeck(cle) {
  const b = bilanDeck(cle);
  const d = b.deck;
  const actif = cle === S.deckActif;
  const cout = coutDeck(cle);
  const plafond = d.budget.total || 0;
  const depasse = plafond > 0 && cout.total > plafond;
  const {pct, col} = remplissageJauge(b.cartes, b.format.size);
  /* Les restrictions d'un deck ne se lisent que pour le deck ouvert — elles
     dépendent de son commandant quand elles le suivent, et `restrictionsDuDeck()`
     ne connaît que le dossier ouvert. Pour les autres, on annonce leur nombre. */
  const rest = actif ? restrictionsActives()
    : (() => {
        const n = filtresActifs(d.restrictions).length
                + (d.restrictions.suitCommandant || d.restrictions.couleurs ? 1 : 0);
        return n ? [{texte:`${n} restriction${n > 1 ? 's' : ''}`}] : [];
      })();

  return `<div class="deck-carte${actif ? ' actif' : ''}">
    <div class="deck-tete">
      <h4>${esc(d.nom)}${actif ? ' <span class="small muted">— ouvert</span>' : ''}</h4>
      ${puceStatut(d)}
      <span class="pill">${esc(b.format.label)}</span>
      ${d.exemplairesPropres === false ? '<span class="pill" title="Ce deck se contente des exemplaires que vous possédez déjà : il partage la collection avec les autres.">exemplaires partagés</span>' : ''}
    </div>
    <div class="track" title="${b.cartes} carte(s) sur ${b.format.size}"><div class="fill" style="width:${pct}%;background:${col}"></div></div>
    <div class="small muted deck-chiffres">
      <span class="mono">${b.cartes}/${b.format.size}</span> cartes ·
      ${b.possede} possédée(s) ·
      ${b.manque ? `<b>${b.manque} à acheter</b>` : 'aucune à acheter'}
      ${cout.total ? ` · ≈ ${eur(cout.total)}` : ''}
      ${cout.inconnues ? ` · ${cout.inconnues} sans prix` : ''}
      ${b.annexes ? ` · ${b.annexes} en réserve ou à l'étude` : ''}
      ${d.commander ? ` · commandant : ${esc(d.commander)}` : ''}
    </div>
    ${plafond > 0 ? `<div class="small ${depasse ? '' : 'muted'}">Budget ${eur(plafond)} — ${depasse
        ? `dépassement de ${eur(cout.total - plafond)}`
        : `reste ${eur(plafond - cout.total)}`}</div>` : ''}
    ${rest.length ? `<div class="small muted">Restrictions : ${esc(rest.map(a => a.texte).join(' · '))}</div>` : ''}
    <div class="row deck-gestes">
      ${actif
        ? `<button type="button" class="btn sm" data-act="ongletDeck">Ouvrir l'onglet Deck</button>`
        : `<button type="button" class="btn sm pri" data-act="activerDeck" data-deck="${esc(cle)}">Travailler dessus</button>`}
      <button type="button" class="btn sm" data-act="configDeck" data-deck="${esc(cle)}">Configurer</button>
      <button type="button" class="btn sm" data-act="dupliquerDeck" data-deck="${esc(cle)}" title="Repartir de ce deck sans y toucher">Dupliquer</button>
      <button type="button" class="btn sm" data-act="supprimerDeck" data-deck="${esc(cle)}"
        ${clesDecks().length <= 1 ? 'disabled title="Le dernier deck ne se supprime pas : l\'atelier travaille toujours sur l\'un d\'eux."' : 'title="Supprimer ce deck"'}>Supprimer</button>
    </div>
  </div>`;
}

function renderI() {
  const corps = document.getElementById('bodyI');
  const indice = document.getElementById('hintI');
  if (!corps) return;
  const cles = clesDecks();
  if (indice) {
    const montes = cles.filter(c => S.decks[c].deck.size).length;
    indice.textContent = `${cles.length} deck${cles.length > 1 ? 's' : ''}`
      + (montes < cles.length ? ` · ${cles.length - montes} encore vide${cles.length - montes > 1 ? 's' : ''}` : '');
  }
  corps.innerHTML = `
    <div class="row" style="margin-bottom:10px">
      <button type="button" class="btn pri" data-act="nouveauDeck">Nouveau deck</button>
      <span class="small muted">Un deck porte ses propres cartes, son format, son budget et ses restrictions. La collection, elle, est commune à tous.</span>
    </div>
    <div class="decks-grille">${cles.map(vignetteDeck).join('')}</div>`;
}
