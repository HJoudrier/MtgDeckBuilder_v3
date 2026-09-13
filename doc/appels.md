# Qui appelle qui

*Écrit par `node outils/genAppels.js` à partir des sources — ne pas modifier à la main.*

Pour chaque fonction : le fichier où elle est définie, les fonctions du projet qu'elle
appelle, et celles qui l'appellent. Trois façons d'appeler, notées différemment — un appel
direct sans marque, un appel **différé** (une fonction passée en rappel) précédé de « → »,
un appel depuis un **gestionnaire HTML** produit par l'atelier précédé de « ⌘ ». Les graphes
correspondants sont dans `doc/graphe-fonctions.dot` et `doc/graphe-modules.dot`.

**636 fonctions** dans 98 modules, **1758 appels** relevés.

## Fonctions que personne n'appelle

Points d'entrée — appelées depuis le HTML, depuis un écouteur — ou code mort.

- `nuageFond()` *(nuagePaquet.js)*
- `poseCouleursCommandant()` *(restrictions.js)*

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

## js/mana.js

### `ordonneMana()` — ligne 28

N'appelle aucune fonction du projet.

Appelée par : `applyScryfall`, `getCardOrAnalyzedRec`, `manaProduitTexte`

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

Appelle : `buildCard()` *(cartes.js)*, `norm()` *(cartes.js)*, `registerCard()` *(cartes.js)*

### `norm()` — ligne 17

N'appelle aucune fonction du projet.

Appelée par : `appliqueCatalogueAuxCartes`, `applyScryfall`, `archetypesCarte`, `cartes.js (chargement)`, `chargerGameChangers`, `chercheCartes`, `chercheScryfall`, `completeUnknown`, `edhrecAllFor`, `edhrecFor`, `estGameChanger`, `fetchEdhrecCommander`, `ficheHTML`, `filtresValeursOK`, `find`, `gestesGraphe`, `indexCard`, `loose`, `majResultats`, `nbInteractions`, `nomsPageEdhrec`, `noteCarte`, `noteSetIndex`, `parseMtgoList`, `propositionsHTML`, `registerCard`, `renameCard`, `resultatsHTML`, `retiens`, `saisieRecherche`, `scryTarget`, `setsCarte`, `setsRec`, `snapshot`, `unindexCard`, `valeursRec`

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

Appelée par : `aAcheter`, `addToDeck`, `ajoutCollection`, `annexeEntries`, `appliqueCatalogueAuxCartes`, `applyScryfall`, `basculerSourceVersions`, `buyCard`, `carteDuCatalogue`, `chargerCatalogue`, `choisirVersion`, `collectionCards`, `commandantsPrincipaux`, `completeUnknown`, `contexteEvaluation`, `couleursRestriction`, `coutDeck`, `deckEntries`, `demandesTousDecks`, `deplacerCarte`, `faireDefilerVersion`, `ficheImageKO`, `gestesDeck`, `gestesGraphe`, `getCardOrAnalyzedRec`, `legality`, `loadEdhrec`, `majApercu`, `majPrix`, `montrerApercu`, `nomCanonique`, `openCardModal`, `openImport`, `panneauEdhrec`, `poseCouleursCommandant`, `propositionsHTML`, `quantiteCollection`, `requeteCatalogue`, `restaureDecks`, `restore`, `resultatsHTML`, `selectionCandidats`, `signatureCommandants`, `versAnnexe`, `vivierSuggestions`, `wishlist`, `zoneCommandant`

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

### `initBuiltin()` — ligne 155

Appelle : `buildCard()` *(cartes.js)*, `registerCard()` *(cartes.js)*

Appelée par : `demarrer`

### `frontFace()` — ligne 165

N'appelle aucune fonction du projet.

Appelée par : `archetypesCarte`, `chargerGameChangers`, `chargerSetScryfall`, `chercheTexte`, `chercheVerso`, `completeUnknown`, `edhrecAllFor`, `edhrecFor`, `edhrecSlug`, `estGameChanger`, `fetchEdhrecCommander`, `scryTarget`, `setsCarte`, `setsRec`, `valeursRec`

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

