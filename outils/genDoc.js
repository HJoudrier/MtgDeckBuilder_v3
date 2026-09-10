#!/usr/bin/env node
/* =====================================================================
   outils/genDoc.js — L'inventaire des fonctions, écrit par la machine

   Le README a longtemps porté un tableau par module listant chaque
   fonction et son rôle : quatre cent vingt lignes qui paraphrasaient ce
   que le code affirme déjà, et qu'il fallait reprendre à la main à chaque
   fonction ajoutée, renommée ou retirée. La doc dérivait, ou coûtait un
   détour à chaque commit.

   Ce script la reconstruit à partir des sources : l'ordre des modules est
   lu dans `index.html`, le rôle de chacun dans la bannière de son fichier,
   celui de chaque fonction dans le commentaire qui la précède. Le résultat
   va dans `doc/fonctions.md`, qui ne se modifie donc jamais à la main.

   Usage : node outils/genDoc.js [--verifie]
   `--verifie` ne réécrit rien et sort en erreur si le fichier est périmé —
   de quoi le contrôler sans risquer de l'oublier.
   ===================================================================== */

import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const RACINE = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SORTIE = path.join(RACINE, 'doc', 'fonctions.md');

/* L'ordre de chargement fait foi : c'est celui où les modules se
   connaissent, et donc celui où on a envie de les lire. */
function ordreModules() {
  const html = fs.readFileSync(path.join(RACINE, 'index.html'), 'utf8');
  const noms = [];
  const re = /<script\s+src="js\/([^"?]+)/g;
  let m;
  while ((m = re.exec(html))) noms.push(m[1]);
  return noms;
}

/* Une bannière est un pavé encadré de « ==== » ou de « ---- » : elle décrit
   le fichier ou une de ses parties, pas la fonction qui la suit. */
function estBanniere(bloc) {
  return /^[=-]{10,}$/.test(bloc.replace(/[^=-]/g, '').slice(0, 20)) || /[=-]{10,}/.test(bloc);
}

/* Le rôle d'un module : la seconde ligne de sa bannière, « js/x.js — Titre ». */
function titreModule(src, fichier) {
  const m = src.match(new RegExp('js/' + fichier.replace('.', '\\.') + '\\s+[—-]\\s+(.+)'));
  return m ? m[1].trim() : '';
}

/* Le commentaire qui précède une déclaration, réduit à sa première phrase.
   Les bannières sont écartées : elles parlent d'un chapitre, pas d'un nom. */
