/* =====================================================================
   js/forgeDurees.js — Ce qui dure sur un objet, et les attributs

   Un bonus, une animation posés sur un objet (`o.mods`, `o.anime`) ne
   savaient finir qu'au nettoyage ou jamais. `finForge()` leur donne les
   durées de Forge que les effets (`P.effets`) savaient déjà : jusqu'à ton
   prochain tour, jusqu'à la fin du combat, tant que la source reste. Elles
   se lèvent au début du tour (js/jeuDurees.js `debutDuTour()`), à la fin
   du combat, au départ de l'hôte (`hotePart()`), par `leveDureesObjets()`.

   Et les attributs : préparée (Prepare, la créature qui porte un sort),
   enfourchée (Saddle). Le contrôle qui revient au départ de la source, le
   clone pour un tour, « doesn't untap during your next untap step », le
   propriétaire d'un effet.
   ===================================================================== */

/* La durée d'un effet sur un objet : `{fin, …}` à fondre dans l'entrée de
   `o.mods` ou `o.anime`, ou `null` pour une durée qu'on ne sait pas tenir. */
function finForge(t, env) {
  switch (t.Duration || '') {
    case '': case 'EndOfTurn': case 'UntilEndOfTurn': return {fin: 'tour'};
    case 'Permanent': return {fin: 'jamais'};
    case 'UntilYourNextTurn': return {fin: 'prochainTour', par: env.ctrl};
    case 'UntilEndOfCombat': return {fin: 'combat'};
    case 'UntilHostLeavesPlay': return env.src ? {fin: 'hote', hote: env.src.id} : null;
  }
  return null;
}
const dureeTenable = t => finForge(t, {ctrl: 0, src: {id: 0}}) != null;

/* Lever les modifications d'objets dont la durée finit. */
function leveDureesObjets(P, finit) {
  for (const id of P.champ) {
    const o = obj(P, id);
    if (o.mods.length && o.mods.some(finit)) { o.mods = o.mods.filter(m => !finit(m)); P.ver++; }
    if (o.anime && o.anime.some(finit)) { o.anime = o.anime.filter(a => !finit(a)); P.ver++; }
  }
}

/* Le départ d'un hôte : ce qui durait avec lui, et le contrôle pris
   « for as long as you control CARDNAME » qui revient. */
function hotePartObjets(P, id) {
  leveDureesObjets(P, m => m.fin === 'hote' && m.hote === id);
  for (const k of P.champ) {
    const o = obj(P, k);
    if (o.ctrlHote && o.ctrlHote.hote === id) { o.ctrl = o.ctrlHote.rendu; o.ctrlHote = null; o.pret = false; P.ver++; }
  }
}

/* Le clone d'un tour (« becomes a copy … until end of turn ») redevient
   lui-même au nettoyage. */
function restaureClones(P) {
  for (const id of P.champ) {
    const o = obj(P, id);
    if (o.cloneTour) { o.def = o.cloneTour.def; o.copie = o.cloneTour.copie; o.cloneTour = null; P.ver++; }
  }
}

/* —— Les effets qui prennent ces durées ——————————————————————————— */

/* Animate : sa durée, et « Colorless » qui efface les couleurs. */
FORGE_API.Animate.prepare = (p => (t, op) => {
  const u = t.Duration && !/^(Permanent|Perpetual)$/.test(t.Duration) && dureeTenable(t) ? {...t, Duration: undefined} : t;
  return (t.Colors === 'Colorless' ? p({...u, Colors: undefined}, op) : p(u, op)) && (!t.Duration || t.Duration === 'Permanent' || dureeTenable(t));
})(FORGE_API.Animate.prepare);
FORGE_API.Animate.gen = (g => function* (P, t, env) {
  const avant = new Set(P.champ.filter(id => (obj(P, id).anime || []).length).map(id => obj(P, id).anime.length + '|' + id));
  yield* g(P, t.Colors === 'Colorless' ? {...t, Colors: undefined} : t, env);
  const f = finForge(t, env);
  /* L'entrée qu'on vient de poser prend la durée de l'effet. */
  for (const id of P.champ) {
    const o = obj(P, id), a = o.anime && o.anime[o.anime.length - 1];
    if (!a || avant.has(o.anime.length + '|' + id)) continue;
    if (f && t.Duration && t.Duration !== 'Permanent') { Object.assign(a, f); if (f.fin === 'hote') P.hotesSuivis = true; }
    if (t.Colors === 'Colorless') { a.couleurs = []; a.ecrase = true; }
  }
})(FORGE_API.Animate.gen);

/* Prendre le contrôle tant que la source reste en jeu (`LoseControl$
   LeavesPlay`, et `LoseControl` quand elle change de mains — simplifiée en
   son départ). */
