/* =====================================================================
   js/forgeStatiquesC.js — Des statiques que la construction refusait

   Lot F74 :
   - `K:Hexproof:Card.nonColorless:each color` (Breaker of Creation, General
     Ferrous Rokiric, Elenda) : le linceul qui ne vaut que contre des sources
     d'un genre. Le filtre se range dans `def.params.hexproofDe` ; `ciblable()`
     le juge contre la source adverse ;
   - `ValidAfterStack$ Spell.cmcGE4` (Glarb, Thundermane Dragon, Nahiri) : jouer
     depuis le dessus de la bibliothèque, mais seulement les sorts qui répondent
     au filtre — les terrains passent toujours ;
   - `Mode$ CantDraw` (Narset, Parter of Veils ; Mornsong Aria) : un joueur ne
     peut plus piocher, ou pas plus de `DrawLimit$` cartes par tour ; `piocheN()`
     le demande avant chaque carte ;
   - `MayPlay` avec `EffectZone$ Exile,Graveyard` (Squee, the Immortal) : la
     carte se permet depuis l'une ou l'autre zone.
   ===================================================================== */

/* —— Hexproof contre un genre de sources ——————————————————————————————— */

motCleLancementB = (g => function (def, face, jetons, tete, reste) {
  if (tete === 'Hexproof' && reste.length >= 1 && /^[A-Z]/.test(reste[0])) {
    def.params.hexproofDe = [...(def.params.hexproofDe || []), reste[0]];
    return true;
  }
  return g(def, face, jetons, tete, reste);
})(motCleLancementB);

ciblable = (g => function (P, o, ctrl, couleurs, src) {
  const f = o.zone === 'champ' && o.def.params && o.def.params.hexproofDe;
  if (f && src && src.j == null && o.ctrl !== ctrl && f.some(v => forgeValideObjet(P, src, v, o, o.ctrl, null, true))) return false;
  return g(P, o, ctrl, couleurs, src);
})(ciblable);
forgeSait('kw', 'Hexproof');

/* —— Jouer d'en haut, mais pas n'importe quoi ————————————————————————— */

permisDeJouer = (g => function (P, j, o) {
  const x = g(P, j, o);
  if (!x || !x.s.t.ValidAfterStack || estType(o, 'land')) return x;
  const m = /^Spell\.(.+)$/.exec(x.s.t.ValidAfterStack);
  return m && forgeValideObjet(P, o, 'Card.' + m[1], x.src, j, null, true) ? x : null;
})(permisDeJouer);
forgeSait('param', 'Continuous.ValidAfterStack');

/* —— Ne plus piocher ———————————————————————————————————————————————— */

forgeStatique('CantDraw', ['ValidPlayer', 'DrawLimit'], () => {});

/* Le joueur `j` ne peut-il pas piocher une carte de plus ? */
function piocheInterdite(P, j) {
  return !!statiqueQui(P, 'CantDraw', (t, src, env) => joueurStatique(P, j, t.ValidPlayer, src, env) &&
    (!t.DrawLimit || (P.joueurs[j].piochesTour || 0) >= forgeNombre(P, t.DrawLimit, env)));
}
