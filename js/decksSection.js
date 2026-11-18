/* =====================================================================
   js/decksSection.js — Les sections « Mes decks » et « Decks externes »

   Une vignette par deck : ce qu'il pèse, ce qu'il possède, ce qu'il reste à
   acheter, son budget et ses restrictions. On y choisit celui sur lequel on
   travaille, on en crée, on en duplique, on en supprime.

   Un deck est à soi ou externe (`d.externe`) : les externes — de tournoi,
   d'un ami, trouvés en ligne — ont leur section, et chaque vignette porte la
   bascule de l'une à l'autre. Les deux sections s'utilisent de la même façon ;
   seule la liste d'achats les distingue (js/achats.js).

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
    const manque = Math.max(0, q - quantiteCollection(nom) - quantiteEnCours(nom));
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
      ${d.externe ? '<span class="pill" title="Un deck que vous n\'avez pas monté : il ne pèse pas sur la liste d\'achats.">externe</span>' : ''}
      ${!d.externe && d.exemplairesPropres === false ? '<span class="pill" title="Ce deck se contente des exemplaires que vous possédez déjà : il partage la collection avec les autres.">exemplaires partagés</span>' : ''}
    </div>
    <div class="track" title="${b.cartes} carte(s) sur ${b.format.size}"><div class="fill" style="width:${pct}%;background:${col}"></div></div>
    <div class="small muted deck-chiffres">
      <span class="mono">${b.cartes}/${b.format.size}</span> cartes ·
      ${b.possede} possédée(s) ·
      ${d.externe ? (b.manque ? `${b.manque} hors de votre collection` : 'toutes dans votre collection')
        : `${b.manque ? `<b>${b.manque} à acheter</b>` : 'aucune à acheter'}
      ${cout.total ? ` · ≈ ${eur(cout.total)}` : ''}
      ${cout.inconnues ? ` · ${cout.inconnues} sans prix` : ''}`}
      ${b.annexes ? ` · ${b.annexes} en réserve ou à l'étude` : ''}
      ${d.commander ? ` · commandant : ${esc(d.commander)}` : ''}
    </div>
    ${plafond > 0 && !d.externe ? `<div class="small ${depasse ? '' : 'muted'}">Budget ${eur(plafond)} — ${depasse
        ? `dépassement de ${eur(cout.total - plafond)}`
        : `reste ${eur(plafond - cout.total)}`}</div>` : ''}
    ${rest.length ? `<div class="small muted">Restrictions : ${esc(rest.map(a => a.texte).join(' · '))}</div>` : ''}
    <div class="row deck-gestes">
      ${actif
        ? `<button type="button" class="btn sm" data-act="ongletDeck">Ouvrir l'onglet Deck</button>`
        : `<button type="button" class="btn sm pri" data-act="activerDeck" data-deck="${esc(cle)}">Travailler dessus</button>`}
      <button type="button" class="btn sm" data-act="configDeck" data-deck="${esc(cle)}">Configurer</button>
      <button type="button" class="btn sm" data-act="basculeExterne" data-deck="${esc(cle)}" title="${d.externe ? 'Le ranger parmi vos decks : ses cartes manquantes rejoindront la liste d\'achats.' : 'Le ranger parmi les decks externes : il ne comptera plus dans la liste d\'achats.'}">${d.externe ? 'C\'est le mien' : 'Marquer externe'}</button>
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
  const miens = cles.filter(c => !S.decks[c].externe), externes = cles.filter(c => S.decks[c].externe);
  if (indice) {
    const montes = miens.filter(c => S.decks[c].deck.size).length;
    indice.textContent = `${miens.length} deck${miens.length > 1 ? 's' : ''}`
      + (montes < miens.length ? ` · ${miens.length - montes} encore vide${miens.length - montes > 1 ? 's' : ''}` : '');
  }
  corps.innerHTML = `
    <div class="row" style="margin-bottom:10px">
      <button type="button" class="btn pri" data-act="nouveauDeck">Nouveau deck</button>
      <span class="small muted">Un deck porte ses propres cartes, son format, son budget et ses restrictions. La collection, elle, est commune à tous.</span>
    </div>
    ${miens.length ? `<div class="decks-grille">${miens.map(vignetteDeck).join('')}</div>`
      : `<div class="empty">Aucun deck à vous pour l'instant : créez-en un, ou rangez un deck externe parmi les vôtres avec « C'est le mien ».</div>`}`;
  renderM(externes);
}

/* La section « Decks externes » : les decks qu'on étudie sans les avoir montés. */
function renderM(externes) {
  const corps = document.getElementById('bodyM');
  const indice = document.getElementById('hintM');
  if (!corps) return;
  externes = externes || clesDecks().filter(c => S.decks[c].externe);
  if (indice) indice.textContent = `${externes.length} deck${externes.length > 1 ? 's' : ''}`;
  corps.innerHTML = `
    <div class="row" style="margin-bottom:10px">
      <button type="button" class="btn" data-act="nouveauDeckExterne">Nouveau deck externe</button>
      <span class="small muted">Des decks de tournoi, d'un ami, trouvés en ligne : on les ouvre, on étudie leurs cartes, on y ajoute les siennes, on les joue et on les simule comme les autres — mais ils n'ajoutent rien à la liste d'achats.</span>
    </div>
    ${externes.length ? `<div class="decks-grille">${externes.map(vignetteDeck).join('')}</div>`
      : `<div class="small muted">Aucun deck externe. « Marquer externe » sur la vignette d'un deck l'range ici.</div>`}`;
}
