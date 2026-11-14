/* =====================================================================
   js/jeuVue.js — Ce qu'un joueur voit de la partie

   L'état d'une partie (`P`) sait tout : l'ordre des bibliothèques, la main
   de chacun. Un joueur humain n'en reçoit qu'une **vue** : le champ de
   bataille, la pile, les cimetières, l'exil et la zone de commandement de
   tout le monde, sa propre main, et pour le reste des nombres. Rien d'un
   objet caché d'autrui ne la traverse — ni son nom, ni son identifiant :
   les identifiants d'une bibliothèque suivent l'ordre de la liste, et une
   carte piochée garde le sien ; l'envoyer trahirait sa place.

   La vue est un objet ordinaire, sérialisable tel quel : c'est elle qui
   part vers le téléphone d'un invité, et elle que la table locale peint.
   ===================================================================== */

/* La fiche d'affichage d'une carte : ce qu'un humain lit sur elle. */
function ficheVue(def) {
  return {cout: def.coutTexte || '', type: def.typeLigne || '', texte: def.texteOracle || '',
    f: def.force, e: def.endurance, l: def.loyaute, couv: def.couverture ? def.couverture.etat : ''};
}

/* Un permanent tel qu'on le voit : ses caractéristiques du moment, son
   état, sa place dans le combat. */
function objetVue(P, o, cartes) {
  const c = car(P, o), cb = P.combat;
  if (!cartes[o.def.nom]) cartes[o.def.nom] = ficheVue(o.def);
  const att = cb && cb.attaquants.get(o.id);
  return {id: o.id, nom: o.def.nom, ctrl: o.ctrl, prop: o.prop, engage: o.engage, types: o.def.types,
    f: c.force, e: c.endurance, bless: o.bless, marq: {...o.marq}, att: o.att, jeton: o.jeton, cmd: o.cmd,
    mots: c.mots, malade: estCreature(o) && !o.pret && !(c.mots & MOT.CELERITE),
    attaque: att ? (att.j != null ? {j: att.j} : {pw: att.pw}) : null,
    bloque: cb && cb.bloqueurs.has(o.id) ? cb.bloqueurs.get(o.id) : null};
}

/* Une carte d'une zone publique, ou de sa propre main. */
function carteVue(P, id, cartes) {
  const o = obj(P, id);
  if (!cartes[o.def.nom]) cartes[o.def.nom] = ficheVue(o.def);
  return {id, nom: o.def.nom};
}

/* Le libellé d'une cible ou d'un joueur. */
function libelleRef(P, c) {
  if (c && typeof c === 'object') return c.j != null ? P.joueurs[c.j].nom : '?';
  const o = obj(P, c);
  return o ? o.def.nom : '?';
}

/* La vue du joueur `j`. */
function vue(P, j) {
  const cartes = {};
  const joueurs = P.joueurs.map(J => ({
    i: J.i, nom: J.nom, vie: J.vie, poison: J.poison, energie: J.energie || 0, main: J.main.length, bib: J.bibliotheque.length,
    cim: J.cimetiere.map(id => carteVue(P, id, cartes)), exil: J.exil.map(id => carteVue(P, id, cartes)),
    cmd: J.commandement.map(id => carteVue(P, id, cartes)), degatsCmd: {...J.degatsCmd},
    elimine: J.elimine, raison: J.raison, pool: {...J.pool}}));
  const pile = P.pile.map(it => ({id: it.id, nom: it.sort ? it.def.nom : it.nom, ctrl: it.ctrl, sort: !!it.sort,
    cibles: [].concat(...it.effets.map(ef => [].concat(...ef.cibles))).map(c => libelleRef(P, c))}));
  P.pile.forEach(it => { if (it.sort && !cartes[it.def.nom]) cartes[it.def.nom] = ficheVue(it.def); });
  return {moi: j, tour: P.tour, etape: P.etape, actif: P.actif, joueurs, pile,
    champ: P.champ.map(id => objetVue(P, obj(P, id), cartes)),
    main: P.joueurs[j].main.map(id => carteVue(P, id, cartes)),
    fin: P.fin ? {gagnant: P.fin.gagnant, nulle: !!P.fin.nulle, raison: P.fin.raison} : null, cartes};
}

/* Le libellé d'une action de priorité. */
function libelleAction(P, a) {
  if (a.k === 'passer') return 'Passer';
  const o = obj(P, a.id), nom = o ? o.def.nom : '?';
  if (a.k === 'terrain') return 'Jouer ' + (a.variante === 'dos' && o ? o.def.dos.nom : nom);
  if (a.k === 'retourner') return 'Retourner ' + (o && o.vraieDef ? o.vraieDef.nom : nom);
  if (a.k === 'equiper') return 'Équiper : ' + nom;
  if (a.k === 'presager') return 'Présager ' + nom;
  if (a.k === 'suspendre') return 'Suspendre ' + nom;
  if (a.k === 'lancer') return 'Lancer ' + nom + (a.depuis === 'commandement' ? ' (commandant)' : a.depuis === 'cimetiere' ? ' (flashback)' :
    a.depuis === 'exil' ? ' (présage)' : '') + (({kicker: ' (kicker)', rachat: ' (rachat)', evocation: ' (évocation)', folie: ' (folie)', suspension: ' (suspension)',
      morph: ' (face cachée)'}[a.variante] || (a.variante === 'dos' || a.variante === 'aventure' ? ` (${o.def.dos.nom})` : '')));
  const k = o && capacitesDe(P, o)[a.i];
  return nom + ' — ' + ((k && k.texte) || 'capacité');
}

/* Une question telle qu'un humain la reçoit : des libellés, des
   références, des bornes — et rien de ce que le moteur garde pour lui
   (définitions, opérations, descripteurs). Les cartes d'une recherche ne
   vont qu'au joueur qui cherche : c'est à lui seul que la question est posée. */
function questionPourUI(P, q) {
  const base = {n: q.n, q: q.q, joueur: q.joueur, min: q.min, max: q.max, multi: q.multi, texte: q.texte || '',
    source: q.source && obj(P, q.source) ? q.source : null};
  const ref = c => (c && typeof c === 'object') ? {j: c.j, label: libelleRef(P, c)} : {id: c, label: libelleRef(P, c)};
  switch (q.q) {
    case 'priorite': return {...base, options: q.options.map(a => ({k: a.k, id: a.id, i: a.i, depuis: a.depuis, label: libelleAction(P, a)}))};
    case 'cibles': return {...base, options: q.options.map(ref), aura: !!(q.extra && q.extra.aura)};
    case 'attaquants': return {...base, options: q.options.map(ref),
      defenseurs: q.extra.defenseurs.map(d => d.j != null ? {j: d.j, label: P.joueurs[d.j].nom} : {pw: d.pw, label: libelleRef(P, d.pw)})};
    case 'bloqueurs': {
      const atts = q.extra.attaquants;
      return {...base, options: q.options.map(id => ({...ref(id), legaux: atts.map((a, i) => peutBloquer(P, obj(P, id), obj(P, a)) ? i : -1).filter(i => i >= 0)})),
        attaquants: atts.map(a => ({...ref(a), menace: aMot(P, obj(P, a), MOT.MENACE)}))};
    }
    case 'mulligan': return {...base, options: q.options, mulligans: q.extra ? q.extra.n : 0};
    case 'modes': case 'x': case 'oui': return {...base, options: q.options.map(String)};
  }
  const cartes = {};
  const opts = q.options.map(id => { const o = obj(P, id); if (o && !cartes[o.def.nom]) cartes[o.def.nom] = ficheVue(o.def); return ref(id); });
  return {...base, options: opts, cartes};
}
