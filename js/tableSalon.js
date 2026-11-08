/* =====================================================================
   js/tableSalon.js — Le salon : qui s'assoit à la table, avec quel deck

   Avant la partie, l'hôte choisit son nom et son deck, puis les autres
   sièges : un joueur automatique avec un deck de « Mes decks » ou de la
   bibliothèque d'adversaires, ou un invité qui rejoindra par QR code avec un
   deck de sa propre application (js/tableLiaison.js). Le salon se souvient
   de la dernière table (`S.table`), qu'on rejoue souvent telle quelle.
   ===================================================================== */

function sourcesDeDecks() {
  return [...clesDecks().map(k => ['d:' + k, S.decks[k].nom]),
    ...Object.keys(S.adversaires).map(k => ['a:' + k, S.adversaires[k].nom + ' (adversaire)'])];
}

function nomDeSource(src) {
  const [g, k] = String(src || '').split(':');
  return g === 'a' ? (S.adversaires[k] || {}).nom : (S.decks[k] || {}).nom;
}

/* Les sièges du salon, tels que `commenceTable()` les attend. */
function siegesDuSalon() {
  const t = S.table;
  const moi = {mode: 'moi', nom: t.nom || 'Moi', deck: 'd:' + (S.decks[t.deck] ? t.deck : S.deckActif)};
  const autres = t.sieges.map(s => s.mode === 'distant' ? (TABLE.distants && TABLE.distants[s.cle]) || {mode: 'distant', nom: 'Invité', attendu: true}
    : {mode: 'ia', nom: nomDeSource(s.deck) || 'Automate', deck: s.deck});
  return [moi, ...autres];
}

function salonHTML() {
  const t = S.table, sources = sourcesDeDecks();
  const siegeHTML = (s, i) => {
    if (s.mode === 'distant') return typeof siegeDistantHTML === 'function' ? siegeDistantHTML(s, i) : '';
    return `<div class="sim-ligne"><span class="pill">joueur automatique</span>
      <select data-tsalon="deck" data-i="${i}">${optionsHTML(sources, s.deck)}</select>
      <span class="sim-gestes"><button type="button" class="btn sm" data-act="tSupprSiege" data-i="${i}">Retirer</button></span></div>`;
  };
  const pret = t.sieges.length >= 1 && t.sieges.length <= 5 && t.sieges.every(s => s.mode !== 'distant' || (TABLE.distants && TABLE.distants[s.cle] && TABLE.distants[s.cle].fiches));
  return `<div class="tb-salon">
    <div class="row"><h2 style="margin:0">Nouvelle partie</h2>
      <button type="button" class="btn sm" data-act="tQuitter" style="margin-left:auto">Fermer</button></div>
    <div class="sim-bloc">
      <label class="sim-champ">Votre nom <input type="text" data-tsalon="nom" value="${esc(t.nom || '')}" placeholder="Moi"></label>
      <label class="sim-champ">Votre deck <select data-tsalon="monDeck">${optionsHTML(clesDecks().map(k => [k, S.decks[k].nom]), S.decks[t.deck] ? t.deck : S.deckActif)}</select></label>
    </div>
    <div class="sim-bloc"><h3>Les autres sièges</h3>
      <div class="sim-liste">${t.sieges.map(siegeHTML).join('') || '<div class="small muted">Personne encore.</div>'}</div>
      <div class="row" style="margin-top:8px">
        <button type="button" class="btn sm" data-act="tAjoutIA" ${t.sieges.length >= 5 ? 'disabled' : ''}>+ Joueur automatique</button>
        ${typeof siegeDistantHTML === 'function' ? `<button type="button" class="btn sm" data-act="tAjoutInvite" ${t.sieges.length >= 5 ? 'disabled' : ''}>+ Invité (QR code)</button>` : ''}
      </div>
    </div>
    ${t.sieges.some(s => s.mode === 'distant') && !adressePublique() ? `<div class="sim-bloc small">Cet atelier est ouvert depuis un fichier :
      les téléphones ne peuvent pas l'ouvrir. Donnez l'adresse où il est publié (GitHub Pages, par exemple) — sinon, les invités
      lisent le QR depuis leur atelier, bouton « Rejoindre une table ».
      <input type="url" data-tsalon="adresse" value="${esc(t.adresse || '')}" placeholder="https://…github.io/MtgDeckBuilder_v3/" class="tb-code"></div>` : ''}
    <div class="row"><button type="button" class="btn pri" data-act="tCommencer" ${pret ? '' : 'disabled'}>Commencer la partie</button>
      <span class="small muted">De deux à six joueurs. Chacun garde les points de vie de son format.</span></div>
  </div>`;
}

