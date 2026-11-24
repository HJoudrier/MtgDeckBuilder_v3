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
  if (c.engage) engageObjet(P, o);
  if (c.degage) degageObjet(P, o);
  if (c.vie) { P.joueurs[j].vie -= c.vie; emet(P, {t: 'payeVie', joueur: j, n: c.vie}); }
  if (c.retire) { o.marq[c.retire.genre] -= c.retire.n; P.ver++; emet(P, {t: 'marqueurRetire', id: o.id, genre: c.retire.genre, n: c.retire.n}); }
  if (c.engageAutres) {
    const ids = champDe(P, j).filter(x => !x.engage && x.id !== o.id && correspond(P, x, c.engageAutres.desc, o, j)).map(x => x.id);
    /* Les créatures engagées : Station compte leur force (js/forgePaliers.js). */
    P.engagesCout = yield* choisitCartes(P, j, ids, c.engageAutres.n, 'Engager');
    P.engagesCout.forEach(id => engageObjet(P, obj(P, id)));
  }
  if (c.degageAutres) {
    const ids = champDe(P, j).filter(x => x.engage && x.id !== o.id && correspond(P, x, c.degageAutres.desc, o, j)).map(x => x.id);
    (yield* choisitCartes(P, j, ids, c.degageAutres.n, 'Dégager')).forEach(id => degageObjet(P, obj(P, id)));
  }
  if (c.sac) {
    const ids = champDe(P, j).filter(x => correspond(P, x, c.sac.desc, o, j) && !sacrificeInterdit(P, x, true)).map(x => x.id);
    (yield* choisitCartes(P, j, ids, c.sac.n, 'Sacrifier', 'sacrifice')).forEach(id => sacrifie(P, id));
  }
  if (c.defausse) {
    const ids = P.joueurs[j].main.filter(id => id !== o.id && (!c.defausse.desc || correspond(P, obj(P, id), c.defausse.desc, o, j)));
    (yield* choisitCartes(P, j, ids, c.defausse.n, c.defausse.exil ? 'Exiler de la main' : 'Défausser', 'defausse'))
      .forEach(id => { if (c.defausse.exil) deplace(P, id, 'exil'); else defausseCarte(P, id, j); });
  }
  const J = P.joueurs[j];
  if (c.defausseTout) J.main.slice().forEach(id => defausseCarte(P, id, j));
  if (c.exileCimetiere) {
    const ids = J.cimetiere.filter(id => id !== o.id && correspond(P, obj(P, id), c.exileCimetiere.desc, o, j));
    (yield* choisitCartes(P, j, ids, c.exileCimetiere.n, 'Exiler du cimetière')).forEach(id => deplace(P, id, 'exil'));
  }
  if (c.renvoie) {
    const ids = champDe(P, j).filter(x => correspond(P, x, c.renvoie.desc, o, j)).map(x => x.id);
    (yield* choisitCartes(P, j, ids, c.renvoie.n, 'Renvoyer en main')).forEach(id => deplace(P, id, 'main'));
  }
  if (c.energie) J.energie -= c.energie;
  if (c.pioche) yield* pioche(P, j, c.pioche);
  if (c.equipage) yield* paieEquipage(P, j, o, c.equipage);
  if (coutSpecial(c)) yield* paieAutreB(P, j, o, c);
  if (c.defausseSoi && obj(P, o.id)) { lki = instantane(P, o); defausseCarte(P, o.id, j); }
  if (c.sacSoi && obj(P, o.id)) { lki = instantane(P, o); sacrifie(P, o.id); }
  if (c.exileSoi && obj(P, o.id)) { lki = instantane(P, o); deplace(P, o.id, 'exil'); }
  /* Renvoyer la carte elle-même en main (« Return CARDNAME to its owner's hand »). */
  if (c.renvoieSoi && obj(P, o.id)) { lki = instantane(P, o); deplace(P, o.id, 'main'); }
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
  const cid = o0.cid;
  const v = varianteDe(P, j, o0, a.depuis, a.variante);
  if (!v) return false;
  /* La face jouée : l'arrière d'une carte modale, l'aventure, la face
     cachée — l'objet sur la pile la porte (js/jeuFaces.js). */
  const d = v.def || o0.def;
  let cout0 = v.mana;
  const presageTour = o0.presageTour;
  if (a.variante === 'permis') permisUtilise(P, j, o0);
  const nid = deplace(P, a.id, 'pile');
  const s = obj(P, nid);
  /* Lancée par un effet qui l'exile au lieu du cimetière (js/forgeEffetsE.js). */
  if (o0.exilApres) s.exilApres = true;
  s.ctrl = j;
  if (d !== s.def) s.def = d;
  /* La variante se lit dès le choix des cibles (« if this spell was bargained »). */
  s.varianteLance = a.variante || null;
  s.kicked = a.variante === 'kicker';
  /* Quand elle a été lancée : « if you cast it during your main phase » (Return to Dust). */
  s.lanceeEn = {etape: P.etape, actif: P.actif};
  const annule = () => {
    const r = deplace(P, nid, a.depuis === 'commandement' ? 'commandement' : a.depuis);
    if (r != null && presageTour != null) obj(P, r).presageTour = presageTour;
    return false;
  };
  let effets = [];
  if (d.sort) effets = yield* prepareEffets(P, j, s, d.sort, d.couleurs);
  /* Splice : des cartes de la main greffent leurs effets (js/forgeMotsClesE.js). */
  if (d.sort && effets) cout0 = yield* epissures(P, j, s, d, cout0, effets);
  else if (d.aura) {
    const c = yield* choisitCibles(P, j, s, [{desc: d.aura, min: 1, max: 1}], d.couleurs, {aura: true});
    effets = c ? [{ops: [], slots: [{desc: d.aura, min: 1, max: 1}], cibles: c, aura: true}] : null;
  }
  if (!effets) return annule();
  let x = 0;
  /* X se choisit une fois, pour le mana comme pour le reste du coût
     (« pay X life », « sacrifice X Spirits »). */
  const autreX = aCoutX(v.autre);
  if (d.cout.x || autreX) {
    let max = d.cout.x ? maxX(P, j, cout0) : 30;
    if (autreX) max = Math.min(max, maxXAutre(P, j, s, v.autre));
    if (!d.cout.x) x = yield* choisitXAutre(P, j, s, v.autre, max, nid);
    else {
      const opts = Array.from({length: max + 1}, (_, i) => i);
      x = opts[(yield question(P, j, 'x', opts, {defaut: max, source: nid}))] || 0;
    }
  }
  const autre = coutResolu(v.autre, x, s);
  const garde = coutDeGarde(P, j, effets) - reductionParCibles(P, j, s, effets);
  const gen = Math.max(0, cout0.generique + garde);
  let cout = garde ? {...cout0, generique: gen, total: cout0.total + gen - cout0.generique} : cout0;
  /* Strive : plus cher pour chaque cible de plus (js/forgeMotsClesD.js). */
  if (d.strive) cout = coutStrive(P, j, s, d, effets, cout, x);
  /* Spree, Tiered, Escalate : le coût des modes choisis (js/forgeModes.js). */
  if (d.coutModes || d.escalade) cout = coutDesModes(P, j, s, d, effets, cout, x);
  if (!payableAvec(P, j, s, cout, x)) return annule();
  if (autre && !coutAutrePossible(P, j, s, autre)) return annule();
  /* La garde payée autrement qu'en mana (js/jeuCoutsX.js). */
  const ga = gardeAutre(P, j, effets);
  if (ga && !coutAutrePossible(P, j, s, ga)) return annule();
  cout = yield* paieReductions(P, j, s, cout, x);
  if (!cout) return annule();
  /* Le mana d'abord (règle 601.2g-h : on engage pour du mana avant de payer
     le reste) : un terrain engagé peut ensuite être sacrifié, et un échec
     de paiement ne laisse rien de payé à moitié. */
  s.depuisCommandement = a.depuis === 'commandement';
  if (!paieMana(P, j, cout, x, {sort: s})) return annule();
  if (autre) yield* paieAutre(P, j, s, autre);
  if (ga) yield* paieAutre(P, j, s, ga);
  s.x = x;
  s.lance = {par: j, depuis: a.depuis, tour: P.tour, mana: s.manaSort};
  const item = {id: nid, sort: true, ctrl: j, def: d, effets, x, depuis: a.depuis,
    kicked: a.variante === 'kicker', rachat: a.variante === 'rachat', evoque: a.variante === 'evocation', suspendu: a.variante === 'suspension',
    variante: a.variante || null};
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
  emet(P, {t: 'lance', joueur: j, def: d, id: nid, depuis: a.depuis});
  emetCibles(P, j, s, effets);
  declencheursDeLancement(P, item);
  declencheursDeVariante(P, item);
  return true;
}

