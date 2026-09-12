# Inventaire des fonctions

*Écrit par `node outils/genDoc.js` à partir des sources — ne pas modifier à la main.*

Le rôle de chaque fonction est repris du commentaire qui la précède dans le code : ce
fichier est un index, la source reste la référence. Pour l'ordre dans lequel ces
fonctions s'appellent, voir [PARCOURS.md](../PARCOURS.md) ; pour l'architecture,
[README.md](../README.md).

**451 fonctions**, 59 modules, 518 Ko de JavaScript.

| Module | Rôle | Fonctions | Lignes |
|---|---|--:|--:|
| [`effets.js`](#jseffetsjs) | Ontologie des capacités, analyse d'effets & synergies | 16 | 570 |
| [`cartesBrutes.js`](#jscartesbrutesjs) | La base livrée avec l'atelier | 0 | 140 |
| [`analyse.js`](#jsanalysejs) | Lire une carte : coût, capacités, déclencheurs, effets | 5 | 148 |
| [`archetypesLibelles.js`](#jsarchetypeslibellesjs) | Le nom français des thèmes EDHREC | 0 | 85 |
| [`categories.js`](#jscategoriesjs) | Les rôles d'une carte | 2 | 126 |
| [`impressions.js`](#jsimpressionsjs) | Les éditions d'une carte, et celle qu'on possède | 8 | 81 |
| [`cartes.js`](#jscartesjs) | La base de cartes et ses index | 15 | 174 |
| [`liens.js`](#jsliensjs) | Le tri des liens : interaction précise ou déclencheur large | 6 | 74 |
| [`etat.js`](#jsetatjs) | État global de l'application & utilitaires | 1 | 150 |
| [`archetypesSets.js`](#jsarchetypessetsjs) | Deux vocabulaires venus du dehors | 12 | 164 |
| [`filtres.js`](#jsfiltresjs) | Les critères de la fenêtre « Filtres » | 13 | 148 |
| [`retenue.js`](#jsretenuejs) | Ce qui reste après les filtres | 8 | 112 |
| [`catalogueEtat.js`](#jscatalogueetatjs) | L'archive en mémoire, et les nœuds qu'elle touche | 5 | 62 |
| [`groupes.js`](#jsgroupesjs) | Grouper et trier les listes de cartes | 16 | 358 |
| [`marche.js`](#jsmarchejs) | Marché Cardmarket, estimations & panier d'achat | 3 | 54 |
| [`scryfall.js`](#jsscryfalljs) | Intégration Scryfall, symboles, visuels & complétion | 25 | 563 |
| [`stockage.js`](#jsstockagejs) | Persistance locale (localStorage) & gestion des sauvegardes | 15 | 437 |
| [`idb.js`](#jsidbjs) | Le magasin IndexedDB | 4 | 44 |
| [`edhrec.js`](#jsedhrecjs) | Les statistiques d'EDHREC pour un commandant | 6 | 242 |
| [`edhrecForme.js`](#jsedhrecformejs) | Deviner la forme des pages de thèmes d'EDHREC | 7 | 142 |
| [`edhrecThemes.js`](#jsedhrecthemesjs) | L'index des thèmes EDHREC | 10 | 179 |
| [`sets.js`](#jssetsjs) | Les sets publiés par Scryfall | 8 | 156 |
| [`gameChangers.js`](#jsgamechangersjs) | La liste des « Game Changers » | 4 | 77 |
| [`archive.js`](#jsarchivejs) | Lire l'archive Scryfall | 11 | 219 |
| [`catalogue.js`](#jscataloguejs) | Tenir le catalogue à jour | 10 | 232 |
| [`candidats.js`](#jscandidatsjs) | Des enregistrements de l'archive aux cartes candidates | 14 | 252 |
| [`graphe.js`](#jsgraphejs) | Visualisation circulaire interactive des capacités | 4 | 168 |
| [`stats.js`](#jsstatsjs) | Statistiques, répartitions & courbes de mana | 3 | 90 |
| [`notation.js`](#jsnotationjs) | La note d'une carte candidate | 5 | 239 |
| [`vivier.js`](#jsvivierjs) | Le vivier des candidates, et son empreinte | 9 | 195 |
| [`sugOrdre.js`](#jssugordrejs) | L'ordre gelé des propositions | 6 | 80 |
| [`sugCommandants.js`](#jssugcommandantsjs) | Les commandants du deck, en tête de l'onglet EDHREC | 4 | 139 |
| [`sugListes.js`](#jssuglistesjs) | Les trois lectures d'une même sélection | 11 | 246 |
| [`suggestions.js`](#jssuggestionsjs) | Les trois sections des propositions | 13 | 243 |
| [`collection.js`](#jscollectionjs) | Gestion de la collection, filtres & imports MTGO | 18 | 502 |
| [`annexes.js`](#jsannexesjs) | La réserve et l'étude | 9 | 117 |
| [`deck.js`](#jsdeckjs) | Construction du deck, légalité, commandant & fiches détaillées | 21 | 429 |
| [`ficheVisuel.js`](#jsfichevisueljs) | Le visuel de la fiche, et ses éditions | 5 | 116 |
| [`fiche.js`](#jsfichejs) | La fiche détaillée d'une carte | 1 | 165 |
| [`ficheParcours.js`](#jsficheparcoursjs) | Ouvrir une fiche, et feuilleter la liste d'où elle vient | 4 | 110 |
| [`outils.js`](#jsoutilsjs) | Menue monnaie de l'atelier | 7 | 72 |
| [`dialogue.js`](#jsdialoguejs) | La fenêtre modale, une à la fois | 2 | 42 |
| [`brouillon.js`](#jsbrouillonjs) | Le brouillon des fenêtres à « Appliquer » | 12 | 139 |
| [`couleurs.js`](#jscouleursjs) | Le vocabulaire des couleurs | 1 | 77 |
| [`apercu.js`](#jsapercujs) | L'aperçu volant sous le curseur | 7 | 101 |
| [`versions.js`](#jsversionsjs) | Les éditions d'une même carte | 14 | 173 |
| [`tuiles.js`](#jstuilesjs) | Les deux rendus d'une carte | 8 | 213 |
| [`ancre.js`](#jsancrejs) | L'ancre de défilement | 3 | 57 |
| [`recalcul.js`](#jsrecalculjs) | Les recalculs annoncés | 8 | 195 |
| [`entete.js`](#jsentetejs) | L'en-tête et la barre des onglets | 5 | 176 |
| [`rendu.js`](#jsrendujs) | Le rendu d'ensemble | 2 | 33 |
| [`fenFormat.js`](#jsfenformatjs) | Fenêtre « Format » | 5 | 63 |
| [`fenParametres.js`](#jsfenparametresjs) | Fenêtre « Paramètres » | 9 | 129 |
| [`fenBudget.js`](#jsfenbudgetjs) | Fenêtre « Budget » | 5 | 78 |
| [`fenFiltres.js`](#jsfenfiltresjs) | Fenêtre « Filtres » | 10 | 207 |
| [`fenListes.js`](#jsfenlistesjs) | Les deux listes déroulantes des filtres | 6 | 125 |
| [`boiteCatalogue.js`](#jsboitecataloguejs) | Boîte de chargement de l'archive Scryfall | 6 | 75 |
| [`fenExport.js`](#jsfenexportjs) | Fenêtres d'export et d'effacement | 3 | 133 |
| [`app.js`](#jsappjs) | Point d'entrée : gestionnaires d'évènements, initialisation et démarrage | 1 | 870 |

## js/effets.js

Ontologie des capacités, analyse d'effets & synergies. *16 fonctions, 570 lignes, 31 Ko.*

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
| `feeds(concept)` | — |
| `feedsDe(p)` | — |
| `croise(prods, trigs, dir, out)` | — |
| `synergyBetween(a, b)` | — |
| `partnersFor(card, pool)` | — |

| Donnée | Rôle |
|---|---|
| `GROUPS` | 1. Nœuds et groupes du graphe |
| `NODES` | — |
| `NODE` | — |
| `IMPLICIT` | Arcs "règles du jeu" : ce qu'un effet permet mécaniquement d'enchaîner |
| `EFFECT_RULES` | Règles d'extraction : effets produits |
| `TRIGGER_RULES` | Règles d'extraction : déclencheurs |
| `SUJETS` | 2. Qualification et analyse contextuelle |
| `MOTS_NON_SOUSTYPE` | Ce qui qualifie un sort sans être un sous-type : les types de carte, les tournures de compte, de couleur et de nombre. |
| `DEBUTS_EFFET` | — |
| `COUTS` | — |
| `EQUIV` | 3. Synergies & équivalences entre effets |

## js/cartesBrutes.js

La base livrée avec l'atelier. *0 fonctions, 140 lignes, 19 Ko.*

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

Le nom français des thèmes EDHREC. *0 fonctions, 85 lignes, 6.9 Ko.*

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

## js/impressions.js

Les éditions d'une carte, et celle qu'on possède. *8 fonctions, 81 lignes, 3.2 Ko.*

| Fonction | Rôle |
|---|---|
| `codeLegalite(legalities)` | Légalité d'une carte, réduite aux formats que l'atelier connaît : une chaîne de lettres — « c » pour Commander, « s » pour Standard. |
| `cleImpression(set, num)` | — |
| `noterImpression(card, set, num, qty)` | Édition lue dans une liste importée. La première qui porte un numéro devient l'édition de référence de la carte : c'est elle qui sera demandée à Scryfall. |
| `completeImpression(card, sc)` | Édition rapportée par Scryfall : elle ne prend la place de celle relevée à l'import que si la carte n'en avait pas. |
| `libelleImpression(card)` | — |
| `versionsCarte(card)` | Éditions de la carte présentes dans la collection : ce sont celles que la fiche fait défiler. |
| `cleVersion(v)` | — |
| `versionRetenue(card)` | L'édition retenue pour l'affichage : celle que l'utilisateur a choisie, sinon celle relevée à l'import. |

## js/cartes.js

La base de cartes et ses index. *15 fonctions, 174 lignes, 6.9 Ko.*

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
| `initBuiltin()` | — |

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

État global de l'application & utilitaires. *1 fonctions, 150 lignes, 7.9 Ko.*

| Fonction | Rôle |
|---|---|
| `ongletDeSection(id)` | L'onglet qui porte une section, pour les gestes qui traversent l'atelier — la fiche d'une carte qui renvoie au graphe, par exemple. |

| Donnée | Rôle |
|---|---|
| `FORMATS` | `legal` : la lettre que `codeLegalite()` emploie pour ce format, et le nom que Scryfall lui donne dans ses recherches. |
| `ANNEXES` | Les deux listes annexes de la section Deck : la réserve — le sideboard — et les cartes à l'étude — le considering des sites de decks. |
| `CLES_ANNEXES` | — |
| `ONGLETS` | Les cinq onglets de l'atelier, dans l'ordre où ils paraissent sous l'entête. |
| `CLES_ONGLETS` | — |
| `ONGLETS_ANCIENS` | L'onglet unique d'hier, tel qu'une sauvegarde le nomme encore : elle rouvrait sinon la collection, et l'on perdait la page qu'on regardait en quittant l'atelier. |
| `SECTIONS_SUGGESTIONS` | Les trois sections que la notation alimente, dans l'ordre des onglets. |
| `COLONNES` | Les nombres de colonnes offerts par les grilles, zéro valant « autant que la largeur en permet ». |
| `RETOURNEES` | — |
| `apercuEl` | — |
| `apercuCardName` | — |
| `S` | — |

## js/archetypesSets.js

Deux vocabulaires venus du dehors. *12 fonctions, 164 lignes, 7.2 Ko.*

| Fonction | Rôle |
|---|---|
| `libelleArchetype(slug)` | Libellé d'un thème : le nôtre s'il en existe un, sinon celui d'EDHREC. |
| `resumeArchetype(slug)` | Court résumé du fonctionnement d'un archétype. |
| `archetypesDisponibles()` | Les archétypes proposés : ceux qu'EDHREC publie. |
| `archetypesCarte(card)` | Archétypes d'une carte, d'après les thèmes EDHREC chargés. |
| `archetypesAChargerEdhrec()` | Un thème coché dont les cartes ne sont pas encore chargées. |
| `archetypesFiltre()` | Archétypes cochés, conservés sous forme de liste séparée par des virgules. |
| `basculerArchetype(id)` | — |
| `setsFiltre()` | Sets cochés, conservés comme les archétypes : une liste de codes séparés par des virgules. |
| `basculerSet(code)` | — |
| `libelleSet(code)` | Nom du set, s'il figure dans la liste Scryfall ; sinon son code. |
| `setsACharger()` | Un set coché dont les cartes ne sont pas encore chargées. |
| `setsCarte(card)` | Sets d'une carte. Scryfall fait autorité pour les sets déjà chargés, mais on y joint ce que l'appareil sait déjà : le set relevé dans l'archive, les éditions possédées et celles que la… |

| Donnée | Rôle |
|---|---|
| `FILTRES_VIDE` | — |
| `FILTRES_BORNES` | Bornes numériques : [clé min, clé max, champ de la carte, libellé]. |
| `ARCH_BASE` | — |
| `SETS_BASE` | — |

## js/filtres.js

Les critères de la fenêtre « Filtres ». *13 fonctions, 148 lignes, 6.2 Ko.*

| Fonction | Rôle |
|---|---|
| `rolesFiltre()` | Rôles cochés dans la section Deck, conservés comme les archétypes. |
| `basculerRole(role)` | — |
| `roleOK(card)` | Une carte tient au moins un des rôles cochés. |
| `nombreFiltre(v)` | — |
| `reinitFiltres()` | — |
| `majFiltre(cle, valeur)` | Écrit un champ de la fenêtre dans l'état. |
| `effacerFiltre(cles)` | Efface un filtre depuis sa puce dans l'en-tête. |
| `filtresActifs()` | Filtres en vigueur : un libellé et les clés à effacer pour chacun. |
| `texteFiltresActifs(sep)` | Libellés seuls, pour les infobulles et les phrases de résumé. |
| `carteFiltree(card)` | Prédicat unique de l'atelier : couleurs, rôles et critères de la fenêtre. |
| `valeurFiltre(x, vide)` | Une valeur peut être donnée telle quelle ou par une fonction, pour que les critères coûteux — sets, archétypes, type développé — ne soient calculés que si le filtre correspondant est posé. |
| `motsFiltre(valeur, saisie, cle)` | Chaque mot de la saisie doit se retrouver dans la valeur, dans n'importe quel ordre. |
| `filtresValeursOK(v)` | — |

## js/retenue.js

Ce qui reste après les filtres. *8 fonctions, 112 lignes, 4.7 Ko.*

| Fonction | Rôle |
|---|---|
| `gameChangersConnus()` | — |
| `estGameChanger(card)` | Vrai, faux, ou `null` quand la liste n'est pas là : une carte qu'on ne sait pas juger n'est pas déclarée ordinaire pour autant. |
| `carteLegale(card)` | Légalité d'une carte dans le format en cours. |
| `legaliteOK(card)` | Le filtre de légalité, tel que la case de la fenêtre Format le règle. |
| `carteRetenue(card)` | Ce que la collection et les suggestions retiennent : les critères de la fenêtre, plus la légalité. |
| `filtreOK(card)` | Applique les filtres avancés à une carte. |
| `setsRec(rec)` | Sets d'un enregistrement du catalogue : ceux que porte l'archive, réunis à ce que Scryfall a rapporté pour les sets déjà chargés. |
| `filtreOKRec(rec)` | Les mêmes critères, lus sur un enregistrement du catalogue : c'est ce qui permet de filtrer les dizaines de milliers de cartes de l'archive sans en construire autant d'objets. |

| Donnée | Rôle |
|---|---|
| `GC_BASE` | — |

## js/catalogueEtat.js

L'archive en mémoire, et les nœuds qu'elle touche. *5 fonctions, 62 lignes, 2.5 Ko.*

| Fonction | Rôle |
|---|---|
| `catalogueAbsent()` | Vrai tant que cet appareil n'a pas les cartes existantes : archive jamais chargée, ou chargée mais vide. |
| `noeudsActifs()` | — |
| `carteTouche(c, noeuds)` | — |
| `getCardOrAnalyzedRec(rec)` | — |
| `recToucheNoeuds(rec, noeuds)` | — |

| Donnée | Rôle |
|---|---|
| `CH` | — |
| `CAT` | — |

## js/groupes.js

Grouper et trier les listes de cartes. *16 fonctions, 358 lignes, 17 Ko.*

| Fonction | Rôle |
|---|---|
| `sousTypesCarte(card)` | — |
| `seauCmc(card)` | Le seau de coût, celui de la courbe de mana : au-delà de sept, tout ensemble — une carte à onze et une carte à huit se rangent côte à côte. |
| `tauxEdhrec(e, champ)` | — |
| `scoreEntree(e)` | — |
| `notesCollectionAJour()` | — |
| `notesCollection(entrees)` | — |
| `groupeCartes(entrees, modeId, triId)` | `triId` valant `null`, l'ordre reçu est gardé tel quel : c'est ce dont les suggestions ont besoin pour leur ordre gelé, qui n'est celui d'aucun tri. |
| `clePli(section, modeId, id)` | — |
| `groupePlie(section, modeId, id)` | — |
| `enveloppeGroupe(section, modeId, g, titre, badge, corps)` | Une catégorie, repliable, sur le patron des parties de la section Deck (`partieDeck`, js/deck.js) : mêmes classes, même chevron, même geste. |
| `rendGroupes(section, groupes, modeId, rendEntrees, compte)` | — |
| `noteMultiple(modeId)` | Un regroupement où une carte compte plusieurs fois le dit, sans quoi la somme des en-têtes contredirait le total affiché juste au-dessus. |
| `colonnesDe(section)` | — |
| `menuColonnes(section)` | — |
| `ouvreGrille(section, base)` | L'ouverture d'une grille : la classe et la variable qui portent le choix, ou la grille d'avant si l'on s'en remet à la largeur. |
| `barreGroupeTri(section)` | — |

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
| `COMPTEUR_GROUPE` | L'identifiant que le bouton commande, tiré d'un compteur de rendu : un libellé de sous-type ou d'édition n'a pas à être un identifiant HTML. |

## js/marche.js

Marché Cardmarket, estimations & panier d'achat. *3 fonctions, 54 lignes, 2.1 Ko.*

| Fonction | Rôle |
|---|---|
| `cmLink(card)` | — |
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

## js/scryfall.js

Intégration Scryfall, symboles, visuels & complétion. *25 fonctions, 563 lignes, 24 Ko.*

| Fonction | Rôle |
|---|---|
| `loadSymbology()` | — |
| `pipHTML(inner, taille)` | — |
| `symBg(inner)` | — |
| `symIcon(inner, taille)` | — |
| `manaFb(img)` | — |
| `manaHTML(card, sm)` | — |
| `stripeColor(card)` | — |
| `scryTarget(sc, map)` | — |
| `applyScryfall(sc, requested, imagesOnly)` | — |
| `identScryfall(c)` | Identifiant demandé à Scryfall : l'édition relevée à l'import quand la carte en a une, le nom sinon. |
| `cibleImpression(sc, parImpression)` | Retrouve la carte visée par une réponse, d'abord par l'édition demandée. |
| `indexImpressions(cartes)` | — |
| `besoinScryfall(c)` | Une carte mérite un aller-retour Scryfall tant qu'il lui manque son visuel ou son texte oracle complet : la base intégrée n'en garde qu'un résumé, ce qui coupait par exemple… |
| `queueScryfall(cards)` | — |
| `runScryQueue()` | — |
| `completeUnknown(names)` | — |
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
| `SYMS` | — |
| `MAJ_CARTES` | Chaque carte complétée par Scryfall — texte, coût, prix, légalité — peut changer sa note. |
| `scryQueue` | — |
| `scryBusy` | — |
| `scrySeq` | — |

## js/stockage.js

Persistance locale (localStorage) & gestion des sauvegardes. *15 fonctions, 437 lignes, 21 Ko.*

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
| `corpsSauvegarde()` | — |
| `blocCatalogue()` | — |
| `rafraichirFenetreSauvegarde()` | La fenêtre des paramètres reste ouverte pendant qu'une archive se charge : son contenu est réécrit sur place quand l'état du catalogue a bougé. |
| `brancherSauvegarde()` | L'interrupteur de la sauvegarde, dans la section « Sauvegarde locale » de la fenêtre des paramètres : cocher réactive et réécrit tout, décocher efface sur-le-champ ce que cet appareil… |
| `brancherCatalogue()` | — |
| `brancherRestauration()` | — |

| Donnée | Rôle |
|---|---|
| `STORE_KEY` | — |
| `STORE_OFF` | — |
| `saveTimer` | — |
| `saveState` | — |
| `saveError` | — |
| `dernierEtatSignale` | — |

## js/idb.js

Le magasin IndexedDB. *4 fonctions, 44 lignes, 1.5 Ko.*

| Fonction | Rôle |
|---|---|
| `idb()` | — |
| `idbLire(cle)` | — |
| `idbEcrire(cle, val)` | — |
| `idbVider()` | — |

| Donnée | Rôle |
|---|---|
| `IDB_NOM` | — |

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

Lire l'archive Scryfall. *11 fonctions, 219 lignes, 9.8 Ko.*

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

Des enregistrements de l'archive aux cartes candidates. *14 fonctions, 252 lignes, 11 Ko.*

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

Visualisation circulaire interactive des capacités. *4 fonctions, 168 lignes, 9.4 Ko.*

| Fonction | Rôle |
|---|---|
| `graphCards()` | — |
| `buildGraph(cards)` | — |
| `svgGraph(g)` | — |
| `renderD()` | — |

## js/stats.js

Statistiques, répartitions & courbes de mana. *3 fonctions, 90 lignes, 4.5 Ko.*

| Fonction | Rôle |
|---|---|
| `statsOf(list)` | — |
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

Le vivier des candidates, et son empreinte. *9 fonctions, 195 lignes, 8.2 Ko.*

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

Les trois lectures d'une même sélection. *11 fonctions, 246 lignes, 13 Ko.*

| Fonction | Rôle |
|---|---|
| `selectionSuggestions()` | — |
| `paginationListe(cle, total, max, defaut)` | Les boutons de pagination d'une liste hors catalogue, ou rien si tout tient. |
| `renvoiCatalogue(quoi)` | Le renvoi au catalogue : les deux listes courtes ne montrent qu'un extrait du classement, et le dire évite de les croire exhaustives. |
| `blocGraphe(sel)` | La section du graphe : ce qui se branche sur les nœuds qu'on y a isolés. |
| `cleLimiteEdhrec(idGroupe)` | La clé de pagination d'une catégorie d'EDHREC. |
| `corpsEdhrec(g, plat)` | Le compte affiché d'une catégorie d'EDHREC, et sa pagination : sans groupe, c'est la liste entière sous la clé « edhrec » ; groupée, chaque catégorie a la sienne. |
| `visuelsEdhrec(groupes, mode)` | Les visuels des recommandations affichées, catégorie par catégorie : une catégorie repliée ne montre rien, et ne demande donc rien. |
| `blocEdhrec(sel)` | La section EDHREC : le panneau du commandant est rendu à part (il ne dépend pas de la sélection), et voici les cartes que les decks recensés recommandent parmi celles qu'on pourrait ajouter. |
| `listeSuggestions(sel)` | La section du catalogue : tout le classement, groupé et paginé selon la barre de la section. |
| `visuelsSuggestions(vus)` | Les visuels des vignettes qu'une section affiche. |
| `visuelsCatalogue(groupes)` | Celles du catalogue, groupe par groupe : une catégorie repliée ne montre rien, et demander les visuels de vignettes que personne ne voit serait autant de requêtes pour rien. |

| Donnée | Rôle |
|---|---|
| `LISTES_SUG` | La pagination d'une liste qui n'est pas un groupe du catalogue : celle du graphe et celle d'EDHREC, chacune sur sa page, avec son compte par défaut. |

## js/suggestions.js

Les trois sections des propositions. *13 fonctions, 243 lignes, 12 Ko.*

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

## js/collection.js

Gestion de la collection, filtres & imports MTGO. *18 fonctions, 502 lignes, 25 Ko.*

| Fonction | Rôle |
|---|---|
| `colorOK(card)` | — |
| `collectionCards()` | — |
| `filtered()` | — |
| `causesCollection()` | Ce qui écarte des cartes de la collection affichée, cause par cause, dans l'ordre où les critères s'appliquent. |
| `ligneCausesCollection()` | La phrase qui les nomme, chacune avec le geste qui la lève. |
| `frontFace(n)` | — |
| `mergeInto(card, canonical)` | — |
| `renameCard(card, newName)` | — |
| `retireExtrait(s, i, n)` | — |
| `extraitEdition(texte)` | — |
| `parseMtgoList(txt)` | — |
| `renderB()` | — |
| `openImport(cible)` | — |
| `ajouterCarte(c, q, cible, completer)` | — |
| `chercheCartes(q)` | — |
| `resultatsHTML(q, cible)` | — |
| `majResultats(cible, sansRelancer)` | — |
| `openAdd(cible)` | — |

| Donnée | Rôle |
|---|---|
| `PAGE` | — |
| `RE_ED_DIESE` | — |
| `RE_ED` | — |
| `RE_NUMERO` | — |

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

Construction du deck, légalité, commandant & fiches détaillées. *21 fonctions, 429 lignes, 24 Ko.*

| Fonction | Rôle |
|---|---|
| `deckEntries()` | — |
| `deckSignature()` | L'empreinte du deck, dont l'empreinte des suggestions se sert pour savoir si la notation vaut encore. |
| `cartesDuDeck()` | Les cartes du deck, une fois chacune. Deux clés de `S.deck` peuvent viser la même carte — un import l'a nommée autrement et `find()` la rattrape, avant que `mergeInto()` ne fusionne les… |
| `deckSize()` | — |
| `availableFor(card)` | — |
| `gameChangersDuDeck()` | Les Game Changers de la liste principale. Leur nombre décide du palier qu'un deck Commander peut revendiquer : aucun aux paliers 1 et 2, jusqu'à trois au palier 3, sans limite aux… |
| `ligneGameChangers()` | Ce que ce décompte dit du palier, en une phrase. |
| `targets()` | — |
| `deckCounts()` | — |
| `gauge(label, val, tgt, role)` | — |
| `legality()` | — |
| `addToDeck(name)` | — |
| `deckAdd(card, qty, opts)` | — |
| `removeFromDeck(name)` | — |
| `buyCard(name)` | — |
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

## js/outils.js

Menue monnaie de l'atelier. *7 fonctions, 72 lignes, 2.4 Ko.*

| Fonction | Rôle |
|---|---|
| `esc(s)` | — |
| `eur(n)` | — |
| `refCarte(nom)` | — |
| `fmt()` | — |
| `spent()` | — |
| `aAcheter()` | — |
| `toast(msg)` | — |

## js/dialogue.js

La fenêtre modale, une à la fois. *2 fonctions, 42 lignes, 2.1 Ko.*

| Fonction | Rôle |
|---|---|
| `openDialog(title, bodyHTML, actionsHTML, grande, entete)` | `entete` : un entête tout fait, quand la fenêtre en veut un autre que le titre suivi de sa croix — c'est celui de la fiche d'une carte, où deux boutons de parcours encadrent le nom… |
| `closeDialog()` | — |

## js/brouillon.js

Le brouillon des fenêtres à « Appliquer ». *12 fonctions, 139 lignes, 6.1 Ko.*

| Fonction | Rôle |
|---|---|
| `ouvreBrouillon(cles, redessine)` | — |
| `copieEtat(v)` | Copie profonde d'un champ de `S` : le `Set` des couleurs comme le `S.custom` imbriqué doivent être détachés, sans quoi le brouillon modifierait l'état appliqué. |
| `echangeBrouillon()` | Met le brouillon à la place de l'état appliqué, et rend de quoi revenir. |
| `reprendEtat(memo, garder)` | Repose l'état appliqué. `garder` reverse au brouillon ce qui vient d'être modifié — y compris quand un champ a été réassigné plutôt que muté. |
| `avecBrouillon(fn)` | Lit comme si le brouillon était appliqué : c'est ainsi que la fenêtre se peint et que son décompte annonce ce que « Appliquer » donnerait. |
| `modifieBrouillon(fn)` | Le jumeau écrivain : ce que `fn` modifie reste dans le brouillon. |
| `brouillonModifie()` | Le brouillon diffère-t-il de ce qui est appliqué ? |
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

Les deux rendus d'une carte. *8 fonctions, 213 lignes, 14 Ko.*

| Fonction | Rôle |
|---|---|
| `tagIllegal(card)` | Le tag « illégal », partout où une carte s'affiche. |
| `tagGameChanger(card)` | Le tag des Game Changers : la liste de Wizards pour les paliers du Commander. |
| `tagDeck(card, ctx)` | Ce que le deck a déjà pris. L'étiquette ne paraît que dans la collection : au deck elle serait vraie de toutes les cartes et n'apprendrait rien, et les listes annexes ont la leur. Le… |
| `actesAnnexe(c, cle, avecBascule)` | Les gestes d'une carte garée dans une liste annexe : la remonter au deck, la passer à l'autre liste, ou l'en retirer. |
| `cardTile(e, ctx)` | Les deux rendus d'une carte — vignette et ligne — n'offrent pas de bouton vers la fiche : un clic sur la vignette, ou n'importe où sur la ligne, l'ouvre déjà (js/app.js, la branche des… |
| `cardRow(e, ctx)` | — |
| `customPanel()` | — |
| `sugRow(s)` | La vignette d'une proposition : la carte, sa note et ce qui la justifie — ses interactions, ce qu'EDHREC en dit, son prix. |

## js/ancre.js

L'ancre de défilement. *3 fonctions, 57 lignes, 2.5 Ko.*

| Fonction | Rôle |
|---|---|
| `candidatsAncre()` | Les repères possibles : les sections, et toute carte affichée. |
| `releveAncre()` | — |
| `restaureAncre(a)` | — |

## js/recalcul.js

Les recalculs annoncés. *8 fonctions, 195 lignes, 8.3 Ko.*

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

L'en-tête et la barre des onglets. *5 fonctions, 176 lignes, 9.5 Ko.*

| Fonction | Rôle |
|---|---|
| `majHauteurEntete()` | La hauteur de l'entête, publiée pour le CSS : les sections s'en servent comme marge de défilement et s'arrêtent sous elle plutôt que derrière. |
| `renderTop()` | — |
| `renderOnglets()` | La barre ne se réécrit pas, elle change d'attributs : la réécrire emporterait le focus du bouton qu'on vient de presser, et les flèches n'auraient plus rien sous elles. |
| `activerOnglet(cle, opts)` | Passer d'un onglet à l'autre : rien n'est redessiné, les cinq sections étant toujours rendues. |
| `allerVersSection(id)` | Aller à une section, d'où qu'on parte : l'onglet qui la porte s'ouvre, et le défilement s'arrête sous l'entête collante plutôt que derrière elle. |

| Donnée | Rôle |
|---|---|
| `FILTRE_ICONE` | — |
| `PARAM_ICONE` | L'engrenage des paramètres : douze dents posées en couronne et un moyeu évidé, dessinés ici plutôt que chargés — l'atelier ne dépend d'aucun fichier extérieur, pas même d'une icône. |
| `POS_ONGLETS` | Où l'on en était dans chaque onglet. Le défilement est celui du document, partagé par les trois pages : sans ce relevé, revenir au deck après une longue collection retomberait n'importe… |

## js/rendu.js

Le rendu d'ensemble. *2 fonctions, 33 lignes, 1.1 Ko.*

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

## js/fenParametres.js

Fenêtre « Paramètres ». *9 fonctions, 129 lignes, 6.2 Ko.*

| Fonction | Rôle |
|---|---|
| `sectionParametres(titre, chapeau, corps)` | Une section de la fenêtre : un titre, une phrase qui dit ce qu'elle règle, et son contenu. |
| `corpsCollectionParam()` | Ce que la collection pèse sur cet appareil, et les deux gestes qui la remplissent ou la vident d'un coup. |
| `corpsCatalogue()` | — |
| `corpsParametres()` | Le corps entier, les trois sections à la suite. |
| `majFenetreParametres()` | La fenêtre reste ouverte pendant qu'une archive se charge ou qu'un réglage change : son corps est réécrit sur place, le défilement gardé, et les champs de fichier rebranchés — l'ancien… |
| `brancherParametres()` | — |
| `appliquerParametres()` | — |
| `openParametresModal()` | — |
| `appliquerFormat()` | « Appliquer » verse le brouillon puis recalcule, comme pour les filtres : changer de format reprend l'atelier tout autant qu'un critère. |

## js/fenBudget.js

Fenêtre « Budget ». *5 fonctions, 78 lignes, 4.4 Ko.*

| Fonction | Rôle |
|---|---|
| `champBudget(id, label, cle, liste)` | — |
| `corpsBudget()` | — |
| `majResumeBudget()` | Un chiffre saisi ne réécrit pas la fenêtre — le curseur y serait perdu : seuls le budget restant et la liste des achats suivent, sous le brouillon. |
| `appliquerBudget()` | « Appliquer » verse le brouillon puis recalcule : le prix maximum par carte entre dans la signature des candidates, tout est à reprendre. |
| `openBudgetModal()` | — |

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

Fenêtres d'export et d'effacement. *3 fonctions, 133 lignes, 6.8 Ko.*

| Fonction | Rôle |
|---|---|
| `exportDeckModal()` | — |
| `openWantsModal()` | — |
| `openWipeModal()` | — |

## js/app.js

Point d'entrée : gestionnaires d'évènements, initialisation et démarrage. *1 fonctions, 870 lignes, 31 Ko.*

| Fonction | Rôle |
|---|---|
| `demarrer()` | — |

| Donnée | Rôle |
|---|---|
| `dlgEl` | Fermeture au clic sur l'arrière-plan (backdrop) |

