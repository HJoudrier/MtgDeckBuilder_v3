/* =====================================================================
   js/simAdversaires.js — La bibliothèque d'adversaires

   Un adversaire est une liste collée — texte MTGO ou Arena —, rangée à part
   de « Mes decks » : on n'encombre ni la liste de ses decks ni la liste
   d'achats avec des decks qu'on n'a pas l'intention de construire. La liste
   se lit par l'analyseur de l'import (`parseMtgoList()`, js/fenImport.js) ;
   ses cartes se résolvent par js/simCartes.js, Scryfall comblant ce que
   l'atelier ignore.
   ===================================================================== */

function cleAdversaireNeuve() {
  return 'a-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 6);
}

/* Lire une liste collée en adversaire : les cartes du deck, et son
   commandant s'il en a un. La réserve et les jetons ne jouent pas. */
function adversaireDepuisTexte(nom, texte, format) {
  const lignes = parseMtgoList(texte || '');
  const liste = new Map(), commandants = [];
  lignes.forEach(e => {
    if (e.section === 'commandant') { if (!commandants.includes(e.name)) commandants.push(e.name); return; }
    if (e.section !== 'deck') return;
    liste.set(e.name, (liste.get(e.name) || 0) + (e.qty || 1));
  });
  commandants.forEach(c => liste.delete(c));
  const fmt = FORMATS[format] ? format : (commandants.length ? 'edh' : 'standard');
  return {nom: (nom || '').trim() || 'Adversaire', format: fmt, liste: [...liste], commandants, texte, maj: Date.now()};
}

/* Ranger un adversaire ; rend sa clé. Un nom déjà pris reçoit un numéro,
   comme un deck : deux adversaires indiscernables dans un menu ne servent
   à rien. */
function enregistreAdversaire(adv, cle) {
  const k = cle || cleAdversaireNeuve();
  const pris = new Set(Object.keys(S.adversaires).filter(x => x !== k).map(x => S.adversaires[x].nom));
  let nom = adv.nom, n = 2;
  while (pris.has(nom)) nom = adv.nom + ' ' + n++;
  S.adversaires[k] = {...adv, nom, cree: (S.adversaires[k] && S.adversaires[k].cree) || Date.now()};
  return k;
}

function nbCartesAdversaire(adv) {
  return adv.liste.reduce((s, [, q]) => s + q, 0) + adv.commandants.length;
}

/* Ce qu'on sait déjà jouer d'un adversaire, et ce qui manque. */
function resolutionAdversaire(adv) {
  const noms = [...adv.liste.map(([n]) => n), ...adv.commandants];
  const manquants = noms.filter(n => !ficheParNom(n));
  return {total: noms.length, manquants};
}

/* Compléter un adversaire auprès de Scryfall. Rend les noms restés
   introuvables — une faute de frappe dans la liste collée, le plus souvent. */
async function completeAdversaire(cle) {
  const adv = S.adversaires[cle];
  if (!adv) return [];
  await chargeSimCartes();
  const {manquants} = resolutionAdversaire(adv);
  if (!manquants.length) return [];
  return chercheFichesScryfall(manquants);
}

/* L'empreinte d'un adversaire : un résultat calculé contre une liste
   qui a changé depuis est périmé. */
function signatureAdversaire(adv) {
  return empreinte(adv.format + '|' + adv.commandants.join(',') + '|' + adv.liste.map(([n, q]) => q + n).sort().join(','));
}

/* L'empreinte d'un deck de l'atelier, ouvert ou non. `deckSignature()` ne
   regarde que le deck ouvert. */
function signatureDeck(cle) {
  const d = S.decks[cle];
  if (!d) return '';
  return empreinte(d.format + '|' + (d.commander || '') + '|' + [...d.deck].map(([n, q]) => q + n).sort().join(','));
}
