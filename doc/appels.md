# Qui appelle qui

*Écrit par `node outils/genAppels.js` à partir des sources — ne pas modifier à la main.*

Pour chaque fonction : le fichier où elle est définie, les fonctions du projet qu'elle
appelle, et celles qui l'appellent. Trois façons d'appeler, notées différemment — un appel
direct sans marque, un appel **différé** (une fonction passée en rappel) précédé de « → »,
un appel depuis un **gestionnaire HTML** produit par l'atelier précédé de « ⌘ ». Les graphes
correspondants sont dans `doc/graphe-fonctions.dot` et `doc/graphe-modules.dot`.

**463 fonctions** dans 76 modules, **1304 appels** relevés.

## Fonctions que personne n'appelle

Points d'entrée — appelées depuis le HTML, depuis un écouteur — ou code mort.

*Aucune.*

## js/effets.js

### `sousTypesDeSort()` — ligne 36

N'appelle aucune fonction du projet.

Appelée par : `qualifieDeclencheur`

### `memeSousType()` — ligne 51

N'appelle aucune fonction du projet.

Appelée par : `compat`

### `qualifieDeclencheur()` — ligne 56

Appelle : `sousTypesDeSort()` *(effets.js)*

Appelée par : `analyze`

### `qualifieProduction()` — ligne 92

N'appelle aucune fonction du projet.

Appelée par : `analyze`

### `libelleQual()` — ligne 105

N'appelle aucune fonction du projet.

Appelée par : `analyze`, `croise`, `ficheHTML`, `noteCarte`

### `compat()` — ligne 117

Appelle : `memeSousType()` *(effets.js)*

Appelée par : `croise`, `noteCarte`

### `coupeDeclencheur()` — ligne 164

N'appelle aucune fonction du projet.

Appelée par : `analyze`

### `coutsDe()` — ligne 191

N'appelle aucune fonction du projet.

Appelée par : `analyze`

### `refineTriggers()` — ligne 202

N'appelle aucune fonction du projet.

Appelée par : `analyze`

### `scopeOf()` — ligne 216

N'appelle aucune fonction du projet.

Appelée par : `analyze`

### `refineEffects()` — ligne 221

N'appelle aucune fonction du projet.

Appelée par : `analyze`

## js/synergies.js

### `feeds()` — ligne 20

N'appelle aucune fonction du projet.

Appelée par : `feedsDe`

### `feedsDe()` — ligne 22

Appelle : `feeds()` *(synergies.js)*

Appelée par : `contexteEvaluation`, `croise`, `noteCarte`

### `croise()` — ligne 28

Appelle : `compat()` *(effets.js)*, `feedsDe()` *(synergies.js)*, `libelleQual()` *(effets.js)*

Appelée par : `synergyBetween`

### `synergyBetween()` — ligne 40

Appelle : `croise()` *(synergies.js)*

Appelée par : `partnersFor`

### `partnersFor()` — ligne 52

Appelle : `synergyBetween()` *(synergies.js)*

Appelée par : `ficheHTML`

## js/analyse.js

### `parseCost()` — ligne 11

N'appelle aucune fonction du projet.

Appelée par : `buildCard`

### `stripReminder()` — ligne 25

N'appelle aucune fonction du projet.

Appelée par : `analyze`

### `splitAbilities()` — ligne 27

N'appelle aucune fonction du projet.

Appelée par : `analyze`

### `matchAll()` — ligne 31

N'appelle aucune fonction du projet.

Appelée par : `analyze`

### `analyze()` — ligne 40

Appelle : `coupeDeclencheur()` *(effets.js)*, `coutsDe()` *(effets.js)*, `libelleQual()` *(effets.js)*, `matchAll()` *(analyse.js)*, `qualifieDeclencheur()` *(effets.js)*, `qualifieProduction()` *(effets.js)*, `refineEffects()` *(effets.js)*, `refineTriggers()` *(effets.js)*, `scopeOf()` *(effets.js)*, `splitAbilities()` *(analyse.js)*, `stripReminder()` *(analyse.js)*

Appelée par : `reanalyser`

## js/categories.js

### `categories()` — ligne 12

N'appelle aucune fonction du projet.

Appelée par : `reanalyser`

### `reanalyser()` — ligne 115

Appelle : `analyze()` *(analyse.js)*, `categories()` *(categories.js)*

Appelée par : `applyScryfall`, `buildCard`, `carteDuCatalogue`, `completeDepuisRec`, `majTexteOracle`, `restore`

## js/impressions.js

### `cleImpression()` — ligne 12

N'appelle aucune fonction du projet.

Appelée par : `applyScryfall`, `besoinScryfall`, `chercheImpressions`, `cibleImpression`, `cleVersion`, `ficheHTML`, `indexImpressions`, `runScryQueue`, `semeVisuelVersion`, `versionRetenue`, `visuelEnRecherche`, `visuelVersion`

### `noterImpression()` — ligne 21

N'appelle aucune fonction du projet.

Appelée par : `openImport`

### `completeImpression()` — ligne 45

N'appelle aucune fonction du projet.

Appelée par : `applyScryfall`

### `libelleImpression()` — ligne 53

N'appelle aucune fonction du projet.

Appelée par : `ficheHTML`

### `versionsCarte()` — ligne 61

N'appelle aucune fonction du projet.

Appelée par : `basculerSourceVersions`, `blocVersions`, `chercheImpressions`, `choisirVersion`, `listeVersions`, `possedeVersion`

### `cleVersion()` — ligne 65

Appelle : `cleImpression()` *(impressions.js)*

Appelée par : `basculerSourceVersions`, `blocVersions`, `chercheImpressions`, `choisirVersion`, `ficheHTML`, `possedeVersion`, `versionRang`, `visuelEnRecherche`, `visuelVersion`

### `versionRetenue()` — ligne 71

Appelle : `cleImpression()` *(impressions.js)*

Appelée par : `basculerSourceVersions`, `blocVersions`, `versionRang`

## js/cartes.js

### `chargement du module`

Appelle : `buildCard()` *(cartes.js)*, `norm()` *(cartes.js)*, `registerCard()` *(cartes.js)*

### `norm()` — ligne 17

N'appelle aucune fonction du projet.

Appelée par : `appliqueCatalogueAuxCartes`, `applyScryfall`, `archetypesCarte`, `cartes.js (chargement)`, `chargerGameChangers`, `chercheCartes`, `chercheScryfall`, `completeUnknown`, `edhrecAllFor`, `edhrecFor`, `estGameChanger`, `fetchEdhrecCommander`, `ficheHTML`, `filtreOKRec`, `filtresValeursOK`, `find`, `gestesGraphe`, `indexCard`, `loose`, `majResultats`, `nbInteractions`, `nomsPageEdhrec`, `noteCarte`, `noteSetIndex`, `parseMtgoList`, `registerCard`, `renameCard`, `resultatsHTML`, `retiens`, `scryTarget`, `setsCarte`, `setsRec`, `snapshot`, `unindexCard`

### `loose()` — ligne 18

Appelle : `norm()` *(cartes.js)*

Appelée par : `applyScryfall`, `completeUnknown`, `edhrecAllFor`, `edhrecFor`, `fetchEdhrecCommander`, `filtresValeursOK`, `find`, `indexCard`, `listeArchetypesHTML`, `listeSetsHTML`, `scryTarget`, `unindexCard`

### `buildCard()` — ligne 20

Appelle : `parseCost()` *(analyse.js)*, `reanalyser()` *(categories.js)*

Appelée par : `applyScryfall`, `carteDepuisScryfall`, `carteDuCatalogue`, `cartes.js (chargement)`, `gestesGraphe`, `getCardOrAnalyzedRec`, `initBuiltin`, `openImport`, `restore`

### `majTexteOracle()` — ligne 46

Appelle : `reanalyser()` *(categories.js)*

Appelée par : `applyScryfall`, `completeDepuisRec`, `restore`

### `indexCard()` — ligne 64

Appelle : `loose()` *(cartes.js)*, `norm()` *(cartes.js)*

Appelée par : `registerCard`, `renameCard`

### `unindexCard()` — ligne 73

Appelle : `loose()` *(cartes.js)*, `norm()` *(cartes.js)*

Appelée par : `mergeInto`, `renameCard`

### `registerCard()` — ligne 82

Appelle : `indexCard()` *(cartes.js)*, `norm()` *(cartes.js)*

Appelée par : `applyScryfall`, `carteDuCatalogue`, `cartes.js (chargement)`, `gestesGraphe`, `initBuiltin`, `openImport`, `restore`

### `find()` — ligne 90

Appelle : `loose()` *(cartes.js)*, `norm()` *(cartes.js)*

Appelée par : `aAcheter`, `addToDeck`, `annexeEntries`, `appliqueCatalogueAuxCartes`, `applyScryfall`, `basculerSourceVersions`, `buyCard`, `carteDuCatalogue`, `chargerCatalogue`, `choisirVersion`, `collectionCards`, `commandantsPrincipaux`, `completeUnknown`, `contexteEvaluation`, `deckEntries`, `deplacerCarte`, `faireDefilerVersion`, `ficheImageKO`, `gestesDeck`, `gestesGraphe`, `getCardOrAnalyzedRec`, `legality`, `loadEdhrec`, `majApercu`, `majPrix`, `montrerApercu`, `openCardModal`, `openImport`, `panneauEdhrec`, `requeteCatalogue`, `restore`, `resultatsHTML`, `selectionCandidats`, `signatureCommandants`, `versAnnexe`, `vivierSuggestions`, `zoneCommandant`

### `peutCommander()` — ligne 98

N'appelle aucune fonction du projet.

Appelée par : `commandantsPossibles`, `commandantsSecondairesPossibles`

### `commandantsPossibles()` — ligne 102

Appelle : `deckEntries()` *(deck.js)*, → `peutCommander()` *(cartes.js)*

Appelée par : `zoneCommandant`

### `commandantsPrincipaux()` — ligne 111

Appelle : `find()` *(cartes.js)*

Appelée par : `panneauEdhrec`

### `commandantsSecondairesPossibles()` — ligne 119

Appelle : `deckEntries()` *(deck.js)*, `peutCommander()` *(cartes.js)*

Appelée par : `commandantsSecondaires`, `panneauEdhrec`

### `commandantsSecondaires()` — ligne 127

Appelle : `commandantsSecondairesPossibles()` *(cartes.js)*

Appelée par : `blocEdhrec`, `edhrecAllFor`, `lanceEdhrecSiBesoin`, `loadEdhrec`, `panneauEdhrec`, `signatureCommandants`

### `mainType()` — ligne 131

N'appelle aucune fonction du projet.

Appelée par : `annexeEntries`, `deckEntries`, `filtreOK`, `filtreOKRec`, `groupes.js (chargement)`, `statsOf`

### `initBuiltin()` — ligne 155

Appelle : `buildCard()` *(cartes.js)*, `registerCard()` *(cartes.js)*

Appelée par : `demarrer`

### `frontFace()` — ligne 165

N'appelle aucune fonction du projet.

Appelée par : `archetypesCarte`, `chargerGameChangers`, `chargerSetScryfall`, `chercheTexte`, `chercheVerso`, `completeUnknown`, `edhrecAllFor`, `edhrecFor`, `edhrecSlug`, `estGameChanger`, `fetchEdhrecCommander`, `filtreOKRec`, `scryTarget`, `setsCarte`, `setsRec`

### `mergeInto()` — ligne 169

Appelle : `annexeListe()` *(annexes.js)*, `unindexCard()` *(cartes.js)*

Appelée par : `renameCard`

### `renameCard()` — ligne 190

Appelle : `indexCard()` *(cartes.js)*, `mergeInto()` *(cartes.js)*, `norm()` *(cartes.js)*, `unindexCard()` *(cartes.js)*, → `annexeListe()` *(annexes.js)*

Appelée par : `applyScryfall`

## js/liens.js

### `seuilLiensLarges()` — ligne 20

N'appelle aucune fonction du projet.

Appelée par : `classeLiens`

### `cleLien()` — ligne 24

N'appelle aucune fonction du projet.

Appelée par : `classeLiens`

### `classeLiens()` — ligne 31

Appelle : `cleLien()` *(liens.js)*, `seuilLiensLarges()` *(liens.js)*

Appelée par : `ficheHTML`, `noteCarte`

### `libelleFamilleLarge()` — ligne 59

N'appelle aucune fonction du projet.

Appelée par : `libelleFamillesLarges`

### `libelleFamillesLarges()` — ligne 63

Appelle : → `libelleFamilleLarge()` *(liens.js)*

Appelée par : `cardTile`, `ficheHTML`, `noteCarte`, `sugRow`

### `primeLiensLarges()` — ligne 71

N'appelle aucune fonction du projet.

Appelée par : `noteCarte`

## js/etat.js

### `ongletDeSection()` — ligne 71

N'appelle aucune fonction du projet.

Appelée par : `allerVersSection`, `signalerTravail`

## js/archetypesSets.js

### `libelleArchetype()` — ligne 65

N'appelle aucune fonction du projet.

Appelée par : `archetypesDisponibles`, `corpsFiltres`, `ficheHTML`, `filtresActifs`, `resumeArchetype`

### `resumeArchetype()` — ligne 74

Appelle : `libelleArchetype()` *(archetypesSets.js)*

Appelée par : `archetypesDisponibles`, `corpsFiltres`, `ficheHTML`

### `archetypesDisponibles()` — ligne 90

Appelle : `libelleArchetype()` *(archetypesSets.js)*, `resumeArchetype()` *(archetypesSets.js)*

Appelée par : `listeArchetypesHTML`

### `archetypesCarte()` — ligne 97

Appelle : `frontFace()` *(cartes.js)*, `norm()` *(cartes.js)*

Appelée par : `ficheHTML`, `filtreOK`

### `archetypesAChargerEdhrec()` — ligne 105

Appelle : `archetypesFiltre()` *(archetypesSets.js)*

Appelée par : `chargerArchetypesEdhrec`, `gestesVue`

### `archetypesFiltre()` — ligne 110

N'appelle aucune fonction du projet.

Appelée par : `archetypesAChargerEdhrec`, `basculerArchetype`, `corpsFiltres`, `filtresActifs`, `filtresValeursOK`, `listeArchetypesHTML`

### `basculerArchetype()` — ligne 114

Appelle : `archetypesFiltre()` *(archetypesSets.js)*

Appelée par : `gestesVue`

### `setsFiltre()` — ligne 122

N'appelle aucune fonction du projet.

Appelée par : `basculerSet`, `corpsFiltres`, `filtresActifs`, `filtresValeursOK`, `listeSetsHTML`, `setsACharger`

### `basculerSet()` — ligne 126

Appelle : `setsFiltre()` *(archetypesSets.js)*

Appelée par : `gestesVue`

### `libelleSet()` — ligne 135

N'appelle aucune fonction du projet.

Appelée par : `corpsFiltres`, `filtresActifs`

### `setsACharger()` — ligne 141

Appelle : `setsFiltre()` *(archetypesSets.js)*

Appelée par : `gestesVue`

### `setsCarte()` — ligne 150

Appelle : `frontFace()` *(cartes.js)*, `norm()` *(cartes.js)*

Appelée par : `filtreOK`

## js/filtres.js

### `rolesFiltre()` — ligne 11

N'appelle aucune fonction du projet.

Appelée par : `basculerRole`, `corpsFiltres`, `filtresActifs`, `gauge`, `roleOK`

### `basculerRole()` — ligne 15

Appelle : `rolesFiltre()` *(filtres.js)*

Appelée par : `gestesReglages`

### `roleOK()` — ligne 23

Appelle : `rolesFiltre()` *(filtres.js)*

Appelée par : `carteFiltree`, `causesCollection`

### `nombreFiltre()` — ligne 29

N'appelle aucune fonction du projet.

Appelée par : `filtresActifs`, `filtresValeursOK`

### `reinitFiltres()` — ligne 35

N'appelle aucune fonction du projet.

Appelée par : `gestesReglages`

### `majFiltre()` — ligne 40

N'appelle aucune fonction du projet.

Appelée par : `app.js (chargement)`, `effacerFiltre`

### `effacerFiltre()` — ligne 45

Appelle : `majFiltre()` *(filtres.js)*

Appelée par : `gestesVue`

### `filtresActifs()` — ligne 51

