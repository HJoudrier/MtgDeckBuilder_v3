/* =====================================================================
   js/scryfall.js — La file d'attente vers Scryfall

   Ce qui manque à une carte — son visuel, son texte oracle complet, son
   impression — est demandé par paquets, à un rythme que Scryfall accepte.
   `besoinScryfall()` dit ce qui manque encore, `queueScryfall()` met en file,
   et `runScryQueue()` la vide sans jamais bloquer la page.
   ===================================================================== */

const scryQueue = [];
let scryBusy = false;

/* Identifiant demandé à Scryfall : l'édition relevée à l'import quand la
   carte en a une, le nom sinon. Le couple code d'édition + numéro de
   collection ramène l'impression que vous possédez, avec son visuel, son
   illustrateur et son prix. */
function identScryfall(c) {
  return (c.set && c.num && !c.impressionKO)
    ? {set:String(c.set).toLowerCase(), collector_number:String(c.num).toLowerCase()}
    : {name:c.name};
}

/* Retrouve la carte visée par une réponse, d'abord par l'édition demandée. */
function cibleImpression(sc, parImpression) {
  const k = cleImpression(sc.set, sc.collector_number);
  return (k && parImpression && parImpression.get(k)) || null;
}

function indexImpressions(cartes) {
  const m = new Map();
  cartes.forEach(c => {
    const k = c && cleImpression(c.set, c.num);
    if (k && !m.has(k)) m.set(k, c);
  });
  return m;
}

/* Une carte mérite un aller-retour Scryfall tant qu'il lui manque son visuel
   ou son texte oracle complet : la base intégrée n'en garde qu'un résumé, ce
   qui coupait par exemple l'alternative d'un sort. Une
   édition relevée à l'import justifie elle aussi un aller-retour : le visuel
   affiché doit être celui de l'impression possédée, pas d'une autre. */
function besoinScryfall(c) {
  if (!c || c.unknown) return false;
  if (!c.img && !c.imgTried) return true;
  if (c.set && c.num && !c.impressionTried && !c.impressionKO && !c.impressionChoisie
      && c.imgImpression !== cleImpression(c.set, c.num)) return true;
  return !c.textFull && !c.texteTried;
}

function queueScryfall(cards) {
  if (S.scryHS || typeof fetch !== 'function') return;
  cards.forEach(c => {
    if (!besoinScryfall(c)) return;
    c.imgTried = true;
    c.texteTried = true;
    c.impressionTried = true;
    /* `imgTried` est posé dès la mise en file : il dit qu'on a demandé, pas
       qu'on a reçu. Ce second drapeau, lui, dure le temps de l'aller-retour,
       et c'est lui que la fiche regarde pour afficher son attente. */
    c.imgEnCours = true;
    scryQueue.push(c);
  });
  if (scryQueue.length && !scryBusy) runScryQueue();
}

async function runScryQueue() {
  scryBusy = true;
  while (scryQueue.length && !S.scryHS) {
    const chunk = scryQueue.splice(0, 75);
    const parImpression = indexImpressions(chunk);
    try {
      const r = await fetch('https://api.scryfall.com/cards/collection', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({identifiers: chunk.map(identScryfall)})
      });
      if (!r.ok) throw new Error('HTTP ' + r.status);
      const j = await r.json();
      (j.data || []).forEach(sc =>
        applyScryfall(sc, cibleImpression(sc, parImpression) || scryTarget(sc, null), true));
      // une édition que Scryfall ne connaît pas (code ou numéro fautif) ne doit
      // pas priver la carte de son visuel : elle repasse par son nom
      (j.not_found || []).forEach(id => {
        const c = id && id.set ? parImpression.get(cleImpression(id.set, id.collector_number)) : null;
        if (c && !c.impressionKO) { c.impressionKO = true; scryQueue.push(c); }
      });
    } catch(err) {
      S.scryHS = true;
      scryBusy = false;
      chunk.forEach(c => c.imgEnCours = false);
      scryQueue.forEach(c => c.imgEnCours = false);
      if (typeof rafraichirFiche === 'function') rafraichirFiche();
      toast("Visuels indisponibles (hors ligne ou accès bloqué). L'affichage reste en mode texte.");
      renderB();
      return;
    }
    chunk.forEach(c => c.imgEnCours = false);
    renderB();
    renderE();
    if (typeof rafraichirFiche === 'function') rafraichirFiche();
    if (typeof majApercu === 'function') majApercu();
    if (typeof scheduleSave === 'function') scheduleSave();
    await new Promise(res => setTimeout(res, 90));
  }
  scryBusy = false;
}

