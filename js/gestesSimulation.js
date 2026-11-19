/* =====================================================================
   js/gestesSimulation.js — Les gestes de la section « Simulation »

   Lancer et arrêter un lot, décrire une carte à la main, voir un lot,
   revoir une partie. Branché sur l'aiguillage unique de js/app.js,
   comme tous les gestes.
   ===================================================================== */

function gestesSimulation(act, b) {
  switch (act) {
    case 'simLancer': lanceSimulation(); return true;
    case 'simArreter': arreteSimulation(); return true;
    case 'simCollListe': COUV_COLL_OUVERTE[b.dataset.etat] = !COUV_COLL_OUVERTE[b.dataset.etat]; renderK(); return true;
    case 'simComportement': ouvreComportement(b.dataset.carte); return true;
    case 'simCompAppliquer': appliqueComportement(b.dataset.carte); return true;
    case 'simCompEfface': effaceComportement(b.dataset.carte); return true;
    case 'simVoirLot': SIM_RES.vu = b.dataset.lot; renderK(); return true;
    case 'simSupprLot': supprimeLot(b.dataset.lot); renderK(); return true;
    case 'simRevoir': ouvreJournal(b.dataset.lot, +b.dataset.k); return true;
  }
  return false;
}

/* Un réglage de la table : il agit sur-le-champ — rien n'est calculé avant
   « Lancer », il n'y a donc rien à différer. */
function reglageSimulation(t) {
  const c = S.simulation, cle = t.dataset.sim;
  if (cle === 'siege') {
    const i = +t.dataset.i;
    while (c.sieges.length <= i) c.sieges.push('');
    c.sieges[i] = t.value;
  } else if (t.type === 'checkbox') c[cle] = t.checked;
  else if (cle === 'deck' || cle === 'niveauIA') c[cle] = t.value.trim();
  else c[cle] = +t.value;
  renderK();
  scheduleSave();
}
