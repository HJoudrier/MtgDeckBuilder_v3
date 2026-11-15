/* =====================================================================
   js/iaCombatCalcul.js — Le combat calculé

   Un petit jeu à deux, presque à information complète : l'attaquant
   choisit qui attaque, le défenseur répond par ses blocages, et l'issue se
   note avec la note commune (js/iaEvaluation.js). L'attaquant prend
   l'ensemble dont la pire réponse est la meilleure : un alpha-bêta à deux
   niveaux, qui abandonne une attaque dès qu'une réponse la rend pire que
   la meilleure déjà trouvée.

   Le combat se joue sur un modèle réduit, sans le moteur : force,
   endurance, blessures, initiative et double initiative, contact mortel,
   piétinement, lien de vie, indestructible, infection, menace, et les
   restrictions de blocage du moteur (`peutBloquer()`). Les tours de magie,
   les déclencheurs de combat et la prévention n'y sont pas : les niveaux
   moyen et fort les voient, sur une copie de la partie.

   Le calcul a un budget de positions ; au-delà, le joueur automatique
   revient aux règles de js/iaCombat.js.
   ===================================================================== */

const BUDGET_COMBAT = 4000, MAX_BLOQUEURS_CALCUL = 6, MAX_ATTAQUANTS_CALCUL = 7;

/* Ce que le combat lit d'une créature. */
function combattant(P, o) {
  const c = car(P, o), m = c.mots;
  return {id: o.id, ctrl: o.ctrl, f: Math.max(0, c.force), pv: c.endurance - (o.bless || 0), val: valeurObjet(P, o),
    init: !!(m & (MOT.INITIATIVE | MOT.DOUBLE)), normal: !(m & MOT.INITIATIVE) || !!(m & MOT.DOUBLE),
    contact: !!(m & MOT.CONTACT), pietine: !!(m & MOT.PIETINEMENT), lien: !!(m & MOT.LIEN),
    indestr: !!(m & MOT.INDESTRUCTIBLE), infect: !!(m & MOT.INFECTION), vigilance: !!(m & MOT.VIGILANCE)};
}

/* L'issue d'un combat : `blocs` lie chaque attaquant à ses bloqueurs. Rend
   les morts, les blessures et le poison du défenseur, la vie gagnée par
   chacun. L'attaquant répartit ses blessures en tuant d'abord les
   bloqueurs qui valent le plus ; le surplus d'un piétineur va au joueur. */
function issueCombat(atts, blocs) {
  const degats = new Map(), touche = new Set(), morts = new Set(), gains = new Map();
  let joueur = 0, poison = 0;
  const vivant = x => !morts.has(x.id);
  const blesse = (x, n, src) => { if (n <= 0) return; degats.set(x.id, (degats.get(x.id) || 0) + n); if (src.contact) touche.add(x.id); if (src.lien) gains.set(src.ctrl, (gains.get(src.ctrl) || 0) + n); };
  const auJoueur = (a, n) => { if (n <= 0) return; if (a.infect) poison += n; else joueur += n; if (a.lien) gains.set(a.ctrl, (gains.get(a.ctrl) || 0) + n); };
  const tous = [...atts, ...[].concat(...blocs.values())];
  for (const etape of [1, 2]) {
    const frappe = x => vivant(x) && (etape === 1 ? x.init : x.normal);
    for (const a of atts) {
      const bs = blocs.get(a.id) || [];
      if (frappe(a)) {
        if (!bs.length) auJoueur(a, a.f);
        else {
          let reste = a.f;
          const encore = bs.filter(vivant).sort((x, y) => y.val - x.val);
          for (const b of encore) {
            if (reste <= 0) break;
            const letal = a.contact ? 1 : Math.max(1, b.pv - (degats.get(b.id) || 0));
            const n = Math.min(reste, letal);
            blesse(b, n, a); reste -= n;
          }
          if (reste > 0) { if (a.pietine || !encore.length) { if (a.pietine) auJoueur(a, reste); } else blesse(encore[0], reste, a); }
        }
      }
      for (const b of bs) if (frappe(b)) blesse(a, b.f, b);
    }
    for (const x of tous) if (vivant(x) && !x.indestr && ((degats.get(x.id) || 0) >= x.pv || touche.has(x.id))) morts.add(x.id);
  }
  return {morts, joueur, poison, gains};
}

/* L'écart que `evalue()` lit : la vie et le poison du défenseur, la vie
   gagnée, les morts ; et, pour l'attaquant, ce que la riposte du tour
   suivant lui coûterait avec les bloqueurs qui lui restent. */
