/* =====================================================================
   js/vivier.js — Le vivier des candidates, et son empreinte

   Bâtir le vivier — toutes les cartes qu'on pourrait proposer — puis le noter :
   les séparer permet de noter par tranches, ce dont la barre de progression
   d'« Appliquer » a besoin.

   Noter coûte des secondes sur un catalogue complet. La sélection est donc
   gardée dans `SUG_MEMO` et resservie tant que l'empreinte de l'état ne bouge
   pas. Le doute profite au recalcul — mieux vaut une empreinte trop large
   qu'une suggestion périmée —, aussi y entre-t-elle jusqu'aux données EDHREC
   et aux cartes que Scryfall vient de compléter.
   ===================================================================== */

/* La sélection se fait en deux temps : bâtir le vivier — toutes les cartes
   qu'on pourrait proposer — puis le noter. Les séparer permet de noter par
   tranches, ce dont la barre de progression d'« Appliquer » a besoin. */
function vivierSuggestions() {
  const X = contexteEvaluation();
  const f = X.f;
  const pool = [];
  /* Le vivier atteint des dizaines de milliers de cartes : l'appartenance se
     teste sur un ensemble de noms, jamais en balayant le vivier lui-même. */
  const dansPool = new Set();
  const ajoutePool = e => { pool.push(e); dansPool.add(e.card.name); };

  filtered().forEach(e => {
    if (e.card.isToken) return;
    if (availableFor(e.card) > 0 && (S.deck.get(e.card.name) || 0) < f.maxCopies)
      ajoutePool({card:e.card, source:'collection'});
  });

  const budgetLeft = S.budget.total - spent();
  const noeuds = noeudsActifs();
  if (S.budget.total > 0 && S.budget.perCard > 0 && budgetLeft > 0) {
    (CAT.etat === 'ok' ? candidatsCatalogue() : []).forEach(c => {
      if (c.isToken || (S.deck.get(c.name) || 0) >= f.maxCopies) return;
      const o = bestOffer(c);
      if (o && o.price > 0 && o.price <= budgetLeft && !dansPool.has(c.name))
        ajoutePool({card:c, source:'achat', offer:o});
    });

    DB.forEach(c => {
      if (c.isToken) return;
      if (S.collection.has(c.name) && (S.collection.get(c.name) || 0) > 0) return;
      if (!colorOK(c)) return;
      if (noeuds.length && !carteTouche(c, noeuds)) return;
      if ((S.deck.get(c.name) || 0) >= f.maxCopies) return;
      const o = bestOffer(c);
      if (o && o.price > 0 && o.price <= budgetLeft && !dansPool.has(c.name))
        ajoutePool({card:c, source:'achat', offer:o});
    });
  }

  const addRecToPool = (rec) => {
    const c = find(rec.name);
    if (!c || c.isToken || !colorOK(c)) return;
    if ((S.deck.get(c.name) || 0) >= f.maxCopies) return;
    if (dansPool.has(c.name)) return;
    const inColl = (S.collection.get(c.name) || 0) > 0 && availableFor(c) > 0;
    if (inColl) {
      ajoutePool({card: c, source: 'collection'});
    } else if (S.budget.total > 0 && S.budget.perCard > 0 && budgetLeft > 0) {
      const o = bestOffer(c);
      if (o && o.price > 0 && o.price <= budgetLeft) {
        ajoutePool({card: c, source: 'achat', offer: o});
      }
    }
  };

  if (S.edhrec && S.edhrec.data && S.edhrec.data.map) {
    S.edhrec.data.map.forEach(addRecToPool);
  }
  if (S.edhrec && S.edhrec.secondaires && S.edhrec.secondaires.length) {
    S.edhrec.secondaires.forEach(sec => {
      if (sec && sec.map) sec.map.forEach(addRecToPool);
    });
  }

  return {pool, X};
}

/* Notation d'une tranche du vivier, de `debut` inclus à `fin` exclu. */
function noterVivier(pool, X, res, debut, fin) {
  for (let i = debut; i < fin; i++) {
    const n = noteCarte(pool[i], X);
    if (n) res.push(n);
  }
}

/* Les filtres de l'en-tête valent aussi pour ce qu'on propose d'ajouter. */
function ordonneSuggestions(res) {
  return res.filter(r => r.score > 0 && carteRetenue(r.card)).sort((a, b) => b.score - a.score);
}

