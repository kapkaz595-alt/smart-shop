// ==========================================================================
// main.js - SmartShop 前端入口 (已优化分类点击 + 搜索防抖)
// ==========================================================================

import { fetchHomeData } from './api.js';
import { initPersistedState, getState, setState, subscribe } from './state.js';
import { initTheme } from './theme.js';
import { initLanguage, setLanguage, getLanguage, t } from './language.js';
import {
  renderShopHeader,
  renderBanners,
  renderAnnouncements,
  renderCategories,
  renderProducts,
  renderFooter,
  ALL_CATEGORIES_LABEL,
} from './render.js';
import { searchProducts } from './search.js';
import { recordSearch, loadSearchHistory, renderSearchHistory, recordView } from './history.js';
import { filterProducts, filterPromotions, filterNewProducts, filterHotProducts } from './filter.js';
import { openProduct } from './modal.js';
import { addToCart, loadCart, renderCartSummary } from './cart.js';
import { toggleFavorite, loadFavorites } from './favorite.js';
import { getHotProducts, getRecommendedProducts, getNewProducts, getPromotionProducts } from './recommend.js';

// 防抖函数
function debounce(fn, delay = 300) {
  let timer;
  return function(...args) {
    clearTimeout(timer);
    timer = setTimeout(() => fn.apply(this, args), delay);
  };
}

const searchInput = document.getElementById('search-input');
const cartBtn = document.getElementById('cart-btn');
const favBtn = document.getElementById('favorites-btn');
const ordersBtn = document.getElementById('orders-btn');
const adminBtn = document.getElementById('admin-btn');
const langSelect = document.getElementById('lang-select');

async function init() {
  try {
    initTheme();
    initPersistedState();
    
    initLanguage();
    if (langSelect) langSelect.value = getLanguage();

    const { products, categories, shop, banners, announcements } = await fetchHomeData();
    
    setState({ 
      products, 
      categories, 
      shop, 
      banners, 
      announcements, 
      activeCategory: ALL_CATEGORIES_LABEL,
      searchTerm: ''
    });

    renderShopHeader(shop);
    renderFooter(shop);
    renderBanners(banners);
    renderAnnouncements(announcements);
    
    // 初始渲染分类
    renderCategories(categories, ALL_CATEGORIES_LABEL, handleCategorySelect);
    
    renderAllSections();
    bindEvents();
    renderCartSummary(loadCart());
    
  } catch (error) {
    console.error('初始化失败：', error);
  }
}

function bindEvents() {
  // 搜索逻辑 - 使用防抖优化
  if (searchInput) {
    searchInput.addEventListener('input', debounce((e) => {
      setState({ searchTerm: e.target.value });
      renderFilteredProducts();
    }, 250));
  }

  // 语言切换
  if (langSelect) {
    langSelect.addEventListener('change', (e) => {
      const selectedLang = e.target.value;
      setLanguage(selectedLang);
      
      renderAllSections();
      
      document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        const translation = t(key);
        if (translation) {
          if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
            el.placeholder = translation;
          } else {
            el.textContent = translation;
          }
        }
      });
      
      renderShopHeader(getState().shop);
      renderCategories(getState().categories, getState().activeCategory, handleCategorySelect);
    });
  }

  // 导航跳转
  if (cartBtn) cartBtn.addEventListener('click', () => window.location.href = 'cart.html');
  if (favBtn) favBtn.addEventListener('click', () => window.location.href = 'favorites.html');
  if (ordersBtn) ordersBtn.addEventListener('click', () => window.location.href = 'orders.html');
  if (adminBtn) adminBtn.addEventListener('click', () => window.location.href = 'admin/login.html');

  subscribe((state) => renderCartSummary(state.cart));
}

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
  renderProducts(searchProducts(byCategory, searchTerm), { 
    onOpen: handleOpenProduct, 
    onToggleFavorite: handleToggleFavorite, 
    onAddToCart: handleAddToCart, 
    favorites 
  });
}

function renderSection(gridId, products) {
  const grid = document.getElementById(gridId);
  if (!grid) return;
  renderProducts(products, { 
    onOpen: handleOpenProduct, 
    onToggleFavorite: handleToggleFavorite, 
    onAddToCart: handleAdd
