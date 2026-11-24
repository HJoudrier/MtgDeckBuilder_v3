/* =====================================================================
   js/forgeDefausseDessus.js — « Vous pouvez la remettre sur votre bibliothèque »

   Lot F99. Nephalia Academy : « si un sort ou une capacité d'un adversaire
   vous fait défausser une carte, vous pouvez la révéler et la mettre sur
   votre bibliothèque au lieu de la mettre ailleurs ». Un remplacement
   `Event$ Moved | Discard$ True | ValidCause$ SpellAbility.OppCtrl`.

   Le moteur défausse sans pouvoir s'arrêter pour une question : la carte
   va au cimetière, puis un déclencheur en attente demande au joueur s'il la
   remet sur sa bibliothèque. Le résultat est le même ; seuls les
   déclencheurs de défausse ont eu le temps de voir la carte.
   ===================================================================== */

/* Qui résout en ce moment : la cause d'une défausse. */
resoudre = (g => function* (P, item) {
  const avant = P.causeCtrl;
  P.causeCtrl = item.ctrl;
  try { return yield* g(P, item); } finally { P.causeCtrl = avant; }
})(resoudre);

formeRemplacement = (g => function (face, r) {
  const b = g(face, r);
  if (b || r.Event !== 'Moved' || r.Discard !== 'True' || r.ValidCause !== 'SpellAbility.OppCtrl' || r.ValidCard !== 'Card.YouCtrl' || r.Optional !== 'True' ||
    r.EffectOnly !== 'True' || !r.ReplaceWith) return b;
  const w = forgeSousCapacite(face, r.ReplaceWith), d = w && w.SubAbility && forgeSousCapacite(face, w.SubAbility);
  return w && forgeApi(w) === 'Reveal' && w.RevealDefined === 'ReplacedCard' && d && forgeApi(d) === 'ChangeZone' && d.Defined === 'ReplacedCard' &&
    d.Destination === 'Library' && !d.SubAbility ? 'defausseDessus' : b;
})(formeRemplacement);

const CAP_DEFAUSSE_DESSUS = {genre: 'declenchee', texte: 'Nephalia Academy', effet: {ops: [{op: 'defausseDessus', hostile: false}], cibles: [], modes: null}};

OPS.defausseDessus = function* (P, op, ctx) {
  const o = obj(P, (ctx.evt || {}).carte);
  if (!o || o.zone !== 'cimetiere') return;
  const r = yield question(P, ctx.ctrl, 'oui', ['non', 'oui'], {texte: `Révéler ${o.def.nom} et le remettre sur votre bibliothèque ?`, source: ctx.source});
  if (r === 1) { deplace(P, o.id, 'dessus'); jn(P, `${P.joueurs[ctx.ctrl].nom} remet ${o.def.nom} sur sa bibliothèque`); }
};

defausseCarte = (g => function (P, id, j) {
  const n = g(P, id, j);
  if (n == null || P.causeCtrl == null || P.causeCtrl === j) return n;
  const x = remplacementsEnJeu(P).find(({src, r}) => r.forme === 'defausseDessus' && src.ctrl === j);
  if (x) P.enAttente.push({src: x.src.id, ctrl: j, cap: CAP_DEFAUSSE_DESSUS, evt: {t: 'defausse', joueur: j, carte: n}});
  return n;
})(defausseCarte);

forgeSait('param', 'Moved.EffectOnly', 'Moved.Discard', 'Moved.Optional', 'Reveal.RevealDefined');
