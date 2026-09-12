/* =====================================================================
   js/archive.js — Lire l'archive Scryfall

   L'archive pèse plus de cent mégaoctets de JSON. On ne la garde pas telle
   quelle : chaque carte est réduite à un tableau de champs (`compacte()`,
   les indices sont dans `CH`, js/etat.js), et le fichier est lu en flux pour
   que la progression se voie et que la mémoire ne double pas.
   ===================================================================== */

function compacte(sc) {
  const faces = sc.card_faces && sc.card_faces.length ? sc.card_faces : null;
  const type = sc.type_line || (faces ? faces[0].type_line : '');
  if (!type || /\btoken\b|\bemblem\b/i.test(type)) return null;
  if (/^basic land/i.test(type)) return null;
  if (sc.layout && /token|emblem|art_series|double_faced_token/.test(sc.layout)) return null;
  const cost = (sc.mana_cost && sc.mana_cost.length ? sc.mana_cost : (faces ? (faces[0].mana_cost||'') : '')) || '';
  const texte = faces && !sc.oracle_text
    ? faces.map(f => (f.oracle_text||'').replace(/\n/g, ' // ')).join(' // ')
    : (sc.oracle_text||'').replace(/\n/g, ' // ');
  const pw = sc.power || (faces && faces[0] && faces[0].power);
  const tg = sc.toughness || (faces && faces[0] && faces[0].toughness);
  const lg = sc.legalities || {};
  const uris = sc.image_uris || (faces && faces[0] && faces[0].image_uris) || null;
  const versoUris = faces && faces[1] && faces[1].image_uris || null;
  const chemin = uris && uris.normal ? String(uris.normal).replace('https://cards.scryfall.io/normal/', '') : '';
  const verso = versoUris && versoUris.normal ? String(versoUris.normal).replace('https://cards.scryfall.io/normal/', '') : '';
  return [
    sc.name, cost, type, texte, sc.cmc||0, (sc.color_identity||[]).join(''),
    (pw != null && /^\d+$/.test(String(pw))) ? +pw : null,
    parseFloat((sc.prices && (sc.prices.eur || sc.prices.usd)) || 0) || 0,
    sc.id || '', (typeof sc.edhrec_rank === 'number') ? sc.edhrec_rank : 999999,
    codeLegalite(lg) || '', chemin, verso,
    (tg != null && /^\d+$/.test(String(tg))) ? +tg : null,
    sc.artist || (faces && faces[0] && faces[0].artist) || '',
    String(sc.set || '').toUpperCase(),
    /* Carte qui n'existe que sous forme numérique : Alchemy, rééquilibrages
       Arena, exclusivités MTGO. On ne peut pas les posséder sur papier. */
    (sc.digital || (Array.isArray(sc.games) && !sc.games.includes('paper'))) ? 1 : 0
  ];
}

const CDN = 'https://cards.scryfall.io/';

function autoCatalogue() {
  if (typeof fetch !== 'function' || typeof indexedDB === 'undefined') return false;
  if (!S.catalogueActif) return false;
  if (saveState === 'desactive') return false;
  const co = (typeof navigator !== 'undefined') && navigator.connection;
  if (co && (co.saveData || /(^|-)2g$/.test(co.effectiveType || ''))) return false;
  return true;
}

const FICHIERS_LOCAUX = [
  'oracle-cards.jsonl.gz', 'oracle-cards.json.gz', 'oracle-cards.jsonl', 'oracle-cards.json',
  'default-cards.jsonl.gz', 'default-cards.json.gz', 'all-cards.jsonl.gz', 'scryfall.jsonl.gz'
];

function estGzip(nom, octets) {
  if (/\.gz$/i.test(nom || '')) return true;
  return !!(octets && octets[0] === 0x1f && octets[1] === 0x8b);
}

/* Compte les octets qui passent, sans rien retenir : c'est ce qui permet
   d'annoncer un vrai pourcentage sans garder l'archive en mémoire. */
