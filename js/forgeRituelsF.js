/* =====================================================================
   js/forgeRituelsF.js — Les rituels d'EDHREC : les derniers choix

   Lot F107, fin :
   - Secret of Bloodbending : `ControlPlayer | Combat$ True` — diriger un
     adversaire pendant son prochain combat seulement, ou tout son tour si le
     coût facultatif a été payé (`Condition$ OptionalCost`) ;
   - Celestial Reunion : un coût facultatif « choose a creature type and behold
     two creatures of that type » ; le type choisi est lu ensuite (`ChosenType`) ;
   - Green Sun's Twilight : `DigMultiple | ChangeLater` — révéler, choisir une
     créature et/ou un terrain sans rien déplacer encore, puis tout mettre en
     main (ou sur le champ si X ≥ 5) et le reste sous la bibliothèque, dans un
     ordre tiré ;
   - Mythos of Snapdax : `ChooseCard | ChooseEach` — choisir un permanent de
     chaque sorte, pour chacun ou pour soi seul ;
   - New Blood : `ChangeText` — le mot d'un type de créature remplacé partout
     dans la définition de la carte.
   ===================================================================== */

/* —— Diriger un adversaire, le temps d'un combat —————————————————————————— */

const ETAPES_COMBAT_DIRIGE = ['debutCombat', 'attaquants', 'bloqueurs', 'initiative', 'degats', 'finCombat'];
directeurDe = function (P, j) {
  if (!P.controles || !P.controles.length) return null;
  const enCombat = ETAPES_COMBAT_DIRIGE.includes(P.etape);
  P.controles = P.controles.filter(c => !P.joueurs[c.par].elimine && !(c.vu && (P.actif !== c.cible || (c.combat && !enCombat))));
  const c = P.controles.find(x => x.cible === j && P.actif === j && P.tour > x.depuis && (!x.combat || enCombat));
  if (c) c.vu = true;
  return c ? c.par : null;
};
forgeSait('param', 'ControlPlayer.Combat', 'ControlPlayer.ConditionOptionalPaid');
FORGE_COMMUNS.add('ConditionOptionalPaid');
forgeSait('param', 'ConditionOptionalPaid', 'ConditionManaNotSpent');
FORGE_API.ControlPlayer.prepare = (p => function (t, op) { return !t.Controller && (!t.Combat || t.Combat === 'True'); })(FORGE_API.ControlPlayer.prepare);
FORGE_API.ControlPlayer.gen = (g => function* (P, t, env) {
  const avant = (P.controles || []).length;
  yield* g(P, t, env);
  if (t.Combat === 'True') (P.controles || []).slice(avant).forEach(c => { c.combat = true; });
})(FORGE_API.ControlPlayer.gen);
/* « If this spell's additional cost was paid » : `Condition$ OptionalCost`, avec `ConditionOptionalPaid$ True|False`. */
conditionForge = (g => function (P, t, env) {
  if (t.Condition === 'OptionalCost' && t.ConditionOptionalPaid) {
    const paye = !!(env.ctx.optionnel || (env.src && env.src.optionnel));
    if (paye !== (t.ConditionOptionalPaid !== 'False')) return false;
    return g(P, {...t, Condition: undefined}, env);
  }
  return g(P, t, env);
})(conditionForge);

/* —— Choisir un type de créature en payant ——————————————————————————— */

