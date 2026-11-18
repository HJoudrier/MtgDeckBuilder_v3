/* =====================================================================
   js/gestesAcquisition.js — Les gestes de l'acquisition en cours

   Commander (une carte ou toute la liste), recevoir, annuler. Aucune ne
   touche aux decks : seuls la collection et `S.enCours` bougent, et
   `recalculerAvecProgression()` reprend ce que le budget et la possession
   changent aux suggestions.

   Un maillon de la cascade de `js/app.js`, comme les autres : il rend `true`
   s'il a traité le geste.
   ===================================================================== */

/* Mettre une ligne de la liste d'achats en commande : tous les exemplaires qui
   lui manquent, une commande se passant rarement carte à moitié. */
function mettreEnCommande(l) {
  S.enCours.set(l.card.name, (S.enCours.get(l.card.name) || 0) + l.manque);
}

function gestesAcquisition(act, b) {
  if (act === 'commander') {
    const l = wishlist().find(x => x.card.name === b.dataset.name);
    if (!l) return true;
    mettreEnCommande(l);
    toast(`${l.card.name} : ${l.manque} exemplaire(s) en acquisition en cours.`);
    recalculerAvecProgression(`${l.card.name} commandée : elle ne pèse plus sur le budget.`);
    return true;
  }

  if (act === 'toutCommander') {
    const lignes = wishlist().slice();
    if (!lignes.length) return true;
    const n = lignes.reduce((t, l) => t + l.manque, 0);
    lignes.forEach(mettreEnCommande);
    toast(`${n} exemplaire(s) passés en acquisition en cours.`);
    recalculerAvecProgression('La liste d\'achats est commandée : elle ne pèse plus sur le budget.');
    return true;
  }

  if (act === 'recue') {
    const nom = b.dataset.name, qty = S.enCours.get(nom) || 0;
    if (!qty) return true;
    S.enCours.delete(nom);
    S.collection.set(nom, (S.collection.get(nom) || 0) + qty);
    toast(`${nom} : ${qty} exemplaire(s) reçus, ajoutés à la collection.`);
    recalculerAvecProgression(`${nom} reçue : ${qty} exemplaire(s) de plus en collection.`);
    return true;
  }

  if (act === 'annulerCommande') {
    const nom = b.dataset.name;
    if (!S.enCours.delete(nom)) return true;
    toast(`${nom} : commande annulée, la carte retourne dans la liste d'achats.`);
    recalculerAvecProgression(`${nom} : commande annulée, le budget la compte de nouveau.`);
    return true;
  }

  return false;
}
