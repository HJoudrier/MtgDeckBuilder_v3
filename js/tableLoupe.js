/* =====================================================================
   js/tableLoupe.js — Voir une carte en grand

   Sur un téléphone, une carte de la table est trop petite pour être lue.
   On la garde sous le doigt un instant, et elle s'ouvre en grand : visuel,
   texte, et ce que la partie lui a fait. La loupe dit aussi ce qu'on peut en
   faire maintenant — la jouer, la choisir — et le fait d'un toucher. Le clic
   droit l'ouvre à la souris.

   Le clic qui termine un appui long est avalé : on voulait voir la carte,
   pas la jouer. Les écouteurs sont dans js/app.js, ici les gestes.
   ===================================================================== */

/* L'identifiant de la carte du contexte d'une question : jamais celui d'un objet de la partie. */
const ID_CONTEXTE = -1;

const APPUI = {t: null, x: 0, y: 0, ouvert: 0};
const APPUI_MS = 380;

/* Un doigt se pose : s'il reste sur la carte, elle s'ouvre en grand. */
function appuiDebut(ev) {
  appuiAnnule();
  if (!TABLE.ouverte || (ev.pointerType === 'mouse' && ev.button !== 0)) return;
  const el = ev.target.closest && ev.target.closest('#table [data-loupe]');
  if (!el) return;
  const id = +el.dataset.loupe;
  APPUI.x = ev.clientX; APPUI.y = ev.clientY;
  APPUI.t = setTimeout(() => { APPUI.t = null; APPUI.ouvert = Date.now(); ouvreLoupe(id); }, APPUI_MS);
}

/* Le doigt glisse : c'est un défilement, pas un appui. */
function appuiBouge(ev) {
  if (APPUI.t && Math.hypot(ev.clientX - APPUI.x, ev.clientY - APPUI.y) > 10) appuiAnnule();
}

function appuiAnnule() { clearTimeout(APPUI.t); APPUI.t = null; }

/* Le doigt se lève après un appui long : le clic qui suit est avalé. */
function appuiFin() {
  appuiAnnule();
  if (APPUI.ouvert) APPUI.ouvert = Date.now();
}

function clicAvale() {
  const avale = APPUI.ouvert && Date.now() - APPUI.ouvert < 500;
  APPUI.ouvert = 0;
  return !!avale;
}

/* Le menu contextuel sur une carte : la loupe à sa place. Vrai s'il est
   retenu. Un clic droit n'est suivi d'aucun clic ; un appui long qui
   devance la minuterie, si : celui-là seul est à avaler. */
function loupeContextuelle(ev) {
  const el = TABLE.ouverte && ev.target.closest && ev.target.closest('#table [data-loupe]');
  if (!el) return false;
  if (TABLE.loupe == null) {
    if (APPUI.t) APPUI.ouvert = Date.now();
    appuiAnnule();
    ouvreLoupe(+el.dataset.loupe);
  }
  return true;
}

function ouvreLoupe(id) {
  if (!objetVisible(id)) return;
  TABLE.loupe = id;
  renduTable();
}

/* Un objet visible, où qu'il soit : champ, main, pile, zones publiques,
   options de la question. */
function objetVisible(id) {
  const v = TABLE.vue;
  if (!v) return null;
  const tout = [...v.champ, ...v.main, ...v.pile, ...v.joueurs.flatMap(J => [...J.cim, ...J.exil, ...J.cmd])];
  const o = tout.find(x => x.id === id);
  if (o) return o;
  const q = TABLE.question;
  const opt = q && Array.isArray(q.options) && q.options.find(x => x && x.id === id);
  if (opt) return {id, nom: opt.label};
  /* La carte dont parle la question — elle a pu quitter la table, la loupe la montre quand même. */
  return id === ID_CONTEXTE && q && q.contexte ? {id, nom: q.contexte.nom} : null;
}

/* Ce que la partie a fait à un permanent, en mots. */
function etatEnMots(o, v) {
  const m = [];
  if (o.ctrl != null && v.joueurs[o.ctrl]) m.push('à ' + v.joueurs[o.ctrl].nom);
  if (o.bless) m.push(`${o.bless} blessure${o.bless > 1 ? 's' : ''}`);
  Object.keys(o.marq || {}).forEach(k => { if (o.marq[k]) m.push(`${NOMS_MARQUEURS[k] || k} ×${o.marq[k]}`); });
  if (o.engage) m.push('engagée');
  if (o.malade) m.push("mal d'invocation");
  if (o.attaque) m.push('attaque ' + (o.attaque.j != null && v.joueurs[o.attaque.j] ? v.joueurs[o.attaque.j].nom : 'un planeswalker'));
  if (o.bloque != null) m.push('bloque');
  if (o.jeton) m.push('jeton');
  return m.join(' · ');
}

