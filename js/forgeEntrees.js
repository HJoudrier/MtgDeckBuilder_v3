/* =====================================================================
   js/forgeEntrees.js — Ce qui se passe en entrant, et qui le décide

   « Each other creature you control enters with an additional +1/+1
   counter » (Arlinn) : un remplacement porté par un permanent, joué sur
   l'objet qui entre (`entreesAutres()`, appelé par js/jeuOpsB.js
   `metEnJeu()`). « If CARDNAME was kicked, it enters with two +1/+1
   counters », « as CARDNAME enters, choose… » écrit comme un remplacement
   `Moved` : un effet d'entrée de la carte elle-même (`entreeSoiForge()`).
   « Creatures you control enter as a copy of CARDNAME » (Essence of the
   Wild) : un Clone dont la cible est l'objet qui entre.

   Et les restrictions de cible qui dépendent du déclencheur
   (`TargetsWithDefinedController`), de la valeur de mana totale
   (`MaxTotalTargetCMC`), et « this and the targets » (`ThisDefinedAndTgts`).
   ===================================================================== */

/* —— Les entrées des autres —————————————————————————————————————————— */

/* Un remplacement d'entrée pour les autres, porté par la définition. */
function entreeAutres(def, effet, valid, optionnel) {
  (def.entreeAutres = def.entreeAutres || []).push({effet, valid, optionnel});
  return true;
}

/* Jouer, sur l'objet qui vient d'entrer, les remplacements que portent les
   autres permanents. `ReplacedCard` le désigne (js/forgeDesignations.js). */
function* entreesAutres(P, no) {
  for (const id of P.champ.slice()) {
    const p = obj(P, id);
    if (!p || p.id === no.id || !p.def.entreeAutres || !obj(P, no.id)) continue;
    for (const e of p.def.entreeAutres) {
      if (!forgeValideObjet(P, no, e.valid, p, p.ctrl, null, true)) continue;
      if (e.optionnel) {
        const r = yield question(P, p.ctrl, 'oui', ['non', 'oui'], {texte: `${p.def.nom} : pour ${no.def.nom} ?`, source: p.id});
        if (r !== 1) continue;
      }
      yield* executeOps(P, e.effet.ops, {source: p.id, ctrl: p.ctrl, cibles: [], trouves: [], x: 0, evt: {t: 'entre', id: no.id}});
    }
  }
}

/* —— L'entrée de la carte elle-même, écrite en remplacement ———————————— */

/* Ce qu'un effet d'entrée peut faire sans décider si la carte entre :
   choisir, poser des marqueurs, s'engager, s'animer, payer de la vie. */
const API_ENTREE = new Set(['PutCounter', 'Tap', 'ChooseType', 'ChooseColor', 'ChoosePlayer', 'NameCard', 'AlterAttribute', 'Animate',
  'LoseLife', 'GainLife', 'Pump']);

/* `R:Event$ Moved | ValidCard$ Card.Self | Destination$ Battlefield |
   ReplaceWith$ …` dont la chaîne ne fait que préparer l'entrée : un effet
   d'entrée comme ceux de `K:ETBReplacement`. Rend vrai si la forme est lue. */
function entreeSoiForge(def, face, r) {
  const v = /^(Card|Permanent|Creature|Land|Artifact|Enchantment)\.Self(\+kicked)?$/.exec(r.ValidCard || '');
  if (r.Event !== 'Moved' || r.Destination !== 'Battlefield' || !v || r.Origin || (r.ActiveZones && r.ActiveZones !== 'Battlefield')) return false;
  const w = forgeSousCapacite(face, r.ReplaceWith);
  if (payeAvantForge(def, face, w)) return true;
  for (let u = w, k = 0; u && k < 10; u = u.SubAbility ? forgeSousCapacite(face, u.SubAbility) : null, k++) if (!API_ENTREE.has(forgeApi(u))) return false;
  const effet = w && effetForge(face, w, {});
  if (!effet || effet.cibles.length || effet.modes) return false;
  const ent = def.entree = def.entree || {};
  (ent.forge = ent.forge || []).push({effet, optionnel: r.Optional === 'True', ...(v[2] ? {valid: 'Card.Self+kicked'} : {})});
  return true;
}

/* « If CARDNAME would enter, sacrifice a Forest instead. If you do, put
   CARDNAME onto the battlefield. If you don't, put it into its owner's
   graveyard » (Heart of Yavimaya) ; Mox Diamond défausse un terrain. La
   chaîne de Forge (`PayBeforeETB`) : sacrifier ou défausser, puis la carte
   va au cimetière ou au champ selon qu'on a payé. Lue en entier, ou pas. */
function payeAvantForge(def, face, w) {
  if (!w || !/^(Sacrifice|Discard)$/.test(forgeApi(w))) return false;
  const chaine = [];
  for (let u = w, k = 0; u && k < 6; u = u.SubAbility ? forgeSousCapacite(face, u.SubAbility) : null, k++) chaine.push(u);
  const vers = chaine.filter(u => forgeApi(u) === 'ChangeZone' && u.Defined === 'ReplacedCard').map(u => u.Destination).sort().join();
  if (vers !== 'Battlefield,Graveyard' || chaine.some(u => !/^(Sacrifice|Discard|ChangeZone|Cleanup)$/.test(forgeApi(u)))) return false;
  const valid = forgeApi(w) === 'Sacrifice' ? w.SacValid : w.DiscardValid;
  if (!valid || (forgeApi(w) === 'Discard' && w.Mode !== 'TgtChoose')) return false;
  (def.entree = def.entree || {}).payeAvant = {sac: forgeApi(w) === 'Sacrifice', valid};
  return true;
}