function ecartCombat(P, j, defenseur, issue, rip) {
  const vie = {}, poison = {[defenseur]: issue.poison};
  const vieDe = i => vie[i] != null ? vie[i] : P.joueurs[i].vie;
  vie[defenseur] = vieDe(defenseur) - issue.joueur;
  issue.gains.forEach((n, i) => { vie[i] = vieDe(i) + n; });
  if (rip) vie[j] = vieDe(j) - riposte(rip, issue.morts) * POIDS_COMBAT.riposte;
  return {vie, poison, morts: issue.morts};
}
const POIDS_COMBAT = {riposte: 0.3};

/* Ce que la riposte lit, préparé une fois par ensemble d'attaquants : nos
   créatures qui resteront dégagées, et les créatures de chaque adversaire,
   les plus fortes d'abord. */
function preparationRiposte(P, j, engages) {
  const vol = o => !!(car(P, o).mots & MOT.VOL), bloqueVol = o => !!(car(P, o).mots & (MOT.VOL | MOT.PORTEE));
  return {gardes: champDe(P, j).filter(o => estCreature(o) && !o.engage && !engages.has(o.id)).map(o => ({id: o.id, vol: bloqueVol(o)})),
    adv: adversaires(P, j).map(k => champDe(P, k).filter(o => estCreature(o) && car(P, o).force > 0)
      .map(o => ({id: o.id, f: car(P, o).force, vol: vol(o)})).sort((x, y) => y.f - x.f))};
}

/* Ce que l'adversaire le plus fort frapperait au tour suivant : ses
   créatures qui restent, moins celles que nos créatures restées dégagées
   arrêtent (chacune la plus grosse qu'elle peut bloquer). */
function riposte(rip, morts) {
  const gardes = rip.gardes.filter(g => !morts.has(g.id));
  let pire = 0;
  for (const atts of rip.adv) {
    const libres = new Set(gardes.map(g => g.id));
    let total = 0;
    for (const a of atts) {
      if (morts.has(a.id)) continue;
      const b = gardes.find(g => libres.has(g.id) && (!a.vol || g.vol));
      if (b) libres.delete(b.id); else total += a.f;
    }
    pire = Math.max(pire, total);
  }
  return pire;
}

/* Les blocages possibles, bloqueur par bloqueur : ne pas bloquer, ou l'un
   des attaquants qu'il peut bloquer. Rend la meilleure note pour celui qui
   décide (`signe` = +1 pour le défenseur qui maximise, -1 quand le
   défenseur minimise la note de l'attaquant), en coupant dès que `borne`
   est franchie. `compte.n` porte le budget de positions. Si les blocages
   possibles dépassent `plafond`, chaque bloqueur ne garde que les
   attaquants les plus dangereux, jusqu'à ce que la recherche tienne :
   face à vingt gobelins, elle n'épuise pas son budget pour rien. */
function chercheBlocs(P, atts, blqs, note, borne, signe, compte, plafond = BUDGET_COMBAT) {
  const choix = blqs.map(b => [null, ...atts.filter(a => peutBloquer(P, obj(P, b.id), obj(P, a.id))).sort((x, y) => (y.f + y.val) - (x.f + x.val))]);
  const taille = () => choix.reduce((t, l) => t * l.length, 1);
  while (taille() > plafond) {
    const l = choix.reduce((a, b) => b.length > a.length ? b : a);
    if (l.length <= 2) break;
    l.pop();
  }
  const mins = new Map(atts.map(a => [a.id, Math.max(aMot(P, obj(P, a.id), MOT.MENACE) ? 2 : 1, bornesBlocage(P, obj(P, a.id)).min)]));
  const cur = new Array(blqs.length).fill(null);
  let meilleur = -Infinity, plan = null;
  const feuille = () => {
    const blocs = new Map();
    cur.forEach((a, i) => { if (a) { if (!blocs.has(a.id)) blocs.set(a.id, []); blocs.get(a.id).push(blqs[i]); } });
    for (const [id, bs] of blocs) if (bs.length < mins.get(id)) blocs.delete(id);
    const v = signe * note(blocs);
    if (v > meilleur) { meilleur = v; plan = cur.slice(); }
  };
  const rec = i => {
    if (compte.n > BUDGET_COMBAT || meilleur >= borne) return;
    if (i === blqs.length) { compte.n++; feuille(); return; }
    for (const a of choix[i]) { cur[i] = a; rec(i + 1); if (meilleur >= borne) return; }
    cur[i] = null;
  };
  rec(0);
  return {valeur: meilleur, plan};
}

