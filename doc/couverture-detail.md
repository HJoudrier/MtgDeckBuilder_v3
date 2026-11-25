# Détail de la couverture : toutes les cartes, et celles d'EDHREC

Mesure du 25 novembre 2026 (dépôt Forge au commit `3e1fa4ed`, moteur après le lot F108). Chaque carte est lue avec son script Forge
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
| **Toutes les cartes** | 34 482 | 30 474 (88,4 %) | 2 591 (7,5 %) | 1 417 (4,1 %) |

### Par type de carte (premier type qui s'applique)

| Type | Cartes | Complètes | Partielles | Injouables |
|---|---|---|---|---|
| Creature | 18 997 | 16 890 (88,9 %) | 1 610 (8,5 %) | 497 (2,6 %) |
| Instant | 3 829 | 3 493 (91,2 %) | 41 (1,1 %) | 295 (7,7 %) |
| Sorcery | 3 583 | 3 232 (90,2 %) | 29 (0,8 %) | 322 (9,0 %) |
| Artifact | 2 545 | 2 224 (87,4 %) | 272 (10,7 %) | 49 (1,9 %) |
| Enchantment | 3 498 | 3 023 (86,4 %) | 328 (9,4 %) | 147 (4,2 %) |
| Land | 1 200 | 1 200 (100,0 %) | 0 (0,0 %) | 0 (0,0 %) |
| Planeswalker | 337 | 325 (96,4 %) | 12 (3,6 %) | 0 (0,0 %) |
| Battle | 37 | 30 (81,1 %) | 7 (18,9 %) | 0 (0,0 %) |
| Autres (Scheme, Plane, Vanguard, Attraction, Dungeon, Conspiracy…) | 456 | 57 (12,5 %) | 292 (64,0 %) | 107 (23,5 %) |

### Par structure

| Structure | Cartes | Complètes | Partielles | Injouables |
|---|---|---|---|---|
| Une face | 33 562 | 29 675 (88,4 %) | 2 485 (7,4 %) | 1 402 (4,2 %) |
| Plusieurs faces (transformables, modales, aventures…) | 920 | 799 (86,8 %) | 106 (11,5 %) | 15 (1,6 %) |
| Légendaires | 4 638 | 3 947 (85,1 %) | 514 (11,1 %) | 177 (3,8 %) |
| Non légendaires | 29 844 | 26 527 (88,9 %) | 2 077 (7,0 %) | 1 240 (4,2 %) |

### Par longueur du script (nombre de lignes de capacités, déclencheurs, statiques, remplacements et mots-clés)

| Script | Cartes | Complètes | Partielles | Injouables |
|---|---|---|---|---|
| 0–1 ligne | 14 674 | 13 189 (89,9 %) | 805 (5,5 %) | 680 (4,6 %) |
| 2–3 lignes | 17 994 | 15 806 (87,8 %) | 1 537 (8,5 %) | 651 (3,6 %) |
| 4–6 lignes | 1 738 | 1 434 (82,5 %) | 220 (12,7 %) | 84 (4,8 %) |
| 7 lignes ou plus | 76 | 45 (59,2 %) | 29 (38,2 %) | 2 (2,6 %) |

## Sur les cartes d'EDHREC

Les cartes des pages des cent premiers commandants de l'année (`json.edhrec.com`) : 7 336 cartes distinctes (la liste de `doc/couverture-edhrec.md`).

|  | Cartes | Complètes | Partielles | Injouables |
|---|---|---|---|---|
| **Cartes d'EDHREC** | 7 336 | 7 026 (95,8 %) | 232 (3,2 %) | 78 (1,1 %) |
| Le reste du pool Forge (appariement par nom) | 27 171 | 23 473 (86,4 %) | 2 359 (8,7 %) | 1 339 (4,9 %) |

Pondérées par le nombre de decks qui les jouent (additionné sur ces cent pages, 174 459 122 places de deck) :
**98,3 %** des places de deck sont tenues par une carte complète, 1,3 % par une partielle, 0,4 % par une injouable.

### Les cartes d'EDHREC, par type

| Type | Cartes | Complètes | Partielles | Injouables |
|---|---|---|---|---|
| Creature | 3 270 | 3 027 (92,6 %) | 178 (5,4 %) | 65 (2,0 %) |
| Instant | 774 | 774 (100,0 %) | 0 (0,0 %) | 0 (0,0 %) |
| Sorcery | 790 | 790 (100,0 %) | 0 (0,0 %) | 0 (0,0 %) |
| Artifact | 770 | 770 (100,0 %) | 0 (0,0 %) | 0 (0,0 %) |
| Enchantment | 905 | 839 (92,7 %) | 53 (5,9 %) | 13 (1,4 %) |
| Land | 689 | 689 (100,0 %) | 0 (0,0 %) | 0 (0,0 %) |
| Planeswalker | 133 | 133 (100,0 %) | 0 (0,0 %) | 0 (0,0 %) |
| Battle | 5 | 4 (80,0 %) | 1 (20,0 %) | 0 (0,0 %) |

