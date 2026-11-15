/* =====================================================================
   js/forgeMemoire.js — La mémoire, II

   Ce que les cartes les plus jouées en Commander retiennent encore :
   - un nombre (Mana Drain : la valeur de mana du sort contrecarré, que le
     déclencheur retardé garde ; Creeping Bloodsucker : les blessures
     infligées), lu par `Count$RememberedNumber`, `Count$TriggerRememberAmount` ;
   - l'instantané d'une créature détruite (Saw in Half, Noxious Gearhulk) ;
   - ce qu'on sacrifie en masse, ce qu'on engage, ce qu'on « pompe » dans un
     cimetière (Patriarch's Bidding) ;
   - les joueurs qui n'ont rien de retenu (Plaguecrafter) ;
   - « qui partage un type, un nom avec » (Braids, Arisen Nightmare) ;
   - les déclencheurs `Static$ True`, résolus sans passer par la pile : le
     plus souvent le ménage d'une mémoire quand la carte s'en va.
   ===================================================================== */

/* —— Un nombre retenu ————————————————————————————————————————————————— */

/* La somme des valeurs de mana des sorts contrecarrés. */
FORGE_API.Counter.gen = (g => function* (P, t, env) {
  if (t.RememberCounteredCMC !== 'True') return yield* g(P, t, env);
  const avant = objetsForge(P, t, env, 'Targeted').filter(o => o.zone === 'pile');
  yield* g(P, t, env);
  env.ctx.nombre = (env.ctx.nombre || 0) + avant.filter(o => !P.pile.some(it => it.id === o.id)).reduce((s, o) => s + mvDe(o), 0);
})(FORGE_API.Counter.gen);

/* Les blessures que la source vient d'infliger. */
FORGE_API.DealDamage.gen = (g => function* (P, t, env) {
  if (t.RememberAmount !== 'True') return yield* g(P, t, env);
  const n0 = P.evts.length, src = sourceDegats(P, t, env);
  yield* g(P, t, env);
  env.ctx.nombre = (env.ctx.nombre || 0) + P.evts.slice(n0)
    .filter(e => (e.t === 'degatsJoueur' || e.t === 'degatsObjet') && src && e.source === src.id).reduce((s, e) => s + e.n, 0);
})(FORGE_API.DealDamage.gen);

/* Le déclencheur retardé emporte le nombre (`RememberNumber$`), et peut
   être statique. Son contexte le rend à la résolution (js/jeuDurees.js,
   js/jeuPile.js). */
FORGE_API.DelayedTrigger.gen = (g => function* (P, t, env) {
  const R = durees(P).retardes, n = R.length;
  yield* g(P, t, env);
  if (R.length === n) return;
  const r = R[R.length - 1];
  if (t.RememberNumber === 'True') r.nombre = env.ctx.nombre || 0;
  if (t.Static === 'True') r.statique = true;
})(FORGE_API.DelayedTrigger.gen);
FORGE_API.DelayedTrigger.prepare = (p => function (t, op) {
  return p.call(this, t, op) && (t.Static !== 'True' || (!op.effetRetarde.cibles.length && !op.effetRetarde.modes));
})(FORGE_API.DelayedTrigger.prepare);

/* —— Ce qu'on retient encore ————————————————————————————————————————— */

/* Ce qui a quitté le champ, retenu par son instantané. */
function retiensPartis(P, env, avant) {
  avant.filter(o => !obj(P, o.id) || obj(P, o.id).zone !== 'champ').forEach(o => retiensForge(env.ctx, o.id));
}
FORGE_API.Destroy.gen = (g => function* (P, t, env) {
  if (t.RememberLKI !== 'True') return yield* g(P, t, env);
  const avant = objetsForge(P, t, env, 'Targeted').filter(o => o.zone === 'champ' && !o.lki);
  yield* g(P, t, env);
  retiensPartis(P, env, avant);
})(FORGE_API.Destroy.gen);
FORGE_API.SacrificeAll.gen = (g => function* (P, t, env) {
  if (t.RememberSacrificed !== 'True') return yield* g(P, t, env);
  const avant = objetsZone(P, 'champ').filter(o => forgeValideObjet(P, o, t.ValidCards || 'Permanent', env.src, env.ctrl, env));
  yield* g(P, t, env);
  retiensPartis(P, env, avant);
})(FORGE_API.SacrificeAll.gen);

/* Ce que l'effet vient d'engager. */
FORGE_API.Tap.gen = (g => function* (P, t, env) {
  if (t.RememberTapped !== 'True') return yield* g(P, t, env);
  const avant = objetsForge(P, t, env).filter(o => o.zone === 'champ' && !o.lki && !o.engage);
  yield* g(P, t, env);
  avant.filter(o => obj(P, o.id) && obj(P, o.id).engage).forEach(o => retiensForge(env.ctx, o.id));
})(FORGE_API.Tap.gen);

