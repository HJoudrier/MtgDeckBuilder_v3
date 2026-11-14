/* =====================================================================
   js/jeuLancer.js — Ce qu'un joueur peut faire de sa priorité, et le faire

   Jouer un terrain, lancer un sort, activer une capacité, équiper. La liste
   des actions légales est ce qu'on propose au joueur à chaque priorité ;
   le lancement suit l'ordre de la règle 601.2 — pile, modes, X, cibles,
   coût total, paiement — et un sort qui ne peut pas aller au bout revient
   d'où il vient.
   ===================================================================== */

const PASSE = {k: 'passer'};

function enPhasePrincipale(P, j) {
  return P.actif === j && (P.etape === 'principale1' || P.etape === 'principale2') && !P.pile.length;
}

function estEphemere(def) {
  if (def._eph === undefined) def._eph = def.types.includes('instant') || !!(def.mots & MOT.FLASH);
  return def._eph;
}

/* Le coût total d'un sort : imprimé (ou flashback, ou présage, ou le coût
   `imprime` d'une variante), plus les taxes de tout le monde (Thalia), moins
   les réductions de son lanceur et l'affinité, plus la taxe de commandant. */
function coutSort(P, j, o, depuis, imprime) {
  let cout = imprime || (depuis === 'cimetiere' && o.def.flashback ? o.def.flashback
    : depuis === 'exil' && o.def.presage ? o.def.presage : o.def.cout);
  /* Un coût additionnel en mana qu'une statique impose (js/forgeStatiquesB.js). */
  if (o.def.hausseMana) cout = sommeMana(cout, o.def.hausseMana);
  let plus = 0, moins = 0;
  if (o.def.params.affinite) moins += champDe(P, j).filter(x => correspond(P, x, {forge: o.def.params.affinite}, o, j)).length;
  for (const {src, s} of statiquesEnJeu(P)) {
    if (s.s === 'taxe' && defCorrespond(o.def, s.desc)) plus += s.n;
    if (s.s === 'reduction' && src.ctrl === j && defCorrespond(o.def, s.desc)) moins += s.n;
  }
  if (typeof coutsForge === 'function') { const [p, m] = coutsForge(P, j, o); plus += p; moins += m; }
  if (depuis === 'commandement') plus += 2 * (P.joueurs[j].taxe[o.cid] || 0);
  if (!plus && !moins) return cout;
  const generique = Math.max(0, cout.generique + plus - moins);
  return {...cout, generique, total: cout.total - cout.generique + generique};
}

/* Les emplacements de cible d'un effet ont-ils assez de candidats ? */
function effetCiblable(P, j, src, effet, couleurs) {
  if (!effet) return true;
  if (effet.modes) return effet.modes.options.filter(op => op.cibles.every(sl => ciblesLegales(P, sl, src, j, couleurs).length >= sl.min)).length >= effet.modes.min;
  return effet.cibles.every(sl => ciblesLegales(P, sl, src, j, couleurs).length >= sl.min);
}

/* Le coût d'activation, hors mana, peut-il être payé ? */
function coutAutrePossible(P, j, o, c) {
  /* X le plus petit, « tous » ce que porte la carte (js/jeuCoutsX.js). */
  if (aCoutX(c)) c = coutResolu(c, 0, o);
  if (c.engage && !peutEngagerSoi(P, o)) return false;
  if (c.degage && !o.engage) return false;
  if (c.vie && P.joueurs[j].vie < c.vie) return false;
  if (c.sac && champDe(P, j).filter(x => correspond(P, x, c.sac.desc, o, j)).length < c.sac.n) return false;
  if (c.defausse && P.joueurs[j].main.filter(id => id !== o.id && (!c.defausse.desc || correspond(P, obj(P, id), c.defausse.desc, o, j))).length < c.defausse.n) return false;
  if (c.retire && (o.marq[c.retire.genre] || 0) < c.retire.n) return false;
  if (c.engageAutres && champDe(P, j).filter(x => !x.engage && x.id !== o.id && correspond(P, x, c.engageAutres.desc, o, j)).length < c.engageAutres.n) return false;
  if ((c.sacSoi && o.zone !== 'champ') || (c.defausseSoi && o.zone !== 'main')) return false;
  const J = P.joueurs[j], compte = (ids, d) => ids.filter(id => id !== o.id && correspond(P, obj(P, id), d, o, j)).length;
  if (c.exileCimetiere && compte(J.cimetiere, c.exileCimetiere.desc) < c.exileCimetiere.n) return false;
  if (c.renvoie && champDe(P, j).filter(x => correspond(P, x, c.renvoie.desc, o, j)).length < c.renvoie.n) return false;
  if (c.revele && compte(J.main, c.revele.desc) < c.revele.n) return false;
  if (c.energie && (J.energie || 0) < c.energie) return false;
  if (c.equipage && !equipagePossible(P, j, o, c.equipage)) return false;
  return !coutSpecial(c) || coutAutrePossibleB(P, j, o, c);
}

