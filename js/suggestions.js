/* =====================================================================
   js/suggestions.js — Moteur d'évaluation, scoring & suggestions d'ajout
   ===================================================================== */

function contexteEvaluation() {
  const deck = cartesDuDeck();
  const f = fmt(), cnt = deckCounts(), tgt = targets();
  const cmcCount = {};
  deck.forEach(c => { if (!c.isLand) cmcCount[Math.min(c.cmc, 7)] = (cmcCount[Math.min(c.cmc, 7)] || 0) + 1; });
  const ideal = {0:0.04, 1:0.16, 2:0.22, 3:0.20, 4:0.15, 5:0.11, 6:0.07, 7:0.05};
  const nonlandTotal = Math.max(1, deck.filter(c => !c.isLand).length);
  const cmdId = S.commander ? find(S.commander).identity : null;

  const IDX = {};
  NODES.forEach((n, i) => IDX[n[0]] = i);
  const NN = NODES.length, MAXI = 2;
  const realAdj = Array.from({length:NN}, () => []), impAdj = Array.from({length:NN}, () => []);
  const seenE = new Set();

  deck.forEach(d => d.an.edges.forEach(e => {
    if (e.to === 'ENGAGEMENT') return;
    const k = e.from + '>' + e.to;
    if (!seenE.has(k)) { seenE.add(k); realAdj[IDX[e.from]].push(IDX[e.to]); }
  }));
  if (S.showImplicit) IMPLICIT.forEach(([a, b]) => impAdj[IDX[a]].push(IDX[b]));

  const reach = Array.from({length:NN}, () => new Uint8Array(NN));
  for (let st = 0; st < NN; st++) {
    const vis = new Set([st + ':0:0']);
    const q = [[st, 0, 0]];
    while (q.length) {
      const [nd, imp, real] = q.shift();
      if (real) reach[st][nd] = 1;
      realAdj[nd].forEach(nx => {
        const k = nx + ':' + imp + ':1';
        if (!vis.has(k)) { vis.add(k); q.push([nx, imp, 1]); }
      });
      if (imp < MAXI) impAdj[nd].forEach(nx => {
        const k = nx + ':' + (imp + 1) + ':' + real;
        if (!vis.has(k)) { vis.add(k); q.push([nx, imp + 1, real]); }
      });
    }
  }

  const deckProd = new Map(), deckTrig = new Map();
  const push = (m, k, v) => { if (!m.has(k)) m.set(k, []); m.get(k).push(v); };
  deck.forEach(d => {
    d.an.produces.forEach(pp => {
      if (pp.scope !== 'self') return;
      feedsDe(pp).forEach(k => push(deckProd, k, {nom:d.name, p:pp}));
    });
    d.an.triggers.forEach(tt => {
      if (tt.scope !== 'self' && tt.q.portee !== 'adversaire') return;
      push(deckTrig, tt.c, {nom:d.name, t:tt});
    });
  });

  return {deck, f, cnt, tgt, cmcCount, ideal, nonlandTotal, cmdId, IDX, reach, deckProd, deckTrig};
}

