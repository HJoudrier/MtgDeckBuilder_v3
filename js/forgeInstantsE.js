/* =====================================================================
   js/forgeInstantsE.js — Les instants : filtres, marqueurs, piles, coûts

   Lot F101 :
   - `TargetsWithEqualToughness` (V.A.T.S.) : les cibles d'une même
     endurance ;
   - `AddOrRemoveCounter` (Clockspinning) : un marqueur de plus ou de moins ;
   - `PutOnEachOther` (Contractual Safeguard) : un marqueur de la sorte
     choisie sur chacune des autres créatures ;
   - `TargetedByTarget$Valid` et la réduction « Relative » d'après la cible
     (Not of This World) ;
   - `Top_4_OfLibrary`, `.Chosen,You` : des désignations de cartes et de
     joueurs ;
   - `ChangeZoneAll | RememberLKI`, `AtEOT$ YourExileUpkeep` (Olórin's
     Searing Light, Rally the Ancestors) ;
   - `RemoveFromCombat | RememberRemovedFromCombat` ;
   - les filtres `Remembered.sameName` (Bile Blight),
     `greatestPowerControlledBy…` (Consumed by Greed, Olórin), et
     `blockedValidThisTurn` (You Cannot Pass!) ;
   - le coût `UnlessCost$ XX` (Thassa's Intervention) ;
   - le mot « cleave » : un second sort sur la même carte (Winged Portent) ;
   - une façon de lancer qui annonce X (Disrupting Shoal).
   ===================================================================== */

/* —— Des cibles d'une même endurance ———————————————————————————————— */

FORGE_COMMUNS.add('TargetsWithEqualToughness');
forgeSait('param', 'TargetsWithEqualToughness');
emplacementForge = (g => function (t, face) {
  const r = g(t, face);
  if (t.TargetsWithEqualToughness === 'True') r.restr = {...(r.restr || {}), endurance: true};
  return r;
})(emplacementForge);
restreintCibles = (g => function (P, sl, l) {
  const r = g(P, sl, l);
  if (!sl.restr || !sl.restr.endurance) return r;
  const endu = c => { const o = typeof c === 'number' ? obj(P, c) : null; return o ? car(P, o).endurance : null; };
  return r.filter(c => endu(c) === endu(r[0]));
})(restreintCibles);

/* —— Un marqueur de plus ou de moins ————————————————————————————————— */

forgeEffet('AddOrRemoveCounter', ['CounterNum', 'CounterType', 'AITgts'], function* (P, t, env) {
  for (const o of objetsForge(P, t, env, 'Targeted').filter(x => x && x.j == null)) {
    const suspendue = o.zone === 'exil' && o.suspendu;
    const genres = suspendue ? ['temps'] : Object.keys(o.marq || {}).filter(g => o.marq[g] > 0 && g !== 'loyaute' || (g === 'loyaute' && o.marq[g] > 0));
    if (!genres.length) continue;
    const g = genres[yield* choisitUn(P, env.ctrl, genres, `Quelle sorte de marqueur sur ${o.def.nom} ?`, 0, env.src && env.src.id)];
    const n = forgeNombre(P, t.CounterNum || 1, env);
    /* Son propre permanent, ou une carte suspendue qu'on joue : un de plus ; sinon, un de moins. */
    const ami = o.zone === 'exil' ? o.prop === env.ctrl : o.ctrl === env.ctrl;
    const i = yield* choisitUn(P, env.ctrl, ['Retirer', 'Ajouter'], `${o.def.nom} : un marqueur de plus ou de moins ?`, ami && g !== '-1/-1' ? 1 : 0, env.src && env.src.id);
    if (suspendue) o.temps = Math.max(0, (o.temps || 0) + (i ? n : -n));
    else if (i) poseMarqueurs(P, o, g, n, env.src);
    else { o.marq[g] = Math.max(0, o.marq[g] - n); emet(P, {t: 'marqueurRetire', id: o.id, genre: g, n}); }
    P.ver++;
  }
}, (t, op) => { op.op = 'forge'; op.hostile = false; });

