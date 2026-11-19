/* =====================================================================
   p5-fil.js — Piste 5 : le fil du tour

   Le tour est un chemin tracé entre les deux champs. Un jeton de laiton
   est posé sur l'étape en cours : le toucher, c'est passer ; le faire
   glisser jusqu'à une étape plus loin, c'est passer jusque-là — chaque
   étape franchie se sent sous le doigt, comme les crans d'une molette.
   Sous la piste, une phrase dit ce qui arrivera. Un appui long sur une
   étape y pose un arrêt pour le tour de Mirela : la main revient au
   joueur à ce moment-là, s'il a de quoi répondre.
   ===================================================================== */

const pos5 = i => i / (ORDRE_PHASES.length - 1);

function jeton5(a, K) {
  const E = K.E, q = K.q;
  if (a.attente) return '<span class="p5-attente" aria-hidden="true"></span>';
  if (a.auto) {
    const retard = -(Date.now() - E.auto.debut);
    return `<svg class="p5-anneau" viewBox="0 0 100 100" aria-hidden="true"><circle cx="50" cy="50" r="44"
      style="animation-duration:${E.auto.duree}ms;animation-delay:${retard}ms"/></svg><span class="p5-mini">garder</span>`;
  }
  if (q && q.q === 'attaquants') return `<span class="p5-att">${UI.att.size ? '⚔ ' + UI.att.size : '—'}</span>`;
  if (UI.vise) return '<span>✕</span>';
  if (E.fin) return '<span>↺</span>';
  return '<span class="p5-fleche">▶</span>';
}

function fil5(K) {
  const E = K.E, k = ORDRE_PHASES.indexOf(E.phase), a = actionPrincipale();
  const pas = ORDRE_PHASES.map((p, i) => `<li class="p5-pas${i < k ? ' passe' : i === k ? ' ici' : ''}${E.arrets.has(p) ? ' arret' : ''}"
    data-ph="${p}" data-glisse="pas" style="--x:${pos5(i)}"><i></i><span>${esc(PHASES[p].court)}</span></li>`).join('');
  const glissable = E.actif === 'moi' && E.prio === 'moi' && K.q && K.q.q === 'priorite' && !E.pile.length && !UI.vise;
  return `<div class="p5-fil${E.actif === 'adv' ? ' chez-adv' : ''}">
    <div class="p5-entete">${tourHTML()}<span class="p5-legende-arret"><b class="p5-drapeau"></b> arrêt chez Mirela · appui long sur une étape</span></div>
    <div class="p5-piste" style="--k:${pos5(k)}"><ol>${pas}</ol>
      <div class="p5-pile" style="--x:${pos5(k)}">${pileHTML(K)}</div>
      <button type="button" data-id="jeton5" class="p5-jeton${a.fort ? ' fort' : ''}${a.attente ? ' attente' : ''}" data-act="principal"${glissable ? ' data-glisse="jeton"' : ''}
        style="--x:${pos5(k)}" aria-label="${esc(a.lib)}">${jeton5(a, K)}</button></div>
    <p class="p5-apercu">${a.attente ? esc(a.sous || a.lib) : `<b>${esc(a.lib)}</b> · ${esc(a.sous || '')}`}</p></div>`;
}

VARIANTES.fil = {
  id: 'fil', classe: 'v-fil', niveau: 1,
  peins(K) { return plateau(K, {classe: 'p5', milieu: fil5(K), main: mainHTML(K, {})}); },
  clic: {
    carte(el) {
      const id = el.dataset.id, o = Scene.obj(id), q = Scene.E.question;
      if (UI.vise) return choisitCible(id) || ouvreLoupe(id);
      if (q && q.q === 'attaquants' && o.zone === 'champ' && o.ctrl === 'moi') return basculeAtt(id) || ouvreLoupe(id);
      if (o.zone === 'main') return veutJouer(id);
      ouvreLoupe(id);
    },
    joueur(el) { if (UI.vise) choisitCible(el.dataset.joueur); }
  },
  glisse: {
    debut(st) {
      if (st.type === 'pas') {
        st.ph = st.el.dataset.ph;
        st.t = setTimeout(() => {
          st.fait = true;
          Scene.basculeArret(st.ph);
          const on = Scene.E.arrets.has(st.ph);
          son(on ? 'bonus' : 'tic');
          vibre('valide');
          dit(on ? `Arrêt posé : ${PHASES[st.ph].long.toLowerCase()} de Mirela.` : 'Arrêt retiré.');
          repeins();
        }, 480);
        return true;
      }
      if (st.type !== 'jeton') return false;
      const piste = st.el.parentElement.getBoundingClientRect();
      st.gauche = piste.left + 14;
      st.larg = piste.width - 28;
      st.k0 = ORDRE_PHASES.indexOf(Scene.E.phase);
      st.k = st.k0;
      return true;
    },
    bouge(st) {
      if (st.type === 'pas') { clearTimeout(st.t); return; }
      const f = Math.max(0, Math.min(1, (st.x - st.gauche) / st.larg)), n = ORDRE_PHASES.length - 1;
      const k = Math.max(st.k0, Math.round(f * n));
      st.el.style.left = `calc(14px + ${Math.max(pos5(st.k0), f).toFixed(3)} * (100% - 28px))`;
      st.el.classList.add('en-glisse');
      if (k !== st.k) {
        st.k = k;
        son('cran');
        vibre('cran');
        const ap = ECRAN.scene.querySelector('.p5-apercu');
        if (ap) ap.innerHTML = k === st.k0 ? 'Lâchez plus loin pour passer plusieurs étapes.'
          : `<b>Passer jusqu'à : ${esc(PHASES[ORDRE_PHASES[k]].long)}</b> · la main vous revient si Mirela répond.`;
        ECRAN.scene.querySelectorAll('.p5-pas').forEach((li, i) => li.classList.toggle('vise', i > st.k0 && i <= k));
      }
    },
    tape(st) { if (st.t) clearTimeout(st.t); },
    lache(st) {
      if (st.type === 'pas') return clearTimeout(st.t);
      if (st.k > st.k0) { vibre('valide'); return Scene.passeJusqua(ORDRE_PHASES[st.k]); }
      repeins();
    },
    annule(st) { if (st.t) clearTimeout(st.t); repeins(); }
  }
};
