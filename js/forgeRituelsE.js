/* =====================================================================
   js/forgeRituelsE.js — Les rituels d'EDHREC : les mots-clés qui changent le coût

   Lot F107 :
   - `PutCounter | RememberPut` : retenir les créatures qui ont reçu un
     marqueur, pour que le sort suivant (doubler, rendre furieux) les trouve —
     seul ce qui manquait à Fangs of Kalonia et Spectacular Showdown, dont
     l'Overload est déjà recompilé par js/forgeMotsClesE.js ;
   - `Escalate` et `Replicate` payés en engageant des créatures
     (`tapXType<1/Creature>`, `tapXType<1/Horror>`) ;
   - `Forecast` : une capacité qui s'active de la main, à son entretien,
     une fois par tour (Skyscribing) ;
   - `Demonstrate` : copier le sort, et un adversaire à son choix aussi
     (Incarnation Technique) ;
   - `Prowl` et `Count$BloodthirstAmount` (Notorious Throng) ;
   - `Decayed` : ne peut pas bloquer, se sacrifie à la fin du combat où elle a
     attaqué (Ghouls' Night Out, et les `K:Decayed` des cartes).
   ===================================================================== */

/* —— Overload : la pose de marqueurs qu'on retient ———————————————————————— */

/* Le sort surchargé est recompilé par js/forgeMotsClesE.js ; il ne manquait que de quoi retenir les créatures touchées. */
/* « Remember the creatures that had a counter put on them » : celles qui sont visées, ou toutes celles que l'effet de masse touche. */
forgeSait('param', 'PutCounter.RememberPut', 'PutCounterAll.RememberPut');
FORGE_API.PutCounter.gen = (g => function* (P, t, env) {
  yield* g(P, t, env);
  if (t.RememberPut === 'True') objetsForge(P, t, env).filter(o => o && o.j == null && o.zone === 'champ' && !o.lki).forEach(o => retiensForge(env.ctx, o.id));
})(FORGE_API.PutCounter.gen);
FORGE_API.PutCounterAll.gen = (g => function* (P, t, env) {
  yield* g(P, t, env);
  if (t.RememberPut === 'True') objetsZone(P, 'champ').filter(o => forgeValideObjet(P, o, t.ValidCards || 'Permanent', env.src, env.ctrl, env)).forEach(o => retiensForge(env.ctx, o.id));
})(FORGE_API.PutCounterAll.gen);

/* —— Escalate et Replicate en engageant des créatures ———————————————————— */

const coutEngage = c => c && !c.cout.sacSoi && Object.keys(c.cout).every(k => k === 'mana' || k === 'engageAutres') && c.cout.engageAutres ? c.cout : null;
motCleLancementB = (g => function (def, face, jetons, tete, reste) {
  const c = tete === 'Escalate' && reste.length === 1 ? coutEngage(coutForge(reste[0])) : null;
  if (!c) return g(def, face, jetons, tete, reste);
  def.escalade = coutManaVide();
  def.escaladeAutre = {engageAutres: c.engageAutres};
  return true;
})(motCleLancementB);
/* Autant de créatures de plus à engager que de modes au-delà du premier ; on lâche les derniers modes tant qu'on ne peut pas. */
function coutEscaladeAutre(P, j, s, d, effets, autre) {
  const min = (d.sort && d.sort.modes && d.sort.modes.min) || 1, a = d.escaladeAutre.engageAutres;
  const pour = k => ({engageAutres: {...a, n: a.n * k}});
  const total = k => k ? fusionAutres(autre, pour(k)) || pour(k) : autre;
  while (effets.length > min && !coutAutrePossible(P, j, s, total(effets.length - 1))) effets.pop();
  return total(Math.max(0, effets.length - 1));
}
motCleLancement = (g => function (def, k, face, jetons, tete, reste) {
  const c = tete === 'Replicate' && reste.length === 1 ? coutForge(reste[0]) : null;
  const e = c && c.cout.engageAutres && !c.cout.sacSoi && Object.keys(c.cout).every(x => x === 'mana' || x === 'engageAutres') ? c.cout : null;
  if (!e) return g(def, k, face, jetons, tete, reste);
  def.repliqueEngage = {mana: e.mana, engageAutres: e.engageAutres};
  return true;
})(motCleLancement);
variantesEtendues = (g => function (P, j, o, depuis, essaie) {
  g(P, j, o, depuis, essaie);
  const d = o.def, r = d.repliqueEngage;
  if (!r || (depuis !== 'main' && depuis !== 'commandement')) return;
  for (let k = 1; k <= 3; k++) {
    let m = coutSort(P, j, o, depuis);
    for (let i = 0; i < k; i++) m = sommeMana(m, r.mana);
    essaie('replicate' + k, m, fusionAutres(d.coutSup, {engageAutres: {...r.engageAutres, n: r.engageAutres.n * k}}));
  }
})(variantesEtendues);

/* —— Forecast ———————————————————————————————————————————————————— */

