# Atelier MTG — architecture du projet

Application d'aide à la construction de deck Magic. Aucun serveur, aucune dépendance :
les fichiers s'ouvrent directement dans un navigateur.

## Organisation

```
index.html          page et structure des cinq sections
css/atelier.css     styles
js/                 modules, chargés dans cet ordre :
  effets.js        Lecture des effets des cartes
  cartes.js        Base de cartes
  etat.js          État et filtrage
  marche.js        Cardmarket
  scryfall.js      Accès à Scryfall
  stockage.js      Sauvegarde locale
  externes.js      EDHREC et Commander Spellbook
  graphe.js        Graphe des capacités
  stats.js         Statistiques
  suggestions.js   Suggestions d'ajout
  collection.js    Collection
  deck.js          Deck
  ui.js            Interface commune
  app.js           Démarrage et évènements
```

Les cinq sections de la page sont Collection, Statistiques, Graphe des capacités, Deck et Suggestions ;
le format et les filtres se règlent depuis deux fenêtres ouvertes par l'en-tête. Les identifiants internes
des sections (`secB`…`secF`, `renderB`…`renderF`) ont gardé leur lettre d'origine, seule la lettre affichée
a été resserrée après le passage de la section « Filtres & Format » en fenêtre.

L'ordre de chargement compte : `effets.js` définit l'analyseur qu'utilise `cartes.js`
au moment de construire la base livrée. Les modules partagent la portée globale ;
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

### `js/effets.js` — Lecture des effets des cartes

Transforme le texte oracle en évènements. C'est le cœur de l'analyse : ontologie des 91 évènements, règles de détection, qualificateurs de déclencheur, table des coûts, et calcul des synergies entre deux cartes.

*20 fonction(s), 37 Ko*

Données : `GROUPS`, `NODES`, `NODE`, `IMPLICIT`, `EFFECT_RULES`, `TRIGGER_RULES`, `SUJETS`, `DEBUTS_EFFET`, `COUTS`, `CATLABEL`, `EQUIV`

| Fonction | Rôle |
|---|---|
| `parseCost(cost)` | Décompose un coût de mana en symboles, valeur de mana et couleurs. |
| `stripReminder(t)` | Retire le texte de rappel entre parenthèses. |
| `splitAbilities(text)` | Sépare le texte oracle en capacités distinctes. |
| `matchAll(rules, s)` | Applique une table de règles à une clause et renvoie les concepts reconnus. |
| `qualifieDeclencheur(clause,selfNames)` | Extrait le sujet, la portée et les restrictions d'un déclencheur (force ≥ 3, non-jeton, type de sort…). |
| `qualifieProduction(clause,card)` | Décrit ce qu'une production met en jeu : jeton ou non, force, destination. |
| `libelleQual(q)` | Traduit un qualificateur en français lisible. |
| `compat(prod,trig)` | Décide si une production satisfait les restrictions d'un déclencheur ; 0 = incompatible, 1 = certain. |
| `coupeDeclencheur(body)` | Trouve la virgule qui sépare le déclencheur de l'effet, en ignorant les énumérations. |
| `coutsDe(cost,selfNames)` | Identifie les coûts d'activation d'une capacité et ce qu'ils produisent. |
| `refineTriggers(list,clause)` | Écarte le déclencheur général quand un plus précis a été reconnu. |
| `scopeOf(s)` | Détermine si une clause vise votre côté ou celui de l'adversaire. |
| `refineEffects(list, clause)` | Arbitre les conflits entre effets détectés (blink contre exil, négations…). |
| `analyze(card)` | Analyse une carte : capacités, arcs déclencheur → effet, accroches et productions. |
| `categories(card)` | Rôles d'une carte, croisant son type avec les capacités, coûts et déclencheurs relevés par `analyze()`. Le rôle `interaction` couvre destruction, exil, renvoi, dégâts et contresorts. |
| `feeds(concept)` | Concepts qu'une production peut alimenter, équivalences comprises. |
| `feedsDe(p)` | Même chose, en tenant compte du détail de la production. |
| `croise(prods,trigs,dir,out)` | Croise les productions d'une carte avec les accroches d'une autre. |
| `synergyBetween(a,b)` | Liens entre deux cartes, avec leur concept, leur sens et leur fiabilité. |
| `partnersFor(card,pool)` | Cartes d'un ensemble qui interagissent avec une carte donnée. |

