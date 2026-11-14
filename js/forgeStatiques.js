/* =====================================================================
   js/forgeStatiques.js — Les capacités statiques de Forge

   `S:Mode$ Continuous | Affected$ Creature.YouCtrl | AddPower$ 1 |
   AddToughness$ 1` : une statique est rangée telle quelle dans la
   définition (`{s: 'forge', t, face}`), et lue par le calcul des
   caractéristiques (js/jeuCaracteristiques.js `car()`), par celui du coût
   d'un sort (js/jeuLancer.js `coutSort()`) et par le blocage
   (js/jeuCombat.js `peutBloquer()`).

   Les sujets se jugent sur les caractéristiques **imprimées** et les
   quantités sur une vue sans statiques : sans quoi « +1/+1 pour chaque
   créature » ferait dépendre le calcul de lui-même.
   ===================================================================== */

const FORGE_STATIQUES = {};

/* `Creature,Elemental` ou `Swamp & Forest` → types et sous-types du moteur. */
function typesForge(txt) {
  const r = {types: [], sousTypes: []};
  String(txt || '').split(/\s*[,&]\s*/).filter(Boolean).forEach(m => {
    if (m === 'AllCreatureTypes') return;
    if (FORGE_TYPES_CARTE[m]) r.types.push(FORGE_TYPES_CARTE[m]); else r.sousTypes.push(m.toLowerCase());
  });
  return r;
}

/* `Red`, `Black & Green`, `Colorless` → des couleurs du moteur. */
function couleursMots(txt) {
  return String(txt || '').split(/\s*[,&]\s*|\s+/).map(m => FORGE_COULEURS[m]).filter(Boolean);
}

/* Les valeurs qu'on sait tenir dans une statique. Le type ajouté, le
   contrôle et la perte des capacités passent par la couche des actions
   d'état (js/jeuCouches.js), que le combat et `estType()` voient. */
function statiqueTenable(t) {
  /* Jouer depuis une autre zone : la pioche d'impulsion, le cimetière, le
     dessus de la bibliothèque (js/jeuPermis.js). */
  if (t.MayPlay) {
    if (t.MayPlay !== 'True' || !/^(Exile|Graveyard|Library)(,(Exile|Graveyard|Library))*$/.test(t.AffectedZone || '')) return false;
    if (t.MayPlayIgnoreColor || t.MayPlayAltManaCost || t.MayPlayIgnoreType || (t.MayPlayLimit && t.MayPlayLimit !== '1')) return false;
    if (t.EffectZone && !(/^(Graveyard|Exile|All)$/.test(t.EffectZone) && t.Affected === 'Card.Self')) return false;
    return true;
  }
  /* Regarder le dessus de sa bibliothèque : une information, sans effet sur
     le jeu du moteur. */
  if (t.MayLookAt && !t.AddKeyword && !t.AddPower && !t.AddAbility) return true;
  if (t.AffectedZone && t.AffectedZone !== 'Battlefield') return false;
  if (t.AddType && /ChosenType/.test(t.AddType) && t.AddType !== 'ChosenType') return false;
  if (t.AddHiddenKeyword && !t.AddHiddenKeyword.split('&').every(k => CACHES_TENUS[k.trim()])) return false;
  if (t.GainControl && t.GainControl !== 'You') return false;
  if (t.Target && /CantAttack/.test(t.Mode) && !t.Target.split(',').every(x => /^(You|Opponent|Player|Planeswalker\.YouCtrl)$/.test(x.trim()))) return false;
  if (t.UnlessDefender && !DEFENSEUR_PROPRIETE.test(t.UnlessDefender)) return false;
  if (t.Mode === 'CantAttackUnless' && !/^\d+$/.test(t.Cost || '')) return false;
  if (t.Mode === 'CastWithFlash' && t.ValidSA && t.ValidSA !== 'Spell') return false;
  /* Hors du champ, seule la réduction que la carte porte pour elle-même. */
  if (t.EffectZone && t.EffectZone !== 'Battlefield' && !(/^(ReduceCost|CastWithFlash|CantBeCast)$/.test(t.Mode) && /^(All|Hand)$/.test(t.EffectZone) && t.ValidCard === 'Card.Self')) return false;
  if ((t.SetColor || t.AddColor) && !couleursMots(t.SetColor || t.AddColor).length && !/Colorless/.test(t.SetColor || '')) return false;
  return true;
}

/* Les mots-clés cachés que le moteur tient : des interdictions. */
const CACHES_TENUS = {"CARDNAME can't block.": {blocage: true}, "CARDNAME can't attack.": {attaque: true},
  "CARDNAME can't attack or block.": {attaque: true, blocage: true}};

