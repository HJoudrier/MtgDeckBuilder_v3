/* =====================================================================
   js/cartes.js — Base de cartes, indexation, analyse & typage
   ===================================================================== */

const RAW = `
Swords to Plowshares|{W}|Instant|1.5|Exile target creature. Its controller gains life equal to its power.
Path to Exile|{W}|Instant|3|Exile target creature. Its controller may search their library for a basic land card, put it onto the battlefield tapped, then shuffle.
Mother of Runes|{W}|Creature — Human Cleric|8|{T}: Target creature you control gains protection from the color of your choice until end of turn.
Esper Sentinel|{W}|Artifact Creature — Human Soldier|20|Whenever an opponent casts their first noncreature spell each turn, draw a card unless that player pays {1} for each artifact you control.
Thalia, Guardian of Thraben|{1}{W}|Legendary Creature — Human Soldier|3|First strike // Noncreature spells cost {1} more to cast.
Land Tax|{W}|Enchantment|10|At the beginning of your upkeep, if an opponent controls more lands than you, you may search your library for up to three basic land cards, reveal them, put them into your hand, then shuffle.
Blade Splicer|{2}{W}|Creature — Human Artificer|1|When Blade Splicer enters, create a 3/3 colorless Phyrexian Golem artifact creature token. // Golem creatures you control have first strike.
Skyclave Apparition|{1}{W}{W}|Creature — Kor Spirit|5|When Skyclave Apparition enters, exile target nonland, nontoken permanent an opponent controls with mana value 4 or less.
Welcoming Vampire|{2}{W}|Creature — Vampire|2|Flying // Whenever another creature with power 2 or less you control enters, draw a card. This ability triggers only once each turn.
Sram, Senior Edificer|{1}{W}|Legendary Creature — Dwarf Advisor|2|Whenever you cast an Aura, Equipment, or Vehicle spell, draw a card.
Restoration Angel|{3}{W}|Creature — Angel|1|Flash // Flying // When Restoration Angel enters, you may exile target non-Angel creature you control, then return that card to the battlefield under its owner's control.
Ephemerate|{W}|Instant|2|Exile target creature you control, then return it to the battlefield under its owner's control.
Felidar Guardian|{2}{W}|Creature — Cat Beast|1|When Felidar Guardian enters, you may exile another target permanent you control, then return it to the battlefield under its owner's control.
Sun Titan|{4}{W}{W}|Creature — Giant|1|Flying // Whenever Sun Titan enters or attacks, return target permanent card with mana value 3 or less from your graveyard to the battlefield.
Smothering Tithe|{3}{W}|Enchantment|18|Whenever an opponent draws a card, that player may pay {2}. If the player doesn't, you create a Treasure token.
Anointed Procession|{3}{W}|Enchantment|22|If an effect would create one or more tokens under your control, it creates twice that many of those tokens instead.
Cathars' Crusade|{3}{W}{W}|Enchantment|8|Whenever a creature you control enters, put a +1/+1 counter on each creature you control.
Archon of Emeria|{2}{W}|Creature — Archon|3|Flying // Each player can't cast more than one spell each turn. // Nonbasic lands your opponents control enter tapped.
Enlightened Tutor|{W}|Instant|20|Search your library for an artifact or enchantment card, reveal it, then shuffle and put that card on top.
Wrath of God|{2}{W}{W}|Sorcery|10|Destroy all creatures. They can't be regenerated.
Ranger-Captain of Eos|{1}{W}{W}|Creature — Human Soldier|9|When Ranger-Captain of Eos enters, search your library for a creature card with mana value 1 or less, reveal it, put it into your hand, then shuffle. // Sacrifice Ranger-Captain of Eos: Your opponents can't cast noncreature spells this turn.
Rhystic Study|{2}{U}|Enchantment|28|Whenever an opponent casts a spell, you may draw a card unless that player pays {1}.
Mystic Remora|{U}|Enchantment|12|Whenever an opponent casts a noncreature spell, you may draw a card unless that player pays {4}.
Counterspell|{U}{U}|Instant|1|Counter target spell.
Brainstorm|{U}|Instant|0.5|Draw three cards, then put two cards from your hand on top of your library in any order.
Preordain|{U}|Sorcery|1|Scry 2, then draw a card.
Mystical Tutor|{U}|Instant|15|Search your library for an instant or sorcery card, reveal it, shuffle, then put that card on top of your library.
Cyclonic Rift|{1}{U}|Instant|25|Return target nonland permanent you don't control to its owner's hand.
Pongify|{U}|Instant|3|Destroy target creature. Its controller creates a 3/3 green Ape creature token.
Snapcaster Mage|{1}{U}|Creature — Human Wizard|12|Flash // When Snapcaster Mage enters, target instant or sorcery card in your graveyard gains flashback until end of turn.
Archaeomancer|{2}{U}{U}|Creature — Human Wizard|0.5|When Archaeomancer enters, return target instant or sorcery card from your graveyard to your hand.
Peregrine Drake|{4}{U}|Creature — Drake|1|Flying // When Peregrine Drake enters, untap up to five lands.
Ghostly Flicker|{2}{U}|Instant|1|Exile two target artifacts, creatures, and/or lands you control, then return those cards to the battlefield under your control.
Deadeye Navigator|{3}{U}{U}|Creature — Spirit|3|Soulbond // As long as Deadeye Navigator is paired with another creature, each of those creatures has "{1}{U}: Exile this creature, then return it to the battlefield under its owner's control."
Thassa, Deep-Dwelling|{2}{U}|Legendary Creature — God|8|Indestructible // At the beginning of your end step, exile up to one other target creature you control, then return that card to the battlefield under its owner's control. // {3}{U}: Tap target creature.
Displacer Kitten|{2}{U}|Creature — Cat Beast|24|Whenever you cast a noncreature spell, exile another target nonland permanent you control, then return it to the battlefield under its owner's control.
Talrand, Sky Summoner|{2}{U}|Legendary Creature — Merfolk Wizard|1|Whenever you cast an instant or sorcery spell, create a 2/2 blue Drake creature token with flying.
Murmuring Mystic|{3}{U}|Creature — Human Wizard|1|Defender // Whenever you cast an instant or sorcery spell, create a 1/1 blue Bird Illusion creature token with flying.
Consecrated Sphinx|{4}{U}{U}|Creature — Sphinx|18|Flying // Whenever an opponent draws a card, you may draw two cards.
Propaganda|{2}{U}|Enchantment|3|Creatures can't attack you unless their controller pays {2} for each creature they control that's attacking you.
Curiosity|{U}|Enchantment — Aura|2|Enchant creature // Whenever enchanted creature deals damage to a player, draw a card.
Tandem Lookout|{3}{U}|Creature — Human Scout|1|Soulbond // As long as Tandem Lookout is paired with another creature, each of those creatures has "Whenever this creature deals damage to a player, draw a card."
Demonic Tutor|{1}{B}|Sorcery|22|Search your library for a card, put that card into your hand, then shuffle.
Dark Ritual|{B}|Instant|2|Add {B}{B}{B}.
Village Rites|{B}|Instant|0.5|As an additional cost to cast this spell, sacrifice a creature. // Draw two cards.
Viscera Seer|{B}|Creature — Vampire Wizard|1|Sacrifice a creature: Scry 1.
Blood Artist|{1}{B}|Creature — Vampire|3|Whenever Blood Artist or another creature dies, target player loses 1 life and you gain 1 life.
Zulaport Cutthroat|{1}{B}|Creature — Human Rogue|1|Whenever Zulaport Cutthroat or another creature you control dies, each opponent loses 1 life and you gain 1 life.
Pitiless Plunderer|{3}{B}|Creature — Human Pirate|3|Whenever another creature you control dies, create a Treasure token.
Midnight Reaper|{2}{B}|Creature — Zombie Cleric|1|Whenever a nontoken creature you control dies, you lose 1 life and draw a card.
Gravecrawler|{B}|Creature — Zombie|3|Gravecrawler can't block. // You may cast Gravecrawler from your graveyard as long as you control a Zombie.
Reanimate|{B}|Sorcery|8|Return target creature card from a graveyard to the battlefield under your control. You lose life equal to its mana value.
Animate Dead|{1}{B}|Enchantment — Aura|12|When Animate Dead enters, return enchanted creature card to the battlefield under your control and attach Animate Dead to it.
Grave Titan|{4}{B}{B}|Creature — Giant|8|Deathtouch // Whenever Grave Titan enters or attacks, create two 2/2 black Zombie creature tokens.
Sidisi, Undead Vizier|{3}{B}{B}|Legendary Creature — Naga Shaman|1|Deathtouch // When Sidisi, Undead Vizier exploits a creature, search your library for a card, put it into your hand, then shuffle.
Infernal Grasp|{1}{B}|Instant|1|Destroy target creature. You lose 2 life.
Damnation|{2}{B}{B}|Sorcery|9|Destroy all creatures. They can't be regenerated.
Bitterblossom|{B}|Enchantment|20|At the beginning of your upkeep, you lose 1 life and create a 1/1 black Faerie Rogue creature token with flying.
Necropotence|{B}{B}{B}|Enchantment|20|Skip your draw step. // Pay 1 life: Exile the top card of your library face down. Put that card into your hand at the beginning of your next end step.
Bolas's Citadel|{3}{B}{B}{B}|Legendary Artifact|10|You may play lands and cast spells from the top of your library. If you cast a spell this way, pay life equal to its mana value rather than paying its mana cost. // {T}, Sacrifice ten nonland permanents: Each opponent loses 10 life.
Lightning Bolt|{R}|Instant|2|Lightning Bolt deals 3 damage to any target.
Chaos Warp|{2}{R}|Instant|2|The owner of target permanent shuffles it into their library, then reveals the top card of their library. If it's a permanent card, they put it onto the battlefield.
Vandalblast|{R}|Sorcery|1|Destroy target artifact you don't control.
Goblin Bombardment|{1}{R}|Enchantment|7|Sacrifice a creature: Goblin Bombardment deals 1 damage to any target.
Impact Tremors|{1}{R}|Enchantment|1|Whenever a creature you control enters, Impact Tremors deals 1 damage to each opponent.
Purphoros, God of the Forge|{3}{R}|Legendary Enchantment Creature — God|10|Indestructible // Whenever another creature you control enters, Purphoros deals 2 damage to each opponent. // {2}{R}: Creatures you control get +1/+0 until end of turn.
Krenko, Mob Boss|{2}{R}{R}|Legendary Creature — Goblin Warrior|4|{T}: Create X 1/1 red Goblin creature tokens, where X is the number of Goblins you control.
Kiki-Jiki, Mirror Breaker|{2}{R}{R}{R}|Legendary Creature — Goblin Shaman|22|Haste // {T}: Create a token that's a copy of target nonlegendary creature you control, except it has haste. Sacrifice it at the beginning of the next end step.
Zealous Conscripts|{4}{R}|Creature — Human Warrior|1|Haste // When Zealous Conscripts enters, untap target permanent. Gain control of it until end of turn. It gains haste until end of turn.
Storm-Kiln Artist|{3}{R}|Creature — Dwarf Shaman|3|Trample // Whenever you cast an instant or sorcery spell, create a Treasure token.
Birgi, God of Storytelling|{2}{R}|Legendary Creature — God|7|Whenever you cast a spell, add {R}. Spend this mana only to cast spells.
Jeska's Will|{2}{R}|Sorcery|12|Add {R} for each card in target opponent's hand.
Blasphemous Act|{8}{R}|Sorcery|3|This spell costs {1} less to cast for each creature on the battlefield. // Blasphemous Act deals 13 damage to each creature.
Underworld Breach|{1}{R}|Enchantment|12|Each nonland card in your graveyard has escape. The escape cost is equal to the card's mana cost plus exile three other cards from your graveyard.
Dockside Extortionist|{1}{R}|Creature — Goblin Pirate|45|When Dockside Extortionist enters, create X Treasure tokens, where X is the number of artifacts and enchantments your opponents control.
Terror of the Peaks|{3}{R}{R}|Creature — Dragon|20|Flying // Whenever another creature you control enters, Terror of the Peaks deals damage equal to that creature's power to any target.
Llanowar Elves|{G}|Creature — Elf Druid|0.5|{T}: Add {G}.
Birds of Paradise|{G}|Creature — Bird|8|Flying // {T}: Add one mana of any color.
Sakura-Tribe Elder|{1}{G}|Creature — Snake Shaman|1|Sacrifice Sakura-Tribe Elder: Search your library for a basic land card, put it onto the battlefield tapped, then shuffle.
Farhaven Elf|{2}{G}|Creature — Elf Druid|0.5|When Farhaven Elf enters, you may search your library for a basic land card, put it onto the battlefield tapped, then shuffle.
Cultivate|{2}{G}|Sorcery|1|Search your library for up to two basic land cards, reveal them, put one onto the battlefield tapped and the other into your hand, then shuffle.
Eternal Witness|{1}{G}{G}|Creature — Human Shaman|3|When Eternal Witness enters, return target card from your graveyard to your hand.
Beast Whisperer|{2}{G}{G}|Creature — Elf Druid|1|Whenever you cast a creature spell, draw a card.
Guardian Project|{3}{G}|Enchantment|4|Whenever a nontoken creature you control enters, draw a card.
Sylvan Library|{1}{G}|Enchantment|35|At the beginning of your draw step, you may draw two additional cards. If you do, for each of those cards pay 4 life or put the card on top of your library.
Fauna Shaman|{1}{G}{G}|Creature — Elf Shaman|10|{G}, {T}, Discard a creature card: Search your library for a creature card, reveal it, put it into your hand, then shuffle.
Seedborn Muse|{3}{G}{G}|Creature — Spirit|9|Untap all permanents you control during each other player's untap step.
Doubling Season|{4}{G}{G}|Enchantment|40|If an effect would create one or more tokens under your control, it creates twice that many of those tokens instead. // If an effect would put one or more counters on a permanent you control, it puts twice that many of those counters on it instead.
Hardened Scales|{G}|Enchantment|3|If one or more +1/+1 counters would be put on a creature you control, that many plus one +1/+1 counters are put on it instead.
Scute Swarm|{2}{G}|Creature — Insect|2|Whenever a land you control enters, create a 1/1 green Insect creature token. If you control six or more lands, create a token that's a copy of Scute Swarm instead.
Tireless Provisioner|{2}{G}|Creature — Elf Scout|3|Whenever a land you control enters, you may create a Treasure token.
Craterhoof Behemoth|{5}{G}{G}{G}|Creature — Beast|18|Haste // When Craterhoof Behemoth enters, creatures you control gain trample and get +X/+X until end of turn, where X is the number of creatures you control.
Avenger of Zendikar|{5}{G}{G}|Creature — Elemental|4|When Avenger of Zendikar enters, create a 0/1 green Plant creature token for each land you control. // Whenever a land you control enters, you may put a +1/+1 counter on each Plant creature you control.
Nature's Claim|{G}|Instant|1|Destroy target artifact or enchantment. Its controller gains 4 life.
Green Sun's Zenith|{X}{G}|Sorcery|6|Search your library for a green creature card with mana value X or less, put it onto the battlefield, then shuffle.
Wild Growth|{G}|Enchantment — Aura|1|Whenever enchanted land is tapped for mana, its controller adds an additional {G}.
Sol Ring|{1}|Artifact|2|{T}: Add {C}{C}.
Arcane Signet|{2}|Artifact|1|{T}: Add one mana of any color in your commander's color identity.
Mind Stone|{2}|Artifact|1|{T}: Add {C}. // {1}, {T}, Sacrifice Mind Stone: Draw a card.
Commander's Sphere|{3}|Artifact|0.5|{T}: Add one mana of any color in your commander's color identity. // Sacrifice Commander's Sphere: Draw a card.
Ashnod's Altar|{3}|Artifact|20|Sacrifice a creature: Add {C}{C}.
Phyrexian Altar|{4}|Artifact|35|Sacrifice a creature: Add one mana of any color.
Skullclamp|{1}|Artifact — Equipment|4|Equipped creature gets +1/-1. // Whenever equipped creature dies, draw two cards.
Nim Deathmantle|{2}|Artifact — Equipment|5|Equipped creature gets +2/+2. // Whenever a nontoken creature you control dies, you may pay {4}. If you do, return that card to the battlefield under your control and attach Nim Deathmantle to it.
Basalt Monolith|{3}|Artifact|7|Basalt Monolith doesn't untap during your untap step. // {T}: Add {C}{C}{C}. // {3}: Untap Basalt Monolith.
Rings of Brighthearth|{3}|Artifact|24|Whenever you activate an ability, if it isn't a mana ability, you may pay {2}. If you do, copy that ability.
Sensei's Divining Top|{1}|Artifact|22|{1}: Look at the top three cards of your library, then put them back in any order. // {T}: Draw a card, then put Sensei's Divining Top on top of its owner's library.
Lightning Greaves|{2}|Artifact — Equipment|4|Equipped creature has haste and shroud.
Swiftfoot Boots|{2}|Artifact — Equipment|2|Equipped creature has hexproof and haste.
Solemn Simulacrum|{4}|Artifact Creature — Golem|1|When Solemn Simulacrum enters, you may search your library for a basic land card, put it onto the battlefield tapped, then shuffle. // When Solemn Simulacrum dies, you may draw a card.
Wurmcoil Engine|{6}|Artifact Creature — Phyrexian Wurm|9|Deathtouch, lifelink // When Wurmcoil Engine dies, create a 3/3 colorless Phyrexian Wurm artifact creature token with deathtouch and a 3/3 colorless Phyrexian Wurm artifact creature token with lifelink.
Ruby Medallion|{2}|Artifact|8|Red spells you cast cost {1} less to cast.
Meren of Clan Nel Toth|{2}{B}{G}|Legendary Creature — Human Shaman|4|Whenever another creature you control dies, you get an experience counter. // At the beginning of your end step, return target creature card from your graveyard to the battlefield or to your hand.
Korvold, Fae-Cursed King|{2}{B}{R}{G}|Legendary Creature — Dragon Noble|7|Flying // Whenever Korvold, Fae-Cursed King enters or attacks, sacrifice another permanent. // Whenever you sacrifice a permanent, put a +1/+1 counter on Korvold and draw a card.
Atraxa, Praetors' Voice|{G}{W}{U}{B}|Legendary Creature — Phyrexian Angel Horror|24|Flying, vigilance, deathtouch, lifelink // At the beginning of your end step, proliferate.
Yarok, the Desecrated|{2}{B}{G}{U}|Legendary Creature — Elemental Horror|12|Deathtouch // If a permanent entering causes a triggered ability of a permanent you control to trigger, that ability triggers an additional time.
Kykar, Wind's Fury|{1}{U}{R}{W}|Legendary Creature — Bird Wizard|3|Flying // Whenever you cast a noncreature spell, create a 1/1 white Spirit creature token with flying. // Sacrifice a Spirit: Add {R}.
Prossh, Skyraider of Kher|{3}{B}{R}{G}|Legendary Creature — Dragon|5|Flying // When you cast this spell, create six 0/1 red Kobold creature tokens. // Sacrifice another creature: Prossh, Skyraider of Kher gets +1/+0 until end of turn.
Chulane, Teller of Tales|{2}{G}{W}{U}|Legendary Creature — Human Druid|6|Vigilance // Whenever another creature you control enters, draw a card and you may put a land card from your hand onto the battlefield.
Command Tower|—|Land|1|{T}: Add one mana of any color in your commander's color identity.
Reliquary Tower|—|Land|1|You have no maximum hand size. // {T}: Add {C}.
Ancient Tomb|—|Land|38|{T}: Add {C}{C}. Ancient Tomb deals 2 damage to you.
Plains|—|Basic Land — Plains|0.2|{T}: Add {W}.
Island|—|Basic Land — Island|0.2|{T}: Add {U}.
Swamp|—|Basic Land — Swamp|0.2|{T}: Add {B}.
Mountain|—|Basic Land — Mountain|0.2|{T}: Add {R}.
Forest|—|Basic Land — Forest|0.2|{T}: Add {G}.
`.trim();

