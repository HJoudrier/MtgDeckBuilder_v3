/* =====================================================================
   js/fenAdversaire.js — Ajouter ou modifier un adversaire

   Un nom, un format, une liste collée — ou le lien d'un deck publié sur
   Moxfield ou Archidekt, que l'atelier relira chaque jour
   (js/decksLies.js). Rien n'est rangé avant « Enregistrer » ; pendant la
   frappe, la fenêtre dit seulement ce qu'elle lit.

   Quand le site refuse d'être lu, la fenêtre reste ouverte et propose le
   dernier recours : ouvrir le deck sur le site, copier son export, le
   coller ici. Le lien est gardé, et la prochaine vérification réessaiera.
   ===================================================================== */

/* Ce que la fenêtre ouverte sait : la liste qu'elle montrait en s'ouvrant
   (pour savoir si l'on en a collé une autre), et l'échec d'une lecture. */
let FEN_ADV = {cle: null, texteInitial: '', echec: null};

/* Le bloc du dernier recours : pourquoi la lecture a échoué, où trouver
   l'export. */
function repliHTML(lien, echec) {
  const site = SITES_DECKS[lien.site];
  return `<div class="sim-repli">
    <div class="small"><b>Lecture impossible</b> : ${esc(echec.message || 'le site ne répond pas')}.</div>
    <div class="small muted">Ouvrez le deck sur ${site.nom}, exportez-le en texte (« Export », puis copier la liste au format
      MTGO ou Arena), collez-le ci-dessous et enregistrez : le lien est gardé, et la vérification du lendemain réessaiera.
      Un relais, réglé sous la liste des adversaires, permet de s'en passer.</div>
    <a class="btn sm" href="${esc(lien.url)}" target="_blank" rel="noopener">Ouvrir le deck sur ${site.nom}</a>
  </div>`;
}

/* Ce qu'on sait d'un lien : son site, sa dernière vérification, son
   dernier changement. */
function etatLienHTML(l) {
  const ch = l.dernierChangement;
  return `${SITES_DECKS[l.site].nom} · ${depuisQuand(l.verifie)}${l.etat && l.etat !== 'ok' ? ' · <b>synchro impossible</b>' : ''}
    ${ch ? ` · dernier changement le ${new Date(ch.date).toLocaleDateString('fr-FR')} : +${ch.plus} −${ch.moins}` : ''}`;
}

