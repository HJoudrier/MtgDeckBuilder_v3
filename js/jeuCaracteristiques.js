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
  if (P.effets) P.effets.forEach(e => e.def.statiques.forEach(s => r.push({src: e, s})));
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
  const d = o.def, a = animation(o);
  let force = a.force, endurance = a.endurance, mots = a.mots;
  let types = a.types, sousTypes = a.sousTypes, couleurs = a.couleurs;
  let nePeutAttaquer = false, nePeutBloquer = false, pasPar = null;
  if (o.zone === 'champ') {
    /* Les statiques de Forge d'abord : une force fixée (« base power and
       toughness ») remplace l'imprimée avant marqueurs et bonus. */
    const fg = typeof statiquesForgeSur === 'function' && P.forgeStat !== false ? statiquesForgeSur(P, o) : null;
    if (fg) {
      if (fg.setF != null) force = fg.setF;
      if (fg.setE != null) endurance = fg.setE;
      force += fg.f; endurance += fg.e; mots |= fg.mots;
      nePeutAttaquer = fg.attaque; nePeutBloquer = fg.blocage; pasPar = fg.pasPar;
      if (fg.types.length) types = [...new Set([...types, ...fg.types])];
      if (fg.sousTypes.length) sousTypes = [...new Set([...sousTypes, ...fg.sousTypes])];
      if (fg.couleurs) couleurs = fg.couleurs;
    }
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
  o._c = {force, endurance, mots, types, sousTypes, couleurs, changelin: a.changelin,
    supers: d.supers, nePeutAttaquer, nePeutBloquer, pasPar, loyaute: o.marq.loyaute || 0};
  o._v = P.ver;
  return o._c;
}

/* La couche propre à l'objet : ce qu'un effet l'a fait devenir — un terrain
   qui devient créature, un véhicule piloté (`o.anime`, une liste, la
   dernière force fixée l'emportant : règle 613, couches 4, 5 et 7b). Sans
   animation, l'imprimé. */
function animation(o) {
  const d = o.def;
  if (!o.anime || !o.anime.length) {
    return {force: d.force || 0, endurance: d.endurance || 0, mots: d.mots, types: d.types, sousTypes: d.sousTypes, couleurs: d.couleurs,
      changelin: !!(d.params && d.params.changelin)};
  }
  const r = {force: d.force || 0, endurance: d.endurance || 0, mots: d.mots, types: d.types.slice(), sousTypes: d.sousTypes.slice(), couleurs: d.couleurs,
    changelin: !!(d.params && d.params.changelin)};
  for (const a of o.anime) {
    if (a.force != null) r.force = a.force;
    if (a.endurance != null) r.endurance = a.endurance;
    if (a.retireSousTypes) r.sousTypes = [];
    (a.types || []).forEach(t => { if (!r.types.includes(t)) r.types.push(t); });
    (a.sousTypes || []).forEach(t => { if (!r.sousTypes.includes(t)) r.sousTypes.push(t); });
    if (a.couleurs) r.couleurs = a.ecrase ? a.couleurs : [...new Set([...r.couleurs, ...a.couleurs])];
    r.mots |= a.mots || 0;
  }
  return r;
}

function aMot(P, o, m) { return (car(P, o).mots & m) !== 0; }
function estType(o, t) { return o.def.types.includes(t) || (!!o.anime && o.anime.some(a => (a.types || []).includes(t))); }
function estCreature(o) { return estType(o, 'creature'); }

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
