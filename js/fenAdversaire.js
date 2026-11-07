/* =====================================================================
   js/fenAdversaire.js — Ajouter ou modifier un adversaire

   Un nom, un format, une liste collée. Rien n'est rangé avant
   « Enregistrer » ; pendant la frappe, la fenêtre dit seulement ce qu'elle
   lit — combien de cartes, quel commandant, combien que l'atelier ne
   connaît pas encore et qu'il demandera à Scryfall.
   ===================================================================== */

function ouvreAdversaire(cle) {
  const a = cle ? S.adversaires[cle] : null;
  const formats = Object.keys(FORMATS).map(k => [k, FORMATS[k].label]);
  openDialog(a ? 'Modifier un adversaire' : 'Ajouter un adversaire', `
    <div class="row" style="gap:10px;margin-bottom:8px">
      <label class="sim-champ">Nom <input type="text" id="advNom" value="${esc(a ? a.nom : '')}" placeholder="Burn mono-rouge"></label>
      <label class="sim-champ">Format <select id="advFormat" data-advformat>${optionsHTML(formats, a ? a.format : 'edh')}</select></label>
    </div>
    <textarea id="advTexte" data-advtexte rows="14" class="sim-texte" placeholder="Commander&#10;1 Krenko, Mob Boss&#10;&#10;Deck&#10;1 Sol Ring&#10;30 Mountain">${esc(a ? a.texte || '' : '')}</textarea>
    <div class="small muted" id="advApercu" style="margin-top:6px"></div>`,
    `<button type="button" class="btn" data-act="closeDialog">Annuler</button>
     <button type="button" class="btn pri" data-act="simEnregistrerAdv" data-adv="${esc(cle || '')}">Enregistrer</button>`, true);
  majApercuAdversaire();
}

/* Ce que la liste collée donne, à mesure qu'on la colle. */
function majApercuAdversaire() {
  const t = document.getElementById('advTexte'), z = document.getElementById('advApercu');
  if (!t || !z) return;
  const adv = adversaireDepuisTexte('', t.value, document.getElementById('advFormat').value);
  if (!adv.liste.length && !adv.commandants.length) { z.textContent = 'Collez une liste : une carte par ligne, précédée de sa quantité.'; return; }
  const r = resolutionAdversaire(adv);
  z.innerHTML = `${nbCartesAdversaire(adv)} carte(s)${adv.commandants.length ? ` · commandant : <b>${esc(adv.commandants.join(', '))}</b>` : ''}
    ${r.manquants.length ? ` · ${r.manquants.length} que l'atelier ne connaît pas encore et demandera à Scryfall` : ' · toutes connues'}`;
}

async function enregistreAdversaireFenetre(cle) {
  const nom = document.getElementById('advNom').value, texte = document.getElementById('advTexte').value;
  const adv = adversaireDepuisTexte(nom, texte, document.getElementById('advFormat').value);
  if (!adv.liste.length) { toast('La liste ne contient aucune carte.'); return; }
  const k = enregistreAdversaire(adv, cle || null);
  if (!S.simulation.sieges.includes(k)) {
    const libre = configSimulation().sieges.findIndex(x => !x);
    if (libre >= 0) S.simulation.sieges[libre] = k;
  }
  closeDialog();
  scheduleSave();
  renderK();
  const restes = await completeAdversaire(k);
  COUV_TABLE.cle = null;
  renderK();
  toast(restes.length ? `${restes.length} carte(s) introuvable(s) : ${restes.slice(0, 4).join(', ')}${restes.length > 4 ? '…' : ''}`
    : `Adversaire « ${S.adversaires[k].nom} » prêt.`);
}

function supprimeAdversaire(cle) {
  const a = S.adversaires[cle];
  if (!a) return;
  openDialog('Supprimer un adversaire', `<p>Supprimer « ${esc(a.nom)} » de la bibliothèque ? Les lots déjà joués contre lui restent dans l'historique.</p>`,
    `<button type="button" class="btn" data-act="closeDialog">Annuler</button>
     <button type="button" class="btn danger" data-act="simSupprAdvOui" data-adv="${esc(cle)}">Supprimer</button>`);
}

function supprimeAdversaireOui(cle) {
  delete S.adversaires[cle];
  S.simulation.sieges = S.simulation.sieges.map(k => k === cle ? '' : k);
  closeDialog();
  scheduleSave();
  renderK();
}
