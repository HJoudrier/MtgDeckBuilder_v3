/* =====================================================================
   js/fenDeck.js — Fenêtre « Configuration du deck »

   Le nom, l'avancement, le format, le budget, et les restrictions — ce filtre
   que le deck porte et qu'on ne peut pas retirer depuis ses puces.

   Une fenêtre à « Appliquer », comme les filtres et les objectifs : le
   brouillon échange `S.decks` entier, si bien que tout ce qui lit le deck
   ouvert — `deckCourant()`, `restrictionsDuDeck()`, `S.budget` — montre déjà
   ce que le bouton donnerait, sans que rien n'ait pris.

   Les sets et les archétypes n'y figurent pas : leurs menus cherchent dans des
   listes chargées à la demande, et les rapatrier ici doublerait la fenêtre des
   filtres pour un critère qu'on ne fige pas sur un deck. Le prédicat les
   accepte pourtant (`js/restrictions.js`), afin qu'un dossier venu d'ailleurs
   qui en porterait soit honoré.
   ===================================================================== */

/* Le deck que la fenêtre règle. Ouverte depuis une vignette, elle porte sa
   clé ; ouverte depuis une puce de restriction, c'est le deck ouvert. */
let deckEnConfig = null;

function dossierEnConfig() {
  return S.decks[deckEnConfig] || deckCourant();
}

function champDeck(cle, label, aide, attrs) {
  return `<div class="field">
    <label class="lab" for="dk_${cle}">${esc(label)}</label>
    <input id="dk_${cle}" data-deckchamp="${cle}" ${attrs} autocomplete="off">
    ${aide ? `<div class="small muted">${aide}</div>` : ''}
  </div>`;
}

function ligneRestriction(kMin, kMax, label, aide, pas) {
  const r = dossierEnConfig().restrictions;
  const champ = (cle, place) => `<input type="number" inputmode="decimal" step="${pas}" min="0"
      id="r_${cle}" data-restr="${cle}" value="${esc(r[cle])}" placeholder="${place}" aria-label="${esc(label)} ${place}">`;
  return `<div class="filtre-ligne">
    <span class="filtre-nom" title="${esc(aide)}">${esc(label)}</span>
    <label class="lab" for="r_${kMin}">min</label>${champ(kMin, 'min')}
    <label class="lab" for="r_${kMax}">max</label>${champ(kMax, 'max')}
  </div>`;
}

