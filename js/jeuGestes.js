/* =====================================================================
   js/jeuGestes.js — Les gestes qui font un évènement : engager, dégager,
   poser des marqueurs, cibler

   « Whenever ~ becomes tapped », « whenever one or more +1/+1 counters are
   put on », « whenever ~ becomes the target », « whenever you commit a
   crime »… Un déclencheur ne voit que les évènements émis (`emet()`). Ces
   gestes passent donc par une porte qui émet, au lieu d'écrire le champ de
   l'objet là où ils se font.
   ===================================================================== */

/* Engager un permanent : pour du mana, pour attaquer, ou autrement. */
function engageObjet(P, o, pourMana, attaque) {
  if (!o || o.engage) return;
  o.engage = true; P.ver++;
  emet(P, {t: 'engage', id: o.id, mana: !!pourMana, attaque: !!attaque, ctrl: o.ctrl, joueur: o.ctrl});
}

function degageObjet(P, o) {
  if (!o || !o.engage) return;
  o.engage = false; P.ver++;
  emet(P, {t: 'degage', id: o.id});
}

/* Poser des marqueurs sur un permanent. Entrer avec des marqueurs compte
   aussi (règle 122.6). Rend le nombre posé. */
function poseMarqueurs(P, o, genre, n, src) {
  if (!o || n <= 0) return 0;
  o.marq[genre] = (o.marq[genre] || 0) + n; P.ver++;
  emet(P, {t: 'marqueur', id: o.id, genre, n, source: src ? src.id : null});
  return n;
}

/* Les cibles d'un sort ou d'une capacité qui vient de monter sur la pile :
   un évènement par cible, et un crime si l'une est un adversaire, ou à un
   adversaire (règle 700.13). */
function emetCibles(P, j, src, effets) {
  const vues = new Set();
  let crime = false;
  for (const ef of effets || []) for (const cs of ef.cibles || []) for (const c of cs) {
    const x = typeof c === 'object' ? c : obj(P, c);
    if (!x) continue;
    const cle = x.j != null ? 'j' + x.j : x.id;
    if (vues.has(cle)) continue;
    vues.add(cle);
    emet(P, {t: 'cible', id: x.j != null ? null : x.id, joueur: x.j, source: src ? src.id : null, lanceur: j, sort: !!(src && src.zone === 'pile')});
    const qui = x.j != null ? x.j : (x.zone === 'champ' || x.zone === 'pile' ? x.ctrl : x.prop);
    if (qui != null && qui !== j) crime = true;
  }
  if (crime) emet(P, {t: 'crime', joueur: j});
}