/* Les actions légales d'un joueur qui a la priorité. `PASSE` est toujours la
   dernière. */
function actionsLegales(P, j) {
  if (secondeFendue(P)) return [PASSE];
  const J = P.joueurs[j], r = [];
  const rituel = enPhasePrincipale(P, j);
  const terrains = rituel && J.terrainsJoues < terrainsParTour(P, j);
  if (terrains) J.main.forEach(id => {
    const d = obj(P, id).def;
    if (estType(obj(P, id), 'land')) r.push({k: 'terrain', id});
    if (d.dos && d.modeFaces === 'Modal' && d.dos.types.includes('land')) r.push({k: 'terrain', id, variante: 'dos'});
  });
  champDe(P, j).forEach(o => { if (retournable(P, j, o)) r.push({k: 'retourner', id: o.id}); });
  /* Chaque façon de lancer se juge sur la face qu'elle joue : la face
     arrière d'une carte modale peut être un éphémère, l'avant un terrain. */
  const essaie = (id, depuis, seulement) => {
    const o = obj(P, id);
    variantesSort(P, j, o, depuis).forEach(v => {
      if (seulement && v.variante !== seulement) return;
      const d = v.def || o.def;
      if (d.types.includes('land') || (!rituel && !estEphemere(d) && !flashAccorde(P, j, o, d))) return;
      if (sortInterdit(P, j, o, depuis, d)) return;
      if (d.sort && !effetCiblable(P, j, o, d.sort, d.couleurs)) return;
      if (d.aura && !ciblesLegales(P, {desc: d.aura, min: 1, max: 1}, o, j, d.couleurs).length) return;
      r.push(v.variante ? {k: 'lancer', id, depuis, variante: v.variante} : {k: 'lancer', id, depuis});
    });
  };
  J.main.forEach(id => essaie(id, 'main'));
  J.commandement.forEach(id => essaie(id, 'commandement'));
  J.cimetiere.forEach(id => { if (lancableDuCimetiere(obj(P, id).def, obj(P, id), P)) essaie(id, 'cimetiere'); });
  /* Ce qu'une permission laisse jouer d'ailleurs (js/jeuPermis.js). */
  cartesPermises(P, j).forEach(({o, depuis}) => {
    if (estType(o, 'land')) { if (terrains) r.push({k: 'terrain', id: o.id, depuis}); }
    else essaie(o.id, depuis, 'permis');
  });
  J.exil.forEach(id => { const o = obj(P, id); if ((o.presageTour != null && o.presageTour < P.tour) || o.aventure || exilLancable(P, o, rituel)) essaie(id, 'exil'); });
  r.push(...actionsComplot(P, j, rituel), ...actionsPrepare(P, j, rituel));
  if (P.actif === j) J.main.forEach(id => { if (obj(P, id).def.presage && planPaiement(P, j, MANA_DEUX, 0)) r.push({k: 'presager', id}); });
  J.main.forEach(id => { if (suspendable(P, j, obj(P, id), rituel)) r.push({k: 'suspendre', id}); });
  /* Les capacités qui s'activent depuis la main (cycle) ou le cimetière. */
  [['main', J.main], ['cimetiere', J.cimetiere]].forEach(([zone, ids]) => ids.forEach(id => {
    const o = obj(P, id);
    o.def.capacites.forEach((k, i) => {
      if (k.zone !== zone || k.genre !== 'activee') return;
      if ((k.vitesse === 'rituel' && !rituel) || (k.unefois && P.unefois.has(id + '|a' + i)) || (k.phases && !dansPhases(P, k.phases))) return;
      if (!coutAutrePossible(P, j, o, k.cout) || !planPaiement(P, j, k.cout.mana, 0, {capacite: o}) || !effetCiblable(P, j, o, k.effet, o.def.couleurs)) return;
      if (activationInterdite(P, j, o, k)) return;
      r.push({k: 'activer', id, i});
    });
  }));
  for (const id of P.champ) {
    const o = obj(P, id);
    if (o.ctrl !== j) continue;
    capacitesDe(P, o).forEach((k, i) => {
      if (k.zone || ((k.genre === 'activee' || k.genre === 'loyaute') && activationInterdite(P, j, o, k))) return;
      if (k.phases && !dansPhases(P, k.phases)) return;
      if (k.genre === 'activee') {
        if ((k.vitesse === 'rituel' && !rituel) || (k.unefois && P.unefois.has(id + '|a' + i))) return;
        if (!coutAutrePossible(P, j, o, k.cout) || !planPaiement(P, j, k.cout.mana, 0, {capacite: o})) return;
        if (!effetCiblable(P, j, o, k.effet, o.def.couleurs)) return;
        r.push({k: 'activer', id, i});
      } else if (k.genre === 'loyaute') {
        if (!rituel || P.unefois.has(id + '|loyaute')) return;
        if (typeof k.delta === 'number' && k.delta < 0 && (o.marq.loyaute || 0) < -k.delta) return;
        if (!effetCiblable(P, j, o, k.effet, o.def.couleurs)) return;
        r.push({k: 'activer', id, i});
      }
    });
    if (o.def.equipe && rituel && planPaiement(P, j, coutEquipement(P, j, o), 0, {capacite: o}) &&
        champDe(P, j).some(c => estCreature(c) && c.id !== o.att)) r.push({k: 'equiper', id});
  }
  r.push(PASSE);
  return r;
}

