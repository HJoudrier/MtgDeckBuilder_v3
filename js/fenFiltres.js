/* =====================================================================
   js/fenFiltres.js — Fenêtre « Filtres »

   Nom, force, endurance, coût de mana, prix. Le décompte des cartes retenues se
   rafraîchit à chaque frappe ; le filtrage lui-même passe par tranches, avec sa
   barre dans le pied, pour que la fenêtre ne se fige pas.
   ===================================================================== */

/* Une ligne « critère min → max ». */
function ligneFiltre(kMin, kMax, label, aide, pas, min) {
  const champ = (cle, place) => `<input type="number" inputmode="decimal" step="${pas}" ${min !== undefined ? `min="${min}"` : ''}
      id="f_${cle}" data-filtre="${cle}" value="${esc(S.filtres[cle])}" placeholder="${place}" aria-label="${esc(label)} ${place}">`;
  return `<div class="filtre-ligne">
    <span class="filtre-nom" title="${esc(aide)}">${esc(label)}</span>
    <label class="lab" for="f_${kMin}">min</label>${champ(kMin, 'min')}
    <label class="lab" for="f_${kMax}">max</label>${champ(kMax, 'max')}
  </div>`;
}

function corpsFiltres() {
  /* Tout le corps se peint sous le brouillon : couleurs, cases et champs y
     lisent ce qu'on est en train de régler, non ce qui est appliqué. */
  return avecBrouillon(() => `<div class="field">
      <label class="lab">Couleurs considérées</label>
      <div class="row" style="align-items:center;gap:6px">
        ${COLS.map(([c, titre]) => `
          <button type="button" class="mana-btn" data-color="${c}" aria-pressed="${S.colors.has(c)}" title="${titre}">
            ${symBg(c)}
          </button>`).join('')}
        <button type="button" class="btn sm" data-act="allColors" style="margin-left:4px">Toutes</button>
        <button type="button" class="btn sm" data-act="clearColors">Aucune</button>
      </div>
      <div class="seg" style="margin-top:6px">
        ${MODES_COULEUR.map(([m, l]) => `<button type="button" data-cmode="${m}" aria-pressed="${S.colorMode === m}">${l}</button>`).join('')}
      </div>
      <div class="small muted">${esc(nomCombinaisonCouleurs(S.colors))} · même réglage que la barre de mana de l'en-tête.</div>
    </div>
    <div class="field">
      <label class="lab" for="f_nom">Nom</label>
      <input type="text" id="f_nom" data-filtre="nom" value="${esc(S.filtres.nom)}" placeholder="ex. dragon, sol ring…" autocomplete="off">
    </div>
    <div class="field">
      <label class="lab" for="f_type">Type</label>
      <input type="text" id="f_type" data-filtre="type" value="${esc(S.filtres.type)}" placeholder="ex. créature, artefact, human soldier…" autocomplete="off">
    </div>
    <div class="field">
      <label class="lab">Set</label>
      ${setsFiltre().length ? `<div class="archetypes">${setsFiltre().map(code =>
        `<button type="button" class="arch-btn" data-act="toggleSet" data-set="${esc(code)}" aria-pressed="true"
          title="${esc(libelleSet(code))}">${esc(code)} ✕</button>`).join('')}</div>` : ''}
      <button type="button" class="arch-menu-b" data-act="setMenu" aria-expanded="${setOuvert}">
        <span>${setsFiltre().length ? `${setsFiltre().length} set(s) coché(s)` : 'Choisir un set…'}</span>
        <span class="chev-b">${setOuvert ? '▴' : '▾'}</span>
      </button>
      ${setOuvert ? `<div class="arch-menu" id="setPanel">
        <input type="text" id="f_setQ" data-setq placeholder="rechercher…" value="${esc(setRecherche)}" autocomplete="off">
        <div class="arch-liste">${listeSetsHTML()}</div>
      </div>` : ''}
      <div class="small muted">Une carte est retenue si elle a paru dans au moins un set coché, qu'on la possède ou non dans cette édition.</div>
      <div class="small muted" id="setEtat">${etatSets()}</div>
    </div>
    <div class="field">
      <label class="lab" for="f_texte">Texte de règles</label>
      <input type="text" id="f_texte" data-filtre="texte" value="${esc(S.filtres.texte)}" placeholder="ex. draw a card, sacrifice a creature…" autocomplete="off">
    </div>
    <div class="field">
      <label class="lab">Archétype</label>
      ${archetypesFiltre().length ? `<div class="archetypes">${archetypesFiltre().map(slug =>
        `<button type="button" class="arch-btn" data-act="toggleArch" data-arch="${esc(slug)}" aria-pressed="true"
          title="${esc(resumeArchetype(slug))}">${esc(libelleArchetype(slug))} ✕</button>`).join('')}</div>` : ''}
      <button type="button" class="arch-menu-b" data-act="archMenu" aria-expanded="${archOuvert}">
        <span>${archetypesFiltre().length ? `${archetypesFiltre().length} archétype(s) coché(s)` : 'Choisir un archétype…'}</span>
        <span class="chev-b">${archOuvert ? '▴' : '▾'}</span>
      </button>
      ${archOuvert ? `<div class="arch-menu" id="archPanel">
        <input type="text" id="f_archQ" data-archq placeholder="rechercher…" value="${esc(archRecherche)}" autocomplete="off">
        <div class="arch-liste">${listeArchetypesHTML()}</div>
      </div>` : ''}
      <div class="small muted">Une carte est retenue si elle relève d'au moins un archétype coché.</div>
      <div class="small muted" id="archEtat">${etatArchetypes()}</div>
    </div>
    <div class="field">
      <label class="lab">Rôle dans le deck</label>
      <div class="archetypes">
        ${Object.keys(targets()).map(r => `<button type="button" class="arch-btn" data-act="toggleRole" data-role="${esc(r)}"
          aria-pressed="${rolesFiltre().includes(r)}" title="Cartes tenant ce rôle, d'après l'analyse de leur texte">${esc(CATLABEL[r] || r)}</button>`).join('')}
      </div>
      <div class="small muted">Mêmes rôles que les jauges d'équilibre de la section Deck : les cocher ici ou là revient au même.</div>
    </div>
    <div class="filtres-grille">
      ${ligneFiltre('forceMin', 'forceMax', 'Force', "Force des créatures (le premier chiffre de 3/4).", '1', 0)}
      ${ligneFiltre('enduranceMin', 'enduranceMax', 'Endurance', "Endurance des créatures (le second chiffre de 3/4).", '1', 0)}
      ${ligneFiltre('cmcMin', 'cmcMax', 'Coût de mana', "Valeur de mana totale de la carte.", '1', 0)}
      ${ligneFiltre('prixMin', 'prixMax', 'Prix (€)', "Prix unitaire estimé, en euros.", 'any', 0)}
    </div>
    <div class="field">
      <label class="lab" for="f_artiste">Illustrateur</label>
      <input type="text" id="f_artiste" data-filtre="artiste" value="${esc(S.filtres.artiste)}" placeholder="ex. John Avon, Rebecca Guay…" autocomplete="off">
    </div>
    <div class="small muted">Laissez un champ vide pour ne pas l'utiliser. Chaque champ cherche <b>ses mots un à un</b>, dans n'importe quel ordre : « Legendary creature » retient aussi « Legendary Enchantment Creature — God », et « draw card » les cartes qui disent « draw a card ». « Nom » ne regarde que le nom ; « Type » cherche dans la ligne de type, en français comme en anglais (« créature », « artifact », « human soldier ») ; « Texte de règles » cherche dans le texte d'Oracle de la carte, celui qui décrit ses capacités. Dès qu'une borne de force ou d'endurance est posée, les cartes qui n'en ont pas (sorts, terrains) sont écartées ; de même, filtrer par illustrateur écarte les cartes dont l'illustrateur n'est pas encore connu.</div>
    <div class="small muted">Ces filtres s'ajoutent aux couleurs choisies ci-dessus ; ils valent pour la collection affichée et pour les analyses qui en découlent.</div>
    <div class="warnbox" id="filtreResume">${resumeFiltres()}</div>`);
}

