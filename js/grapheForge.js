/* =====================================================================
   js/grapheForge.js — Lire le graphe d'une carte dans son script de Forge

   Forge ne relie pas les cartes entre elles : chaque script décrit une carte
   seule. Ce qu'il donne, ce sont des extrémités de lien déjà rangées — ce
   qu'une capacité écoute, ce qu'elle produit, à quelles conditions. On les
   lit ici dans la forme de `capacitesTexte()` (js/analyse.js), si bien que
   `assembleAnalyse()`, le croisement (js/synergies.js), la notation et le
   graphe ne savent pas d'où vient une capacité.

   On lit les tables brutes, non les définitions du moteur : le moteur écarte
   une unité entière dès qu'un élément lui manque, le graphe n'exécute rien et
   peut tout lire. Une unité — capacité, déclencheur, statique, remplacement —
   dont un élément est inconnu des tables (js/grapheForgeTables.js) est relue
   dans sa description, par la lecture du texte : la carte ne perd rien.
   ===================================================================== */

/* Le graphe d'une carte d'après son script (texte brut ou déjà lu). `opts.jeton`
   rend le script d'un jeton d'après son nom, quand on l'a. */
function analyseForge(card, script, opts) {
  const s = typeof script === 'string' ? lisScriptForge(script) : script;
  if (!s || !s.faces.length) return null;
  const ctx = {card, inconnus: [], replis: 0, jeton: (opts && opts.jeton) || null, profondeur: 0};
  const out = [];
  s.faces.forEach(face => {
    face.k.forEach(k => motCleGraphe(k, face, ctx, out));
    face.a.forEach(t => capaciteJoueeForge(t, face, ctx, out, false));
    face.t.forEach(t => declencheurGraphe(t, face, ctx, out, false));
    face.s.forEach(t => statiqueGraphe(t, face, ctx, out));
    face.r.forEach(t => remplacementGraphe(t, face, ctx, out));
  });
  return Object.assign(assembleAnalyse(card, out), {source: 'forge', inconnus: ctx.inconnus, replis: ctx.replis});
}

function listeGraphe(v, sep) {
  return String(v || '').split(sep || /\s*&\s*|,/).map(x => x.trim()).filter(Boolean);
}

/* Une unité en cours de lecture : ce qu'elle ne sait pas lire, les capacités
   qu'elle accorde en chemin, les jetons qu'elle crée, et si ce qu'elle
   récupère revient en jeu. */
/* Une capacité qui en accorde une qui l'accorde à son tour ne finirait pas :
   au-delà de six unités imbriquées, on cesse de descendre. */
function uniteForge(ctx) {
  ctx.profondeur++;
  return {inconnu: [], out: [], jetons: [], jeton: ctx.jeton, enJeu: undefined, couts: [], coutsBruts: []};
}

/* Fermer une unité. Si un élément est inconnu, sa description est relue
   dans le texte et ce qu'on en avait tiré s'efface ; sinon sa capacité et
   celles qu'elle accorde rejoignent la carte. */
function fermeUnite(u, ctx, out, desc, capacite) {
  ctx.profondeur--;
  if (u.inconnu.length) {
    ctx.inconnus.push(...u.inconnu);
    ctx.replis++;
    if (desc) capacitesTexte(ctx.card, desc).forEach(a => out.push({...a, repli: true}));
    return;
  }
  if (capacite) out.push(capacite);
  out.push(...u.out);
}

/* Une chaîne d'effets : la table, ses `SubAbility$`, et tout ce qu'elle
   ouvre — les modes d'un charme, ce qu'un effet retardé exécutera, les
   statiques et déclencheurs d'un `Effect` ou d'une animation. Rend les nœuds
   produits, et si l'un des effets se tourne vers l'adversaire. Le coût d'une
   table intérieure (« you may sacrifice a creature. If you do… ») est noté
   dans l'unité : il fait un exutoire comme un coût d'activation. Celui de la
   table de tête, quand `racine`, est le coût de la capacité, lu à part. */
