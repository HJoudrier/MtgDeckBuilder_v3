/* =====================================================================
   js/tableJoueurs.js — Ce qu'on sait d'un joueur, d'un coup d'œil

   Les points de vie en grand ; en nombres, ce qu'on ne voit pas — les
   cartes en main, la bibliothèque — et ce qu'on ne déplie qu'à la demande :
   le cimetière, l'exil. Poison, énergie, dégâts de commandant et mana
   flottant n'apparaissent que lorsqu'ils comptent.
   ===================================================================== */

/* Le mana qu'un joueur a en réserve, en symboles. */
function reserveHTML(J) {
  const p = J.pool || {};
  const s = 'WUBRGC'.split('').filter(c => p[c] > 0);
  return s.length ? `<span class="tj-reserve" title="mana en réserve">${s.map(c => symIcon(c, 'sm') + (p[c] > 1 ? `<small>${p[c]}</small>` : '')).join('')}</span>` : '';
}

/* Les compteurs d'un joueur. Le cimetière et l'exil s'ouvrent d'un toucher. */
function compteursHTML(J) {
  const cmd = Math.max(0, ...Object.values(J.degatsCmd || {}));
  return `${J.poison ? `<span class="tj-c poison" title="marqueurs poison">☠${J.poison}</span>` : ''}
    ${cmd ? `<span class="tj-c cmd" title="dégâts de commandant reçus (le plus haut)">★${cmd}</span>` : ''}
    ${J.energie ? `<span class="tj-c" title="énergie">⚡${J.energie}</span>` : ''}
    <span class="tj-c" title="cartes en main"><i class="tj-dos"></i>${J.main}</span>
    <span class="tj-c" title="bibliothèque"><i class="tj-dos pile"></i>${J.bib}</span>
    <button type="button" class="tj-c tj-zone" data-act="tZone" data-j="${J.i}" data-z="cim" title="cimetière">cim ${J.cim.length}</button>
    ${J.exil.length ? `<button type="button" class="tj-c tj-zone" data-act="tZone" data-j="${J.i}" data-z="exil" title="exil">exil ${J.exil.length}</button>` : ''}
    ${reserveHTML(J)}`;
}

/* Le cartouche d'un joueur. Toucher son nom le désigne, quand une question
   attend un joueur pour cible. */
function cartouche(J, v, classe = '') {
  const etat = etatJoueur(J.i);
  const vie = J.vie <= 5 ? ' bas' : J.vie <= 10 ? ' moyen' : '';
  return `<div class="tj${v.actif === J.i ? ' actif' : ''}${v.prio === J.i ? ' prio' : ''}${J.elimine ? ' elimine' : ''} ${classe}">
    <button type="button" class="tj-nom${etat ? ' ' + etat : ''}" data-act="tJoueur" data-j="${J.i}" data-ancre-j="${J.i}">
      <span class="tj-vie${vie}" title="points de vie">${J.vie}</span><b>${esc(J.nom)}</b>${v.prio === J.i ? '<span class="tj-prio">priorité</span>' : ''}</button>
    <span class="tj-compteurs">${J.elimine ? `<span class="tj-c">éliminé · ${esc(CAUSES[J.raison] || J.raison || '')}</span>` : compteursHTML(J)}</span>
  </div>`;
}

const NOMS_ZONES = {cim: 'Cimetière', exil: 'Exil'};

/* Le cimetière ou l'exil d'un joueur, déplié en cartes entières. Ses cartes
   se touchent comme celles du champ : une cible s'y choisit. */
function zoneHTML(v) {
  const z = TABLE.zone;
  if (!z || !v || !v.joueurs[z.j]) return '';
  const J = v.joueurs[z.j], cartes = z.z === 'exil' ? J.exil : J.cim;
  return `<div class="tl-voile" data-act="tFermeZone"></div>
    <div class="tz" role="dialog" aria-label="${esc(NOMS_ZONES[z.z])}">
      <div class="tz-tete"><b>${esc(NOMS_ZONES[z.z])} de ${esc(J.nom)}</b> <span class="muted">${cartes.length}</span>
        <button type="button" class="btn sm" data-act="tFermeZone">✕</button></div>
      <div class="tz-cartes">${cartes.slice().reverse().map(c => tuile(c, v)).join('') || '<span class="small muted">vide</span>'}</div>
    </div>`;
}
