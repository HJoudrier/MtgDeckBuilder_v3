/* =====================================================================
   js/tableImages.js — Le visuel d'une carte, à la table

   Une table montre des dizaines de cartes à la fois, et celles d'un
   adversaire ne sont souvent nulle part dans l'atelier. On cherche le
   visuel dans l'ordre : la carte de l'atelier, l'archive Scryfall, puis
   Scryfall lui-même — une requête pour soixante-quinze noms, et non une par
   vignette, que Scryfall refuserait au-delà de dix par seconde. Une carte
   sans visuel garde son cadre de texte : la table se lit sans réseau.
   ===================================================================== */

/* Nom normalisé → adresse du visuel « normal », ou '' quand personne ne le
   connaît. Absent : pas encore cherché. */
const IMAGES_TABLE = new Map();
const IMAGES_ATTENTE = [];
const IMAGES_DEMANDEES = new Set();
let imagesMinuterie = null;

/* Le visuel que l'atelier ou l'archive connaît déjà, sans réseau. */
function imageConnue(nom) {
  const cle = norm(nom);
  if (IMAGES_TABLE.has(cle)) return IMAGES_TABLE.get(cle);
  const c = typeof find === 'function' ? find(nom) : null;
  let u = (c && (c.imgN || c.img)) || '';
  if (!u && typeof indexArchive === 'function') {
    const m = indexArchive();
    const rec = m && (m.get(cle) || m.get(norm(String(nom).split(' // ')[0])));
    if (rec && rec[CH.IMG]) u = CDN + 'normal/' + rec[CH.IMG];
  }
  if (!u) return null;
  IMAGES_TABLE.set(cle, u);
  return u;
}

/* L'adresse du visuel d'une carte : `normal` pour la carte entière,
   `art_crop` pour l'illustration seule. `null` tant qu'on ne la connaît
   pas : la demande part, et la table se repeindra à la réponse. */
function imageCarte(nom, version = 'normal') {
  if (!nom) return null;
  const u = imageConnue(nom);
  if (u == null) { demandeImage(nom); return null; }
  if (!u) return null;
  const v = version === 'normal' ? u : u.replace(/\/(small|normal|large)\//, '/' + version + '/');
  return v.replace(/'/g, '%27');
}

function demandeImage(nom) {
  const cle = norm(nom);
  if (IMAGES_DEMANDEES.has(cle)) return;
  IMAGES_DEMANDEES.add(cle);
  IMAGES_ATTENTE.push(nom);
  if (!imagesMinuterie) imagesMinuterie = setTimeout(chercheImagesTable, 150);
}

/* Les noms en attente, par lots de soixante-quinze. Un nom que Scryfall ne
   connaît pas — un jeton, le plus souvent — n'est plus redemandé : son cadre
   de texte suffit. */
async function chercheImagesTable() {
  const noms = IMAGES_ATTENTE.splice(0);
  for (let i = 0; i < noms.length; i += 75) {
    const lot = noms.slice(i, i + 75);
    try {
      const r = await fetch('https://api.scryfall.com/cards/collection', {method: 'POST',
        headers: {'Content-Type': 'application/json'}, body: JSON.stringify({identifiers: lot.map(n => ({name: String(n).split(' // ')[0]}))})});
      if (r.ok) {
        const j = await r.json();
        (j.data || []).forEach(sc => {
          const f = sc.card_faces && sc.card_faces[0];
          const u = (sc.image_uris && sc.image_uris.normal) || (f && f.image_uris && f.image_uris.normal) || '';
          IMAGES_TABLE.set(norm(sc.name), u);
          IMAGES_TABLE.set(norm(sc.name.split(' // ')[0]), u);
        });
      }
    } catch (e) { /* hors ligne : les cadres de texte restent */ }
    lot.forEach(n => {
      const k = norm(n), k0 = norm(String(n).split(' // ')[0]);
      if (!IMAGES_TABLE.has(k)) IMAGES_TABLE.set(k, IMAGES_TABLE.has(k0) ? IMAGES_TABLE.get(k0) : '');
    });
    if (i + 75 < noms.length) await new Promise(ok => setTimeout(ok, 90));
  }
  imagesMinuterie = IMAGES_ATTENTE.length ? setTimeout(chercheImagesTable, 150) : null;
  if (typeof renduTable === 'function') renduTable();
}
