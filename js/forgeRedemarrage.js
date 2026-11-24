/* =====================================================================
   js/forgeRedemarrage.js — Recommencer la partie

   Lot F100. Karn Liberated : « restart the game, leaving in exile all
   non-Aura permanent cards exiled with Karn. Then put those cards onto the
   battlefield under your control. » La partie repart de zéro sur place :
   tout ce qui était sur la pile, sur le champ, en main ou au cimetière
   retourne dans la bibliothèque de son propriétaire, mélangée, sept cartes
   sont piochées ; les commandants retournent en zone de commandement. Les
   jetons et les cartes conjurées disparaissent. Les cartes exilées avec la
   source restent en exil, sous de nouveaux objets que `exilees` retrouve —
   la suite de l'effet les met en jeu.

   Le tour en cours s'arrête (`P.finTour`), et le suivant est celui de qui
   a redémarré la partie, qui commence. Pas de mulligan : le moteur n'en
   propose pas en cours de partie.
   ===================================================================== */

forgeEffet('RestartGame', ['RestrictFromZone', 'RestrictFromValid'], function* (P, t, env) {
  const j0 = env.ctrl, src = env.src, carteSrc = src ? P.cartes[src.cid] : null;
  const gardees = new Set(((carteSrc && carteSrc.exilees) || []).map(id => obj(P, id))
    .filter(o => o && o.zone === 'exil' && o.def.types.some(x => TYPES_PERMANENTS.includes(x)) && !(o.def.sousTypes || []).includes('aura')).map(o => o.cid));
  /* Rien ne reste de la partie d'avant. */
  P.pile.length = 0; P.champ.length = 0; P.enAttente.length = 0; P.evts.length = 0; P.partis.length = 0; P.objets.clear();
  P.combat = null; P.effets = []; P.retardes = []; P.retours = []; P.horsPhase = []; P.monarque = null; P.entresTour = [];
  P.joueurs.forEach(J => {
    ZONES_JOUEUR.forEach(z => { J[z] = []; });
    Object.assign(J, {vie: J.vieDepart, poison: 0, energie: 0, marqueurs: {}, pool: {W: 0, U: 0, B: 0, R: 0, G: 0, C: 0}, degatsCmd: {}, sortsTour: [], tours: 0,
      terrainsJoues: 0, piocheVide: false, elimine: false, raison: null});
    J.commandants.forEach(cid => { J.taxe[cid] = 0; });
  });
  const nouvelles = new Map();
  P.cartes.forEach((k, cid) => {
    if (k.jeton || k.conjuree) return;
    const zone = k.cmd ? 'commandement' : gardees.has(cid) ? 'exil' : 'bibliotheque';
    /* La source garde son identité : l'effet qui se résout la cherche encore (js/jeuPile.js `resoudre()`). */
    let o;
    if (src && !src.lki && src.cid === cid) { o = Object.assign(src, {zone, engage: false, pret: false, marq: {}, mods: [], att: null, bless: 0, anime: null, x: 0, _v: -1, _c: null}); P.objets.set(o.id, o); }
    else o = creeObjet(P, cid, k.prop, zone);
    P.joueurs[k.prop][zone].push(o.id);
    k.choix = {}; k.exilees = [];
    if (zone === 'exil') nouvelles.set(cid, o.id);
  });
  if (carteSrc) carteSrc.exilees = [...nouvelles.values()];
  P.joueurs.forEach(J => melangeHasard(P.rng, J.bibliotheque));
  for (const J of P.joueurs) yield* pioche(P, J.i, 7);
  (P.toursEnPlus = P.toursEnPlus || []).unshift(j0);
  P.finTour = true; P.ver++;
  jn(P, `${P.joueurs[j0].nom} redémarre la partie`);
}, (t, op) => { op.op = 'forge'; op.hostile = true; }, {prepare: t => !t.RestrictFromZone || t.RestrictFromZone === 'Exile'});
forgeSait('param', 'RestartGame.RestrictFromZone', 'RestartGame.RestrictFromValid');
