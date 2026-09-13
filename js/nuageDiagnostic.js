/* =====================================================================
   js/nuageDiagnostic.js — Éprouver la connexion, étape par étape

   « La synchronisation a échoué » ne se répare pas : un tour touche le jeton,
   le compte, la lecture et l'écriture, et chacun échoue pour des raisons
   différentes — une permission oubliée dans la console Dropbox se voit à
   l'écriture seule, un jeton révoqué dès la première étape.

   Ce diagnostic les fait dans l'ordre et **poursuit après un refus** : que la
   lecture échoue pendant que l'écriture passe désigne une permission accordée
   à moitié, ce qu'un arrêt au premier échec aurait caché. Seul un jeton mort
   interrompt tout, les étapes suivantes n'ayant alors plus de sens. Chaque
   refus rend la phrase entière de Dropbox plutôt que son résumé tronqué.

   Le fichier témoin déposé est effacé aussitôt, et porte un nom qui ne peut
   pas heurter celui des données.
   ===================================================================== */

const NUAGE_TEMOIN = '/atelier-essai-connexion.txt';

/* Une étape : son nom, et ce qu'elle a donné. L'erreur porte déjà son détail
   (`dbxErreur`) ; on n'y ajoute que ce que l'étape savait d'elle-même. */
async function nuageEtape(nom, faire) {
  try {
    const dit = await faire();
    return {nom, ok: true, dit: dit || 'réussi'};
  } catch(err) {
    return {nom, ok: false, dit: err.message || String(err),
            detail: err.detail || (err.reseau ? 'aucune réponse : barrière CORS ou réseau' : '')};
  }
}

/* Supprimer le témoin. C'est une étape à part : elle demande la même
   permission d'écriture que le dépôt, et son échec isolé dirait que
   `files.content.write` a été accordée à moitié. */
async function nuageEffaceTemoin() {
  const r = await dbxAppel(`${DBX_API}/files/delete_v2`,
    {'Content-Type': 'application/json'}, JSON.stringify({path: NUAGE_TEMOIN}));
  const j = await dbxJson(r);
  if (!r.ok) throw dbxErreur(r, j, 'suppression du témoin');
  return 'témoin effacé';
}

async function nuageDiagnostic() {
  const etapes = [];
  etapes.push(await nuageEtape('Jeton d\'accès', async () => {
    await dbxJetonValide();
    const reste = Math.round((NUAGE.expire - Date.now()) / 60000);
    return `valide encore ${reste} min${NUAGE.rafraichir ? ', renouvelable' : ', sans renouvellement'}`;
  }));

  if (etapes[0].ok) {
    etapes.push(await nuageEtape('Compte', async () => {
      const nom = await dbxCompte();
      NUAGE.compte = nom;
      nuageEcrire();
      return nom || 'compte joint';
    }));

    etapes.push(await nuageEtape(`Lecture de ${NUAGE.chemin}`, async () => {
      const d = await dbxLire(NUAGE.chemin);
      return d ? `fichier lu, ${nuagePoids(d.octets)}, rev ${d.rev}`
               : 'aucun fichier encore déposé (ce qui est normal avant le premier accord)';
    }));

    etapes.push(await nuageEtape('Écriture d\'un fichier témoin', async () => {
      const octets = new TextEncoder().encode('essai ' + new Date().toISOString());
      const e = await dbxEcrire(NUAGE_TEMOIN, octets, '');
      return `témoin déposé, rev ${e.rev}`;
    }));

    /* Si le témoin existait déjà — un diagnostic interrompu la fois d'avant —,
       sa création est refusée en conflit : on l'efface tout de même. */
    if (etapes[3].ok || /conflict/.test(etapes[3].dit))
      etapes.push(await nuageEtape('Suppression du témoin', nuageEffaceTemoin));
  }

  const rate = etapes.find(e => !e.ok);
  NUAGE.etat = rate ? 'erreur' : 'ok';
  NUAGE.msg = rate ? `${rate.nom} : ${rate.dit}` : 'Connexion éprouvée de bout en bout.';
  NUAGE.detail = etapes.map(e => `${e.ok ? '✓' : '✗'} ${e.nom} — ${e.dit}`
    + (e.detail ? '\n' + e.detail.split('\n').map(l => '    ' + l).join('\n') : '')).join('\n');
  majFenetreParametres();
  toast(rate ? `Échec à l'étape « ${rate.nom} ».` : 'Connexion Dropbox éprouvée : tout répond.');
}
