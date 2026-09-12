/* =====================================================================
   js/archetypesLibelles.js — Le nom français des thèmes EDHREC
   ===================================================================== */

/* =====================================================================
   Archétypes de deck. La liste et l'appartenance des cartes viennent
   d'EDHREC (js/externes.js) ; les tables ci-dessous ne servent qu'à
   l'affichage : un libellé français pour les thèmes les plus courants,
   et une phrase disant ce que l'archétype fait.
   ===================================================================== */

const ARCH_LABELS = {
  'aristocrats':'Aristocrates / Sacrifice', '+1-+1-counters':'Marqueurs +1/+1',
  'tokens':'Jetons', 'spellslinger':'Spellslinger', 'flying':'Vol',
  'combat':'Combat / attaque', 'blink':'Blink / ETB', 'reanimator':'Cimetière / Réanimation',
  'landfall':'Landfall / terrains', 'voltron':'Voltron / Auras & équipements',
  'lifegain':'Gain de vie', 'artifacts':'Artefacts', 'enchantments':'Enchantements',
  'control':'Contrôle / Stax', 'mill':'Meule (mill)', 'sacrifice':'Sacrifice',
  'graveyard':'Cimetière', 'equipment':'Équipements', 'auras':'Auras',
  'lands-matter':'Terrains', 'counters':'Marqueurs', 'ramp':'Ramp / mana',
  'card-draw':'Pioche', 'treasure':'Trésors', 'theft':'Vol de permanentes',
  'extra-turns':'Tours supplémentaires', 'extra-combats':'Combats supplémentaires',
  'discard':'Défausse', 'burn':'Dégâts directs', 'go-wide':'Nombre'
};

/* Résumés de fonctionnement affichés dans la liste déroulante. Un thème
   absent de cette table s'affiche avec le nombre de decks qu'EDHREC lui
   compte. Ils viennent de ma connaissance du jeu, pas d'une source. */
const ARCH_RESUMES = {
  'aristocrats':    "Sacrifie ses propres créatures et se nourrit de leur mort : drain, jetons, valeur.",
  '+1-+1-counters': "Pose des marqueurs +1/+1, les démultiplie et récompense les créatures grandies.",
  'tokens':         "Crée des jetons en nombre, puis les transforme en menace ou en carburant.",
  'spellslinger':   "Tourne autour des éphémères et des rituels : prouesse, magecraft, copies.",
  'flying':         "Créatures volantes et effets qui donnent le vol, pour passer au-dessus du sol.",
  'combat':         "Déclenchements à l'attaque, phases de combat additionnelles et percée.",
  'blink':          "Scintille ses permanentes pour rejouer leurs arrivées en jeu, encore et encore.",
  'reanimator':     "Met de grosses cartes au cimetière, puis les ramène en jeu à moindre coût.",
  'landfall':       "Récompense chaque terrain qui arrive : jetons, marqueurs, dégâts.",
  'voltron':        "Réunit auras et équipements sur une seule créature, jusqu'à la rendre létale.",
  'lifegain':       "Gagne des points de vie et convertit ce gain en cartes, en corps ou en dégâts.",
  'artifacts':      "Artefacts qui comptent : trésors, affinité, bricolage, récursion.",
  'enchantments':   "Enchantements qui comptent : constellation, auras et récursion associées.",
  'control':        "Contresorts, interaction et taxes : garder la main jusqu'à conclure tranquillement.",
  'mill':           "Vide les bibliothèques, la sienne pour s'en servir ou celles d'en face pour gagner.",
  'sacrifice':      "Sacrifie ses propres permanentes pour en tirer valeur, mana ou dégâts.",
  'graveyard':      "Traite le cimetière comme une seconde main : récursion, flashback, escape.",
  'group-hug':      "Donne cartes et mana à tout le monde, puis tire parti de l'abondance ou gagne autrement.",
  'wheels':         "Défausse et repioche des mains entières, en tirant profit de chaque cycle.",
  'chaos':          "Effets aléatoires et symétriques qui brouillent la partie au profit de qui s'y est préparé.",
  'infect':         "Créatures à infection : dix marqueurs poison suffisent, sans toucher aux points de vie.",
  'superfriends':   "Accumule les planeswalkers, les protège et prolifère leurs marqueurs de loyauté.",
  'vehicles':       "Véhicules pilotés par de petites créatures, hors de portée de l'interaction entre deux combats.",
  'clones':         "Copie les meilleures permanentes, les siennes comme celles d'en face.",
  'politics':       "Marchandage, dons temporaires et votes, pour diriger les attaques ailleurs.",
  'storm':          "Enchaîne les sorts dans un même tour pour déclencher un final démultiplié.",
  'pillowfort':     "Rend les attaques coûteuses ou impossibles, le temps de gagner autrement.",
  'stax':           "Taxe et verrouille les ressources adverses, en gardant de quoi conclure.",
  'ramp':           "Accélère la production de mana pour lancer plus tôt de plus grosses cartes.",
  'big-mana':       "Beaucoup de mana, peu de cartes, mais chacune décisive.",
  'card-draw':      "Enchaîne les pioches pour garder la main pleine et trouver ses pièces.",
  'lands-matter':   "Fait du terrain une ressource active : récursion, animation, déclenchements.",
  'counters':       "Marqueurs de toutes sortes, posés puis démultipliés par la prolifération.",
  'equipment':      "Équipements réunis sur peu de créatures, souvent une seule menace.",
  'auras':          "Auras empilées sur une créature clé, avec de quoi la protéger de l'interaction.",
  'theft':          "Prend le contrôle des permanentes adverses et les retourne contre elles.",
  'combo':          "Deux ou trois pièces qui, réunies, referment la partie sur place.",
  'burn':           "Dégâts directs au visage, sans passer par le combat.",
  'lifeloss':       "Fait perdre des points de vie à tous les adversaires, souvent en en gagnant.",
  'discard':        "Vide les mains adverses et se nourrit de leur défausse.",
  'treasure':       "Jetons Trésor : du mana temporaire, et une ressource à sacrifier.",
  'energy':         "Compteurs d'énergie accumulés puis dépensés pour des effets répétés.",
  'monarch':        "Prend la couronne et la garde, pour piocher à chaque fin de tour.",
  'extra-turns':    "Enchaîne les tours supplémentaires jusqu'à conclure.",
  'extra-combats':  "Rejoue la phase de combat, en démultipliant une attaque déjà gagnante.",
  'defenders':      "Murs et grosses endurances, transformés en menace le moment venu.",
  'power-matters':  "Récompense la force brute des créatures.",
  'untap':          "Dégage ses permanentes pour réutiliser leurs capacités dans le tour.",
  'flash':          "Joue à vitesse d'éphémère, en réaction, en gardant ses options ouvertes.",
  'populate':       "Recopie ses meilleurs jetons, tour après tour.",
  'proliferate':    "Ajoute un marqueur de chaque sorte, partout où il y en a déjà.",
  'go-wide':        "Beaucoup de petites créatures, puis un effet global qui les rend menaçantes.",
  'aggro':          "Menaces rapides et pression constante dès les premiers tours.",
  'toolbox':        "Tuteurs et réponses à la carte, cherchées selon la situation."
};
