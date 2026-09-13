/* =====================================================================
   js/fenNuage.js — La section « Synchronisation » de la fenêtre des paramètres

   Elle agit au clic, comme le reste de cette fenêtre hormis les deux réglages
   du catalogue : se connecter, tirer, pousser, se déconnecter sont des actes,
   pas des réglages qu'on ajuste avant de valider.

   Elle dit trois choses, dans cet ordre : où en est-on, ce qui s'est passé au
   dernier accord, et ce qui reste en désaccord. La troisième est la seule qui
   compte vraiment — une fusion silencieuse qui tranche à votre place est une
   perte de données polie.
   ===================================================================== */

/* « il y a trois minutes » se lit mieux qu'un horodatage quand on vient de
   cliquer, et une date quand cela remonte à hier. */
function nuageQuand(t) {
  if (!t) return 'jamais';
  const s = Math.round((Date.now() - t) / 1000);
  if (s < 60) return "à l'instant";
  if (s < 3600) return `il y a ${Math.round(s / 60)} min`;
  const d = new Date(t);
  const aujourdhui = new Date().toDateString() === d.toDateString();
  const heure = d.toLocaleTimeString('fr-FR', {hour: '2-digit', minute: '2-digit'});
  return aujourdhui ? `aujourd'hui à ${heure}` : `le ${d.toLocaleDateString('fr-FR')} à ${heure}`;
}

const NUAGE_LISTES = {collection: 'collection', deck: 'deck', sideboard: 'réserve', considering: 'étude'};
const NUAGE_CHAMPS = {commander: 'commandant', format: 'format', custom: 'format personnalisé',
  budget: 'budget', ciblesRoles: 'objectifs par rôle'};

/* Les désaccords que la fusion n'a pas pu trancher seule. On les nomme : la
   carte, ce que chaque appareil en disait, et ce qui a été retenu. Sans cette
   liste, « synchronisé » serait un mot qui cache une décision. */
function nuageConflits() {
  if (!NUAGE.conflits.length) return '';
  const lignes = NUAGE.conflits.slice(0, 10).map(c => c.nom
    ? `<div class="puce">${esc(c.nom)} <span class="muted">(${esc(NUAGE_LISTES[c.liste] || c.liste)})</span> :
        ici ${c.local}, là-bas ${c.distant} — retenu <b>${c.retenu}</b></div>`
    : `<div class="puce">${esc(NUAGE_CHAMPS[c.champ] || c.champ)} : les deux appareils en donnaient
        un différent — celui de cet appareil est conservé</div>`);
  const reste = NUAGE.conflits.length - 10;
  return `<div class="warnbox">
    <b>${NUAGE.conflits.length} désaccord${NUAGE.conflits.length > 1 ? 's' : ''} au dernier accord.</b>
    La quantité la plus grande a été retenue, et rien n'a été perdu — mais vérifiez ces cartes.
    ${lignes.join('')}
    ${reste > 0 ? `<div class="small muted">…et ${reste} autre${reste > 1 ? 's' : ''}.</div>` : ''}
  </div>`;
}

/* L'état en une ligne, avec sa pastille. */
function nuageEtatLigne() {
  const teintes = {repos: 'muted', marche: '', ok: 'ok-txt', erreur: 'bad-txt'};
  const mots = {repos: 'au repos', marche: 'synchronisation en cours…', ok: 'à jour', erreur: 'en échec'};
  const cls = teintes[NUAGE.etat] || 'muted';
  return `<div class="small"><span class="${cls === 'muted' ? 'muted' : ''}"
    style="${cls === 'ok-txt' ? 'color:var(--ok-txt)' : cls === 'bad-txt' ? 'color:var(--bad-txt)' : ''}">
    ${esc(mots[NUAGE.etat] || NUAGE.etat)}</span>${NUAGE.msg ? ` — ${esc(NUAGE.msg)}` : ''}</div>`;
}

/* Ce que Dropbox a répondu mot pour mot, quand il a refusé. Sélectionnable :
   c'est cette phrase-là qu'on recopie pour comprendre, et un résumé tronqué en
   « other/… » n'apprend rien à personne. */
function nuageDetail() {
  if (!NUAGE.detail) return '';
  return `<div class="nuage-detail">${esc(NUAGE.detail)}</div>`;
}

/* Sans origine http, la connexion est impossible : Dropbox n'accepte de
   revenir que sur une adresse qu'il a pu enregistrer, et `file://` n'en est
   pas une. On le dit avant le bouton plutôt que de laisser l'utilisateur
   buter sur une erreur réseau. */
