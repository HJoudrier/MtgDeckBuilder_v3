/* =====================================================================
   js/candidats.js — Des enregistrements de l'archive aux cartes candidates

   L'archive ne porte que des tableaux de champs : `carteDuCatalogue()` en fait
   une carte analysée, `completeDepuisRec()` complète une carte déjà connue.
   Par-dessus, le vivier : les cartes du catalogue que les filtres, les
   couleurs et le format laissent passer, bâties par tranches et gardées dans
   `CAND` tant que la signature de l'état ne bouge pas.
   ===================================================================== */

function completeDepuisRec(c, rec) {
  if (majTexteOracle(c, rec[CH.TEXTE])) {
    if (rec[CH.ID_COUL] !== undefined && !/^basic land/i.test(c.type || '')) {
      c.identity = rec[CH.ID_COUL] ? String(rec[CH.ID_COUL]).split('') : [];
    }
    if (typeof rec[CH.CMC] === 'number') c.cmc = rec[CH.CMC];
  }
  if (rec[CH.IMG] && !c.imgN) {
    c.img = CDN + 'small/' + rec[CH.IMG];
    c.imgN = CDN + 'normal/' + rec[CH.IMG];
    c.imgL = CDN + 'large/' + rec[CH.IMG];
    c.imgTried = true;
  }
  if (rec[CH.VERSO] && !c.imgB) {
    c.imgB = CDN + 'normal/' + rec[CH.VERSO];
    c.imgBL = CDN + 'large/' + rec[CH.VERSO];
  }
  if (rec[CH.FORCE] != null && c.force == null) {
    c.force = rec[CH.FORCE];
    reanalyser(c);
  }
  if (rec[CH.ENDURANCE] != null && c.endurance == null) c.endurance = rec[CH.ENDURANCE];
  if (rec[CH.ARTISTE] && !c.artist) c.artist = rec[CH.ARTISTE];
  if (!c.price && rec[CH.PRIX] > 0) c.price = rec[CH.PRIX];
  noterSetsArchive(c, rec);
  noterLegalArchive(c, rec);
  return c;
}

/* Ce que l'archive sait de la légalité d'une carte. L'archive n'en publie que
   pour Commander et Standard : ailleurs, la carte reste « non jugée ». */
function noterLegalArchive(c, rec) {
  if (c && rec.length > CH.LEGAL) c.legal = String(rec[CH.LEGAL] || '');
}

/* Ce que l'archive sait des éditions d'une carte, gardé sur la carte pour que
   le filtre par set réponde sans réseau. `setsCarte()` (js/etat.js) le réunit
   à ce que Scryfall rapporte et aux éditions possédées. */
function noterSetsArchive(c, rec) {
  const codes = String(rec[CH.SET] || '').split(',').filter(Boolean);
  if (c && codes.length) c.setsArchive = codes;
}

function carteDuCatalogue(rec) {
  const nom = rec[CH.NOM];
  let c = find(nom);
  if (c && !c.unknown) return completeDepuisRec(c, rec);
  c = registerCard(buildCard(nom, rec[CH.COUT] || '—', rec[CH.TYPE], rec[CH.PRIX], rec[CH.TEXTE]));
  c.textFull = !!rec[CH.TEXTE];
  if (rec[CH.ID_COUL] !== undefined) c.identity = rec[CH.ID_COUL] ? rec[CH.ID_COUL].split('') : [];
  c.cmc = rec[CH.CMC];
  if (rec[CH.FORCE] != null) c.force = rec[CH.FORCE];
  if (rec[CH.ENDURANCE] != null) c.endurance = rec[CH.ENDURANCE];
  if (rec[CH.ARTISTE]) c.artist = rec[CH.ARTISTE];
  noterLegalArchive(c, rec);
  reanalyser(c);
  if (rec[CH.IMG]) {
    c.img = CDN + 'small/' + rec[CH.IMG];
    c.imgN = CDN + 'normal/' + rec[CH.IMG];
    c.imgL = CDN + 'large/' + rec[CH.IMG];
    if (rec[CH.VERSO]) { c.imgB = CDN + 'normal/' + rec[CH.VERSO]; c.imgBL = CDN + 'large/' + rec[CH.VERSO]; }
    c.imgTried = true;
  } else if (rec[CH.ID]) {
    const base = 'https://api.scryfall.com/cards/' + rec[CH.ID] + '?format=image&version=';
    c.img = base + 'small'; c.imgN = base + 'normal'; c.imgL = base + 'large'; c.imgTried = true;
  }
  c.externe = true; c.unknown = false;
  return c;
}

