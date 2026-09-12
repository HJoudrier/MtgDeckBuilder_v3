/* =====================================================================
   js/fiche.js — La fiche détaillée d'une carte

   Tout ce qu'on sait d'une carte en une fenêtre : son visuel et ses éditions,
   ses rôles, ce qu'elle produit et ce qui la déclenche, ses branchements avec
   le deck et avec la collection, son prix.
   ===================================================================== */

function ficheHTML(card) {
  const deck = cartesDuDeck();
  const dansDeck = S.deck.get(card.name) || 0;
  const tgt = targets(), cnt = deckCounts();
  /* Les partenaires sont classés avant d'être tranchés : la liste ne montre que
     les interactions précises, et dit à part ce qu'un déclencheur large ramasse
     — sans quoi une liste coupée à huit paraissait contredire la pastille. */
  const poolC = filtered().map(e => e.card).filter(c => !S.deck.has(c.name)).slice(0, 700);
  const triD = classeLiens(partnersFor(card, deck), deck.length);
  const triC = classeLiens(partnersFor(card, poolC), poolC.length);
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
  const lien = (p, links) => {
    const l0 = links || p.links;
    const donne = [...new Set(l0.filter(l => l.dir === 'ab').map(nomLien))];
    const recoit = [...new Set(l0.filter(l => l.dir === 'ba').map(nomLien))];
    const bouts = [];
    if (donne.length) bouts.push(`elle lui fournit ${donne.join(', ')}`);
    if (recoit.length) bouts.push(`elle en reçoit ${recoit.join(', ')}`);
    return `<div class="arc">${refCarte(p.card.name)} — ${bouts.join(' · ')}</div>`;
  };

  /* Les interactions précises, puis une ligne pour les cartes que seul un
     déclencheur large atteint : c'est le même « (+60) » que la pastille. */
  const blocLiens = (tri, max, vide) => {
    const lignes = tri.precis.slice(0, max).map(x => lien(x.p, x.precis));
    if (tri.precis.length > max)
      lignes.push(`<div class="arc muted">les ${max} mieux branchées sur ${tri.precis.length}</div>`);
    if (tri.larges.length)
      lignes.push(`<div class="arc muted">et ${tri.larges.length} carte(s) que seul un déclencheur large
        relie — ${libelleFamillesLarges(tri.familles)} : le deck entier l'alimente, ce n'est pas une
        interaction carte à carte</div>`);
    return lignes.length ? lignes.join('') : `<div class="arc muted">${vide}</div>`;
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
  const blocVisuel = vSrc ? `<div class="visuwrap">
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
        ${estGameChanger(card) === true ? `<div class="small" style="color:#cba6e8">Classée <b>Game Changer</b> par Wizards : au Commander, sa présence hausse le palier du deck — aucune aux paliers 1 et 2, jusqu'à trois au palier 3.</div>` : ''}
        ${(() => {
          /* Où cette carte se trouve, si ce n'est pas dans la liste
             principale : sans cela, la fiche laisserait croire qu'elle
             n'est nulle part. */
          const cle = annexeDe(card.name);
          if (!cle) return '';
          const q = annexeListe(cle).get(card.name) || 0;
          return `<div class="small" style="color:#9aa4e6">Hors de la liste principale : ${esc(ANNEXES[cle].titre.toLowerCase())}${q > 1 ? ` ×${q}` : ''}.</div>`;
        })()}
      </div>
    </div>
    <div class="bloc"><h4>Ce qu'elle apporte au deck</h4>
      <div class="small muted" style="margin-bottom:5px">Rôles dans le deck</div>
      ${roles.join('') || '<div class="role-l"><span class="chip">Rôle non identifié</span></div>'}
      <div class="small muted" style="margin:10px 0 5px">Cartes du deck avec lesquelles elle se branche</div>
      ${blocLiens(triD, 8, 'aucune pour le moment')}</div>
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
      ${blocLiens(triC, 6, 'aucune')}</div>`;
}