/* « Choose a kind of counter on a creature you control. Put a counter of that kind on each other creature you control. » */
FORGE_API.PutCounter.gen = (g => function* (P, t, env) {
  if (!t.PutOnEachOther) return yield* g(P, t, env);
  const l = objetsZone(P, 'champ').filter(o => forgeValideObjet(P, o, t.Choices || 'Creature.YouCtrl+HasCounters', env.src, env.ctrl, env));
  if (!l.length) return;
  const [id] = yield* choisitCartes(P, env.ctrl, l.map(o => o.id), 1, 'Choisir une créature', 'cartes', 1);
  const choisie = obj(P, id != null ? id : l[0].id);
  const genres = Object.keys(choisie.marq || {}).filter(k => choisie.marq[k] > 0 && k !== 'loyaute');
  if (!genres.length) return;
  const genre = genres[yield* choisitUn(P, env.ctrl, genres, 'Quelle sorte de marqueur ?', 0, env.src && env.src.id)];
  objetsZone(P, 'champ').filter(o => o.id !== choisie.id && forgeValideObjet(P, o, t.PutOnEachOther, env.src, env.ctrl, env)).forEach(o => poseMarqueurs(P, o, genre, 1, env.src));
})(FORGE_API.PutCounter.gen);
forgeSait('param', 'PutCounter.PutOnEachOther');

/* —— Les cibles de ma cible ————————————————————————————————————————— */

exprEtendue = (g => function (P, tete, q, env) {
  let k;
  if (tete === 'TargetedByTarget' && (k = /^Valid (.+)$/.exec(q))) {
    const c = cibleForge(P, env, false);
    if (!c || c.j != null) return 0;
    return ciblesDuSort(P, c.id).filter(x => x.j == null && forgeValideObjet(P, x, k[1], env.src, env.ctrl, env)).length;
  }
  return g(P, tete, q, env);
})(exprEtendue);
forgeSait('expr', 'TargetedByTarget$Valid');

/* « This spell costs {7} less to cast if it targets… » : une réduction qui dépend de ce que la cible vise (`Relative$`). */
reductionParCibles = (g => function (P, j, o, effets) {
  let n = g(P, j, o, effets);
  for (const s of o.def.statiques || []) {
    const t = s.t;
    if (s.s !== 'forge' || !t || t.Mode !== 'ReduceCost' || t.Relative !== 'True' || t.ValidTarget || t.ValidCard !== 'Card.Self') continue;
    const env = {face: s.face, ctx: {cibles: effets.length ? effets[0].cibles : [], memo: [], memoJ: []}, src: o, ctrl: j, op: {slot: 0}, base: true};
    if (conditionForge(P, t, env)) n += forgeNombre(P, t.Amount || 1, env);
  }
  return n;
})(reductionParCibles);
forgeSait('param', 'ReduceCost.Relative');

/* —— Des désignations de plus ————————————————————————————————————————— */

definisEtendus = (g => function (P, v, env) {
  let m;
  if ((m = /^Top_(\d+)_OfLibrary$/.exec(v))) return P.joueurs[env.ctrl].bibliotheque.slice(-m[1]).reverse().map(id => obj(P, id)).filter(Boolean);
  /* `.Chosen,You` : le joueur choisi, et moi. */
  if (/^[.\w]+(,[.\w]+)+$/.test(v)) return [].concat(...v.split(',').map(x => forgeDefinis(P, x === '.Chosen' ? 'Player.Chosen' : x, env)));
  return g(P, v, env);
})(definisEtendus);
forgeSait('defini', 'Top_4_OfLibrary', '.Chosen,You');

/* —— Déplacer tout, et s'en souvenir ———————————————————————————————— */

