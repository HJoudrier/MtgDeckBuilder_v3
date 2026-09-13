/* =====================================================================
   js/mana.js — Ce qu'une carte demande en mana, et ce qu'elle en produit

   La courbe de mana dit combien de cartes à chaque coût ; elle ne dit rien des
   couleurs. C'est pourtant la question qui décide qu'un deck fonctionne :
   vingt-quatre symboles verts servis par onze sources vertes, et la moitié des
   sorts restent en main.

   Deux mesures, et il faut s'en tenir à la distinction. Ce que le deck
   **demande** se lit dans les coûts, que `parseCost()` (js/analyse.js) a déjà
   découpés en `card.symbols` — tout était là, rien ne le comptait. Ce qu'il
   **produit** n'était connu nulle part : le nœud `MANA` du graphe le réduit à
   un booléen, son motif consommant l'accolade sans capturer la lettre, et
   `card.identity` ressemble à une production sans en être une — un Sol Ring
   qui fait {C}{C} a une identité vide, et un Farseek qui va chercher une
   Plaine a l'identité verte.
   ===================================================================== */

const MANA_LETTRES = ['W', 'U', 'B', 'R', 'G', 'C'];

/* Les types de terrain qui disent à eux seuls ce qu'un terrain produit. Les
   lire dans la ligne de type règle d'un coup les duals, les shocks et les
   triomes, sans rien demander à leur texte. */
const TERRAINS_MANA = {plains:'W', island:'U', swamp:'B', mountain:'R', forest:'G'};

/* Une chaîne de lettres en ordre WUBRGC, sans doublon : c'est la forme sous
   laquelle le mana produit se range, se compare et se sauvegarde. */
function ordonneMana(lettres) {
  const vues = new Set([...(lettres || [])].map(c => String(c).toUpperCase()));
  return MANA_LETTRES.filter(c => vues.has(c)).join('');
}

function manaVide() {
  const o = {generique:0, x:0};
  MANA_LETTRES.forEach(c => o[c] = 0);
  return o;
}

/* Ce qu'une carte demande, symbole par symbole. Un nombre va au générique,
   {X} se compte à part — il ne réclame aucune couleur —, une lettre vaut un
   symbole.

   Un hybride se répartit entre ses façons d'être payé : un symbole divisé par
   le nombre d'options. {W/U} vaut donc un demi-blanc et un demi-bleu, {2/W} et
   {W/P} un demi-blanc — l'autre moitié se paie sans la couleur. Compter un
   hybride pour un plein symbole de chaque couleur ferait passer un deck
   Boros-hybride pour deux fois plus exigeant qu'il n'est. */
function pipsCarte(card) {
  const o = manaVide();
  if (!card || !card.symbols) return o;
  card.symbols.forEach(s => {
    const inner = String(s).slice(1, -1).toUpperCase();
    if (/^\d+$/.test(inner)) { o.generique += parseInt(inner, 10); return; }
    if (/^[XYZ]$/.test(inner)) { o.x += 1; return; }
    const options = inner.split('/');
    const couleurs = options.filter(p => p.length === 1 && MANA_LETTRES.includes(p));
    if (!couleurs.length) { o.generique += 1; return; }   // {S} et les autres
    const parts = couleurs.length + (options.length > couleurs.length ? 1 : 0);
    couleurs.forEach(c => o[c] += 1 / parts);
  });
  return o;
}

/* Ce qu'une carte produit, lu dans ce qu'on a sous la main : sa ligne de type
   d'abord, son texte oracle ensuite. Aucune requête, aucun cache — cela marche
   dès le premier lancement, hors ligne, sur la base livrée comme sur le
   catalogue. */
function manaProduitTexte(card) {
  if (!card) return '';
  const out = new Set();

  const type = String(card.type || '').toLowerCase();
  if (/\bland\b/.test(type)) {
    Object.keys(TERRAINS_MANA).forEach(t => { if (type.includes(t)) out.add(TERRAINS_MANA[t]); });
  }

  const tx = String(card.text || '').toLowerCase();
  /* « of any color », et la tournure des terrains-miroirs : les cinq. */
  if (/any color|any one color|any type that a land you control could produce/.test(tx))
    'WUBRG'.split('').forEach(c => out.add(c));

  /* Les clauses « add », jusqu'à la fin de leur phrase — au-delà, les symboles
     appartiennent à autre chose : « {T}: Add {C}. Spend this mana only to cast
     artifact spells » ne produit pas ce qu'elle sert à lancer. La limite de mot
     épargne « additional », qui n'annonce aucune production. */
  (tx.match(/\badds?\b[^.;]*/g) || []).forEach(clause => {
    (clause.match(/\{[^}]+\}/g) || []).forEach(s => {
      s.slice(1, -1).split('/').forEach(p => {
        const c = p.toUpperCase();
        if (p.length === 1 && MANA_LETTRES.includes(c)) out.add(c);
      });
    });
  });

  return ordonneMana([...out]);
}

/* Le mana produit d'une carte. `card.manaProduit` vient de `produced_mana`,
   que Scryfall fait autorité — par une réponse ou par l'archive du catalogue —
   et l'emporte donc ; le texte prend le relais quand il manque. Le champ est
   facultatif partout : un atelier qui n'a jamais vu le réseau lit quand même
   son mana dans le texte. */
function manaProduitDe(card) {
  if (card && typeof card.manaProduit === 'string' && card.manaProduit) return card.manaProduit;
  return manaProduitTexte(card);
}

