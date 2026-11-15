/* =====================================================================
   js/forgeMotsClesF.js — Les mots-clés, III

   Des mots-clés que les cartes les plus jouées en Commander portent :
   - Afflict (Neheb, the Eternal), Dethrone (Treasonous Ogre), Ravenous
     (Jacked Rabbit) : des déclencheurs synthétiques ;
   - Web-slinging (Spider-Sense), Freerunning (Overpowering Attack),
     Harmonize (Nature's Rhythm) : des façons de lancer ;
   - Compleated (Vraska, Betrayal's Sting) : sans effet ici, le moteur ne
     payant jamais le mana phyrexian en vie (js/oracleCouts.js) ;
   - les jetons qui gagnent des capacités en naissant (`PumpKeywords$`).
   ===================================================================== */

motCleLancementB = (g => function (def, face, jetons, tete, reste) {
  const n = reste.length === 1 && /^\d+$/.test(reste[0]) ? +reste[0] : null;
  const mana = () => { const c = reste.length === 1 ? manaSeul(reste[0]) : null; return c ? coutComplet(c).mana : null; };
  switch (tete) {
    case 'Afflict': return n != null && synthese(def, face, jetons, 'Affliction', {Mode: 'AttackerBlocked', ValidCard: 'Card.Self'},
      `DB$ LoseLife | Defined$ TriggeredDefendingPlayer | LifeAmount$ ${n}`);
    case 'Dethrone': return !reste.length && synthese(def, face, jetons, 'Detronement', {Mode: 'Attacks', ValidCard: 'Card.Self', DefenderMostLife: 'True'},
      'DB$ PutCounter | Defined$ Self | CounterType$ P1P1 | CounterNum$ 1');
    /* « Enters with X +1/+1 counters. When it enters, if X is 5 or more,
       draw a card » : X est celui payé pour le permanent. */
    case 'Ravenous':
      if (reste.length) return false;
      marqueursEntree(def, 'X', genreMarqueur('P1P1'));
      return synthese(def, face, jetons, 'Vorace', ENTRE, 'DB$ Draw | Defined$ You | NumCards$ 1 | ConditionCheckSVar$ VoraceX | ConditionSVarCompare$ GE5',
        {VoraceX: 'Count$XPayePourSource'});
    case 'Web-slinging': return !!(def.toile = mana());
    case 'Freerunning': return !!(def.courseLibre = mana());
    case 'Harmonize': return !!(def.harmonie = mana());
    case 'Compleated': return !reste.length;
    /* « Impending 4—{1}{G}{G} » : à l'étape de fin, un marqueur temps s'en va. */
    case 'Impending': {
      const c = reste.length === 2 && /^\d+$/.test(reste[0]) ? manaSeul(reste[1]) : null;
      if (!c) return false;
      def.imminence = {n: +reste[0], mana: coutComplet(c).mana};
      return synthese(def, face, jetons, 'Imminence', {Mode: 'Phase', Phase: 'End of Turn', ValidPlayer: 'You', IsPresent: 'Card.Self+counters_GE1_TIME'},
        'DB$ RemoveCounter | Defined$ Self | CounterType$ TIME | CounterNum$ 1');
    }
    /* Soulbond : s'apparier en entrant, ou quand une autre créature entre. */
    case 'Soulbond':
      return !reste.length && synthese(def, face, jetons, 'Apparie', ENTRE, 'DB$ Apparier') &&
        synthese(def, face, jetons, 'ApparieAutre', {Mode: 'ChangesZone', Destination: 'Battlefield', ValidCard: 'Creature.Other+YouCtrl'}, 'DB$ Apparier | Avec$ Triggered');
  }
  return g(def, face, jetons, tete, reste);
})(motCleLancementB);

exprEtendue = (g => function (P, tete, q, env) {
  return tete === 'Count' && q === 'XPayePourSource' ? (env.src && env.src.x) || 0 : g(P, tete, q, env);
})(exprEtendue);

/* —— Dethrone : le joueur qui a le plus de vie ———————————————————————— */

/* « Attacks the player with the most life or tied for most life ». */
function defenseurLePlusRiche(P, e) {
  const d = e.defenseur, j = d == null ? null : typeof d === 'object' ? d.j : d;
  if (j == null || !P.joueurs[j]) return false;
  return P.joueurs[j].vie >= Math.max(...vivants(P).map(J => J.vie));
}
FORGE_MODES.Attacks = (j => (P, t, e, s, env) => j(P, t, e, s, env) && (t.DefenderMostLife !== 'True' || defenseurLePlusRiche(P, e)))(FORGE_MODES.Attacks);

/* —— Les façons de lancer —————————————————————————————————————————————— */

/* Freerunning : on a infligé ce tour des blessures de combat à un joueur
   avec un Assassin ou un commandant. */
noteHistorique = (g => function (P, e) {
  g(P, e);
  if (e.t !== 'degatsJoueur' || !e.combat) return;
  const s = obj(P, e.source) || P.lkis.get(e.source);
  if (s && s.ctrl != null && (s.cmd || (caracsDe(P, s).sousTypes || []).includes('assassin'))) (histoire(P).courseLibre = histoire(P).courseLibre || {})[s.ctrl] = true;
})(noteHistorique);

