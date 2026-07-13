// ==========================================================================
// render.js
// 负责把数据渲染成 DOM：店铺信息、轮播、公告、分类、商品卡片、购物车/收藏/订单列表。
// ==========================================================================

import { resolveImagePath } from './utils.js';
import { t } from './language.js';

const ALL_CATEGORIES_LABEL = '全部商品';

/**
 * 渲染页头店铺信息。
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

  if (logo) logo.textContent = shop.logo || '☀️';
  if (name) name.textContent = shop.name || 'SmartShop';
  if (slogan) slogan.textContent = shop.description || '';
  if (phone) { phone.textContent = `☎ ${shop.phone}`; phone.href = `tel:${shop.phone}`; }
  if (hours) hours.textContent = `🕒 ${shop.hours}`;
  if (address) address.textContent = `📍 ${shop.address}`;
  if (whatsapp) { whatsapp.textContent = `WhatsApp`; whatsapp.href = `https://wa.me/${shop.whatsapp}`; }
  if (telegram) { telegram.textContent = `Telegram`; telegram.href = `https://t.me/${shop.telegram}`; }
  if (map) map.href = shop.googleMap || '#';
  document.title = `${shop.name} | SmartShop`;
}

/**
 * 渲染轮播广告。
 */
export function renderBanners(banners) {
  const track = document.getElementById('banner-track');
  const dots = document.getElementById('banner-dots');
  if (!track || !dots || !banners.length) return;

  track.innerHTML = banners.map((banner, index) => `
      <div class="banner-slide ${index === 0 ? 'active' : ''}" data-index="${index}">
        <img src="${resolveImagePath(banner.image)}" alt="${banner.title}" loading="lazy" />
        <div class="banner-content">
          <h2 class="banner-title">${banner.title}</h2>
          <p class="banner-subtitle">${banner.subtitle}</p>
        </div>
      </div>`).join('');

  dots.innerHTML = banners.map((_, index) => `
      <button class="banner-dot ${index === 0 ? 'active' : ''}" data-index="${index}" aria-label="Slide ${index + 1}"></button>`).join('');
  
  // 启动轮播逻辑省略（保持你原有的即可）
}

/**
 * 渲染公告栏。
 */
export function renderAnnouncements(announcements) {
  const track = document.getElementById('announcement-track');
  if (!track || !announcements.length) return;
  const active = announcements.filter((item) => item.active);
  track.innerHTML = active.map((item) => `
      <div class="announcement-item">
        <span class="badge">${item.type === 'promotion' ? t('promotions') : item.type === 'new' ? t('new') : t('home')}</span>
        <span>${item.title}：${item.content}</span>
      </div>`).join('');
}

/**
 * 渲染分类导航。
 */
export function renderCategories(categories, activeCategory, onSelect) {
  const list = document.getElementById('category-list');
  if (!list) return;
  const items = [{ id: 'all', name: t('products'), icon: '🏪' }, ...categories];
  list.innerHTML = items.map((cat) => `
      <li>
        <button type="button" class="category-btn ${cat.name === activeCategory || (cat.id === 'all' && activeCategory === ALL_CATEGORIES_LABEL) ? 'active' : ''}" data-category="${cat.id === 'all' ? ALL_CATEGORIES_LABEL : cat.name}">
          <span class="category-icon">${cat.icon || ''}</span> ${cat.name}
        </button>
      </li>`).join('');
  list.querySelectorAll('.category-btn').forEach((btn) => btn.addEventListener('click', () => onSelect(btn.dataset.category)));
}

/**
 * 渲染商品卡片网格。
 */
export function renderProducts(products, options = {}) {
  const gridId = options.gridId || 'product-grid';
  const grid = document.getElementById(gridId);
  if (!grid) return;

  const { onOpen, onToggleFavorite, onAddToCart, favorites = [] } = options;
  grid.innerHTML = products.map((product) => createProductCardHtml(product, favorites.includes(product.id))).join('');

  // 重新绑定事件
  grid.querySelectorAll('.product-card').forEach((card) => {
    const product = products.find((p) => p.id === Number(card.dataset.id));
    card.addEventListener('click', (e) => { if (!e.target.closest('.favorite-btn, .add-cart-btn')) onOpen(product); });
  });
  grid.querySelectorAll('.favorite-btn').forEach((btn) => btn.addEventListener('click', (e) => { e.stopPropagation(); onToggleFavorite(products.find(p => p.id == btn.dataset.id)); }));
  grid.querySelectorAll('.add-cart-btn').forEach((btn) => btn.addEventListener('click', (e) => { e.stopPropagation(); onAddToCart(products.find(p => p.id == btn.dataset.id), e); }));
}

/**
 * 构建单个商品卡片 HTML。
 */
function createProductCardHtml(product, isFavorite) {
  const inStock = product.stock > 0;
  const stockKey = inStock ? 'inStock' : 'outOfStock';
  const actionKey = inStock ? 'viewDetails' : 'outOfStock';
  
  return `
    <article class="product-card" data-id="${product.id}" tabindex="0" role="button">
      <div class="card-image-wrap">
        <img src="${resolveImagePath(product.image)}" alt="${product.name}" loading="lazy" />
        <span class="card-badge ${inStock ? 'in-stock' : 'out-stock'}" data-i18n="${stockKey}">${t(stockKey)}</span>
        <button type="button" class="favorite-btn ${isFavorite ? 'active' : ''}" data-id="${product.id}">${isFavorite ? '❤️' : '🤍'}</button>
      </div>
      <div class="card-body">
        <h3 class="card-name" data-i18n="prod_name_${product.id}">${product.name}</h3>
        <p class="card-specs">${product.specs}</p>
        <div class="card-price-row">
          <span class="card-price">${product.price}<span> ₸</span></span>
        </div>
        <div class="card-actions">
          <button type="button" class="card-btn" data-i18n="${actionKey}">${t(actionKey)}</button>
          <button type="button" class="add-cart-btn" data-id="${product.id}" ${inStock ? '' : 'disabled'}>🛒</button>
        </div>
      </div>
    </article>
  `;
}

export function renderList(items, containerId, renderItem) {
  const container = document.getElementById(containerId);
  if (container) container.innerHTML = items.length ? items.map(renderItem).join('') : `<p class="empty-state">${t('emptyCart')}</p>`;
}

export function renderFooter(shop) {
  const footerName = document.getElementById('footer-name');
  if (footerName && shop) footerName.textContent = shop.name;
}

export { ALL_CATEGORIES_LABEL };
