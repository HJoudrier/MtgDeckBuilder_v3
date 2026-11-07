# Qui appelle qui

*Écrit par `node outils/genAppels.js` à partir des sources — ne pas modifier à la main.*

Pour chaque fonction : le fichier où elle est définie, les fonctions du projet qu'elle
appelle, et celles qui l'appellent. Trois façons d'appeler, notées différemment — un appel
direct sans marque, un appel **différé** (une fonction passée en rappel) précédé de « → »,
un appel depuis un **gestionnaire HTML** produit par l'atelier précédé de « ⌘ ». Les graphes
correspondants sont dans `doc/graphe-fonctions.dot` et `doc/graphe-modules.dot`.

**916 fonctions** dans 143 modules, **2490 appels** relevés.

## Noms définis deux fois

Tout vivant dans la portée globale, le dernier chargé écrase le premier.

- `resultatsHTML()` : `fenAjout.js` puis `simResultats.js`

## Fonctions que personne n'appelle

Points d'entrée — appelées depuis le HTML, depuis un écouteur — ou code mort.

- `nuageFond()` *(nuagePaquet.js)*
- `poseCouleursCommandant()` *(restrictions.js)*
- `repondre()` *(jeuPilote.js)*

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

Appelée par : `applyScryfall`, `buildCard`, `carteDuCatalogue`, `carteLivree`, `completeDepuisRec`, `majTexteOracle`, `restore`

## js/mana.js

### `ordonneMana()` — ligne 28

N'appelle aucune fonction du projet.

Appelée par : `applyScryfall`, `carteDuCatalogue`, `getCardOrAnalyzedRec`, `manaProduitTexte`

### `manaVide()` — ligne 33

N'appelle aucune fonction du projet.

Appelée par : `bilanMana`, `pipsCarte`

### `pipsCarte()` — ligne 48

Appelle : `manaVide()` *(mana.js)*

Appelée par : `bilanMana`

### `manaProduitTexte()` — ligne 68

Appelle : `ordonneMana()` *(mana.js)*

Appelée par : `manaProduitDe`

### `manaProduitDe()` — ligne 103

Appelle : `manaProduitTexte()` *(mana.js)*

Appelée par : `bilanMana`

### `bilanMana()` — ligne 116

Appelle : `deckEntries()` *(deck.js)*, `manaProduitDe()` *(mana.js)*, `manaVide()` *(mana.js)*, `pipsCarte()` *(mana.js)*, `verdictMana()` *(mana.js)*

Appelée par : `blocMana`

### `verdictMana()` — ligne 158

N'appelle aucune fonction du projet.

Appelée par : `bilanMana`

### `pourcentMana()` — ligne 170

N'appelle aucune fonction du projet.

Appelée par : `ligneMana`

### `nombreMana()` — ligne 176

N'appelle aucune fonction du projet.

Appelée par : `blocMana`, `histogram`, `ligneMana`

### `ligneMana()` — ligne 180

Appelle : `esc()` *(outils.js)*, `nombreMana()` *(mana.js)*, `pourcentMana()` *(mana.js)*, `symIcon()` *(symboles.js)*

Appelée par : `blocMana`

### `blocMana()` — ligne 197

Appelle : `bilanMana()` *(mana.js)*, `nombreMana()` *(mana.js)*, → `ligneMana()` *(mana.js)*

Appelée par : `renderE`

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

Appelle : `norm()` *(cartes.js)*, → `carteLivree()` *(cartes.js)*

### `norm()` — ligne 17

N'appelle aucune fonction du projet.

Appelée par : `appliqueCatalogueAuxCartes`, `applyScryfall`, `archetypesCarte`, `cartes.js (chargement)`, `chargeSimCartes`, `chargerGameChangers`, `chercheCartes`, `chercheFichesScryfall`, `chercheScryfall`, `completeUnknown`, `edhrecAllFor`, `edhrecFor`, `estGameChanger`, `fetchEdhrecCommander`, `ficheHTML`, `ficheParNom`, `filtresValeursOK`, `find`, `gestesGraphe`, `indexArchive`, `indexCard`, `loose`, `majResultats`, `nbInteractions`, `nomsPageEdhrec`, `noteCarte`, `noteSetIndex`, `parseMtgoList`, `propositionsHTML`, `registerCard`, `renameCard`, `retiens`, `saisieRecherche`, `scryTarget`, `setsCarte`, `setsRec`, `snapshot`, `unindexCard`, `valeursRec`

### `loose()` — ligne 18

Appelle : `norm()` *(cartes.js)*

Appelée par : `applyScryfall`, `completeUnknown`, `edhrecAllFor`, `edhrecFor`, `fetchEdhrecCommander`, `filtresValeursOK`, `find`, `indexCard`, `listeArchetypesHTML`, `listeSetsHTML`, `scryTarget`, `unindexCard`

### `buildCard()` — ligne 20

Appelle : `parseCost()` *(analyse.js)*, `reanalyser()` *(categories.js)*

Appelée par : `applyScryfall`, `carteDepuisScryfall`, `carteDuCatalogue`, `carteLivree`, `gestesGraphe`, `getCardOrAnalyzedRec`, `openImport`, `restore`

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

Appelée par : `applyScryfall`, `carteDuCatalogue`, `carteLivree`, `gestesGraphe`, `openImport`, `restore`

### `find()` — ligne 90

Appelle : `loose()` *(cartes.js)*, `norm()` *(cartes.js)*

Appelée par : `aAcheter`, `addToDeck`, `ajoutCollection`, `annexeEntries`, `appliqueCatalogueAuxCartes`, `applyScryfall`, `basculerSourceVersions`, `buyCard`, `carteDuCatalogue`, `chargerCatalogue`, `choisirVersion`, `collectionCards`, `commandantsPrincipaux`, `completeUnknown`, `contexteEvaluation`, `couleursRestriction`, `coutDeck`, `deckEntries`, `demandesTousDecks`, `deplacerCarte`, `faireDefilerVersion`, `ficheImageKO`, `ficheParNom`, `gestesDeck`, `gestesGraphe`, `getCardOrAnalyzedRec`, `legality`, `loadEdhrec`, `majApercu`, `majPrix`, `montrerApercu`, `nomCanonique`, `openCardModal`, `openImport`, `panneauEdhrec`, `poseCouleursCommandant`, `propositionsHTML`, `quantiteCollection`, `requeteCatalogue`, `restaureDecks`, `restore`, `selectionCandidats`, `signatureCommandants`, `versAnnexe`, `vivierSuggestions`, `wishlist`, `zoneCommandant`

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

Appelée par : `annexeEntries`, `deckEntries`, `groupes.js (chargement)`, `statsOf`, `valeursCarte`, `valeursRec`

### `carteLivree()` — ligne 151

Appelle : `buildCard()` *(cartes.js)*, `reanalyser()` *(categories.js)*, `registerCard()` *(cartes.js)*

Appelée par : `cartes.js (chargement)`, `initBuiltin`

### `initBuiltin()` — ligne 165

Appelle : → `carteLivree()` *(cartes.js)*

Appelée par : `demarrer`

### `frontFace()` — ligne 171

N'appelle aucune fonction du projet.

Appelée par : `archetypesCarte`, `chargerGameChangers`, `chargerSetScryfall`, `chercheTexte`, `chercheVerso`, `completeUnknown`, `edhrecAllFor`, `edhrecFor`, `edhrecSlug`, `estGameChanger`, `fetchEdhrecCommander`, `scryTarget`, `setsCarte`, `setsRec`, `valeursRec`

### `mergeInto()` — ligne 175

Appelle : `annexeListe()` *(annexes.js)*, `unindexCard()` *(cartes.js)*

Appelée par : `renameCard`

### `renameCard()` — ligne 196

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

Appelée par : `cardTile`, `ficheHTML`, `noteCarte`, `tagsSuggestion`

### `primeLiensLarges()` — ligne 71

N'appelle aucune fonction du projet.

Appelée par : `noteCarte`

## js/etat.js

### `chargement du module`

Appelle : → `adversaires()` *(jeuEtat.js)*

### `ongletDeSection()` — ligne 81

N'appelle aucune fonction du projet.

Appelée par : `entete.js (chargement)`, `marqueOngletsPerimes`, `signalerTravail`

## js/decks.js

### `chargement du module`

Appelle : `deckCourant()` *(decks.js)*

### `cleDeckNeuve()` — ligne 42

N'appelle aucune fonction du projet.

Appelée par : `creerDeck`, `deckCourant`, `restaureDecks`

### `deckNeuf()` — ligne 49

N'appelle aucune fonction du projet.

Appelée par : `creerDeck`, `deckCourant`, `restaureDecks`

### `clesDecks()` — ligne 75

N'appelle aucune fonction du projet.

Appelée par : `bilanWishlist`, `deckCourant`, `demandesTousDecks`, `renderI`, `renderJ`, `renderTop`, `restaureDecks`, `signatureAchats`, `snapshot`, `supprimerDeck`, `tableHTML`, `vignetteDeck`

### `deckCourant()` — ligne 82

Appelle : `cleDeckNeuve()` *(decks.js)*, `clesDecks()` *(decks.js)*, `deckNeuf()` *(decks.js)*

Appelée par : `aAcheter`, `corpsBudget`, `decks.js (chargement)`, `dossierEnConfig`, `entete.js (chargement)`, `gestesDecks`, `ligneCatalogue`, `ligneCausesCollection`, `openWantsModal`, `reinitRestrictions`, `renderTop`, `restrictionsDuDeck`

### `nomDeckLibre()` — ligne 107

N'appelle aucune fonction du projet.

Appelée par : `creerDeck`, `renommerDeck`

### `creerDeck()` — ligne 117

Appelle : `cleDeckNeuve()` *(decks.js)*, `deckNeuf()` *(decks.js)*, `nomDeckLibre()` *(decks.js)*

Appelée par : `dupliquerDeck`, `gestesDecks`

### `activerDeck()` — ligne 126

Appelle : `degeleSuggestions()` *(sugOrdre.js)*, `invaliderAchats()` *(achats.js)*, `invaliderCandidats()` *(candidats.js)*, `recalculerAvecProgression()` *(recalcul.js)*, `renderAll()` *(rendu.js)*

Appelée par : `gestesDecks`

### `renommerDeck()` — ligne 137

Appelle : `nomDeckLibre()` *(decks.js)*

Appelée par : `appliquerDeck`

### `dupliquerDeck()` — ligne 148

Appelle : `creerDeck()` *(decks.js)*

Appelée par : `gestesDecks`

### `supprimerDeck()` — ligne 158

Appelle : `clesDecks()` *(decks.js)*, `degeleSuggestions()` *(sugOrdre.js)*, `invaliderAchats()` *(achats.js)*, `invaliderCandidats()` *(candidats.js)*

Appelée par : `gestesDecks`

### `carteDansUnDeck()` — ligne 172

N'appelle aucune fonction du projet.

Appelée par : `snapshot`

### `bilanDeck()` — ligne 180

Appelle : `quantiteCollection()` *(achats.js)*

Appelée par : `gestesDecks`, `vignetteDeck`

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

Appelée par : `ficheHTML`, `valeursCarte`

### `archetypesAChargerEdhrec()` — ligne 107

Appelle : `archetypesFiltre()` *(archetypesSets.js)*, `restrictionsDuDeck()` *(restrictions.js)*

Appelée par : `chargerArchetypesEdhrec`, `gestesVue`

### `archetypesFiltre()` — ligne 115

N'appelle aucune fonction du projet.

Appelée par : `archetypesAChargerEdhrec`, `basculerArchetype`, `corpsFiltres`, `filtresActifs`, `filtresValeursOK`, `listeArchetypesHTML`

### `basculerArchetype()` — ligne 120

Appelle : `archetypesFiltre()` *(archetypesSets.js)*

Appelée par : `gestesVue`

### `setsFiltre()` — ligne 128

N'appelle aucune fonction du projet.

Appelée par : `basculerSet`, `corpsFiltres`, `filtresActifs`, `filtresValeursOK`, `listeSetsHTML`, `setsACharger`

### `basculerSet()` — ligne 133

Appelle : `setsFiltre()` *(archetypesSets.js)*

Appelée par : `gestesVue`

### `libelleSet()` — ligne 142

N'appelle aucune fonction du projet.

Appelée par : `corpsFiltres`, `filtresActifs`

### `setsACharger()` — ligne 149

Appelle : `restrictionsDuDeck()` *(restrictions.js)*, `setsFiltre()` *(archetypesSets.js)*

Appelée par : `gestesVue`

### `setsCarte()` — ligne 159

Appelle : `frontFace()` *(cartes.js)*, `norm()` *(cartes.js)*

Appelée par : `valeursCarte`

## js/filtres.js

### `rolesFiltre()` — ligne 11

N'appelle aucune fonction du projet.

Appelée par : `basculerRole`, `corpsDeck`, `corpsFiltres`, `filtresActifs`, `gauge`, `gestesDeckConfig`, `roleOK`

### `basculerRole()` — ligne 16

Appelle : `rolesFiltre()` *(filtres.js)*

Appelée par : `gestesReglages`

### `roleOK()` — ligne 24

Appelle : `rolesFiltre()` *(filtres.js)*

Appelée par : `carteFiltree`, `causesCollection`, `restrictionOK`

### `nombreFiltre()` — ligne 30

N'appelle aucune fonction du projet.

Appelée par : `filtresActifs`, `filtresValeursOK`

### `reinitFiltres()` — ligne 36

N'appelle aucune fonction du projet.

Appelée par : `gestesReglages`

### `majFiltre()` — ligne 41

N'appelle aucune fonction du projet.

Appelée par : `app.js (chargement)`, `effacerFiltre`

### `effacerFiltre()` — ligne 46

Appelle : `majFiltre()` *(filtres.js)*

Appelée par : `gestesVue`

### `filtresActifs()` — ligne 52

Appelle : `archetypesFiltre()` *(archetypesSets.js)*, `nombreFiltre()` *(filtres.js)*, `rolesFiltre()` *(filtres.js)*, `setsFiltre()` *(archetypesSets.js)*, → `libelleArchetype()` *(archetypesSets.js)*, → `libelleSet()` *(archetypesSets.js)*

Appelée par : `ligneCausesCollection`, `renderB`, `renderTop`, `restrictionsActives`, `resumeDeckConfig`, `resumeFiltres`, `texteFiltresActifs`, `vignetteDeck`

### `texteFiltresActifs()` — ligne 84

Appelle : `filtresActifs()` *(filtres.js)*

Appelée par : `ligneCausesCollection`, `renderTop`, `resumeFiltres`

### `carteFiltree()` — ligne 91

Appelle : `colorOK()` *(collection.js)*, `filtreOK()` *(retenue.js)*, `roleOK()` *(filtres.js)*

Appelée par : `blocAnnexe`, `carteFiltreeEtRestreinte`, `renderE`

### `carteFiltreeEtRestreinte()` — ligne 99

Appelle : `carteFiltree()` *(filtres.js)*, `restrictionOK()` *(restrictions.js)*

Appelée par : `carteRetenue`

### `valeurFiltre()` — ligne 106

N'appelle aucune fonction du projet.

Appelée par : `filtresValeursOK`

### `motsFiltre()` — ligne 120

N'appelle aucune fonction du projet.

Appelée par : `filtresValeursOK`

### `filtresValeursOK()` — ligne 127

Appelle : `archetypesFiltre()` *(archetypesSets.js)*, `motsFiltre()` *(filtres.js)*, `nombreFiltre()` *(filtres.js)*, `setsFiltre()` *(archetypesSets.js)*, `valeurFiltre()` *(filtres.js)*, → `loose()` *(cartes.js)*, → `norm()` *(cartes.js)*

Appelée par : `filtreOK`, `filtreOKRec`, `restrictionOK`, `restrictionOKRec`

## js/restrictions.js

### `restrictionsDuDeck()` — ligne 20

Appelle : `deckCourant()` *(decks.js)*

Appelée par : `archetypesAChargerEdhrec`, `couleursRestriction`, `couleursRestrictionOK`, `gestesDeckConfig`, `majRestriction`, `restrictionOK`, `restrictionOKRec`, `restrictionsActives`, `setsACharger`, `signatureCandidats`

### `couleursRestriction()` — ligne 30

Appelle : `find()` *(cartes.js)*, `restrictionsDuDeck()` *(restrictions.js)*

Appelée par : `corpsDeck`, `couleursRestrictionOK`, `restrictionOKRec`, `restrictionsActives`, `resumeDeckConfig`

### `couleursRestrictionOK()` — ligne 43

Appelle : `couleursOK()` *(collection.js)*, `couleursRestriction()` *(restrictions.js)*, `restrictionsDuDeck()` *(restrictions.js)*

Appelée par : `restrictionOK`

### `restrictionOK()` — ligne 51

Appelle : `couleursRestrictionOK()` *(restrictions.js)*, `filtresValeursOK()` *(filtres.js)*, `restrictionsDuDeck()` *(restrictions.js)*, `roleOK()` *(filtres.js)*, `valeursCarte()` *(retenue.js)*

Appelée par : `carteFiltreeEtRestreinte`, `cartesHorsRestriction`, `causesCollection`

### `restrictionOKRec()` — ligne 61

Appelle : `couleursOK()` *(collection.js)*, `couleursRestriction()` *(restrictions.js)*, `filtresValeursOK()` *(filtres.js)*, `restrictionsDuDeck()` *(restrictions.js)*, `valeursRec()` *(retenue.js)*

Appelée par : `selectionCandidats`

### `restrictionPosee()` — ligne 74

Appelle : `restrictionsActives()` *(restrictions.js)*

Appelée par : `cartesHorsRestriction`

### `restrictionsActives()` — ligne 81

Appelle : `couleursRestriction()` *(restrictions.js)*, `filtresActifs()` *(filtres.js)*, `nomCombinaisonCouleurs()` *(couleurs.js)*, `restrictionsDuDeck()` *(restrictions.js)*

Appelée par : `renderTop`, `restrictionPosee`, `texteRestrictionsActives`, `vignetteDeck`

### `texteRestrictionsActives()` — ligne 95

Appelle : `restrictionsActives()` *(restrictions.js)*

Appelée par : `legality`, `ligneCausesCollection`

### `cartesHorsRestriction()` — ligne 102

Appelle : `deckEntries()` *(deck.js)*, `restrictionOK()` *(restrictions.js)*, `restrictionPosee()` *(restrictions.js)*

Appelée par : `legality`

### `poseCouleursCommandant()` — ligne 110

Appelle : `find()` *(cartes.js)*

### `majRestriction()` — ligne 121

Appelle : `restrictionsDuDeck()` *(restrictions.js)*

Appelée par : `saisieDeck`

### `reinitRestrictions()` — ligne 125

Appelle : `deckCourant()` *(decks.js)*

Appelée par : `gestesDecks`

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

Appelle : `carteFiltreeEtRestreinte()` *(filtres.js)*, `legaliteOK()` *(retenue.js)*

Appelée par : `filtered`, `ordonneSuggestions`

### `valeursCarte()` — ligne 76

Appelle : `archetypesCarte()` *(archetypesSets.js)*, `mainType()` *(cartes.js)*, `setsCarte()` *(archetypesSets.js)*

Appelée par : `filtreOK`, `restrictionOK`

### `filtreOK()` — ligne 89

Appelle : `filtresValeursOK()` *(filtres.js)*, `valeursCarte()` *(retenue.js)*

Appelée par : `carteFiltree`, `causesCollection`

### `setsRec()` — ligne 96

Appelle : `frontFace()` *(cartes.js)*, `norm()` *(cartes.js)*

Appelée par : `valeursRec`

### `filtreOKRec()` — ligne 111

Appelle : `filtresValeursOK()` *(filtres.js)*, `valeursRec()` *(retenue.js)*

Appelée par : `selectionCandidats`

### `valeursRec()` — ligne 117

Appelle : `frontFace()` *(cartes.js)*, `mainType()` *(cartes.js)*, `norm()` *(cartes.js)*, `setsRec()` *(retenue.js)*

Appelée par : `filtreOKRec`, `restrictionOKRec`

## js/catalogueEtat.js

### `catalogueAbsent()` — ligne 26

N'appelle aucune fonction du projet.

Appelée par : `demarrerCatalogue`, `indexArchive`, `majCatalogue`

### `noeudsActifs()` — ligne 30

N'appelle aucune fonction du projet.

Appelée par : `blocGraphe`, `chercheCartes`, `ligneCatalogue`, `noteCarte`, `renderD`, `renderG`, `selectionCandidats`, `signatureCandidats`, `vivierSuggestions`

### `carteTouche()` — ligne 34

N'appelle aucune fonction du projet.

Appelée par : `chercheCartes`, `noteCarte`, `recToucheNoeuds`, `renderD`, `vivierSuggestions`

### `getCardOrAnalyzedRec()` — ligne 46

Appelle : `appliqueChampsJeu()` *(champsJeu.js)*, `buildCard()` *(cartes.js)*, `champsJeuRec()` *(champsJeu.js)*, `find()` *(cartes.js)*, `ordonneMana()` *(mana.js)*

Appelée par : `chercheCartes`, `recToucheNoeuds`

### `recToucheNoeuds()` — ligne 66

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

### `scoreEntree()` — ligne 167

N'appelle aucune fonction du projet.

Appelée par : `groupes.js (chargement)`

### `notesCollectionAJour()` — ligne 186

Appelle : `signatureSuggestions()` *(vivier.js)*

Appelée par : `notesCollection`

### `notesCollection()` — ligne 190

Appelle : `contexteEvaluation()` *(notation.js)*, `noteCarte()` *(notation.js)*, `notesCollectionAJour()` *(groupes.js)*, `signatureSuggestions()` *(vivier.js)*

Appelée par : `filtered`

### `groupeCartes()` — ligne 211

N'appelle aucune fonction du projet.

Appelée par : `blocAnnexe`, `blocEdhrec`, `blocGraphe`, `gestesReglages`, `listeSuggestions`, `renderB`, `renderE`

## js/barreGroupes.js

### `clePli()` — ligne 20

N'appelle aucune fonction du projet.

Appelée par : `enveloppeGroupe`, `groupePlie`

### `groupePlie()` — ligne 24

Appelle : `clePli()` *(barreGroupes.js)*

Appelée par : `renderB`, `visuelsGroupes`

### `enveloppeGroupe()` — ligne 35

Appelle : `clePli()` *(barreGroupes.js)*, `esc()` *(outils.js)*

Appelée par : `listesSug`, `rendGroupes`

### `rendGroupes()` — ligne 58

Appelle : `enveloppeGroupe()` *(barreGroupes.js)*

Appelée par : `blocAnnexe`, `renderB`, `renderE`

### `noteMultiple()` — ligne 74

N'appelle aucune fonction du projet.

Appelée par : `blocEdhrec`, `blocGraphe`, `listeSuggestions`, `renderB`, `renderE`

### `colonnesDe()` — ligne 97

N'appelle aucune fonction du projet.

Appelée par : `appliquerAffichage`, `corpsAffichage`, `openAffichageModal`, `ouvreGrille`, `resumeAffichage`

### `ouvreGrille()` — ligne 106

Appelle : `colonnesDe()` *(barreGroupes.js)*

Appelée par : `blocAnnexe`, `corpsSug`, `renderB`, `renderE`

### `vueDe()` — ligne 114

N'appelle aucune fonction du projet.

Appelée par : `appliquerAffichage`, `blocAnnexe`, `corpsAffichage`, `corpsSug`, `renderB`, `renderE`, `resumeAffichage`

## js/marche.js

### `cmLink()` — ligne 27

N'appelle aucune fonction du projet.

Appelée par : `blocAchats`, `ligneAchats`, `ligneWishlist`, `openCardModal`

### `multiplicateurAchat()` — ligne 37

N'appelle aucune fonction du projet.

Appelée par : `cmEstimate`, `coutDeck`, `prixBrutMax`, `wishlist`

### `prixBrutMax()` — ligne 44

Appelle : `multiplicateurAchat()` *(marche.js)*

Appelée par : `selectionCandidats`

### `cmEstimate()` — ligne 48

Appelle : `multiplicateurAchat()` *(marche.js)*

Appelée par : `addToDeck`, `bestOffer`

### `bestOffer()` — ligne 54

Appelle : `cmEstimate()` *(marche.js)*

Appelée par : `aAcheter`, `buyCard`, `ficheHTML`, `ligneCatalogue`, `openCardModal`, `vivierSuggestions`

## js/achats.js

### `quantiteCollection()` — ligne 19

Appelle : `find()` *(cartes.js)*

Appelée par : `aAcheter`, `bilanDeck`, `coutDeck`, `wishlist`

### `nomCanonique()` — ligne 29

Appelle : `find()` *(cartes.js)*

Appelée par : `demandesTousDecks`

### `aAcheter()` — ligne 37

Appelle : `bestOffer()` *(marche.js)*, `deckCourant()` *(decks.js)*, `find()` *(cartes.js)*, `quantiteCollection()` *(achats.js)*

Appelée par : `blocAchats`, `ligneAchats`, `openWantsModal`, `renderE`, `spent`

### `spent()` — ligne 54

Appelle : `aAcheter()` *(achats.js)*

Appelée par : `buyCard`, `legality`, `ligneBudget`, `ligneCatalogue`, `openImport`, `renderE`, `renderTop`, `vivierSuggestions`

### `demandesTousDecks()` — ligne 68

Appelle : `clesDecks()` *(decks.js)*, `find()` *(cartes.js)*, `nomCanonique()` *(achats.js)*

Appelée par : `wishlist`

### `invaliderAchats()` — ligne 86

N'appelle aucune fonction du projet.

Appelée par : `activerDeck`, `appliquerDeck`, `saisieBudget`, `supprimerDeck`

