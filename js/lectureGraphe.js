/* =====================================================================
   js/lectureGraphe.js — Quelle lecture pour le graphe : le script ou le texte

   Le graphe, les rôles et la notation lisent une carte dans son script de
   Forge (js/grapheForge.js) quand les scripts sont sur l'appareil et que le
   réglage le veut, dans son texte (js/analyse.js) sinon. Les deux ne se
   mêlent pas pendant un premier téléchargement : le catalogue note des
   milliers de cartes avec une même notation, et une carte lue dans Forge —
   moins de faux liens — n'y serait pas jugée comme sa voisine lue dans le
   texte. On attend donc que presque tous les scripts soient là ; une carte
   que Forge ne connaît pas encore reste lue dans son texte.

   Quand le choix change — les scripts arrivent, on les efface, on bascule le
   réglage —, toutes les cartes connues sont relues, par tranches, puis la
   notation est refaite en arrière-plan.
   ===================================================================== */

const LECTURE = {sig: '', pret: false, taille: -1, liste: null, lus: new Map(), tranche: null};

/* Presque tous les scripts de cartes sont là : 95 % de ce que Forge publie.
   La mise à jour de la semaine ne fait pas retomber sous le seuil : les
   anciens textes restent jusqu'à ce que les nouveaux les remplacent. La
   réponse est gardée tant que ni la liste publiée — remplacée à chaque
   relevé — ni le nombre de textes ne changent : chaque carte analysée la
   redemande. */
function scriptsGraphePrets() {
  if (typeof FORGE === 'undefined' || !FORGE.liste) return false;
  if (LECTURE.liste === FORGE.liste && LECTURE.taille === FORGE.textes.size) return LECTURE.pret;
  const cartes = Object.keys(FORGE.liste).filter(ch => !ch.startsWith('jetons/'));
  const la = cartes.filter(ch => FORGE.textes.has(ch)).length;
  LECTURE.taille = FORGE.textes.size;
  LECTURE.liste = FORGE.liste;
  LECTURE.pret = cartes.length > 0 && la >= 0.95 * cartes.length;
  return LECTURE.pret;
}

function lectureForgeVoulue() {
  return S.simulation.grapheForge !== false;
}

function lectureForgeActive() {
  return lectureForgeVoulue() && scriptsGraphePrets();
}

/* La lecture de Forge d'une carte, ou `null` : `analyze()` (js/analyse.js)
   prend alors celle du texte. Un script illisible ne casse rien : on lit le
   texte. Le script lu est gardé, une carte étant relue à chaque complément
   que Scryfall lui apporte. */
function lectureForgeDe(card) {
  if (!card || card.isToken || !lectureForgeActive()) return null;
  const txt = scriptForgeDe(card.name);
  if (!txt) return null;
  try {
    if (!LECTURE.lus.has(txt)) LECTURE.lus.set(txt, lisScriptForge(txt));
    return analyseForge(card, LECTURE.lus.get(txt), {jeton: nom => FORGE.jetons.get(nom) || null});
  } catch (e) {
    return null;
  }
}

/* Ce que la lecture retenue doit à son choix, pour la fiche : la source, et
   les nœuds sur lesquels l'autre lecture aurait dit autre chose. */
function ecartLectures(card) {
  if (!card || !card.an || card.an.source !== 'forge') return null;
  const t = analyseTexte(card), f = card.an;
  const noeuds = an => new Set([...an.triggers.map(x => x.c), ...an.produces.map(x => x.c)]);
  const nt = noeuds(t), nf = noeuds(f);
  return {texteSeul: [...nt].filter(n => !nf.has(n)), forgeSeul: [...nf].filter(n => !nt.has(n)), replis: f.replis || 0};
}

/* Toutes les cartes que l'atelier a bâties : la base, et celles que le
   catalogue a analysées pour ses listes sans les ranger dans la base. */
function cartesAnalysees() {
  const vues = new Set(DB);
  const out = [...DB];
  (typeof CAT !== 'undefined' && CAT.cartes ? CAT.cartes : []).forEach(r => {
    if (r._card && !vues.has(r._card)) { vues.add(r._card); out.push(r._card); }
  });
  return out;
}

/* Relire toutes les cartes si le choix de la lecture a changé. Appelé quand
   les scripts changent (`forgeChange()`, js/forgeVue.js) et quand on bascule
   le réglage. Au premier appel, si Forge n'est pas de mise, il n'y a rien à
   relire : la base a été lue dans le texte. */
function relisGraphe() {
  const active = lectureForgeActive();
  const sig = active ? ['forge', FORGE.commit, FORGE.textes.size].join('|') : 'texte';
  if (sig === LECTURE.sig || (!LECTURE.sig && !active)) { LECTURE.sig = sig; return; }
  LECTURE.sig = sig;
  LECTURE.lus.clear();
  const cartes = cartesAnalysees();
  let i = 0;
  if (LECTURE.tranche) clearTimeout(LECTURE.tranche);
  const avance = () => {
    const fin = Date.now() + 15;
    while (i < cartes.length && Date.now() < fin) reanalyser(cartes[i++]);
    if (i < cartes.length) { LECTURE.tranche = setTimeout(avance, 0); return; }
    LECTURE.tranche = null;
    MAJ_CARTES++;
    if (typeof invaliderCandidats === 'function') invaliderCandidats();
    recalculerAvecProgression(active
      ? 'Les scripts de Forge sont là : le graphe et les rôles relisent chaque carte dans son script.'
      : 'Le graphe et les rôles relisent chaque carte dans son texte.', {fond: true});
  };
  avance();
}

/* La ligne de la section « Cartes Forge » qui dit ce que lit le graphe. */
function etatLectureGraphe() {
  if (!lectureForgeVoulue()) return 'Le graphe lit le texte des cartes.';
  if (lectureForgeActive()) return 'Le graphe et les rôles lisent les scripts ; une carte que Forge ne connaît pas est lue dans son texte.';
  return 'Le graphe lira les scripts quand ils seront presque tous sur l\'appareil ; d\'ici là, il lit le texte des cartes.';
}
