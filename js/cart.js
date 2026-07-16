// ==========================================================================
// cart.js
// 购物车逻辑：添加、修改数量、删除、清空、计算总价、持久化到 localStorage。
// ==========================================================================

import { KEYS, getJson, setJson } from './storage.js';
import { setState } from './state.js';
import { showToast, formatPrice } from './utils.js';
import { renderProducts } from './render.js';
import { t } from './language.js';

/**
 * 从 localStorage 加载购物车到 state。
 */
export function loadCart() {
  return getJson(KEYS.CART, []);
}

/**
 * 添加商品到购物车。
 * @param {Object} product
 * @param {number} quantity
 */
export function addToCart(product, quantity = 1) {
  if (product.stock <= 0) {
    showToast('该商品暂时缺货');
    return;
  }

  const cart = getJson(KEYS.CART, []);
  const existing = cart.find((item) => item.id === product.id);

  if (existing) {
    existing.quantity = Math.min(existing.quantity + quantity, product.stock);
  } else {
    cart.push({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
      specs: product.specs,
      quantity: Math.min(quantity, product.stock),
    });
  }

  setJson(KEYS.CART, cart);
  setState({ cart });
  showToast('已加入购物车');
}

/**
 * 修改购物车商品数量。
 * @param {number} productId
 * @param {number} delta
 */
export function updateCartQuantity(productId, delta) {
  const cart = getJson(KEYS.CART, []);
  const item = cart.find((i) => i.id === productId);
  if (!item) return;

  item.quantity += delta;
  if (item.quantity <= 0) {
    removeFromCart(productId);
    return;
  }

  setJson(KEYS.CART, cart);
  setState({ cart });
}

/**
 * 从购物车删除商品。
 * @param {number} productId
 */
export function removeFromCart(productId) {
  const cart = getJson(KEYS.CART, []).filter((item) => item.id !== productId);
  setJson(KEYS.CART, cart);
  setState({ cart });
}

/**
 * 清空购物车。
 */
export function clearCart() {
  setJson(KEYS.CART, []);
  setState({ cart: [] });
  showToast('购物车已清空');
}

/**
 * 计算购物车总价。
 * @param {Array<Object>} cart
 */
export function calculateTotal(cart) {
  return cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
}

/**
 * 计算购物车商品总数。
 * @param {Array<Object>} cart
 */
export function calculateCount(cart) {
  return cart.reduce((sum, item) => sum + item.quantity, 0);
}

/**
 * 渲染购物车列表。
 * @param {Array<Object>} cart
 * @param {Object} callbacks
 */
export function renderCartList(cart, callbacks = {}) {
  const container = document.getElementById('cart-list');
  if (!container) return;

  if (!cart.length) {
    // 直接用 t() 取当前语言文案，不依赖后续的 applyTranslations 扫描时机
    container.innerHTML = `<p class="empty-state" data-i18n="emptyCart">${t('emptyCart')}</p>`;
    return;
  }

  // 统一用 ₸ 符号，跟商品卡片（render.js）保持一致，不再用中文"坚戈"
  const currencySymbol = '₸';

  container.innerHTML = cart
    .map(
      (item) => `
      <div class="list-card" data-id="${item.id}">
        <img class="list-card-image" src="${import.meta.env.BASE_URL}${item.image}" alt="${item.name}" />
        <div class="list-card-body">
          <h4 class="list-card-title">${item.name}</h4>
          <p class="list-card-meta">${item.specs}</p>
          <p class="list-card-price">${item.price} ${currencySymbol}</p>
        </div>
        <div class="list-card-actions">
          <div class="quantity-control">
            <button type="button" data-action="decrease" data-id="${item.id}">−</button>
            <input type="text" value="${item.quantity}" readonly />
            <button type="button" data-action="increase" data-id="${item.id}">+</button>
          </div>
          <button type="button" class="remove-btn" data-action="remove" data-id="${item.id}" aria-label="${t('remove')}">🗑️</button>
        </div>
      </div>
    `,
    )
    .join('');

  container.querySelectorAll('[data-action]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const id = Number(btn.dataset.id);
      const action = btn.dataset.action;
      if (action === 'increase') callbacks.onIncrease(id);
      if (action === 'decrease') callbacks.onDecrease(id);
      if (action === 'remove') callbacks.onRemove(id);
    });
  });
}

/**
 * 渲染购物车汇总。
 * @param {Array<Object>} cart
 */
export function renderCartSummary(cart) {
  const totalEl = document.getElementById('cart-total');
  const countEl = document.getElementById('cart-count');
  const total = calculateTotal(cart);
  const count = calculateCount(cart);

  // 同样统一用 ₸ 符号，数量单位改用 t('itemsUnit') 按语言切换
  if (totalEl) totalEl.textContent = `${formatPrice(total)} ₸`;
  if (countEl) countEl.textContent = `${count} ${t('itemsUnit')}`;

  const badge = document.querySelector('#cart-btn .badge');
  if (badge) {
    badge.textContent = count > 99 ? '99+' : count;
    badge.hidden = count === 0;
  }
}

export { renderProducts };