function resumeFiltres() {
  return avecBrouillon(() => {
    const list = filtered();
    const ex = list.reduce((n, e) => n + e.qty, 0);
    const total = collectionCards();
    const actifs = filtresActifs();
    /* Le décompte suit la frappe — il ne coûte que la collection — mais rien
       n'est encore appliqué au reste de l'atelier. */
    return `<b>${list.length}</b> carte(s) différentes retenues sur ${total.length} · ${ex} exemplaire(s)
      · ${actifs.length ? `${actifs.length} filtre(s) : ${esc(texteFiltresActifs())}` : 'aucun filtre actif'}
      ${brouillonModifie() ? '<br><b>Saisie en attente</b> : « Appliquer » la reporte sur l\'atelier.' : ''}`;
  });
}

function majResumeFiltres() {
  const el = document.getElementById('filtreResume');
  if (el) el.innerHTML = resumeFiltres();
}

/* La barre de progression du filtrage, dans le pied de la fenêtre : c'est
   la seule partie toujours visible, quel que soit le défilement du corps. */
function zoneProgression() {
  return `<div id="filtreProgres" class="filtre-progres" hidden>
    <div class="small muted" id="filtreProgresTxt"></div>
    <div class="track"><div class="fill" id="filtreProgresBar" style="width:0%;background:var(--brass)"></div></div>
  </div>`;
}

