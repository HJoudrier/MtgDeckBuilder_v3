/* =====================================================================
   js/legalite.js — Ce que le format exige, et l'équilibre des rôles

   La taille du deck, le nombre d'exemplaires, le commandant et son identité
   couleur, le palier que les « Game Changers » autorisent : `legality()` rend
   la liste de ce qui cloche, phrase par phrase. À côté, les cibles par rôle et
   les jauges qui les montrent — des filtres à part entière, que cocher agit
   partout, et dont un pinceau ouvre les objectifs pour les régler à la main
   (`js/fenCibles.js`).
   ===================================================================== */

/* Les Game Changers de la liste principale. Leur nombre décide du palier
   qu'un deck Commander peut revendiquer : aucun aux paliers 1 et 2, jusqu'à
   trois au palier 3, sans limite aux paliers 4 et 5. La réserve et l'étude
   n'y entrent pas — elles ne se jouent pas. */
function gameChangersDuDeck() {
  return deckEntries().filter(e => estGameChanger(e.card) === true);
}

/* Ce que ce décompte dit du palier, en une phrase. */
function ligneGameChangers() {
  if (!fmt().commander || !gameChangersConnus()) return '';
  const gc = gameChangersDuDeck();
  const n = gc.reduce((x, e) => x + e.qty, 0);
  if (!n) return '';
  return `<div class="small muted" style="margin:8px 0 0">
    ${n} carte(s) classée(s) <b style="color:var(--gc-txt)">Game Changer</b> par Wizards :
    ${gc.map(e => esc(e.card.name)).join(', ')}.
    ${n > 3 ? 'Au-delà de trois, le deck relève des paliers 4 ou 5.'
            : 'Le palier 2 n\'en admet aucune, le palier 3 jusqu\'à trois.'}</div>`;
}

/* Ce que le format propose, à la taille du deck. C'est le point de départ :
   des repères tirés de l'usage, non une règle — d'où le pinceau qui les laisse
   régler. */
function ciblesParDefaut() {
  const f = fmt(), k = f.size / 100;
  if (S.format === 'limite') return {terrains:17, creatures:15, interaction:4, pioche:2, ramp:1, tuteurs:0, wipe:0, protection:1};
  if (S.format === 'standard') return {terrains:24, creatures:18, interaction:8, pioche:6, ramp:2, tuteurs:1, wipe:2, protection:2};
  return {
    terrains:Math.round(36*k), creatures:Math.round(25*k), interaction:Math.round(9*k), pioche:Math.round(10*k),
    ramp:Math.round(10*k), tuteurs:Math.round(3*k), wipe:Math.round(2*k), protection:Math.round(3*k)
  };
}

/* Les objectifs réglés à la main pour le format en cours. */
function ciblesReglees() {
  return (S.ciblesRoles && S.ciblesRoles[S.format]) || {};
}

/* Les cibles en vigueur : celles du format, et par-dessus celles qu'on a
   réglées. Tout l'atelier passe par ici — les jauges, la fiche d'une carte, et
   la notation, qui mesure ce qui manque au deck. */
function targets() {
  const base = ciblesParDefaut();
  const perso = ciblesReglees();
  Object.keys(base).forEach(r => {
    if (typeof perso[r] === 'number' && perso[r] >= 0) base[r] = perso[r];
  });
  return base;
}

/* Poser un objectif, ou le rendre au format quand il retrouve sa valeur :
   l'état ne garde que ce qui s'écarte, et « Rétablir » n'a rien à défaire de
   ce qui n'a pas bougé. */
function reglerCible(role, valeur) {
  const base = ciblesParDefaut();
  if (!(role in base)) return;
  const v = Math.max(0, Math.min(fmt().size, Math.round(Number(valeur))));
  if (!Number.isFinite(v)) return;
  const perso = S.ciblesRoles[S.format] || (S.ciblesRoles[S.format] = {});
  if (v === base[role]) delete perso[role]; else perso[role] = v;
  if (!Object.keys(perso).length) delete S.ciblesRoles[S.format];
}

function reinitCibles() {
  delete S.ciblesRoles[S.format];
}

function deckCounts() {
  const c = {};
  Object.keys(targets()).forEach(k => c[k] = 0);
  deckEntries().forEach(e => { e.card.cats.forEach(cat => { if (cat in c) c[cat] += e.qty; }); });
  return c;
}

/* Un pinceau : six poils, une virole, un manche. Dessiné ici comme l'engrenage
   et l'entonnoir des filtres — l'atelier ne dépend d'aucun fichier extérieur. */
const PINCEAU_ICONE = `<svg viewBox="0 0 16 16" width="12" height="12" aria-hidden="true" style="vertical-align:-2px">
  <path fill="currentColor" d="M14.1 1.9a1.4 1.4 0 0 0-2 0L7 7l1.9 1.9 5.2-5a1.4 1.4 0 0 0 0-2z"/>
  <path fill="currentColor" d="M5.6 8.2c-1 0-1.8.5-2.2 1.3-.4.8-.5 2.2-1.3 2.9 1 .9 2.4 1.1 3.6.6 1.2-.5 1.9-1.7 1.8-2.9a2 2 0 0 0-1.9-1.9z"/>
</svg>`;

