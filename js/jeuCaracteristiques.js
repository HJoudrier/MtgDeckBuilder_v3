/* =====================================================================
   js/jeuCaracteristiques.js — Ce qu'un permanent est en ce moment

   Force, endurance, mots-clés, interdictions : la définition imprimée, plus
   les marqueurs, plus les statiques en vigueur sur le champ, plus les effets
   « jusqu'à la fin du tour ». Pas de système de couches complet — les bonus
   s'additionnent, ce qui est exact pour la couche 7c et suffit à presque
   tout ; c'est la simplification annoncée.

   Le calcul est gardé sur l'objet tant que `P.ver` ne bouge pas : un
   combat lit cent fois la force d'une créature, le champ n'a pas changé
   entre-temps.
   ===================================================================== */

/* Les statiques en vigueur, relevées une fois par version de l'état. */
function statiquesEnJeu(P) {
  if (P._statV === P.ver) return P._stat;
  const r = [];
  for (const id of P.champ) {
    const o = obj(P, id);
    if (o.def.statiques.length) o.def.statiques.forEach(s => r.push({src: o, s}));
  }
  P._statV = P.ver; P._stat = r;
  return r;
}

/* Une statique s'applique-t-elle à cet objet ? Le sujet se juge sur les
   caractéristiques **imprimées** de l'objet : les juger sur ses
   caractéristiques calculées ferait dépendre le calcul de lui-même. */
function statiqueVise(P, src, s, o) {
  if (s.sujet === 'soi') return src.id === o.id;
  if (s.sujet === 'attache') return src.att === o.id;
  if (!s.sujet || typeof s.sujet !== 'object') return false;
  return correspondBase(P, o, s.sujet, src, src.ctrl);
}

/* Les caractéristiques calculées d'un objet du champ (ou d'une carte, pour
   laquelle seule la définition compte). */
function car(P, o) {
  if (o._v === P.ver && o._c) return o._c;
  const d = o.def;
  let force = d.force || 0, endurance = d.endurance || 0, mots = d.mots;
  let nePeutAttaquer = false, nePeutBloquer = false;
  if (o.zone === 'champ') {
    const p = (o.marq['+1/+1'] || 0) - (o.marq['-1/-1'] || 0);
    force += p; endurance += p;
    for (const {src, s} of statiquesEnJeu(P)) {
      if (s.s !== 'bonus' && s.s !== 'interdit') continue;
      if (!statiqueVise(P, src, s, o)) continue;
      if (s.s === 'bonus') { force += s.f; endurance += s.e; mots |= s.mots; }
      else { if (s.attaque) nePeutAttaquer = true; if (s.blocage) nePeutBloquer = true; }
    }
    for (const m of o.mods) { force += m.f || 0; endurance += m.e || 0; mots |= m.mots || 0; }
  }
  o._c = {force, endurance, mots, types: d.types, sousTypes: d.sousTypes, couleurs: d.couleurs,
    supers: d.supers, nePeutAttaquer, nePeutBloquer, loyaute: o.marq.loyaute || 0};
  o._v = P.ver;
  return o._c;
}

function aMot(P, o, m) { return (car(P, o).mots & m) !== 0; }
function estType(o, t) { return o.def.types.includes(t); }
function estCreature(o) { return o.def.types.includes('creature'); }

/* Une créature peut-elle s'engager pour attaquer ou pour une capacité {T} :
   elle est là depuis le début du tour de son contrôleur, ou elle a la
   célérité (règle 302.6). */
function peutEngagerSoi(P, o) {
  if (o.engage) return false;
  if (!estCreature(o)) return true;
  return o.pret || aMot(P, o, MOT.CELERITE);
}

/* La valeur de mana d'un objet ou d'une définition. */
function mvDe(o) { return (o.def || o).mv || 0; }
