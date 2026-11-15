/* =====================================================================
   js/forgeRemplacementsD.js — Les remplacements, IV

   Des remplacements de Forge que les cartes les plus jouées en Commander
   portent :
   - les jetons en plus (Chatterfang, Xorn, Peregrin Took) ou d'une autre
     sorte (Academy Manufactor) ;
   - les marqueurs selon qui les pose (Vorinclex) ;
   - la vie perdue doublée (Bloodletter of Aclazotz), ou arrêtée à 1
     (Angel's Grace) ;
   - le tour en plus d'un adversaire sauté (Trouble in Pairs) ;
   - meuler plus (The Water Crystal), proliférer deux fois (Tekuthal) ;
   - l'exil au lieu du cimetière, avec une suite (The Darkness Crystal).
   ===================================================================== */

/* Les jetons de la compilation en cours : une forme de remplacement qui
   crée un jeton en a besoin, et `formeRemplacement()` ne les reçoit pas. */
let JETONS_COURANTS = {};
definitionDepuisScript = (g => function (s, fiche, jetons) {
  const avant = JETONS_COURANTS;
  JETONS_COURANTS = jetons || avant;
  try { return g(s, fiche, jetons); } finally { JETONS_COURANTS = avant; }
})(definitionDepuisScript);

/* Ce qu'une forme a lu de sa chaîne, par face et par nom. */
const INFOS_REMP = new WeakMap();
function infoRemp(face, nom, f) {
  const m = INFOS_REMP.get(face) || new Map();
  INFOS_REMP.set(face, m);
  if (f !== undefined) m.set(nom, f);
  return m.get(nom);
}

/* Les formes de ce fichier, après celles de js/forgeRemplacementsC.js. */
formeRemplacementC = (g => function (face, r) { return g(face, r) || formeRemplacementD(face, r); })(formeRemplacementC);

function formeRemplacementD(face, r) {
  const w = r.ReplaceWith && forgeSousCapacite(face, r.ReplaceWith), api = w && forgeApi(w);
  const quantite = nom => w && api === 'ReplaceEffect' && w.VarName === nom && w.VarValue && !w.SubAbility;
  switch (r.Event) {
    case 'CreateToken': {
      if (!w || api !== 'ReplaceToken' || !/^(AddToken|ReplaceToken)$/.test(w.Type || '') || !w.TokenScript || w.SubAbility) return null;
      const defs = w.TokenScript.split(',').map(n => JETONS_COURANTS[n.trim()]);
      if (defs.some(d => !d)) return null;
      infoRemp(face, r.ReplaceWith, {genre: w.Type, defs, amount: w.Amount || null});
      return 'jetonsPlus';
    }
    case 'LifeReduced': return quantite('Amount') ? 'vieReduite' : null;
    case 'Mill': return quantite('Number') ? 'meule' : null;
    case 'Proliferate': return quantite('Num') ? 'proliferation' : null;
    case 'BeginTurn': return r.ExtraTurn === 'True' && r.Skip === 'True' && !r.ReplaceWith ? 'tourSaute' : null;
    case 'Moved': {
      if (r.Destination !== 'Graveyard' || !(r.ValidCard || r.ValidLKI) || !w || api !== 'ChangeZone' || w.Defined !== 'ReplacedCard' || w.Destination !== 'Exile' || !w.SubAbility) return null;
      const e = effetForge(face, forgeSousCapacite(face, w.SubAbility), JETONS_COURANTS);
      if (!e || e.cibles.length || e.modes) return null;
      infoRemp(face, r.ReplaceWith, {suite: e});
      return 'exilSuite';
    }
  }
  return null;
}

/* Les remplacements d'une forme qui valent pour ce joueur. */
function remplacementsPour(P, forme, j) {
  return remplacementsEnJeu(P).filter(x => x.r.forme === forme && (!x.r.t.ValidPlayer || forgeValideJoueur(P, j, x.r.t.ValidPlayer, x.src.ctrl, envRemplacement(x.src, x.r))));
}
/* Un nombre refait par la chaîne `ReplaceEffect` (`ReplaceCount$…`). */
function nombreRemplace(P, x, n) {
  const env = envRemplacement(x.src, x.r), w = forgeSousCapacite(x.r.face, x.r.t.ReplaceWith);
  env.ctx.remplace = {n};
  return Math.max(0, forgeNombre(P, w.VarValue, env));
}

