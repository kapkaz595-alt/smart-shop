// ==========================================================================
// orders-page.js
// 订单页面入口：加载并渲染历史订单，同步页头购物车数量。
// ==========================================================================

import { initTheme } from './theme.js';
import { initPersistedState } from './state.js';
import { loadCart, renderCartSummary } from './cart.js';
import { loadOrders, renderOrders } from './orders.js';

async function init() {
  initTheme();
  initPersistedState();
  renderCartSummary(loadCart());
  renderOrders(loadOrders());

  document.getElementById('cart-btn')?.addEventListener('click', () => window.location.href = 'cart.html');
  document.getElementById('favorites-btn')?.addEventListener('click', () => window.location.href = 'favorites.html');
}

document.addEventListener('DOMContentLoaded', init);

