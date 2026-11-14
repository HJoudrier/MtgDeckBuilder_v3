# Qui appelle qui

*Écrit par `node outils/genAppels.js` à partir des sources — ne pas modifier à la main.*

Pour chaque fonction : le fichier où elle est définie, les fonctions du projet qu'elle
appelle, et celles qui l'appellent. Trois façons d'appeler, notées différemment — un appel
direct sans marque, un appel **différé** (une fonction passée en rappel) précédé de « → »,
un appel depuis un **gestionnaire HTML** produit par l'atelier précédé de « ⌘ ». Les graphes
correspondants sont dans `doc/graphe-fonctions.dot` et `doc/graphe-modules.dot`.

**1388 fonctions** dans 197 modules, **3921 appels** relevés.

## Fonctions que personne n'appelle

Points d'entrée — appelées depuis le HTML, depuis un écouteur — ou code mort.

- `detailHTML()` *(tableRendu.js)*
- `ficheDeScriptForge()` *(forgeScript.js)*
- `nuageFond()` *(nuagePaquet.js)*
- `pileHTML()` *(tableRendu.js)*
- `poseCouleursCommandant()` *(restrictions.js)*
- `questionHTML()` *(tableQuestions.js)*

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

Appelée par : `appliqueCatalogueAuxCartes`, `applyScryfall`, `archetypesCarte`, `cartes.js (chargement)`, `chargeSimCartes`, `chargerGameChangers`, `chercheCartes`, `chercheFichesScryfall`, `chercheScryfall`, `completeUnknown`, `edhrecAllFor`, `edhrecFor`, `estGameChanger`, `fetchEdhrecCommander`, `ficheHTML`, `ficheSansForge`, `filtresValeursOK`, `find`, `gestesGraphe`, `indexArchive`, `indexCard`, `indexeForge`, `loose`, `majResultats`, `nbInteractions`, `nomsPageEdhrec`, `noteCarte`, `noteSetIndex`, `parseMtgoList`, `propositionsHTML`, `registerCard`, `renameCard`, `resultatsAjoutHTML`, `retiens`, `saisieRecherche`, `scriptForgeDe`, `scryTarget`, `setsCarte`, `setsRec`, `snapshot`, `unindexCard`, `valeursRec`

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

Appelée par : `aAcheter`, `addToDeck`, `ajoutCollection`, `annexeEntries`, `appliqueCatalogueAuxCartes`, `applyScryfall`, `basculerSourceVersions`, `buyCard`, `carteDuCatalogue`, `chargerCatalogue`, `choisirVersion`, `collectionCards`, `commandantsPrincipaux`, `completeUnknown`, `contexteEvaluation`, `couleursRestriction`, `coutDeck`, `deckEntries`, `demandesTousDecks`, `deplacerCarte`, `faireDefilerVersion`, `ficheImageKO`, `ficheSansForge`, `gestesDeck`, `gestesGraphe`, `getCardOrAnalyzedRec`, `imageCarte`, `legality`, `loadEdhrec`, `majApercu`, `majPrix`, `montrerApercu`, `nomCanonique`, `openCardModal`, `openImport`, `panneauEdhrec`, `poseCouleursCommandant`, `propositionsHTML`, `quantiteCollection`, `requeteCatalogue`, `restaureDecks`, `restore`, `resultatsAjoutHTML`, `selectionCandidats`, `signatureCommandants`, `versAnnexe`, `vivierSuggestions`, `wishlist`, `zoneCommandant`

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

Appelée par : `bilanWishlist`, `deckCourant`, `demandesTousDecks`, `rejoindreHTML`, `renderI`, `renderJ`, `renderTop`, `restaureDecks`, `salonHTML`, `signatureAchats`, `snapshot`, `sourcesDeDecks`, `supprimerDeck`, `tableHTML`, `vignetteDeck`

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

Appelée par : `blocGraphe`, `chercheCartes`, `ligneCatalogue`, `noteCarte`, `renderD`, `renderG`, `resultatsAjoutHTML`, `selectionCandidats`, `signatureCandidats`, `vivierSuggestions`

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

Appelée par : `compileDefinition`, `definitionDepuisScript`

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

Appelée par : `compileDefinition`, `compileProposition`, `definitionDepuisScript`, `manaForge`, `morceauCout`, `motCleSeul`

### `coutManaVide()` — ligne 36

N'appelle aucune fonction du projet.

Appelée par : `capacitesImplicites`, `capacitesTerrain`, `compileDefinition`, `coutActivation`, `coutForge`, `coutPermis`, `defFaceCachee`, `definitionDepuisScript`, `jeuVariantes.js (chargement)`, `manaForge`, `motCleForge`, `paieTaxesAttaque`, `variantesSort`

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

Appelée par : `compileDefinition`, `definitionDepuisScript`

### `verseLigne()` — ligne 48

N'appelle aucune fonction du projet.

Appelée par : `compileDefinition`

### `etatLigne()` — ligne 72

N'appelle aucune fonction du projet.

Appelée par : `couverture`

### `capacitesImplicites()` — ligne 82

Appelle : `coutManaVide()` *(oracleCouts.js)*

Appelée par : `compileDefinition`, `definitionDepuisScript`

### `cycleImplicite()` — ligne 92

N'appelle aucune fonction du projet.

Appelée par : `compileDefinition`

### `compileDefinition()` — ligne 100

Appelle : `capacitesImplicites()` *(definitions.js)*, `compileLignes()` *(oracleLignes.js)*, `couleursDe()` *(definitions.js)*, `coutMana()` *(oracleCouts.js)*, `coutManaVide()` *(oracleCouts.js)*, `couverture()` *(definitions.js)*, `cycleImplicite()` *(definitions.js)*, `faceJouee()` *(oracleTexte.js)*, `lisTypeLigne()` *(oracleTexte.js)*, `nombreFiche()` *(definitions.js)*, `normaliseOracle()` *(oracleTexte.js)*, `verseLigne()` *(definitions.js)*

Appelée par : `definitionDe`, `lectureHTML`

### `couverture()` — ligne 140

Appelle : `etatLigne()` *(definitions.js)*, `faceJouee()` *(oracleTexte.js)*

Appelée par : `compileDefinition`

### `rangCouverture()` — ligne 159

N'appelle aucune fonction du projet.

Appelée par : `definitionDe`

### `definitionDe()` — ligne 167

Appelle : `compileDefinition()` *(definitions.js)*, `definitionForge()` *(forgeDefinition.js)*, `empreinte()` *(definitions.js)*, `rangCouverture()` *(definitions.js)*

Appelée par : `definitionJeton`, `siegeDepuisListe`

### `definitionJeton()` — ligne 187

Appelle : `definitionDe()` *(definitions.js)*

Appelée par : `jeuOpsB.js (chargement)`, `scoreEffet`

## js/forgeScript.js

### `forgeTable()` — ligne 22

N'appelle aucune fonction du projet.

Appelée par : `elementsTable`, `forgeEffetsD.js (chargement)`, `forgeSousCapacite`, `lisScriptForge`, `motCleForge`, `statiqueForge`, `unitesForge`

### `forgeApi()` — ligne 33

N'appelle aucune fonction du projet.

Appelée par : `capaciteForge`, `definitionDepuisScript`, `effetForge`, `elementsTable`, `tableJouable`

### `forgeLigneType()` — ligne 41

N'appelle aucune fonction du projet.

Appelée par : `definitionDepuisScript`, `ficheDeScriptForge`

### `forgeCoutMana()` — ligne 49

N'appelle aucune fonction du projet.

Appelée par : `lisScriptForge`

### `faceVide()` — ligne 55

N'appelle aucune fonction du projet.

Appelée par : `lisScriptForge`

### `lisScriptForge()` — ligne 62

Appelle : `faceVide()` *(forgeScript.js)*, `forgeCoutMana()` *(forgeScript.js)*, `forgeTable()` *(forgeScript.js)*

Appelée par : `definitionForge`, `jetonsForge`, `manquesDecks`, `mesureBaseForge`

### `forgeSousCapacite()` — ligne 104

Appelle : `forgeTable()` *(forgeScript.js)*

Appelée par : `declencheurForge`, `destinationRemplacee`, `effetForge`, `entreeForge`, `entreeForgeMotCle`, `forgeChoix.js (chargement)`, `forgeEffetsC.js (chargement)`, `forgeEffetsD.js (chargement)`, `formeRemplacement`, `motCleForge`, `quantiteRemplacee`, `statiqueForge`

### `ficheDeScriptForge()` — ligne 113

Appelle : `forgeLigneType()` *(forgeScript.js)*

## js/forgeCouverture.js

### `forgeSait()` — ligne 30

N'appelle aucune fonction du projet.

Appelée par : `forgeCout.js (chargement)`, `forgeDeclencheurs.js (chargement)`, `forgeDeclencheursB.js (chargement)`, `forgeDefini.js (chargement)`, `forgeDefinition.js (chargement)`, `forgeEffet`, `forgeEffetsA.js (chargement)`, `forgeEffetsD.js (chargement)`, `forgeExpr.js (chargement)`, `forgeExprB.js (chargement)`, `forgeInterdits.js (chargement)`, `forgeMode`, `forgeMotsCles.js (chargement)`, `forgeRemplacements.js (chargement)`, `forgeStatique`, `forgeStatiques.js (chargement)`, `forgeTraine.js (chargement)`, `forgeValide.js (chargement)`

### `forgeConnu()` — ligne 32

N'appelle aucune fonction du projet.

Appelée par : `couvertureForge`

### `morceauxCout()` — ligne 60

N'appelle aucune fonction du projet.

Appelée par : `elementsTable`

### `expressionsDe()` — ligne 68

N'appelle aucune fonction du projet.

Appelée par : `elementsTable`, `unitesForge`

### `elementsTable()` — ligne 79

Appelle : `expressionsDe()` *(forgeCouverture.js)*, `famillesFiltre()` *(forgeValide.js)*, `forgeApi()` *(forgeScript.js)*, `forgeTable()` *(forgeScript.js)*, `morceauxCout()` *(forgeCouverture.js)*

Appelée par : `unitesForge`

### `unitesForge()` — ligne 109

Appelle : `elementsTable()` *(forgeCouverture.js)*, `expressionsDe()` *(forgeCouverture.js)*, `forgeTable()` *(forgeScript.js)*

Appelée par : `couvertureForge`

### `couvertureForge()` — ligne 137

Appelle : `forgeConnu()` *(forgeCouverture.js)*, `unitesForge()` *(forgeCouverture.js)*

Appelée par : `definitionDepuisScript`, `manquesDecks`, `manquesForge`, `mesureBaseForge`

### `manquesForge()` — ligne 157

Appelle : `couvertureForge()` *(forgeCouverture.js)*

Appelée par : `manquesDecks`, `mesureBaseForge`

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

Appelée par : `forgeEffetsA.js (chargement)`, `forgeEffetsE.js (chargement)`, `forgeTraine.js (chargement)`, `jeuOpsB.js (chargement)`, `mulligans`, `partie`

## js/jeuEtat.js

### `nouvellePartie()` — ligne 18

Appelle : `creeObjet()` *(jeuEtat.js)*, `etatHasard()` *(jeuHasard.js)*, `nouvelleCarte()` *(jeuEtat.js)*

Appelée par : `creePartie`

### `nouvelleCarte()` — ligne 48

N'appelle aucune fonction du projet.

Appelée par : `creeJetonsForge`, `forgeCopies.js (chargement)`, `jeuOpsB.js (chargement)`, `nouvellePartie`

### `creeObjet()` — ligne 53

N'appelle aucune fonction du projet.

Appelée par : `creeJetonsForge`, `deplace`, `forgeCopies.js (chargement)`, `jeuOpsB.js (chargement)`, `nouvellePartie`

### `obj()` — ligne 62

N'appelle aucune fonction du projet.

Appelée par : `aCopier`, `actionsLegales`, `actionsPossibles`, `activeCapacite`, `appliqueSBA`, `attaquantsDeclares`, `carteVue`, `cartesPermises`, `champDe`, `cibleEncoreLegale`, `ciblesDuSort`, `ciblesForge`, `ciblesLegales`, `collecteDeclencheurs`, `collecteRetardes`, `compteDuTour`, `compteObjets`, `copiesFin`, `couchesStatiques`, `coutAutrePossible`, `coutDeGarde`, `declareAttaquants`, `declareBloqueurs`, `declencheursEtat`, `defausseCarte`, `defenseurDe`, `defenseurDeclare`, `defenseurVise`, `degagement`, `degatsCombat`, `deplace`, `ecouteRepond`, `elimine`, `emetCibles`, `equipe`, `estAMoi`, `executeForge`, `exhumeesFin`, `finDuTour`, `flashPossible`, `forgeDeclencheurs.js (chargement)`, `forgeDeclencheursB.js (chargement)`, `forgeDefinis`, `forgeEffetsA.js (chargement)`, `forgeEffetsB.js (chargement)`, `forgeEffetsC.js (chargement)`, `forgeEffetsE.js (chargement)`, `forgeTraine.js (chargement)`, `forgeValideJoueur`, `hotePart`, `iaAttaquants`, `iaBloqueurs`, `iaCartes`, `iaCibles`, `iaPriorite`, `iaReponse`, `iaScrute`, `initiativeEnJeu`, `jeuOpsB.js (chargement)`, `jeuVariantes.js (chargement)`, `joueTerrain`, `lanceDepuisEffet`, `lanceSort`, `libelleAction`, `libelleRef`, `marqueurPose`, `meilleureCibleHostile`, `metEnJeu`, `mouvementEvt`, `mulligans`, `nettoyage`, `nomObj`, `noteHistorique`, `objetEvt`, `objetZone`, `objetsZone`, `paieAutre`, `paieEquipage`, `paieMana`, `paieReductions`, `paieTaxesAttaque`, `passeOuPresent`, `piocheN`, `prepareDeclencheur`, `presage`, `propObjet`, `questionPourUI`, `reductionParCibles`, `reductionPossible`, `remplacementsEnJeu`, `resoudre`, `resous`, `retourne`, `sacrifie`, `sagasFinies`, `scoreEffet`, `scoreLancer`, `scoreTerrain`, `sourceCiblante`, `sourceCtx`, `sourcesHorsChamp`, `sourcesMana`, `stabilise`, `statiquesEnJeu`, `suspend`, `suspensionsEntretien`, `terrainsEnMain`, `utiliteEnMain`, `vue`

### `suit()` — ligne 66

N'appelle aucune fonction du projet.

Appelée par : `ciblesForge`, `forgeDefinis`, `objetEvt`, `passeOuPresent`, `propObjet`, `resous`, `sourceCtx`

### `tableauZone()` — ligne 74

N'appelle aucune fonction du projet.

Appelée par : `deplace`

### `retireDe()` — ligne 80

N'appelle aucune fonction du projet.

Appelée par : `deplace`, `elimine`, `forgeEffetsB.js (chargement)`, `forgeEffetsE.js (chargement)`, `jeuOpsB.js (chargement)`, `mulligans`, `regardeForge`

### `instantane()` — ligne 87

Appelle : `capacitesDe()` *(jeuDurees.js)*, `car()` *(jeuCaracteristiques.js)*

Appelée par : `copieSort`, `deplace`, `forgeEffetsB.js (chargement)`, `paieAutre`, `sacrifie`

### `deplace()` — ligne 98

Appelle : `creeObjet()` *(jeuEtat.js)*, `destinationRemplacee()` *(forgeRemplacements.js)*, `emet()` *(jeuEtat.js)*, `hotePart()` *(jeuDurees.js)*, `instantane()` *(jeuEtat.js)*, `noteEntree()` *(jeuEtat.js)*, `obj()` *(jeuEtat.js)*, `retireDe()` *(jeuEtat.js)*, `suiviPart()` *(jeuDurees.js)*, `tableauZone()` *(jeuEtat.js)*

Appelée par : `appliqueSBA`, `copiesFin`, `defausseCarte`, `deplaceForge`, `detruitObjet`, `elimine`, `exhumeesFin`, `forgeEffetsA.js (chargement)`, `forgeEffetsB.js (chargement)`, `forgeEffetsE.js (chargement)`, `forgeTraine.js (chargement)`, `hotePart`, `jeuOpsA.js (chargement)`, `jeuOpsB.js (chargement)`, `jeuVariantes.js (chargement)`, `lanceSort`, `metEnJeu`, `paieAutre`, `paieMana`, `paieReductions`, `presage`, `regardeForge`, `resoudre`, `sacrifie`, `suspend`

### `noteEntree()` — ligne 145

N'appelle aucune fonction du projet.

Appelée par : `creeJetonsForge`, `deplace`, `forgeCopies.js (chargement)`, `jeuOpsB.js (chargement)`

### `emet()` — ligne 150

Appelle : `noteHistorique()` *(jeuHistorique.js)*

Appelée par : `activeCapacite`, `creeJetonsForge`, `declareAttaquants`, `declareBloqueurs`, `defausseCarte`, `degageObjet`, `deplace`, `emetCibles`, `engageObjet`, `etape`, `forgeCopies.js (chargement)`, `forgeEffetsB.js (chargement)`, `gagneVie`, `infligeDegats`, `jeuOpsB.js (chargement)`, `joueTerrain`, `lanceSort`, `piocheN`, `poseMarqueurs`, `retourneFace`, `sacrifie`, `transforme`

### `jn()` — ligne 154

N'appelle aucune fonction du projet.

Appelée par : `activeCapacite`, `copieSort`, `creeJetonsForge`, `declareAttaquants`, `detruitForge`, `detruitObjet`, `elimine`, `forgeCopies.js (chargement)`, `forgeEffetsB.js (chargement)`, `forgeEffetsE.js (chargement)`, `infligeDegats`, `jeuOpsA.js (chargement)`, `jeuOpsB.js (chargement)`, `joueTerrain`, `lanceSort`, `mulligans`, `partie`, `presage`, `resoudre`, `retourneFace`, `suspend`, `tour`, `transforme`

### `nomObj()` — ligne 156

Appelle : `obj()` *(jeuEtat.js)*

Appelée par : `declareAttaquants`, `joueTerrain`

### `vivants()` — ligne 161

N'appelle aucune fonction du projet.

Appelée par : `adversaires`, `compteJoueurs`, `elimine`, `forgeChoix.js (chargement)`, `forgeDefinis`, `forgeEffetsB.js (chargement)`, `priorite`

### `suivantVivant()` — ligne 164

N'appelle aucune fonction du projet.

Appelée par : `iaReponse`, `partie`, `priorite`

### `ordreApnap()` — ligne 173

N'appelle aucune fonction du projet.

Appelée par : `declareBloqueurs`, `mulligans`, `stabilise`

### `adversaires()` — ligne 182

Appelle : `vivants()` *(jeuEtat.js)*

Appelée par : `compteDuTour`, `compteJoueurs`, `declareAttaquants`, `etat.js (chargement)`, `forgeChoix.js (chargement)`, `forgeDefinis`, `forgeExpression`, `iaAttaquants`

### `champDe()` — ligne 185

Appelle : `obj()` *(jeuEtat.js)*

Appelée par : `actionsLegales`, `actionsPossibles`, `compteDuTour`, `convocables`, `coutAutrePossible`, `coutSort`, `declareAttaquants`, `declareBloqueurs`, `devotion`, `equipiers`, `forceDeFrappe`, `forgeEffetsA.js (chargement)`, `forgeEffetsB.js (chargement)`, `forgeExpression`, `iaAttaquants`, `iaCartes`, `iaReponse`, `iaScrute`, `impactSort`, `jeuOpsA.js (chargement)`, `jeuOpsB.js (chargement)`, `loreDebutPrincipale`, `menace`, `metEnJeu`, `notePrincipale`, `paieAutre`, `peutBloquer`, `proprieteDefenseur`, `utiliteEnMain`

### `piocheN()` — ligne 189

Appelle : `emet()` *(jeuEtat.js)*, `obj()` *(jeuEtat.js)*

Appelée par : `etape`, `forgeEffetsA.js (chargement)`, `forgeTraine.js (chargement)`, `jeuOpsA.js (chargement)`, `mulligans`, `paieAutre`

### `question()` — ligne 208

N'appelle aucune fonction du projet.

Appelée par : `activeCapacite`, `choisitCartes`, `choisitCibles`, `choisitUn`, `declareAttaquants`, `declareBloqueurs`, `effetsEntree`, `executeForge`, `forgeTraine.js (chargement)`, `jeuOpsA.js (chargement)`, `jeuVariantes.js (chargement)`, `lanceSort`, `metEnJeu`, `mulligans`, `paieTaxesAttaque`, `paieUnlessForge`, `prepareEffets`, `priorite`, `proposePaiement`

## js/jeuGestes.js

### `engageObjet()` — ligne 13

Appelle : `emet()` *(jeuEtat.js)*

Appelée par : `declareAttaquants`, `forgeEffetsC.js (chargement)`, `jeuOpsB.js (chargement)`, `paieAutre`, `paieEquipage`, `paieMana`, `paieReductions`

### `degageObjet()` — ligne 19

Appelle : `emet()` *(jeuEtat.js)*

Appelée par : `degagement`, `forgeEffetsC.js (chargement)`, `jeuOpsB.js (chargement)`, `paieAutre`

### `poseMarqueurs()` — ligne 27

Appelle : `emet()` *(jeuEtat.js)*, `quantiteRemplacee()` *(forgeRemplacements.js)*

Appelée par : `forgeEffetsB.js (chargement)`, `forgeTraine.js (chargement)`, `infligeDegats`, `jeuOpsB.js (chargement)`, `metEnJeu`, `retourneFace`

### `emetCibles()` — ligne 39

Appelle : `emet()` *(jeuEtat.js)*, `obj()` *(jeuEtat.js)*

Appelée par : `activeCapacite`, `lanceSort`, `stabilise`

## js/jeuHistorique.js

### `histoire()` — ligne 15

N'appelle aucune fonction du projet.

Appelée par : `compteDuTour`, `exprEtendue`, `noteHistorique`, `noteResolution`

### `plusUn()` — ligne 22

N'appelle aucune fonction du projet.

Appelée par : `noteHistorique`, `noteResolution`

### `noteHistorique()` — ligne 24

Appelle : `histoire()` *(jeuHistorique.js)*, `obj()` *(jeuEtat.js)*, `plusUn()` *(jeuHistorique.js)*

Appelée par : `emet`

### `noteResolution()` — ligne 50

Appelle : `histoire()` *(jeuHistorique.js)*, `plusUn()` *(jeuHistorique.js)*

Appelée par : `resoudre`

### `manaDepenseDe()` — ligne 53

N'appelle aucune fonction du projet.

Appelée par : `compteDuTour`, `exprEtendue`

## js/jeuCaracteristiques.js

### `statiquesEnJeu()` — ligne 16

Appelle : `obj()` *(jeuEtat.js)*, `sansCapacites()` *(jeuCouches.js)*

Appelée par : `capacitesAccordees`, `car`, `coutSort`, `coutsForge`, `reductionParCibles`, `statiquesForgeSur`, `statiquesMode`, `statiquesPermis`

### `statiqueVise()` — ligne 31

Appelle : `correspondBase()` *(jeuCibles.js)*

Appelée par : `car`

### `car()` — ligne 40

Appelle : `animation()` *(jeuCaracteristiques.js)*, `statiqueVise()` *(jeuCaracteristiques.js)*, `statiquesEnJeu()` *(jeuCaracteristiques.js)*, `statiquesForgeSur()` *(forgeStatiques.js)*

Appelée par : `aMot`, `agregeForge`, `appliqueSBA`, `caracForge`, `caracsJugees`, `ciblable`, `compteDuTour`, `coutDeGarde`, `declareBloqueurs`, `equipagePossible`, `forceDeCombat`, `forceDeFrappe`, `forgeEffetsB.js (chargement)`, `forgeEffetsC.js (chargement)`, `forgeExpression`, `frappe`, `iaAttaquants`, `iaBloqueurs`, `iaCibles`, `infligeDegats`, `instantane`, `jeuOpsA.js (chargement)`, `meilleureCibleHostile`, `objetVue`, `paieEquipage`, `peutAttaquer`, `peutBloquer`, `repartition`, `tue`, `valeur`, `valeurObjet`

### `animation()` — ligne 79

N'appelle aucune fonction du projet.

Appelée par : `capacitesTerrain`, `car`, `caracsJugees`, `estType`

### `aMot()` — ligne 103

Appelle : `car()` *(jeuCaracteristiques.js)*

Appelée par : `declareAttaquants`, `declareBloqueurs`, `degatsCombat`, `detruitForge`, `iaBloqueurs`, `initiativeEnJeu`, `jeuOpsA.js (chargement)`, `peutAttaquer`, `peutEngagerSoi`, `questionPourUI`, `repartition`

### `estType()` — ligne 104

Appelle : `animation()` *(jeuCaracteristiques.js)*

Appelée par : `actionsLegales`, `appliqueSBA`, `capacitesTerrain`, `declareAttaquants`, `estCreature`, `forgeEffetsA.js (chargement)`, `forgeEffetsE.js (chargement)`, `forgeExpression`, `forgeTraine.js (chargement)`, `iaCartes`, `iaScrute`, `infligeDegats`, `lanceDepuisEffet`, `notePrincipale`, `peutBloquer`, `sourcesMana`, `terrainsEnMain`, `utiliteEnMain`

### `estCreature()` — ligne 108

Appelle : `estType()` *(jeuCaracteristiques.js)*

Appelée par : `actionsLegales`, `appliqueSBA`, `compteDuTour`, `convocables`, `declareBloqueurs`, `equipiers`, `forceDeFrappe`, `forgeEffetsC.js (chargement)`, `iaAttaquants`, `iaCibles`, `impactCapacite`, `impactSort`, `infligeDegats`, `meilleureCibleHostile`, `objetVue`, `peutAttaquer`, `peutBloquer`, `peutEngagerSoi`, `proprieteDefenseur`, `scoreEffet`, `sourcesMana`, `valeurObjet`

### `peutEngagerSoi()` — ligne 113

Appelle : `aMot()` *(jeuCaracteristiques.js)*, `estCreature()` *(jeuCaracteristiques.js)*

Appelée par : `coutAutrePossible`, `sourcesMana`

### `mvDe()` — ligne 120

N'appelle aucune fonction du projet.

Appelée par : `caracEtendue`, `caracForge`, `correspondObjet`, `forgeEffetsE.js (chargement)`, `forgeTraine.js (chargement)`, `propObjet`, `valeur`

## js/jeuCibles.js

### `caracsJugees()` — ligne 13

Appelle : `animation()` *(jeuCaracteristiques.js)*, `car()` *(jeuCaracteristiques.js)*

Appelée par : `correspondObjet`, `forgeValideObjet`, `infligeDegats`

### `etatCombat()` — ligne 23

N'appelle aucune fonction du projet.

Appelée par : `correspondObjet`, `propObjet`

### `correspondObjet()` — ligne 33

Appelle : `caracsJugees()` *(jeuCibles.js)*, `etatCombat()` *(jeuCibles.js)*, `forgeValideObjet()` *(forgeValide.js)*, `mvDe()` *(jeuCaracteristiques.js)*

Appelée par : `correspond`, `correspondBase`

### `correspond()` — ligne 75

Appelle : `correspondObjet()` *(jeuCibles.js)*

