/* =====================================================================
   js/iaAgent.js — Un joueur automatique

   L'agent répond à chaque question du moteur, sur-le-champ et sans hasard
   propre : deux parties de même graine se jouent coup pour coup pareil, ce
   qui permet de revoir une partie d'un lot en la rejouant. Le flux de
   hasard qu'il porte est semé par la graine et son siège ; il est là pour
   les départages à venir, et ne touche jamais l'ordre des bibliothèques.

   Convention : l'agent ne lit que ce que son joueur peut voir — sa main,
   le champ, les cimetières, les points de vie. La vue filtrée qui
   l'imposera est pour le lot 2.
   ===================================================================== */

function agentIA(graine, siege) {
  const ag = {humain: false, siege, flux: etatHasard(brasse(graine, siege + 101)), activations: new Map()};
  ag.repond = (P, q) => {
    switch (q.q) {
      case 'priorite': return iaPriorite(P, q, ag);
      case 'mulligan': return iaMulligan(P, q);
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
