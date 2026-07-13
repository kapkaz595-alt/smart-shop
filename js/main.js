// ==========================================================================
// main.js - SmartShop 前端入口 (修复语言切换版)
// ==========================================================================

import { fetchHomeData } from './api.js';
import { initPersistedState, getState, setState, subscribe } from './state.js';
import { initTheme } from './theme.js';
import { initLanguage, setLanguage, getLanguage } from './language.js';
import {
  renderShopHeader,
  renderBanners,
  renderAnnouncements,
  renderCategories,
  renderProducts,
  renderFooter,
  ALL_CATEGORIES_LABEL,
} from './render.js';
import { searchProducts, saveSearchHistory } from './search.js';
import { filterProducts, filterPromotions, filterNewProducts, filterHotProducts } from './filter.js';
import { recordSearch, loadSearchHistory, renderSearchHistory, recordView } from './history.js';
import { openProduct, closeProduct } from './modal.js';
import { addToCart, loadCart, renderCartSummary, updateCartQuantity, removeFromCart } from './cart.js';
import { toggleFavorite, loadFavorites } from './favorite.js';
import { getHotProducts, getRecommendedProducts, getNewProducts, getPromotionProducts } from './recommend.js';
import { showToast } from './utils.js';

// DOM 元素引用
const searchInput = document.getElementById('search-input');
const searchHistoryBox = document.getElementById('search-history');
const cartBtn = document.getElementById('cart-btn');
const favBtn = document.getElementById('favorites-btn');
const ordersBtn = document.getElementById('orders-btn');
const adminBtn = document.getElementById('admin-btn');
const langSelect = document.getElementById('lang-select');
const clearCartBtn = document.getElementById('clear-cart-btn');
const submitOrderBtn = document.getElementById('submit-order-btn');
const orderForm = document.getElementById('order-form');

/**
 * 页面初始化：加载数据、初始化状态、渲染首屏。
 */
async function init() {
  try {
    initTheme();
    initPersistedState();
    
    // 初始化语言
    initLanguage();
    // 如果存在下拉框，将下拉框的值设置为当前语言
    if (langSelect) {
      langSelect.value = getLanguage();
    }

    const { products, categories, shop, banners, announcements } = await fetchHomeData();

    setState({
      products,
      categories,
      shop,
      banners,
      announcements,
      activeCategory: ALL_CATEGORIES_LABEL,
    });

    renderShopHeader(shop);
    renderFooter(shop);
    renderBanners(banners);
    renderAnnouncements(announcements);
    renderCategories(categories, ALL_CATEGORIES_LABEL, handleCategorySelect);

    renderAllSections();
    bindEvents();
    renderCartSummary(loadCart());
  } catch (error) {
    console.error('SmartShop 初始化失败：', error);
    const grid = document.getElementById('product-grid');
    if (grid) grid.innerHTML = `<p class="empty-state" style="color:var(--color-danger);">数据加载失败，请刷新页面重试。</p>`;
  }
}

/**
 * 绑定全局事件。
 */
