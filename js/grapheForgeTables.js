/* =====================================================================
   js/grapheForgeTables.js — Le vocabulaire de Forge dans celui du graphe

   Les mêmes nœuds que la lecture du texte (js/reglesEffets.js), atteints par
   un autre chemin : un mode de déclencheur, un effet, un mot-clé, une
   statique, un remplacement de Forge rendent les nœuds qu'ils touchent. Une
   entrée est une liste, ou une fonction qui lit la table quand le nom seul ne
   suffit pas — `ChangeZone` vaut blink, réanimation, tuteur ou renvoi selon
   ses zones. Une liste vide dit « connu, sans nœud » ; un nom absent, « on
   ne sait pas » : la lecture relit alors la description de ce morceau-là
   dans le texte (js/grapheForge.js).
   ===================================================================== */

function zonesForge(v) { return String(v || 'Any').split(',').map(x => x.trim()); }

const GF_PHASES = {Upkeep: 'ENTRETIEN', Draw: 'ETAPE_PIOCHE', 'End of Turn': 'FIN_TOUR', 'End Of Turn': 'FIN_TOUR',
  Cleanup: 'FIN_TOUR', BeginCombat: 'DEBUT_COMBAT', EndCombat: 'FIN_COMBAT', Main1: 'PHASE_PRINCIPALE',
  Main2: 'PHASE_PRINCIPALE', Main: 'PHASE_PRINCIPALE', Untap: 'DEBUT_TOUR', 'Declare Attackers': 'ATTAQUE'};

const GF_MARQUEURS = {P1P1: 'MARQUEUR', M1M1: 'MARQUEUR_M1M1', POISON: 'POISON', ENERGY: 'ENERGIE',
  EXPERIENCE: 'EXPERIENCE'};

function noeudMarqueur(type) {
  if (!type) return 'MARQUEUR';
  return GF_MARQUEURS[type] || 'MARQUEUR_AUTRE';
}

/* Un déclencheur de changement de zone : arriver, mourir, partir, aller au
   cimetière. Un terrain qui arrive est le landfall. */
function noeudsZoneDeclencheur(t) {
  const o = zonesForge(t.Origin), d = zonesForge(t.Destination);
  const valide = t.ValidCard || t.ValidCards || '';
  if (d.includes('Battlefield')) {
    const alts = alternativesForge(valide);
    if (alts.length && alts.every(a => a.tete === 'Land' || a.props.includes('Land'))) return ['TERRAIN'];
    if (o.length === 1 && o[0] === 'Graveyard') return ['ETB_CIMETIERE'];
    if (o.length === 1 && o[0] === 'Exile') return ['ETB_EXIL'];
    if (o.length === 1 && o[0] === 'Library') return ['ETB_BIBLIO'];
    return ['ETB'];
  }
  /* « Meurt ou va dans la zone de commandement » est une mort : la zone de
     commandement n'est là que pour le commandant qu'on y renvoie. */
  if (o.includes('Battlefield')) return d.includes('Graveyard') && d.every(z => z === 'Graveyard' || z === 'Command') ? ['MORT'] : ['LTB'];
  if (d.includes('Graveyard')) return ['MIS_AU_CIMETIERE'];
  return [];
}

/* Des blessures : infligées à un joueur ou à une créature, en combat ou non,
   ou subies — quand le déclencheur ne dit que la cible. */
function noeudsDegatsDeclencheur(t) {
  const combat = t.CombatDamage === 'True';
  const cible = alternativesForge(t.ValidTarget);
  const joueur = cible.length && cible.every(a => a.tete in GF_JOUEURS);
  if (!t.ValidSource && cible.length && !joueur) return ['DEGATS_SUBIS'];
  if (combat && cible.length) return [joueur ? 'DEGATS_COMBAT_JOUEUR' : 'DEGATS_COMBAT_CREATURE'];
  return ['DEGATS'];
}

