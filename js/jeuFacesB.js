/* =====================================================================
   js/jeuFacesB.js — Les faces, suite : jour et nuit, loups-garous,
   craft, omen, fuse, prototype

   Le jour et la nuit sont un état de la partie (`P.jourNuit`) : il
   devient le jour quand un permanent `daybound` entre ; au début d'un tour,
   la nuit tombe si le joueur actif du tour précédent n'a lancé aucun sort,
   le jour revient s'il en a lancé deux ou plus (règle 726). Les
   loups-garous d'avant jugent la même chose pour leurs déclencheurs
   (`WerewolfTransformCondition`, js/forgeDeclencheurs.js).
   ===================================================================== */

/* Les sorts du tour qui s'achève, notés avant que `tour()` ne les efface. */
function noteSortsDuTour(P) {
  const l = P.joueurs.map(J => (J.sortsTour || []).length);
  P.sortsDernierTour = {total: l.reduce((s, n) => s + n, 0), max: Math.max(0, ...l), actif: l[P.actif] || 0};
}

function estJourNuit(o) { return !!(o.def.params && (o.def.params.jour || o.def.params.nuit)); }

/* Au début d'un tour : la nuit tombe, ou le jour revient, et les
   permanents jour/nuit prennent la face qui convient. */
function jourNuitDebut(P) {
  const d = P.sortsDernierTour;
  if (!P.jourNuit || !d) return;
  const avant = P.jourNuit;
  if (P.jourNuit === 'jour' && d.actif === 0) P.jourNuit = 'nuit';
  else if (P.jourNuit === 'nuit' && d.actif >= 2) P.jourNuit = 'jour';
  if (P.jourNuit !== avant) { jn(P, P.jourNuit === 'nuit' ? 'La nuit tombe' : 'Le jour se lève'); accordeJourNuit(P); }
}

/* Chaque permanent jour/nuit montre la face du moment. */
function accordeJourNuit(P) {
  P.champ.map(id => obj(P, id)).filter(estJourNuit).forEach(o => {
    const nuit = !!o.def.params.nuit;
    if ((P.jourNuit === 'nuit') !== nuit) transforme(P, o);
  });
}

/* Un permanent jour/nuit qui entre : le jour s'il n'y avait ni jour ni
   nuit, et la face de la nuit s'il fait nuit. */
function jourNuitEntree(P, o) {
  if (!o || !estJourNuit(o)) return;
  if (!P.jourNuit) P.jourNuit = 'jour';
  if ((P.jourNuit === 'nuit') !== !!o.def.params.nuit) transforme(P, o);
}

/* Fuse : les deux moitiés d'une carte partagée, lancées ensemble. Les
   emplacements de cible de la seconde se décalent après ceux de la
   première. */
function defFusionnee(d) {
  const a = d.sort, b = d.dos && d.dos.sort;
  if (!a || !b || a.modes || b.modes) return null;
  const k = a.cibles.length, decale = v => v == null ? v : v + k;
  const ops = [...a.ops, ...b.ops.map(op => ({...op, slot: decale(op.slot), slotParent: decale(op.slotParent)}))];
  return {...d, nom: d.nom + ' // ' + d.dos.nom, sort: {ops, cibles: [...a.cibles, ...b.cibles], modes: null}, _eph: undefined};
}

/* Prototype : la carte lancée pour un coût moindre, plus petite, de la
   couleur de ce coût. */
function defPrototype(d) {
  const p = d.prototype, c = p.cout;
  return {...d, cout: c, mv: c.total, force: p.force, endurance: p.endurance, couleurs: couleursDe(c, {}), _eph: undefined};
}

/* Craft : la carte exilée revient transformée. */
OPS.artisanat = function* (P, op, ctx) {
  const s = sourceCtx(P, ctx), cid = s && s.cid;
  const J = s && P.joueurs[s.prop];
  const id = J && J.exil.find(x => obj(P, x).cid === cid);
  const k = cid != null && P.cartes[cid];
  if (id == null || !k || !k.def.dos) return;
  yield* metEnJeu(P, id, ctx.ctrl, {face: k.def.dos});
};
