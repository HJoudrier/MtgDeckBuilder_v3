/* =====================================================================
   js/oracleCibles.js — Une seule grammaire pour désigner des objets

   « up to two target nonland permanents an opponent controls with mana value
   3 or less », « each other creature you control », « a basic land card »,
   « creature card from your graveyard » : cibles, groupes, sacrifices,
   recherches, sujets de déclencheur et de statique désignent tous des
   objets de la même façon. Une seule grammaire les lit ici, et un seul
   prédicat les juge pendant la partie (`correspond()`, js/jeuCibles.js) —
   deux grammaires auraient divergé au premier cas ajouté à l'une.
   ===================================================================== */

const TYPES_CARTE = ['creature', 'artifact', 'enchantment', 'land', 'planeswalker', 'battle', 'instant', 'sorcery'];

/* Les pluriels irréguliers des sous-types ; les autres perdent leur « s ». */
const PLURIELS_ORACLE = {elves: 'elf', dwarves: 'dwarf', wolves: 'wolf', werewolves: 'werewolf',
  zombies: 'zombie', allies: 'ally', faeries: 'faerie', mercenaries: 'mercenary', fungi: 'fungus',
  sorceries: 'sorcery', ponies: 'pony', plains: 'plains', homunculi: 'homunculus'};

/* Des mots qui ne sont jamais un sous-type : sans eux, « target » ou « that »
   seraient lus comme une race de créature et un motif réussirait à tort. */
const PAS_SOUSTYPE = new Set(['target', 'that', 'the', 'it', 'its', 'each', 'all', 'your', 'their', 'card',
  'cards', 'spell', 'spells', 'player', 'players', 'opponent', 'opponents', 'you', 'a', 'an', 'other',
  'another', 'of', 'to', 'from', 'with', 'and', 'or', 'up', 'on', 'in', 'under', 'control', 'controls',
  'damage', 'life', 'counter', 'counters', 'token', 'tokens', 'mana', 'color', 'colors', 'top', 'bottom']);

function singulier(w) {
  if (PLURIELS_ORACLE[w]) return PLURIELS_ORACLE[w];
  if (TYPES_CARTE.includes(w)) return w;
  if (/(ss|us)$/.test(w)) return w;
  return w.replace(/ies$/, 'y').replace(/s$/, '');
}

function descVide() {
  return {genre: 'objet', types: [], non: [], sousTypes: [], couleurs: [], filtres: [], zone: 'champ', mots: 0};
}

/* Les queues de phrase qui précisent un descripteur, relues tant qu'il en
   reste. Chacune ôte son morceau et pose ce qu'il dit. */
