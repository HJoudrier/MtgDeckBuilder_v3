/* =====================================================================
   js/liens.js — Le tri des liens : interaction précise ou déclencheur large

   Deux cartes se relient par des liens portés par un concept et un sens — elle
   lui fournit, elle en reçoit. Mais tous ne se valent pas : certains déclencheurs
   prennent le deck entier. Toute carte non-terrain produit « lancement de sort »
   du seul fait d'être lançable, toute permanente produit « arrivée en jeu » du
   seul fait d'arriver (js/cartes.js, les deux productions posées en fin
   d'analyse). Une carte qui se déclenche « quand vous lancez un sort » se relie
   donc à chacun des soixante sorts du deck — et affichait soixante interactions
   pour une seule et même propriété.

   On ne nomme pas les concepts coupables, on les compte : au-delà du quart du
   deck, un même déclencheur ne s'intègre plus à chaque carte, il s'intègre au
   deck. Le critère suit alors le deck qu'on construit, sans liste à tenir à jour.
   ===================================================================== */

/* Le plancher de quatre évite de traiter de large le déclencheur d'un deck de
   six cartes, où le quart ne veut encore rien dire. */
function seuilLiensLarges(taille) {
  return Math.max(4, Math.ceil((taille || 0) / 4));
}

function cleLien(l) { return l.concept + '|' + l.dir; }

/* Range les partenaires en deux tas — ceux qu'au moins un lien précis relie,
   ceux que seul un déclencheur large atteint — et nomme les familles larges,
   la plus nourrie d'abord. Seul `links` est lu : les deux formes de partenaire
   s'y présentent, celle de `noteCarte()` qui porte un `name` comme celle de
   `partnersFor()` qui porte une `card`. */
function classeLiens(partners, taille) {
  const seuil = seuilLiensLarges(taille);
  const compte = new Map();
  (partners || []).forEach(p => {
    new Set((p.links || []).map(cleLien)).forEach(k => compte.set(k, (compte.get(k) || 0) + 1));
  });
  const large = new Set([...compte.entries()].filter(([, n]) => n > seuil).map(([k]) => k));

  const parts = (partners || []).map(p => ({
    p,
    precis: (p.links || []).filter(l => !large.has(cleLien(l))),
    larges: (p.links || []).filter(l => large.has(cleLien(l)))
  }));

  const familles = [...large].map(k => {
    const [concept, dir] = k.split('|');
    return {concept, dir, n: compte.get(k)};
  }).sort((a, b) => b.n - a.n);

  return {
    seuil, familles, parts,
    precis: parts.filter(x => x.precis.length),
    larges: parts.filter(x => !x.precis.length && x.larges.length)
  };
}

/* Le nom d'une famille large, tel qu'on le montre : « lancement de sort » suffit,
   le sens du lien n'apprend rien à qui lit une infobulle. */
function libelleFamilleLarge(f) {
  return (NODE[f.concept] ? NODE[f.concept].label : f.concept).toLowerCase();
}

function libelleFamillesLarges(familles) {
  return [...new Set((familles || []).map(libelleFamilleLarge))].join(', ');
}

/* Ce qu'un déclencheur large vaut : une prime, non soixante interactions. Elle
   croît en racine du nombre de cartes qui l'alimentent — se déclencher souvent
   reste une qualité — et reste bornée, pour qu'une carte ne tire jamais du seul
   mot « sort » ce que deux vraies synergies lui donneraient. */
function primeLiensLarges(familles) {
  return Math.min(6, (familles || []).reduce((a, f) => a + Math.min(4.5, 1.1 * Math.sqrt(f.n)), 0));
}