function parseCost(cost) {
  if (!cost || cost === '—') return {symbols:[], cmc:0, colors:new Set()};
  const symbols = cost.match(/\{[^}]+\}/g) || [];
  let cmc = 0; const colors = new Set();
  symbols.forEach(s => {
    const inner = s.slice(1, -1);
    if (/^\d+$/.test(inner)) cmc += parseInt(inner, 10);
    else if (inner === 'X') cmc += 0;
    else cmc += 1;
    inner.split('/').forEach(p => { if ('WUBRG'.includes(p)) colors.add(p); });
  });
  return {symbols, cmc, colors};
}

function stripReminder(t) { return t.replace(/\([^)]*\)/g, ' '); }

function splitAbilities(text) {
  return text.split(' // ').map(s => s.trim()).filter(Boolean);
}

function matchAll(rules, s) {
  const out = [];
  for (const r of rules) {
    const c = r[0], re = r.length === 3 ? r[2] : r[1];
    if (re.test(s) && !out.includes(c)) out.push(c);
  }
  return out;
}

function analyze(card) {
  const text = stripReminder(card.text||'').toLowerCase();
  const selfNames = [card.name.toLowerCase(), card.name.toLowerCase().split(',')[0].trim()];
  const isSpell = /instant|sorcery/.test(card.type.toLowerCase());
  const isPermanent = !isSpell && !/^basic land|^land/.test(card.type.toLowerCase().trim());
  const abilities = [];

  splitAbilities(text).forEach(raw => {
    const chunks = raw.split(/(?<=\.)\s+/).map(s => s.trim()).filter(Boolean);
    let ctx = null;
    chunks.forEach(chunk => {
      const inner = chunk.match(/"([^"]+)"/);
      const bodies = inner ? [chunk.replace(/"[^"]+"/,' '), inner[1]] : [chunk];
      bodies.forEach((body, bi) => {
        if (!body || body.length < 3) return;
        const granted = inner && bi === 1;
        const trig = body.match(/^(whenever|when|at the beginning of|as long as)\b/);
        if (trig) {
          const i = coupeDeclencheur(body);
          const tPart = i > 0 ? body.slice(0, i) : body;
          const ePart = i > 0 ? body.slice(i + 1) : '';
          const src = refineTriggers(matchAll(TRIGGER_RULES, tPart), tPart);
          const eff = refineEffects(matchAll(EFFECT_RULES, ePart), ePart);
          const recurring = /^(whenever|at the beginning of)/.test(body);
          const selfRef = (selfNames.some(n => n && tPart.includes(n)) || /this creature|this permanent|this spell/.test(tPart))
                        && !/\banother\b|\bother\b/.test(tPart);
          const q = qualifieDeclencheur(tPart, selfNames);
          if (selfRef) q.portee = 'soi';
          const srcN = (src.length ? src : ['STATIQUE']).map(f =>
            (selfRef && f === 'ETB') ? 'ETB_SOI' : ((selfRef && f === 'MORT') ? 'MORT_SOI' : f));
          ctx = {from:srcN, scope:scopeOf(tPart), kind:granted?'octroyee':'declenchee',
                 hook:recurring && (granted || !selfRef), q, pq:qualifieProduction(ePart, card)};
          if (src.length || eff.length)
            abilities.push({kind:ctx.kind, from:ctx.from, to:eff, scopeTrig:ctx.scope, scopeEff:scopeOf(ePart),
                            text:body, hook:ctx.hook, q, pq:ctx.pq});
          return;
        }
        const act = body.match(/^([^:]{1,70}):\s*(.+)$/);
        if (act && !/^[a-z ]*enchant /.test(body)) {
          const cost = act[1], eff0 = act[2];
          const couts = coutsDe(cost, selfNames);
          const src = couts.map(c => c.source);
          if (!src.length) src.push('STATIQUE');
          const eff = refineEffects(matchAll(EFFECT_RULES, eff0), eff0);
          const sacOutlet = couts.some(c => c.id === 'SAC_CREATURE');
          const selfSac = couts.some(c => c.id === 'SAC_SOI');
          const q = {portee:'vous', sujet:sacOutlet ? 'creature' : (/discard/.test(cost) ? 'card' : ''), filtres:[], mode:'cout'};
          ctx = {from:src, scope:'self', kind:'activee', hook:false, q, pq:qualifieProduction(eff0, card), couts};
          if (eff.length) abilities.push({kind:'activee', from:src, to:eff, scopeTrig:'self', scopeEff:scopeOf(eff0),
                                         text:body, sacOutlet, selfSac, q, pq:ctx.pq, couts});
          return;
        }
        const eff = refineEffects(matchAll(EFFECT_RULES, body), body);
        if (!eff.length) return;
        if (ctx && !/^[a-z ,]*(each|all|creatures you control|equipped|enchanted)/.test(body)) {
          abilities.push({kind:ctx.kind, from:ctx.from, to:eff, scopeTrig:ctx.scope, scopeEff:scopeOf(body),
                          text:body, hook:ctx.hook, q:ctx.q, pq:qualifieProduction(body, card)});
          return;
        }
        ctx = {from:[isSpell ? 'LANCEMENT' : 'STATIQUE'], scope:'self', kind:isSpell ? 'sort' : 'statique', hook:false,
               q:{portee:'vous', sujet:'', filtres:[], mode:isSpell ? 'sort' : 'statique'}};
        abilities.push({kind:ctx.kind, from:ctx.from, to:eff, scopeTrig:'self', scopeEff:scopeOf(body),
                        text:body, hook:false, q:ctx.q, pq:qualifieProduction(body, card)});
      });
    });
  });

  const edges = [];
  abilities.forEach(a => a.from.forEach(f => a.to.forEach(t => {
    if (f === t) return;
    edges.push({from:f, to:t, kind:a.kind, scope:a.scopeTrig, text:a.text, q:a.q, detail:libelleQual(a.q)});
  })));

  const triggers = [], produces = [];
  const qVide = {portee:'vous', jeton:false, force:null, cmc:null, types:[], sorts:[], sujets:[], creature:false};
  const ajouteT = (c, scope, q, mode) => {
    if (c === 'STATIQUE' || c === 'MANA') return;
    triggers.push({c, scope, q:{...(q||{portee:'vous', sujet:'', filtres:[]}), mode:mode||(q && q.mode)||'declencheur'}});
  };
  const ajouteP = (c, scope, q) => produces.push({c, scope, q:{...qVide, ...(q||{})}});

  abilities.forEach(a => {
    const hooks = a.hook
      ? a.from
      : a.from.filter(f => a.kind === 'activee' && (a.couts||[]).some(c => c.exutoire && c.source === f));
    hooks.forEach(f => ajouteT(f, a.scopeTrig, a.q, a.kind === 'activee' ? 'cout' : 'declencheur'));
    (a.couts||[]).forEach(c => { if (c.exutoire) c.consomme.forEach(x => ajouteT(x, 'self', a.q, 'cout')); });
    a.to.forEach(t => ajouteP(t, a.scopeEff, a.pq));
    (a.couts||[]).forEach(c => {
      if (c.id === 'SAC_SOI' && !/creature/i.test(card.type)) return;
      c.produit.forEach(x => ajouteP(x, 'self', c.id === 'SAC_CREATURE' ? {types:['creature']} : {force:card.force, cmc:card.cmc}));
    });
  });

  if (isPermanent) ajouteP('ETB', 'self', {jeton:false, force:card.force, cmc:card.cmc,
    types:card.sousTypes||[], sujets:card.typesSort||[], creature:!!card.isCreature});

  if (!card.isLand && !card.isToken)
    ajouteP('LANCEMENT', 'self', {jeton:false, cmc:card.cmc, sorts:card.typesSort||[],
      types:card.sousTypes||[], sujets:card.typesSort||[], force:card.force, creature:!!card.isCreature});

  return {abilities, edges, triggers, produces, isSpell, isPermanent};
}

