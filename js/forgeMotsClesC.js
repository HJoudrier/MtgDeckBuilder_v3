/* =====================================================================
   js/forgeMotsClesC.js — Les mots-clés de lancement, suite

   Entwine, replicate, casualty, squad, offspring, blitz, warp : des
   façons de lancer de plus, que `variantesLancement()` propose à
   `variantesSort()` (js/jeuVariantes.js) comme le kicker. Embalm,
   eternalize, encore, transmute, ninjutsu : des capacités qui s'activent
   depuis le cimetière ou la main. Plot : une action spéciale, comme le
   présage, qui exile la carte pour la lancer gratuitement plus tard.

   Ce que la variante payée change se règle au lancement
   (`declencheursDeVariante()`, les copies) ou à l'arrivée du permanent
   (`apresVariante()`, ses capacités de plus).
   ===================================================================== */

/* Un mot-clé de lancement. Rend `null` s'il n'en est pas un. */
function motCleLancement(def, k, face, jetons, tete, reste) {
  const c = reste.length === 1 ? coutForge(reste[0]) : null;
  const active = (zone, texte, cout, op, extra) => {
    def.capacites.push({genre: 'activee', zone, texte, cout, effet: {ops: [{...op, hostile: false}], cibles: [], modes: null}, ...extra});
    return true;
  };
  switch (tete) {
    case 'Entwine': case 'Replicate': case 'Squad': case 'Offspring': case 'Blitz': case 'Warp':
      if (!c || c.cout.engage || c.cout.sacSoi || (tete !== 'Entwine' && tete !== 'Blitz' && autresCout(c.cout))) return false;
      def[{Entwine: 'enlace', Replicate: 'replique', Squad: 'escouade', Offspring: 'rejeton', Blitz: 'blitz', Warp: 'warp'}[tete]] = c.cout;
      return true;
    case 'Casualty':
      if (!/^\d+$/.test(reste[0] || '') || reste.length !== 1) return false;
      def.casualty = +reste[0];
      return true;
    case 'Embalm': case 'Eternalize':
      return !!c && !c.cout.engage && active('cimetiere', tete + ' ' + reste[0], {...c.cout, exileSoi: true}, {op: 'embaume', eternel: tete === 'Eternalize'}, {vitesse: 'rituel'});
    case 'Encore':
      return !!c && !c.cout.engage && active('cimetiere', 'Encore ' + reste[0], {...c.cout, exileSoi: true}, {op: 'rappel'}, {vitesse: 'rituel'});
    case 'Transmute':
      return !!c && !autresCout(c.cout) && active('main', 'Transmute ' + reste[0], {...c.cout, defausseSoi: true}, {op: 'transmute'}, {vitesse: 'rituel'});
    case 'Ninjutsu':
      return !!c && !autresCout(c.cout) && active('main', 'Ninjutsu ' + reste[0],
        {...c.cout, renvoie: {n: 1, desc: descForge('Creature.attacking+unblocked+YouCtrl')}}, {op: 'ninjutsu'}, {phases: 'Declare Blockers->Combat Damage'});
    case 'Plot':
      if (!c || autresCout(c.cout)) return false;
      def.complot = c.cout.mana;
      return true;
  }
  return null;
}

forgeSait('kw', 'Entwine', 'Replicate', 'Squad', 'Offspring', 'Blitz', 'Warp', 'Casualty', 'Embalm', 'Eternalize', 'Encore', 'Transmute',
  'Ninjutsu', 'Plot');

/* —— Les façons de lancer ———————————————————————————————————————— */

/* Un sort modal lancé avec entwine : tous ses modes. */
function defEnlacee(d) {
  const m = d.sort && d.sort.modes;
  return m ? {...d, sort: {...d.sort, modes: {...m, min: m.options.length, max: m.options.length}}} : d;
}

/* Les variantes de ce fichier, pour `variantesSort()`. Replicate et squad
   se paient jusqu'à trois fois : trois actions de plus suffisent. */
