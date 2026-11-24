/* =====================================================================
   js/forgeTerrains.js — Ce que les terrains font de plus

   Lot F96 :
   - `TargetsWithSameCreatureType` (Secret Tunnel) : les cibles d'une même
     capacité partagent un type de créature ;
   - `GainControlVariant | ChangeController$ CardOwner` (Homeward Path) :
     chaque joueur reprend les créatures qu'il possède ;
   - `SkipTurn` (Magosi, the Waterveil) : le joueur saute son prochain tour ;
   - `Combo ColorID` (Cryptic Spires) et `Combo NotedColors` (Paliano) : les couleurs qu'on fixe en construisant ou en draftant le deck.
   ===================================================================== */

/* Ces deux objets partagent-ils un type de créature ? Un changelin en partage avec toute créature. */
function partageTypeCreature(P, a, b) {
  if (!a || !b) return false;
  const ca = car(P, a), cb = car(P, b);
  if (ca.changelin || cb.changelin) return true;
  const tb = sousTypesCreature(cb);
  return sousTypesCreature(ca).some(t => tb.includes(t));
}
forgeSait('param', 'Effect.TargetsWithSameCreatureType');

/* Rendre à leur propriétaire les créatures que d'autres contrôlent. */
forgeEffet('GainControlVariant', ['AllValid', 'ChangeController', 'AILogic'], function* (P, t, env) {
  objetsZone(P, 'champ').filter(o => forgeValideObjet(P, o, t.AllValid, env.src, env.ctrl, env) && o.prop != null && o.ctrl !== o.prop).forEach(o => {
    o.ctrl = o.prop; o.ctrlRendu = null; o.pret = false; P.ver++;
  });
}, (t, op) => { op.op = 'forge'; op.hostile = false; }, {prepare: t => t.ChangeController === 'CardOwner' && !!t.AllValid});

/* —— Le mana des cartes du cimetière ——————————————————————————————— */

/* « Add one mana of any color among legendary creature cards in your graveyard » (The Grey Havens) : les couleurs
   des cartes du cimetière du joueur qui répondent au filtre, lues au moment de payer. */
capaciteForge = (g => function (def, face, t, jetons) {
  const m = forgeApi(t) === 'ManaReflected' && /^Defined\.ValidGraveyard (.+)$/.exec(t.Valid || '');
  if (!m) return g(def, face, t, jetons);
  const c = coutForge(t.Cost);
  if (!c || t.SubAbility || t.ReflectProperty !== 'Is' || t.ColorOrType !== 'Color' || Object.keys(c.cout).some(k => k !== 'mana' && k !== 'engage') ||
    (c.cout.mana && c.cout.mana.total) || !tableJouable(t)) return false;
  def.capacites.push({genre: 'mana', cout: c.cout, options: [], reflete: {cimetiere: m[1], type: false}, texte: texteForge(face, t)});
  return true;
})(capaciteForge);

manaReflete = (g => function (P, j, o, k) {
  if (!k.reflete.cimetiere) return g(P, j, o, k);
  const r = new Set();
  P.joueurs[j].cimetiere.map(id => obj(P, id)).filter(x => x && forgeValideObjet(P, x, k.reflete.cimetiere, o, j, null, true)).forEach(x => (x.def.couleurs || []).forEach(l => r.add(l)));
  return [...r];
})(manaReflete);

/* —— Sauter son tour ——————————————————————————————————————————————— */

forgeEffet('SkipTurn', ['NumTurns'], function* (P, t, env) {
  const n = forgeNombre(P, t.NumTurns || 1, env);
  joueursForge(P, t, env).forEach(j => { const s = P.sautes = P.sautes || {}; s[j] = (s[j] || 0) + n; });
}, (t, op) => { op.op = 'forge'; op.hostile = false; });

/* Le joueur qui suit, en passant ceux dont c'est le tour sauté (js/jeuPartie.js `suiteDesTours()`). */
function suivantNonSaute(P, j) {
  let a = suivantVivant(P, j);
  for (let k = 0; k < 20 && ((P.sautes || {})[a] || 0) > 0; k++) { P.sautes[a]--; jn(P, `${P.joueurs[a].nom} saute son tour`); a = suivantVivant(P, a); }
  return a;
}

/* —— Le phasing du permanent lui-même ———————————————————————————————— */

/* `K:Phasing` (Teferi's Isle) : à chaque dégagement de son contrôleur, il sort du jeu s'il y est, il y revient s'il en était sorti. Les
   deux se font ensemble : ce qui revient ne ressort pas aussitôt. Ce qui lui est attaché part avec lui, comme pour l'effet. */
