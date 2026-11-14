/* =====================================================================
   js/jeuActions.js — Exécuter une action choisie à la priorité

   Jouer un terrain, lancer un sort (règle 601.2 : pile, modes, X, cibles,
   coût total, paiement), activer une capacité (602.2), équiper. Les
   actions sont proposées par js/jeuLancer.js ; elles se jouent ici.
   ===================================================================== */

/* Payer la part d'un coût qui n'est pas du mana : engager, sacrifier,
   défausser, payer de la vie, retirer des marqueurs. Le sacrifice de la
   source elle-même rend son instantané, pour que la capacité sache encore
   d'où elle vient. */
function* paieAutre(P, j, o, c) {
  let lki = null;
  if (c.engage) o.engage = true;
  if (c.degage) o.engage = false;
  if (c.vie) P.joueurs[j].vie -= c.vie;
  if (c.retire) { o.marq[c.retire.genre] -= c.retire.n; P.ver++; }
  if (c.engageAutres) {
    const ids = champDe(P, j).filter(x => !x.engage && x.id !== o.id && correspond(P, x, c.engageAutres.desc, o, j)).map(x => x.id);
    (yield* choisitCartes(P, j, ids, c.engageAutres.n, 'Engager')).forEach(id => { obj(P, id).engage = true; });
  }
  if (c.sac) {
    const ids = champDe(P, j).filter(x => correspond(P, x, c.sac.desc, o, j)).map(x => x.id);
    (yield* choisitCartes(P, j, ids, c.sac.n, 'Sacrifier', 'sacrifice')).forEach(id => sacrifie(P, id));
  }
  if (c.defausse) {
    const ids = P.joueurs[j].main.filter(id => id !== o.id && (!c.defausse.desc || correspond(P, obj(P, id), c.defausse.desc, o, j)));
    (yield* choisitCartes(P, j, ids, c.defausse.n, 'Défausser', 'defausse')).forEach(id => deplace(P, id, 'cimetiere'));
  }
  const J = P.joueurs[j];
  if (c.exileCimetiere) {
    const ids = J.cimetiere.filter(id => id !== o.id && correspond(P, obj(P, id), c.exileCimetiere.desc, o, j));
    (yield* choisitCartes(P, j, ids, c.exileCimetiere.n, 'Exiler du cimetière')).forEach(id => deplace(P, id, 'exil'));
  }
  if (c.renvoie) {
    const ids = champDe(P, j).filter(x => correspond(P, x, c.renvoie.desc, o, j)).map(x => x.id);
    (yield* choisitCartes(P, j, ids, c.renvoie.n, 'Renvoyer en main')).forEach(id => deplace(P, id, 'main'));
  }
  if (c.energie) J.energie -= c.energie;
  if (c.defausseSoi && obj(P, o.id)) { lki = instantane(P, o); deplace(P, o.id, 'cimetiere'); emet(P, {t: 'defausse', joueur: j}); }
  if (c.sacSoi && obj(P, o.id)) { lki = instantane(P, o); sacrifie(P, o.id); }
  if (c.exileSoi && obj(P, o.id)) { lki = instantane(P, o); deplace(P, o.id, 'exil'); }
  return lki;
}

/* Le plus grand X qu'un joueur peut payer en plus d'un coût. */
function maxX(P, j, cout) {
  let x = 0;
  while (x < 30 && planPaiement(P, j, cout, x + 1)) x++;
  return x;
}

/* Lancer un sort. Rend vrai s'il est allé sur la pile. */
function* lanceSort(P, j, a) {
  const J = P.joueurs[j], o0 = obj(P, a.id);
  if (!o0) return false;
  const d = o0.def, cid = o0.cid;
  const v = varianteDe(P, j, o0, a.depuis, a.variante);
  if (!v) return false;
  const cout0 = v.mana, presageTour = o0.presageTour;
  const nid = deplace(P, a.id, 'pile');
  const s = obj(P, nid);
  s.ctrl = j;
  const annule = () => {
    const r = deplace(P, nid, a.depuis === 'commandement' ? 'commandement' : a.depuis);
    if (r != null && presageTour != null) obj(P, r).presageTour = presageTour;
    return false;
  };
  let effets = [];
  if (d.sort) effets = yield* prepareEffets(P, j, s, d.sort, d.couleurs);
  else if (d.aura) {
    const c = yield* choisitCibles(P, j, s, [{desc: d.aura, min: 1, max: 1}], d.couleurs, {aura: true});
    effets = c ? [{ops: [], slots: [{desc: d.aura, min: 1, max: 1}], cibles: c, aura: true}] : null;
  }
  if (!effets) return annule();
  let x = 0;
  if (d.cout.x) {
    const max = maxX(P, j, cout0);
    const opts = Array.from({length: max + 1}, (_, i) => i);
    x = opts[(yield question(P, j, 'x', opts, {defaut: max, source: nid}))] || 0;
  }
  const garde = coutDeGarde(P, j, effets);
  let cout = garde ? {...cout0, generique: cout0.generique + garde, total: cout0.total + garde} : cout0;
  if (!payableAvec(P, j, s, cout, x)) return annule();
  if (v.autre && !coutAutrePossible(P, j, s, v.autre)) return annule();
  cout = yield* paieReductions(P, j, s, cout, x);
  if (!cout) return annule();
  if (v.autre) yield* paieAutre(P, j, s, v.autre);
  if (!paieMana(P, j, cout, x)) return annule();
  s.x = x;
  const item = {id: nid, sort: true, ctrl: j, def: d, effets, x, depuis: a.depuis,
    kicked: a.variante === 'kicker', rachat: a.variante === 'rachat', evoque: a.variante === 'evocation'};
  P.pile.push(item);
  if (a.depuis === 'commandement') {
    J.taxe[cid] = (J.taxe[cid] || 0) + 1;
    if (J.stats.cmdTour == null) J.stats.cmdTour = J.tours;
  }
  const st = P.cartes[cid].st;
  st.lancee++;
  if (!st.tourLancee) st.tourLancee = J.tours;
  J.stats.sorts++;
  J.sortsTour.push(d);
  jn(P, `${J.nom} lance ${d.nom}`);
  emet(P, {t: 'lance', joueur: j, def: d, id: nid});
  declencheursDeLancement(P, item);
  return true;
}

