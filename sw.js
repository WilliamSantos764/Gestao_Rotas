const CACHE_NAME="gestao-logistica-motorista-v548";
const SHELL=[
 "./motorista.html",
 "./canhoto.html",
 "./manifest.webmanifest",
 "./icons/icon-192.png",
 "./icons/icon-512.png"
];

self.addEventListener("install",event=>{
 event.waitUntil(caches.open(CACHE_NAME).then(c=>c.addAll(SHELL)).then(()=>self.skipWaiting()))
});
self.addEventListener("activate",event=>{
 event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE_NAME).map(k=>caches.delete(k)))).then(()=>self.clients.claim()))
});
self.addEventListener("fetch",event=>{
 if(event.request.method!=="GET")return;
 const url=new URL(event.request.url);
 if(event.request.mode==="navigate"||url.pathname.endsWith("/motorista.html")||url.pathname.endsWith("/canhoto.html")){
   event.respondWith(
     fetch(event.request,{cache:"no-store"})
       .then(resp=>{
         if(resp&&resp.ok){
           const copy=resp.clone();
           const key=url.pathname.endsWith("/canhoto.html")?"./canhoto.html":"./motorista.html";
           caches.open(CACHE_NAME).then(c=>c.put(key,copy)).catch(()=>{})
         }
         return resp
       })
       .catch(()=>caches.match(url.pathname.endsWith("/canhoto.html")?"./canhoto.html":"./motorista.html"))
   );
   return
 }
 if(url.origin===self.location.origin){
   event.respondWith(caches.match(event.request).then(cached=>cached||fetch(event.request)))
 }
});