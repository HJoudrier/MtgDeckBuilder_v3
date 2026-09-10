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
js/                 modules, chargés dans cet ordre :
  effets.js        Lecture des effets des cartes
  cartes.js        Base de cartes
  etat.js          État et filtrage
  groupes.js       Grouper et trier les listes
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
alors aucun rendu. Le format, les filtres et le budget se règlent depuis les
fenêtres qu'ouvrent les pastilles de l'en-tête ; la **sauvegarde locale**, les **données de la
collection** et le **catalogue** ont la leur, ouverte par l'engrenage posé au coin haut-droit de
l'entête — trois sections dans une seule fenêtre, là où deux pastilles ouvraient deux fenêtres en
comptant tout autre chose. Les identifiants internes des sections
(`secB`…`secH`, `renderB`…`renderH`) ont gardé leur lettre d'origine, que les rendus connaissent ;
plus aucune lettre n'est affichée, les onglets ayant pris ce rôle.

Les trois dernières lisent une **même sélection notée** : la notation ne connaît qu'une liste, et
`selectionSuggestions()` (`js/suggestions.js`) la partitionne une fois — ce qui touche les nœuds
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
| `categories(card)` | Rôles d'une carte, croisant son type avec les capacités, coûts et déclencheurs relevés par `analyze()`. Le rôle `interaction` couvre destruction, exil, renvoi, dégâts et contresorts. Le rôle `wipe` porte sur ce qui est **en jeu** : un sort qui frappe chaque adversaire sans rien retirer du champ de bataille est du dégât de masse, non un board wipe ; en revanche le sacrifice imposé à la table (« chaque joueur sacrifie une créature ») et la force retirée en masse (« toutes les créatures gagnent -X/-X ») en sont. |
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

*30 fonction(s), 48 Ko*

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
| `commandantsPrincipaux()` | Les commandants principaux du deck : le désigné aujourd'hui, ses partenaires demain — la liste attend plusieurs cartes. |
| `commandantsSecondairesPossibles()` | Les autres cartes du deck qui pourraient commander : la liste cochable qu'affiche l'onglet EDHREC. |
| `commandantsSecondaires()` | Celles qu'on traite effectivement comme commandants — les autres ont été décochées (`S.secondairesOff`). |
| `mainType(c)` | Type principal en français, face avant pour les cartes multi-faces. |
| `reanalyser(card)` | Refait analyse, rôles et archétypes après un changement de texte ou de force. |
| `majTexteOracle(card,texte)` | Remplace le résumé de la base intégrée par le texte oracle complet d'une source officielle, puis relance l'analyse. |
| `mergeInto(card,canonical)` | Fusionne deux entrées désignant la même carte. |
| `renameCard(card,newName)` | Renomme une carte vers son nom canonique en migrant les quantités. |
| `frontFace(n)` | Nom de la face avant d'une carte recto-verso. |
| `codeLegalite(legalities)` | Légalité réduite aux formats connus : « c » pour Commander, « s » pour Standard. `undefined` quand on l'ignore. |
| `cleImpression(set,num)` | Clé d'une impression : code d'édition et numéro de collection. |
| `noterImpression(card,set,num,qty)` | Relève l'édition lue dans une liste importée ; la première numérotée devient l'édition de référence. |
| `completeImpression(card,sc)` | Complète l'édition d'après Scryfall, sans écraser celle relevée à l'import. |
| `libelleImpression(card)` | Écrit l'édition de référence : « LTC n°344 ». |
| `versionsCarte(card)` | Éditions de la carte présentes dans la collection, celles que la fiche fait défiler. |
| `cleVersion(v)` | Clé « set\|numéro » d'une de ces éditions. |
| `versionRetenue(card)` | Édition affichée en priorité : celle choisie, sinon celle relevée à l'import. |
| `scryTarget(sc,map)` | Retrouve la carte locale correspondant à une réponse Scryfall. |

### `js/etat.js` — État et filtrage

L'objet d'état unique, les formats de jeu et les fonctions qui dérivent collection filtrée, deck, disponibilité et liste d'achat.
C'est aussi ici que vivent les filtres de l'en-tête : les couleurs (`S.colors`, `S.colorMode`) et, dans
`S.filtres`, tous les autres critères, dans l'ordre même où la fenêtre les présente — nom, type, set, texte de
règles, archétype, rôle, force, endurance, coût de mana, prix, illustrateur. S'y ajoutent l'index des archétypes établis par
EDHREC (`ARCH_BASE`) et celui des sets publiés par Scryfall (`SETS_BASE`).

*42 fonction(s), 27 Ko*

Données : `FORMATS`, `ANNEXES`, `CLES_ANNEXES`, `S`, `PAGE`, `FILTRES_VIDE`, `FILTRES_BORNES`, `ARCH_BASE`, `SETS_BASE`, `GC_BASE`, `ONGLETS`, `ONGLETS_ANCIENS`, `SECTIONS_SUGGESTIONS`, `COLONNES`

`GC_BASE` tient les **Game Changers** : la liste fermée que Wizards publie pour les paliers du
Commander, une quarantaine de cartes dont la présence hausse le palier d'un deck. La recopier ici
la ferait vieillir en silence à chaque révision de l'éditeur ; elle est donc demandée à Scryfall,
qui marque ces cartes (`is:gamechanger`), et gardée une semaine en cache IndexedDB comme la liste
des sets. `estGameChanger()` répond en trois états, à l'exemple de `carteLegale()` : vrai, faux,
ou `null` tant que la liste n'est pas chargée — une carte qu'on ne sait pas juger n'est pas
déclarée ordinaire pour autant, et rien n'est alors affiché. Les noms sont indexés normalisés,
face avant comprise, pour les cartes recto-verso.

`ANNEXES` décrit les deux listes tenues à côté du deck — leur titre, le mot anglais des listes
MTGO qui les nomme, l'aide affichée et les libellés de leurs boutons. Tout ce qui les manipule
ne connaît que leur clé, `sideboard` ou `considering` : ajouter une troisième liste tiendrait
dans cette table.

Chaque format de `FORMATS` (js/etat.js) dit ce qu'il exige : `legal` est la lettre
qu'emploie `codeLegalite()`, `scry` le nom que Scryfall donne au format dans ses
recherches. Limité et Personnalisé n'imposent aucune légalité, et les ont vides. La case
« écarter les cartes non légales » de la fenêtre Format (`S.filtreLegal`, cochée par
défaut) décide si les cartes non légales sont retirées de la collection affichée et des
suggestions, ou seulement marquées d'un tag « illégal ». Une carte déjà posée dans le
deck reste visible dans les deux cas — la masquer la rendrait impossible à retirer — et
`legality()` la signale. Une carte dont la légalité est inconnue n'est ni masquée ni
marquée.

`S.exploreMax` borne le chargement paginé par l'API Scryfall ; `S.candidatsMax`, distinct, borne
les cartes du catalogue local examinées par les suggestions.

La section « Catalogue des cartes » de la fenêtre **Paramètres** (l'engrenage de l'entête)
rassemble tout ce qui touche au catalogue des cartes existantes. Elle mêle deux natures, et la
fenêtre le dit : les **réglages** — cartes examinées (`S.candidatsMax`), cartes numériques
(`S.catalogueNumeriques`) — attendent « Appliquer », comme dans les fenêtres Filtres et Format ;
les **actions** — mettre à jour, télécharger, charger une archive, l'effacer, l'interrupteur
d'archivage — agissent au clic. Différer « effacer l'archive » derrière une validation serait
déroutant.

