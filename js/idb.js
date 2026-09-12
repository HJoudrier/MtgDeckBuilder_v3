/* =====================================================================
   js/idb.js — Le magasin IndexedDB

   Un seul magasin pour tout ce qui est trop gros pour `localStorage` :
   l'archive du catalogue, l'index des thèmes EDHREC, celui des sets et la
   liste des Game Changers. Quatre gestes, tous rendus en promesse.
   ===================================================================== */

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
