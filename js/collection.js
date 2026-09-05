/* =====================================================================
   js/collection.js — Gestion de la collection, filtres & imports MTGO
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
  const list = collectionCards().filter(e => carteFiltree(e.card));
  const f = fmt();
  list.forEach(e => e.usable = Math.min(e.qty, f.maxCopies));
  const cmp = {
    cmc:   (a, b) => a.card.cmc - b.card.cmc || a.card.name.localeCompare(b.card.name),
    price: (a, b) => b.card.price - a.card.price,
    alpha: (a, b) => a.card.name.localeCompare(b.card.name),
    type:  (a, b) => TYPE_ORDER.indexOf(mainType(a.card)) - TYPE_ORDER.indexOf(mainType(b.card)) || a.card.cmc - b.card.cmc,
    qty:   (a, b) => b.qty - a.qty
  }[S.sort];
  return list.sort(cmp);
}

function frontFace(n) {
  return String(n||'').split(' // ')[0].trim();
}

function mergeInto(card, canonical) {
  const q = S.collection.get(card.name) || 0, d = S.deck.get(card.name) || 0;
  if (q) S.collection.set(canonical.name, (S.collection.get(canonical.name) || 0) + q);
  if (d) S.deck.set(canonical.name, (S.deck.get(canonical.name) || 0) + d);
  S.collection.delete(card.name);
  S.deck.delete(card.name);
  const i = DB.indexOf(card);
  if (i >= 0) DB.splice(i, 1);
  unindexCard(card);
  if (S.commander === card.name) S.commander = canonical.name;
  if (S.selected === card.name) S.selected = canonical.name;
  return canonical;
}

function renameCard(card, newName) {
  if (card.name === newName) return card;
  const existing = BY_NAME[norm(newName)];
  if (existing && existing !== card) return mergeInto(card, existing);
  const old = card.name;
  unindexCard(card);
  card.name = newName;
  indexCard(card);
  [S.collection, S.deck].forEach(m => {
    if (m.has(old)) {
      m.set(newName, (m.get(newName) || 0) + m.get(old));
      m.delete(old);
    }
  });
  if (S.commander === old) S.commander = newName;
  if (S.selected === old) S.selected = newName;
  return card;
}

/* ---------------------------------------------------------------------
   Édition d'une ligne importée. Les exports écrivent le code d'édition
   entre parenthèses ou entre crochets, suivi du numéro de collection :
   « 1 Sol Ring (LTC) 344 », « 4 Lightning Bolt [2X2] 117 *F* », et
   Deckstats réunit les deux : « 1 [ELD#331] Arcane Signet ». Un code
   tient en 2 à 6 caractères sans espace : les parenthèses d'un nom de
   carte (« B.F.M. (Big Furry Monster) ») en contiennent plusieurs mots
   et ne sont donc pas confondues avec un code.
   --------------------------------------------------------------------- */

