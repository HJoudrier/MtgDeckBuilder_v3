/* =====================================================================
   js/forgeArtefactsE.js — Les artefacts d'EDHREC : le mana et les sorts lancés

   Lot F108 :
   - le mana d'une source qui change le sort qu'il paie : Jade Orb of
     Dragonkind (le dragon entre avec un marqueur et le mauvais œil
     jusqu'à votre prochain tour), Coin of Mastery (un marqueur par mana
     d'artefact dépensé), Myr Superion (« spend only mana produced by
     creatures »), Thousand Moons Smithy et Brass's Tunnel-Grinder
     (`Spell.ManaFromCard.StrictlySelf`) ;
   - noter le mana d'un coût d'activation (Jeweled Amulet) et le doubler
     (Doubling Cube) : des capacités ordinaires, qui passent par la pile ;
   - Brass Infiniscope (`HasXManaCost`), Thrumming Stone (`Ripple 4`),
     Tablet of the Guilds (deux couleurs choisies), Brass's Tunnel-Grinder
     (« descended »), Birgi (`Activations`).
   ===================================================================== */

/* —— Le sort payé de ce mana ——————————————————————————————————————— */

saLisible = (g => function (v) { return v === 'Spell.ManaFromCard.StrictlySelf' || g(v); })(saLisible);
saValide = (g => function (P, v, e, s, env) {
  if (v !== 'Spell.ManaFromCard.StrictlySelf') return g(P, v, e, s, env);
  const o = obj(P, e.id);
  return !!o && !!s && (o.manaDeSources || []).includes(s.id);
})(saValide);
forgeSait('param', 'SpellCast.HasXManaCost', 'SpellCast.OneOff');
FORGE_MODES.SpellCast = (j => (P, t, e, s, env) => j(P, t, e, s, env) && (t.HasXManaCost !== 'True' || !!(e.def && e.def.cout && e.def.cout.x)))(FORGE_MODES.SpellCast);
/* Le X du sort lancé, quand c'est lui qu'une capacité déclenchée (Brass Infiniscope) lit. */
exprEtendue = (g => function (P, tete, q, env) {
  if (tete === 'Count' && q === 'xPaid' && !env.ctx.x && env.ctx.evt && env.ctx.evt.t === 'lance') { const it = P.pile.find(x => x.id === env.ctx.evt.id); if (it) return it.x || 0; }
  /* Coin of Mastery : le mana d'une sorte de source dépensé pour lancer la carte qui entre. */
  let m;
  if (tete === 'ReplacedCard' && (m = /^CastTotalManaSpent( (\w+))?$/.exec(q))) {
    const o = objetEvt(P, env.ctx), de = (o && o.lance && o.lance.manaDe) || {};
    return m[2] ? de[m[2].toLowerCase()] || 0 : Object.values(o && o.lance && o.lance.mana || {}).reduce((a, b) => a + b, 0);
  }
  /* Tablet of the Guilds : combien de couleurs choisies le sort lancé porte. */
  if (tete === 'Count' && q === 'HasNumChosenColors.TriggeredCard') {
    const c = (env.src && choixDe(P, env.src).couleurs) || [], d = (env.ctx.evt && env.ctx.evt.def && env.ctx.evt.def.couleurs) || [];
    return c.filter(x => d.includes(x)).length;
  }
  return g(P, tete, q, env);
})(exprEtendue);
forgeSait('expr', 'ReplacedCard$CastTotalManaSpent', 'Count$HasNumChosenColors');

/* —— Jade Orb of Dragonkind ——————————————————————————————————————— */

/* `Effect | RememberObjects$ TriggeredCard | ReplacementEffects` : le sort qu'on vient de lancer entrera avec un marqueur et un mot-clé, jusqu'à notre prochain tour. */
FORGE_API.Effect.prepare = (p => function (t, op) {
  const face = op.face, r = t.ReplacementEffects && face && face.svars[String(t.ReplacementEffects).trim()];
  if (r && t.RememberObjects === 'TriggeredCard' && /Event\$ *Moved/.test(r) && /Destination\$ *Battlefield/.test(r)) {
    const tab = forgeTable(r), w = tab.ReplaceWith && forgeSousCapacite(face, tab.ReplaceWith), suite = w && w.SubAbility && forgeSousCapacite(face, w.SubAbility);
    if (w && forgeApi(w) === 'PutCounter' && w.Defined === 'ReplacedCard' && w.ETB === 'True' && genreMarqueur(w.CounterType) && suite && forgeApi(suite) === 'Pump' &&
      suite.Defined === 'ReplacedCard' && MOTS_ANGLAIS[String(suite.KW || '').toLowerCase()] != null) {
      op.renfortEntree = {genre: genreMarqueur(w.CounterType), n: +(w.CounterNum || 1), mots: MOTS_ANGLAIS[String(suite.KW).toLowerCase()], prochain: suite.Duration === 'UntilYourNextTurn'};
      return true;
    }
  }
  return p.call(this, t, op);
})(FORGE_API.Effect.prepare);
FORGE_API.Effect.gen = (g => function* (P, t, env) {
  const r = env.op.renfortEntree;
  if (!r) return yield* g(P, t, env);
  const sort = env.ctx.evt && env.ctx.evt.t === 'lance' ? obj(P, env.ctx.evt.id) : null;
  if (!sort) return;
  (sort.marqPortes = sort.marqPortes || []).push({genre: r.genre, n: r.n});
  sort.motsPortes = (sort.motsPortes || 0) | r.mots;
  if (r.prochain) sort.motsJusquauProchain = env.ctrl;
})(FORGE_API.Effect.gen);
forgeSait('param', 'Effect.RememberObjects', 'Effect.ForgetOnMoved');

