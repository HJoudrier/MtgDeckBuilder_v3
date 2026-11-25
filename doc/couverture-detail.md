# Détail de la couverture : toutes les cartes, et celles d'EDHREC

Mesure du 25 novembre 2026 (dépôt Forge au commit `3e1fa4ed`, moteur après le lot F107). Chaque carte est lue avec son script Forge
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
| **Toutes les cartes** | 34 482 | 30 328 (88,0 %) | 2 677 (7,8 %) | 1 477 (4,3 %) |

### Par type de carte (premier type qui s'applique)

| Type | Cartes | Complètes | Partielles | Injouables |
|---|---|---|---|---|
| Creature | 18 997 | 16 819 (88,5 %) | 1 662 (8,7 %) | 516 (2,7 %) |
| Instant | 3 829 | 3 487 (91,1 %) | 41 (1,1 %) | 301 (7,9 %) |
| Sorcery | 3 583 | 3 225 (90,0 %) | 29 (0,8 %) | 329 (9,2 %) |
| Artifact | 2 545 | 2 177 (85,5 %) | 301 (11,8 %) | 67 (2,6 %) |
| Enchantment | 3 498 | 3 008 (86,0 %) | 333 (9,5 %) | 157 (4,5 %) |
| Land | 1 200 | 1 200 (100,0 %) | 0 (0,0 %) | 0 (0,0 %) |
| Planeswalker | 337 | 325 (96,4 %) | 12 (3,6 %) | 0 (0,0 %) |
| Battle | 37 | 30 (81,1 %) | 7 (18,9 %) | 0 (0,0 %) |
| Autres (Scheme, Plane, Vanguard, Attraction, Dungeon, Conspiracy…) | 456 | 57 (12,5 %) | 292 (64,0 %) | 107 (23,5 %) |

### Par structure

| Structure | Cartes | Complètes | Partielles | Injouables |
|---|---|---|---|---|
| Une face | 33 562 | 29 545 (88,0 %) | 2 557 (7,6 %) | 1 460 (4,4 %) |
| Plusieurs faces (transformables, modales, aventures…) | 920 | 783 (85,1 %) | 120 (13,0 %) | 17 (1,8 %) |
| Légendaires | 4 638 | 3 905 (84,2 %) | 546 (11,8 %) | 187 (4,0 %) |
| Non légendaires | 29 844 | 26 423 (88,5 %) | 2 131 (7,1 %) | 1 290 (4,3 %) |

### Par longueur du script (nombre de lignes de capacités, déclencheurs, statiques, remplacements et mots-clés)

| Script | Cartes | Complètes | Partielles | Injouables |
|---|---|---|---|---|
| 0–1 ligne | 14 674 | 13 150 (89,6 %) | 826 (5,6 %) | 698 (4,8 %) |
| 2–3 lignes | 17 994 | 15 726 (87,4 %) | 1 584 (8,8 %) | 684 (3,8 %) |
| 4–6 lignes | 1 738 | 1 409 (81,1 %) | 236 (13,6 %) | 93 (5,4 %) |
| 7 lignes ou plus | 76 | 43 (56,6 %) | 31 (40,8 %) | 2 (2,6 %) |

## Sur les cartes d'EDHREC

Les cartes des pages des cent premiers commandants de l'année (`json.edhrec.com`) : 7 336 cartes distinctes (la liste de `doc/couverture-edhrec.md`).

|  | Cartes | Complètes | Partielles | Injouables |
|---|---|---|---|---|
| **Cartes d'EDHREC** | 7 336 | 6 973 (95,1 %) | 269 (3,7 %) | 94 (1,3 %) |
| Le reste du pool Forge (appariement par nom) | 27 171 | 23 380 (86,0 %) | 2 408 (8,9 %) | 1 383 (5,1 %) |

Pondérées par le nombre de decks qui les jouent (additionné sur ces cent pages, 174 459 122 places de deck) :
**98,0 %** des places de deck sont tenues par une carte complète, 1,5 % par une partielle, 0,5 % par une injouable.

### Les cartes d'EDHREC, par type

| Type | Cartes | Complètes | Partielles | Injouables |
|---|---|---|---|---|
| Creature | 3 270 | 3 013 (92,1 %) | 189 (5,8 %) | 68 (2,1 %) |
| Instant | 774 | 774 (100,0 %) | 0 (0,0 %) | 0 (0,0 %) |
| Sorcery | 790 | 790 (100,0 %) | 0 (0,0 %) | 0 (0,0 %) |
| Artifact | 770 | 733 (95,2 %) | 24 (3,1 %) | 13 (1,7 %) |
| Enchantment | 905 | 837 (92,5 %) | 55 (6,1 %) | 13 (1,4 %) |
| Land | 689 | 689 (100,0 %) | 0 (0,0 %) | 0 (0,0 %) |
| Planeswalker | 133 | 133 (100,0 %) | 0 (0,0 %) | 0 (0,0 %) |
| Battle | 5 | 4 (80,0 %) | 1 (20,0 %) | 0 (0,0 %) |

