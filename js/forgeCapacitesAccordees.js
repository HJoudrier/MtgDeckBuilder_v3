/* =====================================================================
   js/forgeCapacitesAccordees.js — Avoir les capacités des autres

   Lot F95 :
   - `Continuous | GainsAbilitiesOf$ <filtre>` (Marvin, Murderous Mimic ; Necrotic
     Ooze ; Myr Welder ; Steward of the Harvest ; Agatha's Soul Cauldron ;
     Hazel's Brewmaster) : le permanent désigné a toutes les capacités
     activées des permanents ou des cartes que le filtre retient, là où
     `GainsAbilitiesOfZones$` les cherche (le champ, par défaut). Ce ne sont
     pas des copies : la capacité garde son texte, et elle s'exécute avec le
     permanent qui la reçoit pour source — « sacrifice CARDNAME » le
     sacrifie, lui. Seules les capacités activées et de mana se prêtent ; les
     capacités de loyauté, les déclencheurs et les statiques restent à leur
     porteur.
   Lu à la demande de `capacitesDe()`, qui garde sa liste jusqu'au prochain
   changement de la partie.
   ===================================================================== */

forgeSait('param', 'Continuous.GainsAbilitiesOf', 'Continuous.GainsAbilitiesOfZones', 'Continuous.GainsAbilitiesOfDefined', 'Continuous.GainsValidAbilities');

capacitesAccordees = (g => function (P, o) {
  const r = g(P, o);
  if (P._gaV !== P.ver) { P._ga = statiquesMode(P, 'Continuous').filter(x => x.s.t.GainsAbilitiesOf || x.s.t.GainsAbilitiesOfDefined); P._gaV = P.ver; }
  if (!P._ga.length) return r;
  const plus = [];
  for (const {src, s} of P._ga) {
    if (!viseForge(P, src, s, o)) continue;
    const t = s.t, env = envStatique(src, s);
    const zones = String(t.GainsAbilitiesOfZones || 'Battlefield').split(',').map(z => ZONES_FORGE[z.trim()]).filter(Boolean);
    /* Les capacités de loyauté, quand le texte les nomme (`GainsValidAbilities$ Activated.Loyalty`, Nicol Bolas, Kasmina) ; sinon les activées et de mana. */
    const loyaute = /Loyalty/.test(t.GainsValidAbilities || '');
    const genres = loyaute ? ['loyaute'] : ['activee', 'mana'];
    const sources = t.GainsAbilitiesOfDefined ? forgeDefinis(P, t.GainsAbilitiesOfDefined, env).filter(x => x && x.j == null)
      : [].concat(...zones.map(z => objetsZone(P, z))).filter(so => forgeValideObjet(P, so, t.GainsAbilitiesOf, src, src.ctrl, env));
    for (const so of sources) {
      if (so.id === o.id) continue;
      so.def.capacites.forEach(k => {
        if (genres.includes(k.genre) && !k.zone && !plus.includes(k) && !r.includes(k) && !o.def.capacites.includes(k)) plus.push(k);
      });
    }
  }
  return plus.length ? r.concat(plus) : r;
})(capacitesAccordees);
