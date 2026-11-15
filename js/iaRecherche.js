/* =====================================================================
   js/iaRecherche.js — Essayer ses coups avant de les jouer

   Les niveaux moyen et fort, réservés aux parties entre joueurs
   automatiques. Aux points où la partie se copie et se reprend
   (js/jeuCopie.js) — la priorité en phase principale, la déclaration des
   attaquants, celle des bloqueurs —, le joueur automatique prend
   quelques coups candidats, essaie chacun sur une copie de la partie,
   laisse tout le monde jouer au niveau rapide jusqu'à un horizon, et
   garde celui dont la position atteinte a la meilleure note (`evalue()`).

   La copie est la vraie partie : mains, faces cachées, ordre des
   bibliothèques et hasard semé compris. C'est voulu — entre joueurs
   automatiques, on mesure la force d'un deck, pas l'art de deviner —, et
   cela rend chaque essai exact : un seul suffit par coup.

   - moyen : on essaie jusqu'à ce que la pile soit vide à nouveau (un sort,
     une capacité), ou jusqu'à la fin du combat (une attaque, des blocages) ;
   - fort : chaque coup est suivi jusqu'à la fin du prochain tour du joueur
     qui décide, avec deux candidats de plus en phase principale.

   Les autres questions — cibles, modes, X, mulligan — restent au niveau
   rapide.
   ===================================================================== */

const RECHERCHE_IA = {moyen: {candidats: 4, loin: false}, fort: {candidats: 6, loin: true}};
const ETAPES_APRES_COMBAT = new Set(['finCombat', 'principale2', 'fin', 'nettoyage']);

/* Un joueur automatique qui essaie ses coups : il enveloppe un joueur
   rapide, à qui il laisse tout ce qu'il ne cherche pas. */
function agentRecherche(graine, siege, niveau) {
  const base = agentIA(graine, siege), reglage = RECHERCHE_IA[niveau];
  return {humain: false, siege, repond: (P, q) => {
    const r = pointDeReprise(P, q) ? reponseCherchee(P, q, base, reglage, graine) : undefined;
    if (r === undefined) return base.repond(P, q);
    if (q.q === 'priorite') noteActivation(P, q.options[r], base, r);
    return r;
  }};
}

/* Les coups candidats d'une question : la réponse rapide d'abord, qui
   l'emporte à note égale. */
function candidatsRecherche(P, q, base, reglage) {
  const j = q.joueur, l = [];
  const ajoute = r => { if (r != null && !l.some(x => JSON.stringify(x) === JSON.stringify(r))) l.push(r); };
  if (q.q === 'priorite') {
    const notes = notesPriorite(P, j, q.options, base).filter(([i]) => q.options[i].k !== 'passer');
    if (!notes.length) return [];
    notes.sort((a, b) => b[1] - a[1]);
    /* Un terrain se joue d'abord : rien à chercher. */
    if (q.options[notes[0][0]].k === 'terrain') return [];
    ajoute(iaPriorite(P, q, {...base, activations: new Map(base.activations)}));
    notes.filter(([, s]) => s > -1).slice(0, reglage.candidats).forEach(([i]) => ajoute(i));
    ajoute(q.options.length - 1);
  } else if (q.q === 'attaquants') {
    ajoute(iaAttaquants(P, q)); ajoute(attaqueParRegles(P, q)); ajoute([]);
    const tous = q.options.map((id, i) => [i, obj(P, id)]).filter(([, o]) => car(P, o).force > 0);
    const di = q.extra.defenseurs.findIndex(d => d.j != null);
    if (di >= 0) ajoute(tous.map(([i]) => [i, di]));
  } else if (q.q === 'bloqueurs') {
    ajoute(iaBloqueurs(P, q)); ajoute(blocageParRegles(P, q)); ajoute([]);
  }
  return l;
}

/* Jusqu'où suivre un essai. */
function horizonRecherche(P, q, reglage) {
  const tour = P.tour, etape = P.etape, j = q.joueur;
  if (reglage.loin) {
    /* La fin du prochain tour du joueur qui décide. */
    let vu = false;
    return C => { if (C.tour > tour && C.actif === j) vu = true; return vu && C.actif !== j; };
  }
  if (q.q === 'priorite') return (C, q2) => C.tour !== tour || C.etape !== etape || (q2.q === 'priorite' && q2.joueur === j && !C.pile.length);
  return C => C.tour !== tour || ETAPES_APRES_COMBAT.has(C.etape);
}

/* La réponse cherchée, ou `undefined` s'il n'y a rien à chercher (un seul
   candidat, ou aucun essai n'a abouti). */
function reponseCherchee(P, q, base, reglage, graine) {
  const cands = candidatsRecherche(P, q, base, reglage);
  if (cands.length < 2) return undefined;
  const j = q.joueur, horizon = horizonRecherche(P, q, reglage);
  let best, note = -Infinity;
  for (const r of cands) {
    const agents = P.joueurs.map((_, k) => agentIA(graine, k));
    const C = essaieCoup(P, q, r, horizon, agents);
    if (!C) continue;
    const v = evalue(C, j);
    if (v > note + 1e-9) { note = v; best = r; }
  }
  return best;
}
