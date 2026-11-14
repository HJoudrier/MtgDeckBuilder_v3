/* =====================================================================
   js/jeuEtat.js — Une partie : ses joueurs, ses objets, ses zones

   Tout l'état d'une partie vit dans un objet `P`, et nulle part ailleurs :
   les générateurs du moteur ne gardent que des identifiants, et relisent
   l'objet après chaque question posée — il a pu changer de zone entre-temps.

   La **carte** (`cid`) se distingue de l'**objet** (`id`). Une carte garde
   son `cid` toute la partie — c'est à lui que s'attachent les statistiques —
   mais elle devient un objet neuf à chaque changement de zone (règle 400.7) :
   une aura tombe, un sort perd sa cible, sans une ligne de code à part.
   ===================================================================== */

const ZONES_JOUEUR = ['bibliotheque', 'main', 'cimetiere', 'exil', 'commandement'];

/* Créer une partie. `cfg.sieges` : `[{nom, format, vie, cartes:[{def, n}],
   commandants:[def]}]` ; `cfg.premier` : le siège qui commence. */
function nouvellePartie(cfg) {
  const P = {
    graine: cfg.graine >>> 0, rng: etatHasard(cfg.graine), joueurs: [], objets: new Map(), champ: [], pile: [],
    cartes: [], tour: 0, actif: cfg.premier || 0, premier: cfg.premier || 0, etape: '', prochainId: 1, ver: 0,
    ts: 0, enAttente: [], evts: [], partis: [], suivi: new Map(), lkis: new Map(), journal: cfg.journal ? [] : null, fin: null,
    reponses: cfg.consigne ? [] : null, nq: 0, plafondTours: cfg.plafondTours || 25, actionsTour: 0,
    nb: cfg.sieges.length, combat: null, sansCombat: false, finTour: false
  };
  cfg.sieges.forEach((s, i) => {
    const J = {i, nom: s.nom || ('Joueur ' + (i + 1)), format: s.format || 'perso', vie: s.vie || 20, poison: 0, energie: 0,
      pool: {W: 0, U: 0, B: 0, R: 0, G: 0, C: 0}, degatsCmd: {}, taxe: {}, commandants: [], terrainsJoues: 0,
      sortsTour: [], elimine: false, raison: null, piocheVide: false, mulligans: 0, tours: 0,
      stats: {terrainsT4: null, cmdTour: null, manaDepense: 0, manaDispo: 0, sorts: 0, degats: 0}};
    ZONES_JOUEUR.forEach(z => { J[z] = []; });
    P.joueurs.push(J);
    s.cartes.forEach(({def, n}) => {
      for (let k = 0; k < n; k++) J.bibliotheque.push(creeObjet(P, nouvelleCarte(P, def, i), i, 'bibliotheque').id);
    });
    (s.commandants || []).forEach(def => {
      const cid = nouvelleCarte(P, def, i, true);
      J.commandants.push(cid);
      J.taxe[cid] = 0;
      J.commandement.push(creeObjet(P, cid, i, 'commandement').id);
    });
  });
  return P;
}

/* Inscrire une carte de la partie. Un jeton aussi en reçoit une, pour que
   ses statistiques et son nom aient un support. */
function nouvelleCarte(P, def, prop, cmd, jeton) {
  return P.cartes.push({def, prop, nom: def.nom, cmd: !!cmd, jeton: !!jeton,
    st: {piochee: 0, lancee: 0, tourLancee: 0, enMain: false, degats: 0}}) - 1;
}

function creeObjet(P, cid, prop, zone, ctrl) {
  const k = P.cartes[cid];
  const o = {id: P.prochainId++, cid, def: k.def, prop, ctrl: ctrl == null ? prop : ctrl, zone, engage: false,
    pret: false, marq: {}, bless: 0, toucheMortel: false, att: null, jeton: k.jeton, cmd: k.cmd, mods: [],
    ts: ++P.ts, x: 0, utilise: null, _v: -1, _c: null};
  P.objets.set(o.id, o);
  return o;
}

