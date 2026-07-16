// ==========================================================================
// render.js
// 负责把数据渲染成 DOM：店铺信息、轮播、公告、分类、商品卡片。
// ==========================================================================

import { resolveImagePath } from './utils.js';
import { t, getLanguage } from './language.js';

export const ALL_CATEGORIES_LABEL = '全部商品';

/**
 * 读取多语言字段（name/description/address 现在都是 {kk, ru, en} 对象）。
 * 兼容旧数据：如果传进来的还是纯字符串，直接原样返回。
 */
function localized(field) {
  if (!field) return '';
  if (typeof field === 'string') return field;
  const lang = getLanguage();
  return field[lang] || field.kk || field.ru || field.en || '';
}

/**
 * 根据当前语言取分类名称（categories.json 现在用 name_kk/name_ru/name_en 三个字段）。
 */
function getCategoryName(cat) {
  const lang = getLanguage();
  return cat[`name_${lang}`] || cat.name_kk || cat.name_ru || cat.name_en || cat.name || '';
}

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

  const shopName = localized(shop.name);

  if (logo) logo.textContent = shop.logo || '☀️';
  // 改回读取后台数据，并按当前语言取值
  if (name) name.textContent = shopName;
  if (slogan) slogan.textContent = localized(shop.description);
  if (phone) {
    phone.textContent = `☎ ${shop.phone || ''}`;
    phone.href = `tel:${shop.phone || ''}`;
  }
  if (hours) hours.textContent = `🕒 ${shop.hours || ''}`;
  if (address) address.textContent = `📍 ${localized(shop.address)}`;
  if (whatsapp) whatsapp.href = `https://wa.me/${shop.whatsapp || ''}`;
  if (telegram) telegram.href = `https://t.me/${shop.telegram || ''}`;
  if (map) map.href = shop.googleMap || '#';

  document.title = `${shopName} | SmartShop`;
}

/**
 * 渲染轮播广告。
 */
export function renderBanners(banners) {
  const track = document.getElementById('banner-track');
  const dots = document.getElementById('banner-dots');
  if (!track || !dots) return;

  if (!banners || !banners.length) {
    track.innerHTML = '';
    dots.innerHTML = '';
    return;
  }

  track.innerHTML = banners
    .map(
      (banner, index) => `
      <div class="banner-slide ${index === 0 ? 'active' : ''}" data-index="${index}">
        <img src="${resolveImagePath(banner.image)}" alt="${banner.title || ''}" loading="lazy" />
        <div class="banner-content">
          <h2 class="banner-title">${banner.title || ''}</h2>
          <p class="banner-subtitle">${banner.subtitle || ''}</p>
        </div>
      </div>
    `,
    )
    .join('');

  dots.innerHTML = banners
    .map(
      (_, index) => `
      <button class="banner-dot ${index === 0 ? 'active' : ''}" data-index="${index}" aria-label="Slide ${index + 1}"></button>
    `,
    )
    .join('');

  startBannerCarousel(banners.length);
}

// 记录当前轮播的定时器，避免每次 renderBanners 都新开一个 setInterval 导致内存泄漏/多重轮播
let bannerIntervalId = null;

function startBannerCarousel(count) {
  if (bannerIntervalId) {
    clearInterval(bannerIntervalId);
    bannerIntervalId = null;
  }

  if (!count || count <= 1) return;

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

  bannerIntervalId = setInterval(next, 5000);
}

/**
 * 渲染公告栏。
 */
export function renderAnnouncements(announcements) {
  const track = document.getElementById('announcement-track');
  if (!track) return;

  if (!announcements || !announcements.length) {
    track.innerHTML = '';
    return;
  }

  const active = announcements.filter((item) => item.active);

  if (!active.length) {
    track.innerHTML = '';
    return;
  }

  track.innerHTML = active
    .map(
      (item) => `
      <div class="announcement-item">
        <span class="badge">
          ${item.type === 'promotion' ? t('promotions') : item.type === 'new' ? t('new') : t('home')}
        </span>
        <span>${item.title || ''}：${item.content || ''}</span>
      </div>
    `,
    )
    .join('');
}

/**
 * 渲染分类导航按钮
 * 每次调用都会用 innerHTML 整体重建列表内容，
 * 因此直接绑定一次新的事件监听即可，无需（也不能）在绑定前尝试移除旧引用。
 *
 * 注意：data-category 现在用 cat.id（不再变化的稳定值），
 * 不再用 cat.name（因为分类名称会随语言切换而变化，用它做筛选值会导致切换语言后筛选失效）。
 */
export function renderCategories(categories, activeCategory, onSelect) {
  const list = document.getElementById('category-list');
  if (!list) return;

  const safeCategories = Array.isArray(categories) ? categories : [];
  const items = [{ id: 'all', icon: '🏪' }, ...safeCategories];

  list.innerHTML = items
    .map((cat) => {
      const displayName = cat.id === 'all' ? t('products') : getCategoryName(cat);
      const categoryValue = cat.id === 'all' ? ALL_CATEGORIES_LABEL : cat.id;
      const isActive = categoryValue === activeCategory;

      return `
        <li>
          <button
            type="button"
            class="category-btn ${isActive ? 'active' : ''}"
            data-category="${categoryValue}"
          >
            <span class="category-icon">${cat.icon || ''}</span>
            ${displayName}
          </button>
        </li>
      `;
    })
    .join('');

  list.addEventListener('click', (e) => {
    const btn = e.target.closest('.category-btn');
    if (!btn) return;
    const category = btn.dataset.category;
    if (!category) return;

    list.querySelectorAll('.category-btn').forEach((b) => b.classList.remove('active'));
    btn.classList.add('active');

    if (typeof onSelect === 'function') onSelect(category);
  });
}

