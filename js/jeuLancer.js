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

/* Le coût total d'un sort : imprimé (ou flashback), plus les taxes de
   tout le monde (Thalia), moins les réductions de son lanceur, plus la taxe
   de commandant. */
function coutSort(P, j, o, depuis) {
  let cout = depuis === 'cimetiere' && o.def.flashback ? o.def.flashback : o.def.cout;
  let plus = 0, moins = 0;
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
  if (c.engage && !peutEngagerSoi(P, o)) return false;
  if (c.degage && !o.engage) return false;
  if (c.vie && P.joueurs[j].vie < c.vie) return false;
  if (c.sac && champDe(P, j).filter(x => correspond(P, x, c.sac.desc, o, j)).length < c.sac.n) return false;
  if (c.defausse && P.joueurs[j].main.filter(id => id !== o.id).length < c.defausse.n) return false;
  if (c.retire && (o.marq[c.retire.genre] || 0) < c.retire.n) return false;
  if (c.engageAutres && champDe(P, j).filter(x => !x.engage && x.id !== o.id && correspond(P, x, c.engageAutres.desc, o, j)).length < c.engageAutres.n) return false;
  return true;
}

/* Les actions légales d'un joueur qui a la priorité. `PASSE` est toujours la
   dernière. */
function actionsLegales(P, j) {
  const J = P.joueurs[j], r = [];
  const rituel = enPhasePrincipale(P, j);
  if (rituel && J.terrainsJoues < 1) J.main.forEach(id => { if (estType(obj(P, id), 'land')) r.push({k: 'terrain', id}); });
  const essaie = (id, depuis) => {
    const o = obj(P, id), d = o.def;
    if (d.types.includes('land') || (!rituel && !estEphemere(d))) return;
    if (!planPaiement(P, j, coutSort(P, j, o, depuis), 0)) return;
    if (d.coutSup && !coutAutrePossible(P, j, o, d.coutSup)) return;
    if (d.sort && !effetCiblable(P, j, o, d.sort, d.couleurs)) return;
    if (d.aura && !ciblesLegales(P, {desc: d.aura, min: 1, max: 1}, o, j, d.couleurs).length) return;
    r.push({k: 'lancer', id, depuis});
  };
  J.main.forEach(id => essaie(id, 'main'));
  J.commandement.forEach(id => essaie(id, 'commandement'));
  J.cimetiere.forEach(id => { if (obj(P, id).def.flashback) essaie(id, 'cimetiere'); });
  for (const id of P.champ) {
    const o = obj(P, id);
    if (o.ctrl !== j) continue;
    o.def.capacites.forEach((k, i) => {
      if (k.genre === 'activee') {
        if ((k.vitesse === 'rituel' && !rituel) || (k.unefois && P.unefois.has(id + '|a' + i))) return;
        if (!coutAutrePossible(P, j, o, k.cout) || !planPaiement(P, j, k.cout.mana, 0)) return;
        if (!effetCiblable(P, j, o, k.effet, o.def.couleurs)) return;
        r.push({k: 'activer', id, i});
      } else if (k.genre === 'loyaute') {
        if (!rituel || P.unefois.has(id + '|loyaute')) return;
        if (typeof k.delta === 'number' && k.delta < 0 && (o.marq.loyaute || 0) < -k.delta) return;
        if (!effetCiblable(P, j, o, k.effet, o.def.couleurs)) return;
        r.push({k: 'activer', id, i});
      }
    });
    if (o.def.equipe && rituel && planPaiement(P, j, o.def.equipe, 0) &&
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
  const peut = J.main.some(id => estEphemere(obj(P, id).def)) ||
    J.commandement.some(id => estEphemere(obj(P, id).def)) ||
    P.champ.some(id => { const o = obj(P, id); return o.ctrl === j && o.def.capacites.some(k => k.genre === 'activee' && k.vitesse !== 'rituel'); });
  return peut ? actionsLegales(P, j) : [PASSE];
}

/* Choisir les cibles d'un effet ; rend `null` si un emplacement obligatoire
   n'a pas assez de candidats. */
function* choisitCibles(P, j, src, slots, couleurs, extra) {
  const choix = [];
  for (let si = 0; si < slots.length; si++) {
    const sl = slots[si];
    const cands = ciblesLegales(P, sl, src, j, couleurs);
    if (cands.length < sl.min) return null;
    if (!cands.length) { choix.push([]); continue; }
    const max = Math.min(sl.max, cands.length);
    const r = yield question(P, j, 'cibles', cands, {min: sl.min, max, multi: true, source: src && src.id, extra: {slot: sl, indice: si, ...extra}});
    choix.push((Array.isArray(r) ? r : [r]).map(i => cands[i]).filter(x => x != null));
  }
  return choix;
}

/* Les effets d'un sort ou d'une capacité, modes choisis et cibles prises. */
function* prepareEffets(P, j, src, effet, couleurs, extra) {
  if (!effet) return [];
  let options = [{ops: effet.ops, cibles: effet.cibles}];
  if (effet.modes) {
    const m = effet.modes, ok = m.options.filter(op => op.cibles.every(sl => ciblesLegales(P, sl, src, j, couleurs).length >= sl.min));
    if (ok.length < m.min) return null;
    const r = yield question(P, j, 'modes', ok.map(o => o.texte), {min: m.min, max: Math.min(m.max, ok.length), multi: true, source: src && src.id, extra: {options: ok}});
    options = (Array.isArray(r) ? r : [r]).map(i => ok[i]).filter(Boolean);
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
    if (o && o.zone === 'champ' && o.ctrl !== j && (car(P, o).mots & MOT.GARDE)) n += o.def.params.garde || 2;
  })));
  return n;
}
