/* =====================================================================
   js/decksLies.js — Les adversaires liés à Moxfield ou à Archidekt

   Un adversaire peut suivre un deck publié : à l'ouverture de l'atelier,
   une fois par jour au plus, la liste est relue sur le site et l'adversaire
   mis à jour s'il a changé. Les lots joués contre l'ancienne version
   deviennent périmés d'eux-mêmes (`lotPerime()`, js/simStockage.js), le
   lien n'étant qu'un champ de plus sur l'adversaire.

   La lecture suit une chaîne de repli. D'abord directe ; mais Moxfield n'a
   pas d'API publique, et la sienne refuse probablement d'être lue depuis
   une autre page (CORS). Ensuite par un **relais** personnel, si
   l'utilisateur en a réglé un — un Cloudflare Worker dont le README donne
   le script, et qui ne voit que l'identifiant d'un deck public. En dernier
   recours, la fenêtre de l'adversaire ouvre le deck sur le site et l'on
   colle son export : ce chemin-là marche toujours.
   ===================================================================== */

const DELAI_VERIF_LIEN = 24 * 3600 * 1000;

/* Les sites qu'on sait lire. Chacun dit où est son API, où est la page du
   deck, et comment lire sa réponse en `{nom, liste, commandants, maj}`. */
const SITES_DECKS = {
  moxfield: {
    nom: 'Moxfield',
    api: id => 'https://api2.moxfield.com/v3/decks/all/' + id,
    page: id => 'https://www.moxfield.com/decks/' + id,
    lit: j => {
      /* La forme v3 range les cartes dans `boards` ; la v2 les posait à plat.
         Seuls le deck et les commandants jouent : la réserve, les « maybe » et
         les jetons non. */
      const zone = k => (j.boards && j.boards[k] && j.boards[k].cards) || j[k] || {};
      const cartes = z => Object.values(z).map(e => [e.card && e.card.name, e.quantity || 1]).filter(e => e[0]);
      return {nom: j.name || '', liste: cartes(zone('mainboard')), commandants: cartes(zone('commanders')).map(e => e[0]),
        maj: j.lastUpdatedAtUtc || j.updatedAtUtc || null};
    }
  },
  archidekt: {
    nom: 'Archidekt',
    api: id => 'https://archidekt.com/api/decks/' + id + '/',
    page: id => 'https://archidekt.com/decks/' + id,
    lit: j => {
      const hors = new Set((j.categories || []).filter(c => c.includedInDeck === false).map(c => c.name));
      const liste = [], commandants = [];
      (j.cards || []).forEach(e => {
        const nom = e.card && e.card.oracleCard && e.card.oracleCard.name;
        const cats = e.categories || [];
        if (!nom || cats.some(c => hors.has(c))) return;
        if (cats.includes('Commander')) commandants.push(nom);
        else liste.push([nom, e.quantity || 1]);
      });
      return {nom: j.name || '', liste, commandants, maj: j.updatedAt || null};
    }
  }
};

/* Reconnaître l'adresse d'un deck publié. */
function lisLienDeck(url) {
  const u = String(url || '').trim();
  let m = /^(?:https?:\/\/)?(?:www\.)?moxfield\.com\/decks\/([A-Za-z0-9_-]+)/.exec(u);
  if (m) return {site: 'moxfield', id: m[1], url: SITES_DECKS.moxfield.page(m[1])};
  m = /^(?:https?:\/\/)?(?:www\.)?archidekt\.com\/(?:api\/)?decks\/(\d+)/.exec(u);
  if (m) return {site: 'archidekt', id: m[1], url: SITES_DECKS.archidekt.page(m[1])};
  return null;
}

/* Lire une adresse, directement ou par le relais. Rend le JSON, ou lève
   une erreur dont `genre` dit pourquoi : `introuvable` (le site répond que
   le deck n'existe pas ou n'est pas public), `refuse` (le site ou le
   navigateur refuse la lecture), `reseau`. */
async function lisJsonDeck(adresse) {
  let r;
  try { r = await fetch(adresse, {headers: {Accept: 'application/json'}}); } catch (e) {
    throw Object.assign(new Error('lecture refusée par le navigateur'), {genre: 'refuse'});
  }
  if (r.status === 404) throw Object.assign(new Error('deck introuvable ou privé'), {genre: 'introuvable'});
  if (!r.ok) throw Object.assign(new Error('le site répond ' + r.status), {genre: r.status === 403 ? 'refuse' : 'reseau'});
  try { return await r.json(); } catch (e) {
    throw Object.assign(new Error('réponse illisible'), {genre: 'refuse'});
  }
}

/* Récupérer un deck lié : la lecture directe, puis le relais s'il y en a un. */
async function recupereDeckLie(lien) {
  const site = SITES_DECKS[lien.site];
  if (!site) throw Object.assign(new Error('site inconnu'), {genre: 'introuvable'});
  const api = site.api(lien.id), relais = String(S.simulation.relais || '').trim();
  let j;
  try { j = await lisJsonDeck(api); } catch (e) {
    if (!relais || e.genre === 'introuvable') throw e;
    j = await lisJsonDeck(relais + (relais.includes('?') ? '&' : '?') + 'url=' + encodeURIComponent(api));
  }
  const d = site.lit(j);
  if (!d.liste.length && !d.commandants.length) throw Object.assign(new Error('liste vide'), {genre: 'introuvable'});
  return d;
}

