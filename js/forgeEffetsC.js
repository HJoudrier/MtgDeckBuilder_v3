/* =====================================================================
   js/forgeEffetsC.js — Les effets de Forge : pompes, engagements, mana,
   combats, attaches, contrôle, mémoire, déclencheurs réflexes

   Suite de js/forgeEffetsB.js. Les modes (`Charm`) ne s'exécutent pas
   ici : ils se choisissent au lancement, comme ceux du compilateur
   d'oracle (js/forgeDefinition.js).
   ===================================================================== */

/* Les mots-clés d'un `KW$ Flying & Trample`, en bits. Un mot-clé que le
   moteur ne connaît pas est laissé de côté — mais la couverture le compte
   comme manquant (`kwval:`, js/forgeCouverture.js), pour qu'une carte ne
   passe pas pour complète en perdant une partie de son texte. */
function motsForge(kw) {
  return String(kw || '').split('&').reduce((m, k) => m | (MOTS_ANGLAIS[k.trim().toLowerCase()] || 0), 0);
}

/* « HIDDEN This card doesn't untap during your next untap step. » (Hands of
   Binding) : un mot-clé caché que Forge pose en `KW$`. Le moteur en fait le
   drapeau d'un permanent exercé, que l'étape de dégagement consomme
   (js/jeuTour.js `degagement()`). */
const KW_SANS_DEGAGER = "hidden this card doesn't untap during your next untap step.";
/* « HIDDEN CARDNAME must be blocked if able. » (Anzrag, the Quake-Mole) : la
   même règle que celle de la statique ou du mot-clé de la carte, mais posée
   pour le tour. Elle se range dans le bonus lui-même (`m.doitEtreBloque`), que
   `bloqueursImposes()` lit avec les autres sources de cette obligation, et
   tombe avec lui au nettoyage. */
const KW_DOIT_ETRE_BLOQUE = 'hidden cardname must be blocked if able.';

/* Les autres mots-clés cachés qu'une pompe pose pour la durée : des
   interdictions et des obligations de combat, que `car()` et
   `bloqueursImposes()` lisent dans le bonus. « Can't block » : cent seize
   scripts. */
const CACHES_DU_TOUR = {
  [KW_DOIT_ETRE_BLOQUE]: {doitEtreBloque: true},
  "hidden cardname can't block.": {nePeutBloquer: true},
  "hidden cardname can't attack.": {nePeutAttaquer: true},
  "hidden cardname can't attack or block.": {nePeutAttaquer: true, nePeutBloquer: true},
  'hidden all creatures able to block cardname do so.': {leurre: true}
};
forgeSait('kwval', ...Object.keys(MOTS_ANGLAIS), KW_SANS_DEGAGER, ...Object.keys(CACHES_DU_TOUR), 'flashback');

/* Un `+3` ou un `-X` de Forge, pour l'IA. */
function bonusIA(v) { const s = String(v == null ? '0' : v); return /^[+-]?\d+$/.test(s) ? +s : /^-/.test(s) ? -2 : 2; }

/* Poser un bonus sur des objets du champ. */
function pompeForge(P, objets, t, env) {
  const f = forgeNombre(P, t.NumAtt || 0, env), e = forgeNombre(P, t.NumDef || 0, env), mots = motsForge(t.KW);
  const vivants = objets.filter(o => o.zone === 'champ' && !o.lki);
  /* Ne pas se dégager est un drapeau, pas un bonus : rien à poser en plus. */
  const sansDegager = String(t.KW || '').split('&').some(k => k.trim().toLowerCase() === KW_SANS_DEGAGER);
  if (sansDegager) vivants.forEach(o => { o.exerce = true; P.ver++; });
  if (sansDegager && !mots && !f && !e) return;
  const drapeaux = Object.assign({}, ...String(t.KW || '').split('&').map(k => CACHES_DU_TOUR[k.trim().toLowerCase()]).filter(Boolean));
  /* La durée (js/forgeDurees.js) ; une durée qu'on ne sait pas tenir finit au nettoyage. */
  const fd = finForge(t, env) || {fin: 'tour'};
  if (fd.fin === 'hote') P.hotesSuivis = true;
  vivants.forEach(o => { o.mods.push({f, e, mots, ...drapeaux, ...fd}); P.ver++; });
}

