// ==========================================================================
// render.js
// 负责把数据渲染成 DOM：店铺信息、轮播、公告、分类、商品卡片、购物车/收藏/订单列表。
// 本文件只负责“画出来”，业务逻辑在 main.js / search.js / filter.js 等模块中处理。
// ==========================================================================

import { resolveImagePath } from './utils.js';

const ALL_CATEGORIES_LABEL = '全部商品';

/**
 * 渲染页头店铺信息。
 * @param {Object} shop
 */
export function renderShopHeader(shop) {
  if (!shop) return;

  const logo = document.getElementById('shop-logo');
  const name = document.getElementById('shop-name');
  const slogan = document.getElementById('shop-slogan');
  const phone = document.getElementById('shop-phone');
  const hours = document.getElementById('shop-hours');
  const address = document.getElementById('shop-address');
  const whatsapp = document.getElementById('shop-whatsapp');
  const telegram = document.getElementById('shop-telegram');
  const map = document.getElementById('shop-map');
  const navBtn = document.getElementById('shop-nav-btn');

  if (logo) logo.textContent = shop.logo || '商';
  if (name) name.textContent = shop.name || 'SmartShop';
  if (slogan) slogan.textContent = shop.description || '';
  if (phone) {
    phone.textContent = `☎ ${shop.phone}`;
    phone.href = `tel:${shop.phone}`;
  }
  if (hours) hours.textContent = `🕒 ${shop.hours}`;
  if (address) address.textContent = `📍 ${shop.address}`;
  if (whatsapp) {
    whatsapp.textContent = `WhatsApp`;
    whatsapp.href = `https://wa.me/${shop.whatsapp}`;
  }
  if (telegram) {
    telegram.textContent = `Telegram`;
    telegram.href = `https://t.me/${shop.telegram}`;
  }
  if (map) map.href = shop.googleMap || '#';
  if (navBtn) navBtn.href = shop.googleMap || '#';

  document.title = `${shop.name} | SmartShop`;
}

/**
 * 渲染轮播广告。
 * @param {Array<Object>} banners
 */
export function renderBanners(banners) {
  const track = document.getElementById('banner-track');
  const dots = document.getElementById('banner-dots');
  if (!track || !dots || !banners.length) return;

  track.innerHTML = banners
    .map(
      (banner, index) => `
      <div class="banner-slide ${index === 0 ? 'active' : ''}" data-index="${index}">
        <img src="${resolveImagePath(banner.image)}" alt="${banner.title}" loading="lazy" />
        <div class="banner-content">
          <h2 class="banner-title">${banner.title}</h2>
          <p class="banner-subtitle">${banner.subtitle}</p>
        </div>
      </div>
    `,
    )
    .join('');

  dots.innerHTML = banners
    .map(
      (_, index) => `
      <button class="banner-dot ${index === 0 ? 'active' : ''}" data-index="${index}" aria-label="切换到第 ${index + 1} 张 banner"></button>
    `,
    )
    .join('');

  startBannerCarousel(banners.length);
}

/**
 * 启动轮播自动切换。
 * @param {number} count
 */
function startBannerCarousel(count) {
  let current = 0;
  const slides = document.querySelectorAll('.banner-slide');
  const dots = document.querySelectorAll('.banner-dot');
  if (!slides.length) return;

  function show(index) {
    current = index;
    slides.forEach((slide, i) => slide.classList.toggle('active', i === current));
    dots.forEach((dot, i) => dot.classList.toggle('active', i === current));
  }

  function next() {
    show((current + 1) % count);
  }

  dots.forEach((dot) => {
    dot.addEventListener('click', () => show(Number(dot.dataset.index)));
  });

  setInterval(next, 5000);
}

/**
 * 渲染公告栏。
 * @param {Array<Object>} announcements
 */
export function renderAnnouncements(announcements) {
  const track = document.getElementById('announcement-track');
  if (!track || !announcements.length) return;

  const active = announcements.filter((item) => item.active);
  track.innerHTML = active
    .map(
      (item) => `
      <div class="announcement-item">
        <span class="badge">${item.type === 'promotion' ? '优惠' : item.type === 'new' ? '新品' : '公告'}</span>
        <span>${item.title}：${item.content}</span>
      </div>
    `,
    )
    .join('');
}

/**
 * 渲染分类导航按钮。
 * @param {Array<Object>} categories
 * @param {string} activeCategory
 * @param {(category: string) => void} onSelect
 */
export function renderCategories(categories, activeCategory, onSelect) {
  const list = document.getElementById('category-list');
  if (!list) return;

  const items = [{ id: 'all', name: ALL_CATEGORIES_LABEL, icon: '🏪' }, ...categories];

  list.innerHTML = items
    .map(
      (cat) => `
      <li>
        <button
          type="button"
          class="category-btn ${cat.name === activeCategory ? 'active' : ''}"
          data-category="${cat.name}"
        >
          <span class="category-icon">${cat.icon || ''}</span> ${cat.name}
        </button>
      </li>
    `,
    )
    .join('');

  list.querySelectorAll('.category-btn').forEach((btn) => {
    btn.addEventListener('click', () => onSelect(btn.dataset.category));
  });
}

