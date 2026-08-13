// Service Worker สำหรับระบบตารางกะ — ทำให้ติดตั้งเป็นแอปได้ และเปิดใช้งานได้แม้ไม่มีเน็ต (แสดงข้อมูลที่เคยโหลดไว้ล่าสุด)
const CACHE_NAME = 'factory-sched-v1';
const CACHE_FILES = [
  './',
  './index.html',
  './manifest.json',
  './icon-192.png',
  './icon-512.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(CACHE_FILES))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((names) =>
      Promise.all(names.filter((n) => n !== CACHE_NAME).map((n) => caches.delete(n)))
    )
  );
  self.clients.claim();
});

// กลยุทธ์: network-first (ให้ได้ข้อมูลใหม่สุดก่อนเสมอถ้ามีเน็ต) แล้วค่อย fallback ไป cache ตอนไม่มีเน็ต
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  event.respondWith(
    fetch(event.request)
      .then((res) => {
        const resClone = res.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(event.request, resClone));
        return res;
      })
      .catch(() => caches.match(event.request).then((cached) => cached || caches.match('./index.html')))
  );
});
