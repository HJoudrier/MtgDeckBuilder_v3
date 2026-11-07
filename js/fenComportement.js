/* =====================================================================
   js/fenComportement.js — Décrire à la main ce que fait une carte

   Quand le compilateur ne comprend pas une carte, on la réécrit avec des
   formules qu'il comprend — « When ~ enters, draw two cards. » —, sans
   syntaxe nouvelle à apprendre : c'est le même compilateur, et la fenêtre
   dit ligne par ligne, pendant la frappe, ce qu'il en lit. Deux directives
   s'y ajoutent : `#vanille` (la carte n'est qu'un corps) et `#injouable`.
   Rien n'agit avant « Appliquer ».
   ===================================================================== */

const ETATS_LIGNE = {compris: 'comprise', partiel: 'en partie', ignore: 'ignorée'};

/* Les formules admises, tirées des exemples mêmes des tables de motifs : la
   liste ne peut pas mentir sur ce que le compilateur sait lire. */
function aideFormules() {
  const groupe = (titre, ex) => `<div><b>${esc(titre)}</b><ul class="sim-aide">${ex.map(x => `<li class="mono">${esc(x)}</li>`).join('')}</ul></div>`;
  return `<details><summary class="small">Les formules que le moteur comprend</summary><div class="sim-grille">
    ${groupe('Effets', EFFETS_ORACLE.map(m => m.ex.replace(/^./, c => c.toUpperCase())))}
    ${groupe('Déclencheurs', DECLENCHEURS_ORACLE.map(d => d.ex))}
    ${groupe('Statiques', STATIQUES_ORACLE.map(s => s.ex))}
    ${groupe('Mots-clés', Object.keys(MOTS_ANGLAIS).concat(['ward {2}', 'protection from red', 'equip {2}', 'kicker {1}{R}', 'flashback {2}{R}']))}
    ${groupe('Directives', ['#vanille — un corps sans capacité', '#injouable — jamais lancée'])}
  </div><div class="small muted">« ~ » désigne la carte elle-même ; une capacité activée s'écrit « coût: effet », par exemple « {T}: Add {G}. ».</div></details>`;
}

/* La lecture d'un texte, ligne par ligne. */
function lectureHTML(fiche, texte) {
  const def = compileDefinition(fiche, texte);
  const c = def.couverture;
  return `<div class="small" style="margin-bottom:4px">Lecture : <span class="sim-etat ${c.etat}">${c.etat}</span> ${badgeCouverture(c.taux)}</div>
    ${c.lignes.map(l => `<div class="sim-ligne-lue"><span class="sim-etat ${l.etat}">${ETATS_LIGNE[l.etat] || l.etat}</span>
      <span class="mono small">${esc(l.texte)}</span>${l.etat !== 'compris' && l.rates.length ? `<div class="small muted">non lu : ${esc(l.rates.join(' · '))}</div>` : ''}</div>`).join('')
      || '<div class="small muted">Aucune capacité.</div>'}`;
}

let FICHE_COMPORTEMENT = null;

function ouvreComportement(nom) {
  const f = ficheParNom(nom);
  if (!f) { toast('Carte inconnue : relancez la simulation pour la faire venir de Scryfall.'); return; }
  FICHE_COMPORTEMENT = f;
  const actuel = S.comportements[f.nom] || '';
  openDialog('Comportement : ' + f.nom, `
    <div class="small muted" style="margin-bottom:6px">${esc(f.type)} ${f.cout ? '· ' + esc(f.cout) : ''}</div>
    <div class="sim-grille">
      <div><h4>Texte oracle</h4>${lectureHTML(f, undefined)}</div>
      <div><h4>Comportement écrit à la main</h4>
        <textarea id="compTexte" data-comportement rows="8" class="sim-texte" placeholder="When ~ enters, draw two cards.">${esc(actuel || String(f.texte || '').replace(/ \/\/ /g, '\n'))}</textarea>
        <div id="compApercu" style="margin-top:6px"></div></div>
    </div>
    ${aideFormules()}`,
    `${actuel ? `<button type="button" class="btn" data-act="simCompEfface" data-carte="${esc(f.nom)}">Revenir à l'oracle</button>` : ''}
     <button type="button" class="btn" data-act="closeDialog">Annuler</button>
     <button type="button" class="btn pri" data-act="simCompAppliquer" data-carte="${esc(f.nom)}">Appliquer</button>`, true);
  majApercuComportement();
}

function majApercuComportement() {
  const t = document.getElementById('compTexte'), z = document.getElementById('compApercu');
  if (t && z && FICHE_COMPORTEMENT) z.innerHTML = lectureHTML(FICHE_COMPORTEMENT, t.value);
}

function appliqueComportement(nom) {
  const t = document.getElementById('compTexte');
  if (!t) return;
  const v = t.value.trim();
  if (v) S.comportements[nom] = v; else delete S.comportements[nom];
  closeDialog();
  COUV_TABLE.cle = null;
  scheduleSave();
  renderK();
  toast(v ? `Comportement de « ${nom} » enregistré.` : `« ${nom} » revient à son texte oracle.`);
}

function effaceComportement(nom) {
  delete S.comportements[nom];
  closeDialog();
  COUV_TABLE.cle = null;
  scheduleSave();
  renderK();
  toast(`« ${nom} » revient à son texte oracle.`);
}
