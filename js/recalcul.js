/* =====================================================================
   js/recalcul.js — Les recalculs annoncés

   Noter les candidates est le temps long de l'atelier : des dizaines de milliers
   de cartes. Fait d'un bloc, il fige la fenêtre sans rien dire ; d'où le
   découpage en tranches, et la boîte qui l'annonce — jamais par-dessus une
   fenêtre déjà ouverte, où la barre se glisse dans le pied plutôt que de la
   chasser, et jamais pour un travail trop court pour se voir.
   ===================================================================== */

/* Au-delà de tant de cartes à noter, le calcul passe par tranches plutôt que
   d'un bloc ; en deçà, l'atelier se refait sur-le-champ comme avant. */
const SEUIL_RECALCUL = 1200;

/* Et la boîte n'est montrée que si ces tranches durent : au-dessous, le
   recalcul est fini avant qu'on ait pu la lire. */
const DELAI_BOITE = 250;

function pause() {
  return new Promise(r => setTimeout(r, 0));
}

/* Le recalcul qui vient sera-t-il long ? Deux cas : les candidates sont à
   rebâtir depuis l'archive, ou le vivier à noter est déjà gros. */
function recalculLong() {
  if (typeof CAT === 'undefined' || typeof CAND === 'undefined') return false;
  /* Rien à renoter : la sélection vaut encore pour l'état courant, et le
     rendu la reprendra telle quelle. */
  if (typeof suggestionsAJour === 'function' && suggestionsAJour()) return false;
  const archive = CAT.etat === 'ok' && CAT.cartes.length > 0;
  if (archive && CAND.sig !== signatureCandidats()) return true;
  return (CAND.liste ? CAND.liste.length : 0) + S.collection.size > SEUIL_RECALCUL;
}

let boiteRecalcul = false;      // notre boîte est-elle à l'écran ?
let barreEmpruntee = false;     // la barre est-elle glissée dans le pied d'une autre fenêtre ?

function corpsBoiteRecalcul(raison) {
  return `<div id="boiteRecalcul">
    <p class="small" style="margin:0 0 6px">${esc(raison)}</p>
    <div class="small muted">Les cartes candidates sont rebâties, puis notées une à une. Le travail avance par
      tranches : la fenêtre reste vivante, et cette boîte se referme d'elle-même une fois l'atelier à jour.
      « Masquer » la referme sans rien interrompre.</div>
    ${zoneProgression()}
  </div>`;
}

/* Annonce le recalcul là où il ne gêne pas : dans sa boîte si rien n'est
   ouvert, dans le pied de la fenêtre ouverte sinon — la refermer emporterait
   la fiche ou le formulaire que l'on est en train de lire. */
function annonceRecalcul(raison) {
  const dlg = document.getElementById('dlg');
  if (dlg && dlg.open) {
    const pied = document.getElementById('dlgFoot');
    if (pied && !document.getElementById('filtreProgres')) {
      pied.insertAdjacentHTML('beforeend', zoneProgression());
      barreEmpruntee = true;
    }
    return;
  }
  boiteRecalcul = true;
  openDialog('Recalcul en cours', corpsBoiteRecalcul(raison),
    '<button type="button" class="btn" data-act="closeDialog">Masquer</button>');
}

/* Ne referme que notre boîte : l'utilisateur a pu la masquer et ouvrir autre
   chose pendant que le calcul se poursuivait. */
function finRecalcul() {
  if (barreEmpruntee) {
    const zone = document.getElementById('filtreProgres');
    if (zone && zone.parentElement && zone.parentElement.id === 'dlgFoot') zone.remove();
    barreEmpruntee = false;
  }
  if (!boiteRecalcul) return;
  boiteRecalcul = false;
  const dlg = document.getElementById('dlg');
  if (dlg && dlg.open && document.getElementById('boiteRecalcul')) closeDialog();
}

/* La progression d'un recalcul de fond : rien de modal, rien qui pousse la
   mise en page. Un liseré de trois pixels au bord haut de la section, posé en
   position absolue, et le décompte de l'en-tête qui dit où l'on en est. Le
   décompte normal — « 104 pistes » — revient au rendu qui suit. */
