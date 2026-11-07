/* =====================================================================
   js/simSection.js — La section « Simulation »

   La table — le deck testé, le nombre de joueurs, l'adversaire de chaque
   siège, le nombre de parties —, la bibliothèque d'adversaires, la
   couverture de la table, la progression d'un lot, puis ses résultats
   (js/simResultats.js). `renderK()` passe à chaque `renderAll()`, la page
   fût-elle cachée : il ne fait que peindre, et ne compile la couverture que
   sous les yeux, gardée sous une signature.
   ===================================================================== */

let COUV_TABLE = {cle: null, val: null};

/* La couverture des decks de la table, recalculée seulement quand un deck,
   un adversaire, un comportement ou les sources de cartes ont changé. */
function couvertureTable(cfg) {
  const cle = [cfg.deck, signatureDeck(cfg.deck), ...cfg.sieges.map(k => k + (S.adversaires[k] ? signatureAdversaire(S.adversaires[k]) : '')),
    signatureComportements(), CAT.date, CAT.cartes.length, SIM_CARTES.size].join('|');
  if (COUV_TABLE.cle === cle) return COUV_TABLE.val;
  const val = [];
  if (S.decks[cfg.deck]) val.push({nom: S.decks[cfg.deck].nom, teste: true, c: siegeDeck(cfg.deck).couverture});
  cfg.sieges.filter(Boolean).forEach(k => val.push({nom: S.adversaires[k].nom, c: siegeAdversaire(k).couverture}));
  COUV_TABLE = {cle, val};
  return val;
}

function optionsHTML(paires, choisi) {
  return paires.map(([v, l]) => `<option value="${esc(v)}"${v === choisi ? ' selected' : ''}>${esc(l)}</option>`).join('');
}

/* La table : les réglages d'un lot. */
function tableHTML(cfg) {
  const decks = clesDecks().map(k => [k, S.decks[k].nom + ' · ' + (FORMATS[S.decks[k].format] || {}).label]);
  const advs = [['', '— choisir —'], ...Object.keys(S.adversaires).map(k => [k, S.adversaires[k].nom])];
  const enCours = SIM.etat === 'encours' || SIM.etat === 'prepare';
  return `<div class="sim-bloc">
    <h3>La table</h3>
    <label class="sim-champ">Deck testé <select data-sim="deck">${optionsHTML(decks, cfg.deck)}</select></label>
    <label class="sim-champ">Joueurs <select data-sim="nbJoueurs">${optionsHTML([2, 3, 4, 5, 6].map(n => [String(n), String(n)]), String(cfg.nbJoueurs))}</select></label>
    ${cfg.sieges.map((k, i) => `<label class="sim-champ">Adversaire ${i + 1}
      <select data-sim="siege" data-i="${i}">${optionsHTML(advs, k)}</select></label>`).join('')}
    <div class="row">
      <label class="sim-champ court">Parties <input type="number" min="1" max="2000" data-sim="parties" value="${cfg.parties}"></label>
      <label class="sim-champ court" title="Même graine, mêmes decks : mêmes parties. Changer de graine, c'est tirer d'autres mélanges.">Graine <input type="number" min="1" data-sim="graine" value="${cfg.graine}"></label>
      <label class="sim-champ court" title="Au-delà, la partie est déclarée nulle.">Tours max <input type="number" min="5" max="60" data-sim="plafond" value="${cfg.plafond}"></label>
    </div>
    <div class="row sim-lancer">
      ${enCours ? `<button type="button" class="btn danger" data-act="simArreter">Arrêter</button>`
        : `<button type="button" class="btn pri" data-act="simLancer">Lancer ${cfg.parties} parties</button>`}
      <span class="small muted">Chaque deck est joué par un joueur automatique ; les places tournent d'une partie à l'autre.</span>
    </div>
    <div class="sim-progres" ${enCours ? '' : 'hidden'}>
      <div class="small muted" id="simTexte"></div>
      <div class="track"><div class="fill" id="simBarre" style="width:0%;background:var(--brass)"></div></div>
    </div>
  </div>`;
}

/* La bibliothèque d'adversaires. */
function adversairesHTML() {
  const cles = Object.keys(S.adversaires);
  return `<div class="sim-bloc">
    <h3>Adversaires</h3>
    <div class="row" style="margin-bottom:6px">
      <button type="button" class="btn sm pri" data-act="simAjoutAdv">Ajouter un adversaire</button>
      <span class="small muted">Une liste collée (MTGO, Arena) ou le lien d'un deck Moxfield ou Archidekt, qu'il suivra :
        ses cartes n'ont pas à être dans votre collection.</span>
    </div>
    ${cles.length ? `<div class="sim-liste">${cles.map(k => {
      const a = S.adversaires[k], r = resolutionAdversaire(a);
      return `<div class="sim-ligne">
        <b>${esc(a.nom)}</b>
        <span class="small muted">${esc((FORMATS[a.format] || {}).label || a.format)} · ${nbCartesAdversaire(a)} cartes${a.commandants.length ? ' · ' + esc(a.commandants.join(', ')) : ''}</span>
        ${r.manquants.length ? `<span class="pill" title="Demandées à Scryfall au prochain lancement : ${esc(r.manquants.slice(0, 8).join(', '))}">${r.manquants.length} inconnue(s)</span>` : ''}
        ${a.lien ? pastilleLien(a.lien) : ''}
        <span class="sim-gestes">
          ${a.lien ? `<button type="button" class="btn sm" data-act="simMajLien" data-adv="${esc(k)}" title="Relire le deck sur ${SITES_DECKS[a.lien.site].nom}">Mettre à jour</button>` : ''}
          <button type="button" class="btn sm" data-act="simModifAdv" data-adv="${esc(k)}">Modifier</button>
          <button type="button" class="btn sm" data-act="simSupprAdv" data-adv="${esc(k)}">Supprimer</button>
        </span>
      </div>`;
    }).join('')}</div>` : '<div class="small muted">Aucun adversaire pour l\'instant.</div>'}
    ${relaisHTML()}
  </div>`;
}

