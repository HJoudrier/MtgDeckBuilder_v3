/* =====================================================================
   js/forgeMotsCles.js — Les mots-clés de Forge (`K:`)

   `K:Flying`, `K:Protection from red`, `K:Ward:2`, `K:Equip:1 W`,
   `K:Flashback:3 R`, `K:etbCounter:P1P1:2`… Un mot-clé simple devient un
   bit, comme pour le compilateur d'oracle ; ceux qui portent un paramètre
   le rangent à côté, là où le moteur le lit déjà. Une forme que le moteur
   ne sait pas jouer rend `false` : l'unité est écartée, et la couverture
   le dit.
   ===================================================================== */

const FORGE_MOTS_PARAMETRES = ['Protection', 'Ward', 'Equip', 'Enchant', 'Flashback', 'etbCounter', 'Devoid', 'Landwalk'];

/* Verser un mot-clé dans une définition. Rend vrai s'il est compris. */
function motCleForge(def, k) {
  const [tete, ...reste] = k.split(':');
  const bit = MOTS_ANGLAIS[tete.toLowerCase()];
  if (bit != null && !reste.length) { def.mots |= bit; return true; }
  let m;
  if ((m = /^Protection from (white|blue|black|red|green)(?: and from (white|blue|black|red|green))?$/i.exec(tete))) {
    def.mots |= MOT.PROTECTION;
    def.params.protection = [...(def.params.protection || []), ...[m[1], m[2]].filter(Boolean).map(c => COULEURS_ANGLAIS[c.toLowerCase()])];
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
      if (n == null || reste.length > 2) return false;
      def.entree = Object.assign(def.entree || {}, {marqueurs: n, genre: g}); return true;
    }
    case 'Devoid': def.couleurs = []; return true;
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
  return false;
}

forgeSait('kw', ...Object.keys(MOTS_ANGLAIS).map(k => k.replace(/(^|\s)([a-z])/g, (_, s, l) => s + l.toUpperCase())),
  ...FORGE_MOTS_PARAMETRES);
