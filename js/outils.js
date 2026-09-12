/* =====================================================================
   js/outils.js — Menue monnaie de l'atelier

   Échapper un texte, formater un prix, dire ce que la collection a coûté et ce
   qu'il reste à acheter, souffler un mot à l'écran. Rien ici ne connaît l'état
   de l'atelier au-delà de ce qu'on lui passe : c'est le socle que tout le reste
   appelle sans y penser.
   ===================================================================== */

function esc(s) {
  return String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

function eur(n) {
  return (Math.round(n*100)/100).toLocaleString('fr-FR', {minimumFractionDigits:2, maximumFractionDigits:2}) + ' €';
}

function refCarte(nom) {
  return `<button type="button" class="cref" data-act="fiche" data-name="${esc(nom)}">${esc(nom)}</button>`;
}

function fmt() {
  if (S.format === 'perso') {
    return {
      label: 'Personnalisé',
      size: S.custom.deckSize,
      maxCopies: S.custom.maxCopies,
      commander: S.custom.commander,
      lands: Math.round(S.custom.deckSize * 0.36),
      legal: '', scry: '',
      legalities: ['custom']
    };
  }
  return FORMATS[S.format];
}

function spent() {
  return aAcheter().reduce((t, l) => t + l.total, 0);
}

function aAcheter() {
  const f = fmt();
  const lignes = [];
  S.deck.forEach((q, nom) => {
    const c = find(nom); if (!c) return;
    const possede = S.collection.get(nom) || 0;
    const aAcheterNb = Math.max(0, q - possede);
    if (aAcheterNb > 0) {
      const o = bestOffer(c);
      const pu = o ? o.price : (c.price || 0);
      lignes.push({card:c, qty:aAcheterNb, unit:pu, total:pu * aAcheterNb, inconnu:!pu, offer:o});
    }
  });
  return lignes.sort((a, b) => b.total - a.total);
}

function toast(msg) {
  const t = document.getElementById('toast');
  if (!t) return;
  /* Une fenêtre modale est peinte dans la « top layer », au-dessus de tout
     z-index : le message doit y entrer pour rester visible — la boîte de
     recalcul, entre autres, en couvrirait sinon chaque annonce. */
  const dlg = document.getElementById('dlg');
  const cible = (dlg && dlg.open) ? dlg : document.body;
  if (t.parentElement !== cible) cible.appendChild(t);
  t.textContent = msg;
  t.classList.add('show');
  clearTimeout(toast.timer);
  toast.timer = setTimeout(() => t.classList.remove('show'), 2400);
}

