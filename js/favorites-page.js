// ==========================================================================
// favorites-page.js
// 收藏页面入口：加载收藏商品、渲染、支持取消收藏和加入购物车。
// ==========================================================================

import { initTheme } from './theme.js';
import { initPersistedState, getState } from './state.js';
import { fetchProducts } from './api.js';
import { renderShopHeader } from './render.js';
import { loadFavorites, toggleFavorite } from './favorite.js';
import { addToCart, loadCart, renderCartSummary } from './cart.js';
import { openProduct } from './modal.js';
import { renderProducts } from './render.js';

async function init() {
  initTheme();
  initPersistedState();

  const [products, shop] = await Promise.all([
    fetchProducts(),
    fetch('/data/shop.json').then((r) => r.json()).catch(() => null),
  ]);

  renderShopHeader(shop);
  renderCartSummary(loadCart());

  const favorites = loadFavorites();
  const favoriteProducts = products.filter((p) => favorites.includes(p.id));

  const grid = document.getElementById('favorites-grid');
  const empty = document.getElementById('empty-state');
  if (!favoriteProducts.length) {
    grid.innerHTML = '';
    empty.hidden = false;
  } else {
    empty.hidden = true;
    renderProducts(favoriteProducts, {
      onOpen: (product) => openProduct(product),
      onToggleFavorite: (product) => {
        toggleFavorite(product.id);
        init();
      },
      onAddToCart: (product) => {
        addToCart(product);
        renderCartSummary(loadCart());
      },
      favorites: loadFavorites(),
      gridId: 'favorites-grid',
    });
  }

  document.getElementById('cart-btn')?.addEventListener('click', () => window.location.href = 'cart.html');
  document.getElementById('orders-btn')?.addEventListener('click', () => window.location.href = 'orders.html');
}

document.addEventListener('DOMContentLoaded', init);