/* La passe rapide : hors de sa phase principale, un joueur qui n'a ni
   éphémère, ni flash, ni capacité activable n'a rien à décider, et on ne
   calcule même pas ses actions. C'est là, et non dans les générateurs, que
   se joue la vitesse d'un lot. */
function actionsPossibles(P, j) {
  if (enPhasePrincipale(P, j)) return actionsLegales(P, j);
  const J = P.joueurs[j];
  const horsChamp = (ids, zone) => ids.some(id => obj(P, id).def.capacites.some(k => k.zone === zone && k.vitesse !== 'rituel'));
  const peut = J.main.some(id => estEphemere(obj(P, id).def)) ||
    J.commandement.some(id => estEphemere(obj(P, id).def)) || horsChamp(J.main, 'main') || horsChamp(J.cimetiere, 'cimetiere') ||
    J.cimetiere.some(id => { const d = obj(P, id).def; return lancableDuCimetiere(d, obj(P, id), P) && estEphemere(d); }) ||
    J.exil.some(id => { const o = obj(P, id); return ((o.presageTour != null && o.presageTour < P.tour) || o.aventure || exilLancable(P, o, false)) && estEphemere(o.def); }) ||
    cartesPermises(P, j).some(x => estEphemere(x.o.def)) || flashPossible(P, j) || actionsPrepare(P, j, false).length ||
    champDe(P, j).some(o => retournable(P, j, o)) ||
    P.champ.some(id => { const o = obj(P, id); return o.ctrl === j && capacitesDe(P, o).some(k => k.genre === 'activee' && !k.zone && k.vitesse !== 'rituel'); });
  return peut ? actionsLegales(P, j) : [PASSE];
}

/* Choisir les cibles d'un effet ; rend `null` si un emplacement obligatoire
   n'a pas assez de candidats. */
