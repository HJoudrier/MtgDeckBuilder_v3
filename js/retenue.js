/* =====================================================================
   js/retenue.js — Ce qui reste après les filtres

   La légalité au format, les « Game Changers », les couleurs, et le verdict
   final : `carteRetenue()` pour une carte de la collection, `filtreOKRec()`
   pour un enregistrement brut de l'archive, qu'on ne veut pas bâtir en carte
   pour rien. Trois réponses partout où l'ignorance est possible — vrai, faux,
   ou `null` : une carte qu'on ne sait pas juger n'est ni masquée ni accusée.
   ===================================================================== */

/* ---------------------------------------------------------------------
   Les « Game Changers » : la liste que Wizards publie pour les paliers du
   format Commander — une quarantaine de cartes dont la présence hausse le
   palier d'un deck. C'est une liste fermée, révisée de temps à autre par
   l'éditeur : plutôt que de la recopier ici, où elle vieillirait en silence,
   on la demande à Scryfall (`is:gamechanger`) et on la garde en cache, comme
   la liste des sets. Tant qu'elle n'est pas chargée, aucune carte n'est
   annoncée comme telle — l'ignorance se dit, elle ne s'invente pas.
   --------------------------------------------------------------------- */

const GC_BASE = {
  etat:'idle',        // idle | chargement | ok | erreur
  maj:null, erreur:'',
  noms:new Set()      // noms normalisés, face avant comprise
};

function gameChangersConnus() {
  return GC_BASE.noms.size > 0;
}

/* Vrai, faux, ou `null` quand la liste n'est pas là : une carte qu'on ne sait
   pas juger n'est pas déclarée ordinaire pour autant. */
function estGameChanger(card) {
  if (!card || !gameChangersConnus()) return null;
  return GC_BASE.noms.has(norm(card.name)) || GC_BASE.noms.has(norm(frontFace(card.name)));
}

/* Légalité d'une carte dans le format en cours. Trois réponses, pas deux :
   `true`, `false`, ou `null` quand nous l'ignorons — carte que ni l'archive ni
   Scryfall n'ont renseignée. Une carte qu'on ne sait pas juger n'est ni
   masquée ni accusée. Limité et Personnalisé n'imposent rien : tout y passe. */
function carteLegale(card) {
  const cle = fmt().legal;
  if (!cle) return true;
  if (!card || typeof card.legal !== 'string') return null;
  return card.legal.includes(cle);
}

/* Le filtre de légalité, tel que la case de la fenêtre Format le règle. */
function legaliteOK(card) {
  return !S.filtreLegal || carteLegale(card) !== false;
}

/* Ce que la collection et les suggestions retiennent : les critères de la
   fenêtre, plus la légalité. Le deck, lui, s'en tient à `carteFiltree()` —
   une carte déjà posée doit rester visible pour pouvoir être retirée, et
   `legality()` la signale. */
function carteRetenue(card) {
  return carteFiltree(card) && legaliteOK(card);
}

/* Applique les filtres avancés à une carte. */
function filtreOK(card) {
  if (!card) return false;
  return filtresValeursOK({
    name: card.name,
    type: () => card.type + ' ' + mainType(card),
    text: card.text || '',
    artist: card.artist || '',
    sets: () => setsCarte(card),
    archetypes: () => archetypesCarte(card),
    force: card.force, endurance: card.endurance, cmc: card.cmc, price: card.price
  });
}

/* Sets d'un enregistrement du catalogue : ceux que porte l'archive, réunis
   à ce que Scryfall a rapporté pour les sets déjà chargés. */
function setsRec(rec) {
  const out = new Set(String(rec[CH.SET] || '').split(',').filter(Boolean));
  if (SETS_BASE.index.size) {
    const nom = rec[CH.NOM];
    const avant = typeof frontFace === 'function' ? frontFace(nom) : nom;
    const s = SETS_BASE.index.get(norm(nom)) || SETS_BASE.index.get(norm(avant));
    if (s) s.forEach(c => out.add(c));
  }
  return [...out];
}

/* Les mêmes critères, lus sur un enregistrement du catalogue : c'est ce qui
   permet de filtrer les dizaines de milliers de cartes de l'archive sans en
   construire autant d'objets. Les rôles, eux, réclament l'analyse du texte :
   ils restent appliqués en aval, sur les seules cartes retenues. */
function filtreOKRec(rec) {
  if (!rec) return false;
  const nom = rec[CH.NOM];
  return filtresValeursOK({
    name: nom,
    type: () => (rec[CH.TYPE] || '') + ' ' + mainType({type: rec[CH.TYPE] || '', isToken: false}),
    text: rec[CH.TEXTE] || '',
    artist: rec[CH.ARTISTE] || '',
    sets: () => setsRec(rec),
    archetypes: () => {
      if (!ARCH_BASE.index.size) return [];
      const avant = typeof frontFace === 'function' ? frontFace(nom) : nom;
      const a = ARCH_BASE.index.get(norm(nom)) || ARCH_BASE.index.get(norm(avant));
      return a ? [...a] : [];
    },
    force: rec[CH.FORCE], endurance: rec[CH.ENDURANCE],
    cmc: rec[CH.CMC], price: rec[CH.PRIX]
  });
}