Appelée par : `cibleEncoreLegale`, `ciblesLegales`, `compteObjets`, `coutAutrePossible`, `coutSort`, `ecouteRepond`, `jeuOpsA.js (chargement)`, `jeuOpsB.js (chargement)`, `paieAutre`, `resous`, `scoreEffet`

### `correspondBase()` — ligne 76

Appelle : `correspondObjet()` *(jeuCibles.js)*

Appelée par : `appliqueSBA`, `metEnJeu`, `statiqueVise`

### `joueurCorrespond()` — ligne 79

Appelle : `forgeValideJoueur()` *(forgeValide.js)*

Appelée par : `cibleEncoreLegale`, `ciblesLegales`, `resous`

### `defCorrespond()` — ligne 89

Appelle : `forgeValideDef()` *(forgeValide.js)*

Appelée par : `coutSort`, `ecouteRepond`, `rangDuSort`

### `ciblable()` — ligne 102

Appelle : `car()` *(jeuCaracteristiques.js)*, `cibleInterdite()` *(forgeInterdits.js)*, `protegeFiltre()` *(jeuCibles.js)*

Appelée par : `cibleEncoreLegale`, `ciblesLegales`

### `protegeFiltre()` — ligne 115

Appelle : `forgeValideObjet()` *(forgeValide.js)*

Appelée par : `ciblable`, `infligeDegats`, `peutBloquer`

### `ciblesLegales()` — ligne 122

Appelle : `ciblable()` *(jeuCibles.js)*, `correspond()` *(jeuCibles.js)*, `joueurCorrespond()` *(jeuCibles.js)*, `obj()` *(jeuEtat.js)*

Appelée par : `actionsLegales`, `choisitCibles`, `effetCiblable`, `meilleureCibleHostile`, `prepareEffets`

### `cibleEncoreLegale()` — ligne 149

Appelle : `ciblable()` *(jeuCibles.js)*, `correspond()` *(jeuCibles.js)*, `joueurCorrespond()` *(jeuCibles.js)*, `obj()` *(jeuEtat.js)*

Appelée par : `resoudre`

## js/jeuMana.js

### `identiteJoueur()` — ligne 19

N'appelle aucune fonction du projet.

Appelée par : `sourcesMana`

### `manaPermis()` — ligne 30

Appelle : `forgeFiltre()` *(forgeValide.js)*, `forgeValideDef()` *(forgeValide.js)*, `forgeValideObjet()` *(forgeValide.js)*

Appelée par : `sourcesMana`

### `sourcesMana()` — ligne 40

Appelle : `activationInterdite()` *(forgeInterdits.js)*, `capacitesDe()` *(jeuDurees.js)*, `choixDe()` *(forgeChoix.js)*, `compteObjets()` *(jeuMana.js)*, `estCreature()` *(jeuCaracteristiques.js)*, `estType()` *(jeuCaracteristiques.js)*, `forgeNombre()` *(forgeExpr.js)*, `identiteJoueur()` *(jeuMana.js)*, `manaPermis()` *(jeuMana.js)*, `obj()` *(jeuEtat.js)*, `peutEngagerSoi()` *(jeuCaracteristiques.js)*

Appelée par : `manaDispo`, `planPaiement`, `scoreTerrain`

### `compteObjets()` — ligne 83

Appelle : `correspond()` *(jeuCibles.js)*, `obj()` *(jeuEtat.js)*

Appelée par : `executeOps`, `sourcesMana`, `valeur`

### `planPaiement()` — ligne 92

Appelle : `sourcesMana()` *(jeuMana.js)*

Appelée par : `actionsLegales`, `activeCapacite`, `executeForge`, `forgeChoix.js (chargement)`, `jeuVariantes.js (chargement)`, `maxX`, `paieMana`, `paieReductions`, `paieTaxesAttaque`, `paieUnlessForge`, `payableAvec`, `proposePaiement`, `retournable`, `suspendable`

### `manaDispo()` — ligne 134

Appelle : `sourcesMana()` *(jeuMana.js)*

Appelée par : `iaAttaquants`, `iaOui`, `notePrincipale`, `scoreEffet`, `utiliteEnMain`

### `ajouteMana()` — ligne 139

N'appelle aucune fonction du projet.

Appelée par : `forgeEffetsC.js (chargement)`, `jeuOpsB.js (chargement)`, `paieMana`

### `debite()` — ligne 147

N'appelle aucune fonction du projet.

Appelée par : `paieMana`

### `paieMana()` — ligne 162

Appelle : `ajouteMana()` *(jeuMana.js)*, `debite()` *(jeuMana.js)*, `deplace()` *(jeuEtat.js)*, `engageObjet()` *(jeuGestes.js)*, `obj()` *(jeuEtat.js)*, `planPaiement()` *(jeuMana.js)*

Appelée par : `activeCapacite`, `equipe`, `executeForge`, `jeuVariantes.js (chargement)`, `lanceSort`, `paieTaxesAttaque`, `paieUnlessForge`, `presage`, `proposePaiement`, `retourne`, `suspend`

### `videReserves()` — ligne 183

N'appelle aucune fonction du projet.

Appelée par : `tour`

## js/jeuOpsA.js

### `chargement du module`

Appelle : `aMot()` *(jeuCaracteristiques.js)*, `car()` *(jeuCaracteristiques.js)*, `champDe()` *(jeuEtat.js)*, `choisitCartes()` *(jeuOpsA.js)*, `correspond()` *(jeuCibles.js)*, `defausseCarte()` *(jeuDurees.js)*, `deplace()` *(jeuEtat.js)*, `detruitObjet()` *(jeuDurees.js)*, `executeOps()` *(jeuOpsB.js)*, `gagneVie()` *(jeuOpsA.js)*, `incontrecarrable()` *(forgeRemplacements.js)*, `infligeDegats()` *(jeuOpsA.js)*, `jn()` *(jeuEtat.js)*, `joueursDe()` *(jeuOpsA.js)*, `piocheN()` *(jeuEtat.js)*, `question()` *(jeuEtat.js)*, `resous()` *(jeuOpsA.js)*, `retireDeLaPile()` *(jeuPile.js)*, `sacrifie()` *(jeuOpsA.js)*, `sourceCtx()` *(jeuOpsA.js)*, `valeur()` *(jeuOpsA.js)*

### `sourceCtx()` — ligne 18

Appelle : `obj()` *(jeuEtat.js)*, `suit()` *(jeuEtat.js)*

Appelée par : `executeForge`, `executeOps`, `forgeTraine.js (chargement)`, `jeuActions.js (chargement)`, `jeuFaces.js (chargement)`, `jeuOpsA.js (chargement)`, `jeuOpsB.js (chargement)`, `jeuVariantes.js (chargement)`, `resous`, `valeur`

### `passeOuPresent()` — ligne 22

Appelle : `obj()` *(jeuEtat.js)*, `suit()` *(jeuEtat.js)*

Appelée par : `cibleForge`, `exprEtendue`, `forgeDeclencheurs.js (chargement)`, `forgeDefinis`, `forgeExpression`, `resous`

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

Appelle : `emet()` *(jeuEtat.js)*, `quantiteRemplacee()` *(forgeRemplacements.js)*, `vieBloquee()` *(forgeInterdits.js)*

Appelée par : `forgeEffetsB.js (chargement)`, `infligeDegats`, `jeuOpsA.js (chargement)`

### `infligeDegats()` — ligne 92

Appelle : `car()` *(jeuCaracteristiques.js)*, `caracsJugees()` *(jeuCibles.js)*, `degatsApresPrevention()` *(forgeRemplacements.js)*, `emet()` *(jeuEtat.js)*, `estCreature()` *(jeuCaracteristiques.js)*, `estType()` *(jeuCaracteristiques.js)*, `gagneVie()` *(jeuOpsA.js)*, `jn()` *(jeuEtat.js)*, `poseMarqueurs()` *(jeuGestes.js)*, `protegeFiltre()` *(jeuCibles.js)*, `quantiteRemplacee()` *(forgeRemplacements.js)*

Appelée par : `degatsCombat`, `forgeEffetsB.js (chargement)`, `forgeEffetsC.js (chargement)`, `jeuOpsA.js (chargement)`

### `choisitCartes()` — ligne 124

Appelle : `question()` *(jeuEtat.js)*

Appelée par : `aCopier`, `forgeChoix.js (chargement)`, `forgeEffetsA.js (chargement)`, `forgeEffetsB.js (chargement)`, `forgeEffetsE.js (chargement)`, `forgeTraine.js (chargement)`, `jeuOpsA.js (chargement)`, `jeuOpsB.js (chargement)`, `mulligans`, `nettoyage`, `paieAutre`, `paieEquipage`, `paieReductions`, `regardeForge`

### `sacrifie()` — ligne 198

Appelle : `deplace()` *(jeuEtat.js)*, `emet()` *(jeuEtat.js)*, `instantane()` *(jeuEtat.js)*, `obj()` *(jeuEtat.js)*

Appelée par : `copiesFin`, `forgeEffetsB.js (chargement)`, `jeuOpsA.js (chargement)`, `jeuVariantes.js (chargement)`, `paieAutre`

## js/jeuOpsB.js

### `chargement du module`

Appelle : `ajouteMana()` *(jeuMana.js)*, `champDe()` *(jeuEtat.js)*, `choisitCartes()` *(jeuOpsA.js)*, `correspond()` *(jeuCibles.js)*, `creeObjet()` *(jeuEtat.js)*, `definitionJeton()` *(definitions.js)*, `degageObjet()` *(jeuGestes.js)*, `deplace()` *(jeuEtat.js)*, `emet()` *(jeuEtat.js)*, `engageObjet()` *(jeuGestes.js)*, `jn()` *(jeuEtat.js)*, `joueursDe()` *(jeuOpsA.js)*, `melangeHasard()` *(jeuHasard.js)*, `metEnJeu()` *(jeuOpsB.js)*, `noteEntree()` *(jeuEtat.js)*, `nouvelleCarte()` *(jeuEtat.js)*, `obj()` *(jeuEtat.js)*, `poseMarqueurs()` *(jeuGestes.js)*, `resous()` *(jeuOpsA.js)*, `retireDe()` *(jeuEtat.js)*, `retireDeLaPile()` *(jeuPile.js)*, `sourceCtx()` *(jeuOpsA.js)*, `valeur()` *(jeuOpsA.js)*

### `metEnJeu()` — ligne 104

Appelle : `ajouteLore()` *(jeuFaces.js)*, `champDe()` *(jeuEtat.js)*, `conditionForge()` *(forgeEffetsA.js)*, `correspondBase()` *(jeuCibles.js)*, `defFaceCachee()` *(jeuFaces.js)*, `deplace()` *(jeuEtat.js)*, `effetsEntree()` *(forgeChoix.js)*, `entreeEngageeParAutre()` *(forgeRemplacements.js)*, `forgeNombre()` *(forgeExpr.js)*, `obj()` *(jeuEtat.js)*, `poseMarqueurs()` *(jeuGestes.js)*, `question()` *(jeuEtat.js)*

Appelée par : `deplaceForge`, `jeuOpsB.js (chargement)`, `jeuVariantes.js (chargement)`, `joueTerrain`, `resoudre`

### `proposePaiement()` — ligne 149

Appelle : `joueursDe()` *(jeuOpsA.js)*, `paieMana()` *(jeuMana.js)*, `planPaiement()` *(jeuMana.js)*, `question()` *(jeuEtat.js)*

Appelée par : `executeOps`

### `executeOps()` — ligne 157

Appelle : `compteObjets()` *(jeuMana.js)*, `proposePaiement()` *(jeuOpsB.js)*, `sourceCtx()` *(jeuOpsA.js)*, → `executeForge()` *(forgeEffetsA.js)*

Appelée par : `effetsEntree`, `forgeChoix.js (chargement)`, `jeuOpsA.js (chargement)`, `resoudre`

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

Appelle : `correspond()` *(jeuCibles.js)*, `defCorrespond()` *(jeuCibles.js)*, `forgeDeclenche()` *(forgeDeclencheurs.js)*, `obj()` *(jeuEtat.js)*, `quiConvient()` *(jeuDeclencheurs.js)*, `rangDuSort()` *(jeuDeclencheurs.js)*

Appelée par : `collecteDeclencheurs`

### `collecteDeclencheurs()` — ligne 83

Appelle : `capacitesDe()` *(jeuDurees.js)*, `collecteRetardes()` *(jeuDurees.js)*, `declenchementsEnPlus()` *(forgeInterdits.js)*, `declencheursEtat()` *(forgeDeclencheursB.js)*, `ecoute()` *(jeuDeclencheurs.js)*, `ecouteRepond()` *(jeuDeclencheurs.js)*, `obj()` *(jeuEtat.js)*, `sourcesEffets()` *(jeuDurees.js)*, `sourcesHorsChamp()` *(jeuDeclencheurs.js)*

Appelée par : `nettoyage`, `stabilise`

### `sourcesHorsChamp()` — ligne 121

Appelle : `obj()` *(jeuEtat.js)*

Appelée par : `collecteDeclencheurs`

### `declencheursDeLancement()` — ligne 134

N'appelle aucune fonction du projet.

Appelée par : `lanceSort`

## js/jeuEtatsDeJeu.js

### `elimine()` — ligne 13

Appelle : `deplace()` *(jeuEtat.js)*, `jn()` *(jeuEtat.js)*, `obj()` *(jeuEtat.js)*, `retireDe()` *(jeuEtat.js)*, `vivants()` *(jeuEtat.js)*

Appelée par : `appliqueSBA`

### `appliqueSBA()` — ligne 37

Appelle : `car()` *(jeuCaracteristiques.js)*, `correspondBase()` *(jeuCibles.js)*, `couchesStatiques()` *(jeuCouches.js)*, `deplace()` *(jeuEtat.js)*, `detruitObjet()` *(jeuDurees.js)*, `elimine()` *(jeuEtatsDeJeu.js)*, `estCreature()` *(jeuCaracteristiques.js)*, `estType()` *(jeuCaracteristiques.js)*, `obj()` *(jeuEtat.js)*, `sagasFinies()` *(jeuFaces.js)*

Appelée par : `stabilise`

## js/jeuLancer.js

### `enPhasePrincipale()` — ligne 13

N'appelle aucune fonction du projet.

Appelée par : `actionsLegales`, `actionsPossibles`, `iaPriorite`, `sortInterdit`

### `estEphemere()` — ligne 17

N'appelle aucune fonction du projet.

Appelée par : `actionsLegales`, `actionsPossibles`, `suspendable`

### `coutSort()` — ligne 25

Appelle : `champDe()` *(jeuEtat.js)*, `correspond()` *(jeuCibles.js)*, `coutsForge()` *(forgeStatiques.js)*, `defCorrespond()` *(jeuCibles.js)*, `statiquesEnJeu()` *(jeuCaracteristiques.js)*

Appelée par : `coutPermis`, `variantesFaces`, `variantesSort`

### `effetCiblable()` — ligne 42

Appelle : `ciblesLegales()` *(jeuCibles.js)*

Appelée par : `actionsLegales`

### `coutAutrePossible()` — ligne 49

Appelle : `champDe()` *(jeuEtat.js)*, `correspond()` *(jeuCibles.js)*, `equipagePossible()` *(jeuFaces.js)*, `obj()` *(jeuEtat.js)*, `peutEngagerSoi()` *(jeuCaracteristiques.js)*

Appelée par : `actionsLegales`, `activeCapacite`, `executeForge`, `forgeChoix.js (chargement)`, `lanceSort`, `paieUnlessForge`, `variantesSort`

### `actionsLegales()` — ligne 69

Appelle : `activationInterdite()` *(forgeInterdits.js)*, `capacitesDe()` *(jeuDurees.js)*, `cartesPermises()` *(jeuPermis.js)*, `champDe()` *(jeuEtat.js)*, `ciblesLegales()` *(jeuCibles.js)*, `coutAutrePossible()` *(jeuLancer.js)*, `dansPhases()` *(forgeDeclencheurs.js)*, `effetCiblable()` *(jeuLancer.js)*, `enPhasePrincipale()` *(jeuLancer.js)*, `estCreature()` *(jeuCaracteristiques.js)*, `estEphemere()` *(jeuLancer.js)*, `estType()` *(jeuCaracteristiques.js)*, `flashAccorde()` *(forgeInterdits.js)*, `obj()` *(jeuEtat.js)*, `planPaiement()` *(jeuMana.js)*, `retournable()` *(jeuFaces.js)*, `sortInterdit()` *(forgeInterdits.js)*, `suspendable()` *(jeuVariantes.js)*, `terrainsParTour()` *(forgeInterdits.js)*, `variantesSort()` *(jeuVariantes.js)*

Appelée par : `actionsPossibles`

### `actionsPossibles()` — ligne 144

Appelle : `actionsLegales()` *(jeuLancer.js)*, `capacitesDe()` *(jeuDurees.js)*, `cartesPermises()` *(jeuPermis.js)*, `champDe()` *(jeuEtat.js)*, `enPhasePrincipale()` *(jeuLancer.js)*, `estEphemere()` *(jeuLancer.js)*, `flashPossible()` *(forgeInterdits.js)*, `obj()` *(jeuEtat.js)*, `retournable()` *(jeuFaces.js)*

Appelée par : `priorite`

### `choisitCibles()` — ligne 160

Appelle : `ciblesLegales()` *(jeuCibles.js)*, `question()` *(jeuEtat.js)*

Appelée par : `equipe`, `lanceSort`, `prepareEffets`

### `prepareEffets()` — ligne 175

Appelle : `choisitCibles()` *(jeuLancer.js)*, `ciblesLegales()` *(jeuCibles.js)*, `question()` *(jeuEtat.js)*

Appelée par : `activeCapacite`, `copieSort`, `lanceSort`, `prepareDeclencheur`

### `coutDeGarde()` — ligne 194

Appelle : `car()` *(jeuCaracteristiques.js)*, `obj()` *(jeuEtat.js)*

Appelée par : `lanceSort`

## js/jeuActions.js

### `chargement du module`

Appelle : `resous()` *(jeuOpsA.js)*, `sourceCtx()` *(jeuOpsA.js)*

### `paieAutre()` — ligne 13

Appelle : `champDe()` *(jeuEtat.js)*, `choisitCartes()` *(jeuOpsA.js)*, `correspond()` *(jeuCibles.js)*, `defausseCarte()` *(jeuDurees.js)*, `degageObjet()` *(jeuGestes.js)*, `deplace()` *(jeuEtat.js)*, `engageObjet()` *(jeuGestes.js)*, `instantane()` *(jeuEtat.js)*, `obj()` *(jeuEtat.js)*, `paieEquipage()` *(jeuFaces.js)*, `piocheN()` *(jeuEtat.js)*, `sacrifie()` *(jeuOpsA.js)*

Appelée par : `activeCapacite`, `executeForge`, `lanceSort`, `paieUnlessForge`

### `maxX()` — ligne 50

Appelle : `planPaiement()` *(jeuMana.js)*

Appelée par : `activeCapacite`, `lanceSort`

### `lanceSort()` — ligne 57

Appelle : `choisitCibles()` *(jeuLancer.js)*, `coutAutrePossible()` *(jeuLancer.js)*, `coutDeGarde()` *(jeuLancer.js)*, `declencheursDeLancement()` *(jeuDeclencheurs.js)*, `deplace()` *(jeuEtat.js)*, `emet()` *(jeuEtat.js)*, `emetCibles()` *(jeuGestes.js)*, `jn()` *(jeuEtat.js)*, `maxX()` *(jeuActions.js)*, `obj()` *(jeuEtat.js)*, `paieAutre()` *(jeuActions.js)*, `paieMana()` *(jeuMana.js)*, `paieReductions()` *(jeuVariantes.js)*, `payableAvec()` *(jeuVariantes.js)*, `permisUtilise()` *(jeuPermis.js)*, `prepareEffets()` *(jeuLancer.js)*, `question()` *(jeuEtat.js)*, `reductionParCibles()` *(forgeStatiques.js)*, `varianteDe()` *(jeuVariantes.js)*

Appelée par : `executeAction`, `forgeTraine.js (chargement)`, `jeuVariantes.js (chargement)`, `lanceDepuisEffet`

### `activeCapacite()` — ligne 122

Appelle : `capacitesDe()` *(jeuDurees.js)*, `coutAutrePossible()` *(jeuLancer.js)*, `emet()` *(jeuEtat.js)*, `emetCibles()` *(jeuGestes.js)*, `jn()` *(jeuEtat.js)*, `maxX()` *(jeuActions.js)*, `obj()` *(jeuEtat.js)*, `paieAutre()` *(jeuActions.js)*, `paieMana()` *(jeuMana.js)*, `planPaiement()` *(jeuMana.js)*, `prepareEffets()` *(jeuLancer.js)*, `question()` *(jeuEtat.js)*

Appelée par : `executeAction`

### `equipe()` — ligne 157

Appelle : `choisitCibles()` *(jeuLancer.js)*, `obj()` *(jeuEtat.js)*, `paieMana()` *(jeuMana.js)*

Appelée par : `executeAction`

### `joueTerrain()` — ligne 175

Appelle : `emet()` *(jeuEtat.js)*, `jn()` *(jeuEtat.js)*, `metEnJeu()` *(jeuOpsB.js)*, `nomObj()` *(jeuEtat.js)*, `obj()` *(jeuEtat.js)*, `permisUtilise()` *(jeuPermis.js)*

Appelée par : `executeAction`, `lanceDepuisEffet`

### `executeAction()` — ligne 185

Appelle : `activeCapacite()` *(jeuActions.js)*, `equipe()` *(jeuActions.js)*, `joueTerrain()` *(jeuActions.js)*, `lanceSort()` *(jeuActions.js)*, `presage()` *(jeuVariantes.js)*, `retourne()` *(jeuFaces.js)*, `suspend()` *(jeuVariantes.js)*

Appelée par : `priorite`

## js/jeuVariantes.js

### `chargement du module`

Appelle : `coutComplet()` *(jeuVariantes.js)*, `coutManaVide()` *(oracleCouts.js)*, `deplace()` *(jeuEtat.js)*, `lanceSort()` *(jeuActions.js)*, `metEnJeu()` *(jeuOpsB.js)*, `obj()` *(jeuEtat.js)*, `paieMana()` *(jeuMana.js)*, `planPaiement()` *(jeuMana.js)*, `question()` *(jeuEtat.js)*, `sacrifie()` *(jeuOpsA.js)*, `sommeMana()` *(jeuVariantes.js)*, `sourceCtx()` *(jeuOpsA.js)*, `varianteDe()` *(jeuVariantes.js)*

### `coutComplet()` — ligne 20

N'appelle aucune fonction du projet.

Appelée par : `jeuVariantes.js (chargement)`, `variantesSort`

### `autresCout()` — ligne 23

N'appelle aucune fonction du projet.

Appelée par : `executeForge`, `forgeChoix.js (chargement)`, `paieUnlessForge`, `variantesSort`

### `sommeMana()` — ligne 31

N'appelle aucune fonction du projet.

Appelée par : `jeuVariantes.js (chargement)`, `variantesSort`

### `fusionAutres()` — ligne 41

N'appelle aucune fonction du projet.

Appelée par : `variantesSort`

### `convocables()` — ligne 49

Appelle : `champDe()` *(jeuEtat.js)*, `estCreature()` *(jeuCaracteristiques.js)*

Appelée par : `ordreConvocation`, `payableAvec`

### `moinsGenerique()` — ligne 53

N'appelle aucune fonction du projet.

Appelée par : `convoque`, `paieReductions`, `reduit`

### `convoque()` — ligne 60

Appelle : `moinsGenerique()` *(jeuVariantes.js)*

Appelée par : `paieReductions`, `reduit`

### `ordreConvocation()` — ligne 72

Appelle : `convocables()` *(jeuVariantes.js)*

Appelée par : `paieReductions`

### `reduit()` — ligne 79

Appelle : `convoque()` *(jeuVariantes.js)*, `moinsGenerique()` *(jeuVariantes.js)*

Appelée par : `paieReductions`, `payableAvec`

### `payableAvec()` — ligne 85

Appelle : `convocables()` *(jeuVariantes.js)*, `planPaiement()` *(jeuMana.js)*, `reductionPossible()` *(forgeStatiques.js)*, `reduit()` *(jeuVariantes.js)*

Appelée par : `lanceSort`, `variantesSort`

### `variantesSort()` — ligne 99

Appelle : `autresCout()` *(jeuVariantes.js)*, `coutAutrePossible()` *(jeuLancer.js)*, `coutComplet()` *(jeuVariantes.js)*, `coutManaVide()` *(oracleCouts.js)*, `coutPermis()` *(jeuPermis.js)*, `coutSort()` *(jeuLancer.js)*, `fusionAutres()` *(jeuVariantes.js)*, `payableAvec()` *(jeuVariantes.js)*, `permisDeJouer()` *(jeuPermis.js)*, `sommeMana()` *(jeuVariantes.js)*, `variantesFaces()` *(jeuFaces.js)*

Appelée par : `actionsLegales`, `varianteDe`

### `varianteDe()` — ligne 131

Appelle : `variantesSort()` *(jeuVariantes.js)*

Appelée par : `jeuVariantes.js (chargement)`, `lanceSort`

### `paieReductions()` — ligne 140

Appelle : `choisitCartes()` *(jeuOpsA.js)*, `convoque()` *(jeuVariantes.js)*, `deplace()` *(jeuEtat.js)*, `engageObjet()` *(jeuGestes.js)*, `moinsGenerique()` *(jeuVariantes.js)*, `obj()` *(jeuEtat.js)*, `ordreConvocation()` *(jeuVariantes.js)*, `planPaiement()` *(jeuMana.js)*, `reduit()` *(jeuVariantes.js)*

Appelée par : `lanceSort`

### `presage()` — ligne 174

Appelle : `deplace()` *(jeuEtat.js)*, `jn()` *(jeuEtat.js)*, `obj()` *(jeuEtat.js)*, `paieMana()` *(jeuMana.js)*

Appelée par : `executeAction`

### `exhumeesFin()` — ligne 237

Appelle : `deplace()` *(jeuEtat.js)*, `obj()` *(jeuEtat.js)*

Appelée par : `etape`

### `suspendable()` — ligne 244

Appelle : `estEphemere()` *(jeuLancer.js)*, `planPaiement()` *(jeuMana.js)*

Appelée par : `actionsLegales`

### `suspend()` — ligne 249

Appelle : `deplace()` *(jeuEtat.js)*, `jn()` *(jeuEtat.js)*, `obj()` *(jeuEtat.js)*, `paieMana()` *(jeuMana.js)*

Appelée par : `executeAction`

### `suspensionsEntretien()` — ligne 260

Appelle : `obj()` *(jeuEtat.js)*

Appelée par : `etape`

## js/jeuDurees.js

### `durees()` — ligne 23

N'appelle aucune fonction du projet.

Appelée par : `forgeEffetsA.js (chargement)`, `forgeEffetsD.js (chargement)`, `poseEffet`

### `poseEffet()` — ligne 29

Appelle : `durees()` *(jeuDurees.js)*

Appelée par : `forgeEffetsD.js (chargement)`

### `finDuTour()` — ligne 40

Appelle : `obj()` *(jeuEtat.js)*

Appelée par : `nettoyage`

### `debutDuTour()` — ligne 50

N'appelle aucune fonction du projet.

Appelée par : `tour`

### `hotePart()` — ligne 60

Appelle : `deplace()` *(jeuEtat.js)*, `obj()` *(jeuEtat.js)*, `suiviPart()` *(jeuDurees.js)*

