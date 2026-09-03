/* =====================================================================
   js/graphe.js — Visualisation circulaire interactive des capacités
   ===================================================================== */

function graphCards() {
  if (S.graphSource === 'deck') return deckEntries().map(e => e.card);
  if (S.graphSource === 'suggestions') return currentSuggestions().slice(0, 24).map(s => s.card);
  if (S.graphSource === 'all') return collectionCards().map(e => e.card);
  return filtered().map(e => e.card);
}

function buildGraph(cards) {
  const edges = new Map();
  cards.forEach(c => c.an.edges.forEach(e => {
    const k = e.from + '>' + e.to;
    if (!edges.has(k)) edges.set(k, {from:e.from, to:e.to, cards:new Map(), kinds:new Set()});
    const o = edges.get(k);
    o.kinds.add(e.kind);
    if (!o.cards.has(c.name)) o.cards.set(c.name, e.detail || '');
  }));
  const deg = {};
  NODES.forEach(n => deg[n[0]] = 0);
  edges.forEach(e => { deg[e.from] += e.cards.size; deg[e.to] += e.cards.size; });
  return {edges, deg};
}

function svgGraph(g) {
  const R = 380, cx = 500, cy = 500, N = NODES.length;
  const pos = {};
  NODES.forEach((n, i) => {
    const a = -Math.PI/2 + i/N * 2 * Math.PI;
    pos[n[0]] = {x:cx + R*Math.cos(a), y:cy + R*Math.sin(a), a};
  });

  let arcs = '';
  const groupsSeen = {};
  NODES.forEach((n, i) => { (groupsSeen[n[2]] = groupsSeen[n[2]] || []).push(i); });
  Object.entries(groupsSeen).forEach(([gname, idxs]) => {
    const a0 = -Math.PI/2 + (idxs[0] - 0.42)/N * 2 * Math.PI;
    const a1 = -Math.PI/2 + (idxs[idxs.length-1] + 0.42)/N * 2 * Math.PI;
    const r = R + 52;
    const x0 = cx + r*Math.cos(a0), y0 = cy + r*Math.sin(a0);
    const x1 = cx + r*Math.cos(a1), y1 = cy + r*Math.sin(a1);
    const large = (a1 - a0) > Math.PI ? 1 : 0;
    arcs += `<path d="M${x0.toFixed(1)},${y0.toFixed(1)} A${r},${r} 0 ${large} 1 ${x1.toFixed(1)},${y1.toFixed(1)}" fill="none" stroke="${GROUPS[gname].color}" stroke-width="5" opacity=".55" stroke-linecap="round"/>`;
  });

  let paths = '', dots = '', labels = '';
  let list = [...g.edges.values()];
  if (list.length > 420) list = list.sort((a, b) => b.cards.size - a.cards.size).slice(0, 420);
  const maxW = Math.max(1, ...list.map(e => e.cards.size));

  list.forEach(e => {
    const p = pos[e.from], q = pos[e.to];
    if (!p || !q) return;
    const mx = (p.x + q.x) / 2, my = (p.y + q.y) / 2;
    const cxp = cx + (mx - cx) * 0.28, cyp = cy + (my - cy) * 0.28;
    const w = 1 + 2.6 * e.cards.size / maxW;
    const col = GROUPS[NODE[e.to].group].color;
    const names = [...e.cards.keys()];
    paths += `<path d="M${p.x.toFixed(1)},${p.y.toFixed(1)} Q${cxp.toFixed(1)},${cyp.toFixed(1)} ${q.x.toFixed(1)},${q.y.toFixed(1)}"
      fill="none" stroke="${col}" stroke-width="${w.toFixed(2)}" opacity="${S.focusNodes.size ? 0.7 : 0.42}" marker-end="url(#ah)">
      <title>${esc(NODE[e.from].label)} → ${esc(NODE[e.to].label)} — ${e.cards.size} carte(s) : ${esc(names.slice(0,6).join(', '))}</title></path>`;
  });

  if (S.showImplicit) {
    IMPLICIT.forEach(([a, b]) => {
      const p = pos[a], q = pos[b];
      if (!p || !q) return;
      const mx = (p.x + q.x) / 2, my = (p.y + q.y) / 2;
      paths += `<path d="M${p.x.toFixed(1)},${p.y.toFixed(1)} Q${(cx+(mx-cx)*0.28).toFixed(1)},${(cy+(my-cy)*0.28).toFixed(1)} ${q.x.toFixed(1)},${q.y.toFixed(1)}"
        fill="none" stroke="#6f6690" stroke-width="1" stroke-dasharray="4 6" opacity=".5"><title>Règle du jeu : ${esc(NODE[a].label)} permet ${esc(NODE[b].label)}</title></path>`;
    });
  }

  NODES.forEach(n => {
    const id = n[0], p = pos[id], d = g.deg[id] || 0;
    const on = S.focusNodes.has(id);
    const r = 6 + Math.min(16, Math.sqrt(d) * 2.6);
    const col = GROUPS[n[2]].color;
    dots += `<circle cx="${p.x.toFixed(1)}" cy="${p.y.toFixed(1)}" r="${r.toFixed(1)}" fill="${col}" fill-opacity="${d?0.9:0.25}"
      stroke="${on ? '#fff' : '#171322'}" stroke-width="${on ? 3 : 1.5}" data-node="${id}" style="cursor:pointer">
      <title>${esc(n[1])} — ${d} connexion(s)</title></circle>`;
    if (!d && !on) return;
    const deg2 = p.a * 180 / Math.PI, flip = Math.cos(p.a) < 0;
    const lx = cx + (R + 22) * Math.cos(p.a), ly = cy + (R + 22) * Math.sin(p.a);
    labels += `<text x="${lx.toFixed(1)}" y="${ly.toFixed(1)}" fill="${d ? '#e8e3f2' : '#6d6486'}" font-size="14" font-family="ui-sans-serif,system-ui"
      text-anchor="${flip ? 'end' : 'start'}" dominant-baseline="middle"
      transform="rotate(${flip ? deg2+180 : deg2},${lx.toFixed(1)},${ly.toFixed(1)})" data-node="${id}" style="cursor:pointer">${esc(n[1])}</text>`;
  });

  return `<svg viewBox="0 0 1000 1000" role="img" aria-label="Graphe circulaire des capacités">
    <defs><marker id="ah" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse">
      <path d="M0,1 L9,5 L0,9 z" fill="#cfc7e4" opacity=".85"/></marker></defs>
    ${arcs}${paths}${dots}${labels}</svg>`;
}