Appelle : `archetypesFiltre()` *(archetypesSets.js)*, `nombreFiltre()` *(filtres.js)*, `rolesFiltre()` *(filtres.js)*, `setsFiltre()` *(archetypesSets.js)*, → `libelleArchetype()` *(archetypesSets.js)*, → `libelleSet()` *(archetypesSets.js)*

Appelée par : `ligneCausesCollection`, `renderB`, `renderTop`, `resumeFiltres`, `texteFiltresActifs`

### `texteFiltresActifs()` — ligne 83

Appelle : `filtresActifs()` *(filtres.js)*

Appelée par : `ligneCausesCollection`, `renderTop`, `resumeFiltres`

### `carteFiltree()` — ligne 90

Appelle : `colorOK()` *(collection.js)*, `filtreOK()` *(retenue.js)*, `roleOK()` *(filtres.js)*

Appelée par : `blocAnnexe`, `carteRetenue`, `renderE`

### `valeurFiltre()` — ligne 97

N'appelle aucune fonction du projet.

Appelée par : `filtresValeursOK`

### `motsFiltre()` — ligne 111

N'appelle aucune fonction du projet.

Appelée par : `filtresValeursOK`

### `filtresValeursOK()` — ligne 118

Appelle : `archetypesFiltre()` *(archetypesSets.js)*, `motsFiltre()` *(filtres.js)*, `nombreFiltre()` *(filtres.js)*, `setsFiltre()` *(archetypesSets.js)*, `valeurFiltre()` *(filtres.js)*, → `loose()` *(cartes.js)*, → `norm()` *(cartes.js)*

Appelée par : `filtreOK`, `filtreOKRec`

## js/retenue.js

### `gameChangersConnus()` — ligne 27

N'appelle aucune fonction du projet.

Appelée par : `estGameChanger`, `ligneGameChangers`, `renderE`

### `estGameChanger()` — ligne 33

Appelle : `frontFace()` *(cartes.js)*, `gameChangersConnus()` *(retenue.js)*, `norm()` *(cartes.js)*

Appelée par : `ficheHTML`, `gameChangersDuDeck`, `tagGameChanger`

### `codeLegalite()` — ligne 43

N'appelle aucune fonction du projet.

Appelée par : `applyScryfall`, `compacte`

### `carteLegale()` — ligne 53

Appelle : `fmt()` *(outils.js)*

Appelée par : `legaliteOK`, `legality`, `tagIllegal`

### `legaliteOK()` — ligne 61

Appelle : `carteLegale()` *(retenue.js)*

Appelée par : `carteRetenue`, `causesCollection`

### `carteRetenue()` — ligne 69

Appelle : `carteFiltree()` *(filtres.js)*, `legaliteOK()` *(retenue.js)*

Appelée par : `filtered`, `ordonneSuggestions`

### `filtreOK()` — ligne 74

Appelle : `archetypesCarte()` *(archetypesSets.js)*, `filtresValeursOK()` *(filtres.js)*, `mainType()` *(cartes.js)*, `setsCarte()` *(archetypesSets.js)*

Appelée par : `carteFiltree`, `causesCollection`

### `setsRec()` — ligne 89

Appelle : `frontFace()` *(cartes.js)*, `norm()` *(cartes.js)*

Appelée par : `filtreOKRec`

### `filtreOKRec()` — ligne 104

Appelle : `filtresValeursOK()` *(filtres.js)*, `frontFace()` *(cartes.js)*, `mainType()` *(cartes.js)*, `norm()` *(cartes.js)*, `setsRec()` *(retenue.js)*

Appelée par : `selectionCandidats`

## js/catalogueEtat.js

### `catalogueAbsent()` — ligne 19

N'appelle aucune fonction du projet.

Appelée par : `demarrerCatalogue`, `majCatalogue`

### `noeudsActifs()` — ligne 23

N'appelle aucune fonction du projet.

Appelée par : `blocGraphe`, `chercheCartes`, `ligneCatalogue`, `noteCarte`, `renderD`, `renderG`, `resultatsHTML`, `selectionCandidats`, `signatureCandidats`, `vivierSuggestions`

### `carteTouche()` — ligne 27

N'appelle aucune fonction du projet.

Appelée par : `chercheCartes`, `noteCarte`, `recToucheNoeuds`, `renderD`, `vivierSuggestions`

### `getCardOrAnalyzedRec()` — ligne 39

Appelle : `buildCard()` *(cartes.js)*, `find()` *(cartes.js)*

Appelée par : `chercheCartes`, `recToucheNoeuds`

### `recToucheNoeuds()` — ligne 57

Appelle : `carteTouche()` *(catalogueEtat.js)*, `getCardOrAnalyzedRec()` *(catalogueEtat.js)*

Appelée par : `chercheCartes`, `selectionCandidats`

## js/groupes.js

### `chargement du module`

Appelle : `mainType()` *(cartes.js)*, `scoreEntree()` *(groupes.js)*, `seauCmc()` *(groupes.js)*, `sousTypesCarte()` *(groupes.js)*, `tauxEdhrec()` *(groupes.js)*

### `sousTypesCarte()` — ligne 22

N'appelle aucune fonction du projet.

Appelée par : `groupes.js (chargement)`

### `seauCmc()` — ligne 43

N'appelle aucune fonction du projet.

Appelée par : `groupes.js (chargement)`

### `tauxEdhrec()` — ligne 130

N'appelle aucune fonction du projet.

Appelée par : `groupes.js (chargement)`

### `scoreEntree()` — ligne 166

N'appelle aucune fonction du projet.

Appelée par : `groupes.js (chargement)`

### `notesCollectionAJour()` — ligne 185

Appelle : `signatureSuggestions()` *(vivier.js)*

Appelée par : `notesCollection`

### `notesCollection()` — ligne 189

Appelle : `contexteEvaluation()` *(notation.js)*, `noteCarte()` *(notation.js)*, `notesCollectionAJour()` *(groupes.js)*, `signatureSuggestions()` *(vivier.js)*

Appelée par : `filtered`

### `groupeCartes()` — ligne 210

N'appelle aucune fonction du projet.

Appelée par : `blocAnnexe`, `blocEdhrec`, `gestesReglages`, `listeSuggestions`, `renderB`, `renderE`

## js/barreGroupes.js

### `clePli()` — ligne 17

N'appelle aucune fonction du projet.

Appelée par : `enveloppeGroupe`, `groupePlie`

### `groupePlie()` — ligne 21

Appelle : `clePli()` *(barreGroupes.js)*

Appelée par : `renderB`, `visuelsCatalogue`, `visuelsEdhrec`

### `enveloppeGroupe()` — ligne 32

Appelle : `clePli()` *(barreGroupes.js)*, `esc()` *(outils.js)*

Appelée par : `blocEdhrec`, `listeSuggestions`, `rendGroupes`

### `rendGroupes()` — ligne 55

Appelle : `enveloppeGroupe()` *(barreGroupes.js)*

Appelée par : `blocAnnexe`, `renderB`, `renderE`

### `noteMultiple()` — ligne 71

N'appelle aucune fonction du projet.

Appelée par : `blocEdhrec`, `listeSuggestions`, `renderB`, `renderE`

### `colonnesDe()` — ligne 93

N'appelle aucune fonction du projet.

Appelée par : `corpsAffichage`, `menuColonnes`, `openAffichageModal`, `ouvreGrille`, `resumeAffichage`

### `menuColonnes()` — ligne 98

Appelle : `colonnesDe()` *(barreGroupes.js)*

Appelée par : `listeSuggestions`

### `ouvreGrille()` — ligne 111

Appelle : `colonnesDe()` *(barreGroupes.js)*

Appelée par : `listeSuggestions`, `renderB`

### `barreGroupeTri()` — ligne 116

N'appelle aucune fonction du projet.

Appelée par : `blocEdhrec`, `listeSuggestions`, `renderE`

## js/marche.js

### `cmLink()` — ligne 27

N'appelle aucune fonction du projet.

Appelée par : `blocAchats`, `ligneAchats`, `openCardModal`

### `cmEstimate()` — ligne 31

N'appelle aucune fonction du projet.

Appelée par : `addToDeck`, `bestOffer`

### `bestOffer()` — ligne 39

Appelle : `cmEstimate()` *(marche.js)*

Appelée par : `aAcheter`, `buyCard`, `ficheHTML`, `ligneCatalogue`, `openCardModal`, `vivierSuggestions`

## js/symboles.js

### `loadSymbology()` — ligne 16

Appelle : `renderAll()` *(rendu.js)*

Appelée par : `demarrer`

### `pipHTML()` — ligne 30

N'appelle aucune fonction du projet.

Appelée par : `symBg`, `symIcon`

### `symBg()` — ligne 38

Appelle : `esc()` *(outils.js)*, `pipHTML()` *(symboles.js)*

Appelée par : `corpsFiltres`, `renderTop`

### `symIcon()` — ligne 46

Appelle : `esc()` *(outils.js)*, `pipHTML()` *(symboles.js)*, ⌘ `manaFb()` *(symboles.js)*

Appelée par : `manaHTML`, `renderC`, `zoneCommandant`

### `manaFb()` — ligne 55

N'appelle aucune fonction du projet.

Appelée par : `symIcon`

### `manaHTML()` — ligne 60

Appelle : `symIcon()` *(symboles.js)*

Appelée par : `cardRow`, `ficheTexteHTML`, `montrerApercu`

### `stripeColor()` — ligne 66

N'appelle aucune fonction du projet.

Appelée par : `blocAchats`

## js/scryfallApplique.js

### `scryTarget()` — ligne 10

Appelle : `frontFace()` *(cartes.js)*, `loose()` *(cartes.js)*, `norm()` *(cartes.js)*

Appelée par : `completeUnknown`, `majPrix`, `runScryQueue`

### `applyScryfall()` — ligne 21

Appelle : `buildCard()` *(cartes.js)*, `cleImpression()` *(impressions.js)*, `codeLegalite()` *(retenue.js)*, `completeImpression()` *(impressions.js)*, `find()` *(cartes.js)*, `loose()` *(cartes.js)*, `majTexteOracle()` *(cartes.js)*, `norm()` *(cartes.js)*, `reanalyser()` *(categories.js)*, `registerCard()` *(cartes.js)*, `renameCard()` *(cartes.js)*

Appelée par : `carteDepuisScryfall`, `chargerCatalogue`, `chercheTexte`, `chercheVerso`, `completeUnknown`, `runScryQueue`

## js/scryfall.js

### `identScryfall()` — ligne 17

N'appelle aucune fonction du projet.

Appelée par : `completeUnknown`, `runScryQueue`

### `cibleImpression()` — ligne 24

Appelle : `cleImpression()` *(impressions.js)*

Appelée par : `completeUnknown`, `runScryQueue`

### `indexImpressions()` — ligne 29

Appelle : `cleImpression()` *(impressions.js)*

Appelée par : `completeUnknown`, `runScryQueue`

### `besoinScryfall()` — ligne 43

Appelle : `cleImpression()` *(impressions.js)*

Appelée par : `queueScryfall`

### `queueScryfall()` — ligne 51

Appelle : `besoinScryfall()` *(scryfall.js)*, `runScryQueue()` *(scryfall.js)*

Appelée par : `montrerApercu`, `renderB`, `renderE`, `visuelsSuggestions`

### `runScryQueue()` — ligne 67

Appelle : `applyScryfall()` *(scryfallApplique.js)*, `cibleImpression()` *(scryfall.js)*, `cleImpression()` *(impressions.js)*, `indexImpressions()` *(scryfall.js)*, `majApercu()` *(apercu.js)*, `rafraichirFiche()` *(ficheVisuel.js)*, `renderB()` *(collection.js)*, `renderE()` *(deckSection.js)*, `scheduleSave()` *(stockage.js)*, `scryTarget()` *(scryfallApplique.js)*, `toast()` *(outils.js)*, → `identScryfall()` *(scryfall.js)*

Appelée par : `queueScryfall`

### `completeUnknown()` — ligne 109

Appelle : `applyScryfall()` *(scryfallApplique.js)*, `cibleImpression()` *(scryfall.js)*, `find()` *(cartes.js)*, `frontFace()` *(cartes.js)*, `identScryfall()` *(scryfall.js)*, `indexImpressions()` *(scryfall.js)*, `loose()` *(cartes.js)*, `norm()` *(cartes.js)*, `renderAll()` *(rendu.js)*, `scryTarget()` *(scryfallApplique.js)*, `toast()` *(outils.js)*

Appelée par : `enrichAllUnknown`, `openImport`

## js/recherches.js

### `chercheScryfall()` — ligne 12

Appelle : `colorOK()` *(collection.js)*, `majResultats()` *(fenAjout.js)*, `norm()` *(cartes.js)*

Appelée par : `majResultats`

### `semeVisuelVersion()` — ligne 39

Appelle : `cleImpression()` *(impressions.js)*

Appelée par : `chercheImpressions`

### `visuelDepuisScryfall()` — ligne 52

N'appelle aucune fonction du projet.

Appelée par : `chercheImpressions`, `chercheToutesEditions`

### `chercheImpressions()` — ligne 68

Appelle : `cleImpression()` *(impressions.js)*, `cleVersion()` *(impressions.js)*, `semeVisuelVersion()` *(recherches.js)*, `versionsCarte()` *(impressions.js)*, `visuelDepuisScryfall()` *(recherches.js)*

Appelée par : `openCardModal`

### `chercheToutesEditions()` — ligne 110

Appelle : `visuelDepuisScryfall()` *(recherches.js)*

Appelée par : `basculerSourceVersions`

### `chercheVerso()` — ligne 150

Appelle : `applyScryfall()` *(scryfallApplique.js)*, `frontFace()` *(cartes.js)*, `scheduleSave()` *(stockage.js)*

Appelée par : `openCardModal`

### `chercheTexte()` — ligne 165

Appelle : `applyScryfall()` *(scryfallApplique.js)*, `frontFace()` *(cartes.js)*, `scheduleSave()` *(stockage.js)*

Appelée par : `openCardModal`

### `carteDepuisScryfall()` — ligne 179

Appelle : `applyScryfall()` *(scryfallApplique.js)*, `buildCard()` *(cartes.js)*

Appelée par : `gestesGraphe`

### `enrichAllUnknown()` — ligne 192

Appelle : `completeUnknown()` *(scryfall.js)*, `toast()` *(outils.js)*

Appelée par : `gestesDonnees`

## js/stockage.js

### `impressionSnap()` — ligne 33

N'appelle aucune fonction du projet.

Appelée par : `snapshot`

### `impressionRestore()` — ligne 42

N'appelle aucune fonction du projet.

Appelée par : `restore`

### `snapshot()` — ligne 53

Appelle : `annexeDe()` *(annexes.js)*, `impressionSnap()` *(stockage.js)*, `norm()` *(cartes.js)*

Appelée par : `gestesDonnees`, `save`

### `ecrire()` — ligne 107

N'appelle aucune fonction du projet.

Appelée par : `save`

### `save()` — ligne 111

Appelle : `ecrire()` *(stockage.js)*, `snapshot()` *(stockage.js)*, `toast()` *(outils.js)*

Appelée par : `brancherRestauration`, `brancherSauvegarde`, `gestesDonnees`, `scheduleSave`

### `scheduleSave()` — ligne 138

Appelle : → `save()` *(stockage.js)*

Appelée par : `activerOnglet`, `app.js (chargement)`, `appliqueCatalogueAuxCartes`, `appliquerAffichage`, `brancherCatalogue`, `chercheTexte`, `chercheVerso`, `choisirVersion`, `gestesDeck`, `gestesDonnees`, `renderAll`, `runScryQueue`

### `restore()` — ligne 144

Appelle : `buildCard()` *(cartes.js)*, `find()` *(cartes.js)*, `impressionRestore()` *(stockage.js)*, `majTexteOracle()` *(cartes.js)*, `reanalyser()` *(categories.js)*, `registerCard()` *(cartes.js)*

Appelée par : `brancherRestauration`, `demarrer`

### `chargerSauvegarde()` — ligne 240

N'appelle aucune fonction du projet.

Appelée par : `demarrer`

## js/fenSauvegarde.js

### `corpsSauvegarde()` — ligne 10

Appelle : `esc()` *(outils.js)*

Appelée par : `corpsParametres`

### `blocCatalogue()` — ligne 45

