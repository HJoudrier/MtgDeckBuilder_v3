/* =====================================================================
   fiches.js — Ce que dit chaque piste, à côté de sa maquette

   Le principe, ce qu'il faut essayer dans la maquette, ce qu'on voit,
   entend et sent, et ce que ça coûterait dans l'atelier.
   ===================================================================== */

const FICHES = {
  bouton: {
    n: 1, nom: 'Le bouton de tour', effort: 'Moyen',
    accroche: 'Un seul gros bouton, sur la ligne de front, qui dit toujours ce qui va se passer.',
    principe: `Le bandeau du bas disparaît. Entre votre champ et celui de Mirela court une ligne de front : l'étape à gauche, la pile au centre,
      et à droite, sous le pouce, un bouton rond. Son libellé suit le moment : « Combat », « Attaquer (2) », « Laisser résoudre », « Fin du tour ».
      Une phrase dessous dit ce qu'il fera. Quand vous n'avez rien à jouer, un anneau se remplit sur le bouton et la priorité passe seule ; un
      toucher la retient.`,
    essais: ['Touchez la Montagne de votre main : elle se lève. Touchez le bouton « Jouer », ou poussez-la vers le haut.',
      'Lancez le Loup des cendres : il traverse la pile au centre, puis rejoint votre champ.',
      'Touchez « Combat », puis vos deux créatures, puis « Attaquer (2) ».',
      'Quand Mirela répond et que vous n\'avez rien, l\'anneau tourne : touchez-le pour garder la main.'],
    mouvements: 'Les cartes voyagent entre les zones ; la main est en éventail ; les cartes jouables se lèvent et brillent.',
    sons: 'Un déclic à chaque geste, une clochette quand la priorité revient, un choc sourd quand une carte se pose.',
    vibrations: 'Brève à la pose, double quand c\'est à vous, longue quand vous perdez des points de vie.',
    atelier: `<code>tableQuestions.js</code> ne peint plus un bandeau mais le bouton et ses puces ; <code>tableRendu.js</code> ajoute une région
      « front » à la charpente, entre les adversaires et votre champ, et la pile y migre. L'appui long et la loupe ne changent pas.`,
    limites: 'Les questions rares (valeur de X, modes, cartes à choisir dans une liste) ne tiennent pas dans un bouton : elles gardent une feuille qui monte du bas.'
  },
  gestes: {
    n: 2, nom: 'Tout au doigt', effort: 'Gros',
    accroche: 'On joue en faisant glisser les cartes, comme sur une vraie table. Aucun bouton d\'action.',
    principe: `Glisser une carte de la main vers son champ la joue ; la glisser sur une créature ou un joueur le cible, une flèche suit le doigt et la
      cible grossit dessous. Pousser une créature vers Mirela la fait attaquer, la ramener annule. Pour passer, on fait glisser un curseur
      jusqu'au bout, comme pour déverrouiller un téléphone : on ne passe jamais par erreur. Un toucher simple ne joue rien, il montre la carte.`,
    essais: ['Glissez la Montagne de votre main vers votre champ.',
      'Glissez l\'Éclair de forge sur le Drake des brumes : la flèche suit, le Drake grossit.',
      'Faites glisser le curseur jusqu\'au bout pour aller au combat, puis poussez vos créatures vers le haut.',
      'Lâchez une carte n\'importe où ailleurs : elle revient se ranger.'],
    mouvements: 'La carte suit le doigt et s\'incline ; elle revient en place si on la lâche ailleurs ; une main fantôme montre le geste la première fois.',
    sons: 'Un froissement quand la carte part, un choc à la pose, un déclic à chaque cran du curseur.',
    vibrations: 'Un cran en franchissant le seuil du champ, un verrou sur une cible, une impulsion à la validation.',
    atelier: `Un module de glisser (<code>js/tableGlisser.js</code>) sur les écouteurs de pointeur d'<code>app.js</code>, qui portent déjà l'appui
      long. Les rangées qui défilent à l'horizontale se disputent le geste avec lui : il faut un seuil vertical, et un repli au toucher pour
      le clavier et l'accessibilité.`,
    limites: 'Moins découvrable : les gestes s\'apprennent. Sur un écran d\'ordinateur, glisser à la souris est plus lent qu\'un clic.'
  },
  carte: {
    n: 3, nom: 'Sur la carte', effort: 'Moyen',
    accroche: 'Touchez une carte : ce qu\'on peut en faire s\'ouvre autour d\'elle. Chaque question s\'affiche là où elle se pose.',
    principe: `Plus de liste d'actions en bas de l'écran. Toucher une carte ouvre une couronne de pastilles autour d'elle : Lancer, Attaquer, Voir.
      Quand Mirela lance un sort, une bulle s'accroche à lui et dit qui il vise, avec « Répondre » et « Laisser résoudre ». Au combat, une épée
      apparaît sur chaque créature qui peut attaquer. Le bouton pour passer vit sur la ligne entre les deux champs et dit où il mène ; une
      réglette, au bord droit, montre l'étape.`,
    essais: ['Touchez le Loup des cendres dans votre main : la couronne s\'ouvre au-dessus.',
      'Allez au combat et touchez les épées sur vos créatures.',
      'Attendez la réponse de Mirela : la bulle s\'accroche à son sort et pointe sa cible.',
      'Touchez une carte qu\'on ne peut pas jouer : la couronne dit « Pas maintenant », et pourquoi.'],
    mouvements: 'La couronne éclot depuis la carte ; la bulle suit le sort ; les cartes voyagent comme ailleurs.',
    sons: 'Sobres : un froissement à l\'ouverture de la couronne, la clochette de la priorité.',
    vibrations: 'Un tic à l\'ouverture, le double coup quand c\'est à vous.',
    atelier: `La loupe (<code>tableLoupe.js</code>) devient une couronne pour les cas simples et garde sa fiche pour l'appui long.
      <code>questionHTML()</code> éclate en bulles ancrées : elles ont besoin de la position des cartes, que <code>tableFleches.js</code> calcule déjà.`,
    limites: 'À cinq adversaires, la bulle doit trouver sa place sans masquer ; près des bords, la couronne se replie.'
  },
  theatre: {
    n: 4, nom: 'Le théâtre', effort: 'Gros',
    accroche: 'La partie mise en scène : la table en perspective, la pile sous un projecteur, le combat qui se voit et s\'entend.',
    principe: `Le champ de bataille est un tapis vu en légère perspective. Chaque sort lancé monte au centre, en grand, sous un projecteur, et le
      reste s'assombrit : on lit la carte, sa cible, et on décide sous elle. Toucher une carte de sa main la monte aussi au projecteur, pour la
      lire avant de la jouer. Les tours s'annoncent par une bannière, les attaquants avancent, les coups font trembler la table, les
      créatures détruites se brisent en éclats.`,
    essais: ['Touchez le Loup des cendres : il monte au projecteur. Lancez-le.',
      'Lancez l\'Éclair de forge sur Mirela et regardez l\'impact.',
      'Attaquez avec tout : les créatures avancent, le choc fait trembler la table.',
      'Laissez Mirela jouer son tour : bannière, gong, et l\'alerte quand elle vous attaque.'],
    mouvements: 'Trajectoires plus amples avec un léger rebond, éclats, tremblement, voile rouge quand vous êtes blessé, bannières de tour.',
    sons: 'Un gong à chaque tour, un souffle pour l\'attaque, un impact, des éclats, un accord quand un sort se résout.',
    vibrations: 'Motif d\'alerte quand on vous attaque, coup long quand vous perdez des points de vie, salve en fin de partie.',
    atelier: `Le plus coûteux. La perspective gêne la lecture des petites cartes : elle se réserve à la disposition « Arène » et à deux joueurs.
      L'intensité devient un réglage du menu de la table (<code>S.table.effets</code> : sobres, normaux, spectaculaires), à ranger dans
      <code>snapshot()</code> et <code>restore()</code>.`,
    limites: 'Fatigue sur une longue partie, lenteur ressentie, et la perspective ne tient pas à six joueurs : doit pouvoir se réduire.'
  },
  fil: {
    n: 5, nom: 'Le fil du tour', effort: 'Moyen',
    accroche: 'Le tour est un chemin tracé entre les deux champs. Un jeton y avance : c\'est lui, le bouton pour passer.',
    principe: `Les étapes du tour forment une piste au milieu du champ de bataille. Un jeton de laiton est posé sur l'étape en cours : le toucher,
      c'est passer ; le faire glisser plus loin, c'est passer jusque-là, et chaque étape franchie se sent sous le doigt comme un cran. Sous la
      piste, une phrase dit ce qui va arriver. Un appui long sur une étape y pose un arrêt pour le tour de Mirela. La pile s'empile au-dessus
      du jeton.`,
    essais: ['Touchez une carte qui brille : elle se joue, comme aujourd\'hui.',
      'Faites glisser le jeton jusqu\'à « Fin » : les crans défilent, la phrase dit jusqu\'où.',
      'Posez un arrêt sur « Attaquants » (appui long), puis laissez Mirela jouer : la main vous revient quand son Drake attaque, pour l\'Éclair.',
      'Touchez le jeton pendant une attaque pour la valider.'],
    mouvements: 'Les cartes voyagent, le jeton glisse sur sa piste ; rien qui tremble ni qui éclate.',
    sons: 'Un déclic par cran, la clochette de la priorité, un choc sourd à la pose. Rien de plus.',
    vibrations: 'Un cran par étape franchie, une impulsion quand un arrêt est posé.',
    atelier: `<code>tablePhases.js</code> peint déjà la barre des étapes : elle devient la piste et descend entre les champs. Les arrêts
      (<code>fenArrets.js</code>, <code>doitDemander()</code>) se posent directement dessus, et « Jusqu'à mon tour » devient un glisser jusqu'à la fin.`,
    limites: 'La piste prend de la hauteur au milieu de l\'écran. Elle s\'apprend vite, mais demande un premier essai de plus que le gros bouton.'
  }
};

function ficheHTML(id) {
  const f = FICHES[id];
  if (!f) return '';
  return `<p class="f-surtitre">Piste ${f.n} sur 5 · effort d'intégration : ${esc(f.effort.toLowerCase())}</p>
    <h2>${esc(f.nom)}</h2>
    <p class="f-accroche">${esc(f.accroche)}</p>
    <p>${f.principe}</p>
    <h3>À essayer dans la maquette</h3>
    <ol class="f-essais">${f.essais.map(e => `<li>${esc(e)}</li>`).join('')}</ol>
    <dl class="f-sens">
      <div><dt>Mouvements</dt><dd>${esc(f.mouvements)}</dd></div>
      <div><dt>Sons</dt><dd>${esc(f.sons)}</dd></div>
      <div><dt>Vibrations</dt><dd>${esc(f.vibrations)}</dd></div>
    </dl>
    <h3>Dans l'atelier</h3>
    <p>${f.atelier}</p>
    <p class="f-limites"><b>Limites.</b> ${esc(f.limites)}</p>`;
}