/* « Pump » de masse pour retenir, dans une zone ou sur le champ. Hors du
   champ, Forge ne s'en sert que pour retenir. */
FORGE_API.PumpAll.gen = (g => function* (P, t, env) {
  const zone = t.PumpZone ? ZONES_FORGE[t.PumpZone] : 'champ';
  const l = t.RememberPumped === 'True' ? objetsZone(P, zone).filter(o => forgeValideObjet(P, o, t.ValidCards || 'Creature', env.src, env.ctrl, env)) : [];
  if (zone === 'champ') yield* g(P, t, env);
  l.forEach(o => retiensForge(env.ctx, o.id));
})(FORGE_API.PumpAll.gen);
FORGE_API.PumpAll.prepare = (p => function (t, op) {
  if (t.PumpZone && t.PumpZone !== 'Battlefield') return !!ZONES_FORGE[t.PumpZone] && !t.NumAtt && !t.NumDef && !t.KW && t.RememberPumped === 'True';
  return p ? p.call(this, t, op) : true;
})(FORGE_API.PumpAll.prepare);

/* —— Ce qui lit la mémoire ———————————————————————————————————————————— */

definisEtendus = (g => function (P, v, env) {
  const ctx = env.ctx || {};
  if (v === 'DirectRemembered') return forgeDefinis(P, 'Remembered', env);
  /* Les joueurs qui ne contrôlent (ne possèdent) rien de retenu. */
  const m = /^(Opp)?NonRemembered(Controller|Owner)$/.exec(v);
  if (m) {
    const l = (ctx.memo || []).map(id => passeOuPresent(P, id)).filter(Boolean).map(o => m[2] === 'Owner' ? o.prop : o.ctrl);
    return vivants(P).filter(J => !l.includes(J.i) && (!m[1] || J.i !== env.ctrl)).map(J => ({j: J.i}));
  }
  return g(P, v, env);
})(definisEtendus);

exprEtendue = (g => function (P, tete, q, env) {
  const ctx = env.ctx || {};
  if (tete === 'Count' && (q === 'RememberedNumber' || q === 'TriggerRememberAmount')) return ctx.nombre || 0;
  if (tete !== 'TriggerRemembered') return g(P, tete, q, env);
  /* La mémoire du déclencheur retardé est celle de son contexte. */
  const l = (ctx.memo || []).map(id => passeOuPresent(P, id)).filter(Boolean);
  if (q === 'Amount') return l.length;
  const k = /^Valid ([^$]+)(?:\$(\w+))?$/.exec(q);
  if (k) return agregeForge(P, l.filter(o => forgeValideObjet(P, o, k[1], env.src, env.ctrl, env)), k[2]);
  return caracForge(P, l[0], q);
})(exprEtendue);

/* « Shares a card type / a creature type / a name with » : avec l'un des
   objets désignés. */
const PARTAGES = {
  CardType: (P, c, x) => typesDe(P, x).some(t => ['artifact', 'creature', 'enchantment', 'land', 'planeswalker', 'battle', 'instant', 'sorcery', 'kindred'].includes(t) && c.types.includes(t)),
  CreatureType: (P, c, x) => {
    const cx = caracsDe(P, x), a = sousTypesCreature(c), b = sousTypesCreature(cx);
    if (c.changelin) return b.length > 0 || !!cx.changelin;
    return cx.changelin ? a.length > 0 : a.some(t => b.includes(t));
  },
  Name: (P, c, x) => !!x.def && x.def.nom === c.nom
};
const DESIGNES_PARTAGE = ['Targeted', 'Imprinted', 'Remembered', 'RememberedCard', 'RememberedLKI', 'TriggeredCard', 'ChosenCard', 'Sacrificed', 'Enchanted', 'Equipped', 'Self',
  'TriggeredAttacker', 'TriggeredBlocker'];
