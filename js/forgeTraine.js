/* =====================================================================
   js/forgeTraine.js — La traîne : des mots-clés et des effets moins
   fréquents, choisis par la mesure (« Ce qu'il manque au moteur »)

   Exaltation, terreur, intimidation, bushido, tempête, cascade ; les
   effets `Fog`, `Connive`, `Explore`. Plusieurs mots-clés se bâtissent
   en déclencheurs de Forge ordinaires, écrits ici une fois : le moteur les
   joue comme ceux d'une carte.
   ===================================================================== */

/* Un déclencheur synthétique : une face prolongée d'une SVar, puis
   `declencheurForge()` comme pour une ligne `T:`. */
function declencheurSynthetique(def, face, jetons, nom, table, effet) {
  const f = {...face, svars: {...face.svars, [nom]: effet}};
  return declencheurForge(def, f, {...table, Execute: nom, TriggerZones: 'Battlefield'}, jetons);
}

/* Un mot-clé de la traîne. Rend `null` s'il n'en est pas un. */
function motCleTraine(def, k, face, jetons, tete, reste) {
  switch (tete) {
    case 'Exalted':
      return declencheurSynthetique(def, face, jetons, 'ExaltePompe', {Mode: 'Attacks', ValidCard: 'Creature.YouCtrl', Alone: 'True'},
        'DB$ Pump | Defined$ TriggeredAttacker | NumAtt$ +1 | NumDef$ +1');
    case 'Fear': def.params.peur = true; return true;
    case 'Intimidate': def.params.intimidation = true; return true;
    case 'Bushido': {
      if (!/^\d+$/.test(reste[0] || '')) return false;
      const pompe = `DB$ Pump | Defined$ Self | NumAtt$ +${reste[0]} | NumDef$ +${reste[0]}`;
      return declencheurSynthetique(def, face, jetons, 'BushidoBloque', {Mode: 'Blocks', ValidCard: 'Card.Self'}, pompe) &&
        declencheurSynthetique(def, face, jetons, 'BushidoBloquee', {Mode: 'AttackerBlocked', ValidCard: 'Card.Self'}, pompe);
    }
    case 'Storm': case 'Cascade':
      def.capacites.push({genre: 'declenchee', ecoutes: [{evt: 'lanceSoi'}], texte: tete,
        effet: {ops: [{op: tete === 'Storm' ? 'tempete' : 'cascade', hostile: false}], cibles: [], modes: null}});
      return true;
  }
  return null;
}

forgeSait('kw', 'Exalted', 'Fear', 'Intimidate', 'Bushido', 'Storm', 'Cascade');

/* La tempête : une copie du sort pour chaque sort lancé avant lui ce tour. */
OPS.tempete = function* (P, op, ctx) {
  const it = P.pile.find(x => x.id === ctx.source);
  if (!it) return;
  const n = P.joueurs.reduce((s, J) => s + (J.sortsTour || []).length, 0) - 1;
  for (let k = 0; k < n; k++) yield* copieSort(P, ctx.ctrl, obj(P, it.id), it, true);
};

/* La cascade : exiler du dessus jusqu'à une carte non-terrain de valeur
   moindre, la lancer sans payer si l'on veut, le reste dessous dans un
   ordre au hasard. */
OPS.cascade = function* (P, op, ctx) {
  const s = sourceCtx(P, ctx), j = ctx.ctrl, B = P.joueurs[j].bibliotheque;
  if (!s) return;
  const mv = mvDe(s), exiles = [];
  let trouve = null;
  while (B.length) {
    const n = deplace(P, B[B.length - 1], 'exil');
    const o = obj(P, n);
    exiles.push(o.cid);
    if (!estType(o, 'land') && mvDe(o) < mv) { trouve = o; break; }
  }
  if (trouve) {
    trouve.gratuit = true;
    const r = yield question(P, j, 'oui', ['non', 'oui'], {texte: `Lancer ${trouve.def.nom} sans payer ?`, source: trouve.id});
    if (r === 1) yield* lanceSort(P, j, {k: 'lancer', id: trouve.id, depuis: 'exil', variante: 'gratuit'});
  }
  const reste = P.joueurs[j].exil.filter(id => exiles.includes(obj(P, id).cid));
  melangeHasard(P.rng, reste).forEach(id => deplace(P, id, 'dessous'));
};

/* Le brouillard : aucun dégât de combat ce tour (js/forgeRemplacements.js). */
forgeEffet('Fog', [], function* (P) { P.brouillard = P.tour; }, (t, op) => { op.op = 'forge'; op.hostile = false; });

/* Comploter (« connive ») : piocher, défausser ; pour chaque carte non-terrain
   défaussée, un marqueur +1/+1 sur qui complote. */
forgeEffet('Connive', ['Num'], function* (P, t, env) {
  const n = forgeNombre(P, t.Num || 1, env);
  for (const o of objetsForge(P, t, env).filter(x => x.zone === 'champ' && !x.lki)) {
    const j = o.ctrl;
    piocheN(P, j, n);
    const pris = yield* choisitCartes(P, j, P.joueurs[j].main.slice(), n, 'Défausser', 'defausse');
    const nonTerrains = pris.filter(id => !estType(obj(P, id), 'land')).length;
    pris.forEach(id => defausseCarte(P, id, j));
    if (nonTerrains && obj(P, o.id)) poseMarqueurs(P, o, '+1/+1', nonTerrains, o);
  }
}, (t, op) => { op.op = 'pioche'; op.n = 1; op.qui = {vous: 1}; op.hostile = false; });

/* Explorer : révéler le dessus ; un terrain va en main, sinon un marqueur
   +1/+1 et la carte peut aller au cimetière. */
forgeEffet('Explore', [], function* (P, t, env) {
  for (const o of objetsForge(P, t, env).filter(x => x.zone === 'champ' && !x.lki)) {
    const j = o.ctrl, B = P.joueurs[j].bibliotheque;
    if (!B.length) continue;
    const c = obj(P, B[B.length - 1]);
    if (estType(c, 'land')) { deplace(P, c.id, 'main'); continue; }
    poseMarqueurs(P, o, '+1/+1', 1, o);
    const r = yield question(P, j, 'oui', ['non', 'oui'], {texte: `Mettre ${c.def.nom} au cimetière ?`, source: o.id});
    if (r === 1) deplace(P, c.id, 'cimetiere');
  }
}, (t, op) => { op.op = 'marqueurs'; op.genre = '+1/+1'; op.n = 1; op.a = {soi: 1}; op.hostile = false; });
