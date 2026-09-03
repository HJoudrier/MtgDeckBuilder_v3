/* =====================================================================
   js/ui.js — Composants d'interface, gabarits HTML, dialogues & rendu
   ===================================================================== */

function esc(s) {
  return String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
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
  t.textContent = msg;
  t.classList.add('show');
  clearTimeout(toast.timer);
  toast.timer = setTimeout(() => t.classList.remove('show'), 2400);
}

function openDialog(title, bodyHTML, actionsHTML, grande) {
  const dlg = document.getElementById('dlg');
  if (!dlg) return;
  dlg.classList.toggle('grand', !!grande);
  dlg.classList.toggle('wide', !!grande);
  const headEl = document.getElementById('dlgTitle') || document.getElementById('dlgHead');
  if (headEl) {
    headEl.innerHTML = `<div style="display:flex;align-items:center;justify-content:space-between;gap:12px;width:100%">
      <h3 style="margin:0;font-size:17px;font-family:var(--display);flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${esc(title)}</h3>
      <button type="button" class="btn sm dlg-close" data-act="closeDialog" style="flex:0 0 auto;padding:2px 8px;line-height:1" title="Fermer la fenêtre (Échap)">✕</button>
    </div>`;
  }
  const bodyEl = document.getElementById('dlgBody');
  if (bodyEl) bodyEl.innerHTML = bodyHTML;
  const footEl = document.getElementById('dlgFoot');
  if (footEl) footEl.innerHTML = actionsHTML || '<button type="button" class="btn" data-act="closeDialog">Fermer</button>';
  if (!dlg.open) {
    dlg.showModal();
  }
}

function closeDialog() {
  const dlg = document.getElementById('dlg');
  if (dlg && dlg.open) dlg.close();
}

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
  if (S.images && imgUrl) {
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
        if (S.images && imgUrl) {
          el.innerHTML = `<img src="${esc(imgUrl)}" alt="${esc(c.name)}" style="width:240px;display:block;border-radius:8px">`;
        }
      }
    }
  }
}

function aDeuxFaces(card) {
  return !!(card && card.imgB);
}

function autreFace(card) {
  if (!aDeuxFaces(card)) return '';
  return RETOURNEES.has(card.name) ? (card.imgN || card.img || '') : (card.imgB || '');
}

function faceVisible(card, grand) {
  if (!card) return '';
  const verso = RETOURNEES.has(card.name) && card.imgB;
  if (verso) return (grand && card.imgBL) ? card.imgBL : card.imgB;
  if (grand && card.imgL) return card.imgL;
  return card.imgN || card.img || '';
}

function cardTile(e, ctx) {
  const c = e.card, dispo = availableFor(c), inDeck = S.deck.get(c.name) || 0;
  const isCmd = S.commander === c.name;
  const img = S.images && (c.imgN || c.img);
  const note = ctx === 'deck' ? NOTES_DECK.get(c.name) : null;
  const face = faceVisible(c);
  const isHors = dispo < 0 || (S.collection.get(c.name) || 0) <= 0;

  let tagsHTML = '';
  if (ctx === 'deck' && note) {
    const n = (note.partners || []).length;
    const tags = [
      n ? `<span class="tag" style="border-color:var(--brass);color:var(--brass)" title="Cartes du deck avec lesquelles elle interagit">${n} interaction${n>1?'s':''}</span>` : '',
      isHors ? `<span class="tag" style="border-color:var(--bad);color:#e39a90">hors collection</span>` : '',
      note.combos && note.combos.length ? `<span class="tag" style="border-color:#a077cf;color:#a077cf">combo</span>` : '',
      note.edhrec ? `<span class="tag" style="border-color:#57c9c4;color:#57c9c4" title="Taux d'inclusion dans les decks de ce commandant, et synergie par rapport aux autres decks de la même identité couleur">edhrec ${Math.round(note.edhrec.inclusion*100)} % / ${note.edhrec.synergy>=0?'+':'−'}${Math.abs(Math.round(note.edhrec.synergy*100))} %</span>` : ''
    ].filter(Boolean).join('');
    if (tags) tagsHTML = `<div class="tags">${tags}</div>`;
  }

  const scoreHTML = (ctx === 'deck' && note)
    ? `<div class="score-line mono small muted" title="${esc((note.reasons||[]).slice(0,3).join(' · '))}">score ${note.score.toFixed(1)}</div>`
    : '';

  return `<div class="cardT card ${img?'withimg':''} ${dispo<=0?'zero':''} ${isCmd?'cmd':''} ${ctx==='deck'&&dispo<0?'achat':''}" data-card="${esc(c.name)}" data-ctx="${ctx}">
    ${isCmd ? `<span class="cmdbadge">Commandant</span>` : ''}
    ${img ? `<div class="imgwrap">
      <img class="cimg" src="${esc(face)}" alt="${esc(c.name)}" loading="lazy" decoding="async">
      ${aDeuxFaces(c) ? `<button type="button" class="badge" data-act="flip" data-name="${esc(c.name)}" title="Afficher l'autre face">↻ Face</button>` : ''}
    </div>` : `<div class="cname">${esc(c.name)}</div>`}
    ${scoreHTML}
    ${tagsHTML}
    <div class="foot bot">
      <span>${ctx==='deck'?`×${e.qty}`:`${e.qty} ex.`}</span>
      <span class="mono">${eur(c.price)}</span>
      <div class="qty acts" style="margin-left:auto">
        <button class="btn sm" data-act="fiche" data-name="${esc(c.name)}" title="Fiche complète">i</button>
        ${ctx==='collection'
          ? `<button class="btn sm" data-act="toDeck" data-name="${esc(c.name)}" title="Ajouter au deck">▲</button>`
          : `<button class="btn sm" data-act="fromDeck" data-name="${esc(c.name)}" title="Retirer du deck">−</button>
             ${fmt().commander && c.isLegendaryCreature ? `<button class="btn sm ${isCmd?'pri':''}" data-act="${isCmd?'unsetCmd':'setCmd'}" data-name="${esc(c.name)}" title="${isCmd?'Commandant actuel':'Désigner comme commandant'}">★</button>` : ''}`}
      </div>
    </div>
  </div>`;
}

