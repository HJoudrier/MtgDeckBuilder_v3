# Cartes d'EDHREC que le moteur ne joue pas encore entièrement

Mesure du 24 novembre 2026, sur 7 336 cartes distinctes : celles des pages des cent premiers commandants de
l'année chez EDHREC (`json.edhrec.com`), chacune lue avec son script Forge (dépôt cloné au commit `3e1fa4ed`) et
sa couverture calculée par le moteur lui-même (`definitionForge()`). Le poids d'une carte est le nombre de decks qui la
jouent, additionné sur ces cent pages : il classe, il ne mesure pas une part de marché.

| | au départ (lot F60) | au 18 novembre | 24 novembre, avant le lot F83 | aujourd'hui (lots F83 à F101) |
|---|---|---|---|---|
| complètes | 6063 | 6611 | 6552 | **6868** |
| partielles (une partie du texte est jouée) | 830 | 486 | 503 | 315 |
| injouables (le sort ou une contrepartie manque) | 484 | 280 | 281 | 153 |

Le banc a été reconstruit pour la mesure du 24 novembre : la liste des cartes diffère de quelques unités de celle du 18
(7 336 contre 7 379 — des commandants ont bougé dans le classement), et les cartes sont lues sans catalogue, depuis leur seul
script. Les deux mesures se comparent donc à quelques cartes près ; seule la dernière colonne se compare à l'avant-dernière
exactement : même banc, mêmes cartes, 316 cartes de plus complètes.

## Ce qui manque le plus

Les éléments que le moteur ne sait pas lire, par poids décroissant (nombre de cartes entre parenthèses).