`S.catalogueNumeriques` gouverne les cartes qui n'existent que sur Arena ou MTGO. Décochée — le
défaut —, elles sont écartées des candidates (colonne `CH.NUMERIQUE` de l'archive), la requête API porte
`game:paper`, la liste des sets n'offre que les éditions papier et la fiche d'une carte n'en montre
que les impressions papier. Basculer l'option périme la liste des sets et les cartes déjà relevées
pour chacun : elles ont été bâties sous l'autre réglage. Une archive antérieure à la colonne ne
porte pas l'information : la carte est alors « non jugée » et reste candidate, comme pour la
légalité.

Rien de ce qui se règle dans la fenêtre des filtres n'agit avant « Appliquer » : ni les
champs, ni les couleurs, ni les archétypes, rôles et sets. Filtrer coûte près d'une
seconde sur un grand catalogue, et « Annuler » n'aurait aucun sens si la moitié des
réglages avait déjà pris effet. Tout va dans un brouillon (`{filtres, colors, colorMode}`,
js/ui.js) que la fenêtre lit pour se peindre — d'où `avecBrouillon()` en lecture et
`modifieBrouillon()` en écriture — et seul le décompte du bas le suit, car il ne parcourt
que la collection. « Appliquer » le verse dans l'état puis recalcule par tranches derrière
une barre de progression ; toute autre fermeture le jette, sans rien à défaire.

La fenêtre Format suit exactement le même principe, sur ses propres champs — `format`,
`custom`, `filtreLegal` — avec ses boutons « Annuler » et « Appliquer ». Le brouillon est
donc un mécanisme partagé, ouvert sur les champs que la fenêtre courante règle.

La pastille « Budget » de l'en-tête ouvre de même la fenêtre « Achats sur Cardmarket », qui
portait jusque-là un panneau de la section Suggestions : budget total, prix maximum par carte
et les préférences qui font l'estimation — état, langue, type de vendeur, pays (`S.budget`).
Elle règle un seul champ, `budget`, et l'attend au bouton comme les autres : un budget se
cherche par tâtonnements, et chaque chiffre essayé relancerait sinon la notation, que
`S.budget.perCard` périme en entrant dans la signature des candidates. Pendant la saisie, seuls le
budget restant et le rappel des achats suivent — ils se peignent sous le brouillon et annoncent
donc ce que « Appliquer » donnerait —, car réécrire la fenêtre volerait le curseur du champ en
cours. La pastille reste affichée même à budget nul, où elle marque « Budget — » : c'est la
seule porte vers ce réglage, et un budget remis à zéro doit pouvoir être repris. C'est d'ailleurs
l'état du démarrage — `budget: {total: 0, perCard: 5, …}` —, où l'atelier ne propose que les cartes
de la collection et n'engage aucun achat : le prix maximum par carte est posé d'avance, il n'attend
qu'un budget pour valoir.

Hors des fenêtres, un geste qui change l'atelier — une couleur de l'en-tête, une puce de filtre
retirée, une carte ajoutée au deck — déclenche le même travail sans qu'aucune fenêtre ne soit là
pour le montrer : bâtir les candidates du catalogue, puis les noter. Sur une archive complète,
c'est plusieurs secondes pendant lesquelles la page ne répondait plus, sans un mot. Ces gestes
passent désormais par `recalculerAvecProgression(raison)` (js/ui.js), qui fait le travail par
tranches et l'annonce.

Trois précautions y tiennent l'affichage juste. Le travail bref ne s'annonce pas : sans archive,
ou avec un vivier de moins de `SEUIL_RECALCUL` cartes, l'atelier se refait sur-le-champ comme
avant. Le travail long ne s'annonce pas non plus tout de suite : la boîte n'est montrée qu'au
bout de `DELAI_BOITE`, sans quoi elle clignoterait pour un recalcul de deux dixièmes de seconde.
Et elle ne chasse jamais une fenêtre ouverte : si l'utilisateur lit une fiche ou remplit un
formulaire, la barre se glisse dans le pied de cette fenêtre-là plutôt que de la refermer.

La notation elle-même est mémorisée sous une empreinte — `signatureSuggestions()`, js/suggestions.js
— qui réunit tout ce dont elle dépend : le deck et son commandant, la collection, les filtres, le
budget entier, le format, les données EDHREC et les combos, jusqu'au compteur des cartes que
Scryfall vient de compléter. Sans elle, la sélection ne servait qu'une fois et *tout* repeint de
la section la repayait : ajouter une carte au deck déclenchait un recalcul, puis un deuxième quand
le panneau EDHREC passait à « chargement… », puis un troisième à l'arrivée des combos. L'empreinte
est relevée **après** la notation, jamais avant : bâtir le vivier enrôle des cartes du catalogue
dans la base, et une empreinte prise avant naîtrait périmée. Le doute profite au recalcul — mieux
vaut une empreinte trop large qu'une suggestion périmée —, mais l'état d'un chargement n'en fait
pas partie : seules ses données comptent.

Reste ce que le rendu déplace. Ajouter une carte depuis une vignette renote la sélection — à
raison, le deck a changé — mais le classement qui en sort n'est pas celui qu'on avait sous les
yeux, et la section repeinte remettait au début celui qui parcourait le milieu d'une liste de
trois cents cartes. Ce geste-là, et lui seul, **gèle l'ordre affiché** (`SUG_ORDRE`) et
rafraîchit la section **en place** : seule la liste est réécrite, le panneau EDHREC et la ligne
du catalogue gardent leur DOM. Chaque vignette reste à sa case, les nouvelles venues se rangent
en fin de groupe, et un bandeau « Reclasser » paraît quand l'ordre des scores a divergé. Le gel
tombe à ce bouton, ou au premier réglage (`apresReglage()`) — un filtre, une couleur, un format
demandent une autre liste. Un repeint venu d'un chargement qui s'achève, lui, le respecte.

S'y ajoute l'**ancre de défilement** (`releveAncre()` / `restaureAncre()`, js/ui.js) : le rendu
d'un deck qui gagne une ligne, d'un en-tête qui gagne une pastille, descend de quelques dizaines
de pixels ce qu'on lisait. L'ancre retient, **à l'entrée du recalcul et avant tout changement de
DOM**, le repère le plus proche du haut de la fenêtre — et, à distance égale, la vignette plutôt
que la section qui la porte, une section prise pour ancre laissant le contenu glisser sous elle
dès qu'une ligne s'ajoute au-dessus. Elle vaut pour tous les recalculs, pas seulement pour les
ajouts.

Reste le cas des recalculs que **personne n'a demandés** : des statistiques EDHREC qui arrivent,
des combos, des prix, une carte que Scryfall vient de compléter. `recalculerAvecProgression()`
les prend en mode `fond` (`opts.fond`), et trois règles les distinguent d'un geste. Ils ne
vident jamais la section : le filet — `filetSuggestions()` — laissait auparavant un encart d'une
ligne à la place de la liste, la section fondait de quelques milliers de pixels à une soixantaine, le
navigateur ramenait le défilement dans les nouvelles bornes et l'on se retrouvait au début de la
section. Ils n'ouvrent aucune fenêtre : la progression tient dans le décompte de l'en-tête et un
liseré de trois pixels au bord haut de chacune des trois sections des propositions, posé en
position absolue — rien n'entre dans le flux, rien ne bouge. Et ils gèlent l'ordre affiché comme le fait un ajout, le bandeau
« Reclasser » proposant le nouveau classement.

Encore faut-il qu'ils soient rares. `applyScryfall()` (js/scryfall.js) comparait à peine avant
d'écrire et incrémentait `MAJ_CARTES` pour toute réponse, fût-elle un simple visuel : chaque lot
de soixante-quinze cartes périmait la sélection, et la file des images tournant sans cesse, la
section se recalculait à intervalles imprévisibles. Le compteur ne compte plus que les champs
qui changent une note — texte, identité, coût converti, force, endurance, légalité, prix —, et
chacun n'est écrit qu'après comparaison, sur le modèle de la garde qui protégeait déjà `force`.

Chaque geste dit sa raison, et c'est elle que la boîte affiche : « Couleur R retirée des
filtres… », « Sol Ring ajoutée au deck : les suggestions sont renotées… ». Reste le filet,
`filetSuggestions()` : un changement venu d'ailleurs — une archive qui finit de charger, une
réponse de Scryfall — trouverait sinon la sélection caduque et la recalculerait d'un bloc. Les
trois sections gardent alors ce qu'elles affichent, annoncent le recalcul par leur liseré et le
renvoient au même mécanisme.

Le chargement de l'archive Scryfall, lui, ouvre une boîte de progression : deux barres —
ce qui arrive, ce qui en est extrait — et le décompte des cartes retenues. Les totaux
viennent de `verifierMajCatalogue()`, qui relève la taille compressée et la taille brute.
« Masquer » referme la boîte sans rien interrompre ; « Interrompre » abandonne vraiment, et
l'archive déjà en place est rendue intacte — la lecture pose ses lots au fur et à mesure,
il faut donc les défaire.

Hors de la fenêtre, tout continue d'agir au clic : la barre de mana de l'en-tête, ses
puces de filtre et les jauges de rôle de la section Deck. Les mêmes gestionnaires servent
aux deux régimes — sans brouillon, `modifieBrouillon()` agit sur l'état lui-même —, la
fenêtre étant modale, un brouillon ouvert signifie forcément que le geste vient d'elle.

| Fonction | Rôle |
|---|---|
| `fmt()` | Contraintes du format en cours : taille, copies, commandant. |
| `eur(n)` | Formatage d'un montant en euros. |
| `esc(s)` | Échappement HTML. |
| `colorOK(card)` | Applique le filtre de couleur de la fenêtre des filtres à une carte. |
| `motsFiltre(valeur,saisie,cle)` | Chaque mot de la saisie doit figurer dans la valeur, dans n'importe quel ordre : cherchés d'un seul bloc, « Legendary creature » écartait les dieux et les créatures-artefacts. |
| `carteFiltree(card)` | Prédicat unique : couleurs, rôle et critères de la fenêtre. Vaut pour la collection, le deck, la courbe et les suggestions. |
| `carteLegale(card)` | Légalité dans le format en cours : vrai, faux, ou `null` quand on l'ignore. |
| `legaliteOK(card)` | Le filtre de légalité, tel que la case de la fenêtre Format le règle. |
| `carteRetenue(card)` | Ce que retiennent la collection et les suggestions : les critères de la fenêtre, plus la légalité. Le deck s'en tient à `carteFiltree()`. |
| `rolesFiltre()` | Rôles cochés, lus depuis la liste conservée dans `S.filtres`. |
| `basculerRole(role)` | Coche ou décoche un rôle ; sans argument, les efface tous. |
| `roleOK(card)` | La carte tient au moins un des rôles cochés. |
| `filtreOK(card)` | Applique les filtres de la fenêtre (nom, type, set, texte de règles, archétype, force, endurance, coût, prix, illustrateur) à une carte. |
| `filtresValeursOK(v)` | Le noyau de ces critères, sur des valeurs nues : une seule écriture des comparaisons pour la carte comme pour l'enregistrement. |
| `valeurFiltre(x,vide)` | Lit une valeur donnée telle quelle ou par une fonction, pour ne calculer les critères coûteux que s'ils servent. |
| `filtreOKRec(rec)` | Les mêmes critères sur un enregistrement du catalogue, sans construire la carte. Les rôles, qui exigent l'analyse, restent appliqués en aval. |
| `setsRec(rec)` | Sets d'un enregistrement : ceux de l'archive, réunis à ceux que Scryfall a rapportés. |
| `archetypesFiltre()` | Archétypes cochés, lus depuis la liste conservée dans `S.filtres`. |
| `basculerArchetype(id)` | Coche ou décoche un archétype. |
| `archetypesDisponibles()` | Les thèmes publiés par EDHREC, avec libellé et résumé. |
| `resumeArchetype(slug)` | Résumé d'un archétype : le nôtre, celui d'EDHREC, ou une phrase formée sur son nom. |
| `libelleArchetype(slug)` | Libellé d'un thème : le nôtre s'il existe, sinon celui d'EDHREC. |
| `archetypesAChargerEdhrec()` | Thèmes cochés dont les cartes restent à chercher. |
| `archetypesCarte(card)` | Archétypes d'une carte, d'après les thèmes EDHREC chargés. |
| `setsFiltre()` | Sets cochés, lus depuis la liste conservée dans `S.filtres`. |
| `basculerSet(code)` | Coche ou décoche un set ; sans argument, les efface tous. |
| `libelleSet(code)` | Nom du set s'il figure dans la liste Scryfall, sinon son code. |
| `setsACharger()` | Sets cochés dont les cartes restent à chercher. |
| `setsCarte(card)` | Sets d'une carte : ce que Scryfall en dit, joint au code de l'archive et aux éditions possédées. |
| `filtresActifs()` | Filtres en vigueur : libellé et clés à effacer, pour les puces de l'en-tête. |
| `texteFiltresActifs(sep)` | Ces mêmes libellés mis bout à bout, pour les infobulles et les résumés. |
| `majFiltre(cle,valeur)` | Écrit un champ de la fenêtre dans `S.filtres`. |
| `effacerFiltre(cles)` | Retire un filtre depuis la croix de sa puce. |
| `reinitFiltres()` | Remet tous les filtres à vide. |
| `nombreFiltre(v)` | Lit une borne numérique saisie ; renvoie `null` si le champ est vide. |
| `collectionCards()` | Collection sous forme de paires carte / quantité. |
| `filtered()` | Collection filtrée puis triée selon les réglages courants. La pagination (`S.limitB`) n'est plus repliée par un réglage : seul un import la ramène à sa première page. |
| `deckEntries()` | Cartes du deck, regroupées par type puis par coût. |
| `deckSize()` | Nombre de cartes du deck. |
| `availableFor(card)` | Exemplaires de la collection non encore engagés dans le deck. |
| `aAcheter()` | Cartes du deck non couvertes par la collection, chiffrées. |
| `spent()` | Total estimé des cartes à acheter. |

### `js/groupes.js` — Grouper et trier les listes

Le vocabulaire commun des quatre listes qui montrent des cartes — la collection, le deck, le
catalogue des suggestions, les recommandations d'EDHREC. Chacune y puise ses regroupements et ses
tris, et garde les siens : `S.groupes` et `S.tris` portent un réglage par liste, conservés comme le
reste des préférences.

Sept regroupements — pas de groupe, type, sous-type, couleur, coût de mana, rôle, édition — et huit
tris : nom, coût de mana, prix, quantité, type, score, taux d'inclusion EDHREC, synergie EDHREC.
`TRIS_SECTION` dit lesquels chaque liste propose : la quantité n'a pas de sens pour une suggestion,
qui n'est encore nulle part, et les deux taux d'EDHREC n'en ont que là où toute carte en porte —
l'onglet EDHREC, où ils viennent en tête, l'inclusion par défaut. Une carte sans statistique prend
une valeur sentinelle commune (`SANS_EDHREC`) : elle se range en fin de groupe, et deux d'entre
elles se départagent par le nom. Deux regroupements rangent une carte à
plusieurs endroits : le sous-type (« Legendary Creature — Human Wizard » compte parmi les Humains
**et** parmi les Sorciers) et le rôle (une carte qui pioche et qui rampe compte dans les deux). La
somme des groupes dépasse alors le total, et `noteMultiple()` le dit en toutes lettres sous la
barre plutôt que de laisser compter faux.

La **rareté** manque à l'appel : ni la base intégrée, ni le catalogue local (`CH`, js/etat.js) ne
la portent — seul Scryfall la connaît, carte par carte. La proposer aujourd'hui rangerait la
quasi-totalité d'une collection sous « inconnue » ; elle attend que la donnée existe.

Le **score** se lit là où il se trouve : porté par la suggestion, relevé dans `NOTES_DECK` pour le
deck, et calculé pour la collection par `notesCollection()` — à la demande seulement, quand ce tri
est choisi, puis mémorisé sous l'empreinte des suggestions (`signatureSuggestions()`). Le deck note
cent cartes à chaque rendu sans qu'on le sente ; une collection en compte des milliers, et les
noter à chaque clic se paierait à chaque clic.

Le **nombre de cartes par ligne** se règle là où une grille le propose : la collection et le
catalogue. Les grilles posaient autant de colonnes que la largeur en permettait, chacune d'une
largeur minimale — 130 pixels pour les tuiles de la collection, 200 pour les vignettes du
catalogue : sur un téléphone, cela fait deux ou trois cartes par ligne, où l'on ne lit plus rien.
Le menu « Colonnes » impose un nombre à toutes les largeurs : une seule carte par ligne pour la
lire vraiment, deux ou trois pour comparer, jusqu'à huit pour embrasser la liste d'un coup d'œil.
« Auto » reste le choix de départ, celui d'avant. La règle CSS porte deux classes (`.grid.cols`,
`.sugrid.cols`) : elle l'emporte donc sur les grilles des requêtes de média, sans quoi le choix se
perdrait là où il sert le plus. La largeur d'une colonne est bornée par la feuille de style
(`--col-max`, 460 px) : à une ou deux colonnes sur un écran large, le visuel serait sans cela
agrandi bien au-delà de sa définition — 488 px chez Scryfall —, et l'on gagnerait du flou plutôt
que de la lisibilité. `S.colonnes` porte un réglage par liste, comme `S.groupes` et `S.tris` ; une
sauvegarde d'avant, qui n'en portait qu'un en nombre nu, le donne à la collection. Le deck, les
listes annexes, le graphe et EDHREC gardent leur grille automatique.

