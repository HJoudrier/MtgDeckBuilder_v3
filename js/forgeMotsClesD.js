/* =====================================================================
   js/forgeMotsClesD.js — Les mots-clés des permanents, troisième partie

   Annihilator, renown, rampage, mobilize, myriad, mentor, graft : des
   capacités déclenchées écrites dans les évènements du moteur (`attaque`,
   `estBloque`, `degatsJoueur`, `entre`) et jouées par une opération à
   elles. For Mirrodin! et job select : un jeton auquel l'équipement
   s'attache. Backup : un déclencheur de Forge synthétique. Scavenge et
   reinforce : des capacités activées depuis le cimetière ou la main.
   Sunburst et devour : des effets « en entrant » (js/jeuOpsB.js
   `metEnJeu()`). Ascend : la bénédiction de la cité. Strive : un coût qui
   grandit avec les cibles. Les Leylines : un effet depuis la main de
   départ (js/jeuPartie.js).
   ===================================================================== */

/* Une capacité déclenchée sur un évènement du moteur. */
const capMoteur = (texte, ecoute, op) => ({genre: 'declenchee', ecoutes: [ecoute], texte, effet: {ops: [{...op, hostile: false}], cibles: [], modes: null}});
const ATTAQUE_SOI = {evt: 'attaque', sujet: 'soi'};

/* Un mot-clé des permanents. Rend `null` s'il n'en est pas un. */
function motClePermanent(def, k, face, jetons, tete, reste) {
  const n = /^\d+$/.test(reste[0] || '') ? +reste[0] : null;
  const pousse = cap => { def.capacites.push(cap); return true; };
  const entree = op => { def.entree = def.entree || {}; (def.entree.forge = def.entree.forge || []).push({effet: {ops: [op]}, optionnel: false}); return true; };
  switch (tete) {
    case 'Annihilator': return n != null && pousse(capMoteur('Annihilator ' + n, ATTAQUE_SOI, {op: 'annihile', n}));
    case 'Renown': return n != null && pousse(capMoteur('Renown ' + n, {evt: 'degatsJoueur', sujet: 'soi', combat: true}, {op: 'renomme', n}));
    case 'Rampage': return n != null && pousse(capMoteur('Rampage ' + n, {evt: 'estBloque'}, {op: 'dechaine', n}));
    case 'Mobilize': return n != null && pousse(capMoteur('Mobilize ' + n, ATTAQUE_SOI, {op: 'mobilise', n}));
    case 'Myriad': return !reste.length && pousse(capMoteur('Myriad', ATTAQUE_SOI, {op: 'myriade'}));
    case 'Mentor': return !reste.length && pousse(capMoteur('Mentor', ATTAQUE_SOI, {op: 'mentor'}));
    case 'Graft':
      if (n == null) return false;
      marqueursEntree(def, n, '+1/+1');
      return pousse(capMoteur('Graft', {evt: 'entre', sujet: {...descForge('Creature'), autre: true}}, {op: 'greffe'}));
    case 'For Mirrodin': return pousse(capMoteur('For Mirrodin!', {evt: 'entre', sujet: 'soi'}, {op: 'porteJeton', nom: 'Rebel', f: 2, e: 2, couleurs: ['R']}));
    case 'Job select': return pousse(capMoteur('Job select', {evt: 'entre', sujet: 'soi'}, {op: 'porteJeton', nom: 'Hero', f: 1, e: 1, couleurs: []}));
    case 'Backup': {
      const sv = reste[1] && face.svars[reste[1]];
      if (n == null || !sv || reste.length !== 2) return false;
      return synthese(def, face, jetons, 'Renfort', ENTRE, `DB$ PutCounter | ValidTgts$ Creature | CounterType$ P1P1 | CounterNum$ ${n} | SubAbility$ RenfortGain`,
        {RenfortGain: sv + ' | Defined$ Targeted | ConditionDefined$ Targeted | ConditionPresent$ Card.Other'});
    }
    case 'Scavenge': {
      const c = reste.length === 1 ? coutForge(reste[0]) : null;
      if (!c || autresCout(c.cout) || typeof def.force !== 'number') return false;
      return pousse({genre: 'activee', zone: 'cimetiere', vitesse: 'rituel', texte: 'Scavenge ' + reste[0], cout: {...c.cout, exileSoi: true},
        effet: {ops: [{op: 'marqueurs', genre: '+1/+1', n: def.force, a: {cible: 0}, hostile: false}], cibles: [{desc: descForge('Creature'), min: 1, max: 1}], modes: null}});
    }
    case 'Reinforce': {
      const c = reste.length === 2 && n != null ? coutForge(reste[1]) : null;
      if (!c || autresCout(c.cout)) return false;
      return pousse({genre: 'activee', zone: 'main', texte: `Reinforce ${n}`, cout: {...c.cout, defausseSoi: true},
        effet: {ops: [{op: 'marqueurs', genre: '+1/+1', n, a: {cible: 0}, hostile: false}], cibles: [{desc: descForge('Creature'), min: 1, max: 1}], modes: null}});
    }
    case 'Sunburst': return !reste.length && entree({op: 'sunburst'});
    /* Devour N:Type — sacrifier des artefacts, des terrains ou des Nourritures à la place des créatures. */
    case 'Devour': {
      const typ = reste[1] ? reste[1].trim().toLowerCase() : null;
      if (n == null || reste.length < 1 || reste.length > 2 || (typ && !/^[a-z]+$/.test(typ))) return false;
      return entree({op: 'devore', n, ...(typ ? {type: typ} : {})});
    }
    case 'Ascend': def.params.ascend = true; return !reste.length;
    case 'Saddle': return motCleSelle(def, reste);
    case 'Strive': { const c = reste.length === 1 ? coutForge(reste[0]) : null; if (!c || autresCout(c.cout)) return false; def.strive = c.cout.mana; return true; }
    /* Assist : personne n'aide à payer — simplification annoncée, sans
       effet à deux joueurs. Ne pas dégager : il se dégage toujours. */
    case 'Assist': return !reste.length;
    case 'You may choose not to untap CARDNAME during your untap step.': return true;
    case 'CARDNAME must be blocked if able.': def.params.doitEtreBloque = true; return true;
    case 'All creatures able to block CARDNAME do so.': def.params.leurre = true; return true;
    case 'MayEffectFromOpeningHand': {
      const t = reste[0] && forgeSousCapacite(face, reste[0]), e = t && effetForge(face, t, jetons);
      if (!e || e.modes || e.cibles.length || (reste[1] && reste[1] !== '!PlayFirst') || reste.length > 2) return false;
      def.ouverture = {effet: e, pasPremier: reste[1] === '!PlayFirst'};
      return true;
    }
  }
  return null;
}