function chaineForge(t0, face, ctx, u, racine) {
  const r = {to: [], adv: false, textes: [], masse: false, affaiblit: false, sacTable: false, destructifs: 0, surSoi: 0};
  const vu = new Set();
  const sous = nom => {
    if (!nom || vu.has(nom)) return null;
    vu.add(nom);
    return forgeSousCapacite(face, nom);
  };
  const lis = t => {
    if (!t) return;
    const api = forgeApi(t);
    if (!api) return;
    const e = GF_EFFETS[api];
    if (e === undefined) u.inconnu.push('api:' + api);
    else {
      const n = typeof e === 'function' ? e(t, u) : e;
      if (n.includes('RECURSION') && /^ChangeZone/.test(api)) u.enJeu = zonesForge(t.Destination).includes('Battlefield');
      r.to.push(...n);
      if (t !== t0 && t.SpellDescription) r.textes.push(t.SpellDescription);
      Object.assign(r, masseForge(api, t, r, n));
      /* « À moins que ce joueur ne paie {1} » : du mana que paie un autre
         que soi est une taxe. */
      if (/^[\dXWUBRGC ]+$/.test(t.UnlessCost || '') && t.UnlessPayer && !/^You$/.test(t.UnlessPayer)) r.to.push('TAXE');
      if (n.length && versAdversaireForge(t)) r.adv = true;
    }
    if (t.Cost && !(racine && t === t0)) {
      u.couts.push(...coutsGrapheForge(t.Cost).filter(c => c.id !== 'MANA'));
      u.coutsBruts.push(t.Cost);
    }
    if (api === 'Effect' || api === 'Animate' || api === 'AnimateAll') {
      listeGraphe(t.StaticAbilities || t.staticAbilities).forEach(nom => r.to.push(...noeudsStatique(forgeTable(face.svars[nom]), face, ctx, u)));
      listeGraphe(t.Triggers).forEach(nom => declencheurGraphe(forgeTable(face.svars[nom]), face, ctx, u.out, true));
      listeGraphe(t.Abilities).forEach(nom => capaciteJoueeForge(forgeTable(face.svars[nom]), face, ctx, u.out, true));
    }
    if (api === 'Charm' || api === 'GenericChoice') listeGraphe(t.Choices, ',').forEach(n => lis(sous(n)));
    if (api === 'DelayedTrigger' || api === 'ImmediateTrigger') lis(sous(t.Execute));
    /* Toutes les branches : `SubAbility$`, et les `RepeatSubAbility$`,
       `TrueSubAbility$`, `WinSubAbility$`… d'une répétition, d'une
       condition, d'un affrontement. */
    Object.keys(t).filter(k => /SubAbility$/.test(k)).forEach(k => lis(sous(t[k])));
  };
  lis(t0);
  r.to = affineChaineForge(r.to);
  return r;
}

/* Un exil suivi d'un retour en jeu est un blink, quelle que soit la
   distance entre les deux dans la chaîne ; un exil seul reste un exil, un
   retour seul — celui de l'anneau d'oubli — ne nourrit rien chez nous. */
function affineChaineForge(to) {
  let l = [...to];
  if (l.includes('~EXIL_JEU') && l.includes('~RETOUR')) l.push('BLINK');
  l = l.map(x => x === '~EXIL_JEU' ? 'EXIL' : x).filter(x => x !== '~RETOUR');
  if (l.includes('BLINK')) l = l.filter(x => x !== 'EXIL' && x !== 'RECURSION' && x !== 'BOUNCE');
  if (l.includes('RAMP')) l = l.filter(x => x !== 'TUTEUR');
  return [...new Set(l)];
}

const GF_SOI = {ETB: 'ETB_SOI', MORT: 'MORT_SOI', LANCEMENT: 'LANCEMENT_SOI'};