Appelée par : `cardTile`, `ficheHTML`, `noteCarte`, `tagsSuggestion`

### `primeLiensLarges()` — ligne 71

N'appelle aucune fonction du projet.

Appelée par : `noteCarte`

## js/etat.js

### `ongletDeSection()` — ligne 80

N'appelle aucune fonction du projet.

Appelée par : `entete.js (chargement)`, `signalerTravail`

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

Appelée par : `bilanWishlist`, `deckCourant`, `demandesTousDecks`, `renderI`, `renderJ`, `renderTop`, `restaureDecks`, `signatureAchats`, `snapshot`, `supprimerDeck`, `vignetteDeck`

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

### `catalogueAbsent()` — ligne 23

N'appelle aucune fonction du projet.

Appelée par : `demarrerCatalogue`, `majCatalogue`

### `noeudsActifs()` — ligne 27

N'appelle aucune fonction du projet.

Appelée par : `blocGraphe`, `chercheCartes`, `ligneCatalogue`, `noteCarte`, `renderD`, `renderG`, `resultatsHTML`, `selectionCandidats`, `signatureCandidats`, `vivierSuggestions`

### `carteTouche()` — ligne 31

N'appelle aucune fonction du projet.

Appelée par : `chercheCartes`, `noteCarte`, `recToucheNoeuds`, `renderD`, `vivierSuggestions`

### `getCardOrAnalyzedRec()` — ligne 43

Appelle : `buildCard()` *(cartes.js)*, `find()` *(cartes.js)*, `ordonneMana()` *(mana.js)*

Appelée par : `chercheCartes`, `recToucheNoeuds`

### `recToucheNoeuds()` — ligne 62

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

## js/scryfallApplique.js

### `scryTarget()` — ligne 10

Appelle : `frontFace()` *(cartes.js)*, `loose()` *(cartes.js)*, `norm()` *(cartes.js)*

Appelée par : `completeUnknown`, `majPrix`, `runScryQueue`

### `applyScryfall()` — ligne 21

Appelle : `buildCard()` *(cartes.js)*, `cleImpression()` *(impressions.js)*, `codeLegalite()` *(retenue.js)*, `completeImpression()` *(impressions.js)*, `find()` *(cartes.js)*, `loose()` *(cartes.js)*, `majTexteOracle()` *(cartes.js)*, `norm()` *(cartes.js)*, `ordonneMana()` *(mana.js)*, `reanalyser()` *(categories.js)*, `registerCard()` *(cartes.js)*, `renameCard()` *(cartes.js)*

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

Appelle : `carteDansUnDeck()` *(decks.js)*, `clesDecks()` *(decks.js)*, `impressionSnap()` *(stockage.js)*, `norm()` *(cartes.js)*, → `deckSnap()` *(decksStockage.js)*

Appelée par : `gestesDonnees`, `nuagePaquet`, `save`

### `ecrire()` — ligne 119

N'appelle aucune fonction du projet.

Appelée par : `save`

### `save()` — ligne 123

Appelle : `ecrire()` *(stockage.js)*, `nuagePousseeDifferee()` *(nuage.js)*, `snapshot()` *(stockage.js)*, `toast()` *(outils.js)*

Appelée par : `brancherRestauration`, `brancherSauvegarde`, `gestesDonnees`, `gestesNuage`, `nuageTour`, `scheduleSave`

### `scheduleSave()` — ligne 154

Appelle : → `save()` *(stockage.js)*

Appelée par : `appliqueCatalogueAuxCartes`, `appliquerAffichage`, `basculeTheme`, `brancherCatalogue`, `chercheTexte`, `chercheVerso`, `choisirVersion`, `entete.js (chargement)`, `gestesDeck`, `gestesDecks`, `gestesDonnees`, `renderAll`, `runScryQueue`

### `restore()` — ligne 160

Appelle : `buildCard()` *(cartes.js)*, `find()` *(cartes.js)*, `impressionRestore()` *(stockage.js)*, `majTexteOracle()` *(cartes.js)*, `reanalyser()` *(categories.js)*, `registerCard()` *(cartes.js)*, `restaureDecks()` *(decksStockage.js)*

