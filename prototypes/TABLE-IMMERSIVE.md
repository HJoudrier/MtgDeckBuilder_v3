# Table de jeu : cinq pistes

Une maquette jouable, à côté de l'atelier, pour choisir comment refondre la table de jeu : plus
intuitive, plus immersive, les actions ramenées sur le champ de bataille, avec mouvements, sons et
vibrations. Elle ne touche ni au moteur ni à `index.html`.

Ouvrir [`table-immersive/index.html`](table-immersive/index.html), directement ou par un serveur
statique (`python3 -m http.server 8123` depuis la racine). Une petite partie contre Mirela s'y joue
sous chacune des cinq pistes ; on change de piste en cours de partie, la partie continue.

La partie est écrite à la main (`scene.js`) avec des cartes inventées : elle montre les moments qui
comptent (poser un terrain, un sort qui passe par la pile, une cible, une attaque, une réponse de
l'adversaire à laquelle on répond, le tour adverse), rien de plus.

## Les cinq pistes

| | Piste | L'idée | Effort |
|---|---|---|---|
| 1 | Le bouton de tour | Un bouton rond sur la ligne de front, sous le pouce, dont le libellé dit ce qui va se passer ; un anneau montre la priorité qui passe seule. | moyen |
| 2 | Tout au doigt | On glisse les cartes vers le champ ou sur leur cible ; on pousse les créatures pour attaquer ; un curseur à faire glisser pour passer. | gros |
| 3 | Sur la carte | Toucher une carte ouvre ses actions autour d'elle ; la question d'un sort adverse s'accroche à ce sort. | moyen |
| 4 | Le théâtre | Tapis en perspective, la pile sous un projecteur, bannières, chocs, éclats. | gros |
| 5 | Le fil du tour | Les étapes forment une piste entre les champs ; le jeton est le bouton « passer », on le glisse pour passer plusieurs étapes, on pose les arrêts d'un appui long. | moyen |

## Le socle commun

- **Les cartes voyagent** d'une zone à l'autre par mesure avant et après le repeint (FLIP,
  `mouvements.js`). La table de l'atelier repeint déjà par régions (`peinsRegions()`) : c'est là que
  le socle se brancherait.
- **Les effets se déduisent de la différence entre deux vues**, donc chez l'invité comme chez l'hôte,
  sans toucher au moteur. Réserve : le moteur donne un `id` neuf à chaque changement de zone ; la vue
  devrait porter l'`id` d'avant quand le joueur voyait les deux zones, sinon l'animation part de
  l'ancre de la zone (main adverse, bibliothèque).
- **Sons synthétisés** par Web Audio (`sons.js`) : aucun fichier, l'atelier reste un fichier qu'on ouvre.
- **Vibrations** par `navigator.vibrate` : Android oui, iPhone non. Un témoin les affiche sous le
  téléphone de la maquette.
- **Réglables** : son, vibrations, intensité des effets, à ranger dans `S.table` et donc dans
  `snapshot()`/`restore()`. « Mouvements réduits » est respecté.

La table a gagné entre-temps l'explication de la pile (`descriptionPile()`, `pileExpliqueHTML()`), le
contexte des questions et une pause de lecture avec « Continuer » : les pistes s'y appuient (la bulle de
la piste 3 et le projecteur de la piste 4 en portent le texte, l'anneau de la piste 1 rend la pause
visible). Le paiement manuel (`jeuManaManuel.js`) se loge dans la couronne de la piste 3.

## Recommandation

Le socle commun d'abord, puis la piste 1, avec trois emprunts : la phrase « si vous passez… » et
les arrêts posés sur les étapes (piste 5), le glisser vers le haut pour jouer (piste 2). Le théâtre
devient le niveau « spectaculaire » du réglage des effets, à deux joueurs.