function ouvreAdversaire(cle, opts = {}) {
  const a = cle ? S.adversaires[cle] : null;
  const formats = Object.keys(FORMATS).map(k => [k, FORMATS[k].label]);
  const l = a && a.lien;
  FEN_ADV = {cle, texteInitial: a ? a.texte || '' : '', echec: opts.collage && l ? {genre: l.etat, message: l.erreur} : null};
  openDialog(a ? 'Modifier un adversaire' : 'Ajouter un adversaire', `
    <div class="row" style="gap:10px;margin-bottom:8px">
      <label class="sim-champ">Nom <input type="text" id="advNom" value="${esc(a ? a.nom : '')}" placeholder="Burn mono-rouge"></label>
      <label class="sim-champ">Format <select id="advFormat" data-advformat>${optionsHTML(formats, a ? a.format : 'edh')}</select></label>
    </div>
    <label class="sim-champ sim-champ-large">Lien Moxfield ou Archidekt (facultatif) — l'adversaire suivra les changements du deck
      <input type="url" id="advLien" value="${esc(l ? l.url : '')}" placeholder="https://www.moxfield.com/decks/…"></label>
    ${l ? `<div class="small muted" style="margin-bottom:6px">${etatLienHTML(l)}</div>` : ''}
    <div id="advRepli">${FEN_ADV.echec ? repliHTML(l, FEN_ADV.echec) : ''}</div>
    <textarea id="advTexte" data-advtexte rows="12" class="sim-texte" placeholder="Commander&#10;1 Krenko, Mob Boss&#10;&#10;Deck&#10;1 Sol Ring&#10;30 Mountain">${esc(FEN_ADV.texteInitial)}</textarea>
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
  if (!adv.liste.length && !adv.commandants.length) { z.textContent = 'Collez une liste — une carte par ligne, précédée de sa quantité —, ou donnez le lien du deck.'; return; }
  const r = resolutionAdversaire(adv);
  z.innerHTML = `${nbCartesAdversaire(adv)} carte(s)${adv.commandants.length ? ` · commandant : <b>${esc(adv.commandants.join(', '))}</b>` : ''}
    ${r.manquants.length ? ` · ${r.manquants.length} que l'atelier ne connaît pas encore et demandera à Scryfall` : ' · toutes connues'}`;
}

/* L'adversaire tel que la fenêtre le décrit : lu sur le site quand on a
   donné un lien sans coller de liste, sinon tiré de la liste collée. Rend
   `null` si la fenêtre doit rester ouverte. */
async function adversaireDeLaFenetre(cle) {
  const nom = document.getElementById('advNom').value, texte = document.getElementById('advTexte').value;
  const format = document.getElementById('advFormat').value, saisi = document.getElementById('advLien').value.trim();
  const lien = saisi ? lisLienDeck(saisi) : null;
  if (saisi && !lien) { toast('Ce lien n\'est ni un deck Moxfield ni un deck Archidekt.'); return null; }
  const ancien = cle ? S.adversaires[cle] : null;
  const memeLien = !!(lien && ancien && ancien.lien && ancien.lien.site === lien.site && ancien.lien.id === lien.id);
  const colle = texte.trim() && texte !== FEN_ADV.texteInitial;
  if (lien && !colle && !FEN_ADV.echec) {
    document.getElementById('advApercu').textContent = `Lecture du deck sur ${SITES_DECKS[lien.site].nom}…`;
    try {
      const d = await recupereDeckLie(lien);
      return {nom: nom.trim() || d.nom || 'Adversaire', format: d.commandants.length ? 'edh' : (format === 'edh' ? 'standard' : format),
        liste: d.liste, commandants: d.commandants, texte: texteDeListe(d.liste, d.commandants), maj: Date.now(),
        lien: {...(memeLien ? ancien.lien : {}), ...lien, maj: d.maj, etat: 'ok', erreur: null, verifie: Date.now()}};
    } catch (e) {
      FEN_ADV.echec = {genre: e.genre || 'reseau', message: e.message};
      document.getElementById('advRepli').innerHTML = repliHTML(lien, FEN_ADV.echec);
      majApercuAdversaire();
      return null;
    }
  }
  const adv = adversaireDepuisTexte(nom, texte, format);
  if (!adv.liste.length) { toast('La liste ne contient aucune carte.'); return null; }
  if (lien) adv.lien = {...(memeLien ? ancien.lien : {}), ...lien, manuel: Date.now(),
    verifie: memeLien ? ancien.lien.verifie : Date.now(),
    etat: FEN_ADV.echec ? FEN_ADV.echec.genre : (memeLien ? ancien.lien.etat : 'ok'),
    erreur: FEN_ADV.echec ? FEN_ADV.echec.message : (memeLien ? ancien.lien.erreur : null)};
  return adv;
}

async function enregistreAdversaireFenetre(cle) {
  const adv = await adversaireDeLaFenetre(cle);
  if (!adv) return;
  const ancien = cle && S.adversaires[cle] ? {liste: S.adversaires[cle].liste, commandants: S.adversaires[cle].commandants} : null;
  const k = enregistreAdversaire(adv, cle || null);
  if (!S.simulation.sieges.includes(k)) {
    const libre = configSimulation().sieges.findIndex(x => !x);
    if (libre >= 0) S.simulation.sieges[libre] = k;
  }
  const diff = ancien ? diffListes(ancien, adv) : null;
  if (diff && adv.lien && (diff.plus || diff.moins))
    S.adversaires[k].lien.dernierChangement = {plus: diff.plus, moins: diff.moins, date: Date.now(), details: diff.details.slice(0, 20)};
  closeDialog();
  scheduleSave();
  renderK();
  const restes = await completeAdversaire(k);
  COUV_TABLE.cle = null;
  renderK();
  toast(restes.length ? `${restes.length} carte(s) introuvable(s) : ${restes.slice(0, 4).join(', ')}${restes.length > 4 ? '…' : ''}`
    : diff && (diff.plus || diff.moins) ? `« ${S.adversaires[k].nom} » mis à jour (+${diff.plus} −${diff.moins}).`
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
