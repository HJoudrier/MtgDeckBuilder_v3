# Détail de la couverture : toutes les cartes, et celles d'EDHREC

Mesure du 25 novembre 2026 (dépôt Forge au commit `3e1fa4ed`, moteur après le lot F109). Chaque carte est lue avec son script Forge
par `definitionForge()`, le moteur lui-même ; ce document ne compte que les cartes qui ont un script — 34 482 cartes (les jetons, eux,
ont leurs scripts à part). Trois états :

- **complète** : tout le texte de la carte est compris et joué ;
- **partielle** : une partie du texte est jouée, le reste est ignoré — la carte reste jouable, plus faible qu'imprimée, jamais plus forte ;
- **injouable** : ce qui manque est un sort, un remplacement ou une contrepartie (« you lose life », « sacrifice… ») : y jouer sans l'avoir
  lu avantagerait le deck qui la porte, le moteur ne la joue donc pas.

« Complète » dit ce que le moteur *lit* ; les lots ont chacun joué leurs cartes, mais pas les 29 000 une à une.

## Sur l'ensemble des cartes

|  | Cartes | Complètes | Partielles | Injouables |
|---|---|---|---|---|
| **Toutes les cartes** | 34 482 | 30 677 (89,0 %) | 2 445 (7,1 %) | 1 360 (3,9 %) |

### Par type de carte (premier type qui s'applique)

| Type | Cartes | Complètes | Partielles | Injouables |
|---|---|---|---|---|
| Creature | 18 997 | 16 968 (89,3 %) | 1 556 (8,2 %) | 473 (2,5 %) |
| Instant | 3 829 | 3 498 (91,4 %) | 39 (1,0 %) | 292 (7,6 %) |
| Sorcery | 3 583 | 3 244 (90,5 %) | 27 (0,8 %) | 312 (8,7 %) |
| Artifact | 2 545 | 2 232 (87,7 %) | 265 (10,4 %) | 48 (1,9 %) |
| Enchantment | 3 498 | 3 123 (89,3 %) | 247 (7,1 %) | 128 (3,7 %) |
| Land | 1 200 | 1 200 (100,0 %) | 0 (0,0 %) | 0 (0,0 %) |
| Planeswalker | 337 | 325 (96,4 %) | 12 (3,6 %) | 0 (0,0 %) |
| Battle | 37 | 30 (81,1 %) | 7 (18,9 %) | 0 (0,0 %) |
| Autres (Scheme, Plane, Vanguard, Attraction, Dungeon, Conspiracy…) | 456 | 57 (12,5 %) | 292 (64,0 %) | 107 (23,5 %) |

### Par structure

| Structure | Cartes | Complètes | Partielles | Injouables |
|---|---|---|---|---|
| Une face | 33 562 | 29 872 (89,0 %) | 2 344 (7,0 %) | 1 346 (4,0 %) |
| Plusieurs faces (transformables, modales, aventures…) | 920 | 805 (87,5 %) | 101 (11,0 %) | 14 (1,5 %) |
| Légendaires | 4 638 | 3 971 (85,6 %) | 500 (10,8 %) | 167 (3,6 %) |
| Non légendaires | 29 844 | 26 706 (89,5 %) | 1 945 (6,5 %) | 1 193 (4,0 %) |

### Par longueur du script (nombre de lignes de capacités, déclencheurs, statiques, remplacements et mots-clés)

| Script | Cartes | Complètes | Partielles | Injouables |
|---|---|---|---|---|
| 0–1 ligne | 14 674 | 13 251 (90,3 %) | 766 (5,2 %) | 657 (4,5 %) |
| 2–3 lignes | 17 994 | 15 931 (88,5 %) | 1 442 (8,0 %) | 621 (3,5 %) |
| 4–6 lignes | 1 738 | 1 450 (83,4 %) | 208 (12,0 %) | 80 (4,6 %) |
| 7 lignes ou plus | 76 | 45 (59,2 %) | 29 (38,2 %) | 2 (2,6 %) |

## Sur les cartes d'EDHREC

Les cartes des pages des cent premiers commandants de l'année (`json.edhrec.com`) : 7 336 cartes distinctes (la liste de `doc/couverture-edhrec.md`).

|  | Cartes | Complètes | Partielles | Injouables |
|---|---|---|---|---|
| **Cartes d'EDHREC** | 7 336 | 7 103 (96,8 %) | 174 (2,4 %) | 59 (0,8 %) |
| Le reste du pool Forge (appariement par nom) | 27 171 | 23 599 (86,9 %) | 2 271 (8,4 %) | 1 301 (4,8 %) |

Pondérées par le nombre de decks qui les jouent (additionné sur ces cent pages, 174 459 122 places de deck) :
**98,7 %** des places de deck sont tenues par une carte complète, 0,9 % par une partielle, 0,3 % par une injouable.

