/* =====================================================================
   js/forgeManaB.js — Le mana, II

   Les sources et les règles de mana que les cartes les plus jouées en
   Commander portent :
   - une capacité de mana sous condition (Mox Opal : metalcraft) ;
   - depuis la main (Simian et Elvish Spirit Guide) : la source la plus
     chère, prise en dernier par le planificateur (js/jeuMana.js) ;
   - un mana qui rend le sort incontrecarrable (Delighted Halfling) ;
   - un montant calculé pour le mana reflété (Incubation Druid) ;
   - multikicker (Everflowing Chalice, Comet Storm), `Count$TimesKicked` ;
   - le mana qu'on ne perd pas (Electro : le rouge reste ; Ozai : tout
     devient rouge) ;
   - le mana multiplié (Nyxbloom Ancient, Mana Reflection), le mana en plus
     selon ce qu'on a produit (Forsaken Monument, Caged Sun).
   ===================================================================== */

/* Ces règles touchent des gestes très fréquents (engager, vider les
   réserves) : on ne les cherche que si une carte qui les porte a été
   compilée. */
const MANA_B = {multiplie: false, rouge: false, garde: false, main: false};
/* —— Les capacités de mana ——————————————————————————————————————————— */

/* À la construction : la condition d'activation, le mana incontrecarrable,
   le montant reflété ; depuis la main, une capacité à part. */
capaciteForge = (g => function (def, face, t, jetons) {
  const api = forgeApi(t);
  if (api === 'Mana' && t.Activation && !FORGE_CONDITIONS[t.Activation]) return false;
  if (api === 'Mana' && t.ActivationZone === 'Hand') return manaDeLaMain(def, face, t);
  const n = def.capacites.length, ok = g(def, face, t, jetons);
  const k = ok && def.capacites.length > n ? def.capacites[def.capacites.length - 1] : null;
  if (k && k.genre === 'mana') {
    if (t.Activation) k.activation = t.Activation;
    if (t.AddsNoCounter === 'True') k.sansContre = true;
    if (api === 'ManaReflected' && t.Amount) { k.montant = t.Amount; k.face = face; }
  }
  return ok;
})(capaciteForge);

/* « Exile CARDNAME from your hand: Add {R} ». */
function manaDeLaMain(def, face, t) {
  const c = coutForge(t.Cost), options = optionsMana(t.Produced, /^\d+$/.test(t.Amount || '1') ? +(t.Amount || 1) : 0);
  if (!c || t.SubAbility || !options.length || !c.cout.exileSoi || Object.keys(c.cout).some(x => x !== 'mana' && x !== 'exileSoi') || (c.cout.mana && c.cout.mana.total) || !tableJouable(t)) return false;
  def.capacites.push({genre: 'mana', zone: 'main', cout: c.cout, options, texte: texteForge(face, t)});
  MANA_B.main = true;
  return true;
}

/* Metalcraft, threshold, hellbent… : `FORGE_CONDITIONS`. */
activationInterdite = (g => function (P, j, o, k) {
  return (!!k.activation && !FORGE_CONDITIONS[k.activation](P, {ctrl: j, src: o, ctx: {cibles: [], memo: [], memoJ: []}, op: {}})) || g(P, j, o, k);
})(activationInterdite);

/* Les sources de la main, après toutes celles du champ. */
sourcesMana = (g => function (P, j, pour) {
  const r = g(P, j, pour);
  if (!MANA_B.main) return r;
  for (const id of P.joueurs[j].main) {
    const o = obj(P, id), d = o.def;
    /* Appelé à chaque plan de paiement : la réponse se garde sur la définition. */
    if (d._manaMain === undefined) d._manaMain = d.capacites.some(k => k.genre === 'mana' && k.zone === 'main');
    if (!d._manaMain) continue;
    const opts = [].concat(...d.capacites.filter(k => k.genre === 'mana' && k.zone === 'main').map(k => k.options));
    if (opts.length) r.push({id, options: opts, rang: 9, main: true, couleurs: [...new Set(opts.join('').split(''))], cap: Math.max(...opts.map(s => s.length))});
  }
  return r;
})(sourcesMana);

/* Le sort payé avec le mana de Delighted Halfling ne peut être contrecarré
   (js/jeuMana.js `paieMana()` pose la marque). */
incontrecarrable = (g => function (P, o) { return !!(o && o.nonContrable) || g(P, o); })(incontrecarrable);

/* —— Multikicker ————————————————————————————————————————————————————— */

/* Une variante par nombre de kicks, jusqu'à ce qu'on peut payer (cinq au plus). */
variantesMotsClesE = (g => function (P, j, o, depuis, essaie) {
  g(P, j, o, depuis, essaie);
  const d = o.def;
  if (!d.multikicker || depuis !== 'main') return;
  let m = coutSort(P, j, o, depuis);
  for (let k = 1; k <= 5; k++) {
    m = sommeMana(m, d.multikicker);
    if (!payableAvec(P, j, o, m, 0)) break;
    essaie('multikicker' + k, m, d.coutSup || null);
  }
})(variantesMotsClesE);
motCleLancementB = (g => function (def, face, jetons, tete, reste) {
  if (tete !== 'Multikicker') return g(def, face, jetons, tete, reste);
  const c = reste.length === 1 ? manaSeul(reste[0]) : null;
  return !!c && !!(def.multikicker = coutComplet(c).mana);
})(motCleLancementB);
const foisKicke = (env) => {
  const v = (env.ctx && env.ctx.variante) || (env.src && env.src.varianteLance) || '';
  return foisVariante(v, 'multikicker');
};