function nuageAvertissementOrigine() {
  if (location.protocol !== 'file:') return '';
  return `<div class="warnbox">
    <b>L'atelier est ouvert en fichier local.</b> La connexion à Dropbox demande une adresse
    <code>http</code>, qu'il puisse enregistrer comme adresse de retour. Deux façons :
    <div class="puce">publier l'atelier sur GitHub Pages, et l'ouvrir par son adresse — le même
      atelier à jour sur tous vos PC, sans rien recopier ;</div>
    <div class="puce">ou lancer <code>python3 -m http.server 8123</code> à la racine du projet, puis
      ouvrir <code>http://localhost:8123/</code>.</div>
    Tout le reste de l'atelier fonctionne sans cela.
  </div>`;
}

/* Non connecté : la clé de l'application, et de quoi la créer. La clé n'est
   demandée que si le code n'en porte pas (`NUAGE_DBX_CLE`) — une fois
   inscrite là, les deux appareils n'ont plus qu'à cliquer. */
function nuageCorpsDeconnecte() {
  const cle = NUAGE.appKey || '';
  return `${nuageAvertissementOrigine()}
    <div class="small muted">Vos données ne passent par aucun serveur de l'atelier : elles vont de
      ce navigateur au dossier d'application de votre Dropbox, et en reviennent. L'atelier ne voit
      rien d'autre de votre Dropbox que ce dossier.</div>
    ${NUAGE_DBX_CLE ? '' : `<div class="field">
      <label class="lab" for="nuageCle">Clé de l'application Dropbox</label>
      <input id="nuageCle" type="text" value="${esc(cle)}" data-act="nuageCle"
             placeholder="abcdef1234567890" autocomplete="off" spellcheck="false">
      <div class="small muted">À créer une fois sur <code>dropbox.com/developers/apps</code> :
        « Create app » → API « Scoped access » → accès « App folder » → un nom. Dans l'onglet
        « Permissions », cocher <code>files.content.read</code> et <code>files.content.write</code>.
        Dans « Settings », ajouter comme <i>Redirect URI</i> exactement :
        <code>${esc(location.origin + location.pathname.replace(/index\.html$/, ''))}</code>.
        La clé (« App key ») n'est pas un secret : le flux employé n'en utilise aucun.</div>
    </div>`}
    <div class="row" style="gap:6px;margin-top:6px">
      <button type="button" class="btn sm pri" data-act="nuageConnecter"
        ${(NUAGE_DBX_CLE || cle) ? '' : 'disabled'}>Connecter cet appareil à Dropbox</button>
    </div>`;
}

/* Connecté : qui, quand, combien, et les gestes. */
function nuageCorpsConnecte() {
  return `<div class="small">Compte : <b>${esc(NUAGE.compte || 'connecté')}</b></div>
    <div class="field">
      <label class="lab" for="nuageNom">Nom de cet appareil</label>
      <input id="nuageNom" type="text" value="${esc(NUAGE.appareil)}" data-act="nuageNom"
             style="width:220px" autocomplete="off">
      <div class="small muted">Il sert à dire quel appareil a écrit en dernier, et à nommer les
        désaccords. Donnez-en un différent sur chaque PC.</div>
    </div>
    ${nuageEtatLigne()}
    <div class="small muted">Dernier accord : ${esc(nuageQuand(NUAGE.dernier))}${
      NUAGE.dernierPar && NUAGE.dernierPar !== NUAGE.appareil
        ? `, écrit par « ${esc(NUAGE.dernierPar)} »` : ''}${
      NUAGE.octets ? ` · ${esc(nuagePoids(NUAGE.octets))}` : ''}</div>
    ${nuageDetail()}
    ${nuageConflits()}
    <label class="row small" style="gap:8px;margin-top:6px">
      <input type="checkbox" id="nuageAuto" ${NUAGE.auto ? 'checked' : ''} data-act="nuageAuto">
      Synchroniser toute seule
    </label>
    <div class="small muted">À l'ouverture, au retour sur l'onglet, et au plus une fois toutes les
      quinze secondes après un changement. Décochée, seul le bouton ci-dessous agit.</div>
    <div class="row" style="gap:6px;margin-top:6px">
      <button type="button" class="btn sm pri" data-act="nuageMaintenant"
        ${NUAGE.enCours ? 'disabled' : ''}>Synchroniser maintenant</button>
      <button type="button" class="btn sm" data-act="nuageTester"
        ${NUAGE.enCours ? 'disabled' : ''}>Tester la connexion</button>
      <button type="button" class="btn sm danger" data-act="nuageDeconnecter">Déconnecter</button>
    </div>
    <div class="small muted">« Tester » éprouve le jeton, le compte, la lecture puis l'écriture, et
      s'arrête au premier refus en rendant la réponse entière de Dropbox — un échec de synchronisation
      ne dit pas, à lui seul, laquelle des quatre a cédé.</div>
    <div class="small muted">Déconnecter n'efface rien, ni ici ni chez Dropbox : cet appareil cesse
      simplement de suivre.</div>`;
}

function corpsNuage() {
  return `<div id="blocNuage">${nuageConnecte() ? nuageCorpsConnecte() : nuageCorpsDeconnecte()}</div>`;
}
