/* =====================================================================
   js/tablePhases.js — Où en est le tour, et qui a la main

   Le tour découpé en ses phases, de l'entretien à la fin, dans une barre
   qui allume celle en cours et l'écrit en entier : « Déclaration des
   attaquants », « Attribution des blessures ». Le moteur a plus d'étapes
   que la barre n'a de cases — le dégagement tient dans l'entretien, le
   début du combat dans la déclaration des attaquants — mais le nom écrit
   est toujours celui de l'étape exacte.

   Et la priorité : le joueur que la partie attend, désigné dans la barre
   du haut et sur son cartouche.
   ===================================================================== */

/* Les cases de la barre : un nom court, et le nom complet de chaque étape
   qu'elle couvre. */
const PHASES_TOUR = [
  {k: 'entretien', court: 'Entretien', etapes: {degagement: 'Dégagement', entretien: 'Entretien'}},
  {k: 'pioche', court: 'Pioche', etapes: {pioche: 'Pioche'}},
  {k: 'principale1', court: 'Principale', etapes: {principale1: 'Phase principale'}},
  {k: 'attaquants', court: 'Attaquants', etapes: {debutCombat: 'Début du combat', attaquants: 'Déclaration des attaquants'}},
  {k: 'bloqueurs', court: 'Bloqueurs', etapes: {bloqueurs: 'Déclaration des bloqueurs'}},
  {k: 'blessures', court: 'Blessures', etapes: {initiative: 'Blessures de l\'initiative', degats: 'Attribution des blessures', finCombat: 'Fin du combat'}},
  {k: 'principale2', court: 'Principale 2', etapes: {principale2: 'Seconde phase principale'}},
  {k: 'fin', court: 'Fin', etapes: {fin: 'Étape de fin', nettoyage: 'Nettoyage'}}
];

/* L'étape du moteur → la case de la barre. Le dégagement et le nettoyage,
   où personne ne reçoit la priorité, ne retiennent pas la table. */
const PHASE_DE = {};
PHASES_TOUR.forEach(p => Object.keys(p.etapes).forEach(e => { if (e !== 'degagement' && e !== 'nettoyage') PHASE_DE[e] = p.k; }));

function phasesHTML(v) {
  const k = PHASES_TOUR.findIndex(p => p.etapes[v.etape]);
  return `<ol class="tph" aria-label="Phases du tour">${PHASES_TOUR.map((p, i) => `<li class="${i < k ? 'passee' : i === k ? 'en-cours' : ''}"${
    i === k ? ' aria-current="step"' : ''}>${esc(i === k ? p.etapes[v.etape] : p.court)}</li>`).join('')}</ol>`;
}

/* La ligne du haut : le tour, le joueur actif, et qui a la priorité. */
function etapeHTML(v) {
  const actif = v.joueurs[v.actif], nom = j => j === v.moi ? 'vous' : esc(v.joueurs[j].nom);
  const sommet = v.pile.length ? v.pile[v.pile.length - 1].nom : '';
  const prio = v.resout ? `<span class="tr-prio">résolution${sommet ? ' : ' + esc(sommet) : '…'}</span>`
    : v.resolvant ? `<span class="tr-prio">résolution : ${esc(v.resolvant.nom)}</span>` : v.prio != null ? `<span class="tr-prio${v.prio === v.moi ? ' moi' : ''}">priorité : ${nom(v.prio)}</span>`
    : v.attend != null && v.attend !== v.moi ? `<span class="tr-prio">${esc(v.joueurs[v.attend].nom)} décide</span>` : '';
  return `<span class="tr-tour">Tour ${v.tour}</span> <span class="tr-actif">${actif.i === v.moi ? 'votre tour' : esc(actif.nom)}</span> ${prio}`;
}