/* —— Le mana qu'on ne perd pas ———————————————————————————————————————— */

forgeStatique('UnspentMana', ['ValidPlayer', 'ManaType'], () => {});
statiqueForge = (g => function (face, t, jetons) { const r = g(face, t, jetons); if (r && t.Mode === 'UnspentMana') MANA_B.garde = true; return r; })(statiqueForge);
const LETTRE_TYPE = {White: 'W', Blue: 'U', Black: 'B', Red: 'R', Green: 'G', Colorless: 'C'};

/* Ce qu'un joueur garde quand les réserves se vident : la couleur que dit
   `UnspentMana`, ou tout son mana devenu rouge (`LoseMana`, Ozai). */
function manaGarde(P, J) {
  const g = {};
  if (!MANA_B.garde && !MANA_B.rouge) return g;
  for (const x of statiquesMode(P, 'UnspentMana')) {
    if (!joueurStatique(P, J.i, x.s.t.ValidPlayer, x.src, envStatique(x.src, x.s))) continue;
    const k = LETTRE_TYPE[x.s.t.ManaType];
    if (k) g[k] = J.pool[k]; else LETTRES_MANA.forEach(l => { g[l] = J.pool[l]; });
  }
  if (remplacementsPour(P, 'manaRouge', J.i).length) g.R = LETTRES_MANA.reduce((s, l) => s + J.pool[l], 0);
  return g;
}
videReserves = (g => function (P) {
  const garde = P.joueurs.map(J => manaGarde(P, J));
  g(P);
  P.joueurs.forEach((J, i) => { for (const [k, n] of Object.entries(garde[i])) J.pool[k] = Math.max(J.pool[k], n || 0); });
})(videReserves);

/* —— Le mana multiplié, le mana en plus ——————————————————————————————— */

formeRemplacementD = (g => function (face, r) {
  const f = g(face, r);
  if (f) return f;
  const w = r.ReplaceWith && forgeSousCapacite(face, r.ReplaceWith);
  if (!w || forgeApi(w) !== 'ReplaceMana' || w.SubAbility) return null;
  if (r.Event === 'ProduceMana' && /^\d+$/.test(w.ReplaceAmount || '')) { MANA_B.multiplie = true; return 'manaMultiplie'; }
  if (r.Event === 'LoseMana' && w.ReplaceType === 'Red') { MANA_B.rouge = true; return 'manaRouge'; }
  return null;
})(formeRemplacementD);

/* « If you tap a permanent for mana, it produces three times as much » :
   à l'engagement pour du mana, ce qui manque s'ajoute. */
engageObjet = (g => function (P, o, pourMana, attaque) {
  if (!MANA_B.multiplie || typeof pourMana !== 'string' || !o || o.engage) return g(P, o, pourMana, attaque);
  g(P, o, pourMana, attaque);
  let m = 1;
  for (const x of remplacementsEnJeu(P)) {
    if (x.r.forme !== 'manaMultiplie') continue;
    const t = x.r.t, env = envRemplacement(x.src, x.r);
    if (t.ValidActivator && !forgeValideJoueur(P, o.ctrl, t.ValidActivator, x.src.ctrl, env)) continue;
    if (t.ValidCard && !forgeValideObjet(P, o, t.ValidCard, x.src, x.src.ctrl, env, true)) continue;
    m *= +forgeSousCapacite(x.r.face, t.ReplaceWith).ReplaceAmount;
  }
  if (m > 1) ajouteMana(P, o.ctrl, pourMana.repeat(m - 1));
})(engageObjet);

/* `Produced$` : ce qu'on vient de produire contient-il cette couleur ? */
function produitCouleur(P, v, mana, s) {
  if (!v) return true;
  const k = v === 'ChosenColor' || v === 'Chosen' ? choixDe(P, s).couleur : LETTRE_TYPE[v] || v;
  return !!k && String(mana).includes(k);
}
FORGE_MODES.TapsForMana = (j => (P, t, e, s, env) => j(P, t, e, s, env) && produitCouleur(P, t.Produced, e.mana, s))(FORGE_MODES.TapsForMana);
/* « Whenever a land's ability causes you to add mana of the chosen color ». */
forgeMode('ManaAdded', ['ValidSource', 'ValidSA', 'Produced', 'Player', 'Static'], (P, t, e, s, env) => e.t === 'engage' && typeof e.mana === 'string' &&
  t.ValidSA !== 'SpellAbility.!ManaAbility' && valideOuRien(P, obj(P, e.id), t.ValidSource, s, env) && joueurOuRien(P, e.ctrl, t.Player, s, env) &&
  produitCouleur(P, t.Produced, e.mana, s));

forgeSait('param', 'Mana.Activation', 'Mana.AddsNoCounter', 'Mana.ActivationZone', 'ManaReflected.Amount', 'TapsForMana.Produced', 'TapsForMana.CheckDefinedPlayer',
  'ProduceMana.ActiveZones', 'ProduceMana.ValidActivator', 'ProduceMana.ValidCard', 'ProduceMana.ReplaceWith', 'ReplaceMana.ReplaceAmount', 'ReplaceMana.ReplaceType',
  'LoseMana.ValidPlayer', 'LoseMana.ReplacementResult', 'LoseMana.ReplaceWith', 'LoseMana.ActiveZones');
forgeSait('repl', 'ProduceMana', 'LoseMana');
forgeSait('api', 'ReplaceMana');
forgeSait('kw', 'Multikicker');
forgeSait('expr', 'Count$TimesKicked', 'Count$ManaPool');
