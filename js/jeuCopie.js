/* =====================================================================
   js/jeuCopie.js — Copier une partie, et la reprendre

   Le moteur avance par générateurs, et un générateur ne se copie pas. Mais
   l'état de la partie (`P`) n'est fait que de données : on le copie, puis
   on relance le moteur depuis un point où il ne garde rien en propre, et
   il repose la même question. Trois points le permettent :
   - la priorité du joueur actif en phase principale, pile vide :
     `priorite()` n'y porte aucun état qu'on ne puisse reprendre ;
   - la déclaration des attaquants, et celle des bloqueurs du premier
     défenseur : on relance l'étape, qui repose la question.
   Ensuite la reprise enchaîne la suite du tour (`suiteDuTour()`) puis les
   tours suivants (`suiteDesTours()`), comme la partie elle-même.

   Les définitions de cartes ne changent jamais en place — une copie ou un
   clone en crée de nouvelles — : la copie les partage, avec tout ce
   qu'elles contiennent (capacités, effets compilés, descripteurs), ce qui
   la rend quatre fois plus rapide et garde l'identité d'une capacité
   qu'une liste de l'état désigne (une capacité épuisée, par exemple). Le
   journal et la consigne des réponses ne suivent pas.
   ===================================================================== */

/* Une définition se reconnaît à ses types, ses capacités et ses statiques. */
function estDefinition(x) { return Array.isArray(x.types) && Array.isArray(x.capacites) && Array.isArray(x.statiques); }

/* Tout ce qu'une définition contient, marqué une fois pour toutes. */
const PARTIES_DEF = new WeakSet(), DEFS_MARQUEES = new WeakSet();
function marqueDefinition(d) {
  if (!d || typeof d !== 'object' || DEFS_MARQUEES.has(d)) return;
  DEFS_MARQUEES.add(d);
  const pile = [d];
  while (pile.length) {
    const x = pile.pop();
    if (x === null || typeof x !== 'object' || PARTIES_DEF.has(x)) continue;
    PARTIES_DEF.add(x);
    if (x instanceof Map) x.forEach((v, k) => { pile.push(v, k); });
    else if (x instanceof Set) x.forEach(v => pile.push(v));
    else for (const k in x) pile.push(x[k]);
  }
}

/* Une copie profonde de l'état, qui garde les références partagées et
   partage les définitions. Elles sont marquées d'abord, pour qu'une
   capacité rencontrée avant sa définition soit partagée elle aussi. */
function copiePartie(P) {
  P.cartes.forEach(c => marqueDefinition(c.def));
  P.objets.forEach(o => { marqueDefinition(o.def); marqueDefinition(o.vraieDef); });
  (P.effets || []).forEach(e => marqueDefinition(e.def));
  P.pile.forEach(it => marqueDefinition(it.def));
  const vus = new Map([[P.journal, null], [P.reponses, null]]);
  const copie = x => {
    if (x === null || typeof x !== 'object') return x;
    if (vus.has(x)) return vus.get(x);
    if (PARTIES_DEF.has(x)) return x;
    if (estDefinition(x)) { marqueDefinition(x); return x; }
    let r;
    if (Array.isArray(x)) { r = new Array(x.length); vus.set(x, r); for (let i = 0; i < x.length; i++) r[i] = copie(x[i]); return r; }
    if (x instanceof Map) { r = new Map(); vus.set(x, r); x.forEach((v, k) => r.set(copie(k), copie(v))); return r; }
    if (x instanceof Set) { r = new Set(); vus.set(x, r); x.forEach(v => r.add(copie(v))); return r; }
    r = {}; vus.set(x, r);
    for (const k in x) r[k] = copie(x[k]);
    return r;
  };
  const c = copie(P);
  /* Les essais d'une IA n'ont personne pour regarder. */
  c.montre = false;
  return c;
}

/* Le point de reprise d'une question, ou `null` si elle n'en est pas un. */
function pointDeReprise(P, q) {
  if (q.q === 'priorite') return !P.pile.length && q.joueur === P.actif && /^principale[12]$/.test(P.etape) ? 'priorite' : null;
  if (q.q === 'attaquants') return 'etape';
  if (q.q === 'bloqueurs') return P.combat && !P.combat.bloqueurs.size ? 'etape' : null;
  return null;
}

/* Le moteur repris d'une copie, au point dit, jusqu'à la fin. */
function* reprise(P, point) {
  if (point === 'priorite') yield* priorite(P);
  else yield* etape(P, P.etape);
  videReserves(P);
  P.iEtape++;
  yield* suiteDuTour(P);
  yield* suiteDesTours(P);
  cloturePartie(P);
}

/* La reprise repose-t-elle bien la question d'origine ? */
function memeQuestion(a, b) {
  return a.q === b.q && a.joueur === b.joueur && JSON.stringify(a.options) === JSON.stringify(b.options);
}

/* Essayer une réponse sur une copie : copier, reprendre, répondre `reponse`
   à la question `q`, puis laisser jouer `agents` jusqu'à ce que `horizon`
   (une question et la copie) dise d'arrêter, ou jusqu'à la fin. Rend la
   copie atteinte, ou `null` si la question n'est pas un point de reprise,
   si la reprise ne la repose pas à l'identique, ou si le moteur échoue. */
function essaieCoup(P, q, reponse, horizon, agents) {
  const point = pointDeReprise(P, q);
  if (!point) return null;
  const C = copiePartie(P);
  try {
    const gen = reprise(C, point);
    let it = gen.next();
    if (it.done || !memeQuestion(it.value, q)) return null;
    let r = valideReponse(it.value, reponse);
    for (;;) {
      it = gen.next(r);
      if (it.done || horizon(C, it.value)) return C;
      r = valideReponse(it.value, agents[it.value.joueur].repond(C, it.value));
    }
  } catch (e) {
    return null;
  }
}
