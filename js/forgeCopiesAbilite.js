/* =====================================================================
   js/forgeCopiesAbilite.js — Copier un sort ou une capacité qu'on vient de payer

   Lot F99. Sunken Palace : « when you spend this mana to cast a spell or
   activate an ability, copy that spell or ability ». Le déclencheur
   `SpellAbilityCast` écoute les deux : un sort lancé, une capacité activée
   (jamais une capacité de mana, qui n'utilise pas la pile). La copie d'un
   sort existe déjà (js/forgeCopies.js) ; celle d'une capacité reprend son
   élément de pile, avec de nouvelles cibles si le texte le permet.
   ===================================================================== */

forgeMode('SpellAbilityCast', ['ValidSA', 'ValidActivatingPlayer'], (P, t, e, s, env) => {
  const sorts = /\bSpell\b/.test(t.ValidSA || 'Spell,Activated'), caps = /\bActivated\b/.test(t.ValidSA || 'Spell,Activated');
  return ((e.t === 'lance' && sorts) || (e.t === 'active' && caps && !e.loyaute)) && joueurOuRien(P, e.joueur, t.ValidActivatingPlayer, s, env);
});

/* « Defined$ TriggeredSpellAbility » : le sort, ou — pour une capacité activée — son élément de pile. */
FORGE_API.CopySpellAbility.gen = (g => function* (P, t, env) {
  const e = (env.ctx || {}).evt || {};
  if (t.Defined !== 'TriggeredSpellAbility' || e.t !== 'active') return yield* g(P, t, env);
  const j = t.Controller ? forgeDefinis(P, t.Controller, env).map(x => joueurDe(x))[0] : env.ctrl;
  const it = [...P.pile].reverse().find(x => x.capacite && x.source === e.id && !x.copie);
  if (j == null || !it) return;
  const src = obj(P, it.source) || it.lki;
  let effets = it.effets.map(ef => ({...ef, cibles: ef.cibles.map(c => c.slice())}));
  /* De nouvelles cibles, emplacement par emplacement : qui garde les mêmes les redit simplement. */
  if (t.MayChooseTarget === 'True' && src) {
    for (const ef of effets) {
      if (!ef.slots || !ef.slots.length) continue;
      const c = yield* choisitCibles(P, j, src, ef.slots, src.lki ? src.couleurs : src.def.couleurs, {});
      if (c) ef.cibles = c;
    }
  }
  P.pile.push({...it, id: P.prochainId++, copie: true, ctrl: j, effets, nom: it.nom + ' (copie)', manaDeSources: null});
  jn(P, `${P.joueurs[j].nom} copie la capacité de ${it.nom}`);
})(FORGE_API.CopySpellAbility.gen);
