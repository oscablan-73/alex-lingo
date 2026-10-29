/* Cache local para navegación sin conexión, una vez abierta en HTTPS */
const CACHE='alex-lingo-v2.1.0';
const ASSETS=['./','./index.html','./styles.css?v=2.1.0','./content.js?v=2.1.0','./app.js?v=2.1.0','./cloud.js?v=2.1.0','./manifest.webmanifest','./assets/icon-192.png','./assets/icon-512.png'];
self.addEventListener('install',evt=>{evt.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(ASSETS)).then(()=>self.skipWaiting()));});
self.addEventListener('activate',evt=>{evt.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k.startsWith('alex-lingo-')&&k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()));});
self.addEventListener('fetch',evt=>{
 if(evt.request.method!=='GET'||new URL(evt.request.url).origin!==self.location.origin)return;
 evt.respondWith(fetch(evt.request).then(async res=>{
  if(res.ok){const cache=await caches.open(CACHE);await cache.put(evt.request,res.clone());}
  return res;
 }).catch(()=>caches.match(evt.request,{ignoreSearch:true})));
});