function variantesLancement(P, j, o, depuis, essaie) {
  const d = o.def;
  if (depuis !== 'main' && depuis !== 'commandement') return;
  const base = coutSort(P, j, o, depuis);
  const plus = (c, k) => { let m = base; for (let i = 0; i < k; i++) m = sommeMana(m, c.mana); return m; };
  if (d.enlace && d.sort && d.sort.modes) essaie('entwine', plus(d.enlace, 1), fusionAutres(d.coutSup, autresCout(d.enlace)), defEnlacee(d));
  for (let k = 1; k <= 3; k++) {
    if (d.replique) essaie('replicate' + k, plus(d.replique, k), d.coutSup || null);
    if (d.escouade) essaie('squad' + k, plus(d.escouade, k), d.coutSup || null);
  }
  if (d.casualty != null) essaie('casualty', base, fusionAutres(d.coutSup, {sac: {desc: descForge('Creature.powerGE' + d.casualty), n: 1}}));
  if (d.rejeton) essaie('offspring', plus(d.rejeton, 1), d.coutSup || null);
  if (d.blitz && depuis === 'main') essaie('blitz', coutSort(P, j, o, depuis, d.blitz.mana), fusionAutres(d.coutSup, autresCout(d.blitz)));
  if (d.warp && depuis === 'main') essaie('warp', coutSort(P, j, o, depuis, d.warp.mana), d.coutSup || null);
}

/* Le nombre de fois qu'une variante répétable a été payée. */
const foisVariante = (v, nom) => { const m = new RegExp('^' + nom + '(\\d)$').exec(v || ''); return m ? +m[1] : 0; };

/* Lancée depuis l'exil après plot ou warp : gratuitement, ou à son coût,
   à partir du tour suivant. Rend vrai si la carte relève d'ici. */
function variantesExilLancement(P, j, o, essaie) {
  if (o.complotTour != null) { if (o.complotTour < P.tour) essaie('complot', coutManaVide(), o.def.coutSup || null); return true; }
  if (o.warpTour != null) { if (o.warpTour < P.tour) essaie(null, coutSort(P, j, o, 'exil'), o.def.coutSup || null); return true; }
  return false;
}

/* Une carte de l'exil que plot ou warp laissent lancer ; un sort comploté
   ne se lance qu'à la vitesse d'un rituel. */
function exilLancable(P, o, rituel) {
  return (o.complotTour != null && o.complotTour < P.tour && rituel) || (o.warpTour != null && o.warpTour < P.tour);
}

/* —— Au lancement : les copies ——————————————————————————————————— */

const CAP_REPLIQUE = {genre: 'declenchee', ecoutes: [], texte: 'Copies du sort', effet: {ops: [{op: 'replique', hostile: false}], cibles: [], modes: null}};

/* Replicate et casualty : « when you cast this spell, copy it » — une
   capacité déclenchée, comme la tempête. */
function declencheursDeVariante(P, item) {
  if (foisVariante(item.variante, 'replicate') || item.variante === 'casualty')
    P.enAttente.push({src: item.id, ctrl: item.ctrl, cap: CAP_REPLIQUE, evt: {t: 'lance', joueur: item.ctrl, def: item.def}});
}

OPS.replique = function* (P, op, ctx) {
  const it = P.pile.find(x => x.id === ctx.source);
  if (!it) return;
  const n = it.variante === 'casualty' ? 1 : foisVariante(it.variante, 'replicate');
  for (let k = 0; k < n; k++) yield* copieSort(P, ctx.ctrl, obj(P, it.id), it, true);
};

/* —— À l'arrivée : ce que la variante ajoute au permanent ————————— */

const capArrivee = (texte, op) => ({genre: 'declenchee', ecoutes: [{evt: 'entre', sujet: 'soi'}], texte, effet: {ops: [{...op, hostile: false}], cibles: [], modes: null}});
const CAP_BLITZ = {genre: 'declenchee', ecoutes: [{evt: 'meurt', sujet: 'soi'}], texte: 'Blitz : piocher', effet: {ops: [{op: 'pioche', n: 1, qui: {vous: 1}, hostile: false}], cibles: [], modes: null}};

/* Blitz : la célérité, une carte à sa mort, sacrifié à l'étape de fin.
   Squad, offspring : des jetons copies en entrant. Warp : exilé à l'étape
   de fin, d'où il se relancera. */
function apresVariante(P, o, v) {
  if (!o || !v) return;
  const plus = (a) => { o.anime = [...(o.anime || []), {fin: 'jamais', ...a}]; P.ver++; };
  if (v === 'blitz') { plus({mots: MOT.CELERITE, capacites: [CAP_BLITZ]}); o.finEtape = 'sacrifice'; }
  else if (foisVariante(v, 'squad')) plus({capacites: [capArrivee('Squad', {op: 'copiesSoi', n: foisVariante(v, 'squad')})]});
  else if (v === 'offspring') plus({capacites: [capArrivee('Offspring', {op: 'copiesSoi', n: 1, petit: true})]});
  else if (v === 'warp') { o.finEtape = 'exil'; o.warp = true; }
  else if (v === 'optionnel') o.optionnel = true;
}

