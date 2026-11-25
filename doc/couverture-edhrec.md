# Cartes d'EDHREC que le moteur ne joue pas encore entièrement

Mesure du 25 novembre 2026, sur 7 336 cartes distinctes : celles des pages des cent premiers commandants de
l'année chez EDHREC (`json.edhrec.com`), chacune lue avec son script Forge (dépôt cloné au commit `3e1fa4ed`) et
sa couverture calculée par le moteur lui-même (`definitionForge()`). Le poids d'une carte est le nombre de decks qui la
jouent, additionné sur ces cent pages : il classe, il ne mesure pas une part de marché.

| | au départ (lot F60) | au 18 novembre | 24 novembre, avant le lot F83 | aujourd'hui (lots F83 à F109) |
|---|---|---|---|---|
| complètes | 6063 | 6611 | 6552 | **7103** |
| partielles (une partie du texte est jouée) | 830 | 486 | 503 | 174 |
| injouables (le sort ou une contrepartie manque) | 484 | 280 | 281 | 59 |

Le banc a été reconstruit pour la mesure du 24 novembre : la liste des cartes diffère de quelques unités de celle du 18
(7 336 contre 7 379 — des commandants ont bougé dans le classement), et les cartes sont lues sans catalogue, depuis leur seul
script. Les deux mesures se comparent donc à quelques cartes près ; seule la dernière colonne se compare à l'avant-dernière
exactement : même banc, mêmes cartes, 551 cartes de plus complètes.

## Ce qui manque le plus

Les éléments que le moteur ne sait pas lire, par poids décroissant (nombre de cartes entre parenthèses).

