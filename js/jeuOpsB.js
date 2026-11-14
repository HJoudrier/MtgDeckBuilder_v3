/* =====================================================================
   js/jeuOpsB.js — Exécuter les opérations : jetons, marqueurs, pompes,
   mana, recherches, déplacements, et l'enchaînement

   Suite de js/jeuOpsA.js. `executeOps()` est la porte : elle déroule une
   liste d'opérations, applique « for each » et « unless … pays », et
   s'arrête net si la partie se termine en cours de route.
   ===================================================================== */

/* Le plafond d'objets sur le champ : une boucle de jetons mal comprise ne
   doit pas faire tomber la page, elle fait finir la partie au plafond. */
const PLAFOND_CHAMP = 500;

OPS.jetons = function* (P, op, ctx) {
  const n = valeur(P, op.n, ctx);
  if (!op._def) op._def = definitionJeton(op.jeton);
  const qui = op.qui ? joueursDe(P, op.qui, ctx) : [ctx.ctrl];
  for (const j of qui) {
    for (let k = 0; k < n; k++) {
      if (P.champ.length >= PLAFOND_CHAMP) { P.fin = P.fin || {nulle: true, raison: 'plafond'}; return; }
      const cid = nouvelleCarte(P, op._def, j, false, true);
      const o = creeObjet(P, cid, j, 'champ');
      o.engage = !!op.engage;
      P.champ.push(o.id);
      P.ver++;
      emet(P, {t: 'entre', id: o.id, ctrl: j, jeton: true});
    }
  }
  jn(P, `${n} jeton(s) ${op._def.nom}`);
};
OPS.marqueurs = function* (P, op, ctx) {
  const n = valeur(P, op.n, ctx);
  resous(P, op.a, ctx).filter(o => o.j == null && o.zone === 'champ').forEach(o => {
    o.marq[op.genre] = (o.marq[op.genre] || 0) + n;
    P.ver++;
  });
};
OPS.prolifere = function* (P, op, ctx) {
  P.champ.forEach(id => {
    const o = obj(P, id);
    if (o.ctrl === ctx.ctrl) ['+1/+1', 'loyaute'].forEach(g => { if (o.marq[g] > 0) o.marq[g]++; });
    else if (o.marq['-1/-1'] > 0) o.marq['-1/-1']++;
  });
  P.joueurs.forEach(J => { if (J.i !== ctx.ctrl && J.poison > 0) J.poison++; });
  P.ver++;
};
OPS.pompe = function* (P, op, ctx) {
  const f = valeur(P, op.f, ctx), e = valeur(P, op.e, ctx);
  resous(P, op.a, ctx).filter(o => o.j == null && o.zone === 'champ').forEach(o => {
    o.mods.push({f, e, mots: op.mots || 0, fin: 'tour'});
    P.ver++;
  });
};
OPS.mana = function* (P, op, ctx) { ajouteMana(P, ctx.ctrl, op.options[0]); };
OPS.cherche = function* (P, op, ctx) {
  const j = op.qui ? joueursDe(P, op.qui, ctx)[0] : ctx.ctrl;
  if (j == null) return;
  const src = sourceCtx(P, ctx);
  const ids = P.joueurs[j].bibliotheque.filter(id => correspond(P, obj(P, id), op.desc, src, j));
  ctx.trouves = yield* choisitCartes(P, j, ids, op.n, 'Chercher', 'cartes', 0);
  melangeHasard(P.rng, P.joueurs[j].bibliotheque);
};
OPS.engage = function* (P, op, ctx) {
  resous(P, op.a, ctx).filter(o => o.j == null && o.zone === 'champ').forEach(o => { o.engage = true; });
};
OPS.degage = function* (P, op, ctx) {
  let cibles;
  if (op.a.choix) {
    const ids = champDe(P, ctx.ctrl).filter(o => o.engage && correspond(P, o, op.a.choix, sourceCtx(P, ctx), ctx.ctrl)).map(o => o.id);
    cibles = (yield* choisitCartes(P, ctx.ctrl, ids, op.a.n, 'Dégager', 'cartes', 0)).map(id => obj(P, id));
  } else cibles = resous(P, op.a, ctx);
  cibles.filter(o => o && o.j == null && o.zone === 'champ').forEach(o => { o.engage = false; });
};
OPS.place = function* (P, op, ctx) {
  let cibles;
  if (op.a.choix) {
    const d = op.a.choix, src = sourceCtx(P, ctx);
    const ids = P.joueurs[ctx.ctrl][d.zone || 'main'].filter(id => correspond(P, obj(P, id), d, src, ctx.ctrl));
    cibles = (yield* choisitCartes(P, ctx.ctrl, ids, op.a.n, 'Mettre en jeu', 'cartes', 0)).map(id => obj(P, id));
  } else cibles = resous(P, op.a, ctx);
  for (const o of cibles) {
    if (!o || o.j != null || o.lki) continue;
    if (o.zone === 'pile') retireDeLaPile(P, o.id);
    if (op.vers === 'champ') {
      const ctrl = o.zone === 'bibliotheque' || o.zone === 'main' ? o.prop : ctx.ctrl;
      if (o.def.types.some(t => TYPES_PERMANENTS.includes(t))) yield* metEnJeu(P, o.id, ctrl, {engage: op.engage});
    } else deplace(P, o.id, op.vers);
  }
};
OPS.scrute = function* (P, op, ctx) {
  const n = valeur(P, op.n, ctx), B = P.joueurs[ctx.ctrl].bibliotheque;
  const dessus = B.slice(-n).reverse();
  if (!dessus.length) return;
  const partent = yield* choisitCartes(P, ctx.ctrl, dessus, dessus.length, op.cimetiere ? 'Surveiller' : 'Regard', 'scrute', 0);
  partent.forEach(id => {
    if (op.cimetiere) deplace(P, id, 'cimetiere');
    else { retireDe(B, id); B.unshift(id); }
  });
};

