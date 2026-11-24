/* =====================================================================
   js/jeuManaAutre.js — Les capacités de mana qu'on paie autrement qu'en mana

   Lion's Eye Diamond (« discard your hand, sacrifice »), Skirge Familiar
   (« discard a card »), Dreadship Reef (« remove X storage counters »), Wall
   of Roots (« put a -0/-1 counter »), Bog Witch, Overeager Apprentice : le
   solveur de js/jeuMana.js n'engage que des sources dont le coût est un
   {T}, du mana, de la vie ou le sacrifice de la source. Ces capacités-ci
   ne servent donc jamais d'elles-mêmes : à la table, elles se proposent
   comme une action — `{k: 'manaAutre'}` —, qui paie le coût, verse le mana
   dans la réserve, et le laisse à la phase pour le prochain sort.

   Les lots et les essais d'IA n'ont que faire d'un mana qu'on n'emploie
   pas (`P.montre`, comme la question « voir ») ; l'IA ne note pas cette
   action. « Toute combinaison de couleurs » d'une quantité X se choisit en
   bloc, comme le mana d'une capacité de filtre.
   ===================================================================== */

/* Cette capacité de mana a-t-elle un coût que le solveur ne sait pas payer ? */
function manaSansSolveur(c) {
  return !!(c.defausse || c.defausseTout || c.defausseSoi || c.engageAutres || c.degageAutres || c.retire || c.degage || c.energie || c.exileCimetiere ||
    c.exileSoi || c.revele || c.pioche || c.equipage || c.renvoie || c.sac || aCoutX(c) || coutSpecial(c));
}

/* Les actions : chaque capacité de mana de ce genre qu'on peut payer maintenant. */
function actionsManaAutre(P, j) {
  if (!P.montre) return [];
  const r = [];
  for (const id of P.champ) {
    const o = obj(P, id);
    if (o.ctrl !== j) continue;
    capacitesDe(P, o).forEach((k, i) => {
      if (k.genre !== 'mana' || !k.cout || k.restreint || !manaSansSolveur(k.cout) || activationInterdite(P, j, o, k)) return;
      if (k.vitesse === 'rituel' && !enPhasePrincipale(P, j)) return;
      if (k.activation && !(FORGE_CONDITIONS[k.activation] && FORGE_CONDITIONS[k.activation](P, {ctrl: j, src: o, ctx: {}}))) return;
      /* Un coût en X se paie pour au moins 1 ; sans X, au plus tel qu'il est. */
      const c = coutResolu(k.cout, aCoutX(k.cout) ? 1 : 0, o);
      if (!coutAutrePossible(P, j, o, c)) return;
      if (c.mana && c.mana.total > 0 && !manaPayableSansSoi(P, j, {id: o.id, cout: c.mana}, o)) return;
      r.push({k: 'manaAutre', id: o.id, i});
    });
  }
  return r;
}

/* Les options d'une quantité calculée : n manaux de n'importe quelle combinaison des lettres que la capacité offre. */
function optionsManaAutre(k, n) {
  const lettres = [...new Set(k.options.filter(s => s.length === 1))];
  if (n <= 1 || !lettres.length) return k.options.map(s => s.length === 1 && n > 1 ? s.repeat(n) : s);
  return lettres.length > 1 ? multiensembles(lettres, n).map(l => l.join('')) : [lettres[0].repeat(n)];
}

/* Payer, puis verser le mana. */
function* activeManaAutre(P, j, a) {
  const o = obj(P, a.id), k = o && capacitesDe(P, o)[a.i];
  if (!o || o.zone !== 'champ' || o.ctrl !== j || !k || k.genre !== 'mana') return false;
  let x = 0;
  if (aCoutX(k.cout)) {
    x = yield* choisitXAutre(P, j, o, k.cout, maxXAutre(P, j, o, k.cout), o.id);
    if (x < 1) return false;
  }
  const c = coutResolu(k.cout, x, o);
  if (!coutAutrePossible(P, j, o, c)) return false;
  if (c.mana && c.mana.total > 0) {
    const avant = EXCLUS_MANA;
    EXCLUS_MANA = new Set([...avant, o.id]);
    try { if (!paieMana(P, j, c.mana, 0, {capacite: o})) return false; } finally { EXCLUS_MANA = avant; }
  }
  yield* paieAutre(P, j, o, c);
  const n = k.montant ? Math.max(0, forgeNombre(P, k.montant, {face: k.face, ctx: {cibles: [], memo: [], memoJ: [], x}, src: o, ctrl: j, op: {}, base: true})) : 1;
  if (n <= 0) return true;
  const option = yield* choisitManaOption(P, j, k.montant ? optionsManaAutre(k, n) : k.options, o.id, 0);
  if (option) ajouteMana(P, j, option);
  jn(P, `${P.joueurs[j].nom} active ${o.def.nom} : mana ${libelleManaOption(option || '')}`);
  return true;
}
