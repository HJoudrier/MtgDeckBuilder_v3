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
  jeuCaracteristiques.js  force, endurance, mots-clés du moment
  jeuCibles.js      juger un objet contre un descripteur
  jeuMana.js        la réserve, et le paiement automatique
  jeuOpsA.js        exécuter les opérations : références, dégâts, vie, cartes, retraits
  jeuOpsB.js        jetons, marqueurs, pompes, recherches ; l'enchaînement
  jeuDeclencheurs.js  des évènements aux capacités déclenchées
  jeuEtatsDeJeu.js  les actions d'état, et un joueur qui perd
  jeuLancer.js      les actions légales, le coût d'un sort, le choix des cibles
  jeuActions.js     jouer un terrain, lancer, activer, équiper
  jeuVariantes.js   kicker, rachat, évocation, présage, convocation, exploration, écho, folie, suspension
  jeuDurees.js      ce qui dure : effets, déclencheurs retardés, retours d'exil, régénération
  jeuFaces.js       faces d'une carte, face cachée, transformation, sagas, véhicules
  jeuPile.js        la priorité, la pile, la résolution
  jeuCombat.js      attaquants, bloqueurs, dégâts de combat
  jeuTour.js        les étapes d'un tour
  jeuPartie.js      mélange, mulligans, la partie entière
  jeuPilote.js      dérouler une partie, question après question
  jeuVue.js         ce qu'un joueur voit de la partie, et une question lisible par un humain
  jeuArrets.js      quand demander à un joueur humain
  forgeValide.js    le langage de filtres de Forge (`Creature.OppCtrl+powerLE2`)
  forgeExpr.js      les quantités de Forge (`Count$Valid …`, `Count$xPaid`, `/Twice`)
  forgeDefini.js    ce que `Defined$` désigne (`Targeted`, `Remembered`, `TriggeredCard`…)
  forgeCout.js      lire un coût de Forge (`2 R T Sac<1/CARDNAME>`)
  forgeEffetsA.js   le registre des effets, la porte `executeForge()`, zones et cartes
  forgeEffetsB.js   bibliothèque, dégâts et vie, retraits, jetons et marqueurs
  forgeEffetsC.js   pompes, engagements, mana, combats, contrôle, mémoire, réflexes
  forgeEffetsD.js   régénération, effets temporaires, déclencheurs retardés, capacités accordées
  forgeDeclencheurs.js  quand un déclencheur de Forge se déclenche
  forgeStatiques.js les statiques de Forge, lues par car(), coutSort(), peutBloquer()
  forgeRemplacements.js  les remplacements de Forge : exil au lieu du cimetière, dégagement, contre, prévention
  forgeMotsCles.js  les mots-clés de Forge (`K:`)
  forgeDefinition.js  d'un script de Forge à une définition de jeu
  iaValeur.js       ce que vaut une carte, un permanent, un adversaire
  iaChoix.js        garder sa main, cibler, chercher, défausser
  iaPriorite.js     ce que le joueur automatique fait de sa priorité
  iaCombat.js       attaquer et bloquer
  iaAgent.js        un joueur automatique

  — ce qui vient du dehors —
  champsJeu.js      ce que le moteur demande à une carte : mots-clés, loyauté, faces
  symboles.js       les symboles de mana
  scryfallApplique.js  verser une réponse de Scryfall dans une carte
  scryfall.js       la file d'attente vers Scryfall
  recherches.js     les recherches nommées chez Scryfall
  decksStockage.js  les dossiers de deck, rangés et relus
  stockage.js       la sauvegarde locale
  fenSauvegarde.js  les sections « Sauvegarde » et « Catalogue »
  idb.js            le magasin IndexedDB
  nuagePaquet.js    ce qui voyage d'un appareil à l'autre, et sous quelle forme
  nuageFusion.js    fusionner deux appareils sans rien perdre
  nuageDropbox.js   l'adaptateur Dropbox : PKCE, et le `rev` comme verrou
  nuage.js          la synchronisation : sa configuration, et son calendrier
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
  collection.js     la section Collection
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
  simCartes.js      d'un nom de carte à sa fiche de jeu, adversaires compris
  simAdversaires.js la bibliothèque d'adversaires
  decksLies.js      les adversaires qui suivent un deck Moxfield ou Archidekt
  simPreparation.js d'un deck ou d'un adversaire à un siège de table
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
  entete.js         l'en-tête et la barre des onglets
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
  fenAdversaire.js  ajouter ou modifier un adversaire
  fenComportement.js  décrire à la main ce que fait une carte
  fenJournal.js     revoir une partie d'un lot

  — les gestes —
  gestesDecks.js    créer, ouvrir, configurer, dupliquer, supprimer un deck
  gestesVue.js      fermer, cocher une couleur, changer d'onglet
  gestesReglages.js « Appliquer » des fenêtres de réglage, jauges, pagination
  gestesDeck.js     monter, démonter, garer, ouvrir une fiche
  gestesDonnees.js  sauvegarde, archive, EDHREC, import
  gestesNuage.js    connecter, synchroniser, déconnecter
  gestesGraphe.js   isoler un nœud, allonger une liste, ouvrir une vignette
  gestesSimulation.js  lancer un lot, gérer les adversaires, revoir une partie

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
  tableRendu.js     la table, peinte depuis une vue
  tableQuestions.js répondre à une question du moteur, à la main
  tableCombat.js    attaquer et bloquer, au doigt
  tableSalon.js     le salon : qui s'assoit, avec quel deck
  tableLiaison.js   les invités de l'hôte
  tableInvite.js    rejoindre la table d'un autre
  tableReprise.js   reprendre une partie après un rechargement
  fenArrets.js      les arrêts de la table
  gestesTable.js    les gestes de la table interactive

  app.js            l'aiguillage et le démarrage
