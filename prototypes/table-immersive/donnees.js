/* =====================================================================
   donnees.js — Les cartes de la maquette, et la donne de départ

   Des cartes inventées, peu nombreuses, choisies pour que chaque moment
   qui compte arrive en un tour : un terrain à poser, une créature qui
   passe par la pile, un sort qui cible, une attaque, une réponse de
   l'adversaire à laquelle on peut répondre. Leur visuel est un cadre aux
   couleurs du coût et un pictogramme : à l'atelier, l'image de Scryfall
   prendrait sa place.
   ===================================================================== */

/* Les pictogrammes des cartes, dessinés sur une grille de 24. */
const GLYPHES = {
  arbre: '<path d="M12 2 5 13h4l-3 5h12l-3-5h4z"/><path d="M11 18h2v4h-2z"/>',
  montagne: '<path d="M1 20 8.5 6l4.5 7.5 3-4.5L23 20z"/>',
  vague: '<path d="M2 13c2.5-3 5-3 7.5 0s5 3 7.5 0c1.5-1.8 3-2.2 5-1.5V20H2z"/><path d="M2 8c2.5-2 5-2 7.5 0s5 2 7.5 0c1.5-1.2 3-1.4 5-1v2c-2-.5-3.4 0-5 1.1-2.5 1.8-5 1.8-7.5 0S4.5 8.2 2 10z"/>',
  goutte: '<path d="M12 2c3.5 5.5 6.5 9 6.5 12.5a6.5 6.5 0 0 1-13 0C5.5 11 8.5 7.5 12 2z"/>',
  patte: '<circle cx="6.5" cy="9" r="2.2"/><circle cx="12" cy="6.5" r="2.2"/><circle cx="17.5" cy="9" r="2.2"/><path d="M12 11c-3.6 0-6.5 3.2-6.5 6 0 2.2 2.4 3 6.5 3s6.5-.8 6.5-3c0-2.8-2.9-6-6.5-6z"/>',
  flamme: '<path d="M12 2c1.2 4.2 6.5 6.4 6.5 12.5a6.5 6.5 0 0 1-13 0c0-3.4 2-5.6 3.3-7.6.2 2.2 1.2 3.4 2.4 3.6-.3-3.3-.6-5.6.8-8.5z"/>',
  eclair: '<path d="M13.5 2 4 14h7l-1.5 8L20 10h-7z"/>',
  feuille: '<path d="M4 20C4 9.5 10.5 4 21 3.5 20.5 14 15 20 4 20z"/>',
  defense: '<path d="M4 19c0-7.5 4-12.5 9.5-15-2.2 4-2.2 8.2 0 11.2 2 2.8 5 2.9 7 1.1-1.2 4-5 5.7-9 5.7-3.2 0-7.5-1-7.5-3z"/>',
  bouclier: '<path d="M12 2 4 5.2v6.3c0 5 3.4 9 8 10.5 4.6-1.5 8-5.5 8-10.5V5.2z"/>',
  aile: '<path d="M2 17c5.5-.5 9-3.6 10-9 1 5.4 4.5 8.5 10 9-5 1.6-8 .8-10-1.4C10 17.8 7 18.6 2 17z"/>',
  croc: '<path d="M4 4h16l-3 4-2 9-3-7-3 7-2-9z"/>'
};

const CARTES = {
  foret: {nom: 'Forêt', type: 'Terrain de base — Forêt', terrain: true, mana: 'G', glyphe: 'arbre', texte: '{T} : ajoutez un mana vert.'},
  montagne: {nom: 'Montagne', type: 'Terrain de base — Montagne', terrain: true, mana: 'R', glyphe: 'montagne', texte: '{T} : ajoutez un mana rouge.'},
  ile: {nom: 'Île', type: 'Terrain de base — Île', terrain: true, mana: 'U', glyphe: 'vague', texte: '{T} : ajoutez un mana bleu.'},
  marais: {nom: 'Marais', type: 'Terrain de base — Marais', terrain: true, mana: 'B', glyphe: 'goutte', texte: '{T} : ajoutez un mana noir.'},
  ourse: {nom: 'Ourse des taillis', cout: '1G', type: 'Créature — Ours', f: 2, e: 2, glyphe: 'patte',
    texte: '', saveur: 'Elle ne demande rien, sinon qu\'on la laisse en paix.'},
  loup: {nom: 'Loup des cendres', cout: '2R', type: 'Créature — Loup élémental', f: 3, e: 2, celerite: true, glyphe: 'flamme',
    texte: 'Célérité (cette créature peut attaquer dès le tour où elle arrive).'},
  mastodonte: {nom: 'Mastodonte des fougères', cout: '3G', type: 'Créature — Éléphant', f: 4, e: 5, glyphe: 'defense',
    texte: '', saveur: 'La forêt recule devant lui, puis repousse derrière.'},
  eclair: {nom: 'Éclair de forge', cout: 'R', type: 'Éphémère', instant: true, cible: 'tout', degats: 3, glyphe: 'eclair',
    texte: 'L\'Éclair de forge inflige 3 blessures à n\'importe quelle cible.'},
  croissance: {nom: 'Croissance sauvage', cout: 'G', type: 'Éphémère', instant: true, cible: 'creature', bonus: [3, 3], glyphe: 'feuille',
    texte: 'La créature ciblée gagne +3/+3 jusqu\'à la fin du tour.'},
  sentinelle: {nom: 'Sentinelle de corail', cout: '1U', type: 'Créature — Triton soldat', f: 1, e: 3, glyphe: 'bouclier',
    texte: '', saveur: 'Elle ne bouge pas. C\'est tout son art.'},
  drake: {nom: 'Drake des brumes', cout: '2U', type: 'Créature — Drake', f: 2, e: 2, vol: true, glyphe: 'aile', texte: 'Vol.'},
  meduse: {nom: 'Méduse des récifs', cout: '2U', type: 'Créature — Méduse', f: 1, e: 4, glyphe: 'vague', texte: ''},
  morsure: {nom: 'Morsure de l\'ombre', cout: '1B', type: 'Éphémère', instant: true, cible: 'creature', bonus: [-2, -2], glyphe: 'croc',
    texte: 'La créature ciblée gagne −2/−2 jusqu\'à la fin du tour.'}
};

/* La partie commence au troisième tour, chez soi : il y a déjà de quoi
   faire, et Mirela garde de quoi répondre. */
const DONNE = {
  moi: {nom: 'Vous', vie: 18, champ: ['foret', 'foret', 'montagne', 'montagne', 'ourse'], main: ['montagne', 'loup', 'eclair', 'croissance'],
    bib: ['mastodonte', 'foret', 'ourse', 'eclair', 'montagne', 'loup', 'croissance', 'foret', 'mastodonte', 'montagne', 'ourse', 'eclair']},
  adv: {nom: 'Mirela', vie: 17, champ: ['ile', 'ile', 'marais', 'sentinelle', 'drake'], main: ['morsure', 'ile', 'meduse', 'marais', 'sentinelle'],
    bib: ['ile', 'drake', 'marais', 'meduse', 'ile', 'morsure', 'sentinelle', 'ile', 'drake', 'marais', 'meduse', 'ile']}
};
