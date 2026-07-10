// SmartShop Service Worker
// 提供简单的离线缓存：静态资源、页面骨架、图片。
const CACHE_NAME = 'smartshop-v1';
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/products.html',
  '/cart.html',
  '/favorites.html',
  '/orders.html',
  '/css/style.css',
  '/css/responsive.css',
  '/css/dark.css',
  '/js/main.js',
  '/data/categories.json',
  '/data/shop.json',
  '/data/banner.json',
  '/data/announcement.json',
  '/data/products.json',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(STATIC_ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((cached) => {
      return cached || fetch(event.request).then((response) => {
        if (response && response.status === 200 && response.url.match(/\.(jpg|png|webp|json|css|js|html)$/)) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
        }
        return response;
      }).catch(() => cached);
    })
  );
});

