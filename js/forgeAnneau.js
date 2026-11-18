/* =====================================================================
   js/forgeAnneau.js — L'Anneau vous tente, aux quatre niveaux

   « The Ring tempts you » (règle 701.52) : on choisit un porteur, et
   chaque tentation monte d'un niveau, au plus quatre. Le premier niveau
   (légendaire, pas bloquée par une créature de plus grande force) vit dans
   js/jeuCaracteristiques.js et js/jeuCombat.js. Les trois autres sont des
   déclencheurs du joueur, que ce fichier écrit comme un script de Forge et
   pose en effet permanent à son premier passage :
   - 2 : quand le porteur attaque, piocher puis défausser ;
   - 3 : quand il est bloqué, le contrôleur du bloqueur le sacrifie à la
     fin du combat ;
   - 4 : quand il blesse un joueur au combat, chaque adversaire perd 3 vie.
   ===================================================================== */

const NIVEAUX_ANNEAU = {
  2: `Name:Anneau 2
T:Mode$ Attacks | ValidCard$ Card.IsRingBearer+YouCtrl | Execute$ TrigBoucle | TriggerDescription$ Whenever your Ring-bearer attacks, draw a card, then discard a card.
SVar:TrigBoucle:DB$ Draw | Defined$ You | NumCards$ 1 | SubAbility$ DBDefausse
SVar:DBDefausse:DB$ Discard | Defined$ You | NumCards$ 1 | Mode$ TgtChoose`,
  3: `Name:Anneau 3
T:Mode$ AttackerBlockedByCreature | ValidCard$ Card.IsRingBearer+YouCtrl | ValidBlocker$ Creature | Execute$ TrigSacrifice | TriggerDescription$ Whenever your Ring-bearer becomes blocked by a creature, that creature's controller sacrifices it at end of combat.
SVar:TrigSacrifice:DB$ DelayedTrigger | Mode$ Phase | Phase$ EndCombat | Execute$ DBSacrifie | RememberObjects$ TriggeredBlocker
SVar:DBSacrifie:DB$ SacrificeAll | ValidCards$ Card.IsRemembered`,
  4: `Name:Anneau 4
T:Mode$ DamageDone | ValidSource$ Card.IsRingBearer+YouCtrl | ValidTarget$ Player | CombatDamage$ True | Execute$ TrigPerd | TriggerDescription$ Whenever your Ring-bearer deals combat damage to a player, each opponent loses 3 life.
SVar:TrigPerd:DB$ LoseLife | Defined$ Player.Opponent | LifeAmount$ 3`};

const ANNEAU_DEFS = {};

/* Les capacités d'un niveau, compilées une fois. */
function capacitesAnneau(niveau) {
  if (!ANNEAU_DEFS[niveau]) {
    const r = definitionDepuisScript(lisScriptForge(NIVEAUX_ANNEAU[niveau]), {nom: 'Anneau ' + niveau, jeton: true}, {});
    ANNEAU_DEFS[niveau] = r.def.capacites;
  }
  return ANNEAU_DEFS[niveau];
}

/* Le niveau atteint par la tentation : pose, une fois par joueur et par
   niveau, l'effet qui porte ses déclencheurs. */
function poseNiveauAnneau(P, j, niveau) {
  const J = P.joueurs[j];
  J.anneauPose = J.anneauPose || [];
  for (let n = 2; n <= niveau; n++) {
    if (J.anneauPose.includes(n)) continue;
    J.anneauPose.push(n);
    poseEffet(P, {nom: "L'Anneau", ctrl: j, capacites: capacitesAnneau(n), fin: null, srcId: null, memo: [], memoJ: []});
  }
}
