/* =====================================================================
   js/simResultats.js — Les résultats d'un lot, l'historique, le classement

   Un taux de victoire seul ne dit rien : il se lit à côté de son intervalle
   de confiance, de l'attendu d'une table de N joueurs, et de la fiabilité
   que donne la couverture des decks. Le reste — places, durée, causes de
   défaite, mana, cartes — dit pourquoi.
   ===================================================================== */

const pct = x => x == null ? '—' : Math.round(x * 100) + ' %';
const un = x => x == null ? '—' : x.toFixed(1).replace('.', ',');
const CAUSES = {vie: 'points de vie', poison: 'poison', commandant: 'dégâts de commandant', bibliotheque: 'bibliothèque vide'};
const FIABILITE = {bonne: 'fiabilité bonne', moyenne: 'fiabilité moyenne', faible: 'fiabilité faible'};

/* Des barres horizontales, une par ligne. */
function barresHTML(lignes) {
  const max = Math.max(1, ...lignes.map(l => l[1]));
  return `<div class="sim-barres">${lignes.map(([lib, v, txt]) => `<div class="sim-barre">
    <span class="small">${esc(lib)}</span>
    <span class="track"><span class="fill" style="width:${Math.round(v / max * 100)}%"></span></span>
    <span class="small mono">${esc(txt != null ? txt : String(v))}</span></div>`).join('')}</div>`;
}

/* Le tableau des cartes du deck testé. */
function cartesHTML(r) {
  const cartes = r.cartes.filter(c => !c.terrain);
  if (!cartes.length) return '';
  return `<details class="sim-bloc"><summary><b>Les cartes du deck testé</b>
    <span class="small muted">— « en main » : taux de victoire quand la carte a été piochée ; « gain » : ce taux moins celui des parties où elle ne l'a pas été</span></summary>
    <div class="scroll"><table class="tbl"><thead><tr><th>Carte</th><th>Piochée</th><th>En main</th><th>Gain</th><th>Lancée</th><th>Morte en main</th></tr></thead>
    <tbody>${cartes.map(c => `<tr class="${c.piochee < 10 ? 'sim-maigre' : ''}">
      <td>${esc(c.nom)}</td><td>${c.piochee}</td><td>${pct(c.gih)}</td>
      <td>${c.iwd == null ? '—' : (c.iwd >= 0 ? '+' : '') + Math.round(c.iwd * 100) + ' pts'}</td>
      <td>${c.piochee ? un(c.lancee / c.piochee) : '—'}</td><td>${pct(c.partMorte)}</td></tr>`).join('')}</tbody></table></div>
    <div class="small muted">En gris : moins de dix parties où la carte a été piochée, trop peu pour conclure.</div>
  </details>`;
}

/* Les parties d'un lot, pour en revoir une. */
function partiesHTML(lot) {
  const RES = {v: 'victoire', d: 'défaite', n: 'nulle', e: 'erreur'};
  return `<details class="sim-bloc"><summary><b>Revoir une partie</b>
    <span class="small muted">— rejouée depuis sa graine, tour par tour</span></summary>
    <div class="sim-parties">${lot.parties.slice(0, 120).map((p, k) => `<button type="button" class="btn sm sim-res-${p[2]}"
      data-act="simRevoir" data-lot="${esc(lot.id)}" data-k="${k}" title="Partie ${p[0] + 1} : ${RES[p[2]]}, place ${p[1] + 1}, ${p[4]} tour(s) de table">${p[0] + 1}</button>`).join('')}</div>
  </details>`;
}