function cardRow(e, ctx) {
  const c = e.card, dispo = availableFor(c), isCmd = S.commander === c.name;
  const note = ctx === 'deck' ? NOTES_DECK.get(c.name) : null;
  const scoreBadge = note ? `<span class="mono small muted" style="margin-left:auto;margin-right:8px" title="${esc((note.reasons||[]).slice(0,3).join(' · '))}">score ${note.score.toFixed(1)}</span>` : '';
  const dispoBadge = ctx === 'deck' && dispo < 0 ? `<span class="achatbadge" style="position:static;margin-left:6px">à acheter (${-dispo})</span>` : '';

  return `<div class="lrow ${dispo<=0?'zero':''} ${isCmd?'cmd':''} ${ctx==='deck'&&dispo<0?'achat':''}" data-card="${esc(c.name)}" data-ctx="${ctx}">
    <span class="cname" data-act="fiche" data-name="${esc(c.name)}">${esc(c.name)}</span>
    <span class="costs">${manaHTML(c, true)}</span>
    <span class="small muted" style="max-width:200px;overflow:hidden;text-overflow:ellipsis">${esc(c.type)}</span>
    <span class="mono small">${eur(c.price)}</span>
    <span class="mono small">${ctx==='deck'?`×${e.qty}`:`${e.qty} ex.`}</span>
    ${dispoBadge}
    ${scoreBadge}
    <div class="acts qty" style="margin-left:${note||dispoBadge?'6px':'auto'}">
      <button class="btn sm" data-act="fiche" data-name="${esc(c.name)}" title="Fiche complète">i</button>
      ${ctx==='collection'
        ? `<button class="btn sm" data-act="toDeck" data-name="${esc(c.name)}" title="Ajouter au deck">▲</button>`
        : `<button class="btn sm" data-act="fromDeck" data-name="${esc(c.name)}" title="Retirer">−</button>
           ${fmt().commander && c.isLegendaryCreature ? `<button class="btn sm ${isCmd?'pri':''}" data-act="${isCmd?'unsetCmd':'setCmd'}" data-name="${esc(c.name)}" title="Commandant">★</button>` : ''}`}
    </div>
  </div>`;
}

function customPanel() {
  if (S.format !== 'perso') return '';
  const rows = 'WUBRG'.split('').map(c => `
    <div class="crow">
      <span class="dot" style="background:var(--${c})"></span>
      <b>${c}</b>
      <label class="lab">min</label><input type="number" min="0" max="200" value="${S.custom.colorLimits[c].min}" data-clim="${c}" data-k="min">
      <label class="lab">max</label><input type="number" min="0" max="200" value="${S.custom.colorLimits[c].max}" data-clim="${c}" data-k="max">
    </div>`).join('');

  return `<div class="group" style="margin-top:12px">
    <h4>Format personnalisé</h4>
    <div class="row">
      <div class="field"><label class="lab" for="cSz">Taille du deck</label><input id="cSz" type="number" min="10" max="500" value="${S.custom.deckSize}" data-cst="deckSize" style="width:80px"></div>
      <div class="field"><label class="lab" for="cCp">Exemplaires max</label><input id="cCp" type="number" min="1" max="99" value="${S.custom.maxCopies}" data-cst="maxCopies" style="width:80px"></div>
      <div class="field"><label class="lab" for="cCm">Commandant</label><input id="cCm" type="checkbox" ${S.custom.commander?'checked':''} data-cst="commander"></div>
    </div>
    <div class="small muted" style="margin:6px 0 4px">Fourchettes de cartes par couleur dans le deck :</div>
    ${rows}
  </div>`;
}

