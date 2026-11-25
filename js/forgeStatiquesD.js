/* =====================================================================
   js/forgeStatiquesD.js — Des statiques que le moteur ne connaissait pas

   Lot F83 :
   - `ActivateAbilityAsIfHaste` (Thousand-Year Elixir, Tyvar) : les capacités
     d'une créature qui exigent {T} s'activent dès son arrivée ;
   - `IgnoreLegendRule` (Mirror Box, Cadric, Hall of Echoes) : la règle des
     légendes ne s'applique pas aux permanents désignés ;
   - `CantSacrifice` (Angel of Jubilation, Quark, Hithlain Rope) : on ne peut
     pas sacrifier ce que la statique désigne — payer un coût, ou toute autre
     façon si elle n'est pas « `ForCost$ True` » ;
   - `AttackRestrict` (Crawlspace, Mirri, The Eternal Wanderer) : au plus N
     créatures attaquent un défenseur par combat ;
   - `IgnoreHexproof` (Detection Tower) : ce que la statique désigne se cible
     comme s'il n'avait pas de défense talismanique.
   ===================================================================== */

/* —— Activer comme si elle avait la célérité ——————————————————————— */

forgeStatique('ActivateAbilityAsIfHaste', ['ValidCard'], () => {});

peutEngagerSoi = (g => function (P, o) {
  if (g(P, o)) return true;
  if (o.engage || o.zone !== 'champ' || !estCreature(o)) return false;
  return !!statiqueQui(P, 'ActivateAbilityAsIfHaste', (t, src, env) => objetOuRien(P, o, t.ValidCard, src, env));
})(peutEngagerSoi);

/* —— La règle des légendes —————————————————————————————————————— */

forgeStatique('IgnoreLegendRule', ['ValidCard'], () => {});

/* La règle des légendes laisse-t-elle ce permanent tranquille ? (js/jeuEtatsDeJeu.js) */
function legendeIgnoree(P, o) {
  return !!statiqueQui(P, 'IgnoreLegendRule', (t, src, env) => objetOuRien(P, o, t.ValidCard, src, env));
}

/* —— Ne pas sacrifier ———————————————————————————————————————————— */

forgeStatique('CantSacrifice', ['ValidCard', 'ValidCause', 'ForCost'], () => {});

/* Ce permanent ne peut-il pas être sacrifié ? `pourCout` : c'est pour payer un coût. Une statique « pour les
   coûts seulement » (`ForCost$ True`) ne vaut que là, et inversement « `ForCost$ False` » ; une cause précise
   (« les sorts et capacités d'un adversaire », Tamiyo) n'est pas lue : la statique ne retient alors rien —
   jamais plus de garde que la carte n'en donne. */
function sacrificeInterdit(P, o, pourCout) {
  return !!statiqueQui(P, 'CantSacrifice', (t, src, env) => {
    if (t.ForCost === 'True' && !pourCout) return false;
    if (t.ForCost === 'False' && pourCout) return false;
    if (t.ValidCause && !/^(Spell|Activated|Spell,Activated|Activated,Spell)$/.test(t.ValidCause)) return false;
    return objetOuRien(P, o, t.ValidCard, src, env);
  });
}

sacrifie = (g => function (P, id) {
  const o = obj(P, id);
  if (o && o.zone === 'champ' && sacrificeInterdit(P, o, false)) return;
  return g(P, id);
})(sacrifie);

/* —— Au plus N attaquants par défenseur ———————————————————————————— */

forgeStatique('AttackRestrict', ['MaxAttackers', 'ValidDefender'], () => {});

/* Le défenseur désigné par la statique : un joueur (`You`) ou une carte (`Card.Self`). */
function defenseurRestreint(P, d, t, src, env) {
  if (!t.ValidDefender) return true;
  return d.j != null ? joueurStatique(P, d.j, t.ValidDefender, src, env) : objetOuRien(P, obj(P, d.pw), t.ValidDefender, src, env);
}

/* Les attaques déclarées, ramenées à ce que les restrictions permettent : les premières, dans l'ordre où
   l'attaquant les a déclarées, restent. `choisis` : id d'attaquant → défenseur. */
function limiteAttaquants(P, choisis) {
  for (const x of statiquesMode(P, 'AttackRestrict')) {
    const env = envStatique(x.src, x.s), t = x.s.t;
    if (!conditionForge(P, t, env)) continue;
    const max = forgeNombre(P, t.MaxAttackers, env), pris = new Map();
    for (const [id, d] of [...choisis]) {
      if (!defenseurRestreint(P, d, t, x.src, env)) continue;
      const cle = d.j != null ? 'j' + d.j : 'p' + d.pw;
      pris.set(cle, (pris.get(cle) || 0) + 1);
      if (pris.get(cle) > max) choisis.delete(id);
    }
  }
}

forgeStatique('DisableTriggers', ['ValidCause', 'ValidMode', 'Destination', 'ValidCard'], () => {});

/* —— Au plus N bloqueurs ————————————————————————————————————————— */

forgeStatique('BlockRestrict', ['MaxBlockers', 'ValidDefender'], () => {});

