/* =====================================================================
   js/rendu.js — Le rendu d'ensemble

   `renderAll()` : l'unique porte par laquelle l'atelier se repeint en entier, et
   le liseré qui signale un travail de fond là où on peut le voir.
   ===================================================================== */

/* Un travail de fond se signale là où on peut le voir : le liseré sur la
   section quand elle est sous les yeux, un point sur l'onglet qui la porte
   quand on regarde ailleurs. */
function signalerTravail(idSection, actif, texte) {
  const cle = ongletDeSection(idSection);
  const b = document.querySelector(`#onglets [data-onglet="${cle}"]`);
  if (!b) return;
  b.classList.toggle('travaille', !!actif && S.onglet !== cle);
  if (actif && texte && S.onglet !== cle) b.title = texte;
  else if (!actif || S.onglet === cle) b.removeAttribute('title');
}

function renderAll() {
  /* La bonne page d'abord : au premier rendu, rien ne doit paraître de celles
     qu'on ne demande pas. */
  renderOnglets();
  renderTop();
  renderB();
  renderC();
  renderD();
  renderE();
  renderSuggestions();
  scheduleSave();
}

