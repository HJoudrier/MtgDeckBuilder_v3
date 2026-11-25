/* =====================================================================
   js/forgeRituelsC.js — Les rituels d'EDHREC : les derniers, premier lot

   Lot F107. Ce qui manquait aux rituels que F105 laissait de côté :
   - `Beam me up {cost}` (Federation Resupply) : se lance du cimetière pour ce
     coût en renvoyant une créature en main, puis s'exile — un rappel dont le
     coût porte une créature de plus ;
   - `SetState | Mode$ TurnFaceDown` (Illithid Harvester) : des créatures
     engagées retournées face cachée, 2/2 Horreur ;
   - `OpenAttraction`, `Planeswalk`, `ChaosEnsues`, `BlankLine` : le moteur ne
     tient ni pioche d'attractions ni deck de plans ; ces effets n'ont donc
     rien à ouvrir ni nulle part où aller (règles 717.1 et 901.2), ils le disent
     au journal ;
   - `PutCounter | ChoiceOptional` (Finality : « you may put two counters »).
   ===================================================================== */

/* —— Beam me up ———————————————————————————————————————————————————— */

forgeSait('kw', 'Beam me up');
motCleForge = (g => function (def, k, face, jetons) {
  const [tete, ...reste] = k.split(':');
  if (tete !== 'Beam me up') return g(def, k, face, jetons);
  const c = reste.length === 1 ? coutForge(reste[0]) : null;
  if (!c) return false;
  def.flashback = c.cout.mana;
  def.flashbackAutre = {renvoie: {n: 1, desc: descForge('Creature.YouCtrl')}};
  return true;
})(motCleForge);

/* —— Retourner face cachée ——————————————————————————————————————————— */

forgeSait('param', 'SetState.FaceDownPower', 'SetState.FaceDownToughness', 'SetState.FaceDownSetType');
FORGE_API.SetState.prepare = (p => function (t, op) { return t.Mode === 'TurnFaceDown' || !p || p.call(this, t, op); })(FORGE_API.SetState.prepare);
FORGE_API.SetState.gen = (g => function* (P, t, env) {
  if (t.Mode !== 'TurnFaceDown') return yield* g(P, t, env);
  const ty = typesForge(t.FaceDownSetType || '');
  for (const o of objetsForge(P, t, env).filter(x => x.zone === 'champ' && !x.lki && !x.faceCachee)) {
    const vraie = o.def;
    o.vraieDef = vraie; o.faceCachee = true;
    o.def = {...defFaceCachee(vraie), force: forgeNombre(P, t.FaceDownPower || 2, env), endurance: forgeNombre(P, t.FaceDownToughness || 2, env),
      sousTypes: ty.sousTypes};
    P.ver++;
    jn(P, `${vraie.nom} est retourné face cachée`);
  }
})(FORGE_API.SetState.gen);

/* —— Ce que le moteur n'a pas : attractions, plans ———————————————————————— */

forgeEffet('OpenAttraction', ['Amount'], function* (P, t, env) { jn(P, `${P.joueurs[env.ctrl].nom} n'a pas de pioche d'attractions : rien à ouvrir`); },
  (t, op) => { op.op = 'forge'; op.hostile = false; });
forgeEffet('Planeswalk', [], function* (P, t, env) { jn(P, 'Pas de deck de plans : personne ne planeswalke'); }, (t, op) => { op.op = 'forge'; op.hostile = false; });
forgeEffet('ChaosEnsues', [], function* (P, t, env) { jn(P, 'Pas de plan en jeu : le chaos ne déclenche rien'); }, (t, op) => { op.op = 'forge'; op.hostile = false; });
forgeEffet('BlankLine', [], function* () {}, (t, op) => { op.op = 'forge'; op.hostile = false; });

/* —— Une pose de marqueurs facultative —————————————————————————————— */

forgeSait('param', 'PutCounter.ChoiceOptional');

/* « Copy it. You may cast the copy » avec `Amount$ All` : une copie de chaque carte désignée (Psionic Ritual). */
FORGE_API.Play.gen = (g => function* (P, t, env) { return yield* g(P, t.CopyCard === 'True' && t.Amount === 'All' ? {...t, Amount: '1'} : t, env); })(FORGE_API.Play.gen);
