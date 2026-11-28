/* =====================================================================
   js/gestesAnalyse.js — Les gestes de l'onglet Analyse

   Le sommaire qui mène à un bloc, et la main d'essai qu'on retire ou qu'on
   fait piocher. Aucun ne touche au deck : rien à sauvegarder, rien à
   renoter, et seul le bloc concerné se réécrit.
   ===================================================================== */

function gestesAnalyse(act, b) {
  if (act === 'anaAller') {
    allerVersBlocAnalyse(b.dataset.cible);
    return true;
  }
  if (act === 'anaMain') {
    nouvelleMainEssai();
    majMainEssai();
    return true;
  }
  if (act === 'anaPioche') {
    piocheMainEssai();
    majMainEssai();
    return true;
  }
  return false;
}
