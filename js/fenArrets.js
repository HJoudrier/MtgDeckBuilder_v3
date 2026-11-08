/* =====================================================================
   js/fenArrets.js — Les arrêts de la table

   Où la table doit-elle s'arrêter pour vous demander si vous voulez agir ?
   Une case par étape, à votre tour et à celui des autres, plus « toujours
   quand un adversaire pose quelque chose sur la pile » (toujours vrai) et le
   contrôle total. Fenêtre à « Appliquer » : les cases vont au brouillon.
   ===================================================================== */

const ETAPES_ARRET = ['entretien', 'pioche', 'principale1', 'debutCombat', 'attaquants', 'bloqueurs', 'degats', 'principale2', 'fin'];

function corpsArrets() {
  return avecBrouillon(() => {
    const A = {...arretsParDefaut(), ...S.arrets};
    const ligne = e => `<tr><td>${esc(NOMS_ETAPES[e] || e)}</td>
      <td><input type="checkbox" data-arret="moi:${e}" ${A.moi[e] ? 'checked' : ''}></td>
      <td><input type="checkbox" data-arret="eux:${e}" ${A.eux[e] ? 'checked' : ''}></td></tr>`;
    return `<table class="tbl"><thead><tr><th>Étape</th><th>Mon tour</th><th>Tour des autres</th></tr></thead>
      <tbody>${ETAPES_ARRET.map(ligne).join('')}</tbody></table>
      <label class="small"><input type="checkbox" data-arret="pileSoi" ${A.pileSoi ? 'checked' : ''}> M'arrêter aussi sur mes propres sorts</label><br>
      <label class="small"><input type="checkbox" data-arret="controleTotal" ${A.controleTotal ? 'checked' : ''}> Contrôle total : m'arrêter à chaque priorité où je peux agir</label>
      <div class="small muted">La table s'arrête toujours quand un adversaire pose un sort ou une capacité sur la pile, et ne s'arrête jamais quand vous n'avez rien à jouer.</div>`;
  });
}

function ouvreArrets() {
  openDialog('Arrêts', corpsArrets(), `<button type="button" class="btn" data-act="tArretsDefaut">Par défaut</button>
    <button type="button" class="btn" data-act="closeDialog">Annuler</button>
    <button type="button" class="btn pri" data-act="tAppliquerArrets">Appliquer</button>`);
  ouvreBrouillon(['arrets'], () => { const b = document.getElementById('dlgBody'); if (b) b.innerHTML = corpsArrets(); });
}

/* Une case cochée : au brouillon. */
function caseArret(t) {
  modifieBrouillon(() => {
    const A = {...arretsParDefaut(), ...S.arrets};
    const [cle, etape] = t.dataset.arret.split(':');
    if (etape) A[cle] = {...A[cle], [etape]: t.checked}; else A[cle] = t.checked;
    S.arrets = A;
  });
}

function arretsDefaut() {
  modifieBrouillon(() => { S.arrets = arretsParDefaut(); });
  if (brouillon && brouillon.redessine) brouillon.redessine();
}

function appliqueArrets() {
  verseBrouillon();
  closeDialog();
  scheduleSave();
  majArretsTable();
  if (TABLE.role === 'invite' && typeof envoieArrets === 'function') envoieArrets();
}
