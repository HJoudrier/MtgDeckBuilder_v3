/* =====================================================================
   js/decks.js — Les decks, et celui sur lequel on travaille

   Un deck n'est plus une liste posée dans `S` mais un dossier : son nom, son
   format, ses trois listes, son commandant, son budget, ses restrictions et
   ses objectifs par rôle. `S.decks` les tient tous, `S.deckActif` dit lequel
   est ouvert.

   Les champs que l'atelier lisait dans `S` — `S.deck`, `S.commander`,
   `S.format`, `S.budget` — y sont lus ou écrits dans cent cinquante endroits.
   Aucun n'est repris : ces champs quittent le littéral de `js/etat.js` et
   deviennent des propriétés d'accès qui lisent et écrivent dans le dossier
   ouvert. `S.deck` reste `S.deck` partout, et ce fichier est le seul à savoir
   qu'il y en a plusieurs.

   Le recopiage — ranger le dossier dans `S` à chaque bascule — aurait laissé
   exister des instants où le rangé et l'affiché divergent, et un oubli de
   rangement avant une sauvegarde ou une synchronisation aurait perdu un
   commandant en silence. Une vue ne se désynchronise pas.
   ===================================================================== */

/* Où en est un deck. C'est du suivi, non une règle : rien n'en dépend que
   l'affichage et le rangement de la page « Decks ». Un deck archivé ne
   disparaît pas de la liste d'achats — on le range, on ne l'oublie pas. */
const DECK_STATUTS = {
  idee:         {label:'Idée',            aide:"Une intention, pas encore une liste."},
  construction: {label:'En construction', aide:'Le deck se monte : des cartes entrent, des cartes sortent.'},
  abouti:       {label:'Abouti',          aide:'La liste tient ; on n’y touche plus que pour l’affiner.'},
  archive:      {label:'Archivé',         aide:'Rangé de côté, gardé pour mémoire.'}
};

/* Les huit champs du dossier que `S` montre sous leur ancien nom. `deck`,
   `sideboard` et `considering` gardent le leur : `annexes.js` les atteint par
   `S[cle]` depuis `CLES_ANNEXES`, et les renommer ici demanderait une table de
   traduction pour rien. */
const CHAMPS_DECK = ['deck', 'sideboard', 'considering', 'commander', 'format',
                     'secondairesOff', 'budget', 'ciblesRoles'];

/* Une clé tirée au sort plutôt qu'un compteur : deux appareils qui créent
   chacun un deck hors ligne ne doivent pas se réclamer la même, sans quoi la
   synchronisation fusionnerait deux decks étrangers l'un à l'autre. */
function cleDeckNeuve() {
  return 'd-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 6);
}

/* Un dossier neuf, ou la copie d'un dossier existant quand `modele` est
   donné. Les Map et Set sont refaits, jamais partagés : deux decks issus
   d'une duplication doivent pouvoir diverger. */
function deckNeuf(nom, modele) {
  const m = modele || {};
  return {
    nom: nom || 'Deck',
    format: FORMATS[m.format] ? m.format : 'edh',
    statut: DECK_STATUTS[m.statut] ? m.statut : 'construction',
    deck:        new Map(m.deck || []),
    sideboard:   new Map(m.sideboard || []),
    considering: new Map(m.considering || []),
    commander:   m.commander || null,
    secondairesOff: new Set(m.secondairesOff || []),
    budget: {total:0, perCard:5, ...(m.budget || {})},
    /* Par défaut, un deck veut ses propres exemplaires : c'est la lecture
       juste de decks montés en même temps, et la liste d'achats dit alors
       vraiment ce qu'il faut acheter. */
    exemplairesPropres: m.exemplairesPropres !== false,
    restrictions: {...FILTRES_VIDE, couleurs:'', modeCouleurs:'identity',
                   suitCommandant:false, ...(m.restrictions || {})},
    ciblesRoles: JSON.parse(JSON.stringify(m.ciblesRoles || {})),
    cree: m.cree || Date.now(),
    maj: Date.now()
  };
}

/* Les decks dans l'ordre où ils ont été créés : un deck ne doit pas changer
   de place dans la liste parce qu'on y a touché. */
function clesDecks() {
  return Object.keys(S.decks).sort((a, b) => (S.decks[a].cree || 0) - (S.decks[b].cree || 0));
}

/* Le dossier ouvert. Il en existe toujours un : une sauvegarde abîmée, une
   suppression mal menée ou un tout premier lancement en trouvent un ou en
   font un, plutôt que de rendre `undefined` à cent cinquante lecteurs. */
