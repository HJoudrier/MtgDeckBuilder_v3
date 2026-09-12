/* =====================================================================
   js/deck.js — Construction du deck, légalité, commandant & fiches détaillées
   ===================================================================== */

function deckEntries() {
  const out = [];
  S.deck.forEach((q, n) => {
    const c = find(n);
    if (c && q > 0) out.push({card:c, qty:q});
  });
  return out.sort((a, b) => TYPE_ORDER.indexOf(mainType(a.card)) - TYPE_ORDER.indexOf(mainType(b.card)) || a.card.cmc - b.card.cmc || a.card.name.localeCompare(b.card.name));
}

/* L'empreinte du deck, dont l'empreinte des suggestions se sert pour savoir si
   la notation vaut encore. */
function deckSignature() {
  return deckEntries().map(e => e.card.name + '×' + e.qty).sort().join('|') + '||' + (S.commander || '');
}

/* Les cartes du deck, une fois chacune. Deux clés de `S.deck` peuvent viser la
   même carte — un import l'a nommée autrement et `find()` la rattrape, avant
   que `mergeInto()` ne fusionne les deux entrées. Tout ce qui raisonne par
   carte, et non par exemplaire, passe par ici : sans quoi la même carte se
   compte deux fois, dans la courbe comme dans les branchements. */
function cartesDuDeck() {
  return [...new Map(deckEntries().map(e => [e.card.name, e.card])).values()];
}

function deckSize() {
  let n = 0;
  S.deck.forEach(q => n += q);
  return n;
}

function availableFor(card) {
  return (S.collection.get(card.name) || 0) - (S.deck.get(card.name) || 0);
}

/* =====================================================================
   Les listes annexes — réserve et étude. Mêmes gestes que le deck, mais
   à côté de lui : elles ne comptent ni dans la taille, ni dans la légalité,
   ni dans la courbe, ni dans les rôles, ni dans les achats. `ANNEXES`
   (js/etat.js) dit ce que chacune est ; ce qui suit ne connaît que leur clé.
   ===================================================================== */

/* Les Game Changers de la liste principale. Leur nombre décide du palier
   qu'un deck Commander peut revendiquer : aucun aux paliers 1 et 2, jusqu'à
   trois au palier 3, sans limite aux paliers 4 et 5. La réserve et l'étude
   n'y entrent pas — elles ne se jouent pas. */
function gameChangersDuDeck() {
  return deckEntries().filter(e => estGameChanger(e.card) === true);
}

/* Ce que ce décompte dit du palier, en une phrase. */
function ligneGameChangers() {
  if (!fmt().commander || !gameChangersConnus()) return '';
  const gc = gameChangersDuDeck();
  const n = gc.reduce((x, e) => x + e.qty, 0);
  if (!n) return '';
  return `<div class="small muted" style="margin:8px 0 0">
    ${n} carte(s) classée(s) <b style="color:#cba6e8">Game Changer</b> par Wizards :
    ${gc.map(e => esc(e.card.name)).join(', ')}.
    ${n > 3 ? 'Au-delà de trois, le deck relève des paliers 4 ou 5.'
            : 'Le palier 2 n\'en admet aucune, le palier 3 jusqu\'à trois.'}</div>`;
}

function targets() {
  const f = fmt(), k = f.size / 100;
  if (S.format === 'limite') return {terrains:17, creatures:15, interaction:4, pioche:2, ramp:1, tuteurs:0, wipe:0, protection:1};
  if (S.format === 'standard') return {terrains:24, creatures:18, interaction:8, pioche:6, ramp:2, tuteurs:1, wipe:2, protection:2};
  return {
    terrains:Math.round(36*k), creatures:Math.round(25*k), interaction:Math.round(9*k), pioche:Math.round(10*k),
    ramp:Math.round(10*k), tuteurs:Math.round(3*k), wipe:Math.round(2*k), protection:Math.round(3*k)
  };
}

