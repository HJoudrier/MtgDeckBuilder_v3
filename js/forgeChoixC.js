/* =====================================================================
   js/forgeChoixC.js — Choisir, défausser, répéter, sacrifier : ce que les
   scripts demandaient encore

   Lot F67 :
   - `ChooseType | ValidTypes$` (Eclipsed Realms, Cloud Key, Gollum) : choisir
     parmi une liste, types de créature ou de carte ;
   - `Discard | UnlessType$` (Thirst for Knowledge, Bandit's Talent) :
     « discard two cards unless you discard an artifact card » ; `Optional$`
     pour chaque joueur désigné, `RememberDiscardingPlayers$` (Snort, Will
     of the Jeskai) : ceux qui ont défaussé sont retenus ;
   - `RepeatEach | DefinedCards$` (Curse of the Swine, Terastodon),
     `ChooseOrder$`, `StartingWith$` : une boucle sur des objets désignés, dans
     l'ordre que choisit le joueur, en commençant par qui l'on dit ;
   - `ChooseCard` à plusieurs joueurs, `StartingWith$` (The Horus Heresy,
     Druid of Purification), `WithTotalPower$` (Slaughter the Strong) ;
   - `ChoosePlayer | Random$`, `GenericChoice | FallbackAbility$` (Torment
     of Hailfire : aucune offre n'est payable), `Sacrifice | StrictAmount$`,
     `ChangeNum$` et `ConditionNotPresent$` (Uro, Kroxa, Scorched Ruins).
   ===================================================================== */

/* Les joueurs dans l'ordre du tour, en commençant par `debut`. */
function joueursAPartirDe(P, liste, debut) {
  const tous = vivants(P).map(J => J.i), i = Math.max(0, tous.indexOf(debut));
  const ordre = [...tous.slice(i), ...tous.slice(0, i)];
  return ordre.filter(j => liste.includes(j));
}
const premierJoueur = (P, t, env) => t.StartingWith ? (forgeDefinis(P, t.StartingWith, env).map(x => joueurDe(x)).find(j => j != null) ?? env.ctrl) : env.ctrl;

/* —— Choisir un type dans une liste ———————————————————————————————————— */

FORGE_API.ChooseType.gen = (g => function* (P, t, env) {
  if (!t.ValidTypes) return yield* g(P, t, env);
  const j = joueursForge(P, t, env)[0];
  if (j == null) return;
  const options = t.ValidTypes.split(',').map(x => x.trim().toLowerCase()).filter(Boolean);
  /* L'IA prend le type qu'elle joue le plus. */
  const n = {};
  P.cartes.forEach(k => { if (k.prop === j) [...(k.def.sousTypes || []), ...(k.def.types || [])].forEach(x => { n[x] = (n[x] || 0) + 1; }); });
  const meilleur = options.map((x, i) => i).sort((a, b) => (n[options[b]] || 0) - (n[options[a]] || 0))[0];
  const i = yield* choisitUn(P, j, options.map(majuscule), 'Choisir un type', meilleur, env.ctx.source);
  choixDe(P, env.src).type = options[i];
})(FORGE_API.ChooseType.gen);
FORGE_API.ChooseType.prepare = (p => function (t, op) { return t.ValidTypes ? /^(Creature|Card)$/.test(t.Type) : (!p || p.call(this, t, op)); })(FORGE_API.ChooseType.prepare);
forgeSait('param', 'ChooseType.ValidTypes');

/* —— Défausser ————————————————————————————————————————————————————— */

