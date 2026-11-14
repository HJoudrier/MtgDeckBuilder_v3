/* =====================================================================
   js/jeuOpsA.js — Exécuter les opérations : références, dégâts, vie,
   cartes, retraits

   Le compilateur a rendu des opérations dont les termes sont des
   **références** (« la cible 0 », « chaque adversaire », « it », « its
   controller ») et des **quantités** (« X », « its power », « the number of
   Goblins you control »). On ne les résout qu'ici, à la résolution, contre
   l'état du moment : la cible a pu partir, la force a pu changer.

   Chaque opération est un générateur : la plupart ne posent aucune question,
   mais une défausse, un sacrifice, une recherche en posent, et toutes
   s'enchaînent par `yield*` (js/jeuOpsB.js `executeOps()`).
   ===================================================================== */

/* La source d'une capacité ou d'un sort, telle qu'elle est maintenant, ou
   telle qu'on l'a connue si elle est partie. */
function sourceCtx(P, ctx) { return obj(P, suit(P, ctx.source)) || ctx.lki || null; }

/* Un objet tel qu'il était, si la résolution en cours l'a fait partir, sinon
   tel qu'il est. */
function passeOuPresent(P, id) { return P.lkis.get(id) || obj(P, suit(P, id)) || null; }

/* Résoudre une référence en objets et en joueurs (`{j}`). `passe` : on veut
   l'objet tel qu'il était avant d'être déplacé par cette résolution — « its
   controller gains life equal to its power » parle de la créature exilée. */
function resous(P, ref, ctx, passe) {
  if (!ref) return [];
  if (ref.vous) return [{j: ctx.ctrl}];
  if (ref.soi) { const o = sourceCtx(P, ctx); return o ? [o] : []; }
  if (ref.cible != null) {
    return (ctx.cibles[ref.cible] || []).map(c => typeof c === 'object' ? c
      : passe ? passeOuPresent(P, c) : obj(P, suit(P, c))).filter(Boolean);
  }
  if (ref.chaque) {
    const d = ref.chaque, src = sourceCtx(P, ctx);
    if (d.genre === 'joueur') return P.joueurs.filter(J => joueurCorrespond(P, J.i, d, ctx.ctrl)).map(J => ({j: J.i}));
    return P.champ.map(id => obj(P, id)).filter(o => correspond(P, o, d, src, ctx.ctrl));
  }
  if (ref.attache) { const s = sourceCtx(P, ctx); const a = s && s.att != null ? obj(P, s.att) : null; return a ? [a] : []; }
  if (ref.evt) {
    const e = ctx.evt || {};
    if (ref.evt === 'joueur') return e.joueur != null ? [{j: e.joueur}] : [];
    const o = e.id != null ? obj(P, suit(P, e.id)) : null;
    return o ? [o] : e.lki ? [e.lki] : [];
  }
  if (ref.controleurDe || ref.proprioDe) {
    const vus = new Set();
    return resous(P, ref.controleurDe || ref.proprioDe, ctx, true).map(o => o.j != null ? o
      : {j: ref.controleurDe ? o.ctrl : o.prop}).filter(x => !vus.has(x.j) && vus.add(x.j));
  }
  if (ref.trouve) {
    const t = (ctx.trouves || []).map(id => obj(P, id)).filter(Boolean);
    return ref.trouve === 'un' ? t.slice(0, 1) : ref.trouve === 'autre' ? t.slice(1) : t;
  }
  if (ref.choisis) return ref.choisis.map(id => obj(P, id)).filter(Boolean);
  return [];
}

/* Les joueurs d'une référence, objets ramenés à leur contrôleur. */
function joueursDe(P, ref, ctx) {
  return resous(P, ref, ctx).map(x => x.j != null ? x.j : x.ctrl).filter(j => !P.joueurs[j].elimine);
}

/* La valeur d'une quantité. */
function valeur(P, q, ctx) {
  if (typeof q === 'number') return q;
  if (q === 'X') return ctx.x || 0;
  if (!q) return 0;
  if (q.neg) return -valeur(P, q.neg, ctx);
  if (q.evt === 'n') return (ctx.evt && ctx.evt.n) || 0;
  if (q.forceDe || q.mvDe) {
    const o = resous(P, q.forceDe || q.mvDe, ctx, true)[0];
    if (!o || o.j != null) return 0;
    return q.mvDe ? mvDe(o) : (o.lki ? o.force : car(P, o).force);
  }
  if (q.compte) return compteObjets(P, q.compte, sourceCtx(P, ctx), ctx.ctrl);
  return 0;
}

