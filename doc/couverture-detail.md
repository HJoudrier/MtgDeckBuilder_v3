# Détail de la couverture : toutes les cartes, et celles d'EDHREC

Mesure du 24 novembre 2026 (dépôt Forge au commit `3e1fa4ed`, moteur après le lot F95). Chaque carte est lue avec son script Forge
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
| **Toutes les cartes** | 34 482 | 29 306 (85,0 %) | 3 224 (9,3 %) | 1 952 (5,7 %) |

### Par type de carte (premier type qui s'applique)

| Type | Cartes | Complètes | Partielles | Injouables |
|---|---|---|---|---|
| Creature | 18 997 | 16 472 (86,7 %) | 1 936 (10,2 %) | 589 (3,1 %) |
| Instant | 3 829 | 3 296 (86,1 %) | 54 (1,4 %) | 479 (12,5 %) |
| Sorcery | 3 583 | 3 009 (84,0 %) | 70 (2,0 %) | 504 (14,1 %) |
| Artifact | 2 545 | 2 119 (83,3 %) | 348 (13,7 %) | 78 (3,1 %) |
| Enchantment | 3 498 | 2 928 (83,7 %) | 391 (11,2 %) | 179 (5,1 %) |
| Land | 1 200 | 1 136 (94,7 %) | 55 (4,6 %) | 9 (0,8 %) |
| Planeswalker | 337 | 259 (76,9 %) | 72 (21,4 %) | 6 (1,8 %) |
| Battle | 37 | 30 (81,1 %) | 7 (18,9 %) | 0 (0,0 %) |
| Autres (Scheme, Plane, Vanguard, Attraction, Dungeon, Conspiracy…) | 456 | 57 (12,5 %) | 291 (63,8 %) | 108 (23,7 %) |

### Par structure

| Structure | Cartes | Complètes | Partielles | Injouables |
|---|---|---|---|---|
| Une face | 33 562 | 28 555 (85,1 %) | 3 076 (9,2 %) | 1 931 (5,8 %) |
| Plusieurs faces (transformables, modales, aventures…) | 920 | 751 (81,6 %) | 148 (16,1 %) | 21 (2,3 %) |
| Légendaires | 4 638 | 3 700 (79,8 %) | 723 (15,6 %) | 215 (4,6 %) |
| Non légendaires | 29 844 | 25 606 (85,8 %) | 2 501 (8,4 %) | 1 737 (5,8 %) |

### Par longueur du script (nombre de lignes de capacités, déclencheurs, statiques, remplacements et mots-clés)

| Script | Cartes | Complètes | Partielles | Injouables |
|---|---|---|---|---|
| 0–1 ligne | 14 674 | 12 745 (86,9 %) | 930 (6,3 %) | 999 (6,8 %) |
| 2–3 lignes | 17 994 | 15 195 (84,4 %) | 1 962 (10,9 %) | 837 (4,7 %) |
| 4–6 lignes | 1 738 | 1 327 (76,4 %) | 298 (17,1 %) | 113 (6,5 %) |
| 7 lignes ou plus | 76 | 39 (51,3 %) | 34 (44,7 %) | 3 (3,9 %) |

## Sur les cartes d'EDHREC

Les cartes des pages des cent premiers commandants de l'année (`json.edhrec.com`) : 7 336 cartes distinctes (la liste de `doc/couverture-edhrec.md`).

|  | Cartes | Complètes | Partielles | Injouables |
|---|---|---|---|---|
| **Cartes d'EDHREC** | 7 336 | 6 716 (91,5 %) | 384 (5,2 %) | 236 (3,2 %) |
| Le reste du pool Forge (appariement par nom) | 27 171 | 22 614 (83,2 %) | 2 841 (10,5 %) | 1 716 (6,3 %) |

Pondérées par le nombre de decks qui les jouent (additionné sur ces cent pages, 174 459 122 places de deck) :
**96,7 %** des places de deck sont tenues par une carte complète, 2,1 % par une partielle, 1,2 % par une injouable.

### Les cartes d'EDHREC, par type

| Type | Cartes | Complètes | Partielles | Injouables |
|---|---|---|---|---|
| Creature | 3 270 | 2 969 (90,8 %) | 224 (6,9 %) | 77 (2,4 %) |
| Instant | 774 | 713 (92,1 %) | 3 (0,4 %) | 58 (7,5 %) |
| Sorcery | 790 | 711 (90,0 %) | 16 (2,0 %) | 63 (8,0 %) |
| Artifact | 770 | 709 (92,1 %) | 42 (5,5 %) | 19 (2,5 %) |
| Enchantment | 905 | 830 (91,7 %) | 61 (6,7 %) | 14 (1,5 %) |
| Land | 689 | 670 (97,2 %) | 17 (2,5 %) | 2 (0,3 %) |
| Planeswalker | 133 | 110 (82,7 %) | 20 (15,0 %) | 3 (2,3 %) |
| Battle | 5 | 4 (80,0 %) | 1 (20,0 %) | 0 (0,0 %) |

