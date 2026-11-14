/* =====================================================================
   js/jeuPrepare.js — Lancer le sort d'une créature préparée

   Une carte Prepare est une créature qui porte un sort (sa face `dos`).
   Tant qu'elle est préparée (`o.prepare`, posé par js/forgeDurees.js), son
   contrôleur peut lancer une copie de ce sort ; cela la déprépare. La
   copie est une carte-jeton glissée dans sa main le temps de la lancer :
   elle passe par le lancement ordinaire (coût, cibles, déclencheurs de
   lancement), puis cesse d'exister en quittant la pile.
   ===================================================================== */

/* Les copies que `j` peut lancer de ses créatures préparées. */
function actionsPrepare(P, j, rituel) {
  const r = [];
  for (const id of P.champ) {
    const o = obj(P, id), d = o.def.dos;
    if (o.ctrl !== j || !o.prepare || !d || o.def.modeFaces !== 'Prepare') continue;
    if ((!rituel && !estEphemere(d)) || !planPaiement(P, j, d.cout, 0)) continue;
    if (d.sort && !effetCiblable(P, j, o, d.sort, d.couleurs)) continue;
    r.push({k: 'lancer', id, depuis: 'champ', variante: 'prepare'});
  }
  return r;
}

function* lancePrepare(P, j, a) {
  const o = obj(P, a.id);
  if (!o || !o.prepare || !o.def.dos) return false;
  const cid = nouvelleCarte(P, o.def.dos, j, false, true);
  P.cartes[cid].copieSort = true;
  const c = creeObjet(P, cid, j, 'main');
  P.joueurs[j].main.push(c.id);
  if (yield* lanceSort(P, j, {k: 'lancer', id: c.id, depuis: 'main'})) { o.prepare = false; P.ver++; return true; }
  /* Pas lancée : la copie ne reste pas en main. */
  P.joueurs[j].main.filter(id => obj(P, id).cid === c.cid).forEach(id => { retireDe(P.joueurs[j].main, id); P.objets.delete(id); });
  return false;
}
