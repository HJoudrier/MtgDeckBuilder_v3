# Atelier MTG — architecture du projet

Application d'aide à la construction de deck Magic. Aucun serveur, aucune dépendance :
les fichiers s'ouvrent directement dans un navigateur.

## Organisation

Les diagrammes de séquence des parcours — ce qui s'appelle, dans quel ordre, quand on ajoute une
carte, qu'on filtre ou qu'on retire une carte du deck — sont dans [PARCOURS.md](PARCOURS.md). Le
présent document dit ce que fait chaque fonction ; celui-là, l'ordre où elles s'appellent.

```
index.html          page et structure des sept sections
css/atelier.css     styles
css/table.css       styles de la table interactive
outils/genDoc.js    écrit doc/fonctions.md à partir des sources
js/                 modules, chargés dans cet ordre :

  — le fond —
  reglesEffets.js   le vocabulaire du graphe : nœuds, effets, déclencheurs
  effets.js         qualifier un déclencheur, un effet, et les accorder
  synergies.js      ce qu'une carte apporte à une autre
  cartesBrutes.js   la base livrée avec l'atelier
  analyse.js        lire une carte : coût, capacités, déclencheurs, effets
  archetypesLibelles.js  le nom français des thèmes EDHREC
  categories.js     les rôles d'une carte
  mana.js           ce qu'une carte demande en mana, et ce qu'elle en produit
  impressions.js    les éditions d'une carte, et celle qu'on possède
  cartes.js         la base de cartes et ses index
  liens.js          interaction précise ou déclencheur large
  etat.js           l'état : `S` et les tables de l'atelier
  decks.js          les decks, et celui sur lequel on travaille
  archetypesSets.js deux vocabulaires venus du dehors, et leurs filtres
  filtres.js        les critères de la fenêtre « Filtres »
  restrictions.js   le filtre que porte un deck, et qu'on n'efface pas d'une puce
  retenue.js        ce qui reste après les filtres : légalité, couleurs
  catalogueEtat.js  l'archive en mémoire, et les nœuds qu'elle touche
  groupes.js        grouper et trier les listes
  barreGroupes.js   l'enveloppe d'un groupe, et la mise en page d'une liste
  marche.js         Cardmarket
  achats.js         le panier d'un deck, et la liste d'achats de tous

  — le moteur de jeu (purs : ni DOM ni DB, entre <!-- moteur --> et <!-- /moteur -->) —
  oracleTexte.js    réduire le texte oracle : nom → ~, rappel retiré, lignes, phrases
  oracleMotsCles.js les mots-clés que le moteur sait jouer, en bits
  oracleCouts.js    lire un coût de sort ou d'activation
  oracleCibles.js   une seule grammaire pour désigner des objets
  oracleEffetsA.js  les motifs d'effet : dégâts, vie, cartes, retraits
  oracleEffetsB.js  jetons, marqueurs, pompes, mana, recherches ; lire une proposition
  oracleDeclencheurs.js  lire ce qui déclenche une capacité
  oracleStatiques.js  les statiques, et la façon d'entrer
  oracleLignes.js   ranger chaque ligne d'une carte
  definitions.js    d'une fiche à sa définition de jeu, et sa couverture
  forgeScript.js    lire un script de carte de Forge, sans l'interpréter
  forgeCouverture.js  ce qu'un script demande au moteur, ce que le moteur sait
  jeuHasard.js      le hasard semé
  jeuEtat.js        une partie : joueurs, objets, zones, déplacements, questions
  jeuGestes.js      les gestes qui font un évènement : engager, dégager, poser des marqueurs, cibler
  jeuHistorique.js  ce qui s'est passé ce tour : entrées, blessures, vie perdue, mana dépensé, résolutions
  jeuCaracteristiques.js  force, endurance, mots-clés du moment
  jeuCibles.js      juger un objet contre un descripteur
  jeuMana.js        la réserve, et le paiement automatique
  jeuManaFiltres.js le mana qui coûte du mana : terrains-filtres, Cabal Coffers, Grinning Ignus — un complément du solveur de paiement
  jeuManaManuel.js  le paiement manuel : engager ses sources soi-même, et choisir la couleur d'un effet de mana
  jeuOpsA.js        exécuter les opérations : références, dégâts, vie, cartes, retraits
  jeuOpsB.js        jetons, marqueurs, pompes, recherches ; l'enchaînement
  jeuDeclencheurs.js  des évènements aux capacités déclenchées
  jeuEtatsDeJeu.js  les actions d'état, et un joueur qui perd
  jeuLancer.js      les actions légales, le coût d'un sort, le choix des cibles
  jeuActions.js     jouer un terrain, lancer, activer, équiper
  jeuVariantes.js   kicker, rachat, évocation, présage, convocation, exploration, écho, folie, suspension
  jeuVariantesB.js  coût alternatif, escape, retrace, jump-start, dash, spectacle, surge, split second, rebound
  jeuCoutsB.js      les morceaux de coût de plus : meuler, exert, blight, collecter des indices…
  jeuCoutsX.js      les coûts dont la quantité est X ; se renvoyer, se marquer, exiler un permanent ; la garde non-mana ; « unless pays Y »
  jeuDurees.js      ce qui dure : effets, déclencheurs retardés, retours d'exil, régénération
  jeuFaces.js       faces d'une carte, face cachée, transformation, sagas, véhicules
  jeuFacesB.js      jour et nuit, loups-garous, craft, omen, fuse, prototype
  jeuPermis.js      jouer une carte depuis l'exil, le cimetière ou le dessus de la bibliothèque
  jeuPrepare.js     lancer la copie du sort d'une créature préparée
  jeuPioche.js      la pioche d'une partie : « if you would draw… instead », Dredge, Miracle
  jeuCouches.js     ce qu'une statique fait devenir un permanent : contrôleur, types, capacités
  jeuPile.js        la priorité, la pile, la résolution
  jeuCombat.js      attaquants, bloqueurs, dégâts de combat
  jeuTour.js        les étapes d'un tour
  jeuPartie.js      mélange, mulligans, la partie entière
  jeuPilote.js      dérouler une partie, question après question
  jeuCopie.js       copier une partie et la reprendre : la copie partage les définitions, la reprise repart d'un point sûr
  jeuVue.js         ce qu'un joueur voit de la partie, et une question lisible par un humain
  jeuPileExplique.js  décrire un élément de pile, et garder celui qu'on résout pour que les questions s'y rapportent
  jeuArrets.js      quand demander à un joueur humain
  forgeValide.js    le langage de filtres de Forge (`Creature.OppCtrl+powerLE2`)
  forgeDescripteurs.js  ce qu'un filtre devient pour le moteur : emplacement de cible, genre de marqueur, zone
  forgeExpr.js      les quantités de Forge (`Count$Valid …`, `Count$xPaid`, `/Twice`)
  forgeDefini.js    ce que `Defined$` désigne (`Targeted`, `Remembered`, `TriggeredCard`…)
  forgeDesignations.js  ce que Forge désigne encore : joueurs retenus, dessus de la bibliothèque, monarque, marqueurs d'un joueur, monstrueux
  forgeCout.js      lire un coût de Forge (`2 R T Sac<1/CARDNAME>`)
  forgeEffetsA.js   le registre des effets, zones et cartes
  forgeExecute.js   la porte `executeForge()` : conditions, coût payé en route, « may », « unless pays », mémoire de la carte
  forgeEffetsB.js   bibliothèque, dégâts et vie, retraits, jetons et marqueurs
  forgeEffetsC.js   pompes, engagements, mana, combats, contrôle, mémoire, réflexes
  forgeEffetsD.js   régénération, effets temporaires, déclencheurs retardés, capacités accordées
  forgeChoix.js     choisir une couleur, un type, une carte, un joueur, un nombre, un mode ; « en entrant »
  forgeCopies.js    jetons copies, entrer comme copie, copier un sort
  forgeTraine.js    la traîne : exaltation, terreur, bushido, tempête, cascade, brouillard, comploter, explorer
  forgeDeclencheurs.js  quand un déclencheur de Forge se déclenche
  forgeDeclencheursB.js  la suite : engager, cibler, marqueurs, attaque déclarée, crime, déclencheurs d'état
  forgeDeclencheursC.js les déclencheurs qui butaient : revolt, delirium, monarque, contrôleur désigné, une seule fois, seconde phase principale, sort lancé par permission
  forgeDegagements.js dégager « jusqu'à N », piocher « jusqu'à N », les terrains qui entrent dégagés, le mana d'une couleur choisie
  forgeExprB.js     les expressions de Forge, suite : mémoire, cibles, évènement, comptes du tour
  forgeEffetsE.js   la bibliothèque et ce qu'on révèle ; lancer une carte depuis un effet ; découvrir
  forgeEffetsF.js   les paramètres de plus des effets courants, par enveloppe (`etendEffet()`)
  forgeEffetsG.js   les mécaniques de partie : boucles des scripts, dés, monarque, tours en plus, phasing, goad
  forgeEffetsH.js   doubler ou déplacer des marqueurs, nommer une carte, détenir, blocage imposé, dégâts de chacun, endurer, détourner un sort, une phase de plus
  forgeEffetsI.js   deux piles, clash, vote, sauter une étape, l'initiative, earthbend, airbend ; un sort de permanent à coût additionnel ; exhaust
  forgeEntrees.js   les entrées : remplacements des autres, de soi, « paie avant d'entrer », copies ; restrictions de cible
  forgeAuras.js     les auras de joueur (Curses), bestow, reconfigure ; attacher ce qu'on choisit
  forgeDurees.js    ce qui dure sur un objet (prochain tour, fin du combat, tant que la source reste) ; préparée, enfourchée
  forgeStatiques.js les statiques de Forge, lues par car(), coutSort(), peutBloquer()
  forgeInterdits.js les statiques qui interdisent, imposent ou permettent : lancer, activer, attaquer, bloquer
  forgeStatiquesB.js les statiques hors du champ : mots-clés accordés aux sorts, au cimetière, à la main ; coûts facultatifs, exercer, équiper moins cher
  forgeRemplacements.js  les remplacements de Forge : exil au lieu du cimetière, dégagement, contre, prévention
  forgeRemplacementsB.js  la suite : ne pas perdre, sauter une étape, flashback accordé, déclencheurs de scry, dé, monstruosité
  forgeRemplacementsC.js les dégâts remplacés : prévenir N, détourner, partager ; choisir une source ; l'effet qui s'exile
  forgeRemplacementsD.js les remplacements, IV : jetons en plus ou à la place, marqueurs selon qui les pose, vie perdue, tour en plus sauté, meule, prolifération, exil avec une suite
  forgeManaB.js     le mana, II : condition d'activation, depuis la main, incontrecarrable, multikicker, mana gardé, multiplié ou ajouté
  forgeEmpreinte.js l'empreinte, tenue à part de la mémoire : ce qui y entre, en sort, la lit ; le mana de la carte exilée
  forgeMemoire.js   la mémoire, II : nombres retenus, instantanés, partages de type, aura qui réanime, déclencheurs statiques
  forgeModes.js     les modes qu'on paie (Spree, Tiered, Escalate), le mode retenu des Sièges
  forgeMotsClesF.js les mots-clés, III : Afflict, Dethrone, Ravenous, Web-slinging, Freerunning, Harmonize, Impending, Soulbond, harness
  forgeManaC.js     le mana qui porte quelque chose : un mot-clé au sort qu'il paie, « when you spend this mana », le remplacement optionnel
  forgeParadigme.js Paradigm : exilé à la première résolution, une copie gratuite au début de chaque première principale
  forgeProtections.js  se protéger : de tout (un joueur), de chaque couleur, d'une couleur au ciblage ; une vie qui ne change plus
  forgeHideaway.js  Hideaway : cacher une carte du dessus, la jouer plus tard
  forgeDeclencheursD.js  des déclencheurs de plus : jeton créé, première pioche de l'étape, « one or more », cartes meulées, l'Anneau
  forgeZonesC.js    chercher, creuser, déplacer : valeur de mana totale, engagé, attaquant, manifester chez qui l'on dit
  forgeExprC.js     des quantités de plus : lancée depuis l'exil, phase principale, métalcraft, nombre de couleurs, marqueurs par genre
  forgeChoixC.js    choisir, défausser, répéter, sacrifier : listes de types, « unless you discard », chacun son tour, force totale
  forgeDeclencheursE.js  des paramètres de déclencheur de plus : première phase de combat, conditions Threshold/Metalcraft/Blessing, sort lancé, zones exclues
  forgeRadiation.js  les marqueurs de radiation : meuler puis perdre de la vie, au début de la première principale
  forgeAnneau.js    l'Anneau vous tente, aux niveaux 2 à 4
  forgeEffetsL.js   des effets et conditions de plus : finir le tour, excès de dégâts, jeton bloquant, restrictions de moment
  forgeEffetsM.js   Blight, Exploit, et les déclencheurs d'exploration, d'exploitation et de dés
  forgeEffetsN.js   la seconde paire de PutCounterAll, une destination de rechange pour ChangeZone
  forgeManaD.js     dépenser du mana d'une autre couleur (ManaConvert), compter la dépense du tour (ManaExpend)
  forgeDeclencheursF.js  marqueurs posés par lot, vie à l'entretien, déclencheurs d'entrée coupés
  forgeCopiesB.js   ce que la copie reçoit de plus : couleurs, types ôtés, mot-clé du tour, entrée engagée
  forgeEntreesB.js  « ce sort entre avec des marqueurs de plus / engagé » : un effet qui retient le sort lancé
  forgeEntreesC.js  entrer engagé sauf si l'on révèle ou contrôle ; sacrifier les homonymes avant d'entrer
  forgeChaque.js    « EACH Forest & Plains » : chercher une carte par filtre
  forgeTerrains.js  ce que les terrains font de plus : cibles de même type, rendre les créatures, mana du cimetière
  forgeFouilles.js  fouiller sa bibliothèque : SearchedLibrary, cartes révélées
  forgeCapacitesAccordees.js  GainsAbilitiesOf : avoir les capacités activées des autres
  forgeEffetsK.js   des effets de plus : la protection de la couleur d'une carte visée
  forgeBatailles.js   les batailles : défense, protecteur, vaincre, lancer la face arrière
  forgeEffetsJ.js   des effets durables : un nombre retenu par l'effet (SetChosenNumber)
  forgeMarqueursC.js  marqueurs et dés : retenir l'armée, N fois, par objet désigné, au plus N, pairs et impairs
  forgeMotsClesG.js les mots-clés, IV : évasions du tour, prévention, Training, Undaunted, Gravestorm, règles de deck sans effet en jeu
  forgeStatiquesC.js  des statiques refusées : hexproof contre un genre de sources, jouer d'en haut sous condition, ne plus piocher
  forgeStatiquesD.js  activer comme avec la célérité, ignorer la règle des légendes, ne pas sacrifier ni payer de vie, limiter attaquants et bloqueurs
  forgeDefiniC.js   ce que Defined$ désigne encore : défenseur adversaire, sacrifié, joueurs par propriétés, bibliothèque, pile
  forgeExprD.js     des quantités sur les joueurs : vie perdue ce tour, groupes de joueurs, combien en ont la propriété
  forgeFiltresD.js  des propriétés de filtre, II : choisi, retenu, visé, cmc pair, force égale à l'endurance, plus de terrains que vous
  forgeCoutsC.js    ce que les statiques font au coût de jouer : vie pour mana, autre coût accordé, capacités moins chères, flash
  forgeFiltresC.js  des propriétés de filtre de plus : type de terrain de base, coût {0} ou {1}, nom déjà pris, type partagé avec le commandant
  forgeDesignes.js  désigner et filtrer : NotDefinedTargeted, désignations pointées, choisir parmi des désignés, la force du sort qui déclenche
  forgeAlias.js     ce que Forge a tiré de Pump : TargetOnly, Bookkeeping, EndOfTurn, Nothing — chargé après tous les forge*.js
  forgeActivations.js  la mise sous tension (PowerUp), lancer une copie pour un autre coût, le mana venu de créatures, Count$YourTurns
  forgeChoixMultiples.js  chacun choisit parmi les siens, DigMultiple, des marqueurs pris parmi plusieurs permanents, la cible chez le joueur du déclencheur, la copie non légendaire
  forgePaliers.js   les paliers : Station, niveaux de classe, portes des Rooms, vitesse
  forgeMotsClesB.js les mots-clés des permanents, suite : déclencheurs synthétiques et règles du combat
  forgeMotsClesC.js les mots-clés de lancement, suite : entwine, replicate, casualty, squad, offspring, blitz, warp, embalm, encore, transmute, ninjutsu, plot
  forgeMotsClesD.js les mots-clés des permanents, troisième partie : annihilator, renown, rampage, mobilize, mentor, graft, backup, sunburst, devour, ascend, strive, Leylines
  forgeMotsClesE.js les mots-clés de lancement, II : overload, awaken, sneak, mayhem, gift, bargain, conspire, emerge, splice ; firebending, cipher
  forgeMotsCles.js  les mots-clés de Forge (`K:`)
  forgeDefinition.js  d'un script de Forge à une définition de jeu
  iaValeur.js       ce que vaut une carte, un permanent, un adversaire
  iaChoix.js        garder sa main, cibler, chercher, défausser
  iaPriorite.js     ce que le joueur automatique fait de sa priorité
  iaCombat.js       attaquer et bloquer
  iaEvaluation.js   ce que vaut une position : la note commune que le combat calculé et la recherche comparent
  iaCombatCalcul.js le combat calculé : alpha-bêta à deux niveaux sur un modèle réduit du combat
  iaMulligan.js     garder sa main, ou non, par tirages de la bibliothèque
  iaAgent.js        un joueur automatique, ses niveaux, la version de l'IA
  iaRecherche.js    les niveaux moyen et fort : essayer ses coups sur une copie de la partie

  — ce qui vient du dehors —
  champsJeu.js      ce que le moteur demande à une carte : mots-clés, loyauté, faces
  symboles.js       les symboles de mana
  scryfallApplique.js  verser une réponse de Scryfall dans une carte
  scryfall.js       la file d'attente vers Scryfall
  recherches.js     les recherches nommées chez Scryfall
  decksStockage.js  les dossiers de deck, rangés et relus
  simSources.js     ce qui s'assoit à un siège de la simulation : un deck de l'atelier, externe ou non
  stockage.js       la sauvegarde locale
  fenSauvegarde.js  les sections « Sauvegarde » et « Catalogue »
  idb.js            le magasin IndexedDB
  nuagePaquet.js    ce qui voyage d'un appareil à l'autre, et sous quelle forme
  nuageFusion.js    fusionner deux appareils sans rien perdre
  nuageDropbox.js   l'adaptateur Dropbox : PKCE, et le `rev` comme verrou
  nuage.js          la synchronisation : sa configuration, et son calendrier (à l'ouverture, puis sur demande)
  nuageDiagnostic.js  éprouver la connexion, étape par étape
  edhrec.js         les statistiques d'EDHREC pour un commandant
  edhrecForme.js    deviner la forme des pages de thèmes d'EDHREC
  edhrecThemes.js   l'index des thèmes EDHREC
  sets.js           les sets publiés par Scryfall
  gameChangers.js   la liste des « Game Changers »
  archive.js        lire l'archive Scryfall
  catalogue.js      tenir le catalogue à jour
  candidats.js      des enregistrements de l'archive aux cartes candidates

  — les sections —
  decksSection.js   la section « Mes decks »
  wishlistSection.js la section « Liste d'achats »
  simCollection.js  la couverture de la collection : part entièrement comprise, listes des partielles et injouables
  acquisitionSection.js la section « Acquisition en cours » : commandé, pas encore reçu
  graphe.js         graphe des capacités
  stats.js          statistiques
  notation.js       la note d'une carte candidate
  vivier.js         le vivier des candidates, et son empreinte
  sugOrdre.js       l'ordre gelé des propositions
  sugCommandants.js les commandants du deck, en tête de l'onglet EDHREC
  sugListes.js      le fond commun des trois listes de propositions
  sugGraphe.js      la section du graphe : ce qui se branche sur les nœuds
  sugEdhrec.js      la section EDHREC : ce que les decks recensés recommandent
  sugCatalogue.js   la section du catalogue : tout le classement
  suggestions.js    les trois sections des propositions
  collection.js     la section Collection, et la suppression d'une carte
  collectionDates.js  les dates d'ajout des cartes de la collection
  fenImport.js      importer une liste de cartes
  fenAjout.js       ajouter une carte à la main (les deux listes annexes)
  rechercheSection.js  le champ de recherche d'une section, et ses propositions
  annexes.js        la réserve et l'étude
  deck.js           ce qu'il y a dans le deck, et les gestes qui l'y mettent
  legalite.js       ce que le format exige, et l'équilibre des rôles
  deckSection.js    la section Deck
  ficheVisuel.js    le visuel de la fiche, et ses éditions
  fiche.js          la fiche détaillée d'une carte
  ficheParcours.js  ouvrir une fiche, et feuilleter la liste d'où elle vient
  simCartes.js      d'un nom de carte à sa fiche de jeu, cartes des decks externes comprises
  simPreparation.js d'un deck à un siège de table
  simStats.js       ce qu'on retient d'une partie, et d'un lot
  simStockage.js    les résultats des lots, gardés et comparés
  simulation.js     un lot de parties, par tranches
  simSection.js     la section « Simulation »
  simResultats.js   les résultats d'un lot, l'historique, le classement
  forgeDepot.js     les scripts de Forge, téléchargés de GitHub et gardés
  forgeVue.js       la section « Cartes Forge » et « Ce qu'il manque au moteur »

  — l'interface commune —
  outils.js         échapper, formater un prix, souffler un mot
  theme.js          le thème clair et le thème sombre
  dialogue.js       la fenêtre modale, une à la fois
  brouillon.js      les réglages qui n'agissent qu'à « Appliquer »
  couleurs.js       le nom des combinaisons de mana
  apercu.js         l'aperçu volant sous le curseur
  versions.js       les éditions d'une même carte
  tuiles.js         vignette et ligne d'une carte, et celles d'une proposition
  ancre.js          garder sa place dans le défilement
  differe.js        ce qu'on ne calcule que sous les yeux
  recalcul.js       les recalculs annoncés, par tranches
  entete.js         l'en-tête, seul en haut et collant, et les onglets, barre fixe en bas
  rendu.js          `renderAll()`, l'unique porte du repeint

  — les fenêtres —
  fenFormat.js      format de jeu
  fenParametres.js  sauvegarde locale, synchronisation, apparence, catalogue
  fenNuage.js       la section « Synchronisation » de cette fenêtre
  fenBudget.js      budget du deck et préférences d'achat
  fenDeck.js        la configuration d'un deck : nom, règles, budget, restrictions
  fenFiltres.js     filtres de la collection
  fenAffichage.js   vue, colonnes, groupement et tri d'une liste de cartes
  fenCibles.js      les objectifs par rôle du deck
  fenListes.js      listes déroulantes des archétypes et des éditions
  boiteCatalogue.js progression du chargement de l'archive Scryfall
  fenExport.js      export du deck, liste d'achats, effacement
  fenComportement.js  décrire à la main ce que fait une carte
  fenJournal.js     revoir une partie d'un lot

  — les gestes —
  gestesDecks.js    créer, ouvrir, configurer, dupliquer, supprimer un deck
  gestesAcquisition.js commander, recevoir, annuler une acquisition
  gestesVue.js      fermer, cocher une couleur, changer d'onglet
  gestesReglages.js « Appliquer » des fenêtres de réglage, jauges, pagination
  gestesDeck.js     monter, démonter, garer, ouvrir une fiche
  gestesDonnees.js  sauvegarde, archive, EDHREC, import
  gestesNuage.js    connecter, synchroniser, déconnecter
  gestesGraphe.js   isoler un nœud, allonger une liste, ouvrir une vignette
  gestesSimulation.js  lancer un lot, décrire une carte, revoir une partie

  — la table interactive et sa liaison —
  qrCorps.js        le corps fini du QR code, et Reed–Solomon
  qrMatrice.js      la grille d'un QR : motifs fixes, format, ordre, masques
  qrEcrit.js        écrire un QR code, et son SVG
  qrBinarise.js     d'une image de caméra à du noir et du blanc
  qrReperes.js      trouver un QR dans une image
  qrLit.js          lire un QR repéré : perspective, format, correction
  camera.js         lire un QR avec la caméra
  liaisonCode.js    ce que les deux QR transportent, au plus court
  liaisonSdp.js     lire une description WebRTC, en rebâtir une
  liaison.js        deux navigateurs reliés sans serveur
  tableHote.js      la partie que ce navigateur héberge
  tableImages.js    le visuel d'une carte à la table, cherché par lots
  tableCartes.js    une carte posée sur la table : visuel, force, marqueurs, engagement
  tableJoueurs.js   le cartouche d'un joueur : vie, main, bibliothèque, cimetière
  tableDispositions.js  Arène, Couloirs, Tour de table : trois façons de disposer la table
  tableLoupe.js     voir une carte en grand, d'un appui long
  tablePhases.js    les phases du tour en points, et qui a la priorité
  tableFleches.js   ce qui vise quoi, en flèches : cibles, activations, combat
  tableRendu.js     la table, peinte depuis une vue, région par région
  tableQuestions.js répondre à une question du moteur, à la main
  tableCombat.js    attaquer au doigt ; l'état d'une carte pendant un combat
  tableBloque.js    bloquer en glissant une créature sur son attaquant
  tableFront.js     la ligne de front : la pile et le bouton de tour
  tableLever.js     lever une carte puis la jouer, ou la pousser vers le haut
  tableSons.js      les sons synthétisés et les vibrations de la table
  tableRessenti.js  sons, vibrations et points de vie, lus d'une vue à la suivante
  tableMouvements.js  les cartes qui voyagent d'une zone à l'autre
  tableSalon.js     le salon : qui s'assoit, avec quel deck
  tableLiaison.js   les invités de l'hôte
  tableInvite.js    rejoindre la table d'un autre
  tableReprise.js   reprendre une partie après un rechargement
  fenArrets.js      les arrêts de la table
  gestesTable.js    les gestes de la table interactive

  app.js            l'aiguillage et le démarrage
```

Les dix sections de la page se répartissent en huit onglets, rangés dans une barre fixe au bas de la
fenêtre — l'en-tête, seul en haut, reste collant, et rien d'autre ne se superpose au contenu. Sa
hauteur est une constante CSS (`--h-barre`), dont le bas de la page et le toast tiennent compte.
Sur un téléphone les huit onglets ne tiennent pas : la barre défile latéralement, alignée au début
(`justify-content:center` sur un contenu qui déborde coupe la gauche, hors de portée du défilement) et
`renderOnglets()` ramène l'onglet ouvert au milieu. **Decks** porte la liste des decks, **Wishlist** l'acquisition en cours puis la liste d'achats commune,
**Collection** porte les statistiques puis la collection, **Deck** porte le
deck, **Graphe** porte le graphe des capacités puis les pistes branchées sur les nœuds qu'on y
isole, **EDHREC** porte les statistiques du commandant et les cartes que les decks recensés
recommandent — groupées et triées à part, avec deux tris qui n'existent que là : le taux
d'inclusion et la synergie —, **Catalogue** porte le classement complet, groupé et paginé,
**Simulation** fait jouer le deck contre d'autres decks de l'atelier, menés par des joueurs automatiques (plus bas). La table
`ONGLETS` (`js/etat.js`) est la seule à les répartir ; l'onglet ouvert tient dans `S.onglet` et se
conserve d'une séance à l'autre — un nom qu'un onglet d'hier portait est traduit par
`ONGLETS_ANCIENS`. Les sections sont rendues à chaque fois, celles qu'on ne
regarde pas comprises : une page masquée n'est pas mise en page, et changer d'onglet ne demande
alors aucun rendu. **Trois font exception** — les pistes du graphe, EDHREC, le catalogue : elles
lisent une même notation qui coûte des secondes, et ne se calculent que sous les yeux
(`js/differe.js`, plus bas). L'en-tête garde quatre pastilles — le deck ouvert, la barre de mana et le nom de la
combinaison, le format, le budget — et trois commandes au coin haut-droit : le bouton de l'**affichage**, celui
des **filtres** et l'**engrenage**, qui ouvre en une fenêtre la sauvegarde locale, l'apparence et le
catalogue. Les trois voisinent parce qu'elles règlent la vue, non ce qu'elle montre ; le conteneur
`.head-actions` les ancre, et la réserve qui leur laisse la place est portée par `.top-in` là où les
pastilles partagent leur ligne, par `.brand` sous 640 px où les pastilles passent seules à la ligne.
L'en-tête ne se replie plus : un bouton « Stats » basculait un mode compact qui, sous 640 px,
s'allumait aussi tout seul — deux mécanismes pour une même chose, l'un en JavaScript et figé au
chargement, l'autre en CSS et suivant le redimensionnement. Seul le second demeure, et la mise en
page du téléphone tient désormais dans le bloc `@media (max-width:640px)`.
Les pastilles suivent l'ordre des questions : sur quel deck travaille-t-on — elle précède tout, le
format, les couleurs, le budget et les objectifs étant désormais ceux de ce deck-là —, puis quelles
couleurs, quel format, puis les puces en vigueur et le budget. Le format
venait après ces puces, dont le nombre change : il se déplaçait d'un rendu à l'autre. Chaque puce
porte sa croix ; un bouton « Tout effacer » les suivait, qui doublait le « Réinitialiser » de la
fenêtre des filtres et dont la place variait au gré des puces — on visait la croix d'un filtre, on
effaçait les cinq autres.
Deux pastilles disaient ici ce que la collection retenait et ce que le catalogue contenait ; les
sections le disent déjà, et mieux — la phrase de causes de la collection énumère ce qui écarte chaque
carte, `ligneCatalogue()` compte les candidates avec le motif des écartées. Les retirer épargne à
chaque rendu de l'en-tête un filtrage complet de la collection et un parcours de tout le catalogue,
soit deux fois par repeint, `renderB()` redemandant `renderTop()` après `renderAll()`. La pastille du
format ne porte plus que le format : la taille du deck et sa conformité sont dans l'onglet Deck, qui
les détaille. Les identifiants internes des sections
(`secB`…`secH`, `renderB`…`renderH`) ont gardé leur lettre d'origine, que les rendus connaissent ;
plus aucune lettre n'est affichée, les onglets ayant pris ce rôle.

