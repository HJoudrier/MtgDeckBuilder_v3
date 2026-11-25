/* =====================================================================
   js/forgeEnchantementsF.js — Les enchantements d'EDHREC : le hasard et la pile

   Lot F109 :
   - Unbound Flourishing : `ChangeX` double le X d'un sort sur la pile,
     `SpellAbilityCast | HasXManaCost` copie un sort ou une capacité à X ;
   - Leyline of Combustion : `BecomesTargetOnce`, une fois par sort ou
     capacité qui vise, quel que soit le nombre de cibles ;
   - Twists and Turns : « si une créature allait explorer, elle surveille
     1 d'abord » ;
   - Mirror March : `FlipCoin | FlipUntilYouLose`, des pièces jusqu'à en
     perdre une, et le nombre de victoires en réserve (`Wins`) ;
   - Barbarian Class : « lance un dé de plus et ignore le plus bas » ;
     Night Shift of the Living Dead : payer 1 point de vie pour décaler un
     dé d'un cran, une fois par tour ;
   - The Trickster-God's Heist : `TargetsWithSameCardType`.
   ===================================================================== */

/* —— Doubler le X d'un sort ————————————————————————————————————— */

forgeEffet('ChangeX', ['Value'], function* (P, t, env) {
  const e = (env.ctx && env.ctx.evt) || {}, it = P.pile.find(x => x.id === e.id);
  if (!it || !/xPaid\/Twice/.test(t.Value || '')) return;
  it.x = (it.x || 0) * 2;
  jn(P, `${it.nom || 'Le sort'} : X devient ${it.x}`);
  P.ver++;
}, (t, op) => { op.op = 'forge'; op.hostile = false; });

/* Un sort lancé ou une capacité activée dont le coût contient {X} : l'instantané, le rituel, l'activée, selon `ValidSA`. */
forgeMode('SpellAbilityCast', ['ValidSA', 'ValidActivatingPlayer', 'HasXManaCost'], (P, t, e, s, env) => {
  const l = String(t.ValidSA || 'Spell,Activated').split(',').map(x => x.trim());
  let ok;
  if (e.t === 'lance') ok = l.some(x => x === 'Spell' || (!!e.def && e.def.types.includes(x.toLowerCase())));
  else if (e.t === 'active' && !e.loyaute) ok = l.includes('Activated');
  else return false;
  if (!ok || !joueurOuRien(P, e.joueur, t.ValidActivatingPlayer, s, env)) return false;
  if (t.HasXManaCost !== 'True') return true;
  if (e.t === 'lance') return !!(e.def && e.def.cout && e.def.cout.x);
  const it = [...P.pile].reverse().find(x => x.capacite && x.source === e.id && !x.copie);
  return !!it && it.x > 0;
});

/* —— Viser, une fois pour tout un sort ————————————————————————————— */

MODES_PAR_LOT.add('BecomesTargetOnce');
forgeMode('BecomesTargetOnce', ['ValidTarget', 'ValidSource'], (P, t, e, s, env) => FORGE_MODES.BecomesTarget(P, t, e, s, env));
definisEtendus = (g => function (P, v, env) {
  if (v === 'TriggeredSourceSAController') { const e = env.ctx && env.ctx.evt; return e && e.lanceur != null ? [{j: e.lanceur}] : []; }
  return g(P, v, env);
})(definisEtendus);
forgeSait('defini', 'TriggeredSourceSAController');

/* —— Surveiller avant d'explorer ———————————————————————————————— */

forgeSait('repl', 'Explore');
forgeSait('param', 'Explore.ActiveZones', 'Explore.ValidExplorer', 'Explore.ReplaceWith');
formeRemplacementB = (g => function (r) {
  if (r.Event === 'Explore' && r.ReplaceWith) return 'explorePlus';
  if (r.Event === 'RollDice' && r.ReplaceWith) return 'desPlus';
  return g(r);
})(formeRemplacementB);
/* Le remplacement ne vaut qu'une fois pour un même évènement : l'exploration qu'il rejoue n'est plus remplacée. */
FORGE_API.Explore.gen = (g => function* (P, t, env) {
  for (const o of objetsForge(P, t, env).filter(x => x.zone === 'champ' && !x.lki)) {
    const rem = remplacementsEnJeu(P).find(({src, r}) => r.forme === 'explorePlus' && src.ctrl === o.ctrl && (!r.t.ValidExplorer || forgeValideObjet(P, o, r.t.ValidExplorer, src, src.ctrl, envRemplacement(src, r))));
    if (rem) { jn(P, `${rem.src.def.nom} : ${P.joueurs[o.ctrl].nom} surveille 1 avant l'exploration`); yield* regardeForge(P, o.ctrl, 1, false); }
    yield* g(P, {...t, Defined: 'Remembered', ValidTgts: undefined}, {...env, op: {}, ctx: {...env.ctx, memo: [o.id], memoJ: []}});
  }
})(FORGE_API.Explore.gen);

