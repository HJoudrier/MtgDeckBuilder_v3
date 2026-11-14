/* =====================================================================
   js/forgeMotsClesB.js — Les mots-clés des permanents, suite

   Soulshift, undying, persist, modular, bloodthirst, evolve, extort,
   wither, toxic, shadow, horsemanship, skulk, flanking, level up,
   outlast, vanishing, fading, living weapon, umbra armor, unleash,
   partner with, afterlife, melee, battle cry, riot… La plupart deviennent
   un déclencheur de Forge ordinaire, écrit ici comme Forge l'écrirait
   (`synthese()`) ; les autres posent un paramètre que le combat ou les
   dégâts lisent. Simplifications annoncées : fabricate et riot prennent
   toujours les marqueurs.
   ===================================================================== */

/* Un déclencheur synthétique, avec les SVars dont son effet a besoin. */
function synthese(def, face, jetons, nom, table, effet, svars) {
  const f = {...face, svars: {...face.svars, [nom]: effet, ...(svars || {})}};
  return declencheurForge(def, f, {...table, Execute: nom, TriggerZones: table.TriggerZones || 'Battlefield'}, jetons);
}

/* Une capacité activée synthétique (level up, outlast). */
function activeeSynthese(def, face, jetons, table) { return capaciteForge(def, face, table, jetons); }

const MEURT = {Mode: 'ChangesZone', Origin: 'Battlefield', Destination: 'Graveyard', ValidCard: 'Card.Self'};
const ENTRE = {Mode: 'ChangesZone', Destination: 'Battlefield', ValidCard: 'Card.Self'};
const ENTRETIEN = {Mode: 'Phase', Phase: 'Upkeep', ValidPlayer: 'You'};

function marqueursEntree(def, n, genre) { def.entree = Object.assign(def.entree || {}, {marqueurs: n, genre}); }

