/* =====================================================================
   js/deckSection.js — La section Deck

   Le commandant en tête, les achats, les jauges de rôle, puis la liste
   principale et les deux annexes, chacune repliable. `evalueDeck()` note les
   cartes montées une fois par rendu : la fiche et les pastilles s'en servent
   ensuite sans recalculer.
   ===================================================================== */

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