function categories(card) {
  const c = new Set(), a = card.an, t = card.type.toLowerCase(), tx = (card.text||'').toLowerCase();
  const has = id => a.abilities.some(x => x.to.includes(id));
  if (card.isToken) return c;
  if (/creature/.test(t)) c.add('creatures');
  if (/land/.test(t)) c.add('terrains');
  if (has('MANA') || has('RAMP') || has('TRESOR') || has('REDUCTION')) if (!/^basic land/.test(t)) c.add('ramp');
  if (has('PIOCHE') || has('IMPULSE') || has('RECURSION')) c.add('pioche');
  if (has('TUTEUR')) c.add('tuteurs');
  if (has('DESTRUCTION') || has('EXIL') || has('BOUNCE') || has('DEGATS') || has('CONTRESORT')) c.add('removal');
  if (/all creatures|each creature|each opponent/.test(tx) && (has('DESTRUCTION') || has('DEGATS'))) c.add('wipe');
  if (has('INDESTRUCTIBLE') || has('LINCEUL') || has('PROTECTION')) c.add('protection');
  if (has('JETON')) c.add('jetons');
  if (has('MARQUEUR')) c.add('marqueurs');
  if (has('SACRIFICE') || a.abilities.some(x => x.from.includes('SACRIFICE') || x.from.includes('MORT'))) c.add('sacrifice');
  if (has('BLINK') || a.abilities.some(x => x.from.includes('ETB'))) c.add('blink');
  if (has('STAX') || has('TAXE')) c.add('stax');
  return c;
}

