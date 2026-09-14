/* =====================================================================
   js/differe.js — Les propositions ne se notent que sous les yeux

   Noter le vivier est le temps long de l'atelier : des dizaines de milliers de
   cartes, et le résultat ne sert qu'aux trois listes de propositions — les
   pistes du graphe, les recommandations d'EDHREC, le classement du catalogue.
   On le payait pourtant à chaque geste, y compris en travaillant dans l'onglet
   Deck où l'on ne veut voir bouger que la courbe de mana et les jauges.

   Ce fichier tient la règle inverse : hors de vue, la notation est remise à
   plus tard, et l'onglet porte un point qui dit que sa page a vieilli. La
   bascule vers cette page la reprend alors, annoncée comme n'importe quel
   recalcul.

   Les trois sections sont différées ensemble parce qu'elles lisent une même
   sélection notée (`selectionSuggestions()`, js/sugListes.js) : n'en différer
   qu'une ne gagnerait rien, les deux autres redemandant la même notation. Le
   reste de l'atelier — la fiche d'une carte, l'analyse et le dessin du graphe,
   les scores du deck, la collection, la liste d'achats — ne connaît pas ce
   délai et se refait à chaque geste.
   ===================================================================== */

/* Une page de propositions attend d'être reprise. C'est le fil d'une séance,
   pas un réglage : rien n'en va dans `snapshot()`. */
let SUG_PERIME = false;

/* L'onglet ouvert porte-t-il une des trois listes ? `ONGLETS` et
   `SECTIONS_SUGGESTIONS` (js/etat.js) en décident seules, comme partout où la
   répartition des sections est en jeu. */
function suggestionsVisibles() {
  const sections = (ONGLETS[S.onglet] || {}).sections || [];
  return sections.some(id => SECTIONS_SUGGESTIONS.includes(id));
}

/* Le point d'un onglet dont la page a vieilli : posé, là où celui d'un travail
   de fond bat (`signalerTravail()`, js/rendu.js). Jamais sur l'onglet ouvert —
   sa page est à jour par construction, puisque c'est sa visite qui la reprend. */
function marqueOngletsPerimes(actif) {
  SECTIONS_SUGGESTIONS.forEach(id => {
    const cle = ongletDeSection(id);
    const b = document.querySelector(`#onglets [data-onglet="${cle}"]`);
    if (!b) return;
    const pose = !!actif && S.onglet !== cle;
    b.classList.toggle('perime', pose);
    if (pose && !b.classList.contains('travaille'))
      b.title = 'Le deck ou les filtres ont changé : les propositions de cette page seront reprises à son ouverture.';
    else if (!pose && !b.classList.contains('travaille')) b.removeAttribute('title');
  });
}

/* Remettre la notation à plus tard, et le dire. Appelé partout où l'on
   renonce à calculer faute de regard : le rendu des trois sections, et la
   sélection elle-même. */
function differerSuggestions() {
  SUG_PERIME = true;
  marqueOngletsPerimes(true);
}

/* La page qu'on vient d'ouvrir porte une liste périmée : c'est l'instant de la
   reprendre. Deux cas, et la différence se voit — la notation est à refaire,
   ou seul l'affichage a vieilli (une étiquette « dans le deck », une ligne de
   budget), auquel cas les listes se reposent en place sans rien recalculer et
   la bascule reste gratuite. */
function rattraperSuggestions() {
  if (!SUG_PERIME || !suggestionsVisibles()) return;
  SUG_PERIME = false;
  marqueOngletsPerimes(false);
  if (typeof suggestionsAJour === 'function' && suggestionsAJour()) {
    renderSuggestions();
    return;
  }
  recalculerAvecProgression('Les propositions de cette page sont reprises : le deck ou les filtres ont changé depuis votre dernière visite.');
}