Appelée par : `brancherRestauration`, `demarrer`, `nuageVerse`

### `chargerSauvegarde()` — ligne 264

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

### `idb()` — ligne 20

N'appelle aucune fonction du projet.

Appelée par : `idbEcrire`, `idbLire`, `idbOublier`, `idbVider`

### `idbLire()` — ligne 30

Appelle : `idb()` *(idb.js)*

Appelée par : `chargerCatalogueComplet`, `nuageBaseLire`, `reprendreArchetypesEdhrec`, `reprendreGameChangers`, `reprendreSets`

### `idbEcrire()` — ligne 38

Appelle : `idb()` *(idb.js)*

Appelée par : `lireCatalogueFichier`, `nuageBaseEcrire`, `sauverArchetypesEdhrec`, `sauverGameChangers`, `sauverSets`

### `idbOublier()` — ligne 47

Appelle : `idb()` *(idb.js)*

Appelée par : `gestesDonnees`, `nuageDeconnecte`

### `idbVider()` — ligne 57

Appelle : `idb()` *(idb.js)*

Appelée par : `brancherCatalogue`, `brancherSauvegarde`, `gestesDonnees`

## js/nuagePaquet.js

### `nuagePaquet()` — ligne 47

Appelle : `snapshot()` *(stockage.js)*

Appelée par : `nuageTour`

### `nuageFond()` — ligne 66

N'appelle aucune fonction du projet.

### `nuageVerse()` — ligne 76

Appelle : `restore()` *(stockage.js)*

Appelée par : `nuageTour`

### `nuageComprime()` — ligne 92

N'appelle aucune fonction du projet.

Appelée par : `nuageEmballe`

### `nuageDecomprime()` — ligne 100

N'appelle aucune fonction du projet.

Appelée par : `nuageDeballe`

### `nuageEmballe()` — ligne 110

Appelle : `nuageComprime()` *(nuagePaquet.js)*

Appelée par : `nuageTour`

### `nuageDeballe()` — ligne 114

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

Appelle : `codeLegalite()` *(retenue.js)*

Appelée par : `lireCatalogueFichier`

### `autoCatalogue()` — ligne 48

N'appelle aucune fonction du projet.

Appelée par : `demarrerCatalogue`

### `estGzip()` — ligne 62

N'appelle aucune fonction du projet.

Appelée par : `fluxTexte`

### `compteurOctets()` — ligne 69

N'appelle aucune fonction du projet.

Appelée par : `fluxTexte`

### `nouveauSuivi()` — ligne 84

Appelle : `majBoiteCatalogue()` *(boiteCatalogue.js)*

Appelée par : `brancherCatalogue`, `telechargerCatalogue`

### `fluxTexte()` — ligne 101

Appelle : `compteurOctets()` *(archive.js)*, `estGzip()` *(archive.js)*

Appelée par : `lireCatalogueFichier`

### `fusionneSets()` — ligne 124

N'appelle aucune fonction du projet.

Appelée par : `retiens`

### `retiens()` — ligne 137

Appelle : `fusionneSets()` *(archive.js)*, `norm()` *(cartes.js)*

Appelée par : `lireCatalogueFichier`

### `tailleEstimee()` — ligne 148

N'appelle aucune fonction du projet.

Appelée par : `chargerCatalogueComplet`, `lireCatalogueFichier`

### `ArchiveAbandonnee()` — ligne 158

N'appelle aucune fonction du projet.

Appelée par : `lireCatalogueFichier`

### `lireCatalogueFichier()` — ligne 160

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

Appelée par : `activerDeck`, `app.js (chargement)`, `apresReglage`, `brancherCatalogue`, `chargerCatalogueComplet`, `gestesDeck`, `gestesDonnees`, `gestesGraphe`, `gestesVue`, `lireCatalogueFichier`, `saisieBudget`, `supprimerDeck`, `verseBrouillon`

### `signatureCandidats()` — ligne 86

