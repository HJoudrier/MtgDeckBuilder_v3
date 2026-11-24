/* =====================================================================
   js/forgeChaque.js — « Search for a Forest card and a Plains card »

   Lot F96 : `ChangeType$ EACH Forest & Plains` (Krosan Verge) et
   `EACH Aura & Equipment` (Axgard Armory) cherchent, pour chacun des
   filtres joints par « & », jusqu'à une carte. Une même carte ne sert pas
   deux filtres. Le joueur peut ne rien trouver : une bibliothèque se fouille
   sans avoir à réussir.
   ===================================================================== */

/* Les filtres d'un « EACH A & B », ou rien. */
function chaqueFiltres(ct) {
  const m = /^EACH (.+)$/.exec(ct || '');
  return m ? m[1].split(/\s*&\s*/) : null;
}

/* Une carte par filtre, dans l'ordre, parmi `ids`. */
function* choisitChacun(P, qui, ids, filtres, env) {
  const pris = [];
  for (const f of filtres) {
    const l = ids.filter(id => !pris.includes(id) && forgeValideObjet(P, obj(P, id), f, env.src, env.ctrl, env));
    pris.push(...yield* choisitCartes(P, qui, l, 1, 'Chercher', 'cartes', 0));
  }
  return pris;
}