const defausseSpecifique = t => t.UnlessType || t.Optional === 'True' || t.RememberDiscardingPlayers === 'True';
FORGE_API.Discard.optionnel = true;
FORGE_API.Discard.gen = (g => function* (P, t, env) {
  if (!defausseSpecifique(t)) return yield* g(P, t, env);
  const n = forgeNombre(P, t.NumCards || 1, env);
  for (const j of joueursForge(P, t, env)) {
    if (t.Optional === 'True' && (yield question(P, j, 'oui', ['non', 'oui'], {texte: 'Défausser ?', source: env.ctx.source})) !== 1) continue;
    const main = P.joueurs[j].main.slice();
    let ids = null;
    /* « Unless you discard an artifact card » : une carte du type remplace les autres. */
    if (t.UnlessType && t.Mode !== 'Hand') {
      const types = main.filter(id => forgeValideObjet(P, obj(P, id), t.UnlessType, env.src, j, env));
      if (types.length && (yield question(P, j, 'oui', ['non', 'oui'], {texte: 'Défausser une carte (' + t.UnlessType + ') à la place ?', source: env.ctx.source, defaut: 1})) === 1) {
        ids = yield* choisitCartes(P, j, types, 1, 'Défausser', 'defausse');
      }
    }
    if (!ids) ids = t.Mode === 'Hand' ? main : t.Mode === 'Random' ? melangeHasard(P.rng, main.slice()).slice(0, n) : yield* choisitCartes(P, j, main, n, 'Défausser', 'defausse');
    ids.forEach(id => { const nid = defausseCarte(P, id, j); if (t.RememberDiscarded === 'True') retiensForge(env.ctx, nid); });
    if (t.RememberDiscardingPlayers === 'True' && ids.length) retiensForge(env.ctx, {j});
  }
})(FORGE_API.Discard.gen);
FORGE_API.Discard.prepare = (p => function (t, op) {
  if (defausseSpecifique(t) && !/^(Hand|TgtChoose|Random)?$/.test(t.Mode || '')) return false;
  return !p || p.call(this, t, op);
})(FORGE_API.Discard.prepare);
forgeSait('param', 'Discard.UnlessType', 'Discard.RememberDiscardingPlayers', 'Discard.Optional');

/* —— Répéter sur des objets désignés, dans un ordre ————————————————————— */

FORGE_API.RepeatEach.gen = (g => function* (P, t, env) {
  if (!t.DefinedCards && !t.ChooseOrder && !t.StartingWith) return yield* g(P, t, env);
  const ctx = env.ctx;
  let items;
  if (t.RepeatPlayers) {
    const js = forgeDefinis(P, t.RepeatPlayers, env).map(x => joueurDe(x)).filter(x => x != null);
    items = joueursAPartirDe(P, js, premierJoueur(P, t, env)).map(j => ({j}));
  } else if (t.DefinedCards) {
    items = forgeDefinis(P, t.DefinedCards, env).filter(x => x && x.j == null).map(o => ({id: o.id}));
  } else {
    items = objetsZone(P, ZONES_FORGE[t.Zone || 'Battlefield'] || 'champ').filter(o => forgeValideObjet(P, o, t.RepeatCards, env.src, env.ctrl, env)).map(o => ({id: o.id}));
  }
  /* `ChooseOrder$` : le joueur désigné range les cartes dans l'ordre qu'il veut. */
  if (t.ChooseOrder && items.length > 1 && items[0].id != null) {
    const qui = t.ChooseOrder === 'True' ? env.ctrl : (forgeDefinis(P, t.ChooseOrder, env).map(x => joueurDe(x)).find(j => j != null) ?? env.ctrl);
    let reste = items.map(x => x.id);
    const rangees = [];
    while (reste.length > 1) {
      const [pris] = yield* choisitCartes(P, qui, reste, 1, 'Choisir la suivante', 'cartes', 1);
      rangees.push(pris != null ? pris : reste[0]);
      reste = reste.filter(id => id !== rangees[rangees.length - 1]);
    }
    items = [...rangees, ...reste].map(id => ({id}));
  }
  for (const x of items) {
    const l = x.j != null ? ctx.memoJ : t.UseImprinted === 'True' ? empreinteDe(P, ctx, env.src) : ctx.memo, v = x.j != null ? x.j : x.id;
    const ajoute = !l.includes(v);
    if (ajoute) l.push(v);
    try { yield* joueSous(P, env, t.RepeatSubAbility); }
    finally { const i = ajoute ? l.indexOf(v) : -1; if (i >= 0) l.splice(i, 1); }
    if (P.fin) return;
  }
})(FORGE_API.RepeatEach.gen);
FORGE_API.RepeatEach.prepare = (p => (t, op) => t.DefinedCards ? !!t.RepeatSubAbility && sousEffets(op, [t.RepeatSubAbility]) : (!p || p(t, op)))(FORGE_API.RepeatEach.prepare);
forgeSait('param', 'RepeatEach.DefinedCards', 'RepeatEach.ChooseOrder', 'RepeatEach.StartingWith');