forgeSait('kw', 'Annihilator', 'Renown', 'Rampage', 'Mobilize', 'Myriad', 'Mentor', 'Graft', 'For Mirrodin', 'Job select', 'Backup', 'Scavenge',
  'Reinforce', 'Sunburst', 'Devour', 'Ascend', 'Strive', 'Assist', 'You may choose not to untap CARDNAME during your untap step.',
  'CARDNAME must be blocked if able.', 'All creatures able to block CARDNAME do so.', 'MayEffectFromOpeningHand');

/* —— Au combat ——————————————————————————————————————————————————— */

/* Le joueur qu'attaque une créature, d'après l'évènement d'attaque. */
function joueurAttaque(P, e) {
  const d = e && e.defenseur;
  if (!d) return null;
  return d.j != null ? d.j : d.pw != null && obj(P, d.pw) ? obj(P, d.pw).ctrl : null;
}

OPS.annihile = function* (P, op, ctx) {
  const j = joueurAttaque(P, ctx.evt);
  if (j == null || P.joueurs[j].elimine) return;
  const ids = champDe(P, j).map(o => o.id);
  for (const id of yield* choisitCartes(P, j, ids, op.n, 'Sacrifier', 'cartes', op.n)) sacrifie(P, id);
};

OPS.renomme = function* (P, op, ctx) {
  const s = sourceCtx(P, ctx);
  if (!s || s.lki || s.zone !== 'champ' || s.renomme) return;
  poseMarqueurs(P, s, '+1/+1', op.n, s);
  s.renomme = true; P.ver++;
};

/* Rampage N : +N/+N par bloqueur au-delà du premier. */
OPS.dechaine = function* (P, op, ctx) {
  const s = sourceCtx(P, ctx), k = s && P.combat ? (P.combat.bloquesPar.get(s.id) || []).length - 1 : 0;
  if (k > 0 && !s.lki) { s.mods.push({f: k * op.n, e: k * op.n, mots: 0, fin: 'tour'}); P.ver++; }
};

