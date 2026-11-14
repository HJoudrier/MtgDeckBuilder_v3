/* =====================================================================
   js/forgeDefinition.js — D'un script de Forge à une définition de jeu

   La définition a la forme que le moteur connaît déjà (js/definitions.js) :
   coût, types, force, mots-clés, sort, capacités, statiques, entrée. Seuls
   ses effets changent de nature : chaque table d'une chaîne de Forge
   (`SubAbility$`) devient une opération `forge`, que js/forgeEffetsA.js
   exécute ; ses emplacements de cible viennent des `ValidTgts$`. Le
   lancement, la pile, l'IA et les tests la traitent comme les autres.

   Une unité qu'on ne sait pas construire — une forme de remplacement, un
   coût, un mot-clé inconnus — est écartée entière, et la couverture le dit
   (`echecs`).
   ===================================================================== */

/* Une table est-elle jouable : son effet est-il connu, et chacun de ses
   paramètres est-il lu par lui ? */
function tableJouable(t) {
  const api = forgeApi(t);
  if (!FORGE_API[api]) return false;
  return Object.keys(t).every(k => k === 'SP' || k === 'AB' || k === 'DB' || FORGE_DESCRIPTIFS.test(k) || FORGE_COMMUNS.has(k) ||
    FORGE_SAIT.param.has(api + '.' + k));
}

/* Le texte d'une capacité, pour la table et le journal. */
function texteForge(face, t) {
  return String(t.SpellDescription || t.TriggerDescription || t.Description || t.StackDescription || '')
    .replace(/CARDNAME|NICKNAME/g, face.nom);
}

/* L'effet d'une table et de sa chaîne : `{ops, cibles, modes}`, ou `null`
   si une table n'est pas jouable. */
let CHAINES_FORGE = 0;

/* `racine` : la table est celle d'un sort ou d'une capacité activée, dont
   le coût se paie au lancement. Ailleurs — la capacité qu'un déclencheur
   exécute, une sous-capacité —, un `Cost$` se propose à la résolution
   (« you may pay {2}; if you do… »). */
function effetForge(face, t0, jetons, racine) {
  if (!t0) return null;
  if (forgeApi(t0) === 'Charm') {
    const opts = String(t0.Choices || '').split(',').map(n => n.trim()).filter(Boolean).map(n => {
      const sub = forgeSousCapacite(face, n), e = sub && effetForge(face, sub, jetons);
      return e && !e.modes ? {texte: texteForge(face, sub) || n, ops: e.ops, cibles: e.cibles} : null;
    });
    if (!opts.length || opts.some(o => !o)) return null;
    const max = /^\d+$/.test(t0.CharmNum || '1') ? +(t0.CharmNum || 1) : null;
    const min = t0.MinCharmNum != null ? (/^\d+$/.test(t0.MinCharmNum) ? +t0.MinCharmNum : null) : max;
    if (max == null || min == null) return null;
    return {ops: [], cibles: [], modes: {min, max, options: opts}};
  }
  const ops = [], cibles = [], chaine = ++CHAINES_FORGE;
  let t = t0, parent = null, garde = 0;
  while (t && garde++ < 20) {
    if (!tableJouable(t)) return null;
    let slot = null;
    if (t.ValidTgts || t.TargetType) {
      const min = t.TargetMin != null ? (/^\d+$/.test(t.TargetMin) ? +t.TargetMin : 0) : 1;
      const max = t.TargetMax != null ? (/^\d+$/.test(t.TargetMax) ? +t.TargetMax : 1) : Math.max(1, min);
      slot = cibles.length;
      /* Sans `TgtZone$`, un déplacement cible dans sa zone d'origine :
         « return target creature card from your graveyard ». */
      const zone = t.TgtZone || (forgeApi(t) === 'ChangeZone' && t.Origin && !/,/.test(t.Origin) ? t.Origin : null);
      cibles.push({desc: descForge(t.ValidTgts || 'Card', zone, /Spell/.test(t.TargetType || '')), min, max});
    }
    const op = {op: 'forge', forge: true, api: forgeApi(t), t, face, slot, slotParent: parent, jetons, texte: texteForge(face, t),
      chaine, coutInterne: t.Cost && !(racine && t === t0) ? t.Cost : null};
    if (op.coutInterne && !coutForge(op.coutInterne)) return null;
    if (FORGE_API[op.api].prepare && !FORGE_API[op.api].prepare(t, op)) return null;
    FORGE_API[op.api].ia(t, op);
    ops.push(op);
    if (slot != null) parent = slot;
    const suite = t.SubAbility;
    t = suite ? forgeSousCapacite(face, suite) : null;
    if (suite && !t) return null;
  }
  return {ops, cibles, modes: null};
}

