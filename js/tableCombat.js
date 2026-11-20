/* =====================================================================
   js/tableCombat.js — Attaquer et bloquer, au doigt

   Attaquer : toucher ses créatures, chacune part vers l'adversaire choisi
   dans les puces de la ligne de front (js/tableFront.js), puis le bouton de
   tour. Bloquer : glisser un de ses bloqueurs sur l'attaquant qu'il bloque
   (js/tableBloque.js) — seuls les attaquants qu'il peut légalement bloquer
   s'allument (vol, portée, imblocable : `peutBloquer()`, calculé par l'hôte).
   Un toucher sur une créature ne sert plus qu'à la lire : sa loupe propose
   aussi de la faire bloquer, pour qui ne glisse pas ou dont l'attaquant est
   sur une autre page de l'Arène. Une menace bloquée par une seule créature
   est signalée avant qu'on valide, sans quoi le moteur effacerait ce blocage
   en silence.
   ===================================================================== */

function etatCombatTable(q, s, id) {
  if (q.q === 'attaquants') {
    const i = q.options.findIndex(o => o.id === id);
    return i < 0 ? '' : s.paires.has(i) ? 'choisi' : 'choix';
  }
  const bi = q.options.findIndex(o => o.id === id);
  if (bi >= 0) return s.paires.has(bi) ? 'choisi' : 'choix';
  return q.attaquants.some(a => a.id === id) ? 'vise' : '';
}

/* Un toucher pendant un combat. Rend vrai s'il a servi : celui d'une
   attaque seulement, un blocage se fait au glissé. */
function clicCombat(q, s, id) {
  if (q.q !== 'attaquants') return false;
  const i = q.options.findIndex(o => o.id === id);
  if (i < 0) return false;
  if (s.paires.has(i)) s.paires.delete(i); else s.paires.set(i, s.def);
  return true;
}

/* Les menaces bloquées par une seule créature : le moteur effacerait ce
   blocage en silence, on le dit avant qu'on valide. */
function menacesSeules(q, s) {
  const seules = new Map();
  [...s.paires].forEach(([, a]) => seules.set(a, (seules.get(a) || 0) + 1));
  return [...seules].filter(([a, n]) => n === 1 && q.attaquants[a].menace).map(([a]) => q.attaquants[a].label);
}

function attaqueTous() {
  const q = TABLE.question, s = selDe(q);
  q.options.forEach((_, i) => s.paires.set(i, s.def));
  renduTable();
}
