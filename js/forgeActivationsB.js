/* =====================================================================
   js/forgeActivationsB.js — Compter les activations du tour

   Lot F86 :
   - `Count$ThisTurnActivated_Activated.<filtre>` (Bruenor Battlehammer, Kíli,
     The Chain Veil, Forge Anew) : les capacités activées ce tour. Chaque
     activation — et chaque équipement — se note dans l'historique du tour
     (js/jeuHistorique.js) ; le filtre lit le genre (`Equip`, `Loyalty`), le
     type de la source (`Planeswalker`, `Artifact`, `Creature`) et qui l'a
     activée (`YouCtrl`, `OppCtrl`). Un filtre plus fin (`IsTargeting…`) n'est
     pas jugé : le compte vaut alors zéro, jamais plus ;
   - `NumLoyaltyAct` (Oath of Teferi, The Chain Veil, Kaito) : une capacité de
     loyauté de plus par tour, `Twice$ True` ou `Additional$ N` ;
   - `Taps | ValidActivatingPlayer$` (Tezzeret) : qui engage — le contrôleur du
     permanent, ici.
   ===================================================================== */

forgeSait('expr', 'Count$ThisTurnActivated');

exprEtendue = (g => function (P, tete, q, env) {
  const k = /^ThisTurnActivated_Activated\.(.+)$/.exec(tete === 'Count' ? q : '');
  if (!k) return g(P, tete, q, env);
  const jetons = k[1].split('+').map(x => x.trim()), ctrl = env.ctrl;
  const connus = /^(Equip|Loyalty|YouCtrl|OppCtrl|Planeswalker|Artifact|Creature|inZoneBattlefield)$/;
  if (!jetons.every(x => connus.test(x))) return 0;
  return (histoire(P).activations || []).filter(a => jetons.every(x => {
    const types = (a.lki && a.lki.types) || (obj(P, a.id) && obj(P, a.id).def.types) || [];
    switch (x) {
      case 'Equip': return !!a.equip;
      case 'Loyalty': return !!a.loyaute;
      case 'YouCtrl': return a.joueur === ctrl;
      case 'OppCtrl': return a.joueur !== ctrl;
      case 'Planeswalker': case 'Artifact': case 'Creature': return types.includes(x.toLowerCase());
      default: return true;
    }
  })).length;
})(exprEtendue);

/* —— Des capacités de loyauté de plus —————————————————————————————— */

forgeStatique('NumLoyaltyAct', ['ValidCard', 'Twice', 'Additional'], () => {});

/* Combien de capacités de loyauté ce planeswalker peut-il activer ce tour ? */
function loyautesPermises(P, o) {
  let n = 1;
  for (const x of statiquesMode(P, 'NumLoyaltyAct')) {
    const t = x.s.t, env = envStatique(x.src, x.s);
    if (!conditionForge(P, t, env) || !objetOuRien(P, o, t.ValidCard === 'Card.EffectSource' ? undefined : t.ValidCard, x.src, env)) continue;
    n += t.Twice === 'True' ? 1 : t.Additional ? forgeNombre(P, t.Additional, env) : 0;
  }
  return n;
}

const cleLoyaute = (o, k) => o.id + (k ? '|loyaute' + (k + 1) : '|loyaute');

/* A-t-il épuisé ses activations de loyauté ? */
function loyauteEpuisee(P, o) {
  const n = loyautesPermises(P, o);
  for (let k = 0; k < n; k++) if (!P.unefois.has(cleLoyaute(o, k))) return false;
  return true;
}

/* Une activation de loyauté de plus a eu lieu. */
function noteLoyaute(P, o) {
  for (let k = 0; ; k++) if (!P.unefois.has(cleLoyaute(o, k))) { P.unefois.add(cleLoyaute(o, k)); return; }
}

/* —— Qui engage ——————————————————————————————————————————————— */

FORGE_MODES.Taps = (juge => function (P, t, e, s, env) {
  return juge(P, t, e, s, env) && (!t.ValidActivatingPlayer || joueurOuRien(P, e.ctrl, t.ValidActivatingPlayer, s, env));
})(FORGE_MODES.Taps);
forgeSait('param', 'Taps.ValidActivatingPlayer');

/* —— Équiper pour {0}, et à vitesse d'éclair ————————————————————————— */

/* `AlternativeCost | ValidSA$ Activated.Equip | Cost$ 0` (Bruenor Battlehammer, Forge Anew) et
   `CastWithFlash | ValidSA$ Activated.Equip` : les deux se lisent ici. Une condition inconnue (« an enduring
   story », Kíli) la rend fausse, et la statique ne sert à rien. */
statiqueTenable = (g => function (t) {
  if (t.Mode === 'AlternativeCost' && t.ValidSA === 'Activated.Equip' && t.Cost === '0') return true;
  if (t.Mode === 'CastWithFlash' && t.ValidSA === 'Activated.Equip') return true;
  return g(t);
})(statiqueTenable);

coutEquipement = (g => function (P, j, o) {
  const alt = statiqueQui(P, 'AlternativeCost', (t, src, env) => t.ValidSA === 'Activated.Equip' && t.Cost === '0' && joueurStatique(P, j, t.ValidPlayer, src, env));
  return alt ? coutManaVide() : g(P, j, o);
})(coutEquipement);

/* Peut-on équiper maintenant, hors d'une phase principale ? */
function equipEclair(P, j, o) {
  return !!statiqueQui(P, 'CastWithFlash', (t, src, env) => t.ValidSA === 'Activated.Equip' && joueurStatique(P, j, t.Caster, src, env));
}
