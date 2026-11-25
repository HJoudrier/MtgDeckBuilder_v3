# Cartes d'EDHREC que le moteur ne joue pas encore entièrement

Mesure du 25 novembre 2026, sur 7 336 cartes distinctes : celles des pages des cent premiers commandants de
l'année chez EDHREC (`json.edhrec.com`), chacune lue avec son script Forge (dépôt cloné au commit `3e1fa4ed`) et
sa couverture calculée par le moteur lui-même (`definitionForge()`). Le poids d'une carte est le nombre de decks qui la
jouent, additionné sur ces cent pages : il classe, il ne mesure pas une part de marché.

| | au départ (lot F60) | au 18 novembre | 24 novembre, avant le lot F83 | aujourd'hui (lots F83 à F106) |
|---|---|---|---|---|
| complètes | 6063 | 6611 | 6552 | **6940** |
| partielles (une partie du texte est jouée) | 830 | 486 | 503 | 282 |
| injouables (le sort ou une contrepartie manque) | 484 | 280 | 281 | 114 |

Le banc a été reconstruit pour la mesure du 24 novembre : la liste des cartes diffère de quelques unités de celle du 18
(7 336 contre 7 379 — des commandants ont bougé dans le classement), et les cartes sont lues sans catalogue, depuis leur seul
script. Les deux mesures se comparent donc à quelques cartes près ; seule la dernière colonne se compare à l'avant-dernière
exactement : même banc, mêmes cartes, 388 cartes de plus complètes.

## Ce qui manque le plus

Les éléments que le moteur ne sait pas lire, par poids décroissant (nombre de cartes entre parenthèses).

