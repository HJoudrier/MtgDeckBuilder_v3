# Atelier MTG — consignes de travail

Application d'aide à la construction de deck Magic. **Aucun serveur, aucune dépendance, aucun
build** : `index.html` s'ouvre directement dans un navigateur. Les fichiers de `js/` partagent la
portée globale et sont chargés dans l'ordre par `index.html` — pas de modules ES, ni `import`, ni
`export`. C'est une contrainte tenue, pas un retard : l'atelier doit rester utilisable par simple
ouverture du fichier.

Le `package.json` de la racine, avec `src/`, `public/` et `vite.config.ts`, est le reliquat d'un
échafaudage React sans rapport avec l'atelier. Ne rien en attendre et ne rien y ajouter, sauf les
scripts d'outillage.

## Où lire, dans cet ordre

| Fichier | Ce qu'il porte |
|---|---|
| `README.md` | L'architecture, les décisions, les pièges. 200 lignes. |
| `PARCOURS.md` | Qui appelle qui et dans quel ordre, en diagrammes de séquence. |
| `doc/fonctions.md` | L'inventaire des 451 fonctions. **Généré** — jamais écrit à la main. |

Lire la carte avant de fouiller : ces trois fichiers coûtent moins que l'exploration qu'ils
remplacent. Ensuite, lire **ciblé** — `grep -n`, `sed -n '120,180p'` — plutôt qu'un fichier entier.

## Règles de code

**Un fichier par chose, et petit.** Un fichier par zone de l'écran, par fenêtre modale ou par
mécanisme. Au-delà de **300 lignes**, couper : on lit moins pour comprendre une pièce, et on réécrit
moins pour la changer. Un fourre-tout nommé d'après une couche — l'ancien `ui.js` et ses 1 971
lignes — est à découper, pas à nourrir. Convention : `fen*.js` pour une fenêtre modale, un nom de
chose pour le reste (`apercu.js`, `ancre.js`, `tuiles.js`). Un fichier neuf s'ajoute à la liste des
`<script>` de `index.html` et au plan du README.

**Le marqueur de version.** Chaque `<script>` et la feuille de style portent `?v=AAAAMMJJx` dans
leur adresse. Dès qu'un changement touche `index.html` **et** ce qu'il charge, rehausser le marqueur
partout d'un coup (`sed -i 's/?v=20260911a/?v=20260911b/g' index.html`) : sans quoi un cache en
retard donne des boutons nus et des gestes sans effet.

**Un seul aiguillage.** `app.js` porte un écouteur `click` délégué qui dispatche sur `data-act`, et
un écouteur `change` pour les sélecteurs et les cases. Ne jamais poser d'écouteur en ligne ni
d'écouteur propre à un élément : ajouter un `data-act` et une branche.

**Un seul état.** L'objet mutable `S` (`js/etat.js`). Tout champ ajouté à `S` qui doit survivre au
rechargement s'ajoute **aussi** à `snapshot()` et à `restore()` (`js/stockage.js`) — et prévoir la
migration d'une sauvegarde d'hier qui ne le porte pas. La sauvegarde est différée de 700 ms : un
test qui recharge trop vite lit l'état d'avant.

**Les fenêtres à « Appliquer ».** Rien ne doit agir avant le bouton : `ouvreBrouillon`,
`modifieBrouillon`, `avecBrouillon`, `verseBrouillon` (`js/brouillon.js`).

**Le repeint.** `renderAll()` (`js/rendu.js`) est l'unique porte. Encadrer par `releveAncre()` et
`restaureAncre()` (`js/ancre.js`) tout ce qui peut déplacer la lecture. Une liste ne se réécrit
qu'en place (`poseCorps()`, `js/suggestions.js`) : le lecteur au milieu de trois cents vignettes ne
doit pas être renvoyé au début.

**Les commentaires** sont de la prose française qui dit *pourquoi*, jamais *quoi* — le code dit
déjà quoi. Ils servent de source à `doc/fonctions.md` : la première phrase de celui qui précède une
fonction devient son rôle dans l'inventaire.

⚠️ **Jamais de backtick dans un commentaire placé à l'intérieur d'un template literal** : il ferme
le littéral et casse le fichier d'une façon illisible (`ReferenceError` sur un nom qui n'existe
pas). Mettre la note au-dessus de la fonction.

## Après un changement de code

1. `node outils/genDoc.js` — réécrit `doc/fonctions.md`. Ne jamais l'éditer à la main.
2. `README.md` et `PARCOURS.md` **seulement** si l'architecture, une décision ou un parcours change.
   Ajouter une fonction ne les concerne pas : ils ne portent aucun décompte ni aucune taille.
3. Rehausser le marqueur `?v=` si `index.html` est touché.
4. Vérifier dans le navigateur (ci-dessous).

## Vérifier

```
python3 -m http.server 8123          # depuis la racine du projet
```

Playwright est installé dans le répertoire de travail temporaire de la séance ; le navigateur est
**épinglé** et ne doit pas être retéléchargé :

```js
chromium.launch({executablePath:'/opt/pw-browsers/chromium-1194/chrome-linux/chrome'})
```

Le réseau vers Scryfall et EDHREC est coupé dans le bac à sable : injecter de fausses données
(`S.edhrec = {...}`) plutôt que d'attendre une réponse. Les 404 sur `oracle-cards.json*` et
`favicon.ico` au démarrage sont normaux — l'atelier cherche une archive locale qui n'est pas dans le
dépôt. Un `ERR_TUNNEL_CONNECTION_FAILED` est le réseau coupé, pas un bug.

Un test vérifie par **assertions** : présence des fonctions, textes, styles calculés, état de `S`
après un geste. Les scripts de vérification restent dans le répertoire temporaire, ils ne sont pas
versionnés.

## Captures d'écran : non, par défaut

**Ne pas produire de captures d'écran.** Elles coûtent cher et n'apportent rien qu'une assertion sur
le style calculé ne dise mieux. Vérifier par mesure — `getComputedStyle`, `getBoundingClientRect`,
`textContent` — et rendre le résultat en texte. Une capture seulement si je la demande, ou si le
doute porte vraiment sur l'aspect visuel et sur rien d'autre.

## Git

Développer, committer et pousser sur la branche indiquée en début de séance. `git push -u origin
<branche>`. Ne pas ouvrir de pull request sans demande explicite.
