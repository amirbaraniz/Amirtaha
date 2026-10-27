/* Amirbarani Portfolio v3: scoped progressive cache, network-first documents. */
const CACHE = 'amirbarani-static-v4';
const SCOPE = self.registration.scope;
const local = path => new URL(path, SCOPE).href;
const SHELL = ['','offline.html','assets/css/site.css','assets/js/site.js','assets/fonts/NotoSansArabic-Regular.woff2','assets/images/prfile.jpg'].map(local);
self.addEventListener('install', event => {
 event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(SHELL)).then(()=>self.skipWaiting()));
});
self.addEventListener('activate', event => {
 event.waitUntil(Promise.all([caches.keys().then(keys=>Promise.all(keys.filter(key=>(key.startsWith('amirtaha-static-') || key.startsWith('amirbarani-static-')) && key!==CACHE).map(key=>caches.delete(key)))), self.clients.claim()]));
});
self.addEventListener('fetch',event=>{
 const req=event.request;
 if(req.method!=='GET'||new URL(req.url).origin!==self.location.origin||!new URL(req.url).pathname.startsWith(new URL(SCOPE).pathname))return;
 if(req.mode==='navigate'){
   event.respondWith(fetch(req).then(res=>{if(res.ok){const copy=res.clone();event.waitUntil(caches.open(CACHE).then(c=>c.put(req,copy)));}return res;}).catch(async()=>await caches.match(req,{ignoreSearch:true}) || await caches.match(local('offline.html'))));
   return;
 }
 if(['font','image','style','script'].includes(req.destination)){
   event.respondWith(caches.match(req).then(cached=>cached||fetch(req).then(res=>{if(res.ok&&res.type==='basic'){const copy=res.clone();event.waitUntil(caches.open(CACHE).then(c=>c.put(req,copy)));}return res;})));
 }
});
