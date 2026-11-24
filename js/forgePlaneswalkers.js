/* =====================================================================
   js/forgePlaneswalkers.js — Des planeswalkers, un à un

   Lot F100. Chaque planeswalker qui n'était pas lu entièrement portait sa
   propre phrase ; ce fichier les range par ce qu'elles demandent.

   - Un sens autour de la table (`ChooseDirection`, Aminatou, Teyo) : gauche
     ou droite, retenu par la carte ; Aminatou fait passer les permanents
     d'un joueur au suivant (`GainControlVariant | ChangeController$
     NextPlayerInChosenDirection`), Teyo n'autorise d'attaquer que le plus
     proche adversaire dans ce sens (`DefenderNotNearestToYouInChosenDirection`) ;
   - un choix qui n'est pas une cible (`DealDamage | CardChoices$ | PlayerChoices$`,
     Comet) ;
   - les cibles d'un sort qu'on vient de lancer (`TriggeredSpellAbilityTargets`,
     l'emblème de Dack Fayden) ;
   - un marqueur de mot-clé choisi dans une liste (`CounterTypes$ …,ChosenFromList |
     TypeList$`, Elspeth Resplendent), et des marqueurs sur ce que `Dig` met en
     jeu (`WithCounters$`) ; le marqueur de bouclier protège de la destruction
     et des dégâts, une fois ;
   - ce qu'une carte est hors du champ (`ExcludeZone$ Battlefield`, Grist).
   ===================================================================== */

/* —— Gauche ou droite ———————————————————————————————————————————— */

/* Le joueur suivant dans ce sens (+1 : gauche, −1 : droite), en passant les éliminés. */
function voisinDansLeSens(P, j, sens) {
  const n = P.joueurs.length;
  let k = j;
  for (let i = 0; i < n; i++) { k = (k + sens + n) % n; if (!P.joueurs[k].elimine) return k; }
  return j;
}

forgeEffet('ChooseDirection', [], function* (P, t, env) {
  const i = yield* choisitUn(P, env.ctrl, ['Gauche', 'Droite'], 'Choisir un sens', 0, env.ctx.source);
  choixDe(P, env.src).sens = i === 0 ? 1 : -1;
  jn(P, `${P.joueurs[env.ctrl].nom} choisit la ${i === 0 ? 'gauche' : 'droite'}`);
}, (t, op) => { op.op = 'forge'; op.hostile = false; });

/* « Each player gains control of all nonland permanents controlled by the next player in the chosen direction » : le permanent d'un
   joueur passe à celui dont il est le suivant. Tout se fait d'un coup. */
FORGE_API.GainControlVariant.prepare = (p => (t, op) => t.ChangeController === 'NextPlayerInChosenDirection' ? !!t.AllValid : p(t, op))(FORGE_API.GainControlVariant.prepare);
FORGE_API.GainControlVariant.gen = (g => function* (P, t, env) {
  if (t.ChangeController !== 'NextPlayerInChosenDirection') return yield* g(P, t, env);
  const sens = choixDe(P, env.src).sens || 1;
  const l = objetsZone(P, 'champ').filter(o => forgeValideObjet(P, o, t.AllValid, env.src, env.ctrl, env)).map(o => [o, voisinDansLeSens(P, o.ctrl, -sens)]);
  l.forEach(([o, j]) => { o.ctrl = j; o.pret = false; P.ver++; });
})(FORGE_API.GainControlVariant.gen);
forgeSait('param', 'GainControlVariant.AllValid', 'GainControlVariant.ChangeController');

/* Teyo : chaque joueur n'attaque que son plus proche adversaire dans le sens choisi, et ses planeswalkers. */
limiteAttaquants = (g => function (P, choisis) {
  g(P, choisis);
  for (const x of statiquesMode(P, 'CantAttack')) {
    if (!x.s.t.DefenderNotNearestToYouInChosenDirection) continue;
    const sens = choixDe(P, x.src).sens || 1;
    for (const [id, d] of [...choisis]) {
      const o = obj(P, id), def = d.j != null ? d.j : (obj(P, d.pw) || {}).ctrl;
      if (o && def != null && def !== voisinDansLeSens(P, o.ctrl, sens)) choisis.delete(id);
    }
  }
})(limiteAttaquants);
forgeSait('param', 'CantAttack.DefenderNotNearestToYouInChosenDirection');