forgeSait('cout', 'ChooseCreatureType');
COUTS_B.ChooseCreatureType = (c, n) => { c.choisitType = true; return true; };
COUTS_B.Behold = (g => (c, n, p) => /Chosen/.test(p[1] || '') ? (c.contempleType = {n}) : g(c, n, p))(COUTS_B.Behold);
CHAMPS_COUTS_B.push('choisitType', 'contempleType');
/* Les types de créature qu'au moins n créatures — sur le champ ou en main — portent. */
function typesContemplables(P, j, o, n) {
  const compte = {};
  [...champDe(P, j).map(x => x.id), ...P.joueurs[j].main].filter(id => id !== o.id && estCreature(obj(P, id))).forEach(id =>
    new Set(obj(P, id).def.sousTypes || []).forEach(t => { compte[t] = (compte[t] || 0) + 1; }));
  return Object.keys(compte).filter(t => compte[t] >= n);
}
coutAutrePossibleB = (g => function (P, j, o, c) {
  if (c.contempleType && !typesContemplables(P, j, o, c.contempleType.n).length) return false;
  return g(P, j, o, c);
})(coutAutrePossibleB);
paieAutreB = (g => function* (P, j, o, c) {
  if (c.choisitType && c.contempleType) {
    const types = typesContemplables(P, j, o, c.contempleType.n);
    if (types.length) choixDe(P, o).type = types[yield* choisitUn(P, j, types, 'Choisir un type de créature', 0, o.id)];
  }
  yield* g(P, j, o, c);
})(paieAutreB);

/* —— Green Sun's Twilight ————————————————————————————————————————— */

forgeSait('param', 'DigMultiple.ChangeLater', 'DigMultiple.RememberChanged', 'DigMultiple.ImprintRest', 'DigMultiple.Reveal', 'ChangeZone.DestAltSVarCompare', 'ChangeZone.RandomOrder');
FORGE_API.DigMultiple.prepare = (p => function (t, op) { return t.ChangeLater === 'True' || !p || p.call(this, t, op); })(FORGE_API.DigMultiple.prepare);
/* Révéler le dessus, choisir (rien n'est déplacé), retenir les choisies, imprimer le reste. */
FORGE_API.DigMultiple.gen = (g => function* (P, t, env) {
  if (t.ChangeLater !== 'True') return yield* g(P, t, env);
  const n = forgeNombre(P, t.DigNum || 1, env);
  for (const j of joueursForge(P, t, env)) {
    const dessus = P.joueurs[j].bibliotheque.slice(-n).reverse(), pris = [];
    if (!dessus.length) continue;
    if (t.Reveal === 'True') jn(P, `${P.joueurs[j].nom} révèle ${dessus.map(id => obj(P, id).def.nom).join(', ')}`);
    for (const v of String(t.ChangeValid || 'Card').split(',').map(x => x.trim()).filter(Boolean)) {
      const ok = dessus.filter(id => !pris.includes(id) && forgeValideObjet(P, obj(P, id), v, env.src, env.ctrl, env));
      if (ok.length) pris.push(...(yield* choisitCartes(P, j, ok, 1, 'Prendre', 'cartes', 0)));
    }
    if (t.RememberChanged === 'True') pris.forEach(id => retiensForge(env.ctx, id));
    if (t.ImprintRest === 'True') dessus.filter(id => !pris.includes(id)).forEach(id => retiensEmpreinte(empreinteDe(P, env.ctx, env.src), id));
  }
})(FORGE_API.DigMultiple.gen);
FORGE_API.ChangeZone.gen = (g => function* (P, t, env) {
  /* `DestAltSVarCompare$ GE5` : l'autre destination n'est offerte que si la comparaison tient. */
  if (t.DestinationAlternative && t.DestAltSVarCompare) {
    const ok = seuilForge(P, forgeNombre(P, t.DestAltSVar, env), t.DestAltSVarCompare, env);
    t = ok ? {...t, DestAltSVar: undefined, DestAltSVarCompare: undefined} : {...t, DestinationAlternative: undefined, DestAltSVar: undefined, DestAltSVarCompare: undefined};
  }
  /* « In a random order » : ce que l'empreinte tient se range dans un ordre tiré. */
  if (t.RandomOrder === 'True' && t.Defined === 'Imprinted') melangeHasard(P.rng, empreinteDe(P, env.ctx, env.src));
  return yield* g(P, t, env);
})(FORGE_API.ChangeZone.gen);

/* —— Mythos of Snapdax ————————————————————————————————————————————— */

