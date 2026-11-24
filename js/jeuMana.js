/* =====================================================================
   js/jeuMana.js — La réserve de mana, et le paiement automatique

   Par défaut, personne ne choisit à la main quels terrains engager : un
   solveur le fait. (Le joueur qui préfère engager ses sources lui-même, et ne
   payer que sur sa réserve, passe au paiement manuel : js/jeuManaManuel.js.) Les symboles colorés passent d'abord, appariés aux
   sources par chemins augmentants — un Forêt-Île ne doit pas payer le vert
   que seule une Forêt pouvait payer, laissant le bleu sans source —, puis le
   générique, payé par les sources les moins précieuses : les terrains avant
   les accélérateurs, un Trésor qu'il faut sacrifier en dernier.

   Les capacités de mana qui coûtent elles-mêmes du mana (filtres, Signets)
   ne servent pas à ce solveur : js/jeuManaFiltres.js le complète quand il
   échoue.
   ===================================================================== */

const LETTRES_MANA = ['W', 'U', 'B', 'R', 'G', 'C'];

/* Les couleurs de l'identité d'un joueur : celles de ses commandants. Sans
   commandant, un « mana de l'identité » n'en produit aucun (règle 903.4f). */
function identiteJoueur(P, j) {
  const k = new Set();
  P.cartes.forEach(c => { if (c.cmd && c.prop === j) c.def.couleurs.forEach(x => k.add(x)); });
  return [...k];
}

/* Les sources de mana qu'un joueur peut activer maintenant, une par objet :
   un objet à deux capacités {T} n'en active qu'une. */
/* Une source au mana restreint (« spend this mana only to cast creature
   spells ») sert-elle à payer ceci ? `pour` : `{sort}` ou `{capacite}`
   — sans lui, jamais : on ne sait pas ce qu'on paie. */
function manaPermis(P, j, filtre, pour) {
  if (!pour) return false;
  return forgeFiltre(filtre).some(a => {
    const reste = a.props.length ? '.' + a.props.join('+') : '';
    if (a.tete === 'Spell' && pour.sort) return forgeValideDef(pour.sort.def, 'Card' + reste, j, j, pour.sort.id);
    if (a.tete === 'Activated' && pour.capacite) return !reste || forgeValideObjet(P, pour.capacite, 'Card' + reste, pour.capacite, j, null, true);
    return false;
  });
}

function sourcesMana(P, j, pour) {
  const r = [];
  for (const id of P.champ) {
    const o = obj(P, id);
    if (o.ctrl !== j) continue;
    let options = null, rang = 0, sac = false, vie = 0, reste = false, nonContre = [], portes = [];
    for (const k of capacitesDe(P, o)) {
      if (k.genre !== 'mana') continue;
      if (k.restreint && !manaPermis(P, j, k.restreint, pour)) continue;
      if (activationInterdite(P, j, o, k)) continue;
      const c = k.cout;
      if (c.mana && c.mana.total > 0) continue;
      if (c.sac || c.defausse || c.defausseTout || c.degageAutres || c.engageAutres || c.retire || c.degage || c.energie || c.exileCimetiere || c.renvoie ||
        c.defausseSoi || c.exileSoi || c.revele || c.pioche || c.equipage || c.renvoieSoi || coutSpecial(c)) continue;
      if (c.engage && !peutEngagerSoi(P, o)) continue;
      if (c.sacSoi && sacrificeInterdit(P, o, true)) continue;
      if (c.vie && (P.joueurs[j].vie <= c.vie || payerVieInterdit(P, j))) continue;
      let opts = k.identite ? identiteJoueur(P, j) : k.choisie ? [choixDe(P, o).couleur].filter(Boolean) : k.reflete ? manaReflete(P, j, o, k)
        : k.couleursParmi ? [couleursParmi(P, j, o, k.couleursParmi)].filter(Boolean) : k.options;
      if (!opts.length) continue;
      if (k.montant) {
        const n = forgeNombre(P, k.montant, {face: k.face, ctx: {cibles: [], memo: [], memoJ: [], x: 0}, src: o, ctrl: j, op: {}, base: true});
        if (n <= 0) continue;
        opts = opts.map(s => s.repeat(n));
      }
      if (k.parChaque) {
        const n = compteObjets(P, k.parChaque, o, j);
        if (!n) continue;
        opts = opts.map(s => s.repeat(n));
      }
      options = (options || []).concat(opts);
      if (k.sansContre) nonContre.push(...opts);
      if (k.porte) portes.push({opts, porte: k.porte});
      if (c.sacSoi) sac = true;
      if (c.vie) vie = c.vie;
      if (k.resteEngage) reste = true;
    }
    if (!options) continue;
    /* Une source qui ne se dégagera pas passe après les autres. */
    rang = (estType(o, 'land') ? 0 : sac ? 3 : estCreature(o) ? 2 : 1) + (reste ? 2 : 0);
    const couleurs = [...new Set(options.join('').split(''))];
    r.push({id, options, rang, sac, vie, reste, couleurs, cap: Math.max(...options.map(s => s.length)), ...(nonContre.length ? {nonContre} : {}), ...(portes.length ? {portes} : {})});
  }
  r.sort((a, b) => a.rang - b.rang || a.couleurs.length - b.couleurs.length);
  return r;
}