/* =====================================================================
   Archétypes de deck : lecture d'ensemble d'une carte, à partir des
   nœuds relevés par l'analyseur et de quelques tournures du texte.
   Une carte peut relever de plusieurs archétypes, ou d'aucun.
   ===================================================================== */

const ARCHETYPES = [
  {id:'aristocrates', label:'Aristocrates / Sacrifice',
   aide:'Sacrifices, morts de créatures et drain qui en découle'},
  {id:'marqueurs', label:'Marqueurs +1/+1',
   aide:'Pose de marqueurs, prolifération et cartes qui s\'en soucient'},
  {id:'jetons', label:'Jetons',
   aide:'Création de jetons et cartes qui en tirent parti'},
  {id:'spellslinger', label:'Spellslinger',
   aide:'Cartes qui se soucient des éphémères et des rituels'},
  {id:'vol', label:'Vol',
   aide:'Créatures volantes et effets qui donnent le vol'},
  {id:'combat', label:'Combat / attaque',
   aide:'Déclenchements à l\'attaque, phases de combat et percée'},
  {id:'blink', label:'Blink / ETB',
   aide:'Scintillement et déclenchements sur l\'arrivée d\'autres permanents'},
  {id:'cimetiere', label:'Cimetière / Réanimation',
   aide:'Récursion, meule, défausse et cartes lancées depuis le cimetière'},
  {id:'landfall', label:'Landfall / terrains',
   aide:'Terrains qui arrivent, recherche de terrains et déclenchements associés'},
  {id:'voltron', label:'Voltron / Auras & équipements',
   aide:'Attachements : auras, équipements et créatures équipées'},
  {id:'gainvie', label:'Gain de vie',
   aide:'Lien de vie, gains de points de vie et récompenses associées'},
  {id:'artefacts', label:'Artefacts',
   aide:'Artefacts qui comptent : trésors, affinité, bricolage'},
  {id:'enchantements', label:'Enchantements',
   aide:'Enchantements qui comptent : constellation, aura-matters'},
  {id:'controle', label:'Contrôle / Stax',
   aide:'Contresorts, taxes, effets de blocage et fléaux'},
  {id:'meule', label:'Meule (mill)',
   aide:'Cartes mises de la bibliothèque au cimetière'}
];

