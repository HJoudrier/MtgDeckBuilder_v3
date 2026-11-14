/* =====================================================================
   js/forgeDeclencheursB.js — Les déclencheurs de Forge, suite : engager,
   cibler, poser des marqueurs, déclarer l'attaque, commettre un crime,
   et les déclencheurs d'état

   Les évènements qu'ils écoutent viennent des gestes (js/jeuGestes.js) et
   du combat (js/jeuCombat.js). Les paramètres communs à tous les modes —
   « only during your turn », « this ability triggers only once each turn »
   — se jugent dans `forgeDeclenche()` (js/forgeDeclencheurs.js).
   ===================================================================== */

/* Les modes « one or more » : une seule fois pour un lot d'évènements,
   c'est-à-dire par collecte (js/jeuDeclencheurs.js). */
const MODES_PAR_LOT = new Set(['ChangesZoneAll', 'DamageDealtOnce', 'DamageDoneOnce', 'CounterAddedOnce', 'DiscardedAll', 'CommitCrime',
  'AttackersDeclared', 'AttackersDeclaredOneTarget']);

/* Le défenseur d'une attaque répond-il à `AttackedTarget$` ? */
function defenseurDeclare(P, d, v, s, env) {
  return String(v).split(',').some(x => {
    x = x.trim();
    if (d.j != null) return /^(Player|Opponent|You)/.test(x) && forgeValideJoueur(P, d.j, x, s.ctrl, env);
    return valideOuRien(P, obj(P, d.pw), x, s, env);
  });
}

function attaquantsDeclares(P, t, e, s, env) {
  if (e.t !== 'attaquants' || !joueurOuRien(P, e.joueur, t.AttackingPlayer, s, env)) return false;
  let l = e.ids.map((id, i) => [obj(P, id), e.defs[i]]).filter(x => x[0]);
  if (t.AttackedTarget) l = l.filter(([, d]) => defenseurDeclare(P, d, t.AttackedTarget, s, env));
  if (t.ValidAttackers) l = l.filter(([o]) => forgeValideObjet(P, o, t.ValidAttackers, s, s.ctrl, env));
  return l.length > 0 && (!t.ValidAttackersAmount || seuilForge(P, l.length, t.ValidAttackersAmount, env));
}
forgeMode('AttackersDeclared', ['AttackingPlayer', 'ValidAttackers', 'ValidAttackersAmount', 'AttackedTarget', 'NoResolvingCheck'], attaquantsDeclares);
forgeMode('AttackersDeclaredOneTarget', ['AttackingPlayer', 'ValidAttackers', 'ValidAttackersAmount', 'AttackedTarget'], attaquantsDeclares);

forgeMode('Taps', ['ValidCard', 'Attacker'], (P, t, e, s, env) => e.t === 'engage' && valideOuRien(P, obj(P, e.id), t.ValidCard, s, env) &&
  (t.Attacker !== 'True' || e.attaque));
forgeMode('TapsForMana', ['ValidCard', 'Activator'], (P, t, e, s, env) => e.t === 'engage' && e.mana &&
  valideOuRien(P, obj(P, e.id), t.ValidCard, s, env) && joueurOuRien(P, e.ctrl, t.Activator, s, env));
forgeMode('Untaps', ['ValidCard'], (P, t, e, s, env) => e.t === 'degage' && valideOuRien(P, obj(P, e.id), t.ValidCard, s, env));

forgeMode('ChangesZoneAll', ['ValidCards', 'Origin', 'Destination'], (P, t, e, s, env) =>
  FORGE_MODES.ChangesZone(P, {Origin: t.Origin, Destination: t.Destination, ValidCard: t.ValidCards}, e, s, env));

/* « Becomes the target of a spell or ability an opponent controls » : la
   source se juge comme un sort (`Spell`) ou comme un sort ou une capacité
   (`SpellAbility`), puis par ses propriétés. */
function sourceCiblante(P, e, v, s, env) {
  const src = obj(P, e.source) || P.lkis.get(e.source);
  return String(v).split(',').some(x => {
    const [tete, ...props] = x.trim().split('.');
    if (tete === 'Spell' && !e.sort) return false;
    if (tete === 'Spell' || tete === 'SpellAbility') {
      if (!props.length) return true;
      const p = props.join('.');
      return p === 'OppCtrl' ? e.lanceur !== s.ctrl : p === 'YouCtrl' ? e.lanceur === s.ctrl : !!src && forgeValideObjet(P, src, 'Card.' + p, s, s.ctrl, env);
    }
    return e.sort && !!src && forgeValideObjet(P, src, x.trim(), s, s.ctrl, env);
  });
}
forgeMode('BecomesTarget', ['ValidTarget', 'ValidSource', 'Valiant'], (P, t, e, s, env) => {
  if (e.t !== 'cible') return false;
  if (t.ValidTarget && !(e.joueur != null ? forgeValideJoueur(P, e.joueur, t.ValidTarget, s.ctrl, env) : valideOuRien(P, obj(P, e.id), t.ValidTarget, s, env))) return false;
  if (t.Valiant === 'True' && e.lanceur !== s.ctrl) return false;
  return !t.ValidSource || sourceCiblante(P, e, t.ValidSource, s, env);
});
forgeMode('CommitCrime', ['ValidPlayer'], (P, t, e, s, env) => e.t === 'crime' && joueurOuRien(P, e.joueur, t.ValidPlayer || 'You', s, env));