Chaque catégorie se **replie** d'un clic sur son en-tête, comme les trois parties de la section
Deck — mêmes classes, même chevron, même geste (`enveloppeGroupe()` reprend le patron de
`partieDeck()`). La clé du pli réunit la section, le mode de groupement et le groupe :
`collection|sousType|Wizard`. Replier « Créature » dans le deck ne replie donc pas celle de la
collection, changer de groupement laisse les plis de l'autre mode en place, et une catégorie
nouvelle s'ouvre. `S.groupesPlies` les tient, conservé comme `S.deckPlie`.

Dans la collection, une catégorie repliée **ne consomme aucune place** dans la page : replier
« Créature » fait apparaître les catégories suivantes au lieu de laisser les 200 places se remplir
de cartes invisibles, et l'en-tête replié annonce alors le total entier de sa catégorie. C'est
pourquoi le pli y redessine la section, là où le deck et les suggestions se contentent de basculer
la classe sur place — repasser par `renderE()` renoterait tout le deck pour un pli, et réécrire
`#sugList` ferait perdre sa place au lecteur.

*16 fonction(s), 17 Ko*

Données : `GROUPES`, `TRIS`, `TRIS_SECTION`, `COULEUR_LABEL`, `COULEUR_ORDRE`, `NOTES_COLLECTION`, `COMPTEUR_GROUPE`, `SANS_EDHREC`

