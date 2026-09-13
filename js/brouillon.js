/* =====================================================================
   js/brouillon.js — Le brouillon des fenêtres à « Appliquer »

   Certaines fenêtres ne doivent rien changer avant qu'on le demande : filtrer
   coûte près d'une seconde sur un grand catalogue, et « Annuler » n'aurait
   aucun sens si la moitié des réglages avait déjà pris. Les champs de `S` que
   la fenêtre règle sont donc mis de côté, lus et écrits à sa place, puis rendus
   d'un coup par « Appliquer » — ou jetés par tout autre départ.

   Le brouillon ne vit que le temps de la fenêtre ; hors d'elle — barre de mana
   de l'en-tête, puces de filtre, jauges de rôle — tout continue d'agir au clic.
   La fenêtre étant modale, l'arrière-plan est inerte : un brouillon ouvert
   signifie forcément que le geste vient d'elle.
   ===================================================================== */

/* Le brouillon en cours : les champs de `S` que la fenêtre ouverte règle,
   mis de côté et rendus à `S` le temps d'une lecture ou d'une écriture. Les
   deux fenêtres s'en servent — Filtres règle `filtres`, `colors` et
   `colorMode` ; Format règle `format`, `custom` et `filtreLegal` — et il n'y
   en a jamais qu'un, puisque `openDialog()` n'ouvre qu'une fenêtre. */
let brouillon = null;

function ouvreBrouillon(cles, redessine) {
  brouillon = {cles, redessine, val:{}};
  cles.forEach(k => brouillon.val[k] = copieEtat(S[k]));
}

/* Copie profonde d'un champ de `S` : le `Set` des couleurs comme le
   `S.custom` imbriqué doivent être détachés, sans quoi le brouillon
   modifierait l'état appliqué. */
function copieEtat(v) {
  if (v instanceof Set) return new Set(v);
  if (v && typeof v === 'object') return JSON.parse(JSON.stringify(v));
  return v;
}

/* L'état appliqué, mis de côté le temps d'un échange : `brouillonModifie()`
   en a besoin pour comparer, alors même que `S` porte le brouillon. */
let etatApplique = null;

/* Met le brouillon à la place de l'état appliqué, et rend de quoi revenir. */
function echangeBrouillon() {
  const memo = {};
  brouillon.cles.forEach(k => { memo[k] = S[k]; S[k] = brouillon.val[k]; });
  if (!etatApplique) etatApplique = memo;
  return memo;
}

/* Repose l'état appliqué. `garder` reverse au brouillon ce qui vient d'être
   modifié — y compris quand un champ a été réassigné plutôt que muté. */
function reprendEtat(memo, garder) {
  brouillon.cles.forEach(k => {
    if (garder) brouillon.val[k] = S[k];
    S[k] = memo[k];
  });
  if (etatApplique === memo) etatApplique = null;
}

/* Lit comme si le brouillon était appliqué : c'est ainsi que la fenêtre se
   peint et que son décompte annonce ce que « Appliquer » donnerait. */
function avecBrouillon(fn) {
  if (!brouillon) return fn();
  const memo = echangeBrouillon();
  try { return fn(); } finally { reprendEtat(memo, false); }
}

/* Le jumeau écrivain : ce que `fn` modifie reste dans le brouillon. Sans
   brouillon — donc hors de la fenêtre — `fn` agit sur l'état lui-même. */
function modifieBrouillon(fn) {
  if (!brouillon) return fn();
  const memo = echangeBrouillon();
  try { return fn(); } finally { reprendEtat(memo, true); }
}

/* Le brouillon diffère-t-il de ce qui est appliqué ? */
function brouillonModifie() {
  if (!brouillon) return false;
  const a = etatApplique || S;   // l'état appliqué, même au milieu d'un échange
  return brouillon.cles.some(k => !memeEtat(brouillon.val[k], a[k]));
}

function memeEtat(x, y) {
  if (x instanceof Set || y instanceof Set) {
    if (!(x instanceof Set) || !(y instanceof Set) || x.size !== y.size) return false;
    return [...x].every(v => y.has(v));
  }
  if (x && y && typeof x === 'object') return JSON.stringify(x) === JSON.stringify(y);
  return x === y;
}

/* Ce qui suit un réglage : dans une fenêtre à brouillon, seule elle se
   redessine et rien n'est encore appliqué ; ailleurs — barre de mana de
   l'en-tête, puces, jauges de rôle — l'atelier suit aussitôt. */
/* La pagination de la collection n'est pas remise à sa première page : elle
   suit ce qu'on a demandé à voir. La replier faisait croire à un filtre resté
   en place — une collection dépliée à huit cents cartes en rendait deux cents
   après qu'un filtre eut été posé puis retiré. Seul un import, qui change la
   collection elle-même, la ramène à sa première page. */
function apresReglage(raison) {
  if (brouillon) { brouillon.redessine(); return; }
  /* Changer un filtre, un format, une couleur, c'est demander une autre
     liste : l'ordre gelé par les ajouts n'a plus lieu d'être. */
  if (typeof degeleSuggestions === 'function') degeleSuggestions();
  invaliderCandidats();
  /* Hors d'une fenêtre, un filtre change tout l'atelier : les candidates sont
     à rebâtir et à noter. C'est le recalcul annoncé, avec la raison du geste. */
  recalculerAvecProgression(raison || 'Un filtre a changé : les cartes retenues et les suggestions sont recalculées.');
  majFenetreFiltres();
}

/* Un rendu global n'a de sens que si l'état appliqué a changé. Tant qu'une
   fenêtre tient un brouillon, l'atelier montre déjà ce qu'il doit montrer :
   le recalcul serait perdu, et c'est la seconde qu'on cherche à éviter. */
function renderAllSiApplique() {
  if (brouillon) { majResumeFiltres(); return; }
  renderAll();
}

/* Les critères s'appliquent en direct pendant la saisie : c'est ce qui fait
   vivre le décompte de cartes retenues. « Annuler » ne renonce donc pas à
   appliquer, il revient à l'état d'avant l'ouverture — d'où cet instantané.
   Il couvre tout ce que la fenêtre sait changer, couleurs comprises. */
/* Verse le brouillon dans l'état : le seul moment où une fenêtre à brouillon
   touche à ce que l'atelier montre. */
function verseBrouillon() {
  if (!brouillon) return;
  brouillon.cles.forEach(k => { S[k] = brouillon.val[k]; });
  brouillon = null;
  invaliderCandidats();
}

/* Toute autre façon de fermer — Annuler, la croix, Échap, l'arrière-plan —
   jette le brouillon. Rien n'ayant été appliqué, il n'y a rien à défaire :
   l'atelier n'a pas bougé depuis l'ouverture. */
function fermetureBrouillon() {
  brouillon = null;
}

