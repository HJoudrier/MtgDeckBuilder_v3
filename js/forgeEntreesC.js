/* =====================================================================
   js/forgeEntreesC.js — Deux façons d'entrer que le moteur ne lisait pas

   Lot F96, terrains (« enters tapped if it was played from your hand », de
   Fetching Garden, est lu par js/forgeDefinition.js `entreeForge()`) :
   - « As ~ enters, you may reveal a Dragon card from your hand. ~ enters
     tapped unless you revealed a Dragon card this way or you control a
     Dragon » (Temple of the Dragon Queen, Fortified Beachhead) : un terrain
     engagé, sauf si l'on en a un de ce genre en main — c'est `saufRevele` —
     ou sur le champ — c'est `sauf` ;
   - « If ~ would enter, instead sacrifice each other permanent named ~ »
     (Sheltered Valley) : les homonymes qu'on contrôle sont sacrifiés avant
     son arrivée.
   ===================================================================== */

entreeSoiForge = (g => function (def, face, r) {
  if (g(def, face, r)) return true;
  if (r.Event !== 'Moved' || r.Destination !== 'Battlefield' || !/^(Card|Permanent|Land)\.Self$/.test(r.ValidCard || '') || (r.ActiveZones && r.ActiveZones !== 'Battlefield')) return false;
  const w = forgeSousCapacite(face, r.ReplaceWith);
  if (!w) return false;
  /* Révéler, puis s'engager sauf si l'on a révélé ou si l'on en contrôle. */
  if (forgeApi(w) === 'Reveal' && w.Optional === 'True' && w.RevealValid && w.RememberRevealed === 'True' && w.SubAbility && !r.Origin) {
    const t = forgeSousCapacite(face, w.SubAbility), c = t && t.SubAbility && forgeSousCapacite(face, t.SubAbility);
    const sv = t && face.svars[t.ConditionCheckSVar] || '', m = /^Count\$RememberedSize\/Plus\.(\w+)$/.exec(sv.trim());
    const compte = m && /^Count\$Valid (.+)\.inZoneBattlefield\+YouCtrl$/.exec((face.svars[m[1]] || '').trim());
    if (!t || forgeApi(t) !== 'Tap' || t.Defined !== 'Self' || t.ETB !== 'True' || t.ConditionSVarCompare !== 'EQ0' || !compte || compte[1] !== w.RevealValid) return false;
    if (c && (forgeApi(c) !== 'Cleanup' || c.SubAbility)) return false;
    const ent = def.entree = def.entree || {};
    ent.engagee = true; ent.saufRevele = descForge(w.RevealValid); ent.sauf = [descForge(w.RevealValid + '.YouCtrl')];
    return true;
  }
  /* Sacrifier les homonymes, puis entrer. */
  if (forgeApi(w) === 'SacrificeAll' && /^Permanent\.YouCtrl\+named(.+)$/.test(w.ValidCards || '') && w.SubAbility && !r.Origin) {
    const nom = /^Permanent\.YouCtrl\+named(.+)$/.exec(w.ValidCards)[1], d = forgeSousCapacite(face, w.SubAbility);
    if (nom !== face.nom || !d || forgeApi(d) !== 'ChangeZone' || d.Defined !== 'ReplacedCard' || d.Destination !== 'Battlefield' || d.SubAbility) return false;
    (def.entree = def.entree || {}).sacMemeNom = true;
    return true;
  }
  return false;
})(entreeSoiForge);

forgeSait('param', 'ChooseType.ETB');
forgeSait('param', 'Moved.ValidCause');
forgeValeurs('Moved.ValidCause', ['LandAbility.YouCtrl', 'SpellAbility.OppCtrl']);
