/* =====================================================================
   js/cartes.js — La base de cartes et ses index

   Une carte est un objet enrichi à mesure : bâtie par `buildCard()`, analysée,
   rangée dans `DB` et dans trois index — le nom normalisé, le nom réduit aux
   lettres, le recto d'une carte à deux faces. `find()` les interroge dans cet
   ordre, du plus strict au plus tolérant, parce qu'un import écrit les noms
   comme il veut.
   ===================================================================== */

/* Base de données & indexation */
const DB = [];
const BY_NAME = {};
const LOOSE = {};
const FRONT = {};

function norm(s) { return String(s).toLowerCase().replace(/[\u2018\u2019`]/g,"'").replace(/\s+/g,' ').trim(); }
function loose(s) { return norm(s).normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9]/g,''); }

function buildCard(name, cost, type, price, text) {
  const pc = parseCost(cost);
  const card = {name, cost:cost==='—'?'':cost, type:type||'Inconnu', price:parseFloat(price)||0, text:text||'',
    cmc:pc.cmc, symbols:pc.symbols, colors:[...pc.colors]};
  const idc = new Set(card.colors);
  (card.text.match(/\{[^}]+\}/g)||[]).forEach(x => x.slice(1,-1).split('/').forEach(pp => { if ('WUBRG'.includes(pp)) idc.add(pp); }));
  if (/^basic land/i.test(card.type)) idc.clear();
  card.identity = [...idc];
  const pt = (card.text||'').match(/(?:^|\s)(\d+)\/(\d+)(?![^.]{0,40}token)/);
  card.force = pt ? +pt[1] : null;
  card.endurance = pt ? +pt[2] : null;
  card.sousTypes = ((card.type||'').split('—')[1]||'').toLowerCase().split(/\s+/).filter(Boolean);
  const tf = String(card.type).split(' // ')[0];
  card.isToken = /\btoken\b/i.test(tf);
  card.typesSort = ['creature','instant','sorcery','artifact','enchantment','planeswalker','battle','land']
    .filter(t => new RegExp(t,'i').test(tf));
  card.isCreature = /creature/i.test(tf) && !card.isToken;
  card.isLand = /land/i.test(tf) && !card.isToken;
  card.isLegendaryCreature = /legendary creature/i.test(tf) && !card.isToken;
  return reanalyser(card);
}

/* La base intégrée ne garde qu'un résumé du texte des cartes : dès qu'une
   source officielle (Scryfall ou catalogue local) fournit le texte oracle
   complet, il remplace le résumé et l'analyse est refaite. Le drapeau
   `textFull` évite de redemander un texte déjà complet. */
function majTexteOracle(card, texte) {
  if (!card) return false;
  const t = String(texte == null ? '' : texte).replace(/\n/g, ' // ').trim();
  if (!t) return false;
  const identique = card.text === t;
  card.textFull = true;
  if (identique) return false;
  card.text = t;
  if (!/^basic land/i.test(card.type || '')) {
    const idc = new Set(card.identity && card.identity.length ? card.identity : (card.colors || []));
    (t.match(/\{[^}]+\}/g) || []).forEach(x => x.slice(1, -1).split('/')
      .forEach(pp => { if ('WUBRG'.includes(pp)) idc.add(pp); }));
    card.identity = [...idc];
  }
  reanalyser(card);
  return true;
}

function indexCard(card) {
  BY_NAME[norm(card.name)] = card;
  LOOSE[loose(card.name)] = card;
  if (card.name.includes(' // ')) {
    const f = loose(card.name.split(' // ')[0]);
    if (f && !FRONT[f]) FRONT[f] = card;
  }
}

function unindexCard(card) {
  delete BY_NAME[norm(card.name)];
  delete LOOSE[loose(card.name)];
  if (card.name.includes(' // ')) {
    const f = loose(card.name.split(' // ')[0]);
    if (FRONT[f] === card) delete FRONT[f];
  }
}

function registerCard(card) {
  const k = norm(card.name);
  if (BY_NAME[k]) return BY_NAME[k];
  DB.push(card);
  indexCard(card);
  return card;
}

/* ---------------------------------------------------------------------
   Éditions. Une liste exportée par MTGO, Moxfield, Archidekt ou
   Deckstats donne le code d'édition entre parenthèses puis le numéro de
   collection : « 1 Sol Ring (LTC) 344 ». Ce couple désigne une
   impression précise, donc son visuel, son illustrateur et son prix ; il
   est relevé à l'import, conservé sur la carte et redemandé tel quel à
   Scryfall. La collection reste comptée par nom : les éditions relevées
   s'ajoutent les unes aux autres sur la même carte.
   --------------------------------------------------------------------- */

function find(name) {
  if (!name) return null;
  const n = norm(name);
  const avant = n.split(' // ')[0].trim();
  return BY_NAME[n] || BY_NAME[avant] || LOOSE[loose(n)] || LOOSE[loose(avant)]
      || FRONT[loose(n)] || FRONT[loose(avant)] || null;
}

function peutCommander(c) {
  return !!c && (c.isLegendaryCreature || /can be your commander/i.test(c.text||''));
}

function commandantsPossibles() {
  return deckEntries().map(e => e.card).filter(peutCommander);
}

/* Les commandants principaux du deck. Un seul se désigne aujourd'hui — l'étoile
   de l'onglet Deck, `S.commander` —, mais la liste en attend plusieurs : deux
   cartes liées par « Partner » commandent ensemble, et c'est ici, en un seul
   endroit, qu'elles s'ajouteraient. Tout ce qui les affiche parcourt donc une
   liste, non une carte. */
function commandantsPrincipaux() {
  const c = S.commander ? find(S.commander) : null;
  return c ? [c] : [];
}

/* Toutes les cartes du deck qui pourraient commander, les commandants
   principaux mis à part : la liste que l'onglet EDHREC affiche, cochées ou
   non. */
function commandantsSecondairesPossibles() {
  return deckEntries().map(e => e.card).filter(c => peutCommander(c) && (!S.commander || c.name !== S.commander));
}

/* Celles qu'on traite effectivement comme commandants secondaires : les autres
   ont été décochées dans l'onglet EDHREC (`S.secondairesOff`). Tout ce qui
   croise l'atelier avec EDHREC passe par ici — les statistiques demandées, les
   étiquettes des vignettes, l'empreinte de la notation. */
function commandantsSecondaires() {
  return commandantsSecondairesPossibles().filter(c => !S.secondairesOff.has(c.name));
}

function mainType(c) {
  const t = c.type.toLowerCase().split(' // ')[0];
  if (c.isToken || /\btoken\b/.test(t)) return 'Jeton';
  if (t.includes('land')) return 'Terrain';
  if (t.includes('creature')) return 'Créature';
  if (t.includes('instant')) return 'Éphémère';
  if (t.includes('sorcery')) return 'Rituel';
  if (t.includes('artifact')) return 'Artefact';
  if (t.includes('enchantment')) return 'Enchantement';
  if (t.includes('planeswalker')) return 'Planeswalker';
  return 'Autre';
}

const TYPE_ORDER = ['Créature','Éphémère','Rituel','Artefact','Enchantement','Planeswalker','Terrain','Jeton','Autre'];

/* Peuplement initial */
RAW.split('\n').forEach(line => {
  const [name, cost, type, price, text] = line.split('|');
  if (!name) return;
  registerCard(buildCard(name, cost, type, price, text));
});

const BUILTIN = new Set(DB.map(c => norm(c.name)));

function initBuiltin() {
  if (DB.length === 0) {
    RAW.split('\n').forEach(line => {
      const [name, cost, type, price, text] = line.split('|');
      if (!name) return;
      registerCard(buildCard(name, cost, type, price, text));
    });
  }
}