### `js/cartes.js` — Base de cartes

Catalogue livré avec l'atelier, fabrique de cartes, index de recherche tolérant aux accents, apostrophes et faces multiples,
rôles de deck déduits du texte oracle, et tables d'affichage des archétypes — libellés français et résumés de
fonctionnement — dont la liste et le contenu viennent d'EDHREC. Les textes livrés avec l'atelier sont des résumés :
ils sont remplacés par le texte oracle complet dès que Scryfall ou le catalogue local répond.

*21 fonction(s), 37 Ko*

Données : `RAW`, `DB`, `TYPE_ORDER`, `BUILTIN`, `CATLABEL`, `ARCH_LABELS`, `ARCH_RESUMES`

| Fonction | Rôle |
|---|---|
| `norm(s)` | Normalise un nom : casse, espaces, apostrophes typographiques. |
| `loose(s)` | Forme simplifiée d'un nom, sans accents ni ponctuation. |
| `buildCard(name,cost,type,price,text)` | Fabrique une carte complète à partir de ses champs bruts, analyse comprise. |
| `indexCard(card)` | Indexe une carte par nom exact, forme simplifiée et face avant. |
| `unindexCard(card)` | Retire une carte des index. |
| `registerCard(card)` | Ajoute une carte à la base si elle n'y est pas déjà. |
| `find(name)` | Retrouve une carte malgré les variantes d'écriture ou une face seule. |
| `peutCommander(c)` | Vérifie qu'une carte peut être commandant. |
| `commandantsPossibles()` | Créatures légendaires du deck éligibles au rôle. |
| `mainType(c)` | Type principal en français, face avant pour les cartes multi-faces. |
| `reanalyser(card)` | Refait analyse, rôles et archétypes après un changement de texte ou de force. |
| `majTexteOracle(card,texte)` | Remplace le résumé de la base intégrée par le texte oracle complet d'une source officielle, puis relance l'analyse. |
| `seedCollection()` | Collection de démonstration, au premier lancement. |
| `mergeInto(card,canonical)` | Fusionne deux entrées désignant la même carte. |
| `renameCard(card,newName)` | Renomme une carte vers son nom canonique en migrant les quantités. |
| `frontFace(n)` | Nom de la face avant d'une carte recto-verso. |
| `scryTarget(sc,map)` | Retrouve la carte locale correspondant à une réponse Scryfall. |

### `js/etat.js` — État et filtrage

L'objet d'état unique, les formats de jeu et les fonctions qui dérivent collection filtrée, deck, disponibilité et liste d'achat.
C'est aussi ici que vivent les filtres de l'en-tête : les couleurs (`S.colors`, `S.colorMode`), la recherche
libre (`S.search`), le type de carte (`S.typeFilter`) et les critères de `S.filtres` (archétypes, nom,
illustrateur, force, endurance, coût de mana, prix), ainsi que l'index des archétypes établis par EDHREC
(`ARCH_BASE`).

*22 fonction(s), 11 Ko*

Données : `FORMATS`, `S`, `PAGE`, `FILTRES_VIDE`, `FILTRES_BORNES`, `ARCH_BASE`

