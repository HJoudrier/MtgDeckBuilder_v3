/* =====================================================================
   js/forgeArtefactsG.js — Les artefacts d'EDHREC : l'équipement

   Lot F108 :
   - Sting : `blockingValid <filtre>` — la créature bloque (ou est bloquée
     par) ce qui répond au filtre ;
   - Sunforger : `Unattach<CARDNAME/CARDNAME>`, se détacher en coût ;
   - Grafted Exoskeleton : `Mode$ Unattached`, quand l'équipement quitte sa
     créature (en se rattachant ailleurs, ou en quittant le champ) ;
   - Skrelv, Defector Mite : toxique 1 et « hexproof from » une couleur
     choisie, jusqu'à la fin du tour.
   ===================================================================== */

/* —— Bloquer, être bloqué par —————————————————————————————————————— */

/* `blockingValid Goblin` : la créature bloque une créature qui répond au filtre ; `Goblin.blockingValid Creature.EquippedBy` : le filtre s'applique à la bloquée. */
proprieteDesignee = (g => function (P, o, p, c, src, ctrl, env) {
  let m;
  if ((m = /^blockingValid (.+)$/.exec(p))) {
    const cb = P && P.combat, att = cb && cb.bloqueurs && cb.bloqueurs.get(o.id);
    return (Array.isArray(att) ? att : att != null ? [att] : []).some(a => { const x = obj(P, a); return !!x && forgeValideObjet(P, x, m[1], src, ctrl, env, true); });
  }
  return g(P, o, p, c, src, ctrl, env);
})(proprieteDesignee);
forgeSait('filtre', 'blockingValid Goblin', 'blockingValid Orc', 'blockingValid Creature.EquippedBy');

/* —— Se détacher en payant ———————————————————————————————————————— */

forgeSait('cout', 'Unattach');
coutForge = (g => function (txt, ...r) { return g(typeof txt === 'string' ? txt.replace(/Unattach<CARDNAME\/CARDNAME>/g, 'Unattach<1/CARDNAME>') : txt, ...r); })(coutForge);
COUTS_B.Unattach = (c, n, p) => { c.deseq = true; return true; };
CHAMPS_COUTS_B.push('deseq');
coutAutrePossibleB = (g => function (P, j, o, c) { return (!c.deseq || (o.zone === 'champ' && o.att != null)) && g(P, j, o, c); })(coutAutrePossibleB);
paieAutreB = (g => function* (P, j, o, c) {
  if (c.deseq) { o.att = null; P.ver++; }
  yield* g(P, j, o, c);
})(paieAutreB);

/* —— Devenir détaché ————————————————————————————————————————————— */

/* On relève à chaque collecte ce qui s'est détaché, et ce qui l'était en quittant le champ. */
collecteDeclencheurs = (g => function (P) {
  for (const id of P.champ) {
    const o = obj(P, id);
    if (!o) continue;
    const prec = o.attConnu == null ? null : o.attConnu, now = o.att == null ? null : o.att;
    if (prec != null && prec !== now) emet(P, {t: 'detache', id: o.id, hote: prec});
    o.attConnu = now;
    /* Le contrôle qui change (Gustha's Scepter : « when you lose control of ~ »). */
    if (o.ctrlConnu != null && o.ctrlConnu !== o.ctrl) emet(P, {t: 'changeCtrl', id: o.id, de: o.ctrlConnu, vers: o.ctrl});
    o.ctrlConnu = o.ctrl;
  }
  g(P);
})(collecteDeclencheurs);
noteHistorique = (g => function (P, e) {
  g(P, e);
  if (e.t === 'zone' && e.de === 'champ' && e.lki && e.lki.att != null) emet(P, {t: 'detache', id: e.ancien, hote: e.lki.att, lki: e.lki});
})(noteHistorique);
forgeMode('Unattached', ['ValidAttachment', 'ValidObject'], (P, t, e, s, env) => e.t === 'detache' && (t.ValidAttachment !== 'Card.Self' || e.id === s.id || e.id === s.ancien));
definisEtendus = (g => function (P, v, env) {
  if (v === 'TriggeredObjectLKICopy') { const e = env.ctx && env.ctx.evt, h = e && e.hote != null ? obj(P, e.hote) : null; return h && h.zone === 'champ' ? [h] : []; }
  return g(P, v, env);
})(definisEtendus);
forgeSait('defini', 'TriggeredObjectLKICopy');
forgeMode('ChangesController', ['ValidCard'], (P, t, e, s, env) => e.t === 'changeCtrl' && valideOuRien(P, obj(P, e.id), t.ValidCard, s, env));

/* —— Skrelv, Defector Mite ———————————————————————————————————————— */

forgeSait('param', 'Pump.DefinedKW');
forgeSait('kwval', 'hexproof:chosencolor', 'toxic:1');
FORGE_API.Pump.prepare = (p => function (t, op) { return (t.DefinedKW === 'ChosenColor' && /^Hexproof:ChosenColor & Toxic:1$/.test(t.KW || '')) || !p || p.call(this, t, op); })(FORGE_API.Pump.prepare);
FORGE_API.Pump.gen = (g => function* (P, t, env) {
  if (t.DefinedKW !== 'ChosenColor' || !/^Hexproof:ChosenColor & Toxic:1$/.test(t.KW || '')) return yield* g(P, t, env);
  const couleur = env.src && choixDe(P, env.src).couleur;
  for (const o of objetsForge(P, t, env).filter(x => x && x.j == null && x.zone === 'champ' && !x.lki)) { o.mods.push({f: 0, e: 0, mots: 0, toxique: 1, ...(couleur ? {hexproofDe: couleur} : {}), fin: 'tour'}); P.ver++; }
})(FORGE_API.Pump.gen);
/* Un « hexproof from » : une couleur dont les adversaires ne peuvent plus le cibler. */
ciblable = (g => function (P, o, ctrl, couleurs, src) {
  if (o.zone === 'champ' && o.ctrl !== ctrl && couleurs && (o.mods || []).some(m => m.hexproofDe && couleurs.includes(m.hexproofDe))) return false;
  return g(P, o, ctrl, couleurs, src);
})(ciblable);