Appelle : `catalogueObsolete()` *(catalogue.js)*, `esc()` *(outils.js)*

Appelée par : `corpsCatalogue`

### `rafraichirFenetreSauvegarde()` — ligne 107

Appelle : `majFenetreParametres()` *(fenParametres.js)*

Appelée par : `brancherCatalogue`, `gestesDonnees`, `majCatalogue`, `telechargerCatalogue`

### `brancherSauvegarde()` — ligne 115

Appelle : `idbVider()` *(idb.js)*, `majFenetreParametres()` *(fenParametres.js)*, `renderTop()` *(entete.js)*, `save()` *(stockage.js)*, `toast()` *(outils.js)*

Appelée par : `brancherParametres`

### `brancherCatalogue()` — ligne 136

Appelle : `chargerCatalogueComplet()` *(catalogue.js)*, `fermerBoiteCatalogue()` *(boiteCatalogue.js)*, `idbVider()` *(idb.js)*, `invaliderCandidats()` *(candidats.js)*, `lireCatalogueFichier()` *(archive.js)*, `nouveauSuivi()` *(archive.js)*, `ouvrirBoiteCatalogue()` *(boiteCatalogue.js)*, `rafraichirFenetreSauvegarde()` *(fenSauvegarde.js)*, `renderAll()` *(rendu.js)*, `renderSuggestions()` *(suggestions.js)*, `scheduleSave()` *(stockage.js)*, `toast()` *(outils.js)*

Appelée par : `brancherParametres`

### `brancherRestauration()` — ligne 184

Appelle : `collectionCards()` *(collection.js)*, `deckSize()` *(deck.js)*, `renderAll()` *(rendu.js)*, `restore()` *(stockage.js)*, `save()` *(stockage.js)*, `toast()` *(outils.js)*

Appelée par : `brancherParametres`

## js/idb.js

### `idb()` — ligne 11

N'appelle aucune fonction du projet.

Appelée par : `idbEcrire`, `idbLire`, `idbVider`

### `idbLire()` — ligne 21

Appelle : `idb()` *(idb.js)*

Appelée par : `chargerCatalogueComplet`, `reprendreArchetypesEdhrec`, `reprendreGameChangers`, `reprendreSets`

### `idbEcrire()` — ligne 29

Appelle : `idb()` *(idb.js)*

Appelée par : `lireCatalogueFichier`, `sauverArchetypesEdhrec`, `sauverGameChangers`, `sauverSets`

### `idbVider()` — ligne 37

Appelle : `idb()` *(idb.js)*

Appelée par : `brancherCatalogue`, `brancherSauvegarde`, `gestesDonnees`

## js/edhrec.js

### `edhrecSlug()` — ligne 15

Appelle : `frontFace()` *(cartes.js)*

Appelée par : `edhrecAllFor`, `fetchEdhrecCommander`, `lienDecksEdhrec`, `loadEdhrec`, `panneauEdhrec`

### `fetchEdhrecCommander()` — ligne 20

Appelle : `edhrecSlug()` *(edhrec.js)*, `frontFace()` *(cartes.js)*, `loose()` *(cartes.js)*, `norm()` *(cartes.js)*

Appelée par : `loadEdhrec`

### `edhrecFor()` — ligne 74

Appelle : `frontFace()` *(cartes.js)*, `loose()` *(cartes.js)*, `norm()` *(cartes.js)*

Appelée par : `noteCarte`

### `edhrecAllFor()` — ligne 110

Appelle : `commandantsSecondaires()` *(cartes.js)*, `edhrecSlug()` *(edhrec.js)*, `frontFace()` *(cartes.js)*, `loose()` *(cartes.js)*, `norm()` *(cartes.js)*

Appelée par : `ficheHTML`, `noteCarte`

### `signatureCommandants()` — ligne 179

Appelle : `commandantsSecondaires()` *(cartes.js)*, `find()` *(cartes.js)*

Appelée par : `gestesDeck`, `lanceEdhrecSiBesoin`, `loadEdhrec`

### `loadEdhrec()` — ligne 184

Appelle : `commandantsSecondaires()` *(cartes.js)*, `edhrecSlug()` *(edhrec.js)*, `fetchEdhrecCommander()` *(edhrec.js)*, `find()` *(cartes.js)*, `renderSuggestions()` *(suggestions.js)*, `signatureCommandants()` *(edhrec.js)*, `toast()` *(outils.js)*

Appelée par : `gestesDonnees`, `lanceEdhrecSiBesoin`

## js/edhrecForme.js

### `pauseEdhrec()` — ligne 38

N'appelle aucune fonction du projet.

Appelée par : `chargerListeArchetypesEdhrec`, `formeThemeEdhrec`

### `formesDeduites()` — ligne 45

N'appelle aucune fonction du projet.

Appelée par : `formeThemeEdhrec`

### `formeThemeEdhrec()` — ligne 63

Appelle : `formesDeduites()` *(edhrecForme.js)*, `nomsPageEdhrec()` *(edhrecForme.js)*, `pauseEdhrec()` *(edhrecForme.js)*

Appelée par : `chargerListeArchetypesEdhrec`, `chargerThemeEdhrec`

### `temoinEdhrec()` — ligne 111

N'appelle aucune fonction du projet.

Appelée par : `chargerArchetypesEdhrec`

### `nomsPageEdhrec()` — ligne 121

Appelle : `norm()` *(cartes.js)*

Appelée par : `chargerThemeEdhrec`, `formeThemeEdhrec`

### `indexDepuisCartes()` — ligne 131

N'appelle aucune fonction du projet.

Appelée par : `reprendreArchetypesEdhrec`, `reprendreSets`

### `cartesDepuisIndex()` — ligne 137

N'appelle aucune fonction du projet.

Appelée par : `sauverArchetypesEdhrec`, `sauverSets`

## js/edhrecThemes.js

### `reprendreArchetypesEdhrec()` — ligne 12

Appelle : `idbLire()` *(idb.js)*, `indexDepuisCartes()` *(edhrecForme.js)*

Appelée par : `demarrer`

### `urlIndexEdhrec()` — ligne 29

N'appelle aucune fonction du projet.

Appelée par : `chargerListeArchetypesEdhrec`

### `descriptionPageEdhrec()` — ligne 34

N'appelle aucune fonction du projet.

Appelée par : `chargerThemeEdhrec`

### `themesPageEdhrec()` — ligne 42

N'appelle aucune fonction du projet.

Appelée par : `chargerListeArchetypesEdhrec`

### `chargerListeArchetypesEdhrec()` — ligne 68

Appelle : `formeThemeEdhrec()` *(edhrecForme.js)*, `pauseEdhrec()` *(edhrecForme.js)*, `themesPageEdhrec()` *(edhrecThemes.js)*, `urlIndexEdhrec()` *(edhrecThemes.js)*

Appelée par : `chargerArchetypesEdhrec`

### `chargerThemeEdhrec()` — ligne 92

Appelle : `descriptionPageEdhrec()` *(edhrecThemes.js)*, `formeThemeEdhrec()` *(edhrecForme.js)*, `majFenetreFiltres()` *(fenFiltres.js)*, `nomsPageEdhrec()` *(edhrecForme.js)*, `renderAllSiApplique()` *(brouillon.js)*, `sauverArchetypesEdhrec()` *(edhrecThemes.js)*

Appelée par : `chargerArchetypesEdhrec`, `gestesVue`

### `sauverArchetypesEdhrec()` — ligne 119

Appelle : `cartesDepuisIndex()` *(edhrecForme.js)*, `idbEcrire()` *(idb.js)*

Appelée par : `chargerArchetypesEdhrec`, `chargerThemeEdhrec`

### `signatureArchetypes()` — ligne 127

N'appelle aucune fonction du projet.

Appelée par : `chargerArchetypesEdhrec`

### `archetypesARevoir()` — ligne 133

N'appelle aucune fonction du projet.

Appelée par : `demarrer`

### `chargerArchetypesEdhrec()` — ligne 141

Appelle : `archetypesAChargerEdhrec()` *(archetypesSets.js)*, `chargerListeArchetypesEdhrec()` *(edhrecThemes.js)*, `chargerThemeEdhrec()` *(edhrecThemes.js)*, `majFenetreFiltres()` *(fenFiltres.js)*, `renderAllSiApplique()` *(brouillon.js)*, `sauverArchetypesEdhrec()` *(edhrecThemes.js)*, `signatureArchetypes()` *(edhrecThemes.js)*, `temoinEdhrec()` *(edhrecForme.js)*, `toast()` *(outils.js)*

Appelée par : `demarrer`

## js/sets.js

### `setRetenu()` — ligne 21

N'appelle aucune fonction du projet.

Appelée par : `chargerListeSets`

### `reprendreSets()` — ligne 28

Appelle : `idbLire()` *(idb.js)*, `indexDepuisCartes()` *(edhrecForme.js)*

Appelée par : `chargerListeSets`, `demarrer`

### `sauverSets()` — ligne 44

Appelle : `cartesDepuisIndex()` *(edhrecForme.js)*, `idbEcrire()` *(idb.js)*

Appelée par : `chargerListeSets`, `chargerSetScryfall`

### `setsARevoir()` — ligne 54

N'appelle aucune fonction du projet.

Appelée par : `chargerListeSets`

### `oublieCartesSets()` — ligne 63

N'appelle aucune fonction du projet.

Appelée par : `chargerListeSets`

### `chargerListeSets()` — ligne 69

Appelle : `majFenetreFiltres()` *(fenFiltres.js)*, `oublieCartesSets()` *(sets.js)*, `reprendreSets()` *(sets.js)*, `sauverSets()` *(sets.js)*, `setsARevoir()` *(sets.js)*, → `setRetenu()` *(sets.js)*

Appelée par : `openFiltresModal`

### `noteSetIndex()` — ligne 108

Appelle : `norm()` *(cartes.js)*

Appelée par : `chargerSetScryfall`

### `chargerSetScryfall()` — ligne 120

Appelle : `frontFace()` *(cartes.js)*, `majFenetreFiltres()` *(fenFiltres.js)*, `majResumeFiltres()` *(fenFiltres.js)*, `noteSetIndex()` *(sets.js)*, `renderAllSiApplique()` *(brouillon.js)*, `sauverSets()` *(sets.js)*

Appelée par : `gestesVue`

## js/gameChangers.js

### `reprendreGameChangers()` — ligne 14

Appelle : `idbLire()` *(idb.js)*

Appelée par : `chargerGameChangers`, `demarrer`

### `sauverGameChangers()` — ligne 27

Appelle : `idbEcrire()` *(idb.js)*

Appelée par : `chargerGameChangers`

### `gameChangersARevoir()` — ligne 31

N'appelle aucune fonction du projet.

Appelée par : `chargerGameChangers`, `demarrer`

### `chargerGameChangers()` — ligne 35

Appelle : `frontFace()` *(cartes.js)*, `gameChangersARevoir()` *(gameChangers.js)*, `norm()` *(cartes.js)*, `renderAll()` *(rendu.js)*, `reprendreGameChangers()` *(gameChangers.js)*, `sauverGameChangers()` *(gameChangers.js)*

Appelée par : `demarrer`

## js/archive.js

### `compacte()` — ligne 10

Appelle : `codeLegalite()` *(retenue.js)*

Appelée par : `lireCatalogueFichier`

### `autoCatalogue()` — ligne 44

N'appelle aucune fonction du projet.

Appelée par : `demarrerCatalogue`

### `estGzip()` — ligne 58

N'appelle aucune fonction du projet.

Appelée par : `fluxTexte`

### `compteurOctets()` — ligne 65

N'appelle aucune fonction du projet.

Appelée par : `fluxTexte`

### `nouveauSuivi()` — ligne 80

Appelle : `majBoiteCatalogue()` *(boiteCatalogue.js)*

Appelée par : `brancherCatalogue`, `telechargerCatalogue`

### `fluxTexte()` — ligne 97

Appelle : `compteurOctets()` *(archive.js)*, `estGzip()` *(archive.js)*

Appelée par : `lireCatalogueFichier`

### `fusionneSets()` — ligne 120

N'appelle aucune fonction du projet.

Appelée par : `retiens`

### `retiens()` — ligne 133

Appelle : `fusionneSets()` *(archive.js)*, `norm()` *(cartes.js)*

Appelée par : `lireCatalogueFichier`

### `tailleEstimee()` — ligne 144

N'appelle aucune fonction du projet.

Appelée par : `chargerCatalogueComplet`, `lireCatalogueFichier`

### `ArchiveAbandonnee()` — ligne 154

N'appelle aucune fonction du projet.

Appelée par : `lireCatalogueFichier`

### `lireCatalogueFichier()` — ligne 156

Appelle : `ArchiveAbandonnee()` *(archive.js)*, `appliqueCatalogueAuxCartes()` *(candidats.js)*, `compacte()` *(archive.js)*, `fluxTexte()` *(archive.js)*, `idbEcrire()` *(idb.js)*, `invaliderCandidats()` *(candidats.js)*, `recalculerAvecProgression()` *(recalcul.js)*, `renderSuggestions()` *(suggestions.js)*, `retiens()` *(archive.js)*, `tailleEstimee()` *(archive.js)*, `toast()` *(outils.js)*

Appelée par : `brancherCatalogue`, `chargerCatalogueLocal`, `telechargerCatalogue`

## js/catalogue.js

### `chargerCatalogueLocal()` — ligne 11

Appelle : `lireCatalogueFichier()` *(archive.js)*

Appelée par : `chargerCatalogueComplet`

### `verifierMajCatalogue()` — ligne 24

Appelle : `renderSuggestions()` *(suggestions.js)*

Appelée par : `demarrerCatalogue`, `majCatalogue`, `telechargerCatalogue`

### `catalogueObsolete()` — ligne 39

N'appelle aucune fonction du projet.

Appelée par : `blocCatalogue`, `demarrerCatalogue`, `ligneCatalogue`, `majCatalogue`

### `majPrix()` — ligne 45

Appelle : `annexeListe()` *(annexes.js)*, `find()` *(cartes.js)*, `renderAll()` *(rendu.js)*, `scryTarget()` *(scryfallApplique.js)*, `toast()` *(outils.js)*

Appelée par : `majCatalogue`

### `telechargerCatalogue()` — ligne 77

Appelle : `fermerBoiteCatalogue()` *(boiteCatalogue.js)*, `lireCatalogueFichier()` *(archive.js)*, `nouveauSuivi()` *(archive.js)*, `ouvrirBoiteCatalogue()` *(boiteCatalogue.js)*, `rafraichirFenetreSauvegarde()` *(fenSauvegarde.js)*, `renderSuggestions()` *(suggestions.js)*, `toast()` *(outils.js)*, `verifierMajCatalogue()` *(catalogue.js)*

Appelée par : `chargerCatalogueComplet`, `gestesDonnees`, `majCatalogue`

### `interrompreCatalogue()` — ligne 136

N'appelle aucune fonction du projet.

Appelée par : `gestesReglages`

### `chargerCatalogueComplet()` — ligne 141

Appelle : `appliqueCatalogueAuxCartes()` *(candidats.js)*, `chargerCatalogueLocal()` *(catalogue.js)*, `idbLire()` *(idb.js)*, `invaliderCandidats()` *(candidats.js)*, `recalculerAvecProgression()` *(recalcul.js)*, `renderSuggestions()` *(suggestions.js)*, `tailleEstimee()` *(archive.js)*, `telechargerCatalogue()` *(catalogue.js)*

Appelée par : `brancherCatalogue`, `demarrerCatalogue`

### `demarrerCatalogue()` — ligne 183

Appelle : `autoCatalogue()` *(archive.js)*, `catalogueAbsent()` *(catalogueEtat.js)*, `catalogueObsolete()` *(catalogue.js)*, `chargerCatalogueComplet()` *(catalogue.js)*, `proposerMajCatalogue()` *(catalogue.js)*, `verifierMajCatalogue()` *(catalogue.js)*

Appelée par : `demarrer`

### `proposerMajCatalogue()` — ligne 195

Appelle : `esc()` *(outils.js)*, `openDialog()` *(dialogue.js)*

Appelée par : `demarrerCatalogue`

### `majCatalogue()` — ligne 212

