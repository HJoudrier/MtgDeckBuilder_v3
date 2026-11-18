/* =====================================================================
   js/forgeDeclencheursD.js — Des déclencheurs de plus

   Ce que demandaient les cartes les plus jouées (lot F62) :
   - `TokenCreated` (Mirkwood Bats, Rosie Cotton) : un jeton vient d'être
     créé ; `Sacrificed` y répond déjà pour la seconde moitié de Bats ;
   - `Drawn | FirstCardInDrawStep$` (Orcish Bowmasters, Xyris) : la première
     carte d'une étape de pioche, ou toute autre. Le rang vient de
     `piocheN()` (js/jeuEtat.js) ;
   - `SacrificedOnce`, `LifeLostAll`, `MilledAll` : « one or more… », un
     seul déclenchement par lot d'évènements (`P._lot`, js/jeuDeclencheurs.js) ;
   - `Milled` : une carte meulée, que `deplace()` marque ;
   - `RingTemptsYou` (Call of the Ring, Sauron) : le porteur vient d'être choisi ;
   - `ResolvedLimit$` : au plus N fois par tour.
   ===================================================================== */

forgeMode('TokenCreated', ['ValidPlayer', 'ValidToken'], (P, t, e, s, env) => e.t === 'entre' && !!e.jeton &&
  joueurOuRien(P, e.ctrl, t.ValidPlayer, s, env) && valideOuRien(P, obj(P, e.id), t.ValidToken, s, env));

/* La première carte de l'étape de pioche, ou non. */
FORGE_MODES.Drawn = (juge => function (P, t, e, s, env) {
  if (!juge(P, t, e, s, env)) return false;
  if (t.FirstCardInDrawStep == null) return true;
  const premiere = e.etape === 'pioche' && e.rangEtape === 1;
  return (t.FirstCardInDrawStep === 'True') === premiere;
})(FORGE_MODES.Drawn);
forgeSait('param', 'Drawn.FirstCardInDrawStep');

/* « One or more » : le premier évènement du lot déclenche, les autres non. */
function unSeulParLot(P, s, t, cle) {
  if (!P._lot) return true;
  const k = cle + '|' + s.id + '|' + (t.Execute || '');
  if (P._lot.has(k)) return false;
  P._lot.add(k);
  return true;
}

/* « Do this only once each turn » : au plus N déclenchements par tour. Le
   compte se prend au moment où l'évènement convient. */
function sousLimiteDuTour(P, s, t) {
  if (!t.ResolvedLimit) return true;
  const k = 'RL|' + s.id + '|' + (t.Execute || ''), m = P.limitesTour || (P.limitesTour = new Map()), x = m.get(k);
  const n = x && x.tour === P.tour ? x.n : 0;
  if (n >= +t.ResolvedLimit) return false;
  m.set(k, {tour: P.tour, n: n + 1});
  return true;
}

FORGE_MODES.SacrificedOnce = (P, t, e, s, env) => FORGE_MODES.Sacrificed(P, t, e, s, env) && unSeulParLot(P, s, t, 'SO');
forgeSait('trig', 'SacrificedOnce');
forgeSait('param', 'SacrificedOnce.ValidCard', 'SacrificedOnce.ValidPlayer');

forgeMode('LifeLostAll', ['ValidPlayer', 'ResolvedLimit'], (P, t, e, s, env) => FORGE_MODES.LifeLost(P, t, e, s, env) &&
  sousLimiteDuTour(P, s, t) && unSeulParLot(P, s, t, 'LL'));

const meulee = (P, t, e, s, env) => e.t === 'zone' && !!e.meule && e.vers === 'cimetiere' &&
  joueurOuRien(P, (obj(P, e.id) || e.lki || {}).prop, t.ValidPlayer, s, env) && valideOuRien(P, obj(P, e.id), t.ValidCard, s, env);
forgeMode('Milled', ['ValidPlayer', 'ValidCard'], meulee);
forgeMode('MilledAll', ['ValidPlayer', 'ValidCard'], (P, t, e, s, env) => meulee(P, t, e, s, env) && unSeulParLot(P, s, t, 'MA'));

forgeMode('RingTemptsYou', ['ValidPlayer', 'ValidCard'], (P, t, e, s, env) => e.t === 'anneau' &&
  joueurOuRien(P, e.joueur, t.ValidPlayer, s, env) && valideOuRien(P, obj(P, e.id), t.ValidCard, s, env));
