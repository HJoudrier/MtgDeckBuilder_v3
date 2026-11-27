/* =====================================================================
   js/grapheForgeQualif.js — Ce que disent les filtres, les coûts et les jetons de Forge

   Le graphe qualifie un déclencheur — sur qui il porte, quel objet, à quelles
   conditions — et une production — pour qui, jeton ou non, quelle force.
   Dans le texte, `qualifieDeclencheur()` (js/effets.js) le devine ; Forge
   l'écrit : `Creature.Other+YouCtrl`, `Card.Self`, `Land.OppCtrl`,
   `Instant,Sorcery`. Une virgule sépare des alternatives, un point ouvre les
   propriétés, un plus les enchaîne. Ce module traduit ces filtres dans la
   forme que `compat()` attend, sans rien juger : il n'y a pas de partie.

   Il est pur : il se charge tel quel dans Node pour la comparaison des deux
   lectures (outils/compareLectures.js).
   ===================================================================== */

/* La tête d'une alternative, quand c'est un type de carte, ou un joueur. */
const GF_TETES = {
  Card: 'card', Creature: 'creature', Land: 'land', Artifact: 'artifact', Enchantment: 'enchantment',
  Permanent: 'permanent', Planeswalker: 'planeswalker', Battle: 'battle', Instant: 'instant',
  Sorcery: 'sorcery', Spell: 'spell', SpellAbility: 'spell', Aura: 'enchantment', Equipment: 'artifact',
  Vehicle: 'artifact', Treasure: 'artifact', Food: 'artifact', Clue: 'artifact', Emblem: ''
};
const GF_JOUEURS = {Player: 'tous', Players: 'tous', Opponent: 'adversaire', You: 'vous'};
const GF_TYPES_SORT = ['creature', 'instant', 'sorcery', 'artifact', 'enchantment', 'planeswalker', 'battle', 'land'];

/* Les mots capitalisés qui ne sont pas des sous-types : couleurs,
   super-types, pseudo-types. Le reste, à sa place, est un sous-type — sans
   liste des trois cents sous-types de Magic à tenir. */
const GF_PAS_SOUS_TYPE = new Set(['White', 'Blue', 'Black', 'Red', 'Green', 'Colorless', 'Multicolor', 'MultiColor',
  'Monocolored', 'Legendary', 'Basic', 'Snow', 'World', 'Historic', 'Outlaw', 'Party', 'Modified', 'Attacking',
  'Blocking', 'Tapped', 'Untapped', 'Other', 'Self', 'Creature', 'Land', 'Artifact', 'Enchantment', 'Planeswalker',
  'Battle', 'Instant', 'Sorcery', 'Permanent', 'Card', 'Spell', 'Token', 'Nontoken', 'Commander', 'Kindred', 'Tribal']);

/* `Creature.Other+YouCtrl,Card.Self` → [{tete, props}, …]. */
function alternativesForge(valide) {
  return String(valide || '').split(',').map(x => x.trim()).filter(Boolean).map(alt => {
    const i = alt.indexOf('.');
    return {tete: i < 0 ? alt : alt.slice(0, i), props: i < 0 ? [] : alt.slice(i + 1).split('+').filter(Boolean)};
  });
}

function estSoiForge(alt) {
  return alt.props.includes('Self') || alt.tete === 'Self' || alt.tete === 'CARDNAME';
}

/* Ce qu'une alternative dit, dans la forme de `qualifieDeclencheur()` :
   `sort` vrai quand l'objet est un sort lancé, dont les types deviennent
   des filtres de sort plutôt qu'un sujet. */