/* —— Les jetons en plus ——————————————————————————————————————————————— */

/* Les jetons qu'un remplacement ajoute (« those tokens plus that many
   Squirrels », « plus an additional Treasure »), ou crée à la place
   (« that many 4/4 Angels instead », Academy Manufactor : « one of each »).
   Ils naissent du même évènement : la quantité (Doubling Season) ne repasse
   pas sur eux. Deux Academy Manufactor ne se composent pas —
   simplification annoncée. */
creeJetonsForge = (g => function* (P, defs, n0, qui, engage, env, retenir) {
  const rs = P._jetonsPlus ? [] : remplacementsEnJeu(P).filter(x => x.r.forme === 'jetonsPlus');
  if (!rs.length) return yield* g(P, defs, n0, qui, engage, env, retenir);
  const plus = [];
  for (const j of qui) for (const def of defs) {
    const n = quantiteRemplacee(P, 'CreateToken', n0, {def, j});
    let garde = true;
    for (const x of rs) {
      const t = x.r.t, env2 = envRemplacement(x.src, x.r), info = infoRemp(x.r.face, t.ReplaceWith);
      if (t.ValidPlayer && !forgeValideJoueur(P, j, t.ValidPlayer, x.src.ctrl, env2)) continue;
      if (t.ValidToken && !forgeValideDef(def, t.ValidToken, x.src.ctrl, j)) continue;
      if (info.genre === 'AddToken') plus.push({j, defs: info.defs, n: info.amount ? forgeNombre(P, info.amount, env2) : n});
      else { garde = false; plus.push({j, defs: info.defs, n}); }
    }
    if (garde) yield* g(P, [def], n0, [j], engage, env, retenir);
  }
  P._jetonsPlus = true;
  try { for (const p of plus) if (p.n > 0) yield* g(P, p.defs, p.n, [p.j], engage, env, retenir); }
  finally { P._jetonsPlus = false; }
})(creeJetonsForge);
quantiteRemplacee = (g => function (P, evenement, n, quoi) {
  return evenement === 'CreateToken' && P._jetonsPlus ? n : g(P, evenement, n, quoi);
})(quantiteRemplacee);

/* « If you would put one or more counters » (`ValidSource$ You`) : le
   contrôleur de la source, pas la source (js/forgeRemplacements.js
   `quantiteRemplacee()`). */
function sourceDeMarqueurs(P, v, s, h, env) {
  if (!v) return true;
  if (!s) return false;
  if (/^(You|Opponent|Player)$/.test(v)) return s.ctrl != null && forgeValideJoueur(P, s.ctrl, v, h.ctrl, env);
  return s.j != null ? forgeValideJoueur(P, s.j, v, h.ctrl, env) : forgeValideObjet(P, s, v, h, h.ctrl, env, true);
}

/* —— La vie perdue ———————————————————————————————————————————————————— */

/* Ce qu'un joueur perd vraiment (js/jeuOpsA.js, js/forgeEffetsB.js) :
   doublé pendant le tour de Bloodletter of Aclazotz, arrêté à 1 par Angel's
   Grace (`Result$ LT1`, « LimitMax.Difference »). Payer de la vie n'est
   pas une perte qu'on remplace. */
function vieReduite(P, j, n, degats) {
  if (n <= 0) return n;
  for (const x of remplacementsEnJeu(P)) {
    if (x.r.forme !== 'vieReduite') continue;
    const t = x.r.t, env = envRemplacement(x.src, x.r), J = P.joueurs[j];
    if ((t.IsDamage === 'True' && !degats) || !conditionForge(P, t, env)) continue;
    const m = /^(.*?)\.lifeGE(\d+)$/.exec(t.ValidPlayer || ''), vp = m ? m[1] : t.ValidPlayer;
    if ((m && J.vie < +m[2]) || (vp && !forgeValideJoueur(P, j, vp, x.src.ctrl, env))) continue;
    if (t.Result && !seuilForge(P, J.vie - n, t.Result, env)) continue;
    const w = forgeSousCapacite(x.r.face, t.ReplaceWith), expr = String(x.r.face.svars[w.VarValue] || w.VarValue);
    n = /LimitMax\.Difference$/.test(expr) ? Math.min(n, Math.max(0, J.vie - 1)) : nombreRemplace(P, x, n);
  }
  return n;
}