| Fonction | Rôle |
|---|---|
| `fmt()` | Contraintes du format en cours : taille, copies, commandant. |
| `eur(n)` | Formatage d'un montant en euros. |
| `esc(s)` | Échappement HTML. |
| `colorOK(card)` | Applique le filtre de couleur de la fenêtre des filtres à une carte. |
| `carteFiltree(card)` | Prédicat unique : couleurs, recherche, type, rôle et critères de la fenêtre. Vaut pour la collection, le deck, la courbe et les suggestions. |
| `rolesFiltre()` | Rôles cochés, lus depuis la liste conservée dans `S.filtres`. |
| `basculerRole(role)` | Coche ou décoche un rôle ; sans argument, les efface tous. |
| `roleOK(card)` | La carte tient au moins un des rôles cochés. |
| `rechercheOK(card)` | La recherche libre : nom, type ou texte. |
| `typeOK(card)` | Le type principal retenu dans la fenêtre. |
| `filtreOK(card)` | Applique les filtres de la fenêtre (archétype, nom, illustrateur, force, endurance, coût, prix) à une carte. |
| `archetypesFiltre()` | Archétypes cochés, lus depuis la liste conservée dans `S.filtres`. |
| `basculerArchetype(id)` | Coche ou décoche un archétype. |
| `archetypesDisponibles()` | Les thèmes publiés par EDHREC, avec libellé et résumé. |
| `resumeArchetype(slug)` | Résumé d'un archétype : le nôtre, celui d'EDHREC, ou une phrase formée sur son nom. |
| `libelleArchetype(slug)` | Libellé d'un thème : le nôtre s'il existe, sinon celui d'EDHREC. |
| `archetypesAChargerEdhrec()` | Thèmes cochés dont les cartes restent à chercher. |
| `archetypesCarte(card)` | Archétypes d'une carte, d'après les thèmes EDHREC chargés. |
| `filtresActifs()` | Filtres en vigueur : libellé et clés à effacer, pour les puces de l'en-tête. |
| `texteFiltresActifs(sep)` | Ces mêmes libellés mis bout à bout, pour les infobulles et les résumés. |
| `majFiltre(cle,valeur)` | Écrit un champ de la fenêtre dans l'état, quelle que soit sa maison. |
| `effacerFiltre(cles)` | Retire un filtre depuis la croix de sa puce. |
| `reinitFiltres()` | Remet tous les filtres à vide, recherche et type compris. |
| `nombreFiltre(v)` | Lit une borne numérique saisie ; renvoie `null` si le champ est vide. |
| `collectionCards()` | Collection sous forme de paires carte / quantité. |
| `filtered()` | Collection filtrée puis triée selon les réglages courants. |
| `deckEntries()` | Cartes du deck, regroupées par type puis par coût. |
| `deckSize()` | Nombre de cartes du deck. |
| `availableFor(card)` | Exemplaires de la collection non encore engagés dans le deck. |
| `aAcheter()` | Cartes du deck non couvertes par la collection, chiffrées. |
| `spent()` | Total estimé des cartes à acheter. |

### `js/marche.js` — Cardmarket

Échelle d'état, langues et types de vendeur du site, estimation de prix à partir de la tendance, liens vers les fiches.

*3 fonction(s), 2 Ko*

Données : `CONDITIONS`, `COND_MULT`, `CM_LANGS`, `LANG_MULT`, `SELLER_TYPES`, `SELLER_MULT`, `CM_COUNTRIES`

| Fonction | Rôle |
|---|---|
| `cmLink(card)` | Adresse de la fiche Cardmarket d'une carte. |
| `cmEstimate(card)` | Estime un prix à partir de la tendance, selon état, langue et vendeur. |
| `bestOffer(card)` | Meilleure offre compatible avec les filtres et le prix maximum. |

### `js/scryfall.js` — Accès à Scryfall

Symboles de mana, visuels, complétion des cartes importées, recherche en ligne, et catalogue complet : lecture de l'archive JSONL compressée, mise à jour, prix.

*33 fonction(s), 29 Ko*

Données : `CAT`, `IDB_NOM`, `CH`, `CDN`, `FICHIERS_LOCAUX`

