/* =====================================================================
   js/notation.js — La note d'une carte candidate

   Ce qu'une carte vaudrait dans ce deck-ci : ses interactions avec ce qui y est
   déjà, ce qu'elle comble de la courbe de mana et des rôles manquants, ce
   qu'EDHREC en dit, ce qu'elle coûte. Le contexte — le deck, les cibles, les
   manques — est bâti une fois pour toute la sélection ; `noteCarte()` s'y
   réfère et ne relit jamais l'état.
   ===================================================================== */

function contexteEvaluation() {
  const deck = cartesDuDeck();
  const f = fmt(), cnt = deckCounts(), tgt = targets();
  const cmcCount = {};
  deck.forEach(c => { if (!c.isLand) cmcCount[Math.min(c.cmc, 7)] = (cmcCount[Math.min(c.cmc, 7)] || 0) + 1; });
  const ideal = {0:0.04, 1:0.16, 2:0.22, 3:0.20, 4:0.15, 5:0.11, 6:0.07, 7:0.05};
  const nonlandTotal = Math.max(1, deck.filter(c => !c.isLand).length);
  const cmdId = S.commander ? find(S.commander).identity : null;

  const IDX = {};
  NODES.forEach((n, i) => IDX[n[0]] = i);
  const NN = NODES.length, MAXI = 2;
  const realAdj = Array.from({length:NN}, () => []), impAdj = Array.from({length:NN}, () => []);
  const seenE = new Set();

  deck.forEach(d => d.an.edges.forEach(e => {
    if (e.to === 'ENGAGEMENT') return;
    const k = e.from + '>' + e.to;
    if (!seenE.has(k)) { seenE.add(k); realAdj[IDX[e.from]].push(IDX[e.to]); }
  }));
  if (S.showImplicit) IMPLICIT.forEach(([a, b]) => impAdj[IDX[a]].push(IDX[b]));

  const reach = Array.from({length:NN}, () => new Uint8Array(NN));
  for (let st = 0; st < NN; st++) {
    const vis = new Set([st + ':0:0']);
    const q = [[st, 0, 0]];
    while (q.length) {
      const [nd, imp, real] = q.shift();
      if (real) reach[st][nd] = 1;
      realAdj[nd].forEach(nx => {
        const k = nx + ':' + imp + ':1';
        if (!vis.has(k)) { vis.add(k); q.push([nx, imp, 1]); }
      });
      if (imp < MAXI) impAdj[nd].forEach(nx => {
        const k = nx + ':' + (imp + 1) + ':' + real;
        if (!vis.has(k)) { vis.add(k); q.push([nx, imp + 1, real]); }
      });
    }
  }

  const deckProd = new Map(), deckTrig = new Map();
  const push = (m, k, v) => { if (!m.has(k)) m.set(k, []); m.get(k).push(v); };
  deck.forEach(d => {
    d.an.produces.forEach(pp => {
      if (pp.scope !== 'self') return;
      feedsDe(pp).forEach(k => push(deckProd, k, {nom:d.name, p:pp}));
    });
    d.an.triggers.forEach(tt => {
      if (tt.scope !== 'self' && tt.q.portee !== 'adversaire') return;
      push(deckTrig, tt.c, {nom:d.name, t:tt});
    });
  });

  return {deck, f, cnt, tgt, cmcCount, ideal, nonlandTotal, cmdId, IDX, reach, deckProd, deckTrig};
}