function qualifieAlternative(alt, sort) {
  const q = {portee: 'tous', sujet: '', filtres: [], soi: estSoiForge(alt)};
  const typesSort = [], sousTypes = [];
  const tete = alt.tete;
  if (tete in GF_JOUEURS) { q.portee = GF_JOUEURS[tete]; q.sujet = 'player'; }
  else if (tete in GF_TETES) {
    const s = GF_TETES[tete];
    if (sort && GF_TYPES_SORT.includes(s)) typesSort.push(s);
    else q.sujet = s;
  } else if (/^[A-Z][a-z]+$/.test(tete) && !GF_PAS_SOUS_TYPE.has(tete)) {
    sousTypes.push(tete.toLowerCase());
    if (!sort) q.sujet = 'creature';
  }
  alt.props.forEach(p => {
    let m;
    if (p === 'YouCtrl' || p === 'YouOwn' || p === 'EquippedBy') q.portee = 'vous';
    else if (p === 'OppCtrl' || p === 'OppOwn' || p === 'Opponent') q.portee = 'adversaire';
    else if (p === 'Other') q.filtres.push({t: 'autre'});
    else if (p === '!token' || p === 'nonToken') q.filtres.push({t: 'nonjeton'});
    else if (p === 'Legendary') q.filtres.push({t: 'legendaire'});
    else if ((m = /^power(GE|GT|LE|LT)(\d+)$/.exec(p))) q.filtres.push({t: 'force', op: /G/.test(m[1]) ? '≥' : '≤', v: +m[2] + (m[1] === 'GT' ? 1 : m[1] === 'LT' ? -1 : 0)});
    else if ((m = /^cmc(GE|GT|LE|LT)(\d+)$/.exec(p))) q.filtres.push({t: 'cmc', op: /G/.test(m[1]) ? '≥' : '≤', v: +m[2] + (m[1] === 'GT' ? 1 : m[1] === 'LT' ? -1 : 0)});
    else if (p === 'nonCreature' && sort) q.filtres.push({t: 'sortnon', v: 'creature'});
    else if (p in GF_TETES && GF_TYPES_SORT.includes(GF_TETES[p])) {
      if (sort) typesSort.push(GF_TETES[p]);
      else if (!q.sujet || q.sujet === 'card' || q.sujet === 'permanent') q.sujet = GF_TETES[p];
    } else if (/^[A-Z][a-z]+$/.test(p) && !GF_PAS_SOUS_TYPE.has(p)) sousTypes.push(p.toLowerCase());
  });
  if (typesSort.length) q.filtres.push({t: 'sort', v: typesSort});
  if (sousTypes.length) q.filtres.push(sort ? {t: 'sousTypeSort', v: sousTypes} : {t: 'type', v: sousTypes[0]});
  return q;
}

/* Les alternatives réunies. Celles qui désignent la carte elle-même ne
   qualifient rien (« ~ ou une autre créature meurt » porte sur les autres) ;
   une portée ou un sujet ne tient que s'il est commun, un filtre que s'il
   est partout — sauf les types d'un sort, qui s'additionnent : `Instant,Sorcery`
   veut l'un ou l'autre. */
function qualifieValideForge(valide, sort) {
  const alts = alternativesForge(valide).map(a => qualifieAlternative(a, sort));
  const q = {portee: 'tous', sujet: '', filtres: [], soi: false};
  if (!alts.length) return q;
  const autres = alts.filter(a => !a.soi);
  if (!autres.length) { q.portee = 'soi'; q.soi = true; return q; }
  const portees = new Set(autres.map(a => a.portee));
  if (portees.size === 1) q.portee = [...portees][0];
  const sujets = new Set(autres.map(a => a.sujet));
  if (sujets.size === 1) q.sujet = [...sujets][0];
  const cle = f => f.t + ':' + JSON.stringify(f.v === undefined ? '' : f.v) + (f.op || '');
  autres[0].filtres.forEach(f => {
    if (f.t === 'sort' || f.t === 'sousTypeSort' || f.t === 'type') return;
    if (autres.every(a => a.filtres.some(g => cle(g) === cle(f)))) q.filtres.push(f);
  });
  ['sort', 'sousTypeSort'].forEach(t => {
    if (!autres.every(a => a.filtres.some(f => f.t === t))) return;
    q.filtres.push({t, v: [...new Set(autres.flatMap(a => a.filtres.filter(f => f.t === t).flatMap(f => f.v)))]});
  });
  const types = new Set(autres.flatMap(a => a.filtres.filter(f => f.t === 'type').map(f => f.v)));
  if (types.size && autres.every(a => a.filtres.some(f => f.t === 'type')))
    q.filtres.push(types.size === 1 ? {t: 'type', v: [...types][0]} : {t: 'sousTypeSort', v: [...types]});
  return q;
}

/* La portée d'un joueur désigné : `You`, `Opponent`, `Player.Opponent`… */
function porteeJoueurForge(valide) {
  const alts = alternativesForge(valide);
  if (!alts.length) return '';
  const p = new Set(alts.map(a => a.props.includes('Opponent') || a.props.includes('OppCtrl') ? 'adversaire'
    : (GF_JOUEURS[a.tete] || (a.props.includes('YouCtrl') ? 'vous' : 'tous'))));
  return p.size === 1 ? [...p][0] : 'tous';
}

