/* =====================================================================
   js/qrMatrice.js — La grille d'un QR code

   Ce que l'écriture et la lecture partagent : où sont les motifs fixes
   (repérage, synchronisation, alignement), où vont les bits de format et de
   version, dans quel ordre les mots de données serpentent entre eux, et les
   huit masques. Écrire et lire ne diffèrent que par le sens : poser les
   bits, ou les ramasser dans le même ordre.

   Coordonnées : `x` la colonne, `y` la ligne, comme dans la norme.
   ===================================================================== */

const QR_ALIGNEMENTS = [null, [], [6, 18], [6, 22], [6, 26], [6, 30], [6, 34], [6, 22, 38], [6, 24, 42], [6, 26, 46], [6, 28, 50]];
const QR_NIVEAUX = {L: 1, M: 0, Q: 3, H: 2};

function qrTaille(v) { return 17 + 4 * v; }

/* Les 15 bits de format d'un niveau et d'un masque (BCH 15,5, masqué). */
function qrBitsFormat(niveau, masque) {
  const d = QR_NIVEAUX[niveau] << 3 | masque;
  let r = d;
  for (let i = 0; i < 10; i++) r = (r << 1) ^ ((r >>> 9) * 0x537);
  return ((d << 10) | r) ^ 0x5412;
}

/* Les 18 bits de version (BCH 18,6), à partir de la version 7. */
function qrBitsVersion(v) {
  let r = v;
  for (let i = 0; i < 12; i++) r = (r << 1) ^ ((r >>> 11) * 0x1f25);
  return v << 12 | r;
}

/* Une grille vide et le relevé de ses modules fixes : `fixe[y][x]` est vrai
   là où ni donnée ni correction n'ira. */
function qrGrille(v) {
  const n = qrTaille(v);
  const m = Array.from({length: n}, () => new Array(n).fill(false));
  const fixe = Array.from({length: n}, () => new Array(n).fill(false));
  const pose = (x, y, noir) => { if (x >= 0 && y >= 0 && x < n && y < n) { m[y][x] = noir; fixe[y][x] = true; } };
  for (let i = 0; i < n; i++) { pose(6, i, i % 2 === 0); pose(i, 6, i % 2 === 0); }
  const reperage = (cx, cy) => {
    for (let dy = -4; dy <= 4; dy++) for (let dx = -4; dx <= 4; dx++) {
      const d = Math.max(Math.abs(dx), Math.abs(dy));
      pose(cx + dx, cy + dy, d !== 2 && d !== 4);
    }
  };
  reperage(3, 3); reperage(n - 4, 3); reperage(3, n - 4);
  const al = QR_ALIGNEMENTS[v];
  al.forEach((ay, i) => al.forEach((ax, j) => {
    if ((i === 0 && j === 0) || (i === 0 && j === al.length - 1) || (i === al.length - 1 && j === 0)) return;
    for (let dy = -2; dy <= 2; dy++) for (let dx = -2; dx <= 2; dx++) pose(ax + dx, ay + dy, Math.max(Math.abs(dx), Math.abs(dy)) !== 1);
  }));
  // Réserver le format (et le module toujours noir), puis la version.
  for (let i = 0; i < 9; i++) if (i !== 6) { pose(8, i, false); pose(i, 8, false); }
  for (let i = 0; i < 8; i++) { pose(n - 1 - i, 8, false); pose(8, n - 1 - i, false); }
  pose(8, n - 8, true);
  if (v >= 7) {
    const b = qrBitsVersion(v);
    for (let i = 0; i < 18; i++) {
      const bit = ((b >>> i) & 1) === 1, a = n - 11 + i % 3, c = Math.floor(i / 3);
      pose(a, c, bit); pose(c, a, bit);
    }
  }
  return {n, m, fixe};
}

/* Les positions des 15 bits de format, en deux copies, bit i d'abord. */
function qrPositionsFormat(n) {
  const a = [], b = [];
  for (let i = 0; i <= 5; i++) a.push([8, i]);
  a.push([8, 7], [8, 8], [7, 8]);
  for (let i = 9; i < 15; i++) a.push([14 - i, 8]);
  for (let i = 0; i < 8; i++) b.push([n - 1 - i, 8]);
  for (let i = 8; i < 15; i++) b.push([8, n - 15 + i]);
  return [a, b];
}

function qrPoseFormat(g, niveau, masque) {
  const bits = qrBitsFormat(niveau, masque);
  qrPositionsFormat(g.n).forEach(copie => copie.forEach(([x, y], i) => { g.m[y][x] = ((bits >>> i) & 1) === 1; }));
  g.m[g.n - 8][8] = true;
}

/* L'ordre des modules de données : des colonnes de deux, de droite à
   gauche, en serpentant de bas en haut puis de haut en bas, la colonne de
   synchronisation sautée. */
function qrOrdre(g) {
  const r = [], n = g.n;
  for (let droite = n - 1; droite >= 1; droite -= 2) {
    if (droite === 6) droite = 5;
    for (let k = 0; k < n; k++) for (let j = 0; j < 2; j++) {
      const x = droite - j, monte = ((droite + 1) & 2) === 0, y = monte ? n - 1 - k : k;
      if (!g.fixe[y][x]) r.push([x, y]);
    }
  }
  return r;
}

const QR_MASQUES = [
  (x, y) => (x + y) % 2 === 0, (x, y) => y % 2 === 0, x => x % 3 === 0, (x, y) => (x + y) % 3 === 0,
  (x, y) => (Math.floor(x / 3) + Math.floor(y / 2)) % 2 === 0, (x, y) => (x * y) % 2 + (x * y) % 3 === 0,
  (x, y) => ((x * y) % 2 + (x * y) % 3) % 2 === 0, (x, y) => ((x + y) % 2 + (x * y) % 3) % 2 === 0
];

/* Appliquer (ou retirer : c'est la même opération) un masque aux modules
   de données. */
function qrMasque(g, k) {
  const f = QR_MASQUES[k];
  for (let y = 0; y < g.n; y++) for (let x = 0; x < g.n; x++) if (!g.fixe[y][x] && f(x, y)) g.m[y][x] = !g.m[y][x];
}
