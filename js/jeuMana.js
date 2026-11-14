/* =====================================================================
   js/jeuMana.js — La réserve de mana, et le paiement automatique

   Au lot 1, personne ne choisit à la main quels terrains engager : un
   solveur le fait. Les symboles colorés passent d'abord, appariés aux
   sources par chemins augmentants — un Forêt-Île ne doit pas payer le vert
   que seule une Forêt pouvait payer, laissant le bleu sans source —, puis le
   générique, payé par les sources les moins précieuses : les terrains avant
   les accélérateurs, un Trésor qu'il faut sacrifier en dernier.

   Les capacités de mana qui coûtent elles-mêmes du mana (filtres, Signets)
   ne servent pas au solveur : simplification annoncée.
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
    let options = null, rang = 0, sac = false, vie = 0;
    for (const k of capacitesDe(P, o)) {
      if (k.genre !== 'mana') continue;
      if (k.restreint && !manaPermis(P, j, k.restreint, pour)) continue;
      if (activationInterdite(P, j, o, k)) continue;
      const c = k.cout;
      if (c.mana && c.mana.total > 0) continue;
      if (c.sac || c.defausse || c.engageAutres || c.retire || c.degage || c.energie || c.exileCimetiere || c.renvoie ||
        c.defausseSoi || c.exileSoi || c.revele || c.pioche || c.equipage) continue;
      if (c.engage && !peutEngagerSoi(P, o)) continue;
      if (c.vie && P.joueurs[j].vie <= c.vie) continue;
      let opts = k.identite ? identiteJoueur(P, j) : k.choisie ? [choixDe(P, o).couleur].filter(Boolean) : k.options;
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
      if (c.sacSoi) sac = true;
      if (c.vie) vie = c.vie;
    }
    if (!options) continue;
    rang = estType(o, 'land') ? 0 : sac ? 3 : estCreature(o) ? 2 : 1;
    const couleurs = [...new Set(options.join('').split(''))];
    r.push({id, options, rang, sac, vie, couleurs, cap: Math.max(...options.map(s => s.length))});
  }
  r.sort((a, b) => a.rang - b.rang || a.couleurs.length - b.couleurs.length);
  return r;
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
  const src = sourcesMana(P, j, pour);
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
  const plan = [];
  src.forEach((s, si) => {
    if (affecte[si] < 0) return;
    const voulu = restants[affecte[si]];
    plan.push({s, option: s.options.find(o => voulu.some(c => o.includes(c)))});
  });
  for (let si = 0; si < src.length && generique > 0; si++) {
    if (affecte[si] >= 0) continue;
    const s = src[si];
    const option = s.options.reduce((a, b) => b.length > a.length ? b : a);
    plan.push({s, option});
    generique -= option.length;
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
  for (const {s, option} of plan) {
    const o = obj(P, s.id);
    if (!o) continue;
    o.engage = true;
    if (s.vie) J.vie -= s.vie;
    if (s.sac) deplace(P, s.id, 'cimetiere');
    ajouteMana(P, j, option);
  }
  const avant = LETTRES_MANA.reduce((s, k) => s + J.pool[k], 0);
  if (!debite(J.pool, cout, x)) return false;
  J.stats.manaDepense += avant - LETTRES_MANA.reduce((s, k) => s + J.pool[k], 0);
  return true;
}

/* Les réserves se vident à la fin de chaque étape (règle 500.4). */
function videReserves(P) {
  P.joueurs.forEach(J => { LETTRES_MANA.forEach(k => { J.pool[k] = 0; }); });
}
