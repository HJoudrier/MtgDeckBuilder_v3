/* =====================================================================
   js/anaMain.js — La main d'essai

   Sept cartes tirées au hasard de la bibliothèque, puis une de plus à chaque
   pioche : ce que les probabilités disent en moyenne, une main le montre en
   vrai. Ce tirage-ci est vraiment au hasard — on veut une main nouvelle à
   chaque clic —, contrairement aux simulations qui partent de l'empreinte du
   deck pour que leurs chiffres restent stables.

   C'est le fil d'une séance, non un réglage : rien n'en va dans `snapshot()`.
   Un deck qui change rebat les cartes, puisque l'ordre ne vaudrait plus.
   ===================================================================== */

let MAIN_ESSAI = {cle:'', ordre:[], vues:7};

function nouvelleMainEssai() {
  const {cartes} = bibliothequeAnalyse();
  MAIN_ESSAI = {cle:deckSignature(), ordre:melanger(cartes.slice(), Math.random), vues:Math.min(7, cartes.length)};
}

function piocheMainEssai() {
  if (MAIN_ESSAI.cle !== deckSignature()) nouvelleMainEssai();
  MAIN_ESSAI.vues = Math.min(MAIN_ESSAI.ordre.length, MAIN_ESSAI.vues + 1);
}

/* Le bloc se réécrit seul, en place : la page autour ne bouge pas, et le
   lecteur garde sous les yeux la main qu'il vient de tirer. */
function majMainEssai() {
  const el = document.getElementById('anaMain');
  if (el) el.innerHTML = anaMainVue();
}

function anaVignetteMain(c) {
  const img = c.imgN || c.img;
  return `<button type="button" class="ana-carte" data-act="fiche" data-name="${esc(c.name)}" title="${esc(c.name)}">
    ${img ? `<img src="${esc(img)}" alt="${esc(c.name)}" loading="lazy" decoding="async">`
          : `<span class="ana-carte-nom">${esc(c.name)}<span class="muted">${esc(c.cost || '')}</span></span>`}
  </button>`;
}

function anaMainVue() {
  if (MAIN_ESSAI.cle !== deckSignature()) nouvelleMainEssai();
  const main = MAIN_ESSAI.ordre.slice(0, MAIN_ESSAI.vues);
  if (!main.length) return '<div class="empty">La bibliothèque est vide.</div>';
  const terrains = main.filter(c => c.isLand).length;
  const sorts = main.filter(c => !c.isLand);
  const accel = sorts.filter(c => c.cats.has('ramp')).length;
  const tour = MAIN_ESSAI.vues - 7;
  const bornes = fmt().commander ? [2, 5] : [2, 4];
  const ok = terrains >= bornes[0] && terrains <= bornes[1];
  return `<div class="row ana-main-barre">
      <button type="button" class="btn sm" data-act="anaMain">Nouvelle main</button>
      <button type="button" class="btn sm" data-act="anaPioche"${MAIN_ESSAI.vues >= MAIN_ESSAI.ordre.length ? ' disabled' : ''}>Piocher</button>
      <span class="small">${tour > 0 ? `${tour} pioche(s) · ` : ''}<b>${terrains}</b> terrain(s), <b>${sorts.length}</b> sort(s)${accel ? `, dont ${accel} accélérateur(s)` : ''}</span>
      ${tour === 0 ? `<span class="ana-badge" style="--ana-verdict:${ok ? 'var(--ok)' : 'var(--bad)'}">${ok ? 'gardable' : 'à mulliganer'}</span>` : ''}
    </div>
    <div class="ana-main">${main.map(anaVignetteMain).join('')}</div>`;
}
