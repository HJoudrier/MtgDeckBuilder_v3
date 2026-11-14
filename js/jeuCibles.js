/* =====================================================================
   js/jeuCibles.js — Juger un objet contre un descripteur

   Le compilateur décrit « target nonland permanent an opponent controls with
   mana value 3 or less » une fois (js/oracleCibles.js) ; ce fichier le juge
   pendant la partie, et c'est le seul à le faire : cibles, « each », « all »,
   sacrifices, recherches, sujets de déclencheur et de statique passent tous
   par `correspond()`.
   ===================================================================== */

/* Les caractéristiques à juger : celles du moment pour un permanent, celles
   qu'on a retenues pour un objet parti, l'imprimé pour une carte ailleurs. */
function caracsJugees(P, o, base) {
  if (o.lki) return o;
  if (base || o.zone !== 'champ') {
    const d = o.def;
    return {force: d.force || 0, endurance: d.endurance || 0, mots: d.mots, types: d.types,
      sousTypes: d.sousTypes, couleurs: d.couleurs, supers: d.supers};
  }
  return car(P, o);
}

function etatCombat(P, o, etat) {
  const cb = P.combat;
  const att = !!(cb && cb.attaquants.has(o.id)), blq = !!(cb && cb.bloqueurs.has(o.id));
  if (etat === 'attaquant') return att;
  if (etat === 'bloquant') return blq;
  return att || blq;
}

/* Le cœur : un objet (ou un instantané) répond-il au descripteur, vu du
   joueur `ctrl` qui contrôle la source `src` ? */
function correspondObjet(P, o, d, src, ctrl, base) {
  if (d.forge) return forgeValideObjet(P, o, d.forge, src, ctrl, null, base);
  const zone = o.lki ? 'champ' : o.zone;
  const c = caracsJugees(P, o, base);
  if (d.genre === 'nimporte') {
    if (zone !== 'champ') return false;
    if (d.autre && src && o.id === src.id) return false;
    return (!d.sansCreature && c.types.includes('creature')) || c.types.includes('planeswalker') || c.types.includes('battle');
  }
  if (d.genre === 'joueur') return false;
  if (d.genre === 'sort') { if (zone !== 'pile') return false; } else if (d.zone && d.zone !== zone) return false;
  if (d.types.length && !d.types.some(t => c.types.includes(t))) return false;
  if (d.non.length && d.non.some(t => c.types.includes(t))) return false;
  if (d.sousTypes.length && !d.sousTypes.some(s => c.sousTypes.includes(s))) return false;
  const tient = zone === 'champ' || zone === 'pile' ? o.ctrl : o.prop;
  if (d.ctrl === 'vous' && tient !== ctrl) return false;
  if (d.ctrl === 'adv' && tient === ctrl) return false;
  if (d.proprio === 'vous' && o.prop !== ctrl) return false;
  if (d.proprio === 'adv' && o.prop === ctrl) return false;
  if (d.autre && src && o.id === src.id) return false;
  if (d.couleurs.length && !d.couleurs.some(k => c.couleurs.includes(k))) return false;
  if (d.nonCouleurs && d.nonCouleurs.some(k => c.couleurs.includes(k))) return false;
  if (d.incolore && c.couleurs.length) return false;
  if (d.multicolore && c.couleurs.length < 2) return false;
  for (const f of d.filtres) {
    const v = f.t === 'mv' ? mvDe(o) : f.t === 'force' ? c.force : c.endurance;
    const lim = typeof f.v === 'number' ? f.v : 0;
    if (f.op === '<=' ? v > lim : v < lim) return false;
  }
  if (d.etat === 'engage' && !o.engage) return false;
  if (d.etat === 'degage' && o.engage) return false;
  if ((d.etat === 'attaquant' || d.etat === 'bloquant' || d.etat === 'combat') && !etatCombat(P, o, d.etat)) return false;
  if (d.jeton === true && !o.jeton) return false;
  if (d.jeton === false && o.jeton) return false;
  if (d.legendaire === true && !c.supers.includes('legendary')) return false;
  if (d.legendaire === false && c.supers.includes('legendary')) return false;
  if (d.base === true && !c.supers.includes('basic')) return false;
  if (d.base === false && c.supers.includes('basic')) return false;
  if (d.mots && (c.mots & d.mots) !== d.mots) return false;
  return true;
}

