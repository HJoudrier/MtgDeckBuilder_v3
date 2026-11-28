/* =====================================================================
   js/fenVersions.js — La fenêtre des versions synchronisées

   Deux écrans dans la même fenêtre : la **liste** des révisions que Dropbox
   garde du fichier, avec leur date et leur poids, puis l'**aperçu** de l'une
   d'elles — ce qu'elle contient, placé en face de ce que cet appareil porte
   maintenant. Rien n'agit avant le bouton « Restaurer cette version » du
   second : choisir une ligne ne fait que lire.
   ===================================================================== */

/* Une date qu'on lit d'un coup d'œil : « samedi 28 novembre 2026 à 14:03 ».
   Dropbox donne l'instant de l'écriture, que le fuseau de cet appareil traduit. */
function nuageVersionDate(t) {
  if (!t) return 'date inconnue';
  const d = new Date(t);
  return `${d.toLocaleDateString('fr-FR', {weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'})} à `
    + d.toLocaleTimeString('fr-FR', {hour: '2-digit', minute: '2-digit'});
}

function nuageVersionsEtat() {
  if (!NUAGE_VERS.msg) return '';
  const mal = NUAGE_VERS.etat === 'erreur';
  return `<div class="${mal ? 'warnbox' : 'small muted'}">${esc(NUAGE_VERS.msg)}</div>
    ${NUAGE_VERS.detail ? `<div class="nuage-detail">${esc(NUAGE_VERS.detail)}</div>` : ''}`;
}

/* Une ligne : la date, le poids, et ce qui la distingue — la plus récente est
   celle que l'autre appareil lira, celle de notre dernier accord est celle
   qu'on a soi-même vue passer. */
function nuageVersionLigne(v, i) {
  const marques = [];
  if (i === 0) marques.push('version actuelle');
  if (v.rev === NUAGE.rev && i !== 0) marques.push('dernier accord de cet appareil');
  return `<div class="row" style="gap:10px;align-items:center;justify-content:space-between;padding:6px 0;border-bottom:1px solid var(--line)">
    <div>
      <div>${esc(nuageVersionDate(v.date))}</div>
      <div class="small muted">${esc(nuagePoids(v.taille))}${marques.length ? ' · ' + esc(marques.join(' · ')) : ''}</div>
    </div>
    ${i === 0 ? '' : `<button type="button" class="btn sm" data-act="nuageVersionVoir" data-rev="${esc(v.rev)}"
      ${NUAGE.enCours ? 'disabled' : ''}>Voir…</button>`}
  </div>`;
}

function nuageVersionsListe() {
  const l = NUAGE_VERS.liste;
  const lignes = l.length
    ? l.map(nuageVersionLigne).join('')
    : (NUAGE_VERS.etat === 'ok' ? '<div class="small muted">Aucune version n\'est encore gardée chez Dropbox.</div>' : '');
  return `<div class="small muted">Chaque synchronisation qui envoie quelque chose laisse une version chez
      Dropbox, gardée trente jours (cent quatre-vingts sur une offre professionnelle). Restaurer en fait
      la version la plus récente, <b>sans effacer les autres</b> : on peut revenir sur un retour.</div>
    ${NUAGE_VERS.note ? `<div class="warnbox">${esc(NUAGE_VERS.note)}</div>` : ''}
    ${NUAGE_VERS.alerte ? `<div class="warnbox">${esc(NUAGE_VERS.alerte)}</div>` : ''}
    ${nuageVersionsEtat()}
    <div style="margin-top:8px">${lignes}</div>`;
}

/* Les nombres d'une version face à ceux d'ici. Un écart saute ainsi aux yeux
   avant le clic : trois cents cartes de moins n'ont pas besoin d'un commentaire. */
