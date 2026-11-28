/* =====================================================================
   js/anaPalier.js — Le palier du Commander qu'un deck peut revendiquer

   Wizards range les decks Commander en cinq paliers (« brackets »), et les dit
   par ce qu'un deck s'interdit : les Game Changers, la destruction massive de
   terrains, les tours supplémentaires enchaînés, les combos à deux cartes, les
   tuteurs en nombre. Chaque critère se mesure ici, et chacun impose un palier
   plancher ; le palier estimé est le plus haut de ces planchers.

   Ce n'est qu'une estimation, et l'analyse le dit : le palier 1 se distingue du
   2 par l'intention — un deck à thème, qui ne cherche pas à gagner vite —, le 5
   du 4 par le méta qu'il vise. Ni l'un ni l'autre ne se lit dans une liste ; on
   n'annonce donc jamais mieux que « 1 ou 2 », et le 5 n'est qu'un signal.
   ===================================================================== */

const PALIERS = {
  1: {nom:'Exposition', anglais:'Exhibition', aide:'Decks à thème, pour le plaisir de la partie avant celui de gagner.'},
  2: {nom:'Essentiel', anglais:'Core', aide:'Le niveau d\'un deck préconstruit récent : pas de Game Changer, pas de combo à deux cartes.'},
  3: {nom:'Amélioré', anglais:'Upgraded', aide:'Jusqu\'à trois Game Changers, pas de combo à deux cartes qui gagne tôt.'},
  4: {nom:'Optimisé', anglais:'Optimized', aide:'Aucune restriction hors de la liste des cartes bannies.'},
  5: {nom:'Compétitif', anglais:'cEDH', aide:'Le deck le plus fort possible, construit pour un méta compétitif.'}
};

/* Les cartes qui détruisent, renvoient ou gèlent les terrains de toute la
   table, ou changent le mana qu'ils produisent. Le texte en reconnaît la
   plupart ; les quelques noms suivants le disent d'une façon qu'un motif ne
   saisit pas sans en attraper d'autres. */
const DESTRUCTION_TERRAINS_NOMS = new Set(['armageddon', 'ravages of war', 'catastrophe', 'jokulhaups', 'obliterate',
  'decree of annihilation', 'devastation', 'global ruin', 'ruination', 'wildfire', 'burning of xinye', 'sunder',
  'impending disaster', 'destructive force', 'boom // bust', 'cataclysm', 'apocalypse', 'worldfire', 'upheaval',
  'winter orb', 'static orb', 'rising waters', 'hokori, dust drinker', 'back to basics', 'blood moon',
  'magus of the moon', 'contamination', 'infernal darkness', 'keldon firebombers', 'epicenter', 'tectonic break',
  'thoughts of ruin', 'myojin of infinite rage', 'fall of the thran', 'acid rain', 'boil', 'flashfires',
  'tsunami', 'choke', 'desolation angel', 'numot, the devastator', 'mana breach', 'overburden', 'opposition',
  'stasis', 'hall of gemstone', 'ritual of subdual', 'mana vortex', 'death cloud', 'bend or break']);

function estDestructionTerrains(card) {
  if (DESTRUCTION_TERRAINS_NOMS.has(norm(card.name)) || DESTRUCTION_TERRAINS_NOMS.has(norm(frontFace(card.name)))) return true;
  const tx = stripReminder(String(card.text || '')).toLowerCase();
  return /destroy all (?:non\w+ )?lands|destroy all artifacts, creatures, and lands|exile all (?:lands|permanents)\b|each player sacrifices (?:all|x|four|five|six|seven|half the) lands|return all (?:lands|permanents) to their owners'? hands|players can't untap more than (?:one|two) (?:lands?|permanents?)|lands don't untap during|nonbasic lands are (?:mountains|islands|swamps|plains|forests)/.test(tx);
}

function estTourSupplementaire(card) {
  return /takes? an extra turn|extra turn after this one/.test(String(card.text || '').toLowerCase());
}

/* Un tuteur, au sens des paliers, va chercher autre chose qu'un terrain : un
   Cultivate fait du ramp, il n'assure aucun plan. */
function estTuteurPalier(card) {
  if (card.isLand || !card.cats || !card.cats.has('tuteurs')) return false;
  const tx = String(card.text || '').toLowerCase();
  const recherches = tx.match(/search (?:your|their) library for [^.]*/g) || [];
  return !recherches.length || recherches.some(r => !/\bland\b/.test(r) || /\bnonland\b/.test(r));
}

/* L'accélération des decks compétitifs : de quoi produire du mana pour zéro ou
   un mana, hors terrains. Un Sol Ring en est, un Birds of Paradise aussi. */
