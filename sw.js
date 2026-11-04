const CACHE_NAME = 'trail-train-v4';
const ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  'https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:wght@300;400;500;600&display=swap',
  '/anim/90-90-dinamico.gif',
  '/anim/ankle-pops-suaves.gif',
  '/anim/bisagra-con-palo.gif',
  '/anim/box-jump.gif',
  '/anim/curl-femoral-deslizante.gif',
  '/anim/curl-nordico.gif',
  '/anim/drop-squat-snap-down.gif',
  '/anim/elevacion-soleo.gif',
  '/anim/farmer-carry-unilateral.gif',
  '/anim/farmers-walk.gif',
  '/anim/hip-hinge-drill-palo.gif',
  '/anim/hip-thrust-barra.gif',
  '/anim/jumping-jacks-bajos.gif',
  '/anim/liberacion-plantar.gif',
  '/anim/movilidad-cadera-isquios.gif',
  '/anim/movilidad-tobillo-escalon.gif',
  '/anim/movilidad-tobillo-zancada.gif',
  '/anim/paso-descendente-cajon.gif',
  '/anim/peso-muerto-rumano-1-pierna.gif',
  '/anim/pogo-jumps.gif',
  '/anim/press-banca-barra.gif',
  '/anim/press-militar-barra.gif',
  '/anim/remo-con-barra.gif',
  '/anim/respiracion-diafragmatica.gif',
  '/anim/rotacion-cadera-pie.gif',
  '/anim/rotacion-toracica-cuadrupedia.gif',
  '/anim/salto-horizontal-frenado.gif',
  '/anim/salto-lateral-estabilizacion.gif',
  '/anim/salto-lateral-recepcion-1-pierna.gif',
  '/anim/sentadilla-barra.gif',
  '/anim/skater-bound-lateral.gif',
  '/anim/skater-jump-frenado.gif',
  '/anim/skipping-bajo-braceo.gif',
  '/anim/skipping-suave.gif',
  '/anim/snap-down-stick.gif',
  '/anim/transicion-90-90.gif',
  '/anim/woodchopper-disco.gif',
  '/anim/zancada-bulgara.gif'
];

// Install: cache all assets
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(ASSETS).catch(() => {
        // fonts may fail offline at install time, that's ok
        return cache.addAll(['/', '/index.html', '/manifest.json']);
      });
    })
  );
  self.skipWaiting();
});

// Activate: delete old caches
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// Fetch: network-first for the app document (so updates land immediately),
// cache-first for other static assets, network-first passthrough for YouTube.
self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);

  // Let YouTube and external links pass through normally
  if (!url.origin.includes(self.location.origin) && !url.href.includes('fonts.googleapis')) {
    return;
  }

  // Document navigations / index.html: always try the network first so a
  // new deploy shows up right away; fall back to cache only when offline.
  if (event.request.destination === 'document' || url.pathname.endsWith('/index.html') || url.pathname === '/') {
    event.respondWith(
      fetch(event.request).then(response => {
        if (response && response.status === 200) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
        }
        return response;
      }).catch(() => caches.match(event.request).then(cached => cached || caches.match('/index.html')))
    );
    return;
  }

  // Other assets (manifest, fonts, icons): cache-first.
  event.respondWith(
    caches.match(event.request).then(cached => {
      if (cached) return cached;
      return fetch(event.request).then(response => {
        if (response && response.status === 200) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
        }
        return response;
      }).catch(() => {});
    })
  );
});
