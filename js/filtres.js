/* =====================================================================
   js/filtres.js — Les critères de la fenêtre « Filtres »

   Les rôles cochés dans la section Deck, les champs texte et les bornes
   chiffrées. Un filtre posé une fois vaut partout : `carteFiltree()` filtre la
   collection, le deck et sa courbe, les statistiques, le graphe et les
   propositions.
   ===================================================================== */

/* Rôles cochés dans la section Deck, conservés comme les archétypes. */
function rolesFiltre() {
  return String((S.filtres && S.filtres.roles) || '').split(',').filter(Boolean);
}

function basculerRole(role) {
  if (!role) { S.filtres.roles = ''; return; }
  const sel = new Set(rolesFiltre());
  if (sel.has(role)) sel.delete(role); else sel.add(role);
  S.filtres.roles = [...sel].join(',');
}

/* Une carte tient au moins un des rôles cochés. */
function roleOK(card) {
  const roles = rolesFiltre();
  if (!roles.length) return true;
  return !!card && !!card.cats && roles.some(r => card.cats.has(r));
}

function nombreFiltre(v) {
  if (v === '' || v === null || v === undefined) return null;
  const n = parseFloat(String(v).replace(',', '.'));
  return isNaN(n) ? null : n;
}

function reinitFiltres() {
  S.filtres = {...FILTRES_VIDE};
}

/* Écrit un champ de la fenêtre dans l'état. */
function majFiltre(cle, valeur) {
  if (cle in FILTRES_VIDE) S.filtres[cle] = valeur;
}

/* Efface un filtre depuis sa puce dans l'en-tête. */
function effacerFiltre(cles) {
  (cles || []).forEach(k => majFiltre(k, ''));
}

/* Filtres en vigueur : un libellé et les clés à effacer pour chacun.
   Sert au décompte, aux puces de l'en-tête et aux infobulles. */
function filtresActifs() {
  const f = S.filtres || FILTRES_VIDE;
  const actifs = [];
  const nom = String(f.nom || '').trim();
  if (nom) actifs.push({cles:['nom'], texte:`Nom « ${nom} »`});
  const type = String(f.type || '').trim();
  if (type) actifs.push({cles:['type'], texte:`Type « ${type} »`});
  const sets = setsFiltre();
  if (sets.length) actifs.push({cles:['sets'],
    texte:`Set${sets.length > 1 ? 's' : ''} : ${sets.map(libelleSet).join(', ')}`});
  const texte = String(f.texte || '').trim();
  if (texte) actifs.push({cles:['texte'], texte:`Texte « ${texte} »`});
  const arch = archetypesFiltre();
  if (arch.length) actifs.push({cles:['archetypes'],
    texte:`Archétype${arch.length > 1 ? 's' : ''} : ${arch.map(libelleArchetype).join(', ')}`});
  const roles = rolesFiltre();
  if (roles.length) actifs.push({cles:['roles'],
    texte:`Rôle${roles.length > 1 ? 's' : ''} : ${roles.map(r => CATLABEL[r] || r).join(', ')}`});
  FILTRES_BORNES.forEach(([kMin, kMax, champ, label]) => {
    const min = nombreFiltre(f[kMin]), max = nombreFiltre(f[kMax]);
    if (min === null && max === null) return;
    const unite = champ === 'price' ? ' €' : '';
    const texte = (min !== null && max !== null) ? `${label} ${min}${unite} → ${max}${unite}`
      : (min !== null ? `${label} ≥ ${min}${unite}` : `${label} ≤ ${max}${unite}`);
    actifs.push({cles:[kMin, kMax], texte});
  });
  const artiste = String(f.artiste || '').trim();
  if (artiste) actifs.push({cles:['artiste'], texte:`Illustrateur « ${artiste} »`});
  return actifs;
}

/* Libellés seuls, pour les infobulles et les phrases de résumé. */
function texteFiltresActifs(sep) {
  return filtresActifs().map(a => a.texte).join(sep || ' · ');
}

/* Prédicat unique de l'atelier : couleurs, rôles et critères de la
   fenêtre. Il vaut pour la collection, le deck, la courbe de mana et
   les suggestions, afin qu'un filtre posé une fois vaille partout. */
function carteFiltree(card) {
  return !!card && colorOK(card) && roleOK(card) && filtreOK(card);
}

/* Une valeur peut être donnée telle quelle ou par une fonction, pour que
   les critères coûteux — sets, archétypes, type développé — ne soient
   calculés que si le filtre correspondant est posé. */
function valeurFiltre(x, vide) {
  return (typeof x === 'function' ? x() : x) || vide;
}

/* Le noyau des critères de la fenêtre, sur des valeurs plutôt que sur une
   carte : la collection y arrive par `filtreOK(card)`, le catalogue par
   `filtreOKRec(rec)`, sans que les comparaisons soient écrites deux fois.
   Une valeur inconnue (créature non renseignée, prix absent) écarte la
   carte dès qu'une borne est posée sur ce critère. */
/* Chaque mot de la saisie doit se retrouver dans la valeur, dans n'importe
   quel ordre. Cherchés d'un seul bloc, « Legendary creature » écartait
   « Legendary Enchantment Creature — God », « Legendary Artifact Creature »
   et « Legendary Snow Creature » : le mot intercalé rompait la chaîne, et
   l'on perdait sans le savoir une partie de ses créatures légendaires. */
function motsFiltre(valeur, saisie, cle) {
  const mots = String(saisie).trim().split(/\s+/).map(m => cle(m)).filter(Boolean);
  if (!mots.length) return true;
  const v = cle(valeur);
  return mots.every(m => v.includes(m));
}

function filtresValeursOK(v) {
  const f = S.filtres || FILTRES_VIDE;
  const nom = String(f.nom || '').trim();
  if (nom && !motsFiltre(valeurFiltre(v.name, ''), nom, norm)) return false;
  const type = String(f.type || '').trim();
  if (type && !motsFiltre(valeurFiltre(v.type, ''), type, loose)) return false;
  const sets = setsFiltre();
  if (sets.length) {
    const ceux = valeurFiltre(v.sets, []);
    if (!sets.some(c => ceux.includes(c))) return false;
  }
  const texte = String(f.texte || '').trim();
  if (texte && !motsFiltre(valeurFiltre(v.text, ''), texte, norm)) return false;
  const artiste = String(f.artiste || '').trim();
  if (artiste && !motsFiltre(valeurFiltre(v.artist, ''), artiste, loose)) return false;
  const arch = archetypesFiltre();
  if (arch.length) {
    const ceux = valeurFiltre(v.archetypes, []);
    if (!arch.some(id => ceux.includes(id))) return false;
  }
  for (const [kMin, kMax, champ] of FILTRES_BORNES) {
    const min = nombreFiltre(f[kMin]), max = nombreFiltre(f[kMax]);
    if (min === null && max === null) continue;
    const val = v[champ];
    if (typeof val !== 'number' || isNaN(val)) return false;
    if (min !== null && val < min) return false;
    if (max !== null && val > max) return false;
  }
  return true;
}
