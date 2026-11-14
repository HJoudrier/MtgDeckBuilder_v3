/* =====================================================================
   js/forgeRemplacements.js — Les remplacements de Forge (`R:`)

   Un remplacement ne monte pas sur la pile : il change un évènement au
   moment où il arrive (règle 614). Le moteur l'interroge à quatre endroits,
   chacun pour un évènement :
   - `deplace()` : « exile-la au lieu de la mettre au cimetière » (`Moved`) ;
   - `degagement()` : « ne se dégage pas » (`Untap`, `Layer$ CantHappen`) ;
   - un contre (`Counter`, `CantHappen`) : « ne peut être contrecarré » ;
   - `infligeDegats()` : la prévention (`DamageDone`, `Prevent$ True`).

   L'entrée engagée ou avec des marqueurs reste lue à part
   (js/forgeDefinition.js `remplacementForge()`), parce que le moteur la
   joue déjà dans `metEnJeu()`. Une forme que ce fichier ne connaît pas
   n'est pas construite, et la carte le dit dans sa couverture.
   ===================================================================== */

/* Les formes connues, chacune avec ce qu'elle lit. */
function formeRemplacement(face, r) {
  const actif = !r.ActiveZones || r.ActiveZones === 'Battlefield';
  if (!actif) return null;
  if (r.Event === 'Untap' && r.Layer === 'CantHappen' && r.ValidCard && (!r.ValidStepTurnToController || r.ValidStepTurnToController === 'You')) return 'untap';
  if (r.Event === 'Counter' && r.Layer === 'CantHappen' && (r.ValidCard || /^Spell(\.|$)/.test(r.ValidSA || ''))) return 'contre';
  if (r.Event === 'DamageDone' && r.Prevent === 'True' && !r.ReplaceWith) return 'prevention';
  /* Un nombre refait : marqueurs, jetons, vie, dégâts (Doubling Season,
     Hardened Scales, Boon Reflection, Torbran). */
  const q = r.ReplaceWith && forgeSousCapacite(face, r.ReplaceWith);
  if (q && !q.SubAbility && ((r.Event === 'AddCounter' && q.DB === 'ReplaceCounter' && q.Amount) ||
    (r.Event === 'CreateToken' && q.DB === 'ReplaceToken' && q.Type === 'Amount') ||
    (r.Event === 'GainLife' && q.DB === 'ReplaceEffect' && q.VarName === 'LifeGained') ||
    (r.Event === 'DamageDone' && q.DB === 'ReplaceEffect' && q.VarName === 'DamageAmount'))) return 'quantite';
  if (r.Event === 'Moved' && r.Destination === 'Graveyard' && (r.ValidCard || r.ValidLKI)) {
    const w = forgeSousCapacite(face, r.ReplaceWith);
    if (w && w.DB === 'ChangeZone' && w.Defined === 'ReplacedCard' && !w.SubAbility && ['exil', 'main', 'bibliotheque'].includes(zoneForge(w.Destination))) return 'exil';
  }
  /* « Creatures your opponents control enter tapped ». */
  if (r.Event === 'Moved' && r.Destination === 'Battlefield' && r.ValidCard && !/\bSelf\b/.test(r.ValidCard)) {
    const w = forgeSousCapacite(face, r.ReplaceWith);
    if (w && w.DB === 'Tap' && w.Defined === 'ReplacedCard' && w.ETB === 'True' && !w.SubAbility) return 'engagee';
  }
  return null;
}

forgeSait('repl', 'Untap', 'Counter', 'DamageDone', 'AddCounter', 'CreateToken', 'GainLife');
forgeSait('param', 'AddCounter.ReplaceWith', 'CreateToken.ReplaceWith', 'GainLife.ReplaceWith', 'AddCounter.ValidCard', 'AddCounter.ValidCounterType', 'AddCounter.ValidSource', 'AddCounter.ValidObject', 'AddCounter.EffectOnly',
  'AddCounter.ActiveZones', 'CreateToken.ValidToken', 'CreateToken.EffectOnly', 'CreateToken.ActiveZones', 'GainLife.ValidPlayer', 'GainLife.ActiveZones',
  'DamageDone.ReplaceWith', 'ReplaceCounter.Amount', 'ReplaceCounter.ValidCounterType', 'ReplaceCounter.ChooseCounter', 'ReplaceToken.Type',
  'ReplaceToken.Amount', 'ReplaceEffect.VarName', 'ReplaceEffect.VarValue');
