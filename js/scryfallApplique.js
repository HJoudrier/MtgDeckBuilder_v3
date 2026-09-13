/* =====================================================================
   js/scryfallApplique.js — Verser une réponse de Scryfall dans une carte

   La réponse est plus riche que ce que l'atelier garde : on n'en retient que
   ce qui sert, et l'on respecte ce que l'utilisateur a choisi — une
   illustration mise en avant n'est pas remplacée par la première venue, mais
   seulement par une réponse portant sur cette impression-là.
   ===================================================================== */

function scryTarget(sc, map) {
  const keys = [sc.name, frontFace(sc.name)];
  if (sc.card_faces) sc.card_faces.forEach(f => keys.push(f.name));
  for (const k of keys) {
    if (!k) continue;
    const c = BY_NAME[norm(k)] || LOOSE[loose(k)] || FRONT[loose(k)] || (map && (map.get(norm(k)) || map.get(loose(k))));
    if (c) return c;
  }
  return null;
}

function applyScryfall(sc, requested, imagesOnly) {
  const faces = sc.card_faces && sc.card_faces.length ? sc.card_faces : null;
  const cost = (sc.mana_cost && sc.mana_cost.length ? sc.mana_cost : (faces ? (faces[0].mana_cost||'') : '')) || '—';
  const type = sc.type_line || (faces ? faces[0].type_line : 'Inconnu');
  const text = faces && !sc.oracle_text
    ? faces.map(f => (f.oracle_text||'').replace(/\n/g, ' // ')).join(' // ')
    : (sc.oracle_text||'').replace(/\n/g, ' // ');
  const pr = sc.prices || {};
  const price = parseFloat(pr.eur || pr.eur_foil || pr.usd || 0) || 0;
  const uris = sc.image_uris || (faces && faces[0] && faces[0].image_uris) || null;
  const versoUris = faces && faces[1] && faces[1].image_uris || null;
  /* La légalité d'une carte que l'archive ne connaît pas — une carte importée,
     par exemple — ne peut venir que d'ici. */
  const legal = codeLegalite(sc.legalities);
  let target = (requested && typeof requested === 'object')
    ? requested
    : (BY_NAME[norm(sc.name)] || LOOSE[loose(sc.name)] || (requested ? find(requested) : null));

  if (target && (imagesOnly || !target.unknown)) {
    /* Ce qui change la note de la carte, par opposition aux visuels et aux
       adresses : c'est cela seul que `MAJ_CARTES` compte, et cela seul qui
       périme la sélection des suggestions. Une réponse qui n'apporte qu'une
       illustration — le cas le plus courant, la file des visuels tournant
       sans cesse — ne doit rien faire recalculer. */
    let fond = false;
    fond = majTexteOracle(target, text) || fond;
    completeImpression(target, sc);
    if (Array.isArray(sc.color_identity) && !/^basic land/i.test(target.type || '')) {
      const avant = (target.identity || []).join('');
      if (avant !== sc.color_identity.join('')) {
        target.identity = sc.color_identity.slice();
        fond = true;
      }
    }
    if (typeof sc.cmc === 'number' && target.cmc !== sc.cmc) { target.cmc = sc.cmc; fond = true; }
    /* Une illustration choisie à la main fait autorité : seule une réponse
       portant sur cette impression-là peut la remplacer. */
    const cleRep = cleImpression(sc.set, sc.collector_number);
    if (uris && (!target.impressionChoisie || target.impressionChoisie === cleRep)) {
      target.img = uris.small || uris.normal;
      target.imgN = uris.normal || uris.large || target.img;
      target.imgL = uris.large || uris.png || target.imgN;
      target.imgImpression = cleRep;
    }
    if (versoUris) {
      target.imgB = versoUris.normal || versoUris.small;
      target.imgBL = versoUris.large || target.imgB;
    }
    if (sc.purchase_uris && sc.purchase_uris.cardmarket) target.cmUrl = sc.purchase_uris.cardmarket;
    if (pr.eur) {
      const eurVal = parseFloat(pr.eur) || target.price;
      if (target.price !== eurVal) { target.price = eurVal; fond = true; }
    }
    const pw = sc.power || (faces && faces[0] && faces[0].power);
    if (pw != null && /^\d+$/.test(String(pw)) && target.force !== +pw) {
      target.force = +pw;
      reanalyser(target);
      fond = true;
    }
    const tg = sc.toughness || (faces && faces[0] && faces[0].toughness);
    if (tg != null && /^\d+$/.test(String(tg)) && target.endurance !== +tg) {
      target.endurance = +tg;
      fond = true;
    }
    const art = sc.artist || (faces && faces[0] && faces[0].artist);
    if (art) target.artist = art;
    if (legal !== undefined && target.legal !== legal) { target.legal = legal; fond = true; }
    if (fond) MAJ_CARTES++;
    return true;
  }

  const fresh = buildCard(sc.name, cost, type, price, text);
  fresh.textFull = !!text;
  if (Array.isArray(sc.color_identity)) fresh.identity = sc.color_identity.slice();
  if (typeof sc.cmc === 'number') fresh.cmc = sc.cmc;
  const pw = sc.power || (faces && faces[0] && faces[0].power);
  if (pw != null && /^\d+$/.test(String(pw))) fresh.force = +pw;
  const tg = sc.toughness || (faces && faces[0] && faces[0].toughness);
  if (tg != null && /^\d+$/.test(String(tg))) fresh.endurance = +tg;
  const art = sc.artist || (faces && faces[0] && faces[0].artist);
  if (art) fresh.artist = art;
  if (legal !== undefined) fresh.legal = legal;
  reanalyser(fresh);

  if (!target) {
    completeImpression(fresh, sc);
    if (uris) {
      fresh.img = uris.small || uris.normal;
      fresh.imgN = uris.normal || uris.large || fresh.img;
      fresh.imgL = uris.large || uris.png || fresh.imgN;
      fresh.imgImpression = cleImpression(sc.set, sc.collector_number);
    }
    if (versoUris) {
      fresh.imgB = versoUris.normal || versoUris.small;
      fresh.imgBL = versoUris.large || fresh.imgB;
    }
    if (sc.purchase_uris && sc.purchase_uris.cardmarket) fresh.cmUrl = sc.purchase_uris.cardmarket;
    registerCard(fresh);
    return true;
  }

  const edImportee = target.setImporte ? {set:target.set, num:target.num} : null;
  target = renameCard(target, sc.name);
  Object.assign(target, fresh, {name:target.name});
  if (edImportee) { target.set = edImportee.set; target.num = edImportee.num; target.setImporte = true; }
  completeImpression(target, sc);
  if (uris) {
    target.img = uris.small || uris.normal;
    target.imgN = uris.normal || uris.large || target.img;
    target.imgL = uris.large || uris.png || target.imgN;
    target.imgImpression = cleImpression(sc.set, sc.collector_number);
  }
  if (versoUris) {
    target.imgB = versoUris.normal || versoUris.small;
    target.imgBL = versoUris.large || target.imgB;
  }
  if (sc.purchase_uris && sc.purchase_uris.cardmarket) target.cmUrl = sc.purchase_uris.cardmarket;
  target.unknown = false;
  return true;
}