function compteurOctets(onOctets) {
  let n = 0;
  return new TransformStream({
    transform(bloc, ctrl) {
      n += (bloc && (bloc.byteLength || bloc.length)) || 0;
      onOctets(n);
      ctrl.enqueue(bloc);
    }
  });
}

/* L'avancement d'un chargement d'archive, tel que la boîte de progression le
   lit. Les totaux viennent de `verifierMajCatalogue()` — Scryfall publie la
   taille compressée et la taille brute — ou de la taille du fichier choisi ;
   quand ils manquent, la barre affiche un compte sans pourcentage. */
function nouveauSuivi(source, totalRecu, totalExtrait) {
  let dernier = 0;
  return {
    source, recu:0, extrait:0, cartes:0, phase:'telechargement',
    totalRecu: totalRecu || 0, totalExtrait: totalExtrait || 0,
    abandon: false,
    /* Rafraîchir à chaque bloc serait du gaspillage : dix fois par seconde
       suffit largement à l'œil. */
    avance(force) {
      const t = Date.now();
      if (!force && t - dernier < 100) return;
      dernier = t;
      if (typeof majBoiteCatalogue === 'function') majBoiteCatalogue();
    }
  };
}

async function fluxTexte(source, nom, suivi) {
  let flux = source.stream ? source.stream() : source.body;
  let gz = /\.gz$/i.test(nom || '');
  if (!gz && source.slice) {
    const tete = new Uint8Array(await source.slice(0, 2).arrayBuffer());
    gz = estGzip(nom, tete);
    flux = source.stream();
  }
  if (suivi) flux = flux.pipeThrough(compteurOctets(n => {
    suivi.recu = n;
    if (!gz) suivi.extrait = n;   // rien à décompresser : c'est le même flot
    suivi.avance();
  }));
  if (gz) {
    if (typeof DecompressionStream === 'undefined')
      throw new Error('ce navigateur ne sait pas décompresser le .gz ; fournissez le fichier décompressé');
    flux = flux.pipeThrough(new DecompressionStream('gzip'));
    if (suivi) flux = flux.pipeThrough(compteurOctets(n => { suivi.extrait = n; suivi.avance(); }));
  }
  return flux.pipeThrough(new TextDecoderStream());
}

/* Réunit deux listes de codes d'édition, sans doublon. */
function fusionneSets(a, b) {
  if (!a) return b || '';
  if (!b) return a;
  const out = new Set(String(a).split(','));
  String(b).split(',').forEach(c => { if (c) out.add(c); });
  return [...out].filter(Boolean).join(',');
}

/* Les impressions d'une même carte se fondent en une seule ligne — la mieux
   classée — mais leurs codes d'édition s'y accumulent. Une archive par
   impressions (default-cards) donne ainsi la liste complète des sets d'une
   carte, sans le moindre appel réseau ; oracle-cards, qui n'en publie qu'une
   par carte, n'en donne qu'un, et Scryfall complète à la demande. */
function retiens(par, rec) {
  const cle = norm(rec[CH.NOM]);
  const ancien = par.get(cle);
  if (!ancien) { par.set(cle, rec); return; }
  const sets = fusionneSets(ancien[CH.SET], rec[CH.SET]);
  const mieux = (rec[CH.RANG] < ancien[CH.RANG]) ||
              (rec[CH.RANG] === ancien[CH.RANG] && rec[CH.PRIX] > 0 && ancien[CH.PRIX] <= 0);
  if (mieux) par.set(cle, rec);
  par.get(cle)[CH.SET] = sets;
}

function tailleEstimee(cartes) {
  if (!cartes.length) return 0;
  const pas = Math.max(1, Math.floor(cartes.length / 300));
  let somme = 0, n = 0;
  for (let i = 0; i < cartes.length; i += pas) { somme += JSON.stringify(cartes[i]).length; n++; }
  return Math.round(somme / n * cartes.length);
}

