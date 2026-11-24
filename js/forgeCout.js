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
  /* `WB`, `WP` : l'hybride et le phyrexian s'écrivent sans barre dans les
     coûts d'activation. */
  return coutMana(morceaux.map(m => '{' + (/^[WUBRG2][WUBRGP]$/i.test(m) ? m[0] + '/' + m[1] : m).toUpperCase() + '}').join(''));
}

function estManaForge(m) { return /^(\d+|X|[WUBRGCS]|[WUBRG2]\/?[WUBRGP])$/.test(m); }

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
    if (m === 'Mandatory' || m === 'XMin1') continue;
    /* Fourrager : exiler trois cartes de son cimetière (ou sacrifier un
       Food — simplification : toujours le cimetière). */
    if (m === 'Forage') { cout.exileCimetiere = {n: 3, desc: descForge('Card')}; continue; }
    const tout = /^(\w+)<([^>]*)>$/.exec(m), parts = tout ? tout[2].split('/') : [];
    /* Une quantité X (« remove X storage counters », « pay X life ») : X se
       choisit à l'activation, ou c'est celui du sort (js/jeuCoutsX.js). */
    const nb = /^\d+$/.test(parts[0] || '') ? +parts[0] : parts[0] === 'X' && X_COUTS_B.includes((tout || [])[1]) ? 'X' : null;
    if (tout && COUTS_B[tout[1]]) { if (nb == null && tout[1] !== 'Exert') return null; if (!COUTS_B[tout[1]](cout, nb, parts, mana)) return null; continue; }
    const k = /^(\w+)<([^/>]+)(?:\/([^/>]+))?(?:\/[^>]*)?>$/.exec(m);
    if (!k) return null;
    const n = /^\d+$/.test(k[2]) ? +k[2] : k[2];
    const type = k[3] || '';
    const soi = type === 'CARDNAME' || type === 'Self' || type === 'NICKNAME';
    /* Un nombre, ou X là où le moteur sait le payer. */
    const nx = typeof n === 'number' || n === 'X';
    switch (k[1]) {
      case 'Sac':
        if (soi) cout.sacSoi = true;
        else if (nx) cout.sac = {desc: descForge(type), n};
        else return null;
        break;
      case 'PayLife': if (!nx) return null; cout.vie = n; break;
      case 'Discard':
        if (!nx) return null;
        if (soi) { if (n !== 1) return null; cout.defausseSoi = true; break; }
        cout.defausse = type === 'Card' || !type ? {n} : {n, desc: {...descForge(type), genre: 'carte', zone: 'main'}};
        break;
      /* Exiler une carte de sa main (Force of Will) : comme une défausse,
         vers l'exil. */
      case 'ExileFromHand':
        /* Exiler la carte elle-même de sa main (les Spirit Guides). */
        if (soi && n === 1) { cout.exileSoi = true; break; }
        if (typeof n !== 'number' || soi) return null;
        cout.defausse = {n, desc: type && type !== 'Card' ? {...descForge(type.replace(/\+Other$/, '')), genre: 'carte', zone: 'main'} : undefined, exil: true};
        break;
      case 'ExileFromGrave':
        if (!nx) return null;
        if (soi) cout.exileSoi = true; else cout.exileCimetiere = {n, desc: descForge(type || 'Card')};
        break;
      case 'Return':
        if (soi) { if (n !== 1) return null; cout.renvoieSoi = true; break; }
        if (typeof n !== 'number') return null; cout.renvoie = {n, desc: descForge(type || 'Permanent')}; break;
      case 'Reveal': if (typeof n !== 'number') return null; if (!soi) cout.revele = {n, desc: descForge(type || 'Card')}; break;
      case 'PayEnergy': if (!nx) return null; cout.energie = n; break;
      case 'Draw': if (!nx || (type && type !== 'You')) return null; cout.pioche = n; break;
      case 'SubCounter': case 'AddCounter': {
        const g = genreMarqueur(type);
        if (g === 'loyaute') { loyaute = n === 'X' ? 'X' : typeof n === 'number' ? (k[1] === 'AddCounter' ? n : -n) : null; if (loyaute == null) return null; break; }
        /* Poser un marqueur sur la carte elle-même (« put a -1/-1 counter on
           CARDNAME »). Retirer X marqueurs, ou tous. */
        if (k[1] === 'AddCounter') { if (typeof n !== 'number' || m.split('/').length !== 2) return null; cout.ajoute = {genre: g, n}; break; }
        if (!nx && n !== 'All') return null;
        cout.retire = {genre: g, n};
        break;
      }
      case 'tapXType':
        if (!nx) return null;
        cout.engageAutres = {n, desc: descForge(type)};
        break;
      /* Dégager des permanents qu'on contrôle, engagés, pour payer (Halo Fountain). */
      case 'untapYType':
        if (typeof n !== 'number') return null;
        cout.degageAutres = {n, desc: descForge(type)};
        break;
      /* Exiler la carte, ou un permanent qu'on contrôle (« exile a creature you control »). */
      case 'Exile':
        if (soi) { cout.exileSoi = true; break; }
        if (typeof n !== 'number' || !type) return null;
        cout.exileChamp = {n, desc: descForge(type)}; break;
      default: return null;
    }
  }
  cout.mana = manaForge(mana);
  if (!cout.mana) return null;
  return {cout, loyaute};
}

