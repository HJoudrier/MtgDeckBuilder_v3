/* =====================================================================
   js/anaVueFamilles.js — Les blocs des familles de capacités et des rôles

   Ce que le deck produit et ce dont il se nourrit, famille par famille ; les
   rôles au regard des objectifs du format ; les mots-clés ; la façon dont il
   répond à l'adversaire. Les chiffres viennent de js/anaFamilles.js.
   ===================================================================== */

function anaFamillesVue() {
  const F = familles();
  if (!F.total) return '<div class="empty">Aucune carte à analyser.</div>';
  const max = Math.max(1, ...F.liste.map(g => Math.max(g.produit, g.nourrit)));
  const lignes = F.liste.filter(g => g.produit || g.nourrit).sort((a, b) => (b.produit + b.nourrit) - (a.produit + a.nourrit));
  return `<div class="ana-familles">${lignes.map(g => `<div class="ana-famille">
      <div class="ana-famille-t"><span class="dot" style="background:${g.couleur}"></span><b>${esc(g.label)}</b></div>
      ${anaBarre('produisent', g.produit, max, {couleur:g.couleur, titre:`${g.produit} carte(s) dont un effet relève de la famille « ${g.label} »`})}
      ${anaBarre('s\'en nourrissent', g.nourrit, max, {couleur:g.couleur, titre:`${g.nourrit} carte(s) qui se déclenchent sur un évènement de la famille « ${g.label} », ou le consomment dans un coût`})}
      <div class="small muted ana-famille-n">${g.noeuds.map(n => `${esc(n.label)} ${n.n}`).join(' · ') || '—'}</div>
    </div>`).join('')}</div>
    <div class="small muted" style="margin-top:6px">Sur ${F.total} carte(s) différentes, terrains de base exclus. Une carte compte une fois par famille.
      Les deux productions que toute carte porte — arriver en jeu, être lancée — ne comptent pas. Le détail nomme les effets les plus produits.</div>`;
}

function anaRolesVue() {
  const tgt = targets();
  const tous = {};
  deckEntries().forEach(e => e.card.cats.forEach(c => tous[c] = (tous[c] || 0) + e.qty));
  const roles = Object.keys(CATLABEL).filter(r => r in tgt || tous[r]);
  const taille = Math.max(1, deckSize());
  const max = Math.max(1, ...roles.map(r => Math.max(tous[r] || 0, tgt[r] || 0)));
  return `<div class="ana-barres">${roles.map(r => {
    const v = tous[r] || 0, t = tgt[r];
    const col = t == null ? 'var(--brass-d)' : (v >= t ? 'var(--ok)' : (v >= t * 0.6 ? 'var(--warn)' : 'var(--bad)'));
    const ecart = t == null ? '' : (v >= t ? ' · objectif atteint' : ` · ${t - v} sous l'objectif`);
    return anaBarre(esc(CATLABEL[r]), v, max, {couleur:col,
      texte:`${v}${t != null ? ` / ${t} ${v >= t ? 'ok' : `(−${t - v})`}` : ''} · ${pctAna(v / taille)}`,
      titre:`${CATLABEL[r]} : ${v} exemplaire(s)${t != null ? `, objectif ${t}` : ''}${ecart}`});
  }).join('')}</div>
  <div class="small muted" style="margin-top:6px">Objectifs du format, réglables dans l'onglet Construction (pinceau de « Équilibre des rôles »).
    Une carte peut tenir plusieurs rôles.</div>`;
}

function anaMotsClesVue() {
  const mk = motsClesDuDeck();
  if (!mk.length) return '<div class="small muted">Aucun mot-clé de combat ou de protection relevé.</div>';
  return `<div class="ana-puces">${mk.map(m => `<span class="pill" title="${esc(m.k)}">${esc(m.label)} <b>${m.n}</b></span>`).join('')}</div>`;
}

function anaInteractionVue() {
  const I = profilInteraction();
  if (!I.total) return '<div class="small muted">Aucune carte d\'interaction : le deck ne répond pas à ce que font les adversaires.</div>';
  const max = Math.max(1, ...I.moyens.map(m => m.q));
  return `<div class="statgrid ana-mini">
      ${anaTuile(String(I.total), 'Interaction')}
      ${anaTuile(pctAna(I.rapide / I.total), 'À vitesse d\'éphémère', {sous:`${I.rapide} carte(s), flash compris`})}
      ${anaTuile(String(I.cible), 'Ciblée')}
      ${anaTuile(String(I.masse), 'De masse', {sous:'board wipes'})}
    </div>
    <div class="ana-barres">${I.moyens.map(m => anaBarre(esc(m.label), m.q, max)).join('')}</div>`;
}
