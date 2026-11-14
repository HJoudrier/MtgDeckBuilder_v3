/* =====================================================================
   js/tableQuestions.js — Répondre à une question du moteur, à la main

   Le bandeau du bas dit ce que le moteur demande, et propose les réponses
   en boutons — le geste qui marche partout, au doigt comme à la souris. Les
   cartes concernées sont aussi surlignées sur la table, et un toucher sur
   l'une d'elles vaut le bouton : on joue sa carte en la touchant. Une
   question à un seul choix part dès qu'on choisit ; les autres attendent
   « Valider ».
   ===================================================================== */

/* La sélection en cours, propre à la question affichée. */
function selDe(q) {
  if (!TABLE.sel || TABLE.sel.n !== q.n) TABLE.sel = {n: q.n, choix: new Set(), paires: new Map(), def: 0, courant: null, menu: null};
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

/* Le nom d'une carte visible, pour la montrer en grand. */
function nomVisible(id) {
  const v = TABLE.vue;
  if (!v) return null;
  const tout = [...v.champ, ...v.main, ...v.pile, ...v.joueurs.flatMap(J => [...J.cim, ...J.exil, ...J.cmd])];
  const o = tout.find(x => x.id === id);
  if (o) return o.nom;
  const q = TABLE.question;
  const opt = q && Array.isArray(q.options) && q.options.find(x => x && x.id === id);
  return opt ? opt.label : null;
}

function montreDetail(id) {
  const nom = nomVisible(id);
  if (!nom) return;
  TABLE.detail = nom;
  renduTable();
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

/* Un toucher sur une carte de la table. */
function clicCarte(id) {
  const q = TABLE.question;
  if (!q) return montreDetail(id);
  const s = selDe(q);
  if (q.q === 'priorite') {
    const acts = q.options.map((a, i) => [a, i]).filter(([a]) => a.id === id && a.k !== 'passer');
    if (!acts.length) return montreDetail(id);
    if (acts.length === 1) return repondsTable(acts[0][1]);
    s.menu = id;
    return renduTable();
  }
  if (q.q === 'attaquants' || q.q === 'bloqueurs') return clicCombat(q, s, id) ? renduTable() : montreDetail(id);
  const i = q.options.findIndex(o => o && o.id === id);
  if (i < 0) return montreDetail(id);
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

/* Les choix d'une question à cases. */
function chipsChoix(q, s) {
  return `<div class="tb-choix">${q.options.map((o, i) => `<button type="button" class="tb-carte${s.choix.has(i) ? ' choisi' : ' choix'}"
    data-act="tChoix" data-i="${i}"><span class="tb-nom">${esc(o && o.label != null ? o.label : String(o))}</span></button>`).join('')}</div>`;
}

const TITRES_Q = {cibles: 'Choisissez la cible', cartes: 'Choisissez', defausse: 'Défaussez', dessous: 'Mettez dessous',
  sacrifice: 'Sacrifiez', scrute: 'Mettez dessous ce que vous ne voulez pas piocher', modes: 'Choisissez les modes'};

/* Le bandeau de la question. */
function questionHTML(q, v) {
  if (!q) return v && v.fin ? '' : `<div class="small muted">${TABLE.attenteNom ? esc(TABLE.attenteNom) + ' réfléchit…' : ''}</div>`;
  const s = selDe(q), err = TABLE.erreur ? `<div class="small tb-erreur">${esc(TABLE.erreur)}</div>` : '';
  const valider = (lib = 'Valider') => `<button type="button" class="btn pri" data-act="tValider">${lib}</button>`;
  switch (q.q) {
    case 'priorite': {
      const liste = q.options.map((a, i) => [a, i]).filter(([a]) => a.k !== 'passer' && (!s.menu || a.id === s.menu));
      return `${err}<div class="small"><b>À vous</b> — ${esc(NOMS_ETAPES[v.etape] || v.etape)}${v.pile.length ? ', en réponse' : ''}</div>
        <div class="tb-actions">${liste.map(([a, i]) => `<button type="button" class="btn sm" data-act="tAction" data-i="${i}">${esc(a.label)}</button>`).join('')}</div>
        <div class="row"><button type="button" class="btn pri" data-act="tAction" data-i="${q.options.length - 1}">Passer</button>
          <button type="button" class="btn sm" data-act="tPasserTour" title="Ne plus rien demander jusqu'au début de votre prochain tour">Passer jusqu'à mon tour</button>
          ${s.menu ? '<button type="button" class="btn sm" data-act="tMenuFerme">Toutes les actions</button>' : ''}</div>`;
    }
    case 'attaquants': case 'bloqueurs': return err + combatHTML(q, s, v);
    case 'mulligan': return `${err}<div class="small"><b>Votre main de départ</b>${q.mulligans ? ` — après ${q.mulligans} mulligan(s)` : ''}</div>
      <div class="row"><button type="button" class="btn pri" data-act="tUn" data-i="0">Garder</button>
        <button type="button" class="btn" data-act="tUn" data-i="1">Mulligan</button></div>`;
    case 'oui': return `${err}<div class="small">${esc(q.texte || 'Le faire ?')}</div>
      <div class="row"><button type="button" class="btn" data-act="tUn" data-i="0">Non</button>
        <button type="button" class="btn pri" data-act="tUn" data-i="1">Oui</button></div>`;
    case 'x': return `${err}<div class="small"><b>Valeur de X</b></div><div class="tb-actions">${q.options.slice(0, 31).map((x, i) =>
      `<button type="button" class="btn sm" data-act="tUn" data-i="${i}">${esc(x)}</button>`).join('')}</div>`;
  }
  return `${err}<div class="small"><b>${esc(TITRES_Q[q.q] || q.texte || 'Choisissez')}</b> — ${bornes(q)}${q.texte && TITRES_Q[q.q] ? ' · ' + esc(q.texte) : ''}</div>
    ${chipsChoix(q, s)}
    <div class="row">${q.min === 1 && q.max === 1 ? '' : valider(s.choix.size ? 'Valider' : q.min === 0 ? 'Aucun' : 'Valider')}</div>`;
}
