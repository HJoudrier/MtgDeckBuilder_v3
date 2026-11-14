/* =====================================================================
   js/forgeDeclencheurs.js — Quand une capacité déclenchée de Forge se
   déclenche

   Un déclencheur de Forge (`T:Mode$ ChangesZone | Origin$ Battlefield |
   Destination$ Graveyard | ValidCard$ Card.Self | Execute$ TrigDraw`) devient
   une écoute `{evt: 'forge', t, face}` ; la collecte du moteur
   (js/jeuDeclencheurs.js) la confronte ici à chaque évènement émis.
   Chaque mode s'inscrit avec les paramètres qu'il lit.
   ===================================================================== */

const FORGE_PHASES = {Upkeep: 'entretien', Draw: 'pioche', Main1: 'principale1', BeginCombat: 'debutCombat',
  'Beginning of Combat': 'debutCombat', EndCombat: 'finCombat', Main2: 'principale2', 'End of Turn': 'fin', 'End Of Turn': 'fin'};

/* Un déclencheur de phase dont la phase est inconnue ne partirait jamais :
   il est refusé à la construction. */
function phaseConnue(t) { return t.Mode !== 'Phase' || !!FORGE_PHASES[String(t.Phase || '').trim()]; }

const FORGE_MODES = {};

function forgeMode(mode, params, juge) {
  FORGE_MODES[mode] = juge;
  forgeSait('trig', mode);
  forgeSait('param', ...params.map(p => mode + '.' + p));
}

/* L'objet dont parle un évènement de zone : l'instantané s'il quitte le
   champ, le nouvel objet sinon. */
function objetZone(P, e) {
  if (e.de === 'champ' && e.lki) return e.lki;
  return (e.id != null ? obj(P, e.id) : null) || e.lki || null;
}

function valideOuRien(P, o, v, s, env) { return !v || (!!o && forgeValideObjet(P, o, v, s, s.ctrl, env)); }
function joueurOuRien(P, j, v, s, env) { return !v || (j != null && forgeValideJoueur(P, j, v, s.ctrl, env)); }

/* Ce que « Card.YouOwn » veut dire d'une pioche ou d'une défausse, dont
   l'évènement ne nomme que le joueur. */
function joueurDeCarte(j, v, ctrl) {
  if (!v) return true;
  if (/YouOwn|YouCtrl/.test(v)) return j === ctrl;
  if (/OppOwn|OppCtrl/.test(v)) return j !== ctrl;
  return true;
}

forgeMode('ChangesZone', ['Origin', 'Destination', 'ValidCard'], (P, t, e, s, env) => {
  let de, vers, o;
  if (e.t === 'zone') { ({de, vers} = e); o = objetZone(P, e); }
  else if (e.t === 'entre' && e.jeton) { de = null; vers = 'champ'; o = obj(P, e.id); }
  else return false;
  if (t.Destination && t.Destination !== 'Any' && !t.Destination.split(',').some(z => ZONES_FORGE[z.trim()] === vers)) return false;
  if (t.Origin && t.Origin !== 'Any' && !t.Origin.split(',').some(z => ZONES_FORGE[z.trim()] === de)) return false;
  return valideOuRien(P, o, t.ValidCard, s, env);
});

/* `NoResolvingCheck` : ne pas revérifier la condition à la résolution —
   le moteur ne la revérifie jamais. */
forgeSait('param', 'Attacks.NoResolvingCheck', 'ChangesZone.NoResolvingCheck', 'Phase.NoResolvingCheck');
forgeMode('Attacks', ['ValidCard', 'Attacked'], (P, t, e, s, env) => e.t === 'attaque' && valideOuRien(P, obj(P, e.id), t.ValidCard, s, env) &&
  (!t.Attacked || (t.Attacked === 'Player' ? e.defenseur != null : false)));
forgeMode('Blocks', ['ValidCard'], (P, t, e, s, env) => e.t === 'bloque' && valideOuRien(P, obj(P, e.id), t.ValidCard, s, env));
forgeMode('AttackerBlocked', ['ValidCard'], (P, t, e, s, env) => e.t === 'estBloque' && valideOuRien(P, obj(P, e.id), t.ValidCard, s, env));
forgeMode('Phase', ['Phase', 'ValidPlayer'], (P, t, e, s, env) => e.t === 'etape' && FORGE_PHASES[String(t.Phase || '').trim()] === e.etape &&
  joueurOuRien(P, e.actif, t.ValidPlayer, s, env));
