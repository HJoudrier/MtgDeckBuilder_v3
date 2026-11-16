/* Navigation principale en quatre espaces, sans toucher aux clés internes
   des sept pages : les sauvegardes et les liens existants restent compatibles. */
(() => {
  const GROUPES = {
    collection: ['collection','decks'],
    deck: ['deck'],
    suggestions: ['graphe','edhrec','catalogue'],
    jouer: ['simulation']
  };
  const PREMIERE_PAGE = {collection:'collection',deck:'deck',suggestions:'graphe',jouer:'simulation'};
  const groupeDePage = cle => Object.keys(GROUPES).find(g => GROUPES[g].includes(cle)) || 'collection';
  const originalRender = window.renderOnglets;
  window.renderOnglets = function(){
    if (typeof originalRender === 'function') originalRender();
    const groupe = groupeDePage(S.onglet);
    document.querySelectorAll('#onglets [data-onglet]').forEach(b=>{
      b.hidden = !GROUPES[groupe].includes(b.dataset.onglet);
    });
    document.querySelectorAll('#navigationPrincipale [data-nav-group]').forEach(b=>{
      if (b.dataset.navGroup === groupe) b.setAttribute('aria-current','page');
      else b.removeAttribute('aria-current');
    });
    const sousNav = document.getElementById('onglets');
    if (sousNav) sousNav.hidden = GROUPES[groupe].length < 2;
    if (typeof majHauteurEntete === 'function') majHauteurEntete();
  };
  window.activerGroupeNavigation = function(groupe){
    if (!GROUPES[groupe]) return;
    const pageCourante = S.onglet;
    const cible = GROUPES[groupe].includes(pageCourante) ? pageCourante : PREMIERE_PAGE[groupe];
    activerOnglet(cible);
  };
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>window.renderOnglets(),{once:true});
  else window.renderOnglets();
})();
