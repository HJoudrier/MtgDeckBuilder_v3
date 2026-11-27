# Les deux lectures du graphe

Mesure du 27 novembre 2026, sur 33 843 cartes : toutes celles du dossier `cardsfolder` de Forge (commit `230914a4`), hors plans,
machinations et cartes Alchemy. Chaque carte est bâtie par `buildCard()` avec l'oracle que porte son script, puis lue
dans ce texte (`analyseTexte()`) et dans son script (`analyseForge()`). Produit par `node outils/compareLectures.js`.

| | cartes | part |
|---|---|---|
| mêmes déclencheurs et mêmes productions | 20 249 | 59,8 % |
| mêmes arcs du graphe | 18 755 | 55,4 % |
| au moins une unité du script relue dans le texte | 137 | 0,4 % |

## Ce que le graphe tracerait

Un échantillon de 425 cartes non-terrains (une sur quatre-vingts, d'ordre stable), prises deux à deux :
les liens que `synergyBetween()` trace entre elles d'après chaque lecture.

| | paires |
|---|---|
| reliées par l'une ou l'autre lecture | 12 384 |
| reliées par les deux, au moins par un même lien | 5 969 |
| reliées par le texte seul | 1 657 |
| reliées par Forge seul | 4 701 |
| liens, en tout : texte / Forge | 8 509 / 12 419 |

Liens du texte seul, par nœud : `ETB` 1 383, `LANCEMENT` 424, `JETON` 174, `SACRIFICE` 39, `DEFAUSSE` 12, `PIOCHE` 8, `MARQUEUR_AUTRE` 8, `MORT` 7. Par exemple : Inspired Inventor → Murasa Pyromancer (ETB), Old Stickfingers → Edgar, Moonlit Sovereign (LANCEMENT), Wild Slash → Edgar, Moonlit Sovereign (LANCEMENT), Bucky Barnes, Eager Ally → Hearthcage Giant (ETB), Riot Piker → Hearthcage Giant (ETB), Bay Falcon → Murasa Pyromancer (ETB), Territorial Boar → Edgar, Moonlit Sovereign (LANCEMENT), Cloudblazer → Hearthcage Giant (ETB).

Liens de Forge seul, par nœud : `ETB` 3 457, `LANCEMENT` 937, `JETON` 665, `MORT` 286, `ENGAGEMENT` 216, `PIOCHE` 152, `SACRIFICE` 65, `MIS_AU_CIMETIERE` 42. Par exemple : Turtle-Seals → Vivisection (ETB), Zur, Eternal Schemer → Venerated Loxodon (ETB), Murasa Pyromancer → Venerated Loxodon (ETB), Angelic Gift → Cloudpiercer (PIOCHE), Drogskol Shieldmate → Support Skyforge (ETB), Viashino Firstblade → Venerated Loxodon (ETB), Craterhoof Behemoth → Mindreaver (LANCEMENT), Mesa Cavalier → Support Skyforge (ETB).

## Les rôles d'une carte

Les rôles que l'onglet Deck compte (`categories()`), tirés de l'une puis de l'autre lecture.

| Rôle | les deux | texte seul | Forge seul | exemples, texte seul | exemples, Forge seul |
|---|---|---|---|---|---|
| Card advantage | 5 172 | 431 | 1 991 | Necrogen Communion, Quark's Bar, Elemental Time Flamingo, Vivien's Invocation | Debtors' Knell, Cosmic Rebirth, Cryptic Pursuit, Deep Space Scan |
| Interaction | 6 057 | 649 | 1 051 | Akoum Stonewaker, Ares, God of War, Mysidian Elder | Rebel Informer, Guidance Failure, Erayo, Soratami Ascendant |
| Sacrifice | 3 911 | 774 | 469 | Shivan Wumpus, Trickster's Talisman, Descendants' Fury, Journey to Nowhere | Farsight Ritual, Arcbound Tracker, Time Sieve, Artisan of Kozilek |
| Marqueurs | 2 485 | 243 | 611 | Arcane Archery, Ainok Artillerist, Dodecapod, Namor | Abigale, Poet Laureate, Winding Constrictor, Sinuous Vermin |
| Jetons | 2 956 | 114 | 611 | Mysidian Elder, Serpent Generator, Clown Extruder, Concession Stand | Ant-Man's Army, Agate Instigator, Thrash // Threat, Magnifying Glass |
| ETB / blink | 687 | 314 | 334 | Masterpiece Vault, Liliana's Other Contract, Dredger's Insight, Outlaws' Merriment | Celebrity Fencer, Satoru, the Infiltrator, Overburden |
| Tuteurs | 514 | 113 | 406 | Celebrate the Harvest, Mana Severance, Harvest Season, Point the Way | Jester's Mask, Vivien's Invocation, Acquire, Kaslem's Stonetree |
| Stax | 461 | 95 | 387 | Gornog, the Red Reaper, Nafs Asp, Parnesse | Icy Prison, Wall of Frost, Dosan the Falling Leaf, Send to Sleep |
| Ramp / mana | 2 178 | 110 | 367 | Incubator Drone, Corpsehatch, Harold and Bob, First Numens | Goblin Glasswright, Blinkmoth Urn, Reality Twist, Song-Mad Treachery |
| Board wipes | 766 | 121 | 272 | Legate Lanius, Caesar's Ace, Soul Shatter, Bend or Break | Arcbond, Terisiare's Devastation, Hezrou, False Floor |
| Protection | 1 430 | 81 | 58 | Myojin of Cryptic Dreams, Dark Depths, Captain Marvel, Earth's Protector | Shielding Plax, Invasion of New Phyrexia, Syr Ginger, the Meal Ender |

## Ce qu'une carte attend : les déclencheurs

Un déclencheur est ce qu'une autre carte peut nourrir. « Texte seul » : la lecture du texte le voit, le script non ;
« Forge seul » : l'inverse. « Les deux » compte les cartes où elles s'accordent.

| Nœud | les deux | texte seul | Forge seul |
|---|---|---|---|
| Arrivée en jeu (`ETB`) | 1 241 | 13 | 1 109 |
| Jeton de créature (`JETON`) | 649 | 1 | 979 |
| Lancement de sort (`LANCEMENT`) | 1 047 | 51 | 373 |
| Attaque (`ATTAQUE`) | 283 | 47 | 288 |
| Pioche (`PIOCHE`) | 401 | 1 | 321 |
| Début du tour (`DEBUT_TOUR`) | 1 | 272 | 19 |
| Mort de créature (`MORT`) | 563 | 35 | 223 |
| Fin du tour (`FIN_TOUR`) | 560 | 75 | 145 |
| Marqueur +1/+1 (`MARQUEUR`) | 204 | 6 | 212 |
| Terrain (landfall) (`TERRAIN`) | 25 | 8 | 206 |
| Blessures de combat au joueur (`DEGATS_COMBAT_JOUEUR`) | 191 | 29 | 163 |
| Autre marqueur (`MARQUEUR_AUTRE`) | 195 | 0 | 173 |
| Défausse (`DEFAUSSE`) | 540 | 4 | 168 |
| Prolifération (`PROLIFERATION`) | 195 | 0 | 172 |
| Sacrifice (`SACRIFICE`) | 693 | 8 | 150 |
| Engagement (`ENGAGEMENT`) | 95 | 13 | 143 |
| Entretien (`ENTRETIEN`) | 1 010 | 45 | 110 |
| Retrait de marqueur (`MARQUEUR_RETIRE`) | 195 | 0 | 148 |
| Dégâts (`DEGATS`) | 73 | 26 | 111 |
| Mise au cimetière (`MIS_AU_CIMETIERE`) | 153 | 3 | 126 |
| Meule (`MILL`) | 134 | 0 | 100 |
| Début du combat (`DEBUT_COMBAT`) | 269 | 1 | 96 |
| Blocage (`BLOCAGE`) | 24 | 13 | 53 |
| Énergie (`ENERGIE`) | 46 | 0 | 49 |
| Exil (`EXIL`) | 134 | 0 | 43 |
| Départ du champ de bataille (`LTB`) | 28 | 0 | 43 |
| Phase principale (`PHASE_PRINCIPALE`) | 69 | 4 | 30 |
| Attaque seule (`ATTAQUE_SEULE`) | 39 | 0 | 34 |
| Filtrage / impulsion (`IMPULSE`) | 0 | 0 | 31 |
| Gain de vie (`GAIN_VIE`) | 98 | 1 | 26 |
| Capacité activée (`CAPACITE_ACTIVEE`) | 20 | 3 | 24 |
| Dé ou pile ou face (`DE`) | 11 | 0 | 23 |
| Terrain joué (`TERRAIN_JOUE`) | 15 | 1 | 22 |
| Monarque / initiative (`MONARQUE`) | 4 | 22 | 1 |
| Fin du combat (`FIN_COMBAT`) | 0 | 0 | 21 |
| Blessures de combat à une créature (`DEGATS_COMBAT_CREATURE`) | 6 | 1 | 16 |
| Cycle (`CYCLE`) | 20 | 14 | 0 |
| Mana dépensé (`MANA_DEPENSE`) | 0 | 0 | 11 |
| Devient une cible (`DEVIENT_CIBLE`) | 36 | 0 | 10 |
| Attachement (`ATTACHEMENT`) | 2 | 0 | 9 |
| Étape de pioche (`ETAPE_PIOCHE`) | 31 | 3 | 6 |
| Blessures subies (`DEGATS_SUBIS`) | 24 | 5 | 4 |
| Devient bloquée (`DEVIENT_BLOQUEE`) | 37 | 0 | 9 |
| Marqueur -1/-1 (`MARQUEUR_M1M1`) | 0 | 0 | 7 |
| Révélation (`REVELATION`) | 0 | 6 | 0 |
| Trésor (`TRESOR`) | 0 | 6 | 0 |
| Perte de vie (`PERTE_VIE`) | 19 | 1 | 4 |
| Dégagement (`UNTAP`) | 0 | 0 | 5 |
| Retournement face visible (`FACE_VISIBLE`) | 24 | 1 | 2 |
| Donjon (`DONJON`) | 2 | 0 | 2 |
| Arrivée depuis le cimetière (`ETB_CIMETIERE`) | 3 | 0 | 2 |
| Mort de cette carte (`MORT_SOI`) | 0 | 1 | 0 |
| Poison (`POISON`) | 0 | 0 | 1 |
| Expérience (`EXPERIENCE`) | 0 | 1 | 0 |
| Arrivée depuis l'exil (`ETB_EXIL`) | 1 | 1 | 0 |
| Chapitre de saga (`CHAPITRE_SAGA`) | 2 | 1 | 0 |

## Ce qu'une carte fournit : les productions

| Nœud | les deux | texte seul | Forge seul |
|---|---|---|---|
| Engagement (`ENGAGEMENT`) | 4 316 | 426 | 950 |
| Récursion (`RECURSION`) | 1 095 | 111 | 1 260 |
| Exil (`EXIL`) | 1 540 | 841 | 150 |
| Stax (`STAX`) | 399 | 579 | 338 |
| Marqueur +1/+1 (`MARQUEUR`) | 2 485 | 243 | 611 |
| Mise au cimetière (`MIS_AU_CIMETIERE`) | 1 312 | 70 | 699 |
| Vol (`VOL`) | 3 830 | 686 | 72 |
| Départ du champ de bataille (`LTB`) | 1 009 | 186 | 527 |
| Sacrifice (`SACRIFICE`) | 2 147 | 408 | 289 |
| Filtrage / impulsion (`IMPULSE`) | 1 327 | 146 | 541 |
| Autre marqueur (`MARQUEUR_AUTRE`) | 438 | 72 | 605 |
| Jeton de créature (`JETON`) | 3 166 | 38 | 609 |
| Révélation (`REVELATION`) | 253 | 345 | 238 |
| Mort de créature (`MORT`) | 986 | 49 | 516 |
| Pioche (`PIOCHE`) | 3 192 | 105 | 428 |
| Tuteur (`TUTEUR`) | 514 | 113 | 406 |
| Gain de vie (`GAIN_VIE`) | 2 016 | 126 | 371 |
| Dégâts (`DEGATS`) | 2 762 | 80 | 392 |
| Copie (`COPIE`) | 413 | 12 | 442 |
| Boost temporaire (`BOOST`) | 5 064 | 84 | 347 |
| Renvoi en main (`BOUNCE`) | 728 | 330 | 41 |
| Perte de vie (`PERTE_VIE`) | 982 | 15 | 335 |
| Défausse (`DEFAUSSE`) | 1 475 | 176 | 139 |
| Mana (`MANA`) | 2 039 | 88 | 216 |
| Mise en bibliothèque (`MIS_EN_BIBLIO`) | 310 | 60 | 184 |
| Célérité (`CELERITE`) | 1 238 | 186 | 49 |
| Retrait de marqueur (`MARQUEUR_RETIRE`) | 379 | 21 | 188 |
| Menace (`MENACE`) | 615 | 64 | 106 |
| Blink (`BLINK`) | 60 | 2 | 167 |
| Piétinement (`PIETINEMENT`) | 1 527 | 91 | 63 |
| Imblocable (`IMBLOCABLE`) | 498 | 51 | 98 |
| Meule (`MILL`) | 547 | 7 | 121 |
| Vigilance (`VIGILANCE`) | 1 040 | 100 | 28 |
| Ramp (`RAMP`) | 230 | 3 | 125 |
| Mort de cette carte (`MORT_SOI`) | 376 | 69 | 54 |
| Attachement (`ATTACHEMENT`) | 745 | 31 | 88 |
| Cycle (`CYCLE`) | 308 | 10 | 101 |
| Dégagement (`UNTAP`) | 754 | 67 | 26 |
| Gain de contrôle (`GAIN_CONTROLE`) | 320 | 8 | 85 |
| Dé ou pile ou face (`DE`) | 123 | 4 | 84 |
| Taxe (`TAXE`) | 112 | 24 | 63 |
| Blessures de combat au joueur (`DEGATS_COMBAT_JOUEUR`) | 0 | 80 | 0 |
| Retournement face visible (`FACE_VISIBLE`) | 267 | 11 | 60 |
| Réduction de coût (`REDUCTION`) | 509 | 14 | 57 |
| Indestructible (`INDESTRUCTIBLE`) | 467 | 50 | 20 |
| Destruction (`DESTRUCTION`) | 1 744 | 33 | 36 |
| Contresort (`CONTRESORT`) | 449 | 1 | 67 |
| Tour supplémentaire (`TOUR_SUPPLEMENTAIRE`) | 0 | 0 | 58 |
| Marqueur -1/-1 (`MARQUEUR_M1M1`) | 166 | 17 | 34 |
| Poison (`POISON`) | 132 | 46 | 3 |
| Linceul (`LINCEUL`) | 413 | 34 | 15 |
| Jour et nuit (`JOUR_NUIT`) | 0 | 0 | 49 |
| Transformation (`TRANSFORMATION`) | 238 | 2 | 45 |
| Terrain joué (`TERRAIN_JOUE`) | 0 | 43 | 0 |
| Terrain (landfall) (`TERRAIN`) | 0 | 35 | 0 |
| Protection / ward (`PROTECTION`) | 632 | 16 | 18 |
| Trésor (`TRESOR`) | 351 | 14 | 7 |
| Seuil de points de vie (`SEUIL_VIE`) | 0 | 21 | 0 |
| Donjon (`DONJON`) | 37 | 16 | 0 |
| Expérience (`EXPERIENCE`) | 0 | 16 | 0 |
| Énergie (`ENERGIE`) | 137 | 4 | 0 |
| Monarque / initiative (`MONARQUE`) | 84 | 2 | 1 |
| Prolifération (`PROLIFERATION`) | 97 | 2 | 0 |

## Exemples, nœud par nœud

Quelques cartes de chaque écart, mêlées d'un ordre stable : c'est là qu'on juge laquelle des deux lectures a raison.

### Jeton de créature (`JETON`)

- déclencheur, texte seul (1) : Shichifukujin Dragon
- déclencheur, Forge seul (979) : Tinker, Passenger Ferry, Trickster's Talisman, Descendants' Fury, Nature's Chosen, Wilhelt, the Rotcleaver, Urza, Lord High Artificer, Thundering Chariot
- production, texte seul (38) : Clown Extruder, Concession Stand, Safana, Calimport Cutthroat, Gallery of Legends, The Crab Queen, Seize the Soul, Ornitharch, Old-Growth Troll
- production, Forge seul (609) : Ant-Man's Army, Agate Instigator, Thrash // Threat, Magnifying Glass, Bleeding Edge, Starscape Cleric, Stadium Headliner, Orcish Medicine

### Engagement (`ENGAGEMENT`)

- déclencheur, texte seul (13) : Lieutenant Hikaru Sulu, Unbound Flourishing, Ertha Jo, Frontier Mentor, Crackdown Construct, Ceaseless Searblades, Verrak, Warped Sengir, Neerdiv, Devious Diver, Elrond, Moon-Reader
- déclencheur, Forge seul (143) : Nature's Chosen, Urza, Lord High Artificer, Crackleburr, Captain Jean-Luc Picard, Royal Decree, Heritage Druid, Aryel, Knight of Windgrace, Leyline Dowser
- production, texte seul (426) : Wall of Frost, Raffine's Tower, Goblin Dirigible, Undersea Invader, Hurr Jackal, Tangle, Dungeon Crawler, Glacial Floodplain
- production, Forge seul (950) : Telekinetic Bonds, Passenger Ferry, Nature's Chosen, Urza, Lord High Artificer, Wand of Wonder, Stella Lee, Wild Card, Bösium Strip, Thundering Chariot

### Récursion (`RECURSION`)

- production, texte seul (111) : Necrogen Communion, Elemental Time Flamingo, Oathkeeper, Takeno's Daisho, Syrix, Carrier of the Flame, Angel of Condemnation, Test of Priorities, Raffine's Guidance, Sproutback Trudge
- production, Forge seul (1 260) : Debtors' Knell, Cosmic Rebirth, Fated Return, Bone Dragon, Ares, God of War, Shattered Perception, Sneaky Snacker, Bösium Strip

### Arrivée en jeu (`ETB`)

- déclencheur, texte seul (13) : Curse of the Restless Dead, Ultron the Annihilator, Borg Cube, Olinda the Oblivious, K't'inga-Class Battle Cruiser, Vaultborn Tyrant, Invader Parasite, Captain Kathryn Janeway
- déclencheur, Forge seul (1 109) : Tinker, Passenger Ferry, Trickster's Talisman, Descendants' Fury, Nature's Chosen, Wilhelt, the Rotcleaver, Urza, Lord High Artificer, Celebrity Fencer

### Marqueur +1/+1 (`MARQUEUR`)

- déclencheur, texte seul (6) : Wickersmith's Tools, Danny Pink, Flourishing Defenses, Auntie Ool, Cursewretch, Bioessence Hydra, U.S.S. Enterprise-D, Galaxy-Class
- déclencheur, Forge seul (212) : Winding Constrictor, Myojin of Cryptic Dreams, Arcane Spyglass, Vat of Rebirth, The Great Goblin, Rushwood Grove, Moss-Pit Skeleton, Sporesower Thallid
- production, texte seul (243) : Arcane Archery, Ainok Artillerist, Dodecapod, Namor, Scourge of the Seas, Embalmed Brawler, Glistening Sphere, Chorus of the Conclave, Surge Conductor
- production, Forge seul (611) : Abigale, Poet Laureate, Winding Constrictor, Sinuous Vermin, Gruul Beastmaster, Truefire Captain, Honored Hierarch, Grand Entryway // Elegant Rotunda, Bleeding Edge

### Exil (`EXIL`)

- déclencheur, Forge seul (43) : Bone Dragon, Chitinous Crawler, Say Its Name, Angel of Grace, Necropolis, Baron Helmut Zemo, Coin of Fate, Nettling Host
- production, texte seul (841) : Akoum Stonewaker, Liliana's Other Contract, Urza, Lord High Artificer, Kianne, Dean of Substance, Void Shatter, Wand of Wonder, Bösium Strip, Red Sun's Twilight
- production, Forge seul (150) : Bone Dragon, Twinblade Geist, Galedrifter, Dig Through Time, Temporal Aperture, Katilda, Dawnhart Martyr, Murderous Cut, Chitinous Crawler

### Stax (`STAX`)

- production, texte seul (579) : Slipstream Eel, Wu Warship, Deep Space Scan, Toxic Stench, Nezumi Cutthroat, Lambholt Pacifist, Murderous Spoils, Starscape Cleric
- production, Forge seul (338) : Wall of Frost, Dosan the Falling Leaf, Send to Sleep, Marooned, Tangle, Meekstone, Locked in the Cemetery, Teferi, Mage of Zhalfir

### Mise au cimetière (`MIS_AU_CIMETIERE`)

- déclencheur, texte seul (3) : Raphael, Fiendish Savior, Dimir Strandcatcher, Cloakwood Hermit
- déclencheur, Forge seul (126) : Bone Dragon, Grolnok, the Omnivore, Devourer of Memory, Kroxa and Kunoros, Dig Through Time, Bloodchief Ascension, Murderous Cut, Syr Konrad, the Grim
- production, texte seul (70) : Incubator Drone, Glaring Fleshraker, Ulamog, the Infinite Gyre, Void Attendant, Progenitus, Sifter of Skulls, Magus of the Will, Eldrazi Skyspawner
- production, Forge seul (699) : Tinker, Loch Dragon, Trickster's Talisman, Descendants' Fury, Wilhelt, the Rotcleaver, Soul Servitude, Farsight Ritual, Powerstone Fracture

### Sacrifice (`SACRIFICE`)

- déclencheur, texte seul (8) : Briarbridge Patrol, Magik, Illyana Rasputin, Elanor Gardner, Phoenix Fleet Airship, Urza's Miter, Ashnod the Uncaring, Elder Spawn, Shichifukujin Dragon
- déclencheur, Forge seul (150) : Time Sieve, Syr Ginger, the Meal Ender, Sloppity Bilepiper, Dragon's Herald, Bloodboil Sorcerer, Angel's Herald, Village Elder, Cateran Overlord
- production, texte seul (408) : Shivan Wumpus, Purphoros's Intervention, Dark Depths, Incubator Drone, Deathknell Kami, Graven Archfiend, Bone Shards, Louisoix's Sacrifice
- production, Forge seul (289) : Farsight Ritual, Time Sieve, Artisan of Kozilek, Syr Ginger, the Meal Ender, Distended Mindbender, Profaner of the Dead, Sloppity Bilepiper, Hellkite Hatchling

### Pioche (`PIOCHE`)

- déclencheur, texte seul (1) : Bullseye, Death Dealer
- déclencheur, Forge seul (321) : Loch Dragon, Soul Servitude, Stitchwing Skaab, Krang, the All-Powerful, Elaborate Firecannon, Princess Irulan Corrino, Ormos, Archive Keeper, Insidious Dreams
- production, texte seul (105) : Simon, Wild Magic Sorcerer, Pavel Chekov, First Posting, Vnwxt, Verbose Host, Missy, Watchful Naga, Laboratory Maniac, Skeleton Key, Messenger Jays
- production, Forge seul (428) : Deep Space Scan, Shattered Perception, Raphael's Technique, Atlantean Skirmisher, Swordsman, Sharp Scoundrel, Invasion of New Phyrexia, Kamigawa Charm, Varina, Lich Queen

### Autre marqueur (`MARQUEUR_AUTRE`)

- déclencheur, Forge seul (173) : Myojin of Cryptic Dreams, Arcane Spyglass, Vat of Rebirth, Rushwood Grove, Sporesower Thallid, Sigurd, Jarl of Ravensthorpe, Slumbering Walker, Torture Chamber
- production, texte seul (72) : Jace, Reality Sculptor, Unstoppable Slasher, Captain Jean-Luc Picard, Sigurd, Jarl of Ravensthorpe, Garruk, Cursed Huntsman, The Triumph of Anax, Garnet, Princess of Alexandria, Heliophial
- production, Forge seul (605) : Smokestack, Spiteful Squad, Aquitect's Will, Kianne, Dean of Substance, Myojin of Cryptic Dreams, Essence Channeler, Dark Depths, Fully Grown

### Mort de créature (`MORT`)

- déclencheur, texte seul (35) : Splinter, the Mentor, Nadier, Agent of the Duskenel, Ninth Bridge Patrol, Syr Vondam, Sunstar Exemplar, Rat King, Pale Piper, Avarice Amulet, The Ozolith, Resourceful Defense
- déclencheur, Forge seul (223) : Bone Dragon, Great Fierce Bee, Kroxa and Kunoros, Seer of Stolen Sight, Dig Through Time, Dread Slaver, The Skullspore Nexus, Murderous Cut
- production, texte seul (49) : Incubator Drone, Glaring Fleshraker, Void Attendant, Sifter of Skulls, Eldrazi Skyspawner, Skittering Precursor, Carrier Thrall, Spawnsire of Ulamog
- production, Forge seul (516) : Tinker, Trickster's Talisman, Descendants' Fury, Wilhelt, the Rotcleaver, Farsight Ritual, Powerstone Fracture, Improvised Club, Wedding Security

### Vol (`VOL`)

- production, texte seul (686) : Foundry of the Consuls, Winter Blast, Tightening Coils, Rally of Wings, Dark Depths, Descend upon the Sinful, Goro-Goro and Satoru, Yotia Declares War
- production, Forge seul (72) : Kianne, Dean of Substance, Invasion of Tarkir, Tony Stark, Smoldering Egg, Jugan Defends the Temple, Devoted Grafkeeper, The Modern Age, Skanos, Dragon Vassal

### Départ du champ de bataille (`LTB`)

- déclencheur, Forge seul (43) : Carom, Myra the Magnificent, Hero of Bretagard, Hazduhr the Abbot, Syr Vondam, Sunstar Exemplar, Kor Dirge, Lucius the Eternal, Aang, Airbending Master
- production, texte seul (186) : Detention Chariot, Isolation Zone, Incubator Drone, Glorious Protector, Memory Trap, Trapped in the Screen, Angel of Condemnation, Idol of Endurance
- production, Forge seul (527) : Tinker, Trickster's Talisman, Descendants' Fury, Wilhelt, the Rotcleaver, Farsight Ritual, Powerstone Fracture, Improvised Club, Wedding Security

### Filtrage / impulsion (`IMPULSE`)

- déclencheur, Forge seul (31) : Dimir Spybug, Galadriel of Lothlórien, Mirko, Obsessive Theorist, Legolas, Counter of Kills, Matoya, Archon Elder, River Song, Chance-Met Elves, Blood Operative
- production, texte seul (146) : Vivien's Invocation, Kaslem's Stonetree, Ajani, Outland Chaperone, Risen Reef, Sarinth Steelseeker, Storybook Ride, Nissa, Genesis Mage, Callous Deceiver
- production, Forge seul (541) : Cryptic Pursuit, Grisly Salvage, Urza, Lord High Artificer, Grolnok, the Omnivore, Necromentia, Crown of Convergence, Sage Owl, Sylvan Messenger

### Dégâts (`DEGATS`)

- déclencheur, texte seul (26) : Gonti, Night Minister, Latulla's Orders, Arvad of the Weatherlight, Gix, Yawgmoth Praetor, The Master, Mesmerist, Strixhaven Stadium, Firkraag, Cunning Instigator, The Rani
- déclencheur, Forge seul (111) : Forethought Amulet, Gisela, Blade of Goldnight, Torbran, Thane of Red Fell, Sigil of Sleep, Sower of Discord, Smaug the Impenetrable, Fall of Cair Andros, Sulfuric Vapors
- production, texte seul (80) : Mysidian Elder, Outlaws' Merriment, Right of Vengeance, Aegis of Honor, Vampire Champion Fury, Raphael, Fiendish Savior, Tunnel of Love, Missy
- production, Forge seul (392) : Arcbond, Truefire Captain, Purphoros's Intervention, Laccolith Whelp, Armed Response, Invasion of Tarkir, Pandemonium, Spitting Earth

### Révélation (`REVELATION`)

- déclencheur, texte seul (6) : Rowen, Inquisitor Eisenhorn, Primitive Etchings, God-Eternal Kefnet, Keranos, God of Storms, Priority Boarding
- production, texte seul (345) : Oath of Nissa, Eclipsed Merrow, Recruitment Officer, Grisly Salvage, Blossom Prancer, Necroblossom Snarl, Sylvan Messenger, Vessel of Nascency
- production, Forge seul (238) : Karlov's Crossbow, The Celestial Toymaker, Distended Mindbender, Petals of Insight, Wanderguard Sentry, Dream Harvest, Reversal of Fortune, Risen Reef

### Gain de vie (`GAIN_VIE`)

- déclencheur, texte seul (1) : Ajani, Strength of the Pride
- déclencheur, Forge seul (26) : Alhammarret's Archive, Plague Drone, Angel of Vitality, Rain of Gore, Phial of Galadriel, Nefarious Lich, Sulfuric Vortex, Knight of Dawn's Light
- production, texte seul (126) : Outlaws' Merriment, Elemental Time Flamingo, Orcish Medicine, Wall of Shards, Unbreakable Bond, Mavren Fein, Dusk Apostle, Reluctant Role Model, Invigorate
- production, Forge seul (371) : Noble Purpose, Vigorbloom Vanguard, Gul Dukat, Colonial Prefect, Heliod's Intervention, Kamigawa Charm, Syr Ginger, the Meal Ender, Zenith Flare, Tezzeret, Master of the Bridge

### Tuteur (`TUTEUR`)

- production, texte seul (113) : Celebrate the Harvest, Mana Severance, Harvest Season, Point the Way, Nissa, Who Shakes the World, Surveyor's Scope, Windswept Heath, Evolving Door
- production, Forge seul (406) : Jester's Mask, Vivien's Invocation, Acquire, Kaslem's Stonetree, Great Gilded Boat, Ajani, Outland Chaperone, Worldweave, Risen Reef

### Défausse (`DEFAUSSE`)

- déclencheur, texte seul (4) : Bullseye, Death Dealer, The Raven Man, Tinybones, Trinket Thief, Mysterio's Mirage
- déclencheur, Forge seul (168) : Bone Dragon, Stitchwing Skaab, Kroxa and Kunoros, Curator of Mysteries, Ormos, Archive Keeper, Dig Through Time, Patrol Hound, Shinen of Stars' Light
- production, texte seul (176) : Forbidden Ritual, Sabin, Master Monk, Alpharael, Stonechosen, Bone Shards, Thrilling Discovery, Tweeze, Dodecapod, Oath of Lim-Dûl
- production, Forge seul (139) : Atlantean Skirmisher, Stitchwing Skaab, Swordsman, Sharp Scoundrel, Invasion of New Phyrexia, Ormos, Archive Keeper, Namor, Scourge of the Seas, Leave // Chance, Ulgrotha Charm

### Copie (`COPIE`)

- production, texte seul (12) : Mirrormind Crown, Simon, Wild Magic Sorcerer, Moonlit Meditation, Sunken Palace, Mystic Reflection, Esix, Fractal Bloom, Delina, Wild Mage, Zndrsplt's Judgment
- production, Forge seul (442) : The Wise Sable, Stella Lee, Wild Card, Myojin of Cryptic Dreams, March from Velis Vel, Eyes in the Skies, Chameleon, Master of Disguise, Shapeshifter's Marrow, Gandalf the Grey

### Boost temporaire (`BOOST`)

- production, texte seul (84) : Urza, Lord High Artificer, Vampire Champion Fury, Skirk Ridge Exhumer, Sound the Call, Rhonas's Stalwart, Form a Posse, The Bear Force Pilot, Dáin Ironfoot
- production, Forge seul (347) : Knight of Sursi, Benalish Cavalry, Agent of Atlas, Seeker of the Way, Wing Commando, Invasion of New Phyrexia, Flower // Flourish, Lam, Storm Crane Elder

### Lancement de sort (`LANCEMENT`)

- déclencheur, texte seul (51) : Mysidian Elder, Prototype X-8, Preston, the Vanisher, Eshki Dragonclaw, Predatory Advantage, Call of the Full Moon, Hurkyl, Master Wizard, Volo, Itinerant Scholar
- déclencheur, Forge seul (373) : Grip of Chaos, Battlefield Thaumaturge, Keeper of Secrets, Agent of Atlas, Dragonblood Twins, Wing Commando, Dawnbringer Charioteers, Centaur Battlemaster

### Renvoi en main (`BOUNCE`)

- production, texte seul (330) : Ares, God of War, Greasefang, Okiba Boss, Nimraiser Paladin, Petals of Insight, Dungeon Crawler, Fell Shepherd, Once and Future, Zareth San, the Trickster
- production, Forge seul (41) : Overburden, Satsuki, the Living Lore, Uyo, Silent Prophet, Bob, Reluctant HYDRA Agent, Shepherd of the Flock, Alrund, God of the Cosmos, Scalding Viper, Teferi, Temporal Pilgrim

### Retrait de marqueur (`MARQUEUR_RETIRE`)

- déclencheur, Forge seul (148) : Myojin of Cryptic Dreams, Arcane Spyglass, Vat of Rebirth, Rushwood Grove, Sporesower Thallid, Torture Chamber, Deity of Scars, Spore Flower
- production, texte seul (21) : Gavel of the Righteous, Magmatic Sprinter, Shape of the Wiitigo, Hungry Hungry Heifer, Inhumaniac, Soul Echo, Bounty of the Hunt, Junk Golem
- production, Forge seul (188) : Final Act, Myojin of Cryptic Dreams, Price of Betrayal, Arcane Spyglass, Vat of Rebirth, Eventide's Shadow, Rushwood Grove, Polukranos, Unchained

### Perte de vie (`PERTE_VIE`)

- déclencheur, texte seul (1) : Luminarch Ascension
- déclencheur, Forge seul (4) : Sahir, Visitor in Darkness, Shadowheart, Sharran Cleric, Kefka, Court Mage, Ob Nixilis, Captive Kingpin
- production, texte seul (15) : Elemental Time Flamingo, Tatsunari, Toad Rider, Chancellor of the Dross, Blind Hunter, This Is How It Ends, Damocles Base, Sword of Kang, Jack-in-the-Mox, Herald of Hadar
- production, Forge seul (335) : Mortis Dogs, Gul Dukat, Colonial Prefect, Filthy Cur, Terisiare's Devastation, Castle Locthwain, Alpharael, Stonechosen, Eventide's Shadow, Unstoppable Slasher

### Attaque (`ATTAQUE`)

- déclencheur, texte seul (47) : Fathom Fleet Captain, Farrel's Mantle, Avengers Quinjet, Creepy Puppeteer, Ultron the Annihilator, Dáin Ironfoot, The Coming of Galactus, Spider-Mobile
- déclencheur, Forge seul (288) : Hired Claw, Invasion of Tarkir, Neyali, Suns' Vanguard, Gornog, the Red Reaper, Jace, Reality Sculptor, The Revelations of Ezio, Inquisitorial Rosette, Varina, Lich Queen

### Mana (`MANA`)

- production, texte seul (88) : Incubator Drone, Corpsehatch, Harold and Bob, First Numens, Glaring Fleshraker, Jugan Defends the Temple, David and Carol Marcus, Creators, Gate to the Citadel, Void Attendant
- production, Forge seul (216) : Blinkmoth Urn, Reality Twist, Song-Mad Treachery, Clive, Ifrit's Dominant, Jadzia Dax, Living Legacy, Malakir Rebirth, Fell the Profane, Nissa, Who Shakes the World

### Début du tour (`DEBUT_TOUR`)

- déclencheur, texte seul (272) : Will Riker, First in the Field, Greasefang, Okiba Boss, Zimone, Paradox Sculptor, Gavel of the Righteous, Nahiri's Machinations, Warg Rider, Rionya, Fire Dancer, Gandalf, Party Guest
- déclencheur, Forge seul (19) : Desert Were-Worm, Backdraft, Elkin Lair, Imaginary Threats, Mana Vapors, Cobra Trap, Blinding Beam, Night Shift of the Living Dead

### Blessures de combat au joueur (`DEGATS_COMBAT_JOUEUR`)

- déclencheur, texte seul (29) : Serpent Generator, Gríma, Saruman's Footman, Sigil of Sleep, Vraska the Unseen, Forgeborn Phoenix, Gimli of the Glittering Caves, Vraska, Swarm's Eminence, Phage the Untouchable
- déclencheur, Forge seul (163) : Trickster's Talisman, Descendants' Fury, Goro-Goro and Satoru, Right of Vengeance, Heroes in a Half Shell, Killian's Confidence, Quartzwood Crasher, Contested Game Ball
- production, texte seul (80) : Trickster's Talisman, Flitterwing Nuisance, Shadow, Mysterious Assassin, Vorosh, the Hunter, Numot, the Devastator, Screeching Silcaw, Lost in Memories, Intet, the Dreamer

### Terrain (landfall) (`TERRAIN`)

- déclencheur, texte seul (8) : Call the Mountain Chocobo, Field of the Dead, Gysahl Greens, Eye of Singularity, Choco-Comet, Summon: Fat Chocobo, Staff of the Mind Magus, Chocobo Camp
- déclencheur, Forge seul (206) : Akoum Stonewaker, Thranduil the Strategist, Retreat to Emeria, Eternity Vessel, Greensleeves, Maro-Sorcerer, Tato Farmer, Sunstar Expansionist, Lotus Cobra
- production, texte seul (35) : Exploration, Mina and Denn, Wildborn, Azusa's Many Journeys, Loot, Exuberant Explorer, Hugs, Grisly Guardian, Thranduil's Company, Explore, Escape to the Wilds

### Mise en bibliothèque (`MIS_EN_BIBLIO`)

- production, texte seul (60) : Wand of Wonder, Tunnel Vision, Munda, Ambush Leader, Temporal Aperture, Thicket Elemental, Bamboozle, Gutless Plunderer, Rowan's Grim Search
- production, Forge seul (184) : Rebel Informer, Guidance Failure, Wand of Vertebrae, Invasion of New Phyrexia, Unlucky Drop, Stream of Consciousness, Malevolent Chandelier, Diver Skaab

### Célérité (`CELERITE`)

- production, texte seul (186) : Akoum Stonewaker, Red Sun's Twilight, Purphoros's Intervention, March from Velis Vel, Outlaws' Merriment, Right of Vengeance, Rionya, Fire Dancer, Goldwardens' Gambit
- production, Forge seul (49) : Gruul Beastmaster, Clamor Shaman, Touch of Vitae, Tony Stark, Invasion of Mercadia, Creepy Puppeteer, Uncivil Unrest, Altar of the Wretched

### Meule (`MILL`)

- déclencheur, Forge seul (100) : Bone Dragon, Kroxa and Kunoros, Dig Through Time, Murderous Cut, Chitinous Crawler, Say Its Name, Logic Knot, Treasure Cruise
- production, texte seul (7) : Chancellor of the Spires, Unassuming Gelatinous Serpent, Fateful Tempest, Trash Bin, Mole Man, Moloid Master, Bruvac the Grandiloquent, Deep Spawn
- production, Forge seul (121) : Tunnel Vision, Stinkweed Imp, Sarinth Steelseeker, Mind Funeral, Cruel Somnophage, Mirror-Mad Phantasm, Golgari Brownscale, Mind Grind

### Fin du tour (`FIN_TOUR`)

- déclencheur, texte seul (75) : Momo's Heist, Storybook Ride, Bank Job, Mardu Siegebreaker, Meek Attack, Thoughtweft's Call, Chandra, Flameshaper, Kardum, Patron of Flames
- déclencheur, Forge seul (145) : Aerith, Last Ancient, Celestine, the Living Saint, Chorale of the Void, Wall of Resistance, Case of the Gateway Express, Targ Wrangler, Scars of the Veteran, Raiders' Wake

### Prolifération (`PROLIFERATION`)

- déclencheur, Forge seul (172) : Myojin of Cryptic Dreams, Arcane Spyglass, Vat of Rebirth, Rushwood Grove, Sporesower Thallid, Slumbering Walker, Torture Chamber, Deity of Scars
- production, texte seul (2) : Tekuthal, Inquiry Dominus, Carnival Elephant Meteor

### Menace (`MENACE`)

- production, texte seul (64) : HYDRA Troopers, Hire a Crew, Common Black Removal, Dispatch Dispensary, Mirror Universe Intrusion, Blood Curdle, Rattleback Apothecary, Corpse Cobble
- production, Forge seul (106) : Nezumi Cutthroat, Bonded Herdbeast, Woebearer, Dust Elemental, Inkfathom Witch, Okiba Reckoner Raid, Skanos, Dragon Vassal, Ratcatcher

### Blink (`BLINK`)

- production, texte seul (2) : Moldgraf Monstrosity, Eternal Acrobat Toast
- production, Forge seul (167) : Clive, Ifrit's Dominant, Niko, Light of Hope, Angel of Condemnation, Long River Lurker, Nissa, Vastwood Seer, Test of Priorities, Okiba Reckoner Raid, The Battle of Dragon Brothers

### Entretien (`ENTRETIEN`)

- déclencheur, texte seul (45) : Vesuvan Doppelganger, Academy Loremaster, Lord Skitter's Blessing, Omen Machine, Wiretapping, Maralen of the Mornsong, Grafted Skullcap, Cycle of Life
- déclencheur, Forge seul (110) : Opulent Clomper, Tooth Collector, Vengeful Strangler, Traumatic Prank, Firemane Angel, Stingerquill Voxmancer, Oblivious Bookworm, Cultist of the Absolute

### Piétinement (`PIETINEMENT`)

- production, texte seul (91) : Akoum Stonewaker, Purphoros's Intervention, Outlaws' Merriment, Fully Grown, Shifting Ceratops, Jetpack Death Seltzer, Drizzt Do'Urden, The Coming of Galactus
- production, Forge seul (63) : Invasion of Tarkir, Jugan Defends the Temple, Huntmaster of the Fells, Lone Rider, Hidetsugu Consumes All, Aang, Swift Savior, Altar of the Wretched, Phyrexian Splicer

## Ce que les tables de Forge ne lisent pas encore

Une unité qui emploie un de ces éléments est relue dans sa description, par la lecture du texte : la carte ne perd
rien, mais ce morceau-là garde les défauts du texte. Classés par nombre de cartes.

| Élément | cartes | exemples |
|---|---|---|
| `repl:RollDice` | 4 | Wyll, Blade of Frontiers, Vedalken Squirrel-Whacker, Barbarian Class |
| `stat:Activations` | 3 | Wonder Man, Hollywood Hero, Birgi, God of Storytelling |
| `trig:Exiled` | 3 | Market Gnome, Soulherder, Captain Marvel, Shooting Star |
| `stat:CanAttackIfHaste` | 3 | Frenzied Saddlebrute, Chaos Lord, Instill Energy |
| `stat:CantBeCopied` | 3 | Choreographed Sparks, Display of Power, See Double |
| `api:Regeneration` | 3 | Mossbridge Troll, Knight of the Holy Nimbus, Clergy of the Holy Nimbus |
| `stat:MustTarget` | 3 | Coalition Flag, Standard Bearer, Coalition Honor Guard |
| `trig:ConjureAll` | 3 | Crescendo Conductor, Thayan Evokers, Third Little Pig |
| `trig:CounterTypeAddedAll` | 3 | Danny Pink, Stalwart Successor, Putrid Hexhag |
| `api:ExchangeLifeVariant` | 3 | Tree of Redemption, Evra, Halcyon Witness, Tree of Perdition |
| `trig:Connives` | 3 | Ultron, Unlimited, Glorious Purpose, Iron Monger |
| `stat:ManaRestriction` | 3 | Myr Superion, Hogaak, Arisen Necropolis, Imperiosaur |
| `api:BidLife` | 3 | Illicit Auction, Pain's Reward, Mages' Contest |
| `trig:SeekAll` | 3 | Vexyr, Ich-Tekik's Heir, Lurker in the Deep, Val |
| `trig:MilledAll` | 3 | Mirelurk Queen, Screeching Scorchbeast, The Wise Mothman |
| `trig:AbilityResolves` | 3 | Tom Bombadil, Tyvar the Bellicose, Narci, Fable Singer |
| `api:RemoveFromMatch` | 2 | Look at Me, I'm the DCI, Blacker Lotus |
| `api:GameDrawn` | 2 | Celestial Convergence, Divine Intervention |
| `api:FlipOntoBattlefield` | 2 | Falling Star, Chaos Orb |
| `stat:CantLoseLife` | 2 | Courageous Resolve, Everybody Lives! |
| `api:ExchangeTextBox` | 2 | Exchange of Words, Deadpool, Trading Card |
| `trig:TapAll` | 2 | Deeproot Pilgrimage, Rewrite History |
| `repl:RemoveCounter` | 2 | Fear of Sleep Paralysis, Deification |
| `api:HealDamage` | 2 | Wolverine, Fierce Fighter, Dr. McCoy, Surly Surgeon |
| `api:ActivateAbility` | 2 | Pygmy Hippo, Drain Power |
| `stat:CantPhaseOut` | 2 | Ertai's Familiar, Spatial Binding |
| `trig:CollectEvidence` | 2 | Surveillance Monitor, Evidence Examiner |
| `api:SwitchBlock` | 2 | General Jarkeld, Sorrow's Path |
| `api:ChangeX` | 2 | Glava, Five-Advents Mage, Unbound Flourishing |
| `trig:Milled` | 2 | Infesting Radroach, Glowing One |
| `api:ExchangePower` | 2 | Serene Master, High Fae Prankster |
| `stat:DrawFromBottom` | 2 | Lantern of Undersight, River Song |
| `trig:MilledOnce` | 2 | Zellix, Sanity Flayer, Lo and Li, Royal Advisors |
| `stat:CombatDamageNegatePower` | 2 | Zimone the Calculating, Loot, the Anomaly |
| `api:EndCombatPhase` | 2 | Merciful Mandate, Mandate of Peace |
| `stat:CantBeBeamedUp` | 2 | Marooned, Scotty, Miracle Worker |
| `api:LosePerpetual` | 2 | Racketeer Boss, Pass the Torch |
| `api:ReverseTurnOrder` | 1 | Aeon Engine |
| `stat:CantBeSuspected` | 1 | Airtight Alibi |
| `stat:IgnoreShroud` | 1 | Autumn Willow |
| `api:RemoveFromGame` | 1 | AWOL |
| `stat:CanAdapt` | 1 | Biomancer's Familiar |
| `trig:ManaAdded` | 1 | Caged Sun |
| `trig:CaseSolved` | 1 | Case File Auditor |
| `trig:FlippedCoinOnce` | 1 | Chira, All In |
| `api:AdvanceCrank` | 1 | Clock of DOOOOOOOOOOOOM! |
| `stat:ForetellAnyTurn` | 1 | Cosmos Charger |
| `api:ExchangeControlVariant` | 1 | Cultural Exchange |
| `stat:CanBlockIfReach` | 1 | Dragon Hunter |
| `stat:FlipCoinMod` | 1 | Edgar, King of Figaro |
| `stat:SurveilNum` | 1 | Enhanced Surveillance |
| `stat:WitherDamage` | 1 | Everlasting Torment |
| `api:DigUntil |Valid$ Card.nonLand` | 1 | Exploratory Mission |
| `api:TaporUntapAll` | 1 | Faces of the Past |
| `stat:PlotZone` | 1 | Fblthp, Lost on the Range |
| `trig:PayLife` | 1 | Font of Agonies |
| `api:RollPlanarDice` | 1 | Fractured Powerstone |
| `stat:ColorlessDamageSource` | 1 | Ghostly Flame |
| `trig:SpellAbilityCopy` | 1 | Grip of Chaos |
| `stat:CantGainControl` | 1 | Guardian Beast |
