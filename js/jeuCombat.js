/* =====================================================================
   js/jeuCombat.js — Attaquants, bloqueurs, dégâts de combat

   Chacun pour soi : le joueur actif choisit, pour chaque attaquant, quel
   adversaire ou quel planeswalker il attaque ; chaque défenseur bloque à son
   tour, dans l'ordre APNAP. Les dégâts suivent les règles d'après
   Foundations (2024) : plus d'ordre d'assignation, l'attaquant répartit
   librement — ici, au plus utile : des blessures mortelles à chaque
   bloqueur, du plus fragile au plus solide, le reste au défenseur s'il
   piétine.
   ===================================================================== */

function peutAttaquer(P, o) {
  if (!estCreature(o) || o.engage || !(o.pret || aMot(P, o, MOT.CELERITE))) return false;
  const c = car(P, o);
  return !((c.mots & MOT.DEFENSEUR) && !defenseurAttaque(P, o)) && !c.nePeutAttaquer;
}

function peutBloquer(P, b, a) {
  const cb = car(P, b), ca = car(P, a);
  if (b.engage || cb.nePeutBloquer || !estCreature(b)) return false;
  if (ca.mots & MOT.IMBLOCABLE) return false;
  /* Terreur, intimidation (js/forgeTraine.js) : seuls un artefact ou une
     créature noire — ou partageant une couleur — bloquent. */
  if (a.def.params.peur && !estType(b, 'artifact') && !cb.couleurs.includes('B')) return false;
  if (a.def.params.intimidation && !estType(b, 'artifact') && !cb.couleurs.some(k => ca.couleurs.includes(k))) return false;
  const passe = a.def.params.passage;
  if (passe && champDe(P, b.ctrl).some(l => estType(l, 'land') && passe.some(f => forgeValideObjet(P, l, f, null, b.ctrl, null, true)))) return false;
  if (ca.pasPar && ca.pasPar.some(x => forgeValideObjet(P, b, x.v, x.src, x.src.ctrl, null, true))) return false;
  if ((ca.mots & MOT.VOL) && !(cb.mots & (MOT.VOL | MOT.PORTEE))) return false;
  /* Ombre, cavalerie, furtivité (js/forgeMotsClesB.js). */
  if (!!a.def.params.ombre !== !!b.def.params.ombre) return false;
  if (a.def.params.cavalerie && !b.def.params.cavalerie) return false;
  if (a.def.params.furtif && cb.force > ca.force) return false;
  if ((ca.mots & MOT.PROTECTION) && protectionsDe(a).some(k => cb.couleurs.includes(k))) return false;
  if (protegeFiltre(P, a, b)) return false;
  /* Le porteur de l'Anneau (js/forgeEffetsG.js). */
  if (a.porteAnneau && (P.joueurs[a.ctrl].anneau || 0) >= 1 && cb.force > ca.force) return false;
  return true;
}

/* Déclarer les attaquants (règle 508). Rend leur nombre. */
function* declareAttaquants(P) {
  const j = P.actif;
  const cands = champDe(P, j).filter(o => peutAttaquer(P, o)).map(o => o.id);
  P.combat = {attaquants: new Map(), bloqueurs: new Map(), bloquesPar: new Map(), frappe: new Set(), bloque: new Set()};
  if (!cands.length) return 0;
  const defenseurs = adversaires(P, j).map(i => ({j: i}));
  P.champ.forEach(id => { const o = obj(P, id); if (o.ctrl !== j && estType(o, 'planeswalker')) defenseurs.push({pw: id}); });
  const r = yield question(P, j, 'attaquants', cands, {min: 0, max: cands.length, multi: true, defaut: [], extra: {defenseurs}});
  const choisis = new Map();
  for (const paire of Array.isArray(r) ? r : []) {
    const id = cands[paire[0]], def = defenseurs[paire[1]];
    if (id != null && def && !choisis.has(id) && attaquePermise(P, obj(P, id), def)) choisis.set(id, def);
  }
  /* « Attacks each combat if able » : la créature qui le doit et le peut
     attaque le premier défenseur permis, si son contrôleur l'a oubliée. */
  cands.forEach(id => {
    if (choisis.has(id) || !doitAttaquer(P, obj(P, id))) return;
    const goad = obj(P, id).goad, libres = defenseurs.filter(d => attaquePermise(P, obj(P, id), d) && !taxeAttaque(P, obj(P, id), d));
    const def = libres.find(d => !goad || d.j !== goad.par) || libres[0];
    if (def) choisis.set(id, def);
  });
  yield* paieTaxesAttaque(P, j, choisis);
  for (const [id, def] of choisis) {
    const o = obj(P, id);
    P.combat.attaquants.set(id, def);
    P.attaquantsTour = (P.attaquantsTour || 0) + 1;
    if (!aMot(P, o, MOT.VIGILANCE)) engageObjet(P, o, false, true);
    emet(P, {t: 'attaque', id, defenseur: def});
  }
  const n = P.combat.attaquants.size;
  if (n) emet(P, {t: 'attaquants', joueur: j, ids: [...P.combat.attaquants.keys()], defs: [...P.combat.attaquants.values()]});
  if (n) jn(P, `${P.joueurs[j].nom} attaque avec ${[...P.combat.attaquants.keys()].map(id => nomObj(P, id)).join(', ')}`);
  return n;
}

