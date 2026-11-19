/* =====================================================================
   tour.js — Le tour de la petite partie, et Mirela

   La suite de scene.js : les étapes du tour, le combat, le jeu de Mirela
   (une poignée de règles, pas une IA), et ce que les maquettes demandent
   à la scène pour écrire leurs boutons.
   ===================================================================== */

function entre(ph) {
  E.phase = ph;
  E.question = null;
  E.prio = null;
  ev({t: 'phase', phase: ph, actif: E.actif});
  const a = E.actif;
  switch (ph) {
    case 'entretien': degage(a); return fenetre();
    case 'pioche': pioche(a); return fenetre();
    case 'principale1': case 'principale2':
      if (ph === 'principale2') E.obj.forEach(o => { o.attaque = false; o.bloque = null; o.estBloque = false; });
      return a === 'moi' ? demande({q: 'priorite'}) : plus(DELAIS.pense, iaPrincipale);
    case 'attaquants':
      if (a === 'adv') return plus(DELAIS.pense, iaAttaque);
      return attaquantsPossibles().length ? demande({q: 'attaquants'}) : plus(DELAIS.etape * .5, () => entre('principale2'));
    case 'bloqueurs':
      if (a === 'moi') return plus(DELAIS.pense, iaBloque);
      journal('Rien chez vous ne peut bloquer.');
      return fenetre();
    case 'degats': combat(); return plus(DELAIS.vue * .6, fenetre);
    case 'fin': return fenetre();
  }
}

function attaque(ids) {
  if (!E || !E.question || E.question.q !== 'attaquants') return;
  attaqueInterne(ids);
  notifie();
}

function attaqueInterne(ids) {
  E.question = null;
  E.prio = null;
  const att = ids.map(obj).filter(o => o && peutAttaquer(o));
  if (!att.length) { journal('Vous n\'attaquez pas.'); return plus(DELAIS.etape, () => entre('principale2')); }
  att.forEach(o => { o.attaque = true; o.engage = true; });
  journal(`Vous attaquez avec ${liste(att)}.`);
  ev({t: 'attaque', j: 'moi', ids: att.map(o => o.id)});
  plus(DELAIS.geste, () => entre('bloqueurs'));
}

/* Une créature bloquée le reste, même si son bloqueur a disparu : elle
   n'inflige alors ses blessures à personne. */
function combat() {
  const a = E.actif, d = autre(a);
  for (const x of dans(a, 'champ').filter(o => o.attaque)) {
    const b = dans(d, 'champ').find(o => o.bloque === x.id);
    if (b) {
      b.bless += force(x);
      x.bless += force(b);
      ev({t: 'choc', a: x.id, b: b.id});
      ev({t: 'degats', cible: b.id, n: force(x)});
      if (force(b)) ev({t: 'degats', cible: x.id, n: force(b)});
    } else if (force(x) > 0 && !x.estBloque) inflige(d, force(x), x);
  }
  etatsDeJeu();
  verifieFin();
}

function degage(j) {
  E.obj.filter(o => o.ctrl === j && o.zone === 'champ').forEach(o => { o.engage = false; o.malade = false; });
  ev({t: 'degage', j});
}

function pioche(j) {
  if (!E.bib[j].length) return;
  const o = cree(E.bib[j].shift(), j, 'main');
  o.prec = 'bib';
  journal(j === 'moi' ? `Vous piochez ${def(o).nom}.` : 'Mirela pioche.');
  ev({t: 'pioche', j, id: o.id});
}

function tourSuivant() {
  E.obj.forEach(o => { o.bless = 0; o.bonus = [0, 0]; });
  E.terrainJoue = {moi: false, adv: false};
  E.jusqua = null;
  E.morsureTour = false;
  E.actif = autre(E.actif);
  E.tour++;
  journal(`— Tour ${E.tour} : ${E.actif === 'moi' ? 'le vôtre' : nomJ('adv')}`);
  ev({t: 'tour', actif: E.actif, tour: E.tour});
  plus(DELAIS.vue * .7, () => entre('entretien'));
}

/* ---------- Mirela ---------- */

const valeur = o => coutTotal(def(o).cout) + force(o);

function iaPrincipale() {
  const terrain = dans('adv', 'main').find(o => def(o).terrain);
  if (terrain && !E.terrainJoue.adv) {
    deplace(terrain, 'champ');
    E.terrainJoue.adv = true;
    journal(`Mirela pose ${def(terrain).nom}.`);
    ev({t: 'pose', j: 'adv', id: terrain.id});
    return plus(DELAIS.geste, iaPrincipale);
  }
  const crea = dans('adv', 'main').filter(o => !def(o).terrain && !def(o).instant && terrainsPour('adv', def(o).cout, o.id))
    .sort((x, y) => coutTotal(def(y).cout) - coutTotal(def(x).cout))[0];
  if (crea) {
    lance(crea, 'adv', null);
    journal(`Mirela lance ${def(crea).nom}.`);
    return fenetrePile();
  }
  fenetre();
}

