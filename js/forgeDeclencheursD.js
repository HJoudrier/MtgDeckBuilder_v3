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
   - `Proliferate` : un joueur vient de proliférer (Ezuri) ;
   - `Attacks | FirstAttack$` (Aurelia, Scourge of the Throne) : la première
     attaque de ce permanent ce tour ; `TriggerObjectsAttackers$Amount` (The
     Ur-Dragon) : ceux des attaquants déclarés qui répondent au filtre ;
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

FORGE_MODES.SacrificedOnce = (P, t, e, s, env) => FORGE_MODES.Sacrificed(P, t, e, s, env) && unSeulParLot(P, s, t, 'SO');
forgeSait('trig', 'SacrificedOnce');
forgeSait('param', 'SacrificedOnce.ValidCard', 'SacrificedOnce.ValidPlayer');

/* `ResolvedLimit$` : js/forgeDeclencheursC.js le réécrit en limite d'activation. */
forgeMode('LifeLostAll', ['ValidPlayer', 'ResolvedLimit'], (P, t, e, s, env) => FORGE_MODES.LifeLost(P, t, e, s, env) && unSeulParLot(P, s, t, 'LL'));

const meulee = (P, t, e, s, env) => e.t === 'zone' && !!e.meule && e.vers === 'cimetiere' &&
  joueurOuRien(P, (obj(P, e.id) || e.lki || {}).prop, t.ValidPlayer, s, env) && valideOuRien(P, obj(P, e.id), t.ValidCard, s, env);
forgeMode('Milled', ['ValidPlayer', 'ValidCard'], meulee);
forgeMode('MilledAll', ['ValidPlayer', 'ValidCard'], (P, t, e, s, env) => meulee(P, t, e, s, env) && unSeulParLot(P, s, t, 'MA'));

forgeMode('RingTemptsYou', ['ValidPlayer', 'ValidCard'], (P, t, e, s, env) => e.t === 'anneau' &&
  joueurOuRien(P, e.joueur, t.ValidPlayer, s, env) && valideOuRien(P, obj(P, e.id), t.ValidCard, s, env));

/* « Attacks for the first time each turn » (Aurelia, Scourge of the Throne) :
   le rang de l'attaque vient de `declareAttaquants()` ; `CheckDefinedPlayer$
   TriggeredDefender.withMostLife` : le défenseur a le plus de vie, ou l'égale. */
FORGE_MODES.Attacks = (juge => function (P, t, e, s, env) {
  if (!juge(P, t, e, s, env)) return false;
  if (t.FirstAttack === 'True' && e.rang !== 1) return false;
  if (t.CheckDefinedPlayer) {
    if (t.CheckDefinedPlayer !== 'TriggeredDefender.withMostLife') return false;
    const d = e.defenseur, j = d && (d.j != null ? d.j : obj(P, d.pw) && obj(P, d.pw).ctrl);
    if (j == null || P.joueurs[j].vie < Math.max(...vivants(P).map(J => J.vie))) return false;
  }
  return true;
})(FORGE_MODES.Attacks);
forgeSait('param', 'Attacks.FirstAttack', 'Attacks.CheckDefinedPlayer');

/* « Draw that many cards » : les attaquants de l'évènement qui répondent à
   `ValidAttackers$`, comptés à la décision et gardés pour l'expression
   `TriggerObjectsAttackers$Amount`. */
FORGE_MODES.AttackersDeclared = (juge => function (P, t, e, s, env) {
  const ok = juge(P, t, e, s, env);
  if (ok) {
    const n = e.ids.filter(id => obj(P, id) && (!t.ValidAttackers || forgeValideObjet(P, obj(P, id), t.ValidAttackers, s, s.ctrl, env))).length;
    (e.nValides = e.nValides || {})[s.id] = n;
    (e.idsValides = e.idsValides || {})[s.id] = e.ids.filter(id => obj(P, id) && (!t.ValidAttackers || forgeValideObjet(P, obj(P, id), t.ValidAttackers, s, s.ctrl, env)));
  }
  return ok;
})(FORGE_MODES.AttackersDeclared);

exprEtendue = (g => function (P, tete, q, env) {
  if (tete === 'TriggerObjectsAttackers' && q === 'Amount') {
    const e = env.ctx && env.ctx.evt;
    return e && e.ids ? ((e.nValides || {})[env.src && env.src.id] != null ? e.nValides[env.src.id] : e.ids.length) : 0;
  }
  return g(P, tete, q, env);
})(exprEtendue);
forgeSait('expr', 'TriggerObjectsAttackers$Amount');

/* Un joueur vient de proliférer. */
forgeMode('Proliferate', ['ValidPlayer'], (P, t, e, s, env) => e.t === 'prolifere' && joueurOuRien(P, e.joueur, t.ValidPlayer, s, env));