/* Les définitions des jetons qu'un script crée, d'après leurs scripts. */
function jetonsForge(textes) {
  const r = {};
  Object.entries(textes || {}).forEach(([nom, txt]) => {
    const s = lisScriptForge(txt);
    if (s.faces.length) r[nom] = definitionDepuisScript(s, {nom: s.faces[0].nom.replace(/ Token$/, ''), jeton: true}, {}).def;
  });
  return r;
}

/* Une capacité `A:` de Forge, versée dans la définition. Rend vrai si elle
   est comprise. */
function capaciteForge(def, face, t, jetons) {
  const c = coutForge(t.Cost);
  if (!c) return false;
  const api = forgeApi(t);
  if (t.SP) {
    if (api === 'Attach') { if (!t.ValidTgts) return false; def.aura = descForge(t.ValidTgts); return true; }
    if (def.sort) return false;
    const e = effetForge(face, t, jetons, true);
    if (!e) return false;
    def.sort = e;
    const autre = Object.keys(c.cout).filter(k => k !== 'mana');
    if (autre.length) def.coutSup = c.cout;
    return true;
  }
  /* Depuis la main ou le cimetière : js/jeuLancer.js les propose aussi. */
  const zone = {Hand: 'main', Graveyard: 'cimetiere'}[t.ActivationZone] || null;
  if (t.ActivationZone && t.ActivationZone !== 'Battlefield' && !zone) return false;
  if (zone && (api === 'Mana' || t.Planeswalker === 'True' || c.cout.engage || c.cout.sac)) return false;
  if (api === 'Mana' && !t.SubAbility) {
    /* Le mana de l'identité du commandant : calculé par le moteur, qui
       sait qui commande (js/jeuMana.js). */
    if (/^Combo ColorIdentity$/.test(t.Produced || '') && (t.Amount || '1') === '1' && tableJouable(t)) {
      def.capacites.push({genre: 'mana', cout: c.cout, options: [], identite: true, texte: texteForge(face, t)});
      return true;
    }
    /* La couleur choisie (« add one mana of the chosen color »), une
       quantité calculée : js/jeuMana.js les lit au moment de payer. */
    const choisie = t.Produced === 'Chosen';
    const n = /^\d+$/.test(t.Amount || '1') ? +(t.Amount || 1) : 1;
    const options = choisie ? [] : optionsMana(t.Produced, n);
    if ((!options.length && !choisie) || !tableJouable(t)) return false;
    def.capacites.push({genre: 'mana', cout: c.cout, options, texte: texteForge(face, t), ...(t.RestrictValid ? {restreint: t.RestrictValid} : {}),
      ...(choisie ? {choisie: true} : {}), ...(/^\d+$/.test(t.Amount || '1') ? {} : {montant: t.Amount, face})});
    return true;
  }
  const effet = effetForge(face, t, jetons, true);
  if (!effet) return false;
  if (t.Planeswalker === 'True') {
    if (c.loyaute == null) return false;
    def.capacites.push({genre: 'loyaute', delta: c.loyaute, effet, texte: texteForge(face, t)});
  } else def.capacites.push({genre: 'activee', cout: c.cout, effet, vitesse: t.SorcerySpeed === 'True' ? 'rituel' : null,
    unefois: !!t.ActivationLimit, texte: texteForge(face, t), ...(zone ? {zone} : {})});
  return true;
}

/* Un déclencheur `T:`. */
function declencheurForge(def, face, t, jetons) {
  if (!FORGE_MODES[t.Mode] || !phaseConnue(t)) return false;
  /* Hors du champ, seul « when you cycle ~ » s'entend : la carte cyclée
     écoute à travers son instantané (js/jeuActions.js). */
  if (t.TriggerZones && t.TriggerZones !== 'Battlefield' && !(t.Mode === 'Cycled' && /^(Hand|Graveyard)$/.test(t.TriggerZones))) return false;
  const exe = forgeSousCapacite(face, t.Execute);
  const effet = effetForge(face, exe, jetons);
  if (!effet) return false;
  if (t.OptionalDecider && effet.ops[0]) effet.ops[0] = {...effet.ops[0], t: {...effet.ops[0].t, OptionalDecider: t.OptionalDecider}};
  def.capacites.push({genre: 'declenchee', ecoutes: [{evt: 'forge', t, face}], effet, texte: texteForge(face, t)});
  return true;
}

