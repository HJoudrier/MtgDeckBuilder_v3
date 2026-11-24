/* =====================================================================
   js/forgeEffetsO.js — Poser des marqueurs de plusieurs sortes, ou les répartir

   Lot F87 :
   - `PutCounter | CounterTypes$ Flying,Deathtouch,Lifelink` (Qarsi Revenant,
     Gift of the Viper, Arwen) : un marqueur de chaque sorte. Les marqueurs de
     mot-clé donnent le mot-clé (js/jeuCaracteristiques.js `car()`) ;
   - `DividedAsYouChoose$ N` (Vastwood Hydra, Lathiel, Invoke Justice) : N
     marqueurs répartis entre des créatures. Avec `Choices$`, le joueur choisit
     jusqu'à `ChoiceAmount$` créatures ; avec des cibles, ce sont elles. La
     répartition est faite à parts égales, la première créature gardant le
     reste — le moteur ne demande pas la part de chacune.
   ===================================================================== */

FORGE_API.PutCounter.gen = (g => function* (P, t, env) {
  if (t.CounterTypes) {
    for (const ty of String(t.CounterTypes).split(',').map(x => x.trim())) yield* g(P, {...t, CounterTypes: undefined, CounterType: ty}, env);
    return;
  }
  if (t.DividedAsYouChoose) return yield* repartitCompteurs(P, t, env);
  return yield* g(P, t, env);
})(FORGE_API.PutCounter.gen);
forgeSait('param', 'PutCounter.CounterTypes', 'PutCounter.DividedAsYouChoose', 'PutCounter.DividedUpTo', 'PutCounter.Choices',
  'PutCounter.ChoiceTitle', 'PutCounter.ChoiceAmount', 'PutCounter.MinChoiceAmount');

function* repartitCompteurs(P, t, env) {
  const total = forgeNombre(P, t.DividedAsYouChoose, env);
  if (total <= 0) return;
  let cibles;
  if (t.Choices) {
    const ids = objetsZone(P, 'champ').filter(o => forgeValideObjet(P, o, t.Choices, env.src, env.ctrl, env)).map(o => o.id);
    if (!ids.length) return;
    const max = Math.min(ids.length, t.ChoiceAmount != null ? forgeNombre(P, t.ChoiceAmount, env) : total);
    const min = Math.min(max, t.MinChoiceAmount != null ? forgeNombre(P, t.MinChoiceAmount, env) : 0);
    cibles = (yield* choisitCartes(P, env.ctrl, ids, max, t.ChoiceTitle || 'Répartir les marqueurs', 'cartes', min)).map(id => obj(P, id)).filter(Boolean);
  } else cibles = objetsForge(P, t, env).filter(o => o.zone === 'champ' && !o.lki);
  if (!cibles.length) return;
  const genre = genreMarqueur(t.CounterType), part = Math.floor(total / cibles.length), reste = total % cibles.length;
  cibles.forEach((o, i) => poseMarqueurs(P, o, genre, part + (i < reste ? 1 : 0), env.src));
}
