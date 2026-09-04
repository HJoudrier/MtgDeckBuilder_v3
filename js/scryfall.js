/* =====================================================================
   js/scryfall.js — Intégration Scryfall, symboles, visuels & complétion
   ===================================================================== */

let SYMS = null;

async function loadSymbology() {
  if (typeof fetch !== 'function' || SYMS) return;
  try {
    const r = await fetch('https://api.scryfall.com/symbology');
    if (!r.ok) throw new Error('HTTP ' + r.status);
    const j = await r.json();
    const m = {};
    (j.data || []).forEach(x => { if (x.symbol && x.svg_uri) m[x.symbol] = x.svg_uri; });
    if (!Object.keys(m).length) throw new Error('réponse vide');
    SYMS = m;
    renderAll();
  } catch(err) { /* pastilles CSS conservées */ }
}

function pipHTML(inner, taille) {
  const code = String(inner).toUpperCase().replace(/[^A-Z0-9]/g, '');
  const generique = /^\d+$|^X$/.test(code);
  const fb = generique ? 'gen' : ('WUBRGC'.includes(code) ? code : (code.split('').find(c => 'WUBRG'.includes(c)) || 'gen'));
  const txt = generique ? code : (fb === 'gen' ? code : fb);
  return {fb, txt, cls:'mana ' + fb + (taille === 'sm' ? ' sm' : '')};
}

function symBg(inner) {
  const p = pipHTML(inner);
  const uri = SYMS && SYMS['{' + String(inner).toUpperCase() + '}'];
  return uri
    ? `<span class="symbg" style="background-image:url('${esc(uri)}')" role="img" aria-label="${esc(inner)}"></span>`
    : `<span class="${p.cls}">${esc(p.txt)}</span>`;
}

function symIcon(inner, taille) {
  const p = pipHTML(inner, taille);
  const uri = SYMS && SYMS['{' + String(inner).toUpperCase() + '}'];
  if (!uri) return `<span class="${p.cls}">${esc(p.txt)}</span>`;
  const cls = 'msym' + (taille ? ' ' + taille : '');
  return `<img class="${cls}" src="${esc(uri)}" alt="${esc(inner)}" title="{${esc(inner)}}"
    loading="lazy" data-fb="${p.fb}" data-sz="${taille||''}" data-txt="${esc(p.txt)}" onerror="manaFb(this)">`;
}

function manaFb(img) {
  const sz = img.dataset.sz === 'sm' ? ' sm' : '';
  img.outerHTML = `<span class="mana ${img.dataset.fb}${sz}">${img.dataset.txt}</span>`;
}

function manaHTML(card, sm) {
  const t = sm ? 'sm' : '';
  if (!card.symbols.length) return `<span class="mana gen${sm?' sm':''}">—</span>`;
  return card.symbols.map(x => symIcon(x.slice(1, -1), t)).join('');
}

function stripeColor(card) {
  const id = card.identity;
  if (!id.length) return 'var(--C)';
  if (id.length === 1) return `var(--${id[0]})`;
  return `linear-gradient(180deg,${id.map(c => `var(--${c})`).join(',')})`;
}

function scryTarget(sc, map) {
  const keys = [sc.name, frontFace(sc.name)];
  if (sc.card_faces) sc.card_faces.forEach(f => keys.push(f.name));
  for (const k of keys) {
    if (!k) continue;
    const c = BY_NAME[norm(k)] || LOOSE[loose(k)] || FRONT[loose(k)] || (map && (map.get(norm(k)) || map.get(loose(k))));
    if (c) return c;
  }
  return null;
}

