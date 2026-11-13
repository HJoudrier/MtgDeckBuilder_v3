/* =====================================================================
   js/forgeVue.js — Les cartes Forge sous les yeux

   Deux endroits : la section « Cartes Forge » de la fenêtre des
   paramètres — l'état du téléchargement, les gestes —, et le bloc « Ce
   qu'il manque au moteur » de l'onglet Simulation, la feuille de route de
   ce qu'il reste à écrire : les éléments de Forge que le moteur ne sait pas
   encore jouer, classés par le nombre de cartes de **vos** decks et
   adversaires qu'ils touchent, puis — sur demande, c'est plus long — par
   celui de toute la base.

   La progression se repeint sur place, sans `renderAll()` : elle change
   toutes les quatre secondes pendant douze minutes, et rien d'autre ne
   bouge.
   ===================================================================== */

let MANQUES = {cle: null, val: null, base: null, mesure: false};

const GENRES_FORGE = {api: 'effet', trig: 'déclencheur', stat: 'statique', repl: 'remplacement', kw: 'mot-clé',
  param: 'paramètre', cout: 'coût', expr: 'expression'};

/* Les scripts ont changé : ce qu'on en avait tiré est périmé. */
function forgeChange() {
  MANQUES.cle = null; MANQUES.base = null;
  if (typeof COUV_TABLE !== 'undefined') COUV_TABLE.cle = null;
  majForgeUI(true);
}

function etatForgeTexte() {
  const n = FORGE.textes.size.toLocaleString('fr-FR');
  const quand = FORGE.date ? new Date(FORGE.date).toLocaleDateString('fr-FR') : '';
  switch (FORGE.etat) {
    case 'liste': return 'Lecture de la liste des fichiers sur GitHub…';
    case 'telecharge': return `Téléchargement : ${FORGE.fait.toLocaleString('fr-FR')} / ${FORGE.total.toLocaleString('fr-FR')} fichiers — vos cartes d'abord.`;
    case 'erreur': return `Interrompu (${FORGE.erreur}). ${n} scripts sur l'appareil.`;
    case 'pause': return `${n} scripts sur l'appareil ; le reste viendra à la reprise.`;
    case 'ok': return `${n} scripts sur l'appareil, état de Forge du ${quand} (${FORGE.commit.slice(0, 7)}).`;
    default: return 'Aucun script sur l\'appareil.';
  }
}

/* La section de la fenêtre des paramètres. */
function corpsForge() {
  const enCours = FORGE.etat === 'liste' || FORGE.etat === 'telecharge';
  const pct = FORGE.total ? Math.round(FORGE.fait / FORGE.total * 100) : 0;
  return `<div id="blocForge">
    <div class="small" id="forgeEtat">${esc(etatForgeTexte())}</div>
    <div class="track" ${enCours ? '' : 'hidden'}><div class="fill" style="width:${pct}%;background:var(--brass)"></div></div>
    <div class="row" style="margin:6px 0">
      ${enCours ? '<button type="button" class="btn sm" data-act="forgeArret">Arrêter</button>'
        : `<button type="button" class="btn sm pri" data-act="forgeTelecharge">${FORGE.textes.size ? 'Vérifier les mises à jour' : 'Télécharger les scripts'}</button>`}
      ${FORGE.textes.size && !enCours ? '<button type="button" class="btn sm" data-act="forgeOublier">Effacer de l\'appareil</button>' : ''}
    </div>
    <label class="choix"><input type="checkbox" data-sim="forgeAuto" ${S.simulation.forgeAuto !== false ? 'checked' : ''}>
      Reprendre et tenir à jour au démarrage</label>
    <div class="small muted">Scripts : projet Forge (Card-Forge/forge sur GitHub), sous licence GPL-3.0. Environ
      trente-quatre mille fichiers, une quinzaine de mégaoctets, téléchargés sur cet appareil seulement — l'atelier n'en
      contient aucun. Ensuite, seuls les fichiers modifiés sont relus, une fois par semaine.</div>
  </div>`;
}

/* Repeindre sur place ce qui montre Forge. `change` : les scripts ont
   changé, le tableau des manques aussi. */
function majForgeUI(change) {
  const b = document.getElementById('blocForge');
  if (b) b.outerHTML = corpsForge();
  if (!change || S.onglet !== 'simulation') return;
  const m = document.getElementById('simManques');
  if (!m) return;
  const a = releveAncre();
  m.innerHTML = manquesHTML();
  restaureAncre(a);
}

/* Les noms de vos decks et adversaires, chacun avec le nombre de listes où
   il figure : un élément qui manque à trois decks pèse trois fois. */
function poidsPrioritaires() {
  const p = new Map();
  const ajoute = noms => new Set(noms).forEach(n => p.set(n, (p.get(n) || 0) + 1));
  Object.values(S.decks).forEach(d => ajoute([...d.deck.keys(), d.commander].filter(Boolean)));
  Object.values(S.adversaires).forEach(a => ajoute([...a.liste.map(([n]) => n), ...a.commandants]));
  return p;
}

/* Ce qui manque pour vos cartes, recalculé quand un deck, un adversaire,
   les scripts ou le savoir du moteur ont changé. */
