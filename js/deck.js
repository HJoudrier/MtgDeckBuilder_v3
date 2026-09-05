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

function deckSize() {
  let n = 0;
  S.deck.forEach(q => n += q);
  return n;
}

function availableFor(card) {
  return (S.collection.get(card.name) || 0) - (S.deck.get(card.name) || 0);
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
  const cur = S.deck.get(name) || 0;
  if (!/^Basic Land/i.test(c.type) && cur >= f.maxCopies) { toast(`${name} : limite de ${f.maxCopies} copie(s) atteinte.`); return; }
  const aPayer = availableFor(c) <= 0;
  S.deck.set(name, cur + 1);
  if (aPayer) {
    const prix = cmEstimate(c);
    toast(`${name} n'est pas dans votre collection : ajoutée au deck et comptée à l'achat${prix?` (≈ ${eur(prix)})`:''}.`);
  }
  if (f.commander && !S.commander && c.isLegendaryCreature) S.commander = name;
  renderAll();
}

function deckAdd(card, qty, opts) {
  opts = opts || {};
  const f = fmt();
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
  renderAll();
}

function buyCard(name) {
  if (S.budget.total <= 0 || S.budget.perCard <= 0) {
    toast('Budget à zéro : aucun achat possible. Augmentez le budget en section E.');
    return;
  }
  const c = find(name);
  const o = bestOffer(c);
  if (!o) { toast("Aucune offre ne passe vos filtres d'état, de langue ou de prix maximum."); return; }
  if (spent() + o.price > S.budget.total) { toast('Budget dépassé. Augmentez-le, ou retirez une carte à acheter du deck.'); return; }
  deckAdd(c, 1, {force:true});
  renderAll();
  toast(`${name} ajoutée au deck, comptée à l'achat : ${eur(o.price)} estimés (${o.condition} ou mieux, ${o.lang}).`);
}

/* Carte rendue en texte, à la place du visuel : coût, type, force et
   endurance, coût converti et texte oracle. Sert quand l'image est
   absente, désactivée, ou qu'elle n'a pas pu se charger. */
function ficheTexteHTML(card) {
  const pt = (card.force != null && card.endurance != null) ? `${card.force}/${card.endurance}` : '';
  return `<div class="visuwrap">
      <div class="carte-texte">
        <div class="ct-h">
          <span class="ct-nom">${esc(card.name)}</span>
          <span class="costs">${manaHTML(card, true)}</span>
        </div>
        <div class="ct-type small">${esc(card.type)}${card.cmc ? ` · CMC ${card.cmc}` : ''}</div>
        <div class="ct-texte">${esc((card.text || '(texte non disponible)').replace(/ \/\/ /g, '\n'))}</div>
        ${pt ? `<div class="ct-pt mono">${pt}</div>` : ''}
      </div>
    </div>`;
}

/* Le visuel n'a pas pu se charger : le texte prend sa place. */
/* La fiche ouverte se reconstruit quand Scryfall a répondu — ou renoncé —
   sans quoi l'attente affichée resterait à tourner pour rien. */
function rafraichirFiche() {
  const dlg = document.getElementById('dlg');
  const el = dlg && dlg.open && dlg.querySelector('.fiche[data-fiche]');
  if (el) openCardModal(el.getAttribute('data-fiche'));
}

/* Carte vide et son icône de chargement, le temps que le visuel arrive. */
function visuelAttenteHTML() {
  return `<div class="visuwrap">
    <div class="visu-attente" role="status" aria-label="Visuel en cours de chargement">
      <span class="spin" aria-hidden="true"></span>
    </div>
  </div>`;
}

function ficheImageKO(img) {
  const wrap = img && img.closest('.visuwrap');
  const c = img && find(img.getAttribute('data-name') || '');
  if (wrap && c) wrap.outerHTML = ficheTexteHTML(c);
}

/* Défilement des éditions sous le visuel de la fiche. Deux sources : celles
   que la collection possède, et toutes celles que Scryfall publie — ces
   dernières cherchées seulement si on les demande. */
