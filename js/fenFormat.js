/* =====================================================================
   js/fenFormat.js — Fenêtre « Format »

   Ouverte depuis la pastille de l'en-tête : le format de jeu, les paliers
   Commander et la légalité. Les couleurs, elles, se règlent dans les filtres.
   ===================================================================== */

function resumeFormat() {
  const f = fmt();
  return `${f.size} cartes · max ${f.maxCopies >= 99 ? 'illimité' : f.maxCopies} ex. · ${f.commander ? 'commandant obligatoire' : 'sans commandant'}`;
}

function majResumeFormat() {
  const el = document.getElementById('formatResume');
  if (el) el.textContent = avecBrouillon(resumeFormat);
}

function corpsFormat() {
  /* Sous le brouillon, comme la fenêtre des filtres : le panneau
     « Personnalisé » surgit dès qu'on choisit ce format, avant d'appliquer. */
  return avecBrouillon(() => `<div class="field">
      <label class="lab" for="fmtSel">Format de jeu</label>
      <select id="fmtSel" data-act="format">
        ${Object.entries(FORMATS).map(([k, v]) => `<option value="${k}" ${S.format === k ? 'selected' : ''}>${esc(v.label)}</option>`).join('')}
      </select>
      <div class="small muted" id="formatResume">${resumeFormat()}</div>
    </div>
    <div class="field">
      <label style="display:flex;align-items:center;gap:8px;font-size:13.5px;color:var(--txt);cursor:${fmt().legal ? 'pointer' : 'default'};opacity:${fmt().legal ? 1 : .5}">
        <input type="checkbox" data-act="filtreLegal" ${S.filtreLegal ? 'checked' : ''} ${fmt().legal ? '' : 'disabled'}
          style="width:auto;margin:0">
        Écarter les cartes non légales dans ce format
      </label>
      <div class="small muted">${fmt().legal
        ? `Cochée, les cartes qui n'ont pas le droit d'être jouées en ${esc(fmt().label)} sont retirées de la collection affichée et ne sont plus proposées. Décochée, elles réapparaissent et portent un tag « illégal ». Une carte déjà posée dans le deck reste visible dans les deux cas, pour que vous puissiez la retirer.`
        : `${esc(fmt().label)} n'impose aucune légalité de format : ce réglage y reste sans effet.`}</div>
    </div>
    ${customPanel()}
    <div class="small muted">Le format fixe la taille du deck, le nombre d'exemplaires autorisés et la présence d'un commandant ; il sert aussi au contrôle de conformité de la section Deck.</div>`);
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
    `<button type="button" class="btn" data-act="closeDialog">Annuler</button>
     <button type="button" class="btn pri" data-act="appliquerFormat">Appliquer</button>
     ${zoneProgression()}`);
  /* Après `openDialog`, qui remet le brouillon à zéro. */
  ouvreBrouillon(['format', 'custom', 'filtreLegal'], majFenetreFormat);
}

