/* =====================================================================
   js/liaisonSdp.js — Lire une description WebRTC, en rebâtir une

   De la description locale, on ne lit que les champs utiles ; la
   description distante, on la rebâtit d'un gabarit fixe — une session à un
   seul canal de données — avec les champs reçus. On ne touche jamais à une
   description locale : Chrome en abandonne la retouche, Firefox la refuse.
   ===================================================================== */

/* Les champs d'une description locale : ufrag, pwd, empreinte, rôle DTLS,
   et les candidats utilisables sur un réseau local. */
function lisSdpLocal(sdp) {
  const ligne = re => { const m = sdp.match(re); return m ? m[1].trim() : ''; };
  const empreinte = ligne(/a=fingerprint:sha-256 ([0-9A-Fa-f:]+)/).toUpperCase();
  if (!empreinte) throw new Error('empreinte sha-256 introuvable');
  const tous = [];
  sdp.split(/\r?\n/).forEach(l => {
    const m = /^a=candidate:\S+ 1 udp \d+ (\S+) (\d+) typ host/i.exec(l);
    if (m) tous.push({adresse: m[1], port: +m[2]});
  });
  return {ufrag: ligne(/a=ice-ufrag:(\S+)/), pwd: ligne(/a=ice-pwd:(\S+)/), empreinte,
    setup: ligne(/a=setup:(\S+)/) || 'actpass', candidats: choisitCandidats(tous)};
}

/* Les candidats qu'on garde : IPv4 de réseau local d'abord, puis noms mDNS,
   puis IPv6 globale ; jamais 169.254 ni fe80. La boucle locale ne sert que
   faute de mieux — deux onglets d'un même ordinateur. */
function choisitCandidats(tous) {
  const r = [], boucle = [];
  for (const c of tous) {
    const a = c.adresse;
    if (/^\d+\.\d+\.\d+\.\d+$/.test(a)) {
      if (/^169\.254\./.test(a)) continue;
      const v4 = a.split('.').map(Number);
      (v4[0] === 127 ? boucle : r).push({v4, port: c.port, rang: 0});
    } else if (/\.local$/i.test(a)) {
      const hex = a.replace(/\.local$/i, '').replace(/-/g, '');
      if (/^[0-9a-f]{32}$/i.test(hex)) r.push({mdns: hex.match(/../g).map(h => parseInt(h, 16)), port: c.port, rang: 1});
    } else if (a.includes(':') && !/^fe80/i.test(a)) {
      const v6 = ipv6Octets(a);
      if (v6) r.push({v6, port: c.port, rang: 2});
    }
  }
  r.sort((a, b) => a.rang - b.rang);
  return (r.length ? r : boucle).slice(0, 3).map(({rang, ...c}) => c);
}

function ipv6Octets(a) {
  const [g, d] = a.split('::');
  const parts = s => s ? s.split(':') : [];
  const gauche = parts(g), droite = parts(d);
  const tout = d === undefined ? gauche : [...gauche, ...new Array(8 - gauche.length - droite.length).fill('0'), ...droite];
  if (tout.length !== 8) return null;
  return tout.flatMap(h => { const n = parseInt(h || '0', 16); return [n >> 8, n & 255]; });
}

function adresseCandidat(c) {
  if (c.v4) return c.v4.join('.');
  if (c.v6) return c.v6.reduce((s, b, i) => s + (i % 2 ? b.toString(16).padStart(2, '0') : (i ? ':' : '') + b.toString(16)), '');
  const h = c.mdns.map(b => b.toString(16).padStart(2, '0')).join('');
  return `${h.slice(0, 8)}-${h.slice(8, 12)}-${h.slice(12, 16)}-${h.slice(16, 20)}-${h.slice(20)}.local`;
}

/* Rebâtir une description distante. `d.setup` : actpass pour une offre,
   le rôle que l'autre a vraiment pris pour une réponse. */
function sdpDistant(d) {
  const l = ['v=0', 'o=- 1 2 IN IP4 127.0.0.1', 's=-', 't=0 0', 'a=group:BUNDLE 0',
    'm=application 9 UDP/DTLS/SCTP webrtc-datachannel', 'c=IN IP4 0.0.0.0'];
  d.candidats.forEach((c, i) => l.push(`a=candidate:${i + 1} 1 udp ${2122260223 - i * 256} ${adresseCandidat(c)} ${c.port} typ host`));
  if (d.candidats.length) l.push('a=end-of-candidates');
  l.push('a=ice-ufrag:' + d.ufrag, 'a=ice-pwd:' + d.pwd, 'a=fingerprint:sha-256 ' + d.empreinte,
    'a=setup:' + d.setup, 'a=mid:0', 'a=sctp-port:5000', 'a=max-message-size:65536');
  return l.join('\r\n') + '\r\n';
}