variantesMotsClesE = (g => function (P, j, o, depuis, essaie) {
  g(P, j, o, depuis, essaie);
  const d = o.def;
  if (depuis === 'main' && d.toile) essaie('toile', coutSort(P, j, o, depuis, d.toile), fusionAutres(d.coutSup, {renvoie: {n: 1, desc: descForge('Creature.tapped+YouCtrl')}}));
  if (depuis === 'main' && d.courseLibre && (histoire(P).courseLibre || {})[j]) essaie('courseLibre', coutSort(P, j, o, depuis, d.courseLibre), d.coutSup || null);
  /* Harmonize sans la réduction (engager une créature) : une façon légale
     de le payer, la plus chère. Le sort part ensuite en exil
     (js/jeuVariantesB.js `exileApresResolution()`). */
  if (depuis === 'cimetiere' && d.harmonie) essaie('harmonie', coutSort(P, j, o, depuis, d.harmonie), d.coutSup || null);
  if (depuis === 'main' && d.imminence) essaie('imminence', coutSort(P, j, o, depuis, d.imminence.mana), d.coutSup || null);
})(variantesMotsClesE);
apresVariante = (g => function (P, o, v) {
  if (v !== 'imminence' || !o) return g(P, o, v);
  o.marq.time = (o.marq.time || 0) + o.def.imminence.n;
  o.anime = [...(o.anime || []), {fin: 'jamais', retireType: ['creature'], siTemps: true}];
  P.ver++;
})(apresVariante);

/* —— Soulbond ——————————————————————————————————————————————————————————— */

/* Le partenaire d'une créature : tant que les deux sont en jeu, chez le
   même contrôleur, l'une désignant l'autre. */
function paireDe(P, o) {
  const x = o && o.zone === 'champ' && o.paire != null ? obj(P, o.paire) : null;
  return x && x.zone === 'champ' && x.paire === o.id && x.ctrl === o.ctrl ? x : null;
}
forgeEffet('Apparier', ['Avec'], function* (P, t, env) {
  const s = env.src;
  if (!s || s.lki || s.zone !== 'champ' || paireDe(P, s)) return;
  const libre = o => !!o && o.id !== s.id && o.zone === 'champ' && estCreature(o) && o.ctrl === s.ctrl && !paireDe(P, o);
  const ids = (t.Avec === 'Triggered' ? [objetEvt(P, env.ctx)] : champDe(P, s.ctrl)).filter(libre).map(o => o.id);
  const pris = yield* choisitCartes(P, s.ctrl, ids, 1, 'Apparier', 'cartes', 0);
  if (!pris.length) return;
  const o = obj(P, pris[0]);
  s.paire = o.id; o.paire = s.id; P.ver++;
  jn(P, `${s.def.nom} et ${o.def.nom} sont appariés`);
}, (t, op) => { op.op = 'forge'; op.hostile = false; });

proprieteDesignee = (g => function (P, o, p, c, src, ctrl, env) {
  if (p === 'Paired') return !!P && !!paireDe(P, o);
  if (p === 'PairedWith') { const x = P && src ? paireDe(P, src) : null; return !!x && x.id === o.id; }
  if (p === 'harnessed') return !!o.harnais;
  return g(P, o, p, c, src, ctrl, env);
})(proprieteDesignee);

/* —— Harness, les marqueurs d'un joueur —————————————————————————————————— */

/* « Harness The Soul Stone » : un attribut, que `harnessed` lit. */
FORGE_API.AlterAttribute.prepare = (p => function (t, op) { return t.Attributes === 'Harnessed' ? !t.Activate || t.Activate === 'True' : p.call(this, t, op); })(FORGE_API.AlterAttribute.prepare);
FORGE_API.AlterAttribute.gen = (g => function* (P, t, env) {
  if (t.Attributes !== 'Harnessed') return yield* g(P, t, env);
  objetsForge(P, t, env).filter(o => o.zone === 'champ' && !o.lki).forEach(o => { o.harnais = true; P.ver++; });
})(FORGE_API.AlterAttribute.gen);

/* `TargetedPlayer$Counters.Poison` (Vraska, Betrayal's Sting). */
quantiteJoueur = (g => function (P, j, q) {
  const m = j != null && /^Counters\.(\w+)$/.exec(q);
  if (!m) return g(P, j, q);
  const J = P.joueurs[j], k = genreMarqueur(m[1]);
  return m[1] === 'Poison' ? J.poison || 0 : k === 'energy' ? J.energie || 0 : (J.marqueurs || {})[k] || 0;
})(quantiteJoueur);

/* —— Les jetons qui gagnent des capacités ——————————————————————————————— */

/* « It gains lifelink and haste until end of turn » : sans durée, pour
   toujours. */
etendEffet('Token', ['PumpKeywords', 'PumpDuration'], null, function* (P, t, env, touches, nouveaux) {
  if (t.PumpKeywords) pompeForge(P, nouveaux, {KW: t.PumpKeywords, Duration: t.PumpDuration === 'EOT' ? undefined : 'Permanent'}, env);
});

forgeSait('kw', 'Afflict', 'Dethrone', 'Ravenous', 'Web-slinging', 'Freerunning', 'Harmonize', 'Compleated', 'Impending', 'Soulbond');
forgeSait('filtre', 'Paired', 'PairedWith', 'harnessed');
forgeSait('expr', 'TargetedPlayer$Counters', 'TriggeredPlayer$Counters');
