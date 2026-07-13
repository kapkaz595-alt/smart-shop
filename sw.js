// SmartShop Service Worker
// 提供简单的离线缓存：静态资源、页面骨架、图片。
const CACHE_NAME = 'smartshop-v2';
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
  const url = event.request.url;

  // HTML 和 JS 这类经常更新的文件：网络优先，网络失败才退回缓存
  if (url.match(/\.(html|js)$/) || event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          if (response && response.status === 200) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
          }
          return response;
        })
        .catch(() => caches.match(event.request))
    );
    return;
  }

  // 图片、CSS、JSON 这类不常变的静态资源：缓存优先，加快加载速度
  event.respondWith(
    caches.match(event.request).then((cached) => {
      return cached || fetch(event.request).then((response) => {
        if (response && response.status === 200) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
        }
        return response;
      });
    })
  );
});
