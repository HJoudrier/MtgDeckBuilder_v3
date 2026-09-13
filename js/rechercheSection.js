/* =====================================================================
   js/rechercheSection.js — Le champ de recherche d'une section

   Un bouton « Ajouter » ouvrait une fenêtre pour chercher une carte, puis la
   posait dans la liste : trois gestes et un aller-retour modal pour ajouter un
   exemplaire. Le champ vit désormais dans la section même, sous sa barre. On
   tape, les cartes se proposent ; le nom survolé montre son visuel comme
   partout ailleurs, le clic en ajoute un exemplaire, et le compteur de droite
   dit combien on en a déjà — dans la liste qu'on remplit, et dans l'autre.

   Ce compteur se fait défiler : les deux boutons, ou la molette de la souris
   au-dessus de lui, ajoutent et retirent un exemplaire sans quitter la liste
   des propositions. C'est ce qui remplace le champ « Exemplaires » de la
   fenêtre d'avant : on voit ce qu'on a pendant qu'on l'ajuste.

   La fenêtre demeure pour les deux listes annexes (`js/fenAjout.js`), qui n'ont
   pas de barre à elles.
   ===================================================================== */

/* Ce que la recherche d'une liste retient entre deux rendus. La section
   entière est réécrite à chaque ajout — `renderB()`, `renderE()` — et le champ
   y perdrait sa frappe et le curseur : ils sont donc gardés ici et rendus
   après coup (`restaureRecherche`). `focus` ne vaut que le temps d'un geste,
   pour ne pas voler le curseur à un rendu venu d'ailleurs. */
const RECHERCHE = {
  collection: {q:'', focus:false},
  deck:       {q:'', focus:false}
};

function etatRecherche(cible) {
  return RECHERCHE[cible] || RECHERCHE.collection;
}

/* Combien d'exemplaires une liste porte déjà. */
function compteListe(cible, nom) {
  return (cible === 'deck' ? S.deck.get(nom) : S.collection.get(nom)) || 0;
}

/* Le champ et ses propositions, posés sous la barre de la section. */
function champRecherche(cible) {
  const q = etatRecherche(cible).q;
  const ou = cible === 'deck' ? 'au deck' : 'à la collection';
  return `<div class="rech">
    <input type="search" id="rech-${cible}" class="rech-champ" data-rech="${cible}" value="${esc(q)}"
      placeholder="Chercher une carte à ajouter ${ou}…" autocomplete="off"
      aria-label="Chercher une carte à ajouter ${ou}">
    <div id="rech-res-${cible}">${propositionsHTML(cible)}</div>
  </div>`;
}

/* Une proposition : le nom — survolé, il montre son visuel —, ce qu'en dit
   l'autre liste, et le compteur qu'on fait défiler. Le nom entier est un
   bouton : cliquer n'importe où sur la ligne ajoute un exemplaire. */
function ligneProposition(c, cible) {
  const n = compteListe(cible, c.name);
  const autre = cible === 'deck' ? 'collection' : 'deck';
  const nAutre = compteListe(autre, c.name);
  const ou = cible === 'deck' ? 'au deck' : 'à la collection';
  const commun = `data-name="${esc(c.name)}" data-cible="${cible}"`;
  return `<div class="lrow rech-l">
    <button type="button" class="rech-n" data-act="rechPas" data-pas="1" ${commun}
        data-card-name="${esc(c.name)}" title="Ajouter un exemplaire ${ou}">
      <span class="cname">${esc(c.name)}</span>
      <span class="costs">${manaHTML(c, true)}</span>
      <span class="small muted rech-t">${esc(c.type)}</span>
    </button>
    ${nAutre ? `<span class="small muted rech-autre">${nAutre} ${autre === 'deck' ? 'au deck' : 'en collection'}</span>` : ''}
    <div class="rech-cpt" data-molette ${commun}
        title="Exemplaires ${ou} — les deux boutons, ou la molette au-dessus du compteur, les font défiler">
      <button type="button" class="btn sm" data-act="rechPas" data-pas="-1" ${commun}
        ${n ? '' : 'disabled'} aria-label="Retirer un exemplaire">−</button>
      <span class="mono rech-n-val ${n ? '' : 'muted'}">${n}</span>
      <button type="button" class="btn sm" data-act="rechPas" data-pas="1" ${commun}
        aria-label="Ajouter un exemplaire">+</button>
    </div>
  </div>`;
}

/* Une carte que Scryfall connaît et que le catalogue n'a pas : elle n'existe
   pas encore dans l'atelier, il n'y a donc rien à compter — seul l'ajout a du
   sens, et c'est lui qui l'inscrit. */
