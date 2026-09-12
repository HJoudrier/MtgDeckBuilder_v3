/* =====================================================================
   js/annexes.js — La réserve et l'étude

   Deux listes à côté du deck, aux mêmes gestes que lui : elles ne comptent ni
   dans la taille, ni dans la légalité, ni dans la courbe, ni dans les rôles,
   ni dans les achats. `ANNEXES` (js/etat.js) dit ce que chacune est ; ce qui
   suit ne connaît que leur clé.
   ===================================================================== */

function annexeListe(cle) {
  return S[cle] instanceof Map ? S[cle] : new Map();
}

/* Les mêmes entrées que `deckEntries()`, dans le même ordre : type, coût,
   nom. Les deux listes s'affichent comme le deck, il leur faut son tri. */
function annexeEntries(cle) {
  const out = [];
  annexeListe(cle).forEach((q, n) => {
    const c = find(n);
    if (c && q > 0) out.push({card:c, qty:q});
  });
  return out.sort((a, b) => TYPE_ORDER.indexOf(mainType(a.card)) - TYPE_ORDER.indexOf(mainType(b.card)) || a.card.cmc - b.card.cmc || a.card.name.localeCompare(b.card.name));
}

function annexeSize(cle) {
  let n = 0;
  annexeListe(cle).forEach(q => n += q);
  return n;
}

/* Où vit cette carte hors du deck : la clé de la liste, ou rien. */
function annexeDe(nom) {
  return CLES_ANNEXES.find(k => annexeListe(k).has(nom)) || null;
}

/* Le déplacement emporte tous les exemplaires : les trois listes s'excluant,
   une carte partagée entre deux d'entre elles n'aurait pas de sens. Vers le
   deck, le format borne malgré tout les copies — le reste attend là où il
   était. Rend le nombre d'exemplaires déplacés. */
function deplacerCarte(nom, cible) {
  const c = find(nom); if (!c) return 0;
  const source = (S.deck.get(nom) || 0) ? 'deck' : annexeDe(nom);
  if (source === cible) return 0;
  const dispo = source === 'deck' ? (S.deck.get(nom) || 0) : (source ? annexeListe(source).get(nom) : 0);
  let n = Math.max(1, dispo);

  if (cible === 'deck') {
    const f = fmt();
    const max = /^Basic Land/i.test(c.type) ? n : Math.max(0, f.maxCopies - (S.deck.get(nom) || 0));
    n = Math.min(n, max);
    if (n <= 0) { toast(`${nom} : limite de ${f.maxCopies} copie(s) atteinte dans le deck.`); return 0; }
    S.deck.set(nom, (S.deck.get(nom) || 0) + n);
  } else {
    annexeListe(cible).set(nom, (annexeListe(cible).get(nom) || 0) + n);
  }

  if (source === 'deck') {
    const reste = (S.deck.get(nom) || 0) - (cible === 'deck' ? 0 : n);
    if (reste > 0) S.deck.set(nom, reste); else S.deck.delete(nom);
    /* Le commandant part avec sa carte : le deck n'en a plus. */
    if (cible !== 'deck' && S.commander === nom && !S.deck.has(nom)) S.commander = null;
  } else if (source) {
    const reste = dispo - n;
    if (reste > 0) annexeListe(source).set(nom, reste); else annexeListe(source).delete(nom);
  }
  return n;
}

/* Poser une carte dans une liste annexe, d'où qu'elle vienne : du deck, de
   l'autre liste, ou de nulle part — la collection, la recherche, une
   suggestion. */
function versAnnexe(nom, cle, qty) {
  const c = find(nom); if (!c || !ANNEXES[cle]) return;
  const a = ANNEXES[cle], l = annexeListe(cle);
  const demande = Math.max(1, qty || 1);
  const source = (S.deck.get(nom) || 0) ? 'deck' : annexeDe(nom);

  /* Déjà là : la demande s'ajoute. Ailleurs : la carte déménage avec ses
     exemplaires, et la demande complète ce que le déménagement n'apporte
     pas. Nulle part : elle arrive telle qu'on la demande. */
  let deplaces = 0;
  if (source && source !== cle) {
    deplaces = deplacerCarte(nom, cle);
    if (!deplaces) return;
  }
  const reste = demande - (deplaces || 0);
  if (reste > 0) l.set(nom, (l.get(nom) || 0) + reste);

  recalculerAvecProgression(`${nom} placée dans ${a.article} : les suggestions tiennent compte du nouveau deck.`);
  const total = l.get(nom) || 0;
  toast(source === 'deck' ? `${nom} quitte le deck pour ${a.article} (×${total}).`
    : source && source !== cle ? `${nom} déplacée vers ${a.article} (×${total}).`
    : `${nom} dans ${a.article} : ×${total}.`);
}

/* Un exemplaire retiré d'une liste annexe ; le dernier retire la carte. */
function retirerAnnexe(nom, cle) {
  const l = annexeListe(cle), cur = l.get(nom) || 0;
  if (cur <= 1) l.delete(nom); else l.set(nom, cur - 1);
  recalculerAvecProgression(`${nom} retirée de ${ANNEXES[cle].article} : les suggestions sont reprises.`);
}

function viderAnnexe(cle) {
  annexeListe(cle).clear();
  recalculerAvecProgression(`${ANNEXES[cle].titre} : liste vidée, les suggestions sont reprises.`);
  toast(`${ANNEXES[cle].titre} : liste vidée.`);
}

/* Le tag que portent, partout ailleurs, les cartes garées dans une annexe :
   sans lui, on reproposerait sans fin une carte déjà mise de côté. */
function tagAnnexe(card) {
  const cle = card ? annexeDe(card.name) : null;
  if (!cle) return '';
  const n = annexeListe(cle).get(card.name);
  return `<span class="tag" style="border-color:#6f7bd0;color:#9aa4e6" title="${esc(ANNEXES[cle].aide)}">${esc(ANNEXES[cle].titre.toLowerCase())}${n > 1 ? ` ×${n}` : ''}</span>`;
}