function* choisitCibles(P, j, src, slots, couleurs, extra) {
  const choix = [];
  for (let si = 0; si < slots.length; si++) {
    const sl = slots[si];
    /* Un contrôleur imposé par le déclencheur (js/forgeEntrees.js). */
    const cands = candidatsDuControleur(P, sl, ciblesLegales(P, sl, src, j, couleurs), src, j, extra, choix);
    if (cands.length < sl.min) return null;
    if (!cands.length) { choix.push([]); continue; }
    const plafond = sl.maxExpr ? Math.max(sl.min, forgeNombre(P, sl.maxExpr, {ctx: {cibles: [], memo: [], memoJ: []}, src, ctrl: j, op: {}})) : sl.max;
    const max = Math.min(plafond, cands.length);
    const r = yield question(P, j, 'cibles', cands, {min: sl.min, max, multi: true, source: src && src.id, extra: {slot: sl, indice: si, ...extra}});
    const pris = restreintCibles(P, sl, (Array.isArray(r) ? r : [r]).map(i => cands[i]).filter(x => x != null));
    choix.push(sl.cmcMax != null ? restreintValeurTotale(P, sl.cmcMax, pris) : pris);
  }
  return choix;
}

/* Les effets d'un sort ou d'une capacité, modes choisis et cibles prises. */
function* prepareEffets(P, j, src, effet, couleurs, extra) {
  if (!effet) return [];
  let options = [{ops: effet.ops, cibles: effet.cibles}];
  if (effet.modes) {
    /* « Choose one that hasn't been chosen this game / this turn » : les
       modes déjà pris par cette carte (`P.cartes[cid].modesPris`). */
    const k = m0 => src && P.cartes[src.cid] && (P.cartes[src.cid].modesPris || {})[m0.texte];
    const pris = op => effet.modes.restr && k(op) != null && (effet.modes.restr === 'ThisGame' || k(op) === P.tour);
    const m = effet.modes, ok = m.options.filter(op => !pris(op) && op.cibles.every(sl => ciblesLegales(P, sl, src, j, couleurs).length >= sl.min));
    if (ok.length < m.min) return null;
    const plafond = m.maxForge ? Math.max(m.min, forgeNombre(P, m.maxForge.v, {face: m.maxForge.face, ctx: {cibles: [], memo: [], memoJ: []}, src, ctrl: j, op: {}})) : m.max;
    const r = yield question(P, j, 'modes', ok.map(o => o.texte), {min: m.min, max: Math.min(plafond, ok.length), multi: true, source: src && src.id, extra: {options: ok}});
    options = (Array.isArray(r) ? r : [r]).map(i => ok[i]).filter(Boolean);
    if (m.restr && src && P.cartes[src.cid]) { const k2 = P.cartes[src.cid]; k2.modesPris = k2.modesPris || {}; options.forEach(o => { k2.modesPris[o.texte] = P.tour; }); }
  }
  const effets = [];
  for (const op of options) {
    const cibles = yield* choisitCibles(P, j, src, op.cibles, couleurs, {...extra, ops: op.ops});
    if (!cibles) return null;
    effets.push({ops: op.ops, slots: op.cibles, cibles});
  }
  return effets;
}

/* La garde des permanents adverses ciblés s'ajoute au coût. */
function coutDeGarde(P, j, effets) {
  let n = 0;
  effets.forEach(ef => ef.cibles.forEach(cs => cs.forEach(c => {
    const o = typeof c === 'number' ? obj(P, c) : null;
    if (o && o.zone === 'champ' && o.ctrl !== j && (car(P, o).mots & MOT.GARDE)) n += o.def.params.garde != null ? o.def.params.garde : 2;
  })));
  return n;
}

/* « Targets with the same controller », « with different names », « one
   per player » : les cibles choisies qui enfreignent la restriction sont
   écartées, dans l'ordre du choix. */
function restreintCibles(P, sl, l) {
  if (!sl.restr) return l;
  const r = [], qui = c => typeof c === 'object' ? c.j : (obj(P, c) || {}).ctrl;
  for (const c of l) {
    const o = typeof c === 'number' ? obj(P, c) : null;
    if (sl.restr.meme && r.length && qui(c) !== qui(r[0])) continue;
    if (sl.restr.noms && o && r.some(x => typeof x === 'number' && obj(P, x) && obj(P, x).def.nom === o.def.nom)) continue;
    if (sl.restr.parJoueur && r.some(x => qui(x) === qui(c))) continue;
    r.push(c);
  }
  return r;
}
