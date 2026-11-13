/* =====================================================================
   js/forgeDepot.js — Les scripts de cartes de Forge, téléchargés et gardés

   Le projet Forge (GPL-3.0) publie sur GitHub un script par carte, environ
   trente-quatre mille. L'atelier les télécharge sur l'appareil de
   l'utilisateur — aucun ne vit dans ce dépôt — et les garde dans IndexedDB.
   La liste vient de l'API de GitHub (quatre requêtes), avec l'empreinte
   (`sha`) de chaque fichier ; les fichiers viennent de
   `raw.githubusercontent.com`, épinglés au commit, dix à la fois. Une mise à
   jour ne retélécharge que les fichiers dont l'empreinte a changé, et un
   téléchargement interrompu reprend où il en était.

   Les cartes de vos decks et de vos adversaires passent d'abord : on peut
   jouer avec elles bien avant que les trente-quatre mille soient là.
   ===================================================================== */

const FORGE_GH = {api: 'https://api.github.com/repos/Card-Forge/forge', brut: 'https://raw.githubusercontent.com/Card-Forge/forge/',
  dossiers: {cartes: 'forge-gui/res/cardsfolder', jetons: 'forge-gui/res/tokenscripts'}};
const IDB_FORGE = 'forge-index';
const FORGE_DELAI = 7 * 86400000;
const FORGE = {etat: '', commit: '', date: 0, liste: null, shas: {}, textes: new Map(), parNom: new Map(), jetons: new Map(),
  fait: 0, total: 0, erreur: '', verifie: 0, charge: null, arret: false, sales: new Set()};

/* Le paquet IndexedDB d'un chemin : un par dossier de premier niveau, pour
   ne réécrire que ce qui a changé. */
function paquetForge(chemin) { return 'forge-d-' + chemin.split('/')[0]; }

/* Le nom de base qu'un fichier de Forge tire du nom de sa carte. */
function baseForge(nom) {
  return String(nom).toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/['’,]/g, '')
    .replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '');
}

/* Ranger un texte en mémoire et l'indexer par le nom de chacune de ses faces. */
function indexeForge(chemin, texte) {
  FORGE.textes.set(chemin, texte);
  if (chemin.startsWith('jetons/')) { FORGE.jetons.set(chemin.slice(7).replace(/\.txt$/, ''), texte); return; }
  const noms = [...texte.matchAll(/^Name:(.*)$/gm)].map(m => m[1].trim());
  noms.forEach(n => FORGE.parNom.set(norm(n), chemin));
  if (noms.length > 1) FORGE.parNom.set(norm(noms.join(' // ')), chemin);
}

/* Relire ce que l'appareil garde, une seule fois : deux appels pressés
   attendent la même lecture. */
function chargeForge() {
  if (!FORGE.charge) FORGE.charge = (async () => {
    try {
      const ix = await idbLire(IDB_FORGE);
      if (!ix) return;
      Object.assign(FORGE, {commit: ix.commit, date: ix.date, verifie: ix.verifie || 0, shas: ix.shas || {}, liste: ix.liste || null});
      for (const cle of ix.paquets || []) {
        const p = await idbLire(cle);
        if (p) Object.keys(p).forEach(ch => indexeForge(ch, p[ch]));
      }
      if (FORGE.textes.size && !FORGE.etat) FORGE.etat = forgeIncomplet() ? 'pause' : 'ok';
    } catch (e) { /* IndexedDB absent : on retéléchargera. */ }
  })();
  return FORGE.charge;
}

/* Reste-t-il des fichiers à télécharger ? */
function forgeIncomplet() {
  return !FORGE.liste || Object.keys(FORGE.liste).some(ch => FORGE.shas[ch] !== FORGE.liste[ch][0]);
}

async function jsonGH(url) {
  const r = await fetch(url, {headers: {Accept: 'application/vnd.github+json'}});
  if (!r.ok) throw new Error(r.status === 403 ? 'GitHub limite les requêtes : réessayez dans une heure' : 'GitHub répond ' + r.status);
  return r.json();
}

