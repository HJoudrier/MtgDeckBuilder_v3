# Proposition de refonte UX — Atelier MTG

Cette proposition est un prototype parallèle : elle ne remplace pas l'interface existante et ne modifie pas les règles métier. Elle sert à valider une direction avant intégration progressive.

## Direction visuelle
- Palette « papier & laiton » cohérente avec l'identité actuelle, avec surfaces aérées et contrastes renforcés.
- Icônes SVG Lucide homogènes, plutôt que des glyphes emoji ou des pictogrammes dessinés à la main.
- Typographie lisible, titres éditoriaux et boutons avec libellés explicites.
- Même vocabulaire et mêmes actions sur mobile et ordinateur.

## Parcours proposé
1. **Accueil** : reprendre le dernier deck, créer un deck, explorer les cartes ou ouvrir la collection.
2. **Créer un deck** : format → commandant / archétype → construction de la liste. Afficher une progression courte et la possibilité de revenir en arrière.
3. **Construire** : recherche persistante, résultats filtrables, liste du deck et résumé de conformité visibles ensemble sur ordinateur ; panneaux empilés sur mobile.
4. **Analyser** : courbe de mana, couleurs, rôles et alertes regroupés dans une page de diagnostic, avec une action claire pour corriger chaque point.
5. **Tester** : simulation accessible depuis le deck courant, sans perdre le contexte de construction.

## Ergonomie responsive
- Ordinateur : navigation latérale stable, barre de recherche en haut, espace de travail en deux colonnes.
- Tablette : navigation compacte et panneaux empilables.
- Smartphone : navigation basse à cinq destinations, cibles tactiles d'au moins 44 px, une colonne, actions principales pleine largeur, aucun tableau nécessitant un défilement horizontal.
- Respect de `prefers-reduced-motion`, focus clavier visible, libellés accessibles et états actifs explicites.

## Icônes
Le prototype charge Lucide 0.546.0 via son bundle UMD et utilise des noms d'icônes explicites (house, layers, library, search, chart-no-axes-combined, swords, etc.). Le dépôt possède déjà `lucide-react`, mais l'application historique est rendue en JavaScript natif : le prototype reste donc indépendant de React.

## Aperçu
Ouvrir [prototypes/refonte-ux.html](./refonte-ux.html) depuis le dépôt ou via GitHub Pages / un serveur statique. L'image conceptuelle générée dans la conversation illustre la direction artistique ; ce HTML est le prototype responsive réellement cliquable.

## Plan d'intégration conseillé
- Phase 1 : intégrer les icônes et la navigation responsive sans toucher aux gestionnaires métier.
- Phase 2 : créer l'accueil orienté tâches et le parcours de création en trois étapes.
- Phase 3 : réorganiser la construction de deck en panneaux adaptatifs.
- Phase 4 : tests tactiles, clavier, lecteurs d'écran, petits écrans et non-régression.

Les écrans illustrés emploient des données fictives de démonstration ; ils ne prétendent pas représenter les données réelles du compte.


## Navigation principale regroupée
La navigation de l'application est maintenant organisée en quatre espaces :
- **Collection** : Cartes et Decks (bibliothèque de decks).
- **Deck** : construction et réglages du deck actif.
- **Suggestions** : Graphe, EDHREC et Catalogue.
- **Jouer** : simulation.

La barre principale est fixe en bas sur ordinateur et smartphone. La sous-navigation apparaît sous l'entête uniquement lorsque l'espace comporte plusieurs vues. Les clés internes historiques (decks, collection, deck, graphe, edhrec, catalogue, simulation) sont conservées pour préserver les sauvegardes et les liens internes.
