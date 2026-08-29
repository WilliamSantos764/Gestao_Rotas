const CACHE_NAME="gestao-logistica-motorista-v532";
const SHELL=[
  "./motorista.html",
  "./manifest.webmanifest",
  "./icons/icon-192.png",
  "./icons/icon-512.png"
];

self.addEventListener("install",event=>{
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache=>cache.addAll(SHELL)).then(()=>self.skipWaiting())
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

  // HTML sempre tenta a versão mais recente primeiro.
  if(event.request.mode==="navigate"||url.pathname.endsWith("/motorista.html")){
    event.respondWith(
      fetch(event.request,{cache:"no-store"})
        .then(response=>{
          if(response&&response.ok){
            const copy=response.clone();
            caches.open(CACHE_NAME).then(cache=>cache.put("./motorista.html",copy)).catch(()=>{})
          }
          return response
        })
        .catch(()=>caches.match("./motorista.html"))
    );
    return
  }

  // Arquivos locais da PWA podem vir do cache.
  if(url.origin===self.location.origin){
    event.respondWith(
      caches.match(event.request).then(cached=>cached||fetch(event.request))
    )
  }
});
