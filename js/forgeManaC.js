/* =====================================================================
   js/forgeManaC.js — Le mana qui porte quelque chose

   Un mana peut donner quelque chose au sort qu'il paie : Carnelian Orb
   (« if that mana is spent on a Dragon creature spell, it gains haste »),
   Forger's Foundry (« when you spend this mana to cast an instant or
   sorcery with mana value 3 or less, you may exile that spell instead of
   putting it into its owner's graveyard »). Le mana flottant déjà en
   réserve ne porte rien, comme `AddsNoCounter$` : on ne sait pas d'où il
   vient (js/jeuMana.js `paieMana()`).

   Deux façons de le porter, à la construction de la capacité de mana :
   - `AddsKeywords$` : un mot-clé que le permanent gagne en arrivant,
     jusqu'à la fin du tour (`k.porte`, lu par `manaPorte()`) ;
   - `TriggersWhenSpent$` : un déclencheur ordinaire de la source, que
     seul un sort payé de son mana déclenche (`ec.viaMana`, js/forgeDeclencheurs.js).
   ===================================================================== */

capaciteForge = (g => function (def, face, t, jetons) {
  const api = forgeApi(t);
  if (api !== 'Mana' || (!t.AddsKeywords && !t.AddsKeywordsValid && !t.AddsKeywordsUntil && !t.TriggersWhenSpent && !t.AddsCounters)) return g(def, face, t, jetons);
  const n = def.capacites.length;
  if (!g(def, face, t, jetons) || def.capacites.length !== n + 1 || def.capacites[n].genre !== 'mana') return false;
  const k = def.capacites[n];
  const annule = () => { def.capacites.length = n; return false; };
  if (t.AddsKeywords || t.AddsKeywordsValid || t.AddsKeywordsUntil) {
    const kws = String(t.AddsKeywords || '').split('&').map(x => x.trim().toLowerCase()).filter(Boolean);
    if (!kws.length || !t.AddsKeywordsValid || t.AddsKeywordsUntil !== 'UntilEOT' || kws.some(x => MOTS_ANGLAIS[x] == null)) return annule();
    k.porte = {mots: kws.reduce((m, x) => m | MOTS_ANGLAIS[x], 0), valid: t.AddsKeywordsValid};
  }
  /* `AddsCounters$ Card.Creature_P1P1_1` : le sort qui répond au filtre entre avec ces marqueurs (Biophagus). */
  const mq = t.AddsCounters && /^(.+)_(\w+)_(\d+)$/.exec(t.AddsCounters);
  if (t.AddsCounters && !mq) return annule();
  if (mq) k.porte = Object.assign(k.porte || {mots: 0}, {valid: mq[1].replace(/^Card/, 'Spell'), genre: genreMarqueur(mq[2]), n: +mq[3]});
  if (t.TriggersWhenSpent) {
    const tbl = face.svars[t.TriggersWhenSpent];
    const m = def.capacites.length;
    if (!tbl || !/^Mode\$ SpellCast\b/.test(tbl) || !declencheurForge(def, face, forgeTable(tbl), jetons)) return annule();
    def.capacites.slice(m).forEach(c => c.ecoutes.forEach(ec => { ec.viaMana = true; }));
  }
  return true;
})(capaciteForge);
forgeSait('param', 'Mana.AddsCounters', 'Mana.InstantSpeed', 'Mana.AddsKeywords', 'Mana.AddsKeywordsValid', 'Mana.AddsKeywordsUntil', 'Mana.TriggersWhenSpent');
FORGE_RENVOIS.push('TriggersWhenSpent');

/* À chaque mana que le paiement tire d'une source : le sort retient d'où il
   vient, et reçoit ce que ce mana-là accorde s'il lui convient. */
function manaPorte(P, j, s, option, pour) {
  const sp = pour.sort;
  (sp.manaDeSources = sp.manaDeSources || []).push(s.id);
  (s.portes || []).filter(p => p.opts.includes(option) && manaPermis(P, j, p.porte.valid, pour))
    .forEach(p => { if (p.porte.mots) sp.motsPortes = (sp.motsPortes || 0) | p.porte.mots; if (p.porte.genre) (sp.marqPortes = sp.marqPortes || []).push({genre: p.porte.genre, n: p.porte.n}); });
}

/* « You may exile that spell instead » : un remplacement optionnel se
   demande à la résolution, avant que le sort ne parte ; refusé, il ne vaut
   plus (`o.refuseRemp`, js/forgeRemplacements.js). */
function* remplacementsOptionnels(P, o) {
  if (!o || !(P.effets || []).length) return;
  const x = exilsApplicables(P, o, 'pile').find(y => y.r.t.Optional === 'True');
  if (!x) return;
  const r = yield question(P, x.src.ctrl, 'oui', ['non', 'oui'], {texte: x.r.t.Description || `Exiler ${o.def.nom} au lieu de le mettre au cimetière ?`, source: o.id});
  if (r !== 1) { o.refuseRemp = true; P.ver++; }
}

/* —— Le mana qui se perd ———————————————————————————————————————————— */

/* « If you would lose unspent mana, that mana becomes colorless instead »
   (Kruphix, Horizon Stone, Omnath) : la réserve ne se vide pas, elle devient
   incolore (lot F76). */
formeRemplacement = (g => function (face, r) {
  if (r.Event === 'LoseMana' && r.ValidPlayer === 'You' && r.ReplaceWith && (!r.ActiveZones || r.ActiveZones === 'Battlefield')) {
    const w = forgeSousCapacite(face, r.ReplaceWith);
    if (w && w.DB === 'ReplaceMana' || /^ConvertMana$/.test(r.ReplaceWith)) return 'manaIncolore';
  }
  return g(face, r);
})(formeRemplacement);

videReserves = (g => function (P) {
  const garde = P.joueurs.map(J => remplacementsEnJeu(P).some(x => x.r.forme === 'manaIncolore' && x.src.ctrl === J.i) ? LETTRES_MANA.reduce((s, k) => s + J.pool[k], 0) : 0);
  g(P);
  P.joueurs.forEach((J, i) => { if (garde[i]) J.pool.C = Math.max(0, garde[i] - J.pool.R); });
})(videReserves);
forgeSait('repl', 'LoseMana');
forgeSait('param', 'LoseMana.ValidPlayer', 'LoseMana.ReplaceWith', 'LoseMana.ActiveZones', 'LoseMana.ReplacementResult');
