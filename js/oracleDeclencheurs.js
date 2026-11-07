/* =====================================================================
   js/oracleDeclencheurs.js — Lire ce qui déclenche une capacité

   « When ~ enters », « Whenever another creature you control dies », « At
   the beginning of your upkeep » : la condition se lit ici, en une ou
   plusieurs écoutes `{evt, sujet, qui, …}` que le moteur confronte à chaque
   évènement (js/jeuDeclencheurs.js). Une condition double — « enters or
   attacks » — rend deux écoutes pour une seule capacité.
   ===================================================================== */

const DECLENCHEURS_ORACLE = [];

function declencheur(re, fait, ex) { DECLENCHEURS_ORACLE.push({re, fait, ex}); }

/* Le sujet d'un évènement : la carte elle-même, ou un descripteur. */
function sujetDecl(txt) {
  if (txt === '~') return 'soi';
  const d = lisDescripteur(txt.replace(/ under your control$/, ' you control'), {objets: true});
  return d || null;
}

const EVTS_SOI = {enters: 'entre', attacks: 'attaque', blocks: 'bloque', dies: 'meurt',
  'becomes blocked': 'estBloque', 'leaves the battlefield': 'quitte'};

declencheur(/^~ (enters|attacks|blocks|dies|becomes blocked|leaves the battlefield)(?: or (enters|attacks|blocks|dies))?$/,
  m => [m[1], m[2]].filter(Boolean).map(e => ({evt: EVTS_SOI[e], sujet: 'soi'})), 'When ~ enters, draw a card.');
declencheur(/^~ deals combat damage to a player(?: or planeswalker)?$/,
  () => [{evt: 'degatsJoueur', sujet: 'soi', combat: true}], 'Whenever ~ deals combat damage to a player, draw a card.');
declencheur(/^(equipped|enchanted) creature (dies|attacks|deals combat damage to a player|deals damage to a player)$/,
  m => [{evt: /dies/.test(m[2]) ? 'meurt' : /attacks/.test(m[2]) ? 'attaque' : 'degatsJoueur', sujet: 'attache',
    combat: /combat/.test(m[2])}], 'Whenever equipped creature dies, draw two cards.');
declencheur(/^~ deals damage to a player$/,
  () => [{evt: 'degatsJoueur', sujet: 'soi'}], 'Whenever ~ deals damage to a player, draw a card.');
declencheur(/^(?:a|an|another|one or more) (.+?) (enters|dies|attacks)$/,
  (m, txt) => {
    const sujet = sujetDecl(m[1]);
    if (!sujet) return null;
    if (/^(another|one or more other)/.test(txt)) sujet.autre = true;
    return [{evt: EVTS_SOI[m[2]], sujet}];
  }, 'Whenever another creature you control enters, you gain 1 life.');
declencheur(/^~ or another (.+?) (dies|enters)$/,
  m => { const sujet = sujetDecl(m[1]); return sujet ? [{evt: EVTS_SOI[m[2]], sujet, aussiSoi: true}] : null; },
  'Whenever ~ or another creature you control dies, each opponent loses 1 life.');
declencheur(/^(you|an opponent|a player) casts? (?:a|an|your first|their first) ((?:.+? )?spell)(?: each turn)?$/,
  (m, txt) => {
    const desc = m[2] === 'spell' ? {genre: 'sort', types: [], non: [], sousTypes: [], couleurs: [], filtres: [], zone: 'pile', mots: 0}
      : lisDescripteur(m[2]);
    if (!desc || desc.genre !== 'sort') return null;
    return [{evt: 'lance', qui: m[1] === 'you' ? 'vous' : m[1] === 'an opponent' ? 'adv' : 'tous', sujet: desc,
      premier: /(your|their) first/.test(txt)}];
  }, 'Whenever you cast a noncreature spell, create a treasure token.');
declencheur(/^you cast ~$/, () => [{evt: 'lanceSoi', sujet: 'soi'}], 'When you cast ~, create a treasure token.');
declencheur(/^you cast a spell$/, () => [{evt: 'lance', qui: 'vous', sujet: null}], 'Whenever you cast a spell, scry 1.');
declencheur(/^(you|an opponent) (?:gains?|gain) life$/,
  m => [{evt: 'gagneVie', qui: m[1] === 'you' ? 'vous' : 'adv'}], 'Whenever you gain life, put a +1/+1 counter on ~.');
declencheur(/^(an opponent|you) draws? a card$/,
  m => [{evt: 'pioche', qui: m[1] === 'you' ? 'vous' : 'adv'}], 'Whenever an opponent draws a card, you gain 1 life.');
declencheur(/^you sacrifice (?:a|an|another) (.+)$/,
  m => { const sujet = sujetDecl(m[1]); return sujet ? [{evt: 'sacrifie', qui: 'vous', sujet}] : null; },
  'Whenever you sacrifice a permanent, draw a card.');
declencheur(/^the beginning of (your|each|each opponent's|each player's|the) (upkeep|end step|draw step|precombat main phase|first main phase)$/,
  m => [{evt: 'etape', etape: {upkeep: 'entretien', 'end step': 'fin', 'draw step': 'pioche',
    'precombat main phase': 'principale1', 'first main phase': 'principale1'}[m[2]],
    qui: m[1] === 'your' ? 'vous' : m[1] === "each opponent's" ? 'adv' : 'tous'}],
  'At the beginning of your upkeep, you gain 1 life.');
declencheur(/^the beginning of combat on your turn$/,
  () => [{evt: 'etape', etape: 'debutCombat', qui: 'vous'}], 'At the beginning of combat on your turn, ~ gets +1/+1 until end of turn.');

/* Lire la condition d'un déclencheur, déjà privée de « when / whenever /
   at ». Rend les écoutes, ou `null`. */
function lisDeclencheur(txt) {
  for (const d of DECLENCHEURS_ORACLE) {
    const m = d.re.exec(txt);
    if (!m) continue;
    const r = d.fait(m, txt);
    if (r) return r;
  }
  return null;
}

/* Ce que l'évènement apporte au texte de l'effet : un objet (« that
   creature ») quand le sujet en est un autre que la carte, un joueur
   (« that player ») quand il s'agit de dégâts infligés. */
function apportDecl(ecoutes) {
  const e = ecoutes[0];
  return {objet: e.sujet && e.sujet !== 'soi', joueur: e.evt === 'degatsJoueur' || e.qui === 'adv'};
}
