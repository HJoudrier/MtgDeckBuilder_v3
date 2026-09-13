/* =====================================================================
   js/achats.js — Ce qu'il reste à acheter

   Le panier d'un deck, et la liste d'achats de tous les decks à la fois.
   Les deux vivaient dans `js/outils.js` — « échapper, formater un prix,
   souffler un mot » — où ils n'avaient jamais eu leur place.

   Deux comptes distincts, et il faut s'en tenir à la distinction : le panier
   d'un deck dit ce qui manque **à ce deck** pris seul, ce qu'affichent sa
   jauge de budget et sa pastille rouge ; la liste d'achats dit ce qu'il faut
   acheter **en tout**, ce qui n'est pas la somme des paniers dès que deux
   decks réclament la même carte.
   ===================================================================== */

/* Ce que la collection porte d'une carte. Le nom du deck et celui de la
   collection peuvent différer — un import a pu nommer la carte autrement —
   et `find()` les ramène au même objet : sans ce détour, une carte possédée
   passait pour manquante et se retrouvait dans la liste d'achats. */
function quantiteCollection(nom) {
  const direct = S.collection.get(nom) || 0;
  if (direct) return direct;
  const c = find(nom);
  return (c && c.name !== nom && S.collection.get(c.name)) || 0;
}

/* Le nom sous lequel une carte se compte, quel que soit celui par lequel on
   y arrive : sans quoi deux decks qui l'orthographient différemment
   demanderaient deux lignes d'achat pour une seule carte. */
function nomCanonique(nom) {
  const c = find(nom);
  return c ? c.name : nom;
}

/* Le panier d'un deck : ce qui lui manque, à lui seul. Sans argument, le deck
   ouvert — c'est ainsi que l'appellent la jauge des achats, la pastille de la
   section Deck et la fenêtre des wants. */
function aAcheter(cle) {
  const d = (cle && S.decks[cle]) || deckCourant();
  const lignes = [];
  d.deck.forEach((q, nom) => {
    const c = find(nom); if (!c) return;
    const manque = Math.max(0, q - quantiteCollection(nom));
    if (!manque) return;
    const o = bestOffer(c);
    /* Le repli sur le prix de tendance chiffre même ce que le plafond par
       carte rejette : un deck peut porter une carte hors budget, et le panier
       doit le dire plutôt que de l'oublier. */
    const pu = o ? o.price : (c.price || 0);
    lignes.push({card:c, qty:manque, unit:pu, total:pu * manque, inconnu:!pu, offer:o});
  });
  return lignes.sort((a, b) => b.total - a.total);
}

function spent(cle) {
  return aAcheter(cle).reduce((t, l) => t + l.total, 0);
}

/* ---------------------------------------------------------------------
   La liste d'achats, tous decks confondus.

   Un deck marqué « exemplaires propres » exige ses copies à lui : sa demande
   s'ajoute. Ceux qui ne le sont pas se partagent la collection — ils ne sont
   jamais montés en même temps —, et il suffit alors de satisfaire le plus
   gourmand d'entre eux. Ce que l'on possède se retranche du total.
   --------------------------------------------------------------------- */

/* La demande de chaque carte, deck par deck. */
function demandesTousDecks() {
  const par = new Map();   // nom canonique -> {propres, partage, decks:[{cle, qty}]}
  clesDecks().forEach(cle => {
    const d = S.decks[cle];
    d.deck.forEach((q, nom) => {
      if (!find(nom) || q <= 0) return;
      const n = nomCanonique(nom);
      let e = par.get(n);
      if (!e) { e = {propres:0, partage:0, decks:[]}; par.set(n, e); }
      if (d.exemplairesPropres !== false) e.propres += q;
      else e.partage = Math.max(e.partage, q);
      e.decks.push({cle, nom:d.nom, qty:q});
    });
  });
  return par;
}

let ACHATS = {sig:null, liste:null};
function invaliderAchats() { ACHATS = {sig:null, liste:null}; }

/* `spent()` fait déjà une estimation d'offre par carte manquante, et
   l'en-tête l'appelle à chaque rendu. Sur huit decks, la liste d'achats
   referait ce travail autant de fois : elle se mémorise donc sous une
   empreinte de ce dont elle dépend — les decks, la collection, les
   préférences d'achat. */
function signatureAchats() {
  return [
    clesDecks().map(c => {
      const d = S.decks[c];
      return c + ':' + (d.exemplairesPropres !== false ? 'p' : 's') + ':'
           + [...d.deck].map(([n, q]) => `${n}×${q}`).sort().join(',');
    }).join('|'),
    [...S.collection].map(([n, q]) => `${n}×${q}`).sort().join(','),
    JSON.stringify(S.achats),
    S.prixMaj || 0
  ].join('#');
}

function wishlist() {
  const sig = signatureAchats();
  if (ACHATS.sig === sig && ACHATS.liste) return ACHATS.liste;
  const lignes = [];
  demandesTousDecks().forEach((e, nom) => {
    const c = find(nom); if (!c) return;
    const besoin = e.propres + e.partage;
    const possede = quantiteCollection(nom);
    const manque = Math.max(0, besoin - possede);
    if (!manque) return;
    /* L'offre se chiffre avec les préférences d'achat, mais le plafond par
       carte dépend du deck : ici, aucun deck n'est « le » deck, et c'est le
       prix de tendance ajusté qui fait foi. */
    const pu = Math.max(0.02, Math.round((c.price || 0) * multiplicateurAchat() * 100) / 100);
    const prix = c.price > 0 ? pu : 0;
    lignes.push({card:c, nom, besoin, possede, manque, unit:prix,
                 total:prix * manque, inconnu:!prix,
                 decks:e.decks.sort((a, b) => b.qty - a.qty)});
  });
  lignes.sort((a, b) => b.total - a.total || a.card.name.localeCompare(b.card.name, 'fr'));
  ACHATS = {sig, liste:lignes};
  return lignes;
}

/* Le pied de la liste : ce qu'elle coûte, combien d'exemplaires elle porte,
   et ce que les decks se sont fixé comme plafonds — à titre d'information,
   rien ne le contraint. */
function bilanWishlist() {
  const l = wishlist();
  return {
    lignes: l.length,
    exemplaires: l.reduce((n, x) => n + x.manque, 0),
    total: l.reduce((t, x) => t + x.total, 0),
    inconnus: l.filter(x => x.inconnu).length,
    plafonds: clesDecks().reduce((t, c) => t + (S.decks[c].budget.total || 0), 0)
  };
}
