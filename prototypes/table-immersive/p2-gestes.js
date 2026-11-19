/* =====================================================================
   p2-gestes.js — Piste 2 : tout au doigt

   Aucun bouton d'action. On fait glisser une carte de la main vers son
   champ pour la jouer, ou sur sa cible pour la lancer — une flèche suit
   le doigt, la cible grossit sous lui. On pousse une créature vers Mirela
   pour qu'elle attaque, on la ramène pour l'annuler. Passer se fait en
   faisant glisser un curseur jusqu'au bout, comme on déverrouille un
   téléphone : impossible de passer par mégarde. Un toucher simple ne
   joue jamais rien ; il montre la carte en grand.
   ===================================================================== */

/* La phrase qui dit quel geste est attendu maintenant. */
function aide2(K) {
  const E = K.E, q = E.question;
  if (E.fin) return 'Partie terminée.';
  if (UI.vise) return 'Lâchez la carte sur une cible qui brille.';
  if (E.auto) return 'Rien pour répondre : la priorité passe. Touchez le curseur pour garder la main.';
  if (!q || E.prio !== 'moi') return E.actif === 'adv' ? 'Mirela joue son tour.' : 'Mirela réfléchit…';
  if (q.q === 'attaquants') return 'Poussez vos créatures vers Mirela pour attaquer, ramenez-les pour annuler.';
  if (E.pile.length && Scene.obj(E.pile[E.pile.length - 1]).ctrl === 'adv') return 'Mirela a lancé un sort : glissez une réponse sur sa cible, ou faites glisser le curseur.';
  if (K.jou.size) return 'Glissez une carte qui brille vers votre champ, ou sur sa cible.';
  return 'Rien à jouer : faites glisser le curseur pour continuer.';
}

function curseur2(a) {
  const etat = a.attente ? 'attente' : a.auto ? 'auto' : a.fort ? 'fort' : '';
  return `<div class="p2-curseur ${etat}"${a.auto ? ' data-act="retiens"' : ''}>
    <span class="p2-piste-txt">${esc(a.attente || a.auto ? a.lib : a.lib + '  ⟶')}</span>
    <span class="p2-remplir"></span>
    ${a.act && !a.auto ? `<span class="p2-poignee" data-glisse="curseur" role="slider" aria-label="${esc(a.lib)} : glisser jusqu'au bout"
      aria-valuemin="0" aria-valuemax="100" aria-valuenow="0" tabindex="0" data-act="curseurClavier"><svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M5 6l6 6-6 6M12 6l6 6-6 6"/></svg></span>` : ''}</div>`;
}