```

Les dix sections de la page se répartissent en sept onglets, posés au bas de l'en-tête et
toujours visibles : **Decks** porte la liste des decks puis la liste d'achats commune,
**Collection** porte les statistiques puis la collection, **Deck** porte le
deck, **Graphe** porte le graphe des capacités puis les pistes branchées sur les nœuds qu'on y
isole, **EDHREC** porte les statistiques du commandant et les cartes que les decks recensés
recommandent — groupées et triées à part, avec deux tris qui n'existent que là : le taux
d'inclusion et la synergie —, **Catalogue** porte le classement complet, groupé et paginé,
**Simulation** fait jouer le deck contre des adversaires automatiques (plus bas). La table
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
joueur automatique, contre un à cinq adversaires automatiques, des centaines de fois, et en tire de
quoi classer sa force. Chaque siège garde le format de son deck : un deck Commander joue à 40 points
de vie avec sa zone de commandement, sa taxe et ses dégâts de commandant, un deck de soixante à 20.
Les adversaires viennent d'une **bibliothèque à part** (`S.adversaires`) : des listes collées, au
format MTGO ou Arena, lues par l'analyseur de l'import (`parseMtgoList()`), qui n'encombrent ni
« Mes decks » ni la liste d'achats. Leurs cartes n'ont pas à être possédées : `ficheParNom()`
(`js/simCartes.js`) les cherche dans l'atelier, puis dans l'archive indexée par nom, puis chez
Scryfall, et les garde dans IndexedDB (`sim-cartes`) — **jamais dans `DB`**, que la sauvegarde
locale emporterait.

**Les adversaires liés.** Un adversaire peut suivre un deck publié sur Moxfield ou Archidekt
(`js/decksLies.js`) : le lien se donne dans sa fenêtre, et à l'ouverture de l'atelier, une fois
par jour au plus, la liste est relue ; un changement met l'adversaire à jour, le dit d'un toast
(« +3 −2 »), et rend périmés les lots joués contre l'ancienne version — sans code à part, le lien
n'étant qu'un champ de plus sur l'adversaire (`lien`), sauvegardé et synchronisé avec lui. Chaque
site est un petit adaptateur (`SITES_DECKS`) : où est son API, comment lire sa réponse ; la réserve
et les « maybe » ne jouent pas. La lecture suit une **chaîne de repli**, parce que Moxfield n'a pas
d'API publique et refuse probablement d'être lu depuis une autre page (CORS) : la lecture directe
d'abord ; puis, s'il est réglé, un **relais** à soi (`S.simulation.relais`, propre à l'appareil) ;
en dernier recours, la fenêtre de l'adversaire s'ouvre sur un lien vers le deck et l'on colle son
export — le lien est gardé, la vérification du lendemain réessaiera. Ce dernier chemin marche
toujours ; rien ne garantit les deux premiers, qu'un site peut fermer du jour au lendemain. La
pastille de l'adversaire dit où il en est, et son bouton « Mettre à jour » relit à la demande.

Le relais est un Cloudflare Worker gratuit : sur le tableau de bord Cloudflare, *Workers* → *Créer*,
coller le script ci-dessous, *Déployer*, puis copier son adresse dans le réglage « Relais » de la
section des adversaires. Il ne lit que les API des deux sites, ne voit que l'identifiant d'un deck
public, et ajoute l'en-tête qui autorise la page à lire la réponse. Si un site refuse aussi les
requêtes du relais, il reste le collage.

```js
export default {
  async fetch(requete) {
    const cible = new URL(requete.url).searchParams.get('url') || '';
    const cors = {'Access-Control-Allow-Origin': '*'};
    if (!/^https:\/\/(api2\.moxfield\.com|archidekt\.com\/api)\//.test(cible))
      return new Response('adresse refusée', {status: 400, headers: cors});
    const r = await fetch(cible, {headers: {'Accept': 'application/json', 'User-Agent': 'atelier-mtg (relais personnel)'}});
    return new Response(r.body, {status: r.status, headers: {...cors,
      'Content-Type': r.headers.get('Content-Type') || 'application/json', 'Cache-Control': 'max-age=600'}});
  }
};
```

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
partie. La partie hébergée est rangée à chaque réponse dans IndexedDB (`table-partie`) : le moteur
étant déterministe, la graine, les fiches et les réponses suffisent à la **rejouer à l'identique**
après un rechargement.

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
chaque résultat porte un badge de fiabilité. Une carte se décrit à la main dans la fenêtre des
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

## Le modèle Forge

Le compilateur d'oracle devine les effets dans l'anglais, et plafonne vite. **Forge** — un moteur
Java libre, sous GPL-3.0 — a écrit chacune de ses trente-quatre mille cartes dans un langage
structuré : un fichier par carte, une ligne par capacité, `A:SP$ DealDamage | ValidTgts$ Any |
NumDmg$ 3`. L'atelier s'en sert, sans rien en embarquer.

**La source** (`js/forgeDepot.js`). Les scripts sont téléchargés depuis le dépôt public de Forge sur
GitHub, sur l'appareil seulement, et gardés par paquets dans IndexedDB (clés `forge-*`, qu'`idbVider()`
épargne). La liste vient de l'API (quatre requêtes, avec l'empreinte `sha` de chaque fichier), les
fichiers de `raw.githubusercontent.com` épinglé au commit, dix à la fois. Vos cartes et celles de
vos adversaires passent d'abord ; un téléchargement interrompu reprend ; une fois par semaine, seuls
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

**Une propriété de filtre inconnue ne laisse rien passer**, une condition inconnue est fausse, un
morceau de coût inconnu fait écarter la capacité : un script mal compris rend la carte plus faible,
jamais plus forte.

## La synchronisation entre appareils

Un même atelier sur deux PC, par un dossier d'application Dropbox — aucun serveur de l'atelier
n'est en jeu, les données vont de ce navigateur au nuage et en reviennent. Trois décisions la
gouvernent.

**Trois étages, fusionnés différemment** (`js/nuagePaquet.js`). Le **fond** — la collection, les
decks avec tout ce qu'ils portent, le format personnalisé, les préférences d'achat — est l'intention
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
  *Dupliquer*, *Supprimer*. « Liste d'achats » montre le total consolidé. La pastille de l'en-tête y
  mène et dit le deck ouvert. Cet onglet ne montre aucune des cinq listes de cartes — des vignettes
  de deck et un tableau d'achats ne se règlent ni en colonnes ni en groupes —, d'où son `liste` nul
  dans `ONGLETS` : le bouton « Affichage » s'efface alors, plutôt que de régler une liste
  qu'on ne voit pas.
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