function gagneVie(P, j, n) {
  if (n <= 0 || P.joueurs[j].elimine || vieBloquee(P, j)) return;
  P.joueurs[j].vie += n;
  P.joueurs[j].vieTour = (P.joueurs[j].vieTour || 0) + n;
  emet(P, {t: 'vie', joueur: j, n});
}

/* Infliger des dégâts : à un joueur, à une créature, à un planeswalker.
   Lien de vie, contact mortel, infection et dégâts de commandant se jouent
   ici, pour le combat comme pour un sort. */
function infligeDegats(P, src, cible, n, combat) {
  if (n <= 0 || !src) return 0;
  n = degatsApresPrevention(P, src, cible, n, combat);
  if (n <= 0) return 0;
  const cs = src.lki ? src : caracsJugees(P, src);
  const mots = cs.mots, ctrl = src.ctrl;
  if (cible.j != null) {
    const J = P.joueurs[cible.j];
    if (J.elimine) return 0;
    if (mots & MOT.INFECTION) J.poison += n; else J.vie -= n;
    if (combat && src.cmd) J.degatsCmd[src.cid] = (J.degatsCmd[src.cid] || 0) + n;
    if (P.joueurs[ctrl]) P.joueurs[ctrl].stats.degats += n;
    emet(P, {t: 'degatsJoueur', source: src.id, joueur: cible.j, n, combat, ctrl});
  } else {
    const o = cible;
    if (!o || o.zone !== 'champ') return 0;
    if ((car(P, o).mots & MOT.PROTECTION) && (o.def.params.protection || []).some(k => cs.couleurs.includes(k))) return 0;
    if (protegeFiltre(P, o, src)) return 0;
    if (estType(o, 'planeswalker') && !estCreature(o)) { o.marq.loyaute = (o.marq.loyaute || 0) - n; P.ver++; }
    else if (mots & MOT.INFECTION) poseMarqueurs(P, o, '-1/-1', n, src);
    else { o.bless += n; if (mots & MOT.CONTACT) o.toucheMortel = true; }
    emet(P, {t: 'degatsObjet', source: src.id, id: o.id, n, combat, ctrl});
  }
  if (P.cartes[src.cid]) P.cartes[src.cid].st.degats += n;
  if (mots & MOT.LIEN) gagneVie(P, ctrl, n);
  jn(P, `${src.def.nom} inflige ${n} à ${cible.j != null ? P.joueurs[cible.j].nom : cible.def.nom}`);
  return n;
}

/* Choisir des cartes : une question au joueur, sauf quand le choix est
   forcé (autant de cartes que d'options, ou aucune). */
function* choisitCartes(P, j, ids, n, texte, q = 'cartes', min) {
  const lo = min != null ? Math.min(min, ids.length) : Math.min(n, ids.length);
  const hi = Math.min(n, ids.length);
  if (!ids.length || hi === 0) return [];
  if (lo === ids.length) return ids.slice();
  const r = yield question(P, j, q, ids, {min: lo, max: hi, multi: true, texte});
  return (Array.isArray(r) ? r : [r]).map(i => ids[i]).filter(x => x != null);
}

const OPS = {};

