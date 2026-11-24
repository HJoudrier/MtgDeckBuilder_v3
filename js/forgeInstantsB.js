/* =====================================================================
   js/forgeInstantsB.js — Les instants : mémoires, tours en plus, combats

   Lot F101. Ce que les instants d'EDHREC retiennent ou déplacent en route :
   - `Counter | RememberForCounter / RememberCounteredSA` : le sort
     contrecarré, ou chacun de ceux que `Defined$ ValidStack …` emporte, sort
     comme capacité (Tibalt's Trickery, Mana Sculpt, Glen Elendra's Answer) ;
   - `TriggerRemembered$CastTotalManaSpent` : le mana dépensé pour lancer ce
     sort contrecarré ;
   - `ChooseNumber | Random` ; `DigUntil | ImprintRevealed` ;
   - `Proliferate | RememberPut` puis `Phases | AnyNumber` (Ripples of
     Potential) : on retient qui a reçu un marqueur, puis on choisit lesquels
     disparaissent ;
   - `Convoked` : les créatures qui ont convoqué le sort (Lethal Scheme) ;
   - `Token | RememberOriginalTokens`, `ImmediateTrigger | TriggerAmount`
     (Faebloom Trick) ;
   - `Play | WithTotalCMC` : lancer des sorts dans la limite d'une valeur de
     mana totale (Invoke Calamity) ;
   - `Fight | ExcessSVar`, `DealDamage | ExcessDamageCondition` : l'excédent
     de blessures d'un combat (The Last Agni Kai, Ram Through) ;
   - `AddTurn | ExtraTurnDelayedTrigger` : un tour en plus qui porte un
     déclencheur retardé (Final Fortune).
   ===================================================================== */

/* —— Contrecarrer, et se souvenir de quoi ———————————————————————————— */

/* Un élément de la pile, qu'il soit un sort ou une capacité, retiré de la pile. */
function contreElement(P, it, env, dest) {
  const o = obj(P, it.id);
  if (it.capacite || !o) { retireDeLaPile(P, it.id); jn(P, 'Une capacité est contrecarrée'); return it.id; }
  if (incontrecarrable(P, o)) return null;
  P.lkis.set(o.id, {id: o.id, cid: o.cid, def: o.def, ctrl: o.ctrl, prop: o.prop, force: o.def.force, endurance: o.def.endurance, mots: o.def.mots,
    types: o.def.types, sousTypes: o.def.sousTypes, couleurs: o.def.couleurs, marq: {}, jeton: o.jeton, cmd: o.cmd, att: null, zone: 'pile', lki: true,
    caps: null, manaSort: o.manaSort, manaDe: o.manaDe, lance: o.lance, x: o.x || 0});
  retireDeLaPile(P, o.id);
  deplace(P, o.id, dest);
  emet(P, {t: 'contre', joueur: o.ctrl, cause: env.ctrl, lki: P.lkis.get(o.id)});
  jn(P, `${o.def.nom} est contrecarré`);
  return o.id;
}

/* « Spell.OppCtrl,Activated.OppCtrl,Triggered.OppCtrl » : l'élément de la pile répond-il à l'un des filtres ? */
function elementDePileValide(P, it, filtre, env) {
  return filtre.split(',').some(f => {
    const [genre, ...reste] = f.trim().split('.');
    const o = obj(P, it.id), sort = !it.capacite;
    if (genre === 'Spell' ? !sort : genre === 'Activated' ? (sort || 'evt' in it) : genre === 'Triggered' ? (sort || !('evt' in it)) : false) return false;
    if (it.id === (env.src && env.src.id)) return false;
    const r = reste.join('.');
    if (!r) return true;
    if (r === 'OppCtrl') return it.ctrl !== env.ctrl;
    if (r === 'YouCtrl') return it.ctrl === env.ctrl;
    return sort && !!o && forgeValideObjet(P, o, 'Card.' + r, env.src, env.ctrl, env);
  });
}