function majProgression(txt, fait, total) {
  const zone = document.getElementById('filtreProgres');
  if (zone) zone.hidden = false;
  const pct = total > 0 ? Math.round(fait / total * 100) : 0;
  const t = document.getElementById('filtreProgresTxt');
  const b = document.getElementById('filtreProgresBar');
  if (t) t.textContent = total > 0
    ? `${txt} — ${fait.toLocaleString('fr-FR')} / ${total.toLocaleString('fr-FR')} (${pct} %)`
    : `${txt}…`;
  if (b) b.style.width = pct + '%';
}

/* Le filtrage lui-même, par tranches, pour que la barre se peigne entre
   deux lots. Les cartes candidates sont d'abord bâties, puis notées : ce
   sont les deux temps longs, et le pourcentage porte sur elles. */
async function filtrerAvecProgression() {
  const pied = document.getElementById('dlgFoot');
  if (pied) pied.querySelectorAll('button').forEach(b => b.disabled = true);
  majProgression('Préparation des cartes', 0, 0);
  await pause();
  try {
    if (typeof prechauffeCandidats === 'function')
      await prechauffeCandidats((fait, total) => majProgression('Préparation des cartes', fait, total));
    if (typeof prepareSuggestions === 'function')
      await prepareSuggestions((fait, total) => majProgression('Notation des candidates', fait, total));
    majProgression('Affichage', 1, 1);
    await pause();
    renderAll();
  } finally {
    if (pied) pied.querySelectorAll('button').forEach(b => b.disabled = false);
  }
}

function majFenetreFiltres() {
  const dlg = document.getElementById('dlg');
  if (!dlg || !dlg.open) return;
  const corps = document.getElementById('dlgBody');
  if (!corps || !corps.querySelector('[data-filtre]')) return;
  const y = corps.scrollTop;
  const panneau = document.getElementById('archPanel');
  const yArch = panneau ? panneau.scrollTop : 0;
  const panneauSet = document.getElementById('setPanel');
  const ySet = panneauSet ? panneauSet.scrollTop : 0;
  corps.innerHTML = corpsFiltres();
  corps.scrollTop = y;
  const nouveau = document.getElementById('archPanel');
  if (nouveau) nouveau.scrollTop = yArch;
  const nouveauSet = document.getElementById('setPanel');
  if (nouveauSet) nouveauSet.scrollTop = ySet;
}

/* « Appliquer » verse le brouillon, puis recalcule. C'est le seul moment où
   l'atelier entier est repris. */
async function appliquerFiltres() {
  verseBrouillon();
  await filtrerAvecProgression();
  closeDialog();
}

function openFiltresModal() {
  /* La liste des sets vient de Scryfall : on la demande à l'ouverture, elle
     ne repart en ligne qu'une fois par semaine. */
  if (typeof chargerListeSets === 'function') chargerListeSets();
  openDialog('Filtres de la collection', corpsFiltres(),
    `<button type="button" class="btn foot-g" data-act="resetFiltres">Réinitialiser</button>
     <button type="button" class="btn" data-act="closeDialog">Annuler</button>
     <button type="button" class="btn pri" data-act="appliquerFiltres">Appliquer</button>
     ${zoneProgression()}`);
  /* Après `openDialog`, qui remet le brouillon à zéro comme tout changement
     de fenêtre. */
  ouvreBrouillon(['filtres', 'colors', 'colorMode'],
    () => { majFenetreFiltres(); majResumeFiltres(); });
}

