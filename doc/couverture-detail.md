# Détail de la couverture : toutes les cartes, et celles d'EDHREC

Mesure du 24 novembre 2026 (dépôt Forge au commit `3e1fa4ed`, moteur après le lot F103). Chaque carte est lue avec son script Forge
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
| **Toutes les cartes** | 34 482 | 30 069 (87,2 %) | 2 803 (8,1 %) | 1 610 (4,7 %) |

### Par type de carte (premier type qui s'applique)

| Type | Cartes | Complètes | Partielles | Injouables |
|---|---|---|---|---|
| Creature | 18 997 | 16 739 (88,1 %) | 1 721 (9,1 %) | 537 (2,8 %) |
| Instant | 3 829 | 3 464 (90,5 %) | 46 (1,2 %) | 319 (8,3 %) |
| Sorcery | 3 583 | 3 106 (86,7 %) | 65 (1,8 %) | 412 (11,5 %) |
| Artifact | 2 545 | 2 152 (84,6 %) | 319 (12,5 %) | 74 (2,9 %) |
| Enchantment | 3 498 | 2 996 (85,6 %) | 342 (9,8 %) | 160 (4,6 %) |
| Land | 1 200 | 1 200 (100,0 %) | 0 (0,0 %) | 0 (0,0 %) |
| Planeswalker | 337 | 325 (96,4 %) | 12 (3,6 %) | 0 (0,0 %) |
| Battle | 37 | 30 (81,1 %) | 7 (18,9 %) | 0 (0,0 %) |
| Autres (Scheme, Plane, Vanguard, Attraction, Dungeon, Conspiracy…) | 456 | 57 (12,5 %) | 291 (63,8 %) | 108 (23,7 %) |

### Par structure

| Structure | Cartes | Complètes | Partielles | Injouables |
|---|---|---|---|---|
| Une face | 33 562 | 29 294 (87,3 %) | 2 677 (8,0 %) | 1 591 (4,7 %) |
| Plusieurs faces (transformables, modales, aventures…) | 920 | 775 (84,2 %) | 126 (13,7 %) | 19 (2,1 %) |
| Légendaires | 4 638 | 3 877 (83,6 %) | 566 (12,2 %) | 195 (4,2 %) |
| Non légendaires | 29 844 | 26 192 (87,8 %) | 2 237 (7,5 %) | 1 415 (4,7 %) |

### Par longueur du script (nombre de lignes de capacités, déclencheurs, statiques, remplacements et mots-clés)

| Script | Cartes | Complètes | Partielles | Injouables |
|---|---|---|---|---|
| 0–1 ligne | 14 674 | 13 044 (88,9 %) | 850 (5,8 %) | 780 (5,3 %) |
| 2–3 lignes | 17 994 | 15 587 (86,6 %) | 1 678 (9,3 %) | 729 (4,1 %) |
| 4–6 lignes | 1 738 | 1 395 (80,3 %) | 244 (14,0 %) | 99 (5,7 %) |
| 7 lignes ou plus | 76 | 43 (56,6 %) | 31 (40,8 %) | 2 (2,6 %) |

## Sur les cartes d'EDHREC

Les cartes des pages des cent premiers commandants de l'année (`json.edhrec.com`) : 7 336 cartes distinctes (la liste de `doc/couverture-edhrec.md`).

|  | Cartes | Complètes | Partielles | Injouables |
|---|---|---|---|---|
| **Cartes d'EDHREC** | 7 336 | 6 874 (93,7 %) | 310 (4,2 %) | 152 (2,1 %) |
| Le reste du pool Forge (appariement par nom) | 27 171 | 23 219 (85,5 %) | 2 494 (9,2 %) | 1 458 (5,4 %) |

Pondérées par le nombre de decks qui les jouent (additionné sur ces cent pages, 174 459 122 places de deck) :
**97,5 %** des places de deck sont tenues par une carte complète, 1,7 % par une partielle, 0,8 % par une injouable.

### Les cartes d'EDHREC, par type

