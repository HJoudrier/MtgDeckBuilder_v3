/* =====================================================================
   js/iaPriorite.js — Ce que le joueur automatique fait de sa priorité

   En phase principale, pile vide : un terrain d'abord, celui qui ouvre les
   couleurs qui manquent ; puis le sort ou la capacité qui a le plus
   d'effet, tant qu'il y en a un qui vaut la peine. Hors de sa phase
   principale : contrer un sort adverse qui compte, tuer un attaquant, sauver
   un combat, et jouer ses éphémères à la fin du tour de l'adversaire qui le
   précède plutôt que de laisser son mana se perdre.
   ===================================================================== */

/* Le meilleur candidat hostile d'un emplacement, et sa valeur. */
function meilleureCibleHostile(P, j, slot, src, n) {
  let best = 0;
  for (const c of ciblesLegales(P, slot, src, j, src && src.def ? src.def.couleurs : [])) {
    if (estAMoi(P, c, j)) continue;
    if (typeof c === 'object' && c.j != null) {
      const J = P.joueurs[c.j];
      best = Math.max(best, n != null && n >= J.vie ? 60 : (n || 0) * 0.4);
      continue;
    }
    const o = obj(P, c);
    if (!o) continue;
    if (n != null && estCreature(o) && o.zone === 'champ' && car(P, o).endurance - o.bless > n) continue;
    best = Math.max(best, o.zone === 'pile' ? valeurDef(o.def) + o.def.mv : valeurObjet(P, o));
  }
  return best;
}

/* Ce qu'un effet rapporte, à grands traits. */
function scoreEffet(P, j, effet, src) {
  if (!effet) return 0;
  if (effet.modes) return 3;
  let s = 0;
  for (const op of effet.ops) {
    const slot = op.a && op.a.cible != null ? effet.cibles[op.a.cible] : null;
    const n = typeof op.n === 'number' ? op.n : op.n === 'X' ? manaDispo(P, j) - 1 : 2;
    if (opHostile(op) && slot) { s += meilleureCibleHostile(P, j, slot, src, op.op === 'degats' ? n : null); continue; }
    if (op.a && op.a.chaque && (op.op === 'detruit' || op.op === 'exile' || op.op === 'degats')) {
      const vis = P.champ.map(id => obj(P, id)).filter(o => correspond(P, o, op.a.chaque, src, j));
      s += vis.reduce((t, o) => t + (o.ctrl === j ? -1.3 : 1) * valeurObjet(P, o), 0) - 2;
      continue;
    }
    switch (op.op) {
      case 'pioche': s += (op.qui && op.qui.vous ? 2 : 0.5) * n; break;
      case 'gagneVie': s += 0.3 * n; break;
      case 'perdVie': s += op.qui && op.qui.chaque ? 0.7 * n : 0.3 * n; break;
      case 'jetons': s += n * valeurDef(op._def || (op._def = definitionJeton(op.jeton))); break;
      case 'marqueurs': s += n * (op.genre === '+1/+1' ? 1 : 0.5); break;
      case 'cherche': s += 3; break;
      case 'place': s += op.vers === 'champ' ? 4 : 1.5; break;
      case 'sacrifie': s += op.qui && op.qui.vous ? -2 : 3; break;
      case 'defausse': s += op.qui && op.qui.vous ? -1 : 1.5; break;
      case 'pompe': s += P.combat ? 2 : 0; break;
      case 'contre': break;
      case 'mana': s += 0.5; break;
      case 'exhume': s += 3; break;
      case 'regenere': s += regenUtile(P, j, src) ? 4 : -1; break;
      default: s += 0.5;
    }
  }
  return s;
}

/* L'effet d'un sort qu'on lancerait maintenant. */
function impactSort(P, j, o) {
  const d = o.def;
  if (d.couverture.etat === 'injouable') return -1;
  if (d.sort) return scoreEffet(P, j, d.sort, o) + d.mv * 0.2;
  let v = valeurDef(d);
  if (d.aura) {
    const hostile = !!d.auraHostile || d.statiques.some(s => s.s === 'interdit');
    v = hostile ? meilleureCibleHostile(P, j, {desc: d.aura, min: 1, max: 1}, o, null)
      : champDe(P, j).some(estCreature) ? 2.5 : -1;
  }
  if (d.equipe) v = champDe(P, j).some(estCreature) ? 2.5 : 0.5;
  const rampe = d.capacites.some(k => k.genre === 'mana') ||
    d.capacites.some(k => k.effet && k.effet.ops.some(op => op.op === 'cherche' && op.desc.types.includes('land')));
  if (rampe && P.joueurs[j].tours <= 6) v += 3;
  return v + d.mv * 0.3;
}

/* L'effet d'une capacité qu'on activerait maintenant. */
function impactCapacite(P, j, o, k, ag) {
  const cle = P.tour + '|' + o.id + '|' + capacitesDe(P, o).indexOf(k);
  if ((ag.activations.get(cle) || 0) >= 3) return -1;
  let s = scoreEffet(P, j, k.effet, o);
  if (k.genre === 'loyaute') return typeof k.delta === 'number' ? s + k.delta * 0.6 + 1 : s;
  /* Cycler, c'est renoncer à la carte : ce qu'elle vaudrait en main se paie. */
  if (k.cycle) s -= 0.4 * utiliteEnMain(P, j, o.id);
  const c = k.cout;
  if (c.sacSoi) s -= valeurObjet(P, o) * 0.8 + 0.5;
  if (c.sac) s -= 2.5;
  if (c.vie) s -= P.joueurs[j].vie < 10 ? 5 : c.vie * 0.3;
  if (c.engage && estCreature(o)) s -= 1;
  return s - (c.mana ? c.mana.total * 0.15 : 0);
}