Appelée par : `deplace`

### `suiviPart()` — ligne 77

N'appelle aucune fonction du projet.

Appelée par : `deplace`, `hotePart`

### `sourcesEffets()` — ligne 84

N'appelle aucune fonction du projet.

Appelée par : `collecteDeclencheurs`

### `collecteRetardes()` — ligne 90

Appelle : `forgeDeclenche()` *(forgeDeclencheurs.js)*, `obj()` *(jeuEtat.js)*

Appelée par : `collecteDeclencheurs`

### `capacitesDe()` — ligne 107

Appelle : `capacitesAccordees()` *(forgeEffetsD.js)*, `capacitesTerrain()` *(jeuCouches.js)*, `sansCapacites()` *(jeuCouches.js)*

Appelée par : `actionsLegales`, `actionsPossibles`, `activeCapacite`, `collecteDeclencheurs`, `declencheursEtat`, `iaPriorite`, `iaReponse`, `impactCapacite`, `instantane`, `libelleAction`, `sourcesMana`

### `detruitObjet()` — ligne 124

Appelle : `deplace()` *(jeuEtat.js)*, `jn()` *(jeuEtat.js)*

Appelée par : `appliqueSBA`, `detruitForge`, `jeuOpsA.js (chargement)`

### `defausseCarte()` — ligne 139

Appelle : `deplace()` *(jeuEtat.js)*, `emet()` *(jeuEtat.js)*, `obj()` *(jeuEtat.js)*

Appelée par : `forgeEffetsA.js (chargement)`, `forgeTraine.js (chargement)`, `jeuOpsA.js (chargement)`, `nettoyage`, `paieAutre`

## js/jeuFaces.js

### `chargement du module`

Appelle : `sourceCtx()` *(jeuOpsA.js)*

### `defFaceCachee()` — ligne 20

Appelle : `coutManaVide()` *(oracleCouts.js)*

Appelée par : `defVariante`, `metEnJeu`, `variantesFaces`

### `defVariante()` — ligne 31

Appelle : `defFaceCachee()` *(jeuFaces.js)*

Appelée par : `scoreLancer`

### `variantesFaces()` — ligne 40

Appelle : `coutSort()` *(jeuLancer.js)*, `defFaceCachee()` *(jeuFaces.js)*

Appelée par : `variantesSort`

### `retournable()` — ligne 50

Appelle : `planPaiement()` *(jeuMana.js)*

Appelée par : `actionsLegales`, `actionsPossibles`, `retourne`

### `retourne()` — ligne 54

Appelle : `obj()` *(jeuEtat.js)*, `paieMana()` *(jeuMana.js)*, `retournable()` *(jeuFaces.js)*, `retourneFace()` *(jeuFaces.js)*

Appelée par : `executeAction`

### `retourneFace()` — ligne 61

Appelle : `emet()` *(jeuEtat.js)*, `jn()` *(jeuEtat.js)*, `poseMarqueurs()` *(jeuGestes.js)*

Appelée par : `forgeEffetsD.js (chargement)`, `retourne`

### `transforme()` — ligne 72

Appelle : `emet()` *(jeuEtat.js)*, `jn()` *(jeuEtat.js)*

Appelée par : `forgeEffetsD.js (chargement)`

### `ajouteLore()` — ligne 84

N'appelle aucune fonction du projet.

Appelée par : `loreDebutPrincipale`, `metEnJeu`

### `loreDebutPrincipale()` — ligne 96

Appelle : `ajouteLore()` *(jeuFaces.js)*, `champDe()` *(jeuEtat.js)*

Appelée par : `etape`

### `sagasFinies()` — ligne 102

Appelle : `obj()` *(jeuEtat.js)*

Appelée par : `appliqueSBA`

### `equipiers()` — ligne 109

Appelle : `champDe()` *(jeuEtat.js)*, `estCreature()` *(jeuCaracteristiques.js)*

Appelée par : `equipagePossible`, `paieEquipage`

### `equipagePossible()` — ligne 113

Appelle : `car()` *(jeuCaracteristiques.js)*, `equipiers()` *(jeuFaces.js)*

Appelée par : `coutAutrePossible`

### `paieEquipage()` — ligne 117

Appelle : `car()` *(jeuCaracteristiques.js)*, `choisitCartes()` *(jeuOpsA.js)*, `engageObjet()` *(jeuGestes.js)*, `equipiers()` *(jeuFaces.js)*, `obj()` *(jeuEtat.js)*

Appelée par : `paieAutre`

## js/jeuPermis.js

### `statiquesPermis()` — ligne 17

Appelle : `statiquesEnJeu()` *(jeuCaracteristiques.js)*

Appelée par : `cartesPermises`, `permisDeJouer`

### `dansZonesForge()` — ligne 24

N'appelle aucune fonction du projet.

Appelée par : `permisDeJouer`

### `permisDeJouer()` — ligne 30

Appelle : `dansZonesForge()` *(jeuPermis.js)*, `statiquesPermis()` *(jeuPermis.js)*, `viseForge()` *(forgeStatiques.js)*

Appelée par : `cartesPermises`, `permisUtilise`, `variantesSort`

### `cartesPermises()` — ligne 47

Appelle : `obj()` *(jeuEtat.js)*, `permisDeJouer()` *(jeuPermis.js)*, `statiquesPermis()` *(jeuPermis.js)*

Appelée par : `actionsLegales`, `actionsPossibles`

### `coutPermis()` — ligne 64

Appelle : `coutManaVide()` *(oracleCouts.js)*, `coutSort()` *(jeuLancer.js)*

Appelée par : `variantesSort`

### `permisUtilise()` — ligne 69

Appelle : `permisDeJouer()` *(jeuPermis.js)*

Appelée par : `joueTerrain`, `lanceSort`

## js/jeuPile.js

### `retireDeLaPile()` — ligne 16

N'appelle aucune fonction du projet.

Appelée par : `deplaceForge`, `forgeEffetsB.js (chargement)`, `jeuOpsA.js (chargement)`, `jeuOpsB.js (chargement)`

### `prepareDeclencheur()` — ligne 23

Appelle : `obj()` *(jeuEtat.js)*, `prepareEffets()` *(jeuLancer.js)*

Appelée par : `stabilise`

### `stabilise()` — ligne 32

Appelle : `appliqueSBA()` *(jeuEtatsDeJeu.js)*, `collecteDeclencheurs()` *(jeuDeclencheurs.js)*, `emetCibles()` *(jeuGestes.js)*, `obj()` *(jeuEtat.js)*, `ordreApnap()` *(jeuEtat.js)*, `prepareDeclencheur()` *(jeuPile.js)*

Appelée par : `priorite`

### `resoudre()` — ligne 58

Appelle : `cibleEncoreLegale()` *(jeuCibles.js)*, `deplace()` *(jeuEtat.js)*, `executeOps()` *(jeuOpsB.js)*, `jn()` *(jeuEtat.js)*, `metEnJeu()` *(jeuOpsB.js)*, `noteResolution()` *(jeuHistorique.js)*, `obj()` *(jeuEtat.js)*

Appelée par : `priorite`

### `priorite()` — ligne 103

Appelle : `actionsPossibles()` *(jeuLancer.js)*, `executeAction()` *(jeuActions.js)*, `question()` *(jeuEtat.js)*, `resoudre()` *(jeuPile.js)*, `stabilise()` *(jeuPile.js)*, `suivantVivant()` *(jeuEtat.js)*, `vivants()` *(jeuEtat.js)*

Appelée par : `degatsCombat`, `etape`, `nettoyage`

## js/jeuCombat.js

### `peutAttaquer()` — ligne 13

Appelle : `aMot()` *(jeuCaracteristiques.js)*, `car()` *(jeuCaracteristiques.js)*, `defenseurAttaque()` *(forgeInterdits.js)*, `estCreature()` *(jeuCaracteristiques.js)*

Appelée par : `declareAttaquants`

### `peutBloquer()` — ligne 19

Appelle : `car()` *(jeuCaracteristiques.js)*, `champDe()` *(jeuEtat.js)*, `estCreature()` *(jeuCaracteristiques.js)*, `estType()` *(jeuCaracteristiques.js)*, `forgeValideObjet()` *(forgeValide.js)*, `protegeFiltre()` *(jeuCibles.js)*

Appelée par : `declareBloqueurs`, `iaAttaquants`, `iaBloqueurs`, `questionPourUI`

### `declareAttaquants()` — ligne 37

Appelle : `aMot()` *(jeuCaracteristiques.js)*, `adversaires()` *(jeuEtat.js)*, `attaquePermise()` *(forgeInterdits.js)*, `champDe()` *(jeuEtat.js)*, `doitAttaquer()` *(forgeInterdits.js)*, `emet()` *(jeuEtat.js)*, `engageObjet()` *(jeuGestes.js)*, `estType()` *(jeuCaracteristiques.js)*, `jn()` *(jeuEtat.js)*, `nomObj()` *(jeuEtat.js)*, `obj()` *(jeuEtat.js)*, `paieTaxesAttaque()` *(jeuCombat.js)*, `peutAttaquer()` *(jeuCombat.js)*, `question()` *(jeuEtat.js)*, `taxeAttaque()` *(forgeInterdits.js)*

Appelée par : `etape`

### `paieTaxesAttaque()` — ligne 74

Appelle : `coutManaVide()` *(oracleCouts.js)*, `obj()` *(jeuEtat.js)*, `paieMana()` *(jeuMana.js)*, `planPaiement()` *(jeuMana.js)*, `question()` *(jeuEtat.js)*, `taxeAttaque()` *(forgeInterdits.js)*

Appelée par : `declareAttaquants`

### `defenseurDe()` — ligne 87

Appelle : `obj()` *(jeuEtat.js)*

Appelée par : `attaquePermise`, `declareBloqueurs`, `forgeDefinis`, `propObjet`

### `declareBloqueurs()` — ligne 94

Appelle : `aMot()` *(jeuCaracteristiques.js)*, `bornesBlocage()` *(forgeInterdits.js)*, `car()` *(jeuCaracteristiques.js)*, `champDe()` *(jeuEtat.js)*, `defenseurDe()` *(jeuCombat.js)*, `doitBloquer()` *(forgeInterdits.js)*, `emet()` *(jeuEtat.js)*, `estCreature()` *(jeuCaracteristiques.js)*, `obj()` *(jeuEtat.js)*, `ordreApnap()` *(jeuEtat.js)*, `peutBloquer()` *(jeuCombat.js)*, `question()` *(jeuEtat.js)*

Appelée par : `etape`

### `initiativeEnJeu()` — ligne 129

Appelle : `aMot()` *(jeuCaracteristiques.js)*, `obj()` *(jeuEtat.js)*

Appelée par : `etape`

### `frappe()` — ligne 135

Appelle : `car()` *(jeuCaracteristiques.js)*

Appelée par : `degatsCombat`

### `repartition()` — ligne 143

Appelle : `aMot()` *(jeuCaracteristiques.js)*, `car()` *(jeuCaracteristiques.js)*

Appelée par : `degatsCombat`

### `forceDeCombat()` — ligne 161

Appelle : `car()` *(jeuCaracteristiques.js)*, `degatsParEndurance()` *(forgeInterdits.js)*

Appelée par : `degatsCombat`

### `degatsCombat()` — ligne 165

Appelle : `aMot()` *(jeuCaracteristiques.js)*, `forceDeCombat()` *(jeuCombat.js)*, `frappe()` *(jeuCombat.js)*, `infligeDegats()` *(jeuOpsA.js)*, `obj()` *(jeuEtat.js)*, `priorite()` *(jeuPile.js)*, `repartition()` *(jeuCombat.js)*

Appelée par : `etape`

### `finCombat()` — ligne 192

N'appelle aucune fonction du projet.

Appelée par : `etape`

## js/jeuTour.js

### `degagement()` — ligne 20

Appelle : `degageObjet()` *(jeuGestes.js)*, `degagementEmpeche()` *(forgeRemplacements.js)*, `obj()` *(jeuEtat.js)*

Appelée par : `etape`

### `nettoyage()` — ligne 32

Appelle : `choisitCartes()` *(jeuOpsA.js)*, `collecteDeclencheurs()` *(jeuDeclencheurs.js)*, `defausseCarte()` *(jeuDurees.js)*, `finDuTour()` *(jeuDurees.js)*, `obj()` *(jeuEtat.js)*, `priorite()` *(jeuPile.js)*, `tailleMainMax()` *(forgeInterdits.js)*

Appelée par : `etape`

### `etape()` — ligne 53

Appelle : `copiesFin()` *(forgeCopies.js)*, `declareAttaquants()` *(jeuCombat.js)*, `declareBloqueurs()` *(jeuCombat.js)*, `degagement()` *(jeuTour.js)*, `degatsCombat()` *(jeuCombat.js)*, `emet()` *(jeuEtat.js)*, `exhumeesFin()` *(jeuVariantes.js)*, `finCombat()` *(jeuCombat.js)*, `initiativeEnJeu()` *(jeuCombat.js)*, `loreDebutPrincipale()` *(jeuFaces.js)*, `nettoyage()` *(jeuTour.js)*, `notePrincipale()` *(jeuTour.js)*, `piocheN()` *(jeuEtat.js)*, `priorite()` *(jeuPile.js)*, `suspensionsEntretien()` *(jeuVariantes.js)*

Appelée par : `tour`

### `notePrincipale()` — ligne 87

Appelle : `champDe()` *(jeuEtat.js)*, `estType()` *(jeuCaracteristiques.js)*, `manaDispo()` *(jeuMana.js)*

Appelée par : `etape`

### `tour()` — ligne 94

Appelle : `debutDuTour()` *(jeuDurees.js)*, `etape()` *(jeuTour.js)*, `jn()` *(jeuEtat.js)*, `videReserves()` *(jeuMana.js)*

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

Appelée par : `commenceTable`, `joueJusquauBout`, `joueLot`, `reprendTable`

### `valideReponse()` — ligne 21

N'appelle aucune fonction du projet.

Appelée par : `avance`, `boucleTable`, `repondre`

### `reponseRecevable()` — ligne 39

N'appelle aucune fonction du projet.

Appelée par : `recoitReponse`

### `avance()` — ligne 62

Appelle : `valideReponse()` *(jeuPilote.js)*

Appelée par : `boucleTable`, `joueJusquauBout`, `joueLot`, `nouveauSuivi`, `repondre`, `reprendTable`

### `repondre()` — ligne 85

Appelle : `avance()` *(jeuPilote.js)*, `valideReponse()` *(jeuPilote.js)*

Appelée par : `boucleTable`, `recoitReponse`, `reprendTable`

### `joueJusquauBout()` — ligne 94

Appelle : `avance()` *(jeuPilote.js)*, `creePartie()` *(jeuPilote.js)*

Appelée par : `rejouePartie`

## js/jeuVue.js

### `ficheVue()` — ligne 17

N'appelle aucune fonction du projet.

Appelée par : `carteVue`, `objetVue`, `questionPourUI`, `vue`

### `objetVue()` — ligne 24

Appelle : `car()` *(jeuCaracteristiques.js)*, `estCreature()` *(jeuCaracteristiques.js)*, `ficheVue()` *(jeuVue.js)*

Appelée par : `vue`

### `carteVue()` — ligne 36

Appelle : `ficheVue()` *(jeuVue.js)*, `obj()` *(jeuEtat.js)*

Appelée par : `vue`

### `libelleRef()` — ligne 43

Appelle : `obj()` *(jeuEtat.js)*

Appelée par : `questionPourUI`, `vue`

### `vue()` — ligne 50

Appelle : `carteVue()` *(jeuVue.js)*, `ficheVue()` *(jeuVue.js)*, `libelleRef()` *(jeuVue.js)*, `obj()` *(jeuEtat.js)*, `objetVue()` *(jeuVue.js)*

Appelée par : `diffuseVues`, `envoieQuestion`, `envoieVue`, `poseQuestion`

### `libelleAction()` — ligne 67

Appelle : `capacitesDe()` *(jeuDurees.js)*, `obj()` *(jeuEtat.js)*

Appelée par : `questionPourUI`

### `questionPourUI()` — ligne 87

Appelle : `aMot()` *(jeuCaracteristiques.js)*, `ficheVue()` *(jeuVue.js)*, `libelleAction()` *(jeuVue.js)*, `libelleRef()` *(jeuVue.js)*, `obj()` *(jeuEtat.js)*, `peutBloquer()` *(jeuCombat.js)*

Appelée par : `envoieQuestion`, `poseQuestion`

## js/jeuArrets.js

### `arretsParDefaut()` — ligne 15

N'appelle aucune fonction du projet.

Appelée par : `ajouteInvite`, `arretsDefaut`, `caseArret`, `commenceTable`, `corpsArrets`, `recoitDistant`

### `doitDemander()` — ligne 23

N'appelle aucune fonction du projet.

Appelée par : `boucleTable`

## js/forgeValide.js

### `chargement du module`

Appelle : `forgeSait()` *(forgeCouverture.js)*

### `forgeFiltre()` — ligne 42

N'appelle aucune fonction du projet.

Appelée par : `descForge`, `famillesFiltre`, `forgeValideJoueur`, `forgeValideObjet`, `manaPermis`

### `famillesFiltre()` — ligne 59

Appelle : `familleProp()` *(forgeValide.js)*, `forgeFiltre()` *(forgeValide.js)*, `teteConnue()` *(forgeValide.js)*

Appelée par : `elementsTable`

### `sousTypeProbable()` — ligne 79

N'appelle aucune fonction du projet.

Appelée par : `aQualite`, `familleProp`, `teteConnue`

### `familleProp()` — ligne 84

Appelle : `sousTypeProbable()` *(forgeValide.js)*

Appelée par : `famillesFiltre`

### `teteConnue()` — ligne 98

Appelle : `sousTypeProbable()` *(forgeValide.js)*

Appelée par : `famillesFiltre`

### `compareForge()` — ligne 103

N'appelle aucune fonction du projet.

Appelée par : `propObjet`, `seuilForge`

### `aQualite()` — ligne 113

Appelle : `sousTypeProbable()` *(forgeValide.js)*

Appelée par : `propObjet`, `teteObjet`

### `teteObjet()` — ligne 122

Appelle : `aQualite()` *(forgeValide.js)*

Appelée par : `forgeValideObjet`

### `propObjet()` — ligne 132

Appelle : `aQualite()` *(forgeValide.js)*, `choixDe()` *(forgeChoix.js)*, `ciblesJoueurs()` *(forgeValide.js)*, `compareForge()` *(forgeValide.js)*, `defenseurDe()` *(jeuCombat.js)*, `etatCombat()` *(jeuCibles.js)*, `forgeDefinis()` *(forgeDefini.js)*, `forgeNombre()` *(forgeExpr.js)*, `genreMarqueur()` *(forgeValide.js)*, `joueurDe()` *(forgeDefini.js)*, `mvDe()` *(jeuCaracteristiques.js)*, `obj()` *(jeuEtat.js)*, `suit()` *(jeuEtat.js)*

Appelée par : `forgeValideObjet`

### `ciblesJoueurs()` — ligne 237

N'appelle aucune fonction du projet.

Appelée par : `propObjet`

### `forgeValideObjet()` — ligne 243

Appelle : `caracsJugees()` *(jeuCibles.js)*, `forgeFiltre()` *(forgeValide.js)*, `propObjet()` *(forgeValide.js)*, `teteObjet()` *(forgeValide.js)*

Appelée par : `aCopier`, `attaquantsDeclares`, `caracEtendue`, `cibleOuDefinis`, `compteDuTour`, `compteJoueurs`, `conditionForge`, `correspondObjet`, `defenseurVise`, `degagementEmpeche`, `degatsApresPrevention`, `destinationRemplacee`, `exprEtendue`, `forgeChoix.js (chargement)`, `forgeDeclencheurs.js (chargement)`, `forgeDefinis`, `forgeEffetsA.js (chargement)`, `forgeEffetsB.js (chargement)`, `forgeEffetsC.js (chargement)`, `forgeEffetsD.js (chargement)`, `forgeEffetsE.js (chargement)`, `forgeExpression`, `forgeValideDef`, `manaPermis`, `objetOuRien`, `peutBloquer`, `proprieteDefenseur`, `protegeFiltre`, `quantiteRemplacee`, `reductionParCibles`, `reductionPossible`, `sourceCiblante`, `valideOuRien`, `viseForge`

### `forgeValideJoueur()` — ligne 251

Appelle : `choixDe()` *(forgeChoix.js)*, `forgeFiltre()` *(forgeValide.js)*, `obj()` *(jeuEtat.js)*

Appelée par : `defenseurDeclare`, `degatsApresPrevention`, `forgeChoix.js (chargement)`, `forgeDeclencheurs.js (chargement)`, `forgeDeclencheursB.js (chargement)`, `forgeEffetsB.js (chargement)`, `joueurCorrespond`, `joueurOuRien`, `joueurStatique`, `quantiteRemplacee`, `reductionParCibles`, `reductionPossible`, `statiquesJoueur`

### `forgeValideDef()` — ligne 274

Appelle : `forgeValideObjet()` *(forgeValide.js)*

Appelée par : `coutsForge`, `defCorrespond`, `entreeEngageeParAutre`, `flashAccorde`, `forgeDeclencheurs.js (chargement)`, `forgeEffetsE.js (chargement)`, `forgeExpression`, `incontrecarrable`, `manaPermis`, `quantiteRemplacee`, `reductionParCibles`, `sortInterdit`

### `genreMarqueur()` — ligne 281

N'appelle aucune fonction du projet.

Appelée par : `caracEtendue`, `coutForge`, `entreeForge`, `forgeEffetsA.js (chargement)`, `forgeEffetsB.js (chargement)`, `forgeExpression`, `marqueurPose`, `motCleForge`, `propObjet`, `quantiteRemplacee`

### `descForge()` — ligne 289

Appelle : `forgeFiltre()` *(forgeValide.js)*

Appelée par : `capaciteForge`, `coutForge`, `effetForge`, `entreeForge`, `forgeEffetsA.js (chargement)`, `forgeEffetsB.js (chargement)`, `motCleForge`

## js/forgeExpr.js

### `chargement du module`

Appelle : `forgeSait()` *(forgeCouverture.js)*

### `forgeNombre()` — ligne 16

Appelle : `forgeExpression()` *(forgeExpr.js)*

Appelée par : `animeForge`, `conditionForge`, `coutsForge`, `forgeChoix.js (chargement)`, `forgeCopies.js (chargement)`, `forgeEffetsA.js (chargement)`, `forgeEffetsB.js (chargement)`, `forgeEffetsC.js (chargement)`, `forgeEffetsD.js (chargement)`, `forgeEffetsE.js (chargement)`, `forgeExpression`, `forgeStatiques.js (chargement)`, `forgeTraine.js (chargement)`, `metEnJeu`, `pompeForge`, `propObjet`, `quantiteRemplacee`, `reductionParCibles`, `reductionPossible`, `seuilForge`, `siAlors`, `sortInterdit`, `sourcesMana`, `tailleMainMax`, `taxeAttaque`, `terrainsParTour`

### `mathForge()` — ligne 31

N'appelle aucune fonction du projet.

Appelée par : `forgeExpression`

### `objetsZone()` — ligne 41

Appelle : `obj()` *(jeuEtat.js)*

Appelée par : `aCopier`, `cibleOuDefinis`, `compteDuTour`, `compteJoueurs`, `conditionForge`, `forgeChoix.js (chargement)`, `forgeDefinis`, `forgeEffetsA.js (chargement)`, `forgeEffetsB.js (chargement)`, `forgeEffetsC.js (chargement)`, `forgeEffetsD.js (chargement)`, `forgeEffetsE.js (chargement)`, `forgeExpression`

### `caracForge()` — ligne 50

Appelle : `car()` *(jeuCaracteristiques.js)*, `mvDe()` *(jeuCaracteristiques.js)*

Appelée par : `agregeForge`, `caracEtendue`, `exprEtendue`, `forgeExpression`

### `cibleForge()` — ligne 61

Appelle : `passeOuPresent()` *(jeuOpsA.js)*

Appelée par : `forgeExpression`

### `objetEvt()` — ligne 70

Appelle : `obj()` *(jeuEtat.js)*, `suit()` *(jeuEtat.js)*

Appelée par : `exprEtendue`, `forgeDefinis`, `forgeExpression`

### `agregeForge()` — ligne 79

Appelle : `car()` *(jeuCaracteristiques.js)*, `caracForge()` *(forgeExpr.js)*

Appelée par : `exprEtendue`, `forgeExpression`

### `forgeExpression()` — ligne 94

Appelle : `adversaires()` *(jeuEtat.js)*, `agregeForge()` *(forgeExpr.js)*, `car()` *(jeuCaracteristiques.js)*, `caracForge()` *(forgeExpr.js)*, `champDe()` *(jeuEtat.js)*, `choixDe()` *(forgeChoix.js)*, `cibleForge()` *(forgeExpr.js)*, `estType()` *(jeuCaracteristiques.js)*, `exprEtendue()` *(forgeExprB.js)*, `forgeNombre()` *(forgeExpr.js)*, `forgeValideDef()` *(forgeValide.js)*, `forgeValideObjet()` *(forgeValide.js)*, `genreMarqueur()` *(forgeValide.js)*, `mathForge()` *(forgeExpr.js)*, `objetEvt()` *(forgeExpr.js)*, `objetsZone()` *(forgeExpr.js)*, `passeOuPresent()` *(jeuOpsA.js)*, `seuilForge()` *(forgeEffetsA.js)*

Appelée par : `forgeNombre`

## js/forgeExprB.js

### `chargement du module`

Appelle : `forgeSait()` *(forgeCouverture.js)*

### `caracEtendue()` — ligne 13

Appelle : `caracForge()` *(forgeExpr.js)*, `forgeValideObjet()` *(forgeValide.js)*, `genreMarqueur()` *(forgeValide.js)*, `mvDe()` *(jeuCaracteristiques.js)*

Appelée par : `exprEtendue`

### `quantiteJoueur()` — ligne 23

N'appelle aucune fonction du projet.

Appelée par : `exprEtendue`

### `exprEtendue()` — ligne 29

Appelle : `agregeForge()` *(forgeExpr.js)*, `caracEtendue()` *(forgeExprB.js)*, `caracForge()` *(forgeExpr.js)*, `compteDuTour()` *(forgeExprB.js)*, `compteJoueurs()` *(forgeExprB.js)*, `forgeDefinis()` *(forgeDefini.js)*, `forgeValideObjet()` *(forgeValide.js)*, `histoire()` *(jeuHistorique.js)*, `manaDepenseDe()` *(jeuHistorique.js)*, `objetEvt()` *(forgeExpr.js)*, `passeOuPresent()` *(jeuOpsA.js)*, `quantiteJoueur()` *(forgeExprB.js)*

Appelée par : `forgeExpression`

### `devotion()` — ligne 67

Appelle : `champDe()` *(jeuEtat.js)*

Appelée par : `compteDuTour`

### `siAlors()` — ligne 77

Appelle : `forgeNombre()` *(forgeExpr.js)*

Appelée par : `compteDuTour`

### `compteDuTour()` — ligne 79