### Les cartes d'EDHREC, par type

| Type | Cartes | Complètes | Partielles | Injouables |
|---|---|---|---|---|
| Creature | 3 270 | 3 038 (92,9 %) | 173 (5,3 %) | 59 (1,8 %) |
| Instant | 774 | 774 (100,0 %) | 0 (0,0 %) | 0 (0,0 %) |
| Sorcery | 790 | 790 (100,0 %) | 0 (0,0 %) | 0 (0,0 %) |
| Artifact | 770 | 770 (100,0 %) | 0 (0,0 %) | 0 (0,0 %) |
| Enchantment | 905 | 905 (100,0 %) | 0 (0,0 %) | 0 (0,0 %) |
| Land | 689 | 689 (100,0 %) | 0 (0,0 %) | 0 (0,0 %) |
| Planeswalker | 133 | 133 (100,0 %) | 0 (0,0 %) | 0 (0,0 %) |
| Battle | 5 | 4 (80,0 %) | 1 (20,0 %) | 0 (0,0 %) |

## Ce qui manque

2 511 des 3 805 cartes non complètes n'ont **qu'un seul élément** inconnu (66,0 %) ; parmi celles d'EDHREC,
150 sur 233.

### Par famille d'élément (nombre de cartes non complètes qui en portent au moins un)

| Famille | Toutes les cartes | Cartes d'EDHREC | Ce que c'est |
|---|---|---|---|
| `param` | 1 945 | 137 | un paramètre d'effet ou de statique |
| `construction` | 676 | 39 | une construction refusée |
| `trig` | 468 | 25 | un déclencheur |
| `filtre` | 423 | 19 | une propriété de filtre |
| `expr` | 413 | 26 | une quantité calculée |
| `kw` | 391 | 29 | un mot-clé |
| `api` | 273 | 6 | un effet entier |
| `defini` | 133 | 15 | une désignation |
| `kwval` | 130 | 4 | une valeur de mot-clé |
| `stat` | 90 | 6 | une statique |
| `repl` | 40 | 5 | un remplacement |
| `cout` | 38 | 4 | un morceau de coût |

### Par mécanisme (cartes non complètes dont au moins un élément relève du mécanisme)