function noteCarte(p, X) {
  const c = p.card;
  if (X.cmdId && p.source !== 'deck' && c.identity.some(x => !X.cmdId.includes(x))) return null;
  let score = 0;
  const reasons = [];

  const linkMap = new Map();
  const addLink = (nm, concept, dir, k, detail) => {
    if (nm === c.name || k <= 0) return;
    if (!linkMap.has(nm)) linkMap.set(nm, new Map());
    const cle = concept + '|' + dir, ancien = linkMap.get(nm).get(cle);
    if (!ancien || ancien.k < k) linkMap.get(nm).set(cle, {concept, dir, k, detail});
  };

  c.an.produces.forEach(pp => {
    if (pp.scope !== 'self') return;
    feedsDe(pp).forEach(k => (X.deckTrig.get(k) || []).forEach(x =>
      addLink(x.nom, k, 'ab', compat(pp, x.t), libelleQual(x.t.q))));
  });

  c.an.triggers.forEach(tt => {
    if (tt.scope !== 'self' && tt.q.portee !== 'adversaire') return;
    (X.deckProd.get(tt.c) || []).forEach(x =>
      addLink(x.nom, tt.c, 'ba', compat(x.p, tt), libelleQual(tt.q)));
  });

  /* Les partenaires sont d'abord bâtis, puis triés : un déclencheur qui prend le
     quart du deck ne s'intègre pas à chaque carte (js/liens.js), et ni le poids
     ni le décompte ne doivent le payer soixante fois. */
  const partners = [...linkMap.entries()].map(([nm, m]) => ({name:nm, links:[...m.values()]}));
  const tri = classeLiens(partners, X.deck.length);

  /* Une carte du deck ne pèse qu'une fois, quel que soit le nombre d'effets qui
     la relient : son meilleur lien fait le poids, les suivants ne font que le
     nuancer, sans jamais dépasser une fois et demie ce meilleur lien. La somme
     de tous les arcs, elle, faisait qu'une carte branchée à deux cartes du deck
     par quatre effets chacune valait une carte qui s'intègre à huit — l'inverse
     de ce que l'on cherche à mettre en avant. */
  const poidsLien = l => ((l.concept === 'ETB' || l.concept === 'LANCEMENT') ? 0.8 : (l.dir === 'ab' ? 3.2 : 2.6)) * (l.k || 1);
  tri.parts.forEach(x => {
    const forces = x.precis.map(poidsLien).sort((a, b) => b - a);
    const meilleur = forces[0] || 0;
    x.p.precis = x.precis;
    x.p.large = !x.precis.length;
    x.p.w = Math.min(meilleur * 1.5, meilleur + 0.2 * forces.slice(1).reduce((a, f) => a + f, 0));
  });

  /* Le plafond reste 26, mais on l'approche sans jamais l'atteindre : la
     coupure nette mettait à égalité une carte branchée à huit cartes du deck et
     une branchée à vingt-cinq, alors que c'est précisément l'étendue que l'on
     veut voir remonter. */
  let weight = tri.precis.reduce((a, x) => a + x.p.w, 0);
  /* Les vraies interactions en tête : le détail des trois premières doit nommer
     des cartes qui apprennent quelque chose, non le premier sort venu. */
  partners.sort((a, b) => a.large === b.large ? b.w - a.w : (a.large ? 1 : -1));
  score += 26 * (1 - Math.exp(-weight / 14));
  score += primeLiensLarges(tri.familles);

  const nbPrecis = tri.precis.length, nbLarges = tri.larges.length;
  if (nbPrecis) {
    const detail = tri.precis.slice(0, 3).map(x => {
      const cs = [...new Set(x.precis.map(l => NODE[l.concept].label.toLowerCase()))].slice(0, 2).join(', ');
      return `${x.p.name} (${cs})`;
    }).join(', ');
    const liens = tri.precis.reduce((a, x) => a + x.precis.length, 0);
    reasons.push(`se branche à ${nbPrecis} carte(s) du deck (${liens} lien(s)) : ${detail}`);
  }
  if (tri.familles.length) {
    reasons.push(`déclencheur large : ${libelleFamillesLarges(tri.familles)} — ${tri.familles[0].n} carte(s) du deck l'alimentent, ce qui vaut une prime, non autant d'interactions`);
  }

  const graph = [];
  let loopEdge = null;
  c.an.edges.forEach(e => { if (!loopEdge && X.reach[X.IDX[e.to]][X.IDX[e.from]]) loopEdge = e; });
  if (loopEdge) {
    graph.push('boucle');
    score += 12;
    reasons.unshift(`ferme une boucle avec le deck : ${NODE[loopEdge.from].label} → ${NODE[loopEdge.to].label} → … → ${NODE[loopEdge.from].label}`);
  }

  /* Un pont fait de deux liens de lancement n'en est pas un : seuls les liens
     précis disent qu'elle reçoit d'une carte et fournit à une autre. */
  const hasAb = tri.precis.some(x => x.precis.some(l => l.dir === 'ab'));
  const hasBa = tri.precis.some(x => x.precis.some(l => l.dir === 'ba'));
  if (hasAb && hasBa) {
    graph.push('pont');
    score += 5;
    reasons.unshift('relie deux effets déjà présents : elle reçoit un déclencheur du deck et en fournit un autre');
  }

  const erAll = edhrecAllFor(c);
  const er = edhrecFor(c);
  erAll.sort((a, b) => {
    const aSel = a.isSelected || a.role === 'principal' || (S.commander && norm(a.commandant) === norm(S.commander)) ? 1 : 0;
    const bSel = b.isSelected || b.role === 'principal' || (S.commander && norm(b.commandant) === norm(S.commander)) ? 1 : 0;
    if (aSel !== bSel) return bSel - aSel;
    return (b.synergy * 10 + b.inclusion * 8) - (a.synergy * 10 + a.inclusion * 8);
  });
  if (erAll.length) {
    erAll.forEach(erItem => {
      const isPrim = erItem.isSelected || erItem.role === 'principal' || (S.commander && norm(erItem.commandant) === norm(S.commander));
      const wInclusion = isPrim ? 8 : 5.5;
      const wSynergy = isPrim ? 10 : 7;
      const baseBonus = isPrim ? 3 : 1.8;
      score += baseBonus + erItem.inclusion * wInclusion + Math.max(0, erItem.synergy) * wSynergy;
      const cmdTag = isPrim ? `EDHREC (★ ${S.commander || erItem.commandant})` : `EDHREC (${erItem.commandant})`;
      const synSign = erItem.synergy >= 0 ? '+' : '−';
      const synVal = Math.abs(Math.round(erItem.synergy * 100));
      reasons.push(`${cmdTag} : ${Math.round(erItem.inclusion*100)} % apparition / ${synSign}${synVal} % synergie`);
    });
  }

  const actifs = noeudsActifs();
  if (actifs.length && carteTouche(c, actifs)) {
    graph.push('noeud');
    score += 4 * actifs.length;
    reasons.unshift(`touche ${actifs.length>1?'tous les nœuds sélectionnés':'le nœud sélectionné'} : ${actifs.map(n=>NODE[n].label).join(', ')}`);
  }

  let needBonus = 0;
  c.cats.forEach(cat => {
    if (cat in X.tgt) {
      const miss = X.tgt[cat] - (X.cnt[cat] || 0);
      if (miss > 0) {
        needBonus += Math.min(6, miss * 1.1);
        reasons.push(`comble un manque : ${CATLABEL[cat]} (${X.cnt[cat]||0}/${X.tgt[cat]})`);
      }
    }
  });
  score += Math.min(9, needBonus);

  if (!c.isLand) {
    const k = Math.min(c.cmc, 7);
    const have = (X.cmcCount[k] || 0) / X.nonlandTotal, want = X.ideal[k];
    const gap = want - have;
    score += gap * 14;
    if (gap > 0.05) reasons.push(`renforce la courbe à ${c.cmc} mana`);
    if (gap < -0.06) reasons.push(`attention : la courbe est déjà chargée à ${c.cmc}`);
  }

  score += Math.min(3, c.an.edges.length * 0.35);
  if (p.source === 'achat') {
    score -= 2.5;
    reasons.push(`hors collection — ${eur(p.offer.price)} (${p.offer.condition || p.offer.quality || ''}, ${p.offer.lang || ''}, ${p.offer.seller || ''})`);
  }
  if (deckSize() === 0) score += (c.cats.has('ramp') || c.cats.has('pioche')) ? 4 : 0;
  return {card:c, score, reasons, partners, nbPrecis, nbLarges, larges:tri.familles,
          source:p.source, offer:p.offer, graph, edhrec:er};
}

/* Le nombre d'interactions d'une note est un nombre de cartes du deck, jamais
   un nombre d'arcs : une carte reliée par quatre effets reste une carte. La
   notation le tient déjà (`nbPrecis`) ; le dédoublonnage par nom normalisé ne
   sert que de repli, pour une note d'avant ce décompte. */
function nbInteractions(note) {
  if (!note) return 0;
  if (typeof note.nbPrecis === 'number') return note.nbPrecis;
  return new Set((note.partners || []).map(p => norm(p.name))).size;
}

/* Les cartes que seul un déclencheur large atteint : elles se disent à part,
   entre parenthèses, pour ne pas gonfler le décompte des interactions. */
function nbCartesLarges(note) {
  return (note && note.nbLarges) || 0;
}

/* Le nombre d'arcs, lui, ne sert qu'à l'infobulle : il dit par combien d'effets
   passent les interactions précises. */
function nbLiens(note) {
  if (!note || !note.partners) return 0;
  return note.partners.reduce((a, p) => a + (p.precis || p.links || []).length, 0);
}

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

