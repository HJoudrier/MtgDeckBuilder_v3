/* =====================================================================
   js/forgeManaRestreintB.js — Engager à la main une source de mana restreint

   Lot F102. Herd Heirloom : « {T} : add one mana of any color. Spend this
   mana only to cast a creature spell. » Au paiement manuel, une source
   n'est proposée que si elle paie quelque chose de précis : or le mana
   restreint ne se juge qu'au sort qu'il paie (`manaPermis()`, js/jeuMana.js),
   qu'on ne connaît pas encore quand on engage. Ces sources sont donc
   proposées à part : l'action engage le permanent et verse son mana dans
   `J.poolR` (js/forgeManaRestreint.js), d'où seul un sort permis le tire.
   La réserve le montre, avec ce qu'il paie.
   ===================================================================== */

/* Les actions de mana restreint d'un joueur qui paie à la main : une par source et par couleur. */
function actionsManaRestreint(P, j) {
  const r = [];
  if (!paiementManuel(P, j)) return r;
  for (const id of P.champ) {
    const o = obj(P, id);
    if (o.ctrl !== j) continue;
    capacitesDe(P, o).forEach((k, i) => {
      if (k.genre !== 'mana' || !k.restreint || k.montant || k.parChaque || k.compteurs || k.identite || k.fixes || k.choisie || k.couleursParmi || !k.options.length) return;
      if (activationInterdite(P, j, o, k)) return;
      const c = coutManaSup(P, o, k.cout);
      if ((c.mana && c.mana.total > 0) || c.sac || c.defausse || c.degage || c.vie || c.energie || c.renvoie || c.revele || coutSpecial(c)) return;
      if (c.engage && !peutEngagerSoi(P, o)) return;
      [...new Set(k.options)].forEach(option => r.push({k: 'mana', id, option, restreint: i}));
    });
  }
  return r;
}

actionsManuelles = (g => function (P, j) { return [...g(P, j), ...actionsManaRestreint(P, j)]; })(actionsManuelles);

/* Engager la source, et verser son mana, lettre par lettre, dans la liste du mana restreint. */
activeManaManuel = (g => function (P, j, a) {
  if (a.restreint == null) return g(P, j, a);
  if (!actionsManaRestreint(P, j).some(x => x.id === a.id && x.restreint === a.restreint && x.option === a.option)) return false;
  const o = obj(P, a.id), k = capacitesDe(P, o)[a.restreint], J = P.joueurs[j];
  engageObjet(P, o, a.option);
  (J.poolR = J.poolR || []).push(...String(a.option).split('').map(l => ({l, valid: k.restreint, porte: k.porte || null, source: null})));
  P.ver++;
  return true;
})(activeManaManuel);

/* Ce que ce mana paie, en mots : « créatures », « instants et rituels », sinon la restriction de Forge. */
function libelleRestriction(valid) {
  const v = String(valid || '');
  const types = [['Creature', 'créatures'], ['Instant', 'instants'], ['Sorcery', 'rituels'], ['Artifact', 'artefacts'], ['Enchantment', 'enchantements'], ['Planeswalker', 'planeswalkers']]
    .filter(([t]) => new RegExp('\\b' + t + '\\b').test(v)).map(([, n]) => n);
  return types.length ? 'sorts de ' + types.join(' ou ') + ' seulement' : 'certains sorts seulement';
}

libelleAction = (g => function (P, a) {
  const l = g(P, a);
  if (a.k !== 'mana' || a.restreint == null) return l;
  const o = obj(P, a.id), k = o && capacitesDe(P, o)[a.restreint];
  return l + (k ? ' (' + libelleRestriction(k.restreint) + ')' : '');
})(libelleAction);
