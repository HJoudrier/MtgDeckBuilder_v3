/* =====================================================================
   js/forgeActivations.js — Lancer et activer autrement

   Ce que demandaient quelques cartes (lot F51) :
   - la mise sous tension (`PowerUp$`, Human Torch, Johnny Storm) : une
     capacité qu'on n'active qu'une fois, moins chère du coût de mana de
     la carte le tour où elle est entrée ;
   - lancer une copie pour un autre coût (`PlayCost$`, Blue Mage's Cane) ;
   - le mana venu de créatures (`Spell.ManaFromCreature_3`, Inga and
     Esika), que js/jeuMana.js `paieMana()` retient sur le sort ;
   - le nombre de tours qu'on a joués (`Count$YourTurns`, Spider-Man 2099) ;
   - une capacité moins chère (`ReduceCost$`, les terrains Channel comme
     Boseiju : « costs {1} less for each legendary creature you control »).
   ===================================================================== */

/* —— La mise sous tension ——————————————————————————————————————————————— */

const sousTension = k => !!(k && k.effet && k.effet.ops[0] && k.effet.ops[0].t && k.effet.ops[0].t.PowerUp === 'True');

/* Un coût de mana moins un autre : chaque couleur ôtée de la même
   couleur, le reste et le générique ôtés du générique. Les hybrides
   restent (Forge ne les retire pas non plus). */
function moinsMana(c, m) {
  const couleurs = {...c.couleurs};
  let libre = m.generique || 0;
  Object.entries(m.couleurs || {}).forEach(([k, n]) => { const p = Math.min(couleurs[k] || 0, n); couleurs[k] = (couleurs[k] || 0) - p; libre += n - p; });
  const g = Math.max(0, c.generique - libre);
  const txt = [g ? String(g) : '', ...Object.entries(couleurs).flatMap(([k, n]) => Array(Math.max(0, n)).fill(k)), ...c.hybrides.map(h => h.join('/'))].filter(Boolean).join(' ');
  const r = manaSeul(txt || '0');
  return r ? {...coutComplet(r).mana, x: c.x} : c;
}

/* « Reduce the cost by his mana cost if he entered this turn » : la
   capacité vue ce tour-là est une copie au coût réduit, gardée sur
   l'originale (`k.orig`) pour que la marque d'usage suive. */
capacitesDe = (g => function (P, o) {
  const l = g(P, o);
  if (!o || o.zone !== 'champ' || o.entreTour !== P.tour || !l.some(sousTension)) return l;
  return l.map(k => {
    if (!sousTension(k) || k.orig) return k;
    if (!k._reduite || k._reduite.def !== o.def) k._reduite = {def: o.def, k: {...k, orig: k, cout: {...k.cout, mana: moinsMana(k.cout.mana, o.def.cout)}}};
    return k._reduite.k;
  });
})(capacitesDe);

activationInterdite = (g => function (P, j, o, k) { return (sousTension(k) && (o.sousTension || []).includes(k.orig || k)) || g(P, j, o, k); })(activationInterdite);
activeCapacite = (g => function* (P, j, a) {
  const o = obj(P, a.id), k = o && o.zone === 'champ' ? capacitesDe(P, o)[a.i] : null;
  const r = yield* g(P, j, a);
  if (r && k && sousTension(k)) (o.sousTension = o.sousTension || []).push(k.orig || k);
  return r;
})(activeCapacite);

/* —— Lancer une copie pour un autre coût ——————————————————————————————— */

/* « You may cast the copy by paying {3} rather than paying its mana
   cost » : js/forgeEffetsI.js le passe à `lanceDepuisEffet()`, que la
   variante « permis » lit (js/jeuVariantes.js). */
function coutDeJeu(t) { const c = t.PlayCost ? manaSeul(t.PlayCost) : null; return c ? coutComplet(c).mana : undefined; }
FORGE_API.Play.prepare = (p => (t, op) => t.CopyCard === 'True' && t.PlayCost ? !!coutDeJeu(t) && !t.ReplaceGraveyard && !t.WithoutManaCost : p(t, op))(FORGE_API.Play.prepare);

/* Exiler une carte ciblée d'un cimetière vise d'ordinaire l'adversaire
   (Blue Mage's Cane, les cartes qui privent un cimetière) : l'IA le juge
   hostile, et vise donc chez lui. */
FORGE_API.ChangeZone.ia = (g => function (t, op) {
  g(t, op);
  if (t.Origin === 'Graveyard' && t.Destination === 'Exile' && op.slot != null) op.hostile = true;
})(FORGE_API.ChangeZone.ia);

/* —— Le mana venu de créatures —————————————————————————————————————————— */

const MANA_DE = {Creature: 'creature', Artifact: 'artifact', Treasure: 'treasure'};
saLisible = (g => function (v) { return /^Spell\.ManaFrom(Creature|Artifact|Treasure)(_\d+)?$/.test(v) || g(v); })(saLisible);
saValide = (g => function (P, v, e, s) {
  const m = /^Spell\.ManaFrom(Creature|Artifact|Treasure)(?:_(\d+))?$/.exec(v || '');
  if (!m) return g(P, v, e, s);
  const o = obj(P, e.id);
  return !!o && ((o.manaDe || {})[MANA_DE[m[1]]] || 0) >= (m[2] ? +m[2] : 1);
})(saValide);

/* —— Les tours qu'on a joués ——————————————————————————————————————————— */

exprEtendue = (g => function (P, tete, q, env) {
  return tete === 'Count' && q === 'YourTurns' ? (P.joueurs[env.ctrl] || {}).tours || 0 : g(P, tete, q, env);
})(exprEtendue);

/* —— Une capacité moins chère ————————————————————————————————————————— */

/* Le coût de mana d'une capacité vue par le joueur qui l'active : le
   générique en moins, jamais en dessous de zéro, et jamais une couleur. La
   quantité se lit à chaque fois — elle dépend de ce qu'on contrôle. Une
   quantité que le moteur ne sait pas lire ne réduit rien : le coût reste
   plein, ce qui ne rend jamais la capacité plus forte qu'elle n'est. */
function capaciteReduite(P, j, o, k) {
  if (!k.reduit) return k;
  let n = 0;
  try { n = forgeNombre(P, k.reduit, {face: k.face, ctx: {cibles: [], memo: [], memoJ: [], x: 0}, src: o, ctrl: j, op: {}}); } catch (e) { n = 0; }
  n = Math.min(Math.max(0, +n || 0), k.cout.mana.generique || 0);
  return n ? {...k, cout: {...k.cout, mana: moinsMana(k.cout.mana, {generique: n, couleurs: {}})}} : k;
}

/* —— N'activer que si… ———————————————————————————————————————————————— */

/* « Activate only if there are four or more card types among cards in your
   graveyard » (`Activation$ Delirium`, Threshold, Metalcraft, Hellbent) : la
   même table de conditions que `Condition$`. */
FORGE_CONDITIONS.Blessing = (P, env) => benediction(P, env.ctrl, env.src);
activationInterdite = (g => function (P, j, o, k) {
  if (k.activation && !FORGE_CONDITIONS[k.activation](P, {ctrl: j, src: o, ctx: {}})) return true;
  return g(P, j, o, k);
})(activationInterdite);

FORGE_COMMUNS.add('Activation');
FORGE_COMMUNS.add('ReduceCost');
FORGE_COMMUNS.add('PowerUp');
forgeSait('param', 'PowerUp', 'ReduceCost', 'Activation', 'Play.PlayCost');
forgeSait('expr', 'Count$YourTurns');
