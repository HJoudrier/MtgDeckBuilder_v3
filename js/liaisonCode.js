/* =====================================================================
   js/liaisonCode.js — Ce que les deux QR codes transportent, au plus court

   WebRTC a besoin que chaque appareil connaisse de l'autre quatre choses :
   son identifiant et son mot de passe ICE, l'empreinte de son certificat,
   et une adresse où le joindre. Sans serveur, elles voyagent dans des QR :
   on ne garde donc que ces champs, empaquetés en binaire — les caractères
   ICE sont ceux de base64, six bits chacun ; l'empreinte, trente-deux
   octets ; une adresse IPv4, six octets avec son port.

   L'offre de l'hôte voyage dans une adresse (base64url, que l'appareil
   photo d'un téléphone ouvre) ; la réponse de l'invité en base45 — les
   quarante-cinq signes du mode alphanumérique d'un QR, et ce que le
   détecteur natif rend sans l'abîmer — ou, sans caméra, en base32 à taper.
   ===================================================================== */

const B64 = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';

function ecrivain() {
  const o = [];
  return {o, u8: v => o.push(v & 255), u16: v => { o.push((v >> 8) & 255, v & 255); },
    octets: t => t.forEach(v => o.push(v)),
    ice: s => {
      o.push(s.length);
      let acc = 0, n = 0;
      for (const c of s) { acc = (acc << 6) | B64.indexOf(c); n += 6; while (n >= 8) { n -= 8; o.push((acc >> n) & 255); } }
      if (n) o.push((acc << (8 - n)) & 255);
    }};
}

function lecteur(o) {
  let i = 0;
  const r = {fin: () => i >= o.length, u8: () => o[i++], u16: () => (o[i++] << 8) | o[i++], octets: n => Array.from(o.slice(i, i += n)),
    ice: () => {
      const n = o[i++], octets = Math.ceil(n * 6 / 8);
      let acc = 0, bits = 0, s = '';
      for (let k = 0; k < octets; k++) {
        acc = (acc << 8) | o[i++]; bits += 8;
        while (bits >= 6 && s.length < n) { bits -= 6; s += B64[(acc >> bits) & 63]; }
        acc &= (1 << bits) - 1;
      }
      return s;
    }};
  return r;
}

/* Empaqueter les champs d'une description : drapeaux, jeton du siège,
   ufrag, pwd, empreinte, candidats (4 : IPv4, 6 : IPv6, 1 : nom mDNS). */
function empaquette(d) {
  const w = ecrivain();
  w.u8(1 | (d.setup === 'active' ? 2 : d.setup === 'passive' ? 4 : 0));
  w.octets(d.jeton);
  w.ice(d.ufrag); w.ice(d.pwd);
  w.octets(d.empreinte.split(':').map(h => parseInt(h, 16)));
  w.u8(d.candidats.length);
  d.candidats.forEach(c => {
    if (c.v4) { w.u8(4); w.octets(c.v4); }
    else if (c.v6) { w.u8(6); w.octets(c.v6); }
    else { w.u8(1); w.octets(c.mdns); }
    w.u16(c.port);
  });
  return new Uint8Array(w.o);
}

function depaquette(o) {
  const r = lecteur(o), f = r.u8();
  if (!(f & 1)) throw new Error('code inconnu');
  const d = {setup: f & 2 ? 'active' : f & 4 ? 'passive' : 'actpass', jeton: r.octets(4), ufrag: r.ice(), pwd: r.ice(),
    empreinte: r.octets(32).map(x => x.toString(16).toUpperCase().padStart(2, '0')).join(':'), candidats: []};
  const n = r.u8();
  for (let k = 0; k < n; k++) {
    const t = r.u8();
    const c = t === 4 ? {v4: r.octets(4)} : t === 6 ? {v6: r.octets(16)} : {mdns: r.octets(16)};
    c.port = r.u16();
    d.candidats.push(c);
  }
  return d;
}

function base64url(o) { let s = ''; o.forEach(b => { s += String.fromCharCode(b); }); return btoa(s).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, ''); }
function deBase64url(s) { const b = atob(s.replace(/-/g, '+').replace(/_/g, '/')); return Uint8Array.from(b, c => c.charCodeAt(0)); }

/* Base45 (RFC 9285) : deux octets en trois signes alphanumériques. */
function base45(o) {
  let s = '';
  for (let i = 0; i < o.length; i += 2) {
    if (i + 1 < o.length) { let n = o[i] * 256 + o[i + 1]; s += QR_ALNUM[n % 45]; n = Math.floor(n / 45); s += QR_ALNUM[n % 45] + QR_ALNUM[Math.floor(n / 45)]; }
    else s += QR_ALNUM[o[i] % 45] + QR_ALNUM[Math.floor(o[i] / 45)];
  }
  return s;
}

function deBase45(s) {
  const o = [];
  for (let i = 0; i < s.length; i += 3) {
    const v = [...s.slice(i, i + 3)].map(c => QR_ALNUM.indexOf(c));
    if (v.some(x => x < 0)) throw new Error('code illisible');
    if (v.length === 3) { const n = v[0] + v[1] * 45 + v[2] * 2025; o.push(n >> 8, n & 255); } else o.push(v[0] + v[1] * 45);
  }
  return new Uint8Array(o);
}

/* Le code à taper : base32 sans voyelles ambiguës, par groupes de quatre,
   chaque groupe suivi d'un signe de contrôle pour dire où l'on s'est
   trompé plutôt que « code faux ». */
const B32 = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
function codeATaper(o) {
  let bits = 0, acc = 0, s = '';
  o.forEach(b => { acc = (acc << 8) | b; bits += 8; while (bits >= 5) { bits -= 5; s += B32[(acc >> bits) & 31]; } acc &= (1 << bits) - 1; });
  if (bits) s += B32[(acc << (5 - bits)) & 31];
  return s.match(/.{1,4}/g).map(g => g + B32[[...g].reduce((t, c) => t + B32.indexOf(c) * 7, 0) % 32]).join(' ');
}

function deCodeATaper(txt, longueur) {
  const groupes = txt.toUpperCase().replace(/[^A-Z0-9]/g, '').replace(/O/g, '0').replace(/I/g, '1').match(/.{1,5}/g) || [];
  let s = '';
  groupes.forEach((g, i) => {
    const corps = g.slice(0, -1), ctl = g.slice(-1);
    if (B32[[...corps].reduce((t, c) => t + B32.indexOf(c) * 7, 0) % 32] !== ctl) throw new Error(`groupe ${i + 1} mal recopié`);
    s += corps;
  });
  const o = [];
  let bits = 0, acc = 0;
  for (const c of s) { acc = (acc << 5) | B32.indexOf(c); bits += 5; if (bits >= 8) { bits -= 8; o.push((acc >> bits) & 255); } acc &= (1 << bits) - 1; }
  return new Uint8Array(longueur ? o.slice(0, longueur) : o);
}
