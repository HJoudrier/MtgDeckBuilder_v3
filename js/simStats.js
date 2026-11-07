/* =====================================================================
   js/simStats.js — Ce qu'on retient d'une partie, et d'un lot

   D'une partie, on ne garde que des compteurs : qui a gagné, en combien de
   tours, comment le deck testé a perdu, ses mulligans, son mana, et pour
   chacune de ses cartes si elle a été piochée et lancée. D'un lot, des
   agrégats : le taux de victoire avec son intervalle de Wilson à 95 %,
   l'indice de force (le taux rapporté à l'attendu d'une table de N : 1,0 =
   au niveau de la table), et par carte les deux mesures de 17lands — le taux
   de victoire quand elle est en main, et ce qu'elle rapporte quand on la
   pioche par rapport à quand on ne la pioche pas.
   ===================================================================== */

/* L'intervalle de Wilson d'une proportion k/n, à 95 %. */
function wilson(k, n, z = 1.96) {
  if (!n) return [0, 1];
  const p = k / n, d = 1 + z * z / n, c = p + z * z / (2 * n);
  const m = z * Math.sqrt(p * (1 - p) / n + z * z / (4 * n * n));
  return [Math.max(0, (c - m) / d), Math.min(1, (c + m) / d)];
}

/* Les mesures d'une partie. `places[k]` : l'indice dans la table du deck
   assis au siège k ; le deck testé est l'indice 0. */
function mesuresPartie(P, places, g) {
  const s = places.indexOf(0), J = P.joueurs[s], f = P.fin || {};
  const res = f.erreur ? 'e' : f.nulle ? 'n' : f.gagnant === s ? 'v' : 'd';
  const cartes = {};
  P.cartes.forEach(k => {
    if (k.prop !== s || k.jeton) return;
    const c = cartes[k.nom] || (cartes[k.nom] = [0, 0]);
    if (k.st.piochee) c[0] = 1;
    c[1] += k.st.lancee;
  });
  return {g, pos: s, res, gagnant: f.gagnant != null ? places[f.gagnant] : -1, tour: P.tour,
    rondes: Math.ceil(P.tour / P.nb), toursT: J.tours, raison: J.raison, mull: J.mulligans,
    t4: J.stats.terrainsT4, cmd: J.stats.cmdTour, md: J.stats.manaDepense, mdi: J.stats.manaDispo,
    sorts: J.stats.sorts, degats: J.stats.degats, cartes, erreur: f.erreur ? String(f.erreur).split('\n')[0] : null};
}

const moyenne = t => t.length ? t.reduce((s, x) => s + x, 0) / t.length : null;

/* Les agrégats d'un lot. `terrains` : les noms des terrains du deck testé,
   qu'une carte « morte en main » ne doit pas compter. */
function agrege(recs, N, terrains) {
  const jouees = recs.filter(r => r.res !== 'e');
  const n = jouees.length, cnt = res => jouees.filter(r => r.res === res).length;
  const v = cnt('v'), d = cnt('d'), nul = cnt('n');
  const [bas, haut] = wilson(v, n);
  const parPlace = Array.from({length: N}, (_, p) => {
    const t = jouees.filter(r => r.pos === p);
    return {n: t.length, v: t.filter(r => r.res === 'v').length};
  });
  const victoiresPar = Array.from({length: N}, (_, i) => jouees.filter(r => r.gagnant === i).length);
  const causes = {};
  jouees.filter(r => r.res === 'd' && r.raison).forEach(r => { causes[r.raison] = (causes[r.raison] || 0) + 1; });
  const histo = {};
  jouees.forEach(r => { histo[r.rondes] = (histo[r.rondes] || 0) + 1; });
  const avecT4 = jouees.filter(r => r.t4 != null);
  const md = jouees.reduce((s, r) => s + r.md, 0), mdi = jouees.reduce((s, r) => s + r.mdi, 0);
  return {
    n, v, d, nul, erreurs: recs.length - n, taux: n ? v / n : 0, bas, haut, N,
    indice: n ? v / n * N : 0, indiceBas: bas * N, indiceHaut: haut * N,
    parPlace, victoiresPar, causes, histo,
    tourVictoire: moyenne(jouees.filter(r => r.res === 'v').map(r => r.toursT)),
    tourDefaite: moyenne(jouees.filter(r => r.res === 'd').map(r => r.toursT)),
    rondes: moyenne(jouees.map(r => r.rondes)),
    mulligans: moyenne(jouees.map(r => r.mull)), partMull: n ? jouees.filter(r => r.mull > 0).length / n : 0,
    manque: avecT4.length ? avecT4.filter(r => r.t4 <= 2).length / avecT4.length : null,
    efficacite: mdi ? md / mdi : null,
    tourCmd: moyenne(jouees.filter(r => r.cmd != null).map(r => r.cmd)),
    partCmd: n ? jouees.filter(r => r.cmd != null).length / n : 0,
    degats: moyenne(jouees.map(r => r.degats)),
    cartes: statsCartes(jouees, new Set(terrains || [])),
    exempleErreur: (recs.find(r => r.res === 'e') || {}).erreur || null
  };
}

/* Les mesures de chaque carte du deck testé. `gih` : le taux de victoire
   des parties où elle a été en main ; `iwd` : l'écart entre ce taux et
   celui des parties où elle ne l'a pas été. */
function statsCartes(jouees, terrains) {
  const t = {};
  jouees.forEach(r => {
    const gagne = r.res === 'v' ? 1 : 0;
    Object.keys(r.cartes).forEach(nom => {
      const c = t[nom] || (t[nom] = {nom, piochee: 0, vPiochee: 0, non: 0, vNon: 0, lancee: 0, morte: 0});
      const [p, l] = r.cartes[nom];
      if (p) { c.piochee++; c.vPiochee += gagne; if (!l && !terrains.has(nom)) c.morte++; } else { c.non++; c.vNon += gagne; }
      c.lancee += l;
    });
  });
  return Object.values(t).map(c => ({...c, terrain: terrains.has(c.nom),
    gih: c.piochee ? c.vPiochee / c.piochee : null,
    iwd: c.piochee && c.non ? c.vPiochee / c.piochee - c.vNon / c.non : null,
    partMorte: c.piochee ? c.morte / c.piochee : 0}))
    .sort((a, b) => (b.iwd == null ? -9 : b.iwd) - (a.iwd == null ? -9 : a.iwd));
}
