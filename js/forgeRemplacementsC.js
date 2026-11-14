/* =====================================================================
   js/forgeRemplacementsC.js — Les dégâts remplacés

   « Prevent the next 3 damage », « prevent all but 1 of that damage »
   (Temple Altisaur), « all damage that would be dealt to you is dealt to
   enchanted creature instead » (Pariah), « the next 1 damage … is dealt to
   target creature you control instead » (Warrior en-Kor), « prevent that
   damage ; put a +1/+1 counter for each 1 damage prevented » (Vigor). Un
   remplacement `DamageDone` à `ReplaceWith$` : prévenir N (`ReplaceDamage`),
   détourner (`ReplaceEffect` d'`Affected`), en détourner une part
   (`ReplaceSplitDamage`), ou jouer une chaîne à la place.

   `infligeDegats()` n'est pas un générateur : ce qui se décide sur-le-champ
   (combien, à qui) s'y joue ; la chaîne qui suit (les marqueurs, les dégâts
   rendus, l'effet qui s'exile) attend dans `P.suitesRemp` et se joue au
   prochain pas d'`executeOps()` ou de `priorite()` — un instant plus tard
   que la règle, simplification annoncée.
   ===================================================================== */

/* Les chaînes compilées, par face et par nom : la tête, et ce qui suit. */
const CHAINES_DEGATS = new WeakMap();

/* Lire la chaîne d'un remplacement de dégâts. Rend `null` si elle ne se
   joue pas : une tête qu'on ne sait pas lire, une suite qui cible. */
function chaineDegats(face, nom) {
  const m = CHAINES_DEGATS.get(face) || new Map();
  CHAINES_DEGATS.set(face, m);
  if (m.has(nom)) return m.get(nom);
  const w = forgeSousCapacite(face, nom), api = w && forgeApi(w);
  const suite = sub => { if (!sub) return null; const e = effetForge(face, forgeSousCapacite(face, sub), {}); return e && !e.cibles.length && !e.modes ? e : false; };
  let k = null;
  if (!w || w.DivideShield) k = null;
  else if (api === 'ReplaceDamage') k = {genre: 'reduit', w, suite: suite(w.SubAbility)};
  else if (api === 'ReplaceEffect' && w.VarName === 'Affected' && /^(Card|Player)$/.test(w.VarType || '') && w.VarValue) k = {genre: 'detourne', w, suite: suite(w.SubAbility)};
  else if (api === 'ReplaceSplitDamage' && w.DamageTarget) k = {genre: 'partage', w, suite: suite(w.SubAbility)};
  else if (api !== 'ReplaceEffect') { const e = effetForge(face, w, {}); k = e && !e.cibles.length && !e.modes ? {genre: 'chaine', w, suite: e} : null; }
  if (k && k.suite === false) k = null;
  m.set(nom, k);
  return k;
}

/* La forme d'un remplacement de dégâts, lue par js/forgeRemplacements.js
   `formeRemplacement()`. Le doublement (`ReplaceEffect` de
   `DamageAmount`) reste une quantité. */
function formeRemplacementC(face, r) {
  if (r.Event !== 'DamageDone' || !r.ReplaceWith || r.Optional) return null;
  const w = forgeSousCapacite(face, r.ReplaceWith);
  if (!w || (forgeApi(w) === 'ReplaceEffect' && w.VarName === 'DamageAmount')) return null;
  return chaineDegats(face, r.ReplaceWith) ? 'degats' : null;
}

/* Un remplacement qui s'applique à ces dégâts-ci. */
function remplacementDegatsVaut(P, x, src, c, n, combat) {
  const {src: h, r} = x, t = r.t, env = envRemplacement(h, r);
  if (h.zone === 'effet' && !P.effets.includes(h)) return false;
  if ((t.IsCombat === 'True' && !combat) || (t.IsCombat === 'False' && combat)) return false;
  if (t.ValidSource && !forgeValideObjet(P, src, t.ValidSource, h, h.ctrl, env, true)) return false;
  if (t.ValidTarget && !(c.j != null ? forgeValideJoueur(P, c.j, t.ValidTarget, h.ctrl, env) : forgeValideObjet(P, c, t.ValidTarget, h, h.ctrl, env, true))) return false;
  if (t.DamageAmount && !seuilForge(P, n, t.DamageAmount, env)) return false;
  if (t.Hellbent === 'True' && P.joueurs[h.ctrl].main.length) return false;
  if (!conditionForge(P, t, env)) return false;
  const k = chaineDegats(r.face, t.ReplaceWith);
  const previent = t.PreventionEffect === 'True' || k.genre === 'reduit';
  return !(previent && preventionInterdite(P, src, combat) && t.AlwaysReplace !== 'True');
}