let CAND = {sig:null, liste:[], stats:null};
function invaliderCandidats() { CAND = {sig:null, liste:[], stats:null}; }

/* Les critères de la fenêtre entrent dans la signature : sans eux, le
   décompte annoncé resservirait celui d'avant le filtre. */
function signatureCandidats() {
  return [S.format, S.commander, [...S.colors].join(''), S.colorMode, S.budget.perCard,
          CAT.cartes.length, S.collection.size, S.candidatsMax, S.filtreLegal,
          S.catalogueNumeriques, noeudsActifs().sort().join(','),
          JSON.stringify(S.filtres || {})].join('|');
}

/* Le catalogue local porte le texte oracle complet et les prix à jour : on en
   profite pour remplacer, sans requête réseau, les résumés de la base
   intégrée et les prix des cartes possédées ou jouées. */
function appliqueCatalogueAuxCartes() {
  if (!CAT.cartes.length) return;
  const utiles = new Set([...S.collection.keys(), ...S.deck.keys(),
    ...CLES_ANNEXES.flatMap(cle => [...annexeListe(cle).keys()])].map(norm));
  const aCompleter = new Map();
  DB.forEach(c => { if (!c.textFull && !c.unknown) aCompleter.set(norm(c.name), c); });
  if (!utiles.size && !aCompleter.size) return;
  let n = 0;
  CAT.cartes.forEach(rec => {
    const cle = norm(rec[CH.NOM]);
    const complete = aCompleter.get(cle);
    if (complete) {
      aCompleter.delete(cle);
      completeDepuisRec(complete, rec);
      n++;
    }
    if (!utiles.has(cle)) return;
    const c = complete || find(rec[CH.NOM]);
    if (c && !complete) { noterSetsArchive(c, rec); noterLegalArchive(c, rec); }
    if (c && rec[CH.PRIX] > 0 && c.price !== rec[CH.PRIX]) { c.price = rec[CH.PRIX]; n++; }
  });
  if (n) scheduleSave();
}

/* Le tri de la sélection : la boucle qui écarte, puis le classement par rang
   EDHREC. C'est la partie rapide — quelques dizaines de millisecondes sur tout
   le catalogue — et elle est commune aux deux façons de bâtir les candidats,
   d'un bloc ou par tranches. Les critères de la fenêtre s'appliquent ici, sur
   l'enregistrement compact : c'est ce qui permet de chercher dans tout le
   catalogue, et non parmi les seules cartes les mieux classées. */
function selectionCandidats() {
  const legal = S.filtreLegal ? (fmt().legal || '') : '';
  const cmd = S.commander ? find(S.commander) : null;
  const ident = cmd ? cmd.identity : null;
  const noeuds = noeudsActifs();
  const st = {total:CAT.cartes.length, legalite:0, identite:0, couleurs:0, possedees:0,
              prix:0, sansPrix:0, filtres:0, noeuds:0, numeriques:0, retenus:0, coupes:0};
  const retenus = [];
  for (const rec of CAT.cartes) {
    if (!rec || rec.length <= CH.LEGAL) continue;
    /* Une archive d'avant la colonne ne porte pas l'information : la carte
       est alors « non jugée » et reste candidate, comme pour la légalité. */
    if (!S.catalogueNumeriques && rec[CH.NUMERIQUE] === 1) { st.numeriques++; continue; }
    if (legal && String(rec[CH.LEGAL] || '').indexOf(legal) < 0) { st.legalite++; continue; }
    const id = rec[CH.ID_COUL] ? String(rec[CH.ID_COUL]).split('') : [];
    if (ident && id.some(x => !ident.includes(x))) { st.identite++; continue; }
    if (!colorOK({identity:id})) { st.couleurs++; continue; }
    if (S.collection.get(rec[CH.NOM]) > 0) { st.possedees++; continue; }
    /* Le plafond par carte ne vaut que pour un prix connu : une carte dont
       Scryfall ne publie pas le prix reste candidate, même si la branche
       « achat » ne saura pas la chiffrer. */
    const prix = rec[CH.PRIX];
    if (prix > 0 && prix > S.budget.perCard) { st.prix++; continue; }
    if (!filtreOKRec(rec)) { st.filtres++; continue; }
    if (noeuds.length && !recToucheNoeuds(rec, noeuds)) { st.noeuds++; continue; }
    /* Compté sur les seules retenues : c'est d'elles que la phrase parle. */
    if (!(prix > 0)) st.sansPrix++;
    retenus.push(rec);
  }
  retenus.sort((a, b) => a[CH.RANG] - b[CH.RANG]);
  st.retenus = retenus.length;
  st.coupes = Math.max(0, retenus.length - S.candidatsMax);
  return {retenus:retenus.slice(0, S.candidatsMax), st};
}

