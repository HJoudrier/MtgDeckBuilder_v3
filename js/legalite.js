/* =====================================================================
   js/legalite.js — Ce que le format exige, et l'équilibre des rôles

   La taille du deck, le nombre d'exemplaires, le commandant et son identité
   couleur, le palier que les « Game Changers » autorisent : `legality()` rend
   la liste de ce qui cloche, phrase par phrase. À côté, les cibles par rôle et
   les jauges qui les montrent — des filtres à part entière, que cocher agit
   partout.
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
    ${n} carte(s) classée(s) <b style="color:#cba6e8">Game Changer</b> par Wizards :
    ${gc.map(e => esc(e.card.name)).join(', ')}.
    ${n > 3 ? 'Au-delà de trois, le deck relève des paliers 4 ou 5.'
            : 'Le palier 2 n\'en admet aucune, le palier 3 jusqu\'à trois.'}</div>`;
}

function targets() {
  const f = fmt(), k = f.size / 100;
  if (S.format === 'limite') return {terrains:17, creatures:15, interaction:4, pioche:2, ramp:1, tuteurs:0, wipe:0, protection:1};
  if (S.format === 'standard') return {terrains:24, creatures:18, interaction:8, pioche:6, ramp:2, tuteurs:1, wipe:2, protection:2};
  return {
    terrains:Math.round(36*k), creatures:Math.round(25*k), interaction:Math.round(9*k), pioche:Math.round(10*k),
    ramp:Math.round(10*k), tuteurs:Math.round(3*k), wipe:Math.round(2*k), protection:Math.round(3*k)
  };
}

function deckCounts() {
  const c = {};
  Object.keys(targets()).forEach(k => c[k] = 0);
  deckEntries().forEach(e => { e.card.cats.forEach(cat => { if (cat in c) c[cat] += e.qty; }); });
  return c;
}

function gauge(label, val, tgt, role) {
  const pct = Math.min(100, Math.round(val / Math.max(1, tgt) * 100));
  const col = val >= tgt ? 'var(--ok)' : (val >= tgt * 0.6 ? 'var(--warn)' : 'var(--bad)');
  const diff = val - tgt;
  const actif = rolesFiltre().includes(role);
  return `<button type="button" class="gauge ${actif?'actif':''}" data-act="toggleRole" data-role="${esc(role||'')}"
      aria-pressed="${actif}" title="${actif ? 'Retirer ce rôle des filtres' : 'Ne garder que les cartes tenant ce rôle, partout'}">
    <div class="top"><span>${label}</span><span class="mono">${val} / ${tgt} ${diff<0?`<span style="color:var(--bad)">${diff}</span>`:'<span style="color:var(--ok)">ok</span>'}</span></div>
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
