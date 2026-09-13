/* =====================================================================
   js/fenExport.js — Fenêtres d'export et d'effacement

   Sortir une liste — le deck ou la collection — en texte, en tableur ou en
   JSON, sortir ce qu'il reste à acheter, et la confirmation avant d'effacer
   collection et deck. Les deux listes s'exportent de la même façon : ce sont
   les mêmes trois formats, la même fenêtre et les mêmes deux boutons, seul
   change ce qu'on y verse.
   ===================================================================== */

function exportModal(cible) {
  const versDeck = cible !== 'collection';
  const entries = versDeck ? deckEntries()
    : collectionCards().slice().sort((a, b) => a.card.name.localeCompare(b.card.name));
  const f = fmt();
  const date = new Date().toISOString().slice(0, 10);
  const nomFichier = versDeck
    ? `deck-${(S.commander || S.format || 'export').toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${date}`
    : `collection-${date}`;
  // l'édition relevée à l'import repart avec la liste, au format qu'elle avait
  const edTxt = c => c.set ? ` (${c.set})${c.num ? ' ' + c.num : ''}` : '';
  /* Les listes annexes repartent avec le deck, sous les en-têtes que les
     listes MTGO emploient — « Sideboard », « Considering » — et que notre
     propre import relit. */
  /* La réserve et l'étude repartent avec le deck ; la collection, elle, n'a
     pas d'annexes — elle les contient déjà toutes. */
  const annexes = versDeck
    ? CLES_ANNEXES.map(cle => ({cle, a:ANNEXES[cle], entries:annexeEntries(cle)})).filter(x => x.entries.length)
    : [];
  const ligneTxt = e => `${e.qty} ${e.card.name}${edTxt(e.card)}`;
  const txt = [entries.map(ligneTxt).join('\n')]
    .concat(annexes.map(x => `\n${x.a.anglais.charAt(0).toUpperCase()}${x.a.anglais.slice(1)}\n${x.entries.map(ligneTxt).join('\n')}`))
    .filter(bloc => bloc.trim()).join('\n');
  const ligneCsv = (e, liste) => `${e.qty},"${e.card.name.replace(/"/g,'""')}","${e.card.set||''}","${e.card.num||''}","${e.card.cost}","${e.card.type}",${e.card.price},${liste}`;
  const csv = 'Quantity,Name,Set,Collector Number,Mana Cost,Type,Price EUR,List\n' +
    entries.map(e => ligneCsv(e, versDeck ? 'deck' : 'collection')).concat(
      ...annexes.map(x => x.entries.map(e => ligneCsv(e, x.a.anglais)))).join('\n');
  const carteJson = e => ({name:e.card.name, qty:e.qty, set:e.card.set||'', num:e.card.num||'',
    mana:e.card.cost, type:e.card.type, price:e.card.price});
  const json = JSON.stringify(versDeck ? {
    format: S.format,
    commander: S.commander,
    taille: deckSize(),
    date: new Date().toISOString(),
    deck: entries.map(carteJson),
    ...Object.fromEntries(annexes.map(x => [x.cle, x.entries.map(carteJson)]))
  } : {
    date: new Date().toISOString(),
    cartes: entries.reduce((n, e) => n + e.qty, 0),
    collection: entries.map(carteJson)
  }, null, 2);

  const exemplaires = entries.reduce((n, e) => n + e.qty, 0);
  openDialog(versDeck ? 'Exporter le deck' : 'Exporter la collection',
    `<div class="row" style="margin-bottom:8px">
       ${versDeck ? `<span class="pill">Format <b>${f.label}</b></span>
       ${S.commander ? `<span class="pill">Commandant <b>${esc(S.commander)}</b></span>` : ''}
       <span class="pill"><b>${deckSize()}</b> cartes</span>`
       : `<span class="pill"><b>${entries.length}</b> cartes différentes</span>
       <span class="pill"><b>${exemplaires}</b> exemplaires</span>`}
       ${annexes.map(x => `<span class="pill" title="Exportée sous l'en-tête « ${esc(x.a.anglais)} »">${esc(x.a.titre)} <b>${x.entries.reduce((n, e) => n + e.qty, 0)}</b></span>`).join('')}
       <span class="pill">Valeur <b>${eur(entries.reduce((a,e)=>a+e.card.price*e.qty,0))}</b></span>
     </div>
     <div class="field"><label class="lab">Format d'export</label>
       <div class="seg" id="expSeg">
         <button data-exp="txt" aria-pressed="true">Texte MTGO (.txt)</button>
         <button data-exp="csv" aria-pressed="false">Tableur CSV</button>
         <button data-exp="json" aria-pressed="false">JSON</button>
       </div>
     </div>
     <textarea id="expArea" readonly style="height:220px;margin-top:8px">${esc(txt)}</textarea>`,
    `<button class="btn" id="expCopy">Copier dans le presse-papier</button>
     <button class="btn pri" id="expDl">Télécharger le fichier</button>
     <button class="btn" value="ok">Fermer</button>`);

  let mode = 'txt';
  const data = () => mode === 'txt' ? txt : (mode === 'csv' ? csv : json);
  const ext = () => mode === 'txt' ? 'txt' : (mode === 'csv' ? 'csv' : 'json');
  const mime = () => mode === 'txt' ? 'text/plain;charset=utf-8' : (mode === 'csv' ? 'text/csv;charset=utf-8' : 'application/json;charset=utf-8');

  const expSeg = document.getElementById('expSeg');
  if (expSeg) expSeg.addEventListener('click', ev => {
    const b = ev.target.closest('button[data-exp]'); if (!b) return;
    mode = b.dataset.exp;
    expSeg.querySelectorAll('button').forEach(x => x.setAttribute('aria-pressed', x === b));
    const area = document.getElementById('expArea');
    if (area) area.value = data();
  });

  const expCopy = document.getElementById('expCopy');
  if (expCopy) expCopy.onclick = () => {
    navigator.clipboard.writeText(data()).then(() => toast(`${versDeck ? 'Deck' : 'Collection'} copié${versDeck ? '' : 'e'} dans le presse-papier.`));
  };

  const expDl = document.getElementById('expDl');
  if (expDl) expDl.onclick = () => {
    const blob = new Blob([data()], {type:mime()});
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `${nomFichier}.${ext()}`;
    a.click();
    URL.revokeObjectURL(a.href);
  };
}