/* Les symboles d'un texte d'oracle, en pastilles. */
const texteOracleHTML = t => esc(t).replace(/ \/\/ /g, '<br>').replace(/\{([^}]+)\}/g, (_, s) => symIcon(s, 'sm'));

/* Ce qu'on peut faire de la carte maintenant, en boutons. */
function actionsLoupe(id) {
  const q = TABLE.question;
  if (!q) return '';
  if (q.q === 'priorite') return q.options.map((a, i) => [a, i]).filter(([a]) => a.id === id && a.k !== 'passer')
    .map(([a, i]) => `<button type="button" class="btn pri" data-act="tAction" data-i="${i}">${esc(a.label)}</button>`).join('');
  if (q.q === 'bloqueurs') return blocagesLoupe(q, id);
  const e = etatChoix(id);
  if (e === 'choix') return `<button type="button" class="btn pri" data-act="tCarte" data-id="${id}">Choisir</button>`;
  if (e === 'choisi') return `<button type="button" class="btn" data-act="tCarte" data-id="${id}">Retirer du choix</button>`;
  return '';
}

/* Une créature qui peut bloquer : un bouton par attaquant qu'elle peut
   bloquer, et de quoi défaire le blocage posé. */
function blocagesLoupe(q, id) {
  const bi = q.options.findIndex(o => o.id === id);
  if (bi < 0) return '';
  const ai = selDe(q).paires.get(bi);
  return q.options[bi].legaux.filter(a => a !== ai).map(a => `<button type="button" class="btn pri" data-act="tBloque" data-i="${bi}" data-a="${a}">Bloquer ${esc(q.attaquants[a].label)}</button>`).join('')
    + (ai != null ? `<button type="button" class="btn" data-act="tRetirePaire" data-i="${bi}">Annuler ce blocage</button>` : '');
}

function loupeHTML(v) {
  if (TABLE.loupe == null || !v) return '';
  const o = objetVisible(TABLE.loupe);
  if (!o) return '';
  const q = TABLE.question;
  const f = v.cartes[o.nom] || (q && q.cartes && q.cartes[o.nom]) || (q && q.contexte && q.contexte.nom === o.nom && q.contexte.fiche) || {};
  const pt = o.f != null && o.types && o.types.includes('creature') ? `${o.f}/${o.e - (o.bless || 0)}` : estNombre(f.f) ? `${f.f}/${f.e}` : '';
  const img = imageCarte(o.nom, 'normal');
  const etat = etatEnMots(o, v), actions = actionsLoupe(o.id);
  return `<div class="tl-voile" data-act="tFermeLoupe"></div>
    <div class="tl" role="dialog" aria-label="${esc(o.nom)}">
      <div class="tl-carte tc" data-teinte="${teinteCarte(f)}"><span class="tc-corps">
        <span class="tc-cadre"><span class="tc-nom">${esc(o.nom)}</span><span class="tc-type">${esc(f.type || '')}</span></span>
        ${img ? `<span class="tc-img" style="background-image:url('${esc(img)}')"></span>` : ''}</span></div>
      <div class="tl-info">
        <div class="tl-titre"><b>${esc(o.nom)}</b> ${String(f.cout || '').replace(/\{([^}]+)\}/g, (_, s) => symIcon(s, 'sm'))}</div>
        <div class="small muted">${esc(f.type || '')}${pt ? ' · <b class="tl-pt">' + pt + '</b>' : ''}${o.marq && o.marq.loyaute != null ? ' · loyauté ' + o.marq.loyaute : ''}</div>
        ${etat ? `<div class="small tl-etat">${esc(etat)}</div>` : ''}
        <div class="small tl-oracle">${texteOracleHTML(f.texte || '')}</div>
        ${f.couv && f.couv !== 'complete' ? `<div class="small muted">Le moteur la joue en partie : ${esc(f.couv)}</div>` : ''}
        ${actions ? `<div class="tl-actions">${actions}</div>` : ''}
      </div>
      <button type="button" class="btn sm tl-ferme" data-act="tFermeLoupe" aria-label="Fermer">✕</button>
    </div>`;
}