**Un déclencheur large compte pour un.** Toute carte non-terrain produit « lancement de sort » du
seul fait d'être lançable, toute permanente produit « arrivée en jeu » du seul fait d'arriver
(`analyze()`, `js/analyse.js`) : une carte qui se déclenche « quand vous lancez un sort » se relie
ainsi à chacun des soixante sorts du deck, et affichait soixante interactions pour une seule
propriété. `classeLiens()` (`js/liens.js`) ne nomme pourtant aucun concept — il compte : au-delà du
quart du deck, un même déclencheur ne s'intègre plus à chaque carte mais au deck. Le décompte des
interactions ne retient alors que les liens précis, les cartes que seul un déclencheur large atteint
se disent entre parenthèses — « 2 (+60) » —, et le score ne touche pour elles qu'une prime bornée à
rendement décroissant au lieu d'une interaction par carte. Le critère suit le deck qu'on construit,
sans liste de concepts à tenir à jour.

Encore faut-il que le déclencheur soit lu en entier. Les sous-types venaient d'une liste de
vingt-et-un mots codée dans `qualifieDeclencheur()` (`js/effets.js`) : Magic en compte près de trois
cents, et « whenever you cast a **turtle** spell » n'y trouvait pas son compte — la restriction était
perdue, et la carte se reliait à tous les sorts du deck. Le sous-type se lit désormais à sa **place**,
entre « cast » et « spell » : ce qui n'est ni un type de carte, ni une négation, ni une tournure de
compte est un sous-type, sans liste à tenir. Le lien devient alors strict, car la carte lancée porte
ses sous-types sur sa ligne de type — sa production de lancement est marquée `intrinseque`
(`js/analyse.js`) — tandis qu'une production d'effet, qui ne dit pas ce qui sera lancé, garde son
demi-crédit.

Les trois dernières lisent une **même sélection notée** : la notation ne connaît qu'une liste, et
`selectionSuggestions()` (`js/sugListes.js`) la partitionne une fois — ce qui touche les nœuds
isolés, ce qu'EDHREC recommande, tout le reste. `SECTIONS_SUGGESTIONS` (`js/etat.js`) les nomme ;
`renderSuggestions()` les peint ensemble et sert de point d'entrée aux autres modules, si bien
qu'une donnée qui arrive — d'EDHREC, du catalogue, de Scryfall — met les trois pages à jour d'un
coup. Chacune garde son enveloppe et ne réécrit que ses listes (`poseCorps()`) : le
rafraîchissement est en place par construction, et le lecteur qui parcourait le milieu d'une liste
de trois cents vignettes n'est jamais renvoyé au début.

L'atelier a deux teintes. Le dessin d'origine — le laiton sur fond d'encre — est conservé entier et
devient le **mode sombre**, que coche la section « Apparence » de la fenêtre des paramètres ; le
thème de départ est un papier clair. Tout tient dans l'attribut `data-theme` de la racine : la
feuille de style porte deux palettes aux mêmes noms, et le navigateur recalcule les couleurs sans
qu'aucun rendu soit refait (`js/theme.js`). D'où une règle qui vaut partout : **aucune couleur n'est
écrite en dur**, ni dans une règle CSS, ni dans un style en ligne du JavaScript — elle resterait
sombre sur fond clair. Les variables disent le rôle et jamais la teinte : `--sur-brass` est l'encre
qu'on pose sur du laiton, `--vide-img` le fond d'un visuel qui manque, `--voile` le verre dépoli
d'une étiquette posée sur une image, `--W-txt` la couleur du mana blanc quand elle sert d'encre et
non de pastille. Le graphe est le seul endroit où la couleur passe par un attribut SVG : ceux-ci
n'acceptent pas `var()`, elle y est donc posée en style en ligne (`js/graphe.js`). La préférence vit
dans `S.sombre` comme le reste de l'état, mais s'écrit aussi dans une clé à elle
(`mtg-atelier-theme`) : quatre lignes en tête de `index.html` la lisent pour peindre la page avant
que les modules ne soient chargés — ouvrir là toute la sauvegarde pour une seule valeur coûterait ce
qu'on cherche à éviter, et sans elles un atelier réglé en sombre clignerait en clair à chaque
visite. Tant que rien n'a été choisi, `S.sombre` vaut `null` et l'atelier suit la préférence du
système.

## Plusieurs decks, un seul atelier

Un deck est un **dossier** : son nom, son avancement, ses trois listes, son commandant, son format,
son budget, ses restrictions et ses objectifs par rôle. `S.decks` les tient tous, `S.deckActif` dit
lequel est ouvert, et la collection reste commune — c'est l'inventaire physique, elle n'appartient à
personne.

Les champs que l'atelier lisait dans `S` — `S.deck`, `S.commander`, `S.format`, `S.budget`,
`S.ciblesRoles`, `S.secondairesOff` et les deux annexes — sont lus ou écrits dans cent cinquante
endroits. Aucun n'a été repris : ils ont quitté le littéral de `js/etat.js` et sont devenus des
**propriétés d'accès** posées sur `S` par `js/decks.js`, qui lisent et écrivent dans le dossier
ouvert. `S.deck` reste `S.deck` partout, et ce fichier est le seul à savoir qu'il y en a plusieurs.
Le recopiage — ranger le dossier dans `S` à chaque bascule — aurait laissé exister des instants où
le rangé et l'affiché divergent, et un oubli de rangement avant une sauvegarde aurait perdu un
commandant en silence ; une vue, elle, ne se désynchronise pas. Le lecteur rend la **référence**
rangée et jamais une copie, sans quoi `S.deck.set(...)` écrirait dans un double.

Ce qui reste global est ce qui relève de la **vue** ou de l'appareil : les filtres de l'en-tête, les
vues, colonnes, groupements et tris, l'onglet, les plis, le thème, le catalogue. `S.ciblesRoles`, en
revanche, est descendu dans le dossier tout en gardant son indexation par format à l'intérieur : le
format est désormais une propriété du deck, et deux decks du même format n'ont pas les mêmes
objectifs. `ciblesReglees()` (`js/legalite.js`) n'a pas changé d'une lettre.

**Le budget se scinde selon sa nature.** Le plafond et le prix maximum par carte sont une intention
propre au deck et vivent dans son dossier (`S.budget`) ; l'état, la langue, le type de vendeur et le
pays disent *comment* on achète, valent pour tous les decks, et vivent dans `S.achats`. La même
fenêtre règle les deux, sous deux titres.

**Un deck est à soi, ou externe** (`d.externe`, `js/decks.js`). Un deck de tournoi, celui d'un ami, une liste
trouvée en ligne : on veut l'étudier, y ajouter des cartes, le jouer, sans que ce soit un deck qu'on construit.
La page « Decks » le range dans sa propre section, « Decks externes » (`renderM()`, `js/decksSection.js`), et
chaque vignette porte la bascule — « Marquer externe » / « C'est le mien » —, que la fenêtre de configuration
répète en case à cocher. C'est un **drapeau du dossier**, pas un type : un deck externe s'ouvre, se complète,
s'exporte, se duplique et se configure exactement comme un autre ; il voyage avec la synchronisation
(`DECK_CHAMPS_SIMPLES`, `js/nuageFusion.js`) et se range avec lui. **Une seule chose change : la liste
d'achats.** Un deck externe ne demande rien (`demandesTousDecks()`, `js/achats.js`) — on ne l'a pas monté, on ne
compte pas l'acheter —, son budget n'entre pas dans les plafonds, et sa vignette dit combien de ses cartes sont
hors de la collection, non combien il y a à acheter. Le basculer d'un côté à l'autre rend ou retire sa demande à
la liste, sans autre geste.

**N'importe quel deck à n'importe quel siège** (`js/simSources.js`). Les sièges de la simulation se remplissent
d'un deck de l'atelier, le sien comme un externe, par une source `d:<clé>`. Le deck testé reste un deck, du tout
premier au dernier. Au salon de jeu, l'hôte s'assoit lui aussi avec n'importe quel deck (`sourceDeMoi()`,
`js/tableSalon.js`), de même que chaque siège automatique ; l'invité, dont le deck part chez l'hôte, choisit parmi
les decks de l'atelier. Il n'y a plus de bibliothèque d'adversaires à part : voir « Le mode de jeu ».

**Une restriction est un filtre que le deck porte lui-même.** Elle a la forme de `FILTRES_VIDE`,
plus les couleurs — qu'elle peut déduire du commandant, ce qui évite de reposer la barre de mana à
chaque fois qu'on revient sur un deck. Elle porte partout où porte un filtre : `carteRetenue()`
(`js/retenue.js`) l'applique à la collection et au vivier, `restrictionOKRec()` au catalogue brut.
Partout **sauf sur la liste du deck lui-même**, qui s'en tient à `carteFiltree()` — une restriction
« coût ≤ 3 » masquerait sinon le commandant qu'elle est censée servir ; les cartes fautives sont
signalées par `legality()`, comme l'est déjà une carte illégale. Ses puces paraissent dans l'en-tête
avec un cadenas au lieu d'une croix, et cette différence est **structurelle** : `filtresActifs()`
rend les clés à effacer, `restrictionsActives()` n'en rend aucune. Un seul paramètre l'a rendue
possible sans rien réécrire — `filtresValeursOK(v, crit)`, dont le second argument vaut `S.filtres`
par défaut.

**La liste d'achats additionne ce que réclament tous les decks.** Un deck marqué « exemplaires
propres » exige ses copies : sa demande s'ajoute. Ceux qui ne le sont pas se partagent la collection
— ils ne sont jamais montés en même temps — et il suffit de satisfaire le plus gourmand d'entre eux.
Ce que l'on possède se retranche du total, et chaque ligne dit quels decks réclament la carte, ce qui
rend la règle lisible sans l'expliquer. `spent()` appelle `aAcheter()`, donc une estimation d'offre
par carte manquante, et l'en-tête le fait à chaque rendu : sur huit decks, la liste referait ce
travail autant de fois, d'où le mémo `ACHATS` sous `signatureAchats()`. Seule la section `secJ` la
demande, si bien que l'en-tête ne paie rien de plus qu'avant.

## Le mode de jeu

L'onglet **Simulation** fait jouer le deck ouvert — ou n'importe lequel de « Mes decks » — par un
joueur automatique, contre un à cinq decks menés par des joueurs automatiques, des centaines de fois, et en tire de
quoi classer sa force. Chaque siège garde le format de son deck : un deck Commander joue à 40 points
de vie avec sa zone de commandement, sa taxe et ses dégâts de commandant, un deck de soixante à 20.
Chaque siège est un **deck de l'atelier** — le sien comme un deck externe, sans distinction
(`js/simSources.js`) : il n'y a plus de bibliothèque d'adversaires à part, un deck qu'on veut affronter
se range dans « Decks externes ». Les cartes de ces decks n'ont pas à être possédées : `ficheParNom()`
(`js/simCartes.js`) les cherche dans l'atelier, puis dans l'archive indexée par nom, puis chez
Scryfall, et garde ce qui vient de là dans IndexedDB (`sim-cartes`) — **jamais dans `DB`**, que la
sauvegarde locale emporterait.

**D'où viennent les anciens adversaires.** Une sauvegarde d'hier porte une bibliothèque d'adversaires
(`adversaires`) : à la lecture, `migreAdversaires()` (`js/decksStockage.js`) en fait des **decks externes**
sous la même clé, si bien que les sièges et les lots d'hier qui les nommaient les retrouvent. Un
adversaire dont le nom est déjà celui d'un deck n'est pas recréé — le deck existant prend sa place aux
sièges —, et ses cartes que l'atelier ne connaît pas entrent comme à l'import, « inconnues », à compléter.
**Le lien Moxfield ou Archidekt et son relais ont disparu avec la bibliothèque** (lecture automatique
quotidienne, adaptateurs de sites, relais Cloudflare) : un deck externe s'importe par collage, comme
tous les autres, et ne se relit pas seul. Les lots joués contre un ancien adversaire sont donnés pour
périmés — la signature d'un deck n'est pas celle d'une liste d'adversaire —, leurs chiffres restent lisibles.

**La table interactive.** « Jouer une partie » ouvre un salon en plein écran : son deck, puis
des sièges automatiques ou des **invités**, qui jouent chacun sur leur appareil — téléphone ou
ordinateur — avec un deck de **leur** atelier. Le navigateur de l'hôte fait tourner le moteur ;
pour le pilote, tous les sièges sont humains, et `boucleTable()` (`js/tableHote.js`) aiguille
chaque question : l'automate répond, une priorité qu'aucun arrêt n'appelle est passée
(`doitDemander()`, `js/jeuArrets.js`, à la façon d'Arena), le reste va à l'interface du siège, ici
ou chez l'invité. Une réponse humaine est jugée avant d'aller au moteur (`reponseRecevable()`) et
reposée avec sa raison ; une courte pause suit chaque geste visible d'un automate, sans quoi la
partie se jouerait sans qu'on la voie. Un joueur ne reçoit qu'une **vue** (`vue()`,
`js/jeuVue.js`) : rien d'un objet caché d'autrui, pas même son identifiant — ceux d'une
bibliothèque suivent l'ordre de la liste. La table se peint depuis cette vue (`renduTable()`) :
exception assumée à « `renderAll()` unique porte », puisqu'elle se repeint à chaque message de la
partie. Elle ne réécrit donc que les **régions** qui ont changé (`peinsRegions()`) : une charpente
fixe porte les boutons qui ne changent jamais, et une région repeinte garde la position de ses
rangées qui défilent — un toucher pendant qu'un automate joue n'est plus perdu, la rangée qu'on
parcourait n'est plus renvoyée au début. Les cartes s'y montrent par leur **visuel**, cherché à
l'atelier, à l'archive, puis chez Scryfall par lots de soixante-quinze noms (`js/tableImages.js`) ;
sous lui, un cadre de texte aux couleurs du coût reste lisible sans réseau. Par-dessus, la force du
moment, les blessures, les marqueurs, l'engagement (la carte se couche) et le combat. Un **appui
long** ouvre la carte en grand, avec ce qu'on peut en faire (`js/tableLoupe.js`) ; le clic qui le
termine est avalé. Trois **dispositions** se choisissent au menu de la table, retenues dans
`S.table.disposition` : l'Arène, un adversaire à la fois en cartes entières, qu'on fait défiler
d'un glissé ; les Couloirs, un par joueur, chacun défilant seul ; le Tour de table, les adversaires
en cartouches qu'on déplie.

**Le bouton de tour** (`js/tableFront.js`, `js/tableLever.js`). On décidait au pied de l'écran, dans
un bandeau sous sa main, loin des cartes. Une **ligne de front** court maintenant entre les
adversaires et son propre champ : l'étape à gauche, en points, la pile au centre, et à droite, sous
le pouce, un bouton rond dont le libellé dit ce qui va se passer — « Combat », « Laisser résoudre »,
« Attaquer (2) », « Bloquer (1) », « Fin du tour » —, une phrase dessous le précisant
(`actionTour()`). Des puces au-dessus portent le reste : « Toutes », « Aucune », l'adversaire visé,
les blocages à défaire, « Jusqu'à mon tour », et ce qu'aucune carte visible ne porte (un flashback
depuis le cimetière). Le bandeau des questions ne garde que les questions qui ne tiennent pas dans un
bouton : une cible prise dans une liste, X, les modes, oui ou non, le mulligan, et le mana qu'on
engage à la main. Un toucher sur une carte qui n'a qu'une façon de se jouer la **lève** au lieu de la
jouer (`TABLE.leve`, valable pour la seule question où elle a été levée) : le bouton dit alors
« Lancer », « Jouer », « Activer », et un second toucher ou le bouton la joue — on ne lance plus rien
en parcourant sa main du doigt. Pousser une carte de la main vers le haut la joue d'un geste ; la
main ne défile qu'à l'horizontale (`touch-action: pan-x`), le glissé vertical est au geste. Engager
une source de mana reste immédiat. Pendant la pause de résolution, un **anneau** se remplit sur le
bouton le temps qu'elle dure (`TABLE.pause`) : le toucher la coupe, comme « Continuer ».

**Bloquer se fait au glissé** (`js/tableBloque.js`) : on prend une de ses créatures, on la dépose
sur l'attaquant qu'elle bloque. Souris et doigt passent par les mêmes évènements de pointeur, écoutés
à côté de ceux de `js/tableLever.js` — qui, lui, ne démarre que sur une carte de la main : celui-ci ne
démarre que sur une créature du champ, pendant la question des bloqueurs. Pendant le glissé, la table
n'est **pas repeinte** — une carte ôtée du DOM sous un doigt qui la tient perd ses évènements —, seules
des classes changent (les attaquants légaux brillent, `bloc-cible`) et une copie suit le pointeur. Les
créatures qui peuvent bloquer ont `touch-action:none` le temps de la question : sans cela le
navigateur prendrait le geste pour le défilement de leur rangée. Déposée sur un attaquant qu'elle ne
peut pas bloquer, la créature le dit dans la phrase de la ligne de front. Le toucher simple ne sert
plus qu'à lire la carte ; sa loupe propose « Bloquer X » pour qui ne glisse pas, ou dont l'attaquant
est sur une autre page de l'Arène.

**Des cartes qui voyagent, une table qu'on entend** (`js/tableMouvements.js`, `js/tableRessenti.js`,
`js/tableSons.js`). `renduTable()` mesure les cartes avant `peinsRegions()` et les fait partir de leur
ancienne place après (le principe « FLIP ») : une carte ne porte donc jamais de `transform` en propre,
l'éventail de la main et l'engagement tournent son corps. Le moteur donnant un identifiant neuf à
chaque changement de zone, la carte qui quitte la main et celle qui arrive sur la pile s'apparient
par leur nom dans un même repeint ; ce qui vient d'une main cachée part du cartouche de son joueur,
ce qui s'en va rejoint le cimetière ou l'exil où la vue le retrouve. Les sons, les vibrations et les
points de vie qui jaillissent se lisent dans la différence entre la vue peinte et la nouvelle
(`ressens()`) : l'invité les a comme l'hôte, sans que rien d'autre ne voyage. Les sons sont
synthétisés par Web Audio, sans fichier ; les vibrations passent par `navigator.vibrate`, qu'Android
honore et qu'un iPhone ignore. Trois réglages au menu de la table, propres à l'appareil : son (coupé au
départ), vibrations, mouvements (`S.table.son`, `.vibre`, `.mouvements`) ; « mouvements réduits » du
système coupe les trajets.

**Savoir de quoi on parle** (`js/jeuPileExplique.js`, `js/tableDispositions.js`, `js/tableQuestions.js`). La pile
se lisait par ses tuiles — qui a lancé quoi —, sans dire ce que chaque élément *fait*, et « Le faire ? » ne disait
pas ce qu'on s'apprêtait à faire. `descriptionPile()` décrit un élément de pile à un humain : son genre (sort,
capacité déclenchée, activée, copie), son texte, son contrôleur, ses cibles, X et le kicker ; la vue l'emporte,
chez l'invité comme chez l'hôte. La table l'écrit sous la ligne de front (`pileExpliqueHTML()`) : ce qui se résout en ce
moment, puis ce qui attend, **du sommet — le premier à se résoudre — au fond**, et la priorité nomme ce à quoi on
répond (« en réponse à *Geode Rager* — passez : il se résout »). L'élément qu'on résout n'est plus sur la pile :
`resoudre()` le retire avant de le dérouler, si bien qu'on le garde le temps de sa résolution (`RESOLVANTS`, hors
de `P` pour que la copie d'une partie par l'IA ne l'emporte pas) et que **toute question posée pendant qu'il se
résout dit de quoi il s'agit** : « Se résout *Geode Rager* (capacité déclenchée, la vôtre) — Landfall : goad each
creature target player controls », puis « *Geode Rager* — Le faire ? ».
Une question vague (`Le faire ?`, `Défausser ?`) est précédée du nom de sa carte (`sourceNom`).

**Le bandeau des questions est au milieu de la table** (région `question`, `charpentePartie()`), entre les adversaires
et la ligne de front, plutôt qu'au pied de l'écran : c'est là que l'œil est, et la question ne se confond plus avec la
main. Il est borné à 40 % de la hauteur et défile au-delà ; sur un écran bas (moins de 700 px) la carte de contexte
rapetisse. Le plateau des adversaires, seul élément qui s'étire, cède la place qu'il faut : sous 650 px de haut,
une question haute le réduit presque à rien.

**La carte sous les yeux, pour toute question de choix** (`contexteQuestion()`, `js/jeuPileExplique.js`). Ce contexte
n'existait qu'en texte, et seulement pendant une résolution : une cible à prendre pour un sort qu'on lance, un coût à
choisir, les cibles d'un déclencheur qu'on met en pile, tout cela se demandait sans rien dire — la carte avait
déjà disparu de la pile, et un joueur inattentif répondait à une question qu'il ne connaissait pas. Le moteur
note maintenant **qui agit** avant que ce soit sur la pile (`AGISSANTS`, comme `RESOLVANTS` hors de `P` ; rendu
à l'état d'avant à la sortie, pour qu'un sort lancé en réponse n'efface pas celui qu'on lançait) : `lanceSort()`,
`activeCapacite()`, `equipe()` et `prepareDeclencheur()` sont enveloppés par `enAgissant()`. `questionPourUI()` joint à
chaque question de choix (hors priorité, combat, mulligan) un `contexte` : le sort ou la capacité qu'on résout, qu'on
lance ou qu'on active, à défaut la carte que la question nomme (`source`), avec sa fiche. La table
(`contexteQuestionHTML()`) la montre **en image**, avec son texte, au-dessus de la question — l'image reste là même si
la carte a quitté le champ, et un toucher l'ouvre en grand (la loupe, identifiant `ID_CONTEXTE`, qui n'est celui
d'aucun objet de la partie). La **pause de
résolution** — l'objet reste visible, « résolution : X » dans la barre du haut — dure maintenant le temps de
lire : une base, plus neuf millisecondes par caractère du texte, jusqu'à deux secondes de plus ; le bouton de
tour, qui dit alors « Continuer », la coupe (`attendreOuSuite()`, hôte seulement). Les textes sont ceux des cartes, en anglais.

**Une partie qu'on peut suivre.** Les automates jouent au **rythme** de la table (`pauseApres()`,
`js/tableHote.js`) : une longue pause après chacun de leurs gestes visibles, une courte à chaque
étape, rien après une priorité passée — à trois vitesses, réglées au menu (`S.table.vitesse`). Mais
quand personne ne peut répondre, le moteur passait la priorité de lui-même et le sort se résolvait
dans le souffle où il était lancé : la pile n'était jamais vue. À la table seulement
(`cfg.montre`), le moteur pose donc une question « voir » avant chaque résolution ; l'hôte y répond
seul, après le temps de la lire (`montrePile()`). Les lots ne la posent jamais, et les copies d'une
IA qui essaie ses coups non plus ; une partie rangée avant elle se rejoue sans. La ligne de front montre
les **phases** du tour en points, de l'entretien à la fin, et écrit en entier l'étape en cours —
« Déclaration des attaquants », « Attribution des blessures » (`js/tablePhases.js`). La vue de la table dit qui a la
**priorité** (`vueTable()`). Des **flèches** relient chaque objet de la pile à ses cibles, la
carte qui s'active à sa capacité, l'attaquant au joueur qu'il attaque, le bloqueur à l'attaquant
(`js/tableFleches.js`) ; pour les tracer, la vue de la pile porte ses cibles et sa source, réduites
à ce qui est public (`refPublique()`). La partie hébergée est rangée à chaque réponse dans IndexedDB (`table-partie`) : le moteur
étant déterministe, la graine, les fiches et les réponses suffisent à la **rejouer à l'identique**
après un rechargement.

**Payer son mana soi-même** (`js/jeuManaManuel.js`). Par défaut le solveur de `js/jeuMana.js` paie à la
place du joueur, et choisit les terrains qu'il engage. Un siège humain peut passer au **paiement
manuel** (`J.manuel`) : `planPaiement()` ne lui laisse plus que la réserve, chaque source devient une
action de priorité `{k: 'mana', id, option}` — une par couleur qu'elle sait produire —, et un sort ne
se propose que lorsque le mana engagé le paie. La bascule est elle-même une action (`{k: 'reglage'}`),
donc une réponse comme une autre : rangée avec les autres, elle laisse la partie rejouable à
l'identique, ce qu'un réglage posé hors du moteur casserait. Le menu de la table (`S.table.paiementManuel`)
dit comment *commence* le siège de l'hôte ; un invité commence à l'automatique et bascule depuis le
menu de sa table, ou depuis le bandeau de son mana quand il paie déjà à la main. Un siège confié à l'automate revient d'abord à l'automatique (`reponseAutomate()`) : l'automate
n'engage aucune source. Les capacités de mana qui coûtent elles-mêmes du mana (Selvala, Signets,
terrains-filtres, Cabal Coffers) sont des actions `{k: 'manaFiltre'}` : le coût se paie **sur la
réserve** — on engage d'abord une source pour lui, le solveur n'étant plus là —, puis le permanent
s'engage et verse son mana. Elles n'existent qu'à ce mode : au paiement automatique, le solveur s'en
sert tout seul quand un sort le demande. Une capacité « n'importe quelle combinaison de couleurs » se
joue d'une seule couleur à la fois (« vert ×2 »), comme dans le solveur. Limites assumées : le mana
restreint (« spend only on creature spells ») et les sources qui demandent un sacrifice ou un coût de
plus ne s'engagent pas à la main. Les effets qui ajoutent du mana (« Add {R} or {G} ») demandent la couleur au joueur
(`choisitManaOption()`), au lieu de prendre la première ; un automate garde son choix d'avant.

**Sans aucun serveur.** L'utilisateur a voulu une liaison WebRTC sans tiers : ni signalisation, ni
STUN, ni TURN (`js/liaison.js`). Les deux descriptions passent donc **par la lumière** : l'hôte
montre un QR — une adresse `#rejoindre=…` que l'appareil photo ouvre, ou que l'invité lit dans son
atelier par « Rejoindre une table », seul chemin quand son atelier n'est pas à la même adresse que
celui de l'hôte —, l'invité montre le QR de sa réponse, et **la caméra de l'hôte le lit** ; sans
caméra, l'hôte tape un code contrôlé groupe par groupe. Chaque description est réduite à ses
champs utiles (`js/liaisonCode.js`, 68 octets : ufrag et mot de passe ICE à six bits par
caractère, empreinte du certificat, un candidat), et la description distante est rebâtie d'un
gabarit (`js/liaisonSdp.js`) ; on ne retouche jamais une description locale, ce que Chrome
abandonne et que Firefox refuse. La caméra de l'hôte est ouverte avant de créer les offres : tant
qu'elle tourne, le navigateur dévoile les vraies adresses locales au lieu de noms mDNS. Le
QR code est écrit et lu à la main (`js/qr*.js`) : le détecteur du navigateur n'existe ni sous
Windows ni sous Linux, ni dans Firefox ni dans Safari. Il est peint noir sur blanc **forcé** —
seule exception à la règle des couleurs : un QR clair sur sombre ne se lit pas. Les écouteurs posés
sur la connexion et le canal sont l'autre exception, à la règle de l'aiguillage unique : ce ne sont
pas des éléments de la page.

Ce que cela impose, et que la page dit : **même réseau local** (un Wi-Fi « invités » qui isole ses
clients, Brave ou une extension anti-fuite WebRTC empêchent la liaison) ; **une caméra chez
l'hôte**, ou le code à taper ; un téléphone qui se met en veille perd la liaison — l'écran est tenu
allumé, et un « QR de reprise » rend sa place à l'invité, sinon son siège est confié à l'automate ;
l'hôte voit tout s'il ouvre ses outils de développement. Le paiement du mana reste automatique.

**Trois couches, dont deux pures.** Le compilateur d'oracle et le moteur n'ont ni DOM, ni `DB`, ni
`Math.random`, ni `Date` : `index.html` les encadre de `<!-- moteur -->` et `<!-- /moteur -->`, et
ils se chargent tels quels dans un `vm` de Node pour les tests. Le moteur ne lit jamais une carte de
l'atelier mais une **fiche** — nom, coût, type, texte, force, loyauté, mots-clés, faces —, que la
couche de simulation fabrique.

**Le compilateur d'oracle.** `analyze()` dit qu'une carte inflige des dégâts, pas combien ni à
qui : elle sert le graphe, elle ne se joue pas. Les `oracle*.js` lisent le texte réduit (`~` pour la
carte, rappel retiré) ligne par ligne, rangent chacune — mots-clés, activée, loyauté, déclenchée,
statique, façon d'entrer, effet de sort —, et confrontent chaque proposition à des motifs **ancrés
sur la proposition entière** qui rendent une opération exécutable ou rien : jamais une demi-lecture
silencieuse. Une seule grammaire désigne les objets (`lisDescripteur()`), un seul prédicat les juge
(`correspond()`). Chaque motif porte un exemple : il sert de test, et de liste des formules admises.

**La couverture.** Chaque carte est complète, partielle — jouée pour ce qui est compris — ou
**injouable** : quand une part ignorée ressemble à une contrepartie (« you lose », « sacrifice »,
« unless », « can't »…), l'IA ne la lance jamais. Ne pas comprendre une carte ne doit **jamais**
rendre un deck plus fort qu'il n'est. La section affiche le taux de chaque deck de la table, et
chaque résultat porte un badge de fiabilité. Un bloc distinct (`js/simCollection.js`) donne la part
de la **collection** entièrement couverte — en cartes différentes, terrains écartés comme pour un deck — et déplie
les listes des partielles et des injouables. Compiler tout une collection prend de l'ordre de la seconde :
le calcul se fait par tranches de 15 ms sous une signature, et n'avance que sous les yeux ; le texte
d'attente se met à jour en place, car repeindre la section à chaque tranche emporterait la saisie en cours. Une carte se décrit à la main dans la fenêtre des
comportements (`S.comportements`), **avec le même compilateur** : on la réécrit en formules qu'il
comprend, il dit ligne par ligne ce qu'il en lit, et deux directives s'y ajoutent — `#vanille`,
`#injouable`. Aucune syntaxe à apprendre, aucun second interprète à tenir.

**Le moteur est écrit en générateurs.** Chaque décision — priorité, mulligan, cibles, modes, X,
attaquants, bloqueurs, défausse — est une question rendue par `yield` ; le pilote (`avance()`) la
porte à l'agent du joueur. Un joueur automatique répond sur-le-champ ; un humain, au lot 2,
laissera la question en attente, et rien dans le moteur ne changera. Le pilote rend aussi la main
quand son budget de temps est épuisé : un lot se découpe au milieu d'une partie sans rien
sérialiser. Les règles suivies sont les actuelles : priorité APNAP, pile LIFO, cibles revérifiées à
la résolution, déclencheurs posés en APNAP, actions d'état en boucle, dégâts de combat sans ordre
d'assignation (Foundations), mulligan de Londres gratuit le premier à trois joueurs et plus. La
**carte** (`cid`, stable, pour les statistiques) se distingue de l'**objet** (`id`, neuf à chaque
changement de zone) : une aura tombe, un sort perd sa cible, sans code à part ; « when ~ dies » et
« equal to its power » lisent l'instantané pris au départ.