/* —— Un choix qui n'est pas une cible ————————————————————————————— */

/* « Deals damage equal to … to a creature or player » : le choix se fait à la résolution (`CardChoices$ Creature | PlayerChoices$ Player`). */
FORGE_API.DealDamage.gen = (g => function* (P, t, env) {
  if (!t.CardChoices && !t.PlayerChoices) return yield* g(P, t, env);
  const cands = [];
  if (t.CardChoices) objetsZone(P, 'champ').filter(o => forgeValideObjet(P, o, t.CardChoices, env.src, env.ctrl, env)).forEach(o => cands.push({o, nom: o.def.nom, hostile: o.ctrl !== env.ctrl}));
  if (t.PlayerChoices) P.joueurs.filter(J => !J.elimine).forEach(J => cands.push({j: J.i, nom: J.nom, hostile: J.i !== env.ctrl}));
  if (!cands.length) return;
  const pref = Math.max(0, cands.findIndex(c => c.hostile));
  const i = yield* choisitUn(P, env.ctrl, cands.map(c => c.nom), 'Choisir qui subit les dégâts', pref, env.ctx.source);
  const c = cands[i] || cands[0], n = forgeNombre(P, t.NumDmg || 0, env);
  infligeAvecExces(P, t, env, sourceDegats(P, t, env), c.o || {j: c.j}, n);
})(FORGE_API.DealDamage.gen);
forgeSait('param', 'DealDamage.CardChoices', 'DealDamage.PlayerChoices');

/* —— Les cibles du sort lancé ——————————————————————————————————— */

forgeDefinis = (g => function (P, val, env) {
  if (String(val || '').trim() === 'TriggeredSpellAbilityTargets') {
    const e = (env.ctx || {}).evt || {};
    return e.t === 'lance' && e.id != null ? ciblesDuSort(P, e.id) : [];
  }
  return g(P, val, env);
})(forgeDefinis);
forgeSait('defini', 'TriggeredSpellAbilityTargets');

/* —— Un marqueur de mot-clé choisi dans une liste ——————————————————————— */

FORGE_API.PutCounter.gen = (g => function* (P, t, env) {
  if (!t.CounterTypes || !/ChosenFromList/.test(t.CounterTypes)) return yield* g(P, t, env);
  const liste = String(t.TypeList || '').split(',').map(x => x.trim()).filter(Boolean);
  const fixes = String(t.CounterTypes).split(',').map(x => x.trim()).filter(x => x !== 'ChosenFromList');
  /* Une seule cible, ou aucune : sans elle rien n'est posé, et rien n'est demandé. */
  const cible = objetsForge(P, t, env, 'Targeted').find(o => o && o.zone === 'champ' && !o.lki);
  if (!cible) return;
  const i = liste.length > 1 ? yield* choisitUn(P, env.ctrl, liste, 'Choisir un marqueur', 0, env.ctx.source) : 0;
  for (const ty of [...fixes, liste[i]]) yield* g(P, {...t, CounterTypes: undefined, TypeList: undefined, CounterType: ty}, env);
})(FORGE_API.PutCounter.gen);
forgeSait('param', 'PutCounter.TypeList');

/* —— Le bouclier ———————————————————————————————————————————————— */

/* « If a permanent with a shield counter would be dealt damage or destroyed, remove a shield counter from it instead. » */
detruitObjet = (g => function (P, o, sansRegen) {
  if (o && o.marq && o.marq.shield > 0) { o.marq.shield--; P.ver++; return; }
  return g(P, o, sansRegen);
})(detruitObjet);
degatsApresPrevention = (g => function (P, src, cible, n, combat) {
  if (cible && cible.j == null && cible.marq && cible.marq.shield > 0 && n > 0) { cible.marq.shield--; P.ver++; return 0; }
  return g(P, src, cible, n, combat);
})(degatsApresPrevention);

/* —— Ce qu'une carte est hors du champ ————————————————————————————— */

