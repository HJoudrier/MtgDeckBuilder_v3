/* Icônes Lucide de la navigation principale. Sans le CDN, les libellés et
   la navigation natives restent fonctionnels. */
(() => {
 const icons={decks:'layers',collection:'library',deck:'panels-top-left',graphe:'network',edhrec:'lightbulb',catalogue:'database',simulation:'swords',suggestions:'lightbulb',jouer:'swords'};
 function mount(){
  if(!window.lucide||typeof window.lucide.createIcons!=='function')return;
  document.querySelectorAll('#onglets [data-onglet], #navigationPrincipale [data-nav-group]').forEach(b=>{
   const name=icons[b.dataset.onglet || b.dataset.navGroup];if(!name||b.querySelector('.onglet-icone'))return;
   const i=document.createElement('i');i.className='onglet-icone';i.dataset.lucide=name;i.setAttribute('aria-hidden','true');b.insertBefore(i,b.firstChild);
  });
  window.lucide.createIcons({attrs:{class:'onglet-icone','aria-hidden':'true',focusable:'false'}});
 }
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',mount,{once:true});else mount();
 window.addEventListener('load',mount,{once:true});
})();
