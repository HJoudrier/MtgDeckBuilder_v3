/* =====================================================================
   js/qrLit.js — Lire un QR code repéré

   Les trois carrés de repérage et le motif d'alignement donnent quatre
   points dont on connaît la place dans la grille : une homographie en
   déduit où tombe chaque module dans l'image, même filmée de biais. On
   échantillonne, on lit le format au plus proche des trente-deux valeurs
   possibles, on démasque, on ramasse les mots dans l'ordre où l'écriture les
   a posés (js/qrMatrice.js), on désentrelace, et Reed–Solomon corrige ce que
   la caméra a mal vu.
   ===================================================================== */

/* L'homographie du carré unité vers un quadrilatère (coins dans l'ordre
   (0,0), (1,0), (1,1), (0,1)). */
function qrCarreVersQuad(q) {
  const [x0, y0, x1, y1, x2, y2, x3, y3] = q;
  const dx3 = x0 - x1 + x2 - x3, dy3 = y0 - y1 + y2 - y3;
  if (Math.abs(dx3) < 1e-9 && Math.abs(dy3) < 1e-9) return [x1 - x0, x2 - x1, x0, y1 - y0, y2 - y1, y0, 0, 0, 1];
  const dx1 = x1 - x2, dx2 = x3 - x2, dy1 = y1 - y2, dy2 = y3 - y2, den = dx1 * dy2 - dx2 * dy1;
  const a13 = (dx3 * dy2 - dx2 * dy3) / den, a23 = (dx1 * dy3 - dx3 * dy1) / den;
  return [x1 - x0 + a13 * x1, x3 - x0 + a23 * x3, x0, y1 - y0 + a13 * y1, y3 - y0 + a23 * y3, y0, a13, a23, 1];
}

function qrAdjointe([a11, a21, a31, a12, a22, a32, a13, a23, a33]) {
  return [a22 * a33 - a23 * a32, a23 * a31 - a21 * a33, a21 * a32 - a22 * a31,
    a13 * a32 - a12 * a33, a11 * a33 - a13 * a31, a12 * a31 - a11 * a32,
    a12 * a23 - a13 * a22, a13 * a21 - a11 * a23, a11 * a22 - a12 * a21];
}

function qrCompose(a, o) {
  const [a11, a21, a31, a12, a22, a32, a13, a23, a33] = a, [b11, b21, b31, b12, b22, b32, b13, b23, b33] = o;
  return [a11 * b11 + a21 * b12 + a31 * b13, a11 * b21 + a21 * b22 + a31 * b23, a11 * b31 + a21 * b32 + a31 * b33,
    a12 * b11 + a22 * b12 + a32 * b13, a12 * b21 + a22 * b22 + a32 * b23, a12 * b31 + a22 * b32 + a32 * b33,
    a13 * b11 + a23 * b12 + a33 * b13, a13 * b21 + a23 * b22 + a33 * b23, a13 * b31 + a23 * b32 + a33 * b33];
}

function qrApplique(t, x, y) {
  const d = t[6] * x + t[7] * y + t[8];
  return [(t[0] * x + t[1] * y + t[2]) / d, (t[3] * x + t[4] * y + t[5]) / d];
}

/* Échantillonner une grille de n modules : chaque module au vote de neuf
   points autour de son centre. */
function qrEchantillonne(b, t, n, m) {
  const e = Math.max(1, m / 4), g = [];
  for (let y = 0; y < n; y++) {
    const ligne = [];
    for (let x = 0; x < n; x++) {
      const [px, py] = qrApplique(t, x + 0.5, y + 0.5);
      let s = 0;
      for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) s += qrNoir(b, px + dx * e, py + dy * e) ? 1 : 0;
      ligne.push(s >= 5);
    }
    g.push(ligne);
  }
  return g;
}

/* Le format lu sur la grille : le niveau et le masque dont les 15 bits sont
   les plus proches de l'une des deux copies (trois erreurs au plus). */
function qrLitFormat(m, n) {
  let best = null;
  for (const copie of qrPositionsFormat(n)) {
    const lu = copie.reduce((v, [x, y], i) => v | ((m[y][x] ? 1 : 0) << i), 0);
    for (const niveau of ['L', 'M', 'Q', 'H']) for (let k = 0; k < 8; k++) {
      let d = lu ^ qrBitsFormat(niveau, k), c = 0;
      while (d) { c += d & 1; d >>>= 1; }
      if (!best || c < best.c) best = {niveau, masque: k, c};
    }
  }
  return best && best.c <= 3 ? best : null;
}

