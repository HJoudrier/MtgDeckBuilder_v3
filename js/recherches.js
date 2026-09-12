/* =====================================================================
   js/recherches.js — Les recherches nommées chez Scryfall

   Chercher une carte par son nom, ses impressions, toutes ses éditions, son
   verso, son texte : autant de requêtes ponctuelles, hors de la file, chacune
   posant sur la carte le drapeau qui dit qu'on a demandé — car avoir demandé
   n'est pas avoir reçu.
   ===================================================================== */

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

/* Visuels de chaque édition possédée, pour les faire défiler dans la fiche.
   Une seule requête par carte, à l'ouverture de la fiche, et seulement si la
   collection en compte plusieurs. L'édition déjà affichée est reprise telle
   quelle : elle n'a pas à être redemandée. */
function semeVisuelVersion(card) {
  card.visuels = card.visuels || {};
  const cle = cleImpression(card.set, card.num);
  if (cle && !card.visuels[cle] && card.imgImpression === cle && (card.imgN || card.img)) {
    card.visuels[cle] = {
      img: card.img || '', imgN: card.imgN || '', imgL: card.imgL || '',
      artist: card.artist || '', setName: card.setName || '', price: card.price || 0,
      cmUrl: card.cmUrl || ''
    };
  }
  return card.visuels;
}

function visuelDepuisScryfall(sc) {
  const faces = sc.card_faces && sc.card_faces.length ? sc.card_faces : null;
  const uris = sc.image_uris || (faces && faces[0] && faces[0].image_uris) || null;
  if (!uris) return null;
  const pr = sc.prices || {};
  return {
    img: uris.small || uris.normal || '',
    imgN: uris.normal || uris.large || uris.small || '',
    imgL: uris.large || uris.png || uris.normal || '',
    artist: sc.artist || (faces && faces[0] && faces[0].artist) || '',
    setName: sc.set_name || '',
    price: parseFloat(pr.eur || pr.eur_foil || 0) || 0,
    cmUrl: (sc.purchase_uris && sc.purchase_uris.cardmarket) || ''
  };
}

async function chercheImpressions(card) {
  if (!card || S.scryHS || typeof fetch !== 'function') return false;
  const vs = versionsCarte(card);
  if (vs.length < 2) return false;
  const connus = semeVisuelVersion(card);
  const manquants = vs.filter(v => cleVersion(v) && !connus[cleVersion(v)]).slice(0, 75);
  if (!manquants.length || card.visuelsTried) return false;
  card.visuelsTried = true;
  card.visuelsEnCours = true;
  try {
    const r = await fetch('https://api.scryfall.com/cards/collection', {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({identifiers: manquants.map(v =>
        ({set: String(v.set).toLowerCase(), collector_number: String(v.num).toLowerCase()}))})
    });
    if (!r.ok) throw new Error('HTTP ' + r.status);
    const j = await r.json();
    (j.data || []).forEach(sc => {
      const u = visuelDepuisScryfall(sc);
      const cle = cleImpression(sc.set, sc.collector_number);
      if (u && cle) card.visuels[cle] = u;
    });
    /* Une édition que Scryfall ne connaît pas est retenue comme telle, pour
       ne pas la redemander à chaque ouverture de la fiche. */
    (j.not_found || []).forEach(id => {
      const cle = id && id.set ? cleImpression(id.set, id.collector_number) : '';
      if (cle && !card.visuels[cle]) card.visuels[cle] = {ko: true};
    });
    return true;
  } catch(err) {
    card.visuelsTried = false;
    return false;
  } finally {
    card.visuelsEnCours = false;
  }
}

/* Toutes les éditions publiées d'une carte, à la demande seulement : une
   recherche « unique=prints », dont on suit les pages jusqu'à trois. Les
   éditions numériques sont écartées, sauf si la fenêtre du catalogue les
   autorise — la collection et les prix affichés sont ceux du papier. */
async function chercheToutesEditions(card) {
  if (!card || typeof fetch !== 'function') return false;
  if (card.editionsEtat === 'chargement' || card.editionsEtat === 'ok') return false;
  card.editionsEtat = 'chargement';
  card.editionsErreur = '';
  const nom = String(card.name || '').replace(/"/g, '');
  let url = 'https://api.scryfall.com/cards/search?unique=prints&order=released&dir=desc&q='
          + encodeURIComponent('!"' + nom + '"' + (S.catalogueNumeriques ? '' : ' game:paper'));
  const out = [];
  try {
    for (let page = 0; page < 3 && url; page++) {
      const r = await fetch(url);
      if (r.status === 404) break;   // recherche sans résultat : liste vide, pas une panne
      if (!r.ok) throw new Error('HTTP ' + r.status);
      const j = await r.json();
      (j.data || []).forEach(sc => {
        const u = visuelDepuisScryfall(sc);
        if (!u) return;
        const faces = sc.card_faces && sc.card_faces.length ? sc.card_faces : null;
        const verso = (faces && faces[1] && faces[1].image_uris) || null;
        out.push(Object.assign({
          set: String(sc.set || '').toUpperCase(),
          num: sc.collector_number == null ? '' : String(sc.collector_number),
          sortie: sc.released_at || '',
          imgB: verso ? (verso.normal || verso.small || '') : '',
          imgBL: verso ? (verso.large || verso.normal || '') : ''
        }, u));
      });
      url = j.has_more ? j.next_page : '';
      if (url) await new Promise(res => setTimeout(res, 120));
    }
    card.editions = out;
    card.editionsEtat = 'ok';
  } catch(err) {
    card.editionsEtat = 'erreur';
    card.editionsErreur = err.message || 'échec réseau';
  }
  return true;
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