const MTG_COMBINAISONS = {
  // 1 couleur
  'W': 'Mono-Blanc',
  'U': 'Mono-Bleu',
  'B': 'Mono-Noir',
  'R': 'Mono-Rouge',
  'G': 'Mono-Vert',
  // 2 couleurs (Guildes de Ravnica)
  'WU': 'Azorius',
  'WB': 'Orzhov',
  'WR': 'Boros',
  'WG': 'Selesnya',
  'UB': 'Dimir',
  'UR': 'Izzet',
  'UG': 'Simic',
  'BR': 'Rakdos',
  'BG': 'Golgari',
  'RG': 'Gruul',
  // 3 couleurs (Éclats d'Alara & Khans de Tarkir)
  'WUB': 'Esper',
  'WUR': 'Jeskai',
  'WUG': 'Bant',
  'WBR': 'Mardu',
  'WBG': 'Abzan',
  'WRG': 'Naya',
  'UBR': 'Grixis',
  'UBG': 'Sultai',
  'URG': 'Temur',
  'BRG': 'Jund',
  // 4 couleurs (Nephilim)
  'WUBR': 'Sans-Vert (Yore-Tiller)',
  'WUBG': 'Sans-Rouge (Witch-Maw)',
  'WURG': 'Sans-Noir (Ink-Treader)',
  'WBRG': 'Sans-Bleu (Dune-Brood)',
  'UBRG': 'Sans-Blanc (Glint-Eye)',
  // 5 couleurs
  'WUBRG': '5 Couleurs (WUBRG)'
};

function nomCombinaisonCouleurs(sel) {
  if (!sel || sel.size === 0) return 'Aucune';
  const hasC = sel.has('C');
  const wubrg = ['W', 'U', 'B', 'R', 'G'].filter(c => sel.has(c)).join('');
  if (!wubrg && hasC) return 'Incolore';
  if (!wubrg && !hasC) return 'Aucune';
  const base = MTG_COMBINAISONS[wubrg] || wubrg;
  return hasC ? `${base} (+ Incolore)` : base;
}

/* Couleurs proposées par l'en-tête et par la fenêtre des filtres. */
const COLS = [
  ['W', 'Blanc ({W})'],
  ['U', 'Bleu ({U})'],
  ['B', 'Noir ({B})'],
  ['R', 'Rouge ({R})'],
  ['G', 'Vert ({G})'],
  ['C', 'Incolore ({C})']
];

const MODES_COULEUR = [
  ['identity', 'Identité couleur (EDH)'],
  ['atleast', 'Au moins une'],
  ['exact', 'Exactement']
];

/* =====================================================================
   Fenêtre « Format », ouverte depuis la pastille de l'en-tête. Les
   couleurs, elles, se règlent dans la fenêtre des filtres.
   ===================================================================== */

function resumeFormat() {
  const f = fmt();
  return `${f.size} cartes · max ${f.maxCopies >= 99 ? 'illimité' : f.maxCopies} ex. · ${f.commander ? 'commandant obligatoire' : 'sans commandant'}`;
}

function majResumeFormat() {
  const el = document.getElementById('formatResume');
  if (el) el.textContent = resumeFormat();
}

function corpsFormat() {
  return `<div class="field">
      <label class="lab" for="fmtSel">Format de jeu</label>
      <select id="fmtSel" data-act="format">
        ${Object.entries(FORMATS).map(([k, v]) => `<option value="${k}" ${S.format === k ? 'selected' : ''}>${esc(v.label)}</option>`).join('')}
      </select>
      <div class="small muted" id="formatResume">${resumeFormat()}</div>
    </div>
    ${customPanel()}
    <div class="small muted">Le format fixe la taille du deck, le nombre d'exemplaires autorisés et la présence d'un commandant ; il sert aussi au contrôle de conformité de la section Deck.</div>`;
}

/* Réécrit la fenêtre si elle est ouverte : changement de format,
   apparition ou disparition du panneau « Personnalisé ». */
function majFenetreFormat() {
  const dlg = document.getElementById('dlg');
  if (!dlg || !dlg.open) return;
  const corps = document.getElementById('dlgBody');
  if (!corps || !corps.querySelector('#fmtSel')) return;
  const y = corps.scrollTop;
  corps.innerHTML = corpsFormat();
  corps.scrollTop = y;
}

function openFormatModal() {
  openDialog('Format de jeu', corpsFormat(),
    '<button type="button" class="btn pri" data-act="closeDialog">Fermer</button>');
}

function statsCatalogue() {
  const noeuds = noeudsActifs();
  if (typeof CAT !== 'undefined' && CAT.cartes && CAT.cartes.length > 0) {
    const total = CAT.cartes.length;
    let filtr = 0;
    for (let i = 0; i < total; i++) {
      const rec = CAT.cartes[i];
      const id = rec[CH.ID_COUL] ? String(rec[CH.ID_COUL]).split('') : [];
      if (!colorOK({identity: id})) continue;
      if (noeuds.length && !recToucheNoeuds(rec, noeuds)) continue;
      filtr++;
    }
    return { filtr, total };
  }
  const total = DB.length;
  const filtr = DB.filter(c => colorOK(c) && (!noeuds.length || carteTouche(c, noeuds))).length;
  return { filtr, total };
}

/* =====================================================================
   Fenêtre « Filtres » de l'en-tête : nom, force, endurance, coût de mana
   et prix. Les champs agissent en direct sur la collection affichée.
   ===================================================================== */

