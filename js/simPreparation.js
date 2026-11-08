/* =====================================================================
   js/simPreparation.js — D'un deck ou d'un adversaire à un siège de table

   Un siège, c'est ce que le moteur reçoit : des définitions de jeu et leurs
   quantités, un commandant, des points de vie de départ. On y joint la
   **couverture** — ce que le compilateur a compris du deck —, sans
   laquelle un taux de victoire ne voudrait rien dire.
   ===================================================================== */

function vieDuFormat(format) {
  const f = FORMATS[format] || FORMATS.perso;
  return f.commander ? 40 : 20;
}

/* Le comportement écrit à la main pour une carte, s'il y en a un. */
function comportementDe(nom) {
  const c = S.comportements[nom];
  return typeof c === 'string' && c.trim() ? c : undefined;
}

/* Résumer la couverture d'un siège. Les terrains ne comptent pas dans le
   taux : ils sont presque toujours compris, et dilueraient ce qui ne l'est
   pas. */
function bilanCouverture(entrees, manquantes) {
  const nl = entrees.filter(c => !c.def.types.includes('land'));
  const n = nl.reduce((s, c) => s + c.n, 0) + manquantes.length;
  const somme = etat => nl.filter(c => c.def.couverture.etat === etat).reduce((s, c) => s + c.n, 0);
  const complete = somme('complete'), partielle = somme('partielle'), injouable = somme('injouable');
  const cartes = nl.filter(c => c.def.couverture.etat !== 'complete')
    .map(c => ({nom: c.nom, n: c.n, etat: c.def.couverture.etat, taux: c.def.couverture.taux, manuel: c.def.couverture.manuel}))
    .sort((a, b) => (a.etat === 'injouable' ? 0 : 1) - (b.etat === 'injouable' ? 0 : 1) || a.taux - b.taux);
  const archiveSansJeu = entrees.some(c => c.fiche.archiveSansJeu);
  return {n, complete, partielle, injouable, manquantes, cartes, archiveSansJeu,
    taux: n ? (complete + partielle * 0.5) / n : 1};
}

/* Un siège à partir d'une liste `[[nom, quantité]]` et de commandants. */
function siegeDepuisListe(nom, format, liste, commandants, resout = ficheParNom, comportement = comportementDe) {
  const cartes = [], manquantes = [], entrees = [], cmds = [];
  for (const [n, q] of liste) {
    const f = resout(n);
    if (!f) { manquantes.push(n); continue; }
    const def = definitionDe(f, comportement(f.nom));
    cartes.push({def, n: q});
    entrees.push({nom: f.nom, n: q, def, fiche: f});
  }
  for (const n of commandants) {
    const f = resout(n);
    if (!f) { manquantes.push(n); continue; }
    const def = definitionDe(f, comportement(f.nom));
    cmds.push(def);
    entrees.push({nom: f.nom, n: 1, def, fiche: f, cmd: true});
  }
  return {nom, format, vie: vieDuFormat(format), cartes, commandants: cmds, manquantes,
    couverture: bilanCouverture(entrees, manquantes)};
}

/* Un siège bâti sur les fiches qu'un invité a envoyées : l'hôte ne lit ni
   son `S` ni son archive, il joue les cartes telles que l'invité les connaît,
   avec les comportements que l'invité a écrits pour elles. */
function siegeDepuisFiches(nom, format, cartes, commandants, comportements) {
  const parNom = new Map();
  cartes.forEach(([f]) => parNom.set(f.nom, f));
  commandants.forEach(f => parNom.set(f.nom, f));
  const comp = n => { const c = (comportements || {})[n]; return typeof c === 'string' && c.trim() ? c : undefined; };
  return siegeDepuisListe(nom, format, cartes.map(([f, n]) => [f.nom, n]), commandants.map(f => f.nom), n => parNom.get(n) || null, comp);
}

/* Les fiches d'un deck de l'atelier, telles qu'un invité les envoie à
   l'hôte : la liste, le commandant, et les comportements écrits à la main
   pour ces cartes-là seulement. `manquantes` : ce que l'appareil ne connaît
   pas, à demander à Scryfall avant l'envoi. */
function fichesDeDeck(cle) {
  const d = S.decks[cle];
  if (!d) return null;
  const cmd = (FORMATS[d.format] || {}).commander && d.commander ? [d.commander] : [];
  const cartes = [], commandants = [], manquantes = [], comportements = {};
  const prends = n => { const f = ficheParNom(n); if (!f) manquantes.push(n); else if (comportementDe(f.nom)) comportements[f.nom] = comportementDe(f.nom); return f; };
  [...d.deck].filter(([n]) => !cmd.includes(n)).forEach(([n, q]) => { const f = prends(n); if (f) cartes.push([f, q]); });
  cmd.forEach(n => { const f = prends(n); if (f) commandants.push(f); });
  return {nom: d.nom, format: d.format, cartes, commandants, comportements, manquantes};
}

/* Le siège d'un deck de l'atelier. Son commandant ne joue comme tel que si
   le format en a un. */
function siegeDeck(cle) {
  const d = S.decks[cle];
  if (!d) return null;
  const fmtCmd = (FORMATS[d.format] || {}).commander;
  const cmd = fmtCmd && d.commander ? [d.commander] : [];
  const liste = [...d.deck].filter(([n]) => !cmd.includes(n));
  return siegeDepuisListe(d.nom, d.format, liste, cmd);
}

function siegeAdversaire(cle) {
  const a = S.adversaires[cle];
  return a ? siegeDepuisListe(a.nom, a.format, a.liste, a.commandants) : null;
}

/* Les noms qu'aucune source ne connaît encore, pour toute une table. */
function nomsManquants(cfg) {
  const noms = [];
  const d = S.decks[cfg.deck];
  if (d) [...d.deck.keys(), d.commander].filter(Boolean).forEach(n => { if (!ficheParNom(n)) noms.push(n); });
  cfg.sieges.forEach(k => {
    const a = S.adversaires[k];
    if (a) [...a.liste.map(([n]) => n), ...a.commandants].forEach(n => { if (!ficheParNom(n)) noms.push(n); });
  });
  return [...new Set(noms)];
}

/* La fiabilité d'un résultat, d'après la couverture des decks de la table :
   le deck testé compte double, puisque c'est lui qu'on juge. */
function fiabilite(couvertures) {
  if (!couvertures.length) return {niveau: 'faible', taux: 0};
  const t = (couvertures[0].taux * 2 + couvertures.slice(1).reduce((s, c) => s + c.taux, 0)) / (couvertures.length + 1);
  return {niveau: t >= 0.85 ? 'bonne' : t >= 0.65 ? 'moyenne' : 'faible', taux: t};
}

/* L'empreinte des comportements manuels qui touchent une table. */
function signatureComportements() {
  return empreinte(Object.keys(S.comportements).sort().map(k => k + '=' + S.comportements[k]).join('|'));
}