forgeSait('param', 'ChooseCard.ChooseEach', 'ChooseCard.ControlledByPlayer', 'ChooseCard.ConditionManaNotSpent');
FORGE_COMMUNS.add('ConditionManaNotSpent');
conditionForge = (g => function (P, t, env) {
  if (t.ConditionManaNotSpent) {
    const s = env.src, d = (s && (s.manaSort || (s.lance && s.lance.mana))) || {};
    if (String(t.ConditionManaNotSpent).split(/[\s,]+/).filter(Boolean).every(k => (d[k] || 0) > 0)) return false;
  }
  return g(P, t, env);
})(conditionForge);
/* Pour chaque chooser : un permanent de chaque sorte, parmi les siens (ou ceux du joueur de la boucle). */
FORGE_API.ChooseCard.gen = (g => function* (P, t, env) {
  if (!t.ChooseEach) return yield* g(P, t, env);
  for (const j of joueursForge(P, t, env)) {
    const pour = t.ControlledByPlayer === 'Remembered' ? env.ctx.memoJ.slice() : [j];
    for (const sorte of String(t.ChooseEach).split('&').map(s => s.trim()).filter(Boolean)) {
      const ids = objetsZone(P, 'champ').filter(o => pour.includes(o.ctrl) && forgeValideObjet(P, o, t.Choices || 'Permanent', env.src, env.ctrl, env) &&
        forgeValideObjet(P, o, sorte, env.src, env.ctrl, env)).map(o => o.id);
      if (!ids.length) continue;
      const pris = yield* choisitCartes(P, j, ids, 1, `Choisir : ${sorte}`, 'cartes', 1);
      if (t.RememberChosen === 'True') pris.forEach(id => retiensForge(env.ctx, id));
    }
  }
})(FORGE_API.ChooseCard.gen);

/* —— New Blood ———————————————————————————————————————————————————— */

forgeSait('param', 'ChangeText.ChangeTypeWord', 'ChangeText.Duration');
/* La définition, recopiée, avec un mot de type remplacé partout où il s'écrit (sous-types en minuscules, filtres en majuscule initiale). */
function defTexteChange(def, de, vers) {
  const re = new RegExp('\\b(' + de + ')\\b', 'g'), vus = new Map();
  const marche = (v, prof) => {
    if (typeof v === 'string') return v.replace(re, vers).replace(new RegExp('\\b' + de.toLowerCase() + '\\b', 'g'), vers.toLowerCase());
    if (!v || typeof v !== 'object' || prof > 9) return v;
    if (vus.has(v)) return vus.get(v);
    const r = Array.isArray(v) ? [] : Object.create(Object.getPrototypeOf(v));
    vus.set(v, r);
    for (const k of Object.keys(v)) r[k] = typeof v[k] === 'function' ? v[k] : marche(v[k], prof + 1);
    return r;
  };
  return marche(def, 0);
}
forgeEffet('ChangeText', ['Defined', 'ChangeTypeWord', 'Duration'], function* (P, t, env) {
  const [, vers] = String(t.ChangeTypeWord || '').split(/\s+/).length === 2 ? String(t.ChangeTypeWord).split(/\s+/) : [null, 'Vampire'];
  for (const o of objetsForge(P, t, env).filter(x => x && x.j == null && x.zone === 'champ' && !x.lki)) {
    const types = (o.def.sousTypes || []).filter(x => x.toLowerCase() !== vers.toLowerCase());
    if (!types.length) continue;
    const noms = types.map(x => x.charAt(0).toUpperCase() + x.slice(1));
    const de = noms[yield* choisitUn(P, env.ctrl, noms, `Quel type de créature de ${o.def.nom} remplacer par ${vers} ?`, 0, env.ctx.source)];
    o.def = defTexteChange(o.def, de, vers);
    P.ver++;
    jn(P, `${o.def.nom} : « ${de} » devient « ${vers} »`);
  }
}, (t, op) => { op.op = 'forge'; op.hostile = false; });