/* Les couleurs parmi les permanents qu'on contrôle qui répondent au
   filtre, une lettre chacune — Bloom Tender. */
function couleursParmi(P, j, o, valid) {
  const r = new Set();
  champDe(P, j).forEach(x => { if (forgeValideObjet(P, x, valid, o, j, null)) car(P, x).couleurs.forEach(c => r.add(c)); });
  return ['W', 'U', 'B', 'R', 'G'].filter(c => r.has(c)).join('');
}

/* Compter les objets du champ qui répondent à un descripteur, vus d'un
   joueur — « for each Elf you control ». */
function compteObjets(P, desc, src, j) {
  if (desc.zone === 'main') return P.joueurs[j].main.filter(id => correspond(P, obj(P, id), desc, src, j)).length;
  let n = 0;
  for (const id of P.champ) if (correspond(P, obj(P, id), desc, src, j)) n++;
  return n;
}

/* Le plan d'un paiement : quelles sources activer, et pour quelle option.
   `null` si le coût ne peut pas être payé. Rien n'est touché. */
function planPaiement(P, j, cout, x, pour) {
  const pool = {...P.joueurs[j].pool};
  /* Une source qui produit plusieurs manas d'un coup (« WG », « CC ») compte
     pour chacun d'eux : une part par lettre, activée une seule fois. */
  const src = [];
  /* Au paiement manuel, seule la réserve paie : les sources, c'est au joueur de les engager
     (js/jeuManaManuel.js). */
  if (!paiementManuel(P, j)) sourcesMana(P, j, pour).forEach(s => {
    if (s.options.length === 1 && s.options[0].length > 1) s.options[0].split('').forEach(l => src.push({...s, options: [l], couleurs: [l], cap: 1, base: s}));
    else src.push(s);
  });
  const besoins = [];
  LETTRES_MANA.forEach(k => { for (let n = 0; n < (cout.couleurs[k] || 0); n++) besoins.push([k]); });
  cout.hybrides.forEach(h => besoins.push(h));
  const restants = [];
  for (const b of besoins) {
    const k = b.find(c => pool[c] > 0);
    if (k) pool[k]--; else restants.push(b);
  }
  const affecte = new Array(src.length).fill(-1);
  const augmente = (bi, vus) => {
    for (let si = 0; si < src.length; si++) {
      if (vus[si] || !src[si].couleurs.some(c => restants[bi].includes(c))) continue;
      vus[si] = true;
      if (affecte[si] < 0 || augmente(affecte[si], vus)) { affecte[si] = bi; return true; }
    }
    return false;
  };
  for (let bi = 0; bi < restants.length; bi++) if (!augmente(bi, [])) return null;
  let generique = (cout.generique || 0) + (cout.x || 0) * (x || 0);
  const resteReserve = LETTRES_MANA.reduce((s, k) => s + pool[k], 0);
  generique -= Math.min(generique, resteReserve);
  const plan = [], actives = new Set();
  /* Une part d'une source : la source entière, une fois. */
  const ajoute = (s, option) => {
    if (s.base) { if (!actives.has(s.id)) { actives.add(s.id); plan.push({s: s.base, option: s.base.options[0]}); } return; }
    plan.push({s, option});
  };
  src.forEach((s, si) => {
    if (affecte[si] < 0) return;
    const voulu = restants[affecte[si]];
    ajoute(s, s.options.find(o => voulu.some(c => o.includes(c))));
  });
  /* Les parts d'une source déjà activée paient le générique d'office. */
  for (let si = 0; si < src.length && generique > 0; si++) if (affecte[si] < 0 && src[si].base && actives.has(src[si].id)) { generique--; affecte[si] = -2; }
  for (let si = 0; si < src.length && generique > 0; si++) {
    if (affecte[si] !== -1) continue;
    const s = src[si];
    const option = s.options.reduce((a, b) => b.length > a.length ? b : a);
    ajoute(s, option);
    generique -= option.length;
    if (s.base) for (let k = si + 1; k < src.length && generique > 0; k++) if (src[k].id === s.id && affecte[k] === -1) { affecte[k] = -2; generique--; }
  }
  return generique > 0 ? null : plan;
}

/* Ce qu'un joueur peut produire en tout : sa réserve et toutes ses sources.
   Sert à choisir X et à juger une main. */
function manaDispo(P, j) {
  const J = P.joueurs[j];
  return LETTRES_MANA.reduce((s, k) => s + J.pool[k], 0) + sourcesMana(P, j).reduce((s, x) => s + x.cap, 0);
}

function ajouteMana(P, j, lettres) {
  const pool = P.joueurs[j].pool;
  for (const k of lettres) pool[k] = (pool[k] || 0) + 1;
}

