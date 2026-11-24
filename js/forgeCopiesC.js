/* =====================================================================
   js/forgeCopiesC.js — Des copies de plus, III (lot F89)

   Ce que l'effet de copie fait de la copie, en plus de js/forgeCopies.js et
   js/forgeCopiesB.js :
   - `RemoveSubTypes$ True` (Imposter Mech, Dino DNA, Taskmaster) : la copie ne
     garde que les sous-types qu'on lui ajoute ;
   - `ChoiceZone$ Graveyard` (Echoing Deeps, Invasion of Amonkhet, Voq) : ce qu'on
     copie se choisit dans une autre zone — « a land card in a graveyard » ;
   - `AddTriggers$`, `AddStaticAbilities$`, `AddAbilities$` (Phantasmal Image,
     Sakashima of a Thousand Faces, Machine God's Effigy) : la copie reçoit des
     déclencheurs, des statiques ou des capacités de plus, lus dans les SVars
     du script qui copie — compilés comme ceux d'une carte. Un morceau que
     le moteur ne sait pas construire est écarté : la copie en a moins, jamais plus.
   ===================================================================== */

const PARAMS_AJOUTS_COPIE = ['AddTriggers', 'AddStaticAbilities', 'AddAbilities', 'RemoveSubTypes', 'ChoiceZone'];
forgeSait('param', ...['Clone', 'CopyPermanent'].flatMap(a => PARAMS_AJOUTS_COPIE.map(p => a + '.' + p)));

/* Les gens qui copient donnent leur script à `defCopie()`, qui ne l'a pas. */
['Clone', 'CopyPermanent'].forEach(api => {
  FORGE_API[api].gen = (g => function* (P, t, env) {
    return yield* g(P, t.AddTriggers || t.AddStaticAbilities || t.AddAbilities || t.AddKeywords ? {...t, _face: env.face} : t, env);
  })(FORGE_API[api].gen);
});

defCopie = (g => function (def, t, capaciteCopie) {
  let d = g(def, t, capaciteCopie);
  if (t.RemoveSubTypes === 'True') {
    d = {...d, sousTypes: typesForge(String(t.AddTypes || '').split(/\s*[,&]\s*/).filter(m => m !== 'Legendary').join(',')).sousTypes};
    delete d._eph; delete d._ecoute; delete d._faceCachee;
  }
  /* Un mot-clé qui porte une capacité (« Crew:3 ») : construit comme celui d'une carte. */
  const complexes = String(t.AddKeywords || '').split(/\s*&\s*/).filter(k => /:/.test(k));
  if (complexes.length) {
    d = {...d, capacites: d.capacites.slice(), statiques: d.statiques.slice(), params: {...d.params}};
    complexes.forEach(k => { try { motCleForge(d, k, t._face || faceVide(), {}); } catch (e) { /* un mot-clé qu'on ne sait pas construire est écarté */ } });
    delete d._eph; delete d._ecoute; delete d._faceCachee;
  }
  const face = t._face;
  if (face && (t.AddTriggers || t.AddStaticAbilities || t.AddAbilities)) {
    const tmp = {capacites: [], statiques: [], params: {}, mots: 0}, noms = v => String(v || '').split(/\s*[,&]\s*/).filter(Boolean);
    for (const n of noms(t.AddAbilities)) { const a = forgeSousCapacite(face, n); if (a) capaciteForge(tmp, face, a, {}); }
    for (const n of noms(t.AddTriggers)) if (face.svars[n]) declencheurForge(tmp, face, forgeTable(face.svars[n]), {});
    for (const n of noms(t.AddStaticAbilities)) { const s = face.svars[n] && statiqueForge(face, forgeTable(face.svars[n]), {}); if (s) tmp.statiques.push(s); }
    if (tmp.capacites.length || tmp.statiques.length) {
      d = {...d, capacites: [...d.capacites, ...tmp.capacites], statiques: [...d.statiques, ...tmp.statiques]};
      delete d._eph; delete d._ecoute; delete d._faceCachee;
    }
  }
  return d;
})(defCopie);

/* Ce qu'on copie, quand ce n'est pas sur le champ. */
aCopier = (g => function* (P, t, env) {
  const zone = ZONES_FORGE[t.ChoiceZone];
  if (!t.ChoiceZone || !zone || zone === 'champ' || !t.Choices || env.op.slot != null || t.Defined) return yield* g(P, t, env);
  const ids = objetsZone(P, zone).filter(o => forgeValideObjet(P, o, t.Choices, env.src, env.ctrl, env)).map(o => o.id);
  if (!ids.length) return [];
  return (yield* choisitCartes(P, env.ctrl, ids, 1, 'Copier', 'cartes', 1)).map(id => obj(P, id));
})(aCopier);

/* `Clone` lit déjà ce que `defCopie()` fait de ces paramètres (js/forgeCopiesB.js) ; `AddSVars$` ne dit rien de plus
   que les SVars qu'on garde avec le script. */
forgeSait('param', 'Clone.RemoveCardTypes', 'Clone.AddColors', 'CopyPermanent.AddSVars');
