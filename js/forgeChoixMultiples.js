/* =====================================================================
   js/forgeChoixMultiples.js — Choisir à plusieurs, en plusieurs fois

   Ce que demandaient quelques cartes (lot F51) :
   - chaque joueur choisit l'un de ses permanents (`ControlledByPlayer$
     Chooser`, Consuming Tide), et le compte des adversaires qui ont plus
     de cartes en main ;
   - prendre une carte de chaque sorte dans le dessus de chaque
     bibliothèque (`DigMultiple`, Explore the Vastlands) ;
   - retirer des marqueurs pris parmi plusieurs permanents (`Choices$`,
     Sensational Spider-Man) ;
   - une copie qui n'est pas légendaire (`NonLegendary$`, Shuri, Wakandan
     Inventor).
   ===================================================================== */

/* —— Chacun choisit parmi les siens ——————————————————————————————————— */

/* « Each player chooses a nonland permanent they control » : le choix est
   rejoué pour chaque joueur désigné, qui y tient le rôle de « You » ; les
   choix s'additionnent, puis `ChosenCard` les lit tous. */
FORGE_API.ChooseCard.gen = (g => function* (P, t, env) {
  if (!t.ControlledByPlayer) return yield* g(P, t, env);
  const src = env.src, tous = [];
  const choix = String(t.Choices || 'Card').split(',').map(c => c.trim() + (c.includes('.') ? '+YouCtrl' : '.YouCtrl')).join(',');
  for (const j of joueursForge(P, t, env)) {
    if (src) choixDe(P, src).cartes = [];
    yield* g(P, {...t, ControlledByPlayer: undefined, Defined: 'You', Choices: choix}, {...env, ctrl: j});
    if (src) tous.push(...(choixDe(P, src).cartes || []));
  }
  if (src) choixDe(P, src).cartes = tous;
})(FORGE_API.ChooseCard.gen);
FORGE_API.ChooseCard.prepare = (p => function (t, op) {
  if (t.ControlledByPlayer && !/^(Chooser|You|Remembered)$/.test(t.ControlledByPlayer)) return false;
  return p ? p.call(this, t, op) : true;
})(FORGE_API.ChooseCard.prepare);

/* « For each opponent who has more cards in hand than you » :
   `HasPropertyHasCardsInHand_Card_GTY`, le filtre puis le seuil. */
compteJoueurs = (g => function (P, tete, q, env) {
  const m = /^HasPropertyHasCardsIn(Hand|Graveyard)_([^_]+)(?:_(.+))?$/.exec(q);
  if (!m) return g(P, tete, q, env);
  const qui = tete === 'PlayerCountOpponents' ? adversaires(P, env.ctrl) : vivants(P).map(J => J.i);
  const zone = m[1] === 'Hand' ? 'main' : 'cimetiere';
  return qui.filter(i => seuilForge(P, P.joueurs[i][zone].filter(id => forgeValideObjet(P, obj(P, id), m[2], env.src, env.ctrl, env)).length, m[3] || 'GE1', env)).length;
})(compteJoueurs);

/* —— Une carte de chaque sorte ———————————————————————————————————————— */

/* Chez Forge, `Spell` hors de la pile est un éphémère ou un rituel (une
   aura aussi, hors du champ : `!Aura` l'écarte d'ordinaire). */
const sortHorsPile = v => /^Spell(\.|$)/.test(v) ? ['Instant', 'Sorcery'].map(x => x + v.slice(5)) : [v];

/* « Each player looks at the top five cards of their library and may
   reveal a land card and/or an instant or sorcery card from among them » :
   au plus une carte par morceau de `ChangeValid$`, en main ; le reste
   dessous, dans un ordre aléatoire. */
forgeEffet('DigMultiple', ['DigNum', 'ChangeValid', 'Optional', 'DestinationZone', 'DestinationZone2', 'LibraryPosition2'], function* (P, t, env) {
  const n = forgeNombre(P, t.DigNum || 1, env);
  for (const j of joueursForge(P, t, env)) {
    const B = P.joueurs[j].bibliotheque, dessus = B.slice(-n).reverse(), pris = [];
    if (!dessus.length) continue;
    for (const v of String(t.ChangeValid || 'Card').split(',').map(x => x.trim()).filter(Boolean)) {
      const valides = sortHorsPile(v);
      const ok = dessus.filter(id => !pris.includes(id) && valides.some(w => forgeValideObjet(P, obj(P, id), w, env.src, env.ctrl, env)));
      if (!ok.length) continue;
      pris.push(...(yield* choisitCartes(P, j, ok, 1, 'Prendre', 'cartes', t.Optional === 'True' ? 0 : 1)));
    }
    for (const id of pris) yield* deplaceForge(P, obj(P, id), 'main', env, {});
    const reste = dessus.filter(id => !pris.includes(id));
    if (t.RestRandomOrder === 'True') melangeHasard(P.rng, reste);
    reste.forEach(id => { retireDe(B, id); B.unshift(id); });
    P.ver++;
  }
}, (t, op) => { op.op = 'cherche'; op.n = 1; op.hostile = false; op.desc = {types: []}; },
{prepare: t => (!t.DestinationZone || t.DestinationZone === 'Hand') && (!t.DestinationZone2 || t.DestinationZone2 === 'Library')
  && (!t.LibraryPosition2 || t.LibraryPosition2 === '-1') && !t.ChooseAmount && !t.ChosenZone && !t.ChangeLater});
forgeSait('param', 'DigMultiple.RestRandomOrder');

