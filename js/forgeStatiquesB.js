/* =====================================================================
   js/forgeStatiquesB.js — Les statiques hors du champ

   « Spells you cast have cascade », « instant and sorcery cards in your
   graveyard have flashback », « each card in your hand has cycling » : une
   statique accorde un mot-clé à des cartes qui ne sont pas sur le champ.
   Comme les couches du champ (js/jeuCouches.js), une passe des actions
   d'état donne à chaque carte visée une définition augmentée de ces
   mots-clés, lus par le même analyseur que ceux du script
   (js/forgeMotsCles.js `motCleForge()`) ; la définition d'origine revient
   quand la statique cesse. Un sort lancé emporte sa définition augmentée
   sur la pile ; la carte qui change ensuite de zone repart de son
   imprimé (js/jeuEtat.js `creeObjet()`).

   Et, dans le même esprit, ce qu'une statique fait au lancement ou à
   l'attaque : un coût additionnel facultatif (`OptionalCost`), exercer en
   attaquant (`OptionalAttackCost`), un coût additionnel obligatoire
   (`RaiseCost` à `Cost$`), la réduction du coût d'équipement.
   ===================================================================== */

/* Ce que « AffectedZone » désigne hors du champ : pour « Stack » (« les
   sorts que tu lances »), les cartes qu'on pourrait lancer. */
const ZONES_ACCORD = {Stack: ['main', 'cimetiere', 'exil', 'commandement'], Graveyard: ['cimetiere'], Hand: ['main'], Exile: ['exil'],
  Command: ['commandement']};

/* La statique touche-t-elle le champ ? `All` et une liste qui le nomme :
   oui, et seulement lui — simplification annoncée, le reste des zones est
   ignoré. */
function zoneChamp(t) { return !t.AffectedZone || /Battlefield|All/.test(t.AffectedZone); }

const CLES_ACCORD = /^(Mode|Affected|AffectedZone|AffectedDefined|EffectZone|AddKeyword|Description|Condition|CheckSVar|SVarCompare|IsPresent|PresentCompare|PresentZone|PresentPlayer|Secondary)$/;

/* Une statique qui n'accorde que des mots-clés hors du champ, tous lus. */
function horsChampTenable(t) {
  const zones = String(t.AffectedZone).split(',').map(z => z.trim());
  if (!t.AddKeyword || !zones.every(z => ZONES_ACCORD[z] || z === 'Library') || Object.keys(t).some(k => !CLES_ACCORD.test(k))) return false;
  if (t.EffectZone && t.EffectZone !== 'Battlefield') return false;
  return String(t.AddKeyword).split('&').map(k => k.trim()).every(motAccordable);
}

/* Le coût de mana d'une carte écrit comme Forge l'écrit (`2 U U`). */
function texteCoutForge(c) { return c && c.sym && c.sym.length ? c.sym.map(s => s.slice(1, -1)).join(' ') : '0'; }

/* « Flashback » sans coût, `CardManaCost` : le coût de mana de la carte. */
function motNormalise(k, cout) {
  if (k === 'Flashback') return 'Flashback:' + cout;
  return k.replace(/\b(CardManaCost|ManaCost)\b/g, cout);
}

function defEssai() {
  return {nom: 'Essai', cout: coutMana('{1}'), mv: 1, types: ['creature'], sousTypes: [], supers: [], couleurs: [], force: 1, endurance: 1, mots: 0,
    params: {}, sort: null, capacites: [], statiques: [], jeton: false, couverture: {etat: 'complete'}};
}

/* Le mot-clé se lit-il ? Essayé sur une définition factice. */
function motAccordable(k) {
  try { return motCleForge(defEssai(), motNormalise(k, '1'), faceVide(), {}) === true; } catch (e) { return false; }
}

/* Une définition augmentée de mots-clés, une fois par définition et par
   liste : les copies d'une même carte la partagent. */
