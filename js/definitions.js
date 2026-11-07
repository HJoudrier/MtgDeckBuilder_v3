/* =====================================================================
   js/definitions.js — D'une carte à sa définition de jeu

   La définition est ce que le moteur joue : coût, types, force, mots-clés,
   l'effet d'un sort, les capacités d'un permanent, et la **couverture** — ce
   qui a été compris, ce qui ne l'a pas été. Elle se calcule une fois par
   carte et par texte, puis se garde : une partie la lit des milliers de fois,
   un lot de simulations des millions.

   Le moteur ne lit jamais une carte de l'atelier, seulement une **fiche**
   `{nom, cout, type, texte, force, endurance, loyaute, motsCles, faces,
   ptBrut, manaProduit}` : la préparation la fabrique (js/simPreparation.js),
   et le moteur reste ainsi chargeable sans `DB` ni DOM.
   ===================================================================== */

/* À rehausser dès que le compilateur change ce qu'il comprend : la
   signature d'un lot de simulations l'inclut, et un rejeu fait avec un
   autre compilateur ne rejouerait pas la même partie. */
const COMPILO_V = 1;

const DEFS = new Map();

/* Une empreinte courte d'un texte, pour la clé du mémo et les signatures. */
function empreinte(s) {
  let h = 5381;
  s = String(s || '');
  for (let i = 0; i < s.length; i++) h = ((h << 5) + h + s.charCodeAt(i)) | 0;
  return (h >>> 0).toString(36);
}

/* Ce qui, ignoré, rendrait la carte **plus forte** qu'elle n'est : une
   contrepartie, une interdiction, un prix. Une carte dont une part ignorée y
   ressemble est déclarée injouable — ne pas comprendre une carte ne doit
   jamais avantager le deck qui la porte. */
const CONTREPARTIE = /\byou lose\b|\bsacrifice\b|\bskip\b|\bcan't\b|\bunless\b|\bpay\b|\bdiscard\b|\bopponents? (?:draws?|gains?)\b|\bdamage to you\b|\bdoesn't untap\b|\badditional cost\b|\bcumulative upkeep\b|\becho\b|\bexile ~\b|\breturn ~ to\b|\bits controller\b|\bthat player\b|\btheir library\b/;

const MANA_DES_TYPES = {plains: 'W', island: 'U', swamp: 'B', mountain: 'R', forest: 'G'};

function nombreFiche(v) { return v != null && /^\d+$/.test(String(v)) ? +v : null; }

/* Les couleurs d'une carte, lues dans son coût ; un jeton dit les siennes. */
function couleursDe(cout, fiche) {
  if (Array.isArray(fiche.couleurs)) return fiche.couleurs.slice();
  return ['W', 'U', 'B', 'R', 'G'].filter(k => cout.couleurs[k] > 0 || cout.hybrides.some(h => h.includes(k)));
}

/* Verser une ligne comprise dans la définition. */
function verseLigne(def, res) {
  if (!res) return;
  switch (res.genre) {
    case 'mots':
      def.mots |= res.mots;
      Object.assign(def.params, res.params);
      res.caps.forEach(cap => { def[cap.genre === 'equip' ? 'equipe' : cap.genre] = cap.cout; });
      break;
    case 'aura': def.aura = res.desc; break;
    case 'coutSup': def.coutSup = res.cout; break;
    case 'entree': def.entree = Object.assign(def.entree || {}, res.entree); break;
    case 'statique': def.statiques.push(res.s); break;
    case 'mana': def.capacites.push({genre: 'mana', cout: res.cout, options: res.options, parChaque: res.parChaque}); break;
    case 'activee':
      if (res.cout && res.effet) def.capacites.push({genre: 'activee', cout: res.cout, effet: res.effet, vitesse: res.vitesse, unefois: res.unefois});
      break;
    case 'loyaute': if (res.effet) def.capacites.push({genre: 'loyaute', delta: res.delta, effet: res.effet}); break;
    case 'declenchee':
      if (res.ecoutes && res.effet) def.capacites.push({genre: 'declenchee', ecoutes: res.ecoutes, effet: res.effet, unefois: res.unefois});
      break;
  }
}

/* L'état d'une ligne pour la couverture. */
function etatLigne(res) {
  if (!res) return 'ignore';
  const utile = res.genre !== 'sort' || res.effet.ops.length || res.effet.modes;
  if (!res.rates.length) return 'compris';
  return utile && (res.effet || res.genre === 'mots' || res.genre === 'statique') ? 'partiel' : 'ignore';
}

/* Les capacités qu'une carte a sans les écrire : le mana d'un terrain de base
   ou d'un dual (le texte n'en est qu'un rappel, effacé), et à défaut le mana
   que Scryfall dit qu'un terrain produit. */
