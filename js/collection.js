/* =====================================================================
   js/collection.js — La section Collection

   Ce que la collection retient une fois les filtres passés, la phrase qui dit
   ce que chacun écarte, et la grille paginée qui la montre.
   ===================================================================== */

const PAGE = 200;

function colorOK(card) {
  const id = card && card.identity ? card.identity : [];
  const sel = S.colors;
  if (id.length === 0) {
    if (sel.has('C')) return true;
    if (S.colorMode === 'identity' && ['W','U','B','R','G'].every(c => sel.has(c))) return true;
    return false;
  }
  if (S.colorMode === 'identity') return id.every(c => sel.has(c));
  if (S.colorMode === 'atleast') return id.some(c => sel.has(c));
  return id.length === [...sel].filter(c => c !== 'C').length && id.every(c => sel.has(c));
}

function collectionCards() {
  const out = [];
  S.collection.forEach((q, n) => {
    const c = find(n);
    if (c && q > 0) out.push({card:c, qty:q});
  });
  return out;
}

function filtered() {
  const list = collectionCards().filter(e => carteRetenue(e.card));
  const f = fmt();
  list.forEach(e => e.usable = Math.min(e.qty, f.maxCopies));
  /* Les comparateurs vivent maintenant dans `TRIS` (js/groupes.js), partagés
     avec le deck et les suggestions. Le tri par score demande une notation de
     la collection : elle n'a lieu qu'ici, quand ce tri est choisi, et se
     mémorise sous l'empreinte des suggestions. */
  const tri = S.tris.collection;
  if (tri === 'score') notesCollection(list);
  return list.sort((TRIS[tri] || TRIS.cmc).cmp);
}

/* Ce qui écarte des cartes de la collection affichée, cause par cause, dans
   l'ordre où les critères s'appliquent. Les couleurs cochées et la légalité du
   format en écartent autant que les champs de la fenêtre, mais ne figuraient
   nulle part : la ligne annonçait « aucun filtre » devant une collection
   visiblement amputée, et l'on cherchait un filtre resté en place. */
function causesCollection() {
  const out = {couleurs:0, legalite:0, filtres:0, retenues:0};
  collectionCards().forEach(e => {
    const c = e.card;
    if (!colorOK(c)) out.couleurs++;
    else if (!legaliteOK(c)) out.legalite++;
    else if (!roleOK(c) || !filtreOK(c)) out.filtres++;
    else out.retenues++;
  });
  return out;
}

/* La phrase qui les nomme, chacune avec le geste qui la lève. */
function ligneCausesCollection() {
  const st = causesCollection();
  const n = x => x.toLocaleString('fr-FR');
  const causes = [];
  if (st.couleurs) causes.push(`${n(st.couleurs)} par vos couleurs (${esc(nomCombinaisonCouleurs(S.colors))}, barre de mana de l'en-tête)`);
  if (st.legalite) causes.push(`${n(st.legalite)} par la légalité ${esc(fmt().label)} (fenêtre « Format »)`);
  if (st.filtres) causes.push(`${n(st.filtres)} par vos filtres (bouton « Filtres »${filtresActifs().length ? ` : ${esc(texteFiltresActifs(', '))}` : ''})`);
  return causes.length ? `écartées : ${causes.join(', ')}` : 'rien n\'est écarté';
}

function renderB() {
  renderTop();
  const list = filtered();
  const total = collectionCards().reduce((n, e) => n + e.qty, 0);
  const shown = list.reduce((n, e) => n + e.qty, 0);
  const unk = collectionCards().filter(e => e.card.unknown).length;
  /* La page se remplit groupe par groupe, dans l'ordre où ils s'affichent :
     couper dans une liste seulement triée sèmerait quelques cartes dans
     chaque groupe au lieu de remplir les premiers. */
  const mode = S.groupes.collection;
  const groupes = groupeCartes(list, mode, S.tris.collection);
  const totalGroupes = groupes.reduce((n, g) => n + g.total, 0);
  let place = S.limitB;
  const pageGroupes = [];
  groupes.forEach(g => {
    /* Une catégorie repliée ne coûte aucune place : ses cartes ne sont pas
       rendues, les catégories ouvertes en profitent, et elle garde son
       en-tête — replier la première fait donc apparaître les suivantes. */
    if (groupePlie('collection', mode, g.id)) { pageGroupes.push({...g, entrees:[]}); return; }
    if (place <= 0) return;
    const part = g.entrees.slice(0, place);
    place -= part.length;
    pageGroupes.push({...g, entrees:part});
  });
  const page = pageGroupes.reduce((acc, g) => acc.concat(g.entrees), []);
  const rest = totalGroupes - page.length;
  const actifs = filtresActifs();

  const bodyEl = document.getElementById('bodyB');
  if (bodyEl) {
    bodyEl.innerHTML = `
      <div class="row" style="margin-bottom:10px">
        ${boutonAffichage('collection')}
        <button class="btn" data-act="addCard">Ajouter</button>
        <button class="btn" data-act="import">Importer MTGO</button>
        ${unk ? `<button class="btn" data-act="enrich">Compléter ${unk} carte${unk>1?'s':''}</button>` : ''}
        <button class="btn danger" data-act="wipe">Vider</button>
      </div>
      <div class="small muted" style="margin-bottom:8px">${list.length} carte(s) différente(s) retenue(s) sur ${collectionCards().length} · ${shown} exemplaires sur ${total} dans la collection · ${ligneCausesCollection()}${rest>0?` · <b>${page.length} affichées</b> ici, les autres au bouton du bas`:''}${noteMultiple(mode)}</div>
      ${unk ? `<div class="warnbox">${unk} carte${unk>1?'s ont':' a'} été importée${unk>1?'s':''} sans coût de mana ni texte : leur couleur, leur courbe et leurs capacités restent inconnues tant qu'elles ne sont pas complétées.</div>` : ''}
      ${pageGroupes.length ? rendGroupes('collection', pageGroupes, mode, ents => vueDe('collection') === 'grid'
        ? `${ouvreGrille('collection', 'grid')}${ents.map(e => cardTile(e, 'collection')).join('')}</div>`
        : `<div class="list">${ents.map(e => cardRow(e, 'collection')).join('')}</div>`)
        : (total === 0
          ? `<div class="empty">Votre collection est vide. Ajoutez une carte, ou importez une liste MTGO, avec les boutons ci-dessus.</div>`
          : `<div class="empty">Aucune carte ne passe les filtres. Élargissez les couleurs${actifs.length ? " ou assouplissez les filtres" : ''} depuis le bouton « Filtres » de l'en-tête.</div>`)}
      ${rest > 0 ? `<div style="text-align:center;margin-top:10px"><button class="btn" data-act="moreB">Afficher ${Math.min(PAGE, rest)} cartes de plus (${rest} restantes)</button></div>` : ''}`;
  }

  const hintEl = document.getElementById('hintB');
  if (hintEl) hintEl.textContent = `${shown}/${total} ex.`;
  setTimeout(() => queueScryfall(page.map(e => e.card)), 0);
}
