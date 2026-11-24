# Détail de la couverture : toutes les cartes, et celles d'EDHREC

Mesure du 24 novembre 2026 (dépôt Forge au commit `3e1fa4ed`, moteur après le lot F99). Chaque carte est lue avec son script Forge
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
| **Toutes les cartes** | 34 482 | 29 620 (85,9 %) | 3 004 (8,7 %) | 1 858 (5,4 %) |

### Par type de carte (premier type qui s'applique)

| Type | Cartes | Complètes | Partielles | Injouables |
|---|---|---|---|---|
| Creature | 18 997 | 16 611 (87,4 %) | 1 824 (9,6 %) | 562 (3,0 %) |
| Instant | 3 829 | 3 322 (86,8 %) | 53 (1,4 %) | 454 (11,9 %) |
| Sorcery | 3 583 | 3 037 (84,8 %) | 69 (1,9 %) | 477 (13,3 %) |
| Artifact | 2 545 | 2 140 (84,1 %) | 329 (12,9 %) | 76 (3,0 %) |
| Enchantment | 3 498 | 2 958 (84,6 %) | 365 (10,4 %) | 175 (5,0 %) |
| Land | 1 200 | 1 200 (100,0 %) | 0 (0,0 %) | 0 (0,0 %) |
| Planeswalker | 337 | 265 (78,6 %) | 66 (19,6 %) | 6 (1,8 %) |
| Battle | 37 | 30 (81,1 %) | 7 (18,9 %) | 0 (0,0 %) |
| Autres (Scheme, Plane, Vanguard, Attraction, Dungeon, Conspiracy…) | 456 | 57 (12,5 %) | 291 (63,8 %) | 108 (23,7 %) |

### Par structure

| Structure | Cartes | Complètes | Partielles | Injouables |
|---|---|---|---|---|
| Une face | 33 562 | 28 858 (86,0 %) | 2 866 (8,5 %) | 1 838 (5,5 %) |
| Plusieurs faces (transformables, modales, aventures…) | 920 | 762 (82,8 %) | 138 (15,0 %) | 20 (2,2 %) |
| Légendaires | 4 638 | 3 762 (81,1 %) | 665 (14,3 %) | 211 (4,5 %) |
| Non légendaires | 29 844 | 25 858 (86,6 %) | 2 339 (7,8 %) | 1 647 (5,5 %) |

### Par longueur du script (nombre de lignes de capacités, déclencheurs, statiques, remplacements et mots-clés)

| Script | Cartes | Complètes | Partielles | Injouables |
|---|---|---|---|---|
| 0–1 ligne | 14 674 | 12 836 (87,5 %) | 888 (6,1 %) | 950 (6,5 %) |
| 2–3 lignes | 17 994 | 15 395 (85,6 %) | 1 804 (10,0 %) | 795 (4,4 %) |
| 4–6 lignes | 1 738 | 1 346 (77,4 %) | 281 (16,2 %) | 111 (6,4 %) |
| 7 lignes ou plus | 76 | 43 (56,6 %) | 31 (40,8 %) | 2 (2,6 %) |

## Sur les cartes d'EDHREC

Les cartes des pages des cent premiers commandants de l'année (`json.edhrec.com`) : 7 336 cartes distinctes (la liste de `doc/couverture-edhrec.md`).

|  | Cartes | Complètes | Partielles | Injouables |
|---|---|---|---|---|
| **Cartes d'EDHREC** | 7 336 | 6 753 (92,1 %) | 354 (4,8 %) | 229 (3,1 %) |
| Le reste du pool Forge (appariement par nom) | 27 171 | 22 891 (84,2 %) | 2 651 (9,8 %) | 1 629 (6,0 %) |

Pondérées par le nombre de decks qui les jouent (additionné sur ces cent pages, 174 459 122 places de deck) :
**96,9 %** des places de deck sont tenues par une carte complète, 1,9 % par une partielle, 1,2 % par une injouable.

### Les cartes d'EDHREC, par type

| Type | Cartes | Complètes | Partielles | Injouables |
|---|---|---|---|---|
| Creature | 3 270 | 2 976 (91,0 %) | 217 (6,6 %) | 77 (2,4 %) |
| Instant | 774 | 714 (92,2 %) | 3 (0,4 %) | 57 (7,4 %) |
| Sorcery | 790 | 715 (90,5 %) | 16 (2,0 %) | 59 (7,5 %) |
| Artifact | 770 | 712 (92,5 %) | 39 (5,1 %) | 19 (2,5 %) |
| Enchantment | 905 | 833 (92,0 %) | 58 (6,4 %) | 14 (1,5 %) |
| Land | 689 | 689 (100,0 %) | 0 (0,0 %) | 0 (0,0 %) |
| Planeswalker | 133 | 110 (82,7 %) | 20 (15,0 %) | 3 (2,3 %) |
| Battle | 5 | 4 (80,0 %) | 1 (20,0 %) | 0 (0,0 %) |

