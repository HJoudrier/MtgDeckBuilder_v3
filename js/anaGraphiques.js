/* =====================================================================
   js/anaGraphiques.js — Les pièces dont l'onglet Analyse est fait

   Une tuile pour un chiffre qui se lit seul, une barre pour une part, une
   rangée de colonnes pour une distribution, un nom de carte qui ouvre sa
   fiche. Tout en HTML et en CSS : l'atelier ne dépend d'aucune bibliothèque
   de graphiques, et un graphique de vingt barres n'en demande pas.

   Le chiffre s'écrit toujours dans l'encre du texte ; la couleur porte
   l'identité (une couleur de mana) ou le verdict (les trois teintes des jauges),
   et chaque verdict se dit aussi en mots — jamais par la couleur seule.
   ===================================================================== */

function pctAna(x, decimales) {
  if (!Number.isFinite(x)) return '—';
  const v = x * 100;
  return (decimales ? v.toFixed(decimales).replace('.', ',') : String(Math.round(v))) + ' %';
}

function nombreAna(x, decimales) {
  if (!Number.isFinite(x)) return '—';
  return x.toFixed(decimales == null ? 2 : decimales).replace('.', ',');
}

/* Une tuile : la valeur en grand, sa clé dessous, et une ligne de contexte. */
function anaTuile(valeur, cle, opts) {
  opts = opts || {};
  return `<div class="stat ana-tuile"${opts.titre ? ` title="${esc(opts.titre)}"` : ''}>
    <div class="v">${valeur}</div>
    <div class="k">${cle}</div>
    ${opts.sous ? `<div class="ana-sous"${opts.col ? ` style="--ana-verdict:${opts.col}"` : ''}>${opts.sous}</div>` : ''}
  </div>`;
}

/* Une barre horizontale : le libellé, la piste, la valeur. `max` fixe
   l'échelle commune d'un groupe de barres, pour qu'elles se comparent. */
function anaBarre(label, v, max, opts) {
  opts = opts || {};
  const largeur = max > 0 ? Math.max(v > 0 ? 2 : 0, Math.round(v / max * 100)) : 0;
  return `<div class="ana-barre"${opts.titre ? ` title="${esc(opts.titre)}"` : ''}>
    <span class="ana-barre-l">${label}</span>
    <span class="track"><span class="fill" style="display:block;width:${largeur}%;background:${opts.couleur || 'var(--brass-d)'}"></span></span>
    <span class="ana-barre-v mono">${opts.texte != null ? opts.texte : v}</span>
  </div>`;
}

/* Une rangée de colonnes : chaque élément porte sa valeur, son étiquette, le
   texte écrit au-dessus et l'infobulle qui le détaille. Les segments empilés,
   quand il y en a, se donnent du bas vers le haut : le premier est posé sur
   la ligne de base, d'où l'ordre renversé de leur écriture. */
function anaColonnes(items, opts) {
  opts = opts || {};
  const H = opts.hauteur || 110;
  const max = Math.max(1e-9, opts.max || Math.max(...items.map(x => x.v)));
  const cols = items.map(x => {
    const segs = (x.segments || [{v:x.v, couleur:x.couleur}]).filter(s => s.v > 0);
    const corps = segs.slice().reverse().map(s => `<span class="ana-seg" style="height:${Math.max(2, Math.round(s.v / max * H))}px;background:${s.couleur || 'var(--brass-d)'}"></span>`).join('');
    return `<div class="ana-col"${x.titre ? ` title="${esc(x.titre)}"` : ''}>
      <span class="ana-col-n mono">${x.texte != null ? x.texte : (x.v || '')}</span>${corps}</div>`;
  }).join('');
  const labels = items.map(x => `<span>${x.label}</span>`).join('');
  return `<div class="ana-cols" style="height:${H + 22}px">${cols}</div><div class="ana-cols-l">${labels}</div>`;
}

/* Un nom de carte qui ouvre sa fiche ; l'aperçu volant le suit au survol. */
function anaNom(card) {
  const n = typeof card === 'string' ? card : card.name;
  return `<button type="button" class="cref" data-act="fiche" data-name="${esc(n)}">${esc(n)}</button>`;
}

/* Une liste de noms, coupée à `max` avec le compte de ce qui reste. */
function anaNoms(cartes, max) {
  max = max || 12;
  if (!cartes.length) return '<span class="muted">aucune</span>';
  const vus = cartes.slice(0, max).map(anaNom).join(', ');
  return cartes.length > max ? `${vus} <span class="muted">et ${cartes.length - max} autre(s)</span>` : vus;
}

/* Un bloc de l'onglet : son ancre pour le sommaire, son titre, son aide. */
function anaBloc(id, titre, aide, corps) {
  return `<section class="ana-bloc" id="ana-${id}" aria-labelledby="ana-${id}-t">
    <h3 id="ana-${id}-t">${titre}</h3>
    ${aide ? `<p class="small muted ana-aide">${aide}</p>` : ''}
    ${corps}
  </section>`;
}

/* La médiane d'une liste pondérée par les exemplaires. */
function medianePonderee(paires) {
  const v = [];
  paires.forEach(([x, q]) => { for (let i = 0; i < q; i++) v.push(x); });
  if (!v.length) return 0;
  v.sort((a, b) => a - b);
  const m = v.length >> 1;
  return v.length % 2 ? v[m] : (v[m - 1] + v[m]) / 2;
}
