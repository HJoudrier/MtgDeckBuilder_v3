/* =====================================================================
   js/forgeValide.js — Le langage de filtres de Forge

   Forge désigne les objets et les joueurs par une petite grammaire :
   `Creature.nonToken+YouCtrl,Planeswalker.OppCtrl` — des alternatives
   séparées par des virgules, chacune une tête (un type, un sous-type,
   `Card`, `Permanent`, `Player`…) et des propriétés jointes par `+`. Ce
   fichier la compile une fois par texte et la juge pendant la partie.

   Une propriété inconnue ne laisse rien passer : un filtre mal compris
   doit rendre la carte plus faible, jamais plus forte. Chaque propriété
   connue s'inscrit au registre (`filtre:…`) : la couverture d'une carte
   sait ainsi si ses filtres sont lus jusqu'au bout.
   ===================================================================== */

const FORGE_TYPES_CARTE = {Creature: 'creature', Artifact: 'artifact', Enchantment: 'enchantment', Land: 'land',
  Planeswalker: 'planeswalker', Instant: 'instant', Sorcery: 'sorcery', Battle: 'battle', Kindred: 'kindred', Tribal: 'kindred'};
const FORGE_COULEURS = {White: 'W', Blue: 'U', Black: 'B', Red: 'R', Green: 'G'};
const FORGE_SUPERS = {Legendary: 'legendary', Basic: 'basic', Snow: 'snow'};
const FORGE_TETES_JOUEUR = new Set(['Player', 'Opponent', 'You']);
const FORGE_FILTRES = new Map();

/* Les sous-types qui ne sont pas des types de créature : un changelin ne
   les a pas. */
const SOUSTYPES_NON_CREATURE = new Set(['plains', 'island', 'swamp', 'mountain', 'forest', 'equipment', 'aura', 'vehicle', 'saga',
  'treasure', 'clue', 'food', 'gate', 'desert', 'lair', 'locus', 'mine', 'tower', 'shrine', 'curse', 'cartouche', 'class', 'role',
  'rune', 'background', 'shard', 'case', 'room', 'blood', 'gold', 'incubator', 'powerstone', 'map', 'fortification', 'cave', 'sphere']);

/* Les propriétés que ce fichier sait juger : les autres ne laissent rien
   passer. */
const FORGE_PROPS = ['Historic', 'ChosenColor', 'ChosenType', 'ChosenCard', 'ChosenCtrl', 'IsCommander', 'kicked', 'StrictlyOther', 'YouCtrl', 'OppCtrl', 'YouOwn', 'OppOwn', 'YouDontCtrl', 'Other', 'Self', 'StrictlySelf', 'token',
  'nonToken', 'Colorless', 'MultiColor', 'MonoColor', 'tapped', 'untapped', 'attacking', 'blocking', 'unblocked',
  'EnchantedBy', 'EquippedBy', 'AttachedBy', 'IsRemembered', 'IsNotRemembered', 'TargetedPlayerCtrl', 'ActivePlayerCtrl',
  'Opponent', 'You', 'Active', 'NonActive', 'nonColorless', 'Permanent', 'Card', 'Spell'];

/* Compiler un filtre : un tableau d'alternatives `{tete, props}`. */
function forgeFiltre(txt) {
  const cle = String(txt || '');
  let f = FORGE_FILTRES.get(cle);
  if (f) return f;
  f = cle.split(',').map(s => s.trim()).filter(Boolean).map(alt => {
    const i = alt.indexOf('.');
    const tete = i < 0 ? alt : alt.slice(0, i);
    const props = i < 0 ? [] : alt.slice(i + 1).split('+').map(s => s.trim()).filter(Boolean);
    return {tete, props, joueur: FORGE_TETES_JOUEUR.has(tete)};
  });
  FORGE_FILTRES.set(cle, f);
  return f;
}

/* Les propriétés d'un filtre, pour la couverture : `filtre:YouCtrl`… Les
   propriétés à seuil (`powerGE3`) et à mot-clé (`withFlying`) se rangent
   sous leur famille. */
function famillesFiltre(txt) {
  const r = [];
  forgeFiltre(txt).forEach(a => {
    if (!teteConnue(a.tete)) r.push('filtre:' + a.tete);
    a.props.forEach(p => r.push('filtre:' + familleProp(p)));
  });
  return r;
}

