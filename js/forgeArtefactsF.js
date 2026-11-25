/* =====================================================================
   js/forgeArtefactsF.js — Les artefacts d'EDHREC : des cartes qui changent de règle

   Lot F108 :
   - `Animate | Replacements$` : un remplacement que la carte porte désormais —
     « if this land would leave the battlefield, exile it instead »
     (Realmbreaker), « you can't lose the game » (The Book of Exalted Deeds) ;
   - `Pump | KW$ Embalm:CardManaCost` pour une carte du cimetière (Cursecloth
     Wrappings) : l'embaumement, au coût de la carte, jusqu'à la fin du tour ;
   - `Pump | KW$ Persist` (Cauldron of Souls) : les créatures choisies, qui
     meurent ce tour sans marqueur −1/−1, reviennent avec un ;
   - `Dig | FaceDown | GainControl` : les cartes du dessus arrivent face
     cachée, sous notre contrôle (Cybership) ;
   - `ChangeZoneAll | StaticEffect` : les créatures revenues deviennent des
     Zombies noirs (Grimoire of the Dead).
   ===================================================================== */

/* —— Des remplacements portés par la carte ——————————————————————————— */

const REMPL_ANIME = [
  [/Event\$ *Moved/, /Origin\$ *Battlefield/, /ReplaceWith\$ *Exile\b/, 'exilSiQuitte'],
  [/Event\$ *GameLoss/, /Layer\$ *CantHappen/, null, 'empechePerte'],
  [/Event\$ *GameWin/, /Layer\$ *CantHappen/, null, 'empechePerte']
];
const remplAnime = (op, t) => String(t.Replacements).split(',').map(n => n.trim()).filter(Boolean)
  .map(n => { const r = op.face && op.face.svars[n]; return r && REMPL_ANIME.find(([a, b, c]) => a.test(r) && b.test(r) && (!c || c.test(r))); });
forgeSait('param', 'Animate.Replacements');
FORGE_API.Animate.prepare = (p => function (t, op) {
  if (!t.Replacements) return !p || p.call(this, t, op);
  const l = remplAnime(op, t);
  return l.length > 0 && l.every(Boolean) && (!p || p.call(this, {...t, Replacements: undefined}, op));
})(FORGE_API.Animate.prepare);
FORGE_API.Animate.gen = (g => function* (P, t, env) {
  if (!t.Replacements) return yield* g(P, t, env);
  yield* g(P, {...t, Replacements: undefined}, env);
  const drapeaux = remplAnime(env.op, t).filter(Boolean).map(x => x[3]);
  for (const o of objetsForge(P, t, env).filter(x => x && x.j == null && x.zone === 'champ' && !x.lki)) drapeaux.forEach(d => { o[d] = true; });
  P.ver++;
})(FORGE_API.Animate.gen);
/* Un joueur qui contrôle un permanent à qui l'on a dit « you can't lose the game » ne perd pas. */
nePeutPerdre = (g => function (P, j, raison) { return g(P, j, raison) || P.champ.some(id => { const o = obj(P, id); return o && o.ctrl === j && o.empechePerte; }); })(nePeutPerdre);

/* —— ChangeZoneAll : devenir des Zombies noirs ————————————————————————— */

etendEffet('ChangeZoneAll', ['StaticEffect', 'StaticEffectCheckSVar', 'StaticEffectSVarCompare', 'LeaveBattlefield'], null, animeRevenus);

/* —— Embalmer une carte du cimetière ————————————————————————————————— */

forgeSait('kwval', 'embalm:cardmanacost');
FORGE_API.Pump.prepare = (p => function (t, op) { return (t.PumpZone === 'Graveyard' && t.KW === 'Embalm:CardManaCost' && !t.NumAtt && !t.NumDef) || !p || p.call(this, t, op); })(FORGE_API.Pump.prepare);
FORGE_API.Pump.gen = (g => function* (P, t, env) {
  if (t.PumpZone === 'Graveyard' && t.KW === 'Embalm:CardManaCost') { objetsForge(P, t, env).filter(o => o.zone === 'cimetiere' && estCreature(o)).forEach(o => { o.embaumeTemp = P.tour; }); P.ver++; return; }
  /* Persist : retenu pour le tour, la mort le lira. */
  if (t.KW === 'Persist') {
    const l = objetsForge(P, t, env).filter(o => o.zone === 'champ' && !o.lki);
    if (!P.persistAccorde || P.persistAccorde.tour !== P.tour) P.persistAccorde = {tour: P.tour, ids: new Set()};
    l.forEach(o => P.persistAccorde.ids.add(o.id));
    return;
  }
  return yield* g(P, t, env);
})(FORGE_API.Pump.gen);
forgeSait('kwval', 'persist');
FORGE_API.Pump.prepare = (p => function (t, op) { return t.KW === 'Persist' || !p || p.call(this, t, op); })(FORGE_API.Pump.prepare);
/* Une carte du cimetière à qui on a donné l'embaumement : la capacité, au coût de la carte, que le cimetière offre ce tour. */
capacitesDe = (g => function (P, o) {
  const r = g(P, o);
  if (!o || o.zone !== 'cimetiere' || o.embaumeTemp !== P.tour || !estCreature(o)) return r;
  if (!o._capEmbaume) o._capEmbaume = {genre: 'activee', zone: 'cimetiere', texte: 'Embalm', cout: {mana: o.def.cout, exileSoi: true}, vitesse: 'rituel',
    effet: {ops: [{op: 'embaume', eternel: false, hostile: false}], cibles: [], modes: null}};
  return r.includes(o._capEmbaume) ? r : r.concat([o._capEmbaume]);
})(capacitesDe);