## Ce qui manque

3 099 des 4 862 cartes non complètes n'ont **qu'un seul élément** inconnu (63,7 %) ; parmi celles d'EDHREC,
362 sur 583.

### Par famille d'élément (nombre de cartes non complètes qui en portent au moins un)

| Famille | Toutes les cartes | Cartes d'EDHREC | Ce que c'est |
|---|---|---|---|
| `param` | 2 619 | 341 | un paramètre d'effet ou de statique |
| `construction` | 764 | 84 | une construction refusée |
| `filtre` | 529 | 45 | une propriété de filtre |
| `expr` | 519 | 65 | une quantité calculée |
| `trig` | 514 | 41 | un déclencheur |
| `kw` | 466 | 42 | un mot-clé |
| `api` | 405 | 37 | un effet entier |
| `defini` | 206 | 41 | une désignation |
| `kwval` | 176 | 18 | une valeur de mot-clé |
| `stat` | 129 | 18 | une statique |
| `cout` | 50 | 11 | un morceau de coût |
| `repl` | 49 | 10 | un remplacement |

### Par mécanisme (cartes non complètes dont au moins un élément relève du mécanisme)

Un même mécanisme apparaît dans plusieurs lignes de la liste ci-dessous (l'effet, ses paramètres, son déclencheur) : une carte compte
pour un seul mécanisme ici.

| Mécanisme | Toutes les cartes | Cartes d'EDHREC |
|---|---|---|
| Alchemy (MakeCard, Seek, Draft, Empower, Spellbook…) | 189 | 0 |
| Planechase (ChaosEnsues, PlaneswalkedTo, Planar Die) | 191 | 5 |
| Archenemy (SetInMotion, Scheme) | 84 | 0 |
| Un-sets et attractions (Sticker, Contraption, Attraction) | 185 | 5 |
| Mutate | 38 | 19 |
| Meld | 0 | 0 |
| Suspend (valeur de mot-clé) | 24 | 7 |
| ControlPlayer (Mindslaver) | 8 | 5 |
| Tout le reste | 4 145 | 542 |

Les cartes de l'Alchemy, de Planechase, d'Archenemy et des Un-sets ne se jouent pas dans un deck Commander classique : elles pèsent sur le total
de toutes les cartes, presque pas sur celui d'EDHREC.

### Les trente éléments qui bloquent le plus de cartes, toutes cartes confondues

| Élément | Cartes | Exemples |
|---|---|---|
| `trig:ChaosEnsues` | 158 | Academy at Tolaria West, Agyrem, Akoum |
| `construction:Continuous` | 134 | Aeve, Progenitor Ooze, Aminatou, Veil Piercer, Ashes of the Fallen |
| `trig:SetInMotion` | 84 | A Display of My Dark Power, A Premonition of Your Demise, A Reckoning Approaches |
| `param:SetInMotion.ValidCard` | 84 | A Display of My Dark Power, A Premonition of Your Demise, A Reckoning Approaches |
| `trig:PlaneswalkedTo` | 62 | Agyrem, Amy's Home, Antarctic Research Base |
| `construction:ChangesZone` | 62 | Ambassador of Evendo, Angel of Unity, Antique Collector |
| `param:PlaneswalkedTo.ValidCard` | 57 | Amy's Home, Antarctic Research Base, Aretopolis |
| `kw:StickerSheet` | 48 | Ancestral Hot Dog Minotaur, Carnival Elephant Meteor, Contortionist Otter Storm |
| `trig:CrankContraption` | 45 | Accessories to Murder, Applied Aeronautics, Arms Depot |
| `param:CrankContraption.ValidCard` | 45 | Accessories to Murder, Applied Aeronautics, Arms Depot |
| `param:MakeCard.DefinedName` | 43 | Ace Flockbringer, Agent of Raffine, Bend Mortal Limits |
| `api:Draft` | 42 | Adaptive Armorer, Arms Scavenger, Big Spender |
| `param:Draft.Spellbook` | 42 | Adaptive Armorer, Arms Scavenger, Big Spender |
| `construction:Phase` | 40 | Absorbing Man, Alrund, God of the Cosmos, Arming Gala |
| `param:ChangeZone.LibraryPositionAlternative` | 38 | Aether Gust, Arashin Sovereign, Deem Inferior |
| `api:PutSticker` | 36 | Aerialephant, Ambassador Blorpityblorpboop, _____ _____ Rocketship |
| `param:ChangeZone.AlternativeDecider` | 35 | Aether Gust, Deem Inferior, Desynchronize |
| `kw:Mutate` | 34 | Archipelagore, Auspicious Starrix, Boneyard Lurker |
| `trig:Mutates` | 32 | Archipelagore, Auspicious Starrix, Boneyard Lurker |
| `param:Mutates.ValidCard` | 32 | Archipelagore, Auspicious Starrix, Boneyard Lurker |
| `construction:Effect` | 31 | Alluring Siren, Arlinn, the Pack's Hope, Blood of the Martyr |
| `api:Planeswalk` | 30 | Aretopolis, Bad Wolf Bay, Caught in a Parallel Universe |
| `construction:ReduceCost` | 29 | Because I Have Willed It, Boom Scholar, Brago's Favor |
| `param:Discard.DefinedCards` | 25 | Arius, Flyby Trawler, Breathstealer's Crypt, Concealing Curtains |
| `param:PutSticker.Choices` | 24 | Aerialephant, Ambassador Blorpityblorpboop, Baaallerina |
| `kw:Banding` | 24 | Ayesha Tanaka, Benalish Hero, Benalish Infantry |
| `param:Continuous.CanBlockAmount` | 24 | Brave the Sands, Cenn's Tactician, Echo Circlet |
| `kw:Visit` | 23 | Balloon Stand, Bounce Chamber, Bumper Cars |
| `param:MakeCard.Amount` | 23 | Bone Rattler, Boneyard Aberration, Caldera Breaker |
| `api:AssembleContraption` | 22 | Aerial Toastmaster, Chipper Chopper, Cogmentor |

### Les vingt éléments qui bloquent le plus de cartes d'EDHREC

| Élément | Cartes | Exemples |
|---|---|---|
| `kw:Mutate` | 18 | Nethroi, Apex of Death, Gemrazer, Brokkos, Apex of Forever |
| `trig:Mutates` | 16 | Mysterious Egg, Nethroi, Apex of Death, Gemrazer |
| `param:Mutates.ValidCard` | 16 | Mysterious Egg, Nethroi, Apex of Death, Gemrazer |
| `construction:Continuous` | 9 | Tyvar the Bellicose, Danny Pink, Hunting Velociraptor |
| `kwval:suspend` | 7 | Delay, Doom's Time Platform, Jhoira of the Ghitu |
| `construction:Mana` | 6 | Master of Dark Rites, Titans' Nest, Jeweled Amulet |
| `api:ControlPlayer` | 5 | Sorin Markov, Mindslaver, Emrakul, the Promised End |
| `param:ImmediateTrigger.TriggerAmount` | 5 | Earthbender Ascension, Ajani, Nacatl Pariah, Faebloom Trick |
| `api:OpenAttraction` | 5 | "Lifetime" Pass Holder, Deadbeat Attendant, Complaints Clerk |
| `param:PutCounter.Placer` | 4 | Promise of Loyalty, Gluntch, the Bestower, Aragorn, Company Leader |
| `param:ChooseCard.ChooseEach` | 4 | Liliana, Dreadhorde General, Ajani, Nacatl Pariah, Mythos of Snapdax |
| `expr:Count$OptionalGenericCostPaid` | 4 | Dragon's Fire, Dispelling Exhale, Spirit Water Revival |
| `param:PutCounter.RememberPut` | 4 | Call the Spirit Dragons, Craig Boone, Novac Guard, Fangs of Kalonia |
| `param:Charm.Pawprint` | 4 | Season of Loss, Season of the Burrow, Season of Gathering |
| `param:Bookkeeping.NoteCards` | 4 | Master of Ceremonies, Prisoner's Dilemma, Mog, Moogle Warrior |
| `param:Bookkeeping.NoteCardsFor` | 4 | Master of Ceremonies, Prisoner's Dilemma, Mog, Moogle Warrior |
| `param:Bookkeeping.ClearNotedCardsFor` | 4 | Master of Ceremonies, Prisoner's Dilemma, Mog, Moogle Warrior |
| `construction:Phase` | 4 | The Second Doctor, Jace, Multiverse Architect, Taskmaster, Mercenary Mimic |
| `construction:SpellCast` | 4 | Danitha, Sword of Hope, Thousand Moons Smithy, Judith, Carnage Connoisseur |
| `construction:ReduceCost` | 4 | Professor Hojo, Doc Aurlock, Grizzled Genius, Tezzeret, Betrayer of Flesh |
