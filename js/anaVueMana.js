/* =====================================================================
   js/anaVueMana.js — Couleurs, mains de départ, mise en place

   Trois blocs qui parlent du hasard. Les couleurs : ce que le deck demande,
   ce qu'il sert, et la carte qui risque le plus de rester en main faute de sa
   couleur. Les mains de départ : la loi exacte des terrains en sept cartes et
   des rôles qu'on veut y voir. La mise en place : quelques milliers de
   parties jouées seul, pour dire à quel tour le deck dispose de son mana.
   ===================================================================== */

const ROLES_EN_MAIN = ['ramp', 'pioche', 'interaction', 'tuteurs', 'wipe', 'protection'];

/* Les mains, en loi exacte : la distribution des terrains, la part gardable,
   ce que les mulligans y ajoutent, la chance de poser un terrain par tour et
   celle de voir chaque rôle tôt. */
function analyseMains(lib) {
  const N = lib.length;
  if (N < 7) return null;
  const L = lib.filter(c => c.isLand).length;
  const bornes = fmt().commander ? [2, 5] : [2, 4];
  const dist = Array.from({length:8}, (_, k) => hyperP(N, L, 7, k));
  const gardable = dist.slice(bornes[0], bornes[1] + 1).reduce((a, b) => a + b, 0);
  const poses = Array.from({length:7}, (_, i) => hyperAuMoins(N, L, Math.min(N, cartesVuesAuTour(i + 1)), i + 1));
  const roles = ROLES_EN_MAIN.map(r => {
    const K = lib.filter(c => !c.isLand && c.cats.has(r)).length;
    const p = n => hyperAuMoins(N, K, Math.min(N, n), 1);
    return {r, K, main:p(7), t3:p(cartesVuesAuTour(3)), t5:p(cartesVuesAuTour(5))};
  });
  return {N, L, bornes, dist, gardable, attendus: 7 * L / N, poses, roles,
    peu: dist[0] + dist[1], trop: dist.slice(bornes[1] + 1).reduce((a, b) => a + b, 0)};
}

/* Une ligne par couleur : ce qu'elle demande, ce qu'elle a, la carte la plus
   exigeante et la chance de la lancer au tour de son coût. */
function lignesCouleurs(A) {
  const b = bilanMana();
  const N = A.lib.length;
  return 'WUBRG'.split('').filter(c => b.pips[c] > 0).map(c => {
    const exigeantes = A.jugees.filter(x => (pipsPleins(x)[c] || 0) > 0)
      .sort((x, y) => (pipsPleins(y)[c] - pipsPleins(x)[c]) || (x.cmc - y.cmc));
    const pire = exigeantes[0];
    const pips = pire ? pipsPleins(pire)[c] : 0;
    const tour = pire ? Math.max(1, pire.cmc) : 1;
    const conseil = pire ? sourcesRecommandees(N, A.lib.filter(x => x.isLand).length, pips, tour) : 0;
    const sources = b.sources[c].terrains + b.sources[c].accelerateurs;
    return {c, pips:b.pips[c], sources, pire, pipsPire:pips, tour, conseil,
      aTemps: pire ? A.sim.aTemps.get(pire.name) : null};
  });
}