/* La liste en texte MTGO, pour que « Modifier » montre la liste en vigueur
   et que `parseMtgoList()` la relise telle quelle. */
function texteDeListe(liste, commandants) {
  return (commandants.length ? 'Commander\n' + commandants.map(n => '1 ' + n).join('\n') + '\n\n' : '') +
    'Deck\n' + liste.map(([n, q]) => q + ' ' + n).join('\n');
}

/* Ce qui a changé entre deux listes, commandants compris. */
function diffListes(avant, apres) {
  const compte = (l, c) => { const m = new Map(); l.forEach(([n, q]) => m.set(n, (m.get(n) || 0) + q)); c.forEach(n => m.set(n, (m.get(n) || 0) + 1)); return m; };
  const a = compte(avant.liste, avant.commandants), b = compte(apres.liste, apres.commandants);
  let plus = 0, moins = 0;
  const details = [];
  new Set([...a.keys(), ...b.keys()]).forEach(n => {
    const d = (b.get(n) || 0) - (a.get(n) || 0);
    if (d > 0) plus += d; else moins -= d;
    if (d) details.push((d > 0 ? '+' : '') + d + ' ' + n);
  });
  return {plus, moins, details};
}

/* Verser dans un adversaire ce que le site a rendu. Le nom choisi par
   l'utilisateur est gardé. Rend le différentiel. */
function appliqueDeckLie(cle, d) {
  const a = S.adversaires[cle];
  const diff = diffListes(a, d);
  a.liste = d.liste;
  a.commandants = d.commandants;
  a.texte = texteDeListe(d.liste, d.commandants);
  a.maj = Date.now();
  a.lien = {...a.lien, maj: d.maj, etat: 'ok', erreur: null, verifie: Date.now()};
  if (diff.plus || diff.moins) a.lien.dernierChangement = {plus: diff.plus, moins: diff.moins, date: Date.now(), details: diff.details.slice(0, 20)};
  return diff;
}

/* Relire un adversaire lié. Rend le différentiel, ou `null` en cas
   d'échec — l'échec est noté sur le lien, pour la pastille et pour ne pas
   réessayer en boucle. */
async function relisAdversaireLie(cle) {
  const a = S.adversaires[cle];
  if (!a || !a.lien) return null;
  try {
    const diff = appliqueDeckLie(cle, await recupereDeckLie(a.lien));
    if (diff.plus || diff.moins) await completeAdversaire(cle);
    return diff;
  } catch (e) {
    a.lien = {...a.lien, etat: e.genre || 'reseau', erreur: e.message, verifie: Date.now()};
    return null;
  }
}

function annonceChangement(a, diff) {
  toast(`${SITES_DECKS[a.lien.site].nom} : « ${a.nom} » a changé (+${diff.plus} −${diff.moins}).`);
}

/* Au démarrage : relire, un par un, les adversaires liés qu'on n'a pas
   vérifiés depuis un jour. */
async function verifieDecksLies(opts = {}) {
  const cles = Object.keys(S.adversaires).filter(k => {
    const l = S.adversaires[k].lien;
    return l && (opts.force || !l.verifie || Date.now() - l.verifie > DELAI_VERIF_LIEN);
  });
  if (!cles.length) return;
  await chargeSimCartes();
  for (const k of cles) {
    const diff = await relisAdversaireLie(k);
    /* Sauvé aussitôt : la date de vérification doit survivre à une page
       refermée avant la fin de la tournée, sans quoi on relirait demain
       matin ce qu'on vient de lire. */
    scheduleSave();
    if (diff && (diff.plus || diff.moins)) annonceChangement(S.adversaires[k], diff);
    await new Promise(ok => setTimeout(ok, 300));
  }
  COUV_TABLE.cle = null;
  renderK();
}

/* « Mettre à jour » sur un adversaire lié : la relecture, et si elle
   échoue, la fenêtre de l'adversaire en mode collage. */
async function verifieUnDeckLie(cle) {
  const a = S.adversaires[cle];
  if (!a || !a.lien) return;
  toast(`Lecture de « ${a.nom} » sur ${SITES_DECKS[a.lien.site].nom}…`);
  const diff = await relisAdversaireLie(cle);
  COUV_TABLE.cle = null;
  scheduleSave();
  renderK();
  if (!diff) { ouvreAdversaire(cle, {collage: true}); return; }
  if (diff.plus || diff.moins) annonceChangement(a, diff);
  else toast(`« ${a.nom} » est à jour.`);
}

/* Depuis quand un lien a été vérifié, en mots. */
function depuisQuand(t) {
  if (!t) return 'jamais vérifié';
  const h = Math.floor((Date.now() - t) / 3600000);
  return h < 1 ? 'vérifié à l\'instant' : h < 48 ? `vérifié il y a ${h} h` : `vérifié il y a ${Math.floor(h / 24)} j`;
}
