/* =====================================================================
   js/forgeTerrains.js — Ce que les terrains font de plus

   Lot F96 :
   - `TargetsWithSameCreatureType` (Secret Tunnel) : les cibles d'une même
     capacité partagent un type de créature ;
   - `GainControlVariant | ChangeController$ CardOwner` (Homeward Path) :
     chaque joueur reprend les créatures qu'il possède ;
   - `SkipTurn` (Magosi, the Waterveil) : le joueur saute son prochain tour.
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

aCopier = (g => function* (P, t, env) {
  if (t.DefinedName !== 'Wastes') return yield* g(P, t, env);
  const def = defWastes();
  return def ? [{id: -1, def}] : [];
})(aCopier);
forgeSait('param', 'CopyPermanent.DefinedName');
forgeValeurs('CopyPermanent.DefinedName', ['Wastes']);

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