| Fonction | Rôle |
|---|---|
| `sousTypesCarte(card)` | Les sous-types lus sur la ligne de type après le tiret cadratin, face par face. |
| `seauCmc(card)` | Le seau de coût de la courbe de mana : au-delà de sept, tout ensemble. |
| `scoreEntree(e)` | Le score d'une entrée, pris à la suggestion, au deck ou aux notes de la collection. |
| `tauxEdhrec(e,champ)` | Le taux d'inclusion ou de synergie qu'EDHREC donne à une carte ; une valeur sentinelle si elle n'en a pas. |
| `notesCollection(entrees)` | Note la collection à la demande et mémorise le résultat sous l'empreinte des suggestions. |
| `groupeCartes(entrees,mode,tri)` | Range une liste en groupes ordonnés, chacun trié. Un tri `null` garde l'ordre reçu. |
| `clePli(section,mode,id)` | La clé d'un pli : la section, le mode de groupement et le groupe. |
| `groupePlie(section,mode,id)` | Cette catégorie est-elle repliée ? |
| `enveloppeGroupe(section,mode,g,titre,badge,corps)` | La catégorie repliable : en-tête cliquable, chevron, et le corps que la section fournit. |
| `rendGroupes(section,groupes,mode,rend,compte)` | Une catégorie repliable par groupe ; la section rend son contenu. Sans groupe, la liste passe telle quelle, et rien ne se replie. |
| `noteMultiple(mode)` | La phrase qui annonce qu'une carte compte dans plusieurs groupes. |
| `colonnesDe(section)` | Le nombre de colonnes d'une liste, une valeur inconnue valant « auto ». |
| `menuColonnes(section)` | Le menu du nombre de cartes par ligne. |
| `ouvreGrille(section,base)` | L'ouverture d'une grille : la classe et la variable qui portent ce choix, ou la grille automatique d'avant. |
| `barreGroupeTri(section)` | Les deux menus « Grouper par » et « Trier par », portant la section qu'ils règlent. |

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
| `chercheImpressions(card)` *(async)* | Visuels de chaque édition possédée, en une requête, à l'ouverture de la fiche. |
| `chercheToutesEditions(card)` *(async)* | Toutes les éditions papier publiées, en « unique=prints », à la demande seulement. |
| `semeVisuelVersion(card)` | Reprend le visuel déjà affiché comme celui de son édition, pour ne pas le redemander. |
| `visuelDepuisScryfall(sc)` | Visuel, illustrateur, nom du set et prix d'une impression. |
| `compacte(sc)` | Réduit une carte Scryfall aux champs utiles à l'analyse et au classement, code d'édition compris. |
| `autoCatalogue()` | Décide si le catalogue peut se charger tout seul. |
| `estGzip(nom,octets)` | Détecte une archive compressée par son nom ou sa signature. |
| `fluxTexte(source,nom,suivi)` *(async)* | Ouvre un flux de texte, décompression comprise, en comptant les octets reçus puis extraits. |
| `compteurOctets(onOctets)` | Compte les octets qui passent dans un flux, sans rien retenir. |
| `nouveauSuivi(source,totalRecu,totalExtrait)` | L'avancement d'un chargement d'archive, tel que la boîte le lit. |
| `retiens(par,rec)` | Ne garde qu'une entrée par nom, la mieux classée, en y accumulant les codes d'édition de toutes les impressions lues. |
| `fusionneSets(a,b)` | Réunit deux listes de codes d'édition, sans doublon. |
| `tailleEstimee(cartes)` | Estime le poids de l'archive par échantillonnage. |
| `lireCatalogueFichier(source,nom,suivi)` *(async)* | Lit une archive Scryfall en flux et en extrait le catalogue, en rendant compte de son avancement et en sachant renoncer. |
| `ArchiveAbandonnee()` | L'interruption voulue, que l'appelant distingue d'une panne. |
| `interrompreCatalogue()` | Arrête le chargement en cours ; l'archive déjà en place est rendue intacte. |
| `chargerCatalogueLocal()` *(async)* | Cherche une archive posée à côté de la page. |
| `verifierMajCatalogue()` *(async)* | Interroge l'index Scryfall : date, adresse et taille de la version publiée. |
| `catalogueAbsent()` | Dit si cet appareil n'a pas les cartes existantes. *(défini dans `etat.js`)* |
| `catalogueObsolete()` | Compare l'archive locale à la version publiée. |
| `majPrix(force)` *(async)* | Rafraîchit les prix des seules cartes possédées ou jouées. |
| `telechargerCatalogue()` *(async)* | Télécharge l'archive et l'extrait sans fichier intermédiaire. |
| `chargerCatalogueComplet(force)` *(async)* | Charge le catalogue : cache, puis fichier local, puis téléchargement. |
| `demarrerCatalogue()` *(async)* | Au démarrage : archive manquante → téléchargement, archive datée → fenêtre de proposition. |
| `proposerMajCatalogue()` | Fenêtre modale signalant que les données des cartes ont pu changer. |
| `majCatalogue()` *(async)* | Bouton « Mettre à jour » : teste la version publiée, retélécharge si besoin, sinon rafraîchit les prix. |
| `completeDepuisRec(c,rec)` | Complète une carte existante avec ce que l'archive apporte de plus, texte oracle compris. |
| `carteDuCatalogue(rec)` | Matérialise une carte du catalogue et l'analyse. |
| `invaliderCandidats()` | Invalide la sélection mémorisée. |
| `signatureCandidats()` | Signature des critères, filtres de la fenêtre compris, pour ne recalculer qu'en cas de changement. |
| `appliqueCatalogueAuxCartes()` | Reporte les textes oracle complets et les prix de l'archive sur vos cartes. |
| `selectionCandidats()` | La boucle qui écarte et le classement par rang EDHREC, communs aux deux façons de bâtir les candidats. |
| `candidatsCatalogue()` | Cartes du catalogue retenues par les couleurs, le prix, les filtres de la fenêtre et — si `S.filtreLegal` — la légalité dans le format. Le plafond `S.candidatsMax` ne s'applique qu'ensuite, sur ce qui reste. |
| `prechauffeCandidats(onProgress)` *(async)* | La même construction par tranches, en rendant la main, pour la barre de progression d'« Appliquer ». |
| `statsCandidats()` | Le détail de ce qui a écarté et combien, pour la phrase de la section du catalogue. |
| `requeteCatalogue()` | Construit la requête Scryfall correspondant aux couleurs, et au format si `S.filtreLegal`. |
| `signatureCatalogue()` | Signature du contexte de chargement du catalogue. |
| `chargerCatalogue()` *(async)* | Chargement paginé par l'API, en secours de l'archive. |
| `applyScryfall(sc,requested,imagesOnly)` | Applique une réponse Scryfall à une carte : texte, visuels, prix, verso. Ne compte dans `MAJ_CARTES` que les champs qui changent une note, chacun comparé avant écriture. |
| `besoinScryfall(c)` | Dit si une carte attend encore son visuel ou son texte oracle complet. |
| `identScryfall(c)` | Identifiant demandé à Scryfall : l'édition relevée à l'import, ou le nom. |
| `cibleImpression(sc,parImpression)` | Retrouve la carte visée par une réponse, d'après l'édition demandée. |
| `indexImpressions(cartes)` | Index des cartes d'un lot par leur impression. |
| `queueScryfall(cards)` | Met en file les cartes dont le visuel, le texte complet ou l'édition possédée manque. |
| `runScryQueue()` *(async)* | Vide cette file par lots, sans saturer le réseau. |
| `chercheTexte(card)` *(async)* | Va chercher le texte oracle complet d'une seule carte, pour la fiche ouverte. |
| `completeUnknown(names)` *(async)* | Complète les cartes importées : l'édition relevée d'abord, puis trois passes par nom de plus en plus tolérantes. |
| `chercheScryfall(q,cible)` *(async)* | Recherche en ligne pour la boîte d'ajout. |

### `js/stockage.js` — Sauvegarde locale

Instantané de l'état vers localStorage, archive du catalogue en IndexedDB, fenêtre de gestion des données.

*18 fonction(s), 17 Ko*

Données : `STORE_KEY`, `STORE_OFF`