function bindEvents() {
  // 搜索逻辑
  if (searchInput) {
    searchInput.addEventListener('input', handleSearchInput);
    searchInput.addEventListener('keydown', (event) => {
      if (event.key === 'Enter') {
        event.preventDefault();
        const term = searchInput.value.trim();
        setState({ searchTerm: term });
        renderFilteredProducts();
        commitSearchHistory();
        searchHistoryBox.classList.remove('active');
        searchInput.blur();
        const targetGrid = document.getElementById('product-grid');
        if (targetGrid) targetGrid.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
    searchInput.addEventListener('focus', () => {
      renderSearchHistory(loadSearchHistory(), (selected) => {
        searchInput.value = selected;
        setState({ searchTerm: selected });
        renderFilteredProducts();
        searchHistoryBox.classList.remove('active');
      });
      searchHistoryBox.classList.add('active');
    });
  }

  // 多语言切换逻辑
  if (langSelect) {
    langSelect.addEventListener('change', (e) => {
      setLanguage(e.target.value);
      location.reload(); // 切换后强制刷新，确保所有 i18n 标签重新渲染
    });
  }

  // 导航按钮跳转
  if (cartBtn) cartBtn.addEventListener('click', () => window.location.href = 'cart.html');
  if (favBtn) favBtn.addEventListener('click', () => window.location.href = 'favorites.html');
  if (ordersBtn) ordersBtn.addEventListener('click', () => window.location.href = 'orders.html');
  if (adminBtn) adminBtn.addEventListener('click', () => window.location.href = 'admin/login.html');

  // 购物车与订单处理
  if (clearCartBtn) clearCartBtn.addEventListener('click', () => {
    import('./cart.js').then((m) => m.clearCart());
    renderCartSummary([]);
  });

  if (submitOrderBtn && orderForm) {
    submitOrderBtn.addEventListener('click', () => {
      const formData = new FormData(orderForm);
      const orderData = {
        customerName: formData.get('customerName'),
        phone: formData.get('phone'),
        note: formData.get('note'),
        deliveryType: formData.get('deliveryType'),
      };
      import('./orders.js').then((m) => {
        const cart = loadCart();
        const order = m.createOrder(orderData, cart);
        if (order) {
          import('./cart.js').then((c) => c.clearCart());
          renderCartSummary([]);
          m.sendOrderToWhatsApp(order);
          const qrSection = document.getElementById('kaspi-qr-section');
          if (qrSection) qrSection.hidden = false;
        }
      });
    });
  }

  // 状态订阅
  subscribe((state) => {
    renderCartSummary(state.cart);
  });
}

// 辅助渲染函数保持不变
function renderAllSections() {
  const { products, favorites, history } = getState();
  renderFilteredProducts();
  renderSection('promotions-grid', getPromotionProducts(products, 8));
  renderSection('new-grid', getNewProducts(products, 8));
  renderSection('hot-grid', getHotProducts(products, 8));
  renderSection('recommend-grid', getRecommendedProducts(products, history, favorites, 8));
}

function renderFilteredProducts() {
  const { products, searchTerm, activeCategory, favorites } = getState();
  const byCategory = filterProducts(products, activeCategory);
  const visible = searchProducts(byCategory, searchTerm);
  renderProducts(visible, { onOpen: handleOpenProduct, onToggleFavorite: handleToggleFavorite, onAddToCart: handleAddToCart, favorites });
}

function renderSection(gridId, products) {
  const grid = document.getElementById(gridId);
  if (!grid) return;
  const container = grid.closest('.section-container') || grid;
  const empty = container.querySelector('.empty-state');
  if (!products.length) { grid.innerHTML = ''; if (empty) empty.hidden = false; return; }
  if (empty) empty.hidden = true;
  renderProducts(products, { onOpen: handleOpenProduct, onToggleFavorite: handleToggleFavorite, onAddToCart: handleAddToCart, favorites: getState().favorites, gridId });
}

function handleCategorySelect(category) {
  setState({ activeCategory: category });
  renderCategories(getState().categories, category, handleCategorySelect);
  renderFilteredProducts();
  const targetGrid = document.getElementById('product-grid');
  if (targetGrid) targetGrid.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function handleSearchInput(event) {
  setState({ searchTerm: event.target.value });
  renderFilteredProducts();
}

function commitSearchHistory() {
  const term = searchInput.value.trim();
  if (!term) return;
  setState({ searchHistory: recordSearch(term) });
}

function handleOpenProduct(product) { recordView(product); openProduct(product, { onView: () => {} }); }
function handleToggleFavorite(product) { toggleFavorite(product.id); renderFilteredProducts(); renderAllSections(); }
function handleAddToCart(product, event) { if (event) event.stopPropagation(); addToCart(product, 1); renderCartSummary(loadCart()); }

document.addEventListener('DOMContentLoaded', init);

export { handleOpenProduct, handleToggleFavorite, handleAddToCart, renderFilteredProducts, handleCategorySelect };