/* Des mots en capitale qui ne sont pas des sous-types : lus comme tels,
   ils ne laisseraient rien passer ; ils restent inconnus. */
const FORGE_PAS_SOUSTYPES = new Set(['Enchanted', 'Equipped', 'Historic', 'Modified', 'Outlaw', 'Paired', 'Party', 'Commander',
  'Saddled', 'Suspected', 'Exploited', 'Defending', 'Attacking', 'Blocking', 'Blocked', 'Unblocked', 'Cloned', 'Kicked',
  'Foretold', 'Renowned', 'Monstrous', 'Transformed', 'Bargained', 'Harnessed', 'Solved', 'Unearthed', 'Hellbent',
  'Attached', 'Remembered', 'Imprinted', 'Chosen', 'Token', 'Creatures', 'Permanents', 'Cards']);

function sousTypeProbable(p) {
  return /^[A-Z][a-z]+$/.test(p) && !FORGE_PAS_SOUSTYPES.has(p) && FORGE_TYPES_CARTE[p] == null && FORGE_COULEURS[p] == null &&
    FORGE_SUPERS[p] == null && !FORGE_PROPS.includes(p);
}

function familleProp(p) {
  if (p[0] === '!') return familleProp(p.slice(1));
  if (sousTypeProbable(p)) return 'Soustype';
  if (/^non/.test(p) && sousTypeProbable(p.slice(3))) return 'nonSoustype';
  const m = /^(power|toughness|cmc)(GE|LE|GT|LT|EQ|NE)/.exec(p);
  if (m) return m[1] + 'XX';
  if (/^counters_/.test(p)) return 'counters';
  if (/^with(out)?/.test(p)) return p;
  if (/^named/.test(p)) return 'named';
  if (/^inZone(Battlefield|Graveyard|Hand|Exile|Library|Stack)$/.test(p)) return 'inZone';
  return p;
}

function teteConnue(t) {
  return t === 'Card' || t === 'Permanent' || t === 'Spell' || t === 'Any' || FORGE_TETES_JOUEUR.has(t) ||
    FORGE_TYPES_CARTE[t] != null || sousTypeProbable(t);
}

function compareForge(v, op, n) {
  switch (op) {
    case 'GE': return v >= n; case 'LE': return v <= n; case 'GT': return v > n;
    case 'LT': return v < n; case 'EQ': return v === n; case 'NE': return v !== n;
  }
  return false;
}

/* Un objet, une carte ou un instantané a-t-il ce type, ce sous-type, cette
   couleur ou ce supertype ? */
function aQualite(c, mot) {
  if (FORGE_TYPES_CARTE[mot]) return c.types.includes(FORGE_TYPES_CARTE[mot]);
  if (FORGE_COULEURS[mot]) return c.couleurs.includes(FORGE_COULEURS[mot]);
  if (FORGE_SUPERS[mot]) return (c.supers || []).includes(FORGE_SUPERS[mot]);
  if (mot === 'Permanent') return c.types.some(t => TYPES_PERMANENTS.includes(t));
  if (sousTypeProbable(mot)) return (c.sousTypes || []).includes(mot.toLowerCase()) || (!!c.changelin && !SOUSTYPES_NON_CREATURE.has(mot.toLowerCase()));
  return null;
}

function teteObjet(t, c, o) {
  if (t === 'Card') return true;
  if (t === 'Spell') return o.zone === 'pile';
  if (t === 'Any') return c.types.includes('creature') || c.types.includes('planeswalker') || c.types.includes('battle');
  return aQualite(c, t) === true;
}

/* Une propriété d'objet. `env` porte la face et le contexte de la
   résolution en cours, pour `IsRemembered`, `TargetedPlayerCtrl` et les
   seuils écrits en SVar (`cmcLEX`). */