Appelle : `catalogueAbsent()` *(catalogueEtat.js)*, `catalogueObsolete()` *(catalogue.js)*, `majPrix()` *(catalogue.js)*, `rafraichirFenetreSauvegarde()` *(fenSauvegarde.js)*, `renderAll()` *(rendu.js)*, `telechargerCatalogue()` *(catalogue.js)*, `toast()` *(outils.js)*, `verifierMajCatalogue()` *(catalogue.js)*

Appelée par : `gestesDonnees`

## js/candidats.js

### `completeDepuisRec()` — ligne 11

Appelle : `majTexteOracle()` *(cartes.js)*, `noterLegalArchive()` *(candidats.js)*, `noterSetsArchive()` *(candidats.js)*, `reanalyser()` *(categories.js)*

Appelée par : `appliqueCatalogueAuxCartes`, `carteDuCatalogue`

### `noterLegalArchive()` — ligne 42

N'appelle aucune fonction du projet.

Appelée par : `appliqueCatalogueAuxCartes`, `carteDuCatalogue`, `completeDepuisRec`

### `noterSetsArchive()` — ligne 49

N'appelle aucune fonction du projet.

Appelée par : `appliqueCatalogueAuxCartes`, `completeDepuisRec`

### `carteDuCatalogue()` — ligne 54

Appelle : `buildCard()` *(cartes.js)*, `completeDepuisRec()` *(candidats.js)*, `find()` *(cartes.js)*, `noterLegalArchive()` *(candidats.js)*, `reanalyser()` *(categories.js)*, `registerCard()` *(cartes.js)*

Appelée par : `candidatsCatalogue`, `prechauffeCandidats`

### `invaliderCandidats()` — ligne 82

N'appelle aucune fonction du projet.

Appelée par : `app.js (chargement)`, `apresReglage`, `brancherCatalogue`, `chargerCatalogueComplet`, `gestesDeck`, `gestesDonnees`, `gestesGraphe`, `gestesVue`, `lireCatalogueFichier`, `verseBrouillon`

### `signatureCandidats()` — ligne 86

Appelle : `noeudsActifs()` *(catalogueEtat.js)*

Appelée par : `candidatsCatalogue`, `prechauffeCandidats`, `recalculLong`, `signatureSuggestions`

### `appliqueCatalogueAuxCartes()` — ligne 96

Appelle : `annexeListe()` *(annexes.js)*, `completeDepuisRec()` *(candidats.js)*, `find()` *(cartes.js)*, `norm()` *(cartes.js)*, `noterLegalArchive()` *(candidats.js)*, `noterSetsArchive()` *(candidats.js)*, `scheduleSave()` *(stockage.js)*

Appelée par : `chargerCatalogueComplet`, `lireCatalogueFichier`

### `selectionCandidats()` — ligne 126

Appelle : `colorOK()` *(collection.js)*, `filtreOKRec()` *(retenue.js)*, `find()` *(cartes.js)*, `fmt()` *(outils.js)*, `noeudsActifs()` *(catalogueEtat.js)*, `recToucheNoeuds()` *(catalogueEtat.js)*

Appelée par : `candidatsCatalogue`, `prechauffeCandidats`

### `candidatsCatalogue()` — ligne 164

Appelle : `selectionCandidats()` *(candidats.js)*, `signatureCandidats()` *(candidats.js)*, → `carteDuCatalogue()` *(candidats.js)*

Appelée par : `statsCandidats`, `vivierSuggestions`

### `prechauffeCandidats()` — ligne 177

Appelle : `carteDuCatalogue()` *(candidats.js)*, `selectionCandidats()` *(candidats.js)*, `signatureCandidats()` *(candidats.js)*

Appelée par : `filtrerAvecProgression`, `recalculerAvecProgression`

### `statsCandidats()` — ligne 200

Appelle : `candidatsCatalogue()` *(candidats.js)*

Appelée par : `ligneCatalogue`

### `requeteCatalogue()` — ligne 206

Appelle : `find()` *(cartes.js)*, `fmt()` *(outils.js)*

Appelée par : `chargerCatalogue`, `signatureCatalogue`

### `signatureCatalogue()` — ligne 215

Appelle : `requeteCatalogue()` *(candidats.js)*

Appelée par : `chargerCatalogue`

### `chargerCatalogue()` — ligne 217

Appelle : `applyScryfall()` *(scryfallApplique.js)*, `find()` *(cartes.js)*, `renderAll()` *(rendu.js)*, `renderSuggestions()` *(suggestions.js)*, `requeteCatalogue()` *(candidats.js)*, `signatureCatalogue()` *(candidats.js)*

Appelée par : `gestesDonnees`

## js/graphe.js

### `graphCards()` — ligne 5

Appelle : `collectionCards()` *(collection.js)*, `currentSuggestions()` *(vivier.js)*, `deckEntries()` *(deck.js)*, `filtered()` *(collection.js)*

Appelée par : `renderD`

### `buildGraph()` — ligne 12

N'appelle aucune fonction du projet.

Appelée par : `renderD`

### `svgGraph()` — ligne 27

Appelle : `esc()` *(outils.js)*

Appelée par : `renderD`

### `renderD()` — ligne 98

Appelle : `buildGraph()` *(graphe.js)*, `carteTouche()` *(catalogueEtat.js)*, `esc()` *(outils.js)*, `graphCards()` *(graphe.js)*, `noeudsActifs()` *(catalogueEtat.js)*, `refCarte()` *(outils.js)*, `svgGraph()` *(graphe.js)*

Appelée par : `gestesGraphe`, `gestesVue`, `renderAll`

## js/stats.js

### `statsOf()` — ligne 5

Appelle : `mainType()` *(cartes.js)*

Appelée par : `renderC`

### `histogram()` — ligne 27

N'appelle aucune fonction du projet.

Appelée par : `renderC`, `renderE`

### `renderC()` — ligne 48

Appelle : `collectionCards()` *(collection.js)*, `eur()` *(outils.js)*, `filtered()` *(collection.js)*, `fmt()` *(outils.js)*, `histogram()` *(stats.js)*, `statsOf()` *(stats.js)*, `symIcon()` *(symboles.js)*

Appelée par : `renderAll`

## js/notation.js

### `contexteEvaluation()` — ligne 11

Appelle : `cartesDuDeck()` *(deck.js)*, `deckCounts()` *(legalite.js)*, `feedsDe()` *(synergies.js)*, `find()` *(cartes.js)*, `fmt()` *(outils.js)*, `targets()` *(legalite.js)*

Appelée par : `evalueDeck`, `notesCollection`, `vivierSuggestions`

### `noteCarte()` — ligne 67

Appelle : `carteTouche()` *(catalogueEtat.js)*, `classeLiens()` *(liens.js)*, `compat()` *(effets.js)*, `deckSize()` *(deck.js)*, `edhrecAllFor()` *(edhrec.js)*, `edhrecFor()` *(edhrec.js)*, `eur()` *(outils.js)*, `feedsDe()` *(synergies.js)*, `libelleFamillesLarges()` *(liens.js)*, `libelleQual()` *(effets.js)*, `noeudsActifs()` *(catalogueEtat.js)*, `norm()` *(cartes.js)*, `primeLiensLarges()` *(liens.js)*

Appelée par : `evalueDeck`, `noterVivier`, `notesCollection`

### `nbInteractions()` — ligne 221

Appelle : `norm()` *(cartes.js)*

Appelée par : `cardTile`, `sugRow`

### `nbCartesLarges()` — ligne 229

N'appelle aucune fonction du projet.

Appelée par : `cardTile`, `sugRow`

### `nbLiens()` — ligne 235

N'appelle aucune fonction du projet.

Appelée par : `cardTile`, `sugRow`

## js/vivier.js

### `vivierSuggestions()` — ligne 18

Appelle : `availableFor()` *(deck.js)*, `bestOffer()` *(marche.js)*, `candidatsCatalogue()` *(candidats.js)*, `carteTouche()` *(catalogueEtat.js)*, `colorOK()` *(collection.js)*, `contexteEvaluation()` *(notation.js)*, `filtered()` *(collection.js)*, `find()` *(cartes.js)*, `noeudsActifs()` *(catalogueEtat.js)*, `spent()` *(outils.js)*

Appelée par : `currentSuggestions`, `prepareSuggestions`

### `noterVivier()` — ligne 84

Appelle : `noteCarte()` *(notation.js)*

Appelée par : `currentSuggestions`, `prepareSuggestions`

### `ordonneSuggestions()` — ligne 92

Appelle : `carteRetenue()` *(retenue.js)*

Appelée par : `currentSuggestions`, `prepareSuggestions`

### `empreinteCollection()` — ligne 115

N'appelle aucune fonction du projet.

Appelée par : `signatureSuggestions`

### `tailleDe()` — ligne 121

N'appelle aucune fonction du projet.

Appelée par : `signatureSuggestions`

### `signatureSuggestions()` — ligne 126

Appelle : `deckSignature()` *(deck.js)*, `empreinteCollection()` *(vivier.js)*, `signatureCandidats()` *(candidats.js)*, `tailleDe()` *(vivier.js)*

Appelée par : `currentSuggestions`, `notesCollection`, `notesCollectionAJour`, `prepareSuggestions`, `suggestionsAJour`

### `suggestionsAJour()` — ligne 156

Appelle : `signatureSuggestions()` *(vivier.js)*

Appelée par : `currentSuggestions`, `filetSuggestions`, `prepareSuggestions`, `recalculLong`

### `currentSuggestions()` — ligne 160

Appelle : `noterVivier()` *(vivier.js)*, `ordonneSuggestions()` *(vivier.js)*, `signatureSuggestions()` *(vivier.js)*, `suggestionsAJour()` *(vivier.js)*, `vivierSuggestions()` *(vivier.js)*

Appelée par : `classementDecale`, `gestesReglages`, `graphCards`, `suggestionsAffichees`

### `prepareSuggestions()` — ligne 175

Appelle : `noterVivier()` *(vivier.js)*, `ordonneSuggestions()` *(vivier.js)*, `signatureSuggestions()` *(vivier.js)*, `suggestionsAJour()` *(vivier.js)*, `vivierSuggestions()` *(vivier.js)*

Appelée par : `filtrerAvecProgression`, `recalculerAvecProgression`

## js/sugOrdre.js

### `geleSuggestions()` — ligne 33

Appelle : `ordreGele()` *(sugOrdre.js)*

Appelée par : `gestesDeck`, `recalculerAvecProgression`

### `ordreGele()` — ligne 41

N'appelle aucune fonction du projet.

Appelée par : `classementDecale`, `geleSuggestions`, `suggestionsAffichees`

### `degeleSuggestions()` — ligne 45

N'appelle aucune fonction du projet.

Appelée par : `apresReglage`, `gestesDeck`

### `suggestionsAffichees()` — ligne 51

Appelle : `currentSuggestions()` *(vivier.js)*, `ordreGele()` *(sugOrdre.js)*

Appelée par : `classementDecale`, `selectionSuggestions`

### `classementDecale()` — ligne 64

Appelle : `currentSuggestions()` *(vivier.js)*, `ordreGele()` *(sugOrdre.js)*, `suggestionsAffichees()` *(sugOrdre.js)*

Appelée par : `bandeauReclassement`

### `bandeauReclassement()` — ligne 73

Appelle : `classementDecale()` *(sugOrdre.js)*

Appelée par : `listeSuggestions`

## js/sugCommandants.js

### `lienDecksEdhrec()` — ligne 23

Appelle : `edhrecSlug()` *(edhrec.js)*, `esc()` *(outils.js)*

Appelée par : `ligneCommandant`

### `ligneCommandant()` — ligne 42

Appelle : `esc()` *(outils.js)*, `lienDecksEdhrec()` *(sugCommandants.js)*

Appelée par : `blocCommandants`

### `blocCommandants()` — ligne 59

Appelle : `ligneCommandant()` *(sugCommandants.js)*

Appelée par : `panneauEdhrec`

### `panneauEdhrec()` — ligne 83

Appelle : `blocCommandants()` *(sugCommandants.js)*, `commandantsPrincipaux()` *(cartes.js)*, `commandantsSecondaires()` *(cartes.js)*, `commandantsSecondairesPossibles()` *(cartes.js)*, `edhrecSlug()` *(edhrec.js)*, `esc()` *(outils.js)*, `find()` *(cartes.js)*, `fmt()` *(outils.js)*

Appelée par : `renderH`

## js/sugListes.js

### `selectionSuggestions()` — ligne 22

Appelle : `suggestionsAffichees()` *(sugOrdre.js)*

Appelée par : `gestesReglages`, `renderF`, `renderG`, `renderH`, `renderSuggestions`

### `paginationListe()` — ligne 41

Appelle : `esc()` *(outils.js)*

Appelée par : `blocGraphe`, `corpsEdhrec`

### `renvoiCatalogue()` — ligne 53

N'appelle aucune fonction du projet.

Appelée par : `blocEdhrec`, `blocGraphe`

### `blocGraphe()` — ligne 61

Appelle : `esc()` *(outils.js)*, `noeudsActifs()` *(catalogueEtat.js)*, `paginationListe()` *(sugListes.js)*, `renvoiCatalogue()` *(sugListes.js)*, `sugRow()` *(tuiles.js)*, `visuelsSuggestions()` *(sugListes.js)*

Appelée par : `renderG`

### `cleLimiteEdhrec()` — ligne 88

N'appelle aucune fonction du projet.

Appelée par : `corpsEdhrec`, `gestesReglages`

### `corpsEdhrec()` — ligne 95

Appelle : `cleLimiteEdhrec()` *(sugListes.js)*, `paginationListe()` *(sugListes.js)*, `sugRow()` *(tuiles.js)*

Appelée par : `blocEdhrec`, `visuelsEdhrec`

### `visuelsEdhrec()` — ligne 105

Appelle : `corpsEdhrec()` *(sugListes.js)*, `groupePlie()` *(barreGroupes.js)*, `visuelsSuggestions()` *(sugListes.js)*

Appelée par : `blocEdhrec`

### `blocEdhrec()` — ligne 122

Appelle : `barreGroupeTri()` *(barreGroupes.js)*, `commandantsSecondaires()` *(cartes.js)*, `corpsEdhrec()` *(sugListes.js)*, `enveloppeGroupe()` *(barreGroupes.js)*, `esc()` *(outils.js)*, `eur()` *(outils.js)*, `fmt()` *(outils.js)*, `groupeCartes()` *(groupes.js)*, `noteMultiple()` *(barreGroupes.js)*, `renvoiCatalogue()` *(sugListes.js)*, `visuelsEdhrec()` *(sugListes.js)*

Appelée par : `renderH`

### `listeSuggestions()` — ligne 179

Appelle : `bandeauReclassement()` *(sugOrdre.js)*, `barreGroupeTri()` *(barreGroupes.js)*, `enveloppeGroupe()` *(barreGroupes.js)*, `esc()` *(outils.js)*, `groupeCartes()` *(groupes.js)*, `menuColonnes()` *(barreGroupes.js)*, `noteMultiple()` *(barreGroupes.js)*, `ouvreGrille()` *(barreGroupes.js)*, `sugRow()` *(tuiles.js)*, `visuelsCatalogue()` *(sugListes.js)*

Appelée par : `renderF`

### `visuelsSuggestions()` — ligne 228

Appelle : `queueScryfall()` *(scryfall.js)*, → `chargeVisuelsClasses()` *(suggestions.js)*

Appelée par : `blocGraphe`, `visuelsCatalogue`, `visuelsEdhrec`

### `visuelsCatalogue()` — ligne 237

Appelle : `groupePlie()` *(barreGroupes.js)*, `visuelsSuggestions()` *(sugListes.js)*

Appelée par : `listeSuggestions`

## js/suggestions.js

### `ligneCatalogue()` — ligne 10

Appelle : `bestOffer()` *(marche.js)*, `catalogueObsolete()` *(catalogue.js)*, `colorOK()` *(collection.js)*, `esc()` *(outils.js)*, `eur()` *(outils.js)*, `fmt()` *(outils.js)*, `noeudsActifs()` *(catalogueEtat.js)*, `spent()` *(outils.js)*, `statsCandidats()` *(candidats.js)*

Appelée par : `renderF`

### `ligneBudget()` — ligne 87

Appelle : `eur()` *(outils.js)*, `spent()` *(outils.js)*

Appelée par : `corpsBudget`, `majResumeBudget`

### `ligneAchats()` — ligne 94

