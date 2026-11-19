/* =====================================================================
   p4-theatre.js — Piste 4 : le théâtre

   La partie mise en scène. Le champ de bataille est un tapis vu en légère
   perspective. Ce qui se joue monte au centre, sous un projecteur, et le
   reste s'assombrit : un sort lancé, une carte qu'on veut lire avant de
   la jouer. On décide sous la carte, là où on la regarde. Les tours
   s'annoncent, les attaquants avancent, les coups font trembler la table,
   les créatures détruites se brisent.
   ===================================================================== */

/* Ce que le projecteur éclaire : la carte qu'on examine, ou la pile. */
function projecteur4(K) {
  const E = K.E;
  if (UI.apercu && !E.pile.length) {
    const o = Scene.obj(UI.apercu), jou = K.jou.has(o.id), c = Scene.def(o);
    return `<div class="p4-proj"><div class="p4-nuit" data-act="reprendre"></div><div class="p4-scene-pile">
      ${carteHTML(o, K, {classe: 'p4-vedette', act: 'reprendre'})}</div>
      <div class="p4-legende"><b>${esc(c.nom)}</b><span>${esc(c.type)}</span>${c.texte ? `<p>${esc(c.texte)}</p>` : ''}
      ${jou ? '' : `<p class="p4-raison">${esc(Scene.pourquoiPas(o.id))}</p>`}</div>
      <div class="p4-choix">${jou ? `<button type="button" class="p4-b fort" data-act="jouer">${c.terrain ? 'Poser' : 'Lancer'}</button>` : ''}
        <button type="button" class="p4-b" data-act="reprendre">Reprendre</button></div></div>`;
  }
  if (!E.pile.length || UI.repondre) return '';
  const h = Scene.obj(E.pile[E.pile.length - 1]), c = Scene.def(h);
  const dessous = E.pile.slice(0, -1).map((id, i) => carteHTML(Scene.obj(id), K, {classe: 'p4-dessous', style: `--i:${i}`})).join('');
  let choix = '';
  if (E.auto) {
    const retard = -(Date.now() - E.auto.debut);
    choix = `<p class="p4-note">Rien en main pour répondre.</p><button type="button" class="p4-b auto" data-act="retiens"
      style="--duree:${E.auto.duree}ms;--retard:${retard}ms">Garder la main</button>`;
  } else if (E.prio === 'moi' && h.ctrl === 'adv') choix = `<button type="button" class="p4-b fort" data-act="repondre">Répondre</button>
    <button type="button" class="p4-b" data-act="principal">Laisser résoudre</button>`;
  else if (E.prio === 'moi') choix = `<button type="button" class="p4-b fort" data-act="principal">Résoudre</button>`;
  else choix = `<p class="p4-note">${h.ctrl === 'moi' ? 'Mirela peut répondre…' : 'Mirela joue…'}</p>`;
  return `<div class="p4-proj${h.ctrl === 'adv' ? ' de-adv' : ''}"><div class="p4-nuit"></div>
    <div class="p4-scene-pile">${dessous}${carteHTML(h, K, {classe: 'p4-vedette', act: 'rien'})}</div>
    <div class="p4-legende"><b>${esc(c.nom)}</b><span>${h.ctrl === 'adv' ? 'Mirela' : 'Vous'} · ${esc(Scene.effetTexte(h))}</span></div>
    <div class="p4-choix">${choix}</div></div>`;
}

VARIANTES.theatre = {
  id: 'theatre', classe: 'v-theatre', niveau: 3,
  peins(K) {
    const E = K.E, a = actionPrincipale(), proj = projecteur4(K);
    const pileBasse = UI.repondre && E.pile.length ? `<div class="p4-pile-basse">${pileHTML(K)}</div>` : '';
    const indice = UI.vise ? `<p class="p4-indice">Choisissez la cible de ${esc(nomDe(UI.vise))}</p>`
      : UI.repondre ? '<p class="p4-indice">Touchez une carte qui brille pour répondre</p>' : '';
    const sceau = proj ? '' : `<button type="button" class="p4-sceau${a.fort ? ' fort' : ''}${a.attente ? ' attente' : ''}" data-act="principal"${a.act ? '' : ' aria-disabled="true"'}>
      <span>${esc(a.lib)}</span></button>`;
    return `<div class="pl p4">
      ${joueurHTML('adv', K)}
      <div class="p4-salle"><div class="p4-tapis">
        <div class="champ champ-adv">${champHTML('adv', K)}</div>
        <div class="p4-ligne">${pileBasse}${indice}</div>
        <div class="champ champ-moi">${champHTML('moi', K)}</div>
      </div></div>
      <div class="p4-acte">${tourHTML()}<span>${esc(PHASES[E.phase].long)}</span></div>
      ${sceau}
      ${joueurHTML('moi', K)}
      <div class="pl-main">${mainHTML(K, {eventail: 6, sauf: UI.apercu && !E.pile.length ? UI.apercu : null})}</div>
      ${proj}
    </div>`;
  },
  /* Au combat, un trait relie chaque attaquant à ce qui le bloque. */
  fleches(K) {
    return Scene.dans('adv', 'champ').concat(Scene.dans('moi', 'champ')).filter(o => o.bloque).map(b => [rectCible(b.id), rectCible(b.bloque), 'combat']);
  },
  clic: {
    carte(el) {
      const id = el.dataset.id, o = Scene.obj(id), q = Scene.E.question;
      if (UI.vise) return choisitCible(id) || ouvreLoupe(id);
      if (q && q.q === 'attaquants' && o.zone === 'champ' && o.ctrl === 'moi') return basculeAtt(id) || ouvreLoupe(id);
      if (o.zone === 'main' && Scene.E.pile.length) return veutJouer(id);
      if (o.zone === 'main') { UI.apercu = id; son('carte'); vibre('tic'); return repeins(); }
      ouvreLoupe(id);
    },
    joueur(el) { if (UI.vise) choisitCible(el.dataset.joueur); },
    jouer() { const id = UI.apercu; UI.apercu = null; veutJouer(id); },
    reprendre() { UI.apercu = null; repeins(); },
    repondre() { UI.repondre = true; repeins(); },
    rien() {}
  },
  apres(K, evts) {
    for (const e of evts) {
      if (e.t === 'attaque' && e.j === 'moi') plusTard(() => voile('charge'), 80);
      if (e.t === 'lance' && e.j === 'adv') vibre('tic');
    }
  }
};
