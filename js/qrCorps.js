/* =====================================================================
   js/qrCorps.js — Le corps fini du QR code, et Reed–Solomon

   Un QR code se répare lui-même : ses mots de données sont suivis de mots
   de correction, calculés dans le corps à 256 éléments (polynôme 0x11D). On
   les calcule pour l'écrire (js/qrEcrit.js), on s'en sert pour corriger ce
   qu'une caméra a mal lu (js/qrLit.js). Écrit à la main : l'atelier n'a
   aucune dépendance.

   Les tables des blocs couvrent les versions 1 à 10 — un QR de jusqu'à 57
   modules de côté —, ce qui suffit aux deux messages de la liaison.
   ===================================================================== */

const GF_EXP = new Uint8Array(512), GF_LOG = new Uint8Array(256);
(function () {
  let x = 1;
  for (let i = 0; i < 255; i++) {
    GF_EXP[i] = x; GF_LOG[x] = i;
    x <<= 1;
    if (x & 0x100) x ^= 0x11d;
  }
  for (let i = 255; i < 512; i++) GF_EXP[i] = GF_EXP[i - 255];
})();

function gfMul(a, b) { return a && b ? GF_EXP[GF_LOG[a] + GF_LOG[b]] : 0; }
function gfDiv(a, b) { return a ? GF_EXP[(GF_LOG[a] + 255 - GF_LOG[b]) % 255] : 0; }
function gfPow(e) { return GF_EXP[((e % 255) + 255) % 255]; }

/* Le polynôme générateur de n mots de correction : ∏ (x − αⁱ), i < n,
   coefficients du plus haut degré au plus bas. */
function rsGenerateur(n) {
  let g = [1];
  for (let i = 0; i < n; i++) {
    const r = new Array(g.length + 1).fill(0);
    for (let j = 0; j < g.length; j++) { r[j] ^= g[j]; r[j + 1] ^= gfMul(g[j], gfPow(i)); }
    g = r;
  }
  return g;
}

/* Les n mots de correction d'un bloc de données. */
function rsCorrection(donnees, n) {
  const g = rsGenerateur(n), r = new Array(n).fill(0);
  for (const d of donnees) {
    const f = d ^ r[0];
    r.shift(); r.push(0);
    if (f) for (let j = 0; j < n; j++) r[j] ^= gfMul(g[j + 1], f);
  }
  return r;
}

/* Évaluer un polynôme (degré haut d'abord) en x. */
function polyVal(p, x) { let y = 0; for (const c of p) y = gfMul(y, x) ^ c; return y; }

/* Corriger un bloc reçu (données puis correction) qui porte n mots de
   correction : syndromes, Berlekamp–Massey, Chien, Forney. Rend le bloc
   corrigé, ou `null` si les erreurs dépassent ce que n mots réparent. */
function rsDecode(recu, n) {
  const synd = [];
  let nul = true;
  for (let i = 0; i < n; i++) { const s = polyVal(recu, gfPow(i)); synd.push(s); if (s) nul = false; }
  if (nul) return recu.slice();
  // Berlekamp–Massey : Λ(x), coefficients du plus bas degré au plus haut.
  let L = [1], B = [1], l = 0, m = 1, b = 1;
  for (let k = 0; k < n; k++) {
    let d = synd[k];
    for (let i = 1; i <= l; i++) d ^= gfMul(L[i] || 0, synd[k - i]);
    if (!d) { m++; continue; }
    const T = L.slice(), coef = gfDiv(d, b);
    const lon = Math.max(L.length, B.length + m);
    while (L.length < lon) L.push(0);
    for (let i = 0; i < B.length; i++) L[i + m] ^= gfMul(coef, B[i]);
    if (2 * l <= k) { l = k + 1 - l; B = T; b = d; m = 1; } else m++;
  }
  while (L.length > 1 && !L[L.length - 1]) L.pop();
  if (L.length - 1 !== l || 2 * l > n) return null;
  // Chien : les positions dont l'inverse annule Λ.
  const N = recu.length, pos = [];
  for (let i = 0; i < N; i++) {
    const xinv = gfPow(-(N - 1 - i));
    let v = 0;
    for (let j = L.length - 1; j >= 0; j--) v = gfMul(v, xinv) ^ L[j];
    if (!v) pos.push(i);
  }
  if (pos.length !== l) return null;
  // Forney : Ω = S·Λ mod x^n, magnitude = X·Ω(X⁻¹) / Λ'(X⁻¹).
  const om = new Array(n).fill(0);
  for (let i = 0; i < n; i++) for (let j = 0; j < L.length && i + j < n; j++) om[i + j] ^= gfMul(synd[i], L[j]);
  const out = recu.slice();
  for (const p of pos) {
    const X = gfPow(N - 1 - p), xinv = gfDiv(1, X);
    let num = 0;
    for (let i = om.length - 1; i >= 0; i--) num = gfMul(num, xinv) ^ om[i];
    let den = 0;
    for (let j = 1; j < L.length; j += 2) den ^= gfMul(L[j], gfPow((j - 1) * GF_LOG[xinv]));
    if (!den) return null;
    out[p] ^= gfMul(X, gfDiv(num, den));
  }
  for (let i = 0; i < n; i++) if (polyVal(out, gfPow(i))) return null;
  return out;
}

/* Les blocs de chaque version et niveau de correction :
   [mots de correction par bloc, blocs du groupe 1, données par bloc du
   groupe 1, blocs du groupe 2, données par bloc du groupe 2]. */
const QR_BLOCS = {
  L: [null, [7,1,19,0,0], [10,1,34,0,0], [15,1,55,0,0], [20,1,80,0,0], [26,1,108,0,0], [18,2,68,0,0], [20,2,78,0,0], [24,2,97,0,0], [30,2,116,0,0], [18,2,68,2,69]],
  M: [null, [10,1,16,0,0], [16,1,28,0,0], [26,1,44,0,0], [18,2,32,0,0], [24,2,43,0,0], [16,4,27,0,0], [18,4,31,0,0], [22,2,38,2,39], [22,3,36,2,37], [26,4,43,1,44]],
  Q: [null, [13,1,13,0,0], [22,1,22,0,0], [18,2,17,0,0], [26,2,24,0,0], [18,2,15,2,16], [24,4,19,0,0], [18,2,14,4,15], [22,4,18,2,19], [20,4,16,4,17], [24,6,19,2,20]],
  H: [null, [17,1,9,0,0], [28,1,16,0,0], [22,2,13,0,0], [16,4,9,0,0], [22,2,11,2,12], [28,4,15,0,0], [26,4,13,1,14], [26,4,14,2,15], [24,4,12,4,13], [28,6,15,2,16]]
};

/* Le nombre de mots de données d'une version à un niveau. */
function qrCapacite(v, niveau) {
  const [, b1, d1, b2, d2] = QR_BLOCS[niveau][v];
  return b1 * d1 + b2 * d2;
}
