/* =====================================================================
   js/liaison.js — Deux navigateurs reliés sans serveur

   Une connexion WebRTC par invité, sans aucun serveur : ni signalisation,
   ni STUN, ni TURN (`iceServers: []`). Les descriptions passent par les
   deux QR (js/liaisonCode.js), les appareils doivent donc être sur le même
   réseau local. Le canal de données est négocié d'avance (`id: 0`) des deux
   côtés, si bien que la description n'a qu'une section à décrire.

   Exception assumée à la règle de l'aiguillage unique : les écouteurs posés
   sur la connexion et le canal. Ce ne sont pas des éléments de la page, et
   leurs évènements ne passent par aucun clic.

   Les messages sont du JSON ; un message long est découpé en morceaux de
   seize kilo-octets, recollés à l'arrivée — un deck de cent fiches dépasse
   ce que tous les navigateurs acceptent d'un seul tenant.
   ===================================================================== */

const MORCEAU = 16000;

function nouvelleConnexion() {
  const pc = new RTCPeerConnection({iceServers: []});
  const dc = pc.createDataChannel('jeu', {negotiated: true, id: 0, ordered: true});
  return {pc, dc};
}

/* Attendre la fin de la collecte des candidats, deux secondes au plus : sans
   serveur il n'y a que des candidats locaux, qui viennent en un instant. */
function collecteFinie(pc, ms = 2000) {
  return new Promise(ok => {
    if (pc.iceGatheringState === 'complete') return ok();
    const fin = setTimeout(ok, ms);
    pc.addEventListener('icegatheringstatechange', () => { if (pc.iceGatheringState === 'complete') { clearTimeout(fin); ok(); } });
  });
}

/* L'hôte : une offre, et ce qu'il faut en mettre dans le QR. */
async function creeOffre(jeton) {
  const c = nouvelleConnexion();
  await c.pc.setLocalDescription(await c.pc.createOffer());
  await collecteFinie(c.pc);
  const info = lisSdpLocal(c.pc.localDescription.sdp);
  return {...c, paquet: empaquette({...info, setup: 'actpass', jeton})};
}

/* L'invité : répondre à une offre lue dans un QR. La réponse ne garde qu'un
   candidat : l'hôte apprend de toute façon l'adresse de l'invité par ses
   vérifications, mais un candidat lui permet d'écrire le premier, ce qui
   ouvre le pare-feu de Windows. */
async function repondOffre(offre) {
  const c = nouvelleConnexion();
  await c.pc.setRemoteDescription({type: 'offer', sdp: sdpDistant({...offre, setup: 'actpass'})});
  await c.pc.setLocalDescription(await c.pc.createAnswer());
  await collecteFinie(c.pc);
  const info = lisSdpLocal(c.pc.localDescription.sdp);
  return {...c, paquet: empaquette({...info, candidats: info.candidats.slice(0, 1), jeton: offre.jeton})};
}

/* L'hôte : appliquer la réponse d'un invité. */
async function appliqueReponse(pc, rep) {
  await pc.setRemoteDescription({type: 'answer', sdp: sdpDistant(rep)});
}

/* Un canal de messages au-dessus du canal de données : envoyer, recevoir,
   savoir si l'autre est encore là. `surMessage(msg)`, `surEtat(etat)` —
   `ouvert`, `absent` (plus de nouvelles depuis huit secondes), `perdu`. */
function canal(c, surMessage, surEtat) {
  const k = {c, dernier: Date.now(), morceaux: new Map(), etat: 'attente', ping: null};
  const etat = e => { if (k.etat !== e) { k.etat = e; surEtat(e); } };
  k.envoie = msg => {
    if (c.dc.readyState !== 'open') return false;
    const s = JSON.stringify(msg);
    if (s.length <= MORCEAU) { c.dc.send(s); return true; }
    const id = Math.random().toString(36).slice(2, 8), n = Math.ceil(s.length / MORCEAU);
    for (let i = 0; i < n; i++) c.dc.send(JSON.stringify({t: 'morceau', id, i, n, s: s.slice(i * MORCEAU, (i + 1) * MORCEAU)}));
    return true;
  };
  c.dc.addEventListener('open', () => {
    k.dernier = Date.now(); etat('ouvert');
    k.ping = setInterval(() => {
      k.envoie({t: 'ping'});
      if (Date.now() - k.dernier > 8000) etat('absent');
    }, 2000);
  });
  c.dc.addEventListener('message', ev => {
    k.dernier = Date.now();
    if (k.etat === 'absent') etat('ouvert');
    let m;
    try { m = JSON.parse(ev.data); } catch (e) { return; }
    if (m.t === 'ping') return;
    if (m.t === 'morceau') {
      const t = k.morceaux.get(m.id) || [];
      t[m.i] = m.s; k.morceaux.set(m.id, t);
      if (t.filter(x => x != null).length < m.n) return;
      k.morceaux.delete(m.id);
      try { m = JSON.parse(t.join('')); } catch (e) { return; }
    }
    surMessage(m);
  });
  const fin = () => { clearInterval(k.ping); etat('perdu'); };
  c.dc.addEventListener('close', fin);
  c.pc.addEventListener('connectionstatechange', () => { if (c.pc.connectionState === 'failed') fin(); });
  k.ferme = () => { clearInterval(k.ping); try { c.dc.close(); c.pc.close(); } catch (e) { /* déjà fermé */ } };
  return k;
}

/* Un jeton de siège, tiré au sort : il dit à l'hôte quelle réponse va avec
   quel siège, et permet à un invité de reprendre sa place. */
function jetonNeuf() {
  const t = new Uint8Array(4);
  crypto.getRandomValues(t);
  return [...t];
}
