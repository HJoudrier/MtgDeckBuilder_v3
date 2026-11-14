/* =====================================================================
   js/jeuDeclencheurs.js — Des évènements aux capacités déclenchées

   Le moteur émet des évènements (`emet()`, js/jeuEtat.js) ; à chaque point
   de stabilisation, la collecte les confronte aux écoutes des permanents et
   range les capacités déclenchées en attente. Elles iront sur la pile dans
   l'ordre APNAP au prochain passage de priorité (js/jeuPile.js
   `stabilise()`, règle 603.3).

   Un permanent qui vient de partir écoute encore les évènements de son
   propre départ : « when ~ dies », et Blood Artist qui voit mourir les
   créatures balayées en même temps que lui. Ces écoutes « regardent en
   arrière » à travers l'instantané pris au départ (`P.partis`).
   ===================================================================== */

/* Une définition a-t-elle une capacité déclenchée ou la prouesse ? Gardé
   sur la définition : le test se fait pour chaque permanent à chaque
   collecte. */
function ecoute(def) {
  if (def._ecoute === undefined)
    def._ecoute = def.capacites.some(k => k.genre === 'declenchee') || !!(def.mots & MOT.PROUESSE);
  return def._ecoute;
}

function quiConvient(qui, j, ctrl) {
  return qui === 'vous' ? j === ctrl : qui === 'adv' ? j !== ctrl : true;
}

/* Le rang d'un sort parmi ceux que son lanceur a lancés ce tour et qui
   répondent au même descripteur : « their first noncreature spell ». */
function rangDuSort(P, e, desc) {
  return P.joueurs[e.joueur].sortsTour.filter(d => defCorrespond(d, desc)).length;
}

/* Une écoute répond-elle à un évènement, pour la source `s` ? */
function ecouteRepond(P, ec, e, s) {
  const sujet = ec.sujet;
  switch (ec.evt) {
    case 'entre': {
      if (e.t !== 'entre') return false;
      if (sujet === 'soi') return e.id === s.id;
      const o = obj(P, e.id);
      if (!o || (sujet.autre && e.id === s.id)) return false;
      return correspond(P, o, sujet, s, s.ctrl);
    }
    case 'meurt':
      if (e.t !== 'meurt') return false;
      if (sujet === 'soi') return e.ancien === s.id;
      if (sujet === 'attache') return (e.lki.attaches || []).includes(s.id);
      if (ec.aussiSoi && e.ancien === s.id) return true;
      if (sujet.autre && e.ancien === s.id) return false;
      return correspond(P, e.lki, sujet, s, s.ctrl);
    case 'attaque':
      if (e.t !== 'attaque') return false;
      if (sujet === 'soi') return e.id === s.id;
      if (sujet === 'attache') return s.att === e.id;
      return !!obj(P, e.id) && correspond(P, obj(P, e.id), sujet, s, s.ctrl) && !(sujet.autre && e.id === s.id);
    case 'bloque': return e.t === 'bloque' && e.id === s.id;
    case 'estBloque': return e.t === 'estBloque' && e.id === s.id;
    case 'degatsJoueur':
      if (e.t !== 'degatsJoueur' || (ec.combat && !e.combat)) return false;
      return sujet === 'attache' ? e.source === s.att && s.att != null : e.source === s.id;
    case 'lance':
      if (e.t !== 'lance' || !quiConvient(ec.qui, e.joueur, s.ctrl) || !defCorrespond(e.def, sujet)) return false;
      return !ec.premier || rangDuSort(P, e, sujet) === 1;
    case 'etape': return e.t === 'etape' && e.etape === ec.etape && quiConvient(ec.qui, e.actif, s.ctrl);
    case 'gagneVie': return e.t === 'vie' && quiConvient(ec.qui, e.joueur, s.ctrl);
    case 'pioche': return e.t === 'pioche' && quiConvient(ec.qui, e.joueur, s.ctrl);
    case 'sacrifie': return e.t === 'sacrifie' && e.joueur === s.ctrl && (!sujet || correspond(P, e.lki, sujet, s, s.ctrl));
    case 'quitte': return e.t === 'zone' && e.de === 'champ' && e.ancien === s.id;
    case 'forge': return forgeDeclenche(P, ec, e, s);
    case 'echo': return e.t === 'etape' && e.etape === 'entretien' && e.actif === s.ctrl && !!s.echoDu;
    case 'cumul': return e.t === 'etape' && e.etape === 'entretien' && e.actif === s.ctrl;
  }
  return false;
}

