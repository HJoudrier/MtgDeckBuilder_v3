/* =====================================================================
   js/tableRendu.js — La table, peinte depuis une vue

   La même peinture sert l'hôte et l'invité : elle ne lit qu'une vue
   (js/jeuVue.js) et une question, jamais l'état de la partie. Les
   adversaires en bandeaux, la pile, mon champ, ma main, la question en bas
   — pensé d'abord pour un téléphone tenu en portrait.

   Exception assumée à « `renderAll()` est l'unique porte du repeint » : la
   table se repeint à chaque message de la partie, des dizaines de fois par
   minute, et n'a rien à voir avec les listes de l'atelier. `renderAll()`
   l'appelle aussi, pour le salon.
   ===================================================================== */

/* Le visuel d'une carte : celui que l'atelier connaît, sinon celui que
   Scryfall sert par son nom. */
function imageCarte(nom) {
  const c = typeof find === 'function' ? find(nom) : null;
  return (c && (c.imgN || c.img)) || 'https://api.scryfall.com/cards/named?format=image&version=normal&exact=' +
    encodeURIComponent(String(nom).split(' // ')[0]);
}

/* Une carte du champ, de la main ou d'une zone, en vignette de texte :
   lisible sans réseau, et dix fois plus dense qu'une image sur un
   téléphone. */
function chipCarte(o, v) {
  const etat = etatChoix(o.id);
  const fiche = v.cartes[o.nom] || {};
  const pt = o.types && o.types.includes('creature') ? `<span class="tb-pt">${o.f}/${o.e - (o.bless || 0)}</span>` : '';
  const loy = o.marq && o.marq.loyaute ? `<span class="tb-pt">◆${o.marq.loyaute}</span>` : '';
  const plus = o.marq && o.marq['+1/+1'] ? `<span class="tb-marq">+${o.marq['+1/+1']}</span>` : '';
  const tags = [o.attaque ? '⚔' : '', o.bloque != null ? '🛡' : '', o.cmd ? '★' : ''].join('');
  return `<button type="button" class="tb-carte${o.engage ? ' engage' : ''}${o.malade ? ' malade' : ''}${o.jeton ? ' jeton' : ''}${etat ? ' ' + etat : ''}"
    data-act="tCarte" data-id="${o.id}" title="${esc(o.nom + (fiche.texte ? ' — ' + fiche.texte : ''))}">
    <span class="tb-nom">${esc(o.nom)}</span>${pt}${loy}${plus}${tags ? `<span class="tb-tag">${tags}</span>` : ''}</button>`;
}

/* Le bandeau d'un joueur : son nom, ses points de vie, ses zones, son champ. */
function bandeauJoueur(J, v, estMoi) {
  const champ = v.champ.filter(o => o.ctrl === J.i);
  const terrains = champ.filter(o => o.types.includes('land')), autres = champ.filter(o => !o.types.includes('land'));
  const etatJ = etatJoueur(J.i);
  const cmd = Object.keys(J.degatsCmd || {}).map(k => J.degatsCmd[k]).filter(n => n > 0);
  return `<div class="tb-joueur${estMoi ? ' moi' : ''}${v.actif === J.i ? ' actif' : ''}${J.elimine ? ' elimine' : ''}">
    <button type="button" class="tb-entete${etatJ ? ' ' + etatJ : ''}" data-act="tJoueur" data-j="${J.i}">
      <b>${esc(J.nom)}</b> <span class="tb-vie">${J.vie} PV</span>${J.poison ? ` <span class="tb-poison">${J.poison} poison</span>` : ''}
      ${cmd.length ? ` <span class="small">cmd ${Math.max(...cmd)}</span>` : ''}
      <span class="small muted">main ${J.main} · biblio ${J.bib} · cimetière ${J.cim.length}${J.exil.length ? ' · exil ' + J.exil.length : ''}</span>
      ${J.elimine ? ` <span class="small">éliminé (${esc(CAUSES[J.raison] || J.raison || '')})</span>` : ''}
    </button>
    ${J.cmd.length ? `<div class="tb-zone">${J.cmd.map(c => chipCarte({...c, cmd: true}, v)).join('')}</div>` : ''}
    <div class="tb-champ">${autres.map(o => chipCarte(o, v)).join('')}</div>
    <div class="tb-champ tb-terrains">${terrains.map(o => chipCarte(o, v)).join('')}</div>
    ${J.cim.some(c => etatChoix(c.id)) ? `<div class="tb-zone"><span class="small muted">cimetière :</span> ${J.cim.map(c => chipCarte(c, v)).join('')}</div>` : ''}
  </div>`;
}