Appelle : `aAcheter()` *(outils.js)*, `cmLink()` *(marche.js)*, `esc()` *(outils.js)*, `eur()` *(outils.js)*

Appelée par : `corpsBudget`, `majResumeBudget`

### `chargeVisuelsClasses()` — ligne 112

N'appelle aucune fonction du projet.

Appelée par : `visuelsSuggestions`

### `majHint()` — ligne 140

N'appelle aucune fonction du projet.

Appelée par : `renderF`, `renderG`, `renderH`

### `poseCorps()` — ligne 151

N'appelle aucune fonction du projet.

Appelée par : `renderF`, `renderG`, `renderH`

### `filetSuggestions()` — ligne 169

Appelle : `recalculLong()` *(recalcul.js)*, `recalculerAvecProgression()` *(recalcul.js)*, `suggestionsAJour()` *(vivier.js)*

Appelée par : `renderF`, `renderG`, `renderH`, `renderSuggestions`

### `renderSuggestions()` — ligne 181

Appelle : `filetSuggestions()` *(suggestions.js)*, `lanceEdhrecSiBesoin()` *(suggestions.js)*, `renderF()` *(suggestions.js)*, `renderG()` *(suggestions.js)*, `renderH()` *(suggestions.js)*, `selectionSuggestions()` *(sugListes.js)*

Appelée par : `brancherCatalogue`, `chargerCatalogue`, `chargerCatalogueComplet`, `gestesDeck`, `gestesGraphe`, `lireCatalogueFichier`, `loadEdhrec`, `refreshSuggestions`, `renderAll`, `telechargerCatalogue`, `verifierMajCatalogue`

### `renderG()` — ligne 193

Appelle : `blocGraphe()` *(sugListes.js)*, `filetSuggestions()` *(suggestions.js)*, `majHint()` *(suggestions.js)*, `noeudsActifs()` *(catalogueEtat.js)*, `poseCorps()` *(suggestions.js)*, `selectionSuggestions()` *(sugListes.js)*

Appelée par : `renderSuggestions`

### `renderH()` — ligne 205

Appelle : `blocEdhrec()` *(sugListes.js)*, `filetSuggestions()` *(suggestions.js)*, `fmt()` *(outils.js)*, `lanceEdhrecSiBesoin()` *(suggestions.js)*, `majHint()` *(suggestions.js)*, `panneauEdhrec()` *(sugCommandants.js)*, `poseCorps()` *(suggestions.js)*, `selectionSuggestions()` *(sugListes.js)*

Appelée par : `renderSuggestions`

### `renderF()` — ligne 218

Appelle : `filetSuggestions()` *(suggestions.js)*, `ligneCatalogue()` *(suggestions.js)*, `listeSuggestions()` *(sugListes.js)*, `majHint()` *(suggestions.js)*, `poseCorps()` *(suggestions.js)*, `selectionSuggestions()` *(sugListes.js)*

Appelée par : `renderSuggestions`

### `refreshSuggestions()` — ligne 228

Appelle : `renderSuggestions()` *(suggestions.js)*, `renderTop()` *(entete.js)*

Appelée par : `app.js (chargement)`, `gestesReglages`

### `lanceEdhrecSiBesoin()` — ligne 235

Appelle : `commandantsSecondaires()` *(cartes.js)*, `fmt()` *(outils.js)*, `loadEdhrec()` *(edhrec.js)*, `signatureCommandants()` *(edhrec.js)*

Appelée par : `renderH`, `renderSuggestions`

## js/collection.js

### `colorOK()` — ligne 10

N'appelle aucune fonction du projet.

Appelée par : `carteFiltree`, `causesCollection`, `chercheCartes`, `chercheScryfall`, `ligneCatalogue`, `selectionCandidats`, `vivierSuggestions`

### `collectionCards()` — ligne 23

Appelle : `find()` *(cartes.js)*

Appelée par : `brancherRestauration`, `causesCollection`, `corpsCollectionParam`, `filtered`, `graphCards`, `renderB`, `renderC`, `resumeFiltres`

### `filtered()` — ligne 32

Appelle : `carteRetenue()` *(retenue.js)*, `collectionCards()` *(collection.js)*, `fmt()` *(outils.js)*, `notesCollection()` *(groupes.js)*

Appelée par : `ficheHTML`, `graphCards`, `renderB`, `renderC`, `resumeFiltres`, `vivierSuggestions`

### `causesCollection()` — ligne 50

Appelle : `collectionCards()` *(collection.js)*, `colorOK()` *(collection.js)*, `filtreOK()` *(retenue.js)*, `legaliteOK()` *(retenue.js)*, `roleOK()` *(filtres.js)*

Appelée par : `ligneCausesCollection`

### `ligneCausesCollection()` — ligne 63

Appelle : `causesCollection()` *(collection.js)*, `esc()` *(outils.js)*, `filtresActifs()` *(filtres.js)*, `fmt()` *(outils.js)*, `nomCombinaisonCouleurs()` *(couleurs.js)*, `texteFiltresActifs()` *(filtres.js)*

Appelée par : `renderB`

### `renderB()` — ligne 73

Appelle : `cardRow()` *(tuiles.js)*, `cardTile()` *(tuiles.js)*, `collectionCards()` *(collection.js)*, `esc()` *(outils.js)*, `filtered()` *(collection.js)*, `filtresActifs()` *(filtres.js)*, `groupeCartes()` *(groupes.js)*, `groupePlie()` *(barreGroupes.js)*, `ligneCausesCollection()` *(collection.js)*, `noteMultiple()` *(barreGroupes.js)*, `ouvreGrille()` *(barreGroupes.js)*, `queueScryfall()` *(scryfall.js)*, `rendGroupes()` *(barreGroupes.js)*, `renderTop()` *(entete.js)*, `resumeAffichage()` *(fenAffichage.js)*

Appelée par : `app.js (chargement)`, `appliquerAffichage`, `gestesDeck`, `gestesGraphe`, `gestesVue`, `renderAll`, `runScryQueue`

## js/fenImport.js

### `retireExtrait()` — ligne 24

N'appelle aucune fonction du projet.

Appelée par : `extraitEdition`

### `extraitEdition()` — ligne 28

Appelle : `retireExtrait()` *(fenImport.js)*

Appelée par : `parseMtgoList`

### `parseMtgoList()` — ligne 44

Appelle : `extraitEdition()` *(fenImport.js)*, `norm()` *(cartes.js)*

Appelée par : `openImport`

### `openImport()` — ligne 92

Appelle : `annexeListe()` *(annexes.js)*, `buildCard()` *(cartes.js)*, `closeDialog()` *(dialogue.js)*, `completeUnknown()` *(scryfall.js)*, `deckAdd()` *(deck.js)*, `deckEntries()` *(deck.js)*, `eur()` *(outils.js)*, `find()` *(cartes.js)*, `fmt()` *(outils.js)*, `noterImpression()` *(impressions.js)*, `openDialog()` *(dialogue.js)*, `parseMtgoList()` *(fenImport.js)*, `recalculerAvecProgression()` *(recalcul.js)*, `registerCard()` *(cartes.js)*, `spent()` *(outils.js)*, `toast()` *(outils.js)*

Appelée par : `gestesDonnees`

## js/fenAjout.js

### `ajouterCarte()` — ligne 9

Appelle : `deckAdd()` *(deck.js)*, `fmt()` *(outils.js)*, `recalculerAvecProgression()` *(recalcul.js)*, `toast()` *(outils.js)*, `versAnnexe()` *(annexes.js)*

Appelée par : `gestesGraphe`

### `chercheCartes()` — ligne 25

Appelle : `carteTouche()` *(catalogueEtat.js)*, `colorOK()` *(collection.js)*, `getCardOrAnalyzedRec()` *(catalogueEtat.js)*, `noeudsActifs()` *(catalogueEtat.js)*, `norm()` *(cartes.js)*, `recToucheNoeuds()` *(catalogueEtat.js)*

Appelée par : `resultatsHTML`

### `resultatsHTML()` — ligne 61

Appelle : `chercheCartes()` *(fenAjout.js)*, `esc()` *(outils.js)*, `find()` *(cartes.js)*, `noeudsActifs()` *(catalogueEtat.js)*, `norm()` *(cartes.js)*

Appelée par : `majResultats`, `openAdd`

### `majResultats()` — ligne 96

Appelle : `chercheScryfall()` *(recherches.js)*, `norm()` *(cartes.js)*, `resultatsHTML()` *(fenAjout.js)*

Appelée par : `app.js (chargement)`, `chercheScryfall`, `gestesGraphe`

### `openAdd()` — ligne 107

Appelle : `esc()` *(outils.js)*, `openDialog()` *(dialogue.js)*, `resultatsHTML()` *(fenAjout.js)*

Appelée par : `gestesDonnees`

## js/annexes.js

### `annexeListe()` — ligne 10

N'appelle aucune fonction du projet.

Appelée par : `annexeDe`, `annexeEntries`, `annexeSize`, `appliqueCatalogueAuxCartes`, `deckAdd`, `deplacerCarte`, `ficheHTML`, `gestesDonnees`, `majPrix`, `mergeInto`, `openImport`, `openWipeModal`, `renameCard`, `retirerAnnexe`, `tagAnnexe`, `versAnnexe`, `viderAnnexe`

### `annexeEntries()` — ligne 16

Appelle : `annexeListe()` *(annexes.js)*, `find()` *(cartes.js)*, `mainType()` *(cartes.js)*

Appelée par : `blocAnnexe`, `exportDeckModal`, `renderE`

### `annexeSize()` — ligne 25

Appelle : `annexeListe()` *(annexes.js)*

Appelée par : `gestesDeck`, `renderE`

### `annexeDe()` — ligne 32

Appelle : `annexeListe()` *(annexes.js)*

Appelée par : `addToDeck`, `deckAdd`, `deplacerCarte`, `ficheHTML`, `openCardModal`, `snapshot`, `tagAnnexe`, `versAnnexe`

### `deplacerCarte()` — ligne 40

Appelle : `annexeDe()` *(annexes.js)*, `annexeListe()` *(annexes.js)*, `find()` *(cartes.js)*, `fmt()` *(outils.js)*, `toast()` *(outils.js)*

Appelée par : `addToDeck`, `versAnnexe`

### `versAnnexe()` — ligne 72

Appelle : `annexeDe()` *(annexes.js)*, `annexeListe()` *(annexes.js)*, `deplacerCarte()` *(annexes.js)*, `find()` *(cartes.js)*, `recalculerAvecProgression()` *(recalcul.js)*, `toast()` *(outils.js)*

Appelée par : `ajouterCarte`, `gestesDeck`

### `retirerAnnexe()` — ligne 97

Appelle : `annexeListe()` *(annexes.js)*, `recalculerAvecProgression()` *(recalcul.js)*

Appelée par : `gestesDeck`

### `viderAnnexe()` — ligne 103

Appelle : `annexeListe()` *(annexes.js)*, `recalculerAvecProgression()` *(recalcul.js)*, `toast()` *(outils.js)*

Appelée par : `gestesDeck`

### `tagAnnexe()` — ligne 111

Appelle : `annexeDe()` *(annexes.js)*, `annexeListe()` *(annexes.js)*, `esc()` *(outils.js)*

Appelée par : `cardTile`, `sugRow`

## js/deck.js

### `deckEntries()` — ligne 10

Appelle : `find()` *(cartes.js)*, `mainType()` *(cartes.js)*

Appelée par : `cartesDuDeck`, `commandantsPossibles`, `commandantsSecondairesPossibles`, `deckCounts`, `deckSignature`, `exportDeckModal`, `ficheHTML`, `gameChangersDuDeck`, `graphCards`, `legality`, `openImport`, `renderE`, `zoneCommandant`

### `deckSignature()` — ligne 21

Appelle : `deckEntries()` *(deck.js)*

Appelée par : `signatureSuggestions`

### `cartesDuDeck()` — ligne 30

Appelle : `deckEntries()` *(deck.js)*

Appelée par : `contexteEvaluation`, `ficheHTML`

### `deckSize()` — ligne 34

N'appelle aucune fonction du projet.

Appelée par : `brancherRestauration`, `exportDeckModal`, `legality`, `noteCarte`, `renderE`

### `availableFor()` — ligne 40

N'appelle aucune fonction du projet.

Appelée par : `addToDeck`, `cardRow`, `cardTile`, `deckAdd`, `ficheHTML`, `openCardModal`, `vivierSuggestions`

### `addToDeck()` — ligne 44

Appelle : `annexeDe()` *(annexes.js)*, `availableFor()` *(deck.js)*, `cmEstimate()` *(marche.js)*, `deplacerCarte()` *(annexes.js)*, `eur()` *(outils.js)*, `find()` *(cartes.js)*, `fmt()` *(outils.js)*, `recalculerAvecProgression()` *(recalcul.js)*, `toast()` *(outils.js)*

Appelée par : `gestesDeck`

### `deckAdd()` — ligne 70

Appelle : `annexeDe()` *(annexes.js)*, `annexeListe()` *(annexes.js)*, `availableFor()` *(deck.js)*, `fmt()` *(outils.js)*

Appelée par : `ajouterCarte`, `buyCard`, `openImport`

### `removeFromDeck()` — ligne 92

Appelle : `recalculerAvecProgression()` *(recalcul.js)*

Appelée par : `gestesDeck`

### `buyCard()` — ligne 101

Appelle : `bestOffer()` *(marche.js)*, `deckAdd()` *(deck.js)*, `eur()` *(outils.js)*, `find()` *(cartes.js)*, `recalculerAvecProgression()` *(recalcul.js)*, `spent()` *(outils.js)*, `toast()` *(outils.js)*

Appelée par : `gestesDeck`

## js/legalite.js

### `gameChangersDuDeck()` — ligne 15

Appelle : `deckEntries()` *(deck.js)*, `estGameChanger()` *(retenue.js)*

Appelée par : `ligneGameChangers`, `renderE`

### `ligneGameChangers()` — ligne 20

Appelle : `esc()` *(outils.js)*, `fmt()` *(outils.js)*, `gameChangersConnus()` *(retenue.js)*, `gameChangersDuDeck()` *(legalite.js)*

Appelée par : `renderE`

### `targets()` — ligne 32

Appelle : `fmt()` *(outils.js)*

Appelée par : `contexteEvaluation`, `corpsFiltres`, `deckCounts`, `ficheHTML`, `renderE`

### `deckCounts()` — ligne 42

Appelle : `deckEntries()` *(deck.js)*, `targets()` *(legalite.js)*

Appelée par : `contexteEvaluation`, `ficheHTML`, `renderE`

### `gauge()` — ligne 49

Appelle : `esc()` *(outils.js)*, `rolesFiltre()` *(filtres.js)*

Appelée par : `renderE`

### `legality()` — ligne 60

Appelle : `carteLegale()` *(retenue.js)*, `deckEntries()` *(deck.js)*, `deckSize()` *(deck.js)*, `eur()` *(outils.js)*, `find()` *(cartes.js)*, `fmt()` *(outils.js)*, `spent()` *(outils.js)*

Appelée par : `renderE`

## js/deckSection.js

### `blocAchats()` — ligne 10

Appelle : `aAcheter()` *(outils.js)*, `cmLink()` *(marche.js)*, `esc()` *(outils.js)*, `eur()` *(outils.js)*, `stripeColor()` *(symboles.js)*

Appelée par : `renderE`

### `zoneCommandant()` — ligne 40

Appelle : `commandantsPossibles()` *(cartes.js)*, `deckEntries()` *(deck.js)*, `esc()` *(outils.js)*, `find()` *(cartes.js)*, `symIcon()` *(symboles.js)*

Appelée par : `renderE`

### `evalueDeck()` — ligne 83

Appelle : `contexteEvaluation()` *(notation.js)*, `noteCarte()` *(notation.js)*

Appelée par : `renderE`

### `partieDeck()` — ligne 103

N'appelle aucune fonction du projet.

Appelée par : `blocAnnexe`, `renderE`

### `blocAnnexe()` — ligne 119

Appelle : `annexeEntries()` *(annexes.js)*, `cardRow()` *(tuiles.js)*, `cardTile()` *(tuiles.js)*, `carteFiltree()` *(filtres.js)*, `esc()` *(outils.js)*, `eur()` *(outils.js)*, `groupeCartes()` *(groupes.js)*, `partieDeck()` *(deckSection.js)*, `rendGroupes()` *(barreGroupes.js)*