| Fonction | Rôle |
|---|---|
| `loadSymbology()` *(async)* | Récupère les adresses officielles des symboles de mana. |
| `chercheVerso(card)` *(async)* | Récupère le verso d'une carte recto-verso quand l'archive ne l'a pas. |
| `compacte(sc)` | Réduit une carte Scryfall aux champs utiles à l'analyse et au classement. |
| `autoCatalogue()` | Décide si le catalogue peut se charger tout seul. |
| `estGzip(nom,octets)` | Détecte une archive compressée par son nom ou sa signature. |
| `fluxTexte(source,nom)` *(async)* | Ouvre un flux de texte, décompression comprise. |
| `retiens(par,rec)` | Ne garde qu'une entrée par nom, la mieux classée. |
| `tailleEstimee(cartes)` | Estime le poids de l'archive par échantillonnage. |
| `lireCatalogueFichier(source,nom)` *(async)* | Lit une archive Scryfall en flux et en extrait le catalogue. |
| `chargerCatalogueLocal()` *(async)* | Cherche une archive posée à côté de la page. |
| `verifierMajCatalogue()` *(async)* | Interroge l'index Scryfall : date, adresse et taille de la version publiée. |
| `catalogueObsolete()` | Compare l'archive locale à la version publiée. |
| `majPrix(force)` *(async)* | Rafraîchit les prix des seules cartes possédées ou jouées. |
| `telechargerCatalogue()` *(async)* | Télécharge l'archive et l'extrait sans fichier intermédiaire. |
| `chargerCatalogueComplet(force)` *(async)* | Charge le catalogue : cache, puis fichier local, puis réseau. |
| `completeDepuisRec(c,rec)` | Complète une carte existante avec ce que l'archive apporte de plus, texte oracle compris. |
| `carteDuCatalogue(rec)` | Matérialise une carte du catalogue et l'analyse. |
| `invaliderCandidats()` | Invalide la sélection mémorisée. |
| `signatureCandidats()` | Signature des critères, pour ne recalculer qu'en cas de changement. |
| `appliqueCatalogueAuxCartes()` | Reporte les textes oracle complets et les prix de l'archive sur vos cartes. |
| `candidatsCatalogue()` | Cartes du catalogue retenues par les couleurs, le format et le prix. |
| `requeteCatalogue()` | Construit la requête Scryfall correspondant au format et aux couleurs. |
| `signatureCatalogue()` | Signature du contexte de chargement du catalogue. |
| `chargerCatalogue()` *(async)* | Chargement paginé par l'API, en secours de l'archive. |
| `applyScryfall(sc,requested,imagesOnly)` | Applique une réponse Scryfall à une carte : texte, visuels, prix, verso. |
| `besoinScryfall(c)` | Dit si une carte attend encore son visuel ou son texte oracle complet. |
| `queueScryfall(cards)` | Met en file les cartes dont le visuel ou le texte complet manque. |
| `runScryQueue()` *(async)* | Vide cette file par lots, sans saturer le réseau. |
| `chercheTexte(card)` *(async)* | Va chercher le texte oracle complet d'une seule carte, pour la fiche ouverte. |
| `completeUnknown(names)` *(async)* | Complète les cartes importées, en trois passes de plus en plus tolérantes. |
| `chercheScryfall(q,cible)` *(async)* | Recherche en ligne pour la boîte d'ajout. |

### `js/stockage.js` — Sauvegarde locale

Instantané de l'état vers localStorage, archive du catalogue en IndexedDB, fenêtre de gestion des données.

*16 fonction(s), 16 Ko*

Données : `STORE_KEY`, `STORE_OFF`

