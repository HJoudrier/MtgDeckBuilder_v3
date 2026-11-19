/* =====================================================================
   js/forgeHideaway.js — Hideaway : cacher une carte, la jouer plus tard

   « Hideaway 4 — When this enters, look at the top four cards of your
   library, exile one face down, then put the rest on the bottom in a random
   order. » La carte exilée est celle de la source (`ExiledWith`), que
   l'activation du terrain peut jouer sans payer, si sa condition tient
   (Windbrisk Heights, Mosswort Bridge, Spinerock Knoll, Clive's Hideaway…).
   Le mot-clé est un déclencheur d'entrée synthétique, dont l'effet est
   `Hideaway` ; le reste du terrain est un script ordinaire.
   ===================================================================== */

forgeEffet('Hideaway', ['DigNum'], function* (P, t, env) {
  const j = env.ctrl, B = P.joueurs[j].bibliotheque, n = forgeNombre(P, t.DigNum || 4, env);
  const dessus = B.slice(-n).reverse();
  if (!dessus.length) return;
  const [pris] = yield* choisitCartes(P, j, dessus, 1, 'Cacher', 'cartes', 1);
  const reste = dessus.filter(id => id !== pris);
  /* Le reste passe sous la bibliothèque, dans un ordre tiré. */
  melangeHasard(P.rng, reste);
  reste.forEach(id => { retireDe(B, id); B.unshift(id); });
  if (pris == null) return;
  const nid = deplace(P, pris, 'exil');
  const k = env.src && P.cartes[env.src.cid];
  if (nid != null && k) (k.exilees = k.exilees || []).push(nid);
  jn(P, `${P.joueurs[j].nom} cache une carte`);
}, (t, op) => { op.op = 'cherche'; op.n = 1; op.hostile = false; op.desc = {types: []}; });

motCleLancementB = (g => function (def, face, jetons, tete, reste) {
  if (tete !== 'Hideaway') return g(def, face, jetons, tete, reste);
  return reste.length === 1 && /^\d+$/.test(reste[0]) && synthese(def, face, jetons, 'Cachette', ENTRE, `DB$ Hideaway | DigNum$ ${reste[0]}`);
})(motCleLancementB);

forgeSait('kw', 'Hideaway');