/* Un déclencheur, ou un déclencheur accordé (`octroyee`) par une statique ou
   un effet. Comme dans la lecture du texte, il n'est une prise pour les
   autres cartes que s'il revient (« whenever », « at ») et ne porte pas
   seulement sur la carte elle-même — sauf accordé, qu'une autre porte. */
function declencheurGraphe(t, face, ctx, out, octroyee) {
  if (!t || !t.Mode || ctx.profondeur > 6) return;
  const desc = texteGrapheForge(t.TriggerDescription, ctx.card);
  const u = uniteForge(ctx);
  const e = GF_DECLENCHEURS[t.Mode];
  if (e === undefined) u.inconnu.push('trig:' + t.Mode);
  const q = qDeclencheurForge(t);
  const soi = q.portee === 'soi';
  const depuis = (e === undefined ? [] : typeof e === 'function' ? e(t) : e).map(f => soi ? (GF_SOI[f] || f) : f);
  const ch = chaineForge(forgeSousCapacite(face, t.Execute), face, ctx, u);
  const corps = desc.replace(/^[^—]{1,40}—\s*/, '');
  const i = coupeDeclencheur(corps);
  const capacite = (depuis.length || ch.to.length) ? {
    kind: octroyee ? 'octroyee' : 'declenchee', from: depuis.length ? depuis : ['STATIQUE'], to: ch.to,
    ...rolesForge(ch),
    scopeTrig: q.portee === 'adversaire' ? 'adv' : 'self', scopeEff: ch.adv ? 'adv' : 'self',
    text: desc, textEff: i > 0 ? corps.slice(i + 1).trim() : corps,
    hook: !/^when\b/.test(corps) && (octroyee || !soi), q, pq: pqForge(u, ch.adv)} : null;
  if (capacite && u.couts.length) {
    const qc = qualifCoutForge(u.coutsBruts.join(' '));
    Object.assign(capacite, {couts: u.couts, qCout: {portee: 'vous', sujet: qc.sujet, filtres: qc.filtres, mode: 'cout'}});
  }
  fermeUnite(u, ctx, out, desc, capacite);
}

/* Un sort ou une capacité activée (ou accordée). Ce que coûte une capacité
   dit ce qui la déclenche : engager, sacrifier, défausser — la table `COUTS`
   de la lecture du texte, pour que l'exutoire consomme la même chose. Le coût
   supplémentaire d'un sort compte aussi : « sacrifiez une créature » en fait
   un exutoire. */
function capaciteJoueeForge(t, face, ctx, out, octroyee) {
  const api = t && forgeApi(t);
  if (!api || ctx.profondeur > 6) return;
  const sort = !!t.SP;
  if (sort && /^(Attach|PermanentCreature|PermanentNoncreature)$/.test(api)) return;
  const u = uniteForge(ctx);
  const ch = chaineForge(t, face, ctx, u, true);
  /* Un charme n'a pas de description à lui : ce sont ses modes qui parlent, et
     c'est leur texte que les rôles liront (« détruisez toutes les créatures »). */
  const desc = texteGrapheForge(t.SpellDescription || ch.textes.join(' ') || t.StackDescription, ctx.card);
  const couts = coutsGrapheForge(t.Cost).filter(c => !(sort && c.id === 'MANA')).concat(u.couts);
  const sac = couts.some(c => c.id === 'SAC_CREATURE'), sacSoi = couts.some(c => c.id === 'SAC_SOI');
  const qc = qualifCoutForge(t.Cost);
  let capacite = null;
  /* Un exutoire reste un exutoire même quand on ne sait pas ce qu'il produit :
     « {R}, sacrifiez un artefact : la créature ciblée ne peut pas bloquer ». */
  if (ch.to.length || couts.some(c => c.exutoire)) {
    const from = sort ? ['LANCEMENT'] : couts.map(c => c.source);
    if (!from.length) from.push('STATIQUE');
    capacite = {kind: sort ? 'sort' : 'activee', from: [...new Set(from)], to: ch.to, scopeTrig: 'self',
      ...rolesForge(ch),
      scopeEff: ch.adv ? 'adv' : 'self', text: desc, textEff: desc, hook: false, sacOutlet: sac, selfSac: sacSoi,
      q: {portee: 'vous', sujet: qc.sujet || (couts.some(c => c.id === 'DEFAUSSER') ? 'card' : ''),
        filtres: qc.filtres, mode: sort ? 'sort' : 'cout'},
      pq: pqForge(u, ch.adv), couts};
    if (octroyee) capacite.octroyee = true;
  }
  fermeUnite(u, ctx, out, desc, capacite);
}

