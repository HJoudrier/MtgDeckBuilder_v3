/* =====================================================================
   js/anaVuePalier.js — Le bloc du palier : l'échelle, les critères, les combos

   L'échelle des cinq paliers d'abord, le palier estimé allumé ; puis chaque
   critère avec ce qu'il compte et le plancher qu'il impose, pour que le
   verdict se lise comme une addition et non comme un oracle. Hors du
   Commander, les paliers n'ont pas de sens et le bloc le dit en une ligne.
   ===================================================================== */

function anaEchellePaliers(P) {
  return `<div class="ana-echelle" role="list">${[1, 2, 3, 4, 5].map(i => {
    const actif = i === P.palier || (i === 1 && P.palier === 2 && !P.raisons.length) || (i === 5 && P.competitif);
    return `<div class="ana-palier${actif ? ' actif' : ''}" role="listitem" title="${esc(PALIERS[i].aide)}">
      <b>${i}</b><span>${PALIERS[i].nom}</span><span class="muted">${PALIERS[i].anglais}</span></div>`;
  }).join('')}</div>`;
}

function anaLignePlancher(c) {
  if (c.plancher === null) return '<span class="muted">inconnu</span>';
  const col = c.plancher >= 4 ? 'var(--bad)' : (c.plancher === 3 ? 'var(--warn)' : 'var(--ok)');
  return `<span class="ana-badge" style="--ana-verdict:${col}">${c.plancher <= 2 ? '1–2' : c.plancher}</span>`;
}

function anaPalierVue(P) {
  if (!fmt().commander) {
    return '<div class="small muted">Les paliers (« brackets ») ne valent que pour le Commander : choisissez ce format par la pastille « Format » de l\'en-tête pour estimer celui du deck.</div>';
  }
  const raison = P.raisons.length
    ? `Imposé par : ${P.raisons.map(c => `${c.label.toLowerCase()} (${c.n})`).join(', ')}.`
    : 'Aucun critère ne dépasse le palier 2 : la frontière entre 1 et 2 tient à l\'intention du deck, qu\'aucune liste ne dit.';
  const lignes = P.crit.map(c => `<tr>
      <td>${esc(c.label)}<div class="small muted">${esc(c.regle)}</div></td>
      <td class="mono">${c.inconnu ? '?' : c.n}</td>
      <td>${anaLignePlancher(c)}</td>
      <td class="ana-cartes">${c.inconnu ? '<span class="muted">liste non chargée (réseau)</span>'
        : (c.cle === 'combos' ? (c.combos.length ? c.combos.map(x => `${anaNom(x.a)} + ${anaNom(x.b)} <span class="muted">— ${esc(x.effet)}, ${x.cout} mana</span>`).join('<br>') : '<span class="muted">aucun reconnu</span>')
          : anaNoms(c.cartes, 8))}</td>
    </tr>`).join('');
  return `${anaEchellePaliers(P)}
    <div class="ana-verdict">
      <div><b>Palier ${P.palier === 2 && !P.raisons.length ? '1 ou 2' : P.palier}</b> — ${PALIERS[P.palier].nom}
        <span class="muted">(${PALIERS[P.palier].anglais})</span></div>
      <div class="small">${esc(PALIERS[P.palier].aide)} ${esc(raison)}</div>
      ${P.competitif ? `<div class="small" style="margin-top:4px"><b>Profil proche du palier 5</b> : ${esc(P.signaux.join(', '))}. Le cEDH tient surtout au méta qu'on vise.</div>`
        : (P.signaux.length ? `<div class="small muted" style="margin-top:4px">Signaux de puissance : ${esc(P.signaux.join(', '))}.</div>` : '')}
    </div>
    <div class="scroll"><table class="tbl ana-tbl">
      <thead><tr><th>Critère</th><th>Nombre</th><th>Palier</th><th>Cartes</th></tr></thead>
      <tbody>${lignes}</tbody>
    </table></div>
    <div class="ana-deux">
      <div><h4 class="ana-h4">Mana rapide <span class="muted small">(0 ou 1 mana)</span></h4><div class="small">${anaNoms(P.rapides, 10)}</div></div>
      <div><h4 class="ana-h4">Sorts gratuits</h4><div class="small">${anaNoms(P.gratuits, 10)}</div></div>
    </div>
    <div class="small muted" style="margin-top:8px">Estimation d'après les critères que Wizards publie pour les paliers.
      Les combos sont ceux d'une liste de ${COMBOS_DEUX_CARTES.length} paires connues : un combo absent de la liste n'est pas
      exclu. Un combo dont les deux pièces coûtent six mana ou moins est réputé pouvoir gagner tôt.</div>`;
}