**Le hasard est semé.** Même graine, mêmes decks, même moteur : même partie. Une partie d'un lot
n'est pas gardée — elle se **revoit en la rejouant**, journal ouvert, tant que rien n'a changé
(`lotPerime()`). Et la graine de la partie g ne dépend que de celle du lot : deux decks testés sur
la même table affrontent les mêmes mélanges, ce qui resserre leurs comparaisons.

**Les lots se jouent dans la page.** Un Worker ne se lance pas depuis `file://`. Le lot avance par
tranches de vingt-cinq millisecondes, et rend la main par un `MessageChannel` plutôt que par
`setTimeout`, qu'un onglet en arrière-plan ralentit à une fois par seconde. Les places tournent
d'une partie à l'autre, si bien que chaque deck commence autant de fois. `renderK()` passe à chaque
`renderAll()` mais ne calcule rien hors de sa page : la couverture se compile sous les yeux, gardée
sous une signature (`COUV_TABLE`).

**Ce qu'on en tire** (`js/simStats.js`) : le taux de victoire et son intervalle de Wilson à 95 %,
l'**indice de force** — ce taux rapporté à l'attendu d'une table de N, 1,0 étant le niveau de la
table —, les victoires par deck et par place, la durée, les causes de défaite, les mulligans, le
manque de mana, le mana dépensé sur le disponible, le tour du commandant, et par carte les deux
mesures de 17lands : le taux de victoire quand elle est en main, et ce qu'elle rapporte quand on la
pioche. Le résumé de chaque lot va dans IndexedDB (`sim-resultats`), qu'`idbVider()` épargne ;
le classement compare les decks sur une même table.

**Ce que le lot 1 ne fait pas**, et que la couverture ne peut pas toujours dire : pas de système de
couches complet (les bonus s'additionnent), ni copie, ni changement de contrôle, ni remplacement ou
prévention généraux (la régénération exceptée) ; parmi les coûts alternatifs et additionnels, ceux
des lots F3 et F4 seulement — flashback, kicker, rachat, évocation, présage, convocation,
exploration, affinité, écho, cycle, folie, suspension, exhumation ; ni mutation, ni fusion (meld), ni cartes retournées (flip) ; ni tours ou combats supplémentaires, ni monarque, ni initiative ;
capacités de mana qui coûtent du mana absentes du paiement automatique ; pas d'alliance en
multijoueur. Les joueurs automatiques comparent des valeurs sans chercher dans l'arbre des coups :
ils avantagent les decks qui jouent leurs menaces et sous-jouent combo, contrôle et politique. Le
classement dit donc la force d'un deck **joué par cette IA contre cette table**. La table interactive
— jouer soi-même contre les joueurs automatiques — est le lot 2.

**Des joueurs automatiques qui jugent un deck** (lots IA1 à IA5). Le classement mesure la force
d'un deck, pas l'art de le piloter : entre joueurs automatiques, l'IA **sait tout en cours de
partie** — mains, faces cachées, ordre des bibliothèques. Seul le mulligan reste honnête : l'IA
connaît sa main et le contenu de sa bibliothèque, pas son ordre, et tire trente ordres pour juger sa
main (`js/iaMulligan.js`). À la table interactive, face à un humain, elle ne lit que ce que son
joueur voit. Le niveau de jeu se choisit à chaque lot ; deux niveaux ne se mêlent jamais dans un
classement (`cleTable()`), et la version de l'IA (`IA_V`) entre dans celle du moteur : un lot joué
par une autre IA est périmé. Chaque changement d'IA se juge au **banc de force** : la nouvelle contre
l'ancienne, chargée dans sa propre portée dans le même moteur, sur des parties appariées (même
donne, IA échangées), avec l'intervalle de Wilson. L'IA contre elle-même y donne 50 % à deux
joueurs et 25 % à quatre, ce qui valide le banc. Le mulligan par tirages fait jeu égal avec
l'ancienne règle (deux à cinq terrains) : il est gardé parce qu'il suit la règle d'information et
s'adapte à la courbe, aux couleurs et au commandant, pas pour un gain mesuré.

**Le combat calculé** (IA2, `js/iaCombatCalcul.js`). Un petit jeu à deux : l'attaquant choisit un
ensemble d'attaquants, le défenseur répond par ses blocages, l'issue se note avec la note commune
(`evalue()`, qui accepte un écart imaginé — morts, vies — sans toucher à la partie). L'attaquant
garde l'ensemble dont la pire réponse est la meilleure ; une réponse qui rend l'attaque pire que la
meilleure déjà trouvée l'abandonne aussitôt (alpha-bêta). Le modèle lit force, endurance, blessures,
initiative et double initiative, contact mortel, piétinement, lien de vie, indestructible,
infection, menace et les restrictions de blocage du moteur ; l'attaquant compte aussi la riposte du
tour suivant contre les créatures qu'il laisse dégagées. Au-delà de sept attaquants ou de quatre mille
positions, les règles de `js/iaCombat.js` reprennent la main ; face à une nuée de jetons, chaque
bloqueur ne considère que les attaquants les plus dangereux, pour que la recherche tienne. En
multijoueur, seuls les deux défenseurs que la règle préfère sont calculés. Ce niveau ne lit que le
champ : c'est aussi l'IA de la table interactive. Au banc, contre l'IA d'IA1 : 56 % à deux joueurs
(intervalle 51–61), 43 à 46 % à quatre pour 25 % à égalité ; 1,1 à 1,2 fois plus lent à deux, 1,5 fois
à quatre, 2 fois sur une table Commander à jetons (Krenko) — le calcul y coûte la moitié, des
parties plus longues l'autre : on bloque mieux. Les poids, essayés au banc (riposte, horloge, plateau), changent peu : leurs écarts restent
dans le bruit.

**Copier une partie, et la reprendre** (IA3, `js/jeuCopie.js`). Le moteur avance par générateurs, qui
ne se copient pas ; mais l'état `P` n'est fait que de données. `copiePartie()` le copie en
profondeur, références partagées comprises, et **partage tout ce qui appartient à une définition** —
capacités, effets compilés, descripteurs : une définition ne change jamais en place, et une capacité
qu'une liste de l'état désigne (épuisée, par exemple) reste la même. Une copie coûte 1,6 ms. Puis
`reprise()` relance le moteur depuis l'un de trois points où il ne garde rien en propre : la priorité
du joueur actif en phase principale, pile vide ; la déclaration des attaquants ; celle des bloqueurs
du premier défenseur. Elle enchaîne la suite du tour (`suiteDuTour()`) et les tours suivants
(`suiteDesTours()`), extraites de `tour()` et de `partie()` pour n'être écrites qu'une fois.
`essaieCoup()` copie, reprend, vérifie que la question reposée est **la même**, répond, et laisse
jouer jusqu'à un horizon. Deux propriétés sont vérifiées par le banc : une partie copiée puis
reprise avec les mêmes réponses finit à l'identique ; une partie dont l'IA essaie des coups sur des
copies finit comme si elle n'en avait essayé aucun — rien ne fuit d'une copie vers la partie.

**Essayer ses coups avant de les jouer** (IA4 et IA5, `js/iaRecherche.js`). Aux points de reprise, le
joueur automatique des niveaux moyen et fort prend quelques candidats — la réponse rapide d'abord,
puis les meilleures actions de `notesPriorite()` et « passer », ou les plans d'attaque et de blocage
calculés, par les règles, aucun, tous —, essaie chacun avec `essaieCoup()`, laisse tout le monde jouer
au niveau rapide jusqu'à un horizon, et garde le mieux noté ; la réponse rapide l'emporte à égalité.
Au niveau **moyen**, l'horizon est le retour de la pile vide (un sort, une capacité) ou la fin du
combat — les blocages adverses et les tours de magie y sont vus, ce que le combat calculé ignore. La
copie est la vraie partie, ordre des bibliothèques compris : un seul essai suffit par coup, et une
partie se rejoue à l'identique. Les cibles, les modes et X restent au niveau rapide. Le niveau se
choisit dans la table de l'onglet Simulation (`S.simulation.niveauIA`). Au banc, contre le niveau
rapide : 57,6 % à deux joueurs sur 900 parties (intervalle 54,3–60,7), mais à quatre seulement
27,7 % pour 25 % à égalité, un gain que 560 parties ne distinguent pas du bruit ; environ trois fois
plus lent.
Au niveau **fort** (IA5), chaque coup est suivi jusqu'à la fin du prochain tour du joueur qui
décide, avec deux candidats de plus en phase principale. L'horizon retient ce qu'il a vu (« le tour
suivant a commencé ») : il est créé neuf pour chaque essai — partagé entre les essais d'une même
décision, il arrêtait les suivants presque aussitôt, et le niveau fort ne valait pas mieux que le
moyen. Au banc, contre le niveau moyen : 61 % à deux joueurs sur 240 parties (intervalle 55–67),
60 % entre Rouge et Vert, 33 % à quatre sur 120 parties pour 25 % à égalité (intervalle 25–42) ;
contre le niveau rapide, 68 % à deux joueurs (61–74). Noter à mi-chemin et à la fin, à parts égales,
ne fait pas mieux que noter à la fin seulement. Une partie au niveau fort coûte environ 8 fois une
partie rapide à deux joueurs, 15 à 20 fois à quatre.

## Le modèle Forge

Le compilateur d'oracle devine les effets dans l'anglais, et plafonne vite. **Forge** — un moteur
Java libre, sous GPL-3.0 — a écrit chacune de ses trente-quatre mille cartes dans un langage
structuré : un fichier par carte, une ligne par capacité, `A:SP$ DealDamage | ValidTgts$ Any |
NumDmg$ 3`. L'atelier s'en sert, sans rien en embarquer.

**La source** (`js/forgeDepot.js`). Les scripts sont téléchargés depuis le dépôt public de Forge sur
GitHub, sur l'appareil seulement, et gardés par paquets dans IndexedDB (clés `forge-*`, qu'`idbVider()`
épargne). La liste vient de l'API (quatre requêtes, avec l'empreinte `sha` de chaque fichier), les
fichiers de `raw.githubusercontent.com` épinglé au commit, dix à la fois. Vos cartes et celles de
vos decks passent d'abord ; un téléchargement interrompu reprend ; une fois par semaine, seuls
les fichiers dont l'empreinte a changé sont relus. Le premier téléchargement attend qu'on le demande
(paramètres, « Cartes Forge »).

**Une opération par table.** Une capacité de Forge est une chaîne de tables (`SubAbility$`). Chacune
entre dans le moteur comme une opération `{op, forge: true, api, t, face, slot}` : `op` dit sa nature
à l'IA (`degats`, `exile`, `pioche`…), `t` la table elle-même, que `executeForge()` résout à la pile.
Les `ValidTgts$` deviennent des emplacements de cible ordinaires dont le descripteur porte le filtre
Forge (`desc.forge`), jugé par `forgeValideObjet()` depuis `correspondObjet()`. Le lancement, les
cibles, la pile, les déclencheurs, l'IA restent ceux du moteur : rien n'a été écrit deux fois. Les
déclencheurs deviennent des écoutes `{evt: 'forge'}`, les statiques des `{s: 'forge'}` lues par
`car()`, `coutSort()` et `peutBloquer()`. Les objets retenus (`Remembered`) et les cartes exilées
(`ExiledWith`) appartiennent à la carte, comme dans Forge.

**Piège : `Card.Self` d'un déclencheur de lancement.** `forgeValideDef(def, valid, ctrl, lanceur, id, idSource)`
juge une définition — celle du sort lancé. `idSource` est la carte qui porte le déclencheur : sans lui,
`Self` se comparait au sort jugé lui-même et « when you cast this spell » partait à chaque sort lancé,
par quiconque. De même, un seuil écrit en SVar (`Spell.cmcLEX`, X = les blessures) ne se lit qu'avec
l'`env` de la résolution : `forgeValideObjet()` le reçoit, pas `forgeValideDef()`.

**La meilleure des deux lectures.** `definitionDe()` lit une carte qui porte son script des deux
façons, et joue celle qui comprend le plus — complète avant partielle avant injouable, puis le
meilleur taux. Tant que le moteur ne connaît pas tout le vocabulaire de Forge, une carte que l'oracle
comprenait ne joue jamais moins bien qu'avant. Un comportement écrit à la main l'emporte toujours.

**Une couverture exacte** (`js/forgeCouverture.js`). Chaque module inscrit ce qu'il sait faire au
registre `FORGE_SAIT` (`forgeSait()`) : effets, déclencheurs, statiques, remplacements, mots-clés,
morceaux de coût, expressions, propriétés de filtre, désignations — et les paramètres **par effet**
(`param:ChangeZone.Origin`), parce qu'un même nom ne veut pas dire la même chose d'un effet à l'autre.
Une unité — une capacité et sa chaîne, un déclencheur, une statique, un remplacement, un mot-clé — qui
emploie un élément inconnu, ou qu'on ne sait pas construire (`construction:…`), est écartée entière.
La carte est injouable si l'unité écartée est son sort, un remplacement, ou ressemble à une
contrepartie. Le bloc « Ce qu'il manque au moteur » classe les éléments manquants par cartes touchées,
vos decks d'abord : c'est la feuille de route.

**Étendre le moteur**, un élément à la fois : `forgeEffet(api, params, gen, ia)` pour un effet,
`forgeMode()` pour un déclencheur, `forgeStatique()` pour une statique, une branche de
`motCleForge()` pour un mot-clé. Un paramètre qu'un effet ne déclare pas rend sa table injouable : on
n'inscrit que ce qu'on lit vraiment.

**Les autres façons de lancer et de payer** (`js/jeuVariantes.js`, lot F3). Kicker, rachat, évocation
et présage sont des **variantes** : chacune devient une action de priorité distincte
(`{k: 'lancer', variante}`) avec son propre coût, que `variantesSort()` calcule et vérifie. La
convocation et l'exploration paient une part du coût en engageant des créatures — chacune paie un
mana de sa couleur, sinon un générique — ou en exilant des cartes du cimetière ; rien n'est engagé ni
exilé avant que le paiement soit assuré. L'affinité réduit le coût dans `coutSort()`. Les capacités
peuvent porter une zone (`zone: 'main' | 'cimetiere'`) : le cycle, et les `ActivationZone$` de Forge,
se proposent depuis la main ou le cimetière. Ces champs vivent sur la définition, quelle que soit sa
source : le cycle que l'oracle lit se joue désormais aussi. L'énergie est un compteur du joueur
(`J.energie`).

**Ce qui dure** (`js/jeuDurees.js`, lot F4). Trois listes vivent sur la partie : `P.effets`, des
effets sans carte — les statiques et les déclencheurs d'un `Effect` de Forge —, qui se présentent au
moteur comme des objets (`statiquesEnJeu()` et la collecte des déclencheurs les lisent comme des
cartes) et finissent au nettoyage, au prochain tour de leur contrôleur, au départ de leur hôte ou
jamais ; `P.retardes`, des déclencheurs qui ne partent qu'une fois ; `P.retours`, des cartes
exilées jusqu'au départ de leur hôte (`hotePart()`, appelé par `deplace()`). Une statique peut
accorder des capacités (`AddAbility`, `AddTrigger`) : `capacitesDe(P, o)` rend celles d'un permanent
en ce moment, et remplace `o.def.capacites` partout où l'on active, paie ou écoute. Toute destruction
passe par `detruitObjet()`, qui sait régénérer ; toute défausse par `defausseCarte()`, qui sait la
folie. Un déclencheur de phase dont la phase est inconnue est refusé à la construction : il ne
partirait jamais.

**Les compteurs du tour** (lot F5). Ce qui entre dans une zone (`P.entresTour`, noté par
`deplace()` et la création de jetons), les sorts lancés (`J.sortsTour`), la vie gagnée
(`J.vieTour`), les cartes piochées (`J.piochesTour`) et les attaquants déclarés (`P.attaquantsTour`)
repartent de zéro à chaque tour ; les expressions de Forge qui les lisent (`Count$ThisTurnEntered_…`,
`Count$ThisTurnCast_…`, `Count$LifeYouGainedThisTurn`…) et les déclencheurs « deuxième carte piochée »,
« deuxième sort lancé », « un sort qui le cible » s'y appuient. Une source de mana restreinte (« spend
this mana only to cast creature spells ») ne sert que si le paiement sait ce qu'il paie : `pour`, le
sort ou la capacité, suit `planPaiement()` et `paieMana()`.

**Remplacements et couches** (`js/forgeRemplacements.js`, lot F6). Un remplacement ne monte pas
sur la pile : le moteur l'interroge au moment de l'évènement — `deplace()` pour « exile-la au lieu du
cimetière », `degagement()` pour « ne se dégage pas », le contre pour « ne peut être contrecarré »,
`infligeDegats()` pour la prévention (remplacements et boucliers « prevent the next N damage »). Une
couche propre à l'objet, `o.anime` (`animation()`, js/jeuCaracteristiques.js), fait d'un terrain une
créature, fixe une force de base, ajoute des types, des couleurs, des mots-clés ; `estType()` la lit,
si bien que le combat et les actions d'état voient l'objet animé. Les statiques ajoutent des sous-types
et changent des couleurs ; elles n'ajoutent jamais le type créature, que seule la couche de l'objet
sait faire voir partout. Le contrôle repris jusqu'à la fin du tour revient au nettoyage.

**Les faces** (`js/jeuFaces.js`, lot F7). Une carte porte une définition par face (`def.dos`,
`def.modeFaces`) ; un objet peut jouer une autre face que l'imprimée — l'arrière d'une carte modale,
d'une carte partagée ou d'une aventure, la face transformée, la face cachée d'un morph — : `o.def`
change, la carte (`P.cartes[cid].def`) jamais, et hors du champ la carte reprend sa face avant. Ces
façons de lancer sont des variantes comme les autres (`variantesFaces()`), jugées sur la face qu'elles
jouent ; retourner une créature face cachée est une action spéciale, sans la pile. Une saga compte
ses marqueurs de lore et part quand plus aucun chapitre n'attend ; un véhicule piloté entre dans la
couche `o.anime` jusqu'au nettoyage. Une carte transformable n'est dite complète que si un effet la
transforme vraiment.

**Choix et copies** (`js/forgeChoix.js`, `js/forgeCopies.js`, lot F8). Un choix appartient à la carte
qui l'a fait (`P.cartes[cid].choix` : couleur, type, cartes, joueur, nombre) et se relit aussi longtemps
qu'elle reste (`ChosenType`, `ChosenColor`…). Le joueur répond par une question « modes » ; le joueur
automatique prend ce que le moteur lui désigne (`extra.prefere`) — la couleur ou le type les plus
présents chez lui, ou chez l'adversaire quand l'indice `AILogic` le dit. Les effets « en entrant »
(`K:ETBReplacement`) se jouent dans `metEnJeu()` avant que quiconque voie l'objet : un clone y devient
copie, si bien que les déclencheurs d'entrée de la créature copiée partent. Une copie de sort est un
élément de pile qui se résout comme lui et ne laisse aucune carte. Les dégâts répartis donnent au moins
1 à chaque cible, puis de quoi tuer dans l'ordre : simplification annoncée, on ne demande pas.

**Le coût d'une capacité qu'on résout** (lot F9). Dans Forge, une capacité exécutée par un déclencheur
peut porter son propre `Cost$` (« you may pay {2}; if you do… », « you may draw a card; if you do,
discard ») : `effetForge()` le garde sur l'opération (`coutInterne`) — sauf à la racine d'un sort ou
d'une capacité activée, payée au lancement —, et `executeForge()` le propose à la résolution ; refusé ou
impayable, la chaîne s'arrête là (`ctx.coupe`). La traîne (`js/forgeTraine.js`) bâtit plusieurs
mots-clés en déclencheurs de Forge ordinaires (`declencheurSynthetique()`).

**Jouer d'ailleurs que sa main** (`js/jeuPermis.js`, lot F10). Une statique `MayPlay$` de Forge —
portée par un permanent, par un effet dont la mémoire désigne les cartes exilées (la pioche
d'impulsion), ou par la carte elle-même depuis sa zone (`EffectZone$`) — permet de jouer une carte de
l'exil de n'importe quel joueur, de son propre cimetière ou du dessus de sa bibliothèque.
`actionsLegales()` parcourt ces zones seulement si une telle statique existe : le cas courant ne coûte
rien. Un sort ainsi permis est une variante (`permis`) au coût imprimé, ou sans mana ; il garde son
moment, et un sort permis depuis le cimetière y retourne, au contraire du flashback. La permission
« une fois par tour » se note dans `P.unefois`. **La protection** accepte aussi un filtre de Forge
(« from artifacts », `K:Protection:Creature.Black`) : `protegeFiltre()` le juge contre la source, au
ciblage, au blocage et aux dégâts.

**Les statiques qui règlent les joueurs** (`js/forgeInterdits.js`, lot F11). Rule of Law, le flash
accordé, Null Rod, « attacks each combat if able », Ghostly Prison, Panharmonicon, Doran, « players
can't gain life »… ne changent pas ce qu'est un objet : elles changent ce qu'un joueur a le droit de
faire. Chaque règle du moteur qu'elles touchent — `actionsLegales()`, `sourcesMana()`,
`declareAttaquants()`, `ciblable()`, `gagneVie()`, la collecte des déclencheurs — interroge la sienne
(`sortInterdit()`, `activationInterdite()`, `attaquePermise()`…), relevée une fois par version de
l'état. La taxe d'attaque se paie en une fois ; faute de mana, les attaquants les plus chers restent
chez eux. **Les statiques qui font devenir** (`js/jeuCouches.js`) — Control Magic, March of the
Machines, Humility, Blood Moon, Urborg — changent `o.ctrl` et la couche `o.anime`, que `car()` ne
gouverne pas : elles s'appliquent à chaque passe des actions d'état, comme Forge le fait à chaque
vérification de l'état. Un terrain dont les types changent tient ses capacités de mana de ses types
(règle 305.6) ; « RemoveLandTypes » lui ôte celles de son texte (305.7).

**Les déclencheurs, suite** (`js/forgeDeclencheursB.js`, `js/jeuGestes.js`, lot F12). Un déclencheur
ne voit que les évènements émis : engager, dégager, poser des marqueurs et cibler passent donc par
une porte qui émet (`engageObjet()`, `poseMarqueurs()`, `emetCibles()`), au lieu d'écrire le champ de
l'objet là où ils se font. Les modes « one or more » (`ChangesZoneAll`, `DamageDealtOnce`…) ne
partent qu'une fois par collecte ; « only once each turn » se compte par source et par déclencheur
(`P.declTour`). Une carte écoute aussi depuis son cimetière, la zone de commandement ou l'exil
(`TriggerZones$`, `cap.zones`). Un déclencheur d'état (`Always`) part dès que sa condition tient, et
pas de nouveau tant qu'il attend ou qu'il est sur la pile.

**La mémoire des cartes** (lot F13). Ce qu'un effet retient (`RememberObjects$`, et après coup
`RememberDestroyed$`, `RememberCountered$`, `RememberDamaged$`) vit dans `P.cartes[cid].memo` et se lit
par `Remembered`, `IsRemembered`, `Remembered$Valid …`. Ce qu'une carte a exilé (`exilees`) répond à
`ExiledWithSource`. `ControlledBy X` et `OwnedBy X` jugent le contrôleur contre une désignation.
L'objet d'un départ se lit sur son instantané : arrivée au cimetière, la carte n'a plus ses marqueurs.
Les expressions nouvelles passent par `exprEtendue()` (js/forgeExprB.js), que la porte interroge avant
de rendre zéro.

**L'historique du tour** (`js/jeuHistorique.js`, lot F14). Chaque évènement émis passe par
`noteHistorique()` : la vie perdue, les sacrifices, les défausses, les marqueurs posés, les cartes
parties du cimetière (`P.hist`, qui se refait quand le tour change), et sur l'objet son entrée, ses
blessures et ses attaques du tour. Un sort garde `lance` — qui l'a lancé, d'où, avec quel mana, couleur
par couleur — jusque sur le permanent qu'il devient : la convergence, « was cast from your hand » et
« mana spent to cast it » s'en lisent. La dévotion compte les symboles des coûts, hybrides compris.

**La bibliothèque et les remplacements, suite** (lot F15). Lancer une carte depuis un effet (cascade,
« cast it without paying », découvrir) passe par `lanceSort()` avec une variante que la carte porte
le temps du lancement (`o.lanceEffet`). Les remplacements de quantité — Doubling Season, Hardened
Scales, Parallel Lives, Boon Reflection, Torbran — passent tous par `quantiteRemplacee()`, qu'appellent
`poseMarqueurs()`, la création de jetons, `gagneVie()` et `infligeDegats()` ; chacun s'applique une
fois, dans l'ordre du champ. « Enters tapped unless… » se juge à l'entrée sur n'importe quelle
expression ; « creatures your opponents control enter tapped » et « if it would be put into a
graveyard, put it on top of its owner's library instead » sont des formes de remplacement.

**Les paramètres de plus** (`js/forgeEffetsF.js`, lot F16). « Tapped and attacking », « sacrifice it at
the beginning of the next end step », « choose flying or lifelink », bolster, adapt, « if it would die
this turn, exile it instead »… s'ajoutent à des effets déjà écrits : `etendEffet()` enveloppe l'effet
d'un avant (qui peut changer la table) et d'un après (qui reçoit les objets visés et ceux entrés
pendant), et inscrit les paramètres. Le fichier se charge après tous les effets qu'il enveloppe.

**Les mécaniques de partie** (`js/forgeEffetsG.js`, lot F17). Les boucles des scripts — `RepeatEach`
(« for each player »), `Repeat`, `Branch`, `StoreSVar` — exécutent une sous-capacité nommée, compilée à
la construction et sans cible (`sousEffets()`), jouée à la résolution (`joueSous()`) ; une variable posée
en route (`ctx.vars`) passe avant la SVar écrite. Le monarque pioche à son étape de fin et perd la
couronne aux dégâts de combat ; un tour supplémentaire passe devant le suivant (`P.toursEnPlus`) ; un
permanent hors phase quitte `P.champ` sans départ ni entrée et revient au dégagement de son contrôleur.
Simplifications annoncées : un donjon générique de quatre salles, et l'Anneau au premier niveau seulement.

**Les mots-clés des permanents, suite** (`js/forgeMotsClesB.js`, lot F18). Soulshift, undying, persist,
modular, evolve, extort, flanking, vanishing, fading, melee, battle cry deviennent des déclencheurs de
Forge écrits comme Forge les écrirait (`synthese()`), avec les SVars qu'ils demandent ; level up et
outlast, des capacités activées. Wither, toxic, shadow, horsemanship, skulk, unleash et umbra armor
posent un paramètre que les dégâts, le combat ou `detruitObjet()` lisent. Living weapon, afterlife et
partner with ont leur opération propre. Simplification annoncée : fabricate et riot prennent toujours
les marqueurs.

**Les façons de lancer, suite** (`js/jeuVariantesB.js`, lot F19). Le coût alternatif qu'une carte porte
(`S:Mode$ AlternativeCost`, Force of Will, Fierce Guardianship), escape, retrace et jump-start depuis le
cimetière, dash, spectacle et surge sont des variantes de plus (`variantesEtendues()`), sous la même
garde que les autres : payables, et jugées sur leur condition. Exiler une carte de sa main se paie
comme une défausse vers l'exil. Le rebound exile le sort lancé depuis la main et le relance gratuitement
à l'entretien suivant ; split second ne laisse à personne d'autre action que passer.

**L'animation complète** (lot F20). Une animation (`Animate$`, `AnimateAll$`) peut accorder des capacités,
des déclencheurs et des statiques — compilés une fois à la construction (`accordeAnimation()`) et portés
par l'entrée de `o.anime`, que `capacitesDe()` et `statiquesEnJeu()` lisent — et ôter des types, des
mots-clés ou toutes les capacités. **La version de l'état ne bouge qu'à un vrai changement** : la passe des
couches (js/jeuCouches.js) lève puis repose les couches à l'identique sans toucher à `P.ver`, sans quoi
chaque passe des actions d'état viderait tous les caches de `car()`.

**Le mana et les coûts, suite** (`js/jeuCoutsB.js`, lot F21). L'hybride et le phyrexian s'écrivent sans
barre dans les coûts d'activation de Forge (`WB`, `WP`). Les morceaux de coût de plus (`COUTS_B`, dans
js/forgeCout.js) se lisent en champs du coût, que `coutAutrePossibleB()` juge et `paieAutreB()` paie à
la suite des autres ; une capacité de mana qui en porte n'est pas une source gratuite. Improvise passe
par la convocation, avec les artefacts pour candidats. Le mana reflété (Reflecting Pool) se calcule au
moment de payer. Simplifications annoncées : le déclencheur de mana monte sur la pile au lieu de se
résoudre tout de suite, et fourrager exile toujours trois cartes du cimetière.

