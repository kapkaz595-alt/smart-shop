// ==========================================================================
// favorite.js
// 收藏功能：添加/取消收藏，持久化到 localStorage，渲染收藏列表。
// ==========================================================================

import { KEYS, getJson, setJson } from './storage.js';
import { setState } from './state.js';
import { showToast } from './utils.js';
import { renderProducts } from './render.js';

/**
 * 切换商品收藏状态。
 * @param {number} productId
 */
export function toggleFavorite(productId) {
  const favorites = getJson(KEYS.FAVORITES, []);
  const index = favorites.indexOf(productId);

  if (index >= 0) {
    favorites.splice(index, 1);
    showToast('已取消收藏');
  } else {
    favorites.push(productId);
    showToast('已收藏');
  }

  setJson(KEYS.FAVORITES, favorites);
  setState({ favorites });
}

/**
 * 加载收藏列表。
 */
export function loadFavorites() {
  return getJson(KEYS.FAVORITES, []);
}

/**
 * 渲染收藏列表（使用商品卡片渲染逻辑）。
 * @param {Array<Object>} products 全部商品
 * @param {Array<number>} favorites 收藏 ID 列表
 * @param {Object} callbacks
 */
export function renderFavorites(products, favorites, callbacks) {
  const container = document.getElementById('favorites-grid');
  if (!container) return;

  const favoriteProducts = products.filter((p) => favorites.includes(p.id));

  if (!favoriteProducts.length) {
    container.innerHTML = `<p class="empty-state">还没有收藏任何商品。</p>`;
    return;
  }

  // 复用 renderProducts 逻辑，但只渲染到 favorites-grid
  renderProducts(favoriteProducts, {
    onOpen: callbacks.onOpen,
    onToggleFavorite: callbacks.onToggleFavorite,
    onAddToCart: callbacks.onAddToCart,
    favorites,
  });
}