const FILTRE_ICONE = '<svg viewBox="0 0 16 16" width="11" height="11" aria-hidden="true" style="vertical-align:-1px"><path d="M1.2 2.2h13.6L9.4 8.6v5.2L6.6 12.3V8.6z" fill="currentColor"/></svg>';

let filtreTimer = null;

/* Une ligne « critère min → max ». */
function ligneFiltre(kMin, kMax, label, aide, pas, min) {
  const f = S.filtres;
  const champ = (cle, place) => `<input type="number" inputmode="decimal" step="${pas}" ${min !== undefined ? `min="${min}"` : ''}
      id="f_${cle}" data-filtre="${cle}" value="${esc(f[cle])}" placeholder="${place}" aria-label="${esc(label)} ${place}">`;
  return `<div class="filtre-ligne">
    <span class="filtre-nom" title="${esc(aide)}">${esc(label)}</span>
    <label class="lab" for="f_${kMin}">min</label>${champ(kMin, 'min')}
    <label class="lab" for="f_${kMax}">max</label>${champ(kMax, 'max')}
  </div>`;
}

function corpsFiltres() {
  const f = S.filtres;
  return `<div class="field">
      <label class="lab">Couleurs considérées</label>
      <div class="row" style="align-items:center;gap:6px">
        ${COLS.map(([c, titre]) => `
          <button type="button" class="mana-btn" data-color="${c}" aria-pressed="${S.colors.has(c)}" title="${titre}">
            ${symBg(c)}
          </button>`).join('')}
        <button type="button" class="btn sm" data-act="allColors" style="margin-left:4px">Toutes</button>
        <button type="button" class="btn sm" data-act="clearColors">Aucune</button>
      </div>
      <div class="seg" style="margin-top:6px">
        ${MODES_COULEUR.map(([m, l]) => `<button type="button" data-cmode="${m}" aria-pressed="${S.colorMode === m}">${l}</button>`).join('')}
      </div>
      <div class="small muted">${esc(nomCombinaisonCouleurs(S.colors))} · même réglage que la barre de mana de l'en-tête.</div>
    </div>
    <div class="field">
      <label class="lab" for="f_search">Recherche</label>
      <input type="text" id="f_search" data-filtre="search" value="${esc(S.search)}" placeholder="nom, type ou texte de la carte…" autocomplete="off">
    </div>
    <div class="field">
      <label class="lab" for="f_typeFilter">Type de carte</label>
      <select id="f_typeFilter" data-filtre="typeFilter">
        <option value="">Tous les types</option>
        ${TYPE_ORDER.map(t => `<option value="${esc(t)}" ${S.typeFilter === t ? 'selected' : ''}>${esc(t)}</option>`).join('')}
      </select>
    </div>
    <div class="field">
      <label class="lab">Archétype</label>
      ${archetypesFiltre().length ? `<div class="archetypes">${archetypesFiltre().map(slug =>
        `<button type="button" class="arch-btn" data-act="toggleArch" data-arch="${esc(slug)}" aria-pressed="true"
          title="${esc(resumeArchetype(slug))}">${esc(libelleArchetype(slug))} ✕</button>`).join('')}</div>` : ''}
      <button type="button" class="arch-menu-b" data-act="archMenu" aria-expanded="${archOuvert}">
        <span>${archetypesFiltre().length ? `${archetypesFiltre().length} archétype(s) coché(s)` : 'Choisir un archétype…'}</span>
        <span class="chev-b">${archOuvert ? '▴' : '▾'}</span>
      </button>
      ${archOuvert ? `<div class="arch-menu" id="archPanel">
        <input type="text" id="f_archQ" data-archq placeholder="rechercher…" value="${esc(archRecherche)}" autocomplete="off">
        <div class="arch-liste">${listeArchetypesHTML()}</div>
      </div>` : ''}
      <div class="row" style="gap:6px;align-items:center;margin-top:2px">
        <button type="button" class="btn sm" data-act="chargerArch" ${ARCH_BASE.etat === 'chargement' ? 'disabled' : ''}>
          ${ARCH_BASE.liste.length ? 'Recharger la liste EDHREC' : 'Charger la liste EDHREC'}
        </button>
      </div>
      <div class="small muted">Une carte est retenue si elle relève d'au moins un archétype coché.</div>
      <div class="small muted" id="archEtat">${etatArchetypes()}</div>
    </div>
    <div class="field">
      <label class="lab">Rôle dans le deck</label>
      <div class="archetypes">
        ${Object.keys(targets()).map(r => `<button type="button" class="arch-btn" data-act="toggleRole" data-role="${esc(r)}"
          aria-pressed="${rolesFiltre().includes(r)}" title="Cartes tenant ce rôle, d'après l'analyse de leur texte">${esc(CATLABEL[r] || r)}</button>`).join('')}
      </div>
      <div class="small muted">Mêmes rôles que les jauges d'équilibre de la section Deck : les cocher ici ou là revient au même.</div>
    </div>
    <div class="field">
      <label class="lab" for="f_nom">Nom de la carte</label>
      <input type="text" id="f_nom" data-filtre="nom" value="${esc(f.nom)}" placeholder="ex. dragon, sol ring…" autocomplete="off">
    </div>
    <div class="field">
      <label class="lab" for="f_artiste">Illustrateur</label>
      <input type="text" id="f_artiste" data-filtre="artiste" value="${esc(f.artiste)}" placeholder="ex. John Avon, Rebecca Guay…" autocomplete="off">
    </div>
    <div class="filtres-grille">
      ${ligneFiltre('forceMin', 'forceMax', 'Force', "Force des créatures (le premier chiffre de 3/4).", '1', 0)}
      ${ligneFiltre('enduranceMin', 'enduranceMax', 'Endurance', "Endurance des créatures (le second chiffre de 3/4).", '1', 0)}
      ${ligneFiltre('cmcMin', 'cmcMax', 'Coût de mana', "Valeur de mana totale de la carte.", '1', 0)}
      ${ligneFiltre('prixMin', 'prixMax', 'Prix (€)', "Prix unitaire estimé, en euros.", 'any', 0)}
    </div>
    <div class="small muted">Laissez un champ vide pour ne pas l'utiliser. La recherche porte sur le nom, le type et le texte ; le champ « Nom » ne regarde que le nom. Dès qu'une borne de force ou d'endurance est posée, les cartes qui n'en ont pas (sorts, terrains) sont écartées ; de même, filtrer par illustrateur écarte les cartes dont l'illustrateur n'est pas encore connu.</div>
    <div class="small muted">Ces filtres s'ajoutent aux couleurs choisies ci-dessus ; ils valent pour la collection affichée et pour les analyses qui en découlent.</div>
    <div class="warnbox" id="filtreResume">${resumeFiltres()}</div>`;
}