/* —— Choisir des cartes, chacun à son tour ————————————————————————————— */

/* « Each player chooses… », `StartingWith$ You` : chacun choisit sa part, en
   commençant par qui l'on dit ; les choix s'additionnent dans `ChosenCard`.
   `WithTotalPower$ 4` : autant de créatures qu'on veut, de force totale au
   plus 4 — l'IA garde les plus fortes qui tiennent. */
FORGE_API.ChooseCard.gen = (g => function* (P, t, env) {
  const joueurs = t.Defined || t.ControlledByPlayer ? joueursForge(P, t, env) : [];
  if (!t.StartingWith && !t.WithTotalPower && !(joueurs.length > 1 && !t.ControlledByPlayer)) return yield* g(P, t, env);
  const src = env.src, tous = [], zone = ZONES_FORGE[t.ChoiceZone] || 'champ';
  const ordre = joueursAPartirDe(P, joueurs.length ? joueurs : [env.ctrl], premierJoueur(P, t, env));
  const limite = t.WithTotalPower != null ? forgeNombre(P, t.WithTotalPower, env) : null;
  for (const j of ordre) {
    const filtre = t.ControlledByPlayer ? String(t.Choices || 'Card').split(',').map(c => c.trim() + (c.includes('.') ? '+YouCtrl' : '.YouCtrl')).join(',') : (t.Choices || 'Card');
    const ctrl = t.ControlledByPlayer ? j : env.ctrl;
    const ids = objetsZone(P, zone).filter(o => forgeValideObjet(P, o, filtre, env.src, ctrl, env) && (limite == null || o.ctrl === j)).map(o => o.id);
    let pris;
    if (limite != null) {
      const force = id => car(P, obj(P, id)).force, tri = ids.slice().sort((a, b) => force(b) - force(a));
      let somme = 0; const gloutons = [];
      tri.forEach(id => { if (somme + force(id) <= limite) { somme += force(id); gloutons.push(id); } });
      const r = ids.length ? yield question(P, j, 'cartes', ids, {min: 0, max: ids.length, multi: true, texte: `Choisir des créatures, de force totale ${limite} au plus`,
        defaut: gloutons.map(id => ids.indexOf(id)), source: env.ctx.source}) : [];
      pris = (Array.isArray(r) ? r : [r]).map(i => ids[i]).filter(x => x != null);
      let total = 0;
      pris = pris.filter(id => (total += force(id)) <= limite);
    } else {
      const n = forgeNombre(P, t.Amount || 1, env), libre = t.Optional === 'True' || t.Mandatory !== 'True' && /Optional/.test(t.Optional || '');
      pris = yield* choisitCartes(P, j, ids, n, t.ChoiceTitle || 'Choisir', 'cartes', libre ? 0 : n);
    }
    tous.push(...pris);
  }
  if (src) choixDe(P, src).cartes = tous;
  if (t.RememberChosen === 'True') tous.forEach(id => retiensForge(env.ctx, id));
})(FORGE_API.ChooseCard.gen);
forgeSait('param', 'ChooseCard.StartingWith', 'ChooseCard.WithTotalPower', 'ChooseCard.ChoiceTitle', 'ChooseCard.Optional');

/* —— Un joueur au hasard, une offre qu'on ne peut pas payer ———————————— */

