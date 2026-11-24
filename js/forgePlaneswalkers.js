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
  if (r === 1 && !payerVieInterdit(P, j)) { P.joueurs[j].vie -= total; jn(P, `${P.joueurs[j].nom} paie ${total} PV pour attaquer`); return; }
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

/* —— Donner le rebound à un sort sur la pile ———————————————————————— */

/* « When you cast your next instant or sorcery spell from your hand this turn, it gains rebound » (Narset Transcendent) : `Pump | PumpZone$ Stack | KW$ Rebound`
   marque l'élément de pile ; le sort résolu s'exile, et se relance à l'entretien (js/jeuPile.js). */
FORGE_API.Pump.gen = (g => function* (P, t, env) {
  if (t.PumpZone !== 'Stack' || t.KW !== 'Rebound') return yield* g(P, t, env);
  objetsForge(P, t, env).forEach(o => { const it = o && P.pile.find(x => x.sort && x.id === o.id); if (it) it.rebondTemp = true; });
})(FORGE_API.Pump.gen);
FORGE_API.Pump.prepare = (p => (t, op) => (t.PumpZone === 'Stack' && t.KW === 'Rebound') || (p ? p(t, op) : true))(FORGE_API.Pump.prepare);
forgeSait('kwval', 'rebound');

/* —— Plusieurs pièces à la fois ———————————————————————————————————— */

/* « Flip 5 coins. Take an extra turn for each that comes up heads » (Ral Zarek) : `Amount$ N | NoCall$ True`, la sous-capacité de pile (ou de face) jouée à chaque pièce
   qui tombe ainsi. Le X qu'elle lit vaut 1 : une pièce, un tour. */
FORGE_API.FlipCoin.gen = (g => function* (P, t, env) {
  if (!t.Amount) return yield* g(P, t, env);
  const n = forgeNombre(P, t.Amount, env);
  let faces = 0;
  for (let k = 0; k < n; k++) {
    const pile = entierHasard(P.rng, 2) === 0;
    if (pile) faces++;
    const nom = pile ? t.HeadsSubAbility || t.WinSubAbility : t.TailsSubAbility || t.LoseSubAbility;
    varsDe(env.ctx).X = 1;
    yield* joueSous(P, env, nom);
  }
  jn(P, `${n} pièces : ${faces} pile`);
})(FORGE_API.FlipCoin.gen);
FORGE_API.FlipCoin.prepare = (p => (t, op) => /^\d+$/.test(t.Amount || '') && t.NoCall === 'True' ? sousEffets(op, [t.WinSubAbility, t.LoseSubAbility, t.HeadsSubAbility, t.TailsSubAbility]) : p(t, op))(FORGE_API.FlipCoin.prepare);
forgeSait('param', 'FlipCoin.Amount');

/* « Each opponent who doesn't control a legendary creature or planeswalker loses the game » (Nicol Bolas, Dragon-God) : `controlsLegendary.Creature_EQ0`. */
proprieteJoueurEtendue = (g => function (P, j, p, ctrl, env) {
  const m = /^controlsLegendary\.Creature(?:_(GE|LE|GT|LT|EQ|NE)(\d+))?$/.exec(p);
  if (!m) return g(P, j, p, ctrl, env);
  const n = champDe(P, j).filter(o => estCreature(o) && (car(P, o).supers || []).includes('legendary')).length;
  return compareForge(n, m[1] || 'GE', m[2] != null ? +m[2] : 1);
})(proprieteJoueurEtendue);
forgeSait('defini', 'Player.Opponent+controlsLegendary.Creature_EQ0+controlsPlaneswalker_LE0');
forgeSait('filtre', 'controlsLegendary.Creature_EQ0', 'controlsPlaneswalker_LE0');

/* —— Un emblème qui porte une capacité activée ——————————————————————————— */

/* « You get an emblem with "Tap an untapped artifact you control: this emblem deals 1 damage to any target" » (Karn, Living Legacy ; Ob Nixilis of the Black Oath) :
   l'emblème est un objet de la zone de commandement, sans type, dont la capacité s'active de là (`ActivationZone$ Command`, js/jeuLancer.js). */
FORGE_API.Effect.prepare = (p => function (t, op) {
  if (!t.Abilities) return p.call(this, t, op);
  const tmp = {capacites: [], statiques: [], params: {}, mots: 0};
  for (const n of String(t.Abilities).split(',').map(x => x.trim()).filter(Boolean)) {
    const sub = forgeSousCapacite(op.face, n);
    if (!sub || !capaciteForge(tmp, op.face, sub, op.jetons) || !tmp.capacites.length || tmp.capacites.some(k => k.zone !== 'commandement')) return false;
  }
  op.emblemeCapacites = tmp.capacites;
  return p.call(this, {...t, Abilities: undefined}, op);
})(FORGE_API.Effect.prepare);
FORGE_API.Effect.gen = (g => function* (P, t, env) {
  yield* g(P, {...t, Abilities: undefined}, env);
  const caps = env.op.emblemeCapacites;
  if (!caps) return;
  const def = {nom: t.Name || 'Emblème', cout: coutManaVide(), mv: 0, types: [], sousTypes: [], supers: [], couleurs: [], force: null, endurance: null, loyaute: null, defense: null,
    mots: 0, params: {}, sort: null, capacites: caps, statiques: [], entree: null, aura: null, equipe: null, kicker: null, flashback: null, cycling: null, jeton: true,
    couverture: {etat: 'complete', manque: []}, coutTexte: '', typeLigne: 'Emblem', texteOracle: '', source: 'forge'};
  const j = env.ctrl, o = creeObjet(P, nouvelleCarte(P, def, j, false, true), j, 'commandement');
  P.joueurs[j].commandement.push(o.id); P.ver++;
  jn(P, `${P.joueurs[j].nom} reçoit un emblème : ${def.nom}`);
})(FORGE_API.Effect.gen);
forgeSait('param', 'Effect.Abilities');

/* « Pay any amount of mana » (Karn, Living Legacy) : un nombre de 0 jusqu'au mana qu'on peut dépenser, que la suite paie (`UnlessCost$ Y`). L'IA en prend trois au plus. */
FORGE_API.ChooseNumber.gen = (g => function* (P, t, env) {
  if (t.ChooseAnyNumber !== 'True') return yield* g(P, t, env);
  const j = joueursForge(P, t, env)[0];
  if (j == null) return;
  const max = Math.min(12, manaDispo(P, j)), options = Array.from({length: max + 1}, (_, k) => String(k));
  choixDe(P, env.src).nombre = yield* choisitUn(P, j, options, 'Combien de mana payer ?', Math.min(3, max), env.ctx.source);
})(FORGE_API.ChooseNumber.gen);
forgeSait('param', 'ChooseNumber.ChooseAnyNumber');