const GF_DECLENCHEURS = {
  ChangesZone: noeudsZoneDeclencheur, ChangesZoneAll: noeudsZoneDeclencheur,
  Phase: t => [...new Set(String(t.Phase || '').split(',').map(p => GF_PHASES[p.trim()]).filter(Boolean))],
  Attacks: t => [t.Alone === 'True' ? 'ATTAQUE_SEULE' : 'ATTAQUE'],
  AttackersDeclared: ['ATTAQUE'], AttackersDeclaredOneTarget: ['ATTAQUE'],
  SpellCast: ['LANCEMENT'], SpellCastOrCopy: ['LANCEMENT'], AbilityCast: ['CAPACITE_ACTIVEE'],
  SpellAbilityCast: ['LANCEMENT'],
  DamageDone: noeudsDegatsDeclencheur, DamageDoneOnce: noeudsDegatsDeclencheur,
  DamageDealtOnce: noeudsDegatsDeclencheur, DamageAll: noeudsDegatsDeclencheur,
  DamageDoneOnceByController: noeudsDegatsDeclencheur, DamagePreventedOnce: [],
  Drawn: ['PIOCHE'], Discarded: ['DEFAUSSE'], DiscardedAll: ['DEFAUSSE'],
  Sacrificed: ['SACRIFICE'], SacrificedOnce: ['SACRIFICE'], Exploited: ['SACRIFICE'], Destroyed: ['MORT'],
  LandPlayed: ['TERRAIN_JOUE'], LifeGained: ['GAIN_VIE'], LifeLost: ['PERTE_VIE'], LifeLostAll: ['PERTE_VIE'],
  CounterAdded: t => [noeudMarqueur(t.CounterType)], CounterAddedOnce: t => [noeudMarqueur(t.CounterType)],
  CounterAddedAll: t => [noeudMarqueur(t.CounterType)], CounterPlayerAddedAll: t => [noeudMarqueur(t.CounterType)],
  CounterRemoved: ['MARQUEUR_RETIRE'], CounterRemovedOnce: ['MARQUEUR_RETIRE'],
  Taps: ['ENGAGEMENT'], TapsForMana: ['MANA'], Untaps: ['UNTAP'], ManaExpend: ['MANA_DEPENSE'],
  /* « Quand ~ bloque une créature » s'écrit du côté de l'attaquant bloqué, la
     carte étant le bloqueur : c'est un blocage. */
  Blocks: ['BLOCAGE'], AttackerBlocked: t => [/Self/.test(t.ValidBlocker || '') ? 'BLOCAGE' : 'DEVIENT_BLOQUEE'],
  AttackerBlockedByCreature: t => [/Self/.test(t.ValidBlocker || '') ? 'BLOCAGE' : 'DEVIENT_BLOQUEE'],
  AttackerBlockedOnce: ['DEVIENT_BLOQUEE'], AttackerUnblocked: [], AttackerUnblockedOnce: [],
  BecomesTarget: ['DEVIENT_CIBLE'], BecomesTargetOnce: ['DEVIENT_CIBLE'],
  TurnFaceUp: ['FACE_VISIBLE'], Transformed: ['TRANSFORMATION'], Cycled: ['CYCLE'],
  Scry: ['IMPULSE'], Surveil: ['IMPULSE'], Attached: ['ATTACHEMENT'], ChangesController: ['GAIN_CONTROLE'],
  RolledDie: ['DE'], RolledDieOnce: ['DE'], FlippedCoin: ['DE'],
  BecomeMonarch: ['MONARQUE'], TakesInitiative: ['MONARQUE'], RoomEntered: ['DONJON'], DungeonCompleted: ['DONJON'],
  DayTimeChanges: ['JOUR_NUIT'], TokenCreated: ['JETON'], TokenCreatedOnce: ['JETON'],
  Proliferate: ['PROLIFERATION'], Fight: ['DEGATS'], FightOnce: ['DEGATS'], Explores: [], Investigated: ['JETON'],
  Always: ['STATIQUE'], Immediate: ['STATIQUE'], NewTurn: ['DEBUT_TOUR'], TurnBegin: ['DEBUT_TOUR'],
  Countered: [], SpellCopy: [], Evolved: [], Exerted: [], Crewed: [], BecomesCrewed: [], Championed: [],
  Clashed: [], Vote: [], Abandoned: [], Foretell: [], Adapt: [], BecomeRenowned: [], BecomesPlotted: [],
  ChaosEnsues: [], PlaneswalkedTo: [], PlaneswalkedFrom: [], SetInMotion: [], CrankContraption: [],
  UnlockDoor: [], Specializes: [], Mutates: [], Saddled: [], Stationed: [], Collected: [], Enlisted: [],
  Trains: [], Mentored: [], ClassLevelGained: [], FullyUnlock: [], ConniveOnce: [], Discover: [],
  RingTemptsYou: [], VisitAttraction: [], Revealed: ['REVELATION'], Shuffled: [], SearchedLibrary: [],
  BecomesSaddled: [], Forage: [], Cloaked: [], ManifestDread: [], Airbend: [], Earthbend: [], Waterbend: [],
  Firebend: [], ElementalBend: [], CommitCrime: [], BecomeMonstrous: [], LosesGame: [], FacesDilemma: [],
  StickerPlaced: [], AbilityTriggered: [], PayCumulativeUpkeep: [], Unattached: [], PhaseIn: [], PhaseOut: [],
  ExcessDamage: ['DEGATS']
};

