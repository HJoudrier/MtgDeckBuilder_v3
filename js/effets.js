/* =====================================================================
   js/effets.js — Ontologie des capacités, analyse d'effets & synergies
   ===================================================================== */

/* 1. Nœuds et groupes du graphe */
const GROUPS = {
  cartes:      {label:'Cartes',        color:'#59b0e0'},
  cimetiere:   {label:'Cimetière',     color:'#a077cf'},
  board:       {label:'Développement', color:'#4fb07a'},
  mana:        {label:'Mana',          color:'#d3a441'},
  sorts:       {label:'Sorts',         color:'#57c9c4'},
  interaction: {label:'Interaction',   color:'#d3573f'},
  stax:        {label:'Contrôle',      color:'#8d93a6'},
  vie:         {label:'Points de vie', color:'#e07a9c'},
  combat:      {label:'Combat',        color:'#e08a3f'},
  protection:  {label:'Protection',    color:'#e6dcc0'},
  timing:      {label:'Timing',        color:'#7f8fd0'}
};

const NODES = [
  ['PIOCHE','Pioche','cartes'],
  ['IMPULSE','Filtrage / impulsion','cartes'],
  ['TUTEUR','Tuteur','cartes'],
  ['CYCLE','Cycle','cartes'],
  ['REVELATION','Révélation','cartes'],
  ['MAIN_VIDE','Main vide','cartes'],
  ['RECURSION','Récursion','cartes'],
  ['MILL','Meule','cimetiere'],
  ['DEFAUSSE','Défausse','cimetiere'],
  ['MIS_AU_CIMETIERE','Mise au cimetière','cimetiere'],
  ['SACRIFICE','Sacrifice','cimetiere'],
  ['MORT','Mort de créature','cimetiere'],
  ['MORT_SOI','Mort de cette carte','cimetiere'],
  ['LTB','Départ du champ de bataille','cimetiere'],
  ['JETON','Jeton de créature','board'],
  ['MARQUEUR','Marqueur +1/+1','board'],
  ['MARQUEUR_M1M1','Marqueur -1/-1','board'],
  ['MARQUEUR_AUTRE','Autre marqueur','board'],
  ['MARQUEUR_RETIRE','Retrait de marqueur','board'],
  ['PROLIFERATION','Prolifération','board'],
  ['COPIE','Copie','board'],
  ['BLINK','Blink','board'],
  ['ETB','Arrivée en jeu','board'],
  ['ETB_SOI','Arrivée de cette carte','board'],
  ['ETB_CIMETIERE','Arrivée depuis le cimetière','board'],
  ['ETB_EXIL','Arrivée depuis l\'exil','board'],
  ['ETB_BIBLIO','Arrivée depuis la bibliothèque','board'],
  ['TRANSFORMATION','Transformation','board'],
  ['FACE_VISIBLE','Retournement face visible','board'],
  ['ATTACHEMENT','Attachement','board'],
  ['GAIN_CONTROLE','Gain de contrôle','board'],
  ['TERRAIN','Terrain (landfall)','mana'],
  ['TERRAIN_JOUE','Terrain joué','mana'],
  ['RAMP','Ramp','mana'],
  ['TRESOR','Trésor','mana'],
  ['MANA','Mana','mana'],
  ['MANA_DEPENSE','Mana dépensé','mana'],
  ['UNTAP','Dégagement','mana'],
  ['REDUCTION','Réduction de coût','mana'],
  ['ENERGIE','Énergie','mana'],
  ['EXPERIENCE','Expérience','mana'],
  ['LANCEMENT','Lancement de sort','sorts'],
  ['LANCEMENT_SOI','Lancement de cette carte','sorts'],
  ['SORT_RESOUT','Résolution de sort','sorts'],
  ['CONTRESORT','Contresort','sorts'],
  ['DEVIENT_CIBLE','Devient une cible','sorts'],
  ['CAPACITE_ACTIVEE','Capacité activée','sorts'],
  ['CAPACITE_DECLENCHEE','Capacité déclenchée','sorts'],
  ['DESTRUCTION','Destruction','interaction'],
  ['EXIL','Exil','interaction'],
  ['BOUNCE','Renvoi en main','interaction'],
  ['MIS_EN_BIBLIO','Mise en bibliothèque','interaction'],
  ['DEGATS','Dégâts','interaction'],
  ['DEGATS_SUBIS','Blessures subies','interaction'],
  ['ENGAGEMENT','Engagement','stax'],
  ['STAX','Stax','stax'],
  ['TAXE','Taxe','stax'],
  ['PERTE_VIE','Perte de vie','vie'],
  ['GAIN_VIE','Gain de vie','vie'],
  ['POISON','Poison','vie'],
  ['SEUIL_VIE','Seuil de points de vie','vie'],
  ['ATTAQUE','Attaque','combat'],
  ['ATTAQUE_SEULE','Attaque seule','combat'],
  ['BLOCAGE','Blocage','combat'],
  ['DEVIENT_BLOQUEE','Devient bloquée','combat'],
  ['DEGATS_COMBAT_JOUEUR','Blessures de combat au joueur','combat'],
  ['DEGATS_COMBAT_CREATURE','Blessures de combat à une créature','combat'],
  ['DEBUT_COMBAT','Début du combat','combat'],
  ['FIN_COMBAT','Fin du combat','combat'],
  ['BOOST','Boost temporaire','combat'],
  ['VOL','Vol','combat'],
  ['PIETINEMENT','Piétinement','combat'],
  ['MENACE','Menace','combat'],
  ['IMBLOCABLE','Imblocable','combat'],
  ['CELERITE','Célérité','combat'],
  ['VIGILANCE','Vigilance','combat'],
  ['INDESTRUCTIBLE','Indestructible','protection'],
  ['LINCEUL','Linceul','protection'],
  ['PROTECTION','Protection / ward','protection'],
  ['ENTRETIEN','Entretien','timing'],
  ['ETAPE_PIOCHE','Étape de pioche','timing'],
  ['PHASE_PRINCIPALE','Phase principale','timing'],
  ['FIN_TOUR','Fin du tour','timing'],
  ['DEBUT_TOUR','Début du tour','timing'],
  ['TOUR_SUPPLEMENTAIRE','Tour supplémentaire','timing'],
  ['JOUR_NUIT','Jour et nuit','timing'],
  ['CHAPITRE_SAGA','Chapitre de saga','timing'],
  ['MONARQUE','Monarque / initiative','timing'],
  ['DONJON','Donjon','timing'],
  ['DE','Dé ou pile ou face','timing'],
  ['STATIQUE','Effet continu','timing']
];

