/* =====================================================================
   js/tableRessenti.js — Ce qu'on entend et ce qu'on sent, d'une vue à la
   suivante

   Les sons, les vibrations et les points de vie qui jaillissent ne
   viennent pas du moteur : ils se lisent dans la différence entre la vue
   peinte et la nouvelle. Une carte de plus sur la pile, une de moins sur
   le champ, des points de vie en moins. Ainsi l'invité les a comme
   l'hôte, sans que rien d'autre ne voyage que la vue.
   ===================================================================== */

/* Comparer deux vues du même joueur, et dire ce qui a changé. Ce que les
   coups montrent (js/tableCoups.js) — un joueur frappé, une créature
   achevée — se fait entendre au choc, pas ici. */
function ressens(avant, apres, coups) {
  if (!avant || !apres || avant === apres || avant.moi !== apres.moi || avant.joueurs.length !== apres.joueurs.length) return;
  questionRessentie(apres);
  const moi = apres.moi;
  if (apres.actif !== avant.actif && apres.actif === moi) { sonTable('tour'); vibreTable('tour'); }
  const pileAvant = new Set(avant.pile.map(x => x.id));
  if (apres.pile.some(x => !pileAvant.has(x.id))) sonTable('lance');
  else if (apres.pile.length < avant.pile.length) sonTable('resout');
  const champAvant = new Map(avant.champ.map(o => [o.id, o])), champApres = new Set(apres.champ.map(o => o.id));
  const poses = apres.champ.filter(o => !champAvant.has(o.id));
  if (poses.length) { sonTable('pose'); if (poses.some(o => o.ctrl === moi)) vibreTable('pose'); }
  const morts = avant.champ.filter(o => !champApres.has(o.id) && o.types && o.types.includes('creature') && !(coups && coups.retenus.has(String(o.id))));
  if (morts.length) { sonTable('mort'); if (morts.some(o => o.ctrl === moi)) vibreTable('mort'); }
  const attaquants = apres.champ.filter(o => o.attaque && !(champAvant.get(o.id) || {}).attaque);
  if (attaquants.length) {
    sonTable('attaque');
    if (attaquants.some(o => o.attaque.j === moi)) vibreTable('alerte');
  }
  apres.joueurs.forEach((J, i) => {
    const d = J.vie - avant.joueurs[i].vie;
    if (!d || (coups && coups.joueurs.has(i))) return;
    jaillitVie(i, d);
    if (i === moi && d < 0) { sonTable('blesse'); vibreTable('blesse'); ebranle(d <= -3); }
  });
  if (apres.fin && !avant.fin) { sonTable(apres.fin.gagnant === moi ? 'victoire' : 'defaite'); vibreTable('victoire'); }
}

/* Une question qui arrive : la clochette et le double coup, quand quelque
   chose l'a provoquée — un objet sur la pile, un combat, la main de
   départ. Une simple priorité de phase principale ne sonne pas. */
function questionRessentie(v) {
  const q = TABLE.question;
  if (!q || TABLE.questionSentie === q.n) return;
  TABLE.questionSentie = q.n;
  if ((q.q === 'priorite' && v.pile.length) || /^(attaquants|bloqueurs|mulligan)$/.test(q.q)) { sonTable('prio'); vibreTable('prio'); }
}

/* Les points de vie gagnés ou perdus jaillissent du cartouche du joueur. */
function jaillitVie(j, d) {
  const calque = document.querySelector('#table .tmv');
  const vie = [...document.querySelectorAll(`#table [data-ancre-j="${j}"] .tj-vie`)].find(x => x.getBoundingClientRect().width);
  if (!calque || !vie || !mouvementsActifs()) return;
  const r = vie.getBoundingClientRect(), n = document.createElement('span');
  n.className = 'tmv-vie' + (d > 0 ? ' gain' : '');
  n.textContent = (d > 0 ? '+' : '−') + Math.abs(d);
  Object.assign(n.style, {left: r.left + r.width / 2 + 'px', top: r.top + r.height / 2 + 'px'});
  calque.appendChild(n);
  n.animate([{transform: 'translate(-50%,-50%) scale(.5)', opacity: 0}, {transform: 'translate(-50%,-90%) scale(1.2)', opacity: 1, offset: .22},
    {transform: 'translate(-50%,-180%) scale(1)', opacity: 0}], {duration: 1150, easing: 'ease-out'}).onfinish = () => n.remove();
  vie.animate([{transform: 'scale(1)'}, {transform: 'scale(1.35)'}, {transform: 'scale(1)'}], {duration: 420});
}