| Fonction | Rôle |
|---|---|
| `idb()` | Ouvre la base IndexedDB. |
| `idbLire(cle)` | Lit une clé de l'archive. |
| `idbEcrire(cle,val)` | Écrit une clé dans l'archive. |
| `idbVider()` | Efface l'archive du catalogue. |
| `snapshot()` | Instantané de l'état à enregistrer. |
| `ecrire(payload)` | Écriture brute dans localStorage. |
| `save()` | Enregistre, avec repli allégé si l'espace manque. |
| `scheduleSave()` | Enregistrement différé après une modification. |
| `restore(d)` | Restaure un instantané, cartes importées comprises. |
| `chargerSauvegarde()` | Relit la sauvegarde existante. |
| `pillSauvegarde()` | Pastille d'état affichée dans l'en-tête. |
| `corpsSauvegarde()` | Contenu de la fenêtre de sauvegarde locale. |
| `blocCatalogueSauvegarde()` | Section catalogue de cette fenêtre : état, taille, mises à jour. |
| `openSaveDialog()` | Ouvre la fenêtre de gestion des données. |
| `brancherCatalogue()` | Branche les commandes du catalogue. |
| `brancherRestauration()` | Branche le sélecteur de fichier de restauration. |

### `js/externes.js` — EDHREC et Commander Spellbook

Statistiques d'inclusion et de synergie par commandant, thèmes de deck servant d'archétypes établis,
combos répertoriés et combos à une carte près, plus le catalogue Scryfall complet et son archive IndexedDB.

*45 fonction(s), 35 Ko*

| Fonction | Rôle |
|---|---|
| `chargerArchetypesEdhrec(force)` *(async)* | Charge la liste des thèmes EDHREC, puis les thèmes déjà cochés. |
| `chargerListeArchetypesEdhrec(force)` *(async)* | L'index des thèmes publiés, en une requête. |
| `chargerThemeEdhrec(slug)` *(async)* | Les cartes d'un thème, à sa première utilisation. |
| `themesPageEdhrec(j)` | Thèmes, libellés et descriptions d'une page d'index, quelle que soit sa forme. |
| `descriptionPageEdhrec(j)` | Description que la page d'un thème porte parfois en tête. |
| `formeThemeEdhrec()` *(async)* | Cherche par sondage l'adresse des pages de thème ; note chaque essai. |
| `formesDeduites()` *(async)* | Déduit cette adresse des liens cités dans une page de commandant. |
| `temoinEdhrec()` *(async)* | Page de commandant témoin, pour distinguer adresse fausse et hôte injoignable. |
| `reprendreArchetypesEdhrec()` *(async)* | Reprend cet index depuis IndexedDB au démarrage. |
| `nomsPageEdhrec(j)` | Noms de cartes d'une page EDHREC, quelle que soit la variante de forme. |
| `urlThemeEdhrec(slug)` | Adresse de la page JSON d'un thème. |
| `edhrecSlug(name)` | Identifiant EDHREC d'un commandant. |
| `edhrecFor(card)` | Statistiques EDHREC d'une carte, si elles existent. |
| `loadEdhrec(force)` *(async)* | Charge les statistiques du commandant courant. |
| `deckSignature()` | Signature du deck, pour éviter les appels inutiles. |
| `comboDepuisVariante(v)` | Normalise un combo renvoyé par Commander Spellbook. |
| `scheduleCombos()` | Programme l'interrogation après une modification du deck. |
| `loadCombos(force)` *(async)* | Récupère les combos assemblés et ceux à une carte près. |
| `combosDe(card)` | Combos où figure une carte. |
| `combosCompletesPar(card)` | Combos qu'une carte viendrait compléter. |
| `libelleCombo(c,carteCourante,liens)` | Description lisible d'un combo. |

### `js/graphe.js` — Graphe des capacités

Construction du graphe à partir des arcs des cartes, rendu SVG circulaire, sélection cumulative de nœuds.

*6 fonction(s), 8 Ko*

| Fonction | Rôle |
|---|---|
| `noeudsActifs()` | Nœuds actuellement sélectionnés. |
| `carteTouche(c,noeuds)` | Vérifie qu'une carte touche tous les nœuds sélectionnés. |
| `graphCards()` | Cartes alimentant le graphe selon la source choisie. |
| `buildGraph(cards)` | Agrège les arcs des cartes en un graphe de concepts. |
| `svgGraph(g)` | Dessine le cercle des nœuds, les arcs et les arcs de règles. |
| `renderD()` | Rend la section du graphe et le panneau des nœuds sélectionnés. |

