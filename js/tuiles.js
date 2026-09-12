/* =====================================================================
   js/tuiles.js — Les rendus d'une carte dans une liste

   Vignette et ligne : les deux façons dont une carte paraît dans une liste, avec
   ses étiquettes — illégale au format, Game Changer — et les gestes des listes
   annexes. Les propositions ont les leurs, qui portent en plus la note et ce
   qui la justifie. Aucune n'offre de bouton pour la fiche : le clic sur la
   carte y mène déjà.
   ===================================================================== */

/* Le tag « illégal », partout où une carte s'affiche. Vide tant que la carte
   est légale ou que sa légalité nous échappe. */
function tagIllegal(card) {
  if (carteLegale(card) !== false) return '';
  return `<span class="tag" style="border-color:var(--bad);color:var(--bad-txt)"
    title="Cette carte n'a pas le droit d'être jouée en ${esc(fmt().label)}.">illégal</span>`;
}

/* Le tag des Game Changers : la liste de Wizards pour les paliers du
   Commander. Il vaut partout où la carte s'affiche — c'est une propriété de
   la carte, pas du deck —, et se tait tant que la liste n'est pas chargée. */
function tagGameChanger(card) {
  if (estGameChanger(card) !== true) return '';
  return `<span class="tag" style="border-color:var(--gc);color:var(--gc-txt);background:var(--gc-bg)"
    title="Carte classée « Game Changer » par Wizards : sa présence hausse le palier d'un deck Commander. Le palier 2 n'en admet aucune, le palier 3 jusqu'à trois, les paliers 4 et 5 sans limite.">game changer</span>`;
}

/* Ce que le deck a déjà pris. L'étiquette ne paraît que dans la collection :
   au deck elle serait vraie de toutes les cartes et n'apprendrait rien, et les
   listes annexes ont la leur. Le contexte est donc lu ici plutôt qu'aux deux
   appels — la vignette et la ligne ne peuvent pas en juger différemment.

   Le titre dit la part montée sur le total possédé, parce que c'est la question
   suivante : reste-t-il un exemplaire à jouer ? */
function tagDeck(card, ctx) {
  if (ctx !== 'collection') return '';
  const n = S.deck.get(card.name) || 0;
  if (!n) return '';
  const ai = S.collection.get(card.name) || 0;
  const reste = ai - n;
  const aide = `${n} exemplaire(s) dans le deck sur ${ai} possédé(s)`
    + (reste > 0 ? ` — il en reste ${reste} de disponible(s).` : ' — aucun ne reste disponible.');
  return `<span class="tag" style="border-color:var(--ok);color:var(--ok-txt);background:var(--ok-bg)"
    title="${esc(aide)}">dans le deck${n > 1 ? ` ×${n}` : ''}</span>`;
}

/* Les gestes d'une carte garée dans une liste annexe : la remonter au deck,
   la passer à l'autre liste, ou l'en retirer. Le pied d'une tuile ne tient
   que trois boutons — un de plus déborde sur la tuile voisine, qui vole
   alors le clic —, donc la bascule d'une liste à l'autre n'y figure pas :
   elle reste au mode liste, plus large, et à la fiche. */
function actesAnnexe(c, cle, avecBascule) {
  const autre = CLES_ANNEXES.find(k => k !== cle);
  return `<button class="btn sm" data-act="toDeck" data-name="${esc(c.name)}" title="Remonter dans le deck">▲</button>
    ${avecBascule && autre ? `<button class="btn sm" data-act="toAnnexe" data-liste="${autre}" data-name="${esc(c.name)}" title="${esc(ANNEXES[autre].poser)}">⇄</button>` : ''}
    <button class="btn sm" data-act="dropAnnexe" data-liste="${cle}" data-name="${esc(c.name)}" title="Retirer un exemplaire de ${esc(ANNEXES[cle].article)}">−</button>`;
}

/* Les deux rendus d'une carte — vignette et ligne — n'offrent pas de bouton
   vers la fiche : un clic sur la vignette, ou n'importe où sur la ligne,
   l'ouvre déjà (js/app.js, la branche des éléments porteurs de `data-card`).
   Le bouton « i » doublait ce geste et prenait la place des actions qui, elles,
   n'ont pas d'équivalent ailleurs. */
