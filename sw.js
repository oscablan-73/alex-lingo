/* Cache local para navegación sin conexión, una vez abierta en HTTPS */
const CACHE='alex-lingo-v2.0.0';
const ASSETS=['./','./index.html','./styles.css','./content.js','./app.js','./cloud.js','./manifest.webmanifest','./assets/icon-192.png','./assets/icon-512.png'];
self.addEventListener('install',evt=>{evt.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(ASSETS)).then(()=>self.skipWaiting()));});
self.addEventListener('activate',evt=>{evt.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k.startsWith('alex-lingo-')&&k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()));});
self.addEventListener('fetch',evt=>{if(evt.request.method!=='GET')return;evt.respondWith(caches.match(evt.request).then(hit=>hit||fetch(evt.request)));});
