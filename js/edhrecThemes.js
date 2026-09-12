/* =====================================================================
   js/edhrecThemes.js — L'index des thèmes EDHREC

   La liste des thèmes tient en une requête ; les cartes d'un thème ne sont
   cherchées qu'à sa première utilisation. Le tout alimente `ARCH_BASE`
   (js/etat.js) et dort dans IndexedDB. EDHREC ne publiant aucun manifeste
   daté, la liste est relue une fois par semaine et n'est remplacée que si
   elle diffère vraiment.
   ===================================================================== */

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

/* Cherche l'index, en partant du préfixe déjà validé pour les thèmes.
   Renvoie ce qu'il trouve sans toucher au cache : c'est l'appelant qui
   décide de le garder, pour qu'une vérification ratée ne fasse pas
   perdre la liste déjà en place. */
async function chargerListeArchetypesEdhrec() {
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
        return themes.sort((a, b) => (b.n || 0) - (a.n || 0) || a.label.localeCompare(b.label));
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
    if (typeof renderAllSiApplique === 'function') renderAllSiApplique();
  }
}

function sauverArchetypesEdhrec() {
  idbEcrire(ARCH_CLE_IDB, {
    v:2, maj:ARCH_BASE.maj, liste:ARCH_BASE.liste, themes:ARCH_BASE.themes,
    cartes:cartesDepuisIndex(ARCH_BASE.index)
  }).catch(() => {});
}

/* Une liste vaut l'autre si elle porte les mêmes thèmes. */
function signatureArchetypes(liste) {
  return (liste || []).map(t => t.slug).join('|');
}

/* Y a-t-il lieu d'interroger EDHREC ? Oui si nous n'avons rien, ou si
   notre liste a passé la semaine. */
function archetypesARevoir() {
  return !ARCH_BASE.liste.length || !ARCH_BASE.maj || Date.now() - ARCH_BASE.maj > ARCH_FRAICHEUR;
}

/* Chargement automatique, au démarrage : l'index, puis les thèmes déjà
   cochés. Discret par nature — la fenêtre des filtres porte l'état, et
   seul un vrai changement de liste se signale. Une vérification ratée
   laisse en place la liste déjà connue. */
async function chargerArchetypesEdhrec() {
  if (ARCH_BASE.etat === 'chargement') return;
  if (typeof fetch !== 'function') {
    ARCH_BASE.etat = 'erreur';
    ARCH_BASE.erreur = 'ce navigateur ne sait pas interroger EDHREC';
    return;
  }
  const avant = signatureArchetypes(ARCH_BASE.liste);
  ARCH_BASE.etat = 'chargement';
  ARCH_BASE.erreur = '';
  ARCH_BASE.essais = [];
  if (typeof majFenetreFiltres === 'function') majFenetreFiltres();

  const liste = await chargerListeArchetypesEdhrec();
  if (liste.length) {
    const change = signatureArchetypes(liste) !== avant;
    ARCH_BASE.liste = liste;
    ARCH_BASE.maj = Date.now();
    ARCH_BASE.etat = 'ok';
    sauverArchetypesEdhrec();
    if (change && avant && typeof toast === 'function') {
      toast(`Liste EDHREC actualisée : ${liste.length.toLocaleString('fr-FR')} thèmes.`);
    }
    for (const slug of archetypesAChargerEdhrec()) await chargerThemeEdhrec(slug);
  } else if (avant) {
    /* EDHREC n'a pas répondu, mais notre liste tient toujours : on la
       garde, sans toucher à sa date, pour retenter au prochain lancement. */
    ARCH_BASE.etat = 'ok';
  } else {
    const hoteOK = await temoinEdhrec();
    ARCH_BASE.etat = 'erreur';
    ARCH_BASE.erreur = hoteOK
      ? "la liste des thèmes n'est pas à l'adresse attendue (l'hôte répond pourtant pour les commandants)"
      : 'EDHREC injoignable depuis ce navigateur (hors ligne, CORS ou accès bloqué)';
  }
  if (typeof majFenetreFiltres === 'function') majFenetreFiltres();
  if (typeof renderAllSiApplique === 'function') renderAllSiApplique();
}