const NODE = {};
NODES.forEach((n,i)=>NODE[n[0]]={id:n[0],label:n[1],group:n[2],idx:i});

/* Arcs "règles du jeu" : ce qu'un effet permet mécaniquement d'enchaîner */
const IMPLICIT = [
  ['JETON','ETB'],['COPIE','ETB'],['BLINK','ETB'],['RECURSION','ETB'],['LANCEMENT','ETB'],
  ['COPIE','ETB_SOI'],['BLINK','ETB_SOI'],['RECURSION','ETB_SOI'],['LANCEMENT','ETB_SOI'],
  ['SACRIFICE','MORT_SOI'],['DESTRUCTION','MORT_SOI'],
  ['UNTAP','ENGAGEMENT'],['TRESOR','MANA'],['RAMP','MANA'],['TERRAIN','RAMP'],['MANA','LANCEMENT'],
  ['SACRIFICE','MORT'],['DESTRUCTION','MORT'],['MILL','RECURSION'],['DEFAUSSE','RECURSION'],
  ['MARQUEUR','BOOST'],['REDUCTION','LANCEMENT'],['RECURSION','LANCEMENT'],['ETB','SACRIFICE'],
  ['MORT','MIS_AU_CIMETIERE'],['DEFAUSSE','MIS_AU_CIMETIERE'],['MILL','MIS_AU_CIMETIERE'],
  ['MIS_AU_CIMETIERE','RECURSION'],['MORT','LTB'],['EXIL','LTB'],['BOUNCE','LTB'],['DESTRUCTION','LTB'],
  ['ETB_CIMETIERE','ETB'],['ETB_EXIL','ETB'],['ETB_BIBLIO','ETB'],['TERRAIN_JOUE','TERRAIN'],
  ['ATTAQUE','DEGATS_COMBAT_JOUEUR'],['DEGATS_COMBAT_JOUEUR','DEGATS'],['DEGATS_COMBAT_CREATURE','DEGATS'],
  ['BLOCAGE','DEGATS_COMBAT_CREATURE'],['DEGATS','DEGATS_SUBIS'],['DEGATS_COMBAT_JOUEUR','PERTE_VIE'],
  ['PROLIFERATION','MARQUEUR'],['MARQUEUR_RETIRE','MARQUEUR'],['CYCLE','DEFAUSSE'],['CYCLE','PIOCHE'],
  ['LANCEMENT','SORT_RESOUT'],['SORT_RESOUT','ETB'],['CAPACITE_ACTIVEE','ENGAGEMENT'],
  ['MANA_DEPENSE','MANA'],['ENERGIE','MANA']
];

