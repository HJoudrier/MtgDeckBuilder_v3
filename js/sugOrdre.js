/* =====================================================================
   js/sugOrdre.js — L'ordre gelé des propositions
   ===================================================================== */

/* ---------------------------------------------------------------------
   L'ordre gelé.

   Ajouter une carte depuis une vignette change le deck, donc les scores :
   la sélection est renotée, à raison. Mais le classement qui en sort n'est
   pas celui qu'on avait sous les yeux, et la section repeinte remettait le
   lecteur au début — perdant la place de celui qui parcourait le milieu
   d'une liste de trois cents cartes.

   Le geste gèle donc l'ordre affiché : les scores se recalculent et les
   vignettes se rafraîchissent, chacune restant à sa case. Les nouvelles
   venues se rangent à la suite. Quand le classement par score a changé, un
   bandeau propose de reclasser ; sinon, le premier rendu complet venu — un
   filtre, une couleur, un format — reprend l'ordre des scores.

   Il fallait autrefois un second drapeau pour demander un rafraîchissement
   « en place », la section entière étant réécrite d'un bloc. Les trois
   sections des propositions gardent désormais leur enveloppe et ne réécrivent
   que leurs listes (`poseCorps`) : le rafraîchissement est en place par
   construction, et le gel de l'ordre suffit.
   --------------------------------------------------------------------- */

let SUG_ORDRE = null;      // noms dans l'ordre affiché, ou null si l'on suit les scores

/* Gèle l'ordre tel qu'il est affiché — c'est-à-dire la dernière sélection
   rendue, jamais une notation en cours : `SUG_MEMO.liste` porte exactement ce
   que la section montre, et le lire ne recalcule rien. Sans elle, il n'y a
   rien à geler et l'ordre des scores continue de valoir. */
function geleSuggestions() {
  /* Une sélection vide ne gèle rien : retenir un ordre vide reviendrait à
     poser un gel qui ne retient personne, et — le tableau vide étant vrai —
     à interdire tout gel ultérieur. */
  if (!ordreGele() && SUG_MEMO.liste && SUG_MEMO.liste.length)
    SUG_ORDRE = SUG_MEMO.liste.map(s => s.card.name);
}

function ordreGele() {
  return !!(SUG_ORDRE && SUG_ORDRE.length);
}

function degeleSuggestions() {
  SUG_ORDRE = null;
}

/* La sélection dans l'ordre où elle s'affiche : celui des scores, ou celui
   qui a été gelé — rang connu d'abord, nouvelles venues à la suite. */
function suggestionsAffichees() {
  const liste = currentSuggestions();
  if (!ordreGele()) return liste;
  const rang = new Map();
  SUG_ORDRE.forEach((nom, i) => rang.set(nom, i));
  const connues = [], nouvelles = [];
  liste.forEach(s => (rang.has(s.card.name) ? connues : nouvelles).push(s));
  connues.sort((a, b) => rang.get(a.card.name) - rang.get(b.card.name));
  return connues.concat(nouvelles);
}

/* L'ordre affiché diffère-t-il de celui des scores ? C'est ce qui décide du
   bandeau : sans différence, rien à proposer. */
function classementDecale() {
  if (!ordreGele()) return false;
  const parScore = currentSuggestions(), affiche = suggestionsAffichees();
  if (parScore.length !== affiche.length) return true;
  for (let i = 0; i < parScore.length; i++)
    if (parScore[i].card.name !== affiche[i].card.name) return true;
  return false;
}

function bandeauReclassement() {
  if (!classementDecale()) return '';
  return `<div class="small muted" style="display:flex;align-items:center;gap:8px;flex-wrap:wrap;margin-bottom:8px">
    Les scores ont changé ; les vignettes gardent leur place pour ne pas vous faire perdre le fil.
    <button class="btn sm" data-act="reclasser" title="Reclasser les suggestions par score">Reclasser</button>
  </div>`;
}