| Fonction | Rôle |
|---|---|
| `impressionSnap(c)` | Éditions d'une carte à conserver : impression de référence, impressions relevées et édition choisie. |
| `impressionRestore(card,o)` | Rend ces éditions à la carte au chargement. |
| `idb()` | Ouvre la base IndexedDB. |
| `idbLire(cle)` | Lit une clé de l'archive. |
| `idbEcrire(cle,val)` | Écrit une clé dans l'archive. |
| `idbVider()` | Efface l'archive du catalogue. |
| `snapshot()` | Instantané de l'état à enregistrer, deck et listes annexes compris. |
| `ecrire(payload)` | Écriture brute dans localStorage. |
| `save()` | Enregistre, avec repli allégé si l'espace manque. |
| `scheduleSave()` | Enregistrement différé après une modification. |
| `restore(d)` | Restaure un instantané, cartes importées comprises ; une sauvegarde antérieure aux listes annexes les laisse vides. |
| `chargerSauvegarde()` | Relit la sauvegarde existante. |
| `corpsSauvegarde()` | La section « Sauvegarde locale » de la fenêtre des paramètres. |
| `blocCatalogue()` | Gestion de l'archive — état, taille, mises à jour — affichée dans la section « Catalogue des cartes ». |
| `brancherSauvegarde()` | Branche l'interrupteur de la sauvegarde locale. |
| `rafraichirFenetreSauvegarde()` | Réécrit la fenêtre des paramètres sur place quand l'état du catalogue a bougé. |
| `brancherCatalogue()` | Branche les commandes du catalogue. |
| `brancherRestauration()` | Branche le sélecteur de fichier de restauration. |

### `js/externes.js` — EDHREC et Commander Spellbook

Un deck Commander porte souvent plusieurs créatures légendaires : l'une commande, les autres
pourraient. L'atelier croise les pages EDHREC de toutes celles qu'on retient — les commandants
**principaux**, désignés dans l'onglet Deck, et les **secondaires** que la section « Commandants
EDHREC », en tête de l'onglet, laisse cocher une à une. Chaque ligne y porte le nom de la carte —
qui montre son visuel au survol et ouvre sa fiche au clic — et le nombre de decks recensés, qui est
le lien vers sa page EDHREC. Décocher retire les statistiques d'une carte du croisement sans la
sortir du deck : ses recommandations et ses étiquettes disparaissent, les scores sont repris, et
rien n'est redemandé au réseau — les statistiques des autres restent en place. Les écartées
tiennent dans `S.secondairesOff`, conservé d'une séance à l'autre : ce sont les exclusions qu'on
retient, non les inclusions, pour qu'une légendaire ajoutée au deck compte dès son arrivée.

Statistiques d'inclusion et de synergie par commandant, thèmes de deck servant d'archétypes établis,
sets publiés par Scryfall et composition de ceux qu'on coche, liste des Game Changers du Commander,
combos répertoriés et combos à une carte près, plus le catalogue Scryfall complet et son archive IndexedDB.

*81 fonction(s), 65 Ko*

| Fonction | Rôle |
|---|---|
| `signatureCommandants()` | Les commandants croisés avec EDHREC — le principal et les secondaires retenus — en une chaîne : elle dit quand les statistiques en place ne valent plus. |
| `chargerArchetypesEdhrec()` *(async)* | Charge la liste des thèmes EDHREC, puis les thèmes déjà cochés. Appelée seule, au démarrage. |
| `chargerListeArchetypesEdhrec()` *(async)* | L'index des thèmes publiés, en une requête. Renvoie sa trouvaille sans toucher au cache. |
| `archetypesARevoir()` | Faut-il interroger EDHREC ? Rien en cache, ou liste vieille d'une semaine. |
| `signatureArchetypes(liste)` | Empreinte d'une liste de thèmes, pour repérer un vrai changement. |
| `chargerThemeEdhrec(slug)` *(async)* | Les cartes d'un thème, à sa première utilisation. |
| `themesPageEdhrec(j)` | Thèmes, libellés et descriptions d'une page d'index, quelle que soit sa forme. |
| `descriptionPageEdhrec(j)` | Description que la page d'un thème porte parfois en tête. |
| `formeThemeEdhrec()` *(async)* | Cherche par sondage l'adresse des pages de thème ; note chaque essai. |
| `formesDeduites()` *(async)* | Déduit cette adresse des liens cités dans une page de commandant. |
| `temoinEdhrec()` *(async)* | Page de commandant témoin, pour distinguer adresse fausse et hôte injoignable. |
| `reprendreArchetypesEdhrec()` *(async)* | Reprend cet index depuis IndexedDB au démarrage. |
| `setRetenu(s)` | Un set à proposer : papier, ni jeton ni objet de collection. |
| `reprendreSets()` *(async)* | Reprend la liste et l'index des sets depuis IndexedDB au démarrage. |
| `sauverSets()` | Conserve la liste et l'index des sets dans IndexedDB. |
| `setsARevoir()` | Faut-il réinterroger Scryfall ? Rien en cache, liste vieille d'une semaine, ou réglage des cartes numériques changé. |
| `oublieCartesSets()` | Oublie les cartes relevées par set : elles l'ont été sous l'autre réglage. |
| `chargerListeSets()` *(async)* | La liste des sets papier, en une requête, à l'ouverture des filtres. |
| `reprendreGameChangers()` *(async)* | Reprend la liste des Game Changers depuis IndexedDB au démarrage. |
| `sauverGameChangers()` | L'y conserve, avec la date de son chargement. |
| `gameChangersARevoir()` | Faut-il la redemander ? Rien en cache, ou liste vieille d'une semaine. |
| `chargerGameChangers()` *(async)* | La liste que Wizards publie, telle que Scryfall la marque (`is:gamechanger`). |
| `noteSetIndex(nom,code)` | Rattache un nom de carte à un code de set dans l'index. |
| `chargerSetScryfall(code)` *(async)* | Les cartes d'un set, à sa première utilisation. |
| `noterSetsArchive(c,rec)` | Reporte sur la carte les codes d'édition que porte l'archive. |
| `noterLegalArchive(c,rec)` | Reporte sur la carte la légalité que porte l'archive. |
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

Notation des cartes — commune aux propositions et aux cartes du deck —, vignettes et pagination.
Le panneau « Achats sur Cardmarket » a quitté la section pour la fenêtre qu'ouvre la pastille « Budget »
de l'en-tête ; seules en restent les deux lignes de résumé, que cette fenêtre affiche.

Le module rend trois sections, une par onglet : les pistes branchées sur les nœuds isolés du graphe
(`secG`), les recommandations d'EDHREC (`secH`), le classement complet du catalogue (`secF`). Elles
lisent une seule sélection notée, partitionnée par `selectionSuggestions()`.

*46 fonction(s), 55 Ko*

Données : `VISUELS_CHARGES`, `LISTES_SUG`

