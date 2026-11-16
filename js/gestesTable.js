/* =====================================================================
   js/gestesTable.js — Les gestes de la table interactive

   Le salon, la partie, les arrêts : branchés sur l'aiguillage unique de
   js/app.js, comme tous les gestes de l'atelier.
   ===================================================================== */

function gestesTable(act, b) {
  const i = b && b.dataset.i != null ? +b.dataset.i : null;
  switch (act) {
    case 'tOuvrirSalon': ouvreSalon(); return true;
    case 'tAjoutIA': ajouteSiegeIA(); return true;
    case 'tSupprSiege': retireSiege(i); return true;
    case 'tCommencer': commenceDepuisSalon(); return true;
    case 'tQuitter': quitteTable(); return true;
    case 'tCarte': TABLE.loupe = null; clicCarte(+b.dataset.id); return true;
    case 'tJoueur': clicJoueur(+b.dataset.j); return true;
    case 'tAction': TABLE.loupe = null; repondsTable(i); return true;
    case 'tUn': repondsTable(i); return true;
    case 'tChoix': { const q = TABLE.question; if (q) basculeChoix(q, selDe(q), i); return true; }
    case 'tValider': valideTable(); return true;
    case 'tPasserTour': passeTour(); return true;
    case 'tDef': if (TABLE.question) { selDe(TABLE.question).def = i; renduTable(); } return true;
    case 'tAttTous': attaqueTous(); return true;
    case 'tAttAucun': if (TABLE.question) { selDe(TABLE.question).paires.clear(); renduTable(); } return true;
    case 'tRetirePaire': if (TABLE.question) { selDe(TABLE.question).paires.delete(i); renduTable(); } return true;
    case 'tFermeLoupe': TABLE.loupe = null; renduTable(); return true;
    case 'tZone': TABLE.zone = {j: +b.dataset.j, z: b.dataset.z}; renduTable(); return true;
    case 'tFermeZone': TABLE.zone = null; renduTable(); return true;
    case 'tMenu': TABLE.menu = true; renduTable(); return true;
    case 'tFermeMenu': TABLE.menu = null; renduTable(); return true;
    case 'tQuitterDemande': TABLE.menu = 'quitter'; renduTable(); return true;
    case 'tDisposition': choisitDisposition(b.dataset.d); return true;
    case 'tVitesse': if (VITESSES[b.dataset.d]) { S.table.vitesse = b.dataset.d; scheduleSave(); renduTable(); } return true;
    case 'tPage': montrePage(i); return true;
    case 'tDeplie': TABLE.deplie = TABLE.deplie === +b.dataset.j ? null : +b.dataset.j; renduTable(); return true;
    case 'tJournal': ouvreJournalTable(); return true;
    case 'tArrets': TABLE.menu = null; renduTable(); ouvreArrets(); return true;
    case 'tArretsDefaut': arretsDefaut(); return true;
    case 'tAppliquerArrets': appliqueArrets(); return true;
    case 'tAjoutInvite': ajouteInvite(); return true;
    case 'tRelier': relieCode(b.dataset.cle); return true;
    case 'tReprise': repriseInvite(b.dataset.cle); return true;
    case 'tConfier': confieInvite(b.dataset.cle); return true;
    case 'tRejoindre': ouvreRejoindre(null); return true;
    case 'tPret': pret(); return true;
    case 'tLienOffre': lienOffreColle(); return true;
    case 'tReprendre': reprendTable(); return true;
  }
  return false;
}

/* Une disposition choisie au menu : retenue pour les parties suivantes. */
function choisitDisposition(d) {
  if (!DISPOSITIONS[d]) return;
  S.table.disposition = d;
  TABLE.menu = null;
  scheduleSave();
  renduTable();
}

/* « Passer jusqu'à mon tour », sur l'hôte comme depuis un invité. */
function passeTour() {
  if (TABLE.menu) { TABLE.menu = null; renduTable(); }
  if (TABLE.role === 'hote') passeJusquaMonTour(TABLE.moi);
  else if (typeof envoiePasseTour === 'function') envoiePasseTour();
}

/* Le journal de la partie en cours, en grand. */
function ouvreJournalTable() {
  const lignes = journalTableLignes();
  openDialog('Journal de la partie', `<div class="sim-journal">${lignes.map(l => /^— Tour/.test(l.txt)
    ? `<div class="sim-journal-titre">${esc(l.txt)}</div>`
    : `<div class="small"><span class="muted mono">${esc(NOMS_ETAPES[l.e] || l.e || '')}</span> ${esc(l.txt)}</div>`).join('')}</div>`, null, true);
  const j = document.querySelector('#dlgBody .sim-journal');
  if (j) j.scrollTop = j.scrollHeight;
}
