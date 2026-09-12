/* =====================================================================
   js/ficheVisuel.js — Le visuel de la fiche, et ses éditions

   Trois états : le visuel est là, il se cherche encore — une carte vide à ses
   proportions et son icône de chargement —, ou il n'y en a pas, auquel cas le
   panneau de texte prend sa place. Dessous, le défilement des éditions, à deux
   sources : celles que la collection possède, et toutes celles que Scryfall
   publie — ces dernières cherchées seulement si on les demande.
   ===================================================================== */

/* Carte rendue en texte, à la place du visuel : coût, type, force et
   endurance, coût converti et texte oracle. Sert quand l'image est
   absente, désactivée, ou qu'elle n'a pas pu se charger. */
function ficheTexteHTML(card) {
  const pt = (card.force != null && card.endurance != null) ? `${card.force}/${card.endurance}` : '';
  return `<div class="visuwrap">
      <div class="carte-texte">
        <div class="ct-h">
          <span class="ct-nom">${esc(card.name)}</span>
          <span class="costs">${manaHTML(card, true)}</span>
        </div>
        <div class="ct-type small">${esc(card.type)}${card.cmc ? ` · CMC ${card.cmc}` : ''}</div>
        <div class="ct-texte">${esc((card.text || '(texte non disponible)').replace(/ \/\/ /g, '\n'))}</div>
        ${pt ? `<div class="ct-pt mono">${pt}</div>` : ''}
      </div>
    </div>`;
}

/* Le visuel n'a pas pu se charger : le texte prend sa place. */
/* La fiche ouverte se reconstruit quand Scryfall a répondu — ou renoncé —
   sans quoi l'attente affichée resterait à tourner pour rien. */
function rafraichirFiche() {
  const dlg = document.getElementById('dlg');
  const el = dlg && dlg.open && dlg.querySelector('.fiche[data-fiche]');
  if (el) openCardModal(el.getAttribute('data-fiche'));
}

/* Carte vide et son icône de chargement, le temps que le visuel arrive. */
function visuelAttenteHTML() {
  return `<div class="visuwrap">
    <div class="visu-attente" role="status" aria-label="Visuel en cours de chargement">
      <span class="spin" aria-hidden="true"></span>
    </div>
  </div>`;
}

function ficheImageKO(img) {
  const wrap = img && img.closest('.visuwrap');
  const c = img && find(img.getAttribute('data-name') || '');
  if (wrap && c) wrap.outerHTML = ficheTexteHTML(c);
}

/* Défilement des éditions sous le visuel de la fiche. Deux sources : celles
   que la collection possède, et toutes celles que Scryfall publie — ces
   dernières cherchées seulement si on les demande. */
function blocVersions(card) {
  if (!card || card.unknown) return '';
  const possedees = versionsCarte(card);
  const toutes = sourceVersions(card) === 'toutes';
  const voulue = sourceVoulue(card);
  const vs = listeVersions(card);
  const enCours = card.editionsEtat === 'chargement';
  const bascule = `<div class="vers-src">
    <button type="button" class="vers-s" data-act="versionsPossedees" data-name="${esc(card.name)}"
      aria-pressed="${voulue !== 'toutes'}" ${possedees.length ? '' : 'disabled'}>Mes éditions${possedees.length ? ` (${possedees.length})` : ''}</button>
    <button type="button" class="vers-s" data-act="versionsToutes" data-name="${esc(card.name)}"
      aria-pressed="${voulue === 'toutes'}">${enCours ? 'Toutes…' : `Toutes${card.editionsEtat === 'ok' ? ` (${(card.editions||[]).length})` : ''}`}</button>
  </div>`;

  if (!vs.length) {
    return `<div class="vers">${bascule}
      <div class="small muted vers-det">${
        enCours ? 'Recherche des éditions publiées…'
        : card.editionsEtat === 'erreur' ? `Éditions indisponibles : ${esc(card.editionsErreur || 'échec')}.`
        : toutes ? 'Scryfall ne publie aucune édition papier pour cette carte.'
        : "Aucune édition relevée à l'import : passez par « Toutes » pour choisir une illustration."}</div>
    </div>`;
  }

  const i = versionRang(card), v = vs[i], cle = cleVersion(v);
  const u = (v.imgN || v.img) ? v : (card.visuels || {})[cle];
  const retenue = versionRetenue(card) === cle;
  const qte = possedeVersion(card, cle);
  const attente = !u && !card.visuelsTried;
  const details = [
    u && u.setName ? esc(u.setName) : '',
    u && u.artist ? `ill. ${esc(u.artist)}` : '',
    v.sortie ? esc(String(v.sortie).slice(0, 4)) : '',
    qte ? `${qte} exemplaire(s)` : (toutes ? 'non possédée' : '')
  ].filter(Boolean).join(' · ');

  return `<div class="vers">
    ${bascule}
    <div class="vers-nav">
      <button type="button" class="vers-b" data-act="versionPrec" data-name="${esc(card.name)}"
        title="Édition précédente" ${vs.length < 2 ? 'disabled' : ''}>‹</button>
      <div class="vers-cap">
        <b>${esc(v.set)}${v.num ? ` n°${esc(v.num)}` : ''}</b>
        <span class="muted">${i + 1} / ${vs.length}</span>
      </div>
      <button type="button" class="vers-b" data-act="versionSuiv" data-name="${esc(card.name)}"
        title="Édition suivante" ${vs.length < 2 ? 'disabled' : ''}>›</button>
    </div>
    <div class="small muted vers-det">${
      enCours ? 'Recherche des éditions publiées…'
      : u && u.ko ? 'Scryfall ne connaît pas cette édition : son visuel reste indisponible.'
      : attente ? 'Visuel en cours de recherche…'
      : details}</div>
    ${retenue
      ? '<div class="small vers-ok">Illustration affichée en priorité</div>'
      : `<button type="button" class="btn sm vers-pick" data-act="choisirVersion"
           data-name="${esc(card.name)}" data-cle="${esc(cle)}" ${(!u || u.ko) ? 'disabled' : ''}>
           Afficher cette illustration en priorité</button>`}
  </div>`;
}