function pileHTML(v) {
  if (!v.pile.length) return '';
  return `<div class="tb-pile"><span class="small muted">Pile</span>${v.pile.slice().reverse().map(it => {
    const e = etatChoix(it.id);
    return `<button type="button" class="tb-carte pile${e ? ' ' + e : ''}" data-act="tCarte" data-id="${it.id}">
      <span class="tb-nom">${esc(it.nom)}</span><span class="small">${esc(v.joueurs[it.ctrl].nom)}${it.cibles.length ? ' → ' + esc(it.cibles.join(', ')) : ''}</span></button>`;
  }).join('')}</div>`;
}

/* Les dernières lignes du journal, qui disent ce que les autres ont fait. */
function journalTableLignes() { return TABLE.role === 'hote' ? journalTable() : (TABLE.journal || []); }

function detailHTML(v) {
  const d = TABLE.detail;
  if (!d) return '';
  const f = (v && v.cartes[d]) || {};
  return `<div class="tb-detail" role="dialog">
    <div class="row"><b>${esc(d)}</b> ${f.cout ? manaHTML(f.cout) : ''}<button type="button" class="btn sm" data-act="tFermeDetail" style="margin-left:auto">✕</button></div>
    <div class="tb-detail-corps"><img src="${esc(imageCarte(d))}" alt="" loading="lazy">
      <div><div class="small muted">${esc(f.type || '')}${f.f != null && f.e != null ? ` · ${f.f}/${f.e}` : ''}</div>
        <div class="small">${esc(f.texte || '').replace(/ \/\/ /g, '<br>')}</div>
        ${f.couv && f.couv !== 'complete' ? `<div class="small muted">Le moteur la comprend : ${esc(f.couv)}</div>` : ''}</div></div>
  </div>`;
}

function partieHTML() {
  const v = TABLE.vue;
  if (!v) return '<div class="tb-attente">Préparation de la partie…</div>';
  const moi = v.joueurs[v.moi];
  const autres = [];
  for (let k = 1; k < v.joueurs.length; k++) autres.push(v.joueurs[(v.moi + k) % v.joueurs.length]);
  const journal = journalTableLignes().slice(-3);
  return `<div class="tb-tete">
      <b>Tour ${v.tour}</b> <span class="small">${esc(NOMS_ETAPES[v.etape] || v.etape || '')} · ${esc(v.joueurs[v.actif].nom)}</span>
      <span class="tb-gestes"><button type="button" class="btn sm" data-act="tArrets">Arrêts</button>
        <button type="button" class="btn sm" data-act="tJournal">Journal</button>
        <button type="button" class="btn sm" data-act="tQuitter">Quitter</button></span>
    </div>
    ${typeof alertesInvitesHTML === 'function' ? alertesInvitesHTML() : ''}${TABLE.liaisonPerdue ? perteHoteHTML() : ''}
    <div class="tb-adversaires">${autres.map(J => bandeauJoueur(J, v, false)).join('')}</div>
    ${pileHTML(v)}
    <div class="tb-journal small muted">${journal.map(l => esc(l.txt)).join(' · ')}</div>
    ${bandeauJoueur(moi, v, true)}
    <div class="tb-main"><span class="small muted">Main</span>${v.main.map(c => chipCarte(c, v)).join('') || '<span class="small muted">vide</span>'}</div>
    <div class="tb-question">${questionHTML(TABLE.question, v)}</div>
    ${detailHTML(v)}`;
}

function finHTML(v) {
  if (!v || !v.fin) return '';
  const f = v.fin;
  const txt = f.nulle ? `Partie nulle (${f.raison})` : f.gagnant === v.moi ? 'Vous avez gagné !' : `${v.joueurs[f.gagnant].nom} gagne.`;
  return `<div class="tb-fin"><b>${esc(txt)}</b> <button type="button" class="btn sm pri" data-act="tQuitter">Quitter la table</button></div>`;
}

/* Peindre la table, si elle est ouverte. */
function renduTable() {
  const el = document.getElementById('table');
  if (!el) return;
  el.hidden = !TABLE.ouverte;
  document.body.classList.toggle('table-ouverte', TABLE.ouverte);
  if (!TABLE.ouverte) { el.innerHTML = ''; return; }
  if (TABLE.phase === 'salon') el.innerHTML = salonHTML();
  else if (TABLE.phase === 'rejoindre' && typeof rejoindreHTML === 'function') el.innerHTML = rejoindreHTML();
  else el.innerHTML = partieHTML() + finHTML(TABLE.vue);
}