/* Le bilan du deck **entier**, sans passer par `carteFiltree()` : l'équilibre
   du mana est une propriété du deck, comme les jauges de rôle et le contrôle
   de conformité. Filtrer sur « créatures » ferait disparaître les terrains qui
   les lancent, et le verdict n'aurait plus de sens.

   Une carte compte une source par couleur qu'elle produit — c'est la mesure
   usuelle —, rangée selon qu'elle est un terrain ou un accélérateur : un Birds
   of Paradise est bien une source de vert, sans valoir tout à fait une Forêt. */
function bilanMana() {
  const pips = manaVide();
  const sources = {};
  MANA_LETTRES.forEach(c => sources[c] = {terrains:0, accelerateurs:0});
  let terrains = 0, accelerateurs = 0;

  deckEntries().forEach(e => {
    const p = pipsCarte(e.card);
    MANA_LETTRES.forEach(c => pips[c] += p[c] * e.qty);
    pips.generique += p.generique * e.qty;
    pips.x += p.x * e.qty;

    const prod = manaProduitDe(e.card);
    if (!prod) return;
    const panier = e.card.isLand ? 'terrains' : 'accelerateurs';
    if (e.card.isLand) terrains += e.qty; else accelerateurs += e.qty;
    prod.split('').forEach(c => { if (sources[c]) sources[c][panier] += e.qty; });
  });

  const totalPips = MANA_LETTRES.reduce((t, c) => t + pips[c], 0);
  /* Le total des sources compte une carte bicolore deux fois, comme le total
     des symboles compte deux fois une carte à {W}{U} : les deux parts se
     comparent alors sur la même base. */
  const totalSources = MANA_LETTRES.reduce((t, c) => t + sources[c].terrains + sources[c].accelerateurs, 0);

  const lignes = MANA_LETTRES
    .filter(c => pips[c] > 0 || sources[c].terrains + sources[c].accelerateurs > 0)
    .map(c => {
      const n = sources[c].terrains + sources[c].accelerateurs;
      const partPips = totalPips ? pips[c] / totalPips : 0;
      const partSources = totalSources ? n / totalSources : 0;
      return {couleur:c, pips:pips[c], sources:n, ...sources[c], partPips, partSources,
              verdict:verdictMana(partPips, partSources)};
    });

  return {pips, totalPips, generique:pips.generique, x:pips.x,
          sources, totalSources, terrains, accelerateurs, lignes};
}

/* Ce qu'on peut dire de l'écart entre la part demandée et la part servie, sans
   en dire plus qu'on ne sait : c'est un rapport de parts, non une promesse de
   main de départ. Les trois teintes sont celles des jauges de rôle. */
function verdictMana(partPips, partSources) {
  if (!partPips) return {col:'var(--dim2)', mot:'aucune exigence', rapport:null};
  const r = partSources / partPips;
  if (r >= 0.9) return {col:'var(--ok)', mot:'bien servie', rapport:r};
  if (r >= 0.75) return {col:'var(--warn)', mot:'un peu juste', rapport:r};
  return {col:'var(--bad)', mot:'à la peine', rapport:r};
}

/* ---------------------------------------------------------------------
   Le bloc de la section Deck.
   --------------------------------------------------------------------- */

function pourcentMana(x) {
  return Math.round(x * 100) + ' %';
}

/* Un nombre de symboles peut tomber sur un demi — un hybride — : une décimale
   suffit, et l'entier reste écrit sans virgule. */
function nombreMana(x) {
  return Number.isInteger(x) ? String(x) : (Math.round(x * 10) / 10).toString().replace('.', ',');
}

function ligneMana(l) {
  const detail = `${l.terrains} terrain(s)${l.accelerateurs ? ` + ${l.accelerateurs} accélérateur(s)` : ''}`;
  return `<div class="mana-ligne" style="border-left-color:${l.verdict.col}">
    <span class="mana-sym">${symIcon(l.couleur, 'sm')}</span>
    <div class="mana-pistes">
      <div class="track" title="Part des symboles de couleur du deck"><div class="fill" style="width:${Math.round(l.partPips * 100)}%;background:var(--${l.couleur})"></div></div>
      <div class="track" title="Part des sources de couleur du deck"><div class="fill" style="width:${Math.round(l.partSources * 100)}%;background:var(--${l.couleur});opacity:.55"></div></div>
    </div>
    <div class="mana-chiffres">
      <div><b>${nombreMana(l.pips)}</b> symbole(s) <span class="muted">(${pourcentMana(l.partPips)})</span></div>
      <div title="${esc(detail)}"><b>${l.sources}</b> source(s) <span class="muted">(${pourcentMana(l.partSources)})</span></div>
    </div>
    <span class="mana-verdict" style="color:${l.verdict.col}" title="Part des sources rapportée à la part des symboles${
      l.verdict.rapport === null ? '' : ` : ${Math.round(l.verdict.rapport * 100)} %`}">${l.verdict.mot}</span>
  </div>`;
}

function blocMana() {
  const b = bilanMana();
  if (!b.lignes.length) {
    return `<div class="small muted">Aucun symbole de couleur et aucune source dans ce deck : il n'y a rien à équilibrer pour l'instant.</div>`;
  }
  return `<div class="mana-lignes">${b.lignes.map(ligneMana).join('')}</div>
    <div class="small muted" style="margin-top:6px">
      ${nombreMana(b.totalPips)} symbole(s) de couleur${b.generique ? `, ${nombreMana(b.generique)} générique(s)` : ''}${b.x ? `, ${nombreMana(b.x)} {X}` : ''} ·
      ${b.terrains} terrain(s) et ${b.accelerateurs} accélérateur(s) produisent du mana.
      Un hybride compte pour une fraction de symbole, partagée entre ses façons d'être payé.
      Contrairement à la courbe ci-dessus, ce bloc porte sur le <b>deck entier</b> : les filtres de l'en-tête
      ne le réduisent pas, sans quoi masquer les terrains rendrait le verdict absurde.
    </div>`;
}
