/* =====================================================================
   js/edhrec.js — Les statistiques d'EDHREC pour un commandant

   EDHREC recense les decks publiés : pour un commandant donné, il dit quelles
   cartes y figurent et dans quelle proportion. Les pages sont des fichiers
   JSON servis par json.edhrec.com, dont la forme a changé plusieurs fois —
   d'où les trois chemins de lecture, du plus récent au plus ancien.

   Le deck peut compter plusieurs créatures légendaires : chacune est
   interrogée, et `S.secondairesOff` retient celles qu'on a décochées.
   ===================================================================== */

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
  /* Les secondaires retenus, non toutes les légendaires du deck : une carte
     décochée dans l'onglet EDHREC ne doit plus rien apporter, fût-ce depuis le
     cache d'une visite précédente. */
  const secDeckCards = typeof commandantsSecondaires === 'function' ? commandantsSecondaires() : [];
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

/* Les commandants que l'atelier croise avec EDHREC, en une chaîne : le
   principal et les secondaires retenus. Elle dit quand les statistiques en
   place ne valent plus — un commandant désigné, une légendaire ajoutée au
   deck, une case décochée dans l'onglet EDHREC. Définie une fois : le
   chargement, le rendu et la case s'y réfèrent tous les trois, et deux
   formules jumelles finiraient par diverger. */
function signatureCommandants() {
  const cmd = S.commander ? find(S.commander) : null;
  return (cmd ? cmd.name : '') + '::' + commandantsSecondaires().map(c => c.name).sort().join('|');
}

async function loadEdhrec(force) {
  const cmd = S.commander ? find(S.commander) : null;
  const secCmds = commandantsSecondaires();
  if (!cmd && !secCmds.length) {
    toast("Désignez un commandant dans l'onglet Deck ou ajoutez des créatures légendaires au deck.");
    return;
  }
  const cmdSig = signatureCommandants();
  if (!force && S.edhrec.cmdSignature === cmdSig && S.edhrec.status !== 'idle' && S.edhrec.status !== 'error') {
    return;
  }
  
  const slug = cmd ? edhrecSlug(cmd.name) : null;
  S.edhrec.slug = slug;
  S.edhrec.status = 'loading';
  S.edhrec.secStatus = secCmds.length ? 'loading' : 'idle';
  S.edhrec.cmdSignature = cmdSig;
  renderSuggestions();

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
  renderSuggestions();
}