/* Activer une capacité, ou une capacité de loyauté. */
function* activeCapacite(P, j, a) {
  const o = obj(P, a.id);
  if (!o) return false;
  const k = o.def.capacites[a.i];
  const effets = yield* prepareEffets(P, j, o, k.effet, o.def.couleurs);
  if (!effets) return false;
  let x = 0, lki = null;
  if (k.genre === 'loyaute') {
    let delta = k.delta;
    if (delta === 'X') {
      const opts = Array.from({length: (o.marq.loyaute || 0) + 1}, (_, i) => i);
      x = opts[(yield question(P, j, 'x', opts, {defaut: opts.length - 1, source: o.id}))] || 0;
      delta = -x;
    }
    o.marq.loyaute = (o.marq.loyaute || 0) + delta;
    P.unefois.add(o.id + '|loyaute');
    P.ver++;
  } else {
    if (k.cout.mana.x) x = maxX(P, j, k.cout.mana);
    if (!coutAutrePossible(P, j, o, k.cout) || !planPaiement(P, j, k.cout.mana, x)) return false;
    lki = yield* paieAutre(P, j, o, k.cout);
    if (!paieMana(P, j, k.cout.mana, x)) return false;
    if (k.unefois) P.unefois.add(a.id + '|a' + a.i);
    /* Un cycle s'entend : « when you cycle ~ » écoute à travers
       l'instantané de la carte, partie au cimetière. */
    if (k.cycle) { if (lki) P.partis.push(lki); emet(P, {t: 'cycle', joueur: j, lki}); }
  }
  P.pile.push({id: P.prochainId++, capacite: true, source: o.id, lki, ctrl: j, effets, x, nom: o.def.nom});
  jn(P, `${P.joueurs[j].nom} active ${o.def.nom}`);
  return true;
}

/* Équiper : une capacité à vitesse de rituel qui attache l'équipement. */
function* equipe(P, j, a) {
  const o = obj(P, a.id);
  const slot = {desc: {genre: 'objet', types: ['creature'], non: [], sousTypes: [], couleurs: [], filtres: [], zone: 'champ', mots: 0, ctrl: 'vous', autre: true}, min: 1, max: 1};
  const c = yield* choisitCibles(P, j, o, [slot], o.def.couleurs, {equipe: true});
  if (!c || !c[0].length || !paieMana(P, j, o.def.equipe, 0)) return false;
  P.pile.push({id: P.prochainId++, capacite: true, source: o.id, ctrl: j, x: 0, nom: o.def.nom,
    effets: [{ops: [{op: 'attache', a: {cible: 0}}], slots: [slot], cibles: c}]});
  return true;
}

OPS.attache = function* (P, op, ctx) {
  const s = sourceCtx(P, ctx), h = resous(P, op.a, ctx)[0];
  if (!s || s.lki || s.zone !== 'champ' || !h || h.j != null || h.zone !== 'champ' || s.ctrl !== ctx.ctrl) return;
  s.att = h.id;
  P.ver++;
};

/* Jouer un terrain : pas de pile, un par tour (règle 305). */
function* joueTerrain(P, j, a) {
  P.joueurs[j].terrainsJoues++;
  jn(P, `${P.joueurs[j].nom} joue ${nomObj(P, a.id)}`);
  yield* metEnJeu(P, a.id, j, {});
  return true;
}

/* Exécuter une action choisie. */
function* executeAction(P, j, a) {
  if (a.k === 'terrain') return yield* joueTerrain(P, j, a);
  if (a.k === 'lancer') return yield* lanceSort(P, j, a);
  if (a.k === 'activer') return yield* activeCapacite(P, j, a);
  if (a.k === 'equiper') return yield* equipe(P, j, a);
  if (a.k === 'presager') return yield* presage(P, j, a);
  return false;
}