/* La prouesse, écrite une fois comme une capacité déclenchée ordinaire. */
const CAP_PROUESSE = {genre: 'declenchee', effet: {ops: [{op: 'pompe', a: {soi: 1}, f: 1, e: 1, mots: 0}], cibles: [], modes: null}};

/* Lire les évènements émis depuis la dernière collecte, et ranger en
   attente les capacités qu'ils déclenchent. */
function collecteDeclencheurs(P) {
  declencheursEtat(P);
  if (!P.evts.length) { P.partis.length = 0; return; }
  const evts = P.evts, partis = P.partis;
  P.evts = []; P.partis = [];
  P._lot = new Set();
  const sources = [];
  for (const id of P.champ) { const o = obj(P, id); if (ecoute(o.def) || capacitesDe(P, o) !== o.def.capacites) sources.push(o); }
  for (const l of partis) if (ecoute(l.def) || l.caps) sources.push(l);
  sources.push(...sourcesEffets(P), ...sourcesHorsChamp(P));
  for (const e of evts) {
    collecteRetardes(P, e);
    for (const s of sources) {
      if (s.lki && e.t !== 'meurt' && e.t !== 'sacrifie' && e.t !== 'zone' && e.t !== 'cycle') continue;
      if (P.joueurs[s.ctrl].elimine) continue;
      if (e.t === 'lance' && !s.lki && (s.def.mots & MOT.PROUESSE) && s.ctrl === e.joueur && !e.def.types.includes('creature'))
        P.enAttente.push({src: s.id, ctrl: s.ctrl, cap: CAP_PROUESSE, evt: e});
      const caps = s.lki ? (s.caps || s.def.capacites) : s.zone === 'effet' ? s.def.capacites : capacitesDe(P, s);
      caps.forEach((cap, i) => {
        if (cap.genre !== 'declenchee' || (!s.lki && s.zone !== 'effet' && !(cap.zones || ['champ']).includes(s.zone))) return;
        if (!cap.ecoutes.some(ec => ecouteRepond(P, ec, e, s))) return;
        if (cap.unefois) {
          const cle = s.id + '|' + i;
          if (P.unefois.has(cle)) return;
          P.unefois.add(cle);
        }
        if (s.zone === 'effet') P.enAttente.push({src: s.srcId, lki: s, ctrl: s.ctrl, cap, evt: e, memo: s.memo, memoJ: s.memoJ});
        else {
          /* Panharmonicon : la même capacité, une fois de plus par statique. */
          for (let k = 1 + declenchementsEnPlus(P, s, cap, e); k > 0; k--) P.enAttente.push({src: s.id, lki: s.lki ? s : null, ctrl: s.ctrl, cap, evt: e});
        }
      });
    }
  }
}

/* Les cartes qui écoutent hors du champ : depuis un cimetière, la zone de
   commandement (« eminence ») ou l'exil. */
function sourcesHorsChamp(P) {
  const r = [];
  for (const J of P.joueurs) for (const z of ['cimetiere', 'commandement', 'exil']) for (const id of J[z]) {
    const o = obj(P, id), d = o && o.def;
    if (!d) continue;
    if (d._hors === undefined) d._hors = d.capacites.some(k => k.zones && k.zones.some(x => x !== 'champ'));
    if (d._hors) r.push(o);
  }
  return r;
}

/* Les déclencheurs de « when you cast ~ », qui écoutent un sort sur la pile
   et non un permanent : le lancement les range lui-même. */
function declencheursDeLancement(P, item) {
  item.def.capacites.forEach(cap => {
    if (cap.genre === 'declenchee' && cap.ecoutes.some(ec => ec.evt === 'lanceSoi'))
      P.enAttente.push({src: item.id, ctrl: item.ctrl, cap, evt: {t: 'lance', joueur: item.ctrl, def: item.def}});
  });
}
