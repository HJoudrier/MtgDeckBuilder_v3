/* =====================================================================
   js/jeuDurees.js — Ce qui dure : effets, déclencheurs retardés, retours
   d'exil, capacités accordées, régénération

   Trois listes vivent sur la partie, à côté des objets :
   - `P.effets` : des effets sans carte — des statiques et des déclencheurs
     posés par un sort ou une capacité (« until end of turn, creatures you
     control get… ») —, avec leur fin : le nettoyage, le prochain tour de
     leur contrôleur, le départ de leur hôte, ou jamais ;
   - `P.retardes` : des déclencheurs qui n'écoutent qu'une fois (« at the
     beginning of the next end step, sacrifice it ») ;
   - `P.retours` : des cartes exilées « jusqu'à ce que » leur hôte quitte le
     champ.

   Un effet se présente au moteur comme un objet : un identifiant, un
   contrôleur, une définition qui porte ses capacités — si bien que
   `statiquesEnJeu()` et la collecte des déclencheurs le lisent comme une
   carte.
   ===================================================================== */

/* Les listes de la partie, créées au premier besoin : une partie d'avant
   ce lot, reprise, n'en porte pas. */
function durees(P) {
  if (!P.effets) { P.effets = []; P.retardes = []; P.retours = []; }
  return P;
}

/* Poser un effet. `fin` : 'tour', 'prochainTour', 'hote' ou null. */
function poseEffet(P, e) {
  durees(P);
  const ef = {id: P.prochainId++, zone: 'effet', att: null, marq: {}, mods: [], memo: [], memoJ: [], ...e};
  ef.def = {nom: e.nom || 'Effet', capacites: e.capacites || [], statiques: e.statiques || [], couleurs: [], types: [],
    sousTypes: [], supers: [], mots: 0, params: {}};
  P.effets.push(ef);
  P.ver++;
  return ef;
}

/* Les effets et les déclencheurs retardés qui finissent au nettoyage. */
function finDuTour(P) {
  if (!P.effets) return;
  const n = P.effets.length;
  P.effets = P.effets.filter(e => e.fin !== 'tour');
  P.retardes = P.retardes.filter(r => !r.ceTour);
  if (P.effets.length !== n) P.ver++;
}

/* Au début d'un tour : ce qui durait « jusqu'à votre prochain tour ». */
function debutDuTour(P) {
  if (!P.effets) return;
  const n = P.effets.length;
  P.effets = P.effets.filter(e => !(e.fin === 'prochainTour' && e.ctrl === P.actif));
  if (P.effets.length !== n) P.ver++;
}

/* Un hôte quitte le champ : les cartes exilées jusque-là reviennent sous
   le contrôle de leur propriétaire, et les effets qui duraient avec lui
   cessent (règle 610.3). Appelé par `deplace()`. */
function hotePart(P, id) {
  if (!P.effets) return;
  const effets = P.effets.length;
  P.effets = P.effets.filter(e => !(e.fin === 'hote' && e.hote === id));
  if (P.effets.length !== effets) P.ver++;
  const rendus = P.retours.filter(r => r.hote === id);
  if (!rendus.length) return;
  P.retours = P.retours.filter(r => r.hote !== id);
  rendus.forEach(r => r.ids.forEach(x => {
    const o = obj(P, x);
    if (o && o.zone === 'exil') deplace(P, x, 'champ', {ctrl: o.prop});
  }));
}

/* Les sources de déclencheurs qui ne sont pas des cartes : les effets. */
function sourcesEffets(P) {
  return P.effets ? P.effets.filter(e => e.def.capacites.length) : [];
}

/* Les déclencheurs retardés qu'un évènement fait partir. Chacun ne part
   qu'une fois. */
function collecteRetardes(P, e) {
  if (!P.retardes || !P.retardes.length) return;
  P.retardes = P.retardes.filter(r => {
    const s = obj(P, r.src) || r.lki || {id: r.src, ctrl: r.ctrl, def: {nom: r.nom, couleurs: []}, marq: {}};
    if (!forgeDeclenche(P, {t: r.t, face: r.face}, e, {...s, ctrl: r.ctrl})) return true;
    P.enAttente.push({src: r.src, lki: obj(P, r.src) ? null : r.lki, ctrl: r.ctrl, evt: e, memo: r.memo, memoJ: r.memoJ,
      cap: {genre: 'declenchee', effet: r.effet, texte: r.texte}});
    return false;
  });
}

/* Les capacités d'un permanent en ce moment : les siennes, plus celles que
   des statiques lui accordent (« equipped creature has… »). Gardées sur
   l'objet tant que l'état ne change pas ; les capacités accordées sont
   toujours les mêmes objets, pour que leur rang et leur « une fois par
   tour » tiennent. */
function capacitesDe(P, o) {
  if (!o || o.zone !== 'champ' || typeof capacitesAccordees !== 'function') return o ? o.def.capacites : [];
  if (o._capV === P.ver) return o._cap;
  const plus = capacitesAccordees(P, o);
  o._cap = plus.length ? o.def.capacites.concat(plus) : o.def.capacites;
  o._capV = P.ver;
  return o._cap;
}

/* Détruire un permanent, sauf s'il se régénère : il s'engage, ses
   blessures partent, il quitte le combat (règle 701.15). Rend vrai s'il
   est détruit. */
function detruitObjet(P, o, sansRegeneration) {
  if (!o || o.zone !== 'champ') return false;
  if (o.regen > 0 && !sansRegeneration) {
    o.regen--; o.engage = true; o.bless = 0; o.toucheMortel = false;
    if (P.combat) { P.combat.attaquants.delete(o.id); P.combat.bloqueurs.delete(o.id); P.combat.bloquesPar.delete(o.id); }
    jn(P, `${o.def.nom} se régénère`);
    P.ver++;
    return false;
  }
  deplace(P, o.id, 'cimetiere');
  return true;
}

/* Défausser une carte : au cimetière, ou en exil pour une carte à folie,
   dont la capacité déclenchée propose alors de la lancer (règle 702.35). */
function defausseCarte(P, id, j) {
  const o = obj(P, id);
  if (!o) return null;
  let n;
  if (o.def.folie) {
    n = deplace(P, id, 'exil');
    obj(P, n).folie = true;
    P.enAttente.push({src: n, ctrl: o.prop, cap: CAP_FOLIE, evt: {t: 'defausse', joueur: j}});
  } else n = deplace(P, id, 'cimetiere');
  emet(P, {t: 'defausse', joueur: j});
  return n;
}
