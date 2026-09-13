/* =====================================================================
   js/synergies.js — Ce qu'une carte apporte à une autre

   Les équivalences entre concepts — le ramp et le terrain se valent —, puis le
   croisement : ce que l'une produit contre ce que l'autre attend, dans les deux
   sens.
   ===================================================================== */

/* 3. Synergies & équivalences entre effets */
const EQUIV = {
  RAMP:['TERRAIN','TERRAIN_JOUE'],TERRAIN:['RAMP'],TERRAIN_JOUE:['TERRAIN'],
  JETON:['ETB'],COPIE:['ETB'],BLINK:['ETB'],RECURSION:['ETB','ETB_CIMETIERE'],
  TRESOR:['MANA'],MARQUEUR:['BOOST'],PROLIFERATION:['MARQUEUR'],
  MORT:['MIS_AU_CIMETIERE','LTB'],DEFAUSSE:['MIS_AU_CIMETIERE'],MILL:['MIS_AU_CIMETIERE'],
  EXIL:['LTB'],BOUNCE:['LTB'],DESTRUCTION:['MORT','LTB'],
  DEGATS:['DEGATS_SUBIS'],DEGATS_COMBAT_JOUEUR:['DEGATS','DEGATS_SUBIS','PERTE_VIE'],
  DEGATS_COMBAT_CREATURE:['DEGATS','DEGATS_SUBIS'],CYCLE:['DEFAUSSE','PIOCHE']
};

function feeds(concept) { return [concept, ...(EQUIV[concept]||[])]; }

function feedsDe(p) {
  let l = feeds(p.c);
  if (p.c === 'RECURSION' && !(p.q && p.q.enJeu === true)) l = l.filter(x => x !== 'ETB' && x !== 'ETB_CIMETIERE');
  return l;
}

function croise(prods, trigs, dir, out) {
  prods.forEach(p => {
    if (p.scope !== 'self') return;
    trigs.forEach(t => {
      if (t.scope !== 'self' && t.q.portee !== 'adversaire') return;
      if (!feedsDe(p).includes(t.c)) return;
      const k = compat(p, t);
      if (k > 0) out.push({concept:t.c, dir, k, detail:libelleQual(t.q)});
    });
  });
}

function synergyBetween(a, b) {
  const out = [];
  croise(a.an.produces, b.an.triggers, 'ab', out);
  croise(b.an.produces, a.an.triggers, 'ba', out);
  const best = new Map();
  out.forEach(l => {
    const c = l.concept + l.dir;
    if (!best.has(c) || best.get(c).k < l.k) best.set(c, l);
  });
  return [...best.values()];
}

function partnersFor(card, pool) {
  const res = [];
  pool.forEach(o => {
    if (o.name === card.name) return;
    const s = synergyBetween(card, o);
    if (s.length) res.push({card:o, links:s});
  });
  return res.sort((a,b) => b.links.length - a.links.length);
}
