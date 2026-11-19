/* =====================================================================
   js/forgeMotsClesE.js — Les mots-clés de lancement, II

   Des façons de lancer qui changent le sort ou ce qu'on paie :
   - Overload : « target » devient « each » — le sort est recompilé avec
     ses cibles changées en désignations (`Defined$ Valid …`) ;
   - Awaken : le sort, plus des marqueurs sur un terrain qui s'anime ;
   - Sneak : pendant l'étape des bloqueurs, en renvoyant un attaquant non
     bloqué ; une créature entre engagée et attaquante ;
   - Mayhem : depuis le cimetière, si la carte a été défaussée ce tour ;
   - Gift : promettre un cadeau à un adversaire, qu'il reçoit d'abord ;
   - Bargain : sacrifier un artefact, un enchantement ou un jeton ;
   - Conspire : engager deux créatures qui partagent une couleur, et copier ;
   - Emerge : sacrifier une créature, le coût réduit de sa valeur de mana.
   Et Firebending (du mana rouge qui dure jusqu'à la fin du combat), Cipher
   (le sort encodé sur une créature, relancé à ses blessures).
   ===================================================================== */

/* Un tableau de Forge réécrit en texte, pour une face recompilée. */
const texteTable = t => Object.entries(t).map(([k, v]) => k + '$ ' + v).join(' | ');

/* Les mots-clés de ce fichier, lus par js/forgeMotsCles.js `motCleForge()`.
   Rend `null` si ce n'en est pas un. */
function motCleLancementB(def, face, jetons, tete, reste) {
  const mana = () => { const c = reste.length === 1 ? manaSeul(reste[0]) : null; return c ? coutComplet(c).mana : null; };
  switch (tete) {
    case 'Overload': return surchargeForge(def, face, jetons, mana());
    case 'Awaken': return reste.length === 2 && /^\d+$/.test(reste[0]) && eveilForge(def, face, jetons, +reste[0], manaSeul(reste[1]));
    case 'Sneak': return !!(def.sneak = mana());
    case 'Mayhem': return !!(def.mayhem = mana());
    case 'Emerge': return !!(def.emerge = mana());
    case 'Bargain': return !reste.length && (def.marchandage = true);
    case 'Conspire': return !reste.length && !!def.sort && (def.conspire = true);
    case 'Cipher': return !reste.length && !!def.sort && (def.chiffre = true);
    case 'Splice': {
      const c = reste.length === 2 ? manaSeul(reste[1]) : null;
      if (!c || !def.sort) return false;
      def.epissure = {sur: reste[0].split(',').map(x => x.trim().toLowerCase()), cout: coutComplet(c).mana};
      return true;
    }
    case 'Gift': {
      const sub = forgeSousCapacite(face, 'GiftAbility'), e = sub && effetForge(face, sub, jetons);
      if (reste.length || !e || e.cibles.length || e.modes) return false;
      def.cadeau = e;
      return true;
    }
    case 'Firebending': {
      /* X : la force de la créature ou le nombre de créatures contrôlées ; les marqueurs d'expérience ne se comptent pas ici. */
      const suite = reste.slice(1).join(':'), x = reste[0] !== 'X' ? null : /power/.test(suite) ? 'force' : /number of creatures you control/.test(suite) ? 'creatures' : null;
      if (!x && (reste.length !== 1 || !/^\d+$/.test(reste[0]))) return false;
      def.capacites.push({genre: 'declenchee', ecoutes: [{evt: 'attaque', sujet: 'soi'}], texte: 'Firebending ' + reste[0],
        effet: {ops: [{op: 'feu', n: x ? 0 : +reste[0], ...(x ? {x} : {}), hostile: false}], cibles: [], modes: null}});
      return true;
    }
  }
  return null;
}

/* —— Overload, Awaken : le sort recompilé ——————————————————————————— */

/* Le sort surchargé : chaque cible devient « chacun de ceux-là ». Ce que la
   cible désignait plus loin (`Targeted`) devient la même désignation. */
