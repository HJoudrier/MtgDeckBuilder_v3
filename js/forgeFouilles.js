/* =====================================================================
   js/forgeFouilles.js — Fouiller, chercher : ce que le moteur en dit

   Lot F91 :
   - `Dig | RememberRevealed$ True` (Dihada, Doors of Durin) : les cartes révélées
     se retiennent, là où elles sont allées ;
   - `Dig | DestZone2Optional$` (Nylea, Keen-Eyed : traité dans `fouilleForge()`),
     `ForceRevealToController$`, `PromptToSkipOptionalAbility$`,
     `OptionalAbilityPrompt$` : ce qu'on dit au joueur, non ce qui se joue ;
   - `DigMultiple | SourceZone$ Library`, `LibraryPosition$` (Kaalia, Ojer
     Kaslem) : la bibliothèque, qui est la zone où le moteur cherche ;
   - `SearchedLibrary` (Archivist of Oghma, Ob Nixilis Unshackled, Wan Shi
     Tong) : un joueur a cherché dans sa bibliothèque. Chaque recherche pose
     la question « Chercher » (`choisitCartes()`), qui dit le joueur ; la
     recherche d'une bibliothèque qui n'est pas la sienne n'existe pas ici.
   ===================================================================== */

forgeSait('param', 'Dig.RememberRevealed', 'Dig.DestZone2Optional', 'Dig.ForceRevealToController', 'Dig.PromptToSkipOptionalAbility',
  'Dig.OptionalAbilityPrompt', 'DigMultiple.LibraryPosition');

/* `SourceZone$` n'a de sens que pour la bibliothèque, seule zone que fouille `DigMultiple`. */
forgeSait('param', 'DigMultiple.SourceZone');

fouilleForge = (g => function* (P, t, env, j) {
  const B = P.joueurs[j].bibliotheque, n = forgeNombre(P, t.DigNum || 1, env);
  const vues = t.RememberRevealed === 'True' ? B.slice(-n) : [];
  yield* g(P, t, env, j);
  vues.forEach(id => { const nid = typeof suit === 'function' ? suit(P, id) : id; if (nid != null && obj(P, nid)) retiensForge(env.ctx, nid); });
})(fouilleForge);

choisitCartes = (g => function* (P, j, ids, n, texte, q, min) {
  if (texte === 'Chercher') emet(P, {t: 'cherche', joueur: j, siennes: true});
  return yield* g(P, j, ids, n, texte, q, min);
})(choisitCartes);

forgeMode('SearchedLibrary', ['ValidPlayer', 'SearchOwnLibrary'], (P, t, e, s, env) => e.t === 'cherche' && joueurOuRien(P, e.joueur, t.ValidPlayer, s, env) &&
  (t.SearchOwnLibrary !== 'True' || e.siennes));