/* La liste des fichiers, empreintes comprises, au dernier commit. */
async function listeForge() {
  const c = await jsonGH(FORGE_GH.api + '/commits/master');
  const res = await jsonGH(FORGE_GH.api + '/contents/forge-gui/res?ref=' + c.sha);
  const liste = {};
  for (const [genre, dossier] of Object.entries(FORGE_GH.dossiers)) {
    const d = res.find(x => x.path === dossier);
    if (!d) continue;
    let arbre = await jsonGH(FORGE_GH.api + '/git/trees/' + d.sha + '?recursive=1');
    let entrees = arbre.tree;
    if (arbre.truncated) {
      entrees = [];
      const haut = await jsonGH(FORGE_GH.api + '/git/trees/' + d.sha);
      for (const s of haut.tree.filter(x => x.type === 'tree')) {
        const sous = await jsonGH(FORGE_GH.api + '/git/trees/' + s.sha + '?recursive=1');
        sous.tree.forEach(x => entrees.push({...x, path: s.path + '/' + x.path}));
      }
    }
    entrees.filter(x => x.type === 'blob' && x.path.endsWith('.txt')).forEach(x => {
      liste[(genre === 'jetons' ? 'jetons/' : '') + x.path] = [x.sha, dossier + '/' + x.path];
    });
  }
  return {commit: c.sha, date: Date.parse(c.commit && c.commit.committer && c.commit.committer.date) || Date.now(), liste};
}

/* Les noms des cartes de vos decks et de vos adversaires. */
function nomsPrioritaires() {
  const n = new Set();
  Object.values(S.decks).forEach(d => { d.deck.forEach((_, k) => n.add(k)); if (d.commander) n.add(d.commander); });
  Object.values(S.adversaires).forEach(a => { a.liste.forEach(([k]) => n.add(k)); a.commandants.forEach(k => n.add(k)); });
  return [...n];
}

/* Les chemins de la liste qui portent ces noms : le nom de base exact, ou
   le début du nom d'un fichier à deux faces. */
function cheminsDeNoms(noms, liste) {
  const parBase = new Map();
  Object.keys(liste).forEach(ch => { if (!ch.startsWith('jetons/')) parBase.set(ch.split('/').pop().replace(/\.txt$/, ''), ch); });
  const r = new Set();
  noms.forEach(nom => {
    const b = baseForge(String(nom).split(' // ')[0]);
    if (parBase.has(b)) { r.add(parBase.get(b)); return; }
    for (const [k, ch] of parBase) if (k.startsWith(b + '_')) { r.add(ch); break; }
  });
  return r;
}

/* Ranger les paquets modifiés et l'index. */
async function rangeForge() {
  const paquets = new Set(Object.keys(FORGE.shas).map(paquetForge));
  for (const cle of FORGE.sales) {
    const p = {};
    FORGE.textes.forEach((t, ch) => { if (paquetForge(ch) === cle) p[ch] = t; });
    await idbEcrire(cle, p);
  }
  FORGE.sales.clear();
  await idbEcrire(IDB_FORGE, {v: 1, commit: FORGE.commit, date: FORGE.date, verifie: FORGE.verifie, shas: FORGE.shas,
    liste: FORGE.liste, paquets: [...paquets]});
}

async function telechargeUn(ch, sha, chemin, essai = 0) {
  try {
    const r = await fetch(FORGE_GH.brut + FORGE.commit + '/' + chemin);
    if (r.status === 429 || r.status === 403) throw Object.assign(new Error('limite'), {limite: true});
    if (!r.ok) throw new Error('GitHub répond ' + r.status);
    indexeForge(ch, await r.text());
    FORGE.shas[ch] = sha;
    FORGE.sales.add(paquetForge(ch));
  } catch (e) {
    if (essai >= 4) throw e;
    await new Promise(ok => setTimeout(ok, e.limite ? 30000 : 1000 * 2 ** essai));
    return telechargeUn(ch, sha, chemin, essai + 1);
  }
}

