/* =====================================================================
   js/cartesBrutes.js — La base livrée avec l'atelier

   Une poignée de cartes, une par ligne, champs séparés par des barres : nom,
   coût, ligne de type, prix indicatif, texte. Elle sert à ce que l'atelier
   montre quelque chose sans réseau ni archive ; tout le reste vient de
   Scryfall ou du catalogue, et remplace ce que cette base ne dit qu'en
   résumé.
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
Cyclonic Rift|{1}{U}|Instant|25|Return target nonland permanent you don't control to its owner's hand. // Overload {6}{U} (You may cast this spell for its overload cost. If you do, change "target" in its text to "each.")
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
