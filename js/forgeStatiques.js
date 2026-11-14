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
    if (FORGE_TYPES_CARTE[m]) r.types.push(FORGE_TYPES_CARTE[m]); else r.sousTypes.push(m.toLowerCase());
  });
  return r;
}

/* `Red`, `Black & Green`, `Colorless` → des couleurs du moteur. */
function couleursMots(txt) {
  return String(txt || '').split(/\s*[,&]\s*|\s+/).map(m => FORGE_COULEURS[m]).filter(Boolean);
}

/* Les valeurs qu'on sait tenir dans une statique : on n'ajoute pas le type
   créature par une statique (le combat et les actions d'état ne le
   verraient pas), ni un type qui n'en est pas un. */
function statiqueTenable(t) {
  if (t.AddType && (/\bCreature\b|AllCreatureTypes/.test(t.AddType) || (/ChosenType/.test(t.AddType) && t.AddType !== 'ChosenType'))) return false;
  /* Hors du champ, seule la réduction que la carte porte pour elle-même. */
  if (t.EffectZone && t.EffectZone !== 'Battlefield' && !(t.Mode === 'ReduceCost' && /^(All|Hand)$/.test(t.EffectZone) && t.ValidCard === 'Card.Self')) return false;
  if ((t.SetColor || t.AddColor) && !couleursMots(t.SetColor || t.AddColor).length && !/Colorless/.test(t.SetColor || '')) return false;
  return true;
}

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

forgeSait('param', 'Continuous.EffectZone');
forgeStatique('Continuous', ['AddType', 'SetColor', 'AddColor', 'Affected', 'AffectedDefined', 'AddPower', 'AddToughness', 'AddKeyword', 'SetPower', 'SetToughness',
  'CharacteristicDefining'], (P, src, s, o, r) => {
  const t = s.t;
  const cda = t.CharacteristicDefining === 'True' && !t.Affected && !t.AffectedDefined;
  const env = cda ? (src.id === o.id ? envStatique(src, s) : null) : viseForge(P, src, s, o);
  if (cda && env && !conditionForge(P, t, env)) return;
  if (!env) return;
  if (t.AddPower) r.f += forgeNombre(P, t.AddPower, env);
  if (t.AddToughness) r.e += forgeNombre(P, t.AddToughness, env);
  if (t.AddKeyword) r.mots |= motsForge(t.AddKeyword);
  if (t.SetPower) r.setF = forgeNombre(P, t.SetPower, env);
  if (t.SetToughness) r.setE = forgeNombre(P, t.SetToughness, env);
  if (t.AddType === 'ChosenType') { const k = choixDe(P, src).type; if (k) r.sousTypes.push(k); }
  else if (t.AddType) { const ty = typesForge(t.AddType); r.types.push(...ty.types); r.sousTypes.push(...ty.sousTypes); }
  if (t.SetColor) r.couleurs = couleursMots(t.SetColor);
  if (t.AddColor) r.couleurs = [...new Set([...(r.couleurs || o.def.couleurs), ...couleursMots(t.AddColor)])];
});

forgeStatique('CantAttack', ['ValidCard'], (P, src, s, o, r) => { if (viseForge(P, src, s, o, 'ValidCard')) r.attaque = true; });
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
    if (t.Type && t.Type !== 'Spell') continue;
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
