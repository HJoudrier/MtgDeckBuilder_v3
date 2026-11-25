/* =====================================================================
   js/forgeCoutsC.js — Ce que les statiques font au coût de jouer et au
   moment de jouer

   Lot F65, ce que demandaient Bolas's Citadel, Valgavoth, Nashi, Gwenom,
   Inside Information, Conduit of Ruin, Fist of Suns, Rooftop Storm,
   Submerge, Silver-Fur Master, Fluctuator, Blossoming Tortoise, Tithe
   Taker, Teferi (Master of Time), Timely Ward, Flash Photography :
   - `MayPlayAltManaCost$ PayLife<ConvertedManaCost>` : jouer une carte de
     son exil ou du dessus de sa bibliothèque en payant sa valeur de mana en
     vie ; `MayPlayAltManaCost$ 0`, gratuitement ;
   - `AlternativeCost` accordé par un permanent à tous les sorts qu'on lance
     (ou à ceux qui répondent à `ValidCard$`) : une variante de plus pour
     chaque statique qui convient ; `CheckSecondSVar$` ajoute une seconde
     condition à la première ;
   - `ReduceCost` / `RaiseCost` des **capacités** (`Type$ Ability`,
     `ValidSpell$ Activated.Cycling`) : le coût de mana d'une capacité vue
     par celui qui l'active, avec `MinMana$` ;
   - `CastWithFlash` : les capacités de loyauté de Teferi, au moment de
     n'importe quel sort ; un sort qui a le flash s'il cible un permanent de
     tel genre (`Spell.IsTargeting Valid …`). Le moteur donne ce flash dès
     qu'une cible de ce genre existe, sans vérifier que la cible choisie en
     est une : simplification annoncée.
   ===================================================================== */

/* —— Jouer depuis une autre zone, pour de la vie ou pour rien ——————— */

const vieEgaleMV = x => x.s.t.MayPlayAltManaCost === 'PayLife<ConvertedManaCost>';

coutPermis = (g => function (P, j, o, depuis, x) {
  return x.s.t.MayPlayAltManaCost === '0' || vieEgaleMV(x) ? coutManaVide() : g(P, j, o, depuis, x);
})(coutPermis);

autrePermis = (g => function (d, x) {
  const r = g(d, x);
  return vieEgaleMV(x) && r !== undefined ? fusionAutres(r, {vie: d.mv}) : r;
})(autrePermis);

forgeSait('param', 'Continuous.MayPlayAltManaCost');

/* —— Un autre coût accordé à tous les sorts ———————————————————————— */

/* Le coût alternatif d'une statique est-il de ceux qu'on sait jouer ? La
   carte qui se le donne à elle-même, ou un permanent qui l'offre aux sorts
   de son contrôleur (`ValidSA$ Spell`, `Spell.Samurai`). */
function alternativeLisible(t) {
  if (!coutForge(t.Cost) || t.XAlternative || t.Announce) return false;
  if (/^(All|Hand)$/.test(t.EffectZone || 'All') && (t.ValidSA === 'Spell.Self' || (t.ValidSA === 'Spell' && t.ValidCard === 'Card.Self'))) return true;
  return /^(Battlefield|Command)?$/.test(t.EffectZone || '') && /^Spell(\.\w+)?$/.test(t.ValidSA || '') && t.ValidSA !== 'Spell.Self' && (!t.ValidPlayer || t.ValidPlayer === 'You');
}

variantesEtendues = (g => function (P, j, o, depuis, essaie) {
  g(P, j, o, depuis, essaie);
  if (depuis !== 'main' && depuis !== 'commandement') return;
  let k = 100;
  for (const {src, s} of statiquesMode(P, 'AlternativeCost')) {
    const t = s.t;
    if (src.id === o.id || src.ctrl !== j || t.ValidSA === 'Spell.Self') continue;
    const type = (/^Spell\.(\w+)$/.exec(t.ValidSA) || [])[1], filtre = t.ValidCard || (type ? 'Card.' + type : null);
    if (filtre && !forgeValideDef(o.def, filtre, src.ctrl, j, o.id, P)) continue;
    const env = envStatique(src, s), c = coutForge(t.Cost);
    if (c && conditionForge(P, t, env)) essaie('alt' + k++, coutSort(P, j, o, depuis, c.cout.mana), autresCout(c.cout));
  }
})(variantesEtendues);

/* Deux SVars à la fois : « if an opponent controls a Forest and you control an Island ». */
conditionForge = (g => function (P, t, env) {
  if (t.CheckSecondSVar && !seuilForge(P, forgeNombre(P, t.CheckSecondSVar, env), t.SecondSVarCompare, env)) return false;
  return g(P, t, env);
})(conditionForge);

forgeSait('param', 'AlternativeCost.CheckSecondSVar', 'ReduceCost.OnlyFirstSpell', 'RaiseCost.ValidSpell', 'ReduceCost.MinMana', 'ReduceCost.AffectedZone');

