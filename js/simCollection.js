/* =====================================================================
   js/simCollection.js — Ce que le moteur comprend de la collection

   La couverture d'un deck dit si l'on peut le tester ; celle de la
   collection dit ce que le moteur saura jouer **si l'on s'en sert** : la part
   des cartes qu'il comprend entièrement, et les listes de celles qu'il ne
   comprend qu'à moitié ou qu'il refuse de lancer (« injouables »).

   On compte des cartes différentes, non des exemplaires : douze exemplaires
   d'un même terrain de base ne disent rien du moteur. Les terrains sont
   écartés, comme dans la couverture d'un deck — presque toujours compris,
   ils dilueraient ce qui ne l'est pas.

   Compiler toute une collection coûte de l'ordre de la seconde pour quelques
   milliers de cartes : le calcul se fait par tranches, la main rendue au
   navigateur entre deux, et se garde sous une signature. Les définitions
   elles-mêmes sont déjà mémorisées par `definitionDe()`.
   ===================================================================== */

let COUV_COLL = {cle: null, val: null, fait: 0, total: 0};
/* Les listes dépliées : un réglage de lecture, non de l'état — rien n'en va
   dans `snapshot()`. */
const COUV_COLL_OUVERTE = {partielle: false, injouable: false};
/* Au-delà, une liste est tronquée : mille lignes d'un coup noient la page. */
const COUV_COLL_MAX = 300;

function cleCouvertureCollection() {
  return [empreinte([...S.collection].map(([n, q]) => q + n).sort().join(',')), signatureComportements(),
    CAT.date, CAT.cartes.length, SIM_CARTES.size, typeof FORGE !== 'undefined' ? FORGE.textes.size : 0].join('|');
}

/* Le classement d'une carte de la collection : son état, ou `null` pour ce
   qui ne compte pas (terrain, jeton). Une carte que nulle source ne connaît
   se compte à part, sous `inconnue`. */
function classeCarteCollection(nom, n) {
  const f = ficheParNom(nom);
  if (!f) return {etat: 'inconnue', nom, n};
  const def = definitionDe(f, comportementDe(f.nom));
  if (def.types.includes('land') || def.jeton) return null;
  const c = def.couverture;
  return {etat: c.etat, nom: f.nom, n, taux: c.taux, manuel: c.manuel, source: def.source, manque: c.manque || null};
}

function bilanVierge() {
  return {complete: 0, partielle: 0, injouable: 0, inconnue: 0, terrains: 0, listes: {partielle: [], injouable: []}};
}

/* Une tranche, d'une quinzaine de millisecondes. Un changement de signature
   en cours de route abandonne le calcul : le suivant repart de zéro. */
function trancheCouvertureCollection(cle, entrees, i, acc) {
  if (COUV_COLL.cle !== cle) return;
  const fin = performance.now() + 15;
  while (i < entrees.length && performance.now() < fin) {
    const [nom, q] = entrees[i++];
    const r = classeCarteCollection(nom, q);
    if (!r) acc.terrains++;
    else if (r.etat === 'complete') acc.complete++;
    else if (r.etat === 'inconnue') acc.inconnue++;
    else { acc[r.etat]++; acc.listes[r.etat].push(r); }
  }
  COUV_COLL.fait = i;
  if (i < entrees.length) { setTimeout(() => trancheCouvertureCollection(cle, entrees, i, acc), 0); }
  else {
    const classe = (a, b) => a.nom.localeCompare(b.nom, 'fr');
    acc.listes.partielle.sort(classe); acc.listes.injouable.sort(classe);
    const n = acc.complete + acc.partielle + acc.injouable;
    acc.n = n; acc.taux = n ? acc.complete / n : 1;
    COUV_COLL.val = acc;
  }
  /* Le texte d'attente se met à jour en place : repeindre la section à chaque
     tranche emporterait la saisie en cours dans les champs de la table. */
  if (S.onglet !== 'simulation') return;
  if (COUV_COLL.val) renderK();
  else { const el = document.getElementById('simCollFait'); if (el) el.textContent = i; }
}