| Type | Cartes | Complètes | Partielles | Injouables |
|---|---|---|---|---|
| Creature | 3 270 | 2 994 (91,6 %) | 203 (6,2 %) | 73 (2,2 %) |
| Instant | 774 | 774 (100,0 %) | 0 (0,0 %) | 0 (0,0 %) |
| Sorcery | 790 | 726 (91,9 %) | 16 (2,0 %) | 48 (6,1 %) |
| Artifact | 770 | 717 (93,1 %) | 35 (4,5 %) | 18 (2,3 %) |
| Enchantment | 905 | 837 (92,5 %) | 55 (6,1 %) | 13 (1,4 %) |
| Land | 689 | 689 (100,0 %) | 0 (0,0 %) | 0 (0,0 %) |
| Planeswalker | 133 | 133 (100,0 %) | 0 (0,0 %) | 0 (0,0 %) |
| Battle | 5 | 4 (80,0 %) | 1 (20,0 %) | 0 (0,0 %) |

## Ce qui manque

2 825 des 4 413 cartes non complètes n'ont **qu'un seul élément** inconnu (64,0 %) ; parmi celles d'EDHREC,
283 sur 462.

### Par famille d'élément (nombre de cartes non complètes qui en portent au moins un)

| Famille | Toutes les cartes | Cartes d'EDHREC | Ce que c'est |
|---|---|---|---|
| `param` | 2 336 | 268 | un paramètre d'effet ou de statique |
| `construction` | 726 | 70 | une construction refusée |
| `trig` | 511 | 41 | un déclencheur |
| `expr` | 475 | 53 | une quantité calculée |
| `filtre` | 472 | 39 | une propriété de filtre |
| `kw` | 465 | 42 | un mot-clé |
| `api` | 382 | 27 | un effet entier |
| `defini` | 164 | 29 | une désignation |
| `kwval` | 145 | 9 | une valeur de mot-clé |
| `stat` | 126 | 16 | une statique |
| `repl` | 48 | 10 | un remplacement |
| `cout` | 44 | 8 | un morceau de coût |

### Par mécanisme (cartes non complètes dont au moins un élément relève du mécanisme)

