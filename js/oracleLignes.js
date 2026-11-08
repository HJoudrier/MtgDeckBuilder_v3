/* =====================================================================
   js/oracleLignes.js — Ranger chaque ligne d'une carte

   Une ligne d'oracle est une capacité, et une seule sorte de capacité : des
   mots-clés, une capacité de loyauté, une activée (« coût : effet »), une
   déclenchée (« when / whenever / at »), une façon d'entrer, une statique,
   ou l'effet d'un sort. L'ordre des essais compte — une ligne de loyauté a
   la forme d'une activée, une déclenchée peut contenir deux-points dans une
   capacité accordée.

   Chaque ligne rend ce qu'elle a compris et ce qu'elle a laissé (`rates`) :
   c'est ce qui fait la couverture de la carte (js/definitions.js).
   ===================================================================== */

/* L'indice du premier deux-points hors guillemets, ou -1. */
function deuxPoints(ligne) {
  let guill = false;
  for (let i = 0; i < ligne.length; i++) {
    if (ligne[i] === '"') guill = !guill;
    if (ligne[i] === ':' && !guill) return i;
  }
  return -1;
}

/* Un effet, éventuellement modal : « choose one — » suivi de puces. Les puces
   sont déjà dans `puces` (lignes qui commencent par « • »). */
function compileEffetModal(texte, c, puces) {
  const m = /^choose (one|two|one or both|one or more|any number) ?—?$/.exec(texte.trim().replace(/\.$/, ''));
  if (!m || !puces || !puces.length) {
    const r = compileEffet(texte, c);
    return {effet: {ops: r.ops, cibles: c.cibles, modes: null}, rates: r.rates};
  }
  const rates = [];
  const options = puces.map(p => {
    const cm = contexteOracle({objet: c.objetEvt, joueur: c.joueurEvt});
    const r = compileEffet(p.replace(/^•\s*/, ''), cm);
    if (r.rates.length) rates.push(...r.rates);
    return {ops: r.ops, cibles: cm.cibles, texte: p.replace(/^•\s*/, ''), ok: !r.rates.length && r.ops.length > 0};
  });
  const bornes = {one: [1, 1], two: [2, 2], 'one or both': [1, 2], 'one or more': [1, options.length], 'any number': [0, options.length]}[m[1]];
  return {effet: {ops: [], cibles: [], modes: {min: bornes[0], max: bornes[1], options: options.filter(o => o.ok)}}, rates};
}

/* Les mentions de rythme qui suivent une capacité activée ou déclenchée. */
function oteRythme(txt) {
  const r = {txt, vitesse: 'ephemere', unefois: false};
  r.txt = r.txt.replace(/\.?\s*activate only as a sorcery\.?$/, () => { r.vitesse = 'rituel'; return ''; })
    .replace(/\.?\s*activate only once each turn\.?$/, () => { r.unefois = true; return ''; })
    .replace(/\.?\s*this ability triggers only once each turn\.?$/, () => { r.unefois = true; return ''; })
    .trim();
  return r;
}

/* Une ligne déclenchée : on essaie chaque virgule comme frontière entre la
   condition et l'effet, la première qui se lise des deux côtés l'emporte —
   « Whenever ~ enters or attacks, create two 2/2… » n'a pas de virgule dans
   sa condition, « Whenever another creature with power 2 or less you control
   enters, draw a card » non plus, mais rien ne le garantit. */
function compileDeclenchee(ligne, puces) {
  const m = /^(when|whenever|at) (.+)$/.exec(ligne);
  if (!m) return null;
  const corps = m[2];
  for (let i = corps.indexOf(', '); i >= 0; i = corps.indexOf(', ', i + 1)) {
    const ecoutes = lisDeclencheur(corps.slice(0, i));
    if (!ecoutes) continue;
    const ry = oteRythme(corps.slice(i + 2));
    if (/^if [^,]+, /.test(ry.txt)) return {genre: 'declenchee', ecoutes, effet: null, rates: [ry.txt]};
    const c = contexteOracle(apportDecl(ecoutes));
    const r = compileEffetModal(ry.txt, c, puces);
    return {genre: 'declenchee', ecoutes, effet: r.effet, unefois: ry.unefois, rates: r.rates};
  }
  return {genre: 'declenchee', ecoutes: null, effet: null, rates: [ligne]};
}