/* « As long as ~ isn't on the battlefield, it's a 1/1 Insect creature » (Grist) : une définition de plus, que `animation()` lit hors du champ. */
statiqueForge = (g => function (face, t, jetons) {
  if (t.Mode === 'Continuous' && t.ExcludeZone === 'Battlefield' && t.CharacteristicDefining === 'True' && t.Affected === 'Card.Self') {
    const ty = typesForge(String(t.AddType || ''));
    return {s: 'horsChamp', types: ty.types, sousTypes: ty.sousTypes, force: +t.SetPower, endurance: +t.SetToughness};
  }
  return g(face, t, jetons);
})(statiqueForge);
forgeSait('param', 'Continuous.ExcludeZone');

animation = (g => function (o) {
  const r = g(o);
  if (o.zone === 'champ' || !o.def || !o.def.statiques) return r;
  const h = o.def.statiques.find(s => s.s === 'horsChamp');
  return h ? {...r, types: [...new Set([...r.types, ...h.types])], sousTypes: [...r.sousTypes, ...h.sousTypes], force: h.force, endurance: h.endurance} : r;
})(animation);

/* —— Attaquer en payant de la vie ———————————————————————————————————— */

/* « Creatures can't attack you … unless their controller pays 2 life for each of those creatures » (Sivitri, Dragon Master). */
function taxeVieAttaque(P, o, def) {
  let n = 0;
  for (const x of statiquesMode(P, 'CantAttackUnless')) {
    const t = x.s.t, env = envStatique(x.src, x.s), m = /^PayLife<(\d+)>$/.exec(t.Cost || '');
    if (!m || !objetOuRien(P, o, t.ValidCard, x.src, env) || !defenseurVise(P, def, t.Target, x.src, env) || !conditionForge(P, t, env)) continue;
    n += +m[1];
  }
  return n;
}

paieTaxesAttaque = (g => function* (P, j, choisis) {
  yield* g(P, j, choisis);
  const taxes = [...choisis].map(([id, def]) => [id, taxeVieAttaque(P, obj(P, id), def)]).filter(x => x[1] > 0).sort((a, b) => a[1] - b[1]);
  if (!taxes.length) return;
  let total = taxes.reduce((s, x) => s + x[1], 0);
  /* On ne paie pas plus de vie qu'on n'en a : les attaquants les plus chers restent à terre. */
  while (taxes.length && total >= P.joueurs[j].vie) { const [id, n] = taxes.pop(); choisis.delete(id); total -= n; }
  if (!taxes.length) return;
  const r = yield question(P, j, 'oui', ['non', 'oui'], {texte: `Payer ${total} PV pour attaquer ?`, extra: {taxeAttaque: total}});
  if (r === 1 && !payerVieInterdit(P, j)) { payeVie(P, j, total, false); jn(P, `${P.joueurs[j].nom} paie ${total} PV pour attaquer`); return; }
  taxes.forEach(([id]) => choisis.delete(id));
})(paieTaxesAttaque);

/* —— « Une capacité d'artefact coûte moins cher » ——————————————————————— */

/* Tezzeret, Betrayer of Flesh : la première capacité activée d'un artefact qu'on contrôle chaque tour coûte {2} de moins. */
const reduitCapaciteTenable = t => t.Type === 'Ability' && /^Activated(\.YouCtrl)?$/.test(t.ValidSpell || '') && /^\d+$/.test(t.Amount || '') && (!t.AffectedZone || t.AffectedZone === 'Battlefield');

capaciteReduite = (g => function (P, j, o, k) {
  const r = g(P, j, o, k);
  if (!k.cout || !k.cout.mana || k.genre === 'mana' || k.genre === 'loyaute') return r;
  let n = 0;
  for (const x of statiquesMode(P, 'ReduceCost')) {
    const t = x.s.t, env = envStatique(x.src, x.s);
    if (!reduitCapaciteTenable(t) || (t.ValidSpell === 'Activated.YouCtrl' && j !== x.src.ctrl) || !objetOuRien(P, o, t.ValidCard, x.src, env) || !conditionForge(P, t, env)) continue;
    n += +t.Amount;
  }
  n = Math.min(n, r.cout.mana.generique || 0);
  return n ? {...r, cout: {...r.cout, mana: moinsMana(r.cout.mana, {generique: n, couleurs: {}})}} : r;
})(capaciteReduite);
forgeSait('param', 'ReduceCost.ValidSpell', 'ReduceCost.AffectedZone');

