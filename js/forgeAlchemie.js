/* =====================================================================
   js/forgeAlchemie.js — Des cartes qui n'existent que dans la partie

   Lot F99 :
   - `MakeCard | Name$ X | Zone$ Hand|Battlefield` (« conjure a card named
     X », Phyrexian Scrapyard, Jace's Saga) : une carte neuve, que le
     joueur possède, arrive dans la zone dite. Sa définition vient du
     script Forge de ce nom (js/forgeDepot.js) : un nom que l'appareil ne
     connaît pas ne produit rien ;
   - `Empower | Type$ Jace | Num$ N` (Theorist's Sanctum, Jace's Saga) : N
     marqueurs de loyauté sur le jeton Jace qu'on contrôle — qu'on crée
     d'abord, sans loyauté, si on n'en a pas.
   ===================================================================== */

/* Le script du jeton Jace d'Empower (tokenscripts/u_empower_jace.txt), gardé ici : aucune carte ne le nomme. */
const SCRIPT_JACE = [
  'Name:Jace Token', 'ManaCost:no cost', 'Colors:blue', 'Types:Planeswalker Jace', 'Loyalty:0',
  'A:AB$ Surveil | Cost$ SubCounter<1/LOYALTY> | Amount$ 1 | Planeswalker$ True | SpellDescription$ Surveil 1.',
  'A:AB$ Draw | Cost$ SubCounter<3/LOYALTY> | Planeswalker$ True | Defined$ You | NumCards$ 1 | SpellDescription$ Draw a card.',
  'Oracle:[-1]: Surveil 1.\\n[-3]: Draw a card.'].join('\n');

/* La fiche qu'un script Forge dit de sa propre carte, quand l'atelier n'en connaît pas d'autre. */
function ficheConjuree(nom, script) {
  const L = k => { const m = new RegExp('^' + k + ':(.*)$', 'm').exec(script); return m ? m[1].trim() : ''; };
  const mc = L('ManaCost'), pt = /^(\S+)\/(\S+)$/.exec(L('PT')) || [], nb = x => /^\d+$/.test(x || '') ? +x : undefined;
  return {nom, cout: !mc || mc === 'no cost' ? '' : mc.split(/\s+/).map(x => '{' + x + '}').join(''), type: L('Types'), texte: L('Oracle').replace(/\\n/g, ' // '),
    force: nb(pt[1]), endurance: nb(pt[2]), loyaute: nb(L('Loyalty')), motsCles: [], faces: null, manaProduit: '', forge: script,
    forgeJetons: Object.fromEntries(nomsJetonsForge(script).map(n => [n, FORGE.jetons.get(n)]).filter(([, v]) => v))};
}

/* La définition d'une carte par son nom : celle de l'atelier si elle porte son script, sinon le script seul. */
const DEFS_CONJUREES = new Map();
function defNommee(nom) {
  if (DEFS_CONJUREES.has(nom)) return DEFS_CONJUREES.get(nom);
  let f = typeof ficheParNom === 'function' ? ficheParNom(nom) : null;
  const s = typeof scriptForgeDe === 'function' ? scriptForgeDe(nom) : null;
  if ((!f || !f.forge) && s) f = ficheConjuree(nom, s);
  const d = f ? definitionDe(f, typeof comportementDe === 'function' ? comportementDe(f.nom) : undefined) : null;
  if (d) DEFS_CONJUREES.set(nom, d);
  return d;
}

/* Une carte neuve, possédée par `j`, dans sa main. */
function conjure(P, j, def) {
  const cid = nouvelleCarte(P, def, j, false, false);
  P.cartes[cid].conjuree = true;
  const o = creeObjet(P, cid, j, 'main');
  P.joueurs[j].main.push(o.id);
  P.ver++;
  return o;
}

forgeEffet('MakeCard', ['Name', 'Zone', 'Conjure', 'RememberMade'], function* (P, t, env) {
  const nom = t.Name === 'ChosenName' ? choixDe(P, env.src).nom : t.Name, def = nom ? defNommee(nom) : null;
  if (!def) { jn(P, `${nom || t.Name} : aucun script, rien n'est conjuré`); return; }
  for (const j of joueursForge(P, t, env)) {
    const o = conjure(P, j, def);
    jn(P, `${P.joueurs[j].nom} conjure ${def.nom}`);
    if (t.Zone === 'Exile') { const n = deplace(P, o.id, 'exil'); if (n != null && t.RememberMade === 'True') retiensForge(env.ctx, n); }
    else if (t.Zone === 'Battlefield') { const n = yield* metEnJeu(P, o.id, j, {}); if (n != null && t.RememberMade === 'True') retiensForge(env.ctx, n); }
    else if (t.RememberMade === 'True') retiensForge(env.ctx, o.id);
  }
}, (t, op) => { op.op = 'forge'; op.hostile = false; }, {prepare: t => !!t.Name && !t.DefinedName && !t.Spellbook && /^(Hand|Battlefield|Exile)$/.test(t.Zone || 'Hand')});