const ARCHLABEL = {};
ARCHETYPES.forEach(a => ARCHLABEL[a.id] = a.label);

/* Motifs de texte, compilés une seule fois. */
const ARCH_MOTIFS = {
  aristocrates: /\bdies\b|\bsacrifice[sd]? (?:a|an|another|one|two|three|x|this|that)\b|whenever [^.]{0,50}\bdies\b|each opponent loses|\bblitz\b|\bexploit\b|\bafterlife\b/,
  marqueurs:    /\+1\/\+1 counter|\bproliferate\b|\bevolve\b|\badapt \d|\boutlast\b|\bbolster \d|\bmentor\b|\btraining\b|\bbackup \d|\bmodified\b|\bgraft \d|\bundying\b/,
  jetons:       /creates? [^.]{0,50}token|\bpopulate\b|token creature|\bamass\b|\bfabricate\b|\bconvoke\b/,
  spellslinger: /instants? (?:and|or) sorcer|instant or sorcery|\bprowess\b|\bmagecraft\b|\bstorm\b|\bflashback\b|\bjump-start\b|copy target (?:instant|sorcery|spell)|whenever you cast (?:an instant|a sorcery|a noncreature|your (?:first|second))/,
  vol:          /\bflying\b/,
  combat:       /whenever [^.]{0,50}attacks|additional combat phase|extra combat|\bdouble strike\b|\bmelee\b|\bbattle cry\b|\bmyriad\b|\bexalted\b|attacks each combat if able|deals combat damage to a player/,
  blink:        /exile [^.]{0,60}return (?:it|them|those cards|that card)[^.]{0,50}battlefield|return (?:it|them|those cards) to the battlefield|\bflicker/,
  cimetiere:    /from (?:your|a|their) graveyard|\bescape\b|\bdisturb\b|\bunearth\b|\bdelve\b|\bthreshold\b|\bdelirium\b|\bembalm\b|\beternalize\b|into (?:your|their) graveyard/,
  landfall:     /\blandfall\b|land enters|play an additional land|search your library for a[^.]{0,40}land/,
  voltron:      /\bequip\b|equipped creature|enchanted creature|\benchant creature\b|\bequipment\b|\bfortify\b|attach(?:ed)? /,
  gainvie:      /\blifelink\b|gains? \d+ life|gains? life|whenever you gain life|\bextort\b/,
  artefacts:    /artifacts? you control|artifact spell|whenever an artifact|another artifact|\bmetalcraft\b|\bimprovise\b|affinity for artifacts|\btreasure\b/,
  enchantements:/enchantments? you control|enchantment spell|whenever an enchantment|another enchantment|\bconstellation\b/,
  controle:     /counter target|can't be cast|players? can't|costs? \{?\d\}? more to cast|destroy all|exile all|\bward\b/,
  meule:        /\bmills?\b|puts? the top [^.]{0,40}into (?:your|their|his or her) graveyard/
};

