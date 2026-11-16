/* Icônes Lucide des navigations principale et secondaire.
   Les icônes principales existent déjà dans index.html : on les réutilise
   au lieu d'en insérer une seconde. Les sous-onglets reçoivent leur icône ici. */
(() => {
 const icons={collection:'library',decks:'layers',deck:'panels-top-left',graphe:'network',edhrec:'lightbulb',catalogue:'database',simulation:'swords'};
 function mount(){
  if(!window.lucide||typeof window.lucide.createIcons!=='function')return;
  document.querySelectorAll('#onglets [data-onglet]').forEach(b=>{
   if(b.querySelector('i[data-lucide],svg[data-lucide],.onglet-icone'))return;
   const name=icons[b.dataset.onglet];if(!name)return;
   const i=document.createElement('i');
   i.className='onglet-icone';
   i.dataset.lucide=name;
   i.setAttribute('aria-hidden','true');
   b.insertBefore(i,b.firstChild);
  });
  // Les quatre icônes du menu principal sont déclarées dans le HTML.
  // createIcons remplace les <i> par des SVG et ne crée pas de doublon.
  window.lucide.createIcons({attrs:{class:'onglet-icone','aria-hidden':'true',focusable:'false'}});
 }
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',mount,{once:true});else mount();
 window.addEventListener('load',mount,{once:true});
})();