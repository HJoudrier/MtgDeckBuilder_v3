#!/usr/bin/env node
/* =====================================================================
   outils/genAppels.js — Qui appelle qui, et le graphe qui le montre

   `genDoc.js` dit ce que chaque fonction fait ; celui-ci dit à qui elle
   parle. Il relève toutes les fonctions définies dans `js/`, le fichier de
   chacune, et, pour chacune, les fonctions du projet qu'elle appelle. Le
   résultat va dans `doc/appels.md` et `doc/appels.json`, puis dans deux
   graphes Graphviz : celui des fonctions, groupées par fichier, et celui des
   modules, qui agrège les appels fichier par fichier.

   L'atelier n'ayant ni modules ES ni build, tout vit dans la portée globale :
   un appel est donc un simple nom suivi d'une parenthèse, et il suffit de
   savoir lequel des noms rencontrés est l'un des nôtres. Encore faut-il ne
   pas confondre du code avec de la prose : les fichiers sont pleins de
   commentaires français et de littéraux gabarits de cent lignes. D'où la
   passe de blanchiment ci-dessous, qui efface commentaires et textes en
   gardant les interpolations, qui sont bien du code.

   Usage : node outils/genAppels.js [--module=deck.js] [--sans-rendu]
     --module=<nom>  ne garde, dans le graphe des fonctions, que ce module et
                     ses voisins immédiats — le graphe entier tient mal sur
                     une page.
     --seuil=<n>     dans le graphe des modules, ne trace que les liens d'au
                     moins n appels (3 par défaut, 1 pour tout voir) — un module
                     qui n'emprunte qu'`esc()` à un autre ne dit rien de
                     l'architecture, et six cents traits n'en disent pas plus.
                     Le graphe des fonctions, lui, porte toujours tout.
     --sans-rendu    écrit les .dot sans appeler `dot`.
   ===================================================================== */

