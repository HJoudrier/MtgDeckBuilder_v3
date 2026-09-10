/* =====================================================================
   js/entete.js — L'en-tête et la barre des onglets

   Le bandeau du haut : les pastilles de format, de budget et de filtres, les
   compteurs, l'engrenage des paramètres. Puis les onglets, qui ne redessinent
   rien en changeant — les cinq sections sont déjà peintes, on masque et on
   démasque, chacun retrouvant son défilement.
   ===================================================================== */

const FILTRE_ICONE = '<svg viewBox="0 0 16 16" width="11" height="11" aria-hidden="true" style="vertical-align:-1px"><path d="M1.2 2.2h13.6L9.4 8.6v5.2L6.6 12.3V8.6z" fill="currentColor"/></svg>';

/* L'engrenage des paramètres : douze dents posées en couronne et un moyeu
   évidé, dessinés ici plutôt que chargés — l'atelier ne dépend d'aucun
   fichier extérieur, pas même d'une icône. */
const PARAM_ICONE = `<svg viewBox="0 0 24 24" width="17" height="17" aria-hidden="true" focusable="false">
  <path fill="currentColor" d="M12 8.4a3.6 3.6 0 1 0 0 7.2 3.6 3.6 0 0 0 0-7.2zm0 5.9a2.3 2.3 0 1 1 0-4.6 2.3 2.3 0 0 1 0 4.6z"/>
  <path fill="currentColor" d="M20.3 13.6a8.6 8.6 0 0 0 0-3.2l1.8-1.4-1.8-3.1-2.1.8a8.4 8.4 0 0 0-2.8-1.6L15.1 2h-3.6l-.3 2.3H11a8.4 8.4 0 0 0-2.7 1.6l-2.1-.8-1.8 3.1 1.8 1.4a8.6 8.6 0 0 0 0 3.2l-1.8 1.4 1.8 3.1 2.1-.8a8.4 8.4 0 0 0 2.8 1.6l.3 2.3h3.6l.3-2.3a8.4 8.4 0 0 0 2.8-1.6l2.1.8 1.8-3.1-1.8-1.4zm-1.6-1.6c0 .5-.05 1-.15 1.5l-.12.6 1.5 1.16-.53.92-1.76-.67-.46.4c-.73.64-1.6 1.14-2.53 1.45l-.58.2-.26 1.94h-1.06l-.26-1.95-.58-.19a6.9 6.9 0 0 1-2.53-1.46l-.46-.4-1.76.67-.53-.92 1.5-1.15-.12-.6a7.2 7.2 0 0 1 0-3l.12-.6-1.5-1.16.53-.92 1.76.67.46-.4A6.9 6.9 0 0 1 11.7 6.5l.58-.2.26-1.94h1.06l.26 1.95.58.19c.93.31 1.8.81 2.53 1.46l.46.4 1.76-.67.53.92-1.5 1.15.12.6c.1.5.15 1 .15 1.5z"/>
</svg>`;

/* La hauteur de l'entête, publiée pour le CSS : les sections s'en servent
   comme marge de défilement et s'arrêtent sous elle plutôt que derrière. Elle
   se relève après coup — l'entête se replie et ses pastilles s'enroulent, si
   bien qu'une mesure prise avant l'écriture donnerait la hauteur d'avant. */
function majHauteurEntete() {
  const entete = document.getElementById('topHeader');
  if (entete) document.documentElement.style.setProperty('--h-entete', entete.offsetHeight + 'px');
}

