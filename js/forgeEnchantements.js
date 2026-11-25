/* =====================================================================
   js/forgeEnchantements.js — Les enchantements d'EDHREC : de petites pièces

   Lot F109. Un mécanisme chacun, les plus simples d'abord :
   - Dracogenesis, As Foretold : jouer depuis plusieurs zones, dont le
     commandement (js/forgeStatiques.js) ;
   - Everlasting Torment : `WitherDamage`, tous les dégâts se marquent en
     marqueurs −1/−1 ;
   - Les Cas (Case of …) : `AlterAttribute | Solved` et le filtre `IsSolved` ;
     Case of the Uneaten Feast rend aux créatures du cimetière le droit d'être
     lancées ce tour ;
   - Deeproot Pilgrimage : `TapAll`, des créatures qui s'engagent ensemble ;
   - Thousand-Year Storm : `TriggerObjectsCurrentCastSpells$Valid` ;
   - Songbirds' Blessing (`DigUntil | OptionalFoundMove`), Ballad of the Black
     Flag (`Mill | Imprint`), Feast on the Fallen (`LifeLostLastTurn`),
     The Apprentice's Folly (`doesNotShareNameWith`), Arcane Bombardment.
   ===================================================================== */

/* —— Des dégâts qui se marquent en −1/−1 ————————————————————————————————— */

forgeStatique('WitherDamage', [], () => {});
infligeUnePart = (g => function (P, src, cible, n, combat) {
  if (cible && cible.j == null && src && src.def && statiquesMode(P, 'WitherDamage').length && !(src.def.params && src.def.params.fletri)) {
    const d0 = src.def;
    src.def = {...d0, params: {...(d0.params || {}), fletri: true}};
    try { return g(P, src, cible, n, combat); } finally { src.def = d0; }
  }
  return g(P, src, cible, n, combat);
})(infligeUnePart);

/* —— Les Cas : résolus ——————————————————————————————————————————— */

forgeSait('filtre', 'IsSolved');
FORGE_API.AlterAttribute.prepare = (p => function (t, op) { return t.Attributes === 'Solved' || !p || p.call(this, t, op); })(FORGE_API.AlterAttribute.prepare);
FORGE_API.AlterAttribute.gen = (g => function* (P, t, env) {
  if (t.Attributes !== 'Solved') return yield* g(P, t, env);
  for (const o of forgeDefinis(P, t.Defined || 'Self', env).filter(x => x && x.j == null && x.zone === 'champ' && !x.solved)) { o.solved = true; P.ver++; jn(P, `${o.def.nom} est résolue`); }
})(FORGE_API.AlterAttribute.gen);
proprieteDesignee = (g => function (P, o, p, c, src, ctrl, env) {
  if (p === 'IsSolved') return !!o.solved;
  if (p === 'doesNotShareNameWith Card.token') return !champDe(P, ctrl).some(x => x.jeton && x.def.nom === o.def.nom);
  return g(P, o, p, c, src, ctrl, env);
})(proprieteDesignee);
forgeSait('filtre', 'doesNotShareNameWith Card.token');

/* « Creature cards in your graveyard gain "You may cast this card from your graveyard" until end of turn » : pour ce tour, à son coût, sans l'exiler ensuite. */
FORGE_API.Animate.prepare = (p => function (t, op) {
  return (/^ValidGraveyard /.test(t.Defined || '') && /^Play$/.test(t.staticAbilities || '') && (!op.face || /MayPlay\$ *True/.test(op.face.svars.Play || ''))) || !p || p.call(this, t, op);
})(FORGE_API.Animate.prepare);
FORGE_API.Animate.gen = (g => function* (P, t, env) {
  if (!/^ValidGraveyard /.test(t.Defined || '') || t.staticAbilities !== 'Play') return yield* g(P, t, env);
  const filtre = t.Defined.replace(/^ValidGraveyard /, '');
  P.joueurs[env.ctrl].cimetiere.map(id => obj(P, id)).filter(o => o && forgeValideObjet(P, o, filtre, env.src, env.ctrl, env)).forEach(o => { o.jouableCim = P.tour; });
  P.ver++;
})(FORGE_API.Animate.gen);
lancableDuCimetiere = (g => function (d, o, P) { return (!!o && o.jouableCim === P.tour && !d.types.includes('land')) || g(d, o, P); })(lancableDuCimetiere);
variantesEtendues = (g => function (P, j, o, depuis, essaie) {
  g(P, j, o, depuis, essaie);
  if (depuis === 'cimetiere' && o.jouableCim === P.tour && !o.def.types.includes('land')) essaie('permis', coutSort(P, j, o, depuis), o.def.coutSup || null);
})(variantesEtendues);

/* —— Plusieurs créatures qui s'engagent ———————————————————————————————— */

forgeMode('TapAll', ['ValidCards'], (P, t, e, s, env) => e.t === 'engage' && valideOuRien(P, obj(P, e.id), t.ValidCards, s, env));
MODES_PAR_LOT.add('TapAll');

/* —— Des sorts lancés, comptés ————————————————————————————————————— */

exprEtendue = (g => function (P, tete, q, env) {
  let k;
  if (tete === 'TriggerObjectsCurrentCastSpells' && (k = /^Valid (.+)$/.exec(q)))
    return (P.joueurs[env.ctrl].sortsTour || []).filter(d => forgeValideDef(d, k[1], env.ctrl, env.ctrl)).length;
  return g(P, tete, q, env);
})(exprEtendue);
forgeSait('expr', 'TriggerObjectsCurrentCastSpells$Valid');
/* « An opponent lost life last turn » : ce que les adversaires ont perdu au tour d'avant. */
quantiteGroupe = (g => function (P, qui, q, env) {
  if (q !== 'LifeLostLastTurn') return g(P, qui, q, env);
  const J = groupeJoueurs(P, qui, env);
  return J == null ? undefined : J.reduce((s, j) => s + (((P.histPrec && P.histPrec.perdu) || {})[j] || 0), 0);
})(quantiteGroupe);
forgeSait('expr', 'PlayerCountOpponents$LifeLostLastTurn');

/* —— Chercher, et poser ou prendre en main ————————————————————————————— */

forgeSait('param', 'DigUntil.OptionalFoundMove', 'DigUntil.OptionalNoDestination');

/* —— Milled, puis choisi parmi elles ————————————————————————————————— */

forgeSait('param', 'Mill.Imprint');
FORGE_API.Mill.gen = (g => function* (P, t, env) {
  if (t.Imprint !== 'True') return yield* g(P, t, env);
  const avant = P.joueurs.map(J => new Set(J.cimetiere));
  yield* g(P, t, env);
  const l = empreinteDe(P, env.ctx, env.src);
  P.joueurs.forEach((J, i) => J.cimetiere.filter(id => !avant[i].has(id)).forEach(id => retiensEmpreinte(l, id)));
})(FORGE_API.Mill.gen);

/* —— Arcane Bombardment ————————————————————————————————————————— */

forgeSait('param', 'SpellCast.OrderDuplicates');

/* « Solved — … » : une activation qu'on n'a qu'une fois la carte résolue (`Activation$ Solved`). */
FORGE_CONDITIONS.Solved = (P, env) => !!(env.src && env.src.solved);