/* ---------------------------------------------------------------------
   La sélection notée, et son empreinte.

   Noter le vivier coûte des secondes sur un catalogue complet. La sélection
   ne servait qu'une fois, par prudence : tout rendu ultérieur recalculait,
   « faute de quoi un changement d'état passerait inaperçu ». Mais la section
   se repeint pour bien autre chose qu'un changement d'état — un panneau
   EDHREC qui passe à « chargement… », un visuel qui arrive —,
   et chacun de ces repeints repayait la notation entière.

   L'empreinte règle la question : elle réunit tout ce dont la notation
   dépend, et la sélection resservie tant qu'elle ne bouge pas. Le doute
   profite au recalcul — mieux vaut une empreinte trop large qu'une
   suggestion périmée —, aussi y entre-t-elle jusqu'aux données EDHREC et
   aux cartes complétées par Scryfall.
   --------------------------------------------------------------------- */

/* Une empreinte bon marché de la collection : nombre d'entrées, exemplaires,
   et un condensé des noms. */
function empreinteCollection() {
  let n = 0, q = 0, h = 0;
  S.collection.forEach((qte, nom) => { n++; q += qte; h = (h * 31 + nom.length * 7 + qte) | 0; });
  return n + ':' + q + ':' + h;
}

function tailleDe(x) {
  if (!x) return 0;
  return typeof x.size === 'number' ? x.size : (x.length || 0);
}

function signatureSuggestions() {
  const e = S.edhrec || {};
  return [
    /* Ce qui décide du vivier : format, couleurs, filtres, prix maximum,
       archive, plafond des candidates, légalité, effets isolés. */
    signatureCandidats(),
    deckSignature(),                 // le deck et son commandant
    empreinteCollection(),
    JSON.stringify(S.budget),        // l'estimation des offres en dépend en entier
    JSON.stringify(S.custom),
    S.showImplicit ? 1 : 0,
    DB.length,                       // une carte créée à l'import entre au vivier
    S.prixMaj || 0,
    MAJ_CARTES,                      // cartes complétées par Scryfall depuis
    /* Les données, non l'état du chargement : « chargement… » puis « erreur »
       ne changent que le panneau, et renoter le vivier pour cela était
       précisément le second recalcul que l'on voyait passer. */
    /* `map` est une `Map` : c'est sa taille qui la mesure, non sa longueur. */
    e.data ? `${e.data.commandant || ''}#${tailleDe(e.data.map)}` : '',
    (e.secondaires || []).map(x => `${x.commandant || ''}#${tailleDe(x.map)}`).join(','),
    (typeof ARCH_BASE !== 'undefined' && ARCH_BASE.index) ? ARCH_BASE.index.size : 0,
    (typeof SETS_BASE !== 'undefined' && SETS_BASE.index) ? SETS_BASE.index.size : 0
  ].join('|');
}

let SUG_MEMO = {sig:null, liste:null};

/* La sélection est-elle encore bonne ? C'est ce que regardent le rendu de la
   section et la boîte de recalcul, pour ne pas annoncer un travail qui n'a
   pas lieu d'être. */
function suggestionsAJour() {
  return !!SUG_MEMO.liste && SUG_MEMO.sig === signatureSuggestions();
}

function currentSuggestions() {
  if (suggestionsAJour()) return SUG_MEMO.liste;
  const {pool, X} = vivierSuggestions();
  const res = [];
  noterVivier(pool, X, res, 0, pool.length);
  /* L'empreinte est relevée après coup, jamais avant : bâtir le vivier
     enrôle des cartes du catalogue dans la base, et une empreinte prise
     avant naîtrait donc périmée — chaque rendu renoterait tout. */
  SUG_MEMO = {sig:signatureSuggestions(), liste:ordonneSuggestions(res)};
  return SUG_MEMO.liste;
}

/* La même notation, par tranches, en rendant la main entre chacune : c'est
   elle que la barre de progression accompagne. Le résultat garnit la même
   mémo, si bien que le rendu qui suit n'a plus rien à calculer. */
async function prepareSuggestions(onProgress) {
  if (suggestionsAJour()) {
    if (onProgress) onProgress(SUG_MEMO.liste.length, SUG_MEMO.liste.length);
    return SUG_MEMO.liste.length;
  }
  const {pool, X} = vivierSuggestions();
  const res = [];
  const LOT = 800;
  if (!pool.length && onProgress) onProgress(0, 0);
  for (let i = 0; i < pool.length; i += LOT) {
    const fin = Math.min(pool.length, i + LOT);
    noterVivier(pool, X, res, i, fin);
    if (onProgress) onProgress(fin, pool.length);
    await new Promise(r => setTimeout(r, 0));
  }
  /* Ici encore, l'empreinte est relevée après coup — le calcul a rendu la
     main entre les tranches, et le vivier a pu enrôler des cartes. */
  SUG_MEMO = {sig:signatureSuggestions(), liste:ordonneSuggestions(res)};
  return SUG_MEMO.liste.length;
}