const DEFS_ACCORDEES = new WeakMap();
function defAvecMots(base, mots) {
  let m = DEFS_ACCORDEES.get(base);
  if (!m) DEFS_ACCORDEES.set(base, m = new Map());
  const cle = mots.join('|');
  if (m.has(cle)) return m.get(cle);
  const d = {...base, params: {...base.params}, capacites: base.capacites.slice(), statiques: base.statiques.slice()};
  delete d._eph; delete d._ecoute; delete d._faceCachee;
  const cout = texteCoutForge(base.cout);
  const ok = mots.every(k => { try { return motCleForge(d, motNormalise(k, cout), faceVide(), {}) === true; } catch (e) { return false; } });
  m.set(cle, ok ? d : null);
  return ok ? d : null;
}

/* Les statiques qui accordent un mot-clé hors du champ, une fois par version. */
function statiquesAccord(P) {
  if (P._accordV === P.ver) return P._accord;
  P._accord = statiquesMode(P, 'Continuous').filter(x => x.s.t.AddKeyword && !zoneChamp(x.s.t));
  P._accordV = P.ver;
  return P._accord;
}

/* « Les sorts que tu lances » s'écrit souvent `Card.YouCtrl+wasCast` :
   jugée sur la carte qu'on s'apprête à lancer, cette part tient d'avance. */
function statiquePourLancer(s) {
  if (!/Stack/.test(s.t.AffectedZone || '') || !/wasCast/.test(s.t.Affected || '')) return s;
  if (!s._lancer) {
    const v = s.t.Affected.replace(/wasCastByYou/g, 'YouCtrl').replace(/\+wasCastFromExile/g, '+inZoneExile')
      .replace(/\.wasCast\+/g, '.').replace(/[.+]wasCast\b/g, '');
    s._lancer = {...s, t: {...s.t, Affected: v}};
  }
  return s._lancer;
}

/* La passe : chaque carte visée reçoit sa définition augmentée, chaque
   carte qui ne l'est plus retrouve la sienne. Rend vrai si quelque chose a
   changé. */
function couchesHorsChamp(P) {
  const L = statiquesAccord(P);
  if (!L.length && !P.accordes) return false;
  const voulu = new Map();
  for (const x of L) {
    const t = x.s.t, mots = String(t.AddKeyword).split('&').map(k => k.trim());
    const zones = [...new Set(String(t.AffectedZone).split(',').flatMap(z => ZONES_ACCORD[z.trim()] || []))];
    for (const J of P.joueurs) for (const z of zones) for (const id of J[z]) {
      const o = obj(P, id);
      if (o && viseForge(P, x.src, statiquePourLancer(x.s), o)) voulu.set(id, [...(voulu.get(id) || []), ...mots]);
    }
  }
  let change = false;
  for (const id of new Set([...(P.accordes || []), ...voulu.keys()])) {
    const o = obj(P, id), mots = voulu.get(id);
    if (!o) continue;
    if (!mots) { if (o.defBase) { o.def = o.defBase; delete o.defBase; delete o.defMots; change = true; } continue; }
    const cle = mots.join('|');
    if (o.defMots === cle) continue;
    const base = o.defBase || o.def, d = defAvecMots(base, mots);
    if (!d) continue;
    o.defBase = base; o.def = d; o.defMots = cle; change = true;
  }
  P.accordes = voulu.size ? [...voulu.keys()] : null;
  if (change) P.ver++;
  return change;
}

/* —— Les couleurs d'une statique ——————————————————————————————————— */

/* `All`, la couleur choisie, ou des couleurs nommées. */
function couleursStatique(P, src, v) {
  if (v === 'All') return ['W', 'U', 'B', 'R', 'G'];
  if (v === 'ChosenColor') { const k = P && src && choixDe(P, src).couleur; return k ? [k] : []; }
  return couleursMots(v);
}

/* —— Le coût additionnel facultatif ————————————————————————————————— */

/* « As an additional cost to cast this spell, you may collect evidence 6 » :
   une façon de lancer de plus, et la condition `OptionalCost` que l'effet
   lit (js/jeuPile.js pose `ctx.optionnel`). */