/* Archétypes d'une carte : identifiants de `ARCHETYPES`. */
function archetypesDe(card) {
  const out = [];
  if (!card || card.isToken) return out;
  const a = card.an || {abilities:[], triggers:[]};
  const tx = (card.text || '').toLowerCase();
  const ty = (card.type || '').toLowerCase();
  const vers = id => a.abilities.some(x => x.to.includes(id));
  const depuis = id => a.abilities.some(x => x.from.includes(id))
    || (a.triggers || []).some(x => x.c === id);
  const dit = cle => ARCH_MOTIFS[cle].test(tx);

  const test = {
    aristocrates: () => vers('SACRIFICE') || depuis('SACRIFICE') || depuis('MORT') || depuis('MORT_SOI'),
    marqueurs:    () => vers('MARQUEUR') || vers('PROLIFERATION') || depuis('MARQUEUR'),
    jetons:       () => vers('JETON'),
    spellslinger: () => depuis('LANCEMENT') && /instant|sorcery/.test(tx),
    vol:          () => vers('VOL'),
    combat:       () => depuis('ATTAQUE') || depuis('DEGATS_COMBAT_JOUEUR'),
    blink:        () => vers('BLINK') || depuis('ETB'),
    cimetiere:    () => vers('RECURSION') || vers('MILL') || vers('DEFAUSSE') || depuis('MIS_AU_CIMETIERE'),
    landfall:     () => vers('TERRAIN') || depuis('TERRAIN') || depuis('TERRAIN_JOUE'),
    voltron:      () => vers('ATTACHEMENT') || /aura|equipment/.test(ty),
    gainvie:      () => vers('GAIN_VIE') || depuis('GAIN_VIE'),
    artefacts:    () => vers('TRESOR'),
    enchantements:() => false,
    controle:     () => vers('CONTRESORT') || vers('STAX') || vers('TAXE'),
    meule:        () => vers('MILL')
  };

  ARCHETYPES.forEach(({id}) => {
    if ((test[id] && test[id]()) || dit(id)) out.push(id);
  });
  return out;
}

