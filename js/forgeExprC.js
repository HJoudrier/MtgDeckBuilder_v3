/* =====================================================================
   js/forgeExprC.js — Des quantités de plus

   Lot F68. Les expressions de Forge que les cartes demandaient encore :
   - sur la carte : `Count$wasCastFromExile.1.0`, `Count$AltCost.1.0`,
     `Count$IfCastInOwnMainPhase.2.1` (la forme `a.b` : `a` si c'est vrai,
     `b` sinon), `Count$Metalcraft.4.2`, `Count$CardNumColors`,
     `Equipped$CardPower` ;
   - sur les joueurs et le tour : `Count$TotalOppPoisonCounters`,
     `Count$CreaturesAttackedThisTurn <filtre>`, `Count$Landfall`,
     `Count$YourCountersRAD` ;
   - sur des ensembles : `Count$MostCardName <filtre>` (le plus de cartes de
     même nom), `Count$Valid … $CardCounters.P1P1`, `$CardNumColors`,
     `$CardSumPT`, `$CardTypesPermanent`, `$PlaneswalkerType` ;
   - sur des objets désignés : `Sacrificed$Valid <filtre>` (combien de ce
     qu'on vient de sacrifier), `ExiledWith$Amount` et `ExiledWith$CardManaCost`
     (ce que la source a exilé), `ChosenCard$CardManaCost`,
     `TriggeredCard$CardNumColors`, `Targeted$CardSumPT`,
     `TriggerObjectsAttackers$CardPower`.
   ===================================================================== */

/* —— Les caractéristiques d'une carte ———————————————————————————————— */

caracForge = (g => function (P, o, quoi) {
  if (!o || o.j != null) return g(P, o, quoi);
  const c = o.lki ? o : o.zone === 'champ' ? car(P, o) : o.def;
  if (quoi === 'CardNumColors') return (c.couleurs || []).length;
  if (quoi === 'CardSumPT') return (c.force || 0) + (c.endurance || 0);
  return g(P, o, quoi);
})(caracForge);

agregeForge = (g => function (P, l, agg) {
  if (agg === 'CardNumColors') return l.reduce((s, o) => s + caracForge(P, o, agg), 0);
  if (agg === 'CardSumPT') return l.reduce((s, o) => s + caracForge(P, o, agg), 0);
  if (agg === 'CardTypesPermanent') return new Set([].concat(...l.map(o => (o.lki ? o.types : o.zone === 'champ' ? car(P, o).types : o.def.types) || [])).filter(t => TYPES_PERMANENTS.includes(t))).size;
  if (agg === 'PlaneswalkerType') return new Set([].concat(...l.filter(o => estType(o, 'planeswalker')).map(o => car(P, o).sousTypes || []))).size;
  return g(P, l, agg);
})(agregeForge);

/* —— Les expressions ——————————————————————————————————————————————— */

/* La forme `a.b` : `a` si `vrai`, `b` sinon. */
const siSinon = (P, q, vrai, env) => { const [, a, b] = q.split('.'); return forgeNombre(P, vrai ? a : b, env); };

