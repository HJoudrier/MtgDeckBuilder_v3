/* =====================================================================
   js/jeuManaFiltres.js — Le mana qui coûte du mana : les filtres

   Un terrain-filtre (« {W/U}, {T} : ajoutez {W}{W}, {W}{U} ou {U}{U} »),
   Cabal Coffers (« {2}, {T} : ajoutez {B} par Marais »), Grinning Ignus
   (« {R}, renvoyez-le en main : ajoutez {C}{C}{R} », au rythme d'un rituel) :
   une capacité de mana dont le coût demande lui-même du mana. Le solveur de
   js/jeuMana.js n'apparie que des sources sans coût de mana ; un filtre le
   complète sans le réécrire :

   - le solveur d'abord, seul : un paiement qui réussissait réussit à
     l'identique, sans que ce fichier le voie ;
   - s'il échoue, on essaie un filtre, puis deux : ce que le filtre produit
     réduit le besoin, ce qu'il coûte s'y ajoute, et le solveur paie le tout
     avec les sources simples, hors le permanent du filtre. Le coût du
     filtre ne se paie donc jamais avant l'assurance du paiement ;
   - à l'exécution (`paieMana()`), les sources simples versent leur mana
     dans la réserve, puis chaque filtre s'active — engagé, renvoyé en main —
     et verse le sien ; le coût des filtres est retiré avec celui du sort,
     d'un seul tenant, pour que le générique du filtre ne mange pas une
     couleur dont le sort a besoin.
   Profondeur bornée à deux : un filtre qui en nourrit un autre au-delà,
   simplification annoncée.
   ===================================================================== */

/* Les permanents qu'on contrôle et qui portent un filtre, relevés une fois
   par définition. */
function aUnFiltre(d) {
  if (d._filtre === undefined) d._filtre = d.capacites.some(k => k.genre === 'mana' && !!k.cout && ((k.cout.mana && k.cout.mana.total > 0) || k.cout.renvoieSoi));
  return d._filtre;
}

/* Ce que le solveur doit ignorer le temps d'un essai : le permanent dont le
   filtre est déjà pris pour payer. */
let EXCLUS_MANA = new Set();
sourcesMana = (g => function (P, j, pour) {
  const r = g(P, j, pour);
  return EXCLUS_MANA.size ? r.filter(s => !EXCLUS_MANA.has(s.id)) : r;
})(sourcesMana);

/* Les filtres utilisables maintenant : `{id, cout, options, engage, renvoie}`. */
function filtresMana(P, j, pour) {
  const r = [];
  for (const id of P.champ) {
    const o = obj(P, id);
    if (o.ctrl !== j || !aUnFiltre(o.def)) continue;
    for (const [i, k] of capacitesDe(P, o).entries()) {
      const c = k.cout;
      if (k.genre !== 'mana' || !c || !((c.mana && c.mana.total > 0) || c.renvoieSoi)) continue;
      if (k.restreint && !manaPermis(P, j, k.restreint, pour)) continue;
      if (activationInterdite(P, j, o, k)) continue;
      /* « Activate only as a sorcery » : une phase principale, pile vide. */
      if (k.vitesse === 'rituel' && !enPhasePrincipale(P, j)) continue;
      if (Object.keys(c).some(f => c[f] && !['mana', 'engage', 'renvoieSoi', 'exileCimetiere'].includes(f))) continue;
      /* Exiler N cartes de son cimetière, n'importe lesquelles (Sunken Palace). */
      if (c.exileCimetiere && !(c.exileCimetiere.desc && c.exileCimetiere.desc.forge === 'Card' && typeof c.exileCimetiere.n === 'number' && P.joueurs[j].cimetiere.length >= c.exileCimetiere.n)) continue;
      if (c.engage && !peutEngagerSoi(P, o)) continue;
      let opts = k.options || [];
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
      if (!opts.length) continue;
      r.push({id, i, filtre: true, cout: c.mana || coutManaVide(), engage: !!c.engage, renvoie: !!c.renvoieSoi, exileCim: c.exileCimetiere ? c.exileCimetiere.n : 0, ...(k.porte ? {portes: [{opts, porte: k.porte}]} : {}), options: opts, vie: 0, sac: false, reste: false});
    }
  }
  return r;
}

