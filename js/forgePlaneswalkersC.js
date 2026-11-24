/* =====================================================================
   js/forgePlaneswalkersC.js — Des planeswalkers, un à un (fin)

   Lot F100. Le rebound qu'un planeswalker donne à un sort (Narset
   Transcendent), plusieurs pièces à la fois (Ral Zarek), un emblème qui
   porte une capacité activée (Karn, Living Legacy ; Ob Nixilis of the Black
   Oath) et un nombre de mana à payer au choix (Karn, Living Legacy).
   ===================================================================== */

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