/**
 * 渲染商品卡片网格。
 */
export function renderProducts(products, options = {}) {
  const gridId = options.gridId || 'product-grid';
  const grid = document.getElementById(gridId);
  if (!grid) return;

  const safeProducts = Array.isArray(products) ? products : [];

  const empty =
    grid.closest('.section-container')?.querySelector('.empty-state') ||
    document.getElementById('empty-state');
  const count = document.getElementById('result-count');
  const sectionTitle = document.getElementById('section-title');

  const {
    onOpen = () => {},
    onToggleFavorite = () => {},
    onAddToCart = () => {},
    favorites = [],
  } = options;

  const hasResults = safeProducts.length > 0;
  grid.hidden = !hasResults;
  if (empty) empty.hidden = hasResults;

  if (count && gridId === 'product-grid') {
    count.textContent = `(${safeProducts.length})`;
  }

  grid.innerHTML = safeProducts
    .map((product) => createProductCardHtml(product, favorites.includes(product.id)))
    .join('');

  grid.querySelectorAll('.product-card').forEach((card) => {
    const product = safeProducts.find((p) => p.id === Number(card.dataset.id));
    if (!product) return;

    card.addEventListener('click', (event) => {
      if (event.target.closest('.favorite-btn, .add-cart-btn')) return;
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
      const product = safeProducts.find((p) => p.id === Number(btn.dataset.id));
      if (product) onToggleFavorite(product);
    });
  });

  grid.querySelectorAll('.add-cart-btn').forEach((btn) => {
    btn.addEventListener('click', (event) => {
      event.stopPropagation();
      const product = safeProducts.find((p) => p.id === Number(btn.dataset.id));
      if (product) onAddToCart(product, event);
    });
  });

  if (sectionTitle && gridId === 'product-grid') {
    sectionTitle.textContent = t('products');
  }
}

/**
 * 构建单个商品卡片 HTML。
 */
function createProductCardHtml(product, isFavorite) {
  const inStock = product.stock > 0;
  const tags = [];

  if (product.isNew) tags.push(`<span class="card-tag new">${t('new')}</span>`);
  if (product.isHot) tags.push(`<span class="card-tag hot">${t('hot')}</span>`);
  if (product.isPromotion) tags.push(`<span class="card-tag promotion">${t('promotions')}</span>`);

  const stockKey = inStock ? 'inStock' : 'outOfStock';
  const actionKey = inStock ? 'viewDetails' : 'outOfStock';

  return `
    <article class="product-card" data-id="${product.id}" tabindex="0" role="button" aria-label="${t('viewDetails')} ${product.name}">
      <div class="card-image-wrap">
        <img src="${resolveImagePath(product.image)}" alt="${product.name}" loading="lazy" />
        <div class="card-tags">${tags.join('')}</div>
        <span class="card-badge ${inStock ? 'in-stock' : 'out-stock'}">${t(stockKey)}</span>
        <button type="button" class="favorite-btn ${isFavorite ? 'active' : ''}" data-id="${product.id}" aria-label="${t('favorite')}">
          ${isFavorite ? '❤️' : '🤍'}
        </button>
      </div>
      <div class="card-body">
        <div class="card-meta">
          <span class="card-category">${product.category || ''}</span>
          <span class="card-brand">${product.brand || ''}</span>
        </div>
        <h3 class="card-name">${product.name}</h3>
        <p class="card-specs">${product.specs || ''}</p>
        <div class="card-price-row">
          <span class="card-price">${product.price}<span> ₸</span></span>
          ${product.originalPrice > product.price ? `<span class="card-original-price">${product.originalPrice} ₸</span>` : ''}
        </div>
        <div class="card-actions">
          <button type="button" class="card-btn ${inStock ? '' : 'out-stock'}">${t(actionKey)}</button>
          <button type="button" class="add-cart-btn" data-id="${product.id}" ${inStock ? '' : 'disabled'} aria-label="${t('addToCart')}">
            🛒
          </button>
        </div>
      </div>
    </article>
  `;
}

/**
 * 渲染商品列表（用于购物车、收藏、订单等页面）。
 */
export function renderList(items, containerId, renderItem) {
  const container = document.getElementById(containerId);
  if (!container) return;

  const safeItems = Array.isArray(items) ? items : [];

  if (!safeItems.length) {
    container.innerHTML = `<p class="empty-state">---</p>`;
    const emptyEl = container.querySelector('.empty-state');
    if (emptyEl) {
      if (containerId === 'cart-container') emptyEl.textContent = t('emptyCart');
      else if (containerId === 'favorites-container') emptyEl.textContent = t('emptyFavorites');
      else emptyEl.textContent = t('emptyOrders');
    }
    return;
  }

  container.innerHTML = safeItems.map(renderItem).join('');
}

/**
 * 渲染页脚。
 */
export function renderFooter(shop) {
  if (!shop) return;

  const footerName = document.getElementById('footer-name');
  const copyrightName = document.getElementById('footer-copyright-name');
  // 新增：电话 / 地址 / 营业时间三个页脚元素（对应 index.html 里真实的 id）
  const footerPhone = document.getElementById('shop-phone-footer');
  const footerAddress = document.getElementById('shop-address-footer');
  const footerHours = document.getElementById('shop-hours-footer');

  const shopName = localized(shop.name);

  if (footerName) footerName.textContent = shopName;
  if (copyrightName) copyrightName.textContent = shopName;

  if (footerPhone) footerPhone.textContent = `☎ ${shop.phone || ''}`;
  if (footerAddress) footerAddress.textContent = `📍 ${localized(shop.address)}`;
  if (footerHours) footerHours.textContent = `🕒 ${shop.hours || ''}`;
}