**Les faces, suite** (`js/jeuFacesB.js`, lot F22). Une carte transformable est jouée si quelque chose la
transforme : un effet, le jour et la nuit, disturb, craft, ou un retour « transformed ». Le jour et la
nuit sont un état de la partie (`P.jourNuit`), jugé au début de chaque tour sur les sorts du joueur actif
du tour précédent (`P.sortsDernierTour`, noté avant que `tour()` ne les efface) ; les loups-garous d'avant
jugent la même chose. Disturb et aftermath se lancent du cimetière, prototype et fuse sont des
variantes ; fuse décale les emplacements de cible de la seconde moitié. Un omen se lance comme une
aventure et se mélange ensuite dans la bibliothèque ; une carte flip se retourne comme une transformable.

**Les déclencheurs et remplacements, suite** (`js/forgeRemplacementsB.js`, lot F23). « You can't lose the
game » se juge dans les actions d'état, avant d'éliminer ; « skip your draw step » au seuil de l'étape.
Un effet qui dure « jusqu'à la fin de votre prochain tour » (la pioche d'impulsion récente) garde le tour
où il est posé (`e.pose`) et part au nettoyage du tour suivant de son contrôleur. Le flashback accordé
(Snapcaster Mage) est une marque de tour sur la carte du cimetière. Le coût « you may exile it » d'une
carte qui vient de mourir se juge et se paie à la résolution, sur la carte de l'évènement.

**Les statiques, suite** (lot F24). Une statique qui accorde une statique (`AddStaticAbility$`) la compile
une fois ; `statiquesEnJeu()` la pose sur chaque objet visé, une fois la liste de base rangée — juger qui
elle vise ne recalcule donc pas la liste. Seedborn Muse, Thorn Elemental, « assigns no combat damage »,
« can't be regenerated », « can't play lands », goad par statique, mots-clés retirés et « spend mana as
though any color » s'ajoutent à js/forgeInterdits.js et aux règles qu'ils touchent.

**Les déplacements, suite** (lot F25). `StaticEffect$` nomme une statique (« that creature is a black
Zombie in addition ») : un effet permanent la pose et retient l'objet arrivé. Les restrictions entre
cibles — même contrôleur, noms différents, une par joueur — écartent après le choix les cibles qui les
enfreignent (`restreintCibles()`). Une carte lancée par un effet « exile it instead » porte la marque
jusque sur la pile.

**Les formes des effets, suite** (lot F26). Un charme qui interdit de reprendre un mode (« this game »,
« this turn ») garde les modes pris dans `P.cartes[cid].modesPris`. Les jetons X/X, les copies multiples,
la cible d'un clone, les durées « until end of turn or until the host leaves » et « as long as you
control » s'ajoutent par `etendEffet()`.

**Les effets nouveaux** (lot F27). `js/forgeEffetsH.js` joue les effets que Forge écrit chacun sous son
nom : doubler (`MultiplyCounter`), déplacer (`MoveCounter`) ou retirer partout des marqueurs, nommer une
carte (`NameCard`, lue par le filtre `NamedCard` : Pithing Needle), détenir, protéger tout un camp,
imposer un blocage, faire infliger à chacun des dégâts égaux à sa force, endurer, apprendre — sans
réserve de leçons, « défausser pour piocher » —, détourner un sort à cible unique. Le tour devient une
file d'étapes (`P.fileEtapes`) où `AddPhase` insère un combat ou une phase principale de plus. Un
effet de Forge qui cible dit désormais à l'IA ce qu'il vise (`op.a`), ce qui lui fait choisir la
bonne cible pour une détention ou un goad.

**Les mots-clés de lancement, suite** (lot F28). `js/forgeMotsClesC.js` ajoute des façons de lancer à
`variantesSort()` : entwine (tous les modes), replicate et squad (payés une à trois fois), casualty,
offspring, blitz, warp. Les copies de replicate et casualty naissent d'une capacité déclenchée au
lancement ; ce que blitz, squad et offspring donnent au permanent passe par une entrée `o.anime` qui
porte des capacités, ce qui suit l'objet jusqu'à sa mort. Embalm, eternalize, encore, transmute et
ninjutsu sont des capacités activées depuis le cimetière ou la main ; plot est une action spéciale,
comme le présage. Simplification annoncée : le ninja attaque le premier adversaire.

**Les mots-clés des permanents, troisième partie** (lot F29). `js/forgeMotsClesD.js` écrit annihilator,
renown, rampage, mobilize, myriad, mentor et graft comme des capacités déclenchées sur les évènements du
moteur (`attaque`, `estBloque`, `degatsJoueur`, `entre`), jouées par une opération à elles ; backup
comme un déclencheur de Forge synthétique ; sunburst et devour comme des effets « en entrant ». La
bénédiction de la cité (ascend) se juge quand une condition la demande : elle ne se perd jamais, ce
qui revient au même. Les Leylines jouent leur effet après les mulligans. Un maximum de cibles écrit en
SVar (`TargetMax$ X`, « any number of target … ») se calcule au choix des cibles, et non plus 1.
Simplifications annoncées : mentor choisit sa créature à la résolution, ne pas se dégager n'est jamais
choisi, personne n'aide à payer (assist).

**Les désignations, et un bilan** (lot F30). `js/forgeDesignations.js` est consulté en dernier par
`forgeDefinis()`, les expressions et les filtres : les joueurs retenus (`Player.IsRemembered`), le
dessus de la bibliothèque, l'objet imprimé (rangé, comme Forge l'écrit, avec la mémoire de la carte),
le monarque, le premier joueur, les marqueurs d'un joueur autres que l'énergie et le poison
(`J.marqueurs`), les adversaires attaqués ce tour, monstrueux, incité, ombre. En chemin, deux erreurs
anciennes : la monstruosité lit enfin son nombre (`Monstrosity$ 3`, jamais `True`), et une statique
qui porte `AffectedDefined$` et `Affected$` exige les deux.

Au terme des lots F21 à F30, 73,4 % des 34 234 cartes de Forge sont entièrement comprises, 75,1 % hors
des formats à part (Alchemy, Un-, Planechase, Archenemy, Conspiracy). Des 9 116 cartes restantes,
5 081 ne manquent que d'un élément : la traîne est longue, et chaque lot n'en gagne plus que quelques
centaines. Les plus gros manques restants : les statiques continues que Forge écrit d'une forme encore
inconnue, Station, Bestow, les classes, la vitesse (« Start your engines »), Splice, Overload. Une
partie entre deux decks ordinaires prend 18 ms ; le banc aléatoire joue 300 parties sur des cartes de
Forge tirées au hasard sans erreur ni invariant rompu.

**Les statiques hors du champ** (lot F31). « Spells you cast have cascade », « instant and sorcery cards
in your graveyard have flashback », « creature cards in your hand have cycling » : `js/forgeStatiquesB.js`
tient une couche de plus, à côté de celle du champ. À chaque passe des actions d'état, une carte de la
main, du cimetière, de l'exil ou de la zone de commandement que vise une telle statique reçoit une
définition augmentée des mots-clés accordés, lus par l'analyseur des scripts (`motCleForge()`) ; elle
retrouve la sienne quand la statique cesse. « Les sorts que tu lances » vise les cartes qu'on pourrait
lancer, et `wasCast` s'y juge d'avance. Un sort lancé emporte sa définition augmentée sur la pile ; la
carte qui change ensuite de zone repart de son imprimé. Les mots-clés que l'analyseur ne lit pas
(démonstration, miracle…) laissent la statique, et la carte, refusées.

Dans le même lot : les statiques qui agissent depuis le cimetière (les Incarnations), « n'est pas une
créature » (`RemoveType`, les dieux de Theros), la couleur de tout ou de son choix, l'attirance (Lure),
la permission de lancer depuis la main sans payer (Omniscience) ou avec du mana de tout type, le coût
additionnel facultatif (`OptionalCost`, et la condition qui le lit), exercer en attaquant, un coût
additionnel qu'impose une statique (waterbend), l'équipement moins cher. Corrigé en chemin : Dig fouille
la bibliothèque de chaque joueur désigné, et la couverture examine une expression écrite en place
(`ConditionCheckSVar$ Count$Presence_Dragon.1.0`) comme celle d'une SVar. Restent hors du lot : les
Avatars de Vanguard, « can block an additional creature » (un bloqueur pour plusieurs attaquants).

**Les coûts en X, le mana, la garde** (lot F32). Un coût lu par `coutForge()` garde `'X'` (ou `'All'`,
« remove all counters ») là où il porte une quantité : vie, énergie, marqueurs, sacrifices, défausses,
cartes du cimetière, créatures à engager. `js/jeuCoutsX.js` le résout avant de juger ou de payer : X
est celui du sort, ou celui qu'on choisit en activant, jamais plus que ce qu'on peut payer, et l'IA
ménage sa vie. S'y ajoutent les coûts qui touchent la carte elle-même (se renvoyer en main, poser un
marqueur sur soi), exiler un permanent qu'on contrôle, remettre une carte de sa main sur sa
bibliothèque, « unless its controller pays {Y} » quand Y est une SVar (jusque-là, un X ainsi écrit ne
coûtait rien), la garde payée autrement qu'en mana (« Ward—Discard a card »), l'entretien cumulatif en
vie ou en sacrifices. Un sort paie désormais son mana avant le reste de son coût (règle 601.2g-h) : un
terrain engagé peut être sacrifié, et un paiement qui échoue ne laisse rien de payé à moitié.

Côté mana : la source qui ne se dégagera pas (Cinder Marsh), deux couleurs différentes, une couleur
par couleur parmi ses permanents (Bloom Tender), et Mana Flare — le mana produit voyage avec
l'évènement d'engagement, et le déclencheur monte sur la pile (simplification annoncée). Le
planificateur de paiement compte enfin chaque mana d'une source qui en produit plusieurs à la fois
(« WG » paie {G} et {W}). Restent de côté les terrains de stockage, dont X se choisirait au milieu
d'un paiement, et le mana « quand il est dépensé ».

**Les entrées et les zones d'activation** (lot F33). `js/forgeEntrees.js` lit les entrées que Forge écrit
en long :
- `K:ETBReplacement:…:Battlefield:Creature.Other+YouCtrl` est un remplacement porté par un permanent
  et joué sur l'objet qui entre (`entreesAutres()`, depuis `metEnJeu()`). `ReplacedCard` désigne enfin
  cet objet. Exemples : Grumgully, Essence of the Wild — et son Clone dont `CloneTarget$` devient la
  copie.
- La même forme sans zone porte une condition sur la carte elle-même (`Card.Self+kicked`,
  `+escaped`).
- Un remplacement `Moved` de la carte qui ne fait que préparer son entrée (choisir, marquer,
  s'engager) devient un effet d'entrée.
- La famille « sacrifie une Forêt à la place ; sinon, au cimetière » (Heart of Yavimaya, Mox Diamond)
  se paie avant d'entrer.

S'y ajoutent :
- les conditions Adamant et Revolt des marqueurs d'entrée (le tour retient qui a vu partir un de ses
  permanents) ;
- les capacités activées depuis le cimetière qui sacrifient ;
- le type de terrain de base choisi ;
- les cibles restreintes au contrôleur que désigne le déclencheur (`TargetsWithDefinedController`), à
  une valeur de mana totale (`MaxTotalTargetCMC`), ou augmentées de la carte elle-même
  (`ThisDefinedAndTgts`).

**Prepare, les durées, les attributs** (lot F34).

*Prepare.* Une carte Prepare est une créature qui porte un sort (sa face `dos`). Tant qu'elle est
préparée, son contrôleur lance une copie de ce sort, et cela la déprépare (`js/jeuPrepare.js`). La
copie est un jeton glissé en main le temps du lancement. Il passe par le lancement ordinaire, puis
cesse d'exister en quittant la pile : `deplace()` le laisse vivre sur la pile et nulle part ailleurs.

*Les durées.* Un bonus ou une animation posés sur un objet (`o.mods`, `o.anime`) prennent les mêmes
durées que les effets (`js/forgeDurees.js` `finForge()`) :
- jusqu'à ton prochain tour, levée au début du tour ;
- jusqu'à la fin du combat, levée par `finCombat()` ;
- tant que la source reste, levée au départ de l'hôte, comme le contrôle pris « for as long as » ;
- le clone d'un tour redevient lui-même au nettoyage.

*Aussi dans ce lot* :
- « doesn't untap during your next untap step » écrit en effet ;
- le propriétaire d'un effet (`EffectOwner`) ;
- l'incolore d'une animation ;
- les charmes dont le nombre de modes se calcule au lancement (Akroma's Will) ;
- les attributs préparée, enfourchée (Saddle, `IsSaddled`) et comploté.

**La pioche et les dégâts remplacés** (lot F37).

*La pioche.* `piocheN()` pioche sans rien demander : la main de départ s'en sert. La pioche d'une partie
en cours passe par `pioche()` (`js/jeuPioche.js`), carte par carte :
- un remplacement `Draw` porté par un permanent ou un effet se joue à la place (Thought Reflection,
  Notion Thief). Il ne s'applique pas aux pioches qu'il fait lui-même (règle 614.5) : deux Thought
  Reflection font piocher quatre cartes ;
- Dredge meule N et reprend la carte du cimetière ;
- la première carte piochée du tour se lance pour son coût de miracle, par la voie des lancements
  depuis un effet. Forge en fait un déclencheur ; ici elle se lance aussitôt — la même chose tant que
  personne ne répond au déclencheur.

*Les dégâts.* Un remplacement `DamageDone` à `ReplaceWith$` (`js/forgeRemplacementsC.js`) :
- prévient N (`ReplaceDamage`) : le bouclier d'un effet (`ShieldAmount`) s'use, un montant calculé
  (Temple Altisaur) se recalcule ;
- détourne les dégâts (Pariah) ou une part d'entre eux (Warrior en-Kor) ;
- ou joue une chaîne à la place (Vigor : des marqueurs pour les dégâts prévenus).

Chaque remplacement s'applique au plus une fois à un évènement. `infligeDegats()` n'est pas un
générateur : combien et à qui se décident sur-le-champ, et la chaîne qui suit attend dans
`P.suitesRemp` jusqu'au pas suivant d'`executeOps()` ou de `priorite()`.

*Aussi dans ce lot* :
- choisir une source (Circle of Protection) : l'effet garde la carte choisie en naissant ;
- « exile this effect » met fin à l'effet ;
- `DamageResolve` ne fait rien de plus, puisque les dégâts sont déjà infligés à mesure ;
- un permanent hors phase qu'un effet déplace quitte aussi la liste du phasing.

**Les paliers : Station, classes, Rooms, vitesse** (lot F36, `js/forgePaliers.js`).

- *Station.* Engager une autre créature pose autant de marqueurs charge que sa force. Le coût
  retient les créatures engagées (`ctx.engages`). Les seuils « STATION N+ » sont déjà des statiques à
  condition de marqueurs.
- *Les classes.* Chaque niveau est une capacité de rituel qui ne s'active qu'au niveau d'avant
  (`palier`, jugé par `activationInterdite()`). Ce qu'il accorde (déclencheurs, statiques) est
  compilé avec la condition « ce permanent est au niveau N ou plus » (`ClassLevelGE`).
- *Les Rooms.* Chaque moitié porte la capacité de déverrouiller l'autre. L'objet joue la moitié
  lancée, puis les deux réunies (`defRoomOuverte()`). « When you unlock this door » écoute la moitié
  qu'on vient d'ouvrir. Forge en fait une action spéciale ; ici une capacité, à laquelle on peut
  répondre.
- *La vitesse.* « Start your engines! » donne la vitesse 1. Elle monte d'un cran par tour, jusqu'à 4,
  quand un adversaire perd des points de vie pendant ton tour (`noteHistorique()`) : sur-le-champ, là
  où Forge passe par un déclencheur.

**Les mots-clés de lancement, II** (lot F39, `js/forgeMotsClesE.js`). Chacun est une variante de
lancement, ou un ajout au lancement :

| Mot-clé | Ce que le moteur en fait |
|---|---|
| Overload | Le sort est recompilé, ses cibles changées en désignations (`Defined$ Valid …`) : « target » devient « each ». |
| Awaken | La chaîne du sort finit par des marqueurs sur un terrain qu'on contrôle, qui s'anime. |
| Sneak | Lancé à l'étape des bloqueurs, quelle que soit sa vitesse, en renvoyant un attaquant non bloqué ; une créature entre engagée et attaquante. |
| Mayhem | Lancé depuis le cimetière le tour où la carte a été défaussée (`o.defausseTour`). |
| Gift | L'adversaire choisi (`Promised`) reçoit le cadeau : avant le reste d'un sort, en entrant pour un permanent. |
| Bargain | Un sacrifice en plus. La variante se lit dès le choix des cibles (`s.varianteLance`). |
| Conspire | Deux créatures qui partagent une couleur avec le sort, engagées, puis une copie. |
| Emerge | Une variante par créature à sacrifier, le coût réduit de sa valeur de mana. |
| Splice | Au lancement d'un sort Arcane, les cartes de la main y greffent leurs effets et leur coût. |
| Firebending | Du mana rouge que la réserve garde jusqu'à la fin du combat. |
| Cipher | La carte s'encode sur une créature ; ses blessures à un joueur relancent une copie. |

*Deux défauts trouvés en chemin* :
- les coûts hybrides de Forge (`GW`, `2W`) se lisaient vides : ces cartes ne coûtaient rien et
  n'avaient pas de couleur (`forgeCoutMana()`) ;
- « When you cast this spell » (`SpellCast` sur `Card.Self`) ne se déclenchait pas, la carte étant sur
  la pile et non sur le champ (`declencheursDeLancement()`).

**Les effets nouveaux, II** (lot F38, `js/forgeEffetsI.js`).

- *Deux piles* (Fact or Fiction) : un joueur sépare, un autre choisit, la chaîne de chaque pile se joue
  avec elle pour mémoire. L'IA met la meilleure carte seule.
- *Le clash* : la plus grande valeur de mana gagne, chacun peut mettre sa carte dessous.
- *Le vote* : le plus voté se joue (Will of the council). Avec Council's dilemma, chaque choix se joue
  avec son nombre de voix (`VoteNum`).
- *Sauter une étape* : le saut est retenu pour le joueur et levé à la première étape sautée ; sauter
  le combat saute toutes ses étapes.
- *L'initiative* : on s'aventure dans le donjon simplifié de `Venture`, à la prise et à son entretien.
  Qui blesse au combat le joueur qui l'a la lui prend.
- *Earthbend* : un terrain devient une créature 0/0 avec des marqueurs ; mort ou exilé, il revient
  engagé. Forge le fait cibler ; il est choisi ici à la résolution.
- *Airbend* : exilé, il se relance pour {2}.

*Les paramètres de plus* :
- un sort de permanent qui porte un coût additionnel (`PermanentCreature`) ;
- viser un sort qui cible une créature (`TargetValidTargeting`) ;
- choisir au hasard, lancer la copie d'une carte ;
- chaque marqueur d'une source, défausser autant qu'on veut ;
- Exhaust : une capacité qu'un objet n'active qu'une fois.

`;` sépare les choix d'un coût Forge (`tapXType<2/Artifact;Creature;Land>`) : il se lit désormais comme `,`.

**Les auras de joueur, Bestow, Reconfigure** (lot F35, `js/forgeAuras.js`).

- *Les Curses.* Une aura qui enchante un joueur (`K:Enchant:Player`) porte `o.attJoueur` au lieu de
  `o.att`. `Player.EnchantedBy`, `EnchantedPlayer` et `EnchantedPlayerCtrl` le lisent ; elle tient tant
  que le joueur joue.
- *Bestow.* La créature se lance comme une aura pour son coût de bestow : un enchantement Aura sans
  types de créature (`defBestow()`). Quand son hôte part, elle redevient une créature au lieu d'aller
  au cimetière (`auraOrpheline()`, appelée par les actions d'état).
- *Reconfigure.* Deux capacités de rituel, attacher et détacher. Attaché, l'équipement n'est plus une
  créature : une animation qui ôte le type tant que `o.att` tient.

*Aussi dans ce lot* :
- attacher ce qu'on choisit (`Attach.Choices`) ;
- les filtres `AttachedTo …` et `Attached`.

*Défaut trouvé en chemin* : `TriggeredPlayer` ne désignait personne pour un déclencheur d'étape
(« at the beginning of each player's upkeep, … that player ») ; c'est le joueur actif.

**Les déclencheurs qui butaient, et un bilan** (lot F40, `js/forgeDeclencheursC.js`).

Les paramètres de déclencheurs que le moteur refusait encore :
- les conditions Revolt, Delirium et « if you're the monarch » ou « if you have the initiative »
  (`CheckDefinedPlayer`), jugées par `conditionForge()` ;
- une présence comptée sur des objets désignés (`PresentDefined`) ou chez un joueur (`PresentPlayer`) ;
- le joueur qui contrôle le déclencheur (`TriggerController`) ;
- un déclencheur d'effet qui ne sert qu'une fois (`OneOff`) : l'effet finit quand il se déclenche ;
- « your second main phase » (`PhaseCount$ 2`) ;
- le sort lancé grâce à cette source, ou avec tant de mana dépensé (`ValidSA`).

Une valeur qu'on ne sait pas lire fait refuser le déclencheur à la construction (`declencheurForge()`
enveloppé). `ResolvedLimit` (« only once each turn », compté à la résolution) est compté au
déclenchement — simplification annoncée.

*Le bilan des lots F31 à F40.* La part des 34 234 cartes de Forge entièrement comprises passe de
73,4 % à 79,2 %. Hors des formats à part, elle est de 81,7 %. Sont exclus de ce second chiffre :
- les types Plane, Phenomenon, Scheme, Vanguard, Conspiracy et Dungeon ;
- les cartes `A-` d'Alchemy ;
- les mécaniques d'Alchemy et des Un- (perpetual, seek, spellbook, empower, conjure, stickers,
  attractions, contraptions).

Des 7 115 cartes restantes, 3 992 ne manquent que d'un élément. Les plus gros manques qui restent :
- des statiques continues, des déclencheurs de zone, des capacités de mana et des cartes à deux faces
  que Forge écrit d'une forme encore inconnue ;
- les stickers et le chaos de Planechase (formats à part) ;
- power-up ;
- bloquer plusieurs créatures (`CanBlockAmount`).

Une partie entre deux decks ordinaires prend 23,5 ms, et le match de référence reste à 106–94. Le banc
aléatoire joue 1 200 parties, à deux et à quatre joueurs, sur des cartes de Forge tirées au hasard,
sans erreur ni invariant rompu.

*Les défauts anciens trouvés en chemin* :
- les coûts hybrides (`GW`, `2W`) se lisaient vides (F39) ;
- « When you cast this spell » ne se déclenchait jamais (F39) ;
- `TriggeredPlayer` ne désignait personne pour un déclencheur d'étape (F35) ;
- un permanent hors phase déplacé restait dans la liste du phasing (F37) ;
- le `;` des coûts de Forge n'était pas lu comme une alternative (F38).

**Dégager et piocher « jusqu'à »** (lot F41, `js/forgeDegagements.js`). Le premier lot choisi sur la
mesure des cartes les plus jouées en Commander (EDHREC) :
- « untap up to N lands » (Frantic Search, Snap, Peregrine Drake) : N permanents engagés du type dit,
  choisis ; l'IA dégage d'abord les siens ;
- « may draw up to two cards » (Arcane Denial) : chacun choisit combien ;
- « lands you control enter untapped » (Spelunking) : le pendant de « enter tapped », qui l'emporte
  sur lui — le contrôleur choisit l'ordre des remplacements, simplification annoncée ;
- « spend only mana of the chosen color to activate this ability » (Throne of Eldraine) : le
  générique de la capacité se paie dans la couleur choisie (`planPaiement()` enveloppé).

*Défaut trouvé en chemin* : un effet (la zone de commandement) n'a pas de propriétaire, et un filtre
`YouDontCtrl` le croyait adverse. Channel Harm se renvoyait alors ses propres dégâts sans fin. Les
chaînes de remplacement s'arrêtent désormais à dix niveaux, par garde-fou.

**Les remplacements, IV** (lot F46, `js/forgeRemplacementsD.js`). Le second lot tiré de la mesure
EDHREC :

| Remplacement | Ce que le moteur en fait | Cartes |
|---|---|---|
| Jetons en plus | Les jetons s'ajoutent à ceux de l'évènement, sans repasser par la quantité (Doubling Season ne double pas deux fois). | Chatterfang, Xorn, Peregrin Took |
| Jetons à la place | D'autres sortes remplacent celles de l'évènement. Deux Academy Manufactor ne se composent pas — simplification annoncée. | Divine Visitation, Academy Manufactor |
| Marqueurs selon qui les pose | `ValidSource$ You` juge le contrôleur de la source. | Vorinclex |
| Vie perdue | Doublée pendant le tour de son contrôleur, ou arrêtée à 1. Payer de la vie n'est pas une perte qu'on remplace. | Bloodletter of Aclazotz, Angel's Grace |
| Tour en plus sauté | Le tour en plus d'un adversaire n'a pas lieu. | Trouble in Pairs |
| Meuler et proliférer | Meuler quatre de plus, proliférer deux fois. | The Water Crystal, Tekuthal |
| Exil au lieu du cimetière | La chaîne qui suit (gagner 2 points de vie, créer un jeton) attend son tour dans `P.suitesRemp`. | The Darkness Crystal, Nemata |

Les définitions des jetons qu'une forme crée viennent de la compilation en cours (`JETONS_COURANTS`,
`definitionDepuisScript()` enveloppé).

**Le mana, II** (lot F42, `js/forgeManaB.js`) :
- *Une capacité de mana sous condition* (Mox Opal) : metalcraft, threshold, hellbent, jugés par `FORGE_CONDITIONS`.
- *Depuis la main* (Simian et Elvish Spirit Guide) : la source la plus chère, prise en dernier par le
  planificateur. Payer l'exile.
- *Le mana qui rend un sort incontrecarrable* (Delighted Halfling) : `paieMana()` marque le sort payé
  avec lui.
- *Le mana reflété* d'un montant calculé (Incubation Druid).
- *Multikicker* (Everflowing Chalice, Comet Storm) : une variante par nombre de kicks. La variante
  suit le permanent dès son entrée, pour « for each time it was kicked » (`Count$TimesKicked`).
- *Le mana qu'on ne perd pas* : le rouge reste avec Electro, tout devient rouge avec Ozai.
- *Le mana multiplié* (Nyxbloom Ancient, Mana Reflection) : il s'ajoute à l'engagement.
- *Le mana en plus selon la couleur produite* (Forsaken Monument, Caged Sun).

Ces règles touchent des gestes très fréquents (planifier un paiement, engager, vider les réserves).
On ne les cherche que si une carte qui les porte a été compilée (`MANA_B`) : sans ce garde, une
partie ordinaire coûtait 10 % de plus.

**L'empreinte et la mémoire** (lot F43, `js/forgeEmpreinte.js`, `js/forgeMemoire.js`). Trois
décisions :
- *L'empreinte est à part de la mémoire*, comme dans Forge (`P.cartes[cid].empreinte`, ou sur
  l'effet). Elle survit aux déplacements de la carte : c'est le script qui la vide, par un
  `Cleanup` à la sortie du champ. Chrome Mox paie dans les couleurs de la carte exilée, Isochron
  Scepter copie l'éphémère imprimé, Breach the Multiverse garde ses choix d'un joueur à l'autre.
