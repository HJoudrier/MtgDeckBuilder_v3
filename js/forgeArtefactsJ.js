/* =====================================================================
   js/forgeArtefactsJ.js — Les artefacts d'EDHREC : les remplacements

   Lot F108 :
   - Grafdigger's Cage : `Moved | Prevent` — aucune créature n'entre depuis un
     cimetière ou une bibliothèque ;
   - Library of Leng : se défausser par un effet, mais pouvoir mettre la carte
     sur sa bibliothèque ;
   - Twinning Staff : `CopySpell` — une copie de plus à chaque lot de copies ;
   - Mirrormind Crown : `CreateToken | Layer$ Copy` — la première fois du tour,
     des copies de la créature équipée ;
   - Damping Sphere : un terrain qui donne deux mana ou plus ne donne que {C},
     et chaque sort coûte {1} de plus par sort déjà lancé ce tour ;
   - Mechtitan Core : les cartes exilées en payant, rendues quand le jeton part ;
   - Ratchet, Field Medic : `More Than Meets the Eye` et `Living metal`.
   ===================================================================== */

/* —— Les formes de remplacement ————————————————————————————————————— */

forgeSait('param', 'Moved.Prevent', 'Moved.Layer', 'Moved.Discard', 'Moved.EffectOnly', 'Moved.Optional', 'CopySpell.ActiveZones', 'CopySpell.ValidPlayer', 'CopySpell.ValidSpell',
  'CopySpell.ReplaceWith', 'CreateToken.Layer', 'ReplaceToken.ValidChoices', 'ProduceMana.ManaAmount', 'ProduceMana.ValidCard', 'ReplaceMana.ReplaceMana', 'RaiseCost.Relative');
forgeSait('repl', 'CopySpell', 'ProduceMana');
formeRemplacementB = (g => function (r) {
  if (r.Event === 'Moved' && r.Prevent === 'True' && r.Layer === 'CantHappen' && /Battlefield/.test(r.Destination || '')) return 'preventEntree';
  if (r.Event === 'Moved' && r.Discard === 'True' && r.EffectOnly === 'True' && r.ReplaceWith) return 'defausseBib';
  if (r.Event === 'CopySpell' && r.ReplaceWith) return 'copieSup';
  if (r.Event === 'CreateToken' && r.Layer === 'Copy' && r.ReplaceWith) return 'copieJetons';
  if (r.Event === 'ProduceMana' && r.ReplaceWith && /Land/.test(r.ValidCard || '')) return 'manaCSeul';
  return g(r);
})(formeRemplacementB);
const aForme = (P, forme, j) => remplacementsEnJeu(P).some(({src, r}) => r.forme === forme && (j == null || src.ctrl === j));

/* —— Grafdigger's Cage ——————————————————————————————————————————— */

metEnJeu = (g => function* (P, id, ctrl, opts) {
  const o = obj(P, id);
  if (o && (o.zone === 'cimetiere' || o.zone === 'bibliotheque') && remplacementsEnJeu(P).some(({src, r}) => r.forme === 'preventEntree' &&
    String(r.t.Origin || '').split(',').some(z => ZONES_FORGE[z.trim()] === o.zone) && forgeValideObjet(P, o, r.t.ValidLKI || 'Card', src, src.ctrl, envRemplacement(src, r), true))) {
    jn(P, `${o.def.nom} ne peut pas entrer sur le champ de bataille`);
    return null;
  }
  return yield* g(P, id, ctrl, opts);
})(metEnJeu);

/* —— Library of Leng ———————————————————————————————————————————— */

FORGE_API.Discard.gen = (g => function* (P, t, env) {
  const avant = P.joueurs.map(J => new Set(J.cimetiere));
  yield* g(P, t, env);
  for (const J of P.joueurs) {
    const x = remplacementsEnJeu(P).find(({src, r}) => r.forme === 'defausseBib' && src.ctrl === J.i);
    if (!x) continue;
    for (const id of J.cimetiere.slice()) {
      const o = obj(P, id);
      if (!o || avant[J.i].has(id)) continue;
      if ((yield question(P, J.i, 'oui', ['non', 'oui'], {texte: `${x.src.def.nom} : mettre ${o.def.nom} sur la bibliothèque plutôt qu'au cimetière ?`, source: x.src.id, defaut: 0})) === 1) deplace(P, id, 'dessus');
    }
  }
})(FORGE_API.Discard.gen);

