/* =====================================================================
   js/forgeCouverture.js — Ce qu'une carte de Forge demande au moteur

   Un script de Forge dit exactement ce qu'il emploie : des types d'effets
   (`api:DealDamage`), des déclencheurs (`trig:ChangesZone`), des statiques
   (`stat:Continuous`), des remplacements (`repl:Moved`), des mots-clés
   (`kw:Flying`), des paramètres (`param:Optional`), des morceaux de coût
   (`cout:Sac`), des expressions (`expr:Count$Valid`). Le moteur tient le
   registre de ce qu'il sait faire (`FORGE_SAIT`), chaque module y inscrit
   ce qu'il couvre : la couverture d'une carte n'est plus une estimation,
   c'est une différence d'ensembles.

   Une unité — une capacité et sa chaîne de sous-capacités, un
   déclencheur, une statique, un remplacement, un mot-clé — qui emploie
   quoi que ce soit d'inconnu est **écartée entière**, jamais jouée à
   moitié. La carte est injouable si l'unité écartée est son sort, un
   remplacement, ou ressemble à une contrepartie.
   ===================================================================== */

const FORGE_SAIT = {api: new Set(), trig: new Set(), stat: new Set(), repl: new Set(), kw: new Set(),
  param: new Set(), cout: new Set(), expr: new Set(), filtre: new Set(), defini: new Set(), construction: new Set()};

/* Les paramètres dont la valeur est un filtre (js/forgeValide.js), et ceux
   qui désignent (js/forgeDefini.js) : leurs propriétés et leurs valeurs
   comptent dans la couverture comme des éléments à part entière. */
const FORGE_CLES_FILTRE = /^(ValidTgts|ValidCards?|Affected|ChangeType|ChangeValid|SacValid|ValidTarget|ValidSource|ValidPlayers?|ValidActivatingPlayer|ValidAttacker|ValidBlocker|IsPresent|ValidDefender)$/;
const FORGE_CLES_DEFINI = /^(Defined(Player|Cards)?|RememberObjects|ForgetDefined|AttachedTo|TokenOwner|NewController|DamageSource|Controller)$/;

/* Inscrire ce qu'un module du moteur sait faire. */
function forgeSait(genre, ...noms) { noms.forEach(n => FORGE_SAIT[genre].add(n)); }

function forgeConnu(el) {
  const i = el.indexOf(':');
  return FORGE_SAIT[el.slice(0, i)].has(el.slice(i + 1));
}

/* Les paramètres qui ne font que décrire — pour l'humain, pour l'IA de
   Forge — et ne changent rien au jeu. */
const FORGE_DESCRIPTIFS = /Desc(ription)?$|^TgtPrompt$|^AI|^Stack|^Secondary$|^IsCurse$|^Ultimate$|^SpellDescription$|^Precost|^CostDesc$|^Hidden$|^ShowCurrentCard$|^AnnounceType$|^ActivationLimitDesc$|^SelectPrompt$|^ChoiceTitle$|^Reveal$|^NoReveal$|^RestRandomOrder$|^Image$|^SVars$/;

/* Les paramètres communs à toutes les capacités : le reste se compte par
   effet (`param:ChangeZone.Origin`), parce que le même nom ne veut pas dire
   la même chose d'un effet à l'autre, et qu'un effet ne doit être dit
   compris que pour les paramètres qu'il lit vraiment. */
const FORGE_COMMUNS = new Set(['Cost', 'SubAbility', 'ValidTgts', 'TargetMin', 'TargetMax', 'TgtZone', 'TargetType', 'Defined',
  'Optional', 'OptionalDecider', 'UnlessCost', 'UnlessPayer', 'UnlessSwitched', 'ConditionDefined', 'ConditionPresent',
  'ConditionCompare', 'ConditionCheckSVar', 'ConditionSVarCompare', 'ConditionZone', 'ConditionPlayerTurn', 'Condition',
  'RememberObjects', 'RememberTargets', 'SorcerySpeed', 'ActivationLimit', 'Planeswalker', 'Execute', 'TriggerZones', 'ActivationPhases',
  'ForgetOtherRemembered', 'ForgetOtherTargets',
  'CheckSVar', 'SVarCompare', 'IsPresent', 'PresentCompare', 'PresentZone', 'PlayerTurn', 'TargetUnique', 'Mandatory',
  'ActivationZone']);

