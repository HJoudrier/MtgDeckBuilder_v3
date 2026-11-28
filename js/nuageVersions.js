/* =====================================================================
   js/nuageVersions.js — Revenir à une version d'hier

   Dropbox garde chaque écriture du fichier comme une révision. L'atelier n'en
   tient aucune copie : l'historique est celui de Dropbox, lu à la demande, et
   rien ne se déclenche avant le bouton « Restaurer » de l'aperçu.

   **Restaurer ne réécrit pas l'histoire, il en ajoute une page.** La version
   choisie devient une nouvelle révision, la plus récente ; celle qu'elle
   remplace reste dans la liste, et on peut donc revenir sur un retour. Avant
   de verser, on rattrape un tour de synchronisation ordinaire — tirer,
   fusionner, verser, pousser — pour que ce que cet appareil avait de non
   envoyé figure dans la révision remplacée, et ne soit pas perdu avec elle.

   **L'autre appareil la reçoit comme n'importe quel accord.** Sa base de
   fusion dit ce qu'il avait ; la version restaurée dit ce qui est là-bas ; un
   écart sans modification locale se règle donc de lui-même, et un écart sur
   une carte qu'il a aussi touchée est nommé dans la fenêtre, comme d'habitude.
   ===================================================================== */

const NUAGE_VERS = {
  etat: 'repos',
  msg: '',
  detail: '',
  liste: [],
  /* La version dont on a lu le contenu pour la montrer : {rev, date, paquet, octets}. */
  apercu: null,
  /* Un mot après une restauration, montré au-dessus de la liste rechargée. */
  note: '',
  /* Ce qui a échoué en restaurant : la liste est rechargée par-dessus, et
     sans cette trace l'erreur disparaîtrait avec l'écran qui la portait. */
  alerte: ''
};

/* La permission qu'un jeton accordé avant qu'on la coche ne porte pas : on le
   dit en toutes lettres, avec le remède, plutôt qu'un « 401 » sans issue. */
const NUAGE_VERS_PORTEE = "Dropbox n'a pas donné à cet appareil la permission de lister les versions "
  + "(files.metadata.read). Dans la console de l'application, onglet « Permissions », cochez-la puis "
  + "« Submit » ; déconnectez ensuite cet appareil et reconnectez-le — un jeton garde les permissions "
  + "qu'il avait à sa création.";

function nuageVersMsg(err) {
  return err.portee ? NUAGE_VERS_PORTEE : (err.message || 'échec');
}

/* La liste, du plus récent au plus ancien. */
async function nuageVersionsCharge() {
  NUAGE_VERS.etat = 'marche';
  NUAGE_VERS.msg = 'Lecture de l\'historique…';
  NUAGE_VERS.detail = '';
  majFenetreVersions();
  try {
    NUAGE_VERS.liste = await dbxVersions(NUAGE.chemin);
    NUAGE_VERS.etat = 'ok';
    NUAGE_VERS.msg = '';
  } catch(err) {
    NUAGE_VERS.liste = [];
    NUAGE_VERS.etat = 'erreur';
    NUAGE_VERS.msg = nuageVersMsg(err);
    NUAGE_VERS.detail = err.portee ? '' : (err.detail || '');
  }
  majFenetreVersions();
}

/* Ce qu'un paquet contient, en quelques nombres qu'on puisse comparer à
   l'état d'ici : sans eux, « restaurer » demande de choisir sur une date
   seule. Le même relevé sert aux deux côtés, d'où la forme du paquet. */
function nuageResume(paquet) {
  const f = (paquet && paquet.fond) || {};
  const col = Array.isArray(f.collection) ? f.collection : [];
  const decks = Array.isArray(f.decks) ? f.decks : [];
  return {
    cartes: col.length,
    exemplaires: col.reduce((t, e) => t + (Array.isArray(e) ? (e[1] || 0) : 0), 0),
    decks: decks.filter(d => d && typeof d === 'object').map(d => ({
      nom: d.nom || 'Sans nom',
      cartes: (Array.isArray(d.deck) ? d.deck : []).reduce((t, e) => t + (Array.isArray(e) ? (e[1] || 0) : 0), 0)
    })),
    par: (paquet && paquet.par) || '',
    maj: (paquet && paquet.maj) || 0
  };
}

/* Lire une version pour la montrer. Elle est gardée en mémoire : c'est
   exactement ce qui sera restauré si l'on confirme, et non une seconde
   lecture qu'une écriture venue entre-temps aurait pu changer. */
