/* =====================================================================
   js/forgeDes.js — Des dés de plus

   Lot F88, `RollDice` quand le lancer ne se résume pas à une somme :
   - `IgnoreLower$ N` (Berserker's Frenzy) : on garde les dés sauf les N plus
     bas ; `UseHighestRoll$ True` : le plus haut seul ;
   - `ChosenSVar$ X | OtherSVar$ Y` (Grave, Reckless, Valiant Endeavor) : on
     choisit l'un des résultats, qui devient X ; l'autre devient Y ;
   - `EvenOddResults$ True` (Attempted Murder, Luck Bobblehead) : les
     variables `EvenResults` et `OddResults`, le nombre de dés pairs et
     impairs ; `DifferentResults$ True` (Circuits Act) : `DifferentResults`,
     le nombre de résultats différents ; `MaxRollsResults$ True` : `MaxRolls`,
     le nombre de dés tombés sur leur plus haute face.
   Un automate prend le plus haut résultat quand on lui en laisse le choix.
   ===================================================================== */

forgeSait('param', 'RollDice.IgnoreLower', 'RollDice.UseHighestRoll', 'RollDice.ChosenSVar', 'RollDice.OtherSVar',
  'RollDice.EvenOddResults', 'RollDice.DifferentResults', 'RollDice.MaxRollsResults');
forgeSait('expr', 'SVar$EvenResults', 'SVar$OddResults');

FORGE_API.RollDice.gen = (g => function* (P, t, env) {
  if (!(t.IgnoreLower || t.UseHighestRoll || t.ChosenSVar || t.EvenOddResults || t.DifferentResults || t.MaxRollsResults)) return yield* g(P, t, env);
  const faces = forgeNombre(P, t.Sides || 20, env), n = forgeNombre(P, t.Amount || 1, env);
  const jets = Array.from({length: Math.max(0, n)}, () => 1 + entierHasard(P.rng, faces));
  const vars = varsDe(env.ctx);
  let gardes = jets.slice();
  if (t.UseHighestRoll === 'True') gardes = jets.length ? [Math.max(...jets)] : [];
  else if (t.IgnoreLower) gardes = jets.slice().sort((a, b) => a - b).slice(Math.min(jets.length, forgeNombre(P, t.IgnoreLower, env)));
  let total = gardes.reduce((s, x) => s + x, 0) + forgeNombre(P, t.Modifier || 0, env);
  if (t.ChosenSVar && jets.length) {
    const i = yield* choisitUn(P, env.ctrl, jets.map(String), 'Choisir un résultat', jets.indexOf(Math.max(...jets)), env.ctx.source);
    vars[t.ChosenSVar] = jets[i];
    if (t.OtherSVar) vars[t.OtherSVar] = jets.reduce((s, x, k) => s + (k === i ? 0 : x), 0);
    total = jets[i];
  }
  if (t.EvenOddResults) { vars.EvenResults = jets.filter(x => x % 2 === 0).length; vars.OddResults = jets.length - vars.EvenResults; }
  if (t.DifferentResults) vars.DifferentResults = new Set(jets).size;
  if (t.MaxRollsResults) vars.MaxRolls = jets.filter(x => x === faces).length;
  if (jets.length === 1 && !t.ChosenSVar) total = yield* modifieJet(P, env.ctrl, total, faces);
  jn(P, `${P.joueurs[env.ctrl].nom} lance ${jets.length > 1 ? jets.length + ' dés' : 'un dé'} : ${jets.join(', ')}${gardes.length !== jets.length || t.ChosenSVar ? ' → ' + total : ''}`);
  if (t.ResultSVar) vars[t.ResultSVar] = total;
  emet(P, {t: 'de', joueur: env.ctrl, n: total});
  const tr = tranchesDe(t.ResultSubAbilities).find(x => total >= x.a && total <= x.b);
  if (tr) yield* joueSous(P, env, tr.nom);
})(FORGE_API.RollDice.gen);