function correspond(P, o, d, src, ctrl) { return correspondObjet(P, o, d, src, ctrl, false); }
function correspondBase(P, o, d, src, ctrl) { return correspondObjet(P, o, d, src, ctrl, true); }

/* Un joueur répond-il au descripteur ? */
function joueurCorrespond(P, j, d, ctrl) {
  if (P.joueurs[j].elimine) return false;
  if (d.forge) return forgeValideJoueur(P, j, d.forge, ctrl, null);
  if (d.genre === 'nimporte') return true;
  if (d.genre !== 'joueur') return false;
  return d.joueur === 'adv' ? j !== ctrl : true;
}

/* Une définition de sort répond-elle (déclencheurs « whenever you cast a
   noncreature spell ») ? */
function defCorrespond(def, d) {
  if (!d) return true;
  if (d.forge) return forgeValideDef(def, d.forge, null, null);
  if (d.types.length && !d.types.some(t => def.types.includes(t))) return false;
  if (d.non.length && d.non.some(t => def.types.includes(t))) return false;
  if (d.sousTypes.length && !d.sousTypes.some(s => def.sousTypes.includes(s))) return false;
  if (d.couleurs.length && !d.couleurs.some(k => def.couleurs.includes(k))) return false;
  return true;
}

/* Linceul, défense talismanique, protection : un objet peut-il être ciblé
   par ce joueur, avec une source de ces couleurs ? La garde se paie au
   lancement (js/jeuLancer.js), elle n'interdit rien. */
function ciblable(P, o, ctrl, couleurs) {
  if (o.zone !== 'champ') return true;
  const m = car(P, o).mots;
  if (m & MOT.INTOUCHABLE) return false;
  if ((m & MOT.LINCEUL) && o.ctrl !== ctrl) return false;
  if ((m & MOT.PROTECTION) && couleurs && (o.def.params.protection || []).some(k => couleurs.includes(k))) return false;
  return true;
}

/* Les candidats légaux d'un emplacement de cible : des identifiants
   d'objets, ou `{j}` pour un joueur. */
function ciblesLegales(P, slot, src, ctrl, couleurs) {
  const d = slot.desc, r = [];
  if (d.genre === 'joueur' || d.genre === 'nimporte')
    P.joueurs.forEach(J => { if (joueurCorrespond(P, J.i, d, ctrl)) r.push({j: J.i}); });
  if (d.genre === 'joueur') return r;
  if (d.genre === 'sort') {
    P.pile.forEach(it => { if (it.sort) { const o = obj(P, it.id); if (o && o.id !== (src && src.id) && correspond(P, o, d, src, ctrl)) r.push(o.id); } });
    return r;
  }
  if (d.genre === 'carte' || (d.zone && d.zone !== 'champ')) {
    const zone = d.zone || 'cimetiere';
    P.joueurs.forEach(J => {
      if (J.elimine) return;
      if (d.proprio === 'vous' && J.i !== ctrl) return;
      if (d.proprio === 'adv' && J.i === ctrl) return;
      J[zone].forEach(id => { const o = obj(P, id); if (correspond(P, o, d, src, ctrl)) r.push(id); });
    });
    return r;
  }
  for (const id of P.champ) {
    const o = obj(P, id);
    if (correspond(P, o, d, src, ctrl) && ciblable(P, o, ctrl, couleurs)) r.push(id);
  }
  return r;
}

/* Une cible choisie l'est-elle encore à la résolution (règle 608.2b) ? */
function cibleEncoreLegale(P, cand, slot, src, ctrl, couleurs) {
  if (cand && typeof cand === 'object') return joueurCorrespond(P, cand.j, slot.desc, ctrl);
  const o = obj(P, cand);
  if (!o) return false;
  if (slot.desc.genre === 'sort') return o.zone === 'pile' && correspond(P, o, slot.desc, src, ctrl);
  return correspond(P, o, slot.desc, src, ctrl) && ciblable(P, o, ctrl, couleurs);
}
