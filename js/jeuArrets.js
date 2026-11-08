/* =====================================================================
   js/jeuArrets.js — Quand demander à un joueur humain

   Les règles donnent la priorité à chaque étape : un humain cliquerait
   « Passer » des dizaines de fois par tour. Comme sur Arena, la table ne
   s'arrête que là où il a coché un arrêt — et toujours quand un adversaire
   vient de poser quelque chose sur la pile. Le moteur ne pose déjà aucune
   question quand passer est la seule chose possible ; ce filtre ne retire
   que les priorités où l'on pourrait agir sans en avoir envie.
   ===================================================================== */

/* Les arrêts de départ : mes deux phases principales et le moment où les
   bloqueurs sont posés ; chez les autres, leurs attaquants déclarés, leurs
   bloqueurs, leur fin de tour. */
function arretsParDefaut() {
  return {moi: {principale1: true, bloqueurs: true, principale2: true},
    eux: {attaquants: true, bloqueurs: true, fin: true}, pileSoi: false, controleTotal: false};
}

/* Faut-il poser cette question de priorité au joueur ? `A.passeJusqua` :
   le numéro du tour où il a demandé « passer jusqu'à mon tour » ; il tombe
   de lui-même au début de son tour suivant. */
function doitDemander(P, j, q, A) {
  if (q.q !== 'priorite' || !A || A.controleTotal) return true;
  if (A.passeJusqua != null) {
    if (P.actif === j && P.tour > A.passeJusqua) A.passeJusqua = null;
    else return false;
  }
  const sommet = P.pile[P.pile.length - 1];
  if (sommet) return sommet.ctrl !== j || !!A.pileSoi;
  return !!(P.actif === j ? A.moi : A.eux)[P.etape];
}