FORGE_API.Counter.gen = (g => function* (P, t, env) {
  const tout = /^ValidStack (.+)$/.exec(t.Defined || '');
  if (!tout && t.RememberForCounter !== 'True' && t.RememberCounteredSA !== 'True') return yield* g(P, t, env);
  if (tout) {
    const dest = zoneForge(t.Destination) || 'cimetiere';
    for (const it of P.pile.filter(x => elementDePileValide(P, x, tout[1], env))) {
      const id = contreElement(P, it, env, dest);
      if (id != null && t.RememberCounteredSA === 'True') retiensForge(env.ctx, id);
    }
    return;
  }
  const avant = objetsForge(P, t, env, 'Targeted').filter(o => o.zone === 'pile');
  yield* g(P, t, env);
  avant.filter(o => !P.pile.some(it => it.id === o.id)).forEach(o => retiensForge(env.ctx, o.id));
})(FORGE_API.Counter.gen);
forgeSait('param', 'Counter.RememberForCounter', 'Counter.RememberCounteredSA');
forgeSait('defini', 'ValidStack');

/* Le mana dépensé pour lancer le sort contrecarré : `caracForge()` le lit sur son instantané. */
forgeSait('expr', 'TriggerRemembered$CastTotalManaSpent');

/* —— Un nombre au hasard, une empreinte ——————————————————————————————— */

FORGE_API.ChooseNumber.gen = (g => function* (P, t, env) {
  if (t.Random !== 'True') return yield* g(P, t, env);
  const min = forgeNombre(P, t.Min || 0, env), max = forgeNombre(P, t.Max || 0, env);
  choixDe(P, env.src).nombre = min + entierHasard(P.rng, Math.max(min, max) - min + 1);
})(FORGE_API.ChooseNumber.gen);
forgeSait('param', 'ChooseNumber.Random');

/* Tout ce que la fouille a exilé, trouvé ou non, entre dans l'empreinte. */
FORGE_API.DigUntil.gen = (g => function* (P, t, env) {
  if (t.ImprintRevealed !== 'True') return yield* g(P, t, env);
  const vus = new Set(P.joueurs.flatMap(J => J.exil));
  yield* g(P, t, env);
  const l = empreinteDe(P, env.ctx, env.src);
  P.joueurs.forEach(J => J.exil.filter(id => !vus.has(id)).forEach(id => retiensEmpreinte(l, id)));
})(FORGE_API.DigUntil.gen);
forgeSait('param', 'DigUntil.ImprintRevealed');

/* —— Proliférer, puis faire disparaître quelques-uns de ceux qui ont reçu un marqueur ——— */

const totalMarqueurs = o => Object.values(o.marq || {}).reduce((s, n) => s + (n > 0 ? n : 0), 0);
FORGE_API.Proliferate.gen = (g => function* (P, t, env) {
  if (t.RememberPut !== 'True') return yield* g(P, t, env);
  const avant = new Map(P.champ.map(id => [id, totalMarqueurs(obj(P, id))]));
  yield* g(P, t, env);
  P.champ.filter(id => avant.has(id) && totalMarqueurs(obj(P, id)) > avant.get(id)).forEach(id => retiensForge(env.ctx, id));
})(FORGE_API.Proliferate.gen);
forgeSait('param', 'Proliferate.RememberPut');

