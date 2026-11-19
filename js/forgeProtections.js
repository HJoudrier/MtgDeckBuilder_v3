/* =====================================================================
   js/forgeProtections.js — Se protéger : de tout, de chaque couleur, d'une
   couleur au ciblage ; et une vie qui ne change plus

   Ce que demandaient Teferi's Protection, The One Ring, The Stasis Coffin,
   Akroma's Will, Eldritch Immunity, Veil of Summer, Flare of Fortitude
   (lot F60) :
   - `KW$ Protection from everything` sur un **joueur**, jusqu'à son
     prochain tour : on ne peut plus le cibler, et les dégâts qu'on lui
     inflige sont prévenus. Ce qu'on ne cible pas (« each player loses 1
     life ») l'atteint toujours, comme aux règles ;
   - `KW$ Protection from each color` sur des permanents, pour le tour : les
     cinq couleurs de `o.protTemp`, que lit déjà `ciblable()` ;
   - `KW$ Hexproof:Black` : le linceul d'une couleur, pour le tour, sur des
     permanents et des joueurs. Il n'arrête que les sources adverses de
     cette couleur ;
   - `Mode$ CantChangeLife` : la vie ne bouge plus, ni gagnée ni perdue.
   ===================================================================== */

const KW_PROTEGE_TOUT = 'protection from everything';
const KW_PROTEGE_COULEURS = 'protection from each color';
const KW_LINCEUL_COULEUR = /^hexproof:(white|blue|black|red|green)$/;

const motsCaches = t => String(t.KW || '').split('&').map(k => k.trim().toLowerCase());
const linceulsDe = t => motsCaches(t).map(k => KW_LINCEUL_COULEUR.exec(k)).filter(Boolean).map(m => COULEURS_ANGLAIS[m[1]]);

forgeSait('kwval', KW_PROTEGE_TOUT, KW_PROTEGE_COULEURS, ...Object.keys(COULEURS_ANGLAIS).map(c => 'hexproof:' + c));

/* —— Les joueurs ————————————————————————————————————————————————————— */

/* Un joueur est-il protégé de tout en ce moment ? « Until your next turn »
   tient jusqu'au début du prochain tour de celui qui l'a posé. */
function joueurProtegeTout(P, j) {
  const p = P.joueurs[j].protTout;
  /* Teferi's Reproach : une statique d'effet, « Affected$ You | AddKeyword$ Protection from everything ». */
  if (!p) return !!statiqueQui(P, 'Continuous', (t, src, env) => /^Protection from everything$/i.test(t.AddKeyword || '') && t.Affected === 'You' &&
    !t.AffectedZone && joueurStatique(P, j, 'You', src, env));
  return p.fin === 'tour' ? P.tour === p.tour : !(P.actif === p.par && P.tour > p.tour);
}

/* Un joueur est-il à l'abri de cette source (de ses couleurs) ? */
function joueurLinceulDe(P, j, ctrl, couleurs) {
  const h = P.joueurs[j].hexTemp;
  return !!h && h.length > 0 && j !== ctrl && !!couleurs && h.some(k => couleurs.includes(k));
}

/* Les joueurs qu'une pompe désigne : ses cibles, ou ce que `Defined$` nomme. */
function joueursPompe(P, t, env) {
  const l = env.op && env.op.slot != null ? ciblesForge(P, env, false) : forgeDefinis(P, t.Defined || 'Self', env);
  return l.filter(x => x && x.j != null).map(x => x.j);
}

FORGE_API.Pump.gen = (g => function* (P, t, env) {
  const mots = motsCaches(t), lin = linceulsDe(t);
  if (mots.includes(KW_PROTEGE_TOUT) || lin.length) {
    const fd = finForge(t, env) || {fin: 'tour'};
    joueursPompe(P, t, env).forEach(j => {
      const J = P.joueurs[j];
      if (mots.includes(KW_PROTEGE_TOUT)) J.protTout = {par: env.ctrl, tour: P.tour, fin: fd.fin === 'prochainTour' ? 'prochain' : 'tour'};
      if (lin.length) J.hexTemp = [...(J.hexTemp || []), ...lin];
      P.ver++;
    });
  }
  yield* g(P, t, env);
})(FORGE_API.Pump.gen);

/* Pas ciblable : un joueur protégé de tout, ou à l'abri d'une couleur. */
ciblesLegales = (g => function (P, slot, src, ctrl, couleurs) {
  return g(P, slot, src, ctrl, couleurs).filter(c => !(c && typeof c === 'object' && c.j != null &&
    (joueurProtegeTout(P, c.j) || joueurLinceulDe(P, c.j, ctrl, couleurs))));
})(ciblesLegales);
cibleEncoreLegale = (g => function (P, cand, slot, src, ctrl, couleurs) {
  if (cand && typeof cand === 'object' && cand.j != null && (joueurProtegeTout(P, cand.j) || joueurLinceulDe(P, cand.j, ctrl, couleurs))) return false;
  return g(P, cand, slot, src, ctrl, couleurs);
})(cibleEncoreLegale);

degatsApresPrevention = (g => function (P, src, cible, n, combat) {
  return cible && cible.j != null && joueurProtegeTout(P, cible.j) ? 0 : g(P, src, cible, n, combat);
})(degatsApresPrevention);

/* —— Les permanents ————————————————————————————————————————————————— */

/* La protection de chaque couleur, et le linceul d'une couleur, jusqu'à la
   fin du tour. Le nettoyage (js/jeuTour.js) les défait. */
pompeForge = (g => function (P, objets, t, env) {
  const mots = motsCaches(t), lin = linceulsDe(t);
  if (mots.includes(KW_PROTEGE_COULEURS) || lin.length) {
    objets.filter(o => o.zone === 'champ' && !o.lki).forEach(o => {
      if (mots.includes(KW_PROTEGE_COULEURS)) o.protTemp = [...(o.protTemp || []), 'W', 'U', 'B', 'R', 'G'];
      if (lin.length) o.hexTemp = [...(o.hexTemp || []), ...lin];
      P.ver++;
    });
  }
  return g(P, objets, t, env);
})(pompeForge);

ciblable = (g => function (P, o, ctrl, couleurs, src) {
  if (o.zone === 'champ' && o.hexTemp && o.hexTemp.length && o.ctrl !== ctrl && couleurs && o.hexTemp.some(k => couleurs.includes(k))) return false;
  return g(P, o, ctrl, couleurs, src);
})(ciblable);

/* —— Une vie qui ne change plus ———————————————————————————————————— */

forgeStatique('CantChangeLife', ['ValidPlayer'], () => {});

function vieFigee(P, j) { return !!statiqueQui(P, 'CantChangeLife', (t, src, env) => joueurStatique(P, j, t.ValidPlayer, src, env)); }

vieBloquee = (g => function (P, j) { return g(P, j) || vieFigee(P, j); })(vieBloquee);
vieReduite = (g => function (P, j, n, degats) { return n > 0 && vieFigee(P, j) ? 0 : g(P, j, n, degats); })(vieReduite);