function motCleTraineB(def, k, face, jetons, tete, reste) {
  const n = /^\d+$/.test(reste[0] || '') ? +reste[0] : null;
  switch (tete) {
    case 'Soulshift':
      return n != null && synthese(def, face, jetons, 'AmeRetour', MEURT,
        `DB$ ChangeZone | Origin$ Graveyard | Destination$ Hand | ValidTgts$ Spirit.cmcLE${n}+YouOwn | TgtPrompt$ Spirit | TargetMin$ 0`);
    case 'Undying': case 'Persist': {
      const g = tete === 'Undying' ? 'P1P1' : 'M1M1';
      return synthese(def, face, jetons, 'Revient' + g, {...MEURT, ValidCard: `Card.Self+counters_EQ0_${g}`},
        `DB$ ChangeZone | Defined$ TriggeredNewCardLKICopy | Origin$ Graveyard | Destination$ Battlefield | WithCountersType$ ${g} | WithCountersAmount$ 1`);
    }
    case 'Modular':
      if (n == null) return false;
      marqueursEntree(def, n, '+1/+1');
      return synthese(def, face, jetons, 'Modulaire', MEURT,
        'DB$ PutCounter | ValidTgts$ Artifact.Creature | TgtPrompt$ Artifact creature | CounterType$ P1P1 | CounterNum$ ModX | TargetMin$ 0',
        {ModX: 'TriggeredCard$CardCounters.P1P1'});
    case 'Bloodthirst':
      if (n == null) return false;
      def.entree = Object.assign(def.entree || {}, {marqueursForge: {genre: '+1/+1', n: String(n), cond: {CheckSVar: 'Soif', SVarCompare: 'GE1'},
        face: {...face, svars: {...face.svars, Soif: 'Count$LifeOppsLostThisTurn'}}}});
      return true;
    case 'Fabricate': case 'Riot':
      marqueursEntree(def, tete === 'Riot' ? 1 : n || 1, '+1/+1');
      return tete === 'Riot' ? !reste.length : n != null;
    case 'Evolve':
      return synthese(def, face, jetons, 'Evolue', {Mode: 'ChangesZone', Destination: 'Battlefield', ValidCard: 'Creature.Other+YouCtrl'},
        'DB$ PutCounter | Defined$ Self | CounterType$ P1P1 | CounterNum$ 1 | ConditionCheckSVar$ EvoX | ConditionSVarCompare$ GE1',
        {EvoX: 'Count$EvolveTest'});
    case 'Extort':
      return synthese(def, face, jetons, 'Extorque', {Mode: 'SpellCast', ValidActivatingPlayer: 'You'},
        'DB$ LoseLife | Defined$ Player.Opponent | LifeAmount$ 1 | Cost$ W/B | SubAbility$ ExtGain', {ExtGain: 'DB$ GainLife | Defined$ You | LifeAmount$ ExtN', ExtN: 'PlayerCountOpponents$Amount'});
    case 'Wither': def.params.fletri = true; return !reste.length;
    case 'Toxic': if (n == null) return false; def.params.toxique = (def.params.toxique || 0) + n; return true;
    case 'Shadow': def.params.ombre = true; return true;
    case 'Horsemanship': def.params.cavalerie = true; return true;
    case 'Skulk': def.params.furtif = true; return true;
    case 'Flanking':
      return synthese(def, face, jetons, 'Flanc', {Mode: 'AttackerBlockedByCreature', ValidCard: 'Card.Self', ValidBlocker: 'Creature'},
        'DB$ Pump | Defined$ TriggeredBlocker | NumAtt$ -1 | NumDef$ -1');
    case 'Level up':
      return !!reste[0] && activeeSynthese(def, face, jetons, {AB: 'PutCounter', Defined: 'Self', CounterType: 'LEVEL', CounterNum: '1', Cost: reste[0], SorcerySpeed: 'True'});
    case 'Outlast':
      return !!reste[0] && activeeSynthese(def, face, jetons, {AB: 'PutCounter', Defined: 'Self', CounterType: 'P1P1', CounterNum: '1', Cost: reste[0] + ' T', SorcerySpeed: 'True'});
    case 'Vanishing': case 'Fading': {
      const g = tete === 'Vanishing' ? 'TIME' : 'FADE';
      if (n != null) marqueursEntree(def, n, genreMarqueur(g));
      return tete === 'Vanishing'
        ? synthese(def, face, jetons, 'Disparait', ENTRETIEN, `DB$ RemoveCounter | Defined$ Self | CounterType$ ${g} | CounterNum$ 1 | SubAbility$ DispSac`,
          {DispSac: `DB$ Sacrifice | Defined$ Self | ConditionCheckSVar$ DispN | ConditionSVarCompare$ EQ0`, DispN: `Count$CardCounters.${g}`})
        : synthese(def, face, jetons, 'Fane', ENTRETIEN, `DB$ Sacrifice | Defined$ Self | ConditionCheckSVar$ FaneN | ConditionSVarCompare$ EQ0 | SubAbility$ FaneRet`,
          {FaneRet: `DB$ RemoveCounter | Defined$ Self | CounterType$ ${g} | CounterNum$ 1`, FaneN: `Count$CardCounters.${g}`});
    }
    case 'Living Weapon':
      def.capacites.push({genre: 'declenchee', ecoutes: [{evt: 'entre', sujet: 'soi'}], texte: 'Living weapon',
        effet: {ops: [{op: 'germe', hostile: false}], cibles: [], modes: null}});
      return true;
    case 'Umbra armor': case 'Totem armor': def.params.armure = true; return true;
    case 'Unleash': marqueursEntree(def, 1, '+1/+1'); def.params.dechaine = true; return true;
    case 'Partner with':
      def.params.partenaire = reste.join(':');
      def.capacites.push({genre: 'declenchee', ecoutes: [{evt: 'entre', sujet: 'soi'}], texte: 'Partner with ' + def.params.partenaire,
        effet: {ops: [{op: 'cherchenom', nom: def.params.partenaire, hostile: false}], cibles: [], modes: null}});
      return true;
    case 'Choose a Background': case "Doctor's companion": case 'Friends forever': return true;
    case 'Afterlife':
      if (n == null) return false;
      def.capacites.push({genre: 'declenchee', ecoutes: [{evt: 'meurt', sujet: 'soi'}], texte: 'Afterlife ' + n,
        effet: {ops: [{op: 'esprits', n, hostile: false}], cibles: [], modes: null}});
      return true;
    /* Les façons de lancer (js/jeuVariantesB.js). */
    case 'Escape': case 'Dash': case 'Spectacle': case 'Surge': {
      const c = reste.length === 1 ? coutForge(reste[0]) : null;
      if (!c || c.cout.engage || c.cout.sacSoi) return false;
      def[{Escape: 'escape', Dash: 'dash', Spectacle: 'spectacle', Surge: 'surge'}[tete]] = c.cout;
      return true;
    }
    case 'Retrace': def.retrace = true; return !reste.length;
    case 'Jump-start': def.jumpstart = true; return !reste.length;
    case 'Rebound': def.rebond = true; return !reste.length;
    case 'Split second': def.params.splitSecond = true; return !reste.length;
    case 'Melee':
      return synthese(def, face, jetons, 'Melee', {Mode: 'Attacks', ValidCard: 'Card.Self'}, 'DB$ Pump | Defined$ Self | NumAtt$ +1 | NumDef$ +1');
    case 'Battle cry':
      return synthese(def, face, jetons, 'CriGuerre', {Mode: 'Attacks', ValidCard: 'Card.Self'}, 'DB$ PumpAll | ValidCards$ Creature.attacking+Other | NumAtt$ +1');
  }
  return null;
}

