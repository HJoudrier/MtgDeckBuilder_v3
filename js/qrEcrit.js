/* =====================================================================
   js/qrEcrit.js — Écrire un QR code

   Un texte devient une grille : en mode alphanumérique s'il n'emploie que
   les quarante-cinq signes de ce mode (le code de réponse d'un invité, en
   base45, deux signes pour onze bits), en octets sinon (l'adresse que lit
   l'appareil photo). La plus petite version qui le contient au niveau de
   correction M, ses mots de correction entrelacés, puis le masque le moins
   pénalisé — celui qui se lit le mieux.

   Le rendu est un SVG noir sur blanc **forcé** : la seule exception à la
   règle des couleurs de l'atelier. Un QR peint en clair sur sombre ne se
   lit pas.
   ===================================================================== */

const QR_ALNUM = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ $%*+-./:';

function qrEstAlnum(t) { return [...t].every(c => QR_ALNUM.includes(c)); }

/* Les bits d'un texte dans une version donnée (la largeur du compte de
   caractères change à la version 10). */
function qrBitsDonnees(texte, v) {
  const bits = [], pousse = (val, n) => { for (let i = n - 1; i >= 0; i--) bits.push((val >>> i) & 1); };
  if (qrEstAlnum(texte)) {
    pousse(2, 4); pousse(texte.length, v < 10 ? 9 : 11);
    for (let i = 0; i + 1 < texte.length; i += 2) pousse(45 * QR_ALNUM.indexOf(texte[i]) + QR_ALNUM.indexOf(texte[i + 1]), 11);
    if (texte.length % 2) pousse(QR_ALNUM.indexOf(texte[texte.length - 1]), 6);
  } else {
    const o = new TextEncoder().encode(texte);
    pousse(4, 4); pousse(o.length, v < 10 ? 8 : 16);
    o.forEach(b => pousse(b, 8));
  }
  return bits;
}

/* Les mots de données, complétés, découpés en blocs, suivis de leur
   correction, entrelacés. */
function qrMots(bits, v, niveau) {
  const cap = qrCapacite(v, niveau) * 8;
  for (let i = 0; i < 4 && bits.length < cap; i++) bits.push(0);
  while (bits.length % 8) bits.push(0);
  const mots = [];
  for (let i = 0; i < bits.length; i += 8) mots.push(bits.slice(i, i + 8).reduce((a, b) => a << 1 | b, 0));
  for (let p = 0xec; mots.length < cap / 8; p ^= 0xec ^ 0x11) mots.push(p);
  const [ec, b1, d1, b2, d2] = QR_BLOCS[niveau][v];
  const blocs = [];
  let k = 0;
  for (let i = 0; i < b1 + b2; i++) { const n = i < b1 ? d1 : d2; blocs.push(mots.slice(k, k + n)); k += n; }
  const corr = blocs.map(b => rsCorrection(b, ec));
  const out = [];
  for (let i = 0; i < Math.max(d1, d2); i++) blocs.forEach(b => { if (i < b.length) out.push(b[i]); });
  for (let i = 0; i < ec; i++) corr.forEach(c => out.push(c[i]));
  return out;
}

/* La pénalité d'une grille (norme, §7.8.3) : les longues suites, les carrés
   de quatre, ce qui imite un motif de repérage, le déséquilibre. */
function qrPenalite(m) {
  const n = m.length;
  let p = 0, noirs = 0;
  const ligne = get => {
    let suite = 1;
    for (let i = 1; i <= n; i++) {
      if (i < n && get(i) === get(i - 1)) { suite++; continue; }
      if (suite >= 5) p += suite - 2;
      suite = 1;
    }
    for (let i = 0; i + 11 <= n; i++) {
      const s = Array.from({length: 11}, (_, k) => get(i + k) ? 1 : 0).join('');
      if (s === '10111010000' || s === '00001011101') p += 40;
    }
  };
  for (let y = 0; y < n; y++) { ligne(x => m[y][x]); for (let x = 0; x < n; x++) if (m[y][x]) noirs++; }
  for (let x = 0; x < n; x++) ligne(y => m[y][x]);
  for (let y = 0; y + 1 < n; y++) for (let x = 0; x + 1 < n; x++) {
    const c = m[y][x];
    if (c === m[y][x + 1] && c === m[y + 1][x] && c === m[y + 1][x + 1]) p += 3;
  }
  return p + 10 * Math.floor(Math.abs(noirs * 100 / (n * n) - 50) / 5);
}

/* Écrire un texte en QR. Rend `{n, m, v}` ; lève une erreur au-delà de la
   version 10. */
function qrEcrit(texte, niveau = 'M') {
  let v = 1, bits;
  for (; v <= 10; v++) { bits = qrBitsDonnees(texte, v); if (bits.length <= qrCapacite(v, niveau) * 8) break; }
  if (v > 10) throw new Error('texte trop long pour un QR de version 10');
  const mots = qrMots(bits, v, niveau);
  const g = qrGrille(v), ordre = qrOrdre(g);
  ordre.forEach(([x, y], i) => { const k = i >> 3; g.m[y][x] = k < mots.length && ((mots[k] >>> (7 - (i & 7))) & 1) === 1; });
  let best = null;
  for (let k = 0; k < 8; k++) {
    const essai = {n: g.n, fixe: g.fixe, m: g.m.map(r => r.slice())};
    qrMasque(essai, k);
    qrPoseFormat(essai, niveau, k);
    const p = qrPenalite(essai.m);
    if (!best || p < best.p) best = {p, m: essai.m};
  }
  return {n: g.n, m: best.m, v};
}

/* Le SVG d'un QR, avec sa marge de quatre modules. */
function qrSVG(qr, titre) {
  const t = qr.n + 8;
  let d = '';
  for (let y = 0; y < qr.n; y++) for (let x = 0; x < qr.n; x++) if (qr.m[y][x]) d += `M${x + 4} ${y + 4}h1v1h-1z`;
  return `<svg class="qr" viewBox="0 0 ${t} ${t}" shape-rendering="crispEdges" role="img" aria-label="${titre || 'QR code'}">` +
    `<rect width="${t}" height="${t}" fill="#fff"/><path d="${d}" fill="#000"/></svg>`;
}