### `signatureAchats()` — ligne 93

Appelle : `clesDecks()` *(decks.js)*

Appelée par : `wishlist`

### `wishlist()` — ligne 106

Appelle : `demandesTousDecks()` *(achats.js)*, `find()` *(cartes.js)*, `multiplicateurAchat()` *(marche.js)*, `quantiteCollection()` *(achats.js)*, `signatureAchats()` *(achats.js)*

Appelée par : `bilanWishlist`, `openWantsModal`, `renderJ`

### `bilanWishlist()` — ligne 133

Appelle : `clesDecks()` *(decks.js)*, `wishlist()` *(achats.js)*

Appelée par : `renderJ`

## js/oracleTexte.js

### `nombreOracle()` — ligne 20

N'appelle aucune fonction du projet.

Appelée par : `lisEntree`, `lisQuantite`, `lisReference`, `morceauCout`, `oracleCibles.js (chargement)`, `oracleEffetsA.js (chargement)`, `oracleEffetsB.js (chargement)`

### `echappeRegex()` — ligne 33

N'appelle aucune fonction du projet.

Appelée par : `normaliseOracle`

### `normaliseOracle()` — ligne 38

Appelle : `echappeRegex()` *(oracleTexte.js)*

Appelée par : `compileDefinition`

### `phrasesOracle()` — ligne 64

N'appelle aucune fonction du projet.

Appelée par : `compileEffet`

### `propositionsOracle()` — ligne 92

N'appelle aucune fonction du projet.

Appelée par : `compileEffet`

### `faceJouee()` — ligne 100

N'appelle aucune fonction du projet.

Appelée par : `compileDefinition`, `couverture`

### `lisTypeLigne()` — ligne 110

N'appelle aucune fonction du projet.

Appelée par : `compileDefinition`

## js/oracleMotsCles.js

### `masqueMots()` — ligne 32

N'appelle aucune fonction du projet.

Appelée par : `oracleEffetsB.js (chargement)`, `oracleStatiques.js (chargement)`

### `motCleSeul()` — ligne 44

Appelle : `coutMana()` *(oracleCouts.js)*

Appelée par : `ligneMotsCles`

### `ligneMotsCles()` — ligne 61

Appelle : `motCleSeul()` *(oracleMotsCles.js)*

Appelée par : `compileLigne`

## js/oracleCouts.js

### `coutMana()` — ligne 15

N'appelle aucune fonction du projet.

Appelée par : `compileDefinition`, `compileProposition`, `morceauCout`, `motCleSeul`

### `coutManaVide()` — ligne 36

N'appelle aucune fonction du projet.

Appelée par : `capacitesImplicites`, `compileDefinition`, `coutActivation`

### `morceauCout()` — ligne 42

Appelle : `coutMana()` *(oracleCouts.js)*, `lisDescripteur()` *(oracleCibles.js)*, `nombreOracle()` *(oracleTexte.js)*

Appelée par : `coutActivation`

### `coutActivation()` — ligne 71

Appelle : `coutManaVide()` *(oracleCouts.js)*, `morceauCout()` *(oracleCouts.js)*

Appelée par : `compileActivee`, `compileLigne`

## js/oracleCibles.js

### `chargement du module`

Appelle : `nombreOracle()` *(oracleTexte.js)*

### `singulier()` — ligne 27

N'appelle aucune fonction du projet.

Appelée par : `lisDescripteur`

### `descVide()` — ligne 34

N'appelle aucune fonction du projet.

Appelée par : `lisDescripteur`

### `adjectifDesc()` — ligne 57

N'appelle aucune fonction du projet.

Appelée par : `lisDescripteur`

### `lisDescripteur()` — ligne 85

Appelle : `adjectifDesc()` *(oracleCibles.js)*, `descVide()` *(oracleCibles.js)*, `singulier()` *(oracleCibles.js)*

Appelée par : `compileLigne`, `compileProposition`, `lisEntree`, `lisQuantite`, `lisReference`, `morceauCout`, `oracleDeclencheurs.js (chargement)`, `oracleEffetsA.js (chargement)`, `oracleEffetsB.js (chargement)`, `oracleStatiques.js (chargement)`, `sujetDecl`

### `lisReference()` — ligne 127

Appelle : `lisDescripteur()` *(oracleCibles.js)*, `nombreOracle()` *(oracleTexte.js)*

Appelée par : `compileProposition`, `oracleEffetsA.js (chargement)`, `oracleEffetsB.js (chargement)`

### `contexteOracle()` — ligne 165

N'appelle aucune fonction du projet.

Appelée par : `compileActivee`, `compileDeclenchee`, `compileEffetModal`, `compileLignes`

## js/oracleEffetsA.js

### `chargement du module`

Appelle : `lisDescripteur()` *(oracleCibles.js)*, `lisQuantite()` *(oracleEffetsA.js)*, `lisReference()` *(oracleCibles.js)*, `lisSource()` *(oracleEffetsA.js)*, `motif()` *(oracleEffetsA.js)*, `nombreOracle()` *(oracleTexte.js)*

### `lisQuantite()` — ligne 18

Appelle : `lisDescripteur()` *(oracleCibles.js)*, `nombreOracle()` *(oracleTexte.js)*

Appelée par : `compileEffet`, `lisSigne`, `oracleEffetsA.js (chargement)`, `oracleEffetsB.js (chargement)`

### `lisSource()` — ligne 36

N'appelle aucune fonction du projet.

Appelée par : `oracleEffetsA.js (chargement)`

### `motif()` — ligne 43

N'appelle aucune fonction du projet.

Appelée par : `oracleEffetsA.js (chargement)`, `oracleEffetsB.js (chargement)`

## js/oracleEffetsB.js

### `chargement du module`

Appelle : `compileProposition()` *(oracleEffetsB.js)*, `lisDescripteur()` *(oracleCibles.js)*, `lisQuantite()` *(oracleEffetsA.js)*, `lisReference()` *(oracleCibles.js)*, `lisSigne()` *(oracleEffetsB.js)*, `masqueMots()` *(oracleMotsCles.js)*, `motif()` *(oracleEffetsA.js)*, `nombreOracle()` *(oracleTexte.js)*

### `lisSigne()` — ligne 19

Appelle : `lisQuantite()` *(oracleEffetsA.js)*

Appelée par : `oracleEffetsB.js (chargement)`

### `compileProposition()` — ligne 129

Appelle : `compileEffet()` *(oracleEffetsB.js)*, `coutMana()` *(oracleCouts.js)*, `lisDescripteur()` *(oracleCibles.js)*, `lisReference()` *(oracleCibles.js)*

Appelée par : `compileEffet`, `oracleEffetsB.js (chargement)`

### `remplaceX()` — ligne 170

N'appelle aucune fonction du projet.

Appelée par : `compileEffet`

### `compileEffet()` — ligne 180

Appelle : `compileProposition()` *(oracleEffetsB.js)*, `lisQuantite()` *(oracleEffetsA.js)*, `phrasesOracle()` *(oracleTexte.js)*, `propositionsOracle()` *(oracleTexte.js)*, `remplaceX()` *(oracleEffetsB.js)*

Appelée par : `compileEffetModal`, `compileProposition`

## js/oracleDeclencheurs.js

### `chargement du module`

Appelle : `declencheur()` *(oracleDeclencheurs.js)*, `lisDescripteur()` *(oracleCibles.js)*, `sujetDecl()` *(oracleDeclencheurs.js)*

### `declencheur()` — ligne 13

N'appelle aucune fonction du projet.

Appelée par : `oracleDeclencheurs.js (chargement)`

### `sujetDecl()` — ligne 16

Appelle : `lisDescripteur()` *(oracleCibles.js)*

Appelée par : `oracleDeclencheurs.js (chargement)`

### `lisDeclencheur()` — ligne 71

N'appelle aucune fonction du projet.

Appelée par : `compileDeclenchee`

### `apportDecl()` — ligne 84

N'appelle aucune fonction du projet.

Appelée par : `compileDeclenchee`

## js/oracleStatiques.js

### `chargement du module`

Appelle : `bonusPT()` *(oracleStatiques.js)*, `lisDescripteur()` *(oracleCibles.js)*, `masqueMots()` *(oracleMotsCles.js)*, `statique()` *(oracleStatiques.js)*

### `statique()` — ligne 15

N'appelle aucune fonction du projet.

Appelée par : `oracleStatiques.js (chargement)`

### `bonusPT()` — ligne 18

N'appelle aucune fonction du projet.

Appelée par : `oracleStatiques.js (chargement)`

### `lisStatique()` — ligne 59

N'appelle aucune fonction du projet.

Appelée par : `compileLigne`

### `lisEntree()` — ligne 71

Appelle : `lisDescripteur()` *(oracleCibles.js)*, `nombreOracle()` *(oracleTexte.js)*

Appelée par : `compileLigne`

## js/oracleLignes.js

### `deuxPoints()` — ligne 16

N'appelle aucune fonction du projet.

Appelée par : `compileActivee`

### `compileEffetModal()` — ligne 27

Appelle : `compileEffet()` *(oracleEffetsB.js)*, `contexteOracle()` *(oracleCibles.js)*

Appelée par : `compileActivee`, `compileDeclenchee`, `compileLigne`

### `oteRythme()` — ligne 45

N'appelle aucune fonction du projet.

Appelée par : `compileActivee`, `compileDeclenchee`

### `compileDeclenchee()` — ligne 59

Appelle : `apportDecl()` *(oracleDeclencheurs.js)*, `compileEffetModal()` *(oracleLignes.js)*, `contexteOracle()` *(oracleCibles.js)*, `lisDeclencheur()` *(oracleDeclencheurs.js)*, `oteRythme()` *(oracleLignes.js)*

Appelée par : `compileLigne`

### `compileActivee()` — ligne 76

Appelle : `compileEffetModal()` *(oracleLignes.js)*, `contexteOracle()` *(oracleCibles.js)*, `coutActivation()` *(oracleCouts.js)*, `deuxPoints()` *(oracleLignes.js)*, `oteRythme()` *(oracleLignes.js)*

Appelée par : `compileLigne`

### `compileLigne()` — ligne 101

Appelle : `compileActivee()` *(oracleLignes.js)*, `compileDeclenchee()` *(oracleLignes.js)*, `compileEffetModal()` *(oracleLignes.js)*, `coutActivation()` *(oracleCouts.js)*, `ligneMotsCles()` *(oracleMotsCles.js)*, `lisDescripteur()` *(oracleCibles.js)*, `lisEntree()` *(oracleStatiques.js)*, `lisStatique()` *(oracleStatiques.js)*

Appelée par : `compileLignes`

### `compileLignes()` — ligne 131

Appelle : `compileLigne()` *(oracleLignes.js)*, `contexteOracle()` *(oracleCibles.js)*

Appelée par : `compileDefinition`

## js/definitions.js

### `empreinte()` — ligne 24

N'appelle aucune fonction du projet.

Appelée par : `definitionDe`, `signatureAdversaire`, `signatureComportements`, `signatureDeck`

### `nombreFiche()` — ligne 39

N'appelle aucune fonction du projet.

Appelée par : `compileDefinition`

### `couleursDe()` — ligne 42

N'appelle aucune fonction du projet.

Appelée par : `compileDefinition`

### `verseLigne()` — ligne 48

N'appelle aucune fonction du projet.

Appelée par : `compileDefinition`

### `etatLigne()` — ligne 72

N'appelle aucune fonction du projet.

Appelée par : `couverture`

### `capacitesImplicites()` — ligne 82

Appelle : `coutManaVide()` *(oracleCouts.js)*

Appelée par : `compileDefinition`

### `compileDefinition()` — ligne 92

Appelle : `capacitesImplicites()` *(definitions.js)*, `compileLignes()` *(oracleLignes.js)*, `couleursDe()` *(definitions.js)*, `coutMana()` *(oracleCouts.js)*, `coutManaVide()` *(oracleCouts.js)*, `couverture()` *(definitions.js)*, `faceJouee()` *(oracleTexte.js)*, `lisTypeLigne()` *(oracleTexte.js)*, `nombreFiche()` *(definitions.js)*, `normaliseOracle()` *(oracleTexte.js)*, `verseLigne()` *(definitions.js)*

Appelée par : `definitionDe`, `lectureHTML`

### `couverture()` — ligne 126

Appelle : `etatLigne()` *(definitions.js)*, `faceJouee()` *(oracleTexte.js)*

Appelée par : `compileDefinition`

### `definitionDe()` — ligne 145

Appelle : `compileDefinition()` *(definitions.js)*, `empreinte()` *(definitions.js)*

Appelée par : `definitionJeton`, `siegeDepuisListe`

### `definitionJeton()` — ligne 155

Appelle : `definitionDe()` *(definitions.js)*

Appelée par : `jeuOpsB.js (chargement)`, `scoreEffet`

## js/jeuHasard.js

### `brasse()` — ligne 13

N'appelle aucune fonction du projet.

Appelée par : `agentIA`, `graineDePartie`

### `etatHasard()` — ligne 22

Appelle : `tireHasard()` *(jeuHasard.js)*

Appelée par : `agentIA`, `nouvellePartie`

### `tireHasard()` — ligne 29

N'appelle aucune fonction du projet.

Appelée par : `entierHasard`, `etatHasard`

### `entierHasard()` — ligne 42

Appelle : `tireHasard()` *(jeuHasard.js)*

Appelée par : `melangeHasard`

### `melangeHasard()` — ligne 45

Appelle : `entierHasard()` *(jeuHasard.js)*

Appelée par : `jeuOpsB.js (chargement)`, `mulligans`, `partie`

## js/jeuEtat.js

### `nouvellePartie()` — ligne 18

Appelle : `creeObjet()` *(jeuEtat.js)*, `etatHasard()` *(jeuHasard.js)*, `nouvelleCarte()` *(jeuEtat.js)*

Appelée par : `creePartie`

### `nouvelleCarte()` — ligne 48

N'appelle aucune fonction du projet.

Appelée par : `jeuOpsB.js (chargement)`, `nouvellePartie`

### `creeObjet()` — ligne 53

N'appelle aucune fonction du projet.

Appelée par : `deplace`, `jeuOpsB.js (chargement)`, `nouvellePartie`

### `obj()` — ligne 62

N'appelle aucune fonction du projet.

Appelée par : `actionsLegales`, `actionsPossibles`, `activeCapacite`, `appliqueSBA`, `champDe`, `cibleEncoreLegale`, `ciblesLegales`, `collecteDeclencheurs`, `compteObjets`, `coutDeGarde`, `declareAttaquants`, `declareBloqueurs`, `defenseurDe`, `degagement`, `degatsCombat`, `deplace`, `ecouteRepond`, `elimine`, `equipe`, `estAMoi`, `iaAttaquants`, `iaBloqueurs`, `iaCartes`, `iaCibles`, `iaPriorite`, `iaReponse`, `iaScrute`, `initiativeEnJeu`, `jeuOpsB.js (chargement)`, `lanceSort`, `meilleureCibleHostile`, `metEnJeu`, `mulligans`, `nettoyage`, `nomObj`, `paieAutre`, `paieMana`, `passeOuPresent`, `piocheN`, `prepareDeclencheur`, `resoudre`, `resous`, `sacrifie`, `scoreEffet`, `scoreTerrain`, `sourceCtx`, `sourcesMana`, `statiquesEnJeu`, `terrainsEnMain`, `utiliteEnMain`

### `suit()` — ligne 66

N'appelle aucune fonction du projet.

Appelée par : `passeOuPresent`, `resous`, `sourceCtx`

### `tableauZone()` — ligne 74

N'appelle aucune fonction du projet.

Appelée par : `deplace`

### `retireDe()` — ligne 80

N'appelle aucune fonction du projet.

Appelée par : `deplace`, `elimine`, `jeuOpsB.js (chargement)`, `mulligans`

### `instantane()` — ligne 87

Appelle : `car()` *(jeuCaracteristiques.js)*

Appelée par : `deplace`, `paieAutre`, `sacrifie`

### `deplace()` — ligne 97

Appelle : `creeObjet()` *(jeuEtat.js)*, `emet()` *(jeuEtat.js)*, `instantane()` *(jeuEtat.js)*, `obj()` *(jeuEtat.js)*, `retireDe()` *(jeuEtat.js)*, `tableauZone()` *(jeuEtat.js)*

Appelée par : `appliqueSBA`, `elimine`, `jeuOpsA.js (chargement)`, `jeuOpsB.js (chargement)`, `lanceSort`, `metEnJeu`, `nettoyage`, `paieAutre`, `paieMana`, `resoudre`, `sacrifie`

### `emet()` — ligne 131

N'appelle aucune fonction du projet.

Appelée par : `declareAttaquants`, `declareBloqueurs`, `deplace`, `etape`, `gagneVie`, `infligeDegats`, `jeuOpsA.js (chargement)`, `jeuOpsB.js (chargement)`, `lanceSort`, `piocheN`, `sacrifie`

### `jn()` — ligne 135

N'appelle aucune fonction du projet.

Appelée par : `activeCapacite`, `declareAttaquants`, `elimine`, `infligeDegats`, `jeuOpsA.js (chargement)`, `jeuOpsB.js (chargement)`, `joueTerrain`, `lanceSort`, `mulligans`, `partie`, `resoudre`, `tour`

### `nomObj()` — ligne 137

Appelle : `obj()` *(jeuEtat.js)*

Appelée par : `declareAttaquants`, `joueTerrain`

### `vivants()` — ligne 142

N'appelle aucune fonction du projet.

Appelée par : `adversaires`, `elimine`, `priorite`

### `suivantVivant()` — ligne 145

N'appelle aucune fonction du projet.

Appelée par : `iaReponse`, `partie`, `priorite`

### `ordreApnap()` — ligne 154

N'appelle aucune fonction du projet.

Appelée par : `declareBloqueurs`, `mulligans`, `stabilise`

### `adversaires()` — ligne 163

Appelle : `vivants()` *(jeuEtat.js)*

Appelée par : `declareAttaquants`, `etat.js (chargement)`, `iaAttaquants`

### `champDe()` — ligne 166

Appelle : `obj()` *(jeuEtat.js)*

Appelée par : `actionsLegales`, `coutAutrePossible`, `declareAttaquants`, `declareBloqueurs`, `forceDeFrappe`, `iaAttaquants`, `iaCartes`, `iaReponse`, `iaScrute`, `impactSort`, `jeuOpsA.js (chargement)`, `jeuOpsB.js (chargement)`, `menace`, `metEnJeu`, `notePrincipale`, `paieAutre`, `utiliteEnMain`

### `piocheN()` — ligne 170

Appelle : `emet()` *(jeuEtat.js)*, `obj()` *(jeuEtat.js)*

Appelée par : `etape`, `jeuOpsA.js (chargement)`, `mulligans`

### `question()` — ligne 188

N'appelle aucune fonction du projet.

Appelée par : `activeCapacite`, `choisitCartes`, `choisitCibles`, `declareAttaquants`, `declareBloqueurs`, `jeuOpsA.js (chargement)`, `lanceSort`, `metEnJeu`, `mulligans`, `prepareEffets`, `priorite`, `proposePaiement`

## js/jeuCaracteristiques.js

### `statiquesEnJeu()` — ligne 16

Appelle : `obj()` *(jeuEtat.js)*

Appelée par : `car`, `coutSort`

### `statiqueVise()` — ligne 30

Appelle : `correspondBase()` *(jeuCibles.js)*

Appelée par : `car`

### `car()` — ligne 39

Appelle : `statiqueVise()` *(jeuCaracteristiques.js)*, `statiquesEnJeu()` *(jeuCaracteristiques.js)*

Appelée par : `aMot`, `appliqueSBA`, `caracsJugees`, `ciblable`, `coutDeGarde`, `declareBloqueurs`, `degatsCombat`, `forceDeFrappe`, `frappe`, `iaAttaquants`, `iaBloqueurs`, `iaCibles`, `infligeDegats`, `instantane`, `jeuOpsA.js (chargement)`, `meilleureCibleHostile`, `peutAttaquer`, `peutBloquer`, `repartition`, `tue`, `valeur`, `valeurObjet`

### `aMot()` — ligne 61

Appelle : `car()` *(jeuCaracteristiques.js)*

Appelée par : `declareAttaquants`, `declareBloqueurs`, `degatsCombat`, `iaBloqueurs`, `initiativeEnJeu`, `jeuOpsA.js (chargement)`, `peutAttaquer`, `peutEngagerSoi`, `repartition`

### `estType()` — ligne 62

N'appelle aucune fonction du projet.

Appelée par : `actionsLegales`, `appliqueSBA`, `declareAttaquants`, `iaCartes`, `iaScrute`, `infligeDegats`, `notePrincipale`, `sourcesMana`, `terrainsEnMain`, `utiliteEnMain`

### `estCreature()` — ligne 63

N'appelle aucune fonction du projet.

Appelée par : `actionsLegales`, `appliqueSBA`, `declareBloqueurs`, `forceDeFrappe`, `iaAttaquants`, `iaCibles`, `impactCapacite`, `impactSort`, `infligeDegats`, `meilleureCibleHostile`, `peutAttaquer`, `peutBloquer`, `peutEngagerSoi`, `sourcesMana`, `valeurObjet`

### `peutEngagerSoi()` — ligne 68

Appelle : `aMot()` *(jeuCaracteristiques.js)*, `estCreature()` *(jeuCaracteristiques.js)*

Appelée par : `coutAutrePossible`, `sourcesMana`

### `mvDe()` — ligne 75

N'appelle aucune fonction du projet.

Appelée par : `correspondObjet`, `valeur`

## js/jeuCibles.js

### `caracsJugees()` — ligne 13

Appelle : `car()` *(jeuCaracteristiques.js)*

Appelée par : `correspondObjet`, `infligeDegats`

### `etatCombat()` — ligne 23

N'appelle aucune fonction du projet.

Appelée par : `correspondObjet`

### `correspondObjet()` — ligne 33

Appelle : `caracsJugees()` *(jeuCibles.js)*, `etatCombat()` *(jeuCibles.js)*, `mvDe()` *(jeuCaracteristiques.js)*

Appelée par : `correspond`, `correspondBase`

### `correspond()` — ligne 74

Appelle : `correspondObjet()` *(jeuCibles.js)*

Appelée par : `cibleEncoreLegale`, `ciblesLegales`, `compteObjets`, `coutAutrePossible`, `ecouteRepond`, `jeuOpsA.js (chargement)`, `jeuOpsB.js (chargement)`, `paieAutre`, `resous`, `scoreEffet`

### `correspondBase()` — ligne 75

Appelle : `correspondObjet()` *(jeuCibles.js)*

Appelée par : `appliqueSBA`, `metEnJeu`, `statiqueVise`

### `joueurCorrespond()` — ligne 78

N'appelle aucune fonction du projet.

Appelée par : `cibleEncoreLegale`, `ciblesLegales`, `resous`

### `defCorrespond()` — ligne 87

N'appelle aucune fonction du projet.

Appelée par : `coutSort`, `ecouteRepond`, `rangDuSort`

### `ciblable()` — ligne 99

Appelle : `car()` *(jeuCaracteristiques.js)*

Appelée par : `cibleEncoreLegale`, `ciblesLegales`

### `ciblesLegales()` — ligne 110

Appelle : `ciblable()` *(jeuCibles.js)*, `correspond()` *(jeuCibles.js)*, `joueurCorrespond()` *(jeuCibles.js)*, `obj()` *(jeuEtat.js)*

Appelée par : `actionsLegales`, `choisitCibles`, `effetCiblable`, `meilleureCibleHostile`, `prepareEffets`

### `cibleEncoreLegale()` — ligne 137

Appelle : `ciblable()` *(jeuCibles.js)*, `correspond()` *(jeuCibles.js)*, `joueurCorrespond()` *(jeuCibles.js)*, `obj()` *(jeuEtat.js)*

Appelée par : `resoudre`

## js/jeuMana.js

### `sourcesMana()` — ligne 19

Appelle : `compteObjets()` *(jeuMana.js)*, `estCreature()` *(jeuCaracteristiques.js)*, `estType()` *(jeuCaracteristiques.js)*, `obj()` *(jeuEtat.js)*, `peutEngagerSoi()` *(jeuCaracteristiques.js)*

Appelée par : `manaDispo`, `planPaiement`, `scoreTerrain`

### `compteObjets()` — ligne 53

Appelle : `correspond()` *(jeuCibles.js)*, `obj()` *(jeuEtat.js)*

Appelée par : `executeOps`, `sourcesMana`, `valeur`

### `planPaiement()` — ligne 62

Appelle : `sourcesMana()` *(jeuMana.js)*

Appelée par : `actionsLegales`, `activeCapacite`, `lanceSort`, `maxX`, `paieMana`, `proposePaiement`

### `manaDispo()` — ligne 104

Appelle : `sourcesMana()` *(jeuMana.js)*

Appelée par : `iaOui`, `notePrincipale`, `scoreEffet`, `utiliteEnMain`

### `ajouteMana()` — ligne 109

N'appelle aucune fonction du projet.

Appelée par : `jeuOpsB.js (chargement)`, `paieMana`

### `debite()` — ligne 117

N'appelle aucune fonction du projet.

Appelée par : `paieMana`

### `paieMana()` — ligne 132

Appelle : `ajouteMana()` *(jeuMana.js)*, `debite()` *(jeuMana.js)*, `deplace()` *(jeuEtat.js)*, `obj()` *(jeuEtat.js)*, `planPaiement()` *(jeuMana.js)*

Appelée par : `activeCapacite`, `equipe`, `lanceSort`, `proposePaiement`

### `videReserves()` — ligne 151

N'appelle aucune fonction du projet.

