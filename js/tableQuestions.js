/* =====================================================================
   js/tableQuestions.js — Répondre à une question du moteur, à la main

   La priorité et le combat se règlent sur la ligne de front, au bouton de
   tour (js/tableFront.js). Le bandeau du bas garde ce qui ne tient pas dans
   un bouton — une cible à prendre dans une liste, X, les modes, oui ou non,
   le mulligan, le mana qu'on engage à la main — et propose ses réponses en
   boutons. Les cartes concernées sont aussi surlignées sur la table, et un
   toucher sur l'une d'elles vaut le bouton. Une question à un seul choix
   part dès qu'on choisit ; les autres attendent « Valider ».
   ===================================================================== */

/* La sélection en cours, propre à la question affichée. */
function selDe(q) {
  if (!TABLE.sel || TABLE.sel.n !== q.n) TABLE.sel = {n: q.n, choix: new Set(), paires: new Map(), def: 0, courant: null};
  return TABLE.sel;
}

/* L'état d'une carte vis-à-vis de la question : choisissable, choisie, ou
   rien. */
function etatChoix(id) {
  const q = TABLE.question;
  if (!q) return '';
  const s = selDe(q);
  if (q.q === 'priorite') return q.options.some(a => a.id === id && a.k !== 'passer') ? 'choix' : '';
  if (q.q === 'attaquants' || q.q === 'bloqueurs') return etatCombatTable(q, s, id);
  const i = q.options.findIndex(o => o && o.id === id);
  return i < 0 ? '' : s.choix.has(i) ? 'choisi' : 'choix';
}

function etatJoueur(j) {
  const q = TABLE.question;
  if (!q || q.q !== 'cibles') return '';
  const i = q.options.findIndex(o => o && o.j === j);
  return i < 0 ? '' : selDe(q).choix.has(i) ? 'choisi' : 'choix';
}

/* Envoyer une réponse : au moteur sur l'hôte, à l'hôte depuis un invité. */
function repondsTable(r) {
  const q = TABLE.question;
  if (!q) return;
  if (TABLE.role === 'hote') recoitReponse(TABLE.moi, q.n, r);
  else if (typeof envoieReponse === 'function') { envoieReponse(q.n, r); TABLE.question = null; TABLE.erreur = ''; renduTable(); }
}

function basculeChoix(q, s, i) {
  if (s.choix.has(i)) s.choix.delete(i);
  else {
    if (s.choix.size >= q.max && q.max !== 1) return renduTable();
    if (q.max === 1) s.choix.clear();
    s.choix.add(i);
  }
  if (q.min === 1 && q.max === 1 && s.choix.size === 1) return repondsTable([...s.choix]);
  renduTable();
}

/* Un toucher sur une carte de la table : la lever s'il n'y a qu'une façon
   de la jouer (js/tableLever.js), la choisir si la question l'attend ;
   sinon la voir en grand, avec ce qu'on peut en faire. */
function clicCarte(id) {
  const q = TABLE.question;
  if (!q) return ouvreLoupe(id);
  const s = selDe(q);
  if (q.q === 'priorite') return toucheCarteJouable(q, id) || ouvreLoupe(id);
  if (q.q === 'attaquants' || q.q === 'bloqueurs') return clicCombat(q, s, id) ? renduTable() : ouvreLoupe(id);
  const i = q.options.findIndex(o => o && o.id === id);
  if (i < 0) return ouvreLoupe(id);
  basculeChoix(q, s, i);
}

function clicJoueur(j) {
  const q = TABLE.question;
  if (!q || q.q !== 'cibles') return;
  const i = q.options.findIndex(o => o && o.j === j);
  if (i >= 0) basculeChoix(q, selDe(q), i);
}

/* « Valider » : la sélection en cours, sous la forme que le moteur attend. */
function valideTable() {
  const q = TABLE.question;
  if (!q) return;
  const s = selDe(q);
  if (q.q === 'attaquants' || q.q === 'bloqueurs') return repondsTable([...s.paires]);
  repondsTable([...s.choix]);
}

const bornes = q => q.min === q.max ? `${q.min}` : q.max >= 99 ? `au moins ${q.min}` : `${q.min} à ${q.max}`;

/* Les choix d'une question à cases : une carte se montre par son visuel,
   un joueur ou un mot par un bouton. */
function chipsChoix(q, s, v) {
  return rangee('choix', q.options.map((o, i) => {
    const etat = s.choix.has(i) ? 'choisi' : 'choix';
    if (o && o.id != null) return tuile({id: o.id, nom: o.label}, v, {act: 'tChoix', i, etat, fiches: q.cartes});
    return `<button type="button" class="tq-mot ${etat}" data-act="tChoix" data-i="${i}">${esc(o && o.label != null ? o.label : String(o))}</button>`;
  }).join(''), 'tq-choix');
}

const TITRES_Q = {cibles: 'Choisissez la cible', cartes: 'Choisissez', defausse: 'Défaussez', dessous: 'Mettez dessous',
  sacrifice: 'Sacrifiez', scrute: 'Mettez dessous ce que vous ne voulez pas piocher', modes: 'Choisissez les modes'};

