// ==========================================================================
// render.js
// 修复版：还原了广告和公告的完整 HTML 结构，确保 CSS 能正常加载
// ==========================================================================

import { resolveImagePath } from './utils.js';
import { t } from './language.js';

export const ALL_CATEGORIES_LABEL = '全部商品';

export function renderShopHeader(shop) {
  if (!shop) return;
  const logo = document.getElementById('shop-logo');
  const name = document.getElementById('shop-name');
  if (logo) logo.textContent = shop.logo || '☀️';
  if (name) name.textContent = shop.name || 'SmartShop';
  document.title = `${shop.name} | SmartShop`;
}

// 还原了带标题和副标题的完整结构
export function renderBanners(banners) {
  const track = document.getElementById('banner-track');
  const dots = document.getElementById('banner-dots');
  if (!track || !banners) return;
  
  track.innerHTML = banners.map((banner, index) => `
    <div class="banner-slide ${index === 0 ? 'active' : ''}" data-index="${index}">
      <img src="${resolveImagePath(banner.image)}" alt="${banner.title}" loading="lazy" />
      <div class="banner-content">
        <h2 class="banner-title">${banner.title}</h2>
        <p class="banner-subtitle">${banner.subtitle}</p>
      </div>
    </div>`).join('');
    
  if (dots) {
    dots.innerHTML = banners.map((_, index) => `
      <button class="banner-dot ${index === 0 ? 'active' : ''}" data-index="${index}"></button>`).join('');
  }
}

// 还原了公告的 Badge 和文字结构
export function renderAnnouncements(announcements) {
  const track = document.getElementById('announcement-track');
  if (!track || !announcements) return;
  const active = announcements.filter((item) => item.active);
  track.innerHTML = active.map((item) => `
    <div class="announcement-item">
      <span class="badge">${item.type === 'promotion' ? t('promotions') : item.type === 'new' ? t('new') : t('home')}</span>
      <span>${item.title}：${item.content}</span>
    </div>`).join('');
}

export function renderCategories(categories, activeCategory, onSelect) {
  const list = document.getElementById('category-list');
  if (!list) return;
  const items = [{ id: 'all', name: t('products'), icon: '🏪' }, ...categories];
  list.innerHTML = items.map((cat) => `
      <li>
        <button type="button" class="category-btn ${cat.name === activeCategory || (cat.id === 'all' && activeCategory === ALL_CATEGORIES_LABEL) ? 'active' : ''}" data-category="${cat.id === 'all' ? ALL_CATEGORIES_LABEL : cat.name}">
          ${cat.name}
        </button>
      </li>`).join('');
  list.querySelectorAll('.category-btn').forEach((btn) => btn.addEventListener('click', () => onSelect(btn.dataset.category)));
}

export function renderProducts(products, options = {}) {
  const grid = document.getElementById(options.gridId || 'product-grid');
  if (!grid) return;
  const { onOpen, onToggleFavorite, onAddToCart, favorites = [] } = options;
  grid.innerHTML = products.map((product) => createProductCardHtml(product, favorites.includes(product.id))).join('');
  
  grid.querySelectorAll('.product-card').forEach((card) => {
    const product = products.find((p) => p.id === Number(card.dataset.id));
    card.addEventListener('click', (e) => { if (!e.target.closest('.favorite-btn, .add-cart-btn')) onOpen(product); });
  });
  grid.querySelectorAll('.favorite-btn').forEach((btn) => btn.addEventListener('click', (e) => { e.stopPropagation(); onToggleFavorite(products.find(p => p.id == btn.dataset.id)); }));
  grid.querySelectorAll('.add-cart-btn').forEach((btn) => btn.addEventListener('click', (e) => { e.stopPropagation(); onAddToCart(products.find(p => p.id == btn.dataset.id), e); }));
}

function createProductCardHtml(product, isFavorite) {
  const inStock = product.stock > 0;
  const stockKey = inStock ? 'inStock' : 'outOfStock';
  const actionKey = inStock ? 'viewDetails' : 'outOfStock';
  
  const nameKey = `prod_name_${product.id}`;
  const translatedName = t(nameKey);
  const displayName = (translatedName === nameKey) ? product.name : translatedName;

  return `
    <article class="product-card" data-id="${product.id}" tabindex="0" role="button">
      <div class="card-image-wrap">
        <img src="${resolveImagePath(product.image)}" alt="${product.name}" loading="lazy" />
        <span class="card-badge ${inStock ? 'in-stock' : 'out-stock'}" data-i18n="${stockKey}">${t(stockKey)}</span>
        <button type="button" class="favorite-btn ${isFavorite ? 'active' : ''}" data-id="${product.id}">${isFavorite ? '❤️' : '🤍'}</button>
      </div>
      <div class="card-body">
        <h3 class="card-name">${displayName}</h3>
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

export function renderFooter(shop) {
  const footerName = document.getElementById('footer-name');
  if (footerName && shop) footerName.textContent = shop.name;
}