### `js/stats.js` — Statistiques

Comptages par couleur et par type, valeur de la collection, histogrammes de courbe de mana.

*3 fonction(s), 4 Ko*

| Fonction | Rôle |
|---|---|
| `statsOf(list)` | Compte les cartes par couleur, par type et par coût. |
| `histogram(dataByCmc, colorSplit)` | Histogramme de courbe de mana, empilé par couleur. |
| `renderC()` | Rend la section des statistiques. |

### `js/suggestions.js` — Suggestions d'ajout

Notation des cartes — commune aux propositions et aux cartes du deck —, vignettes, pagination et panneaux d'achat.

*15 fonction(s), 25 Ko*

Données : `VISUELS_CHARGES`

| Fonction | Rôle |
|---|---|
| `contexteEvaluation()` | Prépare le contexte de notation : graphe du deck, rôles manquants, courbe. |
| `noteCarte(p,X)` | Note une carte : synergies, boucles, rôles, courbe, EDHREC, combos. |
| `currentSuggestions()` | Constitue le vivier puis renvoie les propositions classées. |
| `ligneCatalogue()` | État du catalogue et cartes écartées par le prix. |
| `panneauEdhrec()` | Panneau EDHREC du commandant. |
| `sugRow(s)` | Vignette d'une proposition. |
| `ligneBudget()` | Ligne de budget restant. |
| `ligneAchats()` | Rappel des cartes à acheter. |
| `panneauAchats()` | Panneau Cardmarket : budget, état, langue, vendeur. |
| `listeSuggestions()` | Assemble les groupes par type et le filtre par rôle. |
| `visuelsSuggestions(byType)` | Demande les visuels des propositions affichées. |
| `chargeVisuelsClasses()` | Charge les visuels par lots, dans l'ordre du score. |
| `majHintF(sug,graphPicks)` | Met à jour l'indicateur de la section. |
| `refreshSuggestions()` | Rafraîchit la liste sans toucher aux champs de saisie. |
| `renderF()` | Rend la section des suggestions. |

### `js/collection.js` — Collection

Affichage en grille ou en liste, import MTGO par fichier ou par collage, recherche et ajout de cartes.

*8 fonction(s), 13 Ko*

| Fonction | Rôle |
|---|---|
| `renderB()` | Rend la collection, en grille ou en liste, avec pagination ; les filtres se règlent dans l'en-tête. |
| `parseMtgoList(txt)` | Lit une liste MTGO : quantités, éditions, réserve, commandant. |
| `openImport(cible)` | Boîte d'import, par fichier, glisser-déposer ou collage. |
| `ajouterCarte(c,q,cible,completer)` | Ajoute une carte à la collection ou au deck. |
| `chercheCartes(q)` | Recherche par nom dans le catalogue local, filtrée par couleur. |
| `resultatsHTML(q,cible)` | Liste des propositions de la boîte d'ajout. |
| `majResultats(cible,sansRelancer)` | Met à jour ces propositions à la frappe. |
| `openAdd(cible)` | Boîte d'ajout avec recherche locale puis en ligne. |

### `js/deck.js` — Deck

Composition, équilibre des rôles, commandant, conformité au format et cartes à acheter.

*12 fonction(s), 13 Ko*

