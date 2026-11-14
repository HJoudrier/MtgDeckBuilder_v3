/* =====================================================================
   js/jeuEtatsDeJeu.js — Les actions d'état, et un joueur qui perd

   Avant chaque passage de priorité, le moteur regarde la partie et tranche
   ce que personne n'a besoin de décider (règle 704) : un joueur à zéro point
   de vie perd, une créature aux blessures mortelles meurt, une aura sans
   hôte tombe. On recommence tant que quelque chose a changé.
   ===================================================================== */

/* Un joueur perd : il quitte la partie avec tout ce qu'il possède (règle
   800.4a). Ce qu'il contrôlait sans le posséder part en exil. Si c'était son
   tour, le tour s'arrête là. */
function elimine(P, j, raison) {
  const J = P.joueurs[j];
  if (J.elimine) return;
  J.elimine = true; J.raison = raison; J.tourElimine = P.tour;
  jn(P, `${J.nom} perd (${raison})`);
  P.pile = P.pile.filter(it => {
    if (it.ctrl !== j) return true;
    if (it.sort) P.objets.delete(it.id);
    return false;
  });
  P.champ.slice().forEach(id => {
    const o = obj(P, id);
    if (o.prop === j) { retireDe(P.champ, id); P.objets.delete(id); }
    else if (o.ctrl === j) deplace(P, id, 'exil');
  });
  P.enAttente = P.enAttente.filter(t => t.ctrl !== j);
  P.ver++;
  if (P.actif === j) P.finTour = true;
  const restent = vivants(P);
  if (restent.length <= 1 && !P.fin)
    P.fin = restent.length ? {gagnant: restent[0].i, raison} : {nulle: true, raison};
}

/* Les actions d'état, une passe. Rend vrai si quelque chose a changé. */
function appliqueSBA(P) {
  let change = false;
  for (const J of P.joueurs) {
    if (J.elimine) continue;
    let raison = null;
    if (J.vie <= 0) raison = 'vie';
    else if (J.poison >= 10) raison = 'poison';
    else if (J.piocheVide) raison = 'bibliotheque';
    else if (Object.keys(J.degatsCmd).some(k => J.degatsCmd[k] >= 21)) raison = 'commandant';
    if (raison) { elimine(P, J.i, raison); change = true; }
  }
  if (P.fin) return change;
  /* Les statiques qui changent un contrôleur ou un type d'abord : ce qui
     suit juge les permanents tels qu'elles les font. */
  if (couchesStatiques(P)) change = true;
  const auCimetiere = new Set(), detruits = new Set(), legendes = new Map();
  for (const id of P.champ) {
    const o = obj(P, id), c = car(P, o);
    if (estCreature(o)) {
      if (c.endurance <= 0) auCimetiere.add(id);
      else if ((o.bless >= c.endurance || (o.toucheMortel && o.bless > 0)) && !(c.mots & MOT.INDESTRUCTIBLE)) detruits.add(id);
    }
    if (estType(o, 'planeswalker') && (o.marq.loyaute || 0) <= 0) auCimetiere.add(id);
    if (o.def.aura) {
      const h = o.att != null ? obj(P, o.att) : null;
      if (!h || h.zone !== 'champ' || !correspondBase(P, h, o.def.aura, o, o.ctrl)) auCimetiere.add(id);
    } else if (o.att != null) {
      const h = obj(P, o.att);
      if (!h || h.zone !== 'champ' || !estCreature(h)) { o.att = null; change = true; }
    }
    if (o.marq['+1/+1'] > 0 && o.marq['-1/-1'] > 0) {
      const m = Math.min(o.marq['+1/+1'], o.marq['-1/-1']);
      o.marq['+1/+1'] -= m; o.marq['-1/-1'] -= m; P.ver++; change = true;
    }
    if (c.supers.includes('legendary')) {
      const cle = o.ctrl + '|' + o.def.nom;
      const autre = legendes.get(cle);
      if (autre) auCimetiere.add(obj(P, autre).ts < o.ts ? autre : id);
      if (!autre || obj(P, autre).ts < o.ts) legendes.set(cle, id);
    }
  }
  sagasFinies(P).forEach(id => auCimetiere.add(id));
  for (const id of auCimetiere) {
    if (obj(P, id) && obj(P, id).zone === 'champ') { deplace(P, id, 'cimetiere'); change = true; }
  }
  /* Les blessures mortelles détruisent : une créature peut s'en régénérer. */
  for (const id of detruits) {
    if (!auCimetiere.has(id) && obj(P, id) && obj(P, id).zone === 'champ') { detruitObjet(P, obj(P, id)); change = true; }
  }
  /* Le commandant qui finit au cimetière ou en exil retourne dans la zone
     de commandement (règle 903.9a) : le joueur automatique le veut toujours. */
  for (const J of P.joueurs) {
    if (J.elimine || !J.commandants.length) continue;
    for (const z of ['cimetiere', 'exil']) {
      J[z].filter(id => obj(P, id).cmd).forEach(id => { deplace(P, id, 'commandement'); change = true; });
    }
  }
  return change;
}
