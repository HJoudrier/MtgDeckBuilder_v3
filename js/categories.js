/* =====================================================================
   js/categories.js — Les rôles d'une carte

   Les rôles ne se lisent pas dans le texte brut : `categories()` croise le
   type avec ce que l'analyse a relevé — ce que chaque capacité produit, sur
   qui porte l'effet, ce que les coûts consomment et ce qui la déclenche. Un
   terrain qui n'ajoute qu'un mana n'est pas du ramp, une carte qui se blesse
   elle-même ne fait pas de l'interaction, une contrainte qu'on s'impose n'est
   pas du stax.
   ===================================================================== */

function categories(card) {
  const c = new Set();
  if (!card || card.isToken) return c;
  const a = card.an || {abilities:[], produces:[], triggers:[]};
  const caps = a.abilities || [];
  const t = (card.type || '').toLowerCase();
  const tx = (card.text || '').toLowerCase();

  const effet = x => x.textEff || x.text || '';
  const vers = (ids, test) => caps.some(x => ids.some(id => x.to.includes(id)) && (!test || test(x)));
  const depuis = ids => caps.some(x => ids.some(id => x.from.includes(id)));
  const produit = ids => (a.produces || []).some(p => ids.includes(p.c));
  /* Les déclencheurs relevés par l'analyse comprennent ce que les coûts
     consomment ; seuls les vrais déclencheurs nous intéressent ici. */
  const declenche = ids => (a.triggers || []).some(x => ids.includes(x.c) && (x.q || {}).mode !== 'cout');

  /* Une capacité qui ne vise que nos propres permanentes, ou nous-mêmes :
     un sacrifice, une perte de vie consentie, un renvoi en main choisi. */
  const nomCourt = (card.name || '').toLowerCase().split(',')[0].trim();
  const surLuiMeme = e => (nomCourt && e.includes(nomCourt)) || /\bthis (?:creature|permanent|card)\b/.test(e);
  const surSoi = x => {
    const e = effet(x);
    if (/target opponent|each opponent|opponents|target player/.test(e)) return false;
    // une carte qui se replace elle-même n'interagit avec personne
    if (surLuiMeme(e) && /(?:owner's|your) (?:library|hand|graveyard)/.test(e)) return true;
    return /\byou control\b|\bto you\b|\byourself\b|\byour (?:creatures?|permanents?|lands?|hand|library|graveyard)\b/.test(e);
  };
  /* Un balayage porte sur ce qui est en jeu : des permanentes, non des
     joueurs. « Inflige 2 blessures à chaque adversaire » frappe tout le monde
     sans rien retirer du champ de bataille — c'est du dégât de masse, et
     Purphoros n'est pas un board wipe. */
  const enMasse = x => {
    const e = effet(x);
    // « le dessus de la bibliothèque de chaque joueur » ne balaie rien
    if (/(?:player|opponent)['\u2019]s (?:library|hand|graveyard)/.test(e)) return false;
    return /\b(?:all|each|every)\s+(?:other\s+)?(?:creature|permanent|artifact|enchantment|land|nonland)/.test(e);
  };
  /* Le sacrifice imposé à la table vide le champ de bataille aussi sûrement
     qu'une destruction : « chaque joueur sacrifie une créature ». C'est le
     seul balayage qui passe par les joueurs, et il nomme sa cible. */
  const sacrificeGeneral = x =>
    /\b(?:all|each|every)\s+(?:other\s+)?(?:player|opponent)s?\b[^.]*\bsacrifices?\b[^.]*\b(?:creature|permanent|artifact|enchantment|land)/.test(effet(x));
  /* Une force retirée en masse tue comme une destruction : « toutes les
     créatures gagnent -X/-X ». Un bonus, lui, ne balaie rien. */
  const affaiblitEnMasse = x => enMasse(x) && /-\s*[\dx]+\s*\/\s*-\s*[\dx]+/.test(effet(x));

  if (/creature/.test(t)) c.add('creatures');
  if (/land/.test(t)) c.add('terrains');

  /* Ramp : produire du mana au-delà de ce que fait n'importe quel terrain,
     chercher un terrain, ou réduire les coûts. Un terrain qui ajoute un
     seul mana n'accélère rien, quelle que soit sa rareté. */
  const manaPourSoi = vers(['MANA', 'TRESOR', 'RAMP', 'REDUCTION']) || produit(['TRESOR', 'RAMP']);
  const terrainAccelere = /add \{[^}]+\}\{|\badd (?:two|three|four)\b|search your library for[^.]{0,50}land/.test(tx);
  if (manaPourSoi && (!/land/.test(t) || terrainAccelere)) c.add('ramp');

  /* Card advantage : piocher, filtrer ou récupérer, pour soi. */
  if (vers(['PIOCHE', 'IMPULSE', 'RECURSION'],
    x => !(x.scopeEff === 'adv' && !/\byou\b/.test(effet(x))))) c.add('pioche');
  if (vers(['TUTEUR']) || produit(['TUTEUR'])) c.add('tuteurs');

  /* Interaction : ce qui répond à ce qui n'est pas à nous — destruction,
     exil, renvoi, dégâts, contresort. */
  if (vers(['DESTRUCTION', 'EXIL', 'BOUNCE', 'DEGATS', 'CONTRESORT', 'MIS_EN_BIBLIO'],
    x => !surSoi(x))) c.add('interaction');
  /* L'emphase (overload) remplace « target » par « each » : le sort balaie
     le champ de bataille, quoi qu'en dise la lettre de son texte. */
  const emphase = /\boverload\b/.test(tx);
  if (vers(['DESTRUCTION', 'EXIL', 'DEGATS', 'MIS_EN_BIBLIO', 'BOUNCE'],
        x => (enMasse(x) || emphase) && !surSoi(x))
      || vers(['SACRIFICE'], sacrificeGeneral)
      || vers(['BOOST'], x => affaiblitEnMasse(x) && !surSoi(x))) c.add('wipe');

  /* Protection : pour nos permanentes, pas pour celles d'en face. */
  if (vers(['INDESTRUCTIBLE', 'LINCEUL', 'PROTECTION'], x => x.scopeEff !== 'adv')) c.add('protection');

  /* Jetons : les nôtres. Un sort qui en donne un à sa victime n'en fait pas
     une carte à jetons. */
  const pourAutrui = x => /its controller|that player|each opponent|target opponent|your opponents/.test(effet(x));
  if (vers(['JETON'], x => !pourAutrui(x))) c.add('jetons');
  if (vers(['MARQUEUR']) || produit(['MARQUEUR'])) c.add('marqueurs');

  /* Sacrifice : le provoquer, s'en nourrir, ou offrir l'exutoire — les
     coûts relevés par l'analyse le disent mieux que le texte. */
  if (vers(['SACRIFICE']) || depuis(['SACRIFICE', 'MORT', 'MORT_SOI'])
      || declenche(['MORT', 'SACRIFICE']) || caps.some(x => x.sacOutlet || x.selfSac)) c.add('sacrifice');

  /* Blink : scintiller, ou se déclencher sur l'arrivée d'un autre. */
  if (vers(['BLINK']) || depuis(['ETB']) || declenche(['ETB'])) c.add('blink');

  /* Stax : une gêne imposée aux autres. Les contraintes qu'une carte
     s'impose à elle-même, ou que l'on accepte, n'en sont pas. */
  const gene = x => {
    const e = effet(x);
    if (/can't be regenerated|no maximum hand size|skip your|\byou can't\b|\byou don't\b/.test(e)) return false;
    if (/can't (?:block|attack)/.test(e) && surLuiMeme(e)) return false;
    return true;
  };
  if (vers(['STAX', 'TAXE'], gene)) c.add('stax');
  return c;
}

/* Une carte dont le texte ou la force changent voit son analyse refaite. */
function reanalyser(card) {
  card.an = analyze(card);
  card.cats = categories(card);
  return card;
}

const CATLABEL = {
  creatures:'Créatures', terrains:'Terrains', ramp:'Ramp / mana', pioche:'Card advantage',
  tuteurs:'Tuteurs', interaction:'Interaction', wipe:'Board wipes', protection:'Protection', jetons:'Jetons',
  marqueurs:'Marqueurs', sacrifice:'Sacrifice', blink:'ETB / blink', stax:'Stax'
};