exprEtendue = (g => function (P, tete, q, env) {
  const ctx = env.ctx || {}, src = env.src, ctrl = env.ctrl;
  let k;
  if (tete === 'Count') {
    if (/^wasCastFromExile\./.test(q)) return siSinon(P, q, !!src && forgeValideObjet(P, src, 'Card.wasCastFromExile', src, ctrl, env, true), env);
    if (/^AltCost\./.test(q)) return siSinon(P, q, !!src && /^(alt\d*|choix[AB])$/.test(src.varianteLance || ''), env);
    if (/^IfCastInOwnMainPhase\./.test(q)) return siSinon(P, q, !!src && !!src.lanceeEn && /^principale[12]$/.test(src.lanceeEn.etape) && src.lanceeEn.actif === src.ctrl, env);
    if (/^Metalcraft\./.test(q)) return siSinon(P, q, FORGE_CONDITIONS.Metalcraft(P, env), env);
    if (q === 'CardNumColors') return caracForge(P, src, 'CardNumColors');
    if (q === 'TotalOppPoisonCounters') return adversaires(P, ctrl).reduce((s, i) => s + (P.joueurs[i].poison || 0), 0);
    if (q === 'YourCountersRAD') return (P.joueurs[ctrl].marqueurs || {}).rad || 0;
    if (q === 'Landfall') return (P.entresTour || []).filter(x => x.vers === 'champ' && x.o && (x.o.types || x.o.def.types).includes('land') && (x.o.ctrl === ctrl)).length;
    if ((k = /^CreaturesAttackedThisTurn(?: (.+))?$/.exec(q)))
      return champDe(P, ctrl).filter(o => o.attaquesTour && o.attaquesTour.tour === P.tour && (!k[1] || forgeValideObjet(P, o, k[1], src, ctrl, env))).length;
    if ((k = /^MostCardName (.+)$/.exec(q))) {
      const n = new Map();
      objetsZone(P, 'champ').filter(o => forgeValideObjet(P, o, k[1], src, ctrl, env)).forEach(o => n.set(o.def.nom, (n.get(o.def.nom) || 0) + 1));
      return Math.max(0, ...n.values());
    }
    /* La somme des marqueurs d'un genre : `Count$Valid Land.YouCtrl$CardCounters.P1P1` (Toph). */
    if ((k = /^Valid(Graveyard|Hand|Exile|Library)? ([^$]+)\$CardCounters\.(\w+)$/.exec(q))) {
      const zone = {Graveyard: 'cimetiere', Hand: 'main', Exile: 'exil', Library: 'bibliotheque'}[k[1]] || 'champ', genre = genreMarqueur(k[3]);
      return objetsZone(P, zone).filter(o => forgeValideObjet(P, o, k[2], src, ctrl, env)).reduce((s, o) => s + ((o.marq || {})[genre] || 0), 0);
    }
  }
  if (tete === 'Sacrificed' && (k = /^Valid (.+)$/.exec(q))) return (ctx.sacrifies || []).filter(l => forgeValideObjet(P, l, k[1], src, ctrl, env, true)).length;
  /* La source des dégâts, l'attaquant, l'activateur de l'évènement déclencheur. */
  const e = ctx.evt || {};
  if (tete === 'TriggeredSource' || tete === 'TriggeredAttacker') {
    const o = passeOuPresent(P, tete === 'TriggeredSource' ? e.source : e.id);
    if ((k = /^Valid (.+)$/.exec(q))) return o && forgeValideObjet(P, o, k[1], src, ctrl, env, true) ? 1 : 0;
    if (q === 'CardToughness' || q === 'CardPower') return caracForge(P, o, q);
  }
  if (tete === 'TriggeredActivator' && q === 'SpellsCastThisTurn') return e.joueur != null ? (P.joueurs[e.joueur].sortsTour || []).length : 0;
  if (tete === 'TriggerCount' && q === 'ScryNum') return e.n || 0;
  if (tete === 'Equipped' && q === 'CardPower') return caracForge(P, src && src.att != null ? obj(P, src.att) : null, 'CardPower');
  if (tete === 'ChosenCard' && q === 'CardManaCost') return caracForge(P, obj(P, ((choixDe(P, src).cartes) || [])[0]), 'CardManaCost');
  if (tete === 'ExiledWith' && src) {
    const l = ((P.cartes[src.cid] || {}).exilees || []).map(id => obj(P, id)).filter(o => o && o.zone === 'exil');
    if (q === 'Amount') return l.length;
    if (q === 'CardManaCost') return l.reduce((s, o) => s + mvDe(o), 0);
  }
  if (tete === 'Remembered' && q === 'CardTypes') return new Set([].concat(...(ctx.memo || []).map(id => passeOuPresent(P, id)).filter(Boolean).map(o => o.def.types))).size;
  if (tete === 'TriggerObjectsAttackers' && q === 'CardPower') {
    const e = ctx.evt, ids = e && e.idsValides && src ? e.idsValides[src.id] : e && e.ids;
    return (ids || []).reduce((s, id) => s + caracForge(P, obj(P, id), 'CardPower'), 0);
  }
  if (tete === 'TriggeredCard' && q === 'CardNumColors') return caracForge(P, objetEvt(P, ctx), 'CardNumColors');
  if (tete === 'Targeted' && (q === 'CardNumColors' || q === 'CardSumPT')) return caracForge(P, cibleForge(P, env, false), q);
  return g(P, tete, q, env);
})(exprEtendue);

forgeSait('expr', 'Count$wasCastFromExile', 'Count$AltCost', 'Count$IfCastInOwnMainPhase', 'Count$Metalcraft', 'Count$CardNumColors',
  'Count$TotalOppPoisonCounters', 'Count$YourCountersRAD', 'Count$Landfall', 'Count$CreaturesAttackedThisTurn', 'Count$MostCardName',
  '$CardCounters', '$CardNumColors', '$CardSumPT', '$CardTypesPermanent', '$PlaneswalkerType', 'Sacrificed$Valid', 'Equipped$CardPower',
  'ChosenCard$CardManaCost', 'TriggeredSource$Valid', 'TriggeredSource$CardToughness', 'TriggeredAttacker$Valid', 'TriggeredActivator$SpellsCastThisTurn', 'TriggerCount$ScryNum', 'ExiledWith$Amount', 'ExiledWith$CardManaCost', 'Remembered$CardTypes', 'TriggerObjectsAttackers$CardPower',
  'TriggeredCard$CardNumColors', 'Targeted$CardNumColors', 'Targeted$CardSumPT');