forgeEffet('Pump', ['NumAtt', 'NumDef', 'KW', 'Duration', 'PumpZone'], function* (P, t, env) {
  /* Le flashback accordé à une carte du cimetière (js/forgeRemplacementsB.js). */
  if (t.PumpZone === 'Graveyard') { objetsForge(P, t, env).filter(o => o.zone === 'cimetiere').forEach(o => { o.flashbackTemp = P.tour; }); return; }
  pompeForge(P, objetsForge(P, t, env), t, env);
},
  (t, op) => {
    op.op = 'pompe'; op.f = bonusIA(t.NumAtt); op.e = bonusIA(t.NumDef); op.mots = motsForge(t.KW);
    op.a = op.slot != null ? {cible: op.slot} : {soi: 1}; op.hostile = op.f < 0 || op.e < 0;
    op.impose = String(t.KW || '').split('&').some(k => k.trim().toLowerCase() === KW_DOIT_ETRE_BLOQUE);
    op.hostile = op.hostile || String(t.KW || '').split('&').some(k => /can't (attack|block)/i.test(k));
  }, {prepare: t => !t.PumpZone || t.PumpZone === 'Battlefield' || (t.PumpZone === 'Graveyard' && t.KW === 'Flashback' && !t.NumAtt && !t.NumDef)});

forgeEffet('PumpAll', ['ValidCards', 'NumAtt', 'NumDef', 'KW', 'Duration'], function* (P, t, env) {
  pompeForge(P, objetsZone(P, 'champ').filter(o => forgeValideObjet(P, o, t.ValidCards || 'Creature', env.src, env.ctrl, env)), t, env);
}, (t, op) => { op.op = 'pompe'; op.f = bonusIA(t.NumAtt); op.e = bonusIA(t.NumDef); op.hostile = false; });

forgeEffet('Tap', [], function* (P, t, env) { objetsForge(P, t, env).filter(o => o.zone === 'champ' && !o.lki).forEach(o => engageObjet(P, o)); },
  (t, op) => { op.op = 'engage'; op.a = op.slot != null ? {cible: op.slot} : {soi: 1}; op.hostile = op.slot != null; });
forgeEffet('Untap', [], function* (P, t, env) { objetsForge(P, t, env).filter(o => o.zone === 'champ' && !o.lki).forEach(o => degageObjet(P, o)); },
  (t, op) => { op.op = 'degage'; op.a = op.slot != null ? {cible: op.slot} : {soi: 1}; op.hostile = false; });
/* Engager ou dégager : l'IA engage ce qui est à l'adversaire et dégage ce
   qui est à elle. */
forgeEffet('TapOrUntap', [], function* (P, t, env) {
  for (const o of objetsForge(P, t, env).filter(x => x.zone === 'champ' && !x.lki)) {
    const i = yield* choisitUn(P, env.ctrl, ['Engager', 'Dégager'], `${o.def.nom} : engager ou dégager ?`, o.ctrl === env.ctrl ? 1 : 0, env.ctx.source);
    if (i === 0) engageObjet(P, o); else degageObjet(P, o);
  }
}, (t, op) => { op.op = 'engage'; op.a = op.slot != null ? {cible: op.slot} : {soi: 1}; op.hostile = op.slot != null; });
forgeEffet('TapAll', ['ValidCards'], function* (P, t, env) {
  objetsZone(P, 'champ').filter(o => forgeValideObjet(P, o, t.ValidCards || 'Creature', env.src, env.ctrl, env)).forEach(o => engageObjet(P, o));
}, (t, op) => { op.op = 'forge'; op.hostile = false; });
forgeEffet('UntapAll', ['ValidCards'], function* (P, t, env) {
  objetsZone(P, 'champ').filter(o => forgeValideObjet(P, o, t.ValidCards || 'Permanent.YouCtrl', env.src, env.ctrl, env)).forEach(o => degageObjet(P, o));
}, (t, op) => { op.op = 'forge'; op.hostile = false; });

/* Les options d'un `Produced$` : `G`, `C`, `Combo W U`, `Any`, `W W`. */
function optionsMana(produit, montant) {
  const p = String(produit || '').trim(), n = Math.max(1, montant || 1);
  if (p === 'Any' || p === 'Combo Any') return ['W', 'U', 'B', 'R', 'G'].map(k => k.repeat(n));
  /* « Two mana of different colors » : chaque combinaison de n couleurs. */
  if (p === 'Combo AnyDifferent') return combinaisons(['W', 'U', 'B', 'R', 'G'], Math.min(n, 5)).map(l => l.join(''));
  const m = /^Combo (.+)$/.exec(p);
  /* « Add {B}{B}, {B}{G} or {G}{G} » (un terrain-filtre) : chaque mana se choisit, le mélange en est un. */
  if (m) { const ls = m[1].split(/\s+/).filter(k => /^[WUBRGC]$/.test(k)); return ls.length > 1 && n > 1 ? multiensembles(ls, n).map(l => l.join('')) : ls.map(k => k.repeat(n)); }
  const lettres = p.split(/\s+/).filter(k => /^[WUBRGC]$/.test(k));
  return lettres.length ? [lettres.join('').repeat(n)] : [];
}

/* Les façons de tirer k éléments de l, répétitions permises, sans compter l'ordre. */
function multiensembles(l, k) {
  if (!k) return [[]];
  return l.flatMap((x, i) => multiensembles(l.slice(i), k - 1).map(r => [x, ...r]));
}

function combinaisons(l, k) {
  if (!k) return [[]];
  return l.flatMap((x, i) => combinaisons(l.slice(i + 1), k - 1).map(r => [x, ...r]));
}

/* « Whenever a land is tapped for mana, its controller adds one mana of
   any type that land produced » (Mana Flare) : le déclencheur monte sur
   la pile, simplification annoncée ; le mana produit vient de l'évènement
   (js/jeuGestes.js `engageObjet()`). */
forgeEffet('ManaReflected', [], function* (P, t, env) {
  const e = env.ctx.evt || {}, j = joueursForge(P, t, env)[0];
  if (j != null && typeof e.mana === 'string' && e.mana) ajouteMana(P, j, e.mana[0]);
}, (t, op) => { op.op = 'forge'; op.hostile = false; }, {prepare: t => t.ReflectProperty === 'Produced' && t.ColorOrType === 'Type' && !!t.Defined});

forgeEffet('Mana', ['Produced', 'Amount', 'RestrictValid'], function* (P, t, env) {
  const opts = optionsMana(t.Produced, forgeNombre(P, t.Amount || 1, env));
  if (!opts.length) return;
  /* Une couleur au choix : celle que la main réclame le plus. */
  const J = P.joueurs[env.ctrl], voulu = k => J.main.reduce((s, id) => s + ((obj(P, id).def.cout.couleurs || {})[k[0]] || 0), 0);
  ajouteMana(P, env.ctrl, opts.slice().sort((a, b) => voulu(b) - voulu(a))[0]);
}, (t, op) => { op.op = 'mana'; op.options = optionsMana(t.Produced, 1); op.hostile = false; });

forgeEffet('Fight', [], function* (P, t, env) {
  const miens = t.Defined ? forgeDefinis(P, t.Defined, env) : [];
  const leurs = env.op.slot != null ? ciblesForge(P, env, false) : [];
  const tous = [...miens, ...leurs].filter(o => o && o.j == null && !o.lki && o.zone === 'champ' && estCreature(o));
  if (tous.length < 2 || tous[0].id === tous[1].id) return;
  const [a, b] = tous;
  infligeDegats(P, a, b, car(P, a).force, false);
  infligeDegats(P, b, a, car(P, b).force, false);
}, (t, op) => { op.op = 'degats'; op.n = 2; op.a = op.slot != null ? {cible: op.slot} : null; op.hostile = op.slot != null; });

forgeEffet('Attach', ['Object'], function* (P, t, env) {
  /* `Object$` : ce qu'on attache ; sinon la source. L'hôte : la cible,
     sinon ce que `Defined$` désigne. */
  const s = forgeDefinis(P, t.Object || (env.op.slot != null ? t.Defined || 'Self' : 'Self'), env)[0];
  const h = env.op.slot != null ? ciblesForge(P, env, false)[0] : t.Object || t.Defined ? forgeDefinis(P, t.Defined || 'Self', env)[0] : null;
  if (!s || s.lki || s.zone !== 'champ' || !h || h.j != null || h.zone !== 'champ') return;
  s.att = h.id;
  P.ver++;
}, (t, op) => { op.op = 'forge'; op.hostile = false; });

/* Prendre le contrôle — pour toujours, ou jusqu'à la fin du tour
   (« Threaten ») : le contrôleur d'avant revient au nettoyage
   (js/jeuDurees.js `finDuTour()`). */
forgeEffet('GainControl', ['NewController', 'LoseControl', 'Untap', 'AddKWs'], function* (P, t, env) {
  const j = t.NewController ? forgeDefinis(P, t.NewController, env).map(x => joueurDe(x))[0] : env.ctrl;
  if (j == null) return;
  (t._ids ? t._ids.map(id => obj(P, id)).filter(Boolean) : objetsForge(P, t, env, 'Targeted')).filter(o => o.zone === 'champ' && !o.lki).forEach(o => {
    if (t.LoseControl === 'EOT' && o.ctrlRendu == null) o.ctrlRendu = o.ctrl;
    o.ctrl = j; o.pret = false;
    if (t.Untap === 'True') degageObjet(P, o);
    if (t.AddKWs) o.mods.push({f: 0, e: 0, mots: motsForge(t.AddKWs), fin: 'tour'});
    P.ver++;
  });
}, (t, op) => { op.op = 'exile'; op.a = op.slot != null ? {cible: op.slot} : null; op.hostile = op.slot != null; },
{prepare: t => !t.LoseControl || t.LoseControl === 'EOT'});

forgeEffet('Cleanup', ['ClearRemembered', 'ClearImprinted', 'ClearChosenCard', 'ClearChosenType', 'ClearChosenColor',
  'ForgetDefined', 'ClearTriggered'], function* (P, t, env) {
  if (t.ClearRemembered === 'True') { env.ctx.memo.length = 0; env.ctx.memoJ.length = 0; }
  if (t.ForgetDefined) forgeDefinis(P, t.ForgetDefined, env).forEach(x => {
    const i = env.ctx.memo.indexOf(x.id);
    if (i >= 0) env.ctx.memo.splice(i, 1);
  });
}, (t, op) => { op.op = 'rien'; op.hostile = false; });

forgeEffet('Investigate', ['Num'], function* (P, t, env) {
  const def = (env.op.jetons || {}).c_a_clue_draw;
  if (def) yield* creeJetonsForge(P, [def], forgeNombre(P, t.Num || 1, env), [env.ctrl], false, env, false);
}, (t, op) => { op.op = 'jetons'; op.n = 1; op.hostile = false; op._def = (op.jetons || {}).c_a_clue_draw || {types: ['artifact'], mots: 0, capacites: [], statiques: [], mv: 0}; });

/* Un déclencheur réflexe (« when you do, … ») : il va en attente, et
   monte sur la pile au prochain passage de priorité. */
forgeEffet('ImmediateTrigger', ['Execute', 'RememberObjects'], function* (P, t, env) {
  const effet = effetForge(env.op.face, forgeSousCapacite(env.op.face, t.Execute), env.op.jetons);
  if (!effet) return;
  const s = env.src;
  P.enAttente.push({src: s ? s.id : null, lki: s && s.lki ? s : null, ctrl: env.ctrl,
    cap: {genre: 'declenchee', effet, texte: t.SpellDescription || t.TriggerDescription || ''}, evt: env.ctx.evt});
}, (t, op) => { op.op = 'forge'; op.hostile = false; });

/* Les modes : choisis au lancement (js/forgeDefinition.js), jamais
   exécutés comme un effet. */
forgeEffet('Charm', ['Choices', 'CharmNum', 'MinCharmNum', 'ChoiceRestriction'], function* () {}, (t, op) => { op.op = 'rien'; op.hostile = false; });