function renderD() {
  const actifs = noeudsActifs();
  const toutes = graphCards();
  const cards = actifs.length ? toutes.filter(c => carteTouche(c, actifs)) : toutes;
  const g = buildGraph(cards);

  const focusInfo = (() => {
    if (!actifs.length) return '';
    const bloc = n => {
      const inb = [], outb = [];
      g.edges.forEach(e => { if (e.to === n) inb.push(e); if (e.from === n) outb.push(e); });
      const fmtList = (arr, dir) => arr.length
        ? arr.map(e => `<div class="arc"><b>${esc(NODE[dir==='in'?e.from:e.to].label)}</b> — ${
            [...e.cards.entries()].slice(0, 8).map(([nom, d]) => refCarte(nom) + (d ? ` <span class="muted">(${esc(d)})</span>` : '')).join(', ')
          }</div>`).join('')
        : '<div class="arc muted">aucun</div>';

      return `<div class="bloc" style="margin-bottom:8px">
        <h3 style="font-size:15px">${esc(NODE[n].label)}
          <button class="btn sm" data-act="unfocusNode" data-node2="${n}" style="margin-left:6px">retirer</button></h3>
        <div class="row" style="align-items:flex-start;gap:16px">
          <div style="flex:1;min-width:220px"><div class="lab" style="margin-bottom:4px">Ce qui déclenche cet effet</div>${fmtList(inb, 'in')}</div>
          <div style="flex:1;min-width:220px"><div class="lab" style="margin-bottom:4px">Ce que cet effet déclenche</div>${fmtList(outb, 'out')}</div>
        </div>
      </div>`;
    };

    return `<div class="detail">
      <div class="small muted" style="margin-bottom:8px">${
        actifs.length === 1
          ? 'Un nœud sélectionné : cliquez-en un autre pour restreindre davantage, ou celui-ci pour le retirer.'
          : `${actifs.length} nœuds sélectionnés : seules les ${cards.length} carte(s) qui les touchent tous sont retenues.`
      }</div>
      ${actifs.map(bloc).join('')}</div>`;
  })();

  const emptyMsg = {
    collection: 'Aucune carte ne passe les filtres en cours.',
    all: 'Votre collection est vide : ajoutez ou importez des cartes en section A.',
    deck: 'Le deck est vide.',
    suggestions: 'Aucune suggestion pour le moment.'
  }[S.graphSource] || 'Aucune carte.';

  const bodyEl = document.getElementById('bodyD');
  if (bodyEl) {
    bodyEl.innerHTML = `
      <div class="row" style="margin-bottom:10px">
        <div class="seg">
          ${[['collection','Collection filtrée'],['deck','Deck'],['suggestions','Suggestions'],['all','Collection entière']].map(([k,l]) =>
            `<button data-gsrc="${k}" aria-pressed="${S.graphSource===k}">${l}</button>`).join('')}
        </div>
        <button class="btn" data-act="toggleImplicit" aria-pressed="${S.showImplicit}">Arcs de règles</button>
        ${actifs.length ? `<button class="btn" data-act="clearFocus">Tout afficher (${actifs.length} nœud${actifs.length>1?'s':''} actif${actifs.length>1?'s':''})</button>` : ''}
        <span class="small muted">${cards.length}${actifs.length ? ` / ${toutes.length}` : ''} cartes · ${g.edges.size} arcs</span>
      </div>
      ${cards.length ? '' : `<div class="empty" style="margin-bottom:10px">${emptyMsg}</div>`}
      <div class="graphbox">${svgGraph(g)}</div>
      <div class="legend">${Object.entries(GROUPS).map(([k,v]) => `<span class="lg"><span class="dot" style="background:${v.color}"></span>${v.label}</span>`).join('')}</div>
      ${focusInfo}
      <div style="margin-top:8px"><button class="btn" data-act="graphToF">${actifs.length ? 'Proposer des cartes branchées sur ces nœuds' : 'Voir les suggestions d\'ajout'}</button></div>
      <div class="small muted" style="margin-top:8px">${NODES.length} évènements possibles ; seuls ceux que vos cartes touchent sont nommés. Cliquez un nœud pour le détail.
        Chaque arc va d'un déclencheur vers un effet produit. Une carte peut poser plusieurs arcs. Les arcs pointillés sont les enchaînements permis par les règles (un jeton qui arrive déclenche les effets d'arrivée en jeu, un trésor sacrifié produit du mana…).</div>`;
  }

  const hintEl = document.getElementById('hintD');
  if (hintEl) hintEl.textContent = `${cards.length} cartes · ${g.edges.size} arcs${actifs.length ? ` · ${actifs.length} nœud(s)` : ''}`;
}
