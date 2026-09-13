/* =====================================================================
   js/nuageFusion.js — Fusionner deux appareils sans rien perdre

   Deux PC modifient la même collection hors ligne l'un de l'autre. Écraser
   l'un par l'autre — « le dernier qui écrit gagne » — perd du travail sans le
   dire : c'est précisément ce qu'on cherche à éviter, et c'est pourquoi la
   synchronisation est un peu plus qu'un envoi de fichier.

   D'où la fusion **à trois côtés** : le local, le distant, et la **base** —
   l'état du fond au dernier accord entre les deux. Avec elle, on distingue
   « ce côté a changé » de « ce côté est resté tel quel », ce qu'une
   comparaison à deux ne sait pas faire : sans base, trois exemplaires d'un
   côté et deux de l'autre sont indiscernables d'une suppression.

   Un seul cas reste indécidable : les deux côtés ont bougé, différemment, sur
   la même carte. La quantité retenue est alors la plus grande — une collection
   s'agrandit plus qu'elle ne se réduit — et la carte est **nommée** dans la
   fenêtre. Jamais de choix muet.
   ===================================================================== */

/* Une écriture JSON aux clés ordonnées : les deux appareils ne construisent
   pas forcément leurs objets dans le même ordre, et une comparaison naïve
   verrait une différence là où il n'y en a aucune. */
function nuageStable(v) {
  if (v === null || typeof v !== 'object') return JSON.stringify(v ?? null);
  if (Array.isArray(v)) return '[' + v.map(nuageStable).join(',') + ']';
  return '{' + Object.keys(v).sort().map(k => JSON.stringify(k) + ':' + nuageStable(v[k])).join(',') + '}';
}

/* Les quantités d'une liste, entrée par entrée. Une carte absente vaut zéro :
   une suppression est un changement comme un autre, et se propage donc au même
   titre qu'un ajout. */
function fusionneQuantites(base, local, distant) {
  const b = new Map(base || []), l = new Map(local || []), d = new Map(distant || []);
  const valeurs = [], conflits = [];
  new Set([...b.keys(), ...l.keys(), ...d.keys()]).forEach(nom => {
    const vb = b.get(nom) || 0, vl = l.get(nom) || 0, vd = d.get(nom) || 0;
    let v;
    if (vl === vd) v = vl;
    else if (vl === vb) v = vd;
    else if (vd === vb) v = vl;
    else { v = Math.max(vl, vd); conflits.push({nom, local: vl, distant: vd, retenu: v}); }
    if (v > 0) valeurs.push([nom, v]);
  });
  return {valeurs, conflits};
}

/* Un ensemble — les commandants secondaires écartés, par exemple. Aucun
   conflit n'y est possible : avec trois booléens, dès que les deux côtés
   diffèrent, la base est d'accord avec l'un des deux. */
function fusionneEnsemble(base, local, distant) {
  const b = new Set(base || []), l = new Set(local || []), d = new Set(distant || []);
  const out = [];
  new Set([...b, ...l, ...d]).forEach(x => {
    const eb = b.has(x), el = l.has(x), ed = d.has(x);
    if (el === ed) { if (el) out.push(x); }
    else if (el === eb) { if (ed) out.push(x); }
    else if (el) out.push(x);
  });
  return out;
}

/* Une valeur qui ne se coupe pas en deux — le commandant, le format, le
   budget. Les deux côtés ont bougé différemment : le local gagne, et le dit.
   C'est l'appareil devant lequel on est assis ; prendre le distant défferait
   sous les doigts ce qu'on vient de régler. */
function fusionneValeur(base, local, distant, champ) {
  const jb = nuageStable(base), jl = nuageStable(local), jd = nuageStable(distant);
  if (jl === jd) return {valeur: local, conflit: null};
  if (jl === jb) return {valeur: distant, conflit: null};
  if (jd === jb) return {valeur: local, conflit: null};
  return {valeur: local, conflit: {champ, local, distant}};
}

/* Combien de champs une entrée de cache porte vraiment : c'est ce qui tranche
   entre deux versions d'une même carte, l'une complétée par Scryfall et
   l'autre non. */
function nuageGarniture(o) {
  let n = 0;
  Object.keys(o).forEach(k => {
    const v = o[k];
    if (v === '' || v === null || v === undefined || v === 0) return;
    if (Array.isArray(v) && !v.length) return;
    n++;
  });
  return n;
}