Appelle : `noeudsActifs()` *(catalogueEtat.js)*, `restrictionsDuDeck()` *(restrictions.js)*

Appelée par : `candidatsCatalogue`, `prechauffeCandidats`, `recalculLong`, `signatureSuggestions`

### `appliqueCatalogueAuxCartes()` — ligne 97

Appelle : `annexeListe()` *(annexes.js)*, `completeDepuisRec()` *(candidats.js)*, `find()` *(cartes.js)*, `norm()` *(cartes.js)*, `noterLegalArchive()` *(candidats.js)*, `noterSetsArchive()` *(candidats.js)*, `scheduleSave()` *(stockage.js)*

Appelée par : `chargerCatalogueComplet`, `lireCatalogueFichier`

### `selectionCandidats()` — ligne 127

Appelle : `colorOK()` *(collection.js)*, `filtreOKRec()` *(retenue.js)*, `find()` *(cartes.js)*, `fmt()` *(outils.js)*, `noeudsActifs()` *(catalogueEtat.js)*, `prixBrutMax()` *(marche.js)*, `recToucheNoeuds()` *(catalogueEtat.js)*, `restrictionOKRec()` *(restrictions.js)*

Appelée par : `candidatsCatalogue`, `prechauffeCandidats`

### `candidatsCatalogue()` — ligne 170

Appelle : `selectionCandidats()` *(candidats.js)*, `signatureCandidats()` *(candidats.js)*, → `carteDuCatalogue()` *(candidats.js)*

Appelée par : `statsCandidats`, `vivierSuggestions`

### `prechauffeCandidats()` — ligne 183

Appelle : `carteDuCatalogue()` *(candidats.js)*, `selectionCandidats()` *(candidats.js)*, `signatureCandidats()` *(candidats.js)*

Appelée par : `filtrerAvecProgression`, `recalculerAvecProgression`

### `statsCandidats()` — ligne 206

Appelle : `candidatsCatalogue()` *(candidats.js)*

Appelée par : `ligneCatalogue`

### `requeteCatalogue()` — ligne 212

Appelle : `find()` *(cartes.js)*, `fmt()` *(outils.js)*

Appelée par : `chargerCatalogue`, `signatureCatalogue`

### `signatureCatalogue()` — ligne 221

Appelle : `requeteCatalogue()` *(candidats.js)*

Appelée par : `chargerCatalogue`

### `chargerCatalogue()` — ligne 223

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

Appelée par : `currentSuggestions`, `filetSuggestions`, `prepareSuggestions`, `recalculLong`

### `currentSuggestions()` — ligne 161

Appelle : `noterVivier()` *(vivier.js)*, `ordonneSuggestions()` *(vivier.js)*, `signatureSuggestions()` *(vivier.js)*, `suggestionsAJour()` *(vivier.js)*, `vivierSuggestions()` *(vivier.js)*

Appelée par : `classementDecale`, `graphCards`, `suggestionsAffichees`

### `prepareSuggestions()` — ligne 176

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

Appelle : `filetSuggestions()` *(suggestions.js)*, `lanceEdhrecSiBesoin()` *(suggestions.js)*, `renderF()` *(suggestions.js)*, `renderG()` *(suggestions.js)*, `renderH()` *(suggestions.js)*, `selectionSuggestions()` *(sugListes.js)*

Appelée par : `brancherCatalogue`, `chargerCatalogue`, `chargerCatalogueComplet`, `gestesDeck`, `gestesGraphe`, `lireCatalogueFichier`, `loadEdhrec`, `refreshSuggestions`, `renderAll`, `telechargerCatalogue`, `verifierMajCatalogue`

### `renderG()` — ligne 194

Appelle : `blocGraphe()` *(sugGraphe.js)*, `filetSuggestions()` *(suggestions.js)*, `majHint()` *(suggestions.js)*, `noeudsActifs()` *(catalogueEtat.js)*, `poseCorps()` *(suggestions.js)*, `selectionSuggestions()` *(sugListes.js)*

Appelée par : `renderSuggestions`

### `renderH()` — ligne 206

