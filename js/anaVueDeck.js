/* =====================================================================
   js/anaVueDeck.js — La synthèse, la courbe et les types, le prix

   Les trois blocs qui décrivent le deck tel qu'il est, sans hasard : ce qu'il
   contient, à quel coût, pour quelle valeur. Tous lisent le contexte que
   `renderN()` bâtit une fois (js/anaSection.js) et ne recalculent rien.
   ===================================================================== */

/* La synthèse : les chiffres qu'on vient chercher, chacun renvoyant au bloc
   qui le détaille plus bas. */
function anaSynthese(A) {
  const f = fmt(), msgs = legality();
  const tuiles = [];
  tuiles.push(anaTuile(`${A.taille}<span class="ana-sur">/${f.size}</span>`, 'Cartes',
    {sous: msgs.length ? `${msgs.length} point(s) à corriger` : 'conforme au format',
     col: msgs.length ? 'var(--warn)' : 'var(--ok)'}));
  if (A.palier) tuiles.push(anaTuile(`${A.palier.palier === 2 && !A.palier.raisons.length ? '1–2' : A.palier.palier}${A.palier.competitif ? '<span class="ana-sur">→5</span>' : ''}`,
    'Palier estimé', {sous: PALIERS[A.palier.palier].nom + (A.palier.inconnu ? ' · Game Changers inconnus' : ''),
      titre: PALIERS[A.palier.palier].aide}));
  tuiles.push(anaTuile(`${A.syn.score}<span class="ana-sur">/100</span>`, 'Synergie',
    {sous: verdictSynergie(A.syn.score).mot, col: verdictSynergie(A.syn.score).col}));
  tuiles.push(anaTuile(nombreAna(A.cmcMoyen), 'Coût moyen', {sous:`médiane ${nombreAna(A.cmcMedian, 1)} · sorts seuls`}));
  tuiles.push(anaTuile(String(A.terrains), 'Terrains',
    {sous:`${pctAna(A.taille ? A.terrains / A.taille : 0)} du deck · ${A.accelerateurs} accélérateur(s)`}));
  if (A.mains) tuiles.push(anaTuile(pctAna(A.mains.gardable), 'Main gardable',
    {sous:`${A.mains.bornes[0]} à ${A.mains.bornes[1]} terrains en 7 cartes`, titre:'Probabilité exacte, sans mulligan'}));
  if (A.sim.parties) tuiles.push(anaTuile(A.sim.atteint4 ? nombreAna(A.sim.tour4 / A.sim.atteint4, 1) : '—', '4 mana au tour',
    {sous:`en moyenne · ${pctAna(partAtteinteAuTour(A.sim.premier4, 4, A.sim.parties))} des parties au tour 4`}));
  tuiles.push(anaTuile(String(A.interaction.total), 'Interaction',
    {sous:`${A.interaction.rapide} à vitesse d'éphémère · ${A.interaction.masse} de masse`}));
  tuiles.push(anaTuile(eur(A.valeur), 'Valeur', {sous: A.aAcheter ? `${eur(A.aAcheter)} à acheter` : 'tout est possédé'}));
  return `<div class="statgrid ana-synthese">${tuiles.join('')}</div>`;
}

/* La courbe, coupée entre créatures et autres sorts — la part qui tient la
   table et celle qui répond —, puis les types et leur coût moyen. */
