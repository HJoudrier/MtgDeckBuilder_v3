/* =====================================================================
   js/theme.js — Le thème clair et le thème sombre

   L'atelier était sombre, et lui seul. Le dessin d'origine est conservé
   entier, en option : un papier clair par défaut, le sombre pour qui le
   préfère — case « Mode sombre » de la fenêtre des paramètres. Tout tient dans
   l'attribut `data-theme` de la racine, que les deux palettes de
   `css/atelier.css` lisent ; aucun rendu n'est à refaire, le navigateur
   recalcule les couleurs lui-même.

   La préférence vit dans `S.sombre` comme le reste de l'état, mais s'écrit
   aussi dans une clé à elle : la page doit se peindre du bon côté avant que
   les modules ne soient chargés, et ouvrir la sauvegarde entière — des
   centaines de kilo-octets de cartes — pour une seule valeur coûterait ce
   qu'on cherche à éviter. Le petit script de `index.html` lit cette clé, et
   celle-ci seule.
   ===================================================================== */

const STORE_THEME = 'mtg-atelier-theme';

/* Ce que le système préfère, quand rien n'a jamais été choisi : un atelier
   ouvert sur une machine réglée en sombre s'ouvre en sombre. Le choix
   explicite, lui, l'emporte toujours — c'est pour cela qu'il est retenu. */
function themeDuSysteme() {
  return typeof matchMedia === 'function' && matchMedia('(prefers-color-scheme: dark)').matches;
}

/* Pose le thème sur la racine, et note la préférence dans sa clé. L'écriture
   peut échouer — navigation privée, stockage refusé — sans conséquence : le
   thème est posé, seule la peinture du prochain démarrage y perdrait. */
function appliqueTheme() {
  const sombre = !!S.sombre;
  if (typeof document !== 'undefined' && document.documentElement)
    document.documentElement.dataset.theme = sombre ? 'sombre' : 'clair';
  try { localStorage.setItem(STORE_THEME, sombre ? 'sombre' : 'clair'); } catch (e) {}
}

/* Au démarrage : la sauvegarde a pu porter le choix (`restore`), sinon on
   reprend la clé — c'est le cas quand la sauvegarde est désactivée —, sinon la
   préférence du système. `S.sombre` vaut `null` tant que rien n'a été choisi,
   ce qui se distingue d'un « non » explicite. */
function reprendTheme() {
  if (S.sombre === null || S.sombre === undefined) {
    let garde = null;
    try { garde = localStorage.getItem(STORE_THEME); } catch (e) {}
    S.sombre = garde ? garde === 'sombre' : themeDuSysteme();
  }
  appliqueTheme();
}

/* La case de la fenêtre des paramètres. Le thème agit au clic : c'est un
   réglage qu'on juge à l'œil, et le faire attendre « Appliquer » obligerait à
   fermer la fenêtre pour voir ce qu'on essaie. */
function basculeTheme(sombre) {
  S.sombre = !!sombre;
  appliqueTheme();
  scheduleSave();
}
