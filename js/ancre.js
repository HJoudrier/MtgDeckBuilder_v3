/* =====================================================================
   js/ancre.js — L'ancre de défilement

   Repeindre l'atelier déplace ce qu'on était en train de lire. On relève donc,
   avant, la carte ou la section la plus proche du haut de l'écran, et on la
   remet après au même creux du défilement.
   ===================================================================== */

/* ---------------------------------------------------------------------
   L'ancre de défilement.

   Un rendu complet repeint toutes les sections : le deck qui gagne une
   ligne, l'en-tête qui gagne une pastille, et ce qu'on lisait descend de
   quelques dizaines de pixels. On relève donc, avant, ce qui occupe le haut
   de la fenêtre — la vignette qu'on regardait dans les suggestions, ou à
   défaut la section — pour l'y remettre après.
   --------------------------------------------------------------------- */

/* Les repères possibles : les sections, et toute carte affichée. La bonne
   ancre est la plus profonde de celles qui franchissent le haut de la
   fenêtre — la vignette qu'on lisait plutôt que la section qui la porte. */
function candidatsAncre() {
  return [...document.querySelectorAll('section.sec, [data-card]')];
}

function releveAncre() {
  if (typeof window === 'undefined' || typeof document === 'undefined') return null;
  /* Le repère le plus proche du haut de la fenêtre, au-dessus comme au-dessous
     — et, à distance égale, la carte plutôt que la section qui la porte : une
     section prise pour ancre laisse le contenu glisser sous elle dès qu'une
     ligne s'ajoute au-dessus, un bandeau par exemple. */
  let cible = null, meilleur = Infinity;
  for (const el of candidatsAncre()) {
    const r = el.getBoundingClientRect();
    if (r.bottom <= 0) continue;
    const d = Math.abs(r.top);
    const carte = el.hasAttribute('data-card');
    if (d < meilleur - 1 || (d < meilleur + 1 && carte && cible && !cible.hasAttribute('data-card'))) {
      meilleur = Math.min(meilleur, d);
      cible = el;
    }
  }
  if (!cible) return null;
  return {
    section: cible.closest('section.sec') ? cible.closest('section.sec').id : '',
    nom: cible.getAttribute('data-card') || '',
    y: cible.getBoundingClientRect().top
  };
}

function restaureAncre(a) {
  if (!a || typeof window === 'undefined') return;
  const sec = a.section ? document.getElementById(a.section) : null;
  let cible = null;
  if (a.nom && typeof CSS !== 'undefined' && CSS.escape)
    cible = (sec || document).querySelector(`[data-card="${CSS.escape(a.nom)}"]`);
  cible = cible || sec;
  if (!cible) return;
  /* L'ancre a pu passer sous un autre onglet pendant un recalcul de fond :
     une page masquée n'a pas de rectangle, et l'écart mesuré ferait sauter le
     défilement de celle qu'on regarde. */
  if (typeof cible.getClientRects === 'function' && !cible.getClientRects().length) return;
  const ecart = cible.getBoundingClientRect().top - a.y;
  if (Math.abs(ecart) > 1) window.scrollBy(0, ecart);
}

