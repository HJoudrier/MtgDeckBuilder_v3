/* =====================================================================
   js/groupes.js — Grouper et trier les listes de cartes

   Les sections qui montrent des cartes — la collection, le deck, le catalogue
   des suggestions, les recommandations d'EDHREC — rangeaient chacune à sa
   façon, sans que rien ne se règle : la collection offrait un tri et aucun
   groupe, le deck groupait par type en dur, les suggestions aussi. Ce module
   leur donne un vocabulaire commun : une table de regroupements, une table de
   tris, et de quoi les appliquer à n'importe quelle liste d'entrées.

   Une « entrée » est ce que les sections manipulent déjà : un objet portant
   `.card`, et selon la section `.qty` (collection, deck), `.score`
   (suggestions) ou `.edhrec` (les statistiques du commandant). Rien d'autre
   n'est supposé.
   ===================================================================== */

/* ---------------------------------------------------------------------
   Les sous-types, lus sur la ligne de type après le tiret cadratin, face
   par face : « Legendary Creature — Human Wizard » en rend deux, et une
   carte recto-verso rend ceux de ses deux faces. `card.sousTypes` existe
   déjà (js/cartes.js) mais ne coupe qu'au premier tiret et ramasse le
   « // » des cartes à deux faces : il sert à l'analyse, pas à l'affichage.
   --------------------------------------------------------------------- */
function sousTypesCarte(card) {
  const vus = [];
  String((card && card.type) || '').split(' // ').forEach(face => {
    const i = face.indexOf('—');
    if (i < 0) return;
    face.slice(i + 1).split(/\s+/).forEach(mot => {
      const m = mot.trim();
      if (m && vus.indexOf(m) < 0) vus.push(m);
    });
  });
  return vus;
}

/* La couleur d'une carte, ramenée aux sept cases qu'on lit d'un coup d'œil :
   les cinq couleurs, le multicolore, l'incolore. L'identité fait foi — c'est
   elle qui commande en Commander, et c'est elle que les filtres emploient. */
const COULEUR_LABEL = {W:'Blanc', U:'Bleu', B:'Noir', R:'Rouge', G:'Vert', M:'Multicolore', C:'Incolore'};
const COULEUR_ORDRE = ['W', 'U', 'B', 'R', 'G', 'M', 'C'];

/* Le seau de coût, celui de la courbe de mana : au-delà de sept, tout
   ensemble — une carte à onze et une carte à huit se rangent côte à côte. */
function seauCmc(card) {
  const n = Math.max(0, Math.round((card && card.cmc) || 0));
  return String(Math.min(n, 7));
}

const SANS = '—';   // la clé des cartes qu'un regroupement ne sait pas ranger

/* ---------------------------------------------------------------------
   Les regroupements. Chacun dit trois choses : sous quelles clés une carte
   se range (`cles`), comment une clé s'affiche (`libelle`), et dans quel
   ordre les groupes se suivent (`rang`, à défaut l'ordre alphabétique des
   libellés).

   `multiple` marque ceux où une carte compte dans plusieurs groupes — les
   sous-types et les rôles : la somme des groupes dépasse alors le nombre de
   cartes, et les sections l'annoncent plutôt que de laisser compter faux.
   --------------------------------------------------------------------- */
