/* =====================================================================
   js/grapheForgeMotsCles.js — Les mots-clés, statiques et remplacements de Forge dans le graphe

   La suite de js/grapheForgeTables.js, pour ce qui ne passe pas par une
   chaîne d'effets : un mot-clé dit à lui seul ce qu'il donne ou ce qu'il
   déclenche ; une statique, ce qu'elle permet ou interdit ; un remplacement,
   ce dont il se nourrit et ce qu'il produit à la place.
   ===================================================================== */

/* Les mots-clés donnés par un effet ou une statique : `Flying & Trample`. */
function noeudsMotsClesDonnes(liste) {
  return String(liste || '').split('&').map(x => x.trim()).filter(Boolean)
    .flatMap(k => (GF_MOTS_CLES[nomMotCleForge(k)] || {}).to || []);
}

function nomMotCleForge(k) {
  const s = String(k).replace(/^HIDDEN\s+/, '').trim();
  if (/can't be blocked/i.test(s) || /^Unblockable/.test(s)) return 'Unblockable';
  if (/can't (?:attack|block)|doesn't untap/i.test(s)) return 'Contrainte';
  return s.split(/[: ]/)[0];
}

/* Les mots-clés : un nœud qu'ils donnent (`to`), ou un déclencheur entier
   — ce qui le fait partir (`from`, avec sa qualification `q`), ce qu'il
   produit. `soi` : la carte se déclenche sur elle-même, rien ne la nourrit. */
const GF_Q_SORT_NC = {portee: 'vous', sujet: 'spell', filtres: [{t: 'sortnon', v: 'creature'}]};
const GF_MOTS_CLES = {
  Flying: {to: ['VOL']}, Trample: {to: ['PIETINEMENT']}, Haste: {to: ['CELERITE']}, Vigilance: {to: ['VIGILANCE']},
  Menace: {to: ['MENACE']}, Intimidate: {to: ['MENACE']}, Fear: {to: ['MENACE']}, Indestructible: {to: ['INDESTRUCTIBLE']},
  Hexproof: {to: ['LINCEUL']}, Shroud: {to: ['LINCEUL']}, Ward: {to: ['PROTECTION']}, Protection: {to: ['PROTECTION']},
  Lifelink: {to: ['GAIN_VIE']}, Infect: {to: ['POISON']}, Toxic: {to: ['POISON']}, Poisonous: {to: ['POISON']},
  Wither: {to: ['MARQUEUR_M1M1']}, Unblockable: {to: ['IMBLOCABLE']},
  Cycling: {to: ['CYCLE']}, TypeCycling: {to: ['CYCLE']}, Landcycling: {to: ['CYCLE']},
  Flashback: {to: ['RECURSION']}, Escape: {to: ['RECURSION']}, Unearth: {to: ['RECURSION']}, Retrace: {to: ['RECURSION']},
  'Jump-start': {to: ['RECURSION']}, Disturb: {to: ['RECURSION']}, Embalm: {to: ['RECURSION', 'JETON']},
  Eternalize: {to: ['RECURSION', 'JETON']}, Aftermath: {to: ['RECURSION']}, Encore: {to: ['RECURSION', 'JETON']},
  Equip: {to: ['ATTACHEMENT']}, Reconfigure: {to: ['ATTACHEMENT']}, Bestow: {to: ['ATTACHEMENT']},
  Morph: {to: ['FACE_VISIBLE']}, Megamorph: {to: ['FACE_VISIBLE']}, Disguise: {to: ['FACE_VISIBLE']},
  /* Donné par un effet à une autre créature, « ne peut pas bloquer » est une
     contrainte ; porté par la carte elle-même, rien (js/grapheForge.js). */
  Contrainte: {to: ['STAX']},
  Daybound: {to: ['TRANSFORMATION', 'JOUR_NUIT']}, Nightbound: {to: ['TRANSFORMATION', 'JOUR_NUIT']},
  Riot: {to: ['MARQUEUR', 'CELERITE']}, etbCounter: {to: ['MARQUEUR']}, Storm: {to: ['COPIE']},
  'Living': {to: ['JETON', 'ATTACHEMENT']}, Myriad: {to: ['JETON']},
  Prowess: {from: ['LANCEMENT'], to: ['BOOST'], q: GF_Q_SORT_NC},
  Extort: {from: ['LANCEMENT'], to: ['PERTE_VIE', 'GAIN_VIE'], q: {portee: 'vous', sujet: 'spell', filtres: []}},
  Exalted: {from: ['ATTAQUE_SEULE'], to: ['BOOST'], q: {portee: 'vous', sujet: 'creature', filtres: []}},
  Evolve: {from: ['ETB'], to: ['MARQUEUR'], q: {portee: 'vous', sujet: 'creature', filtres: [{t: 'autre'}]}},
  Afterlife: {from: ['MORT_SOI'], to: ['JETON'], soi: true}, Undying: {from: ['MORT_SOI'], to: ['RECURSION', 'MARQUEUR'], soi: true},
  Persist: {from: ['MORT_SOI'], to: ['RECURSION', 'MARQUEUR_M1M1'], soi: true},
  Fabricate: {from: ['ETB_SOI'], to: ['MARQUEUR', 'JETON'], soi: true},
  Modular: {from: ['MORT_SOI'], to: ['MARQUEUR'], soi: true},
  Mentor: {from: ['ATTAQUE'], to: ['MARQUEUR'], soi: true}, Training: {from: ['ATTAQUE'], to: ['MARQUEUR'], soi: true},
  Annihilator: {from: ['ATTAQUE'], to: ['SACRIFICE'], soi: true, adv: true},
  Dethrone: {from: ['ATTAQUE'], to: ['MARQUEUR'], soi: true},
  Mobilize: {from: ['ATTAQUE'], to: ['JETON'], soi: true}, Soulshift: {from: ['MORT_SOI'], to: ['RECURSION'], soi: true},
  Backup: {from: ['ETB_SOI'], to: ['MARQUEUR'], soi: true}, Renown: {from: ['DEGATS_COMBAT_JOUEUR'], to: ['MARQUEUR'], soi: true},
  Bloodthirst: {to: ['MARQUEUR']}, Sunburst: {to: ['MARQUEUR']}, Graft: {to: ['MARQUEUR']}, Outlast: {to: ['MARQUEUR']},
  Scavenge: {to: ['MARQUEUR', 'RECURSION']}, Awaken: {to: ['MARQUEUR']}, Adapt: {to: ['MARQUEUR']},
  Vanishing: {to: ['MARQUEUR_AUTRE']}, Fading: {to: ['MARQUEUR_AUTRE']}, Dredge: {to: ['RECURSION', 'MILL']},
  Offspring: {to: ['JETON']}, Squad: {to: ['JETON', 'COPIE']}, For: {to: ['JETON']},
  /* Les mots-clés qui sont des coûts : sacrifier, engager ses créatures,
     exiler son cimetière. Ils font de la carte un exutoire, comme le même coût
     écrit en toutes lettres (les entrées de `COUTS`, js/effets.js). */
  Exploit: {couts: ['SAC_CREATURE'], sujet: 'creature', to: ['SACRIFICE']},
  Devour: {couts: ['SAC_CREATURE'], sujet: 'creature', to: ['SACRIFICE', 'MARQUEUR']},
  Casualty: {couts: ['SAC_CREATURE'], sujet: 'creature', to: ['SACRIFICE', 'COPIE']},
  Emerge: {couts: ['SAC_CREATURE'], sujet: 'creature', to: ['SACRIFICE']}, Bargain: {couts: ['SAC_CREATURE'], to: ['SACRIFICE']},
  Convoke: {couts: ['ENGAGER_AUTRES'], sujet: 'creature', to: []}, Crew: {couts: ['ENGAGER_AUTRES'], sujet: 'creature', to: []},
  Improvise: {couts: ['ENGAGER_AUTRES'], sujet: 'artifact', to: []}, Delve: {couts: ['EXILER_CIM'], sujet: 'card', to: []}, Bushido: {from: ['BLOCAGE'], to: ['BOOST'], soi: true},
  Flanking: {from: ['DEVIENT_BLOQUEE'], to: ['BOOST'], soi: true}, Rampage: {from: ['DEVIENT_BLOQUEE'], to: ['BOOST'], soi: true}
};

/* Les statiques autres que `Continuous` (lue à part : elle donne des
   mots-clés, des capacités, des permissions). Une contrainte qui ne porte
   que sur la carte elle-même — « ~ ne peut pas bloquer » — n'est pas du stax. */
function contrainteAutrui(t) {
  const v = t.ValidCard || t.Affected || t.ValidAttacker || t.ValidBlocker || t.Activator || '';
  return v && alternativesForge(v).every(estSoiForge) ? [] : ['STAX'];
}

const GF_STATIQUES = {
  /* Un surcoût qu'on ne s'impose qu'à soi (« vos sorts rouges coûtent {R} de plus ») n'est pas une taxe. */
  ReduceCost: ['REDUCTION'], RaiseCost: t => /^You$/.test(t.Activator || '') ? [] : ['TAXE'], CantBeCast: contrainteAutrui, CantAttack: contrainteAutrui,
  CantBlock: contrainteAutrui, CantBeActivated: contrainteAutrui, CantPlayLand: contrainteAutrui,
  CantGainLife: contrainteAutrui, CantDraw: contrainteAutrui, CantSearchLibrary: contrainteAutrui,
  CantAttackUnless: contrainteAutrui, CantTarget: ['PROTECTION'], CantBlockBy: ['IMBLOCABLE'],
  Panharmonicon: ['COPIE'], UntapOtherPlayer: ['UNTAP'],
  AlternativeCost: [], OptionalCost: [], CastWithFlash: [], MinMaxBlocker: [], MustAttack: [], CanAttackDefender: [],
  OptionalAttackCost: [], CombatDamageToughness: [], AssignCombatDamageAsUnblocked: [], TapPowerValue: [],
  ManaConvert: [], IgnoreLegendRule: [], IgnoreLandWalk: [], CantSacrifice: [], CantPreventDamage: [],
  CantPutCounter: [], MustBlock: [], CantTransform: [], CantRegenerate: [], CantBeSacrificed: [],
  CantChangeDayTime: [], CantVenture: [], CantExile: [], CantBeDestroyed: ['INDESTRUCTIBLE'], Devotion: [],
  ManaConvertSpecial: [], AttackRequirement: [], CantCrew: [], CantEquip: [], CantAttach: [], BlockRestrict: [],
  CantDiscard: [], CantBecomeMonarch: [], PlayerMustAttack: [], CastFromGraveyard: ['RECURSION'], CountersRemain: [],
  CantBlockUnless: contrainteAutrui, AttackRestrict: ['STAX'], DisableTriggers: ['STAX'], CantChangeLife: contrainteAutrui,
  CantPayLife: contrainteAutrui, CantPhaseIn: [], AssignNoCombatDamage: [], NoCleanupDamage: [], UnspentMana: [],
  NumLoyaltyAct: [], CanBlockIfShadow: [], IgnoreHexproof: [], ActivateAbilityAsIfHaste: []
};

/* Un remplacement : ce dont il se nourrit (`nourri`) et ce qu'il produit.
   `to` est ce que la chaîne de `ReplaceWith$` produit ; `rw` sa première
   table. Doubler des jetons, ajouter un marqueur, augmenter des blessures
   ou un gain de vie se nourrissent de la même chose qu'ils produisent. */
function amplifie(noeud) { return () => ({nourri: [noeud], to: [noeud]}); }

const GF_REMPLACEMENTS = {
  CreateToken: amplifie('JETON'),
  AddCounter: t => ({nourri: [noeudMarqueur(t.ValidCounterType)], to: [noeudMarqueur(t.ValidCounterType)]}),
  GainLife: (t, to) => ({nourri: ['GAIN_VIE'], to: to.length ? to : ['GAIN_VIE']}),
  DamageDone: (t, to, rw) => rw && forgeApi(rw) === 'ReplaceEffect' && /Damage/.test(rw.VarName || '')
    ? {nourri: ['DEGATS'], to: ['DEGATS']} : {nourri: [], to: t.Prevent ? [] : to},
  Draw: (t, to) => ({nourri: ['PIOCHE'], to}), DrawCards: (t, to) => ({nourri: ['PIOCHE'], to}),
  Untap: t => ({nourri: [], to: contrainteAutrui(t)}),
  Counter: () => ({nourri: [], to: []}),
  Moved: (t, to) => ({nourri: [], to}), Destroy: (t, to) => ({nourri: [], to}),
  Mill: (t, to) => ({nourri: ['MILL'], to}), Discard: (t, to) => ({nourri: [], to}),
  Scry: (t, to) => ({nourri: [], to}), Surveil: (t, to) => ({nourri: [], to}), Explore: (t, to) => ({nourri: [], to}),
  LoseLife: (t, to) => ({nourri: [], to}), Tap: (t, to) => ({nourri: [], to}), Transform: (t, to) => ({nourri: [], to}),
  TurnFaceUp: (t, to) => ({nourri: [], to}), Attached: (t, to) => ({nourri: [], to}),
  ProduceMana: (t, to) => ({nourri: ['MANA'], to: to.length ? to : ['MANA']}),
  BeginPhase: (t, to) => ({nourri: [], to}), BeginTurn: (t, to) => ({nourri: [], to}),
  Cascade: (t, to) => ({nourri: [], to}), Proliferate: (t, to) => ({nourri: [], to}),
  PayLife: (t, to) => ({nourri: [], to}), Learn: (t, to) => ({nourri: [], to}),
  RollDie: (t, to) => ({nourri: [], to}), RollPlanarDice: (t, to) => ({nourri: [], to}),
  GameLoss: () => ({nourri: [], to: []}), GameWin: () => ({nourri: [], to: []}),
  SetInMotion: () => ({nourri: [], to: []}), PlanarDiceResult: () => ({nourri: [], to: []}),
  GainControl: (t, to) => ({nourri: [], to}), Lose: () => ({nourri: [], to: []}),
  AssembleContraption: () => ({nourri: [], to: []}), AssignDealDamage: (t, to) => ({nourri: [], to}),
  DeclareBlocker: (t, to) => ({nourri: [], to}), LifeReduced: (t, to) => ({nourri: [], to}),
  LoseMana: () => ({nourri: [], to: []})
};
