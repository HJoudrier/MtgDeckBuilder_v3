/* =====================================================================
   js/simSection.js — La section « Simulation »

   La table — le deck testé, le nombre de joueurs, le deck de chaque
   siège, le nombre de parties —, la couverture de la table, la progression d'un lot, puis ses résultats
   (js/simResultats.js). `renderK()` passe à chaque `renderAll()`, la page
   fût-elle cachée : il ne fait que peindre, et ne compile la couverture que
   sous les yeux, gardée sous une signature.
   ===================================================================== */

let COUV_TABLE = {cle: null, val: null};

/* La couverture des decks de la table, recalculée seulement quand un deck,
   un autre deck de la table, un comportement ou les sources de cartes ont changé. */
function couvertureTable(cfg) {
  const cle = [cfg.deck, signatureDeck(cfg.deck), ...cfg.sieges.map(k => k + signatureSource(k)),
    signatureComportements(), CAT.date, CAT.cartes.length, SIM_CARTES.size, typeof FORGE !== 'undefined' ? FORGE.textes.size : 0].join('|');
  if (COUV_TABLE.cle === cle) return COUV_TABLE.val;
  const val = [];
  if (S.decks[cfg.deck]) val.push({nom: S.decks[cfg.deck].nom, teste: true, c: siegeDeck(cfg.deck).couverture});
  cfg.sieges.filter(Boolean).forEach(k => val.push({nom: nomDeSiege(k), c: siegeSource(k).couverture}));
  COUV_TABLE = {cle, val};
  return val;
}

/* Le nom d'un niveau de jeu, avec ce qu'il coûte en temps. */
const LIBELLES_NIVEAUX = {rapide: 'Rapide', moyen: 'Moyen — essaie ses coups (≈ 3 × plus long)', fort: 'Fort — suit ses coups un tour (≈ 10 à 20 × plus long)'};

function optionsHTML(paires, choisi) {
  return paires.map(([v, l]) => `<option value="${esc(v)}"${v === choisi ? ' selected' : ''}>${esc(l)}</option>`).join('');
}

/* La table : les réglages d'un lot. */
function tableHTML(cfg) {
  const decks = clesDecks().map(k => [k, S.decks[k].nom + ' · ' + (FORMATS[S.decks[k].format] || {}).label]);
  const advs = optionsSiege();
  const enCours = SIM.etat === 'encours' || SIM.etat === 'prepare';
  return `<div class="sim-bloc">
    <h3>La table</h3>
    <label class="sim-champ">Deck testé <select data-sim="deck">${optionsHTML(decks, cfg.deck)}</select></label>
    <label class="sim-champ">Joueurs <select data-sim="nbJoueurs">${optionsHTML([2, 3, 4, 5, 6].map(n => [String(n), String(n)]), String(cfg.nbJoueurs))}</select></label>
    ${cfg.sieges.map((k, i) => `<label class="sim-champ">Siège ${i + 2}
      <select data-sim="siege" data-i="${i}">${optionsHTML(advs, k)}</select></label>`).join('')}
    <div class="row">
      <label class="sim-champ court">Parties <input type="number" min="1" max="2000" data-sim="parties" value="${cfg.parties}"></label>
      <label class="sim-champ court" title="Même graine, mêmes decks : mêmes parties. Changer de graine, c'est tirer d'autres mélanges.">Graine <input type="number" min="1" data-sim="graine" value="${cfg.graine}"></label>
      <label class="sim-champ court" title="Au-delà, la partie est déclarée nulle.">Tours max <input type="number" min="5" max="60" data-sim="plafond" value="${cfg.plafond}"></label>
      <label class="sim-champ" title="Les niveaux moyen et fort essaient leurs coups sur une copie de la partie, dont ils connaissent tout : plus justes, plus lents.">Jeu des IA
        <select data-sim="niveauIA">${optionsHTML(NIVEAUX_IA.map(n => [n, LIBELLES_NIVEAUX[n]]), cfg.niveau)}</select></label>
    </div>
    <div class="row sim-lancer">
      ${enCours ? `<button type="button" class="btn danger" data-act="simArreter">Arrêter</button>`
        : `<button type="button" class="btn pri" data-act="simLancer">Lancer ${cfg.parties} parties</button>`}
      <span class="small muted">Chaque deck est joué par un joueur automatique ; les places tournent d'une partie à l'autre.</span>
      <span class="row" style="margin-left:auto"><button type="button" class="btn" data-act="tOuvrirSalon" title="Jouer vous-même, contre des joueurs automatiques ou des invités">Jouer une partie</button>
        <button type="button" class="btn" data-act="tRejoindre" title="Rejoindre la table qu'un autre héberge, en lisant son QR code">Rejoindre une table</button>
        ${typeof TABLE_SAUVEE !== 'undefined' && TABLE_SAUVEE ? `<button type="button" class="btn pri" data-act="tReprendre"
          title="La partie hébergée ici a été interrompue le ${new Date(TABLE_SAUVEE.date).toLocaleString('fr-FR')}">Reprendre la partie interrompue</button>` : ''}</span>
    </div>
    <div class="sim-progres" ${enCours ? '' : 'hidden'}>
      <div class="small muted" id="simTexte"></div>
      <div class="track"><div class="fill" id="simBarre" style="width:0%;background:var(--brass)"></div></div>
    </div>
  </div>`;
}

