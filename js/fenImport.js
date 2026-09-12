/* =====================================================================
   js/fenImport.js — Importer une liste de cartes

   Une liste collée depuis n'importe où : MTGO, Moxfield, Archidekt, un export
   de collection. Les formes varient — « 4 Lightning Bolt (M10) 146 », « SB: »,
   des entêtes de section — et ce fichier ne suppose rien : il lit ce qu'il
   reconnaît, et dit ce qu'il n'a pas su lire.
   ===================================================================== */

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
    const entete = l.match(/^(deck|sideboard|commander|companion|maybeboard|considering|tokens?)\s*:?\s*$/i);
    if (entete) {
      /* Les en-têtes reconnus mènent chacun à une liste : le deck, la
         réserve — le sideboard, et le compagnon qui l'accompagne —, l'étude
         — le maybeboard des sites de decks —, le commandant. Les jetons
         restent écartés : ils ne se jouent pas depuis la main. */
      const h = entete[1].toLowerCase();
      section = h === 'commander' ? 'commandant'
        : h === 'deck' ? 'deck'
        : h === 'sideboard' || h === 'companion' ? 'sideboard'
        : h === 'maybeboard' || h === 'considering' ? 'considering'
        : 'jetons';
      return;
    }
    /* « SB: » en tête de ligne est la marque du sideboard dans les listes
       MTGO : elle vaut section, ligne à ligne. */
    let sectionLigne = section;
    if (/^sb:\s*/i.test(l)) { sectionLigne = 'sideboard'; l = l.replace(/^sb:\s*/i, ''); }
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
    // d'édition et leurs numéros sont conservés l'un et l'autre. La section
    // entre dans la clé depuis que la réserve et l'étude ont leur liste :
    // sans elle, les deux exemplaires de réserve d'une carte déjà jouée
    // grossiraient le deck au lieu de rester à côté.
    const k = norm(nm) + '|' + ed.set + '|' + ed.num + '|' + sectionLigne;
    const dejaVu = out.get(k);
    out.set(k, {name:nm, qty:(dejaVu ? dejaVu.qty : 0) + Math.max(1, qty),
      section:dejaVu ? dejaVu.section : sectionLigne, set:ed.set, num:ed.num});
  });
  return [...out.values()];
}

function openImport(cible) {
  const versDeck = cible === 'deck';
  openDialog(versDeck ? 'Importer un deck (format MTGO)' : 'Importer une liste MTGO',
    `<p class="small muted">Une carte par ligne, au format « 4 Sol Ring ». Le code d'édition entre parenthèses et le numéro de collection qui le suit sont relevés (« 1 Sol Ring (LTC) 344 », « 1 [ELD#331] Arcane Signet ») : la carte est alors demandée à Scryfall dans cette impression précise, avec son visuel, son illustrateur et son prix. Les autres commentaires sont ignorés. ${versDeck
      ? 'Les en-têtes sont reconnus : « Sideboard » (et les lignes « SB: ») remplit la réserve, « Maybeboard » ou « Considering » les cartes à l\'étude, « Commander » désigne le commandant, les jetons sont écartés.'
      : 'Les cartes absentes de la base sont créées puis complétées.'}</p>
     <div class="row" style="gap:8px;align-items:center">
       <label class="btn" for="impFile" style="margin:0;cursor:pointer">Choisir un fichier…</label>
       <input id="impFile" type="file" accept=".txt,.dec,.dek,.mwDeck,.cod,text/plain" multiple style="position:absolute;width:1px;height:1px;opacity:0;pointer-events:none">
       <span class="small muted" id="impInfo">ou déposez-le sur la zone ci-dessous, ou collez la liste</span>
     </div>
     <textarea id="imp" placeholder="1 Sol Ring (LTC) 344&#10;1 Rhystic Study&#10;4 Lightning Bolt (2X2) 117"></textarea>
     ${versDeck ? `<label class="row small" style="gap:6px"><input type="checkbox" id="impReplace" checked> Vider le deck, la réserve et l'étude avant l'import</label>
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
    let known = 0, created = 0, qty = 0, manquants = 0, avecEdition = 0, jetons = 0, doublons = 0;
    const annexes = {sideboard:0, considering:0};
    const fresh = [];
    let cmd = null;

    if (remplacer) {
      S.deck.clear();
      CLES_ANNEXES.forEach(cle => annexeListe(cle).clear());
      S.commander = null;
    }
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
      if (e.section === 'jetons') { jetons += e.qty; return; }
      /* La réserve et l'étude ont désormais leur place dans la section Deck :
         ces lignes ne sont plus jetées, elles y vont. Une carte que la liste
         principale porte déjà y reste — le deck l'emporte, et la ligne est
         comptée à part plutôt que d'être perdue en silence. */
      if (ANNEXES[e.section]) {
        if (S.deck.get(c.name)) { doublons += e.qty; return; }
        const l = annexeListe(e.section);
        l.set(c.name, (l.get(c.name) || 0) + e.qty);
        annexes[e.section] += e.qty;
        return;
      }
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
      recalculerAvecProgression(versDeck
        ? 'Deck importé : les candidates sont rebâties et notées d\'après lui.'
        : 'Collection importée : les cartes retenues et les suggestions sont recalculées.');
      toast(versDeck
        ? `${qty} carte(s) placées dans le deck${CLES_ANNEXES.filter(cle => annexes[cle]).map(cle => ` · ${annexes[cle]} en ${ANNEXES[cle].titre.toLowerCase()}`).join('')}${jetons ? ` · ${jetons} jeton(s) ignorés` : ''}${doublons ? ` · ${doublons} déjà dans la liste principale` : ''}${cmd ? ` · commandant : ${cmd}` : ''}${manquants ? ` · ${manquants} à acheter pour ${eur(spent())}` : ''}${created ? ` · ${created} carte(s) créées` : ''}${avecEdition ? ` · ${avecEdition} ligne(s) avec édition` : ''}.`
        : `${entries.length} ligne(s) lues · ${qty} exemplaires · ${known} carte(s) déjà connues · ${created} créée(s)${avecEdition ? ` · ${avecEdition} ligne(s) avec édition` : ''}.`);
      if (wantEnrich && fresh.length) completeUnknown(fresh);
    }, 10);
  };
}
