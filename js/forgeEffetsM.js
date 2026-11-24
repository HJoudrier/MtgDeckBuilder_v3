/* =====================================================================
   js/forgeEffetsM.js — Des effets et des déclencheurs de plus

   Lot F83 :
   - `Blight | Num$ N` (High Perfect Morcant, Shadow Urchin) : les joueurs
     désignés mettent N marqueurs -1/-1 sur une créature qu'ils contrôlent,
     à leur choix — l'effet dont le coût `Blight<N>` (js/jeuCoutsB.js) est la
     moitié ;
   - `K:Exploit` et `Exploited` (Sidisi, Colonel Autumn) : à l'entrée, on peut
     sacrifier une créature ; l'évènement dit qui, et qui l'a fait ;
   - `Explores` (Nicanzil, Merfolk Cave-Diver) : une créature vient d'explorer,
     et la carte révélée était, ou non, un terrain ;
   - `RolledDieOnce` (Wyll, Vexing Puzzlebox) : un lancer de dés, une fois,
     quel que soit le nombre de dés ; `TriggerCount$Result` en est le total.
   ===================================================================== */

forgeEffet('Blight', ['Num'], function* (P, t, env) {
  const n = forgeNombre(P, t.Num || 1, env);
  for (const j of joueursForge(P, t, env)) {
    const l = champDe(P, j).filter(estCreature).map(x => x.id);
    if (!l.length) continue;
    const pris = yield* choisitCartes(P, j, l, 1, 'Blight', 'cartes', 1);
    pris.forEach(id => { if (obj(P, id)) poseMarqueurs(P, obj(P, id), '-1/-1', n, env.src); });
  }
}, (t, op) => { op.op = 'forge'; op.hostile = true; });

/* Exploit : « when this creature enters, you may sacrifice a creature ». Le sacrifice se dit aux écoutes
   par `exploite` ; l'exploitant est gardé par son instantané, il a pu se sacrifier lui-même. */
forgeEffet('Exploit', [], function* (P, t, env) {
  const s = env.src, j = env.ctrl;
  if (!s) return;
  const ids = champDe(P, j).filter(estCreature).map(x => x.id);
  if (!ids.length) return;
  const r = yield question(P, j, 'oui', ['non', 'oui'], {texte: 'Exploit : sacrifier une créature ?', source: s.id});
  if (r !== 1) return;
  const [id] = yield* choisitCartes(P, j, ids, 1, 'Sacrifier', 'sacrifice', 1);
  const o = id != null ? obj(P, id) : null;
  if (!o) return;
  const lki = instantane(P, o), lkiSource = s.zone === 'champ' ? instantane(P, s) : s.lki || s;
  sacrifie(P, id);
  emet(P, {t: 'exploite', joueur: j, lki, source: s.id, lkiSource});
}, (t, op) => { op.op = 'forge'; op.hostile = false; });

motCleLancementB = (g => function (def, face, jetons, tete, reste) {
  if (tete === 'Exploit' && !reste.length) return synthese(def, face, jetons, 'Exploite', ENTRE, 'DB$ Exploit');
  return g(def, face, jetons, tete, reste);
})(motCleLancementB);
forgeSait('kw', 'Exploit');

forgeMode('Exploited', ['ValidCard', 'ValidSource'], (P, t, e, s, env) => e.t === 'exploite' && valideOuRien(P, e.lki, t.ValidCard, s, env) &&
  valideOuRien(P, obj(P, e.source) || e.lkiSource, t.ValidSource, s, env));

forgeMode('Explores', ['ValidCard', 'ValidExplored'], (P, t, e, s, env) => e.t === 'explore' && valideOuRien(P, obj(P, e.id), t.ValidCard, s, env) &&
  (!t.ValidExplored || (/nonLand/.test(t.ValidExplored) ? !e.terrain : /Land/.test(t.ValidExplored) ? e.terrain : true)));

forgeMode('RolledDieOnce', ['ValidPlayer'], (P, t, e, s, env) => e.t === 'de' && joueurOuRien(P, e.joueur, t.ValidPlayer, s, env));
