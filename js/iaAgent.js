/* =====================================================================
   js/iaAgent.js — Un joueur automatique

   L'agent répond à chaque question du moteur, sur-le-champ et sans hasard
   propre : deux parties de même graine se jouent coup pour coup pareil, ce
   qui permet de revoir une partie d'un lot en la rejouant. Le flux de
   hasard qu'il porte est semé par la graine et son siège ; le mulligan
   s'en sert pour ses tirages (js/iaMulligan.js), et il ne touche jamais
   l'ordre des bibliothèques.

   Deux usages, deux règles. À la table interactive, face à un humain,
   l'agent ne lit que ce que son joueur peut voir. Entre joueurs
   automatiques, pour juger la force d'un deck, il peut tout savoir en
   cours de partie — mains, faces cachées, ordre des bibliothèques — : ce
   qu'on mesure est le deck, pas l'art de deviner (js/iaRecherche.js).
   ===================================================================== */

/* La version du joueur automatique : un lot joué par une autre ne se
   rejoue plus à l'identique (js/simStockage.js `lotPerime()`). */
const IA_V = 3;

/* Les niveaux de jeu qu'un lot peut choisir, du plus rapide au plus fort. */
const NIVEAUX_IA = ['rapide', 'moyen', 'fort'];

/* Un joueur automatique du niveau dit : le rapide calcule son combat, les
   autres essaient leurs coups sur une copie de la partie
   (js/iaRecherche.js). */
function agentNiveau(niveau, graine, siege) {
  return niveau === 'rapide' || !RECHERCHE_IA[niveau] ? agentIA(graine, siege) : agentRecherche(graine, siege, niveau);
}

function agentIA(graine, siege) {
  const ag = {humain: false, siege, flux: etatHasard(brasse(graine, siege + 101)), activations: new Map()};
  ag.repond = (P, q) => {
    switch (q.q) {
      case 'priorite': return iaPriorite(P, q, ag);
      case 'mulligan': return iaMulligan(P, q, ag);
      case 'dessous': case 'defausse': case 'cartes': case 'sacrifice': return iaCartes(P, q);
      case 'scrute': return iaScrute(P, q);
      case 'cibles': return iaCibles(P, q);
      case 'oui': return iaOui(P, q);
      case 'modes': return iaModes(P, q);
      case 'x': return q.options.length - 1;
      case 'attaquants': return iaAttaquants(P, q);
      case 'bloqueurs': return iaBloqueurs(P, q);
    }
    return q.defaut;
  };
  return ag;
}