/* —— Ne pas défausser ——————————————————————————————————————————— */

/* « Spells and abilities your opponents control can't cause you to discard cards » (Tamiyo, Collector of Tales) : la cause est qui résout en ce moment. */
forgeStatique('CantDiscard', ['ValidPlayer', 'ValidCause', 'ForCost'], () => {});
defausseCarte = (g => function (P, id, j) {
  if (P.causeCtrl != null && P.causeCtrl !== j && statiqueQui(P, 'CantDiscard', (t, src, env) => t.ForCost !== 'True' && joueurStatique(P, j, t.ValidPlayer, src, env) && /OppCtrl/.test(t.ValidCause || ''))) return null;
  return g(P, id, j);
})(defausseCarte);
sacrificeInterdit = (g => function (P, o, pourCout) {
  if (g(P, o, pourCout)) return true;
  /* La cause « un sort ou une capacité d'un adversaire » : qui résout en ce moment, s'il n'est pas le contrôleur. */
  return !pourCout && P.causeCtrl != null && P.causeCtrl !== o.ctrl && !!statiqueQui(P, 'CantSacrifice', (t, src, env) => t.ValidCause === 'SpellAbility.OppCtrl' && t.ForCost === 'False' && objetOuRien(P, o, t.ValidCard, src, env));
})(sacrificeInterdit);

/* —— Choisir parmi ce qu'un joueur contrôle ——————————————————————————— */

/* `ChooseCard | ControlledByPlayer$ Remembered|Chooser` : les cartes qu'un joueur contrôle — celui que la boucle parcourt (The Eternal Wanderer), ou celui qui
   choisit lui-même (Liliana, Dreadhorde General). `ChooseEach$ Artifact & Creature…` : un choix par type, chacun parmi ce qui n'a pas déjà été pris. */
FORGE_API.ChooseCard.gen = (g => function* (P, t, env) {
  if (t.ControlledByPlayer !== 'Remembered' && !t.ChooseEach) return yield* g(P, t, env);
  const memoJ = env.ctx.memoJ || [], cumul = [];
  for (const j of joueursForge(P, t, env)) {
    const proprio = t.ControlledByPlayer === 'Remembered' ? memoJ[memoJ.length - 1] : t.ControlledByPlayer === 'Chooser' ? j : null;
    if (t.ControlledByPlayer && proprio == null) continue;
    const base = objetsZone(P, 'champ').filter(o => forgeValideObjet(P, o, t.Choices || 'Permanent', env.src, env.ctrl, env) && (proprio == null || o.ctrl === proprio));
    const groupes = t.ChooseEach ? t.ChooseEach.split(/\s*&\s*/).map(ty => base.filter(o => forgeValideObjet(P, o, ty, env.src, env.ctrl, env))) : [base];
    const deja = new Set();
    for (const grp of groupes) {
      const ids = grp.map(o => o.id).filter(id => !deja.has(id));
      if (!ids.length) continue;
      const pris = yield* choisitCartes(P, t.ControlledByPlayer === 'Remembered' ? env.ctrl : j, ids, 1, 'Choisir', 'cartes', t.Mandatory === 'True' ? 1 : 0);
      pris.forEach(id => { deja.add(id); cumul.push(id); });
    }
  }
  choixDe(P, env.src).cartes = cumul;
  if (t.RememberChosen === 'True') cumul.forEach(id => retiensForge(env.ctx, id));
  if (t.ImprintChosen === 'True') cumul.forEach(id => retiensEmpreinte(empreinteDe(P, env.ctx, env.src), id));
})(FORGE_API.ChooseCard.gen);
forgeSait('param', 'ChooseCard.ControlledByPlayer', 'ChooseCard.ChooseEach');

/* « Each opponent who didn't » : les adversaires que la boucle n'a pas retenus. */
forgeDefinis = (g => function (P, val, env) {
  const m = /^(Opponent|Player\.Opponent)\.!IsRemembered$/.exec(String(val || '').trim());
  if (m) { const memo = env.ctx.memoJ || []; return adversaires(P, env.ctrl).filter(j => !memo.includes(j)).map(j => ({j})); }
  return g(P, val, env);
})(forgeDefinis);
forgeSait('defini', 'Opponent.!IsRemembered', 'Player.Opponent.!IsRemembered');