const RE_ED_DIESE = /[\(\[]\s*([A-Za-z0-9]{2,6})\s*#\s*([A-Za-z0-9\u2605\u2020-]{1,10})\s*[\)\]]/;
const RE_ED = /[\(\[]\s*([A-Za-z0-9]{2,6})\s*[\)\]]/;
const RE_NUMERO = /^(?:[A-Za-z]{1,4}-)?[\u2605\u2020]?\d{1,5}[A-Za-z\u2605\u2020]{0,2}$/;

function retireExtrait(s, i, n) {
  return (s.slice(0, i) + ' ' + s.slice(i + n)).replace(/\s{2,}/g, ' ').trim();
}

function extraitEdition(texte) {
  const src = String(texte);
  const diese = src.match(RE_ED_DIESE);
  if (diese)
    return {nom:retireExtrait(src, diese.index, diese[0].length), set:diese[1].toUpperCase(), num:diese[2]};
  const m = src.match(RE_ED);
  if (!m) return {nom:src, set:'', num:''};
  const suite = src.slice(m.index + m[0].length).match(/^\s*(\S+)/);
  if (suite && RE_NUMERO.test(suite[1]))
    return {nom:retireExtrait(src, m.index, m[0].length + suite[0].length), set:m[1].toUpperCase(), num:suite[1]};
  // sans numéro, seul un code écrit en majuscules est une édition : « (Used) »
  // ou « (Not the Urza's Legacy One) » appartiennent au nom de la carte
  if (!/^[A-Z0-9]{2,6}$/.test(m[1])) return {nom:src, set:'', num:''};
  return {nom:retireExtrait(src, m.index, m[0].length), set:m[1].toUpperCase(), num:''};
}

function parseMtgoList(txt) {
  const out = new Map();
  let section = 'deck';
  String(txt).replace(/^\uFEFF/, '').split(/\r?\n/).forEach(raw => {
    let l = raw.replace(/\t+/g, ' ').trim();
    if (!l || /^(\/\/|#)/.test(l)) return;
    const entete = l.match(/^(deck|sideboard|commander|companion|maybeboard|tokens?)\s*:?\s*$/i);
    if (entete) {
      const h = entete[1].toLowerCase();
      section = h === 'commander' ? 'commandant' : (h === 'deck' ? 'deck' : 'reserve');
      return;
    }
    l = l.replace(/^sb:\s*/i, '');
    const m = l.match(/^(\d+)\s*[xX]?\s+(.+)$/);
    let qty = 1, nm = l;
    if (m) { qty = parseInt(m[1], 10) || 1; nm = m[2]; }
    const ed = extraitEdition(nm);
    nm = ed.nom;
    nm = nm.replace(/\s*[\(\[][^\)\]]*[\)\]].*$/, '')
           .replace(/\s*\*[^*]*\*\s*$/, '')
           .replace(/\s*<[^>]*>\s*$/, '')
           .trim();
    nm = nm.replace(/\s*(?:\/\/|\||\/)\s*/g, ' // ').replace(/\s{2,}/g, ' ').trim();
    if (!nm) return;
    // deux impressions d'une même carte restent deux lignes : leurs codes
    // d'édition et leurs numéros sont conservés l'un et l'autre
    const k = norm(nm) + '|' + ed.set + '|' + ed.num;
    const dejaVu = out.get(k);
    out.set(k, {name:nm, qty:(dejaVu ? dejaVu.qty : 0) + Math.max(1, qty),
      section:dejaVu ? dejaVu.section : section, set:ed.set, num:ed.num});
  });
  return [...out.values()];
}

function renderB() {
  renderTop();
  const list = filtered();
  const total = collectionCards().reduce((n, e) => n + e.qty, 0);
  const shown = list.reduce((n, e) => n + e.qty, 0);
  const unk = collectionCards().filter(e => e.card.unknown).length;
  const page = list.slice(0, S.limitB);
  const rest = list.length - page.length;
  const actifs = filtresActifs();

  const bodyEl = document.getElementById('bodyB');
  if (bodyEl) {
    bodyEl.innerHTML = `
      <div class="row" style="margin-bottom:10px">
        <select data-act="sort">
          ${[['cmc','Tri : coût de mana'],['price','Tri : prix'],['alpha','Tri : alphabétique'],['type','Tri : type'],['qty','Tri : quantité']]
            .map(([k,l]) => `<option value="${k}" ${S.sort===k?'selected':''}>${l}</option>`).join('')}
        </select>
        <div class="seg">
          <button data-view="grid" aria-pressed="${S.view==='grid'}">Grille</button>
          <button data-view="list" aria-pressed="${S.view==='list'}">Liste</button>
        </div>
        <button class="btn" data-act="toggleImages" aria-pressed="${S.images}" title="Afficher les visuels des cartes">Visuels</button>
        <button class="btn" data-act="addCard">Ajouter</button>
        <button class="btn" data-act="import">Importer MTGO</button>
        ${unk ? `<button class="btn" data-act="enrich">Compléter ${unk} carte${unk>1?'s':''}</button>` : ''}
        <button class="btn danger" data-act="wipe">Vider</button>
      </div>
      <div class="small muted" style="margin-bottom:8px">${list.length} cartes différentes après filtrage · ${shown} exemplaires sur ${total} dans la collection${rest>0?` · ${page.length} affichées`:''} · ${actifs.length ? `${actifs.length} filtre(s) réglés dans l'en-tête` : 'aucun filtre : bouton « Filtres » de l\'en-tête'}</div>
      ${unk ? `<div class="warnbox">${unk} carte${unk>1?'s ont':' a'} été importée${unk>1?'s':''} sans coût de mana ni texte : leur couleur, leur courbe et leurs capacités restent inconnues tant qu'elles ne sont pas complétées.</div>` : ''}
      ${page.length ? (S.view === 'grid'
        ? `<div class="grid">${page.map(e => cardTile(e, 'collection')).join('')}</div>`
        : `<div class="list">${page.map(e => cardRow(e, 'collection')).join('')}</div>`)
        : (total === 0
          ? `<div class="empty">Votre collection est vide. Ajoutez une carte, ou importez une liste MTGO, avec les boutons ci-dessus.</div>`
          : `<div class="empty">Aucune carte ne passe les filtres. Élargissez les couleurs${actifs.length ? " ou assouplissez les filtres" : ''} depuis le bouton « Filtres » de l'en-tête.</div>`)}
      ${rest > 0 ? `<div style="text-align:center;margin-top:10px"><button class="btn" data-act="moreB">Afficher ${Math.min(PAGE, rest)} cartes de plus (${rest} restantes)</button></div>` : ''}`;
  }

  const hintEl = document.getElementById('hintB');
  if (hintEl) hintEl.textContent = `${shown}/${total} ex.`;
  setTimeout(() => queueScryfall(page.map(e => e.card)), 0);
}

function openImport(cible) {
  const versDeck = cible === 'deck';
  openDialog(versDeck ? 'Importer un deck (format MTGO)' : 'Importer une liste MTGO',
    `<p class="small muted">Une carte par ligne, au format « 4 Sol Ring ». Le code d'édition entre parenthèses et le numéro de collection qui le suit sont relevés (« 1 Sol Ring (LTC) 344 », « 1 [ELD#331] Arcane Signet ») : la carte est alors demandée à Scryfall dans cette impression précise, avec son visuel, son illustrateur et son prix. Les autres commentaires sont ignorés. ${versDeck
      ? 'Les en-têtes « Sideboard » et « Commander » sont reconnus : la réserve est écartée, le commandant est désigné automatiquement.'
      : 'Les cartes absentes de la base sont créées puis complétées.'}</p>
     <div class="row" style="gap:8px;align-items:center">
       <label class="btn" for="impFile" style="margin:0;cursor:pointer">Choisir un fichier…</label>
       <input id="impFile" type="file" accept=".txt,.dec,.dek,.mwDeck,.cod,text/plain" multiple style="position:absolute;width:1px;height:1px;opacity:0;pointer-events:none">
       <span class="small muted" id="impInfo">ou déposez-le sur la zone ci-dessous, ou collez la liste</span>
     </div>
     <textarea id="imp" placeholder="1 Sol Ring (LTC) 344&#10;1 Rhystic Study&#10;4 Lightning Bolt (2X2) 117"></textarea>
     ${versDeck ? `<label class="row small" style="gap:6px"><input type="checkbox" id="impReplace" checked> Vider le deck avant l'import</label>
       <label class="row small" style="gap:6px"><input type="checkbox" id="impStock"> Considérer que vous possédez déjà tout (ajoute les manquants à la collection)</label>
       <div class="small muted">Sinon, les cartes absentes de la collection entrent quand même dans le deck et sont comptées à l'achat.</div>` : ''}
     <label class="row small" style="gap:6px"><input type="checkbox" id="impEnrich" checked> Compléter les cartes inconnues via Scryfall (nécessite une connexion)</label>`,
    '<button class="btn" value="cancel">Annuler</button><button class="btn pri" id="okImp" value="ok">Importer</button>');

  const ta = document.getElementById('imp'), info = document.getElementById('impInfo');
  async function lireFichiers(files) {
    info.textContent = `Lecture de ${files.length} fichier(s)…`;
    const parts = [];
    for (const f of files) {
      let txt = '';
      try {
        txt = await f.text();
        if (txt.indexOf('\uFFFD') >= 0) {
          try { txt = new TextDecoder('windows-1252').decode(await f.arrayBuffer()); } catch(e){}
        }
      } catch(e) { info.textContent = `Impossible de lire « ${f.name} ».`; return; }
      parts.push(txt);
    }
    const ajout = parts.join('\n');
    ta.value = ta.value.trim() ? ta.value.replace(/\s*$/, '\n') + ajout : ajout;
    info.textContent = `${files.map(f => f.name).join(', ')} · ${parseMtgoList(ta.value).length} carte(s) détectée(s)`;
  }

  const impFile = document.getElementById('impFile');
  if (impFile) impFile.addEventListener('change', ev => {
    const fs = [...ev.target.files]; if (fs.length) lireFichiers(fs);
  });
  if (ta) {
    ta.addEventListener('dragover', ev => { ev.preventDefault(); ta.style.borderColor = 'var(--brass)'; });
    ta.addEventListener('dragleave', () => { ta.style.borderColor = ''; });
    ta.addEventListener('drop', ev => {
      ev.preventDefault();
      ta.style.borderColor = '';
      const fs = [...((ev.dataTransfer && ev.dataTransfer.files) || [])];
      if (fs.length) lireFichiers(fs);
      else {
        const t2 = ev.dataTransfer && ev.dataTransfer.getData('text');
        if (t2) ta.value = ta.value.trim() ? ta.value + '\n' + t2 : t2;
      }
    });
  }

  const okBtn = document.getElementById('okImp');
  if (okBtn) okBtn.onclick = () => {
    const txt = document.getElementById('imp').value;
    const wantEnrich = document.getElementById('impEnrich').checked;
    const remplacer = versDeck && document.getElementById('impReplace').checked;
    const completer = versDeck && document.getElementById('impStock').checked;
    const entries = parseMtgoList(txt);
    // les champs sont lus : la fenêtre a fait son office
    closeDialog();
    let known = 0, created = 0, qty = 0, reserve = 0, manquants = 0, avecEdition = 0;
    const fresh = [];
    let cmd = null;

    if (remplacer) { S.deck.clear(); S.commander = null; }
    entries.forEach(e => {
      let c = find(e.name);
      if (!c) {
        c = registerCard(buildCard(e.name, '—', 'Inconnu', 0, ''));
        c.unknown = true;
        created++;
        fresh.push(c.name);
      } else known++;
      if (e.set) {
        noterImpression(c, e.set, e.num, e.qty);
        avecEdition++;
      }
      if (!versDeck) {
        S.collection.set(c.name, (S.collection.get(c.name) || 0) + e.qty);
        qty += e.qty;
        return;
      }
      if (e.section === 'reserve') { reserve += e.qty; return; }
      const pose = deckAdd(c, e.qty, {completer, force:true});
      qty += pose;
      manquants += deckAdd.dernierAchat || 0;
      if (e.section === 'commandant' && !cmd) cmd = c.name;
    });

    if (versDeck) {
      if (cmd) S.commander = cmd;
      else if (fmt().commander && !S.commander) {
        const leg = deckEntries().find(e => e.card.isLegendaryCreature);
        if (leg) S.commander = leg.card.name;
      }
    }

    setTimeout(() => {
      S.limitB = PAGE;
      renderAll();
      toast(versDeck
        ? `${qty} carte(s) placées dans le deck${reserve ? ` · ${reserve} en réserve ignorées` : ''}${cmd ? ` · commandant : ${cmd}` : ''}${manquants ? ` · ${manquants} à acheter pour ${eur(spent())}` : ''}${created ? ` · ${created} carte(s) créées` : ''}${avecEdition ? ` · ${avecEdition} ligne(s) avec édition` : ''}.`
        : `${entries.length} ligne(s) lues · ${qty} exemplaires · ${known} carte(s) déjà connues · ${created} créée(s)${avecEdition ? ` · ${avecEdition} ligne(s) avec édition` : ''}.`);
      if (wantEnrich && fresh.length) completeUnknown(fresh);
    }, 10);
  };
}

function ajouterCarte(c, q, cible, completer) {
  if (cible === 'deck') {
    const n = deckAdd(c, q, {completer});
    renderAll();
    toast(n ? `${c.name} ×${n} ajoutée(s) au deck.` : `${c.name} : limite de ${fmt().maxCopies} copie(s) atteinte.`);
  } else {
    S.collection.set(c.name, (S.collection.get(c.name) || 0) + q);
    renderAll();
    toast(`${c.name} ×${q} ajoutée(s) à la collection.`);
  }
}

function chercheCartes(q) {
  const t = norm(q);
  if (t.length < 2) return [];
  const debut = [], dedans = [];
  const noeuds = noeudsActifs();
  const vu = new Set();

  if (typeof CAT !== 'undefined' && CAT.cartes && CAT.cartes.length > 0) {
    for (const rec of CAT.cartes) {
      const nom = rec[CH.NOM];
      const n = norm(nom);
      const isDeb = n.startsWith(t);
      const isDed = !isDeb && n.includes(t);
      if (!isDeb && !isDed) continue;
      const id = rec[CH.ID_COUL] ? String(rec[CH.ID_COUL]).split('') : [];
      if (!colorOK({identity: id})) continue;
      if (noeuds.length && !recToucheNoeuds(rec, noeuds)) continue;
      const card = getCardOrAnalyzedRec(rec);
      vu.add(card.name);
      if (isDeb) debut.push(card); else dedans.push(card);
      if (debut.length + dedans.length > 300) break;
    }
  } else {
    for (const c of DB) {
      if (!colorOK(c)) continue;
      if (noeuds.length && !carteTouche(c, noeuds)) continue;
      const n = norm(c.name);
      if (n.startsWith(t)) debut.push(c);
      else if (n.includes(t)) dedans.push(c);
      if (debut.length + dedans.length > 300) break;
    }
  }
  const tri = (a, b) => a.name.localeCompare(b.name);
  return [...debut.sort(tri), ...dedans.sort(tri)].slice(0, 14);
}

function resultatsHTML(q, cible) {
  const res = chercheCartes(q);
  const cols = [...S.colors].join('') || 'aucune';
  const noeuds = noeudsActifs();
  const effTxt = noeuds.length ? ` et effets (${noeuds.map(n => (typeof NODE !== 'undefined' && NODE[n] && NODE[n].label) || n).join(', ')})` : '';
  if (norm(q).length < 2)
    return `<div class="small muted">Tapez au moins deux lettres du nom. Seules les cartes compatibles avec les couleurs choisies dans la fenêtre des filtres (${esc(cols)})${effTxt} sont proposées.</div>`;
  const enLigne = [...scryRes.values()].filter(sc => { const c = find(sc.name); return !c || c.unknown; });
  const blocLigne = (() => {
    if (scryEtat === 'chargement') return `<div class="small muted" style="margin-top:8px">Recherche sur Scryfall…</div>`;
    if (scryEtat === 'hors-ligne') return `<div class="small muted" style="margin-top:8px">Recherche en ligne indisponible : seules les cartes déjà connues de l'atelier sont proposées.</div>`;
    if (!enLigne.length) return '';
    return `<div class="small muted" style="margin:10px 0 4px">Trouvées sur Scryfall, absentes de votre catalogue :</div>
      <div class="list">${enLigne.map(sc => `
        <button type="button" class="lrow" style="text-align:left" data-act="addScry" data-name="${esc(sc.name)}" data-cible="${cible}">
          <span class="cname">${esc(sc.name)}</span>
          <span class="mono small muted" style="margin-left:auto">0 en collection</span>
        </button>`).join('')}</div>`;
  })();

  if (!res.length)
    return `<div class="small muted">${enLigne.length || scryEtat === 'chargement'
      ? `Aucune carte de votre catalogue ne correspond dans les couleurs ${esc(cols)}${effTxt}.`
      : `Aucune carte ne correspond dans les couleurs ${esc(cols)}${effTxt}. Élargissez les filtres.`}</div>${blocLigne}`;

  return `<div class="small muted" style="margin-bottom:4px">${res.length} résultat(s) · couleurs ${esc(cols)}${effTxt}</div>
    <div class="list">${res.map(c => {
      const poss = S.collection.get(c.name) || 0;
      return `<button type="button" class="lrow" style="text-align:left" data-act="addPick" data-name="${esc(c.name)}" data-cible="${cible}">
        <span class="cname" data-card-name="${esc(c.name)}">${esc(c.name)}</span>
        <span class="mono small ${poss?'':'muted'}" style="margin-left:auto">${poss} en collection</span>
      </button>`;
    }).join('')}</div>${blocLigne}`;
}