forgeMode('DamageDealtOnce', ['ValidSource', 'ValidTarget', 'CombatDamage'], (P, t, e, s, env) => FORGE_MODES.DamageDone(P, t, e, s, env));

/* « Whenever you activate an ability that isn't a mana ability » : le
   moteur n'émet pas l'activation d'une capacité de mana. */
function capaciteActivee(v, e) {
  return String(v).split(',').some(x => {
    const [tete, ...props] = x.trim().split(/[.+]/);
    if (!/^(Activated|SpellAbility|Ability)$/.test(tete)) return false;
    return props.every(p => ({'!ManaAbility': true, nonManaAbility: true, Loyalty: e.loyaute, '!Loyalty': !e.loyaute, nonLoyalty: !e.loyaute})[p] === true);
  });
}
forgeMode('AbilityCast', ['ValidCard', 'ValidActivatingPlayer', 'ValidSA'], (P, t, e, s, env) => e.t === 'active' &&
  valideOuRien(P, obj(P, e.id) || e.lki, t.ValidCard, s, env) && joueurOuRien(P, e.joueur, t.ValidActivatingPlayer, s, env) &&
  (!t.ValidSA || capaciteActivee(t.ValidSA, e)));
FORGE_MODES.SpellCastOrCopy = FORGE_MODES.SpellCast;
forgeSait('trig', 'SpellCastOrCopy');
forgeSait('param', 'SpellCastOrCopy.ValidCard', 'SpellCastOrCopy.ValidActivatingPlayer', 'SpellCast.OpponentTurn');

function marqueurPose(P, t, e, s, env) {
  if (e.t !== 'marqueur' || (t.CounterType && genreMarqueur(t.CounterType) !== e.genre)) return false;
  if (!valideOuRien(P, obj(P, e.id), t.ValidCard, s, env) || !valideOuRien(P, obj(P, e.source), t.ValidSource, s, env)) return false;
  return !t.CounterAmount || seuilForge(P, e.n, t.CounterAmount, env);
}
forgeMode('CounterAdded', ['CounterType', 'ValidCard', 'ValidSource', 'CounterAmount'], marqueurPose);
forgeMode('CounterAddedOnce', ['CounterType', 'ValidCard', 'ValidSource'], marqueurPose);

forgeMode('AttackerBlockedByCreature', ['ValidCard', 'ValidBlocker'], (P, t, e, s, env) => e.t === 'bloquePar' &&
  valideOuRien(P, obj(P, e.id), t.ValidCard, s, env) && valideOuRien(P, obj(P, e.bloqueur), t.ValidBlocker, s, env));
forgeMode('AttackerUnblocked', ['ValidCard'], (P, t, e, s, env) => e.t === 'nonBloque' && valideOuRien(P, obj(P, e.id), t.ValidCard, s, env));
forgeSait('param', 'AttackerBlocked.ValidBlocker');

forgeMode('LandPlayed', ['ValidCard', 'Origin'], (P, t, e, s, env) => e.t === 'terrainJoue' && valideOuRien(P, obj(P, e.id), t.ValidCard, s, env) &&
  (!t.Origin || String(t.Origin).split(',').some(z => ZONES_FORGE[z.trim()] === e.depuis)));
forgeMode('DiscardedAll', ['ValidPlayer', 'ValidCard'], (P, t, e, s, env) => e.t === 'defausse' && joueurOuRien(P, e.joueur, t.ValidPlayer, s, env) &&
  joueurDeCarte(e.joueur, t.ValidCard, s.ctrl));

/* Un déclencheur d'état (« when you control no Swamps, sacrifice ~ ») : il
   part dès que sa condition tient, sans évènement, et ne repart pas tant
   qu'il attend ou qu'il est sur la pile (règle 603.8). */
forgeMode('Always', [], () => false);
function declencheursEtat(P) {
  for (const id of P.champ) {
    const s = obj(P, id);
    if (!s.def._etat && s.def._etat !== undefined) continue;
    capacitesDe(P, s).forEach(cap => {
      const ec = cap.genre === 'declenchee' && cap.ecoutes.find(x => x.evt === 'forge' && x.t.Mode === 'Always');
      if (!ec) return;
      if (P.enAttente.some(x => x.src === s.id && x.cap === cap) || P.pile.some(it => it.source === s.id && it.declencheur === cap)) return;
      const env = {face: ec.face, ctx: {cibles: [], memo: [], memoJ: []}, src: s, ctrl: s.ctrl, op: {}};
      if (conditionForge(P, ec.t, env)) P.enAttente.push({src: s.id, ctrl: s.ctrl, cap, evt: {t: 'etat'}});
    });
    if (s.def._etat === undefined) s.def._etat = s.def.capacites.some(k => k.genre === 'declenchee' && k.ecoutes.some(x => x.evt === 'forge' && x.t.Mode === 'Always'));
  }
}

Object.keys(FORGE_MODES).forEach(m => forgeSait('param', ...FORGE_PARAMS_DECL.map(p => m + '.' + p)));