let archRecherche = '';
let archOuvert = false;

/* Lignes de la liste déroulante : le nom, puis ce que fait l'archétype.
   Tous les thèmes publiés par EDHREC y figurent ; la recherche ne fait
   que resserrer l'affichage. */
function listeArchetypesHTML() {
  if (!ARCH_BASE.liste.length) {
    return `<div class="small muted" style="padding:8px 10px">${ARCH_BASE.etat === 'chargement'
      ? 'Chargement de la liste EDHREC…'
      : 'La liste vient d\'EDHREC : utilisez « Charger la liste EDHREC » ci-dessous.'}</div>`;
  }
  const choisis = new Set(archetypesFiltre());
  const q = loose(archRecherche);
  let liste = archetypesDisponibles();
  if (q) liste = liste.filter(a => loose(a.label).includes(q) || loose(a.slug).includes(q));
  liste = liste.sort((a, b) => (b.n || 0) - (a.n || 0) || a.label.localeCompare(b.label));
  if (!liste.length) return '<div class="small muted" style="padding:6px 8px">Aucun archétype à ce nom.</div>';

  return liste.map(a => {
    const coche = choisis.has(a.slug);
    const charge = ARCH_BASE.themes[a.slug];
    return `<button type="button" class="arch-row" data-act="toggleArch" data-arch="${esc(a.slug)}" aria-pressed="${coche}">
      <span class="arch-row-h"><span class="arch-row-t">${esc(a.label)}</span>
        <span class="arch-n">${a.n ? a.n.toLocaleString('fr-FR') + ' decks' : ''}${charge ? ` · ${charge.n} cartes` : ''}</span>
        <span class="arch-row-x">${coche ? '✓' : ''}</span></span>
      <span class="arch-row-d">${esc(a.aide)}</span>
    </button>`;
  }).join('');
}

/* Rafraîchit la liste proposée sans réécrire la fenêtre : la frappe
   dans le champ de recherche garde son curseur. */
function majListeArchetypes() {
  const zone = document.querySelector('#archPanel .arch-liste');
  if (zone) zone.innerHTML = listeArchetypesHTML();
}

/* État de la base d'archétypes extérieure, sous les boutons. */
function etatArchetypes() {
  if (ARCH_BASE.etat === 'chargement') return 'Chargement des thèmes EDHREC…';
  if (ARCH_BASE.etat === 'erreur') {
    const essais = (ARCH_BASE.essais || []).length
      ? `<div class="mono" style="font-size:10.5px;margin-top:4px;white-space:pre-line">${esc(ARCH_BASE.essais.join('\n'))}</div>`
      : '';
    return `EDHREC : ${esc(ARCH_BASE.erreur)}. Le texte de la carte reste lu localement.${essais}`;
  }
  if (ARCH_BASE.liste.length) {
    const date = ARCH_BASE.maj ? new Date(ARCH_BASE.maj).toLocaleDateString('fr-FR') : '';
    const charges = Object.keys(ARCH_BASE.themes).length;
    const enCours = ARCH_BASE.enCours.size;
    return `Liste établie par EDHREC : ${ARCH_BASE.liste.length.toLocaleString('fr-FR')} thème(s)${date ? `, relevés le ${date}` : ''}.
      Les cartes d'un thème sont cherchées à sa première utilisation${charges ? ` — ${charges} déjà chargé(s), ${ARCH_BASE.index.size.toLocaleString('fr-FR')} carte(s) référencées` : ''}${enCours ? ` · ${enCours} en cours…` : ''}.`;
  }
  return `Les archétypes viennent d'EDHREC. « Charger la liste EDHREC » récupère les thèmes qu'il publie — une requête
    pour la liste, puis une par thème à sa première utilisation, gardées en cache sur cet appareil.`;
}

