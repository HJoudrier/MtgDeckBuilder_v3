/* =====================================================================
   js/tableCartes.js — Une carte posée sur la table

   Le visuel de la carte, et par-dessus ce que la partie lui a fait : la
   force du moment, les blessures, les marqueurs, l'engagement, le combat.
   Sous le visuel, un cadre de texte aux couleurs de son coût : c'est lui
   qu'on lit quand le visuel manque. Deux formes : la carte entière, et la
   vignette — l'illustration seule et le nom dessous, plus dense et lisible
   sur un téléphone.

   Les badges sont posés hors du corps de la carte : une carte engagée se
   couche, ses nombres restent droits.
   ===================================================================== */

const NOMS_MARQUEURS = {loyaute: 'loyauté', age: 'âge', lore: 'chapitre', time: 'temps'};

/* La couleur du cadre d'une carte : celle des symboles de son coût. */
function teinteCarte(f) {
  const c = [...new Set(String(f.cout || '').toUpperCase().match(/[WUBRG]/g) || [])];
  if (c.length > 1) return 'or';
  if (c.length === 1) return c[0];
  return /land|terrain/i.test(f.type || '') ? 'terre' : 'C';
}

const estNombre = x => typeof x === 'number' && isFinite(x);

/* Force et endurance du moment, comparées à celles imprimées : plus fortes
   en vert, plus faibles en rouge ; l'endurance qui reste, une fois les
   blessures ôtées. */
function forceHTML(o, f) {
  if (!o.types || !o.types.includes('creature') || o.f == null) return '';
  const reste = o.e - (o.bless || 0);
  const base = estNombre(f.f) && estNombre(f.e) ? [f.f, f.e] : [o.f, o.e];
  const sens = o.f > base[0] || o.e > base[1] ? ' plus' : o.f < base[0] || o.e < base[1] ? ' moins' : '';
  return `<span class="tc-pt${sens}${o.bless ? ' blesse' : ''}">${o.f}/${reste}</span>`;
}

/* Les marqueurs d'un permanent, la loyauté à part. */
function marqueursHTML(o) {
  const m = o.marq || {};
  const loy = m.loyaute != null ? `<span class="tc-loy">${m.loyaute}</span>` : '';
  const autres = Object.keys(m).filter(k => k !== 'loyaute' && m[k]);
  return loy + (autres.length ? `<span class="tc-marqs">${autres.map(k => `<span class="tc-marq${k === '+1/+1' ? ' plus' : k === '-1/-1' ? ' moins' : ''}">${
    esc(NOMS_MARQUEURS[k] || k)} ×${m[k]}</span>`).join('')}</span>` : '');
}

function etatsHTML(o) {
  const e = [o.cmd ? '<i title="commandant">★</i>' : '', o.attaque ? '<i title="attaque">⚔</i>' : '',
    o.bloque != null ? '<i title="bloque">⛨</i>' : '', o.malade ? '<i title="mal d\'invocation">z</i>' : ''].join('');
  return e ? `<span class="tc-etats">${e}</span>` : '';
}

/* Une carte de la table. `o` est un objet de la vue — permanent, carte
   d'une zone, élément de la pile — ou une option de question ({id, nom}).
   `opts` : mode ('carte' ou 'vignette'), act et i (le geste du toucher),
   etat (forcé), n (une pile de cartes identiques), legende (sous la carte),
   style (l'angle de l'éventail de la main). Une carte levée pour être jouée
   (js/tableLever.js) monte. `data-ctrl` dit d'où part une carte venue d'une
   main cachée (js/tableMouvements.js). */
