/* =====================================================================
   js/forgeCout.js — Lire un coût de Forge

   `Cost$ 2 R T Sac<1/Creature.Other/another creature> PayLife<2>` : du
   mana, `T` pour s'engager, `Q` pour se dégager, puis des morceaux
   `Nom<n/type>`. On rend le coût dans la forme que le moteur paie déjà
   (js/jeuActions.js `paieAutre()`), et `null` si un seul morceau est
   inconnu : une capacité dont on ignore une part du prix serait gratuite
   pour le moteur, donc plus forte qu'elle n'est.
   ===================================================================== */

/* Le mana d'un coût de Forge : `2 W W`, `X R`, `W/U`, `2/W`, `W/P`, `C`. */
function manaForge(morceaux) {
  if (!morceaux.length) return coutManaVide();
  return coutMana(morceaux.map(m => '{' + m.toUpperCase() + '}').join(''));
}

function estManaForge(m) { return /^(\d+|X|[WUBRGCS]|[WUBRG2]\/[WUBRGP])$/i.test(m); }

/* Lire un coût. Rend `{cout, loyaute}` — `loyaute` : le changement de
   loyauté d'une capacité de planeswalker, un nombre ou `'X'`. */
function coutForge(txt) {
  const s = String(txt == null ? '' : txt).trim();
  const cout = {mana: null};
  let loyaute = null;
  if (!s || /^0$/.test(s) || /^no cost$/i.test(s)) return {cout: {mana: coutManaVide()}, loyaute};
  const morceaux = s.split(/\s+(?![^<]*>)/).filter(Boolean);
  const mana = [];
  for (const m of morceaux) {
    if (estManaForge(m)) { mana.push(m); continue; }
    if (m === 'T') { cout.engage = true; continue; }
    if (m === 'Q') { cout.degage = true; continue; }
    const k = /^(\w+)<([^/>]+)(?:\/([^/>]+))?(?:\/[^>]*)?>$/.exec(m);
    if (!k) return null;
    const n = /^\d+$/.test(k[2]) ? +k[2] : k[2];
    const type = k[3] || '';
    const soi = type === 'CARDNAME' || type === 'Self' || type === 'NICKNAME';
    switch (k[1]) {
      case 'Sac':
        if (soi) cout.sacSoi = true;
        else if (typeof n === 'number') cout.sac = {desc: descForge(type), n};
        else return null;
        break;
      case 'PayLife': if (typeof n !== 'number') return null; cout.vie = n; break;
      case 'Discard':
        if (typeof n !== 'number') return null;
        if (soi) { if (n !== 1) return null; cout.defausseSoi = true; break; }
        cout.defausse = type === 'Card' || !type ? {n} : {n, desc: {...descForge(type), genre: 'carte', zone: 'main'}};
        break;
      case 'ExileFromGrave':
        if (typeof n !== 'number') return null;
        if (soi) cout.exileSoi = true; else cout.exileCimetiere = {n, desc: descForge(type || 'Card')};
        break;
      case 'Return': if (soi || typeof n !== 'number') return null; cout.renvoie = {n, desc: descForge(type || 'Permanent')}; break;
      case 'Reveal': if (typeof n !== 'number') return null; if (!soi) cout.revele = {n, desc: descForge(type || 'Card')}; break;
      case 'PayEnergy': if (typeof n !== 'number') return null; cout.energie = n; break;
      case 'Draw': if (typeof n !== 'number' || (type && type !== 'You')) return null; cout.pioche = n; break;
      case 'SubCounter': case 'AddCounter': {
        const g = genreMarqueur(type);
        if (g === 'loyaute') { loyaute = n === 'X' ? 'X' : typeof n === 'number' ? (k[1] === 'AddCounter' ? n : -n) : null; if (loyaute == null) return null; break; }
        if (k[1] === 'AddCounter' || typeof n !== 'number') return null;
        cout.retire = {genre: g, n};
        break;
      }
      case 'tapXType':
        if (typeof n !== 'number') return null;
        cout.engageAutres = {n, desc: descForge(type)};
        break;
      case 'Exile': if (!soi) return null; cout.exileSoi = true; break;
      default: return null;
    }
  }
  cout.mana = manaForge(mana);
  if (!cout.mana) return null;
  return {cout, loyaute};
}

forgeSait('cout', 'T', 'Q', 'Sac', 'PayLife', 'Discard', 'SubCounter', 'AddCounter', 'tapXType', 'Exile', 'ExileFromGrave',
  'Return', 'Reveal', 'PayEnergy', 'Draw');