function surchargeForge(def, face, jetons, cout) {
  const sp = face.a.filter(t => t.SP);
  if (!cout || sp.length !== 1 || !def.sort) return false;
  const svars = {...face.svars}, f2 = {...face, svars};
  let quoi = null;
  const chaque = t => {
    const u = {};
    for (const [k, v] of Object.entries(t)) if (!/^(ValidTgts|TgtPrompt|TargetMin|TargetMax|TargetUnique|TgtZone)$/.test(k)) u[k] = v;
    if (t.ValidTgts) {
      if (t.TgtZone && t.TgtZone !== 'Battlefield') return null;
      quoi = /^(Player|Opponent)$/.test(t.ValidTgts) ? t.ValidTgts : (t.Origin === 'Graveyard' ? 'ValidGraveyard ' : 'Valid ') + t.ValidTgts;
      u.Defined = quoi;
    } else if (/^(Targeted|ParentTarget)$/.test(t.Defined || '') && quoi) u.Defined = quoi;
    return Object.values(u).some(v => /Targeted|ParentTarget/.test(v)) ? null : u;
  };
  const racine = chaque(sp[0]);
  if (!racine) return false;
  for (let t = sp[0], k = 0; t && t.SubAbility && k < 10; k++) {
    const nom = t.SubAbility, sub = forgeSousCapacite(face, nom);
    if (!sub) break;
    const u = chaque(sub);
    if (!u) return false;
    svars[nom] = texteTable(u);
    t = sub;
  }
  const sort = effetForge(f2, racine, jetons, true);
  if (!sort || sort.cibles.length || sort.modes) return false;
  def.surcharge = {cout, def: {...def, sort}};
  return true;
}

/* Awaken N : au bout de la chaîne du sort, N marqueurs +1/+1 sur un
   terrain qu'on contrôle, qui devient une créature Élémental 0/0 avec la
   célérité. */
function eveilForge(def, face, jetons, n, c) {
  const sp = face.a.filter(t => t.SP);
  if (!c || sp.length !== 1 || !def.sort) return false;
  const svars = {...face.svars, EveilMarqueurs: `DB$ PutCounter | ValidTgts$ Land.YouCtrl | TgtPrompt$ Select target land you control | CounterType$ P1P1 | CounterNum$ ${n} | SubAbility$ EveilAnime`,
    EveilAnime: 'DB$ Animate | Defined$ ParentTarget | Power$ 0 | Toughness$ 0 | Types$ Creature,Elemental | Keywords$ Haste | Duration$ Permanent'};
  let racine = sp[0], t = sp[0], dernier = null;
  for (let k = 0; t.SubAbility && k < 10; k++) { const s = forgeSousCapacite(face, t.SubAbility); if (!s) return false; dernier = t.SubAbility; t = s; }
  if (dernier) svars[dernier] = texteTable({...t, SubAbility: 'EveilMarqueurs'}); else racine = {...sp[0], SubAbility: 'EveilMarqueurs'};
  const sort = effetForge({...face, svars}, racine, jetons, true);
  if (!sort || sort.modes) return false;
  def.eveil = {cout: coutComplet(c).mana, def: {...def, sort}};
  return true;
}

/* —— Les variantes ———————————————————————————————————————————————— */

/* Les façons de lancer de ce fichier, ajoutées par js/jeuVariantesB.js
   `variantesEtendues()`. */
function variantesMotsClesE(P, j, o, depuis, essaie) {
  const d = o.def, base = () => coutSort(P, j, o, depuis);
  if (depuis === 'main') {
    if (d.surcharge) essaie('surcharge', coutSort(P, j, o, depuis, d.surcharge.cout), d.coutSup || null, d.surcharge.def);
    if (d.eveil) essaie('eveil', coutSort(P, j, o, depuis, d.eveil.cout), d.coutSup || null, d.eveil.def);
    if (d.sneak && P.etape === 'bloqueurs' && P.combat && P.actif === j)
      essaie('sneak', coutSort(P, j, o, depuis, d.sneak), fusionAutres(d.coutSup, {renvoie: {n: 1, desc: descForge('Creature.attacking+unblocked+YouCtrl')}}));
    if (d.cadeau && adversaires(P, j).length) essaie('gift', base(), d.coutSup || null);
    if (d.marchandage) essaie('bargain', base(), fusionAutres(d.coutSup, {sac: {n: 1, desc: descForge('Artifact,Enchantment,Permanent.token')}}));
    if (d.conspire) essaie('conspire', base(), fusionAutres(d.coutSup, {conspire: true}));
    /* Emerge : une variante par créature qu'on sacrifierait. */
    if (d.emerge) champDe(P, j).filter(estCreature).forEach(c => {
      const m = coutSort(P, j, o, depuis, d.emerge), g = Math.min(m.generique, mvDe(c));
      essaie('emerge' + c.id, {...m, generique: m.generique - g, total: m.total - g}, fusionAutres(d.coutSup, {sacId: c.id}));
    });
  }
  if (depuis === 'cimetiere' && d.mayhem && o.defausseTour === P.tour) essaie('mayhem', coutSort(P, j, o, depuis, d.mayhem), d.coutSup || null);
}

/* Sneak se lance à l'étape des bloqueurs, quelle que soit la vitesse du
   sort (js/jeuLancer.js). */
const sneakPossible = (P, j) => P.etape === 'bloqueurs' && !!P.combat && P.actif === j && P.joueurs[j].main.some(id => obj(P, id).def.sneak);