function manquesDecks() {
  const sait = Object.values(FORGE_SAIT).reduce((s, x) => s + x.size, 0);
  const cle = [FORGE.textes.size, FORGE.commit, sait, ...Object.keys(S.decks).map(signatureDeck),
    ...Object.values(S.adversaires).map(signatureAdversaire)].join('|');
  if (MANQUES.cle === cle) return MANQUES.val;
  const scripts = [], sans = [];
  let completes = 0;
  poidsPrioritaires().forEach((poids, nom) => {
    const txt = scriptForgeDe(nom);
    if (!txt) { sans.push(nom); return; }
    const script = lisScriptForge(txt);
    if (!script.faces.length) { sans.push(nom); return; }
    if (couvertureForge(script).etat === 'complete') completes++;
    scripts.push({nom, script, poids});
  });
  MANQUES.cle = cle;
  MANQUES.val = {n: scripts.length + sans.length, avec: scripts.length, completes, sans, manques: manquesForge(scripts)};
  return MANQUES.val;
}

/* Toute la base, par tranches : trente-quatre mille scripts prennent deux
   ou trois secondes, qu'on rend au navigateur toutes les mille cartes. */
async function mesureBaseForge() {
  if (MANQUES.mesure) return;
  MANQUES.mesure = true;
  majForgeUI(true);
  const scripts = [], chemins = [...FORGE.textes.keys()].filter(ch => !ch.startsWith('jetons/'));
  let completes = 0;
  for (let i = 0; i < chemins.length; i++) {
    const s = lisScriptForge(FORGE.textes.get(chemins[i]));
    if (s.faces.length) {
      if (couvertureForge(s).etat === 'complete') completes++;
      scripts.push({nom: s.faces[0].nom, script: s, poids: 1});
    }
    if (i % 1000 === 999) await attendre(0);
  }
  MANQUES.base = {n: scripts.length, completes, manques: manquesForge(scripts)};
  MANQUES.mesure = false;
  majForgeUI(true);
}

function libelleElement(e) {
  const i = e.indexOf(':');
  return `<span class="mono">${esc(e.slice(i + 1))}</span> <span class="small muted">${esc(GENRES_FORGE[e.slice(0, i)] || '')}</span>`;
}

function listeManques(manques, unite) {
  return `<div class="sim-liste">${manques.slice(0, 30).map(m => `<div class="sim-ligne">
      ${libelleElement(m.element)}
      <span class="small muted">${m.cartes} ${unite}${m.cartes > 1 ? 's' : ''} — ${esc(m.exemples.join(', '))}</span>
    </div>`).join('')}</div>`;
}

/* Le bloc « Ce qu'il manque au moteur » de l'onglet Simulation. */
function manquesHTML() {
  if (!FORGE.textes.size) {
    return `<div class="sim-bloc"><h3>Ce qu'il manque au moteur</h3>
      <div class="small muted">Les scripts de cartes du projet Forge disent exactement ce que chaque carte fait. Une fois
        téléchargés sur cet appareil, ce bloc classe ce que le moteur ne sait pas encore jouer, vos decks d'abord.</div>
      <div class="row" style="margin-top:6px">${FORGE.etat === 'liste' || FORGE.etat === 'telecharge'
        ? `<span class="small">${esc(etatForgeTexte())}</span>`
        : '<button type="button" class="btn sm pri" data-act="forgeTelecharge">Télécharger les scripts de Forge</button>'}</div></div>`;
  }
  const d = manquesDecks(), b = MANQUES.base;
  return `<div class="sim-bloc"><h3>Ce qu'il manque au moteur</h3>
    <div class="small muted" style="margin-bottom:6px">${d.avec} des ${d.n} cartes de vos decks et adversaires ont un script
      Forge${d.sans.length ? ` (sans script : ${esc(d.sans.slice(0, 6).join(', '))}${d.sans.length > 6 ? '…' : ''})` : ''} ;
      ${d.completes} sont entièrement comprises. Ce qui manque, par nombre de vos cartes touchées :</div>
    ${d.manques.length ? listeManques(d.manques, 'carte') : '<div class="small">Rien : toutes vos cartes à script sont comprises.</div>'}
    <div class="small" style="margin-top:8px"><b>Dans toute la base de Forge</b></div>
    ${b ? `<div class="small muted" style="margin:4px 0">${b.completes.toLocaleString('fr-FR')} cartes sur
        ${b.n.toLocaleString('fr-FR')} entièrement comprises.</div>${listeManques(b.manques, 'carte')}`
      : MANQUES.mesure ? '<div class="small">Mesure en cours…</div>'
      : '<button type="button" class="btn sm" data-act="forgeMesure">Mesurer toutes les cartes</button>'}
    ${FORGE.etat === 'telecharge' ? `<div class="small muted">${esc(etatForgeTexte())}</div>` : ''}
  </div>`;
}

function gestesForge(act) {
  switch (act) {
    case 'forgeTelecharge': telechargeForge(true); return true;
    case 'forgeArret': FORGE.arret = true; return true;
    case 'forgeOublier': oublieForge(); return true;
    case 'forgeMesure': mesureBaseForge(); return true;
  }
  return false;
}
