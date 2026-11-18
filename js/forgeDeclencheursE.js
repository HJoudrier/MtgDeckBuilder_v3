/* =====================================================================
   js/forgeDeclencheursE.js — Des paramètres de déclencheurs de plus

   Lot F66, ce que demandaient quarante et une cartes :
   - `ResolvedLimit$` sur les modes « once » : js/forgeDeclencheursC.js le
     réécrit en limite d'activation pour tous les déclencheurs, il suffit
     donc de le dire connu des modes qui le portent ;
   - `FirstCombat$` (Genji Glove, Hexplate Wallbreaker, Karlach) : la
     première phase de combat du tour (`P.combatsTour`) ;
   - `Threshold$`, `Metalcraft$`, `Blessing$`, `Hellbent$` en paramètres de
     déclencheur (Kiora, Twilight Prophet, Inventors' Fair), jugés comme la
     condition de même nom ; `FirstUpkeep$` (Paradox Haze), le premier
     entretien du tour (`rang` de l'évènement) ;
   - `ValidSAonCard$` d'un sort lancé : le sort lui-même répond à un filtre,
     ou a coûté moins de mana que sa valeur (`Spell.ManaSpent LTX`) ;
   - `ValidPlayer$` de `Discarded` et de `LandPlayed` ;
   - `Panharmonicon` : `ValidActivator$` et `ValidPlayer$` (js/forgeInterdits.js).
   ===================================================================== */

forgeSait('param', ...[['CounterAddedOnce', 'DamageDoneOnce', 'MilledAll', 'Sacrificed', 'Phase', 'Scry', 'LifeGained'].map(m => m + '.ResolvedLimit'),
  ['Panharmonicon.ValidActivator', 'Panharmonicon.ValidPlayer', 'Attacks.FirstCombat', 'AttackersDeclared.FirstCombat', 'Attacks.Threshold', 'Phase.Metalcraft',
    'Phase.Blessing', 'Phase.FirstUpkeep', 'SpellCast.ValidSAonCard', 'Discarded.ValidPlayer', 'LandPlayed.ValidActivatingPlayer']].flat());

/* —— La première phase de combat ———————————————————————————————————— */

const enPremierCombat = P => (P.combatsTour || 0) <= 1;
FORGE_MODES.Attacks = (juge => function (P, t, e, s, env) {
  return juge(P, t, e, s, env) && (t.FirstCombat !== 'True' || enPremierCombat(P));
})(FORGE_MODES.Attacks);
FORGE_MODES.AttackersDeclared = (juge => function (P, t, e, s, env) {
  return juge(P, t, e, s, env) && (t.FirstCombat !== 'True' || enPremierCombat(P));
})(FORGE_MODES.AttackersDeclared);

/* —— Les conditions écrites comme paramètres ————————————————————————— */

conditionForge = (g => function (P, t, env) {
  for (const k of ['Threshold', 'Metalcraft', 'Blessing', 'Hellbent']) {
    if (t[k] === 'True' && !(FORGE_CONDITIONS[k] && FORGE_CONDITIONS[k](P, env))) return false;
  }
  return g(P, t, env);
})(conditionForge);

FORGE_MODES.Phase = (juge => function (P, t, e, s, env) {
  return juge(P, t, e, s, env) && (t.FirstUpkeep !== 'True' || e.rang === 1);
})(FORGE_MODES.Phase);

/* —— Le sort lancé lui-même ———————————————————————————————————————— */

/* Un `ValidSAonCard$` : des alternatives, chacune `Spell.<filtre>` ou `Spell.ManaSpent LTX`. */
function carteLanceeLisible(v) {
  return String(v).split(',').every(alt => /^Spell(\.ManaSpent (LT|GT)X|\.[A-Za-z!][\w+!. ]*)?$/.test(alt.trim()));
}
function carteLanceeValide(P, v, e, s, env) {
  const o = obj(P, e.id);
  if (!o) return false;
  return String(v).split(',').some(alt => {
    alt = alt.trim();
    if (alt === 'Spell') return true;
    const m = /^Spell\.ManaSpent (LT|GT)X$/.exec(alt);
    if (m) { const dep = Object.values(o.manaSort || {}).reduce((a, b) => a + b, 0); return m[1] === 'LT' ? dep < mvDe(o) : dep > mvDe(o); }
    return forgeValideObjet(P, o, 'Card.' + alt.slice(6), s, e.joueur != null ? e.joueur : s.ctrl, env, true);
  });
}
FORGE_MODES.SpellCast = (juge => function (P, t, e, s, env) {
  return juge(P, t, e, s, env) && (!t.ValidSAonCard || carteLanceeValide(P, t.ValidSAonCard, e, s, env));
})(FORGE_MODES.SpellCast);
declencheurForge = (g => function (def, face, t, jetons) {
  if (t.ValidSAonCard && !carteLanceeLisible(t.ValidSAonCard)) return false;
  /* Paradox Haze : « first upkeep » sans dire l'étape. */
  return g(def, face, t.Mode === 'Phase' && t.FirstUpkeep === 'True' && !t.Phase ? {...t, Phase: 'Upkeep'} : t, jetons);
})(declencheurForge);

/* —— Qui défausse, qui joue le terrain ———————————————————————————————— */

FORGE_MODES.Discarded = (juge => function (P, t, e, s, env) {
  return juge(P, t, e, s, env) && joueurOuRien(P, e.joueur, t.ValidPlayer, s, env);
})(FORGE_MODES.Discarded);
FORGE_MODES.LandPlayed = (juge => function (P, t, e, s, env) {
  return juge(P, t, e, s, env) && joueurOuRien(P, e.joueur != null ? e.joueur : (obj(P, e.id) || {}).ctrl, t.ValidActivatingPlayer, s, env);
})(FORGE_MODES.LandPlayed);

/* —— Un changement de zone, mais pas de là, et pas n'importe quand ———————— */

/* `ExcludedOrigins$ Hand` (The Lost and the Damned) ; `Phase$ BeginCombat->EndCombat`
   (The Blue Spirit) : pendant le combat. */
FORGE_MODES.ChangesZone = (juge => function (P, t, e, s, env) {
  if (!juge(P, t, e, s, env)) return false;
  if (t.ExcludedOrigins) {
    const de = e.t === 'zone' ? e.de : null;
    if (t.ExcludedOrigins.split(',').some(z => ZONES_FORGE[z.trim()] === de)) return false;
  }
  if (t.Phase && !(t.Phase === 'BeginCombat->EndCombat' && ETAPES_COMBAT.includes(P.etape))) return false;
  return true;
})(FORGE_MODES.ChangesZone);
forgeSait('param', 'ChangesZone.ExcludedOrigins', 'ChangesZone.Phase', 'AttackersDeclared.CheckDefinedPlayer');
