/* =====================================================================
   js/collectionDates.js — Les dates d'ajout des cartes de la collection

   `S.collection` dit combien d'exemplaires on possède ; `S.collectionDates`
   dit quand ils sont venus : nom de carte -> `[[date, n], …]`, du plus
   ancien au plus récent, la date au format `AAAA-MM-JJ`. Un jour où l'on
   ajoute deux exemplaires fait une entrée `[date, 2]`, non deux.

   Les dates ne couvrent pas forcément tous les exemplaires : une collection
   saisie avant leur existence n'en porte aucune, et l'on ne les invente pas.
   La somme des `n` d'une carte reste donc **au plus** sa quantité ; l'écart
   se lit « date inconnue ». Toute écriture dans la collection passe par les
   fonctions d'ici, pour que les deux tables ne se contredisent pas — un
   retrait ôte les exemplaires les plus récents, et une carte qui sort emporte
   ses dates.
   ===================================================================== */

function dateDuJour() {
  const d = new Date(), z = n => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${z(d.getMonth() + 1)}-${z(d.getDate())}`;
}

const DATE_VALIDE = /^\d{4}-\d{2}-\d{2}$/;

/* Les dates d'une carte, copiées : `[[date, n], …]`. */
function datesDe(nom) {
  return (S.collectionDates.get(nom) || []).map(x => x.slice());
}

/* Les exemplaires dont on connaît la date. */
function nbDates(nom) {
  return (S.collectionDates.get(nom) || []).reduce((t, [, n]) => t + n, 0);
}

/* Remettre les dates d'une carte d'accord avec sa quantité : celles de trop,
   les plus récentes d'abord, sont ôtées ; une carte qui n'est plus en
   collection n'a plus de date. */
function ajusteDates(nom) {
  const q = S.collection.get(nom) || 0, l = S.collectionDates.get(nom);
  if (!l) return;
  let trop = nbDates(nom) - q;
  while (trop > 0 && l.length) {
    const dern = l[l.length - 1], ote = Math.min(dern[1], trop);
    dern[1] -= ote; trop -= ote;
    if (!dern[1]) l.pop();
  }
  if (!l.length) S.collectionDates.delete(nom);
}

/* Ajouter `q` exemplaires, venus à `date` (aujourd'hui par défaut). */
function ajouteACollection(nom, q = 1, date = dateDuJour()) {
  if (!(q > 0)) return;
  S.collection.set(nom, (S.collection.get(nom) || 0) + q);
  const l = S.collectionDates.get(nom) || [];
  const e = l.find(x => x[0] === date);
  if (e) e[1] += q; else { l.push([date, q]); l.sort((a, b) => a[0] < b[0] ? -1 : a[0] > b[0] ? 1 : 0); }
  S.collectionDates.set(nom, l);
}

/* Retirer `q` exemplaires, les plus récents d'abord. Le dernier retire la carte. */
function retireDeCollection(nom, q = 1) {
  const n = S.collection.get(nom) || 0;
  if (!n) return;
  if (n <= q) S.collection.delete(nom); else S.collection.set(nom, n - q);
  ajusteDates(nom);
}

/* Supprimer la carte de la collection, tous exemplaires et toutes dates. */
function supprimeDeCollection(nom) {
  S.collection.delete(nom);
  S.collectionDates.delete(nom);
}

/* Vider la collection, ses dates avec. */
function videCollection() {
  S.collection.clear();
  S.collectionDates.clear();
}

/* Une carte change de nom (fusion avec sa version canonique) : ses dates suivent. */
function deplaceDates(de, vers) {
  const l = S.collectionDates.get(de);
  S.collectionDates.delete(de);
  if (!l) return;
  const cible = S.collectionDates.get(vers) || [];
  l.forEach(([d, n]) => { const e = cible.find(x => x[0] === d); if (e) e[1] += n; else cible.push([d, n]); });
  cible.sort((a, b) => a[0] < b[0] ? -1 : a[0] > b[0] ? 1 : 0);
  S.collectionDates.set(vers, cible);
  ajusteDates(vers);
}

/* Relire des dates enregistrées : ce qui n'a pas la forme attendue est écarté,
   et rien ne dépasse la quantité. */
function restaureDates(brut) {
  const m = new Map();
  (Array.isArray(brut) ? brut : []).forEach(([nom, l]) => {
    if (!S.collection.has(nom) || !Array.isArray(l)) return;
    const bons = l.filter(x => Array.isArray(x) && DATE_VALIDE.test(x[0]) && x[1] > 0).map(x => [x[0], Math.floor(x[1])]);
    if (bons.length) m.set(nom, bons.sort((a, b) => a[0] < b[0] ? -1 : a[0] > b[0] ? 1 : 0));
  });
  S.collectionDates = m;
  [...m.keys()].forEach(ajusteDates);
}

/* « 12/11/2026 » */
function dateFr(d) {
  const [a, m, j] = d.split('-');
  return `${j}/${m}/${a}`;
}

/* Ce que la ligne et la vignette disent : la première date, et combien d'autres. */
function resumeDates(nom) {
  const l = S.collectionDates.get(nom) || [];
  if (!l.length) return '';
  return dateFr(l[0][0]) + (l.length > 1 ? ` (+${l.length - 1})` : '');
}

/* Le détail, pour l'infobulle et la fiche : une ligne par date. */
function detailDates(nom) {
  const q = S.collection.get(nom) || 0, l = S.collectionDates.get(nom) || [];
  const lignes = l.map(([d, n]) => `${n} ex. le ${dateFr(d)}`);
  const inconnus = q - nbDates(nom);
  if (inconnus > 0) lignes.push(`${inconnus} ex. à date inconnue`);
  return lignes;
}

/* La date la plus récente d'une carte, ou '' : sert au tri. */
function derniereDate(nom) {
  const l = S.collectionDates.get(nom);
  return l && l.length ? l[l.length - 1][0] : '';
}

/* Fusionner les dates de deux appareils (js/nuageFusion.js) : pour chaque
   date, le plus grand nombre vu d'un côté ou de l'autre — une même date
   n'est pas additionnée, puisque c'est le plus souvent le même ajout, déjà
   synchronisé —, puis rien au-delà de la quantité retenue. */
function fusionneDates(local, distant, valeurs) {
  const q = new Map(valeurs), l = new Map(local || []), d = new Map(distant || []), out = [];
  q.forEach((qte, nom) => {
    const t = new Map();
    [l.get(nom) || [], d.get(nom) || []].forEach(liste => liste.forEach(([date, n]) => t.set(date, Math.max(t.get(date) || 0, n))));
    const liste = [...t].sort((a, b) => a[0] < b[0] ? -1 : a[0] > b[0] ? 1 : 0).map(x => [x[0], x[1]]);
    let trop = liste.reduce((s, x) => s + x[1], 0) - qte;
    while (trop > 0 && liste.length) {
      const dern = liste[liste.length - 1], ote = Math.min(dern[1], trop);
      dern[1] -= ote; trop -= ote;
      if (!dern[1]) liste.pop();
    }
    if (liste.length) out.push([nom, liste]);
  });
  return out;
}