Appelle : `adversaires()` *(jeuEtat.js)*, `car()` *(jeuCaracteristiques.js)*, `champDe()` *(jeuEtat.js)*, `devotion()` *(forgeExprB.js)*, `estCreature()` *(jeuCaracteristiques.js)*, `forgeValideObjet()` *(forgeValide.js)*, `histoire()` *(jeuHistorique.js)*, `manaDepenseDe()` *(jeuHistorique.js)*, `obj()` *(jeuEtat.js)*, `objetsZone()` *(forgeExpr.js)*, `siAlors()` *(forgeExprB.js)*

Appelée par : `exprEtendue`

### `compteJoueurs()` — ligne 108

Appelle : `adversaires()` *(jeuEtat.js)*, `forgeValideObjet()` *(forgeValide.js)*, `objetsZone()` *(forgeExpr.js)*, `vivants()` *(jeuEtat.js)*

Appelée par : `exprEtendue`

## js/forgeDefini.js

### `chargement du module`

Appelle : `forgeSait()` *(forgeCouverture.js)*

### `ciblesForge()` — ligne 27

Appelle : `obj()` *(jeuEtat.js)*, `suit()` *(jeuEtat.js)*

Appelée par : `cibleOuDefinis`, `executeForge`, `forgeDefinis`, `forgeEffetsB.js (chargement)`, `forgeEffetsC.js (chargement)`, `forgeEffetsD.js (chargement)`, `joueursForge`, `objetsForge`

### `joueurDe()` — ligne 35

N'appelle aucune fonction du projet.

Appelée par : `executeForge`, `forgeCopies.js (chargement)`, `forgeDefinis`, `forgeEffetsA.js (chargement)`, `forgeEffetsB.js (chargement)`, `forgeEffetsC.js (chargement)`, `forgeEffetsE.js (chargement)`, `joueursForge`, `paieUnlessForge`, `propObjet`

### `uniquesJ()` — ligne 37

N'appelle aucune fonction du projet.

Appelée par : `forgeDefinis`

### `forgeDefinis()` — ligne 43

Appelle : `adversaires()` *(jeuEtat.js)*, `choixDe()` *(forgeChoix.js)*, `ciblesDuSort()` *(forgeDeclencheurs.js)*, `ciblesForge()` *(forgeDefini.js)*, `defenseurDe()` *(jeuCombat.js)*, `forgeValideObjet()` *(forgeValide.js)*, `joueurDe()` *(forgeDefini.js)*, `obj()` *(jeuEtat.js)*, `objetEvt()` *(forgeExpr.js)*, `objetsZone()` *(forgeExpr.js)*, `passeOuPresent()` *(jeuOpsA.js)*, `suit()` *(jeuEtat.js)*, `uniquesJ()` *(forgeDefini.js)*, `vivants()` *(jeuEtat.js)*

Appelée par : `cibleOuDefinis`, `conditionForge`, `executeForge`, `exprEtendue`, `forgeCopies.js (chargement)`, `forgeEffetsA.js (chargement)`, `forgeEffetsB.js (chargement)`, `forgeEffetsC.js (chargement)`, `forgeEffetsD.js (chargement)`, `forgeEffetsE.js (chargement)`, `joueursForge`, `objetsForge`, `paieUnlessForge`, `propObjet`, `sourceDegats`, `viseForge`

### `joueursForge()` — ligne 131

Appelle : `ciblesForge()` *(forgeDefini.js)*, `forgeDefinis()` *(forgeDefini.js)*, `joueurDe()` *(forgeDefini.js)*

Appelée par : `forgeChoix.js (chargement)`, `forgeEffetsA.js (chargement)`, `forgeEffetsB.js (chargement)`, `forgeEffetsE.js (chargement)`

### `objetsForge()` — ligne 141

Appelle : `ciblesForge()` *(forgeDefini.js)*, `forgeDefinis()` *(forgeDefini.js)*

Appelée par : `aCopier`, `forgeCopies.js (chargement)`, `forgeEffetsA.js (chargement)`, `forgeEffetsB.js (chargement)`, `forgeEffetsC.js (chargement)`, `forgeEffetsD.js (chargement)`, `forgeEffetsE.js (chargement)`, `forgeTraine.js (chargement)`

## js/forgeCout.js

### `chargement du module`

Appelle : `forgeSait()` *(forgeCouverture.js)*

### `manaForge()` — ligne 13

Appelle : `coutMana()` *(oracleCouts.js)*, `coutManaVide()` *(oracleCouts.js)*

Appelée par : `coutForge`

### `estManaForge()` — ligne 18

N'appelle aucune fonction du projet.

Appelée par : `coutForge`

### `coutForge()` — ligne 22

Appelle : `coutManaVide()` *(oracleCouts.js)*, `descForge()` *(forgeValide.js)*, `estManaForge()` *(forgeCout.js)*, `genreMarqueur()` *(forgeValide.js)*, `manaForge()` *(forgeCout.js)*

Appelée par : `capaciteForge`, `cycleForge`, `effetForge`, `executeForge`, `forgeChoix.js (chargement)`, `manaSeul`, `motCleForge`, `paieUnlessForge`

## js/forgeEffetsA.js

### `chargement du module`

Appelle : `champDe()` *(jeuEtat.js)*, `choisitCartes()` *(jeuOpsA.js)*, `dansOrigine()` *(forgeEffetsA.js)*, `defausseCarte()` *(jeuDurees.js)*, `deplace()` *(jeuEtat.js)*, `deplaceForge()` *(forgeEffetsA.js)*, `descForge()` *(forgeValide.js)*, `durees()` *(jeuDurees.js)*, `estType()` *(jeuCaracteristiques.js)*, `forgeDefinis()` *(forgeDefini.js)*, `forgeEffet()` *(forgeEffetsA.js)*, `forgeNombre()` *(forgeExpr.js)*, `forgeSait()` *(forgeCouverture.js)*, `forgeValideObjet()` *(forgeValide.js)*, `genreMarqueur()` *(forgeValide.js)*, `joueurDe()` *(forgeDefini.js)*, `joueursForge()` *(forgeDefini.js)*, `melangeHasard()` *(jeuHasard.js)*, `nombreIA()` *(forgeEffetsA.js)*, `obj()` *(jeuEtat.js)*, `objetsForge()` *(forgeDefini.js)*, `objetsZone()` *(forgeExpr.js)*, `piocheN()` *(jeuEtat.js)*, `quiIA()` *(forgeEffetsA.js)*, `retiensForge()` *(forgeEffetsA.js)*, `zoneForge()` *(forgeEffetsA.js)*, → `executeForge()` *(forgeEffetsA.js)*

### `forgeEffet()` — ligne 26

Appelle : `forgeSait()` *(forgeCouverture.js)*

Appelée par : `forgeChoix.js (chargement)`, `forgeCopies.js (chargement)`, `forgeEffetsA.js (chargement)`, `forgeEffetsB.js (chargement)`, `forgeEffetsC.js (chargement)`, `forgeEffetsD.js (chargement)`, `forgeEffetsE.js (chargement)`, `forgeTraine.js (chargement)`

### `seuilForge()` — ligne 33

Appelle : `compareForge()` *(forgeValide.js)*, `forgeNombre()` *(forgeExpr.js)*

Appelée par : `attaquantsDeclares`, `conditionForge`, `forgeDeclencheurs.js (chargement)`, `forgeExpression`, `marqueurPose`

### `conditionForge()` — ligne 50

Appelle : `forgeDefinis()` *(forgeDefini.js)*, `forgeNombre()` *(forgeExpr.js)*, `forgeValideObjet()` *(forgeValide.js)*, `objetsZone()` *(forgeExpr.js)*, `seuilForge()` *(forgeEffetsA.js)*

Appelée par : `bornesBlocage`, `coutsForge`, `declenchementsEnPlus`, `declencheursEtat`, `executeForge`, `forgeDeclenche`, `forgeStatiques.js (chargement)`, `metEnJeu`, `reductionParCibles`, `statiqueQui`, `statiquesJoueur`, `taxeAttaque`, `viseForge`

### `paieUnlessForge()` — ligne 73

Appelle : `autresCout()` *(jeuVariantes.js)*, `coutAutrePossible()` *(jeuLancer.js)*, `coutForge()` *(forgeCout.js)*, `forgeDefinis()` *(forgeDefini.js)*, `joueurDe()` *(forgeDefini.js)*, `paieAutre()` *(jeuActions.js)*, `paieMana()` *(jeuMana.js)*, `planPaiement()` *(jeuMana.js)*, `question()` *(jeuEtat.js)*

Appelée par : `executeForge`

### `memoireForge()` — ligne 91

N'appelle aucune fonction du projet.

Appelée par : `executeForge`

### `retiensForge()` — ligne 98

N'appelle aucune fonction du projet.

Appelée par : `creeJetonsForge`, `executeForge`, `forgeChoix.js (chargement)`, `forgeCopies.js (chargement)`, `forgeEffetsA.js (chargement)`, `forgeEffetsB.js (chargement)`, `forgeEffetsE.js (chargement)`

### `executeForge()` — ligne 105

Appelle : `autresCout()` *(jeuVariantes.js)*, `cibleOuDefinis()` *(forgeEffetsA.js)*, `ciblesForge()` *(forgeDefini.js)*, `conditionForge()` *(forgeEffetsA.js)*, `coutAutrePossible()` *(jeuLancer.js)*, `coutForge()` *(forgeCout.js)*, `forgeDefinis()` *(forgeDefini.js)*, `joueurDe()` *(forgeDefini.js)*, `memoireForge()` *(forgeEffetsA.js)*, `obj()` *(jeuEtat.js)*, `paieAutre()` *(jeuActions.js)*, `paieMana()` *(jeuMana.js)*, `paieUnlessForge()` *(forgeEffetsA.js)*, `planPaiement()` *(jeuMana.js)*, `question()` *(jeuEtat.js)*, `retiensForge()` *(forgeEffetsA.js)*, `sourceCtx()` *(jeuOpsA.js)*

Appelée par : `executeOps`, `forgeEffetsA.js (chargement)`

### `cibleOuDefinis()` — ligne 156

Appelle : `ciblesForge()` *(forgeDefini.js)*, `forgeDefinis()` *(forgeDefini.js)*, `forgeValideObjet()` *(forgeValide.js)*, `objetsZone()` *(forgeExpr.js)*

Appelée par : `executeForge`

### `zoneForge()` — ligne 163

N'appelle aucune fonction du projet.

Appelée par : `destinationRemplacee`, `forgeEffetsA.js (chargement)`, `forgeEffetsB.js (chargement)`, `forgeEffetsE.js (chargement)`, `formeRemplacement`

### `deplaceForge()` — ligne 171

Appelle : `deplace()` *(jeuEtat.js)*, `metEnJeu()` *(jeuOpsB.js)*, `retireDeLaPile()` *(jeuPile.js)*

Appelée par : `forgeEffetsA.js (chargement)`, `forgeEffetsB.js (chargement)`, `forgeEffetsE.js (chargement)`

### `dansOrigine()` — ligne 184

N'appelle aucune fonction du projet.

Appelée par : `forgeEffetsA.js (chargement)`

### `nombreIA()` — ligne 277

N'appelle aucune fonction du projet.

Appelée par : `forgeEffetsA.js (chargement)`, `forgeEffetsB.js (chargement)`

### `quiIA()` — ligne 280

N'appelle aucune fonction du projet.

Appelée par : `forgeEffetsA.js (chargement)`, `forgeEffetsB.js (chargement)`

## js/forgeEffetsB.js

### `chargement du module`

Appelle : `car()` *(jeuCaracteristiques.js)*, `champDe()` *(jeuEtat.js)*, `choisitCartes()` *(jeuOpsA.js)*, `ciblesForge()` *(forgeDefini.js)*, `creeJetonsForge()` *(forgeEffetsB.js)*, `deplace()` *(jeuEtat.js)*, `deplaceForge()` *(forgeEffetsA.js)*, `descForge()` *(forgeValide.js)*, `detruitForge()` *(forgeEffetsB.js)*, `emet()` *(jeuEtat.js)*, `forgeDefinis()` *(forgeDefini.js)*, `forgeEffet()` *(forgeEffetsA.js)*, `forgeNombre()` *(forgeExpr.js)*, `forgeValideJoueur()` *(forgeValide.js)*, `forgeValideObjet()` *(forgeValide.js)*, `gagneVie()` *(jeuOpsA.js)*, `genreMarqueur()` *(forgeValide.js)*, `incontrecarrable()` *(forgeRemplacements.js)*, `infligeDegats()` *(jeuOpsA.js)*, `instantane()` *(jeuEtat.js)*, `jn()` *(jeuEtat.js)*, `joueurDe()` *(forgeDefini.js)*, `joueursForge()` *(forgeDefini.js)*, `nombreIA()` *(forgeEffetsA.js)*, `obj()` *(jeuEtat.js)*, `objetsForge()` *(forgeDefini.js)*, `objetsZone()` *(forgeExpr.js)*, `poseMarqueurs()` *(jeuGestes.js)*, `quiIA()` *(forgeEffetsA.js)*, `regardeForge()` *(forgeEffetsB.js)*, `retiensForge()` *(forgeEffetsA.js)*, `retireDe()` *(jeuEtat.js)*, `retireDeLaPile()` *(jeuPile.js)*, `sacrifie()` *(jeuOpsA.js)*, `sourceDegats()` *(forgeEffetsB.js)*, `vivants()` *(jeuEtat.js)*, `zoneForge()` *(forgeEffetsA.js)*

### `regardeForge()` — ligne 36

Appelle : `choisitCartes()` *(jeuOpsA.js)*, `deplace()` *(jeuEtat.js)*, `retireDe()` *(jeuEtat.js)*

Appelée par : `forgeEffetsB.js (chargement)`

### `sourceDegats()` — ligne 52

Appelle : `forgeDefinis()` *(forgeDefini.js)*

Appelée par : `forgeEffetsB.js (chargement)`

### `detruitForge()` — ligne 96

Appelle : `aMot()` *(jeuCaracteristiques.js)*, `detruitObjet()` *(jeuDurees.js)*, `jn()` *(jeuEtat.js)*

Appelée par : `forgeEffetsB.js (chargement)`

### `creeJetonsForge()` — ligne 143

Appelle : `creeObjet()` *(jeuEtat.js)*, `emet()` *(jeuEtat.js)*, `jn()` *(jeuEtat.js)*, `noteEntree()` *(jeuEtat.js)*, `nouvelleCarte()` *(jeuEtat.js)*, `quantiteRemplacee()` *(forgeRemplacements.js)*, `retiensForge()` *(forgeEffetsA.js)*

Appelée par : `forgeEffetsB.js (chargement)`, `forgeEffetsC.js (chargement)`

## js/forgeEffetsC.js

### `chargement du module`

Appelle : `ajouteMana()` *(jeuMana.js)*, `bonusIA()` *(forgeEffetsC.js)*, `car()` *(jeuCaracteristiques.js)*, `choisitUn()` *(forgeChoix.js)*, `ciblesForge()` *(forgeDefini.js)*, `creeJetonsForge()` *(forgeEffetsB.js)*, `degageObjet()` *(jeuGestes.js)*, `effetForge()` *(forgeDefinition.js)*, `engageObjet()` *(jeuGestes.js)*, `estCreature()` *(jeuCaracteristiques.js)*, `forgeDefinis()` *(forgeDefini.js)*, `forgeEffet()` *(forgeEffetsA.js)*, `forgeNombre()` *(forgeExpr.js)*, `forgeSousCapacite()` *(forgeScript.js)*, `forgeValideObjet()` *(forgeValide.js)*, `infligeDegats()` *(jeuOpsA.js)*, `joueurDe()` *(forgeDefini.js)*, `motsForge()` *(forgeEffetsC.js)*, `obj()` *(jeuEtat.js)*, `objetsForge()` *(forgeDefini.js)*, `objetsZone()` *(forgeExpr.js)*, `optionsMana()` *(forgeEffetsC.js)*, `pompeForge()` *(forgeEffetsC.js)*

### `motsForge()` — ligne 12

N'appelle aucune fonction du projet.

Appelée par : `animeForge`, `defCopie`, `forgeEffetsC.js (chargement)`, `forgeStatiques.js (chargement)`, `pompeForge`

### `bonusIA()` — ligne 17

N'appelle aucune fonction du projet.

Appelée par : `forgeEffetsC.js (chargement)`

### `pompeForge()` — ligne 20

Appelle : `forgeNombre()` *(forgeExpr.js)*, `motsForge()` *(forgeEffetsC.js)*

Appelée par : `forgeEffetsC.js (chargement)`

### `optionsMana()` — ligne 56

N'appelle aucune fonction du projet.

Appelée par : `capaciteForge`, `forgeEffetsC.js (chargement)`

## js/forgeEffetsD.js

### `chargement du module`

Appelle : `animeForge()` *(forgeEffetsD.js)*, `ciblesForge()` *(forgeDefini.js)*, `declencheurForge()` *(forgeDefinition.js)*, `durees()` *(jeuDurees.js)*, `effetForge()` *(forgeDefinition.js)*, `forgeDefinis()` *(forgeDefini.js)*, `forgeEffet()` *(forgeEffetsA.js)*, `forgeNombre()` *(forgeExpr.js)*, `forgeSait()` *(forgeCouverture.js)*, `forgeSousCapacite()` *(forgeScript.js)*, `forgeTable()` *(forgeScript.js)*, `forgeValideObjet()` *(forgeValide.js)*, `formeRemplacement()` *(forgeRemplacements.js)*, `objetsForge()` *(forgeDefini.js)*, `objetsZone()` *(forgeExpr.js)*, `phaseConnue()` *(forgeDeclencheurs.js)*, `poseEffet()` *(jeuDurees.js)*, `regenere()` *(forgeEffetsD.js)*, `retourneFace()` *(jeuFaces.js)*, `statiqueForge()` *(forgeEffetsD.js)*, `texteForge()` *(forgeDefinition.js)*, `transforme()` *(jeuFaces.js)*, → `animationTenable()` *(forgeEffetsD.js)*

### `statiqueForge()` — ligne 16

Appelle : `capaciteForge()` *(forgeDefinition.js)*, `declencheurForge()` *(forgeDefinition.js)*, `forgeSousCapacite()` *(forgeScript.js)*, `forgeTable()` *(forgeScript.js)*, `statiqueTenable()` *(forgeStatiques.js)*

Appelée par : `definitionDepuisScript`, `forgeEffetsD.js (chargement)`

### `capacitesAccordees()` — ligne 34

Appelle : `statiquesEnJeu()` *(jeuCaracteristiques.js)*, `viseForge()` *(forgeStatiques.js)*

Appelée par : `capacitesDe`

### `regenere()` — ligne 46

N'appelle aucune fonction du projet.

Appelée par : `forgeEffetsD.js (chargement)`

### `animeForge()` — ligne 111

Appelle : `couleursMots()` *(forgeStatiques.js)*, `forgeNombre()` *(forgeExpr.js)*, `motsForge()` *(forgeEffetsC.js)*, `typesForge()` *(forgeStatiques.js)*

Appelée par : `forgeEffetsD.js (chargement)`

### `animationTenable()` — ligne 120

Appelle : `couleursMots()` *(forgeStatiques.js)*

Appelée par : `forgeEffetsD.js (chargement)`

## js/forgeEffetsE.js

### `chargement du module`

Appelle : `choisitCartes()` *(jeuOpsA.js)*, `choisitUn()` *(forgeChoix.js)*, `deplace()` *(jeuEtat.js)*, `deplaceForge()` *(forgeEffetsA.js)*, `estType()` *(jeuCaracteristiques.js)*, `forgeDefinis()` *(forgeDefini.js)*, `forgeEffet()` *(forgeEffetsA.js)*, `forgeNombre()` *(forgeExpr.js)*, `forgeValideDef()` *(forgeValide.js)*, `forgeValideObjet()` *(forgeValide.js)*, `jn()` *(jeuEtat.js)*, `joueurDe()` *(forgeDefini.js)*, `joueursForge()` *(forgeDefini.js)*, `lanceDepuisEffet()` *(forgeEffetsE.js)*, `melangeHasard()` *(jeuHasard.js)*, `mvDe()` *(jeuCaracteristiques.js)*, `obj()` *(jeuEtat.js)*, `objetsForge()` *(forgeDefini.js)*, `objetsZone()` *(forgeExpr.js)*, `retiensForge()` *(forgeEffetsA.js)*, `retireDe()` *(jeuEtat.js)*, `zoneForge()` *(forgeEffetsA.js)*

### `lanceDepuisEffet()` — ligne 86

Appelle : `estType()` *(jeuCaracteristiques.js)*, `joueTerrain()` *(jeuActions.js)*, `lanceSort()` *(jeuActions.js)*, `obj()` *(jeuEtat.js)*, `terrainsParTour()` *(forgeInterdits.js)*

Appelée par : `forgeEffetsE.js (chargement)`

## js/forgeChoix.js

### `chargement du module`

Appelle : `adversaires()` *(jeuEtat.js)*, `autresCout()` *(jeuVariantes.js)*, `choisitCartes()` *(jeuOpsA.js)*, `choisitUn()` *(forgeChoix.js)*, `choixDe()` *(forgeChoix.js)*, `couleursFrequentes()` *(forgeChoix.js)*, `coutAutrePossible()` *(jeuLancer.js)*, `coutForge()` *(forgeCout.js)*, `effetForge()` *(forgeDefinition.js)*, `executeOps()` *(jeuOpsB.js)*, `forgeEffet()` *(forgeEffetsA.js)*, `forgeNombre()` *(forgeExpr.js)*, `forgeSousCapacite()` *(forgeScript.js)*, `forgeValideJoueur()` *(forgeValide.js)*, `forgeValideObjet()` *(forgeValide.js)*, `joueursForge()` *(forgeDefini.js)*, `objetsZone()` *(forgeExpr.js)*, `planPaiement()` *(jeuMana.js)*, `retiensForge()` *(forgeEffetsA.js)*, `scoreEffet()` *(iaPriorite.js)*, `texteForge()` *(forgeDefinition.js)*, `typesFrequents()` *(forgeChoix.js)*, `vivants()` *(jeuEtat.js)*

### `choixDe()` — ligne 15

N'appelle aucune fonction du projet.

Appelée par : `forgeChoix.js (chargement)`, `forgeDefinis`, `forgeExpression`, `forgeStatiques.js (chargement)`, `forgeValideJoueur`, `propObjet`, `sourcesMana`, `typesCouche`

### `choisitUn()` — ligne 21

Appelle : `question()` *(jeuEtat.js)*

Appelée par : `forgeChoix.js (chargement)`, `forgeEffetsC.js (chargement)`, `forgeEffetsE.js (chargement)`

### `couleursFrequentes()` — ligne 31

N'appelle aucune fonction du projet.

Appelée par : `forgeChoix.js (chargement)`

### `typesFrequents()` — ligne 38

N'appelle aucune fonction du projet.

Appelée par : `forgeChoix.js (chargement)`

### `entreeForgeMotCle()` — ligne 128

Appelle : `effetForge()` *(forgeDefinition.js)*, `forgeSousCapacite()` *(forgeScript.js)*

Appelée par : `motCleForge`

### `effetsEntree()` — ligne 139

Appelle : `executeOps()` *(jeuOpsB.js)*, `question()` *(jeuEtat.js)*

Appelée par : `metEnJeu`

## js/forgeCopies.js

### `chargement du module`

Appelle : `aCopier()` *(forgeCopies.js)*, `copieSort()` *(forgeCopies.js)*, `creeObjet()` *(jeuEtat.js)*, `defCopie()` *(forgeCopies.js)*, `emet()` *(jeuEtat.js)*, `forgeDefinis()` *(forgeDefini.js)*, `forgeEffet()` *(forgeEffetsA.js)*, `forgeNombre()` *(forgeExpr.js)*, `jn()` *(jeuEtat.js)*, `joueurDe()` *(forgeDefini.js)*, `noteEntree()` *(jeuEtat.js)*, `nouvelleCarte()` *(jeuEtat.js)*, `objetsForge()` *(forgeDefini.js)*, `retiensForge()` *(forgeEffetsA.js)*

### `defCopie()` — ligne 12

Appelle : `motsForge()` *(forgeEffetsC.js)*, `typesForge()` *(forgeStatiques.js)*

Appelée par : `forgeCopies.js (chargement)`

### `aCopier()` — ligne 24

Appelle : `choisitCartes()` *(jeuOpsA.js)*, `forgeValideObjet()` *(forgeValide.js)*, `obj()` *(jeuEtat.js)*, `objetsForge()` *(forgeDefini.js)*, `objetsZone()` *(forgeExpr.js)*

Appelée par : `forgeCopies.js (chargement)`

### `copieSort()` — ligne 80

Appelle : `instantane()` *(jeuEtat.js)*, `jn()` *(jeuEtat.js)*, `prepareEffets()` *(jeuLancer.js)*

Appelée par : `forgeCopies.js (chargement)`, `forgeTraine.js (chargement)`

### `copiesFin()` — ligne 93

Appelle : `deplace()` *(jeuEtat.js)*, `obj()` *(jeuEtat.js)*, `sacrifie()` *(jeuOpsA.js)*

Appelée par : `etape`

## js/forgeTraine.js

### `chargement du module`

Appelle : `choisitCartes()` *(jeuOpsA.js)*, `copieSort()` *(forgeCopies.js)*, `defausseCarte()` *(jeuDurees.js)*, `deplace()` *(jeuEtat.js)*, `estType()` *(jeuCaracteristiques.js)*, `forgeEffet()` *(forgeEffetsA.js)*, `forgeNombre()` *(forgeExpr.js)*, `forgeSait()` *(forgeCouverture.js)*, `lanceSort()` *(jeuActions.js)*, `melangeHasard()` *(jeuHasard.js)*, `mvDe()` *(jeuCaracteristiques.js)*, `obj()` *(jeuEtat.js)*, `objetsForge()` *(forgeDefini.js)*, `piocheN()` *(jeuEtat.js)*, `poseMarqueurs()` *(jeuGestes.js)*, `question()` *(jeuEtat.js)*, `sourceCtx()` *(jeuOpsA.js)*

### `declencheurSynthetique()` — ligne 13

Appelle : `declencheurForge()` *(forgeDefinition.js)*

Appelée par : `motCleTraine`

### `motCleTraine()` — ligne 19

Appelle : `declencheurSynthetique()` *(forgeTraine.js)*

Appelée par : `motCleForge`

## js/forgeDeclencheurs.js

### `chargement du module`

Appelle : `ciblesDuSort()` *(forgeDeclencheurs.js)*, `forgeMode()` *(forgeDeclencheurs.js)*, `forgeSait()` *(forgeCouverture.js)*, `forgeValideDef()` *(forgeValide.js)*, `forgeValideJoueur()` *(forgeValide.js)*, `forgeValideObjet()` *(forgeValide.js)*, `joueurDeCarte()` *(forgeDeclencheurs.js)*, `joueurOuRien()` *(forgeDeclencheurs.js)*, `obj()` *(jeuEtat.js)*, `objetZone()` *(forgeDeclencheurs.js)*, `passeOuPresent()` *(jeuOpsA.js)*, `seuilForge()` *(forgeEffetsA.js)*, `valideOuRien()` *(forgeDeclencheurs.js)*

### `dansPhases()` — ligne 19

N'appelle aucune fonction du projet.

Appelée par : `actionsLegales`

### `phaseConnue()` — ligne 29

N'appelle aucune fonction du projet.

Appelée par : `declencheurForge`, `forgeEffetsD.js (chargement)`

