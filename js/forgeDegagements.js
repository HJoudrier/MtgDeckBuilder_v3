/* =====================================================================
   js/forgeDegagements.js — Dégager et piocher « jusqu'à »

   Frantic Search, Snap, Peregrine Drake : « untap up to N lands », N
   permanents engagés choisis parmi ceux d'un type. Arcane Denial : « may
   draw up to two cards », un nombre choisi de 0 à N. Spelunking : « lands
   you control enter untapped », le pendant de « enter tapped ». Throne of
   Eldraine : « spend only mana of the chosen color to activate this
   ability », le générique payé dans la couleur choisie.
   ===================================================================== */

/* « Untap up to N lands » : à choisir parmi les permanents engagés du type
   dit ; l'IA dégage d'abord les siens (js/iaChoix.js). */
FORGE_API.Untap.gen = (g => function* (P, t, env) {
  if (t.UntapUpTo !== 'True') return yield* g(P, t, env);
  const n = forgeNombre(P, t.Amount || 1, env);
  const ids = P.champ.map(id => obj(P, id)).filter(o => o.engage && forgeValideObjet(P, o, t.UntapType || 'Permanent', env.src, env.ctrl, env))
    .sort((a, b) => (a.ctrl === env.ctrl ? 0 : 1) - (b.ctrl === env.ctrl ? 0 : 1)).map(o => o.id);
  for (const id of yield* choisitCartes(P, env.ctrl, ids, n, 'Dégager', 'cartes', 0)) degageObjet(P, obj(P, id));
})(FORGE_API.Untap.gen);

/* « Draw up to N cards » : chacun choisit combien. L'IA pioche tout, sauf
   quand sa bibliothèque s'épuise. */
FORGE_API.Draw.gen = (g => function* (P, t, env) {
  if (t.Upto !== 'True') return yield* g(P, t, env);
  const n = forgeNombre(P, t.NumCards || 1, env);
  for (const j of joueursForge(P, t, env)) {
    const B = P.joueurs[j].bibliotheque.length, pref = B > n + 3 ? n : Math.max(0, Math.min(n, B - 3));
    const k = yield* choisitUn(P, j, Array.from({length: n + 1}, (_, i) => `Piocher ${i}`), 'Piocher jusqu’à ' + n, pref, env.ctx.source);
    const avant = P.joueurs[j].main.slice();
    yield* pioche(P, j, k);
    if (t.RememberDrawn === 'True') P.joueurs[j].main.filter(id => !avant.includes(id)).forEach(id => retiensForge(env.ctx, id));
  }
})(FORGE_API.Draw.gen);

/* —— « Lands you control enter untapped » ——————————————————————————— */

/* La forme `degagee` : un `Moved` vers le champ dont la chaîne dégage
   l'objet qui entre. */
formeRemplacementC = (g => function (face, r) {
  const f = g(face, r);
  if (f) return f;
  if (r.Event !== 'Moved' || r.Destination !== 'Battlefield' || !r.ValidCard || /\bSelf\b/.test(r.ValidCard)) return null;
  const w = forgeSousCapacite(face, r.ReplaceWith);
  return w && forgeApi(w) === 'Untap' && w.ETB === 'True' && w.Defined === 'ReplacedCard' && !w.SubAbility ? 'degagee' : null;
})(formeRemplacementC);

/* Un permanent qui entrerait engagé et qu'un autre fait entrer dégagé :
   le dégagé l'emporte (js/jeuOpsB.js `metEnJeu()`) — le contrôleur choisit
   l'ordre des remplacements, simplification annoncée. */
function entreeDegageeParAutre(P, d, ctrl, o) {
  return remplacementsEnJeu(P).some(({src, r}) => r.forme === 'degagee' && forgeValideDef(d, r.t.ValidCard, src.ctrl, ctrl, o.id));
}

/* —— « Spend only mana of the chosen color » —————————————————————————— */

/* La capacité garde la restriction ; le paiement la lit. */
capaciteForge = (g => function (def, face, t, jetons) {
  const n = def.capacites.length, ok = g(def, face, t, jetons);
  if (ok && t.ManaRestriction === 'ChosenColor' && def.capacites.length > n) {
    const k = def.capacites[def.capacites.length - 1];
    k.cout = {...k.cout, mana: {...k.cout.mana, choisie: true}};
  }
  return ok;
})(capaciteForge);

/* Le générique payé dans la couleur choisie : des symboles de cette
   couleur à la place. Sans couleur choisie, rien ne paie. */
function manaDeCouleurChoisie(P, cout, pour) {
  if (!cout || !cout.choisie || !pour || !pour.capacite) return cout;
  const c = choixDe(P, pour.capacite).couleur;
  if (!c) return {...cout, generique: 0, couleurs: {...cout.couleurs, C: 99}, total: 99};
  return {...cout, generique: 0, couleurs: {...cout.couleurs, [c]: (cout.couleurs[c] || 0) + cout.generique}};
}
planPaiement = (g => function (P, j, cout, x, pour) { return g(P, j, manaDeCouleurChoisie(P, cout, pour), x, pour); })(planPaiement);
paieMana = (g => function (P, j, cout, x, pour) { return g(P, j, manaDeCouleurChoisie(P, cout, pour), x, pour); })(paieMana);

forgeSait('param', 'Untap.UntapUpTo', 'Untap.UntapType', 'Untap.Amount', 'Untap.ETB', 'Draw.Upto', 'Draw.ManaRestriction');