/* Les parts de dégâts après les remplacements : `[[cible, n], …]`. Chacun
   s'applique au plus une fois à l'évènement et à ce qu'il devient (règle
   614.5). */
function degatsRemplaces(P, src, cible, n, combat) {
  const rs = remplacementsEnJeu(P).filter(x => x.r.forme === 'degats');
  if (!rs.length) return [[cible, n]];
  const out = [], file = [{c: cible, n, vus: []}];
  while (file.length) {
    const p = file.shift();
    for (let x; p.n > 0 && (x = rs.find(y => !p.vus.includes(y) && remplacementDegatsVaut(P, y, src, p.c, p.n, combat)));) {
      p.vus.push(x);
      appliqueRemplacementDegats(P, x, src, p, combat, file);
    }
    if (p.n > 0) out.push([p.c, p.n]);
  }
  return out;
}

function appliqueRemplacementDegats(P, x, src, p, combat, file) {
  const {src: h, r} = x, t = r.t, k = chaineDegats(r.face, t.ReplaceWith), env = envRemplacement(h, r);
  const avant = p.n, cibleAvant = p.c;
  env.ctx.remplace = {n: p.n};
  const previent = (t.PreventionEffect === 'True' || k.genre === 'reduit') && !preventionInterdite(P, src, combat);
  if (k.genre === 'reduit') {
    const b = bouclierDegats(P, h, k.w.Amount || '1', env), q = previent ? Math.min(b.n, p.n) : 0;
    p.n -= q;
    useBouclier(P, h, b, q);
  } else if (k.genre === 'detourne') {
    const c = cibleDetournee(P, h, k.w.VarValue, env);
    if (!c) return;
    p.c = c;
  } else if (k.genre === 'partage') {
    const c = cibleDetournee(P, h, k.w.DamageTarget, env);
    if (!c) return;
    const b = k.w.VarName ? bouclierDegats(P, h, k.w.VarName, env) : {n: k.w.Amount ? forgeNombre(P, k.w.Amount, env) : 1};
    const q = Math.min(b.n, p.n);
    if (q > 0) { file.push({c, n: q, vus: p.vus.slice()}); p.n -= q; }
    if (b.nom) useBouclier(P, h, b, q); else if (h.zone === 'effet') finEffet(P, h);
  } else if (previent || t.PreventionEffect !== 'True') p.n = 0;
  if (k.suite) suiteRemplacement(P, k.suite.ops, ctxRemplacement(h, src, cibleAvant, avant));
}

/* Ce qu'un bouclier prévient encore. « Prevent the next N damage » posé
   par un effet (`ShieldAmount` de `Number$N`) s'use ; un montant calculé
   (Temple Altisaur) se recalcule à chaque fois. */
function bouclierDegats(P, h, nom, env) {
  if (/^\d+$/.test(nom)) return {n: +nom};
  const sv = h.zone === 'effet' && env.face && env.face.svars[nom];
  if (sv && /^Number\$\d+$/.test(sv)) {
    h.boucliers = h.boucliers || {};
    if (h.boucliers[nom] == null) h.boucliers[nom] = +sv.slice(7);
    return {n: h.boucliers[nom], nom};
  }
  return {n: Math.max(0, forgeNombre(P, nom, env))};
}
function useBouclier(P, h, b, q) {
  if (!b.nom || !q) return;
  h.boucliers[b.nom] -= q;
  if (h.boucliers[b.nom] <= 0) finEffet(P, h);
}

/* À qui vont les dégâts détournés : un joueur en jeu, ou un permanent. La
   source d'un effet est la carte qui l'a créé. */
function cibleDetournee(P, h, v, env) {
  const l = v === 'EffectSource' && h.zone === 'effet' ? [obj(P, h.srcId)] : forgeDefinis(P, v, env);
  return l.find(x => x && (x.j != null ? !P.joueurs[x.j].elimine : x.zone === 'champ' && !x.lki)) || null;
}

function finEffet(P, e) { P.effets = P.effets.filter(x => x !== e); P.ver++; }

/* Le contexte de la chaîne qui suit : `ReplacedTarget`, `ReplacedSource`
   et `ReplaceCount$DamageAmount` y lisent l'évènement remplacé. */
function ctxRemplacement(h, src, cible, n) {
  const ef = h.zone === 'effet';
  return {source: ef ? h.srcId : h.id, lki: ef ? h : null, effet: ef ? h : null, ctrl: h.ctrl, cibles: [], trouves: [], x: 0,
    memo: (h.memo || []).slice(), memoJ: (h.memoJ || []).slice(), remplace: {n},
    evt: {t: 'remplace', remSource: src, remCible: cible, n}};
}