## Ce qui manque

2 673 des 4 154 cartes non complètes n'ont **qu'un seul élément** inconnu (64,3 %) ; parmi celles d'EDHREC,
220 sur 363.

### Par famille d'élément (nombre de cartes non complètes qui en portent au moins un)

| Famille | Toutes les cartes | Cartes d'EDHREC | Ce que c'est |
|---|---|---|---|
| `param` | 2 195 | 216 | un paramètre d'effet ou de statique |
| `construction` | 706 | 57 | une construction refusée |
| `trig` | 511 | 41 | un déclencheur |
| `filtre` | 463 | 34 | une propriété de filtre |
| `expr` | 431 | 36 | une quantité calculée |
| `kw` | 427 | 36 | un mot-clé |
| `api` | 306 | 16 | un effet entier |
| `defini` | 148 | 21 | une désignation |
| `kwval` | 142 | 7 | une valeur de mot-clé |
| `stat` | 115 | 14 | une statique |
| `repl` | 48 | 10 | un remplacement |
| `cout` | 41 | 6 | un morceau de coût |

### Par mécanisme (cartes non complètes dont au moins un élément relève du mécanisme)

Un même mécanisme apparaît dans plusieurs lignes de la liste ci-dessous (l'effet, ses paramètres, son déclencheur) : une carte compte
pour un seul mécanisme ici.

| Mécanisme | Toutes les cartes | Cartes d'EDHREC |
|---|---|---|
| Alchemy (MakeCard, Seek, Draft, Empower, Spellbook…) | 189 | 0 |
| Planechase (ChaosEnsues, PlaneswalkedTo, Planar Die) | 182 | 3 |
| Archenemy (SetInMotion, Scheme) | 84 | 0 |
| Un-sets et attractions (Sticker, Contraption, Attraction) | 169 | 1 |
| Mutate | 38 | 19 |
| Meld | 0 | 0 |
| Suspend (valeur de mot-clé) | 6 | 1 |
| ControlPlayer (Mindslaver) | 1 | 0 |
| Tout le reste | 3 485 | 339 |

Les cartes de l'Alchemy, de Planechase, d'Archenemy et des Un-sets ne se jouent pas dans un deck Commander classique : elles pèsent sur le total
de toutes les cartes, presque pas sur celui d'EDHREC.

### Les trente éléments qui bloquent le plus de cartes, toutes cartes confondues

| Élément | Cartes | Exemples |
|---|---|---|
| `trig:ChaosEnsues` | 158 | Academy at Tolaria West, Agyrem, Akoum |
| `construction:Continuous` | 137 | Aeve, Progenitor Ooze, Aminatou, Veil Piercer, As Foretold |
| `trig:SetInMotion` | 84 | A Display of My Dark Power, A Premonition of Your Demise, A Reckoning Approaches |
| `param:SetInMotion.ValidCard` | 84 | A Display of My Dark Power, A Premonition of Your Demise, A Reckoning Approaches |
| `trig:PlaneswalkedTo` | 62 | Agyrem, Amy's Home, Antarctic Research Base |
| `construction:ChangesZone` | 57 | Ambassador of Evendo, Antique Collector, Awakener Druid |
| `param:PlaneswalkedTo.ValidCard` | 57 | Amy's Home, Antarctic Research Base, Aretopolis |
| `kw:StickerSheet` | 48 | Ancestral Hot Dog Minotaur, Carnival Elephant Meteor, Contortionist Otter Storm |
| `trig:CrankContraption` | 45 | Accessories to Murder, Applied Aeronautics, Arms Depot |
| `param:CrankContraption.ValidCard` | 45 | Accessories to Murder, Applied Aeronautics, Arms Depot |
| `param:MakeCard.DefinedName` | 43 | Ace Flockbringer, Agent of Raffine, Bend Mortal Limits |
| `api:Draft` | 42 | Adaptive Armorer, Arms Scavenger, Big Spender |
| `param:Draft.Spellbook` | 42 | Adaptive Armorer, Arms Scavenger, Big Spender |
| `construction:Phase` | 40 | Absorbing Man, Alrund, God of the Cosmos, Arming Gala |
| `api:PutSticker` | 36 | Aerialephant, Ambassador Blorpityblorpboop, _____ _____ Rocketship |
| `kw:Mutate` | 34 | Archipelagore, Auspicious Starrix, Boneyard Lurker |
| `trig:Mutates` | 32 | Archipelagore, Auspicious Starrix, Boneyard Lurker |
| `param:Mutates.ValidCard` | 32 | Archipelagore, Auspicious Starrix, Boneyard Lurker |
| `construction:ReduceCost` | 28 | Because I Have Willed It, Boom Scholar, Brago's Favor |
| `construction:Effect` | 26 | Alluring Siren, Blood of the Martyr, Channel |
| `param:Discard.DefinedCards` | 25 | Arius, Flyby Trawler, Breathstealer's Crypt, Concealing Curtains |
| `param:PutSticker.Choices` | 24 | Aerialephant, Ambassador Blorpityblorpboop, Baaallerina |
| `kw:Banding` | 24 | Ayesha Tanaka, Benalish Hero, Benalish Infantry |
| `param:Continuous.CanBlockAmount` | 24 | Brave the Sands, Cenn's Tactician, Echo Circlet |
| `kw:Visit` | 23 | Balloon Stand, Bounce Chamber, Bumper Cars |
| `param:MakeCard.Amount` | 23 | Bone Rattler, Boneyard Aberration, Caldera Breaker |
| `api:AssembleContraption` | 22 | Aerial Toastmaster, Chipper Chopper, Cogmentor |
| `api:Intensify` | 21 | Arek, False Goldwarden, Awestruck Cygnet, Bellowsbreath Ogre |
| `kw:Starting intensity` | 21 | Arek, False Goldwarden, Awestruck Cygnet, Bellowsbreath Ogre |
| `param:AnimateAll.Zone` | 20 | Absorb Energy, Blooming Cactusfolk, Charged Conjuration |

### Les vingt éléments qui bloquent le plus de cartes d'EDHREC

| Élément | Cartes | Exemples |
|---|---|---|
| `kw:Mutate` | 18 | Nethroi, Apex of Death, Gemrazer, Brokkos, Apex of Forever |
| `trig:Mutates` | 16 | Mysterious Egg, Nethroi, Apex of Death, Gemrazer |
| `param:Mutates.ValidCard` | 16 | Mysterious Egg, Nethroi, Apex of Death, Gemrazer |
| `construction:Continuous` | 10 | As Foretold, Dracogenesis, Tyvar the Bellicose |
| `construction:Mana` | 6 | Master of Dark Rites, Titans' Nest, Jeweled Amulet |
| `construction:SpellCast` | 4 | Danitha, Sword of Hope, Thousand Moons Smithy, Judith, Carnage Connoisseur |
| `construction:ChangesZone` | 4 | Firion, Wild Rose Warrior, Tide Shaper, Q, Stacking the Deck |
| `kw:Read ahead` | 4 | The Cruelty of Gix, The Weatherseed Treaty, The Elder Dragon War |
| `api:ChangeCombatants` | 3 | Misleading Signpost, Midnight Crusader Shuttle, Capricopian |
| `param:ChangeCombatants.Attacking` | 3 | Misleading Signpost, Midnight Crusader Shuttle, Capricopian |
| `filtre:IsSolved` | 3 | Case of the Ransacked Lab, Case of the Locked Hothouse, Case of the Uneaten Feast |
| `cout:BeholdExile` | 3 | Champions of the Perfect, Champion of the Path, Champion of the Weird |
| `param:ChoosePlayer.RememberChosen` | 3 | Sower of Discord, Gluntch, the Bestower, Dack Fayden, Helping Hand |
| `param:PutCounter.RememberAmount` | 3 | Earthbender Ascension, Cosima, God of the Voyage, Auron, Venerated Guardian |
| `param:Animate.Replacements` | 3 | The Book of Exalted Deeds, Sokrates, Athenian Teacher, Realmbreaker, the Invasion Tree |
| `trig:AbilityTriggered` | 3 | Firebender Ascension, Historian's Boon, Aboleth Spawn |
| `param:AbilityTriggered.ValidMode` | 3 | Firebender Ascension, Historian's Boon, Aboleth Spawn |
| `param:AbilityTriggered.ValidSource` | 3 | Firebender Ascension, Historian's Boon, Aboleth Spawn |
| `api:VillainousChoice` | 3 | Sycorax Commander, Midnight Crusader Shuttle, Genesis of the Daleks |
| `param:VillainousChoice.Choices` | 3 | Sycorax Commander, Midnight Crusader Shuttle, Genesis of the Daleks |
