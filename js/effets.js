/* =====================================================================
   js/effets.js — Qualifier un déclencheur, un effet, et les accorder

   Un déclencheur restreint — « whenever you cast a turtle spell » — ne doit pas
   se relier à tous les sorts du deck. Le sous-type se lit à sa place, entre
   « cast » et « spell » : ce qui n'est ni un type de carte, ni une négation, ni
   une tournure de compte est un sous-type, sans liste à tenir à jour. `compat()`
   dit ensuite si une production peut nourrir un déclencheur.
   ===================================================================== */

/* 2. Qualification et analyse contextuelle */
const SUJETS = [
  ['creature',/creature/],['land',/\bland\b/],['artifact',/artifact/],['enchantment',/enchantment/],
  ['token',/token/],['permanent',/permanent/],['spell',/spell/],['card',/\bcard\b/],['player',/player|opponent/]
];

/* Ce qui qualifie un sort sans être un sous-type : les types de carte, les
   tournures de compte, de couleur et de nombre. Magic compte près de trois cents
   sous-types de créature — les tenir en liste était le défaut : « whenever you
   cast a turtle spell » n'y trouvait pas « turtle », perdait la restriction, et
   la carte se reliait alors à tous les sorts du deck. On lit donc la place plutôt
   que le mot : devant « spell », ce qui n'est pas de cette liste est un sous-type. */
const MOTS_NON_SOUSTYPE = new Set([
  'creature','instant','sorcery','artifact','enchantment','planeswalker','battle','land','kindred','tribal',
  'permanent','token','spell','spells','card','cards','copy','copies','legendary','historic','multicolored',
  'monocolored','colorless','white','blue','black','red','green','first','second','third','fourth',
  'another','other','each','every','any','all','one','two','three','the','this','that','your','you',
  'from','with','without','and','not','only','same','different','cheapest','most','least','expensive',
  'tapped','untapped','modified','enchanted','equipped','attacking','blocking','face','down','up',
  'snow','basic','target','targeted','opponent','opponents','player','players','hand','exile','graveyard'
]);

/* Les sous-types d'un sort lancé, lus entre « cast » et « spell ». Un mot trop
   court, un type de carte, une négation (« noncreature ») ne comptent pas ; ce
   qui reste est un sous-type, que la carte lancée portera ou non. */
function sousTypesDeSort(clause) {
  const out = [];
  const re = /\bcasts?\s+((?:[a-z][a-z'-]*\s+){0,4}?)spells?\b/g;
  let m;
  while ((m = re.exec(clause))) {
    m[1].split(/\s+/).forEach(mot => {
      const x = mot.replace(/[^a-z'-]/g, '');
      if (x.length > 2 && !/^non/.test(x) && !MOTS_NON_SOUSTYPE.has(x)) out.push(x);
    });
  }
  return [...new Set(out)];
}

/* Deux sous-types se comparent au singulier : la phrase dit « turtle spells »
   là où la ligne de type dit « Turtle ». */
function memeSousType(a, b) {
  const r = x => String(x).toLowerCase().replace(/s$/, '');
  return r(a) === r(b);
}

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
  /* Le sous-type d'un sort primait autrefois cette liste de vingt-et-un types,
     et le manquait dès qu'il n'y figurait pas. La place le donne mieux ; la liste
     ne sert plus qu'aux déclencheurs qui ne parlent pas de sort. */
  const stSort = sousTypesDeSort(clause);
  if (stSort.length) q.filtres.push({t:'sousTypeSort', v:stSort});
  else if ((m = clause.match(/\b(goblin|zombie|elf|elves|spirit|dragon|angel|wizard|vampire|plant|insect|golem|drake|bird|human|cat|faerie|treasure)\b/)))
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
    type:'type '+(x.v||''), sousTypeSort:'type '+[].concat(x.v||[]).join(' ou ')}[x.t] || x.t));
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
    } else if (f.t === 'sousTypeSort') {
      /* La carte lancée porte ses sous-types sur sa ligne de type : un sort qui
         n'en a aucun n'est pas un sort de ce type, et le lien n'existe pas. Une
         production d'effet — « vous pouvez le lancer depuis l'exil » — ne dit pas
         ce qui sera lancé : le doute vaut demi-crédit, non l'exclusion. */
      const ts = p.types || [];
      if (!ts.some(t => f.v.some(v => memeSousType(t, v)))) {
        if (p.intrinseque || ts.length) return 0;
        k *= 0.5;
      }
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