motCleLancementB = (g => function (def, face, jetons, tete, reste) {
  if (tete === 'Phasing' && !reste.length) { def.params.phasing = true; return true; }
  /* Mayhem sans coût, sur un terrain (Oscorp Industries) : on le joue du cimetière le tour où on l'a défaussé. */
  if (tete === 'Mayhem' && !reste.length && def.types.includes('land')) { def.mayhemTerrain = true; return true; }
  return g(def, face, jetons, tete, reste);
})(motCleLancementB);
forgeSait('kw', 'Phasing');

phasesEntrent = (g => function (P) {
  const sortent = champDe(P, P.actif).filter(o => o.def.params && o.def.params.phasing);
  g(P);
  sortent.forEach(o => {
    if (!P.champ.includes(o.id)) return;
    [o, ...P.champ.map(id => obj(P, id)).filter(a => a.att === o.id)].forEach(a => {
      retireDe(P.champ, a.id);
      P.horsPhase = P.horsPhase || [];
      if (!P.horsPhase.some(x => x.id === a.id)) P.horsPhase.push({id: a.id, ctrl: a.ctrl});
    });
    P.ver++;
  });
})(phasesEntrent);

/* —— Un jeton Wastes ———————————————————————————————————————————————— */

/* `CopyPermanent | DefinedName$ Wastes` (Waste Land) : le jeton est une copie de la carte nommée — ici le terrain de base
   sans type, qui produit {C}. Construit une fois, par le lecteur de scripts lui-même. */
let DEF_WASTES = null;
function defWastes() {
  if (DEF_WASTES) return DEF_WASTES;
  const script = 'Name:Wastes\nManaCost:no cost\nTypes:Basic Land\nA:AB$ Mana | Cost$ T | Produced$ C | SpellDescription$ Add {C}.\nOracle:{T}: Add {C}.';
  DEF_WASTES = definitionForge({nom: 'Wastes', cout: '', type: 'Basic Land', texte: '{T}: Add {C}.', motsCles: [], faces: null, forge: script, forgeJetons: {}, manaProduit: 'C'});
  return DEF_WASTES;
}

/* Une copie d'une carte qu'on nomme (« a Lord of the Pit token », Thomil ; « a Black Lotus token », Arzakon) : la définition vient du script Forge de ce nom
   (js/forgeAlchemie.js `defNommee()`) ; Wastes, qui n'a pas de script, se construit ici. Un `DefinedName` qui n'est pas un nom (`Targeted`,
   `Remembered`…) est une désignation, que le moteur lit autrement. */
const DESIGNATIONS_NOM = /^(Targeted|Remembered|RememberedLKI|ChosenCard|Triggered\w*|ValidLibrary.*|Self|Imprinted)$/;
aCopier = (g => function* (P, t, env) {
  if (!t.DefinedName || DESIGNATIONS_NOM.test(t.DefinedName)) return yield* g(P, t, env);
  const def = t.DefinedName === 'Wastes' ? defWastes() : defNommee(t.DefinedName);
  return def ? [{id: -1, def}] : [];
})(aCopier);
forgeSait('param', 'CopyPermanent.DefinedName');
forgeValeurs('CopyPermanent.DefinedName', v => !DESIGNATIONS_NOM.test(v));

/* —— Rentrer en main au prochain dégagement ———————————————————————————— */

/* « During your next untap step, as you untap your permanents, return ~ to its owner's hand » (Undiscovered Paradise) : une marque
   posée par la pompe, levée au dégagement de son contrôleur. */
const KW_RENTRE_EN_MAIN = "HIDDEN During your next untap step, as you untap your permanents, return CARDNAME to its owner's hand.";
forgeSait('kwval', KW_RENTRE_EN_MAIN.toLowerCase());

pompeForge = (g => function (P, objets, t, env) {
  if (String(t.KW || '').split('&').some(k => k.trim() === KW_RENTRE_EN_MAIN)) objets.filter(o => o && o.zone === 'champ' && !o.lki).forEach(o => { o.rentreEnMain = true; P.ver++; });
  return g(P, objets, t, env);
})(pompeForge);

phasesEntrent = (g => function (P) {
  const l = champDe(P, P.actif).filter(o => o.rentreEnMain).map(o => o.id);
  g(P);
  l.forEach(id => { if (obj(P, id) && P.champ.includes(id)) { jn(P, `${obj(P, id).def.nom} retourne en main`); deplace(P, id, 'main'); } });
})(phasesEntrent);

/* Les terrains défaussés ce tour, jouables du cimetière (Mayhem). */
cartesPermises = (g => function (P, j) {
  const r = g(P, j);
  P.joueurs[j].cimetiere.map(id => obj(P, id)).filter(o => o && o.def.mayhemTerrain && o.defausseTour === P.tour && !r.some(x => x.o.id === o.id)).forEach(o => r.push({o, depuis: 'cimetiere'}));
  return r;
})(cartesPermises);

