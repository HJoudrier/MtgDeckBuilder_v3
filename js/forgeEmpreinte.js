/* =====================================================================
   js/forgeEmpreinte.js — L'empreinte

   Forge tient l'empreinte (`Imprint`) à part de la mémoire (`Remembered`) :
   Chrome Mox et Isochron Scepter gardent la carte exilée tant qu'ils sont
   en jeu, et une boucle `RepeatEach` qui change la mémoire laisse
   l'empreinte en place (Breach the Multiverse). Ici :
   - l'empreinte de la carte (`P.cartes[cid].empreinte`), et sur un effet ;
   - ce qui y entre : `Imprint$`, `ImprintChosen$`, `ImprintPlayed$`,
     `ImprintFound$`, `ImprintRevealed$`, `ImprintTokens$`, `ImprintCards$` ;
   - ce qui en sort : `ForgetImprinted$`, `ClearImprinted$` ;
   - ce qui la lit : `Imprinted`, `IsImprinted`, `Imprinted$…`,
     `ImprintedController` ;
   - le mana des couleurs de la carte exilée (Chrome Mox).
   ===================================================================== */

/* L'empreinte de la source : celle de la carte, que ses déplacements ne
   vident pas (le script la vide lui-même), ou celle d'un effet. */
function empreinteDe(P, ctx, src) {
  if (ctx && ctx.empreinte) return ctx.empreinte;
  let l;
  if (src && src.zone === 'effet') l = src.empreinte || (src.empreinte = []);
  else { const k = src && P.cartes[src.cid]; l = k ? (k.empreinte || (k.empreinte = [])) : []; }
  if (ctx) ctx.empreinte = l;
  return l;
}
memoireForge = (g => function (P, ctx, src) { g(P, ctx, src); empreinteDe(P, ctx, src); })(memoireForge);

function retiensEmpreinte(l, x) {
  const id = x != null && typeof x === 'object' ? x.id : x;
  if (id != null && !l.includes(id)) l.push(id);
}
/* Oublier des objets : par leur numéro, ou par celui qu'ils avaient. */
function oublieObjets(P, l, objets) {
  for (const o of objets) {
    if (!o || o.j != null) continue;
    for (let i = l.length - 1; i >= 0; i--) if (l[i] === o.id || suit(P, l[i]) === o.id) l.splice(i, 1);
  }
}
/* L'empreinte d'un environnement de jugement, qui n'a pas toujours de
   contexte de résolution (un filtre de déclencheur, une capacité de mana). */
const empreinteEnv = (P, env) => empreinteDe(P, env && env.ctx && env.ctx.empreinte ? env.ctx : null, env && env.src);
const objetsEmpreinte = (P, env) => empreinteEnv(P, env).map(id => obj(P, suit(P, id)) || P.lkis.get(id)).filter(Boolean);

/* —— Ce qui la lit ——————————————————————————————————————————————————— */

definisEtendus = (g => function (P, v, env) {
  if (v === 'Imprinted') return objetsEmpreinte(P, env);
  if (v === 'ImprintedController') return [...new Set(objetsEmpreinte(P, env).map(o => o.ctrl))].map(j => ({j}));
  return g(P, v, env);
})(definisEtendus);

proprieteDesignee = (g => function (P, o, p, c, src, ctrl, env) {
  if (p === 'IsImprinted' || p === 'IsNotImprinted') {
    const l = P && src ? empreinteEnv(P, {...(env || {}), src}) : [];
    return l.some(x => x === o.id || suit(P, x) === o.id) === (p === 'IsImprinted');
  }
  return g(P, o, p, c, src, ctrl, env);
})(proprieteDesignee);

exprEtendue = (g => function (P, tete, q, env) {
  if (tete !== 'Imprinted') return g(P, tete, q, env);
  const l = objetsEmpreinte(P, env);
  if (q === 'Amount') return l.length;
  const k = /^Valid ([^$]+)(?:\$(\w+))?$/.exec(q);
  if (k) return agregeForge(P, l.filter(o => forgeValideObjet(P, o, k[1], env.src, env.ctrl, env)), k[2]);
  return caracForge(P, l[0], q);
})(exprEtendue);

/* —— Ce qui y entre, ce qui en sort ———————————————————————————————————— */

/* « Imprint » plutôt que « remember » : l'effet retient comme d'habitude,
   puis ce qu'il vient de retenir passe dans l'empreinte. */
function empreinteAuLieu(api, imprime, retiens) {
  const e = FORGE_API[api], g = e.gen;
  e.gen = function* (P, t, env) {
    if (t[imprime] !== 'True') return yield* g(P, t, env);
    const ctx = env.ctx, avant = new Set(ctx.memo), garde = t[retiens] === 'True';
    yield* g(P, {...t, [retiens]: 'True'}, env);
    const neufs = ctx.memo.filter(id => !avant.has(id));
    if (!garde) for (const id of neufs) ctx.memo.splice(ctx.memo.indexOf(id), 1);
    neufs.forEach(id => retiensEmpreinte(empreinteDe(P, ctx, env.src), id));
  };
  forgeSait('param', api + '.' + imprime);
}
empreinteAuLieu('DigUntil', 'ImprintFound', 'RememberFound');
empreinteAuLieu('PeekAndReveal', 'ImprintRevealed', 'RememberRevealed');
empreinteAuLieu('Token', 'ImprintTokens', 'RememberTokens');