/* Retirer un coût d'une réserve qui suffit : couleurs exigées, hybrides,
   puis le générique, pris d'abord dans l'incolore puis dans les couleurs
   les plus abondantes. */
function debite(pool, cout, x) {
  LETTRES_MANA.forEach(k => { pool[k] -= cout.couleurs[k] || 0; });
  cout.hybrides.forEach(h => { const k = h.reduce((a, b) => pool[b] > pool[a] ? b : a); pool[k]--; });
  let g = (cout.generique || 0) + (cout.x || 0) * (x || 0);
  while (g > 0) {
    const k = pool.C > 0 ? 'C' : LETTRES_MANA.reduce((a, b) => pool[b] > pool[a] ? b : a);
    if (pool[k] <= 0) return false;
    pool[k]--; g--;
  }
  return LETTRES_MANA.every(k => pool[k] >= 0);
}

/* Payer un coût en mana : activer les sources du plan, verser leur mana
   dans la réserve, puis en retirer le coût. Rend `false` sans rien toucher
   si le coût ne peut pas être payé. */
function paieMana(P, j, cout, x, pour) {
  const plan = planPaiement(P, j, cout, x, pour);
  if (!plan) return false;
  const J = P.joueurs[j];
  /* Le mana que chaque genre de source a donné au sort, lu avant
     l'engagement ou le sacrifice (« three or more mana from creatures »). */
  const de = {creature: 0, artifact: 0, treasure: 0};
  for (const {s, option} of plan) {
    /* Les filtres s'activent après les sources simples (js/jeuManaFiltres.js). */
    if (s.filtre) continue;
    const o = obj(P, s.id);
    if (!o) continue;
    const n = typeof option === 'string' ? option.length : 1, c = o.zone === 'champ' ? car(P, o) : o.def;
    ['creature', 'artifact'].forEach(t => { if ((c.types || []).includes(t)) de[t] += n; });
    if ((c.sousTypes || []).includes('treasure')) de.treasure += n;
    activeSource(P, j, s, option, pour);
  }
  let sup = null;
  for (const {s, option} of plan) if (s.filtre) sup = activeFiltre(P, j, s, option, sup);
  const avant = LETTRES_MANA.reduce((s, k) => s + J.pool[k], 0), reserve = {...J.pool};
  if (!debite(J.pool, sup ? sommeMana(cout, sup) : cout, x)) return false;
  J.stats.manaDepense += avant - LETTRES_MANA.reduce((s, k) => s + J.pool[k], 0);
  /* Le mana dépensé pour un sort, couleur par couleur (convergence). */
  if (pour && pour.sort) { pour.sort.manaSort = manaSortSansFiltres(Object.fromEntries(LETTRES_MANA.map(k => [k, reserve[k] - J.pool[k]])), sup); pour.sort.manaDe = de; }
  return true;
}

/* Activer une source de mana : l'engager (ou la sacrifier, la payer en vie…) et verser son
   mana dans la réserve. Le paiement automatique en passe par là pour chaque source de son
   plan, le joueur qui paie à la main pour celle qu'il choisit. */
function activeSource(P, j, s, option, pour) {
  const o = obj(P, s.id), J = P.joueurs[j];
  if (!o) return;
  /* Une source de la main s'exile (js/forgeManaB.js). */
  if (s.main) { deplace(P, s.id, 'exil'); ajouteMana(P, j, option); return; }
  /* Ce que ce mana donne au sort (js/forgeManaC.js) : d'où il vient, et ce qu'il accorde. */
  if (pour && pour.sort) { manaPorte(P, j, s, option, pour); }
  engageObjet(P, o, option || true);
  if (s.nonContre && s.nonContre.includes(option) && pour && pour.sort) pour.sort.nonContrable = true;
  if (s.reste) o.exerce = true;
  if (s.vie) J.vie -= s.vie;
  if (s.sac) deplace(P, s.id, 'cimetiere');
  ajouteMana(P, j, option);
}

/* Les réserves se vident à la fin de chaque étape (règle 500.4). */
function videReserves(P) {
  /* Le mana de Firebending dure jusqu'à la fin du combat (js/forgeMotsClesE.js). */
  P.joueurs.forEach(J => { const f = P.combat && J.feu ? Math.min(J.feu, J.pool.R) : 0; LETTRES_MANA.forEach(k => { J.pool[k] = 0; }); J.pool.R = f; J.feu = f; });
}

/* Le mana « reflété » : ce que les permanents désignés pourraient
   produire, une couleur par option ; l'incolore seulement pour un type. */
function manaReflete(P, j, o, k) {
  const r = new Set();
  for (const id of P.champ) {
    const x = obj(P, id);
    if (x.id === o.id || !forgeValideObjet(P, x, k.reflete.valid, o, j, null, true)) continue;
    capacitesDe(P, x).forEach(m => { if (m.genre === 'mana' && !m.reflete) (m.options || []).forEach(s => String(s).split('').forEach(l => r.add(l))); });
  }
  return [...r].filter(l => k.reflete.type || l !== 'C');
}
