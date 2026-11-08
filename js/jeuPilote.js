/* =====================================================================
   js/jeuPilote.js — Dérouler une partie, question après question

   Le moteur ne décide rien : il pose des questions (`yield`) et attend la
   réponse. Le pilote les porte à l'agent du joueur concerné — un joueur
   automatique répond sur-le-champ, un humain (lot 2) laissera la question en
   attente — et rend la main quand le budget de temps est épuisé : un lot de
   simulations se découpe ainsi au milieu d'une partie, sans rien
   sérialiser, et la page reste vivante.
   ===================================================================== */

/* Une partie prête à dérouler. */
function creePartie(cfg) {
  const P = nouvellePartie(cfg);
  P.unefois = new Set();
  return {P, gen: partie(P), reponse: undefined, fini: false, attente: null};
}

/* Une réponse est-elle recevable ? Sinon on retient le défaut de la
   question, et on le dit dans le journal. */
function valideReponse(q, r) {
  const n = q.options.length;
  if (q.q === 'attaquants' || q.q === 'bloqueurs') {
    if (!Array.isArray(r)) return q.defaut;
    return r.filter(p => Array.isArray(p) && p.length === 2 && Number.isInteger(p[0]) && p[0] >= 0 && p[0] < n && Number.isInteger(p[1]));
  }
  if (q.multi) {
    if (!Array.isArray(r)) return q.defaut;
    const u = [...new Set(r.filter(i => Number.isInteger(i) && i >= 0 && i < n))];
    return u.length < q.min || u.length > q.max ? q.defaut : u;
  }
  return Number.isInteger(r) && r >= 0 && r < n ? r : q.defaut;
}

/* Ce qui ne va pas dans la réponse d'un humain, en une phrase, ou rien.
   `valideReponse()` remplace en silence une réponse invalide par le défaut
   — juste pour un joueur automatique, qui ne se trompe pas ; un humain doit
   plutôt être réinterrogé, la raison sous les yeux. */
function reponseRecevable(q, r) {
  const n = q.options.length;
  if (q.q === 'attaquants' || q.q === 'bloqueurs') {
    if (!Array.isArray(r)) return 'Réponse illisible.';
    if (r.some(p => !Array.isArray(p) || p.length !== 2 || !Number.isInteger(p[0]) || p[0] < 0 || p[0] >= n || !Number.isInteger(p[1]))) return 'Une paire est invalide.';
    const vus = new Set(r.map(p => p[0]));
    return vus.size === r.length ? '' : 'Une créature figure deux fois.';
  }
  if (q.multi) {
    if (!Array.isArray(r) || r.some(i => !Number.isInteger(i) || i < 0 || i >= n)) return 'Réponse illisible.';
    const u = new Set(r).size;
    if (u !== r.length) return 'Un choix figure deux fois.';
    if (u < q.min) return q.min === q.max ? `Choisissez-en ${q.min}.` : `Choisissez-en au moins ${q.min}.`;
    if (u > q.max) return `Choisissez-en au plus ${q.max}.`;
    return '';
  }
  return Number.isInteger(r) && r >= 0 && r < n ? '' : 'Réponse illisible.';
}

/* Dérouler une partie. `agents[j]` répond pour le joueur j :
   `{humain, repond(P, q)}`. Rend `finie`, `attente` (un humain doit
   répondre), `pause` (budget épuisé) ou `erreur`. `horloge` est passée par
   l'appelant : le moteur ne lit pas l'heure lui-même. */
function avance(h, agents, budgetMs, horloge) {
  if (h.fini) return 'finie';
  const fin = horloge ? horloge() + budgetMs : Infinity;
  let r = h.reponse, k = 0;
  try {
    for (;;) {
      const it = h.gen.next(r);
      if (it.done) { h.fini = true; return 'finie'; }
      const q = it.value, ag = agents[q.joueur];
      if (ag.humain) { h.attente = q; h.reponse = undefined; return 'attente'; }
      r = valideReponse(q, ag.repond(h.P, q));
      if (h.P.reponses) h.P.reponses.push(r);
      if ((++k & 127) === 0 && horloge && horloge() > fin) { h.reponse = r; return 'pause'; }
    }
  } catch (err) {
    h.fini = true;
    h.P.fin = {erreur: String((err && err.stack) || err), nulle: true, raison: 'erreur', tour: h.P.tour,
      journal: h.P.journal ? h.P.journal.slice(-30) : null};
    return 'erreur';
  }
}

/* Répondre à la question en attente (lot 2), puis reprendre. */
function repondre(h, agents, r, budgetMs, horloge) {
  if (!h.attente) return avance(h, agents, budgetMs, horloge);
  h.reponse = valideReponse(h.attente, r);
  if (h.P.reponses) h.P.reponses.push(h.reponse);
  h.attente = null;
  return avance(h, agents, budgetMs, horloge);
}

/* Jouer une partie jusqu'au bout d'une traite (tests, rejeu). */
function joueJusquauBout(cfg, agents) {
  const h = creePartie(cfg);
  avance(h, agents, Infinity, null);
  return h.P;
}
