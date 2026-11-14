/* =====================================================================
   js/forgeEffetsD.js — Les effets de Forge qui durent : régénération,
   effets (`Effect`), déclencheurs retardés, capacités accordées

   Suite de js/forgeEffetsC.js. Ce qui dure vit dans les listes de la
   partie (js/jeuDurees.js) : un effet de Forge y devient un objet sans
   carte, avec ses statiques et ses déclencheurs ; un déclencheur retardé,
   une écoute qui ne part qu'une fois. Tout ce qu'un effet ou une statique
   porte se construit avec la carte, et la carte n'est jouée que si tout se
   construit (`prepare`).
   ===================================================================== */

/* Une statique de Forge, prête pour le moteur — avec les capacités qu'elle
   accorde, construites d'avance. `null` si un mode ou une capacité
   accordée est inconnu. */
function statiqueForge(face, t, jetons) {
  if (!String(t.Mode || '').split(',').every(m => FORGE_STATIQUES[m.trim()])) return null;
  const s = {s: 'forge', t, face, jetons};
  if (t.AddAbility || t.AddTrigger) {
    const tmp = {capacites: [], statiques: [], params: {}, mots: 0};
    for (const n of String(t.AddAbility || '').split('&').map(x => x.trim()).filter(Boolean)) {
      const a = forgeSousCapacite(face, n);
      if (!a || !capaciteForge(tmp, face, a, jetons)) return null;
    }
    for (const n of String(t.AddTrigger || '').split('&').map(x => x.trim()).filter(Boolean)) {
      if (!face.svars[n] || !declencheurForge(tmp, face, forgeTable(face.svars[n]), jetons)) return null;
    }
    s.accorde = tmp.capacites;
  }
  return s;
}

/* Les capacités que les statiques en jeu accordent à cet objet. */
function capacitesAccordees(P, o) {
  const r = [];
  for (const {src, s} of statiquesEnJeu(P)) {
    if (s.s === 'forge' && s.accorde && s.accorde.length && viseForge(P, src, s, o)) r.push(...s.accorde);
  }
  return r;
}

forgeSait('param', 'Continuous.AddAbility', 'Continuous.AddTrigger', 'Continuous.AddSVar');

/* La régénération : un bouclier, jusqu'au nettoyage (js/jeuDurees.js
   `detruitObjet()`). */
function regenere(P, objets) {
  objets.filter(o => o && o.j == null && o.zone === 'champ' && !o.lki).forEach(o => { o.regen = (o.regen || 0) + 1; P.ver++; });
}

forgeEffet('Regenerate', [], function* (P, t, env) { regenere(P, objetsForge(P, t, env)); },
  (t, op) => { op.op = 'regenere'; op.a = op.slot != null ? {cible: op.slot} : {soi: 1}; op.hostile = false; });
forgeEffet('RegenerateAll', ['ValidCards'], function* (P, t, env) {
  regenere(P, objetsZone(P, 'champ').filter(o => forgeValideObjet(P, o, t.ValidCards || 'Creature.YouCtrl', env.src, env.ctrl, env)));
}, (t, op) => { op.op = 'regenere'; op.hostile = false; });

/* Les durées qu'un effet de Forge sait tenir, dans le vocabulaire du
   moteur ; une autre rend la table injouable. */
const FORGE_DUREES = {'': 'tour', Permanent: null, UntilYourNextTurn: 'prochainTour', UntilHostLeavesPlay: 'hote'};

forgeEffet('Effect', ['StaticAbilities', 'Triggers', 'Duration', 'Name', 'Stackable', 'ForgetOnMoved'], function* (P, t, env) {
  const prep = env.op.effet, src = env.src;
  const memo = [], memoJ = [];
  if (t.RememberObjects) forgeDefinis(P, t.RememberObjects, env).forEach(x => { if (x.j != null) memoJ.push(x.j); else memo.push(x.id); });
  poseEffet(P, {nom: t.Name || (src ? 'Effet de ' + src.def.nom : 'Effet'), ctrl: env.ctrl, cid: src ? src.cid : null,
    srcId: src ? src.id : null, hote: src ? src.id : null, fin: FORGE_DUREES[t.Duration || ''],
    statiques: prep.statiques, capacites: prep.capacites, memo, memoJ});
}, (t, op) => { op.op = 'forge'; op.hostile = false; }, {
  prepare(t, op) {
    if (!(String(t.Duration || '') in FORGE_DUREES)) return false;
    const face = op.face, tmp = {capacites: []}, statiques = [];
    for (const n of String(t.StaticAbilities || '').split(',').map(x => x.trim()).filter(Boolean)) {
      const s = face.svars[n] && statiqueForge(face, forgeTable(face.svars[n]), op.jetons);
      if (!s) return false;
      statiques.push(s);
    }
    for (const n of String(t.Triggers || '').split(',').map(x => x.trim()).filter(Boolean)) {
      if (!face.svars[n] || !declencheurForge(tmp, face, forgeTable(face.svars[n]), op.jetons)) return false;
    }
    op.effet = {statiques, capacites: tmp.capacites};
    return true;
  }
});

forgeEffet('DelayedTrigger', ['Mode', 'Phase', 'ValidPlayer', 'Execute', 'ThisTurn', 'ValidCard', 'Origin', 'Destination'],
  function* (P, t, env) {
    const memo = [], memoJ = [];
    if (t.RememberObjects) forgeDefinis(P, t.RememberObjects, env).forEach(x => { if (x.j != null) memoJ.push(x.j); else memo.push(x.id); });
    const src = env.src;
    durees(P).retardes.push({t, face: env.op.face, effet: env.op.effetRetarde, src: src ? src.id : null, lki: src && src.lki ? src : null,
      ctrl: env.ctrl, memo, memoJ, ceTour: t.ThisTurn === 'True', nom: src ? src.def.nom : '?', texte: texteForge(env.op.face, t)});
  }, (t, op) => { op.op = 'forge'; op.hostile = false; }, {
    prepare(t, op) {
      if (!FORGE_MODES[t.Mode] || !phaseConnue(t)) return false;
      op.effetRetarde = effetForge(op.face, forgeSousCapacite(op.face, t.Execute), op.jetons);
      return !!op.effetRetarde;
    }
  });