Appelée par : `tour`

## js/jeuOpsA.js

### `chargement du module`

Appelle : `aMot()` *(jeuCaracteristiques.js)*, `car()` *(jeuCaracteristiques.js)*, `champDe()` *(jeuEtat.js)*, `choisitCartes()` *(jeuOpsA.js)*, `correspond()` *(jeuCibles.js)*, `deplace()` *(jeuEtat.js)*, `emet()` *(jeuEtat.js)*, `executeOps()` *(jeuOpsB.js)*, `gagneVie()` *(jeuOpsA.js)*, `infligeDegats()` *(jeuOpsA.js)*, `jn()` *(jeuEtat.js)*, `joueursDe()` *(jeuOpsA.js)*, `piocheN()` *(jeuEtat.js)*, `question()` *(jeuEtat.js)*, `resous()` *(jeuOpsA.js)*, `retireDeLaPile()` *(jeuPile.js)*, `sacrifie()` *(jeuOpsA.js)*, `sourceCtx()` *(jeuOpsA.js)*, `valeur()` *(jeuOpsA.js)*

### `sourceCtx()` — ligne 18

Appelle : `obj()` *(jeuEtat.js)*, `suit()` *(jeuEtat.js)*

Appelée par : `executeOps`, `jeuActions.js (chargement)`, `jeuOpsA.js (chargement)`, `jeuOpsB.js (chargement)`, `resous`, `valeur`

### `passeOuPresent()` — ligne 22

Appelle : `obj()` *(jeuEtat.js)*, `suit()` *(jeuEtat.js)*

Appelée par : `resous`

### `resous()` — ligne 27

Appelle : `correspond()` *(jeuCibles.js)*, `joueurCorrespond()` *(jeuCibles.js)*, `obj()` *(jeuEtat.js)*, `passeOuPresent()` *(jeuOpsA.js)*, `sourceCtx()` *(jeuOpsA.js)*, `suit()` *(jeuEtat.js)*

Appelée par : `jeuActions.js (chargement)`, `jeuOpsA.js (chargement)`, `jeuOpsB.js (chargement)`, `joueursDe`, `valeur`

### `joueursDe()` — ligne 61

Appelle : `resous()` *(jeuOpsA.js)*

Appelée par : `jeuOpsA.js (chargement)`, `jeuOpsB.js (chargement)`, `proposePaiement`

### `valeur()` — ligne 66

Appelle : `car()` *(jeuCaracteristiques.js)*, `compteObjets()` *(jeuMana.js)*, `mvDe()` *(jeuCaracteristiques.js)*, `resous()` *(jeuOpsA.js)*, `sourceCtx()` *(jeuOpsA.js)*

Appelée par : `jeuOpsA.js (chargement)`, `jeuOpsB.js (chargement)`

### `gagneVie()` — ligne 81

Appelle : `emet()` *(jeuEtat.js)*

Appelée par : `infligeDegats`, `jeuOpsA.js (chargement)`

### `infligeDegats()` — ligne 90

Appelle : `car()` *(jeuCaracteristiques.js)*, `caracsJugees()` *(jeuCibles.js)*, `emet()` *(jeuEtat.js)*, `estCreature()` *(jeuCaracteristiques.js)*, `estType()` *(jeuCaracteristiques.js)*, `gagneVie()` *(jeuOpsA.js)*, `jn()` *(jeuEtat.js)*

Appelée par : `degatsCombat`, `jeuOpsA.js (chargement)`

### `choisitCartes()` — ligne 117

Appelle : `question()` *(jeuEtat.js)*

Appelée par : `jeuOpsA.js (chargement)`, `jeuOpsB.js (chargement)`, `mulligans`, `nettoyage`, `paieAutre`

### `sacrifie()` — ligne 191

Appelle : `deplace()` *(jeuEtat.js)*, `emet()` *(jeuEtat.js)*, `instantane()` *(jeuEtat.js)*, `obj()` *(jeuEtat.js)*

Appelée par : `jeuOpsA.js (chargement)`, `paieAutre`

## js/jeuOpsB.js

### `chargement du module`

Appelle : `ajouteMana()` *(jeuMana.js)*, `champDe()` *(jeuEtat.js)*, `choisitCartes()` *(jeuOpsA.js)*, `correspond()` *(jeuCibles.js)*, `creeObjet()` *(jeuEtat.js)*, `definitionJeton()` *(definitions.js)*, `deplace()` *(jeuEtat.js)*, `emet()` *(jeuEtat.js)*, `jn()` *(jeuEtat.js)*, `joueursDe()` *(jeuOpsA.js)*, `melangeHasard()` *(jeuHasard.js)*, `metEnJeu()` *(jeuOpsB.js)*, `nouvelleCarte()` *(jeuEtat.js)*, `obj()` *(jeuEtat.js)*, `resous()` *(jeuOpsA.js)*, `retireDe()` *(jeuEtat.js)*, `retireDeLaPile()` *(jeuPile.js)*, `sourceCtx()` *(jeuOpsA.js)*, `valeur()` *(jeuOpsA.js)*

### `metEnJeu()` — ligne 106

Appelle : `champDe()` *(jeuEtat.js)*, `correspondBase()` *(jeuCibles.js)*, `deplace()` *(jeuEtat.js)*, `obj()` *(jeuEtat.js)*, `question()` *(jeuEtat.js)*

Appelée par : `jeuOpsB.js (chargement)`, `joueTerrain`, `resoudre`

### `proposePaiement()` — ligne 129

Appelle : `joueursDe()` *(jeuOpsA.js)*, `paieMana()` *(jeuMana.js)*, `planPaiement()` *(jeuMana.js)*, `question()` *(jeuEtat.js)*

Appelée par : `executeOps`

### `executeOps()` — ligne 137

Appelle : `compteObjets()` *(jeuMana.js)*, `proposePaiement()` *(jeuOpsB.js)*, `sourceCtx()` *(jeuOpsA.js)*

Appelée par : `jeuOpsA.js (chargement)`, `resoudre`

## js/jeuDeclencheurs.js

### `ecoute()` — ligne 19

N'appelle aucune fonction du projet.

Appelée par : `collecteDeclencheurs`

### `quiConvient()` — ligne 25

N'appelle aucune fonction du projet.

Appelée par : `ecouteRepond`

### `rangDuSort()` — ligne 31

Appelle : `defCorrespond()` *(jeuCibles.js)*

Appelée par : `ecouteRepond`

### `ecouteRepond()` — ligne 36

Appelle : `correspond()` *(jeuCibles.js)*, `defCorrespond()` *(jeuCibles.js)*, `obj()` *(jeuEtat.js)*, `quiConvient()` *(jeuDeclencheurs.js)*, `rangDuSort()` *(jeuDeclencheurs.js)*

Appelée par : `collecteDeclencheurs`

### `collecteDeclencheurs()` — ligne 80

Appelle : `ecoute()` *(jeuDeclencheurs.js)*, `ecouteRepond()` *(jeuDeclencheurs.js)*, `obj()` *(jeuEtat.js)*

Appelée par : `nettoyage`, `stabilise`

### `declencheursDeLancement()` — ligne 110

N'appelle aucune fonction du projet.

Appelée par : `lanceSort`

## js/jeuEtatsDeJeu.js

### `elimine()` — ligne 13

Appelle : `deplace()` *(jeuEtat.js)*, `jn()` *(jeuEtat.js)*, `obj()` *(jeuEtat.js)*, `retireDe()` *(jeuEtat.js)*, `vivants()` *(jeuEtat.js)*

Appelée par : `appliqueSBA`

### `appliqueSBA()` — ligne 37

Appelle : `car()` *(jeuCaracteristiques.js)*, `correspondBase()` *(jeuCibles.js)*, `deplace()` *(jeuEtat.js)*, `elimine()` *(jeuEtatsDeJeu.js)*, `estCreature()` *(jeuCaracteristiques.js)*, `estType()` *(jeuCaracteristiques.js)*, `obj()` *(jeuEtat.js)*

Appelée par : `stabilise`

## js/jeuLancer.js

### `enPhasePrincipale()` — ligne 13

N'appelle aucune fonction du projet.

Appelée par : `actionsLegales`, `actionsPossibles`, `iaPriorite`

### `estEphemere()` — ligne 17

N'appelle aucune fonction du projet.

Appelée par : `actionsLegales`, `actionsPossibles`

### `coutSort()` — ligne 25

Appelle : `defCorrespond()` *(jeuCibles.js)*, `statiquesEnJeu()` *(jeuCaracteristiques.js)*

Appelée par : `actionsLegales`, `lanceSort`

### `effetCiblable()` — ligne 39

Appelle : `ciblesLegales()` *(jeuCibles.js)*

Appelée par : `actionsLegales`

### `coutAutrePossible()` — ligne 46

Appelle : `champDe()` *(jeuEtat.js)*, `correspond()` *(jeuCibles.js)*, `peutEngagerSoi()` *(jeuCaracteristiques.js)*

Appelée par : `actionsLegales`, `activeCapacite`, `lanceSort`

### `actionsLegales()` — ligne 59

Appelle : `champDe()` *(jeuEtat.js)*, `ciblesLegales()` *(jeuCibles.js)*, `coutAutrePossible()` *(jeuLancer.js)*, `coutSort()` *(jeuLancer.js)*, `effetCiblable()` *(jeuLancer.js)*, `enPhasePrincipale()` *(jeuLancer.js)*, `estCreature()` *(jeuCaracteristiques.js)*, `estEphemere()` *(jeuLancer.js)*, `estType()` *(jeuCaracteristiques.js)*, `obj()` *(jeuEtat.js)*, `planPaiement()` *(jeuMana.js)*

Appelée par : `actionsPossibles`

### `actionsPossibles()` — ligne 102

Appelle : `actionsLegales()` *(jeuLancer.js)*, `enPhasePrincipale()` *(jeuLancer.js)*, `estEphemere()` *(jeuLancer.js)*, `obj()` *(jeuEtat.js)*

Appelée par : `priorite`

### `choisitCibles()` — ligne 113

Appelle : `ciblesLegales()` *(jeuCibles.js)*, `question()` *(jeuEtat.js)*

Appelée par : `equipe`, `lanceSort`, `prepareEffets`

### `prepareEffets()` — ligne 128

Appelle : `choisitCibles()` *(jeuLancer.js)*, `ciblesLegales()` *(jeuCibles.js)*, `question()` *(jeuEtat.js)*

Appelée par : `activeCapacite`, `lanceSort`, `prepareDeclencheur`

### `coutDeGarde()` — ligne 147

Appelle : `car()` *(jeuCaracteristiques.js)*, `obj()` *(jeuEtat.js)*

Appelée par : `lanceSort`

## js/jeuActions.js

### `chargement du module`

Appelle : `resous()` *(jeuOpsA.js)*, `sourceCtx()` *(jeuOpsA.js)*

### `paieAutre()` — ligne 13

Appelle : `champDe()` *(jeuEtat.js)*, `choisitCartes()` *(jeuOpsA.js)*, `correspond()` *(jeuCibles.js)*, `deplace()` *(jeuEtat.js)*, `instantane()` *(jeuEtat.js)*, `obj()` *(jeuEtat.js)*, `sacrifie()` *(jeuOpsA.js)*

Appelée par : `activeCapacite`, `lanceSort`

### `maxX()` — ligne 37

Appelle : `planPaiement()` *(jeuMana.js)*

Appelée par : `activeCapacite`, `lanceSort`

### `lanceSort()` — ligne 44

Appelle : `choisitCibles()` *(jeuLancer.js)*, `coutAutrePossible()` *(jeuLancer.js)*, `coutDeGarde()` *(jeuLancer.js)*, `coutSort()` *(jeuLancer.js)*, `declencheursDeLancement()` *(jeuDeclencheurs.js)*, `deplace()` *(jeuEtat.js)*, `emet()` *(jeuEtat.js)*, `jn()` *(jeuEtat.js)*, `maxX()` *(jeuActions.js)*, `obj()` *(jeuEtat.js)*, `paieAutre()` *(jeuActions.js)*, `paieMana()` *(jeuMana.js)*, `planPaiement()` *(jeuMana.js)*, `prepareEffets()` *(jeuLancer.js)*, `question()` *(jeuEtat.js)*

Appelée par : `executeAction`

### `activeCapacite()` — ligne 93

Appelle : `coutAutrePossible()` *(jeuLancer.js)*, `jn()` *(jeuEtat.js)*, `maxX()` *(jeuActions.js)*, `obj()` *(jeuEtat.js)*, `paieAutre()` *(jeuActions.js)*, `paieMana()` *(jeuMana.js)*, `planPaiement()` *(jeuMana.js)*, `prepareEffets()` *(jeuLancer.js)*, `question()` *(jeuEtat.js)*

Appelée par : `executeAction`

### `equipe()` — ligne 123

Appelle : `choisitCibles()` *(jeuLancer.js)*, `obj()` *(jeuEtat.js)*, `paieMana()` *(jeuMana.js)*

Appelée par : `executeAction`

### `joueTerrain()` — ligne 141

Appelle : `jn()` *(jeuEtat.js)*, `metEnJeu()` *(jeuOpsB.js)*, `nomObj()` *(jeuEtat.js)*

Appelée par : `executeAction`

### `executeAction()` — ligne 149

Appelle : `activeCapacite()` *(jeuActions.js)*, `equipe()` *(jeuActions.js)*, `joueTerrain()` *(jeuActions.js)*, `lanceSort()` *(jeuActions.js)*

Appelée par : `priorite`

## js/jeuPile.js

### `retireDeLaPile()` — ligne 16

N'appelle aucune fonction du projet.

Appelée par : `jeuOpsA.js (chargement)`, `jeuOpsB.js (chargement)`

### `prepareDeclencheur()` — ligne 23

Appelle : `obj()` *(jeuEtat.js)*, `prepareEffets()` *(jeuLancer.js)*

Appelée par : `stabilise`

### `stabilise()` — ligne 32

Appelle : `appliqueSBA()` *(jeuEtatsDeJeu.js)*, `collecteDeclencheurs()` *(jeuDeclencheurs.js)*, `ordreApnap()` *(jeuEtat.js)*, `prepareDeclencheur()` *(jeuPile.js)*

Appelée par : `priorite`

### `resoudre()` — ligne 52

Appelle : `cibleEncoreLegale()` *(jeuCibles.js)*, `deplace()` *(jeuEtat.js)*, `executeOps()` *(jeuOpsB.js)*, `jn()` *(jeuEtat.js)*, `metEnJeu()` *(jeuOpsB.js)*, `obj()` *(jeuEtat.js)*

Appelée par : `priorite`

### `priorite()` — ligne 88

Appelle : `actionsPossibles()` *(jeuLancer.js)*, `executeAction()` *(jeuActions.js)*, `question()` *(jeuEtat.js)*, `resoudre()` *(jeuPile.js)*, `stabilise()` *(jeuPile.js)*, `suivantVivant()` *(jeuEtat.js)*, `vivants()` *(jeuEtat.js)*

Appelée par : `degatsCombat`, `etape`, `nettoyage`

## js/jeuCombat.js

### `peutAttaquer()` — ligne 13

Appelle : `aMot()` *(jeuCaracteristiques.js)*, `car()` *(jeuCaracteristiques.js)*, `estCreature()` *(jeuCaracteristiques.js)*

Appelée par : `declareAttaquants`

### `peutBloquer()` — ligne 19

Appelle : `car()` *(jeuCaracteristiques.js)*, `estCreature()` *(jeuCaracteristiques.js)*

Appelée par : `declareBloqueurs`, `iaAttaquants`, `iaBloqueurs`

### `declareAttaquants()` — ligne 29

Appelle : `aMot()` *(jeuCaracteristiques.js)*, `adversaires()` *(jeuEtat.js)*, `champDe()` *(jeuEtat.js)*, `emet()` *(jeuEtat.js)*, `estType()` *(jeuCaracteristiques.js)*, `jn()` *(jeuEtat.js)*, `nomObj()` *(jeuEtat.js)*, `obj()` *(jeuEtat.js)*, `peutAttaquer()` *(jeuCombat.js)*, `question()` *(jeuEtat.js)*

Appelée par : `etape`

### `defenseurDe()` — ligne 51

Appelle : `obj()` *(jeuEtat.js)*

Appelée par : `declareBloqueurs`

### `declareBloqueurs()` — ligne 58

Appelle : `aMot()` *(jeuCaracteristiques.js)*, `car()` *(jeuCaracteristiques.js)*, `champDe()` *(jeuEtat.js)*, `defenseurDe()` *(jeuCombat.js)*, `emet()` *(jeuEtat.js)*, `estCreature()` *(jeuCaracteristiques.js)*, `obj()` *(jeuEtat.js)*, `ordreApnap()` *(jeuEtat.js)*, `peutBloquer()` *(jeuCombat.js)*, `question()` *(jeuEtat.js)*

Appelée par : `etape`

### `initiativeEnJeu()` — ligne 87

Appelle : `aMot()` *(jeuCaracteristiques.js)*, `obj()` *(jeuEtat.js)*

Appelée par : `etape`

### `frappe()` — ligne 93

Appelle : `car()` *(jeuCaracteristiques.js)*

Appelée par : `degatsCombat`

### `repartition()` — ligne 101

Appelle : `aMot()` *(jeuCaracteristiques.js)*, `car()` *(jeuCaracteristiques.js)*

Appelée par : `degatsCombat`

### `degatsCombat()` — ligne 119

Appelle : `aMot()` *(jeuCaracteristiques.js)*, `car()` *(jeuCaracteristiques.js)*, `frappe()` *(jeuCombat.js)*, `infligeDegats()` *(jeuOpsA.js)*, `obj()` *(jeuEtat.js)*, `priorite()` *(jeuPile.js)*, `repartition()` *(jeuCombat.js)*

Appelée par : `etape`

### `finCombat()` — ligne 146

N'appelle aucune fonction du projet.

Appelée par : `etape`

## js/jeuTour.js

### `degagement()` — ligne 20

Appelle : `obj()` *(jeuEtat.js)*

Appelée par : `etape`

### `nettoyage()` — ligne 31

Appelle : `choisitCartes()` *(jeuOpsA.js)*, `collecteDeclencheurs()` *(jeuDeclencheurs.js)*, `deplace()` *(jeuEtat.js)*, `obj()` *(jeuEtat.js)*, `priorite()` *(jeuPile.js)*

Appelée par : `etape`

### `etape()` — ligne 47

Appelle : `declareAttaquants()` *(jeuCombat.js)*, `declareBloqueurs()` *(jeuCombat.js)*, `degagement()` *(jeuTour.js)*, `degatsCombat()` *(jeuCombat.js)*, `emet()` *(jeuEtat.js)*, `finCombat()` *(jeuCombat.js)*, `initiativeEnJeu()` *(jeuCombat.js)*, `nettoyage()` *(jeuTour.js)*, `notePrincipale()` *(jeuTour.js)*, `piocheN()` *(jeuEtat.js)*, `priorite()` *(jeuPile.js)*

Appelée par : `tour`

### `notePrincipale()` — ligne 79

Appelle : `champDe()` *(jeuEtat.js)*, `estType()` *(jeuCaracteristiques.js)*, `manaDispo()` *(jeuMana.js)*

Appelée par : `etape`

### `tour()` — ligne 86

Appelle : `etape()` *(jeuTour.js)*, `jn()` *(jeuEtat.js)*, `videReserves()` *(jeuMana.js)*

Appelée par : `partie`

## js/jeuPartie.js

### `mulligans()` — ligne 12

Appelle : `choisitCartes()` *(jeuOpsA.js)*, `jn()` *(jeuEtat.js)*, `melangeHasard()` *(jeuHasard.js)*, `obj()` *(jeuEtat.js)*, `ordreApnap()` *(jeuEtat.js)*, `piocheN()` *(jeuEtat.js)*, `question()` *(jeuEtat.js)*, `retireDe()` *(jeuEtat.js)*

Appelée par : `partie`

### `partie()` — ligne 45

Appelle : `jn()` *(jeuEtat.js)*, `melangeHasard()` *(jeuHasard.js)*, `mulligans()` *(jeuPartie.js)*, `suivantVivant()` *(jeuEtat.js)*, `tour()` *(jeuTour.js)*

Appelée par : `creePartie`

## js/jeuPilote.js

### `creePartie()` — ligne 13

Appelle : `nouvellePartie()` *(jeuEtat.js)*, `partie()` *(jeuPartie.js)*

Appelée par : `joueJusquauBout`, `lanceSimulation`

### `valideReponse()` — ligne 21

N'appelle aucune fonction du projet.

Appelée par : `avance`, `repondre`

### `avance()` — ligne 39

Appelle : `valideReponse()` *(jeuPilote.js)*

Appelée par : `joueJusquauBout`, `lanceSimulation`, `nouveauSuivi`, `repondre`

### `repondre()` — ligne 62

Appelle : `avance()` *(jeuPilote.js)*, `valideReponse()` *(jeuPilote.js)*

### `joueJusquauBout()` — ligne 71

Appelle : `avance()` *(jeuPilote.js)*, `creePartie()` *(jeuPilote.js)*

Appelée par : `rejouePartie`

## js/iaValeur.js

### `primeMots()` — ligne 15

N'appelle aucune fonction du projet.

Appelée par : `valeurDef`, `valeurObjet`

### `valeurDef()` — ligne 18

Appelle : `primeMots()` *(iaValeur.js)*

Appelée par : `iaCartes`, `iaCibles`, `iaReponse`, `impactSort`, `meilleureCibleHostile`, `scoreEffet`, `utiliteEnMain`, `valeurObjet`

### `valeurObjet()` — ligne 34

Appelle : `car()` *(jeuCaracteristiques.js)*, `estCreature()` *(jeuCaracteristiques.js)*, `primeMots()` *(iaValeur.js)*, `valeurDef()` *(iaValeur.js)*

Appelée par : `iaAttaquants`, `iaBloqueurs`, `iaCartes`, `iaCibles`, `impactCapacite`, `meilleureCibleHostile`, `menace`, `scoreEffet`

### `forceDeFrappe()` — ligne 43

Appelle : `car()` *(jeuCaracteristiques.js)*, `champDe()` *(jeuEtat.js)*, → `estCreature()` *(jeuCaracteristiques.js)*

Appelée par : `choisitDefenseur`, `iaAttaquants`

### `menace()` — ligne 50

Appelle : `champDe()` *(jeuEtat.js)*, `valeurObjet()` *(iaValeur.js)*

Appelée par : `choisitDefenseur`

### `estAMoi()` — ligne 56

Appelle : `obj()` *(jeuEtat.js)*

Appelée par : `iaCibles`, `meilleureCibleHostile`

### `opHostile()` — ligne 66

N'appelle aucune fonction du projet.

Appelée par : `iaCibles`, `iaModes`, `iaReponse`, `scoreEffet`

### `opsSurCible()` — ligne 75

N'appelle aucune fonction du projet.

Appelée par : `iaCibles`

## js/iaChoix.js

### `terrainsEnMain()` — ligne 10

Appelle : `estType()` *(jeuCaracteristiques.js)*, `obj()` *(jeuEtat.js)*

Appelée par : `iaMulligan`, `iaScrute`, `utiliteEnMain`

### `iaMulligan()` — ligne 14

Appelle : `terrainsEnMain()` *(iaChoix.js)*

Appelée par : `agentIA`

### `utiliteEnMain()` — ligne 23

Appelle : `champDe()` *(jeuEtat.js)*, `estType()` *(jeuCaracteristiques.js)*, `manaDispo()` *(jeuMana.js)*, `obj()` *(jeuEtat.js)*, `terrainsEnMain()` *(iaChoix.js)*, `valeurDef()` *(iaValeur.js)*

Appelée par : `iaCartes`

### `iaCibles()` — ligne 37

Appelle : `car()` *(jeuCaracteristiques.js)*, `estAMoi()` *(iaValeur.js)*, `estCreature()` *(jeuCaracteristiques.js)*, `obj()` *(jeuEtat.js)*, `opsSurCible()` *(iaValeur.js)*, `valeurDef()` *(iaValeur.js)*, `valeurObjet()` *(iaValeur.js)*, → `opHostile()` *(iaValeur.js)*

Appelée par : `agentIA`

### `iaCartes()` — ligne 71

Appelle : `champDe()` *(jeuEtat.js)*, `estType()` *(jeuCaracteristiques.js)*, `obj()` *(jeuEtat.js)*, `utiliteEnMain()` *(iaChoix.js)*, `valeurDef()` *(iaValeur.js)*, `valeurObjet()` *(iaValeur.js)*

Appelée par : `agentIA`

### `iaScrute()` — ligne 92

Appelle : `champDe()` *(jeuEtat.js)*, `estType()` *(jeuCaracteristiques.js)*, `obj()` *(jeuEtat.js)*, `terrainsEnMain()` *(iaChoix.js)*

Appelée par : `agentIA`

### `iaOui()` — ligne 103

Appelle : `manaDispo()` *(jeuMana.js)*

Appelée par : `agentIA`

### `iaModes()` — ligne 115

Appelle : `opHostile()` *(iaValeur.js)*

Appelée par : `agentIA`

## js/iaPriorite.js

### `meilleureCibleHostile()` — ligne 13

Appelle : `car()` *(jeuCaracteristiques.js)*, `ciblesLegales()` *(jeuCibles.js)*, `estAMoi()` *(iaValeur.js)*, `estCreature()` *(jeuCaracteristiques.js)*, `obj()` *(jeuEtat.js)*, `valeurDef()` *(iaValeur.js)*, `valeurObjet()` *(iaValeur.js)*

Appelée par : `impactSort`, `scoreEffet`

### `scoreEffet()` — ligne 31

