/* =====================================================================
   js/forgeEnchantementsE.js — Les enchantements d'EDHREC : des effets au détail (suite)

   Lot F109 :
   - Furious Rise : l'effet qui permet de jouer la carte exilée disparaît
     quand la source en exile une autre (`Effect | ImprintOnHost`) ;
   - Squandered Resources : du mana de n'importe quel type que le terrain
     sacrifié produisait ;
   - Sothera, the Supervoid : `PlayerCountPlayers$LowestValid` ;
   - Enhanced Surveillance : `SurveilNum`, deux cartes de plus à surveiller ;
   - Guild Summit : engager autant de Portes qu'on veut (`Tap | CardChoices`) ;
   - Stronghold Arena : deux kickers distincts, `Kicker:G:W` ;
   - Echoes of Eternity : `Panharmonicon | ValidZone`.
   ===================================================================== */

/* —— Jouer la dernière carte exilée —————————————————————————————— */

forgeSait('param', 'Effect.ImprintOnHost');
/* Un nouvel effet de cette source remplace le précédent : seule la dernière carte exilée reste jouable. */
FORGE_API.Effect.gen = (g => function* (P, t, env) {
  if (t.ImprintOnHost !== 'True' || !env.src) return yield* g(P, t, env);
  durees(P).effets = durees(P).effets.filter(ef => ef.empreinteHote !== env.src.cid);
  const n = P.effets.length;
  yield* g(P, t, env);
  if (P.effets.length > n) P.effets[P.effets.length - 1].empreinteHote = env.src.cid;
  P.ver++;
})(FORGE_API.Effect.gen);

/* —— Du mana de ce que le terrain sacrifié produisait ———————————————————— */

/* Sacrifier le terrain est un coût, mais le choix du type se fait à la résolution : la capacité passe par la pile. */
forgeEffet('ManaTypeSacrifie', ['ColorOrType', 'Valid', 'ReflectProperty'], function* (P, t, env) {
  const l = (env.ctx.sacrifies || (env.ctx.coutPaye && env.ctx.coutPaye.sacrifies) || [])[0];
  if (!l || !l.def) return;
  const opts = [...new Set([].concat(...(l.def.capacites || []).filter(c => c.genre === 'mana').map(c => c.options || [])))];
  if (!opts.length) return;
  ajouteMana(P, env.ctrl, yield* choisitManaOption(P, env.ctrl, opts, env.ctx.source, 0));
}, (t, op) => { op.op = 'mana'; op.options = ['W', 'U', 'B', 'R', 'G']; op.hostile = false; });
capaciteForge = (g => function (def, face, t, jetons) {
  if (forgeApi(t) === 'ManaReflected' && t.Valid === 'Defined.Sacrificed' && t.ReflectProperty === 'Produce') { const u = {...t}; delete u.AB; u.AB = 'ManaTypeSacrifie'; return g(def, face, u, jetons); }
  return g(def, face, t, jetons);
})(capaciteForge);

/* —— Le joueur qui en a le moins ————————————————————————————————— */

exprEtendue = (g => function (P, tete, q, env) {
  let k;
  if (/^PlayerCount(Players)?$/.test(tete) && (k = /^LowestValid (.+)$/.exec(q)))
    return Math.min(...vivants(P).map(J => objetsZone(P, 'champ').filter(o => forgeValideObjet(P, o, k[1], env.src, J.i, env)).length));
  return g(P, tete, q, env);
})(exprEtendue);
forgeSait('expr', 'PlayerCountPlayers$LowestValid');

/* —— Surveiller deux cartes de plus ———————————————————————————————— */

forgeStatique('SurveilNum', ['Num', 'ValidPlayer', 'Optional'], () => {});
regardeForge = (g => function* (P, j, n, cimetiere) {
  if (cimetiere) for (const x of statiquesMode(P, 'SurveilNum')) if (x.src.ctrl === j && (!x.s.t.ValidPlayer || x.s.t.ValidPlayer === 'You')) n += +x.s.t.Num || 0;
  return yield* g(P, j, n, cimetiere);
})(regardeForge);

/* —— Engager autant de Portes qu'on veut ————————————————————————————— */