function anaCouleurs(A) {
  const lignes = lignesCouleurs(A);
  const difficiles = A.jugees.map(c => ({c, p:A.sim.aTemps.get(c.name)}))
    .filter(x => typeof x.p === 'number').sort((a, b) => a.p - b.p).slice(0, 8);
  const moyenne = A.jugees.length ? A.jugees.reduce((a, c) => a + (A.sim.aTemps.get(c.name) || 0), 0) / A.jugees.length : 0;
  const T = profilTerrains();
  return `${blocMana()}
    ${lignes.length ? `<div class="scroll" style="margin-top:10px"><table class="tbl ana-tbl">
      <thead><tr><th>Couleur</th><th>Sources</th><th>Conseillées</th><th>Carte la plus exigeante</th><th>À temps</th></tr></thead>
      <tbody>${lignes.map(l => {
        const manque = l.conseil === null || l.sources < l.conseil;
        return `<tr><td>${symIcon(l.c, 'sm')}</td>
          <td class="mono">${l.sources}</td>
          <td class="mono" title="Sources pour la lancer au tour ${l.tour} neuf fois sur dix, terrains posés">${l.conseil === null ? 'plus que les terrains' : l.conseil}
            <span class="ana-badge" style="--ana-verdict:${manque ? 'var(--warn)' : 'var(--ok)'}">${l.conseil === null ? 'hors de portée' : (manque ? `−${l.conseil - l.sources}` : 'ok')}</span></td>
          <td>${l.pire ? `${anaNom(l.pire)} <span class="muted small">${esc(l.pire.cost || '')} · tour ${l.tour}</span>` : '—'}</td>
          <td class="mono">${l.aTemps == null ? '—' : pctAna(l.aTemps)}</td></tr>`;
      }).join('')}</tbody></table></div>` : ''}
    ${difficiles.length ? `<h4 class="ana-h4">Les plus dures à lancer au tour de leur coût <span class="small muted">· moyenne du deck ${pctAna(moyenne)}</span></h4>
      <div class="ana-barres">${difficiles.map(x => anaBarre(anaNom(x.c), x.p, 1, {texte:pctAna(x.p),
        couleur: x.p >= 0.8 ? 'var(--ok)' : (x.p >= 0.6 ? 'var(--warn)' : 'var(--bad)'),
        titre:`${x.c.name} (${x.c.cost || 'sans coût'}) : assez de terrains et de sources de ses couleurs au tour ${Math.max(1, x.c.cmc)}`})).join('')}</div>` : ''}
    <h4 class="ana-h4">Base de terrains</h4>
    <div class="statgrid ana-mini">
      ${anaTuile(String(T.total), 'Terrains')}
      ${anaTuile(String(T.bases), 'De base', {sous:`${T.total - T.bases} autre(s)`})}
      ${anaTuile(String(T.multicolores), 'Plusieurs couleurs')}
      ${anaTuile(String(T.engages), 'Arrivent engagés', {sous:`et ${T.conditionnels} sauf condition`})}
      ${anaTuile(String(T.utilitaires), 'Utilitaires', {titre:T.utiles.join(', ')})}
    </div>
    <div class="small muted" style="margin-top:6px">« À temps » : sur ${ANA_PARTIES} mélanges, la part où l'on a vu, au tour du coût de la carte,
      assez de mana pour la payer (terrains et accélérateurs) et assez de sources de chacune de ses couleurs (accélérateurs à deux mana ou moins compris).
      « Conseillées » : les sources qu'il faudrait pour avoir ses couleurs à ce tour neuf fois sur dix, sachant qu'on a posé ses terrains — la méthode de Frank Karsten.</div>`;
}

