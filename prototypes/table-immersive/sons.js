/* =====================================================================
   sons.js — Les sons et les vibrations

   Aucun fichier son : tout est synthétisé par Web Audio, quelques
   oscillateurs et un souffle filtré. Rien à télécharger, rien à mettre en
   cache, et l'atelier reste un fichier qu'on ouvre. Le navigateur ne joue
   un son qu'après un premier geste : le contexte naît au premier appel.

   Les vibrations passent par `navigator.vibrate`, qu'Android honore et
   qu'iPhone ignore. Chacune est aussi montrée à l'écran (`temoinVibration`) :
   sans téléphone qui vibre, on voit au moins où elle tomberait.
   ===================================================================== */

const REGLAGES = {
  son: false,
  vibre: true,
  reduit: !!(window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches)
};

let AC = null, BRUIT = null, SORTIE = null;

function audio() {
  if (!AC) {
    try {
      AC = new (window.AudioContext || window.webkitAudioContext)();
      const comp = AC.createDynamicsCompressor();
      SORTIE = AC.createGain();
      SORTIE.gain.value = .6;
      SORTIE.connect(comp).connect(AC.destination);
      const n = AC.sampleRate;
      BRUIT = AC.createBuffer(1, n, n);
      const d = BRUIT.getChannelData(0);
      for (let i = 0; i < n; i++) d[i] = Math.random() * 2 - 1;
    } catch (e) { AC = null; return null; }
  }
  if (AC.state === 'suspended') AC.resume();
  return AC;
}

/* Une note : fréquence de départ, d'arrivée, enveloppe brève. */
function ton({f = 440, f2 = 0, type = 'sine', dur = .15, vol = .3, at = 0, att = .006}) {
  const t = AC.currentTime + at, o = AC.createOscillator(), g = AC.createGain();
  o.type = type;
  o.frequency.setValueAtTime(f, t);
  if (f2) o.frequency.exponentialRampToValueAtTime(f2, t + dur);
  g.gain.setValueAtTime(.0001, t);
  g.gain.exponentialRampToValueAtTime(vol, t + att);
  g.gain.exponentialRampToValueAtTime(.0001, t + dur);
  o.connect(g).connect(SORTIE);
  o.start(t);
  o.stop(t + dur + .05);
}

/* Un souffle : du bruit blanc passé dans un filtre qu'on fait glisser.
   C'est le froissement d'une carte, l'air d'une attaque. */
function souffle({dur = .2, vol = .3, at = 0, type = 'bandpass', f = 1200, f2 = 0, q = 1}) {
  const t = AC.currentTime + at, s = AC.createBufferSource(), fl = AC.createBiquadFilter(), g = AC.createGain();
  s.buffer = BRUIT;
  fl.type = type;
  fl.frequency.setValueAtTime(f, t);
  if (f2) fl.frequency.exponentialRampToValueAtTime(f2, t + dur);
  fl.Q.value = q;
  g.gain.setValueAtTime(.0001, t);
  g.gain.exponentialRampToValueAtTime(vol, t + .012);
  g.gain.exponentialRampToValueAtTime(.0001, t + dur);
  s.connect(fl).connect(g).connect(SORTIE);
  s.start(t, Math.random() * .5);
  s.stop(t + dur + .05);
}

const SONS = {
  tic: () => ton({f: 1900, dur: .04, vol: .1}),
  cran: () => ton({f: 2600, type: 'square', dur: .014, vol: .04}),
  carte: () => souffle({dur: .16, vol: .22, f: 2600, f2: 900, q: .8}),
  pose: () => { ton({f: 150, f2: 55, dur: .18, vol: .5}); souffle({dur: .05, vol: .18, type: 'lowpass', f: 1800}); },
  lance: () => {
    ton({f: 520, f2: 1040, type: 'triangle', dur: .28, vol: .14});
    ton({f: 780, f2: 1560, dur: .32, vol: .07, at: .04});
    souffle({dur: .3, vol: .07, f: 4000, f2: 7000, q: 2});
  },
  resout: () => [523.25, 659.25, 783.99].forEach((f, i) => ton({f, dur: .5, vol: .1, at: i * .06})),
  prio: () => { ton({f: 659.25, dur: .35, vol: .15}); ton({f: 987.77, dur: .55, vol: .11, at: .09}); },
  attaque: () => { souffle({dur: .35, vol: .28, f: 600, f2: 3000, q: .7}); ton({f: 90, f2: 50, dur: .3, vol: .45, at: .2}); },
  bloque: () => { ton({f: 220, f2: 180, type: 'square', dur: .08, vol: .06}); souffle({dur: .08, vol: .14, type: 'highpass', f: 3000}); },
  impact: () => { ton({f: 120, f2: 40, dur: .25, vol: .55}); souffle({dur: .12, vol: .3, type: 'lowpass', f: 2500, f2: 300}); },
  mort: () => { ton({f: 300, f2: 70, type: 'sawtooth', dur: .5, vol: .06}); souffle({dur: .45, vol: .16, f: 900, f2: 200, q: 1.5}); },
  blesse: () => ton({f: 80, f2: 45, dur: .4, vol: .6}),
  tour: () => [196, 392, 588].forEach((f, i) => ton({f, dur: 1.6, vol: .13 / (i + 1), att: .01})),
  refus: () => { ton({f: 180, type: 'square', dur: .07, vol: .05}); ton({f: 150, type: 'square', dur: .09, vol: .05, at: .09}); },
  bonus: () => [440, 554.37, 659.25, 880].forEach((f, i) => ton({f, type: 'triangle', dur: .18, vol: .07, at: i * .04})),
  malus: () => [440, 415.3, 349.23].forEach((f, i) => ton({f, type: 'triangle', dur: .2, vol: .07, at: i * .06})),
  victoire: () => [523.25, 659.25, 783.99, 1046.5].forEach((f, i) => ton({f, type: 'triangle', dur: .8, vol: .1, at: i * .12})),
  defaite: () => [392, 349.23, 311.13, 261.63].forEach((f, i) => ton({f, type: 'triangle', dur: .7, vol: .09, at: i * .16})),
  etape: () => ton({f: 1250, dur: .05, vol: .035})
};

function son(nom) {
  if (!REGLAGES.son || !SONS[nom] || !audio()) return;
  try { SONS[nom](); } catch (e) { /* un son manqué ne doit rien casser */ }
}

/* Les motifs, en millisecondes : vibrer, se taire, vibrer… */
const VIBRATIONS = {
  tic: 8, cran: 5, pose: 14, prio: [20, 70, 20], alerte: [45, 35, 45], blesse: 70, mort: [12, 30, 24],
  refus: [14, 45, 14], tour: 25, valide: [10, 30, 25], victoire: [30, 60, 30, 60, 90]
};

const NOMS_VIBRATIONS = {
  tic: 'toucher', cran: 'cran', pose: 'carte posée', prio: 'à vous', alerte: 'on vous attaque', blesse: 'vous perdez des points de vie',
  mort: 'créature détruite', refus: 'refus', tour: 'votre tour', valide: 'validé', victoire: 'fin de partie'
};

function vibre(nom) {
  if (!REGLAGES.vibre || VIBRATIONS[nom] == null) return;
  let ok = false;
  try { ok = typeof navigator.vibrate === 'function' && navigator.vibrate(VIBRATIONS[nom]); } catch (e) { ok = false; }
  if (typeof temoinVibration === 'function') temoinVibration(nom, VIBRATIONS[nom], ok);
}