function obj(P, id) { return P.objets.get(id); }

/* L'identifiant qu'un objet porte aujourd'hui, en suivant ses changements de
   zone pendant la résolution en cours (« exile it, then return it »). */
function suit(P, id) {
  let n = id, k = 0;
  while (P.suivi.has(n) && k++ < 8) n = P.suivi.get(n);
  return n;
}

/* Le tableau d'une zone : le champ de bataille est commun, le reste
   appartient au propriétaire. Le dessus d'une bibliothèque est sa fin. */
function tableauZone(P, o) {
  if (o.zone === 'champ') return P.champ;
  if (o.zone === 'pile') return null;
  return P.joueurs[o.prop][o.zone];
}

function retireDe(t, id) {
  const i = t ? t.lastIndexOf(id) : -1;
  if (i >= 0) t.splice(i, 1);
}

/* Ce qu'on savait d'un objet au moment où il est parti : le moteur s'en sert
   pour « when ~ dies » et « equal to its power » (règle 608.2h). */
function instantane(P, o) {
  const c = car(P, o);
  return {id: o.id, cid: o.cid, def: o.def, ctrl: o.ctrl, prop: o.prop, force: c.force, endurance: c.endurance,
    mots: c.mots, types: c.types, sousTypes: c.sousTypes, couleurs: c.couleurs, marq: {...o.marq}, jeton: o.jeton,
    cmd: o.cmd, att: o.att, zone: o.zone, lki: true,
    caps: o.zone === 'champ' && capacitesDe(P, o) !== o.def.capacites ? capacitesDe(P, o) : null};
}

/* Déplacer un objet. Rend l'identifiant du nouvel objet, ou `null` pour un
   jeton qui quitte le champ (il cesse d'exister). `vers` : une zone, ou
   `dessus` / `dessous` de la bibliothèque. */
function deplace(P, id, vers, opts = {}) {
  const o = obj(P, id);
  if (!o) return null;
  const depuis = o.zone;
  /* Exhumée, elle part en exil où qu'elle aille (règle 702.84a). */
  if (o.exhume && depuis === 'champ' && vers !== 'exil') vers = 'exil';
  /* Les remplacements (« exile it instead », js/forgeRemplacements.js). */
  if (vers === 'cimetiere' && typeof destinationRemplacee === 'function') vers = destinationRemplacee(P, o, depuis, vers);
  const lki = depuis === 'champ' ? instantane(P, o) : null;
  retireDe(tableauZone(P, o), id);
  if (depuis === 'champ') {
    lki.attaches = [];
    P.champ.forEach(k => { const a = obj(P, k); if (a.att === id) { a.att = null; lki.attaches.push(k); } });
    P.partis.push(lki);
    P.lkis.set(id, lki);
  }
  P.objets.delete(id);
  P.ver++;
  const zone = vers === 'dessus' || vers === 'dessous' ? 'bibliotheque' : vers;
  if (depuis === 'champ' && zone === 'cimetiere' && lki.types.includes('creature'))
    emet(P, {t: 'meurt', ancien: id, lki, ctrl: lki.ctrl});
  if (o.jeton && zone !== 'champ') {
    emet(P, {t: 'zone', de: depuis, vers: zone, ancien: id, lki});
    if (depuis === 'champ' && P.effets) hotePart(P, id);
    return null;
  }
  const n = creeObjet(P, o.cid, o.prop, zone, zone === 'champ' ? (opts.ctrl != null ? opts.ctrl : o.prop) : o.prop);
  P.suivi.set(id, n.id);
  if (zone === 'champ') {
    n.engage = !!opts.engage;
    P.champ.push(n.id);
  } else if (zone === 'pile') {
    /* Un sort sur la pile : l'élément de pile qui le porte est posé par
       l'appelant (js/jeuLancer.js). */
  } else if (vers === 'dessous') P.joueurs[o.prop].bibliotheque.unshift(n.id);
  else P.joueurs[o.prop][zone].push(n.id);
  emet(P, {t: 'zone', de: depuis, vers: zone, ancien: id, id: n.id, lki});
  noteEntree(P, depuis, zone, depuis === 'champ' ? lki : n);
  if (zone === 'champ') emet(P, {t: 'entre', id: n.id, ctrl: n.ctrl});
  if (depuis === 'champ' && P.effets) hotePart(P, id);
  return n.id;
}