function deckCourant() {
  let d = S.decks[S.deckActif];
  if (!d) {
    const cles = clesDecks();
    if (cles.length) S.deckActif = cles[0];
    else {
      const cle = cleDeckNeuve();
      S.decks[cle] = deckNeuf('Mon deck');
      S.deckActif = cle;
    }
    d = S.decks[S.deckActif];
  }
  return d;
}

/* La vue elle-même. Le lecteur rend la référence rangée et jamais une copie :
   `S.deck.set(...)` doit écrire dans le dossier, non dans un double. */
CHAMPS_DECK.forEach(champ => Object.defineProperty(S, champ, {
  enumerable: true, configurable: true,
  get() { return deckCourant()[champ]; },
  set(v) { deckCourant()[champ] = v; }
}));

/* Un nom libre : « Deck », puis « Deck 2 ». Deux decks du même nom seraient
   indiscernables dans la pastille comme dans la liste d'achats. */
function nomDeckLibre(base) {
  const pris = new Set(Object.values(S.decks).map(d => String(d.nom || '').trim().toLowerCase()));
  const racine = String(base || 'Deck').trim() || 'Deck';
  if (!pris.has(racine.toLowerCase())) return racine;
  for (let n = 2; ; n++) {
    const essai = `${racine} ${n}`;
    if (!pris.has(essai.toLowerCase())) return essai;
  }
}

function creerDeck(nom, modele) {
  const cle = cleDeckNeuve();
  S.decks[cle] = deckNeuf(nomDeckLibre(nom), modele);
  return cle;
}

/* Changer de deck, c'est changer tout ce que l'atelier propose : les
   candidates du catalogue, la notation, les listes. Le même enchaînement que
   `apresReglage()` (js/brouillon.js), pour la même raison. */
function activerDeck(cle) {
  if (!S.decks[cle] || cle === S.deckActif) return false;
  S.deckActif = cle;
  if (typeof degeleSuggestions === 'function') degeleSuggestions();
  invaliderCandidats();
  invaliderAchats();
  recalculerAvecProgression(`Vous travaillez maintenant sur « ${S.decks[cle].nom} » : les cartes retenues et les suggestions sont recalculées.`);
  renderAll();
  return true;
}

function renommerDeck(cle, nom) {
  const d = S.decks[cle];
  if (!d) return false;
  const propre = String(nom || '').trim();
  if (!propre) return false;
  if (propre.toLowerCase() !== String(d.nom).toLowerCase()) d.nom = nomDeckLibre(propre);
  else d.nom = propre;
  d.maj = Date.now();
  return true;
}

function dupliquerDeck(cle) {
  const d = S.decks[cle];
  if (!d) return null;
  /* `cree` n'est pas repris : la copie est neuve, et se range à la fin. */
  const {cree, ...reste} = d;
  return creerDeck(`${d.nom} (copie)`, reste);
}

/* Le dernier deck ne se supprime pas : l'atelier n'a pas d'état sans deck
   ouvert, et « supprimer » vaudrait « vider », qui a son propre bouton. */
function supprimerDeck(cle) {
  if (!S.decks[cle] || clesDecks().length <= 1) return false;
  const etaitActif = cle === S.deckActif;
  delete S.decks[cle];
  if (etaitActif) S.deckActif = clesDecks()[0];
  if (typeof degeleSuggestions === 'function') degeleSuggestions();
  invaliderCandidats();
  invaliderAchats();
  return true;
}

/* Une carte tenue par l'un quelconque des decks — liste, réserve ou étude.
   La sauvegarde s'en sert pour ne pas jeter, avec le vivier d'exploration,
   une carte que seul un deck autre que celui ouvert porte. */
function carteDansUnDeck(nom) {
  return Object.values(S.decks).some(d =>
    d.deck.has(nom) || CLES_ANNEXES.some(k => d[k].has(nom)));
}

/* Ce qu'un deck pèse, pour les vignettes de la page « Decks » et la pastille
   de l'en-tête. Compté sur le dossier demandé et non sur `S`, afin que la
   page montre les huit decks sans avoir à basculer sur chacun. */
function bilanDeck(cle) {
  const d = S.decks[cle];
  if (!d) return null;
  const f = FORMATS[d.format] || FORMATS.edh;
  let cartes = 0, possede = 0, manque = 0;
  d.deck.forEach((q, nom) => {
    cartes += q;
    const p = Math.min(q, quantiteCollection(nom));
    possede += p;
    manque += q - p;
  });
  return {
    cle, deck:d, format:f, cartes, possede, manque,
    annexes: CLES_ANNEXES.reduce((n, k) => n + [...d[k].values()].reduce((a, b) => a + b, 0), 0)
  };
}
