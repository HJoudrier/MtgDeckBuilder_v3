/* =====================================================================
   js/anaFamilles.js — Ce que le deck fait : familles, mots-clés, interaction, terrains

   L'analyse des cartes range déjà chaque capacité sous un nœud du graphe, et
   chaque nœud sous une des onze familles (`GROUPS`, js/reglesEffets.js). On ne
   relit donc aucun texte pour dire ce que fait le deck : on compte, famille par
   famille, les cartes qui en **produisent** un effet et celles qui s'en
   **nourrissent** — un deck qui fait des jetons sans rien qui les exploite se
   voit d'un coup d'œil.

   Les deux productions que toute carte porte du seul fait d'exister —
   « arrivée en jeu » pour une permanente, « lancement de sort » pour un sort —
   n'entrent pas dans les comptes : elles mettraient chaque carte dans deux
   familles et n'apprendraient rien.
   ===================================================================== */

/* Le profil de famille d'une carte : les nœuds qu'elle produit par un effet,
   ceux sur lesquels une de ses capacités se déclenche. */
function noeudsDeCarte(card) {
  const a = card.an || {abilities:[], triggers:[]};
  const produit = new Set(), nourrit = new Set();
  (a.abilities || []).forEach(x => (x.to || []).forEach(n => produit.add(n)));
  (a.triggers || []).forEach(t => nourrit.add(t.c));
  return {produit, nourrit};
}

function familles() {
  const cartes = cartesDuDeck().filter(c => !/^basic land/i.test(c.type));
  const parGroupe = {};
  Object.keys(GROUPS).forEach(g => parGroupe[g] = {groupe:g, produit:new Set(), nourrit:new Set(), noeuds:new Map()});
  cartes.forEach(c => {
    const {produit, nourrit} = noeudsDeCarte(c);
    produit.forEach(n => {
      const nd = NODE[n]; if (!nd) return;
      const g = parGroupe[nd.group];
      g.produit.add(c.name);
      g.noeuds.set(n, (g.noeuds.get(n) || 0) + 1);
    });
    nourrit.forEach(n => {
      const nd = NODE[n]; if (!nd) return;
      parGroupe[nd.group].nourrit.add(c.name);
    });
  });
  const liste = Object.values(parGroupe).map(g => ({
    groupe:g.groupe, label:GROUPS[g.groupe].label, couleur:GROUPS[g.groupe].color,
    produit:g.produit.size, nourrit:g.nourrit.size,
    noeuds:[...g.noeuds.entries()].sort((a, b) => b[1] - a[1]).slice(0, 4)
      .map(([n, k]) => ({label:NODE[n].label, n:k}))
  }));
  return {total:cartes.length, liste};
}

/* Les mots-clés qui se lisent sur une ligne à eux : « Flying, haste », « Ward
   {2} », « Protection from red ». Une ligne qui n'est faite que de mots-clés
   les donne ; « destroy target creature with flying » n'en donne aucun. */
const MOTS_CLES_ANALYSE = [
  ['flying', 'Vol'], ['trample', 'Piétinement'], ['haste', 'Célérité'], ['vigilance', 'Vigilance'],
  ['deathtouch', 'Contact mortel'], ['lifelink', 'Lien de vie'], ['first strike', 'Initiative'],
  ['double strike', 'Double initiative'], ['menace', 'Menace'], ['reach', 'Portée'],
  ['hexproof', 'Défense talismanique'], ['ward', 'Garde'], ['indestructible', 'Indestructible'],
  ['flash', 'Flash'], ['defender', 'Défenseur'], ['protection', 'Protection'],
  ['prowess', 'Prouesse'], ['infect', 'Infection'], ['toxic', 'Toxique'], ['cascade', 'Cascade']
];