function estManaRapide(card) {
  return !card.isLand && card.cmc <= 1 && card.cats && card.cats.has('ramp') && !!manaProduitDe(card);
}

/* Un sort qu'on lance sans payer son coût de mana : la protection des decks
   compétitifs, qui répond au premier tour sans rien engager. */
function estSortGratuit(card) {
  const tx = String(card.text || '').toLowerCase();
  return /rather than pay (?:this spell's|its) mana cost|without paying (?:this spell's|its) mana cost if/.test(tx)
    && /instant/i.test(card.type);
}

/* Chaque critère, ce qu'il compte, les cartes qui le font compter et le palier
   plancher qu'il impose. `inconnu` dit qu'on ne peut pas juger : la liste des
   Game Changers vient de Scryfall, et un atelier hors ligne peut ne pas l'avoir. */
function criteresPalier() {
  const cartes = cartesDuDeck();
  const noms = cartes.map(c => c.name);
  const avec = test => cartes.filter(test);
  const gcConnus = gameChangersConnus();
  const gc = gcConnus ? avec(c => estGameChanger(c) === true) : [];
  const mld = avec(estDestructionTerrains);
  const tours = avec(estTourSupplementaire);
  const tuteurs = avec(estTuteurPalier);
  const combos = combosDuDeck(noms);
  const rapides = avec(estManaRapide);
  const gratuits = avec(estSortGratuit);

  const crit = [];
  crit.push({cle:'gc', label:'Game Changers', n:gc.length, cartes:gc, inconnu:!gcConnus,
    plancher: !gcConnus ? null : (gc.length > 3 ? 4 : (gc.length ? 3 : 1)),
    regle:'Aucun aux paliers 1 et 2, trois au plus au palier 3.'});
  crit.push({cle:'mld', label:'Destruction massive de terrains', n:mld.length, cartes:mld,
    plancher: mld.length ? 4 : 1, regle:'Interdite jusqu\'au palier 3.'});
  crit.push({cle:'tours', label:'Tours supplémentaires', n:tours.length, cartes:tours,
    plancher: tours.length >= 3 ? 4 : (tours.length ? 2 : 1),
    regle:'Absents au palier 1, en petit nombre et jamais enchaînés aux paliers 2 et 3.'});
  crit.push({cle:'tuteurs', label:'Tuteurs (hors terrains)', n:tuteurs.length, cartes:tuteurs,
    plancher: tuteurs.length > 3 ? 3 : 1, regle:'Rares aux paliers 1 et 2.'});
  /* Un combo dont les deux pièces coûtent six mana ou moins peut gagner tôt :
     c'est la frontière que le palier 3 trace. */
  const tot = combos.filter(x => x.cout <= 6);
  crit.push({cle:'combos', label:'Combos à deux cartes reconnus', n:combos.length, combos,
    cartes:[...new Set(combos.flatMap(x => [x.a, x.b]))].map(find).filter(Boolean),
    plancher: tot.length ? 4 : (combos.length ? 3 : 1),
    regle:'Aucun aux paliers 1 et 2 ; au palier 3, seulement s\'il ne gagne pas tôt.'});
  return {crit, rapides, gratuits, gc, combos};
}

/* Le verdict : le plus haut des planchers, la raison qui l'impose, et le
   signal d'un profil compétitif quand le deck en a tous les traits. */
function estimePalier() {
  const r = criteresPalier();
  const connus = r.crit.filter(c => c.plancher !== null);
  let palier = Math.max(2, ...connus.map(c => c.plancher));
  const raisons = connus.filter(c => c.plancher === palier && palier > 2);
  const sorts = deckEntries().filter(e => !e.card.isLand);
  const qte = sorts.reduce((a, e) => a + e.qty, 0);
  const cmcMoyen = qte ? sorts.reduce((a, e) => a + e.card.cmc * e.qty, 0) / qte : 0;
  const tuteurs = r.crit.find(c => c.cle === 'tuteurs').n;
  const signaux = [
    r.gc.length >= 6 && `${r.gc.length} Game Changers`,
    r.rapides.length >= 5 && `${r.rapides.length} sources de mana à 0 ou 1`,
    tuteurs >= 5 && `${tuteurs} tuteurs`,
    r.combos.some(x => x.cout <= 4) && 'un combo à quatre mana ou moins',
    r.gratuits.length >= 2 && `${r.gratuits.length} sorts de protection gratuits`,
    qte && cmcMoyen <= 2.6 && `un coût moyen de ${cmcMoyen.toFixed(2)}`
  ].filter(Boolean);
  const competitif = palier === 4 && signaux.length >= 4;
  return {palier, competitif, signaux, raisons, ...r, inconnu: r.crit.some(c => c.inconnu)};
}