/* Des jetons Guerriers rouges 1/1 engagés et attaquants, sacrifiés à
   l'étape de fin. */
OPS.mobilise = function* (P, op, ctx) {
  const s = sourceCtx(P, ctx), avant = new Set(P.champ);
  yield* creeJetonsForge(P, [defJetonCreature('Warrior', 'warrior', 1, 1, ['R'])], op.n, [ctx.ctrl], true, null, false);
  P.champ.filter(id => !avant.has(id)).forEach(id => { const o = obj(P, id); entreAttaquant(P, o, {src: s}); o.finEtape = 'sacrifice'; });
};

/* Myriad : une copie engagée attaquant chaque autre adversaire, exilée à
   la fin du combat — rien à deux joueurs. */
OPS.myriade = function* (P, op, ctx) {
  const s = sourceCtx(P, ctx), dj = joueurAttaque(P, ctx.evt);
  if (!s || !P.combat) return;
  for (const adv of adversaires(P, ctx.ctrl).filter(a => a !== dj)) {
    const avant = new Set(P.champ);
    yield* creeJetonsForge(P, [defJetonCopie(P.cartes[s.cid].def, {})], 1, [ctx.ctrl], true, null, false);
    P.champ.filter(id => !avant.has(id)).forEach(id => { P.combat.attaquants.set(id, {j: adv}); obj(P, id).finCombat = 'exil'; });
  }
};

/* Mentor : un marqueur sur un autre attaquant de force moindre —
   choisi à la résolution plutôt que ciblé, simplification annoncée. */
OPS.mentor = function* (P, op, ctx) {
  const s = sourceCtx(P, ctx);
  if (!s || !P.combat) return;
  const f = car(P, s).force;
  const ids = [...P.combat.attaquants.keys()].filter(id => id !== s.id && obj(P, id) && obj(P, id).ctrl === ctx.ctrl && car(P, obj(P, id)).force < f);
  for (const id of yield* choisitCartes(P, ctx.ctrl, ids, 1, 'Mentor', 'cartes', 1)) poseMarqueurs(P, obj(P, id), '+1/+1', 1, s);
};

/* Graft : déplacer un marqueur sur la créature qui entre — l'IA ne le
   fait que pour les siennes. */
OPS.greffe = function* (P, op, ctx) {
  const s = sourceCtx(P, ctx), c = ctx.evt && obj(P, ctx.evt.id);
  if (!s || s.lki || !c || c.zone !== 'champ' || !(s.marq['+1/+1'] > 0)) return;
  if ((yield* choisitUn(P, ctx.ctrl, ['Déplacer un marqueur', 'Non'], 'Graft', c.ctrl === ctx.ctrl ? 0 : 1, ctx.source)) !== 0) return;
  s.marq['+1/+1']--; P.ver++;
  poseMarqueurs(P, c, '+1/+1', 1, s);
};

/* For Mirrodin!, job select : un jeton créature, et l'équipement s'y
   attache. */
OPS.porteJeton = function* (P, op, ctx) {
  const s = sourceCtx(P, ctx), avant = new Set(P.champ);
  yield* creeJetonsForge(P, [defJetonCreature(op.nom, op.nom.toLowerCase(), op.f, op.e, op.couleurs)], 1, [ctx.ctrl], false, null, false);
  const t = P.champ.find(id => !avant.has(id));
  if (s && !s.lki && s.zone === 'champ' && t != null) { s.att = t; P.ver++; }
};

/* « Must be blocked if able » : un bloqueur libre qui le peut s'y met. La
   source peut être la carte, une statique, ou un bonus du tour
   (`KW$ HIDDEN … must be blocked if able.`, js/forgeEffetsC.js). */