| Fonction | Rôle |
|---|---|
| `targets()` | Objectifs par rôle selon le format. |
| `deckCounts()` | Compte les cartes du deck par rôle. |
| `gauge(label,val,tgt,role)` | Jauge d'un rôle, cliquable pour filtrer les suggestions. |
| `legality()` | Contrôles de conformité : taille, copies, identité, jetons, budget. |
| `blocAchats()` | Bloc des cartes à acheter, avec budget et liens. |
| `zoneCommandant()` | Encart du commandant : visuel, identité, changement. |
| `evalueDeck(entries)` | Note les cartes du deck avec le moteur des suggestions. |
| `renderE()` | Rend le deck : courbe, rôles, commandant, achats, liste. |
| `addToDeck(name)` | Ajoute un exemplaire depuis l'interface. |
| `deckAdd(card,qty,opts)` | Ajoute des exemplaires au deck, avec ou sans complément de collection. |
| `removeFromDeck(name)` | Retire un exemplaire. |
| `buyCard(name)` | Ajoute une carte en la comptant à l'achat. |

### `js/ui.js` — Interface commune

Symboles de mana, tuiles de cartes, fiche détaillée, aperçu au survol, fenêtres et rendu global,
dont le bouton « Filtres » de l'en-tête et sa fenêtre modale.

*36 fonction(s), 31 Ko*

Données : `COLS`, `MODES_COULEUR`, `FILTRE_ICONE`

Données : `RETOURNEES`

| Fonction | Rôle |
|---|---|
| `pipHTML(inner,taille)` | Pastille de repli d'un symbole de mana. |
| `symBg(inner)` | Symbole peint en fond, pour les boutons de couleur. |
| `symIcon(inner,taille)` | Symbole de mana officiel, avec repli si l'image manque. |
| `manaFb(img)` | Remplace un symbole qui n'a pas pu se charger. |
| `manaHTML(card,sm)` | Coût de mana complet d'une carte. |
| `stripeColor(card)` | Bande de couleur d'identité d'une carte. |
| `cardTile(e,ctx)` | Tuile de carte, avec indicateurs propres au deck. |
| `cardRow(e,ctx)` | Ligne de carte en mode liste. |
| `listeArchetypesHTML()` | Lignes de la liste déroulante : nom, provenance et résumé de fonctionnement. |
| `openFormatModal()` | Ouvre la fenêtre du format, depuis la pastille « Format » de l'en-tête. |
| `corpsFormat()` | Contenu de cette fenêtre : format de jeu et panneau « Personnalisé ». |
| `resumeFormat()` | Taille, exemplaires et commandant du format en cours. |
| `majResumeFormat()` | Rafraîchit ce résumé pendant la saisie du format personnalisé. |
| `majFenetreFormat()` | Réécrit la fenêtre au changement de format. |
| `ficheHTML(card)` | Fiche détaillée : rôles ligne à ligne et cartes du deck branchées, combos, capacités extraites, puis en bas de fiche les branchements possibles avec la collection filtrée. |
| `ficheTexteHTML(card)` | Carte rendue en texte — coût, type, force/endurance, texte — à la place du visuel absent. |
| `ficheImageKO(img)` | Bascule sur ce rendu texte quand le visuel ne se charge pas. |
| `openCardModal(name)` | Ouvre la fiche dans une fenêtre. |
| `renderTop()` | Barre d'en-tête : totaux, bouton « Filtres », puces des filtres actifs et état de sauvegarde. |
| `openFiltresModal()` | Ouvre la fenêtre des filtres avancés depuis l'en-tête. |
| `corpsFiltres()` | Contenu de cette fenêtre : couleurs, recherche, type, archétype, nom, illustrateur, force, endurance, coût de mana, prix. |
| `etatArchetypes()` | État de la base d'archétypes EDHREC, sous les boutons d'archétype. |
| `ligneFiltre(kMin,kMax,label,aide,pas,min)` | Une ligne « critère min → max » de la fenêtre. |
| `resumeFiltres()` | Décompte des cartes retenues et rappel des filtres actifs. |
| `majResumeFiltres()` | Rafraîchit ce décompte à chaque frappe. |
| `planifierRenduFiltres()` | Diffère le rendu global pour garder la saisie fluide. |
| `majFenetreFiltres()` | Réécrit les champs après une réinitialisation ou un changement de couleur. |
| `renderAll()` | Rend les cinq sections et programme la sauvegarde. |
| `aDeuxFaces(c)` | Détecte une carte recto-verso. |
| `autreFace(c,grande)` | Face opposée, pour la vignette de retournement. |
| `faceVisible(c,grande)` | Face actuellement affichée. |
| `refCarte(nom)` | Nom de carte survolable et cliquable. |
| `apercuTexte(c)` | Texte de l'aperçu volant : sauts de ligne rétablis, longueur bornée. |
| `placerApercu(x,y)` | Place l'aperçu près du curseur sans sortir de l'écran. |
| `contenuApercu(c)` | Contenu de l'aperçu : visuel, ou texte si absent. |
| `montrerApercu(nom,x,y)` | Affiche l'aperçu au survol. |
| `placerApercuDansCouche()` | Déplace l'aperçu dans la fenêtre modale ouverte, sans quoi elle le masque. |
| `majApercu()` | Met à jour l'aperçu quand le visuel arrive. |
| `cacherApercu()` | Masque l'aperçu. |
| `toast(msg)` | Message temporaire en bas d'écran. |
| `openDialog(title,bodyHTML,footHTML,wide)` | Ouvre une fenêtre modale, sans la rouvrir si elle l'est déjà. |