/* Une carte défaussée garde le tour où elle l'a été (Mayhem). */
defausseCarte = (g => function (P, id, j) {
  const n = g(P, id, j);
  if (n != null && obj(P, n)) obj(P, n).defausseTour = P.tour;
  return n;
})(defausseCarte);

/* Ce que payent Conspire et Emerge en plus : deux créatures qui partagent
   une couleur avec le sort, engagées ; la créature choisie, sacrifiée. */
const conspirateurs = (P, j, o) => champDe(P, j).filter(x => estCreature(x) && !x.engage && car(P, x).couleurs.some(c => o.def.couleurs.includes(c)));
coutAutrePossible = (g => function (P, j, o, c) {
  if (!c || (!c.conspire && c.sacId == null)) return g(P, j, o, c);
  if (c.conspire && conspirateurs(P, j, o).length < 2) return false;
  if (c.sacId != null && !(obj(P, c.sacId) && obj(P, c.sacId).zone === 'champ')) return false;
  const r = {...c}; delete r.conspire; delete r.sacId;
  return g(P, j, o, r);
})(coutAutrePossible);
paieAutre = (g => function* (P, j, o, c) {
  if (!c || (!c.conspire && c.sacId == null)) return yield* g(P, j, o, c);
  if (c.conspire) (yield* choisitCartes(P, j, conspirateurs(P, j, o).map(x => x.id), 2, 'Engager (conspire)', 'cartes', 2)).forEach(id => engageObjet(P, obj(P, id)));
  if (c.sacId != null && obj(P, c.sacId)) sacrifie(P, c.sacId);
  const r = {...c}; delete r.conspire; delete r.sacId;
  return yield* g(P, j, o, r);
})(paieAutre);

/* Conspire : « when you do, copy it » — un déclencheur au lancement. */
const CAP_CONSPIRE = {genre: 'declenchee', texte: 'Conspire', effet: {ops: [{op: 'conspire', hostile: false}], cibles: [], modes: null}};
OPS.conspire = function* (P, op, ctx) {
  const it = P.pile.find(x => x.id === ctx.source);
  if (it) yield* copieSort(P, ctx.ctrl, obj(P, it.id), it, true);
};
declencheursDeVariante = (g => function (P, item) {
  if (item.variante === 'conspire') P.enAttente.push({src: item.id, ctrl: item.ctrl, cap: CAP_CONSPIRE, evt: {t: 'lance', joueur: item.ctrl, def: item.def}});
  return g(P, item);
})(declencheursDeVariante);

/* À l'arrivée : la créature de Sneak attaque ; le cadeau d'un permanent
   se donne en entrant ; le marchandage se retient. */
const CAP_CADEAU = {genre: 'declenchee', texte: 'Gift', effet: {ops: [{op: 'cadeau', hostile: false}], cibles: [], modes: null}};
apresVariante = (g => function (P, o, v) {
  if (!o) return g(P, o, v);
  if (v === 'sneak') entreAttaquant(P, o, {});
  else if (v === 'bargain') o.marchande = true;
  else if (v === 'gift') { o.cadeauPromis = true; P.enAttente.push({src: o.id, ctrl: o.ctrl, cap: CAP_CADEAU, evt: {t: 'entre', id: o.id}}); }
  return g(P, o, v);
})(apresVariante);

/* —— Splice ———————————————————————————————————————————————————————— */

/* Au lancement d'un sort Arcane (ou d'un type que dit le mot-clé), les
   cartes de la main qui s'y greffent : on les révèle, on paie leur coût en
   plus, et leurs effets s'ajoutent au sort, avec leurs cibles. Elles restent
   en main (js/jeuActions.js `lanceSort()`). Rend le coût en mana total. */
function* epissures(P, j, s, d, cout, effets) {
  const types = [...d.types, ...d.sousTypes];
  const ok = P.joueurs[j].main.map(id => obj(P, id)).filter(o => o && o.def.epissure && o.def.epissure.sur.some(t => types.includes(t)) &&
    payableAvec(P, j, s, sommeMana(cout, o.def.epissure.cout), 0));
  if (!ok.length) return cout;
  for (const id of yield* choisitCartes(P, j, ok.map(o => o.id), ok.length, 'Greffer (splice)', 'cartes', 0)) {
    const o = obj(P, id), c2 = sommeMana(cout, o.def.epissure.cout);
    if (!payableAvec(P, j, s, c2, 0)) continue;
    const e = yield* prepareEffets(P, j, s, o.def.sort, d.couleurs);
    if (!e) continue;
    effets.push(...e); cout = c2;
    jn(P, `${P.joueurs[j].nom} greffe ${o.def.nom} sur ${d.nom}`);
  }
  return cout;
}

/* —— Gift ————————————————————————————————————————————————————————— */

