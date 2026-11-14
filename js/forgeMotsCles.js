/* =====================================================================
   js/forgeMotsCles.js — Les mots-clés de Forge (`K:`)

   `K:Flying`, `K:Protection from red`, `K:Ward:2`, `K:Equip:1 W`,
   `K:Flashback:3 R`, `K:etbCounter:P1P1:2`… Un mot-clé simple devient un
   bit, comme pour le compilateur d'oracle ; ceux qui portent un paramètre
   le rangent à côté, là où le moteur le lit déjà. Une forme que le moteur
   ne sait pas jouer rend `false` : l'unité est écartée, et la couverture
   le dit.
   ===================================================================== */

const FORGE_MOTS_PARAMETRES = ['Protection', 'Ward', 'Equip', 'Enchant', 'Flashback', 'etbCounter', 'Devoid', 'Landwalk',
  'Cycling', 'TypeCycling', 'Kicker', 'Buyback', 'Evoke', 'Echo', 'Foretell', 'Convoke', 'Delve', 'Affinity', 'Unearth', 'Madness',
  'Suspend', 'AlternateAdditionalCost', 'Partner', 'Chapter', 'Crew', 'Morph', 'Megamorph', 'Disguise', 'ETBReplacement', 'Changeling', 'Cumulative upkeep'];

/* Le cycle : défausser la carte depuis la main, pour piocher — ou, pour un
   cycle de type (`TypeCycling:Plains:2`), chercher une carte de ce type. */
function cycleForge(def, face, jetons, cout, type) {
  const c = coutForge(cout);
  if (!c || c.cout.engage || c.cout.sacSoi) return false;
  const filtre = type == null ? null : type === 'Basic' ? 'Land.Basic' : 'Card.' + type;
  const table = filtre ? {DB: 'ChangeZone', Origin: 'Library', Destination: 'Hand', ChangeType: filtre, ChangeNum: '1'}
    : {DB: 'Draw', NumCards: '1'};
  const effet = effetForge(face, table, jetons);
  if (!effet) return false;
  def.capacites.push({genre: 'activee', zone: 'main', cout: {...c.cout, defausseSoi: true}, effet, cycle: true, vitesse: null,
    texte: (type ? type + 'cycling' : 'Cycling') + ' — ' + cout});
  return true;
}

/* Un coût de mot-clé en mana seul (évocation, écho, présage). */
function manaSeul(txt) {
  const c = coutForge(txt);
  return c && !Object.keys(c.cout).some(k => k !== 'mana') ? c.cout : null;
}

const PROTECTIONS_MOTS = {artifacts: 'Artifact', creatures: 'Creature', enchantments: 'Enchantment', everything: 'Card',
  multicolored: 'Card.MultiColor', instants: 'Instant', sorceries: 'Sorcery', planeswalkers: 'Planeswalker', lands: 'Land'};

/* Le filtre d'une protection qui n'est pas de couleur, ou `'couleurs'`
   pour « from each color », ou `null`. */
function protectionFiltre(tete, reste) {
  if (tete === 'Protection' && reste[0] && !/^Card\.(White|Blue|Black|Red|Green)$/.test(reste[0])) return /ChosenColor/.test(reste[0]) ? null : reste[0];
  const m = /^Protection from (.+)$/.exec(tete);
  if (!m) return null;
  if (m[1] === 'each color' || m[1] === 'all colors') return 'couleurs';
  if (PROTECTIONS_MOTS[m[1]]) return PROTECTIONS_MOTS[m[1]];
  const k = /^([A-Z][a-z]+)s$/.exec(m[1]);
  return k ? k[1] : null;
}