function propObjet(P, o, c, p, src, ctrl, env) {
  if (p[0] === '!') return !propObjet(P, o, c, p.slice(1), src, ctrl, env);
  const tient = o.zone === 'champ' || o.zone === 'pile' || o.lki ? o.ctrl : o.prop;
  switch (p) {
    case 'YouCtrl': return tient === ctrl;
    case 'OppCtrl': case 'YouDontCtrl': return tient !== ctrl;
    case 'YouOwn': return o.prop === ctrl;
    case 'OppOwn': return o.prop !== ctrl;
    case 'Other': case 'StrictlyOther': return !src || o.id !== src.id;
    case 'Self': case 'StrictlySelf': return !!src && (o.id === src.id || (P && suit(P, src.id) === o.id));
    case 'token': return !!o.jeton;
    case 'kicked': return !!o.kicked;
    case 'IsCommander': return !!o.cmd;
    case 'Historic': return c.types.includes('artifact') || (c.supers || []).includes('legendary') || (c.sousTypes || []).includes('saga');
    case 'ChosenColor': { const k = P && src && choixDe(P, src).couleur; return !!k && c.couleurs.includes(k); }
    case 'ChosenType': { const k = P && src && choixDe(P, src).type; return !!k && ((c.sousTypes || []).includes(k) || !!c.changelin); }
    case 'ChosenCard': return !!(P && src && (choixDe(P, src).cartes || []).includes(o.id));
    case 'ChosenCtrl': return !!(P && src && choixDe(P, src).joueur === tient);
    case 'nonToken': return !o.jeton;
    case 'Colorless': return !c.couleurs.length;
    case 'nonColorless': return c.couleurs.length > 0;
    case 'MultiColor': return c.couleurs.length > 1;
    case 'MonoColor': return c.couleurs.length === 1;
    case 'tapped': return !!o.engage;
    case 'untapped': return !o.engage;
    case 'attacking': return !!P && etatCombat(P, o, 'attaquant');
    case 'blocking': return !!P && etatCombat(P, o, 'bloquant');
    case 'unblocked': return !!P && !!P.combat && P.combat.attaquants.has(o.id) && !(P.combat.bloquesPar.get(o.id) || []).length;
    case 'EnchantedBy': case 'EquippedBy': case 'AttachedBy': return !!src && src.att === o.id;
    case 'IsRemembered': return !!(env && env.ctx && (env.ctx.memo || []).some(x => x === o.id || (P && suit(P, x) === o.id)));
    case 'IsNotRemembered': return !(env && env.ctx && (env.ctx.memo || []).some(x => x === o.id));
    case 'TargetedPlayerCtrl': return !!(env && env.ctx && ciblesJoueurs(env).includes(tient));
    case 'ActivePlayerCtrl': return !!P && tient === P.actif;
  }
  let m;
  if ((m = /^(power|toughness|cmc)(GE|LE|GT|LT|EQ|NE)(.+)$/.exec(p))) {
    const v = m[1] === 'cmc' ? mvDe(o) : m[1] === 'power' ? c.force : c.endurance;
    const n = /^-?\d+$/.test(m[3]) ? +m[3] : env ? forgeNombre(P, m[3], env) : 0;
    return compareForge(v, m[2], n);
  }
  if ((m = /^counters_(GE|LE|GT|LT|EQ|NE)(\d+)_(\w+)$/.exec(p))) return compareForge((o.marq || {})[genreMarqueur(m[3])] || 0, m[1], +m[2]);
  if ((m = /^with(out)?(.+)$/.exec(p))) {
    const bit = MOTS_ANGLAIS[m[2].replace(/([a-z])([A-Z])/g, '$1 $2').toLowerCase()];
    if (bit == null) return false;
    return m[1] ? (c.mots & bit) === 0 : (c.mots & bit) !== 0;
  }
  if ((m = /^named(.+)$/.exec(p))) return o.def.nom === m[1];
  if ((m = /^inZone(\w+)$/.exec(p))) return ZONES_FORGE[m[1]] === (o.lki ? 'champ' : o.zone);
  if ((m = /^non(.+)$/.exec(p))) {
    const q = aQualite(c, m[1]);
    if (q !== null) return !q;
    if (m[1] === 'Token') return !o.jeton;
    return false;
  }
  return aQualite(c, p) === true;
}

/* Les joueurs ciblés par la capacité en cours, ou par celle qu'elle suit. */
function ciblesJoueurs(env) {
  const cs = env.ctx.cibles || [];
  return [].concat(...cs).filter(x => x && typeof x === 'object' && x.j != null).map(x => x.j);
}

/* Un objet répond-il à un filtre Forge ? */
function forgeValideObjet(P, o, valid, src, ctrl, env, base) {
  if (!o) return false;
  base = base || !!(env && env.base);
  const c = o.lki ? o : P && !base ? caracsJugees(P, o, false) : caracsJugees(P, o, true);
  return forgeFiltre(valid).some(a => !a.joueur && teteObjet(a.tete, c, o) && a.props.every(p => propObjet(P, o, c, p, src, ctrl, env)));
}