Appelle : `correspond()` *(jeuCibles.js)*, `definitionJeton()` *(definitions.js)*, `manaDispo()` *(jeuMana.js)*, `meilleureCibleHostile()` *(iaPriorite.js)*, `obj()` *(jeuEtat.js)*, `opHostile()` *(iaValeur.js)*, `valeurDef()` *(iaValeur.js)*, `valeurObjet()` *(iaValeur.js)*

Appelée par : `iaReponse`, `impactCapacite`, `impactSort`

### `impactSort()` — ligne 64

Appelle : `champDe()` *(jeuEtat.js)*, `meilleureCibleHostile()` *(iaPriorite.js)*, `scoreEffet()` *(iaPriorite.js)*, `valeurDef()` *(iaValeur.js)*, → `estCreature()` *(jeuCaracteristiques.js)*

Appelée par : `iaPriorite`, `iaReponse`

### `impactCapacite()` — ligne 82

Appelle : `estCreature()` *(jeuCaracteristiques.js)*, `scoreEffet()` *(iaPriorite.js)*, `valeurObjet()` *(iaValeur.js)*

Appelée par : `iaPriorite`, `iaReponse`

### `scoreTerrain()` — ligne 97

Appelle : `obj()` *(jeuEtat.js)*, `sourcesMana()` *(jeuMana.js)*

Appelée par : `iaPriorite`

### `iaReponse()` — ligne 109

Appelle : `champDe()` *(jeuEtat.js)*, `impactCapacite()` *(iaPriorite.js)*, `impactSort()` *(iaPriorite.js)*, `obj()` *(jeuEtat.js)*, `scoreEffet()` *(iaPriorite.js)*, `suivantVivant()` *(jeuEtat.js)*, `valeurDef()` *(iaValeur.js)*, → `opHostile()` *(iaValeur.js)*

Appelée par : `iaPriorite`

### `iaPriorite()` — ligne 137

Appelle : `enPhasePrincipale()` *(jeuLancer.js)*, `iaReponse()` *(iaPriorite.js)*, `impactCapacite()` *(iaPriorite.js)*, `impactSort()` *(iaPriorite.js)*, `noteActivation()` *(iaPriorite.js)*, `obj()` *(jeuEtat.js)*, `scoreTerrain()` *(iaPriorite.js)*

Appelée par : `agentIA`

### `noteActivation()` — ligne 161

N'appelle aucune fonction du projet.

Appelée par : `iaPriorite`

## js/iaCombat.js

### `tue()` — ligne 12

Appelle : `car()` *(jeuCaracteristiques.js)*

Appelée par : `iaAttaquants`, `iaBloqueurs`

### `choisitDefenseur()` — ligne 20

Appelle : `forceDeFrappe()` *(iaValeur.js)*, `menace()` *(iaValeur.js)*

Appelée par : `iaAttaquants`

### `iaAttaquants()` — ligne 32

Appelle : `adversaires()` *(jeuEtat.js)*, `car()` *(jeuCaracteristiques.js)*, `champDe()` *(jeuEtat.js)*, `choisitDefenseur()` *(iaCombat.js)*, `estCreature()` *(jeuCaracteristiques.js)*, `forceDeFrappe()` *(iaValeur.js)*, `obj()` *(jeuEtat.js)*, `peutBloquer()` *(jeuCombat.js)*, `tue()` *(iaCombat.js)*, `valeurObjet()` *(iaValeur.js)*

Appelée par : `agentIA`

### `iaBloqueurs()` — ligne 57

Appelle : `aMot()` *(jeuCaracteristiques.js)*, `car()` *(jeuCaracteristiques.js)*, `obj()` *(jeuEtat.js)*, `peutBloquer()` *(jeuCombat.js)*, `tue()` *(iaCombat.js)*, `valeurObjet()` *(iaValeur.js)*

Appelée par : `agentIA`

## js/iaAgent.js

### `agentIA()` — ligne 15

Appelle : `brasse()` *(jeuHasard.js)*, `etatHasard()` *(jeuHasard.js)*, `iaAttaquants()` *(iaCombat.js)*, `iaBloqueurs()` *(iaCombat.js)*, `iaCartes()` *(iaChoix.js)*, `iaCibles()` *(iaChoix.js)*, `iaModes()` *(iaChoix.js)*, `iaMulligan()` *(iaChoix.js)*, `iaOui()` *(iaChoix.js)*, `iaPriorite()` *(iaPriorite.js)*, `iaScrute()` *(iaChoix.js)*

Appelée par : `lanceSimulation`, `rejouePartie`

## js/symboles.js

### `loadSymbology()` — ligne 16

Appelle : `renderAll()` *(rendu.js)*

Appelée par : `demarrer`

### `pipHTML()` — ligne 30

N'appelle aucune fonction du projet.

Appelée par : `symBg`, `symIcon`

### `symBg()` — ligne 38

Appelle : `esc()` *(outils.js)*, `pipHTML()` *(symboles.js)*

Appelée par : `corpsDeck`, `corpsFiltres`, `renderTop`

### `symIcon()` — ligne 46

Appelle : `esc()` *(outils.js)*, `pipHTML()` *(symboles.js)*, ⌘ `manaFb()` *(symboles.js)*

Appelée par : `ligneMana`, `manaHTML`, `renderC`, `zoneCommandant`

### `manaFb()` — ligne 55

N'appelle aucune fonction du projet.

Appelée par : `symIcon`

### `manaHTML()` — ligne 60

Appelle : `symIcon()` *(symboles.js)*

Appelée par : `cardRow`, `ficheTexteHTML`, `ligneProposition`, `montrerApercu`, `sugLigne`

### `stripeColor()` — ligne 66

N'appelle aucune fonction du projet.

Appelée par : `blocAchats`, `ligneWishlist`

## js/champsJeu.js

### `nombreOuRien()` — ligne 19

N'appelle aucune fonction du projet.

Appelée par : `champsJeuScryfall`, `ficheDeScryfall`

### `champsJeuScryfall()` — ligne 26

Appelle : `nombreOuRien()` *(champsJeu.js)*

Appelée par : `applyScryfall`, `colonnesJeu`, `ficheDeScryfall`

### `colonnesJeu()` — ligne 46

Appelle : `champsJeuScryfall()` *(champsJeu.js)*

Appelée par : `compacte`

### `champsJeuRec()` — ligne 54

N'appelle aucune fonction du projet.

Appelée par : `carteDuCatalogue`, `completeDepuisRec`, `ficheDeRec`, `getCardOrAnalyzedRec`

### `appliqueChampsJeu()` — ligne 64

N'appelle aucune fonction du projet.

Appelée par : `applyScryfall`, `carteDuCatalogue`, `completeDepuisRec`, `getCardOrAnalyzedRec`, `jeuRestore`

### `jeuSnap()` — ligne 76

N'appelle aucune fonction du projet.

Appelée par : `snapshot`

### `jeuRestore()` — ligne 87

Appelle : `appliqueChampsJeu()` *(champsJeu.js)*

Appelée par : `restore`

## js/scryfallApplique.js

### `scryTarget()` — ligne 10

Appelle : `frontFace()` *(cartes.js)*, `loose()` *(cartes.js)*, `norm()` *(cartes.js)*

Appelée par : `completeUnknown`, `majPrix`, `runScryQueue`

### `applyScryfall()` — ligne 21

Appelle : `appliqueChampsJeu()` *(champsJeu.js)*, `buildCard()` *(cartes.js)*, `champsJeuScryfall()` *(champsJeu.js)*, `cleImpression()` *(impressions.js)*, `codeLegalite()` *(retenue.js)*, `completeImpression()` *(impressions.js)*, `find()` *(cartes.js)*, `loose()` *(cartes.js)*, `majTexteOracle()` *(cartes.js)*, `norm()` *(cartes.js)*, `ordonneMana()` *(mana.js)*, `reanalyser()` *(categories.js)*, `registerCard()` *(cartes.js)*, `renameCard()` *(cartes.js)*

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

### `majRecherches()` — ligne 15

Appelle : `majPropositions()` *(rechercheSection.js)*, `majResultats()` *(fenAjout.js)*

Appelée par : `chercheScryfall`

### `chercheScryfall()` — ligne 20

Appelle : `colorOK()` *(collection.js)*, `majRecherches()` *(recherches.js)*, `norm()` *(cartes.js)*

Appelée par : `majResultats`, `saisieRecherche`

### `semeVisuelVersion()` — ligne 47

Appelle : `cleImpression()` *(impressions.js)*

Appelée par : `chercheImpressions`

### `visuelDepuisScryfall()` — ligne 60

N'appelle aucune fonction du projet.

Appelée par : `chercheImpressions`, `chercheToutesEditions`

### `chercheImpressions()` — ligne 76

Appelle : `cleImpression()` *(impressions.js)*, `cleVersion()` *(impressions.js)*, `semeVisuelVersion()` *(recherches.js)*, `versionsCarte()` *(impressions.js)*, `visuelDepuisScryfall()` *(recherches.js)*

Appelée par : `openCardModal`

### `chercheToutesEditions()` — ligne 118

Appelle : `visuelDepuisScryfall()` *(recherches.js)*

Appelée par : `basculerSourceVersions`

### `chercheVerso()` — ligne 158

Appelle : `applyScryfall()` *(scryfallApplique.js)*, `frontFace()` *(cartes.js)*, `scheduleSave()` *(stockage.js)*

Appelée par : `openCardModal`

### `chercheTexte()` — ligne 173

Appelle : `applyScryfall()` *(scryfallApplique.js)*, `frontFace()` *(cartes.js)*, `scheduleSave()` *(stockage.js)*

Appelée par : `openCardModal`

### `carteDepuisScryfall()` — ligne 187

Appelle : `applyScryfall()` *(scryfallApplique.js)*, `buildCard()` *(cartes.js)*

Appelée par : `gestesGraphe`

### `enrichAllUnknown()` — ligne 200

Appelle : `completeUnknown()` *(scryfall.js)*, `toast()` *(outils.js)*

Appelée par : `gestesDonnees`

## js/decksStockage.js

### `deckSnap()` — ligne 13

N'appelle aucune fonction du projet.

Appelée par : `snapshot`

### `ciblesPropres()` — ligne 28

N'appelle aucune fonction du projet.

Appelée par : `restaureDecks`

### `restaureDecks()` — ligne 51

Appelle : `ciblesPropres()` *(decksStockage.js)*, `cleDeckNeuve()` *(decks.js)*, `clesDecks()` *(decks.js)*, `deckNeuf()` *(decks.js)*, `find()` *(cartes.js)*

Appelée par : `restore`

## js/stockage.js

### `impressionSnap()` — ligne 33

N'appelle aucune fonction du projet.

Appelée par : `snapshot`

### `impressionRestore()` — ligne 42

N'appelle aucune fonction du projet.

Appelée par : `restore`

### `snapshot()` — ligne 53

Appelle : `carteDansUnDeck()` *(decks.js)*, `clesDecks()` *(decks.js)*, `impressionSnap()` *(stockage.js)*, `jeuSnap()` *(champsJeu.js)*, `norm()` *(cartes.js)*, → `deckSnap()` *(decksStockage.js)*

Appelée par : `gestesDonnees`, `nuagePaquet`, `save`

### `ecrire()` — ligne 122

N'appelle aucune fonction du projet.

Appelée par : `save`

### `save()` — ligne 126

Appelle : `ecrire()` *(stockage.js)*, `nuagePousseeDifferee()` *(nuage.js)*, `snapshot()` *(stockage.js)*, `toast()` *(outils.js)*

Appelée par : `brancherRestauration`, `brancherSauvegarde`, `gestesDonnees`, `gestesNuage`, `nuageTour`, `scheduleSave`

### `scheduleSave()` — ligne 157

Appelle : → `save()` *(stockage.js)*

Appelée par : `appliqueCatalogueAuxCartes`, `appliqueComportement`, `appliquerAffichage`, `basculeTheme`, `brancherCatalogue`, `chercheTexte`, `chercheVerso`, `choisirVersion`, `effaceComportement`, `enregistreAdversaireFenetre`, `entete.js (chargement)`, `gestesDeck`, `gestesDecks`, `gestesDonnees`, `reglageSimulation`, `renderAll`, `runScryQueue`, `supprimeAdversaireOui`

### `restore()` — ligne 163

Appelle : `buildCard()` *(cartes.js)*, `find()` *(cartes.js)*, `impressionRestore()` *(stockage.js)*, `jeuRestore()` *(champsJeu.js)*, `majTexteOracle()` *(cartes.js)*, `reanalyser()` *(categories.js)*, `registerCard()` *(cartes.js)*, `restaureDecks()` *(decksStockage.js)*

Appelée par : `brancherRestauration`, `demarrer`, `nuageVerse`

### `chargerSauvegarde()` — ligne 274

N'appelle aucune fonction du projet.

Appelée par : `demarrer`

## js/fenSauvegarde.js

### `corpsSauvegarde()` — ligne 10

Appelle : `esc()` *(outils.js)*

Appelée par : `corpsParametres`

### `blocCatalogue()` — ligne 45

Appelle : `catalogueObsolete()` *(catalogue.js)*, `esc()` *(outils.js)*

Appelée par : `corpsCatalogue`

### `rafraichirFenetreSauvegarde()` — ligne 106

Appelle : `majFenetreParametres()` *(fenParametres.js)*

Appelée par : `brancherCatalogue`, `gestesDonnees`, `majCatalogue`, `telechargerCatalogue`

### `brancherSauvegarde()` — ligne 114

Appelle : `idbVider()` *(idb.js)*, `majFenetreParametres()` *(fenParametres.js)*, `renderTop()` *(entete.js)*, `save()` *(stockage.js)*, `toast()` *(outils.js)*

Appelée par : `brancherParametres`

### `brancherCatalogue()` — ligne 135

Appelle : `chargerCatalogueComplet()` *(catalogue.js)*, `fermerBoiteCatalogue()` *(boiteCatalogue.js)*, `idbVider()` *(idb.js)*, `invaliderCandidats()` *(candidats.js)*, `lireCatalogueFichier()` *(archive.js)*, `nouveauSuivi()` *(archive.js)*, `ouvrirBoiteCatalogue()` *(boiteCatalogue.js)*, `rafraichirFenetreSauvegarde()` *(fenSauvegarde.js)*, `renderAll()` *(rendu.js)*, `renderSuggestions()` *(suggestions.js)*, `scheduleSave()` *(stockage.js)*, `toast()` *(outils.js)*

Appelée par : `brancherParametres`

### `brancherRestauration()` — ligne 183

Appelle : `collectionCards()` *(collection.js)*, `deckSize()` *(deck.js)*, `renderAll()` *(rendu.js)*, `restore()` *(stockage.js)*, `save()` *(stockage.js)*, `toast()` *(outils.js)*

Appelée par : `brancherParametres`

## js/idb.js

### `idb()` — ligne 24

N'appelle aucune fonction du projet.

Appelée par : `idbEcrire`, `idbLire`, `idbOublier`, `idbVider`

### `idbLire()` — ligne 34

Appelle : `idb()` *(idb.js)*

Appelée par : `chargeResultats`, `chargeSimCartes`, `chargerCatalogueComplet`, `nuageBaseLire`, `reprendreArchetypesEdhrec`, `reprendreGameChangers`, `reprendreSets`

### `idbEcrire()` — ligne 42

Appelle : `idb()` *(idb.js)*

Appelée par : `lireCatalogueFichier`, `nuageBaseEcrire`, `rangeResultats`, `rangeSimCartes`, `sauverArchetypesEdhrec`, `sauverGameChangers`, `sauverSets`

### `idbOublier()` — ligne 51

Appelle : `idb()` *(idb.js)*

Appelée par : `gestesDonnees`, `nuageDeconnecte`

### `idbVider()` — ligne 61

Appelle : `idb()` *(idb.js)*

Appelée par : `brancherCatalogue`, `brancherSauvegarde`, `gestesDonnees`

## js/nuagePaquet.js

### `nuagePaquet()` — ligne 49

Appelle : `snapshot()` *(stockage.js)*

Appelée par : `nuageTour`

### `nuageFond()` — ligne 68

N'appelle aucune fonction du projet.

### `nuageVerse()` — ligne 78

Appelle : `restore()` *(stockage.js)*

Appelée par : `nuageTour`

### `nuageComprime()` — ligne 94

N'appelle aucune fonction du projet.

Appelée par : `nuageEmballe`

### `nuageDecomprime()` — ligne 102

N'appelle aucune fonction du projet.

Appelée par : `nuageDeballe`

### `nuageEmballe()` — ligne 112

Appelle : `nuageComprime()` *(nuagePaquet.js)*

Appelée par : `nuageTour`

### `nuageDeballe()` — ligne 116

Appelle : `nuageDecomprime()` *(nuagePaquet.js)*

Appelée par : `dbxLire`

## js/nuageFusion.js

### `nuageStable()` — ligne 24

N'appelle aucune fonction du projet.

Appelée par : `empreinteDeck`, `empreinteFond`, `fusionneValeur`

### `fusionneQuantites()` — ligne 33

N'appelle aucune fonction du projet.

Appelée par : `fusionneDecks`, `fusionnePaquets`

### `fusionneEnsemble()` — ligne 51

N'appelle aucune fonction du projet.

Appelée par : `fusionneDecks`, `fusionnePaquets`

### `fusionneValeur()` — ligne 67

Appelle : `nuageStable()` *(nuageFusion.js)*

Appelée par : `fusionneDecks`, `fusionnePaquets`

### `nuageGarniture()` — ligne 78

N'appelle aucune fonction du projet.

Appelée par : `fusionneCache`

### `fusionneCache()` — ligne 93

Appelle : `nuageGarniture()` *(nuageFusion.js)*

Appelée par : `fusionnePaquets`

### `indexDecks()` — ligne 121

N'appelle aucune fonction du projet.

Appelée par : `fusionneDecks`

### `fusionneDecks()` — ligne 127

Appelle : `fusionneEnsemble()` *(nuageFusion.js)*, `fusionneQuantites()` *(nuageFusion.js)*, `fusionneValeur()` *(nuageFusion.js)*, `indexDecks()` *(nuageFusion.js)*

Appelée par : `fusionnePaquets`

### `empreinteDeck()` — ligne 164

Appelle : `nuageStable()` *(nuageFusion.js)*

Appelée par : `empreinteFond`

### `empreinteFond()` — ligne 177

Appelle : `nuageStable()` *(nuageFusion.js)*, → `empreinteDeck()` *(nuageFusion.js)*

Appelée par : `fusionnePaquets`

### `fusionnePaquets()` — ligne 193

Appelle : `empreinteFond()` *(nuageFusion.js)*, `fusionneCache()` *(nuageFusion.js)*, `fusionneDecks()` *(nuageFusion.js)*, `fusionneEnsemble()` *(nuageFusion.js)*, `fusionneQuantites()` *(nuageFusion.js)*, `fusionneValeur()` *(nuageFusion.js)*

Appelée par : `nuageTour`

## js/nuageDropbox.js

### `dbxRetour()` — ligne 39

N'appelle aucune fonction du projet.

Appelée par : `dbxConnexion`, `dbxEchange`, `dbxRetourConnexion`

### `dbxBase64Url()` — ligne 43

N'appelle aucune fonction du projet.

Appelée par : `dbxConnexion`, `dbxDefi`

### `dbxDefi()` — ligne 52

Appelle : `dbxBase64Url()` *(nuageDropbox.js)*

Appelée par : `dbxConnexion`

### `dbxErreurReseau()` — ligne 61

N'appelle aucune fonction du projet.

Appelée par : `dbxAppel`, `dbxPoste`

### `dbxJson()` — ligne 71

N'appelle aucune fonction du projet.

Appelée par : `dbxCompte`, `dbxEcrire`, `dbxLire`, `dbxPoste`, `nuageEffaceTemoin`

### `dbxErreur()` — ligne 83

N'appelle aucune fonction du projet.

Appelée par : `dbxCompte`, `dbxEcrire`, `dbxLire`, `dbxPoste`, `nuageEffaceTemoin`

### `dbxConnexion()` — ligne 106

Appelle : `dbxBase64Url()` *(nuageDropbox.js)*, `dbxDefi()` *(nuageDropbox.js)*, `dbxRetour()` *(nuageDropbox.js)*, `nuageEcrire()` *(nuage.js)*

Appelée par : `gestesNuage`

### `dbxRetourConnexion()` — ligne 128

Appelle : `dbxEchange()` *(nuageDropbox.js)*, `dbxRetour()` *(nuageDropbox.js)*

Appelée par : `nuageDemarrer`

### `dbxPoste()` — ligne 141

Appelle : `dbxErreur()` *(nuageDropbox.js)*, `dbxErreurReseau()` *(nuageDropbox.js)*, `dbxJson()` *(nuageDropbox.js)*

Appelée par : `dbxEchange`, `dbxJetonValide`

### `dbxEchange()` — ligne 155

Appelle : `dbxNoteJeton()` *(nuageDropbox.js)*, `dbxPoste()` *(nuageDropbox.js)*, `dbxRetour()` *(nuageDropbox.js)*

Appelée par : `dbxRetourConnexion`

### `dbxNoteJeton()` — ligne 164

Appelle : `nuageEcrire()` *(nuage.js)*

Appelée par : `dbxEchange`, `dbxJetonValide`

### `dbxJetonValide()` — ligne 174

Appelle : `dbxNoteJeton()` *(nuageDropbox.js)*, `dbxPoste()` *(nuageDropbox.js)*

Appelée par : `dbxAppel`, `nuageDiagnostic`

### `dbxArg()` — ligne 188

N'appelle aucune fonction du projet.

Appelée par : `dbxEcrire`, `dbxLire`

### `dbxAppel()` — ligne 193

Appelle : `dbxErreurReseau()` *(nuageDropbox.js)*, `dbxJetonValide()` *(nuageDropbox.js)*

Appelée par : `dbxCompte`, `dbxEcrire`, `dbxLire`, `nuageEffaceTemoin`

### `dbxLire()` — ligne 204

Appelle : `dbxAppel()` *(nuageDropbox.js)*, `dbxArg()` *(nuageDropbox.js)*, `dbxErreur()` *(nuageDropbox.js)*, `dbxJson()` *(nuageDropbox.js)*, `nuageDeballe()` *(nuagePaquet.js)*

Appelée par : `nuageDiagnostic`, `nuageTour`

### `dbxEcrire()` — ligne 222

Appelle : `dbxAppel()` *(nuageDropbox.js)*, `dbxArg()` *(nuageDropbox.js)*, `dbxErreur()` *(nuageDropbox.js)*, `dbxJson()` *(nuageDropbox.js)*

Appelée par : `nuageDiagnostic`, `nuageTour`

### `dbxCompte()` — ligne 234

Appelle : `dbxAppel()` *(nuageDropbox.js)*, `dbxErreur()` *(nuageDropbox.js)*, `dbxJson()` *(nuageDropbox.js)*

Appelée par : `nuageDemarrer`, `nuageDiagnostic`

## js/nuage.js

### `nuageLire()` — ligne 59

N'appelle aucune fonction du projet.

Appelée par : `nuageDemarrer`

### `nuageEcrire()` — ligne 68

N'appelle aucune fonction du projet.

Appelée par : `dbxConnexion`, `dbxNoteJeton`, `gestesNuageChange`, `nuageDeconnecte`, `nuageDemarrer`, `nuageDiagnostic`, `nuageSynchro`, `nuageTour`

### `nuageConnecte()` — ligne 76

N'appelle aucune fonction du projet.

Appelée par : `corpsNuage`, `gestesDonnees`, `nuageDemarrer`, `nuagePousseeDifferee`, `nuageSynchro`

### `nuageNomParDefaut()` — ligne 82

N'appelle aucune fonction du projet.

Appelée par : `gestesNuageChange`, `nuageDemarrer`

### `nuageBaseLire()` — ligne 95

Appelle : `idbLire()` *(idb.js)*

Appelée par : `nuageTour`

### `nuageBaseEcrire()` — ligne 99

Appelle : `idbEcrire()` *(idb.js)*

Appelée par : `nuageTour`

### `nuageTour()` — ligne 109

Appelle : `dbxEcrire()` *(nuageDropbox.js)*, `dbxLire()` *(nuageDropbox.js)*, `fusionnePaquets()` *(nuageFusion.js)*, `nuageBaseEcrire()` *(nuage.js)*, `nuageBaseLire()` *(nuage.js)*, `nuageEcrire()` *(nuage.js)*, `nuageEmballe()` *(nuagePaquet.js)*, `nuagePaquet()` *(nuagePaquet.js)*, `nuagePoids()` *(nuage.js)*, `nuageVerse()` *(nuagePaquet.js)*, `releveAncre()` *(ancre.js)*, `renderAll()` *(rendu.js)*, `restaureAncre()` *(ancre.js)*, `save()` *(stockage.js)*

Appelée par : `nuageSynchro`

### `nuagePoids()` — ligne 176

N'appelle aucune fonction du projet.

Appelée par : `nuageCorpsConnecte`, `nuageDiagnostic`, `nuageTour`

### `nuageSynchro()` — ligne 182

Appelle : `majFenetreParametres()` *(fenParametres.js)*, `nuageConnecte()` *(nuage.js)*, `nuageEcrire()` *(nuage.js)*, `nuageTour()` *(nuage.js)*, `toast()` *(outils.js)*

Appelée par : `gestesNuage`, `gestesNuageChange`, `nuageDemarrer`, `nuagePousseeDifferee`

### `nuagePousseeDifferee()` — ligne 218

Appelle : `nuageConnecte()` *(nuage.js)*, `nuageSynchro()` *(nuage.js)*

Appelée par : `save`

### `nuageDemarrer()` — ligne 234