/* —— La chaîne qui suit, un instant plus tard ———————————————————————— */

function suiteRemplacement(P, ops, ctx) { (P.suitesRemp = P.suitesRemp || []).push({ops, ctx}); }
function* joueSuitesRemplacement(P) {
  while (P.suitesRemp && P.suitesRemp.length && !P.fin) { const s = P.suitesRemp.shift(); yield* executeOps(P, s.ops, s.ctx); }
}

/* « Exile this effect » : `ChangeZone` de `Self` depuis le commandement,
   joué par un effet, le fait finir. */
FORGE_API.ChangeZone.gen = (g => function* (P, t, env) {
  const ctx = env.ctx || {}, ef = ctx.effet || (ctx.lki && ctx.lki.zone === 'effet' ? ctx.lki : null);
  if (t.Origin === 'Command' && t.Defined === 'Self' && ef) { finEffet(P, ef); return; }
  yield* g(P, t, env);
})(FORGE_API.ChangeZone.gen);

/* —— Choisir une source ———————————————————————————————————————————— */

/* « The next time a red source of your choice would deal damage to you » :
   une source parmi les permanents et les sorts sur la pile. Les plus
   menaçantes viennent d'abord — l'IA prend la première. */
forgeEffet('ChooseSource', ['Choices', 'RememberChosen'], function* (P, t, env) {
  const j = joueursForge(P, t, env)[0];
  if (j == null) return;
  const valide = o => String(t.Choices || 'Card').split(',').some(c => !/^Emblem/.test(c) && forgeValideObjet(P, o, c, env.src, env.ctrl, env));
  const l = [...P.pile.map(it => obj(P, it.id)).filter(Boolean), ...P.champ.map(id => obj(P, id))].filter(o => o && valide(o));
  const poids = o => (o.ctrl !== j ? 100 : 0) + (o.zone === 'pile' ? 50 : 0) + (P.combat && P.combat.attaquants.has(o.id) ? 25 : 0) + (estCreature(o) ? car(P, o).force : 0);
  l.sort((a, b) => poids(b) - poids(a));
  const pris = yield* choisitCartes(P, j, l.map(o => o.id), 1, 'Choisir une source', 'cartes', 1);
  choixDe(P, env.src).cartes = pris;
  if (t.RememberChosen === 'True') pris.forEach(id => retiensForge(env.ctx, id));
}, (t, op) => { op.op = 'forge'; op.hostile = false; });

/* Un effet garde la carte choisie quand il naît : le `Cleanup` qui suit
   l'efface de la source, pas de l'effet. */
FORGE_API.Effect.gen = (g => function* (P, t, env) {
  const avant = P.effets ? P.effets.length : 0;
  yield* g(P, t, env);
  const c = env.src && choixDe(P, env.src).cartes;
  if (c && P.effets && P.effets.length > avant) P.effets[P.effets.length - 1].choisies = c.slice();
})(FORGE_API.Effect.gen);

/* —— Les dégâts d'un même sort, ensemble ——————————————————————————————— */

/* `DamageMap$` réunit les dégâts d'un sort pour les infliger d'un coup
   (`DamageResolve`) ; le moteur les inflige à mesure — sans différence
   tant qu'aucun déclencheur ne compte « une fois ». */
forgeEffet('DamageResolve', [], function* () {}, (t, op) => { op.op = 'forge'; op.hostile = false; });

forgeSait('param', 'DealDamage.DamageMap', 'DamageAll.DamageMap', 'EachDamage.DamageMap', 'ReplaceDamage.Amount', 'ReplaceEffect.VarType',
  'ReplaceSplitDamage.DamageTarget', 'ReplaceSplitDamage.VarName', 'ReplaceSplitDamage.Amount', 'ChooseSource.Choices', 'ChooseSource.AILogic',
  'DamageDone.PreventionEffect', 'DamageDone.AlwaysReplace', 'DamageDone.DamageTarget', 'DamageDone.ExecuteMode', 'DamageDone.Secondary',
  'DamageDone.DamageAmount', 'DamageDone.Hellbent');
forgeSait('api', 'ReplaceDamage', 'ReplaceSplitDamage', 'ChooseSource');
forgeSait('defini', 'ReplacedTarget', 'ReplacedSource', 'ReplacedSourceController', 'ReplacedPlayer');
forgeSait('filtre', 'ChosenCardStrict');
