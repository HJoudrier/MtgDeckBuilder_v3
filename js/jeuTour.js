/* =====================================================================
   js/jeuTour.js — Les étapes d'un tour

   Dégagement, entretien, pioche, première phase principale, combat (début,
   attaquants, bloqueurs, dégâts d'initiative, dégâts, fin), seconde phase
   principale, fin, nettoyage (règles 500–514). Chaque étape ouvre un tour de
   priorité, sauf le dégagement et le nettoyage ; les réserves de mana se
   vident entre deux étapes.

   Un combat sans attaquant saute ses étapes suivantes, priorités
   comprises — une simplification qui épargne quatre passages de priorité
   par tour sans rien changer à ce qu'un joueur automatique ferait.
   ===================================================================== */

const ETAPES = ['degagement', 'entretien', 'pioche', 'principale1', 'debutCombat', 'attaquants', 'bloqueurs',
  'initiative', 'degats', 'finCombat', 'principale2', 'fin', 'nettoyage'];

/* Le dégagement : les permanents du joueur actif se dégagent, ses créatures
   cessent d'avoir le mal d'invocation (règle 302.6). */
function degagement(P) {
  for (const id of P.champ) {
    const o = obj(P, id);
    if (o.ctrl !== P.actif) continue;
    o.pret = true;
    if (o.engage && typeof degagementEmpeche === 'function' && degagementEmpeche(P, o)) continue;
    o.engage = false;
  }
}

/* Le nettoyage : défausse jusqu'à sept, blessures retirées, fin des effets
   « jusqu'à la fin du tour » (règle 514). */
function* nettoyage(P) {
  const J = P.joueurs[P.actif];
  if (J.main.length > 7) {
    const choix = yield* choisitCartes(P, P.actif, J.main.slice(), J.main.length - 7, 'Défausser', 'defausse');
    choix.forEach(id => defausseCarte(P, id, P.actif));
  }
  finDuTour(P);
  P.joueurs.forEach(x => { x.prevention = 0; });
  for (const id of P.champ) {
    const o = obj(P, id);
    o.bless = 0; o.toucheMortel = false; o.regen = 0;
    if (o.mods.length) { o.mods = o.mods.filter(m => m.fin !== 'tour'); P.ver++; }
    if (o.anime && o.anime.length) { o.anime = o.anime.filter(m => m.fin !== 'tour'); P.ver++; }
    o.prevention = 0;
  }
  collecteDeclencheurs(P);
  if (P.enAttente.length) yield* priorite(P);
}

/* Une étape. */
function* etape(P, e) {
  switch (e) {
    case 'degagement': degagement(P); return;
    case 'entretien': suspensionsEntretien(P); emet(P, {t: 'etape', etape: 'entretien', actif: P.actif}); break;
    case 'pioche':
      if (!(P.nb === 2 && P.tour === 1)) piocheN(P, P.actif, 1);
      emet(P, {t: 'etape', etape: 'pioche', actif: P.actif});
      break;
    case 'principale1':
      notePrincipale(P);
      loreDebutPrincipale(P);
      emet(P, {t: 'etape', etape: 'principale1', actif: P.actif});
      break;
    case 'debutCombat': emet(P, {t: 'etape', etape: 'debutCombat', actif: P.actif}); break;
    case 'attaquants':
      if (!(yield* declareAttaquants(P))) { P.sansCombat = true; return; }
      break;
    case 'bloqueurs': if (P.sansCombat) return; yield* declareBloqueurs(P); break;
    case 'initiative': if (P.sansCombat || !initiativeEnJeu(P)) return; yield* degatsCombat(P, 1); return;
    case 'degats': if (P.sansCombat) return; yield* degatsCombat(P, 2); return;
    case 'finCombat':
      if (!P.sansCombat) { emet(P, {t: 'etape', etape: 'finCombat', actif: P.actif}); yield* priorite(P); }
      finCombat(P); P.sansCombat = false;
      return;
    case 'principale2': emet(P, {t: 'etape', etape: 'principale2', actif: P.actif}); break;
    case 'fin': exhumeesFin(P); emet(P, {t: 'etape', etape: 'fin', actif: P.actif}); break;
    case 'nettoyage': yield* nettoyage(P); return;
  }
  yield* priorite(P);
}

/* Ce que les statistiques relèvent au début de chaque phase principale :
   le mana que le joueur aurait pu produire, et ses terrains au quatrième
   tour — de quoi dire un manque ou un engorgement de mana. */
function notePrincipale(P) {
  const J = P.joueurs[P.actif];
  J.stats.manaDispo += manaDispo(P, P.actif);
  if (J.tours === 4) J.stats.terrainsT4 = champDe(P, P.actif).filter(o => estType(o, 'land')).length;
}

/* Un tour entier. */
function* tour(P) {
  P.tour++;
  const J = P.joueurs[P.actif];
  J.tours++;
  J.terrainsJoues = 0;
  P.joueurs.forEach(x => { x.sortsTour = []; x.piochesTour = 0; x.vieTour = 0; });
  P.entresTour = []; P.attaquantsTour = 0;
  P.unefois = new Set();
  P.actionsTour = 0; P.finTour = false; P.sansCombat = false; P.combat = null; P.etape = '';
  debutDuTour(P);
  jn(P, `— Tour ${P.tour} : ${J.nom} —`);
  for (const e of ETAPES) {
    if (P.fin || P.finTour) break;
    P.etape = e;
    yield* etape(P, e);
    videReserves(P);
  }
}
