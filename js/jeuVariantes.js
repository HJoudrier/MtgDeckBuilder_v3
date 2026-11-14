/* =====================================================================
   js/jeuVariantes.js — Les autres façons de lancer et de payer

   Kicker, rachat (buyback), évocation, présage (foretell) : une carte se
   lance de plusieurs façons, et chacune devient une action de priorité
   distincte (`{k: 'lancer', variante}`), avec son coût. La convocation
   (convoke) et l'exploration (delve) paient une part générique en
   engageant des créatures ou en exilant des cartes du cimetière ;
   l'affinité la réduit (js/jeuLancer.js `coutSort()`). L'écho se paie au
   premier entretien.

   Ces champs vivent sur la définition, quelle que soit sa source :
   l'oracle range déjà `kicker` et `cycling`, Forge les remplit tous
   (js/forgeMotsCles.js).
   ===================================================================== */

const MANA_DEUX = {sym: ['{2}'], generique: 2, couleurs: {W: 0, U: 0, B: 0, R: 0, G: 0, C: 0}, hybrides: [], x: 0, total: 2};

/* Un coût ramené à `{mana, …}` : l'oracle range un coût en mana seul. */
function coutComplet(c) { return !c ? null : c.sym ? {mana: c} : c; }

/* La part d'un coût qui n'est pas du mana, ou `null`. */
function autresCout(c) {
  if (!c) return null;
  const r = {...c};
  delete r.mana;
  return Object.keys(r).length ? r : null;
}

/* Deux coûts en mana, additionnés. */
function sommeMana(a, b) {
  if (!b) return a;
  const couleurs = {...a.couleurs};
  Object.keys(b.couleurs).forEach(k => { couleurs[k] = (couleurs[k] || 0) + b.couleurs[k]; });
  return {sym: [...a.sym, ...b.sym], generique: a.generique + b.generique, couleurs, hybrides: [...a.hybrides, ...b.hybrides],
    x: a.x + b.x, total: a.total + b.total};
}

/* Deux parts non-mana réunies, ou `undefined` si elles se recouvrent : le
   moteur ne sait pas payer deux sacrifices différents d'un même coût. */
function fusionAutres(a, b) {
  if (!a || !b) return a || b || null;
  if (Object.keys(b).some(k => a[k] != null)) return undefined;
  return {...a, ...b};
}

/* Les créatures qu'on peut engager pour convoquer : pas celles qui
   produisent du mana, que le paiement compte déjà. */
function convocables(P, j) {
  return champDe(P, j).filter(x => estCreature(x) && !x.engage && !x.def.capacites.some(k => k.genre === 'mana'));
}

function moinsGenerique(c, n) {
  const g = Math.min(c.generique, n);
  return g ? {...c, generique: c.generique - g, total: c.total - g} : c;
}

/* Un coût réduit par des créatures convoquées : chacune paie un mana de
   l'une de ses couleurs encore dû, sinon un générique (règle 702.51a). */
function convoque(c, creatures) {
  const r = {...c, couleurs: {...c.couleurs}};
  let libres = 0;
  for (const o of creatures) {
    const k = o.def.couleurs.find(x => r.couleurs[x] > 0);
    if (k) { r.couleurs[k]--; r.total--; } else libres++;
  }
  return moinsGenerique(r, libres);
}

/* Les créatures à convoquer, les plus utiles d'abord : celles dont une
   couleur est due. */
function ordreConvocation(P, j, c) {
  const utile = o => o.def.couleurs.some(k => c.couleurs[k] > 0) ? 1 : 0;
  return convocables(P, j).sort((a, b) => utile(b) - utile(a));
}

/* Le coût après convocation des `n` premières créatures et exploration de
   `m` cartes. */
function reduit(o, c, creatures, m) {
  let r = o.def.params.convocation ? convoque(c, creatures) : c;
  return o.def.params.delve ? moinsGenerique(r, m) : r;
}

/* Un coût en mana est-il payable, réductions comprises ? */
function payableAvec(P, j, o, mana, x) {
  if (planPaiement(P, j, mana, x, {sort: o})) return true;
  const d = o.def;
  if (!d.params.convocation && !d.params.delve) return false;
  const cim = d.params.delve ? P.joueurs[j].cimetiere.filter(id => id !== o.id).length : 0;
  return !!planPaiement(P, j, reduit(o, mana, d.params.convocation ? convocables(P, j) : [], cim), x, {sort: o});
}

/* Les façons légales de lancer une carte d'où elle est : `[{variante,
   mana, autre}]`, la façon ordinaire en tête. */