function ligneCatalogue() {
  if (CAT.etat === 'chargement')
    return `<div class="small muted" style="margin-top:4px">Catalogue complet en cours de chargement (${esc(CAT.source||'')})… le classement fonctionne déjà avec vos cartes.</div>`;
  if (CAT.etat === 'ok') {
    const st = statsCandidats() || {};
    const maj = CAT.maj ? new Date(CAT.maj).toLocaleDateString('fr-FR') : '';
    const noeuds = noeudsActifs();
    const n = x => (x || 0).toLocaleString('fr-FR');

    /* Chaque cause d'écart est nommée avec son nombre : c'est la seule façon
       de comprendre pourquoi le catalogue se réduit à ce qu'on propose. */
    const causes = [];
    if (st.legalite) causes.push(`${n(st.legalite)} hors ${esc(fmt().label)}`);
    if (st.identite) causes.push(`${n(st.identite)} hors identité du commandant`);
    if (st.couleurs) causes.push(`${n(st.couleurs)} par vos couleurs`);
    if (st.possedees) causes.push(`${n(st.possedees)} déjà dans votre collection`);
    if (st.prix) causes.push(`${n(st.prix)} au-dessus de ${eur(S.budget.perCard)}`);
    if (st.numeriques) causes.push(`${n(st.numeriques)} numériques`);
    if (st.filtres) causes.push(`${n(st.filtres)} par vos filtres`);
    if (st.noeuds) causes.push(`${n(st.noeuds)} par les effets sélectionnés (${noeuds.map(x =>
      (typeof NODE !== 'undefined' && NODE[x] && NODE[x].label) || x).join(' + ')})`);

    return `<div class="small muted" style="margin-top:4px">
      Catalogue complet : ${n(CAT.cartes.length)} cartes en cache${maj ? ` (Scryfall, ${maj})` : ''}.
      <b>${n(st.retenus)}</b> candidate(s)${causes.length ? ` — écartées : ${causes.join(', ')}` : ' : rien n\'est écarté'}.
      ${st.coupes ? `Les ${n(st.coupes)} moins bien classées par EDHREC ne sont pas examinées,
        le maximum étant fixé à ${n(S.candidatsMax)} (réglable dans les paramètres,
        section « Catalogue des cartes » — l'engrenage de l'entête).` : ''}
      ${st.sansPrix ? `${n(st.sansPrix)} candidate(s) restent sans prix connu : elles comptent ici,
        mais ne peuvent pas être proposées à l'achat.` : ''}
      Les visuels se chargent ensuite, par score décroissant.
      ${catalogueObsolete() ? `<br><b>Une version plus récente du ${esc(new Date(CAT.majDispo).toLocaleDateString('fr-FR'))} est disponible.</b>
        ${CAT.uri ? `<a class="btn sm" href="${esc(CAT.uri)}" download target="_blank" rel="noopener">La télécharger</a>` : ''}
        <button class="btn sm" data-act="saveDialog">La charger</button>` : ''}
    </div>`;
  }
  if (!CAT.etat && typeof indexedDB !== 'undefined' && typeof fetch === 'function')
    return `<div class="small muted" style="margin-top:4px">
      Les suggestions se limitent à votre collection et aux cartes déjà connues.
      ${CAT.uri ? `<a class="btn sm" href="${esc(CAT.uri)}" download target="_blank" rel="noopener">Télécharger le fichier des cartes${CAT.taille?` — ${(CAT.taille/1048576).toFixed(0)} Mo`:''}</a>` : ''}
      <button class="btn sm" data-act="saveDialog" style="margin-left:6px">Le charger dans l'atelier</button>
    </div>`;

  const dispo = S.exploreTotal ? ` sur ${S.exploreTotal.toLocaleString('fr-FR')} légales dans vos couleurs` : '';
  if (S.exploreEtat === 'chargement')
    return `<div class="small muted" style="margin-top:4px">Chargement du catalogue Scryfall : ${S.exploreCharge.toLocaleString('fr-FR')} carte(s)${dispo}…</div>`;

  const msg = {
    'hors-ligne': 'Scryfall injoignable : seules vos cartes sont proposées.',
    erreur: 'Scryfall a répondu par une erreur ; seules vos cartes sont proposées.',
    aucune: 'Aucune carte ne correspond à ce format et à cette identité couleur.'
  }[S.exploreEtat];
  if (msg) return `<div class="small muted" style="margin-top:4px">${esc(msg)}</div>`;

  const hors = DB.filter(c => c.externe && !(S.collection.get(c.name) > 0)).length;
  if (!hors) return '';

  const reste = S.budget.total - spent();
  let ecartees = 0;
  DB.forEach(c => {
    if (!c.externe || (S.collection.get(c.name) || 0) > 0 || c.isToken || !colorOK(c)) return;
    const o = bestOffer(c);
    if (!o || o.price > reste) ecartees++;
  });

  return `<div class="small muted" style="margin-top:4px">
    Catalogue : ${S.exploreCharge.toLocaleString('fr-FR')} carte(s) chargées${dispo}.
    ${ecartees ? `${ecartees.toLocaleString('fr-FR')} écartée(s) par le prix maximum (${eur(S.budget.perCard)}) ou le budget restant (${eur(Math.max(0,reste))}).` : ''}
    Les visuels se chargent ensuite, par score décroissant.
    ${S.exploreReste ? `<button class="btn sm" data-act="catalogueSuite" style="margin-left:6px">Charger la suite</button>` : ''}
  </div>`;
}

/* ---------------------------------------------------------------------
   Les commandants du deck, en tête de l'onglet EDHREC.

   Le deck peut porter plusieurs créatures légendaires : l'une commande, les
   autres pourraient. EDHREC publie une page par commandant, et l'atelier les
   croise toutes — mais toutes ne méritent pas de peser sur le classement. La
   liste les montre donc une par ligne, chacune cochée ou non : décocher retire
   ses statistiques du croisement, cocher les redemande.

   Le commandant principal n'est pas de cette liste : il se désigne dans
   l'onglet Deck, et sa ligne le dit — elle ouvre sa fiche et sa page EDHREC,
   rien de plus.
   --------------------------------------------------------------------- */

/* Le nombre de decks recensés par EDHREC pour un commandant, et le lien vers
   sa page — le décompte est le lien : c'est là qu'on veut aller quand on le
   lit. Sans statistiques, il n'y a rien à compter mais la page existe tout de
   même, et le lien y mène. */
function lienDecksEdhrec(nom, actif) {
  const e = S.edhrec || {};
  const d = (e.data && e.data.commandant === nom) ? e.data
    : (e.secondaires || []).find(x => x.commandant === nom);
  const url = (d && d.url) || ('https://edhrec.com/commanders/' + edhrecSlug(nom));
  const page = `ouvrir la page EDHREC de ${nom}`;
  let txt, aide;
  if (!actif)                                  { txt = 'écarté';      aide = `Ce commandant est écarté du croisement — ${page}`; }
  else if (d && d.status !== 'error' && d.total) { txt = `${d.total.toLocaleString('fr-FR')} decks`; aide = `${d.total.toLocaleString('fr-FR')} decks recensés — ${page}`; }
  else if (d && d.status === 'error')          { txt = 'absent';      aide = `${d.error || "absent d'EDHREC"} — ${page}`; }
  else if (e.status === 'loading')             { txt = 'chargement…'; aide = `Statistiques en cours de chargement — ${page}`; }
  else                                         { txt = '—';           aide = `Statistiques non chargées — ${page}`; }
  return `<a class="cmd-d" href="${esc(url)}" target="_blank" rel="noopener" title="${esc(aide)}">${esc(txt)} ↗</a>`;
}

/* Une ligne : la marque à gauche — l'étoile d'un principal, la case d'un
   secondaire —, le nom au milieu, le décompte à droite. Le nom ouvre la fiche
   au clic et montre le visuel au survol (`montrerApercu`, js/app.js, qui suit
   les éléments portant `data-act="fiche"`). */
function ligneCommandant(carte, principal) {
  const nom = carte.name;
  const actif = principal || !S.secondairesOff.has(nom);
  const marque = principal
    ? `<span class="cmd-b etoile" title="Commandant principal, désigné dans l'onglet Deck">★</span>`
    : `<input type="checkbox" class="coche" data-act="cmdSecondaire" data-name="${esc(nom)}" ${actif ? 'checked' : ''}
        aria-label="Traiter ${esc(nom)} comme commandant secondaire"
        title="${actif ? "Décocher : les statistiques EDHREC de cette carte quittent le croisement"
                       : "Cocher : les statistiques EDHREC de cette carte entrent dans le croisement"}">`;
  return `<li class="cmd-l ${actif ? 'on' : 'off'}">
    ${marque}
    <button type="button" class="cmd-n" data-act="fiche" data-name="${esc(nom)}"
      title="Ouvrir la fiche de ${esc(nom)} — le visuel paraît au survol">${esc(nom)}</button>
    ${lienDecksEdhrec(nom, actif)}
  </li>`;
}