/* Un joueur répond-il à un filtre Forge ? */
function forgeValideJoueur(P, j, valid, ctrl, env) {
  if (P.joueurs[j].elimine) return false;
  return forgeFiltre(valid).some(a => {
    if (!a.joueur && a.tete !== 'Any') return false;
    if (a.tete === 'Opponent' && j === ctrl) return false;
    if (a.tete === 'You' && j !== ctrl) return false;
    return a.props.every(p => {
      switch (p) {
        case 'Opponent': return j !== ctrl;
        case 'You': return j === ctrl;
        case 'Other': return j !== ctrl;
        case 'Active': return j === P.actif;
        case 'NonActive': return j !== P.actif;
        case 'IsRemembered': return !!(env && env.ctx && (env.ctx.memoJ || []).includes(j));
        case 'Chosen': case 'ChosenPlayer': return !!(env && env.src && choixDe(P, env.src).joueur === j);
      }
      return false;
    });
  });
}

/* Une définition — un sort lancé, une carte qu'on réduit — répond-elle ? */
function forgeValideDef(def, valid, ctrl, lanceur, id) {
  const pseudo = {id, def, lki: true, zone: 'pile', ctrl: lanceur, prop: lanceur, types: def.types, sousTypes: def.sousTypes,
    supers: def.supers, couleurs: def.couleurs, mots: def.mots, force: def.force || 0, endurance: def.endurance || 0, marq: {}};
  return forgeValideObjet(null, pseudo, valid, {id}, ctrl, null);
}

/* Le genre de marqueur de Forge (`P1P1`) dans le vocabulaire du moteur. */
function genreMarqueur(t) {
  return {P1P1: '+1/+1', M1M1: '-1/-1', LOYALTY: 'loyaute'}[t] || String(t || '').toLowerCase();
}

/* Un descripteur d'emplacement de cible, lu dans `ValidTgts$` et
   `TgtZone$`. Il porte le filtre Forge (`forge`) et le genre que
   js/jeuCibles.js sait parcourir : joueurs, objets du champ, sorts, cartes
   d'une autre zone. */
function descForge(valid, zone, sort) {
  const v = String(valid || '').replace(/\bAny\b/g, 'Creature,Planeswalker,Battle,Player');
  const alts = forgeFiltre(v);
  const joueurs = alts.some(a => a.joueur), objets = alts.some(a => !a.joueur);
  const z = ZONES_FORGE[zone] || 'champ';
  const genre = sort || z === 'pile' ? 'sort' : !objets ? 'joueur' : z !== 'champ' ? 'carte' : joueurs ? 'nimporte' : 'objet';
  return {forge: v, genre, zone: genre === 'carte' ? z : genre === 'sort' ? 'pile' : 'champ', types: [], non: [], sousTypes: [],
    couleurs: [], filtres: [], mots: 0, ctrl: alts.every(a => a.props.includes('YouCtrl')) ? 'vous' : null};
}

const ZONES_FORGE = {Battlefield: 'champ', Graveyard: 'cimetiere', Hand: 'main', Library: 'bibliotheque', Exile: 'exil',
  Stack: 'pile', Command: 'commandement'};

forgeSait('filtre', ...FORGE_PROPS, 'inZone', 'Soustype', 'nonSoustype', 'powerXX', 'toughnessXX', 'cmcXX', 'counters', 'named',
  ...Object.keys(FORGE_TYPES_CARTE), ...Object.keys(FORGE_COULEURS), ...Object.keys(FORGE_SUPERS),
  ...Object.keys(FORGE_TYPES_CARTE).map(t => 'non' + t), ...Object.keys(FORGE_COULEURS).map(t => 'non' + t),
  ...Object.keys(FORGE_SUPERS).map(t => 'non' + t),
  ...Object.keys(MOTS_ANGLAIS).flatMap(k => {
    const avec = k.replace(/(^|\s)([a-z])/g, (_, s, l) => s + l.toUpperCase()), sans = avec.replace(/\s/g, '');
    return ['with' + avec, 'without' + avec, 'with' + sans, 'without' + sans];
  }));