/* Verser un mot-clé dans une définition. Rend vrai s'il est compris. */
function motCleForge(def, k, face, jetons) {
  const [tete, ...reste] = k.split(':');
  const bit = MOTS_ANGLAIS[tete.toLowerCase()];
  if (bit != null && !reste.length) { def.mots |= bit; return true; }
  let m;
  if ((m = /^Protection from (white|blue|black|red|green)(?: and from (white|blue|black|red|green))?$/i.exec(tete))) {
    def.mots |= MOT.PROTECTION;
    def.params.protection = [...(def.params.protection || []), ...[m[1], m[2]].filter(Boolean).map(c => COULEURS_ANGLAIS[c.toLowerCase()])];
    return true;
  }
  /* La protection contre autre chose qu'une couleur : un filtre de Forge
     (`K:Protection:Artifact`, `Protection from creatures`), que
     js/jeuCibles.js `protegeContre()` juge contre la source. */
  const pf = protectionFiltre(tete, reste);
  if (pf) {
    def.mots |= MOT.PROTECTION;
    if (pf === 'couleurs') def.params.protection = ['W', 'U', 'B', 'R', 'G'];
    else def.params.protectionFiltres = [...(def.params.protectionFiltres || []), pf];
    return true;
  }
  switch (tete) {
    case 'Ward': {
      const n = /^\d+$/.test(reste[0] || '') ? +reste[0] : (m = /^PayLife<(\d+)>$/.exec(reste[0] || '')) ? +m[1] : null;
      if (n == null) return false;
      def.mots |= MOT.GARDE; def.params.garde = n; return true;
    }
    case 'Equip': {
      const c = coutForge(reste[0]);
      if (!c || Object.keys(c.cout).some(x => x !== 'mana')) return false;
      def.equipe = c.cout.mana; return true;
    }
    case 'Flashback': {
      const c = coutForge(reste[0]);
      if (!c || Object.keys(c.cout).some(x => x !== 'mana')) return false;
      def.flashback = c.cout.mana; return true;
    }
    case 'etbCounter': {
      const g = genreMarqueur(reste[0]), n = reste[1] === 'X' ? 'X' : /^\d+$/.test(reste[1] || '') ? +reste[1] : null;
      if (n != null && reste.length <= 2) { def.entree = Object.assign(def.entree || {}, {marqueurs: n, genre: g}); return true; }
      /* Un nombre calculé (`Y`, une SVar), ou une condition (`CheckSVar$
         WasKicked`) : lus à l'entrée par js/jeuOpsB.js `metEnJeu()`. */
      if (!reste[1] || reste.length > 4) return false;
      const cond = reste[2] ? forgeTable(reste[2]) : null;
      if (cond && Object.keys(cond).some(k => !/^(CheckSVar|SVarCompare)$/.test(k))) return false;
      def.entree = Object.assign(def.entree || {}, {marqueursForge: {genre: g, n: reste[1], cond, face}}); return true;
    }
    case 'Devoid': def.couleurs = []; return true;
    case 'Cycling': return reste.length === 1 && cycleForge(def, face, jetons, reste[0], null);
    case 'TypeCycling': return reste.length === 2 && /^[A-Z][a-z]+$/.test(reste[0]) && cycleForge(def, face, jetons, reste[1], reste[0]);
    case 'Kicker': case 'Buyback': {
      const c = reste.length === 1 ? coutForge(reste[0]) : null;
      if (!c || c.cout.sacSoi || c.cout.exileSoi) return false;
      def[tete === 'Kicker' ? 'kicker' : 'rachat'] = c.cout; return true;
    }
    case 'Evoke': case 'Echo': case 'Foretell': {
      const c = reste.length === 1 ? manaSeul(reste[0]) : null;
      if (!c) return false;
      if (tete === 'Evoke') def.evocation = c;
      else if (tete === 'Foretell') def.presage = c.mana;
      else { def.echo = c; def.capacites.push(CAP_ECHO); }
      return true;
    }
    case 'Unearth': {
      const c = reste.length === 1 ? coutForge(reste[0]) : null;
      if (!c || c.cout.engage || c.cout.sacSoi) return false;
      def.capacites.push({genre: 'activee', zone: 'cimetiere', vitesse: 'rituel', cout: c.cout, texte: 'Unearth — ' + reste[0],
        effet: {ops: [{op: 'exhume', hostile: false}], cibles: [], modes: null}});
      return true;
    }
    case 'Madness': { const c = reste.length === 1 ? manaSeul(reste[0]) : null; if (!c) return false; def.folie = c; return true; }
    case 'Suspend': {
      const c = reste.length === 2 && /^\d+$/.test(reste[0]) ? manaSeul(reste[1]) : null;
      if (!c) return false;
      def.suspension = {n: +reste[0], cout: c.mana}; return true;
    }
    case 'Convoke': def.params.convocation = true; return !reste.length;
    /* Deux coûts additionnels, l'un ou l'autre (js/jeuVariantes.js). */
    case 'AlternateAdditionalCost': {
      const cs = reste.slice(0, 2).map(x => coutForge(x));
      if (reste.length !== 2 || cs.some(c => !c || c.cout.sacSoi || c.cout.exileSoi)) return false;
      def.coutsAuChoix = cs.map((c, i) => ({cout: c.cout, texte: reste[i]})); return true;
    }
    /* Le partenaire ne joue qu'à la construction du deck. */
    case 'Partner': return true;
    case 'ETBReplacement': return entreeForgeMotCle(def, face, jetons, reste);
    case 'Changeling': def.params.changelin = true; return !reste.length;
    case 'Cumulative upkeep': {
      const c = reste.length === 1 ? manaSeul(reste[0]) : null;
      if (!c) return false;
      def.cumul = c.mana; def.capacites.push(CAP_CUMUL); return true;
    }
    /* Une saga : un effet par chapitre (js/jeuFaces.js `ajouteLore()`). */
    case 'Chapter': {
      const ch = String(reste[1] || '').split(',').map(n => effetForge(face, forgeSousCapacite(face, n.trim()), jetons));
      if (!ch.length || ch.some(e => !e) || ch.length !== +reste[0]) return false;
      def.chapitres = ch; return true;
    }
    case 'Crew': {
      if (!/^\d+$/.test(reste[0] || '')) return false;
      def.capacites.push({genre: 'activee', cout: {mana: coutManaVide(), equipage: +reste[0]}, texte: 'Crew ' + reste[0],
        effet: {ops: [{op: 'equipage', hostile: false}], cibles: [], modes: null}});
      return true;
    }
    case 'Morph': case 'Megamorph': case 'Disguise': {
      const c = reste.length === 1 ? manaSeul(reste[0]) : null;
      if (!c) return false;
      def.morph = {cout: c.mana, mega: tete === 'Megamorph', garde: tete === 'Disguise'}; return true;
    }
    case 'Delve': def.params.delve = true; return !reste.length;
    case 'Affinity': if (!reste[0]) return false; def.params.affinite = reste[0]; return true;
  }
  /* La traversée (`Landwalk:Swamp`, `Landwalk:Land.Legendary`) : un filtre
     de terrain, que js/jeuCombat.js juge chez le défenseur. */
  if (tete === 'Landwalk' && reste[0]) {
    def.params.passage = [...(def.params.passage || []), reste[0]];
    return true;
  }
  /* « Enchant creature » : ce que l'aura peut enchanter, donc ce que son
     sort cible. Une aura qui enchante un joueur n'est pas jouée. */
  if ((m = /^Enchant(?: (\w+))?$/.exec(tete))) {
    const v = m[1] ? m[1][0].toUpperCase() + m[1].slice(1) : reste[0];
    if (!v || /Player|Opponent/.test(v)) return false;
    def.aura = descForge(v);
    return true;
  }
  /* La traîne (js/forgeTraine.js). */
  const t = motCleTraine(def, k, face, jetons, tete, reste);
  if (t != null) return t;
  return false;
}

forgeSait('kw', ...Object.keys(MOTS_ANGLAIS).map(k => k.replace(/(^|\s)([a-z])/g, (_, s, l) => s + l.toUpperCase())),
  ...FORGE_MOTS_PARAMETRES);
