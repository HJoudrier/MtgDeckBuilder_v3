/* =====================================================================
   js/forgeCopiesB.js — Des copies de plus (lot F81)

   Ce que l'effet de copie ajoute à la copie, en plus de ce que dit
   js/forgeCopies.js `defCopie()` :
   - `AddColors$ Black` : des couleurs de plus (Ratadrabik of Urborg,
     The Jolly Balloon Man) ;
   - `RemoveCardTypes$ True` : la copie ne garde que les types ajoutés
     (Espers to Magicite : un artefact, plus une créature) ;
   - `PumpKeywords$` + `PumpDuration$ EOT` : le mot-clé ne dure que jusqu'à
     la fin du tour, il n'entre pas dans la définition (Ashling, the
     Limitless : la copie a la célérité ce tour-ci seulement) ;
   - `Clone | IntoPlayTapped$ True` : l'objet qui devient la copie entre
     engagé (Vesuva) ; `AddSVars$` ne dit rien de plus que ce que le moteur
     range déjà avec la capacité copiée (Kimahri, Court of Vantress).
   ===================================================================== */

defCopie = (g => function (def, t, capaciteCopie) {
  const duree = t.PumpDuration === 'EOT' && t.PumpKeywords;
  let d = g(def, duree ? {...t, PumpKeywords: undefined} : t, capaciteCopie);
  if (!t.AddColors && t.RemoveCardTypes !== 'True') return d;
  d = {...d};
  if (t.AddColors) d.couleurs = [...new Set([...d.couleurs, ...couleursMots(t.AddColors)])];
  if (t.RemoveCardTypes === 'True') {
    const ty = typesForge(String(t.AddTypes || '').split(/\s*[,&]\s*/).filter(m => m !== 'Legendary').join(','));
    d.types = ty.types; d.sousTypes = ty.sousTypes;
  }
  delete d._eph; delete d._ecoute; delete d._faceCachee;
  return d;
})(defCopie);

etendEffet('CopyPermanent', ['AddColors', 'RemoveCardTypes', 'PumpDuration'], null, function* (P, t, env, touches, nouveaux) {
  if (t.PumpDuration === 'EOT' && t.PumpKeywords) nouveaux.forEach(o => { o.mods.push({f: 0, e: 0, mots: motsForge(t.PumpKeywords), fin: 'tour'}); P.ver++; });
});

etendEffet('Clone', ['IntoPlayTapped', 'AddSVars'], null, function* (P, t, env) {
  if (t.IntoPlayTapped !== 'True') return;
  const c = forgeDefinis(P, t.Defined || 'Self', env).find(x => x && x.j == null && !x.lki && x.zone === 'champ');
  if (c) { c.engage = true; P.ver++; }
});

forgeSait('param', 'CopySpellAbility.UnlessAI');