FORGE_API.ChoosePlayer.gen = (g => function* (P, t, env) {
  if (t.Random !== 'True') return yield* g(P, t, env);
  const cands = vivants(P).map(J => J.i).filter(x => !t.Choices || forgeValideJoueur(P, x, t.Choices, env.ctrl, env));
  if (!cands.length) return;
  choixDe(P, env.src).joueur = cands[entierHasard(P.rng, cands.length)];
})(FORGE_API.ChoosePlayer.gen);
forgeSait('param', 'ChoosePlayer.Random');

/* « Unless that player sacrifices a nonland permanent or discards a card » :
   quand aucune des offres ne se paie, `FallbackAbility$` s'applique. */
FORGE_API.GenericChoice.prepare = (p => function (t, op) {
  if (!p.call(this, t, op)) return false;
  if (t.FallbackAbility) {
    const sub = forgeSousCapacite(op.face, t.FallbackAbility), effet = sub && effetForge(op.face, sub, op.jetons);
    if (!effet || effet.cibles.length || effet.modes) return false;
    op.repli = effet.ops;
  }
  return true;
})(FORGE_API.GenericChoice.prepare);
FORGE_API.GenericChoice.gen = (g => function* (P, t, env) {
  if (t.FallbackAbility && env.op.repli) {
    const j = joueursForge(P, t, env)[0];
    const paie = m => {
      const t0 = m.effet.ops[0] && m.effet.ops[0].t;
      if (!t0 || !t0.UnlessCost) return true;
      const c = coutForge(t0.UnlessCost), autre = c && autresCout(c.cout);
      return !!c && !!planPaiement(P, j, c.cout.mana, 0) && (!autre || coutAutrePossible(P, j, {id: -1, zone: '', marq: {}}, autre));
    };
    if (j != null && !env.op.modes.some(paie)) return yield* executeOps(P, env.op.repli, env.ctx);
  }
  yield* g(P, t, env);
})(FORGE_API.GenericChoice.gen);
forgeSait('param', 'GenericChoice.FallbackAbility');

/* —— Détruire, sacrifier ———————————————————————————————————————————— */

FORGE_API.DestroyAll.prepare = (p => (t, op) => (!t.Zone || t.Zone === 'Battlefield') && (!p || p(t, op)))(FORGE_API.DestroyAll.prepare);
forgeSait('param', 'DestroyAll.Zone');

/* `ChangeNum$` dit ce que `Amount$` dit ; `StrictAmount$` : tout ou rien, sacrifier moins n'est pas permis. */
FORGE_API.Sacrifice.gen = (g => function* (P, t, env) {
  const u = t.ChangeNum && !t.Amount ? {...t, Amount: t.ChangeNum} : t;
  if (u.StrictAmount !== 'True') return yield* g(P, u, env);
  const n = forgeNombre(P, u.Amount || 1, env), v = u.SacValid || 'Permanent';
  for (const j of joueursForge(P, u, env)) {
    const dispo = champDe(P, j).filter(o => forgeValideObjet(P, o, v, env.src, env.ctrl, env));
    env.ctx.nombre = 0;
    if (dispo.length < n) continue;
    yield* g(P, u, {...env, ctrl: env.ctrl});
    env.ctx.nombre = n;
  }
})(FORGE_API.Sacrifice.gen);
forgeSait('param', 'Sacrifice.ChangeNum', 'Sacrifice.StrictAmount');

/* « Sacrifice it unless it escaped » : la condition de la capacité (`ConditionNotPresent$`). */
conditionForge = (g => function (P, t, env) {
  if (t.ConditionNotPresent) {
    const zone = ZONES_FORGE[t.ConditionZone] || 'champ';
    if (objetsZone(P, zone).some(o => forgeValideObjet(P, o, t.ConditionNotPresent, env.src, env.ctrl, env))) return false;
  }
  return g(P, t, env);
})(conditionForge);
forgeSait('param', 'Sacrifice.ConditionNotPresent');