/* Levée quand l'utilisateur interrompt : ce n'est pas une panne, et l'appelant
   la distingue d'une erreur. */
function ArchiveAbandonnee() { const e = new Error('chargement interrompu'); e.abandon = true; return e; }

async function lireCatalogueFichier(source, nom, suivi) {
  CAT.etat = 'chargement'; CAT.source = suivi && suivi.source === 'réseau' ? 'réseau' : 'fichier';
  CAT.detail = ''; CAT.partiel = false; renderSuggestions();
  const par = new Map();
  const cartes = {get length(){ return par.size; }, push(rec){ retiens(par, rec); }};
  let impressions = 0, reste = '', tableau = null, lus = 0;
  /* La lecture pose ses lots dans `CAT.cartes` au fur et à mesure, pour que
     l'atelier montre déjà quelque chose. Renoncer doit donc rendre l'archive
     telle qu'elle était, et non laisser une moitié de catalogue. */
  const avant = CAT.cartes;
  const lecteur = (await fluxTexte(source, nom, suivi)).getReader();
  const renonce = async () => {
    await lecteur.cancel().catch(() => {});
    CAT.cartes = avant;
    throw ArchiveAbandonnee();
  };
  if (suivi) { suivi.phase = 'extraction'; suivi.avance(true); }
  while (true) {
    if (suivi && suivi.abandon) await renonce();
    const {done, value} = await lecteur.read();
    if (done) break;
    reste += value;
    if (tableau === null) tableau = /^\s*\[/.test(reste.slice(0, 64));
    if (tableau) continue;
    let i;
    while ((i = reste.indexOf('\n')) >= 0) {
      const ligne = reste.slice(0, i).trim().replace(/,$/, '');
      reste = reste.slice(i + 1);
      if (ligne.length < 2 || ligne === '[' || ligne === ']') continue;
      try { const c = compacte(JSON.parse(ligne)); if (c) { cartes.push(c); impressions++; } } catch(e) {}
      if (++lus % 25000 === 0) {
        CAT.cartes = [...par.values()];
        if (suivi) { suivi.cartes = par.size; suivi.avance(true); }
        renderSuggestions();
        await new Promise(r => setTimeout(r, 0));
        if (suivi && suivi.abandon) await renonce();
      }
    }
  }
  if (tableau) {
    const brut = JSON.parse(reste);
    brut.forEach(sc => { const c = compacte(sc); if (c) { cartes.push(c); impressions++; } });
  } else {
    const fin = reste.trim().replace(/[,\]]$/, '');
    if (fin.length > 2) { try { const c = compacte(JSON.parse(fin)); if (c) { cartes.push(c); impressions++; } } catch(e) {} }
  }
  if (!par.size) throw new Error('aucune carte lisible dans ce fichier');
  CAT.cartes = [...par.values()];
  CAT.etat = 'ok';
  CAT.date = Date.now();
  CAT.maj = CAT.maj || null;
  appliqueCatalogueAuxCartes();
  CAT.octets = tailleEstimee(CAT.cartes);
  CAT.impressions = impressions;
  if (suivi) { suivi.phase = 'fini'; suivi.cartes = CAT.cartes.length; suivi.avance(true); }
  invaliderCandidats();
  if (saveState !== 'desactive' && S.catalogueActif)
    idbEcrire('cartes', {v:4, cartes:CAT.cartes, maj:CAT.maj, date:CAT.date, octets:CAT.octets, impressions}).catch(() => {});
  recalculerAvecProgression(`L'archive Scryfall vient d'être chargée (${CAT.cartes.length.toLocaleString('fr-FR')} cartes) : les candidates sont bâties, puis notées.`);
  toast(`${CAT.cartes.length.toLocaleString('fr-FR')} cartes retenues${
    impressions > CAT.cartes.length ? ` sur ${impressions.toLocaleString('fr-FR')} impressions lues` : ''}.`);
  return true;
}
