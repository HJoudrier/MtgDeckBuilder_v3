/* =====================================================================
   js/dialogue.js — La fenêtre modale, une à la fois

   Un seul <dialog> sert toutes les fenêtres de l'atelier : on y verse un titre,
   un corps et un pied, et l'ancienne s'efface. D'où la règle qui court partout
   ailleurs — une fenêtre ouverte signifie que le geste vient d'elle.
   ===================================================================== */

/* `entete` : un entête tout fait, quand la fenêtre en veut un autre que le
   titre suivi de sa croix — c'est celui de la fiche d'une carte, où deux
   boutons de parcours encadrent le nom (`enteteFiche`, js/deck.js). Toute
   fenêtre garde ses autres sorties : Échap, l'arrière-plan, le pied. */
function openDialog(title, bodyHTML, actionsHTML, grande, entete) {
  const dlg = document.getElementById('dlg');
  if (!dlg) return;
  /* Une autre fenêtre prend la place : le brouillon des filtres n'a plus
     lieu d'être. */
  brouillon = null;
  dlg.classList.toggle('grand', !!grande);
  dlg.classList.toggle('wide', !!grande);
  const headEl = document.getElementById('dlgTitle') || document.getElementById('dlgHead');
  if (headEl) {
    headEl.innerHTML = entete || `<div style="display:flex;align-items:center;justify-content:space-between;gap:12px;width:100%">
      <h3 style="margin:0;font-size:17px;font-family:var(--display);flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${esc(title)}</h3>
      <button type="button" class="btn sm dlg-close" data-act="closeDialog" style="flex:0 0 auto;padding:2px 8px;line-height:1" title="Fermer la fenêtre (Échap)">✕</button>
    </div>`;
  }
  const bodyEl = document.getElementById('dlgBody');
  if (bodyEl) bodyEl.innerHTML = bodyHTML;
  const footEl = document.getElementById('dlgFoot');
  if (footEl) footEl.innerHTML = actionsHTML || '<button type="button" class="btn" data-act="closeDialog">Fermer</button>';
  if (!dlg.open) {
    dlg.showModal();
  }
}

function closeDialog() {
  const dlg = document.getElementById('dlg');
  if (dlg && dlg.open) dlg.close();
}

