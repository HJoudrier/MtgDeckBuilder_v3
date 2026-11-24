/* =====================================================================
   js/jeuPartie.js — Une partie, du mélange à la fin

   Les bibliothèques sont mélangées, chacun garde ou rend sa main (mulligan
   de Londres : on repioche sept cartes, puis on en met autant dessous que de
   mulligans pris ; le premier est gratuit à trois joueurs et plus, règle
   103.5c), puis les tours se suivent jusqu'à ce qu'il ne reste qu'un
   joueur — ou jusqu'au plafond, qui donne une partie nulle.
   ===================================================================== */

/* Les mulligans, joueur par joueur dans l'ordre du tour. */
function* mulligans(P) {
  for (const j of ordreApnap(P)) {
    const J = P.joueurs[j];
    let n = 0;
    for (;;) {
      piocheN(P, j, 7);
      if (n >= 4) break;
      const r = yield question(P, j, 'mulligan', ['garder', 'mulligan'], {extra: {n}});
      if (r !== 1) break;
      n++;
      J.main.splice(0).forEach(id => {
        obj(P, id).zone = 'bibliotheque';
        P.cartes[obj(P, id).cid].st.piochee = 0;
        J.bibliotheque.push(id);
      });
      melangeHasard(P.rng, J.bibliotheque);
    }
    J.mulligans = n;
    const dessous = n - (P.nb >= 3 && n > 0 ? 1 : 0);
    if (dessous > 0) {
      const choix = yield* choisitCartes(P, j, J.main.slice(), dessous, 'Mettre dessous', 'dessous');
      choix.forEach(id => {
        retireDe(J.main, id);
        obj(P, id).zone = 'bibliotheque';
        P.cartes[obj(P, id).cid].st.piochee = 0;
        J.bibliotheque.unshift(id);
      });
    }
    jn(P, `${J.nom} garde ${J.main.length} cartes`);
  }
}

/* La partie entière : le générateur que le pilote déroule. */
function* partie(P) {
  P.joueurs.forEach(J => melangeHasard(P.rng, J.bibliotheque));
  yield* mulligans(P);
  yield* effetsOuverture(P);
  if (!P.fin) { yield* tour(P); yield* suiteDesTours(P); }
  cloturePartie(P);
}

/* Les tours qui suivent celui qui s'achève, jusqu'à la fin ou au
   plafond : la partie les enchaîne, la reprise d'une copie aussi
   (js/jeuCopie.js). */
function* suiteDesTours(P) {
  while (!P.fin) {
    if (P.tour >= P.plafondTours * P.nb) { P.fin = {nulle: true, raison: 'plafond'}; break; }
    /* Un tour supplémentaire passe devant le suivant (js/forgeEffetsG.js). */
    const entree = (P.toursEnPlus || []).shift();
    /* Un tour en plus peut porter un déclencheur retardé : l'entrée est alors un objet (js/forgeInstantsB.js). */
    const enPlus = entree != null && typeof entree === 'object' ? entree.j : entree;
    /* Un tour en plus qu'un remplacement saute n'a pas lieu (js/forgeRemplacementsD.js). */
    const vrai = enPlus != null && !P.joueurs[enPlus].elimine && !tourEnPlusSaute(P, enPlus);
    P.actif = vrai ? enPlus : suivantNonSaute(P, P.actif);
    if (vrai) demarreTourEnPlus(P, entree);
    yield* tour(P);
  }
}

/* Ce que la fin d'une partie retient. */
function cloturePartie(P) {
  if (!P.fin) return;
  P.fin.tour = P.tour;
  P.fin.tours = P.joueurs.map(J => J.tours);
  jn(P, P.fin.nulle ? `Partie nulle (${P.fin.raison})` : `${P.joueurs[P.fin.gagnant].nom} gagne`);
}
