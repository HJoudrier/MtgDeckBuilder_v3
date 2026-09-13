/* =====================================================================
   js/gestesNuage.js — Les gestes de la synchronisation

   Sixième maillon de l'aiguillage pour les clics, et une branche pour les
   champs de la section — la fenêtre des paramètres n'a pas de « Appliquer »
   pour eux, ils agissent sur place.
   ===================================================================== */

function gestesNuage(act, b) {
  if (act === 'nuageConnecter') {
    /* Se connecter quitte la page : ce qui attendait les sept cents
       millisecondes de `scheduleSave()` serait perdu en route. */
    save();
    const champ = document.getElementById('nuageCle');
    const cle = (NUAGE_DBX_CLE || (champ && champ.value.trim()) || NUAGE.appKey || '').trim();
    if (!cle) { toast("Renseignez d'abord la clé de l'application Dropbox."); return true; }
    if (location.protocol === 'file:') {
      toast("Impossible depuis un fichier local : Dropbox ne peut pas revenir sur une adresse file://.");
      return true;
    }
    dbxConnexion(cle).catch(err => {
      NUAGE.etat = 'erreur';
      NUAGE.msg = err.message || 'échec de la connexion';
      majFenetreParametres();
      toast('Connexion impossible : ' + NUAGE.msg);
    });
    return true;
  }

  if (act === 'nuageMaintenant') {
    nuageSynchro(true);
    return true;
  }

  if (act === 'nuageTester') {
    nuageDiagnostic();
    return true;
  }

  if (act === 'nuageDeconnecter') {
    openDialog('Déconnecter la synchronisation',
      `<p class="small">Cet appareil cessera de suivre le dossier Dropbox. <b>Rien n'est effacé</b> :
        ni la collection d'ici, ni le fichier de là-bas — l'autre appareil continue comme avant.</p>
       <p class="small muted">Vous pourrez reconnecter à tout moment ; la fusion repartira alors
        d'une comparaison à deux côtés, et signalera les écarts au lieu de les trancher seule.</p>`,
      `<button type="button" class="btn" data-act="closeDialog">Annuler</button>
       <button type="button" class="btn danger" data-act="nuageDeconnecterOk">Déconnecter</button>`);
    return true;
  }

  if (act === 'nuageDeconnecterOk') {
    nuageDeconnecte();
    closeDialog();
    openParametresModal();
    toast('Synchronisation déconnectée.');
    return true;
  }

  return false;
}

/* Les trois champs de la section. Rendu `true`, l'écouteur `change` d'`app.js`
   s'arrête là. */
function gestesNuageChange(t) {
  if (t.dataset.act === 'nuageCle') {
    NUAGE.appKey = t.value.trim();
    nuageEcrire();
    /* Le repeint est différé d'un tour de boucle : réécrire le corps de la
       fenêtre pendant qu'un champ texte est encore en train de perdre le focus
       fait lever `innerHTML` par le navigateur — « the node to be removed is no
       longer a child of this node » — et le repeint est alors perdu. */
    setTimeout(majFenetreParametres, 0);
    return true;
  }

  if (t.dataset.act === 'nuageNom') {
    const nom = t.value.trim();
    NUAGE.appareil = nom || nuageNomParDefaut();
    nuageEcrire();
    return true;
  }

  if (t.dataset.act === 'nuageAuto') {
    NUAGE.auto = !!t.checked;
    nuageEcrire();
    if (NUAGE.auto) nuageSynchro(false);
    return true;
  }

  return false;
}