function blocCommandants(principaux, secPossibles) {
  const retenus = secPossibles.filter(c => !S.secondairesOff.has(c.name)).length;
  return `<div class="cmd-bloc">
    <div class="cmd-titre small"><b>Commandant principal</b></div>
    <ul class="cmd-rows">
      ${principaux.length
        ? principaux.map(c => ligneCommandant(c, true)).join('')
        : `<li class="cmd-l off">
            <span class="cmd-b etoile">★</span>
            <span class="cmd-n muted">Aucun commandant désigné</span>
            <button type="button" class="btn sm" data-onglet="deck">Le désigner dans l'onglet Deck</button>
          </li>`}
    </ul>
    <div class="cmd-titre small" style="margin-top:8px"><b>Commandants secondaires</b>
      <span class="muted">${secPossibles.length
        ? `· ${retenus} retenu(s) sur ${secPossibles.length}`
        : '· aucune autre carte du deck ne peut commander'}</span></div>
    ${secPossibles.length ? `<ul class="cmd-rows">
      ${secPossibles.map(c => ligneCommandant(c, false)).join('')}
    </ul>
    <div class="small muted" style="margin-top:4px">Décocher une carte retire ses statistiques du croisement — ses recommandations et ses étiquettes disparaissent, et les scores sont repris. Elle reste dans le deck.</div>` : ''}
  </div>`;
}

function panneauEdhrec() {
  const f = fmt();
  if (!f.commander) return '';
  const e = S.edhrec, cmd = S.commander ? find(S.commander) : null;
  const principaux = commandantsPrincipaux();
  const secPossibles = commandantsSecondairesPossibles();
  const secCmds = commandantsSecondaires();
  const sansDonnees = !e.data && (!e.secondaires || !e.secondaires.length);

  /* Ce qu'EDHREC répond, selon l'état. La liste des commandants, elle, paraît
     dans tous les cas : c'est par elle qu'on choisit ce qui sera demandé, et
     la faire disparaître au premier échec interdirait de rien y changer. */
  const corps = (() => {
    if (!cmd && !secPossibles.length)
      return `<div class="small muted">Désignez un commandant depuis <button type="button" class="btn sm" data-onglet="deck">l'onglet Deck</button> ou ajoutez des créatures légendaires au deck pour croiser les suggestions avec les statistiques d'EDHREC.</div>`;

    if (e.status === 'loading')
      return `<div class="small muted">Chargement des statistiques EDHREC${cmd ? ` pour ${esc(cmd.name)}` : ''}${secCmds.length ? ` et ${secCmds.length} commandant(s) secondaire(s)` : ''}…</div>`;

    if (e.status === 'error' && sansDonnees)
      return `<div class="small">Statistiques indisponibles (${esc(e.error||'')}). Le site n'autorise pas forcément la requête depuis un navigateur tiers, ou la page peut ne pas exister pour ce commandant.</div>
        <div class="row" style="gap:6px;margin-top:6px">
          <button class="btn sm" data-act="edhrec" data-force="1">Réessayer</button>
          ${cmd ? `<a class="btn sm" href="https://edhrec.com/commanders/${esc(e.slug||edhrecSlug(cmd.name))}" target="_blank" rel="noopener">Ouvrir la page EDHREC ↗</a>` : ''}
        </div>`;

    if (e.status !== 'ok' && sansDonnees)
      return `<div class="small muted">Croiser les suggestions avec les decks recensés pour ${cmd ? esc(cmd.name) : 'vos commandants'}${secCmds.length ? ` et ${secCmds.length} commandant(s) secondaire(s)` : ''}.</div>
        <div class="row" style="margin-top:6px"><button class="btn sm" data-act="edhrec">Charger les statistiques</button></div>`;

    const d = e.data;
    let absentes = [];
    if (d && d.map) {
      const connues = [...new Set([...d.map.values()])];
      absentes = connues
        .filter(r => { const c = find(r.name); return !c || ((S.collection.get(c.name) || 0) === 0 && !S.deck.has(c.name)); })
        .sort((a, b) => b.inclusion - a.inclusion).slice(0, 6);
    }

    return `<div class="small muted">Les cartes recommandées par EDHREC (pour votre commandant principal ou vos commandants secondaires) sont réunies ci-dessous ; elles portent partout ailleurs l'étiquette <b>edhrec</b>, avec leur taux d'inclusion et leur synergie.</div>
      ${absentes.length ? `<div class="small" style="margin-top:8px">Fréquentes chez ${esc(d.commandant)} mais absentes de votre collection :
        ${absentes.map(r => `<span class="chip" title="synergie ${r.synergy>=0?'+':'−'}${Math.abs(Math.round(r.synergy*100))} %">${esc(r.name)} — ${Math.round(r.inclusion*100)} %</span>`).join(' ')}</div>` : ''}
      <div class="row" style="gap:6px;margin-top:8px">
        <button class="btn sm" data-act="edhrec" data-force="1">Rafraîchir</button>
        ${d ? `<a class="btn sm" href="${esc(d.url)}" target="_blank" rel="noopener">Page EDHREC (${esc(d.commandant)}) ↗</a>` : ''}
      </div>`;
  })();

  /* Le titre ne nomme plus le commandant : la liste, juste dessous, les nomme
     tous et dit ce que chacun pèse. */
  return `<div class="group" style="border-color:#2f6b68">
    <h4>Commandants EDHREC</h4>
    ${blocCommandants(principaux, secPossibles)}
    ${corps}
  </div>`;
}

