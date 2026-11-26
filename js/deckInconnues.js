/* =====================================================================
   js/deckInconnues.js — Les cartes du deck que l'atelier ne connaît que de nom

   Un deck externe se colle, ou vient d'une ancienne bibliothèque d'adversaires
   (`migreAdversaires()`) : ses cartes entrent « inconnues », sans type, sans
   coût ni texte. Elles s'affichent — un nom suffit à une ligne — mais rien ne
   les range : groupes par type, par rôle ou par coût, courbe de mana, jauges
   de rôles les comptent à part ou pas du tout. Seul l'onglet Collection
   proposait de les compléter ; or c'est dans Construction qu'on lit un deck
   externe. La section les complète donc d'elle-même, une fois par carte et par
   séance, et dit ce qui reste quand Scryfall n'a pas répondu.
   ===================================================================== */

/* Les cartes du deck ouvert — liste principale, annexes et commandant — dont
   l'atelier ne sait encore que le nom. */
function inconnuesDuDeck() {
  const noms = [...S.deck.keys(), ...CLES_ANNEXES.flatMap(cle => [...annexeListe(cle).keys()])];
  if (S.commander) noms.push(S.commander);
  return [...new Set(noms)].map(n => find(n)).filter(c => c && c.unknown);
}

/* Une seule tentative par carte et par séance : sans ce drapeau, une carte
   que Scryfall ignore relancerait la complétion à chaque repaint, puisque
   `completeUnknown()` repeint en finissant. Hors ligne, rien n'est tenté. */
function completeInconnuesDuDeck() {
  if (S.scryHS || S.enriching || typeof fetch !== 'function') return;
  const neuves = inconnuesDuDeck().filter(c => !c.completionTentee);
  if (!neuves.length) return;
  neuves.forEach(c => { c.completionTentee = true; });
  completeUnknown(neuves.map(c => c.name));
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
