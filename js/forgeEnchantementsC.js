/* =====================================================================
   js/forgeEnchantementsC.js — Les enchantements d'EDHREC : des effets au détail

   Lot F109 :
   - All-Out Assault (`DelayedTrigger | AttackingPlayer`), Call the Spirit
     Dragons (`PutCounter | ForColor` : un Dragon de chaque couleur) ;
   - Fall of Cair Andros : `ExcessDamage`, les dégâts de trop sur une créature ;
   - Necromancy : `MayFlashSac`, lancé hors de la vitesse d'un rituel, la
     créature ranimée est sacrifiée au nettoyage ;
   - Monk Class : une carte exilée qu'on peut lancer tant qu'on a lancé un autre
     sort ce tour (`Animate | MayPlay | CheckSVar` sur une carte exilée) ;
   - Food Chain (`Exiled$CardManaCost`), Nowhere to Run (`DisableTriggers`).
   ===================================================================== */

forgeSait('param', 'DelayedTrigger.AttackingPlayer');

/* —— Un Dragon de chaque couleur ———————————————————————————————————— */

forgeSait('param', 'PutCounter.ForColor', 'PutCounter.ChoiceTitle');
FORGE_API.PutCounter.gen = (g => function* (P, t, env) {
  if (t.ForColor !== 'True') return yield* g(P, t, env);
  const genre = genreMarqueur(t.CounterType), filtre = String(t.Choices).replace(/\.ChosenColor\+?/, '.').replace(/\.$/, '');
  for (const c of ['W', 'U', 'B', 'R', 'G']) {
    const ids = objetsZone(P, 'champ').filter(o => forgeValideObjet(P, o, filtre, env.src, env.ctrl, env) && car(P, o).couleurs.includes(c)).map(o => o.id);
    if (!ids.length) continue;
    const [id] = yield* choisitCartes(P, env.ctrl, ids, 1, `Choisir un Dragon ${NOMS_COULEURS[c].toLowerCase()}`, 'cartes', 1);
    const o = obj(P, id != null ? id : ids[0]);
    poseMarqueurs(P, o, genre, forgeNombre(P, t.CounterNum || 1, env), env.src);
    if (t.RememberPut === 'True') retiensForge(env.ctx, o.id);
  }
})(FORGE_API.PutCounter.gen);
FORGE_API.PutCounter.prepare = (p => function (t, op) { return t.ForColor === 'True' || !p || p.call(this, t, op); })(FORGE_API.PutCounter.prepare);

/* —— Des dégâts de trop ———————————————————————————————————————————— */

forgeMode('ExcessDamage', ['ValidTarget', 'CombatDamage', 'ValidSource'], (P, t, e, s, env) => e.t === 'exces' && valideOuRien(P, obj(P, e.id) || e.lki, t.ValidTarget, s, env) &&
  (t.CombatDamage == null || (t.CombatDamage === 'True') === !!e.combat));
infligeUnePart = (g => function (P, src, cible, n, combat) {
  const o = cible && cible.j == null && cible.zone === 'champ' && estCreature(cible) ? cible : null, avant = o ? o.bless : 0, vie = o ? Math.max(0, car(P, o).endurance - avant) : 0;
  const r = g(P, src, cible, n, combat);
  if (o && r > 0 && r > vie) emet(P, {t: 'exces', id: o.id, n: r - vie, combat: !!combat, source: src.id, lki: instantane(P, o)});
  return r;
})(infligeUnePart);

/* —— Necromancy ———————————————————————————————————————————————— */

forgeSait('kw', 'MayFlashSac');
motCleForge = (g => function (def, k, face, jetons) {
  if (k !== 'MayFlashSac') return g(def, k, face, jetons);
  def.mayFlashSac = true;
  return true;
})(motCleForge);
estEphemere = (g => function (def) { return !!def.mayFlashSac || g(def); })(estEphemere);
/* Lancé quand un rituel n'aurait pas pu l'être : la créature qu'il ranime est sacrifiée au nettoyage suivant. */
lanceSort = (g => function* (P, j, a) {
  const o = a && obj(P, a.id), hors = !!o && !!o.def.mayFlashSac && !(enPhasePrincipale(P, j) && P.pile.length === 0);
  const r = yield* g(P, j, a);
  if (r && hors && obj(P, a.id) && obj(P, a.id).lance) obj(P, a.id).lance.horsRituel = true;
  return r;
})(lanceSort);
nettoyage = (g => function* (P) {
  for (const id of P.champ.slice()) { const o = obj(P, id); if (o && o.def.mayFlashSac && o.lance && o.lance.horsRituel && o.att != null && obj(P, o.att)) { jn(P, `${o.def.nom} : ${obj(P, o.att).def.nom} est sacrifiée`); sacrifie(P, o.att); } }
  yield* g(P);
})(nettoyage);