function capacitesImplicites(def, fiche) {
  if (!def.types.includes('land') || def.capacites.some(k => k.genre === 'mana')) return;
  let couleurs = def.sousTypes.map(s => MANA_DES_TYPES[s]).filter(Boolean);
  if (!couleurs.length && fiche.manaProduit) couleurs = String(fiche.manaProduit).split('');
  if (couleurs.length)
    def.capacites.push({genre: 'mana', cout: {mana: coutManaVide(), engage: true}, options: couleurs, implicite: true});
}

/* Compiler une fiche. `comportement` remplace le texte oracle quand
   l'utilisateur a décrit la carte à la main (js/fenComportement.js). */
function compileDefinition(fiche, comportement) {
  const face = faceJouee(fiche);
  const ti = lisTypeLigne(face.type);
  const cout = coutMana(face.cout) || coutManaVide();
  const def = {
    nom: face.nom, cout, mv: cout.total + 0, types: ti.types, sousTypes: ti.sousTypes, supers: ti.supers,
    couleurs: couleursDe(cout, fiche), force: nombreFiche(face.force), endurance: nombreFiche(face.endurance),
    loyaute: nombreFiche(face.loyaute), mots: 0, params: {}, sort: null, capacites: [], statiques: [],
    entree: null, aura: null, equipe: null, kicker: null, flashback: null, cycling: null,
    jeton: /\btoken\b/i.test(face.type || ''), couverture: null
  };
  if (def.types.includes('creature') && (def.force == null || def.endurance == null)) {
    def.forceVariable = true;
    if (def.force == null) def.force = 0;
    if (def.endurance == null) def.endurance = def.force > 0 ? def.force : 1;
  }
  const manuel = comportement != null && String(comportement).trim() !== '';
  const brut = manuel ? String(comportement) : face.texte;
  const directive = manuel ? (/^\s*#(vanille|injouable)\b/i.exec(brut) || [])[1] : null;
  const estSort = def.types.includes('instant') || def.types.includes('sorcery');
  const lignes = directive ? [] : normaliseOracle(brut.replace(/\n/g, ' // '), face.nom);
  const {lignes: compilees, contexteSort} = compileLignes(lignes, estSort);
  compilees.forEach(l => verseLigne(def, l.res));
  if (estSort) {
    const effs = compilees.filter(l => l.res && l.res.genre === 'sort').map(l => l.res.effet);
    const modal = effs.find(e => e.modes);
    def.sort = modal || {ops: [].concat(...effs.map(e => e.ops)), cibles: contexteSort.cibles, modes: null};
  }
  capacitesImplicites(def, fiche);
  def.couverture = couverture(compilees, def, fiche, directive, manuel);
  return def;
}

/* La couverture : l'état de chaque ligne, celui de la carte, et un taux. */
function couverture(compilees, def, fiche, directive, manuel) {
  const lignes = compilees.map(l => ({texte: l.texte, etat: etatLigne(l.res),
    rates: l.res ? l.res.rates : [l.texte]}));
  const face = faceJouee(fiche);
  if (face.dos) face.dos.forEach(d => lignes.push({texte: 'Face arrière : ' + d[0], etat: 'ignore', rates: [], dos: true}));
  if (def.forceVariable) lignes.push({texte: 'Force ou endurance variable (' + (fiche.ptBrut || '?') + ')', etat: 'partiel', rates: []});
  const comptees = lignes.filter(l => !l.dos);
  const pts = comptees.reduce((s, l) => s + (l.etat === 'compris' ? 1 : l.etat === 'partiel' ? 0.5 : 0), 0);
  const taux = comptees.length ? pts / comptees.length : 1;
  const ignore = lignes.filter(l => l.etat !== 'compris').map(l => (l.etat === 'ignore' ? l.texte : l.rates.join(' '))).join(' ');
  let etat = taux === 1 && !face.dos ? 'complete' : 'partielle';
  if (directive === 'injouable') etat = 'injouable';
  else if (!def.types.includes('land') && CONTREPARTIE.test(ignore)) etat = 'injouable';
  else if ((def.types.includes('instant') || def.types.includes('sorcery')) && !def.sort.ops.length && !def.sort.modes) etat = 'injouable';
  return {lignes, etat, taux, manuel: !!manuel, directive: directive || null};
}

/* La définition d'une fiche, gardée sous son nom, l'empreinte de son texte
   et celle de son comportement manuel. */
function definitionDe(fiche, comportement) {
  const cle = fiche.nom + '|' + empreinte(fiche.texte + '|' + fiche.type + '|' + fiche.force + '/' + fiche.endurance) +
    '|' + empreinte(comportement || '') + '|' + COMPILO_V;
  let d = DEFS.get(cle);
  if (!d) { d = compileDefinition(fiche, comportement); DEFS.set(cle, d); }
  return d;
}

/* La définition d'un jeton décrit par un effet (« create a 2/2 black Zombie
   creature token »). Les mots-clés du jeton sont dans son texte. */
function definitionJeton(j) {
  return definitionDe({nom: j.nom, cout: '', type: j.type, texte: j.texte || '', force: j.force,
    endurance: j.endurance, couleurs: j.couleurs || []});
}