const GROUPES = {
  aucun: {
    label: 'Pas de groupe',
    plat: true,
    cles: () => [''],
    libelle: () => ''
  },
  type: {
    label: 'Type',
    cles: c => [mainType(c)],
    libelle: id => id,
    rang: id => TYPE_ORDER.indexOf(id)
  },
  sousType: {
    label: 'Sous-type',
    multiple: true,
    cles: c => { const s = sousTypesCarte(c); return s.length ? s : [SANS]; },
    libelle: id => id === SANS ? 'Sans sous-type' : id,
    rang: id => id === SANS ? 1 : 0
  },
  couleur: {
    label: 'Couleur',
    cles: c => {
      const id = (c && c.identity) || [];
      if (!id.length) return ['C'];
      return [id.length > 1 ? 'M' : id[0]];
    },
    libelle: id => COULEUR_LABEL[id] || id,
    rang: id => COULEUR_ORDRE.indexOf(id)
  },
  cmc: {
    label: 'Coût de mana',
    cles: c => [seauCmc(c)],
    libelle: id => id === '7' ? 'Coût 7 et plus' : `Coût ${id}`,
    rang: id => parseInt(id, 10)
  },
  role: {
    label: 'Rôle',
    multiple: true,
    cles: c => { const r = [...((c && c.cats) || [])]; return r.length ? r : [SANS]; },
    libelle: id => id === SANS ? 'Sans rôle' : (CATLABEL[id] || id),
    rang: id => id === SANS ? 99 : Object.keys(CATLABEL).indexOf(id)
  },
  set: {
    label: 'Édition',
    cles: c => [c && c.set ? String(c.set).toUpperCase() : SANS],
    /* Le nom complet de l'édition n'est connu que si Scryfall l'a rapporté ;
       la première carte du groupe qui le porte le donne pour tout le groupe. */
    libelle: (id, entrees) => {
      if (id === SANS) return 'Édition inconnue';
      const nomme = (entrees || []).find(e => e.card.setName);
      return nomme ? `${nomme.card.setName} (${id})` : id;
    },
    rang: id => id === SANS ? 1 : 0
  }
};

/* ---------------------------------------------------------------------
   Les tris, appliqués à l'intérieur de chaque groupe. Le nom départage
   partout : deux cartes de même coût ou de même prix gardent ainsi un ordre
   stable d'un rendu à l'autre.
   --------------------------------------------------------------------- */
/* Le taux qu'EDHREC donne à une carte : sa part dans les decks recensés du
   commandant (`inclusion`), ou l'écart avec les autres decks de la même
   identité couleur (`synergy`). Une carte sans statistique — il y en a dans
   toute autre section que l'onglet EDHREC — prend une valeur sentinelle
   commune : elle se range en fin de groupe, et deux d'entre elles se
   départagent par le nom, comme partout ailleurs. */
const SANS_EDHREC = -999;

function tauxEdhrec(e, champ) {
  const r = e && e.edhrec;
  return r && typeof r[champ] === 'number' ? r[champ] : SANS_EDHREC;
}

const TRIS = {
  alpha: {label:'Nom (A→Z)', cmp: (a, b) => a.card.name.localeCompare(b.card.name)},
  cmc:   {label:'Coût de mana', cmp: (a, b) => (a.card.cmc || 0) - (b.card.cmc || 0) || a.card.name.localeCompare(b.card.name)},
  price: {label:'Prix (décroissant)', cmp: (a, b) => (b.card.price || 0) - (a.card.price || 0) || a.card.name.localeCompare(b.card.name)},
  qty:   {label:'Quantité', cmp: (a, b) => (b.qty || 0) - (a.qty || 0) || a.card.name.localeCompare(b.card.name)},
  type:  {label:'Type', cmp: (a, b) => TYPE_ORDER.indexOf(mainType(a.card)) - TYPE_ORDER.indexOf(mainType(b.card))
           || (a.card.cmc || 0) - (b.card.cmc || 0) || a.card.name.localeCompare(b.card.name)},
  score: {label:'Score', cmp: (a, b) => scoreEntree(b) - scoreEntree(a) || a.card.name.localeCompare(b.card.name)},
  inclusion: {label:"Taux d'inclusion EDHREC",
    cmp: (a, b) => tauxEdhrec(b, 'inclusion') - tauxEdhrec(a, 'inclusion') || a.card.name.localeCompare(b.card.name)},
  synergie:  {label:'Synergie EDHREC',
    cmp: (a, b) => tauxEdhrec(b, 'synergy') - tauxEdhrec(a, 'synergy') || a.card.name.localeCompare(b.card.name)}
};

/* Les tris proposés par chaque section : la quantité n'a pas de sens pour une
   suggestion, qui n'est encore nulle part, et les deux taux d'EDHREC n'en ont
   que là où toute carte en porte — l'onglet EDHREC. Ils y viennent en tête :
   c'est pour eux qu'on ouvre cette page. */