function majResultats(cible, sansRelancer) {
  const champ = document.getElementById('addN');
  const z = document.getElementById('addRes');
  if (z && champ) z.innerHTML = resultatsHTML(champ.value, cible);
  if (sansRelancer || !champ) return;
  clearTimeout(scryTimer);
  const q = champ.value;
  if (norm(q).length < 3) { scryRes = new Map(); scryEtat = ''; }
  scryTimer = setTimeout(() => chercheScryfall(q, cible), 350);
}

function openAdd(cible) {
  const versDeck = cible === 'deck';
  scryRes = new Map();
  scryEtat = '';
  clearTimeout(scryTimer);
  openDialog(versDeck ? 'Ajouter une carte au deck' : 'Ajouter une carte à la collection',
    `<div class="row" style="align-items:flex-end">
       <div class="field" style="flex:1;min-width:180px"><label class="lab" for="addN">Rechercher</label>
         <input id="addN" type="text" data-recherche="${cible}" placeholder="nom de la carte…" autocomplete="off"></div>
       <div class="field"><label class="lab" for="addQ">Exemplaires</label>
         <input id="addQ" type="number" min="1" value="1" style="width:90px"></div>
     </div>
     ${versDeck ? `<label class="row small" style="gap:6px"><input type="checkbox" id="addStock"> Ajouter aussi à la collection (sinon la carte est comptée à l'achat)</label>` : ''}
     <div id="addRes">${resultatsHTML('', cible)}</div>`,
    '<button class="btn" value="cancel">Fermer</button>', true);
}