async function nuageVersionVoir(rev) {
  const v = NUAGE_VERS.liste.find(o => o.rev === rev);
  if (!v || NUAGE.enCours) return;
  NUAGE_VERS.apercu = null;
  NUAGE_VERS.etat = 'marche';
  NUAGE_VERS.msg = 'Lecture de cette version…';
  NUAGE_VERS.detail = '';
  NUAGE_VERS.note = '';
  NUAGE_VERS.alerte = '';
  majFenetreVersions();
  try {
    const d = await dbxLire('rev:' + rev);
    if (!d) throw new Error("cette version n'existe plus chez Dropbox");
    NUAGE_VERS.apercu = {rev, date: v.date, paquet: d.paquet, octets: d.octets};
    NUAGE_VERS.etat = 'ok';
    NUAGE_VERS.msg = '';
  } catch(err) {
    NUAGE_VERS.etat = 'erreur';
    NUAGE_VERS.msg = nuageVersMsg(err);
    NUAGE_VERS.detail = err.detail || '';
  }
  majFenetreVersions();
}

function nuageVersionsRetour() {
  NUAGE_VERS.apercu = null;
  NUAGE_VERS.note = '';
  NUAGE_VERS.alerte = '';
  if (NUAGE_VERS.etat !== 'ok') NUAGE_VERS.etat = 'repos';
  majFenetreVersions();
  if (!NUAGE_VERS.liste.length) nuageVersionsCharge();
}

/* Restaurer la version montrée : rattraper, verser, pousser — dans cet ordre,
   comme tout tour. Si la poussée échoue après le versement, cet appareil garde
   la version restaurée et le dit : « Synchroniser maintenant » finira l'envoi,
   la base de fusion voyant dans ce retour une modification d'ici. */
async function nuageVersionRestaure(rev) {
  const ap = NUAGE_VERS.apercu;
  if (!ap || ap.rev !== rev || NUAGE.enCours || !nuageConnecte()) return;
  NUAGE.enCours = true;
  NUAGE.etat = 'marche';
  NUAGE.msg = 'Restauration d\'une ancienne version…';
  NUAGE_VERS.etat = 'marche';
  NUAGE_VERS.msg = 'Mise à jour de cet appareil, puis restauration…';
  NUAGE_VERS.detail = '';
  NUAGE_VERS.alerte = '';
  majFenetreVersions();

  let verse = false;
  try {
    await nuageTour(false);

    const ancre = releveAncre();
    nuageVerse(ap.paquet);
    save();
    renderAll();
    restaureAncre(ancre);
    verse = true;

    const local = nuagePaquet(NUAGE.appareil);
    const octets = await nuageEmballe(local);
    const ecrit = await dbxEcrire(NUAGE.chemin, octets, NUAGE.rev);
    NUAGE.rev = ecrit.rev;
    NUAGE.octets = ecrit.octets;
    NUAGE.dernier = Date.now();
    NUAGE.dernierPar = NUAGE.appareil;
    NUAGE.conflits = [];
    nuageEcrire();
    await nuageBaseEcrire(local.fond);

    const quand = nuageVersionDate(ap.date);
    NUAGE.etat = 'ok';
    NUAGE.msg = `Version du ${quand} restaurée.`;
    NUAGE.detail = '';
    NUAGE_VERS.note = `Version du ${quand} restaurée. L'autre appareil la recevra à sa prochaine synchronisation.`;
    toast(NUAGE.msg);
  } catch(err) {
    NUAGE.etat = 'erreur';
    NUAGE.detail = err.detail || '';
    NUAGE.msg = verse
      ? (err.conflit
        ? "Version restaurée ici, mais l'autre appareil a écrit entre-temps : « Synchroniser maintenant » fusionnera les deux."
        : `Version restaurée ici, mais l'envoi a échoué (${nuageVersMsg(err)}) : « Synchroniser maintenant » le reprendra.`)
      : `Restauration impossible, rien n'a changé : ${nuageVersMsg(err)}`;
    NUAGE_VERS.note = '';
    NUAGE_VERS.alerte = NUAGE.msg;
    toast(NUAGE.msg);
    if (err.jetonMort) {
      NUAGE.jeton = ''; NUAGE.rafraichir = '';
      nuageEcrire();
    }
  } finally {
    NUAGE.enCours = false;
  }
  NUAGE_VERS.apercu = null;
  NUAGE_VERS.etat = 'repos';
  await nuageVersionsCharge();
}