/* —— Persist ————————————————————————————————————————————————— */

const CAP_PERSIST = id => ({genre: 'declenchee', ecoutes: [], texte: 'Persist', effet: {ops: [{op: 'persistRevient', id, hostile: false}], cibles: [], modes: null}});
noteHistorique = (g => function (P, e) {
  g(P, e);
  const pa = P.persistAccorde;
  if (e.t !== 'zone' || e.de !== 'champ' || e.vers !== 'cimetiere' || !pa || pa.tour !== P.tour || !pa.ids.has(e.ancien) || !e.lki || e.lki.jeton || (e.lki.marq || {})['-1/-1'] > 0) return;
  pa.ids.delete(e.ancien);
  P.enAttente.push({src: e.id, ctrl: e.lki.ctrl, cap: CAP_PERSIST(e.id), evt: e});
})(noteHistorique);
OPS.persistRevient = function* (P, op, ctx) {
  const o = obj(P, op.id);
  if (!o || o.zone !== 'cimetiere') return;
  yield* deplaceForge(P, o, 'champ', {ctrl: ctx.ctrl, ctx}, {ctrl: o.prop, marqueurs: {'-1/-1': 1}});
};

/* —— Cybership : face cachée sous notre contrôle ———————————————————————— */

forgeSait('param', 'Dig.GainControl', 'Dig.FaceDown', 'Dig.FaceDownPower', 'Dig.FaceDownToughness', 'Dig.FaceDownSetType');
FORGE_API.Dig.prepare = (p => function (t, op) { return (t.FaceDown === 'True' && t.DestinationZone === 'Battlefield') || !p || p.call(this, t, op); })(FORGE_API.Dig.prepare);
FORGE_API.Dig.gen = (g => function* (P, t, env) {
  if (t.FaceDown !== 'True' || t.DestinationZone !== 'Battlefield') return yield* g(P, t, env);
  const n = forgeNombre(P, t.DigNum || 1, env);
  for (const j of joueursForge(P, t, env)) {
    for (const id of P.joueurs[j].bibliotheque.slice(-n).reverse()) {
      const o = obj(P, id);
      if (!o) continue;
      const nid = yield* metEnJeu(P, id, t.GainControl === 'True' ? env.ctrl : j, {faceCachee: true}), no = nid != null && obj(P, nid);
      if (no && no.faceCachee) metFaceCachee(P, no, forgeNombre(P, t.FaceDownPower || 2, env), forgeNombre(P, t.FaceDownToughness || 2, env), t.FaceDownSetType);
    }
  }
})(FORGE_API.Dig.gen);

/* —— Une carte du cimetière du joueur visé ————————————————————————————— */

/* « Put a land card from their graveyard onto the battlefield tapped under your control » (Realmbreaker) : `ChangeType$ Land.TargetedPlayerCtrl`, une carte du cimetière du joueur que le sort visait. */
FORGE_API.ChangeZone.gen = (g => function* (P, t, env) {
  if (t.Origin !== 'Graveyard' || t.Destination !== 'Battlefield' || !/TargetedPlayerCtrl/.test(t.ChangeType || '')) return yield* g(P, t, env);
  const filtre = t.ChangeType.replace(/\.?TargetedPlayerCtrl/, ''), qui = ciblesJoueurs(env);
  const ids = [].concat(...qui.map(j => P.joueurs[j].cimetiere.filter(id => forgeValideObjet(P, obj(P, id), filtre || 'Card', env.src, env.ctrl, env))));
  if (!ids.length) return;
  for (const id of yield* choisitCartes(P, env.ctrl, ids, 1, 'Choisir une carte du cimetière', 'cartes', t.Mandatory === 'True' ? 1 : 0)) {
    const n = yield* deplaceForge(P, obj(P, id), 'champ', env, {ctrl: t.GainControl === 'True' ? env.ctrl : null, engage: t.Tapped === 'True'});
    if (n != null && t.RememberChanged === 'True') retiensForge(env.ctx, n);
  }
})(FORGE_API.ChangeZone.gen);