forgeSait('kw', 'Soulshift', 'Undying', 'Persist', 'Modular', 'Bloodthirst', 'Fabricate', 'Riot', 'Evolve', 'Extort', 'Wither', 'Toxic', 'Shadow',
  'Horsemanship', 'Skulk', 'Flanking', 'Level up', 'Outlast', 'Vanishing', 'Fading', 'Living Weapon', 'Umbra armor', 'Totem armor', 'Unleash',
  'Partner with', 'Choose a Background', "Doctor's companion", 'Friends forever', 'Afterlife', 'Melee', 'Battle cry', 'Escape', 'Dash', 'Spectacle',
  'Surge', 'Retrace', 'Jump-start', 'Rebound', 'Split second');

/* Un jeton de Forge écrit à la main : une créature d'un type, d'une force,
   de couleurs et de mots-clés donnés. */
function jetonSimple(P, j, nom, sousType, f, e, couleurs, mots) {
  const def = {nom, cout: coutManaVide(), mv: 0, types: ['creature'], sousTypes: [sousType], supers: [], couleurs, force: f, endurance: e,
    mots: mots || 0, params: {}, sort: null, capacites: [], statiques: [], jeton: true, typeLigne: 'Token Creature — ' + nom, couverture: {etat: 'complete'}};
  const o = creeObjet(P, nouvelleCarte(P, def, j, false, true), j, 'champ');
  P.champ.push(o.id); P.ver++;
  emet(P, {t: 'entre', id: o.id, ctrl: j, jeton: true});
  return o;
}

/* Living weapon : un germe 0/0, et l'équipement s'y attache. */
OPS.germe = function* (P, op, ctx) {
  const s = sourceCtx(P, ctx);
  if (!s || s.lki || s.zone !== 'champ') return;
  const g = jetonSimple(P, ctx.ctrl, 'Phyrexian Germ', 'germ', 0, 0, ['B']);
  s.att = g.id; P.ver++;
};
/* Afterlife : des esprits 1/1 blancs et noirs, volants. */
OPS.esprits = function* (P, op, ctx) { for (let k = 0; k < op.n; k++) jetonSimple(P, ctx.ctrl, 'Spirit', 'spirit', 1, 1, ['W', 'B'], MOT.VOL); };
/* Partner with : le partenaire nommé, cherché dans la bibliothèque. */
OPS.cherchenom = function* (P, op, ctx) {
  const B = P.joueurs[ctx.ctrl].bibliotheque, id = B.find(x => obj(P, x).def.nom === op.nom);
  if (id != null) { deplace(P, id, 'main'); melangeHasard(P.rng, B); }
};
