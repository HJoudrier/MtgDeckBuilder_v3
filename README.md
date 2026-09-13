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
  barreGroupes.js   l'enveloppe d'un groupe, et la mise en page d'une liste
  marche.js         Cardmarket

  — ce qui vient du dehors —
  symboles.js       les symboles de mana
  scryfallApplique.js  verser une réponse de Scryfall dans une carte
  scryfall.js       la file d'attente vers Scryfall
  recherches.js     les recherches nommées chez Scryfall
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
  recalcul.js       les recalculs annoncés, par tranches
  entete.js         l'en-tête et la barre des onglets
  rendu.js          `renderAll()`, l'unique porte du repeint

  — les fenêtres —
  fenFormat.js      format de jeu
  fenParametres.js  sauvegarde locale, synchronisation, apparence, catalogue
  fenNuage.js       la section « Synchronisation » de cette fenêtre
  fenBudget.js      budget et achats
  fenFiltres.js     filtres de la collection
  fenAffichage.js   vue, colonnes, groupement et tri d'une liste de cartes
  fenCibles.js      les objectifs par rôle du deck
  fenListes.js      listes déroulantes des archétypes et des éditions
  boiteCatalogue.js progression du chargement de l'archive Scryfall
  fenExport.js      export du deck, liste d'achats, effacement

  — les gestes —
  gestesVue.js      fermer, cocher une couleur, changer d'onglet
  gestesReglages.js « Appliquer » des fenêtres de réglage, jauges, pagination
  gestesDeck.js     monter, démonter, garer, ouvrir une fiche
  gestesDonnees.js  sauvegarde, archive, EDHREC, import
  gestesNuage.js    connecter, synchroniser, déconnecter
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
le format, le budget — et trois commandes au coin haut-droit : le bouton de l'**affichage**, celui
des **filtres** et l'**engrenage**, qui ouvre en une fenêtre la sauvegarde locale, l'apparence et le
catalogue. Les trois voisinent parce qu'elles règlent la vue, non ce qu'elle montre ; le conteneur
`.head-actions` les ancre, et la réserve qui leur laisse la place est portée par `.top-in` là où les
pastilles partagent leur ligne, par `.brand` sous 640 px où les pastilles passent seules à la ligne.
L'en-tête ne se replie plus : un bouton « Stats » basculait un mode compact qui, sous 640 px,
s'allumait aussi tout seul — deux mécanismes pour une même chose, l'un en JavaScript et figé au
chargement, l'autre en CSS et suivant le redimensionnement. Seul le second demeure, et la mise en
page du téléphone tient désormais dans le bloc `@media (max-width:640px)`.
Les pastilles suivent l'ordre des questions : quelles couleurs, quel format — c'est lui qui commande
la légalité et la taille du deck —, puis les puces des filtres en vigueur et le budget. Le format
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

## La synchronisation entre appareils

Un même atelier sur deux PC, par un dossier d'application Dropbox — aucun serveur de l'atelier
n'est en jeu, les données vont de ce navigateur au nuage et en reviennent. Trois décisions la
gouvernent.

**Trois étages, fusionnés différemment** (`js/nuagePaquet.js`). Le **fond** — collection, deck,
réserve, étude, commandant, format, cibles, budget — est l'intention du joueur, et se fusionne carte
par carte. La **vue** — vues, colonnes, groupements, tris, filtres, barre de mana, onglet, plis,
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

- L'état applicatif tient dans l'objet `S` de `etat.js` ; aucune autre variable globale mutable n'est partagée entre modules, hormis les caches explicites (`CAT`, `NOTES_DECK`, `VISUELS_CHARGES`).
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