/* Un effet de changement de zone, lu d'après ses zones. `~EXIL_JEU` et
   `~RETOUR` sont des marques provisoires : un exil suivi d'un retour en jeu
   est un blink, que la chaîne entière seule peut voir (js/grapheForge.js). */
function noeudsDeplacement(t) {
  const o = zonesForge(t.Origin), d = zonesForge(t.Destination);
  const de = z => o.includes(z);
  const terrain = estTerrainForge(t.ChangeType);
  if (d.includes('Battlefield')) {
    if (de('Graveyard')) return ['RECURSION'];
    if (de('Library')) return terrain ? ['RAMP'] : ['TUTEUR'];
    if (de('Hand')) return terrain ? ['RAMP'] : [];
    if (de('Exile') || de('All') || de('Any')) return ['~RETOUR'];
    return [];
  }
  if (d.includes('Hand')) {
    if (de('Graveyard')) return ['RECURSION'];
    if (de('Library')) return ['TUTEUR'];
    if (de('Battlefield')) return ['BOUNCE'];
    return [];
  }
  if (d.includes('Exile')) {
    if (de('Battlefield')) return ['~EXIL_JEU'];
    if (de('Library')) return /Opp|Targeted/.test((t.Defined || '') + (t.ChangeType || '')) ? ['EXIL'] : ['IMPULSE'];
    return ['EXIL'];
  }
  /* Chercher dans sa bibliothèque et y remettre la carte au-dessus, c'est encore un tuteur. */
  if (d.includes('Library')) return de('Library') ? (t.ChangeType || t.Hidden ? ['TUTEUR'] : []) : ['MIS_EN_BIBLIO'];
  if (d.includes('Graveyard')) {
    if (de('Library')) return ['MILL'];
    if (de('Hand')) return ['DEFAUSSE'];
    if (de('Battlefield')) return ['MIS_AU_CIMETIERE'];
  }
  return [];
}

/* Ce qu'on va chercher est un terrain : `Land.Basic`, `Island,Swamp`, `Plains.Basic`… */
const GF_TERRAINS = /^(Land|Plains|Island|Swamp|Mountain|Forest|Wastes|Desert|Gate|Cave|Town|Sphere|Locus)$/;
function estTerrainForge(type) {
  const alts = alternativesForge(type);
  return alts.length > 0 && alts.every(a => GF_TERRAINS.test(a.tete) || a.props.some(p => GF_TERRAINS.test(p)));
}

function noeudsJeton(t, ctx) {
  return String(t.TokenScript || '').split(',').filter(Boolean).map(nom => {
    const j = jetonForge(nom.trim(), ctx.jeton ? ctx.jeton(nom.trim()) : null);
    ctx.jetons.push(j);
    return j.tresor ? 'TRESOR' : 'JETON';
  });
}

function noeudsPompe(t) {
  const n = [];
  if (t.NumAtt || t.NumDef) n.push('BOOST');
  return n.concat(noeudsMotsClesDonnes(t.KW));
}

