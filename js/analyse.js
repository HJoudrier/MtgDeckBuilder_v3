/* =====================================================================
   js/analyse.js — Lire une carte : coût, capacités, déclencheurs, effets

   `analyze()` découpe le texte en capacités, y reconnaît ce qui déclenche et
   ce qui est produit (les règles sont dans js/effets.js), et pose en fin de
   course les deux productions larges que toute carte porte du seul fait
   d'exister — « lancement de sort » pour un sort, « arrivée en jeu » pour une
   permanente.
   ===================================================================== */

function parseCost(cost) {
  if (!cost || cost === '—') return {symbols:[], cmc:0, colors:new Set()};
  const symbols = cost.match(/\{[^}]+\}/g) || [];
  let cmc = 0; const colors = new Set();
  symbols.forEach(s => {
    const inner = s.slice(1, -1);
    if (/^\d+$/.test(inner)) cmc += parseInt(inner, 10);
    else if (inner === 'X') cmc += 0;
    else cmc += 1;
    inner.split('/').forEach(p => { if ('WUBRG'.includes(p)) colors.add(p); });
  });
  return {symbols, cmc, colors};
}

function stripReminder(t) { return t.replace(/\([^)]*\)/g, ' '); }

function splitAbilities(text) {
  return text.split(' // ').map(s => s.trim()).filter(Boolean);
}

function matchAll(rules, s) {
  const out = [];
  for (const r of rules) {
    const c = r[0], re = r.length === 3 ? r[2] : r[1];
    if (re.test(s) && !out.includes(c)) out.push(c);
  }
  return out;
}

