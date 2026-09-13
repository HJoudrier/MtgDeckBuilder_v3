/* =====================================================================
   js/fenListes.js — Les deux listes déroulantes des filtres

   Archétypes et éditions : deux longues listes qu'on cherche en tapant. La
   frappe ne réécrit pas la fenêtre — le curseur y serait perdu —, elle ne
   refait que la liste proposée.
   ===================================================================== */

let archRecherche = '';
let archOuvert = false;
let setRecherche = '';
let setOuvert = false;

/* Lignes de la liste déroulante : le nom, puis ce que fait l'archétype.
   Tous les thèmes publiés par EDHREC y figurent ; la recherche ne fait
   que resserrer l'affichage. */
function listeArchetypesHTML() {
  if (!ARCH_BASE.liste.length) {
    return `<div class="small muted" style="padding:8px 10px">${ARCH_BASE.etat === 'chargement'
      ? 'Chargement de la liste EDHREC…'
      : 'La liste vient d\'EDHREC : utilisez « Charger la liste EDHREC » ci-dessous.'}</div>`;
  }
  const choisis = new Set(archetypesFiltre());
  const q = loose(archRecherche);
  let liste = archetypesDisponibles();
  if (q) liste = liste.filter(a => loose(a.label).includes(q) || loose(a.slug).includes(q));
  liste = liste.sort((a, b) => (b.n || 0) - (a.n || 0) || a.label.localeCompare(b.label));
  if (!liste.length) return '<div class="small muted" style="padding:6px 8px">Aucun archétype à ce nom.</div>';

  return liste.map(a => {
    const coche = choisis.has(a.slug);
    const charge = ARCH_BASE.themes[a.slug];
    return `<button type="button" class="arch-row" data-act="toggleArch" data-arch="${esc(a.slug)}" aria-pressed="${coche}">
      <span class="arch-row-h"><span class="arch-row-t">${esc(a.label)}</span>
        <span class="arch-n">${a.n ? a.n.toLocaleString('fr-FR') + ' decks' : ''}${charge ? ` · ${charge.n} cartes` : ''}</span>
        <span class="arch-row-x">${coche ? '✓' : ''}</span></span>
      <span class="arch-row-d">${esc(a.aide)}</span>
    </button>`;
  }).join('');
}

/* Rafraîchit la liste proposée sans réécrire la fenêtre : la frappe
   dans le champ de recherche garde son curseur. */
function majListeArchetypes() {
  const zone = document.querySelector('#archPanel .arch-liste');
  if (zone) zone.innerHTML = avecBrouillon(listeArchetypesHTML);
}

/* État de la base d'archétypes extérieure, sous les boutons. */
function etatArchetypes() {
  if (ARCH_BASE.etat === 'chargement') return 'Chargement des thèmes EDHREC…';
  if (ARCH_BASE.etat === 'erreur') {
    const essais = (ARCH_BASE.essais || []).length
      ? `<div class="mono" style="font-size:10.5px;margin-top:4px;white-space:pre-line">${esc(ARCH_BASE.essais.join('\n'))}</div>`
      : '';
    return `EDHREC : ${esc(ARCH_BASE.erreur)}. Nouvelle tentative à la prochaine ouverture de l'atelier.${essais}`;
  }
  if (ARCH_BASE.liste.length) {
    const date = ARCH_BASE.maj ? new Date(ARCH_BASE.maj).toLocaleDateString('fr-FR') : '';
    const charges = Object.keys(ARCH_BASE.themes).length;
    const enCours = ARCH_BASE.enCours.size;
    return `Liste établie par EDHREC : ${ARCH_BASE.liste.length.toLocaleString('fr-FR')} thème(s)${date ? `, relevés le ${date}` : ''},
      revus une fois par semaine. Les cartes d'un thème sont cherchées à sa première utilisation${charges ? ` — ${charges} déjà chargé(s), ${ARCH_BASE.index.size.toLocaleString('fr-FR')} carte(s) référencées` : ''}${enCours ? ` · ${enCours} en cours…` : ''}.`;
  }
  return `Les archétypes viennent d'EDHREC : la liste se charge d'elle-même à l'ouverture de l'atelier, puis les cartes
    d'un thème à sa première utilisation. Le tout est gardé en cache sur cet appareil.`;
}