function iaAttaque() {
  const mesLibres = dans('moi', 'champ').filter(o => !def(o).terrain && !o.engage);
  const att = dans('adv', 'champ').filter(o => !def(o).terrain && !o.engage && !o.malade && force(o) > 0 && (def(o).vol || !mesLibres.length));
  if (!att.length) { journal('Mirela n\'attaque pas.'); return entre('principale2'); }
  att.forEach(o => { o.attaque = true; o.engage = true; });
  journal(`Mirela attaque avec ${liste(att)}.`);
  ev({t: 'attaque', j: 'adv', ids: att.map(o => o.id)});
  fenetre();
}

/* Bloquer quand le bloqueur survit, ou pour un échange qui l'arrange. */
function iaBloque() {
  const libres = dans('adv', 'champ').filter(o => !def(o).terrain && !o.engage);
  const paires = [];
  for (const a of dans('moi', 'champ').filter(o => o.attaque).sort((x, y) => force(y) - force(x))) {
    const ok = libres.filter(b => !b.bloque && (!def(a).vol || def(b).vol));
    const b = ok.filter(x => reste(x) > force(a)).sort((x, y) => force(y) - force(x))[0] ||
      ok.find(x => force(x) >= reste(a) && valeur(a) >= valeur(x));
    if (b) { b.bloque = a.id; a.estBloque = true; paires.push([b.id, a.id]); }
  }
  if (paires.length) {
    journal(`Mirela bloque : ${paires.map(([b, a]) => `${def(obj(b)).nom} contre ${def(obj(a)).nom}`).join(', ')}.`);
    ev({t: 'bloque', paires});
  } else journal('Mirela ne bloque pas.');
  plus(DELAIS.geste, () => { if (aDesReponses()) demande({q: 'priorite'}); else if (!iaRepond()) plus(DELAIS.etape, suite); });
}

/* Une seule ruse : la Morsure, pendant le combat du joueur, sur
   l'attaquant le plus fort qu'elle tue. */
function iaRepond() {
  if (E.actif !== 'moi' || !['attaquants', 'bloqueurs'].includes(E.phase) || E.morsureTour) return false;
  const m = dans('adv', 'main').find(o => o.k === 'morsure');
  if (!m || !terrainsPour('adv', def(m).cout, m.id)) return false;
  const cible = dans('moi', 'champ').filter(o => o.attaque && reste(o) <= 2).sort((x, y) => force(y) - force(x))[0];
  if (!cible) return false;
  E.morsureTour = true;
  lance(m, 'adv', cible.id);
  journal(`Mirela répond : ${def(m).nom} sur ${def(cible).nom}.`);
  fenetrePile();
  return true;
}

/* ---------- Ce que les maquettes demandent ---------- */

/* Ce que fera « passer », en une phrase : on ne passe plus à l'aveugle. */
function apercuPasser() {
  if (!E || E.fin) return '';
  if (E.auto) return 'Rien à jouer : la priorité passe d\'elle-même.';
  if (E.prio !== 'moi' || !E.question) return E.actif === 'adv' ? 'Mirela joue son tour.' : 'Mirela a la main.';
  if (E.question.q === 'attaquants') return 'Choisissez vos attaquants, ou n\'attaquez pas.';
  if (E.pile.length) { const h = obj(E.pile[E.pile.length - 1]); return `${def(h).nom} se résout : ${effetTexte(h)}.`; }
  if (E.actif === 'adv') return 'Mirela continue son tour.';
  switch (E.phase) {
    case 'principale1': return attaquantsPossibles().length ? 'On passe au combat.' : 'Personne ne peut attaquer : le tour file vers la fin.';
    case 'principale2': return 'Votre tour se termine, Mirela joue.';
    case 'bloqueurs': return 'Les blessures de combat tombent.';
    default: return 'On passe à l\'étape suivante.';
  }
}

function libellePasser() {
  if (E.pile.length) return obj(E.pile[E.pile.length - 1]).ctrl === 'adv' ? 'Laisser résoudre' : 'Résoudre';
  if (E.actif === 'adv') return 'Continuer';
  return {principale1: attaquantsPossibles().length ? 'Combat' : 'Fin du tour', principale2: 'Fin du tour', bloqueurs: 'Blessures'}[E.phase] || 'Passer';
}

function attente() {
  if (!E) return '';
  if (E.fin) return E.fin.gagnant === 'moi' ? 'Victoire' : E.fin.gagnant ? 'Défaite' : 'Partie nulle';
  if (E.auto) return 'Passage auto';
  if (E.prio === 'moi') return '';
  return E.actif === 'adv' ? 'Mirela joue' : 'Mirela réfléchit';
}

function basculeArret(ph) {
  if (E.arrets.has(ph)) E.arrets.delete(ph); else E.arrets.add(ph);
}

const Scene = {
  get E() { return E; },
  nouvelle, ecoute: f => { ECOUTEUR = f; }, joue, passe, attaque, retiens, passeJusqua, basculeArret,
  jouables, cibles, attaquantsPossibles, pourquoiPas, apercuPasser, libellePasser, attente,
  obj, dans, def, force, endurance, reste, nomCible, effetTexte
};