/* —— Des pièces jusqu'à en perdre une ———————————————————————————— */

forgeSait('param', 'FlipCoin.FlipUntilYouLose');
FORGE_API.FlipCoin.prepare = (p => function (t, op) {
  if (t.FlipUntilYouLose === 'True') return !t.Amount && sousEffets(op, [t.WinSubAbility, t.LoseSubAbility]);
  return p.call(this, t, op);
})(FORGE_API.FlipCoin.prepare);
FORGE_API.FlipCoin.gen = (g => function* (P, t, env) {
  if (t.FlipUntilYouLose !== 'True') return yield* g(P, t, env);
  let victoires = 0;
  while (entierHasard(P.rng, 2) === 0 && victoires < 50) victoires++;
  jn(P, `Pile ou face jusqu'à perdre : ${victoires} gagné(s)`);
  varsDe(env.ctx).Wins = victoires;
  if (victoires > 0 && t.WinSubAbility) yield* joueSous(P, env, t.WinSubAbility);
  if (t.LoseSubAbility) yield* joueSous(P, env, t.LoseSubAbility);
})(FORGE_API.FlipCoin.gen);

/* —— Un dé de plus, le plus bas ignoré ———————————————————————————— */

forgeSait('repl', 'RollDice');
forgeSait('param', 'RollDice.ActiveZones', 'RollDice.ValidPlayer', 'RollDice.ReplaceWith');
forgeSait('expr', 'ReplaceCount$Ignore');
FORGE_API.RollDice.gen = (g => function* (P, t, env) {
  const rem = remplacementsEnJeu(P).find(({src, r}) => r.forme === 'desPlus' && src.ctrl === env.ctrl);
  if (!rem || forgeNombre(P, t.Amount || 1, env) < 1) return yield* g(P, t, env);
  jn(P, `${rem.src.def.nom} : un dé de plus, le plus bas est ignoré`);
  return yield* g(P, {...t, Amount: String(forgeNombre(P, t.Amount || 1, env) + 1), IgnoreLower: String((t.IgnoreLower ? forgeNombre(P, t.IgnoreLower, env) : 0) + 1)}, env);
})(FORGE_API.RollDice.gen);

/* —— Payer 1 point de vie pour décaler un dé ———————————————————————— */

forgeSait('kw', 'After you roll a die, you may pay 1 life. If you do, increase or decrease the result by 1. Do this only once each turn.');
motCleForge = (g => function (def, k, face, jetons) {
  if (!/^After you roll a die, you may pay 1 life\. If you do, increase or decrease the result by 1/.test(k)) return g(def, k, face, jetons);
  def.params.modifieDe = true;
  return true;
})(motCleForge);
/* Un seul dé, un seul décalage par tour et par source (Night Shift of the Living Dead). */
function* modifieJet(P, j, total, faces) {
  const src = P.champ.map(id => obj(P, id)).find(o => o.ctrl === j && o.def.params && o.def.params.modifieDe && o.deTour !== P.tour);
  if (!src || P.joueurs[j].vie < 2) return total;
  if ((yield question(P, j, 'oui', ['non', 'oui'], {texte: `${src.def.nom} : payer 1 vie pour modifier le dé (${total}) ?`, source: src.id, defaut: 0})) !== 1) return total;
  const i = yield* choisitUn(P, j, ['+1', '-1'], 'Augmenter ou diminuer le résultat', total >= faces ? 1 : 0, src.id);
  src.deTour = P.tour;
  P.joueurs[j].vie -= 1; emet(P, {t: 'perteVie', joueur: j, n: 1});
  const nouveau = Math.min(faces, Math.max(1, total + (i === 0 ? 1 : -1)));
  jn(P, `${src.def.nom} : le dé passe de ${total} à ${nouveau}`);
  return nouveau;
}

/* —— Deux cibles du même type ————————————————————————————————— */

forgeSait('param', 'ExchangeControl.TargetsWithSameCardType');