/* Les paramètres dont la valeur nomme une autre SVar à suivre. */
const FORGE_RENVOIS = ['SubAbility', 'Execute', 'ReplaceWith', 'RepeatSubAbility', 'FallbackAbility', 'Choices',
  'ChooseSubAbility', 'WinSubAbility', 'LoseSubAbility', 'TrueSubAbility', 'FalseSubAbility', 'UnlessSwitched',
  'StaticAbilities', 'Triggers', 'ReplacementEffects', 'Abilities', 'ResolveSubAbility'];

/* Les morceaux d'un coût Forge (`2 T Sac<1/CARDNAME> PayLife<2>`) autres
   que le mana. */
function morceauxCout(cout) {
  return String(cout || '').split(/\s+(?![^<]*>)/).filter(Boolean)
    .filter(m => !/^([0-9]+|X|[WUBRGCS]|[WUBRG2]\/[WUBRGP])$/i.test(m))
    .map(m => 'cout:' + (m === 'T' || m === 'Q' ? m : m.split('<')[0]));
}

/* Les expressions d'une valeur de SVar : `Count$Valid Creature.YouCtrl` →
   `expr:Count$Valid`. */
function expressionsDe(v) {
  const s = String(v || '').trim();
  const m = /^([A-Za-z]+)\$([A-Za-z]+)/.exec(s);
  if (!m) return [];
  const r = ['expr:' + m[1] + '$' + m[2]];
  const agg = /^Count\$Valid\w* [^$]+\$(\w+)/.exec(s);
  if (agg) r.push('expr:$' + agg[1]);
  return r;
}

/* Les éléments d'une table, en suivant ses renvois dans les SVars. */
function elementsTable(face, t, genre, out, vus) {
  if (genre) out.add(genre);
  const famille = forgeApi(t) || (genre && genre !== 'x' ? genre.split(':')[1] : t.Mode || t.Event || '');
  Object.keys(t).forEach(k => {
    if (k === 'SP' || k === 'AB' || k === 'DB') out.add('api:' + t[k]);
    else if ((k === 'Mode' || k === 'Event') && !forgeApi(t)) { if (!genre) out.add('trig:' + t[k]); }
    else if (k === 'Cost' || k === 'UnlessCost') morceauxCout(t[k]).forEach(c => out.add(c));
    else if (!FORGE_DESCRIPTIFS.test(k)) out.add('param:' + (FORGE_COMMUNS.has(k) || !famille ? k : famille + '.' + k));
    if (FORGE_CLES_FILTRE.test(k) && typeof famillesFiltre === 'function') famillesFiltre(t[k]).forEach(e => out.add(e));
    if (FORGE_CLES_DEFINI.test(k)) String(t[k]).split(' & ').forEach(d => out.add('defini:' + d.trim().split(' ')[0]));
    if (FORGE_RENVOIS.includes(k)) String(t[k]).split(',').forEach(nom => {
      const n = nom.trim();
      if (!n || vus.has(n) || face.svars[n] == null) return;
      vus.add(n);
      const v = face.svars[n].trim();
      if (/^(DB|AB|SP)\$/.test(v)) elementsTable(face, forgeTable(v), null, out, vus);
      else if (/^Mode\$/.test(v)) { const st = forgeTable(v); out.add((k === 'StaticAbilities' ? 'stat:' : 'trig:') + st.Mode); elementsTable(face, st, 'x', out, vus); }
      else if (/^Event\$/.test(v)) { const r = forgeTable(v); out.add('repl:' + r.Event); elementsTable(face, r, 'x', out, vus); }
    });
    const val = String(t[k]);
    if (/^[A-Z][A-Za-z0-9]*$/.test(val) && face.svars[val] != null && !vus.has(val)) {
      vus.add(val);
      expressionsDe(face.svars[val]).forEach(e => out.add(e));
    }
  });
  out.delete('x');
  return out;
}