const TRIS_SECTION = {
  collection: ['cmc', 'alpha', 'price', 'type', 'qty', 'score'],
  deck:       ['type', 'cmc', 'alpha', 'price', 'qty', 'score'],
  suggestions:['score', 'cmc', 'alpha', 'price', 'type'],
  edhrec:     ['inclusion', 'synergie', 'score', 'cmc', 'alpha', 'price', 'type']
};

/* ---------------------------------------------------------------------
   Le score d'une entrée, là où il se trouve : porté par la suggestion
   elle-même, relevé par la notation du deck (`NOTES_DECK`, js/deck.js), ou
   calculé pour la collection par `notesCollection()` ci-dessous. Une carte
   sans note vaut zéro : elle se range en fin de groupe, non au milieu.
   --------------------------------------------------------------------- */
function scoreEntree(e) {
  if (typeof e.score === 'number') return e.score;
  const nom = e.card.name;
  const dansDeck = (typeof NOTES_DECK !== 'undefined') && NOTES_DECK.get(nom);
  if (dansDeck) return dansDeck.score;
  const dansColl = NOTES_COLLECTION.notes && NOTES_COLLECTION.notes.get(nom);
  return dansColl ? dansColl.score : 0;
}

/* ---------------------------------------------------------------------
   Les notes de la collection. Le deck note ses cent cartes à chaque rendu
   sans qu'on le sente ; la collection en compte des milliers, et les noter
   à chaque rendu se paierait à chaque clic. Elles ne sont donc calculées
   qu'à la demande — quand le tri par score est choisi — et mémorisées sous
   l'empreinte des suggestions : ce qui périme leur sélection périme ces
   notes, et rien d'autre ne les refait.
   --------------------------------------------------------------------- */
const NOTES_COLLECTION = {sig:null, notes:null};

function notesCollectionAJour() {
  return !!NOTES_COLLECTION.notes && NOTES_COLLECTION.sig === signatureSuggestions();
}

function notesCollection(entrees) {
  if (notesCollectionAJour()) return NOTES_COLLECTION.notes;
  const X = contexteEvaluation();
  const notes = new Map();
  entrees.forEach(e => {
    const n = noteCarte({card:e.card, source:'collection'}, X);
    if (n) notes.set(e.card.name, n);
  });
  NOTES_COLLECTION.sig = signatureSuggestions();
  NOTES_COLLECTION.notes = notes;
  return notes;
}

/* ---------------------------------------------------------------------
   Le geste central : ranger une liste d'entrées en groupes ordonnés, chacun
   trié. Rend `[{id, libelle, entrees, total}]` ; `total` est le nombre
   d'entrées du groupe avant toute pagination, que les sections lui
   appliquent ensuite.
   --------------------------------------------------------------------- */
/* `triId` valant `null`, l'ordre reçu est gardé tel quel : c'est ce dont les
   suggestions ont besoin pour leur ordre gelé, qui n'est celui d'aucun tri. */
function groupeCartes(entrees, modeId, triId) {
  const mode = GROUPES[modeId] || GROUPES.aucun;
  const cmp = triId === null ? null : (TRIS[triId] || TRIS.alpha).cmp;
  const par = new Map();
  entrees.forEach(e => {
    mode.cles(e.card).forEach(id => {
      const cle = String(id);
      if (!par.has(cle)) par.set(cle, []);
      par.get(cle).push(e);
    });
  });
  const groupes = [...par.entries()].map(([id, items]) => {
    if (cmp) items.sort(cmp);
    return {id, libelle: mode.libelle(id, items), entrees: items, total: items.length};
  });
  groupes.sort((a, b) => {
    const r = mode.rang ? (mode.rang(a.id) - mode.rang(b.id)) : 0;
    return r || a.libelle.localeCompare(b.libelle);
  });
  return groupes;
}

/* ---------------------------------------------------------------------
   Le pli d'une catégorie. La clé réunit la section, le mode de groupement et
   l'identifiant du groupe : replier « Créature » dans le deck ne replie pas
   la « Créature » de la collection, et changer de groupement laisse les plis
   de l'autre mode en place — y revenir les retrouve. Une catégorie jamais
   repliée n'est pas dans l'ensemble : une catégorie nouvelle s'ouvre.
   --------------------------------------------------------------------- */
function clePli(section, modeId, id) {
  return `${section}|${modeId}|${id}`;
}