function variantesSort(P, j, o, depuis) {
  const d = o.def, r = [];
  const essaie = (variante, mana, autre) => {
    if (autre === undefined || !payableAvec(P, j, o, mana, 0)) return;
    if (autre && !coutAutrePossible(P, j, o, autre)) return;
    r.push({variante, mana, autre});
  };
  /* Défaussée avec la folie, ou au bout de sa suspension : une seule façon. */
  if (depuis === 'exil' && o.folie) { essaie('folie', coutSort(P, j, o, depuis, coutComplet(d.folie).mana), null); return r; }
  if (depuis === 'exil' && o.suspendu) { if (!o.temps) essaie('suspension', coutManaVide(), null); return r; }
  const base = coutSort(P, j, o, depuis);
  essaie(null, base, d.coutSup || null);
  const k = coutComplet(d.kicker);
  if (k) essaie('kicker', sommeMana(base, k.mana), fusionAutres(d.coutSup, autresCout(k)));
  const b = coutComplet(d.rachat);
  if (b) essaie('rachat', sommeMana(base, b.mana), fusionAutres(d.coutSup, autresCout(b)));
  const e = coutComplet(d.evocation);
  if (e && depuis === 'main') essaie('evocation', coutSort(P, j, o, depuis, e.mana), d.coutSup || null);
  return r;
}

/* Une variante choisie, retrouvée au moment de lancer. */
function varianteDe(P, j, o, depuis, v) {
  return variantesSort(P, j, o, depuis).find(x => x.variante === (v || null)) || null;
}

/* Payer par convocation et exploration ce qu'il faut pour que le reste se
   paie en mana. Le joueur choisit ; s'il choisit trop peu, ou les
   mauvaises couleurs, on prend le plus petit ensemble qui suffit. Rien
   n'est engagé ni exilé tant que le paiement n'est pas assuré. Rend le
   coût qui reste, ou `null`. */
function* paieReductions(P, j, o, mana, x) {
  const d = o.def, pour = {sort: o};
  if (!d.params.convocation && !d.params.delve) return mana;
  if (planPaiement(P, j, mana, x, pour)) return mana;
  const cands = d.params.convocation ? ordreConvocation(P, j, mana) : [];
  const cim = d.params.delve ? P.joueurs[j].cimetiere.filter(id => id !== o.id) : [];
  let n = 0;
  while (n < cands.length && !planPaiement(P, j, reduit(o, mana, cands.slice(0, n), cim.length), x, pour)) n++;
  if (!planPaiement(P, j, reduit(o, mana, cands.slice(0, n), cim.length), x, pour)) return null;
  let pris = cands.slice(0, n);
  if (cands.length && n) {
    const ids = yield* choisitCartes(P, j, cands.map(c => c.id), cands.length, 'Convoquer', 'cartes', n);
    const choix = ids.map(id => obj(P, id));
    if (planPaiement(P, j, reduit(o, mana, choix, cim.length), x, pour)) pris = choix;
  }
  const reste = d.params.convocation ? convoque(mana, pris) : mana;
  let m = 0;
  while (m < cim.length && !planPaiement(P, j, moinsGenerique(reste, m), x, pour)) m++;
  let exiles = cim.slice(0, m);
  if (m) {
    const ids = yield* choisitCartes(P, j, cim, Math.min(reste.generique, cim.length), 'Explorer', 'cartes', m);
    if (planPaiement(P, j, moinsGenerique(reste, ids.length), x, pour)) exiles = ids;
  }
  const final = moinsGenerique(reste, exiles.length);
  if (!planPaiement(P, j, final, x, pour)) return null;
  pris.forEach(c => { c.engage = true; });
  exiles.forEach(id => deplace(P, id, 'exil'));
  P.ver++;
  return final;
}

/* Présager : exiler la carte face cachée pour {2}, pendant son tour. Elle
   se lancera depuis l'exil, pour son coût de présage, à partir du tour
   suivant. */
function* presage(P, j, a) {
  const o = obj(P, a.id);
  if (!o || o.zone !== 'main' || !paieMana(P, j, MANA_DEUX, 0)) return false;
  const n = deplace(P, a.id, 'exil');
  obj(P, n).presageTour = P.tour;
  jn(P, `${P.joueurs[j].nom} présage une carte`);
  return true;
}

/* Un permanent évoqué est sacrifié en entrant : une capacité déclenchée,
   comme le dit la règle 702.74a. */
const CAP_EVOCATION = {genre: 'declenchee', texte: 'Évoqué : sacrifié',
  effet: {ops: [{op: 'sacrifieObjet', a: {soi: 1}}], cibles: [], modes: null}};