## Ce qui manque

2 646 des 4 008 cartes non complètes n'ont **qu'un seul élément** inconnu (66,0 %) ; parmi celles d'EDHREC,
203 sur 310.

### Par famille d'élément (nombre de cartes non complètes qui en portent au moins un)

| Famille | Toutes les cartes | Cartes d'EDHREC | Ce que c'est |
|---|---|---|---|
| `param` | 2 059 | 177 | un paramètre d'effet ou de statique |
| `construction` | 716 | 53 | une construction refusée |
| `trig` | 487 | 34 | un déclencheur |
| `filtre` | 449 | 29 | une propriété de filtre |
| `expr` | 427 | 33 | une quantité calculée |
| `kw` | 412 | 35 | un mot-clé |
| `api` | 285 | 11 | un effet entier |
| `defini` | 140 | 18 | une désignation |
| `kwval` | 130 | 4 | une valeur de mot-clé |
| `stat` | 97 | 9 | une statique |
| `repl` | 47 | 9 | un remplacement |
| `cout` | 38 | 4 | un morceau de coût |

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
| Tout le reste | 3 339 | 286 |

Les cartes de l'Alchemy, de Planechase, d'Archenemy et des Un-sets ne se jouent pas dans un deck Commander classique : elles pèsent sur le total
de toutes les cartes, presque pas sur celui d'EDHREC.

### Les trente éléments qui bloquent le plus de cartes, toutes cartes confondues

| Élément | Cartes | Exemples |
|---|---|---|
| `trig:ChaosEnsues` | 158 | Academy at Tolaria West, Agyrem, Akoum |
| `construction:Continuous` | 135 | Aeve, Progenitor Ooze, Aminatou, Veil Piercer, As Foretold |
| `trig:SetInMotion` | 84 | A Display of My Dark Power, A Premonition of Your Demise, A Reckoning Approaches |
| `param:SetInMotion.ValidCard` | 84 | A Display of My Dark Power, A Premonition of Your Demise, A Reckoning Approaches |
| `trig:PlaneswalkedTo` | 62 | Agyrem, Amy's Home, Antarctic Research Base |
| `construction:ChangesZone` | 58 | Ambassador of Evendo, Antique Collector, Awakener Druid |
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
| `construction:Moved` | 27 | Abby, Merciless Soldier, Aquamorph Entity, Captive Audience |
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

### Les vingt éléments qui bloquent le plus de cartes d'EDHREC

| Élément | Cartes | Exemples |
|---|---|---|
| `kw:Mutate` | 18 | Nethroi, Apex of Death, Gemrazer, Brokkos, Apex of Forever |
| `trig:Mutates` | 16 | Mysterious Egg, Nethroi, Apex of Death, Gemrazer |
| `param:Mutates.ValidCard` | 16 | Mysterious Egg, Nethroi, Apex of Death, Gemrazer |
| `construction:Continuous` | 9 | As Foretold, Dracogenesis, Tyvar the Bellicose |
| `construction:ChangesZone` | 4 | Firion, Wild Rose Warrior, Tide Shaper, Q, Stacking the Deck |
| `kw:Read ahead` | 4 | The Cruelty of Gix, The Weatherseed Treaty, The Elder Dragon War |
| `construction:Mana` | 3 | Master of Dark Rites, Titans' Nest, Grand Architect |
| `filtre:IsSolved` | 3 | Case of the Ransacked Lab, Case of the Locked Hothouse, Case of the Uneaten Feast |
| `cout:BeholdExile` | 3 | Champions of the Perfect, Champion of the Path, Champion of the Weird |
| `param:ChoosePlayer.RememberChosen` | 3 | Sower of Discord, Gluntch, the Bestower, Dack Fayden, Helping Hand |
| `trig:AbilityTriggered` | 3 | Firebender Ascension, Historian's Boon, Aboleth Spawn |
| `param:AbilityTriggered.ValidMode` | 3 | Firebender Ascension, Historian's Boon, Aboleth Spawn |
| `param:AbilityTriggered.ValidSource` | 3 | Firebender Ascension, Historian's Boon, Aboleth Spawn |
| `construction:Animate` | 3 | Tam, Mindful First-Year, Sokrates, Athenian Teacher, Case of the Uneaten Feast |
| `param:Continuous.ValidSA` | 3 | Timeline Culler, Sabin, Master Monk, Brokkos, Apex of Forever |
| `construction:Phase` | 3 | The Second Doctor, Taskmaster, Mercenary Mimic, Triple Triad |
| `param:PutCounterAll.Placer` | 3 | Orzhov Advokist, Shadrix Silverquill, Agitator Ant |
| `trig:BecomesTargetOnce` | 3 | Professor Hojo, Leyline of Combustion, Chira, All In |
| `api:Recruit` | 3 | The Queen of Dale, Bard's Company, The Mountain-king's Return |
| `kw:Champion` | 3 | Wanderwine Prophets, Mistbind Clique, Wren's Run Packmaster |