/* Le meilleur terrain à jouer : celui qui ouvre les couleurs que réclame la
   main, et qui entre dégagé. */
function scoreTerrain(P, j, o) {
  const besoin = new Set();
  P.joueurs[j].main.forEach(id => obj(P, id).def.couleurs.forEach(k => besoin.add(k)));
  const deja = new Set();
  sourcesMana(P, j).forEach(s => s.couleurs.forEach(k => deja.add(k)));
  const prod = o.def.capacites.filter(k => k.genre === 'mana').reduce((t, k) => t.concat(k.options.join('').split('')), []);
  let v = 1 + prod.filter(k => besoin.has(k) && !deja.has(k)).length * 2 + new Set(prod).size * 0.3;
  if (o.def.entree && o.def.entree.engagee && !o.def.entree.payeVie) v -= 0.8;
  return v;
}

/* Hors phase principale : faut-il agir maintenant ? */
function iaReponse(P, j, actions, ag) {
  const sommet = P.pile[P.pile.length - 1];
  const finAvantMoi = P.etape === 'fin' && P.actif !== j && suivantVivant(P, P.actif) === j;
  let best = -1, score = 0;
  actions.forEach((a, i) => {
    if (a.k === 'passer') return;
    const o = obj(P, a.id);
    let s = 0;
    if (a.k === 'lancer') {
      const d = o.def;
      if (d.couverture.etat === 'injouable') return;
      const contre = d.sort && d.sort.ops.some(op => op.op === 'contre');
      if (contre) {
        if (sommet && sommet.sort && sommet.ctrl !== j) s = valeurDef(sommet.def) + sommet.def.mv - 2;
      } else if (d.sort && d.sort.ops.some(op => op.op === 'pompe')) {
        if (P.combat && P.etape === 'bloqueurs' && champDe(P, j).some(c => P.combat.bloqueurs.has(c.id) || P.combat.bloque.has(c.id))) s = 3;
      } else if (P.combat && P.etape === 'attaquants' && P.actif !== j && d.sort && d.sort.ops.some(opHostile)) {
        s = scoreEffet(P, j, d.sort, o);
      } else if (finAvantMoi || (P.actif === j && P.etape === 'fin')) s = impactSort(P, j, o);
    } else if (a.k === 'activer') {
      const k = capacitesDe(P, o)[a.i];
      const regen = k && k.effet && k.effet.ops.some(op => op.op === 'regenere');
      if (regen || finAvantMoi || (P.actif === j && P.etape === 'fin')) s = impactCapacite(P, j, o, k, ag);
    }
    if (s > score + 0.01 && s >= 2) { best = i; score = s; }
  });
  return best;
}

/* La réponse à une question de priorité. */
function iaPriorite(P, q, ag) {
  const j = q.joueur, actions = q.options, passe = actions.length - 1;
  if (!enPhasePrincipale(P, j)) {
    const i = iaReponse(P, j, actions, ag);
    return i >= 0 ? noteActivation(P, actions[i], ag, i) : passe;
  }
  let best = -1, score = 0;
  actions.forEach((a, i) => {
    if (a.k === 'terrain') {
      const s = 100 + scoreTerrain(P, j, obj(P, a.id));
      if (s > score) { best = i; score = s; }
      return;
    }
    let s = -1;
    if (a.k === 'lancer') s = scoreLancer(P, j, a);
    else if (a.k === 'presager') s = 1.1;
    else if (a.k === 'suspendre') s = impactSort(P, j, obj(P, a.id)) * 0.5;
    else if (a.k === 'activer') s = impactCapacite(P, j, obj(P, a.id), capacitesDe(P, obj(P, a.id))[a.i], ag);
    else if (a.k === 'equiper') s = obj(P, a.id).att == null ? 2.5 : -1;
    if (s > score && s >= 1) { best = i; score = s; }
  });
  return best >= 0 ? noteActivation(P, actions[best], ag, best) : passe;
}

/* Une régénération sert-elle maintenant : la créature est au combat, ou
   un sort adverse au sommet de la pile pourrait la détruire ? */
function regenUtile(P, j, o) {
  if (!o || o.zone !== 'champ' || o.regen > 0) return false;
  if (P.combat && (P.combat.attaquants.has(o.id) || P.combat.bloqueurs.has(o.id)) && (P.etape === 'bloqueurs' || P.etape === 'attaquants')) return true;
  const s = P.pile[P.pile.length - 1];
  return !!s && s.ctrl !== j && s.effets.some(ef => ef.ops.some(op => opHostile(op)) && [].concat(...ef.cibles).includes(o.id));
}

/* Ce que vaut une façon de lancer : le kicker seulement s'il change
   l'effet, le rachat parce qu'il rend la carte, l'évocation faute de mieux. */
function scoreLancer(P, j, a) {
  const o = obj(P, a.id);
  let s = impactSort(P, j, o);
  if (a.variante === 'kicker') s += o.def.kickerUtile ? 1.5 : -5;
  else if (a.variante === 'rachat') s += 2;
  else if (a.variante === 'evocation') s *= 0.6;
  return s;
}

/* Compter les activations d'une capacité dans le tour, pour qu'une capacité
   gratuite ne soit pas activée sans fin. */
function noteActivation(P, a, ag, i) {
  if (a.k === 'activer') {
    const cle = P.tour + '|' + a.id + '|' + a.i;
    ag.activations.set(cle, (ag.activations.get(cle) || 0) + 1);
  }
  return i;
}