| Élément | Cartes | Exemples |
|---|---|---|
| `param:Continuous.MayPlayDontGrantZonePermissions` | 3 | Dracogenesis, Darksteel Monolith, As Foretold |
| `construction:Continuous` | 9 | Hunting Velociraptor, Tyvar the Bellicose, Danny Pink |
| `param:MoveCounter.ValidDefined` | 1 | Forgotten Ancient |
| `construction:Mana` | 6 | Master of Dark Rites, Jade Orb of Dragonkind, Jeweled Amulet |
| `param:PutCounter.Placer` | 4 | Promise of Loyalty, Gluntch, the Bestower, Alexios, Deimos of Kosmos |
| `param:AddPhase.ExtraPhaseDelayedTrigger` | 2 | Moraug, Fury of Akoum, Bumi, Unleashed |
| `param:AddPhase.ExtraPhaseDelayedTriggerExecute` | 2 | Moraug, Fury of Akoum, Bumi, Unleashed |
| `api:ExchangeLifeVariant` | 2 | Tree of Redemption, Tree of Perdition |
| `param:ExchangeLifeVariant.Mode` | 2 | Tree of Redemption, Tree of Perdition |
| `param:PutCounter.Chooser` | 2 | Promise of Loyalty, Gluntch, the Bestower |
| `param:PutCounter.RememberAmount` | 3 | Earthbender Ascension, Auron, Venerated Guardian, Cosima, God of the Voyage |
| `trig:AbilityTriggered` | 3 | Firebender Ascension, Aboleth Spawn, Historian's Boon |
| `param:AbilityTriggered.ValidMode` | 3 | Firebender Ascension, Aboleth Spawn, Historian's Boon |
| `param:AbilityTriggered.ValidSource` | 3 | Firebender Ascension, Aboleth Spawn, Historian's Boon |
| `param:Animate.sVars` | 3 | Summon: Primal Odin, Whip of Erebos, Vorpal Sword |
| `param:PutCounter.RememberCards` | 2 | Promise of Loyalty, Season of Gathering |
| `filtre:TriggeredCards` | 1 | Hedge Shredder |
| `kw:Mutate` | 18 | Nethroi, Apex of Death, Gemrazer, Brokkos, Apex of Forever |
| `defini:ReplacedNewCard.Creature` | 1 | Spark Double |
| `defini:ReplacedNewCard.Planeswalker` | 1 | Spark Double |
| `cout:BeholdExile` | 3 | Champions of the Perfect, Champion of the Path, Champion of the Weird |
| `param:ChangeZone.TargetsWithDifferentCMC` | 1 | Agadeem's Awakening |
| `param:ReduceCost.IgnoreGeneric` | 1 | Morophon, the Boundless |
| `stat:Activations` | 1 | Birgi, God of Storytelling |
| `param:Activations.ValidCard` | 1 | Birgi, God of Storytelling |
| `param:Activations.ValidSA` | 1 | Birgi, God of Storytelling |
| `param:Activations.ValidPlayer` | 1 | Birgi, God of Storytelling |
| `param:Activations.MinLimit` | 1 | Birgi, God of Storytelling |
| `repl:RollDice` | 2 | Barbarian Class, Wyll, Blade of Frontiers |
| `param:RollDice.ActiveZones` | 2 | Barbarian Class, Wyll, Blade of Frontiers |
| `param:RollDice.ValidPlayer` | 2 | Barbarian Class, Wyll, Blade of Frontiers |
| `param:RollDice.ReplaceWith` | 2 | Barbarian Class, Wyll, Blade of Frontiers |
| `expr:ReplaceCount$Ignore` | 2 | Barbarian Class, Wyll, Blade of Frontiers |
| `param:AbilityTriggered.TriggeredOwnAbility` | 2 | Firebender Ascension, Aboleth Spawn |
| `defini:Player.Opponent+IsRemembered` | 2 | Molten Psyche, Chaos Dragon |
| `param:Panharmonicon.ValidZone` | 1 | Echoes of Eternity |
| `expr:Count$CardNumAttacksThisTurn` | 1 | Moraug, Fury of Akoum |
| `param:Continuous.ManaConversion` | 2 | Drana and Linvala, Grell Philosopher |
| `trig:Mutates` | 16 | Nethroi, Apex of Death, Gemrazer, Sawtusk Demolisher |
| `param:Mutates.ValidCard` | 16 | Nethroi, Apex of Death, Gemrazer, Sawtusk Demolisher |
| `param:PutCounter.RememberPut` | 4 | Call the Spirit Dragons, Craig Boone, Novac Guard, Fangs of Kalonia |
| `param:Continuous.TopCardOfLibraryIs` | 2 | Conspicuous Snoop, Vampire Nocturnus |
| `filtre:IsSolved` | 3 | Case of the Locked Hothouse, Case of the Ransacked Lab, Case of the Uneaten Feast |
| `defini:TriggeredCards` | 1 | Kambal, Profiteering Mayor |
| `param:Play.ForgetRemembered` | 1 | Descendants' Path |
| `filtre:targetedBy` | 2 | Kheru Goldkeeper, Guide of Souls |
| `kw:Read ahead` | 4 | The Cruelty of Gix, The Weatherseed Treaty, The Elder Dragon War |
| `param:Moved.Layer` | 3 | Grafdigger's Cage, Corrupted Shapeshifter, Xantcha, Sleeper Agent |
| `kw:MayFlashSac` | 1 | Necromancy |
| `param:ChangeZone.ChoiceZone` | 1 | Broodcaller Scourge |
| `param:ChangeZone.Amount` | 1 | Broodcaller Scourge |
| `construction:TapsForMana` | 1 | Treasure Nabber |
| `param:CanAttackDefender.ValidAttacked` | 1 | Weathered Sentinels |
| `kwval:hexproof:chosencolor` | 1 | Skrelv, Defector Mite |
| `kwval:toxic:1` | 1 | Skrelv, Defector Mite |
| `param:Pump.DefinedKW` | 1 | Skrelv, Defector Mite |
| `kwval:myriad` | 2 | Mass of Mysteries, Ironwill Forger |
| `construction:ETBReplacement` | 1 | Serra's Emissary |
| `trig:AbilityResolves` | 2 | Narci, Fable Singer, Tom Bombadil |
| `param:AbilityResolves.ValidSource` | 2 | Narci, Fable Singer, Tom Bombadil |
| `param:AbilityResolves.ValidSpellAbility` | 2 | Narci, Fable Singer, Tom Bombadil |
| `defini:TriggeredObjectLKICopy` | 2 | Rikku, Resourceful Guardian, Grafted Exoskeleton |
| `param:ChangeZoneAll.DefinedPlayer` | 1 | Teferi's Puzzle Box |
| `stat:CantBlockUnless` | 1 | Archangel of Tithes |
| `param:CantBlockUnless.ValidCard` | 1 | Archangel of Tithes |
| `construction:Chapter` | 2 | Welcome to . . ., Terra, Magical Adept |
| `param:Continuous.ControlOpponentsSearchingLibrary` | 1 | Opposition Agent |
| `param:Moved.FoundSearchingLibrary` | 1 | Opposition Agent |
| `param:Continuous.CanBlockAmount` | 1 | Brave the Sands |
| `repl:Explore` | 2 | Topography Tracker, Twists and Turns |
| `param:Explore.ActiveZones` | 2 | Topography Tracker, Twists and Turns |
| `param:Explore.ValidExplorer` | 2 | Topography Tracker, Twists and Turns |
| `param:Explore.ReplaceWith` | 2 | Topography Tracker, Twists and Turns |
| `param:Effect.RememberLKI` | 2 | Quicksilver Elemental, Grell Philosopher |
| `param:ChangesZone.NotThisAbility` | 1 | Kodama of the East Tree |
| `param:Animate.Replacements` | 3 | The Book of Exalted Deeds, Sokrates, Athenian Teacher, Realmbreaker, the Invasion Tree |
| `trig:BecomesTargetOnce` | 3 | Professor Hojo, Leyline of Combustion, Chira, All In |
| `param:ChoosePlayer.RememberChosen` | 3 | Gluntch, the Bestower, Sower of Discord, Dack Fayden, Helping Hand |
| `param:BecomesTargetOnce.ValidTarget` | 2 | Professor Hojo, Leyline of Combustion |
| `param:BecomesTargetOnce.ValidSource` | 2 | Professor Hojo, Leyline of Combustion |

