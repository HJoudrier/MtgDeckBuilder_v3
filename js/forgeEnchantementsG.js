/* =====================================================================
   js/forgeEnchantementsG.js — Les enchantements d'EDHREC : le déphasage

   Lot F109 : Out of Time (« phase them out until this leaves the
   battlefield ») et The Phasing of Zhalfir (« it can't phase in for as
   long as you control this »). Les permanents déphasés vivent dans
   `P.horsPhase` et reviennent à l'étape de dégagement de leur contrôleur
   (js/forgeEffetsG.js) ; une entrée peut en plus :
   - rester dehors (`fixe`) : le dégagement ne la rend plus ;
   - dépendre d'un hôte (`hote`) : quand il part du champ, elle revient tout
     de suite (`retour: immediat`, Out of Time) ou redevient ordinaire et
     revient au prochain dégagement (`retour: untap`, Zhalfir).
   Dans Forge, ces deux effets sont des Effects en zone de commandement,
   avec leurs déclencheurs ; ici le départ de l'hôte suffit — on ne bâtit
   pas l'effet, on marque les entrées.
   ===================================================================== */

forgeSait('param', 'Phases.RememberAffected', 'Phases.WontPhaseInNormal', 'Phases.PhaseInOrOut', 'Effect.ForgetOnPhasedIn');
forgeSait('stat', 'CantPhaseIn');
forgeSait('param', 'CantPhaseIn.ValidCard');
forgeSait('filtre', 'phasedOutIsRemembered');

FORGE_API.Phases.prepare = (p => function (t, op) { return p.call(this, {...t, PhaseInOrOut: undefined, WontPhaseInNormal: undefined}, op); })(FORGE_API.Phases.prepare);
FORGE_API.Phases.gen = (g => function* (P, t, env) {
  const avant = new Set((P.horsPhase || []).map(x => x.id));
  if (t.PhaseInOrOut === 'True' && t.Defined) {
    /* Revenir : ce qui est dehors rentre, ce qui est dedans sort. */
    for (const x of forgeDefinis(P, t.Defined, env).filter(y => y && y.j == null)) {
      const e = (P.horsPhase || []).find(h => h.id === x.id);
      if (e) { P.horsPhase = P.horsPhase.filter(h => h !== e); if (obj(P, e.id) && !P.champ.includes(e.id)) P.champ.push(e.id); P.ver++; }
      else if (x.zone === 'champ') yield* g(P, {...t, Defined: 'Remembered'}, {...env, ctx: {...env.ctx, memo: [x.id]}});
    }
    return;
  }
  yield* g(P, t, env);
  for (const e of (P.horsPhase || []).filter(h => !avant.has(h.id))) {
    if (t.WontPhaseInNormal === 'True') e.fixe = true;
    const o = obj(P, e.id);
    if (t.RememberAffected === 'True' && o && o.att == null) retiensForge(env.ctx, e.id);
  }
})(FORGE_API.Phases.gen);

/* Les deux effets sont des marques sur les entrées déphasées. */
function phaseSelonHote(t, face) {
  if (t.ForgetOnPhasedIn === 'True') return 'immediat';
  const noms = String(t.StaticAbilities || '').split(',').map(x => x.trim()).filter(Boolean);
  return noms.some(n => /Mode\$ CantPhaseIn/.test((face.svars || {})[n] || '')) ? 'untap' : null;
}
FORGE_API.Effect.prepare = (p => function (t, op) { return !!phaseSelonHote(t, op.face || {}) || p.call(this, t, op); })(FORGE_API.Effect.prepare);
FORGE_API.Effect.gen = (g => function* (P, t, env) {
  const retour = phaseSelonHote(t, env.face || {});
  if (!retour) return yield* g(P, t, env);
  const memo = t.RememberObjects ? forgeDefinis(P, t.RememberObjects, env).filter(x => x && x.j == null).map(x => x.id) : (env.ctx.memo || []).slice();
  for (const e of (P.horsPhase || [])) {
    const o = obj(P, e.id);
    if (!memo.includes(e.id) && !(o && memo.includes(o.att))) continue;
    e.hote = env.src ? env.src.id : null; e.retour = retour;
    if (retour === 'untap') e.fixe = true;
  }
  P.hotesSuivis = true;
})(FORGE_API.Effect.gen);

/* Ce qui ne revient pas : l'entrée fixe attend le départ de son hôte. */
phasesEntrent = (g => function (P) {
  const fixes = (P.horsPhase || []).filter(x => x.fixe);
  if (!fixes.length) return g(P);
  P.horsPhase = P.horsPhase.filter(x => !x.fixe);
  g(P);
  P.horsPhase = [...P.horsPhase, ...fixes];
})(phasesEntrent);

hotePartObjets = (g => function (P, id) {
  g(P, id);
  const l = (P.horsPhase || []).filter(x => x.hote === id);
  if (!l.length) return;
  for (const e of l) {
    e.hote = null; e.fixe = false;
    if (e.retour === 'immediat' && obj(P, e.id) && !P.champ.includes(e.id)) P.champ.push(e.id);
  }
  P.horsPhase = P.horsPhase.filter(x => !(x.retour === 'immediat' && l.includes(x)));
  P.ver++;
})(hotePartObjets);
