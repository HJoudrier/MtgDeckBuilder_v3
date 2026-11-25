/* =====================================================================
   js/forgeInstantsD.js — Les instants : mots accordés, vie, déclarations

   Lot F101 :
   - `KW$ Afterlife:1` accordé jusqu'à la fin du tour (Afterlife Insurance) ;
   - Delay : le sort contrecarré part en exil avec trois marqueurs de temps
     et gagne la suspension — il se lancera quand le dernier marqueur tombe ;
   - `CantLoseLife` (Everybody Lives!) ;
   - Hellish Rebuke : les permanents adverses qui blessent le lanceur sont
     sacrifiés, et leur contrôleur perd 2 points de vie ;
   - Master Warcraft : celui qui lance le sort décide qui attaque et qui
     bloque, et comment, ce tour-là ;
   - Illusion of Choice : celui qui lance le sort décide du vote de chacun ;
   - des paramètres qui n'ont de sens que dans le coût ou la restriction
     d'un sort : `OpponentTurn`, `ExileOnLost`.
   ===================================================================== */

/* —— Un mot-clé avec une valeur, accordé pour le tour ——————————————————— */

pompeForge = (g => function (P, objets, t, env) {
  g(P, objets, t, env);
  const vivants = objets.filter(o => o.zone === 'champ' && !o.lki);
  const apres = String(t.KW || '').split('&').map(k => /^Afterlife:(\d+)$/.exec(k.trim())).filter(Boolean).map(m => +m[1]);
  if (!apres.length) return;
  const fd = finForge(t, env) || {fin: 'tour'};
  vivants.forEach(o => (o.anime = o.anime || []).push({fin: fd.fin, capacites: apres.map(n => ({genre: 'declenchee', ecoutes: [{evt: 'meurt', sujet: 'soi'}],
    texte: 'Afterlife ' + n, effet: {ops: [{op: 'esprits', n, hostile: false}], cibles: [], modes: null}}))}));
  P.ver++;
})(pompeForge);
forgeSait('kwval', ...[1, 2, 3, 4].map(n => 'afterlife:' + n));

/* —— La suspension donnée par un sort ——————————————————————————————————— */

/* Les marqueurs de temps d'une carte exilée sont le décompte de sa suspension (`o.temps`, js/jeuVariantes.js). */
FORGE_API.PutCounter.gen = (g => function* (P, t, env) {
  if (String(t.CounterType).toUpperCase() !== 'TIME') return yield* g(P, t, env);
  const cibles = (env.op.slot != null ? ciblesForge(P, env, false) : forgeDefinis(P, t.Defined || 'Self', env)).filter(x => x && x.j == null);
  for (const o of cibles.filter(x => x.zone === 'exil')) o.temps = (o.temps || 0) + forgeNombre(P, t.CounterNum || 1, env);
  P.ver++;
  /* Des marqueurs « time » sur le champ sont des marqueurs ordinaires (The Millennium Calendar). */
  if (cibles.some(x => x.zone === 'champ')) yield* g(P, t, env);
})(FORGE_API.PutCounter.gen);
forgeSait('param', 'PutCounter.CounterType');
FORGE_API.Pump.gen = (g => function* (P, t, env) {
  if (t.PumpZone !== 'Exile' || String(t.KW).trim().toLowerCase() !== 'suspend') return yield* g(P, t, env);
  for (const o of objetsForge(P, t, env).filter(x => x && x.j == null && x.zone === 'exil')) { o.suspendu = true; o.suspendDe = o.prop; }
  P.ver++;
})(FORGE_API.Pump.gen);
FORGE_API.Pump.prepare = (p => function (t, op) {
  return (t.PumpZone === 'Exile' && String(t.KW).trim().toLowerCase() === 'suspend') || p.call(this, t, op);
})(FORGE_API.Pump.prepare);
forgeSait('kwval', 'suspend');

/* —— Perdre de la vie ——————————————————————————————————————————————— */

forgeStatique('CantLoseLife', ['ValidPlayer'], () => {});
const vieInperdable = (P, j) => !!statiqueQui(P, 'CantLoseLife', (t, src, env) => joueurStatique(P, j, t.ValidPlayer, src, env));
vieReduite = (g => function (P, j, n, degats) { return n > 0 && vieInperdable(P, j) ? 0 : g(P, j, n, degats); })(vieReduite);

/* —— Hellish Rebuke ——————————————————————————————————————————————— */

/* Le motif d'une capacité qui n'a pas d'autre forme : l'effet pose, pour le tour, « quand ce permanent blesse celui qui a lancé le sort,
   sacrifie-le ; son contrôleur perd 2 points de vie ». */