/* Une ligne activée ou de loyauté. */
function compileActivee(ligne, puces) {
  const i = deuxPoints(ligne);
  if (i < 0) return null;
  const avant = ligne.slice(0, i).trim(), ry = oteRythme(ligne.slice(i + 1).trim());
  let m;
  if ((m = /^([+-]?\d+|[+-]x)$/.exec(avant))) {
    const c = contexteOracle();
    const r = compileEffetModal(ry.txt, c, puces);
    const delta = /x/.test(m[1]) ? 'X' : +m[1];
    return {genre: 'loyaute', delta, effet: r.effet, rates: r.rates};
  }
  if (/^(when|whenever|at) /.test(avant)) return null;
  const cout = coutActivation(avant);
  if (!cout) return {genre: 'activee', cout: null, effet: null, rates: [ligne]};
  const c = contexteOracle();
  const r = compileEffetModal(ry.txt, c, puces);
  const ops = r.effet.ops;
  if (ops.length === 1 && ops[0].op === 'mana' && !r.rates.length && !c.cibles.length)
    return {genre: 'mana', cout, options: ops[0].options, parChaque: ops[0].parChaque || null, rates: []};
  return {genre: 'activee', cout, effet: r.effet, vitesse: ry.vitesse, unefois: ry.unefois, rates: r.rates};
}

/* Ranger une ligne. `estSort` : la carte est un éphémère ou un rituel, et
   ce qui n'est ni mot-clé ni activée est son effet ; `cs` est alors le
   contexte partagé par toutes ses lignes, qui y accumulent leurs cibles. */
function compileLigne(ligne, estSort, cs, puces) {
  const t = ligne.replace(/\.$/, '');
  const k = ligneMotsCles(t);
  if (k) return {genre: 'mots', ...k, rates: []};
  let m;
  if ((m = /^as an additional cost to cast ~, (.+)$/.exec(t))) {
    const cout = coutActivation(m[1]);
    return cout ? {genre: 'coutSup', cout, rates: []} : null;
  }
  if ((m = /^enchant (.+)$/.exec(t))) {
    const desc = lisDescripteur(m[1], {objets: true});
    return desc ? {genre: 'aura', desc, rates: []} : {genre: 'aura', desc: null, rates: [t]};
  }
  const decl = compileDeclenchee(t, puces);
  if (decl) return decl;
  const act = compileActivee(ligne, puces);
  if (act) return act;
  const ent = lisEntree(ligne);
  if (ent) return {genre: 'entree', entree: ent, rates: []};
  if (estSort) {
    const r = compileEffetModal(ligne, cs, puces);
    return {genre: 'sort', effet: r.effet, rates: r.rates};
  }
  const s = lisStatique(t);
  if (s) return {genre: 'statique', s, rates: []};
  return null;
}

/* Grouper les puces sous la ligne qui les annonce, puis ranger chaque ligne.
   Rend `[{texte, res}]`, `res` à `null` pour une ligne incomprise. */
function compileLignes(lignes, estSort) {
  const cs = contexteOracle();
  const out = [];
  for (let i = 0; i < lignes.length; i++) {
    if (/^•/.test(lignes[i])) continue;
    const puces = [];
    for (let j = i + 1; j < lignes.length && /^•/.test(lignes[j]); j++) puces.push(lignes[j]);
    const texte = [lignes[i], ...puces].join(' ');
    out.push({texte, i, res: compileLigne(lignes[i], estSort, cs, puces)});
  }
  return {lignes: out, contexteSort: cs};
}