/* Règles d'extraction : effets produits */
const EFFECT_RULES = [
  ['BLINK',      /exile (?:it|them|this creature|another target|up to one other target|target)[^.]{0,70}?(?:,\s*then|\s+and then|\s*,\s*)\s*return[^.]{0,60}battlefield/],
  ['BLINK',      /exile [^.]{0,60}you control[^.]{0,60}return (?:it|those cards|that card)[^.]{0,50}battlefield/],
  ['RECURSION',  /return[^.]{0,70}(?:card|cards)[^.]{0,30}from (?:a|your|target player's|their) graveyard/],
  ['RECURSION',  /(?:cast|play)[^.]{0,40}from (?:your|a) graveyard|gains? flashback|has escape/],
  ['RECURSION',  /return enchanted creature card/],
  ['RECURSION',  /return (?:that|it|those) cards? to the battlefield/],
  ['COPIE',      /triggers an additional time/],
  ['RAMP',       /search your library for[^.]{0,60}land[^.]{0,60}onto the battlefield/],
  ['RAMP',       /put a land card from your hand onto the battlefield/],
  ['TUTEUR',     /search your library for/],
  ['PIOCHE',     /draws? (?:a card|two cards|three cards|\w+ additional cards|two additional cards|cards)/],
  ['IMPULSE',    /\bscry\b|\bsurveil\b|look at the top|exile the top (?:card|\w+ cards)? ?of your library/],
  ['IMPULSE',    /play (?:lands and )?(?:cast )?spells from the top of your library|may (?:play|cast) (?:them|those cards|the exiled cards?|it)\b[^.]{0,30}(?:this turn|until)/],
  ['IMPULSE',    /exile[^.]{0,60}from among (?:the )?(?:revealed|them)/],
  ['MILL',       /\bmills?\b|puts? the top[^.]{0,40}into (?:their|his or her) graveyard/],
  ['DEFAUSSE',   /discards?/],
  ['SACRIFICE',  /sacrifices?/],
  ['TRESOR',     /treasure token/],
  ['JETON',      /creates? [^.]{0,60}creature token/],
  ['JETON',      /creates? (?:a|an|x|one|two|three|six|\d+)[^.]{0,40}token/],
  ['MARQUEUR',   /\+1\/\+1 counter|\bproliferate\b/],
  ['COPIE',      /token that's a copy|copy (?:that|target) (?:ability|spell)|copies of/],
  ['MANA',       /add \{|adds an additional|add one mana|adds? (?:one|two|three) mana/],
  ['UNTAP',      /untaps?\b/],
  ['TERRAIN',    /play an additional land/],
  ['REDUCTION',  /costs? \{?\w?\}? less to cast/],
  ['CONTRESORT', /counter target/],
  ['DESTRUCTION',/destroys?\b/],
  ['EXIL',       /exiles?\b/],
  ['BOUNCE',     /return [^.]{0,70}to (?:its|their) owners?['\u2019]?s? hands?|return [^.]{0,70}to (?:your|their) hands?|shuffles it into their library/],
  ['DEGATS',     /deals? \d+ damage|deals damage equal|deals \w+ damage|\bfights?\b/],
  ['PERTE_VIE',  /(?:each opponent|target player|that player|opponents) loses? \d+ life|loses? \d+ life/],
  ['GAIN_VIE',   /gains? (?:\d+|life equal|4 life) life|you gain \d+ life|\blifelink\b|gains life/],
  ['BOOST',      /gets? [+-][\dx]+\/[+-][\dx]+|get \+[\dx]+\/\+[\dx]+/],
  ['VOL',        /\bflying\b/],
  ['PIETINEMENT',/\btrample\b/],
  ['MENACE',     /\bmenace\b|\bintimidate\b/],
  ['IMBLOCABLE', /can't be blocked/],
  ['CELERITE',   /\bhaste\b/],
  ['INDESTRUCTIBLE',/\bindestructible\b/],
  ['LINCEUL',    /\bhexproof\b|\bshroud\b/],
  ['PROTECTION', /protection from|\bward\b|can't be the target/],
  ['ENGAGEMENT', /\btaps? (?:target|all|each|up to)|enter(?:s)? tapped|doesn't untap|tapped and attacking/],
  ['STAX',       /can't (?:cast|attack|block|activate|be cast)|skip your|skip their|no maximum hand size|can't be regenerated/],
  ['TAXE',       /costs? \{\d+\} more|unless (?:that player|they) pays?|may pay \{\d+\}|unless that player pays/],
  ['MIS_AU_CIMETIERE', /put into (?:a|your|their) graveyard from anywhere/],
  ['LTB',            /leaves the battlefield/],
  ['PROLIFERATION',  /\bproliferate\b/],
  ['MARQUEUR_M1M1',  /-1\/-1 counter|\bwither\b/],
  ['MARQUEUR_AUTRE', /(?:charge|loyalty|lore|oil|stun|shield|blood|verse|quest|page|time) counter/],
  ['MARQUEUR_RETIRE',/remove (?:a|an|one|two|\d+|x|all) .{0,25}counters?/],
  ['TRANSFORMATION', /\btransforms?\b|\bdaybound\b|\bnightbound\b/],
  ['FACE_VISIBLE',   /turn(?:s|ed)? .{0,20}face up|\bdisguise\b|\bmorph\b|\bmanifest\b/],
  ['ATTACHEMENT',    /\battach\b|becomes attached|\bequip\b/],
  ['GAIN_CONTROLE',  /gains? control of/],
  ['ENERGIE',        /\{e\}|energy counter/],
  ['EXPERIENCE',     /experience counter/],
  ['MONARQUE',       /\bmonarch\b|take the initiative|\binitiative\b/],
  ['DONJON',         /\bdungeon\b|\bventure\b/],
  ['DE',             /roll (?:a|two|\d+) .{0,12}(?:die|dice)|flip a coin/],
  ['POISON',         /poison counter|\btoxic\b|\binfect\b/],
  ['CYCLE',          /\bcycl(?:e|es|ing)\b/],
  ['REVELATION',     /reveals? (?:a|an|the top|your hand|cards)/],
  ['MIS_EN_BIBLIO',  /(?:shuffles?|puts?) .{0,40}into .{0,15}library|on top of .{0,20}library/],
  ['VIGILANCE',      /\bvigilance\b/],
  ['DEGATS_COMBAT_JOUEUR',  /deals combat damage to a player/],
  ['DEGATS_COMBAT_CREATURE',/deals combat damage to a creature/],
  ['TERRAIN_JOUE',   /play an additional land|plays? a land/],
  ['SEUIL_VIE',      /life total is \d+ or less|has \d+ or less life/],
  ['MAIN_VIDE',      /no cards in (?:your|their) hand/]
];

/* Règles d'extraction : déclencheurs */
const TRIGGER_RULES = [
  ['ETB',      /enter(?:s|ing)\b/],
  ['MORT',     /dies|is put into a graveyard from the battlefield|leaves the battlefield/],
  ['ATTAQUE',  /attacks/],
  ['LANCEMENT',/casts?\b|you cast/],
  ['PIOCHE',   /draws? a card/],
  ['DEFAUSSE', /discards?/],
  ['SACRIFICE',/sacrifices?|exploits/],
  ['TERRAIN',  /land you control enters|land enters/],
  ['GAIN_VIE', /gains? life/],
  ['MARQUEUR', /counters? (?:is|are) put/],
  ['ENTRETIEN',/upkeep|draw step/],
  ['FIN_TOUR', /end step|end of turn/],
  ['DEGATS',   /deals damage|deals combat damage/],
  ['MANA',     /tapped for mana/],
  ['ENGAGEMENT',/activate an ability|becomes tapped/],
  ['TRESOR',   /treasure/],
  ['ETB_CIMETIERE',['enters'],/enters .{0,40}from (?:a|your|their) graveyard/],
  ['ETB_EXIL',     ['enters'],/enters .{0,40}from exile/],
  ['ETB_BIBLIO',   ['enters'],/enters .{0,40}from .{0,20}library/],
  ['LTB',          /leaves the battlefield/],
  ['MIS_AU_CIMETIERE',/put into (?:a|your|their) graveyard from anywhere/],
  ['TERRAIN_JOUE', /plays? a land/],
  ['BLOCAGE',      /\bblocks\b/],
  ['DEVIENT_BLOQUEE',/becomes blocked/],
  ['ATTAQUE_SEULE',/attacks alone/],
  ['DEGATS_COMBAT_JOUEUR',/deals combat damage to a player|deals damage to a player/],
  ['DEGATS_COMBAT_CREATURE',/deals combat damage to a creature/],
  ['DEBUT_COMBAT', /beginning of combat/],
  ['FIN_COMBAT',   /end of combat/],
  ['ETAPE_PIOCHE', /draw step/],
  ['PHASE_PRINCIPALE',/main phase/],
  ['DEBUT_TOUR',   /beginning of .{0,25}turn/],
  ['TOUR_SUPPLEMENTAIRE',/extra turn/],
  ['CYCLE',        /\bcycles?\b/],
  ['REVELATION',   /reveals?/],
  ['PERTE_VIE',    /loses? life|loses? \d+ life/],
  ['DEGATS_SUBIS', /is dealt damage/],
  ['POISON',       /poison counter/],
  ['SEUIL_VIE',    /life total is \d+ or less|has \d+ or less life/],
  ['MAIN_VIDE',    /no cards in (?:your|their) hand/],
  ['MARQUEUR_RETIRE',/remove .{0,25}counters?/],
  ['DEVIENT_CIBLE',/becomes the target/],
  ['CAPACITE_ACTIVEE',/activates? an ability/],
  ['CAPACITE_DECLENCHEE',/triggered ability .{0,25}triggers/],
  ['TRANSFORMATION',/transforms?/],
  ['FACE_VISIBLE', /turned face up/],
  ['ATTACHEMENT',  /becomes attached/],
  ['GAIN_CONTROLE',/gains? control/],
  ['ENERGIE',      /\{e\}/],
  ['EXPERIENCE',   /experience counter/],
  ['MONARQUE',     /\bmonarch\b|\binitiative\b/],
  ['DONJON',       /\bdungeon\b|\bventure\b/],
  ['DE',           /roll .{0,12}(?:die|dice)|flip a coin/],
  ['SORT_RESOUT',  /spell resolves/],
  ['CHAPITRE_SAGA',/\bchapter\b/],
  ['JOUR_NUIT',    /day becomes night|night becomes day/],
  ['LANCEMENT_SOI',/cast this spell/]
];

/* 2. Qualification et analyse contextuelle */
const SUJETS = [
  ['creature',/creature/],['land',/\bland\b/],['artifact',/artifact/],['enchantment',/enchantment/],
  ['token',/token/],['permanent',/permanent/],['spell',/spell/],['card',/\bcard\b/],['player',/player|opponent/]
];

function qualifieDeclencheur(clause, selfNames) {
  const q = {portee:'tous', sujet:'', filtres:[], mode:'declencheur'};
  if (/an opponent|each opponent|opponents|target player|that player|your opponents/.test(clause)) q.portee = 'adversaire';
  else if (/you control|\byou\b|\byour\b/.test(clause)) q.portee = 'vous';
  const nomme = /\bthis (creature|permanent|card|spell)\b/.test(clause) || selfNames.some(n => n && clause.includes(n));
  if (nomme && !/\banother\b|\bother\b/.test(clause)) q.portee = 'soi';
  for (const [nom, re] of SUJETS) if (re.test(clause)) { q.sujet = nom; break; }
  let m;
  if ((m = clause.match(/power (\d+) or (?:greater|more)/))) q.filtres.push({t:'force', op:'≥', v:+m[1]});
  if ((m = clause.match(/power (\d+) or less/)))            q.filtres.push({t:'force', op:'≤', v:+m[1]});
  if ((m = clause.match(/mana value (\d+) or (?:greater|more)/))) q.filtres.push({t:'cmc', op:'≥', v:+m[1]});
  if ((m = clause.match(/mana value (\d+) or less/)))            q.filtres.push({t:'cmc', op:'≤', v:+m[1]});
  if (/nontoken/.test(clause)) q.filtres.push({t:'nonjeton'});
  if (/\banother\b/.test(clause)) q.filtres.push({t:'autre'});
  if (/\blegendary\b/.test(clause)) q.filtres.push({t:'legendaire'});
  if (/first .{0,30}each turn|only once each turn/.test(clause)) q.filtres.push({t:'unefois'});
  if ((m = clause.match(/\b(goblin|zombie|elf|elves|spirit|dragon|angel|wizard|vampire|plant|insect|golem|drake|bird|human|cat|faerie|treasure)\b/)))
    q.filtres.push({t:'type', v:m[1]});
  if (/\bspell\b/.test(clause)) {
    q.sujet = 'spell';
    if (/non-?creature spell/.test(clause)) q.filtres.push({t:'sortnon', v:'creature'});
    else {
      const types = [...clause.matchAll(/\b(creature|instant|sorcery|artifact|enchantment|planeswalker|aura|equipment|vehicle)\b(?=[^.]{0,60}spell)/g)]
        .map(x => x[1]==='aura' ? 'enchantment' : (x[1]==='equipment'||x[1]==='vehicle' ? 'artifact' : x[1]));
      if (types.length) q.filtres.push({t:'sort', v:[...new Set(types)]});
    }
    if (/\b(second|third|first)\b[^.]{0,20}spell/.test(clause)) q.filtres.push({t:'nieme'});
  }
  return q;
}

function qualifieProduction(clause, card) {
  const q = {portee:'vous', jeton:false, force:null, cmc:null, types:[], sorts:[]};
  if (/each opponent|target opponent|opponents|target player/.test(clause)) q.portee = 'adversaire';
  if (/token/.test(clause)) q.jeton = true;
  if (/battlefield/.test(clause)) q.enJeu = true;
  else if (/to (?:your|its owner's|their owner's) hand/.test(clause)) q.enJeu = false;
  let m;
  if ((m = clause.match(/(\d+)\/(\d+)[^.]{0,40}token/))) q.force = +m[1];
  if ((m = clause.match(/\b(goblin|zombie|elf|spirit|dragon|angel|wizard|vampire|plant|insect|golem|drake|bird|human|cat|faerie|treasure)\b/)))
    q.types.push(m[1]);
  return q;
}

function libelleQual(q) {
  if (!q) return '';
  const p = {soi:'cette carte', vous:'vous ou vos permanentes', adversaire:'côté adverse', tous:'n\'importe qui'}[q.portee] || '';
  const suj = {creature:'créature', land:'terrain', artifact:'artefact', enchantment:'enchantement', token:'jeton',
               permanent:'permanente', spell:'sort', card:'carte', player:'joueur'}[q.sujet] || '';
  const f = (q.filtres||[]).map(x => ({force:`force ${x.op} ${x.v}`, cmc:`valeur de mana ${x.op} ${x.v}`,
    nonjeton:'non-jeton', autre:'une autre', legendaire:'légendaire', unefois:'une fois par tour',
    type:'type '+(x.v||'')}[x.t] || x.t));
  if (q.mode === 'cout') f.unshift('payé en coût');
  return [suj, p, ...f].filter(Boolean).join(', ');
}

function compat(prod, trig) {
  const q = trig.q || {}, p = prod.q || {};
  if (q.portee === 'soi') return 0;
  if (q.portee === 'adversaire' && p.portee !== 'adversaire') return 0;
  if (q.portee === 'vous' && p.portee === 'adversaire') return 0;
  let k = 1;
  const TYPES = ['creature','land','artifact','enchantment','planeswalker','battle','instant','sorcery'];
  if (q.sujet && TYPES.includes(q.sujet) && (p.sujets||[]).length && !p.sujets.includes(q.sujet)) return 0;
  for (const f of (q.filtres||[])) {
    if (f.t === 'nonjeton' && p.jeton) return 0;
    if (f.t === 'force' && !p.creature && !p.jeton && (p.sujets||[]).length) return 0;
    if (f.t === 'force' && p.force != null) {
      if (f.op === '≥' && p.force < f.v) return 0;
      if (f.op === '≤' && p.force > f.v) return 0;
    } else if (f.t === 'cmc' && p.jeton) {
      if (f.op === '≥' && f.v > 0) return 0;
    } else if (f.t === 'cmc' && p.cmc != null) {
      if (f.op === '≥' && p.cmc < f.v) return 0;
      if (f.op === '≤' && p.cmc > f.v) return 0;
    } else if (f.t === 'sort') {
      const ts = p.sorts || [];
      if (!ts.length) k *= 0.5;
      else if (!f.v.some(v => ts.includes(v))) return 0;
    } else if (f.t === 'sortnon') {
      if ((p.sorts||[]).includes(f.v)) return 0;
    } else if (f.t === 'nieme') { k *= 0.7; }
    else if (f.t === 'type') {
      if (p.types && p.types.length) { if (!p.types.some(t => t.toLowerCase().startsWith(f.v.slice(0,4)))) return 0; }
      else k *= 0.5;
    } else if (f.t === 'force' || f.t === 'cmc') { k *= 0.35; }
    else if (f.t === 'unefois') k *= 0.8;
  }
  return k;
}

const DEBUTS_EFFET = /^(?:you|your|each|that|those|target|the|it|its|they|this|then|and|draw|put|create|add|destroy|exile|return|search|gain|gains|lose|loses|deal|deals|counter|sacrifice|discard|mill|untap|tap|copy|scry|surveil|proliferate|remove|prevent|choose|reveal|shuffle|attach|double|prevent)\b/;

function coupeDeclencheur(body) {
  let premiere = -1;
  for (let k = 0; k < body.length; k++) {
    if (body[k] !== ',') continue;
    if (premiere < 0) premiere = k;
    if (DEBUTS_EFFET.test(body.slice(k+1).trim())) return k;
  }
  return premiere;
}

const COUTS = [
  {id:'ENGAGER_SOI',   motif:/\{t\}/,                                        source:'ENGAGEMENT', produit:['ENGAGEMENT'],                              consomme:['UNTAP']},
  {id:'DEGAGER_SOI',   motif:/\{q\}/,                                        source:'UNTAP',      produit:['UNTAP'],                                   consomme:[]},
  {id:'SAC_CREATURE',  motif:/sacrifice (?:a|an|another|two|three|x|\d)\b/,   source:'SACRIFICE',  produit:['SACRIFICE','MORT','LTB','MIS_AU_CIMETIERE'],consomme:['ETB','JETON'], exutoire:true},
  {id:'SAC_SOI',       motif:/sacrifice/,                                     source:'SACRIFICE',  produit:['SACRIFICE','MORT_SOI','MORT','LTB','MIS_AU_CIMETIERE'], consomme:[]},
  {id:'DEFAUSSER',     motif:/discard/,                                       source:'DEFAUSSE',   produit:['DEFAUSSE','MIS_AU_CIMETIERE'],             consomme:['PIOCHE'], exutoire:true},
  {id:'PAYER_VIE',     motif:/pay \d+ life|pays? \d+ life/,                   source:'PERTE_VIE',  produit:['PERTE_VIE'],                               consomme:['GAIN_VIE']},
  {id:'EXILER_CIM',    motif:/exile .{0,40}from (?:your|a) graveyard/,        source:'EXIL',       produit:['EXIL'],                                    consomme:['MIS_AU_CIMETIERE','MILL','DEFAUSSE','MORT'], exutoire:true},
  {id:'MEULER_SOI',    motif:/mill \d+ cards?/,                               source:'MILL',       produit:['MILL','MIS_AU_CIMETIERE'],                 consomme:[]},
  {id:'RETIRER_MARQ',  motif:/remove (?:a|an|one|two|\d+|x) .{0,25}counters?/, source:'MARQUEUR_RETIRE', produit:['MARQUEUR_RETIRE'],                   consomme:['MARQUEUR','MARQUEUR_AUTRE','PROLIFERATION'], exutoire:true},
  {id:'RENVOYER_MAIN', motif:/return .{0,40}you control to (?:its|their) owner's hand/, source:'BOUNCE', produit:['BOUNCE','LTB'],                   consomme:['ETB']},
  {id:'REVELER',       motif:/reveal (?:a|an) .{0,25}card/,                   source:'REVELATION', produit:['REVELATION'],                              consomme:[]},
  {id:'ENERGIE',       motif:/pay .{0,12}\{e\}/,                              source:'ENERGIE',    produit:['ENERGIE'],                                 consomme:['ENERGIE'], exutoire:true},
  {id:'ENGAGER_AUTRES',motif:/\bconvoke\b|\bcrew\b|tap .{0,30}untapped creature/, source:'ENGAGEMENT', produit:['ENGAGEMENT'],                     consomme:['ETB','JETON'], exutoire:true},
  {id:'MANA',          motif:/\{\d|\{[wubrgcx]/,                              source:'MANA',       produit:[],                                          consomme:['MANA']}
];

function coutsDe(cost, selfNames) {
  const trouves = [];
  for (const c of COUTS) {
    if (!c.motif.test(cost)) continue;
    if (c.id === 'SAC_CREATURE' && selfNames.some(n => n && cost.includes(n))) continue;
    if (c.id === 'SAC_SOI' && trouves.some(x => x.id === 'SAC_CREATURE')) continue;
    trouves.push(c);
  }
  return trouves;
}

function refineTriggers(list, clause) {
  let out = [...list];
  if (out.includes('TERRAIN')) out = out.filter(c => c !== 'ETB' && c !== 'TERRAIN_JOUE');
  if (out.some(c => c === 'ETB_CIMETIERE' || c === 'ETB_EXIL' || c === 'ETB_BIBLIO')) out = out.filter(c => c !== 'ETB');
  if (/dies|graveyard from the battlefield/.test(clause)) out = out.filter(c => c !== 'ETB' && c !== 'LTB' && c !== 'MIS_AU_CIMETIERE');
  if (out.includes('DEGATS_COMBAT_JOUEUR') || out.includes('DEGATS_COMBAT_CREATURE'))
    out = out.filter(c => c !== 'DEGATS' && c !== 'DEGATS_SUBIS' && c !== 'PERTE_VIE');
  if (out.includes('CYCLE')) out = out.filter(c => c !== 'DEFAUSSE' && c !== 'PIOCHE');
  if (out.includes('ATTAQUE_SEULE')) out = out.filter(c => c !== 'ATTAQUE');
  if (out.includes('LANCEMENT_SOI')) out = out.filter(c => c !== 'LANCEMENT');
  if (out.includes('MARQUEUR_RETIRE')) out = out.filter(c => c !== 'MARQUEUR' && c !== 'MARQUEUR_AUTRE');
  return out;
}

function scopeOf(s) {
  if (/an opponent|each opponent|opponents|target player|your opponents|that player/.test(s)) return 'adv';
  return 'self';
}

function refineEffects(list, clause) {
  let out = [...list];
  if (out.includes('BLINK')) out = out.filter(c => c !== 'EXIL' && c !== 'BOUNCE' && c !== 'RECURSION');
  /* Exiler ses propres cartes pour les jouer ensuite est de l'impulsion,
     pas de l'interaction : la bibliothèque et les cartes révélées sont à
     nous, contrairement à un cimetière ou à une permanente adverse. */
  /* L'exil est impulsif — donc du card advantage — quand la carte exilée
     nous revient : prise parmi ce que nous avons révélé, prise du dessus
     de notre bibliothèque, ou suivie du droit de la lancer. Exiler la
     bibliothèque d'un adversaire sans rien en faire reste de l'exil. */
  const peutLancer = /you may (?:cast|play)|may (?:cast|play) (?:it|them|those)/.test(clause);
  const exilImpulsif =
       /exile[^.]{0,70}from among/.test(clause)
    || /exile the top[^.]{0,40}of your librar/.test(clause)
    || (/exile[^.]{0,70}\blibrar/.test(clause) && peutLancer)
    || /you may (?:cast|play)[^.]{0,60}exiled/.test(clause)
    // « puis vous pouvez la lancer sans payer son coût » : sauf si l'exil
    // visait une permanente en jeu, auquel cas c'est du vol.
    || (/you may (?:cast|play)[^.]{0,60}without paying/.test(clause)
        && !/target (?:creature|permanent|artifact|enchantment|land|nonland)/.test(clause));
  if (out.includes('EXIL') && exilImpulsif) {
    out = out.filter(c => c !== 'EXIL');
    if (!out.includes('IMPULSE')) out.push('IMPULSE');
  }
  if (/(?:doesn't|don't|can't) untap/.test(clause)) out = out.filter(c => c !== 'UNTAP');
  if (out.includes('RECURSION') && /graveyard/.test(clause)) out = out.filter(c => c !== 'BOUNCE');
  if (out.includes('CYCLE')) out = out.filter(c => c !== 'DEFAUSSE');
  if (out.includes('DEGATS_COMBAT_JOUEUR') || out.includes('DEGATS_COMBAT_CREATURE')) out = out.filter(c => c !== 'DEGATS');
  if (out.includes('MARQUEUR_RETIRE')) out = out.filter(c => c !== 'MARQUEUR_AUTRE');
  if (out.includes('PROLIFERATION')) out = out.filter(c => c !== 'MARQUEUR_AUTRE');
  if (out.includes('TERRAIN_JOUE') && out.includes('RAMP')) out = out.filter(c => c !== 'TERRAIN_JOUE');
  if (/you may pay \{/.test(clause) && !/unless|costs? \{\d+\} more/.test(clause)) out = out.filter(c => c !== 'TAXE');
  if (out.includes('RAMP')) out = out.filter(c => c !== 'TUTEUR' || /for a card|for a creature|for an instant|for an artifact/.test(clause));
  if (out.includes('TRESOR')) out = out.filter(c => c !== 'JETON' || /creature token/.test(clause));
  if (/enters the battlefield tapped|enter tapped/.test(clause) === false && out.includes('ENGAGEMENT') && !/tap/.test(clause)) out = out.filter(c => c !== 'ENGAGEMENT');
  return out;
}

/* 3. Synergies & équivalences entre effets */
const EQUIV = {
  RAMP:['TERRAIN','TERRAIN_JOUE'],TERRAIN:['RAMP'],TERRAIN_JOUE:['TERRAIN'],
  JETON:['ETB'],COPIE:['ETB'],BLINK:['ETB'],RECURSION:['ETB','ETB_CIMETIERE'],
  TRESOR:['MANA'],MARQUEUR:['BOOST'],PROLIFERATION:['MARQUEUR'],
  MORT:['MIS_AU_CIMETIERE','LTB'],DEFAUSSE:['MIS_AU_CIMETIERE'],MILL:['MIS_AU_CIMETIERE'],
  EXIL:['LTB'],BOUNCE:['LTB'],DESTRUCTION:['MORT','LTB'],
  DEGATS:['DEGATS_SUBIS'],DEGATS_COMBAT_JOUEUR:['DEGATS','DEGATS_SUBIS','PERTE_VIE'],
  DEGATS_COMBAT_CREATURE:['DEGATS','DEGATS_SUBIS'],CYCLE:['DEFAUSSE','PIOCHE']
};

function feeds(concept) { return [concept, ...(EQUIV[concept]||[])]; }

function feedsDe(p) {
  let l = feeds(p.c);
  if (p.c === 'RECURSION' && !(p.q && p.q.enJeu === true)) l = l.filter(x => x !== 'ETB' && x !== 'ETB_CIMETIERE');
  return l;
}

function croise(prods, trigs, dir, out) {
  prods.forEach(p => {
    if (p.scope !== 'self') return;
    trigs.forEach(t => {
      if (t.scope !== 'self' && t.q.portee !== 'adversaire') return;
      if (!feedsDe(p).includes(t.c)) return;
      const k = compat(p, t);
      if (k > 0) out.push({concept:t.c, dir, k, detail:libelleQual(t.q)});
    });
  });
}

function synergyBetween(a, b) {
  const out = [];
  croise(a.an.produces, b.an.triggers, 'ab', out);
  croise(b.an.produces, a.an.triggers, 'ba', out);
  const best = new Map();
  out.forEach(l => {
    const c = l.concept + l.dir;
    if (!best.has(c) || best.get(c).k < l.k) best.set(c, l);
  });
  return [...best.values()];
}

function partnersFor(card, pool) {
  const res = [];
  pool.forEach(o => {
    if (o.name === card.name) return;
    const s = synergyBetween(card, o);
    if (s.length) res.push({card:o, links:s});
  });
  return res.sort((a,b) => b.links.length - a.links.length);
}