/* —— Empower ———————————————————————————————————————————————————— */

let DEF_JACE = null;
function defJace() {
  return DEF_JACE || (DEF_JACE = definitionForge(ficheConjuree('Jace Token', SCRIPT_JACE)));
}

forgeEffet('Empower', ['Type', 'Num'], function* (P, t, env) {
  const n = forgeNombre(P, t.Num || 1, env), j = env.ctrl, def = defJace();
  if (!def || n <= 0) return;
  let o = champDe(P, j).find(x => x.def.nom === 'Jace Token');
  if (o) { o.marq.loyaute = (o.marq.loyaute || 0) + n; P.ver++; }
  else {
    o = creeObjet(P, nouvelleCarte(P, def, j, false, true), j, 'champ');
    o.marq.loyaute = n;
    P.champ.push(o.id); P.ver++;
    emet(P, {t: 'entre', id: o.id, ctrl: j, jeton: true});
    noteEntree(P, null, 'champ', o);
  }
  jn(P, `${P.joueurs[j].nom} renforce Jace de ${n}`);
}, (t, op) => { op.op = 'forge'; op.hostile = false; }, {prepare: t => t.Type === 'Jace'});

/* —— Nommer une carte de la liste, en lancer une copie ————————————————————— */

/* « Name Emrakul, the Promised End » (The Heron Moon) : `ChooseFromList$ A; B` — les noms de la liste, séparés par des virgules, une virgule
   du nom elle-même s'écrivant « ; ». Un seul nom : il est retenu sans question. */
FORGE_API.NameCard.gen = (g => function* (P, t, env) {
  if (!t.ChooseFromList) return yield* g(P, t, env);
  const j = joueursForge(P, t, env)[0];
  if (j == null) return;
  const noms = t.ChooseFromList.split(',').map(x => x.trim().replace(/;/g, ',')).filter(Boolean);
  const i = noms.length > 1 ? yield* choisitUn(P, j, noms, 'Nommer une carte', 0, env.ctx.source) : 0;
  choixDe(P, env.src).nom = noms[i];
  jn(P, `${P.joueurs[j].nom} nomme ${noms[i]}`);
})(FORGE_API.NameCard.gen);
forgeSait('param', 'NameCard.ChooseFromList');

/* « Cast a copy of the chosen card without paying its mana cost » : la carte est conjurée, puis lancée gratuitement. */
FORGE_API.Play.gen = (g => function* (P, t, env) {
  if (t.CopyFromChosenName !== 'True') return yield* g(P, t, env);
  const nom = choixDe(P, env.src).nom, def = nom ? defNommee(nom) : null, j = env.ctrl;
  if (!def) return;
  const o = conjure(P, j, def);
  const ok = yield* lanceDepuisEffet(P, j, o, true);
  if (!ok && obj(P, o.id) && obj(P, o.id).zone === 'main') deplace(P, o.id, 'exil');
})(FORGE_API.Play.gen);
FORGE_API.Play.prepare = (p => (t, op) => (t.CopyFromChosenName === 'True' || !p || p(t, op)))(FORGE_API.Play.prepare);
forgeSait('param', 'Play.CopyFromChosenName');

/* —— Nommer une carte au hasard parmi toutes celles qu'on connaît ———————————————— */

/* « Conjure a random planeswalker card » (Oko, Lord of the Fae) : `NameCard | AtRandom$ True | ValidCards$ Planeswalker` nomme un planeswalker au hasard parmi les scripts de
   l'appareil (js/forgeDepot.js) ; sans eux, rien n'est nommé. */
let NOMS_PLANESWALKERS = null;
function nomsPlaneswalkers() {
  if (NOMS_PLANESWALKERS && NOMS_PLANESWALKERS.taille === FORGE.textes.size) return NOMS_PLANESWALKERS.l;
  const l = [];
  FORGE.textes.forEach((txt, ch) => { if (!ch.startsWith('jetons/') && /^Types:.*\bPlaneswalker\b/m.test(txt) && !/^AlternateMode:/m.test(txt)) l.push((/^Name:(.*)$/m.exec(txt) || [])[1]); });
  NOMS_PLANESWALKERS = {taille: FORGE.textes.size, l: l.filter(Boolean).sort()};
  return NOMS_PLANESWALKERS.l;
}
FORGE_API.NameCard.gen = (g => function* (P, t, env) {
  if (t.AtRandom !== 'True' || t.ValidCards !== 'Planeswalker') return yield* g(P, t, env);
  const l = nomsPlaneswalkers();
  if (!l.length) return;
  choixDe(P, env.src).nom = l[entierHasard(P.rng, l.length)];
  jn(P, `${choixDe(P, env.src).nom} est nommé au hasard`);
})(FORGE_API.NameCard.gen);
