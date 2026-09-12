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
  impressions.js    les éditions d'une carte, et celle qu'on possède
  cartes.js         la base de cartes et ses index
  liens.js          interaction précise ou déclencheur large
  etat.js           l'état : `S` et les tables de l'atelier
  archetypesSets.js deux vocabulaires venus du dehors, et leurs filtres
  filtres.js        les critères de la fenêtre « Filtres »
  retenue.js        ce qui reste après les filtres : légalité, couleurs
  catalogueEtat.js  l'archive en mémoire, et les nœuds qu'elle touche
  groupes.js        grouper et trier les listes
  barreGroupes.js   l'enveloppe d'un groupe, et les trois menus
  marche.js         Cardmarket

  — ce qui vient du dehors —
  symboles.js       les symboles de mana
  scryfallApplique.js  verser une réponse de Scryfall dans une carte
  scryfall.js       la file d'attente vers Scryfall
  recherches.js     les recherches nommées chez Scryfall
  stockage.js       la sauvegarde locale
  fenSauvegarde.js  les sections « Sauvegarde » et « Catalogue »
  idb.js            le magasin IndexedDB
  edhrec.js         les statistiques d'EDHREC pour un commandant
  edhrecForme.js    deviner la forme des pages de thèmes d'EDHREC
  edhrecThemes.js   l'index des thèmes EDHREC
  sets.js           les sets publiés par Scryfall
  gameChangers.js   la liste des « Game Changers »
  archive.js        lire l'archive Scryfall
  catalogue.js      tenir le catalogue à jour
  candidats.js      des enregistrements de l'archive aux cartes candidates

  — les sections —
  graphe.js         graphe des capacités
  stats.js          statistiques
  notation.js       la note d'une carte candidate
  vivier.js         le vivier des candidates, et son empreinte
  sugOrdre.js       l'ordre gelé des propositions
  sugCommandants.js les commandants du deck, en tête de l'onglet EDHREC
  sugListes.js      les trois lectures d'une même sélection
  suggestions.js    les trois sections des propositions
  collection.js     la section Collection
  fenImport.js      importer une liste de cartes
  fenAjout.js       ajouter une carte à la main
  annexes.js        la réserve et l'étude
  deck.js           ce qu'il y a dans le deck, et les gestes qui l'y mettent
  legalite.js       ce que le format exige, et l'équilibre des rôles
  deckSection.js    la section Deck
  ficheVisuel.js    le visuel de la fiche, et ses éditions
  fiche.js          la fiche détaillée d'une carte
  ficheParcours.js  ouvrir une fiche, et feuilleter la liste d'où elle vient

  — l'interface commune —
  outils.js         échapper, formater un prix, souffler un mot
  dialogue.js       la fenêtre modale, une à la fois
  brouillon.js      les réglages qui n'agissent qu'à « Appliquer »
  couleurs.js       le nom des combinaisons de mana
  apercu.js         l'aperçu volant sous le curseur
  versions.js       les éditions d'une même carte
  tuiles.js         vignette et ligne d'une carte
  ancre.js          garder sa place dans le défilement
  recalcul.js       les recalculs annoncés, par tranches
  entete.js         l'en-tête et la barre des onglets
  rendu.js          `renderAll()`, l'unique porte du repeint

  — les fenêtres —
  fenFormat.js      format de jeu
  fenParametres.js  sauvegarde locale, collection, catalogue
  fenBudget.js      budget et achats
  fenFiltres.js     filtres de la collection
  fenAffichage.js   liste ou grille, colonnes, groupement et tri de la collection
  fenListes.js      listes déroulantes des archétypes et des éditions
  boiteCatalogue.js progression du chargement de l'archive Scryfall
  fenExport.js      export du deck, liste d'achats, effacement

  — les gestes —
  gestesVue.js      fermer, cocher une couleur, changer d'onglet
  gestesReglages.js « Appliquer » des fenêtres de réglage, jauges, pagination
  gestesDeck.js     monter, démonter, garer, ouvrir une fiche
  gestesDonnees.js  sauvegarde, archive, EDHREC, import
  gestesGraphe.js   isoler un nœud, allonger une liste, ouvrir une vignette

  app.js            l'aiguillage et le démarrage