### `forgeMode()` — ligne 33

Appelle : `forgeSait()` *(forgeCouverture.js)*

Appelée par : `forgeDeclencheurs.js (chargement)`, `forgeDeclencheursB.js (chargement)`

### `objetZone()` — ligne 41

Appelle : `obj()` *(jeuEtat.js)*

Appelée par : `forgeDeclencheurs.js (chargement)`, `mouvementEvt`

### `valideOuRien()` — ligne 46

Appelle : `forgeValideObjet()` *(forgeValide.js)*

Appelée par : `defenseurDeclare`, `forgeDeclencheurs.js (chargement)`, `forgeDeclencheursB.js (chargement)`, `marqueurPose`

### `joueurOuRien()` — ligne 47

Appelle : `forgeValideJoueur()` *(forgeValide.js)*

Appelée par : `attaquantsDeclares`, `forgeDeclencheurs.js (chargement)`, `forgeDeclencheursB.js (chargement)`

### `joueurDeCarte()` — ligne 51

N'appelle aucune fonction du projet.

Appelée par : `forgeDeclencheurs.js (chargement)`, `forgeDeclencheursB.js (chargement)`

### `ciblesDuSort()` — ligne 89

Appelle : `obj()` *(jeuEtat.js)*

Appelée par : `forgeDeclencheurs.js (chargement)`, `forgeDefinis`

### `forgeDeclenche()` — ligne 120

Appelle : `conditionForge()` *(forgeEffetsA.js)*

Appelée par : `collecteRetardes`, `ecouteRepond`

## js/forgeDeclencheursB.js

### `chargement du module`

Appelle : `capaciteActivee()` *(forgeDeclencheursB.js)*, `forgeMode()` *(forgeDeclencheurs.js)*, `forgeSait()` *(forgeCouverture.js)*, `forgeValideJoueur()` *(forgeValide.js)*, `joueurDeCarte()` *(forgeDeclencheurs.js)*, `joueurOuRien()` *(forgeDeclencheurs.js)*, `obj()` *(jeuEtat.js)*, `sourceCiblante()` *(forgeDeclencheursB.js)*, `valideOuRien()` *(forgeDeclencheurs.js)*, → `attaquantsDeclares()` *(forgeDeclencheursB.js)*, → `marqueurPose()` *(forgeDeclencheursB.js)*

### `defenseurDeclare()` — ligne 18

Appelle : `forgeValideJoueur()` *(forgeValide.js)*, `obj()` *(jeuEtat.js)*, `valideOuRien()` *(forgeDeclencheurs.js)*

Appelée par : `attaquantsDeclares`

### `attaquantsDeclares()` — ligne 26

Appelle : `defenseurDeclare()` *(forgeDeclencheursB.js)*, `forgeValideObjet()` *(forgeValide.js)*, `joueurOuRien()` *(forgeDeclencheurs.js)*, `obj()` *(jeuEtat.js)*, `seuilForge()` *(forgeEffetsA.js)*

Appelée par : `forgeDeclencheursB.js (chargement)`

### `sourceCiblante()` — ligne 48

Appelle : `forgeValideObjet()` *(forgeValide.js)*, `obj()` *(jeuEtat.js)*

Appelée par : `forgeDeclencheursB.js (chargement)`

### `capaciteActivee()` — ligne 73

N'appelle aucune fonction du projet.

Appelée par : `forgeDeclencheursB.js (chargement)`

### `marqueurPose()` — ligne 87

Appelle : `genreMarqueur()` *(forgeValide.js)*, `obj()` *(jeuEtat.js)*, `seuilForge()` *(forgeEffetsA.js)*, `valideOuRien()` *(forgeDeclencheurs.js)*

Appelée par : `forgeDeclencheursB.js (chargement)`

### `declencheursEtat()` — ligne 109

Appelle : `capacitesDe()` *(jeuDurees.js)*, `conditionForge()` *(forgeEffetsA.js)*, `obj()` *(jeuEtat.js)*

Appelée par : `collecteDeclencheurs`

## js/forgeStatiques.js

### `chargement du module`

Appelle : `choixDe()` *(forgeChoix.js)*, `conditionForge()` *(forgeEffetsA.js)*, `couleursMots()` *(forgeStatiques.js)*, `envStatique()` *(forgeStatiques.js)*, `forgeNombre()` *(forgeExpr.js)*, `forgeSait()` *(forgeCouverture.js)*, `forgeStatique()` *(forgeStatiques.js)*, `motsForge()` *(forgeEffetsC.js)*, `typesForge()` *(forgeStatiques.js)*, `viseForge()` *(forgeStatiques.js)*

### `typesForge()` — ligne 19

N'appelle aucune fonction du projet.

Appelée par : `animeForge`, `defCopie`, `forgeStatiques.js (chargement)`, `typesCouche`

### `couleursMots()` — ligne 29

N'appelle aucune fonction du projet.

Appelée par : `animationTenable`, `animeForge`, `forgeStatiques.js (chargement)`, `statiqueTenable`

### `statiqueTenable()` — ligne 36

Appelle : `couleursMots()` *(forgeStatiques.js)*

Appelée par : `statiqueForge`

### `forgeStatique()` — ligne 66

Appelle : `forgeSait()` *(forgeCouverture.js)*

Appelée par : `forgeInterdits.js (chargement)`, `forgeStatiques.js (chargement)`

### `envStatique()` — ligne 73

N'appelle aucune fonction du projet.

Appelée par : `bornesBlocage`, `coutsForge`, `declenchementsEnPlus`, `flashPossible`, `forgeStatiques.js (chargement)`, `reductionParCibles`, `reductionPossible`, `statiqueQui`, `statiquesJoueur`, `tailleMainMax`, `taxeAttaque`, `terrainsParTour`, `viseForge`

### `viseForge()` — ligne 78

Appelle : `conditionForge()` *(forgeEffetsA.js)*, `envStatique()` *(forgeStatiques.js)*, `forgeDefinis()` *(forgeDefini.js)*, `forgeValideObjet()` *(forgeValide.js)*

Appelée par : `capacitesAccordees`, `couchesStatiques`, `forgeStatiques.js (chargement)`, `permisDeJouer`

### `statiquesForgeSur()` — ligne 133

Appelle : `statiquesEnJeu()` *(jeuCaracteristiques.js)*

Appelée par : `car`

### `coutsForge()` — ligne 148

Appelle : `conditionForge()` *(forgeEffetsA.js)*, `envStatique()` *(forgeStatiques.js)*, `forgeNombre()` *(forgeExpr.js)*, `forgeValideDef()` *(forgeValide.js)*, `statiquesEnJeu()` *(jeuCaracteristiques.js)*

Appelée par : `coutSort`

### `reductionParCibles()` — ligne 171

Appelle : `conditionForge()` *(forgeEffetsA.js)*, `envStatique()` *(forgeStatiques.js)*, `forgeNombre()` *(forgeExpr.js)*, `forgeValideDef()` *(forgeValide.js)*, `forgeValideJoueur()` *(forgeValide.js)*, `forgeValideObjet()` *(forgeValide.js)*, `obj()` *(jeuEtat.js)*, `statiquesEnJeu()` *(jeuCaracteristiques.js)*

Appelée par : `lanceSort`

### `reductionPossible()` — ligne 190

Appelle : `envStatique()` *(forgeStatiques.js)*, `forgeNombre()` *(forgeExpr.js)*, `forgeValideJoueur()` *(forgeValide.js)*, `forgeValideObjet()` *(forgeValide.js)*, `obj()` *(jeuEtat.js)*

Appelée par : `payableAvec`

## js/forgeInterdits.js

### `chargement du module`

Appelle : `forgeSait()` *(forgeCouverture.js)*, `forgeStatique()` *(forgeStatiques.js)*

### `statiquesMode()` — ligne 18

Appelle : `statiquesEnJeu()` *(jeuCaracteristiques.js)*

Appelée par : `activationInterdite`, `bornesBlocage`, `cibleInterdite`, `declenchementsEnPlus`, `flashPossible`, `statiqueQui`, `statiquesCouches`, `statiquesJoueur`, `taxeAttaque`

### `statiqueQui()` — ligne 31

Appelle : `conditionForge()` *(forgeEffetsA.js)*, `envStatique()` *(forgeStatiques.js)*, `statiquesMode()` *(forgeInterdits.js)*

Appelée par : `activationInterdite`, `attaquePermise`, `cibleInterdite`, `defenseurAttaque`, `degatsParEndurance`, `doitAttaquer`, `doitBloquer`, `flashAccorde`, `preventionInterdite`, `sortInterdit`, `vieBloquee`

### `joueurStatique()` — ligne 41

Appelle : `forgeValideJoueur()` *(forgeValide.js)*

Appelée par : `activationInterdite`, `cibleInterdite`, `flashAccorde`, `flashPossible`, `sortInterdit`, `vieBloquee`

### `objetOuRien()` — ligne 42

Appelle : `forgeValideObjet()` *(forgeValide.js)*

Appelée par : `activationInterdite`, `attaquePermise`, `bornesBlocage`, `cibleInterdite`, `declenchementsEnPlus`, `defenseurAttaque`, `degatsParEndurance`, `doitAttaquer`, `doitBloquer`, `preventionInterdite`, `taxeAttaque`

### `zoneOuRien()` — ligne 43

N'appelle aucune fonction du projet.

Appelée par : `activationInterdite`, `declenchementsEnPlus`, `sortInterdit`

### `sortInterdit()` — ligne 59

Appelle : `enPhasePrincipale()` *(jeuLancer.js)*, `forgeNombre()` *(forgeExpr.js)*, `forgeValideDef()` *(forgeValide.js)*, `joueurStatique()` *(forgeInterdits.js)*, `statiqueQui()` *(forgeInterdits.js)*, `zoneOuRien()` *(forgeInterdits.js)*

Appelée par : `actionsLegales`

### `flashAccorde()` — ligne 73

Appelle : `forgeValideDef()` *(forgeValide.js)*, `joueurStatique()` *(forgeInterdits.js)*, `statiqueQui()` *(forgeInterdits.js)*

Appelée par : `actionsLegales`

### `flashPossible()` — ligne 81

Appelle : `envStatique()` *(forgeStatiques.js)*, `joueurStatique()` *(forgeInterdits.js)*, `obj()` *(jeuEtat.js)*, `statiquesMode()` *(forgeInterdits.js)*

Appelée par : `actionsPossibles`

### `capaciteVisee()` — ligne 88

N'appelle aucune fonction du projet.

Appelée par : `activationInterdite`

### `activationInterdite()` — ligne 99

Appelle : `capaciteVisee()` *(forgeInterdits.js)*, `joueurStatique()` *(forgeInterdits.js)*, `objetOuRien()` *(forgeInterdits.js)*, `statiqueQui()` *(forgeInterdits.js)*, `statiquesMode()` *(forgeInterdits.js)*, `zoneOuRien()` *(forgeInterdits.js)*

Appelée par : `actionsLegales`, `sourcesMana`

### `doitAttaquer()` — ligne 107

Appelle : `objetOuRien()` *(forgeInterdits.js)*, `statiqueQui()` *(forgeInterdits.js)*

Appelée par : `declareAttaquants`

### `doitBloquer()` — ligne 108

Appelle : `objetOuRien()` *(forgeInterdits.js)*, `statiqueQui()` *(forgeInterdits.js)*

Appelée par : `declareBloqueurs`

### `defenseurAttaque()` — ligne 109

Appelle : `objetOuRien()` *(forgeInterdits.js)*, `statiqueQui()` *(forgeInterdits.js)*

Appelée par : `peutAttaquer`

### `degatsParEndurance()` — ligne 110

Appelle : `objetOuRien()` *(forgeInterdits.js)*, `statiqueQui()` *(forgeInterdits.js)*

Appelée par : `forceDeCombat`

### `bornesBlocage()` — ligne 113

Appelle : `conditionForge()` *(forgeEffetsA.js)*, `envStatique()` *(forgeStatiques.js)*, `objetOuRien()` *(forgeInterdits.js)*, `statiquesMode()` *(forgeInterdits.js)*

Appelée par : `declareBloqueurs`

### `defenseurVise()` — ligne 126

Appelle : `forgeValideObjet()` *(forgeValide.js)*, `obj()` *(jeuEtat.js)*

Appelée par : `attaquePermise`, `taxeAttaque`

### `proprieteDefenseur()` — ligne 139

Appelle : `champDe()` *(jeuEtat.js)*, `forgeValideObjet()` *(forgeValide.js)*, → `estCreature()` *(jeuCaracteristiques.js)*

Appelée par : `attaquePermise`

### `attaquePermise()` — ligne 149

Appelle : `defenseurDe()` *(jeuCombat.js)*, `defenseurVise()` *(forgeInterdits.js)*, `objetOuRien()` *(forgeInterdits.js)*, `proprieteDefenseur()` *(forgeInterdits.js)*, `statiqueQui()` *(forgeInterdits.js)*

Appelée par : `declareAttaquants`, `iaAttaquants`

### `taxeAttaque()` — ligne 157

Appelle : `conditionForge()` *(forgeEffetsA.js)*, `defenseurVise()` *(forgeInterdits.js)*, `envStatique()` *(forgeStatiques.js)*, `forgeNombre()` *(forgeExpr.js)*, `objetOuRien()` *(forgeInterdits.js)*, `statiquesMode()` *(forgeInterdits.js)*

Appelée par : `declareAttaquants`, `iaAttaquants`, `paieTaxesAttaque`

### `vieBloquee()` — ligne 169

Appelle : `joueurStatique()` *(forgeInterdits.js)*, `statiqueQui()` *(forgeInterdits.js)*

Appelée par : `gagneVie`

### `preventionInterdite()` — ligne 171

Appelle : `objetOuRien()` *(forgeInterdits.js)*, `statiqueQui()` *(forgeInterdits.js)*

Appelée par : `degatsApresPrevention`

### `cibleInterdite()` — ligne 177

Appelle : `joueurStatique()` *(forgeInterdits.js)*, `objetOuRien()` *(forgeInterdits.js)*, `statiqueQui()` *(forgeInterdits.js)*, `statiquesMode()` *(forgeInterdits.js)*

Appelée par : `ciblable`

### `mouvementEvt()` — ligne 193

Appelle : `obj()` *(jeuEtat.js)*, `objetZone()` *(forgeDeclencheurs.js)*

Appelée par : `declenchementsEnPlus`

### `declenchementsEnPlus()` — ligne 203

Appelle : `conditionForge()` *(forgeEffetsA.js)*, `envStatique()` *(forgeStatiques.js)*, `mouvementEvt()` *(forgeInterdits.js)*, `objetOuRien()` *(forgeInterdits.js)*, `statiquesMode()` *(forgeInterdits.js)*, `zoneOuRien()` *(forgeInterdits.js)*

Appelée par : `collecteDeclencheurs`

### `statiquesJoueur()` — ligne 222

Appelle : `conditionForge()` *(forgeEffetsA.js)*, `envStatique()` *(forgeStatiques.js)*, `forgeValideJoueur()` *(forgeValide.js)*, `statiquesMode()` *(forgeInterdits.js)*

Appelée par : `tailleMainMax`, `terrainsParTour`

### `tailleMainMax()` — ligne 230

Appelle : `envStatique()` *(forgeStatiques.js)*, `forgeNombre()` *(forgeExpr.js)*, `statiquesJoueur()` *(forgeInterdits.js)*

Appelée par : `nettoyage`

### `terrainsParTour()` — ligne 241

Appelle : `envStatique()` *(forgeStatiques.js)*, `forgeNombre()` *(forgeExpr.js)*, `statiquesJoueur()` *(forgeInterdits.js)*

Appelée par : `actionsLegales`, `lanceDepuisEffet`

## js/jeuCouches.js

### `statiquesCouches()` — ligne 19

Appelle : `statiquesMode()` *(forgeInterdits.js)*

Appelée par : `couchesStatiques`

### `typesCouche()` — ligne 32

Appelle : `choixDe()` *(forgeChoix.js)*, `typesForge()` *(forgeStatiques.js)*

Appelée par : `couchesStatiques`

### `couchesStatiques()` — ligne 45

Appelle : `obj()` *(jeuEtat.js)*, `statiquesCouches()` *(jeuCouches.js)*, `typesCouche()` *(jeuCouches.js)*, `viseForge()` *(forgeStatiques.js)*

Appelée par : `appliqueSBA`

### `sansCapacites()` — ligne 91

N'appelle aucune fonction du projet.

Appelée par : `capacitesDe`, `remplacementsEnJeu`, `statiquesEnJeu`

### `capacitesTerrain()` — ligne 101

Appelle : `animation()` *(jeuCaracteristiques.js)*, `coutManaVide()` *(oracleCouts.js)*, `estType()` *(jeuCaracteristiques.js)*

Appelée par : `capacitesDe`

## js/forgeRemplacements.js

### `chargement du module`

Appelle : `forgeSait()` *(forgeCouverture.js)*

### `formeRemplacement()` — ligne 19

Appelle : `forgeSousCapacite()` *(forgeScript.js)*, `zoneForge()` *(forgeEffetsA.js)*

Appelée par : `forgeEffetsD.js (chargement)`, `remplacementForge`

### `remplacementsEnJeu()` — ligne 58

Appelle : `obj()` *(jeuEtat.js)*, `sansCapacites()` *(jeuCouches.js)*

Appelée par : `degagementEmpeche`, `degatsApresPrevention`, `destinationRemplacee`, `entreeEngageeParAutre`, `incontrecarrable`, `quantiteRemplacee`

### `envRemplacement()` — ligne 67

N'appelle aucune fonction du projet.

Appelée par : `degagementEmpeche`, `degatsApresPrevention`, `destinationRemplacee`, `quantiteRemplacee`

### `destinationRemplacee()` — ligne 72

Appelle : `envRemplacement()` *(forgeRemplacements.js)*, `forgeSousCapacite()` *(forgeScript.js)*, `forgeValideObjet()` *(forgeValide.js)*, `remplacementsEnJeu()` *(forgeRemplacements.js)*, `zoneForge()` *(forgeEffetsA.js)*

Appelée par : `deplace`

### `entreeEngageeParAutre()` — ligne 91

Appelle : `forgeValideDef()` *(forgeValide.js)*, `remplacementsEnJeu()` *(forgeRemplacements.js)*

Appelée par : `metEnJeu`

### `degagementEmpeche()` — ligne 96

Appelle : `envRemplacement()` *(forgeRemplacements.js)*, `forgeValideObjet()` *(forgeValide.js)*, `remplacementsEnJeu()` *(forgeRemplacements.js)*

Appelée par : `degagement`

### `incontrecarrable()` — ligne 103

Appelle : `forgeValideDef()` *(forgeValide.js)*, `remplacementsEnJeu()` *(forgeRemplacements.js)*

Appelée par : `forgeEffetsB.js (chargement)`, `jeuOpsA.js (chargement)`

### `degatsApresPrevention()` — ligne 115

Appelle : `envRemplacement()` *(forgeRemplacements.js)*, `forgeValideJoueur()` *(forgeValide.js)*, `forgeValideObjet()` *(forgeValide.js)*, `preventionInterdite()` *(forgeInterdits.js)*, `remplacementsEnJeu()` *(forgeRemplacements.js)*

Appelée par : `infligeDegats`

### `quantiteRemplacee()` — ligne 135

Appelle : `envRemplacement()` *(forgeRemplacements.js)*, `forgeNombre()` *(forgeExpr.js)*, `forgeSousCapacite()` *(forgeScript.js)*, `forgeValideDef()` *(forgeValide.js)*, `forgeValideJoueur()` *(forgeValide.js)*, `forgeValideObjet()` *(forgeValide.js)*, `genreMarqueur()` *(forgeValide.js)*, `remplacementsEnJeu()` *(forgeRemplacements.js)*

Appelée par : `creeJetonsForge`, `gagneVie`, `infligeDegats`, `poseMarqueurs`

## js/forgeMotsCles.js

### `chargement du module`

Appelle : `forgeSait()` *(forgeCouverture.js)*

### `cycleForge()` — ligne 18

Appelle : `coutForge()` *(forgeCout.js)*, `effetForge()` *(forgeDefinition.js)*

Appelée par : `motCleForge`

### `manaSeul()` — ligne 32

Appelle : `coutForge()` *(forgeCout.js)*

Appelée par : `motCleForge`

### `protectionFiltre()` — ligne 42

N'appelle aucune fonction du projet.

Appelée par : `motCleForge`

### `motCleForge()` — ligne 53

Appelle : `coutForge()` *(forgeCout.js)*, `coutManaVide()` *(oracleCouts.js)*, `cycleForge()` *(forgeMotsCles.js)*, `descForge()` *(forgeValide.js)*, `effetForge()` *(forgeDefinition.js)*, `entreeForgeMotCle()` *(forgeChoix.js)*, `forgeSousCapacite()` *(forgeScript.js)*, `forgeTable()` *(forgeScript.js)*, `genreMarqueur()` *(forgeValide.js)*, `manaSeul()` *(forgeMotsCles.js)*, `motCleTraine()` *(forgeTraine.js)*, `protectionFiltre()` *(forgeMotsCles.js)*

Appelée par : `definitionDepuisScript`

## js/forgeDefinition.js

### `chargement du module`

Appelle : `forgeSait()` *(forgeCouverture.js)*

### `tableJouable()` — ligne 18

Appelle : `forgeApi()` *(forgeScript.js)*

Appelée par : `capaciteForge`, `effetForge`

### `texteForge()` — ligne 26

N'appelle aucune fonction du projet.

Appelée par : `capaciteForge`, `declencheurForge`, `effetForge`, `forgeChoix.js (chargement)`, `forgeEffetsD.js (chargement)`

### `effetForge()` — ligne 39

Appelle : `coutForge()` *(forgeCout.js)*, `descForge()` *(forgeValide.js)*, `forgeApi()` *(forgeScript.js)*, `forgeSousCapacite()` *(forgeScript.js)*, `tableJouable()` *(forgeDefinition.js)*, `texteForge()` *(forgeDefinition.js)*

Appelée par : `capaciteForge`, `cycleForge`, `declencheurForge`, `entreeForgeMotCle`, `forgeChoix.js (chargement)`, `forgeEffetsC.js (chargement)`, `forgeEffetsD.js (chargement)`, `motCleForge`

### `jetonsForge()` — ligne 81

Appelle : `definitionDepuisScript()` *(forgeDefinition.js)*, `lisScriptForge()` *(forgeScript.js)*

Appelée par : `definitionForge`

### `capaciteForge()` — ligne 92

Appelle : `coutForge()` *(forgeCout.js)*, `descForge()` *(forgeValide.js)*, `effetForge()` *(forgeDefinition.js)*, `forgeApi()` *(forgeScript.js)*, `optionsMana()` *(forgeEffetsC.js)*, `tableJouable()` *(forgeDefinition.js)*, `texteForge()` *(forgeDefinition.js)*

Appelée par : `definitionDepuisScript`, `statiqueForge`

### `declencheurForge()` — ligne 138

Appelle : `effetForge()` *(forgeDefinition.js)*, `forgeSousCapacite()` *(forgeScript.js)*, `phaseConnue()` *(forgeDeclencheurs.js)*, `texteForge()` *(forgeDefinition.js)*

Appelée par : `declencheurSynthetique`, `definitionDepuisScript`, `forgeEffetsD.js (chargement)`, `statiqueForge`

### `remplacementForge()` — ligne 159

Appelle : `entreeForge()` *(forgeDefinition.js)*, `formeRemplacement()` *(forgeRemplacements.js)*

Appelée par : `definitionDepuisScript`

### `entreeForge()` — ligne 168

Appelle : `descForge()` *(forgeValide.js)*, `forgeSousCapacite()` *(forgeScript.js)*, `genreMarqueur()` *(forgeValide.js)*

Appelée par : `remplacementForge`

### `couleursForge()` — ligne 197

N'appelle aucune fonction du projet.

Appelée par : `definitionDepuisScript`

### `definitionDepuisScript()` — ligne 205

Appelle : `capaciteForge()` *(forgeDefinition.js)*, `capacitesImplicites()` *(definitions.js)*, `couleursDe()` *(definitions.js)*, `couleursForge()` *(forgeDefinition.js)*, `coutMana()` *(oracleCouts.js)*, `coutManaVide()` *(oracleCouts.js)*, `couvertureForge()` *(forgeCouverture.js)*, `declencheurForge()` *(forgeDefinition.js)*, `definitionAFaces()` *(forgeDefinition.js)*, `forgeApi()` *(forgeScript.js)*, `forgeLigneType()` *(forgeScript.js)*, `lisTypeLigne()` *(oracleTexte.js)*, `motCleForge()` *(forgeMotsCles.js)*, `remplacementForge()` *(forgeDefinition.js)*, `statiqueForge()` *(forgeEffetsD.js)*

Appelée par : `definitionAFaces`, `definitionForge`, `jetonsForge`

### `definitionForge()` — ligne 246

Appelle : `definitionDepuisScript()` *(forgeDefinition.js)*, `jetonsForge()` *(forgeDefinition.js)*, `lisScriptForge()` *(forgeScript.js)*

Appelée par : `definitionDe`

### `nomsJetonsForge()` — ligne 253

N'appelle aucune fonction du projet.

Appelée par : `avecForge`

### `definitionAFaces()` — ligne 268

Appelle : `definitionDepuisScript()` *(forgeDefinition.js)*

Appelée par : `definitionDepuisScript`

## js/iaValeur.js

### `primeMots()` — ligne 15

N'appelle aucune fonction du projet.

Appelée par : `valeurDef`, `valeurObjet`

### `valeurDef()` — ligne 18

Appelle : `primeMots()` *(iaValeur.js)*

Appelée par : `iaCartes`, `iaCibles`, `iaPriorite`, `iaReponse`, `impactSort`, `meilleureCibleHostile`, `scoreEffet`, `utiliteEnMain`, `valeurObjet`

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

Appelée par : `iaCibles`, `iaModes`, `iaReponse`, `regenUtile`, `scoreEffet`

### `opsSurCible()` — ligne 76

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

Appelée par : `iaCartes`, `impactCapacite`

### `iaCibles()` — ligne 37

Appelle : `car()` *(jeuCaracteristiques.js)*, `estAMoi()` *(iaValeur.js)*, `estCreature()` *(jeuCaracteristiques.js)*, `obj()` *(jeuEtat.js)*, `opsSurCible()` *(iaValeur.js)*, `valeurDef()` *(iaValeur.js)*, `valeurObjet()` *(iaValeur.js)*, → `opHostile()` *(iaValeur.js)*

Appelée par : `agentIA`

### `iaCartes()` — ligne 71

Appelle : `champDe()` *(jeuEtat.js)*, `estType()` *(jeuCaracteristiques.js)*, `obj()` *(jeuEtat.js)*, `utiliteEnMain()` *(iaChoix.js)*, `valeurDef()` *(iaValeur.js)*, `valeurObjet()` *(iaValeur.js)*

Appelée par : `agentIA`

### `iaScrute()` — ligne 93

Appelle : `champDe()` *(jeuEtat.js)*, `estType()` *(jeuCaracteristiques.js)*, `obj()` *(jeuEtat.js)*, `terrainsEnMain()` *(iaChoix.js)*

Appelée par : `agentIA`

### `iaOui()` — ligne 104

Appelle : `manaDispo()` *(jeuMana.js)*

Appelée par : `agentIA`

