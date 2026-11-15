/* =====================================================================
   js/forgeModes.js — Les modes qu'on paie, le mode qu'on retient

   - Spree (Return the Favor, Three Steps Ahead) : chaque mode choisi
     ajoute son coût (`ModeCost$`) ;
   - Tiered (Restoration Magic) : un seul mode, à son coût ;
   - Escalate (Collective Resistance) : chaque mode au-delà du premier
     ajoute le coût d'escalade ;
   - les Sièges (Windcrag Siege) : le mode choisi en entrant
     (`SetChosenMode$`) reste, et `ChosenModeMardu` le lit.
   ===================================================================== */

/* —— Les mots-clés ——————————————————————————————————————————————————— */

motCleLancementB = (g => function (def, face, jetons, tete, reste) {
  if (tete === 'Spree' || tete === 'Tiered') { if (reste.length) return false; def.coutModes = true; return true; }
  if (tete !== 'Escalate') return g(def, face, jetons, tete, reste);
  const c = reste.length === 1 ? manaSeul(reste[0]) : null;
  return !!c && !!(def.escalade = coutComplet(c).mana);
})(motCleLancementB);

/* Le coût d'un mode : du mana seulement (tous les scripts de Forge le sont). */
function coutDuMode(op) {
  const t = op && op.ops[0] && op.ops[0].t, c = t && t.ModeCost != null ? coutForge(t.ModeCost) : null;
  return c && !Object.keys(c.cout).some(k => k !== 'mana') ? c.cout.mana : null;
}

/* Le coût total, modes compris (js/jeuActions.js, après Strive). Trop cher,
   on lâche les derniers modes tant qu'il en reste assez. */
function coutDesModes(P, j, s, d, effets, cout, x) {
  if (!d.coutModes && !d.escalade) return cout;
  const avec = () => {
    let c = cout;
    if (d.coutModes) effets.forEach(ef => { c = sommeMana(c, coutDuMode(ef)); });
    if (d.escalade) for (let k = 1; k < effets.length; k++) c = sommeMana(c, d.escalade);
    return c;
  };
  const min = (d.sort && d.sort.modes && d.sort.modes.min) || 1;
  while (effets.length > min && !payableAvec(P, j, s, avec(), x)) effets.pop();
  return avec();
}

/* L'IA prend les modes dans l'ordre de sa préférence (`ordre`), tant
   qu'elle peut payer ce qu'ils ajoutent (js/iaChoix.js `iaModes()`). Rend
   `null` pour un sort dont les modes ne coûtent rien. */
function modesPayables(P, q, ordre) {
  const s = q.source != null ? obj(P, q.source) : null, d = s && s.def, opts = (q.extra && q.extra.options) || [];
  if (!d || (!d.coutModes && !d.escalade) || !opts.length) return null;
  const pris = [];
  let c = d.cout;
  for (const i of ordre) {
    if (pris.length >= q.max) break;
    let c2 = d.coutModes ? sommeMana(c, coutDuMode(opts[i])) : c;
    if (d.escalade && pris.length) c2 = sommeMana(c2, d.escalade);
    if (!payableAvec(P, q.joueur, s, c2, 0)) continue;
    pris.push(i); c = c2;
  }
  return pris.length >= q.min ? pris : null;
}

/* —— Le mode retenu ——————————————————————————————————————————————————— */

/* « As this enters, choose Mardu or Jeskai » : chaque mode commence par
   retenir son nom sur la carte (`choixDe(P, o).mode`). */
FORGE_API.GenericChoice.prepare = (p => function (t, op) {
  if (!p.call(this, t, op)) return false;
  if (t.SetChosenMode === 'True') {
    const noms = String(t.Choices).split(',').map(n => n.trim());
    op.modes.forEach((m, i) => { m.effet = {...m.effet, ops: [{op: 'modeChoisi', nom: noms[i], hostile: false}, ...m.effet.ops]}; });
  }
  return true;
})(FORGE_API.GenericChoice.prepare);
OPS.modeChoisi = function* (P, op, ctx) {
  const s = sourceCtx(P, ctx);
  if (s) choixDe(P, s).mode = op.nom;
};
proprieteDesignee = (g => function (P, o, p, c, src, ctrl, env) {
  const m = /^ChosenMode(\w+)$/.exec(p);
  return m ? !!P && choixDe(P, o).mode === m[1] : g(P, o, p, c, src, ctrl, env);
})(proprieteDesignee);

FORGE_COMMUNS.add('ModeCost');
forgeSait('kw', 'Spree', 'Tiered', 'Escalate');
forgeSait('param', 'GenericChoice.SetChosenMode', 'ModeCost');
forgeSait('filtre', ...['Mardu', 'Jeskai', 'Temur', 'Sultai', 'Abzan', 'Khans', 'Dragons', 'Mirran', 'Phyrexian', 'Believe', 'Doubt', 'Legion', 'NCR',
  'Brotherhood', 'Enclave', 'Cosplay', 'Science'].map(n => 'ChosenMode' + n));
