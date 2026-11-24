/* =====================================================================
   js/jeuManaChoix.js — Choisir quel mana de la réserve paie le générique

   Lot F102. Un sort qui coûte {2}{R} se paie, sur la réserve, de la couleur
   exigée puis de n'importe quel mana : le solveur prend l'incolore d'abord,
   puis la couleur la plus abondante. Un joueur qui a plusieurs sortes de
   mana en réserve veut parfois garder l'une plutôt que l'autre. Quand la
   réserve offre un vrai choix — plus de mana qu'il n'en faut pour le
   générique, de plus d'une couleur —, le moteur le lui demande, et retient
   la réponse (`J.prefGen`) pour le paiement qui suit (`debite()`,
   js/jeuMana.js). Un siège automatique ne se le voit jamais demander.

   Seul le mana de la réserve ordinaire compte : celui que paieraient des
   sources encore dégagées se choisit en les engageant soi-même (paiement à
   la main), et le mana restreint ne paie que ce qu'il permet.
   ===================================================================== */

const NOMS_MANA_CHOIX = {W: 'Blanc', U: 'Bleu', B: 'Noir', R: 'Rouge', G: 'Vert', C: 'Incolore'};

/* Ce que le générique laisse à choisir : les mana de la réserve, un par unité, ou `null` s'il n'y a rien à décider. */
function manaAChoisir(P, j, cout, x) {
  const J = P.joueurs[j];
  if (!J.reglable || !cout) return null;
  const pool = {...J.pool};
  /* Les couleurs exigées d'abord, de la réserve quand elle les a. */
  LETTRES_MANA.forEach(k => { pool[k] = Math.max(0, pool[k] - (cout.couleurs[k] || 0)); });
  (cout.hybrides || []).forEach(h => { const k = h.find(c => pool[c] > 0); if (k) pool[k]--; });
  const g = (cout.generique || 0) + (cout.x || 0) * (x || 0);
  const unites = [];
  LETTRES_MANA.forEach(k => { for (let n = 0; n < pool[k]; n++) unites.push(k); });
  if (g <= 0 || unites.length <= g || new Set(unites).size < 2) return null;
  return {unites, g};
}

/* La question : quel mana dépenser pour la part incolore du coût. */
function* choisitManaPaye(P, j, cout, x) {
  const c = manaAChoisir(P, j, cout, x);
  if (!c) return;
  const J = P.joueurs[j];
  const r = yield question(P, j, 'modes', c.unites.map(k => `${NOMS_MANA_CHOIX[k]} (${k})`), {min: c.g, max: c.g, multi: true,
    texte: `Quel mana dépenser pour ${c.g} générique ?`,
    /* Les premiers de la liste : ce que le solveur aurait pris, l'incolore d'abord. */
    defaut: [...c.unites.keys()].sort((a, b) => (c.unites[b] === 'C') - (c.unites[a] === 'C')).slice(0, c.g)});
  const pris = (Array.isArray(r) ? r : [r]).map(i => c.unites[i]).filter(Boolean);
  J.prefGen = {};
  pris.forEach(k => { J.prefGen[k] = (J.prefGen[k] || 0) + 1; });
}
