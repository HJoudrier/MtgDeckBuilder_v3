/* =====================================================================
   js/forgeRemplacementsB.js — Les remplacements de Forge, suite, et
   quelques déclencheurs de plus

   « You can't lose the game » (Platinum Angel), « skip your draw step »,
   le flashback accordé à une carte du cimetière (Snapcaster Mage), le
   coût « you may exile it » d'une carte qui vient de mourir (Academy
   Rector), et les déclencheurs de scry, surveil, dé lancé, monstruosité.
   ===================================================================== */

/* Les formes de plus, lues par js/forgeRemplacements.js `formeRemplacement()`. */
function formeRemplacementB(r) {
  if (r.Event === 'GameLoss' && r.Layer === 'CantHappen') return 'nePerdPas';
  /* « Your opponents can't win the game » : sans effet propre — un joueur
     qui ne peut perdre empêche déjà les autres de gagner. */
  if (r.Event === 'GameWin' && r.Layer === 'CantHappen') return 'neGagnePas';
  if (r.Event === 'BeginPhase' && r.Skip === 'True' && /^(Draw|Untap)$/.test(r.Phase || '')) return 'saute';
  return null;
}
forgeSait('repl', 'GameLoss', 'BeginPhase', 'GameWin');
forgeSait('param', 'GameWin.ValidPlayer', 'GameWin.Layer', 'GameWin.ActiveZones', 'Dig.Imprint');
forgeSait('param', 'GameLoss.ValidPlayer', 'GameLoss.ValidLoseReason', 'GameLoss.Layer', 'GameLoss.ActiveZones',
  'BeginPhase.ValidPlayer', 'BeginPhase.Phase', 'BeginPhase.Skip', 'BeginPhase.ActiveZones');

/* Un joueur que rien ne fait perdre pour cette raison. */
function nePeutPerdre(P, j, raison) {
  return remplacementsEnJeu(P).some(({src, r}) => r.forme === 'nePerdPas' &&
    (!r.t.ValidPlayer || forgeValideJoueur(P, j, r.t.ValidPlayer, src.ctrl, envRemplacement(src, r))) &&
    (!r.t.ValidLoseReason || (r.t.ValidLoseReason === 'LifeReachedZero' && raison === 'vie')));
}

/* Une étape que le joueur actif saute (pioche, dégagement). */
function etapeSautee(P, e) {
  const phase = {pioche: 'Draw', degagement: 'Untap'}[e];
  return !!phase && remplacementsEnJeu(P).some(({src, r}) => r.forme === 'saute' && r.t.Phase === phase &&
    (!r.t.ValidPlayer || forgeValideJoueur(P, P.actif, r.t.ValidPlayer, src.ctrl, envRemplacement(src, r))));
}

/* Le flashback accordé jusqu'à la fin du tour (« target instant card in
   your graveyard gains flashback ») : une marque sur la carte, que
   js/jeuVariantesB.js `lancableDuCimetiere()` lit. */
function flashbackAccorde(P, o) { return !!o && o.flashbackTemp === P.tour; }

forgeMode('Scry', ['ValidPlayer'], (P, t, e, s, env) => e.t === 'scry' && joueurOuRien(P, e.joueur, t.ValidPlayer, s, env));
forgeMode('Surveil', ['ValidPlayer'], (P, t, e, s, env) => e.t === 'surveil' && joueurOuRien(P, e.joueur, t.ValidPlayer, s, env));
forgeMode('RolledDie', ['ValidPlayer', 'ValidResult'], (P, t, e, s, env) => e.t === 'de' && joueurOuRien(P, e.joueur, t.ValidPlayer, s, env) &&
  (!t.ValidResult || seuilForge(P, e.n, t.ValidResult, env)));
forgeMode('BecomeMonstrous', ['ValidCard'], (P, t, e, s, env) => e.t === 'monstrueux' && valideOuRien(P, obj(P, e.id), t.ValidCard, s, env));