| Élément | Cartes | Exemples |
|---|---|---|
| `param:MoveCounter.ValidDefined` | 1 | Forgotten Ancient |
| `param:AddPhase.ExtraPhaseDelayedTrigger` | 2 | Moraug, Fury of Akoum, Bumi, Unleashed |
| `param:AddPhase.ExtraPhaseDelayedTriggerExecute` | 2 | Moraug, Fury of Akoum, Bumi, Unleashed |
| `api:ExchangeLifeVariant` | 2 | Tree of Redemption, Tree of Perdition |
| `param:ExchangeLifeVariant.Mode` | 2 | Tree of Redemption, Tree of Perdition |
| `construction:Continuous` | 5 | Tyvar the Bellicose, Danny Pink, Sliver Gravemother |
| `kw:Mutate` | 18 | Nethroi, Apex of Death, Gemrazer, Brokkos, Apex of Forever |
| `defini:ReplacedNewCard.Creature` | 1 | Spark Double |
| `defini:ReplacedNewCard.Planeswalker` | 1 | Spark Double |
| `cout:BeholdExile` | 3 | Champions of the Perfect, Champion of the Path, Champion of the Weird |
| `param:ReduceCost.IgnoreGeneric` | 1 | Morophon, the Boundless |
| `expr:Count$CardNumAttacksThisTurn` | 1 | Moraug, Fury of Akoum |
| `param:Continuous.ManaConversion` | 2 | Drana and Linvala, Grell Philosopher |
| `trig:Mutates` | 16 | Nethroi, Apex of Death, Gemrazer, Sawtusk Demolisher |
| `param:Mutates.ValidCard` | 16 | Nethroi, Apex of Death, Gemrazer, Sawtusk Demolisher |
| `param:Continuous.TopCardOfLibraryIs` | 2 | Conspicuous Snoop, Vampire Nocturnus |
| `param:ChangeZone.ChoiceZone` | 1 | Broodcaller Scourge |
| `param:ChangeZone.Amount` | 1 | Broodcaller Scourge |
| `construction:TapsForMana` | 1 | Treasure Nabber |
| `construction:Mana` | 1 | Master of Dark Rites |
| `kwval:myriad` | 2 | Mass of Mysteries, Ironwill Forger |
| `construction:ETBReplacement` | 1 | Serra's Emissary |
| `trig:AbilityResolves` | 2 | Narci, Fable Singer, Tom Bombadil |
| `param:AbilityResolves.ValidSource` | 2 | Narci, Fable Singer, Tom Bombadil |
| `param:AbilityResolves.ValidSpellAbility` | 2 | Narci, Fable Singer, Tom Bombadil |
| `stat:CantBlockUnless` | 1 | Archangel of Tithes |
| `param:CantBlockUnless.ValidCard` | 1 | Archangel of Tithes |
| `param:Continuous.ControlOpponentsSearchingLibrary` | 1 | Opposition Agent |
| `param:Moved.FoundSearchingLibrary` | 1 | Opposition Agent |
| `param:Effect.RememberLKI` | 2 | Quicksilver Elemental, Grell Philosopher |
| `param:ChangesZone.NotThisAbility` | 1 | Kodama of the East Tree |
| `param:ChoosePlayer.RememberChosen` | 3 | Gluntch, the Bestower, Sower of Discord, Dack Fayden, Helping Hand |
| `expr:PlayerCountDefinedTriggeredAttackedTarget$HasPropertylifeGTX` | 1 | Breena, the Demagogue |
| `param:AttackerUnblocked.ValidDefender` | 1 | Master of Cruelties |
| `kw:CARDNAME can only attack alone.` | 1 | Master of Cruelties |
| `expr:TriggeredTarget$Valid` | 1 | Battle Angels of Tyr |
| `param:Manifest.Choices` | 1 | Kozilek, the Broken Reality |
| `param:Manifest.ChoiceZone` | 1 | Kozilek, the Broken Reality |
| `defini:Player.attackedBySourceThisTurn` | 1 | Angel of Destiny |
| `param:Draw.Activator` | 2 | Oft-Nabbed Goat, Xantcha, Sleeper Agent |
| `filtre:TriggeredActivator` | 1 | The Lord of Pain |
| `param:Play.ManaConversion` | 1 | Summon: Esper Valigarmanda |
| `param:AddCounter.ValidPlayer` | 1 | Winding Constrictor |
| `expr:Count$NumDamageThisTurn` | 1 | Rith, Liberated Primeval |
| `kw:Champion` | 3 | Mistbind Clique, Wren's Run Packmaster, Wanderwine Prophets |
| `defini:DiscardedCards` | 1 | Kogla and Yidaro |
| `construction:CreateToken` | 1 | Jinnie Fay, Jetmir's Second |
| `construction:ReduceCost` | 2 | Doc Aurlock, Grizzled Genius, Inquisitive Glimmer |
| `filtre:withDecayed` | 1 | Jadar, Ghoulcaller of Nephalia |
| `stat:GainLifeRadiation` | 1 | Strong, the Brutish Thespian |
| `param:GainLifeRadiation.ValidPlayer` | 1 | Strong, the Brutish Thespian |
| `param:CantBlockBy.ValidDefender` | 1 | Nightkin Ambusher |
| `filtre:Condition Counters.RAD` | 1 | Nightkin Ambusher |
| `construction:Moved` | 2 | Corrupted Shapeshifter, Xantcha, Sleeper Agent |
| `param:Effect.Unique` | 1 | Gollum, Obsessed Stalker |
| `defini:Opponent.HasCardsInCommand_Effect.namedDamaged` | 1 | Gollum, Obsessed Stalker |
| `construction:ChangesZone` | 4 | Firion, Wild Rose Warrior, Tide Shaper, Sinister Concierge |
| `param:RollDice.RememberHighestPlayer` | 1 | Chaos Dragon |
| `param:Charm.Random` | 1 | Summon: Magus Sisters |
| `param:AnimateAll.XMin` | 1 | Katara, Water Tribe's Hope |
| `param:Continuous.Phases` | 1 | Zurgo, Thunder's Decree |
| `param:Continuous.ValidSA` | 3 | Timeline Culler, Brokkos, Apex of Forever, Sabin, Master Monk |
| `param:CantBeCast.Phases` | 2 | Marisi, Breaker of the Coil, Yuriko, Blade of the Mighty |
| `param:SpellCast.Phase` | 1 | Zuko, Firebending Master |
| `construction:Firebending` | 1 | Zuko, Firebending Master |
| `repl:Transform` | 2 | Sephiroth, Fabled SOLDIER, Zenos yae Galvus |
| `param:Transform.ValidCard` | 2 | Sephiroth, Fabled SOLDIER, Zenos yae Galvus |
| `param:Transform.ReplaceWith` | 2 | Sephiroth, Fabled SOLDIER, Zenos yae Galvus |
| `param:AddOrRemoveCounter.Boast` | 1 | Sigurd, Jarl of Ravensthorpe |
| `filtre:kicked 1` | 1 | Wastescape Battlemage |
| `filtre:kicked 2` | 1 | Wastescape Battlemage |
| `expr:Count$FinishedEndOfTurnsThisTurn` | 1 | Y'shtola Rhul |
| `param:MoveCounter.RememberPut` | 1 | Goldberry, River-Daughter |
| `param:MoveCounter.NonZero` | 1 | Goldberry, River-Daughter |
| `param:Pump.CounterNum` | 1 | Arwen, Mortal Queen |
| `defini:Spawner>TriggeredDefendingPlayer` | 1 | Auron, Venerated Guardian |
| `param:RepeatEach.RepeatTypesFrom` | 1 | Atraxa, Grand Unifier |
| `stat:CanAdapt` | 1 | Biomancer's Familiar |
| `param:CanAdapt.ValidCard` | 1 | Biomancer's Familiar |
| `trig:Adapt` | 1 | Biomancer's Familiar |

