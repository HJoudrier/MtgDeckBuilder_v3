/* =====================================================================
   p3-carte.js — Piste 3 : les actions sur la carte

   Plus de liste d'actions en bas de l'écran : toucher une carte ouvre,
   autour d'elle, une couronne de ce qu'on peut en faire. Une question
   s'affiche là où elle se pose — la bulle d'un sort adverse s'accroche à
   ce sort et dit qui il vise. Le bouton pour passer vit sur la ligne entre
   les deux champs et dit où il mène ; une réglette, au bord, montre
   l'étape.
   ===================================================================== */

const EPEE = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M14.5 3H21v6.5L10 20.5 7.5 18l-3 3L3 19.5l3-3L3.5 14z"/></svg>';

function actionsCarte3(id, K) {
  const o = Scene.obj(id), c = Scene.def(o), l = [];
  if (o.zone === 'main' && o.ctrl === 'moi') {
    if (K.jou.has(id)) l.push({lib: c.terrain ? 'Poser' : c.cible ? 'Lancer, puis cibler' : 'Lancer', act: 'mJoue', fort: true});
    else l.push({lib: 'Pas maintenant', act: 'mPourquoi', faible: true});
  }
  if (o.zone === 'champ' && K.elig.has(id)) l.push({lib: UI.att.has(id) ? 'Rester' : 'Attaquer', act: 'mAtt', fort: !UI.att.has(id)});
  l.push({lib: 'Voir', act: 'mVoir'});
  return l;
}

/* La couronne : des pastilles posées en arc au-dessus de la carte (ou
   dessous, si la carte est en haut de l'écran), qui ne sortent pas du
   téléphone. */
function couronne3(K) {
  const el = UI.menu && ECRAN.scene.querySelector(`[data-id="${UI.menu}"]`);
  if (!el) return '';
  const p = rel(el.getBoundingClientRect()), W = ECRAN.el.clientWidth, acts = actionsCarte3(UI.menu, K);
  const enHaut = p.cy < ECRAN.el.clientHeight * .4, R = 74, n = acts.length;
  const pastilles = acts.map((a, i) => {
    const ang = (n === 1 ? 0 : (i / (n - 1) - .5) * 1.9) + (enHaut ? Math.PI / 2 : -Math.PI / 2);
    const x = Math.max(56, Math.min(W - 56, p.cx + Math.cos(ang) * R)), y = p.cy + Math.sin(ang) * R;
    return `<button type="button" class="p3-pastille${a.fort ? ' fort' : ''}${a.faible ? ' faible' : ''}" data-act="${a.act}" data-ref="${UI.menu}"
      style="left:${x.toFixed(0)}px;top:${y.toFixed(0)}px;--d:${i * 45}ms">${esc(a.lib)}</button>`;
  }).join('');
  return `<div class="p3-fond" data-act="fermeMenu"></div><div class="p3-halo" style="left:${p.cx}px;top:${p.cy}px;width:${p.w + 16}px;height:${p.h + 16}px"></div>${pastilles}`;
}

/* Une bulle accrochée à un élément de l'écran, avec sa pointe. */
function bulle3(cible, html, cls = '') {
  if (!cible) return '';
  const p = rel(cible.getBoundingClientRect()), W = ECRAN.el.clientWidth, larg = Math.min(236, W - 24);
  const aGauche = p.cx > W / 2, x = aGauche ? Math.max(12, p.x - larg - 12) : Math.min(W - larg - 12, p.x + p.w + 12);
  const y = Math.max(8, p.cy - 40);
  return `<div class="p3-bulle ${cls} ${aGauche ? 'pointe-droite' : 'pointe-gauche'}" style="left:${x}px;top:${y}px;width:${larg}px">${html}</div>`;
}