function sugRow(s) {
  const c = s.card, n = nbInteractions(s), larges = nbCartesLarges(s), liens = nbLiens(s);
  const inDeck = S.deck.get(c.name) || 0;
  const img = c.imgN || c.img;
  const prix = (s.source === 'achat' && s.offer && s.offer.price) ? s.offer.price : c.price;

  const edhrecTag = (() => {
    if (!s.edhrec) return '';
    const isPrim = s.edhrec.role === 'principal';
    const pct = Math.round(s.edhrec.inclusion * 100);
    const syn = (s.edhrec.synergy >= 0 ? '+' : '−') + Math.abs(Math.round(s.edhrec.synergy * 100)) + ' %';
    const secCount = (s.edhrec.secondaires || []).length;
    if (isPrim) {
      const secTxt = secCount > 0 ? ` (+${secCount} 2nd)` : '';
      const secTitle = secCount > 0 ? ` · Également recommandé par : ${s.edhrec.secondaires.map(x=>x.commandant).join(', ')}` : '';
      return `<span class="tag" style="border-color:#57c9c4;color:#57c9c4" title="EDHREC (${esc(s.edhrec.commandant)}) : inclusion ${pct} %, synergie ${syn}${secTitle}">edhrec ${pct} % / ${syn}${secTxt}</span>`;
    } else {
      return `<span class="tag" style="border-color:#48a9a6;color:#85deda;background:rgba(87,201,196,.12)" title="EDHREC (Commandant secondaire ${esc(s.edhrec.commandant)}) : inclusion ${pct} %, synergie ${syn}">★ ${esc(s.edhrec.commandant)} ${pct} %</span>`;
    }
  })();

  const tags = [
    (n || larges) ? `<span class="tag" style="border-color:var(--brass);color:var(--brass)" title="${n} carte(s) du deck avec lesquelles elle interagit précisément (${liens} lien(s) d'effets)${larges ? ` — et ${larges} autre(s) que seul un déclencheur large relie : ${libelleFamillesLarges(s.larges)}, que tout le deck alimente` : ''}">${n}${larges ? ` (+${larges})` : ''} interaction${n + larges > 1 ? 's' : ''}</span>` : '',
    tagIllegal(s.card),
    tagGameChanger(s.card),
    s.source !== 'collection' ? `<span class="tag" style="border-color:var(--bad);color:#e39a90">hors collection</span>` : '',
    tagAnnexe(c),
    edhrecTag
  ].filter(Boolean).join('');

  return `<div class="sugT ${n?'lie':''} ${s.source!=='collection'?'hors':''}" data-card="${esc(c.name)}" data-ctx="suggestion"
      title="Cliquez pour la fiche complète">
    ${img ? (VISUELS_CHARGES.has(c.name)
      ? `<img class="cimg" src="${esc(c.imgN||c.img)}" alt="${esc(c.name)}" decoding="async" onerror="this.remove()">`
      : `<img class="cimg attente" data-src="${esc(c.imgN||c.img)}" data-nom="${esc(c.name)}" alt="${esc(c.name)}" decoding="async" onerror="this.remove()">`) : `<div class="titre">${esc(c.name)}</div>`}
    <div class="score-line mono small muted">score ${s.score.toFixed(1)}</div>
    ${tags ? `<div class="tags">${tags}</div>` : ''}
    <div class="foot bot">
      ${inDeck ? `<span title="${inDeck} exemplaire(s) dans le deck">×${inDeck}</span>` : ''}
      <span class="mono">${s.source==='achat'?'≈ ':''}${eur(prix)}</span>
      <button class="btn sm ${s.source==='achat'?'':'pri'}" style="margin-left:auto"
        data-act="${s.source==='achat'?'buy':'toDeck'}" data-name="${esc(c.name)}">
        ${s.source === 'achat' ? 'Acheter' : 'Ajouter'}</button>
    </div>
  </div>`;
}

/* Le budget et les préférences d'achat se règlent désormais dans la fenêtre
   « Achats sur Cardmarket », ouverte par la pastille « Budget » de l'en-tête
   (js/fenBudget.js). Ces deux lignes en peignent le résumé, et la fenêtre les lit
   sous son brouillon : elles annoncent donc ce que « Appliquer » donnerait. */
function ligneBudget() {
  const left = S.budget.total - spent();
  return S.budget.total > 0 && S.budget.perCard > 0
    ? `Dépensé ${eur(spent())} · reste ${eur(Math.max(0, left))}`
    : 'Budget à zéro : seules les cartes de votre collection sont proposées.';
}

function ligneAchats() {
  const buys = aAcheter();
  if (!buys.length) return '';
  return `<div class="small" style="margin-top:6px">À acheter : ${buys.map(l => `<a href="${esc(cmLink(l.card))}" target="_blank" rel="noopener" style="color:var(--brass)">${esc(l.card.name)}</a> ×${l.qty} (${eur(l.total)})`).join(' · ')}</div>
     <div class="row" style="margin-top:6px"><button class="btn" data-act="wants">Exporter la liste de wants Cardmarket</button></div>`;
}

/* ---------------------------------------------------------------------
   L'ordre gelé.

   Ajouter une carte depuis une vignette change le deck, donc les scores :
   la sélection est renotée, à raison. Mais le classement qui en sort n'est
   pas celui qu'on avait sous les yeux, et la section repeinte remettait le
   lecteur au début — perdant la place de celui qui parcourait le milieu
   d'une liste de trois cents cartes.

   Le geste gèle donc l'ordre affiché : les scores se recalculent et les
   vignettes se rafraîchissent, chacune restant à sa case. Les nouvelles
   venues se rangent à la suite. Quand le classement par score a changé, un
   bandeau propose de reclasser ; sinon, le premier rendu complet venu — un
   filtre, une couleur, un format — reprend l'ordre des scores.

   Il fallait autrefois un second drapeau pour demander un rafraîchissement
   « en place », la section entière étant réécrite d'un bloc. Les trois
   sections des propositions gardent désormais leur enveloppe et ne réécrivent
   que leurs listes (`poseCorps`) : le rafraîchissement est en place par
   construction, et le gel de l'ordre suffit.
   --------------------------------------------------------------------- */

let SUG_ORDRE = null;      // noms dans l'ordre affiché, ou null si l'on suit les scores

/* Gèle l'ordre tel qu'il est affiché — c'est-à-dire la dernière sélection
   rendue, jamais une notation en cours : `SUG_MEMO.liste` porte exactement ce
   que la section montre, et le lire ne recalcule rien. Sans elle, il n'y a
   rien à geler et l'ordre des scores continue de valoir. */
function geleSuggestions() {
  /* Une sélection vide ne gèle rien : retenir un ordre vide reviendrait à
     poser un gel qui ne retient personne, et — le tableau vide étant vrai —
     à interdire tout gel ultérieur. */
  if (!ordreGele() && SUG_MEMO.liste && SUG_MEMO.liste.length)
    SUG_ORDRE = SUG_MEMO.liste.map(s => s.card.name);
}

function ordreGele() {
  return !!(SUG_ORDRE && SUG_ORDRE.length);
}

function degeleSuggestions() {
  SUG_ORDRE = null;
}

/* La sélection dans l'ordre où elle s'affiche : celui des scores, ou celui
   qui a été gelé — rang connu d'abord, nouvelles venues à la suite. */
function suggestionsAffichees() {
  const liste = currentSuggestions();
  if (!ordreGele()) return liste;
  const rang = new Map();
  SUG_ORDRE.forEach((nom, i) => rang.set(nom, i));
  const connues = [], nouvelles = [];
  liste.forEach(s => (rang.has(s.card.name) ? connues : nouvelles).push(s));
  connues.sort((a, b) => rang.get(a.card.name) - rang.get(b.card.name));
  return connues.concat(nouvelles);
}

/* L'ordre affiché diffère-t-il de celui des scores ? C'est ce qui décide du
   bandeau : sans différence, rien à proposer. */
function classementDecale() {
  if (!ordreGele()) return false;
  const parScore = currentSuggestions(), affiche = suggestionsAffichees();
  if (parScore.length !== affiche.length) return true;
  for (let i = 0; i < parScore.length; i++)
    if (parScore[i].card.name !== affiche[i].card.name) return true;
  return false;
}