/* Le remplacement « Forget other remembered » se juge après avoir trouvé ce qui bouge : le filtre `Card.IsRemembered` lit encore la mémoire. */
FORGE_API.ChangeZoneAll.oubliApres = true;
etendEffet('ChangeZoneAll', ['RememberLKI', 'AtEOT'], null, null);
FORGE_API.ChangeZoneAll.gen = (g => function* (P, t, env) {
  const tardif = t.ForgetOtherRemembered === 'True' && /IsRemembered/.test(t.ChangeType || '');
  const origines = String(t.Origin || 'Battlefield').split(',').map(z => ZONES_FORGE[z.trim()]).filter(Boolean);
  const avant = t.RememberLKI === 'True' ? [].concat(...origines.map(z => objetsZone(P, z))).filter(o => forgeValideObjet(P, o, t.ChangeType || 'Card', env.src, env.ctrl, env)) : [];
  const m0 = env.ctx.memo.slice(), j0 = env.ctx.memoJ.slice(), champ0 = new Set(P.champ);
  yield* g(P, t, env);
  if (tardif) { env.ctx.memo = env.ctx.memo.filter(id => !m0.includes(id)); env.ctx.memoJ = env.ctx.memoJ.filter(j => !j0.includes(j)); }
  avant.filter(o => !obj(P, o.id) || obj(P, o.id).zone !== (origines[0] || 'champ')).forEach(o => retiensForge(env.ctx, o.id));
  /* « Exile those creatures at the beginning of your next upkeep » : ce qui est entré en jeu est marqué. */
  if (t.AtEOT === 'YourExileUpkeep') P.champ.filter(id => !champ0.has(id)).forEach(id => { obj(P, id).exilEntretien = env.ctrl; });
})(FORGE_API.ChangeZoneAll.gen);
FORGE_API.ChangeZoneAll.prepare = (p => function (t, op) { return !p || p.call(this, t.AtEOT === 'YourExileUpkeep' ? {...t, AtEOT: undefined} : t, op); })(FORGE_API.ChangeZoneAll.prepare);

/* Au début de son entretien, celui qui a rappelé les créatures les exile. */
suspensionsEntretien = (g => function (P) {
  g(P);
  P.champ.map(id => obj(P, id)).filter(o => o.exilEntretien === P.actif).forEach(o => { delete o.exilEntretien; deplace(P, o.id, 'exil'); });
})(suspensionsEntretien);

FORGE_API.RemoveFromCombat.gen = (g => function* (P, t, env) {
  const avant = P.combat ? objetsForge(P, t, env).map(o => o.id) : [];
  yield* g(P, t, env);
  if (t.RememberRemovedFromCombat === 'True') avant.forEach(id => retiensForge(env.ctx, id));
})(FORGE_API.RemoveFromCombat.gen);
forgeSait('param', 'RemoveFromCombat.RememberRemovedFromCombat');

/* —— Des filtres —————————————————————————————————————————————————————— */

/* Ce qui a bloqué ce tour, et contre qui. */
noteHistorique = (g => function (P, e) {
  g(P, e);
  if (e.t === 'bloquePar') { const h = histoire(P); (h.blocs = h.blocs || []).push({att: e.id, blq: e.bloqueur}); }
})(noteHistorique);

proprieteDesignee = (g => function (P, o, p, c, src, ctrl, env) {
  let m;
  /* La plus grande force parmi les créatures du joueur retenu ou visé (la nôtre ou celle d'un adversaire). */
  if ((m = /^greatestPowerControlledBy(Remembered|Targeted)$/.exec(p))) {
    const qui = m[1] === 'Remembered' ? (env && env.ctx && env.ctx.memoJ) || [] : env && env.ctx ? ciblesJoueurs(env) : [];
    return !!P && qui.includes(o.ctrl) && estCreature(o) && !champDe(P, o.ctrl).some(x => estCreature(x) && car(P, x).force > c.force);
  }
  /* « Creature that blocked a legendary creature this turn », « that was blocked by » : l'historique du tour. */
  if ((m = /^blocked(By)?ValidThisTurn (.+)$/.exec(p))) {
    const lie = (histoire(P).blocs || []).filter(b => (m[1] ? b.att : b.blq) === o.id);
    return lie.some(b => { const x = passeOuPresent(P, m[1] ? b.blq : b.att); return !!x && forgeValideObjet(P, x, m[2], src, ctrl, env); });
  }
  /* Bile Blight : chaque créature de même nom qu'une retenue (les retenues sont celles de la cible). */
  if (p === 'sameName' && env && env.sameNameDe) return env.sameNameDe.includes(o.def.nom);
  return g(P, o, p, c, src, ctrl, env);
})(proprieteDesignee);
forgeSait('filtre', 'greatestPowerControlledByRemembered', 'greatestPowerControlledByTargeted', 'blockedValidThisTurn Creature.Legendary',
  'blockedByValidThisTurn Creature.Legendary', 'Remembered');