function cardTile(e, ctx) {
  const c = e.card, dispo = availableFor(c), inDeck = S.deck.get(c.name) || 0;
  const isCmd = S.commander === c.name;
  const img = c.imgN || c.img;
  const note = ctx === 'deck' ? NOTES_DECK.get(c.name) : null;
  const face = faceVisible(c);
  const isHors = dispo < 0 || (S.collection.get(c.name) || 0) <= 0;

  /* Le tag d'illégalité vaut dans tous les contextes : la collection comme
     le deck. Les autres tags restent propres au deck, qui seul les calcule. */
  const tagsDeck = (ctx === 'deck' && note) ? (() => {
    const n = nbInteractions(note), larges = nbCartesLarges(note), liens = nbLiens(note);
    return [
      (n || larges) ? `<span class="tag" style="border-color:var(--brass);color:var(--brass)" title="${n} carte(s) du deck avec lesquelles elle interagit précisément (${liens} lien(s) d'effets)${larges ? ` — et ${larges} autre(s) que seul un déclencheur large relie : ${libelleFamillesLarges(note.larges)}, que tout le deck alimente` : ''}">${n}${larges ? ` (+${larges})` : ''} interaction${n + larges > 1 ? 's' : ''}</span>` : '',
      isHors ? `<span class="tag" style="border-color:var(--bad);color:var(--bad-txt)">hors collection</span>` : '',
      note.edhrec ? `<span class="tag" style="border-color:var(--edh);color:var(--edh)" title="Taux d'inclusion dans les decks de ce commandant, et synergie par rapport aux autres decks de la même identité couleur">edhrec ${Math.round(note.edhrec.inclusion*100)} % / ${note.edhrec.synergy>=0?'+':'−'}${Math.abs(Math.round(note.edhrec.synergy*100))} %</span>` : ''
    ].filter(Boolean).join('');
  })() : '';
  /* Le tag de liste annexe suit la carte partout sauf dans la liste
     elle-même, où il n'apprendrait rien. */
  const tags = tagIllegal(c) + tagGameChanger(c) + tagsDeck + tagDeck(c, ctx)
    + (ANNEXES[ctx] ? '' : tagAnnexe(c));
  const tagsHTML = tags ? `<div class="tags">${tags}</div>` : '';

  const scoreHTML = (ctx === 'deck' && note)
    ? `<div class="score-line mono small muted" title="${esc((note.reasons||[]).slice(0,3).join(' · '))}">score ${note.score.toFixed(1)}</div>`
    : '';

  return `<div class="cardT card ${img?'withimg':''} ${dispo<=0?'zero':''} ${isCmd?'cmd':''} ${ctx==='deck'&&dispo<0?'achat':''} ${ctx==='collection'&&inDeck>0?'audeck':''}" data-card="${esc(c.name)}" data-ctx="${ctx}">
    ${isCmd ? `<span class="cmdbadge">Commandant</span>` : ''}
    ${img ? `<div class="imgwrap">
      <img class="cimg" src="${esc(face)}" alt="${esc(c.name)}" loading="lazy" decoding="async">
      ${aDeuxFaces(c) ? `<button type="button" class="badge" data-act="flip" data-name="${esc(c.name)}" title="Afficher l'autre face">↻ Face</button>` : ''}
    </div>` : `<div class="cname">${esc(c.name)}</div>`}
    ${scoreHTML}
    ${tagsHTML}
    <div class="foot bot">
      <span>${ctx==='collection'?`${e.qty} ex.`:`×${e.qty}`}</span>
      <span class="mono">${eur(c.price)}</span>
      <div class="qty acts" style="margin-left:auto">
        ${ctx==='collection'
          ? `<button class="btn sm" data-act="toDeck" data-name="${esc(c.name)}" title="Ajouter au deck">▲</button>`
          : ANNEXES[ctx]
          ? actesAnnexe(c, ctx)
          : `<button class="btn sm" data-act="fromDeck" data-name="${esc(c.name)}" title="Retirer du deck">−</button>
             ${fmt().commander && c.isLegendaryCreature ? `<button class="btn sm ${isCmd?'pri':''}" data-act="${isCmd?'unsetCmd':'setCmd'}" data-name="${esc(c.name)}" title="${isCmd?'Commandant actuel':'Désigner comme commandant'}">★</button>` : ''}`}
      </div>
    </div>
  </div>`;
}

