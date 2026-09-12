/* =====================================================================
   js/edhrecForme.js — Deviner la forme des pages de thèmes d'EDHREC

   Les thèmes vivent sur le même hôte que les commandants, mais sous un préfixe
   qui a bougé au fil des refontes du site. Plutôt que de figer une adresse qui
   se périmera, on essaie les formes connues sur deux thèmes témoins et l'on
   retient celle qui répond — une fois par séance, puis gardée.
   ===================================================================== */

const ARCH_CLE_IDB = 'archetypes';
const ARCH_PAUSE = 130;   // ms entre deux requêtes, par courtoisie envers EDHREC

/* EDHREC ne publie aucun manifeste daté : impossible de demander « ta
   liste a-t-elle changé ? » sans la relire. Elle bouge peu, on la relit
   donc une fois par semaine et on ne remplace la nôtre que si elle
   diffère vraiment. */
const ARCH_FRAICHEUR = 7 * 24 * 3600e3;

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
