/* =====================================================================
   js/anaVueSynergie.js — Le bloc de la synergie

   Le score et ses trois mesures, les axes par où passent les liens, les cartes
   qui tiennent le deck ensemble et celles qui ne parlent à personne — les
   premières à interroger quand on cherche une place —, puis, si EDHREC a été
   chargé pour le commandant, ce que les decks recensés disent des mêmes cartes.
   ===================================================================== */

function anaJauge(label, v, aide) {
  return `<div class="ana-jauge" title="${esc(aide)}">
    <div class="top"><span>${label}</span><span class="mono">${pctAna(v)}</span></div>
    <div class="track"><div class="fill" style="width:${Math.round(v * 100)}%;background:var(--brass-d)"></div></div>
  </div>`;
}

function anaSynergieVue(Y) {
  if (Y.N < 2) return '<div class="empty">Il faut au moins deux sorts dans le deck pour parler de synergie.</div>';
  const v = verdictSynergie(Y.score);
  const maxAxe = Math.max(1, ...Y.axes.map(a => a.n));
  const maxPivot = Math.max(1, ...Y.pivots.map(p => p.n));
  return `<div class="ana-score">
      <div class="ana-score-v" style="--ana-verdict:${v.col}"><b>${Y.score}</b><span>/100</span></div>
      <div class="ana-score-d">
        <div><b>${esc(v.mot)}</b> — ${Y.paires} paire(s) de cartes reliées par un lien précis, ${nombreAna(Y.moyenne, 1)} partenaire(s) par sort en moyenne.</div>
        ${anaJauge('Couverture', Y.couverture, 'Part des sorts reliés à au moins un autre sort du deck — pèse 35 %')}
        ${anaJauge('Densité', Y.densite, 'Nombre moyen de partenaires par sort, ramené entre 0 et 1 (4 partenaires ≈ 63 %) — pèse 35 %')}
        ${anaJauge('Cohésion', Y.cohesion, 'Part des sorts qui tiennent dans le plus grand bloc d\'un seul tenant — pèse 30 %')}
      </div>
    </div>
    <div class="ana-deux">
      <div>
        <h4 class="ana-h4">Axes de synergie <span class="small muted">· paires par concept</span></h4>
        ${Y.axes.length ? `<div class="ana-barres">${Y.axes.map(a => anaBarre(esc(a.label), a.n, maxAxe)).join('')}</div>` : '<div class="small muted">Aucun lien précis.</div>'}
      </div>
      <div>
        <h4 class="ana-h4">Cartes pivots <span class="small muted">· partenaires dans le deck</span></h4>
        ${Y.pivots.length ? `<div class="ana-barres">${Y.pivots.map(p => anaBarre(anaNom(p.card), p.n, maxPivot)).join('')}</div>` : '<div class="small muted">Aucune.</div>'}
      </div>
    </div>
    ${Y.boucles.length ? `<div class="small" style="margin-top:8px"><b>Boucles</b> <span class="muted">— ces cartes ferment un cycle d'effets avec le reste du deck :</span> ${anaNoms(Y.boucles, 10)}</div>` : ''}
    ${Y.ponts.length ? `<div class="small" style="margin-top:4px"><b>Ponts</b> <span class="muted">— elles reçoivent d'une carte et fournissent à une autre :</span> ${anaNoms(Y.ponts, 10)}</div>` : ''}
    <h4 class="ana-h4">Cartes isolées <span class="small muted">· ${Y.isoles.length} sort(s) sans lien précis avec le deck</span></h4>
    <div class="small">${Y.isoles.length ? anaNoms(Y.isoles, 24) : '<span class="muted">aucune : chaque sort se relie à au moins un autre.</span>'}</div>
    <div class="small muted" style="margin-top:6px">Une carte isolée n'est pas une mauvaise carte — une pioche, un contresort ou un board wipe
      valent par eux-mêmes —, mais c'est parmi elles qu'on cherche d'abord la place d'une carte qui s'intègre.
      Les liens sont ceux du graphe des capacités ; un déclencheur que le quart du deck nourrit compte comme large et n'entre pas ici.</div>
    ${anaEdhrecVue(synergieEdhrec())}`;
}

function anaEdhrecVue(E) {
  if (!E) return `<h4 class="ana-h4">Selon EDHREC</h4><div class="small muted">Chargez les statistiques d'EDHREC du commandant (onglet EDHREC)
    pour voir l'inclusion et la synergie moyennes des cartes du deck.</div>`;
  if (!E.trouvees.length) return `<h4 class="ana-h4">Selon EDHREC</h4><div class="small muted">Aucune carte du deck n'apparaît dans les statistiques chargées.</div>`;
  const pct = x => `${x >= 0 ? '+' : '−'}${Math.abs(Math.round(x * 100))} %`;
  return `<h4 class="ana-h4">Selon EDHREC <span class="small muted">· ${esc(E.commandant || '')}</span></h4>
    <div class="statgrid ana-mini">
      ${anaTuile(pctAna(E.inclusion), 'Inclusion moyenne', {sous:'des cartes reconnues'})}
      ${anaTuile(pct(E.synergie), 'Synergie moyenne')}
      ${anaTuile(String(E.hautes.length), 'Haute synergie', {sous:'+20 % ou plus'})}
      ${anaTuile(String(E.absentes.length), 'Absentes d\'EDHREC', {sous:'choix originaux'})}
    </div>
    ${E.hautes.length ? `<div class="small" style="margin-top:6px"><b>Les plus propres au commandant :</b> ${E.hautes.slice(0, 10).map(x => `${anaNom(x.card)} <span class="muted">${pct(x.synergy)}</span>`).join(', ')}</div>` : ''}
    ${E.basses.length ? `<div class="small" style="margin-top:4px"><b>Synergie négative :</b> ${E.basses.slice(0, 10).map(x => `${anaNom(x.card)} <span class="muted">${pct(x.synergy)}</span>`).join(', ')}</div>` : ''}`;
}