/* Activer une capacité, ou une capacité de loyauté. */
function* activeCapacite(P, j, a) {
  const o = obj(P, a.id);
  if (!o) return false;
  const k = capaciteReduite(P, j, o, capacitesDe(P, o)[a.i]);
  const effets = yield* prepareEffets(P, j, o, k.effet, o.def.couleurs);
  if (!effets) return false;
  let x = 0, lki = null, retires = 0;
  if (k.genre === 'loyaute') {
    let delta = k.delta;
    if (delta === 'X') {
      const opts = Array.from({length: (o.marq.loyaute || 0) + 1}, (_, i) => i);
      x = opts[(yield question(P, j, 'x', opts, {defaut: opts.length - 1, source: o.id}))] || 0;
      delta = -x;
    }
    o.marq.loyaute = (o.marq.loyaute || 0) + delta;
    noteLoyaute(P, o);
    P.ver++;
  } else {
    if (k.cout.mana.x) x = maxX(P, j, k.cout.mana);
    /* X dans le reste du coût : choisi, sans dépasser ce qu'on peut payer
       (js/jeuCoutsX.js) ; « remove all counters » se compte ici. */
    if (aCoutX(k.cout) && CHAMPS_X.some(([a, b]) => valeurX(k.cout, a, b) === 'X')) {
      const max = Math.min(k.cout.mana.x ? x : 30, maxXAutre(P, j, o, k.cout));
      x = yield* choisitXAutre(P, j, o, k.cout, max, o.id);
    }
    const cout = coutResolu(k.cout, x, o);
    retires = cout.retire ? cout.retire.n : 0;
    if (!coutAutrePossible(P, j, o, cout) || !planPaiement(P, j, cout.mana, x, {capacite: o})) return false;
    P.engagesCout = null;
    lki = yield* paieAutre(P, j, o, cout);
    if (!paieMana(P, j, k.cout.mana, x, {capacite: o})) return false;
    if (k.unefois) P.unefois.add(a.id + '|a' + a.i);
    noteLimitePartie(P, o, k);
    /* Un cycle s'entend : « when you cycle ~ » écoute à travers
       l'instantané de la carte, partie au cimetière. */
    if (k.cycle) { if (lki) P.partis.push(lki); emet(P, {t: 'cycle', joueur: j, lki}); }
  }
  P.pile.push({id: P.prochainId++, capacite: true, source: o.id, lki, ctrl: j, effets, x, nom: o.def.nom, texte: k.texte || '', retires, engages: P.engagesCout || null});
  jn(P, `${P.joueurs[j].nom} active ${o.def.nom}`);
  emet(P, {t: 'active', id: o.id, joueur: j, loyaute: k.genre === 'loyaute', lki});
  emetCibles(P, j, o, effets);
  return true;
}

