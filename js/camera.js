/* =====================================================================
   js/camera.js — Lire un QR code avec la caméra

   Le flux de la caméra passe dans une vidéo, une image toutes les cent
   cinquante millisecondes est recadrée au centre — sans réduction : à
   quarante centimètres un petit QR n'a que trois ou quatre pixels par
   module — et lue. Par le détecteur du navigateur quand il existe et
   connaît le QR (Android, macOS, ChromeOS), par js/qrLit.js sinon (Windows,
   Linux, Firefox, Safari).

   Ouvrir la caméra a un second effet, voulu : tant qu'elle tourne, le
   navigateur dévoile à WebRTC les vraies adresses du réseau local au lieu
   de noms masqués, ce qui rend la liaison sans serveur bien plus sûre
   (js/liaison.js).
   ===================================================================== */

const CAMERA = {flux: null, actif: false, detecteur: undefined, canvas: null, erreur: ''};

/* Ouvrir la caméra dans un élément vidéo de la page. Rend vrai si elle
   tourne ; l'erreur (refus, absence) est gardée pour être dite. */
async function ouvreCamera(video) {
  CAMERA.erreur = '';
  try {
    if (!CAMERA.flux) CAMERA.flux = await navigator.mediaDevices.getUserMedia({audio: false,
      video: {facingMode: 'environment', width: {ideal: 1280}, height: {ideal: 720}}});
    if (video) {
      video.muted = true; video.setAttribute('playsinline', '');
      video.srcObject = CAMERA.flux;
      await video.play();
    }
    return true;
  } catch (e) {
    CAMERA.erreur = e && e.name === 'NotAllowedError' ? 'caméra refusée' : 'pas de caméra';
    return false;
  }
}

function fermeCamera() {
  CAMERA.actif = false;
  if (CAMERA.flux) CAMERA.flux.getTracks().forEach(t => t.stop());
  CAMERA.flux = null;
}

/* Le détecteur du navigateur, s'il sait lire les QR. */
async function detecteurNatif() {
  if (CAMERA.detecteur !== undefined) return CAMERA.detecteur;
  CAMERA.detecteur = null;
  try {
    if (typeof BarcodeDetector !== 'undefined' && (await BarcodeDetector.getSupportedFormats()).includes('qr_code'))
      CAMERA.detecteur = new BarcodeDetector({formats: ['qr_code']});
  } catch (e) { /* le détecteur maison prend le relais */ }
  return CAMERA.detecteur;
}

/* Lire une image de la vidéo : le texte du QR, ou `null`. */
async function lisImage(video) {
  const vw = video.videoWidth, vh = video.videoHeight;
  if (!vw || !vh) return null;
  const c = Math.min(vw, vh, 720);
  if (!CAMERA.canvas) CAMERA.canvas = document.createElement('canvas');
  const cv = CAMERA.canvas;
  cv.width = c; cv.height = c;
  const ctx = cv.getContext('2d', {willReadFrequently: true});
  ctx.drawImage(video, (vw - c) / 2, (vh - c) / 2, c, c, 0, 0, c, c);
  const det = await detecteurNatif();
  if (det) {
    try { const r = await det.detect(cv); if (r.length) return r[0].rawValue; } catch (e) { /* on retombe sur le maison */ }
  }
  return lisQR(ctx.getImageData(0, 0, c, c));
}

/* Lire en boucle jusqu'à un QR qu'accepte `accepte(texte)`, ou l'arrêt. */
async function scanne(video, accepte) {
  CAMERA.actif = true;
  while (CAMERA.actif) {
    const t = await lisImage(video).catch(() => null);
    if (t != null && accepte(t)) return t;
    await new Promise(ok => setTimeout(ok, 150));
  }
  return null;
}