const TYPES_PERMANENTS = ['creature', 'artifact', 'enchantment', 'land', 'planeswalker', 'battle'];

/* Un permanent arrive sur le champ, avec sa façon d'entrer : engagé,
   engagé sauf si, en payant de la vie, avec des marqueurs, et la loyauté
   d'un planeswalker. Rend l'identifiant du nouvel objet. */
function* metEnJeu(P, id, ctrl, opts = {}) {
  const o = obj(P, id);
  const ent = o.def.entree || {};
  let engage = !!opts.engage || !!ent.engagee;
  if (ent.engagee && ent.sauf && ent.sauf.some(d => champDe(P, ctrl).some(x => correspondBase(P, x, d, null, ctrl)))) engage = false;
  if (ent.engagee && ent.payeVie && !opts.engage) {
    const r = yield question(P, ctrl, 'oui', ['non', 'oui'], {texte: `Payer ${ent.payeVie} PV pour qu'il entre dégagé ?`, source: id});
    if (r === 1) { P.joueurs[ctrl].vie -= ent.payeVie; engage = false; }
  }
  const x = o.x || 0;
  const n = deplace(P, id, 'champ', {ctrl, engage});
  const no = obj(P, n);
  if (!no) return n;
  if (o.def.loyaute != null) no.marq.loyaute = o.def.loyaute;
  if (ent.marqueurs) no.marq[ent.genre === 'loyalty' ? 'loyaute' : ent.genre] = ent.marqueurs === 'X' ? x : ent.marqueurs;
  if (opts.attache != null) no.att = opts.attache;
  no.x = x;
  P.ver++;
  return n;
}

/* Proposer à un joueur de payer pour empêcher une opération (« unless that
   player pays {1} »). Rend vrai s'il a payé. */
function* proposePaiement(P, op, ctx) {
  const j = joueursDe(P, op.sauf.qui, ctx)[0];
  if (j == null || !planPaiement(P, j, op.sauf.cout, 0)) return false;
  const r = yield question(P, j, 'oui', ['non', 'oui'], {texte: `Payer ${op.sauf.cout.sym.join('')} ?`, source: ctx.source, extra: {sauf: op}});
  return r === 1 && paieMana(P, j, op.sauf.cout, 0);
}

/* Dérouler une liste d'opérations. */
function* executeOps(P, ops, ctx) {
  for (const op of ops) {
    if (P.fin) return;
    if (op.sauf && (yield* proposePaiement(P, op, ctx))) continue;
    const fois = op.parChaque ? compteObjets(P, op.parChaque, sourceCtx(P, ctx), ctx.ctrl) : 1;
    const f = op.forge ? executeForge : OPS[op.op];
    if (!f) continue;
    for (let k = 0; k < fois && !P.fin; k++) yield* f(P, op, ctx);
  }
}
