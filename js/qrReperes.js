/* =====================================================================
   js/qrReperes.js — Trouver un QR code dans une image

   Les trois carrés de repérage se reconnaissent à leur coupe : noir,
   blanc, noir triple, blanc, noir — 1:1:3:1:1 — quel que soit l'angle sous
   lequel on les traverse. On les cherche ligne par ligne, on confirme chaque
   candidat en le traversant verticalement puis en diagonale, on regroupe les
   détections d'un même carré, et l'on garde le triplet qui forme un angle
   droit à deux côtés égaux. Le quatrième coin vient du motif d'alignement
   (1:1:1:1:1, à partir de la version 2), sinon du parallélogramme.
   ===================================================================== */

/* Des longueurs sont-elles dans les proportions voulues ? */
function qrProportions(l, rapports) {
  const total = l.reduce((a, b) => a + b, 0), unites = rapports.reduce((a, b) => a + b, 0);
  if (total < unites) return 0;
  const m = total / unites;
  return l.every((v, i) => Math.abs(v - rapports[i] * m) < m * (rapports[i] > 1 ? 1.5 : 0.7)) ? m : 0;
}

/* Compter, depuis un pixel sombre, la suite sombre, puis claire, puis
   sombre dans une direction. */
function qrTroisSuites(b, x, y, dx, dy, max) {
  const r = [0, 0, 0];
  let k = 0, cx = x, cy = y;
  for (let pas = 0; pas < max && k < 3; pas++) {
    const noir = qrNoir(b, cx, cy);
    if ((k === 1) === noir) { k++; if (k === 3) break; }
    r[k]++;
    cx += dx; cy += dy;
  }
  return r;
}

/* Traverser un candidat dans une direction : rend le centre affiné et la
   taille de module, ou `null`. */
function qrTraverse(b, x, y, dx, dy, rapports, max) {
  if (!qrNoir(b, x, y)) return null;
  const a = qrTroisSuites(b, x, y, -dx, -dy, max), c = qrTroisSuites(b, x, y, dx, dy, max);
  const l = rapports.length === 5 ? [a[2], a[1], a[0] + c[0] - 1, c[1], c[2]] : [a[1], a[0] + c[0] - 1, c[1]];
  const m = qrProportions(l, rapports);
  if (!m) return null;
  const decal = (c[0] - a[0]) / 2;
  return {x: x + dx * decal, y: y + dy * decal, m};
}

const QR_REPERE = [1, 1, 3, 1, 1];

/* Les centres des carrés de repérage `{x, y, m, n}` (n : détections). */
function qrChercheReperes(b) {
  const cands = [], pas = b.h > 400 ? 2 : 1, max = Math.max(b.w, b.h) / 3;
  for (let y = 0; y < b.h; y += pas) {
    const suites = [];
    let deb = 0;
    for (let x = 1; x <= b.w; x++) {
      if (x === b.w || b.d[y * b.w + x] !== b.d[y * b.w + x - 1]) { suites.push([b.d[y * b.w + deb], x - deb, deb]); deb = x; }
    }
    for (let i = 0; i + 5 <= suites.length; i++) {
      if (suites[i][0] !== 1) continue;
      const l = suites.slice(i, i + 5).map(s => s[1]);
      if (!qrProportions(l, QR_REPERE)) continue;
      const cx = suites[i + 2][2] + suites[i + 2][1] / 2;
      const v = qrTraverse(b, cx, y, 0, 1, QR_REPERE, max);
      if (!v) continue;
      const hz = qrTraverse(b, cx, v.y, 1, 0, QR_REPERE, max);
      if (!hz || !qrTraverse(b, hz.x, v.y, 1, 1, QR_REPERE, max)) continue;
      const m = (v.m + hz.m) / 2;
      const proche = cands.find(c => Math.abs(c.x - hz.x) < c.m * 2 && Math.abs(c.y - v.y) < c.m * 2 && Math.abs(c.m - m) < c.m);
      if (proche) {
        const k = proche.n;
        proche.x = (proche.x * k + hz.x) / (k + 1); proche.y = (proche.y * k + v.y) / (k + 1); proche.m = (proche.m * k + m) / (k + 1);
        proche.n++;
      } else cands.push({x: hz.x, y: v.y, m, n: 1});
    }
  }
  return cands;
}

const dist = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);

/* Les triplets qui peuvent former le QR, du plus vraisemblable au moins,
   chacun ordonné haut-gauche, haut-droite, bas-gauche. Un faux carré —
   un reflet, un bout de donnée — peut passer les contrôles : on essaie
   donc les suivants si le premier ne se lit pas. */
function qrTriplets(cands) {
  const c = cands.filter(x => x.n >= 2).length >= 3 ? cands.filter(x => x.n >= 2) : cands;
  const tous = [];
  for (let i = 0; i < c.length; i++) for (let j = i + 1; j < c.length; j++) for (let k = j + 1; k < c.length; k++) {
    const t = [c[i], c[j], c[k]];
    const ms = t.map(x => x.m);
    if (Math.max(...ms) > Math.min(...ms) * 1.6) continue;
    const d = [dist(t[1], t[2]), dist(t[0], t[2]), dist(t[0], t[1])];
    const h = d.indexOf(Math.max(...d));
    const coin = t[h], A = t[(h + 1) % 3], B = t[(h + 2) % 3];
    const l1 = dist(coin, A), l2 = dist(coin, B), hyp = d[h];
    const err = Math.abs(l1 - l2) / Math.max(l1, l2) + Math.abs(hyp * hyp - l1 * l1 - l2 * l2) / (hyp * hyp);
    if (err > 0.35 || l1 < 7 * coin.m) continue;
    const z = (A.x - coin.x) * (B.y - coin.y) - (A.y - coin.y) * (B.x - coin.x);
    tous.push(z > 0 ? {err, hg: coin, hd: A, bg: B} : {err, hg: coin, hd: B, bg: A});
  }
  return tous.sort((a, b) => a.err - b.err).slice(0, 4);
}

/* Chercher le motif d'alignement autour de l'endroit prévu. */
function qrChercheAlignement(b, px, py, m) {
  const r = Math.max(4, Math.round(m * 6));
  let best = null;
  for (let y = Math.round(py - r); y <= py + r; y++) for (let x = Math.round(px - r); x <= px + r; x++) {
    if (!qrNoir(b, x, y)) continue;
    const hz = qrTraverse(b, x, y, 1, 0, [1, 1, 1], r * 2);
    if (!hz || Math.abs(hz.m - m) > m * 0.6) continue;
    const v = qrTraverse(b, hz.x, y, 0, 1, [1, 1, 1], r * 2);
    if (!v || Math.abs(v.m - m) > m * 0.6) continue;
    const d = Math.hypot(hz.x - px, v.y - py);
    if (!best || d < best.d) best = {x: hz.x, y: v.y, d};
  }
  return best;
}
