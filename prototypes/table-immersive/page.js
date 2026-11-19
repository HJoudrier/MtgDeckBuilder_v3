/* =====================================================================
   page.js — La page autour du téléphone : les pistes, les réglages, le
   témoin des vibrations

   La piste choisie se lit dans l'adresse (#bouton, #gestes…) pour qu'un
   lien mène droit à l'une d'elles.
   ===================================================================== */

const ORDRE_PISTES = ['bouton', 'gestes', 'carte', 'theatre', 'fil'];

function montrePiste(id) {
  if (!FICHES[id]) id = 'bouton';
  document.querySelectorAll('[data-piste]').forEach(b => b.setAttribute('aria-selected', String(b.dataset.piste === id)));
  document.getElementById('fiche').innerHTML = ficheHTML(id);
  choisisVariante(id);
  try { localStorage.setItem('table-immersive-piste', id); } catch (e) { /* stockage refusé : on s'en passe */ }
}

/* Le témoin : chaque vibration s'écrit sous le téléphone, et le cadre
   frémit — on voit où elle tomberait même sans téléphone qui vibre. */
let TEMOIN_T = 0;
function temoinVibration(nom, motif, ok) {
  const t = document.getElementById('temoin'), tel = document.getElementById('telephone');
  const ms = Array.isArray(motif) ? motif.join(' · ') : motif;
  t.innerHTML = `<span class="tm-onde" aria-hidden="true"></span><b>${esc(NOMS_VIBRATIONS[nom] || nom)}</b> · ${ms} ms${ok ? '' : ' <span class="tm-simule">(simulée : ce navigateur ne vibre pas)</span>'}`;
  t.classList.remove('vif');
  void t.offsetWidth;
  t.classList.add('vif');
  if (!REGLAGES.reduit && nom !== 'cran' && nom !== 'tic') {
    tel.classList.remove('vibre');
    void tel.offsetWidth;
    tel.classList.add('vibre');
  }
  clearTimeout(TEMOIN_T);
  TEMOIN_T = setTimeout(() => t.classList.remove('vif'), 1400);
}

function majReglages() {
  document.querySelectorAll('[data-reglage]').forEach(b => b.setAttribute('aria-pressed', String(!!REGLAGES[b.dataset.reglage])));
  document.getElementById('ecran').classList.toggle('reduit', REGLAGES.reduit);
}

function pleinEcran(on) {
  const tel = document.getElementById('telephone');
  tel.classList.toggle('plein', on);
  document.body.classList.toggle('plein-ecran', on);
  /* Le vrai plein écran est un plus : un cadre qui le refuse garde le faux. */
  try {
    if (on && tel.requestFullscreen) tel.requestFullscreen().catch(() => {});
    else if (!on && document.fullscreenElement) document.exitFullscreen().catch(() => {});
  } catch (e) { /* refusé */ }
  setTimeout(() => repeins([], true), 60);
}

document.addEventListener('click', ev => {
  const p = ev.target.closest('[data-piste]');
  if (p) {
    try { history.replaceState(null, '', '#' + p.dataset.piste); } catch (e) { /* adresse figée par le cadre */ }
    return montrePiste(p.dataset.piste);
  }
  const r = ev.target.closest('[data-reglage]');
  if (r) {
    const k = r.dataset.reglage;
    REGLAGES[k] = !REGLAGES[k];
    if (k === 'son' && REGLAGES.son) { audio(); son('prio'); }
    if (k === 'vibre' && REGLAGES.vibre) vibre('valide');
    majReglages();
    return;
  }
  const a = ev.target.closest('[data-page]');
  if (!a) return;
  if (a.dataset.page === 'rejouer') FAIT.rejouer();
  if (a.dataset.page === 'plein') pleinEcran(!document.getElementById('telephone').classList.contains('plein'));
});

document.addEventListener('keydown', ev => {
  const p = ev.target.closest && ev.target.closest('[role="tab"]');
  if (!p || (ev.key !== 'ArrowRight' && ev.key !== 'ArrowLeft')) return;
  const i = (ORDRE_PISTES.indexOf(p.dataset.piste) + (ev.key === 'ArrowRight' ? 1 : 4)) % 5;
  const b = document.querySelector(`[data-piste="${ORDRE_PISTES[i]}"]`);
  b.focus();
  b.click();
});

document.addEventListener('fullscreenchange', () => {
  if (!document.fullscreenElement && document.getElementById('telephone').classList.contains('plein')) pleinEcran(false);
});

window.addEventListener('hashchange', () => montrePiste(location.hash.slice(1)));
window.addEventListener('resize', () => { clearTimeout(window.__rz); window.__rz = setTimeout(() => repeins([], true), 120); });

(function demarre() {
  monteEcran(document.getElementById('ecran'));
  Scene.nouvelle();
  let piste = location.hash.slice(1);
  if (!FICHES[piste]) { try { piste = localStorage.getItem('table-immersive-piste') || 'bouton'; } catch (e) { piste = 'bouton'; } }
  majReglages();
  montrePiste(piste);
})();
