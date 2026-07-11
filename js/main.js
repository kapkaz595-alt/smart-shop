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
  openProdu
