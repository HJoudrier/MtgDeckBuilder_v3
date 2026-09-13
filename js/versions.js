/* =====================================================================
   js/versions.js — Les éditions d'une même carte

   Une carte a souvent dix illustrations. La fiche les fait défiler et permet
   d'en retenir une, qui devient son visage partout dans l'atelier. Deux
   sources : les éditions relevées à l'import, et toutes celles que Scryfall
   connaît. Le rang consulté ne vit que le temps de la fiche ouverte.
   ===================================================================== */

function aDeuxFaces(card) {
  return !!(card && card.imgB);
}

function autreFace(card) {
  if (!aDeuxFaces(card)) return '';
  return RETOURNEES.has(card.name) ? (card.imgN || card.img || '') : (card.imgB || '');
}

function faceVisible(card, grand) {
  if (!card) return '';
  const verso = RETOURNEES.has(card.name) && card.imgB;
  if (verso) return (grand && card.imgBL) ? card.imgBL : card.imgB;
  if (grand && card.imgL) return card.imgL;
  return card.imgN || card.img || '';
}

/* ---------------------------------------------------------------------
   Éditions d'une même carte : la fiche les fait défiler et permet d'en
   retenir une. Le rang consulté ne vit que le temps de la fiche ouverte —
   la fiche est reconstruite à chaque réponse de Scryfall, il ne doit donc
   pas repartir de zéro tant qu'on regarde la même carte.
   --------------------------------------------------------------------- */
let versionVue = {nom:'', i:0, src:'possedees'};

/* Deux sources : les éditions possédées, relevées à l'import, et toutes
   celles que Scryfall publie — ces dernières n'étant cherchées que si on
   les demande, pour ne pas lancer une recherche à chaque fiche ouverte. */
function sourceVersions(card) {
  return (versionVue.nom === card.name && versionVue.src === 'toutes'
          && card.editionsEtat === 'ok') ? 'toutes' : 'possedees';
}

/* La source demandée, qui n'est pas encore la source affichée tant que la
   recherche n'a pas abouti : c'est elle que la bascule doit montrer pressée. */
function sourceVoulue(card) {
  return (versionVue.nom === card.name && versionVue.src === 'toutes') ? 'toutes' : 'possedees';
}

function listeVersions(card) {
  return sourceVersions(card) === 'toutes' ? (card.editions || []) : versionsCarte(card);
}

/* Exemplaires possédés d'une édition, quelle que soit la source affichée. */
function possedeVersion(card, cle) {
  const v = versionsCarte(card).find(x => cleVersion(x) === cle);
  return v ? (v.qty || 0) : 0;
}

function versionRang(card) {
  const vs = listeVersions(card);
  if (!vs.length) return 0;
  if (versionVue.nom !== card.name) {
    const retenue = versionRetenue(card);
    const i = vs.findIndex(v => cleVersion(v) === retenue);
    versionVue = {nom: card.name, i: i >= 0 ? i : 0, src: 'possedees'};
  }
  return Math.min(Math.max(versionVue.i, 0), vs.length - 1);
}

function versionCourante(card) {
  const vs = listeVersions(card);
  return vs.length ? vs[versionRang(card)] : null;
}

function faireDefilerVersion(nom, pas) {
  const card = find(nom); if (!card) return;
  const vs = listeVersions(card);
  if (vs.length < 2) return;
  versionVue = {nom: card.name, i: (versionRang(card) + pas + vs.length) % vs.length,
                src: sourceVersions(card)};
  openCardModal(card.name);
}

/* Passe d'une source à l'autre ; la première bascule vers « toutes »
   déclenche la recherche. */
function basculerSourceVersions(nom, src) {
  const card = find(nom); if (!card) return;
  const poser = () => {
    const vs = src === 'toutes' ? (card.editions || []) : versionsCarte(card);
    const retenue = versionRetenue(card);
    const i = vs.findIndex(v => cleVersion(v) === retenue);
    versionVue = {nom: card.name, i: i >= 0 ? i : 0, src};
    openCardModal(card.name);
  };
  if (src === 'toutes' && card.editionsEtat !== 'ok') {
    versionVue = {nom: card.name, i: 0, src: 'toutes'};
    /* La recherche est lancée avant le rendu : elle pose son drapeau tout de
       suite, si bien que la fiche s'ouvre en annonçant l'attente. */
    const enRoute = chercheToutesEditions(card);
    openCardModal(card.name);
    enRoute.then(() => {
      if (document.getElementById('dlg') && document.getElementById('dlg').open) poser();
    });
    return;
  }
  poser();
}

/* Visuel d'une édition : porté par l'édition elle-même quand elle vient de
   Scryfall, sinon cherché parmi les visuels rapportés pour les impressions
   possédées, sinon celui de la carte s'il s'agit de son édition. */
function visuelVersion(card, v, grand) {
  if (!v) return faceVisible(card, grand);
  const u = (v.imgN || v.img) ? v : (card.visuels || {})[cleVersion(v)];
  if (!u || u.ko) {
    return cleVersion(v) === cleImpression(card.set, card.num) ? faceVisible(card, grand) : '';
  }
  return (grand && u.imgL) ? u.imgL : (u.imgN || u.img || '');
}

/* Le visuel se cherche encore : rien à montrer pour l'instant, mais un
   aller-retour est en vol. La fiche affiche alors une carte vide et son
   icône de chargement, plutôt que de retomber sur le panneau de texte —
   qui, lui, dit « pas de visuel », ce qui serait prématuré. */
function visuelEnRecherche(card, v) {
  if (!card) return false;
  if (card.editionsEtat === 'chargement') return true;
  if (card.visuelsEnCours) return true;
  if (v) {
    const cle = cleVersion(v);
    if ((card.visuels || {})[cle] || v.imgN || v.img) return false;
    if (cle !== cleImpression(card.set, card.num)) return false;
  }
  return !!card.imgEnCours;
}

/* Retenir une édition : son illustration devient celle de la carte partout —
   vignettes de la collection, aperçu au survol, deck. L'édition de référence,
   le prix et le lien d'achat ne suivent que si cette édition est possédée :
   choisir une illustration ne doit pas laisser croire qu'on possède
   l'impression, ni fausser le budget. */
function choisirVersion(nom, cle) {
  const card = find(nom); if (!card || !cle) return;
  const v = listeVersions(card).find(x => cleVersion(x) === cle)
         || versionsCarte(card).find(x => cleVersion(x) === cle);
  const u = (v && (v.imgN || v.img)) ? v : (card.visuels || {})[cle];
  if (!v || !u || u.ko) return;
  const possede = possedeVersion(card, cle) > 0;
  card.impressionChoisie = cle;
  card.imgImpression = cle;
  if (u.img) card.img = u.img;
  if (u.imgN) card.imgN = u.imgN;
  if (u.imgL) card.imgL = u.imgL;
  if (u.artist) card.artist = u.artist;
  card.imgB = u.imgB || '';
  card.imgBL = u.imgBL || '';
  if (possede) {
    card.set = v.set;
    card.num = v.num;
    card.setImporte = true;
    card.impressionKO = false;
    card.setName = u.setName || '';
    if (u.price) card.price = u.price;
    if (u.cmUrl) card.cmUrl = u.cmUrl;
  }
  RETOURNEES.delete(card.name);
  if (typeof scheduleSave === 'function') scheduleSave();
  renderAll();
  openCardModal(card.name);
  toast(`Illustration retenue : ${v.set}${v.num ? ' n°' + v.num : ''}${possede ? '' : ' (édition non possédée)'}.`);
}

