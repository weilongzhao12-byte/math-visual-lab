const CACHE='math-visual-lab-v2-4-1-r2';
const CACHE_PREFIX='math-visual-lab-';
const LOCAL=['./','./index.html','./cube-three-views.html','./water-container.html','./cross-section.html','./cube-net.html','./solid-revolution.html','./functions.html','./quadratic.html','./unit-circle.html','./conic-sections.html','./space-vectors.html','./manifest.webmanifest','./icon-192.png','./icon-512.png','./vendor/three.min.js','./vendor/OrbitControls.js'];

self.addEventListener('install',event=>{
  event.waitUntil(caches.open(CACHE).then(cache=>
    Promise.allSettled(LOCAL.map(url=>cache.add(new Request(url,{cache:'reload'}))))
  ));
  self.skipWaiting();
});

self.addEventListener('activate',event=>{
  event.waitUntil(caches.keys().then(keys=>Promise.all(
    keys.filter(key=>key.startsWith(CACHE_PREFIX)&&key!==CACHE).map(key=>caches.delete(key))
  )));
  self.clients.claim();
});

self.addEventListener('fetch',event=>{
  if(event.request.method!=='GET'||new URL(event.request.url).origin!==self.location.origin)return;
  event.respondWith(caches.match(event.request).then(cached=>cached||
    fetch(event.request).then(response=>{
      if(response.ok){
        const copy=response.clone();
        event.waitUntil(caches.open(CACHE).then(cache=>cache.put(event.request,copy)));
      }
      return response;
    }).catch(()=>event.request.mode==='navigate'?caches.match('./index.html'):Response.error())
  ));
});