/* Donner le cadeau : l'adversaire choisi (`Promised`) le reçoit. Pour un
   éphémère ou un rituel, avant le reste du sort (js/jeuPile.js). */
function* donneCadeau(P, d, id, ctx) {
  const opp = adversaires(P, ctx.ctrl);
  if (!d.cadeau || !opp.length) return;
  const i = opp.length > 1 ? yield* choisitUn(P, ctx.ctrl, opp.map(k => P.joueurs[k].nom), 'Promettre le cadeau à', 0, id) : 0;
  ctx.promis = opp[i];
  if (obj(P, id)) obj(P, id).cadeauPromis = true;
  jn(P, `${P.joueurs[ctx.ctrl].nom} promet un cadeau à ${P.joueurs[ctx.promis].nom}`);
  yield* executeOps(P, d.cadeau.ops, ctx);
}
OPS.cadeau = function* (P, op, ctx) {
  const s = sourceCtx(P, ctx);
  if (s && s.def.cadeau) yield* donneCadeau(P, s.def, s.id, ctx);
};

/* —— Firebending ———————————————————————————————————————————————————— */

/* Du mana rouge qui dure jusqu'à la fin du combat : la réserve le garde
   d'une étape à l'autre tant que le combat dure (js/jeuMana.js
   `videReserves()`). */
OPS.feu = function* (P, op, ctx) {
  const J = P.joueurs[ctx.ctrl], s = sourceCtx(P, ctx);
  const n = op.x === 'force' ? (s && !s.lki ? Math.max(0, car(P, s).force) : 0) : op.x === 'creatures' ? champDe(P, ctx.ctrl).filter(estCreature).length : op.n;
  J.pool.R += n; J.feu = (J.feu || 0) + n; P.ver++;
};

/* —— Cipher ———————————————————————————————————————————————————————— */

/* Après la résolution, exiler la carte encodée sur une créature qu'on
   contrôle (js/jeuPile.js). Rend vrai si elle l'a été. */
function* encodeChiffre(P, item) {
  const o = obj(P, item.id), j = item.ctrl;
  if (!o || P.cartes[o.cid].copieSort) return false;
  const cs = champDe(P, j).filter(estCreature);
  if (!cs.length) return false;
  const pris = yield* choisitCartes(P, j, cs.map(x => x.id), 1, 'Encoder sur', 'cartes', 0);
  if (!pris.length) return false;
  const n = deplace(P, item.id, 'exil'), c = obj(P, pris[0]);
  if (n == null) return true;
  obj(P, n).encodeSur = c.id;
  (c.anime = c.anime || []).push({fin: 'jamais', capacites: [CAP_CHIFFRE]}); P.ver++;
  jn(P, `${o.def.nom} est encodé sur ${c.def.nom}`);
  return true;
}
const CAP_CHIFFRE = {genre: 'declenchee', ecoutes: [{evt: 'degatsJoueur', sujet: 'soi', combat: true}], texte: 'Cipher',
  effet: {ops: [{op: 'chiffre', hostile: false}], cibles: [], modes: null}};

/* Lancer une copie de chaque carte encodée sur la créature, sans payer. */
OPS.chiffre = function* (P, op, ctx) {
  const s = sourceCtx(P, ctx), j = ctx.ctrl;
  if (!s) return;
  for (const J of P.joueurs) for (const id of J.exil.slice()) {
    const e = obj(P, id);
    if (!e || e.encodeSur !== s.id) continue;
    const cid = nouvelleCarte(P, P.cartes[e.cid].def, j, false, true);
    P.cartes[cid].copieSort = true;
    const c = creeObjet(P, cid, j, 'main');
    P.joueurs[j].main.push(c.id);
    if (!(yield* lanceDepuisEffet(P, j, c, true))) P.joueurs[j].main.filter(x => x === c.id).forEach(x => { retireDe(P.joueurs[j].main, x); P.objets.delete(x); });
  }
};

FORGE_CONDITIONS.Bargain = (P, env) => (env.ctx && env.ctx.variante === 'bargain') || !!(env.src && (env.src.marchande || env.src.varianteLance === 'bargain'));

forgeSait('kw', 'Splice', 'Overload', 'Awaken', 'Sneak', 'Mayhem', 'Emerge', 'Bargain', 'Conspire', 'Cipher', 'Gift', 'Firebending');
forgeSait('expr', 'Count$Bargained', 'Count$PromisedGift');
forgeSait('filtre', 'PromisedGift', 'Bargain');
forgeSait('defini', 'Promised');
forgeSait('param', 'Token.LockTokenScript', 'Token.GiftDescription', 'AddTurn.GiftDescription', 'Draw.GiftDescription', 'PutCounter.GiftDescription', 'ChangeZone.GiftDescription', 'GainLife.GiftDescription');