/* Un effet tourné vers l'adversaire : il le vise, le désigne, ou lui donne
   ce qu'il crée. « Target player » compte, comme dans la lecture du texte
   (`scopeOf()`), qui le range du même côté. */
function versAdversaireForge(t) {
  if (/Opponent|OppCtrl/.test(t.Defined || '') || /Opponent|OppCtrl/.test(t.TokenOwner || '')) return true;
  if (/^(Player|Opponent)\b/.test(t.ValidTgts || '')) return true;
  return /OppCtrl|Opponent/.test(t.Affected || '');
}

/* Ce qu'un déclencheur écoute, qualifié : quel objet (`ValidCard`, la source
   ou la cible des blessures), de qui, à quelles conditions. Un sort lancé est
   qualifié par ses types de sort. */
function qDeclencheurForge(t) {
  const mode = t.Mode || '';
  const sort = /^(SpellCast|SpellCastOrCopy|SpellAbilityCast)$/.test(mode);
  let objet = t.ValidCard || t.ValidCards || t.ValidToken || '';
  if (/^Damage/.test(mode)) {
    const cibleJoueur = alternativesForge(t.ValidTarget).every(a => a.tete in GF_JOUEURS);
    objet = t.ValidSource || (cibleJoueur ? '' : t.ValidTarget || '');
  }
  if (/^BecomesTarget/.test(mode)) objet = t.ValidTarget || objet;
  const q0 = objet ? qualifieValideForge(objet, sort) : {portee: 'tous', sujet: '', filtres: []};
  const q = {portee: q0.portee, sujet: sort ? 'spell' : q0.sujet, filtres: q0.filtres.slice(), mode: 'declencheur'};
  const joueur = t.ValidActivatingPlayer || t.ValidPlayer || '';
  if (joueur && q.portee === 'tous') q.portee = porteeJoueurForge(joueur) || 'tous';
  if (t.ActivatorThisTurnCast) q.filtres.push({t: 'nieme'});
  if (t.ActivationLimit === '1' || t.FirstTime) q.filtres.push({t: 'unefois'});
  return q;
}

/* Ce qu'une production qualifie : pour qui, jeton ou non, de quelle force,
   de quel type — les jetons de Forge disent ce qu'ils sont. */
function pqForge(u, adv) {
  const j = u.jetons, c = j.find(x => x.creature);
  const pq = {portee: adv ? 'adversaire' : 'vous', jeton: j.length > 0, force: c ? c.force : null, cmc: null,
    types: [...new Set(j.flatMap(x => x.types))], sorts: [], sujets: [...new Set(j.flatMap(x => x.sujets))], creature: !!c};
  if (u.enJeu !== undefined) pq.enJeu = u.enJeu;
  return pq;
}

/* Les morceaux d'un coût de Forge : `T`, `Sac<1/Creature.Other/another
   creature>`, `PayLife<2>`, `2 W`… Les chevrons peuvent porter des espaces. */
function morceauxCoutForge(cout) {
  const out = [];
  const re = /([A-Za-z]+)<([^>]*)>|(\S+)/g;
  let m;
  while ((m = re.exec(String(cout || '')))) out.push(m[1] ? {nom: m[1], args: m[2].split('/')} : {nom: m[3], args: []});
  return out;
}

/* Les entrées de `COUTS` (js/effets.js) que le coût porte : la même table
   que la lecture du texte, si bien qu'un exutoire consomme les mêmes choses
   quelle que soit la lecture. */