function blocVersions(card) {
  if (!card || card.unknown) return '';
  const possedees = versionsCarte(card);
  const toutes = sourceVersions(card) === 'toutes';
  const voulue = sourceVoulue(card);
  const vs = listeVersions(card);
  const enCours = card.editionsEtat === 'chargement';
  const bascule = `<div class="vers-src">
    <button type="button" class="vers-s" data-act="versionsPossedees" data-name="${esc(card.name)}"
      aria-pressed="${voulue !== 'toutes'}" ${possedees.length ? '' : 'disabled'}>Mes éditions${possedees.length ? ` (${possedees.length})` : ''}</button>
    <button type="button" class="vers-s" data-act="versionsToutes" data-name="${esc(card.name)}"
      aria-pressed="${voulue === 'toutes'}">${enCours ? 'Toutes…' : `Toutes${card.editionsEtat === 'ok' ? ` (${(card.editions||[]).length})` : ''}`}</button>
  </div>`;

  if (!vs.length) {
    return `<div class="vers">${bascule}
      <div class="small muted vers-det">${
        enCours ? 'Recherche des éditions publiées…'
        : card.editionsEtat === 'erreur' ? `Éditions indisponibles : ${esc(card.editionsErreur || 'échec')}.`
        : toutes ? 'Scryfall ne publie aucune édition papier pour cette carte.'
        : "Aucune édition relevée à l'import : passez par « Toutes » pour choisir une illustration."}</div>
    </div>`;
  }

  const i = versionRang(card), v = vs[i], cle = cleVersion(v);
  const u = (v.imgN || v.img) ? v : (card.visuels || {})[cle];
  const retenue = versionRetenue(card) === cle;
  const qte = possedeVersion(card, cle);
  const attente = !u && !card.visuelsTried;
  const details = [
    u && u.setName ? esc(u.setName) : '',
    u && u.artist ? `ill. ${esc(u.artist)}` : '',
    v.sortie ? esc(String(v.sortie).slice(0, 4)) : '',
    qte ? `${qte} exemplaire(s)` : (toutes ? 'non possédée' : '')
  ].filter(Boolean).join(' · ');

  return `<div class="vers">
    ${bascule}
    <div class="vers-nav">
      <button type="button" class="vers-b" data-act="versionPrec" data-name="${esc(card.name)}"
        title="Édition précédente" ${vs.length < 2 ? 'disabled' : ''}>‹</button>
      <div class="vers-cap">
        <b>${esc(v.set)}${v.num ? ` n°${esc(v.num)}` : ''}</b>
        <span class="muted">${i + 1} / ${vs.length}</span>
      </div>
      <button type="button" class="vers-b" data-act="versionSuiv" data-name="${esc(card.name)}"
        title="Édition suivante" ${vs.length < 2 ? 'disabled' : ''}>›</button>
    </div>
    <div class="small muted vers-det">${
      enCours ? 'Recherche des éditions publiées…'
      : u && u.ko ? 'Scryfall ne connaît pas cette édition : son visuel reste indisponible.'
      : attente ? 'Visuel en cours de recherche…'
      : details}</div>
    ${retenue
      ? '<div class="small vers-ok">Illustration affichée en priorité</div>'
      : `<button type="button" class="btn sm vers-pick" data-act="choisirVersion"
           data-name="${esc(card.name)}" data-cle="${esc(cle)}" ${(!u || u.ko) ? 'disabled' : ''}>
           Afficher cette illustration en priorité</button>`}
  </div>`;
}