Appelle : `dbxCompte()` *(nuageDropbox.js)*, `dbxRetourConnexion()` *(nuageDropbox.js)*, `nuageConnecte()` *(nuage.js)*, `nuageEcrire()` *(nuage.js)*, `nuageLire()` *(nuage.js)*, `nuageNomParDefaut()` *(nuage.js)*, `nuageSynchro()` *(nuage.js)*, `toast()` *(outils.js)*

Appelée par : `demarrer`

### `nuageDeconnecte()` — ligne 266

Appelle : `idbOublier()` *(idb.js)*, `nuageEcrire()` *(nuage.js)*

Appelée par : `gestesDonnees`, `gestesNuage`

## js/nuageDiagnostic.js

### `nuageEtape()` — ligne 23

N'appelle aucune fonction du projet.

Appelée par : `nuageDiagnostic`

### `nuageEffaceTemoin()` — ligne 36

Appelle : `dbxAppel()` *(nuageDropbox.js)*, `dbxErreur()` *(nuageDropbox.js)*, `dbxJson()` *(nuageDropbox.js)*

Appelée par : `nuageDiagnostic`

### `nuageDiagnostic()` — ligne 44

Appelle : `dbxCompte()` *(nuageDropbox.js)*, `dbxEcrire()` *(nuageDropbox.js)*, `dbxJetonValide()` *(nuageDropbox.js)*, `dbxLire()` *(nuageDropbox.js)*, `majFenetreParametres()` *(fenParametres.js)*, `nuageEcrire()` *(nuage.js)*, `nuageEtape()` *(nuageDiagnostic.js)*, `nuagePoids()` *(nuage.js)*, `toast()` *(outils.js)*, → `nuageEffaceTemoin()` *(nuageDiagnostic.js)*

Appelée par : `gestesNuage`

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

Appelle : `codeLegalite()` *(retenue.js)*, `colonnesJeu()` *(champsJeu.js)*

Appelée par : `lireCatalogueFichier`

### `autoCatalogue()` — ligne 51

N'appelle aucune fonction du projet.

Appelée par : `demarrerCatalogue`

### `estGzip()` — ligne 65

N'appelle aucune fonction du projet.

Appelée par : `fluxTexte`

### `compteurOctets()` — ligne 72

N'appelle aucune fonction du projet.

Appelée par : `fluxTexte`

### `nouveauSuivi()` — ligne 87

Appelle : `avance()` *(jeuPilote.js)*, `majBoiteCatalogue()` *(boiteCatalogue.js)*

Appelée par : `brancherCatalogue`, `telechargerCatalogue`

### `fluxTexte()` — ligne 104

Appelle : `compteurOctets()` *(archive.js)*, `estGzip()` *(archive.js)*

Appelée par : `lireCatalogueFichier`

### `fusionneSets()` — ligne 127

N'appelle aucune fonction du projet.

Appelée par : `retiens`

### `retiens()` — ligne 140

Appelle : `fusionneSets()` *(archive.js)*, `norm()` *(cartes.js)*

Appelée par : `lireCatalogueFichier`

### `tailleEstimee()` — ligne 151

N'appelle aucune fonction du projet.

Appelée par : `chargerCatalogueComplet`, `lireCatalogueFichier`

### `ArchiveAbandonnee()` — ligne 161

N'appelle aucune fonction du projet.

Appelée par : `lireCatalogueFichier`

### `lireCatalogueFichier()` — ligne 163

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

Appelle : `appliqueChampsJeu()` *(champsJeu.js)*, `champsJeuRec()` *(champsJeu.js)*, `majTexteOracle()` *(cartes.js)*, `noterLegalArchive()` *(candidats.js)*, `noterSetsArchive()` *(candidats.js)*, `reanalyser()` *(categories.js)*

Appelée par : `appliqueCatalogueAuxCartes`, `carteDuCatalogue`

### `noterLegalArchive()` — ligne 43

N'appelle aucune fonction du projet.

Appelée par : `appliqueCatalogueAuxCartes`, `carteDuCatalogue`, `completeDepuisRec`

### `noterSetsArchive()` — ligne 50

N'appelle aucune fonction du projet.

Appelée par : `appliqueCatalogueAuxCartes`, `completeDepuisRec`

### `carteDuCatalogue()` — ligne 55

Appelle : `appliqueChampsJeu()` *(champsJeu.js)*, `buildCard()` *(cartes.js)*, `champsJeuRec()` *(champsJeu.js)*, `completeDepuisRec()` *(candidats.js)*, `find()` *(cartes.js)*, `noterLegalArchive()` *(candidats.js)*, `ordonneMana()` *(mana.js)*, `reanalyser()` *(categories.js)*, `registerCard()` *(cartes.js)*

Appelée par : `candidatsCatalogue`, `prechauffeCandidats`

### `invaliderCandidats()` — ligne 85

N'appelle aucune fonction du projet.

Appelée par : `activerDeck`, `app.js (chargement)`, `apresReglage`, `brancherCatalogue`, `chargerCatalogueComplet`, `gestesDeck`, `gestesDonnees`, `gestesGraphe`, `gestesVue`, `lireCatalogueFichier`, `saisieBudget`, `supprimerDeck`, `verseBrouillon`

### `signatureCandidats()` — ligne 89

Appelle : `noeudsActifs()` *(catalogueEtat.js)*, `restrictionsDuDeck()` *(restrictions.js)*

Appelée par : `candidatsCatalogue`, `prechauffeCandidats`, `recalculLong`, `signatureSuggestions`

### `appliqueCatalogueAuxCartes()` — ligne 100

Appelle : `annexeListe()` *(annexes.js)*, `completeDepuisRec()` *(candidats.js)*, `find()` *(cartes.js)*, `norm()` *(cartes.js)*, `noterLegalArchive()` *(candidats.js)*, `noterSetsArchive()` *(candidats.js)*, `scheduleSave()` *(stockage.js)*

Appelée par : `chargerCatalogueComplet`, `lireCatalogueFichier`

### `selectionCandidats()` — ligne 130

Appelle : `colorOK()` *(collection.js)*, `filtreOKRec()` *(retenue.js)*, `find()` *(cartes.js)*, `fmt()` *(outils.js)*, `noeudsActifs()` *(catalogueEtat.js)*, `prixBrutMax()` *(marche.js)*, `recToucheNoeuds()` *(catalogueEtat.js)*, `restrictionOKRec()` *(restrictions.js)*

Appelée par : `candidatsCatalogue`, `prechauffeCandidats`

### `candidatsCatalogue()` — ligne 173

Appelle : `selectionCandidats()` *(candidats.js)*, `signatureCandidats()` *(candidats.js)*, → `carteDuCatalogue()` *(candidats.js)*

Appelée par : `statsCandidats`, `vivierSuggestions`

### `prechauffeCandidats()` — ligne 186

Appelle : `carteDuCatalogue()` *(candidats.js)*, `selectionCandidats()` *(candidats.js)*, `signatureCandidats()` *(candidats.js)*

Appelée par : `filtrerAvecProgression`, `recalculerAvecProgression`

### `statsCandidats()` — ligne 209

Appelle : `candidatsCatalogue()` *(candidats.js)*

Appelée par : `ligneCatalogue`

### `requeteCatalogue()` — ligne 215

Appelle : `find()` *(cartes.js)*, `fmt()` *(outils.js)*

Appelée par : `chargerCatalogue`, `signatureCatalogue`

### `signatureCatalogue()` — ligne 224

Appelle : `requeteCatalogue()` *(candidats.js)*

Appelée par : `chargerCatalogue`

### `chargerCatalogue()` — ligne 226

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

### `renderD()` — ligne 99

Appelle : `buildGraph()` *(graphe.js)*, `carteTouche()` *(catalogueEtat.js)*, `esc()` *(outils.js)*, `graphCards()` *(graphe.js)*, `noeudsActifs()` *(catalogueEtat.js)*, `refCarte()` *(outils.js)*, `svgGraph()` *(graphe.js)*

Appelée par : `gestesGraphe`, `gestesVue`, `renderAll`

## js/stats.js

### `statsOf()` — ligne 5

Appelle : `mainType()` *(cartes.js)*

Appelée par : `renderC`

### `repartitionCmc()` — ligne 35

N'appelle aucune fonction du projet.

Appelée par : `renderC`, `renderE`

### `totalBarre()` — ligne 52

N'appelle aucune fonction du projet.

Appelée par : `histogram`

### `histogram()` — ligne 57

Appelle : `nombreMana()` *(mana.js)*, `totalBarre()` *(stats.js)*

Appelée par : `renderC`, `renderE`

### `renderC()` — ligne 78

Appelle : `collectionCards()` *(collection.js)*, `eur()` *(outils.js)*, `filtered()` *(collection.js)*, `fmt()` *(outils.js)*, `histogram()` *(stats.js)*, `repartitionCmc()` *(stats.js)*, `statsOf()` *(stats.js)*, `symIcon()` *(symboles.js)*

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

Appelée par : `cardTile`, `sugLigne`, `sugRow`, `tagsSuggestion`

### `nbCartesLarges()` — ligne 229

N'appelle aucune fonction du projet.

Appelée par : `cardTile`, `tagsSuggestion`

### `nbLiens()` — ligne 235

N'appelle aucune fonction du projet.

Appelée par : `cardTile`, `tagsSuggestion`

## js/vivier.js

### `vivierSuggestions()` — ligne 18

Appelle : `availableFor()` *(deck.js)*, `bestOffer()` *(marche.js)*, `candidatsCatalogue()` *(candidats.js)*, `carteTouche()` *(catalogueEtat.js)*, `colorOK()` *(collection.js)*, `contexteEvaluation()` *(notation.js)*, `filtered()` *(collection.js)*, `find()` *(cartes.js)*, `noeudsActifs()` *(catalogueEtat.js)*, `spent()` *(achats.js)*

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

### `suggestionsAJour()` — ligne 157

Appelle : `signatureSuggestions()` *(vivier.js)*

Appelée par : `currentSuggestions`, `filetSuggestions`, `prepareSuggestions`, `rattraperSuggestions`, `recalculLong`

### `currentSuggestions()` — ligne 161

Appelle : `differerSuggestions()` *(differe.js)*, `noterVivier()` *(vivier.js)*, `ordonneSuggestions()` *(vivier.js)*, `signatureSuggestions()` *(vivier.js)*, `suggestionsAJour()` *(vivier.js)*, `suggestionsVisibles()` *(differe.js)*, `vivierSuggestions()` *(vivier.js)*

Appelée par : `classementDecale`, `graphCards`, `suggestionsAffichees`

### `prepareSuggestions()` — ligne 184

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

Appelée par : `activerDeck`, `apresReglage`, `gestesDeck`, `supprimerDeck`

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

### `selectionSuggestions()` — ligne 29

Appelle : `suggestionsAffichees()` *(sugOrdre.js)*

Appelée par : `gestesReglages`, `renderF`, `renderG`, `renderH`, `renderSuggestions`

### `listeSug()` — ligne 42

N'appelle aucune fonction du projet.

Appelée par : `gestesReglages`

### `defautSug()` — ligne 52

N'appelle aucune fonction du projet.

Appelée par : `gestesReglages`, `listesSug`, `visuelsGroupes`

### `cleLimiteSug()` — ligne 60

N'appelle aucune fonction du projet.

Appelée par : `corpsSug`, `gestesReglages`, `maxSug`

### `maxSug()` — ligne 64

Appelle : `cleLimiteSug()` *(sugListes.js)*

Appelée par : `corpsSug`, `visuelsGroupes`

### `paginationListe()` — ligne 69

Appelle : `esc()` *(outils.js)*

Appelée par : `corpsSug`

### `corpsSug()` — ligne 83

Appelle : `cleLimiteSug()` *(sugListes.js)*, `maxSug()` *(sugListes.js)*, `ouvreGrille()` *(barreGroupes.js)*, `paginationListe()` *(sugListes.js)*, `sugLigne()` *(tuiles.js)*, `sugRow()` *(tuiles.js)*, `vueDe()` *(barreGroupes.js)*

Appelée par : `listesSug`

### `listesSug()` — ligne 97

Appelle : `corpsSug()` *(sugListes.js)*, `defautSug()` *(sugListes.js)*, `enveloppeGroupe()` *(barreGroupes.js)*

Appelée par : `blocEdhrec`, `blocGraphe`, `listeSuggestions`

### `renvoiCatalogue()` — ligne 116

N'appelle aucune fonction du projet.

Appelée par : `blocEdhrec`, `blocGraphe`

### `visuelsSuggestions()` — ligne 125

Appelle : `queueScryfall()` *(scryfall.js)*, → `chargeVisuelsClasses()` *(suggestions.js)*

Appelée par : `visuelsGroupes`

### `visuelsGroupes()` — ligne 134

Appelle : `defautSug()` *(sugListes.js)*, `groupePlie()` *(barreGroupes.js)*, `maxSug()` *(sugListes.js)*, `visuelsSuggestions()` *(sugListes.js)*

Appelée par : `blocEdhrec`, `blocGraphe`, `listeSuggestions`

## js/sugGraphe.js

### `blocGraphe()` — ligne 12

Appelle : `esc()` *(outils.js)*, `groupeCartes()` *(groupes.js)*, `listesSug()` *(sugListes.js)*, `noeudsActifs()` *(catalogueEtat.js)*, `noteMultiple()` *(barreGroupes.js)*, `renvoiCatalogue()` *(sugListes.js)*, `visuelsGroupes()` *(sugListes.js)*

Appelée par : `renderG`

## js/sugEdhrec.js

### `blocEdhrec()` — ligne 12

Appelle : `commandantsSecondaires()` *(cartes.js)*, `esc()` *(outils.js)*, `eur()` *(outils.js)*, `fmt()` *(outils.js)*, `groupeCartes()` *(groupes.js)*, `listesSug()` *(sugListes.js)*, `noteMultiple()` *(barreGroupes.js)*, `renvoiCatalogue()` *(sugListes.js)*, `visuelsGroupes()` *(sugListes.js)*

Appelée par : `renderH`

## js/sugCatalogue.js

### `listeSuggestions()` — ligne 9

Appelle : `bandeauReclassement()` *(sugOrdre.js)*, `groupeCartes()` *(groupes.js)*, `listesSug()` *(sugListes.js)*, `noteMultiple()` *(barreGroupes.js)*, `visuelsGroupes()` *(sugListes.js)*

Appelée par : `renderF`

## js/suggestions.js

### `ligneCatalogue()` — ligne 10

Appelle : `bestOffer()` *(marche.js)*, `catalogueObsolete()` *(catalogue.js)*, `colorOK()` *(collection.js)*, `deckCourant()` *(decks.js)*, `esc()` *(outils.js)*, `eur()` *(outils.js)*, `fmt()` *(outils.js)*, `noeudsActifs()` *(catalogueEtat.js)*, `spent()` *(achats.js)*, `statsCandidats()` *(candidats.js)*

Appelée par : `renderF`

### `ligneBudget()` — ligne 88

Appelle : `eur()` *(outils.js)*, `spent()` *(achats.js)*

Appelée par : `corpsBudget`, `majResumeBudget`

### `ligneAchats()` — ligne 95

Appelle : `aAcheter()` *(achats.js)*, `cmLink()` *(marche.js)*, `esc()` *(outils.js)*, `eur()` *(outils.js)*

Appelée par : `corpsBudget`, `majResumeBudget`

### `chargeVisuelsClasses()` — ligne 113

N'appelle aucune fonction du projet.

Appelée par : `visuelsSuggestions`

### `majHint()` — ligne 141

N'appelle aucune fonction du projet.

Appelée par : `renderF`, `renderG`, `renderH`

### `poseCorps()` — ligne 152

N'appelle aucune fonction du projet.

Appelée par : `renderF`, `renderG`, `renderH`

### `filetSuggestions()` — ligne 170

Appelle : `recalculLong()` *(recalcul.js)*, `recalculerAvecProgression()` *(recalcul.js)*, `suggestionsAJour()` *(vivier.js)*

Appelée par : `renderF`, `renderG`, `renderH`, `renderSuggestions`

### `renderSuggestions()` — ligne 182

Appelle : `differerSuggestions()` *(differe.js)*, `filetSuggestions()` *(suggestions.js)*, `lanceEdhrecSiBesoin()` *(suggestions.js)*, `renderF()` *(suggestions.js)*, `renderG()` *(suggestions.js)*, `renderH()` *(suggestions.js)*, `selectionSuggestions()` *(sugListes.js)*, `suggestionsVisibles()` *(differe.js)*

Appelée par : `brancherCatalogue`, `chargerCatalogue`, `chargerCatalogueComplet`, `gestesDeck`, `gestesGraphe`, `lireCatalogueFichier`, `loadEdhrec`, `rattraperSuggestions`, `refreshSuggestions`, `renderAll`, `telechargerCatalogue`, `verifierMajCatalogue`

### `renderG()` — ligne 202

Appelle : `blocGraphe()` *(sugGraphe.js)*, `filetSuggestions()` *(suggestions.js)*, `majHint()` *(suggestions.js)*, `noeudsActifs()` *(catalogueEtat.js)*, `poseCorps()` *(suggestions.js)*, `selectionSuggestions()` *(sugListes.js)*

Appelée par : `renderSuggestions`

### `renderH()` — ligne 214

Appelle : `blocEdhrec()` *(sugEdhrec.js)*, `filetSuggestions()` *(suggestions.js)*, `fmt()` *(outils.js)*, `lanceEdhrecSiBesoin()` *(suggestions.js)*, `majHint()` *(suggestions.js)*, `panneauEdhrec()` *(sugCommandants.js)*, `poseCorps()` *(suggestions.js)*, `selectionSuggestions()` *(sugListes.js)*

Appelée par : `renderSuggestions`

### `renderF()` — ligne 227

Appelle : `filetSuggestions()` *(suggestions.js)*, `ligneCatalogue()` *(suggestions.js)*, `listeSuggestions()` *(sugCatalogue.js)*, `majHint()` *(suggestions.js)*, `poseCorps()` *(suggestions.js)*, `selectionSuggestions()` *(sugListes.js)*

Appelée par : `renderSuggestions`

### `refreshSuggestions()` — ligne 237

Appelle : `renderSuggestions()` *(suggestions.js)*, `renderTop()` *(entete.js)*

Appelée par : `app.js (chargement)`, `appliquerAffichage`, `gestesReglages`, `saisieBudget`

### `lanceEdhrecSiBesoin()` — ligne 244

Appelle : `commandantsSecondaires()` *(cartes.js)*, `fmt()` *(outils.js)*, `loadEdhrec()` *(edhrec.js)*, `signatureCommandants()` *(edhrec.js)*

Appelée par : `renderH`, `renderSuggestions`

## js/decksSection.js

### `coutDeck()` — ligne 17

Appelle : `find()` *(cartes.js)*, `multiplicateurAchat()` *(marche.js)*, `quantiteCollection()` *(achats.js)*

Appelée par : `corpsDeck`, `vignetteDeck`

### `puceStatut()` — ligne 30

Appelle : `esc()` *(outils.js)*

Appelée par : `vignetteDeck`

### `vignetteDeck()` — ligne 35

Appelle : `bilanDeck()` *(decks.js)*, `clesDecks()` *(decks.js)*, `coutDeck()` *(decksSection.js)*, `esc()` *(outils.js)*, `eur()` *(outils.js)*, `filtresActifs()` *(filtres.js)*, `puceStatut()` *(decksSection.js)*, `remplissageJauge()` *(legalite.js)*, `restrictionsActives()` *(restrictions.js)*

Appelée par : `renderI`

### `renderI()` — ligne 86

Appelle : `clesDecks()` *(decks.js)*, → `vignetteDeck()` *(decksSection.js)*

Appelée par : `gestesDecks`, `renderAll`

## js/wishlistSection.js

### `decksDemandeurs()` — ligne 15

Appelle : `esc()` *(outils.js)*

Appelée par : `ligneWishlist`

### `ligneWishlist()` — ligne 21

Appelle : `cmLink()` *(marche.js)*, `decksDemandeurs()` *(wishlistSection.js)*, `esc()` *(outils.js)*, `eur()` *(outils.js)*, `stripeColor()` *(symboles.js)*

Appelée par : `renderJ`

### `renderJ()` — ligne 34

Appelle : `bilanWishlist()` *(achats.js)*, `clesDecks()` *(decks.js)*, `esc()` *(outils.js)*, `eur()` *(outils.js)*, `wishlist()` *(achats.js)*, → `ligneWishlist()` *(wishlistSection.js)*

Appelée par : `renderAll`

## js/collection.js

### `couleursOK()` — ligne 13

N'appelle aucune fonction du projet.

Appelée par : `colorOK`, `couleursRestrictionOK`, `restrictionOKRec`

### `colorOK()` — ligne 25

Appelle : `couleursOK()` *(collection.js)*

Appelée par : `carteFiltree`, `causesCollection`, `chercheCartes`, `chercheScryfall`, `ligneCatalogue`, `selectionCandidats`, `vivierSuggestions`

### `ajoutCollection()` — ligne 35

Appelle : `find()` *(cartes.js)*, `recalculerAvecProgression()` *(recalcul.js)*

Appelée par : `pasRecherche`

### `retraitCollection()` — ligne 42

Appelle : `recalculerAvecProgression()` *(recalcul.js)*

Appelée par : `pasRecherche`

### `collectionCards()` — ligne 49

Appelle : `find()` *(cartes.js)*

Appelée par : `brancherRestauration`, `causesCollection`, `exportModal`, `filtered`, `graphCards`, `openWipeModal`, `renderB`, `renderC`, `resumeFiltres`

### `filtered()` — ligne 58

Appelle : `carteRetenue()` *(retenue.js)*, `collectionCards()` *(collection.js)*, `fmt()` *(outils.js)*, `notesCollection()` *(groupes.js)*

Appelée par : `ficheHTML`, `graphCards`, `renderB`, `renderC`, `resumeFiltres`, `vivierSuggestions`

### `causesCollection()` — ligne 76

Appelle : `collectionCards()` *(collection.js)*, `colorOK()` *(collection.js)*, `filtreOK()` *(retenue.js)*, `legaliteOK()` *(retenue.js)*, `restrictionOK()` *(restrictions.js)*, `roleOK()` *(filtres.js)*

Appelée par : `ligneCausesCollection`

### `ligneCausesCollection()` — ligne 90

Appelle : `causesCollection()` *(collection.js)*, `deckCourant()` *(decks.js)*, `esc()` *(outils.js)*, `filtresActifs()` *(filtres.js)*, `fmt()` *(outils.js)*, `nomCombinaisonCouleurs()` *(couleurs.js)*, `texteFiltresActifs()` *(filtres.js)*, `texteRestrictionsActives()` *(restrictions.js)*

Appelée par : `renderB`

### `renderB()` — ligne 101

Appelle : `cardRow()` *(tuiles.js)*, `cardTile()` *(tuiles.js)*, `champRecherche()` *(rechercheSection.js)*, `collectionCards()` *(collection.js)*, `filtered()` *(collection.js)*, `filtresActifs()` *(filtres.js)*, `groupeCartes()` *(groupes.js)*, `groupePlie()` *(barreGroupes.js)*, `ligneCausesCollection()` *(collection.js)*, `noteMultiple()` *(barreGroupes.js)*, `ouvreGrille()` *(barreGroupes.js)*, `queueScryfall()` *(scryfall.js)*, `rendGroupes()` *(barreGroupes.js)*, `renderTop()` *(entete.js)*, `restaureRecherche()` *(rechercheSection.js)*, `vueDe()` *(barreGroupes.js)*

Appelée par : `appliquerAffichage`, `gestesDeck`, `gestesGraphe`, `renderAll`, `runScryQueue`

## js/fenImport.js

### `retireExtrait()` — ligne 24

N'appelle aucune fonction du projet.

Appelée par : `extraitEdition`

### `extraitEdition()` — ligne 28

Appelle : `retireExtrait()` *(fenImport.js)*

Appelée par : `parseMtgoList`

### `parseMtgoList()` — ligne 44

Appelle : `extraitEdition()` *(fenImport.js)*, `norm()` *(cartes.js)*

Appelée par : `adversaireDepuisTexte`, `openImport`

### `openImport()` — ligne 92

Appelle : `annexeListe()` *(annexes.js)*, `buildCard()` *(cartes.js)*, `closeDialog()` *(dialogue.js)*, `completeUnknown()` *(scryfall.js)*, `deckAdd()` *(deck.js)*, `deckEntries()` *(deck.js)*, `eur()` *(outils.js)*, `find()` *(cartes.js)*, `fmt()` *(outils.js)*, `noterImpression()` *(impressions.js)*, `openDialog()` *(dialogue.js)*, `parseMtgoList()` *(fenImport.js)*, `recalculerAvecProgression()` *(recalcul.js)*, `registerCard()` *(cartes.js)*, `spent()` *(achats.js)*, `toast()` *(outils.js)*

Appelée par : `gestesDonnees`

## js/fenAjout.js

### `ajouterCarte()` — ligne 9

Appelle : `deckAdd()` *(deck.js)*, `fmt()` *(outils.js)*, `recalculerAvecProgression()` *(recalcul.js)*, `toast()` *(outils.js)*, `versAnnexe()` *(annexes.js)*

Appelée par : `gestesGraphe`

### `chercheCartes()` — ligne 25

Appelle : `carteTouche()` *(catalogueEtat.js)*, `colorOK()` *(collection.js)*, `getCardOrAnalyzedRec()` *(catalogueEtat.js)*, `noeudsActifs()` *(catalogueEtat.js)*, `norm()` *(cartes.js)*, `recToucheNoeuds()` *(catalogueEtat.js)*