- *`RepeatEach` ajoute à la mémoire, il ne la remplace plus* : le joueur ou la carte du tour de
  boucle s'ajoute puis s'en va, ce qu'on retenait avant reste lisible dedans (Braids, Arisen
  Nightmare), ce que la boucle retient reste après elle (Patriarch's Bidding).
- *Un déclencheur `Static$ True` ne monte pas sur la pile* : sans cible, sans mode ni « you may », sa
  chaîne se joue dès que l'évènement est relevé (`P.suitesRemp`). C'est le plus souvent le ménage
  d'une mémoire. Les déclencheurs de mana gardent leur forme.

Avec eux : un nombre retenu (Mana Drain, la valeur du sort contrecarré, emportée par le déclencheur
retardé ; Creeping Bloodsucker, les blessures infligées) ; l'instantané d'une créature détruite (Saw in
Half, Noxious Gearhulk) ; les joueurs sans rien de retenu (Plaguecrafter) ; « partage un type, un
nom avec » ; l'aura qui enchante une carte de cimetière puis la créature qu'elle a rendue (Animate
Dead, Dance of the Dead). Le lot a corrigé quatre défauts plus anciens : une force de copie écrite en
SVar (Saw in Half), `Attach | Defined$` sans `Object$`, `SacrificeAll | Defined$` qui aurait tout
sacrifié, la copie à lancer qui ignorait `Valid$` (Isochron Scepter).

**Les modes et les mots-clés, III** (lot F48, `js/forgeModes.js`, `js/forgeMotsClesF.js`) :

| Mécanique | Ce que le moteur en fait | Cartes |
|---|---|---|
| Spree, Tiered, Escalate | Le coût des modes choisis s'ajoute après les cibles, comme Strive. Trop cher, les derniers modes sont lâchés tant qu'il en reste assez. L'IA ne prend que les modes qu'elle peut payer. | Return the Favor, Restoration Magic, Collective Resistance |
| Les Sièges | Le mode choisi en entrant reste sur la carte (`choixDe(P, o).mode`), et `ChosenModeJeskai` le lit. | Windcrag Siege, Frostcliff Siege |
| Flashback, Evoke autrement qu'en mana | Sacrifier trois créatures, payer 3 points de vie, exiler une carte verte de sa main. | Dread Return, Deep Analysis, Endurance, Solitude |
| Classes | Un niveau peut accorder un remplacement, qui ne vaut qu'à ce niveau (`remplacementsEnJeu()`). | Innkeeper's Talent, Artist's Talent |
| Afflict, Dethrone, Ravenous | Des déclencheurs synthétiques. Ravenous lit le X payé pour le permanent. | Neheb, Treasonous Ogre, Jacked Rabbit |
| Web-slinging, Freerunning, Harmonize | Des façons de lancer. Harmonize sans la réduction par une créature engagée : une façon légale de payer, la plus chère. | Spider-Sense, Overpowering Attack, Nature's Rhythm |
| Impending | Des marqueurs temps, et pas une créature tant qu'il en reste (`animation()`). | Overlord of the Hauntwoods |
| Soulbond | La paire tient tant que les deux sont en jeu chez le même contrôleur ; rien à défaire quand l'un part. | Deadeye Navigator, Tandem Lookout |
| Harness | Un attribut que `harnessed` lit. | The Soul Stone |

Compleated est accepté sans effet : le moteur ne paie jamais le mana phyrexian en vie, la
planeswalker entre donc toujours avec tous ses marqueurs. Restent refusés : Necromancy (`MayFlashSac`),
Paradigm, Alchemist's Talent (le mana d'un Trésor), Fighter Class (`MustBlock` d'un attaquant désigné),
Scourge of the Throne (« for the first time each turn »).

**Sept cartes demandées** (lot F49, `js/forgeDesignes.js`).
- *Chandra's Ignition*, « each other creature » : `NotDefinedTargeted`, un filtre qui écarte ce qu'une
  désignation nomme.
- *Sanar, Innovative First-Year* : choisir parmi des objets désignés et filtrés
  (`ChooseFromDefined$ Remembered.White`).
- *Eshki, Temur's Roar* : la force du sort qui déclenche.
- *Chandra, Torch of Defiance* : `ShowCardToActivator$`, un simple affichage, accepté sans effet.
- *Smuggler's Surprise*, *Stump Stomp*, *Collective Resistance* étaient déjà comprises ; des tests en
  partie le confirment.

Deux défauts plus anciens corrigés :
- sans `FoundDestination$`, `DigUntil` envoyait en main la carte trouvée ; chez Forge, elle suit les
  cartes révélées (Balustrade Spy met tout au cimetière, terrain compris) ;
- « you may cast that card » (`Play | ValidSA$ Spell`) laissait jouer un terrain : Chandra jouait le
  terrain exilé au lieu d'infliger ses 2 blessures.

**Forge bouge** (lot F50, `js/forgeAlias.js`). Le 15 novembre 2026 (commit `50b6a8f`), Forge a
renommé les `Pump` qui n'étaient pas des pompes en quatre effets : `TargetOnly` (choisir une cible que
la suite lit), `Bookkeeping` (retenir, oublier, imprimer), `EndOfTurn` (sacrifier ou exiler à
l'étape de fin), `Nothing` (un nom de mode, un `UnlessCost$`). Sur un appareil à jour, quatre cents
cartes, Stump Stomp en tête, devenaient partielles ou injouables. Ces effets sont des alias de Pump,
recopiés avec ses enveloppes et ses paramètres connus, la pompe en moins : ces scripts se jouaient
hier sous ce nom, ils se jouent de la même façon. Seul ajout : `RememberAll$` / `RememberZone$`
(Patriarch's Bidding, écrit auparavant `PumpAll | RememberPumped$`). La leçon : l'appareil de
l'utilisateur lit le Forge du jour, le banc doit mesurer la même copie — un renommage chez Forge se
voit d'abord comme une chute de la mesure (ici 80,6 → 79,8 % des cartes complètes).

**Onze cartes demandées** (lot F51, `js/forgeActivations.js`, `js/forgeChoixMultiples.js`). Chaque
carte manquait d'un élément :
- *Human Torch*, la mise sous tension (`PowerUp$`) : une fois par objet, comme Exhaust, et moins chère
  de son coût de mana le tour où il entre — `capacitesDe()` rend ce tour-là une copie au coût réduit ;
- *Blue Mage's Cane*, lancer la copie pour {3} (`PlayCost$`) ;
- *Inga and Esika*, le mana venu de créatures : `paieMana()` retient sur le sort ce que chaque genre de
  source a donné ;
- *Spider-Man 2099*, `Count$YourTurns` ;
- *Consuming Tide*, chacun choisit l'un de ses permanents (`ControlledByPlayer$ Chooser`), et le compte
  des adversaires mieux pourvus en main ;
- *Cultivator Colossus*, `Repeat | RepeatDefined$` ;
- *Explore the Vastlands*, `DigMultiple` ; chez Forge, `Spell` hors de la pile veut dire éphémère ou
  rituel ;
- *Sensational Spider-Man*, des marqueurs retirés un à un parmi plusieurs permanents ;
- *Shuri*, une copie non légendaire d'un modèle ciblé ;
- *The Wondrous Wasp*, `Duration$ AsLongAsInPlay` ; *Conjurer's Mantle*, `sharesCreatureTypeWith
  TriggeredAttacker`.

Deux défauts plus anciens corrigés en chemin :
- **une cible « que contrôle le joueur défenseur »** (`ValidTgts$ Creature.ControlledBy
  TriggeredDefendingPlayer`) n'était jamais trouvée : le filtre se jugeait sans l'évènement. Elle est
  réécrite en `TargetsWithDefinedController$`, que le choix des cibles juge avec lui. Trente-quatre
  scripts l'écrivent ainsi ;
- **l'IA jugeait amical « exiler une carte ciblée d'un cimetière »**, et ne visait donc jamais le
  cimetière adverse.

**Cinq cartes demandées, et une couverture plus honnête** (lot F52). Chacune manquait d'un élément :
- *Raise the Palisade*, le filtre `IsNotChosenType` ;
- *Run Away Together*, `TargetsWithDifferentControllers$` : une cible par joueur. Le choix des cibles
  range les candidats en tournante d'un joueur à l'autre — la réponse par défaut respecte donc la
  restriction —, refuse un choix que la restriction a réduit sous le minimum, et `effetCiblable()` compte
  les joueurs, non les créatures : sans créature adverse, le sort n'est pas proposé ;
- *Master of Barbs*, le mode `DamageAll`, jugé comme `DamageDone` et joué une fois par lot
  (`MODES_PAR_LOT`) ;
- *Ashcloud Phoenix*, `ChangeZone | FaceDown$` : l'objet entre par `metEnJeu()` face cachée, comme un
  manifesté, et se retourne pour son coût de Morph ;
- *Hands of Binding*, `KW$ HIDDEN This card doesn't untap during your next untap step.` : le drapeau
  `o.exerce` que consomme `degagement()`, sans bonus posé.

**`KW$` ne se perd plus en silence.** `motsForge()` ne connaît que dix-sept mots simples ; tout autre
`KW$` d'une pompe était jeté, et la carte passait pour complète en perdant un morceau de son texte
(Hands of Binding, mais aussi « can't block »). La couverture compte désormais chaque valeur
(`kwval:…`) ; `forgeSait('kwval', …)` inscrit ce que le moteur lit. Sur un échantillon de huit cent
soixante cartes tirées des éditions récentes, huit cartes sont repassées de complète à partielle ou
injouable, toutes à raison.

**Les suites qui dépendent de ce qui vient de se passer** (lot F53). Trois cartes, trois façons de lire
le résultat de l'effet précédent :
- *Divert Disaster*, `UnlessResolveSubs$ WhenPaid` : la suite d'un « unless pays » ne se joue que si le
  coût a été payé (`WhenNotPaid` pour l'inverse). `executeForge()` coupe la chaîne par `ctx.coupe`, comme
  pour un coût refusé ;
- *Unravel*, `Targeted$CastTotalManaSpent` : le sort contrecarré change d'objet en quittant la pile, et son
  mana dépensé ne le suit pas. `Counter` en garde donc un instantané dans `P.lkis`, que `caracForge()`
  lit ; sur la pile, la valeur de mana compte X pour ce qu'on a payé. Un sort lancé sans payer a dépensé
  zéro ;
- *Orbital Plunge*, `DealDamage | ExcessSVar$` : l'excès — les dégâts réellement infligés moins ce qu'il
  fallait pour tuer, endurance moins blessures marquées, ou loyauté — se range dans `ctx.vars`, que lit
  `ConditionCheckSVar$`. Un joueur n'a pas de seuil. Le Lander est un jeton comme les autres.

**Les copies qui attaquent, et le départ conditionnel** (lot F54). Trois cartes autour du jeton qui entre
engagé et attaquant, puis part à l'étape de fin :
- *Redoubled Stormsinger*, `CopyPermanent | TokenTapped$ | TokenAttacking$` : la copie réutilise
  `entreAttaquant()`, celle de `Token | TokenAttacking$` — dans le combat en cours, contre le défenseur de la
  source, sans être déclarée, donc sans déclencheur d'attaque ;
- *Electroduplicate*, `AtEOTTrig$ Sacrifice` : le même départ que `AtEOT$`, que le jeton porte comme
  capacité chez Forge ;
- *Tilonalli's Summoner*, `Token | AtEOTCondition$ Y` : le départ garde la face, le contrôleur et la
  source (`o.finEtapeSi`), et `copiesFin()` juge la SVar à l'étape de fin ; fausse, le jeton reste et le
  départ est oublié. `Count$Blessing.0.1` se lit comme les autres formes `a.b`.

Un coût payé au milieu d'une chaîne (`AB$ Token | Cost$ X R` dans un déclencheur, `coutInterne`) payait
X à zéro : X se choisit désormais au moment de payer (question `x`, par défaut le maximum), alimente
`Count$xPaid` et se paie par `paieMana()`.

**Exiler le dessus, lancer gratuitement, et Paradigm** (lot F55, `js/forgeParadigme.js`) :
- *Muse Vortex*, `ChangeZoneAll | ForgetChanged$` : ce qui vient de bouger n'est plus retenu, si bien que
  la table suivante ne vise que le reste ; `RandomOrder$` tire l'ordre du dessous de la bibliothèque ;
- *Improvisation Capstone*, `DigUntil | MinTotalCMC$` : on s'arrête quand la valeur de mana de ce
  qu'on a trouvé atteint le seuil, non quand on en a trouvé un nombre ; avec ce seuil,
  `RememberRevealed$` retient aussi les cartes trouvées. Les artefacts et les créatures exilés sont des
  sorts : `Play` les lance gratuitement comme les autres ;
- **Paradigm**, un rebound qui ne s'épuise pas : la première résolution exile la carte et la marque
  (`o.paradigme`, posé par `resoudre()`, voulu par `exileApresResolution()`), et le début de la première
  principale de son propriétaire propose une copie gratuite (`paradigmesDebutPrincipale()`, appelée par
  `etape()`). La copie est un jeton de sort, comme celle de Cipher : elle disparaît, la carte reste.

`js/forgeEffetsA.js` dépassait trois cents lignes : la porte `executeForge()` et ce qui la sert
(`paieUnlessForge()`, la mémoire de la carte, les paramètres qui retiennent) sont passés dans
`js/forgeExecute.js`.

**Une offre tentante** (lot F56). *Tempt with Vengeance* — et toute la famille « Tempt with… » — tient
dans `RepeatEach | RepeatOptionalForEachPlayer$` : chaque joueur de la boucle répond pour lui seul
(question `oui`, posée à l'adversaire, pas au lanceur ; l'IA accepte), et celui qui refuse ne passe pas
par la sous-capacité. Le compte des accepteurs se fait par `StoreSVar`, dont la valeur doit passer
**avant** la SVar écrite (`Y: Number$0`) : `forgeNombre()` lisait l'écrite d'abord, si bien que le
compte restait à zéro ; il suit désormais l'ordre de `forgeExpression()`. Autre manque : l'opérande
d'une opération (`/Times.Y`) peut être le nom d'une SVar, non seulement un nombre.

**Le mana qui porte quelque chose** (lot F57, `js/forgeManaC.js`). Un mana peut donner au sort qu'il
paie. Comme `AddsNoCounter$` (le mana de Cavern of Souls), la source le sait à la construction de sa
capacité, et `paieMana()` le transmet au sort (`manaPorte()`) : le sort retient les sources qui l'ont
payé (`manaDeSources`) et le mot-clé reçu (`motsPortes`). Le mana flottant déjà en réserve ne porte rien.
- *Carnelian Orb of Dragonkind*, `AddsKeywords$` + `AddsKeywordsValid$` : si le sort répond au filtre
  (jugé comme une restriction de mana, `manaPermis()`), le permanent entre avec le mot-clé jusqu'à la
  fin du tour (`resoudre()`). Un mot-clé hors de `MOTS_ANGLAIS` ou une durée autre que `UntilEOT`
  laisse la capacité non construite ;
- *Forger's Foundry*, `TriggersWhenSpent$` : un déclencheur ordinaire de la source (`ec.viaMana`) que seul
  un sort payé de son mana déclenche. Son effet pose un remplacement optionnel, « exile le sort au lieu
  du cimetière » : les remplacements « exil » sont désormais regroupés (`exilsApplicables()`), un
  `Fizzle$ False` ne vaut qu'à la résolution (`o.resolu`, un sort contrecarré va au cimetière), un
  `Optional$ True` se demande à la résolution (`remplacementsOptionnels()`), et `ExiledWithEffectSource$`
  range la carte exilée parmi celles de la source (`o.exileAvec`, lu par `deplace()`), que le second
  pouvoir retrouve par `ExiledWith`.

**Le mana qui coûte du mana** (lot F58, `js/jeuManaFiltres.js`). *Grinning Ignus* (« {R}, renvoyez-le en
main : ajoutez {C}{C}{R}, comme un rituel »), les terrains-filtres (Mystic Gate, Twilight Mire…),
Cabal Coffers, Pili-Pala : une capacité de mana dont le coût demande du mana. Le solveur de
`js/jeuMana.js` n'apparie que des sources sans coût de mana, et il est resté tel quel — c'est ce qui
garantit qu'un paiement qui réussissait réussit à l'identique : un test différentiel, quatre cents
plateaux et coûts tirés au hasard contre le moteur d'avant, rend les mêmes plans, les mêmes réserves
et les mêmes terrains engagés. Le filtre n'entre en jeu que si le solveur échoue :
- **le plan** : on essaie un filtre, puis deux, avec chacune de leurs options. Ce que le filtre produit
  réduit le besoin (`coutMoins()`), ce qu'il coûte s'y ajoute, et le solveur paie le tout avec les
  sources simples, hors le permanent du filtre (`EXCLUS_MANA`). Le coût du filtre n'est donc jamais payé
  avant l'assurance du paiement ;
- **l'exécution** (`paieMana()`) : les sources simples versent leur mana, puis chaque filtre s'active —
  engagé, renvoyé en main (`Return<1/CARDNAME>`) — et verse le sien ; le coût des filtres est retiré avec
  celui du sort d'un seul tenant, pour que le générique d'un filtre ne mange pas une couleur dont le sort
  a besoin. Le mana dépensé pour un sort (`manaSort`, Unravel, la convergence) ne compte pas ce que les
  filtres ont dépensé pour s'activer ;
- **le rythme d'un rituel** (`SorcerySpeed$` d'une capacité de mana) : le filtre ne sert qu'en phase
  principale, pile vide.
Profondeur bornée à deux : un filtre qui en nourrit un autre au-delà n'est pas cherché. Deux défauts
plus anciens, vus en chemin : `Combo B G | Amount$ 2` ne donnait que `BB` ou `GG`, jamais `BG`
(`multiensembles()`), et un `Return<1/CARDNAME>` dans un coût de mana faisait refuser la capacité.

**Deux cartes demandées** (lot F59). *Reinforced Ronin* — Haste, retour en main à l'étape de fin,
Channel depuis la main — était déjà jouée de bout en bout ; des parties scriptées le confirment (la
capacité de la main est proposée, défausse la carte et pioche ; lancée, elle attaque puis revient). Seule
*Anzrag, the Quake-Mole* manquait d'un élément : son activation, `Pump | KW$ HIDDEN CARDNAME must be
blocked if able.`, était jetée sans bruit et la carte restait partielle.
- **« Doit être bloqué » pour le tour** : le bonus posé par la pompe porte `doitEtreBloque`
  (`pompeForge()`), et `doitEtreBloque()` (`js/forgeMotsClesD.js`) le lit avec les deux autres sources de
  l'obligation — la carte et une statique. Le bonus tombe au nettoyage comme tout `fin: 'tour'`, et
  l'obligation vaut pour chaque combat du tour, la phase de combat de plus que donne Anzrag comprise ;
- **l'IA** n'activait jamais une pompe hors combat. Une pompe qui impose le blocage vaut maintenant 3 en
  première principale ou au début du combat, pour une créature dégagée qui peut attaquer.

**Les mêmes deux cartes, lues dans l'oracle** (suite du lot F59). Une fiche sans script Forge — l'archive
n'est pas téléchargée, ou la carte n'y est pas — passe par le compilateur d'oracle, et *Reinforced Ronin* y
était **injouable** : la ligne « Channel — {1}{R}, Discard ~ : Draw a card » n'était pas lue, et le mot
« discard » la faisait classer comme contrepartie. Le script Forge ne suffit donc pas à juger une carte :
le banc doit essayer les deux lectures (`definitionDe()` garde la mieux comprise).
- **Channel** : `compileActivee()` ôte l'étiquette et lit le reste comme un coût d'activation ; `discard ~`
  (`defausseSoi`) est un morceau de coût, et la capacité s'active depuis la main (`zone: 'main'`), comme un
  cycle. Un `discard ~` sans « Channel » reste une capacité du champ, que `coutAutrePossible()` ne laisse jamais
  payer ;
- **Anzrag** : « must be blocked this turn if able » est une pompe sans bonus qui pose `doitEtreBloque`
  (`op.impose`, lu par `OPS.pompe`), et « after this combat phase, there is an additional combat phase » une
  opération `phaseSupp` qui partage `ajoutePhase()` avec le `AddPhase` de Forge. Les deux lectures — Forge et
  oracle — jouent la carte à l'identique ; les 127 cartes de la base livrée gardent la même couverture.

**Mesurer sur ce que les joueurs jouent** (lots F60 et suivants). Jusqu'ici on partait des cartes qu'on nous
citait. Le banc part maintenant d'EDHREC : les cent premiers commandants de l'année, leurs pages, soit 7 379 cartes
distinctes, chacune lue avec son script Forge (le dépôt cloné en partie, `forge-gui/res/cardsfolder` et
`tokenscripts`) et sa couverture comptée, pondérée par le nombre de decks. Au départ, 6 063 cartes complètes, 830
partielles, 484 injouables, et une longue traîne : 1 194 éléments manquants différents, dont 853 cartes qui n'en
manquent qu'un. D'où des lots par famille d'éléments, les plus joués d'abord. Le banc rejoue aussi des parties : 500
parties de decks tirés au hasard parmi les cartes complètes, sans une seule erreur du moteur.

**Lot F60 : Channel, protections, filtres** (`js/forgeProtections.js`, `js/forgeFiltresC.js`).
- **`ReduceCost$` d'une capacité** (cinquante cartes) : Boseiju, Otawara, Takenuma, Eiganjo, Sokenzan… coûtent
  {1} de moins par légendaire qu'on contrôle. La capacité garde `reduit` ; `capaciteReduite()`
  (`js/forgeActivations.js`) la rend avec son coût de mana diminué du générique, et trois sites la lisent — les
  actions légales depuis la main et depuis le champ, et `activeCapacite()`. Jamais en dessous de zéro, jamais une
  couleur ; une quantité illisible ne réduit rien ;
- **protection from everything sur un joueur** (Teferi's Protection, The One Ring, The Stasis Coffin) : un
  drapeau de joueur, `J.protTout`, qui tient jusqu'au début du prochain tour de celui qui l'a posé. On ne peut
  plus le cibler (`ciblesLegales()` et `cibleEncoreLegale()` l'écartent), et les dégâts sont prévenus
  (`degatsApresPrevention()`) ; ce qui ne cible pas l'atteint toujours. Teferi's Reproach la donne à l'adversaire
  par une statique d'effet ;
- **`Protection from each color`** : les cinq couleurs de `o.protTemp`, que `ciblable()` lisait déjà (Akroma's
  Will, Eldritch Immunity) ; **`Hexproof:Black`** : `o.hexTemp`, qui n'arrête que les sources adverses de cette
  couleur (Veil of Summer, permanents et joueur) ; le nettoyage les défait ;
- **`CantChangeLife`** : `vieBloquee()` et `vieReduite()` rendent zéro tant qu'une statique la fige (Teferi's
  Protection, Perch Protection, Flare of Fortitude) ;
- **filtres** : `hasABasicLandType`, `ManaCost0` / `ManaCost1`, `doesNotShareNameWith …` et `sharesCreatureTypeWith
  Commander`. Ce dernier se juge sur la partie : `forgeValideDef()` prend `P` en paramètre, que seul le
  déclencheur « sort lancé » lui donne — Path of Ancestry n'a de scry que si la créature partage un type avec le
  commandant.

**Lot F61 : Hideaway, les trois terrains d'Urza, Windfall, Myriad Landscape** (`js/forgeHideaway.js`).
- **Hideaway N** (quinze cartes : Windbrisk Heights, Mosswort Bridge, Spinerock Knoll, Clive's Hideaway…) : un
  déclencheur d'entrée synthétique dont l'effet, `Hideaway`, regarde le dessus, exile une carte (celle de la
  source, `ExiledWith`) et met le reste dessous dans un ordre tiré. L'activation du terrain est un script ordinaire :
  `Play | Defined$ ExiledWith`, sa condition jugée à la résolution (puissance totale, légendaires, attaquants) ;
- **`Count$UrzaLands.3.1`** : trois si l'on contrôle la Mine, la Centrale et la Tour, un sinon ;
- **`HighestValidGraveyard,Library,Exile`** (Windfall, Jace's Archivist, Whispering Madness) : les zones se
  comptent ensemble, joueur par joueur — chacun pioche autant que la plus grosse main défaussée ;
- **`ShareLandType$`** (Myriad Landscape) : la première terre se choisit librement, la seconde parmi celles du même
  type de base.

**Lot F62 : des déclencheurs, la radiation, l'Anneau** (`js/forgeDeclencheursD.js`, `js/forgeRadiation.js`,
`js/forgeAnneau.js`).
- **`TokenCreated`** (Mirkwood Bats, Rosie Cotton) : l'évènement d'entrée d'un jeton, jugé sur son joueur et son
  filtre ;
- **`Drawn | FirstCardInDrawStep$`** (Orcish Bowmasters, Xyris, douze cartes) : `piocheN()` note le rang de la carte
  dans l'étape (`J.piocheEtape`) ; la première de l'étape de pioche ne déclenche pas, toute autre si. Une pioche du
  début de partie n'est pas une pioche d'étape ;
- **« one or more »** (`SacrificedOnce`, `LifeLostAll`, `MilledAll`) : un seul déclenchement par lot d'évènements,
  par `P._lot` ; `ResolvedLimit$` limite par tour (`P.limitesTour`) ;
- **meuler** : `deplace()` marque une carte meulée (`opts.meule`), que `Milled` et `MilledAll` reconnaissent ; une
  carte mise au cimetière d'une autre façon n'est pas « meulée » ;
- **la radiation** : `Radiation | Num$` donne des marqueurs ; au début de sa première principale, un joueur meule
  autant de cartes, perd 1 vie et retire un marqueur par carte qui n'est pas un terrain (règle 727). Dix-huit
  cartes (The Wise Mothman, Nuclear Fallout, Glowing One…) ;
- **l'Anneau, niveaux 2 à 4** : jusqu'ici seul le premier niveau était joué. Les trois autres sont écrits comme un
  script de Forge (`NIVEAUX_ANNEAU`), compilés une fois et posés, au passage du niveau, en effet permanent du joueur
  (piocher puis défausser en attaquant ; le bloqueur sacrifié à la fin du combat ; 3 vie perdus par chaque
  adversaire sur un dégât de combat). `IsRingBearer` désigne le porteur. `RingTemptsYou` est aussi un déclencheur
  (Call of the Ring).

**Lot F63 : copies, clones, « activate only if »** (`js/forgeCopies.js`, `js/forgeActivations.js`).
- **`Clone`** devient une capacité à cible : Thespian's Stage copie un terrain, Shifting Woodland une carte de son
  cimetière. `NewName$` (Sarkhan, Soul Aflame), `AddTypes$ Legendary` (un supertype, non un sous-type),
  `SetColor$`, `SetCreatureTypes$` (qui remplacent la couleur et les types de créature, et gardent les sous-types de
  terrain ou d'artefact) et `GainThisAbility$` (la copie garde la capacité qui vient de s'activer : retrouvée dans la
  définition par l'identité de son opération). `CopyPermanent` lit les mêmes `SetColor$` et `SetCreatureTypes$`,
  plus `AtEOTCondition$` (Sauron, the Necromancer : le jeton ne part pas si Sauron porte l'Anneau) ;
- **`Activation$`** (une quarantaine de cartes : Delirium, Threshold, Metalcraft, Hellbent, la bénédiction) : « activate only
  if… », jugé par la table de `Condition$`. Une condition qu'on ne connaît pas écarte la capacité, et une capacité de mana
  soumise à `Activation$` n'est pas jouée du tout — le planificateur de paiement ne sait pas la juger, et la jouer
  donnerait du mana qu'on n'a pas le droit de produire ;
- **`sharesCreatureTypeWith` seul** (Coat of Arms, Mana Echoes, Alpha Status, Locket of Yesterdays) : le type partagé
  avec la source du filtre, c'est-à-dire la créature à laquelle le bonus s'applique.

**La couverture lit désormais les filtres des comptes.** Un `SVar:X:Count$Valid Card.Self+IsRingbearer` n'était
pas examiné : Sauron, the Necromancer passait pour complet alors que la propriété (`IsRingbearer` — Forge l'écrit
ainsi) n'était pas jugée, et le jeton partait toujours. `expressionsDe()` relève les propriétés du filtre d'un
`Count$Valid` et suit `Count$Compare X …` jusqu'à la SVar `X`. Quatorze cartes sont repassées de complètes à
partielles ou injouables, toutes à raison ; Coat of Arms, Mana Echoes et Alpha Status l'ont aussitôt été de nouveau
en jouant.

**Lot F64 : les interdictions de combat du tour, l'eminence, Aurelia, Thriving** (`js/forgeEffetsC.js`,
`js/forgeDeclencheursD.js`). La liste qui reste est dans [doc/couverture-edhrec.md](doc/couverture-edhrec.md).
- **`KW$ HIDDEN CARDNAME can't block.`** (cent seize scripts) **, `can't attack`, `can't attack or block`, `All
  creatures able to block CARDNAME do so`** : la pompe pose le drapeau dans le bonus du tour (`CACHES_DU_TOUR`), que
  `car()` lit pour `nePeutAttaquer` et `nePeutBloquer`, et `bloqueursImposes()` pour l'attirance ;
- **`Activation$` sur une capacité de mana** (Mox Opal, Metalcraft) : `sourcesMana()` demandait déjà
  `activationInterdite()` à chaque capacité de mana, et le drapeau `activation` y répond maintenant ; seule la
  condition inconnue écarte la capacité ;
- **`Attacks | FirstAttack$`** : chaque attaque porte son rang pour le permanent, ce tour (`o.attaquesTour`) ;
  Aurelia déclenche une fois, la phase de combat de plus (F59) ne la déclenche pas deux fois.
  **`CheckDefinedPlayer$ TriggeredDefender.withMostLife`** (Scourge of the Throne) se juge sur le défenseur de l'attaque ;
- **`TriggerObjectsAttackers$Amount`** (The Ur-Dragon) : le nombre d'attaquants qui répondent au filtre du
  déclencheur, gardé sur l'évènement à la décision ;
- **l'eminence** : les statiques `EffectZone$ Battlefield,Command` d'un commandant agissent depuis sa zone
  (`statiquesEnJeu()`), pour les réductions et hausses de coût ;
- **`Exclude$`** de `ChooseColor` (les dix terrains Thriving) ; **`Proliferate | Amount$`** et le déclencheur
  `Proliferate` (Ezuri).

**Lot F65 : permissions de jeu et coûts alternatifs** (`js/forgeCoutsC.js`). Seize cartes de plus :
- **`MayPlayAltManaCost$ PayLife<ConvertedManaCost>`** (Bolas's Citadel, Valgavoth, Nashi, Gwenom, Inside Information) :
  `coutPermis()` rend un coût de mana vide et `autrePermis()` y ajoute la vie égale à la valeur de mana ; `$ 0`
  rend le sort gratuit. Les autres valeurs (`PayEnergy`, `Waterbend`, un mana précis) restent refusées ;
- **`OnlyFirstSpell$`** (Conduit of Ruin, Serah Farron) : la réduction ne vaut que si aucun sort de même genre n'a
  été lancé ce tour ;
- **`AlternativeCost` accordé par un permanent** (Fist of Suns, Rooftop Storm, Leyline of Mutation) : une variante
  `alt1xx` de plus par statique qui convient (`variantesEtendues()`), avec `CheckSecondSVar$` (Submerge, Mogg
  Salvage : deux conditions) ;
- **`ReduceCost` / `RaiseCost` des capacités** (Silver-Fur Master, Fluctuator, Blossoming Tortoise, Tithe Taker,
  Power Artifact) : `capaciteReduite()` ajoute ce que disent les statiques du coût de mana de l'activation, avec
  `MinMana$` ; le cycle et le ninjutsu se reconnaissent à leur capacité ;
- **flash** : les capacités de loyauté de Teferi, Master of Time et de The Wandering Emperor s'activent quand on
  pourrait lancer un éphémère (`loyauteEclair()`) ; `Spell.IsTargeting Valid …` (Timely Ward, Flash Photography)
  donne le flash dès qu'une cible de ce genre existe, **sans vérifier que la cible choisie en est une** —
  simplification annoncée. `flashAccorde()` ne prend plus une statique de loyauté pour un flash de sort.

**Lot F66 : des paramètres d'écoute** (`js/forgeDeclencheursE.js`). Vingt-cinq cartes de plus :
- **`ResolvedLimit$`** : déjà réécrit en limite d'activation pour tout déclencheur (F52) ; il ne restait qu'à le dire
  connu des modes « once » qui le portent ;
- **`FirstCombat$`** (Genji Glove, Hexplate Wallbreaker, Karlach) : la première phase de combat du tour ; la phase de
  plus que donnent ces cartes n'en redéclenche donc pas une troisième ;
- **`Threshold$`, `Metalcraft$`, `Blessing$`, `Hellbent$`** écrits comme paramètres du déclencheur (Kiora, Twilight
  Prophet, Inventors' Fair) : `conditionForge()` les juge comme la condition de même nom. **`FirstUpkeep$`** (Paradox
  Haze) : le rang de l'étape d'entretien dans le tour (`P.entretiensTour`), et l'étape qu'il sous-entend ;
- **`ValidSAonCard$`** d'un sort lancé : le sort lui-même répond à un filtre (« same name as a card in their
  graveyard », Dragonlord Kolaghan) ou a coûté moins de mana que sa valeur (`Spell.ManaSpent LTX`, Ancient
  Cellarspawn) ;
- **`ExcludedOrigins$`**, **`Phase$ BeginCombat->EndCombat`** d'un `ChangesZone` (The Lost and the Damned, The Blue
  Spirit) ; **`ValidPlayer$`** de `Discarded` et de `LandPlayed` (Sangromancer, Shanid) ;
- **Panharmonicon** : `ValidActivator$` et `ValidPlayer$` (Veyran, Dr. Beverly Crusher) ; **`ImmediateTrigger |
  RememberSVarAmount$`** (Ancient Brass Dragon : « roll a d20. When you do… X ») garde le résultat du dé pour le
  déclencheur réflexe. Restent : le doublement d'un déclencheur de sort sur la pile (`ValidZone$ Stack`).

**Lot F67 : choisir, défausser, répéter, sacrifier** (`js/forgeChoixC.js`). Trente et une cartes de plus :
- **`ChooseType | ValidTypes$`** (Eclipsed Realms, Cloud Key, Gollum) : le type se choisit dans la liste. `ChosenType`
  juge aussi un type de carte (« spells of the chosen type »), et `forgeValideDef()` reçoit la source du filtre pour
  que la réduction de coût d'un Cloud Key lise son propre choix ;
- **`Discard | UnlessType$`** (Thirst for Knowledge, Bandit's Talent) : si la main a une carte de ce type, on demande
  si l'on défausse celle-là au lieu de N ; **`Optional$`** se pose à chaque joueur désigné (Snort : « each player may
  discard their hand »), et **`RememberDiscardingPlayers$`** retient ceux qui l'ont fait, pour que `Draw` et
  `DamageAll` ne visent qu'eux ;
- **`RepeatEach | DefinedCards$`** (Curse of the Swine, Terastodon, Rampage of the Clans) : la boucle porte sur les
  objets désignés ; **`ChooseOrder$`** : le joueur les range un à un, dans l'ordre qu'il veut (Sylvan Library,
  Aetherspouts) ; **`StartingWith$`** : on boucle sur les joueurs à partir de celui qu'on dit ;
- **`ChooseCard` à plusieurs joueurs** : chacun choisit à son tour, en commençant par `StartingWith$` (The Horus
  Heresy, Druid of Purification) ; **`WithTotalPower$`** (Slaughter the Strong) : autant de créatures qu'on veut, de
  force totale bornée — la réponse par défaut garde les plus fortes qui tiennent ;
- **`ChoosePlayer | Random$`**, **`GenericChoice | FallbackAbility$`** (Torment of Hailfire : si aucune offre ne se
  paie, on perd la vie), **`Sacrifice | StrictAmount$`** (tout ou rien : Scorched Ruins), `ChangeNum$` (Glacial
  Chasm) et `ConditionNotPresent$` (Uro, Kroxa : « sacrifice it unless it escaped »), `DestroyAll | Zone$`.
Restent : les modes qu'on annonce ou tire au hasard (`Charm | Announce$`, `Random$`), `SetState | Choices$`, le vote.

**Lot F68 : des quantités de plus** (`js/forgeExprC.js`). Trente-cinq cartes de plus, toutes par `exprEtendue()`,
`caracForge()` et `agregeForge()` :
- **sur le sort lui-même**, en forme `a.b` (« `a` si c'est vrai, `b` sinon ») : `Count$wasCastFromExile` (la zone
  d'où il a été lancé), `Count$AltCost` (une variante `alt…`), `Count$IfCastInOwnMainPhase` (`jeuActions.js` garde
  quand : `lanceeEn`), `Count$Metalcraft` ;
- **le tour et les joueurs** : `Count$TotalOppPoisonCounters`, `Count$CreaturesAttackedThisTurn <filtre>` (le rang
  d'attaque posé par F64, `o.attaquesTour`), `Count$Landfall`, `Count$YourCountersRAD` ;
- **des ensembles** : `Count$MostCardName <filtre>` (le plus de cartes de même nom : Mechanized Production),
  `Count$Valid … $CardCounters.P1P1` (Toph : les marqueurs d'un genre sur des terres), et les agrégats
  `$CardNumColors`, `$CardSumPT`, `$CardTypesPermanent`, `$PlaneswalkerType` ;
- **des objets désignés** : `Sacrificed$Valid` (combien de ce qu'on vient de sacrifier répond au filtre),
  `ExiledWith$Amount` et `$CardManaCost`, `ChosenCard$CardManaCost`, `Equipped$CardPower`, `TriggeredSource$…`,
  `TriggeredAttacker$Valid`, `TriggeredActivator$SpellsCastThisTurn`, `TriggerCount$ScryNum`,
  `TriggerObjectsAttackers$CardPower` (la liste des attaquants qui répondent au filtre du déclencheur, gardée sur
  l'évènement à la décision).
Restent : les coûts optionnels payés (`OptionalGenericCostPaid`), le foretell, les activations du tour
(`ThisTurnActivated`), les listes de cartes d'un déplacement groupé (`TriggerObjectsCards`).

**Lot F69 : chercher, creuser, déplacer** (`js/forgeZonesC.js`). Vingt et une cartes de plus :
- **`DigUntil | Tapped$`** (The Ring Goes South, Clifftop Lookout) : la carte trouvée entre engagée ; **`GainControl$`**
  (Sméagol, Atla Palani) : sous le contrôle de celui qui creuse ; **`Dig | Attacking$`** (Owlbear Cub, Winota) :
  elle entre attaquante ; `SkipReorder$` est connu, le moteur ne demandant jamais l'ordre du reste ;
- **`ChangeZone | WithTotalCMC$`** (Protean Hulk, Lively Dirge) : autant de cartes qu'on veut, de valeur de mana
  totale bornée — la réponse par défaut prend les plus chères qui tiennent ; **`RememberSearcher$`** (Tempt with
  Discovery) retient celui qui cherche ;
- **`Manifest | DefinedPlayer$`** (Reality Shift) : le joueur désigné manifeste le dessus de sa bibliothèque ;
- **`ConditionNotPresent$`** passe dans les paramètres communs : tout effet peut le porter (`conditionForge()`, F67).
`ChangeZoneAll | AtEOT$` ne se lit que pour `Sacrifice` et `Exile` : « exile at your next upkeep » (Rally the
Ancestors) reste refusé, plutôt que lu comme un sacrifice.

**Un défaut ancien trouvé par le banc.** Le plafond d'un choix de cibles (`TargetMax$ OneEach`, The Horus Heresy) se
calculait sans la face du script : `Cannot read properties of undefined (reading 'svars')`, deux parties sur cinq
cents. Le descripteur de cible garde maintenant sa face (`maxFace`).

**Lot F70 : les autres filtres** (`js/forgeFiltresD.js`). Quarante et une cartes de plus :
- **ce qu'un effet a choisi, retenu ou visé** : `nonChosenCard` (Mount Doom, Planetary Annihilation : « destroy the
  creatures not chosen »), `TargetedPlayerOwn` et `RememberedPlayerOwn` (Search Warrant, Singularity Rupture),
  `ExiledWithEffectSource`, et la **tête `TargetedCard`** (Maelstrom Pulse, Legions to Ashes : la carte visée
  elle-même — `Self` y désigne cette carte, non la source du sort) ;
- **la carte** : `withToxic`, `withFlashback`, `cmcEven`, `equalPT`, `hasManaAbility`, `hasAbility
  Activated.hasTapCost`, `basePowerEQ0` et `baseToughness…`, `totalPT_LE5` (Cut Down), `powerNOTbasePower`,
  `greatestCMC_Artifact`, `sharesPermanentTypeWith`, `TopGraveyardCreature` (Shallow Grave : la dernière créature du
  cimetière), `EnchantedBy Aura.YouCtrl`, `bargained`, et le sous-type `Urza's` (une apostrophe dans un sous-type) ;
- **le plateau** : `ControllerControlsMoreLand`, et `Player.withMoreLandsThanYou` par le crochet
  `proprieteJoueurEtendue()` que `forgeValideJoueur()` appelle pour ce qu'il ne connaît pas.
Restent : le décomposé (`withDecayed`), les enquêtes résolues (`IsSolved`), `EACH Forest & Plains`.

**Lot F71 : les filtres du tour** (`js/forgeFiltresD.js`). Vingt-six cartes de plus, toutes sur ce que le moteur note
déjà ou note désormais :
- **d'où une carte est entrée** : `ThisTurnEnteredFrom_Graveyard`, `_Battlefield`, `_Library` (Celes, Samwise, Captain
  N'ghathrod), jugés sur `P.entresTour` ; **`milledThisTurn`** (The Master, Transcendent) : `deplace()` marque la carte
  meulée (`o.meuleTour`) ;
- **comment un sort a été lancé** : `wasCastFromTheirHand` (Ghostly Pilferer, Drannith Magistrate : le sort venait de la
  main de qui le lance), `CastSa Spell.MayPlaySource`, `Spell.ManaFromTreasure`, `Spell.ManaSpent EQ0` ;
- **le combat** : `attackingYou` (le défenseur est vous, ou un planeswalker qui vous appartient), `attackedThisCombat`,
  `dealtCombatDamageThisTurn You` (l'historique du tour garde qui a blessé quel joueur au combat) ;
- **le déclencheur** : `TriggeredAttacker`, `TriggeredNewCard`, et la tête de joueur `OppNonTriggeredTarget` (Parapet
  Thrasher : « each other opponent » — ni vous, ni le joueur que le déclencheur vise).
Restent : `TriggeredCards` (un lot de cartes), `hadToAttackThisCombat`, `blockedBySourceLKI`, les dégâts cumulés
d'une source (`wasDealtDamageThisTurnBySource GE10`).

**Lot F72 : des quantités sur les joueurs** (`js/forgeExprD.js`). Cinquante-sept cartes de plus. `PlayerCount<qui>$<quoi>`
compte ou somme une propriété sur un groupe de joueurs :
- **le groupe** : tous, les adversaires, les joueurs retenus (`Remembered`), leurs propriétaires, ceux que désigne
  `Defined<…>` (`Registered` : tous), le contrôleur seul (`PropertyYou`) ;
- **la quantité** : `HighestLifeLostThisTurn` (Y'shtola, Bloodchief Ascension, Knight of the Ebon Legion),
  `LifeLostThisTurn`, `LifeTotal`, `CardsIn…`, `CardsDrawn`, `Counters.Poison`, `RingTemptedYou`, `LandsPlayed`,
  `SacrificedThisTurn` — lues chez un joueur par `quantiteJoueur()`, que ce fichier étend ;
- **`HasProperty<propriété> [GE1]`** : combien de joueurs l'ont (`LostLifeThisTurn`, `isMonarch`, `controlsCreature`,
  `withMoreCreaturesThanYou`, `wasDealtCombatDamageThisTurnBy Zombie GE1`…), et **`ConditionGE2 CardsDrawn`** :
  combien en ont au moins deux (Smuggler's Share) ;
- **un joueur désigné** : `TargetedController$…`, `TriggeredDefendingPlayer$…`, `TriggeredTarget$…` ;
- **le tour** : `Count$LifeYouLostThisTurn`, `Count$MaxOppDamageThisTurn` (Spinerock Knoll),
  `Count$NonCombatDamageThisTurn` — l'historique du tour garde les dégâts reçus par joueur et ceux qu'un
  contrôleur a infligés hors combat — `Count$YourStartingLife` (`J.vieDepart`), `DungeonsCompleted$Amount`.
Restent : la vie perdue au tour précédent (`LifeLostLastTurn`), `HighestValid` / `LowestValid` sur les joueurs, les
dégâts reçus « la dernière fois », `lifeGTX`.

**Lot F73 : les désignations** (`js/forgeDefiniC.js`). Vingt-huit cartes de plus, par `definisEtendus()` :
- **le combat** : `TriggeredDefender.Opponent` et `TriggeredAttackedTarget` (Hellrider, Myr Battlesphere, Raid
  Bombardment : seul le défenseur qui est un adversaire compte) ;
- **ce qu'on vient de sacrifier** : `Sacrificed`, `SacrificedCards` (les instantanés de `ctx.sacrifies`) ;
- **`Spawner>TriggeredTarget`** (Dokuchi Silencer, Biting-Palm Ninja) : le déclencheur réflexe garde l'évènement de son
  parent, le préfixe ne change donc rien à ce qu'il désigne ;
- **des joueurs choisis par propriétés** : `Player.EnchantedBy` (Fraying Sanity), `Opponent.IsCorrupted` (au moins trois
  marqueurs de poison), `Player.lifeEQ13`, `Player.controlsCreature.powerGE4_GE1` (au moins une créature de cette
  force), `controlsCreature.attacking` — des propriétés de joueur que `proprieteJoueurEtendue()` apprend ;
- `ValidLibrary`, `ValidStack`, `ExiledWithSource`, `NextPlayerToYourRight`, un filtre d'objet écrit seul (`Creature.YouCtrl`).
Restent : `Convoked`, `TriggeredCards` et les listes d'un déplacement groupé (`ExiledCards`, `DiscardedCards`), `.Chosen,You`
(une liste de joueurs à la place d'un seul), `Caster`.

**Lot F74 : des statiques refusées** (`js/forgeStatiquesC.js`). Treize cartes de plus ; ici la couverture ne dit pas ce qui
manquait — `construction:Continuous` cache n'importe quelle propriété —, il a fallu lire la ligne qui échouait pour chaque
carte :
- **`K:Hexproof:<filtre>`** (Breaker of Creation : de chaque couleur ; General Ferrous Rokiric : des monocolores ; Elenda :
  des éphémères) : `def.params.hexproofDe`, que `ciblable()` juge contre la source adverse ;
- **`ValidAfterStack$ Spell.cmcGE4`** (Glarb, Thundermane Dragon, Nahiri) : on joue d'en haut de la bibliothèque, mais les
  sorts seulement s'ils répondent au filtre — les terrains passent toujours ;
- **`Mode$ CantDraw`** (Narset, Parter of Veils : « your opponents can't draw more than one card each turn » ; Mornsong
  Aria) : `piocheInterdite()`, que `piocheN()` demande avant chaque carte, compte les cartes déjà piochées ce tour ;
- **`MayPlay` avec `EffectZone$ Exile,Graveyard`** (Squee, the Immortal).
Ce qui reste dans ce lot, et pourquoi : l'équipement payé en vie (`Equip:2 PayLife<2>`), les gardes qui coûtent des
marqueurs de saignée (`Ward:Blight<2>`), les attaques interdites sur un joueur déjà attaqué (Bloodthirster), les
déclencheurs accordés à tout un camp (`AddTrigger`, Tyvar, Danny Pink), les effets dont les statiques portent leurs
propres déclencheurs (`Effect | Triggers$`, Osteomancer Adept).

**Lot F75 : les mots-clés, IV** (`js/forgeMotsClesG.js`). Vingt-sept cartes de plus :
- **posés pour le tour** : `KW$ Fear`, `Intimidate`, `Skulk` (Shizo, Aphotic Wisps), « power and toughness are
  switched » (Twisted Image, Inversion Behemoth, Myr Quadropod), `Prevent all damage that would be dealt by CARDNAME`
  — des drapeaux du bonus (`CACHES_DU_TOUR`) que `peutBloquer()`, `car()` (l'échange se fait après tous les bonus) et
  `degatsApresPrevention()` lisent ;
- **imprimés** : « prevent all combat damage that would be dealt to [and dealt by] CARDNAME » (Guard Gomazoa, Fog Bank),
  « can't attack or block » (Grakk), **Training** (un déclencheur synthétique, « greater power » jugé par `powerGTX`),
  **Undaunted** (`coutsForge()` : un de moins par adversaire), **Gravestorm** (une copie par permanent mis au cimetière
  ce tour) ;
- **sans effet en jeu** : Companion (la simulation n'a pas de réserve), `DeckLimit`, « a deck can have any number of
  cards named… », « can be your commander » : des règles de construction, acceptées pour qu'elles ne fassent pas
  passer une carte pour partielle.
Restent : Suspend accordé, Read ahead, Champion, les mots-clés d'un autre jeu (Firebending, Beam me up), Mutate.

**Lot F76 : le mana** (`js/forgeManaC.js`). Quatre cartes de plus, et deux qui n'étaient complètes qu'en apparence :
- **`LoseMana | ReplaceWith$ ConvertMana`** (Kruphix, Horizon Stone, Omnath) : une forme de remplacement `manaIncolore` ;
  `videReserves()` garde alors tout le mana du joueur, devenu incolore, au lieu de le perdre ;
- **`AddsCounters$ Card.Creature_P1P1_1`** (Biophagus) : le mana porte, comme les mots-clés de Carnelian Orb, des
  marqueurs que le sort payé reçoit en entrant (`o.marqPortes`, appliqués par `js/jeuPile.js`) ; une quantité en SVar
  (Opal Palace) reste refusée ;
- **une capacité de mana qui défausse** (Lion's Eye Diamond, Diamond Lion : « discard your hand ») était lue mais ne
  pouvait jamais payer : le planificateur de `sourcesMana()` écarte tout coût de défausse. Elle est désormais refusée
  à la construction, et la carte passe de complète à partielle — la couverture était fausse.
Restent : les coûts à X ou en marqueurs (Hazel of the Rootbloom, Crucible of the Spirit Dragon, Wall of Roots), le mana
d'un permanent sacrifié (Squandered Resources), le mana réservé au combat (Avatar Roku).

**Lot F77 : marqueurs et dés** (`js/forgeMarqueursC.js`). Treize cartes de plus :
- **`Amass | RememberAmass$`** (Foray of Orcs, Grishnákh, Widespread Brutality) : l'armée qui reçoit les marqueurs se retient,
  pour le déclencheur réflexe « deals X damage, where X is the amassed Army's power » ;
- **`Connive | ConniveNum$`** (Spymaster's Vault, Raffine), **`Explore | Num$`** (Jadelight Spelunker, Over the Edge) :
  N fois ;
- **`PutCounter | CounterNumPerDefined$`** (Canopy Gargantuan, Sovereign Okinec Ahau) : le même nombre sur chaque objet
  désigné ; **`UpTo$`** : de zéro à N, au choix ;
- **`RollDice | EvenOddResults$`** (Clown Car) : chaque dé se lit à part ; `EvenResults` et `OddResults` valent combien
  sont pairs et impairs, pour les sous-capacités qui les lisent.
Restent : les marqueurs de mot-clé (`CounterTypes$ Flying,Deathtouch`, Qarsi Revenant), `MoveCounter | ValidDefined$`, les
dés qu'on garde (`IgnoreLower$`, `DifferentResults$`), le résultat naturel (`Natural$`), le remplacement d'un marqueur
posé à un joueur (Winding Constrictor).

**Lot F78 : animer, et un nombre retenu** (`js/forgeEffetsD.js`, `js/forgeEffetsJ.js`). Neuf cartes de plus :
- **`Animate | AddAllCreatureTypes$`**, `AnimateAll` (Mutavault, Mirror Entity, Glamer Gifter, Oko, Shields of Velis Vel) :
  l'animation porte `changelin: true`, que la couche propre à l'objet (`car()`) lit déjà — un changelin, le temps de
  l'animation ;
- **`Effect | SetChosenNumber$ X`** (Will, Scion of Peace ; Mutated Cultist ; Nahiri's Lithoforming) : l'effet retient un
  nombre que `Count$ChosenNumber` lira plus tard.
Restent : les remplacements et SVars qu'une animation accorde (`Replacements$`, `sVars$` : The Book of Exalted Deeds,
Vorpal Sword), `CantHaveKeyword$`, et les effets qui posent un remplacement d'entrée avec marqueurs (Communal Brewing,
Torgal : leur chaîne `Effect | ReplacementEffects$ … ExileOnMoved$ Stack` n'est pas encore lue).

**Lot F79 : batailles, classes, chapitres, mots-clés de lancement** (`js/forgeBatailles.js`, et des retouches). Dix-huit
cartes de plus :
- **Les batailles** (Invasion of Ikoria, Tarkir, Theros, Fiora…). Une carte à deux faces dont l'avant porte `Defense:N`
  n'était jamais « tenue » : la détection des faces transformables ne lisait que `Transformed$ True` dans un texte brut,
  jamais la forme des tables lues (`"Transformed":"True"`) — les deux se reconnaissent maintenant, et `Defense` suffit.
  La bataille entre avec N marqueurs défense et un protecteur — l'adversaire qui suit son contrôleur dans l'ordre du tour,
  sans choix ; son contrôleur l'attaque comme un planeswalker (`defenseurDe()` rend le protecteur, qui bloque), les
  dégâts ôtent de la défense, et à zéro elle part en exil, d'où sa face arrière se lance sans payer
  (`lanceEffet.dos`). Simplification : pas de détour par le cimetière, pas de choix du protecteur.
- **`Devour:N:Type`** (Famished Worldsire) et **`Firebending:X`** — X est la force de la créature ou le nombre de
  créatures contrôlées. Les marqueurs d'expérience ne se comptent pas.
- **Les classes** dont un déclencheur porte déjà son `IsPresent` (Hunter's Talent) : le niveau se garde à part
  (`ClassLevelAtLeast`, jugé par `conditionForge()`). `MustBlock | BlockAllDefined$` (Fighter Class).
- **`Animate`/`AnimateAll` jusqu'au prochain tour** ou tant que l'hôte reste (Song of Freyalise), qui permettent à un
  chapitre de saga de les poser.
- **L'entretien cumulatif en effet** : « un adversaire gagne N vie » (Wall of Shards) ou « ajoutez {R} » (Braid of
  Fire) — le mana ajouté se dépense pendant l'entretien.
- **`Charm` à minimum calculé** (Inscription of Abundance : « tout nombre si kické ») ; `PumpAll | PumpZone$ Graveyard |
  KW$ Flashback` (Will of the Jeskai) ; `Count$Kicked` se lit dès le choix des modes.
- **Commander ninjutsu** (Yuriko, the Tiger's Shadow) : la capacité s'active depuis la zone de commandement.
Restent : les coûts de flashback, de squad, de replicate et d'escalate qui ne sont pas du mana (engager des créatures,
exiler des cartes du cimetière), `Mobilize:X`, `Reinforce:X`, le deuxième coût de `Kicker`, les chapitres qui posent un
effet à retardement ou animent « pour chaque adversaire », Monk Class (une carte exilée qui se lance sous condition).

**Lot F80 : déclencheurs et effets refusés** (`js/forgeEntreesB.js`, `js/forgeEffetsK.js`, et des retouches). Dix-neuf
cartes de plus :
- **« Ce sort entre avec des marqueurs de plus »** (Torgal, Communal Brewing, Summon: Fenrir, Intrepid Paleontologist) et
  « … entre engagé » (Edgar) : un déclencheur de lancement pose un `Effect` qui retient le sort et porte un remplacement
  `Moved | ValidCard$ Card.IsRemembered`. L'effet disparaît quand le sort quitte la pile (`ExileOnMoved$ Stack`), donc
  `metEnJeu()` relève ce qui l'attend *avant* de déplacer la carte (`entreAvecPrevu()`). Le nombre retenu
  (`SetChosenNumber`) se range avec la carte hôte : deux sorts lancés de suite se partagent le dernier.
- **Jouer la carte qu'on vient de meuler ou d'exiler** (Ark of Hunger, Tablet of Discovery, Court of Locthwain) : un
  `Effect` à statique `MayPlay` tenue par la zone de commandement (`EffectZone$ Command | Affected$ Card.IsRemembered`).
  `ExileOnMoved$` et `ForgetOnMoved$` prennent une liste de zones ; `Duration$ UntilEndOfTurn` est connue.
- **`CheckDefinedPlayer$ Opponent.isMonarch` / `You.withMostLife`** (Queen Marchesa, Preacher of the Schism) ;
  **`Spell.ManaSpent GTX`**, X lu sur la source (Liberator) ; **`ProtectionAll | Gains$ TargetedCardColor`** (Éowyn) :
  les couleurs de la carte que l'effet vient d'exiler, lues sur son instantané ; **`Goad | Duration$ Permanent`**
  (Nettling Nuisance) ; **`Animate | AtEOT$ YourExile`** (Puppeteer Clique, lu comme le prochain `Exile` : la fin
  d'étape qui vient, pas forcément la vôtre).
- **Mettre en jeu depuis la zone de commandement** (Derevi) : `ActivationZone$ Command`, avec la même route que le
  ninjutsu du commandant.
Restent : les effets qui animent « pour chaque adversaire » ou boucle à chaque joueur (`RepeatEach`, Mardu Siegebreaker,
Delina), `RemoveCounter` sur « n'importe quels permanents » (Eventide's Shadow), les dés à sous-capacités par résultat
(Comet), `Manifest` (Orochi Soul-Reaver), les effets « ne se dégagent pas » à durée (Kill Switch, Bontu's Last Reckoning),
les chapitres et classes à effet retardé.

**Correctif : cibler un joueur pour toucher ses créatures** (`objetsForge()`, `js/forgeDefini.js`). Un effet qui
porte un `ValidTgts$ Player` et un `Defined$ Valid Creature.ControlledBy TargetedPlayer` — Geode Rager : « goad each
creature target player controls » — ne touchait rien : avec un emplacement de cible, `objetsForge()` ne lisait que
les cibles, des joueurs, qu'il écarte comme non-objets, et ne regardait jamais `Defined$`. Les créatures de
l'adversaire choisi n'étaient donc jamais incitées. Quand toutes les cibles sont des joueurs et que `Defined$`
désigne autre chose que le joueur lui-même, ce sont maintenant les objets désignés qui sont touchés — pour tous les
effets qui s'écrivent ainsi, non pour le seul goad.

**Correctif : l'incitation s'impose aussi à qui a répondu** (`defenseurIncite()`, `js/jeuCombat.js`). Une créature
incitée attaque un autre joueur que celui qui l'incite, si elle le peut. `declareAttaquants()` n'appliquait
cette règle qu'à la créature que le moteur *forçait* d'attaquer parce que son contrôleur l'avait oubliée ; une
créature que l'adversaire déclarait lui-même passait telle quelle, contre l'inciteur — Geode Rager incitait
bien, et rien n'en tenait compte. La réponse est maintenant corrigée (et le journal le dit) : seuls les
joueurs autres que l'inciteur comptent — un planeswalker n'est pas « un joueur » —, et sans autre joueur à
attaquer, l'attaque reste sur l'inciteur. Une incitation expirée (au tour de qui l'a posée) ne contraint plus.

**Correctif : la propriété `greatestPower`** (`js/forgeFiltresD.js`). Selvala, Heart of the Wilds pose sa condition
en deux SVars : `Z = TriggeredCard$Valid Card.greatestPower`, `Y = Count$Valid Card.greatestPower`, comparées par
`EQY`. Le moteur ne connaissait pas la propriété ; or une propriété qu'il ne sait pas juger ne laisse rien passer,
donc Z et Y valaient 0, `0 = 0` était vrai, et la question « le faire ? » sortait à chaque créature entrée. La
propriété suit Forge : une créature l'a si aucune créature du champ, de qui que ce soit, n'a une force strictement
plus grande — à égalité, toutes l'ont, `Y` compte les ex æquo et `EQY` n'est vrai que pour l'unique plus forte.
Ce n'est pas le contrôleur de Selvala qui décide mais celui de la créature entrée (`OptionalDecider$
TriggeredCardController`) : le moteur le faisait déjà, et la question ne va qu'à lui.

**Lot F81 : copier et devenir** (`js/forgeCopiesB.js`). Onze cartes de plus. Ce que l'effet de copie ajoute à la copie :
- `AddColors$` (Ratadrabik of Urborg, The Jolly Balloon Man) ; `RemoveCardTypes$ True` : la copie ne garde que les
  types ajoutés (Espers to Magicite) ;
- `PumpKeywords$` avec `PumpDuration$ EOT` : le mot-clé est un bonus du tour (`mods`), il n'entre pas dans la
  définition de la copie (Ashling, the Limitless, God-Pharaoh's Gift) ;
- `Clone | IntoPlayTapped$ True` (Vesuva) ; `AddSVars$` (Kimahri, Court of Vantress, Lazav, Irma) n'ajoute rien :
  la capacité copiée emporte déjà ses SVars ; `CopySpellAbility | UnlessAI$` est un indice pour l'IA de Forge
  (Chain of Vapor).
Restent : la copie d'un **sort de permanent** (Storm of Saruman, Double Major : elle devient un jeton sur la pile, que
le moteur ne sait pas poser sans le lancer), les copies **d'une carte nommée** (`DefinedName$` : le moteur ne
cherche pas une carte par son nom hors du deck), les statiques ajoutées à une copie (`AddStaticAbilities$`), les
échanges de contrôle conditionnels (Gilded Drake).

**Lot F82 : des effets et des conditions de plus** (`js/forgeEffetsL.js`). Quinze cartes de plus :
- **`EndTurn`** (Sundial of the Infinite, Day's Undoing) : la pile s'exile, `P.finTour` arrête les étapes, et
  `suiteDuTour()` joue alors le nettoyage — sans lui les blessures auraient survécu au tour. **`AddTurn | SkipUntap$`**
  (Savor the Moment) : le tour en plus saute le dégagement, mais ses permanents deviennent « prêts ».
- **`DealDamage | ExcessDamage$ TargetedController`** (Ravenous Tyrannosaurus) : la créature ne reçoit que de quoi
  mourir, le reste va à son contrôleur ; `ExcessSVarCondition$` (Goblin Negotiation, Hell to Pay).
- **`Token | TokenBlocking$`** (Brimaz) : le jeton entre en bloquant l'attaquant ; **`Unattach`** (Akiri) ;
  **`R:GainLife | Prevent$ True`** (Sulfuric Vortex).
- **Les restrictions de moment**, qu'un sort portait sans qu'on les tienne : `OpponentTurn$` (Delirium),
  `ActivationFirstCombat$` et `ActivationPhases$` (Berserk) valent maintenant pour le sort comme pour la capacité
  (`restrictionsSort`, `restr`). Elles sont inscrites par effet, non comme paramètres communs : un déclencheur qui
  porte `OpponentTurn$` doit la lire lui-même, comme `SpellCast` le fait.
- **`ActivationGameTypes$`** (War Room) : la capacité ne s'active que dans une partie à commandants — un joueur qui en
  a ; **`ConditionOpponentTurn$`** (Fevered Visions) ; **`ProtectionAll | ValidPlayers$ You`** (Seht's Tiger) : à l'abri
  de la couleur contre les cibles et les dégâts ; **`Goad | RememberGoaded$`** (Havoc Eater).
Restent : prendre le contrôle d'un joueur (`ControlPlayer`, Mindslaver, Sorin Markov), les attractions (`OpenAttraction`),
`Recruit`, `ExchangeTextBox` (Deadpool), `ExchangeLife`, les paramètres de pioche `NonBasicSpell` et `Forecast`, et
une dizaine de paramètres isolés (`Token.Boast`, `Tap.Tapper`, `Counter.ValidCause`, `Surveil.RememberMoved`…).

**Lot F83 : des statiques, des paliers et quatre mécaniques** (`js/forgeStatiquesD.js`, `js/forgeEffetsM.js`). Le banc
est reconstruit sur les cent premiers commandants d'EDHREC du 24 novembre (7 336 cartes avec leur script, dépôt Forge au
commit `3e1fa4ed`) : 6 552 complètes au départ, 6 603 après ce lot. Cinquante et une cartes de plus :
- **`Station$ N`** (vingt-quatre vaisseaux : Exploration Broodship, Evendo, Void Altar…) : la statique de palier n'agit
  qu'avec N marqueurs charge ou plus sur sa source — `conditionForge()` le lit comme `IsPresent`. Le mot-clé et la pose
  des marqueurs existaient (`js/forgePaliers.js`) ; sans le seuil, les vaisseaux restaient des artefacts inertes ;
- **`ActivateAbilityAsIfHaste`** (Thousand-Year Elixir, Tyvar) : `peutEngagerSoi()` laisse une créature qui vient d'arriver
  payer un coût {T}. Elle ne vaut ni pour l'attaque, que `peutAttaquer()` juge à part, ni au delà des capacités ;
- **`IgnoreLegendRule`** (Mirror Box, Cadric, Hall of Echoes) : l'action d'état des légendes saute les permanents désignés ;
- **`CantSacrifice`** et **`CantPayLife`** (Angel of Jubilation, Quark, Hithlain Rope) : `sacrificeInterdit()` et
  `payerVieInterdit()` sont lus par `coutAutrePossible()`, par le choix du sacrifice (`paieAutre()`) et par les sources
  de mana ; `sacrifie()` refuse aussi les effets, sauf pour une statique « `ForCost$ True` ». Une cause précise
  (« les sorts de vos adversaires », Tamiyo) n'est pas lue : la statique ne retient alors rien — jamais plus de garde que
  la carte n'en donne ;
- **`AttackRestrict`** (Crawlspace, The Eternal Wanderer, Mirri) et **`BlockRestrict`** (Silent Arbiter) : au plus N
  attaquants par défenseur, N bloqueurs par combat ou par défenseur. Les premiers déclarés restent
  (`limiteAttaquants()`, `blocageRestreint()`) ;
- **`Blight | Num$`** (High Perfect Morcant, Shadow Urchin) : l'effet dont le coût `Blight<N>` était déjà la moitié ;
- **`K:Exploit`** et **`Exploited`** (Sidisi, Colonel Autumn…) : à l'entrée, sacrifier une créature, si l'on veut ;
  l'évènement `exploite` garde l'instantané du sacrifié et celui de l'exploitant, qui a pu se sacrifier lui-même ;
- **`Explores`** (Nicanzil, Merfolk Cave-Diver) : l'évènement `explore` dit si la carte révélée était un terrain ;
  **`RolledDieOnce`** et `TriggerCount$Result` (Wyll, Vexing Puzzlebox) : un lancer, une fois, de total `n` ;
- **`ChooseCard | MinAmount$ 0`** (Archfiend of Depravity) : « jusqu'à N ».
Chaque famille a été jouée, non seulement comptée : un vaisseau à 3 puis 8 marqueurs gagne un terrain par tour, puis devient
une créature 4/4 volante ; Crawlspace ramène trois attaquants à deux ; Archfiend ne laisse que deux créatures à l'adversaire.
Soixante parties au hasard — des decks de cartes complètes, plus les cartes de ce lot — se jouent sans une erreur du moteur.
Restent, parmi les plus jouées : Mutate, `Continuous.GainsAbilitiesOf`, `ManaConvert`, les capacités de mana à coût
spécial (Dreadship Reef, Lion's Eye Diamond), `CanBlockAmount`, et le contrôle d'un joueur.

**Lot F84 : mana converti, dépense, compteurs, entrées coupées** (`js/forgeManaD.js`, `js/forgeEffetsN.js`,
`js/forgeDeclencheursF.js`, et des retouches). Vingt-six cartes de plus (6 603 → 6 629 complètes) :
- **`ManaConvert | ManaConversion$ AnyType->AnyColor`** (Chromatic Orrery, Mycosynth Lattice, Oath of Nissa) et
  `C->AnyColor` : le solveur de `js/jeuMana.js` apparie des sources à des couleurs ; `sourcesMana()` offre alors à
  chaque source toutes les couleurs, aux longueurs qu'elle produit, en gardant les siennes. `ValidPlayer$`, `ValidSA$
  Spell` et le type du sort (`ValidCard$ Planeswalker.YouCtrl`) bornent la conversion. Limite : le mana déjà en
  réserve garde sa couleur ;
- **`ManaExpend`** (Pyreswipe Hawk, Trailtracker Scout, Wandertale Mentor, Teapot Slinger) : « you expend N » à l'instant
  où le N-ième mana du tour se dépense pour lancer des sorts. `paieMana()` tient le décompte par joueur et par tour
  (`J.depenseTour`) et dit d'où il part et où il arrive ; seuls les sorts comptent ;
- **`CounterPlayerAddedAll`** (All Will Be One, The Great Goblin, Generous Patron) : une fois par lot de marqueurs posés,
  `ValidSource$ You` étant le contrôleur de ce qui les pose. Les marqueurs posés sur un joueur ne passent pas par
  `poseMarqueurs()` ; seuls ceux des permanents sont dits ;
- **`PutCounterAll`, seconde paire** (`ValidCards2`, `CounterType2`) : Ajani Steadfast, Brokers Ascendancy ;
  **`ChangeZone | DestinationAlternative$`** (Dina's Guidance, Emeria Shepherd) : le joueur choisit la destination avant la
  recherche, `DestAltSVar$` dit si l'autre est offerte ; un automate garde la première ;
- **`Phase | LifeTotal$ / LifeAmount$`** (Felidar Sovereign, Test of Endurance) : la condition de vie d'un déclencheur de phase ;
- **`DisableTriggers`** (Torpor Orb, Elesh Norn, Mother of Machines) : `forgeDeclenche()` écarte un déclencheur d'entrée en
  jeu quand la statique juge ce qui entre (`ValidCause$`) et le permanent qui porte le déclencheur (`ValidCard$`) ;
- **`RaiseCost | ValidTarget$ … | Cost$ PayLife<3>`** (Terror of the Peaks) : un sort qui vise ce permanent coûte de la vie
  de plus, par la garde non-mana des cibles (`gardeAutre()`) ;
- **`MayPlayText`** (Muldrotha) : une permission « une fois par tour » se tient par statique quand la source en porte
  plusieurs ; elle se tenait par source, et Muldrotha ne jouait qu'une seule carte du cimetière par tour au lieu d'un
  terrain et d'un permanent de chaque type. `clePermis()` (`js/jeuPermis.js`).

**Lot F85 : des coûts, des évènements, des filtres** (`js/forgeCout.js`, `js/forgeDeclencheursF.js`, `js/forgeEffetsN.js`,
et des retouches). Huit cartes de plus (6 629 → 6 637 complètes) :
- **`untapYType<N/Valid/desc>`** (Halo Fountain) : dégager N permanents engagés qu'on contrôle pour payer — l'inverse de
  `tapXType`. `coutAutrePossible()` les compte, `paieAutre()` les fait choisir ;
- **`Evolved`** (Watchful Radstag) : `Evolve` passe par un effet à lui, `EvolveCounter`, qui pose le marqueur et dit que
  la créature évolue ; **`BecomesCrewed`** (Mobilizer Mech) : `paieEquipage()` dit quel véhicule vient d'être équipé ;
  **`LosesGame`** (Blood Tyrant) : `elimine()` dit quel joueur quitte la partie ; **`Sacrificed | Origin$ / Destination$`**
  (Trail of Crumbs) : un sacrifice part toujours du champ ;
- **`attacking Opponent`** (Martial Impetus, Blast-Furnace Hellkite) : une créature qui en attaque un des adversaires de qui juge,
  directement ou par un planeswalker ; **`Dig | NoLooking$`** (Expressive Iteration), qui ne change rien à ce que voit le joueur.
Soixante-quinze parties au hasard supplémentaires, sans une erreur du moteur. La liste de ce qui reste, par poids, est
dans [doc/couverture-edhrec.md](doc/couverture-edhrec.md), remesurée le 24 novembre.
Le détail — par type de carte, par structure, par mécanisme, sur tout le pool Forge (34 482 cartes) comme sur les cartes d'EDHREC — est dans
[doc/couverture-detail.md](doc/couverture-detail.md).
Le même détail, set par set (éditions de Forge, un tableau par sorte de set), est dans [doc/couverture-sets.md](doc/couverture-sets.md).

**Lot F86 : les activations du tour** (`js/forgeActivationsB.js`). Cinq cartes de plus (6 637 → 6 642) :
- **`Count$ThisTurnActivated_Activated.<filtre>`** (The Chain Veil, Bruenor Battlehammer, Forge Anew) : chaque activation
  — et chaque équipement, qui n'émettait rien — entre dans l'historique du tour (`h.activations`) ; le filtre lit le
  genre (`Equip`, `Loyalty`), le type de la source et qui l'a activée. Un filtre plus fin (`IsTargeting…`) vaut zéro ;
- **`NumLoyaltyAct`** (Oath of Teferi, The Chain Veil, Kaito) : `Twice$ True` ou `Additional$ N` autorisent une capacité de
  loyauté de plus par tour. La limite se tient par clé (`id|loyaute`, `id|loyaute2`…) dans `P.unefois`, que
  `loyauteEpuisee()` et `noteLoyaute()` lisent à la place de l'ancienne clé unique ;
- **`AlternativeCost | ValidSA$ Activated.Equip | Cost$ 0`** (Bruenor, Forge Anew) : la première capacité d'équipement du tour
  coûte {0} (`coutEquipement()`) ; **`CastWithFlash | ValidSA$ Activated.Equip`** : équiper à vitesse d'éclair, pendant son tour ;
- **`Taps | ValidActivatingPlayer$`** (Tezzeret) : le contrôleur du permanent qui s'engage.
Kíli the Resourceful reste partielle (« an enduring story » et `Storied` ne sont pas lus).

**Lot F87 : des marqueurs de plusieurs sortes, ou répartis** (`js/forgeEffetsO.js`). Sept cartes de plus (6 642 → 6 649) :
- **`PutCounter | CounterTypes$`** (Qarsi Revenant, Gift of the Viper) : un marqueur de chaque sorte, de la liste. Les marqueurs
  de mot-clé — `flying`, `reach`, `deathtouch`, `first strike` — donnent désormais ce mot-clé : `car()` les lit sur
  `o.marq`, de façon qu'une créature qui en porte vole, tue au contact, etc. ;
- **`DividedAsYouChoose$ N`** (Vastwood Hydra, Lathiel, Invoke Justice, SOLDIER Military Program, Crashing Wave) : N marqueurs
  répartis entre des créatures — celles que le joueur choisit parmi `Choices$` (jusqu'à `ChoiceAmount$`, au moins
  `MinChoiceAmount$`), ou les cibles. La part de chacune n'est pas demandée : parts égales, la première gardant le reste.
`Waterbend<X>` (Crashing Wave) se lit comme {X} de mana : les artefacts et créatures qu'on pourrait engager pour le payer
ne sont pas proposés.

**Lot F88 : des dés qui ne se résument pas à une somme** (`js/forgeDes.js`). Sept cartes de plus (6 649 → 6 656) :
`RollDice` lance maintenant chaque dé à part quand le script le demande — `IgnoreLower$ N` (Berserker's Frenzy : on ignore
les N plus bas), `UseHighestRoll$`, `ChosenSVar$ X | OtherSVar$ Y` (Grave, Reckless et Valiant Endeavor : on choisit
l'un des résultats, qui devient X, l'autre devient Y ; un automate prend le plus haut), `EvenOddResults$` (Attempted
Murder, Luck Bobblehead : `EvenResults`, `OddResults`), `DifferentResults$` (Circuits Act) et `MaxRollsResults$`. Le lot
reprend le cas pair-impair de `js/forgeMarqueursC.js` (Clown Car) ; `forgeDes.js` se charge après lui, pour que sa
version s'applique la première. Restent le remplacement d'un lancer (Wyll, Barbarian Class : « roll that many dice plus
one and ignore the lowest », deux quantités à remplacer à la fois) et les dés d'une attaque (Iron Mastiff).

**Lot F89 : ce que la copie reçoit** (`js/forgeCopiesC.js`). Quinze cartes de plus (6 656 → 6 671) :
- **`RemoveSubTypes$ True`** (Imposter Mech, Dino DNA, Taskmaster, Benthic Anomaly) : la copie ne garde que les sous-types
  qu'on lui ajoute, comme `RemoveCardTypes` (lot F81) garde les types ; ce dernier se lit aussi pour `Clone` ;
- **`ChoiceZone$ Graveyard`** (Echoing Deeps, Invasion of Amonkhet, Voq) : on copie une carte d'un cimetière — `aCopier()` choisit
  hors du champ ;
- **`AddTriggers$`, `AddStaticAbilities$`, `AddAbilities$`** (Phantasmal Image, Sakashima of a Thousand Faces, Machine God's
  Effigy, Callidus Assassin, Estrid's Invocation, Firion) : la copie reçoit des déclencheurs, des statiques ou des capacités
  lus dans les SVars du script qui copie (`_face`, que les deux effets passent à `defCopie()`), compilés comme ceux d'une
  carte. Un morceau que le moteur ne sait pas construire est écarté : la copie en a moins, jamais plus ;
- **`AddKeywords$ Crew:3`** : un mot-clé qui porte une capacité se construit comme sur une carte ; une copie qui devient un
  véhicule peut donc être équipée d'équipage. Jusqu'ici `motsForge()` ne retenait que les mots-clés simples.
Restent les copies d'un nom (`DefinedName$`, Mutable Explorer), d'un sort permanent (`CopySpellAbility | NonLegendary`) et
la copie au choix facultatif (Brudiclad).

**Lot F90 : sept évènements de plus** (`js/forgeDeclencheursF.js`, et des évènements émis par les effets). Dix cartes de plus
(6 671 → 6 681) :
- **`BecomeMonarch`** (Custodi Lich) : `monarque`, émis par l'effet comme par le vol de la couronne au combat ;
  **`Connives`** (Iron Monger, Ultron) : `connive`, émis par `Connive` ; **`Countered`** (Baral, Lullmage Mentor) : `contre`,
  émis par `Counter` et `OPS.contre`, avec le contrôleur de ce qui contre — `ValidCause$ SpellAbility.YouCtrl` ;
- **`CounterRemoved`** (Protean Hydra, Dinosaurs on a Spaceship) : `marqueurRetire`, émis par `RemoveCounter` et par le coût
  « retirer des marqueurs » ; **`PayLife`** (Font of Agonies) : `payeVie`, émis par le coût en vie ;
- **`TokenCreatedOnce`** (Staff of the Storyteller) et **`MilledOnce`** (Zellix) : une fois par lot (`unSeulParLot()`).
Restent `BecomeMonarch | BeginTurn$` (Knights of the Black Rose : « si vous étiez le monarque au début du tour »),
`DamagePreventedOnce`, `Destroyed | ValidCauser$`, `Exiled` et les évènements du lancer de pièce.

**Lot F91 : fouiller, chercher** (`js/forgeFouilles.js`). Neuf cartes de plus (6 681 → 6 690) :
- **`SearchedLibrary`** (Archivist of Oghma, Ob Nixilis Unshackled, Wan Shi Tong) : toute recherche pose la question « Chercher »
  (`choisitCartes()`) ; elle dit désormais, par l'évènement `cherche`, quel joueur cherche. Une recherche dans la bibliothèque
  d'un autre n'existe pas dans le moteur : `SearchOwnLibrary$` vaut toujours ;
- **`Dig | RememberRevealed$`** (Dihada, Binder of Wills) : les cartes révélées se retiennent, là où elles sont allées ;
  **`DestZone2Optional$`** (Nylea, Keen-Eyed) : on peut refuser l'autre destination ;
- **`ForceRevealToController$`, `PromptToSkipOptionalAbility$`, `OptionalAbilityPrompt$`** (Explorer's Scope, Raiders' Karve, Nissa,
  Steward of Elements) : ce qu'on dit au joueur, non ce qui se joue ; **`DigMultiple | SourceZone$`, `LibraryPosition$`**
  (Kaalia, Zenith Seeker) : la bibliothèque, la seule zone que fouille `DigMultiple`.

**Lot F92 : attaquer, équiper, compter** (retouches de `js/forgeInterdits.js`, `js/forgeMotsCles.js`, `js/forgeExpr.js`). Cinq cartes de
plus (6 690 → 6 695) :
- **`CantAttack | Target$ Player.CardOwner`** (Alexios, Xantcha : « can't attack its owner ») et **`Player.attackedBySourceThisTurn`**
  (Bloodthirster : « a player it has already attacked this turn ») : `defenseurVise()` juge le défenseur contre le propriétaire de la
  source, et contre les joueurs que la créature a déjà attaqués ce tour (`o.cibleTour`, tenu par l'historique) ;
- **`K:Equip:<coût>` avec un coût de plus que du mana** (My Precious : « {2}, pay 2 life » ; Pact Weapon : « discard a card ») :
  `def.equipeAutre` garde le reste du coût, que l'action d'équiper vérifie avant de payer le mana, puis paie ;
- **`Count$ValidAll`** et **`attackingYouOrYourPWLKI`** (Mangara, the Diplomat) : le compte se fait sur le champ, et la créature qui
  attaque le joueur ou l'un de ses planeswalkers compte.
Quand un équipement s'équipe pour {0} (Bruenor), seul le mana est remis : le reste du coût se paie quand même — simplification
annoncée.

**Lot F93 : ce qui ne s'adresse qu'à l'IA de Forge** (`js/forgeFouilles.js`). Six cartes de plus (6 695 → 6 701) : cinq
paramètres que le script écrit pour l'IA de Forge ou pour l'écran de son joueur, et qui ne changent rien à ce qui se joue —
`UnlessAI$` (comment l'IA répond à un « unless » : Lim-Dûl's Vault, Champions of Minas Tirith, Indulgent Tormentor),
`AiChoiceLogic$`, `ChoicePrompt$` (Sin Prodder), `PrimaryPrompt$` — et `Charm | Announce$ X` (Kozilek's Command, Profane
Command), où le {X} du coût fait déjà choisir X au lancement. `Announce$ X` d'un sort dont le coût n'a pas de {X}
(Waterbender's Restoration, Soul Immolation) reste refusé : le moteur ne demande X que pour un coût qui en porte un.
Les modes en « empreintes » (`Pawprint$`, les quatre Season of…) et au hasard (`Charm | Random$`) restent à faire :
les modes se choisissent à la construction, non à la résolution.

**Lot F94 : les capacités de mana qu'on ne paie pas qu'en mana** (`js/jeuManaAutre.js`). Huit cartes de plus (6 701 → 6 709) :
Lion's Eye Diamond, Diamond Lion, Skirge Familiar, Bog Witch, Overeager Apprentice, Wall of Roots, Dreadship Reef et les autres
terres de stockage, Mage-Ring Network. Le solveur de `js/jeuMana.js` n'engage que des sources dont le coût est {T}, du mana,
de la vie, ou le sacrifice de la source ; la construction refusait donc toute capacité de mana qui exige autre chose — défausser,
retirer des marqueurs, en poser un. Elles se construisent maintenant, et ne servent pas au paiement automatique : **à la table**
(`P.montre`), elles se proposent comme une action `{k: 'manaAutre'}`, qui paie le coût (X compris : on choisit combien de
marqueurs retirer), verse le mana dans la réserve, et le laisse au prochain sort de l'étape. L'IA ne note pas cette action ;
les lots et les essais d'IA ne la proposent pas.
- **`Discard<0/Hand>`** (Lion's Eye Diamond) : défausser toute la main, `defausseTout`. `paieAutre()` ne le faisait pas : le
  coût se lisait comme « défausser 0 carte » ;
- **les marqueurs de force** `+1/+0`, `-0/-1`, `+2/+2`… (Wall of Roots) : `car()` les applique — une carte qui s'en met
  un à chaque activation ne devenait jamais plus fragile ;
- **un mana restreint** (Crucible of the Spirit Dragon : « only for Dragon spells ») reste refusé : la réserve ne porte pas de
  restriction, et la capacité vaudrait plus que la carte.
« Toute combinaison de couleurs » d'une quantité X se choisit en bloc (« deux bleus et un noir » se compte par multi-ensembles).
Restent le mana qu'une capacité confie à un sort (Jade Orb, Hall of the Bandit Lord, Opal Palace) et les capacités de mana d'un
terrain qui double la réserve (Doubling Cube).

**Lot F95 : avoir les capacités des autres** (`js/forgeCapacitesAccordees.js`). Sept cartes de plus (6 709 → 6 716) :
`Continuous | GainsAbilitiesOf$ <filtre>` — Marvin, Murderous Mimic (celles des créatures qu'on contrôle), Necrotic Ooze (celles des
créatures de tous les cimetières), Myr Welder, Steward of the Harvest, Hazel's Brewmaster, Agatha's Soul Cauldron, Thranduil
(celles des cartes exilées par la source) : `capacitesAccordees()` y ajoute les capacités activées et de mana des objets que le filtre
retient, dans les zones de `GainsAbilitiesOfZones$` (le champ par défaut). Ce ne sont pas des copies : la capacité s'exécute avec
le permanent qui la reçoit pour source, comme le veut la règle — « sacrifice CARDNAME » le sacrifie, lui. Les capacités de loyauté,
les déclencheurs et les statiques restent à leur porteur. Les capacités accordées se rangent après celles de la carte, et
`capacitesDe()` garde la liste jusqu'au prochain changement de la partie.
Restent `GainsValidAbilities$` (Drana and Linvala, Nicol Bolas, Dragon-God : « toutes les capacités activées des créatures adverses
qui... »), `GainsAbilitiesOfDefined$` (Quicksilver Elemental) et la couverture du dessus de la bibliothèque (Conspicuous Snoop).

**Lot F96 : des terrains, premier tour** (`js/forgeChaque.js`, `js/forgeEntreesC.js`, `js/forgeTerrains.js`). Vingt terrains de plus, dont
treize d'EDHREC. Ce qu'ils avaient en commun : une phrase de plus que le moteur ne lisait pas.
- **`EACH Forest & Plains`** (Krosan Verge, Axgard Armory) : une carte par filtre, jusqu'à une chacune, sans qu'une même carte serve deux
  filtres ; `famillesFiltre()` lit chaque morceau pour la couverture.
- **Entrer engagé, sauf…** : « révélez un Dragon de votre main, ou contrôlez-en un » (Temple of the Dragon Queen, Fortified Beachhead) se lit
  comme `saufRevele` et `sauf` ; « engagé s'il a été posé depuis la main » (Fetching Garden) comme `siJouee`, que seul `joueTerrain()` annonce
  (`terrainJoue`) ; « sacrifiez les autres permanents du même nom » (Sheltered Valley) comme `sacMemeNom`.
- **Sous-types composés** : `Assembly-Worker` (Mishra's Factory et Foundry) et `Time Lord` (Trenzalore Clocktower) ; `lisTypeLigne()` garde « time lord »
  d'un seul tenant.
- **Ce qu'une animation interdit** : `AnimateAll | CantHaveKeyword$` (Arcane Lighthouse) retire le mot-clé *et* le garde retiré, après les mods.
- **Protection contre un type** : `Protection | Gains$ Artifact` (Tower of the Magistrate) pose `protFiltresTemp`, que `protegeFiltre()` lit comme la
  protection imprimée : blocage et dégâts y passent déjà.
- **Traversée accordée ou ôtée** : `KW$ Landwalk:Land` (Fabled Path of Searo Point) et `Debuff | AllSuffixKeywords$ walk` (Hammerheim), par des mods
  que `peutBloquer()` lit à côté de la traversée imprimée.
- **`KW$ Firebending:4`** accordé pour le tour (Fire Nation Palace) : le déclencheur d'attaque du mot-clé, posé en animation.
- **`IgnoreHexproof`** (Detection Tower) : une statique d'effet que lit `ciblable()` ; les joueurs, eux, ne se protègent que par couleur.
- **`Activator$ You.!Active`** (Ghost Town) et `PlayerTurn$ True` : des restrictions d'activation, jugées avec `OpponentTurn` (`restrictionSort()`).
  `forgeValeurs(nom, valeurs)` borne un paramètre à des valeurs : toute autre reste inconnue (`param:ChangeZone.Activator=Opponent`).
- **`TargetsWithSameCreatureType`** (Secret Tunnel), **`GainControlVariant | ChangeController$ CardOwner`** (Homeward Path), et le mana d'un terrain qui
  reflète les couleurs du cimetière (**The Grey Havens**).

**Une propriété de filtre inconnue ne laisse rien passer**, une condition inconnue est fausse, un
morceau de coût inconnu fait écarter la capacité : un script mal compris rend la carte plus faible,
jamais plus forte.

## La synchronisation entre appareils

Un même atelier sur deux PC, par un dossier d'application Dropbox — aucun serveur de l'atelier
n'est en jeu, les données vont de ce navigateur au nuage et en reviennent. Trois décisions la
gouvernent.

**Trois étages, fusionnés différemment** (`js/nuagePaquet.js`). Le **fond** — la collection, les
acquisitions en cours, les decks avec tout ce qu'ils portent, le format personnalisé, les préférences d'achat — est l'intention
du joueur, et se fusionne carte par carte. Les decks y forment un étage à eux, fusionné **dossier par
dossier puis carte par carte** (`fusionneDecks()`, `js/nuageFusion.js`) ; **aucun marqueur de
suppression n'est nécessaire**, la base à trois côtés tranchant seule les deux cas qui comptent — un
dossier présent dans la base et absent d'un côté y a été supprimé, un dossier absent de la base et
présent d'un côté y a été créé. Les clés de deck sont tirées au sort et non numérotées : deux
appareils qui créent chacun un deck hors ligne ne doivent pas se réclamer la même. Le deck **ouvert**
ne voyage pas — c'est de la vue, comme l'onglet. La **vue** — vues, colonnes, groupements, tris, filtres, barre de mana, onglet, plis,
thème, et les réglages qui dépendent de la machine comme le nombre de cartes examinées ou
l'archivage du catalogue — **ne voyage pas** : un vingt-sept pouces et un portable ne veulent pas le
même nombre de colonnes. Le **cache** des cartes complétées par Scryfall — visuels, textes, prix —
voyage en union sans conflit possible, et c'est lui qui fait le vrai gain : sans lui, le second
appareil refait des centaines d'appels pour retrouver ce que le premier savait déjà. Le paquet est
une projection de `snapshot()` et se verse par `restore()` : la vue reste locale **par son absence
du paquet**, non par une liste d'exceptions à tenir à jour.

**Un calendrier court** (`js/nuage.js`). Un seul tour est automatique : celui de l'ouverture, si « Synchroniser à
l'ouverture » est cochée ; ensuite, rien ne part chez Dropbox sans « Synchroniser maintenant ». Il y avait aussi un tour
après chaque geste (au plus toutes les quinze secondes) et au retour sur l'onglet, et il tournait en pleine partie. Surtout,
il bouclait : « *N* cartes reçues », le même *N* à chaque tour. Deux causes. `restore()` ne recopiait ni le texte
complet ni le prix d'une carte que l'appareil connaissait déjà (un import de liste, sans texte) : la copie du nuage
restait « plus garnie » que la nôtre après chaque versement, donc « reçue » de nouveau — et le versement relançait une
sauvegarde, donc un tour. `restore()` les recopie maintenant, et `fusionnePaquets()` ne compte plus rien comme reçu
quand la révision du distant est celle de notre dernier accord (`NUAGE.rev`) : personne n'a écrit depuis. Qui ne
synchronise plus après chaque geste doit donc penser au bouton avant de changer d'appareil.

**Une fusion à trois côtés** (`js/nuageFusion.js`) : le local, le distant, et la **base** — le fond
au dernier accord, gardée dans IndexedDB. Sans elle, trois exemplaires d'un côté et deux de l'autre
sont indiscernables d'une suppression. Un seul cas reste indécidable — les deux côtés ont bougé
différemment sur la même carte —, la plus grande quantité est retenue et la carte est **nommée**
dans la fenêtre : une fusion qui tranche en silence est une perte de données polie. `idbVider()`
épargne cette base, sans quoi décocher l'archivage du catalogue effacerait la mémoire des accords.

**Un vrai verrou d'écriture** (`js/nuageDropbox.js`). Dropbox a été préféré à Google Drive pour
trois raisons tenant à ce qu'une page sans serveur peut faire : le flux PKCE n'exige aucun secret
d'application, `token_access_type=offline` rend un jeton de rafraîchissement sans échéance — on se
connecte une fois par appareil —, et `files/upload` en mode `update` exige le `rev` du fichier qu'on
croit remplacer, refusant en 409 si l'autre appareil a écrit entre-temps. L'API de Google Drive n'a
pas d'équivalent depuis qu'elle a retiré les `ETag`, et son jeton ne vit qu'une heure. Un tour se
fait toujours dans le même ordre — **tirer, fusionner, verser, pousser** — et un conflit de `rev` se
rejoue une fois sur le nouveau distant.

La sauvegarde locale, elle, garde son marqueur `v: 1`. Le passer à 2 ferait qu'un atelier resté sur
le code d'hier rejetterait la sauvegarde — `restore()` refuse `d.v !== 1` — puis l'écraserait par un
état vide à la première sauvegarde différée : une perte de données. La migration se reconnaît donc à
l'**absence de `d.decks`**, comme celle de `d.view`, `d.colonnes` et `d.sort` avant elle ; le deck
d'hier devient « Mon deck », avec ses cartes, son commandant, son format, son budget et ses
objectifs. Par la même prudence, `snapshot()` recopie le deck ouvert sous les anciennes clés le temps
d'une version : quelques centaines d'octets, négligeables devant `cartes` et `enrich`, qui rendent
son deck à un atelier resté en arrière au lieu d'une page vide.

La configuration — jetons, chemin, `rev`, nom de l'appareil — vit dans une **clé à elle**,
`mtg-atelier-nuage`, et non dans `snapshot()` : versée dans l'instantané, elle voyagerait jusqu'à
l'autre PC et y écraserait son jeton et son `rev`, les deux appareils se battant alors pour le même
verrou. C'est la seconde exception à la règle, après le thème. Se connecter demande une origine
`http` — Dropbox ne revient que sur une adresse qu'il a pu enregistrer, et `file://` n'en est pas
une : la section le dit et propose GitHub Pages ou `python3 -m http.server`. Tout le reste de
l'atelier fonctionne sans cela.

La feuille de style et les modules portent un marqueur de version dans leur adresse
(`?v=…`, `index.html`). Sans lui, un navigateur relit la page en gardant en cache ce qu'elle
charge : tant que chacun tenait son rôle de son côté la dérive passait inaperçue, mais depuis
que la coque des onglets vit dans la page, un cache en retard donne des boutons nus et des
gestes sans effet. Le marqueur est à rehausser dès qu'un changement touche à la fois `index.html`
et ce qu'il charge.

L'ordre de chargement compte : `effets.js` définit l'analyseur qu'utilise `cartes.js`
au moment de construire la base livrée, et `liens.js` le tri des liens dont la notation, la fiche et
les pastilles se servent ensuite. Les modules partagent la portée globale ;
aucun système de modules n'est employé, afin que l'application reste utilisable
par simple ouverture du fichier, sans serveur local.

## Flux de données

```
texte oracle ──▶ effets.js (analyse) ──▶ arcs (déclencheur → effet)
                                          │
collection ──▶ etat.js (filtrage) ────────┼──▶ graphe.js (visualisation)
                                          └──▶ suggestions.js (notation) ──▶ deck.js
scryfall.js ──▶ catalogue, visuels, prix ─────▶ stockage.js (cache local)
```

## Modules

L'inventaire — chaque module, chaque fonction, son rôle — est dans
[doc/fonctions.md](doc/fonctions.md), **écrit par la machine** :

```
node outils/genDoc.js            # réécrit doc/fonctions.md
node outils/genDoc.js --verifie  # sort en erreur s'il est périmé
```

Il n'y a donc rien à tenir à la main. Le rôle de chaque fonction y est repris du commentaire qui la
précède dans le code, l'ordre des modules est lu dans `index.html`, et un nom qui change se propage
à la génération suivante. Ce tableau vivait ici : quatre cent cinquante lignes qui paraphrasaient ce
que le code affirme déjà, et qu'il fallait reprendre à chaque fonction ajoutée ou renommée — la doc
dérivait, ou coûtait un détour à chaque commit. Le présent document garde ce que le code ne dit
pas : l'architecture ci-dessus, les repères ci-dessous.

Le découpage des fichiers suit une règle : **un fichier par zone de l'écran, par fenêtre modale ou
par mécanisme**, et le plus petit possible. Ni `ui.js` ni aucun autre fourre-tout : la fenêtre des
paramètres, l'aperçu volant, l'ancre de défilement et les tuiles d'une carte vivent chacun chez eux,
et leur nom le dit — `fen*` pour une fenêtre modale. Un fichier qui passe les trois cents lignes est
un fichier à couper : on lit moins pour comprendre une pièce, et on réécrit moins pour la changer.

## Qui appelle qui

L'inventaire dit ce que chaque fonction fait ; un second outil dit à qui elle parle :

```
node outils/genAppels.js                 # doc/appels.md, doc/appels.json, les deux .dot
node outils/genAppels.js --module=deck.js  # le graphe réduit à un module et ses voisins
node outils/genAppels.js --seuil=1        # le graphe des modules sans seuil
```

Il relève chaque fonction, le fichier où elle est définie et les fonctions du projet qu'elle
appelle — directement, en la passant en rappel, ou depuis un gestionnaire posé dans le HTML que
l'atelier fabrique. Le résultat va dans [doc/appels.md](doc/appels.md) et dans deux graphes
Graphviz : `doc/graphe-fonctions.dot`, où chaque fichier est une boîte et chaque fonction un nœud,
et `doc/graphe-modules.dot`, où les appels sont agrégés fichier par fichier et rangés dans les
couches déclarées par la carte ci-dessus.

Tout vivant dans la portée globale, un appel est un nom suivi d'une parenthèse : il suffit de
savoir lequel des noms rencontrés est l'un des nôtres. Encore faut-il ne pas confondre du code avec
de la prose — les fichiers sont pleins de commentaires français et de gabarits de cent lignes —, ni
prendre une clé d'objet ou un paramètre pour une référence. D'où la passe qui efface commentaires
et textes en gardant les interpolations, qui sont bien du code.

Le graphe des fonctions porte tous les appels. Celui des modules ne trace, par défaut, que les
liens d'au moins trois appels, et son titre le dit : sans seuil, tout le monde parle à tout le
monde et six cents traits ne disent plus rien. Graphviz absent, les `.dot` sont écrits quand même.


## Repères

- L'état applicatif tient dans l'objet `S` de `etat.js` ; aucune autre variable globale mutable n'est partagée entre modules, hormis les caches explicites (`CAT`, `NOTES_DECK`, `VISUELS_CHARGES`, et pour le mode de jeu `DEFS`, `SIM_CARTES`, `SIM_RES`, `COUV_TABLE`), `SIM`, l'avancement du lot en cours, et `TABLE`, la table interactive ouverte — deux états qui ne survivent pas à la page (la partie hébergée, elle, se rejoue depuis IndexedDB). L'état d'une partie, lui, vit dans son propre objet `P`, que le moteur ne partage avec personne.
- Les évènements de l'interface passent tous par la délégation en place dans `app.js`, sur les attributs `data-act`, `data-card`, `data-node`, `data-onglet`, `data-filtre` et `data-card-name`.
- La fenêtre des paramètres porte trois sections : la sauvegarde locale, l'apparence, le catalogue.
  Une quatrième tenait le décompte des cartes de la collection, des exemplaires et leur valeur, avec
  trois boutons. Les chiffres, la section Collection les donne déjà et mieux — sa phrase de causes
  dit en plus ce que chaque filtre écarte —, et les trois boutons sont ceux de sa barre : deux
  endroits pour une même chose, dont l'un obligeait à ouvrir une fenêtre pour lire ce qui était
  affiché derrière.
- Les données restent sur l'appareil : `localStorage` pour la collection et le deck, IndexedDB pour le catalogue des cartes,
  pour l'index des archétypes EDHREC et pour celui des sets.
- Le filtre par set retient une carte dès qu'elle a paru dans un des sets cochés, possédée ou non dans cette édition.
  Trois sources y concourent, de la plus locale à la plus complète : le code relevé à l'import (`card.impressions`),
  celui que porte l'archive du catalogue, et la composition du set telle que Scryfall la publie — cherchée à la
  première utilisation du set, puis gardée en cache. Les deux premières répondent sans réseau ; l'archive
  `oracle-cards`, qui ne publie qu'une impression par carte, n'en donne qu'une, tandis qu'une archive par
  impressions (`default-cards`) les donne toutes.
- Le catalogue des cartes existantes se tient à jour tout seul. Au lancement, `demarrerCatalogue()` regarde d'abord ce
  que l'appareil garde — archive IndexedDB, puis fichier posé à côté de la page. S'il n'a rien, l'archive Scryfall est
  téléchargée et extraite immédiatement, sans rien demander. S'il a une archive mais que Scryfall en publie une plus
  récente, une fenêtre modale le signale et propose la mise à jour, qui passe par le même téléchargement ; « Plus tard »
  retient la version refusée dans `S.majIgnoree`, si bien que la question n'est reposée qu'à la publication suivante.
  Le même enchaînement est derrière le bouton « Mettre à jour » de la fenêtre de sauvegarde : il teste la version
  publiée et ne retélécharge que si l'archive manque ou a vieilli, sinon il se contente de rafraîchir les prix.
- Les rôles ne se lisent pas dans le texte brut : `categories()` croise le type de la carte avec ce que `analyze()` a
  relevé — ce que chaque capacité produit, sur qui porte l'effet (`textEff`), ce que les coûts consomment
  (`sacOutlet`) et ce qui la déclenche. Un terrain qui n'ajoute qu'un mana n'est pas du ramp, une carte qui se blesse
  elle-même ne fait pas de l'interaction, une contrainte qu'on s'impose n'est pas du stax.
- Une carte de la collection déjà montée dans le deck se voit : liseré vert (`--ok`) doublé d'un anneau
  intérieur sur sa vignette comme sur sa ligne, et étiquette « dans le deck », suffixée de `×N` au-delà
  d'un exemplaire, dont le titre dit la part montée sur le total possédé. `tagDeck()` (`js/tuiles.js`)
  ne rend rien hors du contexte `collection` : au deck l'étiquette serait vraie de toutes les cartes,
  et les listes annexes ont la leur (`tagAnnexe()`). Le vert fait la paire avec le rouge de « à
  acheter » (`.achat`), qui est l'état inverse — et le seul autre liseré d'état d'une carte. La classe
  `zero`, posée quand plus aucun exemplaire n'est disponible, ne recouvre pas cette notion et reste
  sans style : une carte possédée en quatre exemplaires dont un est monté n'est pas `zero`, et une
  carte possédée à zéro l'est sans être au deck.

- L'onglet Deck porte, sous la courbe de mana, un bloc **« Mana coloré »** : une ligne par couleur,
  la part des symboles que le deck demande en regard de la part des sources qui les produisent, avec
  les nombres et un liseré qui juge l'écart. La courbe dit combien de cartes à chaque coût ; elle ne
  disait rien des couleurs, qui décident pourtant qu'un deck fonctionne. Contrairement à elle, le
  bloc porte sur le **deck entier** et non sur les cartes affichées — comme les jauges de rôle et le
  contrôle de conformité : filtrer sur « créatures » ferait disparaître les terrains qui les lancent,
  et le verdict n'aurait plus de sens. Le bloc le dit en une phrase.
- **Ce que le deck demande** se lisait déjà : `parseCost()` découpe `{2}{G}{G}` en `card.symbols`,
  tableau que seul `manaHTML()` consommait. Un hybride se répartit entre ses façons d'être payé — un
  symbole divisé par le nombre d'options —, si bien que `{W/U}` vaut un demi-blanc et un demi-bleu :
  le compter pour un plein symbole de chaque couleur ferait passer un deck hybride pour deux fois
  plus exigeant qu'il n'est.
- **Ce qu'il produit** n'était connu nulle part. Le nœud `MANA` du graphe le réduit à un booléen —
  son motif `/add \{/` consomme l'accolade sans capturer la lettre — et `card.identity` ressemble à
  une production sans en être une : un Sol Ring qui fait `{C}{C}` a une identité vide, un Farseek qui
  va chercher une Plaine a l'identité verte. `manaProduitDe()` (`js/mana.js`) lit donc `produced_mana`
  quand Scryfall l'a dit, et retombe sinon sur la ligne de type — les types de terrain règlent d'un
  coup les duals, les shocks et les triomes — puis sur les clauses « add » du texte oracle. Le champ
  `card.manaProduit` est **facultatif partout** : un atelier qui n'a jamais vu le réseau lit quand
  même son mana dans le texte.
- La colonne `CH.MANA_PROD` est venue en dernier dans l'archive du catalogue, et **n'a demandé aucune
  migration** : une archive d'hier a dix-sept colonnes, l'indice y rend `undefined`, donc « on ne sait
  pas », donc le texte prend le relais. C'est le chemin qu'avait déjà suivi `CH.NUMERIQUE`.
- Une source compte **une fois par couleur qu'elle produit**, rangée selon qu'elle est un terrain ou
  un accélérateur : un Birds of Paradise est bien une source de vert, sans valoir tout à fait une
  Forêt, et les deux nombres se lisent séparément.
- `repartitionCmc()` (`js/stats.js`) est la seule copie du calcul de la courbe : il était écrit deux
  fois à l'identique, et seule celle de la collection arrondissait. `totalBarre()` arrondit en outre
  la **somme** d'une barre au moment où elle s'écrit — arrondir chaque couleur ne suffisait pas,
  `0,3 + 0,3 + 0,3` ne faisant pas `0,9` en virgule flottante, et la barre annonçait
  « 0.8999999999999999 ».
- La page **Decks** répond à la question qui précède toutes les autres : sur quoi travaille-t-on.
  « Mes decks » montre une vignette par deck — avancement, taille visée, part possédée, reste à
  acheter, budget, restrictions — et porte les gestes : *Nouveau*, *Travailler dessus*, *Configurer*,
  *Dupliquer*, *Supprimer*. La liste d'achats, qui montre le total consolidé, a sa propre page **Wishlist**. La pastille de
  l'en-tête mène à Decks et dit le deck ouvert. Cet onglet ne montre aucune des cinq listes de cartes — des vignettes
  de deck ne se règlent ni en colonnes ni en groupes —, d'où son `liste` nul
  dans `ONGLETS` : le bouton « Affichage » s'efface alors, plutôt que de régler une liste
  qu'on ne voit pas.
- **L'acquisition en cours** est l'entre-deux de la collection et de la liste d'achats : ce qui est
  commandé et pas encore reçu. `S.enCours` (nom -> exemplaires) est sauvegardé par `snapshot()` ;
  `restore()` ne le touche que si le champ est présent, si bien qu'une sauvegarde d'hier ou un paquet
  de synchronisation laisse les commandes de l'appareil intactes — elles ne voyagent pas : une fusion
  par le maximum ressusciterait une commande reçue sur l'autre poste. Une carte en route compte comme
  **couverte** pour les paniers (`aAcheter()`, `wishlist()`, `coutDeck()`, `bilanDeck()`) et donc pour le
  budget, mais **pas comme possédée** — suggestions, légalité et jeu lisent toujours la collection. C'est une
  décision : le budget dit ce qu'il reste à acheter, non ce qu'on a engagé. « Reçue » verse tout à la
  collection ; « Annuler » rend la carte à la liste d'achats.
- Le dernier deck ne se supprime pas : l'atelier n'a pas d'état sans deck ouvert, et « supprimer »
  vaudrait « vider », qui a son propre bouton. Deux decks ne peuvent pas porter le même nom — un
  doublon reçoit un numéro —, sans quoi ils seraient indiscernables dans la pastille comme dans
  chaque ligne de la liste d'achats.
- `copieEtat()` et `memeEtat()` (`js/brouillon.js`) descendent désormais dans les `Map` et les `Set`.
  `JSON` ne sait rendre ni l'un ni l'autre — une `Map` en ressortait vide —, et la fenêtre de
  configuration d'un deck met au brouillon un dossier entier, listes comprises.
- Deux seuils voisins ont été ramenés à un : le plafond par carte se comparait au **prix de
  tendance** dans `js/candidats.js` et au **prix ajusté** dans `bestOffer()`, si bien qu'une carte à
  5,00 € passait le pré-filtre avec un plafond à 5 € pour être rejetée ensuite dès que l'état
  recherché la portait à 6,75 €. `prixBrutMax()` (`js/marche.js`) ramène le plafond au brut, et les
  deux étages écartent au même endroit.
- `aAcheter()` lisait la collection à la clé brute du deck, là où `deckEntries()` passe par `find()` :
  une carte importée sous un autre nom passait pour manquante. `quantiteCollection()` (`js/achats.js`)
  fait le détour, et la liste d'achats — qui rendait ce décalage bien plus visible — ne réclame plus
  ce qu'on possède.
- La mise en page d'une liste de cartes — vue, nombre de colonnes, groupement, tri — se règle dans sa
  fenêtre « Affichage » (`js/fenAffichage.js`), qu'ouvre le bouton du même nom, au coin haut-droit de
  l'en-tête. Les cinq listes de l'atelier en ont une : la collection, le deck (avec ses listes
  annexes), les pistes du graphe, les recommandations d'EDHREC, le catalogue —
  `LISTES_AFFICHAGE` (`js/etat.js`) les nomme. Les quatre réglages valent pour les cinq. Ces réglages
  occupaient les barres des sections en quatre ou cinq contrôles posés entre les boutons d'action, six
  dans celle du deck : les lignes débordaient sur un écran étroit, et chaque geste repeignait aussitôt
  des centaines de vignettes. La fenêtre les prend au brouillon et n'agit qu'à « Appliquer » — on
  choisit tout d'un coup, et la liste n'est redessinée qu'une fois.
- Le bouton est unique et vit dans l'en-tête, à côté de celui des filtres : les deux font la paire,
  l'un choisit ce qu'on voit, l'autre comment on le voit. Cinq boutons identiques, un par page,
  poussaient les actions de chaque section vers la droite pour un réglage qu'on ne change qu'en
  regardant la liste. Il vise la liste de l'onglet ouvert — `ONGLETS` porte le nom de celle que
  chacun montre — et change de cible avec la page, sans que l'en-tête soit repeint
  (`majBoutonAffichage()`, `js/entete.js`). Son infobulle porte le résumé du réglage en vigueur, qui
  n'est plus visible nulle part ailleurs. Son libellé reste lisible à toutes les largeurs — une
  icône seule ne dit pas ce qu'on règle —, et c'est la réserve du coin qui s'élargit pour lui.
- « Appliquer partout », dans la même fenêtre, pose le réglage choisi sur les cinq listes : c'est le
  geste de qui veut tout l'atelier rangé de la même façon, au lieu d'ouvrir cinq fois la même
  fenêtre. Seul un tri qu'une liste n'offre pas (`TRIS_SECTION`, `js/groupes.js` — le taux
  d'inclusion d'EDHREC pour la collection, la quantité pour une proposition) la laisse avec le sien.
- La vue appartient à la liste (`S.vues`), non plus à l'atelier : un seul champ `view` obligeait la
  collection et le deck à la même, alors qu'on lit volontiers l'une en vignettes et l'autre en
  lignes. Les trois listes de propositions l'ont aussi : `sugLigne()` (`js/tuiles.js`) donne à une
  proposition la ligne que seule la collection et le deck avaient — nom, coût, type, étiquettes,
  note, prix, bouton —, et parcourir un classement de trois cents cartes en lignes tient dix fois
  plus de monde à l'écran que leurs vignettes. Une sauvegarde d'hier ne porte que `view`, qui ne
  valait que pour la collection et le deck : les trois autres gardent leurs vignettes.
- Les pistes du graphe se groupent et se trient comme le reste depuis qu'elles ont leur fenêtre :
  elles ne montraient que l'ordre de la notation, et trente pistes autour de deux nœuds se lisent
  mieux rangées par type ou par coût. La pagination d'une catégorie porte désormais sa section —
  `cleLimiteSug()` (`js/sugListes.js`) rend « graphe », « edhrec » ou « suggestions » pour une liste
  sans groupe, « section:catégorie » pour une catégorie —, sans quoi « Créature » partagerait son
  compte entre les trois pages.
- « Vider » ne vide que la liste de sa section : celui de la collection emportait aussi le deck, la
  réserve et l'étude. Le deck survit donc à sa collection — il n'a jamais eu besoin d'elle pour
  exister, une carte qu'on ne possède pas y est comptée à l'achat —, et la fenêtre de confirmation
  annonce ce qu'elle retire, ce qu'elle garde, et combien de cartes du deck passeront à l'achat. Le
  geste qui prend tout reste « Effacer les données locales », dans la fenêtre des paramètres.
- **Supprimer une carte, et garder la date de son ajout** (`js/collectionDates.js`). Chaque ligne et
  chaque vignette de la collection porte un « ✕ » qui retire la carte entière, tous exemplaires, après
  une fenêtre de confirmation (`openSupprCarteModal()`, `js/collection.js`) ; le « − » du champ de
  recherche, lui, ôte un exemplaire. `S.collectionDates` dit quand les exemplaires sont venus — nom ->
  `[[AAAA-MM-JJ, n], …]` : un jour où l'on ajoute deux exemplaires fait une entrée, non deux. Elle
  n'est jamais écrite à la main : toute écriture dans la collection passe par `ajouteACollection()`,
  `retireDeCollection()`, `supprimeDeCollection()` ou `videCollection()`, qui tiennent les deux tables
  d'accord (un retrait ôte les exemplaires les plus récents). **Les dates ne couvrent pas forcément
  toute la quantité** : une collection saisie avant elles n'en porte aucune, et l'on n'en invente pas ;
  l'écart se lit « date inconnue ». La sauvegarde (`snapshot()`) les range ; `restore()` lit une
  sauvegarde d'hier sans elles. Elles voyagent avec le fond de la synchronisation
  (`fusionneDates()`, `js/nuageFusion.js`) : pour chaque date, le plus grand nombre vu d'un côté ou de
  l'autre, puis rien au-delà de la quantité fusionnée. Une ligne affiche la première date et combien
  d'autres (`05/01/2026 (+1)`), l'infobulle et la fiche les détaillent, et la collection se trie par
  date d'ajout.
- La collection et le deck portent les mêmes trois boutons — **Importer**, **Exporter**, **Vider** —
  et le même champ de recherche sous eux. Les deux barres divergeaient : « Ajouter » ouvrait une
  fenêtre, « Importer MTGO » n'était nommé que d'un côté, « Exporter » n'existait que pour le deck,
  et un « Compléter N cartes » s'y glissait quand des cartes arrivaient sans texte — il vit désormais
  dans l'encadré qui l'explique, où il a sa raison sous les yeux. La collection s'exporte comme le
  deck, aux trois mêmes formats (`exportModal()`, `js/fenExport.js`).
- Le champ de recherche d'une section (`js/rechercheSection.js`) remplace le bouton « Ajouter » et sa
  fenêtre : on tape, les cartes se proposent, le nom survolé montre son visuel comme partout
  ailleurs, et le clic en ajoute un exemplaire à la liste de la section. Chaque proposition porte à
  droite un **compteur** — ce que la liste en contient déjà —, et ce que l'autre liste en porte quand
  elle en porte : on voit d'un coup d'œil qu'une carte est déjà montée au deck. Le compteur se fait
  défiler, par ses deux boutons ou à la molette au-dessus de lui, ce qui remplace le champ
  « Exemplaires » de la fenêtre d'avant : on ajuste en voyant ce qu'on a. C'est le seul endroit où
  l'atelier retienne la molette, et l'infobulle du compteur le dit. Les deux listes annexes gardent
  la fenêtre (`js/fenAjout.js`) : elles n'ont pas de barre à elles.
- La frappe ne réécrit que les propositions ; la section entière l'est à chaque ajout, et le champ y
  perdrait sa frappe et le curseur. Ils sont donc gardés dans `RECHERCHE` et rendus après coup par
  `restaureRecherche()`, qui ne reprend le curseur que si plus rien ne l'a — un rendu déclenché
  ailleurs ne doit pas l'arracher à autre chose.
- **Les trois listes de propositions ne se notent que sous les yeux.** Elles lisent une même
  sélection notée — des dizaines de milliers de cartes —, et tout geste qui touche l'état la
  périme : manipuler un deck coûtait une notation complète par clic, pour des pages qu'on ne
  regardait pas. `suggestionsVisibles()` (`js/differe.js`) dit si l'onglet ouvert en porte une ;
  sinon `renderSuggestions()` renonce, `currentSuggestions()` rend la dernière sélection connue
  sans renoter, et `recalculLong()` retombe sur la voie courte — un simple `renderAll()`, qui
  refait la courbe de mana, les jauges, la collection et le graphe comme avant. L'onglet laissé
  en arrière porte un point posé, et `activerOnglet()` reprend sa page à l'ouverture
  (`rattraperSuggestions()`), annoncée comme n'importe quel recalcul. Les trois sont différées
  ensemble parce qu'elles partagent cette sélection : n'en différer qu'une ne gagnerait rien. La
  requête EDHREC, elle, part toujours — c'est du réseau, non du calcul, et la note des cartes du
  deck en dépend.
- Les jauges d'équilibre des rôles de la section Deck sont des filtres à part entière : les cocher agit partout, comme
  n'importe quel filtre de l'en-tête, et les mêmes boutons figurent dans la fenêtre des filtres.
- Leurs objectifs se règlent à la main : le pinceau posé contre le titre ouvre la fenêtre
  « Objectifs par rôle » (`js/fenCibles.js`), un champ par rôle, avec le décompte du deck et ce que le
  format propose en regard. Comme les filtres, elle tient un brouillon et n'agit qu'à « Appliquer » —
  les cibles pèsent dans la notation, et renoter à chaque frappe coûterait une seconde pour un chiffre
  qu'on n'a pas fini de taper ; « Réinitialiser » vide le brouillon, « Annuler » le jette. Les champs
  ont d'abord vécu dans les jauges elles-mêmes, le temps d'un mode : mais une jauge est un filtre, et
  lui faire porter tantôt un bouton tantôt un champ, c'était un geste pour deux intentions.
- `ciblesParDefaut()` donne ce que le format propose, `targets()` y superpose ce qu'on a réglé
  (`js/legalite.js`), et tout l'atelier passe par cette seconde : les jauges, la fiche d'une carte et
  la notation, qui pèse ce qui manque au deck. Les réglages tiennent dans `S.ciblesRoles`, **par
  format** — une cible de terrains pensée pour cent cartes n'a rien à dire d'un deck de soixante —,
  et l'état ne garde que ce qui s'écarte : une valeur rendue à celle du format disparaît d'elle-même.
  Une jauge dont l'objectif a été réglé le dit d'un point, sans quoi rien ne la distinguerait d'une
  jauge qui suit le format.
- La fiche d'une carte feuillette ses éditions, sous deux listes. « Mes éditions » vient de `card.impressions`,
  relevées à l'import, dont `chercheImpressions()` rapporte les visuels en une requête à l'ouverture de la fiche.
  « Toutes » vient de `chercheToutesEditions()`, une recherche Scryfall en « unique=prints » limitée au papier et
  lancée seulement si on la demande — une carte peut compter des dizaines d'impressions, il n'y a pas lieu d'aller
  les chercher à chaque fiche ouverte.
- « Afficher cette illustration en priorité » écrit `card.impressionChoisie` et recopie visuel et illustrateur dans
  la carte : tout ce qui lit `card.img*` suit sans rien changer — vignettes de la collection, aperçu au survol, deck.
  L'édition de référence, le nom de set, le prix et le lien d'achat ne suivent que si l'édition est possédée : choisir
  une illustration ne doit ni laisser croire qu'on possède l'impression, ni fausser le budget. Un choix explicite fait
  ensuite autorité — `besoinScryfall()` cesse de vouloir corriger le visuel, et `applyScryfall()` ne le remplace que
  sur réponse portant sur cette impression.
- Le visuel d'une fiche a trois états : présent, en cours de recherche — une carte vide à ses proportions et son
  icône de chargement — ou introuvable, auquel cas le panneau de texte prend sa place. Le second s'appuie sur des
  drapeaux posés le temps de l'aller-retour (`imgEnCours`, `visuelsEnCours`, `editionsEtat`) : `imgTried`, posé dès la
  mise en file, dit qu'on a demandé, pas qu'on a reçu. `rafraichirFiche()` reconstruit la fiche ouverte quand la file
  Scryfall aboutit ou renonce, sans quoi l'attente resterait affichée.
- Seule l'édition choisie est conservée d'une session à l'autre ; les visuels des autres sont redemandés à l'ouverture
  de la fiche, pour ne pas alourdir la sauvegarde.
- La fenêtre des filtres applique en direct : le décompte de cartes retenues suit la frappe. « Annuler » ne renonce
  donc pas à appliquer, il revient à l'instantané pris à l'ouverture — critères et couleurs comprises. Seul
  « Appliquer » garde ce qui est en vigueur ; la croix, Échap et l'arrière-plan valent Annuler.
- Un filtre posé une fois vaut partout : `carteFiltree()` filtre la collection, le deck et sa courbe de mana,
  les statistiques, le graphe et les suggestions d'ajout. La taille du deck, sa conformité au format et
  l'équilibre des rôles restent calculés sur le deck entier.
- Les archétypes viennent entièrement d'EDHREC, sans geste de l'utilisateur : la liste des thèmes se charge au
  démarrage si rien n'est en cache, et se revérifie une fois par semaine. EDHREC ne publiant aucun manifeste daté,
  cette vérification relit l'index et ne remplace la liste que si elle diffère vraiment ; si EDHREC ne répond pas, la
  liste déjà connue reste en place et la date n'est pas touchée, si bien que le lancement suivant retente. Les cartes
  d'un thème ne sont cherchées qu'à sa première utilisation, puis gardées en cache. `ARCH_LABELS` et `ARCH_RESUMES` ne servent qu'à l'affichage : un libellé français
  et une phrase de fonctionnement pour les thèmes les plus courants. Chaque thème affiche une phrase, sans exception :
  la nôtre, sinon celle qu'EDHREC publie, sinon une phrase formée sur son nom.

## Vérifications

Il n'y a pas de suite versionnée : l'atelier n'a pas de build et ses fonctions vivent dans la portée
globale d'une page, si bien qu'on le vérifie là où il tourne. Un serveur statique et un navigateur
piloté suffisent :

```
python3 -m http.server 8123
```

puis Playwright sur `http://127.0.0.1:8123/index.html`, qui interroge la page comme le ferait un
lecteur : présence des fonctions, textes rendus, styles calculés, état de `S` après un geste. Le
réseau vers Scryfall et EDHREC étant coupé dans un bac à sable, les données extérieures s'injectent
à la main (`S.edhrec = …`) ; les 404 sur `oracle-cards.json*` au démarrage sont normaux — l'atelier
cherche une archive locale qui n'est pas dans le dépôt.

`node outils/genDoc.js --verifie` sort en erreur si `doc/fonctions.md` ne correspond plus aux
sources : c'est la seule vérification qui se prête à un contrôle automatique.