/* Les nœuds d'une statique. `Continuous` donne des mots-clés, de la force,
   la permission de jouer depuis une zone, et des capacités entières, lues
   chacune comme une unité accordée. */
function noeudsStatique(t, face, ctx, u) {
  if (!t || !t.Mode) return [];
  /* Un même `Mode$` peut en nommer plusieurs : `CantAttack,CantBlock`. */
  return listeGraphe(t.Mode, ',').flatMap(mode => {
    if (mode === 'Continuous') return noeudsContinue(t, face, ctx, u);
    const e = GF_STATIQUES[mode];
    if (e === undefined) { u.inconnu.push('stat:' + mode); return []; }
    return typeof e === 'function' ? e(t) : e;
  });
}

function noeudsContinue(t, face, ctx, u) {
  const n = noeudsMotsClesDonnes(t.AddKeyword);
  if (t.AddPower || t.AddToughness) n.push('BOOST');
  if (t.MayPlay) {
    const z = t.AffectedZone || '';
    if (/Graveyard/.test(z)) n.push('RECURSION');
    else if (/Library|Exile/.test(z)) n.push('IMPULSE');
  }
  if (t.GainControl) n.push('GAIN_CONTROLE');
  listeGraphe(t.AddTrigger).forEach(nom => declencheurGraphe(forgeTable(face.svars[nom]), face, ctx, u.out, true));
  listeGraphe(t.AddAbility).forEach(nom => capaciteJoueeForge(forgeTable(face.svars[nom]), face, ctx, u.out, true));
  listeGraphe(t.AddStaticAbility).forEach(nom => statiqueGraphe(forgeTable(face.svars[nom]), face, ctx, u.out));
  return n;
}

function statiqueGraphe(t, face, ctx, out) {
  if (!t || !t.Mode || ctx.profondeur > 6) return;
  const desc = texteGrapheForge(t.Description, ctx.card);
  const u = uniteForge(ctx);
  const n = [...new Set(noeudsStatique(t, face, ctx, u))];
  const adv = /OppCtrl|Opponent/.test(t.Affected || t.ValidCard || '');
  const capacite = n.length ? {kind: 'statique', from: ['STATIQUE'], to: n, scopeTrig: 'self', scopeEff: adv ? 'adv' : 'self',
    text: desc, textEff: desc, hook: false, q: {portee: 'vous', sujet: '', filtres: [], mode: 'statique'}, pq: pqForge(u, adv)} : null;
  fermeUnite(u, ctx, out, desc, capacite);
}

/* Un remplacement. Ceux qui amplifient — doubler les jetons, ajouter un
   marqueur, augmenter des blessures — se nourrissent de ce qu'ils
   amplifient : la lecture du texte n'en voyait que la production, quand
   elle la voyait. */