forgeSait('param', 'Tap.CardChoices', 'Tap.AnyNumber', 'Tap.ChoiceAmount', 'Tap.RememberTapped');
FORGE_API.Tap.gen = (g => function* (P, t, env) {
  if (!t.CardChoices) return yield* g(P, t, env);
  const ids = objetsZone(P, 'champ').filter(o => !o.engage && forgeValideObjet(P, o, t.CardChoices, env.src, env.ctrl, env)).map(o => o.id);
  if (!ids.length) return;
  const pris = yield* choisitCartes(P, env.ctrl, ids, t.AnyNumber === 'True' ? ids.length : 1, 'Engager', 'cartes', 0);
  pris.forEach(id => { const o = obj(P, id); if (o && !o.engage) { engageObjet(P, o); if (t.RememberTapped === 'True') retiensForge(env.ctx, id); } });
})(FORGE_API.Tap.gen);
FORGE_API.Tap.prepare = (p => function (t, op) { return !!t.CardChoices || !p || p.call(this, t, op); })(FORGE_API.Tap.prepare);

/* —— Deux kickers distincts ———————————————————————————————————————— */

motCleForge = (g => function (def, k, face, jetons) {
  const m = /^Kicker:([^:]+):([^:]+)$/.exec(k);
  if (!m) return g(def, k, face, jetons);
  const a = manaSeul(m[1]), b = manaSeul(m[2]);
  if (!a || !b) return false;
  def.kickerDouble = [coutComplet(a).mana, coutComplet(b).mana];
  return true;
})(motCleForge);
variantesMotsClesE = (g => function (P, j, o, depuis, essaie) {
  g(P, j, o, depuis, essaie);
  const d = o.def;
  if (!d.kickerDouble || depuis !== 'main') return;
  const base = coutSort(P, j, o, depuis), [a, b] = d.kickerDouble;
  essaie('kickD1', sommeMana(base, a), d.coutSup || null);
  essaie('kickD2', sommeMana(base, b), d.coutSup || null);
  essaie('kickD12', sommeMana(sommeMana(base, a), b), d.coutSup || null);
})(variantesMotsClesE);

/* —— Des déclencheurs en plus pour du sans-couleur —————————————————————— */

/* « …or a colorless spell you control » : un sort sur la pile n'a pas de déclencheur d'entrée à doubler ici, seuls les permanents comptent. */
forgeSait('param', 'Panharmonicon.ValidZone');

/* —— Un permanent qui n'est plus qu'un Véhicule —————————————————————— */

forgeSait('param', 'Continuous.RemoveArtifactTypes');

/* —— Ce qu'une Aura ou un Équipement pourrait enchanter ou équiper ———————————— */

/* Mantle of the Ancients : une Aura du cimetière qui pourrait s'attacher à la créature enchantée, ou n'importe quel Équipement. */
forgeSait('filtre', 'CanEnchantEquippedBy');
proprieteDesignee = (g => function (P, o, p, c, src, ctrl, env) {
  if (p !== 'CanEnchantEquippedBy') return g(P, o, p, c, src, ctrl, env);
  const h = P && src && src.att != null ? obj(P, src.att) : null;
  if (!h || h.zone !== 'champ') return false;
  return !!o.def.equipe || (!!o.def.aura && correspondBase(P, h, o.def.aura, o, o.ctrl));
})(proprieteDesignee);

/* —— Chaque sort non-créature a la conspiration ——————————————————————— */

/* Raiding Schemes : une statique qui accorde Conspire aux sorts sur la pile ; les variantes de lancement la lisent (js/forgeMotsClesE.js). */
horsChampTenable = (g => function (t) {
  return (t.Mode === 'Continuous' && t.AffectedZone === 'Stack' && t.AddKeyword === 'Conspire' && (!t.EffectZone || t.EffectZone === 'Battlefield')) || g(t);
})(horsChampTenable);
variantesMotsClesE = (g => function (P, j, o, depuis, essaie) {
  g(P, j, o, depuis, essaie);
  const d = o.def;
  if (depuis !== 'main' || d.conspire || d.types.includes('creature') || !d.sort) return;
  if (statiquesMode(P, 'Continuous').some(x => x.src.ctrl === j && x.s.t.AddKeyword === 'Conspire' && x.s.t.AffectedZone === 'Stack'))
    essaie('conspire', coutSort(P, j, o, depuis), fusionAutres(d.coutSup, {conspire: true}));
})(variantesMotsClesE);
