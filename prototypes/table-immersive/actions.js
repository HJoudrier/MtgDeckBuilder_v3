/* =====================================================================
   actions.js — Ce que le joueur est en train de faire

   L'état propre à l'interface, que la scène ignore : la carte levée, le
   sort qui attend sa cible, les créatures qu'on s'apprête à envoyer au
   combat. Et l'action principale du moment — ce que ferait « le » bouton,
   quel que soit l'endroit où chaque maquette le met.
   ===================================================================== */

const UI = {sel: null, vise: null, att: new Set(), menu: null, loupe: null, repondre: false, apercu: null, coach: true};

function razUI() {
  Object.assign(UI, {sel: null, vise: null, menu: null, loupe: null, repondre: false, apercu: null});
  UI.att.clear();
}

/* Ce que chaque carte doit savoir pour se peindre. */
function contexte() {
  const E = Scene.E, q = E.question;
  const K = {E, q, jou: new Set(Scene.jouables()), cib: new Set(), elig: new Set(), att: UI.att, sel: UI.sel, vise: UI.vise};
  if (UI.vise) Scene.cibles(UI.vise).forEach(x => K.cib.add(x));
  if (q && q.q === 'attaquants') Scene.attaquantsPossibles().forEach(id => K.elig.add(id));
  return K;
}

/* Après chaque pas de la scène : ce que l'interface retenait n'a plus
   forcément de sens. */
function assainit() {
  const E = Scene.E, jou = Scene.jouables();
  if (UI.sel && !jou.includes(UI.sel)) UI.sel = null;
  if (UI.vise && !jou.includes(UI.vise)) UI.vise = null;
  if (!E.question || E.question.q !== 'attaquants') UI.att.clear();
  if (UI.menu && !Scene.obj(UI.menu)) UI.menu = null;
  if (!E.pile.length) UI.repondre = false;
  const ap = UI.apercu && Scene.obj(UI.apercu);
  if (ap && ap.zone !== 'main') UI.apercu = null;
}

const nomDe = id => { const o = Scene.obj(id); return o ? Scene.def(o).nom : ''; };

function refus(id, raison) {
  son('refus');
  vibre('refus');
  dit(raison || Scene.pourquoiPas(id));
  const el = id && ECRAN.scene.querySelector(`[data-id="${id}"]`);
  if (el) secoue(el, 3);
}

/* Jouer une carte de la main : tout de suite, ou après le choix d'une
   cible. */
function veutJouer(id) {
  const o = Scene.obj(id);
  if (!o) return;
  if (!Scene.jouables().includes(id)) return refus(id);
  UI.sel = null;
  UI.apercu = null;
  if (Scene.def(o).cible) {
    UI.vise = id;
    son('carte');
    repeins();
    return dit(`${Scene.def(o).nom} : touchez une cible qui brille`);
  }
  Scene.joue(id);
}

function choisitCible(t) {
  if (!UI.vise) return false;
  if (!Scene.cibles(UI.vise).includes(t)) { refus(null, 'Cette cible n\'est pas permise.'); return true; }
  const id = UI.vise;
  UI.vise = null;
  Scene.joue(id, t);
  return true;
}

function basculeAtt(id) {
  if (!Scene.attaquantsPossibles().includes(id)) return false;
  if (UI.att.has(id)) UI.att.delete(id); else UI.att.add(id);
  son(UI.att.has(id) ? 'carte' : 'tic');
  vibre('tic');
  repeins();
  return true;
}

function valideAttaque() {
  const ids = [...UI.att];
  UI.att.clear();
  Scene.attaque(ids);
}

/* L'action principale du moment, son libellé, et la phrase qui dit ce
   qu'elle va faire. */
function actionPrincipale() {
  const E = Scene.E;
  if (!E) return {};
  if (E.fin) return {lib: 'Rejouer', act: 'rejouer', sous: Scene.attente()};
  if (UI.vise) return {lib: 'Annuler', act: 'annuleVise', sous: `${nomDe(UI.vise)} : choisissez une cible`};
  if (E.auto) return {lib: 'Garder la main', court: 'Auto', act: 'retiens', auto: true, sous: Scene.apercuPasser()};
  if (E.prio !== 'moi' || !E.question) return {lib: Scene.attente() + '…', attente: true, sous: Scene.apercuPasser()};
  if (E.question.q === 'attaquants') return UI.att.size
    ? {lib: `Attaquer (${UI.att.size})`, act: 'attaque', fort: true, sous: [...UI.att].map(nomDe).join(', ')}
    : {lib: 'Pas d\'attaque', act: 'attaque', sous: 'Touchez les créatures qui attaquent'};
  if (UI.sel) return {lib: 'Jouer', act: 'joueSel', fort: true, sous: nomDe(UI.sel)};
  return {lib: Scene.libellePasser(), act: 'passe', sous: Scene.apercuPasser()};
}

const FAIT = {
  rejouer: () => { razUI(); Scene.nouvelle(); repeins([], true); },
  annuleVise: () => { UI.vise = null; repeins(); },
  retiens: () => Scene.retiens(),
  attaque: valideAttaque,
  joueSel: () => veutJouer(UI.sel),
  passe: () => { vibre('tic'); Scene.passe(); }
};

function faitPrincipale() {
  const a = actionPrincipale();
  if (a.act && FAIT[a.act]) FAIT[a.act]();
}

function toutesAtt() { Scene.attaquantsPossibles().forEach(id => UI.att.add(id)); son('carte'); repeins(); }
function aucuneAtt() { UI.att.clear(); repeins(); }
