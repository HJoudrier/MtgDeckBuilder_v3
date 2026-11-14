/* =====================================================================
   js/jeuCouches.js — Ce qu'une statique fait devenir un permanent : son
   contrôleur, ses types, ses capacités

   « You control enchanted creature » (Control Magic), « each noncreature
   artifact is an artifact creature » (March of the Machines), « enchanted
   creature loses all abilities and is a 3/3 Elk »… Ces statiques changent
   ce que le moteur lit sans passer par `car()` : `o.ctrl`, et `estType()`
   qui ne connaît que l'imprimé et la couche `o.anime`.

   Elles s'appliquent donc à chaque passe des actions d'état
   (js/jeuEtatsDeJeu.js `appliqueSBA()`), comme Forge les applique à chaque
   vérification de l'état : une entrée de `o.anime` marquée `stat`, et un
   contrôleur prêté (`o.ctrlAvant`) qui revient quand la statique cesse.
   La force et l'endurance restent à `car()`, qui les lit déjà.
   ===================================================================== */

/* Les statiques qui font une couche, relevées une fois par version. */
function statiquesCouches(P) {
  if (P._couchesV === P.ver) return P._couches;
  P._couches = statiquesMode(P, 'Continuous').filter(x => {
    const t = x.s.t;
    return !t.MayPlay && !t.MayLookAt && (!t.AffectedZone || t.AffectedZone === 'Battlefield') &&
      !!(t.AddType || t.RemoveCardTypes || t.RemoveCreatureTypes || t.RemoveAllAbilities || t.GainControl || t.RemoveLandTypes || t.AddAllCreatureTypes);
  });
  P._couchesV = P.ver;
  return P._couches;
}

/* Les types qu'ajoute une statique : `Creature & Artifact`, `ChosenType`,
   `AllCreatureTypes` (tous les types de créature, comme le changelin). */
function typesCouche(P, src, v) {
  if (v === 'ChosenType') { const k = choixDe(P, src).type; return {types: [], sousTypes: k ? [k] : [], changelin: false}; }
  const ty = typesForge(v);
  return {...ty, changelin: /AllCreatureTypes/.test(v)};
}

/* Une passe : ce que chaque permanent doit être selon les statiques, posé
   s'il diffère de ce qu'il est. Rend vrai si quelque chose a changé.

   Tout se juge sur l'état d'avant les couches : sans quoi « each
   noncreature artifact is a creature » cesserait de viser l'artefact
   qu'elle vient d'animer, et la passe oscillerait sans fin. Les couches
   posées sont donc levées le temps de juger, puis reposées. */
function couchesStatiques(P) {
  const L = statiquesCouches(P);
  if (!L.length && !P.couchesActives) return false;
  const poses = new Map();
  for (const id of P.champ) {
    const o = obj(P, id), st = (o.anime || []).filter(a => a.stat);
    if (!st.length && o.ctrlAvant == null) continue;
    poses.set(id, {anime: st, ctrl: o.ctrl});
    if (st.length) o.anime = o.anime.filter(a => !a.stat);
    if (o.ctrlAvant != null) { o.ctrl = o.ctrlAvant; o.ctrlAvant = null; }
  }
  if (poses.size) P.ver++;
  const voulu = new Map();
  for (const x of statiquesCouches(P)) {
    const t = x.s.t;
    for (const id of P.champ) {
      const o = obj(P, id);
      if (!viseForge(P, x.src, x.s, o)) continue;
      if (!voulu.has(id)) voulu.set(id, {anime: [], ctrl: null});
      const v = voulu.get(id);
      if (t.GainControl === 'You') v.ctrl = x.src.ctrl;
      const ty = t.AddType ? typesCouche(P, x.src, t.AddType) : null;
      if (ty || t.RemoveCardTypes || t.RemoveCreatureTypes || t.RemoveAllAbilities || t.RemoveLandTypes || t.AddAllCreatureTypes) {
        v.anime.push({stat: true, types: ty ? ty.types : [], sousTypes: ty ? ty.sousTypes : [], changelin: !!(ty && ty.changelin) || t.AddAllCreatureTypes === 'True',
          retireTypes: t.RemoveCardTypes === 'True', retireSousTypes: t.RemoveCreatureTypes === 'True', perdTout: t.RemoveAllAbilities === 'True',
          retireTerrains: t.RemoveLandTypes === 'True'});
      }
    }
  }
  let change = false, actives = 0;
  for (const id of P.champ) {
    const o = obj(P, id), v = voulu.get(id) || {anime: [], ctrl: null}, avant = poses.get(id) || {anime: [], ctrl: o.ctrl};
    if (v.anime.length) o.anime = [...(o.anime || []), ...v.anime];
    if (v.ctrl != null && v.ctrl !== o.ctrl) { o.ctrlAvant = o.ctrl; o.ctrl = v.ctrl; }
    if (JSON.stringify(avant.anime) !== JSON.stringify(v.anime)) change = true;
    if (o.ctrl !== avant.ctrl) { o.pret = false; change = true; }
    if (v.anime.length || o.ctrlAvant != null) actives++;
  }
  if (change || poses.size) P.ver++;
  P.couchesActives = actives;
  return change;
}

/* Un permanent qui a perdu toutes ses capacités (« loses all abilities »),
   ou un terrain dont les types de terrain sont remplacés (Blood Moon) : il
   perd celles de son texte (règle 305.7). */
function sansCapacites(o) { return !!o.anime && o.anime.some(a => a.perdTout || (a.retireTerrains && o.def.types.includes('land'))); }

/* Les types de terrain que les statiques retirent avec `RemoveLandTypes`. */
const TYPES_TERRAIN = new Set(['plains', 'island', 'swamp', 'mountain', 'forest', 'desert', 'gate', 'lair', 'locus', 'mine', 'power-plant',
  'tower', "urza's", 'cave', 'sphere', 'town']);

/* Un terrain dont une statique change les types de terrain (Urborg, Blood
   Moon, Spreading Seas) : ses capacités de mana suivent ses types, les
   intrinsèques des types de base (règle 305.6). Rend `null` si aucune
   statique ne touche ses types de terrain. */
function capacitesTerrain(o) {
  const st = (o.anime || []).filter(a => a.stat && (a.retireTerrains || (a.sousTypes || []).some(s => MANA_DES_TYPES[s])));
  if (!st.length || !estType(o, 'land')) return null;
  const efface = st.some(a => a.retireTerrains);
  const base = efface ? [] : o.def.capacites;
  const deja = new Set(base.filter(k => k.genre === 'mana' && k.implicite).flatMap(k => k.options));
  const sous = animation(o).sousTypes.filter(s => MANA_DES_TYPES[s]);
  const couleurs = [...new Set(sous.map(s => MANA_DES_TYPES[s]))].filter(c => !deja.has(c));
  return couleurs.length ? base.concat([{genre: 'mana', cout: {mana: coutManaVide(), engage: true}, options: couleurs, implicite: true}]) : base;
}