/* Le défenseur `d` ne peut-il plus poser de bloqueur ? Sans `ValidDefender$`, la limite vaut pour tout le
   combat (Silent Arbiter) ; avec, pour les bloqueurs du défenseur désigné (Mirri). */
function blocageRestreint(P, cb, d) {
  return !!statiqueQui(P, 'BlockRestrict', (t, src, env) => {
    if (t.ValidDefender && !joueurStatique(P, d, t.ValidDefender, src, env)) return false;
    const n = [...cb.bloqueurs.keys()].filter(b => !t.ValidDefender || (obj(P, b) && obj(P, b).ctrl === d)).length;
    return n >= forgeNombre(P, t.MaxBlockers, env);
  });
}

/* —— Ne pas payer de vie ———————————————————————————————————————— */

forgeStatique('CantPayLife', ['ValidPlayer', 'ValidCause', 'ForCost'], () => {});

/* `j` ne peut-il pas payer de vie pour un coût ? (Angel of Jubilation) */
function payerVieInterdit(P, j, capaciteDeMana) {
  /* `ValidCause$ Spell,Activated.!ManaAbility` (Karn's Sylex) : une capacité de mana peut encore payer de la vie. */
  return !!statiqueQui(P, 'CantPayLife', (t, src, env) => t.ForCost !== 'False' && joueurStatique(P, j, t.ValidPlayer, src, env) &&
    !(capaciteDeMana && /^Spell,Activated\.!ManaAbility$/.test(t.ValidCause || '')));
}

/* —— Un sort qui nous vise coûte de la vie ————————————————————————— */

/* `RaiseCost | ValidTarget$ Card.Self | Activator$ Player.Opponent | Cost$ PayLife<3>` (Terror of the Peaks) : un
   sort qui vise ce permanent coûte de la vie de plus à son lanceur. Lu avec la garde non-mana des permanents ciblés
   (js/jeuCoutsX.js `gardeAutre()`), à qui elle s'ajoute. */
const hausseVieTenable = t => !!t.ValidTarget && /^PayLife<\d+>$/.test(t.Cost || '') && (!t.Type || t.Type === 'Spell');

gardeAutre = (g => function (P, j, effets) {
  let r = g(P, j, effets);
  const cibles = [].concat(...effets.map(ef => [].concat(...ef.cibles))).map(c => typeof c === 'number' ? obj(P, c) : c).filter(Boolean);
  if (!cibles.length) return r;
  for (const x of statiquesMode(P, 'RaiseCost')) {
    const t = x.s.t;
    if (!hausseVieTenable(t)) continue;
    const env = envStatique(x.src, x.s);
    if (!conditionForge(P, t, env) || (t.Activator && !joueurStatique(P, j, t.Activator, x.src, env))) continue;
    if (!cibles.some(c => c.j != null ? forgeValideJoueur(P, c.j, t.ValidTarget, x.src.ctrl, env) : forgeValideObjet(P, c, t.ValidTarget, x.src, x.src.ctrl, env, true))) continue;
    r = {...(r || {}), vie: ((r || {}).vie || 0) + +/\d+/.exec(t.Cost)[0]};
  }
  return r;
})(gardeAutre);

/* « Mana abilities of ~ cost an additional 1 life to activate » (Thran Portal) : une hausse de vie sur les capacités de mana
   du permanent lui-même. */
const hausseManaVieTenable = t => t.Type === 'Ability' && t.ValidSpell === 'Activated.ManaAbility' && t.ValidCard === 'Card.Self' && /^PayLife<\d+>$/.test(t.Cost || '') &&
  (!t.EffectZone || t.EffectZone === 'All' || t.EffectZone === 'Battlefield');

/* Le coût d'une capacité de mana de cet objet, vie en plus s'il y a lieu (js/jeuMana.js `sourcesMana()`). */
function coutManaSup(P, o, c) {
  let n = 0;
  for (const x of statiquesMode(P, 'RaiseCost')) {
    const t = x.s.t;
    if (!hausseManaVieTenable(t) || x.src.id !== o.id || !conditionForge(P, t, envStatique(x.src, x.s))) continue;
    n += +/\d+/.exec(t.Cost)[0];
  }
  return n ? {...c, vie: (c.vie || 0) + n} : c;
}

forgeSait('param', 'RaiseCost.Activator', 'RaiseCost.Type', 'RaiseCost.ValidSpell');
forgeSait('param', 'Continuous.MayPlayText');

/* —— Cibler malgré la défense talismanique ———————————————————————— */

forgeStatique('IgnoreHexproof', ['Activator', 'ValidEntity'], () => {});

/* Qui cible (`ctrl`) peut-il ignorer la défense talismanique de cet objet ? Seuls les objets sont jugés : le linceul d'un joueur
   ne vient que d'effets d'un tour (js/forgeProtections.js), que cette statique ne touche pas. */
function hexproofIgnore(P, o, ctrl) {
  return !!statiqueQui(P, 'IgnoreHexproof', (t, src, env) => (!t.Activator || joueurStatique(P, ctrl, t.Activator, src, env)) &&
    objetOuRien(P, o, t.ValidEntity, src, env));
}