| Fonction | Rôle |
|---|---|
| `contexteEvaluation()` | Prépare le contexte de notation : graphe du deck, rôles manquants, courbe. |
| `noteCarte(p,X)` | Note une carte : synergies, boucles, rôles, courbe, EDHREC, combos. |
| `vivierSuggestions()` | Constitue le vivier : toutes les cartes qu'on pourrait proposer, avant notation. |
| `noterVivier(pool,X,res,debut,fin)` | Note une tranche du vivier. |
| `ordonneSuggestions(res)` | Écarte les scores nuls, applique les filtres de l'en-tête et classe. |
| `currentSuggestions()` | Vivier puis notation d'un bloc, ou reprise de la sélection mémorisée si son empreinte vaut encore. |
| `prepareSuggestions(onProgress)` *(async)* | La même notation par tranches, celle qu'accompagne la barre de progression. |
| `signatureSuggestions()` | L'empreinte de tout ce dont la notation dépend : deck, collection, filtres, budget, format, données EDHREC et combos, cartes complétées. |
| `empreinteCollection()` | Un condensé bon marché de la collection, pour cette empreinte. |
| `suggestionsAJour()` | La sélection mémorisée vaut-elle encore pour l'état courant ? |
| `geleSuggestions()` | Gèle l'ordre affiché — la dernière sélection rendue, jamais une notation en cours. |
| `ordreGele()` | Un ordre est-il gelé ? Un tableau vide n'en est pas un. |
| `degeleSuggestions()` | Lève le gel — « Reclasser », ou tout réglage de l'en-tête. |
| `suggestionsAffichees()` | La sélection dans l'ordre où elle s'affiche : celui des scores, ou celui qui a été gelé. |
| `classementDecale()` | L'ordre affiché diffère-t-il de celui des scores ? |
| `bandeauReclassement()` | Le bandeau qui le dit, et son bouton. |
| `lanceEdhrecSiBesoin()` | Demande les statistiques du commandant quand il vient de changer, d'où que vienne le rendu. |
| `ligneCatalogue()` | État du catalogue et décompte des cartes écartées, cause par cause. |
| `panneauEdhrec()` | Panneau EDHREC en tête de l'onglet : la liste des commandants, puis ce qu'EDHREC répond. |
| `blocCommandants(principaux,secPossibles)` | Les deux listes de la section : commandants principaux, puis secondaires cochables. |
| `ligneCommandant(carte,principal)` | Une ligne : l'étoile du principal ou la case d'un secondaire, le nom, le décompte des decks. |
| `lienDecksEdhrec(nom,actif)` | Le nombre de decks recensés, qui est aussi le lien vers la page EDHREC de la carte. |
| `sugRow(s)` | Vignette d'une proposition. |
| `ligneBudget()` | Ligne de budget restant, peinte dans la fenêtre « Achats sur Cardmarket ». |
| `ligneAchats()` | Rappel des cartes à acheter, dans cette même fenêtre. |
| `selectionSuggestions()` | Partitionne la sélection notée en trois lectures : les pistes des nœuds isolés, les recommandations d'EDHREC, tout le classement. |
| `paginationListe(cle,total,max,defaut)` | Les boutons « Afficher de plus / Tout / Réduire » d'une liste hors catalogue : les deux listes courtes (`LISTES_SUG`) et les catégories d'EDHREC. |
| `renvoiCatalogue(quoi)` | Le renvoi des deux listes courtes vers le classement complet. |
| `blocGraphe(sel)` | La section du graphe : ce qui se branche sur les nœuds qu'on y a isolés, ou l'invitation à en cliquer un. |
| `blocEdhrec(sel)` | La section EDHREC : sa barre de rangement, les cartes que les decks recensés recommandent, groupées et triées comme on le demande. |
| `cleLimiteEdhrec(id)` | La clé de pagination d'une catégorie d'EDHREC, préfixée pour ne pas partager son compte avec celle du catalogue. |
| `corpsEdhrec(g,plat)` | Les vignettes d'une catégorie d'EDHREC et sa pagination. |
| `visuelsEdhrec(groupes,mode)` | Les visuels des recommandations affichées, les catégories repliées exceptées. |
| `listeSuggestions(sel)` | La section du catalogue : assemble les groupes selon la barre de la section (js/groupes.js) et le filtre par rôle. Le tri « score » ne retrie rien : la liste arrive dans l'ordre des scores, ou dans l'ordre gelé que le geste précédent a retenu. |
| `visuelsSuggestions(vus)` | Demande les visuels des vignettes qu'une section affiche. |
| `visuelsCatalogue(groupes)` | Les mêmes pour le catalogue, groupe par groupe, les catégories repliées exceptées. |
| `chargeVisuelsClasses()` | Charge les visuels par lots de six, en relisant le document à chaque lot pour survivre à un nouveau rendu. |
| `majHint(id,texte)` | Le décompte d'une section, dans son en-tête. |
| `poseCorps(idCorps,morceaux)` | Pose le contenu d'une section sans refaire son enveloppe : seuls les conteneurs nommés sont réécrits. |
| `filetSuggestions()` | Le filet : sélection caduque et recalcul long, les sections gardent ce qu'elles affichent et le travail repart par tranches. |
| `renderSuggestions()` | Peint les trois sections ensemble, la sélection n'étant partitionnée qu'une fois. C'est le point d'entrée des autres modules. |
| `renderG(sel)` | Rend la section des pistes du graphe (onglet Graphe). |
| `renderH(sel)` | Rend la section EDHREC (onglet EDHREC) : panneau puis recommandations. |
| `renderF(sel)` | Rend la section du catalogue (onglet Catalogue) : état du catalogue puis classement complet. |
| `refreshSuggestions()` | Rafraîchit les trois sections et l'en-tête, sans rien recalculer : pagination, groupement, tri. |

### `js/collection.js` — Collection

Affichage en grille ou en liste, import MTGO par fichier ou par collage, recherche et ajout de cartes.
Le code d'édition entre parenthèses et le numéro de collection qui le suit — « 1 Sol Ring (LTC) 344 »,
« 1 [ELD#331] Arcane Signet » — sont relevés et conservés sur la carte : l'impression possédée est ensuite
demandée telle quelle à Scryfall, avec son visuel, son illustrateur et son prix. La collection reste comptée
par nom ; les éditions relevées s'ajoutent les unes aux autres sur la même carte.

La grille laisse choisir **combien de cartes par ligne** — le menu « Colonnes », visible en grille
seulement. Le mécanisme est commun au catalogue et décrit avec lui (`js/groupes.js`) ; ici, il
s'applique à la grille des tuiles, et le menu disparaît en vue liste.

*18 fonction(s), 25 Ko*

| Fonction | Rôle |
|---|---|
| `renderB()` | Rend la collection, en grille ou en liste, groupée et triée selon la barre en tête de section (js/groupes.js), avec pagination ; les filtres se règlent dans l'en-tête. La page se remplit groupe par groupe, dans l'ordre affiché, en sautant les catégories repliées. |
| `causesCollection()` | Compte, cause par cause, ce qui écarte des cartes : les couleurs, la légalité du format, les champs de la fenêtre. |
| `ligneCausesCollection()` | La phrase qui les nomme, chacune avec le geste qui la lève. |
| `retireExtrait(s,i,n)` | Retire un fragment d'une ligne et recolle le reste. |
| `extraitEdition(texte)` | Isole le code d'édition et le numéro de collection d'une ligne importée. |
| `parseMtgoList(txt)` | Lit une liste MTGO ligne à ligne : quantité, nom, édition, et la section — deck, sideboard, maybeboard ou considering, commandant, jetons — que la ligne rejoint. |
| `openImport(cible)` | Boîte d'import, par fichier, glisser-déposer ou collage. Vers le deck, les sections de la liste se répartissent entre la liste principale, la réserve et l'étude. |
| `ajouterCarte(c,q,cible,completer)` | Ajoute une carte à la collection ou au deck. |
| `chercheCartes(q)` | Recherche par nom dans le catalogue local, filtrée par couleur. |
| `resultatsHTML(q,cible)` | Liste des propositions de la boîte d'ajout. |
| `majResultats(cible,sansRelancer)` | Met à jour ces propositions à la frappe. |
| `openAdd(cible)` | Boîte d'ajout avec recherche locale puis en ligne. La cible est la collection, le deck ou l'une des deux listes annexes. |

### `js/deck.js` — Deck

Composition, équilibre des rôles, commandant, conformité au format et cartes à acheter,
plus les deux listes tenues à côté de la liste principale : la réserve et l'étude.

La **fiche d'une carte** s'ouvre d'un clic sur elle, où qu'elle paraisse. Son entête porte le nom
au centre et, de part et d'autre, deux boutons qui mènent à la carte précédente et à la suivante —
celui de droite a pris la place de la croix, la fenêtre se fermant par Échap, par l'arrière-plan ou
par le bouton « Fermer » de son pied. Les flèches ← et → du clavier font la même chose. Le fil
qu'ils suivent est relevé **sur le document** au moment du geste (`poseParcoursFiche()`) : les
cartes de la section d'où part le clic, dans l'ordre où elle les affiche — filtres, groupement,
tri, pagination et catégories repliées y sont déjà, et il n'y a rien à reconstruire depuis l'état.
Seuls les noms sont retenus, un rendu pouvant survenir entre deux fiches. Les extrémités ne
bouclent pas : le bouton devient inerte, ce qui se voit mieux qu'un saut à l'autre bout. Une fiche
ouverte hors d'une liste — la pastille du commandant, un nom cité dans un texte — n'a pas de fil,
et ses deux boutons restent inertes.

*38 fonction(s), 49 Ko*

La section porte trois listes. La **liste principale** est le deck : elle seule compte dans la
taille, la conformité au format, la courbe de mana, l'équilibre des rôles et les achats. À côté
d'elle, deux **listes annexes** décrites par `ANNEXES` (js/etat.js) : la **Réserve**
(`S.sideboard`, le *sideboard* des listes MTGO) et **À l'étude** (`S.considering`, le
*considering* ou *maybeboard* des sites de decks). Elles tiennent les cartes qu'on garde sous la
main sans les jouer, et rien de ce qu'elles portent n'entre dans un décompte du deck — pas même
les achats : une carte mise de côté n'est pas une carte à acheter.

Les cartes classées **Game Changer** se signalent partout où elles s'affichent — collection, deck,
listes annexes, suggestions — par le tag que rend `tagGameChanger()`, et la fiche en dit la
conséquence. La section Deck en tient le compte, mais seulement dans un format à commandant, où
il veut dire quelque chose : une pastille, et sous le bloc de conformité la phrase de
`ligneGameChangers()`, qui les nomme et rappelle le seuil des paliers — aucune aux paliers 1 et
2, jusqu'à trois au palier 3. Ce n'est pas une faute à corriger : le décompte informe, il
n'accuse pas, et n'entre donc pas dans `legality()`.

Ces trois parties — Liste, Réserve, À l'étude — se replient chacune par son titre, comme les
sections de la page. Le résumé qui suit le titre reste lisible plié — nombre de cartes, valeur,
ce que les filtres masquent —, et le pli se retient d'une séance à l'autre : `S.deckPlie` tient
les clés repliées et part dans la sauvegarde, à côté de l'en-tête compact. Le geste ne bascule
qu'une classe, sans repasser par `renderE()` : rendre le deck note toutes ses cartes, et ce
serait payer une notation pour un simple pli.