function ligneEnLigne(nom, cible) {
  return `<div class="lrow rech-l">
    <button type="button" class="rech-n" data-act="addScry" data-name="${esc(nom)}" data-cible="${cible}"
        data-card-name="${esc(nom)}" title="Ajouter cette carte, inconnue de votre catalogue">
      <span class="cname">${esc(nom)}</span>
      <span class="small muted rech-t">trouvée sur Scryfall</span>
    </button>
    <div class="rech-cpt"><button type="button" class="btn sm" data-act="addScry"
      data-name="${esc(nom)}" data-cible="${cible}" aria-label="Ajouter un exemplaire">+</button></div>
  </div>`;
}

function propositionsHTML(cible) {
  const q = etatRecherche(cible).q;
  if (norm(q).length < 2) return '';
  const res = chercheCartes(q);
  const cols = [...S.colors].join('') || 'aucune';
  /* Les propositions sont filtrées comme le reste de l'atelier : une carte
     hors des couleurs retenues ne serait de toute façon pas affichée une fois
     ajoutée, et la phrase le dit plutôt que de laisser croire à une absence. */
  const enLigne = [...scryRes.values()]
    .filter(sc => { const c = find(sc.name); return !c || c.unknown; })
    .slice(0, 6);
  const etat = scryEtat === 'chargement' ? ' · recherche sur Scryfall…'
    : scryEtat === 'hors-ligne' ? ' · Scryfall injoignable' : '';
  if (!res.length && !enLigne.length)
    return `<div class="small muted rech-vide">Aucune carte ne correspond dans les couleurs ${esc(cols)}${esc(etat)}.
      Élargissez la barre de mana ou les filtres.</div>`;
  return `<div class="list rech-liste">
      ${res.map(c => ligneProposition(c, cible)).join('')}
      ${enLigne.map(sc => ligneEnLigne(sc.name, cible)).join('')}
    </div>
    <div class="small muted rech-pied">${res.length} proposition(s) · couleurs ${esc(cols)}${esc(etat)}
      · cliquez un nom pour en ajouter un exemplaire</div>`;
}

/* Seules les propositions sont réécrites pendant la frappe : réécrire la
   section volerait le curseur du champ qu'on est en train de remplir. */
function majPropositions(cible) {
  const z = document.getElementById(`rech-res-${cible}`);
  if (z) z.innerHTML = propositionsHTML(cible);
}

/* La frappe. Scryfall n'est interrogé qu'après une pause et seulement si le
   catalogue local n'a rien : c'est le même délai que la fenêtre d'ajout. */
function saisieRecherche(cible, valeur) {
  const e = etatRecherche(cible);
  e.q = valeur;
  e.focus = true;
  majPropositions(cible);
  clearTimeout(scryTimer);
  if (norm(valeur).length < 3) { scryRes = new Map(); scryEtat = ''; return; }
  scryTimer = setTimeout(() => chercheScryfall(valeur, cible), 350);
}

/* Un exemplaire de plus ou de moins, d'où que vienne le geste : le clic sur un
   nom, les deux boutons du compteur, ou la molette au-dessus de lui. Les
   fonctions appelées sont celles des vignettes — même limite de format, même
   recalcul annoncé, même message. */
function pasRecherche(nom, cible, pas) {
  const e = etatRecherche(cible);
  e.focus = true;
  if (cible === 'deck') {
    if (pas > 0) addToDeck(nom); else if (S.deck.get(nom)) removeFromDeck(nom);
    return;
  }
  if (pas > 0) ajoutCollection(nom); else retraitCollection(nom);
}

/* La molette au-dessus d'un compteur. Un tour de molette lance une dizaine
   d'évènements : sans ce garde-fou, un seul geste ajouterait dix exemplaires et
   demanderait dix recalculs. */
let derniereMolette = 0;

function molletteRecherche(el, deltaY) {
  const t = Date.now();
  if (t - derniereMolette < 120) return;
  derniereMolette = t;
  pasRecherche(el.dataset.name, el.dataset.cible, deltaY < 0 ? 1 : -1);
}

/* La section a été réécrite : le champ retrouve sa frappe et, si le geste
   venait de lui, le curseur. On ne le reprend que si plus rien ne l'a — un
   rendu déclenché ailleurs ne doit pas arracher le curseur à autre chose. */
function restaureRecherche(cible) {
  const e = etatRecherche(cible);
  const champ = document.getElementById(`rech-${cible}`);
  if (!champ) return;
  if (champ.value !== e.q) champ.value = e.q;
  if (!e.focus) return;
  const actif = document.activeElement;
  if (actif && actif !== document.body && actif !== champ) return;
  champ.focus();
  const n = champ.value.length;
  try { champ.setSelectionRange(n, n); } catch (err) {}
}
