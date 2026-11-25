/* =====================================================================
   js/jeuHistorique.js — Ce qui s'est passé ce tour

   « Creatures that entered this turn », « a creature dealt damage this
   turn », « the life your opponents lost this turn », « was cast from your
   hand », « for each color of mana spent to cast it »… Chaque évènement
   émis (js/jeuEtat.js `emet()`) passe ici : l'historique du tour se tient
   au même endroit, sans que chaque geste ait à s'en soucier. Il se refait
   tout seul quand le tour change (`P.hist.tour`).

   Sur l'objet : `entreTour`, `blesseTour`, `blessePar`, `attaqueTour`, et
   `lance` (qui l'a lancé, d'où, avec quel mana).
   ===================================================================== */

function histoire(P) {
  if (!P.hist || P.hist.tour !== P.tour) {
    /* « Last turn » : l'historique du tour d'avant (Command the Stage). */
    P.histPrec = P.hist || null;
    P.hist = {tour: P.tour, perdu: {}, sacrifies: {}, defausses: {}, marqueurs: 0, quitteCimetiere: [], resolus: {}, vide: false};
  }
  return P.hist;
}

function plusUn(m, k, n) { m[k] = (m[k] || 0) + (n == null ? 1 : n); }

function noteHistorique(P, e) {
  const h = histoire(P);
  switch (e.t) {
    case 'perteVie': case 'degatsJoueur':
      plusUn(h.perdu, e.joueur, e.n || 0);
      /* Les dégâts reçus par joueur, et ceux qu'un contrôleur a infligés hors combat (`MaxOppDamageThisTurn`, `NonCombatDamageThisTurn`). */
      if (e.t === 'degatsJoueur') { plusUn(h.degatsRecus = h.degatsRecus || {}, e.joueur, e.n || 0); if (!e.combat && e.ctrl != null) plusUn(h.degatsHorsCombat = h.degatsHorsCombat || {}, e.ctrl, e.n || 0); }
      /* Qui a blessé ce joueur au combat ce tour (`dealtCombatDamageThisTurn You`). */
      if (e.t === 'degatsJoueur' && e.combat) ((h.degatsCombatPar = h.degatsCombatPar || {})[e.joueur] = h.degatsCombatPar[e.joueur] || []).push(e.source);
      if (P.vitesses) vitesseMonte(P, e);
      if (e.t === 'degatsJoueur' && e.combat && P.initiative === e.joueur) initiativeVolee(P, e);
      /* Infliger des dégâts de combat au monarque prend la couronne. */
      if (e.t === 'degatsJoueur' && e.combat && P.monarque === e.joueur) { const s = obj(P, e.source) || P.lkis.get(e.source); if (s && s.ctrl != null && s.ctrl !== P.monarque) { const avant = P.monarque; P.monarque = s.ctrl; emet(P, {t: 'monarque', joueur: s.ctrl, avant}); } }
      break;
    case 'sacrifie': plusUn(h.sacrifies, e.joueur); break;
    case 'defausse': plusUn(h.defausses, e.joueur); break;
    case 'marqueur': h.marqueurs += e.n || 0; break;
    /* Les activations du tour, pour `Count$ThisTurnActivated` (js/forgeActivationsB.js). */
    case 'active': (h.activations = h.activations || []).push({joueur: e.joueur, id: e.id, loyaute: !!e.loyaute, equip: !!e.equip, lki: e.lki}); break;
    case 'entre': { const o = obj(P, e.id); if (o) { o.entreTour = P.tour; jourNuitEntree(P, o); } break; }
    case 'attaque': {
      const o = obj(P, e.id);
      if (o) o.attaqueTour = P.tour;
      /* Les adversaires attaqués ce tour, par attaquant (js/forgeDesignations.js). */
      const d = e.defenseur, j = d && (d.j != null ? d.j : d.pw != null && obj(P, d.pw) ? obj(P, d.pw).ctrl : null);
      if (o && j != null) ((h.attaques = h.attaques || {})[o.ctrl] = h.attaques[o.ctrl] || []).push(j);
      /* Les joueurs que cette créature a attaqués ce tour (« can't attack a player it has already attacked »). */
      if (o && j != null) { if (!o.cibleTour || o.cibleTour.tour !== P.tour) o.cibleTour = {tour: P.tour, l: []}; o.cibleTour.l.push(j); }
      break;
    }
    case 'degatsObjet': {
      const o = obj(P, e.id);
      if (!o) break;
      if (o.blesseTour !== P.tour) o.blessePar = [];
      o.blesseTour = P.tour;
      o.blessePar.push(e.source);
      break;
    }
    case 'zone':
      if (e.de === 'cimetiere') h.quitteCimetiere.push(e.lki || obj(P, e.id));
      if (e.de === 'champ' && e.lki && !(e.lki.types || []).includes('land')) h.vide = true;
      /* Revolt : un permanent qu'on contrôlait a quitté le champ ce tour. */
      if (e.de === 'champ' && e.lki) (h.revolte = h.revolte || {})[e.lki.ctrl] = true;
      break;
  }
}

/* Une capacité qui se résout : « the Nth time this ability has resolved
   this turn ». */
function noteResolution(P, item) { plusUn(histoire(P).resolus, item.sort ? 'sort' + item.id : item.source); }

/* Le mana dépensé pour lancer un objet, sur la pile ou en jeu. */
function manaDepenseDe(o) { return (o && (o.manaSort || (o.lance && o.lance.mana))) || null; }