function coutsGrapheForge(cout) {
  const ids = [];
  const ajoute = id => { if (!ids.includes(id)) ids.push(id); };
  morceauxCoutForge(cout).forEach(({nom, args}) => {
    const quoi = args[1] || '';
    if (nom === 'T') ajoute('ENGAGER_SOI');
    else if (nom === 'Q') ajoute('DEGAGER_SOI');
    else if (nom === 'Sac') ajoute(/^(CARDNAME|Self|Card\.Self)$/.test(quoi) ? 'SAC_SOI' : 'SAC_CREATURE');
    else if (nom === 'Discard') ajoute('DEFAUSSER');
    else if (nom === 'PayLife') ajoute('PAYER_VIE');
    else if (nom === 'ExileFromGrave') ajoute('EXILER_CIM');
    else if (nom === 'Mill') ajoute('MEULER_SOI');
    else if ((nom === 'SubCounter' && !/LOYALTY/.test(quoi)) || nom === 'RemoveAnyCounter') ajoute('RETIRER_MARQ');
    else if (nom === 'Return' && !/^(CARDNAME|Self)$/.test(quoi)) ajoute('RENVOYER_MAIN');
    else if (nom === 'Reveal') ajoute('REVELER');
    else if (nom === 'PayEnergy') ajoute('ENERGIE');
    else if (nom === 'tapXType') ajoute('ENGAGER_AUTRES');
    else if (/^(\d+|X|Y|[WUBRGCS]|[WUBRG2]\/?[WUBRGP])$/.test(nom)) ajoute('MANA');
  });
  return ids.map(id => COUTS.find(c => c.id === id)).filter(Boolean);
}

/* Ce qu'un coût consomme : la créature, l'artefact, le gobelin qu'on
   sacrifie ou qu'on engage. Sans lui, un exutoire se reliait à toute
   permanente — un enchantement n'aide pas à convoquer. */
function qualifCoutForge(cout) {
  const s = morceauxCoutForge(cout).find(x => (x.nom === 'Sac' || x.nom === 'tapXType') && !/^(CARDNAME|Self)$/.test(x.args[1] || ''));
  if (!s) return {sujet: '', filtres: []};
  const q = qualifieValideForge(s.args[1] || 'Creature', false);
  return {sujet: q.sujet === 'card' ? 'permanent' : (q.sujet || 'creature'), filtres: q.filtres.filter(f => f.t === 'type' || f.t === 'nonjeton')};
}

const GF_MOTS_JETON = new Set(['sac', 'draw', 'flying', 'vigilance', 'haste', 'trample', 'lifelink', 'deathtouch', 'reach',
  'menace', 'defender', 'firststrike', 'doublestrike', 'indestructible', 'hexproof', 'ward', 'noncombat', 'mana',
  'a', 'e', 'pw', 'prowess', 'decayed', 'infect', 'toxic', 'can', 't', 'block', 'attack']);

/* Ce qu'un jeton est, lu dans son script quand on l'a (`texte`), sinon dans
   son nom — `w_1_1_spirit_flying`, `c_a_treasure_sac` : couleur, force,
   endurance, puis types et mots-clés. */
function jetonForge(nom, texte) {
  const j = {nom, tresor: /treasure/.test(nom), creature: false, force: null, types: [], sujets: []};
  if (texte) {
    const types = ((/^Types:(.*)$/m.exec(texte) || [])[1] || '').trim().split(/\s+/);
    const pt = /^PT:(\d+)\//m.exec(texte);
    j.creature = types.includes('Creature');
    j.force = pt ? +pt[1] : null;
    j.sujets = types.filter(x => x in GF_TETES).map(x => GF_TETES[x]).filter(Boolean);
    j.types = types.filter(x => !(x in GF_TETES) && !GF_PAS_SOUS_TYPE.has(x)).map(x => x.toLowerCase());
    j.tresor = types.includes('Treasure');
    return j;
  }
  const m = /^[a-z]+_(\d+|x)_(\d+|x)_(.*)$/.exec(nom);
  if (m) {
    j.creature = true;
    j.force = /^\d+$/.test(m[1]) ? +m[1] : null;
    j.sujets = /(^|_)a(_|$)/.test(m[3]) ? ['creature', 'artifact'] : ['creature'];
    j.types = m[3].split('_').filter(x => x && !GF_MOTS_JETON.has(x));
  } else {
    j.sujets = /^[a-z]+_e_/.test(nom) ? ['enchantment'] : ['artifact'];
    j.types = (nom.split('_').slice(2).filter(x => x && !GF_MOTS_JETON.has(x))).slice(0, 1);
  }
  return j;
}

/* Une description de Forge rendue comparable au texte oracle : le nom de la
   carte à la place de `CARDNAME`, en minuscules, le rappel retiré. */
function texteGrapheForge(desc, card) {
  const nom = card.name.split(' // ')[0];
  return stripReminder(String(desc || '').replace(/CARDNAME|NICKNAME/g, nom).replace(/\{c:[^}]*\}/g, ''))
    .toLowerCase().replace(/\s+/g, ' ').trim();
}
