/* =====================================================================
   js/forgeCopies.js — Les copies de Forge : un jeton copie d'un
   permanent, un objet qui entre comme copie, la copie d'un sort

   Les valeurs copiables d'un objet sont sa définition du moment (la face
   qu'il joue), plus ce que l'effet de copie ajoute (types, mots-clés) —
   règle 707.2. Une copie de sort n'est pas une carte : un élément de pile
   qui se résout comme le sort et disparaît.
   ===================================================================== */

/* La définition d'une copie, avec ce que l'effet ajoute. */
function defCopie(def, t) {
  if (!t.AddTypes && !t.AddKeywords && !t.SetPower && !t.SetToughness && !t.PumpKeywords) return def;
  const ty = typesForge(t.AddTypes);
  const d = {...def, types: [...new Set([...def.types, ...ty.types])], sousTypes: [...new Set([...def.sousTypes, ...ty.sousTypes])],
    mots: def.mots | motsForge(t.AddKeywords) | motsForge(t.PumpKeywords)};
  if (t.SetPower) d.force = +t.SetPower;
  if (t.SetToughness) d.endurance = +t.SetToughness;
  delete d._eph; delete d._ecoute; delete d._faceCachee;
  return d;
}

/* Ce qu'on copie : la cible, sinon ce qu'on choisit parmi `Choices`. */
function* aCopier(P, t, env) {
  if (env.op.slot != null || t.Defined) return objetsForge(P, t, env, 'Targeted');
  if (!t.Choices) return [];
  const ids = objetsZone(P, 'champ').filter(o => forgeValideObjet(P, o, t.Choices, env.src, env.ctrl, env)).map(o => o.id);
  return (yield* choisitCartes(P, env.ctrl, ids, 1, 'Copier', 'cartes', 1)).map(id => obj(P, id));
}

forgeEffet('CopyPermanent', ['NumCopies', 'AddTypes', 'AddKeywords', 'PumpKeywords', 'SetPower', 'SetToughness', 'AtEOT', 'Choices',
  'Populate', 'Controller', 'RememberCopied'], function* (P, t, env) {
  const modeles = (yield* aCopier(P, t.Populate === 'True' && !t.Choices ? {...t, Choices: 'Creature.token+YouCtrl'} : t, env))
    .filter(o => o && o.j == null);
  const j = t.Controller ? forgeDefinis(P, t.Controller, env).map(x => joueurDe(x))[0] : env.ctrl;
  if (j == null) return;
  const n = forgeNombre(P, t.NumCopies || 1, env);
  for (const m of modeles) {
    const def = defCopie(m.def, t);
    for (let k = 0; k < n; k++) {
      if (P.champ.length >= PLAFOND_CHAMP) { P.fin = P.fin || {nulle: true, raison: 'plafond'}; return; }
      const o = creeObjet(P, nouvelleCarte(P, def, j, false, true), j, 'champ');
      if (t.AtEOT) o.finEtape = t.AtEOT === 'Exile' ? 'exil' : 'sacrifice';
      P.champ.push(o.id);
      P.ver++;
      emet(P, {t: 'entre', id: o.id, ctrl: j, jeton: true});
      noteEntree(P, null, 'champ', o);
      if (t.RememberCopied === 'True') retiensForge(env.ctx, o.id);
    }
    jn(P, `${n} copie(s) de ${m.def.nom}`);
  }
}, (t, op) => { op.op = 'jetons'; op.n = 1; op.hostile = false; op._def = {types: ['creature'], force: 2, endurance: 2, mots: 0, capacites: [], statiques: [], mv: 2}; },
{prepare: t => !t.AtEOT || t.AtEOT === 'Sacrifice' || t.AtEOT === 'Exile'});

/* Devenir la copie d'un objet (« Clone ») : l'objet désigné — souvent
   la carte qui entre — prend la définition copiée. */
forgeEffet('Clone', ['Choices', 'AddTypes', 'AddKeywords', 'SetPower', 'SetToughness'], function* (P, t, env) {
  const m = (yield* aCopier(P, {...t, Defined: undefined}, env))[0];
  const cible = forgeDefinis(P, t.Defined || 'Self', env).find(x => x && x.j == null && !x.lki && x.zone === 'champ');
  if (!m || !cible || m.id === cible.id) return;
  cible.def = defCopie(m.def, t);
  cible.copie = true;
  P.ver++;
  jn(P, `${P.cartes[cible.cid].def.nom} devient une copie de ${m.def.nom}`);
}, (t, op) => { op.op = 'forge'; op.hostile = false; }, {prepare: (t, op) => op.slot == null});

/* Copier un sort sur la pile : un élément qui se résout comme lui, avec de
   nouvelles cibles si l'on veut, et qui ne laisse aucune carte. */
forgeEffet('CopySpellAbility', ['MayChooseTarget', 'Controller'], function* (P, t, env) {
  const j = t.Controller ? forgeDefinis(P, t.Controller, env).map(x => joueurDe(x))[0] : env.ctrl;
  for (const o of objetsForge(P, t, env, 'Targeted').filter(o => o.zone === 'pile')) {
    const it = P.pile.find(x => x.id === o.id);
    if (it) yield* copieSort(P, j, o, it, t.MayChooseTarget === 'True');
  }
}, (t, op) => { op.op = 'forge'; op.hostile = false; });

/* Une copie d'un sort de la pile, avec de nouvelles cibles si l'on veut :
   la copie de Twincast, celles de la tempête. */
function* copieSort(P, j, o, it, nouvelles) {
  if (!o || !it.def.sort || it.def.types.some(x => TYPES_PERMANENTS.includes(x))) return;
  let effets = it.effets.map(ef => ({...ef, cibles: ef.cibles.map(c => c.slice())}));
  if (nouvelles) {
    const nouv = yield* prepareEffets(P, j, o, it.def.sort, it.def.couleurs);
    if (nouv) effets = nouv;
  }
  P.pile.push({id: P.prochainId++, capacite: true, copie: true, source: o.id, lki: instantane(P, o), ctrl: j, effets, x: it.x,
    nom: it.def.nom + ' (copie)', kicked: it.kicked});
  jn(P, `${P.joueurs[j].nom} copie ${it.def.nom}`);
}

/* Les jetons copiés « jusqu'à la fin du tour » partent à l'étape de fin. */
function copiesFin(P) {
  P.champ.filter(id => obj(P, id).finEtape).forEach(id => {
    const o = obj(P, id);
    if (o.finEtape === 'exil') deplace(P, id, 'exil'); else sacrifie(P, id);
  });
}
