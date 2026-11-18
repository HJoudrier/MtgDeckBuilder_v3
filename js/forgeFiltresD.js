/* =====================================================================
   js/forgeFiltresD.js — Des propriétés de filtre de plus, II

   Lots F70 et F71 :
   - ce qu'un effet a choisi, retenu ou visé : `nonChosenCard` (Mount Doom),
     `TargetedPlayerOwn`, `RememberedPlayerOwn` (Search Warrant,
     Singularity Rupture), `ExiledWithEffectSource` ;
   - la carte elle-même : `withToxic`, `withFlashback`, `cmcEven` / `cmcOdd`,
     `equalPT`, `hasManaAbility`, `hasAbility Activated.hasTapCost`,
     `basePowerEQ0`, `totalPT_LE5`, `powerNOTbasePower`, `greatestCMC_Artifact`,
     `sharesPermanentTypeWith`, `TopGraveyardCreature` (Shallow Grave),
     `EnchantedBy Aura.YouCtrl` ;
   - le plateau : `ControllerControlsMoreLand`, `Player.withMoreLandsThanYou`.
   Une propriété qu'on ne sait pas juger ne laisse rien passer.
   ===================================================================== */

const COMPARAISONS = '(GE|LE|GT|LT|EQ|NE)';
const comptesTerrains = (P, j) => champDe(P, j).filter(o => estType(o, 'land')).length;

proprieteDesignee = (g => function (P, o, p, c, src, ctrl, env) {
  const joueur = ctrl != null ? ctrl : o.ctrl;
  let m;
  switch (p) {
    case 'nonChosenCard': {
      if (!P || !src) return false;
      return !(choixDe(P, src).cartes || []).some(id => id === o.id || suit(P, id) === o.id);
    }
    case 'ExiledWithEffectSource': return !!P && propObjet(P, o, c, 'ExiledWithSource', src, ctrl, env);
    case 'TargetedPlayerOwn': return !!env && !!env.ctx && ciblesJoueurs(env).includes(o.prop);
    case 'RememberedPlayerOwn': return !!env && !!env.ctx && (env.ctx.memoJ || []).includes(o.prop);
    case 'withToxic': return !!(o.def.params && o.def.params.toxique);
    case 'withFlashback': return !!(o.def.flashback || o.def.harmonie || o.flashbackTemp != null);
    case 'cmcEven': return mvDe(o) % 2 === 0;
    case 'cmcOdd': return mvDe(o) % 2 === 1;
    case 'equalPT': return c.force === c.endurance;
    case 'hasManaAbility': return (o.zone === 'champ' ? capacitesDe(P, o) : o.def.capacites).some(k => k.genre === 'mana');
    case 'hasAbility Activated.hasTapCost': return (o.zone === 'champ' ? capacitesDe(P, o) : o.def.capacites).some(k => k.genre === 'activee' && !!(k.cout && k.cout.engage));
    case 'powerNOTbasePower': return c.force !== (o.def.force || 0);
    case 'greatestCMC_Artifact': return !!P && !P.champ.some(id => { const x = obj(P, id); return x.ctrl === joueur && estType(x, 'artifact') && mvDe(x) > mvDe(o); });
    case 'sharesPermanentTypeWith':
      return !!src && !!src.def && TYPES_PERMANENTS.some(t => (c.types || []).includes(t) && (src.lki ? src.types : car(P, src).types).includes(t));
    case 'TopGraveyardCreature': {
      if (!P || o.zone !== 'cimetiere') return false;
      const G = P.joueurs[o.prop].cimetiere;
      for (let i = G.length - 1; i >= 0; i--) if (estCreature(obj(P, G[i]))) return G[i] === o.id;
      return false;
    }
    case 'ControllerControlsMoreLand': return !!P && comptesTerrains(P, o.ctrl) > comptesTerrains(P, joueur);
    case 'wasCastFromTheirHand': return !!o.lance && o.lance.depuis === 'main';
    case 'milledThisTurn': return !!P && o.meuleTour === P.tour;
    case 'attackingYou': {
      const d = P && P.combat && P.combat.attaquants.get(o.id);
      return !!d && (d.j != null ? d.j === joueur : !!obj(P, d.pw) && obj(P, d.pw).ctrl === joueur);
    }
    case 'attackedThisCombat': return !!P && !!P.combat && P.combat.attaquants.has(o.id);
    case 'bargained': return !!o.marchande || o.varianteLance === 'bargain';
  }
  /* Le tour : d'où une carte est entrée, comment un sort a été lancé, le combat en cours. */
  if ((m = /^ThisTurnEnteredFrom_(\w+)$/.exec(p))) return !!P && (P.entresTour || []).some(x => x.vers === 'champ' && x.de === ZONES_FORGE[m[1]] && x.o && x.o.id === o.id);
  if ((m = /^CastSa (.+)$/.exec(p))) {
    const depense = Object.values(manaDepenseDe(o) || {}).reduce((a, b) => a + b, 0);
    if (m[1] === 'Spell.MayPlaySource') return o.varianteLance === 'permis';
    if (m[1] === 'Spell.ManaFromTreasure') return ((o.manaDe || {}).treasure || 0) > 0;
    const k = /^Spell\.ManaSpent (EQ|GE|LE|GT|LT)(\d+)$/.exec(m[1]);
    return !!k && !!o.lance && compareForge(depense, k[1], +k[2]);
  }
  if (p === 'dealtCombatDamageThisTurn You') return !!P && ((histoire(P).degatsCombatPar || {})[joueur] || []).includes(o.id);
  if (p === 'TriggeredAttacker' || p === 'TriggeredNewCard') { const e = env && env.ctx && env.ctx.evt; const id = e && (e.id != null ? e.id : e.ancien); return id != null && (id === o.id || (!!P && suit(P, id) === o.id)); }
  /* `EnchantedBy Aura.YouCtrl` : une aura qui répond au filtre est attachée à l'objet. */
  if ((m = /^EnchantedBy (.+)$/.exec(p))) return !!P && P.champ.some(id => { const a = obj(P, id); return a.att === o.id && forgeValideObjet(P, a, m[1], src, joueur, env); });
  if ((m = /^base(Power|Toughness)(GE|LE|GT|LT|EQ|NE)(-?\d+)$/.exec(p))) return compareForge(m[1] === 'Power' ? o.def.force || 0 : o.def.endurance || 0, m[2], +m[3]);
  if ((m = /^totalPT_(GE|LE|GT|LT|EQ|NE)(\d+)$/.exec(p))) return compareForge((c.force || 0) + (c.endurance || 0), m[1], +m[2]);
  return g(P, o, p, c, src, ctrl, env);
})(proprieteDesignee);

