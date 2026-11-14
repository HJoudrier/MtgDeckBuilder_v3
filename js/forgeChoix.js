/* =====================================================================
   js/forgeChoix.js — Les choix de Forge : une couleur, un type, une
   carte, un joueur, un nombre, un mode ; et ce qui se fait « en entrant »

   Un choix appartient à la carte qui l'a fait (`P.cartes[cid].choix`),
   comme dans Forge : « creatures of the chosen type get +1/+1 » le relit
   aussi longtemps que la carte reste (`ChosenType`, js/forgeValide.js).
   Le joueur répond par une question « modes » ; le joueur automatique y
   prend ce que le moteur lui a désigné (`extra.prefere`).
   ===================================================================== */

const NOMS_COULEURS = {W: 'Blanc', U: 'Bleu', B: 'Noir', R: 'Rouge', G: 'Vert'};

/* La mémoire des choix d'une carte. */
function choixDe(P, src) {
  const k = src && P.cartes[src.cid];
  return k ? (k.choix || (k.choix = {})) : {};
}

/* Poser une question à choix unique. Rend l'indice choisi. */
function* choisitUn(P, j, options, texte, prefere, source) {
  if (options.length <= 1) return 0;
  const r = yield question(P, j, 'modes', options, {min: 1, max: 1, multi: true, texte, source,
    extra: {options: options.map(t => ({texte: t, ops: []})), prefere: prefere >= 0 ? prefere : 0}});
  const i = Array.isArray(r) ? r[0] : r;
  return i >= 0 && i < options.length ? i : 0;
}

/* Les couleurs des cartes d'un ou de plusieurs joueurs, la plus fréquente
   d'abord : ce que l'IA choisit, chez elle ou chez l'adversaire. */
function couleursFrequentes(P, joueurs) {
  const n = {W: 0, U: 0, B: 0, R: 0, G: 0};
  P.cartes.forEach(k => { if (joueurs.includes(k.prop)) k.def.couleurs.forEach(c => { if (n[c] != null) n[c]++; }); });
  return Object.keys(n).sort((a, b) => n[b] - n[a]);
}

/* Les types de créature les plus fréquents chez un joueur. */
function typesFrequents(P, j) {
  const n = new Map();
  P.cartes.forEach(k => { if (k.prop === j && k.def.types.includes('creature')) k.def.sousTypes.forEach(s => n.set(s, (n.get(s) || 0) + 1)); });
  return [...n.entries()].sort((a, b) => b[1] - a[1]).map(x => x[0]);
}

const majuscule = s => s.charAt(0).toUpperCase() + s.slice(1);

forgeEffet('ChooseColor', [], function* (P, t, env) {
  const j = joueursForge(P, t, env)[0];
  if (j == null) return;
  const pourAdv = /Human|Opp/.test(t.AILogic || '');
  const ordre = couleursFrequentes(P, pourAdv ? adversaires(P, j) : [j]);
  const options = ['W', 'U', 'B', 'R', 'G'];
  const i = yield* choisitUn(P, j, options.map(c => NOMS_COULEURS[c]), 'Choisir une couleur', options.indexOf(ordre[0]), env.ctx.source);
  choixDe(P, env.src).couleur = options[i];
}, (t, op) => { op.op = 'forge'; op.hostile = false; });

forgeEffet('ChooseType', ['Type'], function* (P, t, env) {
  const j = joueursForge(P, t, env)[0];
  if (j == null) return;
  const types = /Opp|Human/.test(t.AILogic || '') ? adversaires(P, j).flatMap(x => typesFrequents(P, x)) : typesFrequents(P, j);
  const options = (types.length ? types : ['human']).slice(0, 12);
  const i = yield* choisitUn(P, j, options.map(majuscule), 'Choisir un type de créature', 0, env.ctx.source);
  choixDe(P, env.src).type = options[i];
}, (t, op) => { op.op = 'forge'; op.hostile = false; }, {prepare: t => !t.Type || t.Type === 'Creature'});

forgeEffet('ChoosePlayer', ['Choices'], function* (P, t, env) {
  const j = joueursForge(P, t, env)[0];
  if (j == null) return;
  const cands = vivants(P).map(J => J.i).filter(x => !t.Choices || forgeValideJoueur(P, x, t.Choices, env.ctrl, env));
  if (!cands.length) return;
  /* L'IA désigne l'adversaire le plus faible. */
  const pref = cands.reduce((b, x, i) => (P.joueurs[x].vie < P.joueurs[cands[b]].vie && x !== j ? i : b), Math.max(0, cands.findIndex(x => x !== j)));
  const i = yield* choisitUn(P, j, cands.map(x => P.joueurs[x].nom), 'Choisir un joueur', pref, env.ctx.source);
  choixDe(P, env.src).joueur = cands[i];
}, (t, op) => { op.op = 'forge'; op.hostile = false; });