const ETATS_INVITE = {preparation: 'préparation…', attente: 'en attente de sa réponse', connexion: 'connexion…',
  relie: 'relié, choisit son deck…', pret: 'prêt', absent: 'ne répond plus', perdu: 'liaison perdue'};

/* Le siège d'un invité au salon : son QR tant qu'il n'a pas répondu, puis
   son nom et son deck. */
function siegeDistantHTML(e, i) {
  const s = TABLE.distants[e.cle];
  if (!s) return '';
  const qr = s.etat === 'attente' && s.paquet ? qrSVG(qrEcrit(texteOffre(s)), 'QR à scanner par l\'invité') : '';
  const deck = s.fiches ? ` · ${esc(s.fiches.nom)} (${s.fiches.cartes.reduce((t, [, n]) => t + n, 0) + s.fiches.commandants.length} cartes)` : '';
  return `<div class="sim-ligne tb-invite"><span class="pill">invité</span> <b>${esc(s.nom)}</b>
    <span class="small muted">${esc(ETATS_INVITE[s.etat] || s.etat)}${deck}</span>
    <span class="sim-gestes"><button type="button" class="btn sm" data-act="tSupprSiege" data-i="${i}">Retirer</button></span>
    ${qr ? `<div class="tb-qr-bloc">${qr}
      <div class="small">1. L'invité vise ce QR avec l'appareil photo de son téléphone — ou, dans son atelier, « Rejoindre une table ».<br>
        2. Il choisit son deck, puis présente le QR qui s'affiche chez lui à la caméra de cet appareil.<br>
        Sans caméra : <input type="text" data-tsalon="code" data-cle="${esc(e.cle)}" placeholder="code affiché chez l'invité" class="tb-code">
        <button type="button" class="btn sm" data-act="tRelier" data-cle="${esc(e.cle)}">Relier</button></div></div>` : ''}
  </div>`;
}

/* Pendant la partie, chez l'hôte : les invités qui ne répondent plus. */
function alertesInvitesHTML() {
  if (TABLE.role !== 'hote') return '';
  return Object.values(TABLE.distants).filter(s => (s.etat === 'perdu' || s.etat === 'absent' || s.etat === 'attente') && TABLE.sieges.includes(s)).map(s =>
    `<div class="tb-alerte small"><b>${esc(s.nom)}</b> — ${esc(ETATS_INVITE[s.etat])}${s.confie ? ' · joué par l\'automate' : ''}
      ${s.etat === 'attente' && s.paquet ? `<div class="tb-qr-bloc">${qrSVG(qrEcrit(texteOffre(s)))}<span>QR de reprise : à scanner par ${esc(s.nom)}.</span></div>` : ''}
      <button type="button" class="btn sm" data-act="tReprise" data-cle="${esc(s.cle)}">QR de reprise</button>
      ${s.confie ? '' : `<button type="button" class="btn sm" data-act="tConfier" data-cle="${esc(s.cle)}">Confier à l'automate</button>`}</div>`).join('');
}

function ouvreSalon() {
  if (!S.table.sieges.length) S.table.sieges = [{mode: 'ia', deck: sourcesDeDecks().map(x => x[0]).find(k => k.startsWith('a:')) || 'd:' + S.deckActif}];
  Object.assign(TABLE, {ouverte: true, phase: 'salon', role: 'hote'});
  renduTable();
}

function reglageSalon(t) {
  const c = t.dataset.tsalon;
  if (c === 'nom') S.table.nom = t.value.trim();
  else if (c === 'monDeck') S.table.deck = t.value;
  else if (c === 'deck') S.table.sieges[+t.dataset.i].deck = t.value;
  else if (c === 'adresse') S.table.adresse = t.value.trim();
  else if (c === 'code') return;
  else if (typeof reglageInvite === 'function' && reglageInvite(c, t)) return;
  scheduleSave();
  renduTable();
}

function ajouteSiegeIA() {
  if (S.table.sieges.length >= 5) return;
  S.table.sieges.push({mode: 'ia', deck: sourcesDeDecks()[0][0]});
  scheduleSave();
  renduTable();
}

function retireSiege(i) {
  const s = S.table.sieges[i];
  if (s && s.mode === 'distant' && typeof oublieDistant === 'function') oublieDistant(s.cle);
  S.table.sieges.splice(i, 1);
  scheduleSave();
  renduTable();
}

function commenceDepuisSalon() {
  TABLE.sieges = siegesDuSalon();
  commenceTable();
}