async function completeUnknown(names) {
  const todo = [...new Set(names)].map(n => find(n)).filter(c => c && c.unknown);
  if (!todo.length) { toast('Aucune carte à compléter.'); return; }
  if (S.enriching) { toast('Complétion déjà en cours.'); return; }
  S.enriching = true;
  toast(`Complétion de ${todo.length} carte(s) via Scryfall, comptez environ ${Math.max(1, Math.ceil(todo.length/75*1.3))} s.`);

  const map = new Map();
  todo.forEach(c => [norm(c.name), loose(c.name), norm(frontFace(c.name)), loose(frontFace(c.name))]
    .forEach(k => { if (k && !map.has(k)) map.set(k, c); }));

  const reste = new Set(todo);
  let ok = 0, failed = null;

  async function passe(items, libelle) {
    for (let i = 0; i < items.length && !failed; i += 75) {
      const chunk = items.slice(i, i + 75);
      const parImpression = indexImpressions(chunk.map(x => x.card));
      try {
        const r = await fetch('https://api.scryfall.com/cards/collection', {
          method: 'POST',
          headers: {'Content-Type': 'application/json'},
          body: JSON.stringify({identifiers: chunk.map(x => x.ident)})
        });
        if (!r.ok) throw new Error('HTTP ' + r.status);
        const j = await r.json();
        (j.data || []).forEach(sc => {
          const t = cibleImpression(sc, parImpression) || scryTarget(sc, map);
          if (t && reste.has(t) && applyScryfall(sc, t)) { ok++; reste.delete(t); }
        });
      } catch(err) { failed = err.message || 'réseau indisponible'; return; }
      toast(`${libelle} : ${Math.min(i + 75, items.length)} / ${items.length}…`);
      await new Promise(res => setTimeout(res, 90));
    }
  }

  // l'édition relevée à l'import passe en premier : elle désigne
  // l'impression exacte, donc le bon visuel et le bon prix
  const parEdition = todo.filter(c => c.set && c.num);
  let ok0 = 0;
  if (parEdition.length) {
    await passe(parEdition.map(c => ({ident:identScryfall(c), card:c})), 'Éditions');
    ok0 = ok;
    // une édition restée sans réponse est fautive, sauf si c'est le réseau
    // qui a manqué : la carte repassera alors par son nom
    if (!failed) parEdition.forEach(c => { if (reste.has(c)) c.impressionKO = true; });
  }

  if (!failed) await passe([...reste].map(c => ({ident:{name:c.name}, card:c})), 'Complétion');

  const dfc = [...reste].filter(c => c.name.includes(' // '));
  if (dfc.length && !failed) await passe(dfc.map(c => ({ident:{name:frontFace(c.name)}, card:c})), 'Faces avant');

  const flous = [...reste].slice(0, 60);
  for (const c of flous) {
    if (failed) break;
    try {
      const r = await fetch('https://api.scryfall.com/cards/named?fuzzy=' + encodeURIComponent(frontFace(c.name)));
      if (r.ok) {
        const sc = await r.json();
        if (sc && sc.name && applyScryfall(sc, c)) { ok++; reste.delete(c); }
      }
    } catch(err) { failed = err.message || 'réseau indisponible'; break; }
    await new Promise(res => setTimeout(res, 90));
  }

  S.enriching = false;
  renderAll();
  const manquantes = [...reste].map(c => c.name);
  if (failed) toast(`Complétion interrompue (${failed}). ${ok} carte(s) complétées, les autres restent importées avec des informations minimales.`);
  else toast(`${ok} carte(s) complétées${ok0 ? ` · dont ${ok0} dans l'édition demandée` : ''}${manquantes.length ? ` · ${manquantes.length} introuvable(s) : ${manquantes.slice(0,3).join(', ')}${manquantes.length>3?'…':''}` : ''}.`);
}