function renderTop() {
  const topStats = document.getElementById('topStats');
  const topHeader = document.getElementById('topHeader');
  if (topHeader) topHeader.classList.toggle('compact', !!S.headerCompact);
  if (!topStats) { majHauteurEntete(); return; }

  const f = fmt();

  const sp = spent();
  const left = S.budget.total - sp;

  const gName = nomCombinaisonCouleurs(S.colors);

  const manaBarHTML = `
    <div class="head-colors" title="Filtre couleur actif (cliquer pour activer/désactiver une couleur)">
      <div class="head-mana-bar">
        ${COLS.map(([c, title]) => `
          <button type="button" class="mana-btn sm" data-color="${c}" aria-pressed="${S.colors.has(c)}" title="${title}">
            ${symBg(c)}
          </button>`).join('')}
      </div>
      <button type="button" class="pill head-combo" data-act="filtres" title="Combinaison active : ${esc(gName)} (cliquer pour ouvrir les filtres)">
        <b>${esc(gName)}</b>
      </button>
    </div>
  `;

  /* Le format seul. La taille du deck et sa conformité vivaient ici aussi ;
     l'onglet Deck les dit mieux — son indice porte le décompte, et son encadré
     énumère ce qu'il reste à corriger au lieu d'un seul glyphe. */
  const deckPillHTML = `
    <button type="button" class="pill head-format" id="pillDeck" data-act="formatDialog" title="Format de jeu : ${esc(f.label)} (cliquer pour le changer)">Format <b>${esc(f.label)}</b></button>
  `;

  const actifs = filtresActifs();
  const filtreBtnHTML = `
    <button type="button" class="btn sm head-filtre ${actifs.length ? 'actif' : ''}" data-act="filtres"
      title="${actifs.length ? `Filtres actifs : ${esc(texteFiltresActifs())} (cliquer pour les modifier)` : 'Ajouter un filtre : recherche, type, nom, force, endurance, coût de mana ou prix'}">
      ${FILTRE_ICONE} ${actifs.length ? `Filtres <span class="filtre-n">${actifs.length}</span>` : 'Filtres'}
    </button>
  `;

  /* Tous les filtres en vigueur restent lisibles et retirables dans l'en-tête. */
  const filtreChipsHTML = actifs.length ? `
    <div class="head-filtres" role="group" aria-label="Filtres actifs">
      ${actifs.map(a => `<span class="filtre-chip" title="${esc(a.texte)}">
        <button type="button" class="chip-txt" data-act="filtres">${esc(a.texte)}</button>
        <button type="button" class="chip-x" data-act="dropFiltre" data-cles="${esc(a.cles.join(','))}" title="Retirer ce filtre" aria-label="Retirer le filtre ${esc(a.texte)}">✕</button>
      </span>`).join('')}
      <button type="button" class="btn sm" data-act="resetFiltres" title="Retirer tous les filtres">Tout effacer</button>
    </div>` : '';

  /* Le budget se règle dans sa fenêtre, et cette pastille en est la porte :
     elle reste donc affichée même à zéro, sans quoi un budget une fois remis
     à zéro ne serait plus jamais atteignable. */
  const budgetPillHTML = `
    <button type="button" class="pill" id="pillBudget" data-act="budgetDialog" style="cursor:pointer" title="${S.budget.total > 0
        ? `Budget restant sur ${esc(eur(S.budget.total))} — cliquer pour régler le budget et les préférences d'achat Cardmarket`
        : 'Aucun budget : seules les cartes de votre collection sont proposées — cliquer pour en fixer un'}">Budget <b>${S.budget.total > 0 ? eur(Math.max(0, left)) : '—'}</b></button>
  `;

  const toggleBtnHTML = `
    <button type="button" class="btn sm head-toggle ${S.headerCompact ? 'is-compact' : ''}" data-act="toggleHeader" title="${S.headerCompact ? 'Déplier l\'en-tête (afficher toutes les statistiques et actions)' : 'Réduire l\'en-tête (navigation compacte)'}" aria-pressed="${!S.headerCompact}">
      ${S.headerCompact ? '▾ Stats' : '▴ Réduire'}
    </button>
  `;

  /* Deux pastilles disaient ici ce que la collection retenait et ce que le
     catalogue contenait. Les sections le disent déjà, et mieux : la phrase de
     causes de la collection énumère ce qui écarte chaque carte, et
     `ligneCatalogue()` compte les candidates avec le motif des écartées. Les
     retirer épargne, à chaque rendu de l'entête, un filtrage complet de la
     collection et un parcours de tout le catalogue — et l'entête se rend deux
     fois par repeint, `renderB()` le redemandant après `renderAll()`. */
  topStats.innerHTML = `
    ${manaBarHTML}
    ${filtreChipsHTML}
    ${deckPillHTML}
    ${budgetPillHTML}
    ${toggleBtnHTML}
  `;

  /* L'engrenage et le bouton des filtres partagent le coin haut-droit : tous
     deux règlent la vue, non ce qu'elle montre. L'engrenage vit dans la page et
     son dessin n'y est posé qu'une fois ; le bouton des filtres, lui, porte un
     compte et une infobulle qui changent, d'où sa lucarne réécrite ici. */
  const param = document.getElementById('btnParametres');
  if (param && !param.firstChild) param.innerHTML = PARAM_ICONE;
  const lucarne = document.getElementById('headFiltre');
  if (lucarne) lucarne.innerHTML = filtreBtnHTML;

  majHauteurEntete();
}

/* ---------------------------------------------------------------------
   Les onglets.

   Les cinq sections sont rendues à chaque fois, celles qu'on ne regarde pas
   comprises : une page masquée n'est pas mise en page, elle ne coûte que le
   texte qu'on y écrit, et changer d'onglet ne demande alors aucun rendu — un
   attribut, et la page est là, jamais périmée.
   --------------------------------------------------------------------- */

/* Où l'on en était dans chaque onglet. Le défilement est celui du document,
   partagé par les trois pages : sans ce relevé, revenir au deck après une
   longue collection retomberait n'importe où. Rien n'en est conservé d'une
   séance à l'autre — c'est le fil d'une lecture, pas un réglage. */
const POS_ONGLETS = {};

/* La barre ne se réécrit pas, elle change d'attributs : la réécrire
   emporterait le focus du bouton qu'on vient de presser, et les flèches
   n'auraient plus rien sous elles. */
function renderOnglets() {
  if (!ONGLETS[S.onglet]) S.onglet = CLES_ONGLETS[0];
  document.querySelectorAll('#onglets [data-onglet]').forEach(b => {
    const actif = b.dataset.onglet === S.onglet;
    b.setAttribute('aria-selected', String(actif));
    // une seule tabulation entre dans la barre ; les flèches font le reste
    b.tabIndex = actif ? 0 : -1;
    if (actif) { b.classList.remove('travaille'); b.removeAttribute('title'); }
  });
  document.querySelectorAll('.page[data-page]').forEach(p => {
    p.hidden = p.dataset.page !== S.onglet;
  });
}

/* Passer d'un onglet à l'autre : rien n'est redessiné, les cinq sections
   étant toujours rendues. La page voulue est découverte, et le défilement
   retrouve celui qu'elle avait. */
function activerOnglet(cle, opts) {
  if (!ONGLETS[cle]) return;
  const change = S.onglet !== cle;
  if (change && typeof window !== 'undefined') POS_ONGLETS[S.onglet] = window.scrollY;
  S.onglet = cle;
  renderOnglets();
  if (change) {
    if (!(opts && opts.sansDefiler) && typeof window !== 'undefined')
      window.scrollTo({top: POS_ONGLETS[cle] || 0, behavior:'auto'});
    scheduleSave();
  }
}

/* Aller à une section, d'où qu'on parte : l'onglet qui la porte s'ouvre, et
   le défilement s'arrête sous l'entête collante plutôt que derrière elle. */
function allerVersSection(id) {
  activerOnglet(ongletDeSection(id), {sansDefiler:true});
  const el = document.getElementById(id);
  if (!el || typeof window === 'undefined') return;
  const entete = document.getElementById('topHeader');
  const marge = entete ? entete.getBoundingClientRect().height + 8 : 0;
  const y = el.getBoundingClientRect().top + window.scrollY - marge;
  window.scrollTo({top: Math.max(0, y), behavior:'smooth'});
}

