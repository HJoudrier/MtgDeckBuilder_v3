/* =====================================================================
   js/inconnues.js — Les cartes importées sans fiche, complétées par l'archive

   Une carte qu'un import n'a trouvée nulle part naît « inconnue » : type
   « Inconnu », ni coût, ni texte, ni visuel. Elle se range alors dans
   « Autre » et la liste n'a pour elle qu'une case vide. Les cartes d'un deck
   externe sont presque toutes dans ce cas, puisqu'on ne les possède pas.
   Scryfall les complète, mais demande le réseau ; l'archive locale, déjà en
   mémoire, le fait sans rien demander.
   ===================================================================== */

/* Ce que l'enregistrement de l'archive dit d'une carte, posé sur une carte
   déjà bâtie : texte complet, identité, force, mana produit, règles de jeu,
   visuels. Les visuels viennent du CDN de l'archive, ou à défaut de Scryfall
   par identifiant. */
function habilleDepuisRec(c, rec) {
  c.textFull = !!rec[CH.TEXTE];
  if (rec[CH.ID_COUL] !== undefined) c.identity = rec[CH.ID_COUL] ? rec[CH.ID_COUL].split('') : [];
  c.cmc = rec[CH.CMC];
  if (rec[CH.FORCE] != null) c.force = rec[CH.FORCE];
  if (rec[CH.ENDURANCE] != null) c.endurance = rec[CH.ENDURANCE];
  if (rec[CH.ARTISTE]) c.artist = rec[CH.ARTISTE];
  if (rec[CH.MANA_PROD]) c.manaProduit = ordonneMana(String(rec[CH.MANA_PROD]).split(''));
  appliqueChampsJeu(c, champsJeuRec(rec));
  noterLegalArchive(c, rec);
  reanalyser(c);
  if (rec[CH.IMG]) {
    c.img = CDN + 'small/' + rec[CH.IMG];
    c.imgN = CDN + 'normal/' + rec[CH.IMG];
    c.imgL = CDN + 'large/' + rec[CH.IMG];
    if (rec[CH.VERSO]) { c.imgB = CDN + 'normal/' + rec[CH.VERSO]; c.imgBL = CDN + 'large/' + rec[CH.VERSO]; }
    c.imgTried = true;
  } else if (rec[CH.ID]) {
    const base = 'https://api.scryfall.com/cards/' + rec[CH.ID] + '?format=image&version=';
    c.img = base + 'small'; c.imgN = base + 'normal'; c.imgL = base + 'large'; c.imgTried = true;
  }
}

/* La carte inconnue devient la carte de l'archive, en gardant son nom — les
   decks la désignent par lui — et ce que l'import a relevé d'elle, l'édition
   par exemple : seuls les champs que `buildCard()` écrit sont remplacés. Elle
   ne devient pas une candidate externe : elle est dans un deck, on la
   connaît. */
function completeInconnueDepuisRec(c, rec) {
  const neuve = buildCard(c.name, rec[CH.COUT] || '—', rec[CH.TYPE], rec[CH.PRIX], rec[CH.TEXTE]);
  delete neuve.name;
  Object.assign(c, neuve);
  habilleDepuisRec(c, rec);
  noterSetsArchive(c, rec);
  c.unknown = false;
  return c;
}

/* Complète d'un seul parcours de l'archive toutes les cartes inconnues, de
   tous les decks. Rend leur nombre ; celles que l'archive ne porte pas
   restent inconnues, pour Scryfall. */
function completeInconnuesDepuisArchive() {
  if (!CAT.cartes.length) return 0;
  const attendues = new Map();
  DB.forEach(c => {
    if (!c.unknown) return;
    [norm(c.name), loose(c.name), loose(frontFace(c.name))].forEach(k => { if (k && !attendues.has(k)) attendues.set(k, c); });
  });
  if (!attendues.size) return 0;
  let n = 0;
  for (const rec of CAT.cartes) {
    const nom = rec[CH.NOM];
    const c = attendues.get(norm(nom)) || attendues.get(loose(nom)) || attendues.get(loose(frontFace(nom)));
    if (!c || !c.unknown) continue;
    completeInconnueDepuisRec(c, rec);
    n++;
  }
  if (n) { MAJ_CARTES++; invaliderCandidats(); scheduleSave(); }
  return n;
}