Un même mécanisme apparaît dans plusieurs lignes de la liste ci-dessous (l'effet, ses paramètres, son déclencheur) : une carte compte
pour un seul mécanisme ici.

| Mécanisme | Toutes les cartes | Cartes d'EDHREC |
|---|---|---|
| Alchemy (MakeCard, Seek, Draft, Empower, Spellbook…) | 189 | 0 |
| Planechase (ChaosEnsues, PlaneswalkedTo, Planar Die) | 181 | 2 |
| Archenemy (SetInMotion, Scheme) | 84 | 0 |
| Un-sets et attractions (Sticker, Contraption, Attraction) | 169 | 1 |
| Mutate | 38 | 19 |
| Meld | 0 | 0 |
| Suspend (valeur de mot-clé) | 6 | 1 |
| ControlPlayer (Mindslaver) | 1 | 0 |
| Tout le reste | 3 137 | 210 |

Les cartes de l'Alchemy, de Planechase, d'Archenemy et des Un-sets ne se jouent pas dans un deck Commander classique : elles pèsent sur le total
de toutes les cartes, presque pas sur celui d'EDHREC.

### Les trente éléments qui bloquent le plus de cartes, toutes cartes confondues

| Élément | Cartes | Exemples |
|---|---|---|
| `trig:ChaosEnsues` | 158 | Academy at Tolaria West, Agyrem, Akoum |
| `construction:Continuous` | 126 | Aeve, Progenitor Ooze, Aminatou, Veil Piercer, Ashes of the Fallen |
| `trig:SetInMotion` | 84 | A Display of My Dark Power, A Premonition of Your Demise, A Reckoning Approaches |
| `param:SetInMotion.ValidCard` | 84 | A Display of My Dark Power, A Premonition of Your Demise, A Reckoning Approaches |
| `trig:PlaneswalkedTo` | 62 | Agyrem, Amy's Home, Antarctic Research Base |
| `param:PlaneswalkedTo.ValidCard` | 57 | Amy's Home, Antarctic Research Base, Aretopolis |
| `construction:ChangesZone` | 56 | Ambassador of Evendo, Antique Collector, Awakener Druid |
| `kw:StickerSheet` | 48 | Ancestral Hot Dog Minotaur, Carnival Elephant Meteor, Contortionist Otter Storm |
| `trig:CrankContraption` | 45 | Accessories to Murder, Applied Aeronautics, Arms Depot |
| `param:CrankContraption.ValidCard` | 45 | Accessories to Murder, Applied Aeronautics, Arms Depot |
| `param:MakeCard.DefinedName` | 43 | Ace Flockbringer, Agent of Raffine, Bend Mortal Limits |
| `api:Draft` | 42 | Adaptive Armorer, Arms Scavenger, Big Spender |
| `param:Draft.Spellbook` | 42 | Adaptive Armorer, Arms Scavenger, Big Spender |
| `construction:Phase` | 39 | Absorbing Man, Alrund, God of the Cosmos, Arming Gala |
| `api:PutSticker` | 36 | Aerialephant, Ambassador Blorpityblorpboop, _____ _____ Rocketship |
| `kw:Mutate` | 34 | Archipelagore, Auspicious Starrix, Boneyard Lurker |
| `trig:Mutates` | 32 | Archipelagore, Auspicious Starrix, Boneyard Lurker |
| `param:Mutates.ValidCard` | 32 | Archipelagore, Auspicious Starrix, Boneyard Lurker |
| `construction:ReduceCost` | 28 | Because I Have Willed It, Boom Scholar, Brago's Favor |
| `construction:Moved` | 27 | Abby, Merciless Soldier, Aquamorph Entity, Captive Audience |
| `construction:Effect` | 25 | Alluring Siren, Blood of the Martyr, Channel |
| `param:Discard.DefinedCards` | 25 | Arius, Flyby Trawler, Breathstealer's Crypt, Concealing Curtains |
| `param:PutSticker.Choices` | 24 | Aerialephant, Ambassador Blorpityblorpboop, Baaallerina |
| `kw:Banding` | 24 | Ayesha Tanaka, Benalish Hero, Benalish Infantry |
| `kw:Visit` | 23 | Balloon Stand, Bounce Chamber, Bumper Cars |
| `param:MakeCard.Amount` | 23 | Bone Rattler, Boneyard Aberration, Caldera Breaker |
| `api:AssembleContraption` | 22 | Aerial Toastmaster, Chipper Chopper, Cogmentor |
| `api:Intensify` | 21 | Arek, False Goldwarden, Awestruck Cygnet, Bellowsbreath Ogre |
| `kw:Starting intensity` | 21 | Arek, False Goldwarden, Awestruck Cygnet, Bellowsbreath Ogre |
| `construction:DamageDone` | 21 | Battletide Alchemist, Crude Abattoir, Glass Asp |

### Les vingt éléments qui bloquent le plus de cartes d'EDHREC

| Élément | Cartes | Exemples |
|---|---|---|
| `kw:Mutate` | 18 | Nethroi, Apex of Death, Gemrazer, Brokkos, Apex of Forever |
| `trig:Mutates` | 16 | Mysterious Egg, Nethroi, Apex of Death, Gemrazer |
| `param:Mutates.ValidCard` | 16 | Mysterious Egg, Nethroi, Apex of Death, Gemrazer |
| `construction:Continuous` | 5 | Tyvar the Bellicose, Danny Pink, Fallaji Wayfarer |
| `construction:ChangesZone` | 4 | Firion, Wild Rose Warrior, Tide Shaper, Q, Stacking the Deck |
| `cout:BeholdExile` | 3 | Champions of the Perfect, Champion of the Path, Champion of the Weird |
| `param:ChoosePlayer.RememberChosen` | 3 | Sower of Discord, Gluntch, the Bestower, Dack Fayden, Helping Hand |
| `param:Continuous.ValidSA` | 3 | Timeline Culler, Sabin, Master Monk, Brokkos, Apex of Forever |
| `kw:Champion` | 3 | Wanderwine Prophets, Mistbind Clique, Wren's Run Packmaster |
| `param:Continuous.TopCardOfLibraryIs` | 2 | Vampire Nocturnus, Conspicuous Snoop |
| `param:Continuous.ManaConversion` | 2 | Drana and Linvala, Grell Philosopher |
| `param:Effect.RememberLKI` | 2 | Quicksilver Elemental, Grell Philosopher |
| `param:AddPhase.ExtraPhaseDelayedTrigger` | 2 | Bumi, Unleashed, Moraug, Fury of Akoum |
| `param:AddPhase.ExtraPhaseDelayedTriggerExecute` | 2 | Bumi, Unleashed, Moraug, Fury of Akoum |
| `expr:PlayerCount$HasPropertyHasCardsInHand` | 2 | Naktamun Lorespinner, Aclazotz, Deepest Betrayal |
| `construction:Animate` | 2 | Tam, Mindful First-Year, Sokrates, Athenian Teacher |
| `repl:Transform` | 2 | Zenos yae Galvus, Sephiroth, Fabled SOLDIER |
| `param:Transform.ValidCard` | 2 | Zenos yae Galvus, Sephiroth, Fabled SOLDIER |
| `param:Transform.ReplaceWith` | 2 | Zenos yae Galvus, Sephiroth, Fabled SOLDIER |
| `param:Continuous.AdditionalOptionalVote` | 2 | Ballot Broker, Tivit, Seller of Secrets |