| Élément | Cartes | Exemples |
|---|---|---|
| `construction:Continuous` | 11 | Dracogenesis, As Foretold, Hunting Velociraptor |
| `param:MoveCounter.ValidDefined` | 1 | Forgotten Ancient |
| `construction:Mana` | 6 | Master of Dark Rites, Jade Orb of Dragonkind, Jeweled Amulet |
| `param:AddPhase.ExtraPhaseDelayedTrigger` | 2 | Moraug, Fury of Akoum, Bumi, Unleashed |
| `param:AddPhase.ExtraPhaseDelayedTriggerExecute` | 2 | Moraug, Fury of Akoum, Bumi, Unleashed |
| `api:ExchangeLifeVariant` | 2 | Tree of Redemption, Tree of Perdition |
| `param:ExchangeLifeVariant.Mode` | 2 | Tree of Redemption, Tree of Perdition |
| `param:PutCounter.RememberAmount` | 3 | Earthbender Ascension, Auron, Venerated Guardian, Cosima, God of the Voyage |
| `trig:AbilityTriggered` | 3 | Firebender Ascension, Aboleth Spawn, Historian's Boon |
| `param:AbilityTriggered.ValidMode` | 3 | Firebender Ascension, Aboleth Spawn, Historian's Boon |
| `param:AbilityTriggered.ValidSource` | 3 | Firebender Ascension, Aboleth Spawn, Historian's Boon |
| `kw:Mutate` | 18 | Nethroi, Apex of Death, Gemrazer, Brokkos, Apex of Forever |
| `defini:ReplacedNewCard.Creature` | 1 | Spark Double |
| `defini:ReplacedNewCard.Planeswalker` | 1 | Spark Double |
| `cout:BeholdExile` | 3 | Champions of the Perfect, Champion of the Path, Champion of the Weird |
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
| `param:Panharmonicon.ValidZone` | 1 | Echoes of Eternity |
| `expr:Count$CardNumAttacksThisTurn` | 1 | Moraug, Fury of Akoum |
| `param:Continuous.ManaConversion` | 2 | Drana and Linvala, Grell Philosopher |
| `trig:Mutates` | 16 | Nethroi, Apex of Death, Gemrazer, Sawtusk Demolisher |
| `param:Mutates.ValidCard` | 16 | Nethroi, Apex of Death, Gemrazer, Sawtusk Demolisher |
| `param:PutCounter.RememberPut` | 4 | Call the Spirit Dragons, Craig Boone, Novac Guard, Fangs of Kalonia |
| `param:Continuous.TopCardOfLibraryIs` | 2 | Conspicuous Snoop, Vampire Nocturnus |
| `filtre:IsSolved` | 3 | Case of the Locked Hothouse, Case of the Ransacked Lab, Case of the Uneaten Feast |
| `param:Play.ForgetRemembered` | 1 | Descendants' Path |
| `filtre:sharesCreatureTypeWith Valid Creature.YouCtrl` | 1 | Descendants' Path |
| `kw:Read ahead` | 4 | The Cruelty of Gix, The Weatherseed Treaty, The Elder Dragon War |
| `param:Moved.Layer` | 3 | Grafdigger's Cage, Corrupted Shapeshifter, Xantcha, Sleeper Agent |
| `kw:MayFlashSac` | 1 | Necromancy |
| `param:ChangeZone.ChoiceZone` | 1 | Broodcaller Scourge |
| `param:ChangeZone.Amount` | 1 | Broodcaller Scourge |
| `construction:TapsForMana` | 1 | Treasure Nabber |
| `kwval:hexproof:chosencolor` | 1 | Skrelv, Defector Mite |
| `kwval:toxic:1` | 1 | Skrelv, Defector Mite |
| `param:Pump.DefinedKW` | 1 | Skrelv, Defector Mite |
| `kwval:myriad` | 2 | Mass of Mysteries, Ironwill Forger |
| `construction:ETBReplacement` | 1 | Serra's Emissary |
| `trig:AbilityResolves` | 2 | Narci, Fable Singer, Tom Bombadil |
| `param:AbilityResolves.ValidSource` | 2 | Narci, Fable Singer, Tom Bombadil |
| `param:AbilityResolves.ValidSpellAbility` | 2 | Narci, Fable Singer, Tom Bombadil |
| `defini:TriggeredObjectLKICopy` | 2 | Rikku, Resourceful Guardian, Grafted Exoskeleton |
| `stat:CantBlockUnless` | 1 | Archangel of Tithes |
| `param:CantBlockUnless.ValidCard` | 1 | Archangel of Tithes |
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
| `expr:PlayerCountDefinedTriggeredAttackedTarget$HasPropertylifeGTX` | 1 | Breena, the Demagogue |
| `param:AttackerUnblocked.ValidDefender` | 1 | Master of Cruelties |
| `kw:CARDNAME can only attack alone.` | 1 | Master of Cruelties |
| `expr:TriggeredTarget$Valid` | 1 | Battle Angels of Tyr |
| `param:DelayedTrigger.AttackingPlayer` | 1 | All-Out Assault |
| `param:Manifest.Choices` | 1 | Kozilek, the Broken Reality |
| `param:Manifest.ChoiceZone` | 1 | Kozilek, the Broken Reality |
| `param:PutCounter.ForColor` | 1 | Call the Spirit Dragons |
| `defini:Player.attackedBySourceThisTurn` | 1 | Angel of Destiny |
| `param:Draw.Activator` | 2 | Oft-Nabbed Goat, Xantcha, Sleeper Agent |
| `filtre:TriggeredActivator` | 1 | The Lord of Pain |
| `param:SpellCast.HasXManaCost` | 2 | Unbound Flourishing, Brass Infiniscope |

## Les cartes, de la plus jouée à la moins jouée

`P` : partielle, `I` : injouable. Les éléments cités sont ceux que le moteur ne sait pas lire ; une carte à
un seul élément est celle que le prochain lot rendra complète.