function anaCourbe(A) {
  const parCout = Array.from({length:8}, () => ({cre:0, autre:0}));
  A.entries.forEach(e => {
    if (e.card.isLand) return;
    const k = Math.min(7, e.card.cmc);
    parCout[k][e.card.isCreature ? 'cre' : 'autre'] += e.qty;
  });
  const cols = parCout.map((x, i) => ({
    label: i === 7 ? '7+' : String(i), v: x.cre + x.autre,
    titre: `${i === 7 ? '7 ou plus' : i} : ${x.cre} créature(s), ${x.autre} autre(s) sort(s)`,
    segments: [{v:x.autre, couleur:'var(--edh)'}, {v:x.cre, couleur:'var(--brass)'}]
  }));
  const sorts = A.entries.filter(e => !e.card.isLand);
  const qte = sorts.reduce((a, e) => a + e.qty, 0);
  const bas = sorts.filter(e => e.card.cmc <= 3).reduce((a, e) => a + e.qty, 0);
  const total = sorts.reduce((a, e) => a + e.card.cmc * e.qty, 0);
  const avecX = sorts.filter(e => (e.card.symbols || []).some(s => /^\{X\}$/i.test(s))).reduce((a, e) => a + e.qty, 0);

  const parType = {};
  A.entries.forEach(e => {
    const t = mainType(e.card);
    parType[t] = parType[t] || {q:0, cmc:0};
    parType[t].q += e.qty;
    parType[t].cmc += e.card.cmc * e.qty;
  });
  const types = TYPE_ORDER.filter(t => parType[t]);
  const maxT = Math.max(1, ...types.map(t => parType[t].q));
  const tribus = sousTypesDuDeck(10);

  return `<div class="ana-legende small"><span><i style="background:var(--brass)"></i>Créatures</span><span><i style="background:var(--edh)"></i>Autres sorts</span></div>
    ${anaColonnes(cols)}
    <div class="statgrid ana-mini">
      ${anaTuile(pctAna(qte ? bas / qte : 0), 'Sorts à 3 ou moins')}
      ${anaTuile(String(total), 'Coût total des sorts')}
      ${anaTuile(nombreAna(A.taille ? total / A.taille : 0), 'Coût moyen, terrains compris')}
      ${anaTuile(String(avecX), 'Sorts à {X}')}
    </div>
    <h4 class="ana-h4">Types</h4>
    <div class="ana-barres">${types.map(t => anaBarre(esc(t), parType[t].q, maxT, {
      texte:`${parType[t].q} · ${pctAna(parType[t].q / Math.max(1, A.taille))}${t !== 'Terrain' ? ` · coût ${nombreAna(parType[t].cmc / parType[t].q, 1)}` : ''}`})).join('')}</div>
    ${tribus.length ? `<h4 class="ana-h4">Types de créatures</h4>
      <div class="ana-puces">${tribus.map(x => `<span class="pill">${esc(x.t)} <b>${x.n}</b></span>`).join('')}</div>` : ''}`;
}

/* Le prix : la valeur, sa répartition par tranche, les cartes qui la font, et
   la part qui reste à acheter. */
const TRANCHES_PRIX = [[0, 1, 'moins de 1 €'], [1, 5, '1 à 5 €'], [5, 20, '5 à 20 €'], [20, 50, '20 à 50 €'], [50, Infinity, '50 € et plus']];

function anaPrix(A) {
  const chiffrees = A.entries.filter(e => e.card.price > 0);
  const tranches = TRANCHES_PRIX.map(([a, b, label]) => ({label,
    q: chiffrees.filter(e => e.card.price >= a && e.card.price < b).reduce((x, e) => x + e.qty, 0)}));
  const maxQ = Math.max(1, ...tranches.map(t => t.q));
  const cheres = [...chiffrees].sort((a, b) => b.card.price - a.card.price).slice(0, 10);
  const inconnues = A.entries.filter(e => !(e.card.price > 0) && !/^basic land/i.test(e.card.type)).length;
  const qC = chiffrees.reduce((x, e) => x + e.qty, 0);
  return `<div class="statgrid ana-mini">
      ${anaTuile(eur(A.valeur), 'Valeur du deck')}
      ${anaTuile(eur(qC ? A.valeur / qC : 0), 'Prix moyen')}
      ${anaTuile(eur(medianePonderee(chiffrees.map(e => [e.card.price, e.qty]))), 'Prix médian')}
      ${anaTuile(eur(A.aAcheter), 'À acheter', {sous:`${A.nbAAcheter} exemplaire(s) hors collection`})}
    </div>
    <h4 class="ana-h4">Par tranche de prix</h4>
    <div class="ana-barres">${tranches.map(t => anaBarre(t.label, t.q, maxQ)).join('')}</div>
    ${cheres.length ? `<h4 class="ana-h4">Les plus chères</h4>
      <div class="list">${cheres.map(e => `<div class="lrow"><span class="dot" style="background:${stripeColor(e.card)}"></span>
        <span class="cname">${anaNom(e.card)}</span><span class="mono small">${eur(e.card.price)}${e.qty > 1 ? ` ×${e.qty}` : ''}</span></div>`).join('')}</div>` : ''}
    ${inconnues ? `<div class="small muted" style="margin-top:6px">${inconnues} carte(s) sans prix connu : la valeur est un plancher.</div>` : ''}`;
}