## Les cartes, de la plus jouée à la moins jouée

`P` : partielle, `I` : injouable. Les éléments cités sont ceux que le moteur ne sait pas lire ; une carte à
un seul élément est celle que le prochain lot rendra complète.

| | Carte | Ce qui manque |
|---|---|---|
| P | Forgotten Ancient | `param:MoveCounter.ValidDefined` |
| P | Spark Double | `defini:ReplacedNewCard.Creature`, `defini:ReplacedNewCard.Planeswalker` |
| I | Morophon, the Boundless | `param:ReduceCost.IgnoreGeneric` |
| P | Moraug, Fury of Akoum | `param:AddPhase.ExtraPhaseDelayedTrigger`, `param:AddPhase.ExtraPhaseDelayedTriggerExecute`, `expr:Count$CardNumAttacksThisTurn` |
| P | Bumi, Unleashed | `param:AddPhase.ExtraPhaseDelayedTrigger`, `param:AddPhase.ExtraPhaseDelayedTriggerExecute` |
| P | Broodcaller Scourge | `param:ChangeZone.ChoiceZone`, `param:ChangeZone.Amount` |
| P | Treasure Nabber | `construction:TapsForMana` |
| P | Master of Dark Rites | `construction:Mana` |
| P | Tree of Redemption | `api:ExchangeLifeVariant`, `param:ExchangeLifeVariant.Mode` |
| P | Serra's Emissary | `construction:ETBReplacement` |
| P | Drana and Linvala | `param:Continuous.ManaConversion` |
| P | Tree of Perdition | `api:ExchangeLifeVariant`, `param:ExchangeLifeVariant.Mode` |
| I | Champions of the Perfect | `cout:BeholdExile` |
| I | Archangel of Tithes | `stat:CantBlockUnless`, `param:CantBlockUnless.ValidCard` |
| P | Conspicuous Snoop | `param:Continuous.TopCardOfLibraryIs` |
| I | Opposition Agent | `param:Continuous.ControlOpponentsSearchingLibrary`, `param:Moved.FoundSearchingLibrary` |
| P | Kodama of the East Tree | `param:ChangesZone.NotThisAbility` |
| P | Breena, the Demagogue | `expr:PlayerCountDefinedTriggeredAttackedTarget$HasPropertylifeGTX` |
| I | Master of Cruelties | `param:AttackerUnblocked.ValidDefender`, `kw:CARDNAME can only attack alone.` |
| I | Battle Angels of Tyr | `expr:TriggeredTarget$Valid` |
| P | Kozilek, the Broken Reality | `param:Manifest.Choices`, `param:Manifest.ChoiceZone` |
| P | Angel of Destiny | `defini:Player.attackedBySourceThisTurn` |
| P | Narci, Fable Singer | `trig:AbilityResolves`, `param:AbilityResolves.ValidSource`, `param:AbilityResolves.ValidSpellAbility` |
| P | The Lord of Pain | `filtre:TriggeredActivator` |
| P | Summon: Esper Valigarmanda | `param:Play.ManaConversion` |
| I | Winding Constrictor | `param:AddCounter.ValidPlayer` |
| P | Rith, Liberated Primeval | `expr:Count$NumDamageThisTurn` |
| I | Mass of Mysteries | `kwval:myriad` |
| P | Kogla and Yidaro | `defini:DiscardedCards` |
| I | Jinnie Fay, Jetmir's Second | `construction:CreateToken` |
| I | Jadar, Ghoulcaller of Nephalia | `filtre:withDecayed` |
| P | Strong, the Brutish Thespian | `stat:GainLifeRadiation`, `param:GainLifeRadiation.ValidPlayer` |
| I | Nightkin Ambusher | `param:CantBlockBy.ValidDefender`, `filtre:Condition Counters.RAD` |
| P | Gollum, Obsessed Stalker | `param:Effect.Unique`, `defini:Opponent.HasCardsInCommand_Effect.namedDamaged` |
| I | Chaos Dragon | `param:RollDice.RememberHighestPlayer` |
| I | Champion of the Path | `cout:BeholdExile` |
| P | Summon: Magus Sisters | `param:Charm.Random` |
| P | Quicksilver Elemental | `param:Effect.RememberLKI` |
| P | Katara, Water Tribe's Hope | `param:AnimateAll.XMin` |
| P | Gluntch, the Bestower | `param:ChoosePlayer.RememberChosen` |
| I | Zurgo, Thunder's Decree | `param:Continuous.Phases` |
| P | Zuko, Firebending Master | `param:SpellCast.Phase`, `construction:Firebending` |
| P | Tyvar the Bellicose | `construction:Continuous` |
| P | Sigurd, Jarl of Ravensthorpe | `param:AddOrRemoveCounter.Boast` |
| P | Danny Pink | `construction:Continuous` |
| P | Wastescape Battlemage | `filtre:kicked 1`, `filtre:kicked 2` |
| P | Y'shtola Rhul | `expr:Count$FinishedEndOfTurnsThisTurn` |
| I | Marisi, Breaker of the Coil | `param:CantBeCast.Phases` |
| P | Goldberry, River-Daughter | `param:MoveCounter.RememberPut`, `param:MoveCounter.NonZero` |
| P | Arwen, Mortal Queen | `param:Pump.CounterNum` |
| P | Auron, Venerated Guardian | `defini:Spawner>TriggeredDefendingPlayer` |
| P | Atraxa, Grand Unifier | `param:RepeatEach.RepeatTypesFrom` |
| P | Biomancer's Familiar | `stat:CanAdapt`, `param:CanAdapt.ValidCard`, `trig:Adapt`, `param:Adapt.ValidCard` … |
| P | Avenger of the Fallen | `construction:Mobilize` |
| P | Doc Aurlock, Grizzled Genius | `construction:ReduceCost` |
| I | Hordewing Skaab | `expr:TriggeredPlayersTargets$Amount` |
| P | Oft-Nabbed Goat | `param:Draw.Activator`, `defini:NonTriggeredCardOwner` |
| P | Deadpool, Trading Card | `api:ExchangeTextBox` |
| P | Ob Nixilis, Captive Kingpin | `param:LifeLostAll.ValidAmountEach` |
| P | Kess, Dissident Mage | `param:Continuous.ReplaceGraveyard` |
| P | Azula, Cunning Usurper | `param:Continuous.MayPlayWithFlash` |
| P | Hateful Eidolon | `expr:TriggeredCard$AttachedTo` |
| P | Aboleth Spawn | `param:AbilityTriggered.ValidDestination` |
| I | Tranquil Frillback | `cout:Mana`, `param:ImmediateTrigger.Announce`, `param:ImmediateTrigger.AnnounceMax` |
| P | Tectonic Giant | `param:Attacks.ValidSource` |
| P | Sephiroth, Fabled SOLDIER | `repl:Transform`, `param:Transform.ValidCard`, `param:Transform.ReplaceWith` |
| I | Firion, Wild Rose Warrior | `construction:ChangesZone` |
| P | Felix Five-Boots | `param:Panharmonicon.ValidSource`, `param:Panharmonicon.CombatDamage`, `param:Panharmonicon.ValidTarget` |
| P | Serra Paragon | `param:LandPlayed.ValidSA` |
| P | Sliver Gravemother | `construction:Continuous` |
| P | Ironwill Forger | `kwval:myriad` |
| I | Grell Philosopher | `param:Continuous.ManaConversion`, `param:Effect.RememberLKI` |
| P | Carth the Lion | `construction:RaiseCost` |
| I | Leyline Tyrant | `param:ImmediateTrigger.XColor`, `param:ImmediateTrigger.XAnnounceTitle` |
| P | Tawnos, the Toymaker | `param:CopySpellAbility.AddTypes` |
| P | Squee, Dubious Monarch | `construction:AlternativeCost` |
| P | Light-Paws, Emperor's Voice | `filtre:CanEnchantSource`, `filtre:doesNotShareNameWith Aura.YouCtrl` |
| I | Corrupted Shapeshifter | `construction:Moved` |
| P | Wall of Glare | `param:Continuous.CanBlockAny` |
| P | Blast-Furnace Hellkite | `kw:Offering` |
| P | Jhoira of the Ghitu | `defini:ExiledCards`, `defini:ExiledCards.withoutSuspend` |
| I | Gonti, Night Minister | `param:Dig.ForceReveal`, `param:Dig.DefinedExiler` |
| P | Vampire Nocturnus | `param:Continuous.TopCardOfLibraryIs` |
| P | Tinder Wall | `filtre:blockedBySourceLKI` |
| I | Faramir, Prince of Ithilien | `expr:PlayerCountDefinedTriggeredPlayer$HasPropertyattackedYouTheirCurrentTurn` |
| P | Sower of Discord | `param:DamageDoneOnce.ActiveZones`, `param:ChoosePlayer.RememberChosen`, `filtre:NonChosenPlayer` |
| P | Gogo, Master of Mimicry | `param:CopySpellAbility.CantCopy` |
| P | Tam, Mindful First-Year | `construction:Animate` |
| I | Hooded Hydra | `repl:TurnFaceUp`, `param:TurnFaceUp.ReplaceWith`, `param:TurnFaceUp.ActiveZones` |
| I | Xantcha, Sleeper Agent | `param:Draw.Activator`, `defini:CardController`, `construction:Moved` |
| P | Palace Jailer | `param:BecomeMonarch.Static` |
| I | Forgotten Creation | `expr:Discarded$Amount` |
| P | Tom Bombadil | `trig:AbilityResolves`, `param:AbilityResolves.ValidSource`, `param:AbilityResolves.ValidSpellAbility` |
| P | Selfless Squire | `trig:DamagePreventedOnce`, `param:DamagePreventedOnce.ValidTarget` |
| P | Azlask, the Swelling Scourge | `kwval:annihilator:1` |
| P | Mistbind Clique | `trig:Championed`, `param:Championed.ValidCard`, `param:Championed.ValidSource`, `kw:Champion` |
| P | Curator of Sun's Creation | `trig:Discover`, `param:Discover.ValidPlayer` |
| I | Archon of Coronation | `param:LifeReduced.Monarch`, `param:LifeReduced.Layer` |
| P | Cemetery Prowler | `expr:Count$TypesSharedWith` |
| P | Aclazotz, Deepest Betrayal | `expr:PlayerCount$HasPropertyHasCardsInHand` |
| P | Fallaji Wayfarer | `construction:Continuous` |
| P | Sigarda's Vanguard | `param:ChooseCard.WithDifferentPowers` |
| P | Avatar Roku, Firebender | `param:Mana.CombatMana` |
| P | Burning-Rune Demon | `param:ChangeZone.Exactly` |
| P | Pensive Professor | `kw:Increment` |
| P | Witch-king, Bringer of Ruin | `filtre:leastPowerControlledByTriggeredDefendingPlayer` |
| I | Alms Collector | `repl:DrawCards`, `param:DrawCards.ActiveZones`, `param:DrawCards.ValidPlayer`, `param:DrawCards.Number` … |
| I | Orochi Soul-Reaver | `construction:DamageDoneOnce` |
| P | Neverwinter Hydra | `param:RollDice.ETB` |
| P | Odric, Lunarch Marshal | `param:PumpAll.SharedKeywordsZone`, `param:PumpAll.SharedRestrictions` |
| P | Nethroi, Apex of Death | `trig:Mutates`, `param:Mutates.ValidCard`, `kw:Mutate` |
| P | Pulmonic Sliver | `param:Continuous.AddReplacementEffect` |
| P | Tivit, Seller of Secrets | `param:Continuous.AdditionalOptionalVote` |
| P | Timeline Culler | `param:Continuous.ValidSA`, `construction:Warp` |
| P | Aragorn, Company Leader | `param:PutCounter.TriggeredCounterMap`, `param:PutCounter.CounterMapValues` |
| I | Lavinia, Azorius Renegade | `param:CantBeCast.cmcGT` |
| P | Raubahn, Bull of Ala Mhigo | `construction:Ward` |
| P | Urianger Augurelt | `construction:Effect` |
| P | Wren's Run Packmaster | `kw:Champion` |
| P | Fleshwrither | `kw:Transfigure` |
| P | Strago and Relm | `construction:DigUntil` |
| P | Akroma, Vision of Ixidor | `filtre:withProtection`, `filtre:withPartner` |
| P | Nelly Borca, Impulsive Accuser | `defini:TriggeredSourcesController` |
| I | Opportunistic Dragon | `param:Animate.HiddenKeywords` |
| P | Gemrazer | `trig:Mutates`, `param:Mutates.ValidCard`, `kw:Mutate` |
| I | Defiler of Vigor | `param:OptionalCost.Activator`, `param:OptionalCost.ReduceColor` |
| P | Wanderwine Prophets | `kw:Champion` |
| P | Capricopian | `param:PutCounter.Activator` |
| I | Territorial Hellkite | `param:ChoosePlayer.ChooseSubAbility`, `param:ChoosePlayer.CantChooseSubAbility` |
| P | Brokkos, Apex of Forever | `param:Continuous.ValidSA`, `kw:Mutate` |
| I | Inquisitive Glimmer | `construction:ReduceCost` |
| P | Grothama, All-Devouring | `expr:TriggeredCard$TotalDamageThisTurn` |
| P | Firkraag, Cunning Instigator | `filtre:hadToAttackThisCombat` |
| I | Gilded Drake | `param:ExchangeControl.CantFizzle` |
| I | Cemetery Gatekeeper | `filtre:sharesCardTypeWith ValidExile Card.ExiledWithSource` |
| P | Jolly Gerbils | `trig:GiveGift`, `param:GiveGift.ValidPlayer` |
| P | Sabin, Master Monk | `param:Continuous.ValidSA` |
| I | Volatile Stormdrake | `param:ExchangeControl.RememberExchanged` |
| I | Conspiracy Theorist | `defini:ExiledCards` |
| P | Acererak the Archlich | `expr:DungeonsCompleted$Valid` |
| P | The Ninth Doctor | `param:Untaps.Phase` |
| P | Tide Shaper | `construction:ChangesZone` |
| P | Fearless Liberator | `param:Token.Boast` |
| P | Deceiver of Form | `param:RepeatEach.OptionPrompt` |
| P | Zenos yae Galvus | `repl:Transform`, `param:Transform.ValidCard`, `param:Transform.ReplaceWith` |
| P | Shelob, Dread Weaver | `construction:PutCounter` |
| P | Osgir, the Reconstructor | `defini:Exiled` |
| P | Lightstall Inquisitor | `param:Continuous.MayPlayPlayer`, `param:RaiseCost.AffectedZone`, `param:Moved.ValidCause=LandAbility.MayPlaySource`, `filtre:MayPlaySource` |
| P | Master of the Wild Hunt | `param:TapAll.RememberTapped`, `param:DealDamage.DividerOnResolution` |
| I | Knights of the Black Rose | `param:BecomeMonarch.BeginTurn` |
| I | Nils, Discipline Enforcer | `expr:Remembered$CardCounters`, `param:CantAttackUnless.RememberingAttacker` |
| P | Wren's Run Hydra | `construction:Reinforce` |
| P | Ivy, Gleeful Spellthief | `param:CopySpellAbility.DefinedTarget` |
| I | Heartwood Storyteller | `defini:TriggeredCardOpponent` |
| P | Rampant Frogantua | `param:ChangeZone.AnyNumber`, `expr:PlayerCountHasLost$Amount` |
| I | Avalanche of Sector 7 | `param:AbilityCast.ValidSAonCard` |
| P | Keranos, God of Storms | `param:Drawn.ForReveal` |
| P | Tyrant of Discord | `param:Sacrifice.Random` |
| P | Fblthp, Lost on the Range | `stat:PlotZone`, `param:PlotZone.ValidCard` |
| P | Judith, Carnage Connoisseur | `construction:SpellCast` |
