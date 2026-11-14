/* =====================================================================
   js/jeuVariantesB.js — Les façons de lancer, suite

   Le coût alternatif qu'une carte porte (Force of Will : « exile a blue
   card and pay 1 life rather than pay this spell's mana cost » ; Fierce
   Guardianship : gratuit si l'on contrôle son commandant), escape, retrace
   et jump-start depuis le cimetière, dash, spectacle, surge, split second,
   rebound. Chacune est une variante de plus pour `variantesSort()`
   (js/jeuVariantes.js), qui l'appelle.
   ===================================================================== */

function variantesEtendues(P, j, o, depuis, essaie) {
  const d = o.def;
  if (depuis === 'main' || depuis === 'commandement') {
    (d.statiques || []).forEach((s, i) => {
      if (s.s !== 'forge' || s.t.Mode !== 'AlternativeCost') return;
      const env = {face: s.face, ctx: {cibles: [], memo: [], memoJ: []}, src: o, ctrl: j, op: {}, base: true};
      const c = coutForge(s.t.Cost);
      if (c && conditionForge(P, s.t, env)) essaie('alt' + i, coutSort(P, j, o, depuis, c.cout.mana), autresCout(c.cout));
    });
    if (d.dash) essaie('dash', coutSort(P, j, o, depuis, d.dash.mana), autresCout(d.dash));
    if (d.spectacle && adversaires(P, j).some(i => (histoire(P).perdu[i] || 0) > 0)) essaie('spectacle', coutSort(P, j, o, depuis, d.spectacle.mana), autresCout(d.spectacle));
    if (d.surge && P.joueurs[j].sortsTour.length > 0) essaie('surge', coutSort(P, j, o, depuis, d.surge.mana), autresCout(d.surge));
    if (d.prototype && depuis === 'main') essaie('prototype', coutSort(P, j, o, depuis, d.prototype.cout), null, defPrototype(d));
    if ((d.fuse || (d.dos && d.dos.fuse)) && d.dos && depuis === 'main') { const f = defFusionnee(d); if (f) essaie('fuse', coutSort(P, j, o, depuis, sommeMana(d.cout, d.dos.cout)), null, f); }
  }
  if (depuis === 'cimetiere') {
    if (d.escape) essaie('escape', coutSort(P, j, o, depuis, d.escape.mana), autresCout(d.escape));
    if (d.retrace) essaie('retrace', coutSort(P, j, o, depuis, d.cout), {defausse: {n: 1, desc: {...descForge('Land'), genre: 'carte', zone: 'main'}}});
    if (d.jumpstart) essaie('jumpstart', coutSort(P, j, o, depuis, d.cout), {defausse: {n: 1}});
    if (d.disturb && d.dos) essaie('disturb', coutSort(P, j, o, depuis, d.disturb.mana), autresCout(d.disturb), d.dos);
    if (d.dos && d.dos.params.aftermath) essaie('aftermath', coutSort(P, j, o, depuis, d.dos.cout), d.dos.coutSup || null, d.dos);
  }
}

/* Une carte qui se lance du cimetière autrement que par flashback. */
function lancableDuCimetiere(d) { return !!(d.flashback || d.escape || d.retrace || d.jumpstart || d.disturb || (d.dos && d.dos.params.aftermath)); }

/* Split second : tant qu'il est sur la pile, personne ne lance ni
   n'active. */
function secondeFendue(P) { return P.pile.some(it => it.sort && it.def && it.def.params && it.def.params.splitSecond); }

/* Où va un sort résolu : l'exil pour le flashback et le jump-start, et
   pour le rebound s'il vient de la main. */
function exileApresResolution(item) {
  if (item.depuis === 'cimetiere') return !['permis', 'escape', 'retrace'].includes(item.variante);
  return item.depuis === 'main' && !!item.def.rebond;
}

/* Rebound : à l'entretien de son propriétaire, lancé gratuitement depuis
   l'exil. */
function* rebondsEntretien(P) {
  const J = P.joueurs[P.actif];
  for (const id of J.exil.slice()) {
    const o = obj(P, id);
    if (!o || !o.rebond || o.rebond.tour >= P.tour) continue;
    o.rebond = null;
    yield* lanceDepuisEffet(P, P.actif, o, true);
  }
}

/* Dash : la célérité, et le retour en main à l'étape de fin. */
function apresDash(P, o) {
  if (!o) return;
  o.mods.push({f: 0, e: 0, mots: MOT.CELERITE, fin: 'jamais'});
  o.finEtape = 'main';
  P.ver++;
}
