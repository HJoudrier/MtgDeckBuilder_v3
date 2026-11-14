/* =====================================================================
   js/forgeInterdits.js — Ce que les statiques de Forge interdisent,
   imposent ou permettent aux joueurs

   « Players can't cast more than one spell each turn », « you may cast
   creature spells as though they had flash », « activated abilities of
   artifacts can't be activated », « ~ attacks each combat if able »,
   « creatures can't attack you unless their controller pays {2} »… Ces
   statiques ne changent pas ce qu'est un objet, comme celles que lit
   `car()` : elles changent ce qu'un joueur a le droit de faire. Chaque règle
   du moteur qu'elles touchent les interroge ici, par une fonction à elle.

   Une statique de ces modes ne fait rien dans `car()` : elle s'inscrit avec
   une fonction vide, pour que la couverture la sache comprise.
   ===================================================================== */

/* Les statiques de Forge en jeu d'un mode, relevées une fois par version. */
function statiquesMode(P, mode) {
  if (P._modesV !== P.ver) { P._modes = new Map(); P._modesV = P.ver; }
  let r = P._modes.get(mode);
  if (!r) {
    r = statiquesEnJeu(P).filter(x => x.s.s === 'forge' && String(x.s.t.Mode).split(',').some(m => m.trim() === mode));
    P._modes.set(mode, r);
  }
  return r;
}

/* Parcourir les statiques d'un mode dont la condition tient : rend la
   première pour laquelle `f` est vraie. `o`, s'il est donné, ajoute celles
   que la carte porte pour elle-même hors du champ (`EffectZone$ All`). */
function statiqueQui(P, mode, f, o) {
  const siennes = o && o.zone !== 'champ' ? o.def.statiques.filter(s => s.s === 'forge' && s.t.Mode === mode && s.t.EffectZone && s.t.EffectZone !== 'Battlefield')
    .map(s => ({src: o, s})) : [];
  for (const x of siennes.length ? [...statiquesMode(P, mode), ...siennes] : statiquesMode(P, mode)) {
    const env = envStatique(x.src, x.s);
    if (f(x.s.t, x.src, env) && conditionForge(P, x.s.t, env)) return x;
  }
  return null;
}

function joueurStatique(P, j, v, src, env) { return !v || forgeValideJoueur(P, j, v, src.ctrl, env); }
function objetOuRien(P, o, v, src, env) { return !v || (!!o && forgeValideObjet(P, o, v, src, src.ctrl, env, true)); }
function zoneOuRien(v, zone) { return !v || v.split(',').some(z => ZONES_FORGE[z.trim()] === zone); }

[['MustAttack', ['ValidCreature']], ['MustBlock', ['ValidCreature']], ['CantBeCast', ['ValidCard', 'Caster', 'Origin', 'NumLimitEachTurn', 'OnlySorcerySpeed']],
  ['CastWithFlash', ['ValidCard', 'ValidSA', 'Caster']], ['CantBeActivated', ['ValidCard', 'ValidSA', 'Activator', 'AffectedZone']],
  ['CanAttackDefender', ['ValidCard']], ['MinMaxBlocker', ['ValidCard', 'Min', 'Max']], ['CombatDamageToughness', ['ValidCard']],
  ['CantGainLife', ['ValidPlayer']], ['CantPreventDamage', ['ValidSource', 'IsCombat']],
  ['CantTarget', ['ValidTarget', 'ValidSource', 'ValidSA', 'Activator', 'AffectedZone']],
  ['Panharmonicon', ['ValidCard', 'ValidMode', 'ValidCause', 'Destination', 'Origin']], ['CantAttackUnless', ['ValidCard', 'Target', 'Cost']]]
  .forEach(([mode, params]) => forgeStatique(mode, params, () => {}));
forgeSait('stat', 'CantAttack,CantBlock,CantBeActivated');
forgeSait('param', 'CantAttack,CantBlock,CantBeActivated.ValidCard', 'CantBlock,CantAttack.ValidCard');

/* —— Lancer et activer ——————————————————————————————————————————— */

/* Un sort que `j` ne peut pas lancer depuis `depuis` (Rule of Law, « your
   opponents can't cast spells during your turn »). */
