/* =====================================================================
   js/forgeDescripteurs.js — Ce que les filtres de Forge deviennent pour
   le moteur : un emplacement de cible, un genre de marqueur, une zone

   La grammaire des filtres se juge dans js/forgeValide.js ; ici, ses
   textes se traduisent dans le vocabulaire que js/jeuCibles.js et les
   marqueurs du moteur parlent déjà, et les propriétés connues
   s'inscrivent au registre de la couverture.
   ===================================================================== */

/* Une définition — un sort lancé, une carte qu'on réduit — répond-elle ? */
function forgeValideDef(def, valid, ctrl, lanceur, id) {
  const pseudo = {id, def, lki: true, zone: 'pile', ctrl: lanceur, prop: lanceur, types: def.types, sousTypes: def.sousTypes,
    supers: def.supers, couleurs: def.couleurs, mots: def.mots, force: def.force || 0, endurance: def.endurance || 0, marq: {}};
  return forgeValideObjet(null, pseudo, valid, {id}, ctrl, null);
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
  const v = String(valid || '').replace(/\bAny\b/g, 'Creature,Planeswalker,Battle,Player');
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
