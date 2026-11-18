/* =====================================================================
   js/forgePaliers.js — Les paliers : Station, classes, Rooms, vitesse

   Quatre mécaniques où un permanent, ou un joueur, monte d'un cran :
   - Station : engager une autre créature pose autant de marqueurs charge
     que sa force ; les seuils « STATION N+ » sont déjà des statiques à
     condition de marqueurs ;
   - les classes : monter d'un niveau, dans l'ordre, à la vitesse d'un
     rituel ; ce que chaque niveau accorde n'agit qu'à partir de lui ;
   - les Rooms : deux portes, l'une ouverte en lançant sa moitié, l'autre
     déverrouillée pour son coût ;
   - la vitesse (« Start your engines! ») : de 1 à 4, elle monte une fois
     par tour quand un adversaire perd des points de vie pendant le tien.
   ===================================================================== */

/* Les mots-clés des paliers, lus par js/forgeMotsCles.js `motCleForge()`.
   Rend `null` si ce n'en est pas un. */
function motClePalier(def, tete, reste, face, jetons) {
  switch (tete) {
    case 'Station':
      if (reste.length) return false;
      def.capacites.push({genre: 'activee', vitesse: 'rituel', texte: 'Station', cout: {mana: coutManaVide(), engageAutres: {n: 1, desc: descForge('Creature')}},
        effet: {ops: [{op: 'station', hostile: false}], cibles: [], modes: null}});
      return true;
    case 'Class': return niveauForge(def, reste, face, jetons);
    case 'Start your engines':
      if (reste.length) return false;
      def.entree = def.entree || {};
      (def.entree.forge = def.entree.forge || []).push({effet: {ops: [{op: 'demarre'}]}, optionnel: false});
      return true;
  }
  return null;
}

/* —— Station ———————————————————————————————————————————————————— */

/* Autant de marqueurs charge que la force des créatures engagées pour le
   coût (`ctx.engages`, js/jeuActions.js `paieAutre()`). */
OPS.station = function* (P, op, ctx) {
  const s = sourceCtx(P, ctx);
  if (!s || s.lki || s.zone !== 'champ') return;
  const n = (ctx.engages || []).map(id => obj(P, id) || P.lkis.get(id)).filter(Boolean).reduce((t, o) => t + Math.max(0, o.lki ? o.force || 0 : car(P, o).force), 0);
  if (n > 0) poseMarqueurs(P, s, 'charge', n, s);
};

/* —— Les classes ———————————————————————————————————————————————— */

/* `K:Class:N:coût:AddTrigger$ … | AddStaticAbility$ …` : la capacité de
   monter au niveau N, et ce que ce niveau accorde, gardé par la condition
   « ce permanent est au niveau N ou plus ». */
function niveauForge(def, reste, face, jetons) {
  const n = +reste[0], c = reste.length >= 3 ? manaSeul(reste[1]) : null;
  if (!(n >= 2) || !c) return false;
  /* Un déclencheur qui porte déjà son IsPresent garde son niveau à part (`ClassLevelAtLeast`, jugé par conditionForge). */
  const garde = t => t.IsPresent ? {...t, ClassLevelAtLeast: String(n)} : {...t, IsPresent: 'Card.Self+ClassLevelGE' + n};
  for (const part of reste.slice(2).join(':').split('|').map(x => x.trim()).filter(Boolean)) {
    const m = /^(AddTrigger|AddStaticAbility|AddReplacementEffect)\$ (.+)$/.exec(part);
    if (!m) return false;
    for (const nom of m[2].split('&').map(x => x.trim())) {
      /* Un remplacement porte son niveau (js/forgeRemplacements.js `remplacementsEnJeu()`). */
      if (m[1] === 'AddReplacementEffect') {
        const r = face.svars[nom] && forgeTable(face.svars[nom]), k = (def.remplacements || []).length;
        if (!r || r.Event === 'Moved' || !remplacementForge(def, face, r) || (def.remplacements || []).length !== k + 1) return false;
        def.remplacements[k].palier = n;
        continue;
      }
      const t = face.svars[nom] && garde(forgeTable(face.svars[nom]));
      if (!t) return false;
      if (m[1] === 'AddTrigger') { if (!declencheurForge(def, face, t, jetons)) return false; }
      else { const st = statiqueForge(face, t, jetons); if (!st) return false; def.statiques.push(st); }
    }
  }
  def.capacites.push({genre: 'activee', vitesse: 'rituel', texte: 'Niveau ' + n, palier: n, cout: {mana: coutComplet(c).mana},
    effet: {ops: [{op: 'niveau', n, hostile: false}], cibles: [], modes: null}});
  return true;
}

conditionForge = (g => function (P, t, env) {
  if (t.ClassLevelAtLeast && (!env.src || (env.src.niveau || 1) < +t.ClassLevelAtLeast)) return false;
  return g(P, t, env);
})(conditionForge);

/* Une capacité de palier ne s'active qu'au niveau d'avant (js/forgeInterdits.js
   `activationInterdite()`). */
const palierInterdit = (o, k) => k.palier != null && (o.niveau || 1) !== k.palier - 1;