function tuile(o, v, opts = {}) {
  const f = (v && v.cartes && v.cartes[o.nom]) || (opts.fiches && opts.fiches[o.nom]) || {};
  const etat = opts.etat != null ? opts.etat : etatChoix(o.id);
  const vign = opts.mode === 'vignette';
  const img = imageCarte(o.nom, vign ? 'art_crop' : 'normal');
  const m = v && v.pile ? marquesPile(v) : null;
  const cls = ['tc', vign ? 'vign' : '', o.engage ? 'engage' : '', o.jeton ? 'jeton' : '', o.attaque ? 'attaque' : '',
    m && m.sources.has(o.id) ? 'active' : '', m && m.visees.has(o.id) ? 'ciblee' : '',
    o.bloque != null ? 'bloque' : '', leveValide(TABLE.question) && TABLE.leve.id === o.id ? 'leve' : '', opts.classe || '', etat].filter(Boolean).join(' ');
  return `<button type="button" class="${cls}" data-act="${opts.act || 'tCarte'}" data-id="${o.id}"${opts.i != null ? ` data-i="${opts.i}"` : ''}${
    o.ctrl != null ? ` data-ctrl="${o.ctrl}"` : ''}${opts.style ? ` style="${opts.style}"` : ''}
    data-loupe="${o.id}" data-teinte="${teinteCarte(f)}" aria-label="${esc(o.nom)}"><span class="tc-corps">
      <span class="tc-cadre"><span class="tc-nom">${esc(o.nom)}</span><span class="tc-type">${esc(f.type || '')}</span></span>
      ${img ? `<span class="tc-img" style="background-image:url('${esc(img)}')"></span>` : ''}</span>
    ${vign ? `<span class="tc-etiq">${esc(o.nom)}</span>` : ''}${forceHTML(o, f)}${marqueursHTML(o)}${etatsHTML(o)}
    ${opts.n > 1 ? `<span class="tc-nb">×${opts.n}</span>` : ''}${etat === 'choisi' ? '<span class="tc-coche">✓</span>' : ''}
    ${opts.legende ? `<span class="tc-legende">${opts.legende}</span>` : ''}</button>`;
}

/* Un permanent est seul quand il a quelque chose à dire : un marqueur, une
   blessure, un rôle au combat, une question ou un objet de la pile qui le
   désigne (`designes`, de marquesPile()). Les autres —
   six Forêts dégagées, douze jetons Gobelin — n'occupent qu'une place. */
function regroupe(objs, designes) {
  const out = [], par = new Map();
  for (const o of objs) {
    const seul = etatChoix(o.id) || Object.keys(o.marq || {}).some(k => o.marq[k]) || o.attaque || o.bloque != null || o.cmd || o.bless ||
      (designes && (designes.sources.has(o.id) || designes.visees.has(o.id)));
    if (seul) { out.push({o, n: 1}); continue; }
    const cle = [o.nom, o.engage, o.malade, o.f, o.e, o.jeton].join('|');
    const g = par.get(cle);
    if (g) g.n++;
    else { const ng = {o, n: 1}; par.set(cle, ng); out.push(ng); }
  }
  return out;
}

/* Une suite de permanents : chacun suivi de ce qui lui est attaché (aura,
   équipement), qui dépasse derrière lui. */
function suiteTuiles(objs, v, opts = {}) {
  const ids = new Set(v.champ.map(o => o.id));
  const attaches = new Map();
  v.champ.forEach(o => { if (o.att != null && ids.has(o.att)) attaches.set(o.att, [...(attaches.get(o.att) || []), o]); });
  const libres = objs.filter(o => !(o.att != null && ids.has(o.att)));
  const grp = opts.regroupe === false ? libres.map(o => ({o, n: 1})) : regroupe(libres, v.pile ? marquesPile(v) : null);
  return grp.map(({o, n}) => {
    const a = attaches.get(o.id);
    const t = tuile(o, v, {...opts, n});
    return a ? `<span class="tc-groupe">${t}${a.map(x => tuile(x, v, {...opts, classe: 'attache'})).join('')}</span>` : t;
  }).join('');
}

const estTerrain = o => o.types && o.types.includes('land') && !o.types.includes('creature');
const estFront = o => o.types && (o.types.includes('creature') || o.types.includes('planeswalker') || o.types.includes('battle'));

/* Le champ d'un joueur, rangé comme sur une vraie table : créatures et
   planeswalkers devant ; terrains, artefacts et enchantements derrière. Sa
   zone de commandement ouvre la rangée de devant. */
function rangsDe(J, v) {
  const champ = v.champ.filter(o => o.ctrl === J.i);
  const cmd = J.cmd.map(c => ({...c, cmd: true}));
  return {cmd, front: champ.filter(estFront), terrains: champ.filter(estTerrain),
    autres: champ.filter(o => !estFront(o) && !estTerrain(o))};
}

/* Une rangée qui défile seule ; sa position survit aux repeints. */
function rangee(cle, html, classe = '') {
  return `<div class="tc-rang ${classe}" data-defile="${cle}">${html || '<span class="tc-vide"></span>'}</div>`;
}
