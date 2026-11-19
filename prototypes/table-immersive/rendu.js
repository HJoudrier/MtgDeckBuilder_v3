/* =====================================================================
   rendu.js — Les pièces communes de la table : une carte, un champ, un
   joueur, la pile, la main, les étapes

   Chaque maquette compose son écran avec ces pièces et y ajoute ses
   commandes. Une carte se peint toujours ici : c'est ce qui garantit
   qu'elle porte son `data-id`, et donc qu'elle voyage.
   ===================================================================== */

const esc = s => String(s).replace(/[&<>"]/g, c => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;'}[c]));
const teinte = c => c.mana || ((c.cout || '').match(/[WUBRG]/) || ['C'])[0];

const ICONES = {
  bib: '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="6" y="3" width="13" height="17" rx="2"/><path d="M4 6v13a2 2 0 0 0 2 2h11" fill="none" stroke-width="2"/></svg>',
  cim: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 21V10a6 6 0 0 1 12 0v11z"/></svg>',
  main: '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="6" width="10" height="14" rx="2" transform="rotate(-12 8 13)"/><rect x="11" y="4" width="10" height="14" rx="2" transform="rotate(10 16 11)"/></svg>'
};

function pips(cout) {
  return [...String(cout || '')].map(s => /\d/.test(s) ? `<i class="pip p-C">${s}</i>` : `<i class="pip p-${s}"></i>`).join('');
}

function ptHTML(o) {
  const c = Scene.def(o), f = Scene.force(o), e = Scene.endurance(o);
  const sens = f > c.f || e > c.e ? ' plus' : f < c.f || e < c.e ? ' moins' : '';
  return `<span class="k-pt${sens}${o.bless ? ' blesse' : ''}">${f}/${Scene.reste(o)}</span>`;
}

/* Une carte. `o` est un objet de la scène ; `opts` : act (le geste du
   toucher), glisse (ce qu'on fait en la faisant glisser), classe, style,
   extra (ce qu'on pose dessus), sansNom, sansId (une copie qui ne doit
   pas voyager : celle de la loupe). */
function carteHTML(o, K, opts = {}) {
  const c = Scene.def(o), t = teinte(c), surChamp = o.zone === 'champ';
  const cls = ['k', 'k-' + t, c.terrain ? 'terrain' : '', o.engage ? 'engage' : '', o.attaque ? 'attaque' : '', o.bloque ? 'bloqueur' : '',
    K.jou.has(o.id) ? 'jouable' : '', K.cib.has(o.id) ? 'cible-ok' : '', K.sel === o.id || K.vise === o.id ? 'choisie' : '',
    K.elig.has(o.id) ? 'peut-att' : '', K.att.has(o.id) ? 'va-att' : '', surChamp && o.malade ? 'malade' : '', opts.classe || ''].filter(Boolean).join(' ');
  const mots = surChamp ? [c.vol ? 'vol' : '', c.celerite ? 'célérité' : ''].filter(Boolean) : [];
  const ident = opts.sansId ? `data-ref="${o.id}"` : `data-id="${o.id}"`;
  return `<div class="${cls}" ${ident} data-act="${opts.act || 'carte'}"${opts.glisse ? ` data-glisse="${opts.glisse}"` : ''}${opts.style ? ` style="${opts.style}"` : ''}
    role="button" tabindex="0" aria-label="${esc(c.nom)}"><div class="k-corps"><div class="k-art"><svg viewBox="0 0 24 24" aria-hidden="true">${GLYPHES[c.glyphe] || ''}</svg></div>
    ${opts.sansNom ? '' : `<div class="k-nom">${esc(c.nom)}</div>`}${c.cout ? `<div class="k-cout">${pips(c.cout)}</div>` : ''}</div>
    ${c.f != null ? ptHTML(o) : ''}${mots.length ? `<span class="k-mots">${mots.join(' · ')}</span>` : ''}${surChamp && o.malade ? '<span class="k-zz" title="Mal d\'invocation">z</span>' : ''}${opts.extra || ''}</div>`;
}

/* Le champ d'un joueur : les créatures devant, les terrains derrière. Chez
   Mirela, « devant » est en bas, vers soi. */
function champHTML(j, K, opts = {}) {
  const champ = Scene.dans(j, 'champ');
  const crea = champ.filter(x => !Scene.def(x).terrain), terres = champ.filter(x => Scene.def(x).terrain);
  const front = `<div class="rang front">${crea.map(x => carteHTML(x, K, opts.crea ? opts.crea(x) : {})).join('') || '<span class="rang-vide">aucune créature</span>'}</div>`;
  const fond = `<div class="rang terres">${terres.map(x => carteHTML(x, K, {sansNom: true})).join('')}</div>`;
  return j === 'adv' ? fond + front : front + fond;
}

function joueurHTML(j, K, opts = {}) {
  const E = K.E, J = E.joueurs[j], vie = J.vie;
  const cls = ['jr', 'jr-' + j, E.actif === j ? 'actif' : '', K.cib.has(j) ? 'cible-ok' : '', opts.classe || ''].filter(Boolean).join(' ');
  const main = Scene.dans(j, 'main').length, cim = Scene.dans(j, 'cim').length;
  return `<div class="${cls}" data-joueur="${j}" data-act="joueur">
    <span class="jr-av" aria-hidden="true">${esc(J.nom[0])}</span><span class="jr-nom">${esc(J.nom)}</span>
    <span class="jr-vie${vie <= 5 ? ' bas' : ''}" data-vie="${j}" aria-label="${vie} points de vie">${vie}</span>
    <span class="jr-zones">${j === 'adv' ? `<span class="jr-z" data-ancre="main-adv" title="Main de Mirela">${ICONES.main}${main}</span>` : ''}
      <span class="jr-z" data-ancre="bib-${j}" title="Bibliothèque">${ICONES.bib}${E.bib[j].length}</span>
      <span class="jr-z" data-ancre="cim-${j}" title="Cimetière">${ICONES.cim}${cim}</span></span>${opts.extra || ''}</div>`;
}

/* La pile, du fond au sommet : le sommet est la dernière carte, devant. */
function pileHTML(K, opts = {}) {
  const E = K.E;
  if (!E.pile.length) return '';
  return `<div class="pile ${opts.classe || ''}">${E.pile.map((id, i) => {
    const x = Scene.obj(id);
    return carteHTML(x, K, {classe: 'sur-pile de-' + x.ctrl + (i === E.pile.length - 1 ? ' sommet' : ''), style: `--i:${i}`});
  }).join('')}</div>`;
}

/* La main. En éventail, chaque carte tourne de quelques degrés — son corps
   tourne, pas elle, pour que la mesure reste juste. */
function mainHTML(K, opts = {}) {
  const m = Scene.dans('moi', 'main').filter(x => x.id !== opts.sauf), n = m.length;
  const cartes = m.map((x, i) => {
    const r = opts.eventail ? i - (n - 1) / 2 : 0;
    return carteHTML(x, K, {glisse: opts.glisse, act: opts.act,
      style: opts.eventail ? `--rot:${(r * opts.eventail).toFixed(1)}deg;--lev:${(r * r * opts.eventail * .55).toFixed(1)}px` : ''});
  }).join('');
  return `<div class="main ${opts.eventail ? 'eventail' : 'rangee'} ${opts.classe || ''}" data-ancre="main-moi">${cartes || '<span class="main-vide">Main vide</span>'}</div>`;
}

function phasesHTML(opts = {}) {
  const E = Scene.E, k = ORDRE_PHASES.indexOf(E.phase);
  return `<ol class="ph ${opts.classe || ''}" aria-label="Étapes du tour">${ORDRE_PHASES.map((p, i) =>
    `<li class="${i < k ? 'passee' : i === k ? 'en-cours' : ''}${E.arrets.has(p) ? ' arret' : ''}" data-ph="${p}"${i === k ? ' aria-current="step"' : ''}><span>${PHASES[p].court}</span></li>`).join('')}</ol>`;
}

function filHTML() {
  const l = Scene.E.journal.filter(x => !/^— Tour/.test(x)).slice(-1)[0];
  return l ? `<span class="fil">${esc(l)}</span>` : '';
}

function tourHTML() {
  const E = Scene.E;
  return `<span class="tour-chip${E.actif === 'adv' ? ' adv' : ''}">${E.actif === 'moi' ? 'Votre tour' : 'Tour de Mirela'} · ${E.tour}</span>`;
}

/* La table la plus courante : Mirela en haut, soi en bas, la main au pied,
   et au milieu ce que chaque maquette y met. */
function plateau(K, o = {}) {
  return `<div class="pl ${o.classe || ''}">
    ${joueurHTML('adv', K)}
    <div class="champ champ-adv">${champHTML('adv', K, o)}</div>
    <div class="pl-milieu">${o.milieu || ''}</div>
    <div class="champ champ-moi">${champHTML('moi', K, o)}</div>
    ${joueurHTML('moi', K)}
    <div class="pl-main">${o.main || ''}</div>
    ${o.apres || ''}
  </div>`;
}