/* Le cache des cartes : une union, jamais un conflit. Pour un même nom on
   garde l'entrée la plus garnie — celle qui porte le visuel, le texte complet,
   le prix. Les deux décomptes rendus disent s'il y avait quelque chose à
   prendre ici, et quelque chose à donner là-bas. */
function fusionneCache(local, distant) {
  const parNom = new Map();
  let venu = 0, manque = 0;
  (local || []).forEach(o => { if (o && o.n) parNom.set(o.n, o); });
  (distant || []).forEach(o => {
    if (!o || !o.n) return;
    const mien = parNom.get(o.n);
    if (!mien) { parNom.set(o.n, o); venu++; return; }
    const g = nuageGarniture(o), gm = nuageGarniture(mien);
    if (g > gm) { parNom.set(o.n, o); venu++; }
    else if (g < gm) manque++;
  });
  const nomsDistants = new Set((distant || []).map(o => o && o.n));
  (local || []).forEach(o => { if (o && o.n && !nomsDistants.has(o.n)) manque++; });
  return {valeurs: [...parNom.values()], venu, manque};
}

/* L'empreinte du fond, ordonnée : deux fonds égaux la partagent, quel que
   soit l'ordre où leurs tables ont été bâties. C'est elle qui dit s'il y a
   lieu de repeindre, et s'il y a lieu de pousser. */
function empreinteFond(fond) {
  if (!fond) return '';
  const parts = [];
  NUAGE_QTES.forEach(k => parts.push(k + ':' +
    [...(fond[k] || [])].map(([n, q]) => n + '=' + q).sort().join(',')));
  NUAGE_ENSEMBLES.forEach(k => parts.push(k + ':' + [...(fond[k] || [])].sort().join(',')));
  [...NUAGE_SCALAIRES, ...NUAGE_OBJETS].forEach(k => parts.push(k + ':' + nuageStable(fond[k])));
  return parts.join('|');
}

/* La fusion entière. `base` est le fond du dernier accord, et peut manquer :
   au premier accord, ou après un effacement des données locales. On retombe
   alors sur une fusion à deux côtés — tout changement est réputé venir des
   deux, donc chaque divergence est un conflit signalé plutôt qu'un arbitrage
   silencieux. */
function fusionnePaquets(base, local, distant) {
  const fond = {}, conflits = [];
  NUAGE_QTES.forEach(k => {
    const r = fusionneQuantites(base && base[k], local.fond[k], distant.fond[k]);
    fond[k] = r.valeurs;
    r.conflits.forEach(c => conflits.push({...c, liste: k}));
  });
  NUAGE_ENSEMBLES.forEach(k => {
    fond[k] = fusionneEnsemble(base && base[k], local.fond[k], distant.fond[k]);
  });
  [...NUAGE_SCALAIRES, ...NUAGE_OBJETS].forEach(k => {
    const r = fusionneValeur(base ? base[k] : undefined, local.fond[k], distant.fond[k], k);
    fond[k] = r.valeur;
    if (r.conflit) conflits.push(r.conflit);
  });

  const lc = local.cache || {}, dc = distant.cache || {};
  const cartes = fusionneCache(lc.cartes, dc.cartes);
  const enrich = fusionneCache(lc.enrich, dc.enrich);
  const prix = Math.max(lc.prixMaj || 0, dc.prixMaj || 0);

  const eFusion = empreinteFond(fond);
  return {
    paquet: {
      v: NUAGE_PAQUET_V, maj: Date.now(), par: local.par,
      fond,
      cache: {cartes: cartes.valeurs, enrich: enrich.valeurs, prixMaj: prix || null}
    },
    conflits,
    /* Y a-t-il quelque chose à verser ici : le fond a bougé, ou le distant
       connaissait des cartes que nous ignorions. */
    changeIci: eFusion !== empreinteFond(local.fond) || cartes.venu > 0 || enrich.venu > 0,
    /* Et quelque chose à pousser là-bas. */
    changeLaBas: eFusion !== empreinteFond(distant.fond) || cartes.manque > 0 || enrich.manque > 0,
    venu: cartes.venu + enrich.venu,
    donne: cartes.manque + enrich.manque
  };
}