Les trois listes s'excluent : une carte vit dans l'une d'elles, jamais dans deux à la fois. Y
poser une carte l'ôte donc d'où elle était, et le déplacement emporte tous ses exemplaires —
`deplacerCarte()`. Le deck l'emporte partout où le doute existe : `deckAdd()` retire la carte de
sa liste annexe, et l'import garde en réserve ce que la liste principale ne porte pas déjà.
Ailleurs dans l'atelier — collection, suggestions —, une carte garée se signale par le tag que
rend `tagAnnexe()`, sans quoi on la reproposerait sans fin.

| Fonction | Rôle |
|---|---|
| `annexeListe(cle)` | La `Map` d'une liste annexe, désignée par sa clé. |
| `annexeEntries(cle)` | Ses cartes, triées comme celles du deck : type, coût, nom. |
| `annexeSize(cle)` | Nombre d'exemplaires qu'elle porte. |
| `annexeDe(nom)` | Où vit cette carte hors du deck, ou rien. |
| `deplacerCarte(nom,cible)` | Déplace une carte d'une liste à l'autre, avec ses exemplaires ; vers le deck, le format borne les copies. |
| `versAnnexe(nom,cle,qty)` | Pose une carte dans une liste annexe, d'où qu'elle vienne. |
| `retirerAnnexe(nom,cle)` | En retire un exemplaire ; le dernier retire la carte. |
| `viderAnnexe(cle)` | Vide la liste. |
| `tagAnnexe(card)` | Le tag « réserve » ou « à l'étude » que la carte porte partout ailleurs. |
| `partieDeck(cle,titre,resume,corps,classe)` | Une partie repliable de la section : titre, résumé lisible plié, corps. |
| `blocAnnexe(cle)` | Rend une des deux listes, filtres de l'en-tête compris. |
| `gameChangersDuDeck()` | Les cartes de la liste principale classées Game Changer. |
| `ligneGameChangers()` | Ce que leur nombre dit du palier, en une phrase, sous le bloc de conformité. |
| `targets()` | Objectifs par rôle selon le format. |
| `deckCounts()` | Compte les cartes du deck par rôle. |
| `gauge(label,val,tgt,role)` | Jauge d'un rôle, cliquable pour filtrer les suggestions. |
| `legality()` | Contrôles de conformité : taille, copies, identité, jetons, budget, et cartes non légales dans le format. |
| `blocAchats()` | Bloc des cartes à acheter, avec budget et liens. |
| `zoneCommandant()` | Encart du commandant : visuel, identité, changement. |
| `evalueDeck(entries)` | Note les cartes du deck avec le moteur des suggestions. |
| `renderE()` | Rend le deck : courbe, rôles, commandant, achats, puis les trois parties repliables — liste principale, réserve, étude. Les trois suivent le même groupement et le même tri, réglés par la barre de la section (js/groupes.js). |
| `addToDeck(name)` | Ajoute un exemplaire depuis l'interface. |
| `deckAdd(card,qty,opts)` | Ajoute des exemplaires au deck, avec ou sans complément de collection. |
| `removeFromDeck(name)` | Retire un exemplaire. |
| `buyCard(name)` | Ajoute une carte en la comptant à l'achat. |

### `js/ui.js` — Interface commune

Symboles de mana, tuiles de cartes, fiche détaillée, aperçu au survol, fenêtres et rendu global,
dont le bouton « Filtres » de l'en-tête, les fenêtres qu'ouvrent ses pastilles, et la fenêtre des
**Paramètres** — sauvegarde locale, collection, catalogue — qu'ouvre l'engrenage du coin
haut-droit.

*113 fonction(s), 95 Ko*

Données : `COLS`, `MODES_COULEUR`, `FILTRE_ICONE`, `PARAM_ICONE`

Données : `RETOURNEES`