/* Les unités d'une face, chacune avec ses éléments et son texte. */
function unitesForge(face) {
  const u = [];
  face.a.forEach(t => u.push({genre: t.SP ? 'sort' : 'activee', texte: t.SpellDescription || t.Description || '',
    elements: elementsTable(face, t, null, new Set(), new Set())}));
  face.t.forEach(t => u.push({genre: 'declenchee', texte: t.TriggerDescription || '',
    elements: elementsTable(face, t, 'trig:' + t.Mode, new Set(), new Set())}));
  face.s.forEach(t => u.push({genre: 'statique', texte: t.Description || '',
    elements: elementsTable(face, t, 'stat:' + t.Mode, new Set(), new Set())}));
  face.r.forEach(t => u.push({genre: 'remplacement', texte: t.Description || '',
    elements: elementsTable(face, t, 'repl:' + t.Event, new Set(), new Set())}));
  face.k.forEach(k => {
    const tete = k.split(':')[0].replace(/^Protection.*/, 'Protection').replace(/^(\w+)walk$/, 'Landwalk').replace(/^Enchant\b.*/, 'Enchant');
    const el = new Set(['kw:' + tete]);
    k.split(':').slice(1).forEach(seg => seg.split(',').forEach(x => {
      const v = face.svars[x.trim()];
      if (v == null) return;
      /* Une capacité ou un déclencheur se suit comme une table ; une
         expression (`Count$Valid …`) n'en est pas une. */
      if (/^\s*((DB|AB|SP)\$|Mode\$)/.test(v)) elementsTable(face, forgeTable(v), null, el, new Set());
      else expressionsDe(v).forEach(e => el.add(e));
    }));
    u.push({genre: 'motcle', texte: k, elements: el});
  });
  return u;
}

/* La couverture d'un script : l'état de chaque unité, celui de la carte,
   et les éléments qui manquent. */
function couvertureForge(script, echecs) {
  const face = script.faces[0];
  const unites = unitesForge(face).map((u, i) => {
    let manque = [...u.elements].filter(e => !forgeConnu(e));
    if (!manque.length && echecs && echecs.has(i)) manque = [echecs.get(i)];
    return {...u, manque, etat: manque.length ? 'ignore' : 'compris'};
  });
  const ecartees = unites.filter(u => u.manque.length);
  let etat = ecartees.length ? 'partielle' : 'complete';
  if (ecartees.some(u => u.genre === 'sort' || u.genre === 'remplacement' ||
      ((u.genre === 'declenchee' || u.genre === 'statique' || u.genre === 'motcle') && CONTREPARTIE.test(u.texte.toLowerCase())))) etat = 'injouable';
  const dos = script.faces.length > 1 && !/Split/.test(script.mode);
  if (dos && etat === 'complete') etat = 'partielle';
  const n = unites.length || 1;
  return {etat, taux: unites.length ? unites.filter(u => !u.manque.length).length / n : 1, unites,
    manque: [...new Set(ecartees.flatMap(u => u.manque))], dos};
}

/* Les éléments qui manquent, classés par nombre de cartes qu'ils
   rendraient complètes ou meilleures. `scripts` : `[{nom, script, poids}]`. */
function manquesForge(scripts) {
  const m = new Map();
  scripts.forEach(({nom, script, poids}) => {
    couvertureForge(script).manque.forEach(e => {
      const x = m.get(e) || {element: e, cartes: 0, poids: 0, exemples: []};
      x.cartes++; x.poids += poids || 1;
      if (x.exemples.length < 4) x.exemples.push(nom);
      m.set(e, x);
    });
  });
  return [...m.values()].sort((a, b) => b.poids - a.poids || b.cartes - a.cartes);
}
