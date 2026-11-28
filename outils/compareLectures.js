#!/usr/bin/env node
/* =====================================================================
   outils/compareLectures.js — Les deux lectures du graphe, carte par carte

   Le graphe lit une carte dans son texte (js/analyse.js) ou dans son script
   de Forge (js/grapheForge.js). Ce script les confronte sur toutes les cartes
   d'un dépôt de Forge cloné : chaque carte est bâtie comme l'atelier la bâtit
   (`buildCard()`, avec l'oracle que porte son script), lue des deux façons,
   et l'on compte, nœud par nœud, ce que l'une voit et l'autre non — dans les
   déclencheurs, qui disent ce qu'une carte attend, et dans les productions,
   qui disent ce qu'elle fournit. C'est à la fois le banc des tables de Forge
   et la liste des erreurs de la lecture du texte.

   Les sources de l'atelier se chargent dans un `vm` de Node, telles quelles :
   les modules du graphe sont purs.

   Usage : node outils/compareLectures.js <dossier res de Forge> [--sortie=fichier.md]
           [--noms=fichier] [--exemples=8]
   `<dossier res>` contient `cardsfolder/` et `tokenscripts/`
   (forge-gui/res dans le dépôt Card-Forge/forge). `--noms` restreint la
   comparaison aux cartes nommées, une par ligne — une collection exportée.
   ===================================================================== */

import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import {fileURLToPath} from 'node:url';
import {execFileSync} from 'node:child_process';

const RACINE = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const MODULES = ['reglesEffets', 'effets', 'synergies', 'cartesBrutes', 'analyse', 'categories', 'mana', 'cartes',
  'forgeScript', 'grapheForgeQualif', 'grapheForgeTables', 'grapheForgeMotsCles', 'grapheForge'];
const HORS_JEU = /\b(Plane|Phenomenon|Scheme|Vanguard|Conspiracy|Dungeon|Emblem)\b/;

const args = process.argv.slice(2);
const opt = n => (args.find(a => a.startsWith('--' + n + '=')) || '').split('=').slice(1).join('=');
const RES = args.find(a => !a.startsWith('--'));
if (!RES) { console.error('Usage : node outils/compareLectures.js <dossier res de Forge> [--sortie=f.md] [--noms=f]'); process.exit(1); }
const NB_EX = +(opt('exemples') || 8);

/* Les modules du graphe, chargés dans l'ordre de la page. */
function chargeAtelier() {
  const ctx = {console, Math, Date, JSON, Set, Map, Object, Array, String, Number, RegExp};
  vm.createContext(ctx);
  const src = MODULES.map(m => fs.readFileSync(path.join(RACINE, 'js', m + '.js'), 'utf8')).join('\n;\n');
  vm.runInContext(src + '\n;this.API = {buildCard, analyseForge, analyseTexte, lisScriptForge, ficheDeScriptForge, synergyBetween, categories, NODE, CATLABEL};', ctx,
    {filename: 'atelier.js'});
  return ctx.API;
}

function fichiers(dossier) {
  const out = [];
  const pile = [dossier];
  while (pile.length) {
    const d = pile.pop();
    for (const e of fs.readdirSync(d, {withFileTypes: true})) {
      const p = path.join(d, e.name);
      if (e.isDirectory()) pile.push(p);
      else if (e.name.endsWith('.txt')) out.push(p);
    }
  }
  return out.sort();
}

/* Ce qu'une lecture dit d'une carte, réduit à des ensembles comparables. */
function resume(an) {
  return {
    trig: new Set(an.triggers.map(t => t.c)),
    prod: new Set(an.produces.map(p => p.c)),
    arcs: new Set(an.edges.map(e => e.from + '>' + e.to))
  };
}

/* Un ordre stable mais mêlé, pour que les exemples ne soient pas tous en « A ». */
function empreinte(s) {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 16777619);
  return h >>> 0;
}