function bandeauReclassement() {
  if (!classementDecale()) return '';
  return `<div class="small muted" style="display:flex;align-items:center;gap:8px;flex-wrap:wrap;margin-bottom:8px">
    Les scores ont changé ; les vignettes gardent leur place pour ne pas vous faire perdre le fil.
    <button class="btn sm" data-act="reclasser" title="Reclasser les suggestions par score">Reclasser</button>
  </div>`;
}

/* ---------------------------------------------------------------------
   Trois lectures d'une même sélection.

   La notation ne connaît qu'une liste : toutes les cartes qu'on pourrait
   ajouter, classées par score. Trois onglets la lisent différemment — le
   graphe ne retient que ce qui se branche sur les nœuds isolés, EDHREC que ce
   que les decks recensés recommandent, le catalogue montre tout, groupé et
   paginé. Les trois vivaient hier sous le même onglet, l'un derrière l'autre :
   il fallait dérouler des centaines de vignettes pour revenir au graphe, et
   les recommandations d'EDHREC se perdaient au milieu.

   La partition est faite une fois — `selectionSuggestions()` — et les trois
   sections s'y servent. `renderSuggestions()` est le seul point d'entrée des
   autres modules : une donnée qui arrive, d'EDHREC ou du catalogue, touche les
   trois pages à la fois.
   --------------------------------------------------------------------- */

function selectionSuggestions() {
  const sug = suggestionsAffichees();
  return {
    sug,
    /* Sans nœud isolé, le graphe ne distingue rien : la liste serait celle du
       catalogue, et n'aurait pas sa place sur cette page. */
    graphPicks: S.focusNodes.size ? sug.filter(s => s.graph && s.graph.includes('noeud')) : [],
    edhrecPicks: sug.filter(s => s.edhrec)
  };
}

/* La pagination d'une liste qui n'est pas un groupe du catalogue : celle du
   graphe et celle d'EDHREC, chacune sur sa page, avec son compte par défaut.
   `js/app.js` y lit ce que « Afficher de plus » doit faire. */
const LISTES_SUG = {graphe:{defaut:8}, edhrec:{defaut:8}};

/* Les boutons de pagination d'une liste hors catalogue, ou rien si tout
   tient. Le compte par défaut est passé : une liste courte en montre huit,
   une catégorie d'EDHREC six, comme les catégories du catalogue. */
function paginationListe(cle, total, max, defaut) {
  const reste = total - max;
  if (total <= defaut) return '';
  return `<div class="row" style="justify-content:center;gap:6px;margin-top:8px">
    ${reste > 0 ? `<button class="btn sm" data-act="pageType" data-type="${esc(cle)}" data-pas="30">Afficher ${Math.min(30, reste)} de plus</button>` : ''}
    ${reste > 30 ? `<button class="btn sm" data-act="pageType" data-type="${esc(cle)}" data-pas="tout">Tout afficher (${total})</button>` : ''}
    ${max > defaut ? `<button class="btn sm" data-act="pageType" data-type="${esc(cle)}" data-pas="reduire">Réduire</button>` : ''}
  </div>`;
}

/* Le renvoi au catalogue : les deux listes courtes ne montrent qu'un extrait
   du classement, et le dire évite de les croire exhaustives. */
function renvoiCatalogue(quoi) {
  return `<div class="small muted" style="margin-top:8px">${quoi} Le classement complet, groupé et paginé, est dans
    <button type="button" class="btn sm" data-onglet="catalogue">l'onglet Catalogue</button>.</div>`;
}

/* La section du graphe : ce qui se branche sur les nœuds qu'on y a isolés.
   Elle suit le graphe sur la même page — on clique un effet, on voit aussitôt
   de quoi l'alimenter. */
function blocGraphe(sel) {
  const actifs = noeudsActifs();
  if (!actifs.length)
    return `<div class="empty">Aucun nœud isolé. Cliquez un nœud du graphe, ci-dessus : les cartes qui s'y branchent
      seront proposées ici, à part du reste du classement.</div>`;

  const noms = actifs.map(n => esc(NODE[n].label)).join(' + ');
  const picks = sel.graphPicks;
  if (!picks.length)
    return `<div class="empty">Rien à proposer autour de ${noms} : élargissez les couleurs, le budget ou les filtres,
      ou relâchez un nœud dans le graphe.</div>`;

  const total = picks.length, max = Math.min(S.limiteType['graphe'] || LISTES_SUG.graphe.defaut, total);
  visuelsSuggestions(picks.slice(0, max));

  return `<div class="group" style="border-color:var(--brass-d)">
    <h4>Autour de ${noms}
      <span class="small muted">${max} sur ${total} piste(s)</span></h4>
    <div class="sugrid">${picks.slice(0, max).map(s => sugRow(s)).join('')}</div>
    ${paginationListe('graphe', total, max, LISTES_SUG.graphe.defaut)}
  </div>
  ${renvoiCatalogue('Ces pistes touchent tous les nœuds isolés ; le score, lui, est celui de la notation commune.')}`;
}

/* La clé de pagination d'une catégorie d'EDHREC. Elle est préfixée : sans
   cela, « Créature » y partagerait son compte avec la « Créature » du
   catalogue, et déplier l'une déplierait l'autre. */
function cleLimiteEdhrec(idGroupe) {
  return 'edhrec:' + idGroupe;
}

/* Le compte affiché d'une catégorie d'EDHREC, et sa pagination : sans groupe,
   c'est la liste entière sous la clé « edhrec » ; groupée, chaque catégorie a
   la sienne. */
function corpsEdhrec(g, plat) {
  const cle = plat ? 'edhrec' : cleLimiteEdhrec(g.id);
  const defaut = plat ? LISTES_SUG.edhrec.defaut : 6;
  const max = Math.min(S.limiteType[cle] || defaut, g.total);
  return {max, html: `<div class="sugrid">${g.entrees.slice(0, max).map(s => sugRow(s)).join('')}</div>
    ${paginationListe(cle, g.total, max, defaut)}`};
}

/* Les visuels des recommandations affichées, catégorie par catégorie : une
   catégorie repliée ne montre rien, et ne demande donc rien. */
function visuelsEdhrec(groupes, mode) {
  const plat = GROUPES[mode].plat, vus = [];
  groupes.forEach(g => {
    if (!plat && groupePlie('edhrec', mode, g.id)) return;
    vus.push(...g.entrees.slice(0, corpsEdhrec(g, plat).max));
  });
  visuelsSuggestions(vus);
}

/* La section EDHREC : le panneau du commandant est rendu à part (il ne dépend
   pas de la sélection), et voici les cartes que les decks recensés
   recommandent parmi celles qu'on pourrait ajouter.

   Elle se range comme les autres — sa propre barre, son propre groupement,
   son propre tri, gardés sous la clé `edhrec` — et offre en plus les deux
   tris qui n'ont de sens qu'ici : le taux d'inclusion et la synergie, tels
   qu'EDHREC les publie. */