/* Un remplacement `R:`. Deux formes seulement, les plus courantes : la
   carte entre engagée (sauf si l'on contrôle tel terrain, ou en payant de
   la vie), ou avec des marqueurs. */
function remplacementForge(def, face, r) {
  if (entreeForge(def, face, r)) return true;
  const forme = formeRemplacement(face, r);
  if (!forme) return false;
  (def.remplacements = def.remplacements || []).push({forme, t: r, face});
  return true;
}

/* L'entrée sur le champ remplacée : engagée, ou avec des marqueurs. */
function entreeForge(def, face, r) {
  if (r.Event !== 'Moved' || r.Destination !== 'Battlefield' || !/^(Card|Permanent|Creature|Land)\.Self$/.test(r.ValidCard || '')) return false;
  const w = forgeSousCapacite(face, r.ReplaceWith);
  if (!w || w.Defined !== 'Self' || w.ETB !== 'True') return false;
  const ent = def.entree = def.entree || {};
  if (w.DB === 'Tap') {
    ent.engagee = true;
    if (w.UnlessCost) { const m = /^PayLife<(\d+)>$/.exec(w.UnlessCost); if (!m) return false; ent.payeVie = +m[1]; }
    if (r.CheckSVar || w.ConditionCheckSVar) {
      const sv = face.svars[r.CheckSVar || w.ConditionCheckSVar] || '', cmp = r.SVarCompare || w.ConditionSVarCompare;
      const m = /^Count\$Valid (.+)$/.exec(sv.trim());
      if (!m || !/^(EQ0|LT1)$/.test(cmp)) return false;
      ent.sauf = [descForge(m[1])];
    }
    return true;
  }
  if (w.DB === 'PutCounter' && /^\d+$/.test(w.CounterNum || '1')) {
    ent.marqueurs = +(w.CounterNum || 1); ent.genre = genreMarqueur(w.CounterType); return true;
  }
  return false;
}

forgeSait('repl', 'Moved');
forgeSait('param', 'Moved.ValidCard', 'Moved.Destination', 'Moved.ReplaceWith', 'Moved.ReplacementResult', 'Tap.ETB');

/* Les couleurs d'un `Colors:black,green` de jeton. */
function couleursForge(txt) {
  const k = {white: 'W', blue: 'U', black: 'B', red: 'R', green: 'G'};
  return String(txt).split(',').map(c => k[c.trim().toLowerCase()]).filter(Boolean);
}

/* La définition d'un script lu, avec ce qui n'a pas pu être construit :
   `echecs`, l'indice de l'unité (dans l'ordre de `unitesForge()`) et la
   raison. */
