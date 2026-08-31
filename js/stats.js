/* =====================================================================
   js/stats.js — Statistiques, répartitions & courbes de mana
   ===================================================================== */

function statsOf(list) {
  const st = {ex:0, diff:list.length, byColor:{W:0,U:0,B:0,R:0,G:0,C:0}, byType:{}, matrix:{}, cmc:{}, value:0};
  TYPE_ORDER.forEach(t => {
    st.byType[t] = 0;
    st.matrix[t] = {W:0, U:0, B:0, R:0, G:0, C:0};
  });
  list.forEach(e => {
    const c = e.card, q = e.qty, t = mainType(c);
    st.ex += q;
    st.value += q * c.price;
    st.byType[t] += q;
    const ids = c.identity.length ? c.identity : ['C'];
    ids.forEach(col => {
      st.byColor[col] += q;
      st.matrix[t][col] += q;
    });
    const k = Math.min(c.cmc, 9);
    if (!c.isLand) { st.cmc[k] = (st.cmc[k] || 0) + q; }
  });
  return st;
}

function histogram(dataByCmc, colorSplit) {
  const max = Math.max(1, ...Object.values(dataByCmc).map(v => typeof v === 'number' ? v : Object.values(v).reduce((a, b) => a + b, 0)));
  const bars = [];
  for (let i = 0; i <= 9; i++) {
    const v = dataByCmc[i] || 0;
    const tot = typeof v === 'number' ? v : Object.values(v).reduce((a, b) => a + b, 0);
    const h = Math.round(tot / max * 118);
    let segs = '';
    if (colorSplit && typeof v === 'object') {
      Object.entries(v).forEach(([col, n]) => {
        if (n > 0) segs += `<div class="bseg" style="height:${Math.max(2, Math.round(n/max*118))}px;background:var(--${col})"></div>`;
      });
    } else {
      segs = `<div class="bseg" style="height:${Math.max(tot ? 2 : 0, h)}px;background:linear-gradient(180deg,var(--brass),var(--brass-d))"></div>`;
    }
    bars.push(`<div class="bar"><div class="n">${tot || ''}</div>${segs}</div>`);
  }
  return `<div class="bars">${bars.join('')}</div>
    <div class="blabels">${[0,1,2,3,4,5,6,7,8,'9+'].map(i => `<div>${i}</div>`).join('')}</div>`;
}

function renderC() {
  const all = statsOf(collectionCards()), fl = statsOf(filtered());
  const f = fmt();
  const usable = filtered().reduce((n, e) => n + Math.min(e.qty, f.maxCopies), 0);
  const cmcSplit = {};
  filtered().forEach(e => {
    if (e.card.isLand) return;
    const k = Math.min(e.card.cmc, 9);
    cmcSplit[k] = cmcSplit[k] || {W:0, U:0, B:0, R:0, G:0, C:0};
    (e.card.identity.length ? e.card.identity : ['C']).forEach(col => cmcSplit[k][col] += e.qty / (e.card.identity.length || 1));
  });
  Object.values(cmcSplit).forEach(o => Object.keys(o).forEach(k => o[k] = Math.round(o[k] * 10) / 10));

  const bodyEl = document.getElementById('bodyC');
  if (bodyEl) {
    bodyEl.innerHTML = `
      <div class="statgrid">
        <div class="stat"><div class="v">${all.ex}</div><div class="k">Exemplaires (total)</div></div>
        <div class="stat"><div class="v">${fl.ex}</div><div class="k">Exemplaires filtrés</div></div>
        <div class="stat"><div class="v">${fl.diff}</div><div class="k">Cartes différentes</div></div>
        <div class="stat"><div class="v">${usable}</div><div class="k">Jouables (max ${f.maxCopies>=99?'∞':f.maxCopies}/carte)</div></div>
        <div class="stat"><div class="v">${eur(fl.value)}</div><div class="k">Valeur filtrée</div></div>
      </div>
      <h3 style="margin:14px 0 6px;font-size:15px">Répartition par couleur</h3>
      <div class="statgrid">
        ${['W','U','B','R','G','C'].map(c => `<div class="stat"><div class="v" style="color:var(--${c})">${fl.byColor[c]}</div><div class="k">${symIcon(c,'sm')} ${all.byColor[c]} au total</div></div>`).join('')}
      </div>
      <h3 style="margin:14px 0 6px;font-size:15px">Types × couleurs (collection filtrée)</h3>
      <div class="scroll"><table class="tbl">
        <thead><tr><th>Type</th>${['W','U','B','R','G','C'].map(c => `<th>${symIcon(c,'sm')}</th>`).join('')}<th>Total</th><th>Collection</th></tr></thead>
        <tbody>${TYPE_ORDER.filter(t => all.byType[t] > 0).map(t => `<tr><td>${t}</td>
          ${['W','U','B','R','G','C'].map(c => `<td class="${fl.matrix[t][c]?'':'muted'}">${fl.matrix[t][c]||'·'}</td>`).join('')}
          <td><b>${fl.byType[t]}</b></td><td class="muted">${all.byType[t]}</td></tr>`).join('')}</tbody>
      </table></div>
      <h3 style="margin:14px 0 6px;font-size:15px">Courbe de mana de la collection filtrée</h3>
      ${histogram(cmcSplit, true)}
      <div class="small muted" style="margin-top:6px">Terrains exclus. Les cartes multicolores sont réparties entre leurs couleurs.</div>`;
  }

  const hintEl = document.getElementById('hintC');
  if (hintEl) hintEl.textContent = `${fl.diff} cartes · ${eur(fl.value)}`;
}