/* Les bloqueurs que le calcul retient : ceux qui peuvent bloquer un
   attaquant, les plus utiles d'abord, au plus quelques-uns. */
function bloqueursUtiles(P, d, atts) {
  return champDe(P, d).filter(o => estCreature(o) && !o.engage && !car(P, o).nePeutBloquer && atts.some(a => peutBloquer(P, o, obj(P, a.id))))
    .sort((x, y) => valeurObjet(P, y) - valeurObjet(P, x)).slice(0, MAX_BLOQUEURS_CALCUL).map(o => combattant(P, o));
}

/* La meilleure attaque contre un défenseur : l'ensemble d'attaquants dont
   la pire réponse vaut le plus. Rend `null` si le budget est dépassé. */
function meilleureAttaque(P, j, d, cands, compte) {
  const tous = cands.map(o => combattant(P, o));
  if (tous.length > MAX_ATTAQUANTS_CALCUL) return null;
  const blqs = bloqueursUtiles(P, d, tous);
  let best = -Infinity, choix = [];
  for (let masque = 0; masque < (1 << tous.length); masque++) {
    const atts = tous.filter((_, i) => masque & (1 << i));
    const rip = preparationRiposte(P, j, new Set(atts.filter(a => !a.vigilance).map(a => a.id)));
    const note = blocs => evalue(P, j, ecartCombat(P, j, d, issueCombat(atts, blocs), rip));
    /* Le défenseur minimise : on cherche son meilleur (signe −1) et l'on
       coupe dès que sa réponse rend l'attaque pire que la meilleure. */
    const r = atts.length && blqs.length ? chercheBlocs(P, atts, blqs, note, -best, -1, compte, Math.max(64, BUDGET_COMBAT >> tous.length)) : {valeur: -note(new Map())};
    if (compte.n > BUDGET_COMBAT) return null;
    const v = -r.valeur;
    if (v > best + 1e-9) { best = v; choix = atts.map(a => a.id); }
  }
  return {valeur: best, ids: choix};
}

/* Les attaquants calculés, au format de la question : `null` si le calcul
   ne s'applique pas (trop de créatures, budget dépassé). En multijoueur,
   seuls les deux défenseurs que la règle de js/iaCombat.js préfère sont
   calculés : les autres coûtaient un tiers du temps d'une partie à quatre
   pour presque rien. */
function attaqueCalculee(P, q) {
  const j = q.joueur, defs = q.extra.defenseurs, compte = {n: 0};
  const score = d => -P.joueurs[d.j].vie + menace(P, d.j) * 0.2 - forceDeFrappe(P, d.j) * 0.1;
  const retenus = new Set(defs.map((d, di) => [d, di]).filter(([d]) => d.j != null).sort((a, b) => score(b[0]) - score(a[0])).slice(0, 2).map(x => x[1]));
  let best = null;
  defs.forEach((def, di) => {
    if (!retenus.has(di) || best === false) return;
    const cands = q.options.map(id => obj(P, id)).filter(o => car(P, o).force > 0 && attaquePermise(P, o, def) && taxeAttaque(P, o, def) <= 0);
    const r = meilleureAttaque(P, j, def.j, cands, compte);
    if (!r) { best = false; return; }
    if (!best || r.valeur > best.valeur) best = {...r, di};
  });
  if (!best) return null;
  return best.ids.map(id => [q.options.indexOf(id), best.di]);
}

/* Les bloqueurs calculés, au format de la question, ou `null`. */
function blocageCalcule(P, q) {
  const j = q.joueur, atts = q.extra.attaquants.map(id => combattant(P, obj(P, id)));
  const blqs = q.options.map(id => obj(P, id)).filter(o => atts.some(a => peutBloquer(P, o, obj(P, a.id))))
    .sort((x, y) => valeurObjet(P, y) - valeurObjet(P, x)).slice(0, MAX_BLOQUEURS_CALCUL).map(o => combattant(P, o));
  if (!blqs.length) return [];
  const compte = {n: 0};
  const note = blocs => evalue(P, j, ecartCombat(P, j, j, issueCombat(atts, blocs), null));
  const r = chercheBlocs(P, atts, blqs, note, Infinity, 1, compte);
  if (compte.n > BUDGET_COMBAT || !r.plan) return null;
  return r.plan.map((a, i) => a ? [q.options.indexOf(blqs[i].id), q.extra.attaquants.indexOf(a.id)] : null).filter(Boolean);
}