/* Une copie-jeton d'une définition, avec ce qu'on lui change. */
function defJetonCopie(d, plus) {
  const r = {...d, jeton: true, ...plus};
  delete r._eph; delete r._ecoute; delete r._faceCachee;
  return r;
}

OPS.copiesSoi = function* (P, op, ctx) {
  const s = sourceCtx(P, ctx);
  if (!s) return;
  const d = defJetonCopie(P.cartes[s.cid].def, op.petit ? {force: 1, endurance: 1} : {});
  yield* creeJetonsForge(P, [d], op.n, [ctx.ctrl], false, null, false);
};

/* —— Depuis le cimetière et la main ———————————————————————————————— */

/* La carte d'une capacité qui s'est exilée ou défaussée en coût. */
const carteDuCout = (P, ctx) => (ctx.lki && ctx.lki.def) || (obj(P, ctx.source) || {}).def || null;

/* Embalm : une copie blanche, Zombie, sans coût de mana ; eternalize : une
   copie noire 4/4. */
OPS.embaume = function* (P, op, ctx) {
  const d = carteDuCout(P, ctx);
  if (!d) return;
  const plus = {couleurs: [op.eternel ? 'B' : 'W'], sousTypes: [...new Set([...d.sousTypes, 'zombie'])], cout: coutManaVide(), mv: 0};
  if (op.eternel) { plus.force = 4; plus.endurance = 4; }
  yield* creeJetonsForge(P, [defJetonCopie(d, plus)], 1, [ctx.ctrl], false, null, false);
};

/* Encore : une copie par adversaire, avec la célérité, qui attaque ce tour
   si elle le peut et se sacrifie à l'étape de fin. */
OPS.rappel = function* (P, op, ctx) {
  const d = carteDuCout(P, ctx);
  if (!d) return;
  for (const adv of adversaires(P, ctx.ctrl)) {
    const avant = new Set(P.champ);
    yield* creeJetonsForge(P, [defJetonCopie(d, {})], 1, [ctx.ctrl], false, null, false);
    P.champ.filter(id => !avant.has(id)).forEach(id => {
      const o = obj(P, id);
      o.anime = [...(o.anime || []), {fin: 'jamais', mots: MOT.CELERITE}];
      o.finEtape = 'sacrifice'; o.attaqueForcee = {tour: P.tour, j: adv};
    });
    P.ver++;
  }
};
function attaqueForcee(P, o) { return !!o.attaqueForcee && o.attaqueForcee.tour === P.tour; }

/* Transmute : chercher une carte de même valeur de mana. */
OPS.transmute = function* (P, op, ctx) {
  const d = carteDuCout(P, ctx), B = P.joueurs[ctx.ctrl].bibliotheque;
  if (!d) return;
  const ids = B.filter(id => obj(P, id).def.mv === d.mv);
  const pris = yield* choisitCartes(P, ctx.ctrl, ids, 1, 'Chercher', 'cartes', 0);
  pris.forEach(id => deplace(P, id, 'main'));
  melangeHasard(P.rng, B);
};

/* Ninjutsu : le ninja entre engagé et attaquant, à la place de
   l'attaquant non bloqué renvoyé en main — simplification annoncée : il
   attaque le premier adversaire. */
OPS.ninjutsu = function* (P, op, ctx) {
  const s = obj(P, ctx.source);
  if (!s || s.zone !== 'main' || !P.combat) return;
  const n = yield* metEnJeu(P, s.id, ctx.ctrl, {});
  if (n != null) entreAttaquant(P, obj(P, n), {});
};

/* —— Plot ————————————————————————————————————————————————————————— */

/* Comploter : payer le coût et exiler la carte de sa main, à la vitesse
   d'un rituel ; elle se lancera gratuitement à partir du tour suivant. */
function* complote(P, j, a) {
  const o = obj(P, a.id);
  if (!o || o.zone !== 'main' || !o.def.complot || !paieMana(P, j, o.def.complot, 0)) return false;
  const n = deplace(P, a.id, 'exil');
  obj(P, n).complotTour = P.tour;
  jn(P, `${P.joueurs[j].nom} complote ${o.def.nom}`);
  return true;
}

/* Les actions de plot d'un joueur. */
function actionsComplot(P, j, rituel) {
  if (!rituel) return [];
  return P.joueurs[j].main.filter(id => obj(P, id).def.complot && planPaiement(P, j, obj(P, id).def.complot, 0)).map(id => ({k: 'comploter', id}));
}
