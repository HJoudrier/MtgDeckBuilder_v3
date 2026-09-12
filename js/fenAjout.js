/* =====================================================================
   js/fenAjout.js — Ajouter une carte à la main

   Une recherche qui interroge d'abord la base connue, puis Scryfall si rien ne
   vient. Le résultat se range où l'on veut : la collection, le deck, la
   réserve, l'étude.
   ===================================================================== */

function ajouterCarte(c, q, cible, completer) {
  if (ANNEXES[cible]) {
    versAnnexe(c.name, cible, q);
    return;
  }
  if (cible === 'deck') {
    const n = deckAdd(c, q, {completer});
    recalculerAvecProgression(`${c.name} ajoutée au deck : les suggestions sont renotées d'après le deck qui vient de changer.`);
    toast(n ? `${c.name} ×${n} ajoutée(s) au deck.` : `${c.name} : limite de ${fmt().maxCopies} copie(s) atteinte.`);
  } else {
    S.collection.set(c.name, (S.collection.get(c.name) || 0) + q);
    recalculerAvecProgression(`${c.name} ajoutée à la collection : les suggestions en tiennent compte.`);
    toast(`${c.name} ×${q} ajoutée(s) à la collection.`);
  }
}

function chercheCartes(q) {
  const t = norm(q);
  if (t.length < 2) return [];
  const debut = [], dedans = [];
  const noeuds = noeudsActifs();
  const vu = new Set();

  if (typeof CAT !== 'undefined' && CAT.cartes && CAT.cartes.length > 0) {
    for (const rec of CAT.cartes) {
      const nom = rec[CH.NOM];
      const n = norm(nom);
      const isDeb = n.startsWith(t);
      const isDed = !isDeb && n.includes(t);
      if (!isDeb && !isDed) continue;
      const id = rec[CH.ID_COUL] ? String(rec[CH.ID_COUL]).split('') : [];
      if (!colorOK({identity: id})) continue;
      if (noeuds.length && !recToucheNoeuds(rec, noeuds)) continue;
      const card = getCardOrAnalyzedRec(rec);
      vu.add(card.name);
      if (isDeb) debut.push(card); else dedans.push(card);
      if (debut.length + dedans.length > 300) break;
    }
  } else {
    for (const c of DB) {
      if (!colorOK(c)) continue;
      if (noeuds.length && !carteTouche(c, noeuds)) continue;
      const n = norm(c.name);
      if (n.startsWith(t)) debut.push(c);
      else if (n.includes(t)) dedans.push(c);
      if (debut.length + dedans.length > 300) break;
    }
  }
  const tri = (a, b) => a.name.localeCompare(b.name);
  return [...debut.sort(tri), ...dedans.sort(tri)].slice(0, 14);
}

function resultatsHTML(q, cible) {
  const res = chercheCartes(q);
  const cols = [...S.colors].join('') || 'aucune';
  const noeuds = noeudsActifs();
  const effTxt = noeuds.length ? ` et effets (${noeuds.map(n => (typeof NODE !== 'undefined' && NODE[n] && NODE[n].label) || n).join(', ')})` : '';
  if (norm(q).length < 2)
    return `<div class="small muted">Tapez au moins deux lettres du nom. Seules les cartes compatibles avec les couleurs choisies dans la fenêtre des filtres (${esc(cols)})${effTxt} sont proposées.</div>`;
  const enLigne = [...scryRes.values()].filter(sc => { const c = find(sc.name); return !c || c.unknown; });
  const blocLigne = (() => {
    if (scryEtat === 'chargement') return `<div class="small muted" style="margin-top:8px">Recherche sur Scryfall…</div>`;
    if (scryEtat === 'hors-ligne') return `<div class="small muted" style="margin-top:8px">Recherche en ligne indisponible : seules les cartes déjà connues de l'atelier sont proposées.</div>`;
    if (!enLigne.length) return '';
    return `<div class="small muted" style="margin:10px 0 4px">Trouvées sur Scryfall, absentes de votre catalogue :</div>
      <div class="list">${enLigne.map(sc => `
        <button type="button" class="lrow" style="text-align:left" data-act="addScry" data-name="${esc(sc.name)}" data-cible="${cible}">
          <span class="cname">${esc(sc.name)}</span>
          <span class="mono small muted" style="margin-left:auto">0 en collection</span>
        </button>`).join('')}</div>`;
  })();

  if (!res.length)
    return `<div class="small muted">${enLigne.length || scryEtat === 'chargement'
      ? `Aucune carte de votre catalogue ne correspond dans les couleurs ${esc(cols)}${effTxt}.`
      : `Aucune carte ne correspond dans les couleurs ${esc(cols)}${effTxt}. Élargissez les filtres.`}</div>${blocLigne}`;

  return `<div class="small muted" style="margin-bottom:4px">${res.length} résultat(s) · couleurs ${esc(cols)}${effTxt}</div>
    <div class="list">${res.map(c => {
      const poss = S.collection.get(c.name) || 0;
      return `<button type="button" class="lrow" style="text-align:left" data-act="addPick" data-name="${esc(c.name)}" data-cible="${cible}">
        <span class="cname" data-card-name="${esc(c.name)}">${esc(c.name)}</span>
        <span class="mono small ${poss?'':'muted'}" style="margin-left:auto">${poss} en collection</span>
      </button>`;
    }).join('')}</div>${blocLigne}`;
}

function majResultats(cible, sansRelancer) {
  const champ = document.getElementById('addN');
  const z = document.getElementById('addRes');
  if (z && champ) z.innerHTML = resultatsHTML(champ.value, cible);
  if (sansRelancer || !champ) return;
  clearTimeout(scryTimer);
  const q = champ.value;
  if (norm(q).length < 3) { scryRes = new Map(); scryEtat = ''; }
  scryTimer = setTimeout(() => chercheScryfall(q, cible), 350);
}

function openAdd(cible) {
  const versDeck = cible === 'deck';
  const annexe = ANNEXES[cible];
  scryRes = new Map();
  scryEtat = '';
  clearTimeout(scryTimer);
  openDialog(annexe ? `Ajouter une carte à ${annexe.article}`
    : versDeck ? 'Ajouter une carte au deck' : 'Ajouter une carte à la collection',
    `<div class="row" style="align-items:flex-end">
       <div class="field" style="flex:1;min-width:180px"><label class="lab" for="addN">Rechercher</label>
         <input id="addN" type="text" data-recherche="${cible}" placeholder="nom de la carte…" autocomplete="off"></div>
       <div class="field"><label class="lab" for="addQ">Exemplaires</label>
         <input id="addQ" type="number" min="1" value="1" style="width:90px"></div>
     </div>
     ${versDeck ? `<label class="row small" style="gap:6px"><input type="checkbox" id="addStock"> Ajouter aussi à la collection (sinon la carte est comptée à l'achat)</label>` : ''}
     ${annexe ? `<div class="small muted">${esc(annexe.aide)} Une carte posée ici quitte le deck s'il la portait : les trois listes s'excluent.</div>` : ''}
     <div id="addRes">${resultatsHTML('', cible)}</div>`,
    '<button class="btn" value="cancel">Fermer</button>', true);
}