/* « Remembered.sameName+Other+Creature » : les créatures qui portent le nom d'une retenue, hors elle-même. */
FORGE_API.PumpAll.gen = (g => function* (P, t, env) {
  if (!/^Remembered\./.test(t.ValidCards || '')) return yield* g(P, t, env);
  const memo = env.ctx.memo.map(id => passeOuPresent(P, id)).filter(Boolean), noms = memo.map(o => o.def.nom);
  const l = objetsZone(P, 'champ').filter(o => estCreature(o) && noms.includes(o.def.nom) && !memo.some(x => x.id === o.id));
  pompeForge(P, l, t, env);
})(FORGE_API.PumpAll.gen);

/* —— Un coût qui est un double —————————————————————————————————————— */

forgeSait('cout', 'XX');

/* —— Cleave : un second sort sur la même carte ————————————————————————— */

capaciteForge = (g => function (def, face, t, jetons) {
  if (!(t.SP && t.NonBasicSpell === 'True' && /Cleave/.test(t.PrecostDesc || '') && def.sort)) return g(def, face, t, jetons);
  const c = coutForge(t.Cost);
  if (!c || Object.keys(c.cout).some(k => k !== 'mana')) return false;
  const e = effetForge(face, t, jetons, true);
  if (!e) return false;
  def.cleave = {mana: c.cout.mana, sort: e};
  return true;
})(capaciteForge);
forgeSait('param', 'Draw.NonBasicSpell');
variantesEtendues = (g => function (P, j, o, depuis, essaie) {
  g(P, j, o, depuis, essaie);
  const d = o.def;
  if (d.cleave && (depuis === 'main' || depuis === 'commandement')) essaie('cleave', coutSort(P, j, o, depuis, d.cleave.mana), null, {...d, sort: d.cleave.sort, cleave: null});
})(variantesEtendues);

/* —— Une façon de lancer qui annonce X ———————————————————————————————— */

/* « Exile a blue card with mana value X from your hand rather than pay… » : une variante par valeur de mana que la main offre ;
   le nom de la variante porte X, que `lanceSort()` reprend (js/jeuActions.js). */
variantesEtendues = (g => function (P, j, o, depuis, essaie) {
  g(P, j, o, depuis, essaie);
  if (depuis !== 'main') return;
  (o.def.statiques || []).forEach((s, i) => {
    if (s.s !== 'forge' || s.t.Mode !== 'AlternativeCost' || s.t.Announce !== 'X') return;
    const env = {face: s.face, ctx: {cibles: [], memo: [], memoJ: []}, src: o, ctrl: j, op: {}, base: true};
    if (!conditionForge(P, s.t, env)) return;
    const valeurs = [...new Set(P.joueurs[j].main.filter(id => id !== o.id).map(id => mvDe(obj(P, id))))].filter(n => n > 0).sort((a, b) => a - b);
    valeurs.forEach(n => {
      const c = coutForge(s.t.Cost.replace(/cmcEQX/g, 'cmcEQ' + n));
      if (c) essaie('altX' + n, coutSort(P, j, o, depuis, c.cout.mana), autresCout(c.cout));
    });
  });
})(variantesEtendues);
forgeSait('param', 'AlternativeCost.Announce');