function deckCounts() {
  const c = {};
  Object.keys(targets()).forEach(k => c[k] = 0);
  deckEntries().forEach(e => { e.card.cats.forEach(cat => { if (cat in c) c[cat] += e.qty; }); });
  return c;
}

function gauge(label, val, tgt, role) {
  const pct = Math.min(100, Math.round(val / Math.max(1, tgt) * 100));
  const col = val >= tgt ? 'var(--ok)' : (val >= tgt * 0.6 ? 'var(--warn)' : 'var(--bad)');
  const diff = val - tgt;
  const actif = rolesFiltre().includes(role);
  return `<button type="button" class="gauge ${actif?'actif':''}" data-act="toggleRole" data-role="${esc(role||'')}"
      aria-pressed="${actif}" title="${actif ? 'Retirer ce rôle des filtres' : 'Ne garder que les cartes tenant ce rôle, partout'}">
    <div class="top"><span>${label}</span><span class="mono">${val} / ${tgt} ${diff<0?`<span style="color:var(--bad)">${diff}</span>`:'<span style="color:var(--ok)">ok</span>'}</span></div>
    <div class="track"><div class="fill" style="width:${pct}%;background:${col}"></div></div></button>`;
}

function legality() {
  const f = fmt(), n = deckSize(), msgs = [];
  if (n > f.size) msgs.push(`${n-f.size} carte(s) de trop (${n}/${f.size}).`);
  if (n < f.size) msgs.push(`Il manque ${f.size-n} carte(s) pour atteindre ${f.size}.`);
  deckEntries().forEach(e => {
    if (e.qty > f.maxCopies && !/^Basic Land/i.test(e.card.type))
      msgs.push(`${e.card.name} : ${e.qty} copies pour ${f.maxCopies} autorisée(s).`);
  });
  if (f.commander && !S.commander) msgs.push('Aucun commandant désigné.');
  const jetons = deckEntries().filter(e => e.card.isToken);
  if (jetons.length) msgs.push(`${jetons.length} jeton(s) dans le deck (${jetons.slice(0,3).map(e=>e.card.name).join(', ')}) : un jeton ne se joue pas depuis la main.`);
  /* Le deck ne masque jamais une carte illégale — elle doit rester retirable —
     donc c'est ici qu'elle se signale. */
  const illegales = deckEntries().filter(e => carteLegale(e.card) === false);
  if (illegales.length) msgs.push(`${illegales.length} carte(s) non légale(s) en ${f.label} : ${
    illegales.slice(0,3).map(e => e.card.name).join(', ')}${illegales.length > 3 ? '…' : ''}.`);
  deckEntries().forEach(e => {
    const possede = S.collection.get(e.card.name) || 0;
    if (e.qty > possede && S.budget.total <= 0)
      msgs.push(`${e.card.name} : ${e.qty-possede} exemplaire(s) à acheter, alors que le budget est à zéro.`);
  });
  const panier = spent();
  if (panier > S.budget.total && S.budget.total > 0)
    msgs.push(`Cartes à acheter : ${eur(panier)} pour un budget de ${eur(S.budget.total)}.`);
  if (S.commander) {
    const cmd = find(S.commander);
    deckEntries().forEach(e => {
      const bad = e.card.identity.filter(c => !cmd.identity.includes(c));
      if (bad.length) msgs.push(`${e.card.name} sort de l'identité couleur du commandant (${bad.join('')}).`);
    });
  }
  if (S.format === 'perso') {
    'WUBRG'.split('').forEach(c => {
      if (!S.colors.has(c)) return;
      const n2 = deckEntries().filter(e => e.card.identity.includes(c)).reduce((a, e) => a + e.qty, 0);
      const l = S.custom.colorLimits[c];
      if (n2 < l.min) msgs.push(`Couleur ${c} : ${n2} carte(s) pour un minimum de ${l.min}.`);
      if (n2 > l.max) msgs.push(`Couleur ${c} : ${n2} carte(s) pour un maximum de ${l.max}.`);
    });
  }
  return msgs;
}