/* —— Des marqueurs pris parmi plusieurs permanents ————————————————————— */

/* « Remove up to three stun counters from among all permanents » : un
   marqueur à la fois sur un permanent choisi (`CounterNumShared$`), ou N
   sur un seul ; le total va au nombre retenu (`RememberAmount$`). */
FORGE_API.RemoveCounter.gen = (g => function* (P, t, env) {
  if (!t.Choices) return yield* g(P, t, env);
  const genre = genreMarqueur(t.CounterType), libre = t.ChoiceOptional === 'True' || t.UpTo === 'True';
  const porteurs = () => P.champ.map(id => obj(P, id)).filter(o => o && (o.marq[genre] || 0) > 0 && forgeValideObjet(P, o, t.Choices, env.src, env.ctrl, env)).map(o => o.id);
  let total = 0;
  if (t.CounterNumShared === 'True') {
    const n = forgeNombre(P, t.CounterNum || 1, env);
    while (total < n) {
      const ids = porteurs();
      if (!ids.length) break;
      const [id] = yield* choisitCartes(P, env.ctrl, ids, 1, 'Retirer un marqueur', 'cartes', libre ? 0 : 1);
      if (id == null) break;
      obj(P, id).marq[genre]--; total++; P.ver++;
    }
  } else {
    const ids = porteurs();
    const [id] = ids.length ? yield* choisitCartes(P, env.ctrl, ids, 1, 'Retirer des marqueurs', 'cartes', libre ? 0 : 1) : [];
    const o = id != null ? obj(P, id) : null;
    if (o) {
      const k = Math.min(o.marq[genre] || 0, t.CounterNum === 'Any' || t.CounterNum === 'All' ? Infinity : forgeNombre(P, t.CounterNum || 1, env));
      o.marq[genre] -= k; total += k; P.ver++;
    }
  }
  if (t.RememberAmount === 'True') env.ctx.nombre = total;
})(FORGE_API.RemoveCounter.gen);
FORGE_API.RemoveCounter.prepare = (p => function (t, op) {
  if (t.Choices && (!t.CounterType || t.CounterType === 'Any')) return false;
  return p ? p.call(this, t, op) : true;
})(FORGE_API.RemoveCounter.prepare);
forgeSait('param', ...['Choices', 'ChoiceOptional', 'CounterNumShared', 'UpTo', 'RememberAmount'].map(p => 'RemoveCounter.' + p));

/* —— Une cible chez le joueur du déclencheur ——————————————————————————— */

/* « Tap target creature defending player controls » : `ControlledBy
   TriggeredDefendingPlayer` dans `ValidTgts$` ne se juge qu'avec
   l'évènement, que le choix des cibles n'a pas sous la main. On le
   réécrit en `TargetsWithDefinedController$`, que js/forgeEntrees.js
   `candidatsDuControleur()` juge avec lui. */
const CTRL_DECLENCHEUR = /(?:\.ControlledBy (TriggeredDefendingPlayer|TriggeredPlayer|ParentTarget)\+|[.+]ControlledBy (TriggeredDefendingPlayer|TriggeredPlayer|ParentTarget)\b)/;
emplacementForge = (g => function (t, face) {
  if (t.TargetsWithDefinedController || !t.ValidTgts) return g(t, face);
  const parts = String(t.ValidTgts).split(',').map(x => x.trim()), ms = parts.map(x => CTRL_DECLENCHEUR.exec(x));
  if (!ms.every(Boolean)) return g(t, face);
  const qui = new Set(ms.map(m => m[1] || m[2]));
  if (qui.size !== 1) return g(t, face);
  const valid = parts.map(x => x.replace(CTRL_DECLENCHEUR, m => m.endsWith('+') ? '.' : '')).join(',');
  return g({...t, ValidTgts: valid, TargetsWithDefinedController: [...qui][0]}, face);
})(emplacementForge);

/* —— Une copie qui n'est pas légendaire ———————————————————————————————— */

/* « Except it isn't legendary » : la copie perd le surtype, comme celle
   de `CopyPermanent` (js/forgeEffetsF.js). */
FORGE_API.Clone.gen = (g => function* (P, t, env) {
  yield* g(P, t, env);
  if (t.NonLegendary !== 'True') return;
  const c = forgeDefinis(P, t.CloneTarget || t.Defined || 'Self', env).find(x => x && x.j == null && !x.lki && x.zone === 'champ');
  if (c && c.copie && c.def.supers.includes('legendary')) { c.def = {...c.def, supers: c.def.supers.filter(s => s !== 'legendary')}; P.ver++; }
})(FORGE_API.Clone.gen);
/* « Target artifact becomes a copy of a second target artifact » : le
   modèle est ciblé, `CloneTarget$` dit ce qui devient sa copie
   (js/forgeEntrees.js). */
FORGE_API.Clone.prepare = (p => (t, op) => p(t, op) || (!!t.CloneTarget && !/^Valid /.test(t.CloneTarget) && op.slot != null && p(t, {...op, slot: null})))(FORGE_API.Clone.prepare);
forgeSait('param', 'Clone.NonLegendary', 'ChooseCard.ControlledByPlayer');
forgeSait('expr', 'PlayerCountOpponents$HasPropertyHasCardsInHand', 'PlayerCountOpponents$HasPropertyHasCardsInGraveyard',
  'PlayerCountPlayers$HasPropertyHasCardsInHand', 'PlayerCountPlayers$HasPropertyHasCardsInGraveyard');
