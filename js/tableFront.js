/* =====================================================================
   js/tableFront.js — La ligne de front et le bouton de tour

   Entre les adversaires et son propre champ court une ligne : l'étape à
   gauche, la pile au centre (en tunnel, js/tablePile.js), et à droite,
   sous le pouce, un bouton rond
   dont le libellé dit ce qui va se passer — « Combat », « Attaquer (2) »,
   « Laisser résoudre », « Fin du tour ». Une phrase dessous le précise.
   On décide là où la partie se joue, plus au pied de l'écran.

   Le bandeau des questions (js/tableQuestions.js), juste au-dessus de la ligne, ne garde que les questions qui
   ne tiennent pas dans un bouton : une cible à prendre dans une liste, X,
   les modes, oui ou non, le mulligan — et le mana qu'on engage à la main.
   ===================================================================== */

/* Le libellé de « passer », pile vide, pendant son propre tour : l'étape
   vers laquelle on part. Chez un adversaire, on le laisse continuer. */
const PASSER_VERS = {entretien: 'Passer', pioche: 'Passer', principale1: 'Combat', debutCombat: 'Attaquants', attaquants: 'Continuer',
  bloqueurs: 'Blessures', initiative: 'Blessures', degats: 'Continuer', finCombat: 'Principale 2', principale2: 'Fin du tour', fin: 'Fin du tour'};
const PHRASE_PASSER = {principale1: 'Passer : on va au combat.', principale2: 'Passer : votre tour se termine.', fin: 'Passer : votre tour se termine.',
  bloqueurs: 'Passer : les blessures de combat tombent.', initiative: 'Passer : les blessures de combat tombent.'};

/* Le verbe d'une action de priorité, assez court pour un bouton rond. */
function verbeAction(a) {
  return {terrain: 'Jouer', lancer: 'Lancer', mana: 'Engager', manaFiltre: 'Engager', equiper: 'Équiper', presager: 'Présager', comploter: 'Comploter',
    suspendre: 'Suspendre', retourner: 'Retourner'}[a.k] || 'Activer';
}

const cibleTexte = it => it.cibles && it.cibles.length ? ' → ' + it.cibles.join(', ') : '';

/* Ce que ferait le bouton de tour maintenant : son libellé, la phrase qui
   le précise, et s'il agit. Rien quand la question se règle dans le
   bandeau des questions. */
function actionTour(v) {
  const q = TABLE.question;
  if (!v || v.fin) return null;
  if (!q) {
    if (v.resout) {
      const it = v.pile.length ? v.pile[v.pile.length - 1] : null;
      const sous = it ? `${it.nom} se résout${cibleTexte(it)}.` : 'Résolution…';
      return TABLE.role === 'hote' && TABLE.suite ? {lib: 'Continuer', sous, act: true, pause: TABLE.pause} : {lib: 'Résolution', sous, attente: true};
    }
    const qui = v.attend != null && v.attend !== v.moi ? v.joueurs[v.attend].nom : '';
    return {lib: 'Attente', sous: qui ? `${qui} réfléchit…` : '', attente: true};
  }
  const s = selDe(q);
  if (q.q === 'priorite') {
    const l = leveValide(q);
    if (l) return {lib: verbeAction(q.options[l.i]), sous: q.options[l.i].label, act: true, fort: true};
    if (v.pile.length) {
      const it = v.pile[v.pile.length - 1];
      return it.ctrl === v.moi ? {lib: 'Résoudre', sous: `${it.nom} : les autres peuvent encore répondre.`, act: true}
        : {lib: 'Laisser résoudre', sous: `${it.nom} se résout${cibleTexte(it)}.`, act: true};
    }
    if (v.actif !== v.moi) return {lib: 'Passer', sous: `${v.joueurs[v.actif].nom} continue son tour.`, act: true};
    return {lib: PASSER_VERS[v.etape] || 'Passer', sous: PHRASE_PASSER[v.etape] || 'Passer : on va à l\'étape suivante.', act: true};
  }
  if (q.q === 'attaquants') {
    const n = s.paires.size;
    return {lib: n ? `Attaquer (${n})` : 'Pas d\'attaque', act: true, fort: n > 0,
      sous: n ? [...s.paires].map(([i, d]) => `${q.options[i].label} → ${q.defenseurs[d].label}`).join(' · ') : 'Touchez les créatures qui attaquent.'};
  }
  if (q.q === 'bloqueurs') {
    const n = s.paires.size;
    const menaces = menacesSeules(q, s);
    return {lib: n ? `Bloquer (${n})` : 'Pas de blocage', act: true, fort: n > 0, alerte: menaces.length > 0,
      sous: menaces.length ? `Menace : ${menaces.join(', ')} doit être bloqué par au moins deux créatures.`
        : 'Glissez une de vos créatures sur l\'attaquant qu\'elle bloque.'};
  }
  return null;
}

