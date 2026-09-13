/* =====================================================================
   js/idb.js — Le magasin IndexedDB

   Un seul magasin pour tout ce qui est trop gros pour `localStorage` :
   l'archive du catalogue, l'index des thèmes EDHREC, celui des sets, la liste
   des Game Changers et la base de fusion de la synchronisation. Cinq gestes,
   tous rendus en promesse.
   ===================================================================== */

const IDB_NOM = 'mtg-atelier', IDB_MAG = 'catalogue';

/* La base de fusion de la synchronisation (js/nuage.js) dort ici, faute de
   place dans `localStorage`. Elle est nommée à cet étage parce que `idbVider()`
   doit l'épargner : ce geste vide le magasin quand on décoche l'archivage du
   catalogue, et emporterait sinon la mémoire du dernier accord entre les deux
   appareils — après quoi la fusion, privée de base, ne saurait plus distinguer
   une suppression d'un ajout. */
const IDB_NUAGE_BASE = 'nuage-base';

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

/* Oublier une seule entrée, quand on sait laquelle. */
function idbOublier(cle) {
  return idb().then(db => new Promise(ok => {
    const t = db.transaction(IDB_MAG, 'readwrite').objectStore(IDB_MAG).delete(cle);
    t.onsuccess = () => ok(true);
    t.onerror = () => ok(false);
  })).catch(() => false);
}

/* Vider le magasin, sauf ce qui doit survivre : on efface entrée par entrée
   plutôt que d'un `clear()`, seul moyen d'en épargner une. */
function idbVider() {
  return idb().then(db => new Promise(ok => {
    const mag = db.transaction(IDB_MAG, 'readwrite').objectStore(IDB_MAG);
    const q = mag.getAllKeys();
    q.onsuccess = () => {
      (q.result || []).forEach(cle => { if (cle !== IDB_NUAGE_BASE) mag.delete(cle); });
      ok(true);
    };
    q.onerror = () => ok(false);
  })).catch(() => false);
}