### `iaModes()` — ligne 117

Appelle : `opHostile()` *(iaValeur.js)*

Appelée par : `agentIA`

## js/iaPriorite.js

### `meilleureCibleHostile()` — ligne 13

Appelle : `car()` *(jeuCaracteristiques.js)*, `ciblesLegales()` *(jeuCibles.js)*, `estAMoi()` *(iaValeur.js)*, `estCreature()` *(jeuCaracteristiques.js)*, `obj()` *(jeuEtat.js)*, `valeurDef()` *(iaValeur.js)*, `valeurObjet()` *(iaValeur.js)*

Appelée par : `impactSort`, `scoreEffet`

### `scoreEffet()` — ligne 31

Appelle : `correspond()` *(jeuCibles.js)*, `definitionJeton()` *(definitions.js)*, `estCreature()` *(jeuCaracteristiques.js)*, `manaDispo()` *(jeuMana.js)*, `meilleureCibleHostile()` *(iaPriorite.js)*, `obj()` *(jeuEtat.js)*, `opHostile()` *(iaValeur.js)*, `regenUtile()` *(iaPriorite.js)*, `valeurDef()` *(iaValeur.js)*, `valeurObjet()` *(iaValeur.js)*

Appelée par : `forgeChoix.js (chargement)`, `iaReponse`, `impactCapacite`, `impactSort`

### `impactSort()` — ligne 67

Appelle : `champDe()` *(jeuEtat.js)*, `meilleureCibleHostile()` *(iaPriorite.js)*, `scoreEffet()` *(iaPriorite.js)*, `valeurDef()` *(iaValeur.js)*, → `estCreature()` *(jeuCaracteristiques.js)*

Appelée par : `iaPriorite`, `iaReponse`, `scoreLancer`

### `impactCapacite()` — ligne 85

Appelle : `capacitesDe()` *(jeuDurees.js)*, `estCreature()` *(jeuCaracteristiques.js)*, `scoreEffet()` *(iaPriorite.js)*, `utiliteEnMain()` *(iaChoix.js)*, `valeurObjet()` *(iaValeur.js)*

Appelée par : `iaPriorite`, `iaReponse`

### `scoreTerrain()` — ligne 102

Appelle : `obj()` *(jeuEtat.js)*, `sourcesMana()` *(jeuMana.js)*

Appelée par : `iaPriorite`

### `iaReponse()` — ligne 114

Appelle : `capacitesDe()` *(jeuDurees.js)*, `champDe()` *(jeuEtat.js)*, `impactCapacite()` *(iaPriorite.js)*, `impactSort()` *(iaPriorite.js)*, `obj()` *(jeuEtat.js)*, `scoreEffet()` *(iaPriorite.js)*, `suivantVivant()` *(jeuEtat.js)*, `valeurDef()` *(iaValeur.js)*, → `opHostile()` *(iaValeur.js)*

Appelée par : `iaPriorite`

### `iaPriorite()` — ligne 144

Appelle : `capacitesDe()` *(jeuDurees.js)*, `enPhasePrincipale()` *(jeuLancer.js)*, `iaReponse()` *(iaPriorite.js)*, `impactCapacite()` *(iaPriorite.js)*, `impactSort()` *(iaPriorite.js)*, `noteActivation()` *(iaPriorite.js)*, `obj()` *(jeuEtat.js)*, `scoreLancer()` *(iaPriorite.js)*, `scoreTerrain()` *(iaPriorite.js)*, `valeurDef()` *(iaValeur.js)*

Appelée par : `agentIA`

### `regenUtile()` — ligne 172

Appelle : `opHostile()` *(iaValeur.js)*

Appelée par : `scoreEffet`

### `scoreLancer()` — ligne 181

Appelle : `defVariante()` *(jeuFaces.js)*, `impactSort()` *(iaPriorite.js)*, `obj()` *(jeuEtat.js)*

Appelée par : `iaPriorite`

### `noteActivation()` — ligne 192

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

Appelle : `adversaires()` *(jeuEtat.js)*, `attaquePermise()` *(forgeInterdits.js)*, `car()` *(jeuCaracteristiques.js)*, `champDe()` *(jeuEtat.js)*, `choisitDefenseur()` *(iaCombat.js)*, `estCreature()` *(jeuCaracteristiques.js)*, `forceDeFrappe()` *(iaValeur.js)*, `manaDispo()` *(jeuMana.js)*, `obj()` *(jeuEtat.js)*, `peutBloquer()` *(jeuCombat.js)*, `taxeAttaque()` *(forgeInterdits.js)*, `tue()` *(iaCombat.js)*, `valeurObjet()` *(iaValeur.js)*

Appelée par : `agentIA`

### `iaBloqueurs()` — ligne 57

Appelle : `aMot()` *(jeuCaracteristiques.js)*, `car()` *(jeuCaracteristiques.js)*, `obj()` *(jeuEtat.js)*, `peutBloquer()` *(jeuCombat.js)*, `tue()` *(iaCombat.js)*, `valeurObjet()` *(iaValeur.js)*

Appelée par : `agentIA`

## js/iaAgent.js

### `agentIA()` — ligne 15

Appelle : `brasse()` *(jeuHasard.js)*, `etatHasard()` *(jeuHasard.js)*, `iaAttaquants()` *(iaCombat.js)*, `iaBloqueurs()` *(iaCombat.js)*, `iaCartes()` *(iaChoix.js)*, `iaCibles()` *(iaChoix.js)*, `iaModes()` *(iaChoix.js)*, `iaMulligan()` *(iaChoix.js)*, `iaOui()` *(iaChoix.js)*, `iaPriorite()` *(iaPriorite.js)*, `iaScrute()` *(iaChoix.js)*

Appelée par : `commenceTable`, `joueLot`, `rejouePartie`, `reprendTable`

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

Appelée par : `cardRow`, `ficheTexteHTML`, `ligneProposition`, `montrerApercu`, `sugLigne`, `tableRendu.js (chargement)`

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

### `ecrire()` — ligne 124

N'appelle aucune fonction du projet.

Appelée par : `save`

### `save()` — ligne 128

Appelle : `ecrire()` *(stockage.js)*, `nuagePousseeDifferee()` *(nuage.js)*, `snapshot()` *(stockage.js)*, `toast()` *(outils.js)*

Appelée par : `brancherRestauration`, `brancherSauvegarde`, `gestesDonnees`, `gestesNuage`, `nuageTour`, `scheduleSave`

### `scheduleSave()` — ligne 159

Appelle : → `save()` *(stockage.js)*

Appelée par : `ajouteSiegeIA`, `appliqueArrets`, `appliqueCatalogueAuxCartes`, `appliqueComportement`, `appliquerAffichage`, `basculeTheme`, `brancherCatalogue`, `chercheTexte`, `chercheVerso`, `choisirVersion`, `effaceComportement`, `enregistreAdversaireFenetre`, `entete.js (chargement)`, `gestesDeck`, `gestesDecks`, `gestesDonnees`, `reglageInvite`, `reglageSalon`, `reglageSimulation`, `renderAll`, `retireSiege`, `runScryQueue`, `supprimeAdversaireOui`, `verifieDecksLies`, `verifieUnDeckLie`

### `restore()` — ligne 165

Appelle : `buildCard()` *(cartes.js)*, `find()` *(cartes.js)*, `impressionRestore()` *(stockage.js)*, `jeuRestore()` *(champsJeu.js)*, `majTexteOracle()` *(cartes.js)*, `reanalyser()` *(categories.js)*, `registerCard()` *(cartes.js)*, `restaureDecks()` *(decksStockage.js)*

Appelée par : `brancherRestauration`, `demarrer`, `nuageVerse`

### `chargerSauvegarde()` — ligne 278

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

### `idbGardee()` — ligne 25

N'appelle aucune fonction du projet.

Appelée par : `idbVider`

### `idb()` — ligne 27

N'appelle aucune fonction du projet.

Appelée par : `idbEcrire`, `idbLire`, `idbOublier`, `idbVider`

### `idbLire()` — ligne 37

Appelle : `idb()` *(idb.js)*

Appelée par : `chargeForge`, `chargeResultats`, `chargeSimCartes`, `chargerCatalogueComplet`, `chercheTableSauvee`, `nuageBaseLire`, `reprendreArchetypesEdhrec`, `reprendreGameChangers`, `reprendreSets`

### `idbEcrire()` — ligne 45

Appelle : `idb()` *(idb.js)*

Appelée par : `lireCatalogueFichier`, `nuageBaseEcrire`, `rangeForge`, `rangeResultats`, `rangeSimCartes`, `sauveTable`, `sauverArchetypesEdhrec`, `sauverGameChangers`, `sauverSets`

### `idbOublier()` — ligne 54

Appelle : `idb()` *(idb.js)*

Appelée par : `gestesDonnees`, `nuageDeconnecte`, `oublieForge`, `oublieTableSauvee`

### `idbVider()` — ligne 64

Appelle : `idb()` *(idb.js)*, `idbGardee()` *(idb.js)*

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

Appelée par : `propositionsHTML`, `resultatsAjoutHTML`

### `resultatsAjoutHTML()` — ligne 61

Appelle : `chercheCartes()` *(fenAjout.js)*, `esc()` *(outils.js)*, `find()` *(cartes.js)*, `noeudsActifs()` *(catalogueEtat.js)*, `norm()` *(cartes.js)*

Appelée par : `majResultats`, `openAdd`

### `majResultats()` — ligne 96

Appelle : `chercheScryfall()` *(recherches.js)*, `norm()` *(cartes.js)*, `resultatsAjoutHTML()` *(fenAjout.js)*

Appelée par : `app.js (chargement)`, `gestesGraphe`, `majRecherches`

### `openAdd()` — ligne 107

Appelle : `esc()` *(outils.js)*, `openDialog()` *(dialogue.js)*, `resultatsAjoutHTML()` *(fenAjout.js)*

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

Appelée par : `ficheSansForge`

### `ficheDeRec()` — ligne 29

Appelle : `champsJeuRec()` *(champsJeu.js)*

Appelée par : `ficheSansForge`

### `ficheDeScryfall()` — ligne 37

Appelle : `champsJeuScryfall()` *(champsJeu.js)*, `nombreOuRien()` *(champsJeu.js)*

Appelée par : `chercheFichesScryfall`

### `indexArchive()` — ligne 50

Appelle : `catalogueAbsent()` *(catalogueEtat.js)*, `norm()` *(cartes.js)*

Appelée par : `ficheSansForge`

### `ficheParNom()` — ligne 67

Appelle : `avecForge()` *(simCartes.js)*, `ficheSansForge()` *(simCartes.js)*

Appelée par : `fichesDeListe`, `nomsManquants`, `ouvreComportement`, `resolutionAdversaire`

### `avecForge()` — ligne 75

Appelle : `nomsJetonsForge()` *(forgeDefinition.js)*, `scriptForgeDe()` *(forgeDepot.js)*

Appelée par : `ficheParNom`

### `ficheSansForge()` — ligne 83

Appelle : `ficheDeCarte()` *(simCartes.js)*, `ficheDeRec()` *(simCartes.js)*, `find()` *(cartes.js)*, `indexArchive()` *(simCartes.js)*, `norm()` *(cartes.js)*

Appelée par : `ficheParNom`

### `chargeSimCartes()` — ligne 96

Appelle : `idbLire()` *(idb.js)*, `norm()` *(cartes.js)*

Appelée par : `commenceTable`, `completeAdversaire`, `joueLot`, `pret`, `renderK`, `verifieDecksLies`

### `rangeSimCartes()` — ligne 105

Appelle : `idbEcrire()` *(idb.js)*

Appelée par : `chercheFichesScryfall`

### `chercheFichesScryfall()` — ligne 111

Appelle : `ficheDeScryfall()` *(simCartes.js)*, `norm()` *(cartes.js)*, `rangeSimCartes()` *(simCartes.js)*

Appelée par : `commenceTable`, `completeAdversaire`, `joueLot`, `pret`

## js/simAdversaires.js

### `cleAdversaireNeuve()` — ligne 12

N'appelle aucune fonction du projet.

Appelée par : `enregistreAdversaire`

### `adversaireDepuisTexte()` — ligne 18

Appelle : `parseMtgoList()` *(fenImport.js)*

Appelée par : `adversaireDeLaFenetre`, `majApercuAdversaire`

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

Appelée par : `enregistreAdversaireFenetre`, `relisAdversaireLie`

### `signatureAdversaire()` — ligne 67

Appelle : `empreinte()` *(definitions.js)*

Appelée par : `couvertureTable`, `lotPerime`, `manquesDecks`, `terminerLot`

### `signatureDeck()` — ligne 73

Appelle : `empreinte()` *(definitions.js)*

Appelée par : `couvertureTable`, `lotPerime`, `manquesDecks`, `terminerLot`

## js/decksLies.js

### `lisLienDeck()` — ligne 58

N'appelle aucune fonction du projet.

Appelée par : `adversaireDeLaFenetre`

### `lisJsonDeck()` — ligne 71

N'appelle aucune fonction du projet.

Appelée par : `recupereDeckLie`

### `recupereDeckLie()` — ligne 84

Appelle : `lisJsonDeck()` *(decksLies.js)*

Appelée par : `adversaireDeLaFenetre`, `relisAdversaireLie`

### `texteDeListe()` — ligne 100

N'appelle aucune fonction du projet.

Appelée par : `adversaireDeLaFenetre`, `appliqueDeckLie`

### `diffListes()` — ligne 106

N'appelle aucune fonction du projet.

Appelée par : `appliqueDeckLie`, `enregistreAdversaireFenetre`

### `appliqueDeckLie()` — ligne 121

Appelle : `diffListes()` *(decksLies.js)*, `texteDeListe()` *(decksLies.js)*

Appelée par : `relisAdversaireLie`

### `relisAdversaireLie()` — ligne 136

Appelle : `appliqueDeckLie()` *(decksLies.js)*, `completeAdversaire()` *(simAdversaires.js)*, `recupereDeckLie()` *(decksLies.js)*

Appelée par : `verifieDecksLies`, `verifieUnDeckLie`

### `annonceChangement()` — ligne 149

Appelle : `toast()` *(outils.js)*

Appelée par : `verifieDecksLies`, `verifieUnDeckLie`

### `verifieDecksLies()` — ligne 155

Appelle : `annonceChangement()` *(decksLies.js)*, `chargeSimCartes()` *(simCartes.js)*, `relisAdversaireLie()` *(decksLies.js)*, `renderK()` *(simSection.js)*, `scheduleSave()` *(stockage.js)*

Appelée par : `demarrer`

### `verifieUnDeckLie()` — ligne 177

Appelle : `annonceChangement()` *(decksLies.js)*, `ouvreAdversaire()` *(fenAdversaire.js)*, `relisAdversaireLie()` *(decksLies.js)*, `renderK()` *(simSection.js)*, `scheduleSave()` *(stockage.js)*, `toast()` *(outils.js)*

Appelée par : `gestesSimulation`

### `depuisQuand()` — ligne 191

N'appelle aucune fonction du projet.

Appelée par : `etatLienHTML`, `pastilleLien`

## js/simPreparation.js

### `vieDuFormat()` — ligne 10

N'appelle aucune fonction du projet.

Appelée par : `siegeDepuisListe`

### `comportementDe()` — ligne 16

N'appelle aucune fonction du projet.

Appelée par : `fichesDeListe`

### `bilanCouverture()` — ligne 24

N'appelle aucune fonction du projet.

Appelée par : `siegeDepuisListe`

### `siegeDepuisListe()` — ligne 40

Appelle : `bilanCouverture()` *(simPreparation.js)*, `definitionDe()` *(definitions.js)*, `vieDuFormat()` *(simPreparation.js)*

Appelée par : `siegeAdversaire`, `siegeDeck`, `siegeDepuisFiches`

### `siegeDepuisFiches()` — ligne 63

Appelle : `siegeDepuisListe()` *(simPreparation.js)*

Appelée par : `reprendTable`, `siegeDeSource`

### `fichesDeDeck()` — ligne 75

Appelle : `fichesDeListe()` *(simPreparation.js)*

Appelée par : `fichesDeSource`, `pret`

### `fichesDeListe()` — ligne 83

Appelle : `comportementDe()` *(simPreparation.js)*, `ficheParNom()` *(simCartes.js)*

Appelée par : `fichesDeDeck`, `fichesDeSource`

### `fichesDeSource()` — ligne 93

Appelle : `fichesDeDeck()` *(simPreparation.js)*, `fichesDeListe()` *(simPreparation.js)*

Appelée par : `commenceTable`

### `siegeDeck()` — ligne 103

Appelle : `siegeDepuisListe()` *(simPreparation.js)*

Appelée par : `couvertureTable`, `joueLot`, `rejouePartie`, `siegeDeSource`

### `siegeAdversaire()` — ligne 112

Appelle : `siegeDepuisListe()` *(simPreparation.js)*

Appelée par : `couvertureTable`, `joueLot`, `rejouePartie`, `siegeDeSource`

### `nomsManquants()` — ligne 118

Appelle : `ficheParNom()` *(simCartes.js)*

Appelée par : `joueLot`

### `fiabilite()` — ligne 131

N'appelle aucune fonction du projet.

Appelée par : `terminerLot`

### `signatureComportements()` — ligne 138

Appelle : `empreinte()` *(definitions.js)*

Appelée par : `couvertureTable`, `lotPerime`, `terminerLot`

## js/simStats.js

### `wilson()` — ligne 15

N'appelle aucune fonction du projet.

Appelée par : `agrege`

### `mesuresPartie()` — ligne 24

N'appelle aucune fonction du projet.

Appelée par : `joueLot`

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

Appelée par : `boucleTable`, `joueLot`

### `configSimulation()` — ligne 26

N'appelle aucune fonction du projet.

Appelée par : `enregistreAdversaireFenetre`, `joueLot`, `renderK`

### `obstacleSimulation()` — ligne 36

N'appelle aucune fonction du projet.

Appelée par : `joueLot`

### `placesPartie()` — ligne 43

N'appelle aucune fonction du projet.

Appelée par : `joueLot`, `rejouePartie`

### `graineDePartie()` — ligne 48

Appelle : `brasse()` *(jeuHasard.js)*

Appelée par : `joueLot`, `rejouePartie`

### `majProgressionSim()` — ligne 50

N'appelle aucune fonction du projet.

Appelée par : `joueLot`, `renderK`

### `lanceSimulation()` — ligne 60

Appelle : `joueLot()` *(simulation.js)*, `renderK()` *(simSection.js)*, `signalerTravail()` *(rendu.js)*, `toast()` *(outils.js)*

Appelée par : `gestesSimulation`

### `joueLot()` — ligne 70

Appelle : `agentIA()` *(iaAgent.js)*, `avance()` *(jeuPilote.js)*, `chargeSimCartes()` *(simCartes.js)*, `chercheFichesScryfall()` *(simCartes.js)*, `configSimulation()` *(simulation.js)*, `creePartie()` *(jeuPilote.js)*, `graineDePartie()` *(simulation.js)*, `majProgressionSim()` *(simulation.js)*, `mesuresPartie()` *(simStats.js)*, `nomsManquants()` *(simPreparation.js)*, `obstacleSimulation()` *(simulation.js)*, `placesPartie()` *(simulation.js)*, `rendMain()` *(simulation.js)*, `renderK()` *(simSection.js)*, `siegeDeck()` *(simPreparation.js)*, `signalerTravail()` *(rendu.js)*, `terminerLot()` *(simulation.js)*, `toast()` *(outils.js)*, → `siegeAdversaire()` *(simPreparation.js)*

Appelée par : `lanceSimulation`

### `terminerLot()` — ligne 109

Appelle : `agrege()` *(simStats.js)*, `ajouteLot()` *(simStockage.js)*, `fiabilite()` *(simPreparation.js)*, `renderK()` *(simSection.js)*, `signalerTravail()` *(rendu.js)*, `signatureAdversaire()` *(simAdversaires.js)*, `signatureComportements()` *(simPreparation.js)*, `signatureDeck()` *(simAdversaires.js)*, `toast()` *(outils.js)*

Appelée par : `joueLot`

### `arreteSimulation()` — ligne 130

N'appelle aucune fonction du projet.

Appelée par : `gestesSimulation`

### `rejouePartie()` — ligne 134

Appelle : `agentIA()` *(iaAgent.js)*, `graineDePartie()` *(simulation.js)*, `joueJusquauBout()` *(jeuPilote.js)*, `lotPerime()` *(simStockage.js)*, `placesPartie()` *(simulation.js)*, `siegeDeck()` *(simPreparation.js)*, → `siegeAdversaire()` *(simPreparation.js)*

Appelée par : `ouvreJournal`

## js/simSection.js

### `couvertureTable()` — ligne 16

Appelle : `siegeAdversaire()` *(simPreparation.js)*, `siegeDeck()` *(simPreparation.js)*, `signatureAdversaire()` *(simAdversaires.js)*, `signatureComportements()` *(simPreparation.js)*, `signatureDeck()` *(simAdversaires.js)*

Appelée par : `couvertureHTML`

### `optionsHTML()` — ligne 27

Appelle : `esc()` *(outils.js)*

Appelée par : `ouvreAdversaire`, `rejoindreHTML`, `salonHTML`, `tableHTML`

### `tableHTML()` — ligne 32

Appelle : `clesDecks()` *(decks.js)*, `optionsHTML()` *(simSection.js)*

Appelée par : `renderK`

### `adversairesHTML()` — ligne 64

Appelle : `esc()` *(outils.js)*, `nbCartesAdversaire()` *(simAdversaires.js)*, `pastilleLien()` *(simSection.js)*, `relaisHTML()` *(simSection.js)*, `resolutionAdversaire()` *(simAdversaires.js)*

Appelée par : `renderK`

### `pastilleLien()` — ligne 93

Appelle : `depuisQuand()` *(decksLies.js)*, `esc()` *(outils.js)*

Appelée par : `adversairesHTML`

### `relaisHTML()` — ligne 102

Appelle : `esc()` *(outils.js)*

Appelée par : `adversairesHTML`

### `badgeCouverture()` — ligne 115

N'appelle aucune fonction du projet.

Appelée par : `couvertureHTML`, `lectureHTML`

### `couvertureHTML()` — ligne 121

Appelle : `badgeCouverture()` *(simSection.js)*, `couvertureTable()` *(simSection.js)*, `esc()` *(outils.js)*

Appelée par : `renderK`

### `renderK()` — ligne 142

Appelle : `adversairesHTML()` *(simSection.js)*, `chargeResultats()` *(simStockage.js)*, `chargeSimCartes()` *(simCartes.js)*, `configSimulation()` *(simulation.js)*, `couvertureHTML()` *(simSection.js)*, `majProgressionSim()` *(simulation.js)*, `manquesHTML()` *(forgeVue.js)*, `resultatsHTML()` *(simResultats.js)*, `tableHTML()` *(simSection.js)*

Appelée par : `appliqueComportement`, `chercheTableSauvee`, `effaceComportement`, `enregistreAdversaireFenetre`, `entete.js (chargement)`, `gestesSimulation`, `joueLot`, `lanceSimulation`, `reglageSimulation`, `renderAll`, `supprimeAdversaireOui`, `terminerLot`, `verifieDecksLies`, `verifieUnDeckLie`

## js/forgeDepot.js

### `paquetForge()` — ligne 26

N'appelle aucune fonction du projet.

Appelée par : `oublieForge`, `rangeForge`, `telechargeForge`, `telechargeUn`

### `baseForge()` — ligne 29

N'appelle aucune fonction du projet.

Appelée par : `cheminsDeNoms`

### `indexeForge()` — ligne 35

Appelle : `norm()` *(cartes.js)*

Appelée par : `chargeForge`, `telechargeUn`

### `chargeForge()` — ligne 45

Appelle : `forgeIncomplet()` *(forgeDepot.js)*, `idbLire()` *(idb.js)*, `indexeForge()` *(forgeDepot.js)*

Appelée par : `demarreForge`, `telechargeForge`

### `forgeIncomplet()` — ligne 62

N'appelle aucune fonction du projet.

Appelée par : `chargeForge`, `demarreForge`

### `jsonGH()` — ligne 66

N'appelle aucune fonction du projet.

Appelée par : `listeForge`

### `listeForge()` — ligne 73

Appelle : `jsonGH()` *(forgeDepot.js)*

Appelée par : `telechargeForge`

### `nomsPrioritaires()` — ligne 98

N'appelle aucune fonction du projet.

Appelée par : `telechargeForge`

### `cheminsDeNoms()` — ligne 107

Appelle : `baseForge()` *(forgeDepot.js)*

Appelée par : `telechargeForge`

### `rangeForge()` — ligne 120

Appelle : `idbEcrire()` *(idb.js)*, `paquetForge()` *(forgeDepot.js)*

Appelée par : `telechargeForge`

### `telechargeUn()` — ligne 132

Appelle : `indexeForge()` *(forgeDepot.js)*, `paquetForge()` *(forgeDepot.js)*

Appelée par : `telechargeForge`

### `telechargeForge()` — ligne 148

Appelle : `chargeForge()` *(forgeDepot.js)*, `cheminsDeNoms()` *(forgeDepot.js)*, `forgeChange()` *(forgeVue.js)*, `listeForge()` *(forgeDepot.js)*, `majForgeUI()` *(forgeVue.js)*, `nomsPrioritaires()` *(forgeDepot.js)*, `paquetForge()` *(forgeDepot.js)*, `rangeForge()` *(forgeDepot.js)*, `telechargeUn()` *(forgeDepot.js)*

Appelée par : `demarreForge`, `gestesForge`

### `demarreForge()` — ligne 192

Appelle : `chargeForge()` *(forgeDepot.js)*, `forgeChange()` *(forgeVue.js)*, `forgeIncomplet()` *(forgeDepot.js)*, `telechargeForge()` *(forgeDepot.js)*

Appelée par : `demarrer`

### `oublieForge()` — ligne 202

Appelle : `forgeChange()` *(forgeVue.js)*, `idbOublier()` *(idb.js)*, → `paquetForge()` *(forgeDepot.js)*

Appelée par : `gestesForge`

### `scriptForgeDe()` — ligne 212

Appelle : `norm()` *(cartes.js)*

Appelée par : `avecForge`, `manquesDecks`

## js/forgeVue.js

### `forgeChange()` — ligne 23

Appelle : `majForgeUI()` *(forgeVue.js)*

Appelée par : `demarreForge`, `oublieForge`, `telechargeForge`

### `etatForgeTexte()` — ligne 29

N'appelle aucune fonction du projet.

Appelée par : `corpsForge`, `manquesHTML`

### `corpsForge()` — ligne 43

Appelle : `esc()` *(outils.js)*, `etatForgeTexte()` *(forgeVue.js)*

Appelée par : `corpsParametres`, `majForgeUI`

### `majForgeUI()` — ligne 64

Appelle : `corpsForge()` *(forgeVue.js)*, `manquesHTML()` *(forgeVue.js)*, `releveAncre()` *(ancre.js)*, `restaureAncre()` *(ancre.js)*

Appelée par : `forgeChange`, `mesureBaseForge`, `telechargeForge`

### `poidsPrioritaires()` — ligne 77

N'appelle aucune fonction du projet.

Appelée par : `manquesDecks`

### `manquesDecks()` — ligne 87