forgeMode('SpellCast', ['ValidCard', 'ValidActivatingPlayer', 'ActivatorThisTurnCast', 'TargetsValid'], (P, t, e, s, env) => e.t === 'lance' &&
  (!t.ValidCard || forgeValideDef(e.def, t.ValidCard, s.ctrl, e.joueur, e.id)) && joueurOuRien(P, e.joueur, t.ValidActivatingPlayer, s, env) &&
  (!t.ActivatorThisTurnCast || seuilForge(P, P.joueurs[e.joueur].sortsTour.length, t.ActivatorThisTurnCast, env)) &&
  (!t.TargetsValid || ciblesDuSort(P, e.id).some(c => c.j != null ? forgeValideJoueur(P, c.j, t.TargetsValid, s.ctrl, env)
    : forgeValideObjet(P, c, t.TargetsValid, s, s.ctrl, env))));

/* Les cibles d'un sort encore sur la pile. */
function ciblesDuSort(P, id) {
  const it = P.pile.find(x => x.id === id);
  if (!it) return [];
  return [].concat(...it.effets.map(ef => [].concat(...ef.cibles))).map(c => typeof c === 'object' ? c : obj(P, c)).filter(Boolean);
}
forgeMode('DamageDone', ['ValidSource', 'ValidTarget', 'CombatDamage'], (P, t, e, s, env) => {
  if (e.t !== 'degatsJoueur' && e.t !== 'degatsObjet') return false;
  if (t.CombatDamage === 'True' && !e.combat) return false;
  if (t.CombatDamage === 'False' && e.combat) return false;
  const src = passeOuPresent(P, e.source);
  if (!valideOuRien(P, src, t.ValidSource, s, env)) return false;
  return e.t === 'degatsJoueur' ? joueurOuRien(P, e.joueur, t.ValidTarget, s, env) : valideOuRien(P, passeOuPresent(P, e.id), t.ValidTarget, s, env);
});
FORGE_MODES.DamageDoneOnce = FORGE_MODES.DamageDone;
forgeSait('trig', 'DamageDoneOnce');
forgeSait('param', 'DamageDoneOnce.ValidSource', 'DamageDoneOnce.ValidTarget', 'DamageDoneOnce.CombatDamage');
forgeMode('Drawn', ['ValidCard', 'Number'], (P, t, e, s) => e.t === 'pioche' && joueurDeCarte(e.joueur, t.ValidCard, s.ctrl) &&
  (!t.Number || (/^\d+$/.test(t.Number) && +t.Number === e.n)));
forgeMode('Discarded', ['ValidCard'], (P, t, e, s) => e.t === 'defausse' && joueurDeCarte(e.joueur, t.ValidCard, s.ctrl));
forgeMode('LifeGained', ['ValidPlayer'], (P, t, e, s, env) => e.t === 'vie' && joueurOuRien(P, e.joueur, t.ValidPlayer, s, env));
forgeMode('LifeLost', ['ValidPlayer'], (P, t, e, s, env) => (e.t === 'perteVie' || e.t === 'degatsJoueur') && joueurOuRien(P, e.joueur, t.ValidPlayer, s, env));
forgeMode('Cycled', ['ValidCard', 'ValidPlayer'], (P, t, e, s, env) => e.t === 'cycle' && valideOuRien(P, e.lki, t.ValidCard, s, env) &&
  joueurOuRien(P, e.joueur, t.ValidPlayer, s, env));
forgeMode('TurnFaceUp', ['ValidCard'], (P, t, e, s, env) => e.t === 'retourne' && valideOuRien(P, obj(P, e.id), t.ValidCard, s, env));
forgeMode('Transformed', ['ValidCard'], (P, t, e, s, env) => e.t === 'transforme' && valideOuRien(P, obj(P, e.id), t.ValidCard, s, env));
forgeMode('Sacrificed', ['ValidCard', 'ValidPlayer'], (P, t, e, s, env) => e.t === 'sacrifie' && valideOuRien(P, e.lki, t.ValidCard, s, env) &&
  joueurOuRien(P, e.joueur, t.ValidPlayer, s, env));

/* Une écoute de Forge répond-elle à un évènement, pour la source `s` ? La
   zone d'où l'on écoute est le champ — ou, pour qui vient de le quitter,
   l'instantané qui regarde son propre départ. */
function forgeDeclenche(P, ec, e, s) {
  const t = ec.t, juge = FORGE_MODES[t.Mode];
  if (!juge) return false;
  const env = {face: ec.face, ctx: {evt: e, cibles: [], memo: [], memoJ: []}, src: s, ctrl: s.ctrl, op: {}};
  if (!juge(P, t, e, s, env)) return false;
  return conditionForge(P, t, env);
}