function applyScryfall(sc, requested, imagesOnly) {
  const faces = sc.card_faces && sc.card_faces.length ? sc.card_faces : null;
  const cost = (sc.mana_cost && sc.mana_cost.length ? sc.mana_cost : (faces ? (faces[0].mana_cost||'') : '')) || '—';
  const type = sc.type_line || (faces ? faces[0].type_line : 'Inconnu');
  const text = faces && !sc.oracle_text
    ? faces.map(f => (f.oracle_text||'').replace(/\n/g, ' // ')).join(' // ')
    : (sc.oracle_text||'').replace(/\n/g, ' // ');
  const pr = sc.prices || {};
  const price = parseFloat(pr.eur || pr.eur_foil || pr.usd || 0) || 0;
  const uris = sc.image_uris || (faces && faces[0] && faces[0].image_uris) || null;
  const versoUris = faces && faces[1] && faces[1].image_uris || null;
  let target = (requested && typeof requested === 'object')
    ? requested
    : (BY_NAME[norm(sc.name)] || LOOSE[loose(sc.name)] || (requested ? find(requested) : null));

  if (target && (imagesOnly || !target.unknown)) {
    majTexteOracle(target, text);
    if (Array.isArray(sc.color_identity) && !/^basic land/i.test(target.type || '')) {
      target.identity = sc.color_identity.slice();
    }
    if (typeof sc.cmc === 'number') target.cmc = sc.cmc;
    if (uris) {
      target.img = uris.small || uris.normal;
      target.imgN = uris.normal || uris.large || target.img;
      target.imgL = uris.large || uris.png || target.imgN;
    }
    if (versoUris) {
      target.imgB = versoUris.normal || versoUris.small;
      target.imgBL = versoUris.large || target.imgB;
    }
    if (sc.purchase_uris && sc.purchase_uris.cardmarket) target.cmUrl = sc.purchase_uris.cardmarket;
    if (pr.eur) target.price = parseFloat(pr.eur) || target.price;
    const pw = sc.power || (faces && faces[0] && faces[0].power);
    if (pw != null && /^\d+$/.test(String(pw)) && target.force !== +pw) {
      target.force = +pw;
      reanalyser(target);
    }
    const tg = sc.toughness || (faces && faces[0] && faces[0].toughness);
    if (tg != null && /^\d+$/.test(String(tg))) target.endurance = +tg;
    const art = sc.artist || (faces && faces[0] && faces[0].artist);
    if (art) target.artist = art;
    return true;
  }

  const fresh = buildCard(sc.name, cost, type, price, text);
  fresh.textFull = !!text;
  if (Array.isArray(sc.color_identity)) fresh.identity = sc.color_identity.slice();
  if (typeof sc.cmc === 'number') fresh.cmc = sc.cmc;
  const pw = sc.power || (faces && faces[0] && faces[0].power);
  if (pw != null && /^\d+$/.test(String(pw))) fresh.force = +pw;
  const tg = sc.toughness || (faces && faces[0] && faces[0].toughness);
  if (tg != null && /^\d+$/.test(String(tg))) fresh.endurance = +tg;
  const art = sc.artist || (faces && faces[0] && faces[0].artist);
  if (art) fresh.artist = art;
  reanalyser(fresh);

  if (!target) {
    if (uris) {
      fresh.img = uris.small || uris.normal;
      fresh.imgN = uris.normal || uris.large || fresh.img;
      fresh.imgL = uris.large || uris.png || fresh.imgN;
    }
    if (versoUris) {
      fresh.imgB = versoUris.normal || versoUris.small;
      fresh.imgBL = versoUris.large || fresh.imgB;
    }
    if (sc.purchase_uris && sc.purchase_uris.cardmarket) fresh.cmUrl = sc.purchase_uris.cardmarket;
    registerCard(fresh);
    return true;
  }

  target = renameCard(target, sc.name);
  Object.assign(target, fresh, {name:target.name});
  if (uris) {
    target.img = uris.small || uris.normal;
    target.imgN = uris.normal || uris.large || target.img;
    target.imgL = uris.large || uris.png || target.imgN;
  }
  if (versoUris) {
    target.imgB = versoUris.normal || versoUris.small;
    target.imgBL = versoUris.large || target.imgB;
  }
  if (sc.purchase_uris && sc.purchase_uris.cardmarket) target.cmUrl = sc.purchase_uris.cardmarket;
  target.unknown = false;
  return true;
}

const scryQueue = [];
let scryBusy = false;

/* Une carte mérite un aller-retour Scryfall tant qu'il lui manque son visuel
   (mode images) ou son texte oracle complet : la base intégrée n'en garde
   qu'un résumé, ce qui coupait par exemple l'alternative d'un sort. */
function besoinScryfall(c) {
  if (!c || c.unknown) return false;
  if (S.images && !c.img && !c.imgTried) return true;
  return !c.textFull && !c.texteTried;
}

function queueScryfall(cards) {
  if (S.scryHS || typeof fetch !== 'function') return;
  cards.forEach(c => {
    if (!besoinScryfall(c)) return;
    c.imgTried = true;
    c.texteTried = true;
    scryQueue.push(c.name);
  });
  if (scryQueue.length && !scryBusy) runScryQueue();
}

