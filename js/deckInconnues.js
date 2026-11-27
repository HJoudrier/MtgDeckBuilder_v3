/* =====================================================================
   js/deckInconnues.js — Les cartes du deck que l'atelier ne connaît que de nom

   Un deck externe se colle, ou vient d'une ancienne bibliothèque d'adversaires
   (`migreAdversaires()`) : ses cartes entrent « inconnues », sans type, sans
   coût ni texte. Elles s'affichent — un nom suffit à une ligne — mais rien ne
   les range : groupes par type, par rôle ou par coût, courbe de mana, jauges
   de rôles les comptent à part ou pas du tout. Seul l'onglet Collection
   proposait de les compléter ; or c'est dans Construction qu'on lit un deck
   externe. La section les complète donc d'elle-même — d'abord avec ce que
   l'appareil possède déjà (l'archive, les fiches de la simulation), Scryfall
   pour le seul reste — et dit ce qui reste quand rien n'a répondu.
   ===================================================================== */

/* Les cartes du deck ouvert — liste principale, annexes et commandant — dont
   l'atelier ne sait encore que le nom. */
function inconnuesDuDeck() {
  const noms = [...S.deck.keys(), ...CLES_ANNEXES.flatMap(cle => [...annexeListe(cle).keys()])];
  if (S.commander) noms.push(S.commander);
  return [...new Set(noms)].map(n => find(n)).filter(c => c && c.unknown);
}

/* La carte inconnue devient celle que la fiche gardée décrit : type, coût,
   texte, force, endurance et champs de jeu. Les fiches de `SIM_CARTES` sont
   ce que la simulation a déjà rapporté de Scryfall pour les decks adverses ;
   elles vivent dans IndexedDB, donc disponibles sans réseau. Le nom, lui, est
   gardé — les decks désignent la carte par lui. Pas de visuel ni de prix : la
   file des visuels les demandera, la carte n'étant plus inconnue. */
function completeInconnueDepuisFiche(c, f) {
  const neuve = buildCard(c.name, f.cout || '—', f.type || 'Inconnu', c.price, f.texte || '');
  delete neuve.name;
  Object.assign(c, neuve);
  if (f.force != null) c.force = f.force;
  if (f.endurance != null) c.endurance = f.endurance;
  if (f.manaProduit) c.manaProduit = ordonneMana(String(f.manaProduit).split(''));
  appliqueChampsJeu(c, f);
  c.textFull = !!f.texte;
  reanalyser(c);
  c.unknown = false;
  return c;
}

/* Complète, avec les fiches gardées pour la simulation, les cartes inconnues
   du deck. Rend leur nombre. */
function completeInconnuesDepuisFiches() {
  let n = 0;
  inconnuesDuDeck().forEach(c => {
    const f = SIM_CARTES.get(norm(c.name)) || SIM_CARTES.get(norm(frontFace(c.name)));
    if (f && f.type) { completeInconnueDepuisFiche(c, f); n++; }
  });
  if (n) { MAJ_CARTES++; invaliderCandidats(); scheduleSave(); }
  return n;
}

let INCONNUES_EN_COURS = false;

/* Trois sources, de la moins chère à la plus chère : l'archive en mémoire,
   les fiches gardées dans IndexedDB, puis Scryfall pour le seul reste. Les
   deux premières ne demandent aucun réseau ; Scryfall n'est tenté qu'une fois
   par carte et par séance — sans ce drapeau, une carte qu'il ignore
   relancerait la complétion à chaque repaint, puisque `completeUnknown()`
   repeint en finissant — et jamais hors ligne. */
async function completeInconnuesDuDeck() {
  if (INCONNUES_EN_COURS || !inconnuesDuDeck().length) return;
  INCONNUES_EN_COURS = true;
  try {
    let n = catalogueAbsent() ? 0 : completeInconnuesDepuisArchive();
    await chargeSimCartes();
    n += completeInconnuesDepuisFiches();
    if (n) renderAll();
    if (S.scryHS || S.enriching || typeof fetch !== 'function') return;
    const neuves = inconnuesDuDeck().filter(c => !c.completionTentee);
    if (!neuves.length) return;
    neuves.forEach(c => { c.completionTentee = true; });
    completeUnknown(neuves.map(c => c.name));
  } finally { INCONNUES_EN_COURS = false; }
}

/* L'avertissement de la section : ce que la liste ne peut pas encore ranger,
   avec le geste qui retente. */
function blocInconnues() {
  const n = inconnuesDuDeck().length;
  if (!n) return '';
  return `<div class="warnbox">${n} carte${n > 1 ? 's' : ''} de ce deck ${n > 1 ? 'sont' : 'est'} connue${n > 1 ? 's' : ''} par son nom seulement :
    type, coût et rôles restent inconnus, donc ${n > 1 ? 'elles ne figurent' : 'elle ne figure'} ni dans les groupes, ni dans la courbe, ni dans les jauges.
    <button class="btn sm" data-act="enrich" style="margin-left:6px">Compléter via Scryfall</button></div>`;
}