/* Les segments d'un flux de données : numérique, alphanumérique, octets. */
function qrSegments(mots, v) {
  let i = 0, out = '';
  const lit = n => { let r = 0; for (let k = 0; k < n; k++, i++) r = (r << 1) | ((mots[i >> 3] >>> (7 - (i & 7))) & 1); return r; };
  const total = mots.length * 8;
  while (i + 4 <= total) {
    const mode = lit(4);
    if (mode === 0) break;
    if (mode === 4) {
      const n = lit(v < 10 ? 8 : 16), o = new Uint8Array(n);
      for (let k = 0; k < n; k++) o[k] = lit(8);
      out += new TextDecoder().decode(o);
    } else if (mode === 2) {
      let n = lit(v < 10 ? 9 : 11);
      for (; n >= 2; n -= 2) { const p = lit(11); out += QR_ALNUM[Math.floor(p / 45)] + QR_ALNUM[p % 45]; }
      if (n) out += QR_ALNUM[lit(6)];
    } else if (mode === 1) {
      let n = lit(v < 10 ? 10 : 12);
      for (; n >= 3; n -= 3) out += String(lit(10)).padStart(3, '0');
      if (n === 2) out += String(lit(7)).padStart(2, '0'); else if (n === 1) out += String(lit(4));
    } else if (mode === 7) lit(8);
    else return null;
  }
  return out;
}

/* Lire une grille échantillonnée de version v. Rend le texte, ou `null`. */
function qrLitGrille(m, v) {
  const n = qrTaille(v), f = qrLitFormat(m, n);
  if (!f) return null;
  const g = qrGrille(v);
  g.m = m.map(r => r.slice());
  qrMasque(g, f.masque);
  const bits = qrOrdre(g).map(([x, y]) => g.m[y][x] ? 1 : 0);
  const [ec, b1, d1, b2, d2] = QR_BLOCS[f.niveau][v];
  const nb = b1 + b2, total = b1 * (d1 + ec) + b2 * (d2 + ec);
  const mots = [];
  for (let k = 0; k < total; k++) mots.push(bits.slice(k * 8, k * 8 + 8).reduce((a, c) => a << 1 | c, 0));
  const blocs = Array.from({length: nb}, (_, i) => ({d: [], e: [], n: i < b1 ? d1 : d2}));
  let k = 0;
  for (let i = 0; i < Math.max(d1, d2); i++) blocs.forEach(bl => { if (i < bl.n) bl.d.push(mots[k++]); });
  for (let i = 0; i < ec; i++) blocs.forEach(bl => bl.e.push(mots[k++]));
  const donnees = [];
  for (const bl of blocs) {
    const r = rsDecode(bl.d.concat(bl.e), ec);
    if (!r) return null;
    donnees.push(...r.slice(0, bl.n));
  }
  return qrSegments(donnees, v);
}

/* Lire le premier QR d'une image RGBA. Rend le texte, ou `null`. */
function lisQR(img) {
  const b = qrBinarise(qrGris(img), img.width, img.height);
  for (const t of qrTriplets(qrChercheReperes(b))) {
    const txt = qrLitTriplet(b, t);
    if (txt != null) return txt;
  }
  return null;
}

/* Lire le QR que désigne un triplet. La taille d'un module, mesurée sur les
   carrés de repérage, sort trop grande d'une image floue ou tournée — d'une
   bonne dizaine de pour cent : on essaie donc toutes les tailles de grille
   à quinze pour cent près, de la plus proche à la plus lointaine. */
function qrLitTriplet(b, t) {
  const m = (t.hg.m + t.hd.m + t.bg.m) / 3;
  const brut = (dist(t.hg, t.hd) + dist(t.hg, t.bg)) / 2 / m + 7;
  const essais = [];
  for (let n = 21; n <= 57; n += 4) if (Math.abs(n - brut) <= Math.max(4, brut * 0.15)) essais.push(n);
  essais.sort((a, c) => Math.abs(a - brut) - Math.abs(c - brut));
  for (const n of essais) {
    const v = (n - 17) / 4;
    const bdx = t.hd.x - t.hg.x + t.bg.x, bdy = t.hd.y - t.hg.y + t.bg.y;
    /* Le quatrième coin : le motif d'alignement s'il est trouvé, le
       parallélogramme sinon — et le parallélogramme aussi quand un faux
       motif d'alignement a égaré la perspective. */
    const coins = [[n - 3.5, n - 3.5, bdx, bdy]];
    if (v >= 2) {
      const k = 1 - 3 / (n - 7);
      const al = qrChercheAlignement(b, t.hg.x + k * (bdx - t.hg.x), t.hg.y + k * (bdy - t.hg.y), m);
      if (al) coins.unshift([n - 6.5, n - 6.5, al.x, al.y]);
    }
    for (const coin of coins) {
      const src = [3.5, 3.5, n - 3.5, 3.5, coin[0], coin[1], 3.5, n - 3.5];
      const dst = [t.hg.x, t.hg.y, t.hd.x, t.hd.y, coin[2], coin[3], t.bg.x, t.bg.y];
      const tr = qrCompose(qrCarreVersQuad(dst), qrAdjointe(qrCarreVersQuad(src)));
      const grille = qrEchantillonne(b, tr, n, m);
      const txt = qrLitGrille(grille, v) || qrLitGrille(grille[0].map((_, x) => grille.map(r => r[x])), v);
      if (txt != null) return txt;
    }
  }
  return null;
}