function ficheHTML(card) {
  const deck = deckEntries().map(e => e.card);
  const dansDeck = S.deck.get(card.name) || 0;
  const tgt = targets(), cnt = deckCounts();
  const partD = partnersFor(card, deck).slice(0, 8);
  const partC = partnersFor(card, filtered().map(e => e.card).filter(c => !S.deck.has(c.name)).slice(0, 700)).slice(0, 6);
  const dispo = availableFor(card);
  const offre = dispo > 0 ? null : bestOffer(card);

  /* Un rôle par ligne : l'étiquette, puis ce que ce rôle vaut dans le
     deck — l'écart à l'objectif du format, ou le nombre de cartes qui le
     tiennent déjà pour les rôles que le format ne chiffre pas. */
  const roles = [...card.cats].map(c => {
    const l = CATLABEL[c] || c;
    if (c in tgt) {
      const manque = tgt[c] - (cnt[c] || 0);
      return `<div class="role-l"><span class="chip on">${esc(l)}</span>
        <span class="small muted">${cnt[c]||0} / ${tgt[c]} dans le deck — ${manque > 0
          ? `il en manque ${manque}` : 'objectif atteint'}</span></div>`;
    }
    const n = deckEntries().reduce((a, e) => a + (e.card.cats.has(c) ? e.qty : 0), 0);
    return `<div class="role-l"><span class="chip">${esc(l)}</span>
      <span class="small muted">${n} carte(s) du deck tiennent ce rôle — le format n'en fixe pas d'objectif</span></div>`;
  });

  const erAll = edhrecAllFor(card);
  // Tri pour placer le commandant sélectionné en tête de liste, suivi des commandants secondaires
  erAll.sort((a, b) => {
    const aSel = a.isSelected || a.role === 'principal' || (S.commander && norm(a.commandant) === norm(S.commander)) ? 1 : 0;
    const bSel = b.isSelected || b.role === 'principal' || (S.commander && norm(b.commandant) === norm(S.commander)) ? 1 : 0;
    if (aSel !== bSel) return bSel - aSel;
    return (b.synergy * 10 + b.inclusion * 8) - (a.synergy * 10 + a.inclusion * 8);
  });

  const edhrecTags = erAll.map(erItem => {
    const isSelected = erItem.isSelected || erItem.role === 'principal' || (S.commander && norm(erItem.commandant) === norm(S.commander));
    const pct = Math.round(erItem.inclusion * 100);
    const synVal = Math.abs(Math.round(erItem.synergy * 100));
    const synSign = erItem.synergy >= 0 ? '+' : '−';
    const tagContent = `${pct} % apparition / ${synSign}${synVal} % synergie`;

    if (isSelected) {
      return `<span class="tag edhrec-tag selected" style="border-color:#57c9c4;color:#57c9c4;background:rgba(87,201,196,.18);font-weight:600;padding:3px 8px;font-size:11px;display:inline-flex;align-items:center;gap:4px" title="Commandant sélectionné : ${esc(erItem.commandant)} — ${pct} % apparition, ${synSign}${synVal} % synergie">★ ${esc(erItem.commandant)} ${tagContent}</span>`;
    } else {
      return `<span class="tag edhrec-tag" style="border-color:#48a9a6;color:#85deda;background:rgba(87,201,196,.08);padding:3px 8px;font-size:11px;display:inline-flex;align-items:center;gap:4px" title="Commandant secondaire : ${esc(erItem.commandant)} — ${pct} % apparition, ${synSign}${synVal} % synergie">${esc(erItem.commandant)} ${tagContent}</span>`;
    }
  });

  const nomLien = l => NODE[l.concept].label.toLowerCase() + (l.detail ? ` (${l.detail})` : '')
    + (l.k <= 0.4 ? ' — non vérifiable, force ou coût inconnus' : (l.k < 1 ? ' — sous réserve' : ''));
  const lien = p => {
    const donne = [...new Set(p.links.filter(l => l.dir === 'ab').map(nomLien))];
    const recoit = [...new Set(p.links.filter(l => l.dir === 'ba').map(nomLien))];
    const bouts = [];
    if (donne.length) bouts.push(`elle lui fournit ${donne.join(', ')}`);
    if (recoit.length) bouts.push(`elle en reçoit ${recoit.join(', ')}`);
    return `<div class="arc">${refCarte(p.card.name)} — ${bouts.join(' · ')}</div>`;
  };
  const noeuds = [...new Set(card.an.edges.flatMap(e => [e.from, e.to]))];

  /* La même liste que le sélecteur d'éditions, et non les seules éditions
     possédées : sans quoi une carte possédée en un seul exemplaire laissait
     défiler les illustrations publiées sans jamais changer son visuel. */
  const vers = listeVersions(card);
  const vCour = vers.length ? versionCourante(card) : null;
  const vCle = vCour ? cleVersion(vCour) : '';
  const vAffichee = !vCour || vCle === cleImpression(card.set, card.num);
  const vSrc = vCour ? visuelVersion(card, vCour, true) : faceVisible(card, true);
  /* Trois états : le visuel est là, il se cherche encore, ou il n'y en a pas. */
  const blocVisuel = !S.images ? ficheTexteHTML(card)
    : vSrc ? `<div class="visuwrap">
        <img class="visu" src="${esc(vSrc)}" alt="${esc(card.name)}" data-name="${esc(card.name)}" onerror="ficheImageKO(this)">
        ${vAffichee && aDeuxFaces(card) && autreFace(card) ? `<button type="button" class="miniface" data-act="flip" data-name="${esc(card.name)}"
            title="Afficher ${RETOURNEES.has(card.name)?'le recto':'le verso'}">
            <img src="${esc(autreFace(card))}" alt="">
            <span>${RETOURNEES.has(card.name)?'recto':'verso'}</span>
          </button>` : ''}
      </div>`
    : visuelEnRecherche(card, vCour) ? visuelAttenteHTML()
    : ficheTexteHTML(card);

  return `<div class="fiche" data-fiche="${esc(card.name)}">
      <div class="visucol">
      ${blocVisuel}
      ${blocVersions(card)}
      </div>
      <div class="meta">
        <div class="small muted">${eur(card.price)}${card.price?' (tendance Cardmarket)':''}${card.artist?` · ill. ${esc(card.artist)}`:''}</div>
        ${(() => {
          const ed = libelleImpression(card);
          if (!ed) return '';
          const autres = (card.impressions || []).filter(i => i.set !== card.set || i.num !== card.num);
          const suivie = card.imgImpression === cleImpression(card.set, card.num);
          return `<div class="small muted" title="${esc(suivie
            ? "Édition relevée à l'import : le visuel, l'illustrateur et le prix affichés sont ceux de cette impression."
            : "Édition relevée à l'import. Scryfall ne l'a pas reconnue : le visuel et le prix affichés sont ceux d'une autre impression.")}">Édition ${esc(ed)}${
            card.setName ? ` — ${esc(card.setName)}` : ''}${
            card.impressionKO ? ' — inconnue de Scryfall' : ''}${
            autres.length ? ` · aussi ${autres.map(i => esc(i.set + (i.num ? ' n°' + i.num : ''))).join(', ')}` : ''}</div>`;
        })()}
        ${edhrecTags.length ? `<div class="tags edhrec-tags-modal" style="margin:8px 0 4px;gap:5px;flex-wrap:wrap">${edhrecTags.join('')}</div>` : ''}
        ${(() => {
          const arch = archetypesCarte(card);
          if (!arch.length) return '';
          return `<div class="chips" style="margin-top:${edhrecTags.length ? '4px' : '8px'}">${arch.map(slug =>
            `<span class="chip arch base" title="${esc(resumeArchetype(slug))}">${esc(libelleArchetype(slug))}</span>`).join(' ')}</div>`;
        })()}
        <div class="small ${dispo>0?'muted':'buy'}">${dispo>0
          ? `${dispo} exemplaire(s) disponibles dans la collection${dansDeck?` · ${dansDeck} déjà dans le deck`:''}`
          : (offre ? `hors collection — ≈ ${eur(offre.price)} sur Cardmarket (${offre.condition} ou mieux)` : 'hors collection et hors budget')}</div>
      </div>
    </div>
    <div class="bloc"><h4>Ce qu'elle apporte au deck</h4>
      <div class="small muted" style="margin-bottom:5px">Rôles dans le deck</div>
      ${roles.join('') || '<div class="role-l"><span class="chip">Rôle non identifié</span></div>'}
      <div class="small muted" style="margin:10px 0 5px">Cartes du deck avec lesquelles elle se branche</div>
      ${partD.length ? partD.map(lien).join('') : '<div class="arc muted">aucune pour le moment</div>'}</div>
    ${(() => {
      const cs = combosDe(card);
      if (!cs.length) return '';
      return `<div class="bloc"><h4>Combos répertoriés <span class="small muted">Commander Spellbook</span></h4>
        ${cs.slice(0,4).map(c => {
          const manque = (c.manquantes || []).filter(n => norm(n) !== norm(card.name));
          const complet = !c.manquantes || !c.manquantes.length;
          return `<div class="arc" style="margin-bottom:6px">
            <b>${libelleCombo(c, card, true)}</b>
            <div class="small ${complet?'':'muted'}">${complet
              ? 'toutes les pièces sont dans le deck'
              : (c.manquantes.some(n => norm(n) === norm(card.name))
                  ? `cette carte est la pièce manquante${manque.length?`, avec ${manque.map(refCarte).join(', ')}`:''}`
                  : `il manque ${c.manquantes.map(refCarte).join(', ')}`)}</div>
            ${c.description ? `<div class="small muted">${esc(c.description.split('\n').slice(0,3).join(' '))}</div>` : ''}
            ${c.prerequis ? `<div class="small muted">prérequis : ${esc(c.prerequis)}</div>` : ''}
            <a class="small" href="${esc(c.url)}" target="_blank" rel="noopener" style="color:var(--brass)">voir le combo ↗</a>
          </div>`;
        }).join('')}
      </div>`;
    })()}
    <div class="bloc"><h4>Capacités extraites</h4>
      ${card.an.abilities.length ? card.an.abilities.map(a => {
          const ql = libelleQual(a.q);
          return `<div class="arc">${a.from.map(f=>esc(NODE[f].label)).join(' + ')}${ql?` <span class="muted">[${esc(ql)}]</span>`:''} → <b>${a.to.map(t=>esc(NODE[t].label)).join(', ')}</b> <span class="muted">(${a.kind}${a.scopeTrig==='adv'?', côté adverse':''})</span></div>`;
        }).join('')
        : '<div class="arc muted">aucune capacité reconnue dans le texte</div>'}
      ${noeuds.length ? `<div class="chips" style="margin-top:7px">${noeuds.map(n=>`<button type="button" class="chip" data-act="focusNodeFrom" data-node2="${n}">${esc(NODE[n].label)}</button>`).join('')}</div>
        <div class="small muted">Touchez un nœud pour l'isoler dans le graphe.</div>` : ''}</div>
    <div class="bloc"><h4>Branchements possibles avec la collection</h4>
      <div class="small muted" style="margin-bottom:5px">Cartes de la collection filtrée qui ne sont pas dans le deck</div>
      ${partC.length ? partC.map(lien).join('') : '<div class="arc muted">aucune</div>'}</div>`;
}

function openCardModal(name) {
  const card = find(name); if (!card) return;
  const rouvre = ok => { if (ok && document.getElementById('dlg') && document.getElementById('dlg').open) openCardModal(name); };
  chercheVerso(card).then(rouvre);
  chercheTexte(card).then(rouvre);
  chercheImpressions(card).then(rouvre);
  cacherApercu();
  const dispo = availableFor(card), offre = dispo > 0 ? null : bestOffer(card);
  const actions = [
    dispo > 0
      ? `<button type="button" class="btn pri" data-act="toDeck" data-name="${esc(card.name)}">Ajouter au deck</button>`
      : (offre ? `<button type="button" class="btn pri" data-act="buy" data-name="${esc(card.name)}">Acheter + ajouter</button>` : ''),
    (S.deck.get(card.name) || 0) ? `<button type="button" class="btn" data-act="fromDeck" data-name="${esc(card.name)}">Retirer du deck</button>` : '',
    `<a class="btn" href="${esc(cmLink(card))}" target="_blank" rel="noopener">Cardmarket ↗</a>`,
    `<button type="button" class="btn" data-act="closeDialog">Fermer</button>`
  ].filter(Boolean).join('');
  openDialog(card.name, ficheHTML(card), actions, true);
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
      : `<div class="small" style="margin-bottom:6px">Aucun budget défini en section E : ces cartes sont dans le deck mais ne sont pas encore chiffrées comme achat autorisé.</div>`}
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
    ${S.images && (cmd.imgL || cmd.imgN || cmd.img)
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
  const grouped = {};
  entries.forEach(e => { const t = mainType(e.card); (grouped[t] = grouped[t] || []).push(e); });

  const bodyEl = document.getElementById('bodyE');
  if (bodyEl) {
    bodyEl.innerHTML = `
      <div class="row" style="margin-bottom:10px">
        <span class="pill" title="Deck entier, filtres compris">Cartes <b>${n}/${f.size}</b></span>
        ${masquees ? `<button type="button" class="pill head-format" data-act="filtres" title="Les filtres de l'en-tête masquent une partie du deck (cliquer pour les modifier)" style="border-color:var(--brass-d);color:var(--brass)">Filtrées <b>${n - masquees}</b> · ${masquees} masquée(s)</button>` : ''}
        <span class="pill" title="${masquees ? 'Cartes affichées seulement' : 'Deck entier'}">CMC moyen <b>${avg.toFixed(2)}</b></span>
        <span class="pill" title="${masquees ? 'Cartes affichées seulement' : 'Deck entier'}">Valeur <b>${eur(price)}</b></span>
        ${S.commander ? `<span class="pill">Commandant <b>${esc(S.commander)}</b></span>` : ''}
        ${(() => {
          const a = aAcheter();
          const qte = a.reduce((x, l) => x + l.qty, 0);
          return qte ? `<span class="pill" style="border-color:var(--bad)"><span class="dot" style="background:var(--bad)"></span> ${qte} à acheter · ${eur(spent())}</span>` : '';
        })()}
        <div class="seg" style="margin-left:auto">
          <button data-view="grid" aria-pressed="${S.view==='grid'}">Grille</button>
          <button data-view="list" aria-pressed="${S.view==='list'}">Liste</button>
        </div>
        <button class="btn" data-act="addCard" data-cible="deck">Ajouter</button>
        <button class="btn" data-act="import" data-cible="deck">Importer MTGO</button>
        <button class="btn" data-act="exportDeck">Exporter</button>
        <button class="btn danger" data-act="clearDeck">Vider le deck</button>
      </div>
      ${msgs.length ? `<div class="warnbox"><b>À corriger</b><ul style="margin:5px 0 0 16px;padding:0">${msgs.slice(0,6).map(m=>`<li>${esc(m)}</li>`).join('')}</ul></div>` : `<div class="warnbox" style="border-color:#2f6b46;background:rgba(79,159,104,.1)">Le deck respecte les contraintes du format.</div>`}
      ${f.commander ? zoneCommandant() : ''}
      ${blocAchats()}
      <h3 style="margin:12px 0 6px;font-size:15px">Courbe de mana</h3>
      ${histogram(cmcSplit, true)}
      <h3 style="margin:14px 0 6px;font-size:15px">Équilibre des rôles</h3>
      <div class="statgrid">${Object.keys(tgt).map(k => gauge(CATLABEL[k]||k, cnt[k]||0, tgt[k], k)).join('')}</div>
      <h3 style="margin:14px 0 6px;font-size:15px">Liste</h3>
      ${entries.length ? Object.keys(grouped).sort((a,b) => TYPE_ORDER.indexOf(a) - TYPE_ORDER.indexOf(b)).map(t => `
        <div class="group"><h4>${t} <span class="small muted">${grouped[t].reduce((a,e)=>a+e.qty,0)}</span></h4>
        ${S.view==='grid' ? `<div class="grid">${grouped[t].map(e=>cardTile(e,'deck')).join('')}</div>`
                          : `<div class="list">${grouped[t].map(e=>cardRow(e,'deck')).join('')}</div>`}</div>`).join('')
        : (n ? `<div class="empty">Les filtres de l'en-tête masquent les ${n} carte(s) du deck. Élargissez-les ou effacez-les pour revoir la liste.</div>`
             : '<div class="empty">Le deck est vide. Ajoutez des cartes depuis la collection (▲) ou depuis les suggestions en section E.</div>')}`;
  }

  const hintEl = document.getElementById('hintE');
  if (hintEl) hintEl.textContent = `${n}/${f.size}`;
  setTimeout(() => queueScryfall(entries.map(e => e.card)), 0);
  scheduleCombos();
}
