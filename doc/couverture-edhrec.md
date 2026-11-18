# Cartes d'EDHREC que le moteur ne joue pas encore entièrement

Mesure du 18 novembre 2026, sur 7 379 cartes distinctes : celles des pages des cent premiers commandants de
l'année chez EDHREC (`json.edhrec.com`), chacune lue avec son script Forge (dépôt cloné au commit `d9ae6615`) et
sa couverture comptée par `couvertureForge()`. Le poids d'une carte est le nombre de decks qui la jouent, additionné
sur ces cent pages : il classe, il ne mesure pas une part de marché.

| | au départ (lot F60) | aujourd'hui |
|---|---|---|
| complètes | 6063 | **6611** |
| partielles (une partie du texte est jouée) | 830 | 486 |
| injouables (le sort ou une contrepartie manque) | 484 | 280 |

La couverture est plus stricte qu'au départ : elle lit aussi les filtres des comptes (`Count$Valid …`), et quatorze
cartes qui passaient pour complètes sans l'être sont retombées. Le gain net en tient compte.

## Ce qui manque le plus

Les éléments que le moteur ne sait pas lire, par poids décroissant (nombre de cartes entre parenthèses).

| Élément | Cartes | Exemples |
|---|---|---|
| `construction:Mana` | 17 | Lion's Eye Diamond, Skirge Familiar, Opal Palace |
| `param:Continuous.GainsAbilitiesOf` | 10 | Drana and Linvala, Hazel's Brewmaster, Conspicuous Snoop |
| `param:Continuous.GainsAbilitiesOfZones` | 7 | Hazel's Brewmaster, Conspicuous Snoop, Agatha's Soul Cauldron |
| `construction:Continuous` | 10 | Hunting Velociraptor, Henzie "Toolbox" Torre, Tyvar the Bellicose |
| `construction:RaiseCost` | 4 | Terror of the Peaks, Carth the Lion, March of Swirling Mist |
| `stat:ManaConvert` | 7 | Chromatic Orrery, Agatha's Soul Cauldron, Mycosynth Lattice |
| `param:ManaConvert.ManaConversion` | 7 | Chromatic Orrery, Agatha's Soul Cauldron, Mycosynth Lattice |
| `param:Continuous.MayPlayDontGrantZonePermissions` | 3 | Dracogenesis, Darksteel Monolith, As Foretold |
| `param:Continuous.MayPlayText` | 1 | Muldrotha, the Gravetide |
| `param:ManaConvert.ValidPlayer` | 6 | Chromatic Orrery, Agatha's Soul Cauldron, Quicksilver Elemental |
| `param:PutCounterAll.CounterType2` | 7 | Brokers Ascendancy, Kheru Goldkeeper, Ajani, the Greathearted |
| `trig:CounterPlayerAddedAll` | 5 | All Will Be One, Generous Patron, Rikku, Resourceful Guardian |
| `param:CounterPlayerAddedAll.ValidObject` | 5 | All Will Be One, Generous Patron, Rikku, Resourceful Guardian |
| `param:CounterPlayerAddedAll.ValidSource` | 5 | All Will Be One, Generous Patron, Rikku, Resourceful Guardian |
| `expr:Count$ThisTurnActivated` | 6 | Forge Anew, Professor Hojo, The Chain Veil |
| `param:MoveCounter.ValidDefined` | 1 | Forgotten Ancient |
| `param:ImmediateTrigger.TriggerAmount` | 5 | Earthbender Ascension, Auron, Venerated Guardian, Ajani, Nacatl Pariah |
| `param:PutCounter.Placer` | 4 | Promise of Loyalty, Gluntch, the Bestower, Alexios, Deimos of Kosmos |
| `param:AddPhase.ExtraPhaseDelayedTrigger` | 2 | Moraug, Fury of Akoum, Bumi, Unleashed |
| `param:AddPhase.ExtraPhaseDelayedTriggerExcute` | 2 | Moraug, Fury of Akoum, Bumi, Unleashed |
| `expr:Count$ValidStack` | 1 | Mindbreak Trap |
| `param:ChooseCard.ChooseEach` | 4 | Liliana, Dreadhorde General, Ajani, Nacatl Pariah, Tragic Arrogance |
| `param:Phases.AnyNumber` | 1 | Ripples of Potential |
| `param:Proliferate.RememberPut` | 1 | Ripples of Potential |
| `param:ReduceCost.Color` | 3 | Morophon, the Boundless, Avatar Aang, Even the Score |
| `api:Blight` | 4 | High Perfect Morcant, Sinister Gnarlbark, Shadow Urchin |
| `param:Blight.Num` | 4 | High Perfect Morcant, Sinister Gnarlbark, Shadow Urchin |
| `api:ExchangeLifeVariant` | 2 | Tree of Redemption, Tree of Perdition |
| `param:ExchangeLifeVariant.Mode` | 2 | Tree of Redemption, Tree of Perdition |
| `param:PutCounter.Chooser` | 2 | Promise of Loyalty, Gluntch, the Bestower |
| `param:ManaConvert.ValidCard` | 5 | Agatha's Soul Cauldron, Quicksilver Elemental, Oath of Nissa |
| `param:ManaConvert.ValidSA` | 5 | Agatha's Soul Cauldron, Quicksilver Elemental, Oath of Nissa |
| `expr:Count$ValidAll` | 2 | Mangara, the Diplomat, Kefka, Dancing Mad |
| `trig:RolledDieOnce` | 4 | Wyll, Blade of Frontiers, Vexing Puzzlebox, Brazen Dwarf |
| `param:RolledDieOnce.ValidPlayer` | 4 | Wyll, Blade of Frontiers, Vexing Puzzlebox, Brazen Dwarf |
| `param:PutCounter.RememberAmount` | 3 | Earthbender Ascension, Auron, Venerated Guardian, Cosima, God of the Voyage |
| `trig:AbilityTriggered` | 3 | Firebender Ascension, Aboleth Spawn, Historian's Boon |
| `param:AbilityTriggered.ValidMode` | 3 | Firebender Ascension, Aboleth Spawn, Historian's Boon |
| `param:AbilityTriggered.ValidSource` | 3 | Firebender Ascension, Aboleth Spawn, Historian's Boon |
| `stat:ActivateAbilityAsIfHaste` | 4 | Thousand-Year Elixir, Tyvar, Jubilant Brawler, Shang-Chi, Master of Kung Fu |
| `param:ActivateAbilityAsIfHaste.ValidCard` | 4 | Thousand-Year Elixir, Tyvar, Jubilant Brawler, Shang-Chi, Master of Kung Fu |
| `param:Animate.sVars` | 3 | Summon: Primal Odin, Whip of Erebos, Vorpal Sword |
| `param:PutCounter.RememberCards` | 2 | Promise of Loyalty, Season of Gathering |
| `param:ChangeZone.DestinationAlternative` | 7 | Emeria Shepherd, Endless Detour, Dina's Guidance |
| `trig:AbilityResolves` | 2 | Tom Bombadil, Narci, Fable Singer |
| `param:AbilityResolves.ValidSource` | 2 | Tom Bombadil, Narci, Fable Singer |
| `param:AbilityResolves.ValidSpellAbility` | 2 | Tom Bombadil, Narci, Fable Singer |
| `trig:ManaExpend` | 5 | Trailtracker Scout, Wandertale Mentor, Pyreswipe Hawk |
| `param:ManaExpend.Amount` | 5 | Trailtracker Scout, Wandertale Mentor, Pyreswipe Hawk |
| `param:ManaExpend.Player` | 5 | Trailtracker Scout, Wandertale Mentor, Pyreswipe Hawk |
| `filtre:TriggeredCards` | 1 | Hedge Shredder |
| `param:PutCounterAll.ValidCards2` | 5 | Brokers Ascendancy, Ajani, the Greathearted, Ajani Steadfast |
| `expr:TriggerCount$Result` | 3 | Mr. House, President and CEO, Vexing Puzzlebox, Monoxa, Midway Manager |
| `construction:Chapter` | 2 | Terra, Magical Adept, Welcome to . . . |
| `param:ChooseCard.MinAmount` | 5 | Archfiend of Depravity, The Legend of Yangchen, Sigarda's Vanguard |
| `kw:Mutate` | 18 | Nethroi, Apex of Death, Gemrazer, Brokkos, Apex of Forever |
| `defini:ReplacedNewCard.Creature` | 1 | Spark Double |
| `defini:ReplacedNewCard.Planeswalker` | 1 | Spark Double |
| `repl:Transform` | 2 | Sephiroth, Fabled SOLDIER, Zenos yae Galvus |
| `param:Transform.ValidCard` | 2 | Sephiroth, Fabled SOLDIER, Zenos yae Galvus |

## Les cartes, de la plus jouée à la moins jouée

`P` : partielle, `I` : injouable. Les éléments cités sont ceux que le moteur ne sait pas lire ; une carte à
un seul élément est celle que le prochain lot rendra complète.