/* Payer avant d'entrer : rend faux si l'on ne peut, ou ne veut, pas — la
   carte va alors au cimetière (js/jeuOpsB.js `metEnJeu()`). Qui le peut
   paie — simplification annoncée pour Mox Diamond, où c'est facultatif. */
function* payeAvantEntree(P, id, j, pa) {
  const o = obj(P, id);
  const ids = pa.sac ? champDe(P, j).filter(x => forgeValideObjet(P, x, pa.valid, o, j, null, true)).map(x => x.id)
    : P.joueurs[j].main.filter(x => x !== id && forgeValideObjet(P, obj(P, x), pa.valid, o, j, null, true));
  if (!ids.length) return false;
  const pris = yield* choisitCartes(P, j, ids, 1, pa.sac ? 'Sacrifier' : 'Défausser', pa.sac ? 'sacrifice' : 'defausse', 1);
  if (!pris.length) return false;
  if (pa.sac) sacrifie(P, pris[0]); else defausseCarte(P, pris[0], j);
  return true;
}

/* Les conditions d'un marqueur d'entrée qu'aucune table ne dit autrement :
   Adamant (trois manas d'une couleur dépensés), Revolt (un permanent qu'on
   contrôlait a quitté le champ ce tour). */
function conditionEntree(P, cond, no, j) {
  if (!cond) return true;
  if (cond.Adamant) {
    const m = manaDepenseDe(no) || {}, k = COULEURS_FORGE_LETTRE[cond.Adamant];
    if (!(k ? (m[k] || 0) >= 3 : ['W', 'U', 'B', 'R', 'G'].some(c => (m[c] || 0) >= 3))) return false;
  }
  if (cond.Revolt === 'True' && !(histoire(P).revolte || {})[j]) return false;
  return true;
}

/* —— Devenir une copie (CloneTarget) ——————————————————————————————————— */

/* `Defined$` est le modèle, `CloneTarget$` ce qui devient sa copie
   (« enter as a copy of CARDNAME »). */
FORGE_API.Clone.gen = (g => function* (P, t, env) {
  if (!t.CloneTarget || /^Valid /.test(t.CloneTarget)) return yield* g(P, t, env);
  const m = forgeDefinis(P, t.Defined || 'Self', env).find(x => x && x.j == null);
  const c = forgeDefinis(P, t.CloneTarget, env).find(x => x && x.j == null && !x.lki && x.zone === 'champ');
  if (!m || !c || m.id === c.id) return;
  c.def = defCopie(m.def, t); c.copie = true; P.ver++;
  jn(P, `${P.cartes[c.cid].def.nom} devient une copie de ${m.def.nom}`);
})(FORGE_API.Clone.gen);

/* —— Les restrictions de cible ——————————————————————————————————————— */

/* « Target instant or sorcery card in that player's graveyard » : les
   candidats d'un emplacement dont le contrôleur est désigné par le
   déclencheur (`TargetsWithDefinedController$ TriggeredCardController`)
   ou par l'emplacement d'avant (`ParentTarget`). */
function candidatsDuControleur(P, sl, cands, src, j, extra, choix) {
  if (!sl.ctrlDefini) return cands;
  const tient = c => typeof c === 'object' ? c.j : (o => o && (o.zone === 'champ' || o.zone === 'pile' ? o.ctrl : o.prop))(obj(P, c));
  let qui;
  if (sl.ctrlDefini === 'ParentTarget') qui = (choix[choix.length - 1] || []).map(tient);
  else {
    const env = {ctx: {evt: (extra && extra.evt) || {}, cibles: choix, memo: [], memoJ: []}, src, ctrl: j, op: {}};
    qui = forgeDefinis(P, sl.ctrlDefini, env).map(x => joueurDe(x));
  }
  return cands.filter(c => qui.includes(tient(c)));
}

/* « Any number of target creature cards with total mana value 6 or less » :
   les cibles prises dans l'ordre, tant que le total tient. */
function restreintValeurTotale(P, max, l) {
  let s = 0;
  return l.filter(c => { const o = typeof c === 'number' ? obj(P, c) : null, v = o ? mvDe(o) : 0; if (s + v > max) return false; s += v; return true; });
}

/* « This creature and the targets » : `ThisDefinedAndTgts$ Self` ajoute la
   désignée aux cibles (js/forgeDefini.js `objetsForge()`). */
function avecDefinisEnPlus(P, t, env, l) {
  if (!t.ThisDefinedAndTgts) return l;
  const plus = forgeDefinis(P, t.ThisDefinedAndTgts, env).filter(x => x && !l.includes(x));
  return [...l, ...plus];
}

['TargetsWithDefinedController', 'ThisDefinedAndTgts', 'MaxTotalTargetCMC'].forEach(k => FORGE_COMMUNS.add(k));
forgeSait('param', 'TargetsWithDefinedController', 'ThisDefinedAndTgts', 'MaxTotalTargetCMC');
forgeSait('param', 'ChooseType.Type');