import fs from 'node:fs';
import path from 'node:path';
import {execFileSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';

const RACINE = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const DOC = path.join(RACINE, 'doc');

/* =====================================================================
   1. Blanchir ce qui n'est pas du code

   Chaque commentaire, chaque texte de chaîne et chaque morceau littéral d'un
   gabarit est remplacé par des espaces — un espace par caractère, les sauts
   de ligne conservés. Les décalages et les numéros de ligne restent donc
   exacts, et les accolades restantes sont toutes de vraies accolades, ce dont
   l'appariement des corps a besoin.

   Les interpolations d'un gabarit gardent leur contenu : un `esc(nom)` écrit
   au milieu d'un gabarit est un appel au même titre qu'ailleurs. Leurs deux
   délimiteurs sont effacés, si bien que l'accolade ouvrante de l'interpolation
   n'ajoute aucun déséquilibre.
   ===================================================================== */

/* Après quoi un « / » ouvre une expression régulière plutôt qu'une division.
   La liste est celle des contextes où une valeur est attendue. */
const AVANT_REGEX = new Set(['', '(', ',', '=', ':', '[', '!', '&', '|', '?', '{', '}', ';', '+', '-', '*', '%', '~', '^', '<', '>']);
const MOTS_AVANT_REGEX = new Set(['return', 'typeof', 'case', 'in', 'of', 'new', 'delete', 'void', 'instanceof', 'do', 'else', 'yield', 'await']);

function regexPossible(src, i, prec) {
  if (AVANT_REGEX.has(prec)) return true;
  /* Un mot-clé précède peut-être : on le relit à rebours. */
  let j = i - 1;
  while (j >= 0 && /\s/.test(src[j])) j--;
  const fin = j + 1;
  while (j >= 0 && /[\w$]/.test(src[j])) j--;
  return MOTS_AVANT_REGEX.has(src.slice(j + 1, fin));
}

function codeSeul(src) {
  const out = Array.from(src);
  const n = src.length;
  const blanc = (a, b) => { for (let k = a; k < b && k < n; k++) if (out[k] !== '\n') out[k] = ' '; };

  const pile = [{etat: 'code', profondeur: 0}];
  let i = 0, prec = '';

  while (i < n) {
    const t = pile[pile.length - 1];
    const c = src[i];

    if (t.etat === 'gabarit') {
      if (c === '\\') { blanc(i, i + 2); i += 2; continue; }
      if (c === '`') { blanc(i, i + 1); pile.pop(); prec = '0'; i++; continue; }
      if (c === '$' && src[i + 1] === '{') {
        blanc(i, i + 2);
        /* prec devient « ( » : l'expression s'ouvre, une regex peut donc la
           commencer. */
        pile.push({etat: 'code', profondeur: 0, interpolation: true});
        prec = '('; i += 2; continue;
      }
      blanc(i, i + 1); i++; continue;
    }

    if (c === '/' && src[i + 1] === '/') {
      let j = src.indexOf('\n', i); if (j < 0) j = n;
      blanc(i, j); i = j; continue;
    }
    if (c === '/' && src[i + 1] === '*') {
      let j = src.indexOf('*/', i + 2); j = j < 0 ? n : j + 2;
      blanc(i, j); i = j; continue;
    }
    if (c === '"' || c === "'") {
      let j = i + 1;
      while (j < n && src[j] !== c && src[j] !== '\n') { if (src[j] === '\\') j++; j++; }
      blanc(i, j + 1); prec = '0'; i = j + 1; continue;
    }
    if (c === '`') { blanc(i, i + 1); pile.push({etat: 'gabarit'}); i++; continue; }
    if (c === '/' && regexPossible(src, i, prec)) {
      let j = i + 1, classe = false;
      while (j < n) {
        const d = src[j];
        if (d === '\\') { j += 2; continue; }
        if (d === '[') classe = true;
        else if (d === ']') classe = false;
        else if (d === '/' && !classe) break;
        else if (d === '\n') break;
        j++;
      }
      while (j + 1 < n && /[a-z]/.test(src[j + 1])) j++;   // les drapeaux
      blanc(i, j + 1); prec = '0'; i = j + 1; continue;
    }
    if (c === '{') { t.profondeur++; prec = '{'; i++; continue; }
    if (c === '}') {
      if (t.interpolation && t.profondeur === 0) { blanc(i, i + 1); pile.pop(); prec = '0'; i++; continue; }
      t.profondeur--; prec = '}'; i++; continue;
    }
    if (!/\s/.test(c)) prec = c;
    i++;
  }
  return out.join('');
}

/* =====================================================================
   2. Les définitions, et l'étendue de chaque corps
   ===================================================================== */

/* L'accolade ouvrante qui suit une signature, puis sa jumelle. Rend les deux
   bornes du corps, accolades comprises. */
function corps(code, depuis) {
  const ouvre = code.indexOf('{', depuis);
  if (ouvre < 0) return null;
  let d = 0;
  for (let i = ouvre; i < code.length; i++) {
    if (code[i] === '{') d++;
    else if (code[i] === '}' && --d === 0) return [ouvre, i + 1];
  }
  return null;
}

/* Les définitions de premier niveau — celles qui commencent en colonne 1 :
   ce sont les seules que les autres modules peuvent appeler, l'atelier
   n'ayant que la portée globale pour se partager quoi que ce soit. */
function definitions(code) {
  const out = [];
  const ligneDe = i => code.slice(0, i).split('\n').length;

  const decl = /^(?:async\s+)?function\s+([A-Za-z_$][\w$]*)\s*\(/gm;
  let m;
  while ((m = decl.exec(code))) {
    /* La liste des paramètres, dont les noms masquent les nôtres. */
    let j = m.index + m[0].length, d = 1;
    while (j < code.length && d > 0) { if (code[j] === '(') d++; else if (code[j] === ')') d--; j++; }
    const c = corps(code, j);
    if (!c) continue;
    out.push({nom: m[1], ligne: ligneDe(m.index), params: code.slice(m.index + m[0].length, j - 1), decl: m.index, debut: c[0], fin: c[1]});
  }
  /* Les fonctions fléchées portées par un `const` global : plus rares ici,
     mais ce sont des fonctions comme les autres. Les parenthèses de la liste
     de paramètres n'en contiennent pas d'autres — sans quoi `const x = (() =>
     …)()`, qui ne rend pas une fonction mais son résultat, passerait pour une. */
  const fleche = /^(?:const|let)\s+([A-Za-z_$][\w$]*)\s*=\s*(?:async\s*)?(\([^()]*\)|[A-Za-z_$][\w$]*)\s*=>\s*\{/gm;
  while ((m = fleche.exec(code))) {
    const c = corps(code, m.index + m[0].length - 1);
    if (!c) continue;
    out.push({nom: m[1], ligne: ligneDe(m.index), params: m[2].replace(/^\(|\)$/g, ''), decl: m.index, debut: c[0], fin: c[1]});
  }
  return out.sort((a, b) => a.debut - b.debut);
}

/* =====================================================================
   3. Les appels

   Trois façons d'en passer un, et trois listes :

   — **direct** : un nom suivi d'une parenthèse, non précédé d'un point — sans
     quoi `x.find(...)` passerait pour notre `find()` ;
   — **différé** : une fonction passée en rappel, `setTimeout(majApercu, 0)` ou
     `.map(annexeListe)`. C'est un appel tout autant, mais plus tard ;
   — **par le HTML produit** : `onerror="ficheImageKO(this)"` écrit dans un
     gabarit. Le blanchiment l'efface, à raison — c'est du texte —, et pourtant
     le navigateur l'appellera. On le relit donc dans la source d'origine.

   Trois pièges, tous vus sur ce projet. Une clé d'objet n'est pas une
   référence : `{deckSize:100}` ne parle pas de `deckSize()`. Un nom lié
   localement masque le nôtre : le paramètre `octets` d'`estGzip(nom, octets)`
   n'est pas la fonction `octets()`. Et le garde `typeof x === 'function'` n'est
   pas un appel : la chaîne a été blanchie, mais le nom reste.
   ===================================================================== */

/* Les noms que la fonction lie chez elle, et qui masquent donc les globaux :
   ses paramètres, ses déclarations, celles de ses fonctions intérieures. */
function nomsLocaux(params, txt) {
  const out = new Set();
  const mots = s => (s.match(/[A-Za-z_$][\w$]*/g) || []).forEach(n => out.add(n));
  mots(params);
  let m;
  const decls = /\b(?:const|let|var)\s+(?:\{([^}]*)\}|\[([^\]]*)\]|([A-Za-z_$][\w$]*))/g;
  while ((m = decls.exec(txt))) mots(m[1] || m[2] || m[3]);
  const internes = /\bfunction\s+([A-Za-z_$][\w$]*)|catch\s*\(([^)]*)\)|\(([^()]*)\)\s*=>|\b([A-Za-z_$][\w$]*)\s*=>/g;
  while ((m = internes.exec(txt))) mots(m[1] || m[2] || m[3] || m[4] || '');
  return out;
}

