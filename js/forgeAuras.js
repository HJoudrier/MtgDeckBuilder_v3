/* =====================================================================
   js/forgeAuras.js — Les auras de joueur, Bestow, Reconfigure

   Trois façons d'être attaché que le moteur ne connaissait pas :
   - une aura qui enchante un joueur (les Curses, `K:Enchant:Player`) :
     l'objet porte `o.attJoueur` au lieu de `o.att` ; « enchanted player »
     le désigne ;
   - Bestow : la créature se lance comme une aura pour son coût de bestow ;
     son hôte parti, elle redevient une créature au lieu d'aller au
     cimetière ;
   - Reconfigure : un équipement-créature qui s'attache à une autre
     créature, et cesse d'être une créature tant qu'il l'est.
   ===================================================================== */

/* Les mots-clés de ce fichier, lus par js/forgeMotsCles.js `motCleForge()`.
   Rend `null` si ce n'en est pas un. */
function motCleAura(def, tete, reste) {
  const c = reste.length === 1 ? manaSeul(reste[0]) : null;
  if (tete === 'Bestow') {
    if (!c || !def.types.includes('creature')) return false;
    def.bestow = coutComplet(c).mana;
    return true;
  }
  if (tete === 'Reconfigure') {
    if (!c || !def.types.includes('creature')) return false;
    const mana = coutComplet(c).mana, slot = {desc: descForge('Creature.YouCtrl+Other'), min: 1, max: 1};
    def.capacites.push({genre: 'activee', vitesse: 'rituel', texte: 'Reconfigure : attacher', reconfig: 'attache', cout: {mana},
      effet: {ops: [{op: 'reconfigure', a: {cible: 0}, hostile: false}], cibles: [slot], modes: null}});
    def.capacites.push({genre: 'activee', vitesse: 'rituel', texte: 'Reconfigure : détacher', reconfig: 'detache', cout: {mana},
      effet: {ops: [{op: 'reconfigure', hostile: false}], cibles: [], modes: null}});
    return true;
  }
  return null;
}

/* —— Bestow ———————————————————————————————————————————————————————— */

/* La carte lancée comme aura : un enchantement Aura qui enchante une
   créature, sans force ni types de créature (règle 702.103b). */
function defBestow(d) {
  return d._bestow || (d._bestow = {...d, types: d.types.filter(t => t !== 'creature'), sousTypes: ['aura'], aura: descForge('Creature'),
    force: null, endurance: null, bestowDe: d});
}
variantesMotsClesE = (g => function (P, j, o, depuis, essaie) {
  g(P, j, o, depuis, essaie);
  if (o.def.bestow && depuis === 'main') essaie('bestow', coutSort(P, j, o, depuis, o.def.bestow), o.def.coutSup || null, defBestow(o.def));
})(variantesMotsClesE);

/* Une aura qui n'enchante plus rien de légal va au cimetière
   (js/jeuEtatsDeJeu.js) — sauf celle de bestow, qui redevient une
   créature, et celle d'un joueur, qui tient tant qu'il joue. */
function auraOrpheline(P, o) {
  if (o.attJoueur != null) return !P.joueurs[o.attJoueur] || P.joueurs[o.attJoueur].elimine;
  const h = o.att != null ? obj(P, o.att) : null;
  if (h && h.zone === 'champ' && correspondBase(P, h, o.def.aura, o, o.ctrl)) return false;
  if (o.def.bestowDe) {
    o.def = o.def.bestowDe; o.att = null; P.ver++;
    jn(P, `${o.def.nom} redevient une créature`);
    return false;
  }
  return true;
}

/* —— Reconfigure ——————————————————————————————————————————————————— */

/* Attacher à la créature ciblée, ou détacher. Attaché, il n'est plus une
   créature : une animation qui ôte le type tant que `o.att` tient
   (js/jeuCaracteristiques.js `animation()`). */
OPS.reconfigure = function* (P, op, ctx) {
  const s = sourceCtx(P, ctx);
  if (!s || s.lki || s.zone !== 'champ' || s.ctrl !== ctx.ctrl) return;
  if (!op.a) { s.att = null; P.ver++; return; }
  const h = resous(P, op.a, ctx)[0];
  if (!h || h.j != null || h.zone !== 'champ' || h.id === s.id) return;
  s.att = h.id;
  if (!(s.anime || []).some(a => a.siAttache)) (s.anime = s.anime || []).push({fin: 'jamais', retireType: ['creature'], siAttache: true});
  P.ver++;
};
activationInterdite = (g => function (P, j, o, k) { return (k.reconfig === 'detache' && o.att == null) || g(P, j, o, k); })(activationInterdite);

forgeSait('kw', 'Bestow', 'Reconfigure');
forgeSait('defini', 'EnchantedPlayer');
forgeSait('filtre', 'EnchantedPlayerCtrl', 'EnchantedPlayerOwn');

/* —— Attacher ce qu'on choisit ————————————————————————————————————— */

/* `Choices$` : sans `Object$`, ce qu'on attache se choisit et l'hôte est
   désigné (« you may attach an Equipment you control to it ») ; avec, c'est
   l'hôte qui se choisit. */
FORGE_API.Attach.gen = (g => function* (P, t, env) {
  if (!t.Choices) return yield* g(P, t, env);
  const cands = objetsZone(P, 'champ').filter(o => forgeValideObjet(P, o, t.Choices, env.src, env.ctrl, env)).map(o => o.id);
  const pris = yield* choisitCartes(P, env.ctrl, cands, 1, 'Attacher', 'cartes', t.Optional === 'True' ? 0 : 1);
  if (!pris.length) return;
  const designe = v => (env.op.slot != null && !t.Object ? ciblesForge(P, env, false) : forgeDefinis(P, v, env))[0];
  const s = t.Object ? designe(t.Object) : obj(P, pris[0]), h = t.Object ? obj(P, pris[0]) : designe(t.Defined || 'Self');
  if (!s || s.lki || s.zone !== 'champ' || !h || h.j != null || h.zone !== 'champ' || s.id === h.id) return;
  s.att = h.id; P.ver++;
  if (t.RememberAttached === 'True') retiensForge(env.ctx, s.id);
})(FORGE_API.Attach.gen);
forgeSait('param', 'Attach.Choices', 'Attach.Move', 'Attach.RememberAttached', 'Attach.Optional');
forgeSait('filtre', 'AttachedTo', 'Attached');