/* Le résumé d'un lot. */
function lotHTML(lot) {
  const r = lot.resume, perime = lotPerime(lot);
  const noms = [lot.deckNom, ...lot.advNoms];
  return `<div class="sim-bloc">
    <h3>${esc(lot.deckNom)} contre ${esc(lot.advNoms.join(', '))}</h3>
    <div class="small muted">${new Date(lot.date).toLocaleString('fr-FR')} · ${r.n} parties à ${lot.nbJoueurs} joueurs · graine ${lot.graine}
      ${lot.arrete ? ' · arrêté avant la fin' : ''}${perime ? ` · <b>périmé</b> (${esc(perime)} changé depuis)` : ''}</div>
    <div class="sim-tuiles">
      <div class="sim-tuile"><span class="small muted">Victoires</span><b>${pct(r.taux)}</b>
        <span class="small">${r.v} / ${r.n} · IC 95 % ${pct(r.bas)}–${pct(r.haut)}</span></div>
      <div class="sim-tuile" title="Le taux de victoire rapporté à l'attendu d'une table de ${lot.nbJoueurs} joueurs : 1,0 = au niveau de la table">
        <span class="small muted">Indice de force</span><b>${r.indice.toFixed(2).replace('.', ',')}</b>
        <span class="small">${r.indiceBas.toFixed(2).replace('.', ',')}–${r.indiceHaut.toFixed(2).replace('.', ',')}</span></div>
      <div class="sim-tuile"><span class="small muted">Durée</span><b>${un(r.rondes)}</b><span class="small">tours de table en moyenne</span></div>
      <div class="sim-tuile"><span class="small muted">Fiabilité</span><b class="sim-badge ${lot.fiabilite.niveau}">${FIABILITE[lot.fiabilite.niveau]}</b>
        <span class="small">couverture ${pct(lot.fiabilite.taux)}</span></div>
    </div>
    ${r.nul || r.erreurs ? `<div class="small muted">${r.nul} nulle(s)${r.erreurs ? ` · ${r.erreurs} partie(s) en erreur : ${esc(r.exempleErreur || '')}` : ''}</div>` : ''}
    <div class="sim-grille">
      <div><h4>Qui gagne</h4>${barresHTML(noms.map((nm, i) => [nm, r.victoiresPar[i], `${r.victoiresPar[i]} (${pct(r.n ? r.victoiresPar[i] / r.n : 0)})`]))}</div>
      <div><h4>Selon la place</h4>${barresHTML(r.parPlace.map((p, i) => [`${i + 1}${i ? 'e' : 'er'} à jouer`, p.n ? p.v / p.n : 0, `${pct(p.n ? p.v / p.n : 0)} sur ${p.n}`]))}</div>
      <div><h4>Comment il perd</h4>${Object.keys(r.causes).length ? barresHTML(Object.keys(r.causes).map(k => [CAUSES[k] || k, r.causes[k]])) : '<div class="small muted">—</div>'}</div>
      <div><h4>Le tempo</h4><div class="small">
        Victoire au tour ${un(r.tourVictoire)} du deck en moyenne, défaite au tour ${un(r.tourDefaite)}.<br>
        Mulligans : ${un(r.mulligans)} par partie, ${pct(r.partMull)} des mains rendues.<br>
        Manque de mana (deux terrains ou moins à son 4e tour) : ${pct(r.manque)}.<br>
        Mana dépensé sur mana disponible : ${pct(r.efficacite)}.<br>
        ${r.tourCmd != null ? `Commandant lancé au tour ${un(r.tourCmd)} en moyenne (${pct(r.partCmd)} des parties).<br>` : ''}
        Dégâts infligés : ${un(r.degats)} par partie.</div></div>
    </div>
  </div>
  ${cartesHTML(r)}
  ${partiesHTML(lot)}`;
}

/* L'historique des lots et le classement des decks sur la table choisie. */
function historiqueHTML(cfg) {
  if (!SIM_RES.lots.length) return '';
  const table = cfg.nbJoueurs + ':' + cfg.sieges.slice().sort().join(',');
  const cl = classement(table);
  return `<div class="sim-grille">
    <div class="sim-bloc"><h3>Classement sur cette table</h3>
      ${cl.length ? `<table class="tbl"><thead><tr><th>Deck</th><th>Indice</th><th>Victoires</th><th>Parties</th></tr></thead><tbody>
        ${cl.map(l => `<tr><td>${esc(l.deckNom)}${lotPerime(l) ? ' <span class="small muted">(périmé)</span>' : ''}</td>
          <td>${l.resume.indice.toFixed(2).replace('.', ',')}</td><td>${pct(l.resume.taux)}</td><td>${l.resume.n}</td></tr>`).join('')}</tbody></table>`
        : '<div class="small muted">Aucun lot sur cette table : lancez-en un pour chaque deck à comparer.</div>'}
      <div class="small muted">Les parties d'une même graine opposent les mêmes mélanges adverses : deux decks testés sur la même table se comparent à armes égales.</div>
    </div>
    <div class="sim-bloc"><h3>Historique</h3><div class="sim-liste">${SIM_RES.lots.map(l => `<div class="sim-ligne${SIM_RES.vu === l.id ? ' actif' : ''}">
      <span class="small">${new Date(l.date).toLocaleDateString('fr-FR')}</span> <b>${esc(l.deckNom)}</b>
      <span class="small muted">vs ${esc(l.advNoms.join(', '))} · ${pct(l.resume.taux)} · indice ${l.resume.indice.toFixed(2).replace('.', ',')}</span>
      <span class="sim-gestes"><button type="button" class="btn sm" data-act="simVoirLot" data-lot="${esc(l.id)}">Voir</button>
        <button type="button" class="btn sm" data-act="simSupprLot" data-lot="${esc(l.id)}" title="Supprimer ce lot">✕</button></span>
    </div>`).join('')}</div></div>
  </div>`;
}

function resultatsHTML(cfg) {
  const lot = (SIM_RES.vu && lotParId(SIM_RES.vu)) || SIM_RES.lots[0];
  return (lot ? lotHTML(lot) : '') + historiqueHTML(cfg);
}