/**
 * 渲染商品卡片网格。
 * @param {Array<Object>} products
 * @param {Object} options
 * @param {(product: Object) => void} options.onOpen
 * @param {(product: Object) => void} options.onToggleFavorite
 * @param {(product: Object, event: Event) => void} options.onAddToCart
 * @param {Array<number>} options.favorites
 * @param {string} options.gridId 目标网格容器 ID，默认 'product-grid'
 */
export function renderProducts(products, options = {}) {
  const gridId = options.gridId || 'product-grid';
  const grid = document.getElementById(gridId);
  const empty = grid?.closest('.section-container')?.querySelector('.empty-state') || document.getElementById('empty-state');
  const count = document.getElementById('result-count');
  const sectionTitle = document.getElementById('section-title');
  if (!grid) return;

  const {
    onOpen = () => {},
    onToggleFavorite = () => {},
    onAddToCart = () => {},
    favorites = [],
  } = options;

  const hasResults = products.length > 0;
  grid.hidden = !hasResults;
  if (empty) empty.hidden = hasResults;
  if (count) count.textContent = `共 ${products.length} 件商品`;

  grid.innerHTML = products
    .map((product) => createProductCardHtml(product, favorites.includes(product.id)))
    .join('');

  grid.querySelectorAll('.product-card').forEach((card) => {
    const product = products.find((p) => p.id === Number(card.dataset.id));
    if (!product) return;

    card.addEventListener('click', (event) => {
      if (event.target.closest('.favorite-btn, .add-cart-btn, .card-btn')) return;
      onOpen(product);
    });

    card.addEventListener('keydown', (event) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        onOpen(product);
      }
    });
  });

  grid.querySelectorAll('.favorite-btn').forEach((btn) => {
    btn.addEventListener('click', (event) => {
      event.stopPropagation();
      const product = products.find((p) => p.id === Number(btn.dataset.id));
      if (product) onToggleFavorite(product);
    });
  });

  grid.querySelectorAll('.add-cart-btn').forEach((btn) => {
    btn.addEventListener('click', (event) => {
      event.stopPropagation();
      const product = products.find((p) => p.id === Number(btn.dataset.id));
      if (product) onAddToCart(product, event);
    });
  });

  if (sectionTitle) sectionTitle.textContent = '全部商品';
}

/**
 * 构建单个商品卡片 HTML。
 */
function createProductCardHtml(product, isFavorite) {
  const inStock = product.stock > 0;
  const tags = [];
  if (product.isNew) tags.push('<span class="card-tag new">新品</span>');
  if (product.isHot) tags.push('<span class="card-tag hot">热门</span>');
  if (product.isPromotion) tags.push('<span class="card-tag promotion">促销</span>');

  return `
    <article class="product-card" data-id="${product.id}" tabindex="0" role="button" aria-label="查看 ${product.name} 详情">
      <div class="card-image-wrap">
        <img src="${resolveImagePath(product.image)}" alt="${product.name}" loading="lazy" />
        <div class="card-tags">${tags.join('')}</div>
        <span class="card-badge ${inStock ? 'in-stock' : 'out-stock'}">${inStock ? '有货' : '缺货'}</span>
        <button type="button" class="favorite-btn ${isFavorite ? 'active' : ''}" data-id="${product.id}" aria-label="${isFavorite ? '取消收藏' : '收藏'}">
          ${isFavorite ? '❤️' : '🤍'}
        </button>
      </div>
      <div class="card-body">
        <div class="card-meta">
          <span class="card-category">${product.category}</span>
          <span class="card-brand">${product.brand}</span>
        </div>
        <h3 class="card-name">${product.name}</h3>
        <p class="card-specs">${product.specs}</p>
        <div class="card-price-row">
          <span class="card-price">${product.price}<span> ${product.currencyName || '坚戈'}</span></span>
          ${product.originalPrice > product.price ? `<span class="card-original-price">${product.originalPrice}</span>` : ''}
        </div>
        <div class="card-actions">
          <button type="button" class="card-btn ${inStock ? '' : 'out-stock'}">${inStock ? '查看详情' : '暂时缺货'}</button>
          <button type="button" class="add-cart-btn" data-id="${product.id}" ${inStock ? '' : 'disabled'} aria-label="加入购物车">
            🛒
          </button>
        </div>
      </div>
    </article>
  `;
}

/**
 * 渲染商品列表（用于购物车、收藏、订单等页面）。
 * @param {Array<Object>} items
 * @param {string} containerId
 * @param {Function} renderItem
 */
export function renderList(items, containerId, renderItem) {
  const container = document.getElementById(containerId);
  if (!container) return;

  if (!items.length) {
    container.innerHTML = `<p class="empty-state">暂无数据。</p>`;
    return;
  }

  container.innerHTML = items.map(renderItem).join('');
}

/**
 * 渲染页脚。
 * @param {Object} shop
 */
export function renderFooter(shop) {
  if (!shop) return;
  const footerName = document.getElementById('footer-name');
  if (footerName) footerName.textContent = shop.name;
}

export { ALL_CATEGORIES_LABEL };