Appelle : `blocEdhrec()` *(sugEdhrec.js)*, `filetSuggestions()` *(suggestions.js)*, `fmt()` *(outils.js)*, `lanceEdhrecSiBesoin()` *(suggestions.js)*, `majHint()` *(suggestions.js)*, `panneauEdhrec()` *(sugCommandants.js)*, `poseCorps()` *(suggestions.js)*, `selectionSuggestions()` *(sugListes.js)*

Appelée par : `renderSuggestions`

### `renderF()` — ligne 219

Appelle : `filetSuggestions()` *(suggestions.js)*, `ligneCatalogue()` *(suggestions.js)*, `listeSuggestions()` *(sugCatalogue.js)*, `majHint()` *(suggestions.js)*, `poseCorps()` *(suggestions.js)*, `selectionSuggestions()` *(sugListes.js)*

Appelée par : `renderSuggestions`

### `refreshSuggestions()` — ligne 229

Appelle : `renderSuggestions()` *(suggestions.js)*, `renderTop()` *(entete.js)*

Appelée par : `app.js (chargement)`, `appliquerAffichage`, `gestesReglages`, `saisieBudget`

### `lanceEdhrecSiBesoin()` — ligne 236

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

Appelée par : `openImport`

### `openImport()` — ligne 92

Appelle : `annexeListe()` *(annexes.js)*, `buildCard()` *(cartes.js)*, `closeDialog()` *(dialogue.js)*, `completeUnknown()` *(scryfall.js)*, `deckAdd()` *(deck.js)*, `deckEntries()` *(deck.js)*, `eur()` *(outils.js)*, `find()` *(cartes.js)*, `fmt()` *(outils.js)*, `noterImpression()` *(impressions.js)*, `openDialog()` *(dialogue.js)*, `parseMtgoList()` *(fenImport.js)*, `recalculerAvecProgression()` *(recalcul.js)*, `registerCard()` *(cartes.js)*, `spent()` *(achats.js)*, `toast()` *(outils.js)*

Appelée par : `gestesDonnees`

## js/fenAjout.js

### `ajouterCarte()` — ligne 9

Appelle : `deckAdd()` *(deck.js)*, `fmt()` *(outils.js)*, `recalculerAvecProgression()` *(recalcul.js)*, `toast()` *(outils.js)*, `versAnnexe()` *(annexes.js)*

Appelée par : `gestesGraphe`

### `chercheCartes()` — ligne 25

Appelle : `carteTouche()` *(catalogueEtat.js)*, `colorOK()` *(collection.js)*, `getCardOrAnalyzedRec()` *(catalogueEtat.js)*, `noeudsActifs()` *(catalogueEtat.js)*, `norm()` *(cartes.js)*, `recToucheNoeuds()` *(catalogueEtat.js)*

Appelée par : `propositionsHTML`, `resultatsHTML`

### `resultatsHTML()` — ligne 61

Appelle : `chercheCartes()` *(fenAjout.js)*, `esc()` *(outils.js)*, `find()` *(cartes.js)*, `noeudsActifs()` *(catalogueEtat.js)*, `norm()` *(cartes.js)*

Appelée par : `majResultats`, `openAdd`

### `majResultats()` — ligne 96

Appelle : `chercheScryfall()` *(recherches.js)*, `norm()` *(cartes.js)*, `resultatsHTML()` *(fenAjout.js)*

Appelée par : `app.js (chargement)`, `gestesGraphe`, `majRecherches`

### `openAdd()` — ligne 107

Appelle : `esc()` *(outils.js)*, `openDialog()` *(dialogue.js)*, `resultatsHTML()` *(fenAjout.js)*

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

## js/outils.js

### `esc()` — ligne 10

N'appelle aucune fonction du projet.