/* L'écho : au premier entretien de son contrôleur, payer ou sacrifier. */
const CAP_ECHO = {genre: 'declenchee', ecoutes: [{evt: 'echo'}], texte: 'Écho',
  effet: {ops: [{op: 'echo'}], cibles: [], modes: null}};

OPS.echo = function* (P, op, ctx) {
  const s = sourceCtx(P, ctx);
  if (!s || s.lki || s.zone !== 'champ' || !s.echoDu) return;
  s.echoDu = false;
  const c = coutComplet(s.def.echo);
  if (c && planPaiement(P, ctx.ctrl, c.mana, 0)) {
    const r = yield question(P, ctx.ctrl, 'oui', ['non', 'oui'], {texte: `Payer l'écho de ${s.def.nom} ?`, source: s.id,
      extra: {saufForge: {contre: false}}});
    if (r === 1 && paieMana(P, ctx.ctrl, c.mana, 0)) return;
  }
  sacrifie(P, s.id);
};

/* La folie : la carte défaussée attend en exil ; sa capacité propose de la
   lancer pour son coût de folie, sinon elle va au cimetière. */
const CAP_FOLIE = {genre: 'declenchee', texte: 'Folie', effet: {ops: [{op: 'folie', hostile: false}], cibles: [], modes: null}};

OPS.folie = function* (P, op, ctx) {
  const s = sourceCtx(P, ctx);
  if (!s || s.lki || s.zone !== 'exil' || !s.folie) return;
  const j = s.prop, cid = s.cid;
  let lance = false;
  if (varianteDe(P, j, s, 'exil', 'folie')) {
    const r = yield question(P, j, 'oui', ['non', 'oui'], {texte: `Lancer ${s.def.nom} pour son coût de folie ?`, source: s.id});
    if (r === 1) lance = yield* lanceSort(P, j, {k: 'lancer', id: s.id, depuis: 'exil', variante: 'folie'});
  }
  if (!lance) {
    const reste = P.joueurs[j].exil.find(id => obj(P, id).cid === cid);
    if (reste != null) deplace(P, reste, 'cimetiere');
  }
};

/* L'exhumation : la carte revient du cimetière avec la célérité, part en
   exil à la prochaine étape de fin, et en exil où qu'elle aille. */
OPS.exhume = function* (P, op, ctx) {
  const s = sourceCtx(P, ctx);
  if (!s || s.lki || s.zone !== 'cimetiere') return;
  const n = yield* metEnJeu(P, s.id, ctx.ctrl, {});
  const no = obj(P, n);
  if (!no) return;
  no.exhume = true;
  no.mods.push({f: 0, e: 0, mots: MOT.CELERITE, fin: 'jamais'});
  P.ver++;
};

function exhumeesFin(P) {
  P.champ.filter(id => obj(P, id).exhume).forEach(id => deplace(P, id, 'exil'));
}

/* La suspension : payer et exiler la carte avec des marqueurs de temps ; à
   chaque entretien de son propriétaire, un marqueur part ; au dernier, elle
   se lance sans payer son coût, et une créature gagne la célérité. */
function suspendable(P, j, o, rituel) {
  const s = o.def.suspension;
  return !!s && (rituel || estEphemere(o.def)) && !!planPaiement(P, j, s.cout, 0);
}

function* suspend(P, j, a) {
  const o = obj(P, a.id);
  if (!o || o.zone !== 'main' || !paieMana(P, j, o.def.suspension.cout, 0)) return false;
  const n = obj(P, deplace(P, a.id, 'exil'));
  n.suspendu = true; n.temps = o.def.suspension.n;
  jn(P, `${P.joueurs[j].nom} suspend ${o.def.nom} (${n.temps})`);
  return true;
}

const CAP_SUSPENSION = {genre: 'declenchee', texte: 'Suspension', effet: {ops: [{op: 'suspension', hostile: false}], cibles: [], modes: null}};

function suspensionsEntretien(P) {
  P.joueurs[P.actif].exil.forEach(id => {
    const o = obj(P, id);
    if (!o.suspendu || !o.temps) return;
    o.temps--;
    if (!o.temps) P.enAttente.push({src: id, ctrl: P.actif, cap: CAP_SUSPENSION, evt: {t: 'etape', etape: 'entretien', actif: P.actif}});
  });
}

OPS.suspension = function* (P, op, ctx) {
  const s = sourceCtx(P, ctx);
  if (!s || s.lki || s.zone !== 'exil' || !s.suspendu || s.temps) return;
  yield* lanceSort(P, s.prop, {k: 'lancer', id: s.id, depuis: 'exil', variante: 'suspension'});
};