/* —— Le tour en plus, la meule, la prolifération ————————————————————— */

/* « If an opponent would begin an extra turn, that player skips that turn
   instead » (js/jeuPartie.js). */
function tourEnPlusSaute(P, j) {
  const ok = remplacementsPour(P, 'tourSaute', j).length > 0;
  if (ok) jn(P, `${P.joueurs[j].nom} saute son tour en plus`);
  return ok;
}

/* « They mill that many cards plus four instead ». */
FORGE_API.Mill.gen = (g => function* (P, t, env) {
  if (!remplacementsEnJeu(P).some(x => x.r.forme === 'meule')) return yield* g(P, t, env);
  const n0 = forgeNombre(P, t.NumCards || 1, env), dest = zoneForge(t.Destination) || 'cimetiere';
  for (const j of joueursForge(P, t, env)) {
    const n = remplacementsPour(P, 'meule', j).reduce((k, x) => nombreRemplace(P, x, k), n0), B = P.joueurs[j].bibliotheque;
    for (let k = 0; k < n && B.length; k++) { const nid = deplace(P, B[B.length - 1], dest); if (t.RememberMilled === 'True') retiensForge(env.ctx, nid); }
  }
})(FORGE_API.Mill.gen);

/* « If you would proliferate, proliferate twice instead ». */
OPS.prolifere = (g => function* (P, op, ctx) {
  const n = remplacementsPour(P, 'proliferation', ctx.ctrl).reduce((k, x) => nombreRemplace(P, x, k), 1);
  for (let k = 0; k < n; k++) yield* g(P, op, ctx);
})(OPS.prolifere);

/* —— L'exil au lieu du cimetière, avec une suite ————————————————————— */

/* « Instead exile it and you gain 2 life » : l'objet va en exil, la chaîne
   qui suit attend son tour (js/forgeRemplacementsC.js `P.suitesRemp`). */
destinationRemplacee = (g => function (P, o, depuis, vers) {
  if (vers === 'cimetiere') {
    for (const x of remplacementsEnJeu(P)) {
      if (x.r.forme !== 'exilSuite' || x.src.id === o.id) continue;
      const t = x.r.t;
      if (t.Origin && ZONES_FORGE[t.Origin] !== depuis) continue;
      if (!forgeValideObjet(P, o, t.ValidCard || t.ValidLKI, x.src, x.src.ctrl, envRemplacement(x.src, x.r), true)) continue;
      suiteRemplacement(P, infoRemp(x.r.face, t.ReplaceWith).suite.ops, ctxRemplacement(x.src, o, o, 0));
      return 'exil';
    }
  }
  return g(P, o, depuis, vers);
})(destinationRemplacee);

forgeSait('repl', 'LifeReduced', 'Mill', 'Proliferate', 'BeginTurn');
forgeSait('param', 'CreateToken.ValidPlayer', 'ReplaceToken.TokenScript', 'ReplaceCounter.ValidSource',
  'LifeReduced.ValidPlayer', 'LifeReduced.ReplaceWith', 'LifeReduced.ActiveZones', 'LifeReduced.Result', 'LifeReduced.IsDamage',
  'Mill.ActiveZones', 'Mill.ValidPlayer', 'Mill.ReplaceWith', 'Proliferate.ActiveZones', 'Proliferate.ValidPlayer', 'Proliferate.ReplaceWith',
  'BeginTurn.ActiveZones', 'BeginTurn.ValidPlayer', 'BeginTurn.ExtraTurn', 'BeginTurn.Skip');
forgeSait('expr', 'ReplaceCount$Amount', 'ReplaceCount$Number', 'ReplaceCount$Num');
forgeSait('filtre', 'lifeGE1');
