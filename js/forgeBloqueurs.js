/* =====================================================================
   js/forgeBloqueurs.js — Échanger deux bloqueurs

   Lot F99. Sorrow's Path : « choose two target blocking creatures an
   opponent controls. If each of those creatures could block all creatures
   the other is blocking, remove both from combat. Each one then blocks all
   creatures the other was blocking. »

   Dans le moteur un bloqueur n'arrête qu'un attaquant (`cb.bloqueurs`,
   bloqueur → attaquant ; `cb.bloquesPar`, attaquant → bloqueurs) : l'échange
   donne à chacun l'attaquant de l'autre, si l'un et l'autre le peuvent.
   Sinon, rien ne change.
   ===================================================================== */

forgeEffet('SwitchBlock', ['DefinedAttacker', 'DefinedBlocker', 'RemoveFromCombat'], function* (P, t, env) {
  const cb = P.combat;
  const [b1, b2] = ciblesForge(P, env, false).filter(o => o && o.j == null && o.zone === 'champ');
  if (!cb || !b1 || !b2 || b1.id === b2.id) return;
  const a1 = cb.bloqueurs.get(b1.id), a2 = cb.bloqueurs.get(b2.id);
  if (a1 == null || a2 == null || a1 === a2 || !obj(P, a1) || !obj(P, a2)) return;
  if (!peutBloquer(P, b1, obj(P, a2)) || !peutBloquer(P, b2, obj(P, a1))) return;
  const sors = (a, b) => { const l = cb.bloquesPar.get(a) || []; cb.bloquesPar.set(a, l.filter(x => x !== b)); };
  sors(a1, b1.id); sors(a2, b2.id);
  cb.bloqueurs.set(b1.id, a2); cb.bloqueurs.set(b2.id, a1);
  cb.bloquesPar.set(a2, [...(cb.bloquesPar.get(a2) || []), b1.id]);
  cb.bloquesPar.set(a1, [...(cb.bloquesPar.get(a1) || []), b2.id]);
  P.ver++;
  jn(P, `${b1.def.nom} et ${b2.def.nom} échangent leurs attaquants`);
}, (t, op) => { op.op = 'forge'; op.hostile = true; }, {prepare: t => t.RemoveFromCombat === 'True'});