function remplacementGraphe(t, face, ctx, out) {
  if (!t || !t.Event) return;
  const desc = texteGrapheForge(t.Description, ctx.card);
  const u = uniteForge(ctx);
  const ch = chaineForge(forgeSousCapacite(face, t.ReplaceWith), face, ctx, u);
  const e = GF_REMPLACEMENTS[t.Event];
  if (e === undefined) u.inconnu.push('repl:' + t.Event);
  const r = e ? e(t, ch.to, forgeSousCapacite(face, t.ReplaceWith)) : {nourri: [], to: ch.to};
  const objet = t.ValidCard || t.ValidToken || t.ValidSource || t.ValidPlayer || '';
  const q0 = objet ? qualifieValideForge(objet, false) : {portee: 'tous', sujet: '', filtres: []};
  const capacite = (r.nourri.length || r.to.length) ? {kind: 'remplacement', from: r.nourri.length ? r.nourri : ['STATIQUE'],
    to: r.to, scopeTrig: 'self', scopeEff: ch.adv ? 'adv' : 'self', text: desc, textEff: desc, hook: r.nourri.length > 0,
    q: {portee: q0.portee === 'soi' ? 'vous' : q0.portee, sujet: q0.sujet, filtres: q0.filtres, mode: 'declencheur'},
    pq: pqForge(u, ch.adv)} : null;
  fermeUnite(u, ctx, out, desc, capacite);
}

/* Un mot-clé. Les chapitres d'une saga et les « en entrant » renvoient à des
   SVars, lues comme des chaînes ; un mot-clé inconnu est relu dans le texte,
   comme le fait la lecture de l'oracle, qui ne voit que son nom. */
function motCleGraphe(k, face, ctx, out) {
  const nom = nomMotCleForge(k), morceaux = k.split(':');
  const base = {scopeTrig: 'self', scopeEff: 'self', text: k.toLowerCase(), textEff: k.toLowerCase()};
  if (nom === 'Chapter' || nom === 'ETBReplacement') {
    const noms = nom === 'Chapter' ? listeGraphe(morceaux[2], ',') : [morceaux[2]];
    noms.forEach(n => {
      const u = uniteForge(ctx);
      const ch = chaineForge(forgeSousCapacite(face, n), face, ctx, u);
      const to = morceaux[1] === 'Copy' ? [...new Set(['COPIE', ...ch.to])] : ch.to;
      const capacite = to.length ? {...base, kind: nom === 'Chapter' ? 'declenchee' : 'statique',
        from: [nom === 'Chapter' ? 'CHAPITRE_SAGA' : 'STATIQUE'], to, hook: false, scopeEff: ch.adv ? 'adv' : 'self',
        q: {portee: 'soi', sujet: '', filtres: [], mode: 'declencheur'}, pq: pqForge(u, ch.adv)} : null;
      fermeUnite(u, ctx, out, '', capacite);
    });
    return;
  }
  /* Un niveau de classe accorde ce qu'une statique accorderait : `K:Class:2:W
     U:AddTrigger$ TriggerClassLevel`. */
  if (nom === 'Class') {
    statiqueGraphe({Mode: 'Continuous', ...forgeTable(morceaux.slice(3).join(':'))}, face, ctx, out);
    return;
  }
  if (nom === 'Contrainte') return;
  const e = nom === 'etbCounter' ? {to: [noeudMarqueur(morceaux[1])]} : GF_MOTS_CLES[nom];
  if (!e) {
    capacitesTexte(ctx.card, nom).forEach(a => out.push({...a, repli: true}));
    return;
  }
  const vide = {jetons: [], enJeu: undefined};
  if (e.from) out.push({...base, kind: 'declenchee', from: e.from, to: e.to, scopeEff: e.adv ? 'adv' : 'self', hook: !e.soi,
    q: {...(e.q || {portee: e.soi ? 'soi' : 'vous', sujet: '', filtres: []}), mode: 'declencheur'}, pq: pqForge(vide, e.adv)});
  else if (e.to.length || e.couts) out.push({...base, kind: 'statique', from: ['STATIQUE'], to: e.to, hook: false,
    q: {portee: 'vous', sujet: e.sujet || '', filtres: [], mode: 'statique'}, pq: pqForge(vide, false),
    couts: (e.couts || []).map(id => COUTS.find(c => c.id === id)).filter(Boolean)});
}
