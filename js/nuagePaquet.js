/* =====================================================================
   js/nuagePaquet.js — Ce qui voyage d'un appareil à l'autre

   La synchronisation ne transporte pas la séance entière : elle la sépare en
   trois étages, qui ne se fusionnent pas de la même façon.

   **Le fond** — collection, deck, réserve, étude, commandant, format, cibles,
   budget. C'est l'intention du joueur, la seule chose qui mérite une vraie
   fusion carte par carte.

   **La vue** — vues, colonnes, groupements, tris, filtres, barre de mana,
   onglet ouvert, plis, thème, et les réglages qui dépendent de la machine
   (cartes examinées au maximum, archivage du catalogue). Elle **ne voyage
   pas**, délibérément : un vingt-sept pouces et un portable ne veulent pas le
   même nombre de colonnes, et se faire reconfigurer son écran par l'autre PC
   n'est pas une synchronisation mais une nuisance.

   **Le cache** — les cartes déjà complétées par Scryfall : visuels, textes,
   prix, impressions. Union sans conflit possible. C'est l'étage qui fait le
   vrai gain : sans lui, le second appareil refait des centaines d'appels pour
   retrouver ce que le premier savait déjà.

   Le paquet est une projection de `snapshot()`, et se verse par `restore()` :
   ces deux-là disent déjà ce que valent les données, et une seconde définition
   aurait dérivé au premier champ ajouté.
   ===================================================================== */

const NUAGE_PAQUET_V = 1;

/* Les quantités par nom de carte : quatre tables qui se fusionnent entrée par
   entrée. `snapshot()` les rend déjà en tableaux de paires. */
const NUAGE_QTES = ['collection', 'deck', ...CLES_ANNEXES];
/* Ce qui ne vaut qu'une valeur, et se tranche en bloc. */
const NUAGE_SCALAIRES = ['commander', 'format'];
const NUAGE_OBJETS = ['custom', 'budget', 'ciblesRoles'];
const NUAGE_ENSEMBLES = ['secondairesOff'];

/* Le paquet tel qu'il part : le fond, le cache, et de quoi dire qui a écrit
   quand — un conflit se raconte mal sans nom d'appareil. */
function nuagePaquet(appareil) {
  const s = snapshot();
  const fond = {};
  [...NUAGE_QTES, ...NUAGE_SCALAIRES, ...NUAGE_OBJETS, ...NUAGE_ENSEMBLES]
    .forEach(k => { fond[k] = s[k]; });
  return {
    v: NUAGE_PAQUET_V,
    maj: Date.now(),
    par: appareil || '',
    fond,
    cache: {cartes: s.cartes, enrich: s.enrich, prixMaj: s.prixMaj}
  };
}

/* Le fond seul, pour la base de fusion : les quantités et les réglages de
   deck, sans le cache des cartes. C'est ce qu'on garde d'un accord à l'autre,
   et il ne pèse qu'une trentaine d'octets par carte — contre huit cents pour
   l'entrée complète. */
function nuageFond(paquet) {
  return paquet && paquet.fond ? paquet.fond : null;
}

/* Verser un paquet fusionné dans l'état. Le passer à `restore()` plutôt que
   d'écrire une seconde application : celui-là sait déjà inscrire une carte
   inconnue dans la base, écarter un nom qui n'y est plus, et relire une
   sauvegarde d'hier. Les champs de la vue étant absents du paquet, `restore()`
   les laisse intacts — c'est par leur absence que la vue reste locale, non par
   une liste d'exceptions à tenir à jour. */
function nuageVerse(paquet) {
  if (!paquet || !paquet.fond) return false;
  const cache = paquet.cache || {};
  return restore({
    v: 1,
    ...paquet.fond,
    cartes: cache.cartes || [],
    enrich: cache.enrich || [],
    ...(typeof cache.prixMaj === 'number' ? {prixMaj: cache.prixMaj} : {})
  });
}

/* Le gzip du navigateur, sans dépendance : un instantané de quatre mille
   cartes passe de trois mégaoctets à moins de cinq cents kilo-octets, et part
   en octets bruts — Dropbox prend le corps tel quel, sans base64 qui
   l'aurait regonflé d'un tiers. */
async function nuageComprime(txt) {
  const flux = new CompressionStream('gzip');
  const plume = flux.writable.getWriter();
  plume.write(new TextEncoder().encode(txt));
  plume.close();
  return new Uint8Array(await new Response(flux.readable).arrayBuffer());
}

async function nuageDecomprime(octets) {
  const flux = new DecompressionStream('gzip');
  const plume = flux.writable.getWriter();
  plume.write(octets);
  plume.close();
  return new TextDecoder().decode(await new Response(flux.readable).arrayBuffer());
}

/* Un paquet vers les octets qui partent, et l'inverse. Le format est annoncé
   par `v` : une version ultérieure sera refusée plutôt que mal lue. */
async function nuageEmballe(paquet) {
  return nuageComprime(JSON.stringify(paquet));
}

async function nuageDeballe(octets) {
  const p = JSON.parse(await nuageDecomprime(octets));
  if (!p || typeof p !== 'object') throw new Error('paquet illisible');
  if (p.v > NUAGE_PAQUET_V)
    throw new Error(`paquet écrit par une version plus récente de l'atelier (format ${p.v})`);
  return p;
}
