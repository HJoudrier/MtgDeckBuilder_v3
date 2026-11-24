/* =====================================================================
   js/forgeDeclencheursF.js — Des déclencheurs de plus, III

   Lot F84 :
   - `CounterPlayerAddedAll` (All Will Be One, The Great Goblin, Rikku) :
     « whenever you put one or more counters on a permanent or player » — une
     fois par lot de marqueurs posés ensemble ; `ValidSource$ You` est le
     contrôleur de ce qui les pose, `TriggerCount$Amount` leur nombre. Les
     marqueurs posés sur un joueur (expérience, énergie) ne passent pas par
     `poseMarqueurs()` : seuls ceux des permanents sont dits.
   ===================================================================== */

forgeMode('CounterPlayerAddedAll', ['ValidObject', 'ValidSource', 'CounterType'], (P, t, e, s, env) => {
  if (e.t !== 'marqueur' || (t.CounterType && genreMarqueur(t.CounterType) !== e.genre)) return false;
  const cause = obj(P, e.source);
  if (t.ValidSource && !(cause && joueurOuRien(P, cause.ctrl, t.ValidSource, s, env))) return false;
  return valideOuRien(P, obj(P, e.id), t.ValidObject, s, env) && unSeulParLot(P, s, t, 'CP');
});

/* —— « At the beginning of your upkeep, if you have 40 or more life » —————— */

FORGE_MODES.Phase = (juge => function (P, t, e, s, env) {
  if (!juge(P, t, e, s, env)) return false;
  if (!t.LifeTotal) return true;
  return forgeDefinis(P, t.LifeTotal, env).map(x => joueurDe(x)).some(j => j != null && P.joueurs[j] && seuilForge(P, P.joueurs[j].vie, t.LifeAmount || 'GE1', env));
})(FORGE_MODES.Phase);
forgeSait('param', 'Phase.LifeTotal', 'Phase.LifeAmount');

/* —— Les créatures qui entrent ne déclenchent rien (Torpor Orb) ————————— */

/* Un déclencheur d'entrée en jeu — `ChangesZone` ou `ChangesZoneAll` — est-il coupé par une statique
   `DisableTriggers` ? `ValidCause$` juge ce qui entre, `ValidCard$` le permanent qui porte le déclencheur. */
function declencheurEntreeCoupe(P, e, s) {
  const entrant = objetZone(P, e) || obj(P, e.id);
  return !!statiqueQui(P, 'DisableTriggers', (t, src, env) => /ChangesZone/.test(t.ValidMode || '') && /Battlefield/.test(t.Destination || '') &&
    objetOuRien(P, entrant, t.ValidCause, src, env) && objetOuRien(P, s, t.ValidCard, src, env));
}

forgeDeclenche = (g => function (P, ec, e, s) {
  if (((e.t === 'zone' && e.vers === 'champ') || (e.t === 'entre')) && /^ChangesZone(All)?$/.test(ec.t.Mode) && declencheurEntreeCoupe(P, e, s)) return false;
  return g(P, ec, e, s);
})(forgeDeclenche);
