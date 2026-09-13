/* =====================================================================
   js/gestesDecks.js — Les gestes des decks

   Créer, ouvrir, configurer, dupliquer, supprimer ; et, dans la liste
   d'achats, exporter les wants de tous les decks à la fois.

   Un maillon de la cascade de `js/app.js`, comme les autres : il rend `true`
   s'il a traité le geste.
   ===================================================================== */

function gestesDecks(act, b) {
  if (act === 'ongletDecks') { activerOnglet('decks'); return true; }

  if (act === 'nouveauDeck') {
    /* Un deck neuf hérite du format de celui qu'on quitte : on en monte
       rarement un de cent cartes après un de soixante, et le contraire se
       règle d'un menu dans sa configuration. */
    const cle = creerDeck('Deck', {format: S.format});
    activerDeck(cle);
    openDeckModal(cle);
    toast(`« ${S.decks[cle].nom} » créé : nommez-le et posez ses règles.`);
    return true;
  }

  if (act === 'activerDeck') {
    const cle = b.dataset.deck;
    if (activerDeck(cle)) toast(`Vous travaillez sur « ${S.decks[cle].nom} ».`);
    return true;
  }

  if (act === 'configDeck') { openDeckModal(b.dataset.deck); return true; }
  if (act === 'appliquerDeck') { appliquerDeck(); return true; }

  if (act === 'reinitRestrictions') {
    modifieBrouillon(() => reinitRestrictions());
    apresReglage('Restrictions levées : les cartes qu\'elles écartaient reviennent.');
    majResumeDeck();
    return true;
  }

  if (act === 'dupliquerDeck') {
    const cle = dupliquerDeck(b.dataset.deck);
    if (!cle) return true;
    renderI();
    toast(`« ${S.decks[cle].nom} » créé à partir de « ${S.decks[b.dataset.deck].nom} ».`);
    scheduleSave();
    return true;
  }

  /* Supprimer un deck emporte sa liste, sa réserve, son étude et ses
     réglages ; la collection, elle, n'y est pour rien. La fenêtre dit ce
     qu'on perd avant de le perdre. */
  if (act === 'supprimerDeck') {
    const cle = b.dataset.deck;
    const d = S.decks[cle];
    if (!d) return true;
    const bl = bilanDeck(cle);
    openDialog(`Supprimer « ${d.nom} » ?`,
      `<p>Ce deck emporte ses <b>${bl.cartes} carte(s)</b>${bl.annexes ? ` et les ${bl.annexes} de sa réserve et de son étude` : ''}, son format, son budget et ses restrictions.</p>
       <p class="small muted">Votre collection n'est pas touchée : les exemplaires que vous possédez y restent. Les autres decks non plus — mais la liste d'achats se réduira d'autant, puisque ce deck ne demandera plus rien.</p>`,
      `<button type="button" class="btn" data-act="closeDialog">Annuler</button>
       <button type="button" class="btn danger" data-act="supprimerDeckOui" data-deck="${esc(cle)}">Supprimer ce deck</button>`);
    return true;
  }

  if (act === 'supprimerDeckOui') {
    const cle = b.dataset.deck;
    const nom = S.decks[cle] ? S.decks[cle].nom : '';
    if (supprimerDeck(cle)) {
      closeDialog();
      recalculerAvecProgression(`« ${nom} » supprimé : les suggestions sont reprises pour « ${deckCourant().nom} ».`);
      renderAll();
      toast(`« ${nom} » supprimé.`);
    }
    return true;
  }

  if (act === 'wantsTout') { openWantsModal(true); return true; }

  return false;
}

/* La frappe et les cases de la fenêtre de configuration. Comme ailleurs, tout
   va au brouillon : le corps n'est réécrit que par ce qui change ce que les
   autres champs doivent montrer — une couleur, un rôle, « suivre le
   commandant » —, sans quoi le curseur du champ en cours serait emporté. */
function saisieDeck(t) {
  if (t.dataset.deckchamp) {
    const cle = t.dataset.deckchamp;
    modifieBrouillon(() => {
      const d = dossierEnConfig();
      const v = t.type === 'checkbox' ? t.checked
              : (t.type === 'number' ? (parseFloat(t.value) || 0) : t.value);
      if (cle.startsWith('budget.')) d.budget[cle.slice(7)] = v;
      else d[cle] = v;
    });
    if (t.dataset.deckchamp === 'format' || t.type === 'checkbox') majFenetreDeck();
    else majResumeDeck();
    return true;
  }
  if (t.dataset.restr) {
    const cle = t.dataset.restr;
    modifieBrouillon(() => majRestriction(cle, t.type === 'checkbox' ? t.checked : t.value));
    if (t.type === 'checkbox' || cle === 'modeCouleurs') majFenetreDeck();
    else majResumeDeck();
    return true;
  }
  return false;
}

/* Les deux bascules de la fenêtre : une couleur, un rôle. Elles réécrivent le
   corps, n'ayant pas de curseur à préserver. */
function gestesDeckConfig(act, b) {
  if (b.dataset.restrcoul) {
    modifieBrouillon(() => {
      const r = restrictionsDuDeck();
      const sel = new Set(String(r.couleurs || '').split('').filter(Boolean));
      const c = b.dataset.restrcoul;
      if (sel.has(c)) sel.delete(c); else sel.add(c);
      r.couleurs = 'WUBRGC'.split('').filter(x => sel.has(x)).join('');
    });
    majFenetreDeck();
    return true;
  }
  if (b.dataset.restrrole) {
    modifieBrouillon(() => {
      const r = restrictionsDuDeck();
      const sel = new Set(rolesFiltre(r));
      const x = b.dataset.restrrole;
      if (sel.has(x)) sel.delete(x); else sel.add(x);
      r.roles = [...sel].join(',');
    });
    majFenetreDeck();
    return true;
  }
  return false;
}