function questionPile3(K) {
  const E = K.E;
  if (!E.pile.length || UI.menu) return '';
  const h = Scene.obj(E.pile[E.pile.length - 1]);
  if (h.ctrl !== 'adv') return '';
  const el = ECRAN.scene.querySelector(`[data-id="${h.id}"]`), c = Scene.def(h);
  const quoi = `<b>${esc(c.nom)}</b><span class="p3-qui">lancé par Mirela</span><span class="p3-effet">${esc(Scene.effetTexte(h))}</span>`;
  if (E.auto) {
    const retard = -(Date.now() - E.auto.debut);
    return bulle3(el, `${quoi}<span class="p3-note">Rien en main pour répondre.</span>
      <div class="p3-boutons"><button type="button" class="p3-b auto" data-act="retiens" style="--duree:${E.auto.duree}ms;--retard:${retard}ms">Garder la main</button></div>`, 'auto');
  }
  if (E.prio !== 'moi') return '';
  if (UI.repondre) return bulle3(el, `<span class="p3-note">Touchez une carte qui brille pour répondre.</span>
    <div class="p3-boutons"><button type="button" class="p3-b" data-act="laisse">Laisser résoudre</button></div>`, 'mini');
  return bulle3(el, `${quoi}<div class="p3-boutons"><button type="button" class="p3-b fort" data-act="repondre">Répondre</button>
    <button type="button" class="p3-b" data-act="laisse">Laisser résoudre</button></div>`);
}

VARIANTES.carte = {
  id: 'carte', classe: 'v-carte', niveau: 2,
  peins(K) {
    const a = actionPrincipale(), att = K.q && K.q.q === 'attaquants';
    const pile = K.E.pile.length && Scene.obj(K.E.pile[K.E.pile.length - 1]).ctrl === 'adv' && (K.E.prio === 'moi' || K.E.auto);
    const passer = pile && !UI.repondre ? '' : `<button type="button" class="p3-passer${a.fort ? ' fort' : ''}" data-act="principal"${a.act ? '' : ' aria-disabled="true"'}>
      <span>${esc(a.lib)}</span>${a.act === 'passe' || a.act === 'attaque' ? '<i aria-hidden="true">▸</i>' : ''}</button>`;
    const milieu = `<div class="p3-ligne"><div class="p3-pile">${pileHTML(K)}</div>${tourHTML()}${passer}
      <span class="p3-sous">${esc(a.sous || '')}</span></div>`;
    const rail = `<div class="p3-rail">${phasesHTML({classe: 'ph-rail'})}</div>`;
    return plateau(K, {classe: 'p3', milieu, apres: rail, main: mainHTML(K, {eventail: 3}),
      crea: o => att && K.elig.has(o.id) ? {extra: `<span class="p3-epee${UI.att.has(o.id) ? ' on' : ''}" data-act="mAtt" data-ref="${o.id}"
        role="button" aria-label="Attaquer avec ${esc(Scene.def(o).nom)}">${EPEE}</span>`} : {}});
  },
  sur(K) {
    if (UI.menu) return couronne3(K);
    if (UI.vise) {
      const el = ECRAN.scene.querySelector(`[data-id="${UI.vise}"]`);
      return bulle3(el, `<span class="p3-note"><b>${esc(nomDe(UI.vise))}</b> : touchez une cible qui brille.</span>
        <div class="p3-boutons"><button type="button" class="p3-b" data-act="annuleVise">Annuler</button></div>`, 'mini');
    }
    return questionPile3(K);
  },
  clic: {
    carte(el) {
      const id = el.dataset.id;
      if (UI.vise) return choisitCible(id) || ouvreLoupe(id);
      const acts = actionsCarte3(id, contexte());
      if (acts.length === 1) return ouvreLoupe(id);
      UI.menu = id;
      son('carte');
      vibre('tic');
      repeins();
    },
    joueur(el) { if (UI.vise) choisitCible(el.dataset.joueur); },
    fermeMenu() { UI.menu = null; repeins(); },
    mJoue(el) { UI.menu = null; veutJouer(el.dataset.ref); },
    mPourquoi(el) { UI.menu = null; repeins(); refus(el.dataset.ref); },
    mVoir(el) { UI.menu = null; ouvreLoupe(el.dataset.ref); },
    mAtt(el) { UI.menu = null; basculeAtt(el.dataset.ref); },
    repondre() { UI.repondre = true; vibre('tic'); repeins(); },
    laisse() { UI.repondre = false; Scene.passe(); }
  }
};