/* Un joueur qui a plus de terrains que celui qui juge (Cartographer's Hawk). */
function proprieteJoueurEtendue(P, j, p, ctrl) {
  if (p === 'withMoreLandsThanYou') return comptesTerrains(P, j) > comptesTerrains(P, ctrl);
  if (p === 'withMoreCreaturesThanYou') return champDe(P, j).filter(estCreature).length > champDe(P, ctrl).filter(estCreature).length;
  return false;
}

forgeSait('filtre', 'TargetedCard', "Urza's", 'nonChosenCard', 'ExiledWithEffectSource', 'TargetedPlayerOwn', 'RememberedPlayerOwn', 'withToxic', 'withFlashback', 'cmcEven', 'cmcOdd',
  'equalPT', 'hasManaAbility', 'hasAbility Activated.hasTapCost', 'powerNOTbasePower', 'greatestCMC_Artifact', 'sharesPermanentTypeWith',
  'TopGraveyardCreature', 'ControllerControlsMoreLand', 'wasCastFromTheirHand', 'milledThisTurn', 'attackingYou', 'attackedThisCombat', 'dealtCombatDamageThisTurn You', 'TriggeredAttacker', 'TriggeredNewCard', 'OppNonTriggeredTarget',
  'CastSa Spell.MayPlaySource', 'CastSa Spell.ManaFromTreasure', 'CastSa Spell.ManaSpent EQ0', ...['Graveyard', 'Battlefield', 'Library', 'Hand', 'Exile'].map(z => 'ThisTurnEnteredFrom_' + z), 'bargained', 'withMoreLandsThanYou', 'withMoreCreaturesThanYou', 'Chosen', 'ChosenPlayer',
  'EnchantedBy Aura.YouCtrl', 'basePowerXX', 'baseToughnessXX', 'totalPT_XX');