Appelée par : `propositionsHTML`

### `majResultats()` — ligne 96

Appelle : `chercheScryfall()` *(recherches.js)*, `norm()` *(cartes.js)*, `resultatsHTML()` *(simResultats.js)*

Appelée par : `app.js (chargement)`, `gestesGraphe`, `majRecherches`

### `openAdd()` — ligne 107

Appelle : `esc()` *(outils.js)*, `openDialog()` *(dialogue.js)*, `resultatsHTML()` *(simResultats.js)*

Appelée par : `gestesDonnees`

## js/rechercheSection.js

### `etatRecherche()` — ligne 30

N'appelle aucune fonction du projet.

Appelée par : `champRecherche`, `pasRecherche`, `propositionsHTML`, `restaureRecherche`, `saisieRecherche`

### `compteListe()` — ligne 35

N'appelle aucune fonction du projet.

Appelée par : `ligneProposition`

### `champRecherche()` — ligne 40

Appelle : `esc()` *(outils.js)*, `etatRecherche()` *(rechercheSection.js)*, `propositionsHTML()` *(rechercheSection.js)*

Appelée par : `renderB`, `renderE`

### `ligneProposition()` — ligne 54

Appelle : `compteListe()` *(rechercheSection.js)*, `esc()` *(outils.js)*, `manaHTML()` *(symboles.js)*

Appelée par : `propositionsHTML`

### `ligneEnLigne()` — ligne 82

Appelle : `esc()` *(outils.js)*

Appelée par : `propositionsHTML`

### `propositionsHTML()` — ligne 94

Appelle : `chercheCartes()` *(fenAjout.js)*, `esc()` *(outils.js)*, `etatRecherche()` *(rechercheSection.js)*, `find()` *(cartes.js)*, `ligneEnLigne()` *(rechercheSection.js)*, `ligneProposition()` *(rechercheSection.js)*, `norm()` *(cartes.js)*

Appelée par : `champRecherche`, `majPropositions`

### `majPropositions()` — ligne 120

Appelle : `propositionsHTML()` *(rechercheSection.js)*

Appelée par : `majRecherches`, `saisieRecherche`

### `saisieRecherche()` — ligne 127

Appelle : `chercheScryfall()` *(recherches.js)*, `etatRecherche()` *(rechercheSection.js)*, `majPropositions()` *(rechercheSection.js)*, `norm()` *(cartes.js)*

Appelée par : `app.js (chargement)`

### `pasRecherche()` — ligne 141

Appelle : `addToDeck()` *(deck.js)*, `ajoutCollection()` *(collection.js)*, `etatRecherche()` *(rechercheSection.js)*, `removeFromDeck()` *(deck.js)*, `retraitCollection()` *(collection.js)*

Appelée par : `gestesGraphe`, `molletteRecherche`

### `molletteRecherche()` — ligne 156

Appelle : `pasRecherche()` *(rechercheSection.js)*

Appelée par : `app.js (chargement)`

### `restaureRecherche()` — ligne 166

Appelle : `etatRecherche()` *(rechercheSection.js)*

Appelée par : `renderB`, `renderE`

## js/annexes.js

### `annexeListe()` — ligne 10

N'appelle aucune fonction du projet.

Appelée par : `annexeDe`, `annexeEntries`, `annexeSize`, `appliqueCatalogueAuxCartes`, `deckAdd`, `deplacerCarte`, `ficheHTML`, `gestesDonnees`, `majPrix`, `mergeInto`, `openImport`, `renameCard`, `retirerAnnexe`, `tagAnnexe`, `versAnnexe`, `viderAnnexe`

### `annexeEntries()` — ligne 16

Appelle : `annexeListe()` *(annexes.js)*, `find()` *(cartes.js)*, `mainType()` *(cartes.js)*

Appelée par : `blocAnnexe`, `exportModal`, `renderE`

### `annexeSize()` — ligne 25

Appelle : `annexeListe()` *(annexes.js)*

Appelée par : `gestesDeck`, `renderE`

### `annexeDe()` — ligne 32

Appelle : `annexeListe()` *(annexes.js)*

Appelée par : `addToDeck`, `deckAdd`, `deplacerCarte`, `ficheHTML`, `openCardModal`, `tagAnnexe`, `versAnnexe`

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

Appelée par : `cardTile`, `tagsSuggestion`

## js/deck.js

### `deckEntries()` — ligne 10

Appelle : `find()` *(cartes.js)*, `mainType()` *(cartes.js)*

Appelée par : `bilanMana`, `cartesDuDeck`, `cartesHorsRestriction`, `commandantsPossibles`, `commandantsSecondairesPossibles`, `deckCounts`, `deckSignature`, `exportModal`, `ficheHTML`, `gameChangersDuDeck`, `graphCards`, `legality`, `openImport`, `openWipeModal`, `renderE`, `zoneCommandant`

### `deckSignature()` — ligne 21

Appelle : `deckEntries()` *(deck.js)*

Appelée par : `signatureSuggestions`

### `cartesDuDeck()` — ligne 31

Appelle : `deckEntries()` *(deck.js)*

Appelée par : `contexteEvaluation`, `ficheHTML`

### `deckSize()` — ligne 35

N'appelle aucune fonction du projet.

Appelée par : `brancherRestauration`, `exportModal`, `legality`, `noteCarte`, `renderE`

### `availableFor()` — ligne 41

N'appelle aucune fonction du projet.

Appelée par : `addToDeck`, `cardRow`, `cardTile`, `deckAdd`, `ficheHTML`, `openCardModal`, `vivierSuggestions`

### `addToDeck()` — ligne 45

Appelle : `annexeDe()` *(annexes.js)*, `availableFor()` *(deck.js)*, `cmEstimate()` *(marche.js)*, `deplacerCarte()` *(annexes.js)*, `eur()` *(outils.js)*, `find()` *(cartes.js)*, `fmt()` *(outils.js)*, `recalculerAvecProgression()` *(recalcul.js)*, `toast()` *(outils.js)*

Appelée par : `gestesDeck`, `pasRecherche`

### `deckAdd()` — ligne 71

Appelle : `annexeDe()` *(annexes.js)*, `annexeListe()` *(annexes.js)*, `availableFor()` *(deck.js)*, `fmt()` *(outils.js)*

Appelée par : `ajouterCarte`, `buyCard`, `openImport`

### `removeFromDeck()` — ligne 93

Appelle : `recalculerAvecProgression()` *(recalcul.js)*

Appelée par : `gestesDeck`, `pasRecherche`

### `buyCard()` — ligne 102

Appelle : `bestOffer()` *(marche.js)*, `deckAdd()` *(deck.js)*, `eur()` *(outils.js)*, `find()` *(cartes.js)*, `recalculerAvecProgression()` *(recalcul.js)*, `spent()` *(achats.js)*, `toast()` *(outils.js)*

Appelée par : `gestesDeck`

## js/legalite.js

### `gameChangersDuDeck()` — ligne 16

Appelle : `deckEntries()` *(deck.js)*, `estGameChanger()` *(retenue.js)*

Appelée par : `ligneGameChangers`, `renderE`

### `ligneGameChangers()` — ligne 21

Appelle : `esc()` *(outils.js)*, `fmt()` *(outils.js)*, `gameChangersConnus()` *(retenue.js)*, `gameChangersDuDeck()` *(legalite.js)*

Appelée par : `renderE`

### `ciblesParDefaut()` — ligne 36

Appelle : `fmt()` *(outils.js)*

Appelée par : `corpsCibles`, `reglerCible`, `targets`

### `ciblesReglees()` — ligne 47

N'appelle aucune fonction du projet.

Appelée par : `boutonCibles`, `corpsCibles`, `gauge`, `targets`

### `targets()` — ligne 54

Appelle : `ciblesParDefaut()` *(legalite.js)*, `ciblesReglees()` *(legalite.js)*

Appelée par : `contexteEvaluation`, `corpsCibles`, `corpsDeck`, `corpsFiltres`, `deckCounts`, `ficheHTML`, `renderE`

### `reglerCible()` — ligne 66

Appelle : `ciblesParDefaut()` *(legalite.js)*, `fmt()` *(outils.js)*

Appelée par : `app.js (chargement)`

### `reinitCibles()` — ligne 76

N'appelle aucune fonction du projet.

Appelée par : `gestesReglages`

### `deckCounts()` — ligne 80

Appelle : `deckEntries()` *(deck.js)*, `targets()` *(legalite.js)*

Appelée par : `contexteEvaluation`, `corpsCibles`, `ficheHTML`, `renderE`

### `boutonCibles()` — ligne 99

Appelle : `ciblesReglees()` *(legalite.js)*

Appelée par : `renderE`

### `remplissageJauge()` — ligne 107

N'appelle aucune fonction du projet.

Appelée par : `gauge`, `vignetteDeck`

### `ecartJauge()` — ligne 114

N'appelle aucune fonction du projet.

Appelée par : `gauge`

### `gauge()` — ligne 119

Appelle : `ciblesReglees()` *(legalite.js)*, `ecartJauge()` *(legalite.js)*, `esc()` *(outils.js)*, `remplissageJauge()` *(legalite.js)*, `rolesFiltre()` *(filtres.js)*

Appelée par : `renderE`

### `legality()` — ligne 132

Appelle : `carteLegale()` *(retenue.js)*, `cartesHorsRestriction()` *(restrictions.js)*, `deckEntries()` *(deck.js)*, `deckSize()` *(deck.js)*, `eur()` *(outils.js)*, `find()` *(cartes.js)*, `fmt()` *(outils.js)*, `spent()` *(achats.js)*, `texteRestrictionsActives()` *(restrictions.js)*

Appelée par : `renderE`

## js/deckSection.js

### `blocAchats()` — ligne 10

Appelle : `aAcheter()` *(achats.js)*, `cmLink()` *(marche.js)*, `esc()` *(outils.js)*, `eur()` *(outils.js)*, `stripeColor()` *(symboles.js)*

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

Appelle : `annexeEntries()` *(annexes.js)*, `cardRow()` *(tuiles.js)*, `cardTile()` *(tuiles.js)*, `carteFiltree()` *(filtres.js)*, `esc()` *(outils.js)*, `eur()` *(outils.js)*, `groupeCartes()` *(groupes.js)*, `ouvreGrille()` *(barreGroupes.js)*, `partieDeck()` *(deckSection.js)*, `rendGroupes()` *(barreGroupes.js)*, `vueDe()` *(barreGroupes.js)*

Appelée par : `renderE`

### `renderE()` — ligne 146

Appelle : `aAcheter()` *(achats.js)*, `annexeSize()` *(annexes.js)*, `blocAchats()` *(deckSection.js)*, `blocMana()` *(mana.js)*, `boutonCibles()` *(legalite.js)*, `cardRow()` *(tuiles.js)*, `cardTile()` *(tuiles.js)*, `carteFiltree()` *(filtres.js)*, `champRecherche()` *(rechercheSection.js)*, `deckCounts()` *(legalite.js)*, `deckEntries()` *(deck.js)*, `deckSize()` *(deck.js)*, `esc()` *(outils.js)*, `eur()` *(outils.js)*, `evalueDeck()` *(deckSection.js)*, `fmt()` *(outils.js)*, `gameChangersConnus()` *(retenue.js)*, `gameChangersDuDeck()` *(legalite.js)*, `gauge()` *(legalite.js)*, `groupeCartes()` *(groupes.js)*, `histogram()` *(stats.js)*, `legality()` *(legalite.js)*, `ligneGameChangers()` *(legalite.js)*, `noteMultiple()` *(barreGroupes.js)*, `ouvreGrille()` *(barreGroupes.js)*, `partieDeck()` *(deckSection.js)*, `queueScryfall()` *(scryfall.js)*, `rendGroupes()` *(barreGroupes.js)*, `repartitionCmc()` *(stats.js)*, `restaureRecherche()` *(rechercheSection.js)*, `spent()` *(achats.js)*, `targets()` *(legalite.js)*, `vueDe()` *(barreGroupes.js)*, `zoneCommandant()` *(deckSection.js)*, → `annexeEntries()` *(annexes.js)*, → `blocAnnexe()` *(deckSection.js)*

Appelée par : `app.js (chargement)`, `appliquerAffichage`, `renderAll`, `runScryQueue`

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

## js/simCartes.js

### `ficheDeCarte()` — ligne 23

N'appelle aucune fonction du projet.

Appelée par : `ficheParNom`

### `ficheDeRec()` — ligne 29

Appelle : `champsJeuRec()` *(champsJeu.js)*

Appelée par : `ficheParNom`

### `ficheDeScryfall()` — ligne 37

Appelle : `champsJeuScryfall()` *(champsJeu.js)*, `nombreOuRien()` *(champsJeu.js)*

Appelée par : `chercheFichesScryfall`

### `indexArchive()` — ligne 50

Appelle : `catalogueAbsent()` *(catalogueEtat.js)*, `norm()` *(cartes.js)*

Appelée par : `ficheParNom`

### `ficheParNom()` — ligne 67

Appelle : `ficheDeCarte()` *(simCartes.js)*, `ficheDeRec()` *(simCartes.js)*, `find()` *(cartes.js)*, `indexArchive()` *(simCartes.js)*, `norm()` *(cartes.js)*

Appelée par : `nomsManquants`, `ouvreComportement`, `resolutionAdversaire`, `siegeDepuisListe`

### `chargeSimCartes()` — ligne 80

Appelle : `idbLire()` *(idb.js)*, `norm()` *(cartes.js)*

Appelée par : `completeAdversaire`, `lanceSimulation`, `renderK`

### `rangeSimCartes()` — ligne 89

Appelle : `idbEcrire()` *(idb.js)*

Appelée par : `chercheFichesScryfall`

### `chercheFichesScryfall()` — ligne 95

Appelle : `ficheDeScryfall()` *(simCartes.js)*, `norm()` *(cartes.js)*, `rangeSimCartes()` *(simCartes.js)*

Appelée par : `completeAdversaire`, `lanceSimulation`

## js/simAdversaires.js

### `cleAdversaireNeuve()` — ligne 12

N'appelle aucune fonction du projet.

Appelée par : `enregistreAdversaire`

### `adversaireDepuisTexte()` — ligne 18

Appelle : `parseMtgoList()` *(fenImport.js)*

Appelée par : `enregistreAdversaireFenetre`, `majApercuAdversaire`

### `enregistreAdversaire()` — ligne 34

Appelle : `cleAdversaireNeuve()` *(simAdversaires.js)*

Appelée par : `enregistreAdversaireFenetre`

### `nbCartesAdversaire()` — ligne 43

N'appelle aucune fonction du projet.

Appelée par : `adversairesHTML`, `majApercuAdversaire`

### `resolutionAdversaire()` — ligne 48

Appelle : `ficheParNom()` *(simCartes.js)*

Appelée par : `adversairesHTML`, `completeAdversaire`, `majApercuAdversaire`

### `completeAdversaire()` — ligne 56

Appelle : `chargeSimCartes()` *(simCartes.js)*, `chercheFichesScryfall()` *(simCartes.js)*, `resolutionAdversaire()` *(simAdversaires.js)*

Appelée par : `enregistreAdversaireFenetre`

### `signatureAdversaire()` — ligne 67

Appelle : `empreinte()` *(definitions.js)*

Appelée par : `couvertureTable`, `lotPerime`, `terminerLot`

### `signatureDeck()` — ligne 73

Appelle : `empreinte()` *(definitions.js)*

Appelée par : `couvertureTable`, `lotPerime`, `terminerLot`

## js/simPreparation.js

### `vieDuFormat()` — ligne 10

N'appelle aucune fonction du projet.

Appelée par : `siegeDepuisListe`

### `comportementDe()` — ligne 16

N'appelle aucune fonction du projet.

Appelée par : `siegeDepuisListe`

### `bilanCouverture()` — ligne 24

N'appelle aucune fonction du projet.

Appelée par : `siegeDepuisListe`

### `siegeDepuisListe()` — ligne 38

Appelle : `bilanCouverture()` *(simPreparation.js)*, `comportementDe()` *(simPreparation.js)*, `definitionDe()` *(definitions.js)*, `ficheParNom()` *(simCartes.js)*, `vieDuFormat()` *(simPreparation.js)*

Appelée par : `siegeAdversaire`, `siegeDeck`

### `siegeDeck()` — ligne 60

Appelle : `siegeDepuisListe()` *(simPreparation.js)*

Appelée par : `couvertureTable`, `lanceSimulation`, `rejouePartie`

### `siegeAdversaire()` — ligne 69

Appelle : `siegeDepuisListe()` *(simPreparation.js)*

Appelée par : `couvertureTable`, `lanceSimulation`, `rejouePartie`

### `nomsManquants()` — ligne 75

Appelle : `ficheParNom()` *(simCartes.js)*

Appelée par : `lanceSimulation`

### `fiabilite()` — ligne 88

N'appelle aucune fonction du projet.

Appelée par : `terminerLot`

### `signatureComportements()` — ligne 95

Appelle : `empreinte()` *(definitions.js)*

Appelée par : `couvertureTable`, `lotPerime`, `terminerLot`

## js/simStats.js

### `wilson()` — ligne 15

N'appelle aucune fonction du projet.

Appelée par : `agrege`

### `mesuresPartie()` — ligne 24

N'appelle aucune fonction du projet.

Appelée par : `lanceSimulation`

### `agrege()` — ligne 44

Appelle : `statsCartes()` *(simStats.js)*, `wilson()` *(simStats.js)*

Appelée par : `terminerLot`

### `statsCartes()` — ligne 81

N'appelle aucune fonction du projet.

Appelée par : `agrege`

## js/simStockage.js

### `chargeResultats()` — ligne 16

Appelle : `idbLire()` *(idb.js)*

Appelée par : `renderK`

### `rangeResultats()` — ligne 25

Appelle : `idbEcrire()` *(idb.js)*

Appelée par : `ajouteLot`, `supprimeLot`

### `ajouteLot()` — ligne 29

Appelle : `rangeResultats()` *(simStockage.js)*

Appelée par : `terminerLot`

### `supprimeLot()` — ligne 36

Appelle : `rangeResultats()` *(simStockage.js)*

Appelée par : `gestesSimulation`

### `lotParId()` — ligne 42

N'appelle aucune fonction du projet.

Appelée par : `ouvreJournal`, `resultatsHTML`

### `lotPerime()` — ligne 47

Appelle : `signatureAdversaire()` *(simAdversaires.js)*, `signatureComportements()` *(simPreparation.js)*, `signatureDeck()` *(simAdversaires.js)*

Appelée par : `historiqueHTML`, `lotHTML`, `rejouePartie`

### `cleTable()` — ligne 57

N'appelle aucune fonction du projet.

Appelée par : `classement`

### `classement()` — ligne 61

Appelle : `cleTable()` *(simStockage.js)*

Appelée par : `historiqueHTML`

## js/simulation.js

### `rendMain()` — ligne 21

N'appelle aucune fonction du projet.

Appelée par : `lanceSimulation`

### `configSimulation()` — ligne 26

N'appelle aucune fonction du projet.

Appelée par : `enregistreAdversaireFenetre`, `lanceSimulation`, `renderK`

### `obstacleSimulation()` — ligne 36

N'appelle aucune fonction du projet.

Appelée par : `lanceSimulation`

### `placesPartie()` — ligne 43

N'appelle aucune fonction du projet.

Appelée par : `lanceSimulation`, `rejouePartie`

### `graineDePartie()` — ligne 48

Appelle : `brasse()` *(jeuHasard.js)*

Appelée par : `lanceSimulation`, `rejouePartie`

### `majProgressionSim()` — ligne 50

N'appelle aucune fonction du projet.

Appelée par : `lanceSimulation`, `renderK`

### `lanceSimulation()` — ligne 59

Appelle : `agentIA()` *(iaAgent.js)*, `avance()` *(jeuPilote.js)*, `chargeSimCartes()` *(simCartes.js)*, `chercheFichesScryfall()` *(simCartes.js)*, `configSimulation()` *(simulation.js)*, `creePartie()` *(jeuPilote.js)*, `graineDePartie()` *(simulation.js)*, `majProgressionSim()` *(simulation.js)*, `mesuresPartie()` *(simStats.js)*, `nomsManquants()` *(simPreparation.js)*, `obstacleSimulation()` *(simulation.js)*, `placesPartie()` *(simulation.js)*, `rendMain()` *(simulation.js)*, `renderK()` *(simSection.js)*, `siegeDeck()` *(simPreparation.js)*, `signalerTravail()` *(rendu.js)*, `terminerLot()` *(simulation.js)*, `toast()` *(outils.js)*, → `siegeAdversaire()` *(simPreparation.js)*

Appelée par : `gestesSimulation`

### `terminerLot()` — ligne 99

Appelle : `agrege()` *(simStats.js)*, `ajouteLot()` *(simStockage.js)*, `fiabilite()` *(simPreparation.js)*, `renderK()` *(simSection.js)*, `signalerTravail()` *(rendu.js)*, `signatureAdversaire()` *(simAdversaires.js)*, `signatureComportements()` *(simPreparation.js)*, `signatureDeck()` *(simAdversaires.js)*, `toast()` *(outils.js)*

Appelée par : `lanceSimulation`

### `arreteSimulation()` — ligne 120

N'appelle aucune fonction du projet.

Appelée par : `gestesSimulation`

### `rejouePartie()` — ligne 124

Appelle : `agentIA()` *(iaAgent.js)*, `graineDePartie()` *(simulation.js)*, `joueJusquauBout()` *(jeuPilote.js)*, `lotPerime()` *(simStockage.js)*, `placesPartie()` *(simulation.js)*, `siegeDeck()` *(simPreparation.js)*, → `siegeAdversaire()` *(simPreparation.js)*

Appelée par : `ouvreJournal`

## js/simSection.js

### `couvertureTable()` — ligne 16

Appelle : `siegeAdversaire()` *(simPreparation.js)*, `siegeDeck()` *(simPreparation.js)*, `signatureAdversaire()` *(simAdversaires.js)*, `signatureComportements()` *(simPreparation.js)*, `signatureDeck()` *(simAdversaires.js)*

Appelée par : `couvertureHTML`

### `optionsHTML()` — ligne 27

Appelle : `esc()` *(outils.js)*

Appelée par : `ouvreAdversaire`, `tableHTML`

### `tableHTML()` — ligne 32

Appelle : `clesDecks()` *(decks.js)*, `optionsHTML()` *(simSection.js)*

Appelée par : `renderK`

### `adversairesHTML()` — ligne 60

Appelle : `esc()` *(outils.js)*, `nbCartesAdversaire()` *(simAdversaires.js)*, `resolutionAdversaire()` *(simAdversaires.js)*

Appelée par : `renderK`

### `badgeCouverture()` — ligne 84

N'appelle aucune fonction du projet.

Appelée par : `couvertureHTML`, `lectureHTML`

### `couvertureHTML()` — ligne 90

Appelle : `badgeCouverture()` *(simSection.js)*, `couvertureTable()` *(simSection.js)*, `esc()` *(outils.js)*

Appelée par : `renderK`

### `renderK()` — ligne 110

Appelle : `adversairesHTML()` *(simSection.js)*, `chargeResultats()` *(simStockage.js)*, `chargeSimCartes()` *(simCartes.js)*, `configSimulation()` *(simulation.js)*, `couvertureHTML()` *(simSection.js)*, `majProgressionSim()` *(simulation.js)*, `resultatsHTML()` *(simResultats.js)*, `tableHTML()` *(simSection.js)*

Appelée par : `appliqueComportement`, `effaceComportement`, `enregistreAdversaireFenetre`, `entete.js (chargement)`, `gestesSimulation`, `lanceSimulation`, `reglageSimulation`, `renderAll`, `supprimeAdversaireOui`, `terminerLot`

## js/simResultats.js

### `barresHTML()` — ligne 16

Appelle : `esc()` *(outils.js)*

Appelée par : `lotHTML`

### `cartesHTML()` — ligne 25

Appelle : `esc()` *(outils.js)*

Appelée par : `lotHTML`

### `partiesHTML()` — ligne 40

Appelle : `esc()` *(outils.js)*

Appelée par : `lotHTML`

### `lotHTML()` — ligne 50

Appelle : `barresHTML()` *(simResultats.js)*, `cartesHTML()` *(simResultats.js)*, `esc()` *(outils.js)*, `lotPerime()` *(simStockage.js)*, `partiesHTML()` *(simResultats.js)*

Appelée par : `resultatsHTML`

### `historiqueHTML()` — ligne 86

Appelle : `classement()` *(simStockage.js)*, `esc()` *(outils.js)*, `lotPerime()` *(simStockage.js)*

Appelée par : `resultatsHTML`

### `resultatsHTML()` — ligne 107

Appelle : `historiqueHTML()` *(simResultats.js)*, `lotHTML()` *(simResultats.js)*, `lotParId()` *(simStockage.js)*

Appelée par : `majResultats`, `openAdd`, `renderK`

## js/outils.js

### `esc()` — ligne 10

N'appelle aucune fonction du projet.