OPS.degats = function* (P, op, ctx) {
  const n = valeur(P, op.n, ctx), src = resous(P, op.source, ctx, true)[0] || sourceCtx(P, ctx);
  for (const c of resous(P, op.a, ctx)) infligeDegats(P, src, c, n, false);
};
OPS.combat = function* (P, op, ctx) {
  const a = resous(P, op.a, ctx)[0], b = resous(P, op.b, ctx)[0];
  if (!a || !b || a.j != null || b.j != null || a.zone !== 'champ' || b.zone !== 'champ') return;
  infligeDegats(P, a, b, car(P, a).force, false);
  infligeDegats(P, b, a, car(P, b).force, false);
};
OPS.gagneVie = function* (P, op, ctx) { const n = valeur(P, op.n, ctx); joueursDe(P, op.qui, ctx).forEach(j => gagneVie(P, j, n)); };
OPS.perdVie = function* (P, op, ctx) {
  const n = valeur(P, op.n, ctx);
  joueursDe(P, op.qui, ctx).forEach(j => { if (n > 0) P.joueurs[j].vie -= n; });
};
OPS.pioche = function* (P, op, ctx) { const n = valeur(P, op.n, ctx); joueursDe(P, op.qui, ctx).forEach(j => piocheN(P, j, n)); };
OPS.meule = function* (P, op, ctx) {
  const n = valeur(P, op.n, ctx);
  for (const j of joueursDe(P, op.qui, ctx)) {
    const B = P.joueurs[j].bibliotheque;
    for (let k = 0; k < n && B.length; k++) deplace(P, B[B.length - 1], 'cimetiere');
  }
};
OPS.defausse = function* (P, op, ctx) {
  const n = valeur(P, op.n, ctx);
  for (const j of joueursDe(P, op.qui, ctx)) {
    const choix = yield* choisitCartes(P, j, P.joueurs[j].main.slice(), n, 'Défausser', 'defausse');
    choix.forEach(id => defausseCarte(P, id, j));
  }
};
OPS.detruit = function* (P, op, ctx) {
  const cibles = resous(P, op.a, ctx).filter(o => o.j == null && o.zone === 'champ' && !aMot(P, o, MOT.INDESTRUCTIBLE));
  if (cibles.length) jn(P, `Détruit : ${cibles.map(o => o.def.nom).join(', ')}`);
  cibles.forEach(o => detruitObjet(P, o));
};
OPS.exile = function* (P, op, ctx) {
  resous(P, op.a, ctx).filter(o => o.j == null && !o.lki).forEach(o => {
    if (o.zone === 'pile') retireDeLaPile(P, o.id);
    jn(P, `Exilé : ${o.def.nom}`);
    deplace(P, o.id, 'exil');
  });
};
OPS.contre = function* (P, op, ctx) {
  resous(P, op.a, ctx).filter(o => o.j == null && o.zone === 'pile' && !incontrecarrable(P, o)).forEach(o => {
    retireDeLaPile(P, o.id);
    deplace(P, o.id, 'cimetiere');
    jn(P, `${o.def.nom} est contrecarré`);
  });
};
OPS.sacrifie = function* (P, op, ctx) {
  const src = sourceCtx(P, ctx);
  for (const j of joueursDe(P, op.qui, ctx)) {
    const ids = champDe(P, j).filter(o => correspond(P, o, op.desc, src, j)).map(o => o.id);
    const choix = yield* choisitCartes(P, j, ids, op.n, 'Sacrifier', 'sacrifice');
    choix.forEach(id => sacrifie(P, id));
  }
};
OPS.sacrifieObjet = function* (P, op, ctx) {
  resous(P, op.a, ctx).filter(o => o.j == null && o.zone === 'champ' && o.ctrl === ctx.ctrl).forEach(o => sacrifie(P, o.id));
};

/* Sacrifier, c'est mettre au cimetière en le disant : « whenever you
   sacrifice » l'écoute. */
function sacrifie(P, id) {
  const o = obj(P, id);
  if (!o) return;
  const lki = instantane(P, o);
  deplace(P, id, 'cimetiere');
  emet(P, {t: 'sacrifie', joueur: lki.ctrl, lki});
}

OPS.rien = function* () {};
OPS.suite = function* (P, op, ctx) { yield* executeOps(P, op.ops, ctx); };
OPS.peut = function* (P, op, ctx) {
  const j = op.qui ? (joueursDe(P, op.qui, ctx)[0]) : ctx.ctrl;
  if (j == null) { ctx.fait = false; return; }
  const r = yield question(P, j, 'oui', ['non', 'oui'], {texte: 'Le faire ?', source: ctx.source, extra: {ops: op.ops}});
  ctx.fait = r === 1;
  if (ctx.fait) yield* executeOps(P, op.ops, ctx);
};
OPS.siFait = function* (P, op, ctx) { if (ctx.fait) yield* executeOps(P, op.ops, ctx); };
