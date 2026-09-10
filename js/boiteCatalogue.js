/* =====================================================================
   js/boiteCatalogue.js — Boîte de chargement de l'archive Scryfall

   L'archive pèse plus de cent mégaoctets : sans cette boîte, l'atelier semblait
   figé une longue minute au premier lancement. Deux barres — ce qui arrive du
   réseau, ce qui en est rangé dans IndexedDB.
   ===================================================================== */

/* =====================================================================
   Boîte de progression du chargement de l'archive Scryfall. L'archive pèse
   plus de cent mégaoctets : sans elle, l'atelier semblait figé une longue
   minute au premier lancement. Deux barres — ce qui arrive, ce qui en est
   extrait — et le décompte des cartes retenues.
   ===================================================================== */

function octets(n) {
  if (!n) return '';
  return n >= 1048576 ? `${(n/1048576).toFixed(1)} Mo` : `${Math.round(n/1024)} Ko`;
}

function barreCatalogue(id, titre, fait, total) {
  const pct = total > 0 ? Math.min(100, Math.round(fait / total * 100)) : 0;
  return `<div class="field">
    <div class="small muted" id="${id}Txt">${esc(titre)}${fait
      ? ` — ${octets(fait)}${total > 0 ? ` / ${octets(total)} (${pct} %)` : ''}` : '…'}</div>
    <div class="track"><div class="fill" id="${id}Bar" style="width:${pct}%;background:var(--brass)"></div></div>
  </div>`;
}

function corpsBoiteCatalogue() {
  const s = CAT.suivi;
  if (!s) return '<div class="small muted">Aucun chargement en cours.</div>';
  const lecture = s.source === 'réseau' ? 'Téléchargement' : 'Lecture du fichier';
  return `<div id="boiteCatalogue">
    ${barreCatalogue('catRecu', lecture, s.recu, s.totalRecu)}
    ${barreCatalogue('catExtrait', 'Extraction', s.extrait, s.totalExtrait)}
    <div class="small muted" id="catCartes">${s.cartes
      ? `${s.cartes.toLocaleString('fr-FR')} carte(s) retenues.`
      : 'Lecture des cartes…'}</div>
    <div class="small muted">L'archive est lue au fil de l'eau : elle n'est jamais gardée entière en mémoire.
      « Masquer » referme cette fenêtre sans rien interrompre — les sections des propositions continuent d'en rendre compte.</div>
  </div>`;
}

function ouvrirBoiteCatalogue() {
  openDialog("Archive Scryfall", corpsBoiteCatalogue(),
    `<button type="button" class="btn foot-g" data-act="interrompreCatalogue">Interrompre</button>
     <button type="button" class="btn pri" data-act="closeDialog">Masquer</button>`);
}

/* Rafraîchit les barres sans réécrire la fenêtre, pour ne pas la faire
   clignoter dix fois par seconde. */
function majBoiteCatalogue() {
  const zone = document.getElementById('boiteCatalogue');
  if (!zone || !CAT.suivi) return;
  const s = CAT.suivi;
  const lecture = s.source === 'réseau' ? 'Téléchargement' : 'Lecture du fichier';
  const pose = (id, titre, fait, total) => {
    const pct = total > 0 ? Math.min(100, Math.round(fait / total * 100)) : 0;
    const t = document.getElementById(id + 'Txt');
    const b = document.getElementById(id + 'Bar');
    if (t) t.textContent = `${titre}${fait ? ` — ${octets(fait)}${total > 0 ? ` / ${octets(total)} (${pct} %)` : ''}` : '…'}`;
    if (b) b.style.width = pct + '%';
  };
  pose('catRecu', lecture, s.recu, s.totalRecu);
  pose('catExtrait', 'Extraction', s.extrait, s.totalExtrait);
  const c = document.getElementById('catCartes');
  if (c) c.textContent = s.cartes ? `${s.cartes.toLocaleString('fr-FR')} carte(s) retenues.` : 'Lecture des cartes…';
}

/* Ne referme que si c'est bien cette boîte qui est ouverte : l'utilisateur a
   pu la masquer et ouvrir autre chose entre-temps. */
function fermerBoiteCatalogue() {
  /* `closeDialog()` ne vide pas le corps : un `#boiteCatalogue` peut traîner
     dans le DOM d'une fenêtre déjà fermée. On ne referme donc que si la
     fenêtre est ouverte et que c'est bien cette boîte qu'elle montre. */
  const dlg = document.getElementById('dlg');
  if (dlg && dlg.open && document.getElementById('boiteCatalogue')) closeDialog();
  CAT.suivi = null;
}