function cardRow(e, ctx) {
  const c = e.card, dispo = availableFor(c), isCmd = S.commander === c.name;
  const inDeck = S.deck.get(c.name) || 0;
  const note = ctx === 'deck' ? NOTES_DECK.get(c.name) : null;
  const scoreBadge = note ? `<span class="mono small muted" style="margin-left:auto;margin-right:8px" title="${esc((note.reasons||[]).slice(0,3).join(' · '))}">score ${note.score.toFixed(1)}</span>` : '';
  const dispoBadge = ctx === 'deck' && dispo < 0 ? `<span class="achatbadge" style="position:static;margin-left:6px">à acheter (${-dispo})</span>` : '';

  return `<div class="lrow ${dispo<=0?'zero':''} ${isCmd?'cmd':''} ${ctx==='deck'&&dispo<0?'achat':''} ${ctx==='collection'&&inDeck>0?'audeck':''}" data-card="${esc(c.name)}" data-ctx="${ctx}">
    <span class="cname" data-act="fiche" data-name="${esc(c.name)}">${esc(c.name)}</span>
    <span class="costs">${manaHTML(c, true)}</span>
    <span class="small muted" style="max-width:200px;overflow:hidden;text-overflow:ellipsis">${esc(c.type)}</span>
    ${tagIllegal(c)}${tagGameChanger(c)}${tagDeck(c, ctx)}
    ${c.set ? `<span class="mono small muted" title="Édition ${esc(c.setName || c.set)}${c.num?`, carte n°${esc(c.num)}`:''}">${esc(c.set)}${c.num?` ${esc(c.num)}`:''}</span>` : ''}
    <span class="mono small">${eur(c.price)}</span>
    <span class="mono small">${ctx==='collection'?`${e.qty} ex.`:`×${e.qty}`}</span>
    ${dispoBadge}
    ${scoreBadge}
    <div class="acts qty" style="margin-left:${note||dispoBadge?'6px':'auto'}">
      ${ctx==='collection'
        ? `<button class="btn sm" data-act="toDeck" data-name="${esc(c.name)}" title="Ajouter au deck">▲</button>`
        : ANNEXES[ctx]
        ? actesAnnexe(c, ctx, true)
        : `<button class="btn sm" data-act="fromDeck" data-name="${esc(c.name)}" title="Retirer">−</button>
           ${fmt().commander && c.isLegendaryCreature ? `<button class="btn sm ${isCmd?'pri':''}" data-act="${isCmd?'unsetCmd':'setCmd'}" data-name="${esc(c.name)}" title="Commandant">★</button>` : ''}`}
    </div>
  </div>`;
}

function customPanel() {
  if (S.format !== 'perso') return '';
  const rows = 'WUBRG'.split('').map(c => `
    <div class="crow">
      <span class="dot" style="background:var(--${c})"></span>
      <b>${c}</b>
      <label class="lab">min</label><input type="number" min="0" max="200" value="${S.custom.colorLimits[c].min}" data-clim="${c}" data-k="min">
      <label class="lab">max</label><input type="number" min="0" max="200" value="${S.custom.colorLimits[c].max}" data-clim="${c}" data-k="max">
    </div>`).join('');

  return `<div class="group" style="margin-top:12px">
    <h4>Format personnalisé</h4>
    <div class="row">
      <div class="field"><label class="lab" for="cSz">Taille du deck</label><input id="cSz" type="number" min="10" max="500" value="${S.custom.deckSize}" data-cst="deckSize" style="width:80px"></div>
      <div class="field"><label class="lab" for="cCp">Exemplaires max</label><input id="cCp" type="number" min="1" max="99" value="${S.custom.maxCopies}" data-cst="maxCopies" style="width:80px"></div>
      <div class="field"><label class="lab" for="cCm">Commandant</label><input id="cCm" type="checkbox" ${S.custom.commander?'checked':''} data-cst="commander"></div>
    </div>
    <div class="small muted" style="margin:6px 0 4px">Fourchettes de cartes par couleur dans le deck :</div>
    ${rows}
  </div>`;
}

/* Ce qu'EDHREC dit d'une proposition : son taux d'inclusion dans les decks du
   commandant et sa synergie, ou le commandant secondaire qui la recommande. */
function tagEdhrec(s) {
  if (!s.edhrec) return '';
  const pct = Math.round(s.edhrec.inclusion * 100);
  const syn = (s.edhrec.synergy >= 0 ? '+' : '−') + Math.abs(Math.round(s.edhrec.synergy * 100)) + ' %';
  const secs = s.edhrec.secondaires || [];
  if (s.edhrec.role !== 'principal')
    return `<span class="tag" style="border-color:var(--edh-d);color:var(--edh-txt);background:var(--edh-bg)" title="EDHREC (Commandant secondaire ${esc(s.edhrec.commandant)}) : inclusion ${pct} %, synergie ${syn}">★ ${esc(s.edhrec.commandant)} ${pct} %</span>`;
  const secTxt = secs.length ? ` (+${secs.length} 2nd)` : '';
  const secTitle = secs.length ? ` · Également recommandé par : ${secs.map(x => x.commandant).join(', ')}` : '';
  return `<span class="tag" style="border-color:var(--edh);color:var(--edh)" title="EDHREC (${esc(s.edhrec.commandant)}) : inclusion ${pct} %, synergie ${syn}${secTitle}">edhrec ${pct} % / ${syn}${secTxt}</span>`;
}

