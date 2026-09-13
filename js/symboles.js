/* =====================================================================
   js/symboles.js — Les symboles de mana

   Scryfall publie la table des symboles et leur image ; on la charge une fois,
   et tout ce qui affiche un coût s'y réfère. Sans elle, une pastille de
   couleur tient lieu de symbole.
   ===================================================================== */

let SYMS = null;

/* Chaque carte complétée par Scryfall — texte, coût, prix, légalité — peut
   changer sa note. Ce compteur entre dans l'empreinte des suggestions, qui
   sans lui resservirait une sélection notée sur des cartes incomplètes. */
let MAJ_CARTES = 0;

async function loadSymbology() {
  if (typeof fetch !== 'function' || SYMS) return;
  try {
    const r = await fetch('https://api.scryfall.com/symbology');
    if (!r.ok) throw new Error('HTTP ' + r.status);
    const j = await r.json();
    const m = {};
    (j.data || []).forEach(x => { if (x.symbol && x.svg_uri) m[x.symbol] = x.svg_uri; });
    if (!Object.keys(m).length) throw new Error('réponse vide');
    SYMS = m;
    renderAll();
  } catch(err) { /* pastilles CSS conservées */ }
}

function pipHTML(inner, taille) {
  const code = String(inner).toUpperCase().replace(/[^A-Z0-9]/g, '');
  const generique = /^\d+$|^X$/.test(code);
  const fb = generique ? 'gen' : ('WUBRGC'.includes(code) ? code : (code.split('').find(c => 'WUBRG'.includes(c)) || 'gen'));
  const txt = generique ? code : (fb === 'gen' ? code : fb);
  return {fb, txt, cls:'mana ' + fb + (taille === 'sm' ? ' sm' : '')};
}

function symBg(inner) {
  const p = pipHTML(inner);
  const uri = SYMS && SYMS['{' + String(inner).toUpperCase() + '}'];
  return uri
    ? `<span class="symbg" style="background-image:url('${esc(uri)}')" role="img" aria-label="${esc(inner)}"></span>`
    : `<span class="${p.cls}">${esc(p.txt)}</span>`;
}

function symIcon(inner, taille) {
  const p = pipHTML(inner, taille);
  const uri = SYMS && SYMS['{' + String(inner).toUpperCase() + '}'];
  if (!uri) return `<span class="${p.cls}">${esc(p.txt)}</span>`;
  const cls = 'msym' + (taille ? ' ' + taille : '');
  return `<img class="${cls}" src="${esc(uri)}" alt="${esc(inner)}" title="{${esc(inner)}}"
    loading="lazy" data-fb="${p.fb}" data-sz="${taille||''}" data-txt="${esc(p.txt)}" onerror="manaFb(this)">`;
}

function manaFb(img) {
  const sz = img.dataset.sz === 'sm' ? ' sm' : '';
  img.outerHTML = `<span class="mana ${img.dataset.fb}${sz}">${img.dataset.txt}</span>`;
}

function manaHTML(card, sm) {
  const t = sm ? 'sm' : '';
  if (!card.symbols.length) return `<span class="mana gen${sm?' sm':''}">—</span>`;
  return card.symbols.map(x => symIcon(x.slice(1, -1), t)).join('');
}

function stripeColor(card) {
  const id = card.identity;
  if (!id.length) return 'var(--C)';
  if (id.length === 1) return `var(--${id[0]})`;
  return `linear-gradient(180deg,${id.map(c => `var(--${c})`).join(',')})`;
}