/* Décompte des cartes retenues, rafraîchi à chaque frappe. */
function resumeFiltres() {
  const list = filtered();
  const ex = list.reduce((n, e) => n + e.qty, 0);
  const total = collectionCards();
  const actifs = filtresActifs();
  return `<b>${list.length}</b> carte(s) différentes retenues sur ${total.length} · ${ex} exemplaire(s)
    · ${actifs.length ? `${actifs.length} filtre(s) : ${esc(texteFiltresActifs())}` : 'aucun filtre actif'}`;
}

function majResumeFiltres() {
  const el = document.getElementById('filtreResume');
  if (el) el.innerHTML = resumeFiltres();
}

/* Rendu différé : la frappe reste fluide même sur une grande collection. */
function planifierRenduFiltres() {
  clearTimeout(filtreTimer);
  filtreTimer = setTimeout(() => {
    S.limitB = PAGE;
    renderAll();
    majResumeFiltres();
  }, 220);
}

/* Réécrit les champs de la fenêtre après une réinitialisation ou un
   changement de couleur, en conservant la position de défilement. */
function majFenetreFiltres() {
  const dlg = document.getElementById('dlg');
  if (!dlg || !dlg.open) return;
  const corps = document.getElementById('dlgBody');
  if (!corps || !corps.querySelector('[data-filtre]')) return;
  const y = corps.scrollTop;
  const panneau = document.getElementById('archPanel');
  const yArch = panneau ? panneau.scrollTop : 0;
  corps.innerHTML = corpsFiltres();
  corps.scrollTop = y;
  const nouveau = document.getElementById('archPanel');
  if (nouveau) nouveau.scrollTop = yArch;
}

function openFiltresModal() {
  openDialog('Filtres de la collection', corpsFiltres(),
    `<button type="button" class="btn" data-act="resetFiltres">Réinitialiser</button>
     <button type="button" class="btn pri" data-act="closeDialog">Fermer</button>`);
  const champ = document.getElementById('f_search');
  if (champ) champ.focus();
}

