# Parcours de l'atelier

Le [README](README.md) dit **ce que fait** chaque fonction, module par module. Ce document dit
**dans quel ordre elles s'appellent** : qui déclenche quoi, quand on clique, et ce que le geste
coûte.

Les deux se complètent sans se recopier. Le rôle d'une fonction ne se lit qu'au README ; le chemin
d'un geste ne se lit qu'ici. Les diagrammes ne nomment donc que les fonctions qui font avancer le
parcours — le reste est dans les tableaux du README, où chaque module a sa section.

Pourquoi un tel document : l'application n'a ni framework, ni modules, ni build. Quinze scripts
partagent une portée globale, un unique écouteur de clic délégué aiguille tous les gestes, et
l'état tient dans un seul objet. Rien, dans cette forme, ne rend un chemin d'exécution visible ; il
faut le reconstituer à la lecture. C'est ce travail-là, fait une fois.

---

## 1. Les modules

Dans l'ordre où `index.html` les charge — l'ordre compte, `effets.js` définissant l'analyseur dont
`cartes.js` se sert pour bâtir la base livrée.

| Module | Rôle | Fonctions | Taille |
|---|---|---|---|
| [`js/effets.js`](README.md#jseffetsjs--lecture-des-effets-des-cartes) | Lecture des effets des cartes | 14 | 28 Ko |
| [`js/cartes.js`](README.md#jscartesjs--base-de-cartes) | Base de cartes | 28 | 47 Ko |
| [`js/etat.js`](README.md#jsetatjs--état-et-filtrage) | État et filtrage | 41 | 24 Ko |
| [`js/groupes.js`](README.md#jsgroupesjs--grouper-et-trier-les-listes) | Grouper et trier les listes | 12 | 14 Ko |
| [`js/marche.js`](README.md#jsmarchejs--cardmarket) | Cardmarket | 5 | 2 Ko |
| [`js/scryfall.js`](README.md#jsscryfalljs--accès-à-scryfall) | Accès à Scryfall | 25 | 24 Ko |
| [`js/stockage.js`](README.md#jsstockagejs--sauvegarde-locale) | Sauvegarde locale | 14 | 20 Ko |
| [`js/externes.js`](README.md#jsexternesjs--edhrec-et-commander-spellbook) | EDHREC et Commander Spellbook | 80 | 64 Ko |
| [`js/graphe.js`](README.md#jsgraphejs--graphe-des-capacités) | Graphe des capacités | 4 | 9 Ko |
| [`js/stats.js`](README.md#jsstatsjs--statistiques) | Statistiques | 3 | 5 Ko |
| [`js/suggestions.js`](README.md#jssuggestionsjs--suggestions-dajout) | Suggestions d'ajout | 29 | 43 Ko |
| [`js/collection.js`](README.md#jscollectionjs--collection) | Collection | 18 | 25 Ko |
| [`js/deck.js`](README.md#jsdeckjs--deck) | Deck | 35 | 45 Ko |
| [`js/ui.js`](README.md#jsuijs--interface-commune) | Interface commune | 103 | 85 Ko |
| [`js/app.js`](README.md#jsappjs--démarrage-et-évènements) | Démarrage et évènements | 1 | 26 Ko |

`js/app.js` ne déclare qu'une fonction — `demarrer()`. Tout le reste y est écouteurs : le module
est un aiguillage, non une bibliothèque. C'est le point d'entrée de presque tous les parcours qui
suivent.

---

## 2. Le vocabulaire commun

Cinq pièces reviennent dans presque tous les diagrammes. Les connaître dispense de les réexpliquer
treize fois.

**La délégation.** Un seul `click` posé sur `document`, en tête de `js/app.js`. Il remonte au premier
ancêtre porteur d'un `data-act`, lit cet attribut, et aiguille. Aucun bouton n'a de gestionnaire
propre : le HTML est réécrit sans cesse, des gestionnaires attachés ne survivraient pas.

**L'état.** Un objet global `S`, déclaré en tête de `js/etat.js`, muté sur place. La collection, le deck, les
listes annexes sont des `Map` ; les couleurs et les plis, des `Set`. Rien n'est immuable, rien
n'est copié — sauf le brouillon d'une fenêtre de réglage, qui met de côté ce qu'il modifie.

**Le recalcul.** `recalculerAvecProgression(raison)` (`js/ui.js`) est le passage obligé de
tout geste qui change le deck ou les filtres. Il relève l'ancre de défilement, demande à
`recalculLong()` (`js/ui.js`) si le travail vaut une barre de progression, puis :

- **court** — `renderAll()` sur-le-champ ;
- **long** — `prechauffeCandidats()` puis `prepareSuggestions()` par tranches, la main rendue au
  navigateur entre chacune, une boîte ouverte seulement si le travail dure plus que `DELAI_BOITE`.

**Le rendu.** `renderAll()` (`js/ui.js`) repeint l'en-tête et les cinq sections —
`renderTop`, `renderB` (collection), `renderC` (statistiques), `renderD` (graphe), `renderE`
(deck), `renderF` (suggestions) — puis programme la sauvegarde. Chaque section réécrit
l'`innerHTML` de son conteneur.

**La sauvegarde.** `scheduleSave()` (`js/stockage.js`) attend 700 ms, puis `save()` sérialise
tout l'état par `snapshot()` dans `localStorage`. Différée, elle absorbe une rafale de gestes en
une seule écriture.

---

## 3. Les parcours

### 3.1 Démarrage

```mermaid
sequenceDiagram
    autonumber
    participant NAV as Navigateur
    participant APP as app.js
    participant CARTES as cartes.js
    participant STOCK as stockage.js
    participant UI as ui.js
    participant EXT as externes.js

    NAV->>APP: DOMContentLoaded
    APP->>APP: demarrer()
    APP->>CARTES: initBuiltin()
    Note over CARTES: RAW → buildCard() → analyze() → categories()<br/>la base livrée est bâtie et analysée
    APP->>STOCK: chargerSauvegarde()
    STOCK-->>APP: instantané, ou rien
    APP->>STOCK: restore(s)
    Note over STOCK: cartes, collection, deck, réglages<br/>un nom que la base ne connaît plus est écarté
    APP->>UI: renderAll()
    APP->>EXT: reprendreArchetypesEdhrec()
    APP->>EXT: reprendreSets()
    APP->>EXT: reprendreGameChangers()
    Note over EXT: trois caches IndexedDB, lus en parallèle
    EXT-->>UI: renderAll() si un cache a livré
    APP->>EXT: demarrerCatalogue()
    Note over EXT: le catalogue complet arrive ensuite,<br/>l'atelier fonctionne déjà sans lui
```

L'application est utilisable avant que le réseau ait répondu : la base intégrée suffit, et chaque
source extérieure ne provoque un nouveau rendu que si elle apporte quelque chose.

### 3.2 Ajouter une carte des suggestions au deck

Le parcours le plus coûteux de l'atelier : le deck change, donc tout le classement des suggestions
qui en dépend doit être refait.

```mermaid
sequenceDiagram
    autonumber
    actor U as Utilisateur
    participant APP as app.js
    participant SUG as suggestions.js
    participant DECK as deck.js
    participant UI as ui.js
    participant EXT as externes.js
    participant STOCK as stockage.js
    participant S as S (état)

    U->>APP: clic « Ajouter » sur une vignette
    APP->>SUG: geleSuggestions()
    Note over SUG: SUG_ORDRE retient l'ordre affiché,<br/>SUG_EN_PLACE demande un rafraîchissement en place
    APP->>DECK: addToDeck(nom)
    DECK->>DECK: find(nom), fmt(), annexeDe(nom)

    alt la carte attendait en réserve ou à l'étude
        DECK->>DECK: deplacerCarte(nom, 'deck')
    else carte ordinaire
        DECK->>DECK: availableFor(carte)
        DECK->>S: S.deck.set(nom, n + 1)
        opt hors collection
            DECK->>UI: toast(« comptée à l'achat »)
        end
    end
    opt commandant vacant et créature légendaire
        DECK->>S: S.commander = nom
    end

    DECK->>UI: recalculerAvecProgression(raison)
    UI->>UI: releveAncre()
    UI->>UI: recalculLong() ?

    alt travail court
        UI->>UI: renderAll()
    else travail long
        UI->>EXT: prechauffeCandidats(onProgress)
        UI->>SUG: prepareSuggestions(onProgress)
        loop tranches de 800 cartes
            SUG->>SUG: noterVivier() → noteCarte()
            SUG-->>UI: onProgress(fait, total)
        end
        SUG->>SUG: SUG_MEMO = {sig, ordonneSuggestions(res)}
        UI->>UI: renderAll()
    end

    UI->>SUG: renderF()
    Note over SUG: SUG_EN_PLACE étant posé, seule la liste<br/>des suggestions est réécrite — la page ne remonte pas au début
    UI->>UI: restaureAncre()
    UI->>STOCK: scheduleSave()
```

Trois précautions que le diagramme rend visibles :

- **Le gel** est posé *avant* l'ajout, non après : c'est le classement affiché qu'il faut retenir,
  pas celui qui sortira de la notation.
- **L'ancre** est relevée avant tout rendu, et restaurée après : sans elle, la vignette qu'on
  regardait descendrait de quelques centaines de pixels.
- **La notation** ne repart que si l'empreinte a changé (§4). Ajouter une carte la change toujours
  — le deck fait partie de l'empreinte.

### 3.3 Retirer une carte du deck

```mermaid
sequenceDiagram
    autonumber
    actor U as Utilisateur
    participant APP as app.js
    participant DECK as deck.js
    participant S as S (état)
    participant UI as ui.js

    U->>APP: clic « − » sur une tuile du deck
    APP->>DECK: removeFromDeck(nom)
    DECK->>S: S.deck.get(nom)
    alt dernier exemplaire
        DECK->>S: S.deck.delete(nom)
        opt c'était le commandant
            DECK->>S: S.commander = null
        end
    else plusieurs exemplaires
        DECK->>S: S.deck.set(nom, n − 1)
    end
    DECK->>UI: recalculerAvecProgression(raison)
    Note over UI: même suite qu'en 3.2 — ancre, recalculLong(),<br/>notation par tranches s'il le faut, renderAll()
    opt la fiche est ouverte
        APP->>UI: openCardModal(nom)
        Note over UI: la fenêtre se réécrit pour montrer le nouveau compte
    end
```

Le retrait n'est pas le symétrique exact de l'ajout : il ne gèle pas l'ordre des suggestions. Le
geste part d'une tuile du deck, non d'une vignette de la section F ; il n'y a pas de place à
perdre dans une liste qu'on ne parcourait pas.

### 3.4 Filtrer

Le seul parcours à deux temps : la fenêtre travaille sur un brouillon, et rien ne s'applique avant
« Appliquer ».

```mermaid
sequenceDiagram
    autonumber
    actor U as Utilisateur
    participant APP as app.js
    participant UI as ui.js
    participant S as S (état)
    participant EXT as externes.js
    participant SUG as suggestions.js

    U->>APP: clic sur la pastille « Filtres »
    APP->>UI: openFiltresModal()
    UI->>EXT: chargerListeSets()
    UI->>UI: openDialog(titre, corpsFiltres(), boutons)
    UI->>UI: ouvreBrouillon(['filtres','colors','colorMode'])
    Note over UI: copieEtat() détache Set et objets :<br/>le brouillon ne touche pas l'état appliqué

    loop chaque frappe, chaque case cochée
        U->>APP: saisie dans un champ
        APP->>UI: modifieBrouillon(fn)
        UI->>UI: echangeBrouillon() → fn() → reprendEtat(garder)
        APP->>UI: majResumeFiltres()
        Note over UI: le décompte annonce ce que « Appliquer » donnerait,<br/>lu par avecBrouillon() — l'atelier n'a pas bougé
    end

    alt « Appliquer »
        U->>APP: clic « Appliquer »
        APP->>UI: appliquerFiltres()
        UI->>UI: verseBrouillon()
        UI->>EXT: invaliderCandidats()
        UI->>UI: filtrerAvecProgression()
        UI->>EXT: prechauffeCandidats(onProgress)
        UI->>SUG: prepareSuggestions(onProgress)
        UI->>UI: renderAll()
        UI->>UI: closeDialog()
    else Annuler, Échap, la croix, l'arrière-plan
        U->>APP: fermeture
        APP->>UI: fermetureBrouillon()
        Note over UI: brouillon = null — rien n'ayant été appliqué,<br/>il n'y a rien à défaire
    end
```

Un filtre appliqué hors fenêtre — une couleur cliquée dans l'en-tête, un rôle basculé — passe par
`apresReglage(raison)` (`js/ui.js`), qui dégèle les suggestions, invalide les candidates et
appelle le même recalcul. C'est le point commun de tous les réglages : **un filtre change le
vivier, donc tout le classement.**

### 3.5 Noter les suggestions

Le moteur appelé par les parcours précédents, vu de près.

```mermaid
sequenceDiagram
    autonumber
    participant UI as ui.js
    participant SUG as suggestions.js
    participant ETAT as etat.js
    participant EXT as externes.js
    participant MARCHE as marche.js

    UI->>SUG: prepareSuggestions(onProgress)
    SUG->>SUG: suggestionsAJour() ?
    alt l'empreinte n'a pas bougé
        SUG-->>UI: SUG_MEMO.liste, telle quelle
    else il faut renoter
        SUG->>SUG: vivierSuggestions()
        SUG->>SUG: contexteEvaluation()
        Note over SUG: le deck, ses arcs, sa courbe, ses rôles manquants,<br/>l'identité du commandant : calculés une fois
        SUG->>ETAT: filtered() — la collection retenue
        opt budget disponible
            SUG->>EXT: candidatsCatalogue()
            SUG->>MARCHE: bestOffer(carte)
        end
        loop tranches de 800
            SUG->>SUG: noterVivier(pool, X, res, i, fin)
            SUG->>SUG: noteCarte({card, source}, X)
            Note over SUG: branchements avec le deck, rôles manquants,<br/>courbe, densité de capacités, pénalité hors collection
            SUG-->>UI: onProgress(fait, total)
        end
        SUG->>SUG: ordonneSuggestions(res)
        SUG->>SUG: SUG_MEMO = {sig: signatureSuggestions(), liste}
    end
```

### 3.6 Grouper et trier

```mermaid
sequenceDiagram
    autonumber
    actor U as Utilisateur
    participant APP as app.js
    participant GRP as groupes.js
    participant SEC as collection.js / deck.js / suggestions.js

    U->>APP: choix dans « Grouper : … » ou « Trier : … »
    APP->>APP: S.groupes[section] ou S.tris[section] = valeur
    alt section = collection
        APP->>SEC: renderB()
        SEC->>SEC: filtered()
        opt tri « score »
            SEC->>GRP: notesCollection(list)
            Note over GRP: notée à la demande, mémorisée sous<br/>l'empreinte des suggestions
        end
        SEC->>GRP: groupeCartes(list, mode, tri)
        SEC->>GRP: rendGroupes(section, groupes, mode, rendu)
    else section = deck
        APP->>SEC: renderE()
    else section = suggestions
        APP->>SEC: refreshSuggestions()
        Note over SEC: le tri « score » ne retrie pas :<br/>la liste arrive déjà ordonnée, ou gelée
    end
    APP->>APP: scheduleSave()
```

### 3.7 Replier une catégorie

```mermaid
sequenceDiagram
    autonumber
    actor U as Utilisateur
    participant APP as app.js
    participant S as S (état)
    participant COL as collection.js
    participant DOM as Le document

    U->>APP: clic sur l'en-tête d'une catégorie
    APP->>S: S.groupesPlies ajoute ou retire « section|mode|groupe »
    APP->>APP: scheduleSave()
    alt collection
        APP->>COL: renderB()
        COL->>COL: la boucle de page saute les catégories repliées
        Note over COL: une catégorie repliée ne consomme aucune place :<br/>les suivantes en profitent
    else deck ou suggestions
        APP->>DOM: bloc.classList.toggle('ouverte')
        Note over DOM: bascule sur place — repasser par renderE()<br/>renoterait tout le deck pour un pli
    end
```

### 3.8 Importer une liste MTGO

```mermaid
sequenceDiagram
    autonumber
    actor U as Utilisateur
    participant APP as app.js
    participant COL as collection.js
    participant CARTES as cartes.js
    participant DECK as deck.js
    participant SCRY as scryfall.js
    participant UI as ui.js

    U->>APP: clic « Importer MTGO »
    APP->>COL: openImport(cible)
    U->>COL: fichier déposé, ou liste collée
    U->>COL: clic « Importer »
    COL->>COL: parseMtgoList(txt)
    Note over COL: quantité, nom, édition entre parenthèses,<br/>section (deck, sideboard, maybeboard, commandant)
    loop chaque ligne
        COL->>CARTES: find(nom)
        alt carte inconnue
            COL->>CARTES: registerCard(buildCard(...)) — marquée unknown
        end
        opt édition relevée
            COL->>CARTES: noterImpression(carte, set, num, qty)
        end
        alt vers la collection
            COL->>COL: S.collection.set(...)
        else vers le deck
            COL->>DECK: deckAdd(carte, qty, options)
        end
    end
    COL->>UI: recalculerAvecProgression(raison)
    COL->>SCRY: completeUnknown(fresh)
    SCRY-->>UI: applyScryfall() puis nouveau rendu
```

### 3.9 Désigner un commandant

```mermaid
sequenceDiagram
    autonumber
    actor U as Utilisateur
    participant APP as app.js
    participant S as S (état)
    participant UI as ui.js
    participant SUG as suggestions.js

    U->>APP: clic « ★ » sur une créature légendaire
    APP->>S: S.commander = nom
    APP->>UI: recalculerAvecProgression(raison)
    Note over UI: le commandant entre dans contexteEvaluation() :<br/>son identité couleur écarte des candidates entières
    UI->>SUG: prepareSuggestions() — tout est renoté
    UI->>SUG: renderF() → lanceEdhrecSiBesoin()
    SUG->>SUG: loadEdhrec() si la signature du commandant a changé
```

### 3.10 Enrichir par Scryfall

Le seul parcours que l'utilisateur ne déclenche pas : il part du rendu lui-même.

```mermaid
sequenceDiagram
    autonumber
    participant SEC as renderB / renderE / renderF
    participant SCRY as scryfall.js
    participant API as api.scryfall.com
    participant UI as ui.js

    SEC->>SCRY: queueScryfall(cartes affichées)
    SCRY->>SCRY: besoinScryfall(c) — visuel, texte ou édition manquants
    loop paquets de 75
        SCRY->>API: POST /cards/collection
        alt réponse
            API-->>SCRY: cartes
            SCRY->>SCRY: applyScryfall(sc, cible, imagesOnly)
            Note over SCRY: ce qui change la note incrémente MAJ_CARTES —<br/>un simple visuel ne fait rien recalculer
            SCRY->>UI: renderB(), renderE(), scheduleSave()
        else échec réseau
            API-->>SCRY: erreur
            SCRY->>SCRY: S.scryHS = true
            SCRY->>UI: toast(« Visuels indisponibles »)
        end
    end
    Note over UI: MAJ_CARTES entre dans signatureSuggestions() :<br/>renderF() constate la péremption et lance<br/>recalculerAvecProgression(raison, {fond:true})
```

Le recalcul de fond ne montre pas de boîte : il gèle l'ordre affiché, avance par tranches et
signale son travail par le liseré de la section. Une carte complétée pendant qu'on lit ne doit pas
interrompre la lecture.

### 3.11 EDHREC et Commander Spellbook

```mermaid
sequenceDiagram
    autonumber
    participant E as renderE (deck)
    participant F as renderF (suggestions)
    participant EXT as externes.js
    participant SUG as suggestions.js
    participant NET as EDHREC / Commander Spellbook

    E->>EXT: scheduleCombos()
    EXT->>EXT: deckSignature() — déjà vue ?
    EXT->>EXT: attente de 1200 ms
    EXT->>NET: POST /find-my-combos
    NET-->>EXT: combos du deck
    EXT->>E: renderE() — les étiquettes « combo » paraissent

    F->>SUG: lanceEdhrecSiBesoin()
    SUG->>SUG: signature du commandant et des commandants secondaires
    SUG->>NET: json.edhrec.com/pages/commanders/<slug>.json
    NET-->>SUG: taux d'inclusion et synergies
    SUG->>F: renderF() — le panneau et les étiquettes edhrec paraissent
```

Les deux sources sont attendues, jamais bloquantes : une signature les empêche de repartir pour un
deck inchangé, et leur absence ne retire rien au classement, qui repose d'abord sur l'analyse des
textes.

### 3.12 Acheter sur Cardmarket

```mermaid
sequenceDiagram
    autonumber
    actor U as Utilisateur
    participant APP as app.js
    participant DECK as deck.js
    participant MARCHE as marche.js
    participant UI as ui.js

    U->>APP: clic « Acheter » sur une vignette hors collection
    APP->>DECK: buyCard(nom)
    DECK->>DECK: budget à zéro ? — refus annoncé
    DECK->>MARCHE: bestOffer(carte)
    Note over MARCHE: l'offre la moins chère qui passe état,<br/>langue, vendeur, pays et prix maximum
    DECK->>DECK: spent() + offre > budget ? — refus annoncé
    DECK->>DECK: deckAdd(carte, 1, {force:true})
    DECK->>UI: recalculerAvecProgression(raison)
```

### 3.13 Sauvegarder

```mermaid
sequenceDiagram
    autonumber
    participant UI as renderAll / un geste
    participant STOCK as stockage.js
    participant LS as localStorage

    UI->>STOCK: scheduleSave()
    STOCK->>STOCK: minuterie de 700 ms, relancée à chaque appel
    STOCK->>STOCK: save() → snapshot()
    Note over STOCK: état, cartes importées, enrichissements Scryfall,<br/>réglages, plis, groupements
    STOCK->>LS: setItem(STORE_KEY, JSON)
    alt quota dépassé
        LS-->>STOCK: QuotaExceededError
        STOCK->>LS: nouvel essai sans visuels ni textes importés
        STOCK->>UI: toast(« espace de stockage limité »)
    end
```

---

## 4. Ce qui périme quoi

Un même clic coûte parfois rien, parfois la notation de vingt mille cartes. Trois mémos l'expliquent,
chacun gardé sous une empreinte : tant que l'empreinte est la même, le travail n'est pas refait.

| Mémo | Ce qu'il garde | Son empreinte | Ce qui la change |
|---|---|---|---|
| `CAND` (`js/externes.js`) | Le vivier tiré du catalogue | `signatureCandidats()` | Format, couleurs, filtres, prix maximum, plafond des candidates, légalité, effets isolés |
| `SUG_MEMO` (`js/suggestions.js`) | La sélection notée et ordonnée | `signatureSuggestions()` | L'empreinte des candidates, **le deck et son commandant**, la collection, le budget, `MAJ_CARTES`, les données EDHREC et combos |
| `NOTES_COLLECTION` (`js/groupes.js`) | Les notes de la collection, pour le tri par score | `signatureSuggestions()` | Les mêmes |

Deux conséquences pratiques :

- **Ajouter ou retirer une carte du deck renote tout.** Le deck fait partie de l'empreinte des
  suggestions ; il n'y a pas de renotation partielle. C'est pourquoi ces gestes passent par le
  recalcul à tranches plutôt que par un rendu direct.
- **Replier, grouper, trier ne renotent rien.** Ces gestes ne touchent aucune empreinte : ils
  redessinent, et rien de plus. Seul le premier tri par score de la collection paie une notation,
  une fois.

`invaliderCandidats()` (`js/externes.js`) vide le premier mémo à la main, quand un réglage
change le vivier sans que l'empreinte suffise à le dire. `apresReglage()` l'appelle pour tout
réglage venu d'une fenêtre, et `degeleSuggestions()` lève au passage l'ordre gelé : un nouveau
filtre demande une autre liste, pas l'ancienne dans son ancien ordre.
