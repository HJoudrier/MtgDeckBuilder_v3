/* =====================================================================
   js/iaCombat.js — Attaquer et bloquer, pour le joueur automatique

   Attaquer quand l'attaque ne se fait pas punir — aucun bloqueur adverse ne
   tue l'attaquant sans mourir — ou quand la course est gagnée ; garder à la
   maison de quoi survivre au tour suivant. Bloquer d'abord pour ne pas
   mourir, ensuite pour les bons échanges ; ne sacrifier une créature en
   bloquant que pour survivre.
   ===================================================================== */

/* B tue-t-il A ? */
function tue(P, b, a) {
  const cb = car(P, b), ca = car(P, a);
  if (ca.mots & MOT.INDESTRUCTIBLE) return false;
  return cb.force > 0 && ((cb.mots & MOT.CONTACT) || cb.force >= ca.endurance - a.bless);
}

/* L'adversaire visé : celui qu'on peut achever, sinon le plus faible en
   points de vie, sinon le plus menaçant. */
function choisitDefenseur(P, j, defenseurs) {
  let best = 0, score = -Infinity;
  defenseurs.forEach((d, i) => {
    if (d.j == null) return;
    const J = P.joueurs[d.j];
    const s = -J.vie + menace(P, d.j) * 0.2 - forceDeFrappe(P, d.j) * 0.1;
    if (s > score) { best = i; score = s; }
  });
  return best;
}

/* Les attaquants. */
function iaAttaquants(P, q) {
  const j = q.joueur, defs = q.extra.defenseurs;
  const di = choisitDefenseur(P, j, defs), cible = defs[di];
  if (!cible || cible.j == null) return [];
  const bloqueurs = champDe(P, cible.j).filter(o => estCreature(o) && !o.engage);
  const atts = q.options.map((id, i) => [i, obj(P, id)]);
  const total = atts.reduce((s, [, o]) => s + Math.max(0, car(P, o).force), 0);
  const leurBlocage = bloqueurs.reduce((s, b) => s + Math.max(0, car(P, b).endurance), 0);
  const letal = total - leurBlocage * 0.5 >= P.joueurs[cible.j].vie;
  const danger = adversaires(P, j).reduce((s, k) => s + forceDeFrappe(P, k), 0) >= P.joueurs[j].vie;
  const garde = danger && !letal ? Math.max(1, Math.ceil(bloqueurs.length / 2)) : 0;
  const parEndurance = atts.slice().sort((x, y) => car(P, y[1]).endurance - car(P, x[1]).endurance);
  const aLaMaison = new Set(parEndurance.slice(0, garde).map(x => x[0]));
  const r = [];
  for (const [i, a] of atts) {
    if (aLaMaison.has(i) || car(P, a).force <= 0 || !attaquePermise(P, a, cible) || taxeAttaque(P, a, cible) > manaDispo(P, j)) continue;
    const capables = bloqueurs.filter(b => peutBloquer(P, b, a));
    const puni = capables.some(b => tue(P, b, a) && !tue(P, a, b));
    const echange = capables.some(b => tue(P, b, a) && tue(P, a, b) && valeurObjet(P, b) < valeurObjet(P, a));
    if (letal || !capables.length || (!puni && !echange)) r.push([i, di]);
  }
  return r;
}

/* Les bloqueurs. */
function iaBloqueurs(P, q) {
  const j = q.joueur, J = P.joueurs[j];
  const blqs = q.options.map(id => obj(P, id)), atts = q.extra.attaquants.map(id => obj(P, id));
  const libres = new Set(blqs.map((_, i) => i)), r = [], bloques = new Set();
  const pose = (bi, ai) => { r.push([bi, ai]); libres.delete(bi); bloques.add(ai); };
  const ordre = atts.map((a, ai) => [ai, a]).sort((x, y) => valeurObjet(P, y[1]) - valeurObjet(P, x[1]));
  for (const [ai, a] of ordre) {
    if (aMot(P, a, MOT.MENACE)) continue;
    const bon = [...libres].find(bi => peutBloquer(P, blqs[bi], a) && tue(P, blqs[bi], a) && !tue(P, a, blqs[bi]));
    if (bon != null) { pose(bon, ai); continue; }
    const echange = [...libres].find(bi => peutBloquer(P, blqs[bi], a) && tue(P, blqs[bi], a) && valeurObjet(P, blqs[bi]) + 1 < valeurObjet(P, a));
    if (echange != null) pose(echange, ai);
  }
  const entrant = () => atts.reduce((s, a, ai) => s + (bloques.has(ai) && !aMot(P, a, MOT.PIETINEMENT) ? 0 : Math.max(0, car(P, a).force)), 0);
  const poison = atts.some(a => aMot(P, a, MOT.INFECTION));
  const mortel = () => poison ? J.poison + entrant() >= 10 : entrant() >= J.vie;
  for (const [ai, a] of ordre) {
    if (!mortel()) break;
    if (bloques.has(ai)) continue;
    const dispo = [...libres].filter(bi => peutBloquer(P, blqs[bi], a)).sort((x, y) => valeurObjet(P, blqs[x]) - valeurObjet(P, blqs[y]));
    const besoin = aMot(P, a, MOT.MENACE) ? 2 : 1;
    if (dispo.length >= besoin) dispo.slice(0, besoin).forEach(bi => pose(bi, ai));
  }
  return r;
}