function doitEtreBloque(P, id, fg) {
  const o = obj(P, id);
  return !!(o.def.params.doitEtreBloque || fg.get(id).doitEtreBloque || o.mods.some(m => m.doitEtreBloque));
}
function bloqueursImposes(P, atts, blqs, pose) {
  const cb = P.combat, fg = new Map(atts.map(a => [a, statiquesForgeSur(P, obj(P, a))]));
  /* L'attirance (Lure) : toute créature qui peut le bloquer le bloque. */
  atts.filter(a => obj(P, a).def.params.leurre || fg.get(a).leurre || obj(P, a).mods.some(m => m.leurre)).forEach(a => {
    blqs.forEach(b => { if (!cb.bloqueurs.has(b) && peutBloquer(P, obj(P, b), obj(P, a))) pose(b, a); });
  });
  atts.filter(a => doitEtreBloque(P, a, fg) && !(cb.bloquesPar.get(a) || []).length).forEach(a => {
    const b = blqs.find(x => !cb.bloqueurs.has(x) && peutBloquer(P, obj(P, x), obj(P, a)));
    if (b != null) pose(b, a);
  });
}

/* —— En entrant ——————————————————————————————————————————————————— */

/* Sunburst : un marqueur par couleur de mana dépensée pour le lancer. */
OPS.sunburst = function* (P, op, ctx) {
  const s = sourceCtx(P, ctx), m = s && s.lance && s.lance.mana;
  const n = m ? ['W', 'U', 'B', 'R', 'G'].filter(c => m[c] > 0).length : 0;
  if (n > 0) poseMarqueurs(P, s, estCreature(s) ? '+1/+1' : 'charge', n, s);
};

/* Devour N : sacrifier des créatures en entrant, N marqueurs pour chacune.
   L'IA dévore ses jetons et ce qui vaut moins qu'eux. */
OPS.devore = function* (P, op, ctx) {
  const s = sourceCtx(P, ctx);
  if (!s || s.lki) return;
  const ids = champDe(P, ctx.ctrl).filter(o => o.id !== s.id && (op.type ? estType(o, op.type) || o.def.sousTypes.includes(op.type) : estCreature(o))).map(o => o.id);
  const pris = yield* choisitCartes(P, ctx.ctrl, ids, ids.length, 'Dévorer', 'cartes', 0);
  pris.forEach(id => sacrifie(P, id));
  if (pris.length) poseMarqueurs(P, s, '+1/+1', op.n * pris.length, s);
};

/* —— La bénédiction de la cité ———————————————————————————————————— */

/* Ascend : dix permanents et une source qui monte, et la bénédiction
   reste pour toute la partie. Jugée quand on la demande, ce qui revient
   au même : elle ne se perd jamais. */
function benediction(P, j, src) {
  const J = P.joueurs[j];
  if (J.benediction) return true;
  const mes = champDe(P, j);
  if (mes.length >= 10 && ((src && src.def.params.ascend) || mes.some(o => o.def.params.ascend))) J.benediction = true;
  return !!J.benediction;
}
FORGE_CONDITIONS.Blessing = (P, env) => benediction(P, env.ctrl, env.src);

/* —— Strive ——————————————————————————————————————————————————————— */

/* Le coût d'un sort strive : un supplément par cible au-delà de la
   première. Les cibles qu'on ne peut pas payer sont retirées, les
   dernières d'abord. */
function coutStrive(P, j, s, d, effets, cout, x) {
  const total = () => effets.reduce((n, ef) => n + ef.cibles.reduce((u, cs) => u + cs.length, 0), 0);
  const avec = () => { let c = cout; for (let k = 1; k < total(); k++) c = sommeMana(c, d.strive); return c; };
  while (total() > 1 && !payableAvec(P, j, s, avec(), x)) {
    const ef = [...effets].reverse().find(e => e.cibles.some(cs => cs.length > 1));
    if (!ef) break;
    [...ef.cibles].reverse().find(cs => cs.length > 1).pop();
  }
  return avec();
}

/* —— La main de départ ——————————————————————————————————————————— */

/* Les Leylines, Gemstone Caverns : après les mulligans, chacun, dans
   l'ordre du tour, peut jouer l'effet des cartes de sa main de départ. */
function* effetsOuverture(P) {
  for (const j of ordreApnap(P)) {
    for (const id of P.joueurs[j].main.slice()) {
      const o = obj(P, id), ov = o && o.zone === 'main' && o.def.ouverture;
      if (!ov || (ov.pasPremier && j === P.actif)) continue;
      const r = yield question(P, j, 'oui', ['non', 'oui'], {texte: `${o.def.nom} : depuis la main de départ ?`, source: id});
      if (r === 1) yield* executeOps(P, ov.effet.ops, {source: id, ctrl: j, cibles: [], trouves: [], x: 0, memo: [], memoJ: []});
    }
  }
}
