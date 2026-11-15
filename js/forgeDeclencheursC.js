/* =====================================================================
   js/forgeDeclencheursC.js — Les déclencheurs qui butaient encore

   Des paramètres de déclencheurs de Forge que le moteur refusait :
   - des conditions : Revolt, Delirium, « if you're the monarch »
     (`CheckDefinedPlayer`), une présence comptée sur des objets désignés
     ou chez un joueur (`PresentDefined`, `PresentPlayer`, dans
     js/forgeEffetsA.js `conditionForge()`) ;
   - qui contrôle le déclencheur (`TriggerController`) ;
   - un déclencheur d'effet qui ne sert qu'une fois (`OneOff`) ;
   - « your second main phase » (`PhaseCount`), « only once each turn »
     compté à la résolution (`ResolvedLimit`, compté ici au déclenchement) ;
   - le sort lancé grâce à cette source, ou avec tant de mana (`ValidSA`).
   Une valeur qu'on ne sait pas lire fait refuser le déclencheur.
   ===================================================================== */

/* Les joueurs que `CheckDefinedPlayer$ You.isMonarch` sait juger. */
const JOUEUR_COCHE = {isMonarch: (P, j) => P.monarque === j, hasInitiative: (P, j) => P.initiative === j};

/* Un `ValidSA$` de sort lancé qu'on sait lire. */
function saLisible(v) { return /^Spell(\.MayPlaySource|\.ManaSpent (EQ|GE|LE|GT|LT)\d+)?$/.test(v); }
function saValide(P, v, e, s) {
  if (!v || v === 'Spell') return true;
  const o = obj(P, e.id);
  if (!o) return false;
  if (v === 'Spell.MayPlaySource') return o.varianteLance === 'permis' && !!s && (P.cartes[o.cid] || {}).permisSrc === s.id;
  const m = /^Spell\.ManaSpent (EQ|GE|LE|GT|LT)(\d+)$/.exec(v);
  return !!m && compareForge(Object.values(o.manaSort || {}).reduce((a, b) => a + b, 0), m[1], +m[2]);
}

/* À la construction : réécrire ce qui se dit autrement, refuser ce qu'on
   ne sait pas juger. */
declencheurForge = (g => function (def, face, t, jetons) {
  let u = t;
  if (t.Mode === 'Phase' && t.PhaseCount) {
    if (t.Phase !== 'Main' || t.PhaseCount !== '2') return false;
    u = {...u, Phase: 'Main2'}; delete u.PhaseCount;
  }
  if (t.ResolvedLimit) { if (!/^\d+$/.test(t.ResolvedLimit)) return false; u = {...u, ActivationLimit: t.ResolvedLimit}; delete u.ResolvedLimit; }
  if (t.CheckDefinedPlayer && !/^You\.(isMonarch|hasInitiative)$/.test(t.CheckDefinedPlayer)) return false;
  if (t.ValidSA && t.Mode === 'SpellCast' && !saLisible(t.ValidSA)) return false;
  return g(def, face, u, jetons);
})(declencheurForge);

/* Les conditions de plus, pour tout ce que `conditionForge()` juge. */
conditionForge = (g => function (P, t, env) {
  if (t.Revolt && (t.Revolt === 'True') !== !!(histoire(P).revolte || {})[env.ctrl]) return false;
  if (t.Delirium === 'True' && new Set([].concat(...P.joueurs[env.ctrl].cimetiere.map(id => obj(P, id).def.types))).size < 4) return false;
  if (t.CheckDefinedPlayer) { const k = t.CheckDefinedPlayer.split('.')[1]; if (!JOUEUR_COCHE[k] || !JOUEUR_COCHE[k](P, env.ctrl)) return false; }
  return g(P, t, env);
})(conditionForge);

FORGE_MODES.SpellCast = (j => (P, t, e, s, env) => j(P, t, e, s, env) && saValide(P, t.ValidSA, e, s))(FORGE_MODES.SpellCast);
FORGE_MODES.Drawn = (j => (P, t, e, s, env) => j(P, t, e, s, env) && joueurOuRien(P, e.joueur, t.ValidPlayer, s, env))(FORGE_MODES.Drawn);

/* Le sort lancé grâce à une permission garde la source qui l'a donnée
   (js/jeuPermis.js). */
permisUtilise = (g => function (P, j, o) {
  const x = permisDeJouer(P, j, o);
  if (x && P.cartes[o.cid]) P.cartes[o.cid].permisSrc = x.src.id;
  return g(P, j, o);
})(permisUtilise);

/* Après la collecte : le contrôleur que le déclencheur désigne, et l'effet
   dont le déclencheur ne sert qu'une fois. */
collecteDeclencheurs = (g => function (P) {
  const n = P.enAttente.length;
  g(P);
  for (const it of P.enAttente.slice(n)) {
    const ec = (it.cap.ecoutes || []).find(x => x.evt === 'forge');
    if (!ec) continue;
    if (ec.t.TriggerController) {
      const src = obj(P, it.src) || it.lki;
      const j = forgeDefinis(P, ec.t.TriggerController, {ctx: {evt: it.evt, cibles: [], memo: [], memoJ: []}, src, ctrl: it.ctrl, op: {}})
        .map(x => joueurDe(x)).find(k => k != null);
      if (j != null) it.ctrl = j;
    }
    if (ec.t.OneOff === 'True' && it.lki && it.lki.zone === 'effet') finEffet(P, it.lki);
  }
})(collecteDeclencheurs);

['Revolt', 'Delirium', 'PresentDefined', 'PresentPlayer'].forEach(k => FORGE_COMMUNS.add(k));
forgeSait('param', 'Revolt', 'Delirium', 'PresentDefined', 'PresentPlayer', 'DelayedTrigger.ValidActivatingPlayer', 'SpellCast.ValidSA',
  'ChangesZone.TriggerController', 'Discarded.TriggerController', 'DamageDone.TriggerController', 'Phase.PhaseCount', 'Phase.OneOff', 'SpellCast.OneOff',
  'ChangesZone.OneOff', 'Phase.CheckDefinedPlayer', 'Drawn.ValidPlayer', 'SpellCast.NoResolvingCheck', 'ChangesZone.ResolvedLimit', 'SpellCast.ResolvedLimit',
  'Phase.Revolt', 'ChangesZone.Revolt', 'Phase.Delirium', 'Phase.PresentDefined', 'Phase.PresentPlayer');