Appelée par : `acteSuggestion`, `actesAnnexe`, `adversairesHTML`, `aideFormules`, `barreCatalogue`, `barresHTML`, `blocAchats`, `blocAnnexe`, `blocCatalogue`, `blocEdhrec`, `blocGraphe`, `blocVersions`, `cardRow`, `cardTile`, `cartesHTML`, `champBudget`, `champDeck`, `champRecherche`, `corpsAffichage`, `corpsBoiteRecalcul`, `corpsBudget`, `corpsCibles`, `corpsDeck`, `corpsFiltres`, `corpsFormat`, `corpsSauvegarde`, `couvertureHTML`, `decksDemandeurs`, `enteteFiche`, `enveloppeGroupe`, `etatArchetypes`, `etatSets`, `exportModal`, `ficheHTML`, `ficheTexteHTML`, `gauge`, `gestesDeck`, `gestesDecks`, `historiqueHTML`, `lectureHTML`, `lienDecksEdhrec`, `ligneAchats`, `ligneCatalogue`, `ligneCausesCollection`, `ligneCible`, `ligneCommandant`, `ligneEnLigne`, `ligneFiltre`, `ligneGameChangers`, `ligneMana`, `ligneProposition`, `ligneRestriction`, `ligneWishlist`, `listeArchetypesHTML`, `listeSetsHTML`, `lotHTML`, `majApercu`, `majApercuAdversaire`, `majBoutonAffichage`, `montrerApercu`, `nuageConflits`, `nuageCorpsConnecte`, `nuageCorpsDeconnecte`, `nuageDetail`, `nuageEtatLigne`, `nuageOu`, `openAdd`, `openCardModal`, `openDialog`, `openWantsModal`, `optionsHTML`, `ouvreAdversaire`, `ouvreComportement`, `ouvreJournal`, `paginationListe`, `panneauEdhrec`, `partiesHTML`, `proposerMajCatalogue`, `propositionsHTML`, `puceStatut`, `refCarte`, `renderD`, `renderE`, `renderJ`, `renderTop`, `resumeDeckConfig`, `resumeFiltres`, `sectionParametres`, `sugLigne`, `sugRow`, `supprimeAdversaire`, `svgGraph`, `symBg`, `symIcon`, `tagAnnexe`, `tagDeck`, `tagEdhrec`, `tagIllegal`, `vignetteDeck`, `zoneCommandant`

### `eur()` — ligne 14

N'appelle aucune fonction du projet.

Appelée par : `addToDeck`, `blocAchats`, `blocAnnexe`, `blocEdhrec`, `buyCard`, `cardRow`, `cardTile`, `corpsDeck`, `entete.js (chargement)`, `exportModal`, `ficheHTML`, `legality`, `ligneAchats`, `ligneBudget`, `ligneCatalogue`, `ligneWishlist`, `noteCarte`, `openImport`, `openWantsModal`, `renderC`, `renderE`, `renderJ`, `resumeDeckConfig`, `sugLigne`, `sugRow`, `vignetteDeck`

### `refCarte()` — ligne 18

Appelle : `esc()` *(outils.js)*

Appelée par : `ficheHTML`, `renderD`

### `fmt()` — ligne 22

N'appelle aucune fonction du projet.

Appelée par : `addToDeck`, `ajouterCarte`, `app.js (chargement)`, `blocEdhrec`, `cardRow`, `cardTile`, `carteLegale`, `ciblesParDefaut`, `contexteEvaluation`, `corpsCibles`, `corpsFormat`, `deckAdd`, `deplacerCarte`, `exportModal`, `filtered`, `gestesReglages`, `lanceEdhrecSiBesoin`, `legality`, `ligneCatalogue`, `ligneCausesCollection`, `ligneCible`, `ligneGameChangers`, `openImport`, `panneauEdhrec`, `reglerCible`, `renderC`, `renderE`, `renderH`, `renderTop`, `requeteCatalogue`, `resumeFormat`, `selectionCandidats`, `tagIllegal`

### `toast()` — ligne 37

N'appelle aucune fonction du projet.

Appelée par : `addToDeck`, `ajouterCarte`, `app.js (chargement)`, `appliqueComportement`, `brancherCatalogue`, `brancherRestauration`, `brancherSauvegarde`, `buyCard`, `chargerArchetypesEdhrec`, `choisirVersion`, `completeUnknown`, `deplacerCarte`, `effaceComportement`, `enregistreAdversaireFenetre`, `enrichAllUnknown`, `exportModal`, `gestesDeck`, `gestesDecks`, `gestesDonnees`, `gestesNuage`, `gestesReglages`, `lanceSimulation`, `lireCatalogueFichier`, `loadEdhrec`, `majCatalogue`, `majPrix`, `nuageDemarrer`, `nuageDiagnostic`, `nuageSynchro`, `openImport`, `openWantsModal`, `openWipeModal`, `ouvreComportement`, `ouvreJournal`, `runScryQueue`, `save`, `telechargerCatalogue`, `terminerLot`, `versAnnexe`, `viderAnnexe`

## js/theme.js

### `themeDuSysteme()` — ligne 24

N'appelle aucune fonction du projet.

Appelée par : `reprendTheme`

### `appliqueTheme()` — ligne 31

N'appelle aucune fonction du projet.

Appelée par : `basculeTheme`, `reprendTheme`

### `reprendTheme()` — ligne 42

Appelle : `appliqueTheme()` *(theme.js)*, `themeDuSysteme()` *(theme.js)*

Appelée par : `demarrer`

### `basculeTheme()` — ligne 54

Appelle : `appliqueTheme()` *(theme.js)*, `scheduleSave()` *(stockage.js)*

Appelée par : `app.js (chargement)`

## js/dialogue.js

### `openDialog()` — ligne 13

Appelle : `esc()` *(outils.js)*

Appelée par : `annonceRecalcul`, `exportModal`, `gestesDeck`, `gestesDecks`, `gestesDonnees`, `gestesNuage`, `openAdd`, `openAffichageModal`, `openBudgetModal`, `openCardModal`, `openCiblesModal`, `openDeckModal`, `openFiltresModal`, `openFormatModal`, `openImport`, `openParametresModal`, `openWantsModal`, `openWipeModal`, `ouvreAdversaire`, `ouvreComportement`, `ouvreJournal`, `ouvrirBoiteCatalogue`, `proposerMajCatalogue`, `supprimeAdversaire`

### `closeDialog()` — ligne 37

N'appelle aucune fonction du projet.

Appelée par : `app.js (chargement)`, `appliqueComportement`, `appliquerAffichage`, `appliquerBudget`, `appliquerCibles`, `appliquerDeck`, `appliquerFiltres`, `appliquerFormat`, `appliquerParametres`, `effaceComportement`, `enregistreAdversaireFenetre`, `fermerBoiteCatalogue`, `finRecalcul`, `gestesDeck`, `gestesDecks`, `gestesDonnees`, `gestesGraphe`, `gestesNuage`, `gestesVue`, `openImport`, `openWipeModal`, `supprimeAdversaireOui`

## js/brouillon.js

### `ouvreBrouillon()` — ligne 23

Appelle : `copieEtat()` *(brouillon.js)*

Appelée par : `openAffichageModal`, `openBudgetModal`, `openCiblesModal`, `openDeckModal`, `openFiltresModal`, `openFormatModal`, `openParametresModal`

### `copieEtat()` — ligne 33

N'appelle aucune fonction du projet.

Appelée par : `ouvreBrouillon`

### `echangeBrouillon()` — ligne 50

N'appelle aucune fonction du projet.

Appelée par : `avecBrouillon`, `modifieBrouillon`

### `reprendEtat()` — ligne 59

N'appelle aucune fonction du projet.

Appelée par : `avecBrouillon`, `modifieBrouillon`

### `avecBrouillon()` — ligne 69

Appelle : `echangeBrouillon()` *(brouillon.js)*, `reprendEtat()` *(brouillon.js)*

Appelée par : `appliquerAffichage`, `corpsAffichage`, `corpsBudget`, `corpsCatalogue`, `corpsCibles`, `corpsDeck`, `corpsFiltres`, `corpsFormat`, `gestesVue`, `majListeArchetypes`, `majListeSets`, `majResumeBudget`, `majResumeFormat`, `resumeDeckConfig`, `resumeFiltres`

### `modifieBrouillon()` — ligne 77

Appelle : `echangeBrouillon()` *(brouillon.js)*, `reprendEtat()` *(brouillon.js)*

Appelée par : `app.js (chargement)`, `appliquerAffichage`, `gestesDeckConfig`, `gestesDecks`, `gestesReglages`, `gestesVue`, `glisseColonnes`, `reglageAffichage`, `saisieBudget`, `saisieDeck`

### `brouillonModifie()` — ligne 84

Appelle : `memeEtat()` *(brouillon.js)*

Appelée par : `resumeFiltres`

### `texteEtat()` — ligne 93

N'appelle aucune fonction du projet.

Appelée par : `memeEtat`

### `memeEtat()` — ligne 101

Appelle : `texteEtat()` *(brouillon.js)*

Appelée par : `brouillonModifie`

### `apresReglage()` — ligne 113

Appelle : `degeleSuggestions()` *(sugOrdre.js)*, `invaliderCandidats()` *(candidats.js)*, `majFenetreFiltres()` *(fenFiltres.js)*, `recalculerAvecProgression()` *(recalcul.js)*

Appelée par : `app.js (chargement)`, `gestesDeck`, `gestesDecks`, `gestesReglages`, `gestesVue`

### `renderAllSiApplique()` — ligne 128

Appelle : `majResumeFiltres()` *(fenFiltres.js)*, `renderAll()` *(rendu.js)*

Appelée par : `chargerArchetypesEdhrec`, `chargerSetScryfall`, `chargerThemeEdhrec`

### `verseBrouillon()` — ligne 139

Appelle : `invaliderCandidats()` *(candidats.js)*

Appelée par : `appliquerAffichage`, `appliquerBudget`, `appliquerCibles`, `appliquerDeck`, `appliquerFiltres`, `appliquerFormat`, `appliquerParametres`

### `fermetureBrouillon()` — ligne 149

N'appelle aucune fonction du projet.

Appelée par : `app.js (chargement)`

## js/couleurs.js

### `nomCombinaisonCouleurs()` — ligne 48

N'appelle aucune fonction du projet.

Appelée par : `corpsDeck`, `corpsFiltres`, `ligneCausesCollection`, `renderTop`, `restrictionsActives`

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

### `tagIllegal()` — ligne 13

Appelle : `carteLegale()` *(retenue.js)*, `esc()` *(outils.js)*, `fmt()` *(outils.js)*

Appelée par : `cardRow`, `cardTile`, `tagsSuggestion`

### `tagGameChanger()` — ligne 22

Appelle : `estGameChanger()` *(retenue.js)*

Appelée par : `cardRow`, `cardTile`, `tagsSuggestion`

### `tagDeck()` — ligne 35

Appelle : `esc()` *(outils.js)*

Appelée par : `cardRow`, `cardTile`

### `actesAnnexe()` — ligne 52

Appelle : `esc()` *(outils.js)*

Appelée par : `cardRow`, `cardTile`

### `cardTile()` — ligne 64

Appelle : `aDeuxFaces()` *(versions.js)*, `actesAnnexe()` *(tuiles.js)*, `availableFor()` *(deck.js)*, `esc()` *(outils.js)*, `eur()` *(outils.js)*, `faceVisible()` *(versions.js)*, `fmt()` *(outils.js)*, `libelleFamillesLarges()` *(liens.js)*, `nbCartesLarges()` *(notation.js)*, `nbInteractions()` *(notation.js)*, `nbLiens()` *(notation.js)*, `tagAnnexe()` *(annexes.js)*, `tagDeck()` *(tuiles.js)*, `tagGameChanger()` *(tuiles.js)*, `tagIllegal()` *(tuiles.js)*

Appelée par : `blocAnnexe`, `renderB`, `renderE`

### `cardRow()` — ligne 115

Appelle : `actesAnnexe()` *(tuiles.js)*, `availableFor()` *(deck.js)*, `esc()` *(outils.js)*, `eur()` *(outils.js)*, `fmt()` *(outils.js)*, `manaHTML()` *(symboles.js)*, `tagDeck()` *(tuiles.js)*, `tagGameChanger()` *(tuiles.js)*, `tagIllegal()` *(tuiles.js)*

Appelée par : `blocAnnexe`, `renderB`, `renderE`

### `customPanel()` — ligne 143

N'appelle aucune fonction du projet.

Appelée par : `corpsFormat`

### `tagEdhrec()` — ligne 167

Appelle : `esc()` *(outils.js)*

Appelée par : `sugLigne`, `sugRow`

### `tagsSuggestion()` — ligne 183

Appelle : `libelleFamillesLarges()` *(liens.js)*, `nbCartesLarges()` *(notation.js)*, `nbInteractions()` *(notation.js)*, `nbLiens()` *(notation.js)*, `tagAnnexe()` *(annexes.js)*, `tagGameChanger()` *(tuiles.js)*, `tagIllegal()` *(tuiles.js)*

Appelée par : `sugLigne`, `sugRow`

### `acteSuggestion()` — ligne 197

Appelle : `esc()` *(outils.js)*

Appelée par : `sugLigne`, `sugRow`

### `sugRow()` — ligne 206

Appelle : `acteSuggestion()` *(tuiles.js)*, `esc()` *(outils.js)*, `eur()` *(outils.js)*, `nbInteractions()` *(notation.js)*, `tagEdhrec()` *(tuiles.js)*, `tagsSuggestion()` *(tuiles.js)*

Appelée par : `corpsSug`

### `sugLigne()` — ligne 235

Appelle : `acteSuggestion()` *(tuiles.js)*, `esc()` *(outils.js)*, `eur()` *(outils.js)*, `manaHTML()` *(symboles.js)*, `nbInteractions()` *(notation.js)*, `tagEdhrec()` *(tuiles.js)*, `tagsSuggestion()` *(tuiles.js)*

Appelée par : `corpsSug`

## js/ancre.js

### `candidatsAncre()` — ligne 12

N'appelle aucune fonction du projet.

Appelée par : `releveAncre`

### `releveAncre()` — ligne 16

Appelle : `candidatsAncre()` *(ancre.js)*

Appelée par : `nuageTour`, `recalculerAvecProgression`

### `restaureAncre()` — ligne 41

N'appelle aucune fonction du projet.

Appelée par : `nuageTour`, `recalculerAvecProgression`

## js/differe.js

### `suggestionsVisibles()` — ligne 30

N'appelle aucune fonction du projet.

Appelée par : `currentSuggestions`, `rattraperSuggestions`, `recalculLong`, `renderSuggestions`

### `marqueOngletsPerimes()` — ligne 38

Appelle : `ongletDeSection()` *(etat.js)*

Appelée par : `differerSuggestions`, `rattraperSuggestions`

### `differerSuggestions()` — ligne 54

Appelle : `marqueOngletsPerimes()` *(differe.js)*

Appelée par : `currentSuggestions`, `renderSuggestions`

### `rattraperSuggestions()` — ligne 64

Appelle : `marqueOngletsPerimes()` *(differe.js)*, `recalculerAvecProgression()` *(recalcul.js)*, `renderSuggestions()` *(suggestions.js)*, `suggestionsAJour()` *(vivier.js)*, `suggestionsVisibles()` *(differe.js)*

Appelée par : `entete.js (chargement)`

## js/recalcul.js

### `pause()` — ligne 19

N'appelle aucune fonction du projet.

Appelée par : `filtrerAvecProgression`, `recalculerAvecProgression`

### `recalculLong()` — ligne 25

Appelle : `signatureCandidats()` *(candidats.js)*, `suggestionsAJour()` *(vivier.js)*, `suggestionsVisibles()` *(differe.js)*

Appelée par : `filetSuggestions`, `recalculerAvecProgression`

### `corpsBoiteRecalcul()` — ligne 43

Appelle : `esc()` *(outils.js)*, `zoneProgression()` *(fenFiltres.js)*

Appelée par : `annonceRecalcul`

### `annonceRecalcul()` — ligne 56

Appelle : `corpsBoiteRecalcul()` *(recalcul.js)*, `openDialog()` *(dialogue.js)*, `zoneProgression()` *(fenFiltres.js)*

Appelée par : `recalculerAvecProgression`

### `finRecalcul()` — ligne 73

Appelle : `closeDialog()` *(dialogue.js)*

Appelée par : `recalculerAvecProgression`

### `progresSection()` — ligne 89

Appelle : `signalerTravail()` *(rendu.js)*

Appelée par : `recalculerAvecProgression`

### `finProgresSection()` — ligne 114

Appelle : `signalerTravail()` *(rendu.js)*

Appelée par : `recalculerAvecProgression`

### `recalculerAvecProgression()` — ligne 133

Appelle : `annonceRecalcul()` *(recalcul.js)*, `finProgresSection()` *(recalcul.js)*, `finRecalcul()` *(recalcul.js)*, `geleSuggestions()` *(sugOrdre.js)*, `majProgression()` *(fenFiltres.js)*, `pause()` *(recalcul.js)*, `prechauffeCandidats()` *(candidats.js)*, `prepareSuggestions()` *(vivier.js)*, `progresSection()` *(recalcul.js)*, `recalculLong()` *(recalcul.js)*, `releveAncre()` *(ancre.js)*, `renderAll()` *(rendu.js)*, `restaureAncre()` *(ancre.js)*

Appelée par : `activerDeck`, `addToDeck`, `ajoutCollection`, `ajouterCarte`, `apresReglage`, `buyCard`, `chargerCatalogueComplet`, `filetSuggestions`, `gestesDeck`, `gestesDecks`, `gestesDonnees`, `gestesVue`, `lireCatalogueFichier`, `openImport`, `openWipeModal`, `rattraperSuggestions`, `removeFromDeck`, `retirerAnnexe`, `retraitCollection`, `versAnnexe`, `viderAnnexe`

## js/entete.js

### `chargement du module`

Appelle : `deckCourant()` *(decks.js)*, `eur()` *(outils.js)*, `majBoutonAffichage()` *(entete.js)*, `majHauteurEntete()` *(entete.js)*, `ongletDeSection()` *(etat.js)*, `rattraperSuggestions()` *(differe.js)*, `renderK()` *(simSection.js)*, `renderOnglets()` *(entete.js)*, `scheduleSave()` *(stockage.js)*

### `listeDeLOngletCourant()` — ligne 34

N'appelle aucune fonction du projet.

Appelée par : `majBoutonAffichage`

### `majBoutonAffichage()` — ligne 38

Appelle : `esc()` *(outils.js)*, `listeDeLOngletCourant()` *(entete.js)*, `resumeAffichage()` *(fenAffichage.js)*

Appelée par : `entete.js (chargement)`, `renderOnglets`

### `majHauteurEntete()` — ligne 57

N'appelle aucune fonction du projet.

Appelée par : `app.js (chargement)`, `entete.js (chargement)`, `renderTop`

### `renderTop()` — ligne 62

Appelle : `clesDecks()` *(decks.js)*, `deckCourant()` *(decks.js)*, `esc()` *(outils.js)*, `filtresActifs()` *(filtres.js)*, `fmt()` *(outils.js)*, `majHauteurEntete()` *(entete.js)*, `nomCombinaisonCouleurs()` *(couleurs.js)*, `restrictionsActives()` *(restrictions.js)*, `spent()` *(achats.js)*, `symBg()` *(symboles.js)*, `texteFiltresActifs()` *(filtres.js)*

Appelée par : `brancherSauvegarde`, `gestesGraphe`, `refreshSuggestions`, `renderAll`, `renderB`

### `renderOnglets()` — ligne 195

Appelle : `majBoutonAffichage()` *(entete.js)*

Appelée par : `entete.js (chargement)`, `renderAll`

## js/rendu.js

### `signalerTravail()` — ligne 11

Appelle : `ongletDeSection()` *(etat.js)*

Appelée par : `finProgresSection`, `lanceSimulation`, `progresSection`, `terminerLot`

### `renderAll()` — ligne 20

Appelle : `renderB()` *(collection.js)*, `renderC()` *(stats.js)*, `renderD()` *(graphe.js)*, `renderE()` *(deckSection.js)*, `renderI()` *(decksSection.js)*, `renderJ()` *(wishlistSection.js)*, `renderK()` *(simSection.js)*, `renderOnglets()` *(entete.js)*, `renderSuggestions()` *(suggestions.js)*, `renderTop()` *(entete.js)*, `scheduleSave()` *(stockage.js)*

Appelée par : `activerDeck`, `app.js (chargement)`, `appliquerAffichage`, `brancherCatalogue`, `brancherRestauration`, `chargerCatalogue`, `chargerGameChangers`, `choisirVersion`, `completeUnknown`, `demarrer`, `filtrerAvecProgression`, `gestesDecks`, `gestesDonnees`, `loadSymbology`, `majCatalogue`, `majPrix`, `nuageTour`, `recalculerAvecProgression`, `renderAllSiApplique`

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

## js/fenNuage.js

### `nuageQuand()` — ligne 16

N'appelle aucune fonction du projet.

Appelée par : `nuageCorpsConnecte`

### `nuageOu()` — ligne 35

Appelle : `esc()` *(outils.js)*

Appelée par : `nuageConflits`

### `nuageConflits()` — ligne 42

Appelle : `esc()` *(outils.js)*, `nuageOu()` *(fenNuage.js)*

Appelée par : `nuageCorpsConnecte`

### `nuageEtatLigne()` — ligne 59

Appelle : `esc()` *(outils.js)*

Appelée par : `nuageCorpsConnecte`

### `nuageDetail()` — ligne 71

Appelle : `esc()` *(outils.js)*

Appelée par : `nuageCorpsConnecte`

### `nuageAvertissementOrigine()` — ligne 80

N'appelle aucune fonction du projet.

Appelée par : `nuageCorpsDeconnecte`

### `nuageCorpsDeconnecte()` — ligne 96

Appelle : `esc()` *(outils.js)*, `nuageAvertissementOrigine()` *(fenNuage.js)*

Appelée par : `corpsNuage`

### `nuageCorpsConnecte()` — ligne 120

Appelle : `esc()` *(outils.js)*, `nuageConflits()` *(fenNuage.js)*, `nuageDetail()` *(fenNuage.js)*, `nuageEtatLigne()` *(fenNuage.js)*, `nuagePoids()` *(nuage.js)*, `nuageQuand()` *(fenNuage.js)*

Appelée par : `corpsNuage`

### `corpsNuage()` — ligne 156

Appelle : `nuageConnecte()` *(nuage.js)*, `nuageCorpsConnecte()` *(fenNuage.js)*, `nuageCorpsDeconnecte()` *(fenNuage.js)*

Appelée par : `corpsParametres`

## js/fenParametres.js

### `sectionParametres()` — ligne 18

Appelle : `esc()` *(outils.js)*

Appelée par : `corpsParametres`

### `corpsApparence()` — ligne 30

N'appelle aucune fonction du projet.

Appelée par : `corpsParametres`

### `corpsCatalogue()` — ligne 40

Appelle : `avecBrouillon()` *(brouillon.js)*, `blocCatalogue()` *(fenSauvegarde.js)*

Appelée par : `corpsParametres`

### `corpsParametres()` — ligne 70

Appelle : `corpsApparence()` *(fenParametres.js)*, `corpsCatalogue()` *(fenParametres.js)*, `corpsNuage()` *(fenNuage.js)*, `corpsSauvegarde()` *(fenSauvegarde.js)*, `sectionParametres()` *(fenParametres.js)*

Appelée par : `majFenetreParametres`, `openParametresModal`

### `majFenetreParametres()` — ligne 90

Appelle : `brancherParametres()` *(fenParametres.js)*, `corpsParametres()` *(fenParametres.js)*

Appelée par : `brancherSauvegarde`, `gestesNuageChange`, `nuageDiagnostic`, `nuageSynchro`, `openParametresModal`, `rafraichirFenetreSauvegarde`

### `brancherParametres()` — ligne 101

Appelle : `brancherCatalogue()` *(fenSauvegarde.js)*, `brancherRestauration()` *(fenSauvegarde.js)*, `brancherSauvegarde()` *(fenSauvegarde.js)*

Appelée par : `majFenetreParametres`, `openParametresModal`

### `appliquerParametres()` — ligne 107

Appelle : `closeDialog()` *(dialogue.js)*, `filtrerAvecProgression()` *(fenFiltres.js)*, `verseBrouillon()` *(brouillon.js)*

Appelée par : `gestesReglages`

### `openParametresModal()` — ligne 113

Appelle : `brancherParametres()` *(fenParametres.js)*, `corpsParametres()` *(fenParametres.js)*, `openDialog()` *(dialogue.js)*, `ouvreBrouillon()` *(brouillon.js)*, `zoneProgression()` *(fenFiltres.js)*, → `majFenetreParametres()` *(fenParametres.js)*

Appelée par : `gestesNuage`, `gestesReglages`

### `appliquerFormat()` — ligne 124

Appelle : `closeDialog()` *(dialogue.js)*, `filtrerAvecProgression()` *(fenFiltres.js)*, `verseBrouillon()` *(brouillon.js)*

Appelée par : `gestesReglages`

## js/fenBudget.js

### `champBudget()` — ligne 19

Appelle : `esc()` *(outils.js)*

Appelée par : `corpsBudget`

### `corpsBudget()` — ligne 25

Appelle : `avecBrouillon()` *(brouillon.js)*, `champBudget()` *(fenBudget.js)*, `deckCourant()` *(decks.js)*, `esc()` *(outils.js)*, `ligneAchats()` *(suggestions.js)*, `ligneBudget()` *(suggestions.js)*

Appelée par : `openBudgetModal`

### `saisieBudget()` — ligne 62

Appelle : `invaliderAchats()` *(achats.js)*, `invaliderCandidats()` *(candidats.js)*, `majResumeBudget()` *(fenBudget.js)*, `modifieBrouillon()` *(brouillon.js)*, `refreshSuggestions()` *(suggestions.js)*

Appelée par : `app.js (chargement)`

### `majResumeBudget()` — ligne 80

Appelle : `avecBrouillon()` *(brouillon.js)*, `ligneAchats()` *(suggestions.js)*, `ligneBudget()` *(suggestions.js)*

Appelée par : `openBudgetModal`, `saisieBudget`

### `appliquerBudget()` — ligne 92

