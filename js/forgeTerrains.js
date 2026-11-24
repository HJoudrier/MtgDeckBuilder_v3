/* =====================================================================
   js/forgeTerrains.js — Ce que les terrains font de plus

   Lot F96 :
   - `TargetsWithSameCreatureType` (Secret Tunnel) : les cibles d'une même
     capacité partagent un type de créature ;
   - `GainControlVariant | ChangeController$ CardOwner` (Homeward Path) :
     chaque joueur reprend les créatures qu'il possède.
   ===================================================================== */

/* Ces deux objets partagent-ils un type de créature ? Un changelin en partage avec toute créature. */
function partageTypeCreature(P, a, b) {
  if (!a || !b) return false;
  const ca = car(P, a), cb = car(P, b);
  if (ca.changelin || cb.changelin) return true;
  const tb = sousTypesCreature(cb);
  return sousTypesCreature(ca).some(t => tb.includes(t));
}
forgeSait('param', 'Effect.TargetsWithSameCreatureType');

/* Rendre à leur propriétaire les créatures que d'autres contrôlent. */
forgeEffet('GainControlVariant', ['AllValid', 'ChangeController', 'AILogic'], function* (P, t, env) {
  objetsZone(P, 'champ').filter(o => forgeValideObjet(P, o, t.AllValid, env.src, env.ctrl, env) && o.prop != null && o.ctrl !== o.prop).forEach(o => {
    o.ctrl = o.prop; o.ctrlRendu = null; o.pret = false; P.ver++;
  });
}, (t, op) => { op.op = 'forge'; op.hostile = false; }, {prepare: t => t.ChangeController === 'CardOwner' && !!t.AllValid});

/* —— Le mana des cartes du cimetière ——————————————————————————————— */

/* « Add one mana of any color among legendary creature cards in your graveyard » (The Grey Havens) : les couleurs
   des cartes du cimetière du joueur qui répondent au filtre, lues au moment de payer. */
capaciteForge = (g => function (def, face, t, jetons) {
  const m = forgeApi(t) === 'ManaReflected' && /^Defined\.ValidGraveyard (.+)$/.exec(t.Valid || '');
  if (!m) return g(def, face, t, jetons);
  const c = coutForge(t.Cost);
  if (!c || t.SubAbility || t.ReflectProperty !== 'Is' || t.ColorOrType !== 'Color' || Object.keys(c.cout).some(k => k !== 'mana' && k !== 'engage') ||
    (c.cout.mana && c.cout.mana.total) || !tableJouable(t)) return false;
  def.capacites.push({genre: 'mana', cout: c.cout, options: [], reflete: {cimetiere: m[1], type: false}, texte: texteForge(face, t)});
  return true;
})(capaciteForge);

manaReflete = (g => function (P, j, o, k) {
  if (!k.reflete.cimetiere) return g(P, j, o, k);
  const r = new Set();
  P.joueurs[j].cimetiere.map(id => obj(P, id)).filter(x => x && forgeValideObjet(P, x, k.reflete.cimetiere, o, j, null, true)).forEach(x => (x.def.couleurs || []).forEach(l => r.add(l)));
  return [...r];
})(manaReflete);