/* Le bouton du titre : il ouvre la fenêtre des objectifs (`js/fenCibles.js`). Les
   champs vivaient ici même, dans les jauges, le temps d'un mode — mais une
   jauge est un filtre, et lui faire porter tantôt un bouton tantôt un champ
   donnait un geste pour deux intentions. La fenêtre les règle à part, et rien
   n'agit avant « Appliquer ». */
function boutonCibles() {
  const n = Object.keys(ciblesReglees()).length;
  return `<button type="button" class="btn sm cible-edit" data-act="cibles"
    title="Modifier les objectifs par rôle${n ? ` — ${n} réglé(s) à la main` : ''}">
    ${PINCEAU_ICONE} Modifier</button>`;
}

/* Le remplissage d'une jauge : la part atteinte, et la couleur qui la juge. */
function remplissageJauge(val, tgt) {
  return {
    pct: Math.min(100, Math.round(val / Math.max(1, tgt) * 100)),
    col: val >= tgt ? 'var(--ok)' : (val >= tgt * 0.6 ? 'var(--warn)' : 'var(--bad)')
  };
}

function ecartJauge(val, tgt) {
  const diff = val - tgt;
  return diff < 0 ? `<span style="color:var(--bad)">${diff}</span>` : '<span style="color:var(--ok)">ok</span>';
}

function gauge(label, val, tgt, role) {
  const {pct, col} = remplissageJauge(val, tgt);
  const actif = rolesFiltre().includes(role);
  /* Un objectif réglé à la main se signale : sans cela rien ne distinguerait
     une jauge qui suit le format d'une qui suit ce qu'on lui a demandé. */
  const regle = typeof ciblesReglees()[role] === 'number';
  return `<button type="button" class="gauge ${actif?'actif':''}" data-act="toggleRole" data-role="${esc(role||'')}"
      aria-pressed="${actif}" title="${actif ? 'Retirer ce rôle des filtres' : 'Ne garder que les cartes tenant ce rôle, partout'}">
    <div class="top"><span>${label}${regle ? ' <span class="cible-marque" title="Objectif réglé à la main">•</span>' : ''}</span>
      <span class="mono">${val} / ${tgt} ${ecartJauge(val, tgt)}</span></div>
    <div class="track"><div class="fill" style="width:${pct}%;background:${col}"></div></div></button>`;
}

function legality() {
  const f = fmt(), n = deckSize(), msgs = [];
  if (n > f.size) msgs.push(`${n-f.size} carte(s) de trop (${n}/${f.size}).`);
  if (n < f.size) msgs.push(`Il manque ${f.size-n} carte(s) pour atteindre ${f.size}.`);
  deckEntries().forEach(e => {
    if (e.qty > f.maxCopies && !/^Basic Land/i.test(e.card.type))
      msgs.push(`${e.card.name} : ${e.qty} copies pour ${f.maxCopies} autorisée(s).`);
  });
  if (f.commander && !S.commander) msgs.push('Aucun commandant désigné.');
  const jetons = deckEntries().filter(e => e.card.isToken);
  if (jetons.length) msgs.push(`${jetons.length} jeton(s) dans le deck (${jetons.slice(0,3).map(e=>e.card.name).join(', ')}) : un jeton ne se joue pas depuis la main.`);
  /* Le deck ne masque jamais une carte illégale — elle doit rester retirable —
     donc c'est ici qu'elle se signale. */
  const illegales = deckEntries().filter(e => carteLegale(e.card) === false);
  if (illegales.length) msgs.push(`${illegales.length} carte(s) non légale(s) en ${f.label} : ${
    illegales.slice(0,3).map(e => e.card.name).join(', ')}${illegales.length > 3 ? '…' : ''}.`);
  deckEntries().forEach(e => {
    const possede = S.collection.get(e.card.name) || 0;
    if (e.qty > possede && S.budget.total <= 0)
      msgs.push(`${e.card.name} : ${e.qty-possede} exemplaire(s) à acheter, alors que le budget est à zéro.`);
  });
  const panier = spent();
  if (panier > S.budget.total && S.budget.total > 0)
    msgs.push(`Cartes à acheter : ${eur(panier)} pour un budget de ${eur(S.budget.total)}.`);
  if (S.commander) {
    const cmd = find(S.commander);
    deckEntries().forEach(e => {
      const bad = e.card.identity.filter(c => !cmd.identity.includes(c));
      if (bad.length) msgs.push(`${e.card.name} sort de l'identité couleur du commandant (${bad.join('')}).`);
    });
  }
  if (S.format === 'perso') {
    'WUBRG'.split('').forEach(c => {
      if (!S.colors.has(c)) return;
      const n2 = deckEntries().filter(e => e.card.identity.includes(c)).reduce((a, e) => a + e.qty, 0);
      const l = S.custom.colorLimits[c];
      if (n2 < l.min) msgs.push(`Couleur ${c} : ${n2} carte(s) pour un minimum de ${l.min}.`);
      if (n2 > l.max) msgs.push(`Couleur ${c} : ${n2} carte(s) pour un maximum de ${l.max}.`);
    });
  }
  return msgs;
}