/* Hors du champ sans le quitter, avec ce qui leur est attaché (js/forgeEffetsG.js `Phases`). */
function metsHorsPhase(P, l) {
  for (const o of l.filter(x => x.zone === 'champ' && !x.lki)) {
    [o, ...P.champ.map(id => obj(P, id)).filter(a => a.att === o.id)].forEach(a => {
      retireDe(P.champ, a.id);
      P.horsPhase = P.horsPhase || [];
      if (!P.horsPhase.some(x => x.id === a.id)) P.horsPhase.push({id: a.id, ctrl: a.ctrl});
    });
    P.ver++;
  }
}
FORGE_API.Phases.gen = (g => function* (P, t, env) {
  if (t.AnyNumber !== 'True') return yield* g(P, t, env);
  const l = (t.Defined ? forgeDefinis(P, t.Defined, env) : objetsForge(P, t, env, 'Targeted')).filter(o => o && o.j == null && o.zone === 'champ' && !o.lki);
  if (!l.length) return;
  const ids = yield* choisitCartes(P, env.ctrl, l.map(o => o.id), l.length, 'Mettre hors phase', 'cartes', 0);
  metsHorsPhase(P, ids.map(id => obj(P, id)).filter(Boolean));
})(FORGE_API.Phases.gen);
forgeSait('param', 'Phases.AnyNumber');

/* —— Les créatures qui ont convoqué ——————————————————————————————————— */

definisEtendus = (g => function (P, v, env) {
  if (v === 'Convoked') return ((env.src && env.src.convoquees) || []).map(id => obj(P, id)).filter(Boolean);
  return g(P, v, env);
})(definisEtendus);
forgeSait('defini', 'Convoked');

/* —— Des jetons, un déclencheur réflexe par paire ——————————————————————— */

/* Les jetons « d'origine » : ceux que le sort annonçait, sans ce que d'autres effets ont doublé. */
FORGE_API.Token.gen = (g => function* (P, t, env) {
  if (t.RememberOriginalTokens !== 'True') return yield* g(P, t, env);
  const m0 = env.ctx.memo.length, n = forgeNombre(P, t.TokenAmount || 1, env) * String(t.TokenScript || '').split(',').length;
  yield* g(P, {...t, RememberTokens: 'True'}, env);
  env.ctx.memo.length = Math.min(env.ctx.memo.length, m0 + n);
})(FORGE_API.Token.gen);
forgeSait('param', 'Token.RememberOriginalTokens');

FORGE_API.ImmediateTrigger.gen = (g => function* (P, t, env) {
  if (t.TriggerAmount == null) return yield* g(P, t, env);
  for (let k = forgeNombre(P, t.TriggerAmount, env); k > 0; k--) yield* g(P, t, env);
})(FORGE_API.ImmediateTrigger.gen);
forgeSait('param', 'ImmediateTrigger.TriggerAmount');

/* —— Lancer dans la limite d'une valeur de mana totale ———————————————————— */

FORGE_API.Play.gen = (g => function* (P, t, env) {
  if (t.WithTotalCMC == null) return yield* g(P, t, env);
  let reste = forgeNombre(P, t.WithTotalCMC, env);
  const j = env.ctrl, max = forgeNombre(P, t.Amount || 1, env), types = String(t.ValidSA || 'Spell').split(',').map(s => s.trim());
  for (let k = 0; k < max; k++) {
    const l = [].concat(...String(t.ValidZone || 'Hand').split(',').map(z => objetsZone(P, ZONES_FORGE[z.trim()] || 'main')))
      .filter(o => forgeValideObjet(P, o, t.Valid || 'Card', env.src, env.ctrl, env) && !estType(o, 'land') && mvDe(o) <= reste &&
        types.some(s => s === 'Spell' || forgeValideObjet(P, o, 'Card.' + s, env.src, env.ctrl, env)));
    if (!l.length) break;
    const [id] = yield* choisitCartes(P, j, l.map(o => o.id), 1, 'Jouer', 'cartes', 0);
    if (id == null) break;
    const mv = mvDe(obj(P, id));
    if (t.ReplaceGraveyard === 'Exile') obj(P, id)._exilApres = true;
    if (!(yield* lanceDepuisEffet(P, j, obj(P, id), t.WithoutManaCost === 'True'))) break;
    reste -= mv;
  }
})(FORGE_API.Play.gen);
forgeSait('param', 'Play.WithTotalCMC');

/* —— L'excédent de blessures ———————————————————————————————————————— */