Appelée par : `acteSuggestion`, `actesAnnexe`, `barreCatalogue`, `blocAchats`, `blocAnnexe`, `blocCatalogue`, `blocEdhrec`, `blocGraphe`, `blocVersions`, `cardRow`, `cardTile`, `champBudget`, `champDeck`, `champRecherche`, `corpsAffichage`, `corpsBoiteRecalcul`, `corpsBudget`, `corpsCibles`, `corpsDeck`, `corpsFiltres`, `corpsFormat`, `corpsSauvegarde`, `decksDemandeurs`, `enteteFiche`, `enveloppeGroupe`, `etatArchetypes`, `etatSets`, `exportModal`, `ficheHTML`, `ficheTexteHTML`, `gauge`, `gestesDeck`, `gestesDecks`, `lienDecksEdhrec`, `ligneAchats`, `ligneCatalogue`, `ligneCausesCollection`, `ligneCible`, `ligneCommandant`, `ligneEnLigne`, `ligneFiltre`, `ligneGameChangers`, `ligneMana`, `ligneProposition`, `ligneRestriction`, `ligneWishlist`, `listeArchetypesHTML`, `listeSetsHTML`, `majApercu`, `majBoutonAffichage`, `montrerApercu`, `nuageConflits`, `nuageCorpsConnecte`, `nuageCorpsDeconnecte`, `nuageDetail`, `nuageEtatLigne`, `nuageOu`, `openAdd`, `openCardModal`, `openDialog`, `openWantsModal`, `paginationListe`, `panneauEdhrec`, `proposerMajCatalogue`, `propositionsHTML`, `puceStatut`, `refCarte`, `renderD`, `renderE`, `renderJ`, `renderTop`, `resultatsHTML`, `resumeDeckConfig`, `resumeFiltres`, `sectionParametres`, `sugLigne`, `sugRow`, `svgGraph`, `symBg`, `symIcon`, `tagAnnexe`, `tagDeck`, `tagEdhrec`, `tagIllegal`, `vignetteDeck`, `zoneCommandant`

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

Appelée par : `addToDeck`, `ajouterCarte`, `app.js (chargement)`, `brancherCatalogue`, `brancherRestauration`, `brancherSauvegarde`, `buyCard`, `chargerArchetypesEdhrec`, `choisirVersion`, `completeUnknown`, `deplacerCarte`, `enrichAllUnknown`, `exportModal`, `gestesDeck`, `gestesDecks`, `gestesDonnees`, `gestesNuage`, `gestesReglages`, `lireCatalogueFichier`, `loadEdhrec`, `majCatalogue`, `majPrix`, `nuageDemarrer`, `nuageDiagnostic`, `nuageSynchro`, `openImport`, `openWantsModal`, `openWipeModal`, `runScryQueue`, `save`, `telechargerCatalogue`, `versAnnexe`, `viderAnnexe`

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

Appelée par : `annonceRecalcul`, `exportModal`, `gestesDeck`, `gestesDecks`, `gestesDonnees`, `gestesNuage`, `openAdd`, `openAffichageModal`, `openBudgetModal`, `openCardModal`, `openCiblesModal`, `openDeckModal`, `openFiltresModal`, `openFormatModal`, `openImport`, `openParametresModal`, `openWantsModal`, `openWipeModal`, `ouvrirBoiteCatalogue`, `proposerMajCatalogue`

### `closeDialog()` — ligne 37

N'appelle aucune fonction du projet.

Appelée par : `app.js (chargement)`, `appliquerAffichage`, `appliquerBudget`, `appliquerCibles`, `appliquerDeck`, `appliquerFiltres`, `appliquerFormat`, `appliquerParametres`, `fermerBoiteCatalogue`, `finRecalcul`, `gestesDeck`, `gestesDecks`, `gestesDonnees`, `gestesGraphe`, `gestesNuage`, `gestesVue`, `openImport`, `openWipeModal`

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

Appelée par : `activerDeck`, `addToDeck`, `ajoutCollection`, `ajouterCarte`, `apresReglage`, `buyCard`, `chargerCatalogueComplet`, `filetSuggestions`, `gestesDeck`, `gestesDecks`, `gestesDonnees`, `gestesVue`, `lireCatalogueFichier`, `openImport`, `openWipeModal`, `removeFromDeck`, `retirerAnnexe`, `retraitCollection`, `versAnnexe`, `viderAnnexe`

