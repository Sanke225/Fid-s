/*
 * Service worker Fid’s : rend l'application installable et affiche une page hors ligne.
 *
 * Volontairement prudent, car les pages contiennent des données privées (paiements, livraisons) :
 * - les pages HTML et l'API passent toujours par le réseau, rien n'est mis en cache
 *   (pas de tableau de bord lisible hors ligne sur un appareil partagé) ;
 * - seuls les fichiers publics et immuables (/_next/static, icônes, motifs) sont mis en cache ;
 * - sans réseau, une navigation affiche /hors-ligne.html.
 *
 * Changer VERSION à chaque modification de ce fichier ou de la liste PRECACHE.
 */
const VERSION = 'fids-v1';
const STATIC_CACHE = `${VERSION}-static`;
const OFFLINE_URL = '/hors-ligne.html';
const PRECACHE = [OFFLINE_URL, '/favicon.svg', '/bande-kente.svg', '/icon-192.png', '/icon-512.png'];

self.addEventListener('install', event => {
  event.waitUntil(
    caches
      .open(STATIC_CACHE)
      .then(cache => cache.addAll(PRECACHE))
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches
      .keys()
      .then(keys => Promise.all(keys.filter(k => !k.startsWith(VERSION)).map(k => caches.delete(k))))
      .then(() => self.clients.claim()),
  );
});

/** Fichiers sans donnée utilisateur, dont l'URL change à chaque version (ou fixes de la charte). */
function isStaticAsset(url) {
  return (
    url.pathname.startsWith('/_next/static/') ||
    /^\/(favicon\.(ico|svg)|apple-touch-icon\.png|icon-[\w-]+\.png|bande-kente\.svg|motif-[\w-]+\.svg)$/.test(url.pathname)
  );
}

self.addEventListener('fetch', event => {
  const { request } = event;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  if (request.mode === 'navigate') {
    event.respondWith(fetch(request).catch(() => caches.match(OFFLINE_URL)));
    return;
  }

  if (isStaticAsset(url)) {
    event.respondWith(
      caches.open(STATIC_CACHE).then(async cache => {
        const cached = await cache.match(request);
        if (cached) return cached;
        const response = await fetch(request);
        if (response.ok) cache.put(request, response.clone());
        return response;
      }),
    );
  }
  // Tout le reste (API, auth, RSC) : comportement normal du navigateur.
});