function motsClesDe(card) {
  const out = new Set();
  String(card.text || '').split(' // ').forEach(ligne => {
    const l = stripReminder(ligne).toLowerCase().trim().replace(/\.$/, '');
    if (!l) return;
    const morceaux = l.split(/,\s*|;\s*/);
    const trouves = morceaux.map(m => MOTS_CLES_ANALYSE.find(([k]) => m === k || m.startsWith(k + ' ')));
    if (trouves.every(Boolean)) trouves.forEach(([k]) => out.add(k));
  });
  return out;
}

function motsClesDuDeck() {
  const compte = new Map();
  deckEntries().forEach(e => motsClesDe(e.card).forEach(k => compte.set(k, (compte.get(k) || 0) + e.qty)));
  return MOTS_CLES_ANALYSE.filter(([k]) => compte.has(k))
    .map(([k, label]) => ({k, label, n:compte.get(k)}))
    .sort((a, b) => b.n - a.n);
}

/* Le profil d'interaction : par quel moyen le deck répond, à quelle vitesse,
   et s'il vise une carte ou toute la table. La vitesse d'un éphémère vaut
   aussi pour une carte à flash. */
const MOYENS_INTERACTION = [
  ['DESTRUCTION', 'Destruction'], ['EXIL', 'Exil'], ['BOUNCE', 'Renvoi en main'],
  ['CONTRESORT', 'Contresort'], ['DEGATS', 'Dégâts'], ['MIS_EN_BIBLIO', 'Mise en bibliothèque']
];

function profilInteraction() {
  const lignes = deckEntries().filter(e => e.card.cats.has('interaction') || e.card.cats.has('wipe'));
  const moyens = MOYENS_INTERACTION.map(([n, label]) => ({n, label, q:0}));
  let rapide = 0, masse = 0, total = 0;
  lignes.forEach(e => {
    const {produit} = noeudsDeCarte(e.card);
    moyens.forEach(m => { if (produit.has(m.n)) m.q += e.qty; });
    if (/instant/i.test(e.card.type) || motsClesDe(e.card).has('flash')) rapide += e.qty;
    if (e.card.cats.has('wipe')) masse += e.qty;
    total += e.qty;
  });
  return {total, rapide, masse, cible: total - masse, moyens:moyens.filter(m => m.q).sort((a, b) => b.q - a.q)};
}

/* La base de terrains, comme la détaillent les sites de deckbuilding : les
   bases et les autres, ceux qui arrivent engagés — toujours, ou sauf
   condition —, ceux qui donnent plusieurs couleurs, et ceux qui font autre
   chose que du mana. */
function profilTerrains() {
  const o = {total:0, bases:0, engages:0, conditionnels:0, multicolores:0, utilitaires:0, utiles:[]};
  deckEntries().filter(e => e.card.isLand).forEach(e => {
    const c = e.card, q = e.qty, tx = String(c.text || '').toLowerCase();
    o.total += q;
    if (/\bbasic\b/i.test(c.type)) o.bases += q;
    if (/enters(?: the battlefield)? tapped/.test(tx)) {
      if (/unless|you may pay|if you control/.test(tx)) o.conditionnels += q; else o.engages += q;
    }
    if (manaProduitDe(c).replace('C', '').length >= 2) o.multicolores += q;
    const {produit} = noeudsDeCarte(c);
    const autre = [...produit].some(n => NODE[n] && NODE[n].group !== 'mana');
    if (autre) { o.utilitaires += q; o.utiles.push(c.name); }
  });
  return o;
}

/* Les types de créatures les plus représentés : de quoi voir le tribal qu'un
   deck porte, ou qu'il pourrait porter. */
function sousTypesDuDeck(max) {
  const compte = new Map();
  deckEntries().filter(e => e.card.isCreature).forEach(e => {
    const st = String(e.card.type).split(' // ')[0].split('—')[1];
    (st || '').trim().split(/\s+/).filter(Boolean).forEach(t => compte.set(t, (compte.get(t) || 0) + e.qty));
  });
  return [...compte.entries()].sort((a, b) => b[1] - a[1]).slice(0, max || 8).map(([t, n]) => ({t, n}));
}
