/* =====================================================================
   js/restrictions.js — La restriction d'un deck

   Un filtre que le deck porte lui-même : « dans celui-ci, du mono-rouge sous
   trois euros ». Il a la forme des filtres de l'en-tête — `FILTRES_VIDE` —
   plus les couleurs, que l'en-tête garde de son côté.

   Il ne s'efface pas depuis les puces : sa puce porte un cadenas et mène à la
   configuration du deck. C'est structurel, non décoratif — `filtresActifs()`
   rend les clés à effacer, `restrictionsActives()` n'en rend aucune.

   Il porte partout où porte un filtre, sauf sur la liste du deck lui-même :
   une restriction « coût ≤ 3 » masquerait sinon le commandant qu'elle est
   censée servir. Les cartes du deck qui l'enfreignent sont signalées par
   `legality()`, comme l'est déjà une carte illégale.
   ===================================================================== */

/* La restriction du deck ouvert. Toujours un objet : un dossier d'hier qui
   n'en porte pas se lit comme un dossier sans restriction. */
function restrictionsDuDeck() {
  const d = deckCourant();
  if (!d.restrictions) d.restrictions = {...FILTRES_VIDE, couleurs:'', modeCouleurs:'identity', suitCommandant:false};
  return d.restrictions;
}

/* Les couleurs que la restriction impose, ou `null` si elle n'en impose
   aucune. Quand elle suit le commandant, elles se déduisent de lui à chaque
   lecture plutôt que d'être recopiées : un commandant qu'on change n'a alors
   aucune mise à jour à déclencher, et rien ne peut se désaccorder. */
function couleursRestriction(r) {
  const rest = r || restrictionsDuDeck();
  if (rest.suitCommandant) {
    const cmd = S.commander ? find(S.commander) : null;
    if (!cmd) return null;
    const sel = new Set(cmd.identity || []);
    if (!sel.size) sel.add('C');
    return sel;
  }
  const lettres = String(rest.couleurs || '').split('').filter(c => 'WUBRGC'.includes(c));
  return lettres.length ? new Set(lettres) : null;
}

function couleursRestrictionOK(card) {
  const sel = couleursRestriction();
  if (!sel) return true;
  return couleursOK(card, sel, restrictionsDuDeck().modeCouleurs || 'identity');
}

/* Le prédicat, sur une carte bâtie. Les rôles demandent l'analyse du texte :
   ils ne valent donc que de ce côté-ci, comme pour les filtres. */
function restrictionOK(card) {
  if (!card) return false;
  const rest = restrictionsDuDeck();
  return couleursRestrictionOK(card)
      && roleOK(card, rest)
      && filtresValeursOK(valeursCarte(card), rest);
}

/* Le même, sur un enregistrement brut du catalogue : c'est ce qui évite de
   bâtir des dizaines de milliers de cartes pour les écarter ensuite. */
function restrictionOKRec(rec) {
  if (!rec) return false;
  const rest = restrictionsDuDeck();
  const sel = couleursRestriction(rest);
  if (sel) {
    const id = rec[CH.ID_COUL] ? String(rec[CH.ID_COUL]).split('') : [];
    if (!couleursOK({identity:id}, sel, rest.modeCouleurs || 'identity')) return false;
  }
  return filtresValeursOK(valeursRec(rec), rest);
}

/* Y a-t-il quoi que ce soit à restreindre ? Sert à ne pas parcourir le deck
   pour rien, et à ne pas afficher une rangée de puces vide. */
function restrictionPosee() {
  return restrictionsActives().length > 0;
}

/* Les restrictions en vigueur, sous la même forme que `filtresActifs()` mais
   **sans clés** : c'est l'absence de `cles` qui fait qu'aucune croix n'est
   dessinée, et non une exception dans le rendu de l'en-tête. */
function restrictionsActives() {
  const rest = restrictionsDuDeck();
  const actives = [];
  const sel = couleursRestriction(rest);
  if (sel) {
    const mode = rest.modeCouleurs === 'atleast' ? 'au moins une de '
               : rest.modeCouleurs === 'exact' ? 'exactement ' : '';
    actives.push({texte: `Couleurs : ${mode}${nomCombinaisonCouleurs(sel)}`
                       + (rest.suitCommandant ? ' (du commandant)' : '')});
  }
  filtresActifs(rest).forEach(a => actives.push({texte:a.texte}));
  return actives;
}

function texteRestrictionsActives(sep) {
  return restrictionsActives().map(a => a.texte).join(sep || ' · ');
}

/* Les cartes du deck que sa propre restriction écarterait. La liste du deck
   ne les masque pas — elles doivent rester retirables — donc c'est
   `legality()` qui les dit. */
function cartesHorsRestriction() {
  if (!restrictionPosee()) return [];
  return deckEntries().filter(e => !restrictionOK(e.card));
}

/* Un deck neuf peut hériter de l'identité couleur de son commandant sans
   qu'on ait à cocher six cases : c'est le geste de la fenêtre de
   configuration, et le seul endroit où la restriction s'écrit toute seule. */
function poseCouleursCommandant(rest) {
  const cmd = S.commander ? find(S.commander) : null;
  rest.couleurs = cmd ? ((cmd.identity || []).join('') || 'C') : '';
  rest.suitCommandant = false;
}

/* Rien ne s'y écrit hors de la fenêtre de configuration, mais le garde-fou
   est le même que celui de `majFiltre()` : une clé inconnue ne doit pas
   s'installer en silence dans le dossier. */
const RESTRICTION_CHAMPS = {...FILTRES_VIDE, couleurs:'', modeCouleurs:'', suitCommandant:false};

function majRestriction(cle, valeur) {
  if (cle in RESTRICTION_CHAMPS) restrictionsDuDeck()[cle] = valeur;
}

function reinitRestrictions() {
  deckCourant().restrictions = {...FILTRES_VIDE, couleurs:'', modeCouleurs:'identity', suitCommandant:false};
}