/* —— Les couleurs fixées avant la partie ————————————————————————————— */

/* « Add one mana of either of the circled colors » (Cryptic Spires : on entoure deux couleurs en construisant son deck) et
   « of any color chosen as you drafted » (Paliano : les couleurs notées au draft). L'atelier ne construit ni ne draft en jouant : les
   couleurs entourées sont les deux que le deck porte le plus, et le draft n'a rien noté — la capacité de Paliano ne produit alors rien,
   comme hors draft. */
capaciteForge = (g => function (def, face, t, jetons) {
  const m = forgeApi(t) === 'Mana' && /^Combo (ColorID|NotedColors)$/.exec(t.Produced || '');
  if (!m || t.SubAbility || t.Amount) return g(def, face, t, jetons);
  const c = coutForge(t.Cost);
  if (!c || Object.keys(c.cout).some(k => k !== 'mana' && k !== 'engage') || (c.cout.mana && c.cout.mana.total) || !tableJouable(t)) return false;
  def.capacites.push({genre: 'mana', cout: c.cout, options: [], fixes: m[1] === 'ColorID' ? 'cerclees' : 'notees', texte: texteForge(face, t)});
  return true;
})(capaciteForge);

function couleursFixees(P, j, genre) {
  const J = P.joueurs[j];
  if (genre === 'notees') return J.couleursNotees || [];
  if (!J.couleursCerclees) {
    const n = {W: 0, U: 0, B: 0, R: 0, G: 0};
    P.cartes.forEach(k => { if (k.prop === j && !k.jeton && !k.conjuree && !k.def.types.includes('land')) (k.def.couleurs || []).forEach(c => { if (n[c] != null) n[c]++; }); });
    J.couleursCerclees = Object.keys(n).sort((a, b) => n[b] - n[a]).slice(0, 2);
  }
  return J.couleursCerclees;
}

/* —— « Tant que ce terrain reste engagé » ——————————————————————————— */

/* `Duration$ UntilUntaps` (Ice Floe) : l'effet dure jusqu'à ce que son hôte se dégage — ou le quitte le champ. */
FORGE_DUREES.UntilUntaps = 'hoteDegage';

degageObjet = (g => function (P, o) {
  const avait = !!o && o.engage;
  g(P, o);
  if (avait && !o.engage && P.effets && P.effets.some(e => e.fin === 'hoteDegage' && e.hote === o.id)) {
    P.effets = P.effets.filter(e => !(e.fin === 'hoteDegage' && e.hote === o.id)); P.ver++;
  }
})(degageObjet);

hotePart = (g => function (P, id) {
  g(P, id);
  if (P.effets && P.effets.some(e => e.fin === 'hoteDegage' && e.hote === id)) { P.effets = P.effets.filter(e => !(e.fin === 'hoteDegage' && e.hote === id)); P.ver++; }
})(hotePart);

/* —— Au nettoyage ———————————————————————————————————————————————— */

/* « Return ~ to its owner's hand at the beginning of the next cleanup step » (Thawing Glaciers) : un déclencheur retardé. Le nettoyage
   n'ouvre pas de priorité dans le moteur ; il est lu comme l'étape de fin, où le terrain, déjà engagé, ne sert plus à rien. Un déclencheur ordinaire
   à « Phase$ Cleanup » (des remises à zéro de Forge) reste refusé : il ne s'agit pas du même moment. */
FORGE_PHASES.Cleanup = 'fin';
declencheurForge = (g => function (def, face, t, jetons) {
  if (t.Mode === 'Phase' && /Cleanup/.test(t.Phase || '')) return false;
  return g(def, face, t, jetons);
})(declencheurForge);

/* —— Les marqueurs d'étourdissement et les faveurs ————————————————————— */

/* Un permanent qui porte un marqueur d'étourdissement perd ce marqueur au lieu de se dégager (règle 122.1g). */
degageObjet = (g => function (P, o) {
  if (o && o.engage && (o.marq.stun || 0) > 0) { o.marq.stun--; P.ver++; return; }
  g(P, o);
})(degageObjet);

/* `Effect | Boon$ True` : un effet à usage unique, que son premier déclenchement défait (js/jeuDeclencheurs.js). */
FORGE_API.Effect.gen = (g => function* (P, t, env) {
  const n = (P.effets || []).length;
  yield* g(P, t, env);
  if (t.Boon === 'True' && P.effets && P.effets.length > n) P.effets[P.effets.length - 1].boon = true;
})(FORGE_API.Effect.gen);
forgeSait('param', 'Effect.Boon', 'Scry.GameActivationLimit');