function sortInterdit(P, j, o, depuis, d) {
  return !!statiqueQui(P, 'CantBeCast', (t, src, env) => {
    if (!joueurStatique(P, j, t.Caster, src, env) || !zoneOuRien(t.Origin, depuis)) return false;
    if (t.ValidCard && !forgeValideDef(d, t.ValidCard, src.ctrl, j, o.id)) return false;
    if (t.OnlySorcerySpeed === 'True' && enPhasePrincipale(P, j)) return false;
    if (t.NumLimitEachTurn) {
      const deja = P.joueurs[j].sortsTour.filter(x => !t.ValidCard || forgeValideDef(x, t.ValidCard, src.ctrl, j)).length;
      if (deja < forgeNombre(P, t.NumLimitEachTurn, env)) return false;
    }
    return true;
  }, o);
}

/* « You may cast creature spells as though they had flash ». */
function flashAccorde(P, j, o, d) {
  return !!statiqueQui(P, 'CastWithFlash', (t, src, env) => joueurStatique(P, j, t.Caster, src, env) &&
    (!t.ValidCard || forgeValideDef(d, t.ValidCard, src === o ? j : src.ctrl, j, o.id)), o);
}

/* Quelqu'un peut-il recevoir le flash d'une statique, d'un permanent ou
   d'une carte de sa main ? Le raccourci de la passe rapide
   (js/jeuLancer.js `actionsPossibles()`) le demande. */
function flashPossible(P, j) {
  return statiquesMode(P, 'CastWithFlash').some(x => joueurStatique(P, j, x.s.t.Caster, x.src, envStatique(x.src, x.s))) ||
    P.joueurs[j].main.some(id => obj(P, id).def.statiques.some(s => s.s === 'forge' && s.t.Mode === 'CastWithFlash'));
}

/* La capacité `k` de `o` répond-elle au filtre `ValidSA` d'une statique ?
   `Activated`, `Activated.!ManaAbility`, `Activated.!Loyalty`. */
function capaciteVisee(v, k) {
  if (!v) return true;
  return v.split(',').some(alt => {
    const [tete, ...props] = alt.trim().split(/[.+]/);
    if (tete !== 'Activated' && tete !== 'Ability') return false;
    return props.every(p => ({'!ManaAbility': k.genre !== 'mana', ManaAbility: k.genre === 'mana', '!Loyalty': k.genre !== 'loyaute',
      Loyalty: k.genre === 'loyaute'})[p] === true);
  });
}

/* Null Rod, Pithing Needle, Arrest : la capacité ne s'active pas. */
function activationInterdite(P, j, o, k) {
  return statiquesMode(P, 'CantBeActivated').length > 0 && !!statiqueQui(P, 'CantBeActivated', (t, src, env) =>
    objetOuRien(P, o, t.ValidCard, src, env) && joueurStatique(P, j, t.Activator, src, env) && capaciteVisee(t.ValidSA, k) &&
    zoneOuRien(t.AffectedZone, o.zone));
}

/* —— Le combat ————————————————————————————————————————————————— */

function doitAttaquer(P, o) { return goadActif(P, o) || !!statiqueQui(P, 'MustAttack', (t, src, env) => objetOuRien(P, o, t.ValidCreature, src, env)); }
function doitBloquer(P, o) { return !!statiqueQui(P, 'MustBlock', (t, src, env) => objetOuRien(P, o, t.ValidCreature, src, env)); }
function defenseurAttaque(P, o) { return !!statiqueQui(P, 'CanAttackDefender', (t, src, env) => objetOuRien(P, o, t.ValidCard, src, env)); }
function degatsParEndurance(P, o) { return !!statiqueQui(P, 'CombatDamageToughness', (t, src, env) => objetOuRien(P, o, t.ValidCard, src, env)); }

/* Le nombre de bloqueurs permis contre un attaquant : `{min, max}`. */
function bornesBlocage(P, a) {
  let min = 1, max = Infinity;
  for (const x of statiquesMode(P, 'MinMaxBlocker')) {
    const t = x.s.t, env = envStatique(x.src, x.s);
    if (!objetOuRien(P, a, t.ValidCard, x.src, env) || !conditionForge(P, t, env)) continue;
    if (t.Min) min = Math.max(min, +t.Min);
    if (t.Max) max = Math.min(max, +t.Max);
  }
  return {min, max};
}

