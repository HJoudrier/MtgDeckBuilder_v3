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
      /* Infliger des dégâts de combat au monarque prend la couronne. */
      if (e.t === 'degatsJoueur' && e.combat && P.monarque === e.joueur) { const s = obj(P, e.source) || P.lkis.get(e.source); if (s && s.ctrl != null) P.monarque = s.ctrl; }
      break;
    case 'sacrifie': plusUn(h.sacrifies, e.joueur); break;
    case 'defausse': plusUn(h.defausses, e.joueur); break;
    case 'marqueur': h.marqueurs += e.n || 0; break;
    case 'entre': { const o = obj(P, e.id); if (o) o.entreTour = P.tour; break; }
    case 'attaque': { const o = obj(P, e.id); if (o) o.attaqueTour = P.tour; break; }
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
      break;
  }
}

/* Une capacité qui se résout : « the Nth time this ability has resolved
   this turn ». */
function noteResolution(P, item) { plusUn(histoire(P).resolus, item.sort ? 'sort' + item.id : item.source); }

/* Le mana dépensé pour lancer un objet, sur la pile ou en jeu. */
function manaDepenseDe(o) { return (o && (o.manaSort || (o.lance && o.lance.mana))) || null; }