const estRebuke = (t, face) => {
  const s = t.StaticAbilities && face.svars[String(t.StaticAbilities).trim()];
  return !!s && /AddTrigger\$ *\w+/.test(s) && /Affected\$ *Permanent\.IsRemembered/.test(s) && /OriginalHostRemembered/.test(String(face.svars[/AddTrigger\$ *(\w+)/.exec(s)[1]] || ''));
};
FORGE_API.Effect.prepare = (p => function (t, op) {
  if (op.face && estRebuke(t, op.face)) { op.rebuke = true; return true; }
  return p.call(this, t, op);
})(FORGE_API.Effect.prepare);
FORGE_API.Effect.gen = (g => function* (P, t, env) {
  if (!env.op.rebuke) return yield* g(P, t, env);
  (P.rebukes = P.rebukes || []).push({j: env.ctrl, tour: P.tour});
})(FORGE_API.Effect.gen);
forgeSait('defini', 'Caster');
noteHistorique = (g => function (P, e) {
  g(P, e);
  if (e.t !== 'degatsJoueur' || !P.rebukes) return;
  const s = obj(P, e.source);
  if (!s || s.zone !== 'champ' || P.rebukes.every(r => r.tour !== P.tour || r.j !== e.joueur) || s.ctrl === e.joueur) return;
  const perdant = s.ctrl;
  sacrifie(P, s.id);
  P.joueurs[perdant].vie -= vieReduite(P, perdant, 2, false);
  emet(P, {t: 'perteVie', joueur: perdant, n: 2});
})(noteHistorique);

/* —— Master Warcraft, Illusion of Choice ———————————————————————————————— */

/* Pour un tour, celui qui a lancé le sort répond à la place du joueur qui déclare. */
function marqueDirection(P, cle, j) { (P[cle] = P[cle] || []).push({par: j, tour: P.tour}); }
question = (g => function (P, j, q, options, x) {
  const r = g(P, j, q, options, x);
  if (q !== 'attaquants' && q !== 'bloqueurs') return r;
  const d = (P.declarations || []).find(m => m.tour === P.tour);
  if (d && d.par !== j && !P.joueurs[d.par].elimine) { r.joueur = d.par; r.dirigeDe = j; }
  return r;
})(question);

FORGE_API.Effect.gen = (g => function* (P, t, env) {
  const stat = String(t.StaticAbilities || '').split(',').map(n => env.face && env.face.svars[n.trim()]).filter(Boolean).join(' ');
  if (/DeclaresAttackers\$ *You/.test(stat) || /DeclaresBlockers\$ *You/.test(stat)) { marqueDirection(P, 'declarations', env.ctrl); return; }
  if (/ControlVote\$ *True/.test(stat)) { marqueDirection(P, 'votes', env.ctrl); return; }
  return yield* g(P, t, env);
})(FORGE_API.Effect.gen);
FORGE_API.Effect.prepare = (p => function (t, op) {
  const stat = String(t.StaticAbilities || '').split(',').map(n => op.face && op.face.svars[n.trim()]).filter(Boolean).join(' ');
  if (/(DeclaresAttackers|DeclaresBlockers|ControlVote)\$ *(You|True)/.test(stat)) return true;
  return p.call(this, t, op);
})(FORGE_API.Effect.prepare);
forgeSait('param', 'Continuous.DeclaresAttackers', 'Continuous.DeclaresBlockers', 'Continuous.ControlVote');

/* Le vote : chaque voix est celle que choisit celui qui dirige les votes. */
choisitUn = (g => function* (P, j, options, texte, prefere, source) {
  if (P.dansVote) { const d = (P.votes || []).find(m => m.tour === P.tour); if (d && !P.joueurs[d.par].elimine) j = d.par; }
  return yield* g(P, j, options, texte, prefere, source);
})(choisitUn);
FORGE_API.Vote.gen = (g => function* (P, t, env) {
  P.dansVote = true;
  try { yield* g(P, t, env); } finally { P.dansVote = false; }
})(FORGE_API.Vote.gen);

/* —— Ce qui ne change rien à la résolution ——————————————————————————————— */

/* `OpponentTurn$` d'un sort ne se lit qu'à son lancement (js/forgeEffetsL.js) ; `ExileOnLost$` : l'effet part quand sa source part. */
forgeSait('param', 'Effect.OpponentTurn', 'RemoveFromCombat.OpponentTurn', 'Effect.ExileOnLost', 'ChangeZone.TargetsWithSameCreatureType');