function forgeStatique(mode, params, f) {
  FORGE_STATIQUES[mode] = f;
  forgeSait('stat', mode);
  forgeSait('param', ...params.map(p => mode + '.' + p));
}

/* Le contexte d'une statique : sa source en est le seul repère. */
function envStatique(src, s) {
  return {face: s.face, ctx: {cibles: [], memo: src.memo || [], memoJ: src.memoJ || [], x: 0}, src, ctrl: src.ctrl, op: {}, base: true};
}

/* La statique vise-t-elle cet objet, et ses conditions tiennent-elles ? */
function viseForge(P, src, s, o, cle) {
  const env = envStatique(src, s);
  if (!cle && s.t.AffectedDefined) {
    if (!forgeDefinis(P, s.t.AffectedDefined, env).some(x => x.id === o.id)) return null;
    return conditionForge(P, s.t, env) ? env : null;
  }
  const v = s.t[cle || 'Affected'];
  if (v && !forgeValideObjet(P, o, v, src, src.ctrl, env, true)) return null;
  if (!v && cle !== 'aucun') return null;
  return conditionForge(P, s.t, env) ? env : null;
}

forgeSait('param', 'Continuous.EffectZone', 'Continuous.MayPlay', 'Continuous.AffectedZone', 'Continuous.MayPlayWithoutManaCost',
  'Continuous.MayPlayLimit', 'Continuous.MayLookAt');
forgeStatique('Continuous', ['AddType', 'SetColor', 'AddColor', 'Affected', 'AffectedDefined', 'AddPower', 'AddToughness', 'AddKeyword', 'SetPower', 'SetToughness',
  'CharacteristicDefining'], (P, src, s, o, r) => {
  const t = s.t;
  if (t.MayPlay || t.MayLookAt || (t.AffectedZone && t.AffectedZone !== 'Battlefield')) return;
  const cda = t.CharacteristicDefining === 'True' && !t.Affected && !t.AffectedDefined;
  const env = cda ? (src.id === o.id ? envStatique(src, s) : null) : viseForge(P, src, s, o);
  if (cda && env && !conditionForge(P, t, env)) return;
  if (!env) return;
  /* `AffectedX` se compte sur l'objet visé (« P/T equal to its mana
     value »), le reste sur la source. */
  const n = v => forgeNombre(P, v, /^Affected/.test(v) ? {...env, src: o} : env);
  if (t.AddPower) r.f += n(t.AddPower);
  if (t.AddToughness) r.e += n(t.AddToughness);
  if (t.AddKeyword) r.mots |= motsForge(t.AddKeyword);
  if (t.SetPower) r.setF = n(t.SetPower);
  if (t.SetToughness) r.setE = n(t.SetToughness);
  if (t.AddHiddenKeyword) t.AddHiddenKeyword.split('&').forEach(k => { const c = CACHES_TENUS[k.trim()] || {}; if (c.attaque) r.attaque = true; if (c.blocage) r.blocage = true; });
  if (t.AddType === 'ChosenType') { const k = choixDe(P, src).type; if (k) r.sousTypes.push(k); }
  else if (t.AddType) { const ty = typesForge(t.AddType); r.types.push(...ty.types); r.sousTypes.push(...ty.sousTypes); }
  if (t.SetColor) r.couleurs = couleursMots(t.SetColor);
  if (t.AddColor) r.couleurs = [...new Set([...(r.couleurs || o.def.couleurs), ...couleursMots(t.AddColor)])];
});

/* Une interdiction qui dépend du défenseur se juge à la déclaration
   (js/forgeInterdits.js `attaquePermise()`). */
forgeStatique('CantAttack', ['ValidCard'], (P, src, s, o, r) => { if (!s.t.Target && !s.t.UnlessDefender && viseForge(P, src, s, o, 'ValidCard')) r.attaque = true; });
forgeStatique('CantBlock', ['ValidCard'], (P, src, s, o, r) => { if (viseForge(P, src, s, o, 'ValidCard')) r.blocage = true; });
/* « Can't attack or block », écrit en un seul mode. */
forgeSait('stat', 'CantAttack,CantBlock');
forgeSait('param', 'CantAttack,CantBlock.ValidCard');
forgeStatique('CantBlockBy', ['ValidAttacker', 'ValidBlocker'], (P, src, s, o, r) => {
  if (!viseForge(P, src, s, o, 'ValidAttacker')) return;
  if (!s.t.ValidBlocker) r.mots |= MOT.IMBLOCABLE;
  else (r.pasPar = r.pasPar || []).push({v: s.t.ValidBlocker, src});
});
forgeStatique('ReduceCost', ['ValidCard', 'Type', 'Activator', 'Amount', 'EffectZone'], () => {});
forgeStatique('RaiseCost', ['ValidCard', 'Type', 'Activator', 'Amount'], () => {});

