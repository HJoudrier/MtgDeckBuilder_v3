/* =====================================================================
   js/forgeEntreesB.js — « Ce sort entre avec des marqueurs de plus »

   Lot F80. Torgal, Communal Brewing, Summon: Fenrir : un déclencheur de
   lancement pose un effet qui retient le sort (`RememberObjects$
   TriggeredCard`) et porte un remplacement « quand il entre sur le champ,
   des marqueurs de plus » (`Event$ Moved | ValidCard$ Card.IsRemembered |
   ReplaceWith$ … PutCounter | Defined$ ReplacedCard | ETB$ True`). Forge le
   range dans la zone de commandement et l'exile quand le sort quitte la
   pile ; l'effet d'ici disparaît au même moment (`ExileOnMoved$ Stack`),
   alors le nombre se relève avant le déplacement (js/jeuOpsB.js `metEnJeu`).
   Simplification : le nombre retenu (`SetChosenNumber`) se range avec la
   carte hôte ; deux sorts lancés de suite se partagent le dernier.
   ===================================================================== */

formeRemplacement = (g => function (face, r) {
  const b = g(face, r);
  if (b || r.Event !== 'Moved' || r.Destination !== 'Battlefield' || r.ValidCard !== 'Card.IsRemembered' || !r.ReplaceWith || (r.Origin && r.Origin !== 'Stack')) return b;
  const w = forgeSousCapacite(face, r.ReplaceWith);
  /* La suite peut seulement retirer l'effet (`ChangeZone | Defined$ Self | Origin$ Command`) : il disparaît de lui-même. */
  const suite = w && w.SubAbility && forgeSousCapacite(face, w.SubAbility), seulementRetrait = !!suite && suite.DB === 'ChangeZone' && suite.Defined === 'Self' && suite.Origin === 'Command' && !suite.SubAbility;
  if (w && w.DB === 'Tap' && w.Defined === 'ReplacedCard' && w.ETB === 'True' && (!w.SubAbility || seulementRetrait)) return 'entreEngage';
  if (w && w.DB === 'PutCounter' && w.Defined === 'ReplacedCard' && w.ETB === 'True' && genreMarqueur(w.CounterType) && suite && suite.DB === 'Tap' && suite.Defined === 'ReplacedCard' && suite.ETB === 'True') {
    /* Des marqueurs, puis engagé, puis (peut-être) le retrait de l'effet : Loch Larent, « enters tapped and with a stun counter ». */
    const fin = suite.SubAbility && forgeSousCapacite(face, suite.SubAbility);
    if (!fin || (fin.DB === 'ChangeZone' && fin.Defined === 'Self' && fin.Origin === 'Command' && !fin.SubAbility)) return 'entreAvecEngage';
  }
  return w && w.DB === 'PutCounter' && w.Defined === 'ReplacedCard' && w.ETB === 'True' && (!w.SubAbility || seulementRetrait) && genreMarqueur(w.CounterType) ? 'entreAvec' : b;
})(formeRemplacement);

/* Ce que ce sort recevra en entrant : `[{genre, n}]` des marqueurs, ou `{engage: true}`, à lever
   avant que `deplace()` ne referme l'effet. */
function entreAvecPrevu(P, id) {
  const l = [];
  for (const {src, r} of remplacementsEnJeu(P)) {
    if (!/^entre(Avec|Engage|AvecEngage)$/.test(r.forme) || !(src.memo || []).includes(id)) continue;
    if (r.forme === 'entreEngage') { l.push({engage: true}); continue; }
    if (r.forme === 'entreAvecEngage') l.push({engage: true});
    const w = forgeSousCapacite(r.face, r.t.ReplaceWith), n = forgeNombre(P, w.CounterNum || 1, envRemplacement(src, r));
    if (n > 0) l.push({genre: genreMarqueur(w.CounterType), n});
  }
  return l;
}
