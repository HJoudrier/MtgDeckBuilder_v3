/* =====================================================================
   js/suggestions.js — Moteur d'évaluation, scoring & suggestions d'ajout
   ===================================================================== */

function contexteEvaluation() {
  const deck = deckEntries().map(e => e.card);
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

  const partners = [...linkMap.entries()].map(([nm, m]) => {
    const links = [...m.values()];
    let w = 0;
    links.forEach(l => {
      const base = (l.concept === 'ETB' || l.concept === 'LANCEMENT') ? 0.8 : (l.dir === 'ab' ? 3.2 : 2.6);
      w += base * (l.k || 1);
    });
    return {name:nm, links, w};
  });

  let weight = partners.reduce((a, p2) => a + p2.w, 0);
  partners.sort((a, b) => b.w - a.w);
  score += Math.min(26, weight);

  if (partners.length) {
    const detail = partners.slice(0, 3).map(p2 => {
      const cs = [...new Set(p2.links.map(l => NODE[l.concept].label.toLowerCase()))].slice(0, 2).join(', ');
      return `${p2.name} (${cs})`;
    }).join(', ');
    reasons.push(`se branche à ${partners.length} carte(s) : ${detail}`);
  }

  const graph = [];
  let loopEdge = null;
  c.an.edges.forEach(e => { if (!loopEdge && X.reach[X.IDX[e.to]][X.IDX[e.from]]) loopEdge = e; });
  if (loopEdge) {
    graph.push('boucle');
    score += 12;
    reasons.unshift(`ferme une boucle avec le deck : ${NODE[loopEdge.from].label} → ${NODE[loopEdge.to].label} → … → ${NODE[loopEdge.from].label}`);
  }

  const hasAb = partners.some(p2 => p2.links.some(l => l.dir === 'ab'));
  const hasBa = partners.some(p2 => p2.links.some(l => l.dir === 'ba'));
  if (hasAb && hasBa) {
    graph.push('pont');
    score += 5;
    reasons.unshift('relie deux effets déjà présents : elle reçoit un déclencheur du deck et en fournit un autre');
  }

  const combos = combosCompletesPar(c);
  if (combos.length) {
    score += 11;
    const c0 = combos[0];
    reasons.unshift(`combo connu : avec ${c0.cartes.filter(n=>norm(n)!==norm(c.name)).join(' + ')}${c0.produit.length?` → ${c0.produit.slice(0,2).join(', ')}`:''}${combos.length>1?` (et ${combos.length-1} autre${combos.length>2?'s':''})`:''}`);
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
  return {card:c, score, reasons, partners, source:p.source, offer:p.offer, graph, edhrec:er, combos};
}

function currentSuggestions() {
  const X = contexteEvaluation();
  const f = X.f;
  const pool = [];

  filtered().forEach(e => {
    if (e.card.isToken) return;
    if (availableFor(e.card) > 0 && (S.deck.get(e.card.name) || 0) < f.maxCopies)
      pool.push({card:e.card, source:'collection'});
  });

  const budgetLeft = S.budget.total - spent();
  const noeuds = noeudsActifs();
  if (S.budget.total > 0 && S.budget.perCard > 0 && budgetLeft > 0) {
    (CAT.etat === 'ok' ? candidatsCatalogue() : []).forEach(c => {
      if (c.isToken || (S.deck.get(c.name) || 0) >= f.maxCopies) return;
      const o = bestOffer(c);
      if (o && o.price > 0 && o.price <= budgetLeft && !pool.some(x => x.card === c))
        pool.push({card:c, source:'achat', offer:o});
    });

    DB.forEach(c => {
      if (c.isToken) return;
      if (S.collection.has(c.name) && (S.collection.get(c.name) || 0) > 0) return;
      if (!colorOK(c)) return;
      if (noeuds.length && !carteTouche(c, noeuds)) return;
      if ((S.deck.get(c.name) || 0) >= f.maxCopies) return;
      const o = bestOffer(c);
      if (o && o.price > 0 && o.price <= budgetLeft && !pool.some(x => x.card === c))
        pool.push({card:c, source:'achat', offer:o});
    });
  }

  const addRecToPool = (rec) => {
    const c = find(rec.name);
    if (!c || c.isToken || !colorOK(c)) return;
    if ((S.deck.get(c.name) || 0) >= f.maxCopies) return;
    if (pool.some(x => x.card.name === c.name)) return;
    const inColl = (S.collection.get(c.name) || 0) > 0 && availableFor(c) > 0;
    if (inColl) {
      pool.push({card: c, source: 'collection'});
    } else if (S.budget.total > 0 && S.budget.perCard > 0 && budgetLeft > 0) {
      const o = bestOffer(c);
      if (o && o.price > 0 && o.price <= budgetLeft) {
        pool.push({card: c, source: 'achat', offer: o});
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

  const res = [];
  pool.forEach(p => { const n = noteCarte(p, X); if (n) res.push(n); });
  // les filtres de l'en-tête valent aussi pour ce qu'on propose d'ajouter
  return res.filter(r => r.score > 0 && carteFiltree(r.card)).sort((a, b) => b.score - a.score);
}

function ligneCatalogue() {
  if (CAT.etat === 'chargement')
    return `<div class="small muted" style="margin-top:4px">Catalogue complet en cours de chargement (${esc(CAT.source||'')})… le classement fonctionne déjà avec vos cartes.</div>`;
  if (CAT.etat === 'ok') {
    const dispos = candidatsCatalogue().length;
    const maj = CAT.maj ? new Date(CAT.maj).toLocaleDateString('fr-FR') : '';
    const noeuds = noeudsActifs();
    const effTxt = noeuds.length ? `, les effets sélectionnés (${noeuds.map(n => (typeof NODE !== 'undefined' && NODE[n] && NODE[n].label) || n).join(' + ')})` : '';
    return `<div class="small muted" style="margin-top:4px">
      Catalogue complet : ${CAT.cartes.length.toLocaleString('fr-FR')} cartes en cache${maj?` (Scryfall, ${maj})`:''}.
      ${dispos.toLocaleString('fr-FR')} retenue(s) par vos couleurs, le format${effTxt} et le prix maximum de ${eur(S.budget.perCard)}.
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

function panneauEdhrec() {
  const f = fmt();
  if (!f.commander) return '';
  const e = S.edhrec, cmd = S.commander ? find(S.commander) : null;
  const secCmds = commandantsSecondaires();

  if (!cmd && !secCmds.length) return `<div class="group"><h4>EDHREC</h4>
    <div class="small muted">Désignez un commandant en section D ou ajoutez des créatures légendaires au deck pour croiser les suggestions avec les statistiques d'EDHREC.</div></div>`;

  if (e.status === 'loading') return `<div class="group"><h4>EDHREC</h4>
    <div class="small muted">Chargement des statistiques EDHREC${cmd ? ` pour ${esc(cmd.name)}` : ''}${secCmds.length ? ` et ${secCmds.length} commandant(s) secondaire(s)` : ''}…</div></div>`;

  if (e.status === 'error' && (!e.data && (!e.secondaires || !e.secondaires.length))) return `<div class="group"><h4>EDHREC</h4>
    <div class="small">Statistiques indisponibles (${esc(e.error||'')}). Le site n'autorise pas forcément la requête depuis un navigateur tiers, ou la page peut ne pas exister pour ce commandant.</div>
    <div class="row" style="gap:6px;margin-top:6px">
      <button class="btn sm" data-act="edhrec" data-force="1">Réessayer</button>
      ${cmd ? `<a class="btn sm" href="https://edhrec.com/commanders/${esc(e.slug||edhrecSlug(cmd.name))}" target="_blank" rel="noopener">Ouvrir la page EDHREC ↗</a>` : ''}
    </div></div>`;

  if (e.status !== 'ok' && !e.data && (!e.secondaires || !e.secondaires.length)) return `<div class="group"><h4>EDHREC</h4>
    <div class="small muted">Croiser les suggestions avec les decks recensés pour ${cmd ? esc(cmd.name) : 'vos commandants'}${secCmds.length ? ` et ${secCmds.length} commandant(s) secondaire(s)` : ''}.</div>
    <div class="row" style="margin-top:6px"><button class="btn sm" data-act="edhrec">Charger les statistiques</button></div></div>`;

  const d = e.data;
  let absentes = [];
  if (d && d.map) {
    const connues = [...new Set([...d.map.values()])];
    absentes = connues
      .filter(r => { const c = find(r.name); return !c || ((S.collection.get(c.name) || 0) === 0 && !S.deck.has(c.name)); })
      .sort((a, b) => b.inclusion - a.inclusion).slice(0, 6);
  }

  const secHTML = secCmds.length ? `
    <div class="small" style="margin-top:8px;padding-top:6px;border-top:1px dashed var(--line2)">
      <b>Commandants secondaires dans le deck (${secCmds.length}) :</b>
      <div class="row" style="gap:6px;margin-top:4px;flex-wrap:wrap">
        ${secCmds.map(sc => {
          const sd = (e.secondaires || []).find(x => x.commandant === sc.name);
          if (sd && sd.status === 'ok') {
            return `<a class="chip on" style="border-color:#57c9c4;color:#57c9c4;text-decoration:none" href="${esc(sd.url)}" target="_blank" rel="noopener" title="Voir sur EDHREC (${sd.total.toLocaleString('fr-FR')} decks)">★ ${esc(sc.name)} <span class="muted">(${sd.total.toLocaleString('fr-FR')} decks) ↗</span></a>`;
          } else if (sd && sd.status === 'error') {
            return `<span class="chip" title="${esc(sd.error||'non trouvé')}">★ ${esc(sc.name)} <span class="muted">(absent EDHREC)</span></span>`;
          } else {
            return `<span class="chip">★ ${esc(sc.name)} <span class="muted">(en attente)</span></span>`;
          }
        }).join('')}
      </div>
    </div>` : '';

  const titrePrincipal = d
    ? `EDHREC — ${esc(d.commandant)} <span class="small muted">${d.total.toLocaleString('fr-FR')} decks recensés</span>`
    : `EDHREC — Commandants secondaires (${(e.secondaires||[]).length})`;

  return `<div class="group" style="border-color:#2f6b68">
    <h4>${titrePrincipal}</h4>
    <div class="small muted">Les cartes de vos suggestions recommandées par EDHREC (pour votre commandant principal ou vos commandants secondaires) portent l'étiquette <b>edhrec</b> avec leur taux d'inclusion et leur synergie.</div>
    ${absentes.length ? `<div class="small" style="margin-top:8px">Fréquentes chez ${esc(d.commandant)} mais absentes de votre collection :
      ${absentes.map(r => `<span class="chip" title="synergie ${r.synergy>=0?'+':'−'}${Math.abs(Math.round(r.synergy*100))} %">${esc(r.name)} — ${Math.round(r.inclusion*100)} %</span>`).join(' ')}</div>` : ''}
    ${secHTML}
    <div class="row" style="gap:6px;margin-top:8px">
      <button class="btn sm" data-act="edhrec" data-force="1">Rafraîchir</button>
      ${d ? `<a class="btn sm" href="${esc(d.url)}" target="_blank" rel="noopener">Page EDHREC (${esc(d.commandant)}) ↗</a>` : ''}
    </div></div>`;
}

function sugRow(s) {
  const c = s.card, n = (s.partners || []).length;
  const inDeck = S.deck.get(c.name) || 0;
  const img = S.images && (c.imgN || c.img);
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
    n ? `<span class="tag" style="border-color:var(--brass);color:var(--brass)" title="Cartes du deck avec lesquelles elle interagit">${n} interaction${n>1?'s':''}</span>` : '',
    s.source !== 'collection' ? `<span class="tag" style="border-color:var(--bad);color:#e39a90">hors collection</span>` : '',
    s.combos && s.combos.length ? `<span class="tag" style="border-color:#a077cf;color:#a077cf">combo</span>` : '',
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

function panneauAchats() {
  return `<div class="group">
      <h4>Achats sur Cardmarket <a class="small" style="color:var(--brass)" href="https://www.cardmarket.com/fr/Magic" target="_blank" rel="noopener">cardmarket.com ↗</a></h4>
      <div class="row">
        <div class="field"><label class="lab" for="bT">Budget total (€)</label><input id="bT" type="number" min="0" step="1" value="${S.budget.total}" data-bud="total" style="width:96px"></div>
        <div class="field"><label class="lab" for="bP">Prix max / carte (€)</label><input id="bP" type="number" min="0" step="1" value="${S.budget.perCard}" data-bud="perCard" style="width:96px"></div>
        <div class="field"><label class="lab" for="bQ">État minimum</label>
          <select id="bQ" data-bud="condition">${CONDITIONS.map(([k,l]) => `<option value="${k}" ${S.budget.condition===k?'selected':''}>${k} — ${l}</option>`).join('')}</select></div>
        <div class="field"><label class="lab" for="bL">Langue</label>
          <select id="bL" data-bud="lang">${CM_LANGS.map(([k,l]) => `<option value="${k}" ${S.budget.lang===k?'selected':''}>${l}</option>`).join('')}</select></div>
        <div class="field"><label class="lab" for="bS">Type de vendeur</label>
          <select id="bS" data-bud="sellerType">${SELLER_TYPES.map(([k,l]) => `<option value="${k}" ${S.budget.sellerType===k?'selected':''}>${l}</option>`).join('')}</select></div>
        <div class="field"><label class="lab" for="bC">Pays du vendeur</label>
          <select id="bC" data-bud="country">${CM_COUNTRIES.map(([k,l]) => `<option value="${k}" ${S.budget.country===k?'selected':''}>${l}</option>`).join('')}</select></div>
      </div>
      <div class="small muted" style="margin-top:6px" id="budLine">${ligneBudget()}</div>
      <div class="small muted" style="margin-top:4px">Prix de référence : tendance Cardmarket, relayée par Scryfall et rafraîchie avec les visuels. L'état, la langue et le type de vendeur ajustent une <b>estimation</b> : les offres réelles se consultent sur la fiche Cardmarket, via le lien de chaque carte.</div>
      ${ligneCatalogue()}
      <div id="budBuys">${ligneAchats()}</div>
    </div>`;
}

function listeSuggestions() {
  const toutes = currentSuggestions();
  const sug = toutes;
  const graphPicks = S.focusNodes.size ? sug.filter(s => s.graph && s.graph.includes('noeud')) : [];
  const edhrecPicks = sug.filter(s => s.edhrec);
  const byType = {};
  sug.forEach(s => { const t = mainType(s.card); (byType[t] = byType[t] || []).push(s); });
  visuelsSuggestions(byType, edhrecPicks);

  const edhrecHTML = (() => {
    if (!edhrecPicks.length) {
      if (S.edhrec && S.edhrec.status === 'ok' && (fmt().commander || commandantsSecondaires().length)) {
        return `<div class="group" style="border-color:#2f6b68">
          <h4>Suggestions depuis EDHREC</h4>
          <div class="small muted">Aucune carte recommandée par EDHREC ne correspond à votre budget actuel (${S.budget.total>0?`${eur(S.budget.perCard)} max / carte`:'collection uniquement'}) ou à vos filtres.</div>
        </div>`;
      }
      return '';
    }
    const total = edhrecPicks.length, max = Math.min(S.limiteType['edhrec'] || 8, total), reste = total - max;
    const cmdNom = (S.edhrec && S.edhrec.data && S.edhrec.data.commandant) || S.commander || '';
    const secList = (S.edhrec.secondaires || []).map(s => s.commandant);
    const budInfo = S.budget.total > 0
      ? `budget max ${eur(S.budget.perCard)} / carte`
      : 'collection uniquement';
    
    const titreEDH = cmdNom
      ? `Suggestions depuis EDHREC — ${esc(cmdNom)}${secList.length ? ` & ${secList.length} cmd 2nd` : ''}`
      : `Suggestions depuis EDHREC — Commandants secondaires (${secList.map(esc).join(', ')})`;

    return `<div class="group" style="border-color:#2f6b68">
      <h4>${titreEDH}
        <span class="small muted">${max} sur ${total} recommandation(s) · ${budInfo}</span></h4>
      <div class="sugrid">${edhrecPicks.slice(0, max).map(s => sugRow(s)).join('')}</div>
      ${total > 8 ? `<div class="row" style="justify-content:center;gap:6px;margin-top:8px">
        ${reste > 0 ? `<button class="btn sm" data-act="pageType" data-type="edhrec" data-pas="30">Afficher ${Math.min(30, reste)} de plus</button>` : ''}
        ${reste > 30 ? `<button class="btn sm" data-act="pageType" data-type="edhrec" data-pas="tout">Tout afficher (${total})</button>` : ''}
        ${max > 8 ? `<button class="btn sm" data-act="pageType" data-type="edhrec" data-pas="reduire">Réduire</button>` : ''}
      </div>` : ''}
    </div>`;
  })();

  const html = `
    ${graphPicks.length ? `
      <div class="group" style="border-color:var(--brass-d)">
        <h4>Autour des nœuds sélectionnés
          <span class="small muted">${noeudsActifs().map(n=>esc(NODE[n].label)).join(' + ')} — section C</span></h4>
        <div class="sugrid">${graphPicks.slice(0,8).map(s=>sugRow(s)).join('')}</div>
      </div>` : ''}
    ${edhrecHTML}
    ${sug.length ? TYPE_ORDER.filter(t => byType[t]).map(t => {
      const total = byType[t].length, max = Math.min(S.limiteType[t] || 6, total), reste = total - max;
      return `<div class="group"><h4>${t} <span class="small muted">${max} sur ${total}</span></h4>
        <div class="sugrid">${byType[t].slice(0,max).map(s=>sugRow(s)).join('')}</div>
        ${total > 6 ? `<div class="row" style="justify-content:center;gap:6px;margin-top:8px">
          ${reste > 0 ? `<button class="btn sm" data-act="pageType" data-type="${esc(t)}" data-pas="30">Afficher ${Math.min(30,reste)} de plus</button>` : ''}
          ${reste > 30 ? `<button class="btn sm" data-act="pageType" data-type="${esc(t)}" data-pas="tout">Tout afficher (${total})</button>` : ''}
          ${max > 6 ? `<button class="btn sm" data-act="pageType" data-type="${esc(t)}" data-pas="reduire">Réduire</button>` : ''}
        </div>` : ''}
      </div>`;
    }).join('')
      : '<div class="empty">Aucune suggestion. Ajoutez des cartes à la collection, élargissez les couleurs ou augmentez le budget.</div>'}
    ${(S.csb.status === 'cors' || S.csb.status === 'error') ? `<div class="small muted" style="margin-bottom:6px">
      Commander Spellbook injoignable (${esc(S.csb.error||'')}) : les étiquettes « combo » sont absentes.
      <span class="row" style="gap:6px;margin-top:4px">
        <input id="csbRelay" type="text" value="${esc(S.csbRelay)}" placeholder="relais éventuel, ex. https://corsproxy.io/?url={url}" style="flex:1;min-width:200px">
        <button class="btn sm" data-act="combos">Réessayer</button>
      </span></div>` : ''}
    <div class="small muted">Le score combine les branchements avec le deck (un effet produit ici déclenche une capacité là-bas), les rôles manquants, la courbe de mana et la densité de capacités. Les cartes hors collection sont pénalisées et limitées par le budget.
      <br>Pas de connexion à votre compte : Cardmarket n'ouvre plus son API aux nouvelles applications et interdit le partage d'identifiants, et une page web ne peut pas signer les requêtes OAuth sans exposer le secret. L'atelier s'appuie donc sur les prix Cardmarket publiés par Scryfall, et vous renvoie vers la fiche du site pour l'achat.</div>`;
  return {html, sug, graphPicks, edhrecPicks};
}

function visuelsSuggestions(byType, edhrecPicks) {
  if (!S.images) return;
  const vus = [];
  if (edhrecPicks && edhrecPicks.length) {
    vus.push(...edhrecPicks.slice(0, Math.min(S.limiteType['edhrec'] || 8, edhrecPicks.length)));
  }
  TYPE_ORDER.forEach(t => { if (byType[t]) vus.push(...byType[t].slice(0, Math.min(S.limiteType[t] || 6, byType[t].length))); });
  setTimeout(() => queueScryfall(vus.map(x => x.card)), 0);
  setTimeout(chargeVisuelsClasses, 0);
}

let visuelsEnCours = false;
const VISUELS_CHARGES = new Set();

function chargeVisuelsClasses() {
  if (visuelsEnCours || typeof document.querySelectorAll !== 'function') return;
  const attente = [...document.querySelectorAll('img.cimg[data-src]')];
  if (!attente.length) return;
  visuelsEnCours = true;
  let i = 0;
  const suivant = () => {
    if (i >= attente.length) { visuelsEnCours = false; return; }
    const lot = attente.slice(i, i + 6); i += 6;
    let restants = lot.length;
    const fini = () => { if (--restants <= 0) setTimeout(suivant, 60); };
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

function majHintF(sug, graphPicks, edhrecPicks) {
  const edhrecCount = (edhrecPicks && edhrecPicks.length) !== undefined ? edhrecPicks.length : sug.filter(x => x.edhrec).length;
  const hintEl = document.getElementById('hintF');
  if (hintEl) {
    hintEl.textContent = `${sug.length} pistes${graphPicks.length?` · ${graphPicks.length} via le graphe`:''}${edhrecCount?` · ${edhrecCount} sur EDHREC`:''}`;
  }
}

function refreshSuggestions() {
  const r = listeSuggestions();
  const liste = document.getElementById('sugList'); if (liste) liste.innerHTML = r.html;
  const bl = document.getElementById('budLine'); if (bl) bl.innerHTML = ligneBudget();
  const bb = document.getElementById('budBuys'); if (bb) bb.innerHTML = ligneAchats();
  majHintF(r.sug, r.graphPicks, r.edhrecPicks);
  renderTop();
}

function renderF() {
  const r = listeSuggestions();
  const bodyEl = document.getElementById('bodyF');
  if (bodyEl) {
    bodyEl.innerHTML = `${panneauEdhrec()}${panneauAchats()}<div id="sugList">${r.html}</div>`;
  }
  majHintF(r.sug, r.graphPicks, r.edhrecPicks);
  const secCmds = commandantsSecondaires();
  const cmdSig = (S.commander || '') + '::' + secCmds.map(c => c.name).sort().join('|');
  if (fmt().commander && (S.commander || secCmds.length) && typeof fetch === 'function'
     && S.edhrec.cmdSignature !== cmdSig && S.edhrec.status !== 'loading') {
    setTimeout(() => loadEdhrec(), 0);
  }
}
