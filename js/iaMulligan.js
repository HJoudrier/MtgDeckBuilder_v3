/* =====================================================================
   js/iaMulligan.js — Garder sa main, ou non, par tirages

   Le joueur automatique connaît sa main et le contenu de sa bibliothèque,
   pas son ordre. Il tire trente ordres de la bibliothèque et joue chacun
   seul, quatre tours, sans adversaire : un terrain par tour, puis les sorts
   que ses terrains paient, les plus chers d'abord. Ce que la main rapporte
   ainsi — le mana dépensé, les terrains qui manquent, et la taille de la
   main de départ —, il le compare à ce qu'une nouvelle main de sept, moins celles
   qu'on remettrait dessous, rapporterait en moyenne.

   Les tirages passent par le flux de hasard de l'agent (`ag.flux`), semé
   par la graine de la partie : une partie se rejoue à l'identique.
   ===================================================================== */

/* Ce que vaut une carte de la main de départ : une main de six part avec
   une ressource de moins pour toute la partie, ce que quatre tours de jeu
   seul ne voient pas. */
const TIRAGES_MULLIGAN = 30, TOURS_MULLIGAN = 4;
let VALEUR_CARTE_MULLIGAN = 2;

/* Les couleurs qu'un terrain produit. */
function couleursProduites(d) {
  return new Set(d.capacites.filter(k => k.genre === 'mana').flatMap(k => (k.options || []).join('').split('')));
}

/* Un sort se paie-t-il avec ces terrains (son coût total, et chaque
   couleur exigée parmi celles produites) ? */
function payeParTerrains(d, dispo, couleurs) {
  if ((d.cout.total || 0) > dispo) return false;
  return Object.entries(d.cout.couleurs || {}).every(([k, n]) => !n || couleurs.has(k));
}

/* Une main jouée seule quelques tours : ce qu'elle rapporte. `tirages`
   est la suite des pioches ; `commandants` se lancent depuis la zone de
   commandement. */
function goldfish(main, tirages, commandants, sansPioche) {
  const mainT = main.slice(), pioches = tirages.slice(), cmd = commandants.slice();
  const terrains = [], couleurs = new Set();
  let dispoCreatures = 0, depense = 0, manques = 0;
  for (let t = 1; t <= TOURS_MULLIGAN; t++) {
    if (!(t === 1 && sansPioche) && pioches.length) mainT.push(pioches.shift());
    /* Le terrain qui ouvre une couleur manquante, sinon le premier. */
    const lands = mainT.filter(d => d.types.includes('land'));
    let pose = lands.find(d => [...couleursProduites(d)].some(k => !couleurs.has(k))) || lands[0];
    let engage = 0;
    if (pose) {
      mainT.splice(mainT.indexOf(pose), 1); terrains.push(pose);
      couleursProduites(pose).forEach(k => couleurs.add(k));
      if (pose.entree && pose.entree.engagee) engage = 1;
    } else if (t <= 3) manques++;
    let dispo = terrains.length - engage + dispoCreatures;
    const lancables = () => [...mainT.filter(d => !d.types.includes('land')), ...cmd].filter(d => payeParTerrains(d, dispo, couleurs))
      .sort((a, b) => (b.cout.total || 0) - (a.cout.total || 0));
    for (let l = lancables(); l.length; l = lancables()) {
      const d = l[0];
      if (cmd.includes(d)) cmd.splice(cmd.indexOf(d), 1); else mainT.splice(mainT.indexOf(d), 1);
      dispo -= d.cout.total || 0; depense += d.cout.total || 0;
      if (d.capacites.some(k => k.genre === 'mana')) dispoCreatures++;
    }
  }
  return depense - manques * 3 + main.length * VALEUR_CARTE_MULLIGAN;
}

/* Les cartes qu'on remettrait dessous : les terrains au-delà de trois, puis
   les sorts les plus chers. */
function apresDessous(main, k) {
  if (k <= 0) return main;
  const l = main.slice();
  for (let i = 0; i < k && l.length; i++) {
    const lands = l.filter(d => d.types.includes('land'));
    const x = lands.length > 3 ? lands[0] : l.filter(d => !d.types.includes('land')).sort((a, b) => (b.cout.total || 0) - (a.cout.total || 0))[0] || l[0];
    l.splice(l.indexOf(x), 1);
  }
  return l;
}

/* Garder (0) ou rendre (1) sa main. */
function iaMulligan(P, q, ag) {
  const j = q.joueur, J = P.joueurs[j], n = q.extra.n;
  const def = id => obj(P, id).def, main = J.main.map(def), biblio = J.bibliotheque.map(def);
  const cmd = J.commandement.map(def).filter(d => !d.types.includes('land'));
  const sansPioche = P.nb === 2 && P.actif === j;
  const libre = P.nb >= 3 ? 1 : 0, st = ag.flux;
  const dessousSiGarde = Math.max(0, n - (n > 0 ? libre : 0)), dessousSiRend = Math.max(0, n + 1 - libre);
  let garde = 0, rend = 0;
  for (let k = 0; k < TIRAGES_MULLIGAN; k++) {
    const b = biblio.slice(); melangeHasard(st, b);
    garde += goldfish(apresDessous(main, dessousSiGarde), b, cmd, sansPioche);
    const tout = main.concat(biblio); melangeHasard(st, tout);
    rend += goldfish(apresDessous(tout.slice(0, 7), dessousSiRend), tout.slice(7), cmd, sansPioche);
  }
  return garde >= rend ? 0 : 1;
}
