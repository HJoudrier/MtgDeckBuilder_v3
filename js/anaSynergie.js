/* =====================================================================
   js/anaSynergie.js — À quel point les cartes du deck se parlent

   La notation relie déjà chaque carte du deck aux autres (`noteCarte()`,
   js/notation.js) : ce qu'elle produit contre ce qu'elles attendent, et le
   tri entre lien précis et déclencheur large (js/liens.js). Le rendu de la
   section Deck en tire `NOTES_DECK` à chaque repeint ; l'analyse s'en sert
   telle quelle, sans noter une seconde fois.

   Le score tient en trois mesures, chacune entre zéro et un :
   - la **couverture** : la part des sorts reliés à au moins une autre carte ;
   - la **densité** : le nombre moyen de cartes auxquelles un sort se relie,
     ramené sous un plafond qu'on approche sans l'atteindre ;
   - la **cohésion** : la part des sorts qui tiennent dans le plus grand bloc
     d'un seul tenant — un deck à deux moitiés qui s'ignorent en a peu.
   Les terrains n'y entrent pas : la plupart ne parlent à personne, et l'on
   jugerait sinon un deck sur sa base de mana.
   ===================================================================== */

function notesDuDeck() {
  const entries = deckEntries();
  if (entries.length && !NOTES_DECK.size) evalueDeck(entries);
  return NOTES_DECK;
}

/* Le plus grand bloc d'un seul tenant, par union-find sur les liens précis. */
function plusGrandBloc(noms, voisins) {
  const parent = new Map(noms.map(n => [n, n]));
  const racine = n => { while (parent.get(n) !== n) { parent.set(n, parent.get(parent.get(n))); n = parent.get(n); } return n; };
  voisins.forEach(([a, b]) => { if (parent.has(a) && parent.has(b)) parent.set(racine(a), racine(b)); });
  const tailles = new Map();
  noms.forEach(n => { const r = racine(n); tailles.set(r, (tailles.get(r) || 0) + 1); });
  return Math.max(0, ...tailles.values());
}

function analyseSynergie() {
  const notes = notesDuDeck();
  const sorts = cartesDuDeck().filter(c => !c.isLand);
  const N = sorts.length;
  const vide = {N, score:0, couverture:0, densite:0, cohesion:0, moyenne:0, pivots:[], isoles:[], axes:[], boucles:[], ponts:[], paires:0};
  if (N < 2) return vide;

  const nomsSorts = new Set(sorts.map(c => c.name));
  const paires = [], axes = new Map(), pivots = [], isoles = [], boucles = [], ponts = [];
  let somme = 0, relies = 0;
  sorts.forEach(c => {
    const note = notes.get(c.name);
    const precis = note ? (note.partners || []).filter(p => !p.large && (p.precis || []).length) : [];
    const d = precis.filter(p => nomsSorts.has(p.name)).length;
    somme += d;
    if (d) relies++; else isoles.push(c);
    pivots.push({card:c, n:d});
    precis.forEach(p => {
      if (nomsSorts.has(p.name)) paires.push([c.name, p.name]);
      /* Un axe se compte du côté de celle qui fournit, pour qu'une paire ne
         compte qu'une fois par concept. */
      p.precis.filter(l => l.dir === 'ab').forEach(l => {
        if (!axes.has(l.concept)) axes.set(l.concept, new Set());
        axes.get(l.concept).add(c.name + '>' + p.name);
      });
    });
    if (note && (note.graph || []).includes('boucle')) boucles.push(c);
    if (note && (note.graph || []).includes('pont')) ponts.push(c);
  });

  const moyenne = somme / N;
  const couverture = relies / N;
  const densite = 1 - Math.exp(-moyenne / 4);
  const cohesion = plusGrandBloc([...nomsSorts], paires) / N;
  const score = Math.round(100 * (0.35 * couverture + 0.35 * densite + 0.30 * cohesion));
  return {
    N, score, couverture, densite, cohesion, moyenne,
    paires: new Set(paires.map(p => [...p].sort().join('|'))).size,
    pivots: pivots.filter(x => x.n).sort((a, b) => b.n - a.n).slice(0, 10),
    isoles: isoles.sort((a, b) => b.cmc - a.cmc),
    axes: [...axes.entries()].map(([k, s]) => ({concept:k, label:NODE[k] ? NODE[k].label : k, n:s.size}))
      .sort((a, b) => b.n - a.n).slice(0, 10),
    boucles, ponts
  };
}

function verdictSynergie(score) {
  if (score >= 75) return {mot:'très soudé', col:'var(--ok)'};
  if (score >= 55) return {mot:'cohérent', col:'var(--ok)'};
  if (score >= 35) return {mot:'épars', col:'var(--warn)'};
  return {mot:'peu lié', col:'var(--bad)'};
}

/* Ce qu'EDHREC dit des cartes du deck, pour le commandant chargé : l'inclusion
   moyenne — sont-ce les cartes que les autres jouent ? — et la synergie
   moyenne — leur sont-elles propres, ou les joue-t-on partout ? Les cartes
   qu'EDHREC ignore se comptent à part, c'est souvent là qu'un deck est original. */
function synergieEdhrec() {
  if (!S.edhrec || !S.edhrec.data || !S.edhrec.data.map) return null;
  const sorts = cartesDuDeck().filter(c => !c.isLand && c.name !== S.commander);
  const trouvees = [], absentes = [];
  sorts.forEach(c => {
    const r = edhrecFor(c);
    if (r && r.role === 'principal' && typeof r.inclusion === 'number') trouvees.push({card:c, inclusion:r.inclusion, synergy:r.synergy || 0});
    else absentes.push(c);
  });
  if (!trouvees.length) return {commandant:S.edhrec.data.commandant, trouvees, absentes, inclusion:0, synergie:0, hautes:[], basses:[]};
  const moy = k => trouvees.reduce((a, x) => a + x[k], 0) / trouvees.length;
  return {
    commandant: S.edhrec.data.commandant, trouvees, absentes,
    inclusion: moy('inclusion'), synergie: moy('synergy'),
    hautes: trouvees.filter(x => x.synergy >= 0.2).sort((a, b) => b.synergy - a.synergy),
    basses: trouvees.filter(x => x.synergy < 0).sort((a, b) => a.synergy - b.synergy)
  };
}