/* Le défenseur visé par une attaque répond-il à `Target$` (« can't attack
   you or planeswalkers you control ») ? */
function defenseurVise(P, def, v, src, env) {
  if (!v) return true;
  return v.split(',').some(x => {
    x = x.trim();
    if (def.j != null) return x === 'You' ? def.j === src.ctrl : x === 'Opponent' ? def.j !== src.ctrl : x === 'Player';
    const pw = obj(P, def.pw);
    return !!pw && x !== 'You' && x !== 'Player' && forgeValideObjet(P, pw, x, src, src.ctrl, env, true);
  });
}

/* « … unless defending player controls an Island » : une propriété du
   joueur qui défend, jugée pour l'attaquant. */
const DEFENSEUR_PROPRIETE = /^(!)?(?:controls(\w+)(\..+)?|hasFewerCreaturesInPlayThanYou)$/;
function proprieteDefenseur(P, d, prop, o) {
  const m = DEFENSEUR_PROPRIETE.exec(prop);
  if (!m) return false;
  let r;
  if (m[2]) r = champDe(P, d).some(x => forgeValideObjet(P, x, m[2] + (m[3] || ''), o, o.ctrl, null, true));
  else r = champDe(P, d).filter(estCreature).length < champDe(P, o.ctrl).filter(estCreature).length;
  return m[1] ? !r : r;
}

/* `o` peut-il attaquer ce défenseur (`{j}` ou `{pw}`) ? */
function attaquePermise(P, o, def) {
  const d = defenseurDe(P, def);
  return !statiqueQui(P, 'CantAttack', (t, src, env) => (!!t.Target || !!t.UnlessDefender) && objetOuRien(P, o, t.ValidCard, src, env) &&
    defenseurVise(P, def, t.Target, src, env) && !(t.UnlessDefender && d != null && proprieteDefenseur(P, d, t.UnlessDefender, o)));
}

/* La taxe d'attaque (Ghostly Prison, Propaganda) : le mana générique que
   coûte `o` attaquant ce défenseur. */
function taxeAttaque(P, o, def) {
  let n = 0;
  for (const x of statiquesMode(P, 'CantAttackUnless')) {
    const t = x.s.t, env = envStatique(x.src, x.s);
    if (!objetOuRien(P, o, t.ValidCard, x.src, env) || !defenseurVise(P, def, t.Target, x.src, env) || !conditionForge(P, t, env)) continue;
    n += forgeNombre(P, t.Cost, env);
  }
  return n;
}

/* —— Vie, dégâts, cibles ————————————————————————————————————————— */

function vieBloquee(P, j) { return !!statiqueQui(P, 'CantGainLife', (t, src, env) => joueurStatique(P, j, t.ValidPlayer, src, env)); }

function preventionInterdite(P, s, combat) {
  return !!statiqueQui(P, 'CantPreventDamage', (t, src, env) => (t.IsCombat !== 'True' || combat) && objetOuRien(P, s, t.ValidSource, src, env));
}

/* « ~ can't be the target of spells your opponents control » : une
   statique qui interdit à cette source de cibler cet objet. */
function cibleInterdite(P, o, s, ctrl) {
  if (!statiquesMode(P, 'CantTarget').length || !s || s.j != null) return false;
  const sort = s.zone === 'pile';
  return !!statiqueQui(P, 'CantTarget', (t, src, env) => objetOuRien(P, o, t.ValidTarget, src, env) &&
    objetOuRien(P, s, t.ValidSource, src, env) && joueurStatique(P, ctrl, t.Activator, src, env) &&
    (!t.ValidSA || (/^Spell/.test(t.ValidSA) ? sort : !sort)));
}

/* —— Déclencher deux fois ————————————————————————————————————————— */

/* Le mode de Forge d'une écoute, pour `ValidMode$`. */
const MODES_ECOUTE = {entre: 'ChangesZone', meurt: 'ChangesZone', quitte: 'ChangesZone', attaque: 'Attacks', lance: 'SpellCast',
  degatsJoueur: 'DamageDone', gagneVie: 'LifeGained', pioche: 'Drawn', etape: 'Phase', sacrifie: 'Sacrificed'};

