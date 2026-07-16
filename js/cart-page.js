// ==========================================================================
// cart-page.js
// 购物车页面入口：加载购物车、渲染列表、处理数量修改/删除/清空/提交订单。
// ==========================================================================

import { initTheme } from './theme.js';
import { initPersistedState, getState } from './state.js';
import { initLanguage, applyTranslations } from './language.js';
import { renderShopHeader, renderFooter } from './render.js';
import { fetchHomeData } from './api.js';
import { loadCart, renderCartList, renderCartSummary, updateCartQuantity, removeFromCart, clearCart } from './cart.js';
import { createOrder, renderOrders, loadOrders } from './orders.js';
import { showToast } from './utils.js';

async function init() {
  initTheme();
  initPersistedState();

  // 新增：跟首页一样接入多语言 + 店铺数据，让购物车页的店铺名/地址也随语言切换
  initLanguage();
  try {
    const homeData = await fetchHomeData();
    const shop = (homeData && homeData.shop) || {};
    renderShopHeader(shop);
    renderFooter(shop);
  } catch (err) {
    console.error('[SmartShop] cart 页面加载店铺信息失败：', err);
  }
  applyTranslations();

  const cart = loadCart();
  renderCartList(cart, {
    onIncrease: (id) => {
      updateCartQuantity(id, 1);
      refreshCart();
    },
    onDecrease: (id) => {
      updateCartQuantity(id, -1);
      refreshCart();
    },
    onRemove: (id) => {
      removeFromCart(id);
      refreshCart();
    },
  });
  renderCartSummary(cart);

  document.getElementById('clear-cart-btn')?.addEventListener('click', () => {
    clearCart();
    refreshCart();
  });

  document.getElementById('submit-order-btn')?.addEventListener('click', () => {
    const form = document.getElementById('order-form');
    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }
    const formData = new FormData(form);
    const currentCart = loadCart();
    if (!currentCart.length) {
      showToast('购物车为空');
      return;
    }
    const order = createOrder({
      customerName: formData.get('customerName'),
      phone: formData.get('phone'),
      note: formData.get('note'),
      deliveryType: formData.get('deliveryType'),
    }, currentCart);
    if (order) {
      clearCart();
      refreshCart();
      form.reset();
    }
  });

  // 页头跳转
  document.getElementById('cart-btn')?.addEventListener('click', () => window.location.reload());
  document.getElementById('favorites-btn')?.addEventListener('click', () => window.location.href = 'favorites.html');
  document.getElementById('orders-btn')?.addEventListener('click', () => window.location.href = 'orders.html');
}

function refreshCart() {
  const cart = loadCart();
  renderCartList(cart, {
    onIncrease: (id) => { updateCartQuantity(id, 1); refreshCart(); },
    onDecrease: (id) => { updateCartQuantity(id, -1); refreshCart(); },
    onRemove: (id) => { removeFromCart(id); refreshCart(); },
  });
  renderCartSummary(cart);
}

document.addEventListener('DOMContentLoaded', init);