function anaMains(A) {
  const M = A.mains;
  if (!M) return '<div class="empty">Il faut au moins sept cartes dans la bibliothèque pour parler de main de départ.</div>';
  const cols = M.dist.map((p, k) => ({label:String(k), v:p, texte:p >= 0.005 ? pctAna(p) : '',
    couleur: k >= M.bornes[0] && k <= M.bornes[1] ? 'var(--ok)' : 'var(--line2)',
    titre:`${k} terrain(s) en sept cartes : ${pctAna(p, 1)}`}));
  const poses = M.poses.map((p, i) => ({label:`T${i + 1}`, v:p, texte:pctAna(p), couleur:'var(--brass-d)',
    titre:`Au moins ${i + 1} terrain(s) vu(s) au tour ${i + 1} : ${pctAna(p, 1)}`}));
  const mull = fmt().commander
    ? anaTuile(pctAna(1 - Math.pow(1 - M.gardable, 2)), 'Avec un mulligan', {sous:'le premier est gratuit en Commander'})
    : anaTuile(pctAna(1 - Math.pow(1 - M.gardable, 2)), 'Avec un mulligan', {sous:'une main de six'});
  return `<div class="statgrid ana-mini">
      ${anaTuile(nombreAna(M.attendus, 1), 'Terrains attendus', {sous:`${M.L} terrains sur ${M.N} cartes`})}
      ${anaTuile(pctAna(M.gardable), 'Main gardable', {sous:`${M.bornes[0]} à ${M.bornes[1]} terrains`})}
      ${anaTuile(pctAna(M.peu), '0 ou 1 terrain', {col:'var(--bad)', sous:'à mulliganer'})}
      ${anaTuile(pctAna(M.trop), `${M.bornes[1] + 1} terrains ou plus`, {sous:'inondée'})}
      ${mull}
    </div>
    <h4 class="ana-h4">Terrains dans la main de départ</h4>
    <div class="ana-legende small"><span><i style="background:var(--ok)"></i>Main gardable</span><span><i style="background:var(--line2)"></i>À mulliganer</span></div>
    ${anaColonnes(cols, {hauteur:90})}
    <h4 class="ana-h4">Poser un terrain chaque tour <span class="small muted">· au moins N terrains vus au tour N</span></h4>
    ${anaColonnes(poses, {hauteur:70, max:1})}
    <h4 class="ana-h4">Voir un rôle tôt <span class="small muted">· au moins une carte</span></h4>
    <div class="scroll"><table class="tbl ana-tbl">
      <thead><tr><th>Rôle</th><th>Cartes</th><th>En main</th><th>Au tour 3</th><th>Au tour 5</th></tr></thead>
      <tbody>${M.roles.map(r => `<tr><td>${esc(CATLABEL[r.r] || r.r)}</td><td class="mono">${r.K}</td>
        <td class="mono">${pctAna(r.main)}</td><td class="mono">${pctAna(r.t3)}</td><td class="mono">${pctAna(r.t5)}</td></tr>`).join('')}</tbody>
    </table></div>
    <div class="small muted" style="margin-top:6px">Probabilités exactes (loi hypergéométrique), commandant hors de la bibliothèque.
      ${piocheSautee() ? 'On joue en premier : pas de pioche au premier tour.' : 'En multijoueur, chacun pioche dès son premier tour.'}
      Les terrains de rôle (un terrain qui cherche un terrain) ne comptent pas comme accélérateurs ici.</div>
    <h4 class="ana-h4">Main d'essai</h4>
    <div id="anaMain">${anaMainVue()}</div>`;
}

function anaMiseEnPlace(A) {
  const R = A.sim;
  if (!R.parties) return '<div class="empty">Trop peu de cartes pour jouer des parties d\'essai.</div>';
  const tours = 8;
  const cols = Array.from({length:tours}, (_, i) => {
    const m = R.mana[i + 1] / R.parties;
    return {label:`T${i + 1}`, v:m, texte:nombreAna(m, 1), couleur:'var(--brass-d)',
      titre:`Mana disponible en moyenne au tour ${i + 1} : ${nombreAna(m, 2)}`};
  });
  const cmd = A.cmd;
  return `${anaColonnes(cols, {hauteur:90})}
    <div class="statgrid ana-mini">
      ${anaTuile(R.atteint4 ? nombreAna(R.tour4 / R.atteint4, 1) : '—', 'Tour des 4 mana', {sous:`${pctAna(partAtteinteAuTour(R.premier4, 4, R.parties))} au tour 4`})}
      ${anaTuile(R.atteint6 ? nombreAna(R.tour6 / R.atteint6, 1) : '—', 'Tour des 6 mana', {sous:`${pctAna(partAtteinteAuTour(R.premier6, 6, R.parties))} au tour 6`})}
      ${anaTuile(pctAna(R.rate[3] / R.parties), 'Terrain raté au tour 3', {sous:`${pctAna(R.rate[4] / R.parties)} au tour 4`})}
      ${cmd ? anaTuile(pctAna(R.cmdATemps / R.parties), 'Commandant à temps', {sous:`${esc(cmd.name)} au tour ${Math.max(1, cmd.cmc)}`}) : ''}
    </div>
    <div class="small muted" style="margin-top:6px">${R.parties} parties jouées seul, sans mulligan : un terrain par tour s'il y en a un en main, puis les
      accélérateurs que le mana paie, du moins cher au plus cher, leur mana arrivant au tour suivant. Les couleurs n'y comptent pas.
      Les mélanges partent de l'empreinte du deck : les chiffres ne changent que si le deck change.</div>`;
}
