/* =====================================================================
   js/jeuCoutsB.js — Les morceaux de coût de plus

   Meuler, exiler le dessus de sa bibliothèque ou une carte d'un
   cimetière quelconque, retirer un marqueur de n'importe quel type,
   exert, blight, collecter des indices, rendre des cartes exilées au
   cimetière, « behold », remettre des cartes du cimetière sous la
   bibliothèque. Lus par js/forgeCout.js (`COUTS_B`), jugés et payés ici,
   à la suite de `coutAutrePossible()` et de `paieAutre()`.
   ===================================================================== */

const CHAMPS_COUTS_B = ['meule', 'exileDessus', 'exileTousCim', 'retireAny', 'exerce', 'fletrit', 'indices', 'exilVersCim', 'contemple', 'versBib'];

/* Un coût porte-t-il l'un de ces morceaux ? Une capacité de mana qui en
   porte n'est pas une source gratuite (js/jeuMana.js). */
function coutSpecial(c) { return CHAMPS_COUTS_B.some(k => c[k]); }

function marqueursRetirables(P, j, o, c) {
  const r = c.retireAny;
  const l = r.soi ? [o] : champDe(P, j).filter(x => correspond(P, x, r.desc, o, j));
  return l.reduce((s, x) => s + Object.entries(x.marq || {}).filter(([g, n]) => n > 0 && (!r.genre || g === r.genre) && g !== 'loyaute').reduce((a, [, n]) => a + n, 0), 0);
}

function coutAutrePossibleB(P, j, o, c) {
  const J = P.joueurs[j];
  if (c.meule && J.bibliotheque.length < c.meule) return false;
  if (c.exileDessus && J.bibliotheque.length < c.exileDessus) return false;
  if (c.exileTousCim && P.joueurs.reduce((s, K) => s + K.cimetiere.filter(id => id !== o.id && correspond(P, obj(P, id), c.exileTousCim.desc, o, j)).length, 0) < c.exileTousCim.n) return false;
  if (c.retireAny && marqueursRetirables(P, j, o, c) < c.retireAny.n) return false;
  if (c.exerce && (o.zone !== 'champ' || o.exerce)) return false;
  if (c.fletrit && !champDe(P, j).some(estCreature)) return false;
  if (c.indices && J.cimetiere.filter(id => id !== o.id).reduce((s, id) => s + mvDe(obj(P, id)), 0) < c.indices) return false;
  if (c.exilVersCim && J.exil.filter(id => correspond(P, obj(P, id), c.exilVersCim.desc, o, j)).length < c.exilVersCim.n) return false;
  if (c.contemple && [...champDe(P, j).map(x => x.id), ...J.main].filter(id => id !== o.id && correspond(P, obj(P, id), c.contemple.desc, o, j)).length < c.contemple.n) return false;
  if (c.versBib && J.cimetiere.filter(id => id !== o.id && correspond(P, obj(P, id), c.versBib.desc, o, j)).length < c.versBib.n) return false;
  return coutAutrePossibleX(P, j, o, c);
}

function* paieAutreB(P, j, o, c) {
  const J = P.joueurs[j];
  if (c.meule) for (let k = 0; k < c.meule && J.bibliotheque.length; k++) deplace(P, J.bibliotheque[J.bibliotheque.length - 1], 'cimetiere');
  if (c.exileDessus) for (let k = 0; k < c.exileDessus && J.bibliotheque.length; k++) deplace(P, J.bibliotheque[J.bibliotheque.length - 1], 'exil');
  if (c.exileTousCim) {
    const ids = [].concat(...P.joueurs.map(K => K.cimetiere)).filter(id => id !== o.id && correspond(P, obj(P, id), c.exileTousCim.desc, o, j));
    (yield* choisitCartes(P, j, ids, c.exileTousCim.n, 'Exiler d’un cimetière')).forEach(id => deplace(P, id, 'exil'));
  }
  if (c.retireAny) {
    let reste = c.retireAny.n;
    const l = c.retireAny.soi ? [o] : champDe(P, j).filter(x => correspond(P, x, c.retireAny.desc, o, j));
    for (const x of l) for (const g of Object.keys(x.marq || {})) {
      while (reste > 0 && x.marq[g] > 0 && g !== 'loyaute' && (!c.retireAny.genre || g === c.retireAny.genre)) { x.marq[g]--; reste--; P.ver++; }
    }
  }
  /* Exert : il ne se dégagera pas au prochain dégagement (js/jeuTour.js). */
  if (c.exerce) { o.exerce = true; P.ver++; }
  if (c.fletrit) {
    const l = champDe(P, j).filter(estCreature).map(x => x.id);
    const pris = yield* choisitCartes(P, j, l, 1, 'Blight', 'cartes', 1);
    pris.forEach(id => poseMarqueurs(P, obj(P, id), '-1/-1', c.fletrit, o));
  }
  if (c.indices) {
    /* Les moins chères d'abord, jusqu'à la valeur demandée. */
    let total = 0;
    J.cimetiere.filter(id => id !== o.id).sort((a, b) => mvDe(obj(P, a)) - mvDe(obj(P, b))).forEach(id => {
      if (total < c.indices) { total += mvDe(obj(P, id)); deplace(P, id, 'exil'); }
    });
  }
  if (c.exilVersCim) {
    const ids = J.exil.filter(id => correspond(P, obj(P, id), c.exilVersCim.desc, o, j));
    (yield* choisitCartes(P, j, ids, c.exilVersCim.n, 'Du l’exil au cimetière')).forEach(id => deplace(P, id, 'cimetiere'));
  }
  if (c.versBib) {
    const ids = J.cimetiere.filter(id => id !== o.id && correspond(P, obj(P, id), c.versBib.desc, o, j));
    (yield* choisitCartes(P, j, ids, c.versBib.n, 'Sous la bibliothèque')).forEach(id => deplace(P, id, 'dessous'));
  }
  yield* paieAutreX(P, j, o, c);
}