function renderTop() {
  const topStats = document.getElementById('topStats');
  const topHeader = document.getElementById('topHeader');
  if (topHeader) topHeader.classList.toggle('compact', !!S.headerCompact);
  if (!topStats) return;

  const dCount = deckSize(), f = fmt();
  const allCards = collectionCards();
  const cDistinct = allCards.length;
  const cCount = allCards.reduce((n, e) => n + e.qty, 0);

  const colFiltr = filtered();
  const colDistinctFiltr = colFiltr.length;
  const colTotalFiltr = colFiltr.reduce((n, e) => n + e.qty, 0);

  const catStats = statsCatalogue();
  const noeuds = noeudsActifs();
  const noeudsTxt = noeuds.length ? ` & effets (${noeuds.map(n => (typeof NODE !== 'undefined' && NODE[n] && NODE[n].label) || n).join(', ')})` : '';

  const totalDeckVal = deckEntries().reduce((a, e) => a + (e.card.price || 0) * e.qty, 0);
  const sp = spent();
  const left = S.budget.total - sp;
  const leg = legality();
  const isLegal = leg.length === 0;

  const gName = nomCombinaisonCouleurs(S.colors);

  const manaBarHTML = `
    <div class="head-colors" title="Filtre couleur actif (cliquer pour activer/désactiver une couleur)">
      <div class="head-mana-bar">
        ${COLS.map(([c, title]) => `
          <button type="button" class="mana-btn sm" data-color="${c}" aria-pressed="${S.colors.has(c)}" title="${title}">
            ${symBg(c)}
          </button>`).join('')}
      </div>
      <button type="button" class="pill head-combo" data-act="filtres" title="Combinaison active : ${esc(gName)} (cliquer pour ouvrir les filtres)">
        <b>${esc(gName)}</b>
      </button>
    </div>
  `;

  const deckPillHTML = `
    <button type="button" class="pill head-format" id="pillDeck" data-act="formatDialog" title="Format de jeu : ${esc(f.label)} (cliquer pour le changer)">Format <b>${esc(f.label)}</b> · Deck <b>${dCount}/${f.size}</b>${dCount === f.size ? (isLegal ? ' <span style="color:var(--ok)">✓</span>' : ' <span style="color:var(--warn)" title="Règles non respectées">⚠</span>') : ''}</button>
    ${S.commander ? `<button type="button" class="pill head-cmd" data-act="fiche" data-name="${esc(S.commander)}" style="cursor:pointer" title="Commandant désigné (cliquer pour voir la fiche)">Cmd <b>${esc(S.commander)}</b></button>` : ''}
  `;

  const actifs = filtresActifs();
  const filtreBtnHTML = `
    <button type="button" class="btn sm head-filtre ${actifs.length ? 'actif' : ''}" data-act="filtres"
      title="${actifs.length ? `Filtres actifs : ${esc(texteFiltresActifs())} (cliquer pour les modifier)` : 'Ajouter un filtre : recherche, type, nom, force, endurance, coût de mana ou prix'}">
      ${FILTRE_ICONE} ${actifs.length ? `Filtres <span class="filtre-n">${actifs.length}</span>` : 'Filtres'}
    </button>
  `;

  /* Tous les filtres en vigueur restent lisibles et retirables dans l'en-tête. */
  const filtreChipsHTML = actifs.length ? `
    <div class="head-filtres" role="group" aria-label="Filtres actifs">
      ${actifs.map(a => `<span class="filtre-chip" title="${esc(a.texte)}">
        <button type="button" class="chip-txt" data-act="filtres">${esc(a.texte)}</button>
        <button type="button" class="chip-x" data-act="dropFiltre" data-cles="${esc(a.cles.join(','))}" title="Retirer ce filtre" aria-label="Retirer le filtre ${esc(a.texte)}">✕</button>
      </span>`).join('')}
      <button type="button" class="btn sm" data-act="resetFiltres" title="Retirer tous les filtres">Tout effacer</button>
    </div>` : '';

  const toggleBtnHTML = `
    <button type="button" class="btn sm head-toggle ${S.headerCompact ? 'is-compact' : ''}" data-act="toggleHeader" title="${S.headerCompact ? 'Déplier l\'en-tête (afficher toutes les statistiques et actions)' : 'Réduire l\'en-tête (navigation compacte)'}" aria-pressed="${!S.headerCompact}">
      ${S.headerCompact ? '▾ Stats' : '▴ Réduire'}
    </button>
  `;

  if (S.headerCompact) {
    topStats.innerHTML = `
      ${manaBarHTML}
      ${filtreBtnHTML}
      ${filtreChipsHTML}
      ${deckPillHTML}
      ${sp > 0 ? `<button type="button" class="pill" data-act="wants" style="cursor:pointer;border-color:var(--bad);color:#e39a90" title="Cartes à acquérir : cliquer pour ouvrir la Wants list Cardmarket">À acheter <b>${eur(sp)}</b></button>` : ''}
      ${toggleBtnHTML}
    `;
  } else {
    topStats.innerHTML = `
      ${manaBarHTML}
      ${filtreBtnHTML}
      ${filtreChipsHTML}
      ${deckPillHTML}
      <span class="pill" id="pillColFiltr" title="Cartes de la collection correspondant aux filtres / Total collection">Collection <b>${colDistinctFiltr}</b> <span class="muted">(${colTotalFiltr} ex.) / ${cDistinct}</span></span>
      <span class="pill" id="pillDbFiltr" title="Cartes du catalogue Scryfall correspondant aux filtres couleur${noeudsTxt} / Total catalogue">Catalogue <b>${catStats.filtr.toLocaleString('fr-FR')}</b> <span class="muted">/ ${catStats.total.toLocaleString('fr-FR')}</span></span>
      <span class="pill" id="pillVal" title="Valeur totale estimée du deck">Valeur deck <b>${eur(totalDeckVal)}</b></span>
      ${sp > 0 ? `<button type="button" class="pill" data-act="wants" style="cursor:pointer;border-color:var(--bad);color:#e39a90" title="Cartes à acquérir : cliquer pour ouvrir la Wants list Cardmarket">À acheter <b>${eur(sp)}</b></button>` : ''}
      ${S.budget.total > 0 ? `<span class="pill" id="pillBudget" title="Budget restant">Budget <b>${eur(Math.max(0, left))}</b></span>` : ''}
      ${pillSauvegarde()}
      <button type="button" class="btn sm" data-act="toggleImages" aria-pressed="${S.images}" title="Afficher ou masquer les visuels Scryfall">Visuels</button>
      <button type="button" class="btn sm" data-act="exportDeck" title="Exporter le deck au format MTGO, CSV ou JSON">Exporter</button>
      ${toggleBtnHTML}
    `;
  }
}

function renderAll() {
  renderTop();
  renderB();
  renderC();
  renderD();
  renderE();
  renderF();
  scheduleSave();
}