function main() {
  const A = chargeAtelier();
  const jetons = new Map();
  const dj = path.join(RES, 'tokenscripts');
  if (fs.existsSync(dj)) fichiers(dj).forEach(f => jetons.set(path.basename(f, '.txt'), fs.readFileSync(f, 'utf8')));
  const filtre = opt('noms') ? new Set(fs.readFileSync(opt('noms'), 'utf8').split(/\r?\n/).map(x => x.trim().toLowerCase()).filter(Boolean)) : null;

  const st = {cartes: 0, identiques: 0, arcsIdentiques: 0, erreurs: [], avecRepli: 0, replis: 0,
    inconnus: new Map(), noeuds: new Map(), echantillon: [], roles: new Map()};
  const noeud = n => {
    if (!st.noeuds.has(n)) st.noeuds.set(n, {trigT: [], trigF: [], prodT: [], prodF: [], trigBoth: 0, prodBoth: 0});
    return st.noeuds.get(n);
  };

  for (const f of fichiers(path.join(RES, 'cardsfolder'))) {
    const texte = fs.readFileSync(f, 'utf8');
    let s;
    try { s = A.lisScriptForge(texte); } catch (e) { continue; }
    if (!s.faces.length) continue;
    const fiche = A.ficheDeScriptForge(s);
    if (!fiche.nom || /^A-/.test(fiche.nom) || HORS_JEU.test(fiche.type)) continue;
    if (filtre && !filtre.has(fiche.nom.toLowerCase()) && !filtre.has(fiche.nom.split(' // ')[0].toLowerCase())) continue;
    let card, lt, lf;
    try {
      card = A.buildCard(fiche.nom, fiche.cout || '—', fiche.type, 0, fiche.texte);
      if (fiche.force != null) { card.force = fiche.force; card.endurance = fiche.endurance; }
      lt = A.analyseTexte(card);
      lf = A.analyseForge(card, s, {jeton: n => jetons.get(n) || null});
    } catch (e) {
      st.erreurs.push(fiche.nom + ' : ' + e.message);
      continue;
    }
    if (!lf) continue;
    st.cartes++;
    if (lf.replis) { st.avecRepli++; st.replis += lf.replis; }
    lf.inconnus.forEach(x => {
      if (!st.inconnus.has(x)) st.inconnus.set(x, []);
      const l = st.inconnus.get(x);
      if (!l.includes(fiche.nom)) l.push(fiche.nom);
    });
    const rt = resume(lt), rf = resume(lf);
    let diff = false;
    for (const [cle, a, b, both] of [['trig', rt.trig, rf.trig, 'trigBoth'], ['prod', rt.prod, rf.prod, 'prodBoth']]) {
      new Set([...a, ...b]).forEach(n => {
        const x = noeud(n);
        if (a.has(n) && b.has(n)) x[both]++;
        else { diff = true; x[cle + (a.has(n) ? 'T' : 'F')].push(fiche.nom); }
      });
    }
    if (!diff) st.identiques++;
    /* Les rôles (js/categories.js) se lisent sur l'analyse : ils suivent la lecture. */
    card.an = lt; const ct = A.categories(card);
    card.an = lf; const cf = A.categories(card);
    new Set([...ct, ...cf]).forEach(r => {
      if (!st.roles.has(r)) st.roles.set(r, {deux: 0, T: [], F: []});
      const x = st.roles.get(r);
      if (ct.has(r) && cf.has(r)) x.deux++; else x[ct.has(r) ? 'T' : 'F'].push(fiche.nom);
    });
    if (!card.isLand && empreinte(fiche.nom) % 80 === 0) st.echantillon.push({nom: fiche.nom, lt, lf});
    if (rt.arcs.size === rf.arcs.size && [...rt.arcs].every(a => rf.arcs.has(a))) st.arcsIdentiques++;
  }
  st.paires = paires(A, st.echantillon);
  return {st, A};
}

/* Les liens que le graphe tracerait entre les cartes d'un échantillon, prises
   deux à deux, d'après chaque lecture : c'est ce que voit le lecteur, plus que
   les nœuds d'une carte seule. */