/* « Si la source a la célérité de trample, le surplus va au contrôleur de la créature » (Ram Through). */
infligeAvecExces = (g => function (P, t, env, src, c, n) {
  if (t.ExcessDamage !== 'ThisTargetedController') return g(P, t, env, src, c, n);
  const ok = !t.ExcessDamageCondition || (src && forgeValideObjet(P, src, t.ExcessDamageCondition, env.src, env.ctrl, env));
  return g(P, {...t, ExcessDamage: ok ? 'TargetedController' : null}, env, src, c, n);
})(infligeAvecExces);
forgeSait('param', 'DealDamage.ExcessDamageCondition');

/* Un combat de créatures qui garde la somme dépassant la mort de l'adversaire (The Last Agni Kai). */
FORGE_API.Fight.gen = (g => function* (P, t, env) {
  if (!t.ExcessSVar) return yield* g(P, t, env);
  varsDe(env.ctx)[t.ExcessSVar] = 0;
  const miens = t.Defined ? forgeDefinis(P, t.Defined, env) : [], leurs = env.op.slot != null ? ciblesForge(P, env, false) : [];
  const tous = [...miens, ...leurs].filter(o => o && o.j == null && !o.lki && o.zone === 'champ' && estCreature(o));
  if (tous.length < 2 || tous[0].id === tous[1].id) return;
  const [a, b] = tous, la = letalPour(P, a), lb = letalPour(P, b);
  const fa = infligeDegats(P, a, b, car(P, a).force, false), fb = infligeDegats(P, b, a, car(P, b).force, false);
  /* L'excédent ne compte que sur la créature visée par la condition : ici celle d'un adversaire. */
  const v = varsDe(env.ctx);
  if (b.ctrl !== env.ctrl) v[t.ExcessSVar] += Math.max(0, fa - lb);
  if (a.ctrl !== env.ctrl) v[t.ExcessSVar] += Math.max(0, fb - la);
})(FORGE_API.Fight.gen);
forgeSait('param', 'Fight.ExcessSVar', 'Fight.ExcessSVarCondition');

/* —— Un tour en plus, et ce qui s'y passe ————————————————————————————— */

/* Le tour en plus porte son déclencheur retardé : la file garde un objet à la place du numéro du joueur, et
   `demarreTourEnPlus` le pose quand le tour commence (js/jeuPartie.js). */
FORGE_API.AddTurn.prepare = (t, op) => {
  if (!t.ExtraTurnDelayedTrigger) return true;
  if (t.SkipUntap) return false;
  const d = op.face.svars[t.ExtraTurnDelayedTrigger];
  if (!d || !t.ExtraTurnDelayedTriggerExecute) return false;
  op.declPerd = forgeTable(d);
  op.effetPerd = effetForge(op.face, forgeSousCapacite(op.face, t.ExtraTurnDelayedTriggerExecute), op.jetons);
  return !!op.effetPerd;
};
forgeSait('param', 'AddTurn.ExtraTurnDelayedTrigger', 'AddTurn.ExtraTurnDelayedTriggerExecute');
FORGE_API.AddTurn.gen = (g => function* (P, t, env) {
  if (!t.ExtraTurnDelayedTrigger) return yield* g(P, t, env);
  const n = forgeNombre(P, t.NumTurns || 1, env), op = env.op;
  for (const j of joueursForge(P, t, env)) for (let k = 0; k < n; k++)
    (P.toursEnPlus = P.toursEnPlus || []).push({j, perd: {t: op.declPerd, face: op.face, effet: op.effetPerd, src: env.src ? env.src.id : null, ctrl: env.ctrl,
      nom: env.src ? env.src.def.nom : '?', texte: op.declPerd.TriggerDescription || ''}});
})(FORGE_API.AddTurn.gen);

function demarreTourEnPlus(P, e) {
  if (!e || typeof e !== 'object' || !e.perd) return;
  durees(P).retardes.push({...e.perd, memo: [], memoJ: [], ceTour: true, lki: null, joueurCible: e.j});
}