```

Les sept sections de la page se répartissent en cinq onglets, posés au bas de l'en-tête et
toujours visibles : **Collection** porte les statistiques puis la collection, **Deck** porte le
deck, **Graphe** porte le graphe des capacités puis les pistes branchées sur les nœuds qu'on y
isole, **EDHREC** porte les statistiques du commandant et les cartes que les decks recensés
recommandent — groupées et triées à part, avec deux tris qui n'existent que là : le taux
d'inclusion et la synergie —, **Catalogue** porte le classement complet, groupé et paginé. La table
`ONGLETS` (`js/etat.js`) est la seule à les répartir ; l'onglet ouvert tient dans `S.onglet` et se
conserve d'une séance à l'autre — un nom qu'un onglet d'hier portait est traduit par
`ONGLETS_ANCIENS`. Les sept sections sont rendues à chaque fois, celles qu'on ne
regarde pas comprises : une page masquée n'est pas mise en page, et changer d'onglet ne demande
alors aucun rendu. L'en-tête garde trois pastilles — la barre de mana et le nom de la combinaison,
le format, le budget — et deux commandes au coin haut-droit : le bouton des **filtres** et
l'**engrenage**, qui ouvre en une fenêtre la sauvegarde locale, les données de la collection et le
catalogue. Les deux voisinent parce qu'elles règlent la vue, non ce qu'elle montre ; le conteneur
`.head-actions` les ancre, et la réserve qui leur laisse la place est portée par `.top-in` là où les
pastilles partagent leur ligne, par `.brand` sous 640 px où les pastilles passent seules à la ligne.
L'en-tête ne se replie plus : un bouton « Stats » basculait un mode compact qui, sous 640 px,
s'allumait aussi tout seul — deux mécanismes pour une même chose, l'un en JavaScript et figé au
chargement, l'autre en CSS et suivant le redimensionnement. Seul le second demeure, et la mise en
page du téléphone tient désormais dans le bloc `@media (max-width:640px)`.
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

- L'état applicatif tient dans l'objet `S` de `etat.js` ; aucune autre variable globale mutable n'est partagée entre modules, hormis les caches explicites (`CAT`, `NOTES_DECK`, `VISUELS_CHARGES`).
- Les évènements de l'interface passent tous par la délégation en place dans `app.js`, sur les attributs `data-act`, `data-card`, `data-node`, `data-onglet`, `data-filtre` et `data-card-name`.
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

- La mise en page de la collection — liste ou grille, nombre de colonnes, groupement, tri — se règle
  dans la fenêtre « Affichage » (`js/fenAffichage.js`), ouverte par le bouton du même nom. Ces quatre
  réglages occupaient la barre de la section en quatre contrôles posés entre les boutons d'action :
  la ligne débordait sur un écran étroit, et chaque geste repeignait aussitôt toute la collection.
  La fenêtre les prend au brouillon et n'agit qu'à « Appliquer » — on choisit les quatre d'un coup,
  et la collection n'est redessinée qu'une fois. Le bouton en porte le résumé dans son infobulle,
  le réglage n'étant plus visible dans la barre. Le deck, le catalogue et EDHREC gardent les leurs
  dans leur barre, où ils agissent toujours au premier geste : la fenêtre ne règle que la collection.
  `S.view` est pourtant commun à la collection et au deck — « Appliquer » repeint donc les deux.
- Les jauges d'équilibre des rôles de la section Deck sont des filtres à part entière : les cocher agit partout, comme
  n'importe quel filtre de l'en-tête, et les mêmes boutons figurent dans la fenêtre des filtres.
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
