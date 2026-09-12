/* =====================================================================
   js/catalogueEtat.js — L'archive en mémoire, et les nœuds qu'elle touche

   `CH` dit à quel indice chaque champ d'un enregistrement se trouve, `CAT` où
   en est l'archive. Par-dessus, de quoi juger un enregistrement sans le bâtir
   en carte — et, quand il le faut vraiment, le bâtir une seule fois et le
   garder sur l'enregistrement lui-même.
   ===================================================================== */

const CH = {NOM:0, COUT:1, TYPE:2, TEXTE:3, CMC:4, ID_COUL:5, FORCE:6, PRIX:7, ID:8, RANG:9, LEGAL:10, IMG:11, VERSO:12, ENDURANCE:13, ARTISTE:14, SET:15, NUMERIQUE:16};

const CAT = {
  etat:'', cartes:[], maj:null, source:'', octets:0, date:null, detail:'', partiel:false,
  majDispo:null, uri:'', taille:0, tailleBrute:0, impressions:0, suivi:null, ctrl:null
};

/* Vrai tant que cet appareil n'a pas les cartes existantes : archive jamais
   chargée, ou chargée mais vide. C'est ce que le démarrage teste en premier. */
function catalogueAbsent() {
  return CAT.etat !== 'ok' || !CAT.cartes.length;
}

function noeudsActifs() {
  return [...S.focusNodes];
}

function carteTouche(c, noeuds) {
  if (!noeuds || !noeuds.length) return true;
  if (!c || !c.an) return false;
  return noeuds.every(n => {
    if (c.an.edges && c.an.edges.some(e => e.from === n || e.to === n)) return true;
    if (c.an.triggers && c.an.triggers.some(t => t.c === n)) return true;
    if (c.an.produces && c.an.produces.some(p => p.c === n)) return true;
    if (c.an.abilities && c.an.abilities.some(a => (a.from && a.from.includes(n)) || (a.to && a.to.includes(n)))) return true;
    return false;
  });
}

function getCardOrAnalyzedRec(rec) {
  if (rec._card) return rec._card;
  const nom = rec[CH.NOM];
  let c = typeof find === 'function' ? find(nom) : null;
  if (c && c.an) {
    rec._card = c;
    return c;
  }
  const card = buildCard(nom, rec[CH.COUT] || '—', rec[CH.TYPE], rec[CH.PRIX], rec[CH.TEXTE]);
  if (rec[CH.ID_COUL] !== undefined) card.identity = rec[CH.ID_COUL] ? String(rec[CH.ID_COUL]).split('') : [];
  card.cmc = rec[CH.CMC];
  if (rec[CH.FORCE] != null) card.force = rec[CH.FORCE];
  if (rec[CH.ENDURANCE] != null) card.endurance = rec[CH.ENDURANCE];
  if (rec[CH.ARTISTE]) card.artist = rec[CH.ARTISTE];
  rec._card = card;
  return card;
}

function recToucheNoeuds(rec, noeuds) {
  if (!noeuds || !noeuds.length) return true;
  const card = getCardOrAnalyzedRec(rec);
  return carteTouche(card, noeuds);
}