function groupePlie(section, modeId, id) {
  return S.groupesPlies.has(clePli(section, modeId, id));
}

/* L'identifiant que le bouton commande, tiré d'un compteur de rendu : un
   libellé de sous-type ou d'édition n'a pas à être un identifiant HTML. */
let COMPTEUR_GROUPE = 0;

/* Une catégorie, repliable, sur le patron des parties de la section Deck
   (`partieDeck`, js/deck.js) : mêmes classes, même chevron, même geste. Le
   corps est rendu par la section, qui seule sait ce qu'elle y met. */
function enveloppeGroupe(section, modeId, g, titre, badge, corps) {
  const cle = clePli(section, modeId, g.id);
  const ouverte = !S.groupesPlies.has(cle);
  const idDom = `grp-${section}-${++COMPTEUR_GROUPE}`;
  return `<div class="group partie ${ouverte ? 'ouverte' : ''}">
    <button type="button" class="partie-tete" data-act="plierGroupe"
        data-section="${section}" data-cle="${esc(cle)}"
        aria-expanded="${ouverte}" aria-controls="${idDom}"
        title="${ouverte ? 'Replier cette catégorie' : 'Déplier cette catégorie'}">
      <span class="chev-partie" aria-hidden="true">›</span>
      <h4>${esc(titre)}</h4>
      <span class="small muted">${badge}</span>
    </button>
    <div class="partie-corps" id="${idDom}">${corps}</div>
  </div>`;
}

/* ---------------------------------------------------------------------
   Le rendu commun : un titre par groupe, le contenu rendu par la section
   elle-même — la collection et le deck posent des tuiles ou des lignes, les
   suggestions leurs vignettes. Sans groupe, il n'y a pas de titre du tout :
   la liste est rendue telle quelle, et rien ne se replie.
   --------------------------------------------------------------------- */
function rendGroupes(section, groupes, modeId, rendEntrees, compte) {
  if ((GROUPES[modeId] || GROUPES.aucun).plat)
    return rendEntrees(groupes.length ? groupes[0].entrees : []);
  return groupes.map(g => {
    const n = g.entrees.length;
    /* Une catégorie que la section n'a pas rendue — repliée, la collection ne
       lui donne aucune place dans sa page — annonce son total entier plutôt
       qu'un « 0 sur 59 » qui la dirait vide. */
    const badge = compte ? compte(g)
      : (!n && g.total ? `${g.total}` : n < g.total ? `${n} sur ${g.total}` : `${n}`);
    return enveloppeGroupe(section, modeId, g, g.libelle, badge, rendEntrees(g.entrees, g));
  }).join('');
}

/* Un regroupement où une carte compte plusieurs fois le dit, sans quoi la
   somme des en-têtes contredirait le total affiché juste au-dessus. */
function noteMultiple(modeId) {
  const mode = GROUPES[modeId];
  if (!mode || !mode.multiple) return '';
  return modeId === 'sousType'
    ? ' · une carte figure dans chacun de ses sous-types, la somme des groupes dépasse donc le total'
    : ' · une carte figure dans chacun de ses rôles, la somme des groupes dépasse donc le total';
}

/* ---------------------------------------------------------------------
   Les deux menus, identiques dans les trois sections. Ils portent la
   section en attribut : c'est elle qui dit quel réglage change, chacune
   gardant le sien.
   --------------------------------------------------------------------- */
function barreGroupeTri(section) {
  const g = (S.groupes && S.groupes[section]) || 'aucun';
  const t = (S.tris && S.tris[section]) || 'alpha';
  const tris = TRIS_SECTION[section] || Object.keys(TRIS);
  return `<select data-groupe="${section}" title="Ranger les cartes par catégorie">
      ${Object.keys(GROUPES).map(k =>
        `<option value="${k}" ${g === k ? 'selected' : ''}>Grouper : ${GROUPES[k].label}</option>`).join('')}
    </select>
    <select data-tri="${section}" title="Ordonner les cartes à l'intérieur de chaque groupe">
      ${tris.map(k =>
        `<option value="${k}" ${t === k ? 'selected' : ''}>Trier : ${TRIS[k].label}</option>`).join('')}
    </select>`;
}
