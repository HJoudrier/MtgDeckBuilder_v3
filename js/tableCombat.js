/* =====================================================================
   js/tableCombat.js — Attaquer et bloquer, au doigt

   Attaquer : toucher ses créatures, chacune part vers l'adversaire choisi
   au-dessus. Bloquer : toucher un de ses bloqueurs, puis l'attaquant qu'il
   bloque — seuls les attaquants qu'il peut légalement bloquer s'allument
   (vol, portée, imblocable : `peutBloquer()`, calculé par l'hôte). Une menace
   bloquée par une seule créature est signalée avant qu'on valide, sans quoi
   le moteur effacerait ce blocage en silence.
   ===================================================================== */

function etatCombat(q, s, id) {
  if (q.q === 'attaquants') {
    const i = q.options.findIndex(o => o.id === id);
    return i < 0 ? '' : s.paires.has(i) ? 'choisi' : 'choix';
  }
  const bi = q.options.findIndex(o => o.id === id);
  if (bi >= 0) return s.paires.has(bi) || s.courant === bi ? 'choisi' : 'choix';
  const ai = q.attaquants.findIndex(a => a.id === id);
  if (ai < 0) return '';
  return s.courant != null && q.options[s.courant].legaux.includes(ai) ? 'choix' : 'vise';
}

/* Un toucher pendant un combat. Rend vrai s'il a servi. */
function clicCombat(q, s, id) {
  if (q.q === 'attaquants') {
    const i = q.options.findIndex(o => o.id === id);
    if (i < 0) return false;
    if (s.paires.has(i)) s.paires.delete(i); else s.paires.set(i, s.def);
    return true;
  }
  const bi = q.options.findIndex(o => o.id === id);
  if (bi >= 0) {
    if (s.paires.has(bi)) { s.paires.delete(bi); s.courant = null; } else s.courant = s.courant === bi ? null : bi;
    return true;
  }
  const ai = q.attaquants.findIndex(a => a.id === id);
  if (ai >= 0 && s.courant != null && q.options[s.courant].legaux.includes(ai)) {
    s.paires.set(s.courant, ai);
    s.courant = null;
    return true;
  }
  return false;
}

function combatHTML(q, s, v) {
  if (q.q === 'attaquants') {
    const defs = q.defenseurs;
    return `<div class="small"><b>Attaquer</b> — touchez les créatures qui attaquent</div>
      ${defs.length > 1 ? `<div class="tb-actions">${defs.map((d, i) => `<button type="button" class="btn sm"
        aria-pressed="${s.def === i}" data-act="tDef" data-i="${i}">vers ${esc(d.label)}</button>`).join('')}</div>` : ''}
      <div class="small">${[...s.paires].map(([i, d]) => `${esc(q.options[i].label)} → ${esc(defs[d].label)}`).join(' · ') || 'aucune attaque'}</div>
      <div class="row"><button type="button" class="btn sm" data-act="tAttTous">Toutes</button>
        <button type="button" class="btn sm" data-act="tAttAucun">Aucune</button>
        <button type="button" class="btn pri" data-act="tValider">${s.paires.size ? 'Attaquer' : 'Ne pas attaquer'}</button></div>`;
  }
  const seules = new Map();
  [...s.paires].forEach(([, a]) => seules.set(a, (seules.get(a) || 0) + 1));
  const menaces = [...seules].filter(([a, n]) => n === 1 && q.attaquants[a].menace).map(([a]) => q.attaquants[a].label);
  return `<div class="small"><b>Bloquer</b> — touchez un bloqueur, puis l'attaquant qu'il bloque</div>
    <div class="tb-actions">${[...s.paires].map(([b, a]) => `<button type="button" class="btn sm" data-act="tRetirePaire" data-i="${b}"
      title="Annuler ce blocage">${esc(q.options[b].label)} bloque ${esc(q.attaquants[a].label)} ✕</button>`).join('')}</div>
    ${s.courant != null ? `<div class="small">${esc(q.options[s.courant].label)} bloque… (touchez un attaquant)</div>` : ''}
    ${menaces.length ? `<div class="small tb-erreur">Menace : ${esc(menaces.join(', '))} doit être bloqué par au moins deux créatures.</div>` : ''}
    <div class="row"><button type="button" class="btn pri" data-act="tValider">${s.paires.size ? 'Bloquer' : 'Ne pas bloquer'}</button></div>`;
}

function attaqueTous() {
  const q = TABLE.question, s = selDe(q);
  q.options.forEach((_, i) => s.paires.set(i, s.def));
  renduTable();
}