OPS.niveau = function* (P, op, ctx) {
  const s = sourceCtx(P, ctx);
  if (!s || s.lki || s.zone !== 'champ' || (s.niveau || 1) !== op.n - 1) return;
  s.niveau = op.n; P.ver++;
  jn(P, `${s.def.nom} passe au niveau ${op.n}`);
  emet(P, {t: 'niveau', id: s.id, n: op.n, ctrl: s.ctrl});
};
forgeMode('ClassLevelGained', ['ValidCard', 'ClassLevel'], (P, t, e, s, env) => e.t === 'niveau' && valideOuRien(P, obj(P, e.id), t.ValidCard, s, env) &&
  (!t.ClassLevel || e.n === +t.ClassLevel));

/* —— Les Rooms ————————————————————————————————————————————————————— */

/* Une Room : chaque moitié porte la capacité de déverrouiller l'autre, à
   la vitesse d'un rituel. Forge en fait une action spéciale, sans la pile ;
   ici une capacité — on peut y répondre, simplification annoncée. */
function portesRoom(def) {
  const d = def.dos;
  if (!d || !def.sousTypes.includes('room') || !d.sousTypes.includes('room')) return;
  const porte = (a, b, cote) => a.capacites.push({genre: 'activee', vitesse: 'rituel', texte: 'Déverrouiller ' + b.nom, porte: cote, cout: {mana: b.cout},
    effet: {ops: [{op: 'deverrouille', cote, hostile: false}], cibles: [], modes: null}});
  porte(def, d, 'dos');
  porte(d, def, 'avant');
}

/* Les deux portes ouvertes : une définition qui les réunit, gardée sur la
   carte. Les capacités de déverrouillage n'y sont plus. */
function defRoomOuverte(k) {
  if (k.roomOuverte) return k.roomOuverte;
  const a = k.def, b = k.def.dos, union = (x, y) => [...new Set([...x, ...y])];
  k.roomOuverte = {...a, nom: a.nom.includes(' // ') ? a.nom : a.nom + ' // ' + b.nom, cout: sommeMana(a.cout, b.cout), mv: a.mv + b.mv, dos: null,
    types: union(a.types, b.types), sousTypes: union(a.sousTypes, b.sousTypes), couleurs: union(a.couleurs, b.couleurs),
    capacites: [...a.capacites, ...b.capacites].filter(c => !c.porte), statiques: [...a.statiques, ...b.statiques],
    remplacements: [...(a.remplacements || []), ...(b.remplacements || [])], mots: a.mots | b.mots};
  return k.roomOuverte;
}

OPS.deverrouille = function* (P, op, ctx) {
  const s = sourceCtx(P, ctx), k = s && P.cartes[s.cid];
  if (!s || s.lki || s.zone !== 'champ' || !k || !k.def.dos) return;
  const ouverte = op.cote === 'dos' ? k.def.dos : k.def;
  if (s.def !== (op.cote === 'dos' ? k.def : k.def.dos)) return;
  s.def = defRoomOuverte(k); P.ver++;
  jn(P, `${s.def.nom} : la porte ${ouverte.nom} s'ouvre`);
  emet(P, {t: 'porte', id: s.id, joueur: s.ctrl, ouverte, complet: true});
};
/* « When you unlock this door » : le déclencheur de la moitié ouverte. */
forgeMode('UnlockDoor', ['ValidPlayer', 'ValidCard', 'ThisDoor'], (P, t, e, s, env) => e.t === 'porte' && joueurOuRien(P, e.joueur, t.ValidPlayer, s, env) &&
  valideOuRien(P, obj(P, e.id), t.ValidCard, s, env) && (t.ThisDoor !== 'True' || e.ouverte.capacites.some(k => k.ecoutes && k.ecoutes.some(x => x.t === t))));
forgeMode('FullyUnlock', ['ValidPlayer', 'ValidCard'], (P, t, e, s, env) => e.t === 'porte' && e.complet && joueurOuRien(P, e.joueur, t.ValidPlayer, s, env) &&
  valideOuRien(P, obj(P, e.id), t.ValidCard, s, env));

/* —— La vitesse ——————————————————————————————————————————————————— */

/* « Start your engines! » : sans vitesse, on part de 1. */
OPS.demarre = function* (P, op, ctx) {
  const s = sourceCtx(P, ctx), J = s && P.joueurs[s.ctrl];
  if (J && J.vitesse == null) { J.vitesse = 1; P.vitesses = true; }
};

/* Une perte de vie d'un adversaire pendant ton tour : ta vitesse monte, une
   fois par tour, jusqu'à 4 (js/jeuHistorique.js `noteHistorique()`). Forge en
   fait un déclencheur ; elle monte ici sur-le-champ. */
function vitesseMonte(P, e) {
  const J = P.joueurs[P.actif];
  if (!J || J.vitesse == null || J.vitesse >= 4 || J.vitesseTour === P.tour || e.joueur === P.actif || !(e.n > 0)) return;
  J.vitesse++; J.vitesseTour = P.tour; P.ver++;
  jn(P, `${J.nom} passe à la vitesse ${J.vitesse}`);
}

FORGE_CONDITIONS.MaxSpeed = (P, env) => P.joueurs[env.ctrl].vitesse === 4;

forgeSait('kw', 'Station', 'Class', 'Start your engines');
forgeSait('expr', 'Count$YourSpeed');