function openWantsModal() {
  const buys = aAcheter();
  if (!buys.length) { toast('Aucune carte à acheter : toutes les cartes du deck sont déjà dans votre collection.'); return; }
  const total = buys.reduce((t, l) => t + l.total, 0);
  const nb = buys.reduce((n, l) => n + l.qty, 0);
  const txt = buys.map(l => `${l.qty} ${l.card.name}`).join('\n');

  openDialog('Liste d\'achats Cardmarket (Wants)',
    `<div class="row" style="margin-bottom:8px">
       <span class="pill"><b>${nb}</b> exemplaire(s)</span>
       <span class="pill"><b>${buys.length}</b> carte(s) différentes</span>
       <span class="pill">Estimation <b>${eur(total)}</b></span>
     </div>
     <p class="small muted">Copiez cette liste et collez-la directement dans une Wants List sur Cardmarket, ou utilisez le lien direct de chaque carte.</p>
     <textarea id="wantsArea" readonly style="height:180px">${esc(txt)}</textarea>
     <div class="small muted" style="margin-top:6px">Format reconnu : « 1 Sol Ring » (une carte par ligne).</div>`,
    `<button class="btn" id="wantsCopy">Copier la liste</button>
     <a class="btn pri" href="https://www.cardmarket.com/fr/Magic/Wants" target="_blank" rel="noopener">Ouvrir Cardmarket Wants ↗</a>
     <button class="btn" value="ok">Fermer</button>`);

  const wantsCopy = document.getElementById('wantsCopy');
  if (wantsCopy) wantsCopy.onclick = () => {
    navigator.clipboard.writeText(txt).then(() => toast('Liste copiée dans le presse-papier.'));
  };
}

/* Vider la collection, et elle seule. Ce bouton emportait aussi le deck, la
   réserve et l'étude : « Vider » d'une section ne doit vider que ce que cette
   section montre, comme celui du deck qui ne touche qu'à la liste principale.
   Le deck survit donc à sa collection — il n'a jamais eu besoin d'elle pour
   exister, une carte qu'on ne possède pas y est simplement comptée à l'achat,
   et c'est ce que la fenêtre annonce. Pour tout reprendre à zéro, la fenêtre
   des paramètres a « Effacer les données locales ». */
function openWipeModal() {
  const cartes = collectionCards();
  const ex = cartes.reduce((n, e) => n + e.qty, 0);
  const auDeck = deckEntries().filter(e => (S.collection.get(e.card.name) || 0) > 0).length;
  openDialog('Vider la collection',
    `<p class="small">Cette action retire les ${ex.toLocaleString('fr-FR')} exemplaire(s) de votre collection,
       soit ${cartes.length.toLocaleString('fr-FR')} carte(s) différente(s). Le deck, la réserve et les cartes
       à l'étude sont conservés.</p>
     ${auDeck ? `<p class="small muted">${auDeck} carte(s) du deck viennent de votre collection : elles y restent,
       et seront désormais comptées à l'achat.</p>` : ''}
     <p class="small muted">Pensez à faire une sauvegarde avant si vous souhaitez conserver la liste de vos cartes.
       Pour tout reprendre à zéro — collection, deck et listes annexes —, la fenêtre des paramètres a
       « Effacer les données locales ».</p>`,
    `<button class="btn" value="cancel">Annuler</button>
     <button class="btn danger" id="confirmWipe" value="ok">Vider la collection</button>`);

  const confirmWipe = document.getElementById('confirmWipe');
  if (confirmWipe) confirmWipe.onclick = () => {
    S.collection.clear();
    closeDialog();
    /* La collection commande les candidates — ce qu'on possède, ce qu'il faut
       acheter : elles sont à rebâtir, comme après un import. */
    recalculerAvecProgression('Collection vidée : les cartes retenues et les suggestions sont reprises.');
    toast('Collection vidée. Le deck et les listes annexes sont conservés.');
  };
}

