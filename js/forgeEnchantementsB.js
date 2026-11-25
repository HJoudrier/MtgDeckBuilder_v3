/* =====================================================================
   js/forgeEnchantementsB.js — Les enchantements d'EDHREC : les sagas

   Lot F109 :
   - `Read ahead` : à l'entrée, on choisit le chapitre par lequel la saga
     commence (The Cruelty of Gix, The Weatherseed Treaty, The Elder Dragon
     War, The Phasing of Zhalfir) ;
   - `AbilityTriggered` : le dernier chapitre d'une saga se déclenche
     (Historian's Boon) ;
   - les marqueurs de radiation des joueurs (`Counters.RAD`, Vault 12) ;
   - `Recruit` (The Mountain-king's Return) ;
   - `Vote | VoteCard | UpTo` (Vault 11 : on peut ne voter pour personne).
   ===================================================================== */

/* —— Lire à l'avance ————————————————————————————————————————————— */

forgeSait('kw', 'Read ahead');
motCleForge = (g => function (def, k, face, jetons) {
  if (k !== 'Read ahead') return g(def, k, face, jetons);
  def.params.lectureAvance = true;
  return true;
})(motCleForge);
/* Le premier chapitre — ou, pour une saga qui se lit à l'avance, celui qu'on choisit, seul. */
function* chapitreInitial(P, o) {
  const n = o.def.chapitres.length;
  if (!(o.def.params && o.def.params.lectureAvance) || n < 2) return ajouteLore(P, o, 1);
  const opts = Array.from({length: n}, (_, i) => 'Chapitre ' + (i + 1));
  const i = yield* choisitUn(P, o.ctrl, opts, `${o.def.nom} : par quel chapitre commencer ?`, 0, o.id);
  o.marq.lore = i;
  ajouteLore(P, o, 1);
}

/* —— Le dernier chapitre se déclenche ————————————————————————————————— */

forgeMode('AbilityTriggered', ['ValidMode', 'ValidSource', 'ValidSpellAbility', 'TriggeredOwnAbility', 'ValidSpell'], (P, t, e, s, env) => e.t === 'chapitreDeclenche' &&
  /CounterAdded/.test(t.ValidMode || '') && /LastChapter/.test(t.ValidSpellAbility || '') && e.dernier && valideOuRien(P, obj(P, e.id), t.ValidSource, s, env));

/* —— Les marqueurs d'un joueur ————————————————————————————————————— */

quantiteJoueur = (g => function (P, j, q) {
  let m;
  if ((m = /^Counters\.(\w+)$/.exec(q)) && j != null) {
    const k = m[1].toLowerCase(), J = P.joueurs[j];
    return k === 'poison' ? J.poison || 0 : k === 'energy' ? J.energie || 0 : (J.marqueurs || {})[k] || 0;
  }
  return g(P, j, q);
})(quantiteJoueur);
forgeSait('expr', 'PlayerCountPlayers$Counters', 'PlayerCountOpponents$Counters');

/* —— Recruit ————————————————————————————————————————————————— */

forgeEffet('Recruit', [], function* (P, t, env) {
  for (const j of joueursForge(P, t, env)) {
    yield* pioche(P, j, 1);
    const main = P.joueurs[j].main.slice();
    if (!main.length) continue;
    const [id] = yield* choisitCartes(P, j, main, 1, 'Défausser', 'defausse', 1);
    if (id == null) continue;
    const nonTerrain = !estType(obj(P, id), 'land'), defCachee = defFaceCachee(obj(P, id).def);
    defausseCarte(P, id, j);
    if (nonTerrain) yield* creeJetonsForge(P, [{...defCachee, nom: 'Human Soldier', cout: coutManaVide(), mv: 0, types: ['creature'], sousTypes: ['human', 'soldier'], couleurs: ['W'], force: 1, endurance: 1,
      faceCachee: false, typeLigne: 'Créature — Humain Soldat', coutTexte: ''}], 1, [j], false, env, false);
  }
}, (t, op) => { op.op = 'pioche'; op.n = 1; op.qui = {vous: 1}; op.hostile = false; });