Appelle : `couvertureForge()` *(forgeCouverture.js)*, `lisScriptForge()` *(forgeScript.js)*, `manquesForge()` *(forgeCouverture.js)*, `poidsPrioritaires()` *(forgeVue.js)*, `scriptForgeDe()` *(forgeDepot.js)*, → `signatureAdversaire()` *(simAdversaires.js)*, → `signatureDeck()` *(simAdversaires.js)*

Appelée par : `manquesHTML`

### `mesureBaseForge()` — ligne 109

Appelle : `attendre()` *(tableHote.js)*, `couvertureForge()` *(forgeCouverture.js)*, `lisScriptForge()` *(forgeScript.js)*, `majForgeUI()` *(forgeVue.js)*, `manquesForge()` *(forgeCouverture.js)*

Appelée par : `gestesForge`

### `libelleElement()` — ligne 128

Appelle : `esc()` *(outils.js)*

Appelée par : `listeManques`

### `listeManques()` — ligne 133

Appelle : `esc()` *(outils.js)*, `libelleElement()` *(forgeVue.js)*

Appelée par : `manquesHTML`

### `manquesHTML()` — ligne 141

Appelle : `esc()` *(outils.js)*, `etatForgeTexte()` *(forgeVue.js)*, `listeManques()` *(forgeVue.js)*, `manquesDecks()` *(forgeVue.js)*

Appelée par : `majForgeUI`, `renderK`

### `gestesForge()` — ligne 165

Appelle : `mesureBaseForge()` *(forgeVue.js)*, `oublieForge()` *(forgeDepot.js)*, `telechargeForge()` *(forgeDepot.js)*

Appelée par : `app.js (chargement)`

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

Appelée par : `renderK`

## js/outils.js

### `esc()` — ligne 10

N'appelle aucune fonction du projet.

Appelée par : `acteSuggestion`, `actesAnnexe`, `adversairesHTML`, `aideFormules`, `alertesInvitesHTML`, `barreCatalogue`, `barresHTML`, `blocAchats`, `blocAnnexe`, `blocCatalogue`, `blocEdhrec`, `blocGraphe`, `blocVersions`, `cardRow`, `cardTile`, `cartesHTML`, `champBudget`, `champDeck`, `champRecherche`, `chipsChoix`, `combatHTML`, `corpsAffichage`, `corpsArrets`, `corpsBoiteRecalcul`, `corpsBudget`, `corpsCibles`, `corpsDeck`, `corpsFiltres`, `corpsForge`, `corpsFormat`, `corpsSauvegarde`, `couvertureHTML`, `decksDemandeurs`, `enteteFiche`, `enveloppeGroupe`, `etatArchetypes`, `etatSets`, `exportModal`, `ficheHTML`, `ficheTexteHTML`, `gauge`, `gestesDeck`, `gestesDecks`, `historiqueHTML`, `lectureHTML`, `libelleElement`, `lienDecksEdhrec`, `ligneAchats`, `ligneCatalogue`, `ligneCausesCollection`, `ligneCible`, `ligneCommandant`, `ligneEnLigne`, `ligneFiltre`, `ligneGameChangers`, `ligneMana`, `ligneProposition`, `ligneRestriction`, `ligneWishlist`, `listeArchetypesHTML`, `listeManques`, `listeSetsHTML`, `lotHTML`, `majApercu`, `majApercuAdversaire`, `majBoutonAffichage`, `manquesHTML`, `montrerApercu`, `nuageConflits`, `nuageCorpsConnecte`, `nuageCorpsDeconnecte`, `nuageDetail`, `nuageEtatLigne`, `nuageOu`, `openAdd`, `openCardModal`, `openDialog`, `openWantsModal`, `optionsHTML`, `ouvreAdversaire`, `ouvreComportement`, `ouvreJournal`, `ouvreJournalTable`, `paginationListe`, `panneauEdhrec`, `partiesHTML`, `pastilleLien`, `proposerMajCatalogue`, `propositionsHTML`, `puceStatut`, `questionHTML`, `refCarte`, `rejoindreHTML`, `relaisHTML`, `renderD`, `renderE`, `renderJ`, `renderTop`, `repliHTML`, `resultatsAjoutHTML`, `resumeDeckConfig`, `resumeFiltres`, `salonHTML`, `sectionParametres`, `siegeDistantHTML`, `sugLigne`, `sugRow`, `supprimeAdversaire`, `svgGraph`, `symBg`, `symIcon`, `tableRendu.js (chargement)`, `tagAnnexe`, `tagDeck`, `tagEdhrec`, `tagIllegal`, `vignetteDeck`, `zoneCommandant`

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

Appelée par : `addToDeck`, `adversaireDeLaFenetre`, `ajouterCarte`, `annonceChangement`, `app.js (chargement)`, `appliqueComportement`, `brancherCatalogue`, `brancherRestauration`, `brancherSauvegarde`, `buyCard`, `chargerArchetypesEdhrec`, `choisirVersion`, `commenceTable`, `completeUnknown`, `deplacerCarte`, `effaceComportement`, `enregistreAdversaireFenetre`, `enrichAllUnknown`, `exportModal`, `gestesDeck`, `gestesDecks`, `gestesDonnees`, `gestesNuage`, `gestesReglages`, `joueLot`, `lanceSimulation`, `lienOffreColle`, `lireCatalogueFichier`, `loadEdhrec`, `majCatalogue`, `majPrix`, `nuageDemarrer`, `nuageDiagnostic`, `nuageSynchro`, `openImport`, `openWantsModal`, `openWipeModal`, `ouvreComportement`, `ouvreJournal`, `relie`, `relieCode`, `runScryQueue`, `save`, `telechargerCatalogue`, `terminerLot`, `verifieUnDeckLie`, `versAnnexe`, `viderAnnexe`

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

Appelée par : `annonceRecalcul`, `exportModal`, `gestesDeck`, `gestesDecks`, `gestesDonnees`, `gestesNuage`, `openAdd`, `openAffichageModal`, `openBudgetModal`, `openCardModal`, `openCiblesModal`, `openDeckModal`, `openFiltresModal`, `openFormatModal`, `openImport`, `openParametresModal`, `openWantsModal`, `openWipeModal`, `ouvreAdversaire`, `ouvreArrets`, `ouvreComportement`, `ouvreJournal`, `ouvreJournalTable`, `ouvrirBoiteCatalogue`, `proposerMajCatalogue`, `supprimeAdversaire`

### `closeDialog()` — ligne 37

N'appelle aucune fonction du projet.

Appelée par : `app.js (chargement)`, `appliqueArrets`, `appliqueComportement`, `appliquerAffichage`, `appliquerBudget`, `appliquerCibles`, `appliquerDeck`, `appliquerFiltres`, `appliquerFormat`, `appliquerParametres`, `effaceComportement`, `enregistreAdversaireFenetre`, `fermerBoiteCatalogue`, `finRecalcul`, `gestesDeck`, `gestesDecks`, `gestesDonnees`, `gestesGraphe`, `gestesNuage`, `gestesVue`, `openImport`, `openWipeModal`, `supprimeAdversaireOui`

## js/brouillon.js

### `ouvreBrouillon()` — ligne 23

Appelle : `copieEtat()` *(brouillon.js)*

Appelée par : `openAffichageModal`, `openBudgetModal`, `openCiblesModal`, `openDeckModal`, `openFiltresModal`, `openFormatModal`, `openParametresModal`, `ouvreArrets`

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

Appelée par : `appliquerAffichage`, `corpsAffichage`, `corpsArrets`, `corpsBudget`, `corpsCatalogue`, `corpsCibles`, `corpsDeck`, `corpsFiltres`, `corpsFormat`, `gestesVue`, `majListeArchetypes`, `majListeSets`, `majResumeBudget`, `majResumeFormat`, `resumeDeckConfig`, `resumeFiltres`

### `modifieBrouillon()` — ligne 77

Appelle : `echangeBrouillon()` *(brouillon.js)*, `reprendEtat()` *(brouillon.js)*

Appelée par : `app.js (chargement)`, `appliquerAffichage`, `arretsDefaut`, `caseArret`, `gestesDeckConfig`, `gestesDecks`, `gestesReglages`, `gestesVue`, `glisseColonnes`, `reglageAffichage`, `saisieBudget`, `saisieDeck`

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

Appelée par : `appliqueArrets`, `appliquerAffichage`, `appliquerBudget`, `appliquerCibles`, `appliquerDeck`, `appliquerFiltres`, `appliquerFormat`, `appliquerParametres`

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

Appelée par : `majForgeUI`, `nuageTour`, `recalculerAvecProgression`

### `restaureAncre()` — ligne 41

N'appelle aucune fonction du projet.

Appelée par : `majForgeUI`, `nuageTour`, `recalculerAvecProgression`

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

Appelée par : `finProgresSection`, `joueLot`, `lanceSimulation`, `progresSection`, `terminerLot`

### `renderAll()` — ligne 20

Appelle : `renderB()` *(collection.js)*, `renderC()` *(stats.js)*, `renderD()` *(graphe.js)*, `renderE()` *(deckSection.js)*, `renderI()` *(decksSection.js)*, `renderJ()` *(wishlistSection.js)*, `renderK()` *(simSection.js)*, `renderOnglets()` *(entete.js)*, `renderSuggestions()` *(suggestions.js)*, `renderTop()` *(entete.js)*, `renduTable()` *(tableRendu.js)*, `scheduleSave()` *(stockage.js)*

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

Appelle : `corpsApparence()` *(fenParametres.js)*, `corpsCatalogue()` *(fenParametres.js)*, `corpsForge()` *(forgeVue.js)*, `corpsNuage()` *(fenNuage.js)*, `corpsSauvegarde()` *(fenSauvegarde.js)*, `sectionParametres()` *(fenParametres.js)*

Appelée par : `majFenetreParametres`, `openParametresModal`

### `majFenetreParametres()` — ligne 93

Appelle : `brancherParametres()` *(fenParametres.js)*, `corpsParametres()` *(fenParametres.js)*

Appelée par : `brancherSauvegarde`, `gestesNuageChange`, `nuageDiagnostic`, `nuageSynchro`, `openParametresModal`, `rafraichirFenetreSauvegarde`

### `brancherParametres()` — ligne 104

Appelle : `brancherCatalogue()` *(fenSauvegarde.js)*, `brancherRestauration()` *(fenSauvegarde.js)*, `brancherSauvegarde()` *(fenSauvegarde.js)*

Appelée par : `majFenetreParametres`, `openParametresModal`

### `appliquerParametres()` — ligne 110

Appelle : `closeDialog()` *(dialogue.js)*, `filtrerAvecProgression()` *(fenFiltres.js)*, `verseBrouillon()` *(brouillon.js)*

Appelée par : `gestesReglages`

### `openParametresModal()` — ligne 116

Appelle : `brancherParametres()` *(fenParametres.js)*, `corpsParametres()` *(fenParametres.js)*, `openDialog()` *(dialogue.js)*, `ouvreBrouillon()` *(brouillon.js)*, `zoneProgression()` *(fenFiltres.js)*, → `majFenetreParametres()` *(fenParametres.js)*

Appelée par : `gestesNuage`, `gestesReglages`

### `appliquerFormat()` — ligne 127

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

Appelée par : `barreCatalogue`, `lecteur`, `majBoiteCatalogue`

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

### `repliHTML()` — ligne 20

Appelle : `esc()` *(outils.js)*

Appelée par : `adversaireDeLaFenetre`, `ouvreAdversaire`

### `etatLienHTML()` — ligne 33

Appelle : `depuisQuand()` *(decksLies.js)*

Appelée par : `ouvreAdversaire`

### `ouvreAdversaire()` — ligne 39

Appelle : `esc()` *(outils.js)*, `etatLienHTML()` *(fenAdversaire.js)*, `majApercuAdversaire()` *(fenAdversaire.js)*, `openDialog()` *(dialogue.js)*, `optionsHTML()` *(simSection.js)*, `repliHTML()` *(fenAdversaire.js)*

Appelée par : `gestesSimulation`, `verifieUnDeckLie`

### `majApercuAdversaire()` — ligne 61

Appelle : `adversaireDepuisTexte()` *(simAdversaires.js)*, `esc()` *(outils.js)*, `nbCartesAdversaire()` *(simAdversaires.js)*, `resolutionAdversaire()` *(simAdversaires.js)*

Appelée par : `adversaireDeLaFenetre`, `app.js (chargement)`, `ouvreAdversaire`

### `adversaireDeLaFenetre()` — ligne 74

Appelle : `adversaireDepuisTexte()` *(simAdversaires.js)*, `lisLienDeck()` *(decksLies.js)*, `majApercuAdversaire()` *(fenAdversaire.js)*, `recupereDeckLie()` *(decksLies.js)*, `repliHTML()` *(fenAdversaire.js)*, `texteDeListe()` *(decksLies.js)*, `toast()` *(outils.js)*

Appelée par : `enregistreAdversaireFenetre`

### `enregistreAdversaireFenetre()` — ligne 105

Appelle : `adversaireDeLaFenetre()` *(fenAdversaire.js)*, `closeDialog()` *(dialogue.js)*, `completeAdversaire()` *(simAdversaires.js)*, `configSimulation()` *(simulation.js)*, `diffListes()` *(decksLies.js)*, `enregistreAdversaire()` *(simAdversaires.js)*, `renderK()` *(simSection.js)*, `scheduleSave()` *(stockage.js)*, `toast()` *(outils.js)*

Appelée par : `gestesSimulation`

### `supprimeAdversaire()` — ligne 128

Appelle : `esc()` *(outils.js)*, `openDialog()` *(dialogue.js)*

Appelée par : `gestesSimulation`

### `supprimeAdversaireOui()` — ligne 136

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

### `gestesSimulation()` — ligne 10

Appelle : `appliqueComportement()` *(fenComportement.js)*, `arreteSimulation()` *(simulation.js)*, `effaceComportement()` *(fenComportement.js)*, `enregistreAdversaireFenetre()` *(fenAdversaire.js)*, `lanceSimulation()` *(simulation.js)*, `ouvreAdversaire()` *(fenAdversaire.js)*, `ouvreComportement()` *(fenComportement.js)*, `ouvreJournal()` *(fenJournal.js)*, `renderK()` *(simSection.js)*, `supprimeAdversaire()` *(fenAdversaire.js)*, `supprimeAdversaireOui()` *(fenAdversaire.js)*, `supprimeLot()` *(simStockage.js)*, `verifieUnDeckLie()` *(decksLies.js)*

Appelée par : `app.js (chargement)`

### `reglageSimulation()` — ligne 32

Appelle : `renderK()` *(simSection.js)*, `scheduleSave()` *(stockage.js)*

Appelée par : `app.js (chargement)`

## js/qrCorps.js

### `gfMul()` — ligne 25

N'appelle aucune fonction du projet.

Appelée par : `polyVal`, `rsCorrection`, `rsDecode`, `rsGenerateur`

### `gfDiv()` — ligne 26

N'appelle aucune fonction du projet.

Appelée par : `rsDecode`

### `gfPow()` — ligne 27

N'appelle aucune fonction du projet.

Appelée par : `rsDecode`, `rsGenerateur`

### `rsGenerateur()` — ligne 31

Appelle : `gfMul()` *(qrCorps.js)*, `gfPow()` *(qrCorps.js)*

Appelée par : `rsCorrection`

### `rsCorrection()` — ligne 42

Appelle : `gfMul()` *(qrCorps.js)*, `rsGenerateur()` *(qrCorps.js)*

Appelée par : `qrMots`

### `polyVal()` — ligne 53

Appelle : `gfMul()` *(qrCorps.js)*

Appelée par : `rsDecode`

### `rsDecode()` — ligne 58

Appelle : `gfDiv()` *(qrCorps.js)*, `gfMul()` *(qrCorps.js)*, `gfPow()` *(qrCorps.js)*, `polyVal()` *(qrCorps.js)*

Appelée par : `qrLitGrille`

### `qrCapacite()` — ligne 114

N'appelle aucune fonction du projet.

Appelée par : `qrEcrit`, `qrMots`

## js/qrMatrice.js

### `qrTaille()` — ligne 16

N'appelle aucune fonction du projet.

Appelée par : `qrGrille`, `qrLitGrille`

### `qrBitsFormat()` — ligne 19

N'appelle aucune fonction du projet.

Appelée par : `qrLitFormat`, `qrPoseFormat`

### `qrBitsVersion()` — ligne 27

N'appelle aucune fonction du projet.

Appelée par : `qrGrille`

### `qrGrille()` — ligne 35

Appelle : `qrBitsVersion()` *(qrMatrice.js)*, `qrTaille()` *(qrMatrice.js)*

Appelée par : `qrEcrit`, `qrLitGrille`

### `qrPositionsFormat()` — ligne 68

N'appelle aucune fonction du projet.

Appelée par : `qrLitFormat`, `qrPoseFormat`

### `qrPoseFormat()` — ligne 78

Appelle : `qrBitsFormat()` *(qrMatrice.js)*, `qrPositionsFormat()` *(qrMatrice.js)*

Appelée par : `qrEcrit`

### `qrOrdre()` — ligne 87

N'appelle aucune fonction du projet.

Appelée par : `qrEcrit`, `qrLitGrille`

### `qrMasque()` — ligne 107

N'appelle aucune fonction du projet.

Appelée par : `qrEcrit`, `qrLitGrille`

## js/qrEcrit.js

### `qrEstAlnum()` — ligne 18

N'appelle aucune fonction du projet.

Appelée par : `qrBitsDonnees`

### `qrBitsDonnees()` — ligne 22

Appelle : `qrEstAlnum()` *(qrEcrit.js)*

Appelée par : `qrEcrit`

### `qrMots()` — ligne 38

Appelle : `qrCapacite()` *(qrCorps.js)*, `rsCorrection()` *(qrCorps.js)*

Appelée par : `qrEcrit`

### `qrPenalite()` — ligne 58

N'appelle aucune fonction du projet.

Appelée par : `qrEcrit`

### `qrEcrit()` — ligne 84

Appelle : `qrBitsDonnees()` *(qrEcrit.js)*, `qrCapacite()` *(qrCorps.js)*, `qrGrille()` *(qrMatrice.js)*, `qrMasque()` *(qrMatrice.js)*, `qrMots()` *(qrEcrit.js)*, `qrOrdre()` *(qrMatrice.js)*, `qrPenalite()` *(qrEcrit.js)*, `qrPoseFormat()` *(qrMatrice.js)*

Appelée par : `alertesInvitesHTML`, `rejoindreHTML`, `siegeDistantHTML`

### `qrSVG()` — ligne 103

N'appelle aucune fonction du projet.

Appelée par : `alertesInvitesHTML`, `rejoindreHTML`, `siegeDistantHTML`

## js/qrBinarise.js

### `qrGris()` — ligne 13

N'appelle aucune fonction du projet.

Appelée par : `lisQR`

### `qrBinarise()` — ligne 20

N'appelle aucune fonction du projet.

Appelée par : `lisQR`

### `qrNoir()` — ligne 53

N'appelle aucune fonction du projet.

Appelée par : `qrChercheAlignement`, `qrEchantillonne`, `qrTraverse`, `qrTroisSuites`

## js/qrReperes.js

### `qrProportions()` — ligne 14

N'appelle aucune fonction du projet.

Appelée par : `qrChercheReperes`, `qrTraverse`

### `qrTroisSuites()` — ligne 23

Appelle : `qrNoir()` *(qrBinarise.js)*

Appelée par : `qrTraverse`

### `qrTraverse()` — ligne 37

Appelle : `qrNoir()` *(qrBinarise.js)*, `qrProportions()` *(qrReperes.js)*, `qrTroisSuites()` *(qrReperes.js)*

Appelée par : `qrChercheAlignement`, `qrChercheReperes`

### `qrChercheReperes()` — ligne 50

Appelle : `qrProportions()` *(qrReperes.js)*, `qrTraverse()` *(qrReperes.js)*

Appelée par : `lisQR`

### `qrTriplets()` — ligne 85

N'appelle aucune fonction du projet.

Appelée par : `lisQR`

### `qrChercheAlignement()` — ligne 105

Appelle : `qrNoir()` *(qrBinarise.js)*, `qrTraverse()` *(qrReperes.js)*

Appelée par : `qrLitTriplet`

## js/qrLit.js

### `qrCarreVersQuad()` — ligne 15

N'appelle aucune fonction du projet.

Appelée par : `qrLitTriplet`

### `qrAdjointe()` — ligne 24

N'appelle aucune fonction du projet.

Appelée par : `qrLitTriplet`

### `qrCompose()` — ligne 30

N'appelle aucune fonction du projet.

Appelée par : `qrLitTriplet`

### `qrApplique()` — ligne 37

N'appelle aucune fonction du projet.

Appelée par : `qrEchantillonne`

### `qrEchantillonne()` — ligne 44

Appelle : `qrApplique()` *(qrLit.js)*, `qrNoir()` *(qrBinarise.js)*

Appelée par : `qrLitTriplet`

### `qrLitFormat()` — ligne 61

Appelle : `qrBitsFormat()` *(qrMatrice.js)*, `qrPositionsFormat()` *(qrMatrice.js)*

Appelée par : `qrLitGrille`

### `qrSegments()` — ligne 75

N'appelle aucune fonction du projet.

Appelée par : `qrLitGrille`

### `qrLitGrille()` — ligne 101

Appelle : `qrGrille()` *(qrMatrice.js)*, `qrLitFormat()` *(qrLit.js)*, `qrMasque()` *(qrMatrice.js)*, `qrOrdre()` *(qrMatrice.js)*, `qrSegments()` *(qrLit.js)*, `qrTaille()` *(qrMatrice.js)*, `rsDecode()` *(qrCorps.js)*

Appelée par : `qrLitTriplet`

### `lisQR()` — ligne 126

Appelle : `qrBinarise()` *(qrBinarise.js)*, `qrChercheReperes()` *(qrReperes.js)*, `qrGris()` *(qrBinarise.js)*, `qrLitTriplet()` *(qrLit.js)*, `qrTriplets()` *(qrReperes.js)*

Appelée par : `lisImage`

### `qrLitTriplet()` — ligne 139

Appelle : `qrAdjointe()` *(qrLit.js)*, `qrCarreVersQuad()` *(qrLit.js)*, `qrChercheAlignement()` *(qrReperes.js)*, `qrCompose()` *(qrLit.js)*, `qrEchantillonne()` *(qrLit.js)*, `qrLitGrille()` *(qrLit.js)*

Appelée par : `lisQR`

## js/camera.js

### `ouvreCamera()` — ligne 21

N'appelle aucune fonction du projet.

Appelée par : `ajouteInvite`, `repriseInvite`, `scanneOffre`

### `fermeCamera()` — ligne 38

N'appelle aucune fonction du projet.

Appelée par : `etatDistant`, `fermeLiaisons`, `lienOffreColle`, `scanneOffre`

### `detecteurNatif()` — ligne 45

N'appelle aucune fonction du projet.

Appelée par : `lisImage`

### `lisImage()` — ligne 56

Appelle : `detecteurNatif()` *(camera.js)*, `lisQR()` *(qrLit.js)*

Appelée par : `scanne`

### `scanne()` — ligne 73

Appelle : `lisImage()` *(camera.js)*

Appelée par : `scanneOffre`, `scanneReponses`

## js/liaisonCode.js

### `ecrivain()` — ligne 19

N'appelle aucune fonction du projet.

Appelée par : `empaquette`

### `lecteur()` — ligne 31

Appelle : → `octets()` *(boiteCatalogue.js)*

Appelée par : `depaquette`

### `empaquette()` — ligne 49

Appelle : `ecrivain()` *(liaisonCode.js)*

Appelée par : `creeOffre`, `repondOffre`

### `depaquette()` — ligne 65

Appelle : `lecteur()` *(liaisonCode.js)*

Appelée par : `lisOffreTexte`, `sautReponse`

### `base64url()` — ligne 80

N'appelle aucune fonction du projet.

Appelée par : `texteOffre`

### `deBase64url()` — ligne 81

N'appelle aucune fonction du projet.

Appelée par : `lisOffreTexte`

### `base45()` — ligne 84

N'appelle aucune fonction du projet.

Appelée par : `rejoindreHTML`

### `deBase45()` — ligne 93

N'appelle aucune fonction du projet.

Appelée par : `sautReponse`

### `codeATaper()` — ligne 107

N'appelle aucune fonction du projet.

Appelée par : `rejoindreHTML`

### `deCodeATaper()` — ligne 114

N'appelle aucune fonction du projet.

Appelée par : `sautReponse`

## js/liaisonSdp.js

### `lisSdpLocal()` — ligne 12

Appelle : `choisitCandidats()` *(liaisonSdp.js)*

Appelée par : `creeOffre`, `repondOffre`

### `choisitCandidats()` — ligne 28

Appelle : `ipv6Octets()` *(liaisonSdp.js)*

Appelée par : `lisSdpLocal`

### `ipv6Octets()` — ligne 48

N'appelle aucune fonction du projet.

Appelée par : `choisitCandidats`

### `adresseCandidat()` — ligne 57

N'appelle aucune fonction du projet.

Appelée par : `sdpDistant`

### `sdpDistant()` — ligne 66

Appelle : `adresseCandidat()` *(liaisonSdp.js)*

Appelée par : `appliqueReponse`, `repondOffre`

## js/liaison.js

### `nouvelleConnexion()` — ligne 21

N'appelle aucune fonction du projet.

Appelée par : `creeOffre`, `repondOffre`

### `collecteFinie()` — ligne 29

N'appelle aucune fonction du projet.

Appelée par : `creeOffre`, `repondOffre`

### `creeOffre()` — ligne 38

Appelle : `collecteFinie()` *(liaison.js)*, `empaquette()` *(liaisonCode.js)*, `lisSdpLocal()` *(liaisonSdp.js)*, `nouvelleConnexion()` *(liaison.js)*

Appelée par : `prepareOffre`

### `repondOffre()` — ligne 50

Appelle : `collecteFinie()` *(liaison.js)*, `empaquette()` *(liaisonCode.js)*, `lisSdpLocal()` *(liaisonSdp.js)*, `nouvelleConnexion()` *(liaison.js)*, `sdpDistant()` *(liaisonSdp.js)*

Appelée par : `pret`

### `appliqueReponse()` — ligne 60

Appelle : `sdpDistant()` *(liaisonSdp.js)*

Appelée par : `relie`

### `canal()` — ligne 67

N'appelle aucune fonction du projet.

Appelée par : `prepareOffre`, `pret`

### `jetonNeuf()` — ligne 109

N'appelle aucune fonction du projet.

Appelée par : `ajouteInvite`

## js/tableHote.js

### `attendre()` — ligne 22

N'appelle aucune fonction du projet.

Appelée par : `boucleTable`, `mesureBaseForge`

### `signePublic()` — ligne 25

N'appelle aucune fonction du projet.

Appelée par : `boucleTable`

### `siegeDeSource()` — ligne 31

Appelle : `siegeAdversaire()` *(simPreparation.js)*, `siegeDeck()` *(simPreparation.js)*, `siegeDepuisFiches()` *(simPreparation.js)*

Appelée par : `commenceTable`

### `commenceTable()` — ligne 41

Appelle : `agentIA()` *(iaAgent.js)*, `arretsParDefaut()` *(jeuArrets.js)*, `boucleTable()` *(tableHote.js)*, `chargeSimCartes()` *(simCartes.js)*, `chercheFichesScryfall()` *(simCartes.js)*, `creePartie()` *(jeuPilote.js)*, `envoieDebut()` *(tableLiaison.js)*, `fichesDeSource()` *(simPreparation.js)*, `toast()` *(outils.js)*, → `siegeDeSource()` *(tableHote.js)*