/* La pastille d'un adversaire lié : son site, sa dernière vérification, et
   ce qui a changé la dernière fois. */
function pastilleLien(l) {
  const ch = l.dernierChangement;
  const titre = (l.etat && l.etat !== 'ok' ? `Synchronisation impossible : ${l.erreur || l.etat}. ` : '') + depuisQuand(l.verifie) +
    (ch ? ` — dernier changement le ${new Date(ch.date).toLocaleDateString('fr-FR')} : ${ch.details && ch.details.length ? ch.details.join(', ') : `+${ch.plus} −${ch.moins}`}` : '');
  return `<span class="pill sim-lien${l.etat && l.etat !== 'ok' ? ' sim-lien-ko' : ''}" title="${esc(titre)}">${esc(SITES_DECKS[l.site].nom)}${l.etat && l.etat !== 'ok' ? ' · synchro impossible' : ''}</span>`;
}

/* Le relais, pour les sites qui refusent d'être lus depuis une autre page.
   On ne le montre déplié que si un adversaire lié en aurait besoin. */
function relaisHTML() {
  const lies = Object.values(S.adversaires).filter(a => a.lien);
  if (!lies.length && !S.simulation.relais) return '';
  const besoin = lies.some(a => a.lien.etat === 'refuse');
  return `<details class="sim-relais"${besoin && !S.simulation.relais ? ' open' : ''}><summary class="small">Relais pour Moxfield et Archidekt (facultatif)</summary>
    <div class="small muted">Si un site refuse d'être lu depuis l'atelier, un relais à vous le lit à sa place : un Cloudflare
      Worker gratuit, dont le script est dans le README. Il ne voit que l'identifiant d'un deck public.</div>
    <label class="sim-champ sim-champ-large">Adresse du relais
      <input type="url" data-sim="relais" value="${esc(S.simulation.relais || '')}" placeholder="https://atelier-relais.vous.workers.dev"></label>
  </details>`;
}

/* Le badge d'un taux de couverture. */
function badgeCouverture(t) {
  const niveau = t >= 0.85 ? 'bonne' : t >= 0.65 ? 'moyenne' : 'faible';
  return `<span class="sim-badge ${niveau}" title="Part des sorts que le moteur comprend entièrement (une carte partielle compte pour moitié)">${Math.round(t * 100)} %</span>`;
}

/* Ce que le moteur comprend des decks de la table. */
function couvertureHTML(cfg) {
  const t = couvertureTable(cfg);
  if (!t.length) return '';
  return `<div class="sim-bloc">
    <h3>Ce que le moteur comprend</h3>
    <div class="small muted" style="margin-bottom:6px">Une carte partielle est jouée pour ce qui est compris ; une carte
      injouable — dont une part ignorée ressemble à une contrepartie — n'est jamais lancée, pour que ne pas la comprendre
      n'avantage pas son deck. « Décrire » permet d'écrire son comportement à la main.</div>
    ${t.map(x => `<details class="sim-couv"${x.teste ? ' open' : ''}>
      <summary><b>${esc(x.nom)}</b> ${badgeCouverture(x.c.taux)}
        <span class="small muted">${x.c.complete} complète(s) · ${x.c.partielle} partielle(s) · ${x.c.injouable} injouable(s)${x.c.manquantes.length ? ` · ${x.c.manquantes.length} inconnue(s)` : ''}</span></summary>
      ${x.c.archiveSansJeu ? '<div class="small">L\'archive du catalogue date d\'avant le mode de jeu : la recharger donnerait au moteur les mots-clés et la loyauté.</div>' : ''}
      ${x.c.cartes.length ? `<div class="sim-liste">${x.c.cartes.slice(0, 60).map(c => `<div class="sim-ligne">
        <span class="sim-etat ${c.etat}">${c.etat}</span> ${esc(c.nom)}${c.n > 1 ? ` ×${c.n}` : ''}${c.manuel ? ' <span class="small muted">(décrite à la main)</span>' : ''}
        <span class="sim-gestes"><button type="button" class="btn sm" data-act="simComportement" data-carte="${esc(c.nom)}">Décrire</button></span>
      </div>`).join('')}</div>` : '<div class="small muted">Tout est compris.</div>'}
    </details>`).join('')}
  </div>`;
}

function renderK() {
  const corps = document.getElementById('bodyK'), indice = document.getElementById('hintK');
  if (!corps) return;
  const cfg = configSimulation();
  if (indice) indice.textContent = SIM_RES.lots.length ? `${SIM_RES.lots.length} lot(s) gardé(s)` : 'le deck joué contre des adversaires automatiques';
  if (S.onglet !== 'simulation') return;
  if (!SIM_RES.charge) { chargeResultats().then(() => { if (S.onglet === 'simulation') renderK(); }); }
  if (!simCartesChargees) { chargeSimCartes().then(() => { if (S.onglet === 'simulation') renderK(); }); }
  corps.innerHTML = `<div class="sim-grille">${tableHTML(cfg)}${adversairesHTML()}</div>
    ${couvertureHTML(cfg)}
    <div id="simResultats">${resultatsHTML(cfg)}</div>`;
  if (SIM.etat === 'encours' || SIM.etat === 'prepare') majProgressionSim();
}
