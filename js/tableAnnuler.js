/* =====================================================================
   js/tableAnnuler.js — Revenir en arrière d'une réponse

   Lot F102. Le moteur est déterministe : même graine, mêmes fiches, mêmes
   réponses, même partie (js/tableReprise.js s'en sert pour reprendre après
   un rechargement). « Annuler » rejoue donc la partie depuis le début avec
   les réponses qui précèdent la dernière que ce siège a données — celles
   des automates comprises, puisqu'elles sont toutes dans la consigne. Ce
   que le joueur a fait depuis, un sort lancé, une cible choisie, une
   priorité passée, s'efface : la même question se repose.

   Seul l'hôte, quand la question attendue est la sienne et qu'aucun autre
   humain ne joue à la table : annuler ce que d'autres ont vu serait
   injuste. Le rejeu refait les automates avec un agent neuf : après un
   retour en arrière, ils peuvent jouer autrement qu'avant.
   ===================================================================== */

function peutAnnulerTable() {
  if (TABLE.role !== 'hote' || !TABLE.h || TABLE.h.fini || !TABLE.question || !(TABLE.points || []).length) return false;
  return TABLE.sieges.every(s => s.mode === 'moi' || s.mode === 'ia' || s.confie);
}

function annulerHTML() {
  return peutAnnulerTable() ? `<button type="button" class="btn sm tr-annule" data-act="tAnnuler" title="Revenir à avant votre dernière réponse">↶ Annuler</button>` : '';
}

function annuleTable() {
  if (!peutAnnulerTable()) return;
  const k = TABLE.points.pop(), reps = TABLE.h.P.reponses.slice(0, k), cfg = TABLE.config;
  const sieges = TABLE.sieges.map(s => ({...siegeDepuisFiches(s.nom, s.fiches.format, s.fiches.cartes, s.fiches.commandants, s.fiches.comportements), nom: s.nom}));
  const mana = cfg.mana || sieges.map(() => ({}));
  TABLE.h = creePartie({graine: cfg.graine, premier: cfg.premier, plafondTours: 60, journal: true, consigne: true, montre: !!cfg.montre,
    sieges: sieges.map((x, i) => ({...x, ...mana[i]}))});
  TABLE.agents = sieges.map(() => ({humain: true}));
  TABLE.sieges.forEach((s, i) => { s.ia = agentIA(cfg.graine, i); });
  avance(TABLE.h, TABLE.agents, Infinity, null);
  for (const r of reps) {
    if (TABLE.h.fini || !TABLE.h.attente) break;
    repondre(TABLE.h, TABLE.agents, r, Infinity, null);
  }
  Object.assign(TABLE, {question: null, erreur: '', sel: null, loupe: null, zone: null, menu: null, leve: null, pause: null, suite: null, vuePeinte: null});
  TABLE.journalVu = journalTable().length;
  toast('Dernière réponse annulée.');
  diffuseVues(true);
  boucleTable();
}