const QUEUES_DESC = [
  [/ (?:that )?you control$/, d => { d.ctrl = 'vous'; }],
  [/ (?:an opponent controls|your opponents control|you don't control|target opponent controls|target player controls|that player controls)$/, d => { d.ctrl = 'adv'; }],
  [/ with (mana value|power|toughness) (\d+|x) or (less|greater)$/, (d, m) => {
    d.filtres.push({t: m[1] === 'mana value' ? 'mv' : m[1] === 'power' ? 'force' : 'endurance', op: m[3] === 'less' ? '<=' : '>=', v: nombreOracle(m[2])});
  }],
  [/ with (flying|deathtouch|defender|haste|trample|lifelink|vigilance|reach|first strike|menace)$/, (d, m) => { d.mots |= MOTS_ANGLAIS[m[1]]; }],
  [/ (?:from|in) your graveyard$/, d => { d.zone = 'cimetiere'; d.proprio = 'vous'; }],
  [/ (?:from|in) an opponent's graveyard$/, d => { d.zone = 'cimetiere'; d.proprio = 'adv'; }],
  [/ (?:from|in) a graveyard$/, d => { d.zone = 'cimetiere'; }],
  [/ (?:from|in) your hand$/, d => { d.zone = 'main'; d.proprio = 'vous'; }],
  [/ (?:that's|that is) attacking or blocking$/, d => { d.etat = 'combat'; }],
  [/ (?:that's|that is) attacking$/, d => { d.etat = 'attaquant'; }],
  [/ on the battlefield$/, d => { d.zone = 'champ'; }]
];

/* Les adjectifs en tête, relus tant qu'il en reste. */
function adjectifDesc(d, w) {
  let m;
  if (w === 'other' || w === 'another') { d.autre = true; return true; }
  if ((m = /^non-?(creature|artifact|enchantment|land|planeswalker|instant|sorcery|legendary|token|basic)$/.exec(w))) {
    if (m[1] === 'legendary') d.legendaire = false;
    else if (m[1] === 'token') d.jeton = false;
    else if (m[1] === 'basic') d.base = false;
    else d.non.push(m[1]);
    return true;
  }
  if ((m = /^non(white|blue|black|red|green)$/.exec(w))) { d.nonCouleurs = (d.nonCouleurs || []).concat(COULEURS_ANGLAIS[m[1]]); return true; }
  if (COULEURS_ANGLAIS[w]) { d.couleurs.push(COULEURS_ANGLAIS[w]); return true; }
  if (w === 'colorless') { d.incolore = true; return true; }
  if (w === 'multicolored') { d.multicolore = true; return true; }
  if (w === 'tapped') { d.etat = 'engage'; return true; }
  if (w === 'untapped') { d.etat = 'degage'; return true; }
  if (w === 'attacking') { d.etat = d.etat === 'bloquant' ? 'combat' : 'attaquant'; return true; }
  if (w === 'blocking') { d.etat = 'bloquant'; return true; }
  if (w === 'legendary') { d.legendaire = true; return true; }
  if (w === 'basic') { d.base = true; return true; }
  if (w === 'token') { d.jeton = true; return true; }
  if (w === 'nontoken') { d.jeton = false; return true; }
  return false;
}

/* Lire un descripteur. `o.cartes` : on parle de cartes hors du champ par
   défaut (bibliothèque), `o.objets` : d'objets du champ. Rend `null` dès
   qu'un mot reste incompris. */
function lisDescripteur(txt, o = {}) {
  let t = String(txt || '').trim().replace(/,? (?:or|and\/or|and) /g, ' or ').replace(/, /g, ' or ');
  if (!t) return null;
  if (t === 'any target' || t === 'any other target') return {genre: 'nimporte', autre: t !== 'any target'};
  if (/^players?$/.test(t)) return {genre: 'joueur', joueur: 'tous'};
  if (/^opponents?$/.test(t)) return {genre: 'joueur', joueur: 'adv'};
  if (/^(?:player or planeswalker|opponent or planeswalker)$/.test(t)) return {genre: 'nimporte', sansCreature: true};
  const d = descVide();
  if (o.cartes) { d.genre = 'carte'; d.zone = 'bibliotheque'; }
  let encore = true;
  while (encore) {
    encore = false;
    for (const [re, f] of QUEUES_DESC) {
      const m = re.exec(t);
      if (m) { f(d, m); t = t.slice(0, m.index).trim(); encore = true; }
    }
  }
  if (/ cards?$/.test(t) || t === 'card' || t === 'cards') {
    d.genre = 'carte';
    if (d.zone === 'champ') d.zone = 'bibliotheque';
    t = t.replace(/ ?cards?$/, '').trim();
  } else if (/ spells?$/.test(t) || t === 'spell' || t === 'spells') {
    d.genre = 'sort'; d.zone = 'pile';
    t = t.replace(/ ?spells?$/, '').trim();
  }
  const mots = t.split(/\s+/).filter(Boolean);
  for (const p0 of mots) {
    if (p0 === 'or' || adjectifDesc(d, p0)) continue;
    const p = singulier(p0);
    if (p === 'permanent') continue;
    if (TYPES_CARTE.includes(p)) { if (!d.types.includes(p)) d.types.push(p); continue; }
    if (PAS_SOUSTYPE.has(p0) || !/^[a-z'-]+$/.test(p)) return null;
    d.sousTypes.push(p);
  }
  if (d.genre === 'objet' && !d.types.length && !d.sousTypes.length && !/permanent/.test(txt) && !mots.length) return null;
  return d;
}

/* Lire ce sur quoi porte un effet : une cible (qu'on inscrit dans le
   contexte), un groupe (« each », « all », un pluriel), un joueur, la carte
   elle-même, un pronom. Rend une **référence** que le moteur résout à
   l'exécution (js/jeuOpsA.js `resous()`), ou `null`. */
function lisReference(txt, c, o = {}) {
  let t = String(txt || '').trim(), m;
  if (t === '~') return c.note({soi: 1});
  if (t === 'you') return {vous: 1};
  if (/^(?:it|that creature|that permanent|that card|that spell|them|those creatures)$/.test(t)) return c.pronom();
  if (t === "that creature's controller" || t === 'its controller' || t === 'their controller' || t === "that spell's controller") return {controleurDe: c.pronom()};
  if (t === "its owner" || t === "their owners" || t === "its owner's") return {proprioDe: c.pronom()};
  if (t === 'that player') return c.joueurEvt ? {evt: 'joueur'} : {controleurDe: c.pronom()};
  if (/^(?:enchanted|equipped) (?:creature|permanent|artifact|land)$/.test(t)) return c.note({attache: 1});
  if (t === 'any target' || t === 'any other target')
    return c.cible({genre: 'nimporte', autre: t !== 'any target'}, 1, 1);
  if (t === 'each opponent' || t === 'each of your opponents') return {chaque: {genre: 'joueur', joueur: 'adv'}};
  if (t === 'each player') return {chaque: {genre: 'joueur', joueur: 'tous'}};
  if (t === 'target player' || t === 'target opponent')
    return c.cible({genre: 'joueur', joueur: t === 'target player' ? 'tous' : 'adv'}, 1, 1);
  if ((m = /^(?:(up to )(one|two|three|four|five|x) |(one|two|three) )?(another |other )?target (.+)$/.exec(t))) {
    const n = nombreOracle(m[2] || m[3] || 'one');
    const desc = lisDescripteur(m[5], o);
    if (!desc || n == null) return null;
    if (m[4]) desc.autre = true;
    return c.cible(desc, m[1] ? 0 : n, n);
  }
  if ((m = /^(?:each|all) (.+)$/.exec(t))) {
    const desc = lisDescripteur(m[1], o);
    return desc ? c.note({chaque: desc}) : null;
  }
  if (o.groupe && (m = /^(other )?(.+s) you control$/.exec(t))) {
    const desc = lisDescripteur(m[2] + ' you control', o);
    if (!desc) return null;
    if (m[1]) desc.autre = true;
    return c.note({chaque: desc});
  }
  return null;
}

/* Le contexte de compilation d'une capacité : les cibles qu'elle déclare, le
   dernier objet nommé (pour « it »), et ce que l'évènement déclencheur
   apporte (« that creature », « that player »). */
function contexteOracle(evt) {
  const c = {cibles: [], dernier: null, objetEvt: !!(evt && evt.objet), joueurEvt: !!(evt && evt.joueur)};
  c.note = ref => { c.dernier = ref; return ref; };
  c.cible = (desc, min, max) => c.note({cible: c.cibles.push({desc, min, max}) - 1});
  c.pronom = () => c.dernier || (c.objetEvt ? {evt: 'objet'} : {soi: 1});
  return c;
}
