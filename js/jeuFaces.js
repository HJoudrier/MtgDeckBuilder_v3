/* =====================================================================
   js/jeuFaces.js — Les faces d'une carte, et les objets qui changent de
   nature : sagas, véhicules, face cachée, cartes à deux faces

   Une carte porte une définition par face (`def.dos`, et `def.modeFaces` :
   `Modal`, `Split`, `Adventure`, `DoubleFaced`). Un objet peut jouer une
   autre définition que l'imprimée : la face arrière d'une carte modale,
   la face transformée, la face cachée d'un morph — `o.def` change, la
   carte (`P.cartes[cid].def`) jamais. Hors du champ, la carte reprend sa
   face avant : c'est `creeObjet()` qui le veut, et la règle aussi.

   Une saga compte ses marqueurs de lore ; un véhicule devient créature
   le temps d'un tour (la couche `o.anime`, js/jeuCaracteristiques.js).
   ===================================================================== */

const MANA_TROIS = {sym: ['{3}'], generique: 3, couleurs: {W: 0, U: 0, B: 0, R: 0, G: 0, C: 0}, hybrides: [], x: 0, total: 3};

/* La face cachée : une créature 2/2 sans nom, sans couleur, sans capacité
   (règle 708.2) — avec la garde 2 d'un déguisement. */
function defFaceCachee(d) {
  if (d._faceCachee) return d._faceCachee;
  const g = d.morph && d.morph.garde;
  d._faceCachee = {nom: 'Face cachée', cout: coutManaVide(), mv: 0, types: ['creature'], sousTypes: [], supers: [], couleurs: [],
    force: 2, endurance: 2, loyaute: null, mots: g ? MOT.GARDE : 0, params: g ? {garde: 2} : {}, sort: null, capacites: [],
    statiques: [], entree: null, aura: null, equipe: null, couverture: d.couverture, coutTexte: '', typeLigne: 'Créature',
    texteOracle: '', faceCachee: true};
  return d._faceCachee;
}

/* La définition qu'une variante de lancement joue. */
function defVariante(o, variante) {
  if (variante === 'dos' || variante === 'aventure') return o.def.dos;
  if (variante === 'morph') return defFaceCachee(o.def);
  return o.def;
}

/* Les variantes qui tiennent aux faces : lancer la face arrière (modale,
   partagée, aventure) ou lancer face cachée. `essaie(variante, mana,
   autre, def)` est celle de `variantesSort()`. */
function variantesFaces(P, j, o, depuis, essaie) {
  const d = o.def;
  if (depuis !== 'main') return;
  if (d.dos && /^(Modal|Split|Adventure)$/.test(d.modeFaces || '') && !d.dos.types.includes('land'))
    essaie(d.modeFaces === 'Adventure' ? 'aventure' : 'dos', coutSort(P, j, o, depuis, d.dos.cout), d.dos.coutSup || null, d.dos);
  if (d.morph) essaie('morph', coutSort(P, j, o, depuis, MANA_TROIS), null, defFaceCachee(d));
}

/* Retourner une créature face cachée : une action spéciale, sans la pile
   (règle 702.37e). Le méga-morph y pose un marqueur +1/+1. */
function retournable(P, j, o) {
  return o.faceCachee && o.ctrl === j && o.vraieDef && o.vraieDef.morph && !!planPaiement(P, j, o.vraieDef.morph.cout, 0, {capacite: o});
}

function* retourne(P, j, a) {
  const o = obj(P, a.id);
  if (!o || !retournable(P, j, o) || !paieMana(P, j, o.vraieDef.morph.cout, 0, {capacite: o})) return false;
  retourneFace(P, o);
  return true;
}

function retourneFace(P, o) {
  if (!o.faceCachee) return;
  o.def = o.vraieDef; o.faceCachee = false;
  if (o.def.morph && o.def.morph.mega) o.marq['+1/+1'] = (o.marq['+1/+1'] || 0) + 1;
  P.ver++;
  jn(P, `${o.def.nom} est retourné`);
  emet(P, {t: 'retourne', id: o.id, ctrl: o.ctrl});
}

/* Transformer une carte à deux faces : la face avant devient l'arrière, et
   inversement. */
function transforme(P, o) {
  const k = P.cartes[o.cid];
  if (!k || !k.def.dos || k.def.modeFaces !== 'DoubleFaced' || o.zone !== 'champ') return;
  o.def = o.def === k.def ? k.def.dos : k.def;
  P.ver++;
  jn(P, `${o.def.nom} se transforme`);
  emet(P, {t: 'transforme', id: o.id, ctrl: o.ctrl});
}

/* La saga : un marqueur de lore à son entrée et au début de chaque
   première phase principale de son contrôleur ; chaque marqueur déclenche
   son chapitre (règle 714). */
function ajouteLore(P, o, n) {
  const ch = o.def.chapitres;
  if (!ch) return;
  for (let k = 0; k < n; k++) {
    o.marq.lore = (o.marq.lore || 0) + 1;
    const i = o.marq.lore - 1;
    if (ch[i]) P.enAttente.push({src: o.id, ctrl: o.ctrl, evt: {t: 'chapitre', n: i + 1},
      cap: {genre: 'declenchee', effet: ch[i], texte: `Chapitre ${i + 1}`}});
  }
  P.ver++;
}

function loreDebutPrincipale(P) {
  champDe(P, P.actif).filter(o => o.def.chapitres).forEach(o => ajouteLore(P, o, 1));
}

/* Les sagas arrivées au bout, que plus aucun chapitre n'attend : elles
   sont sacrifiées (action d'état, règle 714.4). */
function sagasFinies(P) {
  return P.champ.map(id => obj(P, id)).filter(o => o.def.chapitres && (o.marq.lore || 0) >= o.def.chapitres.length &&
    !P.pile.some(it => it.source === o.id) && !P.enAttente.some(t => t.src === o.id)).map(o => o.id);
}

/* L'équipage : engager des créatures dont la force totale atteint N ; le
   véhicule devient une créature jusqu'à la fin du tour (règle 702.122). */
function equipiers(P, j, o) {
  return champDe(P, j).filter(x => x.id !== o.id && estCreature(x) && !x.engage);
}

function equipagePossible(P, j, o, n) {
  return equipiers(P, j, o).reduce((s, x) => s + Math.max(0, car(P, x).force), 0) >= n;
}

function* paieEquipage(P, j, o, n) {
  const cands = equipiers(P, j, o);
  const ids = yield* choisitCartes(P, j, cands.map(x => x.id), cands.length, 'Équipage', 'cartes', 1);
  const pris = ids.map(id => obj(P, id));
  let total = pris.reduce((s, x) => s + Math.max(0, car(P, x).force), 0);
  /* Trop peu choisi : on complète par les plus faibles. */
  cands.filter(x => !pris.includes(x)).sort((a, b) => car(P, a).force - car(P, b).force).forEach(x => {
    if (total < n) { pris.push(x); total += Math.max(0, car(P, x).force); }
  });
  pris.forEach(x => { x.engage = true; });
  P.ver++;
}

OPS.equipage = function* (P, op, ctx) {
  const s = sourceCtx(P, ctx);
  if (!s || s.lki || s.zone !== 'champ') return;
  (s.anime = s.anime || []).push({types: ['creature'], fin: 'tour'});
  P.ver++;
};
