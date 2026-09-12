/* =====================================================================
   js/gameChangers.js — La liste des « Game Changers »

   Celle que Wizards publie pour les paliers du Commander, telle que Scryfall
   la marque (`is:gamechanger`). Une quarantaine de cartes, une requête, gardée
   une semaine dans IndexedDB comme la liste des sets — et relue au démarrage,
   sans quoi un atelier hors ligne ne saurait plus rien en dire.
   ===================================================================== */

const GC_CLE_IDB = 'gamechangers';
const GC_FRAICHEUR = 7 * 24 * 3600e3;   // l'éditeur ne révise sa liste que rarement
const GC_PAGES = 3;                     // 175 cartes par page : la liste en tient dans une

async function reprendreGameChangers() {
  try {
    const memo = await idbLire(GC_CLE_IDB);
    if (!memo || memo.v !== 1 || !Array.isArray(memo.noms)) return false;
    GC_BASE.noms = new Set(memo.noms);
    GC_BASE.maj = memo.maj || null;
    GC_BASE.etat = GC_BASE.noms.size ? 'ok' : 'idle';
    return GC_BASE.noms.size > 0;
  } catch(err) {
    return false;
  }
}

function sauverGameChangers() {
  idbEcrire(GC_CLE_IDB, {v:1, maj:GC_BASE.maj, noms:[...GC_BASE.noms]}).catch(() => {});
}

function gameChangersARevoir() {
  return !GC_BASE.noms.size || !GC_BASE.maj || Date.now() - GC_BASE.maj > GC_FRAICHEUR;
}

async function chargerGameChangers() {
  if (GC_BASE.etat === 'chargement') return;
  if (typeof fetch !== 'function') {
    GC_BASE.etat = 'erreur';
    GC_BASE.erreur = 'ce navigateur ne sait pas interroger Scryfall';
    return;
  }
  if (!GC_BASE.noms.size) await reprendreGameChangers();
  if (!gameChangersARevoir()) { GC_BASE.etat = 'ok'; return; }
  GC_BASE.etat = 'chargement';
  GC_BASE.erreur = '';
  try {
    const noms = new Set();
    let url = 'https://api.scryfall.com/cards/search?q=' + encodeURIComponent('is:gamechanger') + '&unique=cards';
    for (let page = 0; page < GC_PAGES && url; page++) {
      const r = await fetch(url);
      if (!r.ok) throw new Error('HTTP ' + r.status);
      const j = await r.json();
      (j.data || []).forEach(sc => {
        const nom = sc && sc.name;
        if (!nom) return;
        /* Les deux faces d'une carte recto-verso : la liste porte le nom
           complet, l'atelier connaît parfois la seule face avant. */
        noms.add(norm(nom));
        noms.add(norm(frontFace(nom)));
      });
      url = j.has_more && j.next_page ? j.next_page : '';
      if (url) await new Promise(r2 => setTimeout(r2, SETS_PAUSE));
    }
    if (noms.size) {
      GC_BASE.noms = noms;
      GC_BASE.maj = Date.now();
      sauverGameChangers();
    }
    GC_BASE.etat = 'ok';
  } catch(err) {
    /* Une liste déjà en cache vaut mieux qu'un message d'erreur. */
    GC_BASE.etat = GC_BASE.noms.size ? 'ok' : 'erreur';
    GC_BASE.erreur = err.message || 'échec réseau';
  }
  if (typeof renderAll === 'function') renderAll();
}