| | Carte | Ce qui manque |
|---|---|---|
| P | Muldrotha, the Gravetide | `param:Continuous.MayPlayText` |
| P | Terror of the Peaks | `construction:RaiseCost` |
| P | Forgotten Ancient | `param:MoveCounter.ValidDefined` |
| I | Mindbreak Trap | `expr:Count$ValidStack` |
| I | Ripples of Potential | `param:Phases.AnyNumber`, `param:Proliferate.RememberPut` |
| P | Liliana, Dreadhorde General | `param:ChooseCard.ChooseEach` |
| P | Hedge Shredder | `filtre:TriggeredCards` |
| P | Spark Double | `defini:ReplacedNewCard.Creature`, `defini:ReplacedNewCard.Planeswalker` |
| I | Lethal Scheme | `defini:Convoked` |
| I | Morophon, the Boundless | `param:ReduceCost.Color`, `param:ReduceCost.IgnoreGeneric` |
| I | Agadeem's Awakening | `param:ChangeZone.TargetsWithDifferentCMC` |
| P | Birgi, God of Storytelling | `stat:Activations`, `param:Activations.ValidCard`, `param:Activations.ValidSA`, `param:Activations.ValidPlayer` … |
| P | Dracogenesis | `param:Continuous.MayPlayDontGrantZonePermissions` |
| I | Promise of Loyalty | `param:PutCounter.Chooser`, `param:PutCounter.Placer`, `param:PutCounter.RememberCards` |
| P | Sephiroth, Fabled SOLDIER | `repl:Transform`, `param:Transform.ValidCard`, `param:Transform.ReplaceWith` |
| P | Echoes of Eternity | `param:Panharmonicon.ValidZone` |
| P | Moraug, Fury of Akoum | `param:AddPhase.ExtraPhaseDelayedTrigger`, `param:AddPhase.ExtraPhaseDelayedTriggerExcute`, `expr:Count$CardNumAttacksThisTurn` |
| P | High Perfect Morcant | `api:Blight`, `param:Blight.Num` |
| P | Lion's Eye Diamond | `construction:Mana` |
| I | Temple of the Dragon Queen | `construction:Moved` |
| P | Kambal, Profiteering Mayor | `defini:TriggeredCards` |
| P | Earthbender Ascension | `param:PutCounter.RememberAmount`, `param:ImmediateTrigger.TriggerAmount` |
| P | Descendants' Path | `param:Play.ForgetRemembered` |
| P | Bumi, Unleashed | `param:AddPhase.ExtraPhaseDelayedTrigger`, `param:AddPhase.ExtraPhaseDelayedTriggerExcute` |
| P | Mangara, the Diplomat | `expr:Count$ValidAll`, `filtre:attackingYouOrYourPWLKI` |
| P | Fire Nation Palace | `kwval:firebending:4` |
| P | Secret Tunnel | `param:Effect.TargetsWithSameCreatureType` |
| P | Necromancy | `kw:MayFlashSac` |
| P | Treasure Nabber | `construction:TapsForMana` |
| P | Broodcaller Scourge | `param:ChangeZone.ChoiceZone`, `param:ChangeZone.Amount` |
| P | Weathered Sentinels | `param:CanAttackDefender.ValidAttacked` |
| P | Brokers Ascendancy | `param:PutCounterAll.ValidCards2`, `param:PutCounterAll.CounterType2` |
| P | All Will Be One | `trig:CounterPlayerAddedAll`, `param:CounterPlayerAddedAll.ValidObject`, `param:CounterPlayerAddedAll.ValidSource` |
| P | Skrelv, Defector Mite | `kwval:hexproof:chosencolor`, `kwval:toxic:1`, `param:Pump.DefinedKW` |
| P | Tree of Redemption | `api:ExchangeLifeVariant`, `param:ExchangeLifeVariant.Mode` |
| P | Case of the Locked Hothouse | `filtre:IsSolved` |
| I | Wan Shi Tong, Librarian | `trig:SearchedLibrary`, `param:SearchedLibrary.ValidPlayer`, `param:SearchedLibrary.SearchOwnLibrary` |
| P | Chromatic Orrery | `stat:ManaConvert`, `param:ManaConvert.ValidPlayer`, `param:ManaConvert.ManaConversion` |
| P | Serra's Emissary | `construction:ETBReplacement` |
| P | Drana and Linvala | `param:Continuous.GainsAbilitiesOf`, `param:Continuous.GainsValidAbilities`, `param:Continuous.ManaConversion` |
| I | Drown in the Loch | `param:Counter.TargetsWithControllerProperty`, `param:Destroy.TargetsWithControllerProperty` |
| P | Gisela, the Broken Blade | `param:Phase.IsPresent2`, `api:Meld`, `param:Meld.Name`, `param:Meld.Primary` … |
| P | Tom Bombadil | `trig:AbilityResolves`, `param:AbilityResolves.ValidSource`, `param:AbilityResolves.ValidSpellAbility` |
| P | Firebender Ascension | `trig:AbilityTriggered`, `param:AbilityTriggered.ValidMode`, `param:AbilityTriggered.ValidSource`, `param:AbilityTriggered.TriggeredOwnAbility` |
| P | Terra, Magical Adept | `construction:Chapter` |
| I | Tibalt's Trickery | `param:ChooseNumber.Random`, `param:DigUntil.ImprintRevealed`, `param:Counter.RememberForCounter` |
| I | Unbreakable Formation | `param:PumpAll.ConditionPhases`, `param:PutCounterAll.ConditionPhases` |
| P | Summon: Primal Odin | `param:Animate.sVars` |
| P | Tree of Perdition | `api:ExchangeLifeVariant`, `param:ExchangeLifeVariant.Mode` |
| I | Champions of the Perfect | `cout:BeholdExile` |
| I | Teferi's Puzzle Box | `param:ChangeZoneAll.DefinedPlayer` |
| I | Darksteel Monolith | `param:Continuous.MayPlayDontGrantZonePermissions` |
| P | Kheru Goldkeeper | `filtre:targetedBy`, `param:PutCounterAll.CounterType2`, `param:PutCounterAll.CounterNum2` |
| P | Emeria Shepherd | `param:ChangeZone.DestinationAlternative`, `param:ChangeZone.DestAltSVar` |
| P | Hazel's Brewmaster | `param:Continuous.GainsAbilitiesOf`, `param:Continuous.GainsAbilitiesOfZones` |
| I | Archangel of Tithes | `stat:CantBlockUnless`, `param:CantBlockUnless.ValidCard` |
| P | Conspicuous Snoop | `param:Continuous.TopCardOfLibraryIs`, `param:Continuous.GainsAbilitiesOf`, `param:Continuous.GainsAbilitiesOfZones` |
| I | As Foretold | `param:Continuous.MayPlayDontGrantZonePermissions` |
| I | Opposition Agent | `param:Continuous.ControlOpponentsSearchingLibrary`, `param:Moved.FoundSearchingLibrary` |
| P | Brave the Sands | `param:Continuous.CanBlockAmount` |
| P | Skirge Familiar | `construction:Mana` |
| P | Kodama of the East Tree | `param:ChangesZone.NotThisAbility` |
| P | Delina, Wild Mage | `construction:Attacks` |
| P | Opal Palace | `construction:Mana` |
| I | Molten Psyche | `defini:Player.Opponent+IsRemembered` |
| P | Thousand-Year Elixir | `stat:ActivateAbilityAsIfHaste`, `param:ActivateAbilityAsIfHaste.ValidCard` |
| P | Hazel of the Rootbloom | `construction:Mana` |
| P | Felidar Sovereign | `param:Phase.LifeTotal`, `param:Phase.LifeAmount` |
| P | Nicanzil, Current Conductor | `trig:Explores`, `param:Explores.ValidCard`, `param:Explores.ValidExplored` |
| P | Marvin, Murderous Mimic | `param:Continuous.GainsAbilitiesOf` |
| I | Kozilek's Command | `param:Charm.Announce` |
| P | Breena, the Demagogue | `expr:PlayerCountDefinedTriggeredAttackedTarget$HasPropertylifeGTX` |
| I | Dance of the Manse | `param:ChangeZone.StaticEffectCheckSVar`, `param:ChangeZone.StaticEffectSVarCompare` |
| P | Not of This World | `expr:TargetedByTarget$Valid`, `param:ReduceCost.Relative` |
| I | Ringsight | `filtre:SharesColorWith Valid Creature.Legendary` |
| I | Forge Anew | `construction:CastWithFlash`, `expr:Count$ThisTurnActivated` |
| I | Master of Cruelties | `param:AttackerUnblocked.ValidDefender`, `kw:CARDNAME can only attack alone.` |
| P | Kefka, Dancing Mad | `expr:Count$ValidAll` |
| I | Battle Angels of Tyr | `expr:TriggeredTarget$Valid` |
| P | Zellix, Sanity Flayer | `trig:MilledOnce`, `param:MilledOnce.ValidPlayer`, `param:MilledOnce.ValidCard` |
| P | Hunting Velociraptor | `construction:Continuous` |
| I | Emrakul, the Promised End | `api:ControlPlayer`, `param:DelayedTrigger.DelayedTriggerDefinedPlayer` |
| P | Mr. House, President and CEO | `expr:Count$TotalManaSpent`, `expr:TriggerCount$Result` |
| P | All-Out Assault | `param:DelayedTrigger.AttackingPlayer` |
| I | Wilhelt, the Rotcleaver | `filtre:withoutDecayed` |
| P | Kozilek, the Broken Reality | `param:Manifest.Choices`, `param:Manifest.ChoiceZone` |
| P | Professor Hojo | `trig:BecomesTargetOnce`, `param:BecomesTargetOnce.ValidTarget`, `param:BecomesTargetOnce.ValidSource`, `expr:Count$ThisTurnActivated` |
| P | Call the Spirit Dragons | `param:PutCounter.RememberPut`, `param:PutCounter.ForColor` |
| I | Expressive Iteration | `param:Dig.NoLooking` |
| P | Angel of Destiny | `defini:Player.attackedBySourceThisTurn` |
| P | Wall of Roots | `construction:Mana` |
| I | Topography Tracker | `repl:Explore`, `param:Explore.ActiveZones`, `param:Explore.ValidExplorer`, `param:Explore.ReplaceWith` |
| P | Narci, Fable Singer | `trig:AbilityResolves`, `param:AbilityResolves.ValidSource`, `param:AbilityResolves.ValidSpellAbility` |
| I | Barbarian Class | `repl:RollDice`, `param:RollDice.ActiveZones`, `param:RollDice.ValidPlayer`, `param:RollDice.ReplaceWith` … |
| I | The Last Agni Kai | `param:Fight.ExcessSVar`, `param:Fight.ExcessSVarCondition` |
| P | Avatar Aang | `trig:ElementalBend`, `param:ElementalBend.ValidPlayer`, `expr:Count$AllFourBend`, `param:SetState.RememberChanged` … |
| P | Whip of Erebos | `param:Animate.LeaveBattlefield`, `param:Animate.sVars` |
| I | Wyll, Blade of Frontiers | `trig:RolledDieOnce`, `param:RolledDieOnce.ValidPlayer`, `repl:RollDice`, `param:RollDice.ActiveZones` … |
| I | Commandeer | `api:ControlSpell`, `param:ControlSpell.Mode` |
| P | The Lord of Pain | `filtre:TriggeredActivator` |
| P | The Skullspore Nexus | `expr:TriggerObjectsCards$CardPower` |
| I | Lim-Dûl's Vault | `param:StoreSVar.UnlessAI`, `param:Dig.NoLooking` |
| I | Will of the Abzan | `param:RepeatEach.RepeatTargeted` |
| P | Auntie Ool, Cursewretch | `construction:Ward` |
| P | The Book of Exalted Deeds | `param:Animate.Replacements` |
| P | Summon: Esper Valigarmanda | `param:Play.ManaConversion` |
| I | Winding Constrictor | `param:AddCounter.ValidPlayer` |
| P | Rith, Liberated Primeval | `expr:Count$NumDamageThisTurn` |
| I | Norn's Annex | `construction:CantAttackUnless` |
| P | Oath of Teferi | `stat:NumLoyaltyAct`, `param:NumLoyaltyAct.ValidCard`, `param:NumLoyaltyAct.Twice` |
| P | Generous Patron | `trig:CounterPlayerAddedAll`, `param:CounterPlayerAddedAll.ValidObject`, `param:CounterPlayerAddedAll.ValidSource` |
| I | Mass of Mysteries | `kwval:myriad` |
| P | Tyvar, Jubilant Brawler | `stat:ActivateAbilityAsIfHaste`, `param:ActivateAbilityAsIfHaste.ValidCard` |
| P | Imposter Mech | `param:Clone.RemoveCardTypes`, `param:Clone.RemoveSubTypes` |
| P | Dihada, Binder of Wills | `param:Dig.RememberRevealed` |
| P | Vexing Puzzlebox | `trig:RolledDieOnce`, `param:RolledDieOnce.ValidPlayer`, `expr:TriggerCount$Result` |
| P | Sting, the Glinting Dagger | `filtre:blockingValid Goblin`, `filtre:blockingValid Orc`, `filtre:blockingValid Creature.EquippedBy` |
| I | Archfiend of Depravity | `param:ChooseCard.MinAmount` |
| P | Kaalia, Zenith Seeker | `param:DigMultiple.SourceZone`, `param:DigMultiple.LibraryPosition` |
| P | Agatha's Soul Cauldron | `stat:ManaConvert`, `param:ManaConvert.ValidPlayer`, `param:ManaConvert.ValidCard`, `param:ManaConvert.ValidSA` … |
| P | Arcane Lighthouse | `param:AnimateAll.CantHaveKeyword` |
| I | Grab the Prize | `expr:Discarded$Valid` |
| P | Kogla and Yidaro | `defini:DiscardedCards` |
| P | Dinosaurs on a Spaceship | `trig:CounterRemoved`, `param:CounterRemoved.ValidCard`, `param:CounterRemoved.CounterType` |
| P | Welcome to . . . | `construction:Chapter` |
| P | Jade Orb of Dragonkind | `construction:Mana` |
| I | Henzie "Toolbox" Torre | `construction:Continuous`, `construction:ReduceCost` |
| P | Unbound Flourishing | `api:ChangeX`, `param:ChangeX.Value`, `param:SpellCast.HasXManaCost`, `trig:SpellAbilityCast` … |
| I | Jinnie Fay, Jetmir's Second | `construction:CreateToken` |
| I | Rikku, Resourceful Guardian | `trig:CounterPlayerAddedAll`, `param:CounterPlayerAddedAll.ValidObject`, `param:CounterPlayerAddedAll.ValidSource`, `defini:TriggeredObjectLKICopy` |
| I | Jadar, Ghoulcaller of Nephalia | `filtre:withDecayed` |
| P | Everlasting Torment | `stat:WitherDamage` |
| P | Sinister Gnarlbark | `api:Blight`, `param:Blight.Num` |
| P | Strong, the Brutish Thespian | `stat:GainLifeRadiation`, `param:GainLifeRadiation.ValidPlayer` |
| I | Nightkin Ambusher | `param:CantBlockBy.ValidDefender`, `filtre:Condition Counters.RAD` |
| I | Reunion of the House | `param:ChangeZone.MaxTotalTargetPower` |
| P | Deeproot Pilgrimage | `trig:TapAll` |
| I | New Blood | `api:ChangeText`, `param:ChangeText.ChangeTypeWord`, `param:ChangeText.Duration` |
| I | Jin Sakai, Ghost of Tsushima | `filtre:NotDefinedTriggeredAttackers` |
| I | Mardu Siegebreaker | `construction:Attacks` |
| P | Crucible of the Spirit Dragon | `construction:Mana` |
| P | Rammas Echor, Ancient Shield | `kwval:exalted` |
| I | Sozin's Comet | `kwval:firebending:5` |
| P | Gollum, Obsessed Stalker | `param:Effect.Unique`, `defini:Opponent.HasCardsInCommand_Effect.namedDamaged` |
| P | Thousand-Year Storm | `expr:TriggerObjectsCurrentCastSpells$Valid` |
| P | Mycosynth Lattice | `stat:ManaConvert`, `param:ManaConvert.ManaConversion` |
| P | Trailtracker Scout | `trig:ManaExpend`, `param:ManaExpend.Amount`, `param:ManaExpend.Player` |
| P | Squandered Resources | `construction:ManaReflected` |
| I | Chaos Dragon | `param:RollDice.RememberHighestPlayer`, `defini:Player.Opponent+IsRemembered` |
| P | Summon: Magus Sisters | `param:Charm.Random` |
| I | Champion of the Path | `cout:BeholdExile` |
| P | Comet, Stellar Pup | `construction:RollDice` |
| I | Mirri, Weatherlight Duelist | `stat:BlockRestrict`, `param:BlockRestrict.MaxBlockers`, `param:BlockRestrict.ValidDefender`, `stat:AttackRestrict` … |
| I | Angel of Jubilation | `stat:CantPayLife`, `param:CantPayLife.ValidPlayer`, `param:CantPayLife.ValidCause`, `param:CantPayLife.ForCost` … |
| I | Quicksilver Elemental | `param:Continuous.GainsAbilitiesOfDefined`, `param:Effect.RememberLKI`, `stat:ManaConvert`, `param:ManaConvert.ValidPlayer` … |
| P | Gluntch, the Bestower | `param:ChoosePlayer.RememberChosen`, `param:PutCounter.Chooser`, `param:PutCounter.Placer` |
| P | Katara, Water Tribe's Hope | `param:AnimateAll.XMin` |
| I | Haunting Voyage | `expr:Count$Foretold` |
| I | Zurgo, Thunder's Decree | `param:Continuous.Phases` |
| I | Benthic Anomaly | `param:CopyPermanent.RemoveSubTypes` |
| I | Final Fortune | `param:AddTurn.ExtraTurnDelayedTrigger`, `param:AddTurn.ExtraTurnDelayedTriggerExecute` |
| I | Grafdigger's Cage | `param:Moved.Prevent`, `param:Moved.Layer` |
| I | Twinning Staff | `repl:CopySpell`, `param:CopySpell.ActiveZones`, `param:CopySpell.ValidPlayer`, `param:CopySpell.ValidSpell` … |
| P | Tyvar the Bellicose | `construction:Continuous` |
| P | Zuko, Firebending Master | `param:SpellCast.Phase`, `construction:Firebending` |
| I | Lifestream's Blessing | `expr:Count$LastStateBattlefieldWithFallback` |
| I | Illusionist's Gambit | `param:RemoveFromCombat.OpponentTurn`, `param:RemoveFromCombat.RememberRemovedFromCombat` |
| I | Notorious Throng | `expr:Count$BloodthirstAmount`, `kw:Prowl` |
| P | Vault 12: The Necropolis | `expr:PlayerCountPlayers$Counters` |
| P | Sigurd, Jarl of Ravensthorpe | `param:AddOrRemoveCounter.Boast` |
| P | Wastescape Battlemage | `filtre:kicked 1`, `filtre:kicked 2`, `construction:Kicker` |
| P | Danny Pink | `construction:Continuous` |
| P | Summons of Saruman | `construction:Flashback` |
| P | Sidisi, Undead Vizier | `trig:Exploited`, `param:Exploited.ValidCard`, `param:Exploited.ValidSource`, `kw:Exploit` |
| P | Food Chain | `expr:Exiled$CardManaCost` |
| P | The Cruelty of Gix | `kw:Read ahead` |
| I | Sauron's Ransom | `defini:Top_4_OfLibrary` |
| P | Brazen Dwarf | `trig:RolledDieOnce`, `param:RolledDieOnce.ValidPlayer` |
| P | Y'shtola Rhul | `expr:Count$FinishedEndOfTurnsThisTurn` |
| I | Marisi, Breaker of the Coil | `param:CantBeCast.Phases` |
| P | Goldberry, River-Daughter | `param:MoveCounter.RememberPut`, `param:MoveCounter.NonZero` |
| P | Wandertale Mentor | `trig:ManaExpend`, `param:ManaExpend.Amount`, `param:ManaExpend.Player` |
| P | The Legend of Yangchen | `param:ChooseCard.MinAmount` |
| P | Wedding Ring | `filtre:controlsArtifact.namedWedding Ring` |
| P | Arwen, Mortal Queen | `param:Pump.CounterNum`, `param:PutCounter.CounterTypes` |
| P | Estrid's Invocation | `param:Clone.AddTriggers` |
| P | Auron, Venerated Guardian | `param:PutCounter.RememberAmount`, `defini:Spawner>TriggeredDefendingPlayer`, `param:ImmediateTrigger.TriggerAmount` |
| P | Halo Fountain | `cout:untapYType` |
| P | Atraxa, Grand Unifier | `param:RepeatEach.RepeatTypesFrom` |
| P | Doc Aurlock, Grizzled Genius | `construction:ReduceCost` |
| P | Ojer Kaslem, Deepest Growth | `param:DigMultiple.SourceZone` |
| P | Luck Bobblehead | `param:RollDice.MaxRollsResults`, `expr:SVar$EvenResults` |
| P | Avenger of the Fallen | `construction:Mobilize` |
| P | Martial Impetus | `filtre:attacking Opponent` |
| P | Biomancer's Familiar | `stat:CanAdapt`, `param:CanAdapt.ValidCard`, `trig:Adapt`, `param:Adapt.ValidCard` … |
| I | Hordewing Skaab | `expr:TriggeredPlayersTargets$Amount` |
| I | V.A.T.S. | `param:Destroy.TargetsWithEqualToughness` |
| P | Iron Mastiff | `expr:PlayerCountOpponents$HasPropertyDefending`, `param:RollDice.UseHighestRoll` |
| P | The Grey Havens | `construction:ManaReflected` |
| I | Attempted Murder | `expr:SVar$EvenResults` |
| P | Ob Nixilis, Captive Kingpin | `param:LifeLostAll.ValidAmountEach` |
| P | Oft-Nabbed Goat | `param:Draw.Activator`, `defini:NonTriggeredCardOwner` |
| P | Jeweled Amulet | `param:PutCounter.RememberCostMana`, `construction:Mana` |
| P | Deadpool, Trading Card | `api:ExchangeTextBox` |
| P | Kess, Dissident Mage | `param:Continuous.ReplaceGraveyard` |
| P | Lathiel, the Bounteous Dawn | `param:PutCounter.DividedUpTo` |
| P | Test of Endurance | `param:Phase.LifeTotal`, `param:Phase.LifeAmount` |
| P | Hateful Eidolon | `expr:TriggeredCard$AttachedTo` |
| P | Nicol Bolas, Dragon-God | `defini:Player.Opponent+controlsLegendary.Creature_EQ0+controlsPlaneswalker_LE0`, `param:Continuous.GainsAbilitiesOf`, `param:Continuous.GainsValidAbilities` |
| P | Azula, Cunning Usurper | `param:Continuous.MayPlayWithFlash` |
| P | Celebr-8000 | `param:RollDice.SubsForEach`, `param:RollDice.NoteDoubles` |
| P | Brudiclad, Telchor Engineer | `param:Clone.ChoiceOptional`, `param:Clone.ExcludeChosen` |
| P | Blitzball Stadium | `expr:Count$DifferentCounterKinds` |
| P | Aboleth Spawn | `trig:AbilityTriggered`, `param:AbilityTriggered.ValidDestination`, `param:AbilityTriggered.ValidMode`, `param:AbilityTriggered.ValidSource` … |
| I | Tranquil Frillback | `cout:Mana`, `param:ImmediateTrigger.Announce`, `param:ImmediateTrigger.AnnounceMax` |
| P | Historian's Boon | `trig:AbilityTriggered`, `param:AbilityTriggered.ValidMode`, `param:AbilityTriggered.ValidSource`, `param:AbilityTriggered.ValidSpellAbility` |
| P | Mobilizer Mech | `trig:BecomesCrewed`, `param:BecomesCrewed.ValidCard` |
| P | Overcharged Amalgam | `trig:Exploited`, `param:Exploited.ValidCard`, `param:Exploited.ValidSource`, `kw:Exploit` |
| P | Tectonic Giant | `param:Attacks.ValidSource` |
| I | Misleading Signpost | `api:ChangeCombatants`, `param:ChangeCombatants.Attacking` |
| P | Steward of the Harvest | `param:Continuous.GainsAbilitiesOf`, `param:Continuous.GainsAbilitiesOfZones` |
| I | Trail of Crumbs | `param:Sacrificed.Origin`, `param:Sacrificed.Destination` |
| I | Eventide's Shadow | `construction:RemoveCounter` |
| I | The Chain Veil | `stat:NumLoyaltyAct`, `param:NumLoyaltyAct.ValidCard`, `param:NumLoyaltyAct.Additional`, `expr:Count$ThisTurnActivated` |
| P | Wall of Stolen Identity | `param:Clone.AiChoiceLogic`, `param:Clone.RememberCloneOrigin` |
| P | Ajani, Nacatl Pariah | `param:Token.RememberOriginalTokens`, `param:ImmediateTrigger.TriggerAmount`, `param:ChooseCard.ChooseEach` |
| I | Fade from History | `defini:Player.controlsEnchantment,controlsArtifact` |
| I | Circuits Act | `param:RollDice.DifferentResults` |
| P | Brutal Hordechief | `param:Continuous.DeclaresBlockers` |
| P | Oscorp Industries | `construction:Mayhem` |
| P | Goblin Welder | `expr:SVar$CheckRemem` |
| I | Merfolk Cave-Diver | `trig:Explores`, `param:Explores.ValidCard` |
| I | Firion, Wild Rose Warrior | `param:CopyPermanent.AddStaticAbilities` |
| P | Myr Welder | `param:Continuous.GainsAbilitiesOf`, `param:Continuous.GainsAbilitiesOfZones` |
| P | Serra Paragon | `param:LandPlayed.ValidSA` |
| P | Felix Five-Boots | `param:Panharmonicon.ValidSource`, `param:Panharmonicon.CombatDamage`, `param:Panharmonicon.ValidTarget` |
| P | Crawlspace | `stat:AttackRestrict`, `param:AttackRestrict.MaxAttackers`, `param:AttackRestrict.ValidDefender` |
| P | Shadrix Silverquill | `param:PutCounterAll.Placer` |
| P | Sliver Gravemother | `stat:IgnoreLegendRule`, `param:IgnoreLegendRule.ValidCard`, `construction:Continuous` |
| I | Berserker's Frenzy | `param:RollDice.IgnoreLower` |
| I | Grafted Exoskeleton | `trig:Unattached`, `param:Unattached.ValidAttachment`, `param:Unattached.ValidObject`, `defini:TriggeredObjectLKICopy` |
| I | Invigorate | `cout:GainLife` |
| P | Collective Effort | `construction:Escalate` |
| I | Spirit Water Revival | `expr:Count$OptionalGenericCostPaid` |
| P | Professor Onyx | `defini:Opponent.!IsRemembered` |
| I | Wheel of Misfortune | `param:ChooseNumber.Secretly`, `param:ChooseNumber.Highest`, `param:ChooseNumber.NotLowest` |
| I | Night Shift of the Living Dead | `trig:TurnBegin`, `kw:After you roll a die, you may pay 1 life. If you do, increase or decrease the result by 1. Do this only once each turn.` |
| P | Songbirds' Blessing | `param:DigUntil.OptionalFoundMove`, `param:DigUntil.OptionalNoDestination` |
| P | Ironwill Forger | `kwval:myriad` |
| I | Grell Philosopher | `param:Continuous.GainsAbilitiesOfDefined`, `param:Continuous.ManaConversion`, `param:Effect.RememberLKI` |
| P | Carth the Lion | `construction:RaiseCost` |
| I | Glen Elendra's Answer | `param:Counter.RememberCounteredSA` |
| P | Necrotic Ooze | `param:Continuous.GainsAbilitiesOf`, `param:Continuous.GainsAbilitiesOfZones` |
| P | Tezzeret, Betrayer of Flesh | `param:Taps.ValidActivatingPlayer`, `expr:Count$ThisTurnActivated` |
| P | Sunforger | `cout:Unattach` |
| P | Echoing Deeps | `param:Clone.ChoiceZone` |
| I | Leyline Tyrant | `param:ImmediateTrigger.XColor`, `param:ImmediateTrigger.XAnnounceTitle` |
| P | Squee, Dubious Monarch | `construction:AlternativeCost` |
| P | Tawnos, the Toymaker | `param:CopySpellAbility.AddTypes` |
| P | Vastwood Hydra | `param:PutCounter.ChoiceAmount`, `param:PutCounter.MinChoiceAmount` |
| I | Sylvan Offering | `defini:.Chosen,You` |
| P | Pyreswipe Hawk | `trig:ManaExpend`, `param:ManaExpend.Amount`, `param:ManaExpend.Player` |
| I | Mog, Moogle Warrior | `param:Bookkeeping.NoteCards`, `param:Bookkeeping.NoteCardsFor`, `defini:Player.NotedForDiscard`, `param:Bookkeeping.ClearNotedCardsFor` |
| I | Bloodthirster | `construction:CantAttack` |
| P | Light-Paws, Emperor's Voice | `filtre:CanEnchantSource`, `filtre:doesNotShareNameWith Aura.YouCtrl` |
| I | Clockspinning | `construction:AddOrRemoveCounter` |
| I | Reckless Endeavor | `param:RollDice.ChosenSVar`, `param:RollDice.OtherSVar` |
| P | Oath of Nissa | `stat:ManaConvert`, `param:ManaConvert.ValidPlayer`, `param:ManaConvert.ValidCard`, `param:ManaConvert.ValidSA` … |
| P | Myr Superion | `stat:ManaRestriction`, `param:ManaRestriction.ValidSource`, `param:ManaRestriction.EffectZone` |
| I | Corrupted Shapeshifter | `param:Moved.Layer` |
| I | Faebloom Trick | `param:Token.RememberOriginalTokens`, `param:ImmediateTrigger.TriggerAmount` |
| P | Lotuslight Dancers | `filtre:EACH Card`, `filtre:Black & Card.Green & Card.Blue` |
| I | Season of Gathering | `param:PutCounter.Pawprint`, `param:PutCounter.RememberCards`, `param:GenericChoice.Pawprint`, `param:Draw.Pawprint` … |
| I | Gríma, Saruman's Footman | `param:DigUntil.ImprintRevealed` |
| P | Wall of Glare | `param:Continuous.CanBlockAny` |
| P | Qarsi Revenant | `param:PutCounter.CounterTypes` |
| I | Invoke Calamity | `param:Play.WithTotalCMC` |
| P | Blast-Furnace Hellkite | `filtre:attacking Opponent`, `kw:Offering` |
| P | The Weatherseed Treaty | `kw:Read ahead` |
| P | Mindslaver | `api:ControlPlayer` |
| I | Season of the Burrow | `param:Token.Pawprint`, `param:ChangeZone.Pawprint`, `defini:ParentTargetedController`, `param:Charm.Pawprint` |
| P | Jhoira of the Ghitu | `defini:ExiledCards`, `defini:ExiledCards.withoutSuspend`, `kwval:suspend` |
| I | Gonti, Night Minister | `param:Dig.ForceReveal`, `param:Dig.DefinedExiler` |
| I | Alexios, Deimos of Kosmos | `param:PutCounter.Placer`, `construction:CantAttack`, `stat:CantSacrifice`, `param:CantSacrifice.ValidCard` |
| P | Homeward Path | `api:GainControlVariant`, `param:GainControlVariant.AllValid`, `param:GainControlVariant.ChangeController` |
| P | Tegwyll's Scouring | `kw:MayFlashCost` |
| P | Vizier of the Menagerie | `stat:ManaConvert`, `param:ManaConvert.ValidPlayer`, `param:ManaConvert.ValidCard`, `param:ManaConvert.ValidSA` … |
| I | Coveted Jewel | `trig:AttackerUnblockedOnce`, `param:AttackerUnblockedOnce.ValidAttackingPlayer`, `param:AttackerUnblockedOnce.ValidDefenders` |
| P | The Eternal Wanderer | `construction:RepeatEach`, `stat:AttackRestrict`, `param:AttackRestrict.MaxAttackers`, `param:AttackRestrict.ValidDefender` |
| P | Watchful Radstag | `trig:Evolved`, `param:Evolved.ValidCard` |
| P | Vampire Nocturnus | `param:Continuous.TopCardOfLibraryIs` |
| I | Indulgent Tormentor | `param:Draw.UnlessAI` |
| P | Tinder Wall | `filtre:blockedBySourceLKI` |
| I | Faramir, Prince of Ithilien | `expr:PlayerCountDefinedTriggeredPlayer$HasPropertyattackedYouTheirCurrentTurn` |
| P | Mage-Ring Network | `construction:Mana` |
| P | Thousand Moons Smithy | `construction:SpellCast` |
| I | Burning Curiosity | `expr:Count$OptionalGenericCostPaid` |
| P | Phantasmal Image | `param:Clone.AddTriggers` |
| I | Bruenor Battlehammer | `expr:Count$ThisTurnActivated` |
| I | Open the Way | `param:DigUntil.XMax` |
| P | Sower of Discord | `param:DamageDoneOnce.ActiveZones`, `defini:Player.Chosen`, `param:ChoosePlayer.RememberChosen` |
| I | Aang's Journey | `filtre:EACH Land`, `filtre:Basic & Shrine` |
| P | Find // Finality | `param:PutCounter.ChoiceOptional` |
| I | March of Swirling Mist | `param:Phases.AnnounceTitle`, `param:Phases.Announce`, `construction:RaiseCost`, `param:ReduceCost.Relative` |
| P | Gogo, Master of Mimicry | `param:CopySpellAbility.CantCopy` |
| P | Mishra, Claimed by Gix | `api:Meld`, `param:Meld.Name`, `param:Meld.Tapped`, `param:Meld.Attacking` … |
| P | Mantle of the Ancients | `filtre:CanEnchantEquippedBy` |
| I | Minds Aglow | `param:ChooseNumber.ChooseAnyNumber` |
| I | Take the Bait | `param:Effect.OpponentTurn` |
| P | Mechtitan Core | `defini:ExiledCards.Other` |
| I | Endless Detour | `param:ChangeZone.AlternativeDecider`, `param:ChangeZone.DestinationAlternative`, `param:ChangeZone.LibraryPositionAlternative` |
| I | Dina's Guidance | `param:ChangeZone.DestinationAlternative` |
| I | Grave Endeavor | `param:RollDice.ChosenSVar`, `param:RollDice.OtherSVar` |
| I | Hooded Hydra | `repl:TurnFaceUp`, `param:TurnFaceUp.ReplaceWith`, `param:TurnFaceUp.ActiveZones` |
| P | Tam, Mindful First-Year | `construction:Animate` |
| I | Profane Command | `param:Charm.Announce` |
| I | Xantcha, Sleeper Agent | `param:Draw.Activator`, `defini:CardController`, `construction:CantAttack`, `param:Moved.Layer` |
| P | Psionic Ritual | `construction:Replicate` |
| I | Library of Leng | `param:Moved.Discard`, `param:Moved.EffectOnly` |
| I | Forgotten Creation | `expr:Discarded$Amount` |
| I | Baral, Chief of Compliance | `trig:Countered`, `param:Countered.ValidCause`, `param:Countered.ValidSA` |
| P | Palace Jailer | `trig:BecomeMonarch`, `param:BecomeMonarch.ValidPlayer`, `filtre:OpponentOf Remembered`, `param:BecomeMonarch.Static` |
| I | Yuna's Decision | `filtre:EACH Creature & Land` |
| P | Fall of Cair Andros | `trig:ExcessDamage`, `param:ExcessDamage.ValidTarget`, `param:ExcessDamage.CombatDamage` |
| P | SOLDIER Military Program | `param:PutCounter.ChoiceAmount`, `param:PutCounter.MinChoiceAmount` |
| P | Elspeth Resplendent | `param:PutCounter.CounterTypes`, `param:PutCounter.TypeList`, `param:Dig.WithCounters`, `param:Dig.PrimaryPrompt` |
| P | Azlask, the Swelling Scourge | `kwval:annihilator:1` |
| P | Selfless Squire | `trig:DamagePreventedOnce`, `param:DamagePreventedOnce.ValidTarget` |
| P | Ballad of the Black Flag | `param:Mill.Imprint` |
| P | Torpor Orb | `stat:DisableTriggers`, `param:DisableTriggers.ValidCause`, `param:DisableTriggers.ValidMode`, `param:DisableTriggers.Destination` |
| P | Mistbind Clique | `trig:Championed`, `param:Championed.ValidCard`, `param:Championed.ValidSource`, `kw:Champion` |
| P | Brass's Tunnel-Grinder | `filtre:descended`, `construction:SpellCast` |
| I | Archon of Coronation | `param:LifeReduced.Monarch`, `param:LifeReduced.Layer` |
| P | Curator of Sun's Creation | `trig:Discover`, `param:Discover.ValidPlayer` |
| P | Krosan Verge | `filtre:EACH Forest & Plains` |
| P | Elesh Norn, Mother of Machines | `stat:DisableTriggers`, `param:DisableTriggers.ValidCause`, `param:DisableTriggers.ValidMode`, `param:DisableTriggers.Destination` … |
| P | Cemetery Prowler | `expr:Count$TypesSharedWith` |
| I | Font of Agonies | `trig:PayLife`, `param:PayLife.ValidPlayer` |
| P | Explorer's Scope | `param:Dig.ForceRevealToController`, `param:Dig.PromptToSkipOptionalAbility`, `param:Dig.OptionalAbilityPrompt` |
| I | Craig Boone, Novac Guard | `param:PutCounter.RememberPut` |
| P | Colonel Autumn | `trig:Exploited`, `param:Exploited.ValidCard`, `param:Exploited.ValidSource`, `kw:Exploit` |
| I | Tragic Arrogance | `param:ChooseCard.ChooseEach` |
| P | Protean Hydra | `trig:CounterRemoved`, `param:CounterRemoved.ValidCard`, `param:CounterRemoved.CounterType` |
| I | The Aetherspark | `construction:CantAttack` |
| P | The Apprentice's Folly | `filtre:doesNotShareNameWith Card.token` |
| P | Aclazotz, Deepest Betrayal | `expr:PlayerCount$HasPropertyHasCardsInHand` |
| P | Fallaji Wayfarer | `construction:Continuous` |
| P | Thrumming Stone | `construction:Continuous` |
| P | Sigarda's Vanguard | `param:ChooseCard.MinAmount`, `param:ChooseCard.WithDifferentPowers` |
| P | Ratchet, Field Medic | `param:SetState.RememberChanged`, `kw:More Than Meets the Eye`, `kw:Living metal` |
| P | Enhanced Surveillance | `stat:SurveilNum`, `param:SurveilNum.Num`, `param:SurveilNum.ValidPlayer` |
| P | Ajani, the Greathearted | `param:PutCounterAll.ValidCards2`, `param:PutCounterAll.CounterType2` |
| P | Silent Arbiter | `stat:AttackRestrict`, `param:AttackRestrict.MaxAttackers`, `stat:BlockRestrict`, `param:BlockRestrict.MaxBlockers` |
| I | Thassa's Intervention | `cout:XX` |
| I | Winged Portent | `param:Draw.NonBasicSpell` |
| P | Avatar Roku, Firebender | `param:Mana.CombatMana` |
| P | Ertai Resurrected | `param:Counter.RememberForCounter` |
| I | Mana Sculpt | `param:Counter.RememberForCounter`, `expr:TriggerRemembered$CastTotalManaSpent` |
| P | Burning-Rune Demon | `param:ChangeZone.Exactly` |
| P | My Precious | `construction:Equip` |
| I | Ob Nixilis, Unshackled | `trig:SearchedLibrary`, `param:SearchedLibrary.ValidPlayer`, `param:SearchedLibrary.SearchOwnLibrary` |
| P | Hanweir Battlements | `api:Meld`, `param:Meld.Name`, `param:Meld.Primary`, `construction:Meld` |
| I | Gift of the Viper | `param:PutCounter.CounterTypes` |
| P | Pensive Professor | `kw:Increment` |
| P | Hei Bai, Forest Guardian | `param:DigUntil.OptionalFoundMove` |
| P | Sakashima of a Thousand Faces | `stat:IgnoreLegendRule`, `param:IgnoreLegendRule.ValidCard`, `param:Clone.AddStaticAbilities` |
| I | Intellectual Offering | `defini:.Chosen,You` |
| I | Alms Collector | `repl:DrawCards`, `param:DrawCards.ActiveZones`, `param:DrawCards.ValidPlayer`, `param:DrawCards.Number` … |
| P | Witch-king, Bringer of Ruin | `filtre:leastPowerControlledByTriggeredDefendingPlayer` |
| I | Orochi Soul-Reaver | `construction:DamageDoneOnce` |
| I | Soul Immolation | `param:DamageAll.Announce`, `param:DamageAll.XMax` |
| P | Neverwinter Hydra | `param:RollDice.ETB` |
| P | Aminatou, the Fateshifter | `api:ChooseDirection`, `api:GainControlVariant`, `param:GainControlVariant.AllValid`, `param:GainControlVariant.ChangeController` |
| I | Crashing Wave | `param:PutCounter.ChoiceAmount` |
| P | Fire Nation Turret | `kwval:firebending:2` |
| I | Waterbender's Restoration | `param:ChangeZone.Announce` |
| P | Rottenmouth Viper | `param:ReduceCost.Relative` |
| P | Odric, Lunarch Marshal | `param:PumpAll.SharedKeywordsZone`, `param:PumpAll.SharedRestrictions` |
| P | Narset Transcendent | `kwval:rebound` |
| P | Nethroi, Apex of Death | `trig:Mutates`, `param:Mutates.ValidCard`, `param:ChangeZone.MaxTotalTargetPower`, `kw:Mutate` |
| I | Guide of Souls | `filtre:targetedBy`, `param:PutCounterAll.CounterType2`, `param:PutCounterAll.CounterNum2` |
| P | Tivit, Seller of Secrets | `param:Continuous.AdditionalOptionalVote` |
| P | Pulmonic Sliver | `param:Continuous.AddReplacementEffect` |
| P | Shang-Chi, Master of Kung Fu | `stat:ActivateAbilityAsIfHaste`, `param:ActivateAbilityAsIfHaste.ValidCard` |
| P | Ugin's Mastery | `param:SetState.Choices` |
| P | The Elder Dragon War | `kw:Read ahead` |
| P | Generous Plunderer | `param:Token.RememberOriginalTokens`, `param:ImmediateTrigger.TriggerAmount` |
| P | Timeline Culler | `param:Continuous.ValidSA`, `construction:Warp` |
| P | Aragorn, Company Leader | `trig:CounterPlayerAddedAll`, `param:CounterPlayerAddedAll.ValidObject`, `param:CounterPlayerAddedAll.ValidSource`, `param:PutCounter.Placer` … |
| P | Cosima, God of the Voyage | `param:PutCounter.RememberAmount`, `param:Continuous.Duration` |
| I | Master of Ceremonies | `param:Bookkeeping.NoteCards`, `param:Bookkeeping.NoteCardsFor`, `param:Bookkeeping.ClearNotedCardsFor`, `param:RepeatEach.ClearRememberedBeforeLoop` |
| I | Lavinia, Azorius Renegade | `param:CantBeCast.cmcGT` |
| P | Raubahn, Bull of Ala Mhigo | `construction:Ward` |
| P | Trinisphere | `stat:SetCost`, `param:SetCost.ValidCard`, `param:SetCost.Type`, `param:SetCost.Amount` … |
| P | Wren's Run Packmaster | `kw:Champion` |
| P | Dino DNA | `param:CopyPermanent.RemoveSubTypes` |
| P | Urianger Augurelt | `construction:Effect` |
| P | Fleshwrither | `kw:Transfigure` |
| I | Champions of Minas Tirith | `param:Effect.UnlessAI` |
| I | Council's Judgment | `param:Vote.VoteSubAbility`, `param:Vote.VoteCard` |
| P | The Great Goblin | `trig:CounterPlayerAddedAll`, `param:CounterPlayerAddedAll.ValidObject`, `param:CounterPlayerAddedAll.ValidSource` |
| P | Strago and Relm | `construction:DigUntil` |
| P | Teapot Slinger | `trig:ManaExpend`, `param:ManaExpend.Amount`, `param:ManaExpend.Player` |
| P | Zenith Chronicler | `defini:NonTriggeredCardController` |
| P | Akroma, Vision of Ixidor | `filtre:withProtection`, `filtre:withPartner` |
| P | Doors of Durin | `param:Dig.RevealOptional`, `param:Dig.RememberRevealed` |
| P | Wildgrowth Walker | `trig:Explores`, `param:Explores.ValidCard` |
| I | Opportunistic Dragon | `param:Animate.HiddenKeywords` |
| I | Reject Imperfection | `expr:SpellTargeted$CardManaCostLKI` |
| P | Nelly Borca, Impulsive Accuser | `defini:TriggeredSourcesController` |
| I | Valiant Endeavor | `param:RollDice.ChosenSVar`, `param:RollDice.OtherSVar` |
| P | Gemrazer | `trig:Mutates`, `param:Mutates.ValidCard`, `kw:Mutate` |
| I | Defiler of Vigor | `param:OptionalCost.Activator`, `param:OptionalCost.ReduceColor` |
| P | Arcane Bombardment | `param:SpellCast.OrderDuplicates` |
| P | Ajani Steadfast | `param:PutCounterAll.ValidCards2`, `param:PutCounterAll.CounterType2` |
| I | Damping Sphere | `param:RaiseCost.Relative`, `param:ProduceMana.ManaAmount`, `param:ReplaceMana.ReplaceMana` |
| I | Starnheim Unleashed | `expr:Count$Foretold` |
| I | Archivist of Oghma | `trig:SearchedLibrary`, `param:SearchedLibrary.ValidPlayer`, `param:SearchedLibrary.SearchOwnLibrary` |
| P | Nowhere to Run | `stat:IgnoreHexproof`, `param:IgnoreHexproof.ValidEntity`, `stat:DisableTriggers`, `param:DisableTriggers.ValidTrigger` … |
| I | Olórin's Searing Light | `param:ChangeZoneAll.RememberLKI` |
| P | Capricopian | `param:PutCounter.Activator`, `api:ChangeCombatants`, `param:ChangeCombatants.Attacking` |
| P | Planetarium of Wan Shi Tong | `trig:TurnBegin`, `param:TurnBegin.ValidPlayer` |
| P | Wanderwine Prophets | `kw:Champion` |
| I | Territorial Hellkite | `param:ChoosePlayer.ChooseSubAbility`, `param:ChoosePlayer.CantChooseSubAbility` |
| P | Sorin Markov | `api:ControlPlayer` |
| P | Cadric, Soul Kindler | `stat:IgnoreLegendRule`, `param:IgnoreLegendRule.ValidCard` |
| P | Market Gnome | `trig:Exiled`, `param:Exiled.Origin`, `param:Exiled.WhileKeyword`, `param:Exiled.ValidCard` |
| P | Monoxa, Midway Manager | `expr:TriggerCount$Result` |
| I | Draco | `cout:UpkeepX` |
| I | Dragon's Fire | `expr:Count$OptionalGenericCostPaid`, `cout:RevealOrChoose` |
| P | Grist, the Hunger Tide | `param:Continuous.ExcludeZone` |
| P | Hall of the Bandit Lord | `construction:Mana` |
| I | Inquisitive Glimmer | `construction:ReduceCost` |
| P | Teyo, Geometric Tactician | `api:ChooseDirection`, `param:CantAttack.DefenderNotNearestToYouInChosenDirection` |
| P | Grothama, All-Devouring | `expr:TriggeredCard$TotalDamageThisTurn` |
| P | Brokkos, Apex of Forever | `param:Continuous.ValidSA`, `kw:Mutate` |
| P | Sivitri, Dragon Master | `construction:Effect` |
| P | Firkraag, Cunning Instigator | `filtre:hadToAttackThisCombat` |
| I | Everybody Lives! | `stat:CantLoseLife`, `param:CantLoseLife.ValidPlayer` |
| I | Behold the Sinister Six! | `param:ChangeZone.TargetsWithDifferentNames` |
| I | Khorvath's Fury | `api:AssignGroup`, `param:AssignGroup.Choices`, `param:RepeatEach.ClearRememberedBeforeLoop` |
| I | Orzhov Advokist | `param:ChooseCard.MinAmount`, `param:PutCounterAll.Placer` |
| I | Swift Reconfiguration | `param:Continuous.RemoveArtifactTypes` |
| I | Gilded Drake | `param:ExchangeControl.CantFizzle` |
| I | Unbury | `param:ChangeZone.TargetsWithSameCreatureType` |
| P | Cursecloth Wrappings | `kwval:embalm:cardmanacost` |
| I | Afterlife Insurance | `kwval:afterlife:1` |
| I | Dispelling Exhale | `expr:Count$OptionalGenericCostPaid` |
| I | Cemetery Gatekeeper | `filtre:sharesCardTypeWith ValidExile Card.ExiledWithSource` |
| I | Twists and Turns | `repl:Explore`, `param:Explore.ActiveZones`, `param:Explore.ValidExplorer`, `param:Explore.ReplaceWith` |
| P | Skyscribing | `param:Draw.Forecast` |
| P | Hope of Ghirapur | `filtre:wasDealtCombatDamageThisTurnBySource` |
| P | Shadow Urchin | `api:Blight`, `param:Blight.Num` |
| P | Jolly Gerbils | `trig:GiveGift`, `param:GiveGift.ValidPlayer` |
| P | Kaito, Dancing Shadow | `stat:NumLoyaltyAct`, `param:NumLoyaltyAct.ValidCard`, `param:NumLoyaltyAct.Twice` |
| I | Echoing Assault | `filtre:attacking TriggeredAttackedTarget` |
| I | The Queen of Dale | `api:Recruit` |
| I | Faerie Slumber Party | `param:ChangeZoneAll.RememberLKI` |
| I | Gustha's Scepter | `trig:ChangesController`, `param:ChangesController.ValidCard` |
| I | Teferi's Time Twist | `construction:ChangeZone` |
| P | Liliana of the Dark Realms | `param:ChangeZone.NumCards` |
| P | Custodi Lich | `trig:BecomeMonarch`, `param:BecomeMonarch.ValidPlayer` |
| P | Tale of Momo | `expr:Count$LeftBattlefieldThisTurn` |
| P | Cauldron of Souls | `kwval:persist` |
| P | Sabin, Master Monk | `param:Continuous.ValidSA` |
| I | Ghouls' Night Out | `kwval:decayed` |
| I | Volatile Stormdrake | `param:ExchangeControl.RememberExchanged` |
| P | The Ninth Doctor | `param:Untaps.Phase` |
| P | Acererak the Archlich | `expr:DungeonsCompleted$Valid` |
| I | Conspiracy Theorist | `defini:ExiledCards` |
| P | Tide Shaper | `construction:ChangesZone` |
| I | The Sackville-Bagginses | `param:Sacrificed.Origin`, `param:Sacrificed.Destination` |
| I | Fangs of Kalonia | `param:PutCounter.RememberPut`, `construction:Overload` |
| P | Havengul Lich | `param:Continuous.GainsAbilitiesOfDefined` |
| P | Tower of the Magistrate | `construction:Protection` |
| P | Saproling Symbiosis | `kw:MayFlashCost` |
| P | Fearless Liberator | `param:Token.Boast` |
| P | Deceiver of Form | `param:RepeatEach.OptionPrompt` |
| P | Zenos yae Galvus | `trig:LosesGame`, `param:LosesGame.ValidPlayer`, `repl:Transform`, `param:Transform.ValidCard` … |
| P | Shelob, Dread Weaver | `construction:PutCounter` |
| P | Osgir, the Reconstructor | `defini:Exiled` |
| P | Lightstall Inquisitor | `param:Continuous.MayPlayPlayer`, `param:RaiseCost.AffectedZone`, `param:Moved.ValidCause` |
| P | Blood Tyrant | `trig:LosesGame` |
| P | Master of the Wild Hunt | `param:TapAll.RememberTapped`, `param:DealDamage.DividerOnResolution` |
| P | Iroh, Dragon of the West | `kwval:firebending:2` |
| I | Season of Loss | `param:Sacrifice.Pawprint`, `param:Draw.Pawprint`, `param:LoseLife.Pawprint`, `param:Charm.Pawprint` |
| I | Knights of the Black Rose | `trig:BecomeMonarch`, `param:BecomeMonarch.ValidPlayer`, `param:BecomeMonarch.BeginTurn` |
| I | Nils, Discipline Enforcer | `expr:Remembered$CardCounters`, `param:CantAttackUnless.RememberingAttacker` |
| P | Wren's Run Hydra | `construction:Reinforce` |
| P | Raiding Schemes | `construction:Continuous` |
| P | Sakashima the Impostor | `param:Clone.AddAbilities` |
| P | The Phasing of Zhalfir | `kw:Read ahead`, `stat:CantPhaseIn`, `param:CantPhaseIn.ValidCard`, `filtre:phasedOutIsRemembered` |
| P | Filigree Vector | `param:PutCounterAll.ValidCards2`, `param:PutCounterAll.CounterType2` |
| P | Vorpal Sword | `param:Animate.sVars` |
| P | Ivy, Gleeful Spellthief | `param:SpellCast.IsSingleTarget`, `param:CopySpellAbility.DefinedTarget` |
| I | Abstruse Appropriation | `stat:ManaConvert`, `param:ManaConvert.ValidPlayer`, `param:ManaConvert.ValidCard`, `param:ManaConvert.ValidSA` … |
| I | Heartwood Storyteller | `defini:TriggeredCardOpponent` |
| P | Rampant Frogantua | `param:ChangeZone.AnyNumber`, `expr:PlayerCountHasLost$Amount` |
| P | Calciform Pools | `construction:Mana` |
| P | Incarnation Technique | `kw:Demonstrate` |
| P | Nylea, Keen-Eyed | `param:Dig.DestZone2Optional` |
| I | Avalanche of Sector 7 | `param:AbilityCast.ValidSAonCard` |
| P | The Trickster-God's Heist | `param:ExchangeControl.TargetsWithSameCardType` |
| P | Case of the Ransacked Lab | `filtre:IsSolved` |
| P | Keranos, God of Storms | `param:Drawn.ForReveal` |
| P | Altar of the Pantheon | `stat:Devotion`, `param:Devotion.ValidPlayer` |
| P | Muerra, Trash Tactician | `trig:ManaExpend`, `param:ManaExpend.Amount`, `param:ManaExpend.Player` |
| P | Storm of Saruman | `param:CopySpellAbility.NonLegendary` |
| P | Tyrant of Discord | `param:Sacrifice.Random` |
| P | Mighty Servant of Leuk-o | `trig:BecomesCrewed`, `param:BecomesCrewed.ValidCard`, `param:BecomesCrewed.FirstTimeCrewed`, `param:BecomesCrewed.ValidCrewAmount` |
| P | Furious Rise | `param:Effect.ImprintOnHost` |
| P | Dreadship Reef | `construction:Mana` |
| P | Fblthp, Lost on the Range | `stat:PlotZone`, `param:PlotZone.ValidCard` |
| P | Judith, Carnage Connoisseur | `construction:SpellCast` |
| P | Machine God's Effigy | `param:Clone.AddAbilities`, `param:Clone.RemoveCardTypes` |
| P | Ephara, God of the Polis | `expr:Count$LastTurnEntered` |
| P | The Death of Gwen Stacy | `param:Bookkeeping.NoteCards`, `param:Bookkeeping.NoteCardsFor`, `defini:Player.NotedForDiscard`, `param:Bookkeeping.ClearNotedCardsFor` |
| P | Lullmage Mentor | `trig:Countered`, `param:Countered.ValidCause`, `param:Countered.ValidSA` |
| P | Ancient Adamantoise | `stat:NoCleanupDamage`, `param:NoCleanupDamage.ValidCard` |
| P | Feral Hydra | `param:PutCounter.Activator` |
| I | Delay | `kwval:suspend` |
| P | Ravenloft Adventurer | `expr:TriggeredDefendingPlayer$ValidExile` |
| I | From the Catacombs | `param:ChangeZone.LeaveBattlefield` |
| P | Detection Tower | `stat:IgnoreHexproof`, `param:IgnoreHexproof.Activator`, `param:IgnoreHexproof.ValidEntity` |
| P | Aradesh, the Founder | `filtre:enlistedThisCombat`, `expr:TriggeredAttacker$CardPower`, `kw:Enlist` |
| P | Callidus Assassin | `param:Clone.AddTriggers` |
| I | Archive Trap | `expr:Count$SearchedLibrary` |
| P | "Lifetime" Pass Holder | `api:OpenAttraction`, `param:RolledDie.RolledToVisitAttractions` |
| P | Critical Hit | `param:RolledDie.Natural` |
| P | Doubling Cube | `construction:Mana` |
| I | Sawtusk Demolisher | `trig:Mutates`, `param:Mutates.ValidCard`, `kw:Mutate` |
| P | Crystalline Giant | `param:PutCounter.UniqueType`, `param:PutCounter.RandomType` |
| P | Setzer, Wandering Gambler | `trig:FlippedCoin`, `param:FlippedCoin.ValidPlayer`, `param:FlippedCoin.ValidResult` |
| I | Multiversal Passage | `param:ChooseType.ETB` |
| P | Mindlink Mech | `trig:BecomesCrewed`, `param:BecomesCrewed.ValidCard`, `param:BecomesCrewed.FirstTimeCrewed`, `filtre:TriggeredCrew` |
| P | The Millennium Calendar | `trig:UntapAll`, `param:UntapAll.ValidPlayer`, `param:UntapAll.Phase` |
| I | Power Sink | `param:TapAll.TapperController`, `api:DrainMana` |
| P | Kill Switch | `construction:TapAll` |
| P | Fell Stinger | `trig:Exploited`, `param:Exploited.ValidCard`, `param:Exploited.ValidSource`, `kw:Exploit` |
| P | Grub, Storied Matriarch | `defini:CounterPutCards` |
| P | Hidetsugu Consumes All | `filtre:wasDealtDamageThisTurnBySource GE10` |
| I | Last Chance | `param:AddTurn.ExtraTurnDelayedTrigger`, `param:AddTurn.ExtraTurnDelayedTriggerExecute` |
| P | Sokrates, Athenian Teacher | `param:Animate.Replacements` |
| I | Herald of Leshrac | `api:GainControlVariant`, `param:GainControlVariant.AllValid`, `param:GainControlVariant.ChangeController`, `construction:Cumulative upkeep` |
| I | Tangle Wire | `param:Tap.Tapper` |
| P | Cryptic Gateway | `filtre:sharesCreatureTypeWithAll Tapped` |
| I | Autumn's Veil | `param:Counter.ValidCause` |
| I | Shredder, Shadow Master | `param:CopyPermanent.ImprintTokens`, `defini:ImprintedLKI` |
| P | Deadbeat Attendant | `api:OpenAttraction` |
| I | Tamiyo, Collector of Tales | `stat:CantDiscard`, `param:CantDiscard.ValidPlayer`, `param:CantDiscard.ValidCause`, `param:CantDiscard.ForCost` … |
| P | Aligned Hedron Network | `param:ChangeZoneAll.Duration` |
| P | Greater Gargadon | `construction:RemoveCounter` |
| P | Bog Witch | `construction:Mana` |
| P | Eivor, Wolf-Kissed | `filtre:EACH Saga`, `filtre:IsRemembered & Land.YouOwn` |
| P | Interface Ace | `stat:TapPowerValue`, `param:TapPowerValue.ValidSA`, `param:TapPowerValue.ValidCard`, `param:TapPowerValue.Value` |
| I | Roar of Resistance | `filtre:attacking Opponent`, `filtre:attacking Valid Planeswalker.OppCtrl` |
| P | Hall of Echoes | `stat:IgnoreLegendRule`, `param:IgnoreLegendRule.ValidCard` |
| P | Dynaheir, Invoker Adept | `param:AbilityCast.OneOff`, `stat:ActivateAbilityAsIfHaste`, `param:ActivateAbilityAsIfHaste.ValidCard` |
| I | Tinybones, Trinket Thief | `defini:Player.Opponent+HasCardsInHand_Card_EQ0`, `expr:PlayerCountOpponents$CardsDiscardedThisTurn` |
| P | Valki, God of Lies | `param:Clone.ChoiceZone`, `param:RevealHand.ImprintRevealed` |
| I | Curious Herd | `param:TargetOnly.Choices` |
| P | Genesis of the Daleks | `api:VillainousChoice`, `param:VillainousChoice.Choices` |
| I | Sin Prodder | `param:GenericChoice.ChoicePrompt` |
| P | Complaints Clerk | `api:OpenAttraction` |
| P | Hotshot Mechanic | `stat:TapPowerValue`, `param:TapPowerValue.ValidSA`, `param:TapPowerValue.ValidCard`, `param:TapPowerValue.Value` |
| I | Sycorax Commander | `api:VillainousChoice`, `param:VillainousChoice.Choices` |
| P | Moonshadow | `param:ChangesZoneAll.NoResolvingCheck` |
| I | Darksteel Angel | `stat:CantPutCounter`, `param:CantPutCounter.ValidCard`, `param:CantPutCounter.CounterType` |
| I | Celestial Reunion | `cout:ChooseCreatureType` |
| P | Vault 11: Voter's Dilemma | `param:Vote.VoteCard`, `param:Vote.UpTo`, `param:Vote.VoteSubAbility` |
| P | Investigator's Journal | `expr:PlayerCountPlayers$HighestValid` |
| I | Batwing Brume | `param:Fog.ConditionManaSpent`, `expr:PlayerCountRemembered$Valid`, `param:LoseLife.ConditionManaSpent` |
| P | Dreamtail Heron | `trig:Mutates`, `param:Mutates.ValidCard`, `kw:Mutate` |
| P | Sea-Dasher Octopus | `kw:Mutate` |
| P | Otrimi, the Ever-Playful | `filtre:withMutate`, `kw:Mutate` |
| I | Breakthrough | `expr:SVar$BreakthroughY` |
| P | Xenosquirrels | `kw:After you roll a die, you may remove a +1/+1 counter from Xenosquirrels. If you do, increase or decrease the result by 1.` |
| P | Brigid, Clachan's Heart | `param:Mana.Each` |
| P | Hammerheim | `param:Debuff.AllSuffixKeywords` |
| P | Círdan the Shipwright | `param:Vote.VotePlayer`, `param:RepeatEach.AmountFromVotes` |
| P | Sarevok's Tome | `expr:Count$Initiative` |
| P | Saltcrusted Steppe | `construction:Mana` |
| P | Illithid Harvester | `param:SetState.FaceDownPower`, `param:SetState.FaceDownToughness`, `param:SetState.FaceDownSetType` |
| I | Defiler of Flesh | `param:OptionalCost.Activator`, `param:OptionalCost.ReduceColor` |
| I | Leyline of Combustion | `trig:BecomesTargetOnce`, `param:BecomesTargetOnce.ValidTarget`, `param:BecomesTargetOnce.ValidSource`, `defini:TriggeredSourceSAController` |
| P | Brass Infiniscope | `param:SpellCast.HasXManaCost` |
| I | Banishing Slash | `param:Token.ConditionPresent2` |
| P | Boneyard Lurker | `trig:Mutates`, `param:Mutates.ValidCard`, `kw:Mutate` |
| I | Thrill-Kill Disciple | `construction:Squad` |
| P | Rebbec, Architect of Ascension | `param:Continuous.KeywordDefined` |
| P | Monk Class | `construction:Class` |
| P | Ochre Jelly | `param:CopyPermanent.WithCountersType`, `param:CopyPermanent.WithCountersAmount`, `expr:TriggerRemembered$CardCounters` |
| I | Mirrormind Crown | `param:CreateToken.Layer`, `param:ReplaceToken.ValidChoices` |
| P | Namor the Sub-Mariner | `filtre:ManaCostPartialBlue`, `expr:TriggeredCard$ChromaSource` |
| P | Loot Dispute | `trig:DungeonCompleted`, `param:DungeonCompleted.ValidPlayer` |
| I | Secret of Bloodbending | `api:ControlPlayer`, `param:ControlPlayer.ConditionOptionalPaid`, `param:ControlPlayer.Combat` |
| P | Grimoire of the Dead | `param:ChangeZoneAll.StaticEffect` |
| I | Eye of Duskmantle | `filtre:surveilledThisTurn` |
| P | Long List of the Ents | `param:ChooseType.Note`, `param:ChooseType.ChooseNoted` |
| I | Spectacular Showdown | `param:PutCounter.RememberPut`, `construction:Overload` |
| P | Dirge Bat | `trig:Mutates`, `param:Mutates.ValidCard`, `kw:Mutate` |
| I | Leader, Super-Genius | `repl:Connive`, `param:Connive.ActiveZones`, `param:Connive.ValidCard`, `param:Connive.ReplaceWith` |
| I | Midnight Crusader Shuttle | `api:VillainousChoice`, `param:VillainousChoice.Choices`, `param:GainControl.Choices`, `api:ChangeCombatants` … |
| P | Agitator Ant | `param:ChooseCard.MinAmount`, `param:PutCounterAll.Placer`, `param:PutCounterAll.RememberPut` |
| P | Taigam, Master Opportunist | `kwval:suspend` |
| P | Realmbreaker, the Invasion Tree | `param:Animate.Replacements` |
| I | Double Major | `param:CopySpellAbility.NonLegendary` |
| I | Step Right Up | `api:OpenAttraction`, `param:OpenAttraction.Amount` |
| I | Mathas, Fiend Seeker | `param:ChangesZone.ExcludedDestinations` |
| P | Battle Screech | `construction:Flashback` |
| P | Stonehewer Giant | `param:ChangeZone.AttachAfter` |
| I | Everything Comes to Dust | `filtre:sharesCreatureTypeWith Convoked` |
| P | Migratory Greathorn | `trig:Mutates`, `param:Mutates.ValidCard`, `kw:Mutate` |
| P | Mindleecher | `trig:Mutates`, `param:Mutates.ValidCard`, `kw:Mutate` |
| P | Discourtesy Clerk | `api:OpenAttraction` |
| I | Collective Voyage | `param:ChooseNumber.ChooseAnyNumber` |
| P | Witness Protection | `param:Continuous.SetName` |
| P | Out of Time | `param:Phases.RememberAffected`, `param:Phases.WontPhaseInNormal`, `param:Phases.PhaseInOrOut`, `param:Effect.ForgetOnPhasedIn` |
| I | Hellish Rebuke | `defini:Caster` |
| I | Disrupting Shoal | `param:AlternativeCost.Announce` |
| I | Unwanted Remake | `param:ManifestDread.DefinedPlayer` |
| P | Mysterious Egg | `trig:Mutates`, `param:Mutates.ValidCard` |
| P | Mila, Crafty Companion | `param:Effect.sVars` |
| P | Ghost Town | `param:ChangeZone.Activator` |
| P | Auspicious Starrix | `trig:Mutates`, `param:Mutates.ValidCard`, `expr:Count$TimesMutated`, `kw:Mutate` |
| I | Master Warcraft | `param:Continuous.DeclaresAttackers`, `param:Continuous.DeclaresBlockers`, `param:Effect.ActivationFirstCombat` |
| I | Foggy Swamp Visions | `param:ChangeZone.Announce` |
| I | Mythos of Snapdax | `param:RepeatEach.ConditionManaSpent`, `param:ChooseCard.ChooseEach`, `param:ChooseCard.ConditionManaNotSpent` |
| I | The Second Doctor | `construction:Phase` |
| I | Ram Through | `param:DealDamage.ExcessDamageCondition` |
| I | Champion of the Weird | `api:Blight`, `param:Blight.Num`, `cout:BeholdExile` |
| I | Winnowing | `construction:RepeatEach` |
| P | Honest Work | `param:Continuous.SetName` |
| P | Mutable Explorer | `param:CopyPermanent.DefinedName` |
| P | Karmic Justice | `trig:Destroyed`, `param:Destroyed.ValidCauser`, `param:Destroyed.ValidCard` |
| P | Vesuvan Duplimancy | `defini:TriggeredSpellAbilityTargets`, `param:SpellCast.IsSingleTarget` |
| P | Myth Unbound | `expr:Count$CommanderCastFromCommandZone` |
| I | Noble Heritage | `construction:Continuous` |
| P | Óin the Brave | `kw:Storied` |
| I | Contractual Safeguard | `param:PutCounter.ConditionPhases`, `param:PutCounter.PutOnEachOther` |
| P | Thran Portal | `construction:RaiseCost` |
| P | Guild Summit | `param:Tap.CardChoices`, `param:Tap.AnyNumber`, `param:Tap.ChoiceAmount` |
| I | Sothera, the Supervoid | `expr:PlayerCountPlayers$LowestValid` |
| P | Chittering Harvester | `trig:Mutates`, `param:Mutates.ValidCard`, `kw:Mutate` |
| P | Magus of the Mirror | `api:ExchangeLife` |
| I | Profane Transfusion | `api:ExchangeLife`, `param:ExchangeLife.RememberDifference` |
| P | Pouncing Shoreshark | `trig:Mutates`, `param:Mutates.ValidCard`, `kw:Mutate` |
| I | Triple Triad | `construction:Phase` |
| P | Karn Liberated | `api:RestartGame`, `param:RestartGame.RestrictFromZone`, `param:RestartGame.RestrictFromValid` |
| P | Mocking Doppelganger | `param:Clone.AddStaticAbilities` |
| P | Nissa, Steward of Elements | `param:Dig.ForceRevealToController`, `param:Dig.PromptToSkipOptionalAbility`, `param:Dig.OptionalAbilityPrompt` |
| I | Pir's Whim | `api:AssignGroup`, `param:AssignGroup.Choices` |
| I | Dream Cache | `param:ChangeZone.DestinationAlternative`, `param:ChangeZone.LibraryPositionAlternative` |
| P | Karn, Scion of Urza | `param:Dig.ExileWithCounters`, `param:Dig.Choser` |
| P | The Tenth Doctor | `api:TimeTravel`, `param:TimeTravel.Amount`, `kwval:suspend` |
| I | Illusion of Choice | `param:Continuous.ControlVote` |
| I | Hithlain Rope | `stat:CantSacrifice`, `param:CantSacrifice.ValidCard` |
| P | Stronghold Arena | `construction:Kicker` |
| P | Axgard Armory | `filtre:EACH Aura & Equipment` |
| P | Overeager Apprentice | `construction:Mana` |
| I | Ultron, Unlimited | `trig:Connives`, `param:Connives.ValidCard` |
| P | Ballot Broker | `param:Continuous.AdditionalOptionalVote` |
| P | Moonsnare Prototype | `param:ChangeZone.AlternativeDecider`, `param:ChangeZone.DestinationAlternative`, `param:ChangeZone.LibraryPositionAlternative` |
| P | Battle for Bretagard | `param:CopyPermanent.WithDifferentNames` |
| I | You Cannot Pass! | `filtre:blockedValidThisTurn Creature.Legendary`, `filtre:blockedByValidThisTurn Creature.Legendary` |
| I | Expropriate | `param:Vote.EachVote` |
| I | Mob Verdict | `param:Vote.VotePlayer`, `expr:SVar$Votes`, `filtre:Remembered`, `param:RepeatEach.AmountFromVotes` |
| P | Happily Ever After | `param:Phase.LifeTotal`, `param:Phase.LifeAmount` |
| P | Raiders' Karve | `param:Dig.ForceRevealToController`, `param:Dig.PromptToSkipOptionalAbility`, `param:Dig.OptionalAbilityPrompt` |
| I | Ashes of the Abhorrent | `construction:CantBeActivated` |
| P | Brago's Representative | `param:Continuous.AdditionalVote` |
| P | Diamond Lion | `construction:Mana` |
| P | Mirror Box | `stat:IgnoreLegendRule`, `param:IgnoreLegendRule.ValidCard` |
| P | Case of the Uneaten Feast | `construction:Animate`, `filtre:IsSolved` |
| P | Glowstone Recluse | `trig:Mutates`, `param:Mutates.ValidCard`, `kw:Mutate` |
| P | Iron Monger, Sadistic Tycoon | `trig:Connives`, `param:Connives.ValidCard` |
| I | Aggressive Biomancy | `param:CopyPermanent.AddTriggers`, `param:CopyPermanent.AddSVars` |
| I | From Father to Son | `param:ChangeZone.DestinationAlternative`, `param:ChangeZone.DestAltSVar` |
| I | Guided Passage | `filtre:EACH Creature`, `filtre:YouOwn & Land.YouOwn & Card.nonCreature` |
| I | Kíli the Resourceful | `expr:Count$ThisTurnActivated`, `kw:Storied` |
| P | Calix, Guided by Fate | `param:DamageDone.ResolvedLimit` |
| I | Green Sun's Twilight | `param:DigMultiple.ChangeLater`, `param:DigMultiple.RememberChanged`, `param:DigMultiple.ImprintRest`, `param:ChangeZone.DestinationAlternative` … |
| I | Dig Up | `param:ChangeZone.NonBasicSpell` |
| P | Urza, Lord Protector | `api:Meld`, `param:Meld.Name`, `param:Meld.Primary`, `param:Meld.SecondaryType` … |
| P | Kindle the Inner Flame | `construction:Flashback` |
| P | Ghostly Dancers | `api:UnlockDoor`, `param:UnlockDoor.Mode`, `param:UnlockDoor.Choices`, `filtre:FullyUnlocked` |
| I | Dusk Mangler | `construction:AlternateAdditionalCost` |
| I | Mari, the Killing Quill | `construction:Continuous` |
| P | Souvenir Snatcher | `trig:Mutates`, `param:Mutates.ValidCard`, `kw:Mutate` |
| I | Mirror March | `param:FlipCoin.FlipUntilYouLose` |
| I | Gate to the Aether | `param:Dig.Choser` |
| I | Cybership | `param:Dig.GainControl`, `param:Dig.FaceDown`, `param:Dig.FaceDownPower`, `param:Dig.FaceDownToughness` … |
| P | Ral Zarek | `param:FlipCoin.Amount` |
| I | Luxurious Locomotive | `expr:Count$CrewSize` |
| I | Bile Blight | `filtre:Remembered` |
| I | Prisoner's Dilemma | `param:GenericChoice.Secretly`, `param:Bookkeeping.NoteCards`, `param:Bookkeeping.NoteCardsFor`, `expr:PlayerCountOpponents$HasPropertyNotedForSilence` … |
| I | Temporal Extortion | `cout:LifeTotalHalfUp`, `param:Counter.UnlessAI` |
| P | Archipelagore | `trig:Mutates`, `param:Mutates.ValidCard`, `expr:Count$TimesMutated`, `kw:Mutate` |
| I | Immortal Obligation | `construction:ChangeZone` |
| P | Kid Loki | `filtre:countersReceivedThisTurn_GE1_P1P1_You` |
| P | Invasion of Fiora | `expr:PlayerCountPropertyYou$BeenDealtCombatDamageSinceLastTurn` |
| I | Consumed by Greed | `filtre:greatestPowerControlledByTargeted` |
| P | Invasion of Amonkhet | `param:Clone.ChoiceZone`, `param:Clone.AddColors` |
| P | Unidentified Hovership | `param:ManifestDread.DefinedPlayer`, `defini:Player.HasCardsInExile_Card.ExiledWithSource_GE1` |
| P | The Irencrag | `param:Animate.Name`, `param:Animate.OptionQuestion` |
| I | Bontu's Last Reckoning | `construction:DestroyAll` |
| P | Doom's Time Platform | `kwval:suspend` |
| P | Zada, Hedron Grinder | `param:SpellCast.IsSingleTarget`, `param:CopySpellAbility.CopyForEachCanTarget` |
| P | Ruthless Radrat | `construction:Squad` |
| P | Sanctum Lurker | `api:Empower`, `param:Empower.Type`, `param:Empower.Num`, `stat:IgnorePlaneswalkerZeroLoyaltyRule` … |
| P | Spinerock Tyrant | `param:CopySpellAbility.RememberNewCard`, `kwval:wither` |
| I | Dromoka's Command | `defini:TargetedSource` |
| I | Path of the Pyromancer | `api:BlankLine`, `api:Planeswalk`, `api:ChaosEnsues` |
| P | Staff of the Storyteller | `trig:TokenCreatedOnce`, `param:TokenCreatedOnce.ValidToken` |
| P | Cavern Whisperer | `trig:Mutates`, `param:Mutates.ValidCard`, `kw:Mutate` |
| P | Dack Fayden | `defini:TriggeredSpellAbilityTargets` |
| I | Rally the Ancestors | `construction:ChangeZoneAll` |
| I | The Golden Throne | `param:GameLoss.ReplaceWith` |
| P | Sinister Concierge | `filtre:withoutSuspend`, `kwval:suspend` |
| I | Invoke Justice | `param:PutCounter.ChoiceAmount`, `param:PutCounter.MinChoiceAmount` |
| P | Tablet of the Guilds | `filtre:AnyChosenColor`, `expr:Count$HasNumChosenColors`, `param:ChooseColor.TwoColors` |
| P | Silver Scrutiny | `construction:CastWithFlash` |
| P | Even the Score | `param:ReduceCost.Color`, `expr:PlayerCountOpponents$HighestCardsDrawn` |
| P | Thranduil, the Elvenking | `param:Continuous.GainsAbilitiesOf`, `param:Continuous.GainsAbilitiesOfZones` |
| P | Asinine Antics | `kw:MayFlashCost` |
| P | Glorious Purpose | `trig:Connives`, `filtre:TriggeredCard`, `param:PutCounterAll.ValidCards2`, `param:PutCounterAll.CounterType2` … |
| I | Storyweave | `construction:Charm` |
| P | Feast of the Victorious Dead | `param:PutCounter.MinChoiceAmount`, `param:PutCounter.ChoiceAmount` |
| I | Bounty Board | `defini:Player.OpponentOf` |
| I | Hit the Mother Lode | `param:Discover.RememberDiscovered` |
| P | Feast on the Fallen | `expr:PlayerCountOpponents$LifeLostLastTurn` |
| I | Return from Extinction | `param:ChangeZone.TargetsWithSameCreatureType` |
| P | Enlightened Confidant | `param:Surveil.RememberMoved` |
| I | Surge of Salvation | `param:Effect.ExileOnLost` |
| I | Yuriko, Blade of the Mighty | `param:CantBeCast.Phases`, `param:CantBeActivated.Phases` |
| I | Pact Weapon | `construction:Equip` |
| P | Karn, Living Legacy | `param:ChooseNumber.ChooseAnyNumber`, `param:Effect.Abilities` |
| P | The Clone Saga | `param:CopySpellAbility.NonLegendary` |
| P | Taskmaster, Mercenary Mimic | `param:Clone.RemoveCardTypes`, `param:Clone.RemoveSubTypes` |
| P | Naktamun Lorespinner | `expr:PlayerCount$HasPropertyHasCardsInHand` |
| I | Season of the Bold | `param:Token.Pawprint`, `param:Dig.Pawprint`, `param:Effect.Pawprint`, `param:Charm.Pawprint` |
| I | Tamiyo, Upriser Crowned | `param:DamageDoneOnce.CheckDefinedPlayer`, `param:DamageDoneOnce.NoResolvingCheck`, `defini:TriggeredSources` |
| P | Command the Stage | `expr:PlayerCountOpponents$HasPropertywasDealtNonCombatDamageLastTurn` |
| I | Ginger, Queen of Sweets | `param:CopyPermanent.DefinedName` |
| P | Coin of Mastery | `expr:ReplacedCard$CastTotalManaSpent` |
| I | Construct a Cosmic Cube | `api:ControlPlayer` |
| I | Bard's Company | `api:Recruit` |
| P | Way of the Paradox | `api:Empower`, `param:Empower.Type`, `param:Empower.Num` |
| I | Dack Fayden, Helping Hand | `param:ChoosePlayer.RememberChosen` |
| I | Pox Plague | `expr:PlayerCountRemembered$CardsInHand`, `expr:PlayerCountRemembered$Valid` |
| P | Game Over | `expr:PlayerCountPlayers$ConditionLEY` |
| P | The Mountain-king's Return | `api:Recruit` |
| I | Jace, Multiverse Architect | `construction:Phase` |
| P | Gollum, Riddle Master | `filtre:cmcChosenEvenOdd`, `api:ChooseEvenOdd` |
| P | Kang Prime | `kwval:suspend` |
| P | Way of the Mentor | `api:Empower`, `param:Empower.Type`, `param:Empower.Num` |
| P | Danitha, Sword of Hope | `construction:SpellCast` |
| I | Chira, All In | `param:DiscardedAll.Random`, `trig:BecomesTargetOnce`, `param:BecomesTargetOnce.ValidCause`, `param:BecomesTargetOnce.Random` … |
| I | Quark, Humble Proprietor | `stat:CantSacrifice`, `param:CantSacrifice.ValidCard` |
| I | Fatehold Charm | `api:Empower`, `param:Empower.Type`, `param:Empower.Num` |
| P | Lwaxana Troi, Charming Guest | `construction:Effect` |
| P | Federation Resupply | `kw:Beam me up` |
| P | Glava, Five-Advents Mage | `trig:SpellAbilityCast`, `param:SpellAbilityCast.ValidSA`, `param:SpellAbilityCast.ValidActivatingPlayer`, `param:SpellAbilityCast.HasXManaCost` … |
| P | Thomil, the Destroyer | `param:CopyPermanent.DefinedName` |
| P | Voq, Torchbearer | `param:Clone.ChoiceZone` |
| P | Surveillance Phantasm | `expr:Count$YouScryThisTurn` |