Appelée par : `commenceDepuisSalon`

### `boucleTable()` — ligne 66

Appelle : `attendre()` *(tableHote.js)*, `avance()` *(jeuPilote.js)*, `diffuseVues()` *(tableHote.js)*, `doitDemander()` *(jeuArrets.js)*, `oublieTableSauvee()` *(tableReprise.js)*, `poseQuestion()` *(tableHote.js)*, `rendMain()` *(simulation.js)*, `repondre()` *(jeuPilote.js)*, `sauveTable()` *(tableReprise.js)*, `signePublic()` *(tableHote.js)*, `valideReponse()` *(jeuPilote.js)*

Appelée par : `commenceTable`, `confieInvite`, `recoitReponse`, `reprendTable`

### `poseQuestion()` — ligne 92

Appelle : `diffuseVues()` *(tableHote.js)*, `envoieQuestion()` *(tableLiaison.js)*, `questionPourUI()` *(jeuVue.js)*, `renduTable()` *(tableRendu.js)*, `vue()` *(jeuVue.js)*

Appelée par : `boucleTable`

### `recoitReponse()` — ligne 108

Appelle : `boucleTable()` *(tableHote.js)*, `diffuseVues()` *(tableHote.js)*, `envoieErreur()` *(tableLiaison.js)*, `renduTable()` *(tableRendu.js)*, `repondre()` *(jeuPilote.js)*, `reponseRecevable()` *(jeuPilote.js)*

Appelée par : `passeJusquaMonTour`, `recoitDistant`, `repondsTable`

### `diffuseVues()` — ligne 125

Appelle : `envoieVue()` *(tableLiaison.js)*, `renduTable()` *(tableRendu.js)*, `vue()` *(jeuVue.js)*

Appelée par : `boucleTable`, `poseQuestion`, `recoitReponse`, `reprendTable`

### `journalTable()` — ligne 140

N'appelle aucune fonction du projet.

Appelée par : `journalTableLignes`, `nouvellesLignes`

### `majArretsTable()` — ligne 143

N'appelle aucune fonction du projet.

Appelée par : `appliqueArrets`

### `passeJusquaMonTour()` — ligne 150

Appelle : `recoitReponse()` *(tableHote.js)*

Appelée par : `passeTour`, `recoitDistant`

### `quitteTable()` — ligne 158

Appelle : `fermeLiaisons()` *(tableLiaison.js)*, `oublieTableSauvee()` *(tableReprise.js)*, `renduTable()` *(tableRendu.js)*

Appelée par : `gestesTable`

## js/tableRendu.js

### `chargement du module`

Appelle : `alertesInvitesHTML()` *(tableSalon.js)*, `bandeauJoueur()` *(tableRendu.js)*, `chipCarte()` *(tableRendu.js)*, `esc()` *(outils.js)*, `etatChoix()` *(tableQuestions.js)*, `imageCarte()` *(tableRendu.js)*, `manaHTML()` *(symboles.js)*, `perteHoteHTML()` *(tableInvite.js)*

### `imageCarte()` — ligne 17

Appelle : `find()` *(cartes.js)*

Appelée par : `tableRendu.js (chargement)`

### `chipCarte()` — ligne 26

Appelle : `etatChoix()` *(tableQuestions.js)*

Appelée par : `tableRendu.js (chargement)`

### `bandeauJoueur()` — ligne 39

Appelle : `etatJoueur()` *(tableQuestions.js)*

Appelée par : `tableRendu.js (chargement)`

### `pileHTML()` — ligne 58

Appelle : `etatChoix()` *(tableQuestions.js)*

### `journalTableLignes()` — ligne 68

Appelle : `journalTable()` *(tableHote.js)*

Appelée par : `ouvreJournalTable`, `partieHTML`

### `detailHTML()` — ligne 70

N'appelle aucune fonction du projet.

### `partieHTML()` — ligne 83

Appelle : `journalTableLignes()` *(tableRendu.js)*

Appelée par : `renduTable`

### `finHTML()` — ligne 106

N'appelle aucune fonction du projet.

Appelée par : `renduTable`

### `renduTable()` — ligne 114

Appelle : `finHTML()` *(tableRendu.js)*, `partieHTML()` *(tableRendu.js)*, `rejoindreHTML()` *(tableInvite.js)*, `salonHTML()` *(tableSalon.js)*

Appelée par : `ajouteInvite`, `ajouteSiegeIA`, `attaqueTous`, `basculeChoix`, `clicCarte`, `confieInvite`, `diffuseVues`, `etatDistant`, `etatHote`, `gestesTable`, `montreDetail`, `ouvreRejoindre`, `ouvreSalon`, `poseQuestion`, `prepareOffre`, `pret`, `quitteTable`, `recoitDistant`, `recoitHote`, `recoitReponse`, `reglageSalon`, `relie`, `renderAll`, `repondsTable`, `retireSiege`, `scanneOffre`

## js/tableQuestions.js

### `selDe()` — ligne 13

N'appelle aucune fonction du projet.

Appelée par : `attaqueTous`, `clicCarte`, `clicJoueur`, `etatChoix`, `etatJoueur`, `gestesTable`, `questionHTML`, `valideTable`

### `etatChoix()` — ligne 20

Appelle : `etatCombatTable()` *(tableCombat.js)*, `selDe()` *(tableQuestions.js)*

Appelée par : `chipCarte`, `pileHTML`, `tableRendu.js (chargement)`

### `etatJoueur()` — ligne 30

Appelle : `selDe()` *(tableQuestions.js)*

Appelée par : `bandeauJoueur`

### `repondsTable()` — ligne 38

Appelle : `envoieReponse()` *(tableInvite.js)*, `recoitReponse()` *(tableHote.js)*, `renduTable()` *(tableRendu.js)*

Appelée par : `basculeChoix`, `clicCarte`, `gestesTable`, `valideTable`

### `nomVisible()` — ligne 46

N'appelle aucune fonction du projet.

Appelée par : `montreDetail`

### `montreDetail()` — ligne 57

Appelle : `nomVisible()` *(tableQuestions.js)*, `renduTable()` *(tableRendu.js)*

Appelée par : `clicCarte`

### `basculeChoix()` — ligne 64

Appelle : `renduTable()` *(tableRendu.js)*, `repondsTable()` *(tableQuestions.js)*

Appelée par : `clicCarte`, `clicJoueur`, `gestesTable`

### `clicCarte()` — ligne 76

Appelle : `basculeChoix()` *(tableQuestions.js)*, `clicCombat()` *(tableCombat.js)*, `montreDetail()` *(tableQuestions.js)*, `renduTable()` *(tableRendu.js)*, `repondsTable()` *(tableQuestions.js)*, `selDe()` *(tableQuestions.js)*

Appelée par : `gestesTable`

### `clicJoueur()` — ligne 93

Appelle : `basculeChoix()` *(tableQuestions.js)*, `selDe()` *(tableQuestions.js)*

Appelée par : `gestesTable`

### `valideTable()` — ligne 101

Appelle : `repondsTable()` *(tableQuestions.js)*, `selDe()` *(tableQuestions.js)*

Appelée par : `gestesTable`

### `chipsChoix()` — ligne 112

Appelle : `esc()` *(outils.js)*

Appelée par : `questionHTML`

### `questionHTML()` — ligne 121

Appelle : `chipsChoix()` *(tableQuestions.js)*, `combatHTML()` *(tableCombat.js)*, `esc()` *(outils.js)*, `selDe()` *(tableQuestions.js)*

## js/tableCombat.js

### `etatCombatTable()` — ligne 12

N'appelle aucune fonction du projet.

Appelée par : `etatChoix`

### `clicCombat()` — ligne 25

N'appelle aucune fonction du projet.

Appelée par : `clicCarte`

### `combatHTML()` — ligne 46

Appelle : `esc()` *(outils.js)*

Appelée par : `questionHTML`

### `attaqueTous()` — ligne 68

Appelle : `renduTable()` *(tableRendu.js)*, `selDe()` *(tableQuestions.js)*

Appelée par : `gestesTable`

## js/tableSalon.js

### `sourcesDeDecks()` — ligne 11

Appelle : `clesDecks()` *(decks.js)*

Appelée par : `ajouteSiegeIA`, `ouvreSalon`, `salonHTML`

### `nomDeSource()` — ligne 16

N'appelle aucune fonction du projet.

Appelée par : `siegesDuSalon`

### `siegesDuSalon()` — ligne 22

Appelle : `nomDeSource()` *(tableSalon.js)*

Appelée par : `commenceDepuisSalon`

### `salonHTML()` — ligne 30

Appelle : `adressePublique()` *(tableLiaison.js)*, `clesDecks()` *(decks.js)*, `esc()` *(outils.js)*, `optionsHTML()` *(simSection.js)*, `siegeDistantHTML()` *(tableSalon.js)*, `sourcesDeDecks()` *(tableSalon.js)*

Appelée par : `renduTable`

### `siegeDistantHTML()` — ligne 67

Appelle : `esc()` *(outils.js)*, `qrEcrit()` *(qrEcrit.js)*, `qrSVG()` *(qrEcrit.js)*, `texteOffre()` *(tableLiaison.js)*

Appelée par : `salonHTML`

### `alertesInvitesHTML()` — ligne 84

Appelle : `esc()` *(outils.js)*, `qrEcrit()` *(qrEcrit.js)*, `qrSVG()` *(qrEcrit.js)*, `texteOffre()` *(tableLiaison.js)*

Appelée par : `tableRendu.js (chargement)`

### `ouvreSalon()` — ligne 93

Appelle : `renduTable()` *(tableRendu.js)*, `sourcesDeDecks()` *(tableSalon.js)*

Appelée par : `gestesTable`

### `reglageSalon()` — ligne 99

Appelle : `reglageInvite()` *(tableInvite.js)*, `renduTable()` *(tableRendu.js)*, `scheduleSave()` *(stockage.js)*

Appelée par : `app.js (chargement)`

### `ajouteSiegeIA()` — ligne 111

Appelle : `renduTable()` *(tableRendu.js)*, `scheduleSave()` *(stockage.js)*, `sourcesDeDecks()` *(tableSalon.js)*

Appelée par : `gestesTable`

### `retireSiege()` — ligne 118

Appelle : `oublieDistant()` *(tableLiaison.js)*, `renduTable()` *(tableRendu.js)*, `scheduleSave()` *(stockage.js)*

Appelée par : `gestesTable`

### `commenceDepuisSalon()` — ligne 126

Appelle : `commenceTable()` *(tableHote.js)*, `siegesDuSalon()` *(tableSalon.js)*

Appelée par : `gestesTable`

## js/tableLiaison.js

### `adressePublique()` — ligne 19

N'appelle aucune fonction du projet.

Appelée par : `salonHTML`, `texteOffre`

### `texteOffre()` — ligne 25

Appelle : `adressePublique()` *(tableLiaison.js)*, `base64url()` *(liaisonCode.js)*

Appelée par : `alertesInvitesHTML`, `siegeDistantHTML`

### `videoTable()` — ligne 29

N'appelle aucune fonction du projet.

Appelée par : `ajouteInvite`, `montreVideo`, `repriseInvite`, `scanneOffre`, `scanneReponses`

### `montreVideo()` — ligne 35

Appelle : `videoTable()` *(tableLiaison.js)*

Appelée par : `ajouteInvite`, `etatDistant`, `fermeLiaisons`, `lienOffreColle`, `repriseInvite`, `scanneOffre`

### `ajouteInvite()` — ligne 38

Appelle : `arretsParDefaut()` *(jeuArrets.js)*, `jetonNeuf()` *(liaison.js)*, `montreVideo()` *(tableLiaison.js)*, `ouvreCamera()` *(camera.js)*, `prepareOffre()` *(tableLiaison.js)*, `renduTable()` *(tableRendu.js)*, `scanneReponses()` *(tableLiaison.js)*, `videoTable()` *(tableLiaison.js)*

Appelée par : `gestesTable`

### `prepareOffre()` — ligne 51

Appelle : `canal()` *(liaison.js)*, `creeOffre()` *(liaison.js)*, `etatDistant()` *(tableLiaison.js)*, `recoitDistant()` *(tableLiaison.js)*, `renduTable()` *(tableRendu.js)*

Appelée par : `ajouteInvite`, `repriseInvite`

### `scanneReponses()` — ligne 60

Appelle : `relie()` *(tableLiaison.js)*, `sautReponse()` *(tableLiaison.js)*, `scanne()` *(camera.js)*, `videoTable()` *(tableLiaison.js)*

Appelée par : `ajouteInvite`, `repriseInvite`

### `sautReponse()` — ligne 72

Appelle : `deBase45()` *(liaisonCode.js)*, `deCodeATaper()` *(liaisonCode.js)*, `depaquette()` *(liaisonCode.js)*

Appelée par : `relieCode`, `scanneReponses`

### `relie()` — ligne 80

Appelle : `appliqueReponse()` *(liaison.js)*, `renduTable()` *(tableRendu.js)*, `toast()` *(outils.js)*

Appelée par : `relieCode`, `scanneReponses`

### `relieCode()` — ligne 88

Appelle : `relie()` *(tableLiaison.js)*, `sautReponse()` *(tableLiaison.js)*, `toast()` *(outils.js)*

Appelée par : `gestesTable`

### `etatDistant()` — ligne 95

Appelle : `fermeCamera()` *(camera.js)*, `montreVideo()` *(tableLiaison.js)*, `renduTable()` *(tableRendu.js)*, `renvoieTout()` *(tableLiaison.js)*

Appelée par : `prepareOffre`

### `recoitDistant()` — ligne 104

Appelle : `arretsParDefaut()` *(jeuArrets.js)*, `passeJusquaMonTour()` *(tableHote.js)*, `recoitReponse()` *(tableHote.js)*, `renduTable()` *(tableRendu.js)*

Appelée par : `prepareOffre`

### `envoieDebut()` — ligne 120

Appelle : `envoieVue()` *(tableLiaison.js)*, `gardeEveil()` *(tableLiaison.js)*

Appelée par : `commenceTable`

### `nouvellesLignes()` — ligne 125

Appelle : `journalTable()` *(tableHote.js)*

Appelée par : `envoieQuestion`, `envoieVue`

### `envoieVue()` — ligne 131

Appelle : `nouvellesLignes()` *(tableLiaison.js)*, `vue()` *(jeuVue.js)*

Appelée par : `diffuseVues`, `envoieDebut`, `renvoieTout`

### `envoieQuestion()` — ligne 135

Appelle : `nouvellesLignes()` *(tableLiaison.js)*, `questionPourUI()` *(jeuVue.js)*, `vue()` *(jeuVue.js)*

Appelée par : `poseQuestion`, `renvoieTout`

### `envoieErreur()` — ligne 139

N'appelle aucune fonction du projet.

Appelée par : `recoitReponse`

### `renvoieTout()` — ligne 142

Appelle : `envoieQuestion()` *(tableLiaison.js)*, `envoieVue()` *(tableLiaison.js)*

Appelée par : `etatDistant`

### `repriseInvite()` — ligne 152

Appelle : `montreVideo()` *(tableLiaison.js)*, `ouvreCamera()` *(camera.js)*, `prepareOffre()` *(tableLiaison.js)*, `scanneReponses()` *(tableLiaison.js)*, `videoTable()` *(tableLiaison.js)*

Appelée par : `gestesTable`

### `confieInvite()` — ligne 162

Appelle : `boucleTable()` *(tableHote.js)*, `renduTable()` *(tableRendu.js)*

Appelée par : `gestesTable`

### `oublieDistant()` — ligne 170

N'appelle aucune fonction du projet.

Appelée par : `fermeLiaisons`, `retireSiege`

### `fermeLiaisons()` — ligne 176

Appelle : `fermeCamera()` *(camera.js)*, `montreVideo()` *(tableLiaison.js)*, → `oublieDistant()` *(tableLiaison.js)*

Appelée par : `quitteTable`

### `gardeEveil()` — ligne 185

N'appelle aucune fonction du projet.

Appelée par : `envoieDebut`, `pret`

## js/tableInvite.js

### `lisOffreTexte()` — ligne 14

Appelle : `deBase64url()` *(liaisonCode.js)*, `depaquette()` *(liaisonCode.js)*

Appelée par : `lienOffreColle`, `rejoindreDepuisAdresse`, `scanneOffre`

### `rejoindreDepuisAdresse()` — ligne 22

Appelle : `lisOffreTexte()` *(tableInvite.js)*, `ouvreRejoindre()` *(tableInvite.js)*

Appelée par : `demarrer`

### `ouvreRejoindre()` — ligne 30

Appelle : `pret()` *(tableInvite.js)*, `renduTable()` *(tableRendu.js)*, `scanneOffre()` *(tableInvite.js)*

Appelée par : `gestesTable`, `lienOffreColle`, `rejoindreDepuisAdresse`, `scanneOffre`

### `scanneOffre()` — ligne 39

Appelle : `fermeCamera()` *(camera.js)*, `lisOffreTexte()` *(tableInvite.js)*, `montreVideo()` *(tableLiaison.js)*, `ouvreCamera()` *(camera.js)*, `ouvreRejoindre()` *(tableInvite.js)*, `renduTable()` *(tableRendu.js)*, `scanne()` *(camera.js)*, `videoTable()` *(tableLiaison.js)*

Appelée par : `ouvreRejoindre`

### `lienOffreColle()` — ligne 50

Appelle : `fermeCamera()` *(camera.js)*, `lisOffreTexte()` *(tableInvite.js)*, `montreVideo()` *(tableLiaison.js)*, `ouvreRejoindre()` *(tableInvite.js)*, `toast()` *(outils.js)*

Appelée par : `gestesTable`

### `reglageInvite()` — ligne 58

Appelle : `scheduleSave()` *(stockage.js)*

Appelée par : `reglageSalon`

### `pret()` — ligne 65

Appelle : `canal()` *(liaison.js)*, `chargeSimCartes()` *(simCartes.js)*, `chercheFichesScryfall()` *(simCartes.js)*, `fichesDeDeck()` *(simPreparation.js)*, `gardeEveil()` *(tableLiaison.js)*, `renduTable()` *(tableRendu.js)*, `repondOffre()` *(liaison.js)*, → `etatHote()` *(tableInvite.js)*, → `recoitHote()` *(tableInvite.js)*

Appelée par : `gestesTable`, `ouvreRejoindre`

### `etatHote()` — ligne 82

Appelle : `renduTable()` *(tableRendu.js)*

Appelée par : `pret`

### `recoitHote()` — ligne 91

Appelle : `renduTable()` *(tableRendu.js)*

Appelée par : `pret`

### `envoieReponse()` — ligne 102

N'appelle aucune fonction du projet.

Appelée par : `repondsTable`

### `envoieArrets()` — ligne 103

N'appelle aucune fonction du projet.

Appelée par : `appliqueArrets`

### `envoiePasseTour()` — ligne 104

N'appelle aucune fonction du projet.

Appelée par : `passeTour`

### `perteHoteHTML()` — ligne 107

N'appelle aucune fonction du projet.

Appelée par : `tableRendu.js (chargement)`

### `rejoindreHTML()` — ligne 113

Appelle : `base45()` *(liaisonCode.js)*, `clesDecks()` *(decks.js)*, `codeATaper()` *(liaisonCode.js)*, `esc()` *(outils.js)*, `optionsHTML()` *(simSection.js)*, `qrEcrit()` *(qrEcrit.js)*, `qrSVG()` *(qrEcrit.js)*

Appelée par : `renduTable`

## js/tableReprise.js

### `sauveTable()` — ligne 18

Appelle : `idbEcrire()` *(idb.js)*

Appelée par : `boucleTable`

### `oublieTableSauvee()` — ligne 29

Appelle : `idbOublier()` *(idb.js)*

Appelée par : `boucleTable`, `quitteTable`

### `chercheTableSauvee()` — ligne 37

Appelle : `idbLire()` *(idb.js)*, `renderK()` *(simSection.js)*

Appelée par : `demarrer`

### `reprendTable()` — ligne 43

Appelle : `agentIA()` *(iaAgent.js)*, `avance()` *(jeuPilote.js)*, `boucleTable()` *(tableHote.js)*, `creePartie()` *(jeuPilote.js)*, `diffuseVues()` *(tableHote.js)*, `repondre()` *(jeuPilote.js)*, `siegeDepuisFiches()` *(simPreparation.js)*

Appelée par : `gestesTable`

## js/fenArrets.js

### `corpsArrets()` — ligne 12

Appelle : `arretsParDefaut()` *(jeuArrets.js)*, `avecBrouillon()` *(brouillon.js)*, `esc()` *(outils.js)*

Appelée par : `ouvreArrets`

### `ouvreArrets()` — ligne 26

Appelle : `corpsArrets()` *(fenArrets.js)*, `openDialog()` *(dialogue.js)*, `ouvreBrouillon()` *(brouillon.js)*

Appelée par : `gestesTable`

### `caseArret()` — ligne 34

Appelle : `arretsParDefaut()` *(jeuArrets.js)*, `modifieBrouillon()` *(brouillon.js)*

Appelée par : `app.js (chargement)`

### `arretsDefaut()` — ligne 43

Appelle : `arretsParDefaut()` *(jeuArrets.js)*, `modifieBrouillon()` *(brouillon.js)*

Appelée par : `gestesTable`

### `appliqueArrets()` — ligne 48

Appelle : `closeDialog()` *(dialogue.js)*, `envoieArrets()` *(tableInvite.js)*, `majArretsTable()` *(tableHote.js)*, `scheduleSave()` *(stockage.js)*, `verseBrouillon()` *(brouillon.js)*

Appelée par : `gestesTable`

## js/gestesTable.js

### `gestesTable()` — ligne 8

Appelle : `ajouteInvite()` *(tableLiaison.js)*, `ajouteSiegeIA()` *(tableSalon.js)*, `appliqueArrets()` *(fenArrets.js)*, `arretsDefaut()` *(fenArrets.js)*, `attaqueTous()` *(tableCombat.js)*, `basculeChoix()` *(tableQuestions.js)*, `clicCarte()` *(tableQuestions.js)*, `clicJoueur()` *(tableQuestions.js)*, `commenceDepuisSalon()` *(tableSalon.js)*, `confieInvite()` *(tableLiaison.js)*, `lienOffreColle()` *(tableInvite.js)*, `ouvreArrets()` *(fenArrets.js)*, `ouvreJournalTable()` *(gestesTable.js)*, `ouvreRejoindre()` *(tableInvite.js)*, `ouvreSalon()` *(tableSalon.js)*, `passeTour()` *(gestesTable.js)*, `pret()` *(tableInvite.js)*, `quitteTable()` *(tableHote.js)*, `relieCode()` *(tableLiaison.js)*, `renduTable()` *(tableRendu.js)*, `repondsTable()` *(tableQuestions.js)*, `reprendTable()` *(tableReprise.js)*, `repriseInvite()` *(tableLiaison.js)*, `retireSiege()` *(tableSalon.js)*, `selDe()` *(tableQuestions.js)*, `valideTable()` *(tableQuestions.js)*

Appelée par : `app.js (chargement)`

### `passeTour()` — ligne 46

Appelle : `envoiePasseTour()` *(tableInvite.js)*, `passeJusquaMonTour()` *(tableHote.js)*

Appelée par : `gestesTable`

### `ouvreJournalTable()` — ligne 52

Appelle : `esc()` *(outils.js)*, `journalTableLignes()` *(tableRendu.js)*, `openDialog()` *(dialogue.js)*

Appelée par : `gestesTable`

## js/app.js

### `chargement du module`

Appelle : `appliquerBudget()` *(fenBudget.js)*, `appliquerFiltres()` *(fenFiltres.js)*, `apresReglage()` *(brouillon.js)*, `basculeTheme()` *(theme.js)*, `cacherApercu()` *(apercu.js)*, `caseArret()` *(fenArrets.js)*, `closeDialog()` *(dialogue.js)*, `demarrer()` *(app.js)*, `fermetureBrouillon()` *(brouillon.js)*, `ficheVoisine()` *(ficheParcours.js)*, `fmt()` *(outils.js)*, `gestesNuageChange()` *(gestesNuage.js)*, `glisseColonnes()` *(fenAffichage.js)*, `invaliderCandidats()` *(candidats.js)*, `majApercuAdversaire()` *(fenAdversaire.js)*, `majApercuComportement()` *(fenComportement.js)*, `majFiltre()` *(filtres.js)*, `majListeArchetypes()` *(fenListes.js)*, `majListeSets()` *(fenListes.js)*, `majResultats()` *(fenAjout.js)*, `majResumeFiltres()` *(fenFiltres.js)*, `majResumeFormat()` *(fenFormat.js)*, `modifieBrouillon()` *(brouillon.js)*, `molletteRecherche()` *(rechercheSection.js)*, `montrerApercu()` *(apercu.js)*, `placerApercu()` *(apercu.js)*, `refreshSuggestions()` *(suggestions.js)*, `reglageAffichage()` *(fenAffichage.js)*, `reglageSalon()` *(tableSalon.js)*, `reglageSimulation()` *(gestesSimulation.js)*, `reglerCible()` *(legalite.js)*, `renderAll()` *(rendu.js)*, `renderE()` *(deckSection.js)*, `saisieBudget()` *(fenBudget.js)*, `saisieDeck()` *(gestesDecks.js)*, `saisieRecherche()` *(rechercheSection.js)*, `toast()` *(outils.js)*, → `gestesDeck()` *(gestesDeck.js)*, → `gestesDeckConfig()` *(gestesDecks.js)*, → `gestesDecks()` *(gestesDecks.js)*, → `gestesDonnees()` *(gestesDonnees.js)*, → `gestesForge()` *(forgeVue.js)*, → `gestesGraphe()` *(gestesGraphe.js)*, → `gestesNuage()` *(gestesNuage.js)*, → `gestesReglages()` *(gestesReglages.js)*, → `gestesSimulation()` *(gestesSimulation.js)*, → `gestesTable()` *(gestesTable.js)*, → `gestesVue()` *(gestesVue.js)*, → `majHauteurEntete()` *(entete.js)*

### `demarrer()` — ligne 261

Appelle : `archetypesARevoir()` *(edhrecThemes.js)*, `chargerArchetypesEdhrec()` *(edhrecThemes.js)*, `chargerGameChangers()` *(gameChangers.js)*, `chargerSauvegarde()` *(stockage.js)*, `chercheTableSauvee()` *(tableReprise.js)*, `demarreForge()` *(forgeDepot.js)*, `demarrerCatalogue()` *(catalogue.js)*, `gameChangersARevoir()` *(gameChangers.js)*, `initBuiltin()` *(cartes.js)*, `loadSymbology()` *(symboles.js)*, `nuageDemarrer()` *(nuage.js)*, `rejoindreDepuisAdresse()` *(tableInvite.js)*, `renderAll()` *(rendu.js)*, `reprendTheme()` *(theme.js)*, `reprendreArchetypesEdhrec()` *(edhrecThemes.js)*, `reprendreGameChangers()` *(gameChangers.js)*, `reprendreSets()` *(sets.js)*, `restore()` *(stockage.js)*, `verifieDecksLies()` *(decksLies.js)*

Appelée par : `app.js (chargement)`