function noteCarte(p, X) {
  const c = p.card;
  if (X.cmdId && p.source !== 'deck' && c.identity.some(x => !X.cmdId.includes(x))) return null;
  let score = 0;
  const reasons = [];

  const linkMap = new Map();
  const addLink = (nm, concept, dir, k, detail) => {
    if (nm === c.name || k <= 0) return;
    if (!linkMap.has(nm)) linkMap.set(nm, new Map());
    const cle = concept + '|' + dir, ancien = linkMap.get(nm).get(cle);
    if (!ancien || ancien.k < k) linkMap.get(nm).set(cle, {concept, dir, k, detail});
  };

  c.an.produces.forEach(pp => {
    if (pp.scope !== 'self') return;
    feedsDe(pp).forEach(k => (X.deckTrig.get(k) || []).forEach(x =>
      addLink(x.nom, k, 'ab', compat(pp, x.t), libelleQual(x.t.q))));
  });

  c.an.triggers.forEach(tt => {
    if (tt.scope !== 'self' && tt.q.portee !== 'adversaire') return;
    (X.deckProd.get(tt.c) || []).forEach(x =>
      addLink(x.nom, tt.c, 'ba', compat(x.p, tt), libelleQual(tt.q)));
  });

  /* Les partenaires sont d'abord bâtis, puis triés : un déclencheur qui prend le
     quart du deck ne s'intègre pas à chaque carte (js/liens.js), et ni le poids
     ni le décompte ne doivent le payer soixante fois. */
  const partners = [...linkMap.entries()].map(([nm, m]) => ({name:nm, links:[...m.values()]}));
  const tri = classeLiens(partners, X.deck.length);

  /* Une carte du deck ne pèse qu'une fois, quel que soit le nombre d'effets qui
     la relient : son meilleur lien fait le poids, les suivants ne font que le
     nuancer, sans jamais dépasser une fois et demie ce meilleur lien. La somme
     de tous les arcs, elle, faisait qu'une carte branchée à deux cartes du deck
     par quatre effets chacune valait une carte qui s'intègre à huit — l'inverse
     de ce que l'on cherche à mettre en avant. */
  const poidsLien = l => ((l.concept === 'ETB' || l.concept === 'LANCEMENT') ? 0.8 : (l.dir === 'ab' ? 3.2 : 2.6)) * (l.k || 1);
  tri.parts.forEach(x => {
    const forces = x.precis.map(poidsLien).sort((a, b) => b - a);
    const meilleur = forces[0] || 0;
    x.p.precis = x.precis;
    x.p.large = !x.precis.length;
    x.p.w = Math.min(meilleur * 1.5, meilleur + 0.2 * forces.slice(1).reduce((a, f) => a + f, 0));
  });

  /* Le plafond reste 26, mais on l'approche sans jamais l'atteindre : la
     coupure nette mettait à égalité une carte branchée à huit cartes du deck et
     une branchée à vingt-cinq, alors que c'est précisément l'étendue que l'on
     veut voir remonter. */
  let weight = tri.precis.reduce((a, x) => a + x.p.w, 0);
  /* Les vraies interactions en tête : le détail des trois premières doit nommer
     des cartes qui apprennent quelque chose, non le premier sort venu. */
  partners.sort((a, b) => a.large === b.large ? b.w - a.w : (a.large ? 1 : -1));
  score += 26 * (1 - Math.exp(-weight / 14));
  score += primeLiensLarges(tri.familles);

  const nbPrecis = tri.precis.length, nbLarges = tri.larges.length;
  if (nbPrecis) {
    const detail = tri.precis.slice(0, 3).map(x => {
      const cs = [...new Set(x.precis.map(l => NODE[l.concept].label.toLowerCase()))].slice(0, 2).join(', ');
      return `${x.p.name} (${cs})`;
    }).join(', ');
    const liens = tri.precis.reduce((a, x) => a + x.precis.length, 0);
    reasons.push(`se branche à ${nbPrecis} carte(s) du deck (${liens} lien(s)) : ${detail}`);
  }
  if (tri.familles.length) {
    reasons.push(`déclencheur large : ${libelleFamillesLarges(tri.familles)} — ${tri.familles[0].n} carte(s) du deck l'alimentent, ce qui vaut une prime, non autant d'interactions`);
  }

  const graph = [];
  let loopEdge = null;
  c.an.edges.forEach(e => { if (!loopEdge && X.reach[X.IDX[e.to]][X.IDX[e.from]]) loopEdge = e; });
  if (loopEdge) {
    graph.push('boucle');
    score += 12;
    reasons.unshift(`ferme une boucle avec le deck : ${NODE[loopEdge.from].label} → ${NODE[loopEdge.to].label} → … → ${NODE[loopEdge.from].label}`);
  }

  /* Un pont fait de deux liens de lancement n'en est pas un : seuls les liens
     précis disent qu'elle reçoit d'une carte et fournit à une autre. */
  const hasAb = tri.precis.some(x => x.precis.some(l => l.dir === 'ab'));
  const hasBa = tri.precis.some(x => x.precis.some(l => l.dir === 'ba'));
  if (hasAb && hasBa) {
    graph.push('pont');
    score += 5;
    reasons.unshift('relie deux effets déjà présents : elle reçoit un déclencheur du deck et en fournit un autre');
  }

  const erAll = edhrecAllFor(c);
  const er = edhrecFor(c);
  erAll.sort((a, b) => {
    const aSel = a.isSelected || a.role === 'principal' || (S.commander && norm(a.commandant) === norm(S.commander)) ? 1 : 0;
    const bSel = b.isSelected || b.role === 'principal' || (S.commander && norm(b.commandant) === norm(S.commander)) ? 1 : 0;
    if (aSel !== bSel) return bSel - aSel;
    return (b.synergy * 10 + b.inclusion * 8) - (a.synergy * 10 + a.inclusion * 8);
  });
  if (erAll.length) {
    erAll.forEach(erItem => {
      const isPrim = erItem.isSelected || erItem.role === 'principal' || (S.commander && norm(erItem.commandant) === norm(S.commander));
      const wInclusion = isPrim ? 8 : 5.5;
      const wSynergy = isPrim ? 10 : 7;
      const baseBonus = isPrim ? 3 : 1.8;
      score += baseBonus + erItem.inclusion * wInclusion + Math.max(0, erItem.synergy) * wSynergy;
      const cmdTag = isPrim ? `EDHREC (★ ${S.commander || erItem.commandant})` : `EDHREC (${erItem.commandant})`;
      const synSign = erItem.synergy >= 0 ? '+' : '−';
      const synVal = Math.abs(Math.round(erItem.synergy * 100));
      reasons.push(`${cmdTag} : ${Math.round(erItem.inclusion*100)} % apparition / ${synSign}${synVal} % synergie`);
    });
  }

  const actifs = noeudsActifs();
  if (actifs.length && carteTouche(c, actifs)) {
    graph.push('noeud');
    score += 4 * actifs.length;
    reasons.unshift(`touche ${actifs.length>1?'tous les nœuds sélectionnés':'le nœud sélectionné'} : ${actifs.map(n=>NODE[n].label).join(', ')}`);
  }

  let needBonus = 0;
  c.cats.forEach(cat => {
    if (cat in X.tgt) {
      const miss = X.tgt[cat] - (X.cnt[cat] || 0);
      if (miss > 0) {
        needBonus += Math.min(6, miss * 1.1);
        reasons.push(`comble un manque : ${CATLABEL[cat]} (${X.cnt[cat]||0}/${X.tgt[cat]})`);
      }
    }
  });
  score += Math.min(9, needBonus);

  if (!c.isLand) {
    const k = Math.min(c.cmc, 7);
    const have = (X.cmcCount[k] || 0) / X.nonlandTotal, want = X.ideal[k];
    const gap = want - have;
    score += gap * 14;
    if (gap > 0.05) reasons.push(`renforce la courbe à ${c.cmc} mana`);
    if (gap < -0.06) reasons.push(`attention : la courbe est déjà chargée à ${c.cmc}`);
  }

  score += Math.min(3, c.an.edges.length * 0.35);
  if (p.source === 'achat') {
    score -= 2.5;
    reasons.push(`hors collection — ${eur(p.offer.price)} (${p.offer.condition || p.offer.quality || ''}, ${p.offer.lang || ''}, ${p.offer.seller || ''})`);
  }
  if (deckSize() === 0) score += (c.cats.has('ramp') || c.cats.has('pioche')) ? 4 : 0;
  return {card:c, score, reasons, partners, nbPrecis, nbLarges, larges:tri.familles,
          source:p.source, offer:p.offer, graph, edhrec:er};
}

/* Le nombre d'interactions d'une note est un nombre de cartes du deck, jamais
   un nombre d'arcs : une carte reliée par quatre effets reste une carte. La
   notation le tient déjà (`nbPrecis`) ; le dédoublonnage par nom normalisé ne
   sert que de repli, pour une note d'avant ce décompte. */
function nbInteractions(note) {
  if (!note) return 0;
  if (typeof note.nbPrecis === 'number') return note.nbPrecis;
  return new Set((note.partners || []).map(p => norm(p.name))).size;
}

/* Les cartes que seul un déclencheur large atteint : elles se disent à part,
   entre parenthèses, pour ne pas gonfler le décompte des interactions. */
function nbCartesLarges(note) {
  return (note && note.nbLarges) || 0;
}

/* Le nombre d'arcs, lui, ne sert qu'à l'infobulle : il dit par combien d'effets
   passent les interactions précises. */
function nbLiens(note) {
  if (!note || !note.partners) return 0;
  return note.partners.reduce((a, p) => a + (p.precis || p.links || []).length, 0);
}
