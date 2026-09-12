/* =====================================================================
   js/impressions.js — Les éditions d'une carte, et celle qu'on possède

   Une liste exportée par MTGO, Moxfield, Archidekt ou Deckstats donne le code
   d'édition entre parenthèses puis le numéro de collection : « 1 Sol Ring
   (LTC) 344 ». Ce couple désigne une impression précise, donc son visuel, son
   illustrateur et son prix ; il est relevé à l'import, conservé sur la carte
   et redemandé tel quel à Scryfall. La collection reste comptée par nom : les
   éditions relevées s'ajoutent les unes aux autres sur la même carte.
   ===================================================================== */

function cleImpression(set, num) {
  const s = String(set == null ? '' : set).trim().toLowerCase();
  const n = String(num == null ? '' : num).trim().toLowerCase();
  return s && n ? s + '|' + n : '';
}

/* Édition lue dans une liste importée. La première qui porte un numéro
   devient l'édition de référence de la carte : c'est elle qui sera
   demandée à Scryfall. */
function noterImpression(card, set, num, qty) {
  if (!card || !set) return card;
  const s = String(set).trim().toUpperCase();
  const n = String(num == null ? '' : num).trim();
  const ex = Math.max(0, parseInt(qty, 10) || 0);
  card.impressions = card.impressions || [];
  const vue = card.impressions.find(i => i.set === s && i.num === n);
  if (vue) vue.qty += ex;
  else card.impressions.push({set:s, num:n, qty:ex});
  if (n && !card.setImporte) {
    card.set = s;
    card.num = n;
    card.setImporte = true;
    card.setName = '';
    card.impressionTried = false;
  } else if (!card.set) {
    card.set = s;
    card.num = n;
  }
  return card;
}

/* Édition rapportée par Scryfall : elle ne prend la place de celle
   relevée à l'import que si la carte n'en avait pas. */
function completeImpression(card, sc) {
  if (!card || !sc || !sc.set) return;
  const s = String(sc.set).toUpperCase();
  const n = sc.collector_number == null ? '' : String(sc.collector_number);
  if (!card.setImporte) { card.set = s; card.num = n; }
  if (card.set === s && sc.set_name) card.setName = sc.set_name;
}

function libelleImpression(card) {
  if (!card || !card.set) return '';
  return card.set + (card.num ? ' n°' + card.num : '');
}

/* Éditions de la carte présentes dans la collection : ce sont celles que la
   fiche fait défiler. Une carte importée sans code d'édition n'en a aucune,
   et une seule édition ne se prête pas au défilement. */
function versionsCarte(card) {
  return ((card && card.impressions) || []).filter(i => i.set);
}

function cleVersion(v) {
  return v ? cleImpression(v.set, v.num) : '';
}

/* L'édition retenue pour l'affichage : celle que l'utilisateur a choisie,
   sinon celle relevée à l'import. */
function versionRetenue(card) {
  return (card && card.impressionChoisie) || cleImpression(card && card.set, card && card.num);
}