forgeEffet('ChooseNumber', ['Max', 'Min'], function* (P, t, env) {
  const j = joueursForge(P, t, env)[0];
  if (j == null) return;
  const min = forgeNombre(P, t.Min || 0, env), max = Math.min(forgeNombre(P, t.Max || 0, env), min + 30);
  const options = Array.from({length: Math.max(1, max - min + 1)}, (_, k) => String(min + k));
  choixDe(P, env.src).nombre = min + (yield* choisitUn(P, j, options, 'Choisir un nombre', options.length - 1, env.ctx.source));
}, (t, op) => { op.op = 'forge'; op.hostile = false; });

forgeEffet('ChooseCard', ['Choices', 'ChoiceZone', 'Amount', 'Mandatory', 'RememberChosen'], function* (P, t, env) {
  const j = joueursForge(P, t, env)[0];
  if (j == null) return;
  const zone = ZONES_FORGE[t.ChoiceZone] || 'champ';
  const ids = objetsZone(P, zone).filter(o => forgeValideObjet(P, o, t.Choices || 'Card', env.src, env.ctrl, env)).map(o => o.id);
  const n = forgeNombre(P, t.Amount || 1, env);
  const pris = yield* choisitCartes(P, j, ids, n, 'Choisir', 'cartes', n);
  choixDe(P, env.src).cartes = pris;
  if (t.RememberChosen === 'True') pris.forEach(id => retiensForge(env.ctx, id));
}, (t, op) => { op.op = 'forge'; op.hostile = false; });

/* Un choix de mode à la résolution, fait par le joueur désigné (« target
   opponent chooses one — »). Les modes ne ciblent pas : construits
   d'avance. */
forgeEffet('GenericChoice', ['Choices', 'ShowChoice', 'TempRemember'], function* (P, t, env) {
  const j = joueursForge(P, t, env)[0];
  if (j == null) return;
  const modes = env.op.modes;
  /* Celui qui choisit pour un adversaire prend ce qui le gêne le moins. */
  /* Un mode qu'on doit payer pour qu'il ait lieu, et qu'on ne peut pas
     payer, ne vaut rien. */
  const payable = m => {
    const t0 = m.effet.ops[0] && m.effet.ops[0].t;
    if (!t0 || t0.UnlessSwitched !== 'True') return true;
    const c = coutForge(t0.UnlessCost), autre = c && autresCout(c.cout);
    return !!c && !!planPaiement(P, j, c.cout.mana, 0) && (!autre || coutAutrePossible(P, j, {id: -1, zone: '', marq: {}}, autre));
  };
  const notes = modes.map(m => payable(m) ? scoreEffet(P, env.ctrl, m.effet, env.src) : -Infinity);
  const pref = j === env.ctrl ? notes.indexOf(Math.max(...notes)) : notes.indexOf(Math.min(...notes));
  const i = yield* choisitUn(P, j, modes.map(m => m.texte), 'Choisir', pref, env.ctx.source);
  yield* executeOps(P, modes[i].effet.ops, env.ctx);
}, (t, op) => { op.op = 'forge'; op.hostile = false; }, {
  prepare(t, op) {
    op.modes = String(t.Choices || '').split(',').map(n => n.trim()).filter(Boolean).map(n => {
      const sub = forgeSousCapacite(op.face, n), effet = sub && effetForge(op.face, sub, op.jetons);
      return effet && !effet.cibles.length && !effet.modes ? {texte: texteForge(op.face, sub) || n, effet} : null;
    });
    return op.modes.length > 0 && op.modes.every(Boolean);
  }
});

/* « As ~ enters, choose… », « you may have ~ enter as a copy… » : l'effet
   se joue au moment où l'objet arrive, avant que quiconque le voie
   (js/jeuOpsB.js `metEnJeu()`). `K:ETBReplacement:Other:SVar[:Optional]`. */
function entreeForgeMotCle(def, face, jetons, reste) {
  const [genre, nom, mode] = reste;
  if ((genre !== 'Other' && genre !== 'Copy') || reste.length > 3 || (mode && !/^(Optional|Mandatory)$/.test(mode))) return false;
  const effet = effetForge(face, forgeSousCapacite(face, nom), jetons);
  if (!effet || effet.cibles.length || effet.modes) return false;
  const ent = def.entree = def.entree || {};
  (ent.forge = ent.forge || []).push({effet, optionnel: mode === 'Optional'});
  return true;
}

/* Jouer les effets d'entrée d'un objet qui vient d'arriver. */
function* effetsEntree(P, no) {
  const l = no.def.entree && no.def.entree.forge;
  if (!l) return;
  for (const e of l) {
    if (e.optionnel) {
      const r = yield question(P, no.ctrl, 'oui', ['non', 'oui'], {texte: `${no.def.nom} : le faire ?`, source: no.id});
      if (r !== 1) continue;
    }
    yield* executeOps(P, e.effet.ops, {source: no.id, ctrl: no.ctrl, cibles: [], trouves: [], x: no.x || 0});
  }
}