| | Carte | Ce qui manque |
|---|---|---|
| P | Forgotten Ancient | `param:MoveCounter.ValidDefined` |
| P | Spark Double | `defini:ReplacedNewCard.Creature`, `defini:ReplacedNewCard.Planeswalker` |
| I | Morophon, the Boundless | `param:ReduceCost.IgnoreGeneric` |
| P | Birgi, God of Storytelling | `stat:Activations`, `param:Activations.ValidCard`, `param:Activations.ValidSA`, `param:Activations.ValidPlayer` … |
| P | Dracogenesis | `construction:Continuous` |
| P | Echoes of Eternity | `param:Panharmonicon.ValidZone` |
| P | Moraug, Fury of Akoum | `param:AddPhase.ExtraPhaseDelayedTrigger`, `param:AddPhase.ExtraPhaseDelayedTriggerExecute`, `expr:Count$CardNumAttacksThisTurn` |
| P | Earthbender Ascension | `param:PutCounter.RememberAmount` |
| P | Descendants' Path | `param:Play.ForgetRemembered`, `filtre:sharesCreatureTypeWith Valid Creature.YouCtrl` |
| P | Bumi, Unleashed | `param:AddPhase.ExtraPhaseDelayedTrigger`, `param:AddPhase.ExtraPhaseDelayedTriggerExecute` |
| P | Necromancy | `kw:MayFlashSac` |
| P | Broodcaller Scourge | `param:ChangeZone.ChoiceZone`, `param:ChangeZone.Amount` |
| P | Treasure Nabber | `construction:TapsForMana` |
| P | Master of Dark Rites | `construction:Mana` |
| P | Skrelv, Defector Mite | `kwval:hexproof:chosencolor`, `kwval:toxic:1`, `param:Pump.DefinedKW` |
| P | Tree of Redemption | `api:ExchangeLifeVariant`, `param:ExchangeLifeVariant.Mode` |
| P | Case of the Locked Hothouse | `filtre:IsSolved` |
| P | Serra's Emissary | `construction:ETBReplacement` |
| P | Drana and Linvala | `param:Continuous.ManaConversion` |
| P | Firebender Ascension | `trig:AbilityTriggered`, `param:AbilityTriggered.ValidMode`, `param:AbilityTriggered.ValidSource`, `param:AbilityTriggered.TriggeredOwnAbility` |
| P | Tree of Perdition | `api:ExchangeLifeVariant`, `param:ExchangeLifeVariant.Mode` |
| I | Champions of the Perfect | `cout:BeholdExile` |
| I | Archangel of Tithes | `stat:CantBlockUnless`, `param:CantBlockUnless.ValidCard` |
| P | Conspicuous Snoop | `param:Continuous.TopCardOfLibraryIs` |
| I | As Foretold | `construction:Continuous` |
| I | Opposition Agent | `param:Continuous.ControlOpponentsSearchingLibrary`, `param:Moved.FoundSearchingLibrary` |
| P | Brave the Sands | `param:Continuous.CanBlockAmount` |
| P | Kodama of the East Tree | `param:ChangesZone.NotThisAbility` |
| P | Breena, the Demagogue | `expr:PlayerCountDefinedTriggeredAttackedTarget$HasPropertylifeGTX` |
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
| I | Wyll, Blade of Frontiers | `repl:RollDice`, `param:RollDice.ActiveZones`, `param:RollDice.ValidPlayer`, `param:RollDice.ReplaceWith` … |
| P | The Lord of Pain | `filtre:TriggeredActivator` |
| P | Summon: Esper Valigarmanda | `param:Play.ManaConversion` |
| P | The Book of Exalted Deeds | `param:Animate.Replacements` |
| I | Winding Constrictor | `param:AddCounter.ValidPlayer` |
| P | Rith, Liberated Primeval | `expr:Count$NumDamageThisTurn` |
| I | Mass of Mysteries | `kwval:myriad` |
| P | Sting, the Glinting Dagger | `filtre:blockingValid Goblin`, `filtre:blockingValid Orc`, `filtre:blockingValid Creature.EquippedBy` |
| P | Kogla and Yidaro | `defini:DiscardedCards` |
| P | Welcome to . . . | `construction:Chapter` |
| P | Jade Orb of Dragonkind | `construction:Mana` |
| P | Unbound Flourishing | `api:ChangeX`, `param:ChangeX.Value`, `param:SpellCast.HasXManaCost`, `param:SpellAbilityCast.HasXManaCost` |
| I | Jinnie Fay, Jetmir's Second | `construction:CreateToken` |
| I | Rikku, Resourceful Guardian | `defini:TriggeredObjectLKICopy` |
| P | Everlasting Torment | `stat:WitherDamage` |
| I | Jadar, Ghoulcaller of Nephalia | `filtre:withDecayed` |
| P | Strong, the Brutish Thespian | `stat:GainLifeRadiation`, `param:GainLifeRadiation.ValidPlayer` |
| I | Nightkin Ambusher | `param:CantBlockBy.ValidDefender`, `filtre:Condition Counters.RAD` |
| P | Deeproot Pilgrimage | `trig:TapAll` |
| I | New Blood | `api:ChangeText`, `param:ChangeText.ChangeTypeWord`, `param:ChangeText.Duration` |
| P | Thousand-Year Storm | `expr:TriggerObjectsCurrentCastSpells$Valid` |
| P | Gollum, Obsessed Stalker | `param:Effect.Unique`, `defini:Opponent.HasCardsInCommand_Effect.namedDamaged` |
| P | Squandered Resources | `construction:ManaReflected` |
| I | Chaos Dragon | `param:RollDice.RememberHighestPlayer` |
| I | Champion of the Path | `cout:BeholdExile` |
| P | Summon: Magus Sisters | `param:Charm.Random` |
| P | Quicksilver Elemental | `param:Effect.RememberLKI` |
| P | Katara, Water Tribe's Hope | `param:AnimateAll.XMin` |
| P | Gluntch, the Bestower | `param:ChoosePlayer.RememberChosen` |
| I | Zurgo, Thunder's Decree | `param:Continuous.Phases` |
| I | Grafdigger's Cage | `param:Moved.Prevent`, `param:Moved.Layer` |
| I | Twinning Staff | `repl:CopySpell`, `param:CopySpell.ActiveZones`, `param:CopySpell.ValidPlayer`, `param:CopySpell.ValidSpell` … |
| P | Zuko, Firebending Master | `param:SpellCast.Phase`, `construction:Firebending` |
| P | Tyvar the Bellicose | `construction:Continuous` |
| I | Notorious Throng | `expr:Count$BloodthirstAmount`, `filtre:prowled`, `kw:Prowl` |
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
| P | Arwen, Mortal Queen | `param:Pump.CounterNum` |
| P | Auron, Venerated Guardian | `param:PutCounter.RememberAmount`, `defini:Spawner>TriggeredDefendingPlayer` |
| P | Atraxa, Grand Unifier | `param:RepeatEach.RepeatTypesFrom` |
| P | Biomancer's Familiar | `stat:CanAdapt`, `param:CanAdapt.ValidCard`, `trig:Adapt`, `param:Adapt.ValidCard` … |
| P | Avenger of the Fallen | `construction:Mobilize` |
| P | Doc Aurlock, Grizzled Genius | `construction:ReduceCost` |
| I | Hordewing Skaab | `expr:TriggeredPlayersTargets$Amount` |
| P | Oft-Nabbed Goat | `param:Draw.Activator`, `defini:NonTriggeredCardOwner` |
| P | Deadpool, Trading Card | `api:ExchangeTextBox` |
| P | Jeweled Amulet | `param:PutCounter.RememberCostMana`, `construction:Mana` |
| P | Ob Nixilis, Captive Kingpin | `param:LifeLostAll.ValidAmountEach` |
| P | Kess, Dissident Mage | `param:Continuous.ReplaceGraveyard` |
| P | Azula, Cunning Usurper | `param:Continuous.MayPlayWithFlash` |
| P | Hateful Eidolon | `expr:TriggeredCard$AttachedTo` |
| P | Celebr-8000 | `param:RollDice.SubsForEach`, `param:RollDice.NoteDoubles` |
| P | Brudiclad, Telchor Engineer | `param:Clone.ChoiceOptional`, `param:Clone.ExcludeChosen` |
| P | Aboleth Spawn | `trig:AbilityTriggered`, `param:AbilityTriggered.ValidDestination`, `param:AbilityTriggered.ValidMode`, `param:AbilityTriggered.ValidSource` … |
| I | Tranquil Frillback | `cout:Mana`, `param:ImmediateTrigger.Announce`, `param:ImmediateTrigger.AnnounceMax` |
| P | Historian's Boon | `trig:AbilityTriggered`, `param:AbilityTriggered.ValidMode`, `param:AbilityTriggered.ValidSource`, `param:AbilityTriggered.ValidSpellAbility` |
| I | Misleading Signpost | `api:ChangeCombatants`, `param:ChangeCombatants.Attacking` |
| P | Tectonic Giant | `param:Attacks.ValidSource` |
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
| P | Wall of Glare | `param:Continuous.CanBlockAny` |
| P | The Weatherseed Treaty | `kw:Read ahead` |
| P | Blast-Furnace Hellkite | `kw:Offering` |
| P | Jhoira of the Ghitu | `defini:ExiledCards`, `defini:ExiledCards.withoutSuspend` |
| I | Gonti, Night Minister | `param:Dig.ForceReveal`, `param:Dig.DefinedExiler` |
| I | Coveted Jewel | `trig:AttackerUnblockedOnce`, `param:AttackerUnblockedOnce.ValidAttackingPlayer`, `param:AttackerUnblockedOnce.ValidDefenders` |
| P | Vampire Nocturnus | `param:Continuous.TopCardOfLibraryIs` |
| P | Tinder Wall | `filtre:blockedBySourceLKI` |
| I | Faramir, Prince of Ithilien | `expr:PlayerCountDefinedTriggeredPlayer$HasPropertyattackedYouTheirCurrentTurn` |
| P | Thousand Moons Smithy | `construction:SpellCast` |
| P | Sower of Discord | `param:DamageDoneOnce.ActiveZones`, `param:ChoosePlayer.RememberChosen`, `filtre:NonChosenPlayer` |
| P | Find // Finality | `param:PutCounter.ChoiceOptional` |
| P | Gogo, Master of Mimicry | `param:CopySpellAbility.CantCopy` |
| P | Mantle of the Ancients | `filtre:CanEnchantEquippedBy` |
| P | Mechtitan Core | `defini:ExiledCards.Other` |
| P | Tam, Mindful First-Year | `construction:Animate` |
| I | Hooded Hydra | `repl:TurnFaceUp`, `param:TurnFaceUp.ReplaceWith`, `param:TurnFaceUp.ActiveZones` |
| I | Xantcha, Sleeper Agent | `param:Draw.Activator`, `defini:CardController`, `param:Moved.Layer` |
| P | Palace Jailer | `param:BecomeMonarch.Static` |
| P | Psionic Ritual | `construction:Replicate` |
| I | Library of Leng | `construction:Moved` |
| I | Forgotten Creation | `expr:Discarded$Amount` |
| P | Fall of Cair Andros | `trig:ExcessDamage`, `param:ExcessDamage.ValidTarget`, `param:ExcessDamage.CombatDamage` |
| P | Tom Bombadil | `trig:AbilityResolves`, `param:AbilityResolves.ValidSource`, `param:AbilityResolves.ValidSpellAbility` |
| P | Selfless Squire | `trig:DamagePreventedOnce`, `param:DamagePreventedOnce.ValidTarget` |
| P | Azlask, the Swelling Scourge | `kwval:annihilator:1` |
| P | Mistbind Clique | `trig:Championed`, `param:Championed.ValidCard`, `param:Championed.ValidSource`, `kw:Champion` |
| P | Brass's Tunnel-Grinder | `filtre:descended`, `construction:SpellCast` |
| P | Ballad of the Black Flag | `param:Mill.Imprint` |
| P | Curator of Sun's Creation | `trig:Discover`, `param:Discover.ValidPlayer` |
| I | Archon of Coronation | `param:LifeReduced.Monarch`, `param:LifeReduced.Layer` |
| I | Craig Boone, Novac Guard | `param:PutCounter.RememberPut` |