/* —— Twinning Staff ————————————————————————————————————————————— */

copieSort = (g => function* (P, j, o, it, nouvelles) {
  if (P.lotCopies && P.lotCopies.j === j) P.lotCopies.n++;
  return yield* g(P, j, o, it, nouvelles);
})(copieSort);
/* Un lot de copies : la boucle d'un mot-clé, ou l'effet d'une carte ; s'il y en a eu, une de plus. */
function lotDeCopies(f) {
  return function* (P, ...r) {
    const ctx = r[r.length - 1] && r[r.length - 1].ctx ? r[r.length - 1] : r[r.length - 1], j = ctx && (ctx.ctrl != null ? ctx.ctrl : null);
    const avant = P.lotCopies;
    P.lotCopies = {j, n: 0};
    try {
      yield* f(P, ...r);
      if (P.lotCopies.n > 0 && j != null && aForme(P, 'copieSup', j)) {
        const it = P.pile.find(x => x.id === (ctx.source != null ? ctx.source : -1));
        if (it && obj(P, it.id)) { P.lotCopies.n = 0; jn(P, `${P.joueurs[j].nom} : une copie de plus`); yield* copieSort(P, j, obj(P, it.id), it, true); }
      }
    } finally { P.lotCopies = avant; }
  };
}
['replique', 'tempeteTombe', 'tempete'].forEach(k => { if (OPS[k]) OPS[k] = lotDeCopies(OPS[k]); });
FORGE_API.CopySpellAbility.gen = (g => function* (P, t, env) {
  const avant = P.lotCopies; P.lotCopies = {j: env.ctrl, n: 0};
  try {
    yield* g(P, t, env);
    if (P.lotCopies.n > 0 && aForme(P, 'copieSup', env.ctrl)) {
      P.lotCopies.n = 0;
      for (const o of objetsForge(P, t, env, 'Targeted').filter(o => o.zone === 'pile')) { const it = P.pile.find(x => x.id === o.id); if (it) yield* copieSort(P, env.ctrl, o, it, t.MayChooseTarget === 'True'); }
    }
  } finally { P.lotCopies = avant; }
})(FORGE_API.CopySpellAbility.gen);

/* —— Mirrormind Crown ——————————————————————————————————————————— */

noteHistorique = (g => function (P, e) {
  g(P, e);
  if (e.t === 'entre' && e.jeton) (histoire(P).jetonsCrees = histoire(P).jetonsCrees || {})[e.ctrl] = true;
})(noteHistorique);
creeJetonsForge = (g => function* (P, defs, n0, qui, engage, env, retenir) {
  const j = qui && qui.length === 1 ? qui[0] : null;
  const x = j != null && !(histoire(P).jetonsCrees || {})[j] && remplacementsEnJeu(P).find(({src, r}) => r.forme === 'copieJetons' && src.ctrl === j && src.att != null && obj(P, src.att) && obj(P, src.att).zone === 'champ');
  if (x && (yield question(P, j, 'oui', ['non', 'oui'], {texte: `${x.src.def.nom} : créer plutôt des copies de ${obj(P, x.src.att).def.nom} ?`, source: x.src.id, defaut: 1})) === 1) {
    const hote = obj(P, x.src.att);
    defs = defs.map(() => defJetonCopie(hote.def, {}));
  }
  return yield* g(P, defs, n0, qui, engage, env, retenir);
})(creeJetonsForge);

/* —— Damping Sphere ————————————————————————————————————————————— */

sourcesMana = (g => function (P, j, pour) {
  const l = g(P, j, pour);
  if (!aForme(P, 'manaCSeul')) return l;
  return l.map(s => { const o = obj(P, s.id); return o && estType(o, 'land') && (s.options || []).some(x => String(x).length >= 2) ? {...s, options: ['C'], couleurs: ['C'], cap: 1} : s; });
})(sourcesMana);
coutsForge = (g => function (P, j, o) {
  let [plus, moins] = g(P, j, o);
  for (const {src, s} of statiquesEnJeu(P)) if (s.s === 'forge' && s.t && s.t.Mode === 'RaiseCost' && s.t.Relative === 'True' && (s.t.Activator !== 'You' || j === src.ctrl)) plus += (P.joueurs[j].sortsTour || []).length;
  return [plus, moins];
})(coutsForge);

