/* Icônes Lucide de la barre des onglets, en bas de la page : chaque onglet
   reçoit la sienne ici, que `createIcons()` remplace par un SVG. */
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
  // createIcons remplace les <i> par des SVG et ne crée pas de doublon.
  window.lucide.createIcons({attrs:{class:'onglet-icone','aria-hidden':'true',focusable:'false'}});
 }
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',mount,{once:true});else mount();
 window.addEventListener('load',mount,{once:true});
})();