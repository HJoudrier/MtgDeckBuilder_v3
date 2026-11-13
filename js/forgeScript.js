/* =====================================================================
   js/forgeScript.js — Lire un script de carte de Forge

   Forge décrit chaque carte dans un petit fichier texte : une ligne par
   propriété (`Name:`, `ManaCost:`, `Types:`, `PT:`), une par mot-clé
   (`K:`), par capacité (`A:`), par déclencheur (`T:`), par statique (`S:`),
   par remplacement (`R:`), et des variables nommées (`SVar:`) que les
   capacités s'enchaînent (`SubAbility$`, `Execute$`). Une capacité est une
   suite de `Clé$ Valeur` séparées par ` | `. Une carte à deux faces porte
   `ALTERNATE` entre les deux.

   Ce fichier ne fait que lire : il rend une structure, sans rien
   interpréter. Il est pur, et se charge tel quel dans Node pour les tests.
   Les scripts sont ceux du projet Forge (GPL-3.0), téléchargés sur
   l'appareil de l'utilisateur (js/forgeDepot.js) ; aucun ne vit dans ce
   dépôt.
   ===================================================================== */

/* Une capacité `Clé$ Valeur | Clé$ Valeur` en table. La première clé dit
   sa nature : `SP` (sort), `AB` (activée), `DB` (sous-capacité), ou `Mode`
   pour un déclencheur, une statique ; `Event` pour un remplacement. */
function forgeTable(txt) {
  const t = {};
  String(txt || '').split(' | ').forEach(morceau => {
    const i = morceau.indexOf('$');
    if (i < 0) return;
    t[morceau.slice(0, i).trim()] = morceau.slice(i + 1).trim();
  });
  return t;
}

/* L'effet d'une capacité : la valeur de sa première clé SP, AB ou DB. */
function forgeApi(t) { return t.SP || t.AB || t.DB || null; }

const FORGE_SUPERTYPES = ['Legendary', 'Basic', 'Snow', 'World', 'Ongoing', 'Host', 'Elite'];
const FORGE_TYPES = ['Creature', 'Artifact', 'Enchantment', 'Land', 'Planeswalker', 'Instant', 'Sorcery', 'Battle',
  'Kindred', 'Tribal', 'Dungeon', 'Plane', 'Phenomenon', 'Scheme', 'Vanguard', 'Conspiracy', 'Emblem'];

/* `Legendary Creature Human Soldier` → la ligne de type de l'atelier,
   `Legendary Creature — Human Soldier`. */
function forgeLigneType(types) {
  const mots = String(types || '').split(/\s+/).filter(Boolean);
  const avant = mots.filter(m => FORGE_SUPERTYPES.includes(m) || FORGE_TYPES.includes(m));
  const apres = mots.filter(m => !avant.includes(m));
  return avant.join(' ') + (apres.length ? ' — ' + apres.join(' ') : '');
}

/* `4 B B`, `X R`, `W/U W/U`, `2/G`, `W/P` → `{4}{B}{B}`… ; `no cost` → ''. */
function forgeCoutMana(c) {
  const s = String(c || '').trim();
  if (!s || /^no cost$/i.test(s)) return '';
  return s.split(/\s+/).map(x => '{' + x.toUpperCase() + '}').join('');
}

function faceVide() {
  return {nom: '', cout: '', types: '', pt: null, loyaute: null, couleurs: null, k: [], a: [], t: [], s: [], r: [],
    svars: {}, oracle: '', defense: null, texte: [], inconnues: []};
}

/* Lire un script. Rend `{faces: [face, …], mode}` ; `mode` dit comment les
   faces se rapportent (`DoubleFaced`, `Split`, `Adventure`, `Modal`, `Flip`…). */
function lisScriptForge(texte) {
  const faces = [faceVide()];
  let mode = '';
  String(texte || '').replace(/^﻿/, '').split(/\r?\n/).forEach(brute => {
    const l = brute.trim();
    if (!l || l.startsWith('#')) return;
    if (l === 'ALTERNATE' || /^SPECIALIZE/.test(l)) { faces.push(faceVide()); return; }
    const f = faces[faces.length - 1];
    const i = l.indexOf(':');
    if (i < 0) { f.inconnues.push(l); return; }
    const cle = l.slice(0, i), val = l.slice(i + 1);
    switch (cle) {
      case 'Name': f.nom = val.trim(); break;
      case 'ManaCost': f.cout = forgeCoutMana(val); break;
      case 'Types': f.types = val.trim(); break;
      case 'PT': f.pt = val.trim(); break;
      case 'Loyalty': f.loyaute = val.trim(); break;
      case 'Defense': f.defense = val.trim(); break;
      case 'Colors': f.couleurs = val.trim(); break;
      case 'Oracle': f.oracle = val.replace(/\\n/g, '\n'); break;
      case 'AlternateMode': mode = val.trim(); break;
      case 'K': f.k.push(val.trim()); break;
      case 'A': f.a.push(forgeTable(val)); break;
      case 'T': f.t.push(forgeTable(val)); break;
      case 'S': f.s.push(forgeTable(val)); break;
      case 'R': f.r.push(forgeTable(val)); break;
      case 'SVar': {
        const j = val.indexOf(':');
        if (j > 0) f.svars[val.slice(0, j)] = val.slice(j + 1);
        break;
      }
      case 'Text': f.texte.push(val); break;
      case 'DeckHints': case 'DeckHas': case 'DeckNeeds': case 'AI': case 'Variant': case 'Draft':
      case 'HandLifeModifier': case 'MeldPair': case 'Partner': case 'DeckRule': case 'SETCOLORID': case 'Lights': break;
      default: f.inconnues.push(l);
    }
  });
  return {faces: faces.filter(f => f.nom), mode};
}

/* La sous-capacité nommée par une SVar, lue en table — ou `null` si la
   SVar n'est pas une capacité (`X:Count$…`, un indice pour l'IA). */
function forgeSousCapacite(face, nom) {
  const v = face.svars[nom];
  if (!v || !/^(DB|AB|SP)\$/.test(v.trim())) return null;
  return forgeTable(v);
}

/* La fiche de l'atelier qu'un script décrit : nom, coût, type, texte,
   force et endurance — de quoi afficher la carte et nourrir les
   statistiques, même sans la jouer. */
function ficheDeScriptForge(s) {
  const f = s.faces[0];
  const pt = /^(\d+)\/(\d+)$/.exec(f.pt || '');
  const brut = f.pt && !pt ? f.pt : '';
  return {nom: s.faces.length > 1 && /Split/.test(s.mode) ? s.faces.map(x => x.nom).join(' // ') : f.nom,
    cout: f.cout, type: forgeLigneType(f.types), texte: f.oracle.replace(/\n/g, ' // '),
    force: pt ? +pt[1] : null, endurance: pt ? +pt[2] : null,
    loyaute: /^\d+$/.test(f.loyaute || '') ? +f.loyaute : null, ptBrut: brut,
    faces: s.faces.length > 1 ? s.faces.map(x => [x.nom, x.cout, forgeLigneType(x.types), x.oracle.replace(/\n/g, ' // '),
      (x.pt || '').split('/')[0] || null, (x.pt || '').split('/')[1] || null, x.loyaute]) : null};
}