### `js/app.js` — Démarrage et évènements

Écouteurs délégués pour toute l'application, restauration de la sauvegarde et tâches de fond au lancement.

*0 fonction(s), 14 Ko*

| Fonction | Rôle |
|---|---|

## Repères

- 241 fonctions au total, réparties en 14 modules.
- L'état applicatif tient dans l'objet `S` de `etat.js` ; aucune autre variable globale mutable n'est partagée entre modules, hormis les caches explicites (`CAT`, `NOTES_DECK`, `VISUELS_CHARGES`).
- Les évènements de l'interface passent tous par la délégation en place dans `app.js`, sur les attributs `data-act`, `data-card`, `data-node`, `data-filtre` et `data-card-name`.
- Les données restent sur l'appareil : `localStorage` pour la collection et le deck, IndexedDB pour le catalogue des cartes
  et pour l'index des archétypes EDHREC.
- Les rôles ne se lisent pas dans le texte brut : `categories()` croise le type de la carte avec ce que `analyze()` a
  relevé — ce que chaque capacité produit, sur qui porte l'effet (`textEff`), ce que les coûts consomment
  (`sacOutlet`) et ce qui la déclenche. Un terrain qui n'ajoute qu'un mana n'est pas du ramp, une carte qui se blesse
  elle-même ne fait pas de l'interaction, une contrainte qu'on s'impose n'est pas du stax.
- Les jauges d'équilibre des rôles de la section Deck sont des filtres à part entière : les cocher agit partout, comme
  n'importe quel filtre de l'en-tête, et les mêmes boutons figurent dans la fenêtre des filtres.
- Un filtre posé une fois vaut partout : `carteFiltree()` filtre la collection, le deck et sa courbe de mana,
  les statistiques, le graphe et les suggestions d'ajout. La taille du deck, sa conformité au format et
  l'équilibre des rôles restent calculés sur le deck entier.
- Les archétypes viennent entièrement d'EDHREC : « Charger la liste EDHREC » récupère les thèmes qu'il publie, en une
  requête, et la liste déroulante les affiche tous. Les cartes d'un thème ne sont cherchées qu'à sa première
  utilisation, puis gardées en cache. `ARCH_LABELS` et `ARCH_RESUMES` ne servent qu'à l'affichage : un libellé français
  et une phrase de fonctionnement pour les thèmes les plus courants. Chaque thème affiche une phrase, sans exception :
  la nôtre, sinon celle qu'EDHREC publie, sinon une phrase formée sur son nom.

## Tests

Le fichier `tests/suite.js` rejoue trente vérifications sur un DOM simulé :
démarrage, rendu des cinq sections, sélection de nœuds, précision de l'analyse,
pagination, sauvegarde. Il se lance avec `node tests/suite.js`.