function definitionDepuisScript(s, fiche, jetons) {
  if (s.faces.length > 1) return definitionAFaces(s, fiche, jetons);
  const face = s.faces[0];
  const typeLigne = forgeLigneType(face.types), ti = lisTypeLigne(typeLigne);
  const cout = coutMana(face.cout) || coutManaVide();
  const pt = /^(-?\d+)\/(-?\d+)$/.exec(face.pt || '');
  const def = {nom: fiche.nom || face.nom, cout, mv: cout.total, types: ti.types, sousTypes: ti.sousTypes, supers: ti.supers,
    couleurs: face.couleurs ? couleursForge(face.couleurs) : couleursDe(cout, {}), force: pt ? +pt[1] : null,
    endurance: pt ? +pt[2] : null, loyaute: /^\d+$/.test(face.loyaute || '') ? +face.loyaute : null, mots: 0, params: {},
    sort: null, capacites: [], statiques: [], entree: null, aura: null, equipe: null, kicker: null, flashback: null, cycling: null,
    jeton: !!fiche.jeton, couverture: null, coutTexte: face.cout, typeLigne, texteOracle: face.oracle.replace(/\n/g, ' // '), source: 'forge'};
  if (def.types.includes('creature') && (def.force == null || def.endurance == null)) {
    def.forceVariable = true;
    if (def.force == null) def.force = 0;
    if (def.endurance == null) def.endurance = Math.max(1, def.force);
  }
  const echecs = new Map();
  let i = 0;
  const essaie = (ok, raison) => { if (!ok) echecs.set(i, 'construction:' + raison); i++; };
  face.a.forEach(t => essaie(capaciteForge(def, face, t, jetons), forgeApi(t)));
  face.t.forEach(t => essaie(declencheurForge(def, face, t, jetons), t.Mode));
  face.s.forEach(t => {
    const st = statiqueForge(face, t, jetons);
    if (st) def.statiques.push(st);
    essaie(!!st, t.Mode);
  });
  face.r.forEach(t => essaie(remplacementForge(def, face, t), t.Event));
  face.k.forEach(k => essaie(motCleForge(def, k, face, jetons), k.split(':')[0]));
  def.kickerUtile = !!def.kicker && /Kicked|kicked/.test(JSON.stringify([face.a, face.t, face.svars]));
  capacitesImplicites(def, fiche);
  /* Une aura qui nuit à ce qu'elle enchante : l'IA la pose chez l'adversaire. */
  if (def.aura && (face.svars.AttachAILogic === 'Curse' || face.a.some(t => t.AILogic === 'Curse' || t.IsCurse === 'True'))) def.auraHostile = true;
  const c = couvertureForge(s, echecs);
  def.couverture = {lignes: c.unites.map(u => ({texte: u.texte || u.genre, etat: u.manque.length ? 'ignore' : 'compris', rates: u.manque})),
    etat: c.etat, taux: c.taux, manuel: false, directive: null, source: 'forge', manque: c.manque};
  if (def.forceVariable && c.etat === 'complete' && !def.statiques.length) def.couverture.etat = 'partielle';
  return {def, echecs};
}

/* La définition Forge d'une fiche qui porte son script (`fiche.forge`), ou
   `null`. Les jetons qu'elle crée viennent avec (`fiche.forgeJetons`). */
function definitionForge(fiche) {
  const s = lisScriptForge(fiche.forge);
  if (!s.faces.length) return null;
  return definitionDepuisScript(s, fiche, jetonsForge(fiche.forgeJetons)).def;
}

/* Les noms des jetons qu'un script crée, pour les joindre à sa fiche. */
function nomsJetonsForge(texte) {
  const n = new Set();
  for (const m of String(texte || '').matchAll(/TokenScript\$\s*([\w,]+)/g)) m[1].split(',').forEach(x => n.add(x.trim()));
  if (/\$ Investigate\b/.test(texte || '')) n.add('c_a_clue_draw');
  return [...n];
}

/* Les modes de cartes à deux faces que le moteur sait jouer : la face
   arrière d'une carte modale, partagée ou à aventure se lance ; celle d'une
   carte transformable n'est jouée que si un effet la transforme. */
const FORGE_FACES = ['Modal', 'Split', 'Adventure', 'DoubleFaced'];

/* Une carte à deux faces : la définition de chacune, la face arrière
   rangée dans `def.dos`. La carte n'est complète que si les deux le sont,
   et que le moteur sait passer de l'une à l'autre. */
function definitionAFaces(s, fiche, jetons) {
  const av = definitionDepuisScript({faces: [s.faces[0]], mode: ''}, fiche, jetons);
  const ar = definitionDepuisScript({faces: [s.faces[1]], mode: ''}, {nom: s.faces[1].nom, jeton: fiche.jeton}, jetons);
  const def = av.def, c = def.couverture;
  const brut = JSON.stringify(s.faces.map(f => [f.a, f.t, f.svars]));
  const tenu = FORGE_FACES.includes(s.mode) && (s.mode !== 'DoubleFaced' || /SetState/.test(brut));
  if (tenu) { def.dos = ar.def; def.modeFaces = s.mode; }
  const manque = tenu ? ar.def.couverture.manque.filter(e => !c.manque.includes(e)) : ['construction:' + (s.mode || 'faces')];
  if (c.etat === 'complete' && (manque.length || ar.def.couverture.etat !== 'complete')) c.etat = 'partielle';
  c.manque = c.manque.concat(manque);
  return av;
}
