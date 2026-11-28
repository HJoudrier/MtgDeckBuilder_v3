/* =====================================================================
   js/anaCombos.js — Les combos infinis à deux cartes les plus connus

   Les paliers du Commander tiennent compte des combos à deux cartes : aucun aux
   paliers 1 et 2, aucun qui gagne tôt au palier 3. Les reconnaître dans le
   texte demanderait de comprendre une boucle ; on s'en tient à une liste, celle
   des paires que chaque table connaît — Commander Spellbook en recense des
   milliers, ces quelques dizaines suffisent à dire qu'un deck en porte un.

   Chaque paire porte ce qu'elle fait, en quelques mots. Un combo absent de la
   liste n'est pas déclaré absent du deck : l'analyse dit « reconnus ».
   ===================================================================== */

const COMBOS_DEUX_CARTES = [
  ["Thassa's Oracle", 'Demonic Consultation', 'victoire immédiate'],
  ["Thassa's Oracle", 'Tainted Pact', 'victoire immédiate'],
  ['Laboratory Maniac', 'Demonic Consultation', 'victoire immédiate'],
  ['Jace, Wielder of Mysteries', 'Demonic Consultation', 'victoire immédiate'],
  ['Isochron Scepter', 'Dramatic Reversal', 'mana infini (avec des pierres de mana)'],
  ['Kiki-Jiki, Mirror Breaker', 'Zealous Conscripts', 'créatures à célérité infinies'],
  ['Kiki-Jiki, Mirror Breaker', 'Pestermite', 'créatures à célérité infinies'],
  ['Kiki-Jiki, Mirror Breaker', 'Deceiver Exarch', 'créatures à célérité infinies'],
  ['Kiki-Jiki, Mirror Breaker', 'Restoration Angel', 'créatures à célérité infinies'],
  ['Kiki-Jiki, Mirror Breaker', 'Felidar Guardian', 'créatures à célérité infinies'],
  ['Splinter Twin', 'Pestermite', 'créatures à célérité infinies'],
  ['Splinter Twin', 'Deceiver Exarch', 'créatures à célérité infinies'],
  ['Saheeli Rai', 'Felidar Guardian', 'créatures à célérité infinies'],
  ['Heliod, Sun-Crowned', 'Walking Ballista', 'dégâts infinis'],
  ['Mikaeus, the Unhallowed', 'Triskelion', 'dégâts infinis'],
  ['Exquisite Blood', 'Sanguine Bond', 'perte de vie infinie'],
  ['Exquisite Blood', 'Vito, Thorn of the Dusk Rose', 'perte de vie infinie'],
  ['Exquisite Blood', 'Marauding Blight-Priest', 'perte de vie infinie'],
  ['Niv-Mizzet, Parun', 'Curiosity', 'pioche et dégâts infinis'],
  ['Niv-Mizzet, the Firemind', 'Curiosity', 'pioche et dégâts infinis'],
  ['Niv-Mizzet, Parun', 'Ophidian Eye', 'pioche et dégâts infinis'],
  ['Dualcaster Mage', 'Twinflame', 'créatures à célérité infinies'],
  ['Dualcaster Mage', 'Heat Shimmer', 'créatures à célérité infinies'],
  ['Food Chain', 'Eternal Scourge', 'mana infini pour les créatures'],
  ['Food Chain', 'Misthollow Griffin', 'mana infini pour les créatures'],
  ['Food Chain', 'Squee, the Immortal', 'mana infini pour les créatures'],
  ['Basalt Monolith', 'Rings of Brighthearth', 'mana incolore infini'],
  ['Basalt Monolith', 'Power Artifact', 'mana incolore infini'],
  ['Grim Monolith', 'Power Artifact', 'mana incolore infini'],
  ['Basalt Monolith', 'Kinnan, Bonder Prodigy', 'mana incolore infini'],
  ['Devoted Druid', 'Vizier of Remedies', 'mana vert infini'],
  ['Devoted Druid', 'Swift Reconfiguration', 'mana vert infini'],
  ['Peregrine Drake', 'Deadeye Navigator', 'mana infini'],
  ['Palinchron', 'Deadeye Navigator', 'mana infini'],
  ['Great Whale', 'Deadeye Navigator', 'mana infini'],
  ['Animate Dead', 'Worldgorger Dragon', 'mana et arrivées en jeu infinis'],
  ['Necromancy', 'Worldgorger Dragon', 'mana et arrivées en jeu infinis'],
  ['Dance of the Dead', 'Worldgorger Dragon', 'mana et arrivées en jeu infinis'],
  ['Sword of the Meek', 'Thopter Foundry', 'jetons et vie infinis'],
  ["Painter's Servant", 'Grindstone', 'meule de toute une bibliothèque'],
  ['Bloodchief Ascension', 'Mindcrank', 'meule et perte de vie infinies'],
  ['Duskmantle Guildmage', 'Mindcrank', 'meule et perte de vie infinies'],
  ["Lion's Eye Diamond", 'Auriok Salvagers', 'mana infini'],
  ['Godo, Bandit Warlord', 'Helm of the Host', 'combats supplémentaires infinis'],
  ['Aurelia, the Warleader', 'Helm of the Host', 'combats supplémentaires infinis'],
  ['Pili-Pala', 'Grand Architect', 'mana infini'],
  ['Earthcraft', 'Squirrel Nest', 'jetons infinis'],
  ['Witherbloom Apprentice', 'Chain of Smog', 'perte de vie infinie'],
  ['Scurry Oak', 'Ivy Lane Denizen', 'jetons infinis'],
  ['Selvala, Heart of the Wilds', 'Umbral Mantle', 'mana infini'],
  ['Marwyn, the Nurturer', 'Umbral Mantle', 'mana infini'],
  ['Bloom Tender', 'Freed from the Real', 'mana infini'],
  ['Bloom Tender', "Pemmin's Aura", 'mana infini'],
  ['Helm of Obedience', 'Rest in Peace', 'bibliothèque adverse exilée'],
  ['Helm of Obedience', 'Leyline of the Void', 'bibliothèque adverse exilée'],
  ['Midnight Guard', 'Presence of Gond', 'jetons infinis'],
  ['Retreat to Coralhelm', 'Knight of the Reliquary', 'atterrissages infinis'],
  ['Exquisite Blood', 'Defiant Bloodlord', 'perte de vie infinie']
];

/* Les combos de la liste que le deck porte entièrement, sans doublon : une
   paire écrite deux fois dans la liste ne se compte qu'une fois. Une moitié
   seule ne dit rien — elle se signale ailleurs, dans la fiche, si l'on veut. */
function combosDuDeck(noms) {
  const presents = new Set([...noms].map(n => norm(frontFace(n))));
  const vus = new Set(), out = [];
  COMBOS_DEUX_CARTES.forEach(([a, b, effet]) => {
    if (!presents.has(norm(a)) || !presents.has(norm(b))) return;
    const cle = [norm(a), norm(b)].sort().join('+');
    if (vus.has(cle)) return;
    vus.add(cle);
    const ca = find(a), cb = find(b);
    const cout = (ca ? ca.cmc : 0) + (cb ? cb.cmc : 0);
    out.push({a, b, effet, cout});
  });
  return out.sort((x, y) => x.cout - y.cout);
}