async function runScryQueue() {
  scryBusy = true;
  while (scryQueue.length && !S.scryHS) {
    const chunk = scryQueue.splice(0, 75);
    try {
      const r = await fetch('https://api.scryfall.com/cards/collection', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({identifiers: chunk.map(n => ({name: n}))})
      });
      if (!r.ok) throw new Error('HTTP ' + r.status);
      const j = await r.json();
      (j.data || []).forEach(sc => applyScryfall(sc, scryTarget(sc, null), true));
    } catch(err) {
      S.scryHS = true;
      scryBusy = false;
      if (S.images) {
        S.imagesFailed = true;
        toast("Visuels indisponibles (hors ligne ou accès bloqué). L'affichage reste en mode texte.");
      } else {
        toast("Textes complets indisponibles (hors ligne ou accès bloqué) : les résumés de la base intégrée restent affichés.");
      }
      renderB();
      return;
    }
    renderB();
    renderE();
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
      try {
        const r = await fetch('https://api.scryfall.com/cards/collection', {
          method: 'POST',
          headers: {'Content-Type': 'application/json'},
          body: JSON.stringify({identifiers: chunk.map(x => ({name: x.ident}))})
        });
        if (!r.ok) throw new Error('HTTP ' + r.status);
        const j = await r.json();
        (j.data || []).forEach(sc => {
          const t = scryTarget(sc, map);
          if (t && reste.has(t) && applyScryfall(sc, t)) { ok++; reste.delete(t); }
        });
      } catch(err) { failed = err.message || 'réseau indisponible'; return; }
      toast(`${libelle} : ${Math.min(i + 75, items.length)} / ${items.length}…`);
      await new Promise(res => setTimeout(res, 90));
    }
  }

  await passe(todo.map(c => ({ident: c.name})), 'Complétion');

  const dfc = [...reste].filter(c => c.name.includes(' // '));
  if (dfc.length && !failed) await passe(dfc.map(c => ({ident: frontFace(c.name)})), 'Faces avant');

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
  else toast(`${ok} carte(s) complétées${manquantes.length ? ` · ${manquantes.length} introuvable(s) : ${manquantes.slice(0,3).join(', ')}${manquantes.length>3?'…':''}` : ''}.`);
}

let scrySeq = 0, scryTimer = null, scryRes = new Map(), scryEtat = '';

async function chercheScryfall(q, cible) {
  const seq = ++scrySeq;
  if (typeof fetch !== 'function' || norm(q).length < 3) { scryRes = new Map(); scryEtat = ''; return; }
  scryEtat = 'chargement';
  majResultats(cible, true);
  try {
    const r = await fetch('https://api.scryfall.com/cards/search?order=name&unique=cards&q=' + encodeURIComponent(q));
    if (seq !== scrySeq) return;
    if (r.status === 404) { scryRes = new Map(); scryEtat = 'aucune'; majResultats(cible, true); return; }
    if (!r.ok) throw new Error('HTTP ' + r.status);
    const j = await r.json();
    scryRes = new Map((j.data || [])
      .filter(sc => colorOK({identity: sc.color_identity || []}))
      .slice(0, 12).map(sc => [norm(sc.name), sc]));
    scryEtat = 'ok';
  } catch(err) {
    if (seq !== scrySeq) return;
    scryRes = new Map();
    scryEtat = 'hors-ligne';
  }
  majResultats(cible, true);
}

async function chercheVerso(card) {
  if (!card || card.imgB || card.versoTried || typeof fetch !== 'function') return false;
  if (!/ \/\/ /.test(card.type||'') && !/ \/\/ /.test(card.name||'')) return false;
  card.versoTried = true;
  try {
    const r = await fetch('https://api.scryfall.com/cards/named?exact=' + encodeURIComponent(frontFace(card.name)));
    if (!r.ok) return false;
    applyScryfall(await r.json(), card, true);
    if (card.imgB) { scheduleSave(); return true; }
  } catch(err) {}
  return false;
}

/* Complète le texte oracle d'une seule carte, pour la fiche ouverte : sans
   cela une carte de la base intégrée reste affichée avec son résumé. */
async function chercheTexte(card) {
  if (!card || card.unknown || card.textFull || card.texteTried) return false;
  if (typeof fetch !== 'function' || S.scryHS) return false;
  card.texteTried = true;
  try {
    const r = await fetch('https://api.scryfall.com/cards/named?exact=' + encodeURIComponent(frontFace(card.name)));
    if (!r.ok) return false;
    const avant = card.text;
    applyScryfall(await r.json(), card, true);
    if (card.text !== avant) { scheduleSave(); return true; }
  } catch(err) {}
  return false;
}

function carteDepuisScryfall(sc) {
  const faces = sc.card_faces && sc.card_faces.length ? sc.card_faces : null;
  const cost = sc.mana_cost || (faces ? faces[0].mana_cost : '') || '—';
  const type = sc.type_line || (faces ? faces[0].type_line : '') || '';
  const text = faces && !sc.oracle_text
    ? faces.map(f => (f.oracle_text || '').replace(/\n/g, ' // ')).join(' // ')
    : (sc.oracle_text || '').replace(/\n/g, ' // ');
  const price = parseFloat((sc.prices && (sc.prices.eur || sc.prices.usd)) || 0) || 0;
  const c = buildCard(sc.name, cost, type, price, text);
  applyScryfall(sc, c, true);
  return c;
}

function enrichAllUnknown() {
  const unknowns = DB.filter(c => c.unknown).map(c => c.name);
  if (!unknowns.length) {
    toast('Toutes les cartes sont déjà complétées.');
    return;
  }
  completeUnknown(unknowns);
}
