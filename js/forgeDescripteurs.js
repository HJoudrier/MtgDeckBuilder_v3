/* =====================================================================
   js/forgeDescripteurs.js — Ce que les filtres de Forge deviennent pour
   le moteur : un emplacement de cible, un genre de marqueur, une zone

   La grammaire des filtres se juge dans js/forgeValide.js ; ici, ses
   textes se traduisent dans le vocabulaire que js/jeuCibles.js et les
   marqueurs du moteur parlent déjà, et les propriétés connues
   s'inscrivent au registre de la couverture.
   ===================================================================== */

/* Une définition — un sort lancé, une carte qu'on réduit — répond-elle ?
   La partie (`P`) n'est donnée que par qui en a besoin : un filtre qui
   regarde les commandants (« shares a creature type with your commander »)
   ne se juge pas sans elle, et ne laisse rien passer. */
function forgeValideDef(def, valid, ctrl, lanceur, id, P = null, source = null) {
  const pseudo = {id, def, lki: true, zone: 'pile', ctrl: lanceur, prop: lanceur, types: def.types, sousTypes: def.sousTypes,
    supers: def.supers, couleurs: def.couleurs, mots: def.mots, force: def.force || 0, endurance: def.endurance || 0, marq: {}};
  return forgeValideObjet(P, pseudo, valid, source || {id}, ctrl, null);
}

/* Le genre de marqueur de Forge (`P1P1`) dans le vocabulaire du moteur. */
function genreMarqueur(t) {
  return {P1P1: '+1/+1', M1M1: '-1/-1', LOYALTY: 'loyaute'}[t] || String(t || '').toLowerCase();
}

/* Un descripteur d'emplacement de cible, lu dans `ValidTgts$` et
   `TgtZone$`. Il porte le filtre Forge (`forge`) et le genre que
   js/jeuCibles.js sait parcourir : joueurs, objets du champ, sorts, cartes
   d'une autre zone. */
function descForge(valid, zone, sort) {
  /* `;` sépare les choix dans un coût (`tapXType<2/Artifact;Creature;Land>`), `,` ailleurs. */
  const v = String(valid || '').replace(/;/g, ',').replace(/\bAny\b/g, 'Creature,Planeswalker,Battle,Player');
  const alts = forgeFiltre(v);
  const joueurs = alts.some(a => a.joueur), objets = alts.some(a => !a.joueur);
  const z = ZONES_FORGE[zone] || 'champ';
  const genre = sort || z === 'pile' ? 'sort' : !objets ? 'joueur' : z !== 'champ' ? 'carte' : joueurs ? 'nimporte' : 'objet';
  return {forge: v, genre, zone: genre === 'carte' ? z : genre === 'sort' ? 'pile' : 'champ', types: [], non: [], sousTypes: [],
    couleurs: [], filtres: [], mots: 0, ctrl: alts.every(a => a.props.includes('YouCtrl')) ? 'vous' : null};
}

const ZONES_FORGE = {Battlefield: 'champ', Graveyard: 'cimetiere', Hand: 'main', Library: 'bibliotheque', Exile: 'exil',
  Stack: 'pile', Command: 'commandement'};

forgeSait('filtre', ...FORGE_PROPS, 'inZone', 'Soustype', 'nonSoustype', 'powerXX', 'toughnessXX', 'cmcXX', 'counters', 'named',
  ...Object.keys(FORGE_TYPES_CARTE), ...Object.keys(FORGE_COULEURS), ...Object.keys(FORGE_SUPERS),
  ...Object.keys(FORGE_TYPES_CARTE).map(t => 'non' + t), ...Object.keys(FORGE_COULEURS).map(t => 'non' + t),
  ...Object.keys(FORGE_SUPERS).map(t => 'non' + t),
  ...Object.keys(MOTS_ANGLAIS).flatMap(k => {
    const avec = k.replace(/(^|\s)([a-z])/g, (_, s, l) => s + l.toUpperCase()), sans = avec.replace(/\s/g, '');
    return ['with' + avec, 'without' + avec, 'with' + sans, 'without' + sans];
  }));

/* Un emplacement de cible d'une table de Forge : son descripteur, son
   nombre de cibles, et les restrictions entre elles. */
function emplacementForge(t, face) {
  const min = t.TargetMin != null ? (/^\d+$/.test(t.TargetMin) ? +t.TargetMin : 0) : 1;
  const max = t.TargetMax != null ? (/^\d+$/.test(t.TargetMax) ? +t.TargetMax : 1) : Math.max(1, min);
  /* « Any number of target … » : un maximum calculé au choix des cibles
     (js/jeuLancer.js), sauf X payé en mana, choisi ici après elles. */
  const maxExpr = t.TargetMax != null && !/^\d+$/.test(t.TargetMax) ? String(face.svars[t.TargetMax] || t.TargetMax) : null;
  /* Sans `TgtZone$`, un déplacement cible dans sa zone d'origine :
     « return target creature card from your graveyard ». */
  const zone = t.TgtZone || (forgeApi(t) === 'ChangeZone' && t.Origin && !/,/.test(t.Origin) ? t.Origin : null);
  const desc = descForge(t.ValidTgts || 'Card', zone, /Spell/.test(t.TargetType || ''));
  /* « Target spell with a single target ». */
  if (/singleTarget|numTargets EQ1/.test(t.TargetType || '')) desc.uneCible = true;
  const restrB = {...(t.TargetsWithDefinedController ? {ctrlDefini: t.TargetsWithDefinedController} : {}),
    ...(/^\d+$/.test(t.MaxTotalTargetCMC || '') ? {cmcMax: +t.MaxTotalTargetCMC} : {}), ...(t.TargetValidTargeting ? {visant: t.TargetValidTargeting} : {})};
  /* Un autre joueur choisit la cible (js/forgeChoisisseur.js). */
  const choisisseur = t.TargetingPlayer === 'Player.Opponent' ? {choisisseur: 'adversaire', controle: t.TargetingPlayerControls === 'True'} : {};
  return {desc, min, max, ...choisisseur, ...(maxExpr && !/xPaid|^X$/.test(maxExpr) ? {maxExpr, maxFace: face} : {}), ...restrB,
    /* Les restrictions entre cibles, jugées après le choix (js/jeuLancer.js). */
    ...(t.TargetsWithSameController === 'True' || t.DifferentNames === 'True' || t.TargetsForEachPlayer === 'True' || t.TargetsWithDifferentControllers === 'True' || t.TargetsWithSameCreatureType === 'True' || t.TargetsWithSameCardType === 'True'
      ? {restr: {meme: t.TargetsWithSameController === 'True', noms: t.DifferentNames === 'True', type: t.TargetsWithSameCreatureType === 'True', typeCarte: t.TargetsWithSameCardType === 'True',
        parJoueur: t.TargetsForEachPlayer === 'True' || t.TargetsWithDifferentControllers === 'True'}} : {})};
}