/* Les cartes du catalogue qu'il vaut la peine de proposer. Le plafond ne vient
   qu'après la sélection, sur ce qui reste, et il est compté à part pour que la
   phrase de la section puisse le dire. */
function candidatsCatalogue() {
  if (CAT.etat !== 'ok' || !CAT.cartes.length) return [];
  const sig = signatureCandidats();
  if (CAND.sig === sig) return CAND.liste;
  const {retenus, st} = selectionCandidats();
  CAND = {sig, liste:retenus.map(carteDuCatalogue), stats:st};
  return CAND.liste;
}

/* La même construction, mais par tranches : bâtir les objets carte est le
   gros du travail, et la barre de progression d'« Appliquer » a besoin de
   rendre la main pour se peindre. Le résultat garnit la même mémo, si bien
   que l'appel direct qui suit n'a plus rien à recalculer. */
async function prechauffeCandidats(onProgress) {
  if (CAT.etat !== 'ok' || !CAT.cartes.length) return 0;
  const sig = signatureCandidats();
  if (CAND.sig === sig) { if (onProgress) onProgress(CAND.liste.length, CAND.liste.length); return CAND.liste.length; }
  const {retenus, st} = selectionCandidats();
  const liste = [];
  const LOT = 1500;
  /* Annoncé même quand il n'y a rien à bâtir : la barre doit montrer que
     l'étape a bien eu lieu, pas rester muette. */
  if (onProgress) onProgress(0, retenus.length);
  for (let i = 0; i < retenus.length; i += LOT) {
    const fin = Math.min(retenus.length, i + LOT);
    for (let j = i; j < fin; j++) liste.push(carteDuCatalogue(retenus[j]));
    if (onProgress) onProgress(fin, retenus.length);
    await new Promise(r => setTimeout(r, 0));
  }
  CAND = {sig, liste, stats:st};
  if (onProgress) onProgress(retenus.length, retenus.length);
  return liste.length;
}

/* Le détail de ce qui a écarté, pour la phrase de la section Suggestions.
   Il se calcule avec les candidats, donc on les demande d'abord. */
function statsCandidats() {
  if (CAT.etat !== 'ok' || !CAT.cartes.length) return null;
  candidatsCatalogue();
  return CAND.stats;
}

function requeteCatalogue() {
  const cmd = S.commander ? find(S.commander) : null;
  const ident = (cmd ? cmd.identity : [...S.colors].filter(c => c !== 'C'));
  const id = ident.length ? ident.join('').toLowerCase() : 'c';
  const legal = S.filtreLegal ? (fmt().scry || '') : '';
  return [legal ? `legal:${legal}` : '', S.catalogueNumeriques ? '' : 'game:paper',
          `id<=${id}`, '-is:token', '-t:basic'].filter(Boolean).join(' ');
}

function signatureCatalogue() { return requeteCatalogue(); }

async function chargerCatalogue() {
  if (typeof fetch !== 'function') { S.exploreEtat = 'hors-ligne'; return; }
  const sig = signatureCatalogue();
  S.exploreEtat = 'chargement';
  renderSuggestions();
  const q = requeteCatalogue();
  let url = 'https://api.scryfall.com/cards/search?order=edhrec&unique=cards&q=' + encodeURIComponent(q);
  let charge = 0, ajoutees = 0;
  try {
    while (url && charge < S.exploreMax) {
      const r = await fetch(url);
      if (r.status === 404) { S.exploreEtat = 'aucune'; S.exploreTotal = 0; renderSuggestions(); return; }
      if (!r.ok) throw new Error('HTTP ' + r.status);
      const j = await r.json();
      if (typeof j.total_cards === 'number') S.exploreTotal = j.total_cards;
      (j.data || []).forEach(sc => {
        const avant = find(sc.name);
        applyScryfall(sc, avant && avant.unknown ? avant : (avant || null), !!(avant && !avant.unknown));
        const c = find(sc.name);
        if (c && !(S.collection.get(c.name) > 0)) { c.externe = true; ajoutees++; }
        charge++;
      });
      S.exploreCharge = charge;
      url = j.has_more ? j.next_page : null;
      S.exploreReste = !!url;
      if (charge <= 175 || charge % 1400 < 175) renderSuggestions();
      if (url && charge < S.exploreMax) await new Promise(r2 => setTimeout(r2, 110));
    }
    S.exploreEtat = 'ok';
  } catch(err) {
    S.exploreEtat = (err instanceof TypeError) ? 'hors-ligne' : 'erreur';
  }
  renderAll();
  void ajoutees;
}
