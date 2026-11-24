/* =====================================================================
   js/jeuRevelations.js — Montrer toutes les cartes révélées

   Lot F102. « Reveal cards from the top of your library until you reveal X
   nonland cards… » (Sanar), « exile the top card of each player's library,
   then you may cast any number of spells from among those cards » (Etali) :
   le choix qui suit ne propose que les cartes qu'on peut prendre. Le joueur
   doit voir tout ce qui a été révélé, les cartes qu'il ne peut pas prendre
   grisées. `noteRevelation()` retient ce qu'un effet vient de révéler ; le
   choix de cartes qui touche l'une d'elles (`choisitCartes()`,
   js/jeuOpsA.js) emporte la liste, que l'interface peint.

   Ce qui est retenu vaut pour la résolution en cours : la suivante l'oublie.
   Les cartes sont suivies à travers leurs déplacements (`suit()`) : exilées,
   elles n'ont plus le même numéro.
   ===================================================================== */

/* Retenir des cartes révélées. Plusieurs révélations d'une même résolution s'ajoutent (Etali : une par joueur). */
function noteRevelation(P, ids) {
  const r = P.revelees && P.revelees.res === P.numRes ? P.revelees : (P.revelees = {res: P.numRes, ids: []});
  ids.forEach(id => { if (!r.ids.includes(id)) r.ids.push(id); });
}

noteResolution = (g => function (P, item) { P.numRes = (P.numRes || 0) + 1; g(P, item); })(noteResolution);

/* La liste à montrer avec ce choix, ou `null` : les cartes révélées encore présentes, si le choix en touche une. */
function revelationPour(P, ids) {
  const r = P.revelees;
  if (!r || r.res !== P.numRes) return null;
  const actuelles = [];
  r.ids.forEach(id => { const n = suit(P, id); if (obj(P, n) && !actuelles.includes(n)) actuelles.push(n); });
  if (!ids) return actuelles.length ? actuelles : null;
  return ids.some(id => actuelles.includes(id)) && actuelles.length > ids.length ? actuelles : null;
}

/* Etali : le dessus que l'on exile ou regarde est révélé à tous. */
fouilleForge = (g => function* (P, t, env, j) {
  const B = P.joueurs[j].bibliotheque, n = forgeNombre(P, t.DigNum || 1, env);
  noteRevelation(P, B.slice(-n));
  yield* g(P, t, env, j);
})(fouilleForge);