/* —— Du mana noté, du mana doublé ———————————————————————————————— */

forgeSait('param', 'PutCounter.RememberCostMana', 'ManaSpecial.Produced');
forgeEffet('ManaSpecial', ['Produced'], function* (P, t, env) {
  const J = P.joueurs[env.ctrl];
  if (t.Produced === 'Special DoubleManaInPool') { LETTRES_MANA.forEach(k => { J.pool[k] += J.pool[k]; }); P.ver++; }
  else if (t.Produced === 'Special LastNotedType') { const k = choixDe(P, env.src).typeMana; if (k) ajouteMana(P, env.ctrl, k); }
}, (t, op) => { op.op = 'forge'; op.hostile = false; });
/* Une capacité de mana « spéciale » n'est pas une capacité de mana pour le moteur : elle passe par la pile. */
capaciteForge = (g => function (def, face, t, jetons) {
  if (forgeApi(t) !== 'Mana' || !/^Special /.test(t.Produced || '')) return g(def, face, t, jetons);
  const u = {...t}; delete u.AB; u.AB = 'ManaSpecial';
  return g(def, face, u, jetons);
})(capaciteForge);
/* « Note the type of mana spent to pay this activation cost » : la couleur dépensée, gardée sur la carte. */
FORGE_API.PutCounter.gen = (g => function* (P, t, env) {
  yield* g(P, t, env);
  if (t.RememberCostMana === 'True' && env.src) {
    const d = env.ctx.manaDepense || {}, k = Object.keys(d).find(c => d[c] > 0);
    if (k) choixDe(P, env.src).typeMana = k;
  }
})(FORGE_API.PutCounter.gen);

/* —— Myr Superion ———————————————————————————————————————————————— */

forgeStatique('ManaRestriction', ['ValidSource', 'EffectZone'], () => {});
/* « Spend only mana produced by creatures to cast this spell » : seules les sources qui répondent au filtre paient ce sort (le mana déjà flottant n'est pas jugé). */
sourcesMana = (g => function (P, j, pour) {
  const l = g(P, j, pour), d = pour && pour.sort && pour.sort.def;
  if (!d) return l;
  const rs = (d.statiques || []).filter(x => x.s === 'forge' && x.t && x.t.Mode === 'ManaRestriction');
  return rs.length ? l.filter(s => rs.every(x => { const o = obj(P, s.id); return !!o && forgeValideObjet(P, o, String(x.t.ValidSource).replace(/\.inZoneBattlefield/, ''), pour.sort, j, null, true); })) : l;
})(sourcesMana);

/* —— Birgi, God of Storytelling ——————————————————————————————————— */

/* Le mot « boast » n'a pas de carte jouable dans le moteur : la statique n'a rien à changer. */
forgeStatique('Activations', ['ValidCard', 'ValidSA', 'ValidPlayer', 'MinLimit', 'PlayerTurn'], () => {});

/* —— Descended ————————————————————————————————————————————————— */

/* « You descended » : une carte de permanent est allée au cimetière, de n'importe où, ce tour. */
noteHistorique = (g => function (P, e) {
  g(P, e);
  if (e.t === 'zone' && e.vers === 'cimetiere') {
    const o = e.id != null ? obj(P, e.id) : null, d = o && o.def;
    if (d && (d.types || []).some(x => TYPES_PERMANENTS.includes(x))) (histoire(P).descendu = histoire(P).descendu || {})[o.prop] = true;
  }
})(noteHistorique);
proprieteJoueurEtendue = (g => function (P, j, p, ctrl, env) {
  if (p === 'descended') return !!(histoire(P).descendu || {})[j];
  return g(P, j, p, ctrl, env);
})(proprieteJoueurEtendue);
forgeSait('filtre', 'descended');

/* —— Tablet of the Guilds ————————————————————————————————————————— */