/* Une carte dont le texte ou la force changent voit son analyse refaite. */
function reanalyser(card) {
  card.an = analyze(card);
  card.cats = categories(card);
  card.archetypes = archetypesDe(card);
  return card;
}

const CATLABEL = {
  creatures:'Créatures', terrains:'Terrains', ramp:'Ramp / mana', pioche:'Card advantage',
  tuteurs:'Tuteurs', removal:'Removal', wipe:'Board wipes', protection:'Protection', jetons:'Jetons',
  marqueurs:'Marqueurs', sacrifice:'Sacrifice', blink:'ETB / blink', stax:'Stax'
};

/* Base de données & indexation */
const DB = [];
const BY_NAME = {};
const LOOSE = {};
const FRONT = {};

function norm(s) { return String(s).toLowerCase().replace(/[\u2018\u2019`]/g,"'").replace(/\s+/g,' ').trim(); }
function loose(s) { return norm(s).normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9]/g,''); }

function buildCard(name, cost, type, price, text) {
  const pc = parseCost(cost);
  const card = {name, cost:cost==='—'?'':cost, type:type||'Inconnu', price:parseFloat(price)||0, text:text||'',
    cmc:pc.cmc, symbols:pc.symbols, colors:[...pc.colors]};
  const idc = new Set(card.colors);
  (card.text.match(/\{[^}]+\}/g)||[]).forEach(x => x.slice(1,-1).split('/').forEach(pp => { if ('WUBRG'.includes(pp)) idc.add(pp); }));
  if (/^basic land/i.test(card.type)) idc.clear();
  card.identity = [...idc];
  const pt = (card.text||'').match(/(?:^|\s)(\d+)\/(\d+)(?![^.]{0,40}token)/);
  card.force = pt ? +pt[1] : null;
  card.endurance = pt ? +pt[2] : null;
  card.sousTypes = ((card.type||'').split('—')[1]||'').toLowerCase().split(/\s+/).filter(Boolean);
  const tf = String(card.type).split(' // ')[0];
  card.isToken = /\btoken\b/i.test(tf);
  card.typesSort = ['creature','instant','sorcery','artifact','enchantment','planeswalker','battle','land']
    .filter(t => new RegExp(t,'i').test(tf));
  card.isCreature = /creature/i.test(tf) && !card.isToken;
  card.isLand = /land/i.test(tf) && !card.isToken;
  card.isLegendaryCreature = /legendary creature/i.test(tf) && !card.isToken;
  return reanalyser(card);
}

function indexCard(card) {
  BY_NAME[norm(card.name)] = card;
  LOOSE[loose(card.name)] = card;
  if (card.name.includes(' // ')) {
    const f = loose(card.name.split(' // ')[0]);
    if (f && !FRONT[f]) FRONT[f] = card;
  }
}

function unindexCard(card) {
  delete BY_NAME[norm(card.name)];
  delete LOOSE[loose(card.name)];
  if (card.name.includes(' // ')) {
    const f = loose(card.name.split(' // ')[0]);
    if (FRONT[f] === card) delete FRONT[f];
  }
}

function registerCard(card) {
  const k = norm(card.name);
  if (BY_NAME[k]) return BY_NAME[k];
  DB.push(card);
  indexCard(card);
  return card;
}

function find(name) {
  if (!name) return null;
  const n = norm(name);
  const avant = n.split(' // ')[0].trim();
  return BY_NAME[n] || BY_NAME[avant] || LOOSE[loose(n)] || LOOSE[loose(avant)]
      || FRONT[loose(n)] || FRONT[loose(avant)] || null;
}

function peutCommander(c) {
  return !!c && (c.isLegendaryCreature || /can be your commander/i.test(c.text||''));
}

function commandantsPossibles() {
  return deckEntries().map(e => e.card).filter(peutCommander);
}

function commandantsSecondaires() {
  return deckEntries().map(e => e.card).filter(c => peutCommander(c) && (!S.commander || c.name !== S.commander));
}

function mainType(c) {
  const t = c.type.toLowerCase().split(' // ')[0];
  if (c.isToken || /\btoken\b/.test(t)) return 'Jeton';
  if (t.includes('land')) return 'Terrain';
  if (t.includes('creature')) return 'Créature';
  if (t.includes('instant')) return 'Éphémère';
  if (t.includes('sorcery')) return 'Rituel';
  if (t.includes('artifact')) return 'Artefact';
  if (t.includes('enchantment')) return 'Enchantement';
  if (t.includes('planeswalker')) return 'Planeswalker';
  return 'Autre';
}

const TYPE_ORDER = ['Créature','Éphémère','Rituel','Artefact','Enchantement','Planeswalker','Terrain','Jeton','Autre'];

/* Peuplement initial */
RAW.split('\n').forEach(line => {
  const [name, cost, type, price, text] = line.split('|');
  if (!name) return;
  registerCard(buildCard(name, cost, type, price, text));
});

const BUILTIN = new Set(DB.map(c => norm(c.name)));

function initBuiltin() {
  if (DB.length === 0) {
    RAW.split('\n').forEach(line => {
      const [name, cost, type, price, text] = line.split('|');
      if (!name) return;
      registerCard(buildCard(name, cost, type, price, text));
    });
  }
  if (S.collection.size === 0 && S.deck.size === 0) {
    seedCollection();
  }
}