function exportDeckModal() {
  const entries = deckEntries();
  const f = fmt();
  const date = new Date().toISOString().slice(0, 10);
  const nomFichier = `deck-${(S.commander || S.format || 'export').toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${date}`;
  const txt = entries.map(e => `${e.qty} ${e.card.name}`).join('\n');
  const csv = 'Quantity,Name,Mana Cost,Type,Price EUR\n' +
    entries.map(e => `${e.qty},"${e.card.name.replace(/"/g,'""')}","${e.card.mana}","${e.card.type}",${e.card.price}`).join('\n');
  const json = JSON.stringify({
    format: S.format,
    commander: S.commander,
    taille: deckSize(),
    date: new Date().toISOString(),
    deck: entries.map(e => ({name:e.card.name, qty:e.qty, mana:e.card.mana, type:e.card.type, price:e.card.price}))
  }, null, 2);

  openDialog('Exporter le deck',
    `<div class="row" style="margin-bottom:8px">
       <span class="pill">Format <b>${f.label}</b></span>
       ${S.commander ? `<span class="pill">Commandant <b>${esc(S.commander)}</b></span>` : ''}
       <span class="pill"><b>${deckSize()}</b> cartes</span>
       <span class="pill">Valeur <b>${eur(entries.reduce((a,e)=>a+e.card.price*e.qty,0))}</b></span>
     </div>
     <div class="field"><label class="lab">Format d'export</label>
       <div class="seg" id="expSeg">
         <button data-exp="txt" aria-pressed="true">Texte MTGO (.txt)</button>
         <button data-exp="csv" aria-pressed="false">Tableur CSV</button>
         <button data-exp="json" aria-pressed="false">JSON</button>
       </div>
     </div>
     <textarea id="expArea" readonly style="height:220px;margin-top:8px">${esc(txt)}</textarea>`,
    `<button class="btn" id="expCopy">Copier dans le presse-papier</button>
     <button class="btn pri" id="expDl">Télécharger le fichier</button>
     <button class="btn" value="ok">Fermer</button>`);

  let mode = 'txt';
  const data = () => mode === 'txt' ? txt : (mode === 'csv' ? csv : json);
  const ext = () => mode === 'txt' ? 'txt' : (mode === 'csv' ? 'csv' : 'json');
  const mime = () => mode === 'txt' ? 'text/plain;charset=utf-8' : (mode === 'csv' ? 'text/csv;charset=utf-8' : 'application/json;charset=utf-8');

  const expSeg = document.getElementById('expSeg');
  if (expSeg) expSeg.addEventListener('click', ev => {
    const b = ev.target.closest('button[data-exp]'); if (!b) return;
    mode = b.dataset.exp;
    expSeg.querySelectorAll('button').forEach(x => x.setAttribute('aria-pressed', x === b));
    const area = document.getElementById('expArea');
    if (area) area.value = data();
  });

  const expCopy = document.getElementById('expCopy');
  if (expCopy) expCopy.onclick = () => {
    navigator.clipboard.writeText(data()).then(() => toast('Deck copié dans le presse-papier.'));
  };

  const expDl = document.getElementById('expDl');
  if (expDl) expDl.onclick = () => {
    const blob = new Blob([data()], {type:mime()});
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `${nomFichier}.${ext()}`;
    a.click();
    URL.revokeObjectURL(a.href);
  };
}

function openWantsModal() {
  const buys = aAcheter();
  if (!buys.length) { toast('Aucune carte à acheter : toutes les cartes du deck sont déjà dans votre collection.'); return; }
  const total = buys.reduce((t, l) => t + l.total, 0);
  const nb = buys.reduce((n, l) => n + l.qty, 0);
  const txt = buys.map(l => `${l.qty} ${l.card.name}`).join('\n');

  openDialog('Liste d\'achats Cardmarket (Wants)',
    `<div class="row" style="margin-bottom:8px">
       <span class="pill"><b>${nb}</b> exemplaire(s)</span>
       <span class="pill"><b>${buys.length}</b> carte(s) différentes</span>
       <span class="pill">Estimation <b>${eur(total)}</b></span>
     </div>
     <p class="small muted">Copiez cette liste et collez-la directement dans une Wants List sur Cardmarket, ou utilisez le lien direct de chaque carte.</p>
     <textarea id="wantsArea" readonly style="height:180px">${esc(txt)}</textarea>
     <div class="small muted" style="margin-top:6px">Format reconnu : « 1 Sol Ring » (une carte par ligne).</div>`,
    `<button class="btn" id="wantsCopy">Copier la liste</button>
     <a class="btn pri" href="https://www.cardmarket.com/fr/Magic/Wants" target="_blank" rel="noopener">Ouvrir Cardmarket Wants ↗</a>
     <button class="btn" value="ok">Fermer</button>`);

  const wantsCopy = document.getElementById('wantsCopy');
  if (wantsCopy) wantsCopy.onclick = () => {
    navigator.clipboard.writeText(txt).then(() => toast('Liste copiée dans le presse-papier.'));
  };
}

function openWipeModal() {
  openDialog('Vider la collection',
    `<p class="small">Cette action effacera toutes les cartes de votre collection. Le deck sera également vidé.</p>
     <p class="small muted">Pensez à faire une sauvegarde avant si vous souhaitez conserver vos listes.</p>`,
    `<button class="btn" value="cancel">Annuler</button>
     <button class="btn danger" id="confirmWipe" value="ok">Oui, tout effacer</button>`);

  const confirmWipe = document.getElementById('confirmWipe');
  if (confirmWipe) confirmWipe.onclick = () => {
    S.collection.clear();
    S.deck.clear();
    S.commander = null;
    S.selected = null;
    closeDialog();
    renderAll();
    toast('Collection et deck effacés.');
  };
}
