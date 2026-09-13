/* =====================================================================
   js/apercu.js — L'aperçu volant sous le curseur

   Le visuel d'une carte paraît près du curseur dès qu'un nom est survolé, sans
   ouvrir de fiche. Il se replace pour ne pas sortir de l'écran, et se hisse
   dans la « top layer » quand une fenêtre modale est ouverte — sans quoi il
   serait peint dessous et invisible.
   ===================================================================== */

function initApercu() {
  if (!apercuEl) {
    apercuEl = document.getElementById('cardPreview');
  }
  return apercuEl;
}

/* Aperçu volant : le texte y est borné pour ne pas couvrir l'écran, la fiche
   complète (clic sur la carte) reste la vue de référence. */
function apercuTexte(c) {
  const t = String(c.text || '').replace(/ \/\/ /g, '\n');
  return t.length > 320 ? t.slice(0, 320).replace(/\s+\S*$/, '') + '…' : t;
}

/* Une fenêtre modale est peinte dans la « top layer », au-dessus de tout
   z-index : l'aperçu doit y entrer pour rester visible. */
function placerApercuDansCouche() {
  const el = initApercu();
  const dlg = document.getElementById('dlg');
  if (!el) return;
  const cible = (dlg && dlg.open) ? dlg : document.body;
  if (el.parentElement !== cible) cible.appendChild(el);
}

function montrerApercu(nom, x, y) {
  const el = initApercu();
  if (!el || !nom) return;
  const c = find(nom);
  if (!c) return;
  placerApercuDansCouche();
  apercuCardName = c.name;
  if (typeof queueScryfall === 'function') queueScryfall([c]);
  const imgUrl = faceVisible(c, true) || faceVisible(c, false);
  if (imgUrl) {
    el.innerHTML = `<img src="${esc(imgUrl)}" alt="${esc(c.name)}" style="width:240px;display:block;border-radius:8px">`;
  } else {
    el.innerHTML = `<div style="padding:10px;font-size:12px;background:var(--panel);border-radius:8px;max-width:240px">
      <div style="font-weight:bold;margin-bottom:4px">${esc(c.name)}</div>
      <div style="margin-bottom:4px">${manaHTML(c, true)}</div>
      <div class="small muted" style="margin-bottom:6px">${esc(c.type)}</div>
      <div class="small" style="white-space:pre-line">${esc(apercuTexte(c))}</div>
    </div>`;
  }
  el.style.display = 'block';
  placerApercu(x, y);
}

function placerApercu(x, y) {
  const el = initApercu();
  if (!el || el.style.display !== 'block') return;
  const offset = 16;
  let left = x + offset;
  let top = y + offset;
  const rect = el.getBoundingClientRect();
  const w = rect.width || 250;
  const h = rect.height || 350;

  if (left + w > window.innerWidth - 10) {
    left = Math.max(10, x - w - offset);
  }
  if (top + h > window.innerHeight - 10) {
    top = Math.max(10, window.innerHeight - h - 10);
  }

  el.style.left = `${left}px`;
  el.style.top = `${top}px`;
}

function cacherApercu() {
  const el = initApercu();
  if (el) {
    el.style.display = 'none';
  }
  apercuCardName = null;
}

function majApercu() {
  if (apercuCardName) {
    const el = initApercu();
    if (el && el.style.display === 'block') {
      const c = find(apercuCardName);
      if (c) {
        const imgUrl = faceVisible(c, true) || faceVisible(c, false);
        if (imgUrl) {
          el.innerHTML = `<img src="${esc(imgUrl)}" alt="${esc(c.name)}" style="width:240px;display:block;border-radius:8px">`;
        }
      }
    }
  }
}