const GF_EFFETS = {
  Draw: ['PIOCHE'], Dig: t => /^Battlefield$/.test(t.DestinationZone || '') ? ['TUTEUR'] : ['IMPULSE'],
  DigUntil: t => ['REVELATION'].concat(/Graveyard/.test(t.RevealedDestination || '') ? ['MILL'] : []),
  RearrangeTopOfLibrary: ['IMPULSE'], Scry: ['IMPULSE'], Surveil: ['IMPULSE'], PeekAndReveal: ['REVELATION'],
  Reveal: ['REVELATION'], RevealHand: ['REVELATION'],
  ChangeZone: noeudsDeplacement, ChangeZoneAll: noeudsDeplacement,
  Token: noeudsJeton, CopyPermanent: ['COPIE', 'JETON'], CopySpellAbility: ['COPIE'], Clone: ['COPIE'],
  PutCounter: t => [noeudMarqueur(t.CounterType)], PutCounterAll: t => [noeudMarqueur(t.CounterType)],
  MoveCounter: ['MARQUEUR'], MultiplyCounter: ['MARQUEUR'], Proliferate: ['PROLIFERATION'],
  RemoveCounter: ['MARQUEUR_RETIRE'], RemoveCounterAll: ['MARQUEUR_RETIRE'],
  DealDamage: ['DEGATS'], DamageAll: ['DEGATS'], EachDamage: ['DEGATS'], Fight: ['DEGATS'],
  GainLife: ['GAIN_VIE'], LoseLife: ['PERTE_VIE'], Destroy: ['DESTRUCTION'], DestroyAll: ['DESTRUCTION'],
  Sacrifice: ['SACRIFICE'], SacrificeAll: ['SACRIFICE'], Discard: ['DEFAUSSE'], Mill: ['MILL'],
  Mana: ['MANA'], ManaReflected: ['MANA'], Counter: ['CONTRESORT'],
  /* Engager « en entrant » est le terrain qui arrive engagé : il ne fait rien aux autres. */
  Tap: t => t.ETB === 'True' ? [] : ['ENGAGEMENT'], TapAll: ['ENGAGEMENT'], TapOrUntap: ['ENGAGEMENT', 'UNTAP'], TapOrUntapAll: ['ENGAGEMENT', 'UNTAP'],
  Untap: ['UNTAP'], UntapAll: ['UNTAP'], Pump: noeudsPompe, PumpAll: noeudsPompe,
  Animate: t => noeudsMotsClesDonnes(t.Keywords), AnimateAll: t => noeudsMotsClesDonnes(t.Keywords),
  Protection: ['PROTECTION'], ProtectionAll: ['PROTECTION'],
  /* Le vol de contrôle dégage souvent et donne la célérité : `Untap$`, `AddKWs$`. */
  GainControl: t => ['GAIN_CONTROLE', ...(t.Untap ? ['UNTAP'] : []), ...noeudsMotsClesDonnes(t.AddKWs)], ExchangeControl: ['GAIN_CONTROLE'], Attach: ['ATTACHEMENT'],
  SetState: t => /TurnFace/.test(t.Mode || '') ? ['FACE_VISIBLE'] : ['TRANSFORMATION'],
  Manifest: ['FACE_VISIBLE'], ManifestDread: ['FACE_VISIBLE'], Cloak: ['FACE_VISIBLE'],
  RollDice: ['DE'], FlipACoin: ['DE'], BecomeMonarch: ['MONARQUE'], TakeInitiative: ['MONARQUE'],
  Venture: ['DONJON'], AddTurn: ['TOUR_SUPPLEMENTAIRE'],
  Investigate: ['JETON'], Amass: ['JETON', 'MARQUEUR'], Populate: ['JETON'], Incubate: ['JETON'],
  Explore: ['MARQUEUR', 'IMPULSE'], Connive: ['PIOCHE', 'DEFAUSSE'], Seek: ['TUTEUR'],
  Endure: ['MARQUEUR'], Bolster: ['MARQUEUR'], FlipCoin: ['DE'], Poison: ['POISON'], DayTime: ['JOUR_NUIT'],
  Earthbend: ['MARQUEUR'], Radiation: ['MARQUEUR_AUTRE'], Detain: ['STAX'], DigMultiple: ['IMPULSE'],
  AddOrRemoveCounter: ['MARQUEUR'], GainControlVariant: ['GAIN_CONTROLE'], ControlSpell: ['GAIN_CONTROLE'],
  Recruit: ['TUTEUR'], TimeTravel: ['MARQUEUR_AUTRE'], Blight: ['MARQUEUR_M1M1'], GainOwnership: ['GAIN_CONTROLE'],
  Bookkeeping: [], WinsGame: [], LosesGame: [], Empower: [], Nothing: [], PutSticker: [], Fog: [], TwoPiles: [],
  AssembleContraption: [], OpenAttraction: [], Airbend: [], VillainousChoice: [], ChangeText: [], EndOfTurn: [],
  Assimilate: [], DrainMana: [], BlankLine: [], UnlockDoor: [],
  /* Ce qu'on joue d'ailleurs que sa main : le cimetière est de la récursion,
     l'exil et la bibliothèque de l'impulsion. */
  Play: t => /Graveyard/.test(t.ValidZone || '') ? ['RECURSION'] : /Exile|Library/.test(t.ValidZone || '') ? ['IMPULSE'] : [],
  Cleanup: [], StoreSVar: [], ChooseType: [], ChooseColor: [], ChooseCard: [], ChoosePlayer: [], ChooseNumber: [],
  ChooseSource: [], ChooseDirection: [], ChooseEvenOdd: [], NameCard: [], TargetOnly: [], Shuffle: [], SetLife: [],
  ExchangeLife: [], AlterAttribute: [], Vote: [], Clash: [], Balance: [], Goad: [], AddPhase: [], Regenerate: [],
  PreventDamage: [], Phases: [], ChangeTargets: [], MustBlock: [], Encode: [], MakeCard: [], LookAt: [],
  Learn: [], Discover: [], Planeswalk: [], Abandon: [], SetInMotion: [], RunChaos: [], Debuff: [],
  RestartGame: [], Subgame: [], StoreMap: [], ClassLevelUp: [], RingTemptsYou: [], Unattach: [], UnattachAll: [],
  ReorderZone: [], PermanentCreature: [], PermanentNoncreature: [], ReplaceToken: [], ReplaceCounter: [],
  ReplaceEffect: [], ReplaceDamage: [], ReplaceMana: [], ReplaceSplitDamage: [], ChooseGeneric: [],
  Effect: [], Charm: [], GenericChoice: [], DelayedTrigger: [], ImmediateTrigger: [], RepeatEach: [], Repeat: [], Branch: [],
  Mutate: [], ExchangeZone: [], Meld: [], AssignGroup: [],
  ChangeCombatants: [], RemoveFromCombat: [], Camouflage: [], BecomesBlocked: [], ControlPlayer: [],
  SkipTurn: [], SkipPhase: [], EndTurn: [], Heist: [], DamageResolve: [], ChooseDrawTypes: [], Block: [],
  Draft: [], Intensify: [], Perpetual: [], Specialize: [], Stationed: [], Saddle: []
};