/* —— Une carte exilée qu'on peut lancer sous condition ———————————————————— */

FORGE_API.Animate.prepare = (p => function (t, op) {
  const st = t.staticAbilities && op.face && op.face.svars[t.staticAbilities];
  if (t.Defined === 'Remembered' && st && /MayPlay\$ *True/.test(st) && /AffectedZone\$ *Exile/.test(st) && /CheckSVar\$ *\w+/.test(st)) return true;
  return !p || p.call(this, t, op);
})(FORGE_API.Animate.prepare);
FORGE_API.Animate.gen = (g => function* (P, t, env) {
  const st = t.staticAbilities && env.face && env.face.svars[t.staticAbilities], m = st && /CheckSVar\$ *(\w+)/.exec(st);
  if (!(t.Defined === 'Remembered' && st && /MayPlay\$ *True/.test(st) && /AffectedZone\$ *Exile/.test(st) && m)) return yield* g(P, t, env);
  for (const o of objetsForge(P, t, env).filter(x => x && x.j == null && x.zone === 'exil')) { o.jouableExilSi = {svar: m[1], face: env.face, ctrl: env.ctrl}; P.ver++; }
})(FORGE_API.Animate.gen);
const jouableExilSi = (P, o) => { const c = o && o.jouableExilSi; return !!c && forgeNombre(P, c.svar, {face: c.face, ctx: {cibles: [], memo: [], memoJ: []}, src: o, ctrl: c.ctrl, op: {}}) >= 1; };
exilLancable = (g => function (P, o, rituel) { return (jouableExilSi(P, o) && !o.def.types.includes('land')) || g(P, o, rituel); })(exilLancable);
variantesEtendues = (g => function (P, j, o, depuis, essaie) {
  g(P, j, o, depuis, essaie);
  if (depuis === 'exil' && jouableExilSi(P, o) && !o.def.types.includes('land')) essaie('permis', coutSort(P, j, o, depuis), o.def.coutSup || null);
})(variantesEtendues);

/* —— Food Chain ——————————————————————————————————————————————— */

exprEtendue = (g => function (P, tete, q, env) {
  if (tete === 'Exiled' && q === 'CardManaCost') {
    const ids = (env.ctx && env.ctx.coutPaye && env.ctx.coutPaye.exiles) || (P.coutPaye && P.coutPaye.exiles) || [];
    return ids.reduce((s, id) => s + (obj(P, id) ? mvDe(obj(P, id)) : 0), 0);
  }
  return g(P, tete, q, env);
})(exprEtendue);
forgeSait('expr', 'Exiled$CardManaCost');

/* —— Nowhere to Run ———————————————————————————————————————————— */

forgeStatique('DisableTriggers', ['ValidTrigger', 'ValidCard'], () => {});
/* Les créatures des adversaires de celui qui le contrôle ne gardent plus leur « ward » : ce coût ne s'ajoute plus. */
coutDeGarde = (g => function (P, j, effets) {
  const sans = statiquesMode(P, 'DisableTriggers').filter(x => /Ward/.test(x.s.t.ValidTrigger || '') && x.src.ctrl === j);
  if (!sans.length) return g(P, j, effets);
  const filtre = effets.map(ef => ({...ef, cibles: ef.cibles.map(cs => cs.filter(c => { const o = typeof c === 'number' ? obj(P, c) : null; return !(o && o.zone === 'champ' && o.ctrl !== j && estCreature(o)); }))}));
  return g(P, j, filtre);
})(coutDeGarde);

/* —— Du mana restreint payé d'une carte ou d'une créature ————————————————————— */

/* « Exile a creature: add X mana… spend only on creature spells » (Food Chain), « exile a card from your graveyard: add {C}… » (Titans' Nest) : sans engagement, le solveur de mana ne peut pas la tenir ; elle passe par la pile, et son mana restreint arrive à la résolution. */
forgeEffet('ManaRestreintPile', ['Produced', 'Amount', 'RestrictValid'], function* (P, t, env) { yield* FORGE_API.Mana.gen(P, t, env); }, (t, op) => { op.op = 'mana'; op.options = optionsMana(t.Produced, 1); op.hostile = false; });
capaciteForge = (g => function (def, face, t, jetons) {
  if (forgeApi(t) === 'Mana' && t.RestrictValid && !/(^|\s)T(\s|$)/.test(t.Cost || '') && !t.Planeswalker) { const u = {...t}; delete u.AB; u.AB = 'ManaRestreintPile'; return g(def, face, u, jetons); }
  return g(def, face, t, jetons);
})(capaciteForge);
