/* =====================================================================
   js/simCartes.js — D'un nom de carte à sa fiche de jeu

   Le moteur ne lit que des fiches (js/definitions.js). Une carte du deck
   testé est dans l'atelier ; une carte adverse peut n'y être nulle part. On
   cherche donc, dans l'ordre : les cartes que l'atelier connaît (`DB`),
   l'archive Scryfall (indexée par nom à la demande), les fiches déjà
   rapportées pour un adversaire (`SIM_CARTES`, gardées dans IndexedDB), et
   en dernier recours Scryfall lui-même.

   Rien de ce qui vient pour un adversaire n'entre dans `DB` : la sauvegarde
   locale garde toute carte de `DB` qui n'est pas « externe », et cent cartes
   adverses par deck la gonfleraient pour rien.
   ===================================================================== */

const IDB_SIM_CARTES = 'sim-cartes';
const SIM_CARTES = new Map();
let simCartesChargees = false;
let INDEX_ARCHIVE = {cle: null, map: null};

/* La fiche d'une carte de l'atelier. Le texte d'une carte livrée n'est qu'un
   résumé : il se joue quand même, et la couverture le dira. */
function ficheDeCarte(c) {
  return {nom: c.name, cout: c.cost || '', type: c.type, texte: c.text || '', force: c.force, endurance: c.endurance,
    loyaute: c.loyaute, motsCles: c.motsCles, faces: c.faces, layout: c.layout, ptBrut: c.ptBrut, manaProduit: c.manaProduit};
}

/* La fiche d'un enregistrement de l'archive. */
function ficheDeRec(rec) {
  const j = champsJeuRec(rec);
  return {nom: rec[CH.NOM], cout: rec[CH.COUT] || '', type: rec[CH.TYPE], texte: rec[CH.TEXTE] || '',
    force: rec[CH.FORCE], endurance: rec[CH.ENDURANCE], loyaute: j.loyaute, motsCles: j.motsCles, faces: j.faces,
    layout: j.layout, ptBrut: j.ptBrut, manaProduit: rec[CH.MANA_PROD] || '', archiveSansJeu: !!j.archiveSansJeu};
}

/* La fiche d'une réponse de Scryfall, sans rien enregistrer dans l'atelier. */
function ficheDeScryfall(sc) {
  const faces = sc.card_faces && sc.card_faces.length ? sc.card_faces : null;
  const j = champsJeuScryfall(sc), f0 = faces ? faces[0] : sc;
  return {nom: sc.name, cout: sc.mana_cost || (f0.mana_cost || ''), type: sc.type_line || f0.type_line || '',
    texte: faces && !sc.oracle_text ? faces.map(f => (f.oracle_text || '').replace(/\n/g, ' // ')).join(' // ')
      : (sc.oracle_text || '').replace(/\n/g, ' // '),
    force: nombreOuRien(sc.power != null ? sc.power : f0.power), endurance: nombreOuRien(sc.toughness != null ? sc.toughness : f0.toughness),
    loyaute: j.loyaute, motsCles: j.motsCles, faces: j.faces, layout: j.layout, ptBrut: j.ptBrut,
    manaProduit: (sc.produced_mana || []).join('')};
}

/* L'index de l'archive par nom et par nom de face avant, rebâti quand
   l'archive change. */
function indexArchive() {
  if (catalogueAbsent()) return null;
  const cle = CAT.date + '|' + CAT.cartes.length;
  if (INDEX_ARCHIVE.cle === cle) return INDEX_ARCHIVE.map;
  const map = new Map();
  for (const rec of CAT.cartes) {
    const n = rec[CH.NOM];
    map.set(norm(n), rec);
    if (n.includes(' // ')) map.set(norm(n.split(' // ')[0]), rec);
  }
  INDEX_ARCHIVE = {cle, map};
  return map;
}

/* La fiche d'un nom, ou `null` si personne ne la connaît encore. Une carte
   de l'atelier sans texte (importée, jamais complétée) ne compte pas : le
   moteur la jouerait comme une carte vide. */
function ficheParNom(nom) {
  const f = ficheSansForge(nom);
  return f ? avecForge(f) : null;
}

/* La fiche, avec son script Forge et ceux des jetons qu'il crée, si
   l'appareil les a (js/forgeDepot.js). Une copie : les fiches gardées pour
   les adversaires ne s'alourdissent pas de scripts. */
function avecForge(f) {
  const s = typeof scriptForgeDe === 'function' ? scriptForgeDe(f.nom) : null;
  if (!s) return f;
  const jetons = {};
  nomsJetonsForge(s).forEach(n => { const t = FORGE.jetons.get(n); if (t) jetons[n] = t; });
  return {...f, forge: s, forgeJetons: jetons};
}

function ficheSansForge(nom) {
  const k = norm(nom);
  const c = find(nom);
  const livree = c && BUILTIN.has(norm(c.name));
  const rec = indexArchive() && indexArchive().get(k);
  if (rec && (!c || livree || !c.textFull)) return ficheDeRec(rec);
  if (c && !c.unknown && (c.text || c.isLand)) return ficheDeCarte(c);
  if (SIM_CARTES.has(k)) return SIM_CARTES.get(k);
  if (rec) return ficheDeRec(rec);
  return null;
}

/* Relire les fiches gardées pour les adversaires. */
async function chargeSimCartes() {
  if (simCartesChargees) return;
  simCartesChargees = true;
  try {
    const d = await idbLire(IDB_SIM_CARTES);
    if (d && Array.isArray(d.fiches)) d.fiches.forEach(f => SIM_CARTES.set(norm(f.nom), f));
  } catch (e) { /* IndexedDB absent : on redemandera à Scryfall. */ }
}

function rangeSimCartes() {
  return idbEcrire(IDB_SIM_CARTES, {v: 1, fiches: [...SIM_CARTES.values()]}).catch(() => {});
}

/* Demander à Scryfall les fiches qui manquent, par paquets de soixante-
   quinze. Rend la liste des noms restés introuvables. */
async function chercheFichesScryfall(noms) {
  const reste = new Set(noms.map(norm));
  for (let i = 0; i < noms.length; i += 75) {
    const ids = noms.slice(i, i + 75).map(n => ({name: n.split(' // ')[0]}));
    try {
      const r = await fetch('https://api.scryfall.com/cards/collection', {method: 'POST',
        headers: {'Content-Type': 'application/json'}, body: JSON.stringify({identifiers: ids})});
      if (!r.ok) continue;
      const j = await r.json();
      (j.data || []).forEach(sc => {
        const f = ficheDeScryfall(sc);
        SIM_CARTES.set(norm(f.nom), f);
        if (f.nom.includes(' // ')) SIM_CARTES.set(norm(f.nom.split(' // ')[0]), f);
        reste.delete(norm(f.nom)); reste.delete(norm(f.nom.split(' // ')[0]));
      });
    } catch (e) { break; }
    await new Promise(ok => setTimeout(ok, 90));
  }
  await rangeSimCartes();
  return noms.filter(n => reste.has(norm(n)));
}