Appelée par : `renderE`

### `renderE()` — ligne 145

Appelle : `aAcheter()` *(outils.js)*, `annexeSize()` *(annexes.js)*, `barreGroupeTri()` *(barreGroupes.js)*, `blocAchats()` *(deckSection.js)*, `cardRow()` *(tuiles.js)*, `cardTile()` *(tuiles.js)*, `carteFiltree()` *(filtres.js)*, `deckCounts()` *(legalite.js)*, `deckEntries()` *(deck.js)*, `deckSize()` *(deck.js)*, `esc()` *(outils.js)*, `eur()` *(outils.js)*, `evalueDeck()` *(deckSection.js)*, `fmt()` *(outils.js)*, `gameChangersConnus()` *(retenue.js)*, `gameChangersDuDeck()` *(legalite.js)*, `gauge()` *(legalite.js)*, `groupeCartes()` *(groupes.js)*, `histogram()` *(stats.js)*, `legality()` *(legalite.js)*, `ligneGameChangers()` *(legalite.js)*, `noteMultiple()` *(barreGroupes.js)*, `partieDeck()` *(deckSection.js)*, `queueScryfall()` *(scryfall.js)*, `rendGroupes()` *(barreGroupes.js)*, `spent()` *(outils.js)*, `targets()` *(legalite.js)*, `zoneCommandant()` *(deckSection.js)*, → `annexeEntries()` *(annexes.js)*, → `blocAnnexe()` *(deckSection.js)*

Appelée par : `app.js (chargement)`, `appliquerAffichage`, `gestesVue`, `renderAll`, `runScryQueue`

## js/ficheVisuel.js

### `ficheTexteHTML()` — ligne 14

Appelle : `esc()` *(outils.js)*, `manaHTML()` *(symboles.js)*

Appelée par : `ficheHTML`, `ficheImageKO`

### `rafraichirFiche()` — ligne 32

Appelle : `openCardModal()` *(ficheParcours.js)*

Appelée par : `runScryQueue`

### `visuelAttenteHTML()` — ligne 39

N'appelle aucune fonction du projet.

Appelée par : `ficheHTML`

### `ficheImageKO()` — ligne 47

Appelle : `ficheTexteHTML()` *(ficheVisuel.js)*, `find()` *(cartes.js)*

Appelée par : `ficheHTML`

### `blocVersions()` — ligne 56

Appelle : `cleVersion()` *(impressions.js)*, `esc()` *(outils.js)*, `listeVersions()` *(versions.js)*, `possedeVersion()` *(versions.js)*, `sourceVersions()` *(versions.js)*, `sourceVoulue()` *(versions.js)*, `versionRang()` *(versions.js)*, `versionRetenue()` *(impressions.js)*, `versionsCarte()` *(impressions.js)*

Appelée par : `ficheHTML`

## js/fiche.js

### `ficheHTML()` — ligne 9

Appelle : `aDeuxFaces()` *(versions.js)*, `annexeDe()` *(annexes.js)*, `annexeListe()` *(annexes.js)*, `archetypesCarte()` *(archetypesSets.js)*, `autreFace()` *(versions.js)*, `availableFor()` *(deck.js)*, `bestOffer()` *(marche.js)*, `blocVersions()` *(ficheVisuel.js)*, `cartesDuDeck()` *(deck.js)*, `classeLiens()` *(liens.js)*, `cleImpression()` *(impressions.js)*, `cleVersion()` *(impressions.js)*, `deckCounts()` *(legalite.js)*, `deckEntries()` *(deck.js)*, `edhrecAllFor()` *(edhrec.js)*, `esc()` *(outils.js)*, `estGameChanger()` *(retenue.js)*, `eur()` *(outils.js)*, `faceVisible()` *(versions.js)*, `ficheTexteHTML()` *(ficheVisuel.js)*, `filtered()` *(collection.js)*, `libelleArchetype()` *(archetypesSets.js)*, `libelleFamillesLarges()` *(liens.js)*, `libelleImpression()` *(impressions.js)*, `libelleQual()` *(effets.js)*, `listeVersions()` *(versions.js)*, `norm()` *(cartes.js)*, `partnersFor()` *(synergies.js)*, `refCarte()` *(outils.js)*, `resumeArchetype()` *(archetypesSets.js)*, `targets()` *(legalite.js)*, `versionCourante()` *(versions.js)*, `visuelAttenteHTML()` *(ficheVisuel.js)*, `visuelEnRecherche()` *(versions.js)*, `visuelVersion()` *(versions.js)*, ⌘ `ficheImageKO()` *(ficheVisuel.js)*

Appelée par : `openCardModal`

## js/ficheParcours.js

### `poseParcoursFiche()` — ligne 24

N'appelle aucune fonction du projet.

Appelée par : `gestesDeck`, `gestesGraphe`

### `ficheVoisine()` — ligne 40

Appelle : `openCardModal()` *(ficheParcours.js)*

Appelée par : `app.js (chargement)`, `gestesDeck`

### `enteteFiche()` — ligne 59

Appelle : `esc()` *(outils.js)*

Appelée par : `openCardModal`

### `openCardModal()` — ligne 75

Appelle : `annexeDe()` *(annexes.js)*, `availableFor()` *(deck.js)*, `bestOffer()` *(marche.js)*, `cacherApercu()` *(apercu.js)*, `chercheImpressions()` *(recherches.js)*, `chercheTexte()` *(recherches.js)*, `chercheVerso()` *(recherches.js)*, `cmLink()` *(marche.js)*, `enteteFiche()` *(ficheParcours.js)*, `esc()` *(outils.js)*, `ficheHTML()` *(fiche.js)*, `find()` *(cartes.js)*, `openDialog()` *(dialogue.js)*

Appelée par : `basculerSourceVersions`, `choisirVersion`, `faireDefilerVersion`, `ficheVoisine`, `gestesDeck`, `gestesGraphe`, `rafraichirFiche`

## js/outils.js

### `esc()` — ligne 10

N'appelle aucune fonction du projet.

Appelée par : `actesAnnexe`, `barreCatalogue`, `blocAchats`, `blocAnnexe`, `blocCatalogue`, `blocEdhrec`, `blocGraphe`, `blocVersions`, `cardRow`, `cardTile`, `champBudget`, `corpsAffichage`, `corpsBoiteRecalcul`, `corpsFiltres`, `corpsFormat`, `corpsSauvegarde`, `enteteFiche`, `enveloppeGroupe`, `etatArchetypes`, `etatSets`, `exportDeckModal`, `ficheHTML`, `ficheTexteHTML`, `gauge`, `gestesDeck`, `lienDecksEdhrec`, `ligneAchats`, `ligneCatalogue`, `ligneCausesCollection`, `ligneCommandant`, `ligneFiltre`, `ligneGameChangers`, `listeArchetypesHTML`, `listeSetsHTML`, `listeSuggestions`, `majApercu`, `montrerApercu`, `openAdd`, `openCardModal`, `openDialog`, `openWantsModal`, `paginationListe`, `panneauEdhrec`, `proposerMajCatalogue`, `refCarte`, `renderB`, `renderD`, `renderE`, `renderTop`, `resultatsHTML`, `resumeFiltres`, `sectionParametres`, `sugRow`, `svgGraph`, `symBg`, `symIcon`, `tagAnnexe`, `tagDeck`, `tagIllegal`, `zoneCommandant`

### `eur()` — ligne 14

N'appelle aucune fonction du projet.

Appelée par : `addToDeck`, `blocAchats`, `blocAnnexe`, `blocEdhrec`, `buyCard`, `cardRow`, `cardTile`, `corpsCollectionParam`, `exportDeckModal`, `ficheHTML`, `legality`, `ligneAchats`, `ligneBudget`, `ligneCatalogue`, `noteCarte`, `openImport`, `openWantsModal`, `renderC`, `renderE`, `renderTop`, `sugRow`

### `refCarte()` — ligne 18

Appelle : `esc()` *(outils.js)*

Appelée par : `ficheHTML`, `renderD`

### `fmt()` — ligne 22

N'appelle aucune fonction du projet.

Appelée par : `aAcheter`, `addToDeck`, `ajouterCarte`, `app.js (chargement)`, `blocEdhrec`, `cardRow`, `cardTile`, `carteLegale`, `contexteEvaluation`, `corpsFormat`, `deckAdd`, `deplacerCarte`, `exportDeckModal`, `filtered`, `lanceEdhrecSiBesoin`, `legality`, `ligneCatalogue`, `ligneCausesCollection`, `ligneGameChangers`, `openImport`, `panneauEdhrec`, `renderC`, `renderE`, `renderH`, `renderTop`, `requeteCatalogue`, `resumeFormat`, `selectionCandidats`, `tagIllegal`, `targets`

### `spent()` — ligne 37

Appelle : `aAcheter()` *(outils.js)*

Appelée par : `buyCard`, `legality`, `ligneBudget`, `ligneCatalogue`, `openImport`, `renderE`, `renderTop`, `vivierSuggestions`

### `aAcheter()` — ligne 41

Appelle : `bestOffer()` *(marche.js)*, `find()` *(cartes.js)*, `fmt()` *(outils.js)*

Appelée par : `blocAchats`, `ligneAchats`, `openWantsModal`, `renderE`, `spent`

### `toast()` — ligne 57

N'appelle aucune fonction du projet.

Appelée par : `addToDeck`, `ajouterCarte`, `app.js (chargement)`, `brancherCatalogue`, `brancherRestauration`, `brancherSauvegarde`, `buyCard`, `chargerArchetypesEdhrec`, `choisirVersion`, `completeUnknown`, `deplacerCarte`, `enrichAllUnknown`, `exportDeckModal`, `gestesDeck`, `gestesDonnees`, `gestesReglages`, `lireCatalogueFichier`, `loadEdhrec`, `majCatalogue`, `majPrix`, `openImport`, `openWantsModal`, `openWipeModal`, `runScryQueue`, `save`, `telechargerCatalogue`, `versAnnexe`, `viderAnnexe`

## js/dialogue.js

### `openDialog()` — ligne 13

Appelle : `esc()` *(outils.js)*

Appelée par : `annonceRecalcul`, `exportDeckModal`, `gestesDeck`, `gestesDonnees`, `openAdd`, `openAffichageModal`, `openBudgetModal`, `openCardModal`, `openFiltresModal`, `openFormatModal`, `openImport`, `openParametresModal`, `openWantsModal`, `openWipeModal`, `ouvrirBoiteCatalogue`, `proposerMajCatalogue`

### `closeDialog()` — ligne 37

N'appelle aucune fonction du projet.

Appelée par : `app.js (chargement)`, `appliquerAffichage`, `appliquerBudget`, `appliquerFiltres`, `appliquerFormat`, `appliquerParametres`, `fermerBoiteCatalogue`, `finRecalcul`, `gestesDeck`, `gestesDonnees`, `gestesGraphe`, `gestesVue`, `openImport`, `openWipeModal`

## js/brouillon.js

### `ouvreBrouillon()` — ligne 23

Appelle : `copieEtat()` *(brouillon.js)*

Appelée par : `openAffichageModal`, `openBudgetModal`, `openFiltresModal`, `openFormatModal`, `openParametresModal`

### `copieEtat()` — ligne 31

N'appelle aucune fonction du projet.

Appelée par : `ouvreBrouillon`

### `echangeBrouillon()` — ligne 42

N'appelle aucune fonction du projet.

Appelée par : `avecBrouillon`, `modifieBrouillon`

### `reprendEtat()` — ligne 51

N'appelle aucune fonction du projet.

Appelée par : `avecBrouillon`, `modifieBrouillon`

### `avecBrouillon()` — ligne 61

Appelle : `echangeBrouillon()` *(brouillon.js)*, `reprendEtat()` *(brouillon.js)*

Appelée par : `corpsAffichage`, `corpsBudget`, `corpsCatalogue`, `corpsFiltres`, `corpsFormat`, `gestesVue`, `majListeArchetypes`, `majListeSets`, `majResumeBudget`, `majResumeFormat`, `resumeFiltres`

### `modifieBrouillon()` — ligne 69

Appelle : `echangeBrouillon()` *(brouillon.js)*, `reprendEtat()` *(brouillon.js)*

Appelée par : `app.js (chargement)`, `gestesReglages`, `gestesVue`, `glisseColonnes`, `reglageAffichage`

### `brouillonModifie()` — ligne 76

Appelle : `memeEtat()` *(brouillon.js)*

Appelée par : `resumeFiltres`

### `memeEtat()` — ligne 82

N'appelle aucune fonction du projet.

Appelée par : `brouillonModifie`

### `apresReglage()` — ligne 99

Appelle : `degeleSuggestions()` *(sugOrdre.js)*, `invaliderCandidats()` *(candidats.js)*, `majFenetreFiltres()` *(fenFiltres.js)*, `recalculerAvecProgression()` *(recalcul.js)*

Appelée par : `app.js (chargement)`, `gestesDeck`, `gestesReglages`, `gestesVue`

### `renderAllSiApplique()` — ligne 114

Appelle : `majResumeFiltres()` *(fenFiltres.js)*, `renderAll()` *(rendu.js)*

Appelée par : `chargerArchetypesEdhrec`, `chargerSetScryfall`, `chargerThemeEdhrec`

### `verseBrouillon()` — ligne 125

Appelle : `invaliderCandidats()` *(candidats.js)*

Appelée par : `appliquerAffichage`, `appliquerBudget`, `appliquerFiltres`, `appliquerFormat`, `appliquerParametres`

### `fermetureBrouillon()` — ligne 135

N'appelle aucune fonction du projet.

Appelée par : `app.js (chargement)`

## js/couleurs.js

### `nomCombinaisonCouleurs()` — ligne 48

N'appelle aucune fonction du projet.

Appelée par : `corpsFiltres`, `ligneCausesCollection`, `renderTop`

## js/apercu.js

### `initApercu()` — ligne 10

N'appelle aucune fonction du projet.

Appelée par : `cacherApercu`, `majApercu`, `montrerApercu`, `placerApercu`, `placerApercuDansCouche`

### `apercuTexte()` — ligne 19

N'appelle aucune fonction du projet.

Appelée par : `montrerApercu`

### `placerApercuDansCouche()` — ligne 26

Appelle : `initApercu()` *(apercu.js)*

Appelée par : `montrerApercu`

### `montrerApercu()` — ligne 34

Appelle : `apercuTexte()` *(apercu.js)*, `esc()` *(outils.js)*, `faceVisible()` *(versions.js)*, `find()` *(cartes.js)*, `initApercu()` *(apercu.js)*, `manaHTML()` *(symboles.js)*, `placerApercu()` *(apercu.js)*, `placerApercuDansCouche()` *(apercu.js)*, `queueScryfall()` *(scryfall.js)*

Appelée par : `app.js (chargement)`

### `placerApercu()` — ligne 57

Appelle : `initApercu()` *(apercu.js)*

Appelée par : `app.js (chargement)`, `montrerApercu`

### `cacherApercu()` — ligne 78

Appelle : `initApercu()` *(apercu.js)*

Appelée par : `app.js (chargement)`, `openCardModal`

### `majApercu()` — ligne 86

Appelle : `esc()` *(outils.js)*, `faceVisible()` *(versions.js)*, `find()` *(cartes.js)*, `initApercu()` *(apercu.js)*

Appelée par : `gestesDeck`, `runScryQueue`

## js/versions.js

### `aDeuxFaces()` — ligne 10

N'appelle aucune fonction du projet.

Appelée par : `autreFace`, `cardTile`, `ficheHTML`

### `autreFace()` — ligne 14

Appelle : `aDeuxFaces()` *(versions.js)*

Appelée par : `ficheHTML`

### `faceVisible()` — ligne 19

N'appelle aucune fonction du projet.

Appelée par : `cardTile`, `ficheHTML`, `majApercu`, `montrerApercu`, `visuelVersion`

### `sourceVersions()` — ligne 38

N'appelle aucune fonction du projet.

Appelée par : `blocVersions`, `faireDefilerVersion`, `listeVersions`

### `sourceVoulue()` — ligne 45

N'appelle aucune fonction du projet.

Appelée par : `blocVersions`

### `listeVersions()` — ligne 49