Appelle : `closeDialog()` *(dialogue.js)*, `filtrerAvecProgression()` *(fenFiltres.js)*, `verseBrouillon()` *(brouillon.js)*

Appelée par : `app.js (chargement)`, `gestesReglages`

### `openBudgetModal()` — ligne 98

Appelle : `corpsBudget()` *(fenBudget.js)*, `openDialog()` *(dialogue.js)*, `ouvreBrouillon()` *(brouillon.js)*, `zoneProgression()` *(fenFiltres.js)*, → `majResumeBudget()` *(fenBudget.js)*

Appelée par : `gestesReglages`

## js/fenDeck.js

### `dossierEnConfig()` — ligne 23

Appelle : `deckCourant()` *(decks.js)*

Appelée par : `corpsDeck`, `ligneRestriction`, `resumeDeckConfig`, `saisieDeck`

### `champDeck()` — ligne 27

Appelle : `esc()` *(outils.js)*

Appelée par : `corpsDeck`

### `ligneRestriction()` — ligne 35

Appelle : `dossierEnConfig()` *(fenDeck.js)*, `esc()` *(outils.js)*

Appelée par : `corpsDeck`

### `corpsDeck()` — ligne 46

Appelle : `avecBrouillon()` *(brouillon.js)*, `champDeck()` *(fenDeck.js)*, `couleursRestriction()` *(restrictions.js)*, `coutDeck()` *(decksSection.js)*, `dossierEnConfig()` *(fenDeck.js)*, `esc()` *(outils.js)*, `eur()` *(outils.js)*, `ligneRestriction()` *(fenDeck.js)*, `nomCombinaisonCouleurs()` *(couleurs.js)*, `resumeDeckConfig()` *(fenDeck.js)*, `rolesFiltre()` *(filtres.js)*, `symBg()` *(symboles.js)*, `targets()` *(legalite.js)*

Appelée par : `majFenetreDeck`, `openDeckModal`

### `resumeDeckConfig()` — ligne 155

Appelle : `avecBrouillon()` *(brouillon.js)*, `couleursRestriction()` *(restrictions.js)*, `dossierEnConfig()` *(fenDeck.js)*, `esc()` *(outils.js)*, `eur()` *(outils.js)*, `filtresActifs()` *(filtres.js)*

Appelée par : `corpsDeck`, `majResumeDeck`

### `majResumeDeck()` — ligne 166

Appelle : `resumeDeckConfig()` *(fenDeck.js)*

Appelée par : `gestesDecks`, `saisieDeck`

### `majFenetreDeck()` — ligne 173

Appelle : `corpsDeck()` *(fenDeck.js)*

Appelée par : `gestesDeckConfig`, `openDeckModal`, `saisieDeck`

### `appliquerDeck()` — ligne 183

Appelle : `closeDialog()` *(dialogue.js)*, `filtrerAvecProgression()` *(fenFiltres.js)*, `invaliderAchats()` *(achats.js)*, `renommerDeck()` *(decks.js)*, `verseBrouillon()` *(brouillon.js)*

Appelée par : `gestesDecks`

### `openDeckModal()` — ligne 195

Appelle : `corpsDeck()` *(fenDeck.js)*, `openDialog()` *(dialogue.js)*, `ouvreBrouillon()` *(brouillon.js)*, `zoneProgression()` *(fenFiltres.js)*, → `majFenetreDeck()` *(fenDeck.js)*

Appelée par : `gestesDecks`

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

Appelée par : `annonceRecalcul`, `corpsBoiteRecalcul`, `openBudgetModal`, `openCiblesModal`, `openDeckModal`, `openFiltresModal`, `openFormatModal`, `openParametresModal`

### `majProgression()` — ligne 133

N'appelle aucune fonction du projet.

Appelée par : `filtrerAvecProgression`, `recalculerAvecProgression`

### `filtrerAvecProgression()` — ligne 148

Appelle : `majProgression()` *(fenFiltres.js)*, `pause()` *(recalcul.js)*, `prechauffeCandidats()` *(candidats.js)*, `prepareSuggestions()` *(vivier.js)*, `renderAll()` *(rendu.js)*

Appelée par : `appliquerBudget`, `appliquerCibles`, `appliquerDeck`, `appliquerFiltres`, `appliquerFormat`, `appliquerParametres`

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

### `indexColonnes()` — ligne 31

N'appelle aucune fonction du projet.

Appelée par : `corpsAffichage`, `openAffichageModal`

### `resumeAffichage()` — ligne 39

Appelle : `colonnesDe()` *(barreGroupes.js)*, `vueDe()` *(barreGroupes.js)*

Appelée par : `corpsAffichage`, `majBoutonAffichage`

### `corpsAffichage()` — ligne 48

Appelle : `avecBrouillon()` *(brouillon.js)*, `colonnesDe()` *(barreGroupes.js)*, `esc()` *(outils.js)*, `indexColonnes()` *(fenAffichage.js)*, `resumeAffichage()` *(fenAffichage.js)*, `vueDe()` *(barreGroupes.js)*

Appelée par : `majFenetreAffichage`, `openAffichageModal`

### `majFenetreAffichage()` — ligne 99

Appelle : `corpsAffichage()` *(fenAffichage.js)*

Appelée par : `openAffichageModal`, `reglageAffichage`

### `reglageAffichage()` — ligne 111

Appelle : `majFenetreAffichage()` *(fenAffichage.js)*, `modifieBrouillon()` *(brouillon.js)*

Appelée par : `app.js (chargement)`

### `glisseColonnes()` — ligne 126

Appelle : `modifieBrouillon()` *(brouillon.js)*

Appelée par : `app.js (chargement)`

### `verseAffichagePartout()` — ligne 141

N'appelle aucune fonction du projet.

Appelée par : `appliquerAffichage`

### `appliquerAffichage()` — ligne 154

Appelle : `avecBrouillon()` *(brouillon.js)*, `closeDialog()` *(dialogue.js)*, `colonnesDe()` *(barreGroupes.js)*, `modifieBrouillon()` *(brouillon.js)*, `refreshSuggestions()` *(suggestions.js)*, `renderAll()` *(rendu.js)*, `renderB()` *(collection.js)*, `renderE()` *(deckSection.js)*, `scheduleSave()` *(stockage.js)*, `verseAffichagePartout()` *(fenAffichage.js)*, `verseBrouillon()` *(brouillon.js)*, `vueDe()` *(barreGroupes.js)*

Appelée par : `gestesReglages`

### `openAffichageModal()` — ligne 177

Appelle : `colonnesDe()` *(barreGroupes.js)*, `corpsAffichage()` *(fenAffichage.js)*, `indexColonnes()` *(fenAffichage.js)*, `openDialog()` *(dialogue.js)*, `ouvreBrouillon()` *(brouillon.js)*, → `majFenetreAffichage()` *(fenAffichage.js)*

Appelée par : `gestesReglages`

## js/fenCibles.js

### `ligneCible()` — ligne 20

Appelle : `esc()` *(outils.js)*, `fmt()` *(outils.js)*

Appelée par : `corpsCibles`

### `corpsCibles()` — ligne 34

Appelle : `avecBrouillon()` *(brouillon.js)*, `ciblesParDefaut()` *(legalite.js)*, `ciblesReglees()` *(legalite.js)*, `deckCounts()` *(legalite.js)*, `esc()` *(outils.js)*, `fmt()` *(outils.js)*, `ligneCible()` *(fenCibles.js)*, `targets()` *(legalite.js)*

Appelée par : `majFenetreCibles`, `openCiblesModal`

### `majFenetreCibles()` — ligne 55

Appelle : `corpsCibles()` *(fenCibles.js)*

Appelée par : `gestesReglages`, `openCiblesModal`

### `appliquerCibles()` — ligne 67

Appelle : `closeDialog()` *(dialogue.js)*, `filtrerAvecProgression()` *(fenFiltres.js)*, `verseBrouillon()` *(brouillon.js)*

Appelée par : `gestesReglages`

### `openCiblesModal()` — ligne 73

Appelle : `corpsCibles()` *(fenCibles.js)*, `openDialog()` *(dialogue.js)*, `ouvreBrouillon()` *(brouillon.js)*, `zoneProgression()` *(fenFiltres.js)*, → `majFenetreCibles()` *(fenCibles.js)*

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

### `exportModal()` — ligne 11

Appelle : `annexeEntries()` *(annexes.js)*, `collectionCards()` *(collection.js)*, `deckEntries()` *(deck.js)*, `deckSize()` *(deck.js)*, `esc()` *(outils.js)*, `eur()` *(outils.js)*, `fmt()` *(outils.js)*, `openDialog()` *(dialogue.js)*, `toast()` *(outils.js)*

Appelée par : `gestesDonnees`

### `openWantsModal()` — ligne 109

Appelle : `aAcheter()` *(achats.js)*, `deckCourant()` *(decks.js)*, `esc()` *(outils.js)*, `eur()` *(outils.js)*, `openDialog()` *(dialogue.js)*, `toast()` *(outils.js)*, `wishlist()` *(achats.js)*

Appelée par : `gestesDeck`, `gestesDecks`

### `openWipeModal()` — ligne 152

Appelle : `closeDialog()` *(dialogue.js)*, `collectionCards()` *(collection.js)*, `deckEntries()` *(deck.js)*, `openDialog()` *(dialogue.js)*, `recalculerAvecProgression()` *(recalcul.js)*, `toast()` *(outils.js)*

Appelée par : `gestesDonnees`

## js/fenAdversaire.js

### `ouvreAdversaire()` — ligne 10

Appelle : `esc()` *(outils.js)*, `majApercuAdversaire()` *(fenAdversaire.js)*, `openDialog()` *(dialogue.js)*, `optionsHTML()` *(simSection.js)*

Appelée par : `gestesSimulation`

### `majApercuAdversaire()` — ligne 26

Appelle : `adversaireDepuisTexte()` *(simAdversaires.js)*, `esc()` *(outils.js)*, `nbCartesAdversaire()` *(simAdversaires.js)*, `resolutionAdversaire()` *(simAdversaires.js)*

Appelée par : `app.js (chargement)`, `ouvreAdversaire`

### `enregistreAdversaireFenetre()` — ligne 36

Appelle : `adversaireDepuisTexte()` *(simAdversaires.js)*, `closeDialog()` *(dialogue.js)*, `completeAdversaire()` *(simAdversaires.js)*, `configSimulation()` *(simulation.js)*, `enregistreAdversaire()` *(simAdversaires.js)*, `renderK()` *(simSection.js)*, `scheduleSave()` *(stockage.js)*, `toast()` *(outils.js)*

Appelée par : `gestesSimulation`

### `supprimeAdversaire()` — ligne 55

Appelle : `esc()` *(outils.js)*, `openDialog()` *(dialogue.js)*

Appelée par : `gestesSimulation`

### `supprimeAdversaireOui()` — ligne 63

Appelle : `closeDialog()` *(dialogue.js)*, `renderK()` *(simSection.js)*, `scheduleSave()` *(stockage.js)*

Appelée par : `gestesSimulation`

## js/fenComportement.js

### `aideFormules()` — ligne 16

Appelle : `esc()` *(outils.js)*

Appelée par : `ouvreComportement`

### `lectureHTML()` — ligne 28

Appelle : `badgeCouverture()` *(simSection.js)*, `compileDefinition()` *(definitions.js)*, `esc()` *(outils.js)*

Appelée par : `majApercuComportement`, `ouvreComportement`

### `ouvreComportement()` — ligne 39

Appelle : `aideFormules()` *(fenComportement.js)*, `esc()` *(outils.js)*, `ficheParNom()` *(simCartes.js)*, `lectureHTML()` *(fenComportement.js)*, `majApercuComportement()` *(fenComportement.js)*, `openDialog()` *(dialogue.js)*, `toast()` *(outils.js)*

Appelée par : `gestesSimulation`

### `majApercuComportement()` — ligne 59

Appelle : `lectureHTML()` *(fenComportement.js)*

Appelée par : `app.js (chargement)`, `ouvreComportement`

### `appliqueComportement()` — ligne 64

Appelle : `closeDialog()` *(dialogue.js)*, `renderK()` *(simSection.js)*, `scheduleSave()` *(stockage.js)*, `toast()` *(outils.js)*

Appelée par : `gestesSimulation`

### `effaceComportement()` — ligne 76

Appelle : `closeDialog()` *(dialogue.js)*, `renderK()` *(simSection.js)*, `scheduleSave()` *(stockage.js)*, `toast()` *(outils.js)*

Appelée par : `gestesSimulation`

## js/fenJournal.js

### `ouvreJournal()` — ligne 9

Appelle : `esc()` *(outils.js)*, `lotParId()` *(simStockage.js)*, `openDialog()` *(dialogue.js)*, `rejouePartie()` *(simulation.js)*, `toast()` *(outils.js)*

Appelée par : `gestesSimulation`

## js/gestesDecks.js

### `gestesDecks()` — ligne 11

Appelle : `activerDeck()` *(decks.js)*, `appliquerDeck()` *(fenDeck.js)*, `apresReglage()` *(brouillon.js)*, `bilanDeck()` *(decks.js)*, `closeDialog()` *(dialogue.js)*, `creerDeck()` *(decks.js)*, `deckCourant()` *(decks.js)*, `dupliquerDeck()` *(decks.js)*, `esc()` *(outils.js)*, `majResumeDeck()` *(fenDeck.js)*, `modifieBrouillon()` *(brouillon.js)*, `openDeckModal()` *(fenDeck.js)*, `openDialog()` *(dialogue.js)*, `openWantsModal()` *(fenExport.js)*, `recalculerAvecProgression()` *(recalcul.js)*, `reinitRestrictions()` *(restrictions.js)*, `renderAll()` *(rendu.js)*, `renderI()` *(decksSection.js)*, `scheduleSave()` *(stockage.js)*, `supprimerDeck()` *(decks.js)*, `toast()` *(outils.js)*

Appelée par : `app.js (chargement)`

### `saisieDeck()` — ligne 87

Appelle : `dossierEnConfig()` *(fenDeck.js)*, `majFenetreDeck()` *(fenDeck.js)*, `majRestriction()` *(restrictions.js)*, `majResumeDeck()` *(fenDeck.js)*, `modifieBrouillon()` *(brouillon.js)*

Appelée par : `app.js (chargement)`

### `gestesDeckConfig()` — ligne 113

Appelle : `majFenetreDeck()` *(fenDeck.js)*, `modifieBrouillon()` *(brouillon.js)*, `restrictionsDuDeck()` *(restrictions.js)*, `rolesFiltre()` *(filtres.js)*

Appelée par : `app.js (chargement)`

## js/gestesVue.js

### `gestesVue()` — ligne 10

Appelle : `apresReglage()` *(brouillon.js)*, `archetypesAChargerEdhrec()` *(archetypesSets.js)*, `avecBrouillon()` *(brouillon.js)*, `basculerArchetype()` *(archetypesSets.js)*, `basculerSet()` *(archetypesSets.js)*, `basculerSourceVersions()` *(versions.js)*, `chargerSetScryfall()` *(sets.js)*, `chargerThemeEdhrec()` *(edhrecThemes.js)*, `choisirVersion()` *(versions.js)*, `closeDialog()` *(dialogue.js)*, `effacerFiltre()` *(filtres.js)*, `faireDefilerVersion()` *(versions.js)*, `invaliderCandidats()` *(candidats.js)*, `majFenetreFiltres()` *(fenFiltres.js)*, `modifieBrouillon()` *(brouillon.js)*, `openFiltresModal()` *(fenFiltres.js)*, `recalculerAvecProgression()` *(recalcul.js)*, `renderD()` *(graphe.js)*, `setsACharger()` *(archetypesSets.js)*

Appelée par : `app.js (chargement)`

## js/gestesReglages.js

### `gestesReglages()` — ligne 9

Appelle : `appliquerAffichage()` *(fenAffichage.js)*, `appliquerBudget()` *(fenBudget.js)*, `appliquerCibles()` *(fenCibles.js)*, `appliquerFiltres()` *(fenFiltres.js)*, `appliquerFormat()` *(fenParametres.js)*, `appliquerParametres()` *(fenParametres.js)*, `apresReglage()` *(brouillon.js)*, `basculerRole()` *(filtres.js)*, `cleLimiteSug()` *(sugListes.js)*, `defautSug()` *(sugListes.js)*, `fmt()` *(outils.js)*, `groupeCartes()` *(groupes.js)*, `interrompreCatalogue()` *(catalogue.js)*, `listeSug()` *(sugListes.js)*, `majFenetreCibles()` *(fenCibles.js)*, `modifieBrouillon()` *(brouillon.js)*, `openAffichageModal()` *(fenAffichage.js)*, `openBudgetModal()` *(fenBudget.js)*, `openCiblesModal()` *(fenCibles.js)*, `openFormatModal()` *(fenFormat.js)*, `openParametresModal()` *(fenParametres.js)*, `refreshSuggestions()` *(suggestions.js)*, `reinitCibles()` *(legalite.js)*, `reinitFiltres()` *(filtres.js)*, `selectionSuggestions()` *(sugListes.js)*, `toast()` *(outils.js)*

Appelée par : `app.js (chargement)`

## js/gestesDeck.js

### `gestesDeck()` — ligne 9

Appelle : `addToDeck()` *(deck.js)*, `annexeSize()` *(annexes.js)*, `apresReglage()` *(brouillon.js)*, `buyCard()` *(deck.js)*, `closeDialog()` *(dialogue.js)*, `degeleSuggestions()` *(sugOrdre.js)*, `esc()` *(outils.js)*, `ficheVoisine()` *(ficheParcours.js)*, `find()` *(cartes.js)*, `geleSuggestions()` *(sugOrdre.js)*, `invaliderCandidats()` *(candidats.js)*, `majApercu()` *(apercu.js)*, `openCardModal()` *(ficheParcours.js)*, `openDialog()` *(dialogue.js)*, `openWantsModal()` *(fenExport.js)*, `poseParcoursFiche()` *(ficheParcours.js)*, `recalculerAvecProgression()` *(recalcul.js)*, `removeFromDeck()` *(deck.js)*, `renderB()` *(collection.js)*, `renderSuggestions()` *(suggestions.js)*, `retirerAnnexe()` *(annexes.js)*, `scheduleSave()` *(stockage.js)*, `signatureCommandants()` *(edhrec.js)*, `toast()` *(outils.js)*, `versAnnexe()` *(annexes.js)*, `viderAnnexe()` *(annexes.js)*

Appelée par : `app.js (chargement)`

## js/gestesDonnees.js

### `gestesDonnees()` — ligne 9

Appelle : `annexeListe()` *(annexes.js)*, `chargerCatalogue()` *(candidats.js)*, `closeDialog()` *(dialogue.js)*, `enrichAllUnknown()` *(recherches.js)*, `exportModal()` *(fenExport.js)*, `idbOublier()` *(idb.js)*, `idbVider()` *(idb.js)*, `invaliderCandidats()` *(candidats.js)*, `loadEdhrec()` *(edhrec.js)*, `majCatalogue()` *(catalogue.js)*, `nuageConnecte()` *(nuage.js)*, `nuageDeconnecte()` *(nuage.js)*, `openAdd()` *(fenAjout.js)*, `openDialog()` *(dialogue.js)*, `openImport()` *(fenImport.js)*, `openWipeModal()` *(fenExport.js)*, `rafraichirFenetreSauvegarde()` *(fenSauvegarde.js)*, `recalculerAvecProgression()` *(recalcul.js)*, `renderAll()` *(rendu.js)*, `save()` *(stockage.js)*, `scheduleSave()` *(stockage.js)*, `snapshot()` *(stockage.js)*, `telechargerCatalogue()` *(catalogue.js)*, `toast()` *(outils.js)*

Appelée par : `app.js (chargement)`

## js/gestesNuage.js

### `gestesNuage()` — ligne 9

Appelle : `closeDialog()` *(dialogue.js)*, `dbxConnexion()` *(nuageDropbox.js)*, `nuageDeconnecte()` *(nuage.js)*, `nuageDiagnostic()` *(nuageDiagnostic.js)*, `nuageSynchro()` *(nuage.js)*, `openDialog()` *(dialogue.js)*, `openParametresModal()` *(fenParametres.js)*, `save()` *(stockage.js)*, `toast()` *(outils.js)*

Appelée par : `app.js (chargement)`

### `gestesNuageChange()` — ligne 64

Appelle : `nuageEcrire()` *(nuage.js)*, `nuageNomParDefaut()` *(nuage.js)*, `nuageSynchro()` *(nuage.js)*, → `majFenetreParametres()` *(fenParametres.js)*

Appelée par : `app.js (chargement)`

## js/gestesGraphe.js

### `gestesGraphe()` — ligne 9

Appelle : `ajouterCarte()` *(fenAjout.js)*, `buildCard()` *(cartes.js)*, `carteDepuisScryfall()` *(recherches.js)*, `closeDialog()` *(dialogue.js)*, `find()` *(cartes.js)*, `invaliderCandidats()` *(candidats.js)*, `majResultats()` *(fenAjout.js)*, `norm()` *(cartes.js)*, `openCardModal()` *(ficheParcours.js)*, `pasRecherche()` *(rechercheSection.js)*, `poseParcoursFiche()` *(ficheParcours.js)*, `registerCard()` *(cartes.js)*, `renderB()` *(collection.js)*, `renderD()` *(graphe.js)*, `renderSuggestions()` *(suggestions.js)*, `renderTop()` *(entete.js)*

Appelée par : `app.js (chargement)`

## js/gestesSimulation.js

### `gestesSimulation()` — ligne 9

Appelle : `appliqueComportement()` *(fenComportement.js)*, `arreteSimulation()` *(simulation.js)*, `effaceComportement()` *(fenComportement.js)*, `enregistreAdversaireFenetre()` *(fenAdversaire.js)*, `lanceSimulation()` *(simulation.js)*, `ouvreAdversaire()` *(fenAdversaire.js)*, `ouvreComportement()` *(fenComportement.js)*, `ouvreJournal()` *(fenJournal.js)*, `renderK()` *(simSection.js)*, `supprimeAdversaire()` *(fenAdversaire.js)*, `supprimeAdversaireOui()` *(fenAdversaire.js)*, `supprimeLot()` *(simStockage.js)*

Appelée par : `app.js (chargement)`

### `reglageSimulation()` — ligne 30

Appelle : `renderK()` *(simSection.js)*, `scheduleSave()` *(stockage.js)*

Appelée par : `app.js (chargement)`

## js/app.js

### `chargement du module`

Appelle : `appliquerBudget()` *(fenBudget.js)*, `appliquerFiltres()` *(fenFiltres.js)*, `apresReglage()` *(brouillon.js)*, `basculeTheme()` *(theme.js)*, `cacherApercu()` *(apercu.js)*, `closeDialog()` *(dialogue.js)*, `demarrer()` *(app.js)*, `fermetureBrouillon()` *(brouillon.js)*, `ficheVoisine()` *(ficheParcours.js)*, `fmt()` *(outils.js)*, `gestesNuageChange()` *(gestesNuage.js)*, `glisseColonnes()` *(fenAffichage.js)*, `invaliderCandidats()` *(candidats.js)*, `majApercuAdversaire()` *(fenAdversaire.js)*, `majApercuComportement()` *(fenComportement.js)*, `majFiltre()` *(filtres.js)*, `majListeArchetypes()` *(fenListes.js)*, `majListeSets()` *(fenListes.js)*, `majResultats()` *(fenAjout.js)*, `majResumeFiltres()` *(fenFiltres.js)*, `majResumeFormat()` *(fenFormat.js)*, `modifieBrouillon()` *(brouillon.js)*, `molletteRecherche()` *(rechercheSection.js)*, `montrerApercu()` *(apercu.js)*, `placerApercu()` *(apercu.js)*, `refreshSuggestions()` *(suggestions.js)*, `reglageAffichage()` *(fenAffichage.js)*, `reglageSimulation()` *(gestesSimulation.js)*, `reglerCible()` *(legalite.js)*, `renderAll()` *(rendu.js)*, `renderE()` *(deckSection.js)*, `saisieBudget()` *(fenBudget.js)*, `saisieDeck()` *(gestesDecks.js)*, `saisieRecherche()` *(rechercheSection.js)*, `toast()` *(outils.js)*, → `gestesDeck()` *(gestesDeck.js)*, → `gestesDeckConfig()` *(gestesDecks.js)*, → `gestesDecks()` *(gestesDecks.js)*, → `gestesDonnees()` *(gestesDonnees.js)*, → `gestesGraphe()` *(gestesGraphe.js)*, → `gestesNuage()` *(gestesNuage.js)*, → `gestesReglages()` *(gestesReglages.js)*, → `gestesSimulation()` *(gestesSimulation.js)*, → `gestesVue()` *(gestesVue.js)*, → `majHauteurEntete()` *(entete.js)*

### `demarrer()` — ligne 259

Appelle : `archetypesARevoir()` *(edhrecThemes.js)*, `chargerArchetypesEdhrec()` *(edhrecThemes.js)*, `chargerGameChangers()` *(gameChangers.js)*, `chargerSauvegarde()` *(stockage.js)*, `demarrerCatalogue()` *(catalogue.js)*, `gameChangersARevoir()` *(gameChangers.js)*, `initBuiltin()` *(cartes.js)*, `loadSymbology()` *(symboles.js)*, `nuageDemarrer()` *(nuage.js)*, `renderAll()` *(rendu.js)*, `reprendTheme()` *(theme.js)*, `reprendreArchetypesEdhrec()` *(edhrecThemes.js)*, `reprendreGameChangers()` *(gameChangers.js)*, `reprendreSets()` *(sets.js)*, `restore()` *(stockage.js)*

Appelée par : `app.js (chargement)`

