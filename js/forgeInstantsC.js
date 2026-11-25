/* =====================================================================
   js/forgeInstantsC.js — Les instants : la pile, les coûts facultatifs

   Lot F101 :
   - `ControlSpell` (Commandeer) : prendre le contrôle d'un sort ;
   - `Counter | ValidCause` (Autumn's Veil) : un sort protégé n'est
     incontrecarrable que contre les sorts de certaines couleurs ;
   - la copie d'un sort de permanent, qui devient un jeton à la résolution
     (Double Major, `NonLegendary`) ;
   - `Behold` et `RevealOrChoose` : la force de ce qu'on a montré ou choisi
     (Dragon's Fire), et `Count$OptionalGenericCostPaid.A.B` : A si le coût
     facultatif a été payé, B sinon (Dispelling Exhale) ;
   - `GainLife<3/Player.Opponent>` : un adversaire gagne de la vie en guise
     de coût (Invigorate) ;
   - `TargetedPlayer$Valid …` : « YouCtrl » s'y lit du côté du joueur visé ;
   - `ManifestDread | DefinedPlayer`, `TargetOnly | Choices`.
   ===================================================================== */

/* —— Prendre le contrôle d'un sort ———————————————————————————————————— */

forgeEffet('ControlSpell', ['Mode'], function* (P, t, env) {
  for (const o of objetsForge(P, t, env, 'Targeted').filter(x => x.zone === 'pile')) {
    const it = P.pile.find(x => x.id === o.id);
    if (!it) continue;
    it.ctrl = env.ctrl; o.ctrl = env.ctrl;
    P.ver++;
    jn(P, `${P.joueurs[env.ctrl].nom} prend le contrôle de ${o.def.nom}`);
  }
}, (t, op) => { op.op = 'forge'; op.hostile = true; }, {prepare: t => !t.Mode || t.Mode === 'Gain'});
forgeSait('param', 'ControlSpell.Mode');

/* —— Incontrecarrable contre certaines causes —————————————————————————— */

forgeSait('param', 'Counter.ValidCause');
/* Le sort qui contrecarre, le temps du `Counter` : `incontrecarrable()` (js/forgeRemplacements.js) le lit. */
FORGE_API.Counter.gen = (g => function* (P, t, env) {
  const avant = P.causeContre;
  P.causeContre = env.src || null;
  try { yield* g(P, t, env); } finally { P.causeContre = avant; }
})(FORGE_API.Counter.gen);

/* —— Copier un sort de permanent ————————————————————————————————————— */

copieSort = (g => function* (P, j, o, it, nouvelles) {
  if (!o || !it.def.types.some(x => TYPES_PERMANENTS.includes(x))) return yield* g(P, j, o, it, nouvelles);
  const def = {...it.def};
  delete def._eph; delete def._ecoute; delete def._faceCachee;
  if (P.copieSansLegende) def.supers = (def.supers || []).filter(s => s !== 'legendary');
  P.pile.push({id: P.prochainId++, capacite: true, copie: true, source: o.id, lki: instantane(P, o), ctrl: j, x: it.x, nom: it.def.nom + ' (copie)',
    effets: [{ops: [{op: 'copieJeton', def}], slots: [], cibles: []}], kicked: it.kicked});
  jn(P, `${P.joueurs[j].nom} copie ${it.def.nom}`);
})(copieSort);
OPS.copieJeton = function* (P, op, ctx) {
  if (P.champ.length >= PLAFOND_CHAMP) { P.fin = P.fin || {nulle: true, raison: 'plafond'}; return; }
  const j = ctx.ctrl, o = creeObjet(P, nouvelleCarte(P, op.def, j, false, true), j, 'champ');
  P.champ.push(o.id);
  P.ver++;
  emet(P, {t: 'entre', id: o.id, ctrl: j, jeton: true});
  noteEntree(P, null, 'champ', o);
};
FORGE_API.CopySpellAbility.gen = (g => function* (P, t, env) {
  P.copieSansLegende = t.NonLegendary === 'True';
  try { yield* g(P, t, env); } finally { P.copieSansLegende = false; }
})(FORGE_API.CopySpellAbility.gen);
forgeSait('param', 'CopySpellAbility.NonLegendary');