function variantesOptionnelles(P, j, o, depuis, essaie) {
  for (const s of o.def.statiques) {
    if (s.s !== 'forge' || s.t.Mode !== 'OptionalCost') continue;
    const c = coutForge(s.t.Cost);
    if (c) essaie('optionnel', sommeMana(coutSort(P, j, o, depuis), c.cout.mana), fusionAutres(o.def.coutSup, autresCout(c.cout)));
  }
}
const optionnelTenable = t => /^(All|Hand)$/.test(t.EffectZone || 'All') && t.ValidCard === 'Card.Self' && (!t.ValidSA || t.ValidSA === 'Spell') && !!coutForge(t.Cost);
forgeStatique('OptionalCost', ['ValidCard', 'ValidSA', 'Cost', 'EffectZone'], () => {});
FORGE_CONDITIONS.OptionalCost = (P, env) => !!(env.ctx.optionnel || (env.src && env.src.optionnel));

/* —— Exercer en attaquant ——————————————————————————————————————————— */

/* « You may exert CARDNAME as it attacks. When you do, … » : il ne se
   dégagera pas à son prochain dégagement, et la capacité réflexe monte
   sur la pile. */
const exertTenable = t => t.ValidCard === 'Card.Self' && /^Exert<1\/(CARDNAME|NICKNAME)>$/.test(t.Cost || '');
forgeStatique('OptionalAttackCost', ['ValidCard', 'Cost', 'Trigger'], () => {});

function* exertsAttaque(P, j, choisis) {
  for (const id of choisis.keys()) {
    const o = obj(P, id), s = o && o.def.statiques.find(x => x.s === 'forge' && x.t.Mode === 'OptionalAttackCost');
    if (!s) continue;
    const r = yield question(P, j, 'oui', ['non', 'oui'], {texte: `Exercer ${o.def.nom} ?`, source: id});
    if (r !== 1) continue;
    o.exerce = true;
    jn(P, `${o.def.nom} est exercé`);
    if (s.reflexe) P.enAttente.push({src: id, ctrl: j, cap: {genre: 'declenchee', ecoutes: [], texte: 'Exert', effet: s.reflexe}, evt: {t: 'attaque', id}});
  }
}

/* —— Les coûts que les statiques changent ——————————————————————————— */

/* « As an additional cost to cast this spell, waterbend {5} / sacrifice a
   creature » : la statique de la carte devient une part de son coût, posée
   à la construction (js/forgeDefinition.js). */
const hausseTenable = t => t.ValidCard === 'Card.Self' && (!t.Type || t.Type === 'Spell') && /^(All|Hand)$/.test(t.EffectZone || 'All') && !!coutForge(t.Cost);
function hausseDeCout(def) {
  for (const s of def.statiques) {
    if (s.s !== 'forge' || s.t.Mode !== 'RaiseCost' || !s.t.Cost) continue;
    const c = coutForge(s.t.Cost);
    def.coutSup = fusionAutres(def.coutSup, autresCout(c.cout)) || def.coutSup;
    if (c.cout.mana.total || c.cout.mana.x) def.hausseMana = def.hausseMana ? sommeMana(def.hausseMana, c.cout.mana) : c.cout.mana;
  }
}

/* Le coût d'équipement, réduit par « equip abilities you activate cost {1}
   less » (`ValidSpell$ Activated.Equip`). */
function coutEquipement(P, j, o) {
  const c = o.def.equipe;
  let moins = 0;
  for (const {src, s} of statiquesMode(P, 'ReduceCost')) {
    const t = s.t;
    if (t.ValidSpell !== 'Activated.Equip' || (t.Activator === 'You' && j !== src.ctrl)) continue;
    if (t.ValidCard && !forgeValideObjet(P, o, t.ValidCard, src, src.ctrl, envStatique(src, s), true)) continue;
    if (conditionForge(P, t, envStatique(src, s))) moins += forgeNombre(P, t.Amount || 1, envStatique(src, s));
  }
  return moins ? moinsGenerique(c, moins) : c;
}

forgeSait('param', 'Continuous.MayPlayIgnoreType', 'Continuous.RaiseCost', 'Continuous.RemoveType', 'ReduceCost.ValidSpell', 'RaiseCost.Cost',
  'RaiseCost.EffectZone', 'MustAttack.MustAttack');