/* La taxe d'attaque (Ghostly Prison) : l'attaquant la paie en une fois,
   ou les attaquants taxés restent chez eux — les plus chers d'abord, tant
   que le total dépasse ce qu'il peut payer. */
function* paieTaxesAttaque(P, j, choisis) {
  const taxes = [...choisis].map(([id, def]) => [id, taxeAttaque(P, obj(P, id), def)]).filter(x => x[1] > 0).sort((a, b) => a[1] - b[1]);
  if (!taxes.length) return;
  const cout = n => ({...coutManaVide(), generique: n, total: n});
  let total = taxes.reduce((s, x) => s + x[1], 0);
  while (taxes.length && !planPaiement(P, j, cout(total), 0)) { const [id, n] = taxes.pop(); choisis.delete(id); total -= n; }
  if (!taxes.length) return;
  const r = yield question(P, j, 'oui', ['non', 'oui'], {texte: `Payer {${total}} pour attaquer ?`, extra: {taxeAttaque: total}});
  if (r === 1 && paieMana(P, j, cout(total), 0)) return;
  taxes.forEach(([id]) => choisis.delete(id));
}

/* Le joueur que vise un attaquant, directement ou par son planeswalker. */
function defenseurDe(P, def) {
  if (def.j != null) return def.j;
  const pw = obj(P, def.pw);
  return pw ? pw.ctrl : null;
}

/* Déclarer les bloqueurs (règle 509), défenseur par défenseur. */
function* declareBloqueurs(P) {
  const cb = P.combat;
  for (const d of ordreApnap(P)) {
    if (d === P.actif) continue;
    const atts = [...cb.attaquants.keys()].filter(id => obj(P, id) && defenseurDe(P, cb.attaquants.get(id)) === d);
    if (!atts.length) continue;
    const blqs = champDe(P, d).filter(o => estCreature(o) && !o.engage && !car(P, o).nePeutBloquer).map(o => o.id);
    if (!blqs.length) continue;
    const r = yield question(P, d, 'bloqueurs', blqs, {min: 0, max: blqs.length, multi: true, defaut: [], extra: {attaquants: atts}});
    const pose = (b, a) => {
      if (b == null || a == null || cb.bloqueurs.has(b) || !peutBloquer(P, obj(P, b), obj(P, a))) return;
      if ((cb.bloquesPar.get(a) || []).length >= bornesBlocage(P, obj(P, a)).max) return;
      cb.bloqueurs.set(b, a);
      if (!cb.bloquesPar.has(a)) cb.bloquesPar.set(a, []);
      cb.bloquesPar.get(a).push(b);
    };
    for (const paire of Array.isArray(r) ? r : []) pose(blqs[paire[0]], atts[paire[1]]);
    /* « Blocks each combat if able ». */
    blqs.forEach(b => { if (!cb.bloqueurs.has(b) && doitBloquer(P, obj(P, b))) pose(b, atts.find(a => peutBloquer(P, obj(P, b), obj(P, a)))); });
  }
  /* La menace, et « can't be blocked except by three or more » : un
     attaquant bloqué par trop peu de créatures ne l'est pas. */
  for (const [a, bs] of cb.bloquesPar) {
    const min = Math.max(aMot(P, obj(P, a), MOT.MENACE) ? 2 : 1, bornesBlocage(P, obj(P, a)).min);
    if (bs.length < min) { bs.forEach(b => cb.bloqueurs.delete(b)); cb.bloquesPar.delete(a); }
  }
  for (const [a, bs] of cb.bloquesPar) {
    cb.bloque.add(a);
    emet(P, {t: 'estBloque', id: a});
    bs.forEach(b => { emet(P, {t: 'bloque', id: b}); emet(P, {t: 'bloquePar', id: a, bloqueur: b}); });
  }
  for (const a of cb.attaquants.keys()) if (!cb.bloque.has(a)) emet(P, {t: 'nonBloque', id: a});
}