/* —— Montrer ou choisir, puis lire ce qu'on a montré ————————————————————— */

COUTS_B.RevealOrChoose = COUTS_B.Behold;
COUTS_B.GainLife = (c, n, p) => p[1] === 'Player.Opponent' && (c.adversaireGagne = n);
forgeSait('cout', 'RevealOrChoose', 'GainLife');
X_COUTS_B.push('RevealOrChoose');
CHAMPS_COUTS_B.push('adversaireGagne');

/* La carte ou la créature montrée la plus forte, retenue au paiement : « the power of that card or creature ». */
paieAutreB = (g => function* (P, j, o, c) {
  if (c.contemple) {
    const l = [...champDe(P, j).map(x => x.id), ...P.joueurs[j].main].filter(id => id !== o.id && correspond(P, obj(P, id), c.contemple.desc, o, j));
    o.contemplee = Math.max(0, ...l.map(id => caracForge(P, obj(P, id), 'CardPower')));
  }
  if (c.adversaireGagne) {
    const i = adversaires(P, j).sort((a, b) => P.joueurs[b].vie - P.joueurs[a].vie)[0];
    if (i != null) gagneVie(P, i, c.adversaireGagne);
  }
  yield* g(P, j, o, c);
})(paieAutreB);

exprEtendue = (g => function (P, tete, q, env) {
  const src = env.src;
  let k;
  if (tete === 'Count' && (k = /^OptionalGenericCostPaid\.([^.]+)\.([^.]+)$/.exec(q)))
    return forgeNombre(P, (env.ctx.optionnel || (src && src.optionnel)) ? k[1] : k[2], env);
  if (tete === 'RevealedCards' && q === 'CardPower') return (src && src.contemplee) || 0;
  /* « Valid Artifact.YouCtrl » d'un joueur visé : c'est lui, le « you ». */
  if ((tete === 'TargetedPlayer' || tete === 'ThisTargetedPlayer') && /^Valid(Graveyard|Hand|Exile|Library)? /.test(q)) {
    const c = cibleForge(P, env, false);
    if (c && c.j != null) return forgeExpression(P, 'Count$' + q, {...env, ctrl: c.j}, 1);
  }
  return g(P, tete, q, env);
})(exprEtendue);
forgeSait('expr', 'Count$OptionalGenericCostPaid', 'RevealedCards$CardPower');

/* —— Des paramètres de plus ————————————————————————————————————————— */

/* Le joueur qui manifeste : le contrôleur de la cible, par exemple. */
FORGE_API.ManifestDread.gen = (g => function* (P, t, env) {
  if (!t.DefinedPlayer) return yield* g(P, t, env);
  const j = forgeDefinis(P, t.DefinedPlayer, env).map(x => joueurDe(x))[0];
  if (j != null) yield* g(P, t, {...env, ctrl: j});
})(FORGE_API.ManifestDread.gen);
forgeSait('param', 'ManifestDread.DefinedPlayer', 'TargetOnly.Choices');

/* « Choose target opponent. » : la cible est déjà dans `ValidTgts$` ; `Choices$` ne fait que répéter. */

/* —— Un coût de couleur en moins ———————————————————————————————————— */

/* « This spell costs {U}{U}{U} less to cast if an opponent has drawn four or more cards » : la carte elle-même, en main. */
coutSort = (g => function (P, j, o, depuis, imprime) {
  let c = g(P, j, o, depuis, imprime);
  for (const s of o.def.statiques || []) {
    const t = s.t;
    if (s.s !== 'forge' || !t || t.Mode !== 'ReduceCost' || !t.Color || t.ValidCard !== 'Card.Self') continue;
    if (!conditionForge(P, t, {face: s.face, ctx: {cibles: [], memo: [], memoJ: []}, src: o, ctrl: j, op: {}, base: true})) continue;
    const couleurs = {};
    String(t.Color).split(/\s+/).forEach(k => { if (/^[WUBRGC]$/.test(k)) couleurs[k] = (couleurs[k] || 0) + 1; });
    c = moinsMana(c, {generique: 0, couleurs});
  }
  return c;
})(coutSort);
forgeSait('param', 'ReduceCost.Color');