/* —— Les capacités plus ou moins chères ——————————————————————————— */

/* La statique de coût vise-t-elle des capacités que `viseCapacite()` sait reconnaître ? */
function capacitesLisibles(t) {
  const alt = '(Spell|Activated\\.(Cycling|Ninjutsu|Equip|!ManaAbility))';
  return /^(ReduceCost|RaiseCost)$/.test(t.Mode) && !t.Cost && !t.ValidTarget && new RegExp('^' + alt + '(,' + alt + ')*$').test(t.ValidSpell);
}

/* Ce que la statique dit d'une capacité : `Type$ Ability` pour celles du
   permanent qu'elle vise, `ValidSpell$ Activated.Cycling` pour une famille. */
function viseCapacite(P, t, src, j, o, k) {
  const env = envStatique(src, {t, face: null});
  if (t.Activator === 'You' && j !== src.ctrl) return false;
  if (t.Activator === 'Opponent' && j === src.ctrl) return false;
  if (t.Type === 'Ability' && !t.ValidSpell) return !t.ValidCard || forgeValideObjet(P, o, t.ValidCard, src, src.ctrl, env, true);
  return String(t.ValidSpell || '').split(',').some(alt => {
    const [tete, ...props] = alt.trim().split('.');
    if (tete !== 'Activated' && tete !== 'Ability') return false;
    return props.every(p => ({'!ManaAbility': k.genre !== 'mana', ManaAbility: k.genre === 'mana', Cycling: !!k.cycle,
      Ninjutsu: /^Ninjutsu/.test(k.texte || ''), Equip: /^Equip/.test(k.texte || '')})[p] === true) &&
      (!t.ValidCard || t.ValidCard === 'Card' || forgeValideObjet(P, o, t.ValidCard, src, src.ctrl, env, true));
  });
}

capaciteReduite = (g => function (P, j, o, k) {
  k = g(P, j, o, k);
  if (k.genre !== 'activee' || !k.cout.mana) return k;
  let plus = 0, moins = 0, min = 0;
  for (const mode of ['ReduceCost', 'RaiseCost']) for (const {src, s} of statiquesMode(P, mode)) {
    const t = s.t;
    if (t.Cost || t.ValidTarget || !(t.Type === 'Ability' || /Activated|Ability/.test(t.ValidSpell || '')) || !viseCapacite(P, t, src, j, o, k)) continue;
    const env = envStatique(src, s);
    if (!conditionForge(P, t, env)) continue;
    const n = forgeNombre(P, t.Amount || 1, env);
    if (mode === 'ReduceCost') { moins += n; if (t.MinMana) min = Math.max(min, +t.MinMana); } else plus += n;
  }
  const base = k.cout.mana;
  /* Jamais sous `MinMana`, ni sous zéro : seul le générique se réduit. */
  const reduit = Math.min(moins, Math.max(0, base.generique + plus - Math.max(0, min - (base.total - base.generique))));
  const net = plus - Math.max(0, reduit);
  if (!net) return k;
  const mana = net < 0 ? moinsMana(base, {generique: -net, couleurs: {}}) : sommeMana(base, coutComplet(manaSeul(String(net))).mana);
  return {...k, cout: {...k.cout, mana}};
})(capaciteReduite);

/* —— Le flash ————————————————————————————————————————————————————— */

/* Les formes de `ValidSA$` d'un `CastWithFlash` qu'on sait lire. */
function flashLisible(v) { return v === 'Spell' || v === 'Activated.Loyalty' || /^Spell\.XCostLE\d+$/.test(v) || /^Spell\.IsTargeting Valid \S+$/.test(v); }

flashAccorde = (g => function (P, j, o, d) {
  return !!statiqueQui(P, 'CastWithFlash', (t, src, env) => {
    if (!joueurStatique(P, j, t.Caster, src, env)) return false;
    const sa = t.ValidSA || 'Spell';
    if (sa === 'Activated.Loyalty') return false;
    const m = /^Spell\.IsTargeting Valid (\S+)$/.exec(sa);
    if (m && !P.champ.some(id => forgeValideObjet(P, obj(P, id), m[1], o, j, env, true))) return false;
    return !t.ValidCard || forgeValideDef(d, t.ValidCard, src === o ? j : src.ctrl, j, o.id);
  }, o);
})(flashAccorde);

/* Teferi, Master of Time : ses capacités de loyauté, quand on pourrait lancer un éphémère. */
function loyauteEclair(P, j, o) {
  return !!statiqueQui(P, 'CastWithFlash', (t, src, env) => t.ValidSA === 'Activated.Loyalty' && src.id === o.id &&
    joueurStatique(P, j, t.Caster, src, env) && (!t.ValidCard || forgeValideObjet(P, o, t.ValidCard, src, src.ctrl, env, true)));
}

forgeSait('param', 'CastWithFlash.ValidSA');