/* Le coût, X plié dans le générique, moins ce que produit un filtre : une
   lettre paie sa couleur, sinon un hybride qui la contient, sinon le
   générique ; le reste est perdu. */
function coutMoins(cout, produit, x) {
  const c = {...cout, couleurs: {...cout.couleurs}, hybrides: cout.hybrides.slice(), generique: (cout.generique || 0) + (cout.x || 0) * (x || 0), x: 0};
  for (const L of String(produit)) {
    if ((c.couleurs[L] || 0) > 0) { c.couleurs[L]--; continue; }
    const h = c.hybrides.findIndex(hh => hh.includes(L));
    if (h >= 0) { c.hybrides.splice(h, 1); continue; }
    if (c.generique > 0) c.generique--;
  }
  c.total = Object.values(c.couleurs).reduce((a, b) => a + b, 0) + c.hybrides.length + c.generique;
  return c;
}

/* Le plan d'un paiement qui passe par un ou deux filtres, ou `null`. `base`
   est le solveur seul. Les filtres viennent en fin de plan, marqués `s.filtre`. */
function planAvecFiltres(P, j, cout, x, pour, base) {
  const fs = filtresMana(P, j, pour);
  if (!fs.length) return null;
  const essai = choix => {
    let besoin = {...cout, couleurs: {...cout.couleurs}, hybrides: cout.hybrides.slice(), generique: (cout.generique || 0) + (cout.x || 0) * (x || 0), x: 0};
    choix.forEach(({f, option}) => { besoin = sommeMana(coutMoins(besoin, option, 0), f.cout); });
    EXCLUS_MANA = new Set(choix.map(c => c.f.id));
    let p;
    try { p = base(P, j, besoin, 0, pour); } finally { EXCLUS_MANA = new Set(); }
    return p ? [...p, ...choix.map(({f, option}) => ({s: f, option}))] : null;
  };
  for (const f of fs) for (const option of f.options) { const p = essai([{f, option}]); if (p) return p; }
  for (let a = 0; a < fs.length; a++) for (let b = a + 1; b < fs.length; b++)
    for (const oa of fs[a].options) for (const ob of fs[b].options) { const p = essai([{f: fs[a], option: oa}, {f: fs[b], option: ob}]); if (p) return p; }
  return null;
}

/* Le solveur, puis les filtres s'il échoue. Un permanent en cours d'essai
   n'en rappelle pas un autre : `EXCLUS_MANA` est alors rempli. */
planPaiement = (g => function (P, j, cout, x, pour) {
  const p = g(P, j, cout, x, pour);
  if (p || EXCLUS_MANA.size || paiementManuel(P, j) || !P.champ.some(id => aUnFiltre(obj(P, id).def))) return p;
  return planAvecFiltres(P, j, cout, x, pour, g);
})(planPaiement);

/* Activer un filtre : son coût hors mana, puis son mana dans la réserve.
   Rend le coût en mana à retirer avec celui du sort. */
function activeFiltre(P, j, s, option, sup) {
  const o = obj(P, s.id);
  if (!o) return sup;
  if (s.engage) engageObjet(P, o, true);
  if (s.renvoie) deplace(P, s.id, 'main');
  if (s.exileCim) P.joueurs[j].cimetiere.slice(0, s.exileCim).forEach(id => deplace(P, id, 'exil'));
  ajouteMana(P, j, option);
  return sup ? sommeMana(sup, s.cout) : s.cout;
}

/* Le mana qu'un sort a coûté, hors ce que ses filtres ont dépensé pour s'activer :
   le coût d'un filtre n'est pas du mana dépensé pour le sort. */
function manaSortSansFiltres(depense, sup) {
  const r = {...depense};
  if (!sup) return r;
  LETTRES_MANA.forEach(k => { r[k] = Math.max(0, r[k] - (sup.couleurs[k] || 0)); });
  for (let g = sup.generique || 0; g > 0; g--) {
    const k = LETTRES_MANA.reduce((a, b) => r[b] > r[a] ? b : a);
    if (r[k] > 0) r[k]--;
  }
  return r;
}
