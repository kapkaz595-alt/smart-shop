// ==========================================================================
// main.js
// SmartShop 前端入口。负责页面初始化、事件绑定、数据流转与 UI 更新。
// 严格遵循模块化原则：每个功能由独立模块处理，main.js 只做串联。
// ==========================================================================

import { fetchHomeData } from './api.js';
import { initPersistedState, getState, setState, subscribe } from './state.js';
import { initTheme } from './theme.js';
import { initLanguage, setLanguage } from './language.js';
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
const themeSelect = document.getElementById('theme-select');
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
    initLanguage();

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
 * 渲染首页所有区块：全部商品、优惠专区、新品、热门、猜你喜欢。
 */
function renderAllSections() {
  const { products, favorites, history } = getState();

  renderFilteredProducts();
  renderSection('promotions-grid', getPromotionProducts(products, 8));
  renderSection('new-grid', getNewProducts(products, 8));
  renderSection('hot-grid', getHotProducts(products, 8));
  renderSection('recommend-grid', getRecommendedProducts(products, history, favorites, 8));
}

/**
 * 根据搜索词和分类渲染“全部商品”区域。
 */
function renderFilteredProducts() {
  const { products, searchTerm, activeCategory, favorites } = getState();
  const byCategory = filterProducts(products, activeCategory);
  const visible = searchProducts(byCategory, searchTerm);

  renderProducts(visible, {
    onOpen: handleOpenProduct,
    onToggleFavorite: handleToggleFavorite,
    onAddToCart: handleAddToCart,
    favorites,
  });
}

/**
 * 通用区块渲染：把商品列表渲染到指定容器。
 */
function renderSection(gridId, products) {
  const grid = document.getElementById(gridId);
  if (!grid) return;

  const container = grid.closest('.section-container') || grid;
  const empty = container.querySelector('.empty-state');

  if (!products.length) {
    grid.innerHTML = '';
    if (empty) empty.hidden = false;
    return;
  }
  if (empty) empty.hidden = true;

  renderProducts(products, {
    onOpen: handleOpenProduct,
    onToggleFavorite: handleToggleFavorite,
    onAddToCart: handleAddToCart,
    favorites: getState().favorites,
    gridId,
  });
}

/**
 * 处理分类切换。
 */
function handleCategorySelect(category) {
  setState({ activeCategory: category });
  renderCategories(getState().categories, category, handleCategorySelect);
  renderFilteredProducts();
}

/**
 * 处理搜索输入。
 */
function handleSearchInput(event) {
  const term = event.target.value;
  setState({ searchTerm: term });
  renderFilteredProducts();
  renderSearchHistory(loadSearchHistory(), (selected) => {
    searchInput.value = selected;
    setState({ searchTerm: selected });
    renderFilteredProducts();
    searchHistoryBox.classList.remove('active');
  });
}

/**
 * 保存当前搜索关键词到历史。
 */
function commitSearchHistory() {
  const term = searchInput.value.trim();
  if (!term) return;
  const next = recordSearch(term);
  setState({ searchHistory: next });
  renderSearchHistory(next, (selected) => {
    searchInput.value = selected;
    setState({ searchTerm: selected });
    renderFilteredProducts();
    searchHistoryBox.classList.remove('active');
  });
}

/**
 * 处理搜索框失焦：保存搜索历史。
 */
function handleSearchBlur() {
  commitSearchHistory();
}

/**
 * 打开商品详情弹窗。
 */
function handleOpenProduct(product) {
  recordView(product);
  openProduct(product, { onView: () => {} });
}

/**
 * 切换收藏。
 */
function handleToggleFavorite(product) {
  toggleFavorite(product.id);
  renderFilteredProducts();
  renderAllSections();
}

/**
 * 加入购物车。
 */
function handleAddToCart(product, event) {
  if (event) event.stopPropagation();
  addToCart(product, 1);
  renderCartSummary(loadCart());
}

/**
 * 绑定全局事件。
 */
function bindEvents() {
  if (searchInput) {
    searchInput.addEventListener('input', handleSearchInput);
    
    // 监听回车键，并执行立即搜索和过滤
    searchInput.addEventListener('keydown', (event) => {
      if (event.key === 'Enter') {
        event.preventDefault(); // 阻止浏览器默认刷新行为
        const term = searchInput.value.trim();
        setState({ searchTerm: term }); // 同步搜索词
        renderFilteredProducts();       // 立即重新渲染商品列表
        commitSearchHistory();          // 写入历史记录
        searchHistoryBox.classList.remove('active');
        searchInput.blur();             // 手机端收起键盘
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
    searchInput.addEventListener('blur', () => {
      setTimeout(() => searchHistoryBox.classList.remove('active'), 200);
      handleSearchBlur();
    });
  }

  if (themeSelect) {
    themeSelect.addEventListener('change', (e) => {
      import('./theme.js').then((m) => m.setTheme(e.target.value));
    });
  }

  if (langSelect) {
    langSelect.addEventListener('change', (e) => setLanguage(e.target.value));
  }

  // 🛠️【已修复跳转】统一转换为基于当前宿主环境的动态 URL 绝对路径计算，彻底消除 404
  if (cartBtn) cartBtn.addEventListener('click', () => window.location.href = new URL('cart.html', window.location.href).href);
  if (favBtn) favBtn.addEventListener('click', () => window.location.href = new URL('favorites.html', window.location.href).href);
  if (ordersBtn) ordersBtn.addEventListener('click', () => window.location.href = new URL('orders.html', window.location.href).href);
  if (adminBtn) adminBtn.addEventListener('click', () => window.location.href = new URL('admin/login.html', window.location.href).href);

  // 购物车页面事件
  if (clearCartBtn) clearCartBtn.addEventListener('click', () => {
    import('./cart.js').then((m) => m.clearCart());
    renderCartSummary([]);
  });

  // 订单提交事件
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

  // 弹窗内按钮：收藏与加入购物车
  const modalFavorite = document.getElementById('modal-favorite');
  const modalAddCart = document.getElementById('modal-add-cart');
  if (modalFavorite) {
    modalFavorite.addEventListener('click', async () => {
      const { getCurrentProduct } = await import('./modal.js');
      const product = getCurrentProduct();
      if (product) {
        toggleFavorite(product.id);
        modalFavorite.classList.toggle('active', getState().favorites.includes(product.id));
        modalFavorite.innerHTML = `${getState().favorites.includes(product.id) ? '❤️' : '🤍'} ${getState().favorites.includes(product.id) ? '已收藏' : '收藏'}`;
        renderFilteredProducts();
        renderAllSections();
      }
    });
  }
  if (modalAddCart) {
    modalAddCart.addEventListener('click', async () => {
      const { getCurrentProduct } = await import('./modal.js');
      const product = getCurrentProduct();
      if (product) {
        addToCart(product);
        renderCartSummary(loadCart());
      }
    });
  }

  // 状态订阅：当购物车/收藏变化时刷新相关 UI
  subscribe((state) => {
    renderCartSummary(state.cart);
  });

  // 注册 Service Worker（PWA）
  if ('serviceWorker' in navigator) {
    const swUrl = `${import.meta.env.BASE_URL}sw.js`;
    navigator.serviceWorker.register(swUrl).catch((error) => {
      console.warn('Service Worker 注册失败：', error);
    });
  }
}

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', init);

// 导出供其他页面复用的函数
export {
  handleOpenProduct,
  handleToggleFavorite,
  handleAddToCart,
  renderFilteredProducts,
  handleCategorySelect,
};
