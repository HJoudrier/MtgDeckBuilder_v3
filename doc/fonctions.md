# Inventaire des fonctions

*Écrit par `node outils/genDoc.js` à partir des sources — ne pas modifier à la main.*

Le rôle de chaque fonction est repris du commentaire qui la précède dans le code : ce
fichier est un index, la source reste la référence. Pour l'ordre dans lequel ces
fonctions s'appellent, voir [PARCOURS.md](../PARCOURS.md) ; pour l'architecture,
[README.md](../README.md).

**1297 fonctions**, 185 modules, 1232 Ko de JavaScript.

| Module | Rôle | Fonctions | Lignes |
|---|---|--:|--:|
| [`reglesEffets.js`](#jsregleseffetsjs) | Le vocabulaire du graphe : nœuds, effets, déclencheurs | 0 | 273 |
| [`effets.js`](#jseffetsjs) | Qualifier un déclencheur, un effet, et les accorder | 11 | 258 |
| [`synergies.js`](#jssynergiesjs) | Ce qu'une carte apporte à une autre | 5 | 61 |
| [`cartesBrutes.js`](#jscartesbrutesjs) | La base livrée avec l'atelier | 0 | 141 |
| [`analyse.js`](#jsanalysejs) | Lire une carte : coût, capacités, déclencheurs, effets | 5 | 148 |
| [`archetypesLibelles.js`](#jsarchetypeslibellesjs) | Le nom français des thèmes EDHREC | 0 | 83 |
| [`categories.js`](#jscategoriesjs) | Les rôles d'une carte | 2 | 126 |
| [`mana.js`](#jsmanajs) | Ce qu'une carte demande en mana, et ce qu'elle en produit | 11 | 211 |
| [`impressions.js`](#jsimpressionsjs) | Les éditions d'une carte, et celle qu'on possède | 7 | 74 |
| [`cartes.js`](#jscartesjs) | La base de cartes et ses index | 19 | 213 |
| [`liens.js`](#jsliensjs) | Le tri des liens : interaction précise ou déclencheur large | 6 | 74 |
| [`etat.js`](#jsetatjs) | État global de l'application & utilitaires | 1 | 196 |
| [`decks.js`](#jsdecksjs) | Les decks, et celui sur lequel on travaille | 12 | 196 |
| [`archetypesSets.js`](#jsarchetypessetsjs) | Deux vocabulaires venus du dehors | 12 | 173 |
| [`filtres.js`](#jsfiltresjs) | Les critères de la fenêtre « Filtres » | 14 | 157 |
| [`restrictions.js`](#jsrestrictionsjs) | La restriction d'un deck | 12 | 128 |
| [`retenue.js`](#jsretenuejs) | Ce qui reste après les filtres | 11 | 135 |
| [`catalogueEtat.js`](#jscatalogueetatjs) | L'archive en mémoire, et les nœuds qu'elle touche | 5 | 71 |
| [`groupes.js`](#jsgroupesjs) | Grouper et trier les listes de cartes | 7 | 232 |
| [`barreGroupes.js`](#jsbarregroupesjs) | L'enveloppe d'un groupe, et la mise en page d'une liste | 8 | 118 |
| [`marche.js`](#jsmarchejs) | Marché Cardmarket, estimations & panier d'achat | 5 | 69 |
| [`achats.js`](#jsachatsjs) | Ce qu'il reste à acheter | 9 | 143 |
| [`oracleTexte.js`](#jsoracletextejs) | Préparer le texte oracle pour le compilateur | 7 | 122 |
| [`oracleMotsCles.js`](#jsoraclemotsclesjs) | Les mots-clés que le moteur sait jouer | 3 | 75 |
| [`oracleCouts.js`](#jsoraclecoutsjs) | Lire un coût : celui d'un sort, celui d'une capacité | 4 | 81 |
| [`oracleCibles.js`](#jsoracleciblesjs) | Une seule grammaire pour désigner des objets | 6 | 172 |
| [`oracleEffetsA.js`](#jsoracleeffetsajs) | Les motifs d'effet : dégâts, vie, cartes, retraits | 3 | 140 |
| [`oracleEffetsB.js`](#jsoracleeffetsbjs) | Les motifs d'effet : jetons, marqueurs, pompes, | 4 | 198 |
| [`oracleDeclencheurs.js`](#jsoracledeclencheursjs) | Lire ce qui déclenche une capacité | 4 | 88 |
| [`oracleStatiques.js`](#jsoraclestatiquesjs) | Lire une capacité statique, et la façon d'entrer | 4 | 85 |
| [`oracleLignes.js`](#jsoraclelignesjs) | Ranger chaque ligne d'une carte | 7 | 143 |
| [`definitions.js`](#jsdefinitionsjs) | D'une carte à sa définition de jeu | 12 | 191 |
| [`forgeScript.js`](#jsforgescriptjs) | Lire un script de carte de Forge | 8 | 124 |
| [`forgeCouverture.js`](#jsforgecouverturejs) | Ce qu'une carte de Forge demande au moteur | 8 | 161 |
| [`jeuHasard.js`](#jsjeuhasardjs) | Le hasard semé du moteur | 5 | 52 |
| [`jeuEtat.js`](#jsjeuetatjs) | Une partie : ses joueurs, ses objets, ses zones | 20 | 213 |
| [`jeuCaracteristiques.js`](#jsjeucaracteristiquesjs) | Ce qu'un permanent est en ce moment | 9 | 112 |
| [`jeuCibles.js`](#jsjeuciblesjs) | Juger un objet contre un descripteur | 10 | 147 |
| [`jeuMana.js`](#jsjeumanajs) | La réserve de mana, et le paiement automatique | 10 | 178 |
| [`jeuOpsA.js`](#jsjeuopsajs) | Exécuter les opérations : références, dégâts, vie, | 9 | 213 |
| [`jeuOpsB.js`](#jsjeuopsbjs) | Exécuter les opérations : jetons, marqueurs, pompes, | 3 | 152 |
| [`jeuDeclencheurs.js`](#jsjeudeclencheursjs) | Des évènements aux capacités déclenchées | 6 | 121 |
| [`jeuEtatsDeJeu.js`](#jsjeuetatsdejeujs) | Les actions d'état, et un joueur qui perd | 2 | 92 |
| [`jeuLancer.js`](#jsjeulancerjs) | Ce qu'un joueur peut faire de sa priorité, et le faire | 10 | 179 |
| [`jeuActions.js`](#jsjeuactionsjs) | Exécuter une action choisie à la priorité | 7 | 179 |
| [`jeuVariantes.js`](#jsjeuvariantesjs) | Les autres façons de lancer et de payer | 18 | 260 |
| [`jeuDurees.js`](#jsjeudureesjs) | Ce qui dure : effets, déclencheurs retardés, retours | 10 | 137 |
| [`jeuPile.js`](#jsjeupilejs) | La priorité, la pile, la résolution | 5 | 115 |
| [`jeuCombat.js`](#jsjeucombatjs) | Attaquants, bloqueurs, dégâts de combat | 10 | 151 |
| [`jeuTour.js`](#jsjeutourjs) | Les étapes d'un tour | 5 | 110 |
| [`jeuPartie.js`](#jsjeupartiejs) | Une partie, du mélange à la fin | 2 | 58 |
| [`jeuPilote.js`](#jsjeupilotejs) | Dérouler une partie, question après question | 6 | 99 |
| [`jeuVue.js`](#jsjeuvuejs) | Ce qu'un joueur voit de la partie | 7 | 105 |
| [`jeuArrets.js`](#jsjeuarretsjs) | Quand demander à un joueur humain | 2 | 33 |
| [`forgeValide.js`](#jsforgevalidejs) | Le langage de filtres de Forge | 15 | 240 |
| [`forgeExpr.js`](#jsforgeexprjs) | Les quantités de Forge | 8 | 143 |
| [`forgeDefini.js`](#jsforgedefinijs) | Ce que `Defined$` désigne | 6 | 113 |
| [`forgeCout.js`](#jsforgecoutjs) | Lire un coût de Forge | 3 | 79 |
| [`forgeEffetsA.js`](#jsforgeeffetsajs) | Exécuter une capacité de Forge : le registre, la | 12 | 247 |
| [`forgeEffetsB.js`](#jsforgeeffetsbjs) | Les effets de Forge : regarder la bibliothèque, | 4 | 176 |
| [`forgeEffetsC.js`](#jsforgeeffetscjs) | Les effets de Forge : pompes, engagements, mana, | 4 | 125 |
| [`forgeEffetsD.js`](#jsforgeeffetsdjs) | Les effets de Forge qui durent : régénération, | 5 | 132 |
| [`forgeDeclencheurs.js`](#jsforgedeclencheursjs) | Quand une capacité déclenchée de Forge se | 8 | 108 |
| [`forgeStatiques.js`](#jsforgestatiquesjs) | Les capacités statiques de Forge | 8 | 129 |
| [`forgeRemplacements.js`](#jsforgeremplacementsjs) | Les remplacements de Forge (`R:`) | 7 | 101 |
| [`forgeMotsCles.js`](#jsforgemotsclesjs) | Les mots-clés de Forge (`K:`) | 3 | 123 |
| [`forgeDefinition.js`](#jsforgedefinitionjs) | D'un script de Forge à une définition de jeu | 12 | 235 |
| [`iaValeur.js`](#jsiavaleurjs) | Ce que vaut une carte, un permanent, un adversaire | 8 | 85 |
| [`iaChoix.js`](#jsiachoixjs) | Les choix du joueur automatique hors de la priorité | 8 | 122 |
| [`iaPriorite.js`](#jsiaprioritejs) | Ce que le joueur automatique fait de sa priorité | 10 | 196 |
| [`iaCombat.js`](#jsiacombatjs) | Attaquer et bloquer, pour le joueur automatique | 4 | 82 |
| [`iaAgent.js`](#jsiaagentjs) | Un joueur automatique | 1 | 34 |
| [`symboles.js`](#jssymbolesjs) | Les symboles de mana | 7 | 72 |
| [`champsJeu.js`](#jschampsjeujs) | Ce que le moteur de jeu demande à une carte | 7 | 91 |
| [`scryfallApplique.js`](#jsscryfallappliquejs) | Verser une réponse de Scryfall dans une carte | 2 | 148 |
| [`scryfall.js`](#jsscryfalljs) | La file d'attente vers Scryfall | 7 | 181 |
| [`recherches.js`](#jsrecherchesjs) | Les recherches nommées chez Scryfall | 10 | 208 |
| [`decksStockage.js`](#jsdecksstockagejs) | Les dossiers de deck, rangés et relus | 3 | 91 |
| [`stockage.js`](#jsstockagejs) | La sauvegarde locale | 9 | 289 |
| [`fenSauvegarde.js`](#jsfensauvegardejs) | Les sections « Sauvegarde » et « Catalogue » des paramètres | 6 | 200 |
| [`idb.js`](#jsidbjs) | Le magasin IndexedDB | 6 | 75 |
| [`nuagePaquet.js`](#jsnuagepaquetjs) | Ce qui voyage d'un appareil à l'autre | 7 | 123 |
| [`nuageFusion.js`](#jsnuagefusionjs) | Fusionner deux appareils sans rien perdre | 11 | 234 |
| [`nuageDropbox.js`](#jsnuagedropboxjs) | L'adaptateur Dropbox | 17 | 240 |
| [`nuage.js`](#jsnuagejs) | La synchronisation : sa configuration, et son calendrier | 12 | 275 |
| [`nuageDiagnostic.js`](#jsnuagediagnosticjs) | Éprouver la connexion, étape par étape | 3 | 86 |
| [`edhrec.js`](#jsedhrecjs) | Les statistiques d'EDHREC pour un commandant | 6 | 242 |
| [`edhrecForme.js`](#jsedhrecformejs) | Deviner la forme des pages de thèmes d'EDHREC | 7 | 142 |
| [`edhrecThemes.js`](#jsedhrecthemesjs) | L'index des thèmes EDHREC | 10 | 179 |
| [`sets.js`](#jssetsjs) | Les sets publiés par Scryfall | 8 | 156 |
| [`gameChangers.js`](#jsgamechangersjs) | La liste des « Game Changers » | 4 | 77 |
| [`archive.js`](#jsarchivejs) | Lire l'archive Scryfall | 11 | 226 |
| [`catalogue.js`](#jscataloguejs) | Tenir le catalogue à jour | 10 | 232 |
| [`candidats.js`](#jscandidatsjs) | Des enregistrements de l'archive aux cartes candidates | 14 | 261 |
| [`graphe.js`](#jsgraphejs) | Visualisation circulaire interactive des capacités | 4 | 169 |
| [`stats.js`](#jsstatsjs) | Statistiques, répartitions & courbes de mana | 5 | 113 |
| [`notation.js`](#jsnotationjs) | La note d'une carte candidate | 5 | 239 |
| [`vivier.js`](#jsvivierjs) | Le vivier des candidates, et son empreinte | 9 | 204 |
| [`sugOrdre.js`](#jssugordrejs) | L'ordre gelé des propositions | 6 | 80 |
| [`sugCommandants.js`](#jssugcommandantsjs) | Les commandants du deck, en tête de l'onglet EDHREC | 4 | 139 |
| [`sugListes.js`](#jssuglistesjs) | Le fond commun des trois listes de propositions | 11 | 142 |
| [`sugGraphe.js`](#jssuggraphejs) | La section du graphe : ce qui se branche sur les nœuds | 1 | 41 |
| [`sugEdhrec.js`](#jssugedhrecjs) | La section EDHREC : ce que les decks recensés recommandent | 1 | 52 |
| [`sugCatalogue.js`](#jssugcataloguejs) | La section du catalogue : tout le classement | 1 | 34 |
| [`suggestions.js`](#jssuggestionsjs) | Les trois sections des propositions | 13 | 252 |
| [`decksSection.js`](#jsdeckssectionjs) | La section « Mes decks » | 4 | 103 |
| [`wishlistSection.js`](#jswishlistsectionjs) | La section « Liste d'achats » | 3 | 68 |
| [`collection.js`](#jscollectionjs) | La section Collection | 9 | 156 |
| [`fenImport.js`](#jsfenimportjs) | Importer une liste de cartes | 4 | 222 |
| [`fenAjout.js`](#jsfenajoutjs) | Ajouter une carte à la main | 5 | 126 |
| [`rechercheSection.js`](#jsrecherchesectionjs) | Le champ de recherche d'une section | 11 | 178 |
| [`annexes.js`](#jsannexesjs) | La réserve et l'étude | 9 | 117 |
| [`deck.js`](#jsdeckjs) | Ce qu'il y a dans le deck, et les gestes qui l'y mettent | 9 | 115 |
| [`legalite.js`](#jslegalitejs) | Ce que le format exige, et l'équilibre des rôles | 13 | 180 |
| [`deckSection.js`](#jsdecksectionjs) | La section Deck | 6 | 224 |
| [`ficheVisuel.js`](#jsfichevisueljs) | Le visuel de la fiche, et ses éditions | 5 | 116 |
| [`fiche.js`](#jsfichejs) | La fiche détaillée d'une carte | 1 | 165 |
| [`ficheParcours.js`](#jsficheparcoursjs) | Ouvrir une fiche, et feuilleter la liste d'où elle vient | 4 | 110 |
| [`simCartes.js`](#jssimcartesjs) | D'un nom de carte à sa fiche de jeu | 10 | 132 |
| [`simAdversaires.js`](#jssimadversairesjs) | La bibliothèque d'adversaires | 8 | 78 |
| [`decksLies.js`](#jsdecksliesjs) | Les adversaires liés à Moxfield ou à Archidekt | 11 | 196 |
| [`simPreparation.js`](#jssimpreparationjs) | D'un deck ou d'un adversaire à un siège de table | 13 | 141 |
| [`simStats.js`](#jssimstatsjs) | Ce qu'on retient d'une partie, et d'un lot | 5 | 98 |
| [`simStockage.js`](#jssimstockagejs) | Les résultats des lots, gardés et comparés | 8 | 66 |
| [`simulation.js`](#jssimulationjs) | Un lot de parties, par tranches | 11 | 143 |
| [`simSection.js`](#jssimsectionjs) | La section « Simulation » | 9 | 156 |
| [`forgeDepot.js`](#jsforgedepotjs) | Les scripts de cartes de Forge, téléchargés et gardés | 15 | 216 |
| [`forgeVue.js`](#jsforgevuejs) | Les cartes Forge sous les yeux | 11 | 174 |
| [`simResultats.js`](#jssimresultatsjs) | Les résultats d'un lot, l'historique, le classement | 8 | 111 |
| [`outils.js`](#jsoutilsjs) | Menue monnaie de l'atelier | 5 | 52 |
| [`theme.js`](#jsthemejs) | Le thème clair et le thème sombre | 4 | 59 |
| [`dialogue.js`](#jsdialoguejs) | La fenêtre modale, une à la fois | 2 | 42 |
| [`brouillon.js`](#jsbrouillonjs) | Le brouillon des fenêtres à « Appliquer » | 13 | 153 |
| [`couleurs.js`](#jscouleursjs) | Le vocabulaire des couleurs | 1 | 77 |
| [`apercu.js`](#jsapercujs) | L'aperçu volant sous le curseur | 7 | 101 |
| [`versions.js`](#jsversionsjs) | Les éditions d'une même carte | 14 | 173 |
| [`tuiles.js`](#jstuilesjs) | Les rendus d'une carte dans une liste | 12 | 251 |
| [`ancre.js`](#jsancrejs) | L'ancre de défilement | 3 | 57 |
| [`differe.js`](#jsdifferejs) | Les propositions ne se notent que sous les yeux | 4 | 74 |
| [`recalcul.js`](#jsrecalculjs) | Les recalculs annoncés | 8 | 200 |
| [`entete.js`](#jsentetejs) | L'en-tête et la barre des onglets | 7 | 249 |
| [`rendu.js`](#jsrendujs) | Le rendu d'ensemble | 2 | 37 |
| [`fenFormat.js`](#jsfenformatjs) | Fenêtre « Format » | 5 | 63 |
| [`fenNuage.js`](#jsfennuagejs) | La section « Synchronisation » de la fenêtre des paramètres | 9 | 159 |
| [`fenParametres.js`](#jsfenparametresjs) | Fenêtre « Paramètres » | 9 | 133 |
| [`fenBudget.js`](#jsfenbudgetjs) | Fenêtre « Budget » | 6 | 107 |
| [`fenDeck.js`](#jsfendeckjs) | Fenêtre « Configuration du deck » | 9 | 207 |
| [`fenFiltres.js`](#jsfenfiltresjs) | Fenêtre « Filtres » | 10 | 207 |
| [`fenAffichage.js`](#jsfenaffichagejs) | Fenêtre « Affichage » d'une liste de cartes | 9 | 187 |
| [`fenCibles.js`](#jsfenciblesjs) | Fenêtre « Objectifs par rôle » | 5 | 82 |
| [`fenListes.js`](#jsfenlistesjs) | Les deux listes déroulantes des filtres | 6 | 125 |
| [`boiteCatalogue.js`](#jsboitecataloguejs) | Boîte de chargement de l'archive Scryfall | 6 | 75 |
| [`fenExport.js`](#jsfenexportjs) | Fenêtres d'export et d'effacement | 3 | 179 |
| [`fenAdversaire.js`](#jsfenadversairejs) | Ajouter ou modifier un adversaire | 8 | 143 |
| [`fenComportement.js`](#jsfencomportementjs) | Décrire à la main ce que fait une carte | 6 | 84 |
| [`fenJournal.js`](#jsfenjournaljs) | Revoir une partie d'un lot | 1 | 38 |
| [`gestesDecks.js`](#jsgestesdecksjs) | Les gestes des decks | 3 | 138 |
| [`gestesVue.js`](#jsgestesvuejs) | Les gestes qui règlent la vue | 1 | 112 |
| [`gestesReglages.js`](#jsgestesreglagesjs) | Les fenêtres de réglage et leurs boutons | 1 | 140 |
| [`gestesDeck.js`](#jsgestesdeckjs) | Les gestes du deck, de ses annexes et de la fiche | 1 | 193 |
| [`gestesDonnees.js`](#jsgestesdonneesjs) | Les gestes qui touchent aux données | 1 | 146 |
| [`gestesNuage.js`](#jsgestesnuagejs) | Les gestes de la synchronisation | 2 | 92 |
| [`gestesGraphe.js`](#jsgestesgraphejs) | Les gestes du graphe et des listes | 1 | 108 |
| [`gestesSimulation.js`](#jsgestessimulationjs) | Les gestes de la section « Simulation » | 2 | 44 |
| [`qrCorps.js`](#jsqrcorpsjs) | Le corps fini du QR code, et Reed–Solomon | 8 | 118 |
| [`qrMatrice.js`](#jsqrmatricejs) | La grille d'un QR code | 8 | 111 |
| [`qrEcrit.js`](#jsqrecritjs) | Écrire un QR code | 6 | 110 |
| [`qrBinarise.js`](#jsqrbinarisejs) | D'une image de caméra à du noir et du blanc | 3 | 57 |
| [`qrReperes.js`](#jsqrreperesjs) | Trouver un QR code dans une image | 7 | 119 |
| [`qrLit.js`](#jsqrlitjs) | Lire un QR code repéré | 10 | 168 |
| [`camera.js`](#jscamerajs) | Lire un QR code avec la caméra | 5 | 82 |
| [`liaisonCode.js`](#jsliaisoncodejs) | Ce que les deux QR codes transportent, au plus court | 10 | 127 |
| [`liaisonSdp.js`](#jsliaisonsdpjs) | Lire une description WebRTC, en rebâtir une | 5 | 75 |
| [`liaison.js`](#jsliaisonjs) | Deux navigateurs reliés sans serveur | 7 | 114 |
| [`tableHote.js`](#jstablehotejs) | La partie que ce navigateur héberge | 12 | 164 |
| [`tableRendu.js`](#jstablerendujs) | La table, peinte depuis une vue | 9 | 124 |
| [`tableQuestions.js`](#jstablequestionsjs) | Répondre à une question du moteur, à la main | 13 | 148 |
| [`tableCombat.js`](#jstablecombatjs) | Attaquer et bloquer, au doigt | 4 | 73 |
| [`tableSalon.js`](#jstablesalonjs) | Le salon : qui s'assoit à la table, avec quel deck | 11 | 130 |
| [`tableLiaison.js`](#jstableliaisonjs) | Les invités de l'hôte | 23 | 188 |
| [`tableInvite.js`](#jstableinvitejs) | Rejoindre la table d'un autre | 14 | 135 |
| [`tableReprise.js`](#jstablereprisejs) | Reprendre une partie après un rechargement | 4 | 66 |
| [`fenArrets.js`](#jsfenarretsjs) | Les arrêts de la table | 5 | 55 |
| [`gestesTable.js`](#jsgestestablejs) | Les gestes de la table interactive | 3 | 60 |
| [`app.js`](#jsappjs) | L'aiguillage et le démarrage | 1 | 299 |

## js/reglesEffets.js

Le vocabulaire du graphe : nœuds, effets, déclencheurs. *0 fonctions, 273 lignes, 14 Ko.*

| Donnée | Rôle |
|---|---|
| `GROUPS` | 1. Nœuds et groupes du graphe |
| `NODES` | — |
| `NODE` | — |
| `IMPLICIT` | Arcs "règles du jeu" : ce qu'un effet permet mécaniquement d'enchaîner |
| `EFFECT_RULES` | Règles d'extraction : effets produits |
| `TRIGGER_RULES` | Règles d'extraction : déclencheurs |

## js/effets.js

Qualifier un déclencheur, un effet, et les accorder. *11 fonctions, 258 lignes, 16 Ko.*

| Fonction | Rôle |
|---|---|
| `sousTypesDeSort(clause)` | Les sous-types d'un sort lancé, lus entre « cast » et « spell ». |
| `memeSousType(a, b)` | Deux sous-types se comparent au singulier : la phrase dit « turtle spells » là où la ligne de type dit « Turtle ». |
| `qualifieDeclencheur(clause, selfNames)` | — |
| `qualifieProduction(clause, card)` | — |
| `libelleQual(q)` | — |
| `compat(prod, trig)` | — |
| `coupeDeclencheur(body)` | — |
| `coutsDe(cost, selfNames)` | — |
| `refineTriggers(list, clause)` | — |
| `scopeOf(s)` | — |
| `refineEffects(list, clause)` | — |

| Donnée | Rôle |
|---|---|
| `SUJETS` | 2. Qualification et analyse contextuelle |
| `MOTS_NON_SOUSTYPE` | Ce qui qualifie un sort sans être un sous-type : les types de carte, les tournures de compte, de couleur et de nombre. |
| `DEBUTS_EFFET` | — |
| `COUTS` | — |

## js/synergies.js

Ce qu'une carte apporte à une autre. *5 fonctions, 61 lignes, 2.1 Ko.*

| Fonction | Rôle |
|---|---|
| `feeds(concept)` | — |
| `feedsDe(p)` | — |
| `croise(prods, trigs, dir, out)` | — |
| `synergyBetween(a, b)` | — |
| `partnersFor(card, pool)` | — |

| Donnée | Rôle |
|---|---|
| `EQUIV` | 3. Synergies & équivalences entre effets |

## js/cartesBrutes.js

La base livrée avec l'atelier. *0 fonctions, 141 lignes, 19 Ko.*

| Donnée | Rôle |
|---|---|
| `RAW` | — |

## js/analyse.js

Lire une carte : coût, capacités, déclencheurs, effets. *5 fonctions, 148 lignes, 7.6 Ko.*

| Fonction | Rôle |
|---|---|
| `parseCost(cost)` | — |
| `stripReminder(t)` | — |
| `splitAbilities(text)` | — |
| `matchAll(rules, s)` | — |
| `analyze(card)` | — |

## js/archetypesLibelles.js

Le nom français des thèmes EDHREC. *0 fonctions, 83 lignes, 6.7 Ko.*

| Donnée | Rôle |
|---|---|
| `ARCH_LABELS` | — |
| `ARCH_RESUMES` | Résumés de fonctionnement affichés dans la liste déroulante. |

## js/categories.js

Les rôles d'une carte. *2 fonctions, 126 lignes, 6.8 Ko.*

| Fonction | Rôle |
|---|---|
| `categories(card)` | — |
| `reanalyser(card)` | Une carte dont le texte ou la force changent voit son analyse refaite. |

| Donnée | Rôle |
|---|---|
| `CATLABEL` | — |

## js/mana.js

Ce qu'une carte demande en mana, et ce qu'elle en produit. *11 fonctions, 211 lignes, 10 Ko.*

| Fonction | Rôle |
|---|---|
| `ordonneMana(lettres)` | Une chaîne de lettres en ordre WUBRGC, sans doublon : c'est la forme sous laquelle le mana produit se range, se compare et se sauvegarde. |
| `manaVide()` | — |
| `pipsCarte(card)` | Ce qu'une carte demande, symbole par symbole. |
| `manaProduitTexte(card)` | Ce qu'une carte produit, lu dans ce qu'on a sous la main : sa ligne de type d'abord, son texte oracle ensuite. |
| `manaProduitDe(card)` | Le mana produit d'une carte. `card.manaProduit` vient de `produced_mana`, que Scryfall fait autorité — par une réponse ou par l'archive du catalogue — et l'emporte donc ; le texte prend… |
| `bilanMana()` | Le bilan du deck **entier**, sans passer par `carteFiltree()` : l'équilibre du mana est une propriété du deck, comme les jauges de rôle et le contrôle de conformité. |
| `verdictMana(partPips, partSources)` | Ce qu'on peut dire de l'écart entre la part demandée et la part servie, sans en dire plus qu'on ne sait : c'est un rapport de parts, non une promesse de main de départ. |
| `pourcentMana(x)` | — |
| `nombreMana(x)` | Un nombre de symboles peut tomber sur un demi — un hybride — : une décimale suffit, et l'entier reste écrit sans virgule. |
| `ligneMana(l)` | — |
| `blocMana()` | — |

| Donnée | Rôle |
|---|---|
| `MANA_LETTRES` | — |
| `TERRAINS_MANA` | Les types de terrain qui disent à eux seuls ce qu'un terrain produit. |

## js/impressions.js

Les éditions d'une carte, et celle qu'on possède. *7 fonctions, 74 lignes, 2.9 Ko.*

| Fonction | Rôle |
|---|---|
| `cleImpression(set, num)` | — |
| `noterImpression(card, set, num, qty)` | Édition lue dans une liste importée. La première qui porte un numéro devient l'édition de référence de la carte : c'est elle qui sera demandée à Scryfall. |
| `completeImpression(card, sc)` | Édition rapportée par Scryfall : elle ne prend la place de celle relevée à l'import que si la carte n'en avait pas. |
| `libelleImpression(card)` | — |
| `versionsCarte(card)` | Éditions de la carte présentes dans la collection : ce sont celles que la fiche fait défiler. |
| `cleVersion(v)` | — |
| `versionRetenue(card)` | L'édition retenue pour l'affichage : celle que l'utilisateur a choisie, sinon celle relevée à l'import. |

## js/cartes.js

La base de cartes et ses index. *19 fonctions, 213 lignes, 8.1 Ko.*

| Fonction | Rôle |
|---|---|
| `norm(s)` | — |
| `loose(s)` | — |
| `buildCard(name, cost, type, price, text)` | — |
| `majTexteOracle(card, texte)` | La base intégrée ne garde qu'un résumé du texte des cartes : dès qu'une source officielle (Scryfall ou catalogue local) fournit le texte oracle complet, il remplace le résumé et… |
| `indexCard(card)` | — |
| `unindexCard(card)` | — |
| `registerCard(card)` | — |
| `find(name)` | — |
| `peutCommander(c)` | — |
| `commandantsPossibles()` | — |
| `commandantsPrincipaux()` | Les commandants principaux du deck. Un seul se désigne aujourd'hui — l'étoile de l'onglet Deck, `S.commander` —, mais la liste en attend plusieurs : deux cartes liées par « Partner »… |
| `commandantsSecondairesPossibles()` | Toutes les cartes du deck qui pourraient commander, les commandants principaux mis à part : la liste que l'onglet EDHREC affiche, cochées ou non. |
| `commandantsSecondaires()` | Celles qu'on traite effectivement comme commandants secondaires : les autres ont été décochées dans l'onglet EDHREC (`S.secondairesOff`). |
| `mainType(c)` | — |
| `carteLivree(line)` | Une ligne de la base livrée devient une carte. |
| `initBuiltin()` | — |
| `frontFace(n)` | — |
| `mergeInto(card, canonical)` | — |
| `renameCard(card, newName)` | — |

| Donnée | Rôle |
|---|---|
| `DB` | Base de données & indexation |
| `BY_NAME` | — |
| `LOOSE` | — |
| `FRONT` | — |
| `TYPE_ORDER` | — |
| `BUILTIN` | — |

## js/liens.js

Le tri des liens : interaction précise ou déclencheur large. *6 fonctions, 74 lignes, 3.4 Ko.*

| Fonction | Rôle |
|---|---|
| `seuilLiensLarges(taille)` | Le plancher de quatre évite de traiter de large le déclencheur d'un deck de six cartes, où le quart ne veut encore rien dire. |
| `cleLien(l)` | — |
| `classeLiens(partners, taille)` | Range les partenaires en deux tas — ceux qu'au moins un lien précis relie, ceux que seul un déclencheur large atteint — et nomme les familles larges, la plus nourrie d'abord. |
| `libelleFamilleLarge(f)` | Le nom d'une famille large, tel qu'on le montre : « lancement de sort » suffit, le sens du lien n'apprend rien à qui lit une infobulle. |
| `libelleFamillesLarges(familles)` | — |
| `primeLiensLarges(familles)` | Ce qu'un déclencheur large vaut : une prime, non soixante interactions. |

## js/etat.js

État global de l'application & utilitaires. *1 fonctions, 196 lignes, 11 Ko.*

| Fonction | Rôle |
|---|---|
| `ongletDeSection(id)` | L'onglet qui porte une section, pour les gestes qui traversent l'atelier — la fiche d'une carte qui renvoie au graphe, par exemple. |

| Donnée | Rôle |
|---|---|
| `FORMATS` | `legal` : la lettre que `codeLegalite()` emploie pour ce format, et le nom que Scryfall lui donne dans ses recherches. |
| `ANNEXES` | Les deux listes annexes de la section Deck : la réserve — le sideboard — et les cartes à l'étude — le considering des sites de decks. |
| `CLES_ANNEXES` | — |
| `ONGLETS` | `liste` : la liste de cartes que l'onglet montre, celle que règle le bouton « Affichage » de l'entête (`LISTES_AFFICHAGE` plus bas). |
| `CLES_ONGLETS` | — |
| `ONGLETS_ANCIENS` | L'onglet unique d'hier, tel qu'une sauvegarde le nomme encore : elle rouvrait sinon la collection, et l'on perdait la page qu'on regardait en quittant l'atelier. |
| `SECTIONS_SUGGESTIONS` | Les trois sections que la notation alimente, dans l'ordre des onglets. |
| `COLONNES` | Les nombres de colonnes offerts par les grilles, zéro valant « autant que la largeur en permet ». |
| `LISTES_AFFICHAGE` | Les cinq listes de cartes de l'atelier, et ce que chacune sait montrer. |
| `CLES_AFFICHAGE` | — |
| `RETOURNEES` | — |
| `apercuEl` | — |
| `apercuCardName` | — |
| `S` | — |

## js/decks.js

Les decks, et celui sur lequel on travaille. *12 fonctions, 196 lignes, 8.1 Ko.*

| Fonction | Rôle |
|---|---|
| `cleDeckNeuve()` | Une clé tirée au sort plutôt qu'un compteur : deux appareils qui créent chacun un deck hors ligne ne doivent pas se réclamer la même, sans quoi la synchronisation fusionnerait deux decks… |
| `deckNeuf(nom, modele)` | Un dossier neuf, ou la copie d'un dossier existant quand `modele` est donné. |
| `clesDecks()` | Les decks dans l'ordre où ils ont été créés : un deck ne doit pas changer de place dans la liste parce qu'on y a touché. |
| `deckCourant()` | Le dossier ouvert. Il en existe toujours un : une sauvegarde abîmée, une suppression mal menée ou un tout premier lancement en trouvent un ou en font un, plutôt que de rendre `undefined`… |
| `nomDeckLibre(base)` | Un nom libre : « Deck », puis « Deck 2 ». Deux decks du même nom seraient indiscernables dans la pastille comme dans la liste d'achats. |
| `creerDeck(nom, modele)` | — |
| `activerDeck(cle)` | Changer de deck, c'est changer tout ce que l'atelier propose : les candidates du catalogue, la notation, les listes. |
| `renommerDeck(cle, nom)` | — |
| `dupliquerDeck(cle)` | — |
| `supprimerDeck(cle)` | Le dernier deck ne se supprime pas : l'atelier n'a pas d'état sans deck ouvert, et « supprimer » vaudrait « vider », qui a son propre bouton. |
| `carteDansUnDeck(nom)` | Une carte tenue par l'un quelconque des decks — liste, réserve ou étude. |
| `bilanDeck(cle)` | Ce qu'un deck pèse, pour les vignettes de la page « Decks » et la pastille de l'en-tête. |

| Donnée | Rôle |
|---|---|
| `DECK_STATUTS` | Où en est un deck. C'est du suivi, non une règle : rien n'en dépend que l'affichage et le rangement de la page « Decks ». Un deck archivé ne disparaît pas de la liste d'achats — on le… |
| `CHAMPS_DECK` | Les huit champs du dossier que `S` montre sous leur ancien nom. |

## js/archetypesSets.js

Deux vocabulaires venus du dehors. *12 fonctions, 173 lignes, 7.7 Ko.*

| Fonction | Rôle |
|---|---|
| `libelleArchetype(slug)` | Libellé d'un thème : le nôtre s'il en existe un, sinon celui d'EDHREC. |
| `resumeArchetype(slug)` | Court résumé du fonctionnement d'un archétype. |
| `archetypesDisponibles()` | Les archétypes proposés : ceux qu'EDHREC publie. |
| `archetypesCarte(card)` | Archétypes d'une carte, d'après les thèmes EDHREC chargés. |
| `archetypesAChargerEdhrec()` | Un thème coché dont les cartes ne sont pas encore chargées. |
| `archetypesFiltre(crit)` | Archétypes cochés, conservés sous forme de liste séparée par des virgules. |
| `basculerArchetype(id)` | — |
| `setsFiltre(crit)` | Sets cochés, conservés comme les archétypes : une liste de codes séparés par des virgules. |
| `basculerSet(code)` | — |
| `libelleSet(code)` | Nom du set, s'il figure dans la liste Scryfall ; sinon son code. |
| `setsACharger()` | Un set coché dont les cartes ne sont pas encore chargées, ceux de la restriction du deck compris. |
| `setsCarte(card)` | Sets d'une carte. Scryfall fait autorité pour les sets déjà chargés, mais on y joint ce que l'appareil sait déjà : le set relevé dans l'archive, les éditions possédées et celles que la… |

| Donnée | Rôle |
|---|---|
| `FILTRES_VIDE` | — |
| `FILTRES_BORNES` | Bornes numériques : [clé min, clé max, champ de la carte, libellé]. |
| `ARCH_BASE` | — |
| `SETS_BASE` | — |

## js/filtres.js

Les critères de la fenêtre « Filtres ». *14 fonctions, 157 lignes, 6.7 Ko.*

| Fonction | Rôle |
|---|---|
| `rolesFiltre(crit)` | Rôles cochés dans la section Deck, conservés comme les archétypes. |
| `basculerRole(role)` | — |
| `roleOK(card, crit)` | Une carte tient au moins un des rôles cochés. |
| `nombreFiltre(v)` | — |
| `reinitFiltres()` | — |
| `majFiltre(cle, valeur)` | Écrit un champ de la fenêtre dans l'état. |
| `effacerFiltre(cles)` | Efface un filtre depuis sa puce dans l'en-tête. |
| `filtresActifs(crit)` | Filtres en vigueur : un libellé et les clés à effacer pour chacun. |
| `texteFiltresActifs(sep)` | Libellés seuls, pour les infobulles et les phrases de résumé. |
| `carteFiltree(card)` | Prédicat unique de l'atelier : couleurs, rôles et critères de la fenêtre. |
| `carteFiltreeEtRestreinte(card)` | La même chose, plus la restriction du deck ouvert. |
| `valeurFiltre(x, vide)` | Une valeur peut être donnée telle quelle ou par une fonction, pour que les critères coûteux — sets, archétypes, type développé — ne soient calculés que si le filtre correspondant est posé. |
| `motsFiltre(valeur, saisie, cle)` | Chaque mot de la saisie doit se retrouver dans la valeur, dans n'importe quel ordre. |
| `filtresValeursOK(v, crit)` | — |

## js/restrictions.js

La restriction d'un deck. *12 fonctions, 128 lignes, 5.4 Ko.*

| Fonction | Rôle |
|---|---|
| `restrictionsDuDeck()` | La restriction du deck ouvert. Toujours un objet : un dossier d'hier qui n'en porte pas se lit comme un dossier sans restriction. |
| `couleursRestriction(r)` | Les couleurs que la restriction impose, ou `null` si elle n'en impose aucune. |
| `couleursRestrictionOK(card)` | — |
| `restrictionOK(card)` | Le prédicat, sur une carte bâtie. Les rôles demandent l'analyse du texte : ils ne valent donc que de ce côté-ci, comme pour les filtres. |
| `restrictionOKRec(rec)` | Le même, sur un enregistrement brut du catalogue : c'est ce qui évite de bâtir des dizaines de milliers de cartes pour les écarter ensuite. |
| `restrictionPosee()` | Y a-t-il quoi que ce soit à restreindre ? Sert à ne pas parcourir le deck pour rien, et à ne pas afficher une rangée de puces vide. |
| `restrictionsActives()` | Les restrictions en vigueur, sous la même forme que `filtresActifs()` mais **sans clés** : c'est l'absence de `cles` qui fait qu'aucune croix n'est dessinée, et non une exception dans le… |
| `texteRestrictionsActives(sep)` | — |
| `cartesHorsRestriction()` | Les cartes du deck que sa propre restriction écarterait. |
| `poseCouleursCommandant(rest)` | Un deck neuf peut hériter de l'identité couleur de son commandant sans qu'on ait à cocher six cases : c'est le geste de la fenêtre de configuration, et le seul endroit où la restriction… |
| `majRestriction(cle, valeur)` | — |
| `reinitRestrictions()` | — |

| Donnée | Rôle |
|---|---|
| `RESTRICTION_CHAMPS` | Rien ne s'y écrit hors de la fenêtre de configuration, mais le garde-fou est le même que celui de `majFiltre()` : une clé inconnue ne doit pas s'installer en silence dans le dossier. |

## js/retenue.js

Ce qui reste après les filtres. *11 fonctions, 135 lignes, 5.7 Ko.*

| Fonction | Rôle |
|---|---|
| `gameChangersConnus()` | — |
| `estGameChanger(card)` | Vrai, faux, ou `null` quand la liste n'est pas là : une carte qu'on ne sait pas juger n'est pas déclarée ordinaire pour autant. |
| `codeLegalite(legalities)` | Légalité d'une carte telle que Scryfall la publie, réduite aux formats que l'atelier connaît : une chaîne de lettres — « c » pour Commander, « s » pour Standard. |
| `carteLegale(card)` | Légalité d'une carte dans le format en cours. |
| `legaliteOK(card)` | Le filtre de légalité, tel que la case de la fenêtre Format le règle. |
| `carteRetenue(card)` | Ce que la collection et les suggestions retiennent : les critères de la fenêtre, plus la légalité. |
| `valeursCarte(card)` | Les valeurs d'une carte que les critères comparent. |
| `filtreOK(card)` | Applique les filtres avancés à une carte. |
| `setsRec(rec)` | Sets d'un enregistrement du catalogue : ceux que porte l'archive, réunis à ce que Scryfall a rapporté pour les sets déjà chargés. |
| `filtreOKRec(rec)` | Les mêmes critères, lus sur un enregistrement du catalogue : c'est ce qui permet de filtrer les dizaines de milliers de cartes de l'archive sans en construire autant d'objets. |
| `valeursRec(rec)` | Les mêmes valeurs, lues sur un enregistrement du catalogue. |

| Donnée | Rôle |
|---|---|
| `GC_BASE` | — |

## js/catalogueEtat.js

L'archive en mémoire, et les nœuds qu'elle touche. *5 fonctions, 71 lignes, 3.1 Ko.*

| Fonction | Rôle |
|---|---|
| `catalogueAbsent()` | Vrai tant que cet appareil n'a pas les cartes existantes : archive jamais chargée, ou chargée mais vide. |
| `noeudsActifs()` | — |
| `carteTouche(c, noeuds)` | — |
| `getCardOrAnalyzedRec(rec)` | — |
| `recToucheNoeuds(rec, noeuds)` | — |

| Donnée | Rôle |
|---|---|
| `CH` | `MANA_PROD` est venue en dernier : une archive d'hier n'a que dix-sept colonnes, l'indice y rend `undefined`, et la carte retombe alors sur la lecture de son texte (`manaProduitDe()`,… |
| `CAT` | — |

## js/groupes.js

Grouper et trier les listes de cartes. *7 fonctions, 232 lignes, 10 Ko.*

| Fonction | Rôle |
|---|---|
| `sousTypesCarte(card)` | — |
| `seauCmc(card)` | Le seau de coût, celui de la courbe de mana : au-delà de sept, tout ensemble — une carte à onze et une carte à huit se rangent côte à côte. |
| `tauxEdhrec(e, champ)` | — |
| `scoreEntree(e)` | — |
| `notesCollectionAJour()` | — |
| `notesCollection(entrees)` | — |
| `groupeCartes(entrees, modeId, triId)` | `triId` valant `null`, l'ordre reçu est gardé tel quel : c'est ce dont les suggestions ont besoin pour leur ordre gelé, qui n'est celui d'aucun tri. |

| Donnée | Rôle |
|---|---|
| `COULEUR_LABEL` | La couleur d'une carte, ramenée aux sept cases qu'on lit d'un coup d'œil : les cinq couleurs, le multicolore, l'incolore. |
| `COULEUR_ORDRE` | — |
| `SANS` | — |
| `GROUPES` | — |
| `SANS_EDHREC` | Le taux qu'EDHREC donne à une carte : sa part dans les decks recensés du commandant (`inclusion`), ou l'écart avec les autres decks de la même identité couleur (`synergy`). |
| `TRIS` | — |
| `TRIS_SECTION` | Les tris proposés par chaque section : la quantité n'a pas de sens pour une suggestion, qui n'est encore nulle part, et les deux taux d'EDHREC n'en ont que là où toute carte en porte —… |
| `NOTES_COLLECTION` | — |

## js/barreGroupes.js

L'enveloppe d'un groupe, et la mise en page d'une liste. *8 fonctions, 118 lignes, 5.9 Ko.*

| Fonction | Rôle |
|---|---|
| `clePli(section, modeId, id)` | — |
| `groupePlie(section, modeId, id)` | — |
| `enveloppeGroupe(section, modeId, g, titre, badge, corps)` | Une catégorie, repliable, sur le patron des parties de la section Deck (`partieDeck`, js/deckSection.js) : mêmes classes, même chevron, même geste. |
| `rendGroupes(section, groupes, modeId, rendEntrees, compte)` | — |
| `noteMultiple(modeId)` | Un regroupement où une carte compte plusieurs fois le dit, sans quoi la somme des en-têtes contredirait le total affiché juste au-dessus. |
| `colonnesDe(section)` | — |
| `ouvreGrille(section, base)` | L'ouverture d'une grille : la classe et la variable qui portent le choix, ou la grille d'avant si l'on s'en remet à la largeur. |
| `vueDe(section)` | La vue d'une liste : ses vignettes en grille, ou une ligne par carte. |

| Donnée | Rôle |
|---|---|
| `COMPTEUR_GROUPE` | L'identifiant que le bouton commande, tiré d'un compteur de rendu : un libellé de sous-type ou d'édition n'a pas à être un identifiant HTML. |

## js/marche.js

Marché Cardmarket, estimations & panier d'achat. *5 fonctions, 69 lignes, 2.8 Ko.*

| Fonction | Rôle |
|---|---|
| `cmLink(card)` | — |
| `multiplicateurAchat()` | Ce que les préférences d'achat font au prix de tendance. |
| `prixBrutMax()` | Le prix de tendance au-delà duquel l'estimation dépasserait le plafond par carte du deck ouvert. |
| `cmEstimate(card)` | — |
| `bestOffer(card)` | — |

| Donnée | Rôle |
|---|---|
| `CONDITIONS` | — |
| `COND_MULT` | — |
| `CM_LANGS` | — |
| `LANG_MULT` | — |
| `SELLER_TYPES` | — |
| `SELLER_MULT` | — |
| `CM_COUNTRIES` | — |

## js/achats.js

Ce qu'il reste à acheter. *9 fonctions, 143 lignes, 5.9 Ko.*

| Fonction | Rôle |
|---|---|
| `quantiteCollection(nom)` | Ce que la collection porte d'une carte. Le nom du deck et celui de la collection peuvent différer — un import a pu nommer la carte autrement — et `find()` les ramène au même objet : sans… |
| `nomCanonique(nom)` | Le nom sous lequel une carte se compte, quel que soit celui par lequel on y arrive : sans quoi deux decks qui l'orthographient différemment demanderaient deux lignes d'achat pour une… |
| `aAcheter(cle)` | Le panier d'un deck : ce qui lui manque, à lui seul. |
| `spent(cle)` | — |
| `demandesTousDecks()` | La demande de chaque carte, deck par deck. |
| `invaliderAchats()` | — |
| `signatureAchats()` | `spent()` fait déjà une estimation d'offre par carte manquante, et l'en-tête l'appelle à chaque rendu. |
| `wishlist()` | — |
| `bilanWishlist()` | Le pied de la liste : ce qu'elle coûte, combien d'exemplaires elle porte, et ce que les decks se sont fixé comme plafonds — à titre d'information, rien ne le contraint. |

| Donnée | Rôle |
|---|---|
| `ACHATS` | — |

## js/oracleTexte.js

Préparer le texte oracle pour le compilateur. *7 fonctions, 122 lignes, 5.9 Ko.*

| Fonction | Rôle |
|---|---|
| `nombreOracle(s)` | Un nombre écrit en chiffres ou en toutes lettres ; « x » reste la variable du coût. |
| `echappeRegex(s)` | — |
| `normaliseOracle(texte, nom)` | Réduire le texte d'une face : minuscules, nom → `~`, rappel retiré, tirets et apostrophes unifiés, « enters the battlefield » ramené à « enters » (la formulation de 2024). |
| `phrasesOracle(ligne)` | Couper une ligne en phrases. Un point dans des guillemets — une capacité accordée — ne coupe pas. |
| `propositionsOracle(phrase)` | Couper une phrase en propositions qu'un seul motif peut lire. |
| `faceJouee(fiche)` | La face que le moteur joue. Une carte à faces porte ses faces à part (js/champsJeu.js) ; seule la première se joue au lot 1, le dos est rapporté. Sans faces connues, le texte joint par `… |
| `lisTypeLigne(type)` | La ligne de type, lue une fois : types, sous-types, supertypes. |

| Donnée | Rôle |
|---|---|
| `NOMBRES_MOTS` | — |
| `SOI_ORACLE` | Les tournures qui désignent la carte elle-même, réduites à `~`. |
| `VERBES_ORACLE` | Les verbes qui ouvrent une nouvelle proposition après « , and » ou « and » : sans eux, « destroy target creature and its controller gains 2 life » serait un seul bloc, et « create a 1/1… |
| `COUPE_ORACLE` | — |

## js/oracleMotsCles.js

Les mots-clés que le moteur sait jouer. *3 fonctions, 75 lignes, 3.4 Ko.*

| Fonction | Rôle |
|---|---|
| `masqueMots(txt)` | Lire une liste de mots-clés simples (« flying and trample », « flying, vigilance »). |
| `motCleSeul(p)` | Un morceau de ligne de mots-clés, avec son paramètre éventuel. |
| `ligneMotsCles(ligne)` | Une ligne n'est une ligne de mots-clés que si **tous** ses morceaux en sont : « Flying, haste » oui, « Flying, then draw a card » non. |

| Donnée | Rôle |
|---|---|
| `MOT` | — |
| `MOTS_ANGLAIS` | Le nom anglais de chaque mot-clé simple, tel que l'oracle et Scryfall l'écrivent. |
| `COULEURS_ANGLAIS` | — |

## js/oracleCouts.js

Lire un coût : celui d'un sort, celui d'une capacité. *4 fonctions, 81 lignes, 3.8 Ko.*

| Fonction | Rôle |
|---|---|
| `coutMana(str)` | Un coût en mana : symboles, part générique, couleurs exigées, hybrides, nombre de X, et sa valeur de mana. |
| `coutManaVide()` | Un coût vide, pour les capacités qui ne coûtent qu'un engagement. |
| `morceauCout(p)` | Un morceau de coût d'activation. Rend la clé et la valeur à poser sur le coût, ou `null`. |
| `coutActivation(txt)` | Le coût d'une capacité activée, morceau par morceau. |

## js/oracleCibles.js

Une seule grammaire pour désigner des objets. *6 fonctions, 172 lignes, 9.3 Ko.*

| Fonction | Rôle |
|---|---|
| `singulier(w)` | — |
| `descVide()` | — |
| `adjectifDesc(d, w)` | Les adjectifs en tête, relus tant qu'il en reste. |
| `lisDescripteur(txt, o = {})` | Lire un descripteur. `o.cartes` : on parle de cartes hors du champ par défaut (bibliothèque), `o.objets` : d'objets du champ. Rend `null` dès qu'un mot reste incompris. |
| `lisReference(txt, c, o = {})` | Lire ce sur quoi porte un effet : une cible (qu'on inscrit dans le contexte), un groupe (« each », « all », un pluriel), un joueur, la carte elle-même, un pronom. |
| `contexteOracle(evt)` | Le contexte de compilation d'une capacité : les cibles qu'elle déclare, le dernier objet nommé (pour « it »), et ce que l'évènement déclencheur apporte (« that creature », « that player »). |

| Donnée | Rôle |
|---|---|
| `TYPES_CARTE` | — |
| `PLURIELS_ORACLE` | Les pluriels irréguliers des sous-types ; les autres perdent leur « s ». |
| `PAS_SOUSTYPE` | Des mots qui ne sont jamais un sous-type : sans eux, « target » ou « that » seraient lus comme une race de créature et un motif réussirait à tort. |
| `QUEUES_DESC` | Les queues de phrase qui précisent un descripteur, relues tant qu'il en reste. |

## js/oracleEffetsA.js

Les motifs d'effet : dégâts, vie, cartes, retraits. *3 fonctions, 140 lignes, 7.2 Ko.*

| Fonction | Rôle |
|---|---|
| `lisQuantite(txt, c)` | Une quantité : un nombre, X, « that much », « the number of … », « its power ». |
| `lisSource(txt, c)` | La source qui inflige des dégâts : la carte, ce qu'elle désigne, ou la créature qu'elle équipe. |
| `motif(id, famille, re, fait, ex)` | — |

| Donnée | Rôle |
|---|---|
| `EFFETS_ORACLE` | — |

## js/oracleEffetsB.js

Les motifs d'effet : jetons, marqueurs, pompes,. *4 fonctions, 198 lignes, 11 Ko.*

| Fonction | Rôle |
|---|---|
| `lisSigne(s, c)` | Un nombre signé d'une pompe : « +2 », « -1 », « +x ». |
| `compileProposition(txt, c)` | Lire une proposition : « you may », « if you do », « for each » s'ôtent d'abord, puis chaque motif est essayé dans l'ordre. |
| `remplaceX(ops, x)` | Remplacer le X d'une capacité par ce que « where X is … » en dit. |
| `compileEffet(texte, c)` | Lire un effet entier : ses phrases, puis leurs propositions. |

| Donnée | Rôle |
|---|---|
| `JETONS_NOMMES` | Les jetons nommés, décrits dans le vocabulaire même du compilateur : ils se compilent comme n'importe quelle carte (js/definitions.js). |

## js/oracleDeclencheurs.js

Lire ce qui déclenche une capacité. *4 fonctions, 88 lignes, 5.2 Ko.*

| Fonction | Rôle |
|---|---|
| `declencheur(re, fait, ex)` | — |
| `sujetDecl(txt)` | Le sujet d'un évènement : la carte elle-même, ou un descripteur. |
| `lisDeclencheur(txt)` | Lire la condition d'un déclencheur, déjà privée de « when / whenever / at ». |
| `apportDecl(ecoutes)` | Ce que l'évènement apporte au texte de l'effet : un objet (« that creature ») quand le sujet en est un autre que la carte, un joueur (« that player ») quand il s'agit de dégâts infligés. |

| Donnée | Rôle |
|---|---|
| `DECLENCHEURS_ORACLE` | — |
| `EVTS_SOI` | — |

## js/oracleStatiques.js

Lire une capacité statique, et la façon d'entrer. *4 fonctions, 85 lignes, 4.2 Ko.*

| Fonction | Rôle |
|---|---|
| `statique(re, fait, ex)` | — |
| `bonusPT(f, e)` | « +1/+1 » en deux nombres. |
| `lisStatique(txt)` | Lire une statique. |
| `lisEntree(ligne)` | La façon d'entrer d'un permanent, ou `null` si la ligne n'en parle pas. |

| Donnée | Rôle |
|---|---|
| `STATIQUES_ORACLE` | — |

## js/oracleLignes.js

Ranger chaque ligne d'une carte. *7 fonctions, 143 lignes, 6.5 Ko.*

| Fonction | Rôle |
|---|---|
| `deuxPoints(ligne)` | L'indice du premier deux-points hors guillemets, ou -1. |
| `compileEffetModal(texte, c, puces)` | Un effet, éventuellement modal : « choose one — » suivi de puces. |
| `oteRythme(txt)` | Les mentions de rythme qui suivent une capacité activée ou déclenchée. |
| `compileDeclenchee(ligne, puces)` | Une ligne déclenchée : on essaie chaque virgule comme frontière entre la condition et l'effet, la première qui se lise des deux côtés l'emporte — « Whenever ~ enters or attacks, create… |
| `compileActivee(ligne, puces)` | Une ligne activée ou de loyauté. |
| `compileLigne(ligne, estSort, cs, puces)` | Ranger une ligne. `estSort` : la carte est un éphémère ou un rituel, et ce qui n'est ni mot-clé ni activée est son effet ; `cs` est alors le contexte partagé par toutes ses lignes, qui y… |
| `compileLignes(lignes, estSort)` | Grouper les puces sous la ligne qui les annonce, puis ranger chaque ligne. |

## js/definitions.js

D'une carte à sa définition de jeu. *12 fonctions, 191 lignes, 10 Ko.*

| Fonction | Rôle |
|---|---|
| `empreinte(s)` | Une empreinte courte d'un texte, pour la clé du mémo et les signatures. |
| `nombreFiche(v)` | — |
| `couleursDe(cout, fiche)` | Les couleurs d'une carte, lues dans son coût ; un jeton dit les siennes. |
| `verseLigne(def, res, texte)` | Verser une ligne comprise dans la définition. |
| `etatLigne(res)` | L'état d'une ligne pour la couverture. |
| `capacitesImplicites(def, fiche)` | Les capacités qu'une carte a sans les écrire : le mana d'un terrain de base ou d'un dual (le texte n'en est qu'un rappel, effacé), et à défaut le mana que Scryfall dit qu'un terrain produit. |
| `cycleImplicite(def)` | Le cycle que l'oracle a lu (« Cycling {2} ») devient une capacité de main : défausser la carte, piocher (js/jeuLancer.js la propose). |
| `compileDefinition(fiche, comportement)` | Compiler une fiche. `comportement` remplace le texte oracle quand l'utilisateur a décrit la carte à la main (js/fenComportement.js). |
| `couverture(compilees, def, fiche, directive, manuel)` | La couverture : l'état de chaque ligne, celui de la carte, et un taux. |
| `rangCouverture(c)` | Le rang d'une couverture : complète, puis partielle, puis injouable, et à état égal le meilleur taux. |
| `definitionDe(fiche, comportement)` | La définition d'une fiche, gardée sous son nom, l'empreinte de son texte et celle de son comportement manuel. |
| `definitionJeton(j)` | La définition d'un jeton décrit par un effet (« create a 2/2 black Zombie creature token »). |

| Donnée | Rôle |
|---|---|
| `COMPILO_V` | À rehausser dès que le compilateur change ce qu'il comprend : la signature d'un lot de simulations l'inclut, et un rejeu fait avec un autre compilateur ne rejouerait pas la même partie. |
| `DEFS` | — |
| `CONTREPARTIE` | Ce qui, ignoré, rendrait la carte **plus forte** qu'elle n'est : une contrepartie, une interdiction, un prix. |
| `MANA_DES_TYPES` | — |

## js/forgeScript.js

Lire un script de carte de Forge. *8 fonctions, 124 lignes, 5.8 Ko.*

| Fonction | Rôle |
|---|---|
| `forgeTable(txt)` | Une capacité `Clé$ Valeur \| Clé$ Valeur` en table. |
| `forgeApi(t)` | L'effet d'une capacité : la valeur de sa première clé SP, AB ou DB. |
| `forgeLigneType(types)` | `Legendary Creature Human Soldier` → la ligne de type de l'atelier, `Legendary Creature — Human Soldier`. |
| `forgeCoutMana(c)` | `4 B B`, `X R`, `W/U W/U`, `2/G`, `W/P` → `{4}{B}{B}`… ; `no cost` → ''. |
| `faceVide()` | — |
| `lisScriptForge(texte)` | Lire un script. Rend `{faces: [face, …], mode}` ; `mode` dit comment les faces se rapportent (`DoubleFaced`, `Split`, `Adventure`, `Modal`, `Flip`…). |
| `forgeSousCapacite(face, nom)` | La sous-capacité nommée par une SVar, lue en table — ou `null` si la SVar n'est pas une capacité (`X:Count$…`, un indice pour l'IA). |
| `ficheDeScriptForge(s)` | La fiche de l'atelier qu'un script décrit : nom, coût, type, texte, force et endurance — de quoi afficher la carte et nourrir les statistiques, même sans la jouer. |

| Donnée | Rôle |
|---|---|
| `FORGE_SUPERTYPES` | — |
| `FORGE_TYPES` | — |

## js/forgeCouverture.js

Ce qu'une carte de Forge demande au moteur. *8 fonctions, 161 lignes, 9 Ko.*

| Fonction | Rôle |
|---|---|
| `forgeSait(genre, ...noms)` | Inscrire ce qu'un module du moteur sait faire. |
| `forgeConnu(el)` | — |
| `morceauxCout(cout)` | Les morceaux d'un coût Forge (`2 T Sac<1/CARDNAME> PayLife<2>`) autres que le mana. |
| `expressionsDe(v)` | Les expressions d'une valeur de SVar : `Count$Valid Creature.YouCtrl` → `expr:Count$Valid`. |
| `elementsTable(face, t, genre, out, vus)` | Les éléments d'une table, en suivant ses renvois dans les SVars. |
| `unitesForge(face)` | Les unités d'une face, chacune avec ses éléments et son texte. |
| `couvertureForge(script, echecs)` | La couverture d'un script : l'état de chaque unité, celui de la carte, et les éléments qui manquent. |
| `manquesForge(scripts)` | Les éléments qui manquent, classés par nombre de cartes qu'ils rendraient complètes ou meilleures. |

| Donnée | Rôle |
|---|---|
| `FORGE_SAIT` | — |
| `FORGE_CLES_FILTRE` | Les paramètres dont la valeur est un filtre (js/forgeValide.js), et ceux qui désignent (js/forgeDefini.js) : leurs propriétés et leurs valeurs comptent dans la couverture comme des… |
| `FORGE_CLES_DEFINI` | — |
| `FORGE_DESCRIPTIFS` | Les paramètres qui ne font que décrire — pour l'humain, pour l'IA de Forge — et ne changent rien au jeu. |
| `FORGE_COMMUNS` | Les paramètres communs à toutes les capacités : le reste se compte par effet (`param:ChangeZone.Origin`), parce que le même nom ne veut pas dire la même chose d'un effet à l'autre, et… |
| `FORGE_RENVOIS` | Les paramètres dont la valeur nomme une autre SVar à suivre. |

## js/jeuHasard.js

Le hasard semé du moteur. *5 fonctions, 52 lignes, 1.8 Ko.*

| Fonction | Rôle |
|---|---|
| `brasse(a, b)` | Brasser deux entiers en un troisième, pour dériver une graine d'une autre. |
| `etatHasard(graine)` | L'état d'un générateur, chauffé quinze tirages pour qu'une graine voisine ne donne pas une suite voisine. |
| `tireHasard(st)` | Un tirage dans [0, 1). |
| `entierHasard(st, n)` | Un entier dans [0, n). |
| `melangeHasard(st, t)` | Mélanger un tableau sur place (Fisher-Yates). |

## js/jeuEtat.js

Une partie : ses joueurs, ses objets, ses zones. *20 fonctions, 213 lignes, 9.3 Ko.*

| Fonction | Rôle |
|---|---|
| `nouvellePartie(cfg)` | Créer une partie. `cfg.sieges` : `[{nom, format, vie, cartes:[{def, n}], commandants:[def]}]` ; `cfg.premier` : le siège qui commence. |
| `nouvelleCarte(P, def, prop, cmd, jeton)` | Inscrire une carte de la partie. Un jeton aussi en reçoit une, pour que ses statistiques et son nom aient un support. |
| `creeObjet(P, cid, prop, zone, ctrl)` | — |
| `obj(P, id)` | — |
| `suit(P, id)` | L'identifiant qu'un objet porte aujourd'hui, en suivant ses changements de zone pendant la résolution en cours (« exile it, then return it »). |
| `tableauZone(P, o)` | Le tableau d'une zone : le champ de bataille est commun, le reste appartient au propriétaire. |
| `retireDe(t, id)` | — |
| `instantane(P, o)` | Ce qu'on savait d'un objet au moment où il est parti : le moteur s'en sert pour « when ~ dies » et « equal to its power » (règle 608.2h). |
| `deplace(P, id, vers, opts = {})` | Déplacer un objet. Rend l'identifiant du nouvel objet, ou `null` pour un jeton qui quitte le champ (il cesse d'exister). `vers` : une zone, ou `dessus` / `dessous` de la bibliothèque. |
| `noteEntree(P, de, vers, o)` | Ce qui est arrivé dans une zone ce tour, pour « the number of creatures that died this turn » : l'instantané d'un objet parti du champ, l'objet lui-même sinon. |
| `emet(P, e)` | Un évènement, que la collecte des déclencheurs lira (js/jeuDeclencheurs.js). |
| `jn(P, txt)` | Une ligne de journal — rien du tout quand la partie ne se journalise pas, ce qui est le cas de toutes celles d'un lot. |
| `nomObj(P, id)` | — |
| `vivants(P)` | — |
| `suivantVivant(P, i)` | Le joueur suivant encore en lice, dans l'ordre des sièges. |
| `ordreApnap(P)` | Les joueurs en lice dans l'ordre APNAP : le joueur actif d'abord. |
| `adversaires(P, i)` | — |
| `champDe(P, j)` | Les objets du champ qu'un joueur contrôle. |
| `piocheN(P, j, n)` | Piocher. Une bibliothèque vide ne fait pas perdre sur-le-champ : elle le note, et l'action d'état tranche (règle 704.5b). |
| `question(P, j, q, options, x = {})` | Une question posée à un joueur : le moteur la rend par `yield`, le pilote la porte à l'agent du joueur et renvoie sa réponse (js/jeuPilote.js). |

| Donnée | Rôle |
|---|---|
| `ZONES_JOUEUR` | — |

## js/jeuCaracteristiques.js

Ce qu'un permanent est en ce moment. *9 fonctions, 112 lignes, 5.3 Ko.*

| Fonction | Rôle |
|---|---|
| `statiquesEnJeu(P)` | Les statiques en vigueur, relevées une fois par version de l'état. |
| `statiqueVise(P, src, s, o)` | Une statique s'applique-t-elle à cet objet ? Le sujet se juge sur les caractéristiques **imprimées** de l'objet : les juger sur ses caractéristiques calculées ferait dépendre le calcul… |
| `car(P, o)` | Les caractéristiques calculées d'un objet du champ (ou d'une carte, pour laquelle seule la définition compte). |
| `animation(o)` | La couche propre à l'objet : ce qu'un effet l'a fait devenir — un terrain qui devient créature, un véhicule piloté (`o.anime`, une liste, la dernière force fixée l'emportant : règle 613,… |
| `aMot(P, o, m)` | — |
| `estType(o, t)` | — |
| `estCreature(o)` | — |
| `peutEngagerSoi(P, o)` | Une créature peut-elle s'engager pour attaquer ou pour une capacité {T} : elle est là depuis le début du tour de son contrôleur, ou elle a la célérité (règle 302.6). |
| `mvDe(o)` | La valeur de mana d'un objet ou d'une définition. |

## js/jeuCibles.js

Juger un objet contre un descripteur. *10 fonctions, 147 lignes, 7 Ko.*

| Fonction | Rôle |
|---|---|
| `caracsJugees(P, o, base)` | Les caractéristiques à juger : celles du moment pour un permanent, celles qu'on a retenues pour un objet parti, l'imprimé pour une carte ailleurs. |
| `etatCombat(P, o, etat)` | — |
| `correspondObjet(P, o, d, src, ctrl, base)` | Le cœur : un objet (ou un instantané) répond-il au descripteur, vu du joueur `ctrl` qui contrôle la source `src` ? |
| `correspond(P, o, d, src, ctrl)` | — |
| `correspondBase(P, o, d, src, ctrl)` | — |
| `joueurCorrespond(P, j, d, ctrl)` | Un joueur répond-il au descripteur ? |
| `defCorrespond(def, d)` | Une définition de sort répond-elle (déclencheurs « whenever you cast a noncreature spell ») ? |
| `ciblable(P, o, ctrl, couleurs)` | Linceul, défense talismanique, protection : un objet peut-il être ciblé par ce joueur, avec une source de ces couleurs ? La garde se paie au lancement (js/jeuLancer.js), elle n'interdit… |
| `ciblesLegales(P, slot, src, ctrl, couleurs)` | Les candidats légaux d'un emplacement de cible : des identifiants d'objets, ou `{j}` pour un joueur. |
| `cibleEncoreLegale(P, cand, slot, src, ctrl, couleurs)` | Une cible choisie l'est-elle encore à la résolution (règle 608.2b) ? |

## js/jeuMana.js

La réserve de mana, et le paiement automatique. *10 fonctions, 178 lignes, 7.4 Ko.*

| Fonction | Rôle |
|---|---|
| `identiteJoueur(P, j)` | Les couleurs de l'identité d'un joueur : celles de ses commandants. |
| `manaPermis(P, j, filtre, pour)` | Une source au mana restreint (« spend this mana only to cast creature spells ») sert-elle à payer ceci ? `pour` : `{sort}` ou `{capacite}` — sans lui, jamais : on ne sait pas ce qu'on paie. |
| `sourcesMana(P, j, pour)` | — |
| `compteObjets(P, desc, src, j)` | Compter les objets du champ qui répondent à un descripteur, vus d'un joueur — « for each Elf you control ». |
| `planPaiement(P, j, cout, x, pour)` | Le plan d'un paiement : quelles sources activer, et pour quelle option. |
| `manaDispo(P, j)` | Ce qu'un joueur peut produire en tout : sa réserve et toutes ses sources. |
| `ajouteMana(P, j, lettres)` | — |
| `debite(pool, cout, x)` | Retirer un coût d'une réserve qui suffit : couleurs exigées, hybrides, puis le générique, pris d'abord dans l'incolore puis dans les couleurs les plus abondantes. |
| `paieMana(P, j, cout, x, pour)` | Payer un coût en mana : activer les sources du plan, verser leur mana dans la réserve, puis en retirer le coût. |
| `videReserves(P)` | Les réserves se vident à la fin de chaque étape (règle 500.4). |

| Donnée | Rôle |
|---|---|
| `LETTRES_MANA` | — |

## js/jeuOpsA.js

Exécuter les opérations : références, dégâts, vie,. *9 fonctions, 213 lignes, 9.6 Ko.*

| Fonction | Rôle |
|---|---|
| `sourceCtx(P, ctx)` | La source d'une capacité ou d'un sort, telle qu'elle est maintenant, ou telle qu'on l'a connue si elle est partie. |
| `passeOuPresent(P, id)` | Un objet tel qu'il était, si la résolution en cours l'a fait partir, sinon tel qu'il est. |
| `resous(P, ref, ctx, passe)` | Résoudre une référence en objets et en joueurs (`{j}`). |
| `joueursDe(P, ref, ctx)` | Les joueurs d'une référence, objets ramenés à leur contrôleur. |
| `valeur(P, q, ctx)` | La valeur d'une quantité. |
| `gagneVie(P, j, n)` | — |
| `infligeDegats(P, src, cible, n, combat)` | Infliger des dégâts : à un joueur, à une créature, à un planeswalker. |
| `choisitCartes(P, j, ids, n, texte, q = 'cartes', min)` | Choisir des cartes : une question au joueur, sauf quand le choix est forcé (autant de cartes que d'options, ou aucune). |
| `sacrifie(P, id)` | Sacrifier, c'est mettre au cimetière en le disant : « whenever you sacrifice » l'écoute. |

| Donnée | Rôle |
|---|---|
| `OPS` | — |

## js/jeuOpsB.js

Exécuter les opérations : jetons, marqueurs, pompes,. *3 fonctions, 152 lignes, 6.8 Ko.*

| Fonction | Rôle |
|---|---|
| `metEnJeu(P, id, ctrl, opts = {})` | Un permanent arrive sur le champ, avec sa façon d'entrer : engagé, engagé sauf si, en payant de la vie, avec des marqueurs, et la loyauté d'un planeswalker. |
| `proposePaiement(P, op, ctx)` | Proposer à un joueur de payer pour empêcher une opération (« unless that player pays {1} »). |
| `executeOps(P, ops, ctx)` | Dérouler une liste d'opérations. |

| Donnée | Rôle |
|---|---|
| `PLAFOND_CHAMP` | Le plafond d'objets sur le champ : une boucle de jetons mal comprise ne doit pas faire tomber la page, elle fait finir la partie au plafond. |
| `TYPES_PERMANENTS` | — |

## js/jeuDeclencheurs.js

Des évènements aux capacités déclenchées. *6 fonctions, 121 lignes, 6 Ko.*

| Fonction | Rôle |
|---|---|
| `ecoute(def)` | Une définition a-t-elle une capacité déclenchée ou la prouesse ? Gardé sur la définition : le test se fait pour chaque permanent à chaque collecte. |
| `quiConvient(qui, j, ctrl)` | — |
| `rangDuSort(P, e, desc)` | Le rang d'un sort parmi ceux que son lanceur a lancés ce tour et qui répondent au même descripteur : « their first noncreature spell ». |
| `ecouteRepond(P, ec, e, s)` | Une écoute répond-elle à un évènement, pour la source `s` ? |
| `collecteDeclencheurs(P)` | Lire les évènements émis depuis la dernière collecte, et ranger en attente les capacités qu'ils déclenchent. |
| `declencheursDeLancement(P, item)` | Les déclencheurs de « when you cast ~ », qui écoutent un sort sur la pile et non un permanent : le lancement les range lui-même. |

| Donnée | Rôle |
|---|---|
| `CAP_PROUESSE` | La prouesse, écrite une fois comme une capacité déclenchée ordinaire. |

## js/jeuEtatsDeJeu.js

Les actions d'état, et un joueur qui perd. *2 fonctions, 92 lignes, 4 Ko.*

| Fonction | Rôle |
|---|---|
| `elimine(P, j, raison)` | Un joueur perd : il quitte la partie avec tout ce qu'il possède (règle 800.4a). |
| `appliqueSBA(P)` | Les actions d'état, une passe. Rend vrai si quelque chose a changé. |

## js/jeuLancer.js

Ce qu'un joueur peut faire de sa priorité, et le faire. *10 fonctions, 179 lignes, 9.8 Ko.*

| Fonction | Rôle |
|---|---|
| `enPhasePrincipale(P, j)` | — |
| `estEphemere(def)` | — |
| `coutSort(P, j, o, depuis, imprime)` | Le coût total d'un sort : imprimé (ou flashback, ou présage, ou le coût `imprime` d'une variante), plus les taxes de tout le monde (Thalia), moins les réductions de son lanceur et… |
| `effetCiblable(P, j, src, effet, couleurs)` | Les emplacements de cible d'un effet ont-ils assez de candidats ? |
| `coutAutrePossible(P, j, o, c)` | Le coût d'activation, hors mana, peut-il être payé ? |
| `actionsLegales(P, j)` | Les actions légales d'un joueur qui a la priorité. |
| `actionsPossibles(P, j)` | La passe rapide : hors de sa phase principale, un joueur qui n'a ni éphémère, ni flash, ni capacité activable n'a rien à décider, et on ne calcule même pas ses actions. |
| `choisitCibles(P, j, src, slots, couleurs, extra)` | Choisir les cibles d'un effet ; rend `null` si un emplacement obligatoire n'a pas assez de candidats. |
| `prepareEffets(P, j, src, effet, couleurs, extra)` | Les effets d'un sort ou d'une capacité, modes choisis et cibles prises. |
| `coutDeGarde(P, j, effets)` | La garde des permanents adverses ciblés s'ajoute au coût. |

| Donnée | Rôle |
|---|---|
| `PASSE` | — |

## js/jeuActions.js

Exécuter une action choisie à la priorité. *7 fonctions, 179 lignes, 7.9 Ko.*

| Fonction | Rôle |
|---|---|
| `paieAutre(P, j, o, c)` | Payer la part d'un coût qui n'est pas du mana : engager, sacrifier, défausser, payer de la vie, retirer des marqueurs. |
| `maxX(P, j, cout)` | Le plus grand X qu'un joueur peut payer en plus d'un coût. |
| `lanceSort(P, j, a)` | Lancer un sort. Rend vrai s'il est allé sur la pile. |
| `activeCapacite(P, j, a)` | Activer une capacité, ou une capacité de loyauté. |
| `equipe(P, j, a)` | Équiper : une capacité à vitesse de rituel qui attache l'équipement. |
| `joueTerrain(P, j, a)` | Jouer un terrain : pas de pile, un par tour (règle 305). |
| `executeAction(P, j, a)` | Exécuter une action choisie. |

## js/jeuVariantes.js

Les autres façons de lancer et de payer. *18 fonctions, 260 lignes, 11 Ko.*

| Fonction | Rôle |
|---|---|
| `coutComplet(c)` | Un coût ramené à `{mana, …}` : l'oracle range un coût en mana seul. |
| `autresCout(c)` | La part d'un coût qui n'est pas du mana, ou `null`. |
| `sommeMana(a, b)` | Deux coûts en mana, additionnés. |
| `fusionAutres(a, b)` | Deux parts non-mana réunies, ou `undefined` si elles se recouvrent : le moteur ne sait pas payer deux sacrifices différents d'un même coût. |
| `convocables(P, j)` | Les créatures qu'on peut engager pour convoquer : pas celles qui produisent du mana, que le paiement compte déjà. |
| `moinsGenerique(c, n)` | — |
| `convoque(c, creatures)` | Un coût réduit par des créatures convoquées : chacune paie un mana de l'une de ses couleurs encore dû, sinon un générique (règle 702.51a). |
| `ordreConvocation(P, j, c)` | Les créatures à convoquer, les plus utiles d'abord : celles dont une couleur est due. |
| `reduit(o, c, creatures, m)` | Le coût après convocation des `n` premières créatures et exploration de `m` cartes. |
| `payableAvec(P, j, o, mana, x)` | Un coût en mana est-il payable, réductions comprises ? |
| `variantesSort(P, j, o, depuis)` | Les façons légales de lancer une carte d'où elle est : `[{variante, mana, autre}]`, la façon ordinaire en tête. |
| `varianteDe(P, j, o, depuis, v)` | Une variante choisie, retrouvée au moment de lancer. |
| `paieReductions(P, j, o, mana, x)` | Payer par convocation et exploration ce qu'il faut pour que le reste se paie en mana. |
| `presage(P, j, a)` | Présager : exiler la carte face cachée pour {2}, pendant son tour. |
| `exhumeesFin(P)` | — |
| `suspendable(P, j, o, rituel)` | La suspension : payer et exiler la carte avec des marqueurs de temps ; à chaque entretien de son propriétaire, un marqueur part ; au dernier, elle se lance sans payer son coût, et une… |
| `suspend(P, j, a)` | — |
| `suspensionsEntretien(P)` | — |

| Donnée | Rôle |
|---|---|
| `MANA_DEUX` | — |
| `CAP_EVOCATION` | Un permanent évoqué est sacrifié en entrant : une capacité déclenchée, comme le dit la règle 702.74a. |
| `CAP_ECHO` | L'écho : au premier entretien de son contrôleur, payer ou sacrifier. |
| `CAP_FOLIE` | La folie : la carte défaussée attend en exil ; sa capacité propose de la lancer pour son coût de folie, sinon elle va au cimetière. |
| `CAP_SUSPENSION` | — |

## js/jeuDurees.js

Ce qui dure : effets, déclencheurs retardés, retours. *10 fonctions, 137 lignes, 5.7 Ko.*

| Fonction | Rôle |
|---|---|
| `durees(P)` | Les listes de la partie, créées au premier besoin : une partie d'avant ce lot, reprise, n'en porte pas. |
| `poseEffet(P, e)` | Poser un effet. `fin` : 'tour', 'prochainTour', 'hote' ou null. |
| `finDuTour(P)` | Les effets et les déclencheurs retardés qui finissent au nettoyage. |
| `debutDuTour(P)` | Au début d'un tour : ce qui durait « jusqu'à votre prochain tour ». |
| `hotePart(P, id)` | Un hôte quitte le champ : les cartes exilées jusque-là reviennent sous le contrôle de leur propriétaire, et les effets qui duraient avec lui cessent (règle 610.3). |
| `sourcesEffets(P)` | Les sources de déclencheurs qui ne sont pas des cartes : les effets. |
| `collecteRetardes(P, e)` | Les déclencheurs retardés qu'un évènement fait partir. |
| `capacitesDe(P, o)` | Les capacités d'un permanent en ce moment : les siennes, plus celles que des statiques lui accordent (« equipped creature has… »). |
| `detruitObjet(P, o, sansRegeneration)` | Détruire un permanent, sauf s'il se régénère : il s'engage, ses blessures partent, il quitte le combat (règle 701.15). |
| `defausseCarte(P, id, j)` | Défausser une carte : au cimetière, ou en exil pour une carte à folie, dont la capacité déclenchée propose alors de la lancer (règle 702.35). |

## js/jeuPile.js

La priorité, la pile, la résolution. *5 fonctions, 115 lignes, 5 Ko.*

| Fonction | Rôle |
|---|---|
| `retireDeLaPile(P, id)` | — |
| `prepareDeclencheur(P, t)` | Une capacité déclenchée en attente devient un élément de pile : ses modes, ses cibles. |
| `stabilise(P)` | Stabiliser avant une priorité (règle 117.5). |
| `resoudre(P, item)` | Résoudre un élément de pile (règle 608). Les cibles sont revérifiées ; un sort dont toutes les cibles sont devenues illégales est contrecarré par la règle. |
| `priorite(P)` | Un tour de priorité, jusqu'à ce que tous passent sur une pile vide. |

| Donnée | Rôle |
|---|---|
| `PLAFOND_ACTIONS` | Le plafond d'actions par tour : une boucle que l'IA ne saurait pas arrêter fait finir la partie, nulle, plutôt que figer la page. |

## js/jeuCombat.js

Attaquants, bloqueurs, dégâts de combat. *10 fonctions, 151 lignes, 6.8 Ko.*

| Fonction | Rôle |
|---|---|
| `peutAttaquer(P, o)` | — |
| `peutBloquer(P, b, a)` | — |
| `declareAttaquants(P)` | Déclarer les attaquants (règle 508). Rend leur nombre. |
| `defenseurDe(P, def)` | Le joueur que vise un attaquant, directement ou par son planeswalker. |
| `declareBloqueurs(P)` | Déclarer les bloqueurs (règle 509), défenseur par défenseur. |
| `initiativeEnJeu(P)` | Y a-t-il une étape de dégâts d'initiative ? |
| `frappe(P, o, passe, avecInitiative)` | Une créature frappe-t-elle dans cette passe ? |
| `repartition(P, a, bs, force)` | Répartir les dégâts d'un attaquant bloqué. |
| `degatsCombat(P, passe)` | Les dégâts de combat d'une passe (règle 510) : tout est assigné, puis infligé d'un coup. |
| `finCombat(P)` | — |

## js/jeuTour.js

Les étapes d'un tour. *5 fonctions, 110 lignes, 4.5 Ko.*

| Fonction | Rôle |
|---|---|
| `degagement(P)` | Le dégagement : les permanents du joueur actif se dégagent, ses créatures cessent d'avoir le mal d'invocation (règle 302.6). |
| `nettoyage(P)` | Le nettoyage : défausse jusqu'à sept, blessures retirées, fin des effets « jusqu'à la fin du tour » (règle 514). |
| `etape(P, e)` | Une étape. |
| `notePrincipale(P)` | Ce que les statistiques relèvent au début de chaque phase principale : le mana que le joueur aurait pu produire, et ses terrains au quatrième tour — de quoi dire un manque ou un… |
| `tour(P)` | Un tour entier. |

| Donnée | Rôle |
|---|---|
| `ETAPES` | — |

## js/jeuPartie.js

Une partie, du mélange à la fin. *2 fonctions, 58 lignes, 2.1 Ko.*

| Fonction | Rôle |
|---|---|
| `mulligans(P)` | Les mulligans, joueur par joueur dans l'ordre du tour. |
| `partie(P)` | La partie entière : le générateur que le pilote déroule. |

## js/jeuPilote.js

Dérouler une partie, question après question. *6 fonctions, 99 lignes, 4.3 Ko.*

| Fonction | Rôle |
|---|---|
| `creePartie(cfg)` | Une partie prête à dérouler. |
| `valideReponse(q, r)` | Une réponse est-elle recevable ? Sinon on retient le défaut de la question, et on le dit dans le journal. |
| `reponseRecevable(q, r)` | Ce qui ne va pas dans la réponse d'un humain, en une phrase, ou rien. |
| `avance(h, agents, budgetMs, horloge)` | Dérouler une partie. `agents[j]` répond pour le joueur j : `{humain, repond(P, q)}`. Rend `finie`, `attente` (un humain doit répondre), `pause` (budget épuisé) ou `erreur`. `horloge` est… |
| `repondre(h, agents, r, budgetMs, horloge)` | Répondre à la question en attente (lot 2), puis reprendre. |
| `joueJusquauBout(cfg, agents)` | Jouer une partie jusqu'au bout d'une traite (tests, rejeu). |

## js/jeuVue.js

Ce qu'un joueur voit de la partie. *7 fonctions, 105 lignes, 5.9 Ko.*

| Fonction | Rôle |
|---|---|
| `ficheVue(def)` | La fiche d'affichage d'une carte : ce qu'un humain lit sur elle. |
| `objetVue(P, o, cartes)` | Un permanent tel qu'on le voit : ses caractéristiques du moment, son état, sa place dans le combat. |
| `carteVue(P, id, cartes)` | Une carte d'une zone publique, ou de sa propre main. |
| `libelleRef(P, c)` | Le libellé d'une cible ou d'un joueur. |
| `vue(P, j)` | La vue du joueur `j`. |
| `libelleAction(P, a)` | Le libellé d'une action de priorité. |
| `questionPourUI(P, q)` | Une question telle qu'un humain la reçoit : des libellés, des références, des bornes — et rien de ce que le moteur garde pour lui (définitions, opérations, descripteurs). |

## js/jeuArrets.js

Quand demander à un joueur humain. *2 fonctions, 33 lignes, 1.6 Ko.*

| Fonction | Rôle |
|---|---|
| `arretsParDefaut()` | Les arrêts de départ : mes deux phases principales et le moment où les bloqueurs sont posés ; chez les autres, leurs attaquants déclarés, leurs bloqueurs, leur fin de tour. |
| `doitDemander(P, j, q, A)` | Faut-il poser cette question de priorité au joueur ? `A.passeJusqua` : le numéro du tour où il a demandé « passer jusqu'à mon tour » ; il tombe de lui-même au début de son tour suivant. |

## js/forgeValide.js

Le langage de filtres de Forge. *15 fonctions, 240 lignes, 12 Ko.*

| Fonction | Rôle |
|---|---|
| `forgeFiltre(txt)` | Compiler un filtre : un tableau d'alternatives `{tete, props}`. |
| `famillesFiltre(txt)` | Les propriétés d'un filtre, pour la couverture : `filtre:YouCtrl`… Les propriétés à seuil (`powerGE3`) et à mot-clé (`withFlying`) se rangent sous leur famille. |
| `sousTypeProbable(p)` | — |
| `familleProp(p)` | — |
| `teteConnue(t)` | — |
| `compareForge(v, op, n)` | — |
| `aQualite(c, mot)` | Un objet, une carte ou un instantané a-t-il ce type, ce sous-type, cette couleur ou ce supertype ? |
| `teteObjet(t, c, o)` | — |
| `propObjet(P, o, c, p, src, ctrl, env)` | Une propriété d'objet. `env` porte la face et le contexte de la résolution en cours, pour `IsRemembered`, `TargetedPlayerCtrl` et les seuils écrits en SVar (`cmcLEX`). |
| `ciblesJoueurs(env)` | Les joueurs ciblés par la capacité en cours, ou par celle qu'elle suit. |
| `forgeValideObjet(P, o, valid, src, ctrl, env, base)` | Un objet répond-il à un filtre Forge ? |
| `forgeValideJoueur(P, j, valid, ctrl, env)` | Un joueur répond-il à un filtre Forge ? |
| `forgeValideDef(def, valid, ctrl, lanceur, id)` | Une définition — un sort lancé, une carte qu'on réduit — répond-elle ? |
| `genreMarqueur(t)` | Le genre de marqueur de Forge (`P1P1`) dans le vocabulaire du moteur. |
| `descForge(valid, zone, sort)` | Un descripteur d'emplacement de cible, lu dans `ValidTgts$` et `TgtZone$`. |

| Donnée | Rôle |
|---|---|
| `FORGE_TYPES_CARTE` | — |
| `FORGE_COULEURS` | — |
| `FORGE_SUPERS` | — |
| `FORGE_TETES_JOUEUR` | — |
| `FORGE_FILTRES` | — |
| `FORGE_PROPS` | Les propriétés que ce fichier sait juger : les autres ne laissent rien passer. |
| `FORGE_PAS_SOUSTYPES` | Des mots en capitale qui ne sont pas des sous-types : lus comme tels, ils ne laisseraient rien passer ; ils restent inconnus. |
| `ZONES_FORGE` | — |

## js/forgeExpr.js

Les quantités de Forge. *8 fonctions, 143 lignes, 7.8 Ko.*

| Fonction | Rôle |
|---|---|
| `forgeNombre(P, v, env)` | Une quantité : un entier, `X`, ou une SVar. |
| `mathForge(n, op, k)` | Appliquer l'opération qui suit une expression. |
| `objetsZone(P, zone)` | Les objets d'une zone, chez tous les joueurs. |
| `caracForge(P, o, quoi)` | Une caractéristique d'un objet, telle que Forge la nomme. |
| `cibleForge(P, env, parent)` | Le premier objet ciblé par la capacité en cours, ou par celle qu'elle suit. |
| `objetEvt(P, ctx)` | L'objet de l'évènement déclencheur. |
| `agregeForge(P, l, agg)` | Le total d'une liste d'objets : leur nombre, ou la somme d'une caractéristique (`$CardPower`), ou le nombre de types de carte qu'ils réunissent (`$CardTypes`, Tarmogoyf). |
| `forgeExpression(P, expr, env, prof)` | Une expression de SVar. |

| Donnée | Rôle |
|---|---|
| `FORGE_MATHS` | — |

## js/forgeDefini.js

Ce que `Defined$` désigne. *6 fonctions, 113 lignes, 6.5 Ko.*

| Fonction | Rôle |
|---|---|
| `ciblesForge(P, env, parent)` | Les cibles prises par l'emplacement de la capacité en cours, ou de celle qu'elle suit. |
| `joueurDe(x, proprio)` | Le contrôleur d'un objet, ou le joueur lui-même. |
| `uniquesJ(liste)` | — |
| `forgeDefinis(P, val, env)` | Résoudre une valeur de `Defined$`. Plusieurs se joignent par ` & `. |
| `joueursForge(P, t, env, cle = 'Defined')` | Les joueurs d'une capacité : ceux qu'elle cible, sinon ceux que `Defined$` nomme, sinon son contrôleur. |
| `objetsForge(P, t, env, defaut = 'Self')` | Les objets d'une capacité : ceux qu'elle cible, sinon ceux que `Defined$` nomme, sinon sa source. |

| Donnée | Rôle |
|---|---|
| `FORGE_DEFINIS` | — |

## js/forgeCout.js

Lire un coût de Forge. *3 fonctions, 79 lignes, 3.7 Ko.*

| Fonction | Rôle |
|---|---|
| `manaForge(morceaux)` | Le mana d'un coût de Forge : `2 W W`, `X R`, `W/U`, `2/W`, `W/P`, `C`. |
| `estManaForge(m)` | — |
| `coutForge(txt)` | Lire un coût. Rend `{cout, loyaute}` — `loyaute` : le changement de loyauté d'une capacité de planeswalker, un nombre ou `'X'`. |

## js/forgeEffetsA.js

Exécuter une capacité de Forge : le registre, la. *12 fonctions, 247 lignes, 14 Ko.*

| Fonction | Rôle |
|---|---|
| `forgeEffet(api, params, gen, ia, opts = {})` | — |
| `seuilForge(P, v, cmp, env)` | Un seuil de Forge : `GE1`, `EQ0`, `LTX`. |
| `conditionForge(P, t, env)` | Les conditions d'une table : `Condition*`, `CheckSVar`, `IsPresent`, `PlayerTurn`. |
| `paieUnlessForge(P, t, env)` | « Unless … pays » : rend vrai si le payeur a payé. |
| `memoireForge(P, ctx, src)` | La mémoire de la carte source : les objets et les joueurs retenus. |
| `retiensForge(ctx, x)` | — |
| `executeForge(P, op, ctx)` | La porte : une table de Forge, résolue. |
| `zoneForge(z)` | Une zone de destination de Forge, dans le vocabulaire du moteur. |
| `deplaceForge(P, o, dest, env, opts = {})` | Déplacer un objet où Forge le dit. Rend le nouvel identifiant. |
| `dansOrigine(o, origine)` | Les objets d'une zone d'origine (`Battlefield,Graveyard`, `Any`). |
| `nombreIA(v)` | Le nombre qu'une table annonce, pour l'IA : un entier, ou X. |
| `quiIA(t, op)` | À qui une table profite ou nuit, pour l'IA. |

| Donnée | Rôle |
|---|---|
| `FORGE_API` | — |
| `FORGE_CONDITIONS` | — |

## js/forgeEffetsB.js

Les effets de Forge : regarder la bibliothèque,. *4 fonctions, 176 lignes, 11 Ko.*

| Fonction | Rôle |
|---|---|
| `regardeForge(P, j, n, cimetiere)` | Regarder le dessus et en envoyer une part dessous (regard) ou au cimetière (surveillance). |
| `sourceDegats(P, t, env)` | La source des dégâts : `DamageSource$`, sinon la source de la capacité. |
| `detruitForge(P, objets, sansRegeneration)` | Détruire : l'indestructible reste. |
| `creeJetonsForge(P, defs, n, qui, engage, env, retenir)` | Créer des jetons, d'après leurs scripts (`TokenScript$ b_2_2_zombie`). |

## js/forgeEffetsC.js

Les effets de Forge : pompes, engagements, mana,. *4 fonctions, 125 lignes, 7.6 Ko.*

| Fonction | Rôle |
|---|---|
| `motsForge(kw)` | Les mots-clés d'un `KW$ Flying & Trample`, en bits. |
| `bonusIA(v)` | Un `+3` ou un `-X` de Forge, pour l'IA. |
| `pompeForge(P, objets, t, env)` | Poser un bonus sur des objets du champ. |
| `optionsMana(produit, montant)` | Les options d'un `Produced$` : `G`, `C`, `Combo W U`, `Any`, `W W`. |

## js/forgeEffetsD.js

Les effets de Forge qui durent : régénération,. *5 fonctions, 132 lignes, 7.4 Ko.*

| Fonction | Rôle |
|---|---|
| `statiqueForge(face, t, jetons)` | Une statique de Forge, prête pour le moteur — avec les capacités qu'elle accorde, construites d'avance. |
| `capacitesAccordees(P, o)` | Les capacités que les statiques en jeu accordent à cet objet. |
| `regenere(P, objets)` | La régénération : un bouclier, jusqu'au nettoyage (js/jeuDurees.js `detruitObjet()`). |
| `animeForge(P, objets, t, env)` | Animer : la couche propre à l'objet (js/jeuCaracteristiques.js `animation()`) — un terrain qui devient une créature 3/3 jusqu'à la fin du tour, un artefact qui devient une créature pour… |
| `animationTenable(t)` | Ce qu'une animation sait tenir : une durée connue, des couleurs nommées. |

| Donnée | Rôle |
|---|---|
| `FORGE_DUREES` | Les durées qu'un effet de Forge sait tenir, dans le vocabulaire du moteur ; une autre rend la table injouable. |
| `PARAMS_ANIME` | — |

## js/forgeDeclencheurs.js

Quand une capacité déclenchée de Forge se. *8 fonctions, 108 lignes, 6.5 Ko.*

| Fonction | Rôle |
|---|---|
| `phaseConnue(t)` | Un déclencheur de phase dont la phase est inconnue ne partirait jamais : il est refusé à la construction. |
| `forgeMode(mode, params, juge)` | — |
| `objetZone(P, e)` | L'objet dont parle un évènement de zone : l'instantané s'il quitte le champ, le nouvel objet sinon. |
| `valideOuRien(P, o, v, s, env)` | — |
| `joueurOuRien(P, j, v, s, env)` | — |
| `joueurDeCarte(j, v, ctrl)` | Ce que « Card.YouOwn » veut dire d'une pioche ou d'une défausse, dont l'évènement ne nomme que le joueur. |
| `ciblesDuSort(P, id)` | Les cibles d'un sort encore sur la pile. |
| `forgeDeclenche(P, ec, e, s)` | Une écoute de Forge répond-elle à un évènement, pour la source `s` ? La zone d'où l'on écoute est le champ — ou, pour qui vient de le quitter, l'instantané qui regarde son propre départ. |

| Donnée | Rôle |
|---|---|
| `FORGE_PHASES` | — |
| `FORGE_MODES` | — |

## js/forgeStatiques.js

Les capacités statiques de Forge. *8 fonctions, 129 lignes, 6.1 Ko.*

| Fonction | Rôle |
|---|---|
| `typesForge(txt)` | `Creature,Elemental` ou `Swamp & Forest` → types et sous-types du moteur. |
| `couleursMots(txt)` | `Red`, `Black & Green`, `Colorless` → des couleurs du moteur. |
| `statiqueTenable(t)` | Les valeurs qu'on sait tenir dans une statique : on n'ajoute pas le type créature par une statique (le combat et les actions d'état ne le verraient pas), ni un type qui n'en est pas un. |
| `forgeStatique(mode, params, f)` | — |
| `envStatique(src, s)` | Le contexte d'une statique : sa source en est le seul repère. |
| `viseForge(P, src, s, o, cle)` | La statique vise-t-elle cet objet, et ses conditions tiennent-elles ? |
| `statiquesForgeSur(P, o)` | Ce que les statiques de Forge font à un objet : bonus, mots-clés, force fixée, interdictions. |
| `coutsForge(P, j, o)` | Les réductions et les hausses de coût de Forge pour un sort que `j` lance : `[plus, moins]`. |

| Donnée | Rôle |
|---|---|
| `FORGE_STATIQUES` | — |

## js/forgeRemplacements.js

Les remplacements de Forge (`R:`). *7 fonctions, 101 lignes, 5.2 Ko.*

| Fonction | Rôle |
|---|---|
| `formeRemplacement(face, r)` | Les formes connues, chacune avec ce qu'elle lit. |
| `remplacementsEnJeu(P)` | Les remplacements en jeu, relevés une fois par version de l'état : ceux des permanents du champ. |
| `envRemplacement(src, x)` | — |
| `destinationRemplacee(P, o, depuis, vers)` | « If ~ would be put into a graveyard, exile it instead » : la zone où l'objet va vraiment. |
| `degagementEmpeche(P, o)` | « ~ doesn't untap during your untap step ». |
| `incontrecarrable(P, o)` | « ~ can't be countered », ou « creature spells you control can't be countered ». |
| `degatsApresPrevention(P, src, cible, n, combat)` | La prévention : les dégâts qu'un remplacement empêche, et les boucliers « prevent the next N damage » posés sur un objet ou un joueur. |

## js/forgeMotsCles.js

Les mots-clés de Forge (`K:`). *3 fonctions, 123 lignes, 6 Ko.*

| Fonction | Rôle |
|---|---|
| `cycleForge(def, face, jetons, cout, type)` | Le cycle : défausser la carte depuis la main, pour piocher — ou, pour un cycle de type (`TypeCycling:Plains:2`), chercher une carte de ce type. |
| `manaSeul(txt)` | Un coût de mot-clé en mana seul (évocation, écho, présage). |
| `motCleForge(def, k, face, jetons)` | Verser un mot-clé dans une définition. Rend vrai s'il est compris. |

| Donnée | Rôle |
|---|---|
| `FORGE_MOTS_PARAMETRES` | — |

## js/forgeDefinition.js

D'un script de Forge à une définition de jeu. *12 fonctions, 235 lignes, 12 Ko.*

| Fonction | Rôle |
|---|---|
| `tableJouable(t)` | Une table est-elle jouable : son effet est-il connu, et chacun de ses paramètres est-il lu par lui ? |
| `texteForge(face, t)` | Le texte d'une capacité, pour la table et le journal. |
| `effetForge(face, t0, jetons)` | L'effet d'une table et de sa chaîne : `{ops, cibles, modes}`, ou `null` si une table n'est pas jouable. |
| `jetonsForge(textes)` | Les définitions des jetons qu'un script crée, d'après leurs scripts. |
| `capaciteForge(def, face, t, jetons)` | Une capacité `A:` de Forge, versée dans la définition. |
| `declencheurForge(def, face, t, jetons)` | Un déclencheur `T:`. |
| `remplacementForge(def, face, r)` | Un remplacement `R:`. Deux formes seulement, les plus courantes : la carte entre engagée (sauf si l'on contrôle tel terrain, ou en payant de la vie), ou avec des marqueurs. |
| `entreeForge(def, face, r)` | L'entrée sur le champ remplacée : engagée, ou avec des marqueurs. |
| `couleursForge(txt)` | Les couleurs d'un `Colors:black,green` de jeton. |
| `definitionDepuisScript(s, fiche, jetons)` | La définition d'un script lu, avec ce qui n'a pas pu être construit : `echecs`, l'indice de l'unité (dans l'ordre de `unitesForge()`) et la raison. |
| `definitionForge(fiche)` | La définition Forge d'une fiche qui porte son script (`fiche.forge`), ou `null`. |
| `nomsJetonsForge(texte)` | Les noms des jetons qu'un script crée, pour les joindre à sa fiche. |

## js/iaValeur.js

Ce que vaut une carte, un permanent, un adversaire. *8 fonctions, 85 lignes, 3.9 Ko.*

| Fonction | Rôle |
|---|---|
| `primeMots(m)` | — |
| `valeurDef(d)` | La valeur d'une définition, hors de toute partie. |
| `valeurObjet(P, o)` | La valeur d'un permanent tel qu'il est : marqueurs, bonus et blessures compris. |
| `forceDeFrappe(P, j)` | La force de frappe qu'un joueur a sur le champ. |
| `menace(P, j)` | La menace qu'un adversaire fait peser : son plateau, sa main, et à quel point il est près de gagner. |
| `estAMoi(P, c, j)` | Un objet est-il à moi, du point de vue d'un joueur ? |
| `opHostile(op)` | Une opération nuit-elle à ce qu'elle désigne ? |
| `opsSurCible(ops, i)` | Les opérations d'une liste qui portent sur l'emplacement de cible `i`. |

| Donnée | Rôle |
|---|---|
| `PRIME_MOTS` | — |
| `OPS_HOSTILES` | Les opérations qui nuisent à ce qu'elles visent. |

## js/iaChoix.js

Les choix du joueur automatique hors de la priorité. *8 fonctions, 122 lignes, 5.2 Ko.*

| Fonction | Rôle |
|---|---|
| `terrainsEnMain(P, j)` | — |
| `iaMulligan(P, q)` | Garder une main de sept : deux à cinq terrains. |
| `utiliteEnMain(P, j, id)` | Trier des cartes de la main de la moins utile à la plus utile : les terrains en trop d'abord, puis les sorts qu'on ne pourra pas lancer de sitôt, les injouables en tête. |
| `iaCibles(P, q)` | Choisir les cibles d'un emplacement : un effet hostile vise ce que l'adversaire a de mieux et qu'il peut atteindre, un effet favorable ce que j'ai de mieux. |
| `iaCartes(P, q)` | Choisir parmi des cartes ou des permanents selon ce qu'on en fait. |
| `iaScrute(P, q)` | Scruter : renvoyer dessous ce qui ne servira pas — des terrains quand on en a assez, des sorts trop chers sinon. |
| `iaOui(P, q)` | « You may » : oui, sauf à payer pour empêcher ce qui ne gêne guère. |
| `iaModes(P, q)` | Choisir des modes : ceux qui ont le plus d'effet. |

## js/iaPriorite.js

Ce que le joueur automatique fait de sa priorité. *10 fonctions, 196 lignes, 8.9 Ko.*

| Fonction | Rôle |
|---|---|
| `meilleureCibleHostile(P, j, slot, src, n)` | Le meilleur candidat hostile d'un emplacement, et sa valeur. |
| `scoreEffet(P, j, effet, src)` | Ce qu'un effet rapporte, à grands traits. |
| `impactSort(P, j, o)` | L'effet d'un sort qu'on lancerait maintenant. |
| `impactCapacite(P, j, o, k, ag)` | L'effet d'une capacité qu'on activerait maintenant. |
| `scoreTerrain(P, j, o)` | Le meilleur terrain à jouer : celui qui ouvre les couleurs que réclame la main, et qui entre dégagé. |
| `iaReponse(P, j, actions, ag)` | Hors phase principale : faut-il agir maintenant ? |
| `iaPriorite(P, q, ag)` | La réponse à une question de priorité. |
| `regenUtile(P, j, o)` | Une régénération sert-elle maintenant : la créature est au combat, ou un sort adverse au sommet de la pile pourrait la détruire ? |
| `scoreLancer(P, j, a)` | Ce que vaut une façon de lancer : le kicker seulement s'il change l'effet, le rachat parce qu'il rend la carte, l'évocation faute de mieux. |
| `noteActivation(P, a, ag, i)` | Compter les activations d'une capacité dans le tour, pour qu'une capacité gratuite ne soit pas activée sans fin. |

## js/iaCombat.js

Attaquer et bloquer, pour le joueur automatique. *4 fonctions, 82 lignes, 4.1 Ko.*

| Fonction | Rôle |
|---|---|
| `tue(P, b, a)` | B tue-t-il A ? |
| `choisitDefenseur(P, j, defenseurs)` | L'adversaire visé : celui qu'on peut achever, sinon le plus faible en points de vie, sinon le plus menaçant. |
| `iaAttaquants(P, q)` | Les attaquants. |
| `iaBloqueurs(P, q)` | Les bloqueurs. |

## js/iaAgent.js

Un joueur automatique. *1 fonctions, 34 lignes, 1.5 Ko.*

| Fonction | Rôle |
|---|---|
| `agentIA(graine, siege)` | — |

## js/symboles.js

Les symboles de mana. *7 fonctions, 72 lignes, 2.9 Ko.*

| Fonction | Rôle |
|---|---|
| `loadSymbology()` | — |
| `pipHTML(inner, taille)` | — |
| `symBg(inner)` | — |
| `symIcon(inner, taille)` | — |
| `manaFb(img)` | — |
| `manaHTML(card, sm)` | — |
| `stripeColor(card)` | — |

| Donnée | Rôle |
|---|---|
| `SYMS` | — |
| `MAJ_CARTES` | Chaque carte complétée par Scryfall — texte, coût, prix, légalité — peut changer sa note. |

## js/champsJeu.js

Ce que le moteur de jeu demande à une carte. *7 fonctions, 91 lignes, 4 Ko.*

| Fonction | Rôle |
|---|---|
| `nombreOuRien(v)` | Un nombre ou rien : « X », « * » et « 1+* » ne se jouent pas comme un nombre, et le moteur doit le savoir plutôt que lire zéro. |
| `champsJeuScryfall(sc)` | Les champs de jeu d'une réponse de Scryfall. |
| `colonnesJeu(sc)` | Les mêmes champs, dans l'ordre des colonnes que `compacte()` ajoute en fin d'enregistrement (`CH.MOTS_CLES` … `CH.PT_BRUT`). |
| `champsJeuRec(rec)` | Les champs de jeu d'un enregistrement de l'archive. |
| `appliqueChampsJeu(card, j)` | Verser des champs de jeu dans une carte, sans effacer ce qu'elle savait déjà par une source plus riche. |
| `jeuSnap(c)` | Ce qu'une carte sauvegardée emporte de ses champs de jeu — rien quand elle n'en a pas, pour ne pas alourdir la sauvegarde de clés vides. |
| `jeuRestore(card, o)` | L'inverse de `jeuSnap()`. |

## js/scryfallApplique.js

Verser une réponse de Scryfall dans une carte. *2 fonctions, 148 lignes, 6.8 Ko.*

| Fonction | Rôle |
|---|---|
| `scryTarget(sc, map)` | — |
| `applyScryfall(sc, requested, imagesOnly)` | — |

## js/scryfall.js

La file d'attente vers Scryfall. *7 fonctions, 181 lignes, 7.7 Ko.*

| Fonction | Rôle |
|---|---|
| `identScryfall(c)` | Identifiant demandé à Scryfall : l'édition relevée à l'import quand la carte en a une, le nom sinon. |
| `cibleImpression(sc, parImpression)` | Retrouve la carte visée par une réponse, d'abord par l'édition demandée. |
| `indexImpressions(cartes)` | — |
| `besoinScryfall(c)` | Une carte mérite un aller-retour Scryfall tant qu'il lui manque son visuel ou son texte oracle complet : la base intégrée n'en garde qu'un résumé, ce qui coupait par exemple… |
| `queueScryfall(cards)` | — |
| `runScryQueue()` | — |
| `completeUnknown(names)` | — |

| Donnée | Rôle |
|---|---|
| `scryQueue` | — |
| `scryBusy` | — |

## js/recherches.js

Les recherches nommées chez Scryfall. *10 fonctions, 208 lignes, 8.6 Ko.*

| Fonction | Rôle |
|---|---|
| `majRecherches(cible)` | La réponse de Scryfall met à jour ce qui est ouvert : la fenêtre d'ajout des listes annexes, ou le champ de recherche d'une section — jamais les deux, et chacune se tait si elle n'est… |
| `chercheScryfall(q, cible)` | — |
| `semeVisuelVersion(card)` | Visuels de chaque édition possédée, pour les faire défiler dans la fiche. |
| `visuelDepuisScryfall(sc)` | — |
| `chercheImpressions(card)` | — |
| `chercheToutesEditions(card)` | Toutes les éditions publiées d'une carte, à la demande seulement : une recherche « unique=prints », dont on suit les pages jusqu'à trois. |
| `chercheVerso(card)` | — |
| `chercheTexte(card)` | Complète le texte oracle d'une seule carte, pour la fiche ouverte : sans cela une carte de la base intégrée reste affichée avec son résumé. |
| `carteDepuisScryfall(sc)` | — |
| `enrichAllUnknown()` | — |

| Donnée | Rôle |
|---|---|
| `scrySeq` | — |

## js/decksStockage.js

Les dossiers de deck, rangés et relus. *3 fonctions, 91 lignes, 4 Ko.*

| Fonction | Rôle |
|---|---|
| `deckSnap(cle)` | Un dossier de deck tel qu'il se range : les Map en paires, les Set en tableaux, comme le reste de la sauvegarde. |
| `ciblesPropres(src)` | Les objectifs par rôle, format par format : une valeur qui n'est pas un nombre positif est écartée, et le rôle reprend la cible que le format lui donne. |
| `restaureDecks(d)` | Les decks, et la sauvegarde d'hier qui n'en connaissait qu'un. |

## js/stockage.js

La sauvegarde locale. *9 fonctions, 289 lignes, 12 Ko.*

| Fonction | Rôle |
|---|---|
| `storageOK(()` | — |
| `impressionSnap(c)` | Éditions relevées à l'import : le code d'édition et le numéro de collection de l'impression possédée, et la liste de celles qui ont été vues. |
| `impressionRestore(card, o)` | — |
| `snapshot()` | — |
| `ecrire(payload)` | — |
| `save()` | — |
| `scheduleSave()` | — |
| `restore(d)` | — |
| `chargerSauvegarde()` | — |

| Donnée | Rôle |
|---|---|
| `STORE_KEY` | — |
| `STORE_OFF` | — |
| `saveTimer` | — |
| `saveState` | — |
| `saveError` | — |
| `dernierEtatSignale` | — |

## js/fenSauvegarde.js

Les sections « Sauvegarde » et « Catalogue » des paramètres. *6 fonctions, 200 lignes, 12 Ko.*

| Fonction | Rôle |
|---|---|
| `corpsSauvegarde()` | — |
| `blocCatalogue()` | — |
| `rafraichirFenetreSauvegarde()` | La fenêtre des paramètres reste ouverte pendant qu'une archive se charge : son contenu est réécrit sur place quand l'état du catalogue a bougé. |
| `brancherSauvegarde()` | L'interrupteur de la sauvegarde, dans la section « Sauvegarde locale » de la fenêtre des paramètres : cocher réactive et réécrit tout, décocher efface sur-le-champ ce que cet appareil… |
| `brancherCatalogue()` | — |
| `brancherRestauration()` | — |

## js/idb.js

Le magasin IndexedDB. *6 fonctions, 75 lignes, 3.1 Ko.*

| Fonction | Rôle |
|---|---|
| `idbGardee(cle)` | — |
| `idb()` | — |
| `idbLire(cle)` | — |
| `idbEcrire(cle, val)` | — |
| `idbOublier(cle)` | Oublier une seule entrée, quand on sait laquelle. |
| `idbVider()` | Vider le magasin, sauf ce qui doit survivre : on efface entrée par entrée plutôt que d'un `clear()`, seul moyen d'en épargner une. |

| Donnée | Rôle |
|---|---|
| `IDB_NOM` | — |
| `IDB_NUAGE_BASE` | La base de fusion de la synchronisation (js/nuage.js) dort ici, faute de place dans `localStorage`. |
| `IDB_GARDES` | Ce que `idbVider()` épargne : la base de la synchronisation, les fiches des cartes adverses et les résultats des simulations (js/simCartes.js, js/simStockage.js), et les scripts de Forge… |

## js/nuagePaquet.js

Ce qui voyage d'un appareil à l'autre. *7 fonctions, 123 lignes, 5.4 Ko.*

| Fonction | Rôle |
|---|---|
| `nuagePaquet(appareil)` | Le paquet tel qu'il part : le fond, le cache, et de quoi dire qui a écrit quand — un conflit se raconte mal sans nom d'appareil. |
| `nuageFond(paquet)` | Le fond seul, pour la base de fusion : les quantités et les réglages de deck, sans le cache des cartes. |
| `nuageVerse(paquet)` | Verser un paquet fusionné dans l'état. Le passer à `restore()` plutôt que d'écrire une seconde application : celui-là sait déjà inscrire une carte inconnue dans la base, écarter un nom… |
| `nuageComprime(txt)` | Le gzip du navigateur, sans dépendance : un instantané de quatre mille cartes passe de trois mégaoctets à moins de cinq cents kilo-octets, et part en octets bruts — Dropbox prend le… |
| `nuageDecomprime(octets)` | — |
| `nuageEmballe(paquet)` | Un paquet vers les octets qui partent, et l'inverse. |
| `nuageDeballe(octets)` | — |

| Donnée | Rôle |
|---|---|
| `NUAGE_PAQUET_V` | — |
| `NUAGE_QTES` | Les quantités par nom de carte, qui se fusionnent entrée par entrée. |
| `NUAGE_SCALAIRES` | Ce qui ne vaut qu'une valeur, et se tranche en bloc. |
| `NUAGE_OBJETS` | `achats` — comment on achète — voyage ; le plafond, lui, appartient au deck et part avec son dossier. |
| `NUAGE_ENSEMBLES` | — |

## js/nuageFusion.js

Fusionner deux appareils sans rien perdre. *11 fonctions, 234 lignes, 11 Ko.*

| Fonction | Rôle |
|---|---|
| `nuageStable(v)` | Une écriture JSON aux clés ordonnées : les deux appareils ne construisent pas forcément leurs objets dans le même ordre, et une comparaison naïve verrait une différence là où il n'y en a… |
| `fusionneQuantites(base, local, distant)` | Les quantités d'une liste, entrée par entrée. |
| `fusionneEnsemble(base, local, distant)` | Un ensemble — les commandants secondaires écartés, par exemple. |
| `fusionneValeur(base, local, distant, champ)` | Une valeur qui ne se coupe pas en deux — le commandant, le format, le budget. |
| `nuageGarniture(o)` | Combien de champs une entrée de cache porte vraiment : c'est ce qui tranche entre deux versions d'une même carte, l'une complétée par Scryfall et l'autre non. |
| `fusionneCache(local, distant)` | Le cache des cartes : une union, jamais un conflit. |
| `indexDecks(liste)` | — |
| `fusionneDecks(base, local, distant)` | — |
| `empreinteDeck(o)` | L'empreinte d'un dossier, aux listes ordonnées : sans quoi deux dossiers identiques aux paires rangées autrement passeraient pour différents, et chaque tour pousserait pour rien. |
| `empreinteFond(fond)` | L'empreinte du fond, ordonnée : deux fonds égaux la partagent, quel que soit l'ordre où leurs tables ont été bâties. |
| `fusionnePaquets(base, local, distant)` | La fusion entière. `base` est le fond du dernier accord, et peut manquer : au premier accord, ou après un effacement des données locales. On retombe alors sur une fusion à deux côtés —… |

| Donnée | Rôle |
|---|---|
| `DECK_CHAMPS_SIMPLES` | Les decks, dossier par dossier puis carte par carte. |

## js/nuageDropbox.js

L'adaptateur Dropbox. *17 fonctions, 240 lignes, 10 Ko.*

| Fonction | Rôle |
|---|---|
| `dbxRetour()` | Ce que Dropbox doit retrouver à l'identique dans sa liste d'adresses autorisées. |
| `dbxBase64Url(octets)` | — |
| `dbxDefi()` | Le code de preuve : un secret tiré au hasard qu'on garde, et son empreinte qu'on annonce. |
| `dbxErreurReseau(err)` | Un échec de `fetch` sans réponse est presque toujours la barrière CORS ou l'absence de réseau, jamais un refus de Dropbox : le dire ainsi épargne une heure de recherche du côté du jeton. |
| `dbxJson(reponse)` | — |
| `dbxErreur(reponse, corps, ou)` | Ce que Dropbox renvoie prend deux formes, et la seconde est la plus utile : un JSON dont `error_summary` est un chemin d'erreur — « path/conflict/file/… » —, ou, sur une requête… |
| `dbxConnexion(cle)` | Premier temps : on part chez Dropbox. Le vérifieur et l'état attendent dans la clé de configuration — la page va être quittée puis rechargée, rien ne survit en mémoire. |
| `dbxRetourConnexion()` | Second temps, au rechargement : l'adresse porte le code. |
| `dbxPoste(url, corps)` | — |
| `dbxEchange(code, verifieur)` | — |
| `dbxNoteJeton(j)` | — |
| `dbxJetonValide()` | Le jeton d'accès vit quatre heures ; celui de rafraîchissement ne meurt pas. |
| `dbxArg(o)` | L'en-tête `Dropbox-API-Arg` ne passe qu'en ASCII : tout ce qui dépasse s'y écrit en échappement JSON. |
| `dbxAppel(url, entetes, corps)` | — |
| `dbxLire(chemin)` | Lire le paquet. Un fichier absent n'est pas une erreur : c'est le premier accord, et l'on part alors de ce que cet appareil connaît. |
| `dbxEcrire(chemin, octets, rev)` | Écrire le paquet. Un `rev` vide veut dire « ce fichier n'existait pas » et l'écriture est alors un ajout qui refuse d'écraser ; sinon c'est une mise à jour conditionnée au `rev` lu, que… |
| `dbxCompte()` | De quoi nommer le compte connecté dans la fenêtre : on ne synchronise pas à l'aveugle vers un compte dont on n'est pas sûr. |

| Donnée | Rôle |
|---|---|
| `NUAGE_DBX_CLE` | La clé de l'application Dropbox. Publique par nature dans un flux PKCE — elle paraît dans chaque adresse de redirection —, elle peut donc être inscrite ici une fois pour toutes : les… |
| `DBX_AUTORISE` | — |
| `DBX_JETON` | — |
| `DBX_API` | — |
| `DBX_CONTENU` | — |

## js/nuage.js

La synchronisation : sa configuration, et son calendrier. *12 fonctions, 275 lignes, 9.8 Ko.*

| Fonction | Rôle |
|---|---|
| `nuageLire()` | — |
| `nuageEcrire()` | — |
| `nuageConnecte()` | — |
| `nuageNomParDefaut()` | Un nom d'appareil qu'on puisse reconnaître dans un message de conflit, sans rien demander à l'ouverture. |
| `nuageBaseLire()` | La base : le fond du dernier accord. Une lecture qui échoue rend `null`, et la fusion retombe d'elle-même sur deux côtés — dégradée, mais jamais bloquée. |
| `nuageBaseEcrire(fond)` | — |
| `nuageTour(rejoue)` | Tirer, fusionner, verser, pousser. Un conflit de `rev` — l'autre appareil a écrit pendant notre aller-retour — se rejoue une fois : on relit, on refusionne sur le nouveau distant, on… |
| `nuagePoids(o)` | — |
| `nuageSynchro(manuel)` | Le tour, habillé : un seul à la fois, l'état rendu à la fenêtre si elle est ouverte, et un mot au lecteur quand c'est lui qui a demandé. |
| `nuagePousseeDifferee()` | — |
| `nuageDemarrer()` | — |
| `nuageDeconnecte()` | — |

| Donnée | Rôle |
|---|---|
| `NUAGE_CLE` | — |
| `NUAGE_ETRANGLE` | Une poussée au plus toutes les quinze secondes : `scheduleSave()` se déclenche à chaque geste, et l'on ne va pas chez Dropbox à chaque carte ajoutée. |
| `NUAGE_FRAICHEUR` | Au retour sur l'onglet, on ne retire que si le dernier accord a plus d'une minute : revenir d'un autre onglet trois fois de suite ne vaut pas trois allers-retours. |
| `NUAGE` | — |
| `NUAGE_DURABLE` | — |
| `nuageMinuteur` | La poussée qui suit un geste. Étranglée, et toujours différée : on ne part pas chez Dropbox au milieu d'un ajout de carte. |
| `nuageDerniereAuto` | — |

## js/nuageDiagnostic.js

Éprouver la connexion, étape par étape. *3 fonctions, 86 lignes, 3.9 Ko.*

| Fonction | Rôle |
|---|---|
| `nuageEtape(nom, faire)` | Une étape : son nom, et ce qu'elle a donné. |
| `nuageEffaceTemoin()` | Supprimer le témoin. C'est une étape à part : elle demande la même permission d'écriture que le dépôt, et son échec isolé dirait que `files.content.write` a été accordée à moitié. |
| `nuageDiagnostic()` | — |

| Donnée | Rôle |
|---|---|
| `NUAGE_TEMOIN` | — |

## js/edhrec.js

Les statistiques d'EDHREC pour un commandant. *6 fonctions, 242 lignes, 8.6 Ko.*

| Fonction | Rôle |
|---|---|
| `edhrecSlug(name)` | — |
| `fetchEdhrecCommander(cmdName, force)` | — |
| `edhrecFor(card)` | — |
| `edhrecAllFor(card)` | — |
| `signatureCommandants()` | Les commandants que l'atelier croise avec EDHREC, en une chaîne : le principal et les secondaires retenus. |
| `loadEdhrec(force)` | — |

| Donnée | Rôle |
|---|---|
| `EDHREC_CACHE` | — |

## js/edhrecForme.js

Deviner la forme des pages de thèmes d'EDHREC. *7 fonctions, 142 lignes, 5.5 Ko.*

| Fonction | Rôle |
|---|---|
| `pauseEdhrec()` | — |
| `formesDeduites()` | Dernier recours : une page de commandant cite les pages de thème du site. |
| `formeThemeEdhrec()` | Cherche la forme d'adresse qui répond avec des cartes lisibles. |
| `temoinEdhrec()` | Témoin : une page de commandant, dont l'adresse est sûre. |
| `nomsPageEdhrec(j)` | Noms de cartes d'une page EDHREC, quelle que soit la variante de forme. |
| `indexDepuisCartes(cartes)` | — |
| `cartesDepuisIndex(index)` | — |

| Donnée | Rôle |
|---|---|
| `ARCH_CLE_IDB` | — |
| `ARCH_PAUSE` | — |
| `ARCH_FRAICHEUR` | EDHREC ne publie aucun manifeste daté : impossible de demander « ta liste a-t-elle changé ? » sans la relire. |
| `ARCH_HOTE` | json.edhrec.com est un dépôt de fichiers : une clé absente répond « AccessDenied », jamais 404. |
| `ARCH_FORMES` | — |
| `ARCH_SONDES` | — |
| `ARCH_TEMOIN` | — |

## js/edhrecThemes.js

L'index des thèmes EDHREC. *10 fonctions, 179 lignes, 7.2 Ko.*

| Fonction | Rôle |
|---|---|
| `reprendreArchetypesEdhrec()` | Reprise du cache local, au démarrage. |
| `urlIndexEdhrec(pre)` | Index des thèmes publiés par EDHREC : une requête, quelques centaines d'entrées. |
| `descriptionPageEdhrec(j)` | Description que la page d'un thème porte parfois en tête. |
| `themesPageEdhrec(j)` | Noms et libellés des thèmes, quelle que soit la variante de forme. |
| `chargerListeArchetypesEdhrec()` | Cherche l'index, en partant du préfixe déjà validé pour les thèmes. |
| `chargerThemeEdhrec(slug)` | Cartes d'un thème, cherchées à la première utilisation puis gardées. |
| `sauverArchetypesEdhrec()` | — |
| `signatureArchetypes(liste)` | Une liste vaut l'autre si elle porte les mêmes thèmes. |
| `archetypesARevoir()` | Y a-t-il lieu d'interroger EDHREC ? Oui si nous n'avons rien, ou si notre liste a passé la semaine. |
| `chargerArchetypesEdhrec()` | Chargement automatique, au démarrage : l'index, puis les thèmes déjà cochés. |

## js/sets.js

Les sets publiés par Scryfall. *8 fonctions, 156 lignes, 6.4 Ko.*

| Fonction | Rôle |
|---|---|
| `setRetenu(s)` | — |
| `reprendreSets()` | Reprise du cache local, au démarrage : sans elle, un set coché avant le rechargement ne filtrerait plus rien tant que Scryfall n'a pas répondu. |
| `sauverSets()` | — |
| `setsARevoir()` | Y a-t-il lieu d'interroger Scryfall ? Oui si nous n'avons rien, ou si notre liste a passé la semaine. |
| `oublieCartesSets()` | Les cartes déjà relevées d'un set l'ont été sous un réglage donné : changer d'avis sur le numérique les rend caduques, il faut les redemander. |
| `chargerListeSets()` | La liste des sets : une requête, quelques centaines d'entrées. |
| `noteSetIndex(nom, code)` | — |
| `chargerSetScryfall(code)` | Les cartes d'un set, à sa première utilisation. |

| Donnée | Rôle |
|---|---|
| `SETS_CLE_IDB` | — |
| `SETS_FRAICHEUR` | — |
| `SETS_PAGES` | — |
| `SETS_PAUSE` | — |
| `SETS_ECARTES` | Sets proposés : ceux qu'on peut avoir en main. |

## js/gameChangers.js

La liste des « Game Changers ». *4 fonctions, 77 lignes, 2.9 Ko.*

| Fonction | Rôle |
|---|---|
| `reprendreGameChangers()` | — |
| `sauverGameChangers()` | — |
| `gameChangersARevoir()` | — |
| `chargerGameChangers()` | — |

| Donnée | Rôle |
|---|---|
| `GC_CLE_IDB` | — |
| `GC_FRAICHEUR` | — |
| `GC_PAGES` | — |

## js/archive.js

Lire l'archive Scryfall. *11 fonctions, 226 lignes, 10 Ko.*

| Fonction | Rôle |
|---|---|
| `compacte(sc)` | — |
| `autoCatalogue()` | — |
| `estGzip(nom, octets)` | — |
| `compteurOctets(onOctets)` | Compte les octets qui passent, sans rien retenir : c'est ce qui permet d'annoncer un vrai pourcentage sans garder l'archive en mémoire. |
| `nouveauSuivi(source, totalRecu, totalExtrait)` | L'avancement d'un chargement d'archive, tel que la boîte de progression le lit. |
| `fluxTexte(source, nom, suivi)` | — |
| `fusionneSets(a, b)` | Réunit deux listes de codes d'édition, sans doublon. |
| `retiens(par, rec)` | Les impressions d'une même carte se fondent en une seule ligne — la mieux classée — mais leurs codes d'édition s'y accumulent. |
| `tailleEstimee(cartes)` | — |
| `ArchiveAbandonnee()` | Levée quand l'utilisateur interrompt : ce n'est pas une panne, et l'appelant la distingue d'une erreur. |
| `lireCatalogueFichier(source, nom, suivi)` | — |

| Donnée | Rôle |
|---|---|
| `CDN` | — |
| `FICHIERS_LOCAUX` | — |

## js/catalogue.js

Tenir le catalogue à jour. *10 fonctions, 232 lignes, 11 Ko.*

| Fonction | Rôle |
|---|---|
| `chargerCatalogueLocal()` | — |
| `verifierMajCatalogue()` | — |
| `catalogueObsolete()` | — |
| `majPrix(force)` | — |
| `telechargerCatalogue()` | — |
| `interrompreCatalogue()` | Interrompt le chargement en cours : le drapeau arrête la boucle de lecture, l'`AbortController` coupe le téléchargement lui-même. |
| `chargerCatalogueComplet(force)` | — |
| `demarrerCatalogue()` | Enchaînement du démarrage : on regarde d'abord ce que cet appareil garde déjà des cartes existantes, puis ce que Scryfall publie. |
| `proposerMajCatalogue()` | Fenêtre signalant que les données des cartes ont pu changer. |
| `majCatalogue()` | Bouton « Mettre à jour » de la fenêtre de sauvegarde, et de la fenêtre ci-dessus : on teste la version publiée, et l'archive n'est retéléchargée que si elle manque ou si elle a vieilli. |

## js/candidats.js

Des enregistrements de l'archive aux cartes candidates. *14 fonctions, 261 lignes, 12 Ko.*

| Fonction | Rôle |
|---|---|
| `completeDepuisRec(c, rec)` | — |
| `noterLegalArchive(c, rec)` | Ce que l'archive sait de la légalité d'une carte. |
| `noterSetsArchive(c, rec)` | Ce que l'archive sait des éditions d'une carte, gardé sur la carte pour que le filtre par set réponde sans réseau. |
| `carteDuCatalogue(rec)` | — |
| `invaliderCandidats()` | — |
| `signatureCandidats()` | Les critères de la fenêtre entrent dans la signature : sans eux, le décompte annoncé resservirait celui d'avant le filtre. |
| `appliqueCatalogueAuxCartes()` | Le catalogue local porte le texte oracle complet et les prix à jour : on en profite pour remplacer, sans requête réseau, les résumés de la base intégrée et les prix des cartes possédées… |
| `selectionCandidats()` | Le tri de la sélection : la boucle qui écarte, puis le classement par rang EDHREC. |
| `candidatsCatalogue()` | Les cartes du catalogue qu'il vaut la peine de proposer. |
| `prechauffeCandidats(onProgress)` | La même construction, mais par tranches : bâtir les objets carte est le gros du travail, et la barre de progression d'« Appliquer » a besoin de rendre la main pour se peindre. |
| `statsCandidats()` | Le détail de ce qui a écarté, pour la phrase de la section Suggestions. |
| `requeteCatalogue()` | — |
| `signatureCatalogue()` | — |
| `chargerCatalogue()` | — |

| Donnée | Rôle |
|---|---|
| `CAND` | — |

## js/graphe.js

Visualisation circulaire interactive des capacités. *4 fonctions, 169 lignes, 9.4 Ko.*

| Fonction | Rôle |
|---|---|
| `graphCards()` | — |
| `buildGraph(cards)` | — |
| `svgGraph(g)` | — |
| `renderD()` | — |

## js/stats.js

Statistiques, répartitions & courbes de mana. *5 fonctions, 113 lignes, 5.4 Ko.*

| Fonction | Rôle |
|---|---|
| `statsOf(list)` | — |
| `repartitionCmc(entries)` | La courbe de mana d'une liste : combien d'exemplaires à chaque coût, la quantité répartie entre les couleurs de l'identité. |
| `totalBarre(v)` | Le total d'une barre. Arrondir chaque couleur ne suffit pas : `0,3 + 0,3 + 0,3` ne fait pas `0,9` en virgule flottante, et la barre annonçait « 0.8999999999999999 ». C'est la somme qu'il… |
| `histogram(dataByCmc, colorSplit)` | — |
| `renderC()` | — |

## js/notation.js

La note d'une carte candidate. *5 fonctions, 239 lignes, 11 Ko.*

| Fonction | Rôle |
|---|---|
| `contexteEvaluation()` | — |
| `noteCarte(p, X)` | — |
| `nbInteractions(note)` | Le nombre d'interactions d'une note est un nombre de cartes du deck, jamais un nombre d'arcs : une carte reliée par quatre effets reste une carte. |
| `nbCartesLarges(note)` | Les cartes que seul un déclencheur large atteint : elles se disent à part, entre parenthèses, pour ne pas gonfler le décompte des interactions. |
| `nbLiens(note)` | Le nombre d'arcs, lui, ne sert qu'à l'infobulle : il dit par combien d'effets passent les interactions précises. |

## js/vivier.js

Le vivier des candidates, et son empreinte. *9 fonctions, 204 lignes, 8.7 Ko.*

| Fonction | Rôle |
|---|---|
| `vivierSuggestions()` | La sélection se fait en deux temps : bâtir le vivier — toutes les cartes qu'on pourrait proposer — puis le noter. |
| `noterVivier(pool, X, res, debut, fin)` | Notation d'une tranche du vivier, de `debut` inclus à `fin` exclu. |
| `ordonneSuggestions(res)` | Les filtres de l'en-tête valent aussi pour ce qu'on propose d'ajouter. |
| `empreinteCollection()` | Une empreinte bon marché de la collection : nombre d'entrées, exemplaires, et un condensé des noms. |
| `tailleDe(x)` | — |
| `signatureSuggestions()` | — |
| `suggestionsAJour()` | La sélection est-elle encore bonne ? C'est ce que regardent le rendu de la section et la boîte de recalcul, pour ne pas annoncer un travail qui n'a pas lieu d'être. |
| `currentSuggestions()` | — |
| `prepareSuggestions(onProgress)` | La même notation, par tranches, en rendant la main entre chacune : c'est elle que la barre de progression accompagne. |

| Donnée | Rôle |
|---|---|
| `SUG_MEMO` | — |

## js/sugOrdre.js

L'ordre gelé des propositions. *6 fonctions, 80 lignes, 3.7 Ko.*

| Fonction | Rôle |
|---|---|
| `geleSuggestions()` | Gèle l'ordre tel qu'il est affiché — c'est-à-dire la dernière sélection rendue, jamais une notation en cours : `SUG_MEMO.liste` porte exactement ce que la section montre, et le lire ne… |
| `ordreGele()` | — |
| `degeleSuggestions()` | — |
| `suggestionsAffichees()` | La sélection dans l'ordre où elle s'affiche : celui des scores, ou celui qui a été gelé — rang connu d'abord, nouvelles venues à la suite. |
| `classementDecale()` | L'ordre affiché diffère-t-il de celui des scores ? C'est ce qui décide du bandeau : sans différence, rien à proposer. |
| `bandeauReclassement()` | — |

| Donnée | Rôle |
|---|---|
| `SUG_ORDRE` | — |

## js/sugCommandants.js

Les commandants du deck, en tête de l'onglet EDHREC. *4 fonctions, 139 lignes, 8.5 Ko.*

| Fonction | Rôle |
|---|---|
| `lienDecksEdhrec(nom, actif)` | Le nombre de decks recensés par EDHREC pour un commandant, et le lien vers sa page — le décompte est le lien : c'est là qu'on veut aller quand on le lit. |
| `ligneCommandant(carte, principal)` | Une ligne : la marque à gauche — l'étoile d'un principal, la case d'un secondaire —, le nom au milieu, le décompte à droite. |
| `blocCommandants(principaux, secPossibles)` | — |
| `panneauEdhrec()` | — |

## js/sugListes.js

Le fond commun des trois listes de propositions. *11 fonctions, 142 lignes, 6.8 Ko.*

| Fonction | Rôle |
|---|---|
| `selectionSuggestions()` | — |
| `listeSug(section, sel)` | La liste d'une section, dans la sélection partitionnée : c'est la même table que lisent la pagination et les rendus. |
| `defautSug(section, plat)` | — |
| `cleLimiteSug(section, idGroupe)` | La clé de pagination d'une catégorie. Elle porte sa section : sans cela, « Créature » partagerait son compte entre le graphe, EDHREC et le catalogue, et déplier l'une déplierait les… |
| `maxSug(section, g, plat, defaut)` | — |
| `paginationListe(cle, total, max, defaut)` | Les boutons de pagination d'une liste, ou rien si tout tient. |
| `corpsSug(section, g, plat, defaut)` | Le corps d'un groupe : ses cartes dans la vue de la section — vignettes en grille, dont le nombre de colonnes se règle, ou une ligne par carte — et sa pagination. |
| `listesSug(section, groupes, mode, titre, couleur)` | Les listes d'une section : sans groupement, un seul bloc titré ; groupée, une enveloppe repliable par catégorie. |
| `renvoiCatalogue(quoi)` | Le renvoi au catalogue : les deux listes courtes ne montrent qu'un extrait du classement, et le dire évite de les croire exhaustives. |
| `visuelsSuggestions(vus)` | Les visuels des vignettes qu'une section affiche. |
| `visuelsGroupes(section, groupes, mode)` | Ceux d'une section groupe par groupe : une catégorie repliée ne montre rien, et demander les visuels de vignettes que personne ne voit serait autant de requêtes pour rien. |

| Donnée | Rôle |
|---|---|
| `DEFAUT_SUG` | Le nombre de vignettes qu'une liste montre d'abord. |

## js/sugGraphe.js

La section du graphe : ce qui se branche sur les nœuds. *1 fonctions, 41 lignes, 2.1 Ko.*

| Fonction | Rôle |
|---|---|
| `blocGraphe(sel)` | — |

## js/sugEdhrec.js

La section EDHREC : ce que les decks recensés recommandent. *1 fonctions, 52 lignes, 2.8 Ko.*

| Fonction | Rôle |
|---|---|
| `blocEdhrec(sel)` | — |

## js/sugCatalogue.js

La section du catalogue : tout le classement. *1 fonctions, 34 lignes, 2.2 Ko.*

| Fonction | Rôle |
|---|---|
| `listeSuggestions(sel)` | — |

## js/suggestions.js

Les trois sections des propositions. *13 fonctions, 252 lignes, 13 Ko.*

| Fonction | Rôle |
|---|---|
| `ligneCatalogue()` | — |
| `ligneBudget()` | Le budget et les préférences d'achat se règlent désormais dans la fenêtre « Achats sur Cardmarket », ouverte par la pastille « Budget » de l'en-tête (js/fenBudget.js). |
| `ligneAchats()` | — |
| `chargeVisuelsClasses()` | Les visuels partent par paquets de six, pour ne pas ouvrir cent requêtes d'un coup. |
| `majHint(idSection, texte)` | Le décompte d'une section, dans son en-tête : « 104 pistes ». |
| `poseCorps(idCorps, morceaux)` | Poser le contenu d'une section sans en refaire l'enveloppe : les conteneurs nommés survivent d'un rendu à l'autre, et seuls leurs contenus sont réécrits. |
| `filetSuggestions()` | Le filet : un changement a rendu la sélection caduque sans passer par un geste identifié — une archive qui finit de charger, une réponse de Scryfall, un réglage venu d'ailleurs. |
| `renderSuggestions()` | Les trois sections des propositions, peintes ensemble : la sélection n'est partitionnée qu'une fois, et une donnée qui arrive — d'EDHREC, du catalogue, de Scryfall — les met toutes les… |
| `renderG(sel)` | La section du graphe (onglet Graphe) : les pistes branchées sur les nœuds isolés. |
| `renderH(sel)` | La section EDHREC (onglet EDHREC) : le panneau du commandant, puis les cartes que les decks recensés recommandent. |
| `renderF(sel)` | La section du catalogue (onglet Catalogue) : l'état du catalogue, puis tout le classement. |
| `refreshSuggestions()` | Rafraîchir sans rien recalculer : la pagination d'une liste, un groupement, un tri. |
| `lanceEdhrecSiBesoin()` | Les statistiques du commandant sont demandées dès que celui-ci change — d'où que vienne le rendu, complet ou en place. |

| Donnée | Rôle |
|---|---|
| `visuelsEnCours` | — |
| `VISUELS_CHARGES` | — |

## js/decksSection.js

La section « Mes decks ». *4 fonctions, 103 lignes, 5.4 Ko.*

| Fonction | Rôle |
|---|---|
| `coutDeck(cle)` | Ce que coûte encore un deck, sans passer par `aAcheter()` : on ne veut pas d'une estimation d'offre par carte manquante pour chacun des huit decks à chaque rendu de la page. |
| `puceStatut(d)` | — |
| `vignetteDeck(cle)` | — |
| `renderI()` | — |

## js/wishlistSection.js

La section « Liste d'achats ». *3 fonctions, 68 lignes, 3.7 Ko.*

| Fonction | Rôle |
|---|---|
| `decksDemandeurs(l)` | Les decks qui réclament une carte, du plus gourmand au moins. |
| `ligneWishlist(l)` | — |
| `renderJ()` | — |

## js/collection.js

La section Collection. *9 fonctions, 156 lignes, 7.9 Ko.*

| Fonction | Rôle |
|---|---|
| `couleursOK(card, sel, mode)` | Une carte tient dans une sélection de couleurs, selon le mode voulu. |
| `colorOK(card)` | — |
| `ajoutCollection(nom)` | Un exemplaire de plus ou de moins dans la collection. |
| `retraitCollection(nom)` | — |
| `collectionCards()` | — |
| `filtered()` | — |
| `causesCollection()` | Ce qui écarte des cartes de la collection affichée, cause par cause, dans l'ordre où les critères s'appliquent. |
| `ligneCausesCollection()` | La phrase qui les nomme, chacune avec le geste qui la lève. |
| `renderB()` | — |

| Donnée | Rôle |
|---|---|
| `PAGE` | — |

## js/fenImport.js

Importer une liste de cartes. *4 fonctions, 222 lignes, 12 Ko.*

| Fonction | Rôle |
|---|---|
| `retireExtrait(s, i, n)` | — |
| `extraitEdition(texte)` | — |
| `parseMtgoList(txt)` | — |
| `openImport(cible)` | — |

| Donnée | Rôle |
|---|---|
| `RE_ED_DIESE` | — |
| `RE_ED` | — |
| `RE_NUMERO` | — |

## js/fenAjout.js

Ajouter une carte à la main. *5 fonctions, 126 lignes, 6.3 Ko.*

| Fonction | Rôle |
|---|---|
| `ajouterCarte(c, q, cible, completer)` | — |
| `chercheCartes(q)` | — |
| `resultatsAjoutHTML(q, cible)` | — |
| `majResultats(cible, sansRelancer)` | — |
| `openAdd(cible)` | — |

## js/rechercheSection.js

Le champ de recherche d'une section. *11 fonctions, 178 lignes, 8.3 Ko.*

| Fonction | Rôle |
|---|---|
| `etatRecherche(cible)` | — |
| `compteListe(cible, nom)` | Combien d'exemplaires une liste porte déjà. |
| `champRecherche(cible)` | Le champ et ses propositions, posés sous la barre de la section. |
| `ligneProposition(c, cible)` | Une proposition : le nom — survolé, il montre son visuel —, ce qu'en dit l'autre liste, et le compteur qu'on fait défiler. |
| `ligneEnLigne(nom, cible)` | Une carte que Scryfall connaît et que le catalogue n'a pas : elle n'existe pas encore dans l'atelier, il n'y a donc rien à compter — seul l'ajout a du sens, et c'est lui qui l'inscrit. |
| `propositionsHTML(cible)` | — |
| `majPropositions(cible)` | Seules les propositions sont réécrites pendant la frappe : réécrire la section volerait le curseur du champ qu'on est en train de remplir. |
| `saisieRecherche(cible, valeur)` | La frappe. Scryfall n'est interrogé qu'après une pause et seulement si le catalogue local n'a rien : c'est le même délai que la fenêtre d'ajout. |
| `pasRecherche(nom, cible, pas)` | Un exemplaire de plus ou de moins, d'où que vienne le geste : le clic sur un nom, les deux boutons du compteur, ou la molette au-dessus de lui. |
| `molletteRecherche(el, deltaY)` | — |
| `restaureRecherche(cible)` | La section a été réécrite : le champ retrouve sa frappe et, si le geste venait de lui, le curseur. |

| Donnée | Rôle |
|---|---|
| `RECHERCHE` | Ce que la recherche d'une liste retient entre deux rendus. |
| `derniereMolette` | La molette au-dessus d'un compteur. Un tour de molette lance une dizaine d'évènements : sans ce garde-fou, un seul geste ajouterait dix exemplaires et demanderait dix recalculs. |

## js/annexes.js

La réserve et l'étude. *9 fonctions, 117 lignes, 5 Ko.*

| Fonction | Rôle |
|---|---|
| `annexeListe(cle)` | — |
| `annexeEntries(cle)` | Les mêmes entrées que `deckEntries()`, dans le même ordre : type, coût, nom. |
| `annexeSize(cle)` | — |
| `annexeDe(nom)` | Où vit cette carte hors du deck : la clé de la liste, ou rien. |
| `deplacerCarte(nom, cible)` | Le déplacement emporte tous les exemplaires : les trois listes s'excluant, une carte partagée entre deux d'entre elles n'aurait pas de sens. |
| `versAnnexe(nom, cle, qty)` | Poser une carte dans une liste annexe, d'où qu'elle vienne : du deck, de l'autre liste, ou de nulle part — la collection, la recherche, une suggestion. |
| `retirerAnnexe(nom, cle)` | Un exemplaire retiré d'une liste annexe ; le dernier retire la carte. |
| `viderAnnexe(cle)` | — |
| `tagAnnexe(card)` | Le tag que portent, partout ailleurs, les cartes garées dans une annexe : sans lui, on reproposerait sans fin une carte déjà mise de côté. |

## js/deck.js

Ce qu'il y a dans le deck, et les gestes qui l'y mettent. *9 fonctions, 115 lignes, 4.9 Ko.*

| Fonction | Rôle |
|---|---|
| `deckEntries()` | — |
| `deckSignature()` | L'empreinte du deck, dont l'empreinte des suggestions se sert pour savoir si la notation vaut encore. |
| `cartesDuDeck()` | Les cartes du deck, une fois chacune. Deux clés de `S.deck` peuvent viser la même carte — un import l'a nommée autrement et `find()` la rattrape, avant que `mergeInto()` ne fusionne les… |
| `deckSize()` | — |
| `availableFor(card)` | — |
| `addToDeck(name)` | — |
| `deckAdd(card, qty, opts)` | — |
| `removeFromDeck(name)` | — |
| `buyCard(name)` | — |

## js/legalite.js

Ce que le format exige, et l'équilibre des rôles. *13 fonctions, 180 lignes, 8.9 Ko.*

| Fonction | Rôle |
|---|---|
| `gameChangersDuDeck()` | Les Game Changers de la liste principale. Leur nombre décide du palier qu'un deck Commander peut revendiquer : aucun aux paliers 1 et 2, jusqu'à trois au palier 3, sans limite aux… |
| `ligneGameChangers()` | Ce que ce décompte dit du palier, en une phrase. |
| `ciblesParDefaut()` | Ce que le format propose, à la taille du deck. |
| `ciblesReglees()` | Les objectifs réglés à la main pour le format en cours. |
| `targets()` | Les cibles en vigueur : celles du format, et par-dessus celles qu'on a réglées. |
| `reglerCible(role, valeur)` | Poser un objectif, ou le rendre au format quand il retrouve sa valeur : l'état ne garde que ce qui s'écarte, et « Rétablir » n'a rien à défaire de ce qui n'a pas bougé. |
| `reinitCibles()` | — |
| `deckCounts()` | — |
| `boutonCibles()` | Le bouton du titre : il ouvre la fenêtre des objectifs (`js/fenCibles.js`). |
| `remplissageJauge(val, tgt)` | Le remplissage d'une jauge : la part atteinte, et la couleur qui la juge. |
| `ecartJauge(val, tgt)` | — |
| `gauge(label, val, tgt, role)` | — |
| `legality()` | — |

| Donnée | Rôle |
|---|---|
| `PINCEAU_ICONE` | Un pinceau : six poils, une virole, un manche. |

## js/deckSection.js

La section Deck. *6 fonctions, 224 lignes, 14 Ko.*

| Fonction | Rôle |
|---|---|
| `blocAchats()` | — |
| `zoneCommandant()` | — |
| `evalueDeck(entries)` | — |
| `partieDeck(cle, titre, resume, corps, classe)` | — |
| `blocAnnexe(cle)` | Une des deux listes annexes, rendue comme le deck : mêmes tuiles, mêmes filtres d'en-tête — ce qu'ils masquent est annoncé plutôt que tu. |
| `renderE()` | — |

| Donnée | Rôle |
|---|---|
| `NOTES_DECK` | — |

## js/ficheVisuel.js

Le visuel de la fiche, et ses éditions. *5 fonctions, 116 lignes, 5.6 Ko.*

| Fonction | Rôle |
|---|---|
| `ficheTexteHTML(card)` | Carte rendue en texte, à la place du visuel : coût, type, force et endurance, coût converti et texte oracle. |
| `rafraichirFiche()` | La fiche ouverte se reconstruit quand Scryfall a répondu — ou renoncé — sans quoi l'attente affichée resterait à tourner pour rien. |
| `visuelAttenteHTML()` | Carte vide et son icône de chargement, le temps que le visuel arrive. |
| `ficheImageKO(img)` | — |
| `blocVersions(card)` | Défilement des éditions sous le visuel de la fiche. |

## js/fiche.js

La fiche détaillée d'une carte. *1 fonctions, 165 lignes, 11 Ko.*

| Fonction | Rôle |
|---|---|
| `ficheHTML(card)` | — |

## js/ficheParcours.js

Ouvrir une fiche, et feuilleter la liste d'où elle vient. *4 fonctions, 110 lignes, 6.1 Ko.*

| Fonction | Rôle |
|---|---|
| `poseParcoursFiche(el, nom)` | — |
| `ficheVoisine(pas)` | Passer à la voisine. Les extrémités ne bouclent pas : la première carte n'a pas de précédente, et son bouton est désactivé — mieux vaut le voir que d'atterrir à la fin de la liste sans… |
| `enteteFiche(nom)` | L'entête de la fiche : le nom au centre, une flèche de chaque côté. |
| `openCardModal(name)` | — |

| Donnée | Rôle |
|---|---|
| `PARCOURS_FICHE` | — |

## js/simCartes.js

D'un nom de carte à sa fiche de jeu. *10 fonctions, 132 lignes, 5.8 Ko.*

| Fonction | Rôle |
|---|---|
| `ficheDeCarte(c)` | La fiche d'une carte de l'atelier. Le texte d'une carte livrée n'est qu'un résumé : il se joue quand même, et la couverture le dira. |
| `ficheDeRec(rec)` | La fiche d'un enregistrement de l'archive. |
| `ficheDeScryfall(sc)` | La fiche d'une réponse de Scryfall, sans rien enregistrer dans l'atelier. |
| `indexArchive()` | L'index de l'archive par nom et par nom de face avant, rebâti quand l'archive change. |
| `ficheParNom(nom)` | La fiche d'un nom, ou `null` si personne ne la connaît encore. |
| `avecForge(f)` | La fiche, avec son script Forge et ceux des jetons qu'il crée, si l'appareil les a (js/forgeDepot.js). |
| `ficheSansForge(nom)` | — |
| `chargeSimCartes()` | Relire les fiches gardées pour les adversaires. |
| `rangeSimCartes()` | — |
| `chercheFichesScryfall(noms)` | Demander à Scryfall les fiches qui manquent, par paquets de soixante- quinze. |

| Donnée | Rôle |
|---|---|
| `IDB_SIM_CARTES` | — |
| `SIM_CARTES` | — |
| `simCartesChargees` | — |
| `INDEX_ARCHIVE` | — |

## js/simAdversaires.js

La bibliothèque d'adversaires. *8 fonctions, 78 lignes, 3.4 Ko.*

| Fonction | Rôle |
|---|---|
| `cleAdversaireNeuve()` | — |
| `adversaireDepuisTexte(nom, texte, format)` | Lire une liste collée en adversaire : les cartes du deck, et son commandant s'il en a un. |
| `enregistreAdversaire(adv, cle)` | Ranger un adversaire ; rend sa clé. Un nom déjà pris reçoit un numéro, comme un deck : deux adversaires indiscernables dans un menu ne servent à rien. |
| `nbCartesAdversaire(adv)` | — |
| `resolutionAdversaire(adv)` | Ce qu'on sait déjà jouer d'un adversaire, et ce qui manque. |
| `completeAdversaire(cle)` | Compléter un adversaire auprès de Scryfall. |
| `signatureAdversaire(adv)` | L'empreinte d'un adversaire : un résultat calculé contre une liste qui a changé depuis est périmé. |
| `signatureDeck(cle)` | L'empreinte d'un deck de l'atelier, ouvert ou non. |

## js/decksLies.js

Les adversaires liés à Moxfield ou à Archidekt. *11 fonctions, 196 lignes, 8.7 Ko.*

| Fonction | Rôle |
|---|---|
| `lisLienDeck(url)` | Reconnaître l'adresse d'un deck publié. |
| `lisJsonDeck(adresse)` | Lire une adresse, directement ou par le relais. |
| `recupereDeckLie(lien)` | Récupérer un deck lié : la lecture directe, puis le relais s'il y en a un. |
| `texteDeListe(liste, commandants)` | La liste en texte MTGO, pour que « Modifier » montre la liste en vigueur et que `parseMtgoList()` la relise telle quelle. |
| `diffListes(avant, apres)` | Ce qui a changé entre deux listes, commandants compris. |
| `appliqueDeckLie(cle, d)` | Verser dans un adversaire ce que le site a rendu. |
| `relisAdversaireLie(cle)` | Relire un adversaire lié. Rend le différentiel, ou `null` en cas d'échec — l'échec est noté sur le lien, pour la pastille et pour ne pas réessayer en boucle. |
| `annonceChangement(a, diff)` | — |
| `verifieDecksLies(opts = {})` | Au démarrage : relire, un par un, les adversaires liés qu'on n'a pas vérifiés depuis un jour. |
| `verifieUnDeckLie(cle)` | « Mettre à jour » sur un adversaire lié : la relecture, et si elle échoue, la fenêtre de l'adversaire en mode collage. |
| `depuisQuand(t)` | Depuis quand un lien a été vérifié, en mots. |

| Donnée | Rôle |
|---|---|
| `DELAI_VERIF_LIEN` | — |
| `SITES_DECKS` | Les sites qu'on sait lire. Chacun dit où est son API, où est la page du deck, et comment lire sa réponse en `{nom, liste, commandants, maj}`. |

## js/simPreparation.js

D'un deck ou d'un adversaire à un siège de table. *13 fonctions, 141 lignes, 6.7 Ko.*

| Fonction | Rôle |
|---|---|
| `vieDuFormat(format)` | — |
| `comportementDe(nom)` | Le comportement écrit à la main pour une carte, s'il y en a un. |
| `bilanCouverture(entrees, manquantes)` | Résumer la couverture d'un siège. Les terrains ne comptent pas dans le taux : ils sont presque toujours compris, et dilueraient ce qui ne l'est pas. |
| `siegeDepuisListe(nom, format, liste, commandants, resout = ficheParNom, comportement = comportementDe)` | Un siège à partir d'une liste `[[nom, quantité]]` et de commandants. |
| `siegeDepuisFiches(nom, format, cartes, commandants, comportements)` | Un siège bâti sur les fiches qu'un invité a envoyées : l'hôte ne lit ni son `S` ni son archive, il joue les cartes telles que l'invité les connaît, avec les comportements que l'invité a… |
| `fichesDeDeck(cle)` | Les fiches d'un deck de l'atelier, telles qu'un invité les envoie à l'hôte : la liste, le commandant, et les comportements écrits à la main pour ces cartes-là seulement. |
| `fichesDeListe(nom, format, liste, commandants)` | Les fiches d'une liste `[[nom, quantité]]` et de ses commandants. |
| `fichesDeSource(s)` | Les fiches d'une source du salon : un deck, un adversaire, ou ce qu'un invité a envoyé. |
| `siegeDeck(cle)` | Le siège d'un deck de l'atelier. Son commandant ne joue comme tel que si le format en a un. |
| `siegeAdversaire(cle)` | — |
| `nomsManquants(cfg)` | Les noms qu'aucune source ne connaît encore, pour toute une table. |
| `fiabilite(couvertures)` | La fiabilité d'un résultat, d'après la couverture des decks de la table : le deck testé compte double, puisque c'est lui qu'on juge. |
| `signatureComportements()` | L'empreinte des comportements manuels qui touchent une table. |

## js/simStats.js

Ce qu'on retient d'une partie, et d'un lot. *5 fonctions, 98 lignes, 5 Ko.*

| Fonction | Rôle |
|---|---|
| `wilson(k, n, z = 1.96)` | L'intervalle de Wilson d'une proportion k/n, à 95 %. |
| `mesuresPartie(P, places, g)` | Les mesures d'une partie. `places[k]` : l'indice dans la table du deck assis au siège k ; le deck testé est l'indice 0. |
| `moyenne(t)` | — |
| `agrege(recs, N, terrains)` | Les agrégats d'un lot. `terrains` : les noms des terrains du deck testé, qu'une carte « morte en main » ne doit pas compter. |
| `statsCartes(jouees, terrains)` | Les mesures de chaque carte du deck testé. |

## js/simStockage.js

Les résultats des lots, gardés et comparés. *8 fonctions, 66 lignes, 2.6 Ko.*

| Fonction | Rôle |
|---|---|
| `chargeResultats()` | — |
| `rangeResultats()` | — |
| `ajouteLot(lot)` | — |
| `supprimeLot(id)` | — |
| `lotParId(id)` | — |
| `lotPerime(lot)` | Un lot est périmé quand le deck, un adversaire, un comportement manuel ou le moteur ont changé depuis : ses chiffres restent lisibles, mais ses parties ne se rejouent plus à l'identique. |
| `cleTable(lot)` | La table d'un lot, sans le deck testé : deux lots sur la même table se comparent. |
| `classement(table)` | Le classement des decks sur une table : le dernier lot de chaque deck, du plus fort au plus faible. |

| Donnée | Rôle |
|---|---|
| `IDB_SIM_RESULTATS` | — |
| `LOTS_GARDES` | — |
| `SIM_RES` | — |

## js/simulation.js

Un lot de parties, par tranches. *11 fonctions, 143 lignes, 6.4 Ko.*

| Fonction | Rôle |
|---|---|
| `rendMain()` | — |
| `configSimulation()` | La configuration du lot, bornée et complétée. |
| `obstacleSimulation(cfg)` | Ce qui empêche de lancer, en une phrase, ou rien. |
| `placesPartie(N, g)` | La table d'une partie : le deck assis à chaque siège. |
| `graineDePartie(graine, g)` | — |
| `majProgressionSim()` | — |
| `lanceSimulation()` | Lancer un lot. Une erreur de préparation ne doit pas laisser la section figée sur « préparation » : elle est dite, et la table rendue. |
| `joueLot()` | — |
| `terminerLot(cfg, sieges, recs)` | Ranger le lot qui vient de finir, ou d'être arrêté. |
| `arreteSimulation()` | — |
| `rejouePartie(lot, k)` | Rejouer une partie d'un lot, journal ouvert. |

| Donnée | Rôle |
|---|---|
| `MOTEUR_V` | — |
| `SIM` | — |

## js/simSection.js

La section « Simulation ». *9 fonctions, 156 lignes, 11 Ko.*

| Fonction | Rôle |
|---|---|
| `couvertureTable(cfg)` | La couverture des decks de la table, recalculée seulement quand un deck, un adversaire, un comportement ou les sources de cartes ont changé. |
| `optionsHTML(paires, choisi)` | — |
| `tableHTML(cfg)` | La table : les réglages d'un lot. |
| `adversairesHTML()` | La bibliothèque d'adversaires. |
| `pastilleLien(l)` | La pastille d'un adversaire lié : son site, sa dernière vérification, et ce qui a changé la dernière fois. |
| `relaisHTML()` | Le relais, pour les sites qui refusent d'être lus depuis une autre page. |
| `badgeCouverture(t)` | Le badge d'un taux de couverture. |
| `couvertureHTML(cfg)` | Ce que le moteur comprend des decks de la table. |
| `renderK()` | — |

| Donnée | Rôle |
|---|---|
| `COUV_TABLE` | — |

## js/forgeDepot.js

Les scripts de cartes de Forge, téléchargés et gardés. *15 fonctions, 216 lignes, 9.8 Ko.*

| Fonction | Rôle |
|---|---|
| `paquetForge(chemin)` | Le paquet IndexedDB d'un chemin : un par dossier de premier niveau, pour ne réécrire que ce qui a changé. |
| `baseForge(nom)` | Le nom de base qu'un fichier de Forge tire du nom de sa carte. |
| `indexeForge(chemin, texte)` | Ranger un texte en mémoire et l'indexer par le nom de chacune de ses faces. |
| `chargeForge()` | Relire ce que l'appareil garde, une seule fois : deux appels pressés attendent la même lecture. |
| `forgeIncomplet()` | Reste-t-il des fichiers à télécharger ? |
| `jsonGH(url)` | — |
| `listeForge()` | La liste des fichiers, empreintes comprises, au dernier commit. |
| `nomsPrioritaires()` | Les noms des cartes de vos decks et de vos adversaires. |
| `cheminsDeNoms(noms, liste)` | Les chemins de la liste qui portent ces noms : le nom de base exact, ou le début du nom d'un fichier à deux faces. |
| `rangeForge()` | Ranger les paquets modifiés et l'index. |
| `telechargeUn(ch, sha, chemin, essai = 0)` | — |
| `telechargeForge(force)` | Télécharger ce qui manque ou a changé : vos cartes d'abord. |
| `demarreForge()` | Au démarrage, en tâche de fond : reprendre un téléchargement inachevé, ou vérifier une fois par semaine qu'il n'y a rien de neuf. |
| `oublieForge()` | Effacer les scripts de l'appareil. Le bouton n'est offert qu'à l'arrêt. |
| `scriptForgeDe(nom)` | Le script Forge d'une carte, s'il est là. |

| Donnée | Rôle |
|---|---|
| `FORGE_GH` | — |
| `IDB_FORGE` | — |
| `FORGE_DELAI` | — |
| `FORGE` | — |

## js/forgeVue.js

Les cartes Forge sous les yeux. *11 fonctions, 174 lignes, 8.9 Ko.*

| Fonction | Rôle |
|---|---|
| `forgeChange()` | Les scripts ont changé : ce qu'on en avait tiré est périmé. |
| `etatForgeTexte()` | — |
| `corpsForge()` | La section de la fenêtre des paramètres. |
| `majForgeUI(change)` | Repeindre sur place ce qui montre Forge. `change` : les scripts ont changé, le tableau des manques aussi. |
| `poidsPrioritaires()` | Les noms de vos decks et adversaires, chacun avec le nombre de listes où il figure : un élément qui manque à trois decks pèse trois fois. |
| `manquesDecks()` | Ce qui manque pour vos cartes, recalculé quand un deck, un adversaire, les scripts ou le savoir du moteur ont changé. |
| `mesureBaseForge()` | Toute la base, par tranches : trente-quatre mille scripts prennent deux ou trois secondes, qu'on rend au navigateur toutes les mille cartes. |
| `libelleElement(e)` | — |
| `listeManques(manques, unite)` | — |
| `manquesHTML()` | Le bloc « Ce qu'il manque au moteur » de l'onglet Simulation. |
| `gestesForge(act)` | — |

| Donnée | Rôle |
|---|---|
| `MANQUES` | — |
| `GENRES_FORGE` | — |

## js/simResultats.js

Les résultats d'un lot, l'historique, le classement. *8 fonctions, 111 lignes, 7.8 Ko.*

| Fonction | Rôle |
|---|---|
| `pct(x)` | — |
| `un(x)` | — |
| `barresHTML(lignes)` | Des barres horizontales, une par ligne. |
| `cartesHTML(r)` | Le tableau des cartes du deck testé. |
| `partiesHTML(lot)` | Les parties d'un lot, pour en revoir une. |
| `lotHTML(lot)` | Le résumé d'un lot. |
| `historiqueHTML(cfg)` | L'historique des lots et le classement des decks sur la table choisie. |
| `resultatsHTML(cfg)` | — |

| Donnée | Rôle |
|---|---|
| `CAUSES` | — |
| `FIABILITE` | — |

## js/outils.js

Menue monnaie de l'atelier. *5 fonctions, 52 lignes, 1.8 Ko.*

| Fonction | Rôle |
|---|---|
| `esc(s)` | — |
| `eur(n)` | — |
| `refCarte(nom)` | — |
| `fmt()` | — |
| `toast(msg)` | — |

## js/theme.js

Le thème clair et le thème sombre. *4 fonctions, 59 lignes, 2.8 Ko.*

| Fonction | Rôle |
|---|---|
| `themeDuSysteme()` | Ce que le système préfère, quand rien n'a jamais été choisi : un atelier ouvert sur une machine réglée en sombre s'ouvre en sombre. |
| `appliqueTheme()` | Pose le thème sur la racine, et note la préférence dans sa clé. |
| `reprendTheme()` | Au démarrage : la sauvegarde a pu porter le choix (`restore`), sinon on reprend la clé — c'est le cas quand la sauvegarde est désactivée —, sinon la préférence du système. |
| `basculeTheme(sombre)` | La case de la fenêtre des paramètres. Le thème agit au clic : c'est un réglage qu'on juge à l'œil, et le faire attendre « Appliquer » obligerait à fermer la fenêtre pour voir ce qu'on… |

| Donnée | Rôle |
|---|---|
| `STORE_THEME` | — |

## js/dialogue.js

La fenêtre modale, une à la fois. *2 fonctions, 42 lignes, 2.1 Ko.*

| Fonction | Rôle |
|---|---|
| `openDialog(title, bodyHTML, actionsHTML, grande, entete)` | `entete` : un entête tout fait, quand la fenêtre en veut un autre que le titre suivi de sa croix — c'est celui de la fiche d'une carte, où deux boutons de parcours encadrent le nom… |
| `closeDialog()` | — |

## js/brouillon.js

Le brouillon des fenêtres à « Appliquer ». *13 fonctions, 153 lignes, 6.9 Ko.*

| Fonction | Rôle |
|---|---|
| `ouvreBrouillon(cles, redessine)` | — |
| `copieEtat(v)` | Copie profonde d'un champ de `S` : le `Set` des couleurs, le `S.custom` imbriqué et les `Map` de cartes d'un dossier de deck doivent être détachés, sans quoi le brouillon modifierait… |
| `echangeBrouillon()` | Met le brouillon à la place de l'état appliqué, et rend de quoi revenir. |
| `reprendEtat(memo, garder)` | Repose l'état appliqué. `garder` reverse au brouillon ce qui vient d'être modifié — y compris quand un champ a été réassigné plutôt que muté. |
| `avecBrouillon(fn)` | Lit comme si le brouillon était appliqué : c'est ainsi que la fenêtre se peint et que son décompte annonce ce que « Appliquer » donnerait. |
| `modifieBrouillon(fn)` | Le jumeau écrivain : ce que `fn` modifie reste dans le brouillon. |
| `brouillonModifie()` | Le brouillon diffère-t-il de ce qui est appliqué ? |
| `texteEtat(v)` | Une valeur rendue comparable, `Map` et `Set` compris — `JSON.stringify` les rend toutes deux `{}`, si bien que deux decks aux listes différentes se seraient dits identiques. |
| `memeEtat(x, y)` | — |
| `apresReglage(raison)` | La pagination de la collection n'est pas remise à sa première page : elle suit ce qu'on a demandé à voir. |
| `renderAllSiApplique()` | Un rendu global n'a de sens que si l'état appliqué a changé. |
| `verseBrouillon()` | Verse le brouillon dans l'état : le seul moment où une fenêtre à brouillon touche à ce que l'atelier montre. |
| `fermetureBrouillon()` | Toute autre façon de fermer — Annuler, la croix, Échap, l'arrière-plan — jette le brouillon. |

| Donnée | Rôle |
|---|---|
| `brouillon` | Le brouillon en cours : les champs de `S` que la fenêtre ouverte règle, mis de côté et rendus à `S` le temps d'une lecture ou d'une écriture. |
| `etatApplique` | L'état appliqué, mis de côté le temps d'un échange : `brouillonModifie()` en a besoin pour comparer, alors même que `S` porte le brouillon. |

## js/couleurs.js

Le vocabulaire des couleurs. *1 fonctions, 77 lignes, 2.2 Ko.*

| Fonction | Rôle |
|---|---|
| `nomCombinaisonCouleurs(sel)` | — |

| Donnée | Rôle |
|---|---|
| `MTG_COMBINAISONS` | — |
| `COLS` | Couleurs proposées par l'en-tête et par la fenêtre des filtres. |
| `MODES_COULEUR` | — |

## js/apercu.js

L'aperçu volant sous le curseur. *7 fonctions, 101 lignes, 3.3 Ko.*

| Fonction | Rôle |
|---|---|
| `initApercu()` | — |
| `apercuTexte(c)` | Aperçu volant : le texte y est borné pour ne pas couvrir l'écran, la fiche complète (clic sur la carte) reste la vue de référence. |
| `placerApercuDansCouche()` | Une fenêtre modale est peinte dans la « top layer », au-dessus de tout z-index : l'aperçu doit y entrer pour rester visible. |
| `montrerApercu(nom, x, y)` | — |
| `placerApercu(x, y)` | — |
| `cacherApercu()` | — |
| `majApercu()` | — |

## js/versions.js

Les éditions d'une même carte. *14 fonctions, 173 lignes, 6.9 Ko.*

| Fonction | Rôle |
|---|---|
| `aDeuxFaces(card)` | — |
| `autreFace(card)` | — |
| `faceVisible(card, grand)` | — |
| `sourceVersions(card)` | Deux sources : les éditions possédées, relevées à l'import, et toutes celles que Scryfall publie — ces dernières n'étant cherchées que si on les demande, pour ne pas lancer une recherche… |
| `sourceVoulue(card)` | La source demandée, qui n'est pas encore la source affichée tant que la recherche n'a pas abouti : c'est elle que la bascule doit montrer pressée. |
| `listeVersions(card)` | — |
| `possedeVersion(card, cle)` | Exemplaires possédés d'une édition, quelle que soit la source affichée. |
| `versionRang(card)` | — |
| `versionCourante(card)` | — |
| `faireDefilerVersion(nom, pas)` | — |
| `basculerSourceVersions(nom, src)` | Passe d'une source à l'autre ; la première bascule vers « toutes » déclenche la recherche. |
| `visuelVersion(card, v, grand)` | Visuel d'une édition : porté par l'édition elle-même quand elle vient de Scryfall, sinon cherché parmi les visuels rapportés pour les impressions possédées, sinon celui de la carte s'il… |
| `visuelEnRecherche(card, v)` | Le visuel se cherche encore : rien à montrer pour l'instant, mais un aller-retour est en vol. |
| `choisirVersion(nom, cle)` | Retenir une édition : son illustration devient celle de la carte partout — vignettes de la collection, aperçu au survol, deck. |

| Donnée | Rôle |
|---|---|
| `versionVue` | — |

## js/tuiles.js

Les rendus d'une carte dans une liste. *12 fonctions, 251 lignes, 16 Ko.*

| Fonction | Rôle |
|---|---|
| `tagIllegal(card)` | Le tag « illégal », partout où une carte s'affiche. |
| `tagGameChanger(card)` | Le tag des Game Changers : la liste de Wizards pour les paliers du Commander. |
| `tagDeck(card, ctx)` | Ce que le deck a déjà pris. L'étiquette ne paraît que dans la collection : au deck elle serait vraie de toutes les cartes et n'apprendrait rien, et les listes annexes ont la leur. Le… |
| `actesAnnexe(c, cle, avecBascule)` | Les gestes d'une carte garée dans une liste annexe : la remonter au deck, la passer à l'autre liste, ou l'en retirer. |
| `cardTile(e, ctx)` | Les deux rendus d'une carte — vignette et ligne — n'offrent pas de bouton vers la fiche : un clic sur la vignette, ou n'importe où sur la ligne, l'ouvre déjà (js/app.js, la branche des… |
| `cardRow(e, ctx)` | — |
| `customPanel()` | — |
| `tagEdhrec(s)` | Ce qu'EDHREC dit d'une proposition : son taux d'inclusion dans les decks du commandant et sa synergie, ou le commandant secondaire qui la recommande. |
| `tagsSuggestion(s, edhrecTag)` | Ce qu'une proposition dit d'elle-même : ses interactions avec le deck, sa légalité, son appartenance à la collection, ce qu'EDHREC en pense. |
| `acteSuggestion(s)` | Le bouton du pied d'une proposition : l'ajouter au deck, ou l'acheter quand elle n'est pas dans la collection et qu'une offre la porte. |
| `sugRow(s)` | La vignette d'une proposition : la carte, sa note et ce qui la justifie — ses interactions, ce qu'EDHREC en dit, son prix. |
| `sugLigne(s)` | La ligne d'une proposition : la même carte, lue en ligne. |

## js/ancre.js

L'ancre de défilement. *3 fonctions, 57 lignes, 2.5 Ko.*

| Fonction | Rôle |
|---|---|
| `candidatsAncre()` | Les repères possibles : les sections, et toute carte affichée. |
| `releveAncre()` | — |
| `restaureAncre(a)` | — |

## js/differe.js

Les propositions ne se notent que sous les yeux. *4 fonctions, 74 lignes, 3.6 Ko.*

| Fonction | Rôle |
|---|---|
| `suggestionsVisibles()` | L'onglet ouvert porte-t-il une des trois listes ? `ONGLETS` et `SECTIONS_SUGGESTIONS` (js/etat.js) en décident seules, comme partout où la répartition des sections est en jeu. |
| `marqueOngletsPerimes(actif)` | Le point d'un onglet dont la page a vieilli : posé, là où celui d'un travail de fond bat (`signalerTravail()`, js/rendu.js). |
| `differerSuggestions()` | Remettre la notation à plus tard, et le dire. |
| `rattraperSuggestions()` | La page qu'on vient d'ouvrir porte une liste périmée : c'est l'instant de la reprendre. |

| Donnée | Rôle |
|---|---|
| `SUG_PERIME` | Une page de propositions attend d'être reprise. |

## js/recalcul.js

Les recalculs annoncés. *8 fonctions, 200 lignes, 8.7 Ko.*

| Fonction | Rôle |
|---|---|
| `pause()` | — |
| `recalculLong()` | Le recalcul qui vient sera-t-il long ? Deux cas : les candidates sont à rebâtir depuis l'archive, ou le vivier à noter est déjà gros. |
| `corpsBoiteRecalcul(raison)` | — |
| `annonceRecalcul(raison)` | Annonce le recalcul là où il ne gêne pas : dans sa boîte si rien n'est ouvert, dans le pied de la fenêtre ouverte sinon — la refermer emporterait la fiche ou le formulaire que l'on est… |
| `finRecalcul()` | Ne referme que notre boîte : l'utilisateur a pu la masquer et ouvrir autre chose pendant que le calcul se poursuivait. |
| `progresSection(txt, fait, total)` | La progression d'un recalcul de fond : rien de modal, rien qui pousse la mise en page. |
| `finProgresSection()` | — |
| `recalculerAvecProgression(raison, opts)` | `opts.fond` : le recalcul n'a été demandé par personne — des statistiques qui arrivent, des prix, une carte que Scryfall vient de compléter. |

| Donnée | Rôle |
|---|---|
| `SEUIL_RECALCUL` | Au-delà de tant de cartes à noter, le calcul passe par tranches plutôt que d'un bloc ; en deçà, l'atelier se refait sur-le-champ comme avant. |
| `DELAI_BOITE` | Et la boîte n'est montrée que si ces tranches durent : au-dessous, le recalcul est fini avant qu'on ait pu la lire. |
| `boiteRecalcul` | — |
| `barreEmpruntee` | — |
| `recalculEnCours` | Un recalcul à la fois. Un geste arrivé pendant qu'un autre travaille est retenu et repris ensuite : l'état qu'il lira sera le dernier, et le résultat le bon. |
| `recalculSuivant` | — |

## js/entete.js

L'en-tête et la barre des onglets. *7 fonctions, 249 lignes, 14 Ko.*

| Fonction | Rôle |
|---|---|
| `listeDeLOngletCourant()` | — |
| `majBoutonAffichage()` | — |
| `majHauteurEntete()` | La hauteur de l'entête, publiée pour le CSS : les sections s'en servent comme marge de défilement et s'arrêtent sous elle plutôt que derrière. |
| `renderTop()` | — |
| `renderOnglets()` | La barre ne se réécrit pas, elle change d'attributs : la réécrire emporterait le focus du bouton qu'on vient de presser, et les flèches n'auraient plus rien sous elles. |
| `activerOnglet(cle, opts)` | Passer d'un onglet à l'autre : rien n'est redessiné, les cinq sections étant toujours rendues. |
| `allerVersSection(id)` | Aller à une section, d'où qu'on parte : l'onglet qui la porte s'ouvre, et le défilement s'arrête sous l'entête collante plutôt que derrière elle. |

| Donnée | Rôle |
|---|---|
| `FILTRE_ICONE` | — |
| `AFFICHAGE_ICONE` | Quatre pavés : la grille d'une liste de cartes, vue de loin. |
| `PARAM_ICONE` | L'engrenage des paramètres : douze dents posées en couronne et un moyeu évidé, dessinés ici plutôt que chargés — l'atelier ne dépend d'aucun fichier extérieur, pas même d'une icône. |
| `POS_ONGLETS` | Où l'on en était dans chaque onglet. Le défilement est celui du document, partagé par les trois pages : sans ce relevé, revenir au deck après une longue collection retomberait n'importe… |

## js/rendu.js

Le rendu d'ensemble. *2 fonctions, 37 lignes, 1.2 Ko.*

| Fonction | Rôle |
|---|---|
| `signalerTravail(idSection, actif, texte)` | Un travail de fond se signale là où on peut le voir : le liseré sur la section quand elle est sous les yeux, un point sur l'onglet qui la porte quand on regarde ailleurs. |
| `renderAll()` | — |

## js/fenFormat.js

Fenêtre « Format ». *5 fonctions, 63 lignes, 3.2 Ko.*

| Fonction | Rôle |
|---|---|
| `resumeFormat()` | — |
| `majResumeFormat()` | — |
| `corpsFormat()` | — |
| `majFenetreFormat()` | Réécrit la fenêtre si elle est ouverte : changement de format, apparition ou disparition du panneau « Personnalisé ». |
| `openFormatModal()` | — |

## js/fenNuage.js

La section « Synchronisation » de la fenêtre des paramètres. *9 fonctions, 159 lignes, 8.8 Ko.*

| Fonction | Rôle |
|---|---|
| `nuageQuand(t)` | « il y a trois minutes » se lit mieux qu'un horodatage quand on vient de cliquer, et une date quand cela remonte à hier. |
| `nuageOu(c)` | Un désaccord porte le deck où il a eu lieu : « Sol Ring » ne dit rien si l'on en joue dans trois decks. |
| `nuageConflits()` | Les désaccords que la fusion n'a pas pu trancher seule. |
| `nuageEtatLigne()` | L'état en une ligne, avec sa pastille. |
| `nuageDetail()` | Ce que Dropbox a répondu mot pour mot, quand il a refusé. |
| `nuageAvertissementOrigine()` | Sans origine http, la connexion est impossible : Dropbox n'accepte de revenir que sur une adresse qu'il a pu enregistrer, et `file://` n'en est pas une. |
| `nuageCorpsDeconnecte()` | Non connecté : la clé de l'application, et de quoi la créer. |
| `nuageCorpsConnecte()` | Connecté : qui, quand, combien, et les gestes. |
| `corpsNuage()` | — |

| Donnée | Rôle |
|---|---|
| `NUAGE_LISTES` | — |
| `NUAGE_CHAMPS` | — |

## js/fenParametres.js

Fenêtre « Paramètres ». *9 fonctions, 133 lignes, 6.1 Ko.*

| Fonction | Rôle |
|---|---|
| `sectionParametres(titre, chapeau, corps)` | Une section de la fenêtre : un titre, une phrase qui dit ce qu'elle règle, et son contenu. |
| `corpsApparence()` | L'apparence : le thème sombre, le dessin d'origine de l'atelier, ou le papier clair. |
| `corpsCatalogue()` | — |
| `corpsParametres()` | Le corps entier, les trois sections à la suite. |
| `majFenetreParametres()` | La fenêtre reste ouverte pendant qu'une archive se charge ou qu'un réglage change : son corps est réécrit sur place, le défilement gardé, et les champs de fichier rebranchés — l'ancien… |
| `brancherParametres()` | — |
| `appliquerParametres()` | — |
| `openParametresModal()` | — |
| `appliquerFormat()` | « Appliquer » verse le brouillon puis recalcule, comme pour les filtres : changer de format reprend l'atelier tout autant qu'un critère. |

## js/fenBudget.js

Fenêtre « Budget ». *6 fonctions, 107 lignes, 6.1 Ko.*

| Fonction | Rôle |
|---|---|
| `champBudget(id, label, cle, liste)` | — |
| `corpsBudget()` | — |
| `saisieBudget(t)` | La saisie de la fenêtre. Le plafond et le prix maximum par carte appartiennent au deck ouvert ; l'état, la langue, le vendeur et le pays disent comment on achète et valent pour tous les… |
| `majResumeBudget()` | Un chiffre saisi ne réécrit pas la fenêtre — le curseur y serait perdu : seuls le budget restant et la liste des achats suivent, sous le brouillon. |
| `appliquerBudget()` | « Appliquer » verse le brouillon puis recalcule : le prix maximum par carte entre dans la signature des candidates, tout est à reprendre. |
| `openBudgetModal()` | — |

## js/fenDeck.js

Fenêtre « Configuration du deck ». *9 fonctions, 207 lignes, 12 Ko.*

| Fonction | Rôle |
|---|---|
| `dossierEnConfig()` | — |
| `champDeck(cle, label, aide, attrs)` | — |
| `ligneRestriction(kMin, kMax, label, aide, pas)` | — |
| `corpsDeck()` | — |
| `resumeDeckConfig()` | Ce que « Appliquer » donnerait, en une phrase. |
| `majResumeDeck()` | — |
| `majFenetreDeck()` | Réécrit la fenêtre entière : cocher une couleur, un rôle ou « suivre le commandant » change ce que les autres champs doivent montrer. |
| `appliquerDeck()` | — |
| `openDeckModal(cle)` | — |

| Donnée | Rôle |
|---|---|
| `deckEnConfig` | Le deck que la fenêtre règle. Ouverte depuis une vignette, elle porte sa clé ; ouverte depuis une puce de restriction, c'est le deck ouvert. |

## js/fenFiltres.js

Fenêtre « Filtres ». *10 fonctions, 207 lignes, 12 Ko.*

| Fonction | Rôle |
|---|---|
| `ligneFiltre(kMin, kMax, label, aide, pas, min)` | Une ligne « critère min → max ». |
| `corpsFiltres()` | — |
| `resumeFiltres()` | — |
| `majResumeFiltres()` | — |
| `zoneProgression()` | La barre de progression du filtrage, dans le pied de la fenêtre : c'est la seule partie toujours visible, quel que soit le défilement du corps. |
| `majProgression(txt, fait, total)` | — |
| `filtrerAvecProgression()` | Le filtrage lui-même, par tranches, pour que la barre se peigne entre deux lots. |
| `majFenetreFiltres()` | — |
| `appliquerFiltres()` | « Appliquer » verse le brouillon, puis recalcule. |
| `openFiltresModal()` | — |

## js/fenAffichage.js

Fenêtre « Affichage » d'une liste de cartes. *9 fonctions, 187 lignes, 9.2 Ko.*

| Fonction | Rôle |
|---|---|
| `indexColonnes(n)` | — |
| `resumeAffichage(section)` | La phrase qui dit, dans l'infobulle du bouton comme dans la fenêtre, ce qui est en vigueur pour une liste : le réglage n'est plus visible dans la barre, il doit se lire quelque part. |
| `corpsAffichage()` | — |
| `majFenetreAffichage()` | — |
| `reglageAffichage(quoi, el)` | Les quatre réglages de la fenêtre, au brouillon : rien ne bouge dans la liste avant « Appliquer ». |
| `glisseColonnes(el)` | Le curseur des colonnes décoche « Auto » du seul fait qu'on s'en serve : imposer un nombre, c'est cesser de s'en remettre à la largeur. |
| `verseAffichagePartout(conf)` | Le réglage choisi, recopié dans les cinq listes, le tri là où la liste l'offre — le taux d'inclusion d'EDHREC n'a pas de sens pour la collection, la quantité n'en a pas pour une… |
| `appliquerAffichage(partout)` | « Appliquer » verse le réglage d'un coup. Le groupement et le tri changent l'ordre des cartes : la pagination de la collection repart de sa première page, sinon la fin d'une liste rangée… |
| `openAffichageModal(section)` | — |

| Donnée | Rôle |
|---|---|
| `sectionAffichage` | La liste que la fenêtre ouverte règle. Il n'y en a qu'une à la fois, la fenêtre étant modale — comme le brouillon qu'elle tient. |
| `COLONNES_IMPOSEES` | Les nombres de colonnes qu'on impose, « auto » mis à part : c'est la case à cocher qui porte ce choix-là, et le curseur ne parcourt que les autres. |
| `positionColonnes` | La position du curseur quand « Auto » est cochée : l'état ne retient alors aucun nombre, et le curseur doit tout de même se poser quelque part — là où on l'avait laissé, sans quoi… |

## js/fenCibles.js

Fenêtre « Objectifs par rôle ». *5 fonctions, 82 lignes, 4 Ko.*

| Fonction | Rôle |
|---|---|
| `ligneCible(role, val, tgt, defaut)` | Une ligne : le rôle, ce que le deck en porte, ce que le format propose, et le champ. |
| `corpsCibles()` | — |
| `majFenetreCibles()` | Réécrite après « Réinitialiser » : les champs reprennent les valeurs du format. |
| `appliquerCibles()` | « Appliquer » verse le brouillon, puis renote : les suggestions pèsent ce qui manque au deck, et ce qui manque vient de changer. |
| `openCiblesModal()` | — |

## js/fenListes.js

Les deux listes déroulantes des filtres. *6 fonctions, 125 lignes, 6.7 Ko.*

| Fonction | Rôle |
|---|---|
| `listeArchetypesHTML()` | Lignes de la liste déroulante : le nom, puis ce que fait l'archétype. |
| `majListeArchetypes()` | Rafraîchit la liste proposée sans réécrire la fenêtre : la frappe dans le champ de recherche garde son curseur. |
| `etatArchetypes()` | État de la base d'archétypes extérieure, sous les boutons. |
| `listeSetsHTML()` | Lignes de la liste des sets : le nom, puis son code, son année et sa taille. |
| `majListeSets()` | Rafraîchit la liste proposée sans réécrire la fenêtre : la frappe dans le champ de recherche garde son curseur. |
| `etatSets()` | État de la liste des sets, sous le champ. |

| Donnée | Rôle |
|---|---|
| `archRecherche` | — |
| `archOuvert` | — |
| `setRecherche` | — |
| `setOuvert` | — |

## js/boiteCatalogue.js

Boîte de chargement de l'archive Scryfall. *6 fonctions, 75 lignes, 3.6 Ko.*

| Fonction | Rôle |
|---|---|
| `octets(n)` | — |
| `barreCatalogue(id, titre, fait, total)` | — |
| `corpsBoiteCatalogue()` | — |
| `ouvrirBoiteCatalogue()` | — |
| `majBoiteCatalogue()` | Rafraîchit les barres sans réécrire la fenêtre, pour ne pas la faire clignoter dix fois par seconde. |
| `fermerBoiteCatalogue()` | Ne referme que si c'est bien cette boîte qui est ouverte : l'utilisateur a pu la masquer et ouvrir autre chose entre-temps. |

## js/fenExport.js

Fenêtres d'export et d'effacement. *3 fonctions, 179 lignes, 9.8 Ko.*

| Fonction | Rôle |
|---|---|
| `exportModal(cible)` | — |
| `openWantsModal(tout)` | La fenêtre des wants sert deux comptes : celui du deck ouvert, depuis sa section, et celui de tous les decks, depuis la page « Decks ». |
| `openWipeModal()` | Vider la collection, et elle seule. Ce bouton emportait aussi le deck, la réserve et l'étude : « Vider » d'une section ne doit vider que ce que cette section montre, comme celui du deck… |

## js/fenAdversaire.js

Ajouter ou modifier un adversaire. *8 fonctions, 143 lignes, 8.4 Ko.*

| Fonction | Rôle |
|---|---|
| `repliHTML(lien, echec)` | Le bloc du dernier recours : pourquoi la lecture a échoué, où trouver l'export. |
| `etatLienHTML(l)` | Ce qu'on sait d'un lien : son site, sa dernière vérification, son dernier changement. |
| `ouvreAdversaire(cle, opts = {})` | — |
| `majApercuAdversaire()` | Ce que la liste collée donne, à mesure qu'on la colle. |
| `adversaireDeLaFenetre(cle)` | L'adversaire tel que la fenêtre le décrit : lu sur le site quand on a donné un lien sans coller de liste, sinon tiré de la liste collée. |
| `enregistreAdversaireFenetre(cle)` | — |
| `supprimeAdversaire(cle)` | — |
| `supprimeAdversaireOui(cle)` | — |

| Donnée | Rôle |
|---|---|
| `FEN_ADV` | Ce que la fenêtre ouverte sait : la liste qu'elle montrait en s'ouvrant (pour savoir si l'on en a collé une autre), et l'échec d'une lecture. |

## js/fenComportement.js

Décrire à la main ce que fait une carte. *6 fonctions, 84 lignes, 4.4 Ko.*

| Fonction | Rôle |
|---|---|
| `aideFormules()` | Les formules admises, tirées des exemples mêmes des tables de motifs : la liste ne peut pas mentir sur ce que le compilateur sait lire. |
| `lectureHTML(fiche, texte)` | La lecture d'un texte, ligne par ligne. |
| `ouvreComportement(nom)` | — |
| `majApercuComportement()` | — |
| `appliqueComportement(nom)` | — |
| `effaceComportement(nom)` | — |

| Donnée | Rôle |
|---|---|
| `ETATS_LIGNE` | — |
| `FICHE_COMPORTEMENT` | — |

## js/fenJournal.js

Revoir une partie d'un lot. *1 fonctions, 38 lignes, 2.2 Ko.*

| Fonction | Rôle |
|---|---|
| `ouvreJournal(idLot, k)` | — |

| Donnée | Rôle |
|---|---|
| `NOMS_ETAPES` | — |

## js/gestesDecks.js

Les gestes des decks. *3 fonctions, 138 lignes, 5.2 Ko.*

| Fonction | Rôle |
|---|---|
| `gestesDecks(act, b)` | — |
| `saisieDeck(t)` | La frappe et les cases de la fenêtre de configuration. |
| `gestesDeckConfig(act, b)` | Les deux bascules de la fenêtre : une couleur, un rôle. |

## js/gestesVue.js

Les gestes qui règlent la vue. *1 fonctions, 112 lignes, 4.3 Ko.*

| Fonction | Rôle |
|---|---|
| `gestesVue(act, b)` | — |

## js/gestesReglages.js

Les fenêtres de réglage et leurs boutons. *1 fonctions, 140 lignes, 4.6 Ko.*

| Fonction | Rôle |
|---|---|
| `gestesReglages(act, b)` | — |

## js/gestesDeck.js

Les gestes du deck, de ses annexes et de la fiche. *1 fonctions, 193 lignes, 7.5 Ko.*

| Fonction | Rôle |
|---|---|
| `gestesDeck(act, b)` | — |

## js/gestesDonnees.js

Les gestes qui touchent aux données. *1 fonctions, 146 lignes, 4.9 Ko.*

| Fonction | Rôle |
|---|---|
| `gestesDonnees(act, b)` | — |

## js/gestesNuage.js

Les gestes de la synchronisation. *2 fonctions, 92 lignes, 3.2 Ko.*

| Fonction | Rôle |
|---|---|
| `gestesNuage(act, b)` | — |
| `gestesNuageChange(t)` | Les trois champs de la section. Rendu `true`, l'écouteur `change` d'`app.js` s'arrête là. |

## js/gestesGraphe.js

Les gestes du graphe et des listes. *1 fonctions, 108 lignes, 3.4 Ko.*

| Fonction | Rôle |
|---|---|
| `gestesGraphe(act, b)` | — |

## js/gestesSimulation.js

Les gestes de la section « Simulation ». *2 fonctions, 44 lignes, 2.1 Ko.*

| Fonction | Rôle |
|---|---|
| `gestesSimulation(act, b)` | — |
| `reglageSimulation(t)` | Un réglage de la table : il agit sur-le-champ — rien n'est calculé avant « Lancer », il n'y a donc rien à différer. |

## js/qrCorps.js

Le corps fini du QR code, et Reed–Solomon. *8 fonctions, 118 lignes, 5.1 Ko.*

| Fonction | Rôle |
|---|---|
| `gfMul(a, b)` | — |
| `gfDiv(a, b)` | — |
| `gfPow(e)` | — |
| `rsGenerateur(n)` | Le polynôme générateur de n mots de correction : ∏ (x − αⁱ), i < n, coefficients du plus haut degré au plus bas. |
| `rsCorrection(donnees, n)` | Les n mots de correction d'un bloc de données. |
| `polyVal(p, x)` | Évaluer un polynôme (degré haut d'abord) en x. |
| `rsDecode(recu, n)` | Corriger un bloc reçu (données puis correction) qui porte n mots de correction : syndromes, Berlekamp–Massey, Chien, Forney. |
| `qrCapacite(v, niveau)` | Le nombre de mots de données d'une version à un niveau. |

| Donnée | Rôle |
|---|---|
| `GF_EXP` | — |
| `QR_BLOCS` | Les blocs de chaque version et niveau de correction : [mots de correction par bloc, blocs du groupe 1, données par bloc du groupe 1, blocs du groupe 2, données par bloc du groupe 2]. |

## js/qrMatrice.js

La grille d'un QR code. *8 fonctions, 111 lignes, 4.6 Ko.*

| Fonction | Rôle |
|---|---|
| `qrTaille(v)` | — |
| `qrBitsFormat(niveau, masque)` | Les 15 bits de format d'un niveau et d'un masque (BCH 15,5, masqué). |
| `qrBitsVersion(v)` | Les 18 bits de version (BCH 18,6), à partir de la version 7. |
| `qrGrille(v)` | Une grille vide et le relevé de ses modules fixes : `fixe[y][x]` est vrai là où ni donnée ni correction n'ira. |
| `qrPositionsFormat(n)` | Les positions des 15 bits de format, en deux copies, bit i d'abord. |
| `qrPoseFormat(g, niveau, masque)` | — |
| `qrOrdre(g)` | L'ordre des modules de données : des colonnes de deux, de droite à gauche, en serpentant de bas en haut puis de haut en bas, la colonne de synchronisation sautée. |
| `qrMasque(g, k)` | Appliquer (ou retirer : c'est la même opération) un masque aux modules de données. |

| Donnée | Rôle |
|---|---|
| `QR_ALIGNEMENTS` | — |
| `QR_NIVEAUX` | — |
| `QR_MASQUES` | — |

## js/qrEcrit.js

Écrire un QR code. *6 fonctions, 110 lignes, 4.8 Ko.*

| Fonction | Rôle |
|---|---|
| `qrEstAlnum(t)` | — |
| `qrBitsDonnees(texte, v)` | Les bits d'un texte dans une version donnée (la largeur du compte de caractères change à la version 10). |
| `qrMots(bits, v, niveau)` | Les mots de données, complétés, découpés en blocs, suivis de leur correction, entrelacés. |
| `qrPenalite(m)` | La pénalité d'une grille (norme, §7.8.3) : les longues suites, les carrés de quatre, ce qui imite un motif de repérage, le déséquilibre. |
| `qrEcrit(texte, niveau = 'M')` | Écrire un texte en QR. Rend `{n, m, v}` ; lève une erreur au-delà de la version 10. |
| `qrSVG(qr, titre)` | Le SVG d'un QR, avec sa marge de quatre modules. |

| Donnée | Rôle |
|---|---|
| `QR_ALNUM` | — |

## js/qrBinarise.js

D'une image de caméra à du noir et du blanc. *3 fonctions, 57 lignes, 2.4 Ko.*

| Fonction | Rôle |
|---|---|
| `qrGris(img)` | La luminance d'une image RGBA (ImageData ou équivalent). |
| `qrBinarise(g, w, h)` | Une image binaire `{w, h, d}`, `d[i]` à 1 pour un pixel sombre. |
| `qrNoir(b, x, y)` | — |

## js/qrReperes.js

Trouver un QR code dans une image. *7 fonctions, 119 lignes, 5.3 Ko.*

| Fonction | Rôle |
|---|---|
| `qrProportions(l, rapports)` | Des longueurs sont-elles dans les proportions voulues ? |
| `qrTroisSuites(b, x, y, dx, dy, max)` | Compter, depuis un pixel sombre, la suite sombre, puis claire, puis sombre dans une direction. |
| `qrTraverse(b, x, y, dx, dy, rapports, max)` | Traverser un candidat dans une direction : rend le centre affiné et la taille de module, ou `null`. |
| `qrChercheReperes(b)` | Les centres des carrés de repérage `{x, y, m, n}` (n : détections). |
| `dist(a, b)` | — |
| `qrTriplets(cands)` | Les triplets qui peuvent former le QR, du plus vraisemblable au moins, chacun ordonné haut-gauche, haut-droite, bas-gauche. |
| `qrChercheAlignement(b, px, py, m)` | Chercher le motif d'alignement autour de l'endroit prévu. |

| Donnée | Rôle |
|---|---|
| `QR_REPERE` | — |

## js/qrLit.js

Lire un QR code repéré. *10 fonctions, 168 lignes, 7.4 Ko.*

| Fonction | Rôle |
|---|---|
| `qrCarreVersQuad(q)` | L'homographie du carré unité vers un quadrilatère (coins dans l'ordre (0,0), (1,0), (1,1), (0,1)). |
| `qrAdjointe([a11, a21, a31, a12, a22, a32, a13, a23, a33])` | — |
| `qrCompose(a, o)` | — |
| `qrApplique(t, x, y)` | — |
| `qrEchantillonne(b, t, n, m)` | Échantillonner une grille de n modules : chaque module au vote de neuf points autour de son centre. |
| `qrLitFormat(m, n)` | Le format lu sur la grille : le niveau et le masque dont les 15 bits sont les plus proches de l'une des deux copies (trois erreurs au plus). |
| `qrSegments(mots, v)` | Les segments d'un flux de données : numérique, alphanumérique, octets. |
| `qrLitGrille(m, v)` | Lire une grille échantillonnée de version v. |
| `lisQR(img)` | Lire le premier QR d'une image RGBA. Rend le texte, ou `null`. |
| `qrLitTriplet(b, t)` | Lire le QR que désigne un triplet. La taille d'un module, mesurée sur les carrés de repérage, sort trop grande d'une image floue ou tournée — d'une bonne dizaine de pour cent : on essaie… |

## js/camera.js

Lire un QR code avec la caméra. *5 fonctions, 82 lignes, 3.2 Ko.*

| Fonction | Rôle |
|---|---|
| `ouvreCamera(video)` | Ouvrir la caméra dans un élément vidéo de la page. |
| `fermeCamera()` | — |
| `detecteurNatif()` | Le détecteur du navigateur, s'il sait lire les QR. |
| `lisImage(video)` | Lire une image de la vidéo : le texte du QR, ou `null`. |
| `scanne(video, accepte)` | Lire en boucle jusqu'à un QR qu'accepte `accepte(texte)`, ou l'arrêt. |

| Donnée | Rôle |
|---|---|
| `CAMERA` | — |

## js/liaisonCode.js

Ce que les deux QR codes transportent, au plus court. *10 fonctions, 127 lignes, 5.4 Ko.*

| Fonction | Rôle |
|---|---|
| `ecrivain()` | — |
| `lecteur(o)` | — |
| `empaquette(d)` | Empaqueter les champs d'une description : drapeaux, jeton du siège, ufrag, pwd, empreinte, candidats (4 : IPv4, 6 : IPv6, 1 : nom mDNS). |
| `depaquette(o)` | — |
| `base64url(o)` | — |
| `deBase64url(s)` | — |
| `base45(o)` | Base45 (RFC 9285) : deux octets en trois signes alphanumériques. |
| `deBase45(s)` | — |
| `codeATaper(o)` | — |
| `deCodeATaper(txt, longueur)` | — |

| Donnée | Rôle |
|---|---|
| `B64` | — |
| `B32` | Le code à taper : base32 sans voyelles ambiguës, par groupes de quatre, chaque groupe suivi d'un signe de contrôle pour dire où l'on s'est trompé plutôt que « code faux ». |

## js/liaisonSdp.js

Lire une description WebRTC, en rebâtir une. *5 fonctions, 75 lignes, 3.7 Ko.*

| Fonction | Rôle |
|---|---|
| `lisSdpLocal(sdp)` | Les champs d'une description locale : ufrag, pwd, empreinte, rôle DTLS, et les candidats utilisables sur un réseau local. |
| `choisitCandidats(tous)` | Les candidats qu'on garde : IPv4 de réseau local d'abord, puis noms mDNS, puis IPv6 globale ; jamais 169.254 ni fe80. |
| `ipv6Octets(a)` | — |
| `adresseCandidat(c)` | — |
| `sdpDistant(d)` | Rebâtir une description distante. `d.setup` : actpass pour une offre, le rôle que l'autre a vraiment pris pour une réponse. |

## js/liaison.js

Deux navigateurs reliés sans serveur. *7 fonctions, 114 lignes, 5 Ko.*

| Fonction | Rôle |
|---|---|
| `nouvelleConnexion()` | — |
| `collecteFinie(pc, ms = 2000)` | Attendre la fin de la collecte des candidats, deux secondes au plus : sans serveur il n'y a que des candidats locaux, qui viennent en un instant. |
| `creeOffre(jeton)` | L'hôte : une offre, et ce qu'il faut en mettre dans le QR. |
| `repondOffre(offre)` | L'invité : répondre à une offre lue dans un QR. |
| `appliqueReponse(pc, rep)` | L'hôte : appliquer la réponse d'un invité. |
| `canal(c, surMessage, surEtat)` | Un canal de messages au-dessus du canal de données : envoyer, recevoir, savoir si l'autre est encore là. |
| `jetonNeuf()` | Un jeton de siège, tiré au sort : il dit à l'hôte quelle réponse va avec quel siège, et permet à un invité de reprendre sa place. |

| Donnée | Rôle |
|---|---|
| `MORCEAU` | — |

## js/tableHote.js

La partie que ce navigateur héberge. *12 fonctions, 164 lignes, 7.3 Ko.*

| Fonction | Rôle |
|---|---|
| `attendre(ms)` | — |
| `signePublic(P)` | Ce qu'un humain verrait changer : la pile, le champ, les points de vie. |
| `siegeDeSource(s)` | Le siège moteur d'une source choisie au salon : un deck de l'atelier, un adversaire de la bibliothèque, ou les fiches reçues d'un invité. |
| `commenceTable()` | Commencer la partie que le salon décrit. Les cartes que personne ne connaît encore sont demandées à Scryfall avant. |
| `boucleTable()` | La boucle d'aiguillage. Elle s'arrête quand un humain doit répondre, et reprend à sa réponse (`recoitReponse()`). |
| `poseQuestion(q)` | Porter une question à son siège : l'interface de cet appareil, ou l'appareil de l'invité. |
| `recoitReponse(j, n, r)` | Une réponse arrive, de cet appareil ou d'un invité. |
| `diffuseVues(tout)` | Repeindre la table de cet appareil et envoyer leur vue aux invités, au plus une fois tous les cent millisecondes. |
| `journalTable()` | Le journal de la partie hébergée, ligne par ligne. |
| `majArretsTable()` | Les arrêts du siège local ont changé : la partie en cours les suit. |
| `passeJusquaMonTour(j)` | « Passer jusqu'à mon tour » : retenu sur le siège, il tombe au début de son prochain tour. |
| `quitteTable()` | — |

| Donnée | Rôle |
|---|---|
| `TABLE` | — |

## js/tableRendu.js

La table, peinte depuis une vue. *9 fonctions, 124 lignes, 7.3 Ko.*

| Fonction | Rôle |
|---|---|
| `imageCarte(nom)` | Le visuel d'une carte : celui que l'atelier connaît, sinon celui que Scryfall sert par son nom. |
| `chipCarte(o, v)` | Une carte du champ, de la main ou d'une zone, en vignette de texte : lisible sans réseau, et dix fois plus dense qu'une image sur un téléphone. |
| `bandeauJoueur(J, v, estMoi)` | Le bandeau d'un joueur : son nom, ses points de vie, ses zones, son champ. |
| `pileHTML(v)` | — |
| `journalTableLignes()` | Les dernières lignes du journal, qui disent ce que les autres ont fait. |
| `detailHTML(v)` | — |
| `partieHTML()` | — |
| `finHTML(v)` | — |
| `renduTable()` | Peindre la table, si elle est ouverte. |

## js/tableQuestions.js

Répondre à une question du moteur, à la main. *13 fonctions, 148 lignes, 7.1 Ko.*

| Fonction | Rôle |
|---|---|
| `selDe(q)` | La sélection en cours, propre à la question affichée. |
| `etatChoix(id)` | L'état d'une carte vis-à-vis de la question : choisissable, choisie, ou rien. |
| `etatJoueur(j)` | — |
| `repondsTable(r)` | Envoyer une réponse : au moteur sur l'hôte, à l'hôte depuis un invité. |
| `nomVisible(id)` | Le nom d'une carte visible, pour la montrer en grand. |
| `montreDetail(id)` | — |
| `basculeChoix(q, s, i)` | — |
| `clicCarte(id)` | Un toucher sur une carte de la table. |
| `clicJoueur(j)` | — |
| `valideTable()` | « Valider » : la sélection en cours, sous la forme que le moteur attend. |
| `bornes(q)` | — |
| `chipsChoix(q, s)` | Les choix d'une question à cases. |
| `questionHTML(q, v)` | Le bandeau de la question. |

| Donnée | Rôle |
|---|---|
| `TITRES_Q` | — |

## js/tableCombat.js

Attaquer et bloquer, au doigt. *4 fonctions, 73 lignes, 3.8 Ko.*

| Fonction | Rôle |
|---|---|
| `etatCombatTable(q, s, id)` | — |
| `clicCombat(q, s, id)` | Un toucher pendant un combat. Rend vrai s'il a servi. |
| `combatHTML(q, s, v)` | — |
| `attaqueTous()` | — |

## js/tableSalon.js

Le salon : qui s'assoit à la table, avec quel deck. *11 fonctions, 130 lignes, 7.5 Ko.*

| Fonction | Rôle |
|---|---|
| `sourcesDeDecks()` | — |
| `nomDeSource(src)` | — |
| `siegesDuSalon()` | Les sièges du salon, tels que `commenceTable()` les attend. |
| `salonHTML()` | — |
| `siegeDistantHTML(e, i)` | Le siège d'un invité au salon : son QR tant qu'il n'a pas répondu, puis son nom et son deck. |
| `alertesInvitesHTML()` | Pendant la partie, chez l'hôte : les invités qui ne répondent plus. |
| `ouvreSalon()` | — |
| `reglageSalon(t)` | — |
| `ajouteSiegeIA()` | — |
| `retireSiege(i)` | — |
| `commenceDepuisSalon()` | — |

| Donnée | Rôle |
|---|---|
| `ETATS_INVITE` | — |

## js/tableLiaison.js

Les invités de l'hôte. *23 fonctions, 188 lignes, 6.7 Ko.*

| Fonction | Rôle |
|---|---|
| `adressePublique()` | L'adresse où les téléphones trouvent l'atelier : celle qu'on a réglée, ou celle de cette page si elle est servie en http(s). |
| `texteOffre(s)` | — |
| `videoTable()` | La vidéo de la caméra : un seul élément, posé une fois hors de la table, pour que les repeints de la table ne coupent pas son flux. |
| `montreVideo(oui)` | — |
| `ajouteInvite()` | Ajouter un siège d'invité : la caméra, puis l'offre et son QR. |
| `prepareOffre(s)` | — |
| `scanneReponses()` | Lire à la caméra les réponses des invités qui en attendent une. |
| `sautReponse(t, tape)` | Une réponse lue (base45) ou tapée (base32), si elle va avec un siège qui l'attend. |
| `relie(r)` | — |
| `relieCode(cle)` | « Relier » avec le code tapé. |
| `etatDistant(s, e)` | — |
| `recoitDistant(s, m)` | — |
| `envoieDebut()` | Ce que l'hôte envoie à un invité pendant la partie. |
| `nouvellesLignes(s)` | — |
| `envoieVue(s, i)` | — |
| `envoieQuestion(s, q)` | — |
| `envoieErreur(s, n, err)` | — |
| `renvoieTout(s)` | Un invité revenu : sa place, sa vue, et la question qui l'attendait. |
| `repriseInvite(cle)` | Un nouveau QR pour un invité perdu : même jeton, même siège. |
| `confieInvite(cle)` | — |
| `oublieDistant(cle)` | — |
| `fermeLiaisons()` | — |
| `gardeEveil()` | Garder l'écran allumé pendant la partie : un téléphone en veille perd la liaison au bout d'une trentaine de secondes. |

## js/tableInvite.js

Rejoindre la table d'un autre. *14 fonctions, 135 lignes, 6.7 Ko.*

| Fonction | Rôle |
|---|---|
| `lisOffreTexte(t)` | L'offre d'un hôte, lue dans une adresse ou un texte de QR. |
| `rejoindreDepuisAdresse()` | Au démarrage : l'adresse porte-t-elle une offre ? On l'efface aussitôt, pour qu'un rechargement ne rejoigne pas une seconde fois. |
| `ouvreRejoindre(offre)` | — |
| `scanneOffre()` | — |
| `lienOffreColle()` | Le lien de l'hôte, collé à la main. |
| `reglageInvite(c, t)` | — |
| `pret()` | « Prêt » : les fiches du deck choisi, la réponse et son QR. |
| `etatHote(e)` | — |
| `recoitHote(m)` | — |
| `envoieReponse(n, r)` | — |
| `envoieArrets()` | — |
| `envoiePasseTour()` | — |
| `perteHoteHTML()` | Chez l'invité, la liaison perdue : il faut le QR de reprise de l'hôte. |
| `rejoindreHTML()` | — |

## js/tableReprise.js

Reprendre une partie après un rechargement. *4 fonctions, 66 lignes, 2.8 Ko.*

| Fonction | Rôle |
|---|---|
| `sauveTable()` | Ranger la partie, au plus une fois par seconde. |
| `oublieTableSauvee()` | — |
| `chercheTableSauvee()` | Y a-t-il une partie interrompue ? Lu une fois au démarrage, pour que la section Simulation propose de la reprendre. |
| `reprendTable()` | Rejouer la partie rangée jusqu'au coup en attente, puis rendre la main. |

| Donnée | Rôle |
|---|---|
| `IDB_TABLE` | — |
| `SAUVE_TABLE` | — |
| `TABLE_SAUVEE` | — |

## js/fenArrets.js

Les arrêts de la table. *5 fonctions, 55 lignes, 2.7 Ko.*

| Fonction | Rôle |
|---|---|
| `corpsArrets()` | — |
| `ouvreArrets()` | — |
| `caseArret(t)` | Une case cochée : au brouillon. |
| `arretsDefaut()` | — |
| `appliqueArrets()` | — |

| Donnée | Rôle |
|---|---|
| `ETAPES_ARRET` | — |

## js/gestesTable.js

Les gestes de la table interactive. *3 fonctions, 60 lignes, 3 Ko.*

| Fonction | Rôle |
|---|---|
| `gestesTable(act, b)` | — |
| `passeTour()` | « Passer jusqu'à mon tour », sur l'hôte comme depuis un invité. |
| `ouvreJournalTable()` | Le journal de la partie en cours, en grand. |

## js/app.js

L'aiguillage et le démarrage. *1 fonctions, 299 lignes, 12 Ko.*

| Fonction | Rôle |
|---|---|
| `demarrer()` | — |

| Donnée | Rôle |
|---|---|
| `dlgEl` | Fermeture au clic sur l'arrière-plan (backdrop) |