function blocEdhrec(sel) {
  const f = fmt();
  if (!f.commander)
    return `<div class="empty">Ce format n'a pas de commandant : EDHREC ne recense que les decks Commander.
      Les suggestions de l'atelier restent dans <button type="button" class="btn sm" data-onglet="catalogue">l'onglet Catalogue</button>.</div>`;

  const edhrecPicks = sel.edhrecPicks;
  if (!edhrecPicks.length) {
    if (S.edhrec && S.edhrec.status === 'ok' && (S.commander || commandantsSecondaires().length))
      return `<div class="empty">Aucune carte recommandée par EDHREC ne correspond à votre budget actuel
        (${S.budget.total > 0 ? `${eur(S.budget.perCard)} max / carte` : 'collection uniquement'}) ou à vos filtres.</div>`;
    return '';
  }

  const total = edhrecPicks.length;
  const cmdNom = (S.edhrec && S.edhrec.data && S.edhrec.data.commandant) || S.commander || '';
  const secList = (S.edhrec.secondaires || []).map(s => s.commandant);
  const budInfo = S.budget.total > 0 ? `budget max ${eur(S.budget.perCard)} / carte` : 'collection uniquement';

  const titreEDH = cmdNom
    ? `Recommandées pour ${esc(cmdNom)}${secList.length ? ` & ${secList.length} cmd 2nd` : ''}`
    : `Recommandées par les commandants secondaires (${secList.map(esc).join(', ')})`;

  /* Comme au catalogue, le tri « score » ne retrie rien : la liste arrive
     dans l'ordre des scores, ou dans l'ordre gelé qu'un ajout a retenu. Tout
     autre tri — les deux taux d'EDHREC d'abord — est un ordre demandé, qui
     passe donc avant le gel. */
  const mode = S.groupes.edhrec;
  const tri = S.tris.edhrec === 'score' ? null : S.tris.edhrec;
  const groupes = groupeCartes(edhrecPicks, mode, tri);
  const plat = GROUPES[mode].plat;
  visuelsEdhrec(groupes, mode);

  const listes = plat
    ? (() => {
        const g = groupes[0], {max, html} = corpsEdhrec(g, true);
        return `<div class="group" style="border-color:#2f6b68">
          <h4>${titreEDH} <span class="small muted">${max} sur ${g.total}</span></h4>
          ${html}</div>`;
      })()
    : groupes.map(g => {
        const {max, html} = corpsEdhrec(g, false);
        return enveloppeGroupe('edhrec', mode, g, g.libelle, `${max} sur ${g.total}`, html);
      }).join('');

  return `<div class="row" style="margin-bottom:10px">
      ${barreGroupeTri('edhrec')}
      <span class="small muted">${total} recommandation(s)${noteMultiple(mode)} · ${budInfo}</span>
    </div>
    ${plat ? '' : `<div class="small muted" style="margin-bottom:8px">${titreEDH}</div>`}
    ${listes}
    ${renvoiCatalogue('Ces cartes portent l\'étiquette <b>edhrec</b> partout où elles paraissent.')}`;
}

/* La section du catalogue : tout le classement, groupé et paginé selon la
   barre de la section. Les deux listes courtes des autres onglets en sont des
   extraits — rien n'est retiré d'ici. */
function listeSuggestions(sel) {
  const sug = sel.sug;
  /* Le rangement de la section. Le tri par score ne retrie rien : la liste
     arrive déjà dans l'ordre des scores, ou dans l'ordre gelé que le geste
     précédent a retenu — la retrier ferait sauter les vignettes que ce gel
     tient justement en place. Tout autre tri est un ordre demandé, qui passe
     donc avant le gel. */
  const mode = S.groupes.suggestions;
  const tri = S.tris.suggestions === 'score' ? null : S.tris.suggestions;
  const groupes = groupeCartes(sug, mode, tri);
  visuelsCatalogue(groupes);

  return `
    <div class="row" style="margin-bottom:10px">
      ${barreGroupeTri('suggestions')}
      ${menuColonnes('suggestions')}
      <span class="small muted">${sug.length} piste(s)${noteMultiple(mode)}</span>
    </div>
    ${bandeauReclassement()}
    ${sug.length ? groupes.map(g => {
      const total = g.total, max = Math.min(S.limiteType[g.id] || 6, total), reste = total - max;
      const titre = GROUPES[mode].plat ? 'Toutes les pistes' : g.libelle;
      /* Le corps entier — les vignettes et la pagination de la catégorie —
         entre dans le pli : repliée, elle cache aussi ses boutons. */
      const corps = `${ouvreGrille('suggestions', 'sugrid')}${g.entrees.slice(0,max).map(s=>sugRow(s)).join('')}</div>
        ${total > 6 ? `<div class="row" style="justify-content:center;gap:6px;margin-top:8px">
          ${reste > 0 ? `<button class="btn sm" data-act="pageType" data-type="${esc(g.id)}" data-pas="30">Afficher ${Math.min(30,reste)} de plus</button>` : ''}
          ${reste > 30 ? `<button class="btn sm" data-act="pageType" data-type="${esc(g.id)}" data-pas="tout">Tout afficher (${total})</button>` : ''}
          ${max > 6 ? `<button class="btn sm" data-act="pageType" data-type="${esc(g.id)}" data-pas="reduire">Réduire</button>` : ''}
        </div>` : ''}`;
      /* Sans groupement, il n'y a pas de catégorie à replier : le bloc reste
         celui d'avant, avec son seul titre. */
      return GROUPES[mode].plat
        ? `<div class="group"><h4>${esc(titre)} <span class="small muted">${max} sur ${total}</span></h4>${corps}</div>`
        : enveloppeGroupe('suggestions', mode, g, titre, `${max} sur ${total}`, corps);
    }).join('')
      : '<div class="empty">Aucune suggestion. Ajoutez des cartes à la collection, élargissez les couleurs ou augmentez le budget.</div>'}
    <div class="small muted">Le score combine les branchements avec le deck (un effet produit ici déclenche une capacité là-bas), les rôles manquants, la courbe de mana et la densité de capacités. Les cartes hors collection sont pénalisées et limitées par le budget.
      <br>Les pistes tirées des nœuds isolés du graphe sont réunies dans <button type="button" class="btn sm" data-onglet="graphe">l'onglet Graphe</button>,
      celles que recommandent les decks recensés dans <button type="button" class="btn sm" data-onglet="edhrec">l'onglet EDHREC</button> : toutes figurent aussi ici.
      <br>Le budget, le prix maximum par carte et les préférences d'achat (état, langue, vendeur, pays) se règlent
      dans la fenêtre « Achats sur Cardmarket », qu'ouvre la pastille « Budget » de l'en-tête, et n'y prennent
      effet qu'au bouton « Appliquer ».</div>`;
}

/* Les visuels des vignettes qu'une section affiche. Chacune demande les
   siennes : Scryfall n'est sollicité qu'une fois par carte — `queueScryfall`
   écarte celles déjà demandées —, et une page qu'on ne regarde pas ne charge
   donc rien de plus que ce qu'elle montre. */
function visuelsSuggestions(vus) {
  if (!vus || !vus.length) return;
  setTimeout(() => queueScryfall(vus.map(x => x.card)), 0);
  setTimeout(chargeVisuelsClasses, 0);
}

/* Celles du catalogue, groupe par groupe : une catégorie repliée ne montre
   rien, et demander les visuels de vignettes que personne ne voit serait
   autant de requêtes pour rien. */