Appelle : `sourceVersions()` *(versions.js)*, `versionsCarte()` *(impressions.js)*

Appelée par : `blocVersions`, `choisirVersion`, `faireDefilerVersion`, `ficheHTML`, `versionCourante`, `versionRang`

### `possedeVersion()` — ligne 54

Appelle : `cleVersion()` *(impressions.js)*, `versionsCarte()` *(impressions.js)*

Appelée par : `blocVersions`, `choisirVersion`

### `versionRang()` — ligne 59

Appelle : `cleVersion()` *(impressions.js)*, `listeVersions()` *(versions.js)*, `versionRetenue()` *(impressions.js)*

Appelée par : `blocVersions`, `faireDefilerVersion`, `versionCourante`

### `versionCourante()` — ligne 70

Appelle : `listeVersions()` *(versions.js)*, `versionRang()` *(versions.js)*

Appelée par : `ficheHTML`

### `faireDefilerVersion()` — ligne 75

Appelle : `find()` *(cartes.js)*, `listeVersions()` *(versions.js)*, `openCardModal()` *(ficheParcours.js)*, `sourceVersions()` *(versions.js)*, `versionRang()` *(versions.js)*

Appelée par : `gestesVue`

### `basculerSourceVersions()` — ligne 86

Appelle : `chercheToutesEditions()` *(recherches.js)*, `cleVersion()` *(impressions.js)*, `find()` *(cartes.js)*, `openCardModal()` *(ficheParcours.js)*, `versionRetenue()` *(impressions.js)*, `versionsCarte()` *(impressions.js)*

Appelée par : `gestesVue`

### `visuelVersion()` — ligne 112

Appelle : `cleImpression()` *(impressions.js)*, `cleVersion()` *(impressions.js)*, `faceVisible()` *(versions.js)*

Appelée par : `ficheHTML`

### `visuelEnRecherche()` — ligne 125

Appelle : `cleImpression()` *(impressions.js)*, `cleVersion()` *(impressions.js)*

Appelée par : `ficheHTML`

### `choisirVersion()` — ligne 142

Appelle : `cleVersion()` *(impressions.js)*, `find()` *(cartes.js)*, `listeVersions()` *(versions.js)*, `openCardModal()` *(ficheParcours.js)*, `possedeVersion()` *(versions.js)*, `renderAll()` *(rendu.js)*, `scheduleSave()` *(stockage.js)*, `toast()` *(outils.js)*, `versionsCarte()` *(impressions.js)*

Appelée par : `gestesVue`

## js/tuiles.js

### `tagIllegal()` — ligne 12

Appelle : `carteLegale()` *(retenue.js)*, `esc()` *(outils.js)*, `fmt()` *(outils.js)*

Appelée par : `cardRow`, `cardTile`, `sugRow`

### `tagGameChanger()` — ligne 21

Appelle : `estGameChanger()` *(retenue.js)*

Appelée par : `cardRow`, `cardTile`, `sugRow`

### `tagDeck()` — ligne 34

Appelle : `esc()` *(outils.js)*

Appelée par : `cardRow`, `cardTile`

### `actesAnnexe()` — ligne 51

Appelle : `esc()` *(outils.js)*

Appelée par : `cardRow`, `cardTile`

### `cardTile()` — ligne 63

Appelle : `aDeuxFaces()` *(versions.js)*, `actesAnnexe()` *(tuiles.js)*, `availableFor()` *(deck.js)*, `esc()` *(outils.js)*, `eur()` *(outils.js)*, `faceVisible()` *(versions.js)*, `fmt()` *(outils.js)*, `libelleFamillesLarges()` *(liens.js)*, `nbCartesLarges()` *(notation.js)*, `nbInteractions()` *(notation.js)*, `nbLiens()` *(notation.js)*, `tagAnnexe()` *(annexes.js)*, `tagDeck()` *(tuiles.js)*, `tagGameChanger()` *(tuiles.js)*, `tagIllegal()` *(tuiles.js)*

Appelée par : `blocAnnexe`, `renderB`, `renderE`

### `cardRow()` — ligne 114

Appelle : `actesAnnexe()` *(tuiles.js)*, `availableFor()` *(deck.js)*, `esc()` *(outils.js)*, `eur()` *(outils.js)*, `fmt()` *(outils.js)*, `manaHTML()` *(symboles.js)*, `tagDeck()` *(tuiles.js)*, `tagGameChanger()` *(tuiles.js)*, `tagIllegal()` *(tuiles.js)*

Appelée par : `blocAnnexe`, `renderB`, `renderE`

### `customPanel()` — ligne 142

N'appelle aucune fonction du projet.

Appelée par : `corpsFormat`

### `sugRow()` — ligne 167

Appelle : `esc()` *(outils.js)*, `eur()` *(outils.js)*, `libelleFamillesLarges()` *(liens.js)*, `nbCartesLarges()` *(notation.js)*, `nbInteractions()` *(notation.js)*, `nbLiens()` *(notation.js)*, `tagAnnexe()` *(annexes.js)*, `tagGameChanger()` *(tuiles.js)*, `tagIllegal()` *(tuiles.js)*

Appelée par : `blocGraphe`, `corpsEdhrec`, `listeSuggestions`

## js/ancre.js

### `candidatsAncre()` — ligne 12

N'appelle aucune fonction du projet.

Appelée par : `releveAncre`

### `releveAncre()` — ligne 16

Appelle : `candidatsAncre()` *(ancre.js)*

Appelée par : `recalculerAvecProgression`

### `restaureAncre()` — ligne 41

N'appelle aucune fonction du projet.

Appelée par : `recalculerAvecProgression`

## js/recalcul.js

### `pause()` — ligne 19

N'appelle aucune fonction du projet.

Appelée par : `filtrerAvecProgression`, `recalculerAvecProgression`

### `recalculLong()` — ligne 25

Appelle : `signatureCandidats()` *(candidats.js)*, `suggestionsAJour()` *(vivier.js)*

Appelée par : `filetSuggestions`, `recalculerAvecProgression`

### `corpsBoiteRecalcul()` — ligne 38

Appelle : `esc()` *(outils.js)*, `zoneProgression()` *(fenFiltres.js)*

Appelée par : `annonceRecalcul`

### `annonceRecalcul()` — ligne 51

Appelle : `corpsBoiteRecalcul()` *(recalcul.js)*, `openDialog()` *(dialogue.js)*, `zoneProgression()` *(fenFiltres.js)*

Appelée par : `recalculerAvecProgression`

### `finRecalcul()` — ligne 68

Appelle : `closeDialog()` *(dialogue.js)*

Appelée par : `recalculerAvecProgression`

### `progresSection()` — ligne 84

Appelle : `signalerTravail()` *(rendu.js)*

Appelée par : `recalculerAvecProgression`

### `finProgresSection()` — ligne 109

Appelle : `signalerTravail()` *(rendu.js)*

Appelée par : `recalculerAvecProgression`

### `recalculerAvecProgression()` — ligne 128

Appelle : `annonceRecalcul()` *(recalcul.js)*, `finProgresSection()` *(recalcul.js)*, `finRecalcul()` *(recalcul.js)*, `geleSuggestions()` *(sugOrdre.js)*, `majProgression()` *(fenFiltres.js)*, `pause()` *(recalcul.js)*, `prechauffeCandidats()` *(candidats.js)*, `prepareSuggestions()` *(vivier.js)*, `progresSection()` *(recalcul.js)*, `recalculLong()` *(recalcul.js)*, `releveAncre()` *(ancre.js)*, `renderAll()` *(rendu.js)*, `restaureAncre()` *(ancre.js)*

Appelée par : `addToDeck`, `ajouterCarte`, `apresReglage`, `buyCard`, `chargerCatalogueComplet`, `filetSuggestions`, `gestesDeck`, `gestesDonnees`, `gestesVue`, `lireCatalogueFichier`, `openImport`, `removeFromDeck`, `retirerAnnexe`, `versAnnexe`, `viderAnnexe`

## js/entete.js

### `majHauteurEntete()` — ligne 26

N'appelle aucune fonction du projet.

Appelée par : `app.js (chargement)`, `renderTop`

### `renderTop()` — ligne 31

Appelle : `esc()` *(outils.js)*, `eur()` *(outils.js)*, `filtresActifs()` *(filtres.js)*, `fmt()` *(outils.js)*, `majHauteurEntete()` *(entete.js)*, `nomCombinaisonCouleurs()` *(couleurs.js)*, `spent()` *(outils.js)*, `symBg()` *(symboles.js)*, `texteFiltresActifs()` *(filtres.js)*

Appelée par : `brancherSauvegarde`, `gestesGraphe`, `refreshSuggestions`, `renderAll`, `renderB`

### `renderOnglets()` — ligne 134

N'appelle aucune fonction du projet.

Appelée par : `activerOnglet`, `renderAll`

### `activerOnglet()` — ligne 151

Appelle : `renderOnglets()` *(entete.js)*, `scheduleSave()` *(stockage.js)*

Appelée par : `allerVersSection`, `app.js (chargement)`, `gestesVue`

### `allerVersSection()` — ligne 166

Appelle : `activerOnglet()` *(entete.js)*, `ongletDeSection()` *(etat.js)*

Appelée par : `gestesGraphe`

## js/rendu.js

### `signalerTravail()` — ligne 11

Appelle : `ongletDeSection()` *(etat.js)*

Appelée par : `finProgresSection`, `progresSection`

### `renderAll()` — ligne 20

Appelle : `renderB()` *(collection.js)*, `renderC()` *(stats.js)*, `renderD()` *(graphe.js)*, `renderE()` *(deckSection.js)*, `renderOnglets()` *(entete.js)*, `renderSuggestions()` *(suggestions.js)*, `renderTop()` *(entete.js)*, `scheduleSave()` *(stockage.js)*

Appelée par : `app.js (chargement)`, `brancherCatalogue`, `brancherRestauration`, `chargerCatalogue`, `chargerGameChangers`, `choisirVersion`, `completeUnknown`, `demarrer`, `filtrerAvecProgression`, `gestesDonnees`, `loadSymbology`, `majCatalogue`, `majPrix`, `openWipeModal`, `recalculerAvecProgression`, `renderAllSiApplique`

## js/fenFormat.js

### `resumeFormat()` — ligne 8

Appelle : `fmt()` *(outils.js)*

Appelée par : `corpsFormat`, `majResumeFormat`

### `majResumeFormat()` — ligne 13

Appelle : `avecBrouillon()` *(brouillon.js)*, → `resumeFormat()` *(fenFormat.js)*

Appelée par : `app.js (chargement)`

### `corpsFormat()` — ligne 18

Appelle : `avecBrouillon()` *(brouillon.js)*, `customPanel()` *(tuiles.js)*, `esc()` *(outils.js)*, `fmt()` *(outils.js)*, `resumeFormat()` *(fenFormat.js)*

Appelée par : `majFenetreFormat`, `openFormatModal`

### `majFenetreFormat()` — ligne 44

Appelle : `corpsFormat()` *(fenFormat.js)*

Appelée par : `openFormatModal`

### `openFormatModal()` — ligne 54

Appelle : `corpsFormat()` *(fenFormat.js)*, `openDialog()` *(dialogue.js)*, `ouvreBrouillon()` *(brouillon.js)*, `zoneProgression()` *(fenFiltres.js)*, → `majFenetreFormat()` *(fenFormat.js)*

Appelée par : `gestesReglages`

## js/fenParametres.js

### `sectionParametres()` — ligne 18

Appelle : `esc()` *(outils.js)*

Appelée par : `corpsParametres`

### `corpsCollectionParam()` — ligne 30

Appelle : `collectionCards()` *(collection.js)*, `eur()` *(outils.js)*

Appelée par : `corpsParametres`

### `corpsCatalogue()` — ligne 49

Appelle : `avecBrouillon()` *(brouillon.js)*, `blocCatalogue()` *(fenSauvegarde.js)*

Appelée par : `corpsParametres`

### `corpsParametres()` — ligne 72

Appelle : `corpsCatalogue()` *(fenParametres.js)*, `corpsCollectionParam()` *(fenParametres.js)*, `corpsSauvegarde()` *(fenSauvegarde.js)*, `sectionParametres()` *(fenParametres.js)*

Appelée par : `majFenetreParametres`, `openParametresModal`

### `majFenetreParametres()` — ligne 89

Appelle : `brancherParametres()` *(fenParametres.js)*, `corpsParametres()` *(fenParametres.js)*

Appelée par : `brancherSauvegarde`, `openParametresModal`, `rafraichirFenetreSauvegarde`

### `brancherParametres()` — ligne 100

Appelle : `brancherCatalogue()` *(fenSauvegarde.js)*, `brancherRestauration()` *(fenSauvegarde.js)*, `brancherSauvegarde()` *(fenSauvegarde.js)*

Appelée par : `majFenetreParametres`, `openParametresModal`

### `appliquerParametres()` — ligne 106

Appelle : `closeDialog()` *(dialogue.js)*, `filtrerAvecProgression()` *(fenFiltres.js)*, `verseBrouillon()` *(brouillon.js)*

Appelée par : `gestesReglages`

### `openParametresModal()` — ligne 112

Appelle : `brancherParametres()` *(fenParametres.js)*, `corpsParametres()` *(fenParametres.js)*, `openDialog()` *(dialogue.js)*, `ouvreBrouillon()` *(brouillon.js)*, `zoneProgression()` *(fenFiltres.js)*, → `majFenetreParametres()` *(fenParametres.js)*

Appelée par : `gestesReglages`

### `appliquerFormat()` — ligne 123

Appelle : `closeDialog()` *(dialogue.js)*, `filtrerAvecProgression()` *(fenFiltres.js)*, `verseBrouillon()` *(brouillon.js)*

Appelée par : `gestesReglages`

## js/fenBudget.js

### `champBudget()` — ligne 16

Appelle : `esc()` *(outils.js)*

Appelée par : `corpsBudget`

### `corpsBudget()` — ligne 22

Appelle : `avecBrouillon()` *(brouillon.js)*, `champBudget()` *(fenBudget.js)*, `ligneAchats()` *(suggestions.js)*, `ligneBudget()` *(suggestions.js)*

Appelée par : `openBudgetModal`

### `majResumeBudget()` — ligne 51

Appelle : `avecBrouillon()` *(brouillon.js)*, `ligneAchats()` *(suggestions.js)*, `ligneBudget()` *(suggestions.js)*

Appelée par : `app.js (chargement)`, `openBudgetModal`

### `appliquerBudget()` — ligne 63

Appelle : `closeDialog()` *(dialogue.js)*, `filtrerAvecProgression()` *(fenFiltres.js)*, `verseBrouillon()` *(brouillon.js)*

Appelée par : `app.js (chargement)`, `gestesReglages`

### `openBudgetModal()` — ligne 69

Appelle : `corpsBudget()` *(fenBudget.js)*, `openDialog()` *(dialogue.js)*, `ouvreBrouillon()` *(brouillon.js)*, `zoneProgression()` *(fenFiltres.js)*, → `majResumeBudget()` *(fenBudget.js)*

Appelée par : `gestesReglages`

## js/fenFiltres.js

### `ligneFiltre()` — ligne 10

Appelle : `esc()` *(outils.js)*

Appelée par : `corpsFiltres`

### `corpsFiltres()` — ligne 20

Appelle : `archetypesFiltre()` *(archetypesSets.js)*, `avecBrouillon()` *(brouillon.js)*, `esc()` *(outils.js)*, `etatArchetypes()` *(fenListes.js)*, `etatSets()` *(fenListes.js)*, `libelleArchetype()` *(archetypesSets.js)*, `libelleSet()` *(archetypesSets.js)*, `ligneFiltre()` *(fenFiltres.js)*, `listeArchetypesHTML()` *(fenListes.js)*, `listeSetsHTML()` *(fenListes.js)*, `nomCombinaisonCouleurs()` *(couleurs.js)*, `resumeArchetype()` *(archetypesSets.js)*, `resumeFiltres()` *(fenFiltres.js)*, `rolesFiltre()` *(filtres.js)*, `setsFiltre()` *(archetypesSets.js)*, `symBg()` *(symboles.js)*, `targets()` *(legalite.js)*

Appelée par : `majFenetreFiltres`, `openFiltresModal`

### `resumeFiltres()` — ligne 105