function appelsDirects(txt, connus, soi, locaux) {
  const vus = new Set();
  const re = /(\.{3}|\.)?\s*\b([A-Za-z_$][\w$]*)\s*\(/g;
  let m;
  while ((m = re.exec(txt))) {
    if (m[1] === '.') continue;               // propriété — mais « ... » est une décomposition
    const nom = m[2];
    if (nom !== soi && connus.has(nom) && !locaux.has(nom)) vus.add(nom);
  }
  return vus;
}

function appelsDifferes(txt, connus, soi, locaux, directs) {
  const vus = new Set();
  const re = /(\.(?!\.\.)|typeof\s+)?\b([A-Za-z_$][\w$]*)\b\s*(\(|:)?/g;
  let m;
  while ((m = re.exec(txt))) {
    const nom = m[2];
    if (m[1] || m[3] === '(') continue;            // propriété, garde `typeof`, ou appel direct
    if (nom === soi || directs.has(nom) || locaux.has(nom) || !connus.has(nom)) continue;
    const avant = txt.slice(Math.max(0, m.index - 12), m.index);
    /* Une déclaration n'est pas une référence, ni une clé d'objet. */
    if (/\b(function|const|let|var|class)\s*$/.test(avant)) continue;
    if (m[3] === ':' && /[{,]\s*$/.test(avant)) continue;
    vus.add(nom);
  }
  return vus;
}

/* Les gestionnaires posés dans le HTML que l'atelier fabrique. Ils se lisent
   dans la source d'origine, la seule où le texte des gabarits subsiste. */
function appelsHtml(brut, connus) {
  const vus = new Set();
  const re = /\bon[a-z]+\s*=\s*"\s*([A-Za-z_$][\w$]*)\s*\(/g;
  let m;
  while ((m = re.exec(brut))) if (connus.has(m[1])) vus.add(m[1]);
  return vus;
}

/* =====================================================================
   4. Relever le projet
   ===================================================================== */

/* L'ordre de chargement fait foi, comme pour l'inventaire : c'est celui où
   les modules se connaissent. */
function ordreModules() {
  const html = fs.readFileSync(path.join(RACINE, 'index.html'), 'utf8');
  return [...html.matchAll(/<script\s+src="js\/([^"?]+)/g)].map(m => m[1]);
}

const fichiers = ordreModules();
const bruts = new Map();
const sources = new Map();
const dfsPar = new Map();
fichiers.forEach(f => {
  const brut = fs.readFileSync(path.join(RACINE, 'js', f), 'utf8');
  bruts.set(f, brut);
  sources.set(f, codeSeul(brut));
  dfsPar.set(f, definitions(sources.get(f)));
});

/* D'abord tous les noms : une fonction ne peut être reconnue comme appelée
   que si l'on sait déjà qu'elle existe. */
const defs = new Map();          // nom -> {nom, fichier, ligne}
const doublons = [];
fichiers.forEach(f => dfsPar.get(f).forEach(d => {
  if (defs.has(d.nom)) doublons.push({nom: d.nom, premier: defs.get(d.nom).fichier, second: f});
  defs.set(d.nom, {nom: d.nom, fichier: f, ligne: d.ligne});
}));
const connus = new Set(defs.keys());

/* Puis les appels, fonction par fonction. Le code de premier niveau — celui
   qui s'exécute au chargement du fichier — est prêté à un appelant fictif,
   « chargement du module », sans quoi ses appels n'auraient aucun auteur. */
const noeuds = new Map();        // clé -> {nom, fichier, appelle, differe, html}
const CHARGEMENT = f => f + ' (chargement)';

fichiers.forEach(f => {
  const code = sources.get(f), brut = bruts.get(f);
  let reste = code, resteBrut = brut;
  dfsPar.get(f).forEach(d => {
    const txt = code.slice(d.debut, d.fin);
    const locaux = nomsLocaux(d.params, txt);
    const directs = appelsDirects(txt, connus, d.nom, locaux);
    const differe = appelsDifferes(txt, connus, d.nom, locaux, directs);
    const html = appelsHtml(brut.slice(d.debut, d.fin), connus);
    noeuds.set(d.nom, {
      nom: d.nom, fichier: f, ligne: d.ligne,
      appelle: directs,
      differe,
      html: new Set([...html].filter(n => n !== d.nom && !directs.has(n) && !differe.has(n)))
    });
    /* Retiré du reste, en-tête comprise : ce qui demeure est le code de premier
       niveau, et il ne doit pas y rester de `function nom` — le nom y passerait
       pour une déclaration locale et masquerait la fonction qu'il désigne. */
    const vide = ' '.repeat(d.fin - d.decl);
    reste = reste.slice(0, d.decl) + vide + reste.slice(d.fin);
    resteBrut = resteBrut.slice(0, d.decl) + vide + resteBrut.slice(d.fin);
  });
  const locaux = nomsLocaux('', reste);
  const directs = appelsDirects(reste, connus, null, locaux);
  const differe = appelsDifferes(reste, connus, null, locaux, directs);
  const html = new Set([...appelsHtml(resteBrut, connus)].filter(n => !directs.has(n) && !differe.has(n)));
  if (directs.size || differe.size || html.size) {
    noeuds.set(CHARGEMENT(f), {nom: 'chargement du module', fichier: f, ligne: 0, chargement: true, appelle: directs, differe, html});
  }
});

const cle = v => v.chargement ? CHARGEMENT(v.fichier) : v.nom;
const sortants = v => [...v.appelle, ...v.differe, ...v.html];

/* Les appelants : l'inverse de la table ci-dessus. */
const appelants = new Map();
noeuds.forEach((v, k) => sortants(v).forEach(cible => {
  if (!appelants.has(cible)) appelants.set(cible, new Set());
  appelants.get(cible).add(k);
}));

/* =====================================================================
   5. Les fichiers de résultat
   ===================================================================== */

const parFichier = new Map(fichiers.map(f => [f, []]));
[...noeuds.values()].sort((a, b) => a.ligne - b.ligne).forEach(v => parFichier.get(v.fichier).push(v));

const lien = nom => defs.has(nom) ? `\`${nom}()\` *(${defs.get(nom).fichier})*` : `\`${nom}()\``;

const totalAppels = [...noeuds.values()].reduce((s, v) => s + sortants(v).length, 0);
const jamais = [...defs.keys()].filter(n => !appelants.has(n)).sort();

let md = '';
md += '# Qui appelle qui\n\n';
md += '*Écrit par `node outils/genAppels.js` à partir des sources — ne pas modifier à la main.*\n\n';
md += 'Pour chaque fonction : le fichier où elle est définie, les fonctions du projet qu\'elle\n';
md += 'appelle, et celles qui l\'appellent. Trois façons d\'appeler, notées différemment — un appel\n';
md += 'direct sans marque, un appel **différé** (une fonction passée en rappel) précédé de « → »,\n';
md += 'un appel depuis un **gestionnaire HTML** produit par l\'atelier précédé de « ⌘ ». Les graphes\n';
md += 'correspondants sont dans `doc/graphe-fonctions.dot` et `doc/graphe-modules.dot`.\n\n';
md += `**${defs.size} fonctions** dans ${fichiers.length} modules, **${totalAppels} appels** relevés.\n\n`;

if (doublons.length) {
  md += '## Noms définis deux fois\n\n';
  md += 'Tout vivant dans la portée globale, le dernier chargé écrase le premier.\n\n';
  doublons.forEach(d => { md += `- \`${d.nom}()\` : \`${d.premier}\` puis \`${d.second}\`\n`; });
  md += '\n';
}

md += '## Fonctions que personne n\'appelle\n\n';
md += 'Points d\'entrée — appelées depuis le HTML, depuis un écouteur — ou code mort.\n\n';
md += jamais.length ? jamais.map(n => `- \`${n}()\` *(${defs.get(n).fichier})*`).join('\n') + '\n\n' : '*Aucune.*\n\n';

fichiers.forEach(f => {
  const liste = parFichier.get(f);
  if (!liste.length) return;
  md += `## js/${f}\n\n`;
  liste.forEach(v => {
    md += `### \`${v.nom}${v.chargement ? '' : '()'}\`${v.ligne ? ` — ligne ${v.ligne}` : ''}\n\n`;
    const vers = [
      ...[...v.appelle].sort().map(lien),
      ...[...v.differe].sort().map(n => '→ ' + lien(n)),
      ...[...v.html].sort().map(n => '⌘ ' + lien(n))
    ];
    md += vers.length ? `Appelle : ${vers.join(', ')}\n\n` : 'N\'appelle aucune fonction du projet.\n\n';
    const entrants = [...(appelants.get(cle(v)) || [])].sort();
    if (entrants.length) md += `Appelée par : ${entrants.map(n => '`' + n + '`').join(', ')}\n\n`;
  });
});

fs.mkdirSync(DOC, {recursive: true});
fs.writeFileSync(path.join(DOC, 'appels.md'), md);

const json = {
  genere: 'node outils/genAppels.js',
  modules: fichiers,
  fonctions: [...noeuds.values()].map(v => ({
    nom: v.nom,
    fichier: v.fichier,
    ligne: v.ligne || null,
    chargement: !!v.chargement,
    appelle: [...v.appelle].sort(),
    appelleDiffere: [...v.differe].sort(),
    appelleParHtml: [...v.html].sort(),
    appeleePar: [...(appelants.get(cle(v)) || [])].sort()
  })).sort((a, b) => fichiers.indexOf(a.fichier) - fichiers.indexOf(b.fichier) || (a.ligne || 0) - (b.ligne || 0))
};
fs.writeFileSync(path.join(DOC, 'appels.json'), JSON.stringify(json, null, 1));

/* =====================================================================
   6. Les graphes

   Un fichier est une boîte — un `cluster` —, chaque fonction un nœud dedans,
   et chaque appel une flèche. Quatre cent cinquante nœuds ne tiennent pas sur
   une page : d'où `--module=<nom>`, qui ne garde qu'un module et ses voisins,
   et d'où le second graphe, celui des modules, où les appels sont agrégés.
   ===================================================================== */

const TEINTES = ['#6d8ca8', '#8a7fa8', '#a8846d', '#6da88c', '#a86d8a', '#96a86d', '#6da8a4', '#a89b6d'];
const teinte = f => TEINTES[fichiers.indexOf(f) % TEINTES.length];
const id = s => '"' + String(s).replace(/"/g, '\\"') + '"';

const cible = (process.argv.find(a => a.startsWith('--module=')) || '').slice(9);
if (cible && !fichiers.includes(cible)) {
  console.error(`Module inconnu : ${cible}. Ils sont listés dans index.html.`);
  process.exit(1);
}

/* Le voisinage d'un module : ses fonctions, plus celles qu'elles appellent et
   celles qui les appellent — un cran, pas davantage. */
function retenues() {
  if (!cible) return null;
  const garde = new Set();
  noeuds.forEach((v, k) => { if (v.fichier === cible) garde.add(k); });
  const voisins = new Set(garde);
  noeuds.forEach((v, k) => sortants(v).forEach(c => {
    if (garde.has(k) && noeuds.has(c)) voisins.add(c);
    if (garde.has(c)) voisins.add(k);
  }));
  return voisins;
}

function grapheFonctions() {
  const garde = retenues();
  const dedans = k => !garde || garde.has(k);
  let d = 'digraph appels {\n';
  /* `concentrate` fond les arcs parallèles et les séparations sont serrées :
     quatre cent cinquante nœuds sont longs quoi qu'on fasse, autant qu'ils
     soient moins longs. Pour lire vraiment, voir --module=<nom>. */
  d += '  graph [rankdir=LR, concentrate=true, nodesep=0.10, ranksep=0.45, splines=true, fontname="Helvetica", bgcolor="#fbfaf7",\n';
  d += `         label=${id('Atelier MTG — appels entre fonctions' + (cible ? ', autour de ' + cible : ''))}, labelloc=t, fontsize=22];\n`;
  d += '  node  [shape=box, style="rounded,filled", fontname="Helvetica", fontsize=10, penwidth=0.6, margin="0.08,0.04"];\n';
  d += '  edge  [arrowsize=0.6, penwidth=0.7];\n\n';

  fichiers.forEach((f, i) => {
    const liste = parFichier.get(f).filter(v => dedans(cle(v)));
    if (!liste.length) return;
    d += `  subgraph ${id('cluster_' + i)} {\n`;
    d += `    label=${id('js/' + f)}; fontsize=13; style="rounded,filled"; color="${teinte(f)}"; fillcolor="${teinte(f)}1a"; penwidth=1.4;\n`;
    liste.forEach(v => {
      const forme = v.chargement ? ', shape=note' : '';
      d += `    ${id(cle(v))} [label=${id(v.nom)}, fillcolor="${teinte(f)}33", color="${teinte(f)}"${forme}];\n`;
    });
    d += '  }\n';
  });

  d += '\n';
  noeuds.forEach((v, k) => {
    if (!dedans(k)) return;
    const trait = (c, style) => { if (dedans(c)) d += `  ${id(k)} -> ${id(c)} [${style}];\n`; };
    v.appelle.forEach(c => trait(c, `color="${teinte(v.fichier)}99"`));
    v.differe.forEach(c => trait(c, `style=dashed, color="${teinte(v.fichier)}66"`));
    v.html.forEach(c => trait(c, `style=dotted, color="${teinte(v.fichier)}66"`));
  });
  return d + '}\n';
}

/* Les couches que le README déclare dans sa carte des modules — « le fond »,
   « les sections », « les fenêtres »… Les lire là plutôt que les redire ici :
   la carte est tenue à jour, et une couche qui disparaît ne laisse qu'un
   graphe sans boîtes, ce qui reste lisible. */
function couches() {
  let md = '';
  try { md = fs.readFileSync(path.join(RACINE, 'README.md'), 'utf8'); } catch { return new Map(); }
  const debut = md.indexOf('js/                 modules');
  if (debut < 0) return new Map();
  const par = new Map();
  let courante = '';
  for (const l of md.slice(debut).split('\n')) {
    if (l.startsWith('```')) break;
    const titre = l.match(/^\s+—\s+(.+?)\s+—\s*$/);
    if (titre) { courante = titre[1]; continue; }
    const fic = l.match(/^\s{2}([A-Za-z]+\.js)\s/);
    if (fic && fichiers.includes(fic[1])) par.set(fic[1], courante || 'le démarrage');
  }
  return par;
}

function grapheModules(seuil) {
  const poids = new Map();
  noeuds.forEach(v => sortants(v).forEach(c => {
    const dest = defs.get(c);
    if (!dest || dest.fichier === v.fichier) return;
    const k = v.fichier + ' ' + dest.fichier;
    poids.set(k, (poids.get(k) || 0) + 1);
  }));
  const retenus = [...poids.entries()].filter(([, n]) => n >= seuil);

  const par = couches();
  const ordre = [...new Set([...par.values()])];

  let d = 'digraph modules {\n';
  /* De haut en bas : soixante-quinze modules alignés de gauche à droite
     donnent une bande deux fois plus haute que large. */
  d += '  graph [concentrate=true, splines=true, fontname="Helvetica", bgcolor="#fbfaf7", newrank=true,\n';
  d += `         label=${id('Atelier MTG — appels entre modules' + (seuil > 1 ? `, à partir de ${seuil} appels` : ''))}, labelloc=t, fontsize=22, nodesep=0.25, ranksep=0.9];\n`;
  d += '  node  [shape=box, style="rounded,filled", fontname="Helvetica", fontsize=11, penwidth=0.8];\n\n';

  const boite = f => {
    const n = parFichier.get(f).filter(v => !v.chargement).length;
    return `    ${id(f)} [label=${id('js/' + f + '\\n' + n + ' fonction' + (n > 1 ? 's' : ''))}, fillcolor="${teinte(f)}33", color="${teinte(f)}"];\n`;
  };
  if (ordre.length) {
    ordre.forEach((nom, i) => {
      d += `  subgraph ${id('cluster_couche_' + i)} {\n`;
      d += `    label=${id(nom)}; fontsize=16; fontcolor="#555555"; style="rounded"; color="#00000022"; penwidth=1.6;\n`;
      fichiers.filter(f => par.get(f) === nom).forEach(f => { d += boite(f); });
      d += '  }\n';
    });
    fichiers.filter(f => !par.has(f)).forEach(f => { d += boite(f); });
  } else {
    fichiers.forEach(f => { d += boite(f); });
  }

  d += '\n';
  retenus.sort((a, b) => b[1] - a[1]).forEach(([k, n]) => {
    const [a, b] = k.split(' ');
    d += `  ${id(a)} -> ${id(b)} [penwidth=${Math.min(4, 0.5 + Math.log2(n)).toFixed(2)}, color="${teinte(a)}aa", tooltip=${id(n + ' appel(s)')}];\n`;
  });
  return d + '}\n';
}

/* Le graphe des fonctions porte tous les appels, sans exception. Celui des
   modules, lui, agrège : à un appel près, tout le monde parle à tout le monde
   — soixante-quinze boîtes et six cents traits qui ne disent rien. Le seuil par
   défaut ne garde que les liens un peu nourris, et le titre du graphe le dit. */
const seuil = Math.max(1, parseInt((process.argv.find(a => a.startsWith('--seuil=')) || '').slice(8), 10) || 3);
const sorties = [['graphe-fonctions.dot', grapheFonctions()], ['graphe-modules.dot', grapheModules(seuil)]];
sorties.forEach(([nom, txt]) => fs.writeFileSync(path.join(DOC, nom), txt));

/* Le rendu n'est pas indispensable : le .dot est le résultat, l'image n'en est
   qu'une lecture. Graphviz absent, on le dit et l'on s'arrête là. */
const rendus = [];
if (!process.argv.includes('--sans-rendu')) {
  let dispo = true;
  try { execFileSync('dot', ['-V'], {stdio: 'ignore'}); } catch { dispo = false; }
  if (dispo) {
    sorties.forEach(([nom]) => {
      const svg = nom.replace('.dot', '.svg');
      execFileSync('dot', ['-Tsvg', path.join(DOC, nom), '-o', path.join(DOC, svg)]);
      rendus.push('doc/' + svg);
    });
  } else {
    console.log('Graphviz absent : les .dot sont écrits, le rendu non.');
    console.log('  Pour l\'obtenir : apt install graphviz, puis dot -Tsvg doc/graphe-modules.dot -o doc/graphe-modules.svg');
  }
}

console.log(`doc/appels.md et doc/appels.json : ${defs.size} fonctions, ${totalAppels} appels, ${jamais.length} jamais appelée(s).`);
console.log(`doc/graphe-fonctions.dot${cible ? ` (autour de ${cible})` : ''} et doc/graphe-modules.dot écrits.`);
if (rendus.length) console.log('Rendus : ' + rendus.join(', ') + '.');
