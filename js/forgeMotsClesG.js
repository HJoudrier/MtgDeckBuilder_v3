/* =====================================================================
   js/forgeMotsClesG.js — Les mots-clés, IV

   Lot F75, ce que demandaient une quarantaine de scripts :
   - **évasions et prévention posées pour le tour** (`KW$ Fear`, `Intimidate`,
     `Skulk` ; `Prevent all damage that would be dealt by CARDNAME` ;
     « power and toughness are switched », Twisted Image, Inversion Behemoth) :
     des drapeaux du bonus (js/forgeEffetsC.js `CACHES_DU_TOUR`) que
     `peutBloquer()`, `car()` et `degatsApresPrevention()` lisent ;
   - **la prévention imprimée** (`K:Prevent all combat damage that would be dealt
     to CARDNAME` : Guard Gomazoa, Fog Bank — « and dealt by ») ;
   - **Training**, **Undaunted** (un {1} de moins par adversaire), **Gravestorm**
     (une copie par permanent mis au cimetière ce tour) ;
   - `CARDNAME can't attack or block.` imprimé (Grakk the Pacifist) ;
   - **ce qui ne regarde pas la partie** : Companion (la simulation n'a pas de
     réserve), DeckLimit, « a deck can have any number of cards named… »,
     « can be your commander » : règles de construction de deck, sans effet en
     jeu — acceptées pour qu'elles ne fassent pas passer une carte pour partielle.
   ===================================================================== */

const MOTS_SANS_EFFET_EN_JEU = new Set(['Companion', 'DeckLimit', 'A deck can have any number of cards named CARDNAME.', 'CARDNAME can be your commander.']);

motCleLancementB = (g => function (def, face, jetons, tete, reste) {
  if (MOTS_SANS_EFFET_EN_JEU.has(tete)) return true;
  switch (tete) {
    case 'Prevent all combat damage that would be dealt to CARDNAME.': def.params.prevCombatVers = true; return true;
    case 'Prevent all combat damage that would be dealt to and dealt by CARDNAME.': def.params.prevCombatVers = true; def.params.prevCombatPar = true; return true;
    case 'CARDNAME can\'t attack or block.': def.params.interditAttaque = true; def.params.interditBlocage = true; return true;
    /* Training : avec une créature de plus grande force qui attaque, un marqueur +1/+1. */
    case 'Training': return !reste.length && synthese(def, face, jetons, 'Entrainement',
      {Mode: 'Attacks', ValidCard: 'Card.Self', IsPresent: 'Creature.attacking+Other+powerGTX', PresentCompare: 'GE1'},
      'DB$ PutCounter | Defined$ Self | CounterType$ P1P1 | CounterNum$ 1', {X: 'Count$CardPower'});
    case 'Undaunted': def.params.intrepide = true; return true;
    case 'Gravestorm':
      def.capacites.push({genre: 'declenchee', ecoutes: [{evt: 'lanceSoi'}], texte: tete, effet: {ops: [{op: 'tempeteTombe', hostile: false}], cibles: [], modes: null}});
      return true;
  }
  return g(def, face, jetons, tete, reste);
})(motCleLancementB);

/* Gravestorm : une copie du sort pour chaque permanent mis au cimetière ce tour. */
OPS.tempeteTombe = function* (P, op, ctx) {
  const it = P.pile.find(x => x.id === ctx.source);
  if (!it) return;
  const n = (P.entresTour || []).filter(x => x.de === 'champ' && x.vers === 'cimetiere').length;
  for (let k = 0; k < n; k++) yield* copieSort(P, ctx.ctrl, obj(P, it.id), it, true);
};

/* Undaunted : {1} de moins pour chaque adversaire (js/forgeStatiques.js `coutsForge()`). */
coutsForge = (g => function (P, j, o) {
  const [plus, moins] = g(P, j, o);
  return [plus, moins + (o.def.params && o.def.params.intrepide ? adversaires(P, j).length : 0)];
})(coutsForge);

/* —— La prévention de dégâts ———————————————————————————————————————— */

degatsApresPrevention = (g => function (P, src, cible, n, combat) {
  const ps = src && src.def && src.def.params || {}, ms = (src && src.mods) || [];
  if (ps.prevToutPar || ms.some(m => m.prevPar) || (combat && ps.prevCombatPar)) return 0;
  if (cible && cible.j == null && cible.def) {
    const pc = cible.def.params || {};
    if (cible.mods && cible.mods.some(m => m.prevVers)) return 0;
    if (combat && pc.prevCombatVers) return 0;
  }
  return g(P, src, cible, n, combat);
})(degatsApresPrevention);

forgeSait('kw', 'Companion', 'DeckLimit', 'A deck can have any number of cards named CARDNAME.', 'CARDNAME can be your commander.',
  'Prevent all combat damage that would be dealt to CARDNAME.', 'Prevent all combat damage that would be dealt to and dealt by CARDNAME.',
  "CARDNAME can't attack or block.", 'Training', 'Undaunted', 'Gravestorm');
forgeSait('kwval', 'fear', 'intimidate', 'skulk', "hidden cardname's power and toughness are switched", 'prevent all damage that would be dealt by cardname.',
  'prevent all damage that would be dealt to and dealt by cardname.');