function addToDeck(name) {
  const c = find(name); if (!c) return;
  const f = fmt();
  /* La carte attendait dans une liste annexe : elle passe dans le deck avec
     ses exemplaires, plutôt que d'y être ajoutée une seconde fois. */
  const annexe = annexeDe(name);
  if (annexe) {
    const n = deplacerCarte(name, 'deck');
    if (!n) return;
    if (f.commander && !S.commander && c.isLegendaryCreature) S.commander = name;
    recalculerAvecProgression(`${name} ajoutée au deck : les suggestions sont renotées d'après le deck qui vient de changer.`);
    toast(`${name} ×${n} quitte ${ANNEXES[annexe].article} pour le deck.`);
    return;
  }
  const cur = S.deck.get(name) || 0;
  if (!/^Basic Land/i.test(c.type) && cur >= f.maxCopies) { toast(`${name} : limite de ${f.maxCopies} copie(s) atteinte.`); return; }
  const aPayer = availableFor(c) <= 0;
  S.deck.set(name, cur + 1);
  if (aPayer) {
    const prix = cmEstimate(c);
    toast(`${name} n'est pas dans votre collection : ajoutée au deck et comptée à l'achat${prix?` (≈ ${eur(prix)})`:''}.`);
  }
  if (f.commander && !S.commander && c.isLegendaryCreature) S.commander = name;
  recalculerAvecProgression(`${name} ajoutée au deck : les suggestions sont renotées d'après le deck qui vient de changer.`);
}

function deckAdd(card, qty, opts) {
  opts = opts || {};
  const f = fmt();
  /* Le deck l'emporte sur les listes annexes : une carte qui y entre quitte
     la réserve ou l'étude, les trois listes s'excluant. */
  const annexe = annexeDe(card.name);
  if (annexe) annexeListe(annexe).delete(card.name);
  let n = 0, achetees = 0;
  for (let i = 0; i < qty; i++) {
    const cur = S.deck.get(card.name) || 0;
    if (!opts.force && !/^Basic Land/i.test(card.type) && cur >= f.maxCopies) break;
    if (availableFor(card) <= 0) {
      if (opts.completer) S.collection.set(card.name, (S.collection.get(card.name) || 0) + 1);
      else achetees++;
    }
    S.deck.set(card.name, cur + 1);
    n++;
  }
  deckAdd.dernierAchat = achetees;
  return n;
}

function removeFromDeck(name) {
  const cur = S.deck.get(name) || 0;
  if (cur <= 1) {
    S.deck.delete(name);
    if (S.commander === name) S.commander = null;
  } else S.deck.set(name, cur - 1);
  recalculerAvecProgression(`${name} retirée du deck : les suggestions sont renotées d'après le deck qui vient de changer.`);
}

function buyCard(name) {
  if (S.budget.total <= 0 || S.budget.perCard <= 0) {
    toast('Budget à zéro : aucun achat possible. Augmentez le budget dans la fenêtre « Achats sur Cardmarket », par la pastille « Budget » de l\'en-tête.');
    return;
  }
  const c = find(name);
  const o = bestOffer(c);
  if (!o) { toast("Aucune offre ne passe vos filtres d'état, de langue ou de prix maximum."); return; }
  if (spent() + o.price > S.budget.total) { toast('Budget dépassé. Augmentez-le, ou retirez une carte à acheter du deck.'); return; }
  deckAdd(c, 1, {force:true});
  recalculerAvecProgression(`${name} ajoutée au deck : les suggestions sont renotées d'après le deck qui vient de changer.`);
  toast(`${name} ajoutée au deck, comptée à l'achat : ${eur(o.price)} estimés (${o.condition} ou mieux, ${o.lang}).`);
}