/* Lignes de la liste des sets : le nom, puis son code, son année et sa
   taille. Tous les sets papier publiés par Scryfall y figurent ; la
   recherche ne fait que resserrer l'affichage. Le plus récent d'abord,
   c'est celui qu'on cherche le plus souvent. */
function listeSetsHTML() {
  if (!SETS_BASE.liste.length) {
    return `<div class="small muted" style="padding:8px 10px">${SETS_BASE.etat === 'chargement'
      ? 'Chargement de la liste des sets…'
      : 'La liste vient de Scryfall : elle se charge à l\'ouverture de cette fenêtre.'}</div>`;
  }
  const choisis = new Set(setsFiltre());
  const q = loose(setRecherche);
  let liste = SETS_BASE.liste.slice();
  if (q) liste = liste.filter(x => loose(x.nom).includes(q) || loose(x.code).includes(q));
  liste = liste.sort((a, b) => String(b.sortie).localeCompare(String(a.sortie)) || a.nom.localeCompare(b.nom));
  if (!liste.length) return '<div class="small muted" style="padding:6px 8px">Aucun set à ce nom.</div>';

  return liste.map(x => {
    const coche = choisis.has(x.code);
    const charge = SETS_BASE.charges[x.code];
    const annee = String(x.sortie || '').slice(0, 4);
    const etat = SETS_BASE.enCours.has(x.code) ? ' · chargement…'
      : (charge ? (charge.erreur ? ' · ' + charge.erreur : ` · ${charge.n} carte(s) connues`) : '');
    return `<button type="button" class="arch-row" data-act="toggleSet" data-set="${esc(x.code)}" aria-pressed="${coche}">
      <span class="arch-row-h"><span class="arch-row-t">${esc(x.nom)}</span>
        <span class="arch-n">${esc(x.code)}${annee ? ' · ' + annee : ''}${x.n ? ` · ${x.n} cartes` : ''}${etat}</span>
        <span class="arch-row-x">${coche ? '✓' : ''}</span></span>
    </button>`;
  }).join('');
}

/* Rafraîchit la liste proposée sans réécrire la fenêtre : la frappe dans le
   champ de recherche garde son curseur. */
function majListeSets() {
  const zone = document.querySelector('#setPanel .arch-liste');
  if (zone) zone.innerHTML = avecBrouillon(listeSetsHTML);
}

/* État de la liste des sets, sous le champ. */
function etatSets() {
  if (SETS_BASE.etat === 'chargement') return 'Chargement de la liste des sets…';
  if (SETS_BASE.etat === 'erreur')
    return `Scryfall : ${esc(SETS_BASE.erreur)}. Nouvelle tentative à la prochaine ouverture des filtres.`;
  if (SETS_BASE.liste.length) {
    const date = SETS_BASE.maj ? new Date(SETS_BASE.maj).toLocaleDateString('fr-FR') : '';
    const charges = Object.keys(SETS_BASE.charges).length;
    const enCours = SETS_BASE.enCours.size;
    return `Liste établie par Scryfall : ${SETS_BASE.liste.length.toLocaleString('fr-FR')} set(s) papier${date ? `, relevés le ${date}` : ''},
      revus une fois par semaine. Les cartes d'un set sont cherchées à sa première utilisation${charges
        ? ` — ${charges} déjà chargé(s), ${SETS_BASE.index.size.toLocaleString('fr-FR')} carte(s) référencées` : ''}${
        enCours ? ` · ${enCours} en cours…` : ''}.`;
  }
  return `Les sets viennent de Scryfall : la liste se charge à l'ouverture de cette fenêtre, puis les cartes
    d'un set à sa première utilisation. Le tout est gardé en cache sur cet appareil.`;
}