/* À quoi se rapporte une question posée en pleine résolution : la carte ou la capacité, et ce qu'elle
   dit. « Le faire ? » sans cela ne dit pas quoi. */
function contexteQuestionHTML(q, v) {
  if (!v || !v.resolvant || /^(priorite|mulligan|attaquants|bloqueurs)$/.test(q.q)) return '';
  const r = v.resolvant, qui = r.ctrl === v.moi ? 'la vôtre' : esc(v.joueurs[r.ctrl].nom);
  return `<div class="tq-ctx small"><span class="muted">Pendant la résolution de</span> <b>${esc(r.nom)}</b>
    <span class="muted">(${esc(r.genreLibelle.toLowerCase())}, ${qui})</span>${r.texte ? ` — <span class="tq-ctx-texte">${esc(r.texte)}</span>` : ''}</div>`;
}

/* Une question « oui / non » trop vague (« Le faire ? ») se précise par la carte dont il s'agit. */
const QUESTIONS_VAGUES = /^(Le faire|Défausser|Faire ceci) \?$/;
function titreOui(q) {
  const t = q.texte || 'Le faire ?';
  return QUESTIONS_VAGUES.test(t) && q.sourceNom ? `${esc(q.sourceNom)} — ${esc(t)}` : esc(t);
}

/* Le bandeau de la question. */
function questionHTML(q, v) {
  const ctx = q ? contexteQuestionHTML(q, v) : '';
  return ctx + questionCorpsHTML(q, v);
}

/* L'attente, la résolution, la priorité et le combat n'ont plus de bandeau :
   le bouton de tour les porte. La priorité n'en garde un que pour le mana
   qu'on engage à la main. */
function questionCorpsHTML(q, v) {
  if (!q) return '';
  const s = selDe(q), err = TABLE.erreur ? `<div class="small tq-erreur">${esc(TABLE.erreur)}</div>` : '';
  const valider = (lib = 'Valider') => `<button type="button" class="btn pri" data-act="tValider">${lib}</button>`;
  switch (q.q) {
    case 'priorite': {
      /* Le mana qu'on engage à la main, et le réglage du paiement : le reste est sur la ligne de front. */
      const vus = new Set();
      const mana = q.options.map((a, i) => [a, i]).filter(([a]) => a.k === 'mana' && !vus.has(a.label) && vus.add(a.label));
      const reglage = q.options.map((a, i) => [a, i]).find(([a]) => a.k === 'reglage');
      if (!mana.length) return '';
      return `<div class="tq-titre"><b>Votre mana</b> <span class="muted">· engagez-le, puis lancez</span></div>
        <div class="tq-actions tq-mana" data-defile="mana">${mana.map(([a, i]) =>
          `<button type="button" class="btn sm" data-act="tAction" data-i="${i}">${String(a.option).split('').map(l => symIcon(l, 'sm')).join('')} ${esc(a.label)}</button>`).join('')}
          ${reglage ? `<button type="button" class="btn sm" data-act="tAction" data-i="${reglage[1]}" title="Le réglage est aussi au menu de la table">${esc(reglage[0].label)}</button>` : ''}</div>`;
    }
    case 'attaquants': case 'bloqueurs': return '';
    case 'mulligan': return `${err}<div class="tq-titre"><b>Votre main de départ</b>${q.mulligans ? ` — après ${q.mulligans} mulligan(s)` : ''}</div>
      <div class="row"><button type="button" class="btn pri" data-act="tUn" data-i="0">Garder</button>
        <button type="button" class="btn" data-act="tUn" data-i="1">Mulligan</button></div>`;
    case 'oui': return `${err}<div class="tq-titre">${titreOui(q)}</div>
      <div class="row"><button type="button" class="btn" data-act="tUn" data-i="0">Non</button>
        <button type="button" class="btn pri" data-act="tUn" data-i="1">Oui</button></div>`;
    case 'x': return `${err}<div class="tq-titre"><b>Valeur de X</b></div><div class="tq-actions">${q.options.slice(0, 31).map((x, i) =>
      `<button type="button" class="btn sm" data-act="tUn" data-i="${i}">${esc(x)}</button>`).join('')}</div>`;
  }
  /* Un choix unique parmi des mots (quel mana ajouter ?) se titre de sa question. */
  const parTexte = q.q === 'modes' && q.max === 1 && !!q.texte;
  return `${err}<div class="tq-titre"><b>${esc(parTexte ? q.texte : TITRES_Q[q.q] || q.texte || 'Choisissez')}</b>${parTexte ? '' : ' — ' + bornes(q)}${!parTexte && q.texte && TITRES_Q[q.q] ? ' · ' + esc(q.texte) : ''}</div>
    ${chipsChoix(q, s, v)}
    <div class="row">${q.min === 1 && q.max === 1 ? '' : valider(s.choix.size ? 'Valider' : q.min === 0 ? 'Aucun' : 'Valider')}</div>`;
}
