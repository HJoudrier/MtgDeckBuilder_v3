/* =====================================================================
   js/forgeBlocMultiple.js — Un bloqueur qui arrête plusieurs attaquants

   Lot F109 : Brave the Sands (`Continuous | CanBlockAmount$ 1`, « can block
   an additional creature each combat »). Dans le moteur, `cb.bloqueurs`
   range un bloqueur contre un seul attaquant : les attaquants de plus se
   rangent à part dans `cb.blocsSup` (bloqueur → attaquants), et
   `cb.bloquesPar` — ce que lisent la menace, le piétinement, les
   déclencheurs — les connaît tous. À l'étape des dégâts le bloqueur
   répartit sa force : le létal à chacun dans l'ordre, le reste au dernier.
   ===================================================================== */

forgeSait('param', 'Continuous.CanBlockAmount');

/* Combien d'attaquants de plus ce bloqueur peut arrêter. */
function blocsSupDe(P, b) {
  let n = 0;
  for (const {src, s} of statiquesEnJeu(P))
    if (s.s === 'forge' && /Continuous/.test(s.t.Mode) && s.t.CanBlockAmount && viseForge(P, src, s, b)) n += +s.t.CanBlockAmount || 0;
  return n;
}

/* Un deuxième blocage de `b`, contre un attaquant qu'il n'arrête pas déjà. */
function blocSupplementaire(P, cb, b, a) {
  const sup = cb.blocsSup.get(b) || [];
  return cb.bloqueurs.get(b) !== a && !sup.includes(a) && sup.length < blocsSupDe(P, obj(P, b));
}

/* Un bloqueur ne bloque plus cet attaquant ; il garde les autres. */
function retireBloc(cb, b, a) {
  const sup = cb.blocsSup.get(b) || [];
  if (cb.bloqueurs.get(b) === a) { if (sup.length) cb.bloqueurs.set(b, sup.shift()); else cb.bloqueurs.delete(b); }
  else cb.blocsSup.set(b, sup.filter(x => x !== a));
}

/* Les coups d'un bloqueur : un seul attaquant, ou sa force répartie. */
function repartitionBloqueur(P, b, a, force) {
  const cibles = [a, ...((P.combat.blocsSup.get(b.id)) || []).map(id => obj(P, id))].filter(x => x && x.zone === 'champ');
  if (cibles.length < 2) return cibles.length ? [[b, cibles[0], force]] : [];
  let reste = force;
  return cibles.map((x, i) => {
    const n = i === cibles.length - 1 ? reste : Math.min(reste, Math.max(1, car(P, x).endurance - x.bless));
    reste -= n;
    return [b, x, n];
  }).filter(c => c[2] > 0);
}
