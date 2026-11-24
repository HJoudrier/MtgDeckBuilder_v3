/* =====================================================================
   js/forgeManaCompteurs.js — Du mana contre des marqueurs de la source

   Lot F99. Crucible of the Spirit Dragon : « {T}, remove X storage counters
   from ~ : add X mana in any combination of colors. Spend this mana only to
   cast Dragon spells or activate abilities of Dragons » ; Throne of Makindi :
   « {T}, remove a charge counter : add two mana of any one color. Spend this
   mana only to cast kicked spells ».

   Le solveur de js/jeuMana.js sait payer une source pour une option : ces
   capacités lui offrent une option par quantité de mana qu'elles peuvent
   verser (`optionsCompteurs()`), la quantité ne dépassant ni les marqueurs
   présents ni cinq — au-delà, les combinaisons de couleurs se compteraient
   par centaines et aucun sort n'en réclame autant. Payer une de ces options
   retire les marqueurs (`activeSource()`). Le mana reste restreint : la source
   ne sert qu'à ce que `RestrictValid$` permet (`manaPermis()`).
   ===================================================================== */

capaciteForge = (g => function (def, face, t, jetons) {
  if (forgeApi(t) !== 'Mana' || t.SubAbility || !t.RestrictValid || !/^(Any|Combo Any)$/.test(t.Produced || '')) return g(def, face, t, jetons);
  const c = coutForge(t.Cost), r = c && c.cout.retire;
  if (!c || !r || r.genre == null || Object.keys(c.cout).some(k => !['mana', 'engage', 'retire'].includes(k)) || (c.cout.mana && c.cout.mana.total) || !tableJouable(t)) return g(def, face, t, jetons);
  const montant = t.Amount || '1';
  /* X compté en marqueurs retirés ; ou un nombre écrit, avec un nombre de marqueurs écrit. */
  if (r.n === 'X' ? montant !== 'X' || !/xPaid/.test(face.svars.X || '') || t.Produced !== 'Combo Any' : !/^\d+$/.test(montant) || typeof r.n !== 'number') return g(def, face, t, jetons);
  def.capacites.push({genre: 'mana', cout: c.cout, options: [], compteurs: {genre: r.genre, n: r.n, produit: t.Produced, montant}, restreint: t.RestrictValid, texte: texteForge(face, t)});
  return true;
})(capaciteForge);

/* Toutes les combinaisons de `n` couleurs, sans ordre : « WWU », « WUR »… */
function combinaisonsCouleurs(n) {
  const r = [];
  const va = (reste, debut, pris) => { if (!reste) { r.push(pris); return; } for (let i = debut; i < 5; i++) va(reste - 1, i, pris + 'WUBRG'[i]); };
  va(n, 0, '');
  return r;
}

/* Les options d'une telle capacité, selon les marqueurs que son porteur a. */
function optionsCompteurs(P, o, k) {
  const a = k.compteurs, ont = o.marq[a.genre] || 0;
  if (a.n === 'X') return [].concat(...Array.from({length: Math.min(ont, 5)}, (_, i) => combinaisonsCouleurs(i + 1)));
  return ont >= a.n ? optionsMana(a.produit, +a.montant) : [];
}

