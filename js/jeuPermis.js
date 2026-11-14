/* =====================================================================
   js/jeuPermis.js — Jouer une carte depuis une autre zone

   « Exile the top card of your library; until end of turn, you may play
   it », « you may cast cards exiled with ~ », jouer depuis son cimetière,
   jouer le dessus de sa bibliothèque : une statique de Forge `MayPlay$`,
   portée par un permanent ou par un effet (`P.effets`, dont la mémoire
   sert `IsRemembered`), ou par la carte elle-même (`EffectZone$`, « you
   may cast ~ from your graveyard »).

   La permission ne change pas le coût — sauf `MayPlayWithoutManaCost` — et
   ne change pas le moment : un sort de rituel attend sa phase principale,
   un terrain compte pour le terrain du tour.
   ===================================================================== */

/* Les statiques de permission en jeu, relevées une fois par version. */
function statiquesPermis(P) {
  if (P._permisV === P.ver) return P._permis;
  P._permis = statiquesEnJeu(P).filter(x => x.s.s === 'forge' && x.s.t.MayPlay === 'True');
  P._permisV = P.ver;
  return P._permis;
}

function dansZonesForge(o, zones) {
  return String(zones || '').split(',').some(z => ZONES_FORGE[z.trim()] === o.zone);
}

/* La permission qui laisse `j` jouer `o` depuis sa zone : `{src, s}`, ou
   `null`. La limite « une fois par tour » se tient dans `P.unefois`. */
function permisDeJouer(P, j, o) {
  const libre = x => !(x.s.t.MayPlayLimit && P.unefois.has('permis|' + x.src.id));
  for (const x of statiquesPermis(P)) {
    if (x.src.ctrl !== j || !dansZonesForge(o, x.s.t.AffectedZone) || !libre(x)) continue;
    if (viseForge(P, x.src, x.s, o)) return x;
  }
  /* La carte qui se permet elle-même, depuis là où elle est. */
  for (const s of o.def.statiques) {
    if (s.s !== 'forge' || s.t.MayPlay !== 'True' || !s.t.EffectZone || !dansZonesForge(o, s.t.AffectedZone)) continue;
    if (o.prop === j && libre({src: o, s}) && viseForge(P, o, s, o)) return {src: o, s};
  }
  return null;
}

/* Les cartes qu'un joueur peut jouer d'ailleurs que sa main : l'exil de
   tous (une carte adverse exilée par un de ses permanents), son cimetière,
   le dessus de sa bibliothèque. */
function cartesPermises(P, j) {
  const B = P.joueurs[j].bibliotheque;
  const zones = [...P.joueurs.map(J => [J.exil, 'exil']), [P.joueurs[j].cimetiere, 'cimetiere'], [B.length ? [B[B.length - 1]] : [], 'bibliotheque']];
  /* Sans statique en jeu, seules les cartes qui se permettent elles-mêmes
     comptent : le cas courant, qu'on écarte sans rien juger. */
  const enJeu = statiquesPermis(P).length > 0;
  const r = [];
  for (const [ids, depuis] of zones) for (const id of ids) {
    const o = obj(P, id);
    if (!o || (!enJeu && !o.def.statiques.some(s => s.t && s.t.MayPlay === 'True'))) continue;
    const x = permisDeJouer(P, j, o);
    if (x) r.push({o, depuis, x});
  }
  return r;
}

/* Le coût d'un sort joué avec une permission. */
function coutPermis(P, j, o, depuis, x) {
  return x.s.t.MayPlayWithoutManaCost === 'True' ? coutManaVide() : coutSort(P, j, o, depuis, o.def.cout);
}

/* Une permission « une fois par tour » a servi. */
function permisUtilise(P, j, o) {
  const x = permisDeJouer(P, j, o);
  if (x && x.s.t.MayPlayLimit) P.unefois.add('permis|' + x.src.id);
}

const ZONES_DEPUIS = {exil: "l'exil", cimetiere: 'le cimetière', bibliotheque: 'la bibliothèque'};