/* Ce qu'une proposition dit d'elle-même : ses interactions avec le deck, sa
   légalité, son appartenance à la collection, ce qu'EDHREC en pense. La
   vignette et la ligne montrent les mêmes — c'est la carte qui les porte, non
   la façon dont on la regarde. */
function tagsSuggestion(s, edhrecTag) {
  const n = nbInteractions(s), larges = nbCartesLarges(s), liens = nbLiens(s);
  return [
    (n || larges) ? `<span class="tag" style="border-color:var(--brass);color:var(--brass)" title="${n} carte(s) du deck avec lesquelles elle interagit précisément (${liens} lien(s) d'effets)${larges ? ` — et ${larges} autre(s) que seul un déclencheur large relie : ${libelleFamillesLarges(s.larges)}, que tout le deck alimente` : ''}">${n}${larges ? ` (+${larges})` : ''} interaction${n + larges > 1 ? 's' : ''}</span>` : '',
    tagIllegal(s.card),
    tagGameChanger(s.card),
    s.source !== 'collection' ? `<span class="tag" style="border-color:var(--bad);color:var(--bad-txt)">hors collection</span>` : '',
    tagAnnexe(s.card),
    edhrecTag
  ].filter(Boolean).join('');
}

/* Le bouton du pied d'une proposition : l'ajouter au deck, ou l'acheter quand
   elle n'est pas dans la collection et qu'une offre la porte. */
function acteSuggestion(s) {
  return `<button class="btn sm ${s.source === 'achat' ? '' : 'pri'}"
    data-act="${s.source === 'achat' ? 'buy' : 'toDeck'}" data-name="${esc(s.card.name)}">
    ${s.source === 'achat' ? 'Acheter' : 'Ajouter'}</button>`;
}

/* La vignette d'une proposition : la carte, sa note et ce qui la justifie —
   ses interactions, ce qu'EDHREC en dit, son prix. Elle ne paraît que dans les
   trois sections des propositions, qui seules ont un score à montrer. */
function sugRow(s) {
  const c = s.card, n = nbInteractions(s);
  const inDeck = S.deck.get(c.name) || 0;
  const img = c.imgN || c.img;
  const prix = (s.source === 'achat' && s.offer && s.offer.price) ? s.offer.price : c.price;

  const tags = tagsSuggestion(s, tagEdhrec(s));

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
      <span style="margin-left:auto">${acteSuggestion(s)}</span>
    </div>
  </div>`;
}

/* La ligne d'une proposition : la même carte, lue en ligne. Les trois sections
   des propositions n'avaient que leurs vignettes — trois cents visuels pour
   parcourir un classement, là où une ligne par carte tient dix fois plus de
   monde à l'écran et se compare d'un coup d'œil. Elle reprend la ligne d'une
   carte (`cardRow`) et lui ajoute ce qui appartient à une proposition : ses
   étiquettes, sa note, son bouton. */
function sugLigne(s) {
  const c = s.card, n = nbInteractions(s);
  const inDeck = S.deck.get(c.name) || 0;
  const prix = (s.source === 'achat' && s.offer && s.offer.price) ? s.offer.price : c.price;
  return `<div class="lrow ${n ? 'lie' : ''} ${s.source !== 'collection' ? 'hors' : ''}"
      data-card="${esc(c.name)}" data-ctx="suggestion" title="Cliquez pour la fiche complète">
    <span class="cname" data-act="fiche" data-name="${esc(c.name)}">${esc(c.name)}</span>
    <span class="costs">${manaHTML(c, true)}</span>
    <span class="small muted" style="max-width:180px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${esc(c.type)}</span>
    <span class="tags">${tagsSuggestion(s, tagEdhrec(s))}</span>
    <span class="mono small muted" style="margin-left:auto">score ${s.score.toFixed(1)}</span>
    ${inDeck ? `<span class="mono small" title="${inDeck} exemplaire(s) dans le deck">×${inDeck}</span>` : ''}
    <span class="mono small">${s.source === 'achat' ? '≈ ' : ''}${eur(prix)}</span>
    <div class="acts qty" style="margin-left:0">${acteSuggestion(s)}</div>
  </div>`;
}
