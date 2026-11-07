/* =====================================================================
   js/oracleCouts.js — Lire un coût : celui d'un sort, celui d'une capacité

   Le coût d'un sort ne contient que du mana ; celui d'une capacité activée
   peut y ajouter un engagement, un sacrifice, une défausse, des points de
   vie. Les deux se lisent ici, et une seule partie inconnue fait échouer la
   lecture : une capacité dont on ignore une partie du prix serait gratuite
   pour le moteur, donc plus forte qu'elle n'est.
   ===================================================================== */

/* Un coût en mana : symboles, part générique, couleurs exigées, hybrides,
   nombre de X, et sa valeur de mana. Un hybride `{2/W}` se paie en blanc,
   un phyrexian `{W/P}` aussi — simplification annoncée : le moteur ne paie
   pas en vie à la place du mana. */
function coutMana(str) {
  const sym = String(str || '').toUpperCase().match(/\{[^}]+\}/g) || [];
  const c = {sym, generique: 0, couleurs: {W: 0, U: 0, B: 0, R: 0, G: 0, C: 0}, hybrides: [], x: 0, total: 0};
  for (const s of sym) {
    const v = s.slice(1, -1);
    if (/^\d+$/.test(v)) { c.generique += +v; c.total += +v; continue; }
    if (v === 'X') { c.x++; continue; }
    if (v === 'S') { c.generique++; c.total++; continue; }
    const parts = v.split('/');
    if (parts.length === 1 && c.couleurs[v] != null) { c.couleurs[v]++; c.total++; continue; }
    if (parts.length === 2 && parts[1] === 'P' && c.couleurs[parts[0]] != null) { c.couleurs[parts[0]]++; c.total++; continue; }
    if (parts.length === 2 && /^\d+$/.test(parts[0]) && c.couleurs[parts[1]] != null) { c.couleurs[parts[1]]++; c.total++; continue; }
    if (parts.length === 2 && c.couleurs[parts[0]] != null && c.couleurs[parts[1]] != null) {
      c.hybrides.push(parts); c.total++; continue;
    }
    return null;
  }
  return c;
}

/* Un coût vide, pour les capacités qui ne coûtent qu'un engagement. */
function coutManaVide() {
  return {sym: [], generique: 0, couleurs: {W: 0, U: 0, B: 0, R: 0, G: 0, C: 0}, hybrides: [], x: 0, total: 0};
}

/* Un morceau de coût d'activation. Rend la clé et la valeur à poser sur le
   coût, ou `null`. */
function morceauCout(p) {
  let m;
  if (p === '{t}') return ['engage', true];
  if (p === '{q}') return ['degage', true];
  if (/^(\{[^}]+\})+$/.test(p) && !/\{[tqe]\}/.test(p)) { const c = coutMana(p); return c ? ['mana', c] : null; }
  if (p === 'sacrifice ~') return ['sacSoi', true];
  if (p === 'exile ~') return ['exileSoi', true];
  if ((m = /^sacrifice (a|an|another|two|three) (.+)$/.exec(p))) {
    const desc = lisDescripteur(m[2], {objets: true});
    if (!desc) return null;
    if (m[1] === 'another') desc.autre = true;
    return ['sac', {desc, n: nombreOracle(m[1] === 'another' ? 'a' : m[1])}];
  }
  if ((m = /^discard (a|an|one|two|three) cards?$/.exec(p))) return ['defausse', {n: nombreOracle(m[1])}];
  if ((m = /^discard (a|an) (.+ card)$/.exec(p))) {
    const desc = lisDescripteur(m[2], {cartes: true});
    return desc ? ['defausse', {n: 1, desc}] : null;
  }
  if ((m = /^pay (\d+) life$/.exec(p))) return ['vie', +m[1]];
  if ((m = /^remove (a|an|one|two|three|\w+) ([+-]1\/[+-]1|\w+) counters? from ~$/.exec(p)))
    return ['retire', {n: nombreOracle(m[1]), genre: m[2]}];
  if ((m = /^tap (an|a|two|three) untapped (.+) you control$/.exec(p))) {
    const desc = lisDescripteur(m[2], {objets: true});
    return desc ? ['engageAutres', {n: nombreOracle(m[1]), desc}] : null;
  }
  return null;
}

/* Le coût d'une capacité activée, morceau par morceau. */
function coutActivation(txt) {
  const cout = {mana: null};
  for (const p of String(txt).split(/,\s*/).map(s => s.trim()).filter(Boolean)) {
    const k = morceauCout(p);
    if (!k) return null;
    cout[k[0]] = k[1];
  }
  if (!cout.mana) cout.mana = coutManaVide();
  return cout;
}