Appelle : `avecBrouillon()` *(brouillon.js)*, `brouillonModifie()` *(brouillon.js)*, `collectionCards()` *(collection.js)*, `esc()` *(outils.js)*, `filtered()` *(collection.js)*, `filtresActifs()` *(filtres.js)*, `texteFiltresActifs()` *(filtres.js)*

Appelée par : `corpsFiltres`, `majResumeFiltres`

### `majResumeFiltres()` — ligne 119

Appelle : `resumeFiltres()` *(fenFiltres.js)*

Appelée par : `app.js (chargement)`, `chargerSetScryfall`, `openFiltresModal`, `renderAllSiApplique`

### `zoneProgression()` — ligne 126

N'appelle aucune fonction du projet.

Appelée par : `annonceRecalcul`, `corpsBoiteRecalcul`, `openBudgetModal`, `openFiltresModal`, `openFormatModal`, `openParametresModal`

### `majProgression()` — ligne 133

N'appelle aucune fonction du projet.

Appelée par : `filtrerAvecProgression`, `recalculerAvecProgression`

### `filtrerAvecProgression()` — ligne 148

Appelle : `majProgression()` *(fenFiltres.js)*, `pause()` *(recalcul.js)*, `prechauffeCandidats()` *(candidats.js)*, `prepareSuggestions()` *(vivier.js)*, `renderAll()` *(rendu.js)*

Appelée par : `appliquerBudget`, `appliquerFiltres`, `appliquerFormat`, `appliquerParametres`

### `majFenetreFiltres()` — ligne 166

Appelle : `corpsFiltres()` *(fenFiltres.js)*

Appelée par : `apresReglage`, `chargerArchetypesEdhrec`, `chargerListeSets`, `chargerSetScryfall`, `chargerThemeEdhrec`, `gestesVue`, `openFiltresModal`

### `appliquerFiltres()` — ligne 186

Appelle : `closeDialog()` *(dialogue.js)*, `filtrerAvecProgression()` *(fenFiltres.js)*, `verseBrouillon()` *(brouillon.js)*

Appelée par : `app.js (chargement)`, `gestesReglages`

### `openFiltresModal()` — ligne 192

Appelle : `chargerListeSets()` *(sets.js)*, `corpsFiltres()` *(fenFiltres.js)*, `majFenetreFiltres()` *(fenFiltres.js)*, `majResumeFiltres()` *(fenFiltres.js)*, `openDialog()` *(dialogue.js)*, `ouvreBrouillon()` *(brouillon.js)*, `zoneProgression()` *(fenFiltres.js)*

Appelée par : `gestesVue`

## js/fenAffichage.js

### `indexColonnes()` — ligne 23

N'appelle aucune fonction du projet.

Appelée par : `corpsAffichage`, `openAffichageModal`

### `resumeAffichage()` — ligne 31

Appelle : `colonnesDe()` *(barreGroupes.js)*

Appelée par : `corpsAffichage`, `renderB`

### `corpsAffichage()` — ligne 39

Appelle : `avecBrouillon()` *(brouillon.js)*, `colonnesDe()` *(barreGroupes.js)*, `esc()` *(outils.js)*, `indexColonnes()` *(fenAffichage.js)*, `resumeAffichage()` *(fenAffichage.js)*

Appelée par : `majFenetreAffichage`, `openAffichageModal`

### `majFenetreAffichage()` — ligne 81

Appelle : `corpsAffichage()` *(fenAffichage.js)*

Appelée par : `openAffichageModal`, `reglageAffichage`

### `reglageAffichage()` — ligne 93

Appelle : `majFenetreAffichage()` *(fenAffichage.js)*, `modifieBrouillon()` *(brouillon.js)*

Appelée par : `app.js (chargement)`

### `glisseColonnes()` — ligne 107

Appelle : `modifieBrouillon()` *(brouillon.js)*

Appelée par : `app.js (chargement)`

### `appliquerAffichage()` — ligne 121

Appelle : `closeDialog()` *(dialogue.js)*, `renderB()` *(collection.js)*, `renderE()` *(deckSection.js)*, `scheduleSave()` *(stockage.js)*, `verseBrouillon()` *(brouillon.js)*

Appelée par : `gestesReglages`

### `openAffichageModal()` — ligne 131

Appelle : `colonnesDe()` *(barreGroupes.js)*, `corpsAffichage()` *(fenAffichage.js)*, `indexColonnes()` *(fenAffichage.js)*, `openDialog()` *(dialogue.js)*, `ouvreBrouillon()` *(brouillon.js)*, → `majFenetreAffichage()` *(fenAffichage.js)*

Appelée par : `gestesReglages`

## js/fenListes.js

### `listeArchetypesHTML()` — ligne 17

Appelle : `archetypesDisponibles()` *(archetypesSets.js)*, `archetypesFiltre()` *(archetypesSets.js)*, `esc()` *(outils.js)*, `loose()` *(cartes.js)*

Appelée par : `corpsFiltres`, `majListeArchetypes`

### `majListeArchetypes()` — ligne 44

Appelle : `avecBrouillon()` *(brouillon.js)*, → `listeArchetypesHTML()` *(fenListes.js)*

Appelée par : `app.js (chargement)`

### `etatArchetypes()` — ligne 50

Appelle : `esc()` *(outils.js)*

Appelée par : `corpsFiltres`

### `listeSetsHTML()` — ligne 73

Appelle : `esc()` *(outils.js)*, `loose()` *(cartes.js)*, `setsFiltre()` *(archetypesSets.js)*

Appelée par : `corpsFiltres`, `majListeSets`

### `majListeSets()` — ligne 102

Appelle : `avecBrouillon()` *(brouillon.js)*, → `listeSetsHTML()` *(fenListes.js)*

Appelée par : `app.js (chargement)`

### `etatSets()` — ligne 108

Appelle : `esc()` *(outils.js)*

Appelée par : `corpsFiltres`

## js/boiteCatalogue.js

### `octets()` — ligne 9

N'appelle aucune fonction du projet.

Appelée par : `barreCatalogue`, `majBoiteCatalogue`

### `barreCatalogue()` — ligne 14

Appelle : `esc()` *(outils.js)*, `octets()` *(boiteCatalogue.js)*

Appelée par : `corpsBoiteCatalogue`

### `corpsBoiteCatalogue()` — ligne 23

Appelle : `barreCatalogue()` *(boiteCatalogue.js)*

Appelée par : `ouvrirBoiteCatalogue`

### `ouvrirBoiteCatalogue()` — ligne 38

Appelle : `corpsBoiteCatalogue()` *(boiteCatalogue.js)*, `openDialog()` *(dialogue.js)*

Appelée par : `brancherCatalogue`, `telechargerCatalogue`

### `majBoiteCatalogue()` — ligne 46

Appelle : `octets()` *(boiteCatalogue.js)*

Appelée par : `nouveauSuivi`

### `fermerBoiteCatalogue()` — ligne 66

Appelle : `closeDialog()` *(dialogue.js)*

Appelée par : `brancherCatalogue`, `telechargerCatalogue`

## js/fenExport.js

### `exportDeckModal()` — ligne 8

Appelle : `annexeEntries()` *(annexes.js)*, `deckEntries()` *(deck.js)*, `deckSize()` *(deck.js)*, `esc()` *(outils.js)*, `eur()` *(outils.js)*, `fmt()` *(outils.js)*, `openDialog()` *(dialogue.js)*, `toast()` *(outils.js)*

Appelée par : `gestesDonnees`

### `openWantsModal()` — ligne 88

Appelle : `aAcheter()` *(outils.js)*, `esc()` *(outils.js)*, `eur()` *(outils.js)*, `openDialog()` *(dialogue.js)*, `toast()` *(outils.js)*

Appelée par : `gestesDeck`

### `openWipeModal()` — ligne 114

Appelle : `annexeListe()` *(annexes.js)*, `closeDialog()` *(dialogue.js)*, `openDialog()` *(dialogue.js)*, `renderAll()` *(rendu.js)*, `toast()` *(outils.js)*

Appelée par : `gestesDonnees`

## js/gestesVue.js

### `gestesVue()` — ligne 10

Appelle : `activerOnglet()` *(entete.js)*, `apresReglage()` *(brouillon.js)*, `archetypesAChargerEdhrec()` *(archetypesSets.js)*, `avecBrouillon()` *(brouillon.js)*, `basculerArchetype()` *(archetypesSets.js)*, `basculerSet()` *(archetypesSets.js)*, `basculerSourceVersions()` *(versions.js)*, `chargerSetScryfall()` *(sets.js)*, `chargerThemeEdhrec()` *(edhrecThemes.js)*, `choisirVersion()` *(versions.js)*, `closeDialog()` *(dialogue.js)*, `effacerFiltre()` *(filtres.js)*, `faireDefilerVersion()` *(versions.js)*, `invaliderCandidats()` *(candidats.js)*, `majFenetreFiltres()` *(fenFiltres.js)*, `modifieBrouillon()` *(brouillon.js)*, `openFiltresModal()` *(fenFiltres.js)*, `recalculerAvecProgression()` *(recalcul.js)*, `renderB()` *(collection.js)*, `renderD()` *(graphe.js)*, `renderE()` *(deckSection.js)*, `setsACharger()` *(archetypesSets.js)*

Appelée par : `app.js (chargement)`

## js/gestesReglages.js

### `gestesReglages()` — ligne 9

Appelle : `appliquerAffichage()` *(fenAffichage.js)*, `appliquerBudget()` *(fenBudget.js)*, `appliquerFiltres()` *(fenFiltres.js)*, `appliquerFormat()` *(fenParametres.js)*, `appliquerParametres()` *(fenParametres.js)*, `apresReglage()` *(brouillon.js)*, `basculerRole()` *(filtres.js)*, `cleLimiteEdhrec()` *(sugListes.js)*, `currentSuggestions()` *(vivier.js)*, `groupeCartes()` *(groupes.js)*, `interrompreCatalogue()` *(catalogue.js)*, `modifieBrouillon()` *(brouillon.js)*, `openAffichageModal()` *(fenAffichage.js)*, `openBudgetModal()` *(fenBudget.js)*, `openFormatModal()` *(fenFormat.js)*, `openParametresModal()` *(fenParametres.js)*, `refreshSuggestions()` *(suggestions.js)*, `reinitFiltres()` *(filtres.js)*, `selectionSuggestions()` *(sugListes.js)*, `toast()` *(outils.js)*

Appelée par : `app.js (chargement)`

## js/gestesDeck.js

### `gestesDeck()` — ligne 9

Appelle : `addToDeck()` *(deck.js)*, `annexeSize()` *(annexes.js)*, `apresReglage()` *(brouillon.js)*, `buyCard()` *(deck.js)*, `closeDialog()` *(dialogue.js)*, `degeleSuggestions()` *(sugOrdre.js)*, `esc()` *(outils.js)*, `ficheVoisine()` *(ficheParcours.js)*, `find()` *(cartes.js)*, `geleSuggestions()` *(sugOrdre.js)*, `invaliderCandidats()` *(candidats.js)*, `majApercu()` *(apercu.js)*, `openCardModal()` *(ficheParcours.js)*, `openDialog()` *(dialogue.js)*, `openWantsModal()` *(fenExport.js)*, `poseParcoursFiche()` *(ficheParcours.js)*, `recalculerAvecProgression()` *(recalcul.js)*, `removeFromDeck()` *(deck.js)*, `renderB()` *(collection.js)*, `renderSuggestions()` *(suggestions.js)*, `retirerAnnexe()` *(annexes.js)*, `scheduleSave()` *(stockage.js)*, `signatureCommandants()` *(edhrec.js)*, `toast()` *(outils.js)*, `versAnnexe()` *(annexes.js)*, `viderAnnexe()` *(annexes.js)*

Appelée par : `app.js (chargement)`

## js/gestesDonnees.js

### `gestesDonnees()` — ligne 9

Appelle : `annexeListe()` *(annexes.js)*, `chargerCatalogue()` *(candidats.js)*, `closeDialog()` *(dialogue.js)*, `enrichAllUnknown()` *(recherches.js)*, `exportDeckModal()` *(fenExport.js)*, `idbVider()` *(idb.js)*, `invaliderCandidats()` *(candidats.js)*, `loadEdhrec()` *(edhrec.js)*, `majCatalogue()` *(catalogue.js)*, `openAdd()` *(fenAjout.js)*, `openDialog()` *(dialogue.js)*, `openImport()` *(fenImport.js)*, `openWipeModal()` *(fenExport.js)*, `rafraichirFenetreSauvegarde()` *(fenSauvegarde.js)*, `recalculerAvecProgression()` *(recalcul.js)*, `renderAll()` *(rendu.js)*, `save()` *(stockage.js)*, `scheduleSave()` *(stockage.js)*, `snapshot()` *(stockage.js)*, `telechargerCatalogue()` *(catalogue.js)*, `toast()` *(outils.js)*

Appelée par : `app.js (chargement)`

## js/gestesGraphe.js

### `gestesGraphe()` — ligne 9

Appelle : `ajouterCarte()` *(fenAjout.js)*, `allerVersSection()` *(entete.js)*, `buildCard()` *(cartes.js)*, `carteDepuisScryfall()` *(recherches.js)*, `closeDialog()` *(dialogue.js)*, `find()` *(cartes.js)*, `invaliderCandidats()` *(candidats.js)*, `majResultats()` *(fenAjout.js)*, `norm()` *(cartes.js)*, `openCardModal()` *(ficheParcours.js)*, `poseParcoursFiche()` *(ficheParcours.js)*, `registerCard()` *(cartes.js)*, `renderB()` *(collection.js)*, `renderD()` *(graphe.js)*, `renderSuggestions()` *(suggestions.js)*, `renderTop()` *(entete.js)*

Appelée par : `app.js (chargement)`

## js/app.js

### `chargement du module`

Appelle : `activerOnglet()` *(entete.js)*, `appliquerBudget()` *(fenBudget.js)*, `appliquerFiltres()` *(fenFiltres.js)*, `apresReglage()` *(brouillon.js)*, `cacherApercu()` *(apercu.js)*, `closeDialog()` *(dialogue.js)*, `demarrer()` *(app.js)*, `fermetureBrouillon()` *(brouillon.js)*, `ficheVoisine()` *(ficheParcours.js)*, `fmt()` *(outils.js)*, `gestesDeck()` *(gestesDeck.js)*, `gestesDonnees()` *(gestesDonnees.js)*, `gestesGraphe()` *(gestesGraphe.js)*, `gestesReglages()` *(gestesReglages.js)*, `gestesVue()` *(gestesVue.js)*, `glisseColonnes()` *(fenAffichage.js)*, `invaliderCandidats()` *(candidats.js)*, `majFiltre()` *(filtres.js)*, `majListeArchetypes()` *(fenListes.js)*, `majListeSets()` *(fenListes.js)*, `majResultats()` *(fenAjout.js)*, `majResumeBudget()` *(fenBudget.js)*, `majResumeFiltres()` *(fenFiltres.js)*, `majResumeFormat()` *(fenFormat.js)*, `modifieBrouillon()` *(brouillon.js)*, `montrerApercu()` *(apercu.js)*, `placerApercu()` *(apercu.js)*, `refreshSuggestions()` *(suggestions.js)*, `reglageAffichage()` *(fenAffichage.js)*, `renderAll()` *(rendu.js)*, `renderB()` *(collection.js)*, `renderE()` *(deckSection.js)*, `scheduleSave()` *(stockage.js)*, `toast()` *(outils.js)*, → `majHauteurEntete()` *(entete.js)*

### `demarrer()` — ligne 251

Appelle : `archetypesARevoir()` *(edhrecThemes.js)*, `chargerArchetypesEdhrec()` *(edhrecThemes.js)*, `chargerGameChangers()` *(gameChangers.js)*, `chargerSauvegarde()` *(stockage.js)*, `demarrerCatalogue()` *(catalogue.js)*, `gameChangersARevoir()` *(gameChangers.js)*, `initBuiltin()` *(cartes.js)*, `loadSymbology()` *(symboles.js)*, `renderAll()` *(rendu.js)*, `reprendreArchetypesEdhrec()` *(edhrecThemes.js)*, `reprendreGameChangers()` *(gameChangers.js)*, `reprendreSets()` *(sets.js)*, `restore()` *(stockage.js)*

Appelée par : `app.js (chargement)`