/* « Activate only during your upkeep and only once each turn », depuis la main. */
forgeSait('param', 'Draw.Forecast');
capaciteForge = (g => function (def, face, t, jetons) {
  if (t.Forecast !== 'True') return g(def, face, t, jetons);
  const {Forecast, ...reste} = t;
  return g(def, face, {...reste, ActivationZone: 'Hand', ActivationPhases: 'Upkeep', PlayerTurn: 'True', ActivationLimit: '1'}, jetons);
})(capaciteForge);

/* —— Demonstrate ————————————————————————————————————————————————— */

forgeSait('kw', 'Demonstrate');
motCleForge = (g => function (def, k, face, jetons) {
  if (k !== 'Demonstrate') return g(def, k, face, jetons);
  def.capacites.push({genre: 'declenchee', ecoutes: [{evt: 'lanceSoi'}], texte: 'Demonstrate', effet: {ops: [{op: 'demontre', hostile: false}], cibles: [], modes: null}});
  return true;
})(motCleForge);
/* On peut copier le sort ; si on le fait, un adversaire au choix en copie un aussi, qu'il contrôle. */
OPS.demontre = function* (P, op, ctx) {
  const it = P.pile.find(x => x.id === ctx.source);
  if (!it) return;
  if ((yield question(P, ctx.ctrl, 'oui', ['non', 'oui'], {texte: `Copier ${it.def.nom} ?`, source: ctx.source, defaut: 1})) !== 1) return;
  yield* copieSort(P, ctx.ctrl, obj(P, it.id), it, true);
  const adv = adversaires(P, ctx.ctrl).filter(i => !P.joueurs[i].elimine);
  if (!adv.length) return;
  const i = adv[yield* choisitUn(P, ctx.ctrl, adv.map(a => P.joueurs[a].nom), 'Quel adversaire copie aussi le sort ?', 0, ctx.source)];
  yield* copieSort(P, i, obj(P, it.id), it, true);
};

/* —— Prowl ——————————————————————————————————————————————————————— */

forgeSait('kw', 'Prowl');
forgeSait('filtre', 'prowled');
forgeSait('expr', 'Count$BloodthirstAmount');
motCleForge = (g => function (def, k, face, jetons) {
  const [tete, ...reste] = k.split(':');
  if (tete !== 'Prowl') return g(def, k, face, jetons);
  const c = reste.length === 1 ? coutForge(reste[0]) : null;
  if (!c || Object.keys(c.cout).some(x => x !== 'mana')) return false;
  def.prowl = c.cout.mana;
  return true;
})(motCleForge);
/* Un joueur a-t-il blessé en combat un adversaire, ce tour, avec une créature du même type que le sort ? */
function prowlPossible(P, j, d) {
  const types = (d.sousTypes || []).map(x => String(x).toLowerCase());
  const deg = histoire(P).degatsCombatPar || {};
  return adversaires(P, j).some(a => (deg[a] || []).some(id => {
    const s = passeOuPresent(P, id);
    return !!s && s.ctrl === j && ((s.def.sousTypes || []).some(x => types.includes(String(x).toLowerCase())) || (s.def.params && s.def.params.changelin));
  }));
}
variantesEtendues = (g => function (P, j, o, depuis, essaie) {
  g(P, j, o, depuis, essaie);
  if (o.def.prowl && depuis === 'main' && prowlPossible(P, j, o.def)) essaie('prowl', coutSort(P, j, o, depuis, o.def.prowl), o.def.coutSup || null);
})(variantesEtendues);
proprieteDesignee = (g => function (P, o, p, c, src, ctrl, env) {
  if (p === 'prowled') return o.varianteLance === 'prowl' || (!!o.lance && o.lance.variante === 'prowl');
  return g(P, o, p, c, src, ctrl, env);
})(proprieteDesignee);
/* Le total des dégâts que les adversaires ont reçus ce tour. */
exprEtendue = (g => function (P, tete, q, env) {
  if (tete === 'Count' && q === 'BloodthirstAmount') return adversaires(P, env.ctrl).reduce((s, i) => s + ((histoire(P).degatsRecus || {})[i] || 0), 0);
  return g(P, tete, q, env);
})(exprEtendue);

/* —— Decayed ——————————————————————————————————————————————————— */

forgeSait('kw', 'Decayed');
forgeSait('kwval', 'decayed');
CACHES_DU_TOUR.decayed = {nePeutBloquer: true, decayed: true};
motCleForge = (g => function (def, k, face, jetons) {
  if (k !== 'Decayed') return g(def, k, face, jetons);
  def.params.decayed = true;
  return true;
})(motCleForge);
const aDecay = o => !!o && ((o.def.params && o.def.params.decayed) || (o.mods || []).some(m => m.decayed));
peutBloquer = (g => function (P, b, a) { return !aDecay(b) && g(P, b, a); })(peutBloquer);
noteHistorique = (g => function (P, e) {
  g(P, e);
  if (e.t === 'attaque') { const o = obj(P, e.id); if (aDecay(o)) o.sacFinCombat = true; }
})(noteHistorique);
finCombat = (g => function (P) {
  g(P);
  P.champ.filter(id => obj(P, id).sacFinCombat).forEach(id => { obj(P, id).sacFinCombat = false; jn(P, `${obj(P, id).def.nom} se sacrifie (décomposition)`); sacrifie(P, id); });
})(finCombat);