/* Le bilan, ou `null` tant que le calcul court (`COUV_COLL.fait` dit où il en
   est). Il ne démarre que sous les yeux : `renderK()` ne l'appelle pas
   sur une page cachée. */
function couvertureCollection() {
  const cle = cleCouvertureCollection();
  if (COUV_COLL.cle === cle) return COUV_COLL.val;
  const entrees = [...S.collection];
  COUV_COLL = {cle, val: null, fait: 0, total: entrees.length};
  setTimeout(() => trancheCouvertureCollection(cle, entrees, 0, bilanVierge()), 0);
  return null;
}

function ligneCouvertureCollection(c) {
  return `<div class="sim-ligne">
    <span class="sim-etat ${c.etat}">${c.etat}</span> ${esc(c.nom)}${c.n > 1 ? ` ×${c.n}` : ''}
    <span class="small muted">${Math.round(c.taux * 100)} % compris</span>${c.manuel ? ' <span class="small muted">(décrite à la main)</span>' : ''}
    ${c.source === 'forge' ? `<span class="small muted" title="${esc((c.manque || []).join(', '))}">Forge${c.manque && c.manque.length ? ' — manque ' + esc(c.manque.slice(0, 2).map(e => e.split(':')[1]).join(', ')) : ''}</span>` : ''}
    <span class="sim-gestes"><button type="button" class="btn sm" data-act="simComportement" data-carte="${esc(c.nom)}">Décrire</button></span>
  </div>`;
}

function listeCouvertureCollection(v, etat, libelle) {
  const l = v.listes[etat];
  if (!l.length) return '';
  const ouverte = COUV_COLL_OUVERTE[etat];
  return `<button type="button" class="pill" data-act="simCollListe" data-etat="${etat}" aria-pressed="${ouverte}"
      title="${ouverte ? 'Replier' : 'Voir'} la liste des cartes ${libelle}">${l.length} ${libelle} ${ouverte ? '▴' : '▾'}</button>`;
}

function couvertureCollectionHTML() {
  if (!S.collection.size) return '';
  const v = couvertureCollection();
  if (!v) return `<div class="sim-bloc"><h3>Ce que le moteur comprend de la collection</h3>
    <div class="small muted">Lecture de la collection : <span id="simCollFait">${COUV_COLL.fait}</span> / ${COUV_COLL.total} cartes…</div></div>`;
  const ouvertes = ['partielle', 'injouable'].filter(e => COUV_COLL_OUVERTE[e] && v.listes[e].length);
  return `<div class="sim-bloc">
    <h3>Ce que le moteur comprend de la collection</h3>
    <div class="row" style="margin-bottom:6px">
      ${badgeCouverture(v.taux, 'Part des cartes de la collection que le moteur comprend entièrement')}
      <span class="small">de ${v.n} carte(s) différente(s) sont <b>entièrement couvertes</b> · ${v.complete} complète(s)</span>
      ${listeCouvertureCollection(v, 'partielle', 'partielle(s)')}
      ${listeCouvertureCollection(v, 'injouable', 'injouable(s)')}
    </div>
    <div class="small muted">Cartes différentes, terrains écartés${v.terrains ? ` (${v.terrains})` : ''}${v.inconnue ? ` · ${v.inconnue} inconnue(s) du moteur, non comptées` : ''}.
      Une carte partielle est jouée pour ce qui est compris ; une injouable n'est jamais lancée.</div>
    ${ouvertes.map(e => {
      const l = v.listes[e];
      return `<div class="sim-liste" style="margin-top:8px"><b class="small">${e === 'partielle' ? 'Partiellement couvertes' : 'Injouables'}</b>
        ${l.slice(0, COUV_COLL_MAX).map(ligneCouvertureCollection).join('')}
        ${l.length > COUV_COLL_MAX ? `<div class="small muted">et ${l.length - COUV_COLL_MAX} autre(s).</div>` : ''}</div>`;
    }).join('')}
  </div>`;
}
