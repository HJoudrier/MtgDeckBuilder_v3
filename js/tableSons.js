/* =====================================================================
   js/tableSons.js — Les sons et les vibrations de la table

   Aucun fichier son : tout est synthétisé par Web Audio, quelques
   oscillateurs et un souffle filtré. Rien à télécharger ni à mettre en
   cache : l'atelier reste un fichier qu'on ouvre. Le navigateur ne joue un
   son qu'après un premier geste ; le contexte naît au premier appel.

   Les vibrations passent par `navigator.vibrate`, qu'Android honore et
   qu'un iPhone ignore. Son, vibrations et mouvements se règlent au menu de
   la table (`S.table`) : le son est coupé au départ, il surprendrait.
   ===================================================================== */

const EFFETS_TABLE = [['son', 'Son'], ['vibre', 'Vibrations'], ['mouvements', 'Mouvements']];
const AUDIO_TABLE = {ctx: null, bruit: null, sortie: null};

function audioTable() {
  const A = AUDIO_TABLE;
  if (!A.ctx) {
    try {
      A.ctx = new (window.AudioContext || window.webkitAudioContext)();
      const comp = A.ctx.createDynamicsCompressor();
      A.sortie = A.ctx.createGain();
      A.sortie.gain.value = .6;
      A.sortie.connect(comp).connect(A.ctx.destination);
      const n = A.ctx.sampleRate;
      A.bruit = A.ctx.createBuffer(1, n, n);
      const d = A.bruit.getChannelData(0);
      for (let i = 0; i < n; i++) d[i] = Math.random() * 2 - 1;
    } catch (e) { A.ctx = null; return null; }
  }
  if (A.ctx.state === 'suspended') A.ctx.resume();
  return A.ctx;
}

/* Une note brève : fréquence de départ, d'arrivée, enveloppe. */
function tonTable({f = 440, f2 = 0, type = 'sine', dur = .15, vol = .3, at = 0}) {
  const A = AUDIO_TABLE, t = A.ctx.currentTime + at, o = A.ctx.createOscillator(), g = A.ctx.createGain();
  o.type = type;
  o.frequency.setValueAtTime(f, t);
  if (f2) o.frequency.exponentialRampToValueAtTime(f2, t + dur);
  g.gain.setValueAtTime(.0001, t);
  g.gain.exponentialRampToValueAtTime(vol, t + .006);
  g.gain.exponentialRampToValueAtTime(.0001, t + dur);
  o.connect(g).connect(A.sortie);
  o.start(t);
  o.stop(t + dur + .05);
}

/* Un souffle : du bruit passé dans un filtre qu'on fait glisser — le
   froissement d'une carte, l'air d'une attaque. */
function souffleTable({dur = .2, vol = .3, at = 0, type = 'bandpass', f = 1200, f2 = 0, q = 1}) {
  const A = AUDIO_TABLE, t = A.ctx.currentTime + at;
  const s = A.ctx.createBufferSource(), fl = A.ctx.createBiquadFilter(), g = A.ctx.createGain();
  s.buffer = A.bruit;
  fl.type = type;
  fl.frequency.setValueAtTime(f, t);
  if (f2) fl.frequency.exponentialRampToValueAtTime(f2, t + dur);
  fl.Q.value = q;
  g.gain.setValueAtTime(.0001, t);
  g.gain.exponentialRampToValueAtTime(vol, t + .012);
  g.gain.exponentialRampToValueAtTime(.0001, t + dur);
  s.connect(fl).connect(g).connect(A.sortie);
  s.start(t, Math.random() * .5);
  s.stop(t + dur + .05);
}

const SONS_TABLE = {
  tic: () => tonTable({f: 1900, dur: .04, vol: .1}),
  cran: () => tonTable({f: 2600, type: 'square', dur: .014, vol: .04}),
  carte: () => souffleTable({dur: .16, vol: .22, f: 2600, f2: 900, q: .8}),
  pose: () => { tonTable({f: 150, f2: 55, dur: .18, vol: .5}); souffleTable({dur: .05, vol: .18, type: 'lowpass', f: 1800}); },
  lance: () => {
    tonTable({f: 520, f2: 1040, type: 'triangle', dur: .28, vol: .14});
    tonTable({f: 780, f2: 1560, dur: .32, vol: .07, at: .04});
    souffleTable({dur: .3, vol: .07, f: 4000, f2: 7000, q: 2});
  },
  resout: () => [523.25, 659.25, 783.99].forEach((f, i) => tonTable({f, dur: .5, vol: .1, at: i * .06})),
  prio: () => { tonTable({f: 659.25, dur: .35, vol: .15}); tonTable({f: 987.77, dur: .55, vol: .11, at: .09}); },
  attaque: () => { souffleTable({dur: .35, vol: .28, f: 600, f2: 3000, q: .7}); tonTable({f: 90, f2: 50, dur: .3, vol: .45, at: .2}); },
  mort: () => { tonTable({f: 300, f2: 70, type: 'sawtooth', dur: .5, vol: .06}); souffleTable({dur: .45, vol: .16, f: 900, f2: 200, q: 1.5}); },
  blesse: () => tonTable({f: 80, f2: 45, dur: .4, vol: .6}),
  tour: () => [196, 392, 588].forEach((f, i) => tonTable({f, dur: 1.6, vol: .13 / (i + 1)})),
  victoire: () => [523.25, 659.25, 783.99, 1046.5].forEach((f, i) => tonTable({f, type: 'triangle', dur: .8, vol: .1, at: i * .12})),
  defaite: () => [392, 349.23, 311.13, 261.63].forEach((f, i) => tonTable({f, type: 'triangle', dur: .7, vol: .09, at: i * .16}))
};

function sonTable(nom) {
  if (!S.table.son || !SONS_TABLE[nom] || !audioTable()) return;
  try { SONS_TABLE[nom](); } catch (e) { /* un son manqué ne doit rien casser */ }
}

/* Les motifs, en millisecondes : vibrer, se taire, vibrer… */
const VIBRATIONS_TABLE = {tic: 8, cran: 5, pose: 14, prio: [20, 70, 20], alerte: [45, 35, 45], blesse: 70, mort: [12, 30, 24],
  tour: 25, valide: [10, 30, 25], victoire: [30, 60, 30, 60, 90]};

function vibreTable(nom) {
  if (!S.table.vibre || VIBRATIONS_TABLE[nom] == null) return;
  try { if (typeof navigator.vibrate === 'function') navigator.vibrate(VIBRATIONS_TABLE[nom]); } catch (e) { /* refusé */ }
}

/* Un effet basculé au menu de la table. Allumer le son le fait entendre :
   c'est aussi le geste qui autorise le navigateur à en jouer. */
function basculeEffet(k) {
  if (!EFFETS_TABLE.some(([x]) => x === k)) return;
  S.table[k] = !S.table[k];
  scheduleSave();
  if (k === 'son' && S.table.son) sonTable('prio');
  if (k === 'vibre' && S.table.vibre) vibreTable('valide');
  renduTable();
}