forgeSait('api', 'ReplaceCounter', 'ReplaceToken', 'ReplaceEffect');
forgeSait('expr', 'ReplaceCount$CounterNum', 'ReplaceCount$TokenNum', 'ReplaceCount$LifeGained', 'ReplaceCount$DamageAmount');
forgeSait('param', 'Untap.ValidCard', 'Untap.ValidStepTurnToController', 'Untap.Layer', 'Untap.ActiveZones',
  'Counter.ValidCard', 'Counter.ValidSA', 'Counter.Layer', 'Counter.ActiveZones',
  'DamageDone.Prevent', 'DamageDone.ValidSource', 'DamageDone.ValidTarget', 'DamageDone.IsCombat', 'DamageDone.ActiveZones',
  'Moved.ValidLKI', 'Moved.Origin', 'Moved.ActiveZones', 'ChangeZone.Hidden');

/* Les remplacements en jeu, relevés une fois par version de l'état : ceux
   des permanents du champ. */
function remplacementsEnJeu(P) {
  if (P._remV === P.ver) return P._rem;
  const r = [];
  for (const id of P.champ) { const o = obj(P, id); if (!sansCapacites(o)) (o.def.remplacements || []).forEach(x => r.push({src: o, r: x})); }
  (P.effets || []).forEach(e => (e.remplacements || []).forEach(x => r.push({src: e, r: x})));
  P._remV = P.ver; P._rem = r;
  return r;
}

function envRemplacement(src, x) { return {face: x.face, ctx: {cibles: [], memo: src.memo || [], memoJ: src.memoJ || []}, src, ctrl: src.ctrl, op: {}, base: true}; }

/* « If ~ would be put into a graveyard, exile it instead » : la zone où
   l'objet va vraiment. Ses propres remplacements valent d'où qu'il parte ;
   ceux des autres, s'ils sont sur le champ. */
function destinationRemplacee(P, o, depuis, vers) {
  if (vers !== 'cimetiere') return vers;
  const tous = [...(o.def.remplacements || []).map(r => ({src: o, r})), ...remplacementsEnJeu(P).filter(x => x.src.id !== o.id)];
  for (const {src, r} of tous) {
    if (r.forme !== 'exil') continue;
    const t = r.t;
    if (t.Origin && ZONES_FORGE[t.Origin] !== depuis) continue;
    const env = envRemplacement(src, r);
    const v = t.ValidCard || t.ValidLKI;
    if (!forgeValideObjet(P, o, v, src, src.ctrl, env, true)) continue;
    /* L'exil, la main, ou le dessus de la bibliothèque (Gravebane Zombie). */
    const w = forgeSousCapacite(r.face, t.ReplaceWith), z = zoneForge(w && w.Destination);
    return z === 'bibliotheque' ? (w.LibraryPosition === '-1' ? 'dessous' : 'dessus') : z || 'exil';
  }
  return vers;
}

/* Un permanent qui entre sous le coup d'un « enters tapped » d'un autre
   permanent : jugé sur sa définition et sur qui le contrôlera. */
function entreeEngageeParAutre(P, d, ctrl, o) {
  return remplacementsEnJeu(P).some(({src, r}) => r.forme === 'engagee' && forgeValideDef(d, r.t.ValidCard, src.ctrl, ctrl, o.id));
}

/* « ~ doesn't untap during your untap step ». */
function degagementEmpeche(P, o) {
  return [...(o.def.remplacements || []).map(r => ({src: o, r})), ...remplacementsEnJeu(P).filter(x => x.src.id !== o.id)]
    .some(({src, r}) => r.forme === 'untap' && forgeValideObjet(P, o, r.t.ValidCard, src, src.ctrl, envRemplacement(src, r), true));
}