/* Y a-t-il une étape de dégâts d'initiative ? */
function initiativeEnJeu(P) {
  const cb = P.combat;
  return [...cb.attaquants.keys(), ...cb.bloqueurs.keys()].some(id => obj(P, id) && aMot(P, obj(P, id), MOT.INITIATIVE | MOT.DOUBLE));
}

/* Une créature frappe-t-elle dans cette passe ? */
function frappe(P, o, passe, avecInitiative) {
  const m = car(P, o).mots;
  if (passe === 1) return (m & (MOT.INITIATIVE | MOT.DOUBLE)) !== 0;
  if (!avecInitiative) return true;
  return (m & MOT.DOUBLE) !== 0 || !P.combat.frappe.has(o.id);
}

/* Répartir les dégâts d'un attaquant bloqué. */
function repartition(P, a, bs, force) {
  const r = [];
  const mortel = (b) => aMot(P, a, MOT.CONTACT) ? 1 : Math.max(0, car(P, b).endurance - b.bless);
  const tries = bs.slice().sort((x, y) => mortel(x) - mortel(y));
  let reste = force;
  for (const b of tries) {
    const n = Math.min(reste, mortel(b));
    if (n > 0) { r.push([b, n]); reste -= n; }
  }
  if (reste > 0) {
    if (aMot(P, a, MOT.PIETINEMENT)) r.push([null, reste]);
    else if (tries.length) { const p = r.find(x => x[0] === tries[0]); if (p) p[1] += reste; else r.push([tries[0], reste]); }
  }
  return r;
}

/* Doran : une créature peut infliger ses dégâts de combat selon son
   endurance. */
function forceDeCombat(P, o) { const c = car(P, o); return degatsParEndurance(P, o) ? c.endurance : c.force; }

/* Les dégâts de combat d'une passe (règle 510) : tout est assigné, puis
   infligé d'un coup. */
function* degatsCombat(P, passe) {
  const cb = P.combat, avecInit = passe === 2 && cb.passeInitiative;
  if (passe === 1) cb.passeInitiative = true;
  const coups = [];
  for (const [aid, def] of cb.attaquants) {
    const a = obj(P, aid);
    if (!a || a.zone !== 'champ' || !frappe(P, a, passe, avecInit)) continue;
    cb.frappe.add(aid);
    const force = forceDeCombat(P, a);
    if (force <= 0) continue;
    const cible = def.j != null ? (P.joueurs[def.j].elimine ? null : {j: def.j}) : obj(P, def.pw);
    if (!cb.bloque.has(aid)) { if (cible) coups.push([a, cible, force]); continue; }
    const bs = (cb.bloquesPar.get(aid) || []).map(id => obj(P, id)).filter(Boolean);
    if (!bs.length) { if (aMot(P, a, MOT.PIETINEMENT) && cible) coups.push([a, cible, force]); continue; }
    repartition(P, a, bs, force).forEach(([b, n]) => { const c = b || cible; if (c) coups.push([a, c, n]); });
  }
  for (const [bid, aid] of cb.bloqueurs) {
    const b = obj(P, bid), a = obj(P, aid);
    if (!b || !a || !frappe(P, b, passe, avecInit)) continue;
    cb.frappe.add(bid);
    const f = forceDeCombat(P, b);
    if (f > 0) coups.push([b, a, f]);
  }
  coups.forEach(([src, cible, n]) => infligeDegats(P, src, cible, n, true));
  yield* priorite(P);
}

function finCombat(P) { P.combat = null; }
