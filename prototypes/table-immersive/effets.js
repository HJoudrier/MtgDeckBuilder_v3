/* =====================================================================
   effets.js — Les événements de la scène, en effets, sons et vibrations

   Une table de correspondance, et rien d'autre : chaque événement dit ce
   qu'on voit, entend et sent. Le niveau de la maquette dose : 1 sobre (le
   fil du tour), 2 normal, 3 théâtral. Les effets tombent à des places déjà
   mesurées, et un peu après le départ des cartes, pour qu'on les voie
   arriver avant l'impact.
   ===================================================================== */

function effets(evts, avant, apres) {
  const N = ECRAN.V.niveau || 2, d = MVT.duree;
  const r = id => apres.has(id) ? rel(apres.get(id).r) : avant.has(id) ? rel(avant.get(id).r) : null;
  for (const e of evts) switch (e.t) {
    case 'pioche':
      son('carte');
      if (e.j === 'adv') volDos('bib-adv', 'main-adv');
      break;
    case 'pose':
      son('pose');
      vibre('pose');
      if (N >= 2 && r(e.id)) plusTard(() => onde(r(e.id)), d * .8);
      break;
    case 'lance':
      son('lance');
      if (N >= 3 && r(e.id)) plusTard(() => eclats(r(e.id), 'brass', 10, .7), d * .9);
      break;
    case 'resout':
      if (e.permanent) {
        plusTard(() => {
          son('pose');
          if (N >= 2 && r(e.id)) onde(r(e.id));
          if (N >= 3) secoue(ECRAN.scene, 2.5);
        }, d * .8);
      } else {
        son('resout');
        if (N >= 3 && avant.has(e.id)) eclats(rel(avant.get(e.id).r), 'brass', 16, 1);
      }
      break;
    case 'degats': {
      const p = rectCible(e.cible, apres);
      if (!p) break;
      plusTard(() => {
        flotte(p, '−' + e.n, 'degats' + (N >= 3 ? ' grand' : ''));
        son('impact');
        if (N >= 2) onde(p, 'rouge');
        if (N >= 3) { eclats(p, 'R', 10, .8); secoue(ECRAN.scene, 5); }
      }, d * .5);
      break;
    }
    case 'choc':
      if (N >= 3) plusTard(() => voile('choc'), d * .4);
      break;
    case 'vie':
      plusTard(() => {
        const el = ECRAN.scene.querySelector(`[data-vie="${e.j}"]`);
        if (el && !REGLAGES.reduit) el.animate([{transform: 'scale(1)'}, {transform: 'scale(1.45)'}, {transform: 'scale(1)'}], {duration: 450});
        if (el) el.classList.add('touche');
        if (e.j === 'moi' && e.delta < 0) {
          vibre('blesse');
          son('blesse');
          if (N >= 2) voile(N >= 3 ? 'blesse fort' : 'blesse');
        }
      }, d * .55);
      break;
    case 'meurt':
      plusTard(() => { son('mort'); vibre('mort'); }, d * .6);
      if (N >= 2 && avant.has(e.id)) plusTard(() => eclats(rel(avant.get(e.id).r), 'gris', N >= 3 ? 20 : 8, N >= 3 ? 1.2 : .7), d * .3);
      break;
    case 'attaque':
      son('attaque');
      if (e.j === 'adv') { vibre('alerte'); if (N >= 2) voile('alerte'); }
      break;
    case 'bloque':
      son('bloque');
      break;
    case 'bonus': {
      const p = r(e.id);
      if (p) plusTard(() => flotte(p, `${e.f > 0 ? '+' : '−'}${Math.abs(e.f)}/${e.e > 0 ? '+' : '−'}${Math.abs(e.e)}`, e.f > 0 ? 'bonus' : 'malus'), d * .4);
      son(e.f > 0 ? 'bonus' : 'malus');
      break;
    }
    case 'prio':
      if (e.pile || e.q === 'attaquants') { son('prio'); vibre('prio'); }
      break;
    case 'phase':
      if (N >= 2) son('etape');
      break;
    case 'tour':
      son('tour');
      if (N >= 2 || REGLAGES.reduit) banniere(e.actif === 'moi' ? 'Votre tour' : 'Tour de Mirela', `Tour ${e.tour}`, N >= 3);
      if (e.actif === 'moi') vibre('tour');
      break;
    case 'refus':
      refus(e.id, e.raison);
      break;
    case 'sansCible':
      dit('Plus de cible : le sort ne fait rien.');
      break;
    case 'fin':
      plusTard(() => {
        son(e.gagnant === 'moi' ? 'victoire' : 'defaite');
        vibre('victoire');
        banniere(e.gagnant === 'moi' ? 'Victoire' : e.gagnant ? 'Défaite' : 'Partie nulle', 'Touchez « Rejouer » pour recommencer', true);
      }, d);
      break;
  }
}