function paires(A, ech) {
  const r = {cartes: ech.length, paires: 0, communes: 0, texteSeul: 0, forgeSeul: 0, liensT: 0, liensF: 0, exT: [], exF: [],
    parT: new Map(), parF: new Map()};
  const compte = (m, k) => m.set(k.split('|')[0], (m.get(k.split('|')[0]) || 0) + 1);
  const cle = l => l.concept + '|' + l.dir;
  for (let i = 0; i < ech.length; i++) for (let j = i + 1; j < ech.length; j++) {
    const a = ech[i], b = ech[j];
    const lt = A.synergyBetween({name: a.nom, an: a.lt}, {name: b.nom, an: b.lt}).map(cle);
    const lf = A.synergyBetween({name: a.nom, an: a.lf}, {name: b.nom, an: b.lf}).map(cle);
    if (!lt.length && !lf.length) continue;
    r.paires++; r.liensT += lt.length; r.liensF += lf.length;
    const ft = new Set(lf), tt = new Set(lt);
    if (lt.length && lf.length && lt.some(k => ft.has(k))) r.communes++;
    else if (lt.length && !lf.length) r.texteSeul++;
    else if (lf.length && !lt.length) r.forgeSeul++;
    const sens = (k, x, y) => { const [c, d] = k.split('|'); return (d === 'ab' ? x + ' → ' + y : y + ' → ' + x) + ' (' + c + ')'; };
    lt.filter(k => !ft.has(k)).forEach(k => { r.exT.push(sens(k, a.nom, b.nom)); compte(r.parT, k); });
    lf.filter(k => !tt.has(k)).forEach(k => { r.exF.push(sens(k, a.nom, b.nom)); compte(r.parF, k); });
  }
  return r;
}

const pct = (a, b) => b ? (100 * a / b).toFixed(1).replace('.', ',') + ' %' : '—';
const nb = n => n.toLocaleString('fr-FR');
const ex = l => [...l].sort((a, b) => empreinte(a) - empreinte(b)).slice(0, NB_EX).join(', ');

