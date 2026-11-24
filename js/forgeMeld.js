/* =====================================================================
   js/forgeMeld.js — Fusionner deux cartes en un seul permanent

   Lot F99. Hanweir Battlements et Hanweir Garrison, Gisela et Bruna, Urza et
   The Mightstone and Weakstone : « exile them, then meld them into … ».
   La face fusionnée est écrite dans le script de la carte primaire
   (`ALTERNATE`), que le moteur range dans `def.dos` comme celle d'une
   carte transformable (js/forgeDefinition.js).

   Le permanent fusionné est la carte primaire, entrée sur le champ avec la
   face fusionnée ; la secondaire n'a plus d'objet : sa carte est notée sur le
   permanent (`meldAvec`). Quand il quitte le champ, les deux cartes vont dans
   la zone d'arrivée — ou, si c'est le champ lui-même, la secondaire attend en
   exil : une fusion défaite ne se refait pas toute seule.
   ===================================================================== */

forgeEffet('Meld', ['Name', 'Primary', 'Secondary', 'SecondaryType', 'Tapped', 'Attacking'], function* (P, t, env) {
  const j = env.ctrl;
  const miens = champDe(P, j).filter(o => o.prop === j && !o.lki);
  const prim = miens.find(o => o.def.nom === t.Primary), sec = miens.find(o => o.def.nom === t.Secondary && (!prim || o.id !== prim.id) && (!t.SecondaryType || estType(o, t.SecondaryType.toLowerCase())));
  if (!prim || !sec || !prim.def.dos || prim.def.dos.nom !== t.Name) return;
  const fusionnee = prim.def.dos, cidSec = sec.cid;
  const n1 = deplace(P, prim.id, 'exil'), n2 = deplace(P, sec.id, 'exil');
  if (n1 == null || n2 == null) return;
  /* La secondaire n'a plus d'objet : sa carte suit la primaire. */
  const so = obj(P, n2);
  if (so) { retireDe(tableauZone(P, so), n2); P.objets.delete(n2); }
  const n = yield* metEnJeu(P, n1, j, {face: fusionnee, engage: t.Tapped === 'True'});
  if (n != null && obj(P, n) && t.Attacking === 'True') entreAttaquant(P, obj(P, n), env);
  if (n != null && obj(P, n)) { obj(P, n).meldAvec = cidSec; P.ver++; jn(P, `${prim.def.nom} et ${sec.def.nom} fusionnent en ${fusionnee.nom}`); }
}, (t, op) => { op.op = 'forge'; op.hostile = false; });

/* Un permanent fusionné qui part emmène sa seconde carte avec lui. */
deplace = (g => function (P, id, vers, opts) {
  const o = obj(P, id), m = o && o.zone === 'champ' && o.meldAvec != null ? o.meldAvec : null;
  const n = g(P, id, vers, opts);
  if (m == null) return n;
  const k = P.cartes[m], zone = n != null && obj(P, n) ? obj(P, n).zone : null;
  if (!k || !zone || ['pile', 'effet'].includes(zone)) return n;
  const z = zone === 'champ' ? 'exil' : zone;
  const so = creeObjet(P, m, k.prop, z);
  const l = P.joueurs[k.prop][z];
  if (vers === 'dessous') l.unshift(so.id); else l.push(so.id);
  P.ver++;
  return n;
})(deplace);