## Les cartes, de la plus jouée à la moins jouée

`P` : partielle, `I` : injouable. Les éléments cités sont ceux que le moteur ne sait pas lire ; une carte à
un seul élément est celle que le prochain lot rendra complète.

| | Carte | Ce qui manque |
|---|---|---|
| P | Forgotten Ancient | `param:MoveCounter.ValidDefined` |
| P | Hedge Shredder | `filtre:TriggeredCards` |
| P | Spark Double | `defini:ReplacedNewCard.Creature`, `defini:ReplacedNewCard.Planeswalker` |
| I | Agadeem's Awakening | `param:ChangeZone.TargetsWithDifferentCMC` |
| I | Morophon, the Boundless | `param:ReduceCost.IgnoreGeneric` |
| P | Birgi, God of Storytelling | `stat:Activations`, `param:Activations.ValidCard`, `param:Activations.ValidSA`, `param:Activations.ValidPlayer` … |
| P | Dracogenesis | `param:Continuous.MayPlayDontGrantZonePermissions` |
| I | Promise of Loyalty | `param:PutCounter.Chooser`, `param:PutCounter.Placer`, `param:PutCounter.RememberCards` |
| P | Echoes of Eternity | `param:Panharmonicon.ValidZone` |
| P | Moraug, Fury of Akoum | `param:AddPhase.ExtraPhaseDelayedTrigger`, `param:AddPhase.ExtraPhaseDelayedTriggerExecute`, `expr:Count$CardNumAttacksThisTurn` |
| P | Earthbender Ascension | `param:PutCounter.RememberAmount` |
| P | Kambal, Profiteering Mayor | `defini:TriggeredCards` |
| P | Descendants' Path | `param:Play.ForgetRemembered` |
| P | Bumi, Unleashed | `param:AddPhase.ExtraPhaseDelayedTrigger`, `param:AddPhase.ExtraPhaseDelayedTriggerExecute` |
| P | Necromancy | `kw:MayFlashSac` |
| P | Broodcaller Scourge | `param:ChangeZone.ChoiceZone`, `param:ChangeZone.Amount` |
| P | Treasure Nabber | `construction:TapsForMana` |
| P | Master of Dark Rites | `construction:Mana` |
| P | Weathered Sentinels | `param:CanAttackDefender.ValidAttacked` |
| P | Skrelv, Defector Mite | `kwval:hexproof:chosencolor`, `kwval:toxic:1`, `param:Pump.DefinedKW` |
| P | Tree of Redemption | `api:ExchangeLifeVariant`, `param:ExchangeLifeVariant.Mode` |
| P | Case of the Locked Hothouse | `filtre:IsSolved` |
| P | Serra's Emissary | `construction:ETBReplacement` |
| P | Drana and Linvala | `param:Continuous.ManaConversion` |
| P | Firebender Ascension | `trig:AbilityTriggered`, `param:AbilityTriggered.ValidMode`, `param:AbilityTriggered.ValidSource`, `param:AbilityTriggered.TriggeredOwnAbility` |
| P | Summon: Primal Odin | `param:Animate.sVars` |
| P | Tree of Perdition | `api:ExchangeLifeVariant`, `param:ExchangeLifeVariant.Mode` |
| I | Champions of the Perfect | `cout:BeholdExile` |
| I | Teferi's Puzzle Box | `param:ChangeZoneAll.DefinedPlayer` |
| I | Darksteel Monolith | `param:Continuous.MayPlayDontGrantZonePermissions` |
| P | Kheru Goldkeeper | `filtre:targetedBy` |
| I | Archangel of Tithes | `stat:CantBlockUnless`, `param:CantBlockUnless.ValidCard` |
| P | Conspicuous Snoop | `param:Continuous.TopCardOfLibraryIs` |
| I | As Foretold | `param:Continuous.MayPlayDontGrantZonePermissions` |
| I | Opposition Agent | `param:Continuous.ControlOpponentsSearchingLibrary`, `param:Moved.FoundSearchingLibrary` |
| P | Brave the Sands | `param:Continuous.CanBlockAmount` |
| P | Kodama of the East Tree | `param:ChangesZone.NotThisAbility` |
| I | Molten Psyche | `defini:Player.Opponent+IsRemembered` |
| P | Breena, the Demagogue | `expr:PlayerCountDefinedTriggeredAttackedTarget$HasPropertylifeGTX` |
| I | Dance of the Manse | `param:ChangeZone.StaticEffectCheckSVar`, `param:ChangeZone.StaticEffectSVarCompare` |
| I | Ringsight | `filtre:SharesColorWith Valid Creature.Legendary` |
| I | Master of Cruelties | `param:AttackerUnblocked.ValidDefender`, `kw:CARDNAME can only attack alone.` |
| I | Battle Angels of Tyr | `expr:TriggeredTarget$Valid` |
| P | Hunting Velociraptor | `construction:Continuous` |
| P | All-Out Assault | `param:DelayedTrigger.AttackingPlayer` |
| P | Kozilek, the Broken Reality | `param:Manifest.Choices`, `param:Manifest.ChoiceZone` |
| P | Professor Hojo | `trig:BecomesTargetOnce`, `param:BecomesTargetOnce.ValidTarget`, `param:BecomesTargetOnce.ValidSource` |
| P | Call the Spirit Dragons | `param:PutCounter.RememberPut`, `param:PutCounter.ForColor` |
| P | Angel of Destiny | `defini:Player.attackedBySourceThisTurn` |
| P | Narci, Fable Singer | `trig:AbilityResolves`, `param:AbilityResolves.ValidSource`, `param:AbilityResolves.ValidSpellAbility` |
| I | Topography Tracker | `repl:Explore`, `param:Explore.ActiveZones`, `param:Explore.ValidExplorer`, `param:Explore.ReplaceWith` |
| I | Barbarian Class | `repl:RollDice`, `param:RollDice.ActiveZones`, `param:RollDice.ValidPlayer`, `param:RollDice.ReplaceWith` … |
| P | Whip of Erebos | `param:Animate.LeaveBattlefield`, `param:Animate.sVars` |
| I | Wyll, Blade of Frontiers | `repl:RollDice`, `param:RollDice.ActiveZones`, `param:RollDice.ValidPlayer`, `param:RollDice.ReplaceWith` … |
| P | The Lord of Pain | `filtre:TriggeredActivator` |
| I | Will of the Abzan | `param:RepeatEach.RepeatTargeted` |
| P | The Skullspore Nexus | `expr:TriggerObjectsCards$CardPower` |
| P | Summon: Esper Valigarmanda | `param:Play.ManaConversion` |
| P | The Book of Exalted Deeds | `param:Animate.Replacements` |
| I | Winding Constrictor | `param:AddCounter.ValidPlayer` |
| P | Rith, Liberated Primeval | `expr:Count$NumDamageThisTurn` |
| I | Norn's Annex | `construction:CantAttackUnless` |
| I | Mass of Mysteries | `kwval:myriad` |
| P | Sting, the Glinting Dagger | `filtre:blockingValid Goblin`, `filtre:blockingValid Orc`, `filtre:blockingValid Creature.EquippedBy` |
| I | Grab the Prize | `expr:Discarded$Valid` |
| P | Kogla and Yidaro | `defini:DiscardedCards` |
| P | Welcome to . . . | `construction:Chapter` |
| P | Jade Orb of Dragonkind | `construction:Mana` |
| P | Unbound Flourishing | `api:ChangeX`, `param:ChangeX.Value`, `param:SpellCast.HasXManaCost`, `param:SpellAbilityCast.HasXManaCost` |
| I | Jinnie Fay, Jetmir's Second | `construction:CreateToken` |
| I | Rikku, Resourceful Guardian | `defini:TriggeredObjectLKICopy` |
| P | Everlasting Torment | `stat:WitherDamage` |
| I | Jadar, Ghoulcaller of Nephalia | `filtre:withDecayed` |
| P | Strong, the Brutish Thespian | `stat:GainLifeRadiation`, `param:GainLifeRadiation.ValidPlayer` |
| I | Reunion of the House | `param:ChangeZone.MaxTotalTargetPower` |
| I | Nightkin Ambusher | `param:CantBlockBy.ValidDefender`, `filtre:Condition Counters.RAD` |
| P | Deeproot Pilgrimage | `trig:TapAll` |
| I | New Blood | `api:ChangeText`, `param:ChangeText.ChangeTypeWord`, `param:ChangeText.Duration` |
| I | Mardu Siegebreaker | `construction:Attacks` |
| P | Rammas Echor, Ancient Shield | `kwval:exalted` |
| P | Thousand-Year Storm | `expr:TriggerObjectsCurrentCastSpells$Valid` |
| P | Gollum, Obsessed Stalker | `param:Effect.Unique`, `defini:Opponent.HasCardsInCommand_Effect.namedDamaged` |
| P | Squandered Resources | `construction:ManaReflected` |
| I | Chaos Dragon | `param:RollDice.RememberHighestPlayer`, `defini:Player.Opponent+IsRemembered` |
| I | Champion of the Path | `cout:BeholdExile` |
| P | Summon: Magus Sisters | `param:Charm.Random` |
| P | Quicksilver Elemental | `param:Effect.RememberLKI` |
| P | Katara, Water Tribe's Hope | `param:AnimateAll.XMin` |
| I | Haunting Voyage | `expr:Count$Foretold` |
| P | Gluntch, the Bestower | `param:ChoosePlayer.RememberChosen`, `param:PutCounter.Chooser`, `param:PutCounter.Placer` |
| I | Zurgo, Thunder's Decree | `param:Continuous.Phases` |
| I | Grafdigger's Cage | `param:Moved.Prevent`, `param:Moved.Layer` |
| I | Twinning Staff | `repl:CopySpell`, `param:CopySpell.ActiveZones`, `param:CopySpell.ValidPlayer`, `param:CopySpell.ValidSpell` … |
| P | Zuko, Firebending Master | `param:SpellCast.Phase`, `construction:Firebending` |
| P | Tyvar the Bellicose | `construction:Continuous` |
| I | Notorious Throng | `expr:Count$BloodthirstAmount`, `kw:Prowl` |
| P | Vault 12: The Necropolis | `expr:PlayerCountPlayers$Counters` |
| P | Sigurd, Jarl of Ravensthorpe | `param:AddOrRemoveCounter.Boast` |
| P | Danny Pink | `construction:Continuous` |
| P | Wastescape Battlemage | `filtre:kicked 1`, `filtre:kicked 2`, `construction:Kicker` |
| P | Summons of Saruman | `construction:Flashback` |
| P | Food Chain | `expr:Exiled$CardManaCost` |
| P | The Cruelty of Gix | `kw:Read ahead` |
| P | Y'shtola Rhul | `expr:Count$FinishedEndOfTurnsThisTurn` |
| I | Marisi, Breaker of the Coil | `param:CantBeCast.Phases` |
| P | Goldberry, River-Daughter | `param:MoveCounter.RememberPut`, `param:MoveCounter.NonZero` |
| P | Wedding Ring | `filtre:controlsArtifact.namedWedding Ring` |
| P | Arwen, Mortal Queen | `param:Pump.CounterNum` |
| P | Auron, Venerated Guardian | `param:PutCounter.RememberAmount`, `defini:Spawner>TriggeredDefendingPlayer` |
| P | Atraxa, Grand Unifier | `param:RepeatEach.RepeatTypesFrom` |
| P | Biomancer's Familiar | `stat:CanAdapt`, `param:CanAdapt.ValidCard`, `trig:Adapt`, `param:Adapt.ValidCard` … |
| P | Avenger of the Fallen | `construction:Mobilize` |
| P | Doc Aurlock, Grizzled Genius | `construction:ReduceCost` |
| I | Hordewing Skaab | `expr:TriggeredPlayersTargets$Amount` |
| P | Iron Mastiff | `expr:PlayerCountOpponents$HasPropertyDefending` |
| P | Oft-Nabbed Goat | `param:Draw.Activator`, `defini:NonTriggeredCardOwner` |
| P | Deadpool, Trading Card | `api:ExchangeTextBox` |
| P | Jeweled Amulet | `param:PutCounter.RememberCostMana`, `construction:Mana` |
| P | Ob Nixilis, Captive Kingpin | `param:LifeLostAll.ValidAmountEach` |
| P | Kess, Dissident Mage | `param:Continuous.ReplaceGraveyard` |
| P | Azula, Cunning Usurper | `param:Continuous.MayPlayWithFlash` |
| P | Hateful Eidolon | `expr:TriggeredCard$AttachedTo` |
| P | Celebr-8000 | `param:RollDice.SubsForEach`, `param:RollDice.NoteDoubles` |
| P | Brudiclad, Telchor Engineer | `param:Clone.ChoiceOptional`, `param:Clone.ExcludeChosen` |
| P | Blitzball Stadium | `expr:Count$DifferentCounterKinds` |
| P | Aboleth Spawn | `trig:AbilityTriggered`, `param:AbilityTriggered.ValidDestination`, `param:AbilityTriggered.ValidMode`, `param:AbilityTriggered.ValidSource` … |
| I | Tranquil Frillback | `cout:Mana`, `param:ImmediateTrigger.Announce`, `param:ImmediateTrigger.AnnounceMax` |
| P | Historian's Boon | `trig:AbilityTriggered`, `param:AbilityTriggered.ValidMode`, `param:AbilityTriggered.ValidSource`, `param:AbilityTriggered.ValidSpellAbility` |
| I | Misleading Signpost | `api:ChangeCombatants`, `param:ChangeCombatants.Attacking` |
| P | Tectonic Giant | `param:Attacks.ValidSource` |
| I | Eventide's Shadow | `construction:RemoveCounter` |
| P | Wall of Stolen Identity | `param:Clone.RememberCloneOrigin` |
| I | Fade from History | `defini:Player.controlsEnchantment,controlsArtifact` |
| P | Goblin Welder | `expr:SVar$CheckRemem` |
| P | Sephiroth, Fabled SOLDIER | `repl:Transform`, `param:Transform.ValidCard`, `param:Transform.ReplaceWith` |
| I | Firion, Wild Rose Warrior | `construction:ChangesZone` |
| P | Felix Five-Boots | `param:Panharmonicon.ValidSource`, `param:Panharmonicon.CombatDamage`, `param:Panharmonicon.ValidTarget` |
| P | Shadrix Silverquill | `param:PutCounterAll.Placer` |
| P | Serra Paragon | `param:LandPlayed.ValidSA` |
| P | Sliver Gravemother | `construction:Continuous` |
| I | Grafted Exoskeleton | `trig:Unattached`, `param:Unattached.ValidAttachment`, `param:Unattached.ValidObject`, `defini:TriggeredObjectLKICopy` |
| P | Collective Effort | `construction:Escalate` |
| I | Wheel of Misfortune | `param:ChooseNumber.Secretly`, `param:ChooseNumber.Highest`, `param:ChooseNumber.NotLowest` |
| I | Night Shift of the Living Dead | `trig:TurnBegin`, `kw:After you roll a die, you may pay 1 life. If you do, increase or decrease the result by 1. Do this only once each turn.` |
| P | Songbirds' Blessing | `param:DigUntil.OptionalFoundMove`, `param:DigUntil.OptionalNoDestination` |
| P | Ironwill Forger | `kwval:myriad` |
| I | Grell Philosopher | `param:Continuous.ManaConversion`, `param:Effect.RememberLKI` |
| P | Sunforger | `cout:Unattach` |
| P | Carth the Lion | `construction:RaiseCost` |
| I | Leyline Tyrant | `param:ImmediateTrigger.XColor`, `param:ImmediateTrigger.XAnnounceTitle` |
| P | Tawnos, the Toymaker | `param:CopySpellAbility.AddTypes` |
| P | Squee, Dubious Monarch | `construction:AlternativeCost` |
| I | Mog, Moogle Warrior | `param:Bookkeeping.NoteCards`, `param:Bookkeeping.NoteCardsFor`, `defini:Player.NotedForDiscard`, `param:Bookkeeping.ClearNotedCardsFor` |
| P | Light-Paws, Emperor's Voice | `filtre:CanEnchantSource`, `filtre:doesNotShareNameWith Aura.YouCtrl` |
| P | Myr Superion | `stat:ManaRestriction`, `param:ManaRestriction.ValidSource`, `param:ManaRestriction.EffectZone` |
| I | Corrupted Shapeshifter | `param:Moved.Layer` |
| I | Season of Gathering | `param:PutCounter.Pawprint`, `param:PutCounter.RememberCards`, `param:GenericChoice.Pawprint`, `param:Draw.Pawprint` … |
| P | Wall of Glare | `param:Continuous.CanBlockAny` |
| P | The Weatherseed Treaty | `kw:Read ahead` |
| P | Blast-Furnace Hellkite | `kw:Offering` |
