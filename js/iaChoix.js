/* =====================================================================
   js/iaChoix.js — Les choix du joueur automatique hors de la priorité

   Garder sa main, la remettre dessous, choisir des cibles, chercher,
   défausser, sacrifier, accepter un « you may », choisir des modes. Chaque
   réponse est un indice d'option, comme celles d'un humain : le moteur ne
   fait pas de différence.
   ===================================================================== */

function terrainsEnMain(P, j) { return P.joueurs[j].main.filter(id => estType(obj(P, id), 'land')).length; }

/* Garder une main de sept : deux à cinq terrains. Après deux mulligans, on
   garde tout ce qui a un terrain. */
function iaMulligan(P, q) {
  const L = terrainsEnMain(P, q.joueur), n = q.extra.n;
  if (n >= 2) return L >= 1 ? 0 : 1;
  return L >= 2 && L <= 5 ? 0 : 1;
}

/* Trier des cartes de la main de la moins utile à la plus utile : les
   terrains en trop d'abord, puis les sorts qu'on ne pourra pas lancer de
   sitôt, les injouables en tête. */
function utiliteEnMain(P, j, id) {
  const o = obj(P, id), d = o.def;
  if (d.types.includes('land')) {
    const L = champDe(P, j).filter(x => estType(x, 'land')).length + terrainsEnMain(P, j);
    return L >= 6 ? 0.5 : 6;
  }
  if (d.couverture.etat === 'injouable') return -1;
  const dispo = manaDispo(P, j) + 2;
  return valeurDef(d) - Math.max(0, d.mv - dispo) * 1.5;
}

/* Choisir les cibles d'un emplacement : un effet hostile vise ce que
   l'adversaire a de mieux et qu'il peut atteindre, un effet favorable ce
   que j'ai de mieux. */
function iaCibles(P, q) {
  const j = q.joueur, ex = q.extra || {}, cands = q.options;
  const slot = ex.slot || {};
  const ops = ex.equipe || ex.aura ? [] : opsSurCible(ex.ops, ex.indice);
  let hostile = ops.some(opHostile);
  if (ex.aura) hostile = q.source && obj(P, q.source) && (!!obj(P, q.source).def.auraHostile || obj(P, q.source).def.statiques.some(s => s.s === 'interdit'));
  if (slot.desc && slot.desc.ctrl === 'vous') hostile = false;
  const opDeg = ops.find(o => o.op === 'degats');
  const n = opDeg && typeof opDeg.n === 'number' ? opDeg.n : null;
  const note = c => {
    const amoi = estAMoi(P, c, j);
    if (c && typeof c === 'object' && c.j != null) {
      const J = P.joueurs[c.j];
      if (!hostile) return amoi ? 5 : -5;
      if (amoi) return -100;
      return (n != null && n >= J.vie ? 50 : 2) + (40 - J.vie) * 0.05;
    }
    const o = obj(P, c);
    if (!o) return -100;
    let v = o.zone === 'pile' ? valeurDef(o.def) + o.def.mv : valeurObjet(P, o);
    if (hostile) {
      if (amoi) return -50 - v;
      if (n != null && estCreature(o) && o.zone === 'champ' && car(P, o).endurance - o.bless > n) v -= 20;
      return v;
    }
    if (o.zone === 'champ' && P.combat && (P.combat.attaquants.has(o.id) || P.combat.bloqueurs.has(o.id))) v += 3;
    return amoi ? v : -50 - v;
  };
  const tries = cands.map((c, i) => [i, note(c)]).sort((a, b) => b[1] - a[1]);
  const k = Math.max(q.min, Math.min(q.max, tries.filter(t => t[1] > 0).length));
  return tries.slice(0, Math.max(q.min, k)).map(t => t[0]);
}

/* Choisir parmi des cartes ou des permanents selon ce qu'on en fait. */
function iaCartes(P, q) {
  const j = q.joueur, t = q.texte;
  const pire = t === 'Défausser' || t === 'Sacrifier' || t === 'Engager' || t === 'Mettre dessous';
  const note = id => {
    const o = obj(P, id);
    if (!o) return 0;
    if (o.zone === 'main') return utiliteEnMain(P, j, id);
    if (o.zone === 'champ') return valeurObjet(P, o) + (o.jeton ? -1 : 0);
    if (estType(o, 'land')) {
      const L = champDe(P, j).filter(x => estType(x, 'land')).length;
      return L < 6 ? 8 : 1;
    }
    return valeurDef(o.def);
  };
  let tries = q.options.map((id, i) => [i, note(id)]).sort((a, b) => pire ? a[1] - b[1] : b[1] - a[1]);
  const k = pire ? q.min : q.max;
  return tries.slice(0, Math.max(q.min, Math.min(q.max, k))).map(x => x[0]);
}

/* Scruter : renvoyer dessous ce qui ne servira pas — des terrains quand on
   en a assez, des sorts trop chers sinon. */
function iaScrute(P, q) {
  const j = q.joueur;
  const L = champDe(P, j).filter(x => estType(x, 'land')).length + terrainsEnMain(P, j);
  return q.options.map((id, i) => [i, obj(P, id)]).filter(([, o]) => {
    if (!o) return false;
    if (estType(o, 'land')) return L >= 6;
    return o.def.mv > L + 3 || o.def.couverture.etat === 'injouable';
  }).map(x => x[0]);
}

/* « You may » : oui, sauf à payer pour empêcher ce qui ne gêne guère. */
function iaOui(P, q) {
  const ex = q.extra || {};
  if (ex.saufForge) return 1;
  if (ex.sauf) {
    const op = ex.sauf;
    const dispo = manaDispo(P, q.joueur);
    return op.sauf.cout.total * 3 <= dispo ? 1 : 0;
  }
  if (/PV/.test(q.texte)) return P.joueurs[q.joueur].vie > 8 ? 1 : 0;
  return 1;
}

/* Choisir des modes : ceux qui ont le plus d'effet. */
function iaModes(P, q) {
  const opts = (q.extra && q.extra.options) || [];
  const score = op => op.ops.reduce((s, o) => s + (opHostile(o) ? 3 : o.op === 'pioche' ? 2 : 1), 0);
  return opts.map((o, i) => [i, score(o)]).sort((a, b) => b[1] - a[1]).slice(0, q.max).map(x => x[0]);
}
