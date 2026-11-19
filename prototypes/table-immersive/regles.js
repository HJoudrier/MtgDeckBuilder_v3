/* =====================================================================
   regles.js — Le mana, et ce que le joueur a le droit de faire

   Ce que la scène consulte avant chaque geste : de quoi payer, quelles
   cibles, quelles cartes se jouent maintenant, et pourquoi pas les autres.
   ===================================================================== */

function analyseCout(c) {
  const m = String(c || '').match(/^(\d*)([WUBRG]*)$/) || ['', '', ''];
  return {gen: +(m[1] || 0), col: [...(m[2] || '')]};
}
const coutTotal = c => { const a = analyseCout(c); return a.gen + a.col.length; };

/* Les terrains qui paieraient ce coût, ou rien. Le générique se paie avec
   la couleur dont la main a le moins besoin : lancer le Loup ne doit pas
   engager la dernière Forêt quand la Croissance attend en main. */
function terrainsPour(j, cout, sauf) {
  const libres = dans(j, 'champ').filter(o => def(o).terrain && !o.engage);
  const {gen, col} = analyseCout(cout);
  const pris = [];
  for (const c of col) {
    const t = libres.find(o => !pris.includes(o) && def(o).mana === c);
    if (!t) return null;
    pris.push(t);
  }
  const besoin = {}, compte = {};
  dans(j, 'main').filter(o => o.id !== sauf && !def(o).terrain).forEach(o => analyseCout(def(o).cout).col.forEach(c => { besoin[c] = (besoin[c] || 0) + 1; }));
  libres.filter(o => !pris.includes(o)).forEach(o => { compte[def(o).mana] = (compte[def(o).mana] || 0) + 1; });
  const cle = o => (besoin[def(o).mana] || 0) - (compte[def(o).mana] || 0);
  for (let i = 0; i < gen; i++) {
    const dispo = libres.filter(o => !pris.includes(o)).sort((a, b) => cle(a) - cle(b));
    if (!dispo.length) return null;
    pris.push(dispo[0]);
    compte[def(dispo[0]).mana]--;
  }
  return pris;
}

function paie(j, cout, sauf) { (terrainsPour(j, cout, sauf) || []).forEach(t => { t.engage = true; }); }

/* ---------- Ce qu'on peut faire ---------- */

function cibles(id) {
  const o = obj(id), c = o && def(o);
  if (!c || !c.cible) return [];
  const crea = E.obj.filter(x => x.zone === 'champ' && !def(x).terrain).map(x => x.id);
  return c.cible === 'tout' ? [...crea, 'adv', 'moi'] : crea;
}

const rituel = j => E.actif === j && estPrincipale(E.phase) && !E.pile.length;

function jouableBrut(o, j) {
  const c = def(o);
  if (c.terrain) return rituel(j) && !E.terrainJoue[j];
  if (!c.instant && !rituel(j)) return false;
  if (!terrainsPour(j, c.cout, o.id)) return false;
  return !c.cible || cibles(o.id).length > 0;
}

function jouables() {
  if (!E || E.fin || E.prio !== 'moi' || !E.question || E.question.q !== 'priorite') return [];
  return dans('moi', 'main').filter(o => jouableBrut(o, 'moi')).map(o => o.id);
}

const aDesReponses = () => dans('moi', 'main').some(o => def(o).instant && terrainsPour('moi', def(o).cout, o.id) && cibles(o.id).length);
const peutAttaquer = o => o.zone === 'champ' && !def(o).terrain && !o.engage && !o.malade && o.ctrl === E.actif;
const attaquantsPossibles = () => E && E.actif === 'moi' ? dans('moi', 'champ').filter(peutAttaquer).map(o => o.id) : [];

/* Pourquoi une carte de la main ne se joue pas : dit au joueur plutôt
   qu'un refus muet. */
function pourquoiPas(id) {
  const o = obj(id);
  if (!o || o.zone !== 'main') return '';
  const c = def(o);
  if (E.fin) return 'La partie est finie.';
  if (E.prio !== 'moi' || !E.question) return E.actif === 'adv' ? 'C\'est le tour de Mirela.' : 'Mirela a la main.';
  if (E.question.q !== 'priorite') return 'Choisissez d\'abord vos attaquants.';
  if (c.terrain) return E.terrainJoue.moi ? 'Un seul terrain par tour.' : 'Un terrain se pose pendant votre phase principale, pile vide.';
  if (!c.instant && !rituel('moi')) return 'Une créature se lance pendant votre phase principale, pile vide.';
  if (!terrainsPour('moi', c.cout, o.id)) return 'Pas assez de mana.';
  return 'Aucune cible possible.';
}