/* Le badge d'un taux de couverture. */
function badgeCouverture(t, titre) {
  const niveau = t >= 0.85 ? 'bonne' : t >= 0.65 ? 'moyenne' : 'faible';
  return `<span class="sim-badge ${niveau}" title="${esc(titre || 'Part des sorts que le moteur comprend entièrement (une carte partielle compte pour moitié)')}">${Math.round(t * 100)} %</span>`;
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
        <span class="small muted">${x.c.complete} complète(s) · ${x.c.partielle} partielle(s) · ${x.c.injouable} injouable(s)${x.c.manquantes.length ? ` · ${x.c.manquantes.length} inconnue(s)` : ''}${x.c.forge ? ` · ${x.c.forge} lue(s) dans Forge` : ''}</span></summary>
      ${x.c.archiveSansJeu ? '<div class="small">L\'archive du catalogue date d\'avant le mode de jeu : la recharger donnerait au moteur les mots-clés et la loyauté.</div>' : ''}
      ${x.c.cartes.length ? `<div class="sim-liste">${x.c.cartes.slice(0, 60).map(c => `<div class="sim-ligne">
        <span class="sim-etat ${c.etat}">${c.etat}</span> ${esc(c.nom)}${c.n > 1 ? ` ×${c.n}` : ''}${c.manuel ? ' <span class="small muted">(décrite à la main)</span>' : ''}
        ${c.source === 'forge' ? `<span class="small muted" title="${esc((c.manque || []).join(', '))}">Forge${c.manque && c.manque.length ? ' — manque ' + esc(c.manque.slice(0, 2).map(e => e.split(':')[1]).join(', ')) : ''}</span>` : ''}
        <span class="sim-gestes"><button type="button" class="btn sm" data-act="simComportement" data-carte="${esc(c.nom)}">Décrire</button></span>
      </div>`).join('')}</div>` : '<div class="small muted">Tout est compris.</div>'}
    </details>`).join('')}
  </div>`;
}

function renderK() {
  const corps = document.getElementById('bodyK'), indice = document.getElementById('hintK');
  if (!corps) return;
  const cfg = configSimulation();
  if (indice) indice.textContent = SIM_RES.lots.length ? `${SIM_RES.lots.length} lot(s) gardé(s)` : 'un deck joué contre d\'autres decks, menés par des joueurs automatiques';
  if (S.onglet !== 'simulation') return;
  if (!SIM_RES.charge) { chargeResultats().then(() => { if (S.onglet === 'simulation') renderK(); }); }
  if (!simCartesChargees) { chargeSimCartes().then(() => { if (S.onglet === 'simulation') renderK(); }); }
  corps.innerHTML = `<div class="sim-grille">${tableHTML(cfg)}</div>
    ${couvertureCollectionHTML()}
    ${couvertureHTML(cfg)}
    <div id="simManques">${manquesHTML()}</div>
    <div id="simResultats">${resultatsHTML(cfg)}</div>`;
  if (SIM.etat === 'encours' || SIM.etat === 'prepare') majProgressionSim();
}
