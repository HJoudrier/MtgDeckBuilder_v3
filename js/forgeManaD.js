/* =====================================================================
   js/forgeManaD.js — Dépenser du mana d'une autre couleur, et en compter la dépense

   Lot F84 :
   - `ManaConvert | ManaConversion$ AnyType->AnyColor` (Chromatic Orrery,
     Mycosynth Lattice, Oath of Nissa) et `C->AnyColor` (Abstruse
     Appropriation) : « you may spend mana as though it were mana of any
     color ». Le solveur de js/jeuMana.js apparie des sources à des couleurs :
     chaque source du joueur concerné offre alors toutes les couleurs, en
     gardant les siennes. Le mana versé dans la réserve est celui de la
     couleur payée. `ValidPlayer$`, `ValidSA$ Spell`, `ValidCard$` (le type du
     sort : Oath ne vaut que pour les planeswalkers) bornent la conversion ;
   - `ManaExpend` (Pyreswipe Hawk, Trailtracker Scout) : « you expend N » à
     l'instant où le N-ième mana du tour se dépense pour lancer des sorts.
     Le décompte de chaque joueur se tient par tour (`J.depenseTour`), et
     chaque paiement d'un sort dit d'où il part et où il arrive.
   Limite : le mana déjà versé en réserve garde sa couleur — la conversion
   joue sur les sources, non sur la réserve.
   ===================================================================== */

forgeStatique('ManaConvert', ['ValidPlayer', 'ValidCard', 'ValidSA', 'ManaConversion', 'AffectedZone'], () => {});

const TOUTES_COULEURS_MANA = ['W', 'U', 'B', 'R', 'G'];

/* Ce que la conversion permet à `j` pour ce paiement : tout, ou seulement l'incolore. */
function conversionsMana(P, j, pour) {
  let tout = false, incolore = false;
  for (const x of statiquesMode(P, 'ManaConvert')) {
    const t = x.s.t, env = envStatique(x.src, x.s);
    if (!conditionForge(P, t, env) || !joueurStatique(P, j, t.ValidPlayer, x.src, env)) continue;
    if (t.ValidSA && !(pour && pour.sort && (!/MayPlaySource/.test(t.ValidSA) || pour.sort.varianteLance === 'permis'))) continue;
    /* Le type du sort : `Planeswalker.YouCtrl`. Un filtre plus fin n'est pas jugé, et vaut « tout sort ». */
    const type = /^(Creature|Planeswalker|Artifact|Enchantment|Land|Instant|Sorcery)\b/.exec(t.ValidCard || '');
    if (type && !(pour && pour.sort && pour.sort.def.types.includes(type[1].toLowerCase()))) continue;
    if (t.ManaConversion === 'AnyType->AnyColor') tout = true;
    else if (t.ManaConversion === 'C->AnyColor') incolore = true;
  }
  return {tout, incolore};
}

/* Une source qui offre, en plus des siennes, chaque couleur à chaque longueur qu'elle produit. */
function sourceConvertie(s) {
  const longueurs = [...new Set(s.options.map(o => o.length))];
  const options = [...s.options];
  for (const L of TOUTES_COULEURS_MANA) for (const n of longueurs) if (!options.includes(L.repeat(n))) options.push(L.repeat(n));
  return {...s, options, couleurs: [...new Set([...s.couleurs, ...TOUTES_COULEURS_MANA])]};
}

sourcesMana = (g => function (P, j, pour) {
  const r = g(P, j, pour);
  if (!r.length || !P.champ.some(id => obj(P, id).def.statiques.length)) return r;
  const c = conversionsMana(P, j, pour);
  if (!c.tout && !c.incolore) return r;
  return r.map(s => c.tout || s.options.every(o => /^C+$/.test(o)) ? sourceConvertie(s) : s);
})(sourcesMana);

/* —— Dépenser son N-ième mana —————————————————————————————————— */

paieMana = (g => function (P, j, cout, x, pour) {
  const ok = g(P, j, cout, x, pour);
  if (ok && pour && pour.sort) {
    /* Le coût payé, X compris : ce que les sources versent s'ajoute à la réserve avant d'en sortir, la différence
       de la réserve ne le dirait pas. */
    const J = P.joueurs[j], n = cout.total + (cout.x || 0) * (x || 0);
    const d = J.depenseTour && J.depenseTour.tour === P.tour ? J.depenseTour.n : 0;
    if (n > 0) { J.depenseTour = {tour: P.tour, n: d + n}; emet(P, {t: 'depense', joueur: j, de: d, a: d + n}); }
  }
  return ok;
})(paieMana);

forgeMode('ManaExpend', ['Amount', 'Player'], (P, t, e, s, env) => e.t === 'depense' && joueurOuRien(P, e.joueur, t.Player, s, env) &&
  e.de < forgeNombre(P, t.Amount, env) && e.a >= forgeNombre(P, t.Amount, env));
