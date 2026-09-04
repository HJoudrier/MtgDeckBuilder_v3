/* =====================================================================
   js/externes.js — EDHREC, Commander Spellbook & Catalogue complet Scryfall
   ===================================================================== */

/* 1. EDHREC */
const EDHREC_CACHE = new Map();

function edhrecSlug(name) {
  return frontFace(name).toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/['\u2019]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
}

async function fetchEdhrecCommander(cmdName, force) {
  const slug = edhrecSlug(cmdName);
  if (!force && EDHREC_CACHE.has(slug)) {
    return EDHREC_CACHE.get(slug);
  }
  try {
    const r = await fetch('https://json.edhrec.com/pages/commanders/' + slug + '.json');
    if (!r.ok) throw new Error(r.status === 404 ? 'absent d\'EDHREC' : 'HTTP ' + r.status);
    const j = await r.json();
    const dict = ((j.container || {}).json_dict) || {};
    const map = new Map();
    (dict.cardlists || []).forEach(l => (l.cardviews || []).forEach(cv => {
      const pot = cv.potential_decks || 0, nd = cv.num_decks || 0;
      const rec = {
        name: cv.name,
        inclusion: pot ? nd/pot : 0,
        synergy: cv.synergy || 0,
        decks: nd,
        potentiel: pot,
        liste: l.header || '',
        commandant: cmdName
      };
      const k = norm(cv.name);
      if (!map.has(k) || map.get(k).decks < nd) map.set(k, rec);
      const f = '~' + loose(frontFace(cv.name));
      if (!map.has(f) || map.get(f).decks < nd) map.set(f, rec);
    }));
    if (!map.size) throw new Error('aucune donnée exploitable');
    const data = {
      slug,
      status: 'ok',
      error: null,
      commandant: cmdName,
      total: (dict.card || {}).num_decks || 0,
      map,
      url: 'https://edhrec.com/commanders/' + slug
    };
    EDHREC_CACHE.set(slug, data);
    return data;
  } catch(err) {
    const errData = {
      slug,
      status: 'error',
      error: err.message || 'requête refusée',
      commandant: cmdName,
      total: 0,
      map: new Map(),
      url: 'https://edhrec.com/commanders/' + slug
    };
    EDHREC_CACHE.set(slug, errData);
    return errData;
  }
}

function edhrecFor(card) {
  if (!card) return null;
  const k = norm(card.name);
  const f = '~' + loose(frontFace(card.name));
  
  if (S.edhrec && S.edhrec.data && S.edhrec.data.map) {
    const r = S.edhrec.data.map.get(k) || S.edhrec.data.map.get(f);
    if (r) {
      const secondaires = [];
      if (S.edhrec.secondaires && S.edhrec.secondaires.length) {
        S.edhrec.secondaires.forEach(sec => {
          if (!sec || !sec.map) return;
          const sr = sec.map.get(k) || sec.map.get(f);
          if (sr) secondaires.push({ ...sr, commandant: sec.commandant, role: 'secondaire' });
        });
      }
      return { ...r, commandant: S.edhrec.data.commandant || S.commander, role: 'principal', secondaires };
    }
  }

  if (S.edhrec && S.edhrec.secondaires && S.edhrec.secondaires.length) {
    const matches = [];
    S.edhrec.secondaires.forEach(sec => {
      if (!sec || !sec.map) return;
      const sr = sec.map.get(k) || sec.map.get(f);
      if (sr) matches.push({ ...sr, commandant: sec.commandant, role: 'secondaire' });
    });
    if (matches.length) {
      matches.sort((a, b) => (b.synergy * 10 + b.inclusion * 8) - (a.synergy * 10 + a.inclusion * 8));
      const best = matches[0];
      return { ...best, secondaires: matches.slice(1) };
    }
  }
  return null;
}

function edhrecAllFor(card) {
  if (!card) return [];
  const k = norm(card.name);
  const f = '~' + loose(frontFace(card.name));
  const list = [];
  const seenCmds = new Set();

  // 1. Commandant sélectionné (principal)
  const cmdPrincipal = S.commander || (S.edhrec && S.edhrec.data && S.edhrec.data.commandant);
  if (cmdPrincipal) {
    let r = null;
    if (S.edhrec && S.edhrec.data && S.edhrec.data.map) {
      r = S.edhrec.data.map.get(k) || S.edhrec.data.map.get(f);
    }
    if (!r) {
      const slug = edhrecSlug(cmdPrincipal);
      const cached = EDHREC_CACHE.get(slug);
      if (cached && cached.map) {
        r = cached.map.get(k) || cached.map.get(f);
      }
    }
    if (r) {
      seenCmds.add(norm(cmdPrincipal));
      list.push({ ...r, commandant: cmdPrincipal, role: 'principal', isSelected: true });
    }
  }

  // 2. Commandants secondaires depuis S.edhrec.secondaires
  if (S.edhrec && S.edhrec.secondaires && S.edhrec.secondaires.length) {
    S.edhrec.secondaires.forEach(sec => {
      if (!sec || !sec.map || !sec.commandant) return;
      const cmdKey = norm(sec.commandant);
      if (seenCmds.has(cmdKey)) return;
      const sr = sec.map.get(k) || sec.map.get(f);
      if (sr) {
        seenCmds.add(cmdKey);
        list.push({ ...sr, commandant: sec.commandant, role: 'secondaire', isSelected: false });
      }
    });
  }

  // 3. Commandants secondaires du deck non encore dans S.edhrec.secondaires mais dans EDHREC_CACHE
  const secDeckCards = commandantsPossibles ? commandantsPossibles().filter(c => !cmdPrincipal || norm(c.name) !== norm(cmdPrincipal)) : [];
  secDeckCards.forEach(sc => {
    const cmdKey = norm(sc.name);
    if (seenCmds.has(cmdKey)) return;
    const slug = edhrecSlug(sc.name);
    const cached = EDHREC_CACHE.get(slug);
    if (cached && cached.map) {
      const sr = cached.map.get(k) || cached.map.get(f);
      if (sr) {
        seenCmds.add(cmdKey);
        list.push({ ...sr, commandant: sc.name, role: 'secondaire', isSelected: false });
      }
    }
  });

  return list;
}

async function loadEdhrec(force) {
  const cmd = S.commander ? find(S.commander) : null;
  const secCmds = commandantsSecondaires();
  if (!cmd && !secCmds.length) {
    toast("Désignez un commandant en section D ou ajoutez des créatures légendaires au deck.");
    return;
  }
  const cmdSig = (cmd ? cmd.name : '') + '::' + secCmds.map(c => c.name).sort().join('|');
  if (!force && S.edhrec.cmdSignature === cmdSig && S.edhrec.status !== 'idle' && S.edhrec.status !== 'error') {
    return;
  }
  
  const slug = cmd ? edhrecSlug(cmd.name) : null;
  S.edhrec.slug = slug;
  S.edhrec.status = 'loading';
  S.edhrec.secStatus = secCmds.length ? 'loading' : 'idle';
  S.edhrec.cmdSignature = cmdSig;
  renderF();

  try {
    const promises = [];
    if (cmd) promises.push(fetchEdhrecCommander(cmd.name, force));
    secCmds.forEach(sc => promises.push(fetchEdhrecCommander(sc.name, force)));

    const results = await Promise.allSettled(promises);
    
    let primaryData = null;
    let primaryErr = null;
    const secDataList = [];

    let resIdx = 0;
    if (cmd) {
      const pRes = results[resIdx++];
      if (pRes.status === 'fulfilled' && pRes.value && pRes.value.status === 'ok') {
        primaryData = pRes.value;
      } else {
        primaryErr = (pRes.status === 'fulfilled' && pRes.value && pRes.value.error) || (pRes.reason && pRes.reason.message) || 'erreur de chargement';
      }
    }

    while (resIdx < results.length) {
      const sRes = results[resIdx++];
      if (sRes.status === 'fulfilled' && sRes.value && sRes.value.status === 'ok') {
        secDataList.push(sRes.value);
      }
    }

    S.edhrec.data = primaryData;
    S.edhrec.secondaires = secDataList;
    S.edhrec.status = primaryData ? 'ok' : (primaryErr ? 'error' : (secDataList.length ? 'ok' : 'idle'));
    S.edhrec.error = primaryErr;
    S.edhrec.secStatus = secDataList.length ? 'ok' : (secCmds.length ? 'error' : 'idle');
  } catch(err) {
    S.edhrec.status = 'error';
    S.edhrec.error = err.message || 'requête refusée';
  }
  renderF();
}

/* 1 bis. Archétypes établis : thèmes EDHREC
   Une page par thème, même hôte et même forme que les pages de
   commandant déjà exploitées ci-dessus. Les noms retenus alimentent
   `ARCH_BASE` (js/etat.js) et sont conservés dans IndexedDB. */

const ARCH_CLE_IDB = 'archetypes';
const ARCH_PAUSE = 130;   // ms entre deux requêtes, par courtoisie envers EDHREC

/* json.edhrec.com est un dépôt de fichiers : une clé absente répond
   « AccessDenied », jamais 404. La forme d'adresse des pages de thème
   n'est donc pas devinable — on la cherche une fois, par sondage, avant
   de charger quoi que ce soit. Les pages de commandant, elles, sont
   connues : elles servent de témoin pour distinguer une adresse fausse
   d'un hôte injoignable. */
const ARCH_HOTE = 'https://json.edhrec.com/pages/';

const ARCH_FORMES = [
  ['themes/<slug>',      slug => `${ARCH_HOTE}themes/${encodeURIComponent(slug)}.json`],
  ['tags/<slug>',        slug => `${ARCH_HOTE}tags/${encodeURIComponent(slug)}.json`],
  ['theme/<slug>',       slug => `${ARCH_HOTE}theme/${encodeURIComponent(slug)}.json`],
  ['themes/<slug>/all',  slug => `${ARCH_HOTE}themes/${encodeURIComponent(slug)}/all.json`],
  ['tags/<slug>/all',    slug => `${ARCH_HOTE}tags/${encodeURIComponent(slug)}/all.json`]
];

const ARCH_SONDES = ['aristocrats', 'tokens'];
const ARCH_TEMOIN = ARCH_HOTE + 'commanders/atraxa-praetors-voice.json';

function pauseEdhrec() {
  return new Promise(res => setTimeout(res, ARCH_PAUSE));
}

/* Dernier recours : une page de commandant cite les pages de thème du
   site. On y cherche le segment qui précède un thème connu, pour en
   déduire le préfixe des clés plutôt que de continuer à deviner. */
async function formesDeduites() {
  try {
    const r = await fetch(ARCH_TEMOIN);
    if (!r.ok) return [];
    const txt = JSON.stringify(await r.json());
    const re = new RegExp('/([a-z0-9-]+)/(' + ARCH_SONDES.join('|') + ')(?=["/?])', 'gi');
    const prefixes = new Set();
    let m;
    while ((m = re.exec(txt))) prefixes.add(m[1].toLowerCase());
    return [...prefixes].map(pre => [`${pre}/<slug> (déduit)`,
      slug => `${ARCH_HOTE}${pre}/${encodeURIComponent(slug)}.json`]);
  } catch(err) {
    return [];
  }
}

/* Cherche la forme d'adresse qui répond avec des cartes lisibles.
   Retourne le constructeur d'URL, ou null en notant les essais. */
async function formeThemeEdhrec() {
  if (ARCH_BASE.forme) return ARCH_BASE.forme;
  ARCH_BASE.essais = [];
  const deduites = [];
  for (const slug of ARCH_SONDES) {
    for (const [nom, url] of ARCH_FORMES.concat(deduites)) {
      const adresse = url(slug);
      try {
        const r = await fetch(adresse);
        if (r.ok) {
          const noms = nomsPageEdhrec(await r.json());
          ARCH_BASE.essais.push(`${nom} → ${r.status}, ${noms.size} carte(s)`);
          if (noms.size) { ARCH_BASE.forme = url; return url; }
        } else {
          ARCH_BASE.essais.push(`${nom} → HTTP ${r.status}`);
        }
      } catch(err) {
        ARCH_BASE.essais.push(`${nom} → ${err.message || 'échec réseau'}`);
      }
      await pauseEdhrec();
    }
    if (!deduites.length) {
      const trouvees = await formesDeduites();
      trouvees.forEach(f => {
        if (!ARCH_FORMES.some(([n]) => n.split(' ')[0] === f[0].split(' ')[0])) deduites.push(f);
      });
      for (const [nom, url] of deduites) {
        const adresse = url(slug);
        try {
          const r = await fetch(adresse);
          if (r.ok) {
            const noms = nomsPageEdhrec(await r.json());
            ARCH_BASE.essais.push(`${nom} → ${r.status}, ${noms.size} carte(s)`);
            if (noms.size) { ARCH_BASE.forme = url; return url; }
          } else {
            ARCH_BASE.essais.push(`${nom} → HTTP ${r.status}`);
          }
        } catch(err) {
          ARCH_BASE.essais.push(`${nom} → ${err.message || 'échec réseau'}`);
        }
        await pauseEdhrec();
      }
    }
  }
  return null;
}

/* Témoin : une page de commandant, dont l'adresse est sûre. */
async function temoinEdhrec() {
  try {
    const r = await fetch(ARCH_TEMOIN);
    return r.ok;
  } catch(err) {
    return false;
  }
}

/* Noms de cartes d'une page EDHREC, quelle que soit la variante de forme. */
function nomsPageEdhrec(j) {
  const noms = new Set();
  const ajoute = cv => { if (cv && cv.name) noms.add(norm(cv.name)); };
  const dict = ((j && j.container) || {}).json_dict || {};
  (dict.cardlists || []).forEach(l => (l.cardviews || []).forEach(ajoute));
  if (!noms.size) (((j || {}).cardlists) || []).forEach(l => (l.cardviews || []).forEach(ajoute));
  if (!noms.size && Array.isArray((j || {}).cardviews)) j.cardviews.forEach(ajoute);
  return noms;
}

function indexDepuisCartes(cartes) {
  const index = new Map();
  Object.keys(cartes || {}).forEach(nom => index.set(nom, new Set(cartes[nom])));
  return index;
}

function cartesDepuisIndex(index) {
  const cartes = {};
  index.forEach((ids, nom) => cartes[nom] = [...ids]);
  return cartes;
}

/* Reprise du cache local, au démarrage. */
async function reprendreArchetypesEdhrec() {
  try {
    const memo = await idbLire(ARCH_CLE_IDB);
    if (!memo || memo.v !== 2) return false;
    ARCH_BASE.index = indexDepuisCartes(memo.cartes || {});
    ARCH_BASE.themes = memo.themes || {};
    ARCH_BASE.liste = memo.liste || [];
    ARCH_BASE.maj = memo.maj || null;
    ARCH_BASE.etat = ARCH_BASE.liste.length ? 'ok' : 'idle';
    return ARCH_BASE.liste.length > 0;
  } catch(err) {
    return false;
  }
}

/* Index des thèmes publiés par EDHREC : une requête, quelques centaines
   d'entrées. Les cartes d'un thème ne sont cherchées qu'à la demande. */
function urlIndexEdhrec(pre) {
  return `${ARCH_HOTE}${pre}.json`;
}

/* Description que la page d'un thème porte parfois en tête. */
function descriptionPageEdhrec(j) {
  const dict = ((j && j.container) || {}).json_dict || j || {};
  const brut = dict.description || dict.blurb || (dict.header && dict.header.description) || '';
  const txt = String(brut).replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
  return txt.length > 20 && txt.length < 400 ? txt : '';
}

/* Noms et libellés des thèmes, quelle que soit la variante de forme. */
function themesPageEdhrec(j) {
  const out = new Map();
  const ajoute = x => {
    if (!x) return;
    const href = String(x.href || x.url || x.slug || x.value || '');
    const slug = href.split('?')[0].replace(/\/+$/, '').split('/').filter(Boolean).pop();
    if (!slug || /^https?:$/i.test(slug)) return;
    const label = String(x.value || x.name || x.label || slug);
    const n = x.count || x.num_decks || x.card_count || 0;
    const desc = String(x.description || x.blurb || x.subtitle || x.text || '').trim();
    if (!out.has(slug)) out.set(slug, {slug, label, n, desc});
  };
  const visite = v => {
    if (Array.isArray(v)) return v.forEach(visite);
    if (!v || typeof v !== 'object') return;
    if (v.href || v.url) ajoute(v);
    Object.values(v).forEach(visite);
  };
  visite((j && j.container && j.container.json_dict) || j);
  return [...out.values()];
}

/* Cherche l'index, en partant du préfixe déjà validé pour les thèmes. */
async function chargerListeArchetypesEdhrec(force) {
  if (!force && ARCH_BASE.liste.length) return ARCH_BASE.liste;
  const url = await formeThemeEdhrec();
  if (!url) return [];
  const pre = url('x').replace(ARCH_HOTE, '').replace(/\/?x(\/all)?\.json$/, '');
  for (const candidat of [pre, pre + 's', 'themes', 'tags']) {
    if (!candidat) continue;
    try {
      const r = await fetch(urlIndexEdhrec(candidat));
      if (!r.ok) { ARCH_BASE.essais.push(`index ${candidat} → HTTP ${r.status}`); continue; }
      const themes = themesPageEdhrec(await r.json())
        .filter(t => t.slug && !/^(commanders?|cards?|decks?|articles?)$/i.test(t.slug));
      ARCH_BASE.essais.push(`index ${candidat} → ${themes.length} thème(s)`);
      if (themes.length >= 5) {
        ARCH_BASE.liste = themes.sort((a, b) => (b.n || 0) - (a.n || 0) || a.label.localeCompare(b.label));
        return ARCH_BASE.liste;
      }
    } catch(err) {
      ARCH_BASE.essais.push(`index ${candidat} → ${err.message || 'échec réseau'}`);
    }
    await pauseEdhrec();
  }
  return [];
}

/* Cartes d'un thème, cherchées à la première utilisation puis gardées. */
async function chargerThemeEdhrec(slug) {
  if (!slug || ARCH_BASE.themes[slug] || ARCH_BASE.enCours.has(slug)) return;
  const url = await formeThemeEdhrec();
  if (!url) return;
  ARCH_BASE.enCours.add(slug);
  try {
    const r = await fetch(url(slug));
    if (!r.ok) throw new Error('HTTP ' + r.status);
    const j = await r.json();
    const noms = nomsPageEdhrec(j);
    noms.forEach(n => {
      const s = ARCH_BASE.index.get(n) || new Set();
      s.add(slug);
      ARCH_BASE.index.set(n, s);
    });
    ARCH_BASE.themes[slug] = {n:noms.size, desc:descriptionPageEdhrec(j)};
    ARCH_BASE.maj = Date.now();
    sauverArchetypesEdhrec();
  } catch(err) {
    ARCH_BASE.themes[slug] = {n:0, erreur:err.message || 'échec'};
  } finally {
    ARCH_BASE.enCours.delete(slug);
    if (typeof majFenetreFiltres === 'function') majFenetreFiltres();
    if (typeof renderAll === 'function') renderAll();
  }
}

function sauverArchetypesEdhrec() {
  idbEcrire(ARCH_CLE_IDB, {
    v:2, maj:ARCH_BASE.maj, liste:ARCH_BASE.liste, themes:ARCH_BASE.themes,
    cartes:cartesDepuisIndex(ARCH_BASE.index)
  }).catch(() => {});
}

/* Chargement à la demande : l'index, puis les thèmes déjà cochés. */
async function chargerArchetypesEdhrec(force) {
  if (ARCH_BASE.etat === 'chargement') return;
  if (typeof fetch !== 'function') {
    ARCH_BASE.etat = 'erreur';
    ARCH_BASE.erreur = 'ce navigateur ne sait pas interroger EDHREC';
    return;
  }
  ARCH_BASE.etat = 'chargement';
  ARCH_BASE.erreur = '';
  if (force) { ARCH_BASE.forme = null; ARCH_BASE.liste = []; }
  if (typeof majFenetreFiltres === 'function') majFenetreFiltres();

  const liste = await chargerListeArchetypesEdhrec(force);
  if (!liste.length) {
    const hoteOK = await temoinEdhrec();
    ARCH_BASE.etat = 'erreur';
    ARCH_BASE.erreur = hoteOK
      ? "la liste des thèmes n'est pas à l'adresse attendue (l'hôte répond pourtant pour les commandants)"
      : 'EDHREC injoignable depuis ce navigateur (hors ligne, CORS ou accès bloqué)';
  } else {
    ARCH_BASE.etat = 'ok';
    ARCH_BASE.maj = Date.now();
    sauverArchetypesEdhrec();
    for (const slug of archetypesAChargerEdhrec()) await chargerThemeEdhrec(slug);
  }
  if (typeof majFenetreFiltres === 'function') majFenetreFiltres();
  if (typeof renderAll === 'function') renderAll();
  if (typeof toast === 'function') {
    toast(ARCH_BASE.etat === 'ok'
      ? `${ARCH_BASE.liste.length} thèmes EDHREC disponibles.`
      : `Archétypes EDHREC : ${ARCH_BASE.erreur}.`);
  }
}

/* 2. Commander Spellbook */
function deckSignature() {
  return deckEntries().map(e => e.card.name + '×' + e.qty).sort().join('|') + '||' + (S.commander || '');
}

function comboDepuisVariante(v) {
  const cartes = (v.uses || []).map(u => (u && u.card && (u.card.name || u.card)) || u.cardName || '').filter(Boolean);
  const produit = (v.produces || []).map(x => (x && x.feature && (x.feature.name || x.feature)) || x.name || '').filter(Boolean);
  return {
    id: v.id,
    cartes,
    produit,
    description: v.description || '',
    prerequis: v.otherPrerequisites || v.other_prerequisites || '',
    mana: v.manaNeeded || v.mana_needed || '',
    url: 'https://commanderspellbook.com/combo/' + v.id + '/'
  };
}

let csbTimer = null;

function scheduleCombos() {
  if (typeof fetch !== 'function') return;
  const sig = deckSignature();
  if (S.csb.sig === sig || S.csb.status === 'loading') return;
  clearTimeout(csbTimer);
  csbTimer = setTimeout(() => loadCombos(), 1200);
}

async function loadCombos(force) {
  const sig = deckSignature();
  if (!force && S.csb.sig === sig) return;
  const entries = deckEntries();
  if (entries.length < 2) { S.csb = {sig, status:'idle', data:null, error:null}; return; }
  S.csb = {sig, status:'loading', data:S.csb.data, error:null};
  renderE();
  const cmd = S.commander ? [{card:S.commander, quantity:1}] : [];
  const main = entries.filter(e => e.card.name !== S.commander).map(e => ({card:e.card.name, quantity:e.qty}));
  const CIBLE = 'https://backend.commanderspellbook.com/find-my-combos';
  const adresse = () => S.csbRelay
    ? S.csbRelay.replace('{url}', encodeURIComponent(CIBLE)) + (S.csbRelay.includes('{url}') ? '' : encodeURIComponent(CIBLE))
    : CIBLE;

  const envoyer = async(corps, type) => fetch(adresse(), {
    method: 'POST',
    headers: {'Content-Type': type || 'application/json'},
    body: JSON.stringify(corps)
  });

  try {
    let r = null, bloque = null;
    for (const type of ['application/json', 'text/plain;charset=UTF-8']) {
      try {
        r = await envoyer({commanders:cmd, main}, type);
        if (r.status === 400) r = await envoyer({main:[...cmd, ...main]}, type);
        if (r.status === 415) { r = null; continue; }
        break;
      } catch(err) { bloque = err; r = null; }
    }
    if (!r) throw bloque || new Error('requête bloquée par le navigateur');
    if (!r.ok) throw new Error('HTTP ' + r.status);
    const j = await r.json();
    const res = j.results || j;
    const dansDeck = new Set(entries.map(e => norm(e.card.name)));
    const assembles = (res.included || []).map(comboDepuisVariante);
    const presque = [...(res.almostIncluded || []), ...(res.almostIncludedByAddingColors || [])]
      .map(comboDepuisVariante)
      .map(c => ({...c, manquantes:c.cartes.filter(n => !dansDeck.has(norm(n)))}))
      .filter(c => c.manquantes.length > 0 && c.manquantes.length <= 2);

    const parManquante = new Map(), parCarte = new Map();
    const ajoute = (m, k, v) => {
      const key = norm(k);
      if (!m.has(key)) m.set(key, []);
      if (m.get(key).length < 6) m.get(key).push(v);
    };
    presque.forEach(c => c.manquantes.forEach(n => ajoute(parManquante, n, c)));
    [...assembles, ...presque].forEach(c => c.cartes.forEach(n => ajoute(parCarte, n, c)));
    S.csb = {sig, status:'ok', error:null, data:{assembles, presque, parManquante, parCarte}};
  } catch(err) {
    const cors = (err instanceof TypeError) || /Failed to fetch|NetworkError|Load failed/i.test(err.message || '');
    S.csb = {sig, status:cors ? 'cors' : 'error', data:null, error:err.message || 'requête refusée'};
  }
  renderE();
  renderF();
}

function combosDe(card) {
  const d = S.csb.data;
  if (!d || !card) return [];
  return d.parCarte.get(norm(card.name)) || d.parCarte.get(norm(frontFace(card.name))) || [];
}

function combosCompletesPar(card) {
  const d = S.csb.data;
  if (!d || !card) return [];
  return d.parManquante.get(norm(card.name)) || d.parManquante.get(norm(frontFace(card.name))) || [];
}

function libelleCombo(c, carteCourante, liens) {
  const autres = c.cartes.filter(n => !carteCourante || norm(n) !== norm(carteCourante.name));
  const noms = liens ? autres.map(refCarte) : autres.map(esc);
  return `${noms.join(' + ')}${c.produit.length ? ` → ${esc(c.produit.slice(0,3).join(', '))}` : ''}`;
}

/* 3. Catalogue Scryfall IndexedDB (CAT et CH sont définis dans js/etat.js) */
const IDB_NOM = 'mtg-atelier', IDB_MAG = 'catalogue';

function idb() {
  return new Promise((ok, ko) => {
    if (typeof indexedDB === 'undefined') return ko(new Error('IndexedDB indisponible'));
    const r = indexedDB.open(IDB_NOM, 1);
    r.onupgradeneeded = () => { if (!r.result.objectStoreNames.contains(IDB_MAG)) r.result.createObjectStore(IDB_MAG); };
    r.onsuccess = () => ok(r.result);
    r.onerror = () => ko(r.error);
  });
}

function idbLire(cle) {
  return idb().then(db => new Promise((ok, ko) => {
    const t = db.transaction(IDB_MAG, 'readonly').objectStore(IDB_MAG).get(cle);
    t.onsuccess = () => ok(t.result);
    t.onerror = () => ko(t.error);
  }));
}

function idbEcrire(cle, val) {
  return idb().then(db => new Promise((ok, ko) => {
    const t = db.transaction(IDB_MAG, 'readwrite').objectStore(IDB_MAG).put(val, cle);
    t.onsuccess = () => ok(true);
    t.onerror = () => ko(t.error);
  }));
}

function idbVider() {
  return idb().then(db => new Promise(ok => {
    const t = db.transaction(IDB_MAG, 'readwrite').objectStore(IDB_MAG).clear();
    t.onsuccess = () => ok(true);
    t.onerror = () => ok(false);
  })).catch(() => false);
}

function compacte(sc) {
  const faces = sc.card_faces && sc.card_faces.length ? sc.card_faces : null;
  const type = sc.type_line || (faces ? faces[0].type_line : '');
  if (!type || /\btoken\b|\bemblem\b/i.test(type)) return null;
  if (/^basic land/i.test(type)) return null;
  if (sc.layout && /token|emblem|art_series|double_faced_token/.test(sc.layout)) return null;
  const cost = (sc.mana_cost && sc.mana_cost.length ? sc.mana_cost : (faces ? (faces[0].mana_cost||'') : '')) || '';
  const texte = faces && !sc.oracle_text
    ? faces.map(f => (f.oracle_text||'').replace(/\n/g, ' // ')).join(' // ')
    : (sc.oracle_text||'').replace(/\n/g, ' // ');
  const pw = sc.power || (faces && faces[0] && faces[0].power);
  const tg = sc.toughness || (faces && faces[0] && faces[0].toughness);
  const lg = sc.legalities || {};
  const uris = sc.image_uris || (faces && faces[0] && faces[0].image_uris) || null;
  const versoUris = faces && faces[1] && faces[1].image_uris || null;
  const chemin = uris && uris.normal ? String(uris.normal).replace('https://cards.scryfall.io/normal/', '') : '';
  const verso = versoUris && versoUris.normal ? String(versoUris.normal).replace('https://cards.scryfall.io/normal/', '') : '';
  return [
    sc.name, cost, type, texte, sc.cmc||0, (sc.color_identity||[]).join(''),
    (pw != null && /^\d+$/.test(String(pw))) ? +pw : null,
    parseFloat((sc.prices && (sc.prices.eur || sc.prices.usd)) || 0) || 0,
    sc.id || '', (typeof sc.edhrec_rank === 'number') ? sc.edhrec_rank : 999999,
    (lg.commander === 'legal' ? 'c' : '') + (lg.standard === 'legal' ? 's' : ''), chemin, verso,
    (tg != null && /^\d+$/.test(String(tg))) ? +tg : null,
    sc.artist || (faces && faces[0] && faces[0].artist) || ''
  ];
}

const CDN = 'https://cards.scryfall.io/';

function autoCatalogue() {
  if (typeof fetch !== 'function' || typeof indexedDB === 'undefined') return false;
  if (!S.catalogueActif) return false;
  if (saveState === 'desactive') return false;
  const co = (typeof navigator !== 'undefined') && navigator.connection;
  if (co && (co.saveData || /(^|-)2g$/.test(co.effectiveType || ''))) return false;
  return true;
}

const FICHIERS_LOCAUX = [
  'oracle-cards.jsonl.gz', 'oracle-cards.json.gz', 'oracle-cards.jsonl', 'oracle-cards.json',
  'default-cards.jsonl.gz', 'default-cards.json.gz', 'all-cards.jsonl.gz', 'scryfall.jsonl.gz'
];

function estGzip(nom, octets) {
  if (/\.gz$/i.test(nom || '')) return true;
  return !!(octets && octets[0] === 0x1f && octets[1] === 0x8b);
}

async function fluxTexte(source, nom) {
  let flux = source.stream ? source.stream() : source.body;
  let gz = /\.gz$/i.test(nom || '');
  if (!gz && source.slice) {
    const tete = new Uint8Array(await source.slice(0, 2).arrayBuffer());
    gz = estGzip(nom, tete);
    flux = source.stream();
  }
  if (gz) {
    if (typeof DecompressionStream === 'undefined')
      throw new Error('ce navigateur ne sait pas décompresser le .gz ; fournissez le fichier décompressé');
    flux = flux.pipeThrough(new DecompressionStream('gzip'));
  }
  return flux.pipeThrough(new TextDecoderStream());
}

function retiens(par, rec) {
  const cle = norm(rec[CH.NOM]);
  const ancien = par.get(cle);
  if (!ancien) { par.set(cle, rec); return; }
  const mieux = (rec[CH.RANG] < ancien[CH.RANG]) ||
              (rec[CH.RANG] === ancien[CH.RANG] && rec[CH.PRIX] > 0 && ancien[CH.PRIX] <= 0);
  if (mieux) par.set(cle, rec);
}

function tailleEstimee(cartes) {
  if (!cartes.length) return 0;
  const pas = Math.max(1, Math.floor(cartes.length / 300));
  let somme = 0, n = 0;
  for (let i = 0; i < cartes.length; i += pas) { somme += JSON.stringify(cartes[i]).length; n++; }
  return Math.round(somme / n * cartes.length);
}

async function lireCatalogueFichier(source, nom) {
  CAT.etat = 'chargement'; CAT.source = 'fichier'; CAT.detail = ''; CAT.partiel = false; renderF();
  const par = new Map();
  const cartes = {get length(){ return par.size; }, push(rec){ retiens(par, rec); }};
  let impressions = 0, reste = '', tableau = null, lus = 0;
  const lecteur = (await fluxTexte(source, nom)).getReader();
  while (true) {
    const {done, value} = await lecteur.read();
    if (done) break;
    reste += value;
    if (tableau === null) tableau = /^\s*\[/.test(reste.slice(0, 64));
    if (tableau) continue;
    let i;
    while ((i = reste.indexOf('\n')) >= 0) {
      const ligne = reste.slice(0, i).trim().replace(/,$/, '');
      reste = reste.slice(i + 1);
      if (ligne.length < 2 || ligne === '[' || ligne === ']') continue;
      try { const c = compacte(JSON.parse(ligne)); if (c) { cartes.push(c); impressions++; } } catch(e) {}
      if (++lus % 25000 === 0) { CAT.cartes = [...par.values()]; renderF(); await new Promise(r => setTimeout(r, 0)); }
    }
  }
  if (tableau) {
    const brut = JSON.parse(reste);
    brut.forEach(sc => { const c = compacte(sc); if (c) { cartes.push(c); impressions++; } });
  } else {
    const fin = reste.trim().replace(/[,\]]$/, '');
    if (fin.length > 2) { try { const c = compacte(JSON.parse(fin)); if (c) { cartes.push(c); impressions++; } } catch(e) {} }
  }
  if (!par.size) throw new Error('aucune carte lisible dans ce fichier');
  CAT.cartes = [...par.values()];
  CAT.etat = 'ok';
  CAT.date = Date.now();
  CAT.maj = CAT.maj || null;
  appliqueCatalogueAuxCartes();
  CAT.octets = tailleEstimee(CAT.cartes);
  CAT.source = 'fichier';
  CAT.impressions = impressions;
  invaliderCandidats();
  if (saveState !== 'desactive' && S.catalogueActif)
    idbEcrire('cartes', {v:1, cartes:CAT.cartes, maj:CAT.maj, date:CAT.date, octets:CAT.octets}).catch(() => {});
  renderAll();
  toast(`${CAT.cartes.length.toLocaleString('fr-FR')} cartes retenues${
    impressions > CAT.cartes.length ? ` sur ${impressions.toLocaleString('fr-FR')} impressions lues` : ''}.`);
  return true;
}

async function chargerCatalogueLocal() {
  if (typeof fetch !== 'function') return false;
  for (const nom of FICHIERS_LOCAUX) {
    try {
      const r = await fetch(nom);
      if (!r.ok) continue;
      await lireCatalogueFichier(r, nom);
      return true;
    } catch(err) {}
  }
  return false;
}

async function verifierMajCatalogue() {
  if (typeof fetch !== 'function') return null;
  try {
    const r = await fetch('https://api.scryfall.com/bulk-data/oracle-cards');
    if (!r.ok) throw new Error('HTTP ' + r.status);
    const j = await r.json();
    CAT.majDispo = j.updated_at || null;
    CAT.uri = j.jsonl_download_uri || j.download_uri || '';
    CAT.taille = j.compressed_size || 0;
    CAT.tailleBrute = j.size || 0;
    renderF();
    return j;
  } catch(err) { return null; }
}

function catalogueObsolete() {
  if (!CAT.majDispo) return false;
  if (!CAT.maj) return CAT.etat === 'ok';
  return new Date(CAT.majDispo) > new Date(CAT.maj);
}

async function majPrix(force) {
  if (typeof fetch !== 'function') return;
  if (!force && S.prixMaj && Date.now() - S.prixMaj < 20 * 3600e3) return;
  const noms = [...new Set([...S.collection.keys(), ...S.deck.keys()])].filter(n => find(n));
  if (!noms.length) return;
  let maj = 0;
  for (let i = 0; i < noms.length; i += 75) {
    const lot = noms.slice(i, i + 75);
    try {
      const r = await fetch('https://api.scryfall.com/cards/collection', {
        method: 'POST',
        headers: {'Content-Type':'application/json'},
        body: JSON.stringify({identifiers: lot.map(n => ({name:n}))})
      });
      if (!r.ok) throw new Error('HTTP ' + r.status);
      const j = await r.json();
      (j.data || []).forEach(sc => {
        const c = scryTarget(sc, null);
        if (!c) return;
        const eurVal = parseFloat((sc.prices && (sc.prices.eur || sc.prices.eur_foil)) || 0) || 0;
        if (eurVal && c.price !== eurVal) { c.price = eurVal; maj++; }
        if (sc.purchase_uris && sc.purchase_uris.cardmarket) c.cmUrl = sc.purchase_uris.cardmarket;
      });
    } catch(err) { return; }
    await new Promise(r2 => setTimeout(r2, 110));
  }
  S.prixMaj = Date.now();
  renderAll();
  if (maj) toast(`${maj} prix mis à jour depuis Cardmarket.`);
}

async function telechargerCatalogue() {
  if (typeof fetch !== 'function') { toast('Téléchargement impossible dans ce contexte.'); return; }
  CAT.etat = 'chargement'; CAT.source = 'réseau'; CAT.detail = ''; renderF();
  const rafraichirFenetre = () => {
    const corps = document.getElementById('dlgBody');
    if (corps && corps.innerHTML.includes('Catalogue des cartes Magic')) {
      corps.innerHTML = corpsSauvegarde();
      brancherRestauration();
      brancherCatalogue();
    }
  };
  try {
    const info = await verifierMajCatalogue();
    const adresse = (info && (info.jsonl_download_uri || info.download_uri)) || CAT.uri;
    if (!adresse) throw new Error("adresse de téléchargement inconnue");
    toast(`Téléchargement de l'archive${CAT.taille ? ` (${(CAT.taille/1048576).toFixed(0)} Mo)` : ''}…`);
    const rep = await fetch(adresse);
    if (!rep.ok) throw new Error('HTTP ' + rep.status);
    CAT.maj = (info && info.updated_at) || null;
    await lireCatalogueFichier(rep, adresse);
    rafraichirFenetre();
  } catch(err) {
    const bloque = (err instanceof TypeError) || /Failed to fetch|NetworkError|Load failed/i.test(err.message || '');
    CAT.etat = bloque ? 'hors-ligne' : 'erreur';
    CAT.detail = bloque
      ? `le serveur de fichiers de Scryfall (data.scryfall.io) refuse la requête depuis une page tierce. Utilisez le bouton de téléchargement, puis chargez l'archive obtenue — sans la décompresser.`
      : `échec du téléchargement : ${err.message||'erreur inconnue'}`;
    renderF();
    rafraichirFenetre();
    toast(bloque ? "Téléchargement direct refusé par Scryfall : passez par le lien puis le chargement de fichier."
                 : `Échec : ${err.message||'erreur inconnue'}.`);
  }
}

async function chargerCatalogueComplet(force) {
  if (CAT.etat === 'chargement' || typeof fetch !== 'function') return;
  CAT.etat = 'chargement'; CAT.source = 'cache'; renderF();
  try {
    if (!force) {
      const memo = await idbLire('cartes').catch(() => null);
      if (memo && (memo.v === 1 || memo.v === 2) && Array.isArray(memo.cartes) && memo.cartes.length && Array.isArray(memo.cartes[0])) {
        CAT.cartes = memo.cartes;
        CAT.maj = memo.maj;
        CAT.etat = 'ok';
        CAT.source = 'cache';
        CAT.octets = memo.octets || tailleEstimee(CAT.cartes);
        CAT.date = memo.date || null;
        CAT.partiel = !!memo.partiel;
        CAT.impressions = memo.impressions || 0;
        appliqueCatalogueAuxCartes();
        if (memo.v !== 2) CAT.detail = 'archive d\'une version antérieure : rechargez le fichier Scryfall pour obtenir les visuels des cartes.';
        invaliderCandidats();
        renderAll();
        if (Date.now() - (memo.date || 0) > 7 * 864e5) setTimeout(() => chargerCatalogueComplet(true), 4000);
        return;
      }
    }
    if (await chargerCatalogueLocal()) return;
    CAT.source = 'réseau'; CAT.detail = ''; CAT.partiel = false; renderF();
    let info;
    try {
      const meta = await fetch('https://api.scryfall.com/bulk-data/oracle-cards');
      if (!meta.ok) throw new Error('HTTP ' + meta.status);
      info = await meta.json();
    } catch(err) {
      CAT.detail = `l'index des données groupées n'a pas répondu (${err.message||'requête bloquée'})`;
      throw err;
    }
    renderF();
    let brut;
    try {
      const rep = await fetch(info.download_uri);
      if (!rep.ok) throw new Error('HTTP ' + rep.status);
      brut = await rep.json();
    } catch(err) {
      CAT.detail = `le fichier groupé (data.scryfall.io) a été refusé : ${err.message||'requête bloquée'}. `
        + `Posez le fichier de données Scryfall à côté de cette page, ou chargez-le depuis la fenêtre de sauvegarde.`;
      throw err;
    }
    const parNom = new Map();
    brut.forEach(sc => { const c = compacte(sc); if (c) retiens(parNom, c); });
    CAT.cartes = [...parNom.values()];
    invaliderCandidats();
    CAT.maj = info.updated_at || null;
    CAT.etat = 'ok';
    CAT.octets = tailleEstimee(CAT.cartes);
    CAT.date = Date.now();
    appliqueCatalogueAuxCartes();
    if (saveState !== 'desactive' && S.catalogueActif)
      idbEcrire('cartes', {v:2, cartes:CAT.cartes, maj:CAT.maj, date:CAT.date, octets:CAT.octets, impressions:CAT.impressions||0}).catch(() => {});
    renderAll();
  } catch(err) {
    CAT.etat = (err instanceof TypeError) ? 'hors-ligne' : 'erreur';
    renderF();
  }
}

function completeDepuisRec(c, rec) {
  if (majTexteOracle(c, rec[CH.TEXTE])) {
    if (rec[CH.ID_COUL] !== undefined && !/^basic land/i.test(c.type || '')) {
      c.identity = rec[CH.ID_COUL] ? String(rec[CH.ID_COUL]).split('') : [];
    }
    if (typeof rec[CH.CMC] === 'number') c.cmc = rec[CH.CMC];
  }
  if (rec[CH.IMG] && !c.imgN) {
    c.img = CDN + 'small/' + rec[CH.IMG];
    c.imgN = CDN + 'normal/' + rec[CH.IMG];
    c.imgL = CDN + 'large/' + rec[CH.IMG];
    c.imgTried = true;
  }
  if (rec[CH.VERSO] && !c.imgB) {
    c.imgB = CDN + 'normal/' + rec[CH.VERSO];
    c.imgBL = CDN + 'large/' + rec[CH.VERSO];
  }
  if (rec[CH.FORCE] != null && c.force == null) {
    c.force = rec[CH.FORCE];
    reanalyser(c);
  }
  if (rec[CH.ENDURANCE] != null && c.endurance == null) c.endurance = rec[CH.ENDURANCE];
  if (rec[CH.ARTISTE] && !c.artist) c.artist = rec[CH.ARTISTE];
  if (!c.price && rec[CH.PRIX] > 0) c.price = rec[CH.PRIX];
  return c;
}

function carteDuCatalogue(rec) {
  const nom = rec[CH.NOM];
  let c = find(nom);
  if (c && !c.unknown) return completeDepuisRec(c, rec);
  c = registerCard(buildCard(nom, rec[CH.COUT] || '—', rec[CH.TYPE], rec[CH.PRIX], rec[CH.TEXTE]));
  c.textFull = !!rec[CH.TEXTE];
  if (rec[CH.ID_COUL] !== undefined) c.identity = rec[CH.ID_COUL] ? rec[CH.ID_COUL].split('') : [];
  c.cmc = rec[CH.CMC];
  if (rec[CH.FORCE] != null) c.force = rec[CH.FORCE];
  if (rec[CH.ENDURANCE] != null) c.endurance = rec[CH.ENDURANCE];
  if (rec[CH.ARTISTE]) c.artist = rec[CH.ARTISTE];
  reanalyser(c);
  if (rec[CH.IMG]) {
    c.img = CDN + 'small/' + rec[CH.IMG];
    c.imgN = CDN + 'normal/' + rec[CH.IMG];
    c.imgL = CDN + 'large/' + rec[CH.IMG];
    if (rec[CH.VERSO]) { c.imgB = CDN + 'normal/' + rec[CH.VERSO]; c.imgBL = CDN + 'large/' + rec[CH.VERSO]; }
    c.imgTried = true;
  } else if (rec[CH.ID]) {
    const base = 'https://api.scryfall.com/cards/' + rec[CH.ID] + '?format=image&version=';
    c.img = base + 'small'; c.imgN = base + 'normal'; c.imgL = base + 'large'; c.imgTried = true;
  }
  c.externe = true; c.unknown = false;
  return c;
}

let CAND = {sig:null, liste:[]};
function invaliderCandidats() { CAND = {sig:null, liste:[]}; }

function signatureCandidats() {
  return [S.format, S.commander, [...S.colors].join(''), S.colorMode, S.budget.perCard,
          CAT.cartes.length, S.collection.size, S.exploreMax, noeudsActifs().sort().join(',')].join('|');
}

/* Le catalogue local porte le texte oracle complet et les prix à jour : on en
   profite pour remplacer, sans requête réseau, les résumés de la base
   intégrée et les prix des cartes possédées ou jouées. */
function appliqueCatalogueAuxCartes() {
  if (!CAT.cartes.length) return;
  const utiles = new Set([...S.collection.keys(), ...S.deck.keys()].map(norm));
  const aCompleter = new Map();
  DB.forEach(c => { if (!c.textFull && !c.unknown) aCompleter.set(norm(c.name), c); });
  if (!utiles.size && !aCompleter.size) return;
  let n = 0;
  CAT.cartes.forEach(rec => {
    const cle = norm(rec[CH.NOM]);
    const complete = aCompleter.get(cle);
    if (complete) {
      aCompleter.delete(cle);
      completeDepuisRec(complete, rec);
      n++;
    }
    if (!utiles.has(cle)) return;
    const c = complete || find(rec[CH.NOM]);
    if (c && rec[CH.PRIX] > 0 && c.price !== rec[CH.PRIX]) { c.price = rec[CH.PRIX]; n++; }
  });
  if (n) scheduleSave();
}

function candidatsCatalogue() {
  if (CAT.etat !== 'ok' || !CAT.cartes.length) return [];
  const sig = signatureCandidats();
  if (CAND.sig === sig) return CAND.liste;
  const legal = {edh:'c', standard:'s'}[S.format] || '';
  const cmd = S.commander ? find(S.commander) : null;
  const ident = cmd ? cmd.identity : null;
  const noeuds = noeudsActifs();
  const retenus = [];
  for (const rec of CAT.cartes) {
    if (!rec || rec.length <= CH.LEGAL) continue;
    if (legal && String(rec[CH.LEGAL] || '').indexOf(legal) < 0) continue;
    const id = rec[CH.ID_COUL] ? String(rec[CH.ID_COUL]).split('') : [];
    if (ident && id.some(x => !ident.includes(x))) continue;
    if (!colorOK({identity:id})) continue;
    if (S.collection.get(rec[CH.NOM]) > 0) continue;
    const prix = rec[CH.PRIX];
    if (prix <= 0 || prix > S.budget.perCard) continue;
    if (noeuds.length && !recToucheNoeuds(rec, noeuds)) continue;
    retenus.push(rec);
  }
  retenus.sort((a, b) => a[CH.RANG] - b[CH.RANG]);
  CAND = {sig, liste:retenus.slice(0, S.exploreMax).map(carteDuCatalogue)};
  return CAND.liste;
}

function requeteCatalogue() {
  const cmd = S.commander ? find(S.commander) : null;
  const ident = (cmd ? cmd.identity : [...S.colors].filter(c => c !== 'C'));
  const id = ident.length ? ident.join('').toLowerCase() : 'c';
  const legal = {edh:'commander', standard:'standard', limite:'', perso:''}[S.format] || '';
  return [legal ? `legal:${legal}` : '', `id<=${id}`, '-is:token', '-t:basic'].filter(Boolean).join(' ');
}

function signatureCatalogue() { return requeteCatalogue(); }

async function chargerCatalogue() {
  if (typeof fetch !== 'function') { S.exploreEtat = 'hors-ligne'; return; }
  const sig = signatureCatalogue();
  S.exploreSig = sig;
  S.exploreEtat = 'chargement';
  renderF();
  const q = requeteCatalogue();
  let url = 'https://api.scryfall.com/cards/search?order=edhrec&unique=cards&q=' + encodeURIComponent(q);
  let charge = 0, ajoutees = 0;
  try {
    while (url && charge < S.exploreMax) {
      const r = await fetch(url);
      if (r.status === 404) { S.exploreEtat = 'aucune'; S.exploreTotal = 0; renderF(); return; }
      if (!r.ok) throw new Error('HTTP ' + r.status);
      const j = await r.json();
      if (typeof j.total_cards === 'number') S.exploreTotal = j.total_cards;
      (j.data || []).forEach(sc => {
        const avant = find(sc.name);
        applyScryfall(sc, avant && avant.unknown ? avant : (avant || null), !!(avant && !avant.unknown));
        const c = find(sc.name);
        if (c && !(S.collection.get(c.name) > 0)) { c.externe = true; ajoutees++; }
        charge++;
      });
      S.exploreCharge = charge;
      url = j.has_more ? j.next_page : null;
      S.exploreReste = !!url;
      if (charge <= 175 || charge % 1400 < 175) renderF();
      if (url && charge < S.exploreMax) await new Promise(r2 => setTimeout(r2, 110));
    }
    S.exploreEtat = 'ok';
  } catch(err) {
    S.exploreEtat = (err instanceof TypeError) ? 'hors-ligne' : 'erreur';
  }
  renderAll();
  void ajoutees;
}