/* Le bouton de tour touché. */
function faitTour() {
  const q = TABLE.question, a = actionTour(TABLE.vue);
  if (!a || !a.act) return;
  sonTable('tic');
  if (!q) { if (TABLE.suite) TABLE.suite(); return; }
  if (q.q !== 'priorite') return valideTable();
  const l = leveValide(q);
  TABLE.leve = null;
  repondsTable(l ? l.i : q.options.length - 1);
}

/* Ce qu'aucune carte visible ne porte — un flashback depuis le cimetière,
   une carte en exil — se touche en puce, au-dessus du bouton. */
function actionsHorsTable(q, v) {
  const vus = new Set([...v.main, ...v.champ, ...v.joueurs.flatMap(J => J.cmd)].map(o => o.id));
  const deja = new Set();
  return q.options.map((a, i) => [a, i]).filter(([a]) => !/^(passer|mana|reglage)$/.test(a.k) &&
    !(vus.has(a.id) && (!a.depuis || a.depuis === 'commandement')) && !deja.has(a.label) && deja.add(a.label));
}

function pucesHTML(v) {
  const q = TABLE.question, puce = (act, lib, extra = '') => `<button type="button" class="tfr-puce" data-act="${act}"${extra}>${lib}</button>`;
  if (!q) return '';
  const s = selDe(q);
  if (q.q === 'attaquants') return puce('tAttTous', 'Toutes') + puce('tAttAucun', 'Aucune') + (q.defenseurs.length > 1
    ? q.defenseurs.map((d, i) => puce('tDef', 'vers ' + esc(d.label), ` data-i="${i}" aria-pressed="${s.def === i}"`)).join('') : '');
  if (q.q === 'bloqueurs') return [...s.paires].map(([b, a]) => puce('tRetirePaire', `${esc(q.options[b].label)} ⛨ ${esc(q.attaquants[a].label)} ✕`,
    ` data-i="${b}" title="Annuler ce blocage"`)).join('');
  if (q.q !== 'priorite') return '';
  if (leveValide(q)) return puce('tReposer', 'Reposer');
  return actionsHorsTable(q, v).slice(0, 3).map(([a, i]) => puce('tAction', esc(a.label), ` data-i="${i}"`)).join('') +
    puce('tPasserTour', 'Jusqu\'à mon tour', ' title="Ne plus rien demander jusqu\'au début de votre prochain tour"');
}

/* Le bouton rond. Pendant la pause d'une résolution, un anneau se remplit
   le temps qu'elle dure : le toucher la coupe. */
function boutonTourHTML(a) {
  const cls = ['tfr-bouton', a.fort ? 'fort' : '', a.attente ? 'attente' : '', a.pause ? 'pause' : ''].filter(Boolean).join(' ');
  const anneau = a.pause ? `<svg class="tfr-anneau" viewBox="0 0 100 100" aria-hidden="true"><circle cx="50" cy="50" r="46"
      style="animation-duration:${a.pause.duree}ms;animation-delay:${-(Date.now() - a.pause.debut)}ms"/></svg>`
    : a.attente ? '<span class="tfr-tourne" aria-hidden="true"></span>' : '';
  return `<button type="button" class="${cls}" data-act="tTour"${a.act ? '' : ' aria-disabled="true"'}>${anneau}<span>${esc(a.lib)}</span></button>`;
}

/* La ligne de front. Au centre, la place du tunnel de la pile : il n'est
   pas écrit ici, mais remis après chaque peinture (js/tablePile.js), pour
   que ses cartes glissent d'un cran à l'autre au lieu d'être recréées. */
function frontHTML(v) {
  const a = actionTour(v), err = TABLE.erreur && TABLE.question && /^(priorite|attaquants|bloqueurs)$/.test(TABLE.question.q) ? TABLE.erreur : '';
  const q = TABLE.question, autre = q && !a ? (q.q === 'cibles' ? 'Touchez une cible qui brille, ou choisissez dans le bandeau.' : 'Répondez dans le bandeau ci-dessus.') : '';
  const phrase = err || (a && a.sous) || autre, alerte = err || (a && a.alerte), pile = v.pile.length || v.resolvant;
  return `<div class="tfr${a && a.fort ? ' fort' : ''}${TABLE.question ? ' a-vous' : ''}${pile ? ' avec-pile' : ''}">
      <div class="tfr-gauche">${phasesPointsHTML(v)}</div>
      <div class="tfr-centre">${pile ? '<div class="tpi-place"></div>' : ''}</div>
      <div class="tfr-cmd"><div class="tfr-puces">${pucesHTML(v)}</div>${a ? boutonTourHTML(a) : ''}</div>
      <div class="tfr-phrase${alerte ? ' erreur' : ''}">${esc(phrase)}</div>
    </div>`;
}