| Fonction | Rôle |
|---|---|
| `pipHTML(inner,taille)` | Pastille de repli d'un symbole de mana. |
| `symBg(inner)` | Symbole peint en fond, pour les boutons de couleur. |
| `symIcon(inner,taille)` | Symbole de mana officiel, avec repli si l'image manque. |
| `manaFb(img)` | Remplace un symbole qui n'a pas pu se charger. |
| `manaHTML(card,sm)` | Coût de mana complet d'une carte. |
| `stripeColor(card)` | Bande de couleur d'identité d'une carte. |
| `cardTile(e,ctx)` | Tuile de carte, avec indicateurs propres au deck. Le contexte est la liste d'où elle vient : collection, deck, réserve, étude. |
| `tagGameChanger(card)` | Le tag « game changer », partout où la carte s'affiche. |
| `actesAnnexe(c,cle,avecBascule)` | Les gestes d'une carte garée : remonter au deck, passer à l'autre liste, en retirer un exemplaire. |
| `cardRow(e,ctx)` | Ligne de carte en mode liste. |
| `listeArchetypesHTML()` | Lignes de la liste déroulante : nom, provenance et résumé de fonctionnement. |
| `openFormatModal()` | Ouvre la fenêtre du format et y ouvre un brouillon : rien n'y prend effet avant « Appliquer ». |
| `sectionParametres(titre,chapeau,corps)` | Une section de la fenêtre des paramètres. |
| `corpsCollectionParam()` | La section « Collection » : ce que la collection pèse, et de quoi la remplir ou la vider. |
| `corpsParametres()` | Le corps entier : sauvegarde locale, collection, catalogue. |
| `majFenetreParametres()` | Réécrit ce corps sur place — défilement gardé, champs de fichier rebranchés. |
| `majFenetreCatalogue()` | L'ancien nom, que le chargement d'une archive appelle encore. |
| `brancherParametres()` | Rebranche les interrupteurs et les champs de fichier des trois sections. |
| `appliquerParametres()` | Verse le brouillon du catalogue, recalcule, ferme. |
| `openParametresModal()` | Ouvre la fenêtre des paramètres depuis l'engrenage de l'entête, brouillon compris. |
| `corpsCatalogue()` | Contenu de cette fenêtre : les deux réglages différés, puis la gestion de l'archive. |
| `majFenetreCatalogue()` | La réécrit sans perdre le défilement, et rebranche ses commandes. |
| `appliquerCatalogue()` *(async)* | « Appliquer » : verse le brouillon puis recalcule. |
| `openBudgetModal()` | Ouvre la fenêtre « Achats sur Cardmarket » depuis la pastille « Budget » de l'en-tête, brouillon compris. |
| `corpsBudget()` | Contenu de cette fenêtre : budget, prix maximum par carte, état, langue, vendeur et pays, puis le rappel des achats. |
| `champBudget(id,label,cle,liste)` | Une des listes déroulantes de cette fenêtre. |
| `majResumeBudget()` | Rafraîchit le budget restant et le rappel des achats pendant la saisie, sans réécrire la fenêtre. |
| `appliquerBudget()` *(async)* | « Appliquer » : verse le brouillon puis recalcule, le prix maximum entrant dans la signature des candidates. |
| `corpsFormat()` | Contenu de cette fenêtre : format de jeu, case « écarter les cartes non légales » et panneau « Personnalisé ». |
| `tagIllegal(card)` | Le tag « illégal », partout où la carte s'affiche. |
| `resumeFormat()` | Taille, exemplaires et commandant du format en cours. |
| `majResumeFormat()` | Rafraîchit ce résumé pendant la saisie du format personnalisé. |
| `majFenetreFormat()` | Réécrit la fenêtre au changement de format. |
| `ficheHTML(card)` | Fiche détaillée : rôles ligne à ligne et cartes du deck branchées, combos, capacités extraites, puis en bas de fiche les branchements possibles avec la collection filtrée. |
| `ficheTexteHTML(card)` | Carte rendue en texte — coût, type, force/endurance, texte — à la place du visuel absent. |
| `visuelAttenteHTML()` | Carte vide et son icône de chargement, le temps que le visuel arrive. |
| `rafraichirFiche()` | Reconstruit la fiche ouverte quand Scryfall a répondu ou renoncé. |
| `ficheImageKO(img)` | Bascule sur ce rendu texte quand le visuel ne se charge pas. |
| `openCardModal(name)` | Ouvre la fiche dans une fenêtre : le nom au centre de l'entête, une flèche de chaque côté. |
| `poseParcoursFiche(el,nom)` | Relève le fil de lecture sur le document : les cartes de la section d'où part le geste, dans l'ordre affiché. |
| `ficheVoisine(pas)` | Passe à la carte précédente ou suivante de ce fil, et rend le focus au bouton pressé. |
| `enteteFiche(nom)` | L'entête de la fiche : le nom, son rang dans le fil, et les deux boutons de parcours. |
| `renderTop()` | Barre d'en-tête : totaux, bouton « Filtres », puces des filtres actifs, pastilles qui ouvrent une fenêtre — Format, Budget — et pastilles qui ne font que compter — Collection, Catalogue, Valeur du deck. |
| `openFiltresModal()` | Ouvre la fenêtre des filtres avancés depuis l'en-tête, et y ouvre un brouillon. |
| `verseBrouillon()` | Verse le brouillon dans l'état : le seul moment où une fenêtre à brouillon touche à ce que l'atelier montre. |
| `appliquerFiltres()` *(async)* | « Appliquer » : verse le brouillon dans l'état, lance le filtrage avec sa barre, puis ferme. |
| `ouvreBrouillon(cles,redessine)` | Ouvre un brouillon sur les champs de `S` que la fenêtre règle, et retient comment elle se redessine. |
| `copieEtat(v)` | Copie profonde d'un champ de `S` — `Set` des couleurs, `S.custom` imbriqué. |
| `memeEtat(x,y)` | Compare deux valeurs d'état, `Set` et objets compris. |
| `echangeBrouillon()` | Met le brouillon à la place de l'état appliqué, et rend de quoi revenir. |
| `reprendEtat(memo,garder)` | Repose l'état appliqué, en reversant au brouillon ce qui vient d'être modifié. |
| `avecBrouillon(fn)` | Lit comme si le brouillon était appliqué : c'est ainsi que la fenêtre se peint. |
| `modifieBrouillon(fn)` | Le jumeau écrivain : hors de la fenêtre, `fn` agit sur l'état lui-même. |
| `brouillonModifie()` | Le brouillon diffère-t-il de ce qui est appliqué ? |
| `apresReglage(raison)` | Suite d'un réglage : la fenêtre seule se redessine, ou l'atelier entier hors d'elle — par le recalcul annoncé, avec la raison du geste. |
| `renderAllSiApplique()` | Un rendu global, sauf tant qu'un brouillon rend ce recalcul inutile. |
| `zoneProgression()` | La barre de progression, dans le pied de la fenêtre. |
| `releveAncre()` | Relève le repère le plus proche du haut de la fenêtre, avant tout changement de DOM. |
| `progresSection(txt,fait,total)` | La progression discrète d'un recalcul de fond : le liseré de la section et son décompte. |
| `finProgresSection()` | Retire ce liseré. |
| `restaureAncre(a)` | L'y remet après, en corrigeant le défilement. |
| `candidatsAncre()` | Les repères possibles : les sections et toute carte affichée. |
| `pause()` | Rend la main entre deux tranches de calcul. |
| `pausePeinte()` | La même, mais jusqu'à ce qu'une image ait été peinte. |
| `recalculLong()` | Le recalcul qui vient sera-t-il assez long pour passer par tranches ? |
| `corpsBoiteRecalcul(raison)` | Contenu de la boîte : la raison du recalcul, ce qu'il fait, sa barre. |
| `annonceRecalcul(raison)` | L'ouvre — ou glisse la barre dans le pied de la fenêtre déjà ouverte. |
| `finRecalcul()` | Referme la boîte, ou retire la barre empruntée. |
| `recalculerAvecProgression(raison)` *(async)* | Bâtit les candidates et les note par tranches, annonce le travail s'il dure, puis rend l'atelier. Un seul à la fois : un geste arrivé pendant est repris ensuite. |
| `majProgression(txt,fait,total)` | Avance la barre et son libellé. |
| `filtrerAvecProgression()` *(async)* | Bâtit les candidates puis les note par tranches, barre à l'appui, et rend la main entre chaque lot. |
| `fermetureBrouillon()` | Toute autre fermeture — Annuler, croix, Échap, arrière-plan — jette le brouillon. |
| `appliquerFormat()` *(async)* | « Appliquer » de la fenêtre Format : verse le brouillon, puis recalcule avec la même barre que les filtres. |
| `octets(n)` | Un poids en Ko ou Mo, pour la boîte de progression. |
| `barreCatalogue(id,titre,fait,total)` | Une barre nommée de cette boîte. |
| `corpsBoiteCatalogue()` | Contenu de la boîte : les deux barres et le décompte des cartes. |
| `ouvrirBoiteCatalogue()` | Ouvre la boîte de progression du chargement de l'archive. |
| `majBoiteCatalogue()` | Avance ses barres sans réécrire la fenêtre. |
| `fermerBoiteCatalogue()` | La referme, si c'est bien elle que la fenêtre montre. |
| `corpsFiltres()` | Contenu de cette fenêtre, dans l'ordre : couleur, nom, type, set, texte de règles, archétype, rôle, force, endurance, coût de mana, prix, illustrateur. |
| `etatArchetypes()` | État de la base d'archétypes EDHREC, sous les boutons d'archétype. |
| `listeSetsHTML()` | Lignes de la liste des sets : nom, code, année et taille, du plus récent au plus ancien. |
| `majListeSets()` | Rafraîchit cette liste sans réécrire la fenêtre, pour garder le curseur de saisie. |
| `etatSets()` | État de la liste des sets Scryfall, sous le champ. |
| `ligneFiltre(kMin,kMax,label,aide,pas,min)` | Une ligne « critère min → max » de la fenêtre. |
| `resumeFiltres()` | Décompte des cartes retenues, saisie en attente comprise, et rappel des filtres actifs. |
| `majResumeFiltres()` | Rafraîchit ce décompte à chaque frappe. |
| `majFenetreFiltres()` | Réécrit les champs après une réinitialisation ou un changement de couleur. |
| `renderAll()` | Rend les sept sections, masquées comprises, et programme la sauvegarde. |
| `renderOnglets()` | Pose l'onglet ouvert sur la barre et découvre sa page ; la barre change d'attributs, elle ne se réécrit pas. |
| `activerOnglet(cle,opts)` | Passe à un onglet : rien n'est redessiné, et le défilement retrouve celui que la page avait. |
| `allerVersSection(id)` | Mène à une section d'où qu'on parte : son onglet s'ouvre, et le défilement s'arrête sous l'en-tête collante. |
| `signalerTravail(id,actif,texte)` | Le point d'attente d'un onglet : un travail de fond qui court dans une page qu'on ne regarde pas. |
| `aDeuxFaces(c)` | Détecte une carte recto-verso. |
| `autreFace(c,grande)` | Face opposée, pour la vignette de retournement. |
| `faceVisible(c,grande)` | Face actuellement affichée. |
| `sourceVersions(card)` | Laquelle des deux listes la fiche montre : les éditions possédées ou toutes. |
| `listeVersions(card)` | La liste correspondante. |
| `possedeVersion(card,cle)` | Exemplaires possédés d'une édition, quelle que soit la liste montrée. |
| `basculerSourceVersions(nom,src)` | Passe d'une liste à l'autre ; la première bascule lance la recherche. |
| `versionRang(card)` | Rang de l'édition consultée dans la fiche ouverte. |
| `versionCourante(card)` | L'édition consultée elle-même. |
| `faireDefilerVersion(nom,pas)` | Passe à l'édition précédente ou suivante, en boucle. |
| `visuelVersion(card,v,grande)` | Visuel d'une édition donnée. |
| `visuelEnRecherche(card,v)` | Vrai tant qu'un aller-retour est en vol sans visuel à montrer. |
| `sourceVoulue(card)` | Source demandée, même avant que sa recherche n'aboutisse. |
| `choisirVersion(nom,cle)` | Retient une édition : elle devient celle de la carte, partout. |
| `refCarte(nom)` | Nom de carte survolable et cliquable. |
| `apercuTexte(c)` | Texte de l'aperçu volant : sauts de ligne rétablis, longueur bornée. |
| `placerApercu(x,y)` | Place l'aperçu près du curseur sans sortir de l'écran. |
| `contenuApercu(c)` | Contenu de l'aperçu : visuel, ou texte si absent. |
| `montrerApercu(nom,x,y)` | Affiche l'aperçu au survol. |
| `placerApercuDansCouche()` | Déplace l'aperçu dans la fenêtre modale ouverte, sans quoi elle le masque. |
| `majApercu()` | Met à jour l'aperçu quand le visuel arrive. |
| `cacherApercu()` | Masque l'aperçu. |
| `toast(msg)` | Message temporaire en bas d'écran. |
| `openDialog(title,bodyHTML,footHTML,wide,entete)` | Ouvre une fenêtre modale, sans la rouvrir si elle l'est déjà. `entete` remplace le titre suivi de sa croix — c'est ainsi que la fiche d'une carte pose ses deux boutons de parcours. |

### `js/app.js` — Démarrage et évènements

Écouteurs délégués pour toute l'application, restauration de la sauvegarde et tâches de fond au lancement.

*0 fonction(s), 14 Ko*

| Fonction | Rôle |
|---|---|

## Repères

- 241 fonctions au total, réparties en 14 modules.
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

## Tests

Le fichier `tests/suite.js` rejoue trente vérifications sur un DOM simulé :
démarrage, rendu des cinq sections, sélection de nœuds, précision de l'analyse,
pagination, sauvegarde. Il se lance avec `node tests/suite.js`.