/* « ~ can't be countered », ou « creature spells you control can't be
   countered ». */
function incontrecarrable(P, o) {
  return [...(o.def.remplacements || []).map(r => ({src: o, r})), ...remplacementsEnJeu(P)].some(({src, r}) => {
    if (r.forme !== 'contre') return false;
    if (r.t.ValidCard) return src === o && /Self/.test(r.t.ValidCard);
    const reste = r.t.ValidSA.replace(/^Spell\.?/, '');
    return forgeValideDef(o.def, 'Card' + (reste ? '.' + reste : ''), src.ctrl, o.ctrl, o.id);
  });
}

/* La prévention : les dégâts qu'un remplacement empêche, et les boucliers
   « prevent the next N damage » posés sur un objet ou un joueur. Rend ce
   qui reste à infliger. */
function degatsApresPrevention(P, src, cible, n, combat) {
  if (preventionInterdite(P, src, combat)) return n;
  if (combat && P.brouillard === P.tour) return 0;
  for (const {src: h, r} of remplacementsEnJeu(P)) {
    if (r.forme !== 'prevention') continue;
    const t = r.t, env = envRemplacement(h, r);
    if (t.IsCombat === 'True' && !combat) continue;
    if (t.ValidSource && !forgeValideObjet(P, src, t.ValidSource, h, h.ctrl, env, true)) continue;
    if (t.ValidTarget && !(cible.j != null ? forgeValideJoueur(P, cible.j, t.ValidTarget, h.ctrl, env)
      : forgeValideObjet(P, cible, t.ValidTarget, h, h.ctrl, env, true))) continue;
    return 0;
  }
  const porteur = cible.j != null ? P.joueurs[cible.j] : cible;
  if (porteur.prevention > 0) { const p = Math.min(porteur.prevention, n); porteur.prevention -= p; n -= p; }
  return n;
}

/* Le nombre qu'un évènement devient sous les remplacements de quantité :
   `quoi` est `{genre, o, src, j, cible, combat, def}` selon l'évènement.
   Chaque remplacement s'applique une fois, dans l'ordre du champ. */
function quantiteRemplacee(P, evenement, n, quoi) {
  if (n <= 0) return n;
  for (const {src, r} of remplacementsEnJeu(P)) {
    if (r.forme !== 'quantite' || r.t.Event !== evenement) continue;
    const t = r.t, w = forgeSousCapacite(r.face, t.ReplaceWith), env = envRemplacement(src, r);
    const objet = (v, o) => !v || (!!o && (o.j != null ? forgeValideJoueur(P, o.j, v, src.ctrl, env) : forgeValideObjet(P, o, v, src, src.ctrl, env, true)));
    if (evenement === 'AddCounter') {
      const type = t.ValidCounterType || w.ValidCounterType;
      if ((type && genreMarqueur(type) !== quoi.genre) || !objet(t.ValidCard || t.ValidObject, quoi.o) || !objet(t.ValidSource, quoi.src)) continue;
    }
    if (evenement === 'CreateToken' && t.ValidToken && !forgeValideDef(quoi.def, t.ValidToken, src.ctrl, quoi.j)) continue;
    if (evenement === 'GainLife' && t.ValidPlayer && !forgeValideJoueur(P, quoi.j, t.ValidPlayer, src.ctrl, env)) continue;
    if (evenement === 'DamageDone' && (!objet(t.ValidSource, quoi.src) || !objet(t.ValidTarget, quoi.cible) || (t.IsCombat === 'True' && !quoi.combat))) continue;
    env.ctx.remplace = {n};
    /* `ReplaceToken` sans `Amount$` : le double (Parallel Lives). */
    n = w.DB === 'ReplaceToken' && !w.Amount ? 2 * n : Math.max(0, forgeNombre(P, w.Amount || w.VarValue || n, env));
  }
  return n;
}