## Ce qui manque

3 078 des 5 176 cartes non complètes n'ont **qu'un seul élément** inconnu (59,5 %) ; parmi celles d'EDHREC,
381 sur 620.

### Par famille d'élément (nombre de cartes non complètes qui en portent au moins un)

| Famille | Toutes les cartes | Cartes d'EDHREC | Ce que c'est |
|---|---|---|---|
| `param` | 2 896 | 361 | un paramètre d'effet ou de statique |
| `construction` | 779 | 97 | une construction refusée |
| `api` | 751 | 47 | un effet entier |
| `filtre` | 560 | 52 | une propriété de filtre |
| `expr` | 530 | 66 | une quantité calculée |
| `trig` | 522 | 43 | un déclencheur |
| `kw` | 478 | 42 | un mot-clé |
| `defini` | 226 | 42 | une désignation |
| `kwval` | 182 | 22 | une valeur de mot-clé |
| `stat` | 133 | 20 | une statique |
| `cout` | 50 | 11 | un morceau de coût |
| `repl` | 49 | 10 | un remplacement |

### Par mécanisme (cartes non complètes dont au moins un élément relève du mécanisme)

Un même mécanisme apparaît dans plusieurs lignes de la liste ci-dessous (l'effet, ses paramètres, son déclencheur) : une carte compte
pour un seul mécanisme ici.

| Mécanisme | Toutes les cartes | Cartes d'EDHREC |
|---|---|---|
| Alchemy (MakeCard, Seek, Draft, Empower, Spellbook…) | 399 | 4 |
| Planechase (ChaosEnsues, PlaneswalkedTo, Planar Die) | 191 | 5 |
| Archenemy (SetInMotion, Scheme) | 84 | 0 |
| Un-sets et attractions (Sticker, Contraption, Attraction) | 185 | 5 |
| Mutate | 38 | 19 |
| Meld | 7 | 4 |
| Suspend (valeur de mot-clé) | 24 | 7 |
| ControlPlayer (Mindslaver) | 8 | 5 |
| Tout le reste | 4 243 | 572 |

Les cartes de l'Alchemy, de Planechase, d'Archenemy et des Un-sets ne se jouent pas dans un deck Commander classique : elles pèsent sur le total
de toutes les cartes, presque pas sur celui d'EDHREC.

### Les trente éléments qui bloquent le plus de cartes, toutes cartes confondues

| Élément | Cartes | Exemples |
|---|---|---|
| `api:MakeCard` | 189 | A Golden Opportunity, Ace Flockbringer, Agent of Raffine |
| `param:MakeCard.Zone` | 188 | A Golden Opportunity, Ace Flockbringer, Agent of Raffine |
| `param:MakeCard.Conjure` | 172 | A Golden Opportunity, Ace Flockbringer, Agent of Raffine |
| `trig:ChaosEnsues` | 158 | Academy at Tolaria West, Agyrem, Akoum |
| `construction:Continuous` | 136 | Aeve, Progenitor Ooze, Aminatou, Veil Piercer, Ashes of the Fallen |
| `param:MakeCard.Name` | 120 | A Golden Opportunity, Anina, Natural Parallelist, Argothian Uprooting |
| `api:Seek` | 105 | Adherent's Heirloom, Anguished Recollection, Archaeomancer's Spade |
| `param:Seek.Type` | 102 | Adherent's Heirloom, Anguished Recollection, Archaeomancer's Spade |
| `trig:SetInMotion` | 84 | A Display of My Dark Power, A Premonition of Your Demise, A Reckoning Approaches |
| `param:SetInMotion.ValidCard` | 84 | A Display of My Dark Power, A Premonition of Your Demise, A Reckoning Approaches |
| `trig:PlaneswalkedTo` | 62 | Agyrem, Amy's Home, Antarctic Research Base |
| `param:MakeCard.RememberMade` | 60 | Ace Flockbringer, Agent of Raffine, Bind to Secrecy |
| `param:PlaneswalkedTo.ValidCard` | 57 | Amy's Home, Antarctic Research Base, Aretopolis |
| `construction:ChangesZone` | 53 | Ambassador of Evendo, Angel of Unity, Antique Collector |
| `kw:StickerSheet` | 48 | Ancestral Hot Dog Minotaur, Carnival Elephant Meteor, Contortionist Otter Storm |
| `trig:CrankContraption` | 45 | Accessories to Murder, Applied Aeronautics, Arms Depot |
| `param:CrankContraption.ValidCard` | 45 | Accessories to Murder, Applied Aeronautics, Arms Depot |
| `param:MakeCard.DefinedName` | 43 | Ace Flockbringer, Agent of Raffine, Bend Mortal Limits |
| `api:Draft` | 42 | Adaptive Armorer, Arms Scavenger, Big Spender |
| `param:Draft.Spellbook` | 42 | Adaptive Armorer, Arms Scavenger, Big Spender |
| `param:ChangeZone.LibraryPositionAlternative` | 38 | Aether Gust, Arashin Sovereign, Deem Inferior |
| `construction:Phase` | 37 | Absorbing Man, Alrund, God of the Cosmos, Arming Gala |
| `api:Empower` | 36 | Academic Ascent, Arcane Amphisbaena, Avatar of Burgeoning Echoes |
| `param:Empower.Type` | 36 | Academic Ascent, Arcane Amphisbaena, Avatar of Burgeoning Echoes |
| `param:Empower.Num` | 36 | Academic Ascent, Arcane Amphisbaena, Avatar of Burgeoning Echoes |
| `api:PutSticker` | 36 | Aerialephant, Ambassador Blorpityblorpboop, _____ _____ Rocketship |
| `param:ChangeZone.AlternativeDecider` | 35 | Aether Gust, Deem Inferior, Desynchronize |
| `kw:Mutate` | 34 | Archipelagore, Auspicious Starrix, Boneyard Lurker |
| `param:Seek.RememberFound` | 33 | Archaeomancer's Spade, Arius, Flyby Trawler, Audacious Knuckleblade |
| `construction:Effect` | 32 | Alluring Siren, Arlinn, the Pack's Hope, Blood of the Martyr |

### Les vingt éléments qui bloquent le plus de cartes d'EDHREC

| Élément | Cartes | Exemples |
|---|---|---|
| `kw:Mutate` | 18 | Nethroi, Apex of Death, Gemrazer, Brokkos, Apex of Forever |
| `trig:Mutates` | 16 | Mysterious Egg, Nethroi, Apex of Death, Gemrazer |
| `param:Mutates.ValidCard` | 16 | Mysterious Egg, Nethroi, Apex of Death, Gemrazer |
| `construction:Mana` | 9 | Master of Dark Rites, Titans' Nest, Jeweled Amulet |
| `construction:Continuous` | 9 | Tyvar the Bellicose, Danny Pink, Hunting Velociraptor |
| `kwval:suspend` | 7 | Delay, Doom's Time Platform, Jhoira of the Ghitu |
| `api:ControlPlayer` | 5 | Sorin Markov, Mindslaver, Emrakul, the Promised End |
| `param:ImmediateTrigger.TriggerAmount` | 5 | Earthbender Ascension, Ajani, Nacatl Pariah, Faebloom Trick |
| `api:OpenAttraction` | 5 | "Lifetime" Pass Holder, Deadbeat Attendant, Complaints Clerk |
| `param:PutCounter.Placer` | 4 | Promise of Loyalty, Gluntch, the Bestower, Aragorn, Company Leader |
| `api:Empower` | 4 | Sanctum Lurker, Way of the Paradox, Way of the Mentor |
| `param:Empower.Type` | 4 | Sanctum Lurker, Way of the Paradox, Way of the Mentor |
| `param:Empower.Num` | 4 | Sanctum Lurker, Way of the Paradox, Way of the Mentor |
| `param:ChooseCard.ChooseEach` | 4 | Liliana, Dreadhorde General, Ajani, Nacatl Pariah, Mythos of Snapdax |
| `expr:Count$OptionalGenericCostPaid` | 4 | Dragon's Fire, Dispelling Exhale, Spirit Water Revival |
| `param:PutCounter.RememberPut` | 4 | Call the Spirit Dragons, Craig Boone, Novac Guard, Fangs of Kalonia |
| `api:Meld` | 4 | Gisela, the Broken Blade, Mishra, Claimed by Gix, Hanweir Battlements |
| `param:Meld.Name` | 4 | Gisela, the Broken Blade, Mishra, Claimed by Gix, Hanweir Battlements |
| `param:Meld.Primary` | 4 | Gisela, the Broken Blade, Mishra, Claimed by Gix, Hanweir Battlements |
| `construction:Meld` | 4 | Gisela, the Broken Blade, Mishra, Claimed by Gix, Hanweir Battlements |