/* Ce qui balaie et sur qui porte ce qui détruit, lu dans la structure plutôt
   que dans « all », « each » ou « you control » : `categories()`
   (js/categories.js) s'y fie quand la lecture vient de Forge. Un effet
   « de masse » restreint à ce qu'on cible, à ce qu'on a retenu ou à ce qui
   est attaché à une créature ne balaie rien. */
const GF_DESTRUCTIFS = ['DESTRUCTION', 'EXIL', '~EXIL_JEU', 'BOUNCE', 'DEGATS', 'CONTRESORT', 'MIS_EN_BIBLIO'];
const GF_RESTREINT = /IsTargeted|IsRemembered|IsImprinted|Attached|EnchantedBy|EquippedBy|\.Self\b/;

/* Une désignation (`Defined$`) nomme des objets précis ; un filtre ne
   restreint que s'il le dit sans négation (`!IsRemembered` exclut, il ne
   restreint pas). */
function restreintForge(t) {
  if (t.Defined && !/^Valid\b/.test(t.Defined)) return true;
  return GF_RESTREINT.test([t.ValidCards, t.ChangeType].filter(Boolean).join(',').replace(/!\w+/g, ''));
}

function masseForge(api, t, r, n) {
  const quoi = [t.ValidCards, t.ChangeType, t.Defined].filter(Boolean).join(',');
  const large = !restreintForge(t);
  const champ = zonesForge(t.Origin).includes('Battlefield');
  const affaiblit = api === 'PumpAll' && /^-/.test(t.NumDef || '') && large;
  const m = {
    masse: r.masse || (large && (api === 'DestroyAll' || (api === 'ChangeZoneAll' && champ) || (api === 'DamageAll' && !!t.ValidCards))) || affaiblit,
    affaiblit: r.affaiblit || affaiblit,
    sacTable: r.sacTable || (api === 'SacrificeAll' && large && !/YouCtrl/.test(quoi))
      || (api === 'Sacrifice' && (/^(Player|Opponent)/.test(t.Defined || '') || (t.Defined === 'Remembered' && r.chaqueJoueur))
        && !/Self/.test(t.SacValid || '')),
    chaqueJoueur: r.chaqueJoueur || (api === 'RepeatEach' && /^Player/.test(t.RepeatPlayers || '')),
    destructifs: r.destructifs, surSoi: r.surSoi
  };
  if (n.some(x => GF_DESTRUCTIFS.includes(x))) {
    m.destructifs++;
    const cible = [t.ValidTgts, t.Defined, t.ValidCards, t.ChangeType].filter(Boolean).join(',');
    if (cible && alternativesForge(cible).every(a => estSoiForge(a) || a.tete === 'You'
      || a.props.includes('YouCtrl') || a.props.includes('YouOwn'))) m.surSoi++;
  }
  return m;
}

/* Ce que les rôles d'une carte lisent sur une capacité de Forge. */
function rolesForge(ch) {
  return {masse: ch.masse, affaiblit: ch.affaiblit, sacTable: ch.sacTable, surSoi: ch.destructifs > 0 && ch.surSoi === ch.destructifs};
}