/* Le mouvement que décrit un évènement, pour `Origin$`, `Destination$` et
   `ValidCause$`. */
function mouvementEvt(P, e) {
  if (e.t === 'zone') return {de: e.de, vers: e.vers, o: objetZone(P, e)};
  if (e.t === 'entre') return {de: null, vers: 'champ', o: obj(P, e.id)};
  if (e.t === 'meurt') return {de: 'champ', vers: 'cimetiere', o: e.lki};
  if (e.t === 'attaque') return {o: obj(P, e.id)};
  return {};
}

/* Panharmonicon : combien de fois de plus la capacité `cap` de `s` se
   déclenche pour l'évènement `e`. */
function declenchementsEnPlus(P, s, cap, e) {
  const L = statiquesMode(P, 'Panharmonicon');
  if (!L.length || s.lki || s.zone !== 'champ') return 0;
  const modes = new Set(cap.ecoutes.map(ec => ec.evt === 'forge' ? ec.t.Mode : MODES_ECOUTE[ec.evt]));
  let n = 0;
  for (const {src, s: st} of L) {
    const t = st.t, env = envStatique(src, st), mv = mouvementEvt(P, e);
    if (!objetOuRien(P, s, t.ValidCard, src, env)) continue;
    if (t.ValidMode && !t.ValidMode.split(',').some(m => modes.has(m.trim()) || (m.trim() === 'ChangesZoneAll' && modes.has('ChangesZone')))) continue;
    if ((t.Destination && !zoneOuRien(t.Destination, mv.vers)) || (t.Origin && !zoneOuRien(t.Origin, mv.de))) continue;
    if (t.ValidCause && !objetOuRien(P, mv.o, t.ValidCause, src, env)) continue;
    if (conditionForge(P, t, env)) n++;
  }
  return n;
}

/* —— Les joueurs : main maximale, terrains du tour ————————————————— */

/* Les statiques `Continuous` qui visent ce joueur (`Affected$ You`). */
function statiquesJoueur(P, j, cle) {
  return statiquesMode(P, 'Continuous').filter(x => x.s.t[cle] != null && (() => {
    const env = envStatique(x.src, x.s);
    return forgeValideJoueur(P, j, x.s.t.Affected || 'You', x.src.ctrl, env) && conditionForge(P, x.s.t, env);
  })());
}

/* La taille maximale de la main au nettoyage (Reliquary Tower). */
function tailleMainMax(P, j) {
  let max = 7, plus = 0;
  for (const x of statiquesJoueur(P, j, 'SetMaxHandSize')) {
    if (x.s.t.SetMaxHandSize === 'Unlimited') return Infinity;
    max = forgeNombre(P, x.s.t.SetMaxHandSize, envStatique(x.src, x.s));
  }
  for (const x of statiquesJoueur(P, j, 'RaiseMaxHandSize')) plus += forgeNombre(P, x.s.t.RaiseMaxHandSize, envStatique(x.src, x.s));
  return Math.max(0, max + plus);
}

/* Le nombre de terrains que `j` peut jouer ce tour (Exploration, Azusa). */
function terrainsParTour(P, j) {
  let n = 1;
  for (const x of statiquesJoueur(P, j, 'AdjustLandPlays')) {
    if (x.s.t.AdjustLandPlays === 'Unlimited') return Infinity;
    n += forgeNombre(P, x.s.t.AdjustLandPlays, envStatique(x.src, x.s));
  }
  return n;
}

forgeSait('param', 'Continuous.SetMaxHandSize', 'Continuous.RaiseMaxHandSize', 'Continuous.AdjustLandPlays', 'Continuous.GainControl',
  'Continuous.RemoveAllAbilities', 'Continuous.RemoveCardTypes', 'Continuous.RemoveCreatureTypes', 'Continuous.AddHiddenKeyword',
  'CantAttack.Target', 'CantAttack.UnlessDefender', 'ReduceCost.ValidTarget', 'RaiseCost.ValidTarget', 'CastWithFlash.EffectZone',
  'CantBeCast.EffectZone', 'Continuous.RemoveLandTypes', 'Continuous.AddAllCreatureTypes');
