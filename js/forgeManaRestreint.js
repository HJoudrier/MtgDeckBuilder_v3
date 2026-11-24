/* =====================================================================
   js/forgeManaRestreint.js — Du mana en réserve qui ne paie pas n'importe quoi

   Lot F100. « Add {R}{R}{R}. Spend this mana only to cast instant or sorcery
   spells » (Jaya Ballard), « Add {U}. Spend this mana only to cast a
   noncreature spell » (Chandra, Chill of Compliance) : un effet de mana,
   que la réserve ordinaire ne sait pas restreindre. Ce mana-là va dans
   `J.poolR`, une liste de `{l, valid}` ; il se mêle à la réserve le temps
   d'un paiement qui le permet (`manaPermis()`, js/jeuMana.js), en y
   passant d'abord — il ne sert à rien d'autre —, et ce qui reste retourne
   à sa liste. Comme la réserve, la liste se vide à la fin de l'étape.
   ===================================================================== */

FORGE_API.Mana.gen = (g => function* (P, t, env) {
  const riot = t.AddsKeywords === 'Riot' && !!t.AddsKeywordsValid, declencheur = !!t.TriggersWhenSpent;
  if (!t.RestrictValid && !riot && !declencheur) return yield* g(P, t, env);
  const opts = optionsMana(t.Produced, forgeNombre(P, t.Amount || 1, env));
  if (!opts.length) return;
  const J = P.joueurs[env.ctrl], option = yield* choisitManaOption(P, env.ctrl, opts, env.ctx.source, 0);
  /* Une faveur que le mana porte : riot (un marqueur +1/+1, comme `K:Riot`), ou le déclencheur de la source (« when you spend this mana to cast an Aura spell »). */
  const porte = riot ? {valid: t.AddsKeywordsValid.replace(/^Spell/, 'Spell'), genre: '+1/+1', n: 1} : null;
  (J.poolR = J.poolR || []).push(...String(option).split('').map(l => ({l, valid: t.RestrictValid || null, porte, source: declencheur && env.src ? env.src.id : null})));
  P.ver++;
})(FORGE_API.Mana.gen);

/* Les lettres que ce paiement permet : sans restriction, ou celles que la restriction accepte. */
const restreintsPermis = (P, j, pour) => (P.joueurs[j].poolR || []).filter(e => !e.valid || manaPermis(P, j, e.valid, pour));

/* Ce que le mana dépensé apporte au sort : le marqueur de riot, la source qui a payé. */
function porteDuPoolR(P, j, e, pour) {
  const sp = pour && pour.sort;
  if (!sp) return;
  if (e.source != null) (sp.manaDeSources = sp.manaDeSources || []).push(e.source);
  if (e.porte && manaPermis(P, j, e.porte.valid, pour)) (sp.marqPortes = sp.marqPortes || []).push({genre: e.porte.genre, n: e.porte.n});
}

/* Le temps d'un paiement, le restreint est déjà dans la réserve : le plan ne le compte pas deux fois. */
let RESTREINT_FUSIONNE = false;
planPaiement = (g => function (P, j, cout, x, pour) {
  const J = P.joueurs[j], ok = !RESTREINT_FUSIONNE && J.poolR && J.poolR.length ? restreintsPermis(P, j, pour) : [];
  if (!ok.length) return g(P, j, cout, x, pour);
  ok.forEach(e => { J.pool[e.l]++; });
  try { return g(P, j, cout, x, pour); } finally { ok.forEach(e => { J.pool[e.l]--; }); }
})(planPaiement);

paieMana = (g => function (P, j, cout, x, pour) {
  const J = P.joueurs[j], ok = J.poolR && J.poolR.length ? restreintsPermis(P, j, pour) : [];
  if (!ok.length) return g(P, j, cout, x, pour);
  const avant = {...J.pool}, permis = {};
  ok.forEach(e => { J.pool[e.l]++; permis[e.l] = (permis[e.l] || 0) + 1; });
  RESTREINT_FUSIONNE = true;
  let r;
  try { r = g(P, j, cout, x, pour); } finally { RESTREINT_FUSIONNE = false; }
  /* Le restreint part en premier : ce qui reste de chaque lettre est d'abord de l'ordinaire. */
  const gardes = new Set();
  for (const l of Object.keys(permis)) {
    const reste = J.pool[l], ordinaire = Math.min(avant[l], reste), restreint = Math.max(0, Math.min(permis[l], reste - ordinaire));
    J.pool[l] = ordinaire;
    ok.filter(e => e.l === l).slice(0, restreint).forEach(e => gardes.add(e));
  }
  /* Ce qui a été dépensé apporte sa faveur au sort. */
  ok.filter(e => !gardes.has(e) && (e.porte || e.source != null)).forEach(e => porteDuPoolR(P, j, e, pour));
  J.poolR = J.poolR.filter(e => !ok.includes(e) || gardes.has(e));
  return r;
})(paieMana);

videReserves = (g => function (P) { g(P); P.joueurs.forEach(J => { J.poolR = []; }); })(videReserves);

/* Le déclencheur de « when you spend this mana » d'une capacité de loyauté (The Unluckiest Planeswalker) : écrit comme celui d'une capacité de mana ordinaire
   (js/forgeManaC.js), il part quand un sort payé de ce mana-là est lancé. */
capaciteForge = (g => function (def, face, t, jetons) {
  if (forgeApi(t) !== 'Mana' || t.Planeswalker !== 'True' || !t.TriggersWhenSpent) return g(def, face, t, jetons);
  const tbl = face.svars[t.TriggersWhenSpent], n = def.capacites.length;
  if (!tbl || !/^Mode\$ SpellCast\b/.test(tbl) || !g(def, face, t, jetons)) return false;
  const m = def.capacites.length;
  if (!declencheurForge(def, face, forgeTable(tbl), jetons)) { def.capacites.length = n; return false; }
  def.capacites.slice(m).forEach(c => c.ecoutes.forEach(ec => { ec.viaMana = true; }));
  return true;
})(capaciteForge);
forgeSait('param', 'Mana.AddsKeywords', 'Mana.AddsKeywordsValid', 'Mana.TriggersWhenSpent');