function rapport({st, A}) {
  const L = [];
  const date = new Date().toLocaleDateString('fr-FR', {day: 'numeric', month: 'long', year: 'numeric'});
  let commit = '';
  try { commit = execFileSync('git', ['-C', RES, 'rev-parse', '--short=8', 'HEAD'], {encoding: 'utf8'}).trim(); } catch (e) { /* pas un clone */ }
  L.push('# Les deux lectures du graphe', '');
  L.push(`Mesure du ${date}, sur ${nb(st.cartes)} cartes : toutes celles du dossier \`cardsfolder\` de Forge`
    + (commit ? ` (commit \`${commit}\`)` : '') + `, hors plans,`,
    `machinations et cartes Alchemy. Chaque carte est bâtie par \`buildCard()\` avec l'oracle que porte son script, puis lue`,
    `dans ce texte (\`analyseTexte()\`) et dans son script (\`analyseForge()\`). Produit par \`node outils/compareLectures.js\`.`, '');
  L.push('| | cartes | part |', '|---|---|---|');
  L.push(`| mêmes déclencheurs et mêmes productions | ${nb(st.identiques)} | ${pct(st.identiques, st.cartes)} |`);
  L.push(`| mêmes arcs du graphe | ${nb(st.arcsIdentiques)} | ${pct(st.arcsIdentiques, st.cartes)} |`);
  L.push(`| au moins une unité du script relue dans le texte | ${nb(st.avecRepli)} | ${pct(st.avecRepli, st.cartes)} |`);
  if (st.erreurs.length) L.push(`| erreurs de lecture | ${nb(st.erreurs.length)} | ${pct(st.erreurs.length, st.cartes)} |`);
  L.push('');
  const p = st.paires;
  L.push('## Ce que le graphe tracerait', '',
    `Un échantillon de ${nb(p.cartes)} cartes non-terrains (une sur quatre-vingts, d'ordre stable), prises deux à deux :`,
    `les liens que \`synergyBetween()\` trace entre elles d'après chaque lecture.`, '');
  L.push('| | paires |', '|---|---|');
  L.push(`| reliées par l'une ou l'autre lecture | ${nb(p.paires)} |`);
  L.push(`| reliées par les deux, au moins par un même lien | ${nb(p.communes)} |`);
  L.push(`| reliées par le texte seul | ${nb(p.texteSeul)} |`);
  L.push(`| reliées par Forge seul | ${nb(p.forgeSeul)} |`);
  L.push(`| liens, en tout : texte / Forge | ${nb(p.liensT)} / ${nb(p.liensF)} |`, '');
  const parNoeud = m => [...m.entries()].sort((a, b) => b[1] - a[1]).slice(0, 8).map(([k, n]) => `\`${k}\` ${nb(n)}`).join(', ');
  L.push(`Liens du texte seul, par nœud : ${parNoeud(p.parT)}. Par exemple : ${ex(p.exT)}.`, '',
    `Liens de Forge seul, par nœud : ${parNoeud(p.parF)}. Par exemple : ${ex(p.exF)}.`, '');

  L.push('## Les rôles d\'une carte', '', 'Les rôles que l\'onglet Deck compte (`categories()`), tirés de l\'une puis de l\'autre lecture.', '');
  L.push('| Rôle | les deux | texte seul | Forge seul | exemples, texte seul | exemples, Forge seul |', '|---|---|---|---|---|---|');
  [...st.roles.entries()].filter(([r]) => r !== 'creatures' && r !== 'terrains')
    .sort((a, b) => (b[1].T.length + b[1].F.length) - (a[1].T.length + a[1].F.length))
    .forEach(([r, x]) => L.push(`| ${A.CATLABEL[r] || r} | ${nb(x.deux)} | ${nb(x.T.length)} | ${nb(x.F.length)} | ${ex(x.T).split(', ').slice(0, 4).join(', ')} | ${ex(x.F).split(', ').slice(0, 4).join(', ')} |`));
  L.push('');

  const lignes = [...st.noeuds.entries()].map(([n, x]) => ({n, ...x,
    ecarts: x.trigT.length + x.trigF.length + x.prodT.length + x.prodF.length}))
    .filter(x => x.ecarts).sort((a, b) => b.ecarts - a.ecarts);
  const libelle = n => (A.NODE[n] ? A.NODE[n].label : n) + ` (\`${n}\`)`;

  L.push('## Ce qu\'une carte attend : les déclencheurs', '',
    'Un déclencheur est ce qu\'une autre carte peut nourrir. « Texte seul » : la lecture du texte le voit, le script non ;',
    '« Forge seul » : l\'inverse. « Les deux » compte les cartes où elles s\'accordent.', '');
  L.push('| Nœud | les deux | texte seul | Forge seul |', '|---|---|---|---|');
  lignes.filter(x => x.trigT.length + x.trigF.length).sort((a, b) => (b.trigT.length + b.trigF.length) - (a.trigT.length + a.trigF.length))
    .forEach(x => L.push(`| ${libelle(x.n)} | ${nb(x.trigBoth)} | ${nb(x.trigT.length)} | ${nb(x.trigF.length)} |`));
  L.push('', '## Ce qu\'une carte fournit : les productions', '');
  L.push('| Nœud | les deux | texte seul | Forge seul |', '|---|---|---|---|');
  lignes.filter(x => x.prodT.length + x.prodF.length).sort((a, b) => (b.prodT.length + b.prodF.length) - (a.prodT.length + a.prodF.length))
    .forEach(x => L.push(`| ${libelle(x.n)} | ${nb(x.prodBoth)} | ${nb(x.prodT.length)} | ${nb(x.prodF.length)} |`));

  L.push('', '## Exemples, nœud par nœud', '',
    'Quelques cartes de chaque écart, mêlées d\'un ordre stable : c\'est là qu\'on juge laquelle des deux lectures a raison.', '');
  lignes.slice(0, 40).forEach(x => {
    L.push(`### ${libelle(x.n)}`, '');
    [['trigT', 'déclencheur, texte seul'], ['trigF', 'déclencheur, Forge seul'], ['prodT', 'production, texte seul'],
      ['prodF', 'production, Forge seul']].forEach(([k, t]) => { if (x[k].length) L.push(`- ${t} (${nb(x[k].length)}) : ${ex(x[k])}`); });
    L.push('');
  });

  L.push('## Ce que les tables de Forge ne lisent pas encore', '',
    'Une unité qui emploie un de ces éléments est relue dans sa description, par la lecture du texte : la carte ne perd',
    'rien, mais ce morceau-là garde les défauts du texte. Classés par nombre de cartes.', '');
  L.push('| Élément | cartes | exemples |', '|---|---|---|');
  [...st.inconnus.entries()].sort((a, b) => b[1].length - a[1].length).slice(0, 60)
    .forEach(([k, l]) => L.push(`| \`${k}\` | ${nb(l.length)} | ${ex(l).split(', ').slice(0, 4).join(', ')} |`));
  if (st.erreurs.length) L.push('', '## Erreurs', '', ...st.erreurs.slice(0, 30).map(e => '- ' + e));
  return L.join('\n') + '\n';
}

const r = main();
const md = rapport(r);
if (opt('sortie')) { fs.writeFileSync(opt('sortie'), md); console.log(`${r.st.cartes} cartes comparées → ${opt('sortie')}`); }
else process.stdout.write(md);
