const CACHE='stuhaeggor-v1';
self.addEventListener('install',e=>{
  e.waitUntil(caches.open(CACHE).then(c=>c.addAll(['./','./index.html','./assets/css/style.css','./assets/js/main.js'])));
});
self.addEventListener('fetch',e=>{
  e.respondWith(caches.match(e.request).then(r=> r || fetch(e.request)));
});