function nuageVersionComparaison(ap) {
  const a = nuageResume(ap.paquet), ici = nuageResume(nuagePaquet(NUAGE.appareil));
  const nb = n => n.toLocaleString('fr-FR');
  const decks = a.decks.length
    ? a.decks.slice(0, 12).map(d => `<div class="puce">${esc(d.nom)} <span class="muted">— ${nb(d.cartes)} carte${d.cartes > 1 ? 's' : ''}</span></div>`).join('')
      + (a.decks.length > 12 ? `<div class="small muted">…et ${a.decks.length - 12} autre${a.decks.length - 12 > 1 ? 's' : ''}.</div>` : '')
    : '<div class="small muted">aucun deck</div>';
  return `<div class="small">Écrite par « <b>${esc(a.par || 'appareil inconnu')}</b> »
      · ${esc(nuagePoids(ap.octets))}</div>
    <div style="margin-top:8px"><b>Collection</b> : ${nb(a.cartes)} carte${a.cartes > 1 ? 's' : ''} différente${a.cartes > 1 ? 's' : ''},
      ${nb(a.exemplaires)} exemplaire${a.exemplaires > 1 ? 's' : ''}
      <span class="muted">— ici maintenant : ${nb(ici.cartes)} et ${nb(ici.exemplaires)}</span></div>
    <div style="margin-top:6px"><b>Decks</b> : ${a.decks.length}
      <span class="muted">— ici maintenant : ${ici.decks.length}</span></div>
    ${decks}
    <div class="warnbox">Cet appareil prendra le contenu de cette version, puis l'enverra chez Dropbox
      comme la plus récente. Ce que cet appareil avait de plus neuf est d'abord synchronisé, donc
      <b>retrouvable</b> dans la liste. L'autre appareil la recevra à sa prochaine synchronisation.
      Sont concernés la collection, les acquisitions en cours, les decks et les préférences d'achat ;
      la vue de chaque appareil, elle, ne bouge pas.</div>`;
}

function nuageVersionsApercu() {
  const ap = NUAGE_VERS.apercu;
  return `<div class="small muted">Version du</div>
    <h4 style="margin:0 0 6px;font-family:var(--display)">${esc(nuageVersionDate(ap.date))}</h4>
    ${nuageVersionComparaison(ap)}
    ${nuageVersionsEtat()}`;
}

function corpsVersions() {
  const lecture = NUAGE_VERS.etat === 'marche' && !NUAGE_VERS.apercu && !NUAGE_VERS.liste.length;
  return `<div id="blocVersions">${NUAGE_VERS.apercu ? nuageVersionsApercu()
    : lecture ? nuageVersionsEtat() : nuageVersionsListe()}</div>`;
}

function piedVersions() {
  const ap = NUAGE_VERS.apercu;
  const occupe = NUAGE_VERS.etat === 'marche' || NUAGE.enCours;
  if (ap) return `<button type="button" class="btn" data-act="nuageVersionsRetour" ${occupe ? 'disabled' : ''}>Retour à la liste</button>
    <button type="button" class="btn pri" data-act="nuageVersionRestaurer" data-rev="${esc(ap.rev)}"
      ${occupe ? 'disabled' : ''}>Restaurer cette version</button>`;
  return `<button type="button" class="btn" data-act="nuageVersionsParametres">Retour aux paramètres</button>
    <button type="button" class="btn" data-act="nuageVersionsActualiser" ${occupe ? 'disabled' : ''}>Actualiser</button>`;
}

/* Réécrit la fenêtre sur place si c'est bien elle qui est ouverte : une
   lecture qui aboutit après qu'on a fermé la fenêtre, ou ouvert une autre,
   n'a rien à repeindre. */
function majFenetreVersions() {
  const corps = document.getElementById('dlgBody');
  if (!corps || !document.getElementById('blocVersions')) return;
  const y = corps.scrollTop;
  corps.innerHTML = corpsVersions();
  corps.scrollTop = y;
  const pied = document.getElementById('dlgFoot');
  if (pied) pied.innerHTML = piedVersions();
}

function openVersionsModal() {
  NUAGE_VERS.apercu = null;
  NUAGE_VERS.note = '';
  NUAGE_VERS.alerte = '';
  NUAGE_VERS.liste = [];
  NUAGE_VERS.etat = 'marche';
  NUAGE_VERS.msg = "Lecture de l'historique…";
  openDialog('Versions synchronisées', corpsVersions(), piedVersions(), true);
  nuageVersionsCharge();
}
