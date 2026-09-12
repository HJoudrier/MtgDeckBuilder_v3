/* =====================================================================
   js/sets.js — Les sets publiés par Scryfall

   La liste des sets tient en une requête ; la composition d'un set n'est
   cherchée qu'au moment où on le coche. Les noms retenus alimentent
   `SETS_BASE` (js/etat.js) et sont conservés dans IndexedDB, exactement comme
   les thèmes EDHREC.
   ===================================================================== */

const SETS_CLE_IDB = 'sets';
const SETS_FRAICHEUR = 7 * 24 * 3600e3;   // la liste ne bouge que de quelques sets par an
const SETS_PAGES = 12;                    // 175 cartes par page : de quoi couvrir même les Secret Lair
const SETS_PAUSE = 120;                   // ms entre deux pages, par courtoisie envers Scryfall

/* Sets proposés : ceux qu'on peut avoir en main. Les éditions numériques
   sont écartées — comme pour le défilement des illustrations, qui cherche
   déjà sur `game:paper` — et avec elles les planches de jetons et les
   objets de collection, qui ne se jouent pas. */
const SETS_ECARTES = new Set(['token', 'memorabilia', 'minigame']);

function setRetenu(s) {
  if (!s || SETS_ECARTES.has(s.set_type)) return false;
  return S.catalogueNumeriques || !s.digital;
}

/* Reprise du cache local, au démarrage : sans elle, un set coché avant le
   rechargement ne filtrerait plus rien tant que Scryfall n'a pas répondu. */
async function reprendreSets() {
  try {
    const memo = await idbLire(SETS_CLE_IDB);
    if (!memo || memo.v !== 1) return false;
    SETS_BASE.index = indexDepuisCartes(memo.cartes || {});
    SETS_BASE.charges = memo.charges || {};
    SETS_BASE.liste = memo.liste || [];
    SETS_BASE.maj = memo.maj || null;
    SETS_BASE.numeriques = !!memo.numeriques;
    SETS_BASE.etat = SETS_BASE.liste.length ? 'ok' : 'idle';
    return SETS_BASE.liste.length > 0 || SETS_BASE.index.size > 0;
  } catch(err) {
    return false;
  }
}

function sauverSets() {
  idbEcrire(SETS_CLE_IDB, {
    v:1, maj:SETS_BASE.maj, liste:SETS_BASE.liste, charges:SETS_BASE.charges,
    numeriques: !!S.catalogueNumeriques,
    cartes:cartesDepuisIndex(SETS_BASE.index)
  }).catch(() => {});
}

/* Y a-t-il lieu d'interroger Scryfall ? Oui si nous n'avons rien, ou si
   notre liste a passé la semaine. */
function setsARevoir() {
  /* Basculer l'autorisation des cartes numériques périme la liste : elle a
     été bâtie sous l'autre réglage, et son cache la resservirait telle quelle. */
  if (!!SETS_BASE.numeriques !== !!S.catalogueNumeriques) return true;
  return !SETS_BASE.liste.length || !SETS_BASE.maj || Date.now() - SETS_BASE.maj > SETS_FRAICHEUR;
}

/* Les cartes déjà relevées d'un set l'ont été sous un réglage donné : changer
   d'avis sur le numérique les rend caduques, il faut les redemander. */
function oublieCartesSets() {
  SETS_BASE.charges = {};
  SETS_BASE.index = new Map();
}

/* La liste des sets : une requête, quelques centaines d'entrées. */
async function chargerListeSets() {
  if (SETS_BASE.etat === 'chargement') return;
  if (typeof fetch !== 'function') {
    SETS_BASE.etat = 'erreur';
    SETS_BASE.erreur = 'ce navigateur ne sait pas interroger Scryfall';
    return;
  }
  if (!SETS_BASE.liste.length) await reprendreSets();
  if (!setsARevoir()) { SETS_BASE.etat = 'ok'; return; }
  SETS_BASE.etat = 'chargement';
  SETS_BASE.erreur = '';
  if (typeof majFenetreFiltres === 'function') majFenetreFiltres();
  try {
    const r = await fetch('https://api.scryfall.com/sets');
    if (!r.ok) throw new Error('HTTP ' + r.status);
    const j = await r.json();
    const liste = (j.data || []).filter(setRetenu).map(x => ({
      code: String(x.code || '').toUpperCase(),
      nom: x.name || x.code || '',
      sortie: x.released_at || '',
      type: x.set_type || '',
      n: x.card_count || 0
    })).filter(x => x.code);
    if (liste.length) {
      if (!!SETS_BASE.numeriques !== !!S.catalogueNumeriques) oublieCartesSets();
      SETS_BASE.liste = liste;
      SETS_BASE.maj = Date.now();
      SETS_BASE.numeriques = !!S.catalogueNumeriques;
      sauverSets();
    }
    SETS_BASE.etat = 'ok';
  } catch(err) {
    /* Une liste déjà en cache vaut mieux qu'un message d'erreur. */
    SETS_BASE.etat = SETS_BASE.liste.length ? 'ok' : 'erreur';
    SETS_BASE.erreur = err.message || 'échec réseau';
  }
  if (typeof majFenetreFiltres === 'function') majFenetreFiltres();
}

function noteSetIndex(nom, code) {
  const n = norm(nom);
  if (!n) return;
  const s = SETS_BASE.index.get(n) || new Set();
  s.add(code);
  SETS_BASE.index.set(n, s);
}

/* Les cartes d'un set, à sa première utilisation. Seuls les noms sont
   retenus : c'est tout ce dont le filtre a besoin. Le nom de la face avant
   est indexé en plus du nom complet, pour que les recto-verso répondent
   quelle que soit la forme sous laquelle la collection les porte. */
async function chargerSetScryfall(code) {
  const c = String(code || '').toUpperCase();
  if (!c || SETS_BASE.charges[c] || SETS_BASE.enCours.has(c)) return;
  if (typeof fetch !== 'function') return;
  SETS_BASE.enCours.add(c);
  if (typeof majFenetreFiltres === 'function') majFenetreFiltres();
  const noms = new Set();
  let url = 'https://api.scryfall.com/cards/search?unique=cards&order=name&q='
          + encodeURIComponent('set:' + c.toLowerCase() + (S.catalogueNumeriques ? '' : ' game:paper'));
  try {
    for (let page = 0; page < SETS_PAGES && url; page++) {
      const r = await fetch(url);
      if (r.status === 404) break;   // set sans carte papier : liste vide, pas une panne
      if (!r.ok) throw new Error('HTTP ' + r.status);
      const j = await r.json();
      (j.data || []).forEach(sc => { if (sc && sc.name) noms.add(sc.name); });
      url = j.has_more ? j.next_page : '';
      if (url) await new Promise(res => setTimeout(res, SETS_PAUSE));
    }
    noms.forEach(nom => {
      noteSetIndex(nom, c);
      const avant = typeof frontFace === 'function' ? frontFace(nom) : nom;
      if (avant && avant !== nom) noteSetIndex(avant, c);
    });
    SETS_BASE.charges[c] = {n:noms.size};
    SETS_BASE.maj = SETS_BASE.maj || Date.now();
    sauverSets();
  } catch(err) {
    SETS_BASE.charges[c] = {n:0, erreur:err.message || 'échec'};
  } finally {
    SETS_BASE.enCours.delete(c);
  }
  if (typeof majFenetreFiltres === 'function') majFenetreFiltres();
  if (typeof majResumeFiltres === 'function') majResumeFiltres();
  if (typeof renderAllSiApplique === 'function') renderAllSiApplique();
}