function blocAchats() {
  const lignes = aAcheter();
  if (!lignes.length) return '';
  const total = lignes.reduce((t, l) => t + l.total, 0);
  const nb = lignes.reduce((n, l) => n + l.qty, 0);
  const budget = S.budget.total;
  const depasse = budget > 0 && total > budget;
  return `<div class="group" style="border-color:${depasse?'var(--bad)':'var(--brass-d)'};margin-top:10px">
    <h4>À acheter <span class="small muted">${nb} exemplaire(s) absents de votre collection · ${eur(total)} estimés</span></h4>
    ${budget > 0
      ? `<div class="track" style="margin:2px 0 8px"><div class="fill" style="width:${Math.min(100,Math.round(total/budget*100))}%;background:${depasse?'var(--bad)':'var(--ok)'}"></div></div>
         <div class="small ${depasse?'':'muted'}" style="margin-bottom:6px">${depasse
            ? `Dépassement de ${eur(total-budget)} sur un budget de ${eur(budget)}.`
            : `Budget de ${eur(budget)} · reste ${eur(budget-total)}.`}</div>`
      : `<div class="small" style="margin-bottom:6px">Aucun budget défini : ces cartes sont dans le deck mais ne sont pas encore chiffrées comme achat autorisé. La pastille « Budget » de l'en-tête ouvre de quoi en fixer un.</div>`}
    <div class="list">${lignes.slice(0, 12).map(l => `
      <div class="lrow">
        <span class="dot" style="background:${stripeColor(l.card)}"></span>
        <span class="cname">${esc(l.card.name)}</span>
        <span class="mono small">×${l.qty}</span>
        <span class="mono small buy">${l.inconnu?'prix inconnu':`≈ ${eur(l.total)}`}</span>
        <a class="btn sm" href="${esc(cmLink(l.card))}" target="_blank" rel="noopener">Cardmarket ↗</a>
        <button class="btn sm" data-act="fromDeck" data-name="${esc(l.card.name)}" title="Retirer un exemplaire">−</button>
        <button class="btn sm" data-act="ownIt" data-name="${esc(l.card.name)}" title="Je la possède déjà : ajouter à la collection">✓</button>
      </div>`).join('')}</div>
    ${lignes.length > 12 ? `<div class="small muted" style="margin-top:6px">et ${lignes.length-12} autre(s).</div>` : ''}
    <div class="row" style="margin-top:8px"><button class="btn sm" data-act="wants">Exporter la liste de wants Cardmarket</button></div>
  </div>`;
}

function zoneCommandant() {
  const cmd = S.commander ? find(S.commander) : null;
  const eligibles = commandantsPossibles();
  const choix = `<select data-act="chooseCmd" style="max-width:100%">
      <option value="">${cmd?'— changer de commandant —':'— choisir parmi les créatures légendaires du deck —'}</option>
      ${eligibles.filter(c=>!cmd||c.name!==cmd.name).map(c=>`<option value="${esc(c.name)}">${esc(c.name)}</option>`).join('')}
    </select>`;
  if (!cmd) {
    return `<div class="cmdbox">
      <div class="vide">emplacement<br>commandant</div>
      <div class="corps">
        <h3 style="font-size:15px">Aucun commandant désigné</h3>
        <div class="small muted" style="margin:4px 0 8px">${eligibles.length
          ? `${eligibles.length} créature(s) légendaire(s) dans le deck peuvent occuper la place. Le bouton ★ sur une carte fait la même chose.`
          : "Aucune créature légendaire dans le deck. Ajoutez-en une, ou changez de format depuis la pastille « Format » de l'en-tête."}</div>
        ${eligibles.length ? choix : ''}
      </div></div>`;
  }
  const ident = cmd.identity.length ? cmd.identity : ['C'];
  const horsIdentite = deckEntries().filter(e => e.card.identity.some(x => !cmd.identity.includes(x))).length;
  return `<div class="cmdbox">
    ${(cmd.imgL || cmd.imgN || cmd.img)
      ? `<img class="visu" src="${esc(cmd.imgL||cmd.imgN||cmd.img)}" alt="${esc(cmd.name)}">`
      : `<div class="vide">${esc(cmd.name)}</div>`}
    <div class="corps">
      <h3 style="font-size:16px">${esc(cmd.name)}</h3>
      <div class="small muted">${esc(cmd.type)} · CMC ${cmd.cmc}</div>
      <div class="row" style="gap:4px;margin:6px 0">
        ${ident.map(c => symIcon(c, 'sm')).join('')}
        <span class="small muted">identité couleur${horsIdentite ? ` · ${horsIdentite} carte(s) du deck en dehors` : ' respectée par tout le deck'}</span>
      </div>
      <div class="row" style="gap:6px;margin-bottom:6px">
        <button class="btn sm" data-act="fiche" data-name="${esc(cmd.name)}">Fiche</button>
        <button class="btn sm" data-act="cmdColors">Aligner les filtres couleur</button>
        <button class="btn sm" data-act="unsetCmd">Retirer le rôle</button>
        <button class="btn sm danger" data-act="deckDrop" data-name="${esc(cmd.name)}">Retirer du deck</button>
      </div>
      ${eligibles.length > 1 ? choix : ''}
    </div></div>`;
}

let NOTES_DECK = new Map();

function evalueDeck(entries) {
  NOTES_DECK = new Map();
  if (!entries.length) return;
  const X = contexteEvaluation();
  entries.forEach(e => {
    const n = noteCarte({card:e.card, source:'deck'}, X);
    if (n) NOTES_DECK.set(e.card.name, n);
  });
}

/* =====================================================================
   Les trois parties repliables de la section : la liste principale, la
   réserve, l'étude. Une carte y est vite longue, et l'une des trois suffit
   souvent : le titre reste lisible plié, avec le résumé qui dit ce que la
   partie contient. Le pli se retient d'une séance à l'autre (`S.deckPlie`,
   enregistré comme le reste des préférences) et se bascule sans rien
   recalculer — le rendu du deck note toutes ses cartes, ce serait payer une
   notation pour un simple pli.
   ===================================================================== */

function partieDeck(cle, titre, resume, corps, classe) {
  const ouverte = !S.deckPlie.has(cle);
  return `<div class="partie ${ouverte ? 'ouverte' : ''}${classe ? ' ' + classe : ''}" id="partie-${cle}">
    <button type="button" class="partie-tete" data-act="plierPartie" data-partie="${cle}"
        aria-expanded="${ouverte}" aria-controls="corps-${cle}"
        title="${ouverte ? 'Replier cette partie' : 'Déplier cette partie'}">
      <span class="chev-partie" aria-hidden="true">›</span>
      <h3>${titre}</h3>
      ${resume ? `<span class="small muted">${resume}</span>` : ''}
    </button>
    <div class="partie-corps" id="corps-${cle}">${corps}</div>
  </div>`;
}

/* Une des deux listes annexes, rendue comme le deck : mêmes tuiles, mêmes
   filtres d'en-tête — ce qu'ils masquent est annoncé plutôt que tu. */
function blocAnnexe(cle) {
  const a = ANNEXES[cle];
  const toutes = annexeEntries(cle);
  const entries = toutes.filter(e => carteFiltree(e.card));
  const n = toutes.reduce((x, e) => x + e.qty, 0);
  const masquees = n - entries.reduce((x, e) => x + e.qty, 0);
  const valeur = toutes.reduce((x, e) => x + (e.card.price || 0) * e.qty, 0);

  const corps = `<div class="small muted" style="margin-bottom:6px">${esc(a.aide)}</div>
    <div class="row" style="margin-bottom:8px">
      <button class="btn sm" data-act="addCard" data-cible="${cle}">Ajouter</button>
      ${n ? `<button class="btn sm danger" data-act="clearAnnexe" data-liste="${cle}">Vider</button>` : ''}
    </div>
    ${entries.length
      ? rendGroupes('deck', groupeCartes(entries, S.groupes.deck, S.tris.deck), S.groupes.deck,
          ents => S.view === 'grid' ? `<div class="grid">${ents.map(e => cardTile(e, cle)).join('')}</div>`
                                    : `<div class="list">${ents.map(e => cardRow(e, cle)).join('')}</div>`,
          g => g.entrees.reduce((x, e) => x + e.qty, 0))
      : `<div class="empty">${n ? `Les filtres de l'en-tête masquent les ${n} carte(s) de cette liste.` : esc(a.vide)}</div>`}`;

  return partieDeck(cle,
    `${esc(a.titre)} <span class="small muted">${esc(a.anglais)}</span>`,
    `${n} carte(s)${n ? ` · ${eur(valeur)}` : ''}${masquees ? ` · ${masquees} masquée(s) par les filtres` : ''}`,
    corps, 'group');
}

function renderE() {
  const toutes = deckEntries(), n = deckSize(), f = fmt(), cnt = deckCounts(), tgt = targets();
  evalueDeck(toutes);
  // Les filtres de l'en-tête valent aussi pour le deck : liste affichée,
  // courbe de mana et moyennes. La taille, la conformité et l'équilibre
  // des rôles restent ceux du deck entier.
  const entries = toutes.filter(e => carteFiltree(e.card));
  const masquees = toutes.reduce((a, e) => a + e.qty, 0) - entries.reduce((a, e) => a + e.qty, 0);
  const cmcSplit = {};
  entries.forEach(e => {
    if (e.card.isLand) return;
    const k = Math.min(e.card.cmc, 9);
    cmcSplit[k] = cmcSplit[k] || {W:0, U:0, B:0, R:0, G:0, C:0};
    (e.card.identity.length ? e.card.identity : ['C']).forEach(col => cmcSplit[k][col] += e.qty / (e.card.identity.length || 1));
  });
  const nonland = entries.filter(e => !e.card.isLand);
  const avg = nonland.length ? (nonland.reduce((a, e) => a + e.card.cmc * e.qty, 0) / nonland.reduce((a, e) => a + e.qty, 0)) : 0;
  const price = entries.reduce((a, e) => a + e.card.price * e.qty, 0);
  const msgs = legality();
  /* Le rangement de la section, réglé par la barre ci-dessous et partagé par
     la liste principale comme par la réserve et l'étude. */
  const mode = S.groupes.deck;
  const groupes = groupeCartes(entries, mode, S.tris.deck);

  const bodyEl = document.getElementById('bodyE');
  if (bodyEl) {
    bodyEl.innerHTML = `
      <div class="row" style="margin-bottom:10px">
        ${masquees ? `<button type="button" class="pill head-format" data-act="filtres" title="Les filtres de l'en-tête masquent une partie du deck (cliquer pour les modifier)" style="border-color:var(--brass-d);color:var(--brass)">Filtrées <b>${n - masquees}</b> · ${masquees} masquée(s)</button>` : ''}
        <span class="pill" title="${masquees ? 'Cartes affichées seulement' : 'Deck entier'}">CMC moyen <b>${avg.toFixed(2)}</b></span>
        <span class="pill" title="${masquees ? 'Cartes affichées seulement' : 'Deck entier'}">Valeur <b>${eur(price)}</b></span>
        ${(() => {
          if (!fmt().commander || !gameChangersConnus()) return '';
          const gc = gameChangersDuDeck();
          const q = gc.reduce((x, e) => x + e.qty, 0);
          return `<span class="pill" style="${q ? 'border-color:#8a5fb0;color:#cba6e8' : ''}" title="${q
            ? `Cartes classées « Game Changer » par Wizards : ${esc(gc.map(e => e.card.name).join(', '))}. Le palier 2 n'en admet aucune, le palier 3 jusqu'à trois, les paliers 4 et 5 sans limite.`
            : 'Aucune carte classée « Game Changer » : le deck reste compatible avec les paliers 1 et 2 du Commander.'}">Game changers <b>${q}</b></span>`;
        })()}
        ${CLES_ANNEXES.map(cle => { const q = annexeSize(cle); return q
          ? `<span class="pill" title="${esc(ANNEXES[cle].aide)} Hors de la liste principale.">${esc(ANNEXES[cle].titre)} <b>${q}</b></span>` : ''; }).join('')}
        ${(() => {
          const a = aAcheter();
          const qte = a.reduce((x, l) => x + l.qty, 0);
          return qte ? `<button type="button" class="pill" data-act="wants" style="border-color:var(--bad);cursor:pointer" title="Cartes à acquérir : cliquer pour ouvrir la Wants list Cardmarket"><span class="dot" style="background:var(--bad)"></span> ${qte} à acheter · ${eur(spent())}</button>` : '';
        })()}
        <div class="seg" style="margin-left:auto">
          <button data-view="grid" aria-pressed="${S.view==='grid'}">Grille</button>
          <button data-view="list" aria-pressed="${S.view==='list'}">Liste</button>
        </div>
        ${barreGroupeTri('deck')}
        <button class="btn" data-act="addCard" data-cible="deck">Ajouter</button>
        <button class="btn" data-act="import" data-cible="deck">Importer MTGO</button>
        <button class="btn" data-act="exportDeck">Exporter</button>
        <button class="btn danger" data-act="clearDeck">Vider le deck</button>
      </div>
      ${msgs.length ? `<div class="warnbox"><b>À corriger</b><ul style="margin:5px 0 0 16px;padding:0">${msgs.slice(0,6).map(m=>`<li>${esc(m)}</li>`).join('')}</ul></div>` : `<div class="warnbox" style="border-color:#2f6b46;background:rgba(79,159,104,.1)">Le deck respecte les contraintes du format.</div>`}
      ${ligneGameChangers()}
      ${f.commander ? zoneCommandant() : ''}
      ${blocAchats()}
      <h3 style="margin:12px 0 6px;font-size:15px">Courbe de mana</h3>
      ${histogram(cmcSplit, true)}
      <h3 style="margin:14px 0 6px;font-size:15px">Équilibre des rôles</h3>
      <div class="statgrid">${Object.keys(tgt).map(k => gauge(CATLABEL[k]||k, cnt[k]||0, tgt[k], k)).join('')}</div>
      ${partieDeck('liste', 'Liste',
        `${n} carte(s)${masquees ? ` · ${masquees} masquée(s) par les filtres` : ''}${price ? ` · ${eur(price)}` : ''}${noteMultiple(mode)}`,
        entries.length ? rendGroupes('deck', groupes, mode, ents => S.view==='grid'
          ? `<div class="grid">${ents.map(e=>cardTile(e,'deck')).join('')}</div>`
          : `<div class="list">${ents.map(e=>cardRow(e,'deck')).join('')}</div>`,
          g => g.entrees.reduce((a,e)=>a+e.qty,0))
        : (n ? `<div class="empty">Les filtres de l'en-tête masquent les ${n} carte(s) du deck. Élargissez-les ou effacez-les pour revoir la liste.</div>`
             : '<div class="empty">Le deck est vide. Ajoutez des cartes depuis la collection (▲) ou depuis <button type="button" class="btn sm" data-onglet="catalogue">les suggestions du catalogue</button>.</div>'))}
      <h3 style="margin:16px 0 6px;font-size:15px">Hors de la liste principale</h3>
      <div class="small muted">Deux listes tenues à côté du deck. Ce qu'elles portent ne compte ni dans la taille du deck,
        ni dans sa conformité, ni dans sa courbe, ses rôles ou ses achats. Une carte ne vit que dans l'une des trois listes :
        l'envoyer ici la retire du deck, la remonter (▲) l'y ramène. La fiche d'une carte — qu'ouvre un clic sur elle —
        porte les mêmes gestes, et fait passer une carte d'une liste à l'autre.</div>
      ${CLES_ANNEXES.map(blocAnnexe).join('')}`;
  }

  const hintEl = document.getElementById('hintE');
  const horsListe = CLES_ANNEXES.map(cle => [ANNEXES[cle].titre.toLowerCase(), annexeSize(cle)]).filter(([, q]) => q);
  if (hintEl) hintEl.textContent = `${n}/${f.size}${horsListe.length ? ` · ${horsListe.map(([t, q]) => `${t} ${q}`).join(' · ')}` : ''}`;
  setTimeout(() => queueScryfall(entries.concat(...CLES_ANNEXES.map(annexeEntries)).map(e => e.card)), 0);
}