/* Télécharger ce qui manque ou a changé : vos cartes d'abord. */
async function telechargeForge(force) {
  if (FORGE.etat === 'telecharge' || FORGE.etat === 'liste') return;
  await chargeForge();
  Object.assign(FORGE, {etat: 'liste', erreur: '', arret: false});
  majForgeUI();
  try {
    if (force || !FORGE.liste || Date.now() - FORGE.verifie > FORGE_DELAI) {
      const l = await listeForge();
      Object.assign(FORGE, {commit: l.commit, date: l.date, liste: l.liste, verifie: Date.now()});
    }
    const aFaire = Object.keys(FORGE.liste).filter(ch => FORGE.shas[ch] !== FORGE.liste[ch][0]);
    const prio = cheminsDeNoms(nomsPrioritaires(), FORGE.liste);
    const rang = ch => prio.has(ch) ? 0 : ch.startsWith('jetons/') ? 1 : 2;
    aFaire.sort((a, b) => rang(a) - rang(b));
    /* Les fichiers qui ont disparu de Forge (renommés, fusionnés) s'en vont. */
    Object.keys(FORGE.shas).filter(ch => !FORGE.liste[ch]).forEach(ch => {
      delete FORGE.shas[ch]; FORGE.textes.delete(ch); FORGE.sales.add(paquetForge(ch));
    });
    Object.assign(FORGE, {etat: 'telecharge', fait: 0, total: aFaire.length});
    majForgeUI();
    let i = 0, dernier = Date.now();
    const ouvrier = async () => {
      while (i < aFaire.length && !FORGE.arret) {
        const ch = aFaire[i++];
        await telechargeUn(ch, FORGE.liste[ch][0], FORGE.liste[ch][1]);
        FORGE.fait++;
        if (Date.now() - dernier > 4000) { dernier = Date.now(); await rangeForge(); majForgeUI(true); }
      }
    };
    await Promise.all(Array.from({length: 10}, ouvrier));
    await rangeForge();
    FORGE.etat = FORGE.arret ? 'pause' : 'ok';
    forgeChange();
  } catch (e) {
    FORGE.etat = 'erreur'; FORGE.erreur = e.message;
    await rangeForge().catch(() => {});
  }
  majForgeUI();
}

/* Au démarrage, en tâche de fond : reprendre un téléchargement inachevé, ou
   vérifier une fois par semaine qu'il n'y a rien de neuf. Le tout premier
   téléchargement, lui, attend qu'on le demande : quinze mégaoctets ne se
   prennent pas sans prévenir. */
async function demarreForge() {
  if (typeof fetch !== 'function' || typeof indexedDB === 'undefined') return;
  await chargeForge();
  if (!FORGE.liste) return;
  forgeChange();
  if (S.simulation.forgeAuto === false) return;
  if (forgeIncomplet() || Date.now() - FORGE.verifie > FORGE_DELAI) setTimeout(() => telechargeForge(false), 5000);
}

/* Effacer les scripts de l'appareil. Le bouton n'est offert qu'à l'arrêt. */
async function oublieForge() {
  const cles = new Set([...Object.keys(FORGE.shas), ...FORGE.textes.keys()].map(paquetForge));
  for (const c of cles) await idbOublier(c);
  await idbOublier(IDB_FORGE);
  Object.assign(FORGE, {etat: '', commit: '', date: 0, liste: null, shas: {}, fait: 0, total: 0, erreur: '', verifie: 0});
  [FORGE.textes, FORGE.parNom, FORGE.jetons, FORGE.sales].forEach(x => x.clear());
  forgeChange();
}

/* Le script Forge d'une carte, s'il est là. */
function scriptForgeDe(nom) {
  const ch = FORGE.parNom.get(norm(nom)) || FORGE.parNom.get(norm(String(nom).split(' // ')[0]));
  return ch ? FORGE.textes.get(ch) : null;
}