/* Les morceaux de coût de plus (js/jeuCoutsB.js les paie). Rendent faux
   pour une forme qu'on ne sait pas payer. */
const COUTS_B = {
  DamageYou: (c, n) => { c.vie = (c.vie || 0) + n; return true; },
  Mill: (c, n) => { c.meule = n; return true; },
  ExileFromTop: (c, n) => { c.exileDessus = n; return true; },
  /* « You may exile it » : la carte déclenchante, dans son cimetière
     (js/forgeExecute.js `executeForge()` la juge et l'exile). */
  ExileAnyGrave: (c, n, p) => /^Card\.Triggered(New)?Card$/.test(p[1] || '') ? (c.exileDeclencheur = true) : !/Triggered/.test(p[1] || '') && (c.exileTousCim = {n, desc: descForge(p[1] || 'Card')}),
  RemoveAnyCounter: (c, n, p) => (c.retireAny = {n, genre: p[1] && p[1] !== 'Any' ? genreMarqueur(p[1]) : null,
    soi: /^(CARDNAME|NICKNAME|Self)$/.test(p[2] || ''), desc: /^(CARDNAME|NICKNAME|Self)$/.test(p[2] || '') ? null : descForge(p[2] || 'Permanent')}),
  Exert: c => { c.exerce = true; return true; },
  Blight: (c, n) => { c.fletrit = n; return true; },
  CollectEvidence: (c, n) => { c.indices = n; return true; },
  Waterbend: (c, n, p, mana) => { mana.push(String(n)); return true; },
  ExiledMoveToGrave: (c, n, p) => !/ExiledWithSource|Triggered/.test(p[1] || '') && (c.exilVersCim = {n, desc: descForge(p[1] || 'Card')}),
  Behold: (c, n, p) => !/Chosen/.test(p[1] || '') && (c.contemple = {n, desc: descForge(p[1] || 'Card')}),
  PutCardToLibFromGrave: (c, n, p) => (c.versBib = {n, desc: descForge(String(p[2] || 'Card').split(';')[0])}),
  PutCardToLibFromHand: (c, n, p) => (c.mainVersBib = {n, desc: descForge(String(p[2] || 'Card').split(';')[0])}),
};

/* Les morceaux de COUTS_B qui savent une quantité X. */
const X_COUTS_B = ['RemoveAnyCounter', 'Blight', 'CollectEvidence', 'Waterbend', 'ExileFromTop', 'Mill'];

/* `Y`, `Z`, `N` : un « unless … pays » calculé (js/jeuCoutsX.js `coutUnless()`). */
forgeSait('cout', 'Y', 'Z', 'N');
forgeSait('cout', 'T', 'Q', 'Sac', 'PayLife', 'Discard', 'ExileFromHand', 'Mandatory', 'XMin1', 'Forage', ...Object.keys(COUTS_B), 'SubCounter', 'AddCounter', 'tapXType', 'untapYType', 'Exile', 'ExileFromGrave',
  'Return', 'Reveal', 'PayEnergy', 'Draw');

/* Le mana reflété (js/jeuMana.js `manaReflete()`), et le déclencheur de
   mana qui monte sur la pile au lieu de se résoudre tout de suite :
   simplification annoncée. */
forgeSait('api', 'ManaReflected');
forgeSait('param', 'ManaReflected.ColorOrType', 'ManaReflected.Valid', 'ManaReflected.ReflectProperty', 'TapsForMana.Static');
