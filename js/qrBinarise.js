/* =====================================================================
   js/qrBinarise.js — D'une image de caméra à du noir et du blanc

   Un écran filmé n'est jamais noir sur blanc : reflets, dégradés,
   compression. Un seuil unique raterait la moitié de l'image. On découpe en
   blocs de huit pixels, on prend la moyenne de chacun, et chaque pixel est
   jugé contre la moyenne des blocs qui l'entourent ; un bloc sans contraste
   — un aplat — est jugé contre ses voisins plutôt que contre lui-même, sans
   quoi le bruit y dessinerait des modules.
   ===================================================================== */

/* La luminance d'une image RGBA (ImageData ou équivalent). */
function qrGris(img) {
  const n = img.width * img.height, g = new Uint8Array(n), d = img.data;
  for (let i = 0, j = 0; i < n; i++, j += 4) g[i] = (d[j] * 77 + d[j + 1] * 150 + d[j + 2] * 29) >> 8;
  return g;
}

/* Une image binaire `{w, h, d}`, `d[i]` à 1 pour un pixel sombre. */
function qrBinarise(g, w, h) {
  const B = 8, bw = Math.ceil(w / B), bh = Math.ceil(h / B);
  const moy = new Float32Array(bw * bh), plat = new Uint8Array(bw * bh);
  for (let by = 0; by < bh; by++) for (let bx = 0; bx < bw; bx++) {
    let s = 0, n = 0, mn = 255, mx = 0;
    for (let y = by * B; y < Math.min(h, by * B + B); y++) for (let x = bx * B; x < Math.min(w, bx * B + B); x++) {
      const v = g[y * w + x]; s += v; n++;
      if (v < mn) mn = v; if (v > mx) mx = v;
    }
    moy[by * bw + bx] = s / n;
    plat[by * bw + bx] = mx - mn < 24 ? 1 : 0;
  }
  const seuil = new Float32Array(bw * bh);
  for (let by = 0; by < bh; by++) for (let bx = 0; bx < bw; bx++) {
    let s = 0, n = 0, sc = 0, nc = 0;
    for (let dy = -2; dy <= 2; dy++) for (let dx = -2; dx <= 2; dx++) {
      const x = bx + dx, y = by + dy;
      if (x < 0 || y < 0 || x >= bw || y >= bh) continue;
      const k = y * bw + x;
      s += moy[k]; n++;
      if (!plat[k]) { sc += moy[k]; nc++; }
    }
    seuil[by * bw + bx] = nc ? sc / nc : s / n;
  }
  const d = new Uint8Array(w * h);
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    const k = ((y / B) | 0) * bw + ((x / B) | 0);
    const v = g[y * w + x];
    d[y * w + x] = plat[k] ? (v < seuil[k] - 24 ? 1 : 0) : (v < seuil[k] ? 1 : 0);
  }
  return {w, h, d};
}

function qrNoir(b, x, y) {
  x = Math.round(x); y = Math.round(y);
  return x >= 0 && y >= 0 && x < b.w && y < b.h && b.d[y * b.w + x] === 1;
}