function corpsDeck() {
  return avecBrouillon(() => {
    const d = dossierEnConfig();
    const r = d.restrictions;
    const f = FORMATS[d.format] || FORMATS.edh;
    const sel = couleursRestriction(r);
    const cout = coutDeck(deckEnConfig || S.deckActif);

    return `<div class="field">
      <label class="lab" for="dk_nom">Nom du deck</label>
      <input id="dk_nom" data-deckchamp="nom" type="text" value="${esc(d.nom)}" placeholder="ex. Elfes de Llanowar" autocomplete="off">
      <div class="small muted">C'est ce nom que porte la pastille de l'en-tête et chaque ligne de la liste d'achats. Deux decks ne peuvent pas le partager : un doublon reçoit un numéro.</div>
    </div>

    <div class="field">
      <label class="lab" for="dk_statut">Où en est-il</label>
      <select id="dk_statut" data-deckchamp="statut">
        ${Object.entries(DECK_STATUTS).map(([k, v]) => `<option value="${k}" ${d.statut === k ? 'selected' : ''}>${esc(v.label)}</option>`).join('')}
      </select>
      <div class="small muted">${esc((DECK_STATUTS[d.statut] || DECK_STATUTS.construction).aide)} Rien n'en dépend que le rangement de la page « Decks » : un deck archivé compte toujours dans la liste d'achats.</div>
    </div>

    <div class="field">
      <label class="lab" for="dk_format">Format de jeu</label>
      <select id="dk_format" data-deckchamp="format">
        ${Object.entries(FORMATS).map(([k, v]) => `<option value="${k}" ${d.format === k ? 'selected' : ''}>${esc(v.label)}</option>`).join('')}
      </select>
      <div class="small muted">${f.size} cartes · max ${f.maxCopies >= 99 ? 'illimité' : f.maxCopies} ex. · ${f.commander ? 'commandant obligatoire' : 'sans commandant'}. Chaque deck a le sien : la légalité, la taille visée et les objectifs par rôle en découlent.</div>
    </div>

    <h4>Budget de ce deck</h4>
    <div class="filtres-grille">
      ${champDeck('budget.total', 'Plafond (€)',
        `Tant qu'il est à zéro, l'atelier ne propose que les cartes de votre collection et n'engage aucun achat pour ce deck.`,
        `type="number" min="0" step="1" value="${d.budget.total || 0}"`)}
      ${champDeck('budget.perCard', 'Prix maximum par carte (€)',
        `Une carte au-dessus n'est plus proposée à l'achat. Le seuil se compare au prix ajusté par vos préférences d'achat.`,
        `type="number" min="0" step="0.5" value="${d.budget.perCard || 0}"`)}
    </div>
    <div class="small muted">Déjà engagé pour ce deck : <b>${eur(cout.total)}</b>${cout.inconnues ? ` (${cout.inconnues} carte(s) sans prix connu)` : ''}. Les préférences d'achat — état, langue, vendeur, pays — valent pour tous les decks et se règlent dans la fenêtre « Budget » de l'en-tête.</div>

    <div class="field">
      <label style="display:flex;align-items:center;gap:8px;font-size:13.5px;color:var(--txt);cursor:pointer">
        <input type="checkbox" data-deckchamp="exemplairesPropres" ${d.exemplairesPropres !== false ? 'checked' : ''} style="width:auto;margin:0">
        Ce deck doit avoir ses propres exemplaires
      </label>
      <div class="small muted">Cochée, sa demande s'ajoute à celle des autres dans la liste d'achats : deux decks voulant chacun un Sol Ring en réclament deux. Décochée, il se partage la collection avec les autres decks décochés — c'est la lecture juste si vous démontez un deck pour en monter un autre.</div>
    </div>

    <h4>Restrictions</h4>
    <div class="small muted" style="margin-bottom:8px">Un filtre que ce deck porte lui-même. Il écarte des cartes partout — collection, graphe, suggestions, catalogue — mais <b>jamais de la liste du deck</b> : une carte déjà montée qui l'enfreint y reste visible, et l'encadré de conformité la signale. Ses puces paraissent dans l'en-tête avec un cadenas : elles ne s'effacent que d'ici.</div>

    <div class="field">
      <label class="lab">Couleurs</label>
      <label style="display:flex;align-items:center;gap:8px;font-size:13.5px;color:var(--txt);cursor:pointer;margin-bottom:6px">
        <input type="checkbox" data-restr="suitCommandant" ${r.suitCommandant ? 'checked' : ''} style="width:auto;margin:0">
        Suivre l'identité couleur du commandant
      </label>
      <div class="head-mana-bar" style="margin-bottom:4px">
        ${COLS.map(([c, title]) => `<button type="button" class="mana-btn sm" data-restrcoul="${c}"
          aria-pressed="${sel ? sel.has(c) : false}" ${r.suitCommandant ? 'disabled' : ''} title="${title}">${symBg(c)}</button>`).join('')}
      </div>
      <select data-restr="modeCouleurs" ${r.suitCommandant ? '' : ''}>
        <option value="identity" ${r.modeCouleurs === 'identity' ? 'selected' : ''}>Tient dans ces couleurs</option>
        <option value="atleast" ${r.modeCouleurs === 'atleast' ? 'selected' : ''}>Porte au moins une de ces couleurs</option>
        <option value="exact" ${r.modeCouleurs === 'exact' ? 'selected' : ''}>Exactement ces couleurs</option>
      </select>
      <div class="small muted">${sel
        ? `En vigueur : ${esc(nomCombinaisonCouleurs(sel))}${r.suitCommandant ? ` — déduites de ${S.commander ? esc(S.commander) : 'aucun commandant désigné pour l\'instant'}` : ''}.`
        : `Aucune couleur imposée. En Commander, cocher « suivre le commandant » évite de reposer la barre de mana à chaque fois qu'on revient sur ce deck.`}</div>
    </div>

    <div class="field">
      <label class="lab" for="r_nom">Nom contient</label>
      <input type="text" id="r_nom" data-restr="nom" value="${esc(r.nom)}" placeholder="ex. Goblin" autocomplete="off">
    </div>
    <div class="field">
      <label class="lab" for="r_type">Type contient</label>
      <input type="text" id="r_type" data-restr="type" value="${esc(r.type)}" placeholder="ex. creature elf" autocomplete="off">
    </div>
    <div class="field">
      <label class="lab" for="r_texte">Texte de règles contient</label>
      <input type="text" id="r_texte" data-restr="texte" value="${esc(r.texte)}" placeholder="ex. landfall" autocomplete="off">
    </div>
    <div class="field">
      <label class="lab">Rôle dans le deck</label>
      <div class="archetypes">
        ${Object.keys(targets()).map(x => `<button type="button" class="arch-btn" data-restrrole="${esc(x)}"
          aria-pressed="${rolesFiltre(r).includes(x)}">${esc(CATLABEL[x] || x)}</button>`).join('')}
      </div>
    </div>
    <div class="filtres-grille">
      ${ligneRestriction('cmcMin', 'cmcMax', 'Coût de mana', 'Valeur de mana totale de la carte.', '1')}
      ${ligneRestriction('prixMin', 'prixMax', 'Prix (€)', 'Prix unitaire estimé, en euros.', 'any')}
      ${ligneRestriction('forceMin', 'forceMax', 'Force', 'Force des créatures.', '1')}
      ${ligneRestriction('enduranceMin', 'enduranceMax', 'Endurance', 'Endurance des créatures.', '1')}
    </div>
    <div class="field">
      <label class="lab" for="r_artiste">Illustrateur</label>
      <input type="text" id="r_artiste" data-restr="artiste" value="${esc(r.artiste)}" placeholder="ex. Rebecca Guay" autocomplete="off">
    </div>
    <div class="warnbox" id="deckResume">${resumeDeckConfig()}</div>`;
  });
}

/* Ce que « Appliquer » donnerait, en une phrase. Comme le décompte de la
   fenêtre des filtres, c'est le seul morceau que la frappe rafraîchit :
   réécrire le corps volerait le curseur du champ qu'on est en train de
   remplir. */
function resumeDeckConfig() {
  return avecBrouillon(() => {
    const d = dossierEnConfig();
    const rest = filtresActifs(d.restrictions).length + (couleursRestriction(d.restrictions) ? 1 : 0);
    return `<b>${esc(d.nom)}</b> — ${esc((FORMATS[d.format] || FORMATS.edh).label)}, `
      + (d.budget.total > 0 ? `budget ${eur(d.budget.total)}` : 'sans budget')
      + `, ${rest ? `${rest} restriction${rest > 1 ? 's' : ''}` : 'aucune restriction'}`
      + `, ${d.exemplairesPropres !== false ? 'exemplaires propres' : 'exemplaires partagés'}.`;
  });
}

function majResumeDeck() {
  const el = document.getElementById('deckResume');
  if (el) el.innerHTML = resumeDeckConfig();
}

/* Réécrit la fenêtre entière : cocher une couleur, un rôle ou « suivre le
   commandant » change ce que les autres champs doivent montrer. */
function majFenetreDeck() {
  const dlg = document.getElementById('dlg');
  if (!dlg || !dlg.open) return;
  const corps = document.getElementById('dlgBody');
  if (!corps || !corps.querySelector('#dk_nom')) return;
  const y = corps.scrollTop;
  corps.innerHTML = corpsDeck();
  corps.scrollTop = y;
}

async function appliquerDeck() {
  const cle = deckEnConfig || S.deckActif;
  verseBrouillon();
  /* Le nom passe par `renommerDeck()` plutôt que d'être écrit tel quel : lui
     seul écarte un doublon, et deux decks du même nom seraient indiscernables
     dans la pastille comme dans la liste d'achats. */
  if (S.decks[cle]) { renommerDeck(cle, S.decks[cle].nom); S.decks[cle].maj = Date.now(); }
  invaliderAchats();
  await filtrerAvecProgression();
  closeDialog();
}

function openDeckModal(cle) {
  deckEnConfig = S.decks[cle] ? cle : S.deckActif;
  openDialog(`Configuration de « ${S.decks[deckEnConfig].nom} »`, corpsDeck(),
    `<button type="button" class="btn" data-act="closeDialog">Annuler</button>
     <button type="button" class="btn" data-act="reinitRestrictions">Lever les restrictions</button>
     <button type="button" class="btn pri" data-act="appliquerDeck">Appliquer</button>
     ${zoneProgression()}`);
  /* Après `openDialog`, qui remet le brouillon à zéro. Le brouillon porte
     `decks` entier : le dossier réglé en fait partie, et rien de ce qu'on
     touche ici n'agit avant le bouton. */
  ouvreBrouillon(['decks'], majFenetreDeck);
}
