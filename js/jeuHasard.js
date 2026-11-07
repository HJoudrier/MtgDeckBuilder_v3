/* =====================================================================
   js/jeuHasard.js — Le hasard semé du moteur

   Le moteur n'appelle jamais `Math.random` : chaque partie tire son hasard
   d'un générateur `sfc32` semé par la graine de la partie, et chaque joueur
   automatique d'un flux à lui, semé par la graine et son siège. Même graine,
   mêmes decks, même moteur : même partie, coup pour coup. C'est ce qui
   permet de revoir une partie sans l'avoir gardée, et de comparer deux decks
   sur les mêmes mélanges adverses.
   ===================================================================== */

/* Brasser deux entiers en un troisième, pour dériver une graine d'une autre. */
function brasse(a, b) {
  let h = (a ^ 0x9e3779b9) >>> 0;
  h = Math.imul(h ^ (b >>> 0), 0x85ebca6b);
  h ^= h >>> 13; h = Math.imul(h, 0xc2b2ae35); h ^= h >>> 16;
  return h >>> 0;
}

/* L'état d'un générateur, chauffé quinze tirages pour qu'une graine voisine
   ne donne pas une suite voisine. */
function etatHasard(graine) {
  const st = [0x9e3779b9, 0x243f6a88, 0xb7e15162, graine >>> 0];
  for (let i = 0; i < 15; i++) tireHasard(st);
  return st;
}

/* Un tirage dans [0, 1). */
function tireHasard(st) {
  let a = st[0] | 0, b = st[1] | 0, c = st[2] | 0, d = st[3] | 0;
  const t = (((a + b) | 0) + d) | 0;
  d = (d + 1) | 0;
  a = b ^ (b >>> 9);
  b = (c + (c << 3)) | 0;
  c = (c << 21) | (c >>> 11);
  c = (c + t) | 0;
  st[0] = a; st[1] = b; st[2] = c; st[3] = d;
  return (t >>> 0) / 4294967296;
}

/* Un entier dans [0, n). */
function entierHasard(st, n) { return Math.floor(tireHasard(st) * n); }

/* Mélanger un tableau sur place (Fisher-Yates). */
function melangeHasard(st, t) {
  for (let i = t.length - 1; i > 0; i--) {
    const j = entierHasard(st, i + 1);
    const x = t[i]; t[i] = t[j]; t[j] = x;
  }
  return t;
}
