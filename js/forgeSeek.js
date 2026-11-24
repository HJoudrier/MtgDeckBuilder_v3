/* =====================================================================
   js/forgeSeek.js — Chercher au hasard, et ne le faire qu'une fois la partie

   Lot F97 :
   - `Seek | Type$ <filtre> | Num$ N` (les portes de Alchemy : Gate to Manorborn,
     Echoing Cavern) : N cartes tirées au hasard parmi celles de la bibliothèque
     qui répondent au filtre, mises en main. Pas de recherche au sens des
     règles — rien n'est mélangé, aucun évènement `cherche` ;
   - `GameActivationLimit$ N` : une capacité qu'on ne joue que N fois de la
     partie, quel que soit le tour (`P.limites`, tenu par carte).
   ===================================================================== */

forgeEffet('Seek', ['Type', 'Num', 'RememberFound'], function* (P, t, env) {
  for (const j of joueursForge(P, t, env)) {
    const bib = P.joueurs[j].bibliotheque;
    const cands = bib.filter(id => !t.Type || forgeValideObjet(P, obj(P, id), t.Type, env.src, env.ctrl, env));
    melangeHasard(P.rng, cands);
    cands.slice(0, forgeNombre(P, t.Num || 1, env)).forEach(id => {
      const n = deplace(P, id, 'main');
      if (n != null && t.RememberFound === 'True') retiensForge(env.ctx, n);
    });
  }
}, (t, op) => { op.op = 'forge'; op.hostile = false; }, {prepare: t => !t.DefinedCards && !t.Types});

/* —— Une capacité limitée à la partie —————————————————————————————— */

const cleLimite = (o, k) => o.cid + '|' + (k.texte || '');

activationInterdite = (g => function (P, j, o, k) {
  if (k.limitePartie && ((P.limites || {})[cleLimite(o, k)] || 0) >= k.limitePartie) return true;
  return g(P, j, o, k);
})(activationInterdite);

/* La capacité vient d'être payée : elle compte pour la partie. */
function noteLimitePartie(P, o, k) {
  if (!k.limitePartie) return;
  const l = P.limites = P.limites || {};
  l[cleLimite(o, k)] = (l[cleLimite(o, k)] || 0) + 1;
}

forgeSait('param', 'Seek.GameActivationLimit');
