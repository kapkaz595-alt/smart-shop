// ==========================================================================
// render.js
// 负责把数据渲染成 DOM
// ==========================================================================

import { resolveImagePath } from './utils.js';
import { t } from './language.js';

const ALL_CATEGORIES_LABEL = '全部商品';

export function renderShopHeader(shop) {
  if (!shop) return;
  const logo = document.getElementById('shop-logo');
  const name = document.getElementById('shop-name');
  if (logo) logo.textContent = shop.logo || '☀️';
  if (name) name.textContent = shop.name || 'SmartShop';
  document.title = `${shop.name} | SmartShop`;
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
  
  // 智能翻译：如果字典里没找到翻译，直接使用原始 product.name
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