function visuelsCatalogue(groupes) {
  const vus = [];
  const mode = S.groupes.suggestions;
  groupes.forEach(g => {
    if (groupePlie('suggestions', mode, g.id)) return;
    vus.push(...g.entrees.slice(0, Math.min(S.limiteType[g.id] || 6, g.total)));
  });
  visuelsSuggestions(vus);
}

let visuelsEnCours = false;
const VISUELS_CHARGES = new Set();

/* Les visuels partent par paquets de six, pour ne pas ouvrir cent requêtes
   d'un coup. Le paquet suivant est relu dans le document à chaque tour,
   jamais figé au départ : un nouveau rendu remplace les vignettes en place,
   et une liste figée finirait de remplir des images détachées du document
   pendant que celles réellement affichées resteraient vides — c'est ce qui
   arrivait à l'import du catalogue, qui rend à nouveau tous les 25 000
   enregistrements. Le garde-fou évite qu'un paquet dont les évènements ne
   reviennent pas (image retirée en vol) n'arrête la file pour de bon. */
function chargeVisuelsClasses() {
  if (visuelsEnCours || typeof document.querySelectorAll !== 'function') return;
  visuelsEnCours = true;
  const suivant = () => {
    const lot = [...document.querySelectorAll('img.cimg[data-src]')].slice(0, 6);
    if (!lot.length) { visuelsEnCours = false; return; }
    let restants = lot.length, clos = false;
    const passer = () => { if (clos) return; clos = true; clearTimeout(garde); setTimeout(suivant, 60); };
    const fini = () => { if (--restants <= 0) passer(); };
    const garde = setTimeout(passer, 8000);
    lot.forEach(img => {
      const src = img.getAttribute('data-src'), nom = img.getAttribute('data-nom');
      img.removeAttribute('data-src');
      img.addEventListener('load', () => {
        img.classList.remove('attente');
        if (nom) VISUELS_CHARGES.add(nom);
        fini();
      }, {once:true});
      img.addEventListener('error', fini, {once:true});
      img.src = src;
    });
  };
  suivant();
}

/* Le décompte d'une section, dans son en-tête : « 104 pistes ». Il dit ce que
   la page montre, non ce que la notation a trouvé — chaque section a le sien
   depuis qu'elles sont trois. */
function majHint(idSection, texte) {
  const el = document.getElementById('hint' + idSection.slice(3));
  if (el) el.textContent = texte;
}

/* Poser le contenu d'une section sans en refaire l'enveloppe : les
   conteneurs nommés survivent d'un rendu à l'autre, et seuls leurs contenus
   sont réécrits. C'est ce qui garde sa place au lecteur qui parcourait le
   milieu d'une liste de trois cents vignettes : réécrire le corps entier le
   ramènerait au début. L'enveloppe n'est bâtie qu'au premier rendu, ou si un
   conteneur manque. */
function poseCorps(idCorps, morceaux) {
  if (morceaux.every(([id]) => document.getElementById(id))) {
    morceaux.forEach(([id, html]) => { document.getElementById(id).innerHTML = html; });
    return;
  }
  const corps = document.getElementById(idCorps);
  if (corps) corps.innerHTML = morceaux.map(([id, html]) => `<div id="${id}">${html}</div>`).join('');
}

/* Le filet : un changement a rendu la sélection caduque sans passer par un
   geste identifié — une archive qui finit de charger, une réponse de
   Scryfall, un réglage venu d'ailleurs. Plutôt que de figer la fenêtre le
   temps de noter des dizaines de milliers de cartes, les sections gardent ce
   qu'elles affichent et le recalcul repart par tranches, annoncé comme les
   autres : leurs scores datent d'un instant, et c'est le liseré des en-têtes
   qui le dit. Vider les listes ferait fondre les sections de quelques
   milliers de pixels à une ligne, et le navigateur ramènerait le défilement
   au début. */
function filetSuggestions() {
  if (suggestionsAJour() || recalculEnCours
      || typeof recalculLong !== 'function' || !recalculLong()) return false;
  setTimeout(() => recalculerAvecProgression(
    'Les suggestions se recalculent après un changement de l\'atelier.', {fond:true}), 0);
  return true;
}

/* Les trois sections des propositions, peintes ensemble : la sélection n'est
   partitionnée qu'une fois, et une donnée qui arrive — d'EDHREC, du
   catalogue, de Scryfall — les met toutes les trois à jour. C'est le point
   d'entrée des autres modules. */
function renderSuggestions() {
  if (filetSuggestions()) return;
  const sel = selectionSuggestions();
  renderG(sel);
  renderH(sel);
  renderF(sel);
  lanceEdhrecSiBesoin();
}

/* La section du graphe (onglet Graphe) : les pistes branchées sur les nœuds
   isolés. Le graphe lui-même — `renderD()`, js/graphe.js — la précède sur la
   page et ne dépend pas de la notation. */
function renderG(sel) {
  if (filetSuggestions()) return;
  const s = sel || selectionSuggestions();
  poseCorps('bodyG', [['grapheList', blocGraphe(s)]]);
  const actifs = noeudsActifs();
  majHint('secG', actifs.length
    ? `${s.graphPicks.length} piste(s) · ${actifs.length} nœud(s) isolé(s)`
    : 'aucun nœud isolé');
}

/* La section EDHREC (onglet EDHREC) : le panneau du commandant, puis les
   cartes que les decks recensés recommandent. */
function renderH(sel) {
  if (filetSuggestions()) return;
  const s = sel || selectionSuggestions();
  poseCorps('bodyH', [['edhrecPanneau', panneauEdhrec()], ['edhrecList', blocEdhrec(s)]]);
  const e = S.edhrec || {};
  majHint('secH', !fmt().commander ? 'hors Commander'
    : e.status === 'loading' ? 'chargement…'
    : `${s.edhrecPicks.length} recommandation(s)${e.data ? ` · ${e.data.total.toLocaleString('fr-FR')} decks recensés` : ''}`);
  lanceEdhrecSiBesoin();
}

/* La section du catalogue (onglet Catalogue) : l'état du catalogue, puis tout
   le classement. */
function renderF(sel) {
  if (filetSuggestions()) return;
  const s = sel || selectionSuggestions();
  poseCorps('bodyF', [['catLine', ligneCatalogue()], ['sugList', listeSuggestions(s)]]);
  majHint('secF', `${s.sug.length} pistes`);
}

/* Rafraîchir sans rien recalculer : la pagination d'une liste, un
   groupement, un tri. L'en-tête suit, ses pastilles comptant les mêmes
   pistes. */
function refreshSuggestions() {
  renderSuggestions();
  renderTop();
}

/* Les statistiques du commandant sont demandées dès que celui-ci change —
   d'où que vienne le rendu, complet ou en place. */
function lanceEdhrecSiBesoin() {
  const secCmds = commandantsSecondaires();
  const cmdSig = signatureCommandants();
  if (fmt().commander && (S.commander || secCmds.length) && typeof fetch === 'function'
     && S.edhrec.cmdSignature !== cmdSig && S.edhrec.status !== 'loading') {
    setTimeout(() => loadEdhrec(), 0);
  }
}