/* —— Mechtitan Core ————————————————————————————————————————————— */

forgeSait('defini', 'ExiledCards.Other');
forgeSait('param', 'Effect.ImprintCards');
paieAutreX = (g => function* (P, j, o, c) {
  const avant = new Set(P.joueurs[j].exil);
  yield* g(P, j, o, c);
  if (c.exileChamp) {
    const nouveaux = P.joueurs[j].exil.filter(id => !avant.has(id));
    P.coutPaye = P.coutPaye || {};
    P.coutPaye.exiles = [...(P.coutPaye.exiles || []), ...nouveaux];
  }
})(paieAutreX);
FORGE_API.Effect.prepare = (p => function (t, op) {
  if (t.Triggers && /^ExiledCards\.Other$/.test(t.RememberObjects || '') && t.ImprintCards === 'Remembered') { op.mechtitan = true; return true; }
  return p.call(this, t, op);
})(FORGE_API.Effect.prepare);
FORGE_API.Effect.gen = (g => function* (P, t, env) {
  if (!env.op.mechtitan) return yield* g(P, t, env);
  const jeton = env.ctx.memo[env.ctx.memo.length - 1], cartes = (env.ctx.coutPaye && env.ctx.coutPaye.exiles) || [];
  if (jeton != null && cartes.length) (P.retoursJeton = P.retoursJeton || []).push({jeton, cartes: cartes.slice(), ctrl: env.ctrl});
})(FORGE_API.Effect.gen);
noteHistorique = (g => function (P, e) {
  g(P, e);
  if (e.t !== 'zone' || e.de !== 'champ' || !P.retoursJeton) return;
  const i = P.retoursJeton.findIndex(x => x.jeton === e.ancien);
  if (i < 0) return;
  const r = P.retoursJeton.splice(i, 1)[0];
  P.enAttente.push({src: e.ancien, lki: e.lki, ctrl: r.ctrl, cap: {genre: 'declenchee', ecoutes: [], texte: 'Retour des cartes exilées', effet: {ops: [{op: 'retourExiles', cartes: r.cartes, hostile: false}], cibles: [], modes: null}}, evt: e});
})(noteHistorique);
OPS.retourExiles = function* (P, op, ctx) {
  for (const id of op.cartes) { const o = obj(P, id); if (o && o.zone === 'exil') yield* deplaceForge(P, o, 'champ', {ctrl: ctx.ctrl, ctx}, {ctrl: o.prop, engage: true}); }
};

/* —— Ratchet, Field Medic ———————————————————————————————————————— */

forgeSait('kw', 'More Than Meets the Eye', 'Living metal');
forgeSait('param', 'SetState.RememberChanged');
motCleForge = (g => function (def, k, face, jetons) {
  const [tete, ...reste] = k.split(':');
  if (tete === 'Living metal') { def.params.vivant = true; return true; }
  if (tete === 'More Than Meets the Eye') { const c = reste.length === 1 ? coutForge(reste[0]) : null; if (!c || Object.keys(c.cout).some(x => x !== 'mana')) return false; def.convertie = c.cout.mana; return true; }
  return g(def, k, face, jetons);
})(motCleForge);
variantesEtendues = (g => function (P, j, o, depuis, essaie) {
  g(P, j, o, depuis, essaie);
  if (o.def.convertie && o.def.dos && depuis === 'main') essaie('convertie', coutSort(P, j, o, depuis, o.def.convertie), o.def.coutSup || null, o.def.dos);
})(variantesEtendues);
/* « During your turn, this Vehicle is also an artifact creature » : à l'entrée et au début de chaque tour de son contrôleur. */
const vivifie = (P, o) => { if (o && o.def.params && o.def.params.vivant && o.ctrl === P.actif && !(o.anime || []).some(a => a.vivant)) { (o.anime = o.anime || []).push({types: ['creature'], fin: 'tour', vivant: true}); P.ver++; } };
debutDuTour = (g => function (P) { g(P); P.champ.forEach(id => vivifie(P, obj(P, id))); })(debutDuTour);
noteHistorique = (g => function (P, e) { g(P, e); if (e.t === 'entre' && e.id != null) vivifie(P, obj(P, e.id)); })(noteHistorique);