function progresSection(txt, fait, total) {
  const pct = total > 0 ? Math.min(100, Math.round(fait / total * 100)) : 0;
  const etiquette = total > 0 ? `${txt} ${pct} %` : `${txt}…`;
  /* Une même notation nourrit les trois sections des propositions : le liseré
     paraît sur chacune, et l'on voit le travail avancer depuis la page qu'on
     regarde, quelle qu'elle soit. */
  SECTIONS_SUGGESTIONS.forEach(id => {
    const sec = document.getElementById(id);
    if (!sec) return;
    let bande = sec.querySelector(':scope > .sec-progres');
    if (!bande) {
      bande = document.createElement('div');
      bande.className = 'sec-progres';
      bande.innerHTML = '<i></i>';
      sec.appendChild(bande);
    }
    if (bande.firstChild) bande.firstChild.style.width = pct + '%';
    const hint = document.getElementById('hint' + id.slice(3));
    if (hint) hint.textContent = etiquette;
    /* Le liseré ne se voit pas depuis un autre onglet : le point de la barre
       dit, lui, qu'un travail court dans une page qu'on ne regarde pas. */
    signalerTravail(id, true, etiquette);
  });
}

function finProgresSection() {
  SECTIONS_SUGGESTIONS.forEach(id => {
    const sec = document.getElementById(id);
    const bande = sec && sec.querySelector(':scope > .sec-progres');
    if (bande) bande.remove();
    signalerTravail(id, false);
  });
}

/* Un recalcul à la fois. Un geste arrivé pendant qu'un autre travaille est
   retenu et repris ensuite : l'état qu'il lira sera le dernier, et le
   résultat le bon. */
let recalculEnCours = false;
let recalculSuivant = null;

/* `opts.fond` : le recalcul n'a été demandé par personne — des statistiques
   qui arrivent, des prix, une carte que Scryfall vient de compléter. Il ne
   doit alors ni ouvrir de fenêtre, ni vider la section, ni bousculer l'ordre
   affiché : il se signale d'un liseré et garde la liste en place. */
async function recalculerAvecProgression(raison, opts) {
  const fond = !!(opts && opts.fond);
  if (recalculEnCours) {
    /* Un geste arrivé pendant un recalcul de fond l'emporte : la reprise se
       fera à découvert, avec sa boîte et sa raison. */
    recalculSuivant = {
      raison: raison || (recalculSuivant && recalculSuivant.raison) || '',
      fond: fond && (!recalculSuivant || recalculSuivant.fond)
    };
    return;
  }

  /* L'ancre est relevée avant tout : c'est ce qu'on lit à cet instant, et non
     ce qu'il en restera après un rendu. De même pour l'ordre gelé d'un
     recalcul de fond : c'est le classement affiché qu'il faut retenir, pas
     celui qui va sortir de la notation. */
  const ancre = releveAncre();
  if (fond && typeof geleSuggestions === 'function') geleSuggestions();

  /* Rien de long à faire : l'atelier se refait sur-le-champ, comme avant. */
  if (!recalculLong()) {
    renderAll();
    restaureAncre(ancre);
    return;
  }

  recalculEnCours = true;
  /* La boîte n'est pas ouverte d'emblée : un recalcul bref — les cartes
     déjà bâties, un catalogue modeste — se termine avant qu'on ait eu le
     temps de la lire, et elle ne ferait que clignoter. Elle paraît si le
     travail dure, entre deux tranches. Un recalcul de fond, lui, n'en ouvre
     jamais. */
  const avance = fond
    ? (txt, fait, total) => progresSection(txt, fait, total)
    : (txt, fait, total) => majProgression(txt, fait, total);
  const differe = fond ? null : setTimeout(() => {
    annonceRecalcul(raison || 'L\'atelier se met à jour.');
    majProgression('Préparation des cartes', 0, 0);
  }, DELAI_BOITE);
  if (fond) progresSection('recalcul', 0, 0);
  try {
    await pause();
    if (typeof prechauffeCandidats === 'function')
      await prechauffeCandidats((fait, total) => avance('Préparation des cartes', fait, total));
    if (typeof prepareSuggestions === 'function')
      await prepareSuggestions((fait, total) => avance('Notation des candidates', fait, total));
    avance('Affichage', 1, 1);
    await pause();
    /* Le gel a été posé à l'entrée : la liste garde l'ordre qu'elle avait et
       se rafraîchit en place, comme après un ajout. Il faut seulement le
       redemander, un rendu ayant pu consommer le drapeau entre-temps. */
    if (fond && typeof geleSuggestions === 'function') geleSuggestions();
    renderAll();
    restaureAncre(ancre);
  } finally {
    if (differe) clearTimeout(differe);
    finProgresSection();
    finRecalcul();
    recalculEnCours = false;
    if (recalculSuivant) {
      const suite = recalculSuivant;
      recalculSuivant = null;
      recalculerAvecProgression(suite.raison, {fond: suite.fond});
    }
  }
}