function analyze(card) {
  const text = stripReminder(card.text||'').toLowerCase();
  const selfNames = [card.name.toLowerCase(), card.name.toLowerCase().split(',')[0].trim()];
  const isSpell = /instant|sorcery/.test(card.type.toLowerCase());
  const isPermanent = !isSpell && !/^basic land|^land/.test(card.type.toLowerCase().trim());
  const abilities = [];

  splitAbilities(text).forEach(raw => {
    const chunks = raw.split(/(?<=\.)\s+/).map(s => s.trim()).filter(Boolean);
    let ctx = null;
    chunks.forEach(chunk => {
      const inner = chunk.match(/"([^"]+)"/);
      const bodies = inner ? [chunk.replace(/"[^"]+"/,' '), inner[1]] : [chunk];
      bodies.forEach((body, bi) => {
        if (!body || body.length < 3) return;
        const granted = inner && bi === 1;
        const trig = body.match(/^(whenever|when|at the beginning of|as long as)\b/);
        if (trig) {
          const i = coupeDeclencheur(body);
          const tPart = i > 0 ? body.slice(0, i) : body;
          const ePart = i > 0 ? body.slice(i + 1) : '';
          const src = refineTriggers(matchAll(TRIGGER_RULES, tPart), tPart);
          const eff = refineEffects(matchAll(EFFECT_RULES, ePart), ePart);
          const recurring = /^(whenever|at the beginning of)/.test(body);
          const selfRef = (selfNames.some(n => n && tPart.includes(n)) || /this creature|this permanent|this spell/.test(tPart))
                        && !/\banother\b|\bother\b/.test(tPart);
          const q = qualifieDeclencheur(tPart, selfNames);
          if (selfRef) q.portee = 'soi';
          const srcN = (src.length ? src : ['STATIQUE']).map(f =>
            (selfRef && f === 'ETB') ? 'ETB_SOI' : ((selfRef && f === 'MORT') ? 'MORT_SOI' : f));
          ctx = {from:srcN, scope:scopeOf(tPart), kind:granted?'octroyee':'declenchee',
                 hook:recurring && (granted || !selfRef), q, pq:qualifieProduction(ePart, card)};
          if (src.length || eff.length)
            abilities.push({kind:ctx.kind, from:ctx.from, to:eff, scopeTrig:ctx.scope, scopeEff:scopeOf(ePart),
                            text:body, textEff:ePart || body, hook:ctx.hook, q, pq:ctx.pq});
          return;
        }
        const act = body.match(/^([^:]{1,70}):\s*(.+)$/);
        if (act && !/^[a-z ]*enchant /.test(body)) {
          const cost = act[1], eff0 = act[2];
          const couts = coutsDe(cost, selfNames);
          const src = couts.map(c => c.source);
          if (!src.length) src.push('STATIQUE');
          const eff = refineEffects(matchAll(EFFECT_RULES, eff0), eff0);
          const sacOutlet = couts.some(c => c.id === 'SAC_CREATURE');
          const selfSac = couts.some(c => c.id === 'SAC_SOI');
          const q = {portee:'vous', sujet:sacOutlet ? 'creature' : (/discard/.test(cost) ? 'card' : ''), filtres:[], mode:'cout'};
          ctx = {from:src, scope:'self', kind:'activee', hook:false, q, pq:qualifieProduction(eff0, card), couts};
          if (eff.length) abilities.push({kind:'activee', from:src, to:eff, scopeTrig:'self', scopeEff:scopeOf(eff0),
                                         text:body, textEff:eff0, sacOutlet, selfSac, q, pq:ctx.pq, couts});
          return;
        }
        const eff = refineEffects(matchAll(EFFECT_RULES, body), body);
        if (!eff.length) return;
        if (ctx && !/^[a-z ,]*(each|all|creatures you control|equipped|enchanted)/.test(body)) {
          abilities.push({kind:ctx.kind, from:ctx.from, to:eff, scopeTrig:ctx.scope, scopeEff:scopeOf(body),
                          text:body, textEff:body, hook:ctx.hook, q:ctx.q, pq:qualifieProduction(body, card)});
          return;
        }
        ctx = {from:[isSpell ? 'LANCEMENT' : 'STATIQUE'], scope:'self', kind:isSpell ? 'sort' : 'statique', hook:false,
               q:{portee:'vous', sujet:'', filtres:[], mode:isSpell ? 'sort' : 'statique'}};
        abilities.push({kind:ctx.kind, from:ctx.from, to:eff, scopeTrig:'self', scopeEff:scopeOf(body),
                        text:body, textEff:body, hook:false, q:ctx.q, pq:qualifieProduction(body, card)});
      });
    });
  });

  const edges = [];
  abilities.forEach(a => a.from.forEach(f => a.to.forEach(t => {
    if (f === t) return;
    edges.push({from:f, to:t, kind:a.kind, scope:a.scopeTrig, text:a.text, q:a.q, detail:libelleQual(a.q)});
  })));

  const triggers = [], produces = [];
  const qVide = {portee:'vous', jeton:false, force:null, cmc:null, types:[], sorts:[], sujets:[], creature:false};
  const ajouteT = (c, scope, q, mode) => {
    if (c === 'STATIQUE' || c === 'MANA') return;
    triggers.push({c, scope, q:{...(q||{portee:'vous', sujet:'', filtres:[]}), mode:mode||(q && q.mode)||'declencheur'}});
  };
  const ajouteP = (c, scope, q) => produces.push({c, scope, q:{...qVide, ...(q||{})}});

  abilities.forEach(a => {
    const hooks = a.hook
      ? a.from
      : a.from.filter(f => a.kind === 'activee' && (a.couts||[]).some(c => c.exutoire && c.source === f));
    hooks.forEach(f => ajouteT(f, a.scopeTrig, a.q, a.kind === 'activee' ? 'cout' : 'declencheur'));
    (a.couts||[]).forEach(c => { if (c.exutoire) c.consomme.forEach(x => ajouteT(x, 'self', a.q, 'cout')); });
    a.to.forEach(t => ajouteP(t, a.scopeEff, a.pq));
    (a.couts||[]).forEach(c => {
      if (c.id === 'SAC_SOI' && !/creature/i.test(card.type)) return;
      c.produit.forEach(x => ajouteP(x, 'self', c.id === 'SAC_CREATURE' ? {types:['creature']} : {force:card.force, cmc:card.cmc}));
    });
  });

  if (isPermanent) ajouteP('ETB', 'self', {jeton:false, force:card.force, cmc:card.cmc,
    types:card.sousTypes||[], sujets:card.typesSort||[], creature:!!card.isCreature});

  /* `intrinseque` : cette production n'est pas un effet, c'est la carte elle-même
     qui est lançable. Ses sous-types sont donc connus et complets — un déclencheur
     restreint à un sous-type peut l'écarter sans hésiter, là où une production
     d'effet laisse ignorer ce qui sera lancé (`compat()`, js/effets.js). */
  if (!card.isLand && !card.isToken)
    ajouteP('LANCEMENT', 'self', {jeton:false, cmc:card.cmc, sorts:card.typesSort||[],
      types:card.sousTypes||[], sujets:card.typesSort||[], force:card.force,
      creature:!!card.isCreature, intrinseque:true});

  return {abilities, edges, triggers, produces, isSpell, isPermanent};
}