/* Équiper : une capacité à vitesse de rituel qui attache l'équipement. */
function* equipe(P, j, a) {
  const o = obj(P, a.id);
  const slot = {desc: {genre: 'objet', types: ['creature'], non: [], sousTypes: [], couleurs: [], filtres: [], zone: 'champ', mots: 0, ctrl: 'vous', autre: true}, min: 1, max: 1};
  const c = yield* choisitCibles(P, j, o, [slot], o.def.couleurs, {equipe: true});
  if (!c || !c[0].length || (o.def.equipeAutre && !coutAutrePossible(P, j, o, o.def.equipeAutre)) || !paieMana(P, j, coutEquipement(P, j, o), 0, {capacite: o})) return false;
  if (o.def.equipeAutre) yield* paieAutre(P, j, o, o.def.equipeAutre);
  emet(P, {t: 'active', id: o.id, joueur: j, equip: true, loyaute: false, lki: instantane(P, o)});
  P.pile.push({id: P.prochainId++, capacite: true, source: o.id, ctrl: j, x: 0, nom: o.def.nom, texte: 'Équiper : attache cet équipement à la créature visée.',
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
  if (a.depuis) permisUtilise(P, j, obj(P, a.id));
  jn(P, `${P.joueurs[j].nom} joue ${nomObj(P, a.id)}`);
  const n = yield* metEnJeu(P, a.id, j, a.variante === 'dos' ? {face: obj(P, a.id).def.dos, terrainJoue: true} : {terrainJoue: true});
  emet(P, {t: 'terrainJoue', id: n, joueur: j, depuis: a.depuis || 'main'});
  return true;
}

/* Exécuter une action choisie. */
function* executeAction(P, j, a) {
  if (a.k === 'terrain') return yield* joueTerrain(P, j, a);
  if (a.k === 'lancer' && a.variante === 'prepare') return yield* lancePrepare(P, j, a);
  if (a.k === 'lancer') return yield* lanceSort(P, j, a);
  if (a.k === 'activer') return yield* activeCapacite(P, j, a);
  if (a.k === 'equiper') return yield* equipe(P, j, a);
  if (a.k === 'presager') return yield* presage(P, j, a);
  if (a.k === 'comploter') return yield* complote(P, j, a);
  if (a.k === 'suspendre') return yield* suspend(P, j, a);
  if (a.k === 'retourner') return yield* retourne(P, j, a);
  if (a.k === 'mana') return activeManaManuel(P, j, a);
  if (a.k === 'manaFiltre') return yield* activeManaFiltre(P, j, a);
  if (a.k === 'manaAutre') return yield* activeManaAutre(P, j, a);
  if (a.k === 'reglage') return basculeReglage(P, j, a);
  return false;
}
