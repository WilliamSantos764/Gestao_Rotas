const CACHE_NAME="gestao-logistica-motorista-v550";
const CORE=[
 "./motorista.html",
 "./canhoto.html",
 "./manifest.webmanifest",
 "./icons/icon-192.png",
 "./icons/icon-512.png"
];

self.addEventListener("install",event=>{
 event.waitUntil(
   caches.open(CACHE_NAME)
     .then(cache=>Promise.allSettled(CORE.map(url=>cache.add(url))))
     .then(()=>self.skipWaiting())
 )
});

self.addEventListener("activate",event=>{
 event.waitUntil(
   caches.keys()
     .then(keys=>Promise.all(keys.filter(k=>k!==CACHE_NAME).map(k=>caches.delete(k))))
     .then(()=>self.clients.claim())
 )
});

self.addEventListener("fetch",event=>{
 if(event.request.method!=="GET")return;
 const url=new URL(event.request.url);
 if(url.origin!==self.location.origin)return;

 event.respondWith(
   fetch(event.request)
     .then(response=>{
       if(response&&response.ok){
         const clone=response.clone();
         caches.open(CACHE_NAME).then(cache=>cache.put(event.request,clone)).catch(()=>{});
       }
       return response
     })
     .catch(()=>caches.match(event.request).then(cached=>cached||caches.match("./motorista.html")))
 )
});