/* La carte choisie, dans l'empreinte ou hors de la mémoire. */
FORGE_API.ChooseCard.gen = (g => function* (P, t, env) {
  yield* g(P, t, env);
  const pris = choixDe(P, env.src).cartes || [];
  if (t.ImprintChosen === 'True') pris.forEach(id => retiensEmpreinte(empreinteDe(P, env.ctx, env.src), id));
  if (t.ForgetChosen === 'True') oublieObjets(P, env.ctx.memo, pris.map(id => obj(P, id)));
})(FORGE_API.ChooseCard.gen);

/* « Pump » sans bonus : Forge s'en sert pour retenir ou oublier. */
FORGE_API.Pump.gen = (g => function* (P, t, env) {
  const ctx = env.ctx;
  if (t.ImprintCards) forgeDefinis(P, t.ImprintCards, env).forEach(x => { if (x.j == null) retiensEmpreinte(empreinteDe(P, ctx, env.src), x); });
  if (t.ForgetImprinted) oublieObjets(P, empreinteDe(P, ctx, env.src), forgeDefinis(P, t.ForgetImprinted, env));
  if (t.ForgetObjects) oublieObjets(P, ctx.memo, forgeDefinis(P, t.ForgetObjects, env));
  if ((t.ImprintCards || t.ForgetImprinted || t.ForgetObjects) && !t.NumAtt && !t.NumDef && !t.KW && !t.Defined && env.op.slot == null) return;
  yield* g(P, t, env);
})(FORGE_API.Pump.gen);

/* Vider l'empreinte ; vider la mémoire vide aussi le nombre retenu
   (js/forgeMemoire.js). */
FORGE_API.Cleanup.gen = (g => function* (P, t, env) {
  yield* g(P, t, env);
  if (t.ClearImprinted === 'True') empreinteDe(P, env.ctx, env.src).length = 0;
  if (t.ClearRemembered === 'True') env.ctx.nombre = 0;
})(FORGE_API.Cleanup.gen);

/* L'effet né avec des cartes dans son empreinte. */
FORGE_API.Effect.gen = (g => function* (P, t, env) {
  const n = durees(P).effets.length;
  yield* g(P, t, env);
  if (!t.ImprintCards || durees(P).effets.length === n) return;
  const ef = P.effets[P.effets.length - 1];
  ef.empreinte = forgeDefinis(P, t.ImprintCards, env).filter(x => x.j == null).map(x => x.id);
})(FORGE_API.Effect.gen);

/* —— Le mana de la carte exilée ——————————————————————————————————————— */

/* « Add one mana of any of the exiled card's colors » (Chrome Mox) : les
   couleurs des cartes désignées, lues au moment de payer. */
capaciteForge = (g => function (def, face, t, jetons) {
  const m = forgeApi(t) === 'ManaReflected' && /^Defined\.(\w+)$/.exec(t.Valid || '');
  if (!m) return g(def, face, t, jetons);
  const c = coutForge(t.Cost);
  if (!c || t.SubAbility || t.ReflectProperty !== 'Is' || t.ColorOrType !== 'Color' || Object.keys(c.cout).some(k => k !== 'mana' && k !== 'engage') ||
    (c.cout.mana && c.cout.mana.total) || !tableJouable(t)) return false;
  def.capacites.push({genre: 'mana', cout: c.cout, options: [], reflete: {defini: m[1], type: false}, texte: texteForge(face, t)});
  return true;
})(capaciteForge);
manaReflete = (g => function (P, j, o, k) {
  if (!k.reflete.defini) return g(P, j, o, k);
  const r = new Set();
  forgeDefinis(P, k.reflete.defini, {ctx: {cibles: []}, src: o, ctrl: j, op: {}}).forEach(x => { if (x.j == null) (x.def.couleurs || []).forEach(l => r.add(l)); });
  return [...r];
})(manaReflete);

forgeSait('param', 'ChooseCard.ImprintChosen', 'ChooseCard.ForgetChosen', 'Pump.ImprintCards', 'Pump.ForgetImprinted', 'Pump.ForgetObjects',
  'Play.ImprintPlayed', 'Effect.ImprintCards', 'Cleanup.ClearImprinted');
forgeSait('filtre', 'IsImprinted', 'IsNotImprinted');
forgeSait('defini', 'Imprinted', 'ImprintedController');
forgeSait('expr', 'Imprinted$Amount', 'Imprinted$CardManaCost', 'Imprinted$CardPower', 'Imprinted$CardToughness', 'Imprinted$Valid');