function roleAvant(lignes, i) {
  let fin = i - 1;
  while (fin >= 0 && lignes[fin].trim() === '') fin--;
  if (fin < 0) return '';
  if (!/\*\/\s*$/.test(lignes[fin]) && !/^\s*\/\//.test(lignes[fin])) return '';
  let debut = fin;
  if (/^\s*\/\//.test(lignes[fin])) {
    while (debut > 0 && /^\s*\/\//.test(lignes[debut - 1])) debut--;
  } else {
    while (debut > 0 && !/^\s*\/\*/.test(lignes[debut])) debut--;
  }
  const bloc = lignes.slice(debut, fin + 1).join(' ');
  if (estBanniere(bloc)) return '';
  let txt = bloc.replace(/\/\*+/g, ' ').replace(/\*+\//g, ' ').replace(/^\s*\/\//gm, ' ')
                .replace(/\s+/g, ' ').trim();
  /* Une phrase suffit : le fichier source porte le reste. On ne coupe qu'au
     point — un deux-points arrive souvent avant l'essentiel de la phrase. */
  const point = txt.search(/\. /);
  if (point > 40) txt = txt.slice(0, point + 1);
  if (txt.length > 190) txt = txt.slice(0, 187).replace(/\s+\S*$/, '') + '…';
  return txt;
}

/* Les déclarations de premier niveau, celles qui commencent en colonne 1 :
   ce sont les seules que les autres modules peuvent appeler. */
function declarations(src) {
  const lignes = src.split('\n');
  const out = [];
  lignes.forEach((l, i) => {
    let m = l.match(/^(?:async\s+)?function\s+([A-Za-z_$][\w$]*)\s*\(([^)]*)\)/);
    if (m) { out.push({nom: m[1], sig: '(' + m[2].trim() + ')', role: roleAvant(lignes, i)}); return; }
    m = l.match(/^(const|let)\s+([A-Za-z_$][\w$]*)\s*=\s*(.*)$/);
    if (!m) return;
    const suite = m[3];
    const fleche = suite.match(/^(?:async\s*)?\(([^)]*)\)\s*=>/) || suite.match(/^(?:async\s*)?([A-Za-z_$][\w$]*)\s*=>/);
    out.push({
      nom: m[2],
      sig: fleche ? '(' + (fleche[1] || '').trim() + ')' : '',
      genre: fleche ? 'fonction' : (m[1] === 'const' ? 'constante' : 'variable'),
      role: roleAvant(lignes, i)
    });
  });
  return out;
}

function ko(n) { return (n / 1024).toFixed(n < 10240 ? 1 : 0).replace('.0', '') + ' Ko'; }

const modules = ordreModules().map(f => {
  const src = fs.readFileSync(path.join(RACINE, 'js', f), 'utf8');
  const decls = declarations(src);
  return {
    fichier: f,
    titre: titreModule(src, f),
    octets: Buffer.byteLength(src),
    lignes: src.split('\n').length,
    fonctions: decls.filter(d => !d.genre || d.genre === 'fonction'),
    valeurs: decls.filter(d => d.genre === 'constante' || d.genre === 'variable')
  };
});

const totalF = modules.reduce((s, m) => s + m.fonctions.length, 0);
const totalO = modules.reduce((s, m) => s + m.octets, 0);

let md = '';
md += '# Inventaire des fonctions\n\n';
md += '*Écrit par `node outils/genDoc.js` à partir des sources — ne pas modifier à la main.*\n\n';
md += 'Le rôle de chaque fonction est repris du commentaire qui la précède dans le code : ce\n';
md += 'fichier est un index, la source reste la référence. Pour l\'ordre dans lequel ces\n';
md += 'fonctions s\'appellent, voir [PARCOURS.md](../PARCOURS.md) ; pour l\'architecture,\n';
md += '[README.md](../README.md).\n\n';
md += `**${totalF} fonctions**, ${modules.length} modules, ${ko(totalO)} de JavaScript.\n\n`;

md += '| Module | Rôle | Fonctions | Lignes |\n|---|---|--:|--:|\n';
modules.forEach(m => {
  md += `| [\`${m.fichier}\`](#js${m.fichier.replace('.js', 'js').toLowerCase()}) | ${m.titre} | ${m.fonctions.length} | ${m.lignes} |\n`;
});
md += '\n';

modules.forEach(m => {
  md += `## js/${m.fichier}\n\n`;
  if (m.titre) md += `${m.titre}. *${m.fonctions.length} fonctions, ${m.lignes} lignes, ${ko(m.octets)}.*\n\n`;
  if (m.fonctions.length) {
    md += '| Fonction | Rôle |\n|---|---|\n';
    m.fonctions.forEach(f => {
      md += `| \`${f.nom}${f.sig}\` | ${f.role.replace(/\|/g, '\\|') || '—'} |\n`;
    });
    md += '\n';
  }
  if (m.valeurs.length) {
    md += '| Donnée | Rôle |\n|---|---|\n';
    m.valeurs.forEach(v => {
      md += `| \`${v.nom}\` | ${v.role.replace(/\|/g, '\\|') || '—'} |\n`;
    });
    md += '\n';
  }
});

if (process.argv.includes('--verifie')) {
  const actuel = fs.existsSync(SORTIE) ? fs.readFileSync(SORTIE, 'utf8') : '';
  if (actuel !== md) {
    console.error('doc/fonctions.md est périmé. Relancer : node outils/genDoc.js');
    process.exit(1);
  }
  console.log('doc/fonctions.md est à jour.');
} else {
  fs.mkdirSync(path.dirname(SORTIE), {recursive: true});
  fs.writeFileSync(SORTIE, md);
  console.log(`doc/fonctions.md : ${totalF} fonctions, ${modules.length} modules, ${ko(Buffer.byteLength(md))}.`);
}