forgeSait('filtre', 'AnyChosenColor');
proprieteDesignee = (g => function (P, o, p, c, src, ctrl, env) {
  if (p === 'AnyChosenColor') { const k = (P && src && choixDe(P, src).couleurs) || []; return k.some(x => (c.couleurs || []).includes(x)); }
  return g(P, o, p, c, src, ctrl, env);
})(proprieteDesignee);
/* « Choose two colors » (sans « from among cards in your hand ») : deux couleurs, parmi les cinq. */
FORGE_API.ChooseColor.gen = (g => function* (P, t, env) {
  if (t.TwoColors !== 'True' || t.ColorsFrom) return yield* g(P, t, env);
  const j = joueursForge(P, t, env)[0];
  if (j == null) return;
  const choisies = [], ordre = couleursFrequentes(P, [j]);
  for (let k = 0; k < 2; k++) {
    const dispo = ['W', 'U', 'B', 'R', 'G'].filter(c => !choisies.includes(c)), pref = Math.max(0, dispo.indexOf(ordre.find(c => dispo.includes(c))));
    choisies.push(dispo[yield* choisitUn(P, j, dispo.map(c => NOMS_COULEURS[c]), 'Choisir une couleur', pref, env.ctx.source)]);
  }
  const c = choixDe(P, env.src); c.couleurs = choisies; c.couleur = choisies[0];
})(FORGE_API.ChooseColor.gen);

/* —— Thrumming Stone : Ripple —————————————————————————————————————— */

/* « Spells you cast have ripple 4 » : à chaque sort lancé, on peut révéler le dessus et lancer gratuitement les cartes de même nom ; le reste file sous la bibliothèque. */
const rippleTenable = t => t.Mode === 'Continuous' && /^Ripple:\d+$/.test(t.AddKeyword || '') && t.AffectedZone === 'Stack';
forgeSait('param', 'Continuous.AffectedZone', 'Continuous.AddKeyword');
const statiqueSansRipple = statiqueForge;
statiqueForge = (g => function (face, t, jetons) {
  if (rippleTenable(t)) return {s: 'forge', t, face, ripple: +/(\d+)/.exec(t.AddKeyword)[1]};
  return g(face, t, jetons);
})(statiqueForge);
const CAP_RIPPLE = n => ({genre: 'declenchee', ecoutes: [], texte: 'Ripple ' + n, effet: {ops: [{op: 'ripple', n, hostile: false}], cibles: [], modes: null}});
noteHistorique = (g => function (P, e) {
  g(P, e);
  if (e.t !== 'lance') return;
  for (const id of P.champ) {
    const p = obj(P, id);
    if (!p || p.ctrl !== e.joueur) continue;
    for (const s of p.def.statiques || []) if (s.ripple) P.enAttente.push({src: p.id, ctrl: p.ctrl, cap: CAP_RIPPLE(s.ripple), evt: e});
  }
})(noteHistorique);
OPS.ripple = function* (P, op, ctx) {
  const it = ctx.evt && P.pile.find(x => x.id === ctx.evt.id), j = ctx.ctrl, B = P.joueurs[j].bibliotheque;
  if (!it || !B.length) return;
  const dessus = B.slice(-op.n).reverse();
  if ((yield question(P, j, 'oui', ['non', 'oui'], {texte: `Ondulation ${op.n} : révéler le dessus de la bibliothèque ?`, source: ctx.source, defaut: 1})) !== 1) return;
  jn(P, `${P.joueurs[j].nom} révèle ${dessus.map(id => obj(P, id).def.nom).join(', ')}`);
  const memes = dessus.filter(id => obj(P, id).def.nom === it.def.nom);
  for (const id of memes) {
    const o = obj(P, id);
    if (!o || o.zone !== 'bibliotheque') continue;
    if ((yield question(P, j, 'oui', ['non', 'oui'], {texte: `Lancer ${o.def.nom} sans payer son coût ?`, source: ctx.source, defaut: 1})) === 1) yield* lanceDepuisEffet(P, j, o, true);
  }
  dessus.filter(id => obj(P, id) && obj(P, id).zone === 'bibliotheque').forEach(id => { retireDe(B, id); B.unshift(id); });
  P.ver++;
};

/* —— Birgi : du mana qui dure ———————————————————————————————————————— */

/* « Until end of turn, you don't lose this mana as steps and phases end » : le mana que l'effet ajoute est retenu pour le tour, et rendu à chaque vidage de la réserve. */
FORGE_API.Mana.gen = (g => function* (P, t, env) {
  if (t.PersistentMana !== 'True') return yield* g(P, t, env);
  const J = P.joueurs[env.ctrl], avant = {...J.pool};
  yield* g(P, t, env);
  if (!J.persiste || J.persiste.tour !== P.tour) J.persiste = {tour: P.tour, pool: {}};
  LETTRES_MANA.forEach(k => { J.persiste.pool[k] = (J.persiste.pool[k] || 0) + Math.max(0, J.pool[k] - avant[k]); });
})(FORGE_API.Mana.gen);
videReserves = (g => function (P) {
  const gardes = P.joueurs.map(J => J.persiste && J.persiste.tour === P.tour ? Object.fromEntries(LETTRES_MANA.map(k => [k, Math.min(J.persiste.pool[k] || 0, J.pool[k])])) : null);
  g(P);
  P.joueurs.forEach((J, i) => { if (gardes[i]) LETTRES_MANA.forEach(k => { J.pool[k] += gardes[i][k]; J.persiste.pool[k] = gardes[i][k]; }); });
})(videReserves);