## js/entete.js

### `chargement du module`

Appelle : `deckCourant()` *(decks.js)*, `eur()` *(outils.js)*, `majBoutonAffichage()` *(entete.js)*, `majHauteurEntete()` *(entete.js)*, `ongletDeSection()` *(etat.js)*, `renderOnglets()` *(entete.js)*, `scheduleSave()` *(stockage.js)*

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

Appelée par : `finProgresSection`, `progresSection`

### `renderAll()` — ligne 20

Appelle : `renderB()` *(collection.js)*, `renderC()` *(stats.js)*, `renderD()` *(graphe.js)*, `renderE()` *(deckSection.js)*, `renderI()` *(decksSection.js)*, `renderJ()` *(wishlistSection.js)*, `renderOnglets()` *(entete.js)*, `renderSuggestions()` *(suggestions.js)*, `renderTop()` *(entete.js)*, `scheduleSave()` *(stockage.js)*

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

## js/app.js

### `chargement du module`

Appelle : `appliquerBudget()` *(fenBudget.js)*, `appliquerFiltres()` *(fenFiltres.js)*, `apresReglage()` *(brouillon.js)*, `basculeTheme()` *(theme.js)*, `cacherApercu()` *(apercu.js)*, `closeDialog()` *(dialogue.js)*, `demarrer()` *(app.js)*, `fermetureBrouillon()` *(brouillon.js)*, `ficheVoisine()` *(ficheParcours.js)*, `fmt()` *(outils.js)*, `gestesDeck()` *(gestesDeck.js)*, `gestesDeckConfig()` *(gestesDecks.js)*, `gestesDecks()` *(gestesDecks.js)*, `gestesDonnees()` *(gestesDonnees.js)*, `gestesGraphe()` *(gestesGraphe.js)*, `gestesNuage()` *(gestesNuage.js)*, `gestesNuageChange()` *(gestesNuage.js)*, `gestesReglages()` *(gestesReglages.js)*, `gestesVue()` *(gestesVue.js)*, `glisseColonnes()` *(fenAffichage.js)*, `invaliderCandidats()` *(candidats.js)*, `majFiltre()` *(filtres.js)*, `majListeArchetypes()` *(fenListes.js)*, `majListeSets()` *(fenListes.js)*, `majResultats()` *(fenAjout.js)*, `majResumeFiltres()` *(fenFiltres.js)*, `majResumeFormat()` *(fenFormat.js)*, `modifieBrouillon()` *(brouillon.js)*, `molletteRecherche()` *(rechercheSection.js)*, `montrerApercu()` *(apercu.js)*, `placerApercu()` *(apercu.js)*, `refreshSuggestions()` *(suggestions.js)*, `reglageAffichage()` *(fenAffichage.js)*, `reglerCible()` *(legalite.js)*, `renderAll()` *(rendu.js)*, `renderE()` *(deckSection.js)*, `saisieBudget()` *(fenBudget.js)*, `saisieDeck()` *(gestesDecks.js)*, `saisieRecherche()` *(rechercheSection.js)*, `toast()` *(outils.js)*, → `majHauteurEntete()` *(entete.js)*

### `demarrer()` — ligne 261

Appelle : `archetypesARevoir()` *(edhrecThemes.js)*, `chargerArchetypesEdhrec()` *(edhrecThemes.js)*, `chargerGameChangers()` *(gameChangers.js)*, `chargerSauvegarde()` *(stockage.js)*, `demarrerCatalogue()` *(catalogue.js)*, `gameChangersARevoir()` *(gameChangers.js)*, `initBuiltin()` *(cartes.js)*, `loadSymbology()` *(symboles.js)*, `nuageDemarrer()` *(nuage.js)*, `renderAll()` *(rendu.js)*, `reprendTheme()` *(theme.js)*, `reprendreArchetypesEdhrec()` *(edhrecThemes.js)*, `reprendreGameChangers()` *(gameChangers.js)*, `reprendreSets()` *(sets.js)*, `restore()` *(stockage.js)*

Appelée par : `app.js (chargement)`

