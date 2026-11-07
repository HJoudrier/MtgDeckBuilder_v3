/* =====================================================================
   js/champsJeu.js — Ce que le moteur de jeu demande à une carte

   L'atelier n'avait besoin que de quoi classer une carte : son coût, son
   type, son texte. Le moteur de jeu a besoin de quoi la **jouer** — ses
   mots-clés tels que Scryfall les nomme, la loyauté d'un planeswalker, ses
   faces séparées, et la force d'une créature dont la force est une formule.
   Ces champs arrivent par trois portes — la réponse de Scryfall, l'archive,
   la sauvegarde — et ce fichier est le seul à les connaître, si bien qu'un
   champ ajouté ici l'est partout d'un coup.

   Tous sont **facultatifs** : une archive d'hier, une sauvegarde d'hier, une
   carte livrée n'en portent aucun, et le compilateur d'oracle retombe alors
   sur la lecture du texte.
   ===================================================================== */

/* Un nombre ou rien : « X », « * » et « 1+* » ne se jouent pas comme un
   nombre, et le moteur doit le savoir plutôt que lire zéro. */
function nombreOuRien(v) {
  return (v != null && /^\d+$/.test(String(v))) ? +v : null;
}

/* Les champs de jeu d'une réponse de Scryfall. Les faces ne sont gardées que
   pour une carte qui en a plusieurs : le texte d'une carte simple les
   contient déjà, et l'archive en compte trente mille. */
function champsJeuScryfall(sc) {
  const faces = sc.card_faces && sc.card_faces.length > 1 ? sc.card_faces : null;
  const f0 = faces ? faces[0] : sc;
  const pw = sc.power != null ? sc.power : f0.power;
  const tg = sc.toughness != null ? sc.toughness : f0.toughness;
  const brut = pw != null && (nombreOuRien(pw) === null || nombreOuRien(tg) === null);
  return {
    motsCles: Array.isArray(sc.keywords) ? sc.keywords.join('|') : '',
    loyaute: nombreOuRien(sc.loyalty != null ? sc.loyalty : f0.loyalty),
    layout: sc.layout && sc.layout !== 'normal' ? sc.layout : '',
    faces: faces ? faces.map(f => [f.name || '', f.mana_cost || '', f.type_line || '',
      (f.oracle_text || '').replace(/\n/g, ' // '),
      f.power != null ? String(f.power) : null, f.toughness != null ? String(f.toughness) : null,
      f.loyalty != null ? String(f.loyalty) : null]) : null,
    ptBrut: brut ? pw + '/' + tg : ''
  };
}

/* Les mêmes champs, dans l'ordre des colonnes que `compacte()` ajoute en fin
   d'enregistrement (`CH.MOTS_CLES` … `CH.PT_BRUT`). */
function colonnesJeu(sc) {
  const j = champsJeuScryfall(sc);
  return [j.motsCles, j.loyaute, j.layout, j.faces, j.ptBrut];
}

/* Les champs de jeu d'un enregistrement de l'archive. Une archive tirée
   avant ces colonnes rend `undefined` partout : `archiveSansJeu` le dit, pour
   que la couverture puisse proposer de la recharger. */
function champsJeuRec(rec) {
  if (rec.length <= CH.MOTS_CLES) return {archiveSansJeu: true};
  return {
    motsCles: rec[CH.MOTS_CLES] || '', loyaute: rec[CH.LOYAUTE] != null ? rec[CH.LOYAUTE] : null,
    layout: rec[CH.LAYOUT] || '', faces: rec[CH.FACES] || null, ptBrut: rec[CH.PT_BRUT] || ''
  };
}

/* Verser des champs de jeu dans une carte, sans effacer ce qu'elle savait
   déjà par une source plus riche. */
function appliqueChampsJeu(card, j) {
  if (!card || !j) return card;
  if (j.motsCles) card.motsCles = j.motsCles;
  if (j.loyaute != null) card.loyaute = j.loyaute;
  if (j.layout) card.layout = j.layout;
  if (j.faces) card.faces = j.faces;
  if (j.ptBrut) card.ptBrut = j.ptBrut;
  return card;
}

/* Ce qu'une carte sauvegardée emporte de ses champs de jeu — rien quand elle
   n'en a pas, pour ne pas alourdir la sauvegarde de clés vides. */
function jeuSnap(c) {
  const o = {};
  if (c.motsCles) o.kw = c.motsCles;
  if (c.loyaute != null) o.ly = c.loyaute;
  if (c.layout) o.lo = c.layout;
  if (c.faces) o.fa = c.faces;
  if (c.ptBrut) o.pb = c.ptBrut;
  return o;
}

/* L'inverse de `jeuSnap()`. */
function jeuRestore(card, o) {
  appliqueChampsJeu(card, {motsCles: o.kw, loyaute: typeof o.ly === 'number' ? o.ly : null,
    layout: o.lo, faces: Array.isArray(o.fa) ? o.fa : null, ptBrut: o.pb});
}