/* Ce qui est arrivé dans une zone ce tour, pour « the number of creatures
   that died this turn » : l'instantané d'un objet parti du champ, l'objet
   lui-même sinon. */
function noteEntree(P, de, vers, o) {
  (P.entresTour || (P.entresTour = [])).push({de, vers, o});
}

/* Un évènement, que la collecte des déclencheurs lira (js/jeuDeclencheurs.js). */
function emet(P, e) { P.evts.push(e); }

/* Une ligne de journal — rien du tout quand la partie ne se journalise pas,
   ce qui est le cas de toutes celles d'un lot. */
function jn(P, txt) { if (P.journal) P.journal.push({t: P.tour, e: P.etape, txt}); }

function nomObj(P, id) {
  const o = typeof id === 'object' ? id : obj(P, id);
  return o ? o.def.nom : '?';
}

function vivants(P) { return P.joueurs.filter(J => !J.elimine); }

/* Le joueur suivant encore en lice, dans l'ordre des sièges. */
function suivantVivant(P, i) {
  for (let k = 1; k <= P.nb; k++) {
    const j = (i + k) % P.nb;
    if (!P.joueurs[j].elimine) return j;
  }
  return i;
}

/* Les joueurs en lice dans l'ordre APNAP : le joueur actif d'abord. */
function ordreApnap(P) {
  const r = [];
  for (let k = 0; k < P.nb; k++) {
    const j = (P.actif + k) % P.nb;
    if (!P.joueurs[j].elimine) r.push(j);
  }
  return r;
}

function adversaires(P, i) { return vivants(P).filter(J => J.i !== i).map(J => J.i); }

/* Les objets du champ qu'un joueur contrôle. */
function champDe(P, j) { return P.champ.map(id => obj(P, id)).filter(o => o.ctrl === j); }

/* Piocher. Une bibliothèque vide ne fait pas perdre sur-le-champ : elle le
   note, et l'action d'état tranche (règle 704.5b). */
function piocheN(P, j, n) {
  const J = P.joueurs[j];
  for (let k = 0; k < n; k++) {
    if (!J.bibliotheque.length) { J.piocheVide = true; return; }
    const id = J.bibliotheque.pop();
    const o = obj(P, id);
    o.zone = 'main';
    J.main.push(id);
    const st = P.cartes[o.cid].st;
    if (!st.piochee) st.piochee = Math.max(1, J.tours);
    J.piochesTour = (J.piochesTour || 0) + 1;
    emet(P, {t: 'pioche', joueur: j, n: J.piochesTour});
  }
}

/* Une question posée à un joueur : le moteur la rend par `yield`, le pilote
   la porte à l'agent du joueur et renvoie sa réponse (js/jeuPilote.js). La
   réponse est un indice d'option, ou une liste d'indices quand `max` passe
   un ; `defaut` est ce qu'on retient d'une réponse invalide. */
function question(P, j, q, options, x = {}) {
  const min = x.min != null ? x.min : 1, max = x.max != null ? x.max : 1;
  const multi = x.multi != null ? x.multi : max !== 1 || min !== 1;
  return {n: P.nq++, joueur: j, q, options, min, max, multi, source: x.source || null, texte: x.texte || '',
    defaut: x.defaut != null ? x.defaut : (multi ? options.slice(0, min).map((_, i) => i) : 0), extra: x.extra || null};
}
