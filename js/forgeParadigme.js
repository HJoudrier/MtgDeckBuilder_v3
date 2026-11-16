/* =====================================================================
   js/forgeParadigme.js — Paradigm

   « After you first resolve this spell, exile it. At the beginning of your
   first main phase each turn, you may cast a copy of this card without
   paying its mana cost. » Une sorte de rebound qui ne s'épuise pas : la
   carte reste en exil, marquée (`o.paradigme`), et chaque tour de son
   propriétaire en offre une copie gratuite. La copie est un jeton de sort
   (`copieSort`), comme celle de Cipher (js/forgeMotsClesE.js) : à la
   résolution elle disparaît, la carte, elle, ne bouge plus.
   ===================================================================== */

/* Le mot-clé : un sort, sans paramètre. Le départ en exil à la résolution
   est lu par `exileApresResolution()` (js/jeuVariantesB.js) et posé par
   `resoudre()` (js/jeuPile.js). */
motCleLancementB = (g => function (def, face, jetons, tete, reste) {
  if (tete !== 'Paradigm') return g(def, face, jetons, tete, reste);
  return !reste.length && !!def.sort && (def.paradigme = true);
})(motCleLancementB);
forgeSait('kw', 'Paradigm');

/* Au début de la première phase principale de son propriétaire : une copie
   gratuite de chaque carte au paradigme qu'il a en exil, s'il le veut. Elle
   monte sur la pile ; la priorité qui suit l'étape la résout. */
function* paradigmesDebutPrincipale(P) {
  const j = P.actif, J = P.joueurs[j];
  for (const id of J.exil.slice()) {
    const e = obj(P, id);
    if (!e || !e.paradigme || e.prop !== j) continue;
    const r = yield question(P, j, 'oui', ['non', 'oui'], {texte: `Lancer une copie de ${e.def.nom} sans payer ?`, source: id, defaut: 1});
    if (r !== 1) continue;
    const cid = nouvelleCarte(P, P.cartes[e.cid].def, j, false, true);
    P.cartes[cid].copieSort = true;
    const c = creeObjet(P, cid, j, 'main');
    J.main.push(c.id);
    if (!(yield* lanceDepuisEffet(P, j, c, true))) { retireDe(J.main, c.id); P.objets.delete(c.id); }
  }
}