FORGE_API.GainControl.prepare = t => !t.LoseControl || t.LoseControl === 'EOT' || /^(LeavesPlay|LoseControl)(,(LeavesPlay|LoseControl))*$/.test(t.LoseControl);
FORGE_API.GainControl.gen = (g => function* (P, t, env) {
  if (!t.LoseControl || t.LoseControl === 'EOT' || !env.src) return yield* g(P, t, env);
  const vises = (t._ids ? t._ids.map(id => obj(P, id)).filter(Boolean) : objetsForge(P, t, env, 'Targeted')).filter(o => o.zone === 'champ' && !o.lki);
  const avant = new Map(vises.map(o => [o.id, o.ctrl]));
  yield* g(P, t, env);
  vises.forEach(o => { if (o.ctrlHote == null && avant.get(o.id) !== o.ctrl) { o.ctrlHote = {hote: env.src.id, rendu: avant.get(o.id)}; P.hotesSuivis = true; } });
})(FORGE_API.GainControl.gen);

/* Le clone pour un tour. */
etendEffet('Clone', ['Duration'], (P, t, env) => {
  if (t.Duration === 'UntilEndOfTurn') { const c = forgeDefinis(P, t.CloneTarget || t.Defined || 'Self', env).find(x => x && x.j == null && x.zone === 'champ'); env.ctx._clone = c ? {o: c, def: c.def, copie: !!c.copie} : null; }
  return t;
}, function* (P, t, env) {
  const c = env.ctx._clone;
  if (t.Duration === 'UntilEndOfTurn' && c && c.o.def !== c.def && !c.o.cloneTour) c.o.cloneTour = {def: c.def, copie: c.copie};
});
FORGE_API.Clone.prepare = (p => (t, op) => (!t.Duration || t.Duration === 'UntilEndOfTurn') && (!p || p(t, op)))(FORGE_API.Clone.prepare);

/* « CARDNAME doesn't untap during your next untap step » écrit comme un
   effet à remplacement `DontUntap` : l'objet est exercé
   (js/jeuTour.js `degagement()`). */
FORGE_API.Effect.prepare = (p => (t, op) => (estPasDeDegagement(t, op) || p(t, op)))(FORGE_API.Effect.prepare);
FORGE_API.Effect.gen = (g => function* (P, t, env) {
  if (estPasDeDegagement(t, env.op)) { forgeDefinis(P, t.RememberObjects || 'Self', env).filter(x => x && x.j == null && x.zone === 'champ').forEach(o => { o.exerce = true; P.ver++; }); return; }
  /* L'effet d'un autre joueur (`EffectOwner$`) : il en est le contrôleur. */
  const owner = t.EffectOwner ? forgeDefinis(P, t.EffectOwner, env).map(x => joueurDe(x, true)).find(j => j != null) : null;
  yield* g(P, t, owner != null ? {...env, ctrl: owner} : env);
})(FORGE_API.Effect.gen);
function estPasDeDegagement(t, op) {
  const v = op && op.face && op.face.svars[t.ReplacementEffects || ''];
  return t.ReplacementEffects === 'DontUntap' && !t.StaticAbilities && !t.Triggers && /^Event\$ Untap \| ValidCard\$ Card\.IsRemembered\b.*Layer\$ CantHappen/.test(v || '') &&
    (!t.Duration || /^(UntilTheEndOfYourNextUntap|UntilYourNextUntap)$/.test(t.Duration));
}
forgeSait('param', 'Effect.EffectOwner', 'Effect.RememberObjects', 'Clone.CloneTarget');

/* —— Les attributs ————————————————————————————————————————————————— */

/* Préparée (Prepare), enfourchée ce tour (Saddle), comploté depuis l'exil. */
FORGE_API.AlterAttribute.prepare = t => /^(Suspected|Prepared|Saddled|Plotted)$/.test(t.Attributes || '');
FORGE_API.AlterAttribute.gen = (g => function* (P, t, env) {
  if (t.Attributes === 'Suspected') return yield* g(P, t, env);
  const oui = t.Activate !== 'False';
  for (const o of objetsForge(P, t, env).filter(x => !x.lki)) {
    if (t.Attributes === 'Prepared' && o.zone === 'champ') o.prepare = oui;
    if (t.Attributes === 'Saddled' && o.zone === 'champ') o.enfourche = oui ? P.tour : null;
    if (t.Attributes === 'Plotted' && o.zone === 'exil') o.complotTour = oui ? P.tour : null;
    P.ver++;
  }
})(FORGE_API.AlterAttribute.gen);

/* Saddle N : engager d'autres créatures de force totale N ou plus, à la
   vitesse d'un rituel ; la monture est enfourchée jusqu'à la fin du tour. */
function motCleSelle(def, reste) {
  if (!/^\d+$/.test(reste[0] || '')) return false;
  def.capacites.push({genre: 'activee', vitesse: 'rituel', cout: {mana: coutManaVide(), equipage: +reste[0]}, texte: 'Saddle ' + reste[0],
    effet: {ops: [{op: 'enfourche', hostile: false}], cibles: [], modes: null}});
  return true;
}
OPS.enfourche = function* (P, op, ctx) {
  const s = sourceCtx(P, ctx);
  if (s && !s.lki && s.zone === 'champ') { s.enfourche = P.tour; P.ver++; emet(P, {t: 'enfourche', id: s.id, ctrl: s.ctrl}); }
};
forgeSait('kw', 'Saddle');