/* Ce que les statiques de Forge font à un objet : bonus, mots-clés,
   force fixée, interdictions. Appelé par `car()` une fois par version de
   l'état. */
function statiquesForgeSur(P, o) {
  const r = {f: 0, e: 0, mots: 0, setF: null, setE: null, attaque: false, blocage: false, pasPar: null, types: [], sousTypes: [], couleurs: null};
  if (P._forgeProfondeur > 2) return r;
  P._forgeProfondeur = (P._forgeProfondeur || 0) + 1;
  try {
    for (const {src, s} of statiquesEnJeu(P)) {
      if (s.s !== 'forge') continue;
      String(s.t.Mode).split(',').forEach(m => { const f = FORGE_STATIQUES[m.trim()]; if (f) f(P, src, s, o, r); });
    }
  } finally { P._forgeProfondeur--; }
  return r;
}

/* Les réductions et les hausses de coût de Forge pour un sort que `j`
   lance : `[plus, moins]`. */
function coutsForge(P, j, o) {
  let plus = 0, moins = 0;
  /* « This spell costs {1} less for each… » : la statique de la carte
     elle-même, où qu'elle soit. */
  const siennes = o.def.statiques.filter(s => s.s === 'forge' && s.t.EffectZone && s.t.EffectZone !== 'Battlefield').map(s => ({src: o, s}));
  for (const {src, s} of [...statiquesEnJeu(P).filter(x => x.src.id !== o.id || !x.s.t || !x.s.t.EffectZone), ...siennes]) {
    if (s.s !== 'forge' || (s.t.Mode !== 'ReduceCost' && s.t.Mode !== 'RaiseCost')) continue;
    const t = s.t;
    if ((t.Type && t.Type !== 'Spell') || t.ValidTarget) continue;
    if (t.Activator === 'You' && j !== src.ctrl) continue;
    if (t.Activator === 'Opponent' && j === src.ctrl) continue;
    if (t.ValidCard && !forgeValideDef(o.def, t.ValidCard, src.ctrl, j, o.id)) continue;
    const env = envStatique(src, s);
    if (!conditionForge(P, t, env)) continue;
    const n = forgeNombre(P, t.Amount || 1, env);
    if (t.Mode === 'ReduceCost') moins += n; else plus += n;
  }
  return [plus, moins];
}

/* « This spell costs {2} less to cast if it targets a creature you
   control » : la réduction se juge une fois les cibles prises
   (js/jeuActions.js `lanceSort()`). */
function reductionParCibles(P, j, o, effets) {
  const cibles = [].concat(...effets.map(ef => [].concat(...ef.cibles))).map(c => typeof c === 'number' ? obj(P, c) : c).filter(Boolean);
  if (!cibles.length) return 0;
  const siennes = o.def.statiques.filter(s => s.s === 'forge').map(s => ({src: o, s}));
  let n = 0;
  for (const {src, s} of [...statiquesEnJeu(P).filter(x => x.src.id !== o.id), ...siennes]) {
    const t = s.t;
    if (s.s !== 'forge' || (t.Mode !== 'ReduceCost' && t.Mode !== 'RaiseCost') || !t.ValidTarget || t.Cost || (t.Type && t.Type !== 'Spell')) continue;
    if ((t.Activator === 'You' && j !== src.ctrl) || (t.Activator === 'Opponent' && j === src.ctrl)) continue;
    if (t.ValidCard && !forgeValideDef(o.def, t.ValidCard, src.ctrl, j, o.id)) continue;
    const env = envStatique(src, s);
    if (!cibles.some(c => c.j != null ? forgeValideJoueur(P, c.j, t.ValidTarget, src.ctrl, env) : forgeValideObjet(P, c, t.ValidTarget, src, src.ctrl, env, true))) continue;
    if (conditionForge(P, t, env)) n += (t.Mode === 'ReduceCost' ? 1 : -1) * forgeNombre(P, t.Amount || 1, env);
  }
  return n;
}

/* La plus grande réduction selon la cible qu'un sort peut espérer : une
   cible qui la donne est en jeu. */
function reductionPossible(P, j, o) {
  let n = 0;
  for (const s of o.def.statiques) {
    const t = s.t;
    if (s.s !== 'forge' || !t || t.Mode !== 'ReduceCost' || !t.ValidTarget || (t.Type && t.Type !== 'Spell')) continue;
    const env = envStatique(o, s);
    const existe = P.champ.some(id => forgeValideObjet(P, obj(P, id), t.ValidTarget, o, j, env, true)) ||
      P.joueurs.some(J => !J.elimine && forgeValideJoueur(P, J.i, t.ValidTarget, j, env));
    if (existe) n += forgeNombre(P, t.Amount || 1, env);
  }
  return n;
}
