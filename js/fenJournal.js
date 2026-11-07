/* =====================================================================
   js/fenJournal.js — Revoir une partie d'un lot

   Une partie d'un lot n'est pas gardée : elle se rejoue depuis sa graine,
   journal ouvert, et se lit tour par tour. C'est la façon de vérifier ce
   que font les joueurs automatiques — et de juger un résultat surprenant.
   ===================================================================== */

function ouvreJournal(idLot, k) {
  const lot = lotParId(idLot);
  if (!lot) return;
  const r = rejouePartie(lot, k);
  if (!r) {
    toast('Rejeu indisponible : le deck, un adversaire, un comportement ou le moteur ont changé depuis ce lot.');
    return;
  }
  const {P, places, noms} = r;
  const f = P.fin || {};
  const issue = f.erreur ? 'erreur : ' + String(f.erreur).split('\n')[0]
    : f.nulle ? `partie nulle (${f.raison})` : `${P.joueurs[f.gagnant].nom} gagne au tour ${f.tour}`;
  const tours = [];
  (P.journal || []).forEach(l => {
    if (!tours.length || /^— Tour/.test(l.txt)) tours.push([]);
    tours[tours.length - 1].push(l);
  });
  openDialog(`Partie ${lot.parties[k][0] + 1}`, `
    <div class="small" style="margin-bottom:6px">Ordre du tour : ${places.map((t, s) => `${s + 1}. <b>${esc(noms[t])}</b>${t === 0 ? ' (testé)' : ''}`).join(' · ')}</div>
    <div class="small" style="margin-bottom:8px"><b>${esc(issue)}</b> — ${P.joueurs.map(J => `${esc(J.nom)} : ${J.elimine ? 'éliminé (' + esc(CAUSES[J.raison] || J.raison) + ')' : J.vie + ' PV'}`).join(' · ')}</div>
    <div class="sim-journal">${tours.map(t => `<div class="sim-journal-tour">${t.map(l => /^— Tour/.test(l.txt)
      ? `<div class="sim-journal-titre">${esc(l.txt)}</div>`
      : `<div class="small"><span class="muted mono">${esc(NOMS_ETAPES[l.e] || l.e || '')}</span> ${esc(l.txt)}</div>`).join('')}</div>`).join('')}</div>`,
    '<button type="button" class="btn" data-act="closeDialog">Fermer</button>', true);
}

const NOMS_ETAPES = {degagement: 'dégagement', entretien: 'entretien', pioche: 'pioche', principale1: 'principale',
  debutCombat: 'début de combat', attaquants: 'attaque', bloqueurs: 'blocage', initiative: 'initiative',
  degats: 'dégâts', finCombat: 'fin de combat', principale2: 'principale 2', fin: 'fin', nettoyage: 'nettoyage'};
