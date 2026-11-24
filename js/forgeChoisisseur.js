/* =====================================================================
   js/forgeChoisisseur.js — La cible que choisit quelqu'un d'autre

   Lot F99. Arena : « tap target creature you control and target creature of
   an opponent's choice they control » — la seconde cible, un adversaire la
   choisit parmi ses propres créatures (`TargetingPlayer$ Player.Opponent`,
   `TargetingPlayerControls$ True`). Le descripteur de l'emplacement porte
   `choisisseur` ; `choisitCibles()` (js/jeuLancer.js) pose la question à
   cet adversaire, et à lui seul. Avec plusieurs adversaires, qui active en
   désigne un.
   ===================================================================== */

function* adversaireChoisisseur(P, j, src) {
  const l = adversaires(P, j);
  if (l.length <= 1) return l.length ? l[0] : j;
  const i = yield* choisitUn(P, j, l.map(x => P.joueurs[x].nom), 'Quel adversaire choisit la cible ?', 0, src && src.id);
  return l[i] != null ? l[i] : l[0];
}

forgeSait('param', 'Tap.TargetingPlayer', 'Tap.TargetingPlayerControls');
forgeValeurs('Tap.TargetingPlayer', ['Player.Opponent']);

/* —— Qui prend le contrôle, s'il le veut ———————————————————————————— */

/* « Another player of your choice may gain control of that permanent » (Stardew Valley) : le joueur choisi — pas celui qui active —
   répond à la question, et sans son accord rien ne change de mains. `Chooser$ ChosenPlayer` : c'est lui. */
FORGE_API.GainControl.gen = (g => function* (P, t, env) {
  if (t.Chooser !== 'ChosenPlayer') return yield* g(P, t, env);
  const j = choixDe(P, env.src).joueur;
  if (j == null) return;
  const cible = objetsForge(P, t, env, 'Targeted').find(o => o && o.zone === 'champ' && !o.lki);
  if (!cible) return;
  const r = yield question(P, j, 'oui', ['non', 'oui'], {texte: `Prendre le contrôle de ${cible.def.nom} ?`, source: env.src ? env.src.id : null});
  if (r === 1) yield* g(P, t, env);
})(FORGE_API.GainControl.gen);
forgeSait('param', 'GainControl.Choices', 'GainControl.Chooser');
forgeValeurs('GainControl.Choices', ['Card.targetedBy']);
forgeValeurs('GainControl.Chooser', ['ChosenPlayer']);
