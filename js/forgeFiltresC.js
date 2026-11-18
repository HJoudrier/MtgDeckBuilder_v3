/* =====================================================================
   js/forgeFiltresC.js — Des propriétés de filtre de plus

   Ce que demandaient quelques cartes très jouées (lots F60 et F61) :
   - `hasABasicLandType` (Boseiju, Sprouting Goblin) : un terrain qui porte
     un type de terrain de base, Plaine ou Île… même s'il n'est pas de base ;
   - `ManaCost0` / `ManaCost1` (Urza's Saga) : un coût de mana de {0} ou de
     {1}. Un terrain, un jeton n'ont pas de coût : ils ne répondent pas ;
   - `doesNotShareNameWith YourGraveyard` / `OtherYourBattlefield`
     (Guardian Project, Yenna) : le nom n'est pas déjà celui d'une carte de
     son cimetière, ou d'un autre permanent qu'on contrôle ;
   - `sharesCreatureTypeWith Commander` (Path of Ancestry) : un type de
     créature en commun avec un commandant de son contrôleur ;
   - `sharesCreatureTypeWith` seul : un type avec la source du filtre (Coat of
     Arms, Mana Echoes, Alpha Status), de même pour le nom et le type de carte ;
   - `IsRingbearer` : le porteur de l'Anneau (js/forgeAnneau.js).
   Comme les autres : une propriété qu'on ne sait pas juger ne laisse rien
   passer (js/forgeValide.js).
   ===================================================================== */

const TERRAINS_DE_BASE = ['plains', 'island', 'swamp', 'mountain', 'forest'];

/* Les cartes que `j` a choisies pour commandants, en définitions. */
function defsCommandants(P, j) {
  return (P.joueurs[j].commandants || []).map(cid => P.cartes[cid] && P.cartes[cid].def).filter(Boolean);
}

proprieteDesignee = (g => function (P, o, p, c, src, ctrl, env) {
  if (!P && /^(sharesCreatureTypeWith Commander|doesNotShareNameWith )/.test(p)) return false;
  /* « shares a creature type with it » : sans objet nommé, avec la source du filtre (Coat of Arms, Locket of Yesterdays). */
  const part = /^shares(CardType|CreatureType|Name)With$/.exec(p);
  if (part) return !!P && !!src && !!src.def && PARTAGES[part[1]](P, {...c, nom: o.def.nom}, src);
  switch (p) {
    case 'IsRingbearer': return !!o.porteAnneau;
    case 'hasABasicLandType': return (c.sousTypes || []).some(t => TERRAINS_DE_BASE.includes(t));
    case 'ManaCost0': case 'ManaCost1': {
      const cout = o.def.cout;
      return !!o.def.coutTexte && o.def.coutTexte !== 'no cost' && !!cout && cout.total === +p.slice(8) && !cout.x;
    }
    case 'sharesCreatureTypeWith Commander': {
      const mes = sousTypesCreature(c);
      return defsCommandants(P, ctrl != null ? ctrl : o.ctrl).some(d => c.changelin || (d.sousTypes || []).some(t => !SOUSTYPES_NON_CREATURE.has(t) && (mes.includes(t) || !!d.changelin)));
    }
    case 'doesNotShareNameWith YourGraveyard': {
      const J = P.joueurs[ctrl != null ? ctrl : o.ctrl];
      return !J.cimetiere.some(id => id !== o.id && obj(P, id).def.nom === o.def.nom);
    }
    case 'doesNotShareNameWith OtherYourBattlefield':
      return !P.champ.some(id => id !== o.id && obj(P, id).ctrl === (ctrl != null ? ctrl : o.ctrl) && obj(P, id).def.nom === o.def.nom);
  }
  return g(P, o, p, c, src, ctrl, env);
})(proprieteDesignee);

forgeSait('filtre', ...['CardType', 'CreatureType', 'Name'].map(k => `shares${k}With`), 'IsRingbearer', 'hasABasicLandType', 'ManaCost0', 'ManaCost1', 'sharesCreatureTypeWith Commander',
  'doesNotShareNameWith YourGraveyard', 'doesNotShareNameWith OtherYourBattlefield');