function caracsDe(P, x) { return x.lki ? x : x.zone === 'champ' ? car(P, x) : x.def; }
function typesDe(P, x) { return caracsDe(P, x).types || []; }
function sousTypesCreature(c) { return (c.sousTypes || []).filter(t => !SOUSTYPES_NON_CREATURE.has(t)); }
proprieteDesignee = (g => function (P, o, p, c, src, ctrl, env) {
  const m = /^shares(CardType|CreatureType|Name)With (\w+)$/.exec(p);
  if (!m || !DESIGNES_PARTAGE.includes(m[2])) return g(P, o, p, c, src, ctrl, env);
  if (!P || !env) return false;
  const e = {...env, src: src || env.src}, ctx = e.ctx || {};
  const l = m[2] === 'Sacrificed' ? ctx.sacrifies || [] : forgeDefinis(P, m[2], e);
  const cc = {...c, nom: o.def.nom};
  return l.some(x => x && x.j == null && x.id !== o.id && PARTAGES[m[1]](P, cc, x));
})(proprieteDesignee);
/* Ce qu'une source a exilé, compté sur son instantané quand elle s'en va. */
proprieteDesignee = (g => function (P, o, p, c, src, ctrl, env) {
  return p === 'ExiledWithSourceLKI' ? propObjet(P, o, c, 'ExiledWithSource', src, ctrl, env) : g(P, o, p, c, src, ctrl, env);
})(proprieteDesignee);

/* —— L'aura qui réanime ———————————————————————————————————————————————— */

/* Animate Dead enchante une carte de cimetière, le temps que son
   déclencheur la rende ; ensuite, la créature qu'il a retenue en la
   rendant (« enchant creature put onto the battlefield with »). */
auraOrpheline = (g => function (P, o) {
  const d = o.def.aura;
  if (!d || d.zone !== 'cimetiere' || o.att == null) return g(P, o);
  const h = obj(P, o.att), k = P.cartes[o.cid];
  if (h && h.zone === 'cimetiere' && correspond(P, h, d, o, o.ctrl)) return false;
  return !(h && h.zone === 'champ' && estCreature(h) && k && (k.memo || []).some(x => x === h.id || suit(P, x) === h.id));
})(auraOrpheline);

/* —— Les déclencheurs statiques ———————————————————————————————————————— */

/* `Static$ True` : sans cible ni mode, ni « you may », la chaîne se joue
   dès que l'évènement est relevé, sans monter sur la pile. Les
   déclencheurs de mana gardent leur forme (js/forgeCout.js). */
declencheurForge = (g => function (def, face, t, jetons) {
  if (t.Static !== 'True' || t.Mode === 'TapsForMana' || t.Mode === 'ManaAdded') return g(def, face, t, jetons);
  if (t.OptionalDecider) return false;
  const u = {...t}, n = def.capacites.length;
  delete u.Static;
  if (!g(def, face, u, jetons)) return false;
  const k = def.capacites[def.capacites.length - 1];
  if (def.capacites.length === n || k.genre !== 'declenchee' || k.effet.cibles.length || k.effet.modes) { def.capacites.length = n; return false; }
  k.statique = true;
  return true;
})(declencheurForge);

/* Après la collecte : les statiques quittent l'attente pour la suite
   immédiate (js/forgeRemplacementsC.js `suiteRemplacement()`). */
collecteDeclencheurs = (g => function (P) {
  const n = P.enAttente.length;
  g(P);
  const statiques = P.enAttente.slice(n).filter(it => it.cap.statique);
  if (!statiques.length) return;
  P.enAttente = P.enAttente.filter(it => !statiques.includes(it));
  for (const it of statiques) {
    suiteRemplacement(P, it.cap.effet.ops, {source: it.src, lki: it.lki, ctrl: it.ctrl, x: 0, evt: it.evt, cibles: [], trouves: [],
      memo: it.memo, memoJ: it.memoJ, nombre: it.nombre});
  }
})(collecteDeclencheurs);

forgeSait('param', 'Counter.RememberCounteredCMC', 'DealDamage.RememberAmount', 'DelayedTrigger.RememberNumber', 'DelayedTrigger.Static',
  'Destroy.RememberLKI', 'SacrificeAll.RememberSacrificed', 'Tap.RememberTapped', 'PumpAll.RememberPumped',
  ...['ChangesZone', 'ChangesZoneAll', 'SpellCast', 'Phase', 'TurnBegin', 'DamageDone', 'LandPlayed', 'Drawn', 'Attached', 'Countered',
    'Destroyed', 'Blocks', 'Attacks', 'BecomesTarget', 'AbilityCast', 'NewGame', 'Always'].map(m => m + '.Static'));
forgeSait('expr', 'Count$RememberedNumber', 'Count$TriggerRememberAmount', 'TriggerRemembered$Amount', 'TriggerRemembered$CardManaCost',
  'TriggerRemembered$CardPower', 'TriggerRemembered$CardToughness', 'TriggerRemembered$Valid');
forgeSait('defini', 'DirectRemembered', 'NonRememberedController', 'NonRememberedOwner', 'OppNonRememberedController', 'OppNonRememberedOwner');
forgeSait('filtre', 'ExiledWithSourceLKI', ...['CardType', 'CreatureType', 'Name'].flatMap(k => DESIGNES_PARTAGE.map(d => `shares${k}With ${d}`)));