Un même mécanisme apparaît dans plusieurs lignes de la liste ci-dessous (l'effet, ses paramètres, son déclencheur) : une carte compte
pour un seul mécanisme ici.

| Mécanisme | Toutes les cartes | Cartes d'EDHREC |
|---|---|---|
| Alchemy (MakeCard, Seek, Draft, Empower, Spellbook…) | 189 | 0 |
| Planechase (ChaosEnsues, PlaneswalkedTo, Planar Die) | 190 | 4 |
| Archenemy (SetInMotion, Scheme) | 84 | 0 |
| Un-sets et attractions (Sticker, Contraption, Attraction) | 185 | 5 |
| Mutate | 38 | 19 |
| Meld | 0 | 0 |
| Suspend (valeur de mot-clé) | 6 | 1 |
| ControlPlayer (Mindslaver) | 2 | 1 |
| Tout le reste | 3 719 | 432 |

Les cartes de l'Alchemy, de Planechase, d'Archenemy et des Un-sets ne se jouent pas dans un deck Commander classique : elles pèsent sur le total
de toutes les cartes, presque pas sur celui d'EDHREC.

### Les trente éléments qui bloquent le plus de cartes, toutes cartes confondues

| Élément | Cartes | Exemples |
|---|---|---|
| `trig:ChaosEnsues` | 158 | Academy at Tolaria West, Agyrem, Akoum |
| `construction:Continuous` | 133 | Aeve, Progenitor Ooze, Aminatou, Veil Piercer, Ashes of the Fallen |
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
| `construction:Phase` | 39 | Absorbing Man, Alrund, God of the Cosmos, Arming Gala |
| `api:PutSticker` | 36 | Aerialephant, Ambassador Blorpityblorpboop, _____ _____ Rocketship |
| `kw:Mutate` | 34 | Archipelagore, Auspicious Starrix, Boneyard Lurker |
| `trig:Mutates` | 32 | Archipelagore, Auspicious Starrix, Boneyard Lurker |
| `param:Mutates.ValidCard` | 32 | Archipelagore, Auspicious Starrix, Boneyard Lurker |
| `api:Planeswalk` | 30 | Aretopolis, Bad Wolf Bay, Caught in a Parallel Universe |
| `construction:ReduceCost` | 28 | Because I Have Willed It, Boom Scholar, Brago's Favor |
| `construction:Effect` | 25 | Alluring Siren, Blood of the Martyr, Channel |
| `param:Discard.DefinedCards` | 25 | Arius, Flyby Trawler, Breathstealer's Crypt, Concealing Curtains |
| `param:PutSticker.Choices` | 24 | Aerialephant, Ambassador Blorpityblorpboop, Baaallerina |
| `kw:Banding` | 24 | Ayesha Tanaka, Benalish Hero, Benalish Infantry |
| `param:Continuous.CanBlockAmount` | 24 | Brave the Sands, Cenn's Tactician, Echo Circlet |
| `kw:Visit` | 23 | Balloon Stand, Bounce Chamber, Bumper Cars |
| `param:MakeCard.Amount` | 23 | Bone Rattler, Boneyard Aberration, Caldera Breaker |
| `api:AssembleContraption` | 22 | Aerial Toastmaster, Chipper Chopper, Cogmentor |
| `api:OpenAttraction` | 22 | Coming Attraction, Command Performance, Complaints Clerk |
| `api:Intensify` | 21 | Arek, False Goldwarden, Awestruck Cygnet, Bellowsbreath Ogre |

### Les vingt éléments qui bloquent le plus de cartes d'EDHREC

| Élément | Cartes | Exemples |
|---|---|---|
| `kw:Mutate` | 18 | Nethroi, Apex of Death, Gemrazer, Brokkos, Apex of Forever |
| `trig:Mutates` | 16 | Mysterious Egg, Nethroi, Apex of Death, Gemrazer |
| `param:Mutates.ValidCard` | 16 | Mysterious Egg, Nethroi, Apex of Death, Gemrazer |
| `construction:Continuous` | 9 | Tyvar the Bellicose, Danny Pink, Hunting Velociraptor |
| `construction:Mana` | 6 | Master of Dark Rites, Titans' Nest, Jeweled Amulet |
| `api:OpenAttraction` | 5 | "Lifetime" Pass Holder, Deadbeat Attendant, Complaints Clerk |
| `param:PutCounter.Placer` | 4 | Promise of Loyalty, Gluntch, the Bestower, Aragorn, Company Leader |
| `param:PutCounter.RememberPut` | 4 | Call the Spirit Dragons, Craig Boone, Novac Guard, Fangs of Kalonia |
| `param:Charm.Pawprint` | 4 | Season of Loss, Season of the Burrow, Season of Gathering |
| `param:Bookkeeping.NoteCards` | 4 | Master of Ceremonies, Prisoner's Dilemma, Mog, Moogle Warrior |
| `param:Bookkeeping.NoteCardsFor` | 4 | Master of Ceremonies, Prisoner's Dilemma, Mog, Moogle Warrior |
| `param:Bookkeeping.ClearNotedCardsFor` | 4 | Master of Ceremonies, Prisoner's Dilemma, Mog, Moogle Warrior |
| `construction:SpellCast` | 4 | Danitha, Sword of Hope, Thousand Moons Smithy, Judith, Carnage Connoisseur |
| `construction:ChangesZone` | 4 | Firion, Wild Rose Warrior, Tide Shaper, Q, Stacking the Deck |
| `kw:Read ahead` | 4 | The Cruelty of Gix, The Weatherseed Treaty, The Elder Dragon War |
| `param:Continuous.MayPlayDontGrantZonePermissions` | 3 | As Foretold, Dracogenesis, Darksteel Monolith |
| `api:ChangeCombatants` | 3 | Misleading Signpost, Midnight Crusader Shuttle, Capricopian |
| `param:ChangeCombatants.Attacking` | 3 | Misleading Signpost, Midnight Crusader Shuttle, Capricopian |
| `filtre:IsSolved` | 3 | Case of the Ransacked Lab, Case of the Locked Hothouse, Case of the Uneaten Feast |
| `construction:Flashback` | 3 | Summons of Saruman, Kindle the Inner Flame, Battle Screech |
