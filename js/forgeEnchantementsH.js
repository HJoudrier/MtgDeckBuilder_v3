/* =====================================================================
   js/forgeEnchantementsH.js — Les enchantements d'EDHREC : les types notés

   Lot F109 : Long List of the Ents (`ChooseType | Note | ChooseNoted`).
   Chaque chapitre note un type de créature que la saga n'a pas encore
   noté ; la mémoire des types notés suit la carte (js/forgeChoix.js
   `choixDe()`), comme le type choisi lui-même.
   ===================================================================== */

forgeSait('param', 'ChooseType.Note', 'ChooseType.ChooseNoted');
FORGE_API.ChooseType.gen = (g => function* (P, t, env) {
  if (t.Note !== 'True') return yield* g(P, t, env);
  const j = joueursForge(P, t, env)[0];
  if (j == null) return;
  const c = choixDe(P, env.src), notes = c.notes = c.notes || [];
  const frequents = typesFrequents(P, j).filter(x => !notes.includes(x));
  const tous = [...new Set([].concat(...P.cartes.filter(k => k.prop === j).map(k => (k.def.sousTypes || []).filter(s => !SOUSTYPES_NON_CREATURE.has(s)))))].filter(x => !notes.includes(x));
  const options = (frequents.length ? frequents : tous).slice(0, 12);
  if (!options.length) return;
  const i = yield* choisitUn(P, j, options.map(majuscule), 'Noter un type de créature', 0, env.ctx.source);
  c.type = options[i]; notes.push(options[i]);
  jn(P, `${env.src ? env.src.def.nom : 'Saga'} : type noté, ${majuscule(options[i])}`);
})(FORGE_API.ChooseType.gen);

/* —— Jouer gratuitement les cartes exilées, ce tour ———————————————————————— */

/* Triple Triad : chacun exile le dessus de sa bibliothèque ; ce tour, on peut jouer sans payer la carte qu'on possède et celles de valeur de mana moindre. Dans Forge c'est un Effect à statique `MayPlay` ; ici on marque les cartes (`jouableGratuit`) et les variantes de lancement les lisent. */
forgeSait('param', 'Effect.SetChosenNumber');
const estTripleTriad = (t, face) => !!t.SetChosenNumber && String(t.StaticAbilities || '').split(',').some(n => /MayPlayWithoutManaCost\$ True/.test(((face || {}).svars || {})[n.trim()] || '') && /cmcLT/.test(((face || {}).svars || {})[n.trim()] || ''));
FORGE_API.Effect.prepare = (p => function (t, op) { return estTripleTriad(t, op.face) || p.call(this, t, op); })(FORGE_API.Effect.prepare);
FORGE_API.Effect.gen = (g => function* (P, t, env) {
  if (!estTripleTriad(t, env.face)) return yield* g(P, t, env);
  const cartes = (env.ctx.memo || []).map(id => obj(P, id)).filter(o => o && o.zone === 'exil');
  const miennes = cartes.filter(o => o.prop === env.ctrl), x = miennes.reduce((s, o) => s + mvDe(o), 0);
  for (const o of cartes) if (!o.def.types.includes('land') && (o.prop === env.ctrl || mvDe(o) < x)) { o.jouableGratuit = P.tour; P.ver++; }
  jn(P, `Triple Triad : ${cartes.filter(o => o.jouableGratuit === P.tour).length} carte(s) jouable(s) gratuitement ce tour`);
})(FORGE_API.Effect.gen);
const gratuitCeTour = (P, o) => !!o && o.jouableGratuit === P.tour && o.zone === 'exil';
exilLancable = (g => function (P, o, rituel) { return gratuitCeTour(P, o) || g(P, o, rituel); })(exilLancable);
variantesEtendues = (g => function (P, j, o, depuis, essaie) {
  g(P, j, o, depuis, essaie);
  if (depuis === 'exil' && gratuitCeTour(P, o)) essaie('gratuit', coutManaVide(), o.def.coutSup || null);
})(variantesEtendues);

/* —— Qui pose les marqueurs ———————————————————————————————————————— */

/* Noble Heritage : `Placer$ Controller`, le contrôleur de chaque créature pose ses propres marqueurs — ce que fait déjà l'effet, sans autre choix. */
forgeSait('param', 'PutCounterAll.Placer');

/* —— Le joueur de la boucle ————————————————————————————————————— */

/* `RepeatEach | RepeatPlayers` retient le joueur du tour de boucle : « RememberedPlayer » le relit (Noble Heritage). */
definisEtendus = (g => function (P, v, env) {
  if (v === 'RememberedPlayer') return ((env.ctx && env.ctx.memoJ) || []).map(j => ({j}));
  return g(P, v, env);
})(definisEtendus);
forgeSait('defini', 'RememberedPlayer');

/* —— Dix dégâts ou plus à un même joueur, de la même source, ce tour ———————————— */

/* Vessel of the All-Consuming (la face arrière de Hidetsugu Consumes All) : « if it has dealt 10 or more damage to that player this turn ». */
forgeSait('filtre', 'wasDealtDamageThisTurnBySource GE10');
noteHistorique = (g => function (P, e) {
  g(P, e);
  if (e.t === 'degatsJoueur' && e.n > 0 && e.source != null) { const d = histoire(P).degatsPar = histoire(P).degatsPar || {}, k = e.source + '>' + e.joueur; d[k] = (d[k] || 0) + e.n; }
})(noteHistorique);
proprieteJoueurEtendue = (g => function (P, j, p, ctrl, env) {
  const m = /^wasDealtDamageThisTurnBySource GE(\d+)$/.exec(p);
  if (!m) return g(P, j, p, ctrl, env);
  const s = env && env.src;
  return !!s && ((histoire(P).degatsPar || {})[s.id + '>' + j] || 0) >= +m[1];
})(proprieteJoueurEtendue);
