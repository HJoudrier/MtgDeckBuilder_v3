/* =====================================================================
   js/anaSection.js — L'onglet Analyse

   Tout ce qu'on peut dire du deck ouvert, sur une seule page : la synthèse,
   le palier, la courbe et les types, les couleurs, les mains de départ, la
   mise en place, les familles de capacités, les rôles, la synergie et le
   prix. Le **deck entier** est analysé — la liste principale, sans la réserve
   ni l'étude — et les filtres de l'en-tête n'y changent rien : masquer les
   terrains rendrait absurde chaque probabilité de main.

   Comme la page des simulations, celle-ci ne se calcule que sous les yeux :
   hors de vue, `renderN()` note seulement qu'elle a vieilli, et
   `activerOnglet()` la repeint en y arrivant. Les parties d'essai, le plus
   long, sont gardées tant que le deck ne change pas (js/anaTirages.js).
   ===================================================================== */

let ANA_PERIME = true;

const ANA_BLOCS = [
  ['synthese', 'Synthèse'], ['palier', 'Palier'], ['courbe', 'Courbe et types'], ['couleurs', 'Couleurs'],
  ['mains', 'Mains de départ'], ['miseenplace', 'Mise en place'], ['familles', 'Familles de capacités'],
  ['roles', 'Rôles'], ['synergie', 'Synergie'], ['prix', 'Prix']
];

/* Le contexte de l'analyse, bâti une fois par rendu : chaque bloc y lit ce
   qu'il lui faut, et rien n'est compté deux fois. */
function contexteAnalyse() {
  const entries = deckEntries();
  const {cartes:lib, commandant:cmd} = bibliothequeAnalyse();
  const sorts = entries.filter(e => !e.card.isLand);
  const qte = sorts.reduce((a, e) => a + e.qty, 0);
  const jugees = [...new Map(lib.filter(c => !c.isLand).map(c => [c.name, c])).values()];
  if (cmd) jugees.push(cmd);
  const achats = aAcheter();
  const b = bilanMana();
  return {
    entries, lib, cmd, jugees,
    taille: deckSize(),
    terrains: entries.filter(e => e.card.isLand).reduce((a, e) => a + e.qty, 0),
    accelerateurs: b.accelerateurs,
    cmcMoyen: qte ? sorts.reduce((a, e) => a + e.card.cmc * e.qty, 0) / qte : 0,
    cmcMedian: medianePonderee(sorts.map(e => [e.card.cmc, e.qty])),
    valeur: entries.reduce((a, e) => a + (e.card.price || 0) * e.qty, 0),
    aAcheter: achats.reduce((a, l) => a + l.total, 0),
    nbAAcheter: achats.reduce((a, l) => a + l.qty, 0),
    sim: miseEnPlaceDuDeck(lib, cmd),
    mains: analyseMains(lib),
    palier: fmt().commander ? estimePalier() : null,
    syn: analyseSynergie(),
    interaction: profilInteraction()
  };
}

function anaSommaire() {
  return `<nav class="ana-sommaire" aria-label="Sommaire de l'analyse">${ANA_BLOCS
    .filter(([id]) => id !== 'palier' || fmt().commander)
    .map(([id, t]) => `<button type="button" class="pill" data-act="anaAller" data-cible="ana-${id}">${t}</button>`).join('')}</nav>`;
}

function anaPage(A) {
  const f = fmt();
  return `${anaSommaire()}
    ${anaBloc('synthese', 'Synthèse', `Le deck entier, ${f.label} — la réserve, l'étude et les filtres de l'en-tête n'y entrent pas.`, anaSynthese(A))}
    ${f.commander ? anaBloc('palier', 'Palier du Commander', 'Le palier (« bracket ») que les critères publiés par Wizards permettent de revendiquer.', anaPalierVue(A.palier)) : ''}
    ${anaBloc('courbe', 'Courbe de mana et types', 'Les terrains sont exclus de la courbe ; un coût de 7 ou plus se range dans la dernière colonne.', anaCourbe(A))}
    ${anaBloc('couleurs', 'Couleurs et base de mana', 'Ce que les coûts demandent, ce que les sources servent, et ce qui risque de rester en main.', anaCouleurs(A))}
    ${anaBloc('mains', 'Mains de départ et pioche', 'Ce que la main de sept cartes réserve, et la chance de voir chaque rôle tôt dans la partie.', anaMains(A))}
    ${anaBloc('miseenplace', 'Mise en place', 'Le mana dont le deck dispose, tour après tour, joué seul sur des milliers de mélanges.', anaMiseEnPlace(A))}
    ${anaBloc('familles', 'Familles de capacités', 'Ce que les capacités du deck produisent, et ce dont elles se nourrissent, famille par famille.', anaFamillesVue())}
    ${anaBloc('roles', 'Rôles, mots-clés et interaction', '', `${anaRolesVue()}<h4 class="ana-h4">Mots-clés</h4>${anaMotsClesVue()}<h4 class="ana-h4">Interaction</h4>${anaInteractionVue()}`)}
    ${anaBloc('synergie', 'Synergie', 'À quel point les cartes du deck se nourrissent les unes les autres, d\'après le graphe des capacités.', anaSynergieVue(A.syn))}
    ${anaBloc('prix', 'Prix et collection', 'Les prix estimés de Cardmarket, et ce qui manque encore à la collection.', anaPrix(A))}`;
}

function renderN() {
  const corps = document.getElementById('bodyN'), indice = document.getElementById('hintN');
  if (!corps) return;
  const n = deckSize();
  if (indice) indice.textContent = n ? `${deckCourant().nom || 'deck ouvert'} · ${n} carte(s), deck entier` : 'deck vide';
  if (S.onglet !== 'analyse') { ANA_PERIME = true; return; }
  ANA_PERIME = false;
  if (!n) {
    corps.innerHTML = '<div class="empty">Le deck est vide : ajoutez-y des cartes depuis l\'onglet Cartes ou Construction pour en voir l\'analyse.</div>';
    return;
  }
  const ancre = releveAncre();
  corps.innerHTML = anaPage(contexteAnalyse());
  restaureAncre(ancre);
}

/* La page a vieilli pendant qu'on regardait ailleurs : on la repeint avant de
   la montrer, pour que le défilement retrouvé tombe sur la page finale. */
function rattraperAnalyse() {
  if (ANA_PERIME && S.onglet === 'analyse') renderN();
}

/* Le sommaire mène à un bloc ; l'entête collante ne doit pas le couvrir. */
function allerVersBlocAnalyse(id) {
  const el = document.getElementById(id);
  if (!el || typeof window === 'undefined') return;
  const entete = document.getElementById('topHeader');
  const marge = entete ? entete.getBoundingClientRect().height + 8 : 0;
  window.scrollTo({top: Math.max(0, el.getBoundingClientRect().top + window.scrollY - marge), behavior:'smooth'});
}
