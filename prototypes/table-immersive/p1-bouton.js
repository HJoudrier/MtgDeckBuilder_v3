/* =====================================================================
   p1-bouton.js — Piste 1 : le bouton de tour

   Le bandeau du bas disparaît. Entre les deux champs court une ligne de
   front : l'étape à gauche, la pile au centre, et à droite, sous le
   pouce, un seul bouton rond dont le libellé dit ce qui va se passer.
   On lève une carte d'un toucher, on la joue d'un second, ou du bouton,
   ou en la poussant vers le haut. Quand rien ne se joue, un anneau se
   remplit sur le bouton et la priorité passe seule ; le toucher la
   retient.
   ===================================================================== */

function puces1(K, a) {
  const q = K.E.question, b = [];
  if (q && q.q === 'attaquants') b.push(['tous', 'Toutes'], ['aucun', 'Aucune']);
  else if (UI.sel) b.push(['reposer', 'Reposer']);
  else if (K.E.prio === 'moi' && K.E.actif === 'moi' && !K.E.pile.length && K.E.phase === 'principale1' && !UI.vise) b.push(['finTour', 'Fin du tour']);
  return b.length ? `<div class="p1-puces">${b.map(([act, lib]) => `<button type="button" class="puce" data-act="${act}">${lib}</button>`).join('')}</div>` : '';
}

function bouton1(a) {
  const cls = ['p1-bouton', a.fort ? 'fort' : '', a.attente ? 'attente' : '', a.auto ? 'auto' : ''].filter(Boolean).join(' ');
  const E = Scene.E, retard = a.auto && E.auto ? -(Date.now() - E.auto.debut) : 0;
  const anneau = a.auto && E.auto ? `<svg class="p1-anneau" viewBox="0 0 100 100" aria-hidden="true"><circle cx="50" cy="50" r="46"
    style="animation-duration:${E.auto.duree}ms;animation-delay:${retard}ms"/></svg>` : a.attente ? '<span class="p1-attente" aria-hidden="true"></span>' : '';
  return `<button type="button" class="${cls}" data-act="principal"${a.act ? '' : ' aria-disabled="true"'}>${anneau}<span class="p1-lib">${esc(a.court || a.lib)}</span></button>`;
}

VARIANTES.bouton = {
  id: 'bouton', classe: 'v-bouton', niveau: 2,
  peins(K) {
    const E = K.E, a = actionPrincipale();
    const milieu = `<div class="p1-front">
        <div class="p1-etape">${tourHTML()}${phasesHTML({classe: 'ph-points'})}<b class="p1-ph">${esc(PHASES[E.phase].long)}</b></div>
        <div class="p1-centre">${pileHTML(K) || filHTML()}</div>
        <div class="p1-commande">${puces1(K, a)}${bouton1(a)}</div>
        ${a.sous ? `<div class="p1-sous">${esc(a.sous)}</div>` : ''}
      </div>`;
    return plateau(K, {classe: 'p1', milieu, main: mainHTML(K, {eventail: 5, glisse: 'main'})});
  },
  clic: {
    carte(el) {
      const id = el.dataset.id, o = Scene.obj(id), q = Scene.E.question;
      if (UI.vise) return choisitCible(id) || ouvreLoupe(id);
      if (q && q.q === 'attaquants' && o.zone === 'champ' && o.ctrl === 'moi') return basculeAtt(id) || ouvreLoupe(id);
      if (o.zone === 'main') {
        if (!Scene.jouables().includes(id)) return refus(id);
        if (UI.sel === id) return veutJouer(id);
        UI.sel = id;
        son('carte');
        vibre('tic');
        return repeins();
      }
      ouvreLoupe(id);
    },
    joueur(el) { if (UI.vise) choisitCible(el.dataset.joueur); },
    reposer() { UI.sel = null; repeins(); },
    finTour() { Scene.passeJusqua('fin'); }
  },
  /* Pousser une carte de la main vers le haut la joue. */
  glisse: {
    debut(st) { return st.type === 'main'; },
    bouge(st) {
      st.el.classList.add('en-glisse');
      st.el.style.transform = `translate(${st.dx}px, ${Math.min(st.dy, 20)}px)`;
      st.el.style.setProperty('--tilt', `${Math.max(-12, Math.min(12, st.dx / 10))}deg`);
      const dedans = st.dy < -70;
      if (dedans !== st.dedans) { st.dedans = dedans; if (dedans) { son('cran'); vibre('cran'); } }
      ECRAN.scene.querySelector('.champ-moi').classList.toggle('depot', dedans);
    },
    lache(st) { if (st.dy < -70) veutJouer(st.id); else repeins(); },
    annule() { repeins(); }
  }
};
