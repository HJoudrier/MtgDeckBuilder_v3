/* =====================================================================
   js/couleurs.js — Le vocabulaire des couleurs

   Les cent-vingt-quatre combinaisons de mana ont chacune un nom que les joueurs
   emploient — Azorius, Jeskai, Abzan. Cette table les rend, et l'en-tête comme
   la fenêtre des filtres y puisent leurs pastilles.
   ===================================================================== */

const MTG_COMBINAISONS = {
  // 1 couleur
  'W': 'Mono-Blanc',
  'U': 'Mono-Bleu',
  'B': 'Mono-Noir',
  'R': 'Mono-Rouge',
  'G': 'Mono-Vert',
  // 2 couleurs (Guildes de Ravnica)
  'WU': 'Azorius',
  'WB': 'Orzhov',
  'WR': 'Boros',
  'WG': 'Selesnya',
  'UB': 'Dimir',
  'UR': 'Izzet',
  'UG': 'Simic',
  'BR': 'Rakdos',
  'BG': 'Golgari',
  'RG': 'Gruul',
  // 3 couleurs (Éclats d'Alara & Khans de Tarkir)
  'WUB': 'Esper',
  'WUR': 'Jeskai',
  'WUG': 'Bant',
  'WBR': 'Mardu',
  'WBG': 'Abzan',
  'WRG': 'Naya',
  'UBR': 'Grixis',
  'UBG': 'Sultai',
  'URG': 'Temur',
  'BRG': 'Jund',
  // 4 couleurs (Nephilim)
  'WUBR': 'Sans-Vert (Yore-Tiller)',
  'WUBG': 'Sans-Rouge (Witch-Maw)',
  'WURG': 'Sans-Noir (Ink-Treader)',
  'WBRG': 'Sans-Bleu (Dune-Brood)',
  'UBRG': 'Sans-Blanc (Glint-Eye)',
  // 5 couleurs
  'WUBRG': '5 Couleurs (WUBRG)'
};

function nomCombinaisonCouleurs(sel) {
  if (!sel || sel.size === 0) return 'Aucune';
  const hasC = sel.has('C');
  const wubrg = ['W', 'U', 'B', 'R', 'G'].filter(c => sel.has(c)).join('');
  if (!wubrg && hasC) return 'Incolore';
  if (!wubrg && !hasC) return 'Aucune';
  /* Le nom de la guilde, seul. L'incolore coché en plus des couleurs allongeait
     ce nom d'un « (+ Incolore) » qui le noyait, et le pion `C` de la barre de
     mana le dit déjà : allumé, il est retenu ; éteint, il est écarté. Coché
     seul, en revanche, l'incolore garde son nom — la ligne au-dessus. */
  return MTG_COMBINAISONS[wubrg] || wubrg;
}

/* Couleurs proposées par l'en-tête et par la fenêtre des filtres. */
const COLS = [
  ['W', 'Blanc ({W})'],
  ['U', 'Bleu ({U})'],
  ['B', 'Noir ({B})'],
  ['R', 'Rouge ({R})'],
  ['G', 'Vert ({G})'],
  ['C', 'Incolore ({C})']
];

const MODES_COULEUR = [
  ['identity', 'Identité couleur (EDH)'],
  ['atleast', 'Au moins une'],
  ['exact', 'Exactement']
];