VARIANTES.gestes = {
  id: 'gestes', classe: 'v-gestes', niveau: 2,
  peins(K) {
    const att = K.q && K.q.q === 'attaquants';
    const milieu = `<div class="p2-milieu">${tourHTML()}<span class="p2-ph">${esc(PHASES[K.E.phase].long)}</span>
      <div class="p2-pile">${pileHTML(K)}</div>
      <p class="p2-aide">${esc(aide2(K))}</p>${curseur2(actionPrincipale())}</div>`;
    return plateau(K, {classe: 'p2', milieu, main: mainHTML(K, {glisse: 'main'}),
      crea: o => (att && o.ctrl === 'moi' && K.elig.has(o.id)) ? {glisse: 'crea'} : {}});
  },
  /* Un coup de pouce, la première fois : une main fantôme montre le geste. */
  sur(K) {
    if (!UI.coach || !K.jou.size) return '';
    const id = [...K.jou][0], el = ECRAN.scene.querySelector(`.main [data-id="${id}"]`);
    if (!el) return '';
    const p = rel(el.getBoundingClientRect());
    return `<div class="p2-coach" style="left:${p.cx}px;top:${p.y + 10}px" aria-hidden="true"><span class="p2-doigt"></span>
      <span class="p2-coach-txt">Glissez vers le haut</span></div>`;
  },
  clic: {
    carte(el) {
      const id = el.dataset.id;
      if (UI.vise) return choisitCible(id) || ouvreLoupe(id);
      ouvreLoupe(id);
    },
    joueur(el) { if (UI.vise) choisitCible(el.dataset.joueur); },
    curseurClavier(el, ev) { if (ev.detail === 0) faitPrincipale(); else dit('Faites glisser le curseur jusqu\'au bout.'); }
  },
  glisse: {
    debut(st) {
      if (st.type === 'curseur') {
        const piste = st.el.parentElement;
        st.piste = piste;
        st.max = piste.clientWidth - st.el.offsetWidth - 8;
        st.cran = 0;
        return true;
      }
      if (st.type === 'main') {
        const o = Scene.obj(st.id);
        st.vise = !!Scene.def(o).cible && Scene.jouables().includes(st.id);
        st.depart = rel(st.el.getBoundingClientRect());
        return true;
      }
      return st.type === 'crea';
    },
    bouge(st) {
      if (st.type === 'curseur') {
        const x = Math.max(0, Math.min(st.max, st.dx)), f = x / st.max, cran = Math.floor(f * 4);
        st.el.style.transform = `translateX(${x}px)`;
        st.piste.style.setProperty('--f', f.toFixed(3));
        if (cran > st.cran) { son('cran'); vibre('cran'); }
        st.cran = cran;
        return;
      }
      if (st.type === 'crea') {
        st.el.style.transform = `translateY(${Math.max(-46, Math.min(30, st.dy))}px)`;
        const s = st.dy < -28 ? 'haut' : st.dy > 24 ? 'bas' : '';
        if (s && s !== st.seuil) { son('cran'); vibre('cran'); }
        st.seuil = s;
        return;
      }
      UI.coach = false;
      st.el.classList.add('en-glisse');
      st.el.style.transform = `translate(${st.dx}px, ${st.dy}px)`;
      st.el.style.setProperty('--tilt', `${Math.max(-14, Math.min(14, st.dx / 8))}deg`);
      const sous = sousLeDoigt(st.x, st.y);
      if (st.vise) {
        const t = cibleSous(sous), ok = t && Scene.cibles(st.id).includes(t) ? t : null;
        if (ok !== st.cible) {
          ECRAN.scene.querySelectorAll('.survol').forEach(x => x.classList.remove('survol'));
          if (ok) {
            const e = ok === 'moi' || ok === 'adv' ? ECRAN.scene.querySelector(`[data-joueur="${ok}"]`) : ECRAN.scene.querySelector(`[data-id="${ok}"]`);
            if (e) e.classList.add('survol');
            son('cran');
            vibre('cran');
          }
          st.cible = ok;
        }
        flecheLibre(st.depart, st.x, st.y);
        ECRAN.scene.querySelectorAll('.k.cible-attente').forEach(x => x.classList.remove('cible-attente'));
        Scene.cibles(st.id).forEach(t => {
          const e = t === 'moi' || t === 'adv' ? ECRAN.scene.querySelector(`[data-joueur="${t}"]`) : ECRAN.scene.querySelector(`[data-id="${t}"]`);
          if (e) e.classList.add('cible-attente');
        });
        return;
      }
      const dedans = st.dy < -80;
      if (dedans !== st.dedans) { st.dedans = dedans; if (dedans) { son('cran'); vibre('cran'); } }
      ECRAN.scene.querySelector('.champ-moi').classList.toggle('depot', dedans);
    },
    lache(st) {
      flecheLibre(null);
      if (st.type === 'curseur') {
        if (st.dx >= st.max * .85) { vibre('valide'); return faitPrincipale(); }
        st.el.animate([{transform: st.el.style.transform}, {transform: 'translateX(0)'}], {duration: 260, easing: 'cubic-bezier(.3,1.4,.5,1)'});
        st.el.style.transform = '';
        st.piste.style.setProperty('--f', 0);
        return;
      }
      if (st.type === 'crea') {
        const q = Scene.E.question;
        if (q && q.q === 'attaquants') {
          if (st.dy < -28 && !UI.att.has(st.id)) return basculeAtt(st.id);
          if (st.dy > 24 && UI.att.has(st.id)) return basculeAtt(st.id);
        }
        return repeins();
      }
      if (st.vise && st.cible) { UI.vise = st.id; return choisitCible(st.cible); }
      if (!st.vise && st.dy < -80) return veutJouer(st.id);
      if (st.dy < -80 && !Scene.jouables().includes(st.id)) refus(st.id);
      repeins();
    },
    annule() { flecheLibre(null); repeins(); }
  }
};
