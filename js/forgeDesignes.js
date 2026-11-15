/* =====================================================================
   js/forgeDesignes.js — Désigner, filtrer, choisir parmi

   Ce qui manquait à quelques cartes demandées :
   - « each other creature » (Chandra's Ignition) : `NotDefinedTargeted`,
     un filtre qui écarte ce qu'une désignation nomme ;
   - une désignation filtrée, `Remembered.White`, `Targeted.Creature` ;
   - « you may exile a card of that color from among them » (Sanar,
     Innovative First-Year) : `ChooseFromDefined$`, choisir parmi des objets
     désignés ;
   - la force du sort qui déclenche (Eshki, Temur's Roar) ;
   - deux paramètres d'affichage, sans effet ici : `ShowCardToActivator$`
     (le lanceur voit la carte exilée : l'IA et l'interface la voient
     déjà) et `LockInText$` (un texte que les effets qui changent les mots
     ne touchent pas : le moteur n'en a pas).
   ===================================================================== */

/* Les désignations qu'un filtre ou une désignation pointée peut nommer. */
const DESIGNES_FILTRABLES = ['Targeted', 'ParentTarget', 'TriggeredCard', 'TriggeredTarget', 'Remembered', 'DirectRemembered', 'Imprinted', 'ChosenCard'];

/* L'objet est-il parmi ceux que la désignation nomme ? */
function parmiDesignes(P, o, v, src, ctrl, env) {
  if (!P || !env) return false;
  const l = forgeDefinis(P, v, {...env, src: src || env.src, ctrl: ctrl != null ? ctrl : env.ctrl});
  return l.some(x => x && x.j == null && (x.id === o.id || suit(P, x.id) === o.id));
}
proprieteDesignee = (g => function (P, o, p, c, src, ctrl, env) {
  const m = /^(Not)?Defined(\w+)$/.exec(p);
  if (!m || !DESIGNES_FILTRABLES.includes(m[2])) return g(P, o, p, c, src, ctrl, env);
  return parmiDesignes(P, o, m[2], src, ctrl, env) === !m[1];
})(proprieteDesignee);

/* `Remembered.White`, `Targeted.Creature` : la désignation, filtrée. Les
   choix d'un `ChooseFromDefined$` se lisent dans le contexte. */
definisEtendus = (g => function (P, v, env) {
  if (v === 'ChoisisParmiDesignes') return (env.ctx && env.ctx.choisisDesignes) || [];
  const m = /^(\w+)\.(.+)$/.exec(v);
  if (!m || !DESIGNES_FILTRABLES.includes(m[1])) return g(P, v, env);
  return forgeDefinis(P, m[1], env).filter(x => x && x.j == null && forgeValideObjet(P, x, 'Card.' + m[2], env.src, env.ctrl, env));
})(definisEtendus);

/* « You may exile a card of that color from among the revealed cards » :
   les candidats sont les objets désignés encore dans la zone d'origine ;
   on en choisit jusqu'à `ChangeNum$` (autant si `Mandatory$`), puis le
   déplacement se fait comme pour un `Defined$` (empreinte, mémoire, ce
   que la source a exilé). */
FORGE_API.ChangeZone.gen = (g => function* (P, t, env) {
  if (!t.ChooseFromDefined) return yield* g(P, t, env);
  const ids = forgeDefinis(P, t.ChooseFromDefined, env).filter(x => x && x.j == null && dansOrigine(x, t.Origin)).map(x => x.id);
  const n = forgeNombre(P, t.ChangeNum || 1, env);
  const pris = yield* choisitCartes(P, env.ctrl, ids, n, 'Choisir', 'cartes', t.Mandatory === 'True' ? Math.min(n, ids.length) : 0);
  if (!pris.length) return;
  const avant = env.ctx.choisisDesignes;
  env.ctx.choisisDesignes = pris.map(id => obj(P, id)).filter(Boolean);
  try { yield* g(P, {...t, ChooseFromDefined: undefined, Defined: 'ChoisisParmiDesignes'}, env); }
  finally { env.ctx.choisisDesignes = avant; }
})(FORGE_API.ChangeZone.gen);

/* « If that spell's power is 4 or greater » : la force imprimée du sort. */
exprEtendue = (g => function (P, tete, q, env) {
  if (tete !== 'TriggeredSpellAbility' || !/^Card(Power|Toughness)$/.test(q)) return g(P, tete, q, env);
  const d = ((env.ctx || {}).evt || {}).def;
  return d ? (q === 'CardPower' ? d.force : d.endurance) || 0 : 0;
})(exprEtendue);

forgeSait('filtre', ...DESIGNES_FILTRABLES.flatMap(d => ['Defined' + d, 'NotDefined' + d]));
forgeSait('defini', 'Targeted.ChosenType', 'Targeted.Creature', 'Targeted.!ChosenCard', 'Targeted.powerLE0', 'Targeted.YouDontCtrl', 'Targeted.RememberedPlayerCtrl',
  'Targeted.Snake', 'Targeted.nonVehicle', 'Targeted.nonCreature+nonVehicle', 'Targeted.Spacecraft', 'Targeted.YouCtrl', 'Targeted.Artifact+Creature',
  'Targeted.!Creature', 'Targeted.Vampire', 'Remembered.nonLand', 'Remembered.Creature', 'Remembered.Plains', 'Remembered.withoutSuspend',
  'Remembered.!ChosenCard', 'Remembered.ExiledWithSource', 'Remembered.Saga', 'Remembered.YouOwn', 'Imprinted.ExiledWithSource', 'DirectRemembered.Land');
forgeSait('param', 'ChangeZone.ChooseFromDefined', 'Play.ShowCardToActivator', ...['ChangeZone', 'ChooseCard', 'AnimateAll', 'Animate', 'Draw', 'GainLife',
  'Continuous', 'GenericChoice', 'Token', 'FlipCoin'].map(a => a + '.LockInText'));
forgeSait('expr', 'TriggeredSpellAbility$CardPower', 'TriggeredSpellAbility$CardToughness');